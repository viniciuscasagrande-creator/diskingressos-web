import { useEffect, useMemo, useRef, useState, type FormEvent, type RefObject, type ReactNode } from 'react'
import {
  BarChart3, ChevronDown, Copy, Download, ExternalLink, Filter, Link2, Plus,
  QrCode, Search, ShoppingCart, TrendingUp, X, Radar, RefreshCw, UserRoundCheck,
  MousePointerClick, CircleDollarSign, CheckCircle2, AlertTriangle, Sparkles
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  createTrackingLink, getTrackingLinks, getUtmDashboard, sweepUtmAbandonments,
  type TrackingLink, type UtmDashboard, type UtmSummary
} from '../services/api'

type Props={event:EventItem;notify:(message:string)=>void}
type LinkOverview={link:TrackingLink;summary?:UtmSummary}
const money=(cents:number)=>`R$ ${(cents/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}`
const actionLabels:Record<string,string>={added:'Adicionou',checkout:'Checkout',removed:'Removeu',abandoned:'Abandonou',finalized:'Finalizou'}
const sourceLabel=(source:string|null)=>source?source.charAt(0).toUpperCase()+source.slice(1):'Sem origem'

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
 const [form,setForm]=useState({name:'',source:'instagram',medium:'cpc',campaign:`evento-${event.code}`,term:'',content:'',destination:`https://www.diskingressos.com.br/evento/${event.code}`})
 const refs={links:useRef<HTMLElement>(null),funnel:useRef<HTMLElement>(null),orders:useRef<HTMLElement>(null),remarketing:useRef<HTMLElement>(null)}

  const loadLinks=async()=>{try{const rows=await getTrackingLinks(undefined,event.id);setLinks(rows);if(rows.length>0)setSelectedId(rows[0].id);return rows}catch(e:any){notify(e.message||'Não foi possível carregar links UTM.');return [] as TrackingLink[]}}
  useEffect(()=>{setOverview({});loadLinks()},[event.id])
  useEffect(()=>{if(!links.length){setOverview({});return}let alive=true;setOverviewLoading(true);Promise.all(links.map(async l=>{try{return [l.id,(await getUtmDashboard(event.id,l.id)).summary] as const}catch{return [l.id,undefined] as const}})).then(rows=>{if(alive)setOverview(Object.fromEntries(rows.filter(([,s])=>!!s)) as Record<number,UtmSummary>)}).finally(()=>alive&&setOverviewLoading(false));return()=>{alive=false}},[links,event.id])
  useEffect(()=>{if(!selectedId){setDashboard(null);return}setLoading(true);getUtmDashboard(event.id,Number(selectedId)).then(setDashboard).catch((e:any)=>notify(e.message||'Falha ao carregar métricas UTM.')).finally(()=>setLoading(false))},[selectedId,event.id])

 const filteredActions=useMemo(()=>dashboard?.actions.filter(a=>(filter==='all'||a.action===filter)&&`${a.orderCode||''} ${a.customerName||''} ${a.customerEmail||''} ${a.ticketSummary||''}`.toLowerCase().includes(search.toLowerCase()))||[],[dashboard,filter,search])
 const sources=useMemo(()=>Array.from(new Set(links.map(l=>l.source).filter(Boolean) as string[])).sort(),[links])
 const visibleLinks=useMemo(()=>links.filter(l=>(sourceFilter==='all'||l.source===sourceFilter)&&`${l.name} ${l.source||''} ${l.medium||''} ${l.campaign||''} ${l.code}`.toLowerCase().includes(linkSearch.toLowerCase())),[links,sourceFilter,linkSearch])
 const totals=useMemo(()=>links.reduce((acc,l)=>{const s=overview[l.id];acc.clicks+=s?.visits??l.clicks;acc.conversions+=s?.finalized??l.conversions;acc.revenue+=s?.revenueCents??0;return acc},{clicks:0,conversions:0,revenue:0}),[links,overview])

 const createLink=async(e:FormEvent)=>{e.preventDefault();try{const row=await createTrackingLink({...form,eventId:event.id});const rows=await loadLinks();setSelectedId(row.id);setOpenNew(false);setForm(f=>({...f,name:'',term:'',content:''}));notify('Link UTM criado, salvo e selecionado.');if(!rows.some(x=>x.id===row.id))setLinks(v=>[...v,row])}catch(err:any){notify(err.message||'Não foi possível criar o link.')}}
 const copy=async(text:string)=>{try{await navigator.clipboard.writeText(text);notify('Link copiado.')}catch{notify('Copie o link manualmente.')}}
 const scrollTo=(key:keyof typeof refs)=>refs[key].current?.scrollIntoView({behavior:'smooth',block:'start'})

 return <div className="utm-center utm-phase168">
  <section className="utm-toolbar">
   <div><span className="eyebrow">MARKETING / UTM / EVENTO</span><h2>Central UTM & Conversões</h2><p>Uma única tela para criar links, selecionar a URL da campanha e acompanhar toda a jornada até a receita e o remarketing.</p></div>
   <div className="utm-actions"><button className="btn primary" onClick={()=>setOpenNew(true)}><Plus size={16}/> Nova UTM</button><button className="btn secondary" onClick={()=>notify('Exportação preparada em modo demonstração.')}><Download size={16}/> Exportar</button></div>
  </section>

  <section className="utm-event-strip"><div><strong>ID.{event.code} - {event.title}</strong><span>{event.venue}</span></div><div><span>Data do evento</span><strong>{event.date}</strong></div><div><span>Status</span><strong className="utm-status">{event.status}</strong></div></section>

  <nav className="utm-onepage-nav" aria-label="Navegação da Central UTM">
   <button onClick={()=>scrollTo('links')}><Link2 size={15}/> URLs rastreáveis</button>
   <button onClick={()=>scrollTo('funnel')}><BarChart3 size={15}/> Funil & gráficos</button>
   <button onClick={()=>scrollTo('orders')}><ShoppingCart size={15}/> Pedidos & conversões</button>
   <button onClick={()=>scrollTo('remarketing')}><RefreshCw size={15}/> Remarketing</button>
  </nav>

  <section className="utm-campaign-overview">
   <div><span>URLs rastreáveis</span><strong>{links.length}</strong></div>
   <div><span>Visitas atribuídas</span><strong>{totals.clicks.toLocaleString('pt-BR')}</strong></div>
   <div><span>Vendas atribuídas</span><strong>{totals.conversions.toLocaleString('pt-BR')}</strong></div>
   <div><span>Receita atribuída</span><strong>{money(totals.revenue)}</strong></div>
  </section>

  <section className="utm-section utm-link-library" ref={refs.links}>
   <div className="utm-section-head utm-library-head"><div><span className="eyebrow">URLS DA CAMPANHA</span><h3>Todas as URLs rastreáveis do evento</h3><p>Selecione uma URL. Ela será o filtro de KPIs, funil, gráficos, pedidos e receita abaixo.</p></div><button className="btn primary" onClick={()=>setOpenNew(true)}><Plus size={15}/> Gerar link</button></div>
   <div className="utm-library-filters">
    <div className="utm-search"><Search size={14}/><input value={linkSearch} onChange={e=>setLinkSearch(e.target.value)} placeholder="Pesquisar URL, campanha, origem..."/></div>
    <div className="utm-source-filter"><Filter size={14}/><select value={sourceFilter} onChange={e=>setSourceFilter(e.target.value)}><option value="all">Todos os canais</option>{sources.map(s=><option key={s} value={s}>{sourceLabel(s)}</option>)}</select><ChevronDown size={14}/></div>
    <div className="utm-overview-state">{overviewLoading?<><RefreshCw size={14} className="spin"/> Atualizando métricas...</>:<><CheckCircle2 size={14}/> Métricas sincronizadas</>}</div>
   </div>
   {!visibleLinks.length?<div className="utm-no-links"><Link2 size={26}/><strong>Nenhuma URL encontrada</strong><span>Altere os filtros ou gere uma nova UTM para este evento.</span></div>:<div className="utm-link-card-grid">{visibleLinks.map(link=><LinkCard key={link.id} item={{link,summary:overview[link.id]}} selected={selectedId===link.id} onSelect={()=>setSelectedId(link.id)} copy={copy}/>)}</div>}
  </section>

  <section className="utm-selector-panel utm-sticky-selector">
   <div className="utm-select-wrap"><label>URL que alimenta a análise</label><div className="utm-select-control"><Link2 size={17}/><select value={selectedId} onChange={e=>setSelectedId(e.target.value?Number(e.target.value):'')}><option value="">Selecione uma URL para visualizar os dados</option>{links.map(l=><option key={l.id} value={l.id}>{l.name} · {l.source||'sem origem'} / {l.medium||'sem meio'} / {l.campaign||'sem campanha'}</option>)}</select><ChevronDown size={16}/></div></div>
   <div className="utm-link-count"><strong>{selectedId?'1':'0'}</strong><span>URL em análise</span></div>
  </section>

  {!selectedId?<EmptyStart links={links} onSelect={id=>setSelectedId(id)} onCreate={()=>setOpenNew(true)}/>:loading?<div className="utm-empty"><strong>Carregando a jornada desta URL...</strong></div>:dashboard?<DashboardContent data={dashboard} eventId={event.id} linkId={Number(selectedId)} refresh={()=>getUtmDashboard(event.id,Number(selectedId)).then(setDashboard)} filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} filtered={filteredActions} copy={copy} notify={notify} refs={refs}/>:null}
  {openNew&&<NewLinkDrawer form={form} setForm={setForm} onClose={()=>setOpenNew(false)} onSubmit={createLink}/>} 
 </div>
}

