import { useEffect, useMemo, useState, type ComponentType } from 'react'
import {
  Activity,
  AlertTriangle,
  BanknoteArrowDown,
  BanknoteArrowUp,
  Brain,
  Building2,
  Calculator,
  ChartNoAxesCombined,
  CircleDollarSign,
  CreditCard,
  FileSpreadsheet,
  HandCoins,
  Landmark,
  Percent,
  ReceiptText,
  RefreshCw,
  Scale,
  ShieldCheck,
  Split,
  Store,
  TrendingDown,
  TrendingUp,
  Undo2,
  WalletCards,
  Zap,
  Settings2,
  ServerCog,
  Search,
  ArrowRight,
  Clock3,
  LayoutDashboard,
  List,
  LineChart,
  GitCompareArrows
} from 'lucide-react'
import type { EventItem } from '../data/events'
import type { PageKey } from '../components/ModuleSidebar'
import { getFinanceDashboardSummary, type FinanceDashboardSummary } from '../services/api'
import { navigateWithFinanceDrilldown } from '../utils/financeDrilldown'
import FinanceOptionCarousel from '../components/finance/FinanceOptionCarousel'
import { LimitlessPage } from '../integrations/limitless/LimitlessPage'
import {
  DiskPageHeader,
  DiskKpiCard,
  DiskCard,
  DiskCardHeader
} from '../components/ui/disk'

type Props = {
  events: EventItem[]
  producerId?: number | null
  notify: (m: string) => void
  onNavigate: (p: PageKey) => void
}

type Tone = 'blue' | 'green' | 'orange' | 'purple' | 'cyan' | 'red'
type Shortcut = {
  title: string
  desc: string
  page: PageKey
  icon: ComponentType<{ size?: number; className?: string }>
  tone: Tone
}

const brl = (c?: number | null) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((c || 0) / 100)

const base: { title: string; subtitle: string; items: Shortcut[] }[] = [
  {
    title: 'OPERAÇÕES DE CAIXA',
    subtitle: 'Rotinas financeiras e saldos do dia a dia',
    items: [
      { title: 'Saldo', desc: 'Saldo consolidado, disponível, bloqueado e previsto.', page: 'finance', icon: WalletCards, tone: 'blue' },
      { title: 'Conta do Produtor', desc: 'Conta gráfica, buckets, reservas e saldo derivado do Ledger.', page: 'finance-producer-account', icon: CircleDollarSign, tone: 'cyan' },
      { title: 'Solicitar Repasse', desc: 'Transferências, aprovação, programação e comprovantes.', page: 'finance-payouts', icon: HandCoins, tone: 'green' },
      { title: 'Antecipações', desc: 'Simule e antecipe recebíveis elegíveis.', page: 'finance-advance', icon: Zap, tone: 'orange' },
      { title: 'Extrato', desc: 'Entradas, saídas, vendas, taxas e repasses.', page: 'finance-statement', icon: ReceiptText, tone: 'purple' },
      { title: 'Despesas', desc: 'Custos operacionais e despesas por evento.', page: 'finance-expenses', icon: TrendingDown, tone: 'red' },
      { title: 'Contas Bancárias', desc: 'Contas para liquidação, PIX e repasses.', page: 'finance-bank-accounts', icon: Landmark, tone: 'cyan' }
    ]
  },
  {
    title: 'ADVANCED & INTELIGÊNCIA',
    subtitle: 'Conciliação, spread, adquirência e performance',
    items: [
      { title: 'Financeiro Advanced', desc: 'Caixa, recebíveis, obrigações, liquidez e resultado.', page: 'finance-advanced', icon: ChartNoAxesCombined, tone: 'purple' },
      { title: 'Conciliação Bancária', desc: 'Banco, PIX, cartão, gateway e divergências.', page: 'finance-reconciliation', icon: Scale, tone: 'green' },
      { title: 'Financeiro Spread', desc: 'MDR, custos, prazo D+, adquirente e margem.', page: 'finance-spread', icon: Percent, tone: 'orange' },
      { title: 'Inteligência Financeira', desc: 'Margem, ROI, tendências, alertas e anomalias.', page: 'finance-intelligence', icon: Brain, tone: 'purple' },
      { title: 'Operadoras de Cartão', desc: 'MDR, aprovação, antecipação e liquidação.', page: 'finance-operators', icon: ShieldCheck, tone: 'cyan' },
      { title: 'Gateway de Pagamentos', desc: 'Provedores, ambientes, prioridade e validação.', page: 'finance-gateways', icon: ServerCog, tone: 'blue' }
    ]
  },
  {
    title: 'SIMULADORES, MÉTODOS & LIQUIDAÇÕES',
    subtitle: 'Pagamentos, split, borderô e pontos de venda',
    items: [
      { title: 'Simulador de Spread', desc: 'Preço, taxas, MDR, parcelamento e lucro líquido.', page: 'finance-spread-simulator', icon: Calculator, tone: 'orange' },
      { title: 'Split Financeiro', desc: 'Partilha automatizada entre beneficiários.', page: 'finance-split', icon: Split, tone: 'purple' },
      { title: 'Métodos de Pagamento', desc: 'PIX, crédito, débito, boleto e parcelamento.', page: 'finance-methods', icon: CreditCard, tone: 'green' },
      { title: 'Pagamentos Customizados', desc: 'Cortesias, permutas e regras especiais.', page: 'finance-custom', icon: Settings2, tone: 'purple' },
      { title: 'Borderô', desc: 'Demonstrativo, liquidação, assinatura e histórico.', page: 'finance-bordero', icon: FileSpreadsheet, tone: 'green' },
      { title: 'Pontos de Venda (PDV)', desc: 'Bilheterias físicas, quiosques e terminais.', page: 'pos', icon: Store, tone: 'cyan' }
    ]
  },
  {
    title: 'CONTROLE & GESTÃO',
    subtitle: 'Recebíveis, obrigações, estornos e relatórios',
    items: [
      { title: 'Recebíveis', desc: 'Agenda, vencimentos, adquirentes e liquidações.', page: 'finance-receivables', icon: BanknoteArrowDown, tone: 'green' },
      { title: 'Contas a Pagar', desc: 'Obrigações, vencimentos e programação.', page: 'finance-payables', icon: BanknoteArrowUp, tone: 'orange' },
      { title: 'Fluxo de Caixa', desc: 'Entradas, saídas e projeção financeira.', page: 'finance-cashflow', icon: TrendingUp, tone: 'blue' },
      { title: 'Negociações Financeiras', desc: 'Condições comerciais e regras especiais.', page: 'finance-negotiations', icon: Building2, tone: 'purple' },
      { title: 'Devoluções / Estornos', desc: 'Total/parcial, aprovação e processamento.', page: 'finance-refunds', icon: Undo2, tone: 'red' },
      { title: 'Relatórios Financeiros', desc: 'Consolidado, filtros e exportações.', page: 'finance-reports', icon: FileSpreadsheet, tone: 'cyan' }
    ]
  }
]

