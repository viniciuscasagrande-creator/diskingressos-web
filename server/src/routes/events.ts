import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { globalAdmin } from '../auth.js'
import { audit } from '../audit.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { buildEventHealth } from '../services/eventOS.js'
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
    release:'26.0-event-os-master-foundation-2026-09-03',
    event:{id:event.id,code:event.code,title:event.title,producerId:event.producerId,producerName:event.producer.name,status:event.status},
    kpis:{revenueCents,paidOrders:paid.length,tickets,participants,checkins,inventoryCapacity,inventorySold,inventoryAvailable:Math.max(0,inventoryCapacity-inventorySold),occupancy,openRecoveries:openRecoveries.length,recoverableCents,recoveredCents,activeCampaigns},
    health:{score:health.score},readiness:health.readiness,alerts:health.alerts,
  })
})
eventsRouter.get('/:id',async(req:AuthRequest,res)=>{const id=Number(req.params.id);const event=await prisma.event.findUnique({where:{id},include:{producer:{select:{id:true,name:true}}}});if(!event)return res.status(404).json({message:'Evento não encontrado.'});if(!globalAdmin(req.auth!.role)&&event.producerId!==req.auth!.producerId)return res.status(403).json({message:'Acesso negado a evento de outra produtora.'});res.json(event)})
eventsRouter.post('/',async(req:AuthRequest,res)=>{const p=shape.parse(req.body);const producerId=globalAdmin(req.auth!.role)?p.producerId:req.auth!.producerId;if(!producerId)return res.status(400).json({message:'Produtora obrigatória.'});const created=await prisma.event.create({data:{...p,producerId} as any});await audit(req,req.auth!.id,producerId,'create','event',String(created.id));res.status(201).json(created)})
eventsRouter.put('/:id',async(req:AuthRequest,res)=>{const id=Number(req.params.id),existing=await prisma.event.findUnique({where:{id}});if(!existing)return res.status(404).json({message:'Evento não encontrado.'});if(!globalAdmin(req.auth!.role)&&existing.producerId!==req.auth!.producerId)return res.status(403).json({message:'Acesso negado a evento de outra produtora.'});const p=shape.partial().parse(req.body);const updated=await prisma.event.update({where:{id},data:p});await audit(req,req.auth!.id,existing.producerId,'update','event',String(id));res.json(updated)})
