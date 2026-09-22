import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { 
  ArrowLeftRight, CalendarDays, Columns3, LayoutPanelTop, 
  List, Rows3, ArrowLeft, X, Check, Ticket, CircleDollarSign, Users 
} from 'lucide-react'
import EventCard from '../components/EventCard'
import type { EventItem } from '../data/events'
import { LimitlessPage } from '../integrations/limitless/LimitlessPage'
import {
  DiskPageHeader,
  DiskKpiCard,
  DiskCard,
  DiskModal,
  DiskEmptyState
} from '../components/ui/disk'

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
    <LimitlessPage dataTestId="events-page" className="space-y-2 w-full max-w-none animate-fadeIn">
      {/* 1. Cabeçalho V7 Oficial */}
      <DiskPageHeader
        breadcrumbs={['Operações', 'Eventos']}
        badge="Gestão de Eventos"
        badgeTone="primary"
        title="Eventos"
        subtitle="Acompanhe vendas, ocupação, disponibilidade e configurações de todos os seus eventos."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-subtle-info text-xs font-semibold py-1 px-2.5">
              {filtered.length} {filtered.length === 1 ? 'evento ativo' : 'eventos ativos'}
            </span>
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
        }
      />

      {/* 2. Barra Semântica de Controles: Layout e Filtros Limitless */}
      <DiskCard className="p-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
      </DiskCard>

      {/* Banner de Comparação */}
      {compareMode && (
        <div data-testid="events-compare-banner" className="card p-3.5 bg-[var(--ll-surface)] border-l-4 border-l-[var(--ll-primary)] shadow-sm flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[var(--ll-text)]">
            <ArrowLeftRight className="w-4 h-4 text-[var(--ll-primary)] shrink-0" />
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

      {/* 3. Métricas Consolidadas no Estilo Limitless V7 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 events-summary-strip">
        <DiskKpiCard
          title="Eventos Encontrados"
          value={String(filtered.length)}
          subtitle={status === 'todos' ? 'Todos os cadastros' : status === 'ativos' ? 'Em operação' : 'Inativos'}
          icon={<Ticket className="w-5 h-5" />}
          accent="orange"
        />

        <DiskKpiCard
          title="Ingressos Disponíveis"
          value={filtered.reduce((a, b) => a + b.available, 0).toLocaleString('pt-BR')}
          subtitle="Disponíveis para venda"
          icon={<Ticket className="w-5 h-5" />}
          accent="sky"
        />

        <DiskKpiCard
          title="Ingressos Vendidos"
          value={filtered.reduce((a, b) => a + b.sales, 0).toLocaleString('pt-BR')}
          subtitle="Consolidado de emissão"
          icon={<Users className="w-5 h-5" />}
          accent="orange"
        />

        <DiskKpiCard
          title="Receita Total"
          value={revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          subtitle="Vendas brutas totais"
          icon={<CircleDollarSign className="w-5 h-5" />}
          accent="emerald"
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
          <div className="col-span-full">
            <DiskEmptyState
              title="Nenhum evento encontrado"
              description="Nenhum evento corresponde aos filtros ou termo de busca selecionados."
            />
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

      {/* Modal de Comparação V7 */}
      <DiskModal
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        title="Comparador Comercial de Eventos"
        subtitle="Desempenho lado a lado dos eventos selecionados"
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-[var(--ll-text-muted)] font-medium">
              {selected.length} eventos sob análise comparativa
            </span>
            <button
              type="button"
              data-testid="btn-close-comparator"
              onClick={() => setShowComparison(false)}
              className="btn-light text-xs font-semibold px-4 py-2 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        }
      >
        <div data-testid="event-comparator-modal" className="overflow-x-auto">
          <table className="table w-full text-left text-xs">
            <thead>
              <tr>
                <th className="py-2.5 px-3 font-semibold text-[var(--ll-text-muted)] border-b border-[var(--ll-border)]">Métrica</th>
                {selected.map(e => (
                  <th key={e.id} className="py-2.5 px-3 text-[var(--ll-text)] font-bold border-b border-[var(--ll-border)]">{e.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-[var(--ll-muted)]/50 transition">
                <td className="py-2.5 px-3 font-semibold text-[var(--ll-text)] border-b border-[var(--ll-border)]">Receita Bruta Total</td>
                {selected.map(e => <td key={e.id} className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 border-b border-[var(--ll-border)]">R$ {e.total}</td>)}
              </tr>
              <tr className="hover:bg-[var(--ll-muted)]/50 transition">
                <td className="py-2.5 px-3 font-semibold text-[var(--ll-text)] border-b border-[var(--ll-border)]">Ingressos Vendidos</td>
                {selected.map(e => <td key={e.id} className="py-2.5 px-3 font-mono border-b border-[var(--ll-border)]">{e.sales.toLocaleString('pt-BR')}</td>)}
              </tr>
              <tr className="hover:bg-[var(--ll-muted)]/50 transition">
                <td className="py-2.5 px-3 font-semibold text-[var(--ll-text)] border-b border-[var(--ll-border)]">Estoque Disponível</td>
                {selected.map(e => <td key={e.id} className="py-2.5 px-3 font-mono border-b border-[var(--ll-border)]">{e.available.toLocaleString('pt-BR')}</td>)}
              </tr>
              <tr className="hover:bg-[var(--ll-muted)]/50 transition">
                <td className="py-2.5 px-3 font-semibold text-[var(--ll-text)] border-b border-[var(--ll-border)]">Cortesias</td>
                {selected.map(e => <td key={e.id} className="py-2.5 px-3 font-mono border-b border-[var(--ll-border)]">{e.courtesy.toLocaleString('pt-BR')}</td>)}
              </tr>
              <tr className="hover:bg-[var(--ll-muted)]/50 transition">
                <td className="py-2.5 px-3 font-semibold text-[var(--ll-text)] border-b border-[var(--ll-border)]">Taxa de Ocupação</td>
                {selected.map(e => <td key={e.id} className="py-2.5 px-3 font-mono border-b border-[var(--ll-border)]">{e.occupancy}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </DiskModal>
    </LimitlessPage>
  )
}

