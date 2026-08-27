import { Router } from 'express'
import { prisma } from '../prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { requestedProducerId } from '../tenant.js'
export const operationsRouter=Router();operationsRouter.use(requireAuth)
operationsRouter.get('/summary',async(req:AuthRequest,res)=>{const producerId=requestedProducerId(req),scope=producerId?{producerId}:{};const [events,lots,orders,tickets,participants,checkins,terminals,payouts,financial]=await Promise.all([prisma.event.count({where:scope}),prisma.lot.count({where:scope}),prisma.order.count({where:scope}),prisma.ticket.count({where:scope}),prisma.participant.count({where:scope}),prisma.checkIn.count({where:scope}),prisma.posTerminal.count({where:scope}),prisma.payout.count({where:scope}),prisma.financialTransaction.findMany({where:{...scope,status:'liquidado'},select:{type:true,amountCents:true}})]);const balanceCents=financial.reduce((a,r)=>a+(r.type==='entrada'?r.amountCents:-r.amountCents),0);res.json({events,lots,orders,tickets,participants,checkins,terminals,payouts,balanceCents})})
