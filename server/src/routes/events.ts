import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { globalAdmin } from '../auth.js'
import { audit } from '../audit.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { buildEventHealth } from '../services/eventOS.js'
import { buildLotInventory, buildInventoryRecommendations, INVENTORY_ENGINE_RELEASE } from '../services/inventoryEngine.js'
import { CUSTOMER_360_RELEASE, classifyCustomer, customerKey } from '../services/customer360.js'
export const eventsRouter=Router();eventsRouter.use(requireAuth)
const shape=z.object({code:z.string().min(1),title:z.string().min(2),venue:z.string(),city:z.string(),date:z.string(),endDate:z.string().optional(),totalCents:z.number().int().nonnegative().optional(),sales:z.number().int().nonnegative().optional(),available:z.number().int().nonnegative().optional(),courtesy:z.number().int().nonnegative().optional(),occupancy:z.number().nonnegative().optional(),cover:z.string().optional(),badge:z.string().optional(),status:z.string().optional(),description:z.string().optional(),category:z.string().optional(),visibility:z.string().optional(),producerId:z.number().int().optional()})
function scope(req:AuthRequest){return globalAdmin(req.auth!.role)?undefined:req.auth!.producerId??-1}
eventsRouter.get('/',async(req:AuthRequest,res)=>{const requested=req.query.producerId?Number(req.query.producerId):undefined;const producerId=globalAdmin(req.auth!.role)?requested:scope(req);res.json(await prisma.event.findMany({where:producerId?{producerId}:undefined,include:{producer:{select:{name:true}}},orderBy:{id:'desc'}}))})
eventsRouter.get('/code/:code',async(req:AuthRequest,res)=>{const event=await prisma.event.findFirst({where:{code:String(req.params.code)},include:{producer:{select:{id:true,name:true}}}});if(!event)return res.status(404).json({message:'Evento não encontrado.'});if(!globalAdmin(req.auth!.role)&&event.producerId!==req.auth!.producerId)return res.status(403).json({message:'Acesso negado a evento de outra produtora.'});res.json(event)})

eventsRouter.get('/:id/command-center',async(req:AuthRequest,res)=>{
  const id=Number(req.params.id)
  const event=await prisma.event.findUnique({where:{id},include:{producer:{select:{id:true,name:true}}}})
  if(!event)return res.status(404).json({message:'Evento não encontrado.'})
  if(!globalAdmin(req.auth!.role)&&event.producerId!==req.auth!.producerId)return res.status(403).json({message:'Acesso negado a evento de outra produtora.'})
  const producerId=event.producerId
  const [lots,orders,tickets,participants,checkins,recoveries,campaigns]=await Promise.all([
    prisma.lot.findMany({where:{eventId:id,producerId},select:{capacity:true,sold:true,status:true}}),
    prisma.order.findMany({where:{eventId:id,producerId},select:{status:true,grossCents:true}}),
    prisma.ticket.count({where:{eventId:id,producerId}}),
    prisma.participant.count({where:{eventId:id,producerId}}),
    prisma.checkIn.count({where:{eventId:id,producerId,status:'presente'}}),
    prisma.recoveryOpportunity.findMany({where:{eventId:id,producerId},select:{status:true,amountCents:true,revenueCents:true}}),
    prisma.marketingCampaign.findMany({where:{eventId:id,producerId},select:{status:true}}),
  ])
  const activeLots=lots.filter(x=>x.status==='ativo').length
  const inventoryCapacity=lots.reduce((n,x)=>n+x.capacity,0)
  const inventorySold=lots.reduce((n,x)=>n+x.sold,0)
  const paid=orders.filter(x=>x.status==='pago')
  const revenueCents=paid.reduce((n,x)=>n+x.grossCents,0)
  const openRecoveries=recoveries.filter(x=>!['recuperado','recovered','convertido','finalizado'].includes(x.status.toLowerCase()))
  const recoverableCents=openRecoveries.reduce((n,x)=>n+x.amountCents,0)
  const recoveredCents=recoveries.reduce((n,x)=>n+(x.revenueCents||0),0)
  const activeCampaigns=campaigns.filter(x=>['ativo','active','running'].includes(x.status.toLowerCase())).length
  const occupancy=inventoryCapacity?Math.min(100,(inventorySold/inventoryCapacity)*100):Number(event.occupancy||0)
  const health=buildEventHealth({eventStatus:event.status,capacity:inventoryCapacity,sold:inventorySold,activeLots,paidOrders:paid.length,activeCampaigns,openRecoveries:openRecoveries.length,recoverableCents})
  res.json({
    release:'26.1-event-cockpit-activity-stream-2026-09-03',
    event:{id:event.id,code:event.code,title:event.title,producerId:event.producerId,producerName:event.producer.name,status:event.status},
    kpis:{revenueCents,paidOrders:paid.length,tickets,participants,checkins,inventoryCapacity,inventorySold,inventoryAvailable:Math.max(0,inventoryCapacity-inventorySold),occupancy,openRecoveries:openRecoveries.length,recoverableCents,recoveredCents,activeCampaigns},
    health:{score:health.score},readiness:health.readiness,alerts:health.alerts,
  })
})


