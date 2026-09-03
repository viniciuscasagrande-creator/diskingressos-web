import fs from 'node:fs'
import path from 'node:path'

const input = process.env.PLAYWRIGHT_JSON_REPORT || 'test-results/playwright-results.json'
const policyFile = process.env.PLAYWRIGHT_DIAGNOSTICS_POLICY || 'playwright-diagnostics.policy.json'
const outDir = process.env.PLAYWRIGHT_DIAGNOSTICS_DIR || 'test-results/diagnostics'
fs.mkdirSync(outDir, { recursive: true })

const readJson = file => { try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null } }
const data = readJson(input)
const policy = readJson(policyFile)
const generatedAt = new Date().toISOString()

if (!data || !policy) {
  const reason = !data ? `Resultados Playwright ausentes em ${input}` : `Política de diagnóstico ausente em ${policyFile}`
  fs.writeFileSync(path.join(outDir, 'DIAGNOSTICO_PLAYWRIGHT.md'), `# Auto-Diagnóstico Playwright\n\n**STATUS: BLOCKED**\n\n${reason}\n`)
  console.error(`[pw-diagnostico] BLOCKED: ${reason}`)
  process.exit(2)
}

const rows = []
function walk(suites = [], parents = []) {
  for (const suite of suites) {
    const current = [...parents, suite.title].filter(Boolean)
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const results = test.results || []
        const final = results.at(-1)
        const status = final?.status || test.status || 'unknown'
        const errors = [final?.error?.message, final?.error?.stack, ...(final?.errors || []).map(e => e?.message || e?.stack)].filter(Boolean).join('\n')
        rows.push({
          title: [...current, spec.title].filter(Boolean).join(' > '),
          file: spec.file || suite.file || '',
          line: spec.line || 0,
          status,
          error: errors,
          attachments: (final?.attachments || []).map(a => ({ name:a.name, path:a.path, contentType:a.contentType })),
          durationMs: results.reduce((s,r)=>s+(r.duration||0),0)
        })
      }
    }
    walk(suite.suites || [], current)
  }
}
walk(data.suites || [])

