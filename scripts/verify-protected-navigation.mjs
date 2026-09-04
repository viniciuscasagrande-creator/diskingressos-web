import fs from 'node:fs'

console.log('================================================================');
console.log('VERIFICAÇÃO DE NAVEGAÇÃO PROTEGIDA — ESTORNOS & CORE MODULES');
console.log('================================================================\n');

const checks = [
  {
    file: 'src/pages/finance/FinanceDisputesHubPage.tsx',
    tokens: ['Central de Estornos, Reembolsos & Chargebacks'],
    label: 'Tela Oficial Canônica de Estornos'
  },
  {
    file: 'src/components/ModuleSidebar.tsx',
    tokens: ["key: 'finance-refunds', label: 'Estornos'"],
    label: 'Item de Menu Independente de Estornos'
  },
  {
    file: 'src/App.tsx',
    tokens: ["'finance-refunds': 'Devoluções / Estornos'"],
    label: 'Registro Canônico de Estornos no App.tsx'
  },
  {
    file: 'src/core/navigation/eventOSNavigation.ts',
    tokens: ["canonicalPath: '/app/finance-refunds'"],
    label: 'Contrato de Navegação Estornos'
  },
  {
    file: 'src/core/navigation/buttonContracts.ts',
    tokens: ["target: '/app/finance-refunds'"],
    label: 'Contrato de Botão Estornos'
  }
]

let hasError = false
for (const check of checks) {
  if (!fs.existsSync(check.file)) {
    console.error(`[FAIL] Arquivo não encontrado: ${check.file}`)
    hasError = true
    continue
  }
  const content = fs.readFileSync(check.file, 'utf8')
  for (const token of check.tokens) {
    if (!content.includes(token)) {
      console.error(`[FAIL] Token ausente em ${check.file}: "${token}" (${check.label})`)
      hasError = true
    }
  }
  if (!hasError) {
    console.log(`[PASS] ${check.label}`)
  }
}

if (hasError) {
  console.error('\n[BLOQUEIO] Falha na verificação de navegação protegida de Estornos!')
  process.exit(1)
}

console.log('\n[PASS] Todos os contratos de navegação protegida foram aprovados com sucesso!')
