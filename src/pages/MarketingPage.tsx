import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight, BarChart3, Download, Link2, Megaphone, MousePointerClick, Plus,
  Save, Settings2, TrendingUp, WalletCards, Zap, MessageSquare, Mail,
  TicketPercent, Users, Activity, QrCode
} from 'lucide-react'
import type { EventItem } from '../data/events'
import AutomationCenterPage from './AutomationCenterPage'
import UtmConversionsCenter from '../components/UtmConversionsCenter'
import TrackingIntegrationsManager from '../components/TrackingIntegrationsManager'
import { MarketingCampaignsPage } from './marketing/MarketingCampaignsPage'
import { createMarketingCampaign, getMarketingCampaigns, getResolvedTracking, getTrackingConfigs, saveTrackingConfig, updateMarketingCampaign, type MarketingCampaign, type ResolvedTracking, type TrackingConfig } from '../services/api'

type Mode = 'hub' | 'dashboard' | 'campaigns' | 'create' | 'automations' | 'whatsapp' | 'email' | 'coupons' | 'links' | 'affiliates' | 'tracking' | 'reports'

type Props = {
  events: EventItem[]
  producerName: string
  producerId: number | null
  mode: Mode
  notify: (m: string) => void
  onNavigate?: (page: any) => void
}

const dashboardCards = [
  { title: 'Receita Gerada', value: 'R$ 125.430', delta: '↑ 18,4%', icon: WalletCards },
  { title: 'Conversões', value: '2.847', delta: '↑ 12,8%', icon: MousePointerClick },
  { title: 'Taxa de Conversão', value: '4,82%', delta: '↑ 0,9%', icon: TrendingUp },
  { title: 'ROI Marketing', value: '342%', delta: '↑ 22%', icon: BarChart3 }
]

const marketingModules = [
  { id: 'marketing-dashboard', title: 'Dashboard', description: 'KPIs, funil e desempenho geral.', icon: BarChart3 },
  { id: 'marketing-campaigns', title: 'Campanhas', description: 'Criação, agendamento e métricas.', icon: Megaphone },
  { id: 'marketing-automations', title: 'Automações', description: 'Fluxos automáticos de comunicação.', icon: Zap },
  { id: 'marketing-whatsapp', title: 'WhatsApp', description: 'Campanhas e mensagens transacionais.', icon: MessageSquare },
  { id: 'marketing-email', title: 'E-mail Marketing', description: 'Disparos e jornadas de e-mail.', icon: Mail },
  { id: 'marketing-coupons', title: 'Cupons e Promoções', description: 'Ofertas, vouchers e descontos.', icon: TicketPercent },
  { id: 'marketing-links', title: 'Links, UTMs e QR Codes', description: 'Rastreamento de origem e conversão.', icon: Link2 },
  { id: 'marketing-affiliates', title: 'Afiliados e Parceiros', description: 'Performance de parceiros e comissões.', icon: Users },
  { id: 'marketing-tracking', title: 'Pixel & Analytics', description: 'Meta, GA4, GTM e conversões.', icon: Activity },
  { id: 'marketing-reports', title: 'Relatórios', description: 'ROI, ROAS, canais e exportações.', icon: TrendingUp }
]

export default function MarketingPage({ events, producerName, producerId, mode, notify, onNavigate }: Props) {
  const [eventId, setEventId] = useState<string>('all')
  const [period, setPeriod] = useState('30')
  const selectedEventId = eventId === 'all' ? undefined : Number(eventId)
  const eventName = useMemo(() => eventId === 'all' ? 'Todos os eventos' : events.find(e => String(e.id) === eventId)?.title || 'Evento', [eventId, events])

  if (mode === 'hub') {
    return (
      <section className="growth-page">
        <Context producerName={producerName} events={events} eventId={eventId} setEventId={setEventId} period={period} setPeriod={setPeriod} />
        <div className="growth-intro">
          <div>
            <p className="eyebrow">MARKETING & GROWTH</p>
            <h2>Hub Marketing</h2>
            <p>Centralize aquisição, campanhas, automações, promoções e mensuração.</p>
          </div>
        </div>
        <div className="module-card-grid">
          {marketingModules.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                className="finance-module-card marketing-card interactive-hub-card"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate(item.id)
                  } else {
                    notify(`Abrindo ${item.title}...`)
                  }
                }}
              >
                <span className="module-card-icon">
                  <Icon size={24} />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
                <ArrowUpRight size={18} className="card-arrow-icon" />
              </button>
            )
          })}
        </div>
      </section>
    )
  }

  if (mode === 'dashboard') return <Dashboard producerName={producerName} events={events} eventId={eventId} setEventId={setEventId} period={period} setPeriod={setPeriod} eventName={eventName} notify={notify} onNavigate={onNavigate} />
  if (mode === 'campaigns' || mode === 'create') return <MarketingCampaignsPage events={events} notify={notify} />
  if (mode === 'links') return <Links producerId={producerId} events={events} initialEventId={selectedEventId} notify={notify} />
  if (mode === 'tracking') return <Tracking producerId={producerId} events={events} initialEventId={selectedEventId} notify={notify} />
  if (mode === 'automations' || mode === 'whatsapp' || mode === 'email') return <AutomationCenterPage producerId={producerId} events={events} mode={mode} notify={notify} />
  return <FeaturePage title={featureTitle(mode)} eventName={eventName} producerName={producerName} notify={notify} />
}

