import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const release = '26.x.3.7-playwright-self-healing-validation-2026-09-03'
const policyPath = process.env.PLAYWRIGHT_SELF_HEALING_POLICY || 'playwright-self-healing.policy.json'
const repairPath = process.env.PLAYWRIGHT_REPAIR_JSON || 'test-results/repair-advisor/REPAIR_ADVISOR.json'
const diagPath = process.env.PLAYWRIGHT_DIAGNOSTICS_JSON || 'test-results/diagnostics/DIAGNOSTICO_PLAYWRIGHT.json'
const outDir = process.env.PLAYWRIGHT_SELF_HEALING_DIR || 'test-results/self-healing'
const baseUrl = process.env.PLAYWRIGHT_BASE_URL || ''
const dryRun = process.argv.includes('--dry-run') || process.env.PLAYWRIGHT_SELF_HEALING_DRY_RUN === '1'
const skipFull = process.argv.includes('--targeted-only') || process.env.PLAYWRIGHT_SELF_HEALING_TARGETED_ONLY === '1'
const project = process.env.PLAYWRIGHT_PROJECT || 'chromium'
fs.mkdirSync(outDir, { recursive: true })

const readJson = file => { try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null } }
const policy = readJson(policyPath)
const repair = readJson(repairPath)
const diagnostics = readJson(diagPath)

if (!policy) {
  console.error(`[self-healing] BLOCKED: política ausente em ${policyPath}`)
  process.exit(2)
}

const moduleIds = new Set()
for (const p of repair?.plans || []) moduleIds.add(p.module || 'unclassified')
for (const f of diagnostics?.findings || []) moduleIds.add(f.module || 'unclassified')

// Sem diagnóstico anterior significa que não existe reparo a validar.
if (moduleIds.size === 0) {
  const payload = {
    release,
    generatedAt: new Date().toISOString(),
    baseUrl,
    status: 'NO_REPAIR_PENDING',
    modules: [],
    targetedTests: [],
    targetedExitCode: null,
    fullCertificationExitCode: null,
    note: 'Nenhuma falha/reparo pendente foi encontrado. Execute os testes e o diagnóstico antes de usar a validação pós-reparo.'
  }
  fs.writeFileSync(path.join(outDir, 'SELF_HEALING_VALIDATION.json'), JSON.stringify(payload, null, 2))
  fs.writeFileSync(path.join(outDir, 'SELF_HEALING_VALIDATION.md'), `# Playwright Self-Healing Validation\n\n**Status:** NO_REPAIR_PENDING\n\nNenhuma falha/reparo pendente foi encontrado.\n`)
  console.log('[self-healing] NO_REPAIR_PENDING')
  process.exit(0)
}

const targeted = []
for (const id of moduleIds) {
  const entry = policy.modules?.[id] || policy.modules?.unclassified
  for (const file of entry?.tests || []) if (!targeted.includes(file)) targeted.push(file)
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const run = (cmd, args, env = process.env) => {
  if (dryRun) {
    console.log(`[self-healing:dry-run] ${cmd} ${args.join(' ')}`)
    return { status: 0 }
  }
  return spawnSync(cmd, args, { stdio: 'inherit', env, shell: false })
}

const startedAt = Date.now()
const env = {
  ...process.env,
  PLAYWRIGHT_JSON_OUTPUT_NAME: 'test-results/self-healing-targeted.json',
  PLAYWRIGHT_JSON_REPORT: 'test-results/self-healing-targeted.json'
}

console.log(`[self-healing] Módulos afetados: ${[...moduleIds].join(', ')}`)
console.log(`[self-healing] Reteste focado: ${targeted.join(', ')}`)

const targetedResult = run(command, ['playwright', 'test', ...targeted, `--project=${project}`, '--reporter=list,json'], env)
const targetedExit = targetedResult.status ?? 1

let guardExit = null
let fullExit = null
let status = 'TARGETED_FAILED'

if (targetedExit === 0) {
  const guard = run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'verify:protected-modules'])
  guardExit = guard.status ?? 1
  if (guardExit === 0) {
    const lucide = run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'check:lucide'])
    guardExit = lucide.status ?? 1
  }

  if (guardExit === 0 && !skipFull) {
    console.log('[self-healing] Retestes focados aprovados. Iniciando certificação completa...')
    const full = run(process.execPath, ['scripts/run-playwright-release-certification.mjs'], process.env)
    fullExit = full.status ?? 1
    status = fullExit === 0 ? 'HEALED_AND_CERTIFIED' : 'TARGETED_PASS_FULL_CERTIFICATION_FAILED'
  } else if (guardExit === 0) {
    status = 'TARGETED_PASS'
  } else {
    status = 'TARGETED_PASS_GUARD_FAILED'
  }
}

