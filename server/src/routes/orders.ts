import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { audit } from '../audit.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { ownsProducer, requestedProducerId, writeProducerId } from '../tenant.js'
import { dispatchPurchaseForOrder } from '../services/conversionEngine.js'

export const ordersRouter = Router()
ordersRouter.use(requireAuth)

const input = z.object({
  code: z.string().min(3),
  buyerName: z.string().min(2),
  buyerEmail: z.string().email(),
  buyerDocument: z.string().optional(),
  channel: z.string().optional(),
  paymentMethod: z.string().min(2),
  status: z.string().optional(),
  quantity: z.number().int().positive(),
  grossCents: z.number().int().nonnegative(),
  feeCents: z.number().int().nonnegative().optional(),
  netCents: z.number().int().nonnegative().optional(),
  eventId: z.number().int().positive(),
  producerId: z.number().int().positive().optional(),
  lotId: z.number().int().positive().optional(),
  attributionSessionKey: z.string().min(8).optional()
})

ordersRouter.get('/', async (req: AuthRequest, res) => {
  const producerId = requestedProducerId(req)
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined
  const status = typeof req.query.status === 'string' ? req.query.status : undefined

  res.json(
    await prisma.order.findMany({
      where: {
        ...(producerId ? { producerId } : {}),
        ...(eventId ? { eventId } : {}),
        ...(status ? { status } : {})
      },
      include: {
        event: { select: { id: true, title: true } },
        tickets: true,
        posTransaction: true,
        feeSnapshot: true
      },
      orderBy: { createdAt: 'desc' }
    })
  )
})

