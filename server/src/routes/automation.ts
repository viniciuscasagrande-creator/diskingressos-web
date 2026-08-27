import { Router } from 'express'
import { z } from 'zod'
import crypto from 'node:crypto'
import { prisma } from '../prisma.js'
import { requireAuth, requireRoles, type AuthRequest } from '../middleware/auth.js'
import { requestedProducerId, writeProducerId, ownsProducer } from '../tenant.js'
import { audit } from '../audit.js'

export const automationRouter=Router()
automationRouter.use(requireAuth)
const writeRoles=['admin-master','admin','producer-admin','producer-marketing']
const readRoles=[...writeRoles,'viewer']

const flowSchema=z.object({
  name:z.string().min(2), trigger:z.string().min(2), channel:z.enum(['whatsapp','email','multicanal']),
  audience:z.string().default('compradores'), status:z.enum(['rascunho','ativo','pausado']).default('rascunho'),
  delayMinutes:z.number().int().nonnegative().max(525600).default(0), producerId:z.number().int().positive().optional(), eventId:z.number().int().positive().optional().nullable()
})

automationRouter.get('/flows',requireRoles(...readRoles),async(req:AuthRequest,res)=>{
  const producerId=requestedProducerId(req);const eventId=req.query.eventId?Number(req.query.eventId):undefined
  const rows=await prisma.automationFlow.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{})},include:{event:{select:{id:true,title:true}}},orderBy:{createdAt:'desc'}})
  res.json(rows)
})
automationRouter.post('/flows',requireRoles(...writeRoles),async(req:AuthRequest,res)=>{
  const parsed=flowSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Dados da automação inválidos.',issues:parsed.error.issues})
  const body=parsed.data;let producerId=writeProducerId(req,body.producerId)
  if(body.eventId){const event=await prisma.event.findUnique({where:{id:body.eventId}});if(!event||!ownsProducer(req,event.producerId))return res.status(404).json({message:'Evento não encontrado.'});producerId=event.producerId}
  if(!producerId)return res.status(400).json({message:'Selecione uma produtora ou evento.'})
  const row=await prisma.automationFlow.create({data:{...body,producerId,eventId:body.eventId||null}})
  await audit(req,'automation.flow.create','AutomationFlow',String(row.id),{name:row.name,trigger:row.trigger});res.status(201).json(row)
})
automationRouter.patch('/flows/:id',requireRoles(...writeRoles),async(req:AuthRequest,res)=>{
  const id=Number(req.params.id);const current=await prisma.automationFlow.findUnique({where:{id}});if(!current||!ownsProducer(req,current.producerId))return res.status(404).json({message:'Automação não encontrada.'})
  const patch=z.object({status:z.enum(['rascunho','ativo','pausado']).optional(),name:z.string().min(2).optional(),delayMinutes:z.number().int().nonnegative().optional()}).safeParse(req.body)
  if(!patch.success)return res.status(400).json({message:'Alteração inválida.'})
  const row=await prisma.automationFlow.update({where:{id},data:patch.data});await audit(req,'automation.flow.update','AutomationFlow',String(id),patch.data);res.json(row)
})

