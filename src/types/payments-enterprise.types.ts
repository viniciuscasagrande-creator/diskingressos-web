// NÚCLEO DE PAGAMENTOS ENTERPRISE — TIPOS OFICIAIS DO DISK CORE
// Pagamentos, PIX, Cartões, Gateways, Antifraude, Split, Conciliação e Chargebacks

export type PaymentMethod =
  | 'pix'
  | 'credit_card'
  | 'debit_card'
  | 'tef_pos'
  | 'cash'
  | 'voucher'
  | 'authorized_credit'

export type PaymentChannel =
  | 'site'
  | 'disk'
  | 'disk_interno'
  | 'bilheteria'
  | 'pdv'

export type PaymentStatus =
  | 'criado'
  | 'aguardando_pagamento'
  | 'autorizado'
  | 'capturado'
  | 'aprovado'
  | 'recusado'
  | 'expirado'
  | 'cancelado'
  | 'estornado'
  | 'parcialmente_estornado'
  | 'chargeback'
  | 'em_analise_risco'

export type GatewayProvider =
  | 'cielo'
  | 'rede'
  | 'stone'
  | 'pagbank'
  | 'itau_pix'
  | 'banco_brasil_pix'
  | 'zoop'
  | 'tef_local'

export type RiskLevel = 'baixo' | 'medio' | 'alto' | 'critico'
export type RiskRecommendation = 'aprovar' | 'validar' | 'revisar' | 'bloquear'

export type ChargebackStatus = 'novo' | 'em_analise' | 'contestado' | 'ganho' | 'perdido'

export type ReconciliationStatus =
  | 'auto_conciliado'
  | 'divergente'
  | 'resolvido_manualmente'
  | 'pendente_liquidacao'

export interface PaymentTimelineStep {
  timestamp: string
  step: string
  status: string
  detail: string
  actor: string
}

export interface PaymentSplitRule {
  recipient: 'produtor' | 'diskingressos' | 'gateway' | 'afiliado'
  label: string
  percentage: number
  amountCents: number
}

export interface PaymentSplitSnapshot {
  contractSnapshotId: string
  appliedRules: string
  rules: PaymentSplitRule[]
  lockedAt: string
}

export interface PaymentRiskEvaluation {
  score: number
  level: RiskLevel
  recommendation: RiskRecommendation
  evaluatedSignals: string[]
  fraudFlags: string[]
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
}

export interface PaymentRecord {
  id: string
  orderId: string
  correlationId: string
  idempotencyKey: string
  eventId: number
  eventTitle: string
  producerId: number
  producerName: string
  customerName: string
  customerDocument: string
  customerEmail: string
  method: PaymentMethod
  channel: PaymentChannel
  status: PaymentStatus
  amountCents: number
  serviceFeeCents: number
  gatewayFeeCents: number
  installments?: number
  cardBrand?: string
  cardLastFour?: string
  authCode?: string
  nsu?: string
  terminalId?: string
  pixTxId?: string
  pixEndToEndId?: string
  gateway: GatewayProvider
  gatewayReference?: string
  risk: PaymentRiskEvaluation
  split: PaymentSplitSnapshot
  isSettled: boolean
  settledAt?: string
  expectedSettlementDate: string
  isReconciled: boolean
  reconciledAt?: string
  divergenceDetected: boolean
  divergenceDetail?: string
  refundedAmountCents?: number
  refundReason?: string
  refundedBy?: string
  createdAt: string
  updatedAt: string
  timeline: PaymentTimelineStep[]
}

export interface PaymentIntentionAttempt {
  attemptNumber: number
  method: PaymentMethod
  gateway: GatewayProvider
  status: 'aprovada' | 'recusada' | 'expirada'
  amountCents: number
  timestamp: string
  reason?: string
}

export interface PaymentIntention {
  id: string
  orderId: string
  targetAmountCents: number
  attempts: PaymentIntentionAttempt[]
  finalPaymentId?: string
  status: 'pendente' | 'pago' | 'expirado' | 'cancelado'
  createdAt: string
}

export interface ChargebackRecord {
  id: string
  paymentId: string
  orderId: string
  eventTitle: string
  producerName: string
  amountCents: number
  reason: string
  status: ChargebackStatus
  ticketUsed: boolean
  checkinAt?: string
  checkinGate?: string
  acquirerReference: string
  deadlineAt: string
  evidenceDocuments: string[]
  riskReserveCents: number
  createdAt: string
  updatedAt: string
}

export interface ReconciliationRecord {
  id: string
  paymentId: string
  orderId: string
  gateway: GatewayProvider
  expectedAmountCents: number
  receivedAmountCents: number
  differenceCents: number
  feeExpectedCents: number
  feeRealizedCents: number
  status: ReconciliationStatus
  type:
    | 'esperado_vs_recebido'
    | 'taxa_divergente'
    | 'pix_sem_id'
    | 'estorno_nao_refletido'
    | 'chargeback_nao_contabilizado'
  identifiedAt: string
  resolvedAt?: string
  resolvedBy?: string
  resolutionNotes?: string
}

export interface WebhookRecord {
  id: string
  gateway: GatewayProvider
  eventType: string
  status: 'processado' | 'pendente' | 'falha'
  signatureValid: boolean
  payloadSummary: string
  attempts: number
  receivedAt: string
  processedAt?: string
  errorDetail?: string
}

export interface PaymentsSummaryKPIs {
  totalProcessedCents: number
  totalPaymentsCount: number
  approvedPaymentsCount: number
  approvalRatePercentage: number
  pixVolumeCents: number
  cardsVolumeCents: number
  otherVolumeCents: number
  pendingReviewCount: number
  rejectedCount: number
  refundedCents: number
  chargebacksRiskCents: number
  divergenceCount: number
  awaitingReconciliationCount: number
  activeHoldCount: number
  healthScorePercentage: number
}
