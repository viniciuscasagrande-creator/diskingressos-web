import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { 
  ArrowLeftRight, CalendarDays, Columns3, LayoutPanelTop, 
  List, Rows3, ArrowLeft, X, Check, Ticket, CircleDollarSign, Users 
} from 'lucide-react'
import EventCard from '../components/EventCard'
import type { EventItem } from '../data/events'
import { 
  DiskPageHeader, 
  DiskKpiCard, 
  DiskButton 
} from '../design-system'

type Props = {
  events: EventItem[]
  query: string
  status: 'ativos' | 'inativos' | 'todos' | string
  setStatus: (value: any) => void
  view: 'horizontal' | 'vertical' | 'compact' | string
  setView: (value: any) => void
  onEdit: (event: EventItem) => void
  onLots: (event: EventItem) => void
  onDashboard: (event: EventItem) => void
  onOpen: (event: EventItem) => void
  onNavigate?: (page: any, context?: any) => void
}

export default function EventsPage({
  events, 
  query, 
  status, 
  setStatus, 
  view, 
  setView, 
  onEdit, 
  onLots, 
  onDashboard, 
  onOpen, 
  onNavigate
}: Props) {
  const [compareMode, setCompareMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [columns, setColumns] = useState<2|3|4|5|6>(() => {
    if (typeof window === 'undefined') return 3
    const n = Number(localStorage.getItem('safesaff.events.vertical.columns') || 3)
    return ([2, 3, 4, 5, 6].includes(n) ? n : 3) as 2|3|4|5|6
  })

  const filtered = useMemo(() => events.filter(event => {
    const matchesQuery = `${event.title} ${event.venue} ${event.city}`.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = status === 'todos' || (status === 'ativos' && event.status === 'ativo') || (status === 'inativos' && event.status !== 'ativo')
    return matchesQuery && matchesStatus
  }), [events, query, status])

  const selected = filtered.filter(e => selectedIds.includes(e.id))
  const revenue = filtered.reduce((sum, event) => sum + Number(event.total.replace(/\./g, '').replace(',', '.')), 0)
  const choose = (event: EventItem) => setSelectedIds(prev => prev.includes(event.id) ? prev.filter(id => id !== event.id) : [...prev, event.id])
  const cancelCompare = () => { setCompareMode(false); setSelectedIds([]); setShowComparison(false) }
  const setColumnCount = (n: 2|3|4|5|6) => { setColumns(n); localStorage.setItem('safesaff.events.vertical.columns', String(n)) }

  return (
    <div data-testid="events-page" className="w-full space-y-6 animate-fadeIn">
      {/* 1. Cabeçalho Oficial Unificado DiskPageHeader (Elimina Duplicação) */}
      <DiskPageHeader
        eyebrow="GESTÃO DE EVENTOS"
        title="Eventos"
        description="Acompanhe vendas, ocupação, disponibilidade e configurações de todos os seus eventos."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <DiskButton
              variant="outline"
              size="sm"
              icon={<ArrowLeft size={14} />}
              onClick={() => onNavigate ? onNavigate('profile-dashboard') : window.history.back()}
            >
              Voltar ao Dashboard
            </DiskButton>
            <button
              data-testid="btn-toggle-compare-mode"
              className={`tool-btn events-compare-btn ${compareMode ? 'active' : ''}`}
              onClick={() => compareMode ? cancelCompare() : setCompareMode(true)}
            >
              {compareMode ? <X size={18} /> : <ArrowLeftRight size={18} />}
              <span>{compareMode ? 'Cancelar' : 'Comparar'}</span>
            </button>
          </div>
        }
      />

      {/* 2. Barra Semântica de Controles: Layout e Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-card bg-[var(--disk-bg-surface)] border border-[var(--disk-border-subtle)] shadow-xs">
        {/* Modos de visualização */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="view-switch events-view-switch flex items-center gap-1 bg-[var(--disk-bg-surface-sunken)] p-1 rounded-btn border border-[var(--disk-border-subtle)]">
            <button
              data-testid="btn-view-horizontal"
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${(view === 'horizontal' || view === 'compact') ? 'active bg-[var(--disk-primary)] text-white shadow-xs' : 'text-[var(--disk-text-secondary)] hover:text-[var(--disk-text-primary)]'}`}
              onClick={() => setView('horizontal')}
            >
              <Rows3 size={16} />
              <span>Horizontal</span>
            </button>
            <button
              data-testid="btn-view-vertical"
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${view === 'vertical' ? 'active bg-[var(--disk-primary)] text-white shadow-xs' : 'text-[var(--disk-text-secondary)] hover:text-[var(--disk-text-primary)]'}`}
              onClick={() => setView('vertical')}
            >
              <LayoutPanelTop size={16} />
              <span>Vertical</span>
            </button>
          </div>

          {view === 'vertical' && (
            <div data-testid="events-col-selector" className="event-columns-control flex items-center gap-1 bg-[var(--disk-bg-surface-sunken)] px-2 py-1.5 rounded-btn border border-[var(--disk-border-subtle)] text-xs" title="Quantidade de colunas">
              <Columns3 size={15} className="text-[var(--disk-text-muted)]" />
              {([2, 3, 4, 5, 6] as const).map(n => (
                <button
                  key={n}
                  data-testid={`btn-cols-${n}`}
                  className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs transition cursor-pointer ${columns === n ? 'active bg-[var(--disk-primary)] text-white' : 'text-[var(--disk-text-secondary)] hover:text-[var(--disk-text-primary)]'}`}
                  onClick={() => setColumnCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Tabs */}
        <div className="status-tabs events-status-tabs flex items-center gap-1 bg-[var(--disk-bg-surface-sunken)] p-1 rounded-btn border border-[var(--disk-border-subtle)]">
          <button
            data-testid="events-filter-active"
            className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${status === 'ativos' ? 'active bg-[var(--disk-primary)] text-white shadow-xs' : 'text-[var(--disk-text-secondary)] hover:text-[var(--disk-text-primary)]'}`}
            onClick={() => setStatus('ativos')}
          >
            <CalendarDays size={16} />
            <span>Ativos</span>
          </button>
          <button
            data-testid="events-filter-inactive"
            className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${status === 'inativos' ? 'active bg-[var(--disk-primary)] text-white shadow-xs' : 'text-[var(--disk-text-secondary)] hover:text-[var(--disk-text-primary)]'}`}
            onClick={() => setStatus('inativos')}
          >
            <CalendarDays size={16} />
            <span>Inativos</span>
          </button>
          <button
            data-testid="events-filter-all"
            className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${status === 'todos' ? 'active bg-[var(--disk-primary)] text-white shadow-xs' : 'text-[var(--disk-text-secondary)] hover:text-[var(--disk-text-primary)]'}`}
            onClick={() => setStatus('todos')}
          >
            <List size={16} />
            <span>Todos</span>
          </button>
        </div>
      </div>

      {/* Banner de Comparação */}
      {compareMode && (
        <div data-testid="events-compare-banner" className="events-compare-banner p-3.5 rounded-card bg-[var(--disk-bg-surface-sunken)] border border-[var(--disk-primary)] flex items-center justify-between gap-3 text-xs text-[var(--disk-text-primary)]">
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={17} className="text-[var(--disk-primary)]" />
            <span><strong>Modo de comparação.</strong> Selecione pelo menos 2 eventos para comparar desempenho comercial.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">{selectedIds.length} selecionado(s)</span>
            <button data-testid="btn-cancel-compare" className="text-xs px-2.5 py-1 rounded-btn bg-[var(--disk-bg-surface)] text-[var(--disk-text-secondary)] hover:text-[var(--disk-text-primary)] border border-[var(--disk-border-subtle)]" onClick={cancelCompare}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* 3. Métricas Consolidadas usando DiskKpiCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 events-summary-strip">
        <DiskKpiCard
          label="EVENTOS ENCONTRADOS"
          value={filtered.length}
          accent="brand"
          icon={<Ticket size={20} />}
        />
        <DiskKpiCard
          label="INGRESSOS DISPONÍVEIS"
          value={filtered.reduce((a, b) => a + b.available, 0).toLocaleString('pt-BR')}
          accent="info"
          icon={<Ticket size={20} />}
        />
        <DiskKpiCard
          label="VENDAS"
          value={`${filtered.reduce((a, b) => a + b.sales, 0).toLocaleString('pt-BR')} un.`}
          accent="purple"
          icon={<Users size={20} />}
        />
        <DiskKpiCard
          label="RECEITA TOTAL"
          value={
            <span className="flex items-center gap-1 font-mono">
              <span className="events-revenue-full">
                {revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <span className="events-revenue-compact">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 2 }).format(revenue)}
              </span>
            </span>
          }
          accent="success"
          icon={<CircleDollarSign size={20} />}
        />
      </div>

      {/* 4. Grade de Eventos Oficial */}
      <section 
        data-testid="event-grid" 
        className={`event-grid ${view === 'vertical' ? 'view-vertical' : 'view-horizontal'} ${view} cols-${columns}`} 
        style={view === 'vertical' ? { '--event-columns': columns } as CSSProperties : undefined}
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
              selectionMode={compareMode} 
              selected={selectedIds.includes(event.id)} 
              onSelect={choose}
            />
          ))
        ) : (
          <div className="empty-state p-12 text-center text-xs text-[var(--disk-text-muted)] bg-[var(--disk-bg-surface)] rounded-card border border-[var(--disk-border-subtle)]">
            Nenhum evento encontrado com os filtros atuais.
          </div>
        )}
      </section>

      {/* Barra de Ação de Comparação */}
      {compareMode && (
        <div className="compare-actionbar fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[var(--disk-bg-surface)] border border-[var(--disk-border-subtle)] shadow-2xl px-5 py-3 rounded-card flex items-center gap-4 text-xs">
          <div>
            <span className="text-[var(--disk-text-muted)]">Eventos selecionados: </span>
            <strong className="text-[var(--disk-text-primary)]">{selectedIds.length}</strong>
          </div>
          <button 
            data-testid="btn-execute-compare" 
            disabled={selectedIds.length < 2} 
            onClick={() => setShowComparison(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-btn bg-[var(--disk-primary)] hover:bg-[var(--disk-primary-hover)] text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={16} />
            Comparar selecionados
          </button>
        </div>
      )}

      {/* Modal de Comparação */}
      {showComparison && (
        <div className="comparison-overlay fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowComparison(false)}>
          <div className="comparison-modal max-w-4xl w-full bg-[var(--disk-bg-surface)] border border-[var(--disk-border-subtle)] rounded-card shadow-2xl overflow-hidden animate-scaleUp" data-testid="event-comparator-modal" onClick={e => e.stopPropagation()}>
            <div className="comparison-head p-5 border-b border-[var(--disk-border-subtle)] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--disk-primary)]">COMPARAÇÃO DE EVENTOS</p>
                <h2 className="text-lg font-extrabold text-[var(--disk-text-primary)]">Comparador Comercial de Eventos</h2>
                <p className="text-xs text-[var(--disk-text-muted)]">Desempenho lado a lado</p>
              </div>
              <button data-testid="btn-close-comparator" onClick={() => setShowComparison(false)} className="p-2 rounded-btn text-[var(--disk-text-secondary)] hover:text-[var(--disk-text-primary)] hover:bg-[var(--disk-bg-surface-hover)]">
                <X size={18} />
              </button>
            </div>
            <div className="comparison-table-wrap overflow-x-auto p-4">
              <table className="comparison-table w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--disk-border-subtle)] text-[var(--disk-text-muted)]">
                    <th className="py-2.5 px-3">Métrica</th>
                    {selected.map(e => (
                      <th key={e.id} className="py-2.5 px-3 text-[var(--disk-text-primary)] font-bold">{e.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--disk-border-subtle)] text-[var(--disk-text-secondary)]">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[var(--disk-text-primary)]">Receita Bruta Total</td>
                    {selected.map(e => <td key={e.id} className="py-2.5 px-3 font-mono">R$ {e.total}</td>)}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[var(--disk-text-primary)]">Ingressos Vendidos</td>
                    {selected.map(e => <td key={e.id} className="py-2.5 px-3 font-mono">{e.sales.toLocaleString('pt-BR')}</td>)}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[var(--disk-text-primary)]">Estoque Disponível</td>
                    {selected.map(e => <td key={e.id} className="py-2.5 px-3 font-mono">{e.available.toLocaleString('pt-BR')}</td>)}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[var(--disk-text-primary)]">Cortesias</td>
                    {selected.map(e => <td key={e.id} className="py-2.5 px-3 font-mono">{e.courtesy.toLocaleString('pt-BR')}</td>)}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-[var(--disk-text-primary)]">Taxa de Ocupação</td>
                    {selected.map(e => <td key={e.id} className="py-2.5 px-3 font-mono">{e.occupancy}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
