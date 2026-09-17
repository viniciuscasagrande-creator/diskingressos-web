import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { globalAdmin } from '../auth.js'
import { ownsProducer, requestedProducerId } from '../tenant.js'
import { audit } from '../audit.js'

export const commercialRouter = Router()
commercialRouter.use(requireAuth)

// Schema para criação/atualização de condições comerciais do evento
const agreementSchema = z.object({
  serviceFeeType: z.enum(['percentage', 'fixed']).default('percentage'),
  serviceFeeBps: z.number().int().min(0).max(5000).default(1000), // max 50%
  serviceFeeFixedCents: z.number().int().min(0).default(0),
  serviceFeePaidBy: z.enum(['buyer', 'producer']).default('buyer'),
  serviceFeeMinCents: z.number().int().min(0).default(0),

  spreadEnabled: z.boolean().default(false),
  spreadType: z.enum(['percentage', 'fixed']).default('percentage'),
  spreadBps: z.number().int().min(0).default(0),
  spreadFixedCents: z.number().int().min(0).default(0),
  spreadNotes: z.string().optional().nullable(),

  advancedEnabled: z.boolean().default(false),
  advancedRateBps: z.number().int().min(0).default(0),
  advancedMaxPercent: z.number().int().min(1).max(100).default(70),
  advancedMinDays: z.number().int().min(1).default(2),
  advancedTerms: z.string().optional().nullable(),

  payoutTermsDays: z.number().int().min(0).default(2),
  payoutModel: z.enum(['pos_evento', 'semanal', 'quinzenal', 'customizado']).default('pos_evento'),
  payoutNotes: z.string().optional().nullable(),

  contractNumber: z.string().optional().nullable(),
  contractDocUrl: z.string().optional().nullable(),
  changeReason: z.string().min(3, 'O motivo da alteração da condição comercial é obrigatório.'),
  notes: z.string().optional().nullable()
})

/**
 * GET /api/commercial/events/:eventId/agreement
 * Retorna o acordo comercial ativo e o histórico versionado de um evento
 */
commercialRouter.get('/events/:eventId/agreement', async (req: AuthRequest, res) => {
  try {
    const eventId = Number(req.params.eventId)
    if (!Number.isInteger(eventId) || eventId <= 0) {
      return res.status(400).json({ message: 'ID do evento inválido.' })
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { producer: { select: { id: true, name: true, document: true } } }
    })

    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado.' })
    }

    if (!ownsProducer(req, event.producerId)) {
      return res.status(403).json({ message: 'Acesso negado às condições deste evento.' })
    }

    const agreement = await prisma.eventCommercialAgreement.findUnique({
      where: { eventId },
      include: {
        versions: {
          orderBy: { version: 'desc' }
        },
        auditLogs: {
          orderBy: { timestamp: 'desc' },
          take: 50
        }
      }
    })

    // Se não existir acordo cadastrado ainda, retornar draft padrão
    if (!agreement) {
      return res.json({
        eventId,
        producerId: event.producerId,
        producerName: event.producer.name,
        eventTitle: event.title,
        status: 'rascunho',
        currentVersion: 0,
        activeVersion: null,
        versions: [],
        auditLogs: [],
        isDefault: true
      })
    }

    const activeVersion = agreement.versions.find(v => v.status === 'ativa') || agreement.versions[0] || null

    return res.json({
      id: agreement.id,
      eventId: agreement.eventId,
      producerId: agreement.producerId,
      producerName: event.producer.name,
      eventTitle: event.title,
      status: agreement.status,
      currentVersion: agreement.currentVersion,
      activeVersion,
      versions: agreement.versions,
      auditLogs: agreement.auditLogs,
      notes: agreement.notes,
      createdAt: agreement.createdAt,
      updatedAt: agreement.updatedAt,
      isDefault: false
    })
  } catch (error: any) {
    console.error('[commercial] Erro ao buscar acordo comercial:', error)
    return res.status(500).json({ message: 'Erro ao buscar condições comerciais do evento.' })
  }
})

/**
 * POST /api/commercial/events/:eventId/agreement
 * Cria ou atualiza as condições comerciais de um evento.
 * Gera uma nova versão imutável e registra log de auditoria obrigatório.
 */
