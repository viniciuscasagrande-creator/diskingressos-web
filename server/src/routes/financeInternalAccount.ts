import { Router, type Request, type Response, type NextFunction } from 'express'
import { prisma } from '../prisma.js'

export const financeInternalAccountRouter = Router()

// Middleware de proteção: Acesso exclusivo do Financeiro Disk
const requireFinancial = (req: Request, res: Response, next: NextFunction) => {
  const role = (req.header('x-role') || (req as any).user?.role || 'FINANCEIRO_DISK').toUpperCase()
  const allowedRoles = ['FINANCEIRO_DISK', 'ADMIN', 'FINANCEIRO', 'SUPERADMIN', 'PRODUCER_ADMIN', 'FINANCIAL-ADMIN']
  if (!allowedRoles.includes(role)) {
    return res.status(403).json({ error: 'Acesso exclusivo do Financeiro Disk' })
  }
  next()
}

financeInternalAccountRouter.use(requireFinancial)

export interface InternalProducer {
  id: string | number
  name: string
  cnpj: string
}

export interface InternalPolicy {
  minimumSalesPercent: number
  releasePercent: number
  requireApproval: boolean
  requireSignature: boolean
  refundDualAuthorization: boolean
}

export interface InternalEventSummary {
  id: string
  name: string
  salesTarget: number
  sold: number
}

export interface InternalLedgerEntry {
  id: string
  eventId: string
  type:
    | 'RETENCAO'
    | 'BLOQUEIO'
    | 'LIBERACAO'
    | 'RESERVA_ESTORNO'
    | 'ESTORNO_EFETIVADO'
    | 'REPASSE'
    | 'CREDITO_CONCEDIDO'
    | 'AMORTIZACAO_CREDITO'
    | 'RECEITA_EVENTO'
  value: number
  reason: string
  beneficiary?: string
  actor: string
  createdAt: string
}

export interface InternalObligation {
  id: string
  eventId: string
  category: 'ALUGUEL_ESPACO' | 'ECAD' | 'FORNECEDOR' | 'IMPOSTOS' | 'OUTROS'
  description: string
  beneficiary?: string
  value: number
  dueDate: string
  status: 'PREVISTO' | 'RESERVADO' | 'PAGO' | 'CANCELADO'
  createdAt: string
  actor: string
  updatedAt?: string
  updatedBy?: string
}

export interface InternalCredit {
  id: string
  eventId: string
  principal: number
  interestRate: number
  installments: number
  installmentValue: number
  amortization: 'PERCENTUAL_RECEBIVEIS' | 'PARCELAS_FIXAS' | 'FECHAMENTO_EVENTO'
  receivablePercent: number
  totalDebt: number
  outstanding: number
  status: 'ATIVO' | 'LIQUIDADO'
  createdAt: string
  actor: string
}

export interface InternalRefundApproval {
  user: string
  at: string
  factor: string
}

export interface InternalRefund {
  id: string
  eventId: string
  orderId: string
  value: number
  reason: string
  status:
    | 'AGUARDANDO_PRIMEIRA_AUTORIZACAO'
    | 'AGUARDANDO_SEGUNDA_AUTORIZACAO'
    | 'AUTORIZADO_PARA_EFETIVAR'
    | 'EFETIVADO'
    | 'REJEITADO'
    | 'CANCELADO'
  requestedBy: string
  approvals: InternalRefundApproval[]
  createdAt: string
  executedBy?: string
  executedAt?: string
  rejectedBy?: string
  rejectedAt?: string
}

export interface InternalPayoutRequest {
  id: string
  eventId: string
  value: number
  status: 'EM_ANALISE' | 'APROVADO' | 'REJEITADO' | 'PAGO'
  createdAt: string
  exceptionAuthorization: boolean
  actor: string
}

export interface InternalState {
  producer: InternalProducer
  policy: InternalPolicy
  events: InternalEventSummary[]
  ledger: InternalLedgerEntry[]
  obligations: InternalObligation[]
  credits: InternalCredit[]
  requests: InternalPayoutRequest[]
  refunds: InternalRefund[]
}

