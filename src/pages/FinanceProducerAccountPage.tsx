import { useMemo, useState, type CSSProperties } from 'react'
import { ArrowLeft, ArrowUpRight, Banknote, CalendarDays, CheckCircle2, CircleDollarSign, Clock3, Download, HandCoins, LockKeyhole, RefreshCw, ShieldCheck, TrendingUp, WalletCards } from 'lucide-react'
import type { EventItem } from '../data/events'
import { eventBalances, financeSummary } from '../data/finance'
import type { PageKey } from '../components/ModuleSidebar'
import './finance-producer-account.css'

type Props = { events: EventItem[]; producerId?: number | null; notify: (message:string)=>void; onNavigate:(page:PageKey)=>void }
const brl=(v:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v)
const pct=(v:number)=>`${v.toFixed(1).replace('.',',')}%`

export default function FinanceProducerAccountPage({events, notify, onNavigate}:Props){
  const [eventId,setEventId]=useState('all')
  const [period,setPeriod]=useState('30d')
  const [updatedAt,setUpdatedAt]=useState(new Date())
  const rows=useMemo(()=>eventBalances.filter(x=>eventId==='all'||String(x.eventId)===eventId),[eventId])
  const totals=useMemo(()=>rows.reduce((a,b)=>({gross:a.gross+b.grossSales,fees:a.fees+b.fees,available:a.available+b.available,receivable:a.receivable+b.receivable,blocked:a.blocked+b.blocked,paid:a.paid+b.paidOut}),{gross:0,fees:0,available:0,receivable:0,blocked:0,paid:0}),[rows])
  const committed=Math.max(0, totals.gross-totals.fees-totals.available-totals.receivable-totals.blocked-totals.paid)
  const base=Math.max(1, totals.available+totals.receivable+totals.blocked+totals.paid+committed)
  const donut=[
    {label:'Disponível',value:totals.available,cls:'available'},
    {label:'A liquidar',value:totals.receivable,cls:'receivable'},
    {label:'Reserva',value:totals.blocked,cls:'blocked'},
    {label:'Já repassado',value:totals.paid,cls:'paid'},
  ]
  const points=[42,55,48,64,72,67,84,79,92,88,101,112]
  const line=points.map((p,i)=>`${(i/(points.length-1))*100},${120-p}`).join(' ')
  const availablePct=(totals.available/base)*100
  const receivablePct=(totals.receivable/base)*100
  const blockedPct=(totals.blocked/base)*100

  const refresh=()=>{setUpdatedAt(new Date());notify('Conta gráfica atualizada a partir do Ledger financeiro.')}
  const exportCsv=()=>{
    const lines=['Evento;Produtor;Bruto;Taxas;Disponível;A receber;Reserva;Repassado',...rows.map(r=>[r.eventName,r.producer,r.grossSales,r.fees,r.available,r.receivable,r.blocked,r.paidOut].join(';'))]
    const blob=new Blob(['\uFEFF'+lines.join('\n')],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='conta_grafica_produtor.csv';a.click();URL.revokeObjectURL(url);notify('Demonstrativo da conta gráfica exportado.')
  }

  return <div className="producer-account" data-finance-release="25.3-producer-ledger-account-2026-09-02">
    <div className="producer-account-topline">
      <button onClick={()=>onNavigate('finance-dashboard')}><ArrowLeft size={15}/> Dashboard Financeiro</button>
      <div className="producer-account-actions"><select value={period} onChange={e=>setPeriod(e.target.value)}><option value="7d">7 dias</option><option value="30d">30 dias</option><option value="90d">90 dias</option><option value="12m">12 meses</option></select><button onClick={exportCsv}><Download size={15}/> Exportar</button><button className="primary" onClick={refresh}><RefreshCw size={15}/> Atualizar</button></div>
    </div>

    <header className="producer-account-hero">
      <div><span className="eyebrow">FASE 25.3 · CONTA GRÁFICA DO PRODUTOR</span><h1>Saldo do Produtor</h1><p>Visão financeira derivada do Ledger: disponível, a liquidar, reservado, comprometido e já repassado — sem edição manual de saldo.</p></div>
      <div className="hero-context"><span>Evento</span><select value={eventId} onChange={e=>setEventId(e.target.value)}><option value="all">Todos os eventos</option>{events.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select><small><CheckCircle2 size={13}/> Atualizado {updatedAt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</small></div>
    </header>

    <section className="producer-kpi-grid">
      <Kpi icon={WalletCards} label="Saldo disponível" value={brl(totals.available||financeSummary.availableBalance)} sub="Liberado para repasse" tone="blue"/>
      <Kpi icon={Clock3} label="A liquidar" value={brl(totals.receivable||financeSummary.receivable)} sub="Recebíveis futuros" tone="green"/>
      <Kpi icon={ShieldCheck} label="Reserva financeira" value={brl(totals.blocked||financeSummary.blockedBalance)} sub="Garantias e retenções" tone="orange"/>
      <Kpi icon={HandCoins} label="Já repassado" value={brl(totals.paid)} sub="Liquidações concluídas" tone="purple"/>
    </section>

    <section className="producer-visual-grid">
      <article className="pa-card pa-composition"><div className="pa-card-head"><div><span>COMPOSIÇÃO DA CONTA</span><h2>Onde está o dinheiro</h2></div><CircleDollarSign size={20}/></div><div className="donut-wrap"><div className="donut" style={{'--a':`${availablePct*3.6}deg`,'--b':`${(availablePct+receivablePct)*3.6}deg`,'--c':`${(availablePct+receivablePct+blockedPct)*3.6}deg`} as CSSProperties}><div><strong>{brl(totals.available)}</strong><small>disponível</small></div></div><div className="donut-legend">{donut.map(x=><div key={x.label}><i className={x.cls}/><span>{x.label}</span><strong>{brl(x.value)}</strong><small>{pct((x.value/base)*100)}</small></div>)}</div></div></article>

      <article className="pa-card pa-trend"><div className="pa-card-head"><div><span>EVOLUÇÃO DO SALDO</span><h2>Saldo disponível</h2></div><TrendingUp size={20}/></div><div className="trend-number"><strong>{brl(totals.available)}</strong><span><ArrowUpRight size={14}/> +12,8% no período</span></div><svg viewBox="0 0 100 44" preserveAspectRatio="none" className="line-chart" aria-label="Evolução gráfica do saldo"><defs><linearGradient id="paFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity=".28"/><stop offset="100%" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs><polygon points={`0,44 ${line} 100,44`} fill="url(#paFill)"/><polyline points={line} fill="none" stroke="currentColor" strokeWidth="1.6" vectorEffect="non-scaling-stroke"/></svg><div className="chart-axis"><span>Início</span><span>{period==='12m'?'12 meses':'Hoje'}</span></div></article>
    </section>

    <section className="producer-visual-grid second">
      <article className="pa-card pa-waterfall"><div className="pa-card-head"><div><span>FORMAÇÃO DO SALDO</span><h2>Da venda ao disponível</h2></div><Banknote size={20}/></div><div className="waterfall">
        <Flow label="Vendas brutas" value={totals.gross} max={totals.gross} cls="gross"/>
        <Flow label="Taxas e custos" value={-totals.fees} max={totals.gross} cls="negative"/>
        <Flow label="A liquidar" value={-totals.receivable} max={totals.gross} cls="pending"/>
        <Flow label="Reservas" value={-totals.blocked} max={totals.gross} cls="reserve"/>
        <Flow label="Disponível" value={totals.available} max={totals.gross} cls="available"/>
      </div></article>

      <article className="pa-card pa-health"><div className="pa-card-head"><div><span>SAÚDE FINANCEIRA</span><h2>Indicadores do produtor</h2></div><ShieldCheck size={20}/></div><div className="health-score"><div className="score-ring"><strong>92</strong><small>/100</small></div><div><b>Conta saudável</b><p>Liquidez alta, reservas dentro da política e baixa exposição financeira.</p></div></div><div className="health-bars"><Metric label="Liquidez" value={94}/><Metric label="Cobertura de reservas" value={88}/><Metric label="Regularidade de repasses" value={96}/><Metric label="Risco de estorno" value={91}/></div></article>
    </section>

    <section className="pa-card bucket-card"><div className="pa-card-head"><div><span>BUCKETS FINANCEIROS</span><h2>Disponibilidade do saldo</h2></div><CalendarDays size={20}/></div><div className="bucket-grid"><Bucket label="Disponível agora" value={totals.available} hint="D+0 / liberado" cls="now"/><Bucket label="Liquida em D+7" value={totals.receivable*.38} hint="cartão + PIX" cls="d7"/><Bucket label="Liquida em D+15" value={totals.receivable*.31} hint="parcelas previstas" cls="d15"/><Bucket label="Liquida em D+30+" value={totals.receivable*.31} hint="agenda futura" cls="d30"/><Bucket label="Em reserva" value={totals.blocked} hint="política de risco" cls="reserve"/></div></section>

    <section className="pa-card producer-ledger-table"><div className="pa-card-head"><div><span>CONTA GRÁFICA POR EVENTO</span><h2>Demonstrativo consolidado</h2></div><LockKeyhole size={20}/></div><div className="table-scroll"><table><thead><tr><th>Evento / produtor</th><th>Vendas brutas</th><th>Taxas</th><th>A liquidar</th><th>Reserva</th><th>Disponível</th><th>Repassado</th></tr></thead><tbody>{rows.map(r=><tr key={r.eventId}><td><strong>{r.eventName}</strong><small>{r.producer}</small></td><td>{brl(r.grossSales)}</td><td className="neg">-{brl(r.fees)}</td><td>{brl(r.receivable)}</td><td>{brl(r.blocked)}</td><td className="pos">{brl(r.available)}</td><td>{brl(r.paidOut)}</td></tr>)}</tbody></table></div><footer><span><LockKeyhole size={13}/> Saldo calculado a partir do Ledger. Ajustes somente por lançamentos compensatórios auditáveis.</span><button onClick={()=>onNavigate('finance-payouts')}>Solicitar repasse <ArrowUpRight size={14}/></button></footer></section>
  </div>
}

function Kpi({icon:Icon,label,value,sub,tone}:{icon:any;label:string;value:string;sub:string;tone:string}){return <article className={`pa-kpi ${tone}`}><span className="pa-kpi-icon"><Icon size={20}/></span><div><small>{label}</small><strong>{value}</strong><span>{sub}</span></div></article>}
function Flow({label,value,max,cls}:{label:string;value:number;max:number;cls:string}){const width=Math.max(8,Math.min(100,Math.abs(value)/Math.max(1,max)*100));return <div className="flow-row"><div><span>{label}</span><strong>{value<0?'- ':''}{brl(Math.abs(value))}</strong></div><div className="flow-track"><i className={cls} style={{width:`${width}%`}}/></div></div>}
function Metric({label,value}:{label:string;value:number}){return <div className="metric"><div><span>{label}</span><strong>{value}%</strong></div><div><i style={{width:`${value}%`}}/></div></div>}
function Bucket({label,value,hint,cls}:{label:string;value:number;hint:string;cls:string}){return <div className={`bucket ${cls}`}><span>{label}</span><strong>{brl(value)}</strong><small>{hint}</small></div>}
