import { Router } from 'express'
import crypto from 'node:crypto'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { requireAuth, requireRoles, type AuthRequest } from '../middleware/auth.js'

export const financeSplitRouter = Router()
financeSplitRouter.use(requireAuth)

const uuid = z.string().uuid()
const paymentMethod = z.enum(['cash','pix','debit','credit_single','credit_2_6','credit_7_12','courtesy'])
const bearer = z.enum(['customer','producer','platform'])
const ruleSchema = z.object({
  paymentMethod,
  paymentFeeBps: z.number().int().min(0).max(10000).default(0),
  installmentFeeBps: z.number().int().min(0).max(10000).default(0),
  anticipationFeeBps: z.number().int().min(0).max(10000).default(0),
  serviceFeeBps: z.number().int().min(0).max(10000).default(0),
  serviceFeeBearer: bearer.default('customer'),
  anticipationFeeBearer: bearer.default('producer'),
  platformShareBps: z.number().int().min(0).max(10000).default(0),
  reserveBps: z.number().int().min(0).max(10000).default(0),
  active: z.boolean().default(true),
})
const participantSchema = z.object({kind:z.enum(['producer','platform','coproducer','affiliate','reserve','third_party']),participantRef:z.string().min(1).max(120),destinationRef:z.string().max(160).optional(),shareBps:z.number().int().min(0).max(10000).default(0),fixedCents:z.number().int().min(0).optional()})
const agreementSchema = z.object({tenantId:uuid,producerId:uuid,eventId:uuid,validFrom:z.string().datetime(),reason:z.string().min(5).max(500),rules:z.array(ruleSchema).min(1),participants:z.array(participantSchema).default([])})

const bpsAmount=(base:number,bps:number)=>Math.round(base*bps/10000)
function compute(rule:z.infer<typeof ruleSchema>,participants:z.infer<typeof participantSchema>[],gross:number,serviceFeeInput?:number){
  const service=serviceFeeInput ?? bpsAmount(gross,rule.serviceFeeBps)
  const payment=bpsAmount(gross,rule.paymentFeeBps), installment=bpsAmount(gross,rule.installmentFeeBps), anticipation=bpsAmount(gross,rule.anticipationFeeBps), reserve=bpsAmount(gross,rule.reserveBps), platformShare=bpsAmount(gross,rule.platformShareBps)
  const producerService=rule.serviceFeeBearer==='producer'?service:0, producerAnt=rule.anticipationFeeBearer==='producer'?anticipation:0
  const producerNet=Math.max(0,gross-payment-installment-producerAnt-producerService-reserve-platformShare)
  const platformRevenue=service+platformShare
  const customerTotal=gross+(rule.serviceFeeBearer==='customer'?service:0)
  const explicit=participants.filter(p=>p.kind!=='producer').map(p=>({...p,amountCents:p.fixedCents??bpsAmount(gross,p.shareBps)}))
  const explicitTotal=explicit.reduce((s,p)=>s+p.amountCents,0)
  if(explicitTotal>producerNet) throw new Error('Participações excedem o líquido do produtor.')
  const producer=participants.find(p=>p.kind==='producer')
  return {customerTotalCents:customerTotal,serviceFeeCents:service,paymentCostCents:payment,installmentCostCents:installment,anticipationCostCents:anticipation,producerNetCents:producerNet,platformRevenueCents:platformRevenue,reserveCents:reserve,allocations:[...explicit.map(p=>({participantKind:p.kind,participantRef:p.participantRef,destinationRef:p.destinationRef,amountCents:p.amountCents})),{participantKind:'producer',participantRef:producer?.participantRef??'producer',destinationRef:producer?.destinationRef,amountCents:producerNet-explicitTotal}]}
}