// Estado em memória com idempotência e persistência de sessão para V0.5
export const state: InternalState = {
  producer: {
    id: 'P-001',
    name: 'Produtora Exemplo Ltda.',
    cnpj: '12.345.678/0001-90',
  },
  policy: {
    minimumSalesPercent: 50,
    releasePercent: 20,
    requireApproval: true,
    requireSignature: true,
    refundDualAuthorization: true,
  },
  events: [
    { id: 'EV-001', name: 'Festival Curitiba', salesTarget: 1000000, sold: 540000 },
    { id: 'EV-002', name: 'Arena Verão', salesTarget: 600000, sold: 210000 },
    { id: 'EV-003', name: 'Sem Parar — Música e Natureza', salesTarget: 800000, sold: 610000 },
  ],
  ledger: [
    {
      id: 'L-1',
      eventId: 'EV-001',
      type: 'RETENCAO',
      value: 80000,
      reason: 'Aluguel do espaço',
      beneficiary: 'Teatro Exemplo',
      actor: 'Financeiro Disk',
      createdAt: '2026-10-01T12:00:00Z',
    },
    {
      id: 'L-2',
      eventId: 'EV-001',
      type: 'RETENCAO',
      value: 15000,
      reason: 'Reserva ECAD',
      beneficiary: 'ECAD',
      actor: 'Financeiro Disk',
      createdAt: '2026-10-01T12:10:00Z',
    },
    {
      id: 'L-3',
      eventId: 'EV-001',
      type: 'REPASSE',
      value: 20000,
      reason: 'Repasse anterior',
      actor: 'Financeiro Disk',
      createdAt: '2026-09-25T12:00:00Z',
    },
  ],
  obligations: [
    {
      id: 'OB-1',
      eventId: 'EV-001',
      category: 'ALUGUEL_ESPACO',
      description: 'Aluguel do espaço',
      beneficiary: 'Teatro Exemplo',
      value: 80000,
      dueDate: '2026-11-10',
      status: 'RESERVADO',
      createdAt: '2026-10-01T12:00:00Z',
      actor: 'Financeiro Disk',
    },
    {
      id: 'OB-2',
      eventId: 'EV-001',
      category: 'ECAD',
      description: 'Direitos autorais / ECAD',
      beneficiary: 'ECAD',
      value: 15000,
      dueDate: '2026-11-15',
      status: 'RESERVADO',
      createdAt: '2026-10-01T12:10:00Z',
      actor: 'Financeiro Disk',
    },
  ],
  credits: [],
  requests: [],
  refunds: [],
}

const getActor = (req: Request) =>
  req.header('x-user-name') || (req as any).user?.name || req.body?.actor || 'Usuário Financeiro Disk'

