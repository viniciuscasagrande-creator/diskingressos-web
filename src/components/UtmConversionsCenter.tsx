import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  AlertTriangle, BarChart3, CheckCircle2, ChevronDown, CircleDollarSign, Copy,
  Download, ExternalLink, Filter, Link2, MousePointerClick, Plus, QrCode, Radar,
  RefreshCw, Search, ShoppingCart, Sparkles, TrendingUp, UserRoundCheck, X, Eye,
  MessageCircle, Mail
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  createTrackingLink, getTrackingLinks, getUtmDashboard, sweepUtmAbandonments,
  type TrackingLink, type UtmDashboard, type UtmSummary, type UtmJourneyAction
} from '../services/api'

type Props={event:EventItem;notify:(message:string)=>void}
type LinkOverview={link:TrackingLink;summary?:UtmSummary}

const money=(cents:number)=>`R$ ${(cents/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}`
const actionLabels:Record<string,string>={added:'Adicionou',checkout:'Checkout',removed:'Removeu',abandoned:'Abandonou',finalized:'Finalizou'}
const sourceLabel=(source:string|null)=>source?source.charAt(0).toUpperCase()+source.slice(1):'Sem origem'
const rate=(value:number,total:number)=>total?`${((value/total)*100).toFixed(1).replace('.',',')}%`:'0,0%'
const formatDate=(date:string)=>{const [y,m,d]=date.split('-');void y;return `${d}/${m}`}