function LinkCard({item,selected,onSelect,copy}:{item:LinkOverview;selected:boolean;onSelect:()=>void;copy:(v:string)=>void}){
 const {link,summary:s}=item
 return <article className={`utm-link-card ${selected?'selected':''}`}>
  <div className="utm-link-card-top"><span className="utm-channel-badge">{sourceLabel(link.source)}</span><span className="utm-live-dot">● ativo</span></div>
  <h4>{link.name}</h4><p className="utm-link-code">{link.trackedUrl}</p>
  <div className="utm-link-meta"><span>src: <b>{link.source||'-'}</b></span><span>med: <b>{link.medium||'-'}</b></span><span>cam: <b>{link.campaign||'-'}</b></span></div>
  <div className="utm-link-card-metrics"><div><MousePointerClick size={14}/><span><b>{(s?.visits??link.clicks).toLocaleString('pt-BR')}</b> visitas</span></div><div><CheckCircle2 size={14}/><span><b>{(s?.finalized??link.conversions).toLocaleString('pt-BR')}</b> vendas</span></div><div><CircleDollarSign size={14}/><span><b>{money(s?.revenueCents??0)}</b></span></div></div>
  <div className="utm-link-card-actions"><button className={selected?'selected':''} onClick={onSelect}>{selected?<><CheckCircle2 size={14}/> Selecionado</>:<><TrendingUp size={14}/> Selecionar</>}</button><button className="icon-only" title="Copiar URL" onClick={()=>copy(link.trackedUrl)}><Copy size={14}/></button></div>
 </article>
}

