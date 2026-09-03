import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { audit } from '../audit.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { ownsProducer, requestedProducerId, writeProducerId } from '../tenant.js'
export const participantsRouter=Router();participantsRouter.use(requireAuth)
const input=z.object({name:z.string().min(2),email:z.string().email().optional(),document:z.string().optional(),phone:z.string().optional(),facialStatus:z.string().optional(),eventId:z.number().int().positive(),producerId:z.number().int().positive().optional()})
participantsRouter.get('/',async(req:AuthRequest,res)=>{const producerId=requestedProducerId(req),eventId=req.query.eventId?Number(req.query.eventId):undefined;res.json(await prisma.participant.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{})},include:{event:{select:{id:true,title:true}},tickets:{select:{id:true,code:true,status:true}},checkIns:{orderBy:{checkedAt:'desc'},take:1}},orderBy:{name:'asc'}}))})
participantsRouter.post('/',async(req:AuthRequest,res)=>{const p=input.parse(req.body),producerId=writeProducerId(req,p.producerId);if(!producerId)return res.status(400).json({message:'Produtora obrigatória.'});const event=await prisma.event.findUnique({where:{id:p.eventId}});if(!event||event.producerId!==producerId)return res.status(403).json({message:'Evento fora do escopo da produtora.'});const created=await prisma.participant.create({data:{...p,producerId} as any});await audit(req,req.auth!.id,producerId,'create','participant',String(created.id));res.status(201).json(created)})
participantsRouter.put('/:id',async(req:AuthRequest,res)=>{const id=Number(req.params.id),existing=await prisma.participant.findUnique({where:{id}});if(!existing)return res.status(404).json({message:'Participante não encontrado.'});if(!ownsProducer(req,existing.producerId))return res.status(403).json({message:'Acesso negado.'});const p=input.partial().parse(req.body);const updated=await prisma.participant.update({where:{id},data:p});await audit(req,req.auth!.id,existing.producerId,'update','participant',String(id));res.json(updated)})
