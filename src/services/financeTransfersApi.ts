const API = import.meta.env.VITE_API_URL || '/api'

function getAuthToken(): string {
  if (typeof window === 'undefined') return ''
  try {
    const resolved = new URL(API, window.location.origin)
    const ns = `${resolved.protocol}//${resolved.host}${resolved.pathname.replace(/\/$/, '')}`
    return sessionStorage.getItem(`disk_token:${ns}`) || localStorage.getItem(`disk_token:${ns}`) || ''
  } catch {
    return sessionStorage.getItem('disk_token') || localStorage.getItem('disk_token') || ''
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const r = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) {
    throw new Error(data.message || `Erro na requisição (${r.status})`)
  }
  return data as T
}

export interface ProducerConsolidatedBalance {
  grossCents: number
  availableCents: number
  receivableCents: number
  blockedCents: number
  settledCents: number
  totalTransferredCents: number
  transferredInCents: number
  transferredOutCents: number
  netTransfersCents: number
  invariantMaintained: boolean
}

export interface ProducerAccountMetrics {
  activeEventsCount: number
  totalEventsCount: number
  healthScore: number
  transferCount: number
  pendingApprovalsCount: number
}

export interface ProducerAccountSummary {
  ok: boolean
  producer: {
    id: number
    name: string
    document: string
    status: string
  }
  consolidatedBalance: ProducerConsolidatedBalance
  metrics: ProducerAccountMetrics
  recentTransfers: InternalTransferRecord[]
  updatedAt: string
}

export interface EventFinancialAccount {
  eventId: number
  eventTitle: string
  eventDate: string | null
  status: 'active' | 'closed' | 'reconciling'
  grossCents: number
  availableCents: number
  receivableCents: number
  blockedCents: number
  settledCents: number
  transferredInCents: number
  transferredOutCents: number
  netBalanceCents: number
  lastActivityAt: string | null
}

export interface InternalTransferRecord {
  id: string
  code: string
  producerId: number
  sourceEventId: number
  sourceEventTitle: string
  destinationEventId: number
  destinationEventTitle: string
  amountCents: number
  category: 'equalizacao_caixa' | 'emprestimo_inter_eventos' | 'cobertura_despesas' | 'outros'
  categoryLabel: string
  reason: string
  status: 'completed' | 'pending_approval' | 'reversed' | 'rejected'
  statusLabel: string
  approvalTier: 'DIRECT' | 'FINANCE' | 'EXECUTIVE'
  requiresApproval: boolean
  idempotencyKey: string
  debitTransactionCode: string
  creditTransactionCode: string
  requestedBy: {
    id: number
    name: string
    role: string
  }
  approvedBy?: {
    id: number
    name: string
    role: string
  } | null
  approvedAt?: string | null
  occurredAt: string
  reversedAt?: string | null
  reversalReason?: string | null
  reversalDebitTransactionCode?: string | null
  reversalCreditTransactionCode?: string | null
  auditHash: string
}

export interface TransferPreviewResult {
  ok: boolean
  valid: boolean
  error: string | null
  source: {
    id: number
    title: string
    before: { availableCents: number; netBalanceCents: number }
    after: { availableCents: number; netBalanceCents: number }
    deltaCents: number
  }
  destination: {
    id: number
    title: string
    before: { availableCents: number; netBalanceCents: number }
    after: { availableCents: number; netBalanceCents: number }
    deltaCents: number
  }
  producerInvariant: {
    netChangeCents: number
    invariantMaintained: boolean
    message: string
  }
  amountCents: number
  category: string
  categoryLabel: string
  reason: string
  approvalTier: 'DIRECT' | 'FINANCE' | 'EXECUTIVE'
  requiresApproval: boolean
  approvalDescription: string
  doubleEntryPlan: Array<{
    side: 'debit' | 'credit'
    eventId: number
    eventTitle: string
    type: string
    category: string
    amountCents: number
    description: string
  }>
}