ordersRouter.post('/', async (req: AuthRequest, res) => {
  const p = input.parse(req.body)
  const producerId = writeProducerId(req, p.producerId)
  if (!producerId) return res.status(400).json({ message: 'Produtora obrigatória.' })

  const event = await prisma.event.findUnique({
    where: { id: p.eventId },
    include: {
      commercialAgreement: {
        include: {
          versions: { where: { status: 'ativa' }, orderBy: { version: 'desc' }, take: 1 }
        }
      }
    }
  })

  if (!event || event.producerId !== producerId) {
    return res.status(403).json({ message: 'Evento fora do escopo da produtora.' })
  }

  if (p.lotId) {
    const lot = await prisma.lot.findUnique({ where: { id: p.lotId } })
    if (!lot || lot.eventId !== p.eventId || lot.producerId !== producerId) {
      return res.status(400).json({ message: 'Lote inválido.' })
    }
  }

  // Motor Comercial Disk: resolução da condição comercial ativa do evento
  const activeVersion = event.commercialAgreement?.versions[0]
  const baseTicketCents = p.netCents && p.netCents > 0
    ? p.netCents
    : (p.feeCents ? p.grossCents - p.feeCents : p.grossCents)

  let computedFeeCents = 0
  if (activeVersion) {
    if (activeVersion.serviceFeeType === 'fixed') {
      computedFeeCents = activeVersion.serviceFeeFixedCents * p.quantity
    } else {
      computedFeeCents = Math.round((baseTicketCents * activeVersion.serviceFeeBps) / 10000)
    }
    if (activeVersion.serviceFeeMinCents > 0 && computedFeeCents < activeVersion.serviceFeeMinCents) {
      computedFeeCents = activeVersion.serviceFeeMinCents
    }
  } else if (p.feeCents !== undefined) {
    computedFeeCents = p.feeCents
  }

  const finalFeeCents = p.feeCents !== undefined && p.feeCents > 0 ? p.feeCents : computedFeeCents
  const finalNetCents = baseTicketCents
  const finalGrossCents = activeVersion?.serviceFeePaidBy === 'producer'
    ? baseTicketCents
    : (baseTicketCents + finalFeeCents)

  const created = await prisma.$transaction(async (tx) => {
    const attribution = p.attributionSessionKey
      ? await tx.trackingAttribution.findUnique({ where: { sessionKey: p.attributionSessionKey } })
      : null

    if (attribution && (attribution.eventId !== p.eventId || attribution.producerId !== producerId || attribution.expiresAt < new Date())) {
      throw new Error('Sessão UTM inválida para esta venda.')
    }

    const order = await tx.order.create({
      data: {
        code: p.code,
        buyerName: p.buyerName,
        buyerEmail: p.buyerEmail,
        buyerDocument: p.buyerDocument,
        channel: p.channel || 'online',
        paymentMethod: p.paymentMethod,
        status: p.status || 'pago',
        quantity: p.quantity,
        grossCents: finalGrossCents,
        feeCents: finalFeeCents,
        netCents: finalNetCents,
        eventId: p.eventId,
        producerId
      }
    })

    // Congela o snapshot da taxa no momento da compra (imutabilidade retroativa)
    if (activeVersion) {
      await tx.appliedFeeSnapshot.create({
        data: {
          orderId: order.id,
          eventId: p.eventId,
          producerId,
          agreementVersionId: activeVersion.id,
          ticketBaseCents: baseTicketCents,
          feeTypeApplied: activeVersion.serviceFeeType,
          feeRateAppliedBps: activeVersion.serviceFeeBps,
          feeFixedAppliedCents: activeVersion.serviceFeeFixedCents,
          serviceFeeTotalCents: finalFeeCents,
          grossChargedCents: finalGrossCents,
          netProducerCents: finalNetCents,
          contractVersion: activeVersion.version
        }
      })
    }

    for (let i = 0; i < p.quantity; i++) {
      await tx.ticket.create({
        data: {
          code: `${p.code}-T${i + 1}`,
          priceCents: Math.floor(baseTicketCents / p.quantity),
          producerId,
          eventId: p.eventId,
          orderId: order.id,
          lotId: p.lotId
        }
      })
    }

    if (p.lotId) {
      await tx.lot.update({ where: { id: p.lotId }, data: { sold: { increment: p.quantity } } })
    }

    await tx.event.update({
      where: { id: p.eventId },
      data: { sales: { increment: p.quantity }, totalCents: { increment: finalGrossCents } }
    })

    // Lançamento financeiro do produtor (líquido)
    await tx.financialTransaction.create({
      data: {
        code: `FIN-${p.code}`,
        type: 'entrada',
        category: 'venda',
        description: `Venda ${p.code}`,
        amountCents: finalNetCents,
        status: p.status === 'pago' ? 'liquidado' : 'pendente',
        producerId,
        eventId: p.eventId,
        orderId: order.id
      }
    })

    // Lançamento financeiro da taxa Disk (receita de serviço)
    if (finalFeeCents > 0) {
      await tx.financialTransaction.create({
        data: {
          code: `FEE-${p.code}`,
          type: 'entrada',
          category: 'taxa_servico',
          description: `Taxa Disk - Venda ${p.code}`,
          amountCents: finalFeeCents,
          status: p.status === 'pago' ? 'liquidado' : 'pendente',
          producerId,
          eventId: p.eventId,
          orderId: order.id
        }
      })
    }

    if (attribution) {
      await tx.trackingAttribution.update({
        where: { id: attribution.id },
        data: {
          status: 'converted',
          orderId: order.id,
          customerName: p.buyerName,
          customerEmail: p.buyerEmail,
          cartValueCents: finalGrossCents,
          lastActivityAt: new Date(),
          convertedAt: new Date()
        }
      })
      await tx.trackingJourneyAction.create({
        data: {
          action: 'finalized',
          orderCode: p.code,
          customerName: p.buyerName,
          customerEmail: p.buyerEmail,
          ticketSummary: `${p.quantity} ingresso(s)`,
          amountCents: finalGrossCents,
          trackingLinkId: attribution.trackingLinkId,
          producerId,
          eventId: p.eventId
        }
      })
      await tx.trackingLink.update({
        where: { id: attribution.trackingLinkId },
        data: { conversions: { increment: 1 } }
      })
    }

    return order
  })

  await audit(req, req.auth!.id, producerId, 'create', 'order', String(created.id))

  if (created.status === 'pago') {
    try {
      await dispatchPurchaseForOrder(created.id)
    } catch (error) {
      console.error('[conversion-engine] Falha ao distribuir Purchase', error)
    }
  }

  res.status(201).json(created)
})

ordersRouter.patch('/:id/status', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const body = z.object({ status: z.string().min(2) }).parse(req.body)
  const existing = await prisma.order.findUnique({ where: { id } })

  if (!existing) return res.status(404).json({ message: 'Venda não encontrada.' })
  if (!ownsProducer(req, existing.producerId)) return res.status(403).json({ message: 'Acesso negado.' })

  const updated = await prisma.order.update({ where: { id }, data: { status: body.status } })
  await audit(req, req.auth!.id, existing.producerId, 'status', 'order', String(id), body.status)

  if (body.status === 'pago' && existing.status !== 'pago') {
    try {
      await dispatchPurchaseForOrder(updated.id)
    } catch (error) {
      console.error('[conversion-engine] Falha ao distribuir Purchase após pagamento', error)
    }
  }

  res.json(updated)
})
