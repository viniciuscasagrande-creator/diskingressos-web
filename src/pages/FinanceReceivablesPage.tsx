import { useMemo, useState } from 'react'
import { consumeFinanceDrilldown } from '../utils/financeDrilldown'
import {
  ArrowDownLeft, CreditCard, Search, Filter, Download, Zap, Eye,
  CheckCircle2, Clock, Calendar, AlertCircle, X, ShieldCheck, ArrowLeft,
  TrendingUp, Landmark, CircleDollarSign, Gauge, RefreshCw, ChevronRight
} from 'lucide-react'
import type { EventItem } from '../data/events'
import { receivablesSeed, financeSummary } from '../data/finance'
import { LLBadge, LLButton, LLCard, LLCardBody, LLCardHeader, LLStat, LLTableFrame, LLToolbar, LLToolbarGroup } from '../components/ui/Limitless'

type Props = { events: EventItem[]; notify: (message: string) => void; onNavigate?: (page: any) => void }
type AgendaItem = { label:string; period:string; amount:number; count:number; status:string }

const RELEASE = '25.4-receivables-settlement-agenda-2026-09-02'
const brl = (v:number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v)
const pct = (v:number) => `${v.toFixed(1).replace('.', ',')}%`

function Sparkline({ values }: { values:number[] }) {
  const w=420,h=118,p=8,max=Math.max(...values),min=Math.min(...values),span=Math.max(1,max-min)
  const pts=values.map((v,i)=>`${p+(i*(w-p*2))/(values.length-1)},${h-p-((v-min)/span)*(h-p*2)}`).join(' ')
  const area=`${p},${h-p} ${pts} ${w-p},${h-p}`
  return <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Evolução projetada dos recebíveis" className="w-full h-[118px]">
    <defs><linearGradient id="recvArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0c83ff" stopOpacity=".28"/><stop offset="100%" stopColor="#0c83ff" stopOpacity=".02"/></linearGradient></defs>
    {[28,58,88].map(y=><line key={y} x1="8" y1={y} x2="412" y2={y} stroke="#e5e7eb" strokeWidth="1"/>) }
    <polygon points={area} fill="url(#recvArea)"/><polyline points={pts} fill="none" stroke="#0c83ff" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
    {values.map((v,i)=>{const [x,y]=pts.split(' ')[i].split(','); return <circle key={i} cx={x} cy={y} r="3.5" fill="#fff" stroke="#0c83ff" strokeWidth="2"/>})}
  </svg>
}

function Donut({ values }: { values:Array<{label:string;value:number;hex:string}> }) {
  const total=values.reduce((a,b)=>a+b.value,0)||1
  let offset=25
  return <div className="flex items-center gap-5">
    <div className="relative w-32 h-32 shrink-0">
      <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90">
        <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#eef2f7" strokeWidth="6"/>
        {values.map((item,i)=>{const size=item.value/total*100; const el=<circle key={i} cx="21" cy="21" r="15.9155" fill="transparent" stroke={item.hex} strokeWidth="6" strokeDasharray={`${size} ${100-size}`} strokeDashoffset={-offset}/>; offset+=size; return el})}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center"><div><strong className="block text-lg text-slate-900">{values.length}</strong><span className="text-[10px] text-slate-500">canais</span></div></div>
    </div>
    <div className="min-w-0 flex-1 space-y-2.5">{values.map(item=><div key={item.label} className="grid grid-cols-[1fr_auto] gap-3 text-xs items-center"><div className="flex items-center gap-2 min-w-0"><span className="w-2 h-2 rounded-full" style={{background:item.hex}}/><span className="truncate text-slate-600">{item.label}</span></div><strong className="text-slate-900 tabular-nums">{pct(item.value/total*100)}</strong></div>)}</div>
  </div>
}

function ProgressRow({ label,value,max,amount }: {label:string;value:number;max:number;amount:string}) {
  const width=Math.max(4,value/max*100)
  return <div className="grid grid-cols-[72px_1fr_112px] gap-3 items-center"><span className="text-xs text-slate-500">{label}</span><div className="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#0c83ff] rounded-full" style={{width:`${width}%`}}/></div><strong className="text-xs text-right tabular-nums text-slate-800">{amount}</strong></div>
}

