import fs from 'node:fs'

const checks = [
  ['src/components/ModuleSidebar.tsx', "key: 'finance-refunds', label: 'Estornos'", 'item independente Estornos'],
  ['src/components/ModuleSidebar.tsx', 'independentRefundItem', 'renderização independente Estornos'],
  ['src/App.tsx', "'finance-refunds': 'Devoluções / Estornos'", 'título/registro da rota Estornos'],
  ['src/App.tsx', "'finance-refunds'", 'dispatch da rota Estornos'],
  ['src/pages/finance/advanced/AdvancedTaxesRouter.tsx', "case 'finance-refunds':", 'router Estornos'],
  ['src/pages/finance/advanced/AdvancedTaxesRouter.tsx', 'FinanceDisputesHubPage', 'tela Enterprise Estornos'],
  ['src/pages/finance/FinanceDisputesHubPage.tsx', 'Central de Estornos, Reembolsos & Chargebacks', 'conteúdo da tela Estornos'],
  ['src/styles/disk-estornos.css', '', 'stylesheet Estornos'],
]
let failed = false
for (const [file, needle, label] of checks) {
  if (!fs.existsSync(file)) { console.error(`FAIL ${label}: arquivo ausente ${file}`); failed=true; continue }
  const text=fs.readFileSync(file,'utf8')
  if (needle && !text.includes(needle)) { console.error(`FAIL ${label}: assinatura removida`); failed=true }
  else console.log(`PASS ${label}`)
}
if (failed) {
  console.error('\nBLOQUEIO DE BUILD: Estornos é CORE_PROTECTED_MODULE e não pode ser removido/refatorado sem aprovação explícita.')
  process.exit(1)
}
console.log('\nPASS CORE_PROTECTED_MODULES: Estornos preservado.')
