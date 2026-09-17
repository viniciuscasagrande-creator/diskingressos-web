import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { 
  ArrowLeftRight, CalendarDays, Columns3, LayoutPanelTop, 
  List, Rows3, ArrowLeft, X, Check, Ticket, CircleDollarSign, Users 
} from 'lucide-react'
import EventCard from '../components/EventCard'
import type { EventItem } from '../data/events'
import { LimitlessPage } from '../integrations/limitless/LimitlessPage'

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
    <LimitlessPage dataTestId="events-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* 1. Cabeçalho Limitless Oficial */}
      <div className="card border-0 shadow-none bg-transparent mb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--ll-border)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-subtle-primary">
                Gestão de Eventos
              </span>
              <span className="badge badge-subtle-info">
                {filtered.length} {filtered.length === 1 ? 'evento ativo' : 'eventos ativos'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--ll-text)] flex items-center gap-2.5">
              <CalendarDays className="text-[var(--ll-primary)] w-7 h-7" />
              Eventos
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ll-text-2)] mt-1 leading-relaxed">
              Acompanhe vendas, ocupação, disponibilidade e configurações de todos os seus eventos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center">
            <button
              type="button"
              className="btn-light text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              onClick={() => onNavigate ? onNavigate('profile-dashboard') : window.history.back()}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Dashboard</span>
            </button>
            <button
              type="button"
              data-testid="btn-toggle-compare-mode"
              className={`text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                compareMode 
                  ? 'bg-rose-600 text-white hover:bg-rose-700' 
                  : 'btn-primary'
              }`}
              onClick={() => compareMode ? cancelCompare() : setCompareMode(true)}
            >
              {compareMode ? <X className="w-3.5 h-3.5" /> : <ArrowLeftRight className="w-3.5 h-3.5" />}
              <span>{compareMode ? 'Cancelar' : 'Comparar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Barra Semântica de Controles: Layout e Filtros Limitless */}
      <div className="card p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Modos de visualização */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="limitless-tabs">
            <button
              data-testid="btn-view-horizontal"
              type="button"
              className={`limitless-tab-btn flex items-center gap-1.5 ${(view === 'horizontal' || view === 'compact') ? 'active' : ''}`}
              onClick={() => setView('horizontal')}
            >
              <Rows3 className="w-3.5 h-3.5" />
              <span>Horizontal</span>
            </button>
            <button
              data-testid="btn-view-vertical"
              type="button"
              className={`limitless-tab-btn flex items-center gap-1.5 ${view === 'vertical' ? 'active' : ''}`}
              onClick={() => setView('vertical')}
            >
              <LayoutPanelTop className="w-3.5 h-3.5" />
              <span>Vertical</span>
            </button>
          </div>

          {view === 'vertical' && (
            <div data-testid="events-col-selector" className="flex items-center gap-1 bg-[var(--ll-muted)] px-2.5 py-1 rounded-lg border border-[var(--ll-border)] text-xs" title="Quantidade de colunas">
              <Columns3 className="w-3.5 h-3.5 text-[var(--ll-text-muted)]" />
              {([2, 3, 4, 5, 6] as const).map(n => (
                <button
                  key={n}
                  data-testid={`btn-cols-${n}`}
                  type="button"
                  className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs transition cursor-pointer ${
                    columns === n 
                      ? 'bg-[var(--ll-primary)] text-white shadow-xs' 
                      : 'text-[var(--ll-text-2)] hover:text-[var(--ll-text)]'
                  }`}
                  onClick={() => setColumnCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Tabs */}
        <div className="limitless-tabs">
          <button
            data-testid="events-filter-active"
            type="button"
            className={`limitless-tab-btn flex items-center gap-1.5 ${status === 'ativos' ? 'active' : ''}`}
            onClick={() => setStatus('ativos')}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Ativos</span>
          </button>
          <button
            data-testid="events-filter-inactive"
            type="button"
            className={`limitless-tab-btn flex items-center gap-1.5 ${status === 'inativos' ? 'active' : ''}`}
            onClick={() => setStatus('inativos')}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Inativos</span>
          </button>
          <button
            data-testid="events-filter-all"
            type="button"
            className={`limitless-tab-btn flex items-center gap-1.5 ${status === 'todos' ? 'active' : ''}`}
            onClick={() => setStatus('todos')}
          >
            <List className="w-3.5 h-3.5" />
            <span>Todos</span>
          </button>
        </div>
      </div>

      {/* Banner de Comparação */}
      {compareMode && (
        <div data-testid="events-compare-banner" className="card p-3.5 bg-[var(--ll-surface)] border-l-4 border-l-[var(--ll-primary)] shadow-sm flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[var(--ll-text)]">
            <ArrowLeftRight className="w-4 h-4 text-[var(--ll-primary)]" />
            <span><strong>Modo de comparação ativo.</strong> Selecione pelo menos 2 eventos para comparar desempenho comercial.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--ll-primary)]">{selectedIds.length} selecionado(s)</span>
            <button 
              data-testid="btn-cancel-compare" 
              className="btn-light text-xs py-1 px-2.5 cursor-pointer" 
              onClick={cancelCompare}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* 3. Métricas Consolidadas no Estilo Limitless */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 events-summary-strip">
        <div className="kpi-card-limitless">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ll-text-muted)]">
              Eventos Encontrados
            </span>
            <div className="text-xl lg:text-2xl font-black mt-1 text-[var(--ll-text)]">
              {filtered.length}
            </div>
            <p className="text-[11px] text-[var(--ll-text-muted)] font-medium mt-1">
              {status === 'todos' ? 'Todos os cadastros' : status === 'ativos' ? 'Em operação' : 'Inativos'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-[var(--ll-primary)] flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="kpi-card-limitless">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ll-text-muted)]">
              Ingressos Disponíveis
            </span>
            <div className="text-xl lg:text-2xl font-black mt-1 text-[var(--ll-text)]">
              {filtered.reduce((a, b) => a + b.available, 0).toLocaleString('pt-BR')}
            </div>
            <p className="text-[11px] text-[var(--ll-text-muted)] font-medium mt-1">
              Disponíveis para venda
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="kpi-card-limitless">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ll-text-muted)]">
              Ingressos Vendidos
            </span>
            <div className="text-xl lg:text-2xl font-black mt-1 text-[var(--ll-text)]">
              {filtered.reduce((a, b) => a + b.sales, 0).toLocaleString('pt-BR')}
            </div>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
              Consolidado de emissão
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="kpi-card-limitless">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ll-text-muted)]">
              Receita Total
            </span>
            <div className="text-xl lg:text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400 font-mono">
              {revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              Vendas brutas totais
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CircleDollarSign className="w-6 h-6" />
          </div>
        </div>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowComparison(false)}>
          <div className="card max-w-4xl w-full shadow-2xl overflow-hidden animate-scaleUp" data-testid="event-comparator-modal" onClick={e => e.stopPropagation()}>
            <div className="card-header pb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--ll-primary)]">COMPARAÇÃO DE EVENTOS</p>
                <h2 className="text-lg font-extrabold text-[var(--ll-text)]">Comparador Comercial de Eventos</h2>
                <p className="text-xs text-[var(--ll-text-muted)]">Desempenho lado a lado</p>
              </div>
              <button data-testid="btn-close-comparator" onClick={() => setShowComparison(false)} className="p-2 rounded-lg text-[var(--ll-text-muted)] hover:text-[var(--ll-text)] hover:bg-[var(--ll-muted)] transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="table w-full text-left text-xs">
                <thead>
                  <tr>
                    <th>Métrica</th>
                    {selected.map(e => (
                      <th key={e.id} className="text-[var(--ll-text)] font-bold">{e.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold text-[var(--ll-text)]">Receita Bruta Total</td>
                    {selected.map(e => <td key={e.id} className="font-mono font-bold text-emerald-600 dark:text-emerald-400">R$ {e.total}</td>)}
                  </tr>
                  <tr>
                    <td className="font-semibold text-[var(--ll-text)]">Ingressos Vendidos</td>
                    {selected.map(e => <td key={e.id} className="font-mono">{e.sales.toLocaleString('pt-BR')}</td>)}
                  </tr>
                  <tr>
                    <td className="font-semibold text-[var(--ll-text)]">Estoque Disponível</td>
                    {selected.map(e => <td key={e.id} className="font-mono">{e.available.toLocaleString('pt-BR')}</td>)}
                  </tr>
                  <tr>
                    <td className="font-semibold text-[var(--ll-text)]">Cortesias</td>
                    {selected.map(e => <td key={e.id} className="font-mono">{e.courtesy.toLocaleString('pt-BR')}</td>)}
                  </tr>
                  <tr>
                    <td className="font-semibold text-[var(--ll-text)]">Taxa de Ocupação</td>
                    {selected.map(e => <td key={e.id} className="font-mono">{e.occupancy}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </LimitlessPage>
  )
}

