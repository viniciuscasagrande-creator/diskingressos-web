import { Download, Search, ScanFace, TicketCheck, UserCheck, Users, ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { EventItem } from '../data/events'
import type { Participant } from '../data/participants'

type Props={events:EventItem[]; participants:Participant[]; onToggleCheckin:(id:number)=>void; onNavigate?:(page:any)=>void}
export default function ParticipantsPage({events,participants,onToggleCheckin,onNavigate}:Props){
  const [query,setQuery]=useState(''); const [eventId,setEventId]=useState('todos'); const [checkin,setCheckin]=useState('todos')
  const filtered=useMemo(()=>participants.filter(p=>{
    const q=`${p.name} ${p.email} ${p.order} ${p.document}`.toLowerCase().includes(query.toLowerCase())
    return q&&(eventId==='todos'||p.eventId===Number(eventId))&&(checkin==='todos'||p.checkin===checkin)
  }),[participants,query,eventId,checkin])
  const present=filtered.filter(p=>p.checkin==='presente').length
  return <>
    <div className="flex items-center gap-2 mb-3">
      <button
        onClick={()=>onNavigate?onNavigate('events'):window.history.back()}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
      >
        <ArrowLeft size={14} className="text-[#06B6D4]"/>
        <span>Voltar aos Eventos</span>
      </button>
    </div>
    <section className="page-head"><div><p className="eyebrow">EVENTOS / OPERAÇÃO</p><h1>Participantes</h1><p className="head-subtitle">Consulte compradores, ingressos, validação facial e presença em tempo real.</p></div><button className="secondary-btn"><Download size={17}/>Exportar CSV</button></section>
    <section className="summary-strip"><div><span>Participantes</span><strong>{filtered.length}</strong></div><div><span>Check-ins</span><strong>{present}</strong></div><div><span>Pendentes</span><strong>{filtered.length-present}</strong></div><div><span>Taxa de entrada</span><strong>{filtered.length?Math.round(present/filtered.length*100):0}%</strong></div></section>
    <section className="table-card">
      <div className="participant-filters"><div className="small-search wide"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar nome, e-mail, pedido ou documento..."/></div><select value={eventId} onChange={e=>setEventId(e.target.value)}><option value="todos">Todos os eventos</option>{events.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select><select value={checkin} onChange={e=>setCheckin(e.target.value)}><option value="todos">Todos os status</option><option value="presente">Check-in realizado</option><option value="pendente">Pendente</option></select></div>
      <div className="lots-table-wrap"><table className="lots-table participants-table"><thead><tr><th>Participante</th><th>Ingresso</th><th>Pedido</th><th>Facial</th><th>Check-in</th><th>Valor</th><th>Ação</th></tr></thead><tbody>{filtered.map(p=><tr key={p.id}><td><div className="person-cell"><span className="person-avatar">{p.name.split(' ').slice(0,2).map(x=>x[0]).join('')}</span><div><strong>{p.name}</strong><small>{p.email}</small><small>{p.document}</small></div></div></td><td><strong>{p.ticket}</strong><small className="subtle">{events.find(e=>e.id===p.eventId)?.title}</small></td><td><strong>{p.order}</strong><small className="subtle">{p.purchaseDate}</small></td><td><span className={`facial-chip ${p.facial}`}><ScanFace size={14}/>{p.facial==='nao-cadastrado'?'Não cadastrado':p.facial}</span></td><td>{p.checkin==='presente'?<div><span className="status-pill ativo"><UserCheck size={13}/>Presente</span><small className="subtle">{p.checkinTime} • {p.gate}</small></div>:<span className="status-pill agendado">Pendente</span>}</td><td><strong>{p.value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong></td><td><button className={`checkin-btn ${p.checkin==='presente'?'undo':''}`} onClick={()=>onToggleCheckin(p.id)}><TicketCheck size={15}/>{p.checkin==='presente'?'Desfazer':'Check-in'}</button></td></tr>)}</tbody></table></div>
      {!filtered.length&&<div className="empty-state"><Users size={28}/> Nenhum participante encontrado.</div>}
    </section>
  </>
}
