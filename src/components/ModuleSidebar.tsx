import type { ComponentType } from 'react'
import { canAccess, type AppUser } from '../auth/model'
import {
  ArrowLeft, WalletCards, HandCoins, TrendingUp, ReceiptText, TrendingDown, Landmark, PenTool, Scale,
  ChartNoAxesCombined, Split, Brain, CreditCard, Settings, ShieldCheck, LayoutDashboard, Ticket,
  PlusSquare, SlidersHorizontal, Users, ScanFace, BarChart3, CircleGauge, MonitorSmartphone, ShoppingCart,
  LockKeyhole, MessageCircle, Megaphone, Repeat2, Building2, ChevronRight, UserCog, ScrollText,
  Mail, Tags, Bot, Target, QrCode, UsersRound, ShoppingBag, GitBranch, CreditCard as CreditCardIcon, UserRoundCheck, Headphones, Clock3, BookOpen, Link2, FileBarChart
} from 'lucide-react'

export type ModuleKey='events'|'finance'|'pos'|'facial'|'admin'|'marketing'|'remarketing'|'sac'
export type PageKey =
  | 'profile-dashboard'|'global-dashboard'|'events'|'operations'|'new-event'|'lots'|'participants'|'edit-event'|'event-dashboard'
  | 'event-tickets'|'event-courtesy'|'event-reports'|'event-details'|'event-pixel'|'event-utm'|'event-ga4'|'event-traffic'|'event-meta-ads'|'event-remarketing'|'event-users'|'event-audit'|'event-permissions'
  | 'facial'
  | 'finance-hub'|'finance'|'finance-sales'|'finance-payouts'|'finance-cashflow'|'finance-statement'
  | 'finance-advance'|'finance-split'|'finance-intelligence'|'finance-methods'|'finance-custom'|'finance-operators'
  | 'finance-bank'|'finance-spread'|'finance-expenses'|'finance-bordero'|'finance-negotiations'|'finance-refunds'
  | 'pos'|'pos-terminals'|'pos-sales'|'pos-closing'
  | 'admin-hub'|'admin-users'|'admin-producers'|'admin-permissions'|'admin-audit'|'admin-security'
  | 'marketing-hub'|'marketing-dashboard'|'marketing-campaigns'|'marketing-create'|'marketing-automations'|'marketing-whatsapp'|'marketing-email'|'marketing-coupons'|'marketing-links'|'marketing-affiliates'|'marketing-tracking'|'marketing-communications'|'marketing-reports'
  | 'remarketing-hub'|'remarketing-dashboard'|'remarketing-carts'|'remarketing-audiences'|'remarketing-segments'|'remarketing-flows'|'remarketing-whatsapp'|'remarketing-email'|'remarketing-payments'|'remarketing-inactive'|'remarketing-postevent'|'remarketing-automation'|'remarketing-reports'
  | 'sac-hub'|'sac-dashboard'|'sac-tickets'|'sac-new'|'sac-sla'|'sac-integrations'|'sac-knowledge'|'sac-reports'

