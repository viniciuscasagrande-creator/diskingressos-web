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
    const err: any = new Error(data.message || `Erro na requisição (${r.status})`)
    err.status = r.status
    err.data = data
    throw err
  }
  return data as T
}

// =========================================================================
// TIPOS - CONTAS A PAGAR
// =========================================================================
export interface PayableItem {
  id: number
  code: string
  description: string
  vendor: string
  responsible: string
  eventId: number | null
  eventTitle: string
  costCenterId?: number | null
  costCenterName: string
  category: string
  competence: string
  dueDate: string
  paidAt?: string | null
  amountCents: number
  paymentMethod: string
  documentRef?: string
  notes?: string
  status: 'rascunho' | 'aguardando_aprovacao' | 'agendado' | 'pago' | 'vencido' | 'cancelado' | 'estornado'
  approvalTier: 'DIRECT' | 'FINANCE' | 'EXECUTIVE'
  approvedBy?: string | null
  approvedAt?: string | null
}

export interface PayablesResponse {
  ok: boolean
  kpis: {
    totalToPayCents: number
    dueTodayCents: number
    next7DaysCents: number
    overdueCents: number
    paidPeriodCents: number
    count: number
  }
  payables: PayableItem[]
}

export interface CreatePayablePayload {
  producerId?: number
  eventId?: number
  description: string
  vendor: string
  costCenterId?: number
  costCenterName?: string
  category: string
  competence?: string
  dueDate: string
  amountCents: number
  paymentMethod?: string
  documentRef?: string
  notes?: string
}

// =========================================================================
// TIPOS - CONTAS A RECEBER
// =========================================================================
export interface OrderTrace {
  orderId: number
  orderCode: string
  client: string
  grossCents: number
  gatewayFeeCents: number
  producerSplitCents: number
  diskSplitCents: number
  settlementStatus: string
}

export interface ReceivableItem {
  id: string
  code: string
  origin: 'automatico' | 'manual'
  originLabel: string
  title: string
  client: string
  clientEmail?: string
  eventTitle: string
  eventId?: number | null
  method: string
  saleDate: string
  dueDate: string
  dueDateRaw?: string | Date
  grossAmountCents: number
  netAmountCents: number
  status: 'previsto' | 'processando' | 'a_liquidar' | 'liquidado' | 'parcial' | 'vencido' | 'cancelado' | 'estornado' | 'em_disputa'
  statusLabel: string
  orderId?: number | null
  orderCode?: string
  orderTrace?: OrderTrace
}

export interface ReceivablesResponse {
  ok: boolean
  kpis: {
    totalReceivableCents: number
    todayCents: number
    next7DaysCents: number
    next30DaysCents: number
    overdueCents: number
    settledCents: number
    count: number
  }
  receivables: ReceivableItem[]
}

// =========================================================================
// TIPOS - CENTRO DE CUSTOS & ORÇAMENTO
// =========================================================================
export interface CostCenterNode {
  id?: number
  code: string
  name: string
  type?: string
  parentId?: number | null
  children?: CostCenterNode[]
}

export interface CostCentersResponse {
  ok: boolean
  eventId: number
  eventTitle: string
  costCenters: CostCenterNode[]
}

export interface BudgetCategoryAnalysis {
  category: string
  budgetedCents: number
  committedCents: number
  realizedCents: number
  balanceCents: number
  isExceeded: boolean
  exceededCents: number
  warningMessage?: string | null
}

export interface EventBudgetResponse {
  ok: boolean
  eventId: number
  eventTitle: string
  summary: {
    totalBudgetedCents: number
    totalCommittedCents: number
    totalRealizedCents: number
    totalBalanceCents: number
    exceededItemsCount: number
  }
  categories: BudgetCategoryAnalysis[]
}

export interface EventFinancialResultResponse {
  ok: boolean
  eventId: number
  eventTitle: string
  dre: {
    grossRevenueCents: number
    refundsCents: number
    feesCents: number
    taxesCents: number
    eventCostsCents: number
    operatingResultCents: number
    isProfitable: boolean
  }
  indicators: {
    currentMarginPct: number
    projectedMarginPct: number
    breakEvenCents: number
    breakEvenTickets: number
    avgTicketCents: number
  }
}

// =========================================================================
// FUNÇÕES DE SERVIÇO
// =========================================================================

// --- CONTAS A PAGAR ---
export async function getFinancePayables(params?: {
  producerId?: number
  eventId?: number
  status?: string
  costCenterId?: number
}): Promise<PayablesResponse> {
  const query = new URLSearchParams()
  if (params?.producerId) query.set('producerId', String(params.producerId))
  if (params?.eventId) query.set('eventId', String(params.eventId))
  if (params?.status) query.set('status', params.status)
  if (params?.costCenterId) query.set('costCenterId', String(params.costCenterId))
  const qs = query.toString() ? `?${query.toString()}` : ''
  return request<PayablesResponse>(`/finance/payables${qs}`)
}

export async function createFinancePayable(payload: CreatePayablePayload): Promise<{ ok: boolean; payable: PayableItem; message: string }> {
  return request<{ ok: boolean; payable: PayableItem; message: string }>('/finance/payables', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function payFinancePayable(
  payableId: number,
  options?: { sourceTransferEventId?: number; transferAmountCents?: number }
): Promise<{ ok: boolean; payable?: PayableItem; transferredPriorToPayment?: boolean; message: string }> {
  return request<{ ok: boolean; payable?: PayableItem; transferredPriorToPayment?: boolean; message: string }>(
    `/finance/payables/${payableId}/pay`,
    {
      method: 'POST',
      body: JSON.stringify(options || {}),
    }
  )
}

// --- CONTAS A RECEBER ---
export async function getFinanceReceivables(params?: {
  producerId?: number
  eventId?: number
  status?: string
  origin?: 'automatico' | 'manual' | 'all'
}): Promise<ReceivablesResponse> {
  const query = new URLSearchParams()
  if (params?.producerId) query.set('producerId', String(params.producerId))
  if (params?.eventId) query.set('eventId', String(params.eventId))
  if (params?.status) query.set('status', params.status)
  if (params?.origin) query.set('origin', params.origin)
  const qs = query.toString() ? `?${query.toString()}` : ''
  return request<ReceivablesResponse>(`/finance/receivables${qs}`)
}

// --- CENTROS DE CUSTO & ORÇAMENTO POR EVENTO ---
export async function getEventCostCenters(eventId: number): Promise<CostCentersResponse> {
  return request<CostCentersResponse>(`/events/${eventId}/cost-centers`)
}

export async function getEventBudget(eventId: number): Promise<EventBudgetResponse> {
  return request<EventBudgetResponse>(`/events/${eventId}/budget`)
}

export async function getEventFinancialResult(eventId: number): Promise<EventFinancialResultResponse> {
  return request<EventFinancialResultResponse>(`/events/${eventId}/financial-result`)
}
