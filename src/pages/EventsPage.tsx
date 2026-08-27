import { useMemo } from 'react'
import { ArrowLeftRight, CalendarDays, LayoutPanelTop, List, Rows3 } from 'lucide-react'
import EventCard from '../components/EventCard'
import type { EventItem } from '../data/events'

type Props = {
  events: EventItem[]
  query: string
  status: 'ativos'|'inativos'|'todos'
  setStatus: (value:'ativos'|'inativos'|'todos')=>void
  view: 'horizontal'|'compact'
  setView: (value:'horizontal'|'compact')=>void
  onEdit:(event:EventItem)=>void
  onLots:(event:EventItem)=>void
  onDashboard:(event:EventItem)=>void
  onOpen:(event:EventItem)=>void
}

export default function EventsPage({events, query, status, setStatus, view, setView, onEdit, onLots, onDashboard, onOpen}: Props){
  const filtered = useMemo(() => events.filter(event => {
    const matchesQuery = `${event.title} ${event.venue} ${event.city}`.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = status === 'todos' || (status === 'ativos' && event.status === 'ativo') || (status === 'inativos' && event.status !== 'ativo')
    return matchesQuery && matchesStatus
  }), [events, query, status])

  const revenue = filtered.reduce((sum, event)=> sum + Number(event.total.replace(/\./g,'').replace(',','.')), 0)

  return <>
    <section className="page-head">
      <div><p className="eyebrow">GESTÃO DE EVENTOS</p><h1>Eventos</h1><p className="head-subtitle">Acompanhe vendas, ocupação, disponibilidade e configurações.</p></div>
      <div className="toolbar">
        <button className="tool-btn"><ArrowLeftRight size={18}/>Comparar</button>
        <div className="view-switch">
          <button className={view==='horizontal'?'active':''} onClick={()=>setView('horizontal')}><Rows3 size={18}/>Horizontal</button>
          <button className={view==='compact'?'active':''} onClick={()=>setView('compact')}><LayoutPanelTop size={18}/></button>
        </div>
        <div className="status-tabs">
          <button className={status==='ativos'?'active':''} onClick={()=>setStatus('ativos')}><CalendarDays size={17}/>Ativos</button>
          <button className={status==='inativos'?'active':''} onClick={()=>setStatus('inativos')}><CalendarDays size={17}/>Inativos</button>
          <button className={status==='todos'?'active':''} onClick={()=>setStatus('todos')}><List size={17}/>Todos</button>
        </div>
      </div>
    </section>

    <section className="summary-strip">
      <div><span>Eventos encontrados</span><strong>{filtered.length}</strong></div>
      <div><span>Ingressos disponíveis</span><strong>{filtered.reduce((a,b)=>a+b.available,0).toLocaleString('pt-BR')}</strong></div>
      <div><span>Vendas</span><strong>{filtered.reduce((a,b)=>a+b.sales,0)}</strong></div>
      <div><span>Receita</span><strong>{revenue.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong></div>
    </section>

    <section className={`event-grid ${view === 'compact' ? 'compact' : ''}`}>
      {filtered.length ? filtered.map(event => <EventCard key={event.id} event={event} onEdit={onEdit} onLots={onLots} onDashboard={onDashboard} onOpen={onOpen}/>) : <div className="empty-state">Nenhum evento encontrado com os filtros atuais.</div>}
    </section>
  </>
}