export interface CreateTransferPayload {
  producerId?: number
  sourceEventId: number
  destinationEventId: number
  amountCents: number
  reason: string
  category?: 'equalizacao_caixa' | 'emprestimo_inter_eventos' | 'cobertura_despesas' | 'outros'
  idempotencyKey: string
}

export interface PreviewTransferPayload {
  producerId?: number
  sourceEventId: number
  destinationEventId: number
  amountCents: number
  reason: string
  category?: 'equalizacao_caixa' | 'emprestimo_inter_eventos' | 'cobertura_despesas' | 'outros'
}

/**
 * 1. Obter Conta Financeira Consolidada do Produtor
 */
export async function getProducerAccount(producerId: number = 1): Promise<ProducerAccountSummary> {
  return request<ProducerAccountSummary>(`/finance/producers/${producerId}/account`)
}

/**
 * 2. Obter Subcontas Financeiras por Evento
 */
export async function getProducerEventsBalances(producerId: number = 1): Promise<{ ok: boolean; producerId: number; subaccounts: EventFinancialAccount[] }> {
  return request<{ ok: boolean; producerId: number; subaccounts: EventFinancialAccount[] }>(`/finance/producers/${producerId}/events/balances`)
}

/**
 * 3. Obter Detalhes da Subconta de um Evento
 */
export async function getEventFinancialAccount(eventId: number): Promise<{ ok: boolean; account: any }> {
  return request<{ ok: boolean; account: any }>(`/finance/events/${eventId}/account`)
}

/**
 * 4. Obter Ledger / Extrato de Transações do Evento
 */
export async function getEventLedger(eventId: number): Promise<{ ok: boolean; eventId: number; transactions: any[]; transfers: InternalTransferRecord[] }> {
  return request<{ ok: boolean; eventId: number; transactions: any[]; transfers: InternalTransferRecord[] }>(`/finance/events/${eventId}/ledger`)
}

/**
 * 5. Listar Transferências Internas
 */
export async function getInternalTransfers(params?: {
  producerId?: number
  sourceEventId?: number
  destinationEventId?: number
  status?: string
}): Promise<{ ok: boolean; transfers: InternalTransferRecord[]; count: number }> {
  const query = new URLSearchParams()
  if (params?.producerId) query.set('producerId', String(params.producerId))
  if (params?.sourceEventId) query.set('sourceEventId', String(params.sourceEventId))
  if (params?.destinationEventId) query.set('destinationEventId', String(params.destinationEventId))
  if (params?.status) query.set('status', params.status)
  const qs = query.toString() ? `?${query.toString()}` : ''
  return request<{ ok: boolean; transfers: InternalTransferRecord[]; count: number }>(`/finance/internal-transfers${qs}`)
}

/**
 * 6. Simular / Pré-visualizar Impacto da Transferência (Validação de Invariante & Partidas Dobradas)
 */
export async function previewInternalTransfer(payload: PreviewTransferPayload): Promise<TransferPreviewResult> {
  return request<TransferPreviewResult>('/finance/internal-transfers/preview', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * 7. Executar Transferência entre Eventos com Idempotência
 */
export async function createInternalTransfer(payload: CreateTransferPayload): Promise<{
  ok: boolean
  idempotent: boolean
  transfer: InternalTransferRecord
  message: string
}> {
  return request<{
    ok: boolean
    idempotent: boolean
    transfer: InternalTransferRecord
    message: string
  }>('/finance/internal-transfers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * 8. Obter Comprovante de Transferência
 */
export async function getInternalTransferVoucher(transferId: string): Promise<{ ok: boolean; transfer: InternalTransferRecord }> {
  return request<{ ok: boolean; transfer: InternalTransferRecord }>(`/finance/internal-transfers/${transferId}`)
}

/**
 * 9. Estornar Transferência Realizada (Lançamentos Inversos)
 */
export async function reverseInternalTransfer(transferId: string, reason: string): Promise<{
  ok: boolean
  transfer: InternalTransferRecord
  message: string
}> {
  return request<{
    ok: boolean
    transfer: InternalTransferRecord
    message: string
  }>(`/finance/internal-transfers/${transferId}/reverse`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}