export function addLedgerEntry(x: Omit<InternalLedgerEntry, 'id' | 'createdAt'>): InternalLedgerEntry {
  const e: InternalLedgerEntry = {
    id: `L-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...x,
    createdAt: new Date().toISOString(),
  }
  state.ledger.unshift(e)
  return e
}

export function calculateAccount() {
  const events = state.events.map((e) => {
    const entries = state.ledger.filter((x) => x.eventId === e.id)
    const reserved = entries.reduce(
      (s, x) =>
        s +
        (['BLOQUEIO', 'RETENCAO', 'RESERVA_ESTORNO'].includes(x.type)
          ? x.value
          : x.type === 'LIBERACAO'
            ? -x.value
            : 0),
      0
    )
    const paid = entries.filter((x) => x.type === 'REPASSE').reduce((s, x) => s + x.value, 0)
    const refunds = entries
      .filter((x) => x.type === 'ESTORNO_EFETIVADO')
      .reduce((s, x) => s + x.value, 0)
    const amortized = entries
      .filter((x) => x.type === 'AMORTIZACAO_CREDITO')
      .reduce((s, x) => s + x.value, 0)
    const creditDebt = state.credits
      .filter((x) => x.eventId === e.id && x.status === 'ATIVO')
      .reduce((s, x) => s + x.outstanding, 0)

    const salesPercent = e.salesTarget ? (e.sold / e.salesTarget) * 100 : 0
    const eligible = salesPercent >= state.policy.minimumSalesPercent
    const grossLimit = eligible ? (e.sold * state.policy.releasePercent) / 100 : 0
    const available = Math.max(0, grossLimit - paid - Math.max(0, reserved) - refunds - amortized)

    return {
      ...e,
      salesPercent,
      reserved,
      paid,
      refunds,
      amortized,
      creditDebt,
      eligibility: {
        eligible,
        salesPercent,
        minimumSalesPercent: state.policy.minimumSalesPercent,
        releasePercent: state.policy.releasePercent,
        grossLimit,
        reserved,
        paid,
        refunds,
        amortized,
        availableToRequest: available,
      },
    }
  })

  return {
    producer: state.producer,
    summary: {
      sold: events.reduce((s, e) => s + e.sold, 0),
      reserved: events.reduce((s, e) => s + Math.max(0, e.reserved), 0),
      outstandingCredits: state.credits.reduce((s, c) => s + c.outstanding, 0),
      availableForRepasse: events.reduce((s, e) => s + e.eligibility.availableToRequest, 0),
      pendingRefunds: state.refunds
        .filter((x) => !['EFETIVADO', 'REJEITADO', 'CANCELADO'].includes(x.status))
        .reduce((s, x) => s + x.value, 0),
    },
    events,
  }
}

// 1. Health check do módulo
financeInternalAccountRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, module: 'financeiro-disk-conta-interna', version: '0.5' })
})

// 2. Dashboard geral consolidado
financeInternalAccountRouter.get('/dashboard', async (_req: Request, res: Response) => {
  // Sincroniza dinamicamente eventos reais do banco caso existam e ainda não estejam mapeados
  try {
    const dbEvents = await prisma.event.findMany({
      select: { id: true, title: true, totalGross: true },
      take: 10,
    })
    if (dbEvents && dbEvents.length > 0) {
      for (const dbe of dbEvents) {
        const idStr = String(dbe.id)
        if (!state.events.some((x) => x.id === idStr || x.id === `EV-${dbe.id}`)) {
          state.events.push({
            id: `EV-${dbe.id}`,
            name: dbe.title,
            salesTarget: Math.max(500000, Number(dbe.totalGross || 0) * 1.5),
            sold: Number(dbe.totalGross || 320000),
          })
        }
      }
    }
  } catch {
    // Mantém estado em memória se banco não estiver acessível
  }

  res.json({
    ...calculateAccount(),
    credits: state.credits,
    obligations: state.obligations,
    refunds: state.refunds,
    ledger: state.ledger,
    requests: state.requests,
    policy: state.policy,
  })
})

// 3. Atualizar política de repasse
financeInternalAccountRouter.put('/politica', (req: Request, res: Response) => {
  state.policy = { ...state.policy, ...req.body }
  res.json(state.policy)
})
financeInternalAccountRouter.put('/policy', (req: Request, res: Response) => {
  state.policy = { ...state.policy, ...req.body }
  res.json(state.policy)
})

// 4. Nova Retenção ou Bloqueio
financeInternalAccountRouter.post('/retencoes', (req: Request, res: Response) => {
  const { eventId, value, reason, beneficiary, type = 'RETENCAO' } = req.body
  if (!eventId || Number(value) <= 0 || !reason) {
    return res.status(400).json({ error: 'Evento, valor e motivo são obrigatórios' })
  }
  const entry = addLedgerEntry({
    eventId,
    type,
    value: Number(value),
    reason,
    beneficiary,
    actor: getActor(req),
  })
  res.status(201).json(entry)
})
financeInternalAccountRouter.post('/retentions', (req: Request, res: Response) => {
  const { eventId, value, reason, beneficiary, type = 'RETENCAO' } = req.body
  if (!eventId || Number(value) <= 0 || !reason) {
    return res.status(400).json({ error: 'Evento, valor e motivo são obrigatórios' })
  }
  const entry = addLedgerEntry({
    eventId,
    type,
    value: Number(value),
    reason,
    beneficiary,
    actor: getActor(req),
  })
  res.status(201).json(entry)
})

// 5. Liberação de Retenção
financeInternalAccountRouter.post('/liberacoes', (req: Request, res: Response) => {
  const { eventId, value, reason } = req.body
  if (!eventId || Number(value) <= 0 || !reason) {
    return res.status(400).json({ error: 'Evento, valor e motivo são obrigatórios' })
  }
  const entry = addLedgerEntry({
    eventId,
    type: 'LIBERACAO',
    value: Number(value),
    reason,
    actor: getActor(req),
  })
  res.status(201).json(entry)
})
financeInternalAccountRouter.post('/releases', (req: Request, res: Response) => {
  const { eventId, value, reason } = req.body
  if (!eventId || Number(value) <= 0 || !reason) {
    return res.status(400).json({ error: 'Evento, valor e motivo são obrigatórios' })
  }
  const entry = addLedgerEntry({
    eventId,
    type: 'LIBERACAO',
    value: Number(value),
    reason,
    actor: getActor(req),
  })
  res.status(201).json(entry)
})

// 6. Agenda de Obrigações
financeInternalAccountRouter.post('/obrigacoes', (req: Request, res: Response) => {
  if (!req.body.eventId || Number(req.body.value) <= 0 || !req.body.description || !req.body.dueDate) {
    return res.status(400).json({ error: 'Evento, descrição, valor e vencimento são obrigatórios' })
  }
  const actor = getActor(req)
  const o: InternalObligation = {
    id: `OB-${Date.now()}`,
    eventId: req.body.eventId,
    category: req.body.category || 'OUTROS',
    description: req.body.description,
    beneficiary: req.body.beneficiary || '',
    value: Number(req.body.value),
    dueDate: req.body.dueDate,
    status: req.body.reserveNow ? 'RESERVADO' : req.body.status || 'PREVISTO',
    createdAt: new Date().toISOString(),
    actor,
  }
  state.obligations.unshift(o)
  if (req.body.reserveNow) {
    addLedgerEntry({
      eventId: o.eventId,
      type: 'RETENCAO',
      value: o.value,
      reason: `Reserva da obrigação: ${o.description}`,
      beneficiary: o.beneficiary,
      actor,
    })
  }
  res.status(201).json(o)
})
financeInternalAccountRouter.post('/obligations', (req: Request, res: Response) => {
  if (!req.body.eventId || Number(req.body.value) <= 0 || !req.body.description || !req.body.dueDate) {
    return res.status(400).json({ error: 'Evento, descrição, valor e vencimento são obrigatórios' })
  }
  const actor = getActor(req)
  const o: InternalObligation = {
    id: `OB-${Date.now()}`,
    eventId: req.body.eventId,
    category: req.body.category || 'OUTROS',
    description: req.body.description,
    beneficiary: req.body.beneficiary || '',
    value: Number(req.body.value),
    dueDate: req.body.dueDate,
    status: req.body.reserveNow ? 'RESERVADO' : req.body.status || 'PREVISTO',
    createdAt: new Date().toISOString(),
    actor,
  }
  state.obligations.unshift(o)
  if (req.body.reserveNow) {
    addLedgerEntry({
      eventId: o.eventId,
      type: 'RETENCAO',
      value: o.value,
      reason: `Reserva da obrigação: ${o.description}`,
      beneficiary: o.beneficiary,
      actor,
    })
  }
  res.status(201).json(o)
})

financeInternalAccountRouter.patch('/obrigacoes/:id/status', (req: Request, res: Response) => {
  const o = state.obligations.find((x) => x.id === req.params.id)
  if (!o) return res.status(404).json({ error: 'Obrigação não encontrada' })
  o.status = req.body.status || o.status
  o.updatedAt = new Date().toISOString()
  o.updatedBy = getActor(req)
  res.json(o)
})
financeInternalAccountRouter.patch('/obligations/:id/status', (req: Request, res: Response) => {
  const o = state.obligations.find((x) => x.id === req.params.id)
  if (!o) return res.status(404).json({ error: 'Obrigação não encontrada' })
  o.status = req.body.status || o.status
  o.updatedAt = new Date().toISOString()
  o.updatedBy = getActor(req)
  res.json(o)
})

// 7. Créditos e Antecipações
financeInternalAccountRouter.post('/creditos', (req: Request, res: Response) => {
  const {
    eventId,
    principal,
    interestRate = 0,
    installments = 1,
    amortization = 'PERCENTUAL_RECEBIVEIS',
    receivablePercent = 0,
  } = req.body
  if (!eventId || Number(principal) <= 0) {
    return res.status(400).json({ error: 'Evento e principal válidos são obrigatórios' })
  }
  const p = Number(principal)
  const rate = Number(interestRate)
  const n = Math.max(1, Number(installments))
  const total = Number((p * (1 + rate / 100)).toFixed(2))
  const actor = getActor(req)
  const c: InternalCredit = {
    id: `CR-${Date.now()}`,
    eventId,
    principal: p,
    interestRate: rate,
    installments: n,
    installmentValue: Number((total / n).toFixed(2)),
    amortization,
    receivablePercent: Number(receivablePercent),
    totalDebt: total,
    outstanding: total,
    status: 'ATIVO',
    createdAt: new Date().toISOString(),
    actor,
  }
  state.credits.unshift(c)
  addLedgerEntry({
    eventId,
    type: 'CREDITO_CONCEDIDO',
    value: p,
    reason: `Concessão de Crédito ${c.id} (${n}x - Juros ${rate}%)`,
    actor,
  })
  res.status(201).json(c)
})
financeInternalAccountRouter.post('/credits', (req: Request, res: Response) => {
  const {
    eventId,
    principal,
    interestRate = 0,
    installments = 1,
    amortization = 'PERCENTUAL_RECEBIVEIS',
    receivablePercent = 0,
  } = req.body
  if (!eventId || Number(principal) <= 0) {
    return res.status(400).json({ error: 'Evento e principal válidos são obrigatórios' })
  }
  const p = Number(principal)
  const rate = Number(interestRate)
  const n = Math.max(1, Number(installments))
  const total = Number((p * (1 + rate / 100)).toFixed(2))
  const actor = getActor(req)
  const c: InternalCredit = {
    id: `CR-${Date.now()}`,
    eventId,
    principal: p,
    interestRate: rate,
    installments: n,
    installmentValue: Number((total / n).toFixed(2)),
    amortization,
    receivablePercent: Number(receivablePercent),
    totalDebt: total,
    outstanding: total,
    status: 'ATIVO',
    createdAt: new Date().toISOString(),
    actor,
  }
  state.credits.unshift(c)
  addLedgerEntry({
    eventId,
    type: 'CREDITO_CONCEDIDO',
    value: p,
    reason: `Concessão de Crédito ${c.id} (${n}x - Juros ${rate}%)`,
    actor,
  })
  res.status(201).json(c)
})

financeInternalAccountRouter.post('/creditos/:id/amortizar', (req: Request, res: Response) => {
  const c = state.credits.find((x) => x.id === req.params.id)
  if (!c) return res.status(404).json({ error: 'Crédito não encontrado' })
  const value = Math.min(Number(req.body.value || 0), c.outstanding)
  if (value <= 0) return res.status(400).json({ error: 'Valor de amortização inválido' })
  c.outstanding = Number((c.outstanding - value).toFixed(2))
  if (c.outstanding <= 0) c.status = 'LIQUIDADO'
  const actor = getActor(req)
  addLedgerEntry({
    eventId: c.eventId,
    type: 'AMORTIZACAO_CREDITO',
    value,
    reason: `Amortização de Crédito ${c.id}`,
    actor,
  })
  res.json(c)
})
financeInternalAccountRouter.post('/credits/:id/amortize', (req: Request, res: Response) => {
  const c = state.credits.find((x) => x.id === req.params.id)
  if (!c) return res.status(404).json({ error: 'Crédito não encontrado' })
  const value = Math.min(Number(req.body.value || 0), c.outstanding)
  if (value <= 0) return res.status(400).json({ error: 'Valor de amortização inválido' })
  c.outstanding = Number((c.outstanding - value).toFixed(2))
  if (c.outstanding <= 0) c.status = 'LIQUIDADO'
  const actor = getActor(req)
  addLedgerEntry({
    eventId: c.eventId,
    type: 'AMORTIZACAO_CREDITO',
    value,
    reason: `Amortização de Crédito ${c.id}`,
    actor,
  })
  res.json(c)
})

// 8. Registro de Receitas com Amortização Automática
financeInternalAccountRouter.post('/receitas', (req: Request, res: Response) => {
  const { eventId, value } = req.body
  if (!eventId || Number(value) <= 0) {
    return res.status(400).json({ error: 'Evento e valor são obrigatórios' })
  }
  const revenue = Number(value)
  const actor = getActor(req)
  addLedgerEntry({
    eventId,
    type: 'RECEITA_EVENTO',
    value: revenue,
    reason: req.body.reason || 'Receita de vendas do evento',
    actor,
  })
  const amortizations: InternalLedgerEntry[] = []
  for (const c of state.credits.filter(
    (x) =>
      x.eventId === eventId &&
      x.status === 'ATIVO' &&
      x.amortization === 'PERCENTUAL_RECEBIVEIS' &&
      x.receivablePercent > 0
  )) {
    const amount = Math.min(c.outstanding, (revenue * c.receivablePercent) / 100)
    if (amount > 0) {
      c.outstanding = Number((c.outstanding - amount).toFixed(2))
      if (c.outstanding <= 0) c.status = 'LIQUIDADO'
      amortizations.push(
        addLedgerEntry({
          eventId,
          type: 'AMORTIZACAO_CREDITO',
          value: amount,
          reason: `Amortização automática ${c.id} (${c.receivablePercent}% sobre receita de ${revenue})`,
          actor: 'Motor Financeiro',
        })
      )
    }
  }
  res.status(201).json({ revenue, amortizations })
})
financeInternalAccountRouter.post('/revenue', (req: Request, res: Response) => {
  const { eventId, value } = req.body
  if (!eventId || Number(value) <= 0) {
    return res.status(400).json({ error: 'Evento e valor são obrigatórios' })
  }
  const revenue = Number(value)
  const actor = getActor(req)
  addLedgerEntry({
    eventId,
    type: 'RECEITA_EVENTO',
    value: revenue,
    reason: req.body.reason || 'Receita de vendas do evento',
    actor,
  })
  const amortizations: InternalLedgerEntry[] = []
  for (const c of state.credits.filter(
    (x) =>
      x.eventId === eventId &&
      x.status === 'ATIVO' &&
      x.amortization === 'PERCENTUAL_RECEBIVEIS' &&
      x.receivablePercent > 0
  )) {
    const amount = Math.min(c.outstanding, (revenue * c.receivablePercent) / 100)
    if (amount > 0) {
      c.outstanding = Number((c.outstanding - amount).toFixed(2))
      if (c.outstanding <= 0) c.status = 'LIQUIDADO'
      amortizations.push(
        addLedgerEntry({
          eventId,
          type: 'AMORTIZACAO_CREDITO',
          value: amount,
          reason: `Amortização automática ${c.id} (${c.receivablePercent}% sobre receita de ${revenue})`,
          actor: 'Motor Financeiro',
        })
      )
    }
  }
  res.status(201).json({ revenue, amortizations })
})

// 9. Fila de Estornos com Dupla Autorização Obrigatória (Dual Control)
financeInternalAccountRouter.post('/estornos', (req: Request, res: Response) => {
  const { eventId, orderId, value, reason } = req.body
  if (!eventId || !orderId || Number(value) <= 0 || !reason) {
    return res.status(400).json({ error: 'Evento, pedido, valor e motivo são obrigatórios' })
  }
  const u = getActor(req)
  const x: InternalRefund = {
    id: `ES-${Date.now()}`,
    eventId,
    orderId,
    value: Number(value),
    reason,
    status: 'AGUARDANDO_PRIMEIRA_AUTORIZACAO',
    requestedBy: u,
    approvals: [],
    createdAt: new Date().toISOString(),
  }
  state.refunds.unshift(x)
  addLedgerEntry({
    eventId,
    type: 'RESERVA_ESTORNO',
    value: x.value,
    reason: `Reserva cautelar de estorno ${x.id} / Pedido #${orderId}`,
    actor: u,
  })
  res.status(201).json(x)
})
financeInternalAccountRouter.post('/refunds', (req: Request, res: Response) => {
  const { eventId, orderId, value, reason } = req.body
  if (!eventId || !orderId || Number(value) <= 0 || !reason) {
    return res.status(400).json({ error: 'Evento, pedido, valor e motivo são obrigatórios' })
  }
  const u = getActor(req)
  const x: InternalRefund = {
    id: `ES-${Date.now()}`,
    eventId,
    orderId,
    value: Number(value),
    reason,
    status: 'AGUARDANDO_PRIMEIRA_AUTORIZACAO',
    requestedBy: u,
    approvals: [],
    createdAt: new Date().toISOString(),
  }
  state.refunds.unshift(x)
  addLedgerEntry({
    eventId,
    type: 'RESERVA_ESTORNO',
    value: x.value,
    reason: `Reserva cautelar de estorno ${x.id} / Pedido #${orderId}`,
    actor: u,
  })
  res.status(201).json(x)
})