const failed = rows.filter(r => ['failed','timedOut','interrupted'].includes(r.status))
const normalize = s => String(s || '').toLowerCase()
const stackFiles = text => [...new Set((String(text).match(/(?:src|server|tests)\/[A-Za-z0-9_./-]+\.(?:tsx?|mjs|js|css)/g) || []))]
const errorKind = text => {
  const t = normalize(text)
  if (/tohavescreenshot|snapshot|pixel|screenshot/.test(t)) return 'VISUAL_REGRESSION'
  if (/strict mode violation|locator resolved to|not visible|waiting for locator|timed out.*locator/.test(t)) return 'UI_SELECTOR_OR_RENDER'
  if (/401|unauthorized|login|authentication/.test(t)) return 'AUTHENTICATION'
  if (/403|forbidden|tenant|producerid/.test(t)) return 'TENANT_OR_PERMISSION'
  if (/404|not found|cannot get|route/.test(t)) return 'ROUTE_OR_NOT_DEPLOYED'
  if (/500|502|503|504|5xx|internal server/.test(t)) return 'BACKEND_5XX'
  if (/pageerror|uncaught|referenceerror|typeerror|syntaxerror/.test(t)) return 'JAVASCRIPT_RUNTIME'
  if (/net::|econn|timeout|timedout|network/.test(t)) return 'NETWORK_OR_TIMEOUT'
  if (/expect\(/.test(t)) return 'ASSERTION_MISMATCH'
  return 'UNKNOWN'
}
const recommendedAction = kind => ({
  VISUAL_REGRESSION:'Comparar screenshot de falha com o Golden Master. Não atualizar baseline até aprovação visual.',
  UI_SELECTOR_OR_RENDER:'Verificar se o componente ainda é renderizado, se o texto/role mudou e se o menu/rota foi removido.',
  AUTHENTICATION:'Validar credenciais QA, endpoint de login, token e persistência da sessão.',
  TENANT_OR_PERMISSION:'Revisar producerId/eventId, tenant.ts e autorização do endpoint. Não liberar acesso cruzado.',
  ROUTE_OR_NOT_DEPLOYED:'Confirmar rota no App, componente importado e se o build publicado contém a fase.',
  BACKEND_5XX:'Abrir logs da API/Vercel e revisar endpoint, Prisma e variáveis de ambiente.',
  JAVASCRIPT_RUNTIME:'Corrigir primeiro erro JS/console; revisar stack e imports do componente indicado.',
  NETWORK_OR_TIMEOUT:'Verificar disponibilidade da API, CORS, URL base, cold start e timeout.',
  ASSERTION_MISMATCH:'Comparar contrato esperado pelo teste com o comportamento atual e determinar se é regressão ou mudança aprovada.',
  UNKNOWN:'Abrir trace, screenshot e stack do teste antes de alterar código.'
}[kind])

const findings = failed.map((r, index) => {
  const corpus = `${r.title}\n${r.file}\n${r.error}`
  const matches = policy.modules.filter(m => new RegExp(m.match,'i').test(corpus))
  const module = matches[0] || { id:'unclassified', owner:'A classificar', severity:'HIGH', routes:[], files:[] }
  const kind = errorKind(corpus)
  const evidenceFiles = stackFiles(corpus)
  const likelyFiles = [...new Set([...evidenceFiles, ...(module.files || [])])].slice(0,8)
  const attachments = r.attachments.filter(a => a.path)
  return {
    id: `PW-${String(index+1).padStart(3,'0')}`,
    severity: module.severity || 'HIGH',
    module: module.id,
    owner: module.owner,
    kind,
    test: r.title,
    testFile: r.file,
    status: r.status,
    routes: module.routes || [],
    likelyFiles,
    evidence: attachments,
    error: r.error.slice(0,4000),
    recommendedAction: recommendedAction(kind)
  }
})

const priority = { BLOCKER:0, CRITICAL:0, HIGH:1, MEDIUM:2, LOW:3 }
findings.sort((a,b)=>(priority[a.severity]??9)-(priority[b.severity]??9))
const blockers = findings.filter(f => ['BLOCKER','CRITICAL'].includes(f.severity)).length
const status = findings.length === 0 ? 'PASS' : blockers > 0 ? 'BLOCKED' : 'ATTENTION'
const summary = {
  release: policy.release,
  generatedAt,
  baseUrl: process.env.PLAYWRIGHT_BASE_URL || '',
  status,
  totals: { tests:rows.length, failed:failed.length, findings:findings.length, blockers },
  findings
}

const esc = v => String(v ?? '').replaceAll('|','\\|').replaceAll('\n',' ')
const mdRows = findings.length ? findings.map(f => `| ${f.id} | ${f.severity} | ${esc(f.module)} | ${esc(f.kind)} | ${esc(f.test)} | ${esc(f.likelyFiles.slice(0,3).join(', '))} |`).join('\n') : '| - | - | - | - | Nenhuma falha encontrada | - |'
const details = findings.map(f => `## ${f.id} — ${f.module}\n\n**Severidade:** ${f.severity}  \n**Tipo:** ${f.kind}  \n**Teste:** ${f.test}  \n**Responsável:** ${f.owner}\n\n**Rotas relacionadas:** ${f.routes.join(', ') || 'não inferida'}\n\n**Arquivos prováveis:**\n${f.likelyFiles.map(x=>`- \`${x}\``).join('\n') || '- não inferidos'}\n\n**Ação recomendada:** ${f.recommendedAction}\n\n**Evidências:**\n${f.evidence.map(x=>`- ${x.name}: \`${x.path}\``).join('\n') || '- usar trace/screenshot do Playwright'}\n\n**Erro resumido:**\n\n\`\`\`text\n${f.error.slice(0,1800)}\n\`\`\`\n`).join('\n')
const md = `# SafeSaff — Auto-Diagnóstico Playwright\n\n**Release:** ${policy.release}  \n**Gerado em:** ${generatedAt}  \n**URL:** ${summary.baseUrl || 'local'}  \n**Status:** **${status}**\n\n## Resumo\n\n| Métrica | Total |\n|---|---:|\n| Testes analisados | ${rows.length} |\n| Falhas | ${failed.length} |\n| Diagnósticos | ${findings.length} |\n| Bloqueadores | ${blockers} |\n\n## Mapa de falhas\n\n| ID | Severidade | Módulo | Tipo provável | Teste | Arquivos prováveis |\n|---|---|---|---|---|---|\n${mdRows}\n\n${details || '## Resultado\n\nNenhuma falha detectada. Nenhuma correção automática é necessária.'}\n\n## Regra para Gemini / IA\n\nNão remover módulos, rotas ou componentes para fazer o teste passar. Corrigir a causa indicada. Para regressão visual, não atualizar o Golden Master sem aprovação humana. Para Estornos e isolamento multi-tenant, qualquer falha é bloqueante.\n`