function EmptyStart({links,onSelect,onCreate}:{links:TrackingLink[];onSelect:(id:number)=>void;onCreate:()=>void}){return <section className="utm-empty-state"><div className="utm-empty-icon"><BarChart3 size={30}/></div><h3>A análise começa vazia</h3><p>Escolha uma das URLs rastreáveis acima. Somente depois da seleção esta página carrega KPIs, funil, gráficos, pedidos e atribuição daquela campanha.</p><div className="utm-empty-buttons"><button className="btn primary" onClick={onCreate}><Plus size={16}/> Criar URL UTM</button></div>{links.length>0&&<div className="utm-quick-links"><strong>Seleção rápida</strong>{links.slice(0,4).map(l=><button key={l.id} onClick={()=>onSelect(l.id)}><span><b>{l.name}</b><small>{l.source} / {l.medium} / {l.campaign}</small></span><TrendingUp size={16}/></button>)}</div>}</section>}

function DashboardContent({data,eventId,linkId,refresh,filter,setFilter,search,setSearch,filtered,copy,notify,refs}:{data:UtmDashboard;eventId:number;linkId:number;refresh:()=>Promise<void>|void;filter:string;setFilter:(v:string)=>void;search:string;setSearch:(v:string)=>void;filtered:UtmDashboard['actions'];copy:(t:string)=>void;notify:(m:string)=>void;refs:Record<'links'|'funnel'|'orders'|'remarketing',RefObject<HTMLElement|null>>}){
 const s=data.summary
 const [sweeping,setSweeping]=useState(false)
 const runSweep=async()=>{setSweeping(true);try{const r=await sweepUtmAbandonments(eventId,linkId,30);notify(`${r.processed} sessão(ões) processada(s); ${r.recoveries} oportunidade(s) criada(s).`);await refresh()}catch(e:any){notify(e.message||'Falha ao detectar abandonos.')}finally{setSweeping(false)}}
 const funnel=[
   ['Visitas',s.visits,'visits',<MousePointerClick size={16}/>],
   ['Adicionou',s.added,'added',<ShoppingCart size={16}/>],
   ['Checkout',s.checkout,'checkout',<Sparkles size={16}/>],
   ['Abandonou',s.abandoned,'abandoned',<AlertTriangle size={16}/>],
   ['Compra',s.finalized,'finalized',<CheckCircle2 size={16}/>]
 ] as const
 const maxFunnel=Math.max(1,s.visits)
 const maxTimeline=Math.max(1,...data.timeline.map(d=>d.added+d.removed+d.abandoned+d.finalized))
 const maxHour=Math.max(1,...data.hours.map(d=>d.added+d.removed+d.abandoned+d.finalized))
 const peakHour=data.hours.reduce((max,h)=>{const tot=h.added+h.checkout+h.finalized;return tot>(max.tot||0)?{hour:h.hour,tot}:max},{hour:19,tot:0})

 return <>
  <section className="utm-selected-card">
    <div className="utm-selected-main">
      <span className="utm-mini-label">URL SELECIONADA — TODA A TELA ABAIXO USA ESTE LINK</span>
      <h3>{data.link.name}</h3>
      <div className="utm-full-url">{data.link.trackedUrl}</div>
      <div className="utm-tags">
        <span>src: {data.link.source||'-'}</span>
        <span>med: {data.link.medium||'-'}</span>
        <span>cam: {data.link.campaign||'-'}</span>
        {data.link.content&&<span>content: {data.link.content}</span>}
      </div>
    </div>
    <div className="utm-selected-actions">
      <button onClick={()=>copy(data.link.trackedUrl)}><Copy size={15}/> Copiar</button>
      <button onClick={()=>notify(`QR Code preparado para: ${data.link.qrPayload}`)}><QrCode size={15}/> QR Code</button>
      <a href={data.link.trackedUrl} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Abrir</a>
    </div>
  </section>

  <section className="utm-kpis utm-kpis-168">
    <Metric icon={<MousePointerClick size={17}/>} label="Visitas" value={s.visits.toLocaleString('pt-BR')} note="Cliques atribuídos"/>
    <Metric icon={<Radar size={17}/>} label="Sessões UTM" value={String(s.attributedSessions)} note={`${s.activeAttributions} em jornada`}/>
    <Metric icon={<ShoppingCart size={17}/>} label="Adicionou" value={String(s.added)} note={rate(s.added,s.visits)}/>
    <Metric icon={<Sparkles size={17}/>} label="Checkout" value={String(s.checkout)} note={rate(s.checkout,s.added)}/>
    <Metric icon={<CheckCircle2 size={17}/>} label="Finalizou" value={String(s.finalized)} note={rate(s.finalized,s.visits)}/>
    <Metric icon={<CircleDollarSign size={17}/>} label="Receita" value={money(s.revenueCents)} note={`Ticket ${money(s.avgTicketCents)}`}/>
  </section>

  <section className="utm-section utm-funnel-section" ref={refs.funnel}>
    <div className="utm-section-head">
      <div>
        <span className="eyebrow">FUNIL & CONVERSÕES</span>
        <h3>Funil de Conversão da URL Selecionada</h3>
      </div>
      <div className="utm-conversion-pill">
        Taxa de conversão geral: <strong>{s.conversionRate.toFixed(2).replace('.',',')}%</strong>
      </div>
    </div>
    <div className="utm-funnel-grid">
      {funnel.map(([label,value,key,icon],i)=>{
        const pctOfTop=Math.min(100,Math.max(8,(Number(value)/maxFunnel)*100));
        const prevValue=i===0?Number(value):Number(funnel[i-1][1]);
        const stepRate=i===0?'100%':rate(Number(value),prevValue);
        return (
          <div className={`utm-funnel-card ${key}`} key={key}>
            <div className="utm-funnel-card-head">
              <span className="utm-funnel-icon">{icon}</span>
              <span className="utm-funnel-step-label">{label}</span>
            </div>
            <strong className="utm-funnel-value">{Number(value).toLocaleString('pt-BR')}</strong>
            <div className="utm-funnel-progress-wrap">
              <div className="utm-funnel-progress-bar" style={{width:`${pctOfTop}%`}}/>
            </div>
            <div className="utm-funnel-card-foot">
              <small>{i===0?'Origem do tráfego':`${stepRate} da etapa anterior`}</small>
            </div>
          </div>
        );
      })}
    </div>
  </section>

  <section className="utm-chart-grid">
    <div className="utm-section utm-chart-panel">
      <div className="utm-section-head">
        <div>
          <span className="eyebrow">DESEMPENHO POR PERÍODO</span>
          <h3>Volume de Ações por Data</h3>
        </div>
        <div className="utm-chart-legend">
          <span className="legend-dot green">Finalizou</span>
          <span className="legend-dot purple">Checkout</span>
          <span className="legend-dot blue">Adicionou</span>
          <span className="legend-dot red">Abandonou</span>
        </div>
      </div>
      {data.timeline.length ? (
        <div className="utm-bars-modern">
          {data.timeline.map(d=>{
            const total=d.added+d.removed+d.abandoned+d.finalized;
            const barHeight=Math.max(16,(total/maxTimeline)*140);
            return (
              <div key={d.date} className="utm-bar-col-modern" title={`${formatDate(d.date)}: ${total} ações (${d.finalized} vendas)`}>
                <div className="utm-bar-total-label">{total}</div>
                <div className="utm-bar-stack" style={{height:`${barHeight}px`}}>
                  {d.finalized>0&&<div className="bar-seg final" style={{flex:d.finalized}} title={`${d.finalized} vendas`}/>}
                  {d.checkout>0&&<div className="bar-seg check" style={{flex:d.checkout}} title={`${d.checkout} checkout`}/>}
                  {d.added>0&&<div className="bar-seg add" style={{flex:d.added}} title={`${d.added} adicionou`}/>}
                  {d.abandoned>0&&<div className="bar-seg aban" style={{flex:d.abandoned}} title={`${d.abandoned} abandonou`}/>}
                </div>
                <small className="utm-bar-date">{formatDate(d.date)}</small>
              </div>
            );
          })}
        </div>
      ) : <NoData/>}
    </div>

    <div className="utm-section utm-chart-panel">
      <div className="utm-section-head">
        <div>
          <span className="eyebrow">DISTRIBUIÇÃO DE HORÁRIOS</span>
          <h3>Pico de Ações ao Longo do Dia</h3>
        </div>
        <div className="utm-peak-badge">
          Pico: <b>{String(peakHour.hour).padStart(2,'0')}h:00</b>
        </div>
      </div>
      <div className="utm-hour-bars-modern">
        {data.hours.map(h=>{
          const total=h.added+h.removed+h.abandoned+h.finalized;
          const isPeak=h.hour===peakHour.hour;
          const barHeight=Math.max(total?6:2,(total/maxHour)*120);
          return (
            <div className={`utm-hour-col-modern ${isPeak?'peak':''}`} key={h.hour} title={`${String(h.hour).padStart(2,'0')}h:00 · ${total} ações`}>
              <div className="utm-hour-bar-inner" style={{height:`${barHeight}px`}}/>
              <small className="utm-hour-label">{h.hour%4===0?`${String(h.hour).padStart(2,'0')}h`:''}</small>
            </div>
          );
        })}
      </div>
    </div>
  </section>

  <section className="utm-section" ref={refs.orders}>
    <div className="utm-section-head utm-table-head">
      <div>
        <span className="eyebrow">PEDIDOS & CONVERSÕES</span>
        <h3>Jornada dos Pedidos Desta URL</h3>
      </div>
      <div className="utm-search">
        <Search size={14}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar pedido, cliente ou ingresso..."/>
      </div>
    </div>
    <div className="utm-filter-tabs">
      {['all','added','checkout','removed','abandoned','finalized'].map(k=>(
        <button key={k} className={`${filter===k?'active ':''}${k}`} onClick={()=>setFilter(k)}>
          {k==='all'?'Todos':actionLabels[k]} ({k==='all'?data.actions.length:data.actions.filter(a=>a.action===k).length})
        </button>
      ))}
    </div>
    <div className="utm-table-wrap">
      <table className="utm-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Etapa / Status</th>
            <th>Cliente</th>
            <th>Parâmetros UTM</th>
            <th>Ingressos / Modalidades</th>
            <th>Valor</th>
            <th>Data / Hora</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(a=>(
            <tr key={a.id}>
              <td><b>{a.orderCode||'—'}</b></td>
              <td><span className={`utm-action-badge ${a.action}`}>{actionLabels[a.action]}</span></td>
              <td><b>{a.customerName||'Visitante'}</b><small>{a.customerEmail||'Sem e-mail'}</small></td>
              <td>
                <div className="utm-inline-tags">
                  <span>src: {data.link.source||'-'}</span>
                  <span>med: {data.link.medium||'-'}</span>
                  <span>cam: {data.link.campaign||'-'}</span>
                </div>
              </td>
              <td>{a.ticketSummary||'Sem modalidade'}</td>
              <td><b>{money(a.amountCents)}</b></td>
              <td>{new Date(a.createdAt).toLocaleString('pt-BR')}</td>
            </tr>
          ))}
          {!filtered.length&&<tr><td colSpan={7}><NoData/></td></tr>}
        </tbody>
      </table>
    </div>
  </section>

  <section className="utm-section">
    <div className="utm-section-head">
      <div>
        <span className="eyebrow">ATRIBUIÇÃO REAL</span>
        <h3>Sessões Originadas por Esta URL</h3>
      </div>
      <button className="btn secondary" onClick={runSweep} disabled={sweeping}>
        <RefreshCw size={15} className={sweeping?'spin':''}/>
        {sweeping?' Processando...':' Detectar abandonos'}
      </button>
    </div>
    <div className="utm-attribution-summary">
      <div><Radar size={18}/><span><b>{s.activeAttributions}</b> em jornada</span></div>
      <div><ShoppingCart size={18}/><span><b>{s.abandonedAttributions}</b> abandonadas</span></div>
      <div><UserRoundCheck size={18}/><span><b>{s.convertedAttributions}</b> convertidas</span></div>
    </div>
    <div className="utm-attribution-list">
      {data.attributions.slice(0,8).map(a=>(
        <div key={a.id} className="utm-attribution-row">
          <span className={`utm-attribution-status ${a.status}`}>
            {a.status==='converted'?'Convertida':a.status==='abandoned'?'Abandonada':'Em jornada'}
          </span>
          <div>
            <strong>{a.customerName||a.customerEmail||'Visitante identificado pela sessão'}</strong>
            <small>{a.customerEmail||`Sessão ${a.sessionKey.slice(0,12)}…`}</small>
          </div>
          <div><small>Valor do carrinho</small><strong>{money(a.cartValueCents)}</strong></div>
          <div><small>Última atividade</small><strong>{new Date(a.lastActivityAt).toLocaleString('pt-BR')}</strong></div>
          <div><small>Pedido</small><strong>{a.order?.code||'—'}</strong></div>
        </div>
      ))}
      {!data.attributions.length&&<NoData/>}
    </div>
  </section>

  <section className="utm-section" ref={refs.remarketing}>
    <div className="utm-section-head">
      <div>
        <span className="eyebrow">REMARKETING INTEGRADO</span>
        <h3>Abandono Conectado à Recuperação</h3>
      </div>
    </div>
    <div className="utm-remarketing-note">
      <AlertTriangle size={24}/>
      <div>
        <strong>{s.abandonedAttributions} sessão(ões) abandonada(s) nesta URL podem alimentar o Remarketing</strong>
        <p>A origem UTM permanece vinculada ao cliente. Se a venda for recuperada por WhatsApp ou e-mail, a receita retorna para esta campanha original.</p>
      </div>
      <button className="btn secondary" onClick={()=>notify('Abra Remarketing do evento para operar as oportunidades desta UTM.')}>
        <RefreshCw size={15}/> Abrir recuperação
      </button>
    </div>
  </section>
 </>
}

