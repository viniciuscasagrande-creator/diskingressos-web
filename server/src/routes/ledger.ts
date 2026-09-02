import { Router } from 'express'
import crypto from 'node:crypto'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { requireAuth, requireRoles, type AuthRequest } from '../middleware/auth.js'

export const ledgerRouter = Router()
ledgerRouter.use(requireAuth)

const uuid = z.string().uuid()
const lineSchema = z.object({ accountCode: z.string().min(1).max(40), side: z.enum(['debit','credit']), amountCents: z.number().int().positive(), memo: z.string().max(500).optional() })
const postSchema = z.object({
  tenantId: uuid,
  producerId: uuid.optional(), eventId: uuid.optional(), orderId: uuid.optional(), transactionId: uuid.optional(),
  description: z.string().min(3).max(500), sourceType: z.string().min(2).max(60), sourceId: z.string().min(1).max(120),
  idempotencyKey: z.string().min(8).max(160), occurredAt: z.string().datetime().optional(), metadata: z.record(z.string(), z.unknown()).optional(),
  producerRef: z.string().max(80).optional(), eventRef: z.string().max(80).optional(), orderRef: z.string().max(120).optional(), transactionRef: z.string().max(120).optional(),
  entries: z.array(lineSchema).min(2).max(50),
})

function assertBalanced(entries: z.infer<typeof lineSchema>[]) {
  const debit = entries.filter(e=>e.side==='debit').reduce((s,e)=>s+e.amountCents,0)
  const credit = entries.filter(e=>e.side==='credit').reduce((s,e)=>s+e.amountCents,0)
  if (debit !== credit) throw new Error(`Lote não balanceado: débito=${debit}, crédito=${credit}`)
}

ledgerRouter.get('/accounts', async (req:AuthRequest,res) => {
  const tenantId=String(req.query.tenantId||'')
  if(!uuid.safeParse(tenantId).success) return res.status(400).json({message:'tenantId UUID obrigatório.'})
  const rows=await prisma.$queryRawUnsafe<any[]>(`SELECT id,code,name,nature,owner_scope,"active",allows_posting,parent_id,description FROM ledger_accounts WHERE tenant_id=$1::uuid ORDER BY code`,tenantId)
  res.json(rows)
})

