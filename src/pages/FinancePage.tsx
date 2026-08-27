import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Banknote, CalendarDays, ChevronRight, CircleDollarSign, CreditCard, Download, Filter, Landmark, ReceiptText, Search, TrendingUp, WalletCards } from 'lucide-react'
import { cashFlow, payouts, transactions, type FinancialTransaction } from '../data/finance'
import type { EventItem } from '../data/events'

type FinanceTab = 'overview' | 'sales' | 'payouts' | 'cashflow' | 'statement'
type Props = { events: EventItem[]; initialTab?: FinanceTab; notify: (message: string) => void }

const money=(v:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v)

export default function FinancePage({events,initialTab='overview',notify}:Props){
  const [tab,setTab]=useState<FinanceTab>(initialTab)
  const [query,setQuery]=useState('')
  const [event,setEvent]=useState('Todos os eventos')
  const [period,setPeriod]=useState('Últimos 30 dias')
  const tx=useMemo(()=>transactions.filter(t=>{
    const matchesQuery=(t.event+' '+t.description+' '+t.type).toLowerCase().includes(query.toLowerCase())
    const matchesEvent=event==='Todos os eventos'||t.event===event
    return matchesQuery&&matchesEvent
  }),[query,event])
  const available=15265.60, receivable=72410.80, sold=148750.00, paid=57546.80
  return <div className="finance-page">
    <div className="page-head finance-head"><div><p className="eyebrow">GESTÃO FINANCEIRA</p><h1>Financeiro</h1><p className="page-subtitle">Acompanhe saldo, vendas, recebimentos, repasses e fluxo de caixa.</p></div><div className="toolbar"><button className="tool-btn" onClick={()=>notify('Relatório financeiro preparado para exportação.')}><Download size={16}/>Exportar</button><button className="primary-btn" onClick={()=>{setTab('payouts');notify('Área de repasses aberta.')}}><Banknote size={16}/>Solicitar repasse</button></div></div>

    <div className="finance-tabs">
      {[['overview','Visão geral'],['sales','Vendas'],['payouts','Repasses'],['cashflow','Fluxo de Caixa'],['statement','Extrato']].map(([key,label])=><button key={key} onClick={()=>setTab(key as FinanceTab)} className={tab===key?'active':''}>{label}</button>)}
    </div>

    <div className="finance-filterbar card-surface">
      <div className="small-search wide"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar pedido, evento ou lançamento..."/></div>
      <select value={event} onChange={e=>setEvent(e.target.value)}><option>Todos os eventos</option>{events.map(e=><option key={e.id}>{e.title}</option>)}</select>
      <select value={period} onChange={e=>setPeriod(e.target.value)}><option>Hoje</option><option>Últimos 7 dias</option><option>Últimos 30 dias</option><option>Este ano</option></select>
      <button className="filter-icon-btn"><Filter size={16}/></button>
    </div>

    {tab==='overview'&&<>
      <div className="finance-kpis">
        <Kpi icon={<WalletCards/>} label="Saldo disponível" value={money(available)} meta="Liberado para repasse" tone="blue"/>
        <Kpi icon={<CalendarDays/>} label="A receber" value={money(receivable)} meta="Próximos 30 dias" tone="cyan"/>
        <Kpi icon={<TrendingUp/>} label="Vendas no período" value={money(sold)} meta="+12,4% vs. período anterior" tone="green"/>
        <Kpi icon={<Landmark/>} label="Total repassado" value={money(paid)} meta="4 repasses concluídos" tone="purple"/>
      </div>
      <div className="finance-grid-main">
        <section className="card-surface finance-chart-card"><div className="card-heading"><div><h2>Receita e saídas</h2><p>Movimentação financeira dos últimos 7 dias</p></div><span className="mini-badge">{period}</span></div><CashFlowChart/></section>
        <section className="card-surface balance-card"><div className="card-heading"><div><h2>Composição do saldo</h2><p>Visão consolidada da carteira</p></div><CircleDollarSign size={20}/></div><div className="balance-big"><span>Saldo total</span><strong>{money(available+receivable)}</strong></div><BalanceLine label="Disponível" value={available} total={available+receivable}/><BalanceLine label="A receber" value={receivable} total={available+receivable}/><div className="balance-footer"><span>Taxas estimadas</span><strong>{money(4820.30)}</strong></div></section>
      </div>
      <section className="card-surface"><div className="table-toolbar"><div><strong>Movimentações recentes</strong><span className="table-subtitle">Últimos lançamentos financeiros</span></div><button className="text-action" onClick={()=>setTab('statement')}>Ver extrato completo <ChevronRight size={15}/></button></div><TransactionsTable rows={tx.slice(0,6)}/></section>
    </>}

    {tab==='sales'&&<section className="card-surface"><div className="section-banner"><div><ReceiptText size={21}/><div><h2>Vendas e recebimentos</h2><p>Controle financeiro dos pedidos aprovados, pendentes e estornados.</p></div></div><div className="compact-metrics"><span><b>{money(148750)}</b> faturamento</span><span><b>428</b> pedidos</span><span><b>{money(347.55)}</b> ticket médio</span></div></div><TransactionsTable rows={tx.filter(t=>t.type==='Venda'||t.type==='Estorno')}/></section>}

    {tab==='payouts'&&<section className="card-surface"><div className="section-banner"><div><Landmark size={21}/><div><h2>Repasses</h2><p>Valores disponíveis, agendados, em processamento e pagos.</p></div></div><button className="primary-btn compact-btn" onClick={()=>notify('Solicitação de repasse simulada com sucesso.')}><Banknote size={15}/>Novo repasse</button></div><PayoutTable notify={notify}/></section>}

    {tab==='cashflow'&&<div className="finance-grid-main cashflow-layout"><section className="card-surface finance-chart-card"><div className="card-heading"><div><h2>Fluxo de Caixa</h2><p>Entradas e saídas consolidadas</p></div><span className="mini-badge">7 dias</span></div><CashFlowChart large/></section><section className="card-surface cash-summary"><h2>Resumo do período</h2><div><ArrowDownLeft/><span>Entradas<strong>{money(cashFlow.reduce((a,b)=>a+b.entry,0))}</strong></span></div><div><ArrowUpRight/><span>Saídas<strong>{money(cashFlow.reduce((a,b)=>a+b.exit,0))}</strong></span></div><div className="net-result"><span>Resultado líquido</span><strong>{money(cashFlow.reduce((a,b)=>a+b.entry-b.exit,0))}</strong></div></section></div>}

    {tab==='statement'&&<section className="card-surface"><div className="section-banner"><div><CreditCard size={21}/><div><h2>Extrato financeiro</h2><p>Histórico completo de entradas, saídas, taxas e estornos.</p></div></div><button className="tool-btn compact-btn" onClick={()=>notify('Extrato exportado.')}><Download size={15}/>Exportar extrato</button></div><TransactionsTable rows={tx}/></section>}
  </div>
}

