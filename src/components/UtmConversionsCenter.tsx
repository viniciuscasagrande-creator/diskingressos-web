import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { BarChart3, ChevronDown, Copy, Download, ExternalLink, Link2, Plus, QrCode, Search, ShoppingCart, TrendingUp, X, Radar, RefreshCw, UserRoundCheck } from 'lucide-react'
import type { EventItem } from '../data/events'
import { createTrackingLink, getTrackingLinks, getUtmDashboard, sweepUtmAbandonments, type TrackingLink, type UtmDashboard } from '../services/api'

type Props={event:EventItem;notify:(message:string)=>void}
const money=(cents:number)=>`R$ ${(cents/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}`
const actionLabels:Record<string,string>={added:'Adicionou',checkout:'Checkout',removed:'Removeu',abandoned:'Abandonou',finalized:'Finalizou'}

export default function UtmConversionsCenter({event,notify}:Props){
 const [links,setLinks]=useState<TrackingLink[]>([]);
 const [selectedId,setSelectedId]=useState<number|''>('');
 const [dashboard,setDashboard]=useState<UtmDashboard|null>(null);
 const [loading,setLoading]=useState(false);
 const [openNew,setOpenNew]=useState(false);
 const [filter,setFilter]=useState('all');
 const [search,setSearch]=useState('');
 const [form,setForm]=useState({name:'',source:'instagram',medium:'cpc',campaign:`evento-${event.code}`,term:'',content:'',destination:`https://www.diskingressos.com.br/evento/${event.code}`});

 const loadLinks=async()=>{
   try{
     const rows = await getTrackingLinks(undefined,event.id);
     setLinks(rows);
     if (rows && rows.length > 0 && !selectedId) {
       setSelectedId(rows[0].id);
     }
   }catch(e:any){
     notify(e.message||'Não foi possível carregar links UTM.');
   }
 }

 useEffect(()=>{loadLinks()},[event.id]);

 useEffect(()=>{
   if(!selectedId) return;
   setLoading(true);
   getUtmDashboard(event.id,Number(selectedId))
     .then(setDashboard)
     .catch((e:any)=>notify(e.message||'Falha ao carregar métricas UTM.'))
     .finally(()=>setLoading(false));
 },[selectedId,event.id]);

 const filtered=useMemo(()=>dashboard?.actions.filter(a=>(filter==='all'||a.action===filter)&&`${a.orderCode||''} ${a.customerName||''} ${a.customerEmail||''} ${a.ticketSummary||''}`.toLowerCase().includes(search.toLowerCase()))||[],[dashboard,filter,search]);
 const createLink=async(e:FormEvent)=>{e.preventDefault();try{const row=await createTrackingLink({...form,eventId:event.id});await loadLinks();setSelectedId(row.id);setOpenNew(false);notify('Link UTM criado e selecionado.')}catch(err:any){notify(err.message||'Não foi possível criar o link.')}}
 const copy=async(text:string)=>{try{await navigator.clipboard.writeText(text);notify('Link copiado.')}catch{notify('Copie o link manualmente.')}}

 return <div className="utm-center">
  <section className="utm-toolbar">
   <div><span className="eyebrow">MARKETING / UTM</span><h2>Central UTM & Conversões</h2><p>Métricas, funil, gráficos e pedidos da campanha selecionada.</p></div>
   <div className="utm-actions"><button className="btn primary" onClick={()=>setOpenNew(true)}><Plus size={16}/> Nova UTM</button><button className="btn secondary" onClick={()=>notify('Exportação preparada em modo demonstração.')}><Download size={16}/> Exportar</button></div>
  </section>
  <section className="utm-event-strip"><div><strong>ID.{event.code} - {event.title}</strong><span>{event.venue}</span></div><div><span>Data do evento</span><strong>{event.date}</strong></div><div><span>Status</span><strong className="utm-status">{event.status}</strong></div></section>
  <section className="utm-selector-panel">
   <div className="utm-select-wrap"><label>Campanha / URL UTM</label><div className="utm-select-control"><Link2 size={17}/><select value={selectedId} onChange={e=>setSelectedId(e.target.value?Number(e.target.value):'')}><option value="">Selecione uma URL para visualizar os dados</option>{links.map(l=><option key={l.id} value={l.id}>{l.name} · {l.source||'sem origem'} / {l.medium||'sem meio'}</option>)}</select><ChevronDown size={16}/></div></div>
   <div className="utm-link-count"><strong>{links.length}</strong><span>links deste evento</span></div>
  </section>
  {loading?<div className="utm-empty"><strong>Carregando dados da URL...</strong></div>:dashboard?<DashboardContent data={dashboard} eventId={event.id} linkId={Number(selectedId)} refresh={()=>getUtmDashboard(event.id,Number(selectedId)).then(setDashboard)} filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} filtered={filtered} copy={copy} notify={notify}/>:null}
  {openNew&&<NewLinkDrawer form={form} setForm={setForm} onClose={()=>setOpenNew(false)} onSubmit={createLink}/>} 
 </div>
}

