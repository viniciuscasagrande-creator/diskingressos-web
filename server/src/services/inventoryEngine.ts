export const INVENTORY_ENGINE_RELEASE = '26.16.3-inventario-operacional-2026-09-04'

export type InventoryLotInput = {
  id:number
  name:string
  sector:string|null
  capacity:number
  sold:number
  held:number
  priceCents:number
  status:string
  startsAt:Date|null
  endsAt:Date|null
  sales24h:number
}

export function buildLotInventory(input:InventoryLotInput, now=new Date()){
  const sold=Math.max(0,Math.min(input.capacity,input.sold))
  const held=Math.max(0,Math.min(input.capacity-sold,input.held))
  const available=Math.max(0,input.capacity-sold-held)
  const occupancy=input.capacity?((sold+held)/input.capacity)*100:0
  const salesVelocityPerHour=input.sales24h/24
  const forecastHours=salesVelocityPerHour>0?available/salesVelocityPerHour:null
  const forecastSoldOutAt=forecastHours!==null?new Date(now.getTime()+forecastHours*60*60*1000):null
  let health:'healthy'|'attention'|'critical'='healthy'
  if(available===0||occupancy>=98) health='critical'
  else if(occupancy>=90||available<=Math.max(10,Math.ceil(input.capacity*.05))) health='attention'
  return {...input,sold,held,available,occupancy,salesVelocityPerHour,forecastHours,forecastSoldOutAt,health}
}

export function buildInventoryRecommendations(lots:Array<ReturnType<typeof buildLotInventory>>){
  const recommendations:Array<{code:string;severity:'info'|'warning'|'critical';title:string;message:string;lotId?:number}> = []
  for(const lot of lots){
    if(lot.available===0){
      recommendations.push({code:'LOT_SOLD_OUT',severity:'critical',title:`${lot.name} esgotado`,message:'Inventário sem disponibilidade. Avalie liberar novo lote, capacidade ou fila de espera.',lotId:lot.id})
      continue
    }
    if(lot.forecastHours!==null&&lot.forecastHours<=12){
      recommendations.push({code:'SELL_OUT_12H',severity:'critical',title:`Esgotamento previsto em ${Math.max(1,Math.round(lot.forecastHours))}h`,message:`${lot.name} mantém velocidade de ${lot.salesVelocityPerHour.toFixed(1)} ingresso(s)/h. Prepare a próxima ação comercial.`,lotId:lot.id})
    }else if(lot.forecastHours!==null&&lot.forecastHours<=48){
      recommendations.push({code:'SELL_OUT_48H',severity:'warning',title:`${lot.name} próximo do esgotamento`,message:`Previsão de esgotamento em aproximadamente ${Math.round(lot.forecastHours)}h no ritmo atual.`,lotId:lot.id})
    }else if(lot.occupancy>=90){
      recommendations.push({code:'HIGH_OCCUPANCY',severity:'warning',title:`${lot.name} acima de 90%`,message:`O lote está com ${lot.occupancy.toFixed(1)}% comprometido entre vendidos e holds.`,lotId:lot.id})
    }
  }
  if(!lots.some(x=>x.status.toLowerCase()==='ativo')) recommendations.push({code:'NO_ACTIVE_LOT',severity:'critical',title:'Nenhum lote ativo',message:'O evento não possui lote ativo para venda.'})
  return recommendations.slice(0,8)
}
