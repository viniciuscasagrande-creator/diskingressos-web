import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowRight, CalendarDays, CircleDollarSign, CreditCard, Gift, MapPin,
  Pencil, RefreshCw, Share2, ShoppingBag, Sparkles, Target, Ticket, TrendingUp, Users
} from 'lucide-react'
import type { EventItem } from '../data/events'
import type { PageKey } from '../components/ModuleSidebar'
import { getEventCommercialDashboard, type EventCommercialDashboardData, type CommercialPeriod } from '../services/api'
import EventOrderInvestigationPage from './eventos/EventOrderInvestigationPage'
import './event-commercial-dashboard.css'

type Props = {
  event: EventItem
  onNavigate?: (page: any, context?: any) => void
  notify?: (message: string) => void
}

const money=(cents:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:2}).format((cents||0)/100)
const compact=(value:number)=>new Intl.NumberFormat('pt-BR',{notation:'compact',maximumFractionDigits:1}).format(value||0)
const pct=(value:number)=>`${Number(value||0).toLocaleString('pt-BR',{maximumFractionDigits:1})}%`

export default function EventCommercialDashboardPage({event,onNavigate,notify}:Props){
  const [period,setPeriod]=useState<CommercialPeriod>('tudo')
  const [data,setData]=useState<EventCommercialDashboardData|null>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [mode,setMode]=useState<'financeiro'|'quantidade'>('financeiro')
  const [customOpen,setCustomOpen]=useState(false)
  const [from,setFrom]=useState('')
  const [to,setTo]=useState('')
  const [investigatingOrderCode, setInvestigatingOrderCode] = useState<string | null>(null)

  const load=useCallback(async()=>{
    setLoading(true);setError('')
    try{setData(await getEventCommercialDashboard(event.id,period,period==='custom'?from:undefined,period==='custom'?to:undefined))}
    catch(e){setError(e instanceof Error?e.message:'Não foi possível carregar o painel comercial.')}
    finally{setLoading(false)}
  },[event.id,period,from,to])
  useEffect(()=>{void load()},[load])

  const share=async()=>{
    const text=`${event.title} — ${event.venue} — ${event.date}`
    try{
      if(navigator.share) await navigator.share({title:event.title,text,url:window.location.href})
      else {await navigator.clipboard.writeText(`${text}\n${window.location.href}`);notify?.('Link do evento copiado.')}
    }catch{/* compartilhamento cancelado */}
  }

  if(loading&&!data)return <CommercialSkeleton event={event}/>
  if(error&&!data)return <div className="commercial-dashboard"><div className="commercial-error"><strong>Não foi possível carregar o Painel Comercial.</strong><span>{error}</span><button onClick={()=>void load()}><RefreshCw size={16}/>Tentar novamente</button></div></div>
  if(!data)return null

  if (investigatingOrderCode) {
    return (
      <EventOrderInvestigationPage
        event={event}
        orderIdOrCode={investigatingOrderCode}
        onBack={() => setInvestigatingOrderCode(null)}
        onNavigate={onNavigate}
        notify={notify}
      />
    )
  }

  const {kpis,ritmo}=data
  return <div className="commercial-dashboard" data-testid="event-commercial-dashboard">
    <header className="commercial-hero">
      <div className="commercial-hero-copy">
        <div className="commercial-kicker"><Sparkles size={14}/> PAINEL COMERCIAL DO EVENTO</div>
        <h1>{data.event.title}</h1>
        <div className="commercial-meta"><span><MapPin size={14}/>{data.event.venue}, {data.event.city}</span><span><CalendarDays size={14}/>{data.event.date}</span><span className={`commercial-status ${data.event.status}`}>{data.event.status}</span></div>
      </div>
      <div className="commercial-actions">
        <button className="ghost" onClick={share}><Share2 size={16}/>Compartilhar</button>
        <button className="ghost" onClick={()=>onNavigate?.('edit-event')}><Pencil size={16}/>Editar Evento</button>
        <button className="primary" data-testid="btn-access-event-os" onClick={()=>onNavigate?.('event-command-center')}><Activity size={16}/>Acessar Event OS</button>
      </div>
    </header>

    <nav className="commercial-tabs" data-testid="event-subtabs" aria-label="Navegação do evento">
      <button className="active">Visão Geral</button>
      <button onClick={()=>onNavigate?.('event-reports')}>Vendas</button>
      <button onClick={()=>onNavigate?.('event-tickets')}>Ingressos</button>
      <button onClick={()=>onNavigate?.('finance-dashboard')}>Financeiro</button>
      <button onClick={()=>onNavigate?.('event-customer-360')}>Público</button>
      <button onClick={()=>onNavigate?.('event-utm')}>Marketing</button>
      <button onClick={()=>onNavigate?.('event-details')}>Configurações</button>
    </nav>

    <section className="commercial-kpis" data-testid="commercial-kpis">
      <KpiCard testId="kpi-revenue" tone="blue" icon={<CircleDollarSign/>} label="Receita Total" value={money(kpis.receitaCents)} note={`${kpis.pedidosPagos.toLocaleString('pt-BR')} pedidos pagos`}/>
      <KpiCard testId="kpi-sold" tone="violet" icon={<ShoppingBag/>} label="Ingressos Vendidos" value={kpis.vendidos.toLocaleString('pt-BR')} note={`${money(kpis.ticketMedioCents)} ticket médio`}/>
      <KpiCard testId="kpi-available" tone="cyan" icon={<Ticket/>} label="Disponíveis" value={kpis.disponiveis.toLocaleString('pt-BR')} note={`${kpis.capacidade.toLocaleString('pt-BR')} de capacidade`}/>
      <KpiCard testId="kpi-courtesy" tone="amber" icon={<Gift/>} label="Cortesias" value={kpis.cortesias.toLocaleString('pt-BR')} note="emitidas/configuradas"/>
      <KpiCard testId="kpi-occupancy" tone="green" icon={<Users/>} label="Ocupação" value={pct(kpis.ocupacao)} note={`${compact(kpis.vendidos+kpis.cortesias)} ocupados`}/>
    </section>

    <div className="commercial-filterbar">
      <div><strong>Desempenho comercial</strong><span>Dados reais do evento selecionado</span></div>
      <div className="commercial-periods">
        {([['tudo','Tudo'],['hoje','Hoje'],['7d','7 Dias'],['30d','30 Dias']] as [CommercialPeriod,string][]).map(([key,label])=><button key={key} className={period===key?'active':''} onClick={()=>setPeriod(key)}>{label}</button>)}
        <button className={period==='custom'?'active':''} onClick={()=>setCustomOpen(v=>!v)}>Por Período</button>
        <button className="refresh" title="Atualizar dados" onClick={()=>void load()}><RefreshCw size={15}/></button>
      </div>
    </div>
    {customOpen&&<div className="commercial-custom-period"><label>De<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>Até<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label><button disabled={!from&&!to} onClick={()=>{setPeriod('custom');setCustomOpen(false)}}>Aplicar período</button></div>}

    <section className="commercial-main-grid">
      <article className="commercial-card commercial-evolution" data-testid="card-sales-evolution">
        <CardHead title="Evolução de Vendas" subtitle="Receita e quantidade ao longo do período">
          <div className="commercial-segmented"><button className={mode==='financeiro'?'active':''} onClick={()=>setMode('financeiro')}>Financeiro</button><button className={mode==='quantidade'?'active':''} onClick={()=>setMode('quantidade')}>Quantidade</button></div>
        </CardHead>
        <ModernLineChart data={data.evolucao} mode={mode}/>
      </article>

      <article className="commercial-card commercial-rhythm" data-testid="card-sales-velocity">
        <CardHead title="Ritmo de Vendas" subtitle="Velocidade atual e projeção transparente"/>
        <div className="rhythm-metrics">
          <MiniMetric label="Ticket Médio" value={money(ritmo.ticketMedioCents)}/>
          <MiniMetric label="Ponto de Equilíbrio" value={ritmo.pontoEquilibrioCents==null?'Não configurado':money(ritmo.pontoEquilibrioCents)}/>
          <MiniMetric label="Meta de Vendas" value={ritmo.metaVendas==null?'Não configurada':ritmo.metaVendas.toLocaleString('pt-BR')}/>
          <MiniMetric label="Projeção Final" value={ritmo.projecaoFinal==null?'Dados insuficientes':ritmo.projecaoFinal.toLocaleString('pt-BR')}/>
        </div>
        <ProjectionChart sold={kpis.vendidos} projection={ritmo.projecaoFinal} capacity={kpis.capacidade}/>
        <p className="commercial-method-note">{ritmo.metodoProjecao}</p>
      </article>
    </section>

    <section className="commercial-secondary-grid">
      <article className="commercial-card" data-testid="card-payment-methods">
        <CardHead title="Vendas por Forma de Pagamento" subtitle="Participação sobre pedidos pagos"/>
        <PaymentDonut items={data.metodosPagamento}/>
      </article>
      <article className="commercial-card" data-testid="card-ticket-types">
        <CardHead title="Vendas por Tipo de Ingresso" subtitle="Quantidade emitida por categoria"/>
        <TicketBars items={data.tiposIngresso}/>
        <button className="commercial-link" onClick={()=>onNavigate?.('event-tickets')}>Ver detalhes dos ingressos <ArrowRight size={14}/></button>
      </article>
      <article className="commercial-card occupancy-card" data-testid="card-occupancy-gauge">
        <CardHead title="Ocupação do Evento" subtitle="Capacidade comercial utilizada"/>
        <OccupancyGauge value={kpis.ocupacao}/>
        <div className="occupancy-foot"><span><b>{kpis.vendidos.toLocaleString('pt-BR')}</b> vendidos</span><span><b>{kpis.disponiveis.toLocaleString('pt-BR')}</b> disponíveis</span></div>
      </article>
    </section>

    <section className="commercial-bottom-grid">
      <article className="commercial-card transactions-card" data-testid="card-recent-transactions">
        <CardHead title="Últimas Transações" subtitle="Pedidos mais recentes do evento"><button className="commercial-link inline" onClick={()=>onNavigate?.('event-tickets')}>Ver todas <ArrowRight size={14}/></button></CardHead>
        <div className="commercial-table-wrap"><table className="commercial-table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Pagamento</th><th>Ingressos</th><th>Valor</th><th>Status</th><th>Data</th></tr></thead><tbody>{data.transacoes.length?data.transacoes.map(t=><tr key={t.id} style={{cursor:'pointer'}} onClick={()=>setInvestigatingOrderCode(String(t.codigo||t.id))} data-testid={`tx-row-${t.codigo}`}><td><strong>#{t.codigo}</strong></td><td>{t.cliente}</td><td>{labelPayment(t.pagamento)}</td><td className="num">{t.quantidade}</td><td className="num money">{money(t.valorCents)}</td><td><span className={`transaction-status ${t.status.toLowerCase()}`}>{labelStatus(t.status)}</span></td><td>{new Date(t.criadoEm).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</td></tr>):<tr><td colSpan={7}><div className="commercial-empty">Nenhuma transação encontrada neste período.</div></td></tr>}</tbody></table></div>
      </article>
      <article className="commercial-card weekday-card" data-testid="card-weekday-distribution">
        <CardHead title="Vendas por Dia da Semana" subtitle="Quantidade de ingressos vendidos"/>
        <WeekdayBars items={data.vendasDiaSemana}/>
      </article>
    </section>
  </div>
}

