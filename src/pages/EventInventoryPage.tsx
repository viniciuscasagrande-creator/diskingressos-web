import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Boxes, Clock3, Gauge, Layers3, LockKeyhole, RefreshCw, ShieldCheck, TrendingUp, Unlock, WalletCards } from 'lucide-react'
import type { EventItem } from '../data/events'
import { createInventoryHold, getEventInventoryEngine, releaseInventoryHold, type EventInventoryEngine } from '../services/api'
import './event-inventory.css'

type Props={event:EventItem;notify:(message:string)=>void}
const money=(c:number)=>(c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const pct=(v:number)=>`${v.toFixed(1)}%`
const forecast=(h:number|null)=>h===null?'Sem previsão':h<1?'< 1 hora':h<24?`${Math.ceil(h)}h`:`${Math.ceil(h/24)} dias`

export default function EventInventoryPage({event,notify}:Props){
  const [data,setData]=useState<EventInventoryEngine|null>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [showHold,setShowHold]=useState(false)
  const [draft,setDraft]=useState({lotId:0,quantity:1,minutes:15,reason:'Reserva operacional'})
  const load=useCallback(async()=>{setLoading(true);setError('');try{const result=await getEventInventoryEngine(event.id);setData(result);if(!draft.lotId&&result.lots[0])setDraft(x=>({...x,lotId:result.lots[0].id}))}catch(e:any){setError(e?.message||'Não foi possível carregar o inventário.');setData(null)}finally{setLoading(false)}},[event.id,draft.lotId])
  useEffect(()=>{void load()},[load])
  const activeHolds=useMemo(()=>data?.holds.filter(h=>h.status==='active')||[],[data])
  const createHold=async()=>{if(!draft.lotId||draft.quantity<1)return;try{await createInventoryHold(event.id,draft);notify('Hold criado e disponibilidade recalculada.');setShowHold(false);await load()}catch(e:any){notify(e?.message||'Não foi possível criar o hold.')}}
  const release=async(id:number)=>{try{await releaseInventoryHold(event.id,id);notify('Hold liberado.');await load()}catch(e:any){notify(e?.message||'Não foi possível liberar o hold.')}}
  return <div className="event-inventory-page">
    <section className="inventory-head">
      <div><p className="eyebrow">EVENT OS · INVENTORY ENGINE</p><h2>Inventário do Evento</h2><p>Capacidade, lotes, setores, holds e previsão de esgotamento em uma única fonte operacional.</p></div>
      <div className="inventory-head-actions"><button className="btn secondary" onClick={()=>void load()} disabled={loading}><RefreshCw size={16}/>{loading?'Atualizando...':'Atualizar'}</button><button className="btn primary" onClick={()=>setShowHold(true)}><LockKeyhole size={16}/>Criar hold</button></div>
    </section>
    <section className="inventory-event-strip"><strong>{event.code} · {event.title}</strong><span>{event.venue}</span><span>{event.date}</span><span className="inventory-scope"><ShieldCheck size={14}/>Escopo protegido por evento</span></section>
    {error&&<div className="inventory-error"><AlertTriangle size={18}/><div><strong>Inventário indisponível</strong><span>{error}</span></div></div>}
    {data&&<>
      <section className="inventory-kpis">
        <Kpi icon={Boxes} label="Capacidade" value={data.summary.capacity.toLocaleString('pt-BR')} note={`${data.summary.activeLots} lote(s) ativo(s)`}/>
        <Kpi icon={WalletCards} label="Disponível" value={data.summary.available.toLocaleString('pt-BR')} note={`${data.summary.held.toLocaleString('pt-BR')} em hold`}/>
        <Kpi icon={Gauge} label="Ocupação" value={pct(data.summary.occupancy)} note={`${data.summary.sold.toLocaleString('pt-BR')} vendidos`}/>
        <Kpi icon={TrendingUp} label="Velocidade" value={`${data.summary.velocityPerHour.toFixed(1)}/h`} note="últimas 24 horas"/>
        <Kpi icon={Clock3} label="Esgotamento" value={forecast(data.summary.forecastHours)} note="ritmo atual"/>
        <Kpi icon={WalletCards} label="Potencial restante" value={money(data.summary.revenuePotentialCents)} note="estoque disponível"/>
      </section>

      <section className="inventory-grid-main">
        <div className="inventory-panel inventory-lots-panel"><div className="inventory-panel-head"><div><h3>Lotes e disponibilidade</h3><p>Fonte oficial do estoque comercial do evento.</p></div><span>{data.lots.length} lote(s)</span></div>
          <div className="inventory-table-wrap"><table className="inventory-table"><thead><tr><th>Lote / setor</th><th>Preço</th><th>Capacidade</th><th>Vendidos</th><th>Hold</th><th>Disponível</th><th>Ocupação</th><th>Velocidade</th><th>Previsão</th></tr></thead><tbody>{data.lots.map(l=><tr key={l.id}><td><strong>{l.name}</strong><small>{l.sector||'Geral'} · {l.status}</small></td><td>{money(l.priceCents)}</td><td>{l.capacity.toLocaleString('pt-BR')}</td><td>{l.sold.toLocaleString('pt-BR')}</td><td>{l.held.toLocaleString('pt-BR')}</td><td><strong>{l.available.toLocaleString('pt-BR')}</strong></td><td><span className={`inventory-health ${l.health}`}>{pct(l.occupancy)}</span></td><td>{l.salesVelocityPerHour.toFixed(1)}/h</td><td>{forecast(l.forecastHours)}</td></tr>)}</tbody></table></div>
        </div>
        <aside className="inventory-panel inventory-recommendations"><div className="inventory-panel-head"><div><h3>Inteligência de inventário</h3><p>Ações sugeridas pelo ritmo atual.</p></div></div>{data.recommendations.length?data.recommendations.map((r,i)=><div key={`${r.code}-${i}`} className={`inventory-recommendation ${r.severity}`}><AlertTriangle size={17}/><div><strong>{r.title}</strong><span>{r.message}</span></div></div>):<div className="inventory-ok"><ShieldCheck size={20}/><div><strong>Inventário saudável</strong><span>Nenhuma ação crítica identificada.</span></div></div>}</aside>
      </section>

      <section className="inventory-grid-bottom">
        <div className="inventory-panel"><div className="inventory-panel-head"><div><h3>Capacidade por setor</h3><p>Comprometimento consolidado por área.</p></div></div><div className="sector-list">{data.sectors.map(s=><div key={s.sector} className="sector-row"><div className="sector-copy"><strong>{s.sector}</strong><span>{s.sold} vendidos · {s.held} hold · {s.available} disponíveis</span></div><div className="sector-meter"><i style={{width:`${Math.min(100,s.occupancy)}%`}}/></div><b>{pct(s.occupancy)}</b></div>)}</div></div>
        <div className="inventory-panel"><div className="inventory-panel-head"><div><h3>Holds ativos</h3><p>Reservas temporárias que reduzem disponibilidade.</p></div><span>{activeHolds.length}</span></div>{activeHolds.length?<div className="hold-list">{activeHolds.map(h=><div key={h.id} className="hold-row"><div><strong>{h.code}</strong><span>{h.quantity} ingresso(s) · {h.reason}</span><small>expira {new Date(h.expiresAt).toLocaleString('pt-BR')}</small></div><button onClick={()=>void release(h.id)} title="Liberar hold"><Unlock size={16}/>Liberar</button></div>)}</div>:<div className="inventory-empty">Nenhum hold ativo neste evento.</div>}</div>
      </section>
    </>}
    {showHold&&data&&<div className="inventory-modal-backdrop" onClick={()=>setShowHold(false)}><div className="inventory-modal" onClick={e=>e.stopPropagation()}><div className="inventory-modal-head"><div><span>INVENTORY CONTROL</span><h3>Criar hold temporário</h3></div><button onClick={()=>setShowHold(false)}>×</button></div><label><span>Lote</span><select value={draft.lotId} onChange={e=>setDraft({...draft,lotId:Number(e.target.value)})}>{data.lots.filter(l=>l.available>0).map(l=><option key={l.id} value={l.id}>{l.name} · {l.available} disponíveis</option>)}</select></label><div className="inventory-modal-grid"><label><span>Quantidade</span><input type="number" min="1" value={draft.quantity} onChange={e=>setDraft({...draft,quantity:Number(e.target.value)})}/></label><label><span>Duração</span><select value={draft.minutes} onChange={e=>setDraft({...draft,minutes:Number(e.target.value)})}><option value={5}>5 min</option><option value={10}>10 min</option><option value={15}>15 min</option><option value={30}>30 min</option><option value={60}>1 hora</option><option value={1440}>24 horas</option></select></label></div><label><span>Motivo</span><input value={draft.reason} onChange={e=>setDraft({...draft,reason:e.target.value})} maxLength={160}/></label><div className="inventory-modal-note"><LockKeyhole size={16}/>O hold reduz a disponibilidade imediatamente e expira automaticamente no cálculo do inventário.</div><div className="inventory-modal-actions"><button className="btn secondary" onClick={()=>setShowHold(false)}>Cancelar</button><button className="btn primary" onClick={()=>void createHold()}>Criar hold</button></div></div></div>}
  </div>
}
function Kpi({icon:Icon,label,value,note}:{icon:any;label:string;value:string;note:string}){return <div className="inventory-kpi"><span><Icon size={18}/></span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></div>}