const htmlFindings = findings.map(f => `<article class="finding"><div class="top"><b>${f.id}</b><span class="sev ${f.severity.toLowerCase()}">${f.severity}</span><span>${f.module}</span></div><h3>${esc(f.test)}</h3><p><b>Diagnóstico:</b> ${f.kind}</p><p><b>Ação:</b> ${esc(f.recommendedAction)}</p><p><b>Arquivos prováveis:</b> ${esc(f.likelyFiles.join(', ') || 'não inferidos')}</p><details><summary>Erro</summary><pre>${String(f.error).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</pre></details></article>`).join('')
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SafeSaff Auto-Diagnóstico Playwright</title><style>body{font-family:Inter,Arial,sans-serif;background:#f4f6f8;color:#15171a;margin:0;padding:28px}.wrap{max-width:1180px;margin:auto}.hero,.finding,.kpi{background:#fff;border:1px solid #e3e7ec;border-radius:16px}.hero{padding:24px;margin-bottom:16px}.status{font-size:34px;font-weight:900}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}.kpi{padding:16px}.kpi b{display:block;font-size:28px}.finding{padding:18px;margin:12px 0}.top{display:flex;gap:10px;align-items:center}.sev{padding:4px 8px;border-radius:999px;font-size:12px;font-weight:800}.blocker,.critical{background:#fee4e2;color:#b42318}.high{background:#fff4e5;color:#b54708}pre{white-space:pre-wrap;max-height:320px;overflow:auto;background:#111827;color:#e5e7eb;padding:14px;border-radius:10px}@media(max-width:760px){body{padding:12px}.kpis{grid-template-columns:1fr 1fr}}</style></head><body><div class="wrap"><section class="hero"><div>DiskIngressos PDT • QA Intelligence</div><h1>Auto-Diagnóstico Playwright</h1><div class="status">${status}</div><p>${generatedAt} • ${summary.baseUrl || 'local'}</p></section><section class="kpis"><div class="kpi">Testes<b>${rows.length}</b></div><div class="kpi">Falhas<b>${failed.length}</b></div><div class="kpi">Diagnósticos<b>${findings.length}</b></div><div class="kpi">Bloqueadores<b>${blockers}</b></div></section>${htmlFindings || '<section class="finding"><h2>PASS</h2><p>Nenhuma falha detectada.</p></section>'}</div></body></html>`

fs.writeFileSync(path.join(outDir,'DIAGNOSTICO_PLAYWRIGHT.json'), JSON.stringify(summary,null,2))
fs.writeFileSync(path.join(outDir,'DIAGNOSTICO_PLAYWRIGHT.md'), md)
fs.writeFileSync(path.join(outDir,'DIAGNOSTICO_PLAYWRIGHT.html'), html)
console.log(`[pw-diagnostico] ${status}: ${findings.length} diagnóstico(s), ${blockers} bloqueador(es)`)
process.exitCode = blockers > 0 ? 1 : 0