function DashboardContent({data,eventId,linkId,refresh,filter,setFilter,search,setSearch,filtered,copy,notify}:{data:UtmDashboard;eventId:number;linkId:number;refresh:()=>Promise<void>|void;filter:string;setFilter:(v:string)=>void;search:string;setSearch:(v:string)=>void;filtered:UtmDashboard['actions'];copy:(t:string)=>void;notify:(m:string)=>void}){
 const s=data.summary;const [sweeping,setSweeping]=useState(false);const runSweep=async()=>{setSweeping(true);try{const r=await sweepUtmAbandonments(eventId,linkId,30);notify(`${r.processed} sessão(ões) processada(s); ${r.recoveries} oportunidade(s) criada(s).`);await refresh()}catch(e:any){notify(e.message||'Falha ao detectar abandonos.')}finally{setSweeping(false)}};const funnel=[['Visitas',s.visits,'visits'],['Adicionou',s.added,'added'],['Checkout',s.checkout,'checkout'],['Abandonou',s.abandoned,'abandoned'],['Compra',s.finalized,'finalized']] as const
 const maxTimeline=Math.max(1,...data.timeline.map(d=>d.added+d.removed+d.abandoned+d.finalized))
 const maxHour=Math.max(1,...data.hours.map(d=>d.added+d.removed+d.abandoned+d.finalized))
 return <>
  <section className="utm-selected-card"><div className="utm-selected-main"><span className="utm-mini-label">URL SELECIONADA</span><h3>{data.link.name}</h3><div className="utm-full-url">{data.link.trackedUrl}</div><div className="utm-tags"><span>src: {data.link.source||'-'}</span><span>med: {data.link.medium||'-'}</span><span>cam: {data.link.campaign||'-'}</span>{data.link.content&&<span>content: {data.link.content}</span>}</div></div><div className="utm-selected-actions"><button onClick={()=>copy(data.link.trackedUrl)}><Copy size={16}/> Copiar</button><button onClick={()=>notify(`QR Code: ${data.link.qrPayload}`)}><QrCode size={16}/> QR Code</button><a href={data.link.trackedUrl} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Abrir</a></div></section>
  <section className="utm-kpis"><Metric label="Visitas" value={s.visits.toLocaleString('pt-BR')} note="Cliques atribuídos"/><Metric label="Sessões UTM" value={String(s.attributedSessions)} note={`${s.activeAttributions} em jornada`}/><Metric label="Adicionou" value={String(s.added)} note={rate(s.added,s.visits)}/><Metric label="Finalizou" value={String(s.finalized)} note={rate(s.finalized,s.visits)}/><Metric label="Receita" value={money(s.revenueCents)} note="Receita atribuída"/><Metric label="Conversão" value={`${s.conversionRate.toFixed(2).replace('.',',')}%`} note={`Ticket médio ${money(s.avgTicketCents)}`}/></section>
  <section className="utm-section"><div className="utm-section-head"><div><span className="eyebrow">FUNIL</span><h3>Funil de conversão da URL</h3></div></div><div className="utm-funnel">{funnel.map(([label,value,key],i)=><div className={`utm-funnel-step ${key}`} key={key}><div className="utm-funnel-box"><strong>{value.toLocaleString('pt-BR')}</strong><span>{label}</span><small>{i===0?'Topo do funil':rate(value,funnel[i-1][1])}</small></div>{i<funnel.length-1&&<div className="utm-funnel-arrow">→</div>}</div>)}</div></section>
  <section className="utm-chart-grid"><div className="utm-section"><div className="utm-section-head"><div><span className="eyebrow">DESEMPENHO</span><h3>Volume de ações por data</h3></div></div>{data.timeline.length?<div className="utm-bars">{data.timeline.map(d=>{const total=d.added+d.removed+d.abandoned+d.finalized;return <div key={d.date} className="utm-bar-col"><div className="utm-bar" style={{height:`${Math.max(8,(total/maxTimeline)*150)}px`}} title={`${total} ações`}><span>{total}</span></div><small>{formatDate(d.date)}</small></div>})}</div>:<NoData/>}</div><div className="utm-section"><div className="utm-section-head"><div><span className="eyebrow">HORÁRIOS</span><h3>Distribuição por hora</h3></div></div><div className="utm-hour-bars">{data.hours.map(h=>{const total=h.added+h.removed+h.abandoned+h.finalized;return <div className="utm-hour-col" key={h.hour} title={`${h.hour}h · ${total} ações`}><div style={{height:`${Math.max(total?4:1,(total/maxHour)*120)}px`}}/><small>{h.hour%3===0?`${String(h.hour).padStart(2,'0')}h`:''}</small></div>})}</div></div></section>
  <section className="utm-section"><div className="utm-section-head"><div><span className="eyebrow">ATRIBUIÇÃO REAL</span><h3>Sessões originadas por esta URL</h3></div><button className="btn secondary" onClick={runSweep} disabled={sweeping}><RefreshCw size={15}/>{sweeping?' Processando...':' Detectar abandonos'}</button></div><div className="utm-attribution-summary"><div><Radar size={18}/><span><b>{s.activeAttributions}</b> em jornada</span></div><div><ShoppingCart size={18}/><span><b>{s.abandonedAttributions}</b> abandonadas</span></div><div><UserRoundCheck size={18}/><span><b>{s.convertedAttributions}</b> convertidas</span></div></div><div className="utm-attribution-list">{data.attributions.slice(0,8).map(a=><div key={a.id} className="utm-attribution-row"><span className={`utm-attribution-status ${a.status}`}>{a.status==='converted'?'Convertida':a.status==='abandoned'?'Abandonada':'Em jornada'}</span><div><strong>{a.customerName||a.customerEmail||'Visitante identificado pela sessão'}</strong><small>{a.customerEmail||`Sessão ${a.sessionKey.slice(0,12)}…`}</small></div><div><small>Valor do carrinho</small><strong>{money(a.cartValueCents)}</strong></div><div><small>Última atividade</small><strong>{new Date(a.lastActivityAt).toLocaleString('pt-BR')}</strong></div>{a.order?<div><small>Pedido atribuído</small><strong>{a.order.code}</strong></div>:<div><small>Pedido</small><strong>—</strong></div>}</div>)}</div></section>
  <section className="utm-section"><div className="utm-section-head utm-table-head"><div><span className="eyebrow">JORNADA</span><h3>Pedidos & Conversões</h3></div><label className="utm-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar pedido, cliente ou ingresso..."/></label></div><div className="utm-filter-tabs"><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>Todos ({data.actions.length})</button><button className={filter==='added'?'active added':''} onClick={()=>setFilter('added')}>Adicionou ({s.added})</button><button className={filter==='removed'?'active removed':''} onClick={()=>setFilter('removed')}>Removeu ({s.removed})</button><button className={filter==='abandoned'?'active abandoned':''} onClick={()=>setFilter('abandoned')}>Abandonou ({s.abandoned})</button><button className={filter==='finalized'?'active finalized':''} onClick={()=>setFilter('finalized')}>Finalizou ({s.finalized})</button></div><div className="utm-table-wrap"><table className="utm-table"><thead><tr><th>Pedido</th><th>Etapa / Status</th><th>Cliente</th><th>Parâmetros UTM</th><th>Ingressos / Modalidades</th><th>Valor</th><th>Data / Hora</th></tr></thead><tbody>{filtered.map(a=><tr key={a.id}><td><strong>{a.orderCode||'—'}</strong></td><td><span className={`utm-action-badge ${a.action}`}>{actionLabels[a.action]}</span></td><td><strong>{a.customerName||'Não identificado'}</strong><small>{a.customerEmail||''}</small></td><td><div className="utm-inline-tags"><span>src: {data.link.source}</span><span>med: {data.link.medium}</span><span>cam: {data.link.campaign}</span></div></td><td>{a.ticketSummary||'Sem modalidade'}</td><td><strong>{a.amountCents?money(a.amountCents):'R$ 0,00'}</strong></td><td>{new Date(a.createdAt).toLocaleString('pt-BR')}</td></tr>)}</tbody></table>{filtered.length===0&&<NoData/>}</div></section>
  <section className="utm-section"><div className="utm-section-head"><div><span className="eyebrow">REMARKETING</span><h3>Recuperação conectada à jornada</h3></div></div><div className="utm-remarketing-note"><ShoppingCart size={24}/><div><strong>Abandonos podem alimentar automaticamente o Remarketing.</strong><p>Quando uma jornada recebe o status “Abandonou”, ela pode originar WhatsApp, e-mail ou fluxo automático mantendo a mesma atribuição UTM.</p></div><button className="btn secondary" onClick={()=>notify('Fluxo de Remarketing aberto em modo demonstração.')}>Abrir Remarketing</button></div></section>
 </>
}

