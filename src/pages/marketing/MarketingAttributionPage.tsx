import { useMemo, useState } from 'react'
import { Activity, ArrowUpRight, BadgeDollarSign, BarChart3, CircleDollarSign, Download, Filter, MousePointerClick, Network, Search, Target, TrendingUp, UsersRound } from 'lucide-react'
import { ATTRIBUTION_RELEASE, type AttributionModel } from '../../domain/marketing/attribution'
import type { EventItem } from '../../data/events'
import './marketing-attribution.css'

type Props = { events: EventItem[]; producerName: string; notify: (message: string) => void }

type ChannelRow = { channel:string; source:string; sessions:number; conversions:number; revenue:number; spend:number; assisted:number; color:string }

const channels: ChannelRow[] = [
  { channel:'Meta Ads', source:'facebook / instagram', sessions:14820, conversions:642, revenue:18452000, spend:2713500, assisted:188, color:'#2563eb' },
  { channel:'Google Ads', source:'google / cpc', sessions:10940, conversions:518, revenue:15187000, spend:2468000, assisted:151, color:'#0ea5e9' },
  { channel:'TikTok Ads', source:'tiktok / paid_social', sessions:8230, conversions:327, revenue:8924000, spend:1892000, assisted:126, color:'#111827' },
  { channel:'WhatsApp', source:'whatsapp / owned', sessions:5460, conversions:301, revenue:7215000, spend:212000, assisted:96, color:'#16a34a' },
  { channel:'E-mail', source:'email / crm', sessions:4380, conversions:204, revenue:4987000, spend:118000, assisted:84, color:'#7c3aed' },
  { channel:'Afiliados', source:'affiliate / promoter', sessions:2860, conversions:171, revenue:4312000, spend:624000, assisted:58, color:'#d97706' },
]

const journeys = [
  { buyer:'João Silva', order:'#16355834', path:['Meta Ads','TikTok Ads','Direto'], value:'R$ 360,00', duration:'2d 4h', model:'Meta → TikTok → Direto' },
  { buyer:'Ana Costa', order:'#16355509', path:['Google Ads','Instagram','WhatsApp'], value:'R$ 420,00', duration:'1d 7h', model:'Google → Meta → WhatsApp' },
  { buyer:'Camila Rocha', order:'#16355219', path:['TikTok Ads','Google Ads'], value:'R$ 240,00', duration:'6h 18m', model:'TikTok → Google' },
  { buyer:'Rafael Mendes', order:'#16354980', path:['E-mail','Meta Ads','WhatsApp'], value:'R$ 510,00', duration:'3d 2h', model:'E-mail → Meta → WhatsApp' },
  { buyer:'Juliana Paes', order:'#16354741', path:['Afiliados','Meta Ads'], value:'R$ 520,00', duration:'11h 42m', model:'Afiliado → Meta' },
]

