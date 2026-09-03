import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { audit } from '../audit.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { requestedProducerId, writeProducerId } from '../tenant.js'

export const financeSettlementRouter = Router()
financeSettlementRouter.use(requireAuth)

const scope = (req: AuthRequest) => {
  const producerId = requestedProducerId(req)
  return producerId ? { producerId } : undefined
}

// 1. Resumo Operacional Consolidado
financeSettlementRouter.get('/summary', async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined
  const tenantScope = producerId ? { producerId } : {}
  const eventScope = { ...tenantScope, ...(eventId ? { eventId } : {}) }

  const [txRows, payouts, splits, advances, settlements, obligations] = await Promise.all([
    prisma.financialTransaction.findMany({ where: { ...tenantScope, status: 'liquidado' }, select: { type: true, amountCents: true } }),
    prisma.payout.findMany({ where: tenantScope }),
    prisma.financeSplitRule.findMany({ where: eventScope }),
    prisma.financeAdvance.findMany({ where: eventScope }),
    prisma.financeSettlement.findMany({ where: eventScope }),
    prisma.financialObligation.findMany({ where: { ...eventScope, kind: 'receber' } })
  ])

  const totalEntries = txRows.filter(r => r.type === 'entrada').reduce((a, r) => a + r.amountCents, 0)
  const totalExits = txRows.filter(r => r.type === 'saida').reduce((a, r) => a + r.amountCents, 0)
  const availableBalanceCents = Math.max(0, totalEntries - totalExits)

  const pendingPayouts = payouts.filter(p => ['solicitado', 'requested', 'under_review', 'approved', 'scheduled', 'processing'].includes(p.status))
  const pendingPayoutsCents = pendingPayouts.reduce((a, p) => a + p.amountCents, 0)
  const blockedBalanceCents = pendingPayoutsCents

  const openReceivables = obligations.filter(o => o.status !== 'pago')
  const futureBalanceCents = openReceivables.reduce((a, o) => a + o.amountCents, 0)

  const activeSplits = splits.filter(s => s.status === 'active')
  const contractedAdvancesCents = advances.filter(a => a.status === 'contracted' || a.status === 'settled').reduce((a, x) => a + x.netAmountCents, 0)

  const pendingSettlements = settlements.filter(s => s.status === 'expected' || s.status === 'pending')
  const expectedSettlementCents = pendingSettlements.reduce((a, s) => a + s.expectedCents, 0)
  const reconciledSettlementCents = settlements.filter(s => s.status === 'reconciled').reduce((a, s) => a + s.receivedCents, 0)

  res.json({
    availableBalanceCents,
    blockedBalanceCents,
    futureBalanceCents,
    totalSplits: splits.length,
    activeSplitsCount: activeSplits.length,
    payoutsCount: payouts.length,
    pendingPayoutsCount: pendingPayouts.length,
    pendingPayoutsCents,
    advancesCount: advances.length,
    contractedAdvancesCents,
    settlementsCount: settlements.length,
    expectedSettlementCents,
    reconciledSettlementCents
  })
})

// 2. Split Financeiro & Beneficiários
financeSettlementRouter.get('/splits', async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined
  res.json(await prisma.financeSplitRule.findMany({
    where: {
      ...(producerId ? { producerId } : {}),
      ...(eventId ? { eventId } : {})
    },
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }]
  }))
})

financeSettlementRouter.post('/splits', async (req: AuthRequest, res) => {
  const p = z.object({
    title: z.string().min(2),
    recipientName: z.string().min(2),
    recipientDocument: z.string().optional(),
    recipientAccount: z.string().optional(),
    splitType: z.enum(['percentage', 'fixed']).default('percentage'),
    splitValueBps: z.number().int().min(0).max(10000).default(0),
    fixedCents: z.number().int().min(0).default(0),
    feeDeductionMode: z.enum(['gross', 'net']).default('net'),
    priority: z.number().int().min(1).default(1),
    status: z.enum(['draft', 'active', 'inactive', 'expired']).default('active'),
    eventId: z.number().int().positive().optional(),
    producerId: z.number().int().positive().optional(),
    notes: z.string().optional()
  }).parse(req.body)

  const producerId = writeProducerId(req, p.producerId)
  if (!producerId) return res.status(400).json({ message: 'Produtora obrigatória.' })

  const code = `SPLIT-${Date.now()}`
  const row = await prisma.financeSplitRule.create({
    data: {
      ...p,
      code,
      producerId
    } as any
  })
  await audit(req, req.auth!.id, producerId, 'create', 'finance-split-rule', String(row.id), { title: p.title, recipientName: p.recipientName, splitType: p.splitType })
  res.status(201).json(row)
})

