import { Router } from 'express'
import { z } from 'zod'
import crypto from 'node:crypto'
import { prisma } from '../prisma.js'
import { requireAuth, requireRoles, type AuthRequest } from '../middleware/auth.js'
import { globalAdmin } from '../auth.js'
import { requestedProducerId, writeProducerId, ownsProducer } from '../tenant.js'
import { audit } from '../audit.js'
import { trackingRouter } from './tracking.js'

export const marketingRouter=Router()
marketingRouter.use(requireAuth)
marketingRouter.use('/integrations', trackingRouter)
const marketingWriteRoles=['admin-master','admin','producer-admin','producer-marketing']
const marketingReadRoles=[...marketingWriteRoles,'viewer']

const campaignSchema=z.object({
  name:z.string().min(2), channel:z.string().min(2), objective:z.string().default('conversao'), status:z.string().default('rascunho'),
  budgetCents:z.number().int().nonnegative().default(0), startsAt:z.string().optional().nullable(), endsAt:z.string().optional().nullable(),
  producerId:z.number().int().positive().optional(), eventId:z.number().int().positive().optional().nullable()
})

marketingRouter.get('/campaigns',requireRoles(...marketingReadRoles),async(req:AuthRequest,res)=>{
  const producerId=requestedProducerId(req); const eventId=req.query.eventId?Number(req.query.eventId):undefined
  const rows=await prisma.marketingCampaign.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{})},include:{event:{select:{id:true,title:true}},producer:{select:{id:true,name:true}}},orderBy:{createdAt:'desc'}})
  res.json(rows)
})
marketingRouter.post('/campaigns',requireRoles(...marketingWriteRoles),async(req:AuthRequest,res)=>{
  const parsed=campaignSchema.safeParse(req.body); if(!parsed.success)return res.status(400).json({message:'Dados de campanha inválidos.',issues:parsed.error.issues})
  const body=parsed.data; let producerId=writeProducerId(req,body.producerId)
  if(body.eventId){const event=await prisma.event.findUnique({where:{id:body.eventId}});if(!event||!ownsProducer(req,event.producerId))return res.status(404).json({message:'Evento não encontrado.'});producerId=event.producerId}
  if(!producerId)return res.status(400).json({message:'Selecione uma produtora ou um evento.'})
  const row=await prisma.marketingCampaign.create({data:{name:body.name,channel:body.channel,objective:body.objective,status:body.status,budgetCents:body.budgetCents,startsAt:body.startsAt?new Date(body.startsAt):null,endsAt:body.endsAt?new Date(body.endsAt):null,producerId,eventId:body.eventId||null}})
  await audit(req,'marketing.campaign.create','MarketingCampaign',String(row.id),{name:row.name})
  res.status(201).json(row)
})
marketingRouter.patch('/campaigns/:id',requireRoles(...marketingWriteRoles),async(req:AuthRequest,res)=>{
  const id=Number(req.params.id); const current=await prisma.marketingCampaign.findUnique({where:{id}})
  if(!current||!ownsProducer(req,current.producerId))return res.status(404).json({message:'Campanha não encontrada.'})
  const patch=z.object({status:z.string().optional(),name:z.string().min(2).optional(),budgetCents:z.number().int().nonnegative().optional()}).safeParse(req.body)
  if(!patch.success)return res.status(400).json({message:'Alteração inválida.'})
  const row=await prisma.marketingCampaign.update({where:{id},data:patch.data});await audit(req,'marketing.campaign.update','MarketingCampaign',String(id),patch.data);res.json(row)
})

const linkSchema=z.object({name:z.string().min(2),destination:z.string().url(),source:z.string().optional().nullable(),medium:z.string().optional().nullable(),campaign:z.string().optional().nullable(),content:z.string().optional().nullable(),term:z.string().optional().nullable(),producerId:z.number().int().positive().optional(),eventId:z.number().int().positive().optional().nullable()})
marketingRouter.get('/links',requireRoles(...marketingReadRoles),async(req:AuthRequest,res)=>{const producerId=requestedProducerId(req);const eventId=req.query.eventId?Number(req.query.eventId):undefined;const rows=await prisma.trackingLink.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{})},include:{event:{select:{id:true,title:true}}},orderBy:{createdAt:'desc'}});res.json(rows.map(r=>({...r,trackedUrl:buildTrackedUrl(r),qrPayload:`${process.env.PUBLIC_APP_URL||'http://localhost:5173'}/r/${r.code}`})))})
marketingRouter.post('/links',requireRoles(...marketingWriteRoles),async(req:AuthRequest,res)=>{
 const parsed=linkSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Dados do link inválidos.',issues:parsed.error.issues});const body=parsed.data;let producerId=writeProducerId(req,body.producerId)
 if(body.eventId){const event=await prisma.event.findUnique({where:{id:body.eventId}});if(!event||!ownsProducer(req,event.producerId))return res.status(404).json({message:'Evento não encontrado.'});producerId=event.producerId}
 if(!producerId)return res.status(400).json({message:'Selecione uma produtora ou evento.'})
 const code=crypto.randomBytes(4).toString('hex');const row=await prisma.trackingLink.create({data:{...body,producerId,eventId:body.eventId||null,code}});await audit(req,'marketing.link.create','TrackingLink',String(row.id),{name:row.name});res.status(201).json({...row,trackedUrl:buildTrackedUrl(row),qrPayload:`${process.env.PUBLIC_APP_URL||'http://localhost:5173'}/r/${row.code}`})
})
marketingRouter.post('/links/:id/click',requireRoles(...marketingWriteRoles),async(req:AuthRequest,res)=>{const id=Number(req.params.id);const current=await prisma.trackingLink.findUnique({where:{id}});if(!current||!ownsProducer(req,current.producerId))return res.status(404).json({message:'Link não encontrado.'});res.json(await prisma.trackingLink.update({where:{id},data:{clicks:{increment:1}}}))})

