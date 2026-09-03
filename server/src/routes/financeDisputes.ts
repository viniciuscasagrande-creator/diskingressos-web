import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { audit } from '../audit.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { requestedProducerId, writeProducerId } from '../tenant.js'
import { evaluateRefundEligibility, buildReversalPlan } from '../services/refundEnterpriseEngine.js'

export const financeDisputesRouter = Router()

// 1. Resumo Consolidado de Estornos, Chargebacks & Disputas
financeDisputesRouter.get('/summary', requireAuth, async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined
  const tenantScope = producerId ? { producerId } : {}
  const eventScope = { ...tenantScope, ...(eventId ? { eventId } : {}) }

  const [refunds, chargebacks] = await Promise.all([
    prisma.refundRequest.findMany({ where: eventScope }),
    prisma.financeChargeback.findMany({ where: eventScope })
  ])

  const totalRequestedRefundCents = refunds.reduce((a, r) => a + r.amountCents, 0)
  const totalCompletedRefundCents = refunds.filter(r => ['estornado', 'refunded', 'completed'].includes(r.status)).reduce((a, r) => a + r.amountCents, 0)
  const partialRefundsCount = refunds.filter(r => r.kind === 'parcial').length
  const pendingRefundsCount = refunds.filter(r => ['solicitado', 'requested', 'under_review', 'aprovado', 'approved', 'aguardando_gateway', 'processing'].includes(r.status)).length

  const openChargebacks = chargebacks.filter(c => ['disputed', 'evidence_required', 'evidence_sent'].includes(c.status))
  const openChargebacksCents = openChargebacks.reduce((a, c) => a + c.amountCents, 0)
  const wonChargebacks = chargebacks.filter(c => c.status === 'chargeback_won')
  const wonChargebacksCents = wonChargebacks.reduce((a, c) => a + c.amountCents, 0)
  const lostChargebacks = chargebacks.filter(c => c.status === 'chargeback_lost')
  const lostChargebacksCents = lostChargebacks.reduce((a, c) => a + c.amountCents, 0)

  const resolvedCount = wonChargebacks.length + lostChargebacks.length
  const recoveryRatePct = resolvedCount > 0 ? (wonChargebacks.length / resolvedCount) * 100 : 100

  res.json({
    totalRefundsCount: refunds.length,
    pendingRefundsCount,
    totalRequestedRefundCents,
    totalCompletedRefundCents,
    partialRefundsCount,
    totalChargebacksCount: chargebacks.length,
    openChargebacksCount: openChargebacks.length,
    openChargebacksCents,
    wonChargebacksCount: wonChargebacks.length,
    wonChargebacksCents,
    lostChargebacksCount: lostChargebacks.length,
    lostChargebacksCents,
    recoveryRatePct
  })
})

// 2. Estornos & Devoluções
financeDisputesRouter.get('/refunds', requireAuth, async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined
  const status = typeof req.query.status === 'string' ? req.query.status : undefined
  const kind = typeof req.query.kind === 'string' ? req.query.kind : undefined

  res.json(await prisma.refundRequest.findMany({
    where: {
      ...(producerId ? { producerId } : {}),
      ...(eventId ? { eventId } : {}),
      ...(status ? { status } : {}),
      ...(kind ? { kind } : {})
    },
    orderBy: { createdAt: 'desc' },
    take: 200
  }))
})

financeDisputesRouter.post('/refunds', requireAuth, async (req: AuthRequest, res) => {
  const p = z.object({
    orderCode: z.string().min(2),
    transactionRef: z.string().optional(),
    eventId: z.number().int().positive().optional(),
    amountCents: z.number().int().positive(),
    kind: z.enum(['total', 'parcial']).default('total'),
    method: z.string().min(2).default('credito'),
    reason: z.string().min(3),
    gatewayId: z.number().int().positive().optional(),
    acquirerId: z.number().int().positive().optional(),
    producerId: z.number().int().positive().optional()
  }).parse(req.body)

  const producerId = writeProducerId(req, p.producerId)
  if (!producerId) return res.status(400).json({ message: 'Produtora obrigatória.' })

  const code = `EST-${Date.now()}`
  const row = await prisma.refundRequest.create({
    data: {
      ...p,
      code,
      producerId,
      status: 'solicitado',
      requestedBy: String(req.auth!.id)
    } as any
  })

  await audit(req, req.auth!.id, producerId, 'create', 'refund-request', String(row.id), { code, amountCents: p.amountCents, orderCode: p.orderCode, kind: p.kind })
  res.status(201).json(row)
})

