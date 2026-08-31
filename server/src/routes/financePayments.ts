import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { audit } from '../audit.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { requestedProducerId, writeProducerId } from '../tenant.js'

export const financePaymentsRouter = Router()
financePaymentsRouter.use(requireAuth)

const scope = (req: AuthRequest) => {
  const producerId = requestedProducerId(req)
  return producerId ? { producerId } : undefined
}

financePaymentsRouter.get('/summary', async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  const where = producerId ? { producerId } : undefined
  const [gateways, acquirers, methods, refunds] = await Promise.all([
    prisma.paymentGatewayConfig.findMany({ where }),
    prisma.cardAcquirer.findMany({ where }),
    prisma.paymentMethodRule.findMany({ where }),
    prisma.refundRequest.findMany({ where })
  ])
  res.json({
    gateways: gateways.length,
    activeGateways: gateways.filter(x => x.status === 'ativo').length,
    acquirers: acquirers.length,
    activeAcquirers: acquirers.filter(x => x.status === 'ativo').length,
    methods: methods.length,
    pendingRefunds: refunds.filter(x => ['solicitado', 'aprovado', 'aguardando_gateway'].includes(x.status)).length,
    refundedCents: refunds.filter(x => x.status === 'estornado').reduce((a, x) => a + x.amountCents, 0)
  })
})

financePaymentsRouter.get('/gateways', async (req: AuthRequest, res) => {
  res.json(await prisma.paymentGatewayConfig.findMany({ where: scope(req), orderBy: [{ isPrimary: 'desc' }, { name: 'asc' }] }))
})

financePaymentsRouter.post('/gateways', async (req: AuthRequest, res) => {
  const p = z.object({
    name: z.string().min(2),
    provider: z.string().min(2),
    environment: z.enum(['sandbox', 'producao']).default('sandbox'),
    status: z.string().default('inativo'),
    isPrimary: z.boolean().default(false),
    webhookUrl: z.string().optional(),
    publicKeyMasked: z.string().optional(),
    credentialsConfigured: z.boolean().default(false),
    producerId: z.number().int().positive().optional()
  }).parse(req.body)

  const producerId = writeProducerId(req, p.producerId)
  if (!producerId) return res.status(400).json({ message: 'Produtora obrigatória.' })

  if (p.isPrimary) {
    await prisma.paymentGatewayConfig.updateMany({ where: { producerId }, data: { isPrimary: false } })
  }

  const row = await prisma.paymentGatewayConfig.create({ data: { ...p, producerId } })
  await audit(req, req.auth!.id, producerId, 'create', 'payment-gateway', String(row.id), { provider: p.provider, environment: p.environment })
  res.status(201).json(row)
})

financePaymentsRouter.patch('/gateways/:id', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.paymentGatewayConfig.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Gateway não encontrado.' })

  const p = z.object({
    name: z.string().min(2).optional(),
    environment: z.enum(['sandbox', 'producao']).optional(),
    status: z.string().optional(),
    isPrimary: z.boolean().optional(),
    webhookUrl: z.string().nullable().optional(),
    publicKeyMasked: z.string().nullable().optional(),
    credentialsConfigured: z.boolean().optional()
  }).parse(req.body)

  if (p.isPrimary) {
    await prisma.paymentGatewayConfig.updateMany({ where: { producerId: current.producerId, id: { not: id } }, data: { isPrimary: false } })
  }

  const row = await prisma.paymentGatewayConfig.update({ where: { id }, data: p })
  await audit(req, req.auth!.id, current.producerId, 'update', 'payment-gateway', String(id), p)
  res.json(row)
})