eventsRouter.get('/:id/activity-stream',async(req:AuthRequest,res)=>{
  const id=Number(req.params.id)
  if(!Number.isFinite(id))return res.status(400).json({message:'Evento inválido.'})
  const event=await prisma.event.findUnique({where:{id},select:{id:true,code:true,title:true,producerId:true,status:true}})
  if(!event)return res.status(404).json({message:'Evento não encontrado.'})
  if(!globalAdmin(req.auth!.role)&&event.producerId!==req.auth!.producerId)return res.status(403).json({message:'Acesso negado a evento de outra produtora.'})
  const producerId=event.producerId
  const now=new Date()
  const since12h=new Date(now.getTime()-12*60*60*1000)
  const since1h=new Date(now.getTime()-60*60*1000)
  const since15m=new Date(now.getTime()-15*60*1000)
  const limit=Math.max(10,Math.min(100,Number(req.query.limit)||40))
  const [orders,checkins,recoveries,refunds,finance,campaigns,incidents]=await Promise.all([
    prisma.order.findMany({where:{eventId:id,producerId,createdAt:{gte:since12h}},select:{id:true,code:true,buyerName:true,status:true,paymentMethod:true,quantity:true,grossCents:true,createdAt:true},orderBy:{createdAt:'desc'},take:120}),
    prisma.checkIn.findMany({where:{eventId:id,producerId,checkedAt:{gte:since12h}},select:{id:true,status:true,gate:true,method:true,operatorName:true,checkedAt:true},orderBy:{checkedAt:'desc'},take:120}),
    prisma.recoveryOpportunity.findMany({where:{eventId:id,producerId,updatedAt:{gte:since12h}},select:{id:true,code:true,kind:true,customerName:true,status:true,amountCents:true,revenueCents:true,lastActivityAt:true,updatedAt:true},orderBy:{updatedAt:'desc'},take:100}),
    prisma.refundRequest.findMany({where:{eventId:id,producerId,updatedAt:{gte:since12h}},select:{id:true,code:true,orderCode:true,status:true,amountCents:true,reason:true,updatedAt:true},orderBy:{updatedAt:'desc'},take:80}),
    prisma.financialTransaction.findMany({where:{eventId:id,producerId,occurredAt:{gte:since12h}},select:{id:true,code:true,type:true,category:true,description:true,amountCents:true,status:true,occurredAt:true},orderBy:{occurredAt:'desc'},take:80}),
    prisma.marketingCampaign.findMany({where:{eventId:id,producerId,updatedAt:{gte:since12h}},select:{id:true,name:true,channel:true,status:true,spentCents:true,revenueCents:true,updatedAt:true},orderBy:{updatedAt:'desc'},take:50}),
    prisma.eventIncident.findMany({where:{eventId:id,producerId},select:{id:true,code:true,category:true,severity:true,status:true,title:true,description:true,source:true,openedAt:true,resolvedAt:true},orderBy:{openedAt:'desc'},take:50}),
  ])

  const paidOrders=orders.filter(x=>x.status.toLowerCase()==='pago')
  const orders15m=paidOrders.filter(x=>x.createdAt>=since15m)
  const orders1h=paidOrders.filter(x=>x.createdAt>=since1h)
  const checkins15m=checkins.filter(x=>x.checkedAt>=since15m&&x.status.toLowerCase()==='presente')
  const checkins1h=checkins.filter(x=>x.checkedAt>=since1h&&x.status.toLowerCase()==='presente')
  const recovered12h=recoveries.filter(x=>['recuperado','recovered','convertido','finalizado'].includes(x.status.toLowerCase()))
  const openRefunds=refunds.filter(x=>!['concluido','concluído','finalizado','cancelado','rejeitado'].includes(x.status.toLowerCase()))
  const openIncidents=incidents.filter(x=>!['resolved','resolvido','closed','fechado'].includes(x.status.toLowerCase()))

  const activity:any[]=[]
  for(const x of orders)activity.push({id:`order:${x.id}`,type:'sale',occurredAt:x.createdAt,title:x.status.toLowerCase()==='pago'?'Venda confirmada':'Pedido atualizado',detail:`${x.code} · ${x.buyerName} · ${x.quantity} ingresso(s) · ${x.paymentMethod}`,status:x.status,amountCents:x.grossCents,severity:x.status.toLowerCase()==='pago'?'success':'info'})
  for(const x of checkins)activity.push({id:`checkin:${x.id}`,type:'checkin',occurredAt:x.checkedAt,title:x.status.toLowerCase()==='presente'?'Check-in realizado':'Tentativa de acesso',detail:`${x.gate||'Portão não informado'} · ${x.method}${x.operatorName?` · ${x.operatorName}`:''}`,status:x.status,severity:x.status.toLowerCase()==='presente'?'success':'warning'})
  for(const x of recoveries)activity.push({id:`recovery:${x.id}`,type:'recovery',occurredAt:x.updatedAt,title:['recuperado','recovered','convertido','finalizado'].includes(x.status.toLowerCase())?'Venda recuperada':'Recuperação atualizada',detail:`${x.code} · ${x.customerName} · ${x.kind}`,status:x.status,amountCents:x.revenueCents||x.amountCents,severity:x.revenueCents>0?'success':'info'})
  for(const x of refunds)activity.push({id:`refund:${x.id}`,type:'refund',occurredAt:x.updatedAt,title:'Estorno / reembolso',detail:`${x.code} · pedido ${x.orderCode} · ${x.reason}`,status:x.status,amountCents:x.amountCents,severity:openRefunds.some(r=>r.id===x.id)?'warning':'info'})
  for(const x of finance)activity.push({id:`finance:${x.id}`,type:'finance',occurredAt:x.occurredAt,title:x.description||'Movimentação financeira',detail:`${x.code} · ${x.category} · ${x.type}`,status:x.status,amountCents:x.amountCents,severity:'info'})
  for(const x of campaigns)activity.push({id:`campaign:${x.id}`,type:'marketing',occurredAt:x.updatedAt,title:'Campanha atualizada',detail:`${x.name} · ${x.channel}`,status:x.status,amountCents:x.revenueCents,severity:'info'})
  for(const x of incidents)activity.push({id:`incident:${x.id}`,type:'incident',occurredAt:x.openedAt,title:x.title,detail:`${x.category} · ${x.description||x.source}`,status:x.status,severity:x.severity})
  activity.sort((a,b)=>new Date(b.occurredAt).getTime()-new Date(a.occurredAt).getTime())

  const buckets=Array.from({length:12},(_,i)=>{const start=new Date(now.getTime()-(11-i)*60*60*1000);start.setMinutes(0,0,0);const end=new Date(start.getTime()+60*60*1000);const bucketOrders=paidOrders.filter(x=>x.createdAt>=start&&x.createdAt<end);return {hour:start.toISOString(),orders:bucketOrders.length,revenueCents:bucketOrders.reduce((n,x)=>n+x.grossCents,0),checkins:checkins.filter(x=>x.checkedAt>=start&&x.checkedAt<end&&x.status.toLowerCase()==='presente').length}})

  res.json({
    release:'26.1-event-cockpit-activity-stream-2026-09-03',
    event:{id:event.id,code:event.code,title:event.title,producerId:event.producerId,status:event.status},
    generatedAt:now.toISOString(),
    refreshRecommendedSeconds:15,
    pulse:{orders15m:orders15m.length,revenue15mCents:orders15m.reduce((n,x)=>n+x.grossCents,0),orders1h:orders1h.length,revenue1hCents:orders1h.reduce((n,x)=>n+x.grossCents,0),checkins15m:checkins15m.length,checkins1h:checkins1h.length,recovered12h:recovered12h.length,recoveredRevenue12hCents:recovered12h.reduce((n,x)=>n+(x.revenueCents||0),0),openRefunds:openRefunds.length,openIncidents:openIncidents.length},
    trend:buckets,
    activity:activity.slice(0,limit),
  })
})