function Metric({label,value,note,icon}:{label:string;value:string;note:string;icon?:ReactNode}){return <div className="utm-kpi"><div className="utm-kpi-label">{icon}<span>{label}</span></div><strong>{value}</strong><small>{note}</small></div>}
function NoData(){return <div className="utm-no-data">Ainda não existem dados para este filtro.</div>}
const rate=(value:number,total:number)=>total?`${((value/total)*100).toFixed(1).replace('.',',')}%`:'0,0%'
const formatDate=(date:string)=>{const [y,m,d]=date.split('-');return `${d}/${m}`}

function NewLinkDrawer({form,setForm,onClose,onSubmit}:{form:any;setForm:(v:any)=>void;onClose:()=>void;onSubmit:(e:FormEvent)=>void}){
 const query=new URLSearchParams({utm_source:form.source,utm_medium:form.medium,utm_campaign:form.campaign,...(form.term?{utm_term:form.term}:{}),...(form.content?{utm_content:form.content}:{})}).toString();const preview=`${form.destination}${form.destination.includes('?')?'&':'?'}${query}`
 return <div className="utm-drawer-backdrop"><aside className="utm-drawer"><div className="utm-drawer-head"><div><span className="eyebrow">NOVA URL RASTREÁVEL</span><h3>Gerar e salvar UTM</h3><p>A URL será vinculada automaticamente ao evento atual.</p></div><button onClick={onClose}><X size={18}/></button></div><form onSubmit={onSubmit}><label>Descrição do link *<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ex.: Instagram — Story lançamento"/></label><div className="utm-form-two"><label>Origem (utm_source) *<input required value={form.source} onChange={e=>setForm({...form,source:e.target.value})} placeholder="instagram"/></label><label>Meio (utm_medium) *<input required value={form.medium} onChange={e=>setForm({...form,medium:e.target.value})} placeholder="cpc, social, email"/></label></div><label>Campanha (utm_campaign) *<input required value={form.campaign} onChange={e=>setForm({...form,campaign:e.target.value})} placeholder="lancamento_2026"/></label><div className="utm-form-two"><label>Termo (utm_term)<input value={form.term} onChange={e=>setForm({...form,term:e.target.value})} placeholder="ingressos"/></label><label>Conteúdo (utm_content)<input value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="story_01"/></label></div><label>URL de destino *<input required value={form.destination} onChange={e=>setForm({...form,destination:e.target.value})}/></label><div className="utm-preview"><span>Visualização da URL completa</span><code>{preview}</code></div><div className="utm-drawer-actions"><button type="button" className="btn secondary" onClick={onClose}>Cancelar</button><button className="btn primary" type="submit"><Sparkles size={15}/> Gerar, salvar e selecionar</button></div></form></aside></div>
}
