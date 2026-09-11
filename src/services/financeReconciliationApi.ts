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

export type DivergenceStatus =
  | 'CONCILIADO'
  | 'VALOR_DIVERGENTE'
  | 'TAXA_DIVERGENTE'
  | 'LIQUIDACAO_AUSENTE'
  | 'PEDIDO_NAO_LOCALIZADO'
  | 'DUPLICIDADE'
  | 'ESTORNO'
  | 'CHARGEBACK'
  | 'REQUER_ANALISE'

export interface ReconciliationLevel1 {
  status: 'ok' | 'divergent' | 'missing' | 'duplicate'
  label: string
  details: string
}

export interface ReconciliationLevel2 {
  status: 'ok' | 'divergent_fee' | 'missing_liquidation' | 'refunded' | 'chargeback' | 'pending'
  label: string
  details: string
  expectedDate: string
  settledDate?: string
}

export interface ReconciliationLevel3 {
  status: 'posted' | 'pending_settlement' | 'held' | 'reversed'
  label: string
  ledgerBatchId?: string
  accountsDebited: string[]
  accountsCredited: string[]
}

export interface ReconciliationTransaction {
  id: string
  code: string
  eventId: number
  eventTitle: string
  producerId: number
  orderId?: number
  orderCode?: string
  buyerName: string
  buyerDocument: string
  paymentMethod: 'pix' | 'credit_card' | 'credit_card_installments' | 'debit_card' | 'boleto'
  paymentMethodLabel: string
  installments: number
  occurredAt: string
  gateway: string
  acquirer: string
  tid: string
  nsu: string
  authorizationCode: string
  bankAccount: string
  orderGrossCents: number
  gatewayGrossCents: number
  contractedMdrPct: number
  contractedFeeCents: number
  chargedMdrPct: number
  chargedFeeCents: number
  feeDifferenceCents: number
  anticipationFeeCents: number
  netLiquidCents: number
  splitDiskIngressosCents: number
  splitProducerNetCents: number
  level1OrderGateway: ReconciliationLevel1
  level2GatewaySettlement: ReconciliationLevel2
  level3SettlementLedger: ReconciliationLevel3
  status: DivergenceStatus
  statusLabel: string
  divergenceReason?: string
  divergenceSuggestion?: string
  auditNotes?: string
  reconciledAt?: string
  reconciledBy?: string
}

export interface ReconciliationSummaryIndicators {
  globalReconciliationPct: number
  level1OrderGatewayPct: number
  level2GatewaySettlementPct: number
  level3SettlementLedgerPct: number
  totalReconciledCents: number
  pendingSettlementCents: number
  activeDivergencesCount: number
  activeDivergencesCents: number
  excessMdrFeesCents: number
  totalItemsCount: number
  divergencesByType: Record<string, number>
}

export interface ReconciliationSummaryResponse {
  ok: boolean
  indicators: ReconciliationSummaryIndicators
}

export interface ReconciliationTransactionsResponse {
  ok: boolean
  total: number
  items: ReconciliationTransaction[]
}

export interface ReconciliationFilters {
  eventId?: number
  bankName?: string
  status?: string
  paymentMethod?: string
  gateway?: string
  search?: string
}

export interface AutoMatchPayload {
  eventId?: number
  toleranceCents?: number
}

export interface AutoMatchResponse {
  ok: boolean
  summary: {
    processedCount: number
    matchedCount: number
    flaggedDivergencesCount: number
    ledgerBatchesPostedCount: number
    ledgerBatchesPosted: string[]
  }
  message: string
}

export interface ResolveDivergencePayload {
  transactionId: string
  action: 'adjust_mdr' | 'manual_match' | 'force_settlement' | 'ignore_false_positive' | 'trigger_chargeback_hold'
  notes?: string
  adjustedMdrPct?: number
  orderId?: number
  orderCode?: string
}

export interface SettleToLedgerPayload {
  transactionId: string
  bankAccountId?: number
}

