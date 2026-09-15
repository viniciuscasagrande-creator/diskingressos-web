import { Router, Request, Response } from 'express'

export const commerceCoreRouter = Router()

/**
 * GET /api/v1/commerce/summary
 */
commerceCoreRouter.get('/commerce/summary', (_req: Request, res: Response) => {
  return res.json({
    ordersPerMinute: 381,
    paymentsPerMinute: 344,
    todayRevenueBrl: 1842630.45,
    activeHoldsCount: 8291,
    ticketsIssuedToday: 14280,
    approvalRatePercentage: 91.8,
    channelShare: {
      sitePercentage: 79.9,
      boxOfficePercentage: 11.8,
      posPercentage: 5.8,
      partnersPercentage: 2.5
    },
    integrityAlerts: {
      inconsistentOrders: 0,
      paymentsWithoutTickets: 2,
      ticketsWithoutLedger: 0,
      stuckExpiredHolds: 3
    }
  })
})

const sampleOrders = [
  {
    id: 'ORD-928371',
    protocol: 'DI-2026-928371',
    channel: 'SITE',
    channelLabelPtBr: 'Site Oficial (Ecommerce)',
    status: 'PAID',
    statusLabelPtBr: 'Pago',
    customerId: 'CUST-1049',
    customerName: 'Maria Silva Santos',
    customerEmail: 'maria.silva@gmail.com',
    customerCpf: '048.***.***-91',
    eventId: 'EVT-100',
    eventName: 'Orquestra Sinfônica — Noite de Clássicos',
    sessionDate: '25/10/2026 20:30',
    venueName: 'Teatro Positivo — Grande Auditório (Curitiba/PR)',
    producerId: 1,
    producerName: 'Opus Entretenimento Curitiba',
    subtotalAmount: 560.0,
    serviceFeeAmount: 56.0,
    discountAmount: 0,
    totalAmount: 616.0,
    createdAt: '15/09/2026 16:45:10',
    paidAt: '15/09/2026 16:45:32',
    correlationId: 'COR-982736',
    paymentMethod: 'PIX',
    paymentStatus: 'APPROVED',
    items: [
      {
        id: 'ITEM-1',
        orderId: 'ORD-928371',
        description: 'Plateia Premium — Fila A (Assentos 1 e 2)',
        modality: 'INTEIRA',
        sectorName: 'Plateia Premium',
        quantity: 2,
        unitPrice: 280.0,
        serviceFee: 28.0,
        totalPrice: 616.0,
        seatReferences: ['Fila A, Assento 1', 'Fila A, Assento 2']
      }
    ],
    tickets: [
      {
        id: 'TCK-99120',
        ticketNumber: 'DI-TCK-88120',
        orderId: 'ORD-928371',
        eventId: 'EVT-100',
        eventName: 'Orquestra Sinfônica — Noite de Clássicos',
        sessionDate: '25/10/2026 20:30',
        sectorName: 'Plateia Premium',
        row: 'A',
        seatNumber: '1',
        holderName: 'Maria Silva Santos',
        holderCpf: '048.***.***-91',
        price: 280.0,
        status: 'ACTIVE',
        qrCredential: 'SEC_HMAC_v1_99120_Orquestra'
      },
      {
        id: 'TCK-99121',
        ticketNumber: 'DI-TCK-88121',
        orderId: 'ORD-928371',
        eventId: 'EVT-100',
        eventName: 'Orquestra Sinfônica — Noite de Clássicos',
        sessionDate: '25/10/2026 20:30',
        sectorName: 'Plateia Premium',
        row: 'A',
        seatNumber: '2',
        holderName: 'João Santos Pereira',
        holderCpf: '052.***.***-11',
        price: 280.0,
        status: 'ACTIVE',
        qrCredential: 'SEC_HMAC_v1_99121_Orquestra'
      }
    ],
    timeline: [
      { timestamp: '16:45:10', service: 'Site Checkout', action: 'Carrinho criado', status: 'OK' },
      { timestamp: '16:45:12', service: 'Inventory Core', action: 'Hold atômico no Redis', status: 'OK' },
      { timestamp: '16:45:32', service: 'Payment Core', action: 'PIX aprovado', status: 'OK' },
      { timestamp: '16:45:33', service: 'Ledger Core', action: 'Partida dobrada postada', status: 'OK' },
      { timestamp: '16:45:34', service: 'Ticket Core', action: '2 ingressos emitidos', status: 'OK' }
    ],
    ledgerPosted: true,
    notificationsSent: { email: true, whatsapp: false }
  },
  {
    id: 'ORD-928372',
    protocol: 'DI-2026-928372',
    channel: 'BOX_OFFICE',
    channelLabelPtBr: 'Bilheteria Física (Teatro Positivo)',
    status: 'FULFILLED',
    statusLabelPtBr: 'Concluído',
    customerId: 'CUST-1050',
    customerName: 'Roberto Albuquerque',
    customerEmail: 'roberto.albuquerque@hotmail.com',
    customerCpf: '112.***.***-45',
    eventId: 'EVT-100',
    eventName: 'Orquestra Sinfônica — Noite de Clássicos',
    sessionDate: '25/10/2026 20:30',
    venueName: 'Teatro Positivo — Grande Auditório (Curitiba/PR)',
    producerId: 1,
    producerName: 'Opus Entretenimento Curitiba',
    subtotalAmount: 190.0,
    serviceFeeAmount: 0,
    discountAmount: 0,
    totalAmount: 190.0,
    createdAt: '15/09/2026 15:10:00',
    paidAt: '15/09/2026 15:10:45',
    correlationId: 'COR-881290',
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'APPROVED',
    items: [
      {
        id: 'ITEM-2',
        orderId: 'ORD-928372',
        description: 'Plateia Geral — Fila B (Assento 4)',
        modality: 'INTEIRA',
        sectorName: 'Plateia Geral',
        quantity: 1,
        unitPrice: 190.0,
        serviceFee: 0,
        totalPrice: 190.0,
        seatReferences: ['Fila B, Assento 4']
      }
    ],
    tickets: [
      {
        id: 'TCK-99122',
        ticketNumber: 'DI-TCK-88122',
        orderId: 'ORD-928372',
        eventId: 'EVT-100',
        eventName: 'Orquestra Sinfônica — Noite de Clássicos',
        sessionDate: '25/10/2026 20:30',
        sectorName: 'Plateia Geral',
        row: 'B',
        seatNumber: '4',
        holderName: 'Roberto Albuquerque',
        holderCpf: '112.***.***-45',
        price: 190.0,
        status: 'ACTIVE',
        qrCredential: 'SEC_HMAC_v1_99122_Bilheteria'
      }
    ],
    timeline: [
      { timestamp: '15:10:00', service: 'Box Office POS', action: 'Venda presencial aberta', status: 'OK' },
      { timestamp: '15:10:45', service: 'TEF / Card Gateway', action: 'Cartão aprovado presencialmente', status: 'OK' }
    ],
    ledgerPosted: true,
    notificationsSent: { email: true, whatsapp: false }
  }
]

