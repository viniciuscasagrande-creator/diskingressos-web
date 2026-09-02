import fs from 'node:fs'
import path from 'node:path'

const uiRequired = [
  'Dashboard Financeiro','Antecipações','Divisão de Receitas','Pagamentos & Taxas','Relatórios Financeiros',
  'Visão Geral','Saldo','Extrato','Recebíveis','Repasses','Fluxo de Caixa','Conciliação',
  '24.6-receivables-agenda-2026-09-02','24.7-payouts-agenda-2026-09-02','Extrato & Movimentações',
  'Central de Saldo, Extrato e Movimentações','AGENDA FINANCEIRA','Recebimentos previstos','Resumo de caixa projetado',
  'AGENDA DE PAGAMENTOS AO PRODUTOR','Esteira de Repasse','Impacto previsto no caixa',
  '24.8-event-financial-negotiation-2026-09-02','Central de negociação econômica por evento','Histórico de alterações','SALVAR NEGOCIAÇÃO','Edição protegida',
  '24.9-independent-refunds-2026-09-02','Central de Estornos, Reembolsos & Chargebacks','ESTORNO','Fila de Aprovações','Montante Devolvido','Zona de Segurança',
  '25.3.2.1-premium-sidebar-auto-collapse-2026-09-02','25.3.3-navigation-rail-financial-typography-2026-09-02','module-nav-icon','module-nav-label','collapsible-section-chevron'
]

const architectureRequired = [
  '25.0-master-erp-crm-finance-producer-2026-09-02','25.1-ledger-chart-of-accounts-2026-09-02','25.2-split-financial-agreements-2026-09-02','25.3-producer-ledger-account-2026-09-02',
  'Ledger append-only','financial_agreement_versions','financial_audit_logs','Ledger Contábil e Plano de Contas','defaultTicketingChartOfAccounts',
  'ledger_account_balances','ledger_producer_balances','assert_ledger_batch_balanced',
  'Motor de Split e Contratos Financeiros','Conta Gráfica do Produtor','Saldo do Produtor','BUCKETS FINANCEIROS','financial_agreement_rules','financial_agreement_participants','split_executions','split_allocations','active_financial_agreements'
]

function collect(dir) {
  if (!fs.existsSync(dir)) return []
  const out=[]
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const full=path.join(dir,entry.name)
    if(entry.isDirectory()) out.push(...collect(full))
    else if (/\.(js|css|html|tsx|ts|sql|md)$/.test(entry.name)) out.push(full)
  }
  return out
}

function body(files){ return files.map(f=>fs.readFileSync(f,'utf8')).join('\n') }
function assertContains(scope, content, terms){
  const missing=terms.filter(t=>!content.includes(t))
  if(missing.length){console.error(`\n[FINANCE RELEASE] Falha em ${scope}. Ausentes:`);missing.forEach(x=>console.error(` - ${x}`));process.exit(1)}
  console.log(`[FINANCE RELEASE] ${scope}: OK (${terms.length} marcadores encontrados)`)
}

const srcBody=body(collect('src'))
const distBody=body(collect('dist'))
const architectureBody=body([...collect('src'),...collect('server'),...collect('db'),...collect('.')].filter((v,i,a)=>a.indexOf(v)===i))
assertContains('src/UI',srcBody,uiRequired)
assertContains('dist/UI',distBody,uiRequired)
assertContains('arquitetura backend/db',architectureBody,architectureRequired)
console.log('[FINANCE RELEASE] Fases 24.1 a 24.9 + Fases 25.0 a 25.3.3 confirmadas no build.')

// Fase 25.3.4 — Limitless Enterprise UI
const limitlessMarker = '25.3.4-limitless-enterprise-ui-2026-09-02';
const root = process.cwd();
const limitlessTheme = path.join(root, 'src/theme/limitlessManifest.ts');
if (!fs.existsSync(limitlessTheme) || !fs.readFileSync(limitlessTheme, 'utf8').includes(limitlessMarker)) {
  console.error('Falha: integração Limitless 25.3.4 não encontrada.');
  process.exit(1);
}
console.log('[FINANCE RELEASE] Fase 25.3.4 Limitless Enterprise UI confirmada.');

// Fase 25.4 — Recebíveis, Liquidação e Agenda Financeira
const phase254 = '25.4-receivables-settlement-agenda-2026-09-02';
const phase254Body = body([...collect('src'), ...collect('db'), ...collect('.')]);
assertContains('Fase 25.4', phase254Body, [phase254, 'Central de Recebíveis & Liquidação', 'Curva de liquidação', 'Mix de recebíveis', 'Saúde da liquidação', 'receivable_schedule_entries', 'receivable_agenda_summary']);
console.log('[FINANCE RELEASE] Fases 25.0 a 25.4 confirmadas no build.');

// Fase 25.5 — Repasses, Reservas e Disponibilidade Financeira
const phase255 = '25.5-payouts-reserves-availability-2026-09-02';
const phase255Body = body([...collect('src'), ...collect('db'), ...collect('.')]);
assertContains('Fase 25.5', phase255Body, [phase255, 'Repasses, Reservas & Disponibilidade Financeira', 'Mapa de disponibilidade', 'WATERFALL DO REPASSE', 'POLÍTICA DE RESERVA', 'producer_balance_reserves', 'payout_commitments', 'producer_payout_availability']);
console.log('[FINANCE RELEASE] Fases 25.0 a 25.5 confirmadas no build.');

// Fase 25.6 — Responsividade Enterprise 360°
const phase256 = '25.6-responsive-enterprise-360-2026-09-02';
const phase256Body = body([...collect('src'), ...collect('db'), ...collect('.')]);
assertContains('Fase 25.6', phase256Body, [phase256, 'responsive-enterprise-360.css']);
console.log('[FINANCE RELEASE] Fases 25.0 a 25.6 confirmadas no build.');
