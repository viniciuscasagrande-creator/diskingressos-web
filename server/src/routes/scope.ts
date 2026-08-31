import { Router } from 'express'
import { prisma } from '../prisma.js'
import { globalAdmin } from '../auth.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

export const scopeRouter=Router()
scopeRouter.use(requireAuth)

scopeRouter.get('/diagnostics',async(req:AuthRequest,res)=>{
  const auth=req.auth!
  const producerId=auth.producerId
  if(!globalAdmin(auth.role) && !producerId) return res.status(409).json({ok:false,code:'USER_WITHOUT_PRODUCER',message:'Usuário de produtora sem producerId vinculado.',user:{id:auth.id,email:auth.email,role:auth.role,producerId}})
  const producer=producerId?await prisma.producer.findUnique({where:{id:producerId},select:{id:true,name:true,status:true,_count:{select:{events:true,marketingCampaigns:true,users:true}}}}):null
  if(!globalAdmin(auth.role) && !producer) return res.status(409).json({ok:false,code:'PRODUCER_NOT_FOUND',message:'O producerId do token não existe neste banco.',user:{id:auth.id,email:auth.email,role:auth.role,producerId}})
  const events=producerId?await prisma.event.findMany({where:{producerId},select:{id:true,code:true,title:true,status:true,_count:{select:{marketingCampaigns:true}}},orderBy:{id:'asc'}}):[]
  res.json({ok:true,user:{id:auth.id,email:auth.email,role:auth.role,producerId},producer,events,totalEvents:events.length,totalCampaigns:events.reduce((n,e)=>n+e._count.marketingCampaigns,0)})
})
