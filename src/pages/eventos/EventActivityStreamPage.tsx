import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Activity, Search, RefreshCw, Download, ArrowUpRight, AlertTriangle,
  Clock, ShieldAlert, Filter, CheckCircle2, Ticket, Boxes, Undo2,
  CalendarDays, MapPin, ChevronRight, Layers, ExternalLink, HelpCircle
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import type { PageKey } from '../../components/ModuleSidebar'
import { getEventActivityStream, type AtividadeEvento } from '../../services/api'
import './event-activity-stream.css'

interface Props {
  event: EventItem
  onNavigate: (page: any, context?: any) => void
  notify: (m: string) => void
  embedded?: boolean
}

export default function EventActivityStreamPage({ event, onNavigate, notify, embedded = false }: Props) {
  const [activities, setActivities] = useState<AtividadeEvento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Filtros operacionais
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState('todas')
  const [severityFilter, setSeverityFilter] = useState('todas')
  const [periodFilter, setPeriodFilter] = useState('all')

  const fetchActivities = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      setError(null)
      setActivities([])
    }

    try {
      const res = await getEventActivityStream(event.id, {
        origem: sourceFilter !== 'todas' ? sourceFilter : undefined,
        severidade: severityFilter !== 'todas' ? severityFilter : undefined,
        busca: searchTerm.trim() || undefined,
        periodo: periodFilter,
        cursor: isLoadMore && nextCursor ? nextCursor : undefined,
        limit: 30
      })

      if (isLoadMore) {
        setActivities(prev => [...prev, ...(res.data || [])])
      } else {
        setActivities(res.data || [])
      }

      setTotalCount(res.meta?.total || (res.data || []).length)
      setHasMore(Boolean(res.meta?.hasMore))
      setNextCursor(res.meta?.cursor || null)
      setLastUpdated(new Date())
    } catch (err: any) {
      setError(err?.message || 'Não foi possível carregar o histórico de atividades.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [event.id, sourceFilter, severityFilter, searchTerm, periodFilter, nextCursor])

  // Carga inicial e quando os filtros mudam
  useEffect(() => {
    fetchActivities(false)
  }, [sourceFilter, severityFilter, periodFilter])

  // Debounce da pesquisa de texto
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchActivities(false)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Agrupamento por dia ("Hoje", "Ontem" ou data pt-BR)
  const groupedActivities = useMemo(() => {
    const groups: Record<string, AtividadeEvento[]> = {}
    const todayStr = new Date().toLocaleDateString('pt-BR')
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toLocaleDateString('pt-BR')

    for (const act of activities) {
      const actDate = new Date(act.dataHora).toLocaleDateString('pt-BR')
      let label = actDate
      if (actDate === todayStr) label = 'Hoje'
      else if (actDate === yesterdayStr) label = 'Ontem'

      if (!groups[label]) groups[label] = []
      groups[label].push(act)
    }
    return groups
  }, [activities])

  // Drilldown handler inteligente por entidade
  const handleOpenEntity = (act: AtividadeEvento) => {
    if (act.linkEntidade.href) {
      // Rota canônica protegida de Estornos
      if (act.origem === 'estorno' || act.linkEntidade.targetKey === 'finance-refunds') {
        onNavigate('finance-refunds')
        notify(`Abrindo Centro de Controle de Estornos: #${act.entidadeId}`)
        return
      }
      window.location.href = act.linkEntidade.href
      return
    }

    if (act.linkEntidade.targetKey) {
      onNavigate(act.linkEntidade.targetKey, { entityId: act.entidadeId })
      notify(`Abrindo ${act.linkEntidade.modulo}: ${act.titulo}`)
    }
  }

  // Exportação CSV formatada em pt-BR
  const handleExport = () => {
    if (!activities.length) {
      notify('Nenhuma atividade para exportar.')
      return
    }

    const headers = ['Data/Hora', 'Origem', 'Atividade', 'Descrição', 'Identificador', 'Severidade', 'Responsável']
    const rows = activities.map(a => [
      `"${new Date(a.dataHora).toLocaleString('pt-BR')}"`,
      `"${a.origem.toUpperCase()}"`,
      `"${a.titulo.replace(/"/g, '""')}"`,
      `"${a.descricao.replace(/"/g, '""')}"`,
      `"${a.entidadeId}"`,
      `"${a.severidade.toUpperCase()}"`,
      `"${a.usuarioNome || 'Sistema'}"`
    ])

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `historico-atividades-evento-${event.id}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notify('Histórico de atividades exportado com sucesso em CSV.')
  }

  return (
    <div className="activity-stream-page" data-testid="event-activity-stream">
      {/* Cabeçalho */}
      <header className="activity-stream-header">
        <div className="activity-stream-title-area">
          <div className="activity-stream-subtitle">
            <span>HISTÓRICO OPERACIONAL UNIFICADO</span>
            <span>•</span>
            <span>{event.title} (ID {event.id})</span>
          </div>
          <h2>
            <Activity className="text-sky-400" size={28} />
            Histórico de Atividades
          </h2>
          <p className="text-sm text-slate-400">
            Linha do tempo cronológica com correlação direta de pedidos, ingressos, check-ins, incidentes, SAC e financeiro.
          </p>
        </div>

        <div className="activity-stream-actions">
          <span className="text-xs text-slate-400 font-medium">
            Atualizado às {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <button
            type="button"
            className="activity-action-btn secondary"
            onClick={() => fetchActivities(false)}
            disabled={loading}
            data-testid="activity-refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
          <button
            type="button"
            className="activity-action-btn primary"
            onClick={handleExport}
            data-testid="activity-export"
          >
            <Download size={15} />
            Exportar
          </button>
        </div>
      </header>

      {/* Strip de KPIs Rápidos */}
      <section className="activity-kpi-strip">
        <div className="activity-kpi-card">
          <span className="activity-kpi-label">Ocorrências Filtradas</span>
          <span className="activity-kpi-val">{totalCount}</span>
        </div>
        <div className="activity-kpi-card">
          <span className="activity-kpi-label">Pedidos Registrados</span>
          <span className="activity-kpi-val text-blue-400">
            {activities.filter(a => a.origem === 'pedido').length}
          </span>
        </div>
        <div className="activity-kpi-card">
          <span className="activity-kpi-label">Check-ins & Acessos</span>
          <span className="activity-kpi-val text-emerald-400">
            {activities.filter(a => a.origem === 'checkin').length}
          </span>
        </div>
        <div className="activity-kpi-card">
          <span className="activity-kpi-label">Incidentes Operacionais</span>
          <span className="activity-kpi-val text-amber-400">
            {activities.filter(a => a.origem === 'incidente').length}
          </span>
        </div>
        <div className="activity-kpi-card">
          <span className="activity-kpi-label">Solicitações de Estorno</span>
          <span className="activity-kpi-val text-orange-400">
            {activities.filter(a => a.origem === 'estorno').length}
          </span>
        </div>
      </section>

      {/* Barra de Filtros Operacionais */}
      <section className="activity-filter-bar">
        <div className="activity-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por pedido, cliente, ingresso, código ou descrição..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            data-testid="activity-search"
          />
        </div>

        <select
          className="activity-filter-select"
          value={periodFilter}
          onChange={e => setPeriodFilter(e.target.value)}
        >
          <option value="all">Todas as datas</option>
          <option value="today">Hoje</option>
          <option value="24h">Últimas 24 horas</option>
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
        </select>

        <select
          className="activity-filter-select"
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
          data-testid="activity-filter-source"
        >
          <option value="todas">Todas as origens</option>
          <option value="pedido">Pedidos</option>
          <option value="checkin">Check-ins</option>
          <option value="incidente">Incidentes</option>
          <option value="estorno">Estornos</option>
          <option value="financeiro">Financeiro</option>
          <option value="inventario">Inventário</option>
          <option value="sac">SAC / Atendimento</option>
          <option value="marketing">Marketing</option>
          <option value="preparacao">Preparação</option>
        </select>

        <select
          className="activity-filter-select"
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          data-testid="activity-filter-severity"
        >
          <option value="todas">Todas as severidades</option>
          <option value="informativa">Informativa</option>
          <option value="atencao">Atenção</option>
          <option value="critica">Crítica</option>
        </select>
      </section>

      {/* Linha do Tempo / Timeline */}
      <main className="activity-timeline-container">
        {loading && !activities.length && (
          <div className="flex flex-col gap-3">
            <div className="activity-skeleton-row" />
            <div className="activity-skeleton-row" />
            <div className="activity-skeleton-row" />
          </div>
        )}

        {error && (
          <div className="activity-error-state">
            <AlertTriangle size={36} className="text-red-400" />
            <strong>Não foi possível carregar o histórico de atividades</strong>
            <p>{error}</p>
            <button
              type="button"
              className="activity-action-btn primary"
              onClick={() => fetchActivities(false)}
            >
              <RefreshCw size={15} /> Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && activities.length === 0 && (
          <div className="activity-empty-state">
            <HelpCircle size={36} className="text-slate-500" />
            <strong>Nenhuma atividade encontrada</strong>
            <p>Nenhuma ocorrência registrada para os filtros selecionados no momento.</p>
          </div>
        )}

        {Object.entries(groupedActivities).map(([dayLabel, items]) => (
          <section key={dayLabel} className="activity-day-group">
            <div className="activity-day-heading">
              <CalendarDays size={14} />
              <span>{dayLabel}</span>
              <span className="text-slate-500 font-normal">({items.length} eventos)</span>
            </div>

            {items.map(act => (
              <article
                key={act.id}
                className={`activity-item-card severidade-${act.severidade}`}
                data-testid="activity-item"
              >
                <div className="activity-item-main">
                  <span className="activity-time-pill">
                    {new Date(act.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div className="activity-item-content">
                    <div className="activity-item-meta">
                      <span className={`activity-origin-pill origem-${act.origem}`}>
                        {act.origem}
                      </span>
                      {act.usuarioNome && (
                        <span className="text-xs text-slate-400 font-medium">
                          {act.usuarioNome}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        {new Date(act.dataHora).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <h4 className="activity-item-title">{act.titulo}</h4>
                    <p className="activity-item-desc">{act.descricao}</p>
                  </div>
                </div>

                <div className="activity-item-right">
                  <button
                    type="button"
                    className="activity-drilldown-btn"
                    onClick={() => handleOpenEntity(act)}
                    data-testid="activity-open-entity"
                  >
                    <span>{act.linkEntidade.label}</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </article>
            ))}
          </section>
        ))}

        {hasMore && (
          <div className="activity-load-more-area">
            <button
              type="button"
              className="activity-load-more-btn"
              onClick={() => fetchActivities(true)}
              disabled={loadingMore}
              data-testid="activity-load-more"
            >
              {loadingMore ? <RefreshCw size={15} className="animate-spin" /> : null}
              {loadingMore ? 'Carregando mais...' : 'Carregar mais atividades'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