financePaymentsRouter.post('/gateways/:id/validate', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const row = await prisma.paymentGatewayConfig.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!row) return res.status(404).json({ message: 'Gateway não encontrado.' })

  const checks = { credentialsConfigured: row.credentialsConfigured, webhookConfigured: !row.webhookUrl, environment: row.environment }
  await prisma.paymentGatewayConfig.update({
    where: { id },
    data: {
      lastValidationAt: new Date(),
      lastValidationStatus: checks.credentialsConfigured ? 'configuracao_ok' : 'credenciais_pendentes'
    }
  })
  await audit(req, req.auth!.id, row.producerId, 'validate', 'payment-gateway', String(id), checks)
  res.json({
    ok: checks.credentialsConfigured,
    status: checks.credentialsConfigured ? 'configuracao_ok' : 'credenciais_pendentes',
    checks,
    message: checks.credentialsConfigured ? 'Configuração interna válida. Teste externo depende das credenciais/provedor.' : 'Credenciais ainda não configuradas.'
  })
})

financePaymentsRouter.get('/acquirers', async (req: AuthRequest, res) => {
  res.json(await prisma.cardAcquirer.findMany({ where: scope(req), orderBy: { name: 'asc' } }))
})

financePaymentsRouter.post('/acquirers', async (req: AuthRequest, res) => {
  const p = z.object({
    name: z.string().min(2),
    code: z.string().min(2),
    status: z.string().default('ativo'),
    creditCashMdrBps: z.number().int().min(0).default(0),
    creditInstallmentMdrBps: z.number().int().min(0).default(0),
    debitMdrBps: z.number().int().min(0).default(0),
    pixFeeBps: z.number().int().min(0).default(0),
    settlementDays: z.number().int().min(0).default(30),
    anticipationBps: z.number().int().min(0).default(0),
    approvalRateBps: z.number().int().min(0).max(10000).default(0),
    producerId: z.number().int().positive().optional()
  }).parse(req.body)

  const producerId = writeProducerId(req, p.producerId)
  if (!producerId) return res.status(400).json({ message: 'Produtora obrigatória.' })

  const row = await prisma.cardAcquirer.create({ data: { ...p, producerId } })
  await audit(req, req.auth!.id, producerId, 'create', 'card-acquirer', String(row.id), p)
  res.status(201).json(row)
})

financePaymentsRouter.patch('/acquirers/:id', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.cardAcquirer.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Operadora não encontrada.' })

  const p = z.object({
    status: z.string().optional(),
    creditCashMdrBps: z.number().int().min(0).optional(),
    creditInstallmentMdrBps: z.number().int().min(0).optional(),
    debitMdrBps: z.number().int().min(0).optional(),
    pixFeeBps: z.number().int().min(0).optional(),
    settlementDays: z.number().int().min(0).optional(),
    anticipationBps: z.number().int().min(0).optional(),
    approvalRateBps: z.number().int().min(0).max(10000).optional()
  }).parse(req.body)

  const row = await prisma.cardAcquirer.update({ where: { id }, data: p })
  await audit(req, req.auth!.id, current.producerId, 'update', 'card-acquirer', String(id), p)
  res.json(row)
})

financePaymentsRouter.get('/methods', async (req: AuthRequest, res) => {
  res.json(await prisma.paymentMethodRule.findMany({ where: scope(req), orderBy: { method: 'asc' } }))
})

financePaymentsRouter.post('/methods', async (req: AuthRequest, res) => {
  const p = z.object({
    method: z.string().min(2),
    label: z.string().min(2),
    status: z.string().default('ativo'),
    minInstallments: z.number().int().min(1).default(1),
    maxInstallments: z.number().int().min(1).default(1),
    customerInterestBps: z.number().int().min(0).default(0),
    producerInterestBps: z.number().int().min(0).default(0),
    minimumCents: z.number().int().min(0).default(0),
    gatewayId: z.number().int().positive().optional(),
    acquirerId: z.number().int().positive().optional(),
    producerId: z.number().int().positive().optional()
  }).parse(req.body)

  const producerId = writeProducerId(req, p.producerId)
  if (!producerId) return res.status(400).json({ message: 'Produtora obrigatória.' })

  const row = await prisma.paymentMethodRule.create({ data: { ...p, producerId } })
  await audit(req, req.auth!.id, producerId, 'create', 'payment-method-rule', String(row.id), p)
  res.status(201).json(row)
})