financeSettlementRouter.patch('/splits/:id', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.financeSplitRule.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Regra de split não encontrada.' })

  const p = z.object({
    title: z.string().min(2).optional(),
    recipientName: z.string().min(2).optional(),
    recipientDocument: z.string().nullable().optional(),
    recipientAccount: z.string().nullable().optional(),
    splitType: z.enum(['percentage', 'fixed']).optional(),
    splitValueBps: z.number().int().min(0).max(10000).optional(),
    fixedCents: z.number().int().min(0).optional(),
    feeDeductionMode: z.enum(['gross', 'net']).optional(),
    priority: z.number().int().min(1).optional(),
    status: z.enum(['draft', 'active', 'inactive', 'expired']).optional(),
    notes: z.string().nullable().optional()
  }).parse(req.body)

  const row = await prisma.financeSplitRule.update({ where: { id }, data: p })
  await audit(req, req.auth!.id, current.producerId, 'update', 'finance-split-rule', String(id), p)
  res.json(row)
})

financeSettlementRouter.post('/splits/:id/simulate', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const rule = await prisma.financeSplitRule.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!rule) return res.status(404).json({ message: 'Regra de split não encontrada.' })

  const { grossAmountCents = 10000, feeBps = 1000 } = req.body
  const platformFeeCents = Math.round((grossAmountCents * feeBps) / 10000)
  const netAmountCents = grossAmountCents - platformFeeCents

  const baseCents = rule.feeDeductionMode === 'gross' ? grossAmountCents : netAmountCents
  let recipientShareCents = 0
  if (rule.splitType === 'percentage') {
    recipientShareCents = Math.round((baseCents * rule.splitValueBps) / 10000)
  } else {
    recipientShareCents = Math.min(baseCents, rule.fixedCents)
  }
  const producerRemainingCents = Math.max(0, netAmountCents - recipientShareCents)

  res.json({
    rule: { id: rule.id, code: rule.code, title: rule.title, recipientName: rule.recipientName, splitType: rule.splitType, splitValueBps: rule.splitValueBps, fixedCents: rule.fixedCents },
    grossAmountCents,
    platformFeeCents,
    netAmountCents,
    recipientShareCents,
    producerRemainingCents,
    feeDeductionMode: rule.feeDeductionMode
  })
})

// 3. Central de Repasses
financeSettlementRouter.get('/payouts', async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  res.json(await prisma.payout.findMany({
    where: producerId ? { producerId } : undefined,
    include: { producer: { select: { name: true } } },
    orderBy: { requestedAt: 'desc' }
  }))
})

financeSettlementRouter.post('/payouts', async (req: AuthRequest, res) => {
  const p = z.object({
    amountCents: z.number().int().positive(),
    bankAccount: z.string().min(3).optional(),
    notes: z.string().optional(),
    producerId: z.number().int().positive().optional()
  }).parse(req.body)

  const producerId = writeProducerId(req, p.producerId)
  if (!producerId) return res.status(400).json({ message: 'Produtora obrigatória.' })

  const balanceRows = await prisma.financialTransaction.findMany({
    where: { producerId, status: 'liquidado' },
    select: { type: true, amountCents: true }
  })
  const availableBalance = balanceRows.reduce((a, r) => a + (r.type === 'entrada' ? r.amountCents : -r.amountCents), 0)

  if (p.amountCents > availableBalance) {
    return res.status(400).json({ message: `Saldo disponível insuficiente (R$ ${(availableBalance / 100).toFixed(2)}).` })
  }

  const code = `REP-${Date.now()}`
  const payout = await prisma.$transaction(async tx => {
    const created = await tx.payout.create({
      data: {
        code,
        amountCents: p.amountCents,
        bankAccount: p.bankAccount,
        notes: p.notes,
        status: 'solicitado',
        producerId
      }
    })
    await tx.financialTransaction.create({
      data: {
        code: `FIN-${code}`,
        type: 'saida',
        category: 'repasse',
        description: `Solicitação de repasse ${code}`,
        amountCents: p.amountCents,
        status: 'pendente',
        producerId,
        payoutId: created.id
      }
    })
    return created
  })

  await audit(req, req.auth!.id, producerId, 'create', 'payout', String(payout.id), { code, amountCents: p.amountCents })
  res.status(201).json(payout)
})

