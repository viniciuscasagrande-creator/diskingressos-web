import React, { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Activity, AlertTriangle, BarChart3, CheckCircle2, CircleDollarSign, Clock3,
  CreditCard, DoorOpen, Megaphone, RefreshCw, RotateCcw, ShieldAlert, ShieldCheck,
  ShoppingCart, Ticket, Users, WalletCards, Waves, Undo2, Headphones, Zap,
  X, ChevronRight, ArrowUpRight, Eye
} from 'lucide-react'
import type { EventItem } from '../data/events'
import type { PageKey } from '../components/ModuleSidebar'
import EventActivityStreamPage from './eventos/EventActivityStreamPage'
import './event-command-center.css'

interface Props {
  event: EventItem
  onNavigate: (page: any) => void
  notify: (message: string) => void
}

type Period = 'today' | '7d' | '30d' | 'all'

interface CockpitData {
  release: string
  event: {
    id: number
    code: string
    title: string
    producerId: number
    producerName?: string
    status: string
    date?: string
  }
  systemStatus: {
    api: string
    database: string
    gateway: string
    lastSync: string
  }
  period: string
  kpis: {
    revenueCents: number
    ordersCount: number
    ticketsSold: number
    inventoryAvailable: number
    courtesyCount: number
    occupancy: number
    averageTicketCents: number
    conversionRate: number
    checkinsCount: number
    refundsCount: number
    abandonedCartsCount: number
    openIncidentsCount: number
  }
  inventorySummary: {
    capacity: number
    sold: number
    available: number
    occupancy: number
    lots: Array<{
      id: number
      name: string
      sector: string
      sold: number
      capacity: number
      priceCents: number
      occupancy: number
      status: 'CRÍTICO' | 'ATENÇÃO' | 'NORMAL'
    }>
  }
  financialSummary: {
    grossSalesCents: number
    feesCents: number
    refundsCents: number
    netRevenueCents: number
    receivablesCents: number
  }
  marketingSummary: {
    roas: number
    ctr: string
    cpaCents: number
    conversions: number
    abandonedCarts: number
    recoverableCents: number
    recoveredCents: number
    activeCoupons: number
    totalCampaigns: number
    activeCampaigns: number
  }
  eventDay: {
    isToday: boolean
    peopleInside: number
    checkinsLastHour: number
    checkinsPerMinute: number
    activeGates: number
    rejectedTickets: number
    openIncidents: number
    boxOfficeSales: number
  }
  alerts: Array<{ code: string; severity: 'critical' | 'warning' | 'info'; title: string; message: string }>
  trend: Array<{
    hour: string
    label: string
    orders: number
    revenueCents: number
    ordersList: Array<{ code: string; buyerName: string; grossCents: number; paymentMethod: string }>
  }>
  activity: Array<{
    id: string
    type: 'sale' | 'ticket' | 'checkin' | 'refund' | 'incident' | 'sac'
    occurredAt: string
    title: string
    detail: string
    status: string
    amountCents?: number
    severity: 'success' | 'warning' | 'info' | 'critical'
    actionLabel: string
    actionTarget: string
  }>
}