ledgerRouter.get('/balances', async (req:AuthRequest,res) => {
  const tenantId=String(req.query.tenantId||'')
  if(!uuid.safeParse(tenantId).success) return res.status(400).json({message:'tenantId UUID obrigatório.'})
  const rows=await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM ledger_account_balances WHERE tenant_id=$1::uuid ORDER BY code`,tenantId)
  res.json(rows.map(r=>({...r,balance_cents:Number(r.balance_cents)})))
})

ledgerRouter.get('/entries', async (req:AuthRequest,res) => {
  const tenantId=String(req.query.tenantId||''), orderRef=req.query.orderRef?String(req.query.orderRef):undefined, producerRef=req.query.producerRef?String(req.query.producerRef):undefined
  if(!uuid.safeParse(tenantId).success) return res.status(400).json({message:'tenantId UUID obrigatório.'})
  const clauses=['b.tenant_id=$1::uuid']; const args:any[]=[tenantId]
  if(orderRef){args.push(orderRef);clauses.push(`e.order_ref=$${args.length}`)}
  if(producerRef){args.push(producerRef);clauses.push(`e.producer_ref=$${args.length}`)}
  const rows=await prisma.$queryRawUnsafe<any[]>(`SELECT e.id,e.side,e.amount_cents,e.currency,e.occurred_at,e.memo,e.producer_ref,e.event_ref,e.order_ref,e.transaction_ref,a.code account_code,a.name account_name,b.id batch_id,b.description,b.source_type,b.source_id,b.reversal_of_batch_id FROM ledger_entries e JOIN ledger_batches b ON b.id=e.batch_id JOIN ledger_accounts a ON a.id=e.account_id WHERE ${clauses.join(' AND ')} ORDER BY e.occurred_at DESC,e.created_at DESC LIMIT 1000`,...args)
  res.json(rows.map(r=>({...r,amount_cents:Number(r.amount_cents)})))
})

ledgerRouter.post('/post', requireRoles('admin','financeiro','contabilidade','super_admin','finance_admin','accounting'), async (req:AuthRequest,res) => {
  try {
    const p=postSchema.parse(req.body); assertBalanced(p.entries)
    const actorId=req.auth?.id ?? 0; const batchId=crypto.randomUUID(); const occurredAt=p.occurredAt?new Date(p.occurredAt):new Date()
    const result=await prisma.$transaction(async tx=>{
      const duplicate=await tx.$queryRawUnsafe<any[]>(`SELECT id FROM ledger_batches WHERE tenant_id=$1::uuid AND idempotency_key=$2 LIMIT 1`,p.tenantId,p.idempotencyKey)
      if(duplicate[0]) return {id:duplicate[0].id,idempotent:true}
      const codes=p.entries.map(e=>e.accountCode)
      const accounts=await tx.$queryRawUnsafe<any[]>(`SELECT id,code,allows_posting FROM ledger_accounts WHERE tenant_id=$1::uuid AND code = ANY($2::varchar[]) AND active=true`,p.tenantId,codes)
      const map=new Map(accounts.map(a=>[a.code,a])); const missing=[...new Set(codes.filter(c=>!map.has(c)))]
      if(missing.length) throw new Error(`Contas não encontradas: ${missing.join(', ')}`)
      const blocked=accounts.filter(a=>!a.allows_posting).map(a=>a.code); if(blocked.length) throw new Error(`Contas sintéticas não aceitam lançamento: ${blocked.join(', ')}`)
      await tx.$executeRawUnsafe(`INSERT INTO ledger_batches(id,tenant_id,producer_id,event_id,order_id,transaction_id,description,source_type,source_id,idempotency_key,status,created_by,created_at,posted_at,metadata) VALUES($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::uuid,$6::uuid,$7,$8,$9,$10,'posted',$11::uuid,now(),now(),$12::jsonb)`,batchId,p.tenantId,p.producerId||null,p.eventId||null,p.orderId||null,p.transactionId||null,p.description,p.sourceType,p.sourceId,p.idempotencyKey,String(actorId).padStart(32,'0').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12}).*$/,'$1-$2-$3-$4-$5'),JSON.stringify(p.metadata||{}))
      for(const e of p.entries) await tx.$executeRawUnsafe(`INSERT INTO ledger_entries(id,batch_id,account_id,side,amount_cents,currency,occurred_at,created_at,memo,producer_ref,event_ref,order_ref,transaction_ref) VALUES($1::uuid,$2::uuid,$3::uuid,$4,$5,'BRL',$6,now(),$7,$8,$9,$10,$11)`,crypto.randomUUID(),batchId,map.get(e.accountCode).id,e.side,e.amountCents,occurredAt,e.memo||null,p.producerRef||null,p.eventRef||null,p.orderRef||null,p.transactionRef||null)
      await tx.$queryRawUnsafe(`SELECT assert_ledger_batch_balanced($1::uuid)`,batchId)
      return {id:batchId,idempotent:false}
    })
    res.status(result.idempotent?200:201).json({ok:true,batchId:result.id,idempotent:result.idempotent})
  } catch(e:any) { res.status(400).json({message:e?.message||'Falha ao contabilizar lote.'}) }
})

ledgerRouter.post('/reverse/:batchId', requireRoles('admin','financeiro','contabilidade','super_admin','finance_admin','accounting'), async (req:AuthRequest,res) => {
  try {
    const batchId=uuid.parse(req.params.batchId); const body=z.object({reason:z.string().min(5).max(500),idempotencyKey:z.string().min(8).max(160)}).parse(req.body)
    const actorId=req.auth?.id ?? 0; const reversalId=crypto.randomUUID()
    const result=await prisma.$transaction(async tx=>{
      const dupe=await tx.$queryRawUnsafe<any[]>(`SELECT id FROM ledger_batches WHERE idempotency_key=$1 LIMIT 1`,body.idempotencyKey); if(dupe[0])return{id:dupe[0].id,idempotent:true}
      const batches=await tx.$queryRawUnsafe<any[]>(`SELECT * FROM ledger_batches WHERE id=$1::uuid`,batchId); const original=batches[0]; if(!original)throw new Error('Lote original não encontrado.')
      const prior=await tx.$queryRawUnsafe<any[]>(`SELECT id FROM ledger_batches WHERE reversal_of_batch_id=$1::uuid LIMIT 1`,batchId); if(prior[0])throw new Error('Lote já foi revertido.')
      const entries=await tx.$queryRawUnsafe<any[]>(`SELECT * FROM ledger_entries WHERE batch_id=$1::uuid`,batchId)
      await tx.$executeRawUnsafe(`INSERT INTO ledger_batches(id,tenant_id,producer_id,event_id,order_id,transaction_id,description,source_type,source_id,reversal_of_batch_id,idempotency_key,status,created_by,created_at,posted_at,metadata) VALUES($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::uuid,$6::uuid,$7,'ledger_reversal',$8,$9::uuid,$10,'posted',$11::uuid,now(),now(),$12::jsonb)`,reversalId,original.tenant_id,original.producer_id,original.event_id,original.order_id,original.transaction_id,`REVERSÃO: ${body.reason}`,String(original.id),batchId,body.idempotencyKey,String(actorId).padStart(32,'0').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12}).*$/,'$1-$2-$3-$4-$5'),JSON.stringify({reason:body.reason}))
      for(const e of entries) await tx.$executeRawUnsafe(`INSERT INTO ledger_entries(id,batch_id,account_id,side,amount_cents,currency,reversal_of_entry_id,occurred_at,created_at,memo,producer_ref,event_ref,order_ref,transaction_ref) VALUES($1::uuid,$2::uuid,$3::uuid,$4,$5,$6,$7::uuid,now(),now(),$8,$9,$10,$11,$12)`,crypto.randomUUID(),reversalId,e.account_id,e.side==='debit'?'credit':'debit',Number(e.amount_cents),e.currency,e.id,`Reversão: ${body.reason}`,e.producer_ref,e.event_ref,e.order_ref,e.transaction_ref)
      await tx.$queryRawUnsafe(`SELECT assert_ledger_batch_balanced($1::uuid)`,reversalId); return{id:reversalId,idempotent:false}
    })
    res.status(result.idempotent?200:201).json({ok:true,batchId:result.id,reversalOf:batchId,idempotent:result.idempotent})
  } catch(e:any){res.status(400).json({message:e?.message||'Falha ao reverter lote.'})}
})
