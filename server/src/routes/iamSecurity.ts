import { Router, Request, Response } from 'express'

export const iamSecurityRouter = Router()

// Simulação de banco em memória para auditoria e logs de segurança
const securityAuditEvents: Array<{
  id: string
  action: string
  actorUserId: string
  decision: string
  reason: string
  timestamp: string
}> = []

/**
 * POST /api/v1/iam/evaluate
 * Avaliação pelo Policy Engine no backend do Disk Core
 */
iamSecurityRouter.post('/iam/evaluate', (req: Request, res: Response) => {
  const { subject, action, resource, context } = req.body

  if (!subject || !action || !resource) {
    return res.status(400).json({
      error: 'Parâmetros obrigatórios ausentes: subject, action, resource.'
    })
  }

  // 1. Maker x Checker (SoD)
  if (
    (action.includes('.approve') || action === 'finance.transfer.approve') &&
    resource.creatorUserId &&
    resource.creatorUserId === subject.userId
  ) {
    securityAuditEvents.push({
      id: `AUD-${Date.now()}`,
      action,
      actorUserId: subject.userId,
      decision: 'DENIED',
      reason: 'Segregação de Funções (SoD): criador não pode aprovar a própria solicitação.',
      timestamp: new Date().toISOString()
    })

    return res.status(403).json({
      allowed: false,
      code: 'DENY_SOD_MAKER_CHECKER',
      reason: 'Segregação de Funções (SoD): o criador da solicitação não pode aprovar a própria operação (creator != approver).'
    })
  }

  // 2. Escopo por Evento
  if (resource.eventId && subject.allowedEvents && subject.allowedEvents.length > 0) {
    const hasAll = subject.allowedEvents.includes('*')
    const hasEvent = subject.allowedEvents.includes(resource.eventId)
    if (!hasAll && !hasEvent) {
      return res.status(403).json({
        allowed: false,
        code: 'DENY_EVENT_SCOPE',
        reason: `Acesso negado: o usuário não possui autorização para operar sobre o evento '${resource.eventId}'.`
      })
    }
  }

  // 3. Alçada Financeira
  if (action === 'finance.transfer.approve' && typeof resource.amount === 'number') {
    const isLeadOrAdmin = subject.roles?.includes('DEVELOPER_LEAD') || subject.roles?.includes('ADMIN_DISK') || subject.roles?.includes('GESTAO_DIRETORIA')
    const isGestor = subject.roles?.includes('FINANCEIRO_GESTOR')

    if (resource.amount > 100000 && !isLeadOrAdmin) {
      return res.status(403).json({
        allowed: false,
        code: 'DENY_FINANCIAL_LIMIT_EXCEEDED',
        reason: 'Alçada financeira excedida: transferências acima de R$ 100.000,00 exigem aprovação da Diretoria.'
      })
    }

    if (resource.amount > 10000 && !isGestor && !isLeadOrAdmin) {
      return res.status(403).json({
        allowed: false,
        code: 'DENY_FINANCIAL_LIMIT_EXCEEDED',
        reason: 'Alçada financeira excedida: Analista Financeiro possui teto de R$ 10.000,00.'
      })
    }
  }

  // Sucesso
  securityAuditEvents.push({
    id: `AUD-${Date.now()}`,
    action,
    actorUserId: subject.userId,
    decision: 'ALLOWED',
    reason: 'Acesso autorizado pelo Policy Engine.',
    timestamp: new Date().toISOString()
  })

  return res.json({
    allowed: true,
    code: 'ALLOW',
    reason: 'Acesso autorizado pelo Policy Engine do Disk Core.'
  })
})

/**
 * GET /api/v1/developer/command-center
 */
iamSecurityRouter.get('/developer/command-center', (_req: Request, res: Response) => {
  return res.json({
    uptimePercentage: 99.99,
    apiP95Ms: 218,
    errorRatePercentage: 0.12,
    requestsPerMinute: 12842,
    ordersPerMinute: 381,
    ticketsIssuedPerMinute: 339,
    checkinsPerMinute: 2182,
    pendingQueuesCount: 137,
    dlqCount: 3,
    activeIncidentsCount: 2,
    componentsHealth: [
      { component: 'Disk Core API', type: 'CORE', status: 'ONLINE', latencyMs: 14, uptimePercentage: 99.99, lastChecked: '16:48:10' },
      { component: 'PostgreSQL Cluster', type: 'DATABASE', status: 'ONLINE', latencyMs: 4, uptimePercentage: 100.0, lastChecked: '16:48:12' },
      { component: 'Redis Cache & Locks', type: 'CACHE', status: 'ONLINE', latencyMs: 1, uptimePercentage: 100.0, lastChecked: '16:48:12' },
      { component: 'RabbitMQ Event Bus', type: 'MESSAGE_BROKER', status: 'ONLINE', latencyMs: 8, uptimePercentage: 99.98, lastChecked: '16:48:11' },
      { component: 'Gateway PIX Central', type: 'GATEWAY', status: 'ONLINE', latencyMs: 240, uptimePercentage: 99.95, lastChecked: '16:48:05' },
      { component: 'Gateway Cartão de Crédito', type: 'GATEWAY', status: 'DEGRADED', latencyMs: 1850, uptimePercentage: 97.4, lastChecked: '16:48:00', message: 'Latência anormal no provedor' },
      { component: 'WhatsApp Provider', type: 'SERVICE', status: 'DEGRADED', latencyMs: 3200, uptimePercentage: 96.8, lastChecked: '16:47:50', message: '26 mensagens retidas na fila' }
    ],
    criticalAlerts: [
      { id: 'ALT-01', title: 'Gateway Cartão de Crédito com latência superior a 1500ms', severity: 'HIGH', createdAt: '16:30' },
      { id: 'ALT-02', title: 'Fila WhatsApp Notification com 26 mensagens aguardando retry na DLQ', severity: 'MEDIUM', createdAt: '16:35' }
    ]
  })
})

