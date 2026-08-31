import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { Activity, AlertTriangle, BanknoteArrowDown, BanknoteArrowUp, Brain, Building2, Calculator, ChartNoAxesCombined, CircleDollarSign, CreditCard, FileSpreadsheet, HandCoins, Landmark, Percent, ReceiptText, RefreshCw, Scale, ShieldCheck, Split, Store, TrendingDown, TrendingUp, Undo2, WalletCards, Zap, Settings2, ServerCog, Search, ArrowRight, Clock3 } from 'lucide-react'
import type { EventItem } from '../data/events'
import type { PageKey } from '../components/ModuleSidebar'
import { getFinanceBalance, getFinanceAccountingSummary, getFinancePaymentsSummary, getFinanceOperations360Summary, getFinanceSettlementSummary, getFinanceDisputesSummary, type FinanceAccountingSummary, type FinancePaymentsSummary, type FinanceOperations360Summary, type FinanceSettlementSummary, type FinanceDisputesSummary } from '../services/api'

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

export default function FinanceCommandCenterPage({events,producerId,onNavigate}:Props){
 const [eventId,setEventId]=useState<number|undefined>();const [loading,setLoading]=useState(true),[error,setError]=useState(''),[q,setQ]=useState('')
 const [balance,setBalance]=useState<{entriesCents:number;exitsCents:number;balanceCents:number}|null>(null)
 const [acct,setAcct]=useState<FinanceAccountingSummary|null>(null),[pay,setPay]=useState<FinancePaymentsSummary|null>(null),[ops,setOps]=useState<FinanceOperations360Summary|null>(null),[settle,setSettle]=useState<FinanceSettlementSummary|null>(null),[disp,setDisp]=useState<FinanceDisputesSummary|null>(null)
 async function load(){setLoading(true);setError('');const r=await Promise.allSettled([getFinanceBalance(producerId??undefined),getFinanceAccountingSummary(producerId??undefined,eventId),getFinancePaymentsSummary(producerId??undefined),getFinanceOperations360Summary(producerId??undefined,eventId),getFinanceSettlementSummary(producerId??undefined,eventId),getFinanceDisputesSummary(producerId??undefined,eventId)]);if(r[0].status==='fulfilled')setBalance(r[0].value);if(r[1].status==='fulfilled')setAcct(r[1].value);if(r[2].status==='fulfilled')setPay(r[2].value);if(r[3].status==='fulfilled')setOps(r[3].value);if(r[4].status==='fulfilled')setSettle(r[4].value);if(r[5].status==='fulfilled')setDisp(r[5].value);const f=r.filter(x=>x.status==='rejected').length;if(f)setError(f===r.length?'Não foi possível carregar os indicadores financeiros.':`${f} fonte(s) financeira(s) indisponível(is).`);setLoading(false)}
 useEffect(()=>{load()},[producerId,eventId])
 const available=settle?.availableBalanceCents??balance?.balanceCents??0,future=settle?.futureBalanceCents??acct?.receivablesCents??0,payable=acct?.payablesCents??0
 const groups=useMemo(()=>base.map(g=>({...g,items:g.items.filter(x=>(x.title+' '+x.desc).toLowerCase().includes(q.toLowerCase()))})),[q])
 return <div className="finance-command">
 <header className="finance-command-hero"><div><span className="finance-command-eyebrow">FINANCEIRO</span><h1>Dashboard Financeiro</h1><p>Controle de saldos, recebíveis, taxas, pagamentos, repasses e liquidações.</p></div><div className="finance-command-actions"><select value={eventId??''} onChange={e=>setEventId(e.target.value?Number(e.target.value):undefined)}><option value="">Todos os eventos</option>{events.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select><button onClick={load}><RefreshCw size={16}/>{loading?'Atualizando...':'Atualizar'}</button><button className="primary" onClick={()=>onNavigate('finance-payouts')}><HandCoins size={16}/>Solicitar Repasse</button></div></header>
 {error&&<div className="finance-command-warning"><AlertTriangle size={16}/>{error}</div>}
 <section className="finance-command-kpis"><Kpi icon={WalletCards} label="Saldo disponível" value={brl(available)} sub="Disponível para operação e repasse" tone="blue"/><Kpi icon={Clock3} label="Saldo futuro" value={brl(future)} sub="Recebíveis e liquidações previstas" tone="green"/><Kpi icon={BanknoteArrowUp} label="A pagar" value={brl(payable)} sub="Obrigações financeiras em aberto" tone="orange"/><Kpi icon={HandCoins} label="Repasses pendentes" value={brl(settle?.pendingPayoutsCents)} sub={`${settle?.pendingPayoutsCount||0} solicitação(ões)`} tone="purple"/><Kpi icon={Percent} label="Margem média Spread" value={`${((ops?.spread.avgMarginBps||0)/100).toFixed(2)}%`} sub={`${ops?.spread.simulations||0} simulações persistidas`} tone="cyan"/><Kpi icon={AlertTriangle} label="Divergências" value={String(ops?.reconciliation.divergences??acct?.divergences??0)} sub="Itens que exigem conciliação" tone="red"/></section>
 <section className="finance-command-health"><div><Activity size={18}/><span><b>{pay?.activeGateways||0}</b> gateways ativos</span></div><div><ShieldCheck size={18}/><span><b>{pay?.activeAcquirers||0}</b> adquirentes ativas</span></div><div><CreditCard size={18}/><span><b>{pay?.methods||0}</b> métodos configurados</span></div><div><Undo2 size={18}/><span><b>{brl(disp?.totalRequestedRefundCents)}</b> em estornos</span></div><div><CircleDollarSign size={18}/><span><b>{brl(ops?.receivables.dueCents)}</b> em recebíveis</span></div></section>
 <div className="finance-command-search"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar função financeira..."/></div>
 {groups.map(g=>g.items.length>0&&<section className="finance-command-section" key={g.title}><div className="finance-command-section-head"><div><h2>{g.title}</h2><p>{g.subtitle}</p></div><span>{g.items.length} funções</span></div><div className="finance-command-grid">{g.items.map(i=><Card key={i.title} item={i} onNavigate={onNavigate}/>)}</div></section>)}
 <section className="finance-command-footer"><div><strong>Financeiro e Contabilidade agora são separados</strong><span>Financeiro cuida do dinheiro e liquidações; Contabilidade cuida da escrituração e demonstrações.</span></div><button onClick={()=>onNavigate('accounting-dashboard')}>Abrir Dashboard Contábil <ArrowRight size={16}/></button></section></div>}
function Kpi({icon:Icon,label,value,sub,tone}:{icon:any;label:string;value:string;sub:string;tone:Tone}){return <article className={`finance-command-kpi ${tone}`}><span className="icon"><Icon size={20}/></span><div><small>{label}</small><strong>{value}</strong><span>{sub}</span></div></article>}
function Card({item,onNavigate}:{item:Shortcut;onNavigate:(p:PageKey)=>void}){const Icon=item.icon;return <button className={`finance-command-card ${item.tone}`} onClick={()=>onNavigate(item.page)}><span className="finance-command-card-icon"><Icon size={21}/></span><span className="finance-command-card-copy"><strong>{item.title}</strong><small>{item.desc}</small></span><ArrowRight size={16} className="finance-command-card-arrow"/></button>}
