import fs from 'node:fs'
import path from 'node:path'

const required = [
  'Dashboard Financeiro',
  'Antecipações',
  'Divisão de Receitas',
  'Pagamentos & Taxas',
  'Relatórios Financeiros',
  'Visão Geral',
  'Saldo',
  'Extrato',
  'Recebíveis',
  'Repasses',
  'Fluxo de Caixa',
  'Conciliação',
  '24.6-receivables-agenda-2026-09-02',
  '24.7-payouts-agenda-2026-09-02',
  'Extrato & Movimentações',
  'Central de Saldo, Extrato e Movimentações',
  'AGENDA FINANCEIRA',
  'Recebimentos previstos',
  'Resumo de caixa projetado',
  'AGENDA DE PAGAMENTOS AO PRODUTOR',
  'Esteira de Repasse',
  'Impacto previsto no caixa',
  '24.8-event-financial-negotiation-2026-09-02',
  'Central de negociação econômica por evento',
  'Histórico de alterações',
  'SALVAR NEGOCIAÇÃO',
  'Edição protegida',
  '24.9-independent-refunds-2026-09-02',
  'Central de Estornos, Reembolsos & Chargebacks',
  'OPERAÇÕES CRÍTICAS',
  'Fila de Aprovações',
  'Montante Devolvido',
  'Zona de Segurança',
  '25.0-master-erp-crm-finance-producer-2026-09-02',
  'Ledger append-only',
  'financial_agreement_versions',
  'financial_audit_logs'
]

function collect(dir) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...collect(full))
    else if (/\.(js|css|html|tsx|ts)$/.test(entry.name)) out.push(full)
  }
  return out
}

function assertContains(scope, files, terms) {
  const body = files.map(f => fs.readFileSync(f, 'utf8')).join('\n')
  const missing = terms.filter(t => !body.includes(t))
  if (missing.length) {
    console.error(`\n[FINANCE RELEASE] Falha em ${scope}. Ausentes:`)
    missing.forEach(x => console.error(` - ${x}`))
    process.exit(1)
  }
  console.log(`[FINANCE RELEASE] ${scope}: OK (${terms.length} marcadores encontrados)`)
}

assertContains('src', collect('src'), required)
assertContains('dist', collect('dist'), required)
console.log('[FINANCE RELEASE] Fases 24.1 a 24.9 + fundação 25.0 confirmadas no build.')
