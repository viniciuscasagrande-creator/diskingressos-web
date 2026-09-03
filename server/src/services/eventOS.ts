export type ReadinessStatus = 'ok' | 'warning' | 'critical'
export type ReadinessItem = { key:string; label:string; status:ReadinessStatus; detail:string }
export type EventOSAlert = { code:string; severity:'warning'|'critical'; title:string; message:string }

export function buildEventHealth(input:{eventStatus:string;capacity:number;sold:number;activeLots:number;paidOrders:number;activeCampaigns:number;openRecoveries:number;recoverableCents:number}){
  const readiness: ReadinessItem[] = [
    { key:'event', label:'Evento', status:input.eventStatus==='ativo'?'ok':'warning', detail:input.eventStatus==='ativo'?'Evento ativo para operação.':`Status atual: ${input.eventStatus}.` },
    { key:'inventory', label:'Inventário', status:input.capacity>0&&input.activeLots>0?'ok':'critical', detail:input.capacity>0?`${input.sold}/${input.capacity} ingressos alocados.`:'Nenhuma capacidade configurada.' },
    { key:'sales', label:'Vendas', status:input.paidOrders>0?'ok':'warning', detail:input.paidOrders>0?`${input.paidOrders} pedidos pagos.`:'Ainda não há pedidos pagos.' },
    { key:'marketing', label:'Marketing', status:input.activeCampaigns>0?'ok':'warning', detail:input.activeCampaigns>0?`${input.activeCampaigns} campanha(s) ativa(s).`:'Nenhuma campanha ativa detectada.' },
    { key:'recovery', label:'Recuperação', status:input.openRecoveries>0?'warning':'ok', detail:input.openRecoveries>0?`${input.openRecoveries} oportunidade(s) abertas.`:'Sem fila de recuperação pendente.' },
  ]
  const weights:Record<ReadinessStatus,number>={ok:20,warning:11,critical:0}
  const score=Math.round(readiness.reduce((sum,item)=>sum+weights[item.status],0))
  const alerts:EventOSAlert[]=[]
  if(input.capacity<=0) alerts.push({code:'inventory_missing',severity:'critical',title:'Inventário não configurado',message:'Defina lotes e capacidade antes da operação.'})
  if(input.capacity>0 && input.sold/input.capacity>=.95) alerts.push({code:'inventory_high',severity:'warning',title:'Capacidade próxima do limite',message:`Ocupação calculada em ${((input.sold/input.capacity)*100).toFixed(1)}%.`})
  if(input.openRecoveries>=20) alerts.push({code:'recovery_queue',severity:'warning',title:'Fila de recuperação relevante',message:`${input.openRecoveries} carrinhos/pagamentos podem exigir ação.`})
  if(input.recoverableCents>=1000000) alerts.push({code:'recoverable_revenue',severity:'warning',title:'Receita recuperável elevada',message:'Há mais de R$ 10 mil em oportunidades de recuperação.'})
  return {score,readiness,alerts}
}
