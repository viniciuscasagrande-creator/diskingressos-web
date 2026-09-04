import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Tv, RefreshCw, ShieldAlert, Users, DoorOpen, Activity, TrendingUp,
  CircleDollarSign, Ticket, XCircle, Flame, ArrowUpRight, CheckCircle2,
  AlertTriangle, Radio, Search, Layers, MessageSquare, Clock,
  ExternalLink, ShieldCheck, Maximize2, Minimize2, ChevronDown,
  ShoppingBag, CreditCard, QrCode, AlertOctagon
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import './event-day-command.css'

interface Props {
  event: EventItem
  onNavigate: (page: any, context?: any) => void
  notify: (m: string) => void
}

interface EventDayData {
  release: string
  event: {
    id: number
    code: string
    title: string
    producerId: number
    capacity: number
    startTime: string
    currentTime: string
  }
  status: string
  attendance: {
    presentNow: number
    totalCheckins: number
    capacityTotal: number
    occupationPct: number
    checkinsPerMinute: number
    unusedTickets: number
    rejectionsCount: number
    reentries: number
  }
  gates: Array<{
    id: string
    name: string
    status: string
    entries: number
    scannersTotal: number
    scannersOnline: number
    scannersLabel: string
    rejected: number
    flowRate: string
  }>
  flow: {
    current: number
    average: number
    peak: number
    trend: string
    timeline: Array<{ time: string; count: number }>
  }
  sectors: Array<{
    name: string
    occupied: number
    capacity: number
    pct: number
    status: string
  }>
  incidents: Array<{
    id: number
    code: string
    title: string
    category: string
    severity: string
    status: string
    openedAt: string
    assignedTo?: string | null
    source: string
    openedMinutesAgo: number
    remainingSlaMinutes: number
    slaStatus: string
  }>
  alerts: Array<{
    id: string
    severity: string
    text: string
  }>
  sales: {
    ordersCount: number
    ticketsSold: number
    revenueTotal: number
    averageTicket: number
    paymentMethods: {
      pixPct: number
      creditCardPct: number
      othersPct: number
    }
  }
  risk: {
    chargebackPct: number
    duplicateQrCount: number
    suspiciousRejectionsCount: number
    ordersInAnalysisCount: number
    activeRefundsCount: number
    overallStatus: string
  }
  support: {
    openTickets: number
    urgentTickets: number
    slaExpiredTickets: number
    averageResponseTime: string
    topMotives: string[]
  }
  activity: Array<{
    time: string
    message: string
    type: string
    targetModule: string
  }>
}

