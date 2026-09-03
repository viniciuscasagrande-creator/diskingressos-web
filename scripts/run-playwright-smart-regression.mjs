import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

const reportPath = process.env.PLAYWRIGHT_CHANGE_IMPACT_JSON || 'test-results/change-impact/CHANGE_IMPACT.json'
const dryRun = process.argv.includes('--dry-run') || process.env.PLAYWRIGHT_SMART_REGRESSION_DRY_RUN === '1'
const targetedOnly = process.argv.includes('--targeted-only') || process.env.PLAYWRIGHT_SMART_REGRESSION_TARGETED_ONLY === '1'
const project = process.env.PLAYWRIGHT_PROJECT || 'chromium'
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'

const run = (cmd, args) => {
  console.log(`[smart-regression] ${cmd} ${args.join(' ')}`)
  if (dryRun) return { status: 0 }
  return spawnSync(cmd, args, { stdio: 'inherit', env: process.env, shell: false })
}

const analyze = run(process.execPath, ['scripts/analyze-playwright-change-impact.mjs'])
if ((analyze.status ?? 1) !== 0) process.exit(analyze.status ?? 1)
const impact = JSON.parse(fs.readFileSync(reportPath, 'utf8'))

const tests = impact.selectedTests || []
if (!tests.length) {
  console.log('[smart-regression] Nenhum teste selecionado. Executando gate estrutural mínimo.')
  const q = run(npm, ['run', 'quality:gate'])
  process.exit(q.status ?? 1)
}

const targeted = run(npx, ['playwright', 'test', ...tests, `--project=${project}`, '--reporter=list,html'])
if ((targeted.status ?? 1) !== 0) {
  console.error('[smart-regression] FAIL: regressão focada falhou. Certificação completa bloqueada.')
  process.exit(targeted.status ?? 1)
}

const gate = run(npm, ['run', 'verify:protected-modules'])
if ((gate.status ?? 1) !== 0) process.exit(gate.status ?? 1)
const lucide = run(npm, ['run', 'check:lucide'])
if ((lucide.status ?? 1) !== 0) process.exit(lucide.status ?? 1)

if (targetedOnly) {
  console.log('[smart-regression] TARGETED_PASS')
  process.exit(0)
}

if (impact.critical || ['event-os', 'auth-tenant', 'estornos', 'central-eventos'].some(x => impact.impactedModules?.includes(x))) {
  console.log('[smart-regression] Impacto crítico detectado. Executando certificação completa.')
  const full = run(npm, ['run', 'release:certify'])
  process.exit(full.status ?? 1)
}

console.log('[smart-regression] SMART_REGRESSION_PASS — impacto não crítico; certificação completa não exigida pela política.')
process.exit(0)
