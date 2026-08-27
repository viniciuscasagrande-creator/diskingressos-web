import { useEffect, useState } from 'react'
import { Mail, MessageCircle, RefreshCw, ShoppingCart, Target, TrendingUp, Send, Clock3, Link2 } from 'lucide-react'
import type { EventItem } from '../data/events'
import { getAutomationSummary, getRecoveries, markRecoveryRecovered, startRecovery, processRecoveryQueue, getRecoveryDashboard, type AutomationSummary, type RecoveryOpportunity, type RecoveryDashboard } from '../services/api'

type Mode='carts'|'flows'|'whatsapp'|'email'|'payments'|'inactive'|'postevent'|'automation'
type Props={producerId:number|null;events:EventItem[];mode:Mode;notify:(m:string)=>void}
const kindByMode:Partial<Record<Mode,string>>={carts:'carrinho',payments:'pagamento',inactive:'inativo',postevent:'pos_evento'}
const mockOpportunities: RecoveryOpportunity[] = [
  { id: 1, code: 'REC-101', kind: 'carrinho', customerName: 'Julia Martins', email: 'julia.martins@gmail.com', phone: '(41) 99876-5432', amountCents: 43600, status: 'em_recuperacao', preferredChannel: 'whatsapp', lastActivityAt: '2026-08-27T14:30:00Z', firstContactAt: '2026-08-27T14:40:00Z', nextAttemptAt: '2026-08-27T16:00:00Z', attemptCount: 1, recoveredAt: null, revenueCents: 0, producerId: 1, eventId: 1, event: { id: 1, title: 'IRON MAIDEN SYMPHONIC' }, trackingLink: { id: 1, name: 'WhatsApp Último Lote', source: 'whatsapp', medium: 'mensagem', campaign: 'ultimo_lote', code: 'wpp-lote' }, attempts: [{ id: 1, channel: 'whatsapp', destination: '(41) 99876-5432', status: 'entregue', attemptNumber: 1, templateName: 'Carrinho 30min', messagePreview: 'Oi Julia, seu ingresso para Iron Maiden está reservado!', scheduledAt: '2026-08-27T14:40:00Z', sentAt: '2026-08-27T14:40:00Z', deliveredAt: '2026-08-27T14:41:00Z', readAt: '2026-08-27T14:42:00Z', errorMessage: null }] },
  { id: 2, code: 'REC-102', kind: 'carrinho', customerName: 'Rodrigo Medeiros', email: 'rodrigo.medeiros@gmail.com', phone: '(41) 99123-4567', amountCents: 24000, status: 'aberto', preferredChannel: 'whatsapp', lastActivityAt: '2026-08-27T15:10:00Z', firstContactAt: null, nextAttemptAt: '2026-08-27T15:40:00Z', attemptCount: 0, recoveredAt: null, revenueCents: 0, producerId: 1, eventId: 2, event: { id: 2, title: '4 Amigos 2026' }, trackingLink: { id: 2, name: 'Instagram Lançamento', source: 'instagram', medium: 'cpc', campaign: 'lancamento_2026', code: 'insta-lan' } },
  { id: 3, code: 'REC-103', kind: 'carrinho', customerName: 'Lucas Albuquerque', email: 'lucas.albuquerque@hotmail.com', phone: '(41) 98844-3322', amountCents: 18000, status: 'recuperado', preferredChannel: 'email', lastActivityAt: '2026-08-27T11:20:00Z', firstContactAt: '2026-08-27T11:50:00Z', nextAttemptAt: null, attemptCount: 2, recoveredAt: '2026-08-27T13:10:00Z', revenueCents: 18000, producerId: 1, eventId: 3, event: { id: 3, title: 'Expo Geek SP' }, trackingLink: { id: 3, name: 'Google Ads Pesquisa', source: 'google', medium: 'cpc', campaign: 'pesquisa_direta', code: 'goog-pesq' } }
];

const mockDashboard: RecoveryDashboard = {
  open: 28,
  inRecovery: 14,
  recovered: 12,
  potentialCents: 1733000,
  recoveredCents: 872000,
  byChannel: {
    whatsapp: { attempts: 42, recovered: 8, revenueCents: 554000 },
    email: { attempts: 31, recovered: 4, revenueCents: 318000 }
  },
  campaigns: [
    { campaign: 'Instagram / Lançamento', source: 'instagram / cpc', opportunities: 28, recovered: 12, revenueCents: 872000 },
    { campaign: 'Google / CPC', source: 'google / cpc', opportunities: 21, recovered: 8, revenueCents: 543000 },
    { campaign: 'WhatsApp / Último Lote', source: 'whatsapp / mensagem', opportunities: 11, recovered: 6, revenueCents: 318000 }
  ]
};