financeDisputesRouter.post('/refunds/:id/approve', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.refundRequest.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Solicitação de estorno não encontrada.' })
  if (current.status !== 'solicitado' && current.status !== 'requested') {
    return res.status(409).json({ message: 'Somente solicitações pendentes podem ser aprovadas.' })
  }

  const row = await prisma.refundRequest.update({
    where: { id },
    data: {
      status: 'aprovado',
      approvedBy: String(req.auth!.id),
      approvedAt: new Date()
    }
  })

  await audit(req, req.auth!.id, current.producerId, 'approve', 'refund-request', String(id), { amountCents: row.amountCents })
  res.json(row)
})

financeDisputesRouter.post('/refunds/:id/process', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.refundRequest.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Solicitação de estorno não encontrada.' })
  if (current.status !== 'aprovado' && current.status !== 'approved') {
    return res.status(409).json({ message: 'Aprovação prévia é obrigatória antes de enviar ao gateway/adquirente.' })
  }

  const protocol = `GW-REF-${Date.now()}`
  const row = await prisma.refundRequest.update({
    where: { id },
    data: {
      status: 'aguardando_gateway',
      gatewayProtocol: protocol,
      sentToGatewayAt: new Date()
    }
  })

  await audit(req, req.auth!.id, current.producerId, 'process', 'refund-request', String(id), { protocol, gatewayId: row.gatewayId })
  res.json({
    ...row,
    message: 'Solicitação despachada para o conector de pagamentos. Aguardando confirmação ou webhook do provedor.'
  })
})

financeDisputesRouter.post('/refunds/:id/complete', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.refundRequest.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Solicitação de estorno não encontrada.' })
  if (current.status === 'estornado' || current.status === 'refunded') {
    return res.status(409).json({ message: 'Este estorno já foi concluído anteriormente.' })
  }

  const finalStatus = current.kind === 'parcial' ? 'parcialmente_estornado' : 'estornado'

  const row = await prisma.$transaction(async tx => {
    const updated = await tx.refundRequest.update({
      where: { id },
      data: {
        status: finalStatus,
        completedAt: new Date()
      }
    })

    // Criação da transação financeira de reversão (saída de caixa por estorno)
    await tx.financialTransaction.create({
      data: {
        code: `FIN-${current.code}`,
        type: 'saida',
        category: 'estorno',
        description: `Estorno ${current.kind} pedido ${current.orderCode} (${current.code})`,
        amountCents: current.amountCents,
        status: 'liquidado',
        producerId: current.producerId,
        eventId: current.eventId
      }
    })

    return updated
  })

  await audit(req, req.auth!.id, current.producerId, 'complete', 'refund-request', String(id), { status: finalStatus, amountCents: row.amountCents })
  res.json(row)
})

// 3. Chargebacks & Contestações
financeDisputesRouter.get('/chargebacks', requireAuth, async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined
  const status = typeof req.query.status === 'string' ? req.query.status : undefined

  res.json(await prisma.financeChargeback.findMany({
    where: {
      ...(producerId ? { producerId } : {}),
      ...(eventId ? { eventId } : {}),
      ...(status ? { status } : {})
    },
    orderBy: { createdAt: 'desc' }
  }))
})

financeDisputesRouter.post('/chargebacks', requireAuth, async (req: AuthRequest, res) => {
  const p = z.object({
    orderCode: z.string().min(2),
    disputeId: z.string().optional(),
    cardBrand: z.string().optional(),
    cardLast4: z.string().optional(),
    amountCents: z.number().int().positive(),
    feeCents: z.number().int().min(0).default(0),
    reason: z.string().min(3),
    slaDays: z.number().int().min(1).default(7),
    gatewayId: z.number().int().positive().optional(),
    acquirerId: z.number().int().positive().optional(),
    eventId: z.number().int().positive().optional(),
    producerId: z.number().int().positive().optional()
  }).parse(req.body)

  const producerId = writeProducerId(req, p.producerId)
  if (!producerId) return res.status(400).json({ message: 'Produtora obrigatória.' })

  const slaDeadline = new Date()
  slaDeadline.setDate(slaDeadline.getDate() + p.slaDays)
  const code = `CHG-${Date.now()}`

  const row = await prisma.financeChargeback.create({
    data: {
      code,
      disputeId: p.disputeId,
      orderCode: p.orderCode,
      cardBrand: p.cardBrand,
      cardLast4: p.cardLast4,
      amountCents: p.amountCents,
      feeCents: p.feeCents,
      reason: p.reason,
      status: 'disputed',
      slaDeadline,
      gatewayId: p.gatewayId,
      acquirerId: p.acquirerId,
      eventId: p.eventId,
      producerId
    }
  })

  await audit(req, req.auth!.id, producerId, 'create', 'finance-chargeback', String(row.id), { code, amountCents: p.amountCents, reason: p.reason })
  res.status(201).json(row)
})