function Metric({label,value,note}:{label:string;value:string;note:string}){return <article className="utm-kpi"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>}
function rate(a:number,b:number){return b?`${((a/b)*100).toFixed(1).replace('.',',')}% da etapa anterior`:'0,0%'}
function formatDate(v:string){const [y,m,d]=v.split('-');return `${d}/${m}`}
function NoData(){return <div className="utm-no-data">Nenhum dado encontrado para esta seleção.</div>}

function NewLinkDrawer({form,setForm,onClose,onSubmit}:{form:any;setForm:(v:any)=>void;onClose:()=>void;onSubmit:(e:FormEvent)=>void}){
 const full=useMemo(()=>{try{const u=new URL(form.destination);if(form.source)u.searchParams.set('utm_source',form.source);if(form.medium)u.searchParams.set('utm_medium',form.medium);if(form.campaign)u.searchParams.set('utm_campaign',form.campaign);if(form.term)u.searchParams.set('utm_term',form.term);if(form.content)u.searchParams.set('utm_content',form.content);return u.toString()}catch{return form.destination}},[form])
 const set=(k:string,v:string)=>setForm({...form,[k]:v})
 return <div className="utm-drawer-backdrop"><aside className="utm-drawer"><div className="utm-drawer-head"><div><span className="eyebrow">NOVA CAMPANHA</span><h3>Gerar URL rastreável</h3></div><button onClick={onClose}><X size={20}/></button></div><form onSubmit={onSubmit}><label>Descrição do link *<input required value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Ex.: Link para bio do Instagram"/></label><label>Origem da campanha (utm_source) *<input required value={form.source} onChange={e=>set('source',e.target.value)} placeholder="google, facebook, instagram"/></label><label>Meio da campanha (utm_medium) *<input required value={form.medium} onChange={e=>set('medium',e.target.value)} placeholder="cpc, bio, story, email"/></label><label>Nome da campanha (utm_campaign) *<input required value={form.campaign} onChange={e=>set('campaign',e.target.value)} placeholder="lancamento, ultimo_lote"/></label><div className="utm-form-two"><label>Termo (utm_term)<input value={form.term} onChange={e=>set('term',e.target.value)} placeholder="ingressos"/></label><label>Conteúdo (utm_content)<input value={form.content} onChange={e=>set('content',e.target.value)} placeholder="banner, story_01"/></label></div><label>URL de destino<input required type="url" value={form.destination} onChange={e=>set('destination',e.target.value)}/></label><div className="utm-preview"><span>Visualização do link completo</span><code>{full}</code></div><div className="utm-drawer-actions"><button type="button" className="btn secondary" onClick={onClose}>Cancelar</button><button className="btn primary" type="submit"><Link2 size={16}/> Gerar e salvar link</button></div></form></aside></div>
}