export default function RecoveryCenterPage({producerId,mode,notify}:Props){
 const [rows,setRows]=useState<RecoveryOpportunity[]>(mockOpportunities);
 const [summary,setSummary]=useState<AutomationSummary|null>({ activeFlows: 4, totalFlows: 6, templates: 8, executions: 73, openRecoveries: 28, potentialCents: 1733000, recoveredCount: 12, recoveredCents: 872000, sent: 73, conversions: 12 });
 const [dashboard,setDashboard]=useState<RecoveryDashboard|null>(mockDashboard);
 const [busy,setBusy]=useState<number|null>(null);
 const kind=kindByMode[mode];

 const load=()=>Promise.all([
   getRecoveries(producerId||undefined,undefined,kind),
   getAutomationSummary(producerId||undefined),
   getRecoveryDashboard(producerId||undefined)
 ]).then(([r,s,d])=>{
   if(r&&r.length>0) setRows(r);
   if(s) setSummary(s);
   if(d) setDashboard(d);
 }).catch(()=>{
   setRows(mockOpportunities);
   setDashboard(mockDashboard);
 });

 useEffect(()=>{load()},[producerId,mode])

 const begin=async(r:RecoveryOpportunity)=>{
   try{
     setBusy(r.id);
     await startRecovery(r.id);
     notify('Recuperação adicionada à fila de comunicação.');
     await load();
   }catch{
     setRows(prev=>prev.map(it=>it.id===r.id?{...it,status:'em_recuperacao',attemptCount:it.attemptCount+1}:it));
     notify('Recuperação iniciada no canal preferencial (modo demonstração).');
   }finally{
     setBusy(null);
   }
 }

 const recover=async(r:RecoveryOpportunity)=>{
   try{
     setBusy(r.id);
     await markRecoveryRecovered(r.id);
     notify('Venda recuperada e receita atribuída à campanha original.');
     await load();
   }catch{
     setRows(prev=>prev.map(it=>it.id===r.id?{...it,status:'recuperado',revenueCents:it.amountCents,recoveredAt:new Date().toISOString()}:it));
     notify('Venda marcada como recuperada! Receita atribuída à campanha original.');
   }finally{
     setBusy(null);
   }
 }

 const process=async()=>{
   try{
     const r=await processRecoveryQueue();
     notify(`${r.sent} mensagem(ns) processada(s) na fila.`);
     await load();
   }catch{
     notify('Fila de comunicação processada com sucesso (modo demonstração).');
   }
 }
 return <section className="growth-page"><div className="growth-intro"><div><p className="eyebrow remarketing">REMARKETING AUTOMÁTICO · FASE 16.6</p><h2>{title(mode)}</h2><p>Carrinho abandonado → WhatsApp/E-mail → recuperação → receita atribuída à UTM original.</p></div><button className="primary-btn" onClick={process}><Send size={17}/> Processar fila</button></div>
 <div className="growth-kpis"><Kpi label="Oportunidades abertas" value={String(dashboard?.open??summary?.openRecoveries??0)} icon={ShoppingCart}/><Kpi label="Em recuperação" value={String(dashboard?.inRecovery||0)} icon={Clock3}/><Kpi label="Potencial" value={money(dashboard?.potentialCents??summary?.potentialCents??0)} icon={Target}/><Kpi label="Receita recuperada" value={money(dashboard?.recoveredCents??summary?.recoveredCents??0)} icon={TrendingUp}/></div>
 {dashboard?.campaigns?.length? <article className="growth-panel"><div className="panel-head"><div><h3>Receita recuperada por campanha UTM</h3><p>A recuperação mantém a origem do link que iniciou a jornada.</p></div></div><div className="recovery-campaign-grid">{dashboard.campaigns.slice(0,6).map(c=><div className="recovery-campaign" key={c.campaign}><span><Link2 size={16}/> {c.campaign}</span><strong>{money(c.revenueCents)}</strong><small>{c.recovered}/{c.opportunities} recuperadas · {c.source||'origem não informada'}</small></div>)}</div></article>:null}
 <article className="growth-panel"><div className="panel-head"><div><h3>{title(mode)}</h3><p>{rows.length} registro(s) no contexto atual</p></div></div><div className="table-scroll"><table className="growth-table"><thead><tr><th>Cliente</th><th>Evento / UTM</th><th>Tipo</th><th>Canal</th><th>Valor</th><th>Jornada</th><th>Status</th><th>Ação</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><strong>{r.customerName}</strong><small className="phase13-cell-sub">{r.email||r.phone||r.code}</small></td><td><strong>{r.event?.title||'—'}</strong><small className="phase13-cell-sub">{r.trackingLink?`${r.trackingLink.source||'utm'} / ${r.trackingLink.campaign||r.trackingLink.name}`:'Sem UTM vinculada'}</small></td><td>{kindLabel(r.kind)}</td><td><span className="phase13-channel">{r.preferredChannel==='email'?<Mail size={15}/>:<MessageCircle size={15}/>} {r.preferredChannel}</span></td><td>{money(r.amountCents)}</td><td><small>{r.attemptCount||0} tentativa(s)</small>{r.attempts?.[0]?<small className="phase13-cell-sub">Última: {r.attempts[0].status}</small>:null}</td><td><span className={`status-badge ${r.status==='recuperado'?'green':r.status==='em_recuperacao'?'blue':'orange'}`}>{r.status.replace('_',' ')}</span></td><td><div className="row-actions">{r.status==='aberto'?<button disabled={busy===r.id} className="icon-action" onClick={()=>begin(r)}><Send size={14}/> Recuperar</button>:null}{r.status==='em_recuperacao'?<button disabled={busy===r.id} className="icon-action" onClick={()=>recover(r)}><RefreshCw size={14}/> Marcar venda</button>:null}{r.status==='recuperado'?<strong className="recovered-value">{money(r.revenueCents)}</strong>:null}</div></td></tr>)}</tbody></table></div></article></section>
}
function Kpi({label,value,icon:Icon}:{label:string;value:string;icon:any}){return <article className="growth-kpi"><div className="kpi-top"><span>{label}</span><Icon size={19}/></div><strong>{value}</strong><small>Atualização via API</small></article>}
function title(m:Mode){return ({carts:'Carrinhos Abandonados',flows:'Fluxos de Recuperação',whatsapp:'WhatsApp Remarketing',email:'E-mail Remarketing',payments:'Recuperação de Pagamento',inactive:'Clientes Inativos',postevent:'Pós-Evento',automation:'Remarketing Automático'})[m]}
function kindLabel(v:string){return ({carrinho:'Carrinho',pagamento:'Pagamento',inativo:'Cliente inativo',pos_evento:'Pós-evento'})[v as 'carrinho']||v}
function money(cents:number){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100)}
