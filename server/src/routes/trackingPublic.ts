import { Router } from 'express'
import { z } from 'zod'
import crypto from 'node:crypto'
import { prisma } from '../prisma.js'

export const trackingPublicRouter=Router()

const eventSchema=z.object({
  sessionKey:z.string().min(8),
  action:z.enum(['view_content','added','checkout','removed']),
  customerName:z.string().optional().nullable(),
  customerEmail:z.string().email().optional().nullable(),
  customerPhone:z.string().optional().nullable(),
  ticketSummary:z.string().optional().nullable(),
  amountCents:z.number().int().nonnegative().default(0)
})

trackingPublicRouter.post('/resolve/:code',async(req,res)=>{
  const link=await prisma.trackingLink.findUnique({where:{code:req.params.code}})
  if(!link||!link.eventId)return res.status(404).json({message:'Link rastreável não encontrado.'})
  const sessionKey=crypto.randomBytes(18).toString('hex')
  const visitorKey=typeof req.body?.visitorKey==='string'?req.body.visitorKey:null
  const now=new Date();const expiresAt=new Date(now.getTime()+30*24*60*60*1000)
  const attribution=await prisma.trackingAttribution.create({data:{sessionKey,visitorKey,landingUrl:link.destination,trackingLinkId:link.id,producerId:link.producerId,eventId:link.eventId,firstSeenAt:now,lastActivityAt:now,expiresAt}})
  await prisma.trackingLink.update({where:{id:link.id},data:{clicks:{increment:1}}})
  await prisma.trackingJourneyAction.create({data:{action:'view_content',trackingLinkId:link.id,producerId:link.producerId,eventId:link.eventId}})
  res.status(201).json({sessionKey,expiresAt,attributionId:attribution.id,destination:link.destination,utm:{source:link.source,medium:link.medium,campaign:link.campaign,content:link.content,term:link.term}})
})

trackingPublicRouter.post('/events',async(req,res)=>{
  const parsed=eventSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Evento de tracking inválido.',issues:parsed.error.issues})
  const body=parsed.data;const attr=await prisma.trackingAttribution.findUnique({where:{sessionKey:body.sessionKey},include:{trackingLink:true}})
  if(!attr||attr.expiresAt<new Date()||attr.status==='converted')return res.status(404).json({message:'Sessão de atribuição inválida ou expirada.'})
  const actionMap:Record<string,string>={view_content:'view_content',added:'added',checkout:'checkout',removed:'removed'}
  const row=await prisma.$transaction(async tx=>{
    const action=await tx.trackingJourneyAction.create({data:{action:actionMap[body.action],customerName:body.customerName||null,customerEmail:body.customerEmail||null,ticketSummary:body.ticketSummary||null,amountCents:body.amountCents,trackingLinkId:attr.trackingLinkId,producerId:attr.producerId,eventId:attr.eventId}})
    await tx.trackingAttribution.update({where:{id:attr.id},data:{lastActivityAt:new Date(),customerName:body.customerName||attr.customerName,customerEmail:body.customerEmail||attr.customerEmail,customerPhone:body.customerPhone||attr.customerPhone,cartValueCents:body.amountCents||attr.cartValueCents,status:'active'}})
    return action
  })
  res.status(201).json({ok:true,action:row.action})
})