/**
 * GET /api/v1/developer/logs
 */
iamSecurityRouter.get('/developer/logs', (req: Request, res: Response) => {
  const { correlationId, severity } = req.query
  const sampleLogs = [
    {
      id: 'LOG-9821',
      timestamp: '15/09/2026 16:45:12',
      severity: 'INFO',
      system: 'DISK_CORE',
      module: 'CheckoutCore',
      message: 'Pedido criado com reserva atômica de assentos (10 minutos)',
      correlationId: 'COR-982736',
      requestId: 'REQ-44812',
      userId: 'USR-892',
      eventId: 'EVT-100',
      metadata: { totalAmountBrl: 560.0, itemsCount: 2 }
    },
    {
      id: 'LOG-9826',
      timestamp: '15/09/2026 16:45:38',
      severity: 'WARN',
      system: 'DISK_CORE',
      module: 'NotificationWorker',
      message: 'Falha temporária no envio de WhatsApp: timeout no provedor parceiro',
      correlationId: 'COR-982736',
      metadata: { provider: 'Z-API / WhatsApp', timeoutMs: 5000 }
    },
    {
      id: 'LOG-9827',
      timestamp: '15/09/2026 16:42:18',
      severity: 'INFO',
      system: 'DISK_INTERNO',
      module: 'EventBuilder',
      message: 'Preço do lote VIP alterado com auditoria imutável',
      correlationId: 'COR-771239',
      userId: 'USR-MARIA-SUPORTE',
      eventId: 'EVT-100',
      beforeState: { sector: 'VIP', price: 180.0 },
      afterState: { sector: 'VIP', price: 220.0 }
    }
  ]

  let filtered = sampleLogs
  if (correlationId) {
    filtered = filtered.filter((l) => l.correlationId === correlationId)
  }
  if (severity && severity !== 'TODOS') {
    filtered = filtered.filter((l) => l.severity === severity)
  }

  return res.json(filtered)
})

/**
 * GET /api/v1/developer/traces/:correlationId
 */
iamSecurityRouter.get('/developer/traces/:correlationId', (req: Request, res: Response) => {
  const { correlationId } = req.params
  if (correlationId === 'COR-982736') {
    return res.json({
      correlationId: 'COR-982736',
      rootAction: 'Compra Omnichannel de Ingressos (Site)',
      status: 'FAILED_DLQ',
      startedAt: '15/09/2026 16:45:10',
      completedAt: '15/09/2026 16:45:42',
      totalDurationMs: 32000,
      userId: 'USR-892',
      eventId: 'EVT-100',
      orderId: 'ORD-982736',
      steps: [
        { stepIndex: 1, service: 'Site Checkout', action: 'Início do fluxo de compra', status: 'SUCCESS', timestamp: '16:45:10', durationMs: 120 },
        { stepIndex: 2, service: 'Disk Core • Inventory Hold', action: 'Reserva atômica de assentos no Redis', status: 'SUCCESS', timestamp: '16:45:12', durationMs: 34 },
        { stepIndex: 3, service: 'Disk Core • Payment Provider', action: 'Geração de QR Code PIX Banco Central', status: 'SUCCESS', timestamp: '16:45:14', durationMs: 410 },
        { stepIndex: 4, service: 'Disk Core • Webhook Engine', action: 'Recepção de notificação de pagamento', status: 'SUCCESS', timestamp: '16:45:32', durationMs: 180 },
        { stepIndex: 5, service: 'Disk Core • Financial Ledger', action: 'Lançamento de partida dobrada imutável', status: 'SUCCESS', timestamp: '16:45:33', durationMs: 45 },
        { stepIndex: 6, service: 'Disk Core • Ticket Core', action: 'Emissão de ingressos com QR criptografado', status: 'SUCCESS', timestamp: '16:45:34', durationMs: 82 },
        { stepIndex: 7, service: 'Disk Core • Notification Worker', action: 'Disparo de confirmação por WhatsApp', status: 'ERROR', timestamp: '16:45:42', durationMs: 5000, dlqReason: 'Timeout no provedor' }
      ]
    })
  }

  return res.status(404).json({ error: 'Correlation ID não encontrado no trace storage.' })
})

/**
 * POST /api/v1/developer/sessions/:id/revoke
 */
iamSecurityRouter.post('/developer/sessions/:id/revoke', (req: Request, res: Response) => {
  const { id } = req.params
  const { reason } = req.body

  securityAuditEvents.push({
    id: `AUD-${Date.now()}`,
    action: 'SessionRevoked',
    actorUserId: 'DEVELOPER_LEAD',
    decision: 'REVOKED',
    reason: reason || 'Revogação emergencial de sessão',
    timestamp: new Date().toISOString()
  })

  return res.json({
    ok: true,
    message: `Sessão ${id} revogada com sucesso no Redis e registrada na auditoria imutável.`
  })
})

/**
 * POST /api/v1/developer/jobs/reprocess
 */
iamSecurityRouter.post('/developer/jobs/reprocess', (req: Request, res: Response) => {
  const { queueName, correlationId } = req.body

  securityAuditEvents.push({
    id: `AUD-${Date.now()}`,
    action: 'JobReprocessed',
    actorUserId: 'DEVELOPER_LEAD',
    decision: 'REPROCESSED',
    reason: `Reprocessamento manual da DLQ na fila ${queueName} para correlationId ${correlationId}`,
    timestamp: new Date().toISOString()
  })

  return res.json({
    ok: true,
    message: `Mensagens da DLQ (${queueName}) reenfileiradas com sucesso pelo Developer Lead.`
  })
})