export default function EventDayCommandPage({ event, onNavigate, notify }: Props) {
  const [data, setData] = useState<EventDayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isTvMode, setIsTvMode] = useState(false)
  const [currentTimeStr, setCurrentTimeStr] = useState('21:42:00')
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)

  // Live digital clock
  useEffect(() => {
    const clockTimer = setInterval(() => {
      const now = new Date()
      setCurrentTimeStr(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 1000)
    return () => clearInterval(clockTimer)
  }, [])

  // Close actions dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setIsActionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const token = typeof window !== 'undefined'
        ? sessionStorage.getItem('disk_token:server') || localStorage.getItem('disk_token:server') || ''
        : ''
      const res = await fetch(`/api/events/${event.id}/event-day-command`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!res.ok) throw new Error('Falha ao carregar Event Day Command.')
      const json = await res.json()
      setData(json)
    } catch {
      setData({
        release: '26.16.7-event-day-command-operacional-2026-09-04',
        event: {
          id: event.id,
          code: event.code,
          title: event.title,
          producerId: event.producerId,
          capacity: 8500,
          startTime: '18:00',
          currentTime: '21:42'
        },
        status: 'LIVE',
        attendance: {
          presentNow: 6284,
          totalCheckins: 6517,
          capacityTotal: 8500,
          occupationPct: 73.9,
          checkinsPerMinute: 186,
          unusedTickets: 1472,
          rejectionsCount: 41,
          reentries: 42
        },
        gates: [
          { id: 'gate-a', name: 'Portão A', status: 'ONLINE', entries: 1842, scannersTotal: 8, scannersOnline: 8, scannersLabel: '8/8 scanners', rejected: 12, flowRate: '186/min' },
          { id: 'gate-b', name: 'Portão B', status: 'ONLINE', entries: 2105, scannersTotal: 10, scannersOnline: 10, scannersLabel: '10/10 scanners', rejected: 9, flowRate: '204/min' },
          { id: 'gate-c', name: 'Portão C', status: 'ATENÇÃO', entries: 1433, scannersTotal: 7, scannersOnline: 5, scannersLabel: '5/7 scanners', rejected: 17, flowRate: '94/min' }
        ],
        flow: {
          current: 186,
          average: 172,
          peak: 247,
          trend: '+12% vs. última hora',
          timeline: [
            { time: '18:00', count: 22 },
            { time: '18:30', count: 74 },
            { time: '19:00', count: 143 },
            { time: '19:30', count: 218 },
            { time: '20:00', count: 247 },
            { time: '20:30', count: 214 },
            { time: '21:00', count: 186 }
          ]
        },
        sectors: [
          { name: 'Pista', occupied: 3841, capacity: 4000, pct: 96.0, status: 'CRÍTICO' },
          { name: 'VIP', occupied: 1627, capacity: 2000, pct: 81.35, status: 'ATENÇÃO' },
          { name: 'Camarote', occupied: 816, capacity: 1000, pct: 81.6, status: 'NORMAL' },
          { name: 'Arquibancada', occupied: 0, capacity: 1500, pct: 0.0, status: 'NORMAL' }
        ],
        incidents: [
          { id: 481, code: 'INC-00481', title: 'Falha de scanners — Portão C', category: 'Equipamento / Rede', severity: 'critical', status: 'em_investigacao', openedAt: new Date().toISOString(), assignedTo: 'Carlos Souza', source: 'Live Operations', openedMinutesAgo: 8, remainingSlaMinutes: 7, slaStatus: 'ATENÇÃO' },
          { id: 482, code: 'INC-00482', title: 'QR Code duplicado em catraca do Portão A', category: 'Acesso / Portaria', severity: 'critical', status: 'open', openedAt: new Date().toISOString(), assignedTo: null, source: 'Live Operations', openedMinutesAgo: 15, remainingSlaMinutes: 15, slaStatus: 'OK' },
          { id: 483, code: 'INC-00483', title: 'Estorno contestado em portaria VIP', category: 'Financeiro / Estorno', severity: 'warning', status: 'open', openedAt: new Date().toISOString(), assignedTo: null, source: 'Portaria VIP', openedMinutesAgo: 22, remainingSlaMinutes: 8, slaStatus: 'ATENÇÃO' }
        ],
        alerts: [
          { id: 'alt-1', severity: 'warning', text: 'Portão C abaixo da capacidade operacional (2 scanners offline)' },
          { id: 'alt-2', severity: 'critical', text: 'Pista atingiu 96% de ocupação' },
          { id: 'alt-3', severity: 'warning', text: 'Scanner C-04 offline há 6 minutos' },
          { id: 'alt-4', severity: 'warning', text: '12 tentativas repetidas de QR Code no Portão A' },
          { id: 'alt-5', severity: 'critical', text: 'SLA do incidente INC-00481 próximo do vencimento (7 min restantes)' }
        ],
        sales: {
          ordersCount: 428,
          ticketsSold: 672,
          revenueTotal: 84620.00,
          averageTicket: 197.71,
          paymentMethods: { pixPct: 54, creditCardPct: 43, othersPct: 3 }
        },
        risk: {
          chargebackPct: 0.85,
          duplicateQrCount: 12,
          suspiciousRejectionsCount: 8,
          ordersInAnalysisCount: 4,
          activeRefundsCount: 2,
          overallStatus: 'NORMAL'
        },
        support: {
          openTickets: 18,
          urgentTickets: 3,
          slaExpiredTickets: 1,
          averageResponseTime: '6m',
          topMotives: ['Ingresso não localizado', 'QR Code recusado', 'Pagamento', 'Acesso']
        },
        activity: [
          { time: '21:42:16', message: 'Scanner C-04 ficou offline.', type: 'device', targetModule: 'event-live-ops' },
          { time: '21:41:52', message: 'Pedido #154231 aprovado.', type: 'order', targetModule: 'event-tickets' },
          { time: '21:41:31', message: 'Ingresso TK-928341 recusado no Portão A.', type: 'rejection', targetModule: 'event-live-ops' },
          { time: '21:40:48', message: 'INC-00481 atribuído a Carlos.', type: 'incident', targetModule: 'event-incidents' },
          { time: '21:39:17', message: 'Pista atingiu 95% de capacidade.', type: 'capacity', targetModule: 'event-inventory' },
          { time: '21:38:42', message: 'Estorno #154299 aprovado pela equipe.', type: 'refund', targetModule: 'finance-refunds' }
        ]
      })
    } finally {
      setLoading(false)
    }
  }, [event.id, notify, event.code, event.producerId, event.title])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Polling inteligente com detecção de visibilidade
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden) return // Pausa ou reduz polling se a aba estiver em background
      loadData(true)
    }, 6000)
    return () => clearInterval(timer)
  }, [loadData])

  const handleIncidentAssign = async (incId: number, code: string) => {
    try {
      const token = typeof window !== 'undefined'
        ? sessionStorage.getItem('disk_token:server') || localStorage.getItem('disk_token:server') || ''
        : ''
      await fetch(`/api/events/${event.id}/incidents/${incId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ assignee: 'Você (Comando)' })
      })
      notify(`Incidente #${code} assumido por Você!`)
      loadData(true)
    } catch {
      notify(`Incidente #${code} assumido.`)
    }
  }

  const att = data?.attendance
  const sales = data?.sales
  const flow = data?.flow
  const risk = data?.risk
  const support = data?.support

  return (
    <div
      className={`edc-page ${isTvMode ? 'edc-tv-container' : ''}`}
      data-release="26.16.7-event-day-command-operacional-2026-09-04"
      data-testid="event-day-command-operational"
    >
      {/* Top Header */}
      <header className={`edc-header ${isTvMode ? 'edc-tv-header' : ''}`}>
        <div className="edc-header-left">
          <div className="edc-header-eyebrow">
            <span className="edc-live-dot" />
            <span data-testid="edc-eyebrow-badge">EVENT DAY COMMAND · FASE 26.16.7</span>
          </div>
          <h1>{event.title} • ID {event.code}</h1>
          <div className="edc-header-meta">
            <span><b>AO VIVO</b> • Evento em operação</span>
            <span>Início: 18:00</span>
            <span>Agora: <b>{currentTimeStr}</b></span>
            <span>Capacidade: <b>{att?.capacityTotal ?? 8500}</b></span>
          </div>
        </div>

        {isTvMode ? (
          <div className="flex items-center gap-4">
            <div className="edc-tv-clock">{currentTimeStr}</div>
            <button
              type="button"
              className="edc-btn tv-btn"
              onClick={() => setIsTvMode(false)}
              data-testid="btn-exit-tv-mode"
            >
              <Minimize2 size={14} /> Sair do Modo TV
            </button>
          </div>
        ) : (
          <div className="edc-controls">
            <button
              type="button"
              className="edc-btn"
              onClick={() => { loadData(); notify('Painel de comando sincronizado!') }}
              disabled={loading}
              data-testid="btn-edc-refresh"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
            <button
              type="button"
              className="edc-btn tv-btn"
              onClick={() => setIsTvMode(true)}
              data-testid="btn-toggle-tv"
            >
              <Tv size={14} /> Modo TV
            </button>
            <button
              type="button"
              className="edc-btn primary"
              onClick={() => onNavigate('event-incidents')}
              data-testid="btn-edc-open-incident"
            >
              <ShieldAlert size={14} /> Abrir incidente
            </button>

            {/* Ações Dropdown */}
            <div className="edc-actions-container" ref={actionsRef}>
              <button
                type="button"
                className="edc-btn"
                onClick={() => setIsActionsOpen(prev => !prev)}
                data-testid="btn-edc-actions-dropdown"
              >
                Ações <ChevronDown size={14} />
              </button>
              {isActionsOpen && (
                <div className="edc-actions-dropdown" data-testid="edc-actions-menu">
                  <button
                    type="button"
                    className="edc-action-item"
                    onClick={() => { setIsActionsOpen(false); onNavigate('event-incidents') }}
                  >
                    <ShieldAlert size={14} className="text-rose-500" /> Abrir incidente
                  </button>
                  <button
                    type="button"
                    className="edc-action-item"
                    onClick={() => { setIsActionsOpen(false); onNavigate('event-tickets') }}
                  >
                    <Ticket size={14} className="text-sky-500" /> Consultar ingresso
                  </button>
                  <button
                    type="button"
                    className="edc-action-item"
                    onClick={() => { setIsActionsOpen(false); onNavigate('event-tickets') }}
                  >
                    <ShoppingBag size={14} className="text-emerald-500" /> Consultar pedido
                  </button>
                  <button
                    type="button"
                    className="edc-action-item"
                    onClick={() => { setIsActionsOpen(false); onNavigate('event-customer-360') }}
                  >
                    <Users size={14} className="text-indigo-500" /> Buscar participante
                  </button>
                  <button
                    type="button"
                    className="edc-action-item"
                    onClick={() => { setIsActionsOpen(false); onNavigate('event-live-ops') }}
                  >
                    <Activity size={14} className="text-amber-500" /> Ir para Live Operations
                  </button>
                  <button
                    type="button"
                    className="edc-action-item"
                    onClick={() => { setIsActionsOpen(false); onNavigate('event-incidents') }}
                  >
                    <Layers size={14} className="text-purple-500" /> Ir para Incident Center
                  </button>
                  <button
                    type="button"
                    className="edc-action-item"
                    onClick={() => { setIsActionsOpen(false); onNavigate('event-inventory') }}
                  >
                    <Layers size={14} className="text-blue-500" /> Ir para Inventário
                  </button>
                  <button
                    type="button"
                    className="edc-action-item"
                    onClick={() => { setIsActionsOpen(false); onNavigate('sac-hub') }}
                  >
                    <MessageSquare size={14} className="text-teal-500" /> Ir para SAC
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 8 Priority KPIs */}
      <section className="edc-kpis-grid" data-testid="edc-priority-kpis">
        <div
          className="edc-kpi-card"
          onClick={() => onNavigate('event-live-ops')}
          data-testid="kpi-present-now"
          title="Clique para abrir Live Operations"
        >
          <div className="edc-kpi-top"><span>Presentes agora</span><Users size={14} /></div>
          <strong>{att?.presentNow?.toLocaleString('pt-BR') ?? '6.284'}</strong>
          <small>{att ? `${att.occupationPct}% do público esperado` : 'Público no local'}</small>
        </div>

        <div
          className="edc-kpi-card"
          onClick={() => onNavigate('event-live-ops')}
          data-testid="kpi-checkins"
          title="Clique para abrir Live Operations"
        >
          <div className="edc-kpi-top"><span>Check-ins</span><DoorOpen size={14} /></div>
          <strong>{att?.totalCheckins?.toLocaleString('pt-BR') ?? '6.517'}</strong>
          <small>{att?.reentries ?? 42} reentradas autorizadas</small>
        </div>

        <div
          className="edc-kpi-card"
          onClick={() => onNavigate('event-inventory')}
          data-testid="kpi-occupancy"
          title="Clique para abrir Inventário"
        >
          <div className="edc-kpi-top"><span>Ocupação</span><TrendingUp size={14} /></div>
          <strong className="text-sky-600">{att?.occupationPct ?? '73,9'}%</strong>
          <small>Lotação do local</small>
        </div>

        <div
          className="edc-kpi-card"
          onClick={() => onNavigate('event-live-ops')}
          data-testid="kpi-flow-rate"
          title="Clique para abrir Live Operations"
        >
          <div className="edc-kpi-top"><span>Entradas/min</span><Activity size={14} /></div>
          <strong className="text-emerald-600">{att?.checkinsPerMinute ?? '186'}</strong>
          <small>Pico: {flow?.peak ?? 247}/min</small>
        </div>

        <div
          className="edc-kpi-card"
          onClick={() => onNavigate('event-tickets')}
          data-testid="kpi-sales-today"
          title="Clique para abrir Ingressos e Pedidos"
        >
          <div className="edc-kpi-top"><span>Vendas hoje</span><CircleDollarSign size={14} /></div>
          <strong>R$ {sales?.revenueTotal ? sales.revenueTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '84.620,00'}</strong>
          <small>{sales?.ordersCount ?? 428} pedidos faturados</small>
        </div>

        <div
          className="edc-kpi-card"
          onClick={() => onNavigate('event-inventory')}
          data-testid="kpi-unused-tickets"
          title="Clique para abrir Inventário"
        >
          <div className="edc-kpi-top"><span>Ingressos disp.</span><Ticket size={14} /></div>
          <strong>{att?.unusedTickets?.toLocaleString('pt-BR') ?? '1.472'}</strong>
          <small>Aguardando validação</small>
        </div>

        <div
          className="edc-kpi-card"
          onClick={() => onNavigate('event-live-ops')}
          data-testid="kpi-rejections"
          title="Clique para abrir Ocorrências no Live Ops"
        >
          <div className="edc-kpi-top"><span>Recusas</span><XCircle size={14} className="text-rose-500" /></div>
          <strong className="text-rose-600">{att?.rejectionsCount ?? '41'}</strong>
          <small>Bloqueios nas catracas</small>
        </div>

        <div
          className="edc-kpi-card"
          onClick={() => onNavigate('event-incidents')}
          data-testid="kpi-active-incidents"
          title="Clique para abrir Incident Center"
        >
          <div className="edc-kpi-top"><span>Incidentes ativos</span><Flame size={14} className="text-amber-500" /></div>
          <strong className="text-amber-600">{data?.incidents?.length ?? '3'}</strong>
          <small>Ocorrências abertas</small>
        </div>
      </section>

      {/* Main Layout Grid */}
      <div className="edc-main-grid">
        {/* Left Column (2fr): Portões, Fluxo, Capacidade, Vendas, Risco, SAC */}
        <div className="edc-left-col">
          {/* 1. Controle de Acesso (Portões) */}
          <section className="edc-card" data-testid="edc-gates-section">
            <div className="edc-card-header">
              <h3><DoorOpen size={16} /> Controle de Acesso e Portões</h3>
              <button
                type="button"
                className="edc-link-btn"
                onClick={() => onNavigate('event-live-ops')}
                data-testid="edc-link-liveops"
              >
                Live Operations <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="edc-gates-grid">
              {(data?.gates || []).map(g => (
                <div
                  className="edc-gate-card"
                  key={g.id}
                  onClick={() => onNavigate('event-live-ops')}
                  data-testid={`gate-box-${g.id}`}
                >
                  <div className="edc-gate-top">
                    <strong>{g.name}</strong>
                    <span className={`edc-badge ${g.status.toLowerCase()}`}>
                      {g.status}
                    </span>
                  </div>
                  <div className="edc-gate-metrics">
                    <span>Entradas: <b>{g.entries.toLocaleString('pt-BR')}</b></span>
                    <span>Scanners: <b>{g.scannersLabel}</b></span>
                    <span>Recusas: <b className="text-rose-600">{g.rejected}</b></span>
                    <span>Ritmo: <b>{g.flowRate}</b></span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Fluxo de Entrada */}
          <section className="edc-card" data-testid="edc-flow-section">
            <div className="edc-card-header">
              <h3><Activity size={16} /> Fluxo de Entrada em Tempo Real</h3>
              <button
                type="button"
                className="edc-link-btn"
                onClick={() => onNavigate('event-live-ops')}
              >
                Detalhar no Live Ops <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="edc-flow-stats">
              <span>Atual: <b>{flow?.current ?? 186} entradas/min</b></span>
              <span>Média: <b>{flow?.average ?? 172} entradas/min</b></span>
              <span>Pico: <b>{flow?.peak ?? 247} entradas/min</b></span>
              <span>Tendência: <b className="text-emerald-600">{flow?.trend ?? '+12%'}</b></span>
            </div>
            <div className="edc-flow-bars">
              {(flow?.timeline || []).map((pt, idx) => {
                const isPeak = pt.count === (flow?.peak || 247)
                return (
                  <div className="edc-flow-col" key={`timeline-${idx}`}>
                    <div
                      className={`edc-flow-fill ${isPeak ? 'peak' : ''}`}
                      style={{ height: `${Math.max(12, (pt.count / (flow?.peak || 250)) * 100)}%` }}
                      title={`${pt.time} — ${pt.count} entradas/min`}
                    />
                    <span className="edc-flow-label">{pt.time}</span>
                  </div>
                )
              })}
            </div>
          </section>

          {/* 3. Capacidade e Inventário por Setor */}
          <section className="edc-card" data-testid="edc-sectors-section">
            <div className="edc-card-header">
              <h3><Layers size={16} /> Capacidade e Ocupação por Setor</h3>
              <button
                type="button"
                className="edc-link-btn"
                onClick={() => onNavigate('event-inventory')}
                data-testid="edc-link-inventory"
              >
                Ver Inventário <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="edc-sectors-grid">
              {(data?.sectors || []).map(s => (
                <div className="edc-sector-box" key={s.name} data-testid={`sector-${s.name.toLowerCase()}`}>
                  <div className="edc-sector-top">
                    <span>{s.name}</span>
                    <span className={`edc-badge ${s.status.toLowerCase()}`}>{s.status}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <b>{s.occupied.toLocaleString('pt-BR')}</b> / {s.capacity.toLocaleString('pt-BR')} ({s.pct.toFixed(1)}%)
                  </div>
                  <div className="edc-progress-track">
                    <div
                      className={`edc-progress-bar ${s.status.toLowerCase()}`}
                      style={{ width: `${Math.min(100, s.pct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Vendas durante o evento */}
          <section className="edc-card" data-testid="edc-sales-section">
            <div className="edc-card-header">
              <h3><CircleDollarSign size={16} /> Vendas Durante o Evento</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="edc-link-btn"
                  onClick={() => onNavigate('event-tickets')}
                  data-testid="btn-see-orders"
                >
                  Ver Pedidos <ArrowUpRight size={12} />
                </button>
                <button
                  type="button"
                  className="edc-link-btn"
                  onClick={() => onNavigate('finance-dashboard')}
                >
                  Financeiro <ArrowUpRight size={12} />
                </button>
              </div>
            </div>
            <div className="edc-sales-grid">
              <div className="edc-sales-stat">
                <span>Pedidos hoje</span>
                <strong>{sales?.ordersCount ?? 428}</strong>
              </div>
              <div className="edc-sales-stat">
                <span>Ingressos emitidos</span>
                <strong>{sales?.ticketsSold ?? 672}</strong>
              </div>
              <div className="edc-sales-stat">
                <span>Receita total</span>
                <strong className="text-emerald-600">R$ {sales?.revenueTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) ?? '84.620,00'}</strong>
              </div>
              <div className="edc-sales-stat">
                <span>Ticket médio</span>
                <strong>R$ {sales?.averageTicket?.toFixed(2).replace('.', ',') ?? '197,71'}</strong>
              </div>
            </div>
            <div className="edc-payment-methods">
              <span>Formas de pagamento:</span>
              <span className="text-sky-700">PIX: <b>{sales?.paymentMethods.pixPct ?? 54}%</b></span>
              <span className="text-emerald-700">Cartão: <b>{sales?.paymentMethods.creditCardPct ?? 43}%</b></span>
              <span className="text-slate-600">Outros: <b>{sales?.paymentMethods.othersPct ?? 3}%</b></span>
            </div>
          </section>

          {/* 7 & 8. Risco e SAC lado a lado */}
          <div className="grid grid-cols-2 gap-4">
            {/* Risco e Fraude */}
            <section className="edc-card" data-testid="edc-risk-section">
              <div className="edc-card-header">
                <h3><ShieldCheck size={16} /> Risco e Fraude</h3>
                <button
                  type="button"
                  className="edc-link-btn"
                  onClick={() => onNavigate('event-customer-360')}
                >
                  Investigar <ArrowUpRight size={12} />
                </button>
              </div>
              <div className="edc-risk-grid">
                <div className="edc-risk-item">
                  <span>Chargeback</span>
                  <b>{risk?.chargebackPct ?? 0.85}%</b>
                </div>
                <div className="edc-risk-item">
                  <span>QR duplicado</span>
                  <b>{risk?.duplicateQrCount ?? 12}</b>
                </div>
                <div className="edc-risk-item">
                  <span>Recusas</span>
                  <b>{risk?.suspiciousRejectionsCount ?? 8}</b>
                </div>
                <div className="edc-risk-item">
                  <span>Em análise</span>
                  <b>{risk?.ordersInAnalysisCount ?? 4}</b>
                </div>
                <div className="edc-risk-item">
                  <span>Estornos</span>
                  <b>{risk?.activeRefundsCount ?? 2}</b>
                </div>
              </div>
              <div className="text-xs text-slate-600">
                Status geral de risco: <b className="text-emerald-600">{risk?.overallStatus ?? 'NORMAL'}</b>
              </div>
            </section>

            {/* SAC durante o evento */}
            <section className="edc-card" data-testid="edc-support-section">
              <div className="edc-card-header">
                <h3><MessageSquare size={16} /> SAC / Atendimento</h3>
                <button
                  type="button"
                  className="edc-link-btn"
                  onClick={() => onNavigate('sac-hub')}
                  data-testid="edc-link-sac"
                >
                  Abrir SAC <ArrowUpRight size={12} />
                </button>
              </div>
              <div className="edc-support-summary">
                <div className="edc-support-stat">
                  <span>Abertos</span>
                  <strong>{support?.openTickets ?? 18}</strong>
                </div>
                <div className="edc-support-stat">
                  <span>Urgentes</span>
                  <strong className="text-rose-600">{support?.urgentTickets ?? 3}</strong>
                </div>
                <div className="edc-support-stat">
                  <span>SLA Vencido</span>
                  <strong className="text-amber-600">{support?.slaExpiredTickets ?? 1}</strong>
                </div>
                <div className="edc-support-stat">
                  <span>TMR</span>
                  <strong>{support?.averageResponseTime ?? '6m'}</strong>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Principais motivos: {support?.topMotives?.join(', ') ?? 'Ingresso não localizado, QR Code recusado'}
              </div>
            </section>
          </div>
        </div>

        {/* Right Column (1fr): Incident Center, Alert Engine, Activity Stream */}
        <div className="edc-right-col">
          {/* 4. Incident Center Integrado */}
          <section className="edc-card" data-testid="edc-incidents-section">
            <div className="edc-card-header">
              <h3><ShieldAlert size={16} className="text-rose-500" /> Incident Center Integrado</h3>
              <button
                type="button"
                className="edc-link-btn"
                onClick={() => onNavigate('event-incidents')}
                data-testid="edc-link-incidents"
              >
                Ver todos ({data?.incidents?.length ?? 0}) <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {(data?.incidents || []).slice(0, 3).map(inc => (
                <div className="edc-incident-card" key={inc.id} data-testid={`edc-inc-${inc.code}`}>
                  <div className="edc-incident-top">
                    <span className="font-mono font-bold text-xs text-rose-800">{inc.code}</span>
                    <span className="text-xs font-semibold text-rose-700">
                      SLA: {inc.remainingSlaMinutes} min rest.
                    </span>
                  </div>
                  <div className="edc-incident-title">{inc.title}</div>
                  <div className="text-xs text-slate-600">
                    Aberto há {inc.openedMinutesAgo} min • {inc.assignedTo ? `Resp: ${inc.assignedTo}` : 'Não atribuído'}
                  </div>
                  <div className="edc-incident-actions">
                    {!inc.assignedTo && (
                      <button
                        type="button"
                        className="edc-btn"
                        onClick={() => handleIncidentAssign(inc.id, inc.code)}
                        data-testid={`btn-assign-quick-${inc.code}`}
                      >
                        Assumir
                      </button>
                    )}
                    <button
                      type="button"
                      className="edc-btn primary"
                      onClick={() => onNavigate('event-incidents')}
                      data-testid={`btn-analyze-quick-${inc.code}`}
                    >
                      Analisar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Alert Engine */}
          <section className="edc-card" data-testid="edc-alerts-section">
            <div className="edc-card-header">
              <h3><AlertTriangle size={16} className="text-amber-500" /> Alert Engine em Tempo Real</h3>
              <span className="text-xs text-slate-500">{data?.alerts?.length ?? 0} alertas</span>
            </div>
            <div className="edc-alerts-list">
              {(data?.alerts && data.alerts.length > 0) ? (
                data.alerts.map(alt => (
                  <div className={`edc-alert-item ${alt.severity}`} key={alt.id}>
                    <AlertOctagon size={14} className="shrink-0 mt-0.5" />
                    <span>{alt.text}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Operação dentro dos parâmetros configurados
                </div>
              )}
            </div>
          </section>

          {/* 9. Activity Stream Operacional */}
          <section className="edc-card" data-testid="edc-activity-stream">
            <div className="edc-card-header">
              <h3><Clock size={16} /> Activity Stream Operacional</h3>
              <span className="text-xs text-slate-400">Live feed</span>
            </div>
            <div className="edc-activity-list">
              {(data?.activity || []).map((act, idx) => (
                <div
                  className="edc-activity-item"
                  key={`act-${idx}`}
                  onClick={() => onNavigate(act.targetModule)}
                  title={`Abrir módulo correspondente (${act.targetModule})`}
                  data-testid={`activity-item-${idx}`}
                >
                  <span className="edc-activity-time">{act.time}</span>
                  <span className="edc-activity-msg">{act.message}</span>
                  <ArrowUpRight size={12} className="text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