const formatMoney=(cents:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(cents/100)

export default function MarketingAttributionPage({ events, producerName, notify }:Props){
  const [model,setModel]=useState<AttributionModel>('last_click')
  const [eventId,setEventId]=useState('all')
  const [search,setSearch]=useState('')
  const totals=useMemo(()=>channels.reduce((a,c)=>({sessions:a.sessions+c.sessions,conversions:a.conversions+c.conversions,revenue:a.revenue+c.revenue,spend:a.spend+c.spend,assisted:a.assisted+c.assisted}),{sessions:0,conversions:0,revenue:0,spend:0,assisted:0}),[])
  const roas=totals.spend?totals.revenue/totals.spend:0
  const cpa=totals.conversions?totals.spend/totals.conversions:0
  const filtered=channels.filter(c=>`${c.channel} ${c.source}`.toLowerCase().includes(search.toLowerCase()))
  const maxRevenue=Math.max(...channels.map(c=>c.revenue))

  return <div className="attribution-page" data-release={ATTRIBUTION_RELEASE}>
    <header className="attribution-head">
      <div><span className="attribution-eyebrow">INTELIGÊNCIA DE MARKETING • FASE 25.7.2</span><h1>Central de Atribuição Multicanal</h1><p>UTM + fbclid + ttclid + gclid + campanhas + vendas + receita + ROAS em uma única visão.</p></div>
      <div className="attribution-actions"><button onClick={()=>notify('Dados de atribuição sincronizados.') }><Activity size={16}/> Sincronizar</button><button className="primary" onClick={()=>notify('Relatório de atribuição preparado para exportação.')}><Download size={16}/> Exportar</button></div>
    </header>

    <section className="attribution-filters">
      <label>Modelo de atribuição<select value={model} onChange={e=>setModel(e.target.value as AttributionModel)}><option value="last_click">Último clique</option><option value="first_click">Primeiro clique</option><option value="linear">Linear</option><option value="position_based">Baseado em posição</option><option value="data_driven">Orientado por dados</option></select></label>
      <label>Evento<select value={eventId} onChange={e=>setEventId(e.target.value)}><option value="all">Todos os eventos</option>{events.map(e=><option value={e.id} key={e.id}>{e.title}</option>)}</select></label>
      <label className="search-field">Buscar canal<div><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Meta, TikTok, Google..."/></div></label>
      <div className="tenant-pill"><UsersRound size={16}/><span>{producerName || 'Produtora'}</span></div>
    </section>

    <section className="attribution-kpis">
      <article><div className="kpi-icon"><CircleDollarSign/></div><span>Receita atribuída</span><strong>{formatMoney(totals.revenue)}</strong><small><TrendingUp size={13}/> 18,4% vs. período anterior</small></article>
      <article><div className="kpi-icon"><MousePointerClick/></div><span>Conversões atribuídas</span><strong>{totals.conversions.toLocaleString('pt-BR')}</strong><small>{(totals.conversions/totals.sessions*100).toFixed(2)}% de conversão</small></article>
      <article><div className="kpi-icon"><BadgeDollarSign/></div><span>ROAS multicanal</span><strong>{roas.toFixed(2)}x</strong><small>{formatMoney(totals.spend)} investidos</small></article>
      <article><div className="kpi-icon"><Target/></div><span>CPA médio</span><strong>{formatMoney(cpa)}</strong><small>{totals.assisted.toLocaleString('pt-BR')} conversões assistidas</small></article>
    </section>

    <section className="attribution-grid">
      <article className="panel revenue-panel"><div className="panel-head"><div><span>RECEITA ATRIBUÍDA POR CANAL</span><h2>Participação e eficiência</h2></div><BarChart3 size={20}/></div><div className="channel-bars">{channels.map(c=><div className="channel-bar" key={c.channel}><div className="channel-line"><span>{c.channel}</span><strong>{formatMoney(c.revenue)}</strong></div><div className="bar-track"><i style={{width:`${c.revenue/maxRevenue*100}%`,background:c.color}}/></div><small>{(c.revenue/totals.revenue*100).toFixed(1)}% da receita • ROAS {(c.revenue/c.spend).toFixed(2)}x</small></div>)}</div></article>
      <article className="panel model-panel"><div className="panel-head"><div><span>MODELO ATIVO</span><h2>{model==='last_click'?'Último clique':model==='first_click'?'Primeiro clique':model==='linear'?'Linear':model==='position_based'?'Baseado em posição':'Orientado por dados'}</h2></div><Network size={20}/></div><div className="model-visual"><div className="touch">1º toque<small>Descoberta</small></div><ArrowUpRight/><div className="touch">Assistência<small>Consideração</small></div><ArrowUpRight/><div className="touch active">Conversão<small>Receita</small></div></div><div className="match-card"><span>Taxa de identificação</span><strong>94,8%</strong><div><i style={{width:'94.8%'}}/></div><small>UTM + Click IDs + sessão + pedido</small></div><div className="id-chips"><span>fbclid</span><span>ttclid</span><span>gclid</span><span>msclkid</span><span>utm_*</span></div></article>
    </section>

    <section className="panel table-panel"><div className="panel-head"><div><span>PERFORMANCE MULTICANAL</span><h2>Canal → investimento → venda</h2></div><Filter size={18}/></div><div className="table-scroll"><table><thead><tr><th>Canal</th><th>Sessões</th><th>Conversões</th><th>Assistidas</th><th>Receita</th><th>Investimento</th><th>CPA</th><th>ROAS</th></tr></thead><tbody>{filtered.map(c=><tr key={c.channel}><td><b>{c.channel}</b><small>{c.source}</small></td><td>{c.sessions.toLocaleString('pt-BR')}</td><td>{c.conversions}</td><td>{c.assisted}</td><td>{formatMoney(c.revenue)}</td><td>{formatMoney(c.spend)}</td><td>{formatMoney(c.spend/c.conversions)}</td><td><strong className="roas">{(c.revenue/c.spend).toFixed(2)}x</strong></td></tr>)}</tbody></table></div></section>

    <section className="panel journey-panel"><div className="panel-head"><div><span>JORNADAS MULTI-TOUCH</span><h2>Caminho real até a compra</h2></div><Network size={19}/></div><div className="journeys">{journeys.map(j=><div className="journey" key={j.order}><div className="buyer"><strong>{j.buyer}</strong><small>{j.order} • {j.duration}</small></div><div className="path">{j.path.map((p,i)=><span key={p}>{p}{i<j.path.length-1&&<b>→</b>}</span>)}</div><strong>{j.value}</strong></div>)}</div></section>

    <footer className="attribution-foot">Release {ATTRIBUTION_RELEASE} • Escopo {eventId==='all'?'todos os eventos':'evento selecionado'} • Modelo {model}</footer>
  </div>
}
