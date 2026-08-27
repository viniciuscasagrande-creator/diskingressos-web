import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { globalAdmin } from '../auth.js'
import { audit } from '../audit.js'
import { requireAuth, requireRoles, type AuthRequest } from '../middleware/auth.js'
export const producersRouter=Router();producersRouter.use(requireAuth)
producersRouter.get('/',async(req:AuthRequest,res)=>{if(globalAdmin(req.auth!.role))return res.json(await prisma.producer.findMany({orderBy:{name:'asc'}}));const p=req.auth!.producerId?await prisma.producer.findMany({where:{id:req.auth!.producerId}}):[];res.json(p)})
producersRouter.post('/',requireRoles('admin-master','admin'),async(req:AuthRequest,res)=>{const p=z.object({name:z.string().min(2),document:z.string().min(5)}).parse(req.body);const created=await prisma.producer.create({data:p});await audit(req,req.auth!.id,created.id,'create','producer',String(created.id));res.status(201).json(created)})
producersRouter.patch('/:id/status',requireRoles('admin-master','admin'),async(req:AuthRequest,res)=>{const id=Number(req.params.id), status=z.enum(['ativo','inativo']).parse(req.body.status);const p=await prisma.producer.update({where:{id},data:{status}});await audit(req,req.auth!.id,id,'status','producer',String(id),{status});res.json(p)})