financePaymentsRouter.patch('/methods/:id', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.paymentMethodRule.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Método não encontrado.' })

  const p = z.object({
    status: z.string().optional(),
    maxInstallments: z.number().int().min(1).optional(),
    customerInterestBps: z.number().int().min(0).optional(),
    producerInterestBps: z.number().int().min(0).optional(),
    minimumCents: z.number().int().min(0).optional(),
    gatewayId: z.number().int().positive().nullable().optional(),
    acquirerId: z.number().int().positive().nullable().optional()
  }).parse(req.body)

  const row = await prisma.paymentMethodRule.update({ where: { id }, data: p })
  await audit(req, req.auth!.id, current.producerId, 'update', 'payment-method-rule', String(id), p)
  res.json(row)
})

financePaymentsRouter.get('/refunds', async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  const status = typeof req.query.status === 'string' ? req.query.status : undefined
  res.json(await prisma.refundRequest.findMany({
    where: {
      ...(producerId ? { producerId } : {}),
      ...(status ? { status } : {})
    },
    orderBy: { createdAt: 'desc' },
    take: 300
  }))
})

financePaymentsRouter.post('/refunds', async (req: AuthRequest, res) => {
  const p = z.object({
    orderCode: z.string().min(2),
    transactionRef: z.string().optional(),
    eventId: z.number().int().positive().optional(),
    amountCents: z.number().int().positive(),
    kind: z.enum(['total', 'parcial']).default('total'),
    method: z.string().min(2),
    reason: z.string().min(3),
    gatewayId: z.number().int().positive().optional(),
    acquirerId: z.number().int().positive().optional(),
    producerId: z.number().int().positive().optional()
  }).parse(req.body)

  const producerId = writeProducerId(req, p.producerId)
  if (!producerId) return res.status(400).json({ message: 'Produtora obrigatória.' })

  const row = await prisma.refundRequest.create({
    data: {
      ...p,
      producerId,
      code: `EST-${Date.now()}`,
      requestedBy: String(req.auth!.id)
    }
  })
  await audit(req, req.auth!.id, producerId, 'create', 'refund-request', String(row.id), p)
  res.status(201).json(row)
})

financePaymentsRouter.patch('/refunds/:id/approve', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.refundRequest.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Estorno não encontrado.' })
  if (current.status !== 'solicitado') return res.status(409).json({ message: 'Somente solicitações pendentes podem ser aprovadas.' })

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

financePaymentsRouter.patch('/refunds/:id/send-to-gateway', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const producerId = requestedProducerId(req)
  const current = await prisma.refundRequest.findFirst({ where: { id, ...(producerId ? { producerId } : {}) } })
  if (!current) return res.status(404).json({ message: 'Estorno não encontrado.' })
  if (current.status !== 'aprovado') return res.status(409).json({ message: 'Aprovação obrigatória antes de enviar ao gateway.' })

  const row = await prisma.refundRequest.update({
    where: { id },
    data: {
      status: 'aguardando_gateway',
      sentToGatewayAt: new Date()
    }
  })
  await audit(req, req.auth!.id, current.producerId, 'send', 'refund-request', String(id), { gatewayId: row.gatewayId })
  res.json({
    ...row,
    message: 'Solicitação preparada para integração com o gateway configurado. O retorno real deve ser atualizado pelo conector/webhook do provedor.'
  })
})