eventsRouter.get('/:id/inventory-engine',async(req:AuthRequest,res)=>{
  const id=Number(req.params.id)
  if(!Number.isFinite(id))return res.status(400).json({message:'Evento inválido.'})
  const event=await prisma.event.findUnique({where:{id},select:{id:true,code:true,title:true,producerId:true,status:true}})
  if(!event)return res.status(404).json({message:'Evento não encontrado.'})
  if(!globalAdmin(req.auth!.role)&&event.producerId!==req.auth!.producerId)return res.status(403).json({message:'Acesso negado a evento de outra produtora.'})
  const producerId=event.producerId, now=new Date(), since24h=new Date(now.getTime()-24*60*60*1000)
  const [rawLots,activeHolds,tickets24h]=await Promise.all([
    prisma.lot.findMany({where:{eventId:id,producerId},orderBy:[{status:'asc'},{id:'asc'}]}),
    prisma.inventoryHold.findMany({where:{eventId:id,producerId,status:'active',expiresAt:{gt:now}},orderBy:{createdAt:'desc'}}),
    prisma.ticket.findMany({where:{eventId:id,producerId,createdAt:{gte:since24h}},select:{lotId:true,createdAt:true}}),
  ])
  const holdsByLot=new Map<number,number>(), salesByLot=new Map<number,number>()
  for(const h of activeHolds){if(h.lotId)holdsByLot.set(h.lotId,(holdsByLot.get(h.lotId)||0)+h.quantity)}
  for(const t of tickets24h){if(t.lotId)salesByLot.set(t.lotId,(salesByLot.get(t.lotId)||0)+1)}
  const lots=rawLots.map(l=>buildLotInventory({id:l.id,name:l.name,sector:l.sector,capacity:l.capacity,sold:l.sold,held:holdsByLot.get(l.id)||0,priceCents:l.priceCents,status:l.status,startsAt:l.startsAt,endsAt:l.endsAt,sales24h:salesByLot.get(l.id)||0},now))
  const sectorMap=new Map<string,{sector:string;capacity:number;sold:number;held:number;available:number;revenuePotentialCents:number}>()
  for(const l of lots){const key=l.sector||'Geral';const x=sectorMap.get(key)||{sector:key,capacity:0,sold:0,held:0,available:0,revenuePotentialCents:0};x.capacity+=l.capacity;x.sold+=l.sold;x.held+=l.held;x.available+=l.available;x.revenuePotentialCents+=l.available*l.priceCents;sectorMap.set(key,x)}
  const capacity=lots.reduce((n,x)=>n+x.capacity,0),sold=lots.reduce((n,x)=>n+x.sold,0),held=lots.reduce((n,x)=>n+x.held,0),available=lots.reduce((n,x)=>n+x.available,0)
  const revenuePotentialCents=lots.reduce((n,x)=>n+x.available*x.priceCents,0)
  const velocityPerHour=lots.reduce((n,x)=>n+x.salesVelocityPerHour,0)
  const forecastHours=velocityPerHour>0?available/velocityPerHour:null
  res.json({
    release:INVENTORY_ENGINE_RELEASE,event,generatedAt:now.toISOString(),
    summary:{capacity,sold,held,available,occupancy:capacity?((sold+held)/capacity)*100:0,revenuePotentialCents,velocityPerHour,forecastHours,activeLots:lots.filter(x=>x.status.toLowerCase()==='ativo').length},
    lots,sectors:[...sectorMap.values()].map(x=>({...x,occupancy:x.capacity?((x.sold+x.held)/x.capacity)*100:0})),holds:activeHolds,recommendations:buildInventoryRecommendations(lots),
  })
})