type Props={module:ModuleKey;page:PageKey;onNavigate:(p:PageKey)=>void;onHome:()=>void;canAdmin?:boolean;user?:AppUser}
type Item={key:PageKey;label:string;icon:ComponentType<{size?:number}>}
const financeMain:Item[]=[
 {key:'profile-dashboard',label:'Meu Dashboard',icon:LayoutDashboard}, {key:'finance-hub',label:'Hub Financeiro',icon:WalletCards},{key:'finance',label:'Saldo Consolidado',icon:WalletCards},
 {key:'finance-payouts',label:'Solicitações de Repasse',icon:HandCoins},{key:'finance-advance',label:'Antecipações',icon:TrendingUp},
 {key:'finance-statement',label:'Extrato Detalhado',icon:ReceiptText},{key:'finance-expenses',label:'Despesas',icon:TrendingDown},
 {key:'finance-bank',label:'Contas Bancárias',icon:Landmark},{key:'finance-bordero',label:'Borderô',icon:PenTool},
 {key:'finance-negotiations',label:'Negociações',icon:Scale},
]
const financeAdvanced:Item[]=[
 {key:'finance-advance',label:'Financeiro Advanced',icon:ChartNoAxesCombined},{key:'finance-split',label:'Split Financeiro',icon:Split},
 {key:'finance-intelligence',label:'Inteligência Financ.',icon:Brain},{key:'finance-methods',label:'Métodos de Pagamento',icon:CreditCard},
 {key:'finance-custom',label:'Pagam. Customizados',icon:Settings},{key:'finance-operators',label:'Operadoras de Cartão',icon:ShieldCheck},
]
const eventMain:Item[]=[
 {key:'profile-dashboard',label:'Meu Dashboard',icon:LayoutDashboard},
 {key:'events',label:'Todos os Eventos',icon:Ticket},
 {key:'operations',label:'Núcleo Operacional',icon:ChartNoAxesCombined},
 {key:'new-event',label:'Novo Evento',icon:PlusSquare},{key:'lots',label:'Configurar Lotes',icon:SlidersHorizontal},
 {key:'participants',label:'Participantes',icon:Users},{key:'facial',label:'Status Faciais',icon:ScanFace},
]
const eventAdvanced:Item[]=[]
const adminMain:Item[]=[
 {key:'global-dashboard',label:'Visão Geral',icon:LayoutDashboard},
 {key:'admin-hub',label:'Central Administrativa',icon:LayoutDashboard},{key:'admin-users',label:'Usuários e Acessos',icon:UserCog},
 {key:'admin-producers',label:'Produtoras',icon:Building2},{key:'admin-permissions',label:'Perfis e Permissões',icon:ShieldCheck},
 {key:'admin-audit',label:'Logs de Auditoria',icon:ScrollText},{key:'admin-security',label:'Segurança',icon:LockKeyhole},
]

const marketingMain:Item[]=[
 {key:'profile-dashboard',label:'Meu Dashboard',icon:LayoutDashboard}, {key:'marketing-hub',label:'Hub Marketing',icon:Megaphone},{key:'marketing-dashboard',label:'Dashboard',icon:LayoutDashboard},
 {key:'marketing-campaigns',label:'Campanhas',icon:Target},{key:'marketing-create',label:'Criar Campanha',icon:PlusSquare},
 {key:'marketing-automations',label:'Automações',icon:Bot},{key:'marketing-whatsapp',label:'WhatsApp',icon:MessageCircle},
 {key:'marketing-email',label:'E-mail Marketing',icon:Mail},{key:'marketing-coupons',label:'Cupons e Promoções',icon:Tags},
 {key:'marketing-links',label:'Links, UTMs e QR Codes',icon:QrCode},{key:'marketing-affiliates',label:'Afiliados e Parceiros',icon:UsersRound},{key:'marketing-communications',label:'Integrações de Comunicação',icon:MessageCircle},
]
const marketingAdvanced:Item[]=[{key:'marketing-tracking',label:'Pixel & Analytics',icon:BarChart3},{key:'marketing-reports',label:'Relatórios',icon:ReceiptText}]
const remarketingMain:Item[]=[
 {key:'remarketing-hub',label:'Hub Remarketing',icon:Repeat2},{key:'remarketing-dashboard',label:'Dashboard',icon:LayoutDashboard},
 {key:'remarketing-carts',label:'Carrinhos Abandonados',icon:ShoppingBag},{key:'remarketing-audiences',label:'Públicos',icon:UsersRound},
 {key:'remarketing-segments',label:'Segmentações',icon:Target},{key:'remarketing-flows',label:'Fluxos de Recuperação',icon:GitBranch},
]
const remarketingChannels:Item[]=[
 {key:'remarketing-whatsapp',label:'WhatsApp Remarketing',icon:MessageCircle},{key:'remarketing-email',label:'E-mail Remarketing',icon:Mail},
 {key:'remarketing-payments',label:'Recup. de Pagamento',icon:CreditCardIcon},
]
const remarketingAutomation:Item[]=[
 {key:'remarketing-inactive',label:'Clientes Inativos',icon:UserRoundCheck},{key:'remarketing-postevent',label:'Pós-Evento',icon:Ticket},
 {key:'remarketing-automation',label:'Remarketing Automático',icon:Bot},{key:'remarketing-reports',label:'Relatórios',icon:ReceiptText},
]


const sacMain:Item[]=[
 {key:'profile-dashboard',label:'Meu Dashboard',icon:LayoutDashboard}, {key:'sac-hub',label:'Hub de Atendimento',icon:Headphones},{key:'sac-dashboard',label:'Dashboard SAC',icon:LayoutDashboard},
 {key:'sac-tickets',label:'Chamados',icon:Ticket},{key:'sac-new',label:'Abrir Chamado',icon:PlusSquare},
 {key:'sac-sla',label:'SLA & ITIL',icon:Clock3},{key:'sac-integrations',label:'Integrações',icon:Link2},
 {key:'sac-knowledge',label:'Base de Conhecimento',icon:BookOpen},{key:'sac-reports',label:'Relatórios',icon:FileBarChart},
]

