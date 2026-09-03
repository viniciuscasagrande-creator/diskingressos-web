import fs from 'node:fs'

const manifest = JSON.parse(fs.readFileSync('CORE_PROTECTED_MODULES.json', 'utf8'))
const sidebar = fs.readFileSync('src/components/ModuleSidebar.tsx', 'utf8')
const app = fs.readFileSync('src/App.tsx', 'utf8')

const structuralChecks = [
  ['src/components/ModuleSidebar.tsx', "key: 'events', label: 'Todos os Eventos'", 'menu Eventos'],
  ['src/components/ModuleSidebar.tsx', "key: 'finance-dashboard', label: 'Dashboard Financeiro'", 'menu Financeiro'],
  ['src/components/ModuleSidebar.tsx', "key: 'finance-refunds', label: 'Estornos'", 'menu independente Estornos'],
  ['src/components/ModuleSidebar.tsx', "key: 'marketing-dashboard', label: 'Dashboard Marketing'", 'menu Marketing'],
  ['src/components/ModuleSidebar.tsx', "key: 'sac-hub', label: 'Atendimento / SAC'", 'menu SAC'],
  ['src/App.tsx', "'finance-refunds': 'Devoluções / Estornos'", 'registro Estornos'],
  ['src/pages/finance/advanced/AdvancedTaxesRouter.tsx', "case 'finance-refunds':", 'router Estornos'],
  ['src/pages/finance/FinanceDisputesHubPage.tsx', 'Central de Estornos, Reembolsos & Chargebacks', 'tela Estornos'],
  ['src/styles/disk-estornos.css', '', 'stylesheet Estornos']
]

let failed = false
for (const [file, needle, label] of structuralChecks) {
  if (!fs.existsSync(file)) { console.error(`FAIL ${label}: arquivo ausente ${file}`); failed = true; continue }
  const text = fs.readFileSync(file, 'utf8')
  if (needle && !text.includes(needle)) { console.error(`FAIL ${label}: assinatura removida`); failed = true }
  else console.log(`PASS ${label}`)
}

for (const mod of manifest.modules) {
  if (!sidebar.includes(`'${mod.pageKey}'`)) { console.error(`FAIL ${mod.label}: PageKey/menu ausente (${mod.pageKey})`); failed = true }
  else console.log(`PASS ${mod.label}: PageKey/menu preservado`)
  if (!app.includes(`'${mod.pageKey}'`)) { console.error(`FAIL ${mod.label}: App.tsx não referencia ${mod.pageKey}`); failed = true }
  else console.log(`PASS ${mod.label}: App.tsx preservado`)
}

const releaseMarker = `data-core-protection-release="${manifest.release}"`
if (!sidebar.includes(releaseMarker)) {
  console.error(`FAIL release marker do Core Stability Gate ausente (${manifest.release})`)
  failed = true
} else console.log(`PASS release marker Core Stability Gate (${manifest.release})`)

if (failed) {
  console.error('\nBLOQUEIO DE BUILD: um módulo CORE_PROTECTED_MODULE foi removido ou alterado fora do contrato aprovado.')
  process.exit(1)
}
console.log(`\nPASS CORE_PROTECTED_MODULES: ${manifest.modules.length} módulos críticos preservados.`)