eventsRouter.post('/:id/inventory-holds',async(req:AuthRequest,res)=>{
  const id=Number(req.params.id)
  const body=z.object({lotId:z.number().int().positive(),quantity:z.number().int().positive(),minutes:z.number().int().min(1).max(1440).default(15),reason:z.string().min(2).max(160),source:z.string().max(40).default('manual')}).parse(req.body)
  const event=await prisma.event.findUnique({where:{id},select:{id:true,producerId:true}})
  if(!event)return res.status(404).json({message:'Evento não encontrado.'})
  if(!globalAdmin(req.auth!.role)&&event.producerId!==req.auth!.producerId)return res.status(403).json({message:'Acesso negado a evento de outra produtora.'})
  const lot=await prisma.lot.findFirst({where:{id:body.lotId,eventId:id,producerId:event.producerId}})
  if(!lot)return res.status(404).json({message:'Lote não pertence ao evento.'})
  const now=new Date()
  const active=await prisma.inventoryHold.aggregate({where:{eventId:id,producerId:event.producerId,lotId:lot.id,status:'active',expiresAt:{gt:now}},_sum:{quantity:true}})
  const available=Math.max(0,lot.capacity-lot.sold-(active._sum.quantity||0))
  if(body.quantity>available)return res.status(409).json({message:`Disponibilidade insuficiente. Restam ${available} ingresso(s).`})
  const code=`HLD-${id}-${Date.now().toString(36).toUpperCase()}`
  const hold=await prisma.inventoryHold.create({data:{producerId:event.producerId,eventId:id,lotId:lot.id,code,quantity:body.quantity,status:'active',reason:body.reason,source:body.source,expiresAt:new Date(now.getTime()+body.minutes*60*1000),createdBy:String(req.auth!.id)}})
  await audit(req,req.auth!.id,event.producerId,'create','inventory_hold',String(hold.id))
  res.status(201).json(hold)
})

