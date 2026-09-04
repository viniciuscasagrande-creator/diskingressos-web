import {useCallback,useEffect,useMemo,useState} from 'react'
import {Activity,ContactRound,Copy,Download,ExternalLink,RefreshCw,Search,ShieldCheck,Star,TicketCheck,TrendingUp,Users,WalletCards,X} from 'lucide-react'
import type {EventItem} from '../data/events'
import type {PageKey} from '../components/ModuleSidebar'
import {getEventCustomer360,getEventCustomer360Profile,type Customer360Profile,type Customer360Row,type EventCustomer360} from '../services/api'
import './event-customer-360.css'

const money=(c:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(c/100)
const dt=(v:string|null)=>v?new Date(v).toLocaleString('pt-BR'):'—'
const maskDocument=(v:string|null)=>{if(!v)return 'Sem CPF';const d=v.replace(/\D/g,'');return d.length===11?`${d.slice(0,3)}.***.***-${d.slice(-2)}`:v}

type Props={event:EventItem;notify:(m:string)=>void;onNavigate:(p:PageKey)=>void}

export default function EventCustomer360Page({event,notify,onNavigate}:Props){
 const[data,setData]=useState<EventCustomer360|null>(null)
 const[loading,setLoading]=useState(false)
 const[error,setError]=useState('')
 const[q,setQ]=useState('')
 const[segment,setSegment]=useState('Todos')
 const[sort,setSort]=useState<'score'|'value'|'recent'>('score')
 const[checkedOnly,setCheckedOnly]=useState(false)
 const[selected,setSelected]=useState<Customer360Row|null>(null)
 const[profile,setProfile]=useState<Customer360Profile|null>(null)
 const[profileLoading,setProfileLoading]=useState(false)
 const[tab,setTab]=useState<'overview'|'orders'|'tickets'|'checkins'>('overview')

 const load=useCallback(async()=>{setLoading(true);setError('');try{setData(await getEventCustomer360(event.id))}catch(e:any){setError(e?.message||'Falha ao carregar Customer 360.');setData(null)}finally{setLoading(false)}},[event.id])
 useEffect(()=>{load()},[load])

 const segments=useMemo(()=>['Todos',...(data?.segments.map(s=>s.name)||[])],[data])
 const rows=useMemo(()=>{
   let result=[...(data?.customers||[])]
   const term=q.trim().toLowerCase()
   if(term)result=result.filter(c=>`${c.name} ${c.email||''} ${c.phone||''} ${c.document||''}`.toLowerCase().includes(term))
   if(segment!=='Todos')result=result.filter(c=>c.segment===segment)
   if(checkedOnly)result=result.filter(c=>c.checkins>0)
   result.sort((a,b)=>sort==='value'?b.grossCents-a.grossCents:sort==='recent'?(a.recencyDays??99999)-(b.recencyDays??99999):b.score-a.score||b.grossCents-a.grossCents)
   return result
 },[data,q,segment,checkedOnly,sort])

 const exportCsv=()=>{if(!rows.length){notify('Nenhum cliente para exportar.');return}const csv=['Nome;Email;Telefone;Documento;Pedidos;Ingressos;Check-ins;Valor;Segmento;Score',...rows.map(c=>[c.name,c.email||'',c.phone||'',c.document||'',c.orders,c.tickets,c.checkins,(c.grossCents/100).toFixed(2),c.segment,c.score].join(';'))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));a.download=`customer360-${event.code}.csv`;a.click();URL.revokeObjectURL(a.href);notify('Base Customer 360 exportada.')}
 const openProfile=async(c:Customer360Row)=>{setSelected(c);setProfile(null);setTab('overview');setProfileLoading(true);try{setProfile(await getEventCustomer360Profile(event.id,c.key))}catch(e:any){notify(e?.message||'Falha ao abrir perfil operacional.')}finally{setProfileLoading(false)}}
 const copy=async(value:string,label:string)=>{try{await navigator.clipboard.writeText(value);notify(`${label} copiado.`)}catch{notify(`Não foi possível copiar ${label.toLowerCase()}.`)}}
 const close=()=>{setSelected(null);setProfile(null)}
 const go=(page:PageKey,message:string)=>{close();onNavigate(page);notify(message)}

 return <div className="customer360-page" data-testid="customer360-operational">
  <header className="customer360-head"><div><span>CRM · FASE 26.16.4</span><h2>Customer 360 Operacional</h2><p>Busca, segmentação e jornada completa do comprador e participante no evento.</p></div><div><button data-testid="customer360-refresh" onClick={load} disabled={loading}><RefreshCw size={15}/>{loading?'Atualizando...':'Atualizar'}</button><button onClick={exportCsv}><Download size={15}/>Exportar</button></div></header>
  <div className="customer360-strip"><strong>{event.code} · {event.title}</strong><span>{event.venue}</span><b><ShieldCheck size={14}/> producerId + eventId protegidos</b></div>
  {error&&<div className="customer360-error">{error}<button onClick={load}>Tentar novamente</button></div>}
  {!data&&!error&&loading&&<div className="customer360-loading">Carregando base unificada do evento...</div>}
  {data&&<>
   <section className="customer360-kpis"><K icon={Users} label="Clientes únicos" value={String(data.summary.customers)} note={`${data.summary.identifiedRate}% identificados`}/><K icon={Activity} label="Recorrentes" value={String(data.summary.repeatCustomers)} note="Mais de um pedido"/><K icon={Star} label="VIP / Alto valor" value={String(data.summary.vipCustomers)} note="Prioridade CRM"/><K icon={TrendingUp} label="Receita da base" value={money(data.summary.grossCents)} note={`Ticket médio ${money(data.summary.averageTicketCents)}`}/><K icon={ContactRound} label="Participantes" value={String(data.summary.participants)} note={`${data.summary.buyers} compradores`}/></section>
   <section className="customer360-main">
    <div className="customer360-panel">
     <div className="customer360-toolbar operational"><div><h3>Base unificada do evento</h3><p>Pesquise por CPF, nome, e-mail ou telefone.</p></div><label data-testid="customer360-search"><Search size={15}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="CPF, nome, telefone ou e-mail..."/></label></div>
     <div className="crm-filters"><select aria-label="Segmento" value={segment} onChange={e=>setSegment(e.target.value)}>{segments.map(s=><option key={s}>{s}</option>)}</select><select aria-label="Ordenação" value={sort} onChange={e=>setSort(e.target.value as any)}><option value="score">Maior score</option><option value="value">Maior valor</option><option value="recent">Compra mais recente</option></select><label className="crm-check"><input type="checkbox" checked={checkedOnly} onChange={e=>setCheckedOnly(e.target.checked)}/> Com check-in</label><span>{rows.length} resultado{rows.length===1?'':'s'}</span>{(q||segment!=='Todos'||checkedOnly)&&<button onClick={()=>{setQ('');setSegment('Todos');setCheckedOnly(false)}}>Limpar filtros</button>}</div>
     <div className="customer360-table-wrap"><table><thead><tr><th>Cliente</th><th>RFM</th><th>Pedidos</th><th>Ingressos</th><th>Check-ins</th><th>Valor</th><th>Segmento</th><th></th></tr></thead><tbody>{rows.map(c=><tr key={c.key}><td><strong>{c.name}</strong><small>{c.email||c.phone||maskDocument(c.document)}</small></td><td><b>{c.score}</b><small>{c.recencyDays==null?'Sem compra':`${c.recencyDays}d desde compra`}</small></td><td>{c.orders}</td><td>{c.tickets}</td><td>{c.checkins}</td><td>{money(c.grossCents)}</td><td><span className={`crm-segment ${c.segment.toLowerCase().replace(/\s/g,'-')}`}>{c.segment}</span></td><td><button className="crm-open" data-testid="customer360-open-profile" onClick={()=>openProfile(c)}>Abrir 360</button></td></tr>)}{!rows.length&&<tr><td colSpan={8}><div className="crm-empty"><Search size={22}/><strong>Nenhum cliente encontrado</strong><span>Revise a busca ou remova os filtros aplicados.</span></div></td></tr>}</tbody></table></div>
    </div>
    <aside className="customer360-panel customer360-segments"><h3>Segmentação automática</h3>{data.segments.map(s=><button key={s.name} className={segment===s.name?'active':''} onClick={()=>setSegment(s.name)}><span><b>{s.name}</b><small>{s.customers} clientes</small></span><strong>{money(s.grossCents)}</strong></button>)}<div className="crm-rule"><ShieldCheck size={17}/><span><b>First-party data</b><small>Dados isolados por produtora e evento.</small></span></div></aside>
   </section>
  </>}

  {selected&&<div className="crm-modal-bg" onClick={close}><div className="crm-modal crm-modal-wide" onClick={e=>e.stopPropagation()} data-testid="customer360-profile"><button className="crm-x" onClick={close}><X size={18}/></button><span>PERFIL CUSTOMER 360</span><h3>{selected.name}</h3><p>{selected.email||'Sem e-mail'} · {selected.phone||'Sem telefone'} · {maskDocument(selected.document)}</p>
    <div className="crm-actions"><button onClick={()=>selected.email&&copy(selected.email,'E-mail')} disabled={!selected.email}><Copy size={14}/>E-mail</button><button onClick={()=>selected.phone&&copy(selected.phone,'Telefone')} disabled={!selected.phone}><Copy size={14}/>Telefone</button><button onClick={()=>go('event-tickets','Abrindo ingressos do evento.')}><TicketCheck size={14}/>Ingressos</button><button onClick={()=>go('event-global-search','Abrindo Busca Global do evento.')}><Search size={14}/>Busca Global</button><button onClick={()=>go('sac-hub','Abrindo Atendimento / SAC.')}><ContactRound size={14}/>SAC</button><button onClick={()=>go('finance-dashboard','Abrindo Financeiro.')}><WalletCards size={14}/>Financeiro</button></div>
    {profileLoading&&<div className="crm-profile-loading">Carregando pedidos, ingressos e check-ins...</div>}
    {profile&&<>
      <div className="crm-profile-grid"><K2 l="Segmento" v={profile.customer.segment}/><K2 l="Score RFM" v={String(profile.customer.score)}/><K2 l="Pedidos" v={String(profile.customer.orders)}/><K2 l="Ingressos" v={String(profile.customer.tickets)}/><K2 l="Check-ins" v={String(profile.customer.checkins)}/><K2 l="Valor total" v={money(profile.customer.grossCents)}/></div>
      <div className="crm-tabs"><button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}>Visão geral</button><button className={tab==='orders'?'active':''} onClick={()=>setTab('orders')}>Pedidos ({profile.orders.length})</button><button className={tab==='tickets'?'active':''} onClick={()=>setTab('tickets')}>Ingressos ({profile.tickets.length})</button><button className={tab==='checkins'?'active':''} onClick={()=>setTab('checkins')}>Check-ins ({profile.checkins.length})</button></div>
      {tab==='overview'&&<div className="crm-journey"><b>Jornada do cliente</b><span>Primeira compra: {dt(profile.customer.firstPurchaseAt)}</span><span>Última compra: {dt(profile.customer.lastPurchaseAt)}</span><span>Recência: {profile.customer.recencyDays==null?'—':`${profile.customer.recencyDays} dias`}</span><span>Identidade: {profile.customer.document?'CPF':profile.customer.email?'E-mail':profile.customer.phone?'Telefone':'Nome'}</span></div>}
      {tab==='orders'&&<div className="crm-detail-list">{profile.orders.length?profile.orders.map(o=><div key={o.id}><span><b>Pedido {o.code}</b><small>{dt(o.createdAt)} · {o.paymentMethod}</small></span><span><strong>{money(o.grossCents)}</strong><em className={`crm-status ${o.status}`}>{o.status}</em></span></div>):<Empty text="Nenhum pedido relacionado."/>}</div>}
      {tab==='tickets'&&<div className="crm-detail-list">{profile.tickets.length?profile.tickets.map(t=><div key={t.id}><span><b>{t.code}</b><small>{t.type} · {t.lot||'Sem lote'}{t.sector?` · ${t.sector}`:''}</small></span><span><strong>{money(t.priceCents)}</strong><em className={`crm-status ${t.status}`}>{t.status}</em></span></div>):<Empty text="Nenhum ingresso relacionado."/>}</div>}
      {tab==='checkins'&&<div className="crm-detail-list">{profile.checkins.length?profile.checkins.map(c=><div key={c.id}><span><b>{c.ticketCode||'Check-in'}</b><small>{dt(c.checkedAt)} · {c.gate||'Portão não informado'} · {c.method}</small></span><span><strong>{c.operatorName||'Sistema'}</strong><em className={`crm-status ${c.status}`}>{c.status}</em></span></div>):<Empty text="Nenhum check-in relacionado."/>}</div>}
    </>}
    <div className="crm-modal-footer"><button onClick={close}>Fechar</button><button className="primary" onClick={()=>go('event-global-search','Cliente disponível para investigação na Busca Global.')}><ExternalLink size={14}/>Investigar no Event OS</button></div>
  </div></div>}
 </div>
}

function K({icon:Icon,label,value,note}:{icon:any;label:string;value:string;note:string}){return <div className="crm-kpi"><i><Icon size={18}/></i><span><small>{label}</small><strong>{value}</strong><em>{note}</em></span></div>}
function K2({l,v}:{l:string;v:string}){return <div><small>{l}</small><strong>{v}</strong></div>}
function Empty({text}:{text:string}){return <div className="crm-empty compact"><span>{text}</span></div>}
