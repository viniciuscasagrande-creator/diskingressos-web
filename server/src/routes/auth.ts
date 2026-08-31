import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { signToken } from '../auth.js'
import { audit } from '../audit.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
export const authRouter=Router()
authRouter.post('/login',async(req,res)=>{
  if(!process.env.DATABASE_URL) return res.status(503).json({message:'DATABASE_URL não configurada no ambiente da API.'})
  const parsed=z.object({email:z.string().email(),password:z.string().min(8)}).safeParse(req.body);if(!parsed.success)return res.status(400).json({message:'Dados inválidos.'})
 const user=await prisma.user.findUnique({where:{email:parsed.data.email.toLowerCase()},include:{producer:true}})
 if(!user||user.status!=='ativo'||!(await bcrypt.compare(parsed.data.password,user.passwordHash)))return res.status(401).json({message:'E-mail ou senha inválidos.'})
 await prisma.user.update({where:{id:user.id},data:{lastLogin:new Date()}})
 const safe={id:user.id,name:user.name,email:user.email,role:user.role,producerId:user.producerId,status:user.status,lastLogin:new Date().toISOString()}
 await audit(req,user.id,user.producerId,'login','auth')
 res.json({token:signToken({id:user.id,name:user.name,email:user.email,role:user.role,producerId:user.producerId}),user:safe})
})
authRouter.get('/me',requireAuth,async(req:AuthRequest,res)=>{const u=await prisma.user.findUnique({where:{id:req.auth!.id},select:{id:true,name:true,email:true,role:true,producerId:true,status:true,lastLogin:true}});res.json(u)})