const templateSchema=z.object({name:z.string().min(2),channel:z.enum(['whatsapp','email']),category:z.string().default('marketing'),subject:z.string().optional().nullable(),body:z.string().min(3),status:z.enum(['ativo','inativo']).default('ativo'),producerId:z.number().int().positive().optional(),eventId:z.number().int().positive().optional().nullable()})
automationRouter.get('/templates',requireRoles(...readRoles),async(req:AuthRequest,res)=>{const producerId=requestedProducerId(req);const eventId=req.query.eventId?Number(req.query.eventId):undefined;const channel=req.query.channel?String(req.query.channel):undefined;const rows=await prisma.messageTemplate.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{}),...(channel?{channel}:{})},include:{event:{select:{id:true,title:true}}},orderBy:{createdAt:'desc'}});res.json(rows)})
automationRouter.post('/templates',requireRoles(...writeRoles),async(req:AuthRequest,res)=>{const parsed=templateSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Template inválido.',issues:parsed.error.issues});const body=parsed.data;let producerId=writeProducerId(req,body.producerId);if(body.eventId){const event=await prisma.event.findUnique({where:{id:body.eventId}});if(!event||!ownsProducer(req,event.producerId))return res.status(404).json({message:'Evento não encontrado.'});producerId=event.producerId}if(!producerId)return res.status(400).json({message:'Selecione uma produtora ou evento.'});const row=await prisma.messageTemplate.create({data:{...body,producerId,eventId:body.eventId||null}});await audit(req,'automation.template.create','MessageTemplate',String(row.id),{name:row.name,channel:row.channel});res.status(201).json(row)})

automationRouter.get('/executions',requireRoles(...readRoles),async(req:AuthRequest,res)=>{const producerId=requestedProducerId(req);const rows=await prisma.automationExecution.findMany({where:{...(producerId?{producerId}:{})},include:{flow:{select:{id:true,name:true,trigger:true}},event:{select:{id:true,title:true}}},orderBy:{scheduledAt:'desc'},take:100});res.json(rows)})
automationRouter.post('/flows/:id/test',requireRoles(...writeRoles),async(req:AuthRequest,res)=>{const id=Number(req.params.id);const flow=await prisma.automationFlow.findUnique({where:{id}});if(!flow||!ownsProducer(req,flow.producerId))return res.status(404).json({message:'Automação não encontrada.'});const execution=await prisma.automationExecution.create({data:{channel:flow.channel==='multicanal'?'whatsapp':flow.channel,destination:'contato-demo',status:'enviado',scheduledAt:new Date(),executedAt:new Date(),messagePreview:`Teste do fluxo ${flow.name}`,producerId:flow.producerId,eventId:flow.eventId,flowId:flow.id}});await prisma.automationFlow.update({where:{id},data:{sentCount:{increment:1}}});await audit(req,'automation.flow.test','AutomationFlow',String(id),{executionId:execution.id});res.status(201).json(execution)})

const recoverySchema=z.object({kind:z.enum(['carrinho','pagamento','inativo','pos_evento']).default('carrinho'),customerName:z.string().min(2),email:z.string().email().optional().nullable(),phone:z.string().optional().nullable(),amountCents:z.number().int().nonnegative(),preferredChannel:z.enum(['whatsapp','email']).default('whatsapp'),producerId:z.number().int().positive().optional(),eventId:z.number().int().positive().optional().nullable()})
automationRouter.get('/recoveries',requireRoles(...readRoles),async(req:AuthRequest,res)=>{const producerId=requestedProducerId(req);const eventId=req.query.eventId?Number(req.query.eventId):undefined;const kind=req.query.kind?String(req.query.kind):undefined;const rows=await prisma.recoveryOpportunity.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{}),...(kind?{kind}:{})},include:{event:{select:{id:true,title:true}}},orderBy:{lastActivityAt:'desc'}});res.json(rows)})
automationRouter.post('/recoveries',requireRoles(...writeRoles),async(req:AuthRequest,res)=>{const parsed=recoverySchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Oportunidade inválida.',issues:parsed.error.issues});const body=parsed.data;let producerId=writeProducerId(req,body.producerId);if(body.eventId){const event=await prisma.event.findUnique({where:{id:body.eventId}});if(!event||!ownsProducer(req,event.producerId))return res.status(404).json({message:'Evento não encontrado.'});producerId=event.producerId}if(!producerId)return res.status(400).json({message:'Selecione uma produtora ou evento.'});const row=await prisma.recoveryOpportunity.create({data:{...body,producerId,eventId:body.eventId||null,code:`REC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`}});res.status(201).json(row)})
automationRouter.patch('/recoveries/:id/recover',requireRoles(...writeRoles),async(req:AuthRequest,res)=>{const id=Number(req.params.id);const current=await prisma.recoveryOpportunity.findUnique({where:{id}});if(!current||!ownsProducer(req,current.producerId))return res.status(404).json({message:'Oportunidade não encontrada.'});const row=await prisma.recoveryOpportunity.update({where:{id},data:{status:'recuperado',recoveredAt:new Date(),revenueCents:current.amountCents}});await audit(req,'remarketing.recovery.complete','RecoveryOpportunity',String(id),{amountCents:current.amountCents});res.json(row)})

automationRouter.get('/summary',requireRoles(...readRoles),async(req:AuthRequest,res)=>{const producerId=requestedProducerId(req);const where=producerId?{producerId}:{};const [flows,recoveries,executions,templates]=await Promise.all([prisma.automationFlow.findMany({where}),prisma.recoveryOpportunity.findMany({where}),prisma.automationExecution.findMany({where}),prisma.messageTemplate.count({where})]);const open=recoveries.filter(r=>r.status==='aberto');const recovered=recoveries.filter(r=>r.status==='recuperado');res.json({activeFlows:flows.filter(f=>f.status==='ativo').length,totalFlows:flows.length,templates,executions:executions.length,openRecoveries:open.length,potentialCents:open.reduce((a,r)=>a+r.amountCents,0),recoveredCount:recovered.length,recoveredCents:recovered.reduce((a,r)=>a+r.revenueCents,0),sent:flows.reduce((a,f)=>a+f.sentCount,0),conversions:flows.reduce((a,f)=>a+f.convertedCount,0)})})