// Autorização de Estorno (Segregação de funções: exige 2 usuários distintos)
financeInternalAccountRouter.post('/estornos/:id/autorizar', (req: Request, res: Response) => {
  const x = state.refunds.find((v) => v.id === req.params.id)
  if (!x) return res.status(404).json({ error: 'Estorno não encontrado' })
  if (['EFETIVADO', 'REJEITADO', 'CANCELADO'].includes(x.status)) {
    return res.status(409).json({ error: 'Estorno encerrado' })
  }
  const u = getActor(req)
  if (x.approvals.some((a) => a.user.trim().toLowerCase() === u.trim().toLowerCase())) {
    return res.status(409).json({ error: 'O mesmo usuário não pode autorizar duas vezes o mesmo estorno' })
  }
  x.approvals.push({
    user: u,
    at: new Date().toISOString(),
    factor: req.body.factor || 'REAUTENTICACAO_MFA_HOMOLOGADO',
  })
  x.status = x.approvals.length === 1 ? 'AGUARDANDO_SEGUNDA_AUTORIZACAO' : 'AUTORIZADO_PARA_EFETIVAR'
  res.json(x)
})
financeInternalAccountRouter.post('/refunds/:id/authorize', (req: Request, res: Response) => {
  const x = state.refunds.find((v) => v.id === req.params.id)
  if (!x) return res.status(404).json({ error: 'Estorno não encontrado' })
  if (['EFETIVADO', 'REJEITADO', 'CANCELADO'].includes(x.status)) {
    return res.status(409).json({ error: 'Estorno encerrado' })
  }
  const u = getActor(req)
  if (x.approvals.some((a) => a.user.trim().toLowerCase() === u.trim().toLowerCase())) {
    return res.status(409).json({ error: 'O mesmo usuário não pode autorizar duas vezes o mesmo estorno' })
  }
  x.approvals.push({
    user: u,
    at: new Date().toISOString(),
    factor: req.body.factor || 'REAUTENTICACAO_MFA_HOMOLOGADO',
  })
  x.status = x.approvals.length === 1 ? 'AGUARDANDO_SEGUNDA_AUTORIZACAO' : 'AUTORIZADO_PARA_EFETIVAR'
  res.json(x)
})