function Kpi({icon,label,value,meta,tone}:{icon:React.ReactNode,label:string,value:string,meta:string,tone:string}){return <div className="finance-kpi card-surface"><span className={`finance-kpi-icon ${tone}`}>{icon}</span><div><small>{label}</small><strong>{value}</strong><em>{meta}</em></div></div>}

function CashFlowChart({large=false}:{large?:boolean}){const max=Math.max(...cashFlow.flatMap(d=>[d.entry,d.exit]));return <div className={`cash-chart ${large?'large':''}`}><div className="chart-legend"><span><i className="entry-dot"/>Entradas</span><span><i className="exit-dot"/>Saídas</span></div><div className="bar-chart">{cashFlow.map(d=><div className="bar-day" key={d.day}><div className="bar-pair"><i className="entry-bar" style={{height:`${Math.max(8,d.entry/max*100)}%`}} title={money(d.entry)}/><i className="exit-bar" style={{height:`${Math.max(8,d.exit/max*100)}%`}} title={money(d.exit)}/></div><span>{d.day}</span></div>)}</div></div>}
function BalanceLine({label,value,total}:{label:string,value:number,total:number}){return <div className="balance-line"><div><span>{label}</span><b>{money(value)}</b></div><div className="balance-track"><i style={{width:`${value/total*100}%`}}/></div></div>}
function TransactionsTable({rows}:{rows:FinancialTransaction[]}){return <div className="lots-table-wrap"><table className="lots-table finance-table"><thead><tr><th>Data</th><th>Descrição</th><th>Evento</th><th>Forma</th><th>Status</th><th>Valor</th></tr></thead><tbody>{rows.map(t=><tr key={t.id}><td>{t.date}</td><td><div className="transaction-desc"><span className={`transaction-icon ${t.value>=0?'in':'out'}`}>{t.value>=0?<ArrowDownLeft size={14}/>:<ArrowUpRight size={14}/>}</span><div><strong>{t.description}</strong><small>{t.type}</small></div></div></td><td className="event-name-cell">{t.event}</td><td>{t.method}</td><td><span className={`finance-status ${t.status.toLowerCase()}`}>{t.status}</span></td><td className={t.value>=0?'money-positive':'money-negative'}>{t.value>=0?'+ ':''}{money(t.value)}</td></tr>)}</tbody></table></div>}
function PayoutTable({notify}:{notify:(m:string)=>void}){return <div className="lots-table-wrap"><table className="lots-table finance-table"><thead><tr><th>Evento</th><th>Solicitado em</th><th>Previsão</th><th>Bruto</th><th>Taxas</th><th>Líquido</th><th>Status</th><th></th></tr></thead><tbody>{payouts.map(p=><tr key={p.id}><td className="event-name-cell"><strong>{p.event}</strong></td><td>{p.requestedAt}</td><td>{p.scheduledFor}</td><td>{money(p.gross)}</td><td>{money(p.fees)}</td><td><strong>{money(p.net)}</strong></td><td><span className={`finance-status ${p.status.toLowerCase()}`}>{p.status}</span></td><td><button className="text-action" onClick={()=>notify(`Repasse #${p.id} selecionado.`)}>Detalhes</button></td></tr>)}</tbody></table></div>}