const posMain:Item[]=[{key:'profile-dashboard',label:'Meu Dashboard',icon:LayoutDashboard},{key:'pos',label:'Hub POS / PDV',icon:LayoutDashboard},{key:'pos-terminals',label:'Terminais',icon:MonitorSmartphone},{key:'pos-sales',label:'Vendas Presenciais',icon:ShoppingCart},{key:'pos-closing',label:'Fechamento de Caixa',icon:LockKeyhole}]

export default function ModuleSidebar({module,page,onNavigate,onHome,canAdmin=true,user}:Props){
  let main=module==='finance'?financeMain:module==='pos'?posMain:module==='admin'?adminMain:module==='marketing'?marketingMain:module==='remarketing'?remarketingMain:module==='sac'?sacMain:eventMain
  if(module==='events'&&user&&user.role!=='producer-admin'&&user.role!=='admin-master'&&user.role!=='admin'){main=main.filter(it=>!['new-event','lots'].includes(it.key))}
  const advanced=module==='finance'?financeAdvanced:module==='events'?eventAdvanced:module==='marketing'?marketingAdvanced:[]
  return <aside className="module-sidebar">
    <button className="back-module" onClick={onHome}><ArrowLeft size={20}/><span>Voltar</span><i><ArrowLeft size={15}/><ChevronRight size={15}/></i></button>
    <nav className="module-nav">
      {main.map((it,index)=><NavItem key={`${it.key}-${index}`} item={it} active={page===it.key || (it.key==='events'&&['edit-event','event-dashboard'].includes(page))} onNavigate={onNavigate}/>) }
      {advanced.length>0&&<><div className="nav-divider"/><p className="module-caption">OPERAÇÕES AVANÇADAS</p>{advanced.map((it,index)=><NavItem key={`${it.key}-${index}`} item={it} active={page===it.key} onNavigate={onNavigate}/>)}</>}
      {module==='remarketing'&&<><div className="nav-divider"/><p className="module-caption">CANAIS</p>{remarketingChannels.map((it,index)=><NavItem key={`${it.key}-c-${index}`} item={it} active={page===it.key} onNavigate={onNavigate}/>)}<div className="nav-divider"/><p className="module-caption">AUTOMAÇÕES</p>{remarketingAutomation.map((it,index)=><NavItem key={`${it.key}-a-${index}`} item={it} active={page===it.key} onNavigate={onNavigate}/>)}</>}
      {module!=='finance'&&module!=='admin'&&module!=='marketing'&&module!=='remarketing'&&module!=='sac'&&<><div className="nav-divider"/><p className="module-caption">ACESSOS RÁPIDOS</p>{(!user||canAccess(user,'finance'))&&<button className="module-nav-item" onClick={()=>onNavigate('finance-hub')}><WalletCards size={19}/><span>Financeiro</span></button>}{(!user||canAccess(user,'pos'))&&<button className="module-nav-item" onClick={()=>onNavigate('pos')}><MonitorSmartphone size={19}/><span>Terminais POS</span></button>}{(!user||canAccess(user,'sac'))&&<button className="module-nav-item" onClick={()=>onNavigate('sac-hub')}><MessageCircle size={19}/><span>Atendimento / SAC</span></button>}{(!user||canAccess(user,'marketing'))&&<button className="module-nav-item" onClick={()=>onNavigate('marketing-hub')}><Megaphone size={19}/><span>Marketing</span></button>}{(!user||canAccess(user,'remarketing'))&&<button className="module-nav-item" onClick={()=>onNavigate('remarketing-hub')}><Repeat2 size={19}/><span>Remarketing</span></button>}{canAdmin&&<button className="module-nav-item" onClick={()=>onNavigate('admin-hub')}><Building2 size={19}/><span>Administração</span></button>}</>}
    </nav>
  </aside>
}
function NavItem({item,active,onNavigate}:{item:Item;active:boolean;onNavigate:(p:PageKey)=>void}){const Icon=item.icon;return <button className={`module-nav-item ${active?'active':''}`} onClick={()=>onNavigate(item.key)}><Icon size={20}/><span>{item.label}</span></button>}