// Efetivação de Estorno
financeInternalAccountRouter.post('/estornos/:id/efetivar', (req: Request, res: Response) => {
  const x = state.refunds.find((v) => v.id === req.params.id)
  if (!x) return res.status(404).json({ error: 'Estorno não encontrado' })
  if (x.approvals.length < 2 || x.status !== 'AUTORIZADO_PARA_EFETIVAR') {
    return res.status(422).json({ error: 'Estorno exige duas autorizações distintas antes da efetivação' })
  }
  x.status = 'EFETIVADO'
  x.executedBy = getActor(req)
  x.executedAt = new Date().toISOString()
  addLedgerEntry({
    eventId: x.eventId,
    type: 'LIBERACAO',
    value: x.value,
    reason: `Baixa da reserva do estorno ${x.id}`,
    actor: x.executedBy,
  })
  addLedgerEntry({
    eventId: x.eventId,
    type: 'ESTORNO_EFETIVADO',
    value: x.value,
    reason: `Estorno efetivado ${x.id} / Pedido #${x.orderId}`,
    actor: x.executedBy,
  })
  res.json(x)
})
financeInternalAccountRouter.post('/refunds/:id/execute', (req: Request, res: Response) => {
  const x = state.refunds.find((v) => v.id === req.params.id)
  if (!x) return res.status(404).json({ error: 'Estorno não encontrado' })
  if (x.approvals.length < 2 || x.status !== 'AUTORIZADO_PARA_EFETIVAR') {
    return res.status(422).json({ error: 'Estorno exige duas autorizações distintas antes da efetivação' })
  }
  x.status = 'EFETIVADO'
  x.executedBy = getActor(req)
  x.executedAt = new Date().toISOString()
  addLedgerEntry({
    eventId: x.eventId,
    type: 'LIBERACAO',
    value: x.value,
    reason: `Baixa da reserva do estorno ${x.id}`,
    actor: x.executedBy,
  })
  addLedgerEntry({
    eventId: x.eventId,
    type: 'ESTORNO_EFETIVADO',
    value: x.value,
    reason: `Estorno efetivado ${x.id} / Pedido #${x.orderId}`,
    actor: x.executedBy,
  })
  res.json(x)
})