const payload = {
  release,
  generatedAt: new Date().toISOString(),
  baseUrl,
  status,
  dryRun,
  modules: [...moduleIds],
  targetedTests: targeted,
  targetedExitCode: targetedExit,
  guardExitCode: guardExit,
  fullCertificationExitCode: fullExit,
  durationMs: Date.now() - startedAt,
  guardrails: [
    'Não altera código automaticamente.',
    'Não atualiza Golden Master automaticamente.',
    'Não pula testes e não reduz asserts.',
    'Só executa certificação completa depois de os retestes focados passarem.',
    'Estornos, Central de Eventos e isolamento multi-tenant permanecem bloqueantes.'
  ]
}
fs.writeFileSync(path.join(outDir, 'SELF_HEALING_VALIDATION.json'), JSON.stringify(payload, null, 2))

const md = `# SafeSaff — Playwright Self-Healing Validation\n\n**Release:** ${release}  \n**Status:** **${status}**  \n**URL:** ${baseUrl || 'local'}  \n**Módulos afetados:** ${[...moduleIds].join(', ')}\n\n## Retestes focados\n\n${targeted.map(x => `- \`${x}\``).join('\n')}\n\n## Resultado\n\n- Reteste focado: ${targetedExit === 0 ? 'PASS' : 'FAIL'}\n- Guardas estruturais: ${guardExit === null ? 'NÃO EXECUTADO' : guardExit === 0 ? 'PASS' : 'FAIL'}\n- Certificação completa: ${fullExit === null ? 'NÃO EXECUTADA' : fullExit === 0 ? 'PASS' : 'FAIL'}\n\n## Regra operacional\n\nEsta fase não se autoedita. “Self-Healing” significa validar a correção de forma inteligente: primeiro somente a área afetada e depois a certificação completa. Nenhum teste, módulo protegido ou baseline visual pode ser removido para obter PASS.\n`
fs.writeFileSync(path.join(outDir, 'SELF_HEALING_VALIDATION.md'), md)

const esc = s => String(s ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Self-Healing Validation</title><style>body{font-family:Inter,Arial,sans-serif;background:#f4f6f8;color:#15171a;margin:0;padding:28px}.wrap{max-width:1080px;margin:auto}.card{background:#fff;border:1px solid #e3e7ec;border-radius:16px;padding:22px;margin-bottom:14px}.status{font-size:32px;font-weight:900}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.metric{background:#fff;border:1px solid #e3e7ec;border-radius:14px;padding:16px}.metric b{display:block;font-size:24px}@media(max-width:760px){body{padding:12px}.grid{grid-template-columns:1fr}}</style></head><body><div class="wrap"><section class="card"><div>DiskIngressos PDT • QA Intelligence</div><h1>Playwright Self-Healing Validation</h1><div class="status">${esc(status)}</div><p>${esc(payload.generatedAt)} • ${esc(baseUrl || 'local')}</p></section><section class="grid"><div class="metric">Reteste focado<b>${targetedExit === 0 ? 'PASS' : 'FAIL'}</b></div><div class="metric">Guardas<b>${guardExit === null ? '-' : guardExit === 0 ? 'PASS' : 'FAIL'}</b></div><div class="metric">Certificação<b>${fullExit === null ? '-' : fullExit === 0 ? 'PASS' : 'FAIL'}</b></div></section><section class="card"><h2>Módulos afetados</h2><p>${esc([...moduleIds].join(', '))}</p><h2>Testes selecionados</h2><ul>${targeted.map(x=>`<li><code>${esc(x)}</code></li>`).join('')}</ul></section></div></body></html>`
fs.writeFileSync(path.join(outDir, 'SELF_HEALING_VALIDATION.html'), html)

console.log(`[self-healing] ${status}`)
process.exit(status === 'HEALED_AND_CERTIFIED' || status === 'TARGETED_PASS' ? 0 : 1)
