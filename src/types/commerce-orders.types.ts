// ==============================================================================
// FASE 29.8 — TIPOS OFICIAIS DO COMMERCE CORE, PEDIDOS & INGRESSOS
// Modelagem canônica omnichannel: Site, Disk, Disk Interno, Bilheteria e PDV
// ==============================================================================

export type SalesChannel =
  | 'SITE'
  | 'DISK'
  | 'DISK_INTERNO'
  | 'BOX_OFFICE'
  | 'PDV'
  | 'PARTNER'

export type OrderStatus =
  | 'DRAFT'
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'FULFILLED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'CANCELLED'
  | 'EXPIRED'

export type PaymentMethod =
  | 'PIX'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'CASH'
  | 'COURTESY'

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'APPROVED'
  | 'REJECTED'
  | 'REFUNDED'

export interface TicketItem {
  id: string
  ticketNumber: string
  orderId: string
  eventId: string
  eventName: string
  sessionDate: string
  sectorName: string
  row?: string
  seatNumber?: string
  holderName: string
  holderCpf: string
  price: number
  status: 'ACTIVE' | 'USED' | 'CANCELLED' | 'TRANSFERRED'
  qrCredential: string
  reissuedCount?: number
}

export interface OrderItem {
  id: string
  orderId: string
  description: string
  modality: 'INTEIRA' | 'MEIA' | 'SOCIAL' | 'CLUBE_DISK' | 'CORTESIA'
  sectorName: string
  quantity: number
  unitPrice: number
  serviceFee: number
  totalPrice: number
  seatReferences?: string[]
}

export interface OrderRecord {
  id: string
  protocol: string
  channel: SalesChannel
  channelLabelPtBr: string
  status: OrderStatus
  statusLabelPtBr: string
  customerId: string
  customerName: string
  customerEmail: string
  customerCpf: string
  eventId: string
  eventName: string
  sessionDate: string
  venueName: string
  producerId: number
  producerName: string
  subtotalAmount: number
  serviceFeeAmount: number
  discountAmount: number
  totalAmount: number
  createdAt: string
  paidAt?: string
  correlationId: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  items: OrderItem[]
  tickets: TicketItem[]
  timeline: Array<{
    timestamp: string
    action: string
    service: string
    status: 'OK' | 'WARN' | 'ERROR'
    details?: string
  }>
  ledgerPosted: boolean
  notificationsSent: {
    email: boolean
    whatsapp: boolean
  }
}

export interface CommerceKpiSummary {
  ordersPerMinute: number
  paymentsPerMinute: number
  todayRevenueBrl: number
  activeHoldsCount: number
  ticketsIssuedToday: number
  approvalRatePercentage: number
  channelShare: {
    sitePercentage: number
    boxOfficePercentage: number
    posPercentage: number
    partnersPercentage: number
  }
  integrityAlerts: {
    inconsistentOrders: number
    paymentsWithoutTickets: number
    ticketsWithoutLedger: number
    stuckExpiredHolds: number
  }
}
