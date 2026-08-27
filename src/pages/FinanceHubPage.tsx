import type { ComponentType } from 'react'
import { useMemo, useState } from 'react'
import { Search, WalletCards, HandCoins, TrendingUp, ReceiptText, Store, Undo2, ChartNoAxesCombined, Scale, Percent, Brain, ShieldCheck, Calculator, Split, CreditCard, Settings, TrendingDown, PenTool } from 'lucide-react'
import type { PageKey } from '../components/ModuleSidebar'

type Card={title:string;desc:string;icon:ComponentType<{size?:number}>;tone:'blue'|'orange'|'green';page:PageKey}
type Props={onNavigate:(p:PageKey)=>void}

const cash:Card[]=[
 {title:'Saldo Consolidado',desc:'Saldo geral acumulado e exportes rápidos.',icon:WalletCards,tone:'blue',page:'finance'},
 {title:'Solicitar Repasse',desc:'Solicite a transferência para sua conta.',icon:HandCoins,tone:'blue',page:'finance-payouts'},
 {title:'Antecipações',desc:'Antecipe o recebimento de vendas a prazo.',icon:TrendingUp,tone:'blue',page:'finance-advance'},
 {title:'Extrato Geral',desc:'Filtre, pesquise e analise lançamentos.',icon:ReceiptText,tone:'blue',page:'finance-statement'},
 {title:'Pontos de Venda (PDV)',desc:'Gerencie bilheterias físicas e quiosques.',icon:Store,tone:'blue',page:'pos'},
 {title:'Devoluções / Estornos',desc:'Estorne ingressos e gerencie cancelamentos.',icon:Undo2,tone:'blue',page:'finance-refunds'},
]
const advanced:Card[]=[
 {title:'Financeiro Advanced',desc:'Fluxo de caixa previsto, contas a pagar e a receber.',icon:ChartNoAxesCombined,tone:'orange',page:'finance-advance'},
 {title:'Conciliação Bancária',desc:'Concilie divergências de extratos bancários.',icon:Scale,tone:'orange',page:'finance-bank'},
 {title:'Financeiro Spread',desc:'Taxas e adquirentes do ecossistema de vendas.',icon:Percent,tone:'orange',page:'finance-spread'},
 {title:'Inteligência Financeira',desc:'EBITDA, ROI e insights de IA preditivos.',icon:Brain,tone:'orange',page:'finance-intelligence'},
 {title:'Operadoras de Cartão',desc:'Aprovação, adquirentes e taxas de captura.',icon:ShieldCheck,tone:'orange',page:'finance-operators'},
]
const methods:Card[]=[
 {title:'Simulador de Spread',desc:'Simule taxas e planeje o lucro líquido.',icon:Calculator,tone:'green',page:'finance-spread'},
 {title:'Split Financeiro',desc:'Partilha automatizada de receitas com organizadores.',icon:Split,tone:'green',page:'finance-split'},
 {title:'Métodos de Pagamento',desc:'Taxas e prazos de PIX, Crédito, Débito e Boleto.',icon:CreditCard,tone:'green',page:'finance-methods'},
 {title:'Pagamentos Customizados',desc:'Cortesias, permutas e splits personalizados por produtor.',icon:Settings,tone:'green',page:'finance-custom'},
 {title:'Despesas',desc:'Controle de custos diretos e infraestrutura.',icon:TrendingDown,tone:'green',page:'finance-expenses'},
 {title:'Borderô / Assinaturas',desc:'Assinaturas digitais de liquidações.',icon:PenTool,tone:'green',page:'finance-bordero'},
]
export default function FinanceHubPage({onNavigate}:Props){
 const [q,setQ]=useState('')
 const filter=(cards:Card[])=>cards.filter(c=>(c.title+' '+c.desc).toLowerCase().includes(q.toLowerCase()))
 const groups=useMemo(()=>[{title:'OPERAÇÕES DE CAIXA',cards:filter(cash)},{title:'ADVANCED & INTELIGÊNCIA',cards:filter(advanced)},{title:'SIMULADORES, MÉTODOS & LIQUIDAÇÕES',cards:filter(methods)}],[q])
 return <div className="finance-hub">
   <div className="module-search"><Search size={22}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar módulo financeiro..."/></div>
   {groups.map(g=>g.cards.length>0&&<section className="hub-section" key={g.title}><h2>{g.title}</h2><div className="hub-card-grid">{g.cards.map(c=><HubCard key={c.title} card={c} onNavigate={onNavigate}/>)}</div></section>)}
 </div>
}
function HubCard({card,onNavigate}:{card:Card;onNavigate:(p:PageKey)=>void}){const Icon=card.icon;return <button className="hub-card" onClick={()=>onNavigate(card.page)}><span className={`hub-icon ${card.tone}`}><Icon size={25}/></span><span className="hub-card-copy"><strong>{card.title}</strong><small>{card.desc}</small></span></button>}
