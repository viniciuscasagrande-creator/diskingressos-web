import React, { useState, useEffect, useCallback } from 'react'
import {
  Activity, DoorOpen, Radio, RefreshCw, ShieldAlert, ShieldCheck,
  Ticket, Users, Battery, BatteryCharging, AlertTriangle, ArrowUpRight,
  ExternalLink, CheckCircle2, XCircle, Search, UserCheck
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import './event-live-ops.css'

interface Props {
  event: EventItem
  onNavigate: (page: any, context?: any) => void
  notify: (m: string) => void
}

interface LiveOpsData {
  release: string
  event: { id: number; code: string; title: string; producerId: number }
  systemStatus: {
    status: string
    lastSync: string
    api: string
    gateway: string
    devicesOnline: number
    devicesTotal: number
  }
  kpis: {
    peopleInside: number
    totalCheckins: number
    checkinsPerMinute: number
    capacityTotal: number
    capacityUtilizedPct: number
    unusedTickets: number
    rejectedAttempts: number
    reentries: number
    activeGates: number
    onlineDevices: number
    offlineDevices: number
    activeOperators: number
  }
  flow: {
    minutes: Array<{ time: string; count: number }>
    peak: number
    average: number
  }
  gates: Array<{
    id: string
    name: string
    status: string
    entries: number
    rejected: number
    devicesCount: number
    onlineDevices: number
    operatorsCount: number
  }>
  devices: Array<{
    id: string
    code: string
    gateName: string
    status: string
    operatorName: string
    lastSeenSecondsAgo: number
    batteryPct: number
    readsCount: number
    rejectedCount: number
  }>
  rejections: Array<{
    id: string
    ticketCode: string
    orderCode: string
    participantName: string
    participantEmail: string
    participantPhone: string
    reason: string
    firstAccess: { time: string; gate: string } | null
    newAttempt: { time: string; gate: string }
    gateName: string
    deviceName: string
    operatorName: string
    status: string
  }>
}

export default function EventLiveOpsPage({ event, onNavigate, notify }: Props) {
  const [data, setData] = useState<LiveOpsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedGate, setSelectedGate] = useState<any | null>(null)
  const [selectedRejection, setSelectedRejection] = useState<any | null>(null)

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const token = typeof window !== 'undefined'
        ? sessionStorage.getItem('disk_token:server') || localStorage.getItem('disk_token:server') || ''
        : ''
      const res = await fetch(`/api/events/${event.id}/live-operations`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!res.ok) throw new Error('Falha ao carregar Live Operations.')
      const json = await res.json()
      setData(json)
    } catch (e: any) {
      notify?.(e?.message || 'Erro ao sincronizar Live Operations.')
    } finally {
      setLoading(false)
    }
  }, [event.id, notify])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!autoRefresh) return
    const timer = setInterval(() => loadData(true), 10000)
    return () => clearInterval(timer)
  }, [autoRefresh, loadData])

  const k = data?.kpis

  return (
    <div className="elo-page" data-release="26.16.5-live-operations-operacional-2026-09-04" data-testid="live-operations-operational">
      {/* Header */}
      <header className="elo-header">
        <div>
          <span className="elo-status-badge">
            <span className="elo-status-dot" /> AO VIVO · FASE 26.16.5
          </span>
          <h1>Live Operations Operacional</h1>
          <p>{event.title} ({event.code}) · Monitoramento de acessos, catracas e portões em tempo real.</p>
        </div>
        <div className="elo-controls">
          <button
            type="button"
            className={`elo-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(prev => !prev)}
            data-testid="liveops-toggle-refresh"
          >
            <Radio size={14} className={autoRefresh ? 'animate-pulse' : ''} />
            {autoRefresh ? 'Auto-refresh 10s' : 'Atualização Manual'}
          </button>
          <button
            type="button"
            className="elo-btn"
            onClick={() => { loadData(); notify('Live Operations sincronizado!') }}
            disabled={loading}
            data-testid="liveops-btn-refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Sincronizando...' : 'Atualizar agora'}
          </button>
          <button
            type="button"
            className="elo-btn"
            onClick={() => onNavigate('event-day-command')}
            data-testid="liveops-open-eventday"
          >
            <ExternalLink size={14} /> Event Day Command
          </button>
        </div>
      </header>

      {/* 10+ KPIs Operacionais */}
      <section className="elo-kpis-grid" data-testid="liveops-kpis">
        <div className="elo-kpi-card">
          <div className="elo-kpi-top"><span>Público presente agora</span><Users size={16} /></div>
          <strong>{k?.peopleInside ?? '—'}</strong>
          <small>{k ? `${k.capacityUtilizedPct.toFixed(1)}% capacidade utilizada` : '—'}</small>
        </div>
        <div className="elo-kpi-card">
          <div className="elo-kpi-top"><span>Total de check-ins</span><DoorOpen size={16} /></div>
          <strong>{k?.totalCheckins ?? '—'}</strong>
          <small>{k?.reentries ?? 0} reentradas autorizadas</small>
        </div>
        <div className="elo-kpi-card">
          <div className="elo-kpi-top"><span>Ritmo de entrada</span><Activity size={16} /></div>
          <strong className="text-sky-600">{k?.checkinsPerMinute ?? '—'}/min</strong>
          <small>Pico de {data?.flow.peak ?? '—'}/min</small>
        </div>
        <div className="elo-kpi-card">
          <div className="elo-kpi-top"><span>Ingressos não utilizados</span><Ticket size={16} /></div>
          <strong>{k?.unusedTickets ?? '—'}</strong>
          <small>Aguardando validação na portaria</small>
        </div>
        <div className="elo-kpi-card">
          <div className="elo-kpi-top"><span>Tentativas recusadas</span><XCircle size={16} className="text-rose-500" /></div>
          <strong className="text-rose-600">{k?.rejectedAttempts ?? '—'}</strong>
          <small>Requerem averiguação</small>
        </div>
        <div className="elo-kpi-card">
          <div className="elo-kpi-top"><span>Portões ativos</span><ShieldCheck size={16} /></div>
          <strong>{k?.activeGates ?? '—'}</strong>
          <small>Operação 100% monitorada</small>
        </div>
        <div className="elo-kpi-card">
          <div className="elo-kpi-top"><span>Dispositivos online</span><Radio size={16} /></div>
          <strong className="text-emerald-600">{k?.onlineDevices ?? '—'}/{data?.devices.length ?? '—'}</strong>
          <small>{k?.offlineDevices ?? 0} offline</small>
        </div>
        <div className="elo-kpi-card">
          <div className="elo-kpi-top"><span>Operadores ativos</span><UserCheck size={16} /></div>
          <strong>{k?.activeOperators ?? '—'}</strong>
          <small>Em portões e catracas</small>
        </div>
      </section>

      {/* Fluxo de Entradas em Tempo Real */}
      <section className="elo-flow-section" data-testid="liveops-flow-section">
        <div className="elo-flow-header">
          <h3>Entradas em Tempo Real (Últimos minutos)</h3>
          <div className="elo-flow-stats">
            <span>Pico: <b>{data?.flow.peak} entradas/min</b></span>
            <span>Média: <b>{data?.flow.average} entradas/min</b></span>
          </div>
        </div>
        <div className="elo-flow-bars">
          {(data?.flow.minutes || []).map((m, idx) => (
            <div className="elo-flow-col" key={`flow-${idx}`}>
              <div
                className="elo-flow-fill"
                style={{ height: `${Math.max(12, (m.count / (data?.flow.peak || 250)) * 100)}%` }}
                title={`${m.time} — ${m.count} entradas`}
              />
              <span className="elo-flow-time">{m.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Portões e Dispositivos */}
      <section className="elo-grid-2">
        {/* Portões */}
        <article className="elo-panel" data-testid="liveops-gates-panel">
          <div className="elo-panel-title">
            <h3>Portões Operacionais</h3>
            <span className="text-xs text-slate-500">{data?.gates.length} portões cadastrados</span>
          </div>
          <div className="elo-gates-list">
            {(data?.gates || []).map(g => (
              <div className="elo-gate-card" key={g.id} data-testid={`gate-card-${g.id}`}>
                <div className="elo-gate-top">
                  <span>{g.name}</span>
                  <span className="text-xs text-emerald-600 font-bold">● {g.status}</span>
                </div>
                <div className="elo-gate-metrics">
                  <span>Entradas: <b>{g.entries}</b></span>
                  <span>Recusadas: <b className="text-rose-600">{g.rejected}</b></span>
                  <span>Dispositivos: <b>{g.devicesCount}</b></span>
                  <span>Operadores: <b>{g.operatorsCount}</b></span>
                </div>
                <div className="elo-gate-actions">
                  <button type="button" className="elo-action-btn" onClick={() => setSelectedGate(g)}>
                    Detalhes
                  </button>
                  <button type="button" className="elo-action-btn" onClick={() => notify(`Focando dispositivos de ${g.name}`)}>
                    Ver dispositivos
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Dispositivos Scanners */}
        <article className="elo-panel" data-testid="liveops-devices-panel">
          <div className="elo-panel-title">
            <h3>Dispositivos & Leitores</h3>
            <span className="text-xs text-slate-500">Scanners e Catracas</span>
          </div>
          <table className="elo-devices-table">
            <thead>
              <tr>
                <th>Dispositivo</th>
                <th>Portão</th>
                <th>Status</th>
                <th>Operador</th>
                <th>Bateria</th>
                <th>Leituras</th>
              </tr>
            </thead>
            <tbody>
              {(data?.devices || []).map(d => (
                <tr key={d.id} data-testid={`device-row-${d.code}`}>
                  <td><b>{d.code}</b></td>
                  <td>{d.gateName}</td>
                  <td>
                    <span className={`text-xs font-bold ${d.status === 'ONLINE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>{d.operatorName}</td>
                  <td>
                    <span className="inline-flex items-center gap-1 font-mono text-xs">
                      {d.batteryPct}%
                    </span>
                  </td>
                  <td>{d.readsCount} ({d.rejectedCount} rec.)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>

      {/* Tentativas Recusadas (Com Ações Conectadas) */}
      <section className="elo-rejections-section" data-testid="liveops-rejections-section">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-base font-bold text-rose-900 m-0">Ocorrências de Ingressos Recusados</h3>
            <p className="text-xs text-rose-700 m-0">Diagnóstico operacional detalhado e resolução imediata.</p>
          </div>
          <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-1 rounded">
            {data?.rejections.length} ocorrências em análise
          </span>
        </div>

        <div className="elo-rejections-list">
          {(data?.rejections || []).map(r => (
            <div className="elo-rejection-card" key={r.id} data-testid={`rejection-card-${r.ticketCode}`}>
              <div className="elo-rejection-top">
                <span>Ingresso #{r.ticketCode} · Pedido #{r.orderCode}</span>
                <span>{r.newAttempt.time} · {r.gateName}</span>
              </div>
              <div className="elo-rejection-reason">
                Motivo: {r.reason}
              </div>
              <div className="elo-rejection-meta">
                <span>Participante: <b>{r.participantName}</b></span>
                {r.firstAccess && (
                  <span>Primeiro acesso: <b>{r.firstAccess.time} ({r.firstAccess.gate})</b></span>
                )}
                <span>Tentativa atual: <b>{r.newAttempt.time} ({r.newAttempt.gate})</b></span>
                <span>Dispositivo: <b>{r.deviceName}</b> ({r.operatorName})</span>
              </div>
              <div className="elo-rejection-actions">
                <button
                  type="button"
                  onClick={() => onNavigate('event-tickets')}
                  data-testid={`btn-rej-ticket-${r.ticketCode}`}
                >
                  <Ticket size={12} /> Ver ingresso
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('event-tickets')}
                  data-testid={`btn-rej-order-${r.ticketCode}`}
                >
                  <Search size={12} /> Ver pedido
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('event-customer-360')}
                  data-testid={`btn-rej-c360-${r.ticketCode}`}
                >
                  <Users size={12} /> Customer 360
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={() => {
                    try {
                      sessionStorage.setItem('incident_prefill', JSON.stringify({
                        ticketCode: r.ticketCode,
                        orderCode: r.orderCode,
                        customerName: r.participantName,
                        gate: r.gateName,
                        device: r.deviceName,
                        reason: r.reason
                      }))
                    } catch {}
                    onNavigate('event-incidents', {
                      ticketCode: r.ticketCode,
                      orderCode: r.orderCode,
                      customerName: r.participantName,
                      gate: r.gateName,
                      device: r.deviceName,
                      reason: r.reason
                    })
                  }}
                  data-testid={`btn-rej-incident-${r.ticketCode}`}
                >
                  <ShieldAlert size={12} /> Abrir incidente
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('sac-hub')}
                  data-testid={`btn-rej-sac-${r.ticketCode}`}
                >
                  SAC
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
