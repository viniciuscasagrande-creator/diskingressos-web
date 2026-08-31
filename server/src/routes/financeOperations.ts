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

// ===== Fase 20.2.5.2 — Operações de Caixa Financeiro =====
financeOperationsRouter.get('/cash/summary', async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined
  const scope = { ...(producerId ? { producerId } : {}), ...(eventId ? { eventId } : {}) }
  const producerScope = producerId ? { producerId } : {}
  const [transactions, obligations, payouts, events] = await Promise.all([
    prisma.financialTransaction.findMany({ where: scope, select: { eventId:true,type:true,amountCents:true,status:true } }),
    prisma.financialObligation.findMany({ where: scope, select: { eventId:true,kind:true,category:true,amountCents:true,status:true } }),
    prisma.payout.findMany({ where: producerScope, select: { amountCents:true,status:true } }),
    prisma.event.findMany({ where: { ...producerScope, ...(eventId ? { id:eventId } : {}) }, select: { id:true,title:true } })
  ])
  const liquidated=transactions.filter(t=>t.status==='liquidado')
  const entries=liquidated.filter(t=>t.type==='entrada').reduce((a,t)=>a+t.amountCents,0)
  const exits=liquidated.filter(t=>t.type==='saida').reduce((a,t)=>a+t.amountCents,0)
  const pendingPayoutCents=payouts.filter(p=>!['paid','pago','cancelled','cancelado','rejected','rejeitado'].includes(p.status)).reduce((a,p)=>a+p.amountCents,0)
  const receivables=obligations.filter(o=>o.kind==='receber'&&o.status!=='pago')
  const expenses=obligations.filter(o=>o.kind==='pagar')
  const rows=events.map(ev=>{
    const tx=transactions.filter(t=>t.eventId===ev.id), liq=tx.filter(t=>t.status==='liquidado')
    const evEntries=liq.filter(t=>t.type==='entrada').reduce((a,t)=>a+t.amountCents,0)
    const evExits=liq.filter(t=>t.type==='saida').reduce((a,t)=>a+t.amountCents,0)
    const pending=tx.filter(t=>t.status!=='liquidado').reduce((a,t)=>a+(t.type==='entrada'?t.amountCents:-t.amountCents),0)
    const recv=receivables.filter(o=>o.eventId===ev.id).reduce((a,o)=>a+o.amountCents,0)
    return {eventId:ev.id,eventName:ev.title,entriesCents:evEntries,exitsCents:evExits,availableCents:evEntries-evExits,pendingCents:pending,receivableCents:recv}
  })
  res.json({
    availableCents:entries-exits,
    pendingPayoutCents,
    futureCents:receivables.reduce((a,o)=>a+o.amountCents,0),
    expensesOpenCents:expenses.filter(o=>o.status!=='pago'&&o.status!=='cancelado').reduce((a,o)=>a+o.amountCents,0),
    expensesPaidCents:expenses.filter(o=>o.status==='pago').reduce((a,o)=>a+o.amountCents,0),
    events:rows
  })
})

financeOperationsRouter.get('/cash/transactions', async (req: AuthRequest, res) => {
  const producerId=requestedProducerId(req), eventId=req.query.eventId?Number(req.query.eventId):undefined
  const type=typeof req.query.type==='string'?req.query.type:undefined, category=typeof req.query.category==='string'?req.query.category:undefined
  res.json(await prisma.financialTransaction.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{}),...(type?{type}:{}),...(category?{category}:{})},include:{event:{select:{id:true,title:true}},order:{select:{id:true,code:true}},payout:{select:{id:true,code:true}}},orderBy:{occurredAt:'desc'}}))
})

financeOperationsRouter.get('/cash/bank-accounts', async (req: AuthRequest, res) => {
  const producerId=requestedProducerId(req)
  res.json(await prisma.financeBankAccount.findMany({where:producerId?{producerId}:undefined,orderBy:[{isPrimary:'desc'},{createdAt:'desc'}]}))
})

financeOperationsRouter.post('/cash/bank-accounts', async (req: AuthRequest, res) => {
  const p=z.object({bankCode:z.string().min(2),bankName:z.string().min(2),agency:z.string().min(1),accountNumber:z.string().min(2),accountType:z.string().default('corrente'),holderName:z.string().min(2),holderDocument:z.string().min(3),pixType:z.string().optional(),pixKey:z.string().optional(),isPrimary:z.boolean().optional(),producerId:z.number().int().positive().optional()}).parse(req.body)
  const producerId=writeProducerId(req,p.producerId); if(!producerId)return res.status(400).json({message:'Produtora obrigatória.'})
  const count=await prisma.financeBankAccount.count({where:{producerId}}), makePrimary=p.isPrimary===true||count===0
  const row=await prisma.$transaction(async tx=>{if(makePrimary)await tx.financeBankAccount.updateMany({where:{producerId},data:{isPrimary:false}});return tx.financeBankAccount.create({data:{...p,producerId,isPrimary:makePrimary,verifiedAt:new Date()}})})
  await audit(req,req.auth!.id,producerId,'create','finance-bank-account',String(row.id),`${row.bankName} ${row.agency}/${row.accountNumber}`); res.status(201).json(row)
})