eventsRouter.patch('/:id/inventory-holds/:holdId/release',async(req:AuthRequest,res)=>{
  const id=Number(req.params.id),holdId=Number(req.params.holdId)
  const event=await prisma.event.findUnique({where:{id},select:{producerId:true}})
  if(!event)return res.status(404).json({message:'Evento não encontrado.'})
  if(!globalAdmin(req.auth!.role)&&event.producerId!==req.auth!.producerId)return res.status(403).json({message:'Acesso negado a evento de outra produtora.'})
  const hold=await prisma.inventoryHold.findFirst({where:{id:holdId,eventId:id,producerId:event.producerId}})
  if(!hold)return res.status(404).json({message:'Hold não encontrado.'})
  if(hold.status!=='active')return res.status(409).json({message:'Hold já encerrado.'})
  const updated=await prisma.inventoryHold.update({where:{id:holdId},data:{status:'released',releasedAt:new Date()}})
  await audit(req,req.auth!.id,event.producerId,'release','inventory_hold',String(holdId))
  res.json(updated)
})

eventsRouter.get('/:id',async(req:AuthRequest,res)=>{const id=Number(req.params.id);const event=await prisma.event.findUnique({where:{id},include:{producer:{select:{id:true,name:true}}}});if(!event)return res.status(404).json({message:'Evento não encontrado.'});if(!globalAdmin(req.auth!.role)&&event.producerId!==req.auth!.producerId)return res.status(403).json({message:'Acesso negado a evento de outra produtora.'});res.json(event)})
eventsRouter.post('/',async(req:AuthRequest,res)=>{const p=shape.parse(req.body);const producerId=globalAdmin(req.auth!.role)?p.producerId:req.auth!.producerId;if(!producerId)return res.status(400).json({message:'Produtora obrigatória.'});const created=await prisma.event.create({data:{...p,producerId} as any});await audit(req,req.auth!.id,producerId,'create','event',String(created.id));res.status(201).json(created)})
eventsRouter.put('/:id',async(req:AuthRequest,res)=>{const id=Number(req.params.id),existing=await prisma.event.findUnique({where:{id}});if(!existing)return res.status(404).json({message:'Evento não encontrado.'});if(!globalAdmin(req.auth!.role)&&existing.producerId!==req.auth!.producerId)return res.status(403).json({message:'Acesso negado a evento de outra produtora.'});const p=shape.partial().parse(req.body);const updated=await prisma.event.update({where:{id},data:p});await audit(req,req.auth!.id,existing.producerId,'update','event',String(id));res.json(updated)})