const formatMoney = (cents = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

const formatTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'

export default function EventCommandCenterPage({ event, onNavigate, notify }: Props) {
  const [data, setData] = useState<CockpitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [period, setPeriod] = useState<Period>('all')
  const [viewMode, setViewMode] = useState<'cockpit' | 'timeline'>('cockpit')
  const [drilldownHour, setDrilldownHour] = useState<CockpitData['trend'][0] | null>(null)

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const token = typeof window !== 'undefined'
        ? sessionStorage.getItem('disk_token:server') || localStorage.getItem('disk_token:server') || ''
        : ''
      const res = await fetch(`/api/events/${event.id}/cockpit?period=${period}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!res.ok) {
        throw new Error('Falha ao carregar Cockpit 360.')
      }
      const json = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar dados operacionais.')
    } finally {
      setLoading(false)
    }
  }, [event.id, period])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!autoRefresh) return
    const timer = window.setInterval(() => loadData(true), 15000)
    return () => window.clearInterval(timer)
  }, [autoRefresh, loadData])

  const k = data?.kpis
  const inv = data?.inventorySummary
  const fin = data?.financialSummary
  const mkt = data?.marketingSummary
  const ed = data?.eventDay

  return (
    <div className="event-os-page" data-release="26.16.2-cockpit-360-operacional-2026-09-04" data-testid="cockpit-360-container">
      {/* Hero Header */}
      <section className="event-os-hero event-os-hero-261">
        <div>
          <p className="eyebrow">EVENT OS · FASE 26.16.2</p>
          <h2>Event Cockpit 360 Operacional</h2>
          <p>{event.title} · Painel de comando operacional completo em tempo real.</p>
        </div>
        <div className="event-os-hero-actions">
          <div className="cockpit-indicators">
            <span className="cockpit-indicator-badge">API: OK</span>
            <span className="cockpit-indicator-badge">DB: Conectado</span>
            <span className="cockpit-indicator-badge">Gateway: Ativo</span>
          </div>
          <div className="event-os-live-state">
            <span className="event-os-live-dot" />
            <div>
              <strong>{autoRefresh ? 'Cockpit ao vivo' : 'Atualização pausada'}</strong>
              <small>Leitura: {formatTime(data?.systemStatus?.lastSync)}</small>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="event-os-alert" data-testid="cockpit-error-alert">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={() => loadData()}>Tentar novamente</button>
        </div>
      )}

      {/* Toolbar: Scope & Controls */}
      <section className="event-os-toolbar">
        <div>
          <span className="event-os-live-dot" />
          Evento: <strong>{event.code} · {event.title}</strong> (Produtora #{event.producerId})
        </div>
        <div className="event-os-toolbar-actions">
          {/* View Mode Tabs */}
          <div className="cockpit-period-tabs" data-testid="cockpit-view-tabs" style={{ marginRight: '6px' }}>
            <button
              type="button"
              className={`cockpit-period-btn ${viewMode === 'cockpit' ? 'active' : ''}`}
              onClick={() => setViewMode('cockpit')}
              data-testid="tab-cockpit-overview"
            >
              Visão Geral
            </button>
            <button
              type="button"
              className={`cockpit-period-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
              data-testid="tab-activity-stream"
            >
              Histórico de Atividades
            </button>
          </div>

          {/* Period Filter Tabs */}
          <div className="cockpit-period-tabs" data-testid="cockpit-period-tabs">
            <button
              type="button"
              className={`cockpit-period-btn ${period === 'today' ? 'active' : ''}`}
              onClick={() => setPeriod('today')}
              data-testid="period-today"
            >
              Hoje
            </button>
            <button
              type="button"
              className={`cockpit-period-btn ${period === '7d' ? 'active' : ''}`}
              onClick={() => setPeriod('7d')}
              data-testid="period-7d"
            >
              7 dias
            </button>
            <button
              type="button"
              className={`cockpit-period-btn ${period === '30d' ? 'active' : ''}`}
              onClick={() => setPeriod('30d')}
              data-testid="period-30d"
            >
              30 dias
            </button>
            <button
              type="button"
              className={`cockpit-period-btn ${period === 'all' ? 'active' : ''}`}
              onClick={() => setPeriod('all')}
              data-testid="period-all"
            >
              Evento completo
            </button>
          </div>

          <label className="event-os-toggle">
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
            <span />
            Auto-refresh 15s
          </label>
          <button
            className="btn secondary"
            onClick={() => { loadData(); notify('Cockpit 360 atualizado com sucesso!') }}
            disabled={loading}
            data-testid="cockpit-refresh-btn"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Atualizando...' : 'Atualizar agora'}
          </button>
        </div>
      </section>

      {/* Operational Shortcuts Bar */}
      <section className="cockpit-shortcuts-bar" data-testid="cockpit-shortcuts-bar">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Operação:</span>
        <button className="cockpit-shortcut-btn" onClick={() => onNavigate('event-tickets')} data-testid="shortcut-tickets">
          <Ticket size={14} /> Ver Pedidos
        </button>
        <button className="cockpit-shortcut-btn" onClick={() => onNavigate('event-customer-360')} data-testid="shortcut-customer360">
          <Users size={14} /> Customer 360
        </button>
        <button className="cockpit-shortcut-btn" onClick={() => onNavigate('event-inventory')} data-testid="shortcut-inventory">
          <BarChart3 size={14} /> Inventário
        </button>
        <button className="cockpit-shortcut-btn" onClick={() => onNavigate('finance-dashboard')} data-testid="shortcut-finance">
          <WalletCards size={14} /> Financeiro
        </button>
        <button className="cockpit-shortcut-btn" onClick={() => onNavigate('marketing-dashboard')} data-testid="shortcut-marketing">
          <Megaphone size={14} /> Marketing
        </button>
        <button className="cockpit-shortcut-btn" onClick={() => onNavigate('event-live-ops')} data-testid="shortcut-liveops">
          <DoorOpen size={14} /> Check-in
        </button>
        <button className="cockpit-shortcut-btn" onClick={() => onNavigate('sac-hub')} data-testid="shortcut-sac">
          <Headphones size={14} /> SAC
        </button>
        <button className="cockpit-shortcut-btn text-rose-700 bg-rose-50 border-rose-200" onClick={() => onNavigate('finance-refunds')} data-testid="shortcut-refunds">
          <Undo2 size={14} /> Estornos
        </button>
        <button className="cockpit-shortcut-btn text-sky-700 bg-sky-50 border-sky-200" onClick={() => setViewMode('timeline')} data-testid="shortcut-activity-stream">
          <Clock3 size={14} /> Histórico de Atividades
        </button>
      </section>

      {viewMode === 'timeline' ? (
        <EventActivityStreamPage event={event} onNavigate={onNavigate} notify={notify} />
      ) : (
        <>

      {/* Event Day Mode Banner */}
      {ed && (
        <section className="cockpit-eventday-banner" data-testid="cockpit-eventday-banner">
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Modo Dia do Evento</span>
            <h3 className="text-lg font-bold text-white mt-1">Operação de Portaria & Acesso ao Vivo</h3>
          </div>
          <div className="cockpit-eventday-stats">
            <div className="cockpit-eventday-stat">
              <strong>{ed.peopleInside}</strong>
              <span>No evento</span>
            </div>
            <div className="cockpit-eventday-stat">
              <strong>{ed.checkinsPerMinute}/min</strong>
              <span>Ritmo de entrada</span>
            </div>
            <div className="cockpit-eventday-stat">
              <strong>{ed.activeGates}</strong>
              <span>Portões ativos</span>
            </div>
            <div className="cockpit-eventday-stat">
              <strong className="text-rose-400">{ed.rejectedTickets}</strong>
              <span>Ingressos recusados</span>
            </div>
            <div className="cockpit-eventday-stat">
              <strong>{formatMoney(ed.boxOfficeSales)}</strong>
              <span>Vendas bilheteria</span>
            </div>
          </div>
          <button
            className="cockpit-shortcut-btn bg-sky-500 hover:bg-sky-600 text-white border-transparent"
            onClick={() => onNavigate('event-day-command')}
            data-testid="btn-open-event-day"
          >
            <Zap size={14} /> Abrir Event Day Command
          </button>
        </section>
      )}

      {/* 1. Visão Geral: 12 KPIs Executivos */}
      <section className="cockpit-12-kpis" data-testid="cockpit-12-kpis">
        <Kpi icon={CircleDollarSign} label="Receita total" value={formatMoney(k?.revenueCents)} note="Vendas faturadas" />
        <Kpi icon={CreditCard} label="Vendas" value={String(k?.ordersCount ?? 0)} note="Pedidos pagos" />
        <Kpi icon={Ticket} label="Ingressos vendidos" value={String(k?.ticketsSold ?? 0)} note="Emitidos na plataforma" />
        <Kpi icon={BarChart3} label="Disponíveis" value={String(k?.inventoryAvailable ?? 0)} note="Em estoque para venda" />
        <Kpi icon={Users} label="Cortesias" value={String(k?.courtesyCount ?? 0)} note="Ingressos promocionais" />
        <Kpi icon={BarChart3} label="Ocupação" value={`${(k?.occupancy ?? 0).toFixed(1)}%`} note="Capacidade total" />
        <Kpi icon={WalletCards} label="Ticket médio" value={formatMoney(k?.averageTicketCents)} note="Por pedido pago" />
        <Kpi icon={Zap} label="Conversão" value={`${(k?.conversionRate ?? 0).toFixed(1)}%`} note="Pedidos / Ingressos" />
        <Kpi icon={DoorOpen} label="Check-ins" value={String(k?.checkinsCount ?? 0)} note="Entradas validadas" />
        <Kpi icon={Undo2} label="Estornos" value={String(k?.refundsCount ?? 0)} note="Solicitações no período" />
        <Kpi icon={ShoppingCart} label="Carrinhos abandonados" value={String(k?.abandonedCartsCount ?? 0)} note="Oportunidades em aberto" />
        <Kpi icon={ShieldAlert} label="Incidentes ativos" value={String(k?.openIncidentsCount ?? 0)} note="Em monitoramento" />
      </section>

      {/* Grid: Tendência de Vendas (com Drill-down) + Alertas */}
      <section className="event-os-grid event-os-grid-261">
        <article className="event-os-panel event-os-span-2">
          <header>
            <div>
              <h3>Vendas & Receita em Tempo Real</h3>
              <p>Pedidos pagos e check-ins nas últimas 12 horas. Clique em uma coluna para ver os pedidos.</p>
            </div>
            <Activity size={20} />
          </header>
          <div className="event-os-trend" aria-label="Ritmo operacional">
            {(data?.trend || []).map(point => (
              <div
                className="event-os-trend-col"
                key={point.hour}
                title={`${point.label} · ${point.orders} vendas · ${formatMoney(point.revenueCents)} (Clique para abrir pedidos)`}
                onClick={() => setDrilldownHour(point)}
                data-testid={`trend-col-${point.label}`}
              >
                <div className="event-os-trend-bars">
                  <span className="sales" style={{ height: `${Math.max(8, (point.orders / 10) * 100)}%` }} />
                </div>
                <small>{point.label}</small>
              </div>
            ))}
          </div>
          <div className="event-os-trend-legend">
            <span><i className="sales" /> Vendas por hora</span>
            <small className="text-slate-400">Clique nas barras para detalhar os pedidos</small>
          </div>
        </article>

        {/* Alertas Operacionais */}
        <article className="event-os-panel" data-testid="cockpit-alerts-panel">
          <header>
            <div>
              <h3>Alertas Prioritários</h3>
              <p>Anomalias e ações que exigem atenção.</p>
            </div>
            <AlertTriangle size={20} />
          </header>
          <div className="event-os-alert-list">
            {(data?.alerts || []).map((item, i) => (
              <div key={`${item.code}-${i}`} className={`event-os-alert-row ${item.severity}`}>
                <span>{item.severity}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.message}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Grid: Inventário Resumido, Financeiro Resumido, Marketing */}
      <section className="event-os-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        {/* Inventário Resumido */}
        <article className="event-os-panel" data-testid="panel-inventory-summary">
          <header>
            <div>
              <h3>Inventário Resumido</h3>
              <p>Ocupação dos principais lotes.</p>
            </div>
            <button className="egs-action-btn" onClick={() => onNavigate('event-inventory')}>
              <Eye size={12} /> Ver inventário
            </button>
          </header>
          <div className="cockpit-inventory-list">
            {(inv?.lots || []).map(lot => (
              <div className="cockpit-lot-row" key={`lot-${lot.id}`}>
                <div className="cockpit-lot-header">
                  <span>{lot.name} ({lot.sector})</span>
                  <span className={lot.status === 'CRÍTICO' ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                    {lot.sold}/{lot.capacity} ({lot.occupancy.toFixed(0)}%)
                  </span>
                </div>
                <div className="cockpit-progress-bar">
                  <div
                    className={`cockpit-progress-fill ${lot.status === 'CRÍTICO' ? 'critical' : lot.status === 'ATENÇÃO' ? 'warning' : ''}`}
                    style={{ width: `${Math.min(100, lot.occupancy)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Financeiro Resumido */}
        <article className="event-os-panel" data-testid="panel-finance-summary">
          <header>
            <div>
              <h3>Financeiro Resumido</h3>
              <p>Balanço operacional do evento.</p>
            </div>
            <button className="egs-action-btn" onClick={() => onNavigate('finance-dashboard')}>
              <WalletCards size={12} /> Financeiro
            </button>
          </header>
          <div className="cockpit-finance-grid">
            <div className="cockpit-finance-item">
              <span>Vendas brutas</span>
              <strong>{formatMoney(fin?.grossSalesCents)}</strong>
            </div>
            <div className="cockpit-finance-item">
              <span>Taxas de processamento</span>
              <strong className="text-amber-600">-{formatMoney(fin?.feesCents)}</strong>
            </div>
            <div className="cockpit-finance-item">
              <span>Estornos</span>
              <strong className="text-rose-600">-{formatMoney(fin?.refundsCents)}</strong>
            </div>
            <div className="cockpit-finance-item">
              <span>Receita líquida</span>
              <strong className="text-emerald-700">{formatMoney(fin?.netRevenueCents)}</strong>
            </div>
            <div className="cockpit-finance-item" style={{ gridColumn: 'span 2' }}>
              <span>Previsão a receber (após retenções)</span>
              <strong>{formatMoney(fin?.receivablesCents)}</strong>
            </div>
          </div>
        </article>

        {/* Marketing & Recuperação Resumido */}
        <article className="event-os-panel" data-testid="panel-marketing-summary">
          <header>
            <div>
              <h3>Marketing & Conversão</h3>
              <p>Campanhas e carrinhos abandonados.</p>
            </div>
            <button className="egs-action-btn" onClick={() => onNavigate('marketing-dashboard')}>
              <Megaphone size={12} /> Marketing
            </button>
          </header>
          <div className="cockpit-marketing-grid">
            <div className="cockpit-marketing-item">
              <span>ROAS Estimado</span>
              <strong className="text-emerald-700">{mkt?.roas}x</strong>
            </div>
            <div className="cockpit-marketing-item">
              <span>Taxa de Cliques (CTR)</span>
              <strong>{mkt?.ctr}</strong>
            </div>
            <div className="cockpit-marketing-item">
              <span>Carrinhos recuperáveis</span>
              <strong>{mkt?.abandonedCarts} ({formatMoney(mkt?.recoverableCents)})</strong>
            </div>
            <div className="cockpit-marketing-item">
              <span>Receita recuperada</span>
              <strong className="text-emerald-700">{formatMoney(mkt?.recoveredCents)}</strong>
            </div>
            <div className="cockpit-marketing-item" style={{ gridColumn: 'span 2' }}>
              <span>Campanhas ativas</span>
              <strong>{mkt?.activeCampaigns} de {mkt?.totalCampaigns} ativas</strong>
            </div>
          </div>
        </article>
      </section>

      {/* Activity Stream com Ações Operacionais Reais */}
      <section className="event-os-panel" data-testid="cockpit-activity-stream">
        <header className="event-os-activity-header">
          <div>
            <h3>Histórico de Atividades</h3>
            <p>Ações e ocorrências em tempo real com links diretos para cada módulo.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="cockpit-stream-action-btn"
              onClick={() => setViewMode('timeline')}
              data-testid="nav-activity-stream"
            >
              Histórico de Atividades <ArrowUpRight size={10} />
            </button>
            <span className="text-xs text-slate-500 font-medium">Últimas operações</span>
          </div>
        </header>
        <div className="event-os-stream">
          {(data?.activity || []).map(item => (
            <div className={`event-os-stream-row ${item.severity}`} key={item.id} data-testid={`activity-row-${item.id}`}>
              <div className={`event-os-stream-icon ${item.type}`}>
                <Activity size={16} />
              </div>
              <div className="event-os-stream-copy">
                <div>
                  <strong>{item.title}</strong>
                  <span className="event-os-stream-badge">{item.type}</span>
                </div>
                <small>{item.detail}</small>
              </div>
              {typeof item.amountCents === 'number' && item.amountCents > 0 && (
                <strong className="event-os-stream-amount">{formatMoney(item.amountCents)}</strong>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="cockpit-stream-action-btn"
                  onClick={() => onNavigate(item.actionTarget)}
                  data-testid={`btn-action-${item.id}`}
                >
                  {item.actionLabel} <ArrowUpRight size={10} />
                </button>
              </div>
            </div>
          ))}
          {!data?.activity?.length && (
            <div className="event-os-empty-stream">
              <Activity size={22} />
              <strong>Nenhuma atividade registrada no período selecionado</strong>
            </div>
          )}
        </div>
      </section>
        </>
      )}

      {/* Drill-down Modal de Vendas por Hora */}
      {drilldownHour && (
        <div className="cockpit-modal-overlay" data-testid="drilldown-modal">
          <div className="cockpit-modal-content">
            <div className="cockpit-modal-header">
              <h3>Pedidos das {drilldownHour.label} ({drilldownHour.orders} vendas · {formatMoney(drilldownHour.revenueCents)})</h3>
              <button className="egs-clear-btn" onClick={() => setDrilldownHour(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="cockpit-modal-body">
              {drilldownHour.ordersList.map((ord, idx) => (
                <div className="cockpit-drilldown-row" key={`dd-${idx}`}>
                  <div>
                    <strong>#{ord.code} · {ord.buyerName}</strong>
                    <span className="text-slate-500 text-xs block">{ord.paymentMethod}</span>
                  </div>
                  <strong className="text-emerald-700">{formatMoney(ord.grossCents)}</strong>
                </div>
              ))}
              {!drilldownHour.ordersList.length && (
                <p className="text-sm text-slate-500">Nenhum pedido individual detalhado nesta leitura.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Kpi({ icon: Icon, label, value, note }: { icon: any; label: string; value: string; note: string }) {
  return (
    <article className="event-os-kpi">
      <div>
        <span>{label}</span>
        <Icon size={18} className="text-slate-400" />
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  )
}
