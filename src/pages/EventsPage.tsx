import { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeftRight,
  CalendarDays,
  List,
  Rows3,
  LayoutGrid,
  ArrowLeft,
  Check,
  X
} from 'lucide-react'
import EventCard from '../components/EventCard'
import EventComparatorModal from '../components/event-commercial/EventComparatorModal'
import type { EventItem } from '../data/events'
import './eventos/events-page-enhanced.css'

type Props = {
  events: EventItem[]
  query: string
  status: 'ativos' | 'inativos' | 'todos'
  setStatus: (value: 'ativos' | 'inativos' | 'todos') => void
  view?: 'horizontal' | 'compact' | 'vertical'
  setView?: (value: any) => void
  onEdit: (event: EventItem) => void
  onLots: (event: EventItem) => void
  onDashboard: (event: EventItem) => void
  onOpen: (event: EventItem) => void
  onNavigate?: (page: any) => void
}

export const STORAGE_KEY_VIEW_MODE = 'safesaff.events.view_mode'
export const STORAGE_KEY_GRID_COLS = 'safesaff.events.grid_columns'

export default function EventsPage({
  events,
  query,
  status,
  setStatus,
  onEdit,
  onLots,
  onDashboard,
  onOpen,
  onNavigate
}: Props) {
  // 1. Preferência persistente de Visualização (Horizontal vs Vertical)
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_VIEW_MODE)
      if (saved === 'horizontal' || saved === 'vertical') return saved
    }
    return 'vertical'
  })

  // 2. Preferência persistente de Colunas no modo vertical (2, 3, 4, 5 ou 6 colunas)
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4 | 5 | 6>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_GRID_COLS)
      const num = Number(saved)
      if ([2, 3, 4, 5, 6].includes(num)) return num as 2 | 3 | 4 | 5 | 6
    }
    return 3
  })

  const handleSetViewMode = (mode: 'horizontal' | 'vertical') => {
    setViewMode(mode)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_VIEW_MODE, mode)
    }
  }

  const handleSetGridColumns = (cols: 2 | 3 | 4 | 5 | 6) => {
    setGridColumns(cols)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_GRID_COLS, String(cols))
    }
  }

  // 3. Motor de Comparação de Eventos
  const [isComparing, setIsComparing] = useState(false)
  const [selectedForCompareIds, setSelectedForCompareIds] = useState<number[]>([])
  const [showComparatorModal, setShowComparatorModal] = useState(false)

  const toggleEventCompare = (ev: EventItem) => {
    setSelectedForCompareIds(prev =>
      prev.includes(ev.id) ? prev.filter(id => id !== ev.id) : [...prev, ev.id]
    )
  }

  const cancelCompareMode = () => {
    setIsComparing(false)
    setSelectedForCompareIds([])
    setShowComparatorModal(false)
  }

  const eventsSelectedForCompare = useMemo(() => {
    return events.filter(e => selectedForCompareIds.includes(e.id))
  }, [events, selectedForCompareIds])

  // 4. Filtros reais
  const filtered = useMemo(() => {
    return events.filter(event => {
      const matchesQuery = `${event.title} ${event.venue} ${event.city}`
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesStatus =
        status === 'todos' ||
        (status === 'ativos' && event.status === 'ativo') ||
        (status === 'inativos' && event.status !== 'ativo')
      return matchesQuery && matchesStatus
    })
  }, [events, query, status])

  const revenue = filtered.reduce(
    (sum, event) => sum + Number(event.total.replace(/\./g, '').replace(',', '.')),
    0
  )

  return (
    <div data-testid="events-page">
      {/* Botão de retorno */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => (onNavigate ? onNavigate('profile-dashboard') : window.history.back())}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Dashboard</span>
        </button>
      </div>

      {/* Cabeçalho da Página */}
      <section className="page-head events-page-head">
        <div>
          <p className="eyebrow">GESTÃO DE EVENTOS</p>
          <h1>Eventos</h1>
          <p className="head-subtitle">
            Acompanhe vendas, ocupação, disponibilidade, configurações e comparativos comerciais.
          </p>
        </div>

        <div className="toolbar events-toolbar events-toolbar-enhanced">
          {/* Botão de Comparação */}
          <button
            type="button"
            className={`tool-btn events-compare-btn ${isComparing ? 'active' : ''}`}
            onClick={() => {
              if (isComparing) {
                cancelCompareMode()
              } else {
                setIsComparing(true)
              }
            }}
            data-testid="btn-toggle-compare-mode"
          >
            <ArrowLeftRight size={17} />
            <span>{isComparing ? 'Cancelar Comparação' : 'Comparar'}</span>
          </button>

          {/* Alternador Horizontal / Vertical */}
          <div className="events-view-modes" data-testid="events-view-modes">
            <button
              type="button"
              className={`events-mode-btn ${viewMode === 'horizontal' ? 'active' : ''}`}
              onClick={() => handleSetViewMode('horizontal')}
              data-testid="btn-view-horizontal"
            >
              <Rows3 size={16} />
              Horizontal
            </button>
            <button
              type="button"
              className={`events-mode-btn ${viewMode === 'vertical' ? 'active' : ''}`}
              onClick={() => handleSetViewMode('vertical')}
              data-testid="btn-view-vertical"
            >
              <LayoutGrid size={16} />
              Vertical
            </button>
          </div>

          {/* Seletor de Colunas no modo Vertical (2, 3, 4, 5, 6) */}
          {viewMode === 'vertical' && (
            <div className="events-col-selector" data-testid="events-col-selector">
              <span className="events-col-label">Colunas:</span>
              {([2, 3, 4, 5, 6] as const).map(colNum => (
                <button
                  key={`col-${colNum}`}
                  type="button"
                  className={`events-col-btn ${gridColumns === colNum ? 'active' : ''}`}
                  onClick={() => handleSetGridColumns(colNum)}
                  data-testid={`btn-cols-${colNum}`}
                  title={`${colNum} colunas`}
                >
                  {colNum}
                </button>
              ))}
            </div>
          )}

          {/* Abas de Status Ativos / Inativos / Todos */}
          <div className="status-tabs events-status-tabs" data-testid="events-status-tabs">
            <button
              data-testid="events-filter-active"
              className={status === 'ativos' ? 'active' : ''}
              onClick={() => setStatus('ativos')}
            >
              <CalendarDays size={16} />
              Ativos
            </button>
            <button
              data-testid="events-filter-inactive"
              className={status === 'inativos' ? 'active' : ''}
              onClick={() => setStatus('inativos')}
            >
              <CalendarDays size={16} />
              Inativos
            </button>
            <button
              data-testid="events-filter-all"
              className={status === 'todos' ? 'active' : ''}
              onClick={() => setStatus('todos')}
            >
              <List size={16} />
              Todos
            </button>
          </div>
        </div>
      </section>

      {/* Banner de Comparação Ativa */}
      {isComparing && (
        <div className="events-compare-banner" data-testid="events-compare-banner">
          <div className="events-compare-info">
            <span className="events-compare-badge">
              {selectedForCompareIds.length} selecionado(s)
            </span>
            <span>
              {selectedForCompareIds.length < 2
                ? 'Selecione no mínimo 2 eventos nos cards abaixo para comparar.'
                : 'Eventos prontos para comparação lado a lado.'}
            </span>
          </div>
          <div className="events-compare-actions">
            <button
              type="button"
              className="events-btn-cancel-compare"
              onClick={cancelCompareMode}
              data-testid="btn-cancel-compare"
            >
              <X size={14} className="inline mr-1" />
              Cancelar
            </button>
            <button
              type="button"
              className="events-btn-execute-compare"
              disabled={selectedForCompareIds.length < 2}
              onClick={() => setShowComparatorModal(true)}
              data-testid="btn-execute-compare"
            >
              <ArrowLeftRight size={14} className="inline mr-1" />
              Comparar selecionados ({selectedForCompareIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Faixa de Indicadores de Resumo */}
      <section className="summary-strip events-summary-strip">
        <div>
          <span>Eventos encontrados</span>
          <strong>{filtered.length}</strong>
        </div>
        <div>
          <span>Ingressos disponíveis</span>
          <strong>
            {filtered.reduce((a, b) => a + b.available, 0).toLocaleString('pt-BR')}
          </strong>
        </div>
        <div>
          <span>Vendas</span>
          <strong>
            {filtered.reduce((a, b) => a + b.sales, 0).toLocaleString('pt-BR')}
          </strong>
        </div>
        <div>
          <span>Receita</span>
          <strong className="events-revenue-full">
            {revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
          <strong className="events-revenue-compact">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              notation: 'compact',
              maximumFractionDigits: 2
            }).format(revenue)}
          </strong>
        </div>
      </section>

      {/* Grid de Cards com suporte a Horizontal e Vertical (2–6 Colunas) */}
      <section
        data-testid="event-grid"
        className={`event-grid ${
          viewMode === 'horizontal' ? 'view-horizontal' : `view-vertical cols-${gridColumns}`
        }`}
      >
        {filtered.length ? (
          filtered.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={onEdit}
              onLots={onLots}
              onDashboard={onDashboard}
              onOpen={onOpen}
              isComparing={isComparing}
              isSelectedForCompare={selectedForCompareIds.includes(event.id)}
              onToggleCompare={toggleEventCompare}
            />
          ))
        ) : (
          <div className="empty-state">Nenhum evento encontrado com os filtros atuais.</div>
        )}
      </section>

      {/* Modal do Comparador Comercial de Eventos */}
      {showComparatorModal && (
        <EventComparatorModal
          events={eventsSelectedForCompare}
          onClose={() => setShowComparatorModal(false)}
          onOpenEvent={event => {
            setShowComparatorModal(false)
            onOpen(event)
          }}
        />
      )}
    </div>
  )
}