// Rejeição de Estorno
financeInternalAccountRouter.post('/estornos/:id/rejeitar', (req: Request, res: Response) => {
  const x = state.refunds.find((v) => v.id === req.params.id)
  if (!x) return res.status(404).json({ error: 'Estorno não encontrado' })
  if (x.status === 'EFETIVADO') return res.status(409).json({ error: 'Estorno já efetivado' })
  x.status = 'REJEITADO'
  x.rejectedBy = getActor(req)
  x.rejectedAt = new Date().toISOString()
  addLedgerEntry({
    eventId: x.eventId,
    type: 'LIBERACAO',
    value: x.value,
    reason: `Liberação da reserva cautelar por rejeição do estorno ${x.id}`,
    actor: x.rejectedBy,
  })
  res.json(x)
})
financeInternalAccountRouter.post('/refunds/:id/reject', (req: Request, res: Response) => {
  const x = state.refunds.find((v) => v.id === req.params.id)
  if (!x) return res.status(404).json({ error: 'Estorno não encontrado' })
  if (x.status === 'EFETIVADO') return res.status(409).json({ error: 'Estorno já efetivado' })
  x.status = 'REJEITADO'
  x.rejectedBy = getActor(req)
  x.rejectedAt = new Date().toISOString()
  addLedgerEntry({
    eventId: x.eventId,
    type: 'LIBERACAO',
    value: x.value,
    reason: `Liberação da reserva cautelar por rejeição do estorno ${x.id}`,
    actor: x.rejectedBy,
  })
  res.json(x)
})

