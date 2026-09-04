import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, Boxes, Clock3, Edit3, Gauge, Layers3, LockKeyhole, PauseCircle,
  PlayCircle, Plus, RefreshCw, Search, ShieldCheck, TrendingUp, Unlock, WalletCards
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  createInventoryHold, createInventoryLot, getEventInventoryEngine, releaseInventoryHold,
  updateInventoryLot, updateInventoryLotStatus, type EventInventoryEngine, type InventoryLot
} from '../services/api'
import './event-inventory.css'

type Props={event:EventItem;notify:(message:string)=>void}
type LotDraft={id:number|null;name:string;sector:string;price:string;capacity:number;status:'ativo'|'pausado'|'encerrado';startsAt:string;endsAt:string}
const money=(c:number)=>(c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const pct=(v:number)=>`${v.toFixed(1)}%`
const forecast=(h:number|null)=>h===null?'Sem previsão':h<1?'< 1 hora':h<24?`${Math.ceil(h)}h`:`${Math.ceil(h/24)} dias`
const blankLot=():LotDraft=>({id:null,name:'',sector:'',price:'0,00',capacity:100,status:'ativo',startsAt:'',endsAt:''})
const toLocalInput=(value:string|null)=>value?new Date(value).toISOString().slice(0,16):''
const toIso=(value:string)=>value?new Date(value).toISOString():null
const centsFrom=(value:string)=>{
  const normalized=value.replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.')
  return Math.max(0,Math.round((Number(normalized)||0)*100))
}

export default function EventInventoryPage({event,notify}:Props){
  const [data,setData]=useState<EventInventoryEngine|null>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [showHold,setShowHold]=useState(false)
  const [showLot,setShowLot]=useState(false)
  const [saving,setSaving]=useState(false)
  const [query,setQuery]=useState('')
  const [statusFilter,setStatusFilter]=useState<'todos'|'ativo'|'pausado'|'encerrado'>('todos')
  const [draft,setDraft]=useState({lotId:0,quantity:1,minutes:15,reason:'Reserva operacional'})
  const [lotDraft,setLotDraft]=useState<LotDraft>(blankLot())

  const load=useCallback(async()=>{
    setLoading(true);setError('')
    try{
      const result=await getEventInventoryEngine(event.id)
      setData(result)
      if(!draft.lotId&&result.lots[0])setDraft(x=>({...x,lotId:result.lots[0].id}))
    }catch(e:any){
      setError(e?.message||'Não foi possível carregar o inventário.')
      setData(null)
    }finally{setLoading(false)}
  },[event.id,draft.lotId])

  useEffect(()=>{void load()},[load])

  const activeHolds=useMemo(()=>data?.holds.filter(h=>h.status==='active')||[],[data])
  const filteredLots=useMemo(()=>{
    const q=query.trim().toLowerCase()
    return (data?.lots||[]).filter(l=>
      (statusFilter==='todos'||l.status.toLowerCase()===statusFilter) &&
      (!q||`${l.name} ${l.sector||''}`.toLowerCase().includes(q))
    )
  },[data,query,statusFilter])

  const createHold=async()=>{
    if(!draft.lotId||draft.quantity<1)return
    setSaving(true)
    try{
      await createInventoryHold(event.id,draft)
      notify('Hold criado e disponibilidade recalculada.')
      setShowHold(false)
      await load()
    }catch(e:any){notify(e?.message||'Não foi possível criar o hold.')}
    finally{setSaving(false)}
  }

  const release=async(id:number)=>{
    if(!window.confirm('Liberar este hold e devolver a quantidade ao estoque disponível?'))return
    setSaving(true)
    try{
      await releaseInventoryHold(event.id,id)
      notify('Hold liberado e estoque atualizado.')
      await load()
    }catch(e:any){notify(e?.message||'Não foi possível liberar o hold.')}
    finally{setSaving(false)}
  }

  const openNewLot=()=>{
    setLotDraft(blankLot())
    setShowLot(true)
  }

  const openEditLot=(lot:InventoryLot)=>{
    setLotDraft({
      id:lot.id,name:lot.name,sector:lot.sector||'',price:(lot.priceCents/100).toLocaleString('pt-BR',{minimumFractionDigits:2}),
      capacity:lot.capacity,status:(['ativo','pausado','encerrado'].includes(lot.status)?lot.status:'ativo') as LotDraft['status'],
      startsAt:toLocalInput(lot.startsAt),endsAt:toLocalInput(lot.endsAt)
    })
    setShowLot(true)
  }

  const saveLot=async()=>{
    if(lotDraft.name.trim().length<2){notify('Informe o nome do lote.');return}
    if(lotDraft.capacity<1){notify('A capacidade deve ser maior que zero.');return}
    setSaving(true)
    try{
      const payload={
        name:lotDraft.name.trim(),sector:lotDraft.sector.trim()||null,priceCents:centsFrom(lotDraft.price),
        capacity:lotDraft.capacity,status:lotDraft.status,startsAt:toIso(lotDraft.startsAt),endsAt:toIso(lotDraft.endsAt)
      }
      if(lotDraft.id) await updateInventoryLot(event.id,lotDraft.id,payload)
      else await createInventoryLot(event.id,payload)
      notify(lotDraft.id?'Lote atualizado com sucesso.':'Lote criado com sucesso.')
      setShowLot(false)
      await load()
    }catch(e:any){notify(e?.message||'Não foi possível salvar o lote.')}
    finally{setSaving(false)}
  }

  const toggleLot=async(lot:InventoryLot)=>{
    const next=lot.status.toLowerCase()==='ativo'?'pausado':'ativo'
    const action=next==='pausado'?'pausar as vendas':'reabrir as vendas'
    if(!window.confirm(`Deseja ${action} do lote "${lot.name}"?`))return
    setSaving(true)
    try{
      await updateInventoryLotStatus(event.id,lot.id,next)
      notify(next==='pausado'?'Venda do lote pausada.':'Venda do lote reaberta.')
      await load()
    }catch(e:any){notify(e?.message||'Não foi possível alterar o status do lote.')}
    finally{setSaving(false)}
  }

  return <div className="event-inventory-page" data-testid="event-inventory-operational">
    <section className="inventory-head">
      <div>
        <p className="eyebrow">EVENT OS · FASE 26.16.3</p>
        <h2>Inventário Operacional</h2>
        <p>Criação e edição de lotes, capacidade, disponibilidade, holds, pausa de venda e alertas de esgotamento.</p>
      </div>
      <div className="inventory-head-actions">
        <button className="btn secondary" data-testid="inventory-refresh" onClick={()=>void load()} disabled={loading||saving}><RefreshCw size={16}/>{loading?'Atualizando...':'Atualizar'}</button>
        <button className="btn secondary" data-testid="inventory-new-lot" onClick={openNewLot}><Plus size={16}/>Novo lote</button>
        <button className="btn primary" data-testid="inventory-new-hold" onClick={()=>setShowHold(true)} disabled={!data?.lots.some(l=>l.available>0)}><LockKeyhole size={16}/>Criar hold</button>
      </div>
    </section>

    <section className="inventory-event-strip">
      <strong>{event.code} · {event.title}</strong><span>{event.venue}</span><span>{event.date}</span>
      <span className="inventory-scope"><ShieldCheck size={14}/>producerId + eventId protegidos no backend</span>
    </section>

    {error&&<div className="inventory-error" role="alert"><AlertTriangle size={18}/><div><strong>Inventário indisponível</strong><span>{error}</span><button onClick={()=>void load()}>Tentar novamente</button></div></div>}

    {loading&&!data&&<div className="inventory-loading">Carregando inventário operacional...</div>}

    {data&&<>
      <section className="inventory-kpis">
        <Kpi icon={Boxes} label="Capacidade" value={data.summary.capacity.toLocaleString('pt-BR')} note={`${data.summary.activeLots} lote(s) ativo(s)`}/>
        <Kpi icon={WalletCards} label="Disponível" value={data.summary.available.toLocaleString('pt-BR')} note={`${data.summary.held.toLocaleString('pt-BR')} em hold`}/>
        <Kpi icon={Gauge} label="Ocupação" value={pct(data.summary.occupancy)} note={`${data.summary.sold.toLocaleString('pt-BR')} vendidos`}/>
        <Kpi icon={TrendingUp} label="Velocidade" value={`${data.summary.velocityPerHour.toFixed(1)}/h`} note="últimas 24 horas"/>
        <Kpi icon={Clock3} label="Esgotamento" value={forecast(data.summary.forecastHours)} note="ritmo atual"/>
        <Kpi icon={WalletCards} label="Potencial restante" value={money(data.summary.revenuePotentialCents)} note="estoque disponível"/>
      </section>

      <section className="inventory-toolbar">
        <div className="inventory-search"><Search size={15}/><input aria-label="Buscar lote" placeholder="Buscar lote ou setor..." value={query} onChange={e=>setQuery(e.target.value)}/></div>
        <div className="inventory-status-tabs" aria-label="Filtrar status do lote">
          {(['todos','ativo','pausado','encerrado'] as const).map(s=><button key={s} className={statusFilter===s?'active':''} onClick={()=>setStatusFilter(s)}>{s==='todos'?'Todos':s[0].toUpperCase()+s.slice(1)}</button>)}
        </div>
        <span className="inventory-generated">Atualizado {new Date(data.generatedAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span>
      </section>

      <section className="inventory-grid-main">
        <div className="inventory-panel inventory-lots-panel">
          <div className="inventory-panel-head"><div><h3>Lotes e disponibilidade</h3><p>Fonte oficial do estoque comercial do evento.</p></div><span>{filteredLots.length} de {data.lots.length}</span></div>
          <div className="inventory-table-wrap">
            <table className="inventory-table">
              <thead><tr><th>Lote / setor</th><th>Preço</th><th>Capacidade</th><th>Vendidos</th><th>Hold</th><th>Disponível</th><th>Ocupação</th><th>Velocidade</th><th>Previsão</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>
                {filteredLots.map(l=><tr key={l.id} data-testid={`inventory-lot-${l.id}`}>
                  <td><strong>{l.name}</strong><small>{l.sector||'Geral'}</small></td>
                  <td>{money(l.priceCents)}</td><td>{l.capacity.toLocaleString('pt-BR')}</td><td>{l.sold.toLocaleString('pt-BR')}</td><td>{l.held.toLocaleString('pt-BR')}</td>
                  <td><strong>{l.available.toLocaleString('pt-BR')}</strong></td><td><span className={`inventory-health ${l.health}`}>{pct(l.occupancy)}</span></td>
                  <td>{l.salesVelocityPerHour.toFixed(1)}/h</td><td>{forecast(l.forecastHours)}</td><td><span className={`inventory-status ${l.status.toLowerCase()}`}>{l.status}</span></td>
                  <td><div className="inventory-row-actions">
                    <button title="Editar lote" onClick={()=>openEditLot(l)}><Edit3 size={14}/>Editar</button>
                    <button title={l.status.toLowerCase()==='ativo'?'Pausar vendas':'Reabrir vendas'} onClick={()=>void toggleLot(l)} disabled={l.status.toLowerCase()==='encerrado'}>
                      {l.status.toLowerCase()==='ativo'?<PauseCircle size={14}/>:<PlayCircle size={14}/>}
                      {l.status.toLowerCase()==='ativo'?'Pausar':'Reabrir'}
                    </button>
                  </div></td>
                </tr>)}
                {!filteredLots.length&&<tr><td colSpan={11}><div className="inventory-empty">Nenhum lote encontrado com os filtros atuais.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="inventory-panel inventory-recommendations">
          <div className="inventory-panel-head"><div><h3>Inteligência de inventário</h3><p>Ações sugeridas pelo ritmo atual.</p></div></div>
          {data.recommendations.length?data.recommendations.map((r,i)=><div key={`${r.code}-${i}`} className={`inventory-recommendation ${r.severity}`}><AlertTriangle size={17}/><div><strong>{r.title}</strong><span>{r.message}</span>{r.lotId&&<button onClick={()=>{const lot=data.lots.find(x=>x.id===r.lotId);if(lot)openEditLot(lot)}}>Abrir lote</button>}</div></div>):<div className="inventory-ok"><ShieldCheck size={20}/><div><strong>Inventário saudável</strong><span>Nenhuma ação crítica identificada.</span></div></div>}
        </aside>
      </section>

      <section className="inventory-grid-bottom">
        <div className="inventory-panel">
          <div className="inventory-panel-head"><div><h3>Capacidade por setor</h3><p>Comprometimento consolidado por área.</p></div></div>
          <div className="sector-list">{data.sectors.map(s=><div key={s.sector} className="sector-row"><div className="sector-copy"><strong>{s.sector}</strong><span>{s.sold} vendidos · {s.held} hold · {s.available} disponíveis</span></div><div className="sector-meter"><i style={{width:`${Math.min(100,s.occupancy)}%`}}/></div><b>{pct(s.occupancy)}</b></div>)}</div>
        </div>
        <div className="inventory-panel">
          <div className="inventory-panel-head"><div><h3>Holds ativos</h3><p>Reservas temporárias que reduzem disponibilidade.</p></div><span>{activeHolds.length}</span></div>
          {activeHolds.length?<div className="hold-list">{activeHolds.map(h=><div key={h.id} className="hold-row"><div><strong>{h.code}</strong><span>{h.quantity} ingresso(s) · {h.reason}</span><small>expira {new Date(h.expiresAt).toLocaleString('pt-BR')}</small></div><button onClick={()=>void release(h.id)} disabled={saving} title="Liberar hold"><Unlock size={16}/>Liberar</button></div>)}</div>:<div className="inventory-empty">Nenhum hold ativo neste evento.</div>}
        </div>
      </section>
    </>}

    {showHold&&data&&<div className="inventory-modal-backdrop" onClick={()=>!saving&&setShowHold(false)}>
      <div className="inventory-modal" onClick={e=>e.stopPropagation()} data-testid="inventory-hold-modal">
        <div className="inventory-modal-head"><div><span>INVENTORY CONTROL</span><h3>Criar hold temporário</h3></div><button onClick={()=>setShowHold(false)} disabled={saving}>×</button></div>
        <label><span>Lote</span><select value={draft.lotId} onChange={e=>setDraft({...draft,lotId:Number(e.target.value)})}>{data.lots.filter(l=>l.available>0&&l.status.toLowerCase()==='ativo').map(l=><option key={l.id} value={l.id}>{l.name} · {l.available} disponíveis</option>)}</select></label>
        <div className="inventory-modal-grid"><label><span>Quantidade</span><input type="number" min="1" value={draft.quantity} onChange={e=>setDraft({...draft,quantity:Number(e.target.value)})}/></label><label><span>Duração</span><select value={draft.minutes} onChange={e=>setDraft({...draft,minutes:Number(e.target.value)})}><option value={5}>5 min</option><option value={10}>10 min</option><option value={15}>15 min</option><option value={30}>30 min</option><option value={60}>1 hora</option><option value={1440}>24 horas</option></select></label></div>
        <label><span>Motivo</span><input value={draft.reason} onChange={e=>setDraft({...draft,reason:e.target.value})} maxLength={160}/></label>
        <div className="inventory-modal-note"><LockKeyhole size={16}/>O hold reduz a disponibilidade imediatamente e expira automaticamente no cálculo do inventário.</div>
        <div className="inventory-modal-actions"><button className="btn secondary" onClick={()=>setShowHold(false)} disabled={saving}>Cancelar</button><button className="btn primary" onClick={()=>void createHold()} disabled={saving}>{saving?'Processando...':'Criar hold'}</button></div>
      </div>
    </div>}

    {showLot&&<div className="inventory-modal-backdrop" onClick={()=>!saving&&setShowLot(false)}>
      <div className="inventory-modal inventory-lot-modal" onClick={e=>e.stopPropagation()} data-testid="inventory-lot-modal">
        <div className="inventory-modal-head"><div><span>LOT MANAGEMENT</span><h3>{lotDraft.id?'Editar lote':'Novo lote'}</h3></div><button onClick={()=>setShowLot(false)} disabled={saving}>×</button></div>
        <div className="inventory-modal-grid">
          <label><span>Nome do lote</span><input value={lotDraft.name} onChange={e=>setLotDraft({...lotDraft,name:e.target.value})} placeholder="Ex.: Pista — Lote 03"/></label>
          <label><span>Setor</span><input value={lotDraft.sector} onChange={e=>setLotDraft({...lotDraft,sector:e.target.value})} placeholder="Pista, VIP, Camarote..."/></label>
          <label><span>Preço (R$)</span><input inputMode="decimal" value={lotDraft.price} onChange={e=>setLotDraft({...lotDraft,price:e.target.value})}/></label>
          <label><span>Capacidade</span><input type="number" min="1" value={lotDraft.capacity} onChange={e=>setLotDraft({...lotDraft,capacity:Number(e.target.value)})}/></label>
          <label><span>Início das vendas</span><input type="datetime-local" value={lotDraft.startsAt} onChange={e=>setLotDraft({...lotDraft,startsAt:e.target.value})}/></label>
          <label><span>Fim das vendas</span><input type="datetime-local" value={lotDraft.endsAt} onChange={e=>setLotDraft({...lotDraft,endsAt:e.target.value})}/></label>
          <label><span>Status</span><select value={lotDraft.status} onChange={e=>setLotDraft({...lotDraft,status:e.target.value as LotDraft['status']})}><option value="ativo">Ativo</option><option value="pausado">Pausado</option><option value="encerrado">Encerrado</option></select></label>
        </div>
        <div className="inventory-modal-note"><Layers3 size={16}/>Capacidade nunca pode ficar abaixo do volume já comprometido por vendas + holds ativos.</div>
        <div className="inventory-modal-actions"><button className="btn secondary" onClick={()=>setShowLot(false)} disabled={saving}>Cancelar</button><button className="btn primary" data-testid="inventory-save-lot" onClick={()=>void saveLot()} disabled={saving}>{saving?'Salvando...':lotDraft.id?'Salvar alterações':'Criar lote'}</button></div>
      </div>
    </div>}
  </div>
}

function Kpi({icon:Icon,label,value,note}:{icon:any;label:string;value:string;note:string}){
  return <div className="inventory-kpi"><span><Icon size={18}/></span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></div>
}