export interface AuditVoucher {
  code: string
  digitalHash: string
  issuedAt: string
  producer: {
    id: number
    name: string
    document: string
  }
  event: {
    id: number
    title: string
  }
  order: {
    orderId?: number
    orderCode: string
    buyerName: string
    buyerDocument: string
  }
  gateway: {
    name: string
    acquirer: string
    tid: string
    nsu: string
    authorizationCode: string
    bankAccount: string
  }
  financials: {
    orderGrossCents: number
    gatewayGrossCents: number
    contractedMdrPct: number
    contractedFeeCents: number
    chargedMdrPct: number
    chargedFeeCents: number
    feeDifferenceCents: number
    anticipationFeeCents: number
    netLiquidCents: number
    splitDiskIngressosCents: number
    splitProducerNetCents: number
  }
  levelsAudit: {
    level1: ReconciliationLevel1
    level2: ReconciliationLevel2
    level3: ReconciliationLevel3
  }
  reconciliationStatus: DivergenceStatus
  reconciledAt?: string
  reconciledBy?: string
  auditNotes?: string
  ledgerBatchId?: string
  doubleEntries: Array<{
    side: 'DÉBITO' | 'CRÉDITO'
    account: string
    amountCents: number
    nature: string
  }>
}

export interface AuditVoucherResponse {
  ok: boolean
  voucher: AuditVoucher
}

// =========================================================================
// API CLIENT
// =========================================================================

export async function fetchReconciliationSummary(
  params: { eventId?: number; bankName?: string } = {}
): Promise<ReconciliationSummaryResponse> {
  const query = new URLSearchParams()
  if (params.eventId) query.append('eventId', String(params.eventId))
  if (params.bankName) query.append('bankName', params.bankName)
  const qs = query.toString() ? `?${query.toString()}` : ''
  return request<ReconciliationSummaryResponse>(`/finance/reconciliation/summary${qs}`)
}

export async function fetchReconciliationTransactions(
  filters: ReconciliationFilters = {}
): Promise<ReconciliationTransactionsResponse> {
  const query = new URLSearchParams()
  if (filters.eventId) query.append('eventId', String(filters.eventId))
  if (filters.bankName) query.append('bankName', filters.bankName)
  if (filters.status) query.append('status', filters.status)
  if (filters.paymentMethod) query.append('paymentMethod', filters.paymentMethod)
  if (filters.gateway) query.append('gateway', filters.gateway)
  if (filters.search) query.append('search', filters.search)
  const qs = query.toString() ? `?${query.toString()}` : ''
  return request<ReconciliationTransactionsResponse>(`/finance/reconciliation/transactions${qs}`)
}