financeSettlementRouter.patch('/payouts/:id/approve', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.payout.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Repasse não encontrado.' })
  if (!['solicitado', 'requested', 'under_review'].includes(current.status)) {
    return res.status(409).json({ message: 'Somente repasses pendentes podem ser aprovados.' })
  }

  const row = await prisma.payout.update({ where: { id }, data: { status: 'approved' } })
  await audit(req, req.auth!.id, current.producerId, 'approve', 'payout', String(id), { amountCents: row.amountCents })
  res.json(row)
})

financeSettlementRouter.patch('/payouts/:id/schedule', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.payout.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Repasse não encontrado.' })

  const row = await prisma.payout.update({ where: { id }, data: { status: 'scheduled' } })
  await audit(req, req.auth!.id, current.producerId, 'schedule', 'payout', String(id), { scheduled: true })
  res.json(row)
})

financeSettlementRouter.patch('/payouts/:id/pay', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.payout.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Repasse não encontrado.' })

  const row = await prisma.$transaction(async tx => {
    const updated = await tx.payout.update({
      where: { id },
      data: { status: 'paid', paidAt: new Date() }
    })
    await tx.financialTransaction.updateMany({
      where: { payoutId: id },
      data: { status: 'liquidado' }
    })
    return updated
  })

  await audit(req, req.auth!.id, current.producerId, 'pay', 'payout', String(id), { amountCents: row.amountCents, paidAt: row.paidAt })
  res.json(row)
})

financeSettlementRouter.patch('/payouts/:id/cancel', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.payout.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Repasse não encontrado.' })
  if (current.status === 'paid') return res.status(409).json({ message: 'Repasses já pagos não podem ser cancelados.' })

  const row = await prisma.$transaction(async tx => {
    const updated = await tx.payout.update({
      where: { id },
      data: { status: 'cancelled' }
    })
    await tx.financialTransaction.updateMany({
      where: { payoutId: id },
      data: { status: 'cancelado' }
    })
    return updated
  })

  await audit(req, req.auth!.id, current.producerId, 'cancel', 'payout', String(id), { amountCents: row.amountCents })
  res.json(row)
})

// 4. Antecipações
financeSettlementRouter.get('/advances', async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined
  res.json(await prisma.financeAdvance.findMany({
    where: {
      ...(producerId ? { producerId } : {}),
      ...(eventId ? { eventId } : {})
    },
    orderBy: { createdAt: 'desc' }
  }))
})

financeSettlementRouter.post('/advances/simulate', async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined
  const tenantScope = producerId ? { producerId } : {}
  const eventScope = { ...tenantScope, ...(eventId ? { eventId } : {}) }

  const obligations = await prisma.financialObligation.findMany({
    where: { ...eventScope, kind: 'receber', status: { not: 'pago' } }
  })

  const totalEligibleCents = obligations.reduce((a, o) => a + o.amountCents, 0)
  const feeBps = 250 // 2.5% padrão de antecipação
  const feeCents = Math.round((totalEligibleCents * feeBps) / 10000)
  const netAmountCents = totalEligibleCents - feeCents

  res.json({
    eligibleReceivablesCount: obligations.length,
    totalEligibleCents,
    feeBps,
    feeCents,
    netAmountCents
  })
})

financeSettlementRouter.post('/advances', async (req: AuthRequest, res) => {
  const p = z.object({
    requestedAmountCents: z.number().int().positive(),
    feeBps: z.number().int().min(0).default(250),
    bankAccount: z.string().optional(),
    notes: z.string().optional(),
    eventId: z.number().int().positive().optional(),
    producerId: z.number().int().positive().optional()
  }).parse(req.body)

  const producerId = writeProducerId(req, p.producerId)
  if (!producerId) return res.status(400).json({ message: 'Produtora obrigatória.' })

  const feeCents = Math.round((p.requestedAmountCents * p.feeBps) / 10000)
  const netAmountCents = p.requestedAmountCents - feeCents
  const code = `ANT-${Date.now()}`

  const row = await prisma.financeAdvance.create({
    data: {
      code,
      requestedAmountCents: p.requestedAmountCents,
      feeBps: p.feeBps,
      feeCents,
      netAmountCents,
      bankAccount: p.bankAccount,
      notes: p.notes,
      status: 'requested',
      producerId,
      eventId: p.eventId
    }
  })

  await audit(req, req.auth!.id, producerId, 'create', 'finance-advance', String(row.id), { code, requestedAmountCents: p.requestedAmountCents, netAmountCents })
  res.status(201).json(row)
})

