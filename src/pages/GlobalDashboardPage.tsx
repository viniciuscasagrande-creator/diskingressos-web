import { Building2, CalendarDays, Users, Activity, ArrowRight, Globe2 } from 'lucide-react'
import type { EventItem } from '../data/events'
import type { Producer, AppUser } from '../auth/model'

type Props={events:EventItem[];producers:Producer[];users:AppUser[];onSelectProducer:(id:number)=>void;onAllEvents:()=>void}
export default function GlobalDashboardPage({events,producers,users,onSelectProducer,onAllEvents}:Props){
 const activeProducers=producers.filter(p=>p.status==='ativo')
 const activeEvents=events.filter(e=>e.status==='ativo')
 const byProducer=activeProducers.map(p=>({producer:p,events:events.filter(e=>e.producerId===p.id)}))
 return <div className="global-admin-dashboard">
  <section className="page-head global-admin-head"><div><p className="eyebrow">ADMINISTRAÇÃO GLOBAL</p><h1>Visão Geral</h1><p className="head-subtitle">Acompanhe todas as produtoras e entre no contexto desejado sem perder o escopo administrativo.</p></div><button className="primary-action" onClick={onAllEvents}><Globe2 size={18}/>Ver todos os eventos</button></section>
  <section className="admin-kpi-grid">
   <div className="admin-kpi"><span className="kpi-icon"><Building2 size={21}/></span><div><small>Produtoras ativas</small><strong>{activeProducers.length}</strong><em>Visão global</em></div></div>
   <div className="admin-kpi"><span className="kpi-icon"><CalendarDays size={21}/></span><div><small>Eventos cadastrados</small><strong>{events.length}</strong><em>{activeEvents.length} ativos</em></div></div>
   <div className="admin-kpi"><span className="kpi-icon"><Users size={21}/></span><div><small>Usuários</small><strong>{users.length}</strong><em>Todos os perfis</em></div></div>
   <div className="admin-kpi"><span className="kpi-icon"><Activity size={21}/></span><div><small>Escopo atual</small><strong>Global</strong><em>Acesso administrativo</em></div></div>
  </section>
  <section className="admin-section-head"><div><p className="eyebrow">PRODUTORAS</p><h2>Selecionar contexto</h2></div><span>{activeProducers.length} produtoras disponíveis</span></section>
  <section className="producer-context-grid">{byProducer.map(({producer,events:producerEvents})=><button key={producer.id} className="producer-context-card" onClick={()=>onSelectProducer(producer.id)}><div className="producer-context-icon"><Building2 size={23}/></div><div className="producer-context-copy"><strong>{producer.name}</strong><span>{producer.document}</span><div className="producer-context-meta"><b>{producerEvents.length} eventos</b><span>{producerEvents.filter(e=>e.status==='ativo').length} ativos</span></div></div><ArrowRight size={20}/></button>)}</section>
 </div>
}
