import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { globalAdmin } from '../auth.js'
import { audit } from '../audit.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
export const usersRouter=Router();usersRouter.use(requireAuth)
usersRouter.get('/',async(req:AuthRequest,res)=>{const where=globalAdmin(req.auth!.role)?{}:{producerId:req.auth!.producerId??-1};res.json(await prisma.user.findMany({where,select:{id:true,name:true,email:true,role:true,producerId:true,status:true,lastLogin:true},orderBy:{name:'asc'}}))})
usersRouter.post('/',async(req:AuthRequest,res)=>{
 if(!globalAdmin(req.auth!.role)&&req.auth!.role!=='producer-admin')return res.status(403).json({message:'Sem permissão.'})
 const p=z.object({name:z.string().min(2),email:z.string().email(),password:z.string().min(8),role:z.string().min(2),producerId:z.number().int().nullable()}).parse(req.body)
 const targetProducer=globalAdmin(req.auth!.role)?p.producerId:req.auth!.producerId
 if(!globalAdmin(req.auth!.role)&&['admin-master','admin'].includes(p.role))return res.status(403).json({message:'Perfil não permitido.'})
 const u=await prisma.user.create({data:{name:p.name,email:p.email.toLowerCase(),passwordHash:await bcrypt.hash(p.password,12),role:p.role,producerId:targetProducer},select:{id:true,name:true,email:true,role:true,producerId:true,status:true,lastLogin:true}})
 await audit(req,req.auth!.id,targetProducer,'create','user',String(u.id));res.status(201).json(u)
})
usersRouter.patch('/:id/status',async(req:AuthRequest,res)=>{const id=Number(req.params.id);const target=await prisma.user.findUnique({where:{id}});if(!target)return res.status(404).json({message:'Usuário não encontrado.'});if(!globalAdmin(req.auth!.role)&&(req.auth!.role!=='producer-admin'||target.producerId!==req.auth!.producerId))return res.status(403).json({message:'Sem permissão.'});const status=z.enum(['ativo','inativo']).parse(req.body.status);const u=await prisma.user.update({where:{id},data:{status},select:{id:true,name:true,email:true,role:true,producerId:true,status:true,lastLogin:true}});await audit(req,req.auth!.id,target.producerId,'status','user',String(id),{status});res.json(u)})