const providers=['meta_pixel','ga4','gtm','google_ads','whatsapp','email','automation_api'] as const
const trackingSchema=z.object({provider:z.enum(providers),scope:z.enum(['global','producer','event']),mode:z.enum(['inherit','own','disabled']),externalId:z.string().optional().nullable(),configJson:z.string().optional().nullable(),producerId:z.number().int().positive().optional().nullable(),eventId:z.number().int().positive().optional().nullable()})
marketingRouter.get('/tracking',requireRoles(...marketingReadRoles),async(req:AuthRequest,res)=>{const producerId=requestedProducerId(req);const eventId=req.query.eventId?Number(req.query.eventId):undefined;const rows=await prisma.trackingConfig.findMany({where:{OR:[{scope:'global'},...(producerId?[{scope:'producer',producerId}]:[]),...(eventId?[{scope:'event',eventId}]:[])]},orderBy:[{provider:'asc'},{scope:'asc'}]});res.json(rows)})
marketingRouter.put('/tracking',requireRoles(...marketingWriteRoles),async(req:AuthRequest,res)=>{
 const parsed=trackingSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Configuração inválida.',issues:parsed.error.issues});const body=parsed.data
 if(body.scope==='global'&&!globalAdmin(req.auth!.role))return res.status(403).json({message:'Somente administradores globais podem alterar configuração global.'})
 let producerId:number|null=null;let eventId:number|null=null
 if(body.scope==='producer'){producerId=globalAdmin(req.auth!.role)?(body.producerId||null):(req.auth!.producerId||null);if(!producerId)return res.status(400).json({message:'Produtora obrigatória.'})}
 if(body.scope==='event'){if(!body.eventId)return res.status(400).json({message:'Evento obrigatório.'});const event=await prisma.event.findUnique({where:{id:body.eventId}});if(!event||!ownsProducer(req,event.producerId))return res.status(404).json({message:'Evento não encontrado.'});eventId=event.id;producerId=event.producerId}
 const existing=await prisma.trackingConfig.findFirst({where:{provider:body.provider,scope:body.scope,producerId,eventId}})
 const data={provider:body.provider,scope:body.scope,mode:body.mode,externalId:body.externalId||null,configJson:body.configJson||null,producerId,eventId}
 const row=existing?await prisma.trackingConfig.update({where:{id:existing.id},data}):await prisma.trackingConfig.create({data})
 await audit(req,'marketing.tracking.save','TrackingConfig',String(row.id),{provider:row.provider,scope:row.scope,mode:row.mode});res.json(row)
})
marketingRouter.get('/tracking/resolved',requireRoles(...marketingReadRoles),async(req:AuthRequest,res)=>{
 const eventId=req.query.eventId?Number(req.query.eventId):undefined;let producerId=requestedProducerId(req)
 if(eventId){const event=await prisma.event.findUnique({where:{id:eventId}});if(!event||!ownsProducer(req,event.producerId))return res.status(404).json({message:'Evento não encontrado.'});producerId=event.producerId}
 const rows=await prisma.trackingConfig.findMany({where:{OR:[{scope:'global'},...(producerId?[{scope:'producer',producerId}]:[]),...(eventId?[{scope:'event',eventId}]:[])]}})
 const result=providers.map(provider=>{const configs=rows.filter(r=>r.provider===provider);const eventCfg=configs.find(r=>r.scope==='event'&&r.eventId===eventId);const producerCfg=configs.find(r=>r.scope==='producer'&&r.producerId===producerId);const globalCfg=configs.find(r=>r.scope==='global');const selected=[eventCfg,producerCfg,globalCfg].find(c=>c&&c.mode!=='inherit')||globalCfg||producerCfg||eventCfg;return {provider,source:selected?.scope||'none',mode:selected?.mode||'disabled',externalId:selected?.externalId||null,configJson:selected?.configJson||null}})
 res.json(result)
})

function buildTrackedUrl(r:{destination:string;source:string|null;medium:string|null;campaign:string|null;content:string|null;term:string|null}){const url=new URL(r.destination);if(r.source)url.searchParams.set('utm_source',r.source);if(r.medium)url.searchParams.set('utm_medium',r.medium);if(r.campaign)url.searchParams.set('utm_campaign',r.campaign);if(r.content)url.searchParams.set('utm_content',r.content);if(r.term)url.searchParams.set('utm_term',r.term);return url.toString()}
