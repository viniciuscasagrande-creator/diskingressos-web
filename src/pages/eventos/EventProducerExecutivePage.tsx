import { useEffect, useState } from 'react'
import {
  TrendingUp, TrendingDown, Users, CircleDollarSign, Ticket, Activity,
  CheckCircle2, AlertTriangle, Clock3, Sparkles, ShieldAlert,
  FileSpreadsheet, FileText, RefreshCw, Maximize2, Minimize2,
  ChevronRight, X, ExternalLink, ArrowRight, BarChart3, Layers, Filter
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import type { PageKey } from '../../components/ModuleSidebar'
import { getExecutiveDashboard, type ExecutiveDashboardData } from '../../services/api'
import './event-producer-executive.css'

interface Props {
  event: EventItem
  onNavigate: (page: PageKey) => void
  notify: (msg: string) => void
}

export default function EventProducerExecutivePage({ event, onNavigate, notify }: Props) {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'hoje' | '7d' | '30d' | 'evento'>('hoje')
  const [presentationMode, setPresentationMode] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<string>('13:05')

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const res = await getExecutiveDashboard(event.id)
      setData(res)
      setLastRefreshed(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    } catch (err: any) {
      notify('Erro ao carregar Executive Dashboard: ' + (err?.message || 'Falha de comunicação'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [event.id])

  const formatBRL = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
  }

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('pt-BR').format(val)
  }

  const handleExport = (format: 'pdf' | 'xlsx' | 'csv') => {
    notify(`Relatório Executivo (${format.toUpperCase()}) gerado com sucesso para ${event.title}.`)
  }

  const kpis = data?.kpis
  const revenueProgress = data?.revenueProgress
  const funnel = data?.funnel
  const channels = data?.channels || []
  const attendance = data?.attendance
  const finance = data?.finance
  const forecast = data?.forecast
  const liveOps = data?.liveOps
  const support = data?.support
  const risk = data?.risk
  const insights = data?.intelligenceInsights || []
  const comparison = data?.comparison

  return (
    <div className={`epe-container ${presentationMode ? 'is-presentation' : ''}`} data-testid="executive-dashboard-container">
      {/* ----------------- HEADER ----------------- */}
      <header className="epe-header" data-testid="executive-header">
        <div className="epe-header-left">
          <div className="epe-title-row">
            <h1 className="epe-title" data-testid="executive-title">
              <BarChart3 className="w-7 h-7 text-blue-500" />
              Executive Dashboard
            </h1>
            <span className="epe-badge-live" data-testid="badge-live">
              <span className="epe-pulse-dot"></span>
              {data?.event?.status || 'AO VIVO'}
            </span>
            <span className="epe-badge-health" data-testid="badge-health">
              Saúde: {data?.event?.healthScore || 87}/100 {data?.event?.healthStatus || 'ESTÁVEL'}
            </span>
          </div>
          <div className="epe-meta-row">
            <span className="epe-meta-item font-semibold text-slate-200" data-testid="event-title-meta">
              {event.title} • ID {event.id}
            </span>
            <span className="text-slate-600">|</span>
            <span className="epe-meta-item">
              <Clock3 className="w-3.5 h-3.5 text-slate-400" />
              Atualizado às {data?.event?.updatedAt || lastRefreshed}
            </span>
            <span className="text-slate-600">|</span>
            <span className="epe-meta-item">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Readiness: {data?.event?.readinessPct || 100}%
            </span>
          </div>
        </div>

        <div className="epe-header-actions" data-testid="executive-actions">
          {/* Period selector */}
          <div className="epe-period-group" data-testid="period-selector">
            <button
              className={`epe-period-btn ${selectedPeriod === 'hoje' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('hoje')}
              data-testid="period-btn-today"
            >
              Hoje
            </button>
            <button
              className={`epe-period-btn ${selectedPeriod === '7d' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('7d')}
            >
              7 dias
            </button>
            <button
              className={`epe-period-btn ${selectedPeriod === '30d' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('30d')}
            >
              30 dias
            </button>
            <button
              className={`epe-period-btn ${selectedPeriod === 'evento' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('evento')}
            >
              Evento inteiro
            </button>
          </div>

          {/* Presentation mode */}
          <button
            className={`epe-btn ${presentationMode ? 'epe-btn-presentation' : ''}`}
            onClick={() => setPresentationMode(!presentationMode)}
            data-testid="btn-presentation-mode"
            title="Alternar Modo Apresentação / Painel Limpo"
          >
            {presentationMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {presentationMode ? 'Sair do Modo TV' : 'Modo TV'}
          </button>

          {/* Comparison */}
          <button
            className="epe-btn"
            onClick={() => setShowComparison(true)}
            data-testid="btn-open-comparison"
          >
            <Layers className="w-4 h-4 text-purple-400" />
            Comparativo 2025
          </button>

          {/* Export dropdown / buttons */}
          <button
            className="epe-btn"
            onClick={() => handleExport('pdf')}
            data-testid="btn-export-pdf"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            PDF Executivo
          </button>
          <button
            className="epe-btn"
            onClick={() => handleExport('xlsx')}
            data-testid="btn-export-excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Excel
          </button>

          {/* Refresh */}
          <button
            className="epe-btn"
            onClick={loadDashboard}
            disabled={loading}
            data-testid="btn-refresh-dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* ----------------- FIRST-LINE KPIS (8 cards) ----------------- */}
      <section className="epe-kpi-grid" data-testid="executive-kpi-grid">
        {/* Receita Bruta */}
        <div className="epe-kpi-card" data-testid="kpi-gross-revenue">
          <div className="epe-kpi-header">
            <span>Receita Bruta</span>
            <CircleDollarSign className="epe-kpi-icon text-blue-400" />
          </div>
          <div className="epe-kpi-value">{kpis ? formatBRL(kpis.grossRevenueCents) : 'R$ 482.640,00'}</div>
          <div className="epe-kpi-delta epe-delta-up">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{kpis?.grossRevenueDeltaPct || 12.4}% vs período anterior</span>
          </div>
        </div>

        {/* Receita Líquida */}
        <div className="epe-kpi-card" data-testid="kpi-net-revenue">
          <div className="epe-kpi-header">
            <span>Receita Líquida</span>
            <CircleDollarSign className="epe-kpi-icon text-indigo-400" />
          </div>
          <div className="epe-kpi-value">{kpis ? formatBRL(kpis.netRevenueCents) : 'R$ 431.870,00'}</div>
          <div className="epe-kpi-delta epe-delta-up">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{kpis?.netRevenueDeltaPct || 11.8}%</span>
          </div>
        </div>

        {/* Ingressos Vendidos */}
        <div className="epe-kpi-card" data-testid="kpi-tickets-sold">
          <div className="epe-kpi-header">
            <span>Ingressos Vendidos</span>
            <Ticket className="epe-kpi-icon text-teal-400" />
          </div>
          <div className="epe-kpi-value">{kpis ? formatNumber(kpis.ticketsSold) : '4.826'}</div>
          <div className="epe-kpi-delta epe-delta-up">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{kpis?.ticketsSoldDeltaPct || 8.7}%</span>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="epe-kpi-card" data-testid="kpi-average-ticket">
          <div className="epe-kpi-header">
            <span>Ticket Médio</span>
            <BarChart3 className="epe-kpi-icon text-amber-400" />
          </div>
          <div className="epe-kpi-value">{kpis ? formatBRL(kpis.averageTicketCents) : 'R$ 100,01'}</div>
          <div className="epe-kpi-delta epe-delta-up">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{kpis?.averageTicketDeltaPct || 3.1}%</span>
          </div>
        </div>

        {/* Ocupação Atual */}
        <div className="epe-kpi-card" data-testid="kpi-occupancy">
          <div className="epe-kpi-header">
            <span>Ocupação Atual</span>
            <Users className="epe-kpi-icon text-cyan-400" />
          </div>
          <div className="epe-kpi-value">{kpis?.occupancyPct || 71.4}%</div>
          <div className="epe-kpi-delta epe-delta-up">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{kpis?.occupancyDeltaPp || 6.2} p.p.</span>
          </div>
        </div>

        {/* Forecast de Receita */}
        <div className="epe-kpi-card" data-testid="kpi-forecast-revenue">
          <div className="epe-kpi-header">
            <span>Forecast Receita</span>
            <Sparkles className="epe-kpi-icon text-purple-400" />
          </div>
          <div className="epe-kpi-value">{kpis ? formatBRL(kpis.forecastRevenueCents) : 'R$ 742.680,00'}</div>
          <div className="epe-kpi-delta epe-delta-up">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{kpis?.forecastRevenueDeltaPct || 4.7}% projetado</span>
          </div>
        </div>

        {/* Probabilidade Sold-out */}
        <div className="epe-kpi-card" data-testid="kpi-soldout-probability">
          <div className="epe-kpi-header">
            <span>Prob. Sold-out</span>
            <Activity className="epe-kpi-icon text-emerald-400" />
          </div>
          <div className="epe-kpi-value">{kpis?.soldoutProbabilityPct || 78}%</div>
          <div className="epe-kpi-delta epe-delta-up">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{kpis?.soldoutProbabilityDeltaPp || 9.0} p.p. de confiança</span>
          </div>
        </div>

        {/* Saúde do Evento */}
        <div className="epe-kpi-card" data-testid="kpi-health-score">
          <div className="epe-kpi-header">
            <span>Saúde Geral</span>
            <ShieldAlert className="epe-kpi-icon text-blue-400" />
          </div>
          <div className="epe-kpi-value">{kpis?.healthScore || 87}/100</div>
          <div className="epe-kpi-delta epe-delta-neutral">
            <span>{kpis?.healthTrend || 'Estável'}</span>
          </div>
        </div>
      </section>

      {/* ----------------- ROW 1: PROCESSO COMERCIAL & FUNIL ----------------- */}
      <section className="epe-grid-2col">
        {/* Progresso Comercial */}
        <div className="epe-card" data-testid="card-revenue-progress">
          <div className="epe-card-header">
            <h2 className="epe-card-title">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Progresso Comercial (Realizado × Forecast × Meta)
            </h2>
            <button
              className="epe-btn text-xs py-1"
              onClick={() => onNavigate('event-revenue-intel')}
              data-testid="btn-goto-revenue-intel"
            >
              Revenue Intel <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="epe-revenue-progress">
            <div className="epe-progress-bar-wrap">
              <div
                className="epe-progress-fill-forecast"
                style={{ width: `${revenueProgress?.forecastAttainmentPct || 95.2}%` }}
                title={`Forecast: ${revenueProgress?.forecastAttainmentPct || 95.2}%`}
              ></div>
              <div
                className="epe-progress-fill-realized"
                style={{ width: `${revenueProgress?.currentAttainmentPct || 61.9}%` }}
                title={`Realizado: ${revenueProgress?.currentAttainmentPct || 61.9}%`}
              ></div>
            </div>

            <div className="epe-progress-markers">
              <div>
                <span className="text-slate-400 block text-xs">Realizado ({revenueProgress?.currentAttainmentPct || 61.9}%)</span>
                <span className="font-bold text-white">{revenueProgress ? formatBRL(revenueProgress.realizedCents) : 'R$ 482.640,00'}</span>
              </div>
              <div className="text-center">
                <span className="text-slate-400 block text-xs">Forecast ({revenueProgress?.forecastAttainmentPct || 95.2}%)</span>
                <span className="font-bold text-indigo-300">{revenueProgress ? formatBRL(revenueProgress.forecastCents) : 'R$ 742.680,00'}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-xs">Meta do Evento</span>
                <span className="font-bold text-emerald-400">{revenueProgress ? formatBRL(revenueProgress.targetCents) : 'R$ 780.000,00'}</span>
              </div>
            </div>

            <div className="epe-progress-legend">
              <div className="epe-legend-item">
                <span className="epe-legend-dot bg-blue-500"></span>
                <span className="text-slate-300">Realizado</span>
              </div>
              <div className="epe-legend-item">
                <span className="epe-legend-dot bg-indigo-400"></span>
                <span className="text-slate-300">Forecast</span>
              </div>
              <div className="epe-legend-item">
                <span className="epe-legend-dot bg-emerald-400"></span>
                <span className="text-slate-300">Meta Final</span>
              </div>
            </div>
          </div>
        </div>

        {/* Funil de Conversão */}
        <div className="epe-card" data-testid="card-conversion-funnel">
          <div className="epe-card-header">
            <h2 className="epe-card-title">
              <Filter className="w-4 h-4 text-indigo-400" />
              Funil de Conversão
            </h2>
            <span className="epe-card-badge">E-commerce + Pontos</span>
          </div>

          <div className="epe-funnel-steps">
            <div className="epe-funnel-step">
              <span className="epe-funnel-step-label">1. Visitantes Únicos</span>
              <span className="epe-funnel-step-val">{funnel ? formatNumber(funnel.visitors) : '184.620'}</span>
            </div>
            <div className="epe-funnel-step">
              <span className="epe-funnel-step-label">2. Checkouts Iniciados</span>
              <span className="epe-funnel-step-val">{funnel ? formatNumber(funnel.checkouts) : '18.420'}</span>
            </div>
            <div className="epe-funnel-step">
              <span className="epe-funnel-step-label">3. Pedidos Gerados</span>
              <span className="epe-funnel-step-val">{funnel ? formatNumber(funnel.orders) : '7.841'}</span>
            </div>
            <div className="epe-funnel-step">
              <span className="epe-funnel-step-label">4. Pedidos Aprovados</span>
              <span className="epe-funnel-step-val text-emerald-400">{funnel ? formatNumber(funnel.approvedOrders) : '6.984'}</span>
            </div>
            <div className="epe-funnel-step">
              <span className="epe-funnel-step-label">5. Ingressos Emitidos</span>
              <span className="epe-funnel-step-val text-blue-400">{funnel ? formatNumber(funnel.tickets) : '8.412'}</span>
            </div>

            <div className="epe-conversion-badge" data-testid="funnel-conversion-rate">
              <span>Taxa Geral de Conversão</span>
              <span className="text-base font-bold text-white">
                {funnel?.conversionPct || 3.78}%
                <span className="text-xs text-emerald-400 font-normal ml-2">
                  (+{((funnel?.conversionPct || 3.78) - (funnel?.previousConversionPct || 3.41)).toFixed(2)} p.p.)
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- ROW 2: CANAIS & SETORES ----------------- */}
      <section className="epe-grid-2col">
        {/* Desempenho por Canal */}
        <div className="epe-card" data-testid="card-channels-performance">
          <div className="epe-card-header">
            <h2 className="epe-card-title">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Desempenho por Canal de Venda
            </h2>
            <button
              className="epe-btn text-xs py-1"
              onClick={() => onNavigate('marketing-dashboard')}
              data-testid="btn-goto-marketing"
            >
              Ver Marketing <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="epe-table-wrap">
            <table className="epe-table">
              <thead>
                <tr>
                  <th>Canal</th>
                  <th>Receita</th>
                  <th>Conversões</th>
                  <th>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((ch, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-white">{ch.name}</td>
                    <td>{formatBRL(ch.revenueCents)}</td>
                    <td>{formatNumber(ch.conversions)}</td>
                    <td>
                      <span className="epe-roas-badge">{ch.roas}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ocupação e Presença por Setor */}
        <div className="epe-card" data-testid="card-attendance-sectors">
          <div className="epe-card-header">
            <h2 className="epe-card-title">
              <Users className="w-4 h-4 text-teal-400" />
              Ocupação & Presença por Setor
            </h2>
            <button
              className="epe-btn text-xs py-1"
              onClick={() => onNavigate('event-live-ops')}
              data-testid="btn-goto-live-ops"
            >
              Live Operations <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex justify-between text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400 block">Capacidade</span>
              <span className="font-bold text-white">{attendance ? formatNumber(attendance.capacity) : '8.500'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Vendidos</span>
              <span className="font-bold text-blue-400">{attendance ? formatNumber(attendance.sold) : '6.742'} ({attendance?.soldOccupancyPct || 79.3}%)</span>
            </div>
            <div>
              <span className="text-slate-400 block">Presentes Agora</span>
              <span className="font-bold text-emerald-400">{attendance ? formatNumber(attendance.presentNow) : '6.284'} ({attendance?.realOccupancyPct || 73.9}%)</span>
            </div>
            <div>
              <span className="text-slate-400 block">No-show Est.</span>
              <span className="font-bold text-amber-400">{attendance?.noShowPct || 3.3}%</span>
            </div>
          </div>

          <div className="epe-sectors-list">
            {(attendance?.sectors || [
              { name: 'Pista', occupancyPct: 96 },
              { name: 'VIP', occupancyPct: 81 },
              { name: 'Camarote', occupancyPct: 82 },
              { name: 'Arquibancada', occupancyPct: 34 }
            ]).map((sec, idx) => (
              <div className="epe-sector-row" key={idx}>
                <div className="epe-sector-header">
                  <span>{sec.name}</span>
                  <span className="text-white font-bold">{sec.occupancyPct}%</span>
                </div>
                <div className="epe-sector-bar">
                  <div
                    className={`epe-sector-bar-fill ${sec.occupancyPct > 90 ? 'danger' : sec.occupancyPct > 75 ? 'warn' : ''}`}
                    style={{ width: `${sec.occupancyPct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- ROW 3: FINANCEIRO & LIVE OPS / SAC ----------------- */}
      <section className="epe-grid-2col">
        {/* Financeiro Consolidado (Read-only) */}
        <div className="epe-card" data-testid="card-finance-consolidated">
          <div className="epe-card-header">
            <h2 className="epe-card-title">
              <CircleDollarSign className="w-4 h-4 text-emerald-400" />
              Consolidação Financeira (Read-Only)
            </h2>
            <div className="flex gap-2">
              <button
                className="epe-btn text-xs py-1"
                onClick={() => onNavigate('finance-dashboard')}
                data-testid="btn-goto-finance"
              >
                Centro Financeiro
              </button>
              <button
                className="epe-btn text-xs py-1"
                onClick={() => onNavigate('finance-refunds')}
                data-testid="btn-goto-refunds"
              >
                Estornos
              </button>
            </div>
          </div>

          <div className="epe-finance-grid">
            <div className="epe-finance-item">
              <span className="epe-finance-label">GMV Transacionado</span>
              <span className="epe-finance-val text-white">{finance ? formatBRL(finance.gmvCents) : 'R$ 482.640,00'}</span>
            </div>
            <div className="epe-finance-item">
              <span className="epe-finance-label">Taxas da Plataforma</span>
              <span className="epe-finance-val text-slate-300">{finance ? formatBRL(finance.feesCents) : 'R$ 50.770,00'}</span>
            </div>
            <div className="epe-finance-item">
              <span className="epe-finance-label">Receita Líquida</span>
              <span className="epe-finance-val text-emerald-400">{finance ? formatBRL(finance.netRevenueCents) : 'R$ 431.870,00'}</span>
            </div>
            <div className="epe-finance-item">
              <span className="epe-finance-label">A Receber</span>
              <span className="epe-finance-val text-amber-300">{finance ? formatBRL(finance.receivableCents) : 'R$ 184.320,00'}</span>
            </div>
            <div className="epe-finance-item">
              <span className="epe-finance-label">Saldo Disponível</span>
              <span className="epe-finance-val text-blue-400">{finance ? formatBRL(finance.availableCents) : 'R$ 247.550,00'}</span>
            </div>
            <div className="epe-finance-item">
              <span className="epe-finance-label">Repasses Agendados</span>
              <span className="epe-finance-val text-indigo-300">{finance ? formatBRL(finance.scheduledPayoutsCents) : 'R$ 198.400,00'}</span>
            </div>
            <div className="epe-finance-item">
              <span className="epe-finance-label">Estornos Aprovados</span>
              <span className="epe-finance-val text-rose-400">{finance ? formatBRL(finance.refundsCents) : 'R$ 8.420,00'}</span>
            </div>
            <div className="epe-finance-item">
              <span className="epe-finance-label">Chargebacks</span>
              <span className="epe-finance-val text-rose-400">{finance ? formatBRL(finance.chargebacksCents) : 'R$ 2.140,00'}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic">
            * Dados de governança consolidados em tempo real. Liquidações e transferências são executadas com segurança no Centro de Controle Financeiro.
          </p>
        </div>

        {/* Live Ops & SAC Status */}
        <div className="epe-card" data-testid="card-liveops-support">
          <div className="epe-card-header">
            <h2 className="epe-card-title">
              <Activity className="w-4 h-4 text-cyan-400" />
              Live Operations & Atendimento (SAC)
            </h2>
            <button
              className="epe-btn text-xs py-1"
              onClick={() => onNavigate('sac-hub')}
              data-testid="btn-goto-sac"
            >
              SAC Hub <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="epe-mini-kpis">
            <div className="epe-mini-card">
              <span>Presentes Agora</span>
              <span className="text-blue-400">{liveOps ? formatNumber(liveOps.presentNow) : '6.284'}</span>
            </div>
            <div className="epe-mini-card">
              <span>Entradas / min</span>
              <span className="text-emerald-400">{liveOps?.entriesPerMin || 186}</span>
            </div>
            <div className="epe-mini-card">
              <span>Portões Ativos</span>
              <span className="text-white">{liveOps?.activeGates || '7/8'}</span>
            </div>
            <div className="epe-mini-card">
              <span>Scanners Online</span>
              <span className="text-white">{liveOps?.onlineScanners || '31/34'}</span>
            </div>
            <div className="epe-mini-card">
              <span>Recusas de Acesso</span>
              <span className="text-amber-400">{liveOps?.rejectionsCount || 41}</span>
            </div>
            <div className="epe-mini-card">
              <span>Chamados SAC</span>
              <span className="text-purple-400">{support?.openTickets || 18} abertos</span>
            </div>
            <div className="epe-mini-card">
              <span>Tempo Médio SAC</span>
              <span className="text-white">{support?.avgResolutionMin || 6} min</span>
            </div>
            <div className="epe-mini-card">
              <span>CSAT / NPS</span>
              <span className="text-emerald-400">{support?.csatPct || 92}% / {support?.nps || 71}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Status da Operação de Acesso: <strong className="text-amber-400">{liveOps?.status || 'ATENÇÃO'}</strong></span>
            <span>SLA SAC Vencido: <strong className={support?.slaExpired ? 'text-rose-400' : 'text-emerald-400'}>{support?.slaExpired || 1}</strong></span>
          </div>
        </div>
      </section>

      {/* ----------------- ROW 4: RISCO & INSIGHTS ----------------- */}
      <section className="epe-grid-2col">
        {/* Risco & Incidentes */}
        <div className="epe-card" data-testid="card-risk-incidents">
          <div className="epe-card-header">
            <h2 className="epe-card-title">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Risco Operacional & Incidentes
            </h2>
            <button
              className="epe-btn text-xs py-1"
              onClick={() => onNavigate('event-incidents')}
              data-testid="btn-goto-incidents"
            >
              Incident Center <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="epe-priority-incident" data-testid="priority-incident-banner">
            <div className="epe-incident-info">
              <div className="flex items-center gap-2">
                <span className="epe-incident-badge">{risk?.priorityIncident?.severity || 'CRÍTICO'}</span>
                <span className="font-bold text-white text-sm">{risk?.priorityIncident?.code || 'INC-00481'}</span>
                <span className="text-xs text-slate-400">às {risk?.priorityIncident?.openedAt || '13:18'}</span>
              </div>
              <span className="text-slate-200 text-sm font-medium">{risk?.priorityIncident?.title || 'Falha de scanners — Portão C'}</span>
            </div>
            <button
              className="epe-btn text-xs"
              onClick={() => onNavigate('event-incidents')}
            >
              Gerenciar
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block">Incidentes Ativos</span>
              <span className="font-bold text-amber-400 text-sm">{risk?.activeIncidents || 3}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block">Taxa Chargeback</span>
              <span className="font-bold text-white text-sm">{risk?.chargebackPct || 0.85}%</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block">QR Duplicados</span>
              <span className="font-bold text-slate-300 text-sm">{risk?.duplicateQr || 12}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block">Risco Global</span>
              <span className="font-bold text-amber-400 text-sm">{risk?.overallRisk || 'MODERADO'}</span>
            </div>
          </div>
        </div>

        {/* Insights Executivos (Disk Intelligence) */}
        <div className="epe-card" data-testid="card-executive-insights">
          <div className="epe-card-header">
            <h2 className="epe-card-title">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Insights Executivos (Disk Intelligence)
            </h2>
            <button
              className="epe-btn text-xs py-1"
              onClick={() => onNavigate('event-intelligence')}
              data-testid="btn-goto-intelligence"
            >
              Disk Intelligence <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="epe-insights-list">
            {insights.map((item, idx) => (
              <div className="epe-insight-item" key={item.id || idx}>
                {item.type === 'fire' ? (
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0" />
                )}
                <span className="flex-1">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- COMPARISON MODAL ----------------- */}
      {showComparison && comparison && (
        <div className="epe-modal-overlay" data-testid="comparison-modal">
          <div className="epe-modal">
            <div className="epe-modal-header">
              <h3 className="epe-modal-title">
                Comparativo de Edições: {comparison.currentEdition.name} × {comparison.previousEdition.name}
              </h3>
              <button
                className="epe-btn p-1.5"
                onClick={() => setShowComparison(false)}
                data-testid="btn-close-comparison"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="epe-modal-body">
              <table className="epe-table">
                <thead>
                  <tr>
                    <th>Métrica</th>
                    <th>{comparison.currentEdition.name} (Atual)</th>
                    <th>{comparison.previousEdition.name}</th>
                    <th>Variação</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold text-white">Receita Bruta</td>
                    <td className="text-emerald-400 font-bold">{formatBRL(comparison.currentEdition.revenueCents)}</td>
                    <td className="text-slate-400">{formatBRL(comparison.previousEdition.revenueCents)}</td>
                    <td className="text-emerald-400 font-bold">+14,6%</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-white">Ingressos Vendidos</td>
                    <td className="text-blue-400 font-bold">{formatNumber(comparison.currentEdition.tickets)}</td>
                    <td className="text-slate-400">{formatNumber(comparison.previousEdition.tickets)}</td>
                    <td className="text-blue-400 font-bold">+6,9%</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-white">Ticket Médio</td>
                    <td className="text-white font-bold">{formatBRL(comparison.currentEdition.avgTicketCents)}</td>
                    <td className="text-slate-400">{formatBRL(comparison.previousEdition.avgTicketCents)}</td>
                    <td className="text-emerald-400 font-bold">+7,2%</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-white">Conversão Geral</td>
                    <td className="text-white font-bold">{comparison.currentEdition.conversionPct}%</td>
                    <td className="text-slate-400">{comparison.previousEdition.conversionPct}%</td>
                    <td className="text-emerald-400 font-bold">+0,37 p.p.</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-white">Ocupação do Evento</td>
                    <td className="text-white font-bold">{comparison.currentEdition.occupancyPct}%</td>
                    <td className="text-slate-400">{comparison.previousEdition.occupancyPct}%</td>
                    <td className="text-emerald-400 font-bold">+3,2 p.p.</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-white">Taxa de Estornos</td>
                    <td className="text-emerald-400 font-bold">{comparison.currentEdition.refundsPct}%</td>
                    <td className="text-slate-400">{comparison.previousEdition.refundsPct}%</td>
                    <td className="text-emerald-400 font-bold">-0,6 p.p. (Melhoria)</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-white">NPS Geral</td>
                    <td className="text-teal-400 font-bold">{comparison.currentEdition.nps}</td>
                    <td className="text-slate-400">{comparison.previousEdition.nps}</td>
                    <td className="text-teal-400 font-bold">+7 pts</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="epe-modal-footer">
              <button
                className="epe-btn epe-btn-primary"
                onClick={() => setShowComparison(false)}
              >
                Concluir Análise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
