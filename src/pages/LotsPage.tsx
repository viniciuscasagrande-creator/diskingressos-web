import { ArrowLeft, CalendarClock, MoreHorizontal, Plus, Search, Ticket, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { EventItem } from '../data/events'

type Lot = {id:number; name:string; type:string; price:number; qty:number; sold:number; start:string; end:string; status:'ativo'|'agendado'|'encerrado'}

const initialLots:Lot[] = [
  {id:1,name:'1º Lote - Pista',type:'Inteira',price:120,qty:500,sold:318,start:'01/10/2026',end:'15/12/2026',status:'ativo'},
  {id:2,name:'1º Lote - Pista',type:'Meia',price:60,qty:300,sold:180,start:'01/10/2026',end:'15/12/2026',status:'ativo'},
  {id:3,name:'2º Lote - Pista',type:'Inteira',price:150,qty:700,sold:0,start:'16/12/2026',end:'28/02/2027',status:'agendado'},
]

type Props = {events:EventItem[]; selectedEvent:EventItem|null; onSelect:(event:EventItem)=>void; onBack:()=>void}

export default function LotsPage({events,selectedEvent,onSelect,onBack}:Props){
  const event = selectedEvent || events[0]
  const [lots,setLots] = useState(initialLots)
  const [search,setSearch] = useState('')
  const [showForm,setShowForm] = useState(false)
  const [draft,setDraft] = useState({name:'',type:'Inteira',price:'',qty:'',start:'',end:''})
  const filtered = useMemo(()=>lots.filter(l=>`${l.name} ${l.type}`.toLowerCase().includes(search.toLowerCase())),[lots,search])
  const totalQty = lots.reduce((s,l)=>s+l.qty,0), sold = lots.reduce((s,l)=>s+l.sold,0)

  const addLot=()=>{
    if(!draft.name || !draft.price || !draft.qty) return
    setLots(prev=>[...prev,{id:Date.now(),name:draft.name,type:draft.type,price:Number(draft.price),qty:Number(draft.qty),sold:0,start:draft.start||'A definir',end:draft.end||'A definir',status:'agendado'}])
    setDraft({name:'',type:'Inteira',price:'',qty:'',start:'',end:''}); setShowForm(false)
  }

  return <>
    <section className="page-head form-page-head">
      <div><button className="back-link" onClick={onBack}><ArrowLeft size={17}/> Voltar para eventos</button><p className="eyebrow">EVENTOS / CONFIGURAÇÃO</p><h1>Lotes e ingressos</h1><p className="head-subtitle">Defina preços, quantidades e períodos de venda.</p></div>
      <button className="primary-btn" onClick={()=>setShowForm(true)}><Plus size={18}/>Novo lote</button>
    </section>

    <div className="event-selector-card">
      <div><span>Evento selecionado</span><strong>{event?.title || 'Nenhum evento'}</strong><small>{event?.venue} • {event?.date}</small></div>
      <select value={event?.id || ''} onChange={e=>{const found=events.find(x=>x.id===Number(e.target.value));if(found)onSelect(found)}}>{events.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select>
    </div>

    <section className="summary-strip lots-summary">
      <div><span>Lotes</span><strong>{lots.length}</strong></div><div><span>Ingressos configurados</span><strong>{totalQty.toLocaleString('pt-BR')}</strong></div><div><span>Vendidos</span><strong>{sold.toLocaleString('pt-BR')}</strong></div><div><span>Disponibilidade</span><strong>{Math.max(0,totalQty-sold).toLocaleString('pt-BR')}</strong></div>
    </section>

    {showForm && <div className="inline-lot-form"><div className="inline-lot-title"><strong>Novo lote</strong><button onClick={()=>setShowForm(false)}>×</button></div><div className="form-grid lot-grid"><label className="field"><span>Nome do lote</span><input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="Ex.: 3º Lote - Pista"/></label><label className="field"><span>Tipo</span><select value={draft.type} onChange={e=>setDraft({...draft,type:e.target.value})}><option>Inteira</option><option>Meia</option><option>VIP</option><option>Cortesia</option></select></label><label className="field"><span>Preço (R$)</span><input type="number" value={draft.price} onChange={e=>setDraft({...draft,price:e.target.value})}/></label><label className="field"><span>Quantidade</span><input type="number" value={draft.qty} onChange={e=>setDraft({...draft,qty:e.target.value})}/></label><label className="field"><span>Início</span><input value={draft.start} onChange={e=>setDraft({...draft,start:e.target.value})} placeholder="DD/MM/AAAA"/></label><label className="field"><span>Fim</span><input value={draft.end} onChange={e=>setDraft({...draft,end:e.target.value})} placeholder="DD/MM/AAAA"/></label></div><div className="form-actions"><button className="secondary-btn" onClick={()=>setShowForm(false)}>Cancelar</button><button className="primary-btn" onClick={addLot}>Adicionar lote</button></div></div>}

    <section className="table-card">
      <div className="table-toolbar"><div><h2>Lotes cadastrados</h2><p>Controle comercial do evento selecionado.</p></div><div className="small-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar lote..."/></div></div>
      <div className="lots-table-wrap"><table className="lots-table"><thead><tr><th>Lote</th><th>Preço</th><th>Quantidade</th><th>Vendidos</th><th>Período</th><th>Status</th><th></th></tr></thead><tbody>{filtered.map(l=><tr key={l.id}><td><div className="lot-name"><span className="lot-icon"><Ticket size={16}/></span><div><strong>{l.name}</strong><small>{l.type}</small></div></div></td><td><strong>{l.price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong></td><td>{l.qty}</td><td><div className="sold-cell"><strong>{l.sold}</strong><div className="progress"><i style={{width:`${Math.min(100,(l.sold/l.qty)*100)}%`}}/></div></div></td><td><span className="period"><CalendarClock size={15}/>{l.start} → {l.end}</span></td><td><span className={`status-pill ${l.status}`}>{l.status}</span></td><td><div className="row-actions"><button onClick={()=>setLots(prev=>prev.filter(x=>x.id!==l.id))}><Trash2 size={16}/></button><button><MoreHorizontal size={17}/></button></div></td></tr>)}</tbody></table></div>
    </section>
  </>
}
