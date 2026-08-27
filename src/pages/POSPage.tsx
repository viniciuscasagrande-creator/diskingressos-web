import { useMemo, useState } from 'react'
import { CreditCard, MonitorSmartphone, ReceiptText, CircleDollarSign, Wifi, WifiOff, ShoppingCart, Search, SlidersHorizontal, Printer, CheckCircle2, Clock3, Banknote, Smartphone, XCircle, LockKeyhole, RotateCcw } from 'lucide-react'
import type { EventItem } from '../data/events'

type Tab = 'overview'|'terminals'|'sales'|'closing'
type Props = { events: EventItem[]; initialTab?: Tab; notify:(message:string)=>void }

type Terminal = {id:string;name:string;event:string;operator:string;status:'online'|'offline';battery:number;lastSync:string;sales:number;total:number}
type Sale = {id:string;time:string;terminal:string;event:string;item:string;payment:'Crédito'|'Débito'|'Pix'|'Dinheiro';status:'Aprovada'|'Cancelada'|'Pendente';value:number}

const money=(v:number)=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})

const terminalSeed:Terminal[]=[
 {id:'POS-001',name:'Bilheteria Principal',event:'SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA',operator:'Ana Martins',status:'online',battery:92,lastSync:'Agora',sales:184,total:28460},
 {id:'POS-002',name:'Portão Norte',event:'IRON MAIDEN',operator:'Carlos Souza',status:'online',battery:76,lastSync:'Há 1 min',sales:132,total:21680},
 {id:'POS-003',name:'Bilheteria VIP',event:'Conferência Nacional',operator:'Marina Alves',status:'online',battery:64,lastSync:'Há 2 min',sales:96,total:15480},
 {id:'POS-004',name:'Caixa Externo',event:'SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA',operator:'Paulo Lima',status:'offline',battery:18,lastSync:'Há 38 min',sales:41,total:6120},
]
const salesSeed:Sale[]=[
 {id:'#PDV-92841',time:'16:48',terminal:'POS-001',event:'SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA',item:'Ingresso Inteira',payment:'Crédito',status:'Aprovada',value:180},
 {id:'#PDV-92840',time:'16:45',terminal:'POS-002',event:'IRON MAIDEN',item:'Pista Premium',payment:'Pix',status:'Aprovada',value:350},
 {id:'#PDV-92839',time:'16:42',terminal:'POS-003',event:'Conferência Nacional',item:'Lote 2',payment:'Débito',status:'Aprovada',value:220},
 {id:'#PDV-92838',time:'16:39',terminal:'POS-001',event:'SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA',item:'Meia Entrada',payment:'Dinheiro',status:'Aprovada',value:90},
 {id:'#PDV-92837',time:'16:31',terminal:'POS-004',event:'SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA',item:'Ingresso Inteira',payment:'Crédito',status:'Cancelada',value:180},
]

