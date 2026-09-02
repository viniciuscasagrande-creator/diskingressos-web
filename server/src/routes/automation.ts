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
automationRouter.get('/recovery-events',requireRoles(...readRoles),async(req:AuthRequest,res)=>{
  const producerId=requestedProducerId(req);const kind=req.query.kind?String(req.query.kind):'carrinho'
  const grouped=await prisma.recoveryOpportunity.groupBy({by:['eventId'],where:{...(producerId?{producerId}:{}),kind,eventId:{not:null}},_count:{_all:true},_sum:{amountCents:true}})
  const eventIds=grouped.map(g=>g.eventId).filter((id):id is number=>typeof id==='number')
  if(!eventIds.length)return res.json([])
  const events=await prisma.event.findMany({where:{id:{in:eventIds},...(producerId?{producerId}:{})},select:{id:true,title:true,code:true,producerId:true}})
  const openGrouped=await prisma.recoveryOpportunity.groupBy({by:['eventId'],where:{...(producerId?{producerId}:{}),kind,eventId:{in:eventIds},status:{in:['aberto','em_recuperacao']}},_count:{_all:true},_sum:{amountCents:true}})
  const totals=new Map(grouped.map(g=>[g.eventId,g]));const open=new Map(openGrouped.map(g=>[g.eventId,g]))
  res.json(events.map(ev=>({id:ev.id,title:ev.title,code:ev.code,producerId:ev.producerId,abandonedCount:totals.get(ev.id)?._count._all||0,openCount:open.get(ev.id)?._count._all||0,potentialCents:open.get(ev.id)?._sum.amountCents||0})).sort((a,b)=>b.openCount-a.openCount||a.title.localeCompare(b.title)))
})
automationRouter.get('/recoveries',requireRoles(...readRoles),async(req:AuthRequest,res)=>{const producerId=requestedProducerId(req);const eventId=req.query.eventId?Number(req.query.eventId):undefined;const kind=req.query.kind?String(req.query.kind):undefined;const rows=await prisma.recoveryOpportunity.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{}),...(kind?{kind}:{})},include:{event:{select:{id:true,title:true}},trackingLink:{select:{id:true,name:true,source:true,medium:true,campaign:true,code:true}},flow:{select:{id:true,name:true,channel:true,delayMinutes:true}},attempts:{orderBy:{createdAt:'desc'},take:5}},orderBy:{lastActivityAt:'desc'}});res.json(rows)})
automationRouter.post('/recoveries',requireRoles(...writeRoles),async(req:AuthRequest,res)=>{const parsed=recoverySchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Oportunidade inválida.',issues:parsed.error.issues});const body=parsed.data;let producerId=writeProducerId(req,body.producerId);if(body.eventId){const event=await prisma.event.findUnique({where:{id:body.eventId}});if(!event||!ownsProducer(req,event.producerId))return res.status(404).json({message:'Evento não encontrado.'});producerId=event.producerId}if(!producerId)return res.status(400).json({message:'Selecione uma produtora ou evento.'});const row=await prisma.recoveryOpportunity.create({data:{...body,producerId,eventId:body.eventId||null,code:`REC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`}});res.status(201).json(row)})
automationRouter.patch('/recoveries/:id/recover',requireRoles(...writeRoles),async(req:AuthRequest,res)=>{
  const id=Number(req.params.id);const current=await prisma.recoveryOpportunity.findUnique({where:{id},include:{attribution:true}});if(!current||!ownsProducer(req,current.producerId))return res.status(404).json({message:'Oportunidade não encontrada.'})
  const parsed=z.object({revenueCents:z.number().int().nonnegative().optional(),orderId:z.number().int().positive().optional().nullable()}).safeParse(req.body||{});const revenueCents=parsed.success&&parsed.data.revenueCents!==undefined?parsed.data.revenueCents:current.amountCents
  const row=await prisma.$transaction(async tx=>{
    const updated=await tx.recoveryOpportunity.update({where:{id},data:{status:'recuperado',recoveredAt:new Date(),revenueCents,nextAttemptAt:null}})
    if(current.flowId)await tx.automationFlow.update({where:{id:current.flowId},data:{convertedCount:{increment:1},revenueCents:{increment:revenueCents}}})
    if(current.attributionId)await tx.trackingAttribution.update({where:{id:current.attributionId},data:{status:'converted',convertedAt:new Date(),...(parsed.success&&parsed.data.orderId?{orderId:parsed.data.orderId}:{})}})
    if(current.trackingLinkId)await tx.trackingLink.update({where:{id:current.trackingLinkId},data:{conversions:{increment:1}}})
    return updated
  })
  await audit(req,'remarketing.recovery.complete','RecoveryOpportunity',String(id),{revenueCents,trackingLinkId:current.trackingLinkId,attributionId:current.attributionId});res.json(row)
})

const channelAllowed=async(producerId:number,contact:string|undefined|null,channel:string)=>{
  if(!contact)return false
  const consent=await prisma.contactConsent.findUnique({where:{producerId_contact_channel:{producerId,contact,channel}}}).catch(()=>null)
  return !consent||consent.status!=='optout'
}
const buildRecoveryPreview=(body:string,name:string,eventName:string,link:string)=>body.replaceAll('{{nome}}',name).replaceAll('{{evento}}',eventName).replaceAll('{{link}}',link)

// Fase 16.6: inicia a jornada de recuperação de uma oportunidade com consentimento, template e canal.
automationRouter.post('/recoveries/:id/start',requireRoles(...writeRoles),async(req:AuthRequest,res)=>{
  const id=Number(req.params.id);const current=await prisma.recoveryOpportunity.findUnique({where:{id},include:{event:true,trackingLink:true,flow:true}});if(!current||!ownsProducer(req,current.producerId))return res.status(404).json({message:'Oportunidade não encontrada.'})
  if(current.status==='recuperado')return res.status(409).json({message:'Esta oportunidade já foi recuperada.'})
  const requested=z.object({channel:z.enum(['whatsapp','email','multicanal']).optional(),flowId:z.number().int().positive().optional()}).safeParse(req.body||{})
  let flow=current.flow
  if(requested.success&&requested.data.flowId){const candidate=await prisma.automationFlow.findUnique({where:{id:requested.data.flowId}});if(candidate&&ownsProducer(req,candidate.producerId))flow=candidate}
  if(!flow)flow=await prisma.automationFlow.findFirst({where:{producerId:current.producerId,status:'ativo',trigger:current.kind==='pagamento'?'payment_pending':'cart_abandoned',OR:[{eventId:current.eventId},{eventId:null}]},orderBy:{eventId:'desc'}})
  const channel=requested.success&&requested.data.channel?requested.data.channel:(flow?.channel||current.preferredChannel)
  const candidates=channel==='multicanal'?['whatsapp','email']:[channel]
  const attempts:any[]=[]
  for(const ch of candidates){
    const destination=ch==='whatsapp'?current.phone:current.email
    if(!destination||!(await channelAllowed(current.producerId,destination,ch)))continue
    const template=await prisma.messageTemplate.findFirst({where:{producerId:current.producerId,channel:ch,status:'ativo',category:'remarketing',OR:[{eventId:current.eventId},{eventId:null}]},orderBy:{eventId:'desc'}})
    const eventName=current.event?.title||'seu evento';const resumeLink=current.trackingLink?`${process.env.PUBLIC_APP_URL||'http://localhost:5173'}/r/${current.trackingLink.code}`:'#'
    const preview=buildRecoveryPreview(template?.body||'Olá {{nome}}, retome sua compra para {{evento}}: {{link}}',current.customerName,eventName,resumeLink)
    const attempt=await prisma.recoveryAttempt.create({data:{channel:ch,destination,status:'queued',attemptNumber:current.attemptCount+1,templateName:template?.name||'Recuperação padrão',messagePreview:preview,scheduledAt:new Date(),producerId:current.producerId,eventId:current.eventId,recoveryId:current.id,flowId:flow?.id||null}});attempts.push(attempt)
    if(flow)await prisma.automationExecution.create({data:{channel:ch,destination,status:'agendado',scheduledAt:new Date(),messagePreview:preview,producerId:current.producerId,eventId:current.eventId,flowId:flow.id}})
  }
  if(!attempts.length)return res.status(409).json({message:'Nenhum canal disponível com contato e consentimento válidos.'})
  const nextAttemptAt=new Date(Date.now()+Math.max(flow?.delayMinutes||30,30)*60000)
  await prisma.recoveryOpportunity.update({where:{id},data:{status:'em_recuperacao',firstContactAt:current.firstContactAt||new Date(),nextAttemptAt,attemptCount:{increment:1},flowId:flow?.id||current.flowId}})
  if(flow)await prisma.automationFlow.update({where:{id:flow.id},data:{sentCount:{increment:attempts.length}}})
  await audit(req,'remarketing.recovery.start','RecoveryOpportunity',String(id),{channels:attempts.map(a=>a.channel),flowId:flow?.id||null});res.status(201).json({attempts,nextAttemptAt})
})

// Simula o worker/fila: processa mensagens agendadas, aplica retries e mantém histórico de entrega.
automationRouter.post('/recoveries/process-queue',requireRoles(...writeRoles),async(req:AuthRequest,res)=>{
  const producerId=requestedProducerId(req);const limit=Math.min(Number(req.body?.limit||50),200);const eventId=req.body?.eventId?Number(req.body.eventId):undefined;const now=new Date()
  if(eventId){const event=await prisma.event.findUnique({where:{id:eventId}});if(!event||!ownsProducer(req,event.producerId)||(producerId&&event.producerId!==producerId))return res.status(404).json({message:'Evento não encontrado no escopo da produtora.'})}
  // Auto-enrollment: oportunidades abertas entram no fluxo ativo sem depender de clique individual.
  const openRows=await prisma.recoveryOpportunity.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{}),status:'aberto'},include:{event:true,trackingLink:true},take:limit})
  let enrolled=0
  for(const current of openRows){
    const flow=await prisma.automationFlow.findFirst({where:{producerId:current.producerId,status:'ativo',trigger:current.kind==='pagamento'?'payment_pending':'cart_abandoned',OR:[{eventId:current.eventId},{eventId:null}]},orderBy:{eventId:'desc'}})
    if(!flow)continue
    const channels=flow.channel==='multicanal'?['whatsapp','email']:[flow.channel];let created=0
    for(const ch of channels){const destination=ch==='whatsapp'?current.phone:current.email;if(!destination||!(await channelAllowed(current.producerId,destination,ch)))continue;const template=await prisma.messageTemplate.findFirst({where:{producerId:current.producerId,channel:ch,status:'ativo',category:'remarketing',OR:[{eventId:current.eventId},{eventId:null}]},orderBy:{eventId:'desc'}});const link=current.trackingLink?`${process.env.PUBLIC_APP_URL||'http://localhost:5173'}/r/${current.trackingLink.code}`:'#';const preview=buildRecoveryPreview(template?.body||'Olá {{nome}}, retome sua compra para {{evento}}: {{link}}',current.customerName,current.event?.title||'seu evento',link);await prisma.recoveryAttempt.create({data:{channel:ch,destination,status:'queued',attemptNumber:1,templateName:template?.name||'Recuperação padrão',messagePreview:preview,scheduledAt:now,producerId:current.producerId,eventId:current.eventId,recoveryId:current.id,flowId:flow.id}});created++}
    if(created){await prisma.recoveryOpportunity.update({where:{id:current.id},data:{status:'em_recuperacao',firstContactAt:now,nextAttemptAt:new Date(now.getTime()+Math.max(flow.delayMinutes,30)*60000),attemptCount:1,flowId:flow.id}});await prisma.automationFlow.update({where:{id:flow.id},data:{sentCount:{increment:created}}});enrolled++}
  }
  const queued=await prisma.recoveryAttempt.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{}),status:'queued',scheduledAt:{lte:now}},orderBy:{scheduledAt:'asc'},take:limit})
  let sent=0;for(const item of queued){await prisma.recoveryAttempt.update({where:{id:item.id},data:{status:'sent',sentAt:now,deliveredAt:now}});sent++}
  await audit(req,'remarketing.queue.process','RecoveryAttempt','batch',{enrolled,queued:queued.length,sent});res.json({enrolled,processed:queued.length,sent})
})

