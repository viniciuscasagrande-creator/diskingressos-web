import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { Activity, AlertTriangle, BanknoteArrowDown, BanknoteArrowUp, Brain, Building2, Calculator, ChartNoAxesCombined, CircleDollarSign, CreditCard, FileSpreadsheet, HandCoins, Landmark, Percent, ReceiptText, RefreshCw, Scale, ShieldCheck, Split, Store, TrendingDown, TrendingUp, Undo2, WalletCards, Zap, Settings2, ServerCog, Search, ArrowRight, Clock3, LayoutDashboard, List, LineChart, GitCompareArrows } from 'lucide-react'
import type { EventItem } from '../data/events'
import type { PageKey } from '../components/ModuleSidebar'
import { getFinanceDashboardSummary, type FinanceDashboardSummary } from '../services/api'
import { navigateWithFinanceDrilldown } from '../utils/financeDrilldown'

type Props={events:EventItem[];producerId?:number|null;notify:(m:string)=>void;onNavigate:(p:PageKey)=>void}
type Tone='blue'|'green'|'orange'|'purple'|'cyan'|'red'
type Shortcut={title:string;desc:string;page:PageKey;icon:ComponentType<{size?:number}>;tone:Tone}
const brl=(c?:number|null)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format((c||0)/100)

const base:{title:string;subtitle:string;items:Shortcut[]}[]=[
{title:'OPERAÇÕES DE CAIXA',subtitle:'Rotinas financeiras e saldos do dia a dia',items:[
{title:'Saldo',desc:'Saldo consolidado, disponível, bloqueado e previsto.',page:'finance',icon:WalletCards,tone:'blue'},
{title:'Solicitar Repasse',desc:'Transferências, aprovação, programação e comprovantes.',page:'finance-payouts',icon:HandCoins,tone:'green'},
{title:'Antecipações',desc:'Simule e antecipe recebíveis elegíveis.',page:'finance-advance',icon:Zap,tone:'orange'},
{title:'Extrato',desc:'Entradas, saídas, vendas, taxas e repasses.',page:'finance-statement',icon:ReceiptText,tone:'purple'},
{title:'Despesas',desc:'Custos operacionais e despesas por evento.',page:'finance-expenses',icon:TrendingDown,tone:'red'},
{title:'Contas Bancárias',desc:'Contas para liquidação, PIX e repasses.',page:'finance-bank-accounts',icon:Landmark,tone:'cyan'}]},
{title:'ADVANCED & INTELIGÊNCIA',subtitle:'Conciliação, spread, adquirência e performance',items:[
{title:'Financeiro Advanced',desc:'Caixa, recebíveis, obrigações, liquidez e resultado.',page:'finance-advanced',icon:ChartNoAxesCombined,tone:'purple'},
{title:'Conciliação Bancária',desc:'Banco, PIX, cartão, gateway e divergências.',page:'finance-reconciliation',icon:Scale,tone:'green'},
{title:'Financeiro Spread',desc:'MDR, custos, prazo D+, adquirente e margem.',page:'finance-spread',icon:Percent,tone:'orange'},
{title:'Inteligência Financeira',desc:'Margem, ROI, tendências, alertas e anomalias.',page:'finance-intelligence',icon:Brain,tone:'purple'},
{title:'Operadoras de Cartão',desc:'MDR, aprovação, antecipação e liquidação.',page:'finance-operators',icon:ShieldCheck,tone:'cyan'},
{title:'Gateway de Pagamentos',desc:'Provedores, ambientes, prioridade e validação.',page:'finance-gateways',icon:ServerCog,tone:'blue'}]},
{title:'SIMULADORES, MÉTODOS & LIQUIDAÇÕES',subtitle:'Pagamentos, split, borderô e pontos de venda',items:[
{title:'Simulador de Spread',desc:'Preço, taxas, MDR, parcelamento e lucro líquido.',page:'finance-spread-simulator',icon:Calculator,tone:'orange'},
{title:'Split Financeiro',desc:'Partilha automatizada entre beneficiários.',page:'finance-split',icon:Split,tone:'purple'},
{title:'Métodos de Pagamento',desc:'PIX, crédito, débito, boleto e parcelamento.',page:'finance-methods',icon:CreditCard,tone:'green'},
{title:'Pagamentos Customizados',desc:'Cortesias, permutas e regras especiais.',page:'finance-custom',icon:Settings2,tone:'purple'},
{title:'Borderô',desc:'Demonstrativo, liquidação, assinatura e histórico.',page:'finance-bordero',icon:FileSpreadsheet,tone:'green'},
{title:'Pontos de Venda (PDV)',desc:'Bilheterias físicas, quiosques e terminais.',page:'pos',icon:Store,tone:'cyan'}]},
{title:'CONTROLE & GESTÃO',subtitle:'Recebíveis, obrigações, estornos e relatórios',items:[
{title:'Recebíveis',desc:'Agenda, vencimentos, adquirentes e liquidações.',page:'finance-receivables',icon:BanknoteArrowDown,tone:'green'},
{title:'Contas a Pagar',desc:'Obrigações, vencimentos e programação.',page:'finance-payables',icon:BanknoteArrowUp,tone:'orange'},
{title:'Fluxo de Caixa',desc:'Entradas, saídas e projeção financeira.',page:'finance-cashflow',icon:TrendingUp,tone:'blue'},
{title:'Negociações Financeiras',desc:'Condições comerciais e regras especiais.',page:'finance-negotiations',icon:Building2,tone:'purple'},
{title:'Devoluções / Estornos',desc:'Total/parcial, aprovação e processamento.',page:'finance-refunds',icon:Undo2,tone:'red'},
{title:'Relatórios Financeiros',desc:'Consolidado, filtros e exportações.',page:'finance-reports',icon:FileSpreadsheet,tone:'cyan'}]}]