financeSplitRouter.get('/agreements/:eventId', async (req,res)=>{
  try{const eventId=uuid.parse(req.params.eventId),tenantId=uuid.parse(String(req.query.tenantId||'')); const rows=await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM financial_agreement_versions WHERE tenant_id=$1::uuid AND event_id=$2::uuid ORDER BY version DESC`,tenantId,eventId); res.json(rows)}catch(e:any){res.status(400).json({message:e?.message||'Falha ao consultar contratos.'})}
})

financeSplitRouter.post('/agreements', requireRoles('admin','financeiro','super_admin','finance_admin'), async (req:AuthRequest,res)=>{
  try{
    const p=agreementSchema.parse(req.body); const actor=req.auth?.id??0; const id=crypto.randomUUID()
    const created=await prisma.$transaction(async tx=>{
      const versions=await tx.$queryRawUnsafe<any[]>(`SELECT COALESCE(MAX(version),0)::int AS v FROM financial_agreement_versions WHERE event_id=$1::uuid`,p.eventId); const version=Number(versions[0]?.v||0)+1
      const checksum=crypto.createHash('sha256').update(JSON.stringify({rules:p.rules,participants:p.participants,validFrom:p.validFrom})).digest('hex')
      await tx.$executeRawUnsafe(`INSERT INTO financial_agreement_versions(id,tenant_id,producer_id,event_id,version,valid_from,status,rules,created_by,reason,checksum,created_at) VALUES($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5,$6,'draft',$7::jsonb,$8::uuid,$9,$10,now())`,id,p.tenantId,p.producerId,p.eventId,version,p.validFrom,JSON.stringify({rules:p.rules,participants:p.participants}),String(actor).padStart(32,'0').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12}).*$/,'$1-$2-$3-$4-$5'),p.reason,checksum)
      for(const r of p.rules) await tx.$executeRawUnsafe(`INSERT INTO financial_agreement_rules(id,agreement_version_id,payment_method,payment_fee_bps,installment_fee_bps,anticipation_fee_bps,service_fee_bps,service_fee_bearer,anticipation_fee_bearer,platform_share_bps,reserve_bps,active) VALUES($1::uuid,$2::uuid,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,crypto.randomUUID(),id,r.paymentMethod,r.paymentFeeBps,r.installmentFeeBps,r.anticipationFeeBps,r.serviceFeeBps,r.serviceFeeBearer,r.anticipationFeeBearer,r.platformShareBps,r.reserveBps,r.active)
      for(const x of p.participants) await tx.$executeRawUnsafe(`INSERT INTO financial_agreement_participants(id,agreement_version_id,participant_kind,participant_ref,destination_ref,share_bps,fixed_cents) VALUES($1::uuid,$2::uuid,$3,$4,$5,$6,$7)`,crypto.randomUUID(),id,x.kind,x.participantRef,x.destinationRef||null,x.shareBps,x.fixedCents??null)
      return {id,version,checksum}
    })
    res.status(201).json({ok:true,...created,status:'draft'})
  }catch(e:any){res.status(400).json({message:e?.message||'Falha ao criar contrato financeiro.'})}
})

financeSplitRouter.post('/agreements/:id/activate', requireRoles('admin','financeiro','super_admin','finance_admin'), async (req:AuthRequest,res)=>{
  try{const id=uuid.parse(req.params.id); const actor=req.auth?.id??0; await prisma.$transaction(async tx=>{const rows=await tx.$queryRawUnsafe<any[]>(`SELECT * FROM financial_agreement_versions WHERE id=$1::uuid`,id); const row=rows[0]; if(!row)throw new Error('Contrato não encontrado.'); await tx.$executeRawUnsafe(`UPDATE financial_agreement_versions SET status='superseded',valid_until=GREATEST(valid_from,$2::timestamptz-interval '1 millisecond') WHERE tenant_id=$1::uuid AND event_id=$3::uuid AND status='active' AND id<>$4::uuid`,row.tenant_id,row.valid_from,row.event_id,id); await tx.$executeRawUnsafe(`UPDATE financial_agreement_versions SET status='active',approved_by=$2::uuid,approved_at=now() WHERE id=$1::uuid`,id,String(actor).padStart(32,'0').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12}).*$/,'$1-$2-$3-$4-$5'))}); res.json({ok:true,id,status:'active'})}catch(e:any){res.status(400).json({message:e?.message||'Falha ao ativar contrato.'})}
})

