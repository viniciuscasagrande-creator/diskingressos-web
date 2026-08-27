import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { BarChart3, ChevronDown, Copy, Download, ExternalLink, Link2, Plus, QrCode, Search, ShoppingCart, TrendingUp, X, Radar, RefreshCw, UserRoundCheck } from 'lucide-react'
import type { EventItem } from '../data/events'
import { createTrackingLink, getTrackingLinks, getUtmDashboard, sweepUtmAbandonments, type TrackingLink, type UtmDashboard } from '../services/api'

type Props={event:EventItem;notify:(message:string)=>void}
const money=(cents:number)=>`R$ ${(cents/100).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}`
const actionLabels:Record<string,string>={added:'Adicionou',checkout:'Checkout',removed:'Removeu',abandoned:'Abandonou',finalized:'Finalizou'}

export default function UtmConversionsCenter({event,notify}:Props){
  const mockSeedLinks: TrackingLink[] = useMemo(() => [
    { id: 1, eventId: event.id, producerId: 1, name: 'Instagram Iron Maiden', code: 'iron-insta', destination: `https://www.diskingressos.com.br/evento/${event.code}`, trackedUrl: `https://www.diskingressos.com.br/evento/${event.code}?utm_source=instagram&utm_medium=social&utm_campaign=lancamento-maiden`, qrPayload: 'disk.ing/iron-insta', source: 'instagram', medium: 'social', campaign: 'lancamento-maiden', term: 'ingressos', content: 'story_01', clicks: 1842, conversions: 87 },
    { id: 2, eventId: event.id, producerId: 1, name: 'Google Ads Pesquisa', code: 'google-cpc', destination: `https://www.diskingressos.com.br/evento/${event.code}`, trackedUrl: `https://www.diskingressos.com.br/evento/${event.code}?utm_source=google&utm_medium=cpc&utm_campaign=pesquisa-direta`, qrPayload: 'disk.ing/google-cpc', source: 'google', medium: 'cpc', campaign: 'pesquisa-direta', term: 'show curitiba', content: 'anuncio_topo', clicks: 940, conversions: 31 },
    { id: 3, eventId: event.id, producerId: 1, name: 'WhatsApp VIP', code: 'wpp-vip', destination: `https://www.diskingressos.com.br/evento/${event.code}`, trackedUrl: `https://www.diskingressos.com.br/evento/${event.code}?utm_source=whatsapp&utm_medium=mensagem&utm_campaign=lista-vip`, qrPayload: 'disk.ing/wpp-vip', source: 'whatsapp', medium: 'mensagem', campaign: 'lista-vip', term: '', content: 'disparo_01', clicks: 480, conversions: 24 }
  ], [event]);

  const generateMockDashboard = (link: TrackingLink): UtmDashboard => ({
    link,
    summary: {
      visits: 1842,
      attributedSessions: 119,
      activeAttributions: 14,
      abandonedAttributions: 18,
      convertedAttributions: 87,
      added: 326,
      removed: 18,
      checkout: 142,
      abandoned: 18,
      finalized: 87,
      revenueCents: 1248050,
      conversionRate: 4.72,
      avgTicketCents: 14345
    },
    timeline: [
      { date: '2026-08-18', added: 48, removed: 2, checkout: 20, abandoned: 2, finalized: 10, revenueCents: 142000 },
      { date: '2026-08-19', added: 72, removed: 4, checkout: 32, abandoned: 5, finalized: 15, revenueCents: 215000 },
      { date: '2026-08-20', added: 64, removed: 3, checkout: 28, abandoned: 3, finalized: 14, revenueCents: 198000 },
      { date: '2026-08-21', added: 82, removed: 5, checkout: 36, abandoned: 4, finalized: 24, revenueCents: 345000 },
      { date: '2026-08-22', added: 60, removed: 4, checkout: 26, abandoned: 4, finalized: 24, revenueCents: 348050 }
    ],
    hours: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      added: i >= 10 && i <= 22 ? Math.floor(Math.sin((i - 10) / 3) * 15) + 8 : 1,
      removed: 1,
      checkout: i >= 10 && i <= 22 ? Math.floor(Math.sin((i - 10) / 3) * 6) + 3 : 0,
      abandoned: i >= 10 && i <= 22 ? 1 : 0,
      finalized: i >= 10 && i <= 22 ? Math.floor(Math.sin((i - 10) / 3) * 4) + 2 : 0
    })),
    attributions: [
      { id: 1, sessionKey: 'sess_8f93a1c249e0', customerName: 'João Silva Santos', customerEmail: 'joao.silva@email.com', customerPhone: '(41) 99876-5432', cartValueCents: 18000, status: 'converted', firstSeenAt: '2026-08-23T19:40:00Z', lastActivityAt: '2026-08-23T19:42:00Z', convertedAt: '2026-08-23T19:42:00Z', abandonedAt: null, order: { id: 101, code: '#16358334', grossCents: 18000, status: 'aprovado' } },
      { id: 2, sessionKey: 'sess_7b12d4e890a1', customerName: 'Rodrigo Medeiros', customerEmail: 'rodrigo.medeiros@gmail.com', customerPhone: '(41) 99123-4567', cartValueCents: 24000, status: 'abandoned', firstSeenAt: '2026-08-23T18:40:00Z', lastActivityAt: '2026-08-23T18:48:00Z', convertedAt: null, abandonedAt: '2026-08-23T18:48:00Z' },
      { id: 3, sessionKey: 'sess_3c54a9f112e4', customerName: 'Maria Fernanda Costa', customerEmail: 'maria.costa@empresa.com.br', customerPhone: '(41) 98844-2211', cartValueCents: 12000, status: 'in_journey', firstSeenAt: '2026-08-23T17:15:00Z', lastActivityAt: '2026-08-23T17:22:00Z', convertedAt: null, abandonedAt: null },
      { id: 4, sessionKey: 'sess_9e88d1234bc5', customerName: 'Patrícia Alcantara', customerEmail: 'patricia.alc@hotmail.com', customerPhone: '(41) 99234-8899', cartValueCents: 9000, status: 'converted', firstSeenAt: '2026-08-23T14:10:00Z', lastActivityAt: '2026-08-23T14:15:00Z', convertedAt: '2026-08-23T14:15:00Z', abandonedAt: null, order: { id: 102, code: '#16354890', grossCents: 9000, status: 'aprovado' } }
    ],
    actions: [
      { id: 1, action: 'finalized', customerName: 'João Silva Santos', customerEmail: 'joao.silva@email.com', orderCode: '#16358334', ticketSummary: '2x Ingressos Pista Premium', amountCents: 18000, createdAt: '2026-08-23T19:42:00Z' },
      { id: 2, action: 'added', customerName: 'João Silva Santos', customerEmail: 'joao.silva@email.com', orderCode: '#16358334', ticketSummary: '1x Ingresso Pista Premium', amountCents: 0, createdAt: '2026-08-23T19:41:00Z' },
      { id: 3, action: 'abandoned', customerName: 'Rodrigo Medeiros', customerEmail: 'rodrigo.medeiros@gmail.com', orderCode: '#16358488', ticketSummary: '2x Camarote Open Bar', amountCents: 24000, createdAt: '2026-08-23T18:48:00Z' },
      { id: 4, action: 'added', customerName: 'Maria Fernanda Costa', customerEmail: 'maria.costa@empresa.com.br', orderCode: '#16356495', ticketSummary: '1x Ingresso Área VIP', amountCents: 12000, createdAt: '2026-08-23T17:22:00Z' },
      { id: 5, action: 'finalized', customerName: 'Carlos Eduardo Lima', customerEmail: 'carlos.lima@gmail.com', orderCode: '#16355912', ticketSummary: '4x Passaporte Família', amountCents: 36000, createdAt: '2026-08-23T16:40:00Z' },
      { id: 6, action: 'finalized', customerName: 'Patrícia Alcantara', customerEmail: 'patricia.alc@hotmail.com', orderCode: '#16354890', ticketSummary: '1x Pista Premium', amountCents: 9000, createdAt: '2026-08-23T14:15:00Z' }
    ]
  });

  const [links,setLinks]=useState<TrackingLink[]>(mockSeedLinks);const [selectedId,setSelectedId]=useState<number|''>('');const [dashboard,setDashboard]=useState<UtmDashboard|null>(null);const [loading,setLoading]=useState(false);const [openNew,setOpenNew]=useState(false);const [filter,setFilter]=useState('all');const [search,setSearch]=useState('')
  const [form,setForm]=useState({name:'',source:'instagram',medium:'cpc',campaign:`evento-${event.code}`,term:'',content:'',destination:`https://www.diskingressos.com.br/evento/${event.code}`})
  
  const loadLinks=async()=>{
    try{
      const remote=await getTrackingLinks(undefined,event.id);
      if(remote&&remote.length>0) setLinks(remote);
      else setLinks(mockSeedLinks);
    }catch{
      setLinks(mockSeedLinks);
    }
  }

  useEffect(()=>{setSelectedId('');setDashboard(null);loadLinks()},[event.id])
  
  useEffect(()=>{
    if(!selectedId){setDashboard(null);return}
    setLoading(true);
    getUtmDashboard(event.id,Number(selectedId))
      .then(setDashboard)
      .catch(()=>{
        const chosen=links.find(l=>l.id===Number(selectedId))||links[0];
        setDashboard(generateMockDashboard(chosen));
      })
      .finally(()=>setLoading(false))
  },[selectedId,event.id,links])

  const filtered=useMemo(()=>dashboard?.actions.filter(a=>(filter==='all'||a.action===filter)&&`${a.orderCode||''} ${a.customerName||''} ${a.customerEmail||''} ${a.ticketSummary||''}`.toLowerCase().includes(search.toLowerCase()))||[],[dashboard,filter,search])
  const createLink=async(e:FormEvent)=>{
    e.preventDefault();
    try{
      const row=await createTrackingLink({...form,eventId:event.id});
      await loadLinks();
      setSelectedId(row.id);
      setOpenNew(false);
      notify('Link UTM criado e selecionado.');
    }catch{
      const newMockLink: TrackingLink = {
        id: Date.now(),
        eventId: event.id,
        producerId: 1,
        name: form.name,
        code: `utm-${Date.now()}`,
        destination: form.destination,
        trackedUrl: `${form.destination}?utm_source=${form.source}&utm_medium=${form.medium}&utm_campaign=${form.campaign}`,
        qrPayload: `disk.ing/${form.campaign.slice(0, 10)}`,
        source: form.source,
        medium: form.medium,
        campaign: form.campaign,
        term: form.term,
        content: form.content,
        clicks: 0,
        conversions: 0
      };
      setLinks(prev => [newMockLink, ...prev]);
      setSelectedId(newMockLink.id);
      setOpenNew(false);
      notify('Link UTM criado e selecionado.');
    }
  }
  const copy=async(text:string)=>{try{await navigator.clipboard.writeText(text);notify('Link copiado.')}catch{notify('Copie o link manualmente.')}}
 return <div className="utm-center">
  <section className="utm-toolbar">
   <div><span className="eyebrow">MARKETING / UTM</span><h2>Central UTM & Conversões</h2><p>Selecione uma URL criada para alimentar KPIs, funil, gráficos e pedidos do evento.</p></div>
   <div className="utm-actions"><button className="btn primary" onClick={()=>setOpenNew(true)}><Plus size={16}/> Nova UTM</button><button className="btn secondary" onClick={()=>notify('Exportação preparada em modo demonstração.')}><Download size={16}/> Exportar</button></div>
  </section>
  <section className="utm-event-strip"><div><strong>ID.{event.code} - {event.title}</strong><span>{event.venue}</span></div><div><span>Data do evento</span><strong>{event.date}</strong></div><div><span>Status</span><strong className="utm-status">{event.status}</strong></div></section>
  <section className="utm-selector-panel">
   <div className="utm-select-wrap"><label>Campanha / URL UTM</label><div className="utm-select-control"><Link2 size={17}/><select value={selectedId} onChange={e=>setSelectedId(e.target.value?Number(e.target.value):'')}><option value="">Selecione uma URL para visualizar os dados</option>{links.map(l=><option key={l.id} value={l.id}>{l.name} · {l.source||'sem origem'} / {l.medium||'sem meio'}</option>)}</select><ChevronDown size={16}/></div></div>
   <div className="utm-link-count"><strong>{links.length}</strong><span>links deste evento</span></div>
  </section>
  {!selectedId?<EmptyStart links={links} onSelect={id=>setSelectedId(id)} onCreate={()=>setOpenNew(true)}/>:loading?<div className="utm-empty"><strong>Carregando dados da URL...</strong></div>:dashboard?<DashboardContent data={dashboard} eventId={event.id} linkId={Number(selectedId)} refresh={()=>getUtmDashboard(event.id,Number(selectedId)).then(setDashboard)} filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} filtered={filtered} copy={copy} notify={notify}/>:null}
  {openNew&&<NewLinkDrawer form={form} setForm={setForm} onClose={()=>setOpenNew(false)} onSubmit={createLink}/>} 
 </div>
}

