import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowLeftRight, CalendarDays, Columns3, LayoutPanelTop, List, Rows3, ArrowLeft, X, Check } from 'lucide-react'
import EventCard from '../components/EventCard'
import type { EventItem } from '../data/events'

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

export default function EventsPage({events, query, status, setStatus, view, setView, onEdit, onLots, onDashboard, onOpen, onNavigate}: Props){
  const [compareMode,setCompareMode]=useState(false)
  const [selectedIds,setSelectedIds]=useState<number[]>([])
  const [showComparison,setShowComparison]=useState(false)
  const [columns,setColumns]=useState<2|3|4|5|6>(()=>{
    if(typeof window==='undefined')return 3
    const n=Number(localStorage.getItem('safesaff.events.vertical.columns')||3)
    return ([2,3,4,5,6].includes(n)?n:3) as 2|3|4|5|6
  })
  const filtered = useMemo(() => events.filter(event => {
    const matchesQuery = `${event.title} ${event.venue} ${event.city}`.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = status === 'todos' || (status === 'ativos' && event.status === 'ativo') || (status === 'inativos' && event.status !== 'ativo')
    return matchesQuery && matchesStatus
  }), [events, query, status])
  const selected=filtered.filter(e=>selectedIds.includes(e.id))
  const revenue = filtered.reduce((sum, event)=> sum + Number(event.total.replace(/\./g,'').replace(',','.')), 0)
  const choose=(event:EventItem)=>setSelectedIds(prev=>prev.includes(event.id)?prev.filter(id=>id!==event.id):[...prev,event.id])
  const cancelCompare=()=>{setCompareMode(false);setSelectedIds([]);setShowComparison(false)}
  const setColumnCount=(n:2|3|4|5|6)=>{setColumns(n);localStorage.setItem('safesaff.events.vertical.columns',String(n))}

  return <div data-testid="events-page">
    <div className="flex items-center gap-2 mb-3">
      <button onClick={()=>onNavigate?onNavigate('profile-dashboard'):window.history.back()} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"><ArrowLeft size={14} className="text-[#06B6D4]"/><span>Voltar ao Dashboard</span></button>
    </div>
    <section className="page-head events-page-head">
      <div><p className="eyebrow">GESTÃO DE EVENTOS</p><h1>Eventos</h1><p className="head-subtitle">Acompanhe vendas, ocupação, disponibilidade e configurações.</p></div>
      <div className="toolbar events-toolbar">
        <button data-testid="btn-toggle-compare-mode" className={`tool-btn events-compare-btn ${compareMode?'active':''}`} onClick={()=>compareMode?cancelCompare():setCompareMode(true)}>{compareMode?<X size={18}/>:<ArrowLeftRight size={18}/>}<span>{compareMode?'Cancelar':'Comparar'}</span></button>
        <div className="view-switch events-view-switch">
          <button data-testid="btn-view-horizontal" className={(view==='horizontal'||view==='compact')?'active':''} onClick={()=>setView('horizontal')}><Rows3 size={18}/>Horizontal</button>
          <button data-testid="btn-view-vertical" className={view==='vertical'?'active':''} onClick={()=>setView('vertical')}><LayoutPanelTop size={18}/>Vertical</button>
        </div>
        {view==='vertical'&&<div data-testid="events-col-selector" className="event-columns-control" title="Quantidade de colunas"><Columns3 size={15}/>{([2,3,4,5,6] as const).map(n=><button key={n} data-testid={`btn-cols-${n}`} className={columns===n?'active':''} onClick={()=>setColumnCount(n)}>{n}</button>)}</div>}
        <div className="status-tabs events-status-tabs">
          <button data-testid="events-filter-active" className={status==='ativos'?'active':''} onClick={()=>setStatus('ativos')}><CalendarDays size={17}/>Ativos</button>
          <button data-testid="events-filter-inactive" className={status==='inativos'?'active':''} onClick={()=>setStatus('inativos')}><CalendarDays size={17}/>Inativos</button>
          <button data-testid="events-filter-all" className={status==='todos'?'active':''} onClick={()=>setStatus('todos')}><List size={17}/>Todos</button>
        </div>
      </div>
    </section>

    {compareMode&&<div data-testid="events-compare-banner" className="events-compare-banner"><div><ArrowLeftRight size={17}/><span><strong>Modo de comparação.</strong> Selecione pelo menos 2 eventos para comparar desempenho comercial.</span></div><div className="flex items-center gap-2"><span>{selectedIds.length} selecionado(s)</span><button data-testid="btn-cancel-compare" className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white" onClick={cancelCompare}>Cancelar</button></div></div>}

    <section className="summary-strip events-summary-strip">
      <div><span>Eventos encontrados</span><strong>{filtered.length}</strong></div>
      <div><span>Ingressos disponíveis</span><strong>{filtered.reduce((a,b)=>a+b.available,0).toLocaleString('pt-BR')}</strong></div>
      <div><span>Vendas</span><strong>{filtered.reduce((a,b)=>a+b.sales,0).toLocaleString('pt-BR')}</strong></div>
      <div><span>Receita</span><strong className="events-revenue-full">{revenue.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong><strong className="events-revenue-compact">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',notation:'compact',maximumFractionDigits:2}).format(revenue)}</strong></div>
    </section>

    <section data-testid="event-grid" className={`event-grid ${view==='vertical'?'view-vertical':'view-horizontal'} ${view} cols-${columns}`} style={view==='vertical'?{'--event-columns':columns} as CSSProperties:undefined}>
      {filtered.length ? filtered.map(event => <EventCard key={event.id} event={event} onEdit={onEdit} onLots={onLots} onDashboard={onDashboard} onOpen={onOpen} selectionMode={compareMode} selected={selectedIds.includes(event.id)} onSelect={choose}/>) : <div className="empty-state">Nenhum evento encontrado com os filtros atuais.</div>}
    </section>

    {compareMode&&<div className="compare-actionbar"><div><span>Eventos selecionados</span><strong>{selectedIds.length}</strong></div><button data-testid="btn-execute-compare" disabled={selectedIds.length<2} onClick={()=>setShowComparison(true)}><Check size={16}/>Comparar selecionados</button></div>}
    {showComparison&&<div className="comparison-overlay" onClick={()=>setShowComparison(false)}><div className="comparison-modal" data-testid="event-comparator-modal" onClick={e=>e.stopPropagation()}><div className="comparison-head"><div><p className="eyebrow">COMPARAÇÃO DE EVENTOS</p><h2>Comparador Comercial de Eventos</h2><p className="text-xs text-slate-400">Desempenho lado a lado</p></div><button data-testid="btn-close-comparator" onClick={()=>setShowComparison(false)}><X size={18}/></button></div><div className="comparison-table-wrap"><table className="comparison-table"><thead><tr><th>Métrica</th>{selected.map(e=><th key={e.id}>{e.title}</th>)}</tr></thead><tbody><tr><td>Receita Bruta Total</td>{selected.map(e=><td key={e.id}>R$ {e.total}</td>)}</tr><tr><td>Ingressos Vendidos</td>{selected.map(e=><td key={e.id}>{e.sales.toLocaleString('pt-BR')}</td>)}</tr><tr><td>Estoque Disponível</td>{selected.map(e=><td key={e.id}>{e.available.toLocaleString('pt-BR')}</td>)}</tr><tr><td>Cortesias</td>{selected.map(e=><td key={e.id}>{e.courtesy.toLocaleString('pt-BR')}</td>)}</tr><tr><td>Taxa de Ocupação</td>{selected.map(e=><td key={e.id}>{e.occupancy}</td>)}</tr></tbody></table></div></div></div>}
  </div>
}