/**
 * GET /api/v1/commerce/orders
 */
commerceCoreRouter.get('/commerce/orders', (req: Request, res: Response) => {
  const { channel, status, query } = req.query
  let filtered = sampleOrders

  if (channel && channel !== 'TODOS') {
    filtered = filtered.filter((o) => o.channel === channel)
  }
  if (status && status !== 'TODOS') {
    filtered = filtered.filter((o) => o.status === status)
  }
  if (query) {
    const q = String(query).toLowerCase()
    filtered = filtered.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.eventName.toLowerCase().includes(q)
    )
  }

  return res.json(filtered)
})

/**
 * GET /api/v1/commerce/orders/:id
 */
commerceCoreRouter.get('/commerce/orders/:id', (req: Request, res: Response) => {
  const order = sampleOrders.find((o) => o.id === req.params.id)
  if (!order) {
    return res.status(404).json({ error: 'Pedido não encontrado no Commerce Core.' })
  }
  return res.json(order)
})

/**
 * POST /api/v1/commerce/tickets/:id/reissue
 */
commerceCoreRouter.post('/commerce/tickets/:id/reissue', (req: Request, res: Response) => {
  return res.json({
    ok: true,
    message: `Ingresso ${req.params.id} reemitido com sucesso! Credencial anterior revogada na catraca/controle de acesso.`
  })
})

/**
 * POST /api/v1/commerce/orders/:id/reconcile
 */
commerceCoreRouter.post('/commerce/orders/:id/reconcile', (req: Request, res: Response) => {
  return res.json({
    ok: true,
    message: `Pedido ${req.params.id} reconciliado com sucesso no Commerce Core. Ingressos e partidas contábeis validados.`
  })
})