automationRouter.get('/recovery-dashboard',requireRoles(...readRoles),async(req:AuthRequest,res)=>{
  const producerId=requestedProducerId(req);const eventId=req.query.eventId?Number(req.query.eventId):undefined;const where:any={...(producerId?{producerId}:{}),...(eventId?{eventId}:{})}
  const rows=await prisma.recoveryOpportunity.findMany({where,include:{trackingLink:{select:{id:true,name:true,source:true,medium:true,campaign:true}},attempts:true}})
  const recovered=rows.filter(r=>r.status==='recuperado');const byChannel:any={whatsapp:{attempts:0,recovered:0,revenueCents:0},email:{attempts:0,recovered:0,revenueCents:0}}
  for(const r of rows){for(const a of r.attempts){if(byChannel[a.channel])byChannel[a.channel].attempts++}if(r.status==='recuperado'&&byChannel[r.preferredChannel]){byChannel[r.preferredChannel].recovered++;byChannel[r.preferredChannel].revenueCents+=r.revenueCents}}
  const campaigns=new Map<string,any>();for(const r of rows){if(!r.trackingLink)continue;const key=r.trackingLink.campaign||r.trackingLink.name;if(!campaigns.has(key))campaigns.set(key,{campaign:key,source:r.trackingLink.source,opportunities:0,recovered:0,revenueCents:0});const c=campaigns.get(key);c.opportunities++;if(r.status==='recuperado'){c.recovered++;c.revenueCents+=r.revenueCents}}
  res.json({open:rows.filter(r=>r.status==='aberto').length,inRecovery:rows.filter(r=>r.status==='em_recuperacao').length,recovered:recovered.length,potentialCents:rows.filter(r=>r.status!=='recuperado').reduce((a,r)=>a+r.amountCents,0),recoveredCents:recovered.reduce((a,r)=>a+r.revenueCents,0),byChannel,campaigns:[...campaigns.values()]})
})

