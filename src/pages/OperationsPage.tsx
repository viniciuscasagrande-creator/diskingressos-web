import { useEffect, useState } from 'react'
import { CalendarDays, Layers3, ShoppingCart, Ticket, Users, ScanLine, MonitorSmartphone, HandCoins, WalletCards, RefreshCw } from 'lucide-react'
import { getOperationalSummary, type OperationalSummary } from '../services/api'

const empty:OperationalSummary={events:0,lots:0,orders:0,tickets:0,participants:0,checkins:0,terminals:0,payouts:0,balanceCents:0}
const brl=(cents:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100)

type Props={producerId:number|null;producerName:string;notify:(message:string)=>void}
export default function OperationsPage({producerId,producerName,notify}:Props){
 const [data,setData]=useState<OperationalSummary>(empty),[loading,setLoading]=useState(true)
 const load=async()=>{setLoading(true);try{setData(await getOperationalSummary(producerId||undefined))}catch(e){notify(e instanceof Error?e.message:'Falha ao carregar núcleo operacional.')}finally{setLoading(false)}}
 useEffect(()=>{void load()},[producerId])
 const cards=[
  {label:'Eventos',value:data.events,icon:CalendarDays},{label:'Lotes',value:data.lots,icon:Layers3},{label:'Vendas',value:data.orders,icon:ShoppingCart},
  {label:'Ingressos',value:data.tickets,icon:Ticket},{label:'Participantes',value:data.participants,icon:Users},{label:'Check-ins',value:data.checkins,icon:ScanLine},
  {label:'Terminais POS',value:data.terminals,icon:MonitorSmartphone},{label:'Repasses',value:data.payouts,icon:HandCoins}
 ]
 return <section className="operations-page">
   <div className="page-heading-row"><div><p className="eyebrow">NÚCLEO OPERACIONAL</p><h2>Operação integrada</h2><p className="muted">Dados reais da API para <strong>{producerName}</strong>, sempre respeitando o escopo da produtora autenticada.</p></div><button className="secondary-btn" onClick={()=>void load()} disabled={loading}><RefreshCw size={17}/>{loading?'Atualizando...':'Atualizar dados'}</button></div>
   <div className="ops-balance"><div className="ops-icon"><WalletCards size={24}/></div><div><span>Saldo operacional liquidado</span><strong>{brl(data.balanceCents)}</strong><small>Entradas liquidadas menos saídas liquidadas</small></div></div>
   <div className="ops-grid">{cards.map(({label,value,icon:Icon})=><article className="ops-card" key={label}><div className="ops-card-icon"><Icon size={21}/></div><div><span>{label}</span><strong>{loading?'—':value.toLocaleString('pt-BR')}</strong></div></article>)}</div>
   <div className="info-panel"><h3>Isolamento multi-produtor ativo</h3><p>Os contadores acima são calculados no backend. Usuários de produtoras não conseguem ampliar o escopo alterando parâmetros da interface; administradores globais podem selecionar uma produtora ou trabalhar com a visão consolidada.</p></div>
 </section>
}
