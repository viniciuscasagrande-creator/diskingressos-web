import { useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, BarChart3, CheckCircle2, CircleDollarSign, Clock3,
  CreditCard, DoorOpen, Megaphone, RefreshCw, RotateCcw, ShieldAlert, ShieldCheck,
  ShoppingCart, Ticket, Users, WalletCards, Waves
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  getEventActivityStream, getEventCommandCenter,
  type EventActivityItem, type EventActivityStream, type EventCommandCenter
} from '../services/api'
import type { PageKey } from '../components/ModuleSidebar'
import { EVENT_OS_RELEASE, healthBand } from '../domain/eventOS'
import './event-command-center.css'

type Props = { event: EventItem; onNavigate: (page: PageKey) => void; notify: (message: string) => void }
type ActivityFilter = 'all' | EventActivityItem['type']

const money = (cents = 0) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const time = (iso?: string) => iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'

export default function EventCommandCenterPage({ event, onNavigate, notify }: Props) {
  const [data, setData] = useState<EventCommandCenter | null>(null)
  const [stream, setStream] = useState<EventActivityStream | null>(null)
  const [loading, setLoading] = useState(true)
  const [streamLoading, setStreamLoading] = useState(true)
  const [error, setError] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [filter, setFilter] = useState<ActivityFilter>('all')

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const [command, activity] = await Promise.all([
        getEventCommandCenter(event.id),
        getEventActivityStream(event.id, 60),
      ])
      setData(command)
      setStream(activity)
    } catch (e: any) {
      setError(e?.message || 'Não foi possível carregar o cockpit do evento.')
    } finally {
      setLoading(false)
      setStreamLoading(false)
    }
  }

  useEffect(() => { setStreamLoading(true); load() }, [event.id])
  useEffect(() => {
    if (!autoRefresh) return
    const timer = window.setInterval(() => load(true), 15000)
    return () => window.clearInterval(timer)
  }, [autoRefresh, event.id])

  const score = data?.health.score ?? 0
  const band = useMemo(() => healthBand(score), [score])
  const kpis = data?.kpis
  const pulse = stream?.pulse
  const activity = useMemo(() => (stream?.activity || []).filter(item => filter === 'all' || item.type === filter), [stream, filter])
  const maxTrend = useMemo(() => Math.max(1, ...(stream?.trend || []).map(x => Math.max(x.orders, x.checkins))), [stream])

  return <div className="event-os-page" data-release={EVENT_OS_RELEASE}>
    <section className="event-os-hero event-os-hero-261">
      <div>
        <p className="eyebrow">EVENT OS · FASE 26.1</p>
        <h2>Event Cockpit 360</h2>
        <p>{event.title} · vendas, público, recuperação, financeiro e operação em uma visão viva do evento.</p>
      </div>
      <div className="event-os-hero-actions">
        <div className={`event-os-health ${band.key}`}><span>Saúde operacional</span><strong>{loading ? '—' : `${score}%`}</strong><small>{loading ? 'Carregando' : band.label}</small></div>
        <div className="event-os-live-state"><span className="event-os-live-dot"/><div><strong>{autoRefresh ? 'Cockpit ao vivo' : 'Atualização pausada'}</strong><small>última leitura {time(stream?.generatedAt)}</small></div></div>
      </div>
    </section>

    {error && <div className="event-os-alert"><AlertTriangle size={18}/><span>{error}</span><button onClick={()=>load()}>Tentar novamente</button></div>}

    <section className="event-os-toolbar">
      <div><span className="event-os-live-dot"/>Contexto protegido: evento <strong>{event.code}</strong> · producerId <strong>{event.producerId}</strong></div>
      <div className="event-os-toolbar-actions">
        <label className="event-os-toggle"><input type="checkbox" checked={autoRefresh} onChange={e=>setAutoRefresh(e.target.checked)}/><span/>Atualizar a cada 15s</label>
        <button className="btn secondary" onClick={()=>{load();notify('Event Cockpit atualizado.')}} disabled={loading}><RefreshCw size={15}/>{loading?'Atualizando...':'Atualizar agora'}</button>
      </div>
    </section>

    <section className="event-os-pulse">
      <Pulse icon={CreditCard} label="Vendas · 15 min" value={String(pulse?.orders15m ?? '—')} note={money(pulse?.revenue15mCents ?? 0)} tone="blue" />
      <Pulse icon={CircleDollarSign} label="Receita · 1 hora" value={money(pulse?.revenue1hCents ?? 0)} note={`${pulse?.orders1h ?? 0} pedidos pagos`} tone="green" />
      <Pulse icon={DoorOpen} label="Check-ins · 15 min" value={String(pulse?.checkins15m ?? '—')} note={`${pulse?.checkins1h ?? 0} na última hora`} tone="violet" />
      <Pulse icon={RotateCcw} label="Recuperados · 12h" value={String(pulse?.recovered12h ?? '—')} note={money(pulse?.recoveredRevenue12hCents ?? 0)} tone="teal" />
      <Pulse icon={ShieldAlert} label="Risco operacional" value={String((pulse?.openRefunds ?? 0) + (pulse?.openIncidents ?? 0))} note={`${pulse?.openRefunds ?? 0} estornos · ${pulse?.openIncidents ?? 0} incidentes`} tone={(pulse?.openIncidents ?? 0) > 0 ? 'red' : 'amber'} />
    </section>

    <section className="event-os-kpis">
      <Kpi icon={CircleDollarSign} label="Receita confirmada" value={kpis ? money(kpis.revenueCents) : '—'} note={`${kpis?.paidOrders ?? 0} pedidos pagos`}/>
      <Kpi icon={Ticket} label="Ingressos" value={String(kpis?.tickets ?? '—')} note={`${kpis?.inventoryAvailable ?? 0} disponíveis`}/>
      <Kpi icon={Users} label="Participantes" value={String(kpis?.participants ?? '—')} note={`${kpis?.checkins ?? 0} check-ins`}/>
      <Kpi icon={ShoppingCart} label="Recuperação" value={money(kpis?.recoverableCents ?? 0)} note={`${kpis?.openRecoveries ?? 0} oportunidades abertas`}/>
      <Kpi icon={Megaphone} label="Marketing" value={String(kpis?.activeCampaigns ?? '—')} note="campanhas ativas"/>
      <Kpi icon={BarChart3} label="Ocupação" value={`${(kpis?.occupancy ?? 0).toFixed(1)}%`} note={`${kpis?.inventorySold ?? 0}/${kpis?.inventoryCapacity ?? 0} inventário`}/>
    </section>

    <section className="event-os-grid event-os-grid-261">
      <article className="event-os-panel event-os-span-2">
        <header><div><h3>Ritmo operacional · últimas 12 horas</h3><p>Pedidos pagos e check-ins por hora. Atualização automática sem trocar o contexto do evento.</p></div><Activity size={20}/></header>
        <div className="event-os-trend" aria-label="Ritmo operacional das últimas 12 horas">
          {(stream?.trend || []).map((point, idx) => <div className="event-os-trend-col" key={point.hour} title={`${new Date(point.hour).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})} · ${point.orders} vendas · ${point.checkins} check-ins · ${money(point.revenueCents)}`}>
            <div className="event-os-trend-bars"><span className="sales" style={{height:`${Math.max(4,(point.orders/maxTrend)*100)}%`}}/><span className="checkins" style={{height:`${Math.max(4,(point.checkins/maxTrend)*100)}%`}}/></div>
            <small>{idx % 2 === 0 ? new Date(point.hour).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) : ''}</small>
          </div>)}
          {!stream?.trend?.length && <p className="event-os-empty">Sem leitura temporal disponível.</p>}
        </div>
        <div className="event-os-trend-legend"><span><i className="sales"/>Vendas</span><span><i className="checkins"/>Check-ins</span></div>
      </article>

      <article className="event-os-panel">
        <header><div><h3>Alertas prioritários</h3><p>Ações que exigem atenção operacional.</p></div><AlertTriangle size={20}/></header>
        <div className="event-os-alert-list">
          {(data?.alerts || []).map((item, i) => <div key={`${item.code}-${i}`} className={`event-os-alert-row ${item.severity}`}><span>{item.severity}</span><div><strong>{item.title}</strong><small>{item.message}</small></div></div>)}
          {!loading && !data?.alerts?.length && <div className="event-os-all-good"><CheckCircle2 size={20}/><span>Nenhum alerta crítico agora.</span></div>}
        </div>
      </article>
    </section>

    <section className="event-os-grid event-os-grid-261">
      <article className="event-os-panel event-os-span-2">
        <header className="event-os-activity-header"><div><h3>Activity Stream</h3><p>Linha operacional unificada do que está acontecendo no evento.</p></div><div className="event-os-stream-status"><span className={streamLoading?'loading':'live'}/>{streamLoading?'Sincronizando':'Sincronizado'}</div></header>
        <div className="event-os-filterbar">
          {(['all','sale','checkin','recovery','refund','finance','marketing','incident'] as ActivityFilter[]).map(key=><button key={key} className={filter===key?'active':''} onClick={()=>setFilter(key)}>{activityLabel(key)}</button>)}
        </div>
        <div className="event-os-stream">
          {activity.map(item => <ActivityRow key={item.id} item={item}/>) }
          {!streamLoading && !activity.length && <div className="event-os-empty-stream"><Activity size={22}/><strong>Nenhuma atividade neste filtro</strong><span>Novas operações aparecerão automaticamente.</span></div>}
        </div>
      </article>

      <article className="event-os-panel">
        <header><div><h3>Prontidão do evento</h3><p>Checklist automático antes e durante a operação.</p></div><ShieldCheck size={20}/></header>
        <div className="event-os-readiness event-os-readiness-single">
          {(data?.readiness || []).map(item => <div key={item.key} className={`event-os-check ${item.status}`}><span>{item.status === 'ok' ? <CheckCircle2 size={17}/> : <AlertTriangle size={17}/>}</span><div><strong>{item.label}</strong><small>{item.detail}</small></div></div>)}
          {!loading && !data?.readiness?.length && <p className="event-os-empty">Sem verificações disponíveis.</p>}
        </div>
      </article>
    </section>

    <section className="event-os-panel">
      <header><div><h3>Módulos operacionais</h3><p>Todos os destinos preservam automaticamente o mesmo evento e a mesma produtora.</p></div><Activity size={20}/></header>
      <div className="event-os-launch-grid">
        <Launch icon={Ticket} title="Vendas & Ingressos" text="Pedidos, ingressos e participantes" onClick={()=>onNavigate('event-tickets')}/>
        <Launch icon={WalletCards} title="Financeiro" text="Negociação, ledger e liquidação" onClick={()=>onNavigate('finance-negotiations')}/>
        <Launch icon={Megaphone} title="Marketing" text="Campanhas e performance" onClick={()=>onNavigate('event-meta-ads')}/>
        <Launch icon={Waves} title="Remarketing" text="Carrinho e recuperação automática" onClick={()=>onNavigate('event-remarketing')}/>
        <Launch icon={BarChart3} title="Analytics" text="Conversão, tráfego e relatórios" onClick={()=>onNavigate('event-ga4')}/>
        <Launch icon={ShieldCheck} title="Governança" text="Permissões e auditoria" onClick={()=>onNavigate('event-audit')}/>
      </div>
    </section>

    <section className="event-os-footer-note"><Clock3 size={15}/><span>Fase 26.1 conecta o Centro de Comando às fontes transacionais existentes e atualiza o Activity Stream a cada 15 segundos. A fonte de verdade continua sendo cada módulo operacional; o Cockpit apenas consolida.</span></section>
  </div>
}

