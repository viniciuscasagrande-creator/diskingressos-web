import { BarChart3, CalendarDays, CreditCard, Headphones, Megaphone, MonitorSmartphone, ShieldCheck, Ticket, TrendingUp, Users, WalletCards } from 'lucide-react'
import { canAccess, roleLabel, type AppUser, type Producer } from '../auth/model'
import type { EventItem } from '../data/events'
import type { Participant } from '../data/participants'
import type { PageKey } from '../components/ModuleSidebar'

type Props={
  user:AppUser
  producer?:Producer
  events:EventItem[]
  participants:Participant[]
  onNavigate:(page:PageKey)=>void
}

type Shortcut={label:string;description:string;page:PageKey;icon:any;area:'events'|'finance'|'pos'|'admin'|'marketing'|'remarketing'|'sac'}

const shortcuts:Shortcut[]=[
 {label:'Meus Eventos',description:'Acesse os eventos disponíveis para sua conta.',page:'events',icon:CalendarDays,area:'events'},
 {label:'Financeiro',description:'Saldo, vendas, repasses e extratos.',page:'finance-hub',icon:WalletCards,area:'finance'},
 {label:'Terminais POS',description:'Operação presencial e fechamento de caixa.',page:'pos',icon:MonitorSmartphone,area:'pos'},
 {label:'Marketing',description:'Campanhas, pixels, links e automações.',page:'marketing-hub',icon:Megaphone,area:'marketing'},
 {label:'Remarketing',description:'Recuperação, públicos e jornadas.',page:'remarketing-hub',icon:TrendingUp,area:'remarketing'},
 {label:'Atendimento / SAC',description:'Chamados, SLA e operação de suporte.',page:'sac-hub',icon:Headphones,area:'sac'},
 {label:'Administração',description:'Usuários, permissões e segurança.',page:'admin-hub',icon:ShieldCheck,area:'admin'},
]

export default function ProfileDashboardPage({user,producer,events,participants,onNavigate}:Props){
 const activeEvents=events.filter(e=>e.status==='ativo').length
 const totalSales=events.reduce((sum,e)=>sum+(e.sales||0),0)
 const checkedIn=participants.filter(p=>p.checkin==='presente').length
 const allowed=shortcuts.filter(s=>canAccess(user,s.area))
 const roleMessage=user.role==='producer-finance'?'Seu acesso está direcionado às operações financeiras da produtora.'
  :user.role==='producer-marketing'?'Seu acesso está direcionado a Marketing, Remarketing e análise dos seus eventos.'
  :user.role==='producer-operation'?'Seu acesso está direcionado à operação dos eventos, participantes, check-in, POS e SAC.'
  :user.role==='viewer'?'Seu perfil é somente leitura. As informações disponíveis respeitam as permissões da sua produtora.'
  :'Você tem acesso administrativo à sua produtora e aos módulos liberados para sua conta.'
 return <div className="profile-dashboard">
   <section className="profile-hero">
     <div><span className="eyebrow">PAINEL POR PERFIL</span><h2>Olá, {user.name.split(' ')[0]}</h2><p>{roleMessage}</p></div>
     <div className="profile-scope-card"><span>Contexto atual</span><strong>{producer?.name||'Produtora vinculada'}</strong><small>{roleLabel[user.role]}</small></div>
   </section>

   <section className="profile-kpis">
     <div className="profile-kpi"><span><CalendarDays size={18}/> Eventos visíveis</span><strong>{events.length}</strong><small>Somente eventos da sua produtora</small></div>
     <div className="profile-kpi"><span><Ticket size={18}/> Eventos ativos</span><strong>{activeEvents}</strong><small>Dentro do seu escopo de acesso</small></div>
     <div className="profile-kpi"><span><CreditCard size={18}/> Vendas registradas</span><strong>{totalSales.toLocaleString('pt-BR')}</strong><small>Somatório dos eventos visíveis</small></div>
     <div className="profile-kpi"><span><Users size={18}/> Check-ins</span><strong>{checkedIn.toLocaleString('pt-BR')}</strong><small>Participantes presentes</small></div>
   </section>

   <section className="profile-section">
     <div className="profile-section-head"><div><span className="eyebrow">ACESSOS LIBERADOS</span><h3>Atalhos do seu perfil</h3></div><span className="role-chip">{roleLabel[user.role]}</span></div>
     <div className="profile-shortcuts">
       {allowed.map(item=>{const Icon=item.icon;return <button key={item.label} className="profile-shortcut" onClick={()=>onNavigate(item.page)}><span className="shortcut-icon"><Icon size={22}/></span><span><strong>{item.label}</strong><small>{item.description}</small></span></button>})}
     </div>
   </section>

   <section className="profile-section">
     <div className="profile-section-head"><div><span className="eyebrow">EVENTOS</span><h3>Últimos eventos disponíveis para você</h3></div><button className="text-action" onClick={()=>onNavigate('events')}>Ver todos</button></div>
     <div className="profile-event-list">
       {events.slice(0,5).map(e=><button key={e.id} className="profile-event-row" onClick={()=>onNavigate('events')}><span className="event-dot"/><span className="profile-event-main"><strong>{e.code} - {e.title}</strong><small>{e.venue} · {e.city}</small></span><span className={`event-status ${e.status}`}>{e.status}</span><span className="event-sales"><strong>{e.sales}</strong><small>vendas</small></span></button>)}
       {events.length===0&&<div className="empty-profile">Nenhum evento disponível para este usuário.</div>}
     </div>
   </section>

   <section className="profile-access-note"><BarChart3 size={20}/><div><strong>Escopo aplicado pelo login</strong><p>Os dados desta tela já estão limitados à produtora vinculada ao usuário. O backend continua validando produtor, evento e permissão em cada requisição.</p></div></section>
 </div>
}
