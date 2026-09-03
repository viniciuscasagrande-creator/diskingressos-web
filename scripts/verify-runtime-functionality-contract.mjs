import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const policyPath = path.join(root, 'playwright-runtime-functionality.policy.json')
const fail = (m) => { console.error(`❌ ${m}`); process.exitCode = 1 }
const ok = (m) => console.log(`✅ ${m}`)

if (!fs.existsSync(policyPath)) {
  fail('playwright-runtime-functionality.policy.json ausente')
  process.exit(1)
}
const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'))
const appPath = path.join(root, 'src/App.tsx')
const sidebarPath = path.join(root, 'src/components/ModuleSidebar.tsx')
if (!fs.existsSync(appPath) || !fs.existsSync(sidebarPath)) {
  fail('App.tsx ou ModuleSidebar.tsx ausente')
  process.exit(1)
}
const app = fs.readFileSync(appPath, 'utf8')
const sidebar = fs.readFileSync(sidebarPath, 'utf8')
let passed = 0
for (const mod of policy.protectedModules) {
  const key = mod.route.replace(/^\/app\//, '')
  const hasRouteKey = app.includes(`'${key}'`) || app.includes(`\"${key}\"`)
  const hasTestIdContract = sidebar.includes(`data-testid={\`nav-${'${item.key}'}\`}`) && sidebar.includes(`'${key}'`)
  if (!hasRouteKey) fail(`${mod.id}: chave ${key} não encontrada em App.tsx`)
  else if (!hasTestIdContract) fail(`${mod.id}: contrato de navegação não encontrado na sidebar`)
  else { ok(`${mod.id}: rota + navegação preservadas`); passed++ }
}
const refundPageCandidates = ['src/pages/finance/FinanceDisputesHubPage.tsx','src/pages/FinanceDisputesHubPage.tsx','src/pages/FinanceRefundsPage.tsx']
const refundExists = refundPageCandidates.some(f => fs.existsSync(path.join(root, f)))
if (!refundExists) fail('Estornos: nenhuma página canônica encontrada')
else ok('Estornos: página canônica presente')

const result = {
  release: policy.release,
  checkedAt: new Date().toISOString(),
  status: process.exitCode ? 'BLOCKED' : 'PASS',
  passed,
  total: policy.protectedModules.length,
  modules: policy.protectedModules
}
const outDir = path.join(root, 'test-results/runtime-functionality')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'FUNCTIONALITY_MATRIX.json'), JSON.stringify(result, null, 2))
fs.writeFileSync(path.join(outDir, 'FUNCTIONALITY_MATRIX.md'), `# Functional Runtime Matrix\n\nRelease: \`${policy.release}\`\n\nStatus: **${result.status}**\n\nMódulos validados: **${passed}/${policy.protectedModules.length}**\n`)
if (!process.exitCode) console.log(`\nPASS ${passed}/${policy.protectedModules.length} — contrato funcional estático preservado.`)