const simulationSchema=z.object({tenantId:uuid,eventId:uuid,occurredAt:z.string().datetime().optional(),paymentMethod,grossTicketCents:z.number().int().nonnegative(),serviceFeeCents:z.number().int().nonnegative().optional()})
financeSplitRouter.post('/simulate', async (req,res)=>{
  try{const p=simulationSchema.parse(req.body); const at=p.occurredAt??new Date().toISOString(); const agreements=await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM financial_agreement_versions WHERE tenant_id=$1::uuid AND event_id=$2::uuid AND status='active' AND valid_from<=$3::timestamptz AND (valid_until IS NULL OR valid_until>=$3::timestamptz) ORDER BY valid_from DESC,version DESC LIMIT 1`,p.tenantId,p.eventId,at); const agreement=agreements[0]; if(!agreement)throw new Error('Nenhum contrato financeiro ativo para a data da venda.'); const rules=await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM financial_agreement_rules WHERE agreement_version_id=$1::uuid AND payment_method=$2 AND active=true LIMIT 1`,agreement.id,p.paymentMethod); if(!rules[0])throw new Error('Meio de pagamento não configurado no contrato.'); const parts=await prisma.$queryRawUnsafe<any[]>(`SELECT participant_kind,participant_ref,destination_ref,share_bps,fixed_cents FROM financial_agreement_participants WHERE agreement_version_id=$1::uuid AND active=true`,agreement.id); const rule={paymentMethod:p.paymentMethod,paymentFeeBps:Number(rules[0].payment_fee_bps),installmentFeeBps:Number(rules[0].installment_fee_bps),anticipationFeeBps:Number(rules[0].anticipation_fee_bps),serviceFeeBps:Number(rules[0].service_fee_bps),serviceFeeBearer:rules[0].service_fee_bearer,anticipationFeeBearer:rules[0].anticipation_fee_bearer,platformShareBps:Number(rules[0].platform_share_bps),reserveBps:Number(rules[0].reserve_bps),active:true} as z.infer<typeof ruleSchema>; const participants=parts.map(x=>({kind:x.participant_kind,participantRef:x.participant_ref,destinationRef:x.destination_ref||undefined,shareBps:Number(x.share_bps),fixedCents:x.fixed_cents===null?undefined:Number(x.fixed_cents)})) as z.infer<typeof participantSchema>[]; res.json({agreementVersionId:agreement.id,agreementVersion:agreement.version,...compute(rule,participants,p.grossTicketCents,p.serviceFeeCents)})}catch(e:any){res.status(400).json({message:e?.message||'Falha ao simular split.'})}
})

financeSplitRouter.get('/executions', async (req,res)=>{
  try{const tenantId=uuid.parse(String(req.query.tenantId||'')); const eventId=req.query.eventId?uuid.parse(String(req.query.eventId)):undefined; const rows=eventId?await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM split_executions WHERE tenant_id=$1::uuid AND event_id=$2::uuid ORDER BY executed_at DESC LIMIT 500`,tenantId,eventId):await prisma.$queryRawUnsafe<any[]>(`SELECT * FROM split_executions WHERE tenant_id=$1::uuid ORDER BY executed_at DESC LIMIT 500`,tenantId); res.json(rows.map(r=>({...r,gross_ticket_cents:Number(r.gross_ticket_cents),customer_total_cents:Number(r.customer_total_cents),producer_net_cents:Number(r.producer_net_cents),platform_revenue_cents:Number(r.platform_revenue_cents)})))}catch(e:any){res.status(400).json({message:e?.message||'Falha ao consultar splits.'})}
})