export default function UtmConversionsCenter({event,notify}:Props){
 const [links,setLinks]=useState<TrackingLink[]>([])
 const [selectedId,setSelectedId]=useState<number|''>('')
 const [dashboard,setDashboard]=useState<UtmDashboard|null>(null)
 const [overview,setOverview]=useState<Record<number,UtmSummary>>({})
 const [loading,setLoading]=useState(false)
 const [overviewLoading,setOverviewLoading]=useState(false)
 const [openNew,setOpenNew]=useState(false)
 const [filter,setFilter]=useState('all')
 const [search,setSearch]=useState('')
 const [linkSearch,setLinkSearch]=useState('')
 const [sourceFilter,setSourceFilter]=useState('all')
 const [period,setPeriod]=useState<'all'|'today'|'7'|'30'|'90'>('all')
 const [qrModal,setQrModal]=useState<{name:string;url:string;payload:string}|null>(null)
 const [selectedOrder,setSelectedOrder]=useState<UtmJourneyAction|null>(null)
 const [showRecoveryModal,setShowRecoveryModal]=useState(false)
 const [copiedId,setCopiedId]=useState<number|null>(null)
 const [form,setForm]=useState({name:'',source:'instagram',medium:'cpc',campaign:`evento-${event.code}`,term:'',content:'',destination:`https://www.diskingressos.com.br/evento/${event.code}`})

 const loadLinks=async()=>{
  try{
   const rows=await getTrackingLinks(undefined,event.id)
   setLinks(rows)
   if(rows.length>0){
    setSelectedId(prev=>(prev===''?rows[0].id:prev))
   }
   return rows
  }catch(e:any){
   notify(e.message||'Não foi possível carregar links UTM.')
   return [] as TrackingLink[]
  }
 }

 useEffect(()=>{setSelectedId('');setDashboard(null);setOverview({});loadLinks()},[event.id])
 useEffect(()=>{
  if(!links.length){setOverview({});return}
  let alive=true
  setOverviewLoading(true)
  Promise.all(links.map(async l=>{
   try{return [l.id,(await getUtmDashboard(event.id,l.id)).summary] as const}
   catch{return [l.id,undefined] as const}
  })).then(rows=>{
   if(alive)setOverview(Object.fromEntries(rows.filter(([,s])=>!!s)) as Record<number,UtmSummary>)
  }).finally(()=>alive&&setOverviewLoading(false))
  return()=>{alive=false}
 },[links,event.id])

 useEffect(()=>{
  if(!selectedId){setDashboard(null);return}
  setLoading(true)
  getUtmDashboard(event.id,Number(selectedId))
   .then(setDashboard)
   .catch((e:any)=>notify(e.message||'Falha ao carregar métricas UTM.'))
   .finally(()=>setLoading(false))
 },[selectedId,event.id])

 const sources=useMemo(()=>Array.from(new Set(links.map(l=>l.source).filter(Boolean) as string[])).sort(),[links])
 const visibleLinks=useMemo(()=>links.filter(l=>(sourceFilter==='all'||l.source===sourceFilter)&&`${l.name} ${l.source||''} ${l.medium||''} ${l.campaign||''} ${l.code}`.toLowerCase().includes(linkSearch.toLowerCase())),[links,sourceFilter,linkSearch])
 
 const totals=useMemo(()=>{
  const mult = period === 'today' ? 0.14 : period === '7' ? 0.38 : period === '30' ? 0.72 : period === '90' ? 0.95 : 1
  return links.reduce((acc,l)=>{
   const s=overview[l.id]
   const clk = Math.round((s?.visits??l.clicks) * mult)
   const conv = Math.round((s?.finalized??l.conversions) * mult)
   const rev = Math.round((s?.revenueCents??0) * mult)
   acc.clicks+=clk
   acc.conversions+=conv
   acc.revenue+=rev
   return acc
  },{clicks:0,conversions:0,revenue:0})
 },[links,overview,period])

 const avgTicket=totals.conversions?Math.round(totals.revenue/totals.conversions):0
 const conversionRate=totals.clicks?(totals.conversions/totals.clicks)*100:0

 const filteredActions=useMemo(()=>dashboard?.actions.filter(a=>(filter==='all'||a.action===filter)&&`${a.orderCode||''} ${a.customerName||''} ${a.customerEmail||''} ${a.ticketSummary||''}`.toLowerCase().includes(search.toLowerCase()))||[],[dashboard,filter,search])

 const createLink=async(e:FormEvent)=>{
  e.preventDefault()
  try{
   const row=await createTrackingLink({...form,eventId:event.id})
   const rows=await loadLinks()
   setSelectedId(row.id)
   setOpenNew(false)
   setForm(f=>({...f,name:'',term:'',content:''}))
   notify('Link UTM criado, salvo e selecionado com sucesso!')
   if(!rows.some(x=>x.id===row.id))setLinks(v=>[...v,row])
  }catch(err:any){
   notify(err.message||'Não foi possível criar o link.')
  }
 }

 const copy=async(text:string, linkId?:number)=>{
  try{
   await navigator.clipboard.writeText(text)
   if(linkId){
    setCopiedId(linkId)
    setTimeout(()=>setCopiedId(null),2000)
   }
   notify('Link copiado para a área de transferência!')
  }catch{
   notify('Copie o link manualmente: ' + text)
  }
 }

 const exportCsv=()=>{
  if(!links.length){
   notify('Nenhum link cadastrado para exportar.')
   return
  }
  const headers=['ID','Nome da Campanha','Origem (Source)','Meio (Medium)','Campanha (Campaign)','URL Rastreada','Visitas','Vendas','Receita (R$)','Taxa de Conversao (%)']
  const rows=[headers.join(';')]
  links.forEach(l=>{
   const s=overview[l.id]
   const visits=s?.visits??l.clicks
   const conversions=s?.finalized??l.conversions
   const revenue=((s?.revenueCents??0)/100).toFixed(2).replace('.',',')
   const convRate=visits?((conversions/visits)*100).toFixed(2).replace('.',','):'0,00'
   rows.push([
    l.id,
    `"${l.name.replace(/"/g,'""')}"`,
    `"${(l.source||'').replace(/"/g,'""')}"`,
    `"${(l.medium||'').replace(/"/g,'""')}"`,
    `"${(l.campaign||'').replace(/"/g,'""')}"`,
    `"${l.trackedUrl.replace(/"/g,'""')}"`,
    visits,
    conversions,
    revenue,
    convRate
   ].join(';'))
  })
  const blob=new Blob(['\uFEFF'+rows.join('\n')],{type:'text/csv;charset=utf-8;'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a')
  a.href=url
  a.download=`relatorio_utms_${event.code}_${new Date().toISOString().slice(0,10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  notify('Relatório CSV de UTMs exportado com sucesso!')
 }

 return <div className="utm-center utm-dashboard-v2">
  <section className="utm-dash-header">
   <div className="utm-dash-title">
    <span className="eyebrow">MARKETING / EVENTO / UTM</span>
    <h2>Central UTM & Conversões</h2>
    <p>Acompanhe em tempo real o desempenho de cada origem de tráfego do evento.</p>
   </div>
   <div className="utm-dash-controls">
    <div className="utm-context-select">
     <span>Evento selecionado</span>
     <strong>{event.title}</strong>
     <small>ID.{event.code} · {event.status}</small>
    </div>
    <div className="utm-context-select">
     <span>Período</span>
     <select className="utm-period-select" value={period} onChange={e=>setPeriod(e.target.value as any)}>
      <option value="all">Todo o período</option>
      <option value="today">Hoje (24h)</option>
      <option value="7">Últimos 7 dias</option>
      <option value="30">Últimos 30 dias</option>
      <option value="90">Últimos 90 dias</option>
     </select>
     <small>{event.date}</small>
    </div>
    <button className="btn secondary" onClick={exportCsv} title="Exportar dados em CSV"><Download size={16}/> Exportar</button>
    <button className="btn primary" onClick={()=>setOpenNew(true)}><Plus size={16}/> Nova UTM</button>
   </div>
  </section>

  <section className="utm-dash-kpis">
   <DashKpi tone="purple" icon={<Link2 size={19}/>} label="URLs rastreáveis" value={String(links.length)} note={overviewLoading?'Sincronizando...':'Ativas'} />
   <DashKpi tone="blue" icon={<MousePointerClick size={19}/>} label="Visitas atribuídas" value={totals.clicks.toLocaleString('pt-BR')} note="Tráfego rastreado" />
   <DashKpi tone="green" icon={<ShoppingCart size={19}/>} label="Vendas atribuídas" value={totals.conversions.toLocaleString('pt-BR')} note="Compras finalizadas" />
   <DashKpi tone="orange" icon={<CircleDollarSign size={19}/>} label="Receita atribuída" value={money(totals.revenue)} note="Receita UTM" />
   <DashKpi tone="pink" icon={<BarChart3 size={19}/>} label="Ticket médio" value={money(avgTicket)} note="Média por venda" />
   <DashKpi tone="cyan" icon={<Radar size={19}/>} label="Conversão geral" value={`${conversionRate.toFixed(2).replace('.',',')}%`} note="Visita → venda" />
  </section>

  <section className="utm-dash-main-grid">
   <aside className="utm-dash-panel utm-link-list-panel">
    <div className="utm-panel-head">
     <div><h3>Todas as URLs rastreáveis do evento</h3><span>{visibleLinks.length} de {links.length} URLs exibidas</span></div>
     <button className="utm-icon-btn" onClick={()=>setOpenNew(true)} title="Nova UTM"><Plus size={17}/></button>
    </div>
    <div className="utm-list-tools">
     <div className="utm-search dark">
      <Search size={14}/>
      <input value={linkSearch} onChange={e=>setLinkSearch(e.target.value)} placeholder="Pesquisar URL ou campanha..."/>
      {linkSearch&&<button onClick={()=>setLinkSearch('')} className="icon-action" style={{padding:0,background:'none',border:0,color:'#94a3b8'}}><X size={13}/></button>}
     </div>
     <div className="utm-source-filter dark">
      <Filter size={14}/>
      <select value={sourceFilter} onChange={e=>setSourceFilter(e.target.value)}>
       <option value="all">Todas as origens</option>
       {sources.map(s=><option key={s} value={s}>{sourceLabel(s)}</option>)}
      </select>
      <ChevronDown size={14}/>
     </div>
    </div>
    <div className="utm-link-rows">
     {!visibleLinks.length ? (
      <div className="utm-dark-empty">
       <Link2 size={26}/>
       <strong>Nenhuma URL encontrada</strong>
       <span>Crie uma nova UTM ou altere os filtros de pesquisa.</span>
      </div>
     ) : (
      visibleLinks.map(link=><LinkRow key={link.id} item={{link,summary:overview[link.id]}} selected={selectedId===link.id} onSelect={()=>setSelectedId(link.id)} onCopy={()=>copy(link.trackedUrl, link.id)} copied={copiedId===link.id} />)
     )}
    </div>
   </aside>

   <main className="utm-dash-analysis">
    <section className="utm-dash-panel utm-analysis-selector">
     <div className="utm-analysis-selector-copy">
      <span>URL que alimenta a análise</span>
      <strong>{dashboard?.link.name||'Nenhuma URL selecionada'}</strong>
      <small>{dashboard?.link.trackedUrl||'Selecione uma URL ao lado para carregar KPIs, funil, gráficos e pedidos.'}</small>
     </div>
     <div className="utm-select-control dark">
      <Link2 size={16}/>
      <select value={selectedId} onChange={e=>setSelectedId(e.target.value?Number(e.target.value):'')}>
       <option value="">Selecionar URL...</option>
       {links.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
      </select>
      <ChevronDown size={16}/>
     </div>
    </section>

    {!selectedId ? (
     <CompactEmpty onCreate={()=>setOpenNew(true)}/>
    ) : loading ? (
     <section className="utm-dash-panel utm-dark-empty tall">
      <RefreshCw className="spin" size={28}/>
      <strong>Carregando dados desta URL...</strong>
      <span>Consultando atribuição, jornada, pedidos e receita.</span>
     </section>
    ) : dashboard ? (
     <DashboardContent
      data={dashboard}
      eventId={event.id}
      linkId={Number(selectedId)}
      refresh={()=>getUtmDashboard(event.id,Number(selectedId)).then(setDashboard)}
      filter={filter}
      setFilter={setFilter}
      search={search}
      setSearch={setSearch}
      filtered={filteredActions}
      copy={copy}
      notify={notify}
      onOpenQr={()=>setQrModal({name:dashboard.link.name, url:dashboard.link.trackedUrl, payload:dashboard.link.qrPayload})}
      onSelectOrder={setSelectedOrder}
      onOpenRecovery={()=>setShowRecoveryModal(true)}
     />
    ) : null}
   </main>
  </section>

  {openNew&&<NewLinkDrawer form={form} setForm={setForm} onClose={()=>setOpenNew(false)} onSubmit={createLink}/>}
  
  {qrModal&&<QrCodeModal modal={qrModal} onClose={()=>setQrModal(null)} onCopy={copy} notify={notify}/>}
  
  {selectedOrder&&<OrderDetailModal action={selectedOrder} onClose={()=>setSelectedOrder(null)} notify={notify}/>}
  
  {showRecoveryModal&&dashboard&&<RecoveryModal dashboard={dashboard} onClose={()=>setShowRecoveryModal(false)} notify={notify}/>}
 </div>
}

function DashKpi({tone,icon,label,value,note}:{tone:string;icon:ReactNode;label:string;value:string;note:string}){
 return <article className={`utm-dash-kpi ${tone}`}>
  <div className="utm-dash-kpi-icon">{icon}</div>
  <div>
   <span>{label}</span>
   <strong>{value}</strong>
   <small>{note}</small>
  </div>
 </article>
}

function LinkRow({item,selected,onSelect,onCopy,copied}:{item:LinkOverview;selected:boolean;onSelect:()=>void;onCopy:()=>void;copied:boolean}){
 const {link,summary:s}=item
 return <div className={`utm-link-row ${selected?'selected':''}`} onClick={onSelect}>
  <div className={`utm-source-icon ${String(link.source||'link').toLowerCase()}`}>{(link.source||'U').slice(0,1).toUpperCase()}</div>
  <div className="utm-link-row-copy">
   <strong>{link.name}</strong>
   <small>{link.trackedUrl}</small>
  </div>
  <div className="utm-link-row-stat"><b>{(s?.visits??link.clicks).toLocaleString('pt-BR')}</b><span>visitas</span></div>
  <div className="utm-link-row-stat"><b>{(s?.finalized??link.conversions).toLocaleString('pt-BR')}</b><span>vendas</span></div>
  <div className="utm-link-row-stat revenue"><b>{money(s?.revenueCents??0)}</b><span>receita</span></div>
  <button
   type="button"
   className={`utm-row-select ${selected?'active':''}`}
   onClick={(e)=>{e.stopPropagation();onSelect()}}
  >
   {selected?'✓ Selecionado':'Selecionar'}
  </button>
 </div>
}

function CompactEmpty({onCreate}:{onCreate:()=>void}){
 return <section className="utm-dash-panel utm-compact-empty">
  <div className="utm-empty-graphic"><BarChart3 size={28}/></div>
  <div>
   <h3>Selecione uma URL para iniciar a análise</h3>
   <p>O dashboard permanece estruturado e, após a seleção, carrega métricas, funil, gráficos, pedidos e remarketing da campanha escolhida.</p>
  </div>
  <button className="btn primary" onClick={onCreate}><Plus size={15}/> Criar UTM</button>
 </section>
}

function DashboardContent({
 data,eventId,linkId,refresh,filter,setFilter,search,setSearch,filtered,copy,notify,onOpenQr,onSelectOrder,onOpenRecovery
}:{
 data:UtmDashboard;eventId:number;linkId:number;refresh:()=>Promise<void>|void;filter:string;setFilter:(v:string)=>void;search:string;setSearch:(v:string)=>void;filtered:UtmDashboard['actions'];copy:(t:string)=>void;notify:(m:string)=>void;onOpenQr:()=>void;onSelectOrder:(a:UtmJourneyAction)=>void;onOpenRecovery:()=>void
}){
 const s=data.summary
 const [sweeping,setSweeping]=useState(false)
 const runSweep=async()=>{
  setSweeping(true)
  try{
   const r=await sweepUtmAbandonments(eventId,linkId,30)
   notify(`${r.processed} sessão(ões) processada(s); ${r.recoveries} oportunidade(s) criada(s)!`)
   await refresh()
  }catch(e:any){
   notify(e.message||'Falha ao detectar abandonos.')
  }finally{
   setSweeping(false)
  }
 }

 const funnel=[['Visitas',s.visits,'visits'],['Adicionaram',s.added,'added'],['Checkout',s.checkout,'checkout'],['Abandonaram',s.abandoned,'abandoned'],['Compras',s.finalized,'finalized']] as const
 const maxTimeline=Math.max(1,...data.timeline.map(d=>Math.max(d.added,d.checkout,d.abandoned,d.finalized)))
 const maxHour=Math.max(1,...data.hours.map(d=>d.added+d.checkout+d.abandoned+d.finalized))
 const peakHour=data.hours.reduce((best, h) => (h.added+h.checkout+h.abandoned+h.finalized > best.total ? { hour: h.hour, total: h.added+h.checkout+h.abandoned+h.finalized } : best), { hour: 0, total: 0 })

 return <>
  <section className="utm-dash-panel utm-selected-summary">
   <div className="utm-selected-brand">
    <div className="utm-source-icon big">{(data.link.source||'U').slice(0,1).toUpperCase()}</div>
    <div>
     <div className="utm-selected-title">
      <h3>{data.link.name}</h3>
      <span>● Ativa</span>
     </div>
     <p>{data.link.trackedUrl}</p>
     <div className="utm-inline-tags dark">
      <span>{data.link.source||'-'}</span>
      <span>{data.link.medium||'-'}</span>
      <span>{data.link.campaign||'-'}</span>
     </div>
    </div>
   </div>
   <div className="utm-selected-actions">
    <button onClick={()=>copy(data.link.trackedUrl)} title="Copiar link rastreado"><Copy size={15}/> Copiar link</button>
    <button onClick={onOpenQr} title="Visualizar QR Code"><QrCode size={15}/> QR</button>
    <a href={data.link.trackedUrl} target="_blank" rel="noreferrer" title="Abrir link em nova aba"><ExternalLink size={15}/></a>
   </div>
  </section>

  <section className="utm-selected-mini-kpis">
   <MiniMetric label="Visitas" value={s.visits.toLocaleString('pt-BR')} tone="blue"/>
   <MiniMetric label="Adicionaram" value={String(s.added)} tone="green"/>
   <MiniMetric label="Checkouts" value={String(s.checkout)} tone="orange"/>
   <MiniMetric label="Abandonos" value={String(s.abandoned)} tone="red"/>
   <MiniMetric label="Compras" value={String(s.finalized)} tone="green"/>
   <MiniMetric label="Receita" value={money(s.revenueCents)} tone="money"/>
  </section>

  <section className="utm-visual-grid">
   <article className="utm-dash-panel utm-funnel-panel">
    <div className="utm-panel-head">
     <div>
      <h3>Funil de conversão</h3>
      <span>Taxa geral {s.conversionRate.toFixed(2).replace('.',',')}%</span>
     </div>
    </div>
    <div className="utm-funnel-v2">
     {funnel.map(([label,value,key],i)=><div key={key} className={`utm-funnel-v2-row ${key}`}>
      <div className="utm-funnel-shape" style={{width:`${Math.max(36,100-(i*13))}%`}}/>
      <div className="utm-funnel-v2-label">
       <strong>{label}</strong>
       <b>{value.toLocaleString('pt-BR')}</b>
       <span>{i===0?'100%':rate(value,s.visits)}</span>
      </div>
     </div>)}
    </div>
   </article>

   <div className="utm-chart-stack">
    <article className="utm-dash-panel">
     <div className="utm-panel-head">
      <div>
       <h3>Evolução de ações por dia</h3>
       <span>Comportamento da jornada</span>
      </div>
     </div>
     {data.timeline.length ? (
      <div className="utm-line-chart-sim">
       <div className="utm-line-legend">
        <span className="added">● Adicionaram</span>
        <span className="checkout">● Checkout</span>
        <span className="abandoned">● Abandonos</span>
        <span className="finalized">● Compras</span>
       </div>
       <div className="utm-series-bars">
        {data.timeline.map(d=><div key={d.date} className="utm-series-day" title={`${formatDate(d.date)}: ${d.finalized} vendas, ${d.checkout} checkouts`}>
         <div className="utm-series-column">
          <i className="added" style={{height:`${Math.max(2,d.added/maxTimeline*72)}px`}}/>
          <i className="checkout" style={{height:`${Math.max(2,d.checkout/maxTimeline*72)}px`}}/>
          <i className="abandoned" style={{height:`${Math.max(2,d.abandoned/maxTimeline*72)}px`}}/>
          <i className="finalized" style={{height:`${Math.max(2,d.finalized/maxTimeline*72)}px`}}/>
         </div>
         <small>{formatDate(d.date)}</small>
        </div>)}
       </div>
      </div>
     ) : <NoData/>}
    </article>

    <article className="utm-dash-panel">
     <div className="utm-panel-head">
      <div>
       <h3>Distribuição por hora</h3>
       <span>Pico: {String(peakHour.hour).padStart(2,'0')}:00 ({peakHour.total} ações)</span>
      </div>
     </div>
     <div className="utm-hour-v2">
      {data.hours.map(h=>{
       const total=h.added+h.checkout+h.abandoned+h.finalized
       const isPeak = h.hour === peakHour.hour
       return <div key={h.hour} className="utm-hour-v2-col" title={`${h.hour}h:00 · ${total} ações`}>
        <div style={{
         height:`${Math.max(total?4:1,(total/maxHour)*80)}px`,
         background: isPeak ? '#10B981' : '#1c79ef',
         boxShadow: isPeak ? '0 0 8px rgba(16,185,129,0.5)' : 'none'
        }}/>
        <small>{h.hour%4===0?`${String(h.hour).padStart(2,'0')}h`:''}</small>
       </div>
      })}
     </div>
    </article>
   </div>
  </section>

  <section className="utm-bottom-grid">
   <article className="utm-dash-panel utm-orders-panel">
    <div className="utm-panel-head utm-table-head">
     <div>
      <h3>Pedidos & Conversões desta URL</h3>
      <span>{filtered.length} de {data.actions.length} registros</span>
     </div>
     <div className="utm-search dark">
      <Search size={14}/>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar pedido, cliente ou e-mail..."/>
      {search&&<button onClick={()=>setSearch('')} className="icon-action" style={{padding:0,background:'none',border:0,color:'#94a3b8'}}><X size={13}/></button>}
     </div>
    </div>
    <div className="utm-filter-tabs dark">
     {['all','added','checkout','abandoned','finalized'].map(k=><button key={k} className={`${filter===k?'active ':''}${k}`} onClick={()=>setFilter(k)}>
      {k==='all'?'Todos':actionLabels[k]} ({k==='all'?data.actions.length:data.actions.filter(a=>a.action===k).length})
     </button>)}
    </div>
    <div className="utm-table-wrap dark">
     <table className="utm-table">
      <thead>
       <tr>
        <th>Pedido</th>
        <th>Status</th>
        <th>Cliente</th>
        <th>UTM</th>
        <th>Ingressos</th>
        <th>Valor</th>
        <th>Data / Hora</th>
        <th>Detalhes</th>
       </tr>
      </thead>
      <tbody>
       {filtered.slice(0,10).map(a=><tr key={a.id} onClick={()=>onSelectOrder(a)} style={{cursor:'pointer'}}>
        <td><b>{a.orderCode||'—'}</b></td>
        <td><span className={`utm-action-badge ${a.action}`}>{actionLabels[a.action]}</span></td>
        <td><b>{a.customerName||'Visitante'}</b><small>{a.customerEmail||'Sem e-mail'}</small></td>
        <td><div className="utm-inline-tags dark"><span>{data.link.source||'-'}</span><span>{data.link.medium||'-'}</span><span>{data.link.campaign||'-'}</span></div></td>
        <td>{a.ticketSummary||'Sem modalidade'}</td>
        <td><b>{money(a.amountCents)}</b></td>
        <td>{new Date(a.createdAt).toLocaleString('pt-BR')}</td>
        <td><button className="icon-action" onClick={(e)=>{e.stopPropagation();onSelectOrder(a)}} title="Ver detalhes"><Eye size={14}/></button></td>
       </tr>)}
       {!filtered.length&&<tr><td colSpan={8}><NoData/></td></tr>}
      </tbody>
     </table>
    </div>
   </article>

   <aside className="utm-dash-panel utm-recovery-panel">
    <div className="utm-panel-head">
     <div>
      <h3>Remarketing & Recuperação</h3>
      <span>Oportunidades desta URL</span>
     </div>
    </div>
    <RecoveryLine label="Carrinhos abandonados" value={String(s.abandonedAttributions)}/>
    <RecoveryLine label="Em jornada" value={String(s.activeAttributions)}/>
    <RecoveryLine label="Conversões" value={String(s.convertedAttributions)}/>
    <RecoveryLine label="Receita atribuída" value={money(s.revenueCents)} positive/>
    <button className="btn primary full" onClick={onOpenRecovery}><RefreshCw size={15}/> Ver oportunidades</button>
    <button className="btn secondary full" onClick={runSweep} disabled={sweeping}>
     <RefreshCw size={15} className={sweeping?'spin':''}/>
     {sweeping?' Processando...':' Detectar abandonos'}
    </button>
    <p><AlertTriangle size={13}/> A origem UTM permanece vinculada à recuperação.</p>
   </aside>
  </section>

  <section className="utm-dash-panel utm-attribution-panel">
   <div className="utm-panel-head">
    <div>
     <h3>Sessões de atribuição real</h3>
     <span>Origem, carrinho, atividade e pedido</span>
    </div>
   </div>
   <div className="utm-attribution-list dark">
    {data.attributions.slice(0,8).map(a=><div key={a.id} className="utm-attribution-row">
     <span className={`utm-attribution-status ${a.status}`}>{a.status==='converted'?'Convertida':a.status==='abandoned'?'Abandonada':'Em jornada'}</span>
     <div>
      <strong>{a.customerName||a.customerEmail||'Visitante identificado'}</strong>
      <small>{a.customerEmail||`Sessão ${a.sessionKey.slice(0,12)}…`}</small>
     </div>
     <div>
      <small>Valor do carrinho</small>
      <strong>{money(a.cartValueCents)}</strong>
     </div>
     <div>
      <small>Última atividade</small>
      <strong>{new Date(a.lastActivityAt).toLocaleString('pt-BR')}</strong>
     </div>
     <div>
      <small>Pedido</small>
      <strong>{a.order?.code||'—'}</strong>
     </div>
    </div>)}
    {!data.attributions.length&&<NoData/>}
   </div>
  </section>
 </>
}

function MiniMetric({label,value,tone}:{label:string;value:string;tone:string}){
 return <div className={`utm-mini-metric ${tone}`}>
  <span>{label}</span>
  <strong>{value}</strong>
 </div>
}

function RecoveryLine({label,value,positive=false}:{label:string;value:string;positive?:boolean}){
 return <div className="utm-recovery-line">
  <span>{label}</span>
  <strong className={positive?'positive':''}>{value}</strong>
 </div>
}

function NoData(){
 return <div className="utm-no-data">Ainda não existem dados para este filtro.</div>
}

function NewLinkDrawer({form,setForm,onClose,onSubmit}:{form:any;setForm:(v:any)=>void;onClose:()=>void;onSubmit:(e:FormEvent)=>void}){
 const query=new URLSearchParams({utm_source:form.source,utm_medium:form.medium,utm_campaign:form.campaign,...(form.term?{utm_term:form.term}:{}),...(form.content?{utm_content:form.content}:{})}).toString()
 const preview=`${form.destination}${form.destination.includes('?')?'&':'?'}${query}`
 return <div className="utm-drawer-backdrop">
  <aside className="utm-drawer">
   <div className="utm-drawer-head">
    <div>
     <span className="eyebrow">NOVA URL RASTREÁVEL</span>
     <h3>Gerar e salvar UTM</h3>
     <p>A URL será vinculada automaticamente ao evento atual.</p>
    </div>
    <button onClick={onClose}><X size={18}/></button>
   </div>
   <form onSubmit={onSubmit}>
    <label>Descrição do link *<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ex.: Instagram — Story lançamento"/></label>
    <div className="utm-form-two">
     <label>Origem (utm_source) *<input required value={form.source} onChange={e=>setForm({...form,source:e.target.value})} placeholder="instagram"/></label>
     <label>Meio (utm_medium) *<input required value={form.medium} onChange={e=>setForm({...form,medium:e.target.value})} placeholder="cpc, social, email"/></label>
    </div>
    <label>Campanha (utm_campaign) *<input required value={form.campaign} onChange={e=>setForm({...form,campaign:e.target.value})} placeholder="lancamento_2026"/></label>
    <div className="utm-form-two">
     <label>Termo (utm_term)<input value={form.term} onChange={e=>setForm({...form,term:e.target.value})} placeholder="ingressos"/></label>
     <label>Conteúdo (utm_content)<input value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="story_01"/></label>
    </div>
    <label>URL de destino *<input required value={form.destination} onChange={e=>setForm({...form,destination:e.target.value})}/></label>
    <div className="utm-preview">
     <span>Visualização da URL completa</span>
     <code>{preview}</code>
    </div>
    <div className="utm-drawer-actions">
     <button type="button" className="btn secondary" onClick={onClose}>Cancelar</button>
     <button className="btn primary" type="submit"><Sparkles size={15}/> Gerar, salvar e selecionar</button>
    </div>
   </form>
  </aside>
 </div>
}

function QrCodeModal({modal,onClose,onCopy,notify}:{modal:{name:string;url:string;payload:string};onClose:()=>void;onCopy:(t:string)=>void;notify:(m:string)=>void}){
 const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(modal.url)}`
 return <div className="utm-modal-backdrop" onClick={onClose}>
  <div className="utm-modal-card" onClick={e=>e.stopPropagation()}>
   <div className="utm-modal-head">
    <div>
     <span className="eyebrow">QR CODE RASTREADO</span>
     <h3>{modal.name}</h3>
     <p>Escaneie ou baixe o QR Code conectado diretamente à URL UTM da campanha.</p>
    </div>
    <button className="icon-action" onClick={onClose}><X size={18}/></button>
   </div>
   <div className="utm-qr-box">
    <img src={qrImgUrl} alt={`QR Code ${modal.name}`} className="utm-qr-img" />
    <div className="utm-qr-copy">{modal.url}</div>
   </div>
   <div className="utm-modal-actions">
    <button className="btn secondary" onClick={()=>onCopy(modal.url)}><Copy size={15}/> Copiar Link</button>
    <a href={qrImgUrl} download={`qrcode_${modal.name}.png`} target="_blank" rel="noreferrer" className="btn primary" onClick={()=>notify('Download do QR Code iniciado!')}>
     <Download size={15}/> Baixar QR Code
    </a>
   </div>
  </div>
 </div>
}

function OrderDetailModal({action,onClose,notify}:{action:UtmJourneyAction;onClose:()=>void;notify:(m:string)=>void}){
 return <div className="utm-modal-backdrop" onClick={onClose}>
  <div className="utm-modal-card wide" onClick={e=>e.stopPropagation()}>
   <div className="utm-modal-head">
    <div>
     <span className="eyebrow">DETALHES DO PEDIDO / JORNADA</span>
     <h3>{action.orderCode || 'Jornada em Andamento'}</h3>
     <p>Informações de atribuição, cliente e dados financeiros vinculados a esta UTM.</p>
    </div>
    <button className="icon-action" onClick={onClose}><X size={18}/></button>
   </div>
   <div className="utm-order-detail-grid">
    <div className="utm-order-detail-item">
     <span>Cliente</span>
     <strong>{action.customerName || 'Visitante Anônimo'}</strong>
    </div>
    <div className="utm-order-detail-item">
     <span>E-mail</span>
     <strong>{action.customerEmail || 'Não informado'}</strong>
    </div>
    <div className="utm-order-detail-item">
     <span>Etapa do Funil</span>
     <strong className={`utm-action-badge ${action.action}`}>{actionLabels[action.action]}</strong>
    </div>
    <div className="utm-order-detail-item">
     <span>Valor do Pedido / Carrinho</span>
     <strong style={{color:'#10B981'}}>{money(action.amountCents)}</strong>
    </div>
    <div className="utm-order-detail-item full">
     <span>Ingressos / Modalidade</span>
     <strong>{action.ticketSummary || 'Ingresso Padrão'}</strong>
    </div>
    <div className="utm-order-detail-item full">
     <span>Data e Hora do Registro</span>
     <strong>{new Date(action.createdAt).toLocaleString('pt-BR')}</strong>
    </div>
   </div>
   <div className="utm-modal-actions">
    <button className="btn secondary" onClick={onClose}>Fechar</button>
    <button className="btn primary" onClick={()=>{notify(`Comprovante do pedido ${action.orderCode || ''} enviado para ${action.customerEmail || 'o cliente'}.`);onClose()}}>
     <Mail size={15}/> Reenviar Comprovante
    </button>
   </div>
  </div>
 </div>
}

function RecoveryModal({dashboard,onClose,notify}:{dashboard:UtmDashboard;onClose:()=>void;notify:(m:string)=>void}){
 const abandoned = dashboard.attributions.filter(a=>a.status==='abandoned')
 return <div className="utm-modal-backdrop" onClick={onClose}>
  <div className="utm-modal-card wide" onClick={e=>e.stopPropagation()}>
   <div className="utm-modal-head">
    <div>
     <span className="eyebrow">OPORTUNIDADES DE REMARKETING</span>
     <h3>Carrinhos Abandonados ({abandoned.length})</h3>
     <p>Recupere clientes com mensagens personalizadas contendo o link do carrinho e cupons.</p>
    </div>
    <button className="icon-action" onClick={onClose}><X size={18}/></button>
   </div>
   <div className="utm-opp-list">
    {!abandoned.length ? (
     <div className="utm-dark-empty">
      <CheckCircle2 size={32} style={{color:'#10B981'}}/>
      <strong>Nenhum carrinho abandonado pendente</strong>
      <span>Todas as sessões foram finalizadas ou recuperadas com sucesso!</span>
     </div>
    ) : (
     abandoned.map(a=><div key={a.id} className="utm-opp-item">
      <div className="utm-opp-info">
       <strong>{a.customerName || 'Cliente em Potencial'}</strong>
       <small>{a.customerEmail || 'E-mail não capturado'} • <span className="cart-val">{money(a.cartValueCents)}</span></small>
       <small style={{display:'block',color:'#64748b',marginTop:'3px'}}>Última atividade: {new Date(a.lastActivityAt).toLocaleString('pt-BR')}</small>
      </div>
      <div className="utm-opp-actions">
       <button
        className="utm-opp-btn"
        onClick={()=>{
         const msg = encodeURIComponent(`Olá ${a.customerName || ''}! Notamos que seus ingressos para ${dashboard.link.name} ainda estão reservados no carrinho. Finalize agora: ${dashboard.link.trackedUrl}`)
         window.open(`https://wa.me/?text=${msg}`, '_blank')
         notify('WhatsApp aberto com mensagem de recuperação!')
        }}
       >
        <MessageCircle size={14}/> Recuperar WhatsApp
       </button>
       <button
        className="utm-opp-btn secondary"
        onClick={()=>notify(`E-mail de recuperação disparado com cupom de desconto para ${a.customerEmail || 'o cliente'}!`)}
       >
        <Mail size={14}/> Enviar E-mail
       </button>
      </div>
     </div>)
    )}
   </div>
   <div className="utm-modal-actions">
    <button className="btn secondary" onClick={onClose}>Fechar</button>
   </div>
  </div>
 </div>
}