automationRouter.get('/summary',requireRoles(...readRoles),async(req:AuthRequest,res)=>{const producerId=requestedProducerId(req);const eventId=req.query.eventId?Number(req.query.eventId):undefined;if(eventId){const event=await prisma.event.findUnique({where:{id:eventId}});if(!event||!ownsProducer(req,event.producerId)||(producerId&&event.producerId!==producerId))return res.status(404).json({message:'Evento não encontrado no escopo da produtora.'})}const where={...(producerId?{producerId}:{}),...(eventId?{eventId}:{})};const [flows,recoveries,executions,templates]=await Promise.all([prisma.automationFlow.findMany({where}),prisma.recoveryOpportunity.findMany({where}),prisma.automationExecution.findMany({where}),prisma.messageTemplate.count({where})]);const open=recoveries.filter(r=>r.status==='aberto');const recovered=recoveries.filter(r=>r.status==='recuperado');res.json({activeFlows:flows.filter(f=>f.status==='ativo').length,totalFlows:flows.length,templates,executions:executions.length,openRecoveries:open.length,potentialCents:open.reduce((a,r)=>a+r.amountCents,0),recoveredCount:recovered.length,recoveredCents:recovered.reduce((a,r)=>a+r.revenueCents,0),sent:flows.reduce((a,f)=>a+f.sentCount,0),conversions:flows.reduce((a,f)=>a+f.convertedCount,0)})})