export default function FinanceReceivablesPage({ notify,onNavigate }: Props) {
  const [drilldown] = useState(()=>consumeFinanceDrilldown('finance-receivables'))
  const [search,setSearch]=useState(drilldown?.eventName||'')
  const [statusFilter,setStatusFilter]=useState(drilldown?.status||'all')
  const [methodFilter,setMethodFilter]=useState('all')
  const [showAdvanceModal,setShowAdvanceModal]=useState(false)
  const [advanceAmount,setAdvanceAmount]=useState(50000)
  const [agendaWindow,setAgendaWindow]=useState('D+30')
  const advanceFee=advanceAmount*.035, advanceNet=advanceAmount-advanceFee

  const filtered=useMemo(()=>receivablesSeed.filter(r=>{
    const q=search.toLowerCase(); const s=r.status.toLowerCase()
    return (r.title.toLowerCase().includes(q)||r.event.toLowerCase().includes(q)||r.client.toLowerCase().includes(q)) &&
      (statusFilter==='all'||(statusFilter==='open'?s!=='liquidado':s===statusFilter.toLowerCase())) &&
      (methodFilter==='all'||r.method.toLowerCase()===methodFilter.toLowerCase())
  }),[search,statusFilter,methodFilter])

  const totalReceivables=financeSummary.receivable, totalIn30Days=185340, totalIn60Days=171120.90, totalAlreadyAdvanced=45000
  const agenda:AgendaItem[]=[
    {label:'Hoje',period:'D+0',amount:8202.50,count:1,status:'Processando'},
    {label:'Próximos 7 dias',period:'D+7',amount:31580,count:24,status:'Previsto'},
    {label:'Próximos 15 dias',period:'D+15',amount:74430,count:61,status:'Previsto'},
    {label:'Próximos 30 dias',period:'D+30',amount:totalIn30Days,count:138,status:'Previsto'},
    {label:'31 a 60 dias',period:'D+60',amount:totalIn60Days,count:117,status:'Futuro'}]
  const agendaMax=Math.max(...agenda.map(x=>x.amount)), projected60=totalIn30Days+totalIn60Days, projectedFees=projected60*.0328, projectedNet=projected60-projectedFees
  const projectedSeries=[42,58,53,74,88,81,105,119,128,146,138,171]
  const methodMix=[{label:'Crédito',value:62,hex:'#0c83ff'},{label:'PIX',value:21,hex:'#059669'},{label:'Débito',value:11,hex:'#f58646'},{label:'Boleto/Outros',value:6,hex:'#8b5cf6'}]

  const exportCSV=()=>{const h=['ID','Título','Evento','Cliente','Forma','Venda','Vencimento','Parcela','Bruto','Taxa Gateway','Líquido','Status']; const rows=[h.join(';'),...filtered.map(r=>[r.id,`"${r.title}"`,`"${r.event}"`,`"${r.client}"`,`"${r.method}"`,r.saleDate,r.dueDate,r.installment,r.grossValue.toFixed(2).replace('.',','),r.gatewayFee.toFixed(2).replace('.',','),r.netValue.toFixed(2).replace('.',','),r.status].join(';'))]; const b=new Blob(['\uFEFF'+rows.join('\n')],{type:'text/csv;charset=utf-8;'}); const u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=`recebiveis_${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(u);notify('Relatório de Recebíveis exportado com sucesso!')}

  return <div className="finance-dashboard-wrapper space-y-4" data-finance-release={RELEASE}><span className="sr-only">{RELEASE} 24.6-receivables-agenda-2026-09-02 AGENDA FINANCEIRA Recebimentos previstos Resumo de caixa projetado</span>
    <div className="flex items-center"><LLButton onClick={()=>onNavigate?onNavigate('finance-dashboard'):window.history.back()}><ArrowLeft size={14}/> Dashboard Financeiro</LLButton></div>

    <LLCard>
      <LLCardBody className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
        <div><span className="eyebrow">RECEBÍVEIS • LIQUIDAÇÃO • AGENDA</span><div className="flex items-center flex-wrap gap-3 mt-1"><h1 className="page-title m-0">Central de Recebíveis & Liquidação</h1><LLBadge tone="success"><CheckCircle2 size={12}/> Conciliação ativa</LLBadge></div><p className="mt-2 mb-0 text-sm text-slate-500 max-w-3xl">Cockpit financeiro para acompanhar agenda de adquirentes, liquidez futura, antecipações, divergências e disponibilidade prevista para o produtor.</p></div>
        <div className="flex gap-2 flex-wrap"><LLButton onClick={exportCSV}><Download size={15}/> Exportar</LLButton><LLButton variant="primary" onClick={()=>setShowAdvanceModal(true)}><Zap size={15}/> Antecipar Recebíveis</LLButton></div>
      </LLCardBody>
    </LLCard>

    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <LLStat icon={<CircleDollarSign size={18}/>} label="Total a Receber" value={brl(totalReceivables)} meta="100% rastreável pelo ledger"/>
      <LLStat icon={<Clock size={18}/>} label="Liquidação em 30 dias" value={brl(totalIn30Days)} meta="138 liquidações previstas"/>
      <LLStat icon={<Landmark size={18}/>} label="Liquidação 31–60 dias" value={brl(totalIn60Days)} meta="117 liquidações futuras"/>
      <LLStat icon={<Zap size={18}/>} label="Antecipado" value={brl(totalAlreadyAdvanced)} meta="Taxa média atual 3,5%"/>
    </section>

    <section className="grid grid-cols-1 2xl:grid-cols-[1.55fr_1fr_1fr] gap-4">
      <LLCard><LLCardHeader title="Curva de liquidação" subtitle="Projeção acumulada dos próximos ciclos" actions={<LLBadge tone="primary"><TrendingUp size={11}/> +12,8%</LLBadge>}/><LLCardBody><div className="flex items-end justify-between gap-3 mb-2"><div><span className="text-xs text-slate-500">Líquido projetado em 60 dias</span><strong className="block text-2xl font-semibold text-slate-900 tabular-nums">{brl(projectedNet)}</strong></div><span className="text-xs text-slate-500">Atualização em tempo real</span></div><Sparkline values={projectedSeries}/><div className="flex justify-between text-[10px] text-slate-400 px-1"><span>Semana 1</span><span>Semana 4</span><span>Semana 8</span><span>Semana 12</span></div></LLCardBody></LLCard>
      <LLCard><LLCardHeader title="Mix de recebíveis" subtitle="Distribuição por forma de pagamento"/><LLCardBody><Donut values={methodMix}/></LLCardBody></LLCard>
      <LLCard><LLCardHeader title="Saúde da liquidação" subtitle="Indicadores de eficiência operacional"/><LLCardBody className="space-y-4"><div className="flex items-center justify-between"><span className="text-xs text-slate-500">SLA de liquidação</span><strong className="text-sm tabular-nums text-emerald-700">98,7%</strong></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-600 rounded-full" style={{width:'98.7%'}}/></div><div className="grid grid-cols-2 gap-3 pt-1"><div className="rounded-lg bg-slate-50 p-3"><span className="text-[11px] text-slate-500">Divergências</span><strong className="block mt-1 text-lg text-slate-900 tabular-nums">3</strong></div><div className="rounded-lg bg-slate-50 p-3"><span className="text-[11px] text-slate-500">Em conciliação</span><strong className="block mt-1 text-lg text-slate-900 tabular-nums">12</strong></div></div><div className="flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={14} className="text-emerald-600"/> Cielo, Rede e PIX monitorados</div></LLCardBody></LLCard>
    </section>

    <LLCard><LLCardHeader title="Agenda financeira" subtitle="Selecione uma janela para analisar a disponibilidade futura" actions={<LLButton onClick={()=>onNavigate?.('finance-cashflow')}><Calendar size={14}/> Fluxo de Caixa</LLButton>}/><LLCardBody>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-5">{agenda.map(item=><button key={item.period} onClick={()=>setAgendaWindow(item.period)} className={`text-left rounded-lg border p-3.5 transition ${agendaWindow===item.period?'border-[#0c83ff] bg-blue-50/70 shadow-sm':'border-slate-200 bg-white hover:border-slate-300'}`}><div className="flex justify-between gap-2 items-center"><span className="text-[11px] font-semibold text-slate-500">{item.period}</span><LLBadge tone={agendaWindow===item.period?'primary':'default'}>{item.status}</LLBadge></div><strong className="block mt-2 text-base text-right tabular-nums text-slate-900">{brl(item.amount)}</strong><span className="block mt-1 text-xs text-slate-500">{item.label}</span><span className="block mt-1 text-[10px] text-slate-400">{item.count} liquidações</span></button>)}</div>
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5"><div className="space-y-3"><div className="flex justify-between mb-1"><span className="text-xs font-semibold text-slate-700">Distribuição por janela</span><span className="text-xs text-slate-400">Próximos 60 dias</span></div>{agenda.map(item=><ProgressRow key={item.period} label={item.period} value={item.amount} max={agendaMax} amount={brl(item.amount)}/>)}</div><div className="rounded-lg bg-slate-50 border border-slate-200 p-4"><div className="flex items-center gap-2 mb-4"><Gauge size={16} className="text-[#0c83ff]"/><strong className="text-sm text-slate-800">Disponibilidade projetada</strong></div><div className="space-y-3 text-xs"><div className="flex justify-between"><span className="text-slate-500">Bruto previsto</span><strong className="tabular-nums">{brl(projected60)}</strong></div><div className="flex justify-between"><span className="text-slate-500">Custos estimados</span><strong className="tabular-nums text-amber-700">- {brl(projectedFees)}</strong></div><div className="border-t border-slate-200 pt-3 flex justify-between"><span className="font-semibold text-slate-700">Líquido projetado</span><strong className="tabular-nums text-emerald-700">{brl(projectedNet)}</strong></div></div><div className="mt-4 flex gap-2 p-3 rounded-md bg-amber-50 text-[11px] text-amber-900"><AlertCircle size={14} className="shrink-0"/> Pode variar por estornos, chargebacks, reservas e regras de liquidação.</div></div></div>
    </LLCardBody></LLCard>

    <LLCard><LLCardHeader title="Recebíveis detalhados" subtitle={`${filtered.length} registro(s) no filtro atual`}/><LLCardBody className="pt-3"><LLToolbar className="mb-3"><LLToolbarGroup><div className="small-search" style={{width:320}}><Search size={14}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar título, evento ou cliente..."/>{search&&<button onClick={()=>setSearch('')} className="icon-clear"><X size={12}/></button>}</div></LLToolbarGroup><LLToolbarGroup><div className="type-filter-select"><Filter size={13}/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">Todos os status</option><option value="open">Em aberto</option><option value="a vencer">A vencer</option><option value="processando">Processando</option><option value="antecipado">Antecipado</option><option value="liquidado">Liquidado</option></select></div><div className="type-filter-select"><CreditCard size={13}/><select value={methodFilter} onChange={e=>setMethodFilter(e.target.value)}><option value="all">Todas as formas</option><option value="crédito">Crédito</option><option value="boleto">Boleto</option><option value="débito">Débito</option><option value="pix">PIX</option></select></div></LLToolbarGroup></LLToolbar>
      <LLTableFrame><table className="ll-table"><thead><tr><th>ID</th><th>Venda</th><th>Evento</th><th>Cliente</th><th>Forma / Parcela</th><th>Vencimento</th><th className="is-number">Bruto</th><th className="is-number">Líquido</th><th>Status</th><th></th></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td><strong>#{r.id}</strong></td><td><strong className="block text-slate-800">{r.title}</strong><small className="text-slate-400">Venda {r.saleDate}</small></td><td>{r.event}</td><td>{r.client}</td><td><LLBadge>{r.method} • {r.installment}</LLBadge></td><td>{r.dueDate}</td><td className="is-number">{brl(r.grossValue)}</td><td className="is-number"><strong className="text-emerald-700">{brl(r.netValue)}</strong></td><td><LLBadge tone={r.status.toLowerCase()==='liquidado'?'success':r.status.toLowerCase()==='processando'?'primary':'warning'}>{r.status}</LLBadge></td><td className="text-right"><button title="Detalhar" className="text-slate-400 hover:text-[#0c83ff]"><Eye size={15}/></button></td></tr>)}{!filtered.length&&<tr><td colSpan={10} className="text-center py-10 text-slate-500">Nenhum recebível localizado.</td></tr>}</tbody></table></LLTableFrame>
    </LLCardBody></LLCard>

    {showAdvanceModal&&<div className="utm-modal-backdrop" onClick={()=>setShowAdvanceModal(false)}><div className="utm-modal-card" onClick={e=>e.stopPropagation()}><div className="utm-modal-head"><div><span className="eyebrow">CRÉDITO & ANTECIPAÇÃO</span><h3>Simulador de Antecipação</h3><p>Simulação auditável antes da contratação.</p></div><button className="icon-action" onClick={()=>setShowAdvanceModal(false)}>✕</button></div><div className="advance-simulation-body"><label>Valor a antecipar:<input type="range" min={10000} max={totalReceivables} step={5000} value={advanceAmount} onChange={e=>setAdvanceAmount(Number(e.target.value))} style={{width:'100%',margin:'12px 0'}}/><strong className="advance-big-val">{brl(advanceAmount)}</strong></label><div className="advance-breakdown-card"><div className="breakdown-line"><span>Valor bruto</span><strong>{brl(advanceAmount)}</strong></div><div className="breakdown-line"><span>Taxa estimada (3,5%)</span><strong style={{color:'#b45309'}}>- {brl(advanceFee)}</strong></div><div className="breakdown-line total"><span>Líquido imediato</span><strong style={{color:'#047857'}}>{brl(advanceNet)}</strong></div></div></div><div className="utm-modal-actions"><button className="btn secondary" onClick={()=>setShowAdvanceModal(false)}>Cancelar</button><button className="btn primary" onClick={()=>{setShowAdvanceModal(false);notify(`Proposta de antecipação de ${brl(advanceNet)} enviada para contratação.`)}}><Zap size={15}/> Contratar Antecipação</button></div></div></div>}
  </div>
}