financeDisputesRouter.post('/chargebacks/:id/evidence', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.financeChargeback.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Chargeback não encontrado.' })

  const p = z.object({
    evidenceNotes: z.string().min(5),
    evidenceUrls: z.string().optional()
  }).parse(req.body)

  const row = await prisma.financeChargeback.update({
    where: { id },
    data: {
      evidenceNotes: p.evidenceNotes,
      evidenceUrls: p.evidenceUrls,
      status: 'evidence_sent'
    }
  })

  await audit(req, req.auth!.id, current.producerId, 'submit-evidence', 'finance-chargeback', String(id), { status: 'evidence_sent' })
  res.json(row)
})

financeDisputesRouter.post('/chargebacks/:id/resolve', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.financeChargeback.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Chargeback não encontrado.' })

  const p = z.object({
    decision: z.enum(['chargeback_won', 'chargeback_lost']),
    resolutionNotes: z.string().optional()
  }).parse(req.body)

  const row = await prisma.$transaction(async tx => {
    const updated = await tx.financeChargeback.update({
      where: { id },
      data: {
        status: p.decision,
        resolutionNotes: p.resolutionNotes,
        resolvedAt: new Date()
      }
    })

    // Se o chargeback for perdido, ocorre a reversão financeira e débito no saldo do produtor
    if (p.decision === 'chargeback_lost') {
      await tx.financialTransaction.create({
        data: {
          code: `FIN-${current.code}`,
          type: 'saida',
          category: 'chargeback',
          description: `Débito por chargeback perdido ${current.orderCode} (${current.code})`,
          amountCents: current.amountCents + current.feeCents,
          status: 'liquidado',
          producerId: current.producerId,
          eventId: current.eventId
        }
      })
    }

    return updated
  })

  await audit(req, req.auth!.id, current.producerId, 'resolve', 'finance-chargeback', String(id), { decision: p.decision, amountCents: current.amountCents })
  res.json(row)
})

// 4. Webhooks de Pagamento / Provedores (Idempotente)
financeDisputesRouter.post('/payment-events/webhook', async (req, res) => {
  const { provider = 'generic', eventId, eventType, orderCode, amountCents, payload } = req.body

  if (!eventId) {
    return res.status(400).json({ message: 'eventId obrigatório para idempotência do webhook.' })
  }

  // Verificação de evento duplicado (Idempotência)
  const existing = await prisma.paymentWebhookEvent.findUnique({ where: { eventId: String(eventId) } })
  if (existing) {
    return res.json({ ok: true, status: 'already_processed', message: 'Evento já processado anteriormente.' })
  }

  const webhookRecord = await prisma.paymentWebhookEvent.create({
    data: {
      provider: String(provider),
      eventId: String(eventId),
      eventType: String(eventType || 'unknown'),
      payload: typeof payload === 'string' ? payload : JSON.stringify(payload || {}),
      orderCode: orderCode ? String(orderCode) : undefined,
      status: 'processed'
    }
  })

  // Se o webhook for de confirmação de estorno do provedor
  if (eventType === 'refund.completed' && orderCode) {
    const refund = await prisma.refundRequest.findFirst({
      where: { orderCode: String(orderCode), status: 'aguardando_gateway' }
    })
    if (refund) {
      await prisma.$transaction(async tx => {
        await tx.refundRequest.update({
          where: { id: refund.id },
          data: { status: 'estornado', completedAt: new Date() }
        })
        await tx.financialTransaction.create({
          data: {
            code: `FIN-${refund.code}-WH`,
            type: 'saida',
            category: 'estorno',
            description: `Estorno confirmado via webhook ${provider} (${refund.orderCode})`,
            amountCents: refund.amountCents,
            status: 'liquidado',
            producerId: refund.producerId,
            eventId: refund.eventId
          }
        })
      })
    }
  }

  res.status(201).json({ ok: true, webhookId: webhookRecord.id, status: 'processed' })
})


