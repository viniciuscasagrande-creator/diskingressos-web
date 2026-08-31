import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { audit } from '../audit.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { requestedProducerId, writeProducerId } from '../tenant.js'
export const financeOperationsRouter=Router();financeOperationsRouter.use(requireAuth)
financeOperationsRouter.get('/dashboard',async(req:AuthRequest,res)=>{
 const producerId=requestedProducerId(req),eventId=req.query.eventId?Number(req.query.eventId):undefined
 const scope={...(producerId?{producerId}:{}),...(eventId?{eventId}:{})}
 const producerScope=producerId?{producerId}:{}
 const safe=async<T>(name:string,fn:()=>Promise<T>,fallback:T)=>{try{return {name,ok:true as const,data:await fn()}}catch(error){console.error(`[finance-dashboard] ${name}`,error);return {name,ok:false as const,data:fallback}}}
 const [txR,oblR,payoutR,gatewayR,acquirerR,methodR,refundR,spreadR,recR,settlementR]=await Promise.all([
  safe('transactions',()=>prisma.financialTransaction.findMany({where:scope,select:{type:true,amountCents:true,status:true}}),[]),
  safe('obligations',()=>prisma.financialObligation.findMany({where:scope,select:{kind:true,amountCents:true,status:true}}),[]),
  safe('payouts',()=>prisma.payout.findMany({where:producerScope,select:{amountCents:true,status:true}}),[]),
  safe('gateways',()=>prisma.paymentGatewayConfig.findMany({where:producerScope,select:{status:true}}),[]),
  safe('acquirers',()=>prisma.cardAcquirer.findMany({where:producerScope,select:{status:true}}),[]),
  safe('methods',()=>prisma.paymentMethodRule.findMany({where:producerScope,select:{status:true}}),[]),
  safe('refunds',()=>prisma.refundRequest.findMany({where:scope,select:{amountCents:true,status:true}}),[]),
  safe('spread',()=>prisma.financeSpreadSimulation.findMany({where:scope,select:{grossCents:true,netMarginCents:true}}),[]),
  safe('reconciliation',()=>prisma.reconciliationItem.findMany({where:scope,select:{status:true,differenceCents:true}}),[]),
  safe('settlements',()=>prisma.financeSettlement.findMany({where:scope,select:{expectedCents:true,receivedCents:true,status:true}}),[])
 ])
 const tx=txR.data,obligations=oblR.data,payouts=payoutR.data,refunds=refundR.data,spread=spreadR.data,reconciliation=recR.data,settlements=settlementR.data
 const liquidated=tx.filter(x=>x.status==='liquidado'),entries=liquidated.filter(x=>x.type==='entrada').reduce((a,x)=>a+x.amountCents,0),exits=liquidated.filter(x=>x.type==='saida').reduce((a,x)=>a+x.amountCents,0)
 const future=settlements.filter(x=>!['reconciled','liquidado','settled'].includes(x.status)).reduce((a,x)=>a+Math.max(0,x.expectedCents-x.receivedCents),0)+obligations.filter(x=>x.kind==='receber'&&x.status!=='pago').reduce((a,x)=>a+x.amountCents,0)
 const pendingPayouts=payouts.filter(x=>!['pago','cancelado','rejeitado'].includes(x.status))
 const grossSpread=spread.reduce((a,x)=>a+x.grossCents,0),margin=spread.reduce((a,x)=>a+x.netMarginCents,0)
 const sources=[txR,oblR,payoutR,gatewayR,acquirerR,methodR,refundR,spreadR,recR,settlementR]
 res.json({
  availableBalanceCents:entries-exits,futureBalanceCents:future,
  payablesCents:obligations.filter(x=>x.kind==='pagar'&&x.status!=='pago').reduce((a,x)=>a+x.amountCents,0),
  pendingPayoutsCents:pendingPayouts.reduce((a,x)=>a+x.amountCents,0),pendingPayoutsCount:pendingPayouts.length,
  avgMarginBps:grossSpread?Math.round(margin/grossSpread*10000):0,spreadSimulations:spread.length,
  divergences:reconciliation.filter(x=>x.status==='divergente'||x.differenceCents!==0).length,
  activeGateways:gatewayR.data.filter(x=>x.status==='ativo').length,activeAcquirers:acquirerR.data.filter(x=>x.status==='ativo').length,
  methods:methodR.data.filter(x=>x.status!=='inativo').length,
  refundsCents:refunds.filter(x=>!['recusado','cancelado'].includes(x.status)).reduce((a,x)=>a+x.amountCents,0),
  receivablesCents:future,
  health:{ok:sources.filter(x=>x.ok).length,total:sources.length,unavailable:sources.filter(x=>!x.ok).map(x=>x.name)}
 })
})
financeOperationsRouter.get('/transactions',async(req:AuthRequest,res)=>{const producerId=requestedProducerId(req),eventId=req.query.eventId?Number(req.query.eventId):undefined,type=typeof req.query.type==='string'?req.query.type:undefined;res.json(await prisma.financialTransaction.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{}),...(type?{type}:{})},include:{event:{select:{id:true,title:true}},order:{select:{id:true,code:true}},payout:{select:{id:true,code:true}}},orderBy:{occurredAt:'desc'}}))})
financeOperationsRouter.get('/balance',async(req:AuthRequest,res)=>{const producerId=requestedProducerId(req);const rows=await prisma.financialTransaction.findMany({where:{...(producerId?{producerId}:{}),status:'liquidado'},select:{type:true,amountCents:true}});const entries=rows.filter(r=>r.type==='entrada').reduce((a,r)=>a+r.amountCents,0),exits=rows.filter(r=>r.type==='saida').reduce((a,r)=>a+r.amountCents,0);res.json({entriesCents:entries,exitsCents:exits,balanceCents:entries-exits})})
financeOperationsRouter.get('/payouts',async(req:AuthRequest,res)=>{const producerId=requestedProducerId(req);res.json(await prisma.payout.findMany({where:producerId?{producerId}:undefined,include:{producer:{select:{name:true}}},orderBy:{requestedAt:'desc'}}))})
financeOperationsRouter.post('/payouts',async(req:AuthRequest,res)=>{const p=z.object({amountCents:z.number().int().positive(),bankAccount:z.string().min(3).optional(),notes:z.string().optional(),producerId:z.number().int().positive().optional()}).parse(req.body),producerId=writeProducerId(req,p.producerId);if(!producerId)return res.status(400).json({message:'Produtora obrigatória.'});const balanceRows=await prisma.financialTransaction.findMany({where:{producerId,status:'liquidado'},select:{type:true,amountCents:true}}),balance=balanceRows.reduce((a,r)=>a+(r.type==='entrada'?r.amountCents:-r.amountCents),0);if(p.amountCents>balance)return res.status(400).json({message:'Saldo insuficiente para o repasse.'});const code=`REP-${Date.now()}`;const payout=await prisma.$transaction(async tx=>{const created=await tx.payout.create({data:{code,amountCents:p.amountCents,bankAccount:p.bankAccount,notes:p.notes,producerId}});await tx.financialTransaction.create({data:{code:`FIN-${code}`,type:'saida',category:'repasse',description:`Solicitação de repasse ${code}`,amountCents:p.amountCents,status:'pendente',producerId,payoutId:created.id}});return created});await audit(req,req.auth!.id,producerId,'create','payout',String(payout.id),`R$ ${(p.amountCents/100).toFixed(2)}`);res.status(201).json(payout)})