// ===== Fase 20.2 — Spread, Recebíveis, Conciliação e Inteligência =====
financePaymentsRouter.post('/spread/simulate', async (req: AuthRequest, res) => {
  const p = z.object({
    grossCents: z.number().int().positive(),
    paymentMethod: z.enum(['credito', 'debito', 'pix']),
    installments: z.number().int().min(1).max(24).default(1),
    serviceFeeBps: z.number().int().min(0).default(1000),
    gatewayCostCents: z.number().int().min(0).default(0),
    acquirerId: z.number().int().positive(),
    gatewayId: z.number().int().positive().optional(),
    eventId: z.number().int().positive().optional(),
    producerId: z.number().int().positive().optional(),
    save: z.boolean().default(false)
  }).parse(req.body)

  const producerId = writeProducerId(req, p.producerId)
  if (!producerId) return res.status(400).json({ message: 'Produtora obrigatória.' })

  const acquirer = await prisma.cardAcquirer.findFirst({ where: { id: p.acquirerId, producerId } })
  if (!acquirer) return res.status(404).json({ message: 'Operadora não encontrada.' })

  let mdrBps = p.paymentMethod === 'pix'
    ? acquirer.pixFeeBps
    : p.paymentMethod === 'debito'
      ? acquirer.debitMdrBps
      : (p.installments > 1 ? acquirer.creditInstallmentMdrBps : acquirer.creditCashMdrBps)

  const mdrCostCents = Math.round(p.grossCents * mdrBps / 10000)
  const anticipationBps = p.paymentMethod === 'credito' ? acquirer.anticipationBps : 0
  const anticipationCents = Math.round(p.grossCents * anticipationBps / 10000)
  const serviceRevenueCents = Math.round(p.grossCents * p.serviceFeeBps / 10000)
  const totalCostCents = mdrCostCents + anticipationCents + p.gatewayCostCents
  const netMarginCents = serviceRevenueCents - totalCostCents

  const result = {
    grossCents: p.grossCents,
    paymentMethod: p.paymentMethod,
    installments: p.installments,
    serviceFeeBps: p.serviceFeeBps,
    mdrBps,
    anticipationBps,
    gatewayCostCents: p.gatewayCostCents,
    mdrCostCents,
    anticipationCents,
    serviceRevenueCents,
    totalCostCents,
    netMarginCents,
    marginBps: Math.round(netMarginCents * 10000 / p.grossCents),
    settlementDays: acquirer.settlementDays,
    acquirer: { id: acquirer.id, name: acquirer.name }
  }

  if (p.save) {
    const row = await prisma.financeSpreadSimulation.create({
      data: {
        grossCents: p.grossCents,
        paymentMethod: p.paymentMethod,
        installments: p.installments,
        serviceFeeBps: p.serviceFeeBps,
        mdrBps,
        anticipationBps,
        gatewayCostCents: p.gatewayCostCents,
        mdrCostCents,
        anticipationCents,
        serviceRevenueCents,
        netMarginCents,
        producerId,
        eventId: p.eventId,
        acquirerId: p.acquirerId,
        gatewayId: p.gatewayId,
        createdBy: String(req.auth!.id)
      }
    })
    await audit(req, req.auth!.id, producerId, 'create', 'spread-simulation', String(row.id), result)
    return res.status(201).json({ ...result, id: row.id, saved: true })
  }

  res.json({ ...result, saved: false })
})