function EmptyStart({links,onSelect,onCreate}:{links:TrackingLink[];onSelect:(id:number)=>void;onCreate:()=>void}){return <section className="utm-empty-state"><div className="utm-empty-icon"><BarChart3 size={30}/></div><h3>Os gráficos começam vazios</h3><p>Escolha uma URL UTM existente para carregar conversões, pedidos e gráficos. Se ainda não houver uma campanha, crie a primeira sem sair desta tela.</p><div className="utm-empty-buttons"><button className="btn primary" onClick={onCreate}><Plus size={16}/> Criar URL UTM</button></div>{links.length>0&&<div className="utm-quick-links"><strong>Links disponíveis</strong>{links.slice(0,4).map(l=><button key={l.id} onClick={()=>onSelect(l.id)}><span><b>{l.name}</b><small>{l.source} / {l.medium} / {l.campaign}</small></span><TrendingUp size={16}/></button>)}</div>}</section>}

function DashboardContent({data,eventId,linkId,refresh,filter,setFilter,search,setSearch,filtered,copy,notify}:{data:UtmDashboard;eventId:number;linkId:number;refresh:()=>Promise<void>|void;filter:string;setFilter:(v:string)=>void;search:string;setSearch:(v:string)=>void;filtered:UtmDashboard['actions'];copy:(t:string)=>void;notify:(m:string)=>void}){
 const s=data.summary;const [sweeping,setSweeping]=useState(false);const runSweep=async()=>{setSweeping(true);try{const r=await sweepUtmAbandonments(eventId,linkId,30);notify(`${r.processed} sessão(ões) processada(s); ${r.recoveries} oportunidade(s) criada(s).`);await refresh()}catch(e:any){notify(e.message||'Falha ao detectar abandonos.')}finally{setSweeping(false)}};const funnel=[['Visitas',s.visits,'visits'],['Adicionou',s.added,'added'],['Checkout',s.checkout,'checkout'],['Abandonou',s.abandoned,'abandoned'],['Compra',s.finalized,'finalized']] as const
 const maxTimeline=Math.max(1,...data.timeline.map(d=>d.added+d.removed+d.abandoned+d.finalized))
 const maxHour=Math.max(1,...data.hours.map(d=>d.added+d.removed+d.abandoned+d.finalized))
 return <>
  <section className="utm-selected-card"><div className="utm-selected-main"><span className="utm-mini-label">URL SELECIONADA</span><h3>{data.link.name}</h3><div className="utm-full-url">{data.link.trackedUrl}</div><div className="utm-tags"><span>src: {data.link.source||'-'}</span><span>med: {data.link.medium||'-'}</span><span>cam: {data.link.campaign||'-'}</span>{data.link.content&&<span>content: {data.link.content}</span>}</div></div><div className="utm-selected-actions"><button onClick={()=>copy(data.link.trackedUrl)}><Copy size={16}/> Copiar</button><button onClick={()=>notify(`QR Code: ${data.link.qrPayload}`)}><QrCode size={16}/> QR Code</button><a href={data.link.trackedUrl} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Abrir</a></div></section>
  <section className="utm-kpis">
    <Metric label="Visitas" value={s.visits.toLocaleString('pt-BR')} note="Origem do tráfego"/>
    <Metric label="Carrinho" value={String(s.added)} note="Intenção de compra"/>
    <Metric label="Checkout" value={String(s.checkout)} note="Avanço no funil"/>
    <Metric label="Finalizou" value={String(s.finalized)} note="Conversão"/>
    <Metric label="Receita atribuída" value={money(s.revenueCents)} note="Valor da campanha"/>
    <Metric label="Conversão geral" value={`${s.conversionRate.toFixed(2).replace('.',',')}%`} note="Eficiência"/>
    <Metric label="Ticket médio" value={money(s.avgTicketCents)} note="Valor médio"/>
    <Metric label="Jornada" value={`${data.actions.length} ações`} note="Pedidos e ações"/>
  </section>
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
