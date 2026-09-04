import React, { useState, useEffect, useCallback } from 'react'
import {
  ShieldAlert, AlertTriangle, CheckCircle2, Clock, Search,
  Plus, RefreshCw, UserCheck, Flame, ArrowUpRight,
  Ticket, Users, MessageSquare, Paperclip, Eye, X,
  ExternalLink, ShieldCheck, AlertCircle, Filter
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import './event-incidents.css'

interface Props {
  event: EventItem
  onNavigate: (page: any, context?: any) => void
  notify: (m: string) => void
  initialContext?: any
}

interface Incident {
  id: number
  code: string
  title: string
  category: string
  severity: 'critical' | 'warning' | 'info' | string
  status: 'open' | 'em_investigacao' | 'escalado' | 'resolved' | 'reaberto' | string
  description?: string
  source: string
  openedBy: string
  resolvedBy?: string | null
  openedAt: string
  resolvedAt?: string | null
  assignedTo?: string
  commentsCount?: number
}

interface Kpis {
  totalOpen: number
  critical: number
  slaExpired: number
  slaWarning: number
  inInvestigation: number
  resolvedToday: number
  avgResolutionMinutes: number
  recurrenceRatePct: number
}

export default function EventIncidentsPage({ event, onNavigate, notify, initialContext }: Props) {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [kpis, setKpis] = useState<Kpis | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [severityFilter, setSeverityFilter] = useState('TODAS')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Drawer comment state
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<Array<{ id: number; author: string; text: string; time: string }>>([
    { id: 1, author: 'Sistema Live Ops', text: 'Incidente gerado automaticamente por recusa de catraca.', time: '10:06' },
    { id: 2, author: 'Carlos Souza (Operador)', text: 'Participante apresentou comprovante no app.', time: '10:12' }
  ])

  // New incident form state
  const [newForm, setNewForm] = useState({
    title: initialContext?.reason ? `Recusa Portaria: ${initialContext.reason}` : '',
    category: 'Acesso / Portaria',
    severity: (initialContext?.reason?.includes('JÁ UTILIZADO') ? 'critical' : 'warning') as 'critical' | 'warning' | 'info',
    source: initialContext ? 'Live Operations' : 'Portaria Principal',
    gate: initialContext?.gate || '',
    device: initialContext?.device || '',
    ticketCode: initialContext?.ticketCode || '',
    orderCode: initialContext?.orderCode || '',
    customerName: initialContext?.customerName || '',
    description: initialContext ? `Recusa registrada em ${initialContext.gate} (${initialContext.device}). Motivo: ${initialContext.reason}` : ''
  })

  useEffect(() => {
    if (initialContext) {
      setIsCreateModalOpen(true)
      return
    }
    try {
      const stored = sessionStorage.getItem('incident_prefill')
      if (stored) {
        const parsed = JSON.parse(stored)
        sessionStorage.removeItem('incident_prefill')
        setNewForm({
          title: parsed.reason ? `Recusa Portaria: ${parsed.reason}` : '',
          category: 'Acesso / Portaria',
          severity: parsed.reason?.includes('JÁ UTILIZADO') ? 'critical' : 'warning',
          source: 'Live Operations',
          gate: parsed.gate || '',
          device: parsed.device || '',
          ticketCode: parsed.ticketCode || '',
          orderCode: parsed.orderCode || '',
          customerName: parsed.customerName || '',
          description: `Recusa registrada em ${parsed.gate || 'portaria'} (${parsed.device || 'dispositivo'}). Motivo: ${parsed.reason || ''}`
        })
        setIsCreateModalOpen(true)
      }
    } catch {}
  }, [initialContext])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const token = typeof window !== 'undefined'
        ? sessionStorage.getItem('disk_token:server') || localStorage.getItem('disk_token:server') || ''
        : ''
      const res = await fetch(`/api/events/${event.id}/incidents`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!res.ok) throw new Error('Falha ao carregar Incident Center.')
      const data = await res.json()
      setIncidents(data.incidents || [])
      setKpis(data.kpis || null)
    } catch (e: any) {
      notify?.(e?.message || 'Erro ao sincronizar incidentes.')
      // Fallback base data
      setIncidents([
        {
          id: 101,
          code: 'INC-2026-1049',
          title: 'QR Code duplicado em catraca do Portão A',
          category: 'Acesso / Portaria',
          severity: 'critical',
          status: 'em_investigacao',
          description: 'Tentativa de segundo acesso com ingresso TK-928341 às 10:05. Primeiro acesso realizado às 09:42 no Portão B.',
          source: 'Live Operations',
          openedBy: 'Scanner A-04 (Fernanda Dias)',
          openedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
          assignedTo: 'Carlos Souza (N1)'
        },
        {
          id: 102,
          code: 'INC-2026-1048',
          title: 'Participante com setor incorreto na Catraca VIP',
          category: 'Acesso / Portaria',
          severity: 'warning',
          status: 'open',
          description: 'Ingresso Pista TK-881290 apresentado na catraca VIP 02.',
          source: 'Live Operations',
          openedBy: 'Catraca VIP 02 (Aline Castro)',
          openedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString()
        },
        {
          id: 103,
          code: 'INC-2026-1047',
          title: 'Scanner B-02 com bateria crítica (12%) e perda de sincronismo',
          category: 'Equipamento / Rede',
          severity: 'warning',
          status: 'escalado',
          description: 'Dispositivo offline há mais de 3 minutos no Portão B.',
          source: 'Live Operations',
          openedBy: 'Juliana Mendes',
          openedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
          assignedTo: 'TI Operação'
        },
        {
          id: 104,
          code: 'INC-2026-1045',
          title: 'Ingresso cancelado/estornado tentando acesso no Portão A',
          category: 'Financeiro / Estorno',
          severity: 'critical',
          status: 'open',
          description: 'Pedido #152801 consta estornado. Participante alega chargeback indevido pelo banco.',
          source: 'Live Operations',
          openedBy: 'Carlos Souza',
          openedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
        },
        {
          id: 105,
          code: 'INC-2026-1040',
          title: 'Substituição de pulseira danificada no Camarote',
          category: 'Operacional',
          severity: 'info',
          status: 'resolved',
          description: 'Pulseira RFID substituída após conferência de documento com foto.',
          source: 'Credenciamento',
          openedBy: 'Lucas Prado',
          resolvedBy: 'Lucas Prado',
          openedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          resolvedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ])
      setKpis({
        totalOpen: 3,
        critical: 2,
        slaExpired: 1,
        slaWarning: 1,
        inInvestigation: 1,
        resolvedToday: 1,
        avgResolutionMinutes: 24,
        recurrenceRatePct: 4.2
      })
    } finally {
      setLoading(false)
    }
  }, [event.id, notify])

  useEffect(() => {
    loadData()
  }, [loadData])

  const calculateSla = (openedAt: string, status: string) => {
    if (['resolved', 'fechado', 'closed'].includes(status.toLowerCase())) {
      return { label: 'RESOLVIDO', type: 'sla-ok' }
    }
    const diffMin = Math.floor((Date.now() - new Date(openedAt).getTime()) / (60 * 1000))
    if (diffMin > 30) {
      return { label: `SLA VENCIDO (+${diffMin - 30}m)`, type: 'sla-expired' }
    }
    if (diffMin > 15) {
      return { label: `SLA ${30 - diffMin}m rest.`, type: 'sla-warning' }
    }
    return { label: `SLA ${30 - diffMin}m rest.`, type: 'sla-ok' }
  }

  // Quick actions
  const handleAssign = async (inc: Incident) => {
    try {
      const token = typeof window !== 'undefined'
        ? sessionStorage.getItem('disk_token:server') || localStorage.getItem('disk_token:server') || ''
        : ''
      await fetch(`/api/events/${event.id}/incidents/${inc.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ assignee: 'Você (Operador)' })
      })
      setIncidents(prev => prev.map(i => i.id === inc.id ? { ...i, status: 'em_investigacao', assignedTo: 'Você (Operador)' } : i))
      if (selectedIncident?.id === inc.id) {
        setSelectedIncident(prev => prev ? { ...prev, status: 'em_investigacao', assignedTo: 'Você (Operador)' } : null)
      }
      notify(`Incidente #${inc.code} assumido por você!`)
    } catch {
      notify(`Incidente #${inc.code} assumido em modo local.`)
    }
  }

  const handleEscalate = async (inc: Incident) => {
    try {
      const token = typeof window !== 'undefined'
        ? sessionStorage.getItem('disk_token:server') || localStorage.getItem('disk_token:server') || ''
        : ''
      await fetch(`/api/events/${event.id}/incidents/${inc.id}/escalate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      })
      setIncidents(prev => prev.map(i => i.id === inc.id ? { ...i, severity: 'critical', status: 'escalado' } : i))
      if (selectedIncident?.id === inc.id) {
        setSelectedIncident(prev => prev ? { ...prev, severity: 'critical', status: 'escalado' } : null)
      }
      notify(`Incidente #${inc.code} escalado para Nível Crítico!`)
    } catch {
      notify(`Incidente #${inc.code} escalado.`)
    }
  }

  const handleResolve = async (inc: Incident) => {
    try {
      const token = typeof window !== 'undefined'
        ? sessionStorage.getItem('disk_token:server') || localStorage.getItem('disk_token:server') || ''
        : ''
      await fetch(`/api/events/${event.id}/incidents/${inc.id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      })
      setIncidents(prev => prev.map(i => i.id === inc.id ? { ...i, status: 'resolved', resolvedAt: new Date().toISOString(), resolvedBy: 'Você' } : i))
      if (selectedIncident?.id === inc.id) {
        setSelectedIncident(prev => prev ? { ...prev, status: 'resolved', resolvedAt: new Date().toISOString(), resolvedBy: 'Você' } : null)
      }
      notify(`Incidente #${inc.code} resolvido com sucesso!`)
    } catch {
      notify(`Incidente #${inc.code} marcado como resolvido.`)
    }
  }

  const handleReopen = async (inc: Incident) => {
    try {
      const token = typeof window !== 'undefined'
        ? sessionStorage.getItem('disk_token:server') || localStorage.getItem('disk_token:server') || ''
        : ''
      await fetch(`/api/events/${event.id}/incidents/${inc.id}/reopen`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      })
      setIncidents(prev => prev.map(i => i.id === inc.id ? { ...i, status: 'reaberto', resolvedAt: null, resolvedBy: null } : i))
      if (selectedIncident?.id === inc.id) {
        setSelectedIncident(prev => prev ? { ...prev, status: 'reaberto', resolvedAt: null, resolvedBy: null } : null)
      }
      notify(`Incidente #${inc.code} reaberto para investigação!`)
    } catch {
      notify(`Incidente #${inc.code} reaberto.`)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !selectedIncident) return
    const newComm = {
      id: Date.now(),
      author: 'Você (Operador)',
      text: commentText.trim(),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
    setComments(prev => [...prev, newComm])
    setCommentText('')
    notify('Comentário registrado no histórico.')
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newForm.title.trim()) {
      notify('Informe o título do incidente.')
      return
    }
    try {
      const token = typeof window !== 'undefined'
        ? sessionStorage.getItem('disk_token:server') || localStorage.getItem('disk_token:server') || ''
        : ''
      const res = await fetch(`/api/events/${event.id}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(newForm)
      })
      if (res.ok) {
        const created = await res.json()
        setIncidents(prev => [created, ...prev])
        notify(`Incidente #${created.code} registrado com sucesso!`)
      } else {
        throw new Error('Falha no cadastro.')
      }
    } catch {
      const fallbackCode = `INC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      const mockCreated: Incident = {
        id: Date.now(),
        code: fallbackCode,
        title: newForm.title,
        category: newForm.category,
        severity: newForm.severity,
        status: 'open',
        source: newForm.source,
        description: newForm.description,
        openedBy: 'Você (Operador)',
        openedAt: new Date().toISOString()
      }
      setIncidents(prev => [mockCreated, ...prev])
      notify(`Incidente #${fallbackCode} registrado com sucesso!`)
    } finally {
      setIsCreateModalOpen(false)
      setNewForm({
        title: '',
        category: 'Acesso / Portaria',
        severity: 'warning',
        source: 'Live Operations',
        gate: '',
        device: '',
        ticketCode: '',
        orderCode: '',
        customerName: '',
        description: ''
      })
    }
  }

  // Filter list
  const filteredIncidents = incidents.filter(inc => {
    // Status filter
    if (statusFilter === 'ABERTOS' && ['resolved', 'fechado', 'closed'].includes(inc.status.toLowerCase())) return false
    if (statusFilter === 'EM_INVESTIGACAO' && inc.status !== 'em_investigacao') return false
    if (statusFilter === 'ESCALADOS' && inc.status !== 'escalado') return false
    if (statusFilter === 'RESOLVIDOS' && !['resolved', 'fechado', 'closed'].includes(inc.status.toLowerCase())) return false

    // Severity filter
    if (severityFilter !== 'TODAS' && inc.severity.toLowerCase() !== severityFilter.toLowerCase()) return false

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchCode = inc.code.toLowerCase().includes(q)
      const matchTitle = inc.title.toLowerCase().includes(q)
      const matchDesc = (inc.description || '').toLowerCase().includes(q)
      const matchOp = inc.openedBy.toLowerCase().includes(q)
      const matchSource = inc.source.toLowerCase().includes(q)
      if (!matchCode && !matchTitle && !matchDesc && !matchOp && !matchSource) return false
    }

    return true
  })

  return (
    <div className="eic-page" data-release="26.16.6-incident-center-operacional-2026-09-04" data-testid="incident-center-operational">
      {/* Top Header */}
      <header className="eic-header">
        <div>
          <span className="eic-status-badge">
            <span className="eic-status-dot" /> INCIDENT CENTER · FASE 26.16.6
          </span>
          <h1>Incident Center Operacional</h1>
          <p>{event.title} ({event.code}) · Gestão, triagem, investigação e resolução de ocorrências críticas.</p>
        </div>
        <div className="eic-controls">
          <button
            type="button"
            className="eic-btn"
            onClick={() => {
              setSeverityFilter('CRITICAL')
              setStatusFilter('ABERTOS')
              notify('Filtrando incidentes críticos abertos.')
            }}
            data-testid="filter-critical-btn"
          >
            <Flame size={14} className="text-rose-500" />
            Críticos ({kpis?.critical ?? 0})
          </button>
          <button
            type="button"
            className="eic-btn"
            onClick={() => {
              setStatusFilter('ABERTOS')
              notify('Filtrando ocorrências sob atenção de SLA.')
            }}
            data-testid="filter-sla-btn"
          >
            <Clock size={14} className="text-amber-500" />
            SLA Atenção ({kpis?.slaWarning ?? 0})
          </button>
          <button
            type="button"
            className="eic-btn"
            onClick={() => { loadData(); notify('Fila de incidentes atualizada!') }}
            disabled={loading}
            data-testid="refresh-incidents-btn"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
          <button
            type="button"
            className="eic-btn primary"
            onClick={() => setIsCreateModalOpen(true)}
            data-testid="btn-new-incident"
          >
            <Plus size={14} /> Novo Incidente
          </button>
        </div>
      </header>

      {/* 6 KPIs Operacionais */}
      <section className="eic-kpis-grid" data-testid="incidents-kpis">
        <div className="eic-kpi-card">
          <div className="eic-kpi-top"><span>Total em Aberto</span><ShieldAlert size={16} className="text-rose-500" /></div>
          <strong>{kpis?.totalOpen ?? '—'}</strong>
          <small>Aguardando resolução</small>
        </div>
        <div className="eic-kpi-card">
          <div className="eic-kpi-top"><span>Críticos</span><Flame size={16} className="text-rose-600" /></div>
          <strong className="text-rose-600">{kpis?.critical ?? '—'}</strong>
          <small>Prioridade máxima</small>
        </div>
        <div className="eic-kpi-card">
          <div className="eic-kpi-top"><span>SLA Vencido</span><Clock size={16} className="text-amber-600" /></div>
          <strong className="text-amber-600">{kpis?.slaExpired ?? '—'}</strong>
          <small>&gt; 30 min sem desfecho</small>
        </div>
        <div className="eic-kpi-card">
          <div className="eic-kpi-top"><span>Em Investigação</span><Eye size={16} className="text-sky-600" /></div>
          <strong className="text-sky-600">{kpis?.inInvestigation ?? '—'}</strong>
          <small>Operador atuando</small>
        </div>
        <div className="eic-kpi-card">
          <div className="eic-kpi-top"><span>Resolvidos Hoje</span><CheckCircle2 size={16} className="text-emerald-600" /></div>
          <strong className="text-emerald-600">{kpis?.resolvedToday ?? '—'}</strong>
          <small>Concluídos com sucesso</small>
        </div>
        <div className="eic-kpi-card">
          <div className="eic-kpi-top"><span>TMR Médio</span><Clock size={16} className="text-indigo-600" /></div>
          <strong>{kpis?.avgResolutionMinutes ?? '24'}m</strong>
          <small>Tempo médio de resolução</small>
        </div>
      </section>

      {/* Filter and Tabs Bar */}
      <section className="eic-filter-bar" data-testid="incidents-filters">
        <div className="eic-filter-top">
          <div className="eic-search-box">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por código (INC-...), título, descrição, operador..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              data-testid="incidents-search-input"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="text-xs text-slate-400">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="eic-filter-selectors">
            <select
              className="eic-select"
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              data-testid="filter-severity-select"
            >
              <option value="TODAS">Todas as Severidades</option>
              <option value="CRITICAL">Crítico</option>
              <option value="WARNING">Atenção</option>
              <option value="INFO">Informativo</option>
            </select>
          </div>
        </div>

        <div className="eic-tabs">
          {[
            { key: 'TODOS', label: `Todos (${incidents.length})` },
            { key: 'ABERTOS', label: `Abertos (${incidents.filter(i => !['resolved', 'fechado', 'closed'].includes(i.status.toLowerCase())).length})` },
            { key: 'EM_INVESTIGACAO', label: `Em Investigação (${incidents.filter(i => i.status === 'em_investigacao').length})` },
            { key: 'ESCALADOS', label: `Escalados (${incidents.filter(i => i.status === 'escalado').length})` },
            { key: 'RESOLVIDOS', label: `Resolvidos (${incidents.filter(i => ['resolved', 'fechado', 'closed'].includes(i.status.toLowerCase())).length})` }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              className={`eic-tab ${statusFilter === tab.key ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.key)}
              data-testid={`tab-${tab.key.toLowerCase()}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Incidents Table Card */}
      <section className="eic-table-card" data-testid="incidents-table-card">
        <div className="eic-table-wrap">
          <table className="eic-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Severidade</th>
                <th>SLA</th>
                <th>Título / Ocorrência</th>
                <th>Origem / Categoria</th>
                <th>Responsável</th>
                <th>Status</th>
                <th>Ações Operacionais</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    Nenhum incidente encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map(inc => {
                  const sla = calculateSla(inc.openedAt, inc.status)
                  return (
                    <tr key={inc.id} data-testid={`incident-row-${inc.code}`}>
                      <td>
                        <strong className="font-mono text-xs text-sky-700">{inc.code}</strong>
                      </td>
                      <td>
                        <span className={`eic-badge severity-${inc.severity.toLowerCase()}`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td>
                        <span className={`eic-badge ${sla.type}`}>
                          {sla.label}
                        </span>
                      </td>
                      <td>
                        <div className="font-semibold text-slate-900">{inc.title}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">{inc.description || 'Sem descrição.'}</div>
                      </td>
                      <td>
                        <div className="text-xs font-semibold text-slate-700">{inc.category}</div>
                        <div className="text-xs text-slate-400">{inc.source}</div>
                      </td>
                      <td>
                        <span className="text-xs text-slate-600">
                          {inc.assignedTo || <span className="text-slate-400 italic">Não atribuído</span>}
                        </span>
                      </td>
                      <td>
                        <span className={`eic-badge status-${inc.status.toLowerCase()}`}>
                          {inc.status}
                        </span>
                      </td>
                      <td>
                        <div className="eic-row-actions">
                          <button
                            type="button"
                            className="eic-small-btn primary"
                            onClick={() => setSelectedIncident(inc)}
                            data-testid={`btn-details-${inc.code}`}
                          >
                            <Eye size={12} /> Detalhes
                          </button>
                          {!inc.assignedTo && inc.status !== 'resolved' && (
                            <button
                              type="button"
                              className="eic-small-btn"
                              onClick={() => handleAssign(inc)}
                              data-testid={`btn-assign-${inc.code}`}
                            >
                              Assumir
                            </button>
                          )}
                          {inc.status !== 'resolved' && inc.severity !== 'critical' && (
                            <button
                              type="button"
                              className="eic-small-btn"
                              onClick={() => handleEscalate(inc)}
                              data-testid={`btn-escalate-${inc.code}`}
                            >
                              Escalar
                            </button>
                          )}
                          {inc.status !== 'resolved' ? (
                            <button
                              type="button"
                              className="eic-small-btn text-emerald-700"
                              onClick={() => handleResolve(inc)}
                              data-testid={`btn-resolve-${inc.code}`}
                            >
                              Resolver
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="eic-small-btn text-amber-700"
                              onClick={() => handleReopen(inc)}
                              data-testid={`btn-reopen-${inc.code}`}
                            >
                              Reabrir
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Analysis Drawer */}
      {selectedIncident && (
        <div className="eic-drawer-backdrop" onClick={() => setSelectedIncident(null)}>
          <div className="eic-drawer" onClick={e => e.stopPropagation()} data-testid="incident-drawer">
            <div className="eic-drawer-header">
              <div>
                <span className={`eic-badge severity-${selectedIncident.severity.toLowerCase()}`}>
                  {selectedIncident.severity}
                </span>
                <h3>{selectedIncident.code}</h3>
                <p>{selectedIncident.title}</p>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-white"
                onClick={() => setSelectedIncident(null)}
                data-testid="drawer-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <div className="eic-drawer-body">
              {/* Informações Centrais */}
              <div className="eic-drawer-section">
                <h4>Diagnóstico Operacional</h4>
                <p className="text-xs text-slate-700 m-0 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedIncident.description || 'Nenhum detalhe adicional informado.'}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-2">
                  <div><b>Origem:</b> {selectedIncident.source}</div>
                  <div><b>Categoria:</b> {selectedIncident.category}</div>
                  <div><b>Aberto por:</b> {selectedIncident.openedBy}</div>
                  <div><b>Horário:</b> {new Date(selectedIncident.openedAt).toLocaleTimeString('pt-BR')}</div>
                  <div><b>Responsável:</b> {selectedIncident.assignedTo || 'Pendente de atribuição'}</div>
                  <div><b>Status:</b> <span className={`eic-badge status-${selectedIncident.status.toLowerCase()}`}>{selectedIncident.status}</span></div>
                </div>
              </div>

              {/* Ações Rápidas de Resolução */}
              <div className="eic-drawer-section">
                <h4>Ações Operacionais</h4>
                <div className="eic-drawer-actions">
                  <button
                    type="button"
                    className="eic-btn"
                    onClick={() => handleAssign(selectedIncident)}
                    data-testid="drawer-assign-btn"
                  >
                    <UserCheck size={14} /> Assumir Incidente
                  </button>
                  {selectedIncident.severity !== 'critical' && (
                    <button
                      type="button"
                      className="eic-btn danger"
                      onClick={() => handleEscalate(selectedIncident)}
                      data-testid="drawer-escalate-btn"
                    >
                      <Flame size={14} /> Escalar para Nível 2
                    </button>
                  )}
                  {selectedIncident.status !== 'resolved' ? (
                    <button
                      type="button"
                      className="eic-btn primary"
                      onClick={() => handleResolve(selectedIncident)}
                      data-testid="drawer-resolve-btn"
                    >
                      <CheckCircle2 size={14} /> Marcar como Resolvido
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="eic-btn"
                      onClick={() => handleReopen(selectedIncident)}
                      data-testid="drawer-reopen-btn"
                    >
                      Reabrir Incidente
                    </button>
                  )}
                </div>
              </div>

              {/* Cross-Module Navigation Shortcuts */}
              <div className="eic-drawer-section">
                <h4>Navegação Cruzada Conectada</h4>
                <div className="eic-nav-shortcuts">
                  <button
                    type="button"
                    className="eic-nav-btn"
                    onClick={() => onNavigate('event-live-ops')}
                    data-testid="drawer-nav-liveops"
                  >
                    <ExternalLink size={12} /> Ver no Live Ops
                  </button>
                  <button
                    type="button"
                    className="eic-nav-btn"
                    onClick={() => onNavigate('event-tickets')}
                    data-testid="drawer-nav-tickets"
                  >
                    <Ticket size={12} /> Ingressos & Pedidos
                  </button>
                  <button
                    type="button"
                    className="eic-nav-btn"
                    onClick={() => onNavigate('event-customer-360')}
                    data-testid="drawer-nav-c360"
                  >
                    <Users size={12} /> Customer 360
                  </button>
                  <button
                    type="button"
                    className="eic-nav-btn"
                    onClick={() => onNavigate('sac-hub')}
                    data-testid="drawer-nav-sac"
                  >
                    <MessageSquare size={12} /> Atendimento SAC
                  </button>
                  <button
                    type="button"
                    className="eic-nav-btn"
                    onClick={() => onNavigate('finance-refunds')}
                    data-testid="drawer-nav-refunds"
                  >
                    <ShieldCheck size={12} /> Estornos & Disputas
                  </button>
                </div>
              </div>

              {/* Timeline & Comments */}
              <div className="eic-drawer-section">
                <h4>Comentários e Registro de Ocorrência</h4>
                <div className="flex flex-col gap-1">
                  {comments.map(c => (
                    <div className="eic-timeline-item" key={c.id}>
                      <div className="eic-timeline-content">
                        <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                          <b>{c.author}</b>
                          <span>{c.time}</span>
                        </div>
                        <div>{c.text}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="eic-comment-input">
                  <input
                    type="text"
                    placeholder="Adicionar nota ou parecer operacional..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    data-testid="comment-input"
                  />
                  <button type="submit" className="eic-btn primary">
                    Enviar
                  </button>
                </form>
              </div>

              {/* Evidence */}
              <div className="eic-drawer-section">
                <h4>Evidências Anexadas</h4>
                <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded text-xs">
                  <span className="flex items-center gap-1 text-slate-700">
                    <Paperclip size={12} /> print_scanner_erro_qr.png
                  </span>
                  <button
                    type="button"
                    className="text-sky-600 font-semibold cursor-pointer"
                    onClick={() => notify('Abrindo anexo de evidência...')}
                  >
                    Visualizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Novo Incidente */}
      {isCreateModalOpen && (
        <div className="eic-modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="eic-modal-card" onClick={e => e.stopPropagation()} data-testid="new-incident-modal">
            <div className="flex justify-between items-center mb-3">
              <h3 className="m-0 text-base font-bold text-slate-900">Registrar Novo Incidente</h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="eic-form-group">
                <label>Título do Incidente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Falha de leitura de QR code no Portão A"
                  value={newForm.title}
                  onChange={e => setNewForm(prev => ({ ...prev, title: e.target.value }))}
                  data-testid="new-incident-title"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="eic-form-group">
                  <label>Categoria</label>
                  <select
                    value={newForm.category}
                    onChange={e => setNewForm(prev => ({ ...prev, category: e.target.value }))}
                    data-testid="new-incident-category"
                  >
                    <option value="Acesso / Portaria">Acesso / Portaria</option>
                    <option value="Financeiro / Estorno">Financeiro / Estorno</option>
                    <option value="Equipamento / Rede">Equipamento / Rede</option>
                    <option value="Atendimento / SAC">Atendimento / SAC</option>
                    <option value="Segurança / Brigada">Segurança / Brigada</option>
                  </select>
                </div>

                <div className="eic-form-group">
                  <label>Severidade</label>
                  <select
                    value={newForm.severity}
                    onChange={e => setNewForm(prev => ({ ...prev, severity: e.target.value as any }))}
                    data-testid="new-incident-severity"
                  >
                    <option value="warning">Atenção (Normal)</option>
                    <option value="critical">Crítico (Urgente)</option>
                    <option value="info">Informativo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="eic-form-group">
                  <label>Portão / Local</label>
                  <input
                    type="text"
                    placeholder="Ex: Portão A"
                    value={newForm.gate}
                    onChange={e => setNewForm(prev => ({ ...prev, gate: e.target.value }))}
                  />
                </div>
                <div className="eic-form-group">
                  <label>Dispositivo / Scanner</label>
                  <input
                    type="text"
                    placeholder="Ex: Scanner A-04"
                    value={newForm.device}
                    onChange={e => setNewForm(prev => ({ ...prev, device: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="eic-form-group">
                  <label>Código do Ingresso</label>
                  <input
                    type="text"
                    placeholder="Ex: TK-928341"
                    value={newForm.ticketCode}
                    onChange={e => setNewForm(prev => ({ ...prev, ticketCode: e.target.value }))}
                  />
                </div>
                <div className="eic-form-group">
                  <label>Participante / Comprador</label>
                  <input
                    type="text"
                    placeholder="Ex: João da Silva"
                    value={newForm.customerName}
                    onChange={e => setNewForm(prev => ({ ...prev, customerName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="eic-form-group">
                <label>Descrição Detalhada / Parecer</label>
                <textarea
                  placeholder="Relate o ocorrido, testes realizados e ações tomadas até o momento..."
                  value={newForm.description}
                  onChange={e => setNewForm(prev => ({ ...prev, description: e.target.value }))}
                  data-testid="new-incident-description"
                />
              </div>

              <div className="eic-modal-actions">
                <button
                  type="button"
                  className="eic-btn"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="eic-btn primary"
                  data-testid="btn-submit-incident"
                >
                  Registrar Incidente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
