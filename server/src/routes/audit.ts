import { Router } from 'express'
import { prisma } from '../prisma.js'
import { globalAdmin } from '../auth.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
export const auditRouter=Router();auditRouter.use(requireAuth);auditRouter.get('/',async(req:AuthRequest,res)=>{const where=globalAdmin(req.auth!.role)?{}:{producerId:req.auth!.producerId??-1};res.json(await prisma.auditLog.findMany({where,include:{user:{select:{name:true,email:true}},producer:{select:{name:true}}},orderBy:{createdAt:'desc'},take:200}))})
