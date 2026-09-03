import { Router } from 'express'
import { z } from 'zod'
import crypto from 'node:crypto'
import { prisma } from '../prisma.js'
import { requireAuth, requireRoles, type AuthRequest } from '../middleware/auth.js'
import { globalAdmin } from '../auth.js'
import { requestedProducerId, writeProducerId, ownsProducer } from '../tenant.js'
import { audit } from '../audit.js'

export const marketingRouter=Router()
marketingRouter.use(requireAuth)
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
 const code=crypto.randomBytes(4).toString('hex');const row=await prisma.trackingLink.create({data:{...body,producerId,eventId:body.eventId||null,code} as any});await audit(req,'marketing.link.create','TrackingLink',String(row.id),{name:row.name});res.status(201).json({...row,trackedUrl:buildTrackedUrl(row),qrPayload:`${process.env.PUBLIC_APP_URL||'http://localhost:5173'}/r/${row.code}`})
})
marketingRouter.post('/links/:id/click',requireRoles(...marketingWriteRoles),async(req:AuthRequest,res)=>{const id=Number(req.params.id);const current=await prisma.trackingLink.findUnique({where:{id}});if(!current||!ownsProducer(req,current.producerId))return res.status(404).json({message:'Link não encontrado.'});res.json(await prisma.trackingLink.update({where:{id},data:{clicks:{increment:1}}}))})

// Fase 16.4 — Central UTM & Conversões: uma URL selecionada alimenta KPIs, funil, gráficos e pedidos.
marketingRouter.get('/utm/dashboard',requireRoles(...marketingReadRoles),async(req:AuthRequest,res)=>{
 const eventId=Number(req.query.eventId);const linkId=Number(req.query.linkId)
 if(!eventId||!linkId)return res.status(400).json({message:'Evento e link UTM são obrigatórios.'})
 const event=await prisma.event.findUnique({where:{id:eventId}});if(!event||!ownsProducer(req,event.producerId))return res.status(404).json({message:'Evento não encontrado.'})
 const link=await prisma.trackingLink.findUnique({where:{id:linkId}});if(!link||link.eventId!==eventId||!ownsProducer(req,link.producerId))return res.status(404).json({message:'Link UTM não encontrado para este evento.'})
 const [actions,attributions]=await Promise.all([prisma.trackingJourneyAction.findMany({where:{trackingLinkId:linkId,eventId},orderBy:{createdAt:'desc'},take:250}),prisma.trackingAttribution.findMany({where:{trackingLinkId:linkId,eventId},include:{order:{select:{id:true,code:true,status:true,grossCents:true}}},orderBy:{lastActivityAt:'desc'},take:250})])
 const count=(name:string)=>actions.filter(a=>a.action===name).length
 const finalized=count('finalized');const revenueCents=actions.filter(a=>a.action==='finalized').reduce((sum,a)=>sum+a.amountCents,0)
 const activeAttributions=attributions.filter(a=>a.status==='active').length;const abandonedAttributions=attributions.filter(a=>a.status==='abandoned').length;const convertedAttributions=attributions.filter(a=>a.status==='converted').length;const summary={visits:link.clicks,attributedSessions:attributions.length,activeAttributions,abandonedAttributions,convertedAttributions,added:count('added'),checkout:count('checkout'),removed:count('removed'),abandoned:count('abandoned'),finalized,revenueCents,avgTicketCents:finalized?Math.round(revenueCents/finalized):0,conversionRate:link.clicks?Number(((finalized/link.clicks)*100).toFixed(2)):0}
 const byDate=new Map<string,any>(); const byHour=new Map<number,any>()
 for(const action of actions){
   const d=action.createdAt; const date=d.toISOString().slice(0,10); const hour=d.getHours()
   if(!byDate.has(date))byDate.set(date,{date,added:0,checkout:0,removed:0,abandoned:0,finalized:0,revenueCents:0})
   if(!byHour.has(hour))byHour.set(hour,{hour,added:0,checkout:0,removed:0,abandoned:0,finalized:0})
   const dateRow=byDate.get(date);const hourRow=byHour.get(hour);if(action.action in dateRow)dateRow[action.action]++;if(action.action in hourRow)hourRow[action.action]++;if(action.action==='finalized')dateRow.revenueCents+=action.amountCents
 }
 const timeline=[...byDate.values()].sort((a,b)=>a.date.localeCompare(b.date));const hours=[...Array(24)].map((_,hour)=>byHour.get(hour)||{hour,added:0,checkout:0,removed:0,abandoned:0,finalized:0})
 res.json({link:{...link,trackedUrl:buildTrackedUrl(link),qrPayload:`${process.env.PUBLIC_APP_URL||'http://localhost:5173'}/r/${link.code}`},summary,timeline,hours,actions,attributions})
})