eventsRouter.get('/:id/customer-360',async(req:AuthRequest,res)=>{
  const id=Number(req.params.id); if(!Number.isFinite(id))return res.status(400).json({message:'Evento inválido.'})
  const event=await prisma.event.findUnique({where:{id},select:{id:true,code:true,title:true,producerId:true}})
  if(!event)return res.status(404).json({message:'Evento não encontrado.'})
  if(!globalAdmin(req.auth!.role)&&event.producerId!==req.auth!.producerId)return res.status(403).json({message:'Acesso negado a evento de outra produtora.'})
  const producerId=event.producerId; const search=String(req.query.search||'').trim().toLowerCase()
  const [orders,participants,tickets,checkins]=await Promise.all([
    prisma.order.findMany({where:{eventId:id,producerId},select:{id:true,buyerName:true,buyerEmail:true,buyerDocument:true,grossCents:true,status:true,createdAt:true,tickets:{select:{id:true,participantId:true}}},orderBy:{createdAt:'desc'}}),
    prisma.participant.findMany({where:{eventId:id,producerId},select:{id:true,name:true,email:true,phone:true,document:true,createdAt:true}}),
    prisma.ticket.findMany({where:{eventId:id,producerId},select:{id:true,participantId:true,orderId:true}}),
    prisma.checkIn.findMany({where:{eventId:id,producerId,status:'presente'},select:{participantId:true}}),
  ])
  const by=new Map<string,any>(); const now=Date.now(); const ensure=(key:string,base:any)=>{if(!by.has(key))by.set(key,{key,name:base.name||'Cliente',email:base.email||null,phone:base.phone||null,document:base.document||null,orderIds:new Set<number>(),ticketIds:new Set<number>(),participantIds:new Set<number>(),checkins:0,grossCents:0,dates:[] as Date[]});return by.get(key)}
  for(const p of participants){const key=customerKey({document:p.document,email:p.email,phone:p.phone,name:p.name});const c=ensure(key,p);c.participantIds.add(p.id)}
  const participantKey=new Map<number,string>(); for(const p of participants)participantKey.set(p.id,customerKey({document:p.document,email:p.email,phone:p.phone,name:p.name}))
  for(const o of orders){if(o.status!=='pago')continue;let key=customerKey({document:o.buyerDocument,email:o.buyerEmail,name:o.buyerName});const linked=o.tickets.find(t=>t.participantId&&participantKey.has(t.participantId));if(linked?.participantId)key=participantKey.get(linked.participantId)!;const c=ensure(key,{name:o.buyerName,email:o.buyerEmail,document:o.buyerDocument});c.orderIds.add(o.id);c.grossCents+=o.grossCents;c.dates.push(o.createdAt);for(const t of o.tickets)c.ticketIds.add(t.id)}
  for(const t of tickets){if(t.participantId&&participantKey.has(t.participantId)){const c=by.get(participantKey.get(t.participantId)!);if(c)c.ticketIds.add(t.id)}}
  for(const ci of checkins){if(ci.participantId&&participantKey.has(ci.participantId)){const c=by.get(participantKey.get(ci.participantId)!);if(c)c.checkins++}}
  let customers=Array.from(by.values()).map(c=>{const dates=c.dates.sort((a:Date,b:Date)=>a.getTime()-b.getTime());const last=dates.at(-1)||null;const recency=last?Math.floor((now-last.getTime())/86400000):null;const frequency=c.orderIds.size;const cls=classifyCustomer(recency,frequency,c.grossCents);return {key:c.key,name:c.name,email:c.email,phone:c.phone,document:c.document,orders:frequency,tickets:c.ticketIds.size,checkins:c.checkins,grossCents:c.grossCents,firstPurchaseAt:dates[0]?.toISOString()||null,lastPurchaseAt:last?.toISOString()||null,recencyDays:recency,frequency,monetaryCents:c.grossCents,segment:cls.segment,score:cls.score}})
  if(search)customers=customers.filter(c=>`${c.name} ${c.email||''} ${c.phone||''} ${c.document||''}`.toLowerCase().includes(search))
  customers.sort((a,b)=>b.score-a.score||b.grossCents-a.grossCents)
  const segmentMap=new Map<string,{name:string;customers:number;grossCents:number}>();for(const c of customers){const x=segmentMap.get(c.segment)||{name:c.segment,customers:0,grossCents:0};x.customers++;x.grossCents+=c.grossCents;segmentMap.set(c.segment,x)}
  const buyers=customers.filter(c=>c.orders>0);const grossCents=buyers.reduce((n,c)=>n+c.grossCents,0);const identified=customers.filter(c=>c.document||c.email||c.phone).length
  res.json({release:CUSTOMER_360_RELEASE,generatedAt:new Date().toISOString(),event,summary:{customers:customers.length,buyers:buyers.length,participants:participants.length,repeatCustomers:customers.filter(c=>c.orders>1).length,vipCustomers:customers.filter(c=>c.segment==='VIP'||c.segment==='Alto valor').length,atRiskCustomers:customers.filter(c=>c.segment==='Em risco').length,grossCents,averageTicketCents:buyers.length?Math.round(grossCents/buyers.length):0,identifiedRate:customers.length?Math.round(identified/customers.length*1000)/10:0},segments:Array.from(segmentMap.values()).sort((a,b)=>b.grossCents-a.grossCents),customers})
})