// ===== Fase 20.2.1 — Spread & Rentabilidade Final =====
financePaymentsRouter.post('/spread/compare', async (req: AuthRequest, res) => {
  const p = z.object({
    grossCents: z.number().int().positive(),
    paymentMethod: z.enum(['credito', 'debito', 'pix']),
    installments: z.number().int().min(1).max(24).default(1),
    serviceFeeBps: z.number().int().min(0).default(1000),
    gatewayCostCents: z.number().int().min(0).default(0),
    eventId: z.number().int().positive().optional(),
    producerId: z.number().int().positive().optional()
  }).parse(req.body)

  const producerId = writeProducerId(req, p.producerId)
  if (!producerId) return res.status(400).json({ message: 'Produtora obrigatória.' })

  const acquirers = await prisma.cardAcquirer.findMany({ where: { producerId, status: 'ativo' } })
  const rows = acquirers.map(acquirer => {
    const mdrBps = p.paymentMethod === 'pix'
      ? acquirer.pixFeeBps
      : p.paymentMethod === 'debito'
        ? acquirer.debitMdrBps
        : (p.installments > 1 ? acquirer.creditInstallmentMdrBps : acquirer.creditCashMdrBps)

    const mdrCostCents = Math.round(p.grossCents * mdrBps / 10000)
    const anticipationBps = p.paymentMethod === 'credito' ? acquirer.anticipationBps : 0
    const anticipationCents = Math.round(p.grossCents * anticipationBps / 10000)
    const serviceRevenueCents = Math.round(p.grossCents * p.serviceFeeBps / 10000)
    const totalCostCents = mdrCostCents + anticipationCents + p.gatewayCostCents
    const netMarginCents = serviceRevenueCents - totalCostCents

    return {
      saved: false,
      grossCents: p.grossCents,
      paymentMethod: p.paymentMethod,
      installments: p.installments,
      serviceFeeBps: p.serviceFeeBps,
      mdrBps,
      anticipationBps,
      gatewayCostCents: p.gatewayCostCents,
      mdrCostCents,
      anticipationCents,
      serviceRevenueCents,
      totalCostCents,
      netMarginCents,
      marginBps: Math.round(netMarginCents * 10000 / p.grossCents),
      settlementDays: acquirer.settlementDays,
      acquirer: { id: acquirer.id, name: acquirer.name }
    }
  }).sort((a, b) => b.netMarginCents - a.netMarginCents)

  res.json(rows)
})

financePaymentsRouter.get('/spread/dashboard', async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined
  const scope: any = { ...(producerId ? { producerId } : {}), ...(eventId ? { eventId } : {}) }

  const [simulations, acquirers] = await Promise.all([
    prisma.financeSpreadSimulation.findMany({ where: scope, orderBy: { createdAt: 'desc' }, take: 1000 }),
    prisma.cardAcquirer.findMany({ where: producerId ? { producerId } : undefined })
  ])

  const volumeCents = simulations.reduce((a, x) => a + x.grossCents, 0)
  const serviceRevenueCents = simulations.reduce((a, x) => a + x.serviceRevenueCents, 0)
  const totalCostCents = simulations.reduce((a, x) => a + x.mdrCostCents + x.anticipationCents + x.gatewayCostCents, 0)
  const netMarginCents = simulations.reduce((a, x) => a + x.netMarginCents, 0)
  const avgMarginBps = volumeCents ? Math.round(netMarginCents * 10000 / volumeCents) : 0
  const avgServiceFeeBps = volumeCents ? Math.round(serviceRevenueCents * 10000 / volumeCents) : 0

  const names = new Map(acquirers.map(a => [a.id, a.name]))
  const groups = new Map<number, typeof simulations>()
  for (const row of simulations) {
    if (!row.acquirerId) continue
    const list = groups.get(row.acquirerId) || []
    list.push(row)
    groups.set(row.acquirerId, list)
  }

  const byAcquirer = [...groups.entries()].map(([acquirerId, rows]) => {
    const volume = rows.reduce((a, x) => a + x.grossCents, 0)
    const revenue = rows.reduce((a, x) => a + x.serviceRevenueCents, 0)
    const margin = rows.reduce((a, x) => a + x.netMarginCents, 0)
    const costs = revenue - margin
    return {
      acquirerId,
      name: names.get(acquirerId) || `#${acquirerId}`,
      simulations: rows.length,
      volumeCents: volume,
      totalCostCents: costs,
      netMarginCents: margin,
      marginBps: volume ? Math.round(margin * 10000 / volume) : 0
    }
  }).sort((a, b) => b.netMarginCents - a.netMarginCents)

  res.json({
    simulations: simulations.length,
    volumeCents,
    serviceRevenueCents,
    totalCostCents,
    netMarginCents,
    avgMarginBps,
    avgServiceFeeBps,
    byAcquirer
  })
})

