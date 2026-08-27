import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { audit } from '../audit.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { ownsProducer, requestedProducerId } from '../tenant.js'
export const ticketsRouter=Router();ticketsRouter.use(requireAuth)
ticketsRouter.get('/',async(req:AuthRequest,res)=>{const producerId=requestedProducerId(req),eventId=req.query.eventId?Number(req.query.eventId):undefined,status=typeof req.query.status==='string'?req.query.status:undefined;res.json(await prisma.ticket.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{}),...(status?{status}:{})},include:{event:{select:{id:true,title:true}},lot:{select:{id:true,name:true,sector:true}},participant:{select:{id:true,name:true}},order:{select:{id:true,code:true,buyerName:true}}},orderBy:{createdAt:'desc'}}))})
ticketsRouter.patch('/:id/status',async(req:AuthRequest,res)=>{const id=Number(req.params.id),{status}=z.object({status:z.string().min(2)}).parse(req.body),existing=await prisma.ticket.findUnique({where:{id}});if(!existing)return res.status(404).json({message:'Ingresso não encontrado.'});if(!ownsProducer(req,existing.producerId))return res.status(403).json({message:'Acesso negado.'});const updated=await prisma.ticket.update({where:{id},data:{status}});await audit(req,req.auth!.id,existing.producerId,'status','ticket',String(id),status);res.json(updated)})