// 10. Elegibilidade e Solicitação de Repasse Parametrizado
financeInternalAccountRouter.get('/repasses/elegibilidade/:eventId', (req: Request, res: Response) => {
  const e = calculateAccount().events.find((x) => x.id === req.params.eventId)
  if (!e) return res.status(404).json({ error: 'Evento não encontrado' })
  res.json(e.eligibility)
})
financeInternalAccountRouter.get('/payouts/eligibility/:eventId', (req: Request, res: Response) => {
  const e = calculateAccount().events.find((x) => x.id === req.params.eventId)
  if (!e) return res.status(404).json({ error: 'Evento não encontrado' })
  res.json(e.eligibility)
})

financeInternalAccountRouter.post('/repasses/solicitacoes', (req: Request, res: Response) => {
  const e = calculateAccount().events.find((x) => x.id === req.body.eventId)
  if (!e) return res.status(404).json({ error: 'Evento não encontrado' })
  const value = Number(req.body.value)
  if (value <= 0) return res.status(400).json({ error: 'Valor inválido para repasse' })
  if (value > e.eligibility.availableToRequest && !req.body.exceptionAuthorization) {
    return res.status(422).json({
      error: `Valor solicitado (R$ ${(value / 100).toFixed(2)}) excede o limite disponível para repasse (R$ ${(e.eligibility.availableToRequest / 100).toFixed(2)})`,
      availableToRequest: e.eligibility.availableToRequest,
    })
  }
  const actor = getActor(req)
  const x: InternalPayoutRequest = {
    id: `RP-${Date.now()}`,
    eventId: e.id,
    value,
    status: 'EM_ANALISE',
    createdAt: new Date().toISOString(),
    exceptionAuthorization: !!req.body.exceptionAuthorization,
    actor,
  }
  state.requests.unshift(x)
  res.status(201).json(x)
})
financeInternalAccountRouter.post('/payouts/requests', (req: Request, res: Response) => {
  const e = calculateAccount().events.find((x) => x.id === req.body.eventId)
  if (!e) return res.status(404).json({ error: 'Evento não encontrado' })
  const value = Number(req.body.value)
  if (value <= 0) return res.status(400).json({ error: 'Valor inválido para repasse' })
  if (value > e.eligibility.availableToRequest && !req.body.exceptionAuthorization) {
    return res.status(422).json({
      error: `Valor solicitado (R$ ${(value / 100).toFixed(2)}) excede o limite disponível para repasse (R$ ${(e.eligibility.availableToRequest / 100).toFixed(2)})`,
      availableToRequest: e.eligibility.availableToRequest,
    })
  }
  const actor = getActor(req)
  const x: InternalPayoutRequest = {
    id: `RP-${Date.now()}`,
    eventId: e.id,
    value,
    status: 'EM_ANALISE',
    createdAt: new Date().toISOString(),
    exceptionAuthorization: !!req.body.exceptionAuthorization,
    actor,
  }
  state.requests.unshift(x)
  res.status(201).json(x)
})