financeSettlementRouter.patch('/advances/:id/approve', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.financeAdvance.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Antecipação não encontrada.' })

  const row = await prisma.financeAdvance.update({
    where: { id },
    data: { status: 'approved', approvedBy: String(req.auth!.id) }
  })
  await audit(req, req.auth!.id, current.producerId, 'approve', 'finance-advance', String(id), { netAmountCents: row.netAmountCents })
  res.json(row)
})

financeSettlementRouter.patch('/advances/:id/contract', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.financeAdvance.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Antecipação não encontrada.' })
  if (current.status !== 'approved' && current.status !== 'requested') {
    return res.status(409).json({ message: 'A antecipação precisa estar aprovada para ser contratada.' })
  }

  const row = await prisma.$transaction(async tx => {
    const updated = await tx.financeAdvance.update({
      where: { id },
      data: { status: 'contracted', contractedAt: new Date() }
    })
    await tx.financialTransaction.create({
      data: {
        code: `FIN-${current.code}`,
        type: 'entrada',
        category: 'antecipacao',
        description: `Contratação de antecipação ${current.code}`,
        amountCents: current.netAmountCents,
        status: 'liquidado',
        producerId: current.producerId,
        eventId: current.eventId
      }
    })
    return updated
  })

  await audit(req, req.auth!.id, current.producerId, 'contract', 'finance-advance', String(id), { contractedAt: row.contractedAt, netAmountCents: row.netAmountCents })
  res.json(row)
})

// 5. Liquidações
financeSettlementRouter.get('/settlements', async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined
  res.json(await prisma.financeSettlement.findMany({
    where: {
      ...(producerId ? { producerId } : {}),
      ...(eventId ? { eventId } : {})
    },
    orderBy: { expectedDate: 'desc' }
  }))
})

financeSettlementRouter.post('/settlements', async (req: AuthRequest, res) => {
  const p = z.object({
    gatewayName: z.string().min(2),
    acquirerName: z.string().optional(),
    batchRef: z.string().optional(),
    expectedCents: z.number().int().positive(),
    receivedCents: z.number().int().min(0).default(0),
    feeCents: z.number().int().min(0).default(0),
    expectedDate: z.string().transform(v => new Date(v)),
    status: z.enum(['pending', 'expected', 'received', 'reconciled', 'divergent', 'cancelled']).default('expected'),
    eventId: z.number().int().positive().optional(),
    producerId: z.number().int().positive().optional()
  }).parse(req.body)

  const producerId = writeProducerId(req, p.producerId)
  if (!producerId) return res.status(400).json({ message: 'Produtora obrigatória.' })

  const differenceCents = p.receivedCents ? p.expectedCents - p.receivedCents : 0
  const code = `SET-${Date.now()}`

  const row = await prisma.financeSettlement.create({
    data: {
      ...p,
      code,
      differenceCents,
      producerId
    } as any
  })

  await audit(req, req.auth!.id, producerId, 'create', 'finance-settlement', String(row.id), { code, expectedCents: p.expectedCents, gatewayName: p.gatewayName })
  res.status(201).json(row)
})

financeSettlementRouter.patch('/settlements/:id/reconcile', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.financeSettlement.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Liquidação não encontrada.' })

  const { receivedCents, feeCents = 0 } = req.body
  const finalReceived = receivedCents !== undefined ? Number(receivedCents) : current.expectedCents
  const differenceCents = current.expectedCents - finalReceived
  const status = differenceCents === 0 ? 'reconciled' : 'divergent'

  const row = await prisma.$transaction(async tx => {
    const updated = await tx.financeSettlement.update({
      where: { id },
      data: {
        receivedCents: finalReceived,
        feeCents,
        differenceCents,
        status,
        settledDate: new Date(),
        reconciliationRef: `REC-${current.code}`
      }
    })
    await tx.financialTransaction.create({
      data: {
        code: `FIN-${current.code}`,
        type: 'entrada',
        category: 'liquidacao',
        description: `Liquidação ${current.code} (${current.gatewayName})`,
        amountCents: finalReceived,
        status: 'liquidado',
        producerId: current.producerId,
        eventId: current.eventId
      }
    })
    return updated
  })

  await audit(req, req.auth!.id, current.producerId, 'reconcile', 'finance-settlement', String(id), { status, differenceCents, receivedCents: finalReceived })
  res.json(row)
})
