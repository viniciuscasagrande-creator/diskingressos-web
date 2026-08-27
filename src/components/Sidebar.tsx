import {
  BarChart3, Building2, ScanFace, Ticket, WalletCards, PlusSquare,
  CreditCard, MessageCircle, LockKeyhole, ShieldCheck, Menu,
  ChevronDown, ChevronRight, Settings2, Users, Megaphone, Repeat2,
  LayoutDashboard, ReceiptText, Landmark, LineChart, ScrollText, MonitorSmartphone, ShoppingCart, LockKeyhole as CashLock
} from 'lucide-react'
import { useState } from 'react'

export type PageKey = 'events' | 'new-event' | 'lots' | 'participants' | 'edit-event' | 'facial' | 'event-dashboard' | 'finance' | 'finance-sales' | 'finance-payouts' | 'finance-cashflow' | 'finance-statement' | 'pos' | 'pos-terminals' | 'pos-sales' | 'pos-closing'
type Props = { page: PageKey; onNavigate: (page: PageKey) => void }

const lowerItems = [
  { icon: MessageCircle, label: 'Atendimento / SAC' },{ icon: Megaphone, label: 'Marketing' },
  { icon: Repeat2, label: 'Remarketing' },{ icon: LockKeyhole, label: 'Gerenciar Acessos' },
  { icon: ShieldCheck, label: 'Administração' },{ icon: Menu, label: 'Clube Rua da Música' },
]
export default function Sidebar({page,onNavigate}:Props){
 const [eventsOpen,setEventsOpen]=useState(true); const [financeOpen,setFinanceOpen]=useState(page.startsWith('finance')); const [posOpen,setPosOpen]=useState(page.startsWith('pos'))
 const eventPage=['events','new-event','lots','participants','edit-event','event-dashboard'].includes(page); const financePage=page.startsWith('finance'); const posPage=page.startsWith('pos')
 return <aside className="sidebar"><div className="sidebar-title-row"><h2>Navegação</h2><button className="icon-circle"><Settings2 size={17}/></button></div><p className="menu-caption">MENU PRINCIPAL</p><nav>
 <button className="nav-item"><BarChart3 size={18}/><span>Dashboard</span></button>
 <button className="nav-item"><Building2 size={18}/><span>Dados da Produtora</span></button>
 <button onClick={()=>onNavigate('facial')} className={`nav-item ${page==='facial'?'active-parent':''}`}><ScanFace size={18}/><span>Status Faciais</span></button>
 <button className={`nav-item nav-parent ${eventPage?'active-parent':''}`} onClick={()=>setEventsOpen(v=>!v)}><Ticket size={18}/><span>Eventos</span>{eventsOpen?<ChevronDown size={16}/>:<ChevronRight size={16}/>}</button>
 {eventsOpen&&<div className="submenu"><button onClick={()=>onNavigate('events')} className={`sub-item ${page==='events'||page==='edit-event'||page==='event-dashboard'?'selected':''}`}><span className="sub-dot"/>Todos os Eventos</button><button onClick={()=>onNavigate('new-event')} className={`sub-item ${page==='new-event'?'selected':''}`}><PlusSquare size={15}/>Novo Evento</button><button onClick={()=>onNavigate('lots')} className={`sub-item ${page==='lots'?'selected':''}`}><Settings2 size={15}/>Configurar Lotes</button><button onClick={()=>onNavigate('participants')} className={`sub-item ${page==='participants'?'selected':''}`}><Users size={15}/>Participantes</button></div>}
 <button className={`nav-item nav-parent ${financePage?'active-parent':''}`} onClick={()=>setFinanceOpen(v=>!v)}><WalletCards size={18}/><span>Financeiro</span>{financeOpen?<ChevronDown size={16}/>:<ChevronRight size={16}/>}</button>
 {financeOpen&&<div className="submenu"><button onClick={()=>onNavigate('finance')} className={`sub-item ${page==='finance'?'selected':''}`}><LayoutDashboard size={15}/>Visão Geral</button><button onClick={()=>onNavigate('finance-sales')} className={`sub-item ${page==='finance-sales'?'selected':''}`}><ReceiptText size={15}/>Vendas</button><button onClick={()=>onNavigate('finance-payouts')} className={`sub-item ${page==='finance-payouts'?'selected':''}`}><Landmark size={15}/>Repasses</button><button onClick={()=>onNavigate('finance-cashflow')} className={`sub-item ${page==='finance-cashflow'?'selected':''}`}><LineChart size={15}/>Fluxo de Caixa</button><button onClick={()=>onNavigate('finance-statement')} className={`sub-item ${page==='finance-statement'?'selected':''}`}><ScrollText size={15}/>Extrato</button></div>}
 <button className={`nav-item nav-parent ${posPage?'active-parent':''}`} onClick={()=>setPosOpen(v=>!v)}><CreditCard size={18}/><span>Terminais POS</span>{posOpen?<ChevronDown size={16}/>:<ChevronRight size={16}/>}</button>
 {posOpen&&<div className="submenu"><button onClick={()=>onNavigate('pos')} className={`sub-item ${page==='pos'?'selected':''}`}><LayoutDashboard size={15}/>Visão Geral</button><button onClick={()=>onNavigate('pos-terminals')} className={`sub-item ${page==='pos-terminals'?'selected':''}`}><MonitorSmartphone size={15}/>Terminais</button><button onClick={()=>onNavigate('pos-sales')} className={`sub-item ${page==='pos-sales'?'selected':''}`}><ShoppingCart size={15}/>Vendas Presenciais</button><button onClick={()=>onNavigate('pos-closing')} className={`sub-item ${page==='pos-closing'?'selected':''}`}><CashLock size={15}/>Fechamento de Caixa</button></div>}
 {lowerItems.map(({icon:Icon,label})=><button className="nav-item" key={label}><Icon size={18}/><span>{label}</span></button>)}
 </nav></aside>
}