function Dashboard({producerName,events,eventId,setEventId,period,setPeriod,eventName,notify}:any){return <section className="growth-page"><Context producerName={producerName} events={events} eventId={eventId} setEventId={setEventId} period={period} setPeriod={setPeriod}/><div className="growth-intro growth-actions"><div><p className="eyebrow">MARKETING & GROWTH</p><h2>Dashboard Marketing</h2><p>Acompanhe o desempenho das campanhas e vendas de {eventName.toLowerCase()}.</p></div><div className="page-actions"><button className="btn secondary" onClick={()=>notify('Relatório exportado (simulação).')}><Download size={17}/> Exportar</button><button className="btn primary" onClick={()=>notify('Use Criar Campanha no menu lateral.')}><Plus size={17}/> Criar Campanha</button></div></div><div className="growth-kpis">{dashboardCards.map(c=>{const I=c.icon;return <article className="growth-kpi" key={c.title}><div className="kpi-top"><span>{c.title}</span><I size={19}/></div><strong>{c.value}</strong><small>{c.delta} vs. período anterior</small></article>})}</div><div className="growth-grid"><article className="growth-panel"><div className="panel-head"><div><h3>Funil de conversão</h3><p>Da visita até a venda concluída</p></div></div><div className="funnel"><Funnel n="120.450" label="Visitantes" w="100%"/><Funnel n="48.320" label="Visualizações" w="82%"/><Funnel n="8.540" label="Checkout" w="63%"/><Funnel n="4.125" label="Pagamentos" w="46%"/><Funnel n="2.847" label="Vendas" w="32%"/></div></article><article className="growth-panel"><div className="panel-head"><div><h3>Conversões por canal</h3><p>Participação nas conversões</p></div></div><div className="channel-list">{[['Instagram',42],['Google',25],['WhatsApp',18],['E-mail',8],['Direto',7]].map(([n,v])=><div className="channel-row" key={String(n)}><div><span>{n}</span><b>{v}%</b></div><div className="channel-track"><i style={{width:`${v}%`}}/></div></div>)}</div></article></div></section>}

function Campaigns({producerId,events,initialEventId,createOnly,notify}:{producerId:number|null;events:EventItem[];initialEventId?:number;createOnly:boolean;notify:(m:string)=>void}){
 const [rows,setRows]=useState<MarketingCampaign[]>([]);const [loading,setLoading]=useState(true);const [eventId,setEventId]=useState<number|undefined>(initialEventId);const [form,setForm]=useState({name:'',channel:'instagram',objective:'conversao',budget:'',status:'rascunho'})
 const load=()=>{setLoading(true);getMarketingCampaigns(producerId||undefined,eventId).then(setRows).catch(e=>notify(e.message)).finally(()=>setLoading(false))};useEffect(load,[producerId,eventId])
 const submit=async(e:React.FormEvent)=>{e.preventDefault();try{await createMarketingCampaign({name:form.name,channel:form.channel,objective:form.objective,status:form.status,budgetCents:Math.round(Number(form.budget||0)*100),producerId:producerId||undefined,eventId:eventId||undefined});setForm({...form,name:'',budget:''});notify('Campanha criada com sucesso.');load()}catch(err:any){notify(err.message)}}
 return <section className="growth-page"><div className="growth-intro"><div><p className="eyebrow">MARKETING & GROWTH</p><h2>{createOnly?'Criar Campanha':'Campanhas'}</h2><p>Campanhas persistidas na API, isoladas por produtora e evento.</p></div></div><div className="phase12-split"><form className="growth-panel phase12-form" onSubmit={submit}><h3>Nova campanha</h3><label>Evento<select value={eventId||''} onChange={e=>setEventId(e.target.value?Number(e.target.value):undefined)}><option value="">Sem evento específico</option>{events.map(ev=><option key={ev.id} value={ev.id}>{ev.title}</option>)}</select></label><label>Nome<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ex.: Último Lote"/></label><div className="phase12-form-grid"><label>Canal<select value={form.channel} onChange={e=>setForm({...form,channel:e.target.value})}><option value="instagram">Instagram</option><option value="google">Google</option><option value="whatsapp">WhatsApp</option><option value="email">E-mail</option><option value="afiliados">Afiliados</option></select></label><label>Orçamento (R$)<input type="number" min="0" step="0.01" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})}/></label></div><button className="btn primary" type="submit"><Plus size={17}/> Criar campanha</button></form>{!createOnly&&<article className="growth-panel"><div className="panel-head"><div><h3>Campanhas cadastradas</h3><p>{loading?'Carregando...':`${rows.length} campanha(s)`}</p></div></div><div className="table-scroll"><table className="growth-table"><thead><tr><th>Campanha</th><th>Canal</th><th>Status</th><th>Evento</th><th>Receita</th><th>Conversões</th><th>Ação</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><strong>{r.name}</strong></td><td>{r.channel}</td><td><span className={`status-badge ${r.status==='ativa'?'green':'orange'}`}>{r.status}</span></td><td>{r.event?.title||'Todos'}</td><td>{money(r.revenueCents)}</td><td>{r.conversions}</td><td><button className="icon-action" onClick={async()=>{await updateMarketingCampaign(r.id,{status:r.status==='ativa'?'pausada':'ativa'});notify('Status atualizado.');load()}}>{r.status==='ativa'?'Pausar':'Ativar'}</button></td></tr>)}</tbody></table></div></article>}</div></section>
}

