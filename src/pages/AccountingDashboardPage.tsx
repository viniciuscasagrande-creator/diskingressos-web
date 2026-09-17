import { useState } from 'react'
import {
  BookOpen, Calculator, Download, CheckCircle2, Scale,
  Layers, ArrowUpRight, ArrowDownLeft, FileSpreadsheet,
  Building2, Sparkles, Filter, RefreshCw, ShieldCheck, ArrowRight
} from 'lucide-react'
import type { EventItem } from '../data/events'
import { financeSummary, type SystemTier } from '../data/finance'
import { LimitlessPage } from '../integrations/limitless/LimitlessPage'
import {
  DiskPageHeader,
  DiskKpiCard,
  DiskCard,
  DiskCardHeader,
  DiskCardBody
} from '../components/ui/disk'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function AccountingDashboardPage({ events, notify, onNavigate }: Props) {
  const [tier, setTier] = useState<SystemTier>('advanced')
  const [period, setPeriod] = useState('08/2026')

  // Demonstration Accounting Data
  const totalAssets = 1840250.00
  const totalLiabilities = 519120.40
  const totalEquity = 1321129.60
  const netRevenue = financeSummary.netRevenue
  const netProfit = 218400.00

  // Journal Entries (Partidas Dobradas)
  const journalEntries = [
    {
      id: 'LCT-8891',
      date: '28/08/2026',
      description: 'Venda de Ingressos #DI-98240 — Iron Maiden Symphonic',
      debitAccount: '1.1.1.02 — Bancos Conta Movimento (Itaú)',
      creditAccount: '2.1.3.01 — Adiantamento de Clientes (Passivo)',
      amount: 1250.00,
      status: 'Escriturado'
    },
    {
      id: 'LCT-8892',
      date: '28/08/2026',
      description: 'Apropriação de Taxa de Serviço DiskIngressos',
      debitAccount: '2.1.3.01 — Adiantamento de Clientes (Passivo)',
      creditAccount: '3.1.1.01 — Receita de Intermediação de Ingressos',
      amount: 85.00,
      status: 'Escriturado'
    },
    {
      id: 'LCT-8893',
      date: '28/08/2026',
      description: 'Repasse Liquidado — Produtora Rua da Música',
      debitAccount: '2.1.4.01 — Contas a Pagar / Repasses a Produtores',
      creditAccount: '1.1.1.02 — Bancos Conta Movimento (Itaú)',
      amount: 8420.00,
      status: 'Escriturado'
    },
    {
      id: 'LCT-8894',
      date: '27/08/2026',
      description: 'Tarifas de Gateway Adquirente Cielo Mês 08',
      debitAccount: '4.1.2.03 — Despesas Financeiras e Taxas de Cartão',
      creditAccount: '2.1.2.01 — Fornecedores / Gateways a Pagar',
      amount: 184.90,
      status: 'Escriturado'
    },
    {
      id: 'LCT-8895',
      date: '26/08/2026',
      description: 'Serviços de Infraestrutura Cloud AWS Brasil',
      debitAccount: '4.1.1.05 — Custos de Tecnologia e Servidores',
      creditAccount: '1.1.1.02 — Bancos Conta Movimento (Itaú)',
      amount: 7420.00,
      status: 'Escriturado'
    }
  ]

  // DRE Sintética
  const dreItems = [
    { label: '1. RECEITA BRUTA DE SERVIÇOS E BILHETERIA', value: 1284320.00, isBold: true, isNegative: false },
    { label: '(-) Deduções da Receita Bruta e Impostos (ISS/PIS/COFINS)', value: -102059.10, isBold: false, isNegative: true },
    { label: '(=) RECEITA OPERACIONAL LÍQUIDA', value: 1182260.90, isBold: true, isNegative: false },
    { label: '(-) Custos Diretos de Intermediação e Repasses', value: -783960.00, isBold: false, isNegative: true },
    { label: '(=) LUCRO BRUTO OPERACIONAL', value: 398300.90, isBold: true, isNegative: false },
    { label: '(-) Despesas Administrativas e Infraestrutura Cloud', value: -84200.00, isBold: false, isNegative: true },
    { label: '(-) Despesas com Marketing e Atribuição UTM', value: -42800.00, isBold: false, isNegative: true },
    { label: '(=) EBITDA / LAJIDA', value: 271300.90, isBold: true, isNegative: false },
    { label: '(-) Depreciação e Despesas Financeiras Líquidas', value: -18400.00, isBold: false, isNegative: true },
    { label: '(=) RESULTADO LÍQUIDO DO EXERCÍCIO (LUCRO)', value: 252900.90, isBold: true, isHighlight: true, isNegative: false }
  ]

  const exportSpedECD = () => {
    notify('Arquivo SPED Contábil (ECD / FCONT) gerado e validado com sucesso!')
  }

  return (
    <LimitlessPage dataTestId="accounting-dashboard-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* 1. Header V7 Oficial */}
      <DiskPageHeader
        breadcrumbs={['Contabilidade', 'Dashboard']}
        badge="Contabilidade Societária & Fiscal"
        badgeTone="primary"
        title="Dashboard Contábil Integrado"
        subtitle="Escrituração contábil em tempo real conectada diretamente às vendas do e-commerce, deduções de taxas, liquidações de repasses e fechamento de competência."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-subtle-info text-xs font-semibold py-1 px-2.5 flex items-center gap-1.5">
              <Sparkles size={13} /> Partidas Dobradas Automáticas
            </span>
            <select
              value={tier}
              onChange={e => setTier(e.target.value as any)}
              className="form-select text-xs font-medium cursor-pointer"
            >
              <option value="standard">Standard (Básico)</option>
              <option value="advanced">Advanced (DRE + Diário)</option>
              <option value="expert">Expert (SPED + Auditoria)</option>
            </select>
            <button
              type="button"
              className="btn-light text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              onClick={exportSpedECD}
              title="Gerar SPED"
            >
              <Download size={14} />
              <span>Exportar SPED ECD</span>
            </button>
          </div>
        }
      />

      {/* 2. KPI Cards Strip no Padrão V7 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DiskKpiCard
          icon={<Building2 size={20} />}
          label="Ativo Total"
          value={brl(totalAssets)}
          note="Circulante + Permanente"
          accent="info"
        />
        <DiskKpiCard
          icon={<Scale size={20} />}
          label="Passivo Circulante"
          value={brl(totalLiabilities)}
          note="Repasses a Pagar"
          accent="warning"
        />
        <DiskKpiCard
          icon={<ShieldCheck size={20} />}
          label="Patrimônio Líquido"
          value={brl(totalEquity)}
          note="Capital Social + Reservas"
          accent="success"
        />
        <DiskKpiCard
          icon={<Calculator size={20} />}
          label="Lucro Líquido Exercício"
          value={brl(252900.90)}
          note="Margem de 21.4%"
          accent="purple"
        />
      </div>

      {/* 3. DRE & Livro Diário */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DRE Sintética */}
        <DiskCard className="p-4 shadow-xs">
          <DiskCardHeader
            title="Demonstração do Resultado (DRE)"
            subtitle="Apuração de competência do mês 08/2026"
            action={<span className="badge badge-subtle-success">Auditado</span>}
          />
          <DiskCardBody className="px-0 pb-0">
            <div className="space-y-1.5 mt-2">
              {dreItems.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs transition ${
                    item.isHighlight
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold'
                      : item.isBold
                      ? 'bg-[var(--disk-bg-muted,#f8fafc)] font-bold text-[var(--disk-text-primary,#0f172a)]'
                      : 'text-[var(--disk-text-secondary,#475569)] hover:bg-[var(--disk-bg-hover,#f1f5f9)]'
                  }`}
                >
                  <span>{item.label}</span>
                  <strong className={`font-mono ${
                    item.isHighlight
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : item.isNegative
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-[var(--disk-text-primary,#0f172a)]'
                  }`}>
                    {item.isNegative ? `- ${brl(Math.abs(item.value))}` : brl(item.value)}
                  </strong>
                </div>
              ))}
            </div>
          </DiskCardBody>
        </DiskCard>

        {/* Livro Diário & Partidas Dobradas */}
        <DiskCard className="p-4 shadow-xs">
          <DiskCardHeader
            title="Livro Diário — Últimos Lançamentos"
            subtitle="Escrituração automática por Partidas Dobradas"
            action={
              <button
                type="button"
                className="btn-light text-xs font-semibold py-1 px-2.5 cursor-pointer flex items-center gap-1"
                onClick={() => onNavigate?.('accounting-journal')}
              >
                <span>Ver Diário Completo</span>
                <ArrowRight size={13} />
              </button>
            }
          />
          <DiskCardBody className="px-0 pb-0">
            <div className="space-y-2.5 mt-2">
              {journalEntries.map(lct => (
                <div
                  key={lct.id}
                  className="p-3 rounded-lg border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] hover:shadow-xs transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-sky-600 dark:text-sky-400 font-mono">{lct.id}</span>
                      <small className="text-[11px] text-[var(--disk-text-muted,#64748b)]">{lct.date}</small>
                    </div>
                    <strong className="text-xs font-mono font-bold text-[var(--disk-text-primary,#0f172a)]">{brl(lct.amount)}</strong>
                  </div>

                  <div className="text-xs font-semibold text-[var(--disk-text-primary,#0f172a)] mb-1.5 truncate">
                    {lct.description}
                  </div>

                  <div className="text-[11px] text-[var(--disk-text-muted,#64748b)] flex flex-col gap-0.5">
                    <div><span className="text-emerald-600 dark:text-emerald-400 font-bold">[D]</span> {lct.debitAccount}</div>
                    <div><span className="text-rose-600 dark:text-rose-400 font-bold">[C]</span> {lct.creditAccount}</div>
                  </div>
                </div>
              ))}
            </div>
          </DiskCardBody>
        </DiskCard>
      </div>

      {/* 4. Accounting Quick Navigation Strip */}
      <DiskCard className="p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-[var(--disk-text-primary,#0f172a)] m-0">
              Módulos da Fase 18 — Contabilidade em Operação
            </h4>
            <p className="text-xs text-[var(--disk-text-muted,#64748b)] mt-0.5">
              Acesse rapidamente o Plano de Contas, Livro Diário, Livro Razão, Balancete e Fechamento.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn-light text-xs font-semibold px-3 py-1.5 cursor-pointer shadow-xs" onClick={() => onNavigate?.('accounting-chart')}>Plano de Contas</button>
            <button type="button" className="btn-light text-xs font-semibold px-3 py-1.5 cursor-pointer shadow-xs" onClick={() => onNavigate?.('accounting-journal')}>Livro Diário</button>
            <button type="button" className="btn-light text-xs font-semibold px-3 py-1.5 cursor-pointer shadow-xs" onClick={() => onNavigate?.('accounting-ledger')}>Livro Razão</button>
            <button type="button" className="btn-light text-xs font-semibold px-3 py-1.5 cursor-pointer shadow-xs" onClick={() => onNavigate?.('accounting-trial-balance')}>Balancete</button>
            <button type="button" className="btn-light text-xs font-semibold px-3 py-1.5 cursor-pointer shadow-xs" onClick={() => onNavigate?.('accounting-closing')}>Fechamento Fiscal</button>
          </div>
        </div>
      </DiskCard>
    </LimitlessPage>
  )
}
