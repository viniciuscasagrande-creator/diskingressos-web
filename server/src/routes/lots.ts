import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { audit } from '../audit.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { ownsProducer, requestedProducerId, writeProducerId } from '../tenant.js'

export const lotsRouter = Router(); lotsRouter.use(requireAuth)
const input = z.object({name:z.string().min(1),sector:z.string().optional(),priceCents:z.number().int().nonnegative(),capacity:z.number().int().positive(),sold:z.number().int().nonnegative().optional(),status:z.string().optional(),startsAt:z.string().datetime().optional(),endsAt:z.string().datetime().optional(),eventId:z.number().int().positive(),producerId:z.number().int().positive().optional()})

lotsRouter.get('/', async (req:AuthRequest,res)=>{
  const producerId=requestedProducerId(req); const eventId=req.query.eventId?Number(req.query.eventId):undefined
  res.json(await prisma.lot.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{})},include:{event:{select:{id:true,title:true}}},orderBy:{id:'desc'}}))
})
lotsRouter.post('/', async (req:AuthRequest,res)=>{
  const p=input.parse(req.body), producerId=writeProducerId(req,p.producerId); if(!producerId)return res.status(400).json({message:'Produtora obrigatória.'})
  const event=await prisma.event.findUnique({where:{id:p.eventId}}); if(!event||event.producerId!==producerId)return res.status(403).json({message:'Evento fora do escopo da produtora.'})
  const created=await prisma.lot.create({data:{...p,startsAt:p.startsAt?new Date(p.startsAt):undefined,endsAt:p.endsAt?new Date(p.endsAt):undefined,producerId} as any})
  await audit(req,req.auth!.id,producerId,'create','lot',String(created.id)); res.status(201).json(created)
})
lotsRouter.put('/:id', async (req:AuthRequest,res)=>{
  const id=Number(req.params.id), existing=await prisma.lot.findUnique({where:{id}}); if(!existing)return res.status(404).json({message:'Lote não encontrado.'}); if(!ownsProducer(req,existing.producerId))return res.status(403).json({message:'Acesso negado.'})
  const p=input.partial().parse(req.body); const updated=await prisma.lot.update({where:{id},data:{...p,startsAt:p.startsAt?new Date(p.startsAt):undefined,endsAt:p.endsAt?new Date(p.endsAt):undefined}}); await audit(req,req.auth!.id,existing.producerId,'update','lot',String(id)); res.json(updated)
})