export default function POSPage({events,initialTab='overview',notify}:Props){
 const [tab,setTab]=useState<Tab>(initialTab)
 const [terminals,setTerminals]=useState(terminalSeed)
 const [sales,setSales]=useState(salesSeed)
 const [query,setQuery]=useState('')
 const [eventFilter,setEventFilter]=useState('Todos')
 const [closingDone,setClosingDone]=useState(false)
 const approved=sales.filter(s=>s.status==='Aprovada')
 const total=approved.reduce((a,b)=>a+b.value,0)
 const online=terminals.filter(t=>t.status==='online').length
 const paymentTotals=useMemo(()=>approved.reduce<Record<string,number>>((acc,s)=>{acc[s.payment]=(acc[s.payment]||0)+s.value;return acc},{}),[sales])
 const filteredSales=sales.filter(s=>(eventFilter==='Todos'||s.event===eventFilter)&&(`${s.id} ${s.terminal} ${s.event} ${s.item}`.toLowerCase().includes(query.toLowerCase())))
 const simulateSale=()=>{const sale:Sale={id:`#PDV-${92842+sales.length}`,time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),terminal:'POS-001',event:events[0]?.title||'Evento',item:'Ingresso Inteira',payment:'Pix',status:'Aprovada',value:180};setSales(v=>[sale,...v]);notify('Venda presencial simulada com sucesso.')}
 const toggleTerminal=(id:string)=>{setTerminals(t=>t.map(x=>x.id===id?{...x,status:x.status==='online'?'offline':'online',lastSync:'Agora'}:x));notify('Status do terminal atualizado.')}
 const tabs:[Tab,string][]=[['overview','Visão Geral'],['terminals','Terminais'],['sales','Vendas Presenciais'],['closing','Fechamento de Caixa']]
 return <>
  <div className="page-head pos-head"><div><p className="eyebrow">OPERAÇÃO PRESENCIAL</p><h1>Terminais POS</h1><p className="page-subtitle">Controle terminais, vendas presenciais e fechamento de caixa dos eventos.</p></div><div className="toolbar"><button className="secondary-btn" onClick={()=>notify('Sincronização solicitada para todos os terminais.')}><RotateCcw size={16}/>Sincronizar</button><button className="primary-btn" onClick={simulateSale}><ShoppingCart size={16}/>Nova venda PDV</button></div></div>
  <div className="finance-tabs">{tabs.map(([key,label])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}</button>)}</div>

  {tab==='overview'&&<>
   <section className="pos-kpis">
    <div className="card-surface pos-kpi"><span className="pos-kpi-icon blue"><CircleDollarSign/></span><div><small>Vendas hoje</small><strong>{money(total)}</strong><em>{approved.length} transações aprovadas</em></div></div>
    <div className="card-surface pos-kpi"><span className="pos-kpi-icon green"><MonitorSmartphone/></span><div><small>Terminais online</small><strong>{online}/{terminals.length}</strong><em>{Math.round(online/terminals.length*100)}% disponíveis</em></div></div>
    <div className="card-surface pos-kpi"><span className="pos-kpi-icon purple"><ReceiptText/></span><div><small>Ticket médio</small><strong>{money(total/Math.max(approved.length,1))}</strong><em>Venda presencial</em></div></div>
    <div className="card-surface pos-kpi"><span className="pos-kpi-icon orange"><Clock3/></span><div><small>Última sincronização</small><strong>Agora</strong><em>3 terminais ativos</em></div></div>
   </section>
   <div className="pos-main-grid">
    <section className="card-surface pos-panel"><div className="card-heading"><div><h2>Terminais em operação</h2><p>Status em tempo real da operação presencial.</p></div><button className="text-action" onClick={()=>setTab('terminals')}>Ver todos</button></div><div className="terminal-list">{terminals.map(t=><div className="terminal-row" key={t.id}><span className={`terminal-status-icon ${t.status}`}>{t.status==='online'?<Wifi/>:<WifiOff/>}</span><div className="terminal-main"><strong>{t.name}</strong><small>{t.id} · {t.operator}</small></div><div><small>Vendas</small><strong>{t.sales}</strong></div><div><small>Total</small><strong>{money(t.total)}</strong></div><span className={`finance-status ${t.status==='online'?'pago':'estornado'}`}>{t.status==='online'?'Online':'Offline'}</span></div>)}</div></section>
    <section className="card-surface pos-panel"><div className="card-heading"><div><h2>Meios de pagamento</h2><p>Distribuição das vendas aprovadas.</p></div></div><div className="payment-list">{(['Crédito','Pix','Débito','Dinheiro'] as const).map((p,i)=>{const v=paymentTotals[p]||0;const pct=total?Math.round(v/total*100):0;return <div className="payment-item" key={p}><div><span className={`payment-icon p${i}`}>{p==='Pix'?<Smartphone/>:p==='Dinheiro'?<Banknote/>:<CreditCard/>}</span><span><b>{p}</b><small>{pct}% do total</small></span></div><strong>{money(v)}</strong><i><b style={{width:`${pct}%`}}/></i></div>})}</div></section>
   </div>
   <section className="card-surface pos-table-card"><div className="section-banner"><div><ReceiptText/><span><h2>Últimas vendas presenciais</h2><p>Transações mais recentes processadas nos terminais.</p></span></div><button className="text-action" onClick={()=>setTab('sales')}>Ver histórico</button></div><SalesTable rows={sales.slice(0,5)}/></section>
  </>}

  {tab==='terminals'&&<section className="card-surface pos-terminal-grid-wrap"><div className="section-banner"><div><MonitorSmartphone/><span><h2>Gerenciamento de terminais</h2><p>Monitore conexão, bateria, operador e volume de vendas.</p></span></div><span className="mini-badge">{online} ONLINE</span></div><div className="pos-terminal-grid">{terminals.map(t=><article className="terminal-card" key={t.id}><div className="terminal-card-top"><span className={`terminal-status-icon ${t.status}`}>{t.status==='online'?<Wifi/>:<WifiOff/>}</span><span className={`finance-status ${t.status==='online'?'pago':'estornado'}`}>{t.status==='online'?'Online':'Offline'}</span></div><h3>{t.name}</h3><p>{t.id} · {t.event}</p><div className="terminal-card-stats"><div><small>Operador</small><strong>{t.operator}</strong></div><div><small>Bateria</small><strong>{t.battery}%</strong></div><div><small>Vendas</small><strong>{t.sales}</strong></div><div><small>Total</small><strong>{money(t.total)}</strong></div></div><div className="terminal-card-footer"><small>Sync: {t.lastSync}</small><button className="secondary-btn compact-btn" onClick={()=>toggleTerminal(t.id)}>{t.status==='online'?'Desconectar':'Reconectar'}</button></div></article>)}</div></section>}

  {tab==='sales'&&<><div className="card-surface pos-filterbar"><div className="search-box"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar pedido, terminal, evento..."/></div><select value={eventFilter} onChange={e=>setEventFilter(e.target.value)}><option>Todos</option>{events.map(e=><option key={e.id}>{e.title}</option>)}</select><button className="filter-icon-btn"><SlidersHorizontal size={15}/></button><button className="secondary-btn"><Printer size={15}/>Exportar</button></div><section className="card-surface pos-table-card"><div className="section-banner"><div><ShoppingCart/><span><h2>Vendas presenciais</h2><p>{filteredSales.length} transações encontradas.</p></span></div><div className="compact-metrics"><span>Total aprovado<b>{money(filteredSales.filter(s=>s.status==='Aprovada').reduce((a,b)=>a+b.value,0))}</b></span></div></div><SalesTable rows={filteredSales}/></section></>}

  {tab==='closing'&&<div className="closing-layout"><section className="card-surface closing-card"><div className="section-banner"><div><LockKeyhole/><span><h2>Fechamento de caixa</h2><p>Consolidação do movimento dos terminais no turno atual.</p></span></div><span className={`finance-status ${closingDone?'pago':'pendente'}`}>{closingDone?'Fechado':'Em aberto'}</span></div><div className="closing-summary"><div><small>Início do turno</small><strong>26/08/2026 · 09:00</strong></div><div><small>Operadores</small><strong>4 operadores</strong></div><div><small>Transações</small><strong>{sales.length}</strong></div><div><small>Total vendido</small><strong>{money(total)}</strong></div></div><div className="closing-payments">{Object.entries(paymentTotals).map(([p,v])=><div key={p}><span>{p}</span><strong>{money(v)}</strong></div>)}</div><div className="closing-total"><span>Valor esperado em caixa</span><strong>{money(total)}</strong></div><div className="closing-actions"><button className="secondary-btn" onClick={()=>notify('Prévia do fechamento impressa.')}><Printer size={16}/>Imprimir prévia</button><button className="primary-btn" disabled={closingDone} onClick={()=>{setClosingDone(true);notify('Caixa fechado e enviado ao Financeiro.')}}><CheckCircle2 size={16}/>{closingDone?'Caixa fechado':'Confirmar fechamento'}</button></div></section><aside className="card-surface closing-side"><h2>Conciliação rápida</h2><div className="reconcile-ok"><CheckCircle2/><strong>Operação conciliada</strong><span>Os valores dos terminais conferem com as transações registradas.</span></div><div className="reconcile-line"><span>Vendas aprovadas</span><b>{approved.length}</b></div><div className="reconcile-line"><span>Canceladas</span><b>{sales.filter(s=>s.status==='Cancelada').length}</b></div><div className="reconcile-line"><span>Pendentes</span><b>{sales.filter(s=>s.status==='Pendente').length}</b></div><div className="reconcile-line"><span>Diferença</span><b className="money-positive">R$ 0,00</b></div></aside></div>}
 </>
}

function SalesTable({rows}:{rows:Sale[]}){return <div className="table-wrap"><table className="data-table finance-table pos-sales-table"><thead><tr><th>Pedido</th><th>Horário</th><th>Terminal</th><th>Evento / Item</th><th>Pagamento</th><th>Status</th><th>Valor</th></tr></thead><tbody>{rows.map(s=><tr key={s.id}><td><strong>{s.id}</strong></td><td>{s.time}</td><td>{s.terminal}</td><td className="event-name-cell"><strong>{s.event}</strong><span className="table-subtitle">{s.item}</span></td><td>{s.payment}</td><td><span className={`finance-status ${s.status==='Aprovada'?'pago':s.status==='Cancelada'?'estornado':'pendente'}`}>{s.status==='Aprovada'?<CheckCircle2 size={11}/>:s.status==='Cancelada'?<XCircle size={11}/>:<Clock3 size={11}/>} {s.status}</span></td><td className={s.status==='Cancelada'?'money-negative':'money-positive'}>{money(s.value)}</td></tr>)}</tbody></table></div>}
