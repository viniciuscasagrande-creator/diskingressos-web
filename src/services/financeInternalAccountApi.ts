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

export interface InternalAccountProducer {
  id: string | number
  name: string
  cnpj: string
}

export interface InternalAccountPolicy {
  minimumSalesPercent: number
  releasePercent: number
  requireApproval: boolean
  requireSignature: boolean
  refundDualAuthorization: boolean
}

export interface InternalAccountEligibility {
  eligible: boolean
  salesPercent: number
  minimumSalesPercent: number
  releasePercent: number
  grossLimit: number
  reserved: number
  paid: number
  refunds: number
  amortized: number
  availableToRequest: number
}

export interface InternalAccountEvent {
  id: string
  name: string
  salesTarget: number
  sold: number
  salesPercent: number
  reserved: number
  paid: number
  refunds: number
  amortized: number
  creditDebt: number
  eligibility: InternalAccountEligibility
}

export interface InternalAccountLedgerEntry {
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

export interface InternalAccountObligation {
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

export interface InternalAccountCredit {
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

export interface InternalAccountRefundApproval {
  user: string
  at: string
  factor: string
}

export interface InternalAccountRefund {
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
  approvals: InternalAccountRefundApproval[]
  createdAt: string
  executedBy?: string
  executedAt?: string
  rejectedBy?: string
  rejectedAt?: string
}

export interface InternalAccountPayoutRequest {
  id: string
  eventId: string
  value: number
  status: 'EM_ANALISE' | 'APROVADO' | 'REJEITADO' | 'PAGO'
  createdAt: string
  exceptionAuthorization: boolean
  actor: string
}

export interface InternalAccountSummary {
  sold: number
  reserved: number
  outstandingCredits: number
  availableForRepasse: number
  pendingRefunds: number
}

export interface InternalAccountDashboardData {
  producer: InternalAccountProducer
  summary: InternalAccountSummary
  events: InternalAccountEvent[]
  credits: InternalAccountCredit[]
  obligations: InternalAccountObligation[]
  refunds: InternalAccountRefund[]
  ledger: InternalAccountLedgerEntry[]
  requests: InternalAccountPayoutRequest[]
  policy: InternalAccountPolicy
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const customHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-role': 'FINANCEIRO_DISK',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  }

  // Tenta chamar via prefixo /api/interno ou /api/finance/internal-account
  const url = `${API}/interno${path.startsWith('/') ? path : `/${path}`}`

  const r = await fetch(url, {
    ...options,
    headers: customHeaders,
  })

  const data = await r.json().catch(() => ({}))
  if (!r.ok) {
    throw new Error(data.error || data.message || `Erro na operação (${r.status})`)
  }
  return data as T
}

export async function getInternalAccountDashboard(): Promise<InternalAccountDashboardData> {
  return request<InternalAccountDashboardData>('/dashboard')
}

export async function updateInternalAccountPolicy(
  policy: Partial<InternalAccountPolicy>
): Promise<InternalAccountPolicy> {
  return request<InternalAccountPolicy>('/politica', {
    method: 'PUT',
    body: JSON.stringify(policy),
  })
}

export async function createInternalRetention(data: {
  eventId: string
  value: number
  reason: string
  beneficiary?: string
  type?: 'RETENCAO' | 'BLOQUEIO'
}): Promise<InternalAccountLedgerEntry> {
  return request<InternalAccountLedgerEntry>('/retencoes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function createInternalRelease(data: {
  eventId: string
  value: number
  reason: string
}): Promise<InternalAccountLedgerEntry> {
  return request<InternalAccountLedgerEntry>('/liberacoes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function createInternalObligation(data: {
  eventId: string
  category: string
  description: string
  beneficiary?: string
  value: number
  dueDate: string
  reserveNow?: boolean
  status?: string
}): Promise<InternalAccountObligation> {
  return request<InternalAccountObligation>('/obrigacoes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateInternalObligationStatus(
  id: string,
  status: string
): Promise<InternalAccountObligation> {
  return request<InternalAccountObligation>(`/obrigacoes/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function createInternalCredit(data: {
  eventId: string
  principal: number
  interestRate?: number
  installments?: number
  amortization?: 'PERCENTUAL_RECEBIVEIS' | 'PARCELAS_FIXAS' | 'FECHAMENTO_EVENTO'
  receivablePercent?: number
}): Promise<InternalAccountCredit> {
  return request<InternalAccountCredit>('/creditos', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function amortizeInternalCredit(
  id: string,
  value: number
): Promise<InternalAccountCredit> {
  return request<InternalAccountCredit>(`/creditos/${id}/amortizar`, {
    method: 'POST',
    body: JSON.stringify({ value }),
  })
}

export async function recordInternalRevenue(data: {
  eventId: string
  value: number
  reason?: string
}): Promise<{ revenue: number; amortizations: InternalAccountLedgerEntry[] }> {
  return request<{ revenue: number; amortizations: InternalAccountLedgerEntry[] }>('/receitas', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function createInternalRefund(data: {
  eventId: string
  orderId: string
  value: number
  reason: string
}): Promise<InternalAccountRefund> {
  return request<InternalAccountRefund>('/estornos', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function authorizeInternalRefund(
  id: string,
  userName: string,
  factor = 'REAUTENTICACAO_MFA_HOMOLOGADO'
): Promise<InternalAccountRefund> {
  return request<InternalAccountRefund>(`/estornos/${id}/autorizar`, {
    method: 'POST',
    headers: {
      'x-user-name': userName,
    },
    body: JSON.stringify({ factor }),
  })
}

export async function executeInternalRefund(id: string): Promise<InternalAccountRefund> {
  return request<InternalAccountRefund>(`/estornos/${id}/efetivar`, {
    method: 'POST',
  })
}

export async function rejectInternalRefund(id: string): Promise<InternalAccountRefund> {
  return request<InternalAccountRefund>(`/estornos/${id}/rejeitar`, {
    method: 'POST',
  })
}

export async function getEventPayoutEligibility(
  eventId: string
): Promise<InternalAccountEligibility> {
  return request<InternalAccountEligibility>(`/repasses/elegibilidade/${eventId}`)
}

export async function requestEventPayout(data: {
  eventId: string
  value: number
  exceptionAuthorization?: boolean
}): Promise<InternalAccountPayoutRequest> {
  return request<InternalAccountPayoutRequest>('/repasses/solicitacoes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