// ===== Fase 26.x completa — 26.4 Live Ops até 26.15 Platform NOC =====
eventsRouter.get('/:id/event-os/advanced',async(req:AuthRequest,res)=>{
  const id=Number(req.params.id); const event=await prisma.event.findUnique({where:{id}})
  if(!event)return res.status(404).json({message:'Evento não encontrado.'})
  if(!globalAdmin(req.auth!.role)&&event.producerId!==req.auth!.producerId)return res.status(403).json({message:'Acesso negado a evento de outra produtora.'})
  const producerId=event.producerId, now=new Date(), h1=new Date(now.getTime()-3600000)
  const [orders,lots,checkins,checkins1h,incidents,readiness,audits]=await Promise.all([
    prisma.order.findMany({where:{eventId:id,producerId},select:{status:true,grossCents:true,createdAt:true},orderBy:{createdAt:'desc'},take:80}),
    prisma.lot.findMany({where:{eventId:id,producerId},select:{capacity:true,sold:true,status:true}}),
    prisma.checkIn.count({where:{eventId:id,producerId,status:'presente'}}),
    prisma.checkIn.count({where:{eventId:id,producerId,status:'presente',checkedAt:{gte:h1}}}),
    prisma.eventIncident.findMany({where:{eventId:id,producerId},orderBy:{openedAt:'desc'},take:20}),
    prisma.eventReadinessCheck.findMany({where:{eventId:id,producerId},orderBy:{checkedAt:'desc'}}),
    prisma.auditLog.findMany({where:{producerId},orderBy:{createdAt:'desc'},take:20}),
  ])
  const paid=orders.filter(x=>x.status==='pago'), revenueCents=paid.reduce((n,x)=>n+x.grossCents,0), capacity=lots.reduce((n,x)=>n+x.capacity,0), sold=lots.reduce((n,x)=>n+x.sold,0), available=Math.max(0,capacity-sold), occupancy=capacity?sold/capacity*100:0
  const open=incidents.filter(x=>x.status!=='resolved'&&x.status!=='closed'), critical=open.filter(x=>x.severity==='critical')
  const ok=readiness.filter(x=>x.status==='ok'||x.status==='ready'||x.status==='passed').length, readinessScore=readiness.length?Math.round(ok/readiness.length*100):0
  const signals:any[]=[]
  if(occupancy>=90)signals.push({code:'capacity-high',severity:'warning',title:'Capacidade próxima do limite',message:`Ocupação em ${occupancy.toFixed(1)}%.`})
  if(critical.length)signals.push({code:'critical-incidents',severity:'critical',title:'Incidente crítico aberto',message:`${critical.length} incidente(s) crítico(s) exigem atuação.`})
  if(readinessScore<80)signals.push({code:'readiness-low',severity:'warning',title:'Go-live requer atenção',message:`Readiness atual em ${readinessScore}%.`})
  if(!signals.length)signals.push({code:'healthy',severity:'info',title:'Operação estável',message:'Nenhum sinal crítico detectado no contexto atual.'})
  const activity=[...incidents.slice(0,10).map(x=>({id:`incident-${x.id}`,title:x.title,detail:`${x.category} · ${x.status} · ${x.severity}`,at:x.openedAt.toISOString(),type:'incident'})),...audits.slice(0,10).map(x=>({id:`audit-${x.id}`,title:`${x.action} · ${x.resource}`,detail:x.details||x.status,at:x.createdAt.toISOString(),type:'audit'}))].sort((a,b)=>b.at.localeCompare(a.at)).slice(0,20)
  res.json({release:'26.x-complete-event-os-2026-09-03',generatedAt:now.toISOString(),event:{id:event.id,code:event.code,title:event.title,producerId},kpis:{revenueCents,paidOrders:paid.length,checkins,checkins1h,capacity,sold,available,occupancy,openIncidents:open.length,criticalIncidents:critical.length,readinessScore},signals,readiness:readiness.map(x=>({key:x.checkKey,label:x.label,status:x.status,detail:x.detail})),activity})
})