// ===== Fase 25.8 — Motor Enterprise de Estornos =====
financeDisputesRouter.get('/enterprise/overview', requireAuth, async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined
  const where = { ...(producerId ? { producerId } : {}), ...(eventId ? { eventId } : {}) }
  const refunds = await prisma.refundRequest.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 })
  const pending = refunds.filter(r => ['solicitado','requested','under_review'].includes(r.status))
  const critical = refunds.filter(r => r.amountCents >= 500000 && !['estornado','refunded','completed'].includes(r.status))
  const partial = refunds.filter(r => r.kind === 'parcial')
  res.json({
    release: '25.8-enterprise-refund-engine-2026-09-02',
    pendingApprovals: pending.length,
    pendingAmountCents: pending.reduce((a,r)=>a+r.amountCents,0),
    criticalCases: critical.length,
    partialRefunds: partial.length,
    policy: { level1MaxCents: 99999, level2FromCents: 100000, level3FromCents: 500000, immutableLedger: true, requesterCannotApproveCritical: true },
    capabilities: ['eligibility','multi_level_approval','partial_refund','split_reversal','reserve_consumption','gateway_idempotency','ledger_compensation','sla','audit']
  })
})

financeDisputesRouter.post('/refunds/:id/eligibility', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.refundRequest.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Solicitação de estorno não encontrada.' })
  const result = evaluateRefundEligibility(current)
  await prisma.refundEligibilitySnapshot.create({ data: {
    refundRequestId: id, eligible: result.eligible, riskLevel: result.riskLevel,
    requiredApprovals: result.requiredApprovals, checksJson: JSON.stringify(result.checks),
    blockingReasonsJson: JSON.stringify(result.blockingReasons), evaluatedBy: String(req.auth!.id)
  }})
  await audit(req, req.auth!.id, current.producerId, 'eligibility', 'refund-request', String(id), result)
  res.json(result)
})

financeDisputesRouter.post('/refunds/:id/enterprise-approve', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const body = z.object({ notes: z.string().max(1000).optional() }).parse(req.body || {})
  const producerId = requestedProducerId(req)
  const current = await prisma.refundRequest.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Solicitação de estorno não encontrada.' })
  const eligibility = evaluateRefundEligibility(current)
  if (!eligibility.eligible) return res.status(409).json({ message: 'Estorno bloqueado pelas regras de elegibilidade.', eligibility })
  if (eligibility.requiredApprovals >= 2 && current.requestedBy === String(req.auth!.id)) {
    return res.status(403).json({ message: 'Segregação de função: o solicitante não pode aprovar este estorno de alçada elevada.' })
  }
  const prior = await prisma.refundApprovalStep.findMany({ where: { refundRequestId: id, status: 'approved' } })
  const nextLevel = prior.length + 1
  if (nextLevel > eligibility.requiredApprovals) return res.status(409).json({ message: 'Todas as alçadas necessárias já foram aprovadas.' })
  const step = await prisma.refundApprovalStep.upsert({
    where: { refundRequestId_approvalLevel: { refundRequestId: id, approvalLevel: nextLevel } },
    create: { refundRequestId: id, approvalLevel: nextLevel, status: 'approved', actorId: String(req.auth!.id), actorRole: req.auth!.role, decisionNotes: body.notes, decidedAt: new Date() },
    update: { status: 'approved', actorId: String(req.auth!.id), actorRole: req.auth!.role, decisionNotes: body.notes, decidedAt: new Date() }
  })
  const complete = nextLevel >= eligibility.requiredApprovals
  if (complete) await prisma.refundRequest.update({ where: { id }, data: { status: 'aprovado', approvedBy: String(req.auth!.id), approvedAt: new Date() } })
  await audit(req, req.auth!.id, current.producerId, 'enterprise-approve', 'refund-request', String(id), { level: nextLevel, required: eligibility.requiredApprovals, complete })
  res.json({ step, complete, currentLevel: nextLevel, requiredApprovals: eligibility.requiredApprovals })
})

financeDisputesRouter.post('/refunds/:id/reversal-plan', requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.refundRequest.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Solicitação de estorno não encontrada.' })
  const plan = buildReversalPlan(current)
  const saved = await prisma.refundReversalPlan.create({ data: { refundRequestId: id, amountCents: current.amountCents, strategy: plan.strategy, planJson: JSON.stringify(plan), createdBy: String(req.auth!.id) } })
  await audit(req, req.auth!.id, current.producerId, 'reversal-plan', 'refund-request', String(id), { planId: saved.id, strategy: plan.strategy })
  res.json({ ...plan, planId: saved.id })
})