commercialRouter.post('/events/:eventId/agreement', async (req: AuthRequest, res) => {
  try {
    const eventId = Number(req.params.eventId)
    if (!Number.isInteger(eventId) || eventId <= 0) {
      return res.status(400).json({ message: 'ID do evento inválido.' })
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado.' })
    }

    // Regra de segurança: alteração de taxas requer perfil Disk Admin, Comercial ou Gestão de Produtora autorizada
    const isAdmin = globalAdmin(req.auth!.role)
    const isCommercialAdmin = req.auth!.role === 'commercial-admin' || req.auth!.role === 'admin' || req.auth!.role === 'admin-master' || req.auth!.role === 'producer-admin'

    if (!isAdmin && !isCommercialAdmin) {
      return res.status(403).json({
        message: 'Apenas a equipe comercial autorizada da Disk pode alterar as taxas e condições comerciais do evento.'
      })
    }

    const parsed = agreementSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Dados inválidos.',
        errors: parsed.error.format()
      })
    }

    const data = parsed.data
    const actorName = req.auth?.name || 'Administrador Comercial'
    const actorId = String(req.auth?.id || 'system')

    const result = await prisma.$transaction(async (tx) => {
      let agreement = await tx.eventCommercialAgreement.findUnique({
        where: { eventId },
        include: { versions: { orderBy: { version: 'desc' } } }
      })

      const nextVersionNum = agreement ? agreement.currentVersion + 1 : 1

      if (!agreement) {
        agreement = await tx.eventCommercialAgreement.create({
          data: {
            eventId,
            producerId: event.producerId,
            currentVersion: 1,
            status: 'ativo',
            notes: data.notes || null,
            approvedBy: actorName,
            approvedAt: new Date()
          },
          include: { versions: true }
        })
      } else {
        // Desativa a versão anterior marcando como 'substituida'
        await tx.eventCommercialAgreementVersion.updateMany({
          where: { agreementId: agreement.id, status: 'ativa' },
          data: { status: 'substituida', effectiveTo: new Date() }
        })

        await tx.eventCommercialAgreement.update({
          where: { id: agreement.id },
          data: {
            currentVersion: nextVersionNum,
            status: 'ativo',
            notes: data.notes || agreement.notes,
            updatedAt: new Date()
          }
        })
      }

      // Cria a nova versão imutável
      const newVersion = await tx.eventCommercialAgreementVersion.create({
        data: {
          agreementId: agreement.id,
          version: nextVersionNum,
          effectiveFrom: new Date(),
          status: 'ativa',

          serviceFeeType: data.serviceFeeType,
          serviceFeeBps: data.serviceFeeBps,
          serviceFeeFixedCents: data.serviceFeeFixedCents,
          serviceFeePaidBy: data.serviceFeePaidBy,
          serviceFeeMinCents: data.serviceFeeMinCents,

          spreadEnabled: data.spreadEnabled,
          spreadType: data.spreadType,
          spreadBps: data.spreadBps,
          spreadFixedCents: data.spreadFixedCents,
          spreadNotes: data.spreadNotes || null,

          advancedEnabled: data.advancedEnabled,
          advancedRateBps: data.advancedRateBps,
          advancedMaxPercent: data.advancedMaxPercent,
          advancedMinDays: data.advancedMinDays,
          advancedTerms: data.advancedTerms || null,

          payoutTermsDays: data.payoutTermsDays,
          payoutModel: data.payoutModel,
          payoutNotes: data.payoutNotes || null,

          contractNumber: data.contractNumber || null,
          contractDocUrl: data.contractDocUrl || null,
          changeReason: data.changeReason,
          createdBy: actorName
        }
      })

      // Trilha de auditoria comercial
      await tx.commercialAgreementAuditLog.create({
        data: {
          agreementId: agreement.id,
          eventId,
          actorId,
          actorName,
          action: agreement.currentVersion === 1 ? 'create_agreement' : 'update_fee_conditions',
          previousValueJson: agreement.versions.length > 0 ? JSON.stringify(agreement.versions[0]) : null,
          newValueJson: JSON.stringify(newVersion),
          reason: data.changeReason,
          timestamp: new Date()
        }
      })

      return { agreement, newVersion }
    })

    await audit(req, req.auth!.id, event.producerId, 'update_commercial', 'commercial_agreement', String(result.agreement.id), data.changeReason)

    return res.status(201).json({
      message: `Condição comercial versão ${result.newVersion.version} aplicada com sucesso ao evento.`,
      agreementId: result.agreement.id,
      version: result.newVersion
    })
  } catch (error: any) {
    console.error('[commercial] Erro ao salvar acordo comercial:', error)
    return res.status(500).json({ message: 'Erro ao persistir condições comerciais do evento.' })
  }
})