function Links({events,initialEventId,notify}:{producerId:number|null;events:EventItem[];initialEventId?:number;notify:(m:string)=>void}){
 const [eventId,setEventId]=useState<number|undefined>(initialEventId || events[0]?.id)
 const selectedEvent=events.find(e=>e.id===eventId) || events[0]
 return (
   <section className="growth-page utm-marketing-entry" style={{ padding: '0 4px', background: 'transparent' }}>
     {!selectedEvent ? (
       <article className="growth-panel feature-empty utm-event-empty">
         <Link2 size={36}/>
         <h3>A Central UTM começa pelo evento</h3>
         <p>Nenhum evento encontrado para carregar métricas de UTM.</p>
       </article>
     ) : (
       <UtmConversionsCenter 
         event={selectedEvent}
         events={events}
         onSelectEvent={(ev) => setEventId(ev.id)}
         notify={notify}
       />
     )}
   </section>
 )
}

function Tracking({producerId,events,initialEventId,notify}:{producerId:number|null;events:EventItem[];initialEventId?:number;notify:(m:string)=>void}){
 return <section className="growth-page"><TrackingIntegrationsManager producerId={producerId} events={events} fixedEventId={initialEventId} notify={notify}/></section>
}

function Context({producerName,events,eventId,setEventId,period,setPeriod}:{producerName:string;events:EventItem[];eventId:string;setEventId:(v:string)=>void;period:string;setPeriod:(v:string)=>void}){return <div className="growth-context"><div><span>Produtor</span><strong>{producerName}</strong></div><label><span>Evento</span><select value={eventId} onChange={e=>setEventId(e.target.value)}><option value="all">Todos os eventos</option>{events.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select></label><label><span>Período</span><select value={period} onChange={e=>setPeriod(e.target.value)}><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option></select></label></div>}
function Funnel({n,label,w}:{n:string;label:string;w:string}){return <div className="funnel-step" style={{width:w}}><span>{label}</span><b>{n}</b></div>}
function FeaturePage({title,eventName,producerName,notify}:{title:string;eventName:string;producerName:string;notify:(m:string)=>void}){return <section className="growth-page"><div className="growth-intro growth-actions"><div><p className="eyebrow">MARKETING & GROWTH</p><h2>{title}</h2><p>{producerName} · {eventName}</p></div><button className="btn primary" onClick={()=>notify(`${title}: próxima implementação do módulo.`)}><Plus size={17}/> Nova ação</button></div><article className="growth-panel feature-empty"><Megaphone size={34}/><h3>{title}</h3><p>Estrutura integrada ao template, permissões e contexto multi-produtor.</p><div className="feature-badges"><span>Multi-produtor</span><span>Contexto por evento</span><span>Permissões</span><span>Auditoria</span></div></article></section>}
function featureTitle(mode:Mode){return ({hub:'Hub Marketing',dashboard:'Dashboard',campaigns:'Campanhas',create:'Criar Campanha',automations:'Automações',whatsapp:'WhatsApp',email:'E-mail Marketing',coupons:'Cupons e Promoções',links:'Links, UTMs e QR Codes',affiliates:'Afiliados e Parceiros',tracking:'Pixel & Analytics',reports:'Relatórios'} as Record<string,string>)[mode]||'Marketing'}
function money(cents:number){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100)}