export default function FinanceCommandCenterPage({ events, producerId, notify, onNavigate }: Props) {
  const [eventId, setEventId] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [summary, setSummary] = useState<FinanceDashboardSummary | null>(null)

  async function load(manual = false) {
    setLoading(true)
    setError('')
    try {
      const data = await getFinanceDashboardSummary(producerId ?? undefined, eventId)
      setSummary(data)
      if (data.health.unavailable.length) {
        setError(`${data.health.unavailable.length} fonte(s) complementar(es) indisponível(is): ${data.health.unavailable.join(', ')}.`)
      }
      if (manual) notify('Indicadores financeiros atualizados.')
    } catch (e: any) {
      setError(e?.message || 'Não foi possível carregar os indicadores financeiros.')
      if (manual) notify('Não foi possível atualizar os indicadores financeiros.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [producerId, eventId])

  const groups = useMemo(
    () => base.map(g => ({ ...g, items: g.items.filter(x => (x.title + ' ' + x.desc).toLowerCase().includes(q.toLowerCase())) })),
    [q]
  )

  const selectedEventName = events.find(e => e.id === eventId)?.title
  const openHubPage = (page: PageKey, label: string, status?: string) =>
    navigateWithFinanceDrilldown(onNavigate, page, { status, eventName: selectedEventName, source: 'finance-dashboard-hub', label })

  return (
    <LimitlessPage
      dataTestId="finance-dashboard-page"
      className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fadeIn"
    >
      <div className="finance-command" data-finance-release="25.3.3-navigation-rail-financial-typography-2026-09-02">
        {/* Header Limitless V7 */}
        <DiskPageHeader
          breadcrumbs={['Financeiro', 'Visão Geral']}
          badge="Módulo Financeiro Oficial"
          badgeTone="primary"
          title="Dashboard Financeiro"
          subtitle="Controle de saldos, recebíveis, taxas, pagamentos, repasses e liquidações."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={eventId ?? ''}
                onChange={e => setEventId(e.target.value ? Number(e.target.value) : undefined)}
                className="form-select text-xs font-medium cursor-pointer"
              >
                <option value="">Todos os eventos</option>
                {events.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onNavigate('financial-core')}
                className="btn-light text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Landmark className="w-3.5 h-3.5 text-[var(--ll-primary)]" />
                <span>Núcleo Enterprise</span>
              </button>
              <button
                type="button"
                onClick={() => load(true)}
                disabled={loading}
                className="btn-light text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Atualizando...' : 'Atualizar'}</span>
              </button>
              <button
                type="button"
                className="btn-primary text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                onClick={() => onNavigate('finance-payouts')}
              >
                <HandCoins className="w-3.5 h-3.5" />
                <span>Solicitar Repasse</span>
              </button>
            </div>
          }
        />

        {/* Carousel de navegação interna */}
        <div className="card p-2 shadow-sm mb-4">
          <FinanceOptionCarousel className="finance-hub-carousel" ariaLabel="Navegação interna do Dashboard Financeiro">
            <button className="active" type="button" aria-current="page">
              <LayoutDashboard size={15} />
              <span>Visão Geral</span>
            </button>
            <button type="button" onClick={() => openHubPage('finance', 'Saldo')}>
              <WalletCards size={15} />
              <span>Saldo</span>
            </button>
            <button type="button" onClick={() => openHubPage('finance-producer-account', 'Conta do Produtor')}>
              <CircleDollarSign size={15} />
              <span>Conta do Produtor</span>
            </button>
            <button type="button" onClick={() => openHubPage('finance-statement', 'Extrato')}>
              <List size={15} />
              <span>Extrato</span>
            </button>
            <button type="button" onClick={() => openHubPage('finance-receivables', 'Recebíveis', 'open')}>
              <BanknoteArrowDown size={15} />
              <span>Recebíveis</span>
            </button>
            <button type="button" onClick={() => openHubPage('finance-payouts', 'Repasses')}>
              <HandCoins size={15} />
              <span>Repasses</span>
            </button>
            <button type="button" onClick={() => openHubPage('finance-cashflow', 'Fluxo de Caixa')}>
              <LineChart size={15} />
              <span>Fluxo de Caixa</span>
            </button>
            <button type="button" onClick={() => openHubPage('finance-reconciliation', 'Conciliação')}>
              <GitCompareArrows size={15} />
              <span>Conciliação</span>
            </button>
            <button type="button" onClick={() => openHubPage('finance-reports', 'Relatórios')}>
              <FileSpreadsheet size={15} />
              <span>Relatórios</span>
            </button>
          </FinanceOptionCarousel>
        </div>

        {error && (
          <div className="card p-3 mb-4 bg-amber-500/10 border-l-4 border-l-amber-500 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 6 KPI Cards no Padrão V7 DiskKpiCard */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
          <DiskKpiCard
            icon={<WalletCards size={18} />}
            label="Saldo disponível"
            value={brl(summary?.availableBalanceCents)}
            note="Disponível para repasse"
            accent="info"
            onClick={() => navigateWithFinanceDrilldown(onNavigate, 'finance', { eventName: selectedEventName, source: 'finance-dashboard', label: 'Saldo disponível' })}
          />
          <DiskKpiCard
            icon={<Clock3 size={18} />}
            label="Saldo futuro"
            value={brl(summary?.futureBalanceCents)}
            note="Recebíveis previstos"
            accent="success"
            onClick={() => navigateWithFinanceDrilldown(onNavigate, 'finance-receivables', { status: 'open', eventName: selectedEventName, source: 'finance-dashboard', label: 'Saldo futuro' })}
          />
          <DiskKpiCard
            icon={<BanknoteArrowUp size={18} />}
            label="A pagar"
            value={brl(summary?.payablesCents)}
            note="Obrigações em aberto"
            accent="warning"
            onClick={() => navigateWithFinanceDrilldown(onNavigate, 'finance-payables', { status: 'open', eventName: selectedEventName, source: 'finance-dashboard', label: 'A pagar' })}
          />
          <DiskKpiCard
            icon={<HandCoins size={18} />}
            label="Repasses pendentes"
            value={brl(summary?.pendingPayoutsCents)}
            note={`${summary?.pendingPayoutsCount || 0} solicitação(ões)`}
            accent="primary"
            onClick={() => navigateWithFinanceDrilldown(onNavigate, 'finance-payouts', { status: 'pending', eventName: selectedEventName, source: 'finance-dashboard', label: 'Repasses pendentes' })}
          />
          <DiskKpiCard
            icon={<Percent size={18} />}
            label="Margem média Spread"
            value={`${((summary?.avgMarginBps || 0) / 100).toFixed(2)}%`}
            note={`${summary?.spreadSimulations || 0} simulações`}
            accent="sky"
            onClick={() => navigateWithFinanceDrilldown(onNavigate, 'finance-spread', { eventName: selectedEventName, source: 'finance-dashboard', label: 'Margem média Spread' })}
          />
          <DiskKpiCard
            icon={<AlertTriangle size={18} />}
            label="Divergências"
            value={String(summary?.divergences ?? 0)}
            note="Exigem conciliação"
            accent="danger"
            onClick={() => navigateWithFinanceDrilldown(onNavigate, 'finance-reconciliation', { status: 'divergent', eventName: selectedEventName, source: 'finance-dashboard', label: 'Divergências' })}
          />
        </section>

        {/* Health Links em Cards Limitless */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <HealthLink page="finance-gateways" onNavigate={onNavigate}>
            <Activity className="w-4 h-4 text-emerald-500" />
            <span><b>{summary?.activeGateways || 0}</b> gateways</span>
          </HealthLink>
          <HealthLink page="finance-operators" onNavigate={onNavigate}>
            <ShieldCheck className="w-4 h-4 text-sky-500" />
            <span><b>{summary?.activeAcquirers || 0}</b> adquirentes</span>
          </HealthLink>
          <HealthLink page="finance-methods" onNavigate={onNavigate}>
            <CreditCard className="w-4 h-4 text-[#FF8047]" />
            <span><b>{summary?.methods || 0}</b> métodos</span>
          </HealthLink>
          <HealthLink page="finance-refunds" onNavigate={onNavigate}>
            <Undo2 className="w-4 h-4 text-rose-500" />
            <span><b>{brl(summary?.refundsCents)}</b> estornos</span>
          </HealthLink>
          <HealthLink page="finance-receivables" onNavigate={onNavigate} status="open" eventName={selectedEventName}>
            <CircleDollarSign className="w-4 h-4 text-emerald-500" />
            <span><b>{brl(summary?.receivablesCents)}</b> recebíveis</span>
          </HealthLink>
        </section>

        {/* Busca */}
        <DiskCard className="p-2.5 shadow-xs mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ll-text-muted)]" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar função financeira..."
              className="form-control w-full pl-10 pr-4 text-xs sm:text-sm"
            />
          </div>
        </DiskCard>

        {/* Seções de Atalhos */}
        <div className="space-y-6">
          {groups.map(
            g =>
              g.items.length > 0 && (
                <DiskCard className="p-4 shadow-xs" key={g.title}>
                  <div className="border-0 px-0 pt-0 pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-[var(--disk-text-primary,#0f172a)]">{g.title}</h2>
                      <p className="text-xs text-[var(--disk-text-muted,#64748b)]">{g.subtitle}</p>
                    </div>
                    <span className="badge badge-subtle-primary">{g.items.length} funções</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {g.items.map(i => (
                      <Card key={i.title} item={i} onNavigate={onNavigate} />
                    ))}
                  </div>
                </DiskCard>
              )
          )}
        </div>

        {/* Footer Informativo */}
        <section className="card p-4 bg-[var(--ll-muted)] border border-[var(--ll-border)] shadow-xs mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <strong className="text-xs font-bold text-[var(--ll-text)] block">
              Financeiro e Contabilidade agora são separados
            </strong>
            <span className="text-xs text-[var(--ll-text-muted)]">
              Financeiro cuida do dinheiro e liquidações; Contabilidade cuida da escrituração e demonstrações.
            </span>
          </div>
          <button
            onClick={() => onNavigate('accounting-dashboard')}
            className="btn-light text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span>Abrir Dashboard Contábil</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      </div>
    </LimitlessPage>
  )
}



function HealthLink({
  page,
  onNavigate,
  children,
  status,
  eventName
}: {
  page: PageKey
  onNavigate: (p: PageKey) => void
  children: any
  status?: string
  eventName?: string
}) {
  const open = () => navigateWithFinanceDrilldown(onNavigate, page, { status, eventName, source: 'finance-dashboard' })
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open()
        }
      }}
      className="card p-2.5 flex items-center gap-2 text-xs font-semibold text-[var(--ll-text-2)] hover:text-[var(--ll-text)] hover:shadow-xs transition cursor-pointer"
    >
      {children}
    </div>
  )
}

function Card({ item, onNavigate }: { item: Shortcut; onNavigate: (p: PageKey) => void }) {
  const Icon = item.icon
  return (
    <button
      className="card p-3 text-left hover:shadow-md transition flex items-center justify-between gap-3 cursor-pointer group"
      onClick={() => onNavigate(item.page)}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-[var(--ll-muted)] group-hover:bg-[var(--ll-primary)]/10 text-[var(--ll-primary)] flex items-center justify-center shrink-0 transition">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <strong className="text-xs font-bold text-[var(--ll-text)] group-hover:text-[var(--ll-primary)] transition block truncate">
            {item.title}
          </strong>
          <small className="text-[11px] text-[var(--ll-text-muted)] block truncate">{item.desc}</small>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-[var(--ll-text-muted)] group-hover:text-[var(--ll-primary)] group-hover:translate-x-0.5 transition shrink-0" />
    </button>
  )
}