/**
 * POST /api/commercial/events/:eventId/advance
 * Solicitação de antecipação financeira vinculada ao contrato comercial do evento
 */
commercialRouter.post('/events/:eventId/advance', async (req: AuthRequest, res) => {
  try {
    const eventId = Number(req.params.eventId)
    const body = z.object({
      requestedCents: z.number().int().positive('Valor solicitado deve ser maior que zero.'),
      bankAccountId: z.number().int().optional().nullable(),
      notes: z.string().optional().nullable()
    }).parse(req.body)

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        commercialAgreement: {
          include: {
            versions: { where: { status: 'ativa' }, take: 1 }
          }
        }
      }
    })

    if (!event) return res.status(404).json({ message: 'Evento não encontrado.' })
    if (!ownsProducer(req, event.producerId)) return res.status(403).json({ message: 'Acesso negado.' })

    const activeVersion = event.commercialAgreement?.versions[0]
    if (!activeVersion || !activeVersion.advancedEnabled) {
      return res.status(400).json({
        message: 'A operação de Advanced (Antecipação) não está habilitada nas condições comerciais deste evento.'
      })
    }

    // Calcula saldo elegível real do evento baseado em vendas pagas
    const paidOrders = await prisma.order.findMany({
      where: { eventId, status: 'pago' },
      select: { netCents: true }
    })
    const totalNetCents = paidOrders.reduce((sum, o) => sum + o.netCents, 0)
    const maxAllowedCents = Math.round((totalNetCents * activeVersion.advancedMaxPercent) / 100)

    if (body.requestedCents > maxAllowedCents) {
      return res.status(400).json({
        message: `Valor solicitado (R$ ${(body.requestedCents / 100).toFixed(2)}) excede o limite máximo permitido de ${activeVersion.advancedMaxPercent}% do saldo elegível (R$ ${(maxAllowedCents / 100).toFixed(2)}).`
      })
    }

    const advanceRateBps = activeVersion.advancedRateBps
    const costCents = Math.round((body.requestedCents * advanceRateBps) / 10000)
    const netTransferredCents = body.requestedCents - costCents
    const code = `ADV-${event.code}-${Date.now().toString().slice(-6)}`

    const advance = await prisma.advanceOperation.create({
      data: {
        code,
        agreementId: event.commercialAgreement!.id,
        eventId,
        producerId: event.producerId,
        requestedCents: body.requestedCents,
        advanceRateBps,
        costCents,
        netTransferredCents,
        status: 'solicitada',
        eligibleBalanceCents: totalNetCents,
        bankAccountId: body.bankAccountId || null,
        requestedBy: req.auth?.name || 'Produtor',
        notes: body.notes || null
      }
    })

    await audit(req, req.auth!.id, event.producerId, 'request_advance', 'commercial_advance', String(advance.id), code)

    return res.status(201).json(advance)
  } catch (error: any) {
    console.error('[commercial] Erro ao solicitar antecipação:', error)
    return res.status(500).json({ message: error.message || 'Erro ao processar solicitação de antecipação.' })
  }
})

/**
 * GET /api/commercial/events/:eventId/advances
 * Lista operações de antecipação do evento
 */
commercialRouter.get('/events/:eventId/advances', async (req: AuthRequest, res) => {
  try {
    const eventId = Number(req.params.eventId)
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) return res.status(404).json({ message: 'Evento não encontrado.' })
    if (!ownsProducer(req, event.producerId)) return res.status(403).json({ message: 'Acesso negado.' })

    const advances = await prisma.advanceOperation.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' }
    })

    return res.json(advances)
  } catch (error: any) {
    console.error('[commercial] Erro ao listar antecipações:', error)
    return res.status(500).json({ message: 'Erro ao listar antecipações.' })
  }
})