export async function runAutoMatching(payload: AutoMatchPayload = {}): Promise<AutoMatchResponse> {
  return request<AutoMatchResponse>('/finance/reconciliation/auto-match', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function resolveDivergence(payload: ResolveDivergencePayload): Promise<{ ok: boolean; item: ReconciliationTransaction; message: string }> {
  return request<{ ok: boolean; item: ReconciliationTransaction; message: string }>('/finance/reconciliation/resolve-divergence', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function settleToLedger(payload: SettleToLedgerPayload): Promise<{ ok: boolean; batchId: string; item: ReconciliationTransaction; message: string }> {
  return request<{ ok: boolean; batchId: string; item: ReconciliationTransaction; message: string }>('/finance/reconciliation/settle-to-ledger', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchAuditVoucher(transactionId: string): Promise<AuditVoucherResponse> {
  return request<AuditVoucherResponse>(`/finance/reconciliation/audit-voucher/${encodeURIComponent(transactionId)}`)
}

export const DEFAULT_RECONCILIATION_TRANSACTIONS: ReconciliationTransaction[] = [
  {
    id: 'rec-001',
    code: 'REC-2026-90410',
    eventId: 1,
    eventTitle: 'Festival de Verão 2026',
    producerId: 1,
    orderId: 10420,
    orderCode: 'DI-894200',
    buyerName: 'Carolina Silveira Mendes',
    buyerDocument: '***.451.989-**',
    paymentMethod: 'pix',
    paymentMethodLabel: 'PIX Instantâneo',
    installments: 1,
    occurredAt: '2026-09-08T14:32:10Z',
    gateway: 'Banco Central PIX / Itaú',
    acquirer: 'Itaú Unibanco S.A.',
    tid: 'PIX-E20260908143210984210',
    nsu: '984210',
    authorizationCode: 'AUTH-99321',
    bankAccount: 'Banco Santander Ag 0033 CC 98765-4',
    orderGrossCents: 25000,
    gatewayGrossCents: 25000,
    contractedMdrPct: 0.99,
    contractedFeeCents: 248,
    chargedMdrPct: 0.99,
    chargedFeeCents: 248,
    feeDifferenceCents: 0,
    anticipationFeeCents: 0,
    netLiquidCents: 24752,
    splitDiskIngressosCents: 2000,
    splitProducerNetCents: 22752,
    level1OrderGateway: {
      status: 'ok',
      label: 'Batimento 100%',
      details: 'Valor do pedido R$ 250,00 idêntico à cobrança Pix e webhook processado.',
    },
    level2GatewaySettlement: {
      status: 'ok',
      label: 'Liquidado D+0',
      details: 'Compensação instantânea creditada no Itaú com taxa contratual de 0,99%.',
      expectedDate: '2026-09-08',
      settledDate: '2026-09-08T14:32:15Z',
    },
    level3SettlementLedger: {
      status: 'posted',
      label: 'Contabilizado',
      ledgerBatchId: 'b4a5d3c2-1111-4444-9999-000000000001',
      accountsDebited: ['1.1.1.02 Banco Itaú Disponível', '4.1.2.01 Taxas Gateway PIX'],
      accountsCredited: ['1.1.2.03 Recebíveis a Liquidar PIX'],
    },
    status: 'CONCILIADO',
    statusLabel: 'Conciliado',
    reconciledAt: '2026-09-08T14:35:00Z',
    reconciledBy: 'Motor Automático SafeSaff ERP',
  },
  {
    id: 'rec-002',
    code: 'REC-2026-90411',
    eventId: 1,
    eventTitle: 'Festival de Verão 2026',
    producerId: 1,
    orderId: 10421,
    orderCode: 'DI-894562',
    buyerName: 'Rafael Gomes Albuquerque',
    buyerDocument: '***.812.334-**',
    paymentMethod: 'credit_card',
    paymentMethodLabel: 'Cartão de Crédito 1x',
    installments: 1,
    occurredAt: '2026-09-07T11:20:00Z',
    gateway: 'Stone Pagamentos',
    acquirer: 'Stone Instituição de Pagamento S.A.',
    tid: 'STN-TX-9988412-A',
    nsu: '782914',
    authorizationCode: 'AUTH-77123',
    bankAccount: 'Banco Santander Ag 0033 CC 98765-4',
    orderGrossCents: 35000,
    gatewayGrossCents: 33000,
    contractedMdrPct: 2.49,
    contractedFeeCents: 871,
    chargedMdrPct: 2.49,
    chargedFeeCents: 822,
    feeDifferenceCents: 0,
    anticipationFeeCents: 0,
    netLiquidCents: 32178,
    splitDiskIngressosCents: 2640,
    splitProducerNetCents: 29538,
    level1OrderGateway: {
      status: 'divergent',
      label: 'Valor Incompatível (R$ 20,00)',
      details: 'Pedido registrado por R$ 350,00, porém valor cobrado no gateway Stone foi R$ 330,00 (cupom PROMO20 aplicado sem webhook de ajuste).',
    },
    level2GatewaySettlement: {
      status: 'ok',
      label: 'Aguardando D+30',
      details: 'Liquidação da Stone programada com base no valor transacionado de R$ 330,00.',
      expectedDate: '2026-10-07',
    },
    level3SettlementLedger: {
      status: 'pending_settlement',
      label: 'Bloqueado por Divergência',
      accountsDebited: [],
      accountsCredited: [],
    },
    status: 'VALOR_DIVERGENTE',
    statusLabel: 'Valor divergente',
    divergenceReason: 'Diferença de R$ 20,00 entre pedido do DiskIngressos e transação da Stone.',
    divergenceSuggestion: 'Ajustar cupom promocional no pedido #DI-894562 ou debitar saldo complementar.',
  },
  {
    id: 'rec-003',
    code: 'REC-2026-90412',
    eventId: 1,
    eventTitle: 'Festival de Verão 2026',
    producerId: 1,
    orderId: 10422,
    orderCode: 'DI-894819',
    buyerName: 'Mariana Duarte Souza',
    buyerDocument: '***.219.870-**',
    paymentMethod: 'credit_card',
    paymentMethodLabel: 'Cartão de Crédito 1x',
    installments: 1,
    occurredAt: '2026-09-06T18:45:12Z',
    gateway: 'Stone Pagamentos',
    acquirer: 'Stone Instituição de Pagamento S.A.',
    tid: 'STN-TX-7744119-B',
    nsu: '665128',
    authorizationCode: 'AUTH-55412',
    bankAccount: 'Banco Santander Ag 0033 CC 98765-4',
    orderGrossCents: 120000,
    gatewayGrossCents: 120000,
    contractedMdrPct: 2.49,
    contractedFeeCents: 2988,
    chargedMdrPct: 4.15,
    chargedFeeCents: 4980,
    feeDifferenceCents: 1992,
    anticipationFeeCents: 0,
    netLiquidCents: 115020,
    splitDiskIngressosCents: 9600,
    splitProducerNetCents: 105420,
    level1OrderGateway: {
      status: 'ok',
      label: 'Batimento 100%',
      details: 'Pedido e gateway batem perfeitamente em R$ 1.200,00.',
    },
    level2GatewaySettlement: {
      status: 'divergent_fee',
      label: 'Taxa Cobrada a Maior (R$ 19,92)',
      details: 'Contratado: 2,49% (R$ 29,88) · Cobrado no extrato Stone: 4,15% (R$ 49,80). Diferença retida indevidamente.',
      expectedDate: '2026-10-06',
    },
    level3SettlementLedger: {
      status: 'pending_settlement',
      label: 'Aguardando Contestação MDR',
      accountsDebited: [],
      accountsCredited: [],
    },
    status: 'TAXA_DIVERGENTE',
    statusLabel: 'Taxa divergente',
    divergenceReason: 'Adquirente Stone aplicou taxa balcão de 4,15% em vez da taxa contratada DiskIngressos de 2,49%.',
    divergenceSuggestion: 'Abrir contestação automática de MDR com protocolo Stone e compensar R$ 19,92 no Ledger.',
  },
  {
    id: 'rec-004',
    code: 'REC-2026-90413',
    eventId: 2,
    eventTitle: 'Symphony Rock Live',
    producerId: 1,
    orderId: 10423,
    orderCode: 'DI-893112',
    buyerName: 'Felipe Santana Barreto',
    buyerDocument: '***.632.118-**',
    paymentMethod: 'credit_card_installments',
    paymentMethodLabel: 'Cartão de Crédito 3x',
    installments: 3,
    occurredAt: '2026-08-01T10:14:00Z',
    gateway: 'Cielo E-commerce',
    acquirer: 'Cielo S.A.',
    tid: 'CIE-998823104-Z',
    nsu: '551982',
    authorizationCode: 'AUTH-12093',
    bankAccount: 'Banco Santander Ag 0033 CC 98765-4',
    orderGrossCents: 185000,
    gatewayGrossCents: 185000,
    contractedMdrPct: 3.89,
    contractedFeeCents: 7196,
    chargedMdrPct: 3.89,
    chargedFeeCents: 7196,
    feeDifferenceCents: 0,
    anticipationFeeCents: 0,
    netLiquidCents: 177804,
    splitDiskIngressosCents: 14800,
    splitProducerNetCents: 163004,
    level1OrderGateway: {
      status: 'ok',
      label: 'Batimento 100%',
      details: 'Pedido R$ 1.850,00 validado com código de autorização Cielo.',
    },
    level2GatewaySettlement: {
      status: 'missing_liquidation',
      label: 'Liquidação em Atraso (Venceu 02/09)',
      details: 'Data limite de liquidação D+30 era 02/09/2026. Lançamento não localizado no extrato bancário Santander.',
      expectedDate: '2026-09-02',
    },
    level3SettlementLedger: {
      status: 'pending_settlement',
      label: 'Saldo Não Liberado',
      accountsDebited: [],
      accountsCredited: [],
    },
    status: 'LIQUIDACAO_AUSENTE',
    statusLabel: 'Liquidação ausente',
    divergenceReason: 'Atraso de 7 dias na liquidação bancária pela Cielo.',
    divergenceSuggestion: 'Cobrar liquidação junto ao gerente de conta Cielo ou verificar trava de domicílio bancário.',
  },
  {
    id: 'rec-005',
    code: 'REC-2026-90414',
    eventId: 1,
    eventTitle: 'Festival de Verão 2026',
    producerId: 1,
    buyerName: 'Comprador Não Identificado (PDV)',
    buyerDocument: '***.***.***-**',
    paymentMethod: 'debit_card',
    paymentMethodLabel: 'Cartão de Débito (POS Rede)',
    installments: 1,
    occurredAt: '2026-09-08T22:15:33Z',
    gateway: 'Rede Adquirente',
    acquirer: 'Redecard S.A.',
    tid: 'RED-POS-449102-K',
    nsu: '9841235',
    authorizationCode: 'AUTH-33491',
    bankAccount: 'Banco Santander Ag 0033 CC 98765-4',
    orderGrossCents: 0,
    gatewayGrossCents: 45000,
    contractedMdrPct: 1.49,
    contractedFeeCents: 670,
    chargedMdrPct: 1.49,
    chargedFeeCents: 670,
    feeDifferenceCents: 0,
    anticipationFeeCents: 0,
    netLiquidCents: 44330,
    splitDiskIngressosCents: 0,
    splitProducerNetCents: 44330,
    level1OrderGateway: {
      status: 'missing',
      label: 'Pedido Não Localizado',
      details: 'Cobrança de R$ 450,00 aprovada na maquininha POS Rede, mas nenhum pedido correspondente no DiskIngressos.',
    },
    level2GatewaySettlement: {
      status: 'ok',
      label: 'Liquidado D+1',
      details: 'Crédito já liquidado na conta Santander.',
      expectedDate: '2026-09-09',
      settledDate: '2026-09-09T08:00:00Z',
    },
    level3SettlementLedger: {
      status: 'held',
      label: 'Conta Transitória de Sobras',
      accountsDebited: ['1.1.1.01 Santander Movimento'],
      accountsCredited: ['2.1.9.01 Valores Pendentes de Conciliação'],
    },
    status: 'PEDIDO_NAO_LOCALIZADO',
    statusLabel: 'Pedido não localizado',
    divergenceReason: 'Venda de balcão/portaria processada na maquineta sem conclusão no sistema de bilheteria.',
    divergenceSuggestion: 'Associar manualmente ao relatório de vendas de contingência da portaria ou emitir voucher retroativo.',
  }
]

export const DEFAULT_RECONCILIATION_SUMMARY: ReconciliationSummaryIndicators = {
  globalReconciliationPct: 98.4,
  level1OrderGatewayPct: 99.4,
  level2GatewaySettlementPct: 97.8,
  level3SettlementLedgerPct: 98.9,
  totalReconciledCents: 142865000,
  pendingSettlementCents: 38420000,
  activeDivergencesCount: 5,
  activeDivergencesCents: 1485000,
  excessMdrFeesCents: 1992,
  totalItemsCount: 12,
  divergencesByType: {
    CONCILIADO: 7,
    VALOR_DIVERGENTE: 1,
    TAXA_DIVERGENTE: 1,
    LIQUIDACAO_AUSENTE: 1,
    PEDIDO_NAO_LOCALIZADO: 1,
    DUPLICIDADE: 1,
    ESTORNO: 1,
    CHARGEBACK: 1,
    REQUER_ANALISE: 1,
  },
}

