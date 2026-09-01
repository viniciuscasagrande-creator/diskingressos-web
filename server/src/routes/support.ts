import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { tenantProducerId, tenantWhere } from '../tenant.js'

export const supportRouter=Router()
supportRouter.use(requireAuth)

const ticketSchema=z.object({
  subject:z.string().min(3), description:z.string().min(3), category:z.string().default('incidente'),
  impact:z.enum(['baixo','medio','alto','critico']).default('medio'), urgency:z.enum(['baixa','media','alta','critica']).default('media'),
  channel:z.string().default('portal'), eventId:z.number().int().positive().nullable().optional(), requesterName:z.string().min(2), requesterEmail:z.string().email().optional().or(z.literal('')),
  requesterPhone:z.string().optional(), assignedTo:z.string().optional()
})

function priority(impact:string,urgency:string){
 const score:{[k:string]:number}={baixo:1,baixa:1,medio:2,media:2,alto:3,alta:3,critico:4,critica:4}
 const s=(score[impact]||2)+(score[urgency]||2)
 return s>=7?'P1':s>=5?'P2':s>=3?'P3':'P4'
}
function sla(priority:string){return priority==='P1'?{response:15,resolution:240}:priority==='P2'?{response:30,resolution:480}:priority==='P3'?{response:120,resolution:1440}:{response:240,resolution:2880}}

supportRouter.get('/tickets',async(req:AuthRequest,res)=>{
 const where=tenantWhere(req.user!,req.query.producerId)
 const rows=await prisma.serviceTicket.findMany({where,orderBy:{createdAt:'desc'},take:200})
 res.json(rows)
})
supportRouter.post('/tickets',async(req:AuthRequest,res)=>{
 const parsed=ticketSchema.safeParse(req.body); if(!parsed.success)return res.status(400).json({message:'Dados inválidos.',issues:parsed.error.flatten()})
 const producerId=tenantProducerId(req.user!,req.body.producerId); if(!producerId)return res.status(400).json({message:'Selecione uma produtora.'})
 const p=priority(parsed.data.impact,parsed.data.urgency), limits=sla(p), now=Date.now()
 const count=await prisma.serviceTicket.count()
 const row=await prisma.serviceTicket.create({data:{...parsed.data,requesterEmail:parsed.data.requesterEmail||null,requesterPhone:parsed.data.requesterPhone||null,assignedTo:parsed.data.assignedTo||null,eventId:parsed.data.eventId||null,producerId,code:`SAC-${String(count+1).padStart(6,'0')}`,priority:p,status:'aberto',responseDueAt:new Date(now+limits.response*60000),resolutionDueAt:new Date(now+limits.resolution*60000)}})
 res.status(201).json(row)
})
supportRouter.patch('/tickets/:id',async(req:AuthRequest,res)=>{
 const id=Number(req.params.id), where=tenantWhere(req.user!,req.body.producerId)
 const exists=await prisma.serviceTicket.findFirst({where:{id,...where}}); if(!exists)return res.status(404).json({message:'Chamado não encontrado.'})
 const allowed:any={}; for(const k of ['status','assignedTo','priority','category']) if(req.body[k]!==undefined) allowed[k]=req.body[k]
 if(req.body.status==='resolvido') allowed.resolvedAt=new Date(); if(req.body.status==='fechado') allowed.closedAt=new Date()
 const row=await prisma.serviceTicket.update({where:{id},data:allowed}); res.json(row)
})
supportRouter.post('/tickets/:id/messages',async(req:AuthRequest,res)=>{
 const id=Number(req.params.id), schema=z.object({author:z.string().min(2),body:z.string().min(1),channel:z.string().default('interno'),internal:z.boolean().default(false)}), parsed=schema.safeParse(req.body)
 if(!parsed.success)return res.status(400).json({message:'Mensagem inválida.'})
 const where=tenantWhere(req.user!,req.body.producerId); const ticket=await prisma.serviceTicket.findFirst({where:{id,...where}}); if(!ticket)return res.status(404).json({message:'Chamado não encontrado.'})
 const msg=await prisma.ticketMessage.create({data:{...parsed.data,ticketId:id,producerId:ticket.producerId}}); res.status(201).json(msg)
})
supportRouter.get('/summary',async(req:AuthRequest,res)=>{
 const where=tenantWhere(req.user!,req.query.producerId), rows=await prisma.serviceTicket.findMany({where})
 const now=Date.now(); const open=rows.filter(x=>!['resolvido','fechado'].includes(x.status));
 res.json({total:rows.length,open:open.length,p1:open.filter(x=>x.priority==='P1').length,overdue:open.filter(x=>x.resolutionDueAt.getTime()<now).length,resolved:rows.filter(x=>x.status==='resolvido'||x.status==='fechado').length,slaCompliance:rows.length?Math.round((rows.filter(x=>!x.slaBreached).length/rows.length)*100):100})
})
supportRouter.get('/sla-policies',async(req:AuthRequest,res)=>{const where=tenantWhere(req.user!,req.query.producerId);res.json(await prisma.slaPolicy.findMany({where,orderBy:{priority:'asc'}}))})
supportRouter.get('/integrations',async(req:AuthRequest,res)=>{const where=tenantWhere(req.user!,req.query.producerId);res.json(await prisma.supportIntegration.findMany({where,orderBy:{name:'asc'}}))})
