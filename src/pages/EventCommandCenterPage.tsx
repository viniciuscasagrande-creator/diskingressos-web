import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, BarChart3, CheckCircle2, CircleDollarSign, Clock3, Megaphone, RefreshCw, ShieldCheck, ShoppingCart, Ticket, Users, WalletCards, Waves } from 'lucide-react'
import type { EventItem } from '../data/events'
import { getEventCommandCenter, type EventCommandCenter } from '../services/api'
import type { PageKey } from '../components/ModuleSidebar'
import { EVENT_OS_RELEASE, healthBand } from '../domain/eventOS'
import './event-command-center.css'

type Props = { event: EventItem; onNavigate: (page: PageKey) => void; notify: (message: string) => void }

const money = (cents = 0) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function EventCommandCenterPage({ event, onNavigate, notify }: Props) {
  const [data, setData] = useState<EventCommandCenter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try { setData(await getEventCommandCenter(event.id)) }
    catch (e: any) { setError(e?.message || 'Não foi possível carregar o centro de comando.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [event.id])

  const score = data?.health.score ?? 0
  const band = useMemo(() => healthBand(score), [score])
  const kpis = data?.kpis

  return <div className="event-os-page" data-release={EVENT_OS_RELEASE}>
    <section className="event-os-hero">
      <div><p className="eyebrow">EVENT OS · FASE 26.0</p><h2>Centro de Comando do Evento</h2><p>{event.title} · operação, receita, público, marketing e prontidão em um único contexto.</p></div>
      <div className={`event-os-health ${band.key}`}><span>Saúde operacional</span><strong>{loading ? '—' : `${score}%`}</strong><small>{loading ? 'Carregando' : band.label}</small></div>
    </section>

    {error && <div className="event-os-alert"><AlertTriangle size={18}/><span>{error}</span><button onClick={load}>Tentar novamente</button></div>}

    <section className="event-os-toolbar">
      <div><span className="event-os-live-dot"/>Contexto protegido: evento <strong>{event.code}</strong> · producerId <strong>{event.producerId}</strong></div>
      <button className="btn secondary" onClick={()=>{load();notify('Centro de Comando atualizado.')}} disabled={loading}><RefreshCw size={15}/>{loading?'Atualizando...':'Atualizar'}</button>
    </section>

    <section className="event-os-kpis">
      <Kpi icon={CircleDollarSign} label="Receita confirmada" value={kpis ? money(kpis.revenueCents) : '—'} note={`${kpis?.paidOrders ?? 0} pedidos pagos`}/>
      <Kpi icon={Ticket} label="Ingressos" value={String(kpis?.tickets ?? '—')} note={`${kpis?.inventoryAvailable ?? 0} disponíveis`}/>
      <Kpi icon={Users} label="Participantes" value={String(kpis?.participants ?? '—')} note={`${kpis?.checkins ?? 0} check-ins`}/>
      <Kpi icon={ShoppingCart} label="Recuperação" value={money(kpis?.recoverableCents ?? 0)} note={`${kpis?.openRecoveries ?? 0} oportunidades abertas`}/>
      <Kpi icon={Megaphone} label="Marketing" value={String(kpis?.activeCampaigns ?? '—')} note="campanhas ativas"/>
      <Kpi icon={BarChart3} label="Ocupação" value={`${(kpis?.occupancy ?? 0).toFixed(1)}%`} note={`${kpis?.inventorySold ?? 0}/${kpis?.inventoryCapacity ?? 0} inventário`}/>
    </section>

    <section className="event-os-grid">
      <article className="event-os-panel event-os-span-2">
        <header><div><h3>Prontidão do evento</h3><p>Checklist automático para identificar bloqueios antes da operação.</p></div><ShieldCheck size={20}/></header>
        <div className="event-os-readiness">
          {(data?.readiness || []).map(item => <div key={item.key} className={`event-os-check ${item.status}`}><span>{item.status === 'ok' ? <CheckCircle2 size={17}/> : <AlertTriangle size={17}/>}</span><div><strong>{item.label}</strong><small>{item.detail}</small></div></div>)}
          {!loading && !data?.readiness?.length && <p className="event-os-empty">Sem verificações disponíveis.</p>}
        </div>
      </article>
      <article className="event-os-panel">
        <header><div><h3>Alertas prioritários</h3><p>Ações que exigem atenção operacional.</p></div><AlertTriangle size={20}/></header>
        <div className="event-os-alert-list">
          {(data?.alerts || []).map((item, i) => <div key={`${item.code}-${i}`} className={`event-os-alert-row ${item.severity}`}><span>{item.severity}</span><div><strong>{item.title}</strong><small>{item.message}</small></div></div>)}
          {!loading && !data?.alerts?.length && <div className="event-os-all-good"><CheckCircle2 size={20}/><span>Nenhum alerta crítico agora.</span></div>}
        </div>
      </article>
    </section>

    <section className="event-os-panel">
      <header><div><h3>Módulos operacionais</h3><p>Todos os destinos preservam automaticamente o mesmo evento.</p></div><Activity size={20}/></header>
      <div className="event-os-launch-grid">
        <Launch icon={Ticket} title="Vendas & Ingressos" text="Pedidos, ingressos e participantes" onClick={()=>onNavigate('event-tickets')}/>
        <Launch icon={WalletCards} title="Financeiro" text="Negociação, ledger e liquidação" onClick={()=>onNavigate('finance-negotiations')}/>
        <Launch icon={Megaphone} title="Marketing" text="Campanhas e performance" onClick={()=>onNavigate('event-meta-ads')}/>
        <Launch icon={Waves} title="Remarketing" text="Carrinho e recuperação automática" onClick={()=>onNavigate('event-remarketing')}/>
        <Launch icon={BarChart3} title="Analytics" text="Conversão, tráfego e relatórios" onClick={()=>onNavigate('event-ga4')}/>
        <Launch icon={ShieldCheck} title="Governança" text="Permissões e auditoria" onClick={()=>onNavigate('event-audit')}/>
      </div>
    </section>

    <section className="event-os-footer-note"><Clock3 size={15}/><span>Fase 26.0 estabelece o evento como unidade operacional central do PDT. Próximas fases aprofundam inventário, tempo real, incidentes, CRM 360 e inteligência.</span></section>
  </div>
}

function Kpi({icon:Icon,label,value,note}:{icon:any;label:string;value:string;note:string}){return <article className="event-os-kpi"><div><span>{label}</span><Icon size={18}/></div><strong>{value}</strong><small>{note}</small></article>}
function Launch({icon:Icon,title,text,onClick}:{icon:any;title:string;text:string;onClick:()=>void}){return <button className="event-os-launch" onClick={onClick}><span><Icon size={20}/></span><div><strong>{title}</strong><small>{text}</small></div></button>}