financePaymentsRouter.get('/spread/history', async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined
  res.json(await prisma.financeSpreadSimulation.findMany({
    where: {
      ...(producerId ? { producerId } : {}),
      ...(eventId ? { eventId } : {})
    },
    orderBy: { createdAt: 'desc' },
    take: 300
  }))
})


financePaymentsRouter.get('/operations/summary', async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined
  const scope: any = { ...(producerId ? { producerId } : {}), ...(eventId ? { eventId } : {}) }

  const [receivables, reconciliations, refunds, acquirers, simulations] = await Promise.all([
    prisma.financialObligation.findMany({ where: { ...scope, kind: 'receber' } }),
    prisma.reconciliationItem.findMany({ where: scope }),
    prisma.refundRequest.findMany({ where: { ...(producerId ? { producerId } : {}), ...(eventId ? { eventId } : {}) } }),
    prisma.cardAcquirer.findMany({ where: producerId ? { producerId } : undefined }),
    prisma.financeSpreadSimulation.findMany({ where: scope, orderBy: { createdAt: 'desc' }, take: 50 })
  ])

  const openReceivables = receivables.filter(x => x.status !== 'pago')
  const dueCents = openReceivables.reduce((a, x) => a + x.amountCents, 0)
  const reconciledCents = reconciliations.filter(x => ['conciliado', 'conciliado-manual'].includes(x.status)).reduce((a, x) => a + x.receivedCents, 0)
  const divergenceCents = reconciliations.filter(x => x.status === 'divergente').reduce((a, x) => a + Math.abs(x.differenceCents), 0)
  const pendingRefundCents = refunds.filter(x => ['solicitado', 'aprovado', 'aguardando_gateway'].includes(x.status)).reduce((a, x) => a + x.amountCents, 0)
  const avgMarginBps = simulations.length
    ? Math.round(simulations.reduce((a, x) => a + (x.grossCents ? x.netMarginCents * 10000 / x.grossCents : 0), 0) / simulations.length)
    : 0

  const ranked = acquirers.map(x => ({
    id: x.id,
    name: x.name,
    status: x.status,
    approvalRateBps: x.approvalRateBps,
    settlementDays: x.settlementDays,
    creditCashMdrBps: x.creditCashMdrBps,
    creditInstallmentMdrBps: x.creditInstallmentMdrBps
  })).sort((a, b) => (b.approvalRateBps - a.approvalRateBps) || (a.creditCashMdrBps - b.creditCashMdrBps))

  const insights = [] as Array<{ level: string; title: string; message: string }>
  if (divergenceCents > 0) insights.push({ level: 'critical', title: 'Divergências de conciliação', message: `Há R$ ${(divergenceCents / 100).toFixed(2)} em diferenças que precisam de tratamento.` })
  if (pendingRefundCents > 0) insights.push({ level: 'warning', title: 'Estornos em processamento', message: `R$ ${(pendingRefundCents / 100).toFixed(2)} aguardam conclusão do fluxo de devolução.` })
  if (ranked[0]) insights.push({ level: 'info', title: 'Melhor operadora configurada', message: `${ranked[0].name} lidera o ranking atual considerando aprovação e MDR cadastrado.` })
  if (!insights.length) insights.push({ level: 'success', title: 'Operação sem alertas críticos', message: 'Não foram encontradas divergências ou estornos pendentes no escopo selecionado.' })

  res.json({
    receivables: { open: openReceivables.length, dueCents },
    reconciliation: { items: reconciliations.length, reconciledCents, divergences: reconciliations.filter(x => x.status === 'divergente').length, divergenceCents },
    refunds: { pendingCents: pendingRefundCents },
    spread: { simulations: simulations.length, avgMarginBps },
    acquirers: ranked,
    insights
  })
})

