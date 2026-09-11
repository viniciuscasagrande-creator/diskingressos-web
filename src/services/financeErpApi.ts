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

// =========================================================================
// TIPOS - FASE 26.17.9.4.4: FLUXO DE CAIXA, DRE GERENCIAL & CONSOLIDADO
// =========================================================================

export interface CashflowTimelinePoint {
  date: string
  label: string
  isPast: boolean
  realizedEntryCents: number
  realizedExitCents: number
  projectedEntryCents: number
  projectedExitCents: number
  realizedBalanceCents: number | null
  projectedBalanceCents: number
}

export interface CashflowProjectionResponse {
  ok: boolean
  producerId: number
  eventId?: number
  period: string
  regime: 'caixa' | 'competencia'
  kpis: {
    initialBalanceCents: number
    realizedEntriesCents: number
    realizedExitsCents: number
    currentBalanceCents: number
    receivablesCents: number
    payablesCents: number
    projectedBalanceCents: number
    netCashflowCents: number
    netProjectedCashflowCents: number
  }
  timeline: CashflowTimelinePoint[]
}

export interface CashflowCalendarItem {
  type: 'in' | 'out'
  title: string
  category: string
  amountCents: number
  status: string
}

export interface CashflowCalendarDay {
  date: string
  day: number
  totalInCents: number
  totalOutCents: number
  netCents: number
  itemsCount: number
  items: CashflowCalendarItem[]
}

export interface CashflowCalendarResponse {
  ok: boolean
  year: number
  month: number
  monthLabel: string
  totalMonthInCents: number
  totalMonthOutCents: number
  days: CashflowCalendarDay[]
}

export interface DreDrilldownItem {
  account: string
  amountCents: number
  ref: string
}

export interface DreGroupItem {
  code: string
  title: string
  type: 'revenue' | 'deduction' | 'subtotal' | 'cost' | 'expense' | 'total'
  budgetedCents: number
  realizedCents: number
  committedCents: number
  projectedCents: number
  deviationCents: number
  deviationPct: number
  isExceeded: boolean
  alert?: string | null
  children?: Array<{
    code: string
    title: string
    budgetedCents: number
    realizedCents: number
    committedCents: number
    projectedCents: number
    drilldown: DreDrilldownItem[]
  }>
}

export interface DreManagerialResponse {
  ok: boolean
  eventId: number
  eventTitle: string
  regime: 'caixa' | 'competencia'
  dreTree: DreGroupItem[]
  budgetOverrunAlerts: Array<{ code: string; title: string; deviationPct: number; alert: string }>
  unitMetrics: {
    revenuePerTicketCents: number
    costPerTicketCents: number
    marginPerTicketCents: number
    roas: number
    cacCents: number | null
    ticketsSold: number
    totalCapacity: number
    occupancyPct: number
  }
  breakEven: {
    fixedCostsCents: number
    variableCostPerTicketCents: number
    avgTicketPriceCents: number
    contributionMarginPerTicketCents: number
    breakEvenTickets: number
    ticketsSold: number
    breakEvenCents: number
    safetyMarginPct: number
    isBreakEvenReached: boolean
  }
}

export interface ProducerConsolidatedEventItem {
  eventId: number
  title: string
  code: string
  revenueCents: number
  costsCents: number
  resultCents: number
  marginPct: number
  balanceCents: number
  payablesCents: number
  receivablesCents: number
  ticketsSold: number
  occupancy: number
  status: 'lucrativo' | 'deficitario'
}

export interface ProducerConsolidatedResultResponse {
  ok: boolean
  producer: {
    id: number
    name: string
    document: string
  }
  summary: {
    totalRevenueCents: number
    totalCostsCents: number
    operatingResultCents: number
    marginPct: number
    availableBalanceCents: number
    receivablesCents: number
    payablesCents: number
    projectedBalanceCents: number
    internalTransfersEliminatedCents: number
    eventsCount: number
    profitableEventsCount: number
    deficitEventsCount: number
  }
  events: ProducerConsolidatedEventItem[]
}

