import type { ComponentType } from 'react'
import {
  Activity, ArrowLeft, BarChart3, CalendarDays, ChevronRight, CircleGauge, FileBarChart2,
  Link2, MapPin, Megaphone, MousePointerClick, ScanLine, ScrollText, Settings2, ShieldCheck,
  Tags, Ticket, UserCog, Users, WalletCards, Waves, Boxes, ContactRound, Siren, Brain, Search, Gauge, Network, ClipboardCheck, Shield, LineChart, RadioTower
} from 'lucide-react'
import type { EventItem } from '../data/events'
import type { PageKey } from './ModuleSidebar'

type Item={key:PageKey;label:string;icon:ComponentType<{size?:number}>}
type Props={event:EventItem;page:PageKey;onNavigate:(page:PageKey)=>void;onBack:()=>void;canAdmin?:boolean}

const eventItems:Item[]=[
  {key:'event-command-center',label:'Cockpit 360',icon:Activity},
  {key:'event-inventory',label:'Inventário',icon:Boxes},
  {key:'event-customer-360',label:'Customer 360',icon:ContactRound},
  {key:'event-live-ops',label:'Live Operations',icon:RadioTower},
  {key:'event-incidents',label:'Incident Center',icon:Siren},
  {key:'event-revenue-intel',label:'Revenue Intelligence',icon:LineChart},
  {key:'event-global-search',label:'Busca Global',icon:Search},
  {key:'event-intelligence',label:'Disk Intelligence',icon:Brain},
  {key:'event-readiness',label:'Readiness / Go-Live',icon:ClipboardCheck},
  {key:'event-forecast',label:'Forecast Center',icon:Gauge},
  {key:'event-day-command',label:'Event Day Command',icon:Activity},
  {key:'event-producer-executive',label:'Executive Dashboard',icon:BarChart3},
  {key:'event-platform-noc',label:'Platform NOC',icon:Network},
  {key:'event-dashboard',label:'Dashboard',icon:CircleGauge},
  {key:'event-tickets',label:'Consultar Ingresso',icon:Ticket},
  {key:'event-courtesy',label:'Cortesias',icon:Tags},
  {key:'event-reports',label:'Relatórios',icon:FileBarChart2},
  {key:'event-details',label:'Detalhes',icon:Settings2},
]
const settings:Item[]=[
  {key:'event-pixel',label:'Pixel GA',icon:ScanLine},
  {key:'event-utm',label:'Central UTM & Conversões',icon:Link2},
  {key:'event-ga4',label:'Analytics GA4',icon:BarChart3},
  {key:'event-traffic',label:'Tráfego Site',icon:MousePointerClick},
  {key:'event-meta-ads',label:'Campanhas Meta Ads',icon:Megaphone},
  {key:'event-remarketing',label:'Remarketing',icon:Waves},
]
const adminItems:Item[]=[
  {key:'event-users',label:'Usuários',icon:Users},
  {key:'event-audit',label:'Logs',icon:ScrollText},
  {key:'event-permissions',label:'Permissões',icon:ShieldCheck},
  {key:'event-permission-engine',label:'Permission Engine',icon:Shield},
  {key:'event-compliance',label:'Audit & Compliance',icon:ScrollText},
]

export default function EventContextSidebar({event,page,onNavigate,onBack,canAdmin=true}:Props){
  return <aside className="module-sidebar event-context-sidebar">
    <button className="back-module event-back" onClick={onBack}><ArrowLeft size={20}/><span>Voltar</span><i><ArrowLeft size={15}/><ChevronRight size={15}/></i></button>
    <div className="event-context-summary">
      <div className={`event-context-cover ${event.cover}`}><span>{event.code}</span></div>
      <div className="event-context-copy">
        <strong>{event.code} - {event.title}</strong>
        <span><MapPin size={12}/>{event.venue}</span>
        <span><CalendarDays size={12}/>{event.date}</span>
      </div>
    </div>
    <nav className="module-nav event-context-nav">
      <p className="module-caption">EVENTO</p>
      {eventItems.map(item=><Nav key={item.key} item={item} page={page} onNavigate={onNavigate}/>)}
      <div className="nav-divider"/><p className="module-caption">CONFIGURAÇÕES</p>
      {settings.map(item=><Nav key={item.key} item={item} page={page} onNavigate={onNavigate}/>)}
      {canAdmin&&<><div className="nav-divider"/><p className="module-caption">ADMINISTRAÇÃO</p>{adminItems.map(item=><Nav key={item.key} item={item} page={page} onNavigate={onNavigate}/>)}</>}
      <div className="nav-divider"/>
      <button className="module-nav-item" onClick={()=>onNavigate('lots')}><WalletCards size={19}/><span>Configurar Lotes</span></button>
      <button className="module-nav-item" onClick={()=>onNavigate('participants')}><UserCog size={19}/><span>Participantes</span></button>
      <button className="module-nav-item" onClick={()=>onNavigate('operations')}><Activity size={19}/><span>Núcleo Operacional</span></button>
    </nav>
  </aside>
}
function Nav({item,page,onNavigate}:{item:Item;page:PageKey;onNavigate:(p:PageKey)=>void}){const Icon=item.icon;return <button className={`module-nav-item ${page===item.key?'active':''}`} onClick={()=>onNavigate(item.key)}><Icon size={20}/><span>{item.label}</span></button>}