function CardHead({title,subtitle,children}:{title:string;subtitle:string;children?:React.ReactNode}){return <div className="commercial-card-head"><div><h2>{title}</h2><p>{subtitle}</p></div>{children}</div>}
function KpiCard({tone,icon,label,value,note,testId}:{tone:string;icon:React.ReactNode;label:string;value:string;note:string;testId?:string}){return <article className={`commercial-kpi ${tone}`} data-testid={testId}><div className="kpi-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></article>}
function MiniMetric({label,value}:{label:string;value:string}){return <div className="mini-commercial-metric"><span>{label}</span><strong>{value}</strong></div>}

function ModernLineChart({data,mode}:{data:EventCommercialDashboardData['evolucao'];mode:'financeiro'|'quantidade'}){
  const values=data.map(x=>mode==='financeiro'?x.receitaCents:x.quantidade)
  const max=Math.max(1,...values); const w=720,h=250,p=28
  const pts=values.map((v,i)=>({x:p+(i*(w-p*2))/Math.max(1,values.length-1),y:h-p-(v/max)*(h-p*2)}))
  const line=pts.map((q,i)=>`${i?'L':'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' ')
  const area=pts.length?`${line} L${pts[pts.length-1].x} ${h-p} L${pts[0].x} ${h-p} Z`:''
  return <div className="modern-line-chart"><svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Gráfico de evolução de vendas"><defs><linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity=".26"/><stop offset="100%" stopColor="currentColor" stopOpacity=".02"/></linearGradient></defs>{[.25,.5,.75,1].map(r=><line key={r} x1={p} x2={w-p} y1={h-p-r*(h-p*2)} y2={h-p-r*(h-p*2)} className="grid-line"/>)}{area&&<path d={area} fill="url(#salesArea)"/>}{line&&<path d={line} className="sales-line"/>}{pts.map((q,i)=><circle key={i} cx={q.x} cy={q.y} r="3.5" className="sales-dot"><title>{data[i]?.rotulo}: {mode==='financeiro'?money(data[i].receitaCents):`${data[i].quantidade} ingressos`}</title></circle>)}</svg><div className="chart-labels">{data.slice(-6).map(x=><span key={x.chave}>{x.rotulo}</span>)}</div>{!data.length&&<div className="chart-empty">Sem vendas no período selecionado.</div>}</div>
}
function ProjectionChart({sold,projection,capacity}:{sold:number;projection:number|null;capacity:number}){const max=Math.max(capacity,projection||0,sold,1);return <div className="projection-chart"><div className="projection-track"><i className="sold" style={{width:`${Math.min(100,sold/max*100)}%`}}/><i className="projected" style={{width:`${Math.min(100,Math.max(0,(projection||sold)-sold)/max*100)}%`,left:`${Math.min(100,sold/max*100)}%`}}/></div><div className="projection-legend"><span><i className="dot solid"/>Vendido {sold.toLocaleString('pt-BR')}</span><span><i className="dot dash"/>Projeção {projection==null?'—':projection.toLocaleString('pt-BR')}</span><span><Target size={13}/>Capacidade {capacity.toLocaleString('pt-BR')}</span></div></div>}
function PaymentDonut({items}:{items:EventCommercialDashboardData['metodosPagamento']}){const total=items.reduce((n,x)=>n+x.valorCents,0);let cursor=0;const colors=['#2563eb','#8b5cf6','#06b6d4','#10b981','#f59e0b','#f97316','#64748b'];const stops=items.map((x,i)=>{const start=cursor;cursor+=total?x.valorCents/total*100:0;return `${colors[i%colors.length]} ${start}% ${cursor}%`});return <div className="donut-layout"><div className="donut" style={{background:stops.length?`conic-gradient(${stops.join(',')})`:'#e2e8f0'}}><div><CreditCard size={19}/><strong>{items.reduce((n,x)=>n+x.pedidos,0)}</strong><span>pedidos</span></div></div><div className="donut-legend">{items.length?items.map((x,i)=><div key={x.metodo}><i style={{background:colors[i%colors.length]}}/><span>{labelPayment(x.metodo)}</span><b>{total?pct(x.valorCents/total*100):'0%'}</b><small>{money(x.valorCents)}</small></div>):<div className="commercial-empty">Sem pagamentos no período.</div>}</div></div>}
function TicketBars({items}:{items:EventCommercialDashboardData['tiposIngresso']}){const max=Math.max(1,...items.map(x=>x.quantidade));return <div className="ticket-bars">{items.length?items.slice(0,7).map(x=><div className="ticket-bar" key={x.tipo}><div><span>{x.tipo}</span><b>{x.quantidade.toLocaleString('pt-BR')}</b></div><div className="bar-track"><i style={{width:`${x.quantidade/max*100}%`}}/></div><small>{money(x.receitaCents)}</small></div>):<div className="commercial-empty">Sem ingressos emitidos no período.</div>}</div>}
function OccupancyGauge({value}:{value:number}){const v=Math.min(100,Math.max(0,value));return <div className="gauge-wrap"><div className="gauge" style={{background:`conic-gradient(#2563eb 0 ${v}%,#e8eef8 ${v}% 100%)`}}><div><TrendingUp size={22}/><strong>{pct(v)}</strong><span>ocupado</span></div></div></div>}
function WeekdayBars({items}:{items:EventCommercialDashboardData['vendasDiaSemana']}){const max=Math.max(1,...items.map(x=>x.quantidade));return <div className="weekday-bars">{items.map(x=><div key={x.dia} className="weekday"><div className="weekday-column"><i style={{height:`${Math.max(4,x.quantidade/max*100)}%`}}><b>{x.quantidade}</b></i></div><span>{x.dia}</span></div>)}</div>}
function labelPayment(value:string){const v=value.toLowerCase();if(v.includes('pix'))return 'PIX';if(v.includes('credit')||v.includes('credito')||v.includes('crédito'))return 'Cartão de Crédito';if(v.includes('debit')||v.includes('debito')||v.includes('débito'))return 'Cartão de Débito';if(v.includes('boleto'))return 'Boleto';if(v.includes('cash')||v.includes('dinheiro'))return 'Dinheiro';return value||'Não informado'}
function labelStatus(value:string){const v=value.toLowerCase();if(v==='pago')return 'Pago';if(v==='pendente')return 'Pendente';if(v==='cancelado')return 'Cancelado';if(v==='estornado')return 'Estornado';return value}
function CommercialSkeleton({event}:{event:EventItem}){return <div className="commercial-dashboard"><header className="commercial-hero"><div><div className="skeleton sk-small"/><div className="skeleton sk-title"/><div className="skeleton sk-row"/></div></header><section className="commercial-kpis">{[1,2,3,4,5].map(x=><div key={x} className="commercial-kpi skeleton-card"><span className="skeleton sk-kpi"/></div>)}</section><div className="commercial-loading"><RefreshCw size={18} className="spin"/>Carregando dados comerciais de {event.title}...</div></div>}