function Kpi({icon:Icon,label,value,note}:{icon:any;label:string;value:string;note:string}){return <article className="event-os-kpi"><div><span>{label}</span><Icon size={18}/></div><strong>{value}</strong><small>{note}</small></article>}
function Pulse({icon:Icon,label,value,note,tone}:{icon:any;label:string;value:string;note:string;tone:string}){return <article className={`event-os-pulse-card ${tone}`}><span className="event-os-pulse-icon"><Icon size={18}/></span><div><small>{label}</small><strong>{value}</strong><span>{note}</span></div></article>}
function Launch({icon:Icon,title,text,onClick}:{icon:any;title:string;text:string;onClick:()=>void}){return <button className="event-os-launch" onClick={onClick}><span><Icon size={20}/></span><div><strong>{title}</strong><small>{text}</small></div></button>}

function activityLabel(key:ActivityFilter){return ({all:'Tudo',sale:'Vendas',checkin:'Check-in',recovery:'Recuperação',refund:'Estornos',finance:'Financeiro',marketing:'Marketing',incident:'Incidentes'} as Record<ActivityFilter,string>)[key]}
function activityIcon(type:EventActivityItem['type']){
  if(type==='sale') return CreditCard
  if(type==='checkin') return DoorOpen
  if(type==='recovery') return RotateCcw
  if(type==='refund') return ShieldAlert
  if(type==='finance') return WalletCards
  if(type==='marketing') return Megaphone
  return AlertTriangle
}
function ActivityRow({item}:{item:EventActivityItem}){
  const Icon=activityIcon(item.type)
  return <div className={`event-os-stream-row ${item.severity}`}>
    <div className={`event-os-stream-icon ${item.type}`}><Icon size={17}/></div>
    <div className="event-os-stream-copy"><div><strong>{item.title}</strong><span className="event-os-stream-badge">{activityLabel(item.type)}</span></div><small>{item.detail}</small></div>
    {typeof item.amountCents==='number' && item.amountCents!==0 && <strong className="event-os-stream-amount">{money(item.amountCents)}</strong>}
    <div className="event-os-stream-time"><strong>{time(item.occurredAt)}</strong><small>{item.status}</small></div>
  </div>
}