export interface FinancialClosingResponse {
  ok: boolean
  eventId: number
  status: 'fechado' | 'aberto'
  closedAt?: string | null
  closedBy?: string | null
  notes?: string
  message: string
}

export interface BorderoBatch {
  name: string
  priceCents: number
  issued: number
  sold: number
  courtesy: number
  refunded: number
  totalGrossCents: number
}

export interface BorderoSigner {
  name: string
  role: string
  signed: boolean
}

export interface BorderoOfficialResponse {
  ok: boolean
  bordero: {
    code: string
    event: {
      id: number
      title: string
      venue: string
      date: string
      city: string
    }
    producer: {
      id: number
      name: string
      document: string
    }
    issuanceDate: string
    digitalHash: string
    batches: BorderoBatch[]
    financialTotals: {
      grossTicketSalesCents: number
      platformFeeCents: number
      discountsCents: number
      refundsCents: number
      taxesCents: number
      netTicketRevenueCents: number
      productionCostsCents: number
      operationalExpensesCents: number
      payoutsExecutedCents: number
      netEventResultCents: number
      finalEventBalanceCents: number
    }
    signers: BorderoSigner[]
  }
}

// --- FLUXO DE CAIXA: PROJEÇÃO & CALENDÁRIO ---
export async function getCashflowProjection(params?: {
  producerId?: number
  eventId?: number
  period?: string
  regime?: string
}): Promise<CashflowProjectionResponse> {
  const query = new URLSearchParams()
  if (params?.producerId) query.set('producerId', String(params.producerId))
  if (params?.eventId) query.set('eventId', String(params.eventId))
  if (params?.period) query.set('period', params.period)
  if (params?.regime) query.set('regime', params.regime)
  const qs = query.toString() ? `?${query.toString()}` : ''
  return request<CashflowProjectionResponse>(`/finance/cashflow/projection${qs}`)
}

export async function getCashflowCalendar(params?: {
  producerId?: number
  eventId?: number
  month?: number
  year?: number
}): Promise<CashflowCalendarResponse> {
  const query = new URLSearchParams()
  if (params?.producerId) query.set('producerId', String(params.producerId))
  if (params?.eventId) query.set('eventId', String(params.eventId))
  if (params?.month) query.set('month', String(params.month))
  if (params?.year) query.set('year', String(params.year))
  const qs = query.toString() ? `?${query.toString()}` : ''
  return request<CashflowCalendarResponse>(`/finance/cashflow/calendar${qs}`)
}

// --- DRE GERENCIAL DO EVENTO ---
export async function getEventDreManagerial(
  eventId: number,
  regime: 'caixa' | 'competencia' = 'competencia'
): Promise<DreManagerialResponse> {
  return request<DreManagerialResponse>(`/events/${eventId}/dre-managerial?regime=${regime}`)
}

// --- RESULTADO CONSOLIDADO DO PRODUTOR ---
export async function getProducerConsolidatedResult(params?: {
  producerId?: number
}): Promise<ProducerConsolidatedResultResponse> {
  const query = new URLSearchParams()
  if (params?.producerId) query.set('producerId', String(params.producerId))
  const qs = query.toString() ? `?${query.toString()}` : ''
  return request<ProducerConsolidatedResultResponse>(`/finance/producer-consolidated-result${qs}`)
}

// --- FECHAMENTO FINANCEIRO DO EVENTO ---
export async function closeEventFinances(
  eventId: number,
  payload: { action?: 'close' | 'reopen'; notes?: string; checklist?: Record<string, boolean> }
): Promise<FinancialClosingResponse> {
  return request<FinancialClosingResponse>(`/events/${eventId}/financial-closing`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// --- BORDERÔ OFICIAL ---
export async function getEventBorderoOfficial(eventId: number): Promise<BorderoOfficialResponse> {
  return request<BorderoOfficialResponse>(`/events/${eventId}/bordero-official`)
}