marketingRouter.post('/utm/abandon-sweep',requireRoles(...marketingWriteRoles),async(req:AuthRequest,res)=>{
 const parsed=z.object({eventId:z.number().int().positive(),linkId:z.number().int().positive(),inactiveMinutes:z.number().int().min(5).max(10080).default(30)}).safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Parâmetros inválidos.'})
 const {eventId,linkId,inactiveMinutes}=parsed.data;const link=await prisma.trackingLink.findUnique({where:{id:linkId}});if(!link||link.eventId!==eventId||!ownsProducer(req,link.producerId))return res.status(404).json({message:'Link não encontrado.'})
 const cutoff=new Date(Date.now()-inactiveMinutes*60000);const candidates=await prisma.trackingAttribution.findMany({where:{trackingLinkId:linkId,eventId,status:'active',lastActivityAt:{lte:cutoff}}})
 let recoveries=0;for(const attr of candidates){await prisma.$transaction(async tx=>{await tx.trackingAttribution.update({where:{id:attr.id},data:{status:'abandoned',abandonedAt:new Date()}});await tx.trackingJourneyAction.create({data:{action:'abandoned',customerName:attr.customerName,customerEmail:attr.customerEmail,amountCents:attr.cartValueCents,trackingLinkId:attr.trackingLinkId,producerId:attr.producerId,eventId:attr.eventId}});if(attr.customerEmail||attr.customerPhone){const existing=await tx.recoveryOpportunity.findFirst({where:{eventId:attr.eventId,status:'aberto',email:attr.customerEmail||undefined}});if(!existing){await tx.recoveryOpportunity.create({data:{code:`REC-UTM-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,kind:'carrinho',customerName:attr.customerName||'Cliente UTM',email:attr.customerEmail,phone:attr.customerPhone,amountCents:attr.cartValueCents,status:'aberto',preferredChannel:attr.customerPhone?'whatsapp':'email',lastActivityAt:attr.lastActivityAt,producerId:attr.producerId,eventId:attr.eventId,trackingLinkId:attr.trackingLinkId,attributionId:attr.id}});recoveries++}}})}
 await audit(req,'marketing.utm.abandon.sweep','TrackingAttribution',String(linkId),{eventId,candidates:candidates.length,recoveries,inactiveMinutes});res.json({processed:candidates.length,recoveries})
})

const journeyActionSchema=z.object({linkId:z.number().int().positive(),eventId:z.number().int().positive(),action:z.enum(['added','checkout','removed','abandoned','finalized']),orderCode:z.string().optional().nullable(),customerName:z.string().optional().nullable(),customerEmail:z.string().email().optional().nullable(),ticketSummary:z.string().optional().nullable(),amountCents:z.number().int().nonnegative().default(0)})
marketingRouter.post('/utm/actions',requireRoles(...marketingWriteRoles),async(req:AuthRequest,res)=>{
 const parsed=journeyActionSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Ação UTM inválida.',issues:parsed.error.issues})
 const body=parsed.data;const link=await prisma.trackingLink.findUnique({where:{id:body.linkId}});if(!link||link.eventId!==body.eventId||!ownsProducer(req,link.producerId))return res.status(404).json({message:'Link UTM não encontrado.'})
 const row=await prisma.trackingJourneyAction.create({data:{action:body.action,orderCode:body.orderCode||null,customerName:body.customerName||null,customerEmail:body.customerEmail||null,ticketSummary:body.ticketSummary||null,amountCents:body.amountCents,trackingLinkId:link.id,producerId:link.producerId,eventId:body.eventId}})
 if(body.action==='finalized')await prisma.trackingLink.update({where:{id:link.id},data:{conversions:{increment:1}}})
 await audit(req,'marketing.utm.action','TrackingJourneyAction',String(row.id),{action:body.action,linkId:link.id,eventId:body.eventId})
 res.status(201).json(row)
})

const providers=['meta_pixel','meta_capi','tiktok_pixel','tiktok_events_api','ga4','gtm','google_ads','linkedin_insight','pinterest_tag','snapchat_pixel','microsoft_ads','microsoft_clarity','whatsapp','email','automation_api'] as const
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

// Fase 16.1 — múltiplos Pixels + Tokens da Conversion API por produtora.
const integrationSchema=z.object({
  name:z.string().min(2),
  provider:z.string().default('meta'),
  integrationType:z.string().default('pixel_capi'),
  pixelId:z.string().min(3),
  apiToken:z.string().min(8).optional().nullable(),
  status:z.enum(['ativo','inativo']).default('ativo'),
  applyToAllEvents:z.boolean().default(true),
  eventIds:z.array(z.number().int().positive()).default([]),
  enabledEvents:z.array(z.string()).default(['PageView','ViewContent','AddToCart','InitiateCheckout','Purchase']),
  producerId:z.number().int().positive().optional()
})

function serializeIntegration(row:any){
  return {...row,apiTokenMasked:row.tokenLast4?`••••••••••••${row.tokenLast4}`:'Não configurado',tokenCiphertext:undefined,tokenIv:undefined,tokenTag:undefined,enabledEvents:JSON.parse(row.enabledEventsJson||'[]')}
}

marketingRouter.get('/integrations',requireRoles(...marketingReadRoles),async(req:AuthRequest,res)=>{
  const producerId=requestedProducerId(req)
  if(!producerId&&!globalAdmin(req.auth!.role))return res.status(400).json({message:'Produtora obrigatória.'})
  const eventId=req.query.eventId?Number(req.query.eventId):undefined
  const rows=await prisma.trackingIntegration.findMany({
    where:{...(producerId?{producerId}:{}),...(eventId?{OR:[{applyToAllEvents:true},{events:{some:{eventId}}}]}:{})},
    include:{events:{include:{event:{select:{id:true,title:true,code:true}}}},_count:{select:{deliveryLogs:true}}},orderBy:{createdAt:'desc'}
  })
  res.json(rows.map(serializeIntegration))
})

marketingRouter.post('/integrations',requireRoles(...marketingWriteRoles),async(req:AuthRequest,res)=>{
  const parsed=integrationSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Integração inválida.',issues:parsed.error.issues})
  const body=parsed.data;const producerId=writeProducerId(req,body.producerId);if(!producerId)return res.status(400).json({message:'Produtora obrigatória.'})
  if(body.eventIds.length){const count=await prisma.event.count({where:{id:{in:body.eventIds},producerId}});if(count!==body.eventIds.length)return res.status(400).json({message:'Um ou mais eventos não pertencem à produtora selecionada.'})}
  const secret=body.apiToken?encryptTrackingToken(body.apiToken):null
  const row=await prisma.trackingIntegration.create({data:{name:body.name,provider:body.provider,integrationType:body.integrationType,pixelId:body.pixelId,status:body.status,applyToAllEvents:body.applyToAllEvents,enabledEventsJson:JSON.stringify(body.enabledEvents),producerId,...(secret?{tokenCiphertext:secret.ciphertext,tokenIv:secret.iv,tokenTag:secret.tag,tokenLast4:secret.last4}:{}),events:!body.applyToAllEvents&&body.eventIds.length?{create:body.eventIds.map(eventId=>({eventId}))}:undefined},include:{events:{include:{event:{select:{id:true,title:true,code:true}}}},_count:{select:{deliveryLogs:true}}}})
  await audit(req,'marketing.integration.create','TrackingIntegration',String(row.id),{name:row.name,pixelId:row.pixelId,eventIds:body.eventIds})
  res.status(201).json(serializeIntegration(row))
})

marketingRouter.patch('/integrations/:id',requireRoles(...marketingWriteRoles),async(req:AuthRequest,res)=>{
  const id=Number(req.params.id);const current=await prisma.trackingIntegration.findUnique({where:{id}});if(!current||!ownsProducer(req,current.producerId))return res.status(404).json({message:'Integração não encontrada.'})
  const parsed=integrationSchema.partial().safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Alteração inválida.',issues:parsed.error.issues})
  const body=parsed.data;const eventIds=body.eventIds
  if(eventIds){const count=await prisma.event.count({where:{id:{in:eventIds},producerId:current.producerId}});if(count!==eventIds.length)return res.status(400).json({message:'Evento fora da produtora.'})}
  const secret=body.apiToken?encryptTrackingToken(body.apiToken):null
  const row=await prisma.$transaction(async tx=>{
    if(eventIds!==undefined||body.applyToAllEvents===true){await tx.trackingIntegrationEvent.deleteMany({where:{integrationId:id}})}
    const updated=await tx.trackingIntegration.update({where:{id},data:{...(body.name!==undefined?{name:body.name}:{}),...(body.provider!==undefined?{provider:body.provider}:{}),...(body.integrationType!==undefined?{integrationType:body.integrationType}:{}),...(body.pixelId!==undefined?{pixelId:body.pixelId}:{}),...(body.status!==undefined?{status:body.status}:{}),...(body.applyToAllEvents!==undefined?{applyToAllEvents:body.applyToAllEvents}:{}),...(body.enabledEvents!==undefined?{enabledEventsJson:JSON.stringify(body.enabledEvents)}:{}),...(secret?{tokenCiphertext:secret.ciphertext,tokenIv:secret.iv,tokenTag:secret.tag,tokenLast4:secret.last4}:{}),...((eventIds&&body.applyToAllEvents!==true)?{events:{create:eventIds.map(eventId=>({eventId}))}}:{})},include:{events:{include:{event:{select:{id:true,title:true,code:true}}}},_count:{select:{deliveryLogs:true}}}})
    return updated
  })
  await audit(req,'marketing.integration.update','TrackingIntegration',String(id),{name:row.name,status:row.status,tokenReplaced:!!secret})
  res.json(serializeIntegration(row))
})

marketingRouter.delete('/integrations/:id',requireRoles(...marketingWriteRoles),async(req:AuthRequest,res)=>{
  const id=Number(req.params.id);const current=await prisma.trackingIntegration.findUnique({where:{id}});if(!current||!ownsProducer(req,current.producerId))return res.status(404).json({message:'Integração não encontrada.'})
  await prisma.trackingIntegration.delete({where:{id}});await audit(req,'marketing.integration.delete','TrackingIntegration',String(id),{name:current.name});res.status(204).end()
})

marketingRouter.post('/integrations/:id/test',requireRoles(...marketingWriteRoles),async(req:AuthRequest,res)=>{
  const id=Number(req.params.id);const current=await prisma.trackingIntegration.findUnique({where:{id}});if(!current||!ownsProducer(req,current.producerId))return res.status(404).json({message:'Integração não encontrada.'})
  const ok=Boolean(current.pixelId&&current.tokenCiphertext&&current.status==='ativo');const now=new Date();const message=ok?`Configuração local de ${current.provider} válida. Credencial criptografada e integração pronta para uso pelo conector do provedor.`:'Identificador, credencial ou status da integração precisam ser revisados.'
  const updated=await prisma.trackingIntegration.update({where:{id},data:{lastTestAt:now,lastTestStatus:ok?'ok':'erro',lastError:ok?null:message}})
  await prisma.trackingDeliveryLog.create({data:{integrationId:id,producerId:current.producerId,eventName:'ConnectionTest',status:ok?'ok':'erro',responseCode:ok?200:400,message}})
  await audit(req,'marketing.integration.test','TrackingIntegration',String(id),{ok})
  res.json({ok,message,lastTestAt:updated.lastTestAt})
})

marketingRouter.get('/integrations/:id/logs',requireRoles(...marketingReadRoles),async(req:AuthRequest,res)=>{
  const id=Number(req.params.id);const current=await prisma.trackingIntegration.findUnique({where:{id}});if(!current||!ownsProducer(req,current.producerId))return res.status(404).json({message:'Integração não encontrada.'})
  res.json(await prisma.trackingDeliveryLog.findMany({where:{integrationId:id},include:{event:{select:{id:true,title:true}}},orderBy:{createdAt:'desc'},take:50}))
})

function encryptTrackingToken(token:string){
  const secret=process.env.TRACKING_TOKEN_SECRET||process.env.JWT_SECRET||'dev-only-change-me';const key=crypto.createHash('sha256').update(secret).digest();const iv=crypto.randomBytes(12);const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);const ciphertext=Buffer.concat([cipher.update(token,'utf8'),cipher.final()]);const tag=cipher.getAuthTag();return {ciphertext:ciphertext.toString('base64'),iv:iv.toString('base64'),tag:tag.toString('base64'),last4:token.slice(-4)}
}

// Fase 21.1.2 — fonte consolidada do Marketing OS.
// Evita que uma falha em um módulo derrube o Dashboard inteiro e diferencia
// "sem dados" de "fonte indisponível".
marketingRouter.get('/os/summary',requireRoles(...marketingReadRoles),async(req:AuthRequest,res)=>{
 const requestedEventId=req.query.eventId?Number(req.query.eventId):undefined
 let producerId=requestedProducerId(req); let eventId=requestedEventId
 if(eventId){const event=await prisma.event.findUnique({where:{id:eventId}});if(!event||!ownsProducer(req,event.producerId))return res.status(404).json({message:'Evento não encontrado.'});producerId=event.producerId}
 const sourceHealth:Record<string,{ok:boolean;state:'active'|'empty'|'unavailable';message?:string}>={}
 const safe=async<T>(name:string,fn:()=>Promise<T>,empty:(value:T)=>boolean,fallback:T):Promise<T>=>{try{const value=await fn();sourceHealth[name]={ok:true,state:empty(value)?'empty':'active'};return value}catch(error){console.error(`[marketing-os] fonte ${name} indisponível`,error);sourceHealth[name]={ok:false,state:'unavailable',message:'Fonte temporariamente indisponível'};return fallback}}
 const campaignWhere={...(producerId?{producerId}:{}),...(eventId?{eventId}:{})}
 const [campaigns,ready,tracking,flows,executions,channels]=await Promise.all([
  safe('campaigns',()=>prisma.marketingCampaign.findMany({where:campaignWhere,include:{event:{select:{id:true,title:true}},producer:{select:{id:true,name:true}}},orderBy:{createdAt:'desc'}}),v=>v.length===0,[] as any[]),
  safe('readyCampaigns',()=>prisma.readyCampaignActivation.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{})},include:{event:{select:{id:true,title:true,code:true}}},orderBy:{createdAt:'desc'}}),v=>v.length===0,[] as any[]),
  safe('tracking',async()=>{const rows=await prisma.trackingConfig.findMany({where:{OR:[{scope:'global'},...(producerId?[{scope:'producer',producerId}]:[]),...(eventId?[{scope:'event',eventId}]:[])]}});return providers.map(provider=>{const configs=rows.filter(r=>r.provider===provider);const eventCfg=configs.find(r=>r.scope==='event'&&r.eventId===eventId);const producerCfg=configs.find(r=>r.scope==='producer'&&r.producerId===producerId);const globalCfg=configs.find(r=>r.scope==='global');const selected=[eventCfg,producerCfg,globalCfg].find(c=>c&&c.mode!=='inherit')||globalCfg||producerCfg||eventCfg;return{provider,source:selected?.scope||'none',mode:selected?.mode||'disabled',externalId:selected?.externalId||null,configJson:selected?.configJson||null}})},v=>v.every(x=>x.mode==='disabled'||x.source==='none'),[] as any[]),
  safe('automationFlows',()=>prisma.automationFlow.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{})}}),v=>v.length===0,[] as any[]),
  safe('automationExecutions',()=>prisma.automationExecution.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{})},take:500}),v=>v.length===0,[] as any[]),
  safe('communication',()=>prisma.communicationChannel.findMany({where:{...(producerId?{producerId}:{})}}),v=>v.length===0,[] as any[])
 ])
 const readyNormalized=ready.map((r:any)=>({...r,channels:JSON.parse(r.channelsJson||'[]'),campaignIds:JSON.parse(r.campaignIdsJson||'[]'),trackingLinkIds:JSON.parse(r.trackingLinkIdsJson||'[]')}))
 const automation={activeFlows:flows.filter((f:any)=>f.status==='ativo').length,totalFlows:flows.length,templates:0,executions:executions.length,openRecoveries:0,potentialCents:0,recoveredCount:0,recoveredCents:0,sent:flows.reduce((a:number,f:any)=>a+(f.sentCount||0),0),conversions:flows.reduce((a:number,f:any)=>a+(f.convertedCount||0),0)}
 const communication={channels:channels.length,activeChannels:channels.filter((x:any)=>x.status==='ativo').length,queued:executions.filter((x:any)=>x.status==='agendado').length,sent:executions.filter((x:any)=>x.status==='enviado').length,failed:executions.filter((x:any)=>x.status==='falhou').length,optOuts:0}
 const unavailable=Object.entries(sourceHealth).filter(([,v])=>!v.ok).map(([name])=>name)
 res.json({campaigns,ready:readyNormalized,tracking,automation,communication,health:{ok:unavailable.length===0,unavailable,sourceHealth}})
})