financeOperationsRouter.patch('/cash/bank-accounts/:id', async (req: AuthRequest, res) => {
  const id=Number(req.params.id),producerId=requestedProducerId(req); const current=await prisma.financeBankAccount.findFirst({where:{id,...(producerId?{producerId}:{})}}); if(!current)return res.status(404).json({message:'Conta bancária não encontrada.'})
  const p=z.object({bankCode:z.string().min(2).optional(),bankName:z.string().min(2).optional(),agency:z.string().min(1).optional(),accountNumber:z.string().min(2).optional(),accountType:z.string().optional(),holderName:z.string().min(2).optional(),holderDocument:z.string().min(3).optional(),pixType:z.string().nullable().optional(),pixKey:z.string().nullable().optional(),status:z.enum(['ativo','inativo']).optional()}).parse(req.body)
  const row=await prisma.financeBankAccount.update({where:{id},data:p}); await audit(req,req.auth!.id,current.producerId,'update','finance-bank-account',String(id),p); res.json(row)
})

financeOperationsRouter.patch('/cash/bank-accounts/:id/primary', async (req: AuthRequest, res) => {
  const id=Number(req.params.id),producerId=requestedProducerId(req); const current=await prisma.financeBankAccount.findFirst({where:{id,...(producerId?{producerId}:{})}}); if(!current)return res.status(404).json({message:'Conta bancária não encontrada.'})
  const row=await prisma.$transaction(async tx=>{await tx.financeBankAccount.updateMany({where:{producerId:current.producerId},data:{isPrimary:false}});return tx.financeBankAccount.update({where:{id},data:{isPrimary:true,status:'ativo'}})})
  await audit(req,req.auth!.id,current.producerId,'set-primary','finance-bank-account',String(id),row.bankName); res.json(row)
})

financeOperationsRouter.get('/cash/expenses', async (req: AuthRequest, res) => {
  const producerId=requestedProducerId(req),eventId=req.query.eventId?Number(req.query.eventId):undefined
  res.json(await prisma.financialObligation.findMany({where:{...(producerId?{producerId}:{}),...(eventId?{eventId}:{}),kind:'pagar'},include:{event:{select:{id:true,title:true}}},orderBy:[{dueDate:'asc'},{createdAt:'desc'}]}))
})

financeOperationsRouter.post('/cash/expenses', async (req: AuthRequest, res) => {
  const p=z.object({category:z.string().min(2),description:z.string().min(2),amountCents:z.number().int().positive(),dueDate:z.coerce.date(),counterparty:z.string().optional(),documentRef:z.string().optional(),eventId:z.number().int().positive().optional(),producerId:z.number().int().positive().optional()}).parse(req.body)
  const producerId=writeProducerId(req,p.producerId); if(!producerId)return res.status(400).json({message:'Produtora obrigatória.'})
  const row=await prisma.financialObligation.create({data:{code:`DES-${Date.now()}`,kind:'pagar',category:p.category,description:p.description,amountCents:p.amountCents,dueDate:p.dueDate,counterparty:p.counterparty,documentRef:p.documentRef,eventId:p.eventId,producerId}})
  await audit(req,req.auth!.id,producerId,'create','finance-expense',String(row.id),{amountCents:row.amountCents,category:row.category});res.status(201).json(row)
})

financeOperationsRouter.patch('/cash/expenses/:id', async (req: AuthRequest, res) => {
  const id=Number(req.params.id),producerId=requestedProducerId(req);const current=await prisma.financialObligation.findFirst({where:{id,kind:'pagar',...(producerId?{producerId}:{})}});if(!current)return res.status(404).json({message:'Despesa não encontrada.'})
  const p=z.object({category:z.string().min(2).optional(),description:z.string().min(2).optional(),amountCents:z.number().int().positive().optional(),dueDate:z.coerce.date().optional(),counterparty:z.string().nullable().optional(),documentRef:z.string().nullable().optional(),status:z.enum(['aberto','agendado','cancelado']).optional()}).parse(req.body)
  const row=await prisma.financialObligation.update({where:{id},data:p});await audit(req,req.auth!.id,current.producerId,'update','finance-expense',String(id),p);res.json(row)
})

financeOperationsRouter.patch('/cash/expenses/:id/pay', async (req: AuthRequest, res) => {
  const id=Number(req.params.id),producerId=requestedProducerId(req);const current=await prisma.financialObligation.findFirst({where:{id,kind:'pagar',...(producerId?{producerId}:{})}});if(!current)return res.status(404).json({message:'Despesa não encontrada.'});if(current.status==='pago')return res.json(current)
  const balanceRows=await prisma.financialTransaction.findMany({where:{producerId:current.producerId,status:'liquidado'},select:{type:true,amountCents:true}}), balance=balanceRows.reduce((a,t)=>a+(t.type==='entrada'?t.amountCents:-t.amountCents),0);if(current.amountCents>balance)return res.status(400).json({message:'Saldo financeiro insuficiente para liquidar esta despesa.'})
  const row=await prisma.$transaction(async tx=>{const paid=await tx.financialObligation.update({where:{id},data:{status:'pago',paidAt:new Date()}});await tx.financialTransaction.create({data:{code:`FIN-DES-${id}-${Date.now()}`,type:'saida',category:'despesa',description:`${current.description} (${current.code})`,amountCents:current.amountCents,status:'liquidado',producerId:current.producerId,eventId:current.eventId}});return paid})
  await audit(req,req.auth!.id,current.producerId,'pay','finance-expense',String(id),{amountCents:row.amountCents});res.json(row)
})