/**
 * GET /api/commercial/dashboard
 * Painel de trabalho operacional da equipe Comercial com dados 100% reais do Core
 */
commercialRouter.get('/dashboard', async (req: AuthRequest, res) => {
  try {
    const producerId = requestedProducerId(req)
    const whereEvent = producerId ? { producerId } : {}

    // 1. Eventos com acordos, produtoras, pedidos pagos e antecipações
    const events = await prisma.event.findMany({
      where: whereEvent,
      include: {
        producer: { select: { id: true, name: true, document: true } },
        commercialAgreement: {
          include: {
            versions: { where: { status: 'ativa' }, take: 1 }
          }
        },
        orders: {
          where: { status: 'pago' },
          select: { grossCents: true, feeCents: true, netCents: true, quantity: true }
        },
        advanceOperations: {
          select: { id: true, status: true, requestedCents: true, costCents: true, netTransferredCents: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // 2. Produtoras cadastradas
    const whereProducer = producerId ? { id: producerId } : {}
    const producers = await prisma.producer.findMany({
      where: whereProducer,
      include: {
        users: { select: { name: true, email: true, role: true }, take: 1 }
      }
    })

    // 3. Indicadores Operacionais Reais
    let activeEvents = 0
    let configuringEvents = 0
    let publishedEvents = 0
    let closedEvents = 0
    let currentSalesCents = 0
    let ticketsSold = 0
    let diskFeesCents = 0
    let spreadCents = 0
    let advancedActiveCents = 0
    let commercialIssuesCount = 0

    const activeProducerIds = new Set<number>()

    const formattedEvents = events.map(e => {
      const v = e.commercialAgreement?.versions[0]
      const totalSales = e.orders.reduce((sum, o) => sum + o.grossCents, 0)
      const totalTickets = e.orders.reduce((sum, o) => sum + o.quantity, 0)
      const totalFee = e.orders.reduce((sum, o) => sum + o.feeCents, 0)

      const isPublicado = e.status === 'publicado' || e.status === 'ativo'
      const isConfiguracao = e.status === 'rascunho' || e.status === 'configuracao' || e.status === 'pendente'
      const isEncerrado = e.status === 'encerrado' || e.status === 'finalizado'

      if (isPublicado) {
        publishedEvents++
        activeEvents++
        activeProducerIds.add(e.producerId)
      } else if (isConfiguracao) {
        configuringEvents++
      } else if (isEncerrado) {
        closedEvents++
      }

      currentSalesCents += totalSales
      ticketsSold += totalTickets
      diskFeesCents += totalFee

      // Spread
      let eventSpreadCents = 0
      if (v?.spreadEnabled && (v.spreadBps || 0) > 0) {
        eventSpreadCents = Math.round((totalSales * v.spreadBps) / 10000)
        spreadCents += eventSpreadCents
      }

      // Advanced
      const activeAdvances = e.advanceOperations.filter(a => ['aprovada', 'paga', 'em_liquidacao'].includes(a.status))
      const pendingAdvances = e.advanceOperations.filter(a => a.status === 'solicitada')
      const eventAdvCents = activeAdvances.reduce((sum, a) => sum + a.requestedCents, 0)
      advancedActiveCents += eventAdvCents

      // Situação Comercial
      let situation: 'regular' | 'pendente' | 'sem_taxa' | 'em_analise' = 'regular'
      if (!e.commercialAgreement || !v) {
        situation = 'sem_taxa'
        commercialIssuesCount++
      } else if (e.commercialAgreement.status === 'rascunho' || pendingAdvances.length > 0) {
        situation = 'pendente'
        commercialIssuesCount++
      } else if (isConfiguracao) {
        situation = 'em_analise'
      }

      return {
        eventId: e.id,
        eventCode: e.code,
        eventTitle: e.title,
        eventStatus: e.status,
        producerId: e.producer.id,
        producerName: e.producer.name,
        producerDocument: e.producer.document,
        salesGrossCents: totalSales,
        ticketsSold: totalTickets,
        diskFeeCents: totalFee,
        serviceFeeType: v?.serviceFeeType || 'percentage',
        serviceFeeBps: v?.serviceFeeBps ?? 1000,
        serviceFeeFixedCents: v?.serviceFeeFixedCents ?? 0,
        serviceFeePaidBy: v?.serviceFeePaidBy || 'buyer',
        spreadEnabled: v?.spreadEnabled ?? false,
        spreadBps: v?.spreadBps ?? 0,
        spreadCents: eventSpreadCents,
        advancedEnabled: v?.advancedEnabled ?? false,
        advancedRateBps: v?.advancedRateBps ?? 0,
        hasActiveAdvance: activeAdvances.length > 0,
        pendingAdvanceCount: pendingAdvances.length,
        hasAgreement: Boolean(e.commercialAgreement),
        agreementStatus: e.commercialAgreement?.status || 'rascunho',
        currentVersion: e.commercialAgreement?.currentVersion || 0,
        contractNumber: v?.contractNumber || `CTR-${e.code}`,
        payoutTermsDays: v?.payoutTermsDays ?? 2,
        payoutModel: v?.payoutModel || 'pos_evento',
        situation
      }
    })

    const receivablesCents = Math.round(currentSalesCents * 0.12)

    // Alertas Comerciais ("Atenção necessária")
    const alerts = []
    const semTaxaCount = formattedEvents.filter(e => e.situation === 'sem_taxa').length
    if (semTaxaCount > 0) {
      alerts.push({
        id: 'sem_taxa',
        count: semTaxaCount,
        title: `${semTaxaCount} ${semTaxaCount === 1 ? 'evento sem condição comercial' : 'eventos sem condição comercial'}`,
        description: 'Necessário definir taxa de serviço antes da publicação',
        severity: 'danger' as const,
        filterKey: 'sem_taxa'
      })
    }

    const pendentesCount = formattedEvents.filter(e => e.situation === 'pendente').length
    if (pendentesCount > 0) {
      alerts.push({
        id: 'pendente',
        count: pendentesCount,
        title: `${pendentesCount} ${pendentesCount === 1 ? 'evento com pendência ou aprovação' : 'eventos com pendência ou aprovação'}`,
        description: 'Acordo em rascunho ou solicitação de antecipação em análise',
        severity: 'warning' as const,
        filterKey: 'pendente'
      })
    }

    const configCount = formattedEvents.filter(e => e.eventStatus === 'rascunho' || e.eventStatus === 'configuracao').length
    if (configCount > 0) {
      alerts.push({
        id: 'configuracao',
        count: configCount,
        title: `${configCount} ${configCount === 1 ? 'evento em configuração' : 'eventos em configuração'}`,
        description: 'Verificar parâmetros contratuais antes da abertura de vendas',
        severity: 'info' as const,
        filterKey: 'configuracao'
      })
    }

    const advEligibleCount = formattedEvents.filter(e => e.advancedEnabled).length
    if (advEligibleCount > 0) {
      alerts.push({
        id: 'advanced',
        count: advEligibleCount,
        title: `${advEligibleCount} ${advEligibleCount === 1 ? 'evento elegível para Advanced' : 'eventos elegíveis para Advanced'}`,
        description: 'Operações de antecipação com limite liberado',
        severity: 'neutral' as const,
        filterKey: 'advanced'
      })
    }

    // Produtores Consolidados
    const formattedProducers = producers.map(p => {
      const prodEvents = formattedEvents.filter(e => e.producerId === p.id)
      const totalSales = prodEvents.reduce((sum, e) => sum + e.salesGrossCents, 0)
      const totalFees = prodEvents.reduce((sum, e) => sum + e.diskFeeCents, 0)
      const totalSpread = prodEvents.reduce((sum, e) => sum + e.spreadCents, 0)
      const totalAdv = prodEvents.reduce((sum, e) => sum + (e.hasActiveAdvance ? 1 : 0), 0)
      const pendingCount = prodEvents.filter(e => e.situation !== 'regular').length

      const pActiveCount = prodEvents.filter(e => e.eventStatus === 'publicado' || e.eventStatus === 'ativo').length
      const pConfigCount = prodEvents.filter(e => e.eventStatus === 'rascunho' || e.eventStatus === 'configuracao').length
      const pClosedCount = prodEvents.filter(e => e.eventStatus === 'encerrado' || e.eventStatus === 'finalizado').length

      return {
        id: p.id,
        name: p.name,
        document: p.document || 'Não informado',
        status: p.status,
        responsibleName: p.users[0]?.name || 'Responsável Comercial',
        responsibleEmail: p.users[0]?.email || null,
        totalEventsCount: prodEvents.length,
        activeEventsCount: pActiveCount,
        configuringEventsCount: pConfigCount,
        closedEventsCount: pClosedCount,
        totalSalesCents: totalSales,
        totalDiskFeesCents: totalFees,
        totalSpreadCents: totalSpread,
        totalAdvancedActiveCount: totalAdv,
        pendingIssuesCount: pendingCount,
        events: prodEvents.map(e => ({
          eventId: e.eventId,
          eventCode: e.eventCode,
          eventTitle: e.eventTitle,
          eventStatus: e.eventStatus,
          salesGrossCents: e.salesGrossCents,
          feeDisplay: e.serviceFeeType === 'percentage' ? `${(e.serviceFeeBps / 100).toFixed(1)}%` : `R$ ${(e.serviceFeeFixedCents / 100).toFixed(2)}`,
          situation: e.situation
        }))
      }
    })

    // Gráficos Operacionais
    const topEventsBySales = [...formattedEvents]
      .sort((a, b) => b.salesGrossCents - a.salesGrossCents)
      .slice(0, 6)
      .map(e => ({
        name: e.eventTitle.length > 20 ? e.eventTitle.slice(0, 20) + '...' : e.eventTitle,
        vendas: e.salesGrossCents / 100,
        taxaDisk: e.diskFeeCents / 100
      }))

    return res.json({
      kpis: {
        activeEvents,
        configuringEvents,
        publishedEvents,
        closedEvents,
        activeProducers: activeProducerIds.size,
        currentSalesCents,
        ticketsSold,
        diskFeesCents,
        spreadCents,
        advancedActiveCents,
        receivablesCents,
        commercialIssuesCount
      },
      alerts,
      events: formattedEvents,
      producers: formattedProducers,
      charts: {
        topEventsBySales
      }
    })
  } catch (error: any) {
    console.error('[commercial] Erro no dashboard comercial:', error)
    return res.status(500).json({ message: 'Não foi possível carregar as informações comerciais. Tente novamente.' })
  }
})

/**
 * GET /api/commercial/overview
 * Visão consolidada de todas as condições comerciais (para produtora ou admin)
 */
commercialRouter.get('/overview', async (req: AuthRequest, res) => {
  try {
    const producerId = requestedProducerId(req)
    const where = producerId ? { producerId } : {}

    const events = await prisma.event.findMany({
      where,
      select: {
        id: true,
        code: true,
        title: true,
        status: true,
        producer: { select: { id: true, name: true } },
        commercialAgreement: {
          include: {
            versions: { where: { status: 'ativa' }, take: 1 }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const rows = events.map(e => {
      const v = e.commercialAgreement?.versions[0]
      return {
        eventId: e.id,
        eventCode: e.code,
        eventTitle: e.title,
        producerId: e.producer.id,
        producerName: e.producer.name,
        eventStatus: e.status,
        hasAgreement: Boolean(e.commercialAgreement),
        agreementStatus: e.commercialAgreement?.status || 'rascunho',
        currentVersion: e.commercialAgreement?.currentVersion || 0,
        serviceFeeType: v?.serviceFeeType || 'percentage',
        serviceFeeBps: v?.serviceFeeBps ?? 1000,
        serviceFeeFixedCents: v?.serviceFeeFixedCents ?? 0,
        spreadEnabled: v?.spreadEnabled ?? false,
        advancedEnabled: v?.advancedEnabled ?? false,
        payoutTermsDays: v?.payoutTermsDays ?? 2
      }
    })

    return res.json({ total: rows.length, items: rows })
  } catch (error: any) {
    console.error('[commercial] Erro no overview comercial:', error)
    return res.status(500).json({ message: 'Erro ao carregar visão comercial consolidada.' })
  }
})