export default function FinanceCommandCenterPage({events,producerId,notify,onNavigate}:Props){
 const [eventId,setEventId]=useState<number|undefined>();const [loading,setLoading]=useState(true),[error,setError]=useState(''),[q,setQ]=useState('')
 const [summary,setSummary]=useState<FinanceDashboardSummary|null>(null)
 async function load(manual=false){setLoading(true);setError('');try{const data=await getFinanceDashboardSummary(producerId??undefined,eventId);setSummary(data);if(data.health.unavailable.length)setError(`${data.health.unavailable.length} fonte(s) complementar(es) indisponível(is): ${data.health.unavailable.join(', ')}.`);if(manual)notify('Indicadores financeiros atualizados.')}catch(e:any){setError(e?.message||'Não foi possível carregar os indicadores financeiros.');if(manual)notify('Não foi possível atualizar os indicadores financeiros.')}finally{setLoading(false)}}
 useEffect(()=>{load()},[producerId,eventId])
 const groups=useMemo(()=>base.map(g=>({...g,items:g.items.filter(x=>(x.title+' '+x.desc).toLowerCase().includes(q.toLowerCase()))})),[q])
 const selectedEventName=events.find(e=>e.id===eventId)?.title
 const openHubPage=(page:PageKey,label:string,status?:string)=>navigateWithFinanceDrilldown(onNavigate,page,{status,eventName:selectedEventName,source:'finance-dashboard-hub',label})
 return <div className="finance-command">
 <header className="finance-command-hero"><div><span className="finance-command-eyebrow">FINANCEIRO</span><h1>Dashboard Financeiro</h1><p>Controle de saldos, recebíveis, taxas, pagamentos, repasses e liquidações.</p></div><div className="finance-command-actions"><select value={eventId??''} onChange={e=>setEventId(e.target.value?Number(e.target.value):undefined)}><option value="">Todos os eventos</option>{events.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select><button onClick={()=>load(true)}><RefreshCw size={16}/>{loading?'Atualizando...':'Atualizar'}</button><button className="primary" onClick={()=>onNavigate('finance-payouts')}><HandCoins size={16}/>Solicitar Repasse</button></div></header>
 <nav className="finance-hub-nav" aria-label="Navegação interna do Dashboard Financeiro">
   <button className="active" type="button" aria-current="page"><LayoutDashboard size={15}/><span>Visão Geral</span></button>
   <button type="button" onClick={()=>openHubPage('finance','Saldo')}><WalletCards size={15}/><span>Saldo</span></button>
   <button type="button" onClick={()=>openHubPage('finance-statement','Extrato')}><List size={15}/><span>Extrato</span></button>
   <button type="button" onClick={()=>openHubPage('finance-receivables','Recebíveis','open')}><BanknoteArrowDown size={15}/><span>Recebíveis</span></button>
   <button type="button" onClick={()=>openHubPage('finance-payouts','Repasses')}><HandCoins size={15}/><span>Repasses</span></button>
   <button type="button" onClick={()=>openHubPage('finance-cashflow','Fluxo de Caixa')}><LineChart size={15}/><span>Fluxo de Caixa</span></button>
   <button type="button" onClick={()=>openHubPage('finance-reconciliation','Conciliação')}><GitCompareArrows size={15}/><span>Conciliação</span></button>
   <button type="button" onClick={()=>openHubPage('finance-reports','Relatórios')}><FileSpreadsheet size={15}/><span>Relatórios</span></button>
 </nav>
 {error&&<div className="finance-command-warning"><AlertTriangle size={16}/>{error}</div>}
 <section className="finance-command-kpis"><Kpi icon={WalletCards} label="Saldo disponível" value={brl(summary?.availableBalanceCents)} sub="Disponível para operação e repasse" tone="blue" page="finance" onNavigate={onNavigate} eventName={selectedEventName}/><Kpi icon={Clock3} label="Saldo futuro" value={brl(summary?.futureBalanceCents)} sub="Recebíveis e liquidações previstas" tone="green" page="finance-receivables" onNavigate={onNavigate} status="open" eventName={selectedEventName}/><Kpi icon={BanknoteArrowUp} label="A pagar" value={brl(summary?.payablesCents)} sub="Obrigações financeiras em aberto" tone="orange" page="finance-payables" onNavigate={onNavigate} status="open" eventName={selectedEventName}/><Kpi icon={HandCoins} label="Repasses pendentes" value={brl(summary?.pendingPayoutsCents)} sub={`${summary?.pendingPayoutsCount||0} solicitação(ões)`} tone="purple" page="finance-payouts" onNavigate={onNavigate} status="pending" eventName={selectedEventName}/><Kpi icon={Percent} label="Margem média Spread" value={`${((summary?.avgMarginBps||0)/100).toFixed(2)}%`} sub={`${summary?.spreadSimulations||0} simulações persistidas`} tone="cyan" page="finance-spread" onNavigate={onNavigate} eventName={selectedEventName}/><Kpi icon={AlertTriangle} label="Divergências" value={String(summary?.divergences??0)} sub="Itens que exigem conciliação" tone="red" page="finance-reconciliation" onNavigate={onNavigate} status="divergent" eventName={selectedEventName}/></section>
 <section className="finance-command-health"><HealthLink page="finance-gateways" onNavigate={onNavigate}><Activity size={18}/><span><b>{summary?.activeGateways||0}</b> gateways ativos</span></HealthLink><HealthLink page="finance-operators" onNavigate={onNavigate}><ShieldCheck size={18}/><span><b>{summary?.activeAcquirers||0}</b> adquirentes ativas</span></HealthLink><HealthLink page="finance-methods" onNavigate={onNavigate}><CreditCard size={18}/><span><b>{summary?.methods||0}</b> métodos configurados</span></HealthLink><HealthLink page="finance-refunds" onNavigate={onNavigate}><Undo2 size={18}/><span><b>{brl(summary?.refundsCents)}</b> em estornos</span></HealthLink><HealthLink page="finance-receivables" onNavigate={onNavigate} status="open" eventName={selectedEventName}><CircleDollarSign size={18}/><span><b>{brl(summary?.receivablesCents)}</b> em recebíveis</span></HealthLink></section>
 <div className="finance-command-search"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar função financeira..."/></div>
 {groups.map(g=>g.items.length>0&&<section className="finance-command-section" key={g.title}><div className="finance-command-section-head"><div><h2>{g.title}</h2><p>{g.subtitle}</p></div><span>{g.items.length} funções</span></div><div className="finance-command-grid">{g.items.map(i=><Card key={i.title} item={i} onNavigate={onNavigate}/>)}</div></section>)}
 <section className="finance-command-footer"><div><strong>Financeiro e Contabilidade agora são separados</strong><span>Financeiro cuida do dinheiro e liquidações; Contabilidade cuida da escrituração e demonstrações.</span></div><button onClick={()=>onNavigate('accounting-dashboard')}>Abrir Dashboard Contábil <ArrowRight size={16}/></button></section></div>}
function Kpi({icon:Icon,label,value,sub,tone,page,onNavigate,status,eventName}:{icon:any;label:string;value:string;sub:string;tone:Tone;page:PageKey;onNavigate:(p:PageKey)=>void;status?:string;eventName?:string}){const open=()=>navigateWithFinanceDrilldown(onNavigate,page,{status,eventName,source:'finance-dashboard',label});return <article className={`finance-command-kpi ${tone}`} role="button" tabIndex={0} aria-label={`Abrir ${label}`} title={`Abrir ${label}`} onClick={open} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}}}><span className="icon"><Icon size={20}/></span><div><small>{label}</small><strong>{value}</strong><span>{sub}</span></div></article>}
function HealthLink({page,onNavigate,children,status,eventName}:{page:PageKey;onNavigate:(p:PageKey)=>void;children:any;status?:string;eventName?:string}){const open=()=>navigateWithFinanceDrilldown(onNavigate,page,{status,eventName,source:'finance-dashboard'});return <div role="button" tabIndex={0} onClick={open} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}}}>{children}</div>}
function Card({item,onNavigate}:{item:Shortcut;onNavigate:(p:PageKey)=>void}){const Icon=item.icon;return <button className={`finance-command-card ${item.tone}`} onClick={()=>onNavigate(item.page)}><span className="finance-command-card-icon"><Icon size={21}/></span><span className="finance-command-card-copy"><strong>{item.title}</strong><small>{item.desc}</small></span><ArrowRight size={16} className="finance-command-card-arrow"/></button>}
