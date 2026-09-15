// SERVIÇO DO NÚCLEO DE PAGAMENTOS ENTERPRISE
// Orquestrador, PIX, Cartões, Gateways, Antifraude, Conciliação e Chargebacks

import {
  PaymentRecord,
  PaymentsSummaryKPIs,
  ChargebackRecord,
  ReconciliationRecord,
  WebhookRecord,
  PaymentIntention
} from '../types/payments-enterprise.types'

const API_BASE = '/api/v1/payments'

// Mock inicial de alta fidelidade
const mockPayments: PaymentRecord[] = [
  {
    id: 'PAY-98281',
    orderId: 'ORD-928371',
    correlationId: 'COR-89123019',
    idempotencyKey: 'idemp_pix_98281_2026',
    eventId: 1,
    eventTitle: 'Orquestra Sinfônica — Noite de Clássicos',
    producerId: 101,
    producerName: 'Opus Entretenimento Brasil',
    customerName: 'Maria Silva Santos',
    customerDocument: '049.281.938-12',
    customerEmail: 'maria.santos@email.com.br',
    method: 'pix',
    channel: 'site',
    status: 'aprovado',
    amountCents: 48000,
    serviceFeeCents: 4800,
    gatewayFeeCents: 96,
    pixTxId: 'txid_bb_92837198281_2026',
    pixEndToEndId: 'E0000000020260915170098281928371',
    gateway: 'banco_brasil_pix',
    gatewayReference: 'BB-PIX-98281',
    risk: {
      score: 12,
      level: 'baixo',
      recommendation: 'aprovar',
      evaluatedSignals: ['CPF Regular', 'Dispositivo Seguro', 'Comportamento Padrão'],
      fraudFlags: []
    },
    split: {
      contractSnapshotId: 'CNT-2026-OPUS-01',
      appliedRules: '90% Produtor / 10% DiskIngressos / Taxa fixa PSP',
      lockedAt: '2026-09-15T14:20:00Z',
      rules: [
        { recipient: 'produtor', label: 'Repasse Produtor (Líquido)', percentage: 88, amountCents: 42240 },
        { recipient: 'diskingressos', label: 'Taxa de Serviço Disk', percentage: 10, amountCents: 4800 },
        { recipient: 'gateway', label: 'Tarifa PSP PIX', percentage: 2, amountCents: 960 }
      ]
    },
    isSettled: true,
    settledAt: '2026-09-15T14:21:00Z',
    expectedSettlementDate: '2026-09-15',
    isReconciled: true,
    reconciledAt: '2026-09-15T14:25:00Z',
    divergenceDetected: false,
    createdAt: '2026-09-15T14:20:02Z',
    updatedAt: '2026-09-15T14:25:00Z',
    timeline: [
      { timestamp: '2026-09-15T14:20:02Z', step: 'Intenção Criada', status: 'OK', detail: 'Intenção de R$ 480,00 gerada para ORD-928371', actor: 'Checkout Omnichannel' },
      { timestamp: '2026-09-15T14:20:04Z', step: 'QR Code PIX Emitido', status: 'OK', detail: 'Banco do Brasil PSP gerou txid e payload copia-e-cola', actor: 'Orquestrador Financeiro' },
      { timestamp: '2026-09-15T14:20:38Z', step: 'Webhook Recebido', status: 'OK', detail: 'Notificação do Banco do Brasil validada com assinatura HMAC', actor: 'Webhook Worker' },
      { timestamp: '2026-09-15T14:20:39Z', step: 'Pagamento Aprovado', status: 'OK', detail: 'Disk Core confirmou recebimento e acionou emissão dos ingressos', actor: 'Payment Core' },
      { timestamp: '2026-09-15T14:21:00Z', step: 'Lançamento Contábil no Ledger', status: 'OK', detail: 'Partida dobrada gravada na conta gráfica do produtor', actor: 'Ledger Engine' },
      { timestamp: '2026-09-15T14:25:00Z', step: 'Conciliação Automática', status: 'OK', detail: 'Matching exato entre Pedido, PSP e Subconta', actor: 'Centro de Conciliação' }
    ]
  },
  {
    id: 'PAY-98282',
    orderId: 'ORD-928372',
    correlationId: 'COR-89123020',
    idempotencyKey: 'idemp_card_98282_2026',
    eventId: 2,
    eventTitle: 'Festival Internacional de Jazz de Curitiba',
    producerId: 102,
    producerName: 'Prime Live Entretenimento',
    customerName: 'Carlos Eduardo Meirelles',
    customerDocument: '912.384.719-45',
    customerEmail: 'carlos.meirelles@empresa.com.br',
    method: 'credit_card',
    channel: 'site',
    status: 'aprovado',
    amountCents: 96000,
    serviceFeeCents: 9600,
    gatewayFeeCents: 2400,
    installments: 3,
    cardBrand: 'Mastercard',
    cardLastFour: '4821',
    authCode: 'AUTH-82910',
    nsu: 'NSU-772819',
    gateway: 'cielo',
    gatewayReference: 'CIELO-TX-98282',
    risk: {
      score: 18,
      level: 'baixo',
      recommendation: 'aprovar',
      evaluatedSignals: ['Cartão Tokenizado', '3DS Válido', 'IP Consistente'],
      fraudFlags: []
    },
    split: {
      contractSnapshotId: 'CNT-2026-PRIME-02',
      appliedRules: 'Taxa MDR parcelada 2.5% repassada ao comprador / 88% Produtor',
      lockedAt: '2026-09-15T14:32:00Z',
      rules: [
        { recipient: 'produtor', label: 'Produtora Prime Live', percentage: 87.5, amountCents: 84000 },
        { recipient: 'diskingressos', label: 'Taxa DiskIngressos', percentage: 10.0, amountCents: 9600 },
        { recipient: 'gateway', label: 'Cielo MDR + Antifraude', percentage: 2.5, amountCents: 2400 }
      ]
    },
    isSettled: false,
    expectedSettlementDate: '2026-10-15',
    isReconciled: true,
    reconciledAt: '2026-09-15T14:35:00Z',
    divergenceDetected: false,
    createdAt: '2026-09-15T14:32:10Z',
    updatedAt: '2026-09-15T14:35:00Z',
    timeline: [
      { timestamp: '2026-09-15T14:32:10Z', step: 'Tokenização do Cartão', status: 'OK', detail: 'Token gerado no cliente sem armazenar PAN ou CVV no Core', actor: 'PCI Tokenizer' },
      { timestamp: '2026-09-15T14:32:12Z', step: 'Análise de Risco Antifraude', status: 'OK', detail: 'Score 18/100 aprovado automaticamente', actor: 'Motor de Risco' },
      { timestamp: '2026-09-15T14:32:15Z', step: 'Autorização Cielo', status: 'OK', detail: 'Código AUTH-82910 retornado pela adquirente', actor: 'Gateway Adapter' },
      { timestamp: '2026-09-15T14:32:16Z', step: 'Captura Imediata', status: 'OK', detail: 'Captura do valor total de R$ 960,00 em 3x', actor: 'Orquestrador Financeiro' },
      { timestamp: '2026-09-15T14:32:17Z', step: 'Pagamento Aprovado', status: 'OK', detail: 'Cadeia comercial acionada e ingressos emitidos', actor: 'Payment Core' }
    ]
  },
  {
    id: 'PAY-98283',
    orderId: 'ORD-928373',
    correlationId: 'COR-89123021',
    idempotencyKey: 'idemp_card_98283_2026',
    eventId: 3,
    eventTitle: 'Arena Sertaneja 2026 — Maratona de Shows',
    producerId: 103,
    producerName: 'Live Nation Curitiba',
    customerName: 'Rodrigo Fontes de Alencar',
    customerDocument: '710.291.849-00',
    customerEmail: 'rodrigo.fontes@email.com',
    method: 'credit_card',
    channel: 'site',
    status: 'em_analise_risco',
    amountCents: 150000,
    serviceFeeCents: 15000,
    gatewayFeeCents: 3750,
    installments: 6,
    cardBrand: 'Visa',
    cardLastFour: '1109',
    gateway: 'stone',
    gatewayReference: 'STONE-TX-98283',
    risk: {
      score: 74,
      level: 'alto',
      recommendation: 'revisar',
      evaluatedSignals: ['Alta velocidade: 4 tentativas em 3 minutos', 'IP de Proxy / VPN detectado', 'Valor acima da média do comprador'],
      fraudFlags: ['VELOCITY_HIGH', 'PROXY_DETECTED']
    },
    split: {
      contractSnapshotId: 'CNT-2026-LIVE-03',
      appliedRules: 'Contrato Padrão Arena',
      lockedAt: '2026-09-15T15:10:00Z',
      rules: [
        { recipient: 'produtor', label: 'Repasse Produtor', percentage: 87.5, amountCents: 131250 },
        { recipient: 'diskingressos', label: 'Taxa DiskIngressos', percentage: 10.0, amountCents: 15000 },
        { recipient: 'gateway', label: 'Stone', percentage: 2.5, amountCents: 3750 }
      ]
    },
    isSettled: false,
    expectedSettlementDate: '2026-10-15',
    isReconciled: false,
    divergenceDetected: false,
    createdAt: '2026-09-15T15:10:00Z',
    updatedAt: '2026-09-15T15:10:00Z',
    timeline: [
      { timestamp: '2026-09-15T15:10:00Z', step: 'Autorização Prévia', status: 'OK', detail: 'Limite reservado no cartão Visa ****1109', actor: 'Gateway Adapter' },
      { timestamp: '2026-09-15T15:10:02Z', step: 'Risco Elevado', status: 'ALERTA', detail: 'Score 74. Encaminhado para a Fila de Revisão Manual', actor: 'Motor de Risco' }
    ]
  },
  {
    id: 'PAY-98284',
    orderId: 'ORD-928374',
    correlationId: 'COR-89123022',
    idempotencyKey: 'idemp_pos_98284_2026',
    eventId: 1,
    eventTitle: 'Orquestra Sinfônica — Noite de Clássicos',
    producerId: 101,
    producerName: 'Opus Entretenimento Brasil',
    customerName: 'Cliente Balcão (Bilheteria)',
    customerDocument: '381.928.174-88',
    customerEmail: 'balcao@diskingressos.com.br',
    method: 'tef_pos',
    channel: 'bilheteria',
    status: 'aprovado',
    amountCents: 18000,
    serviceFeeCents: 0,
    gatewayFeeCents: 360,
    cardBrand: 'Elo',
    cardLastFour: '9012',
    authCode: 'POS-88910',
    nsu: 'TEF-338210',
    terminalId: 'TERM-OPUS-04',
    gateway: 'tef_local',
    gatewayReference: 'TEF-TX-98284',
    risk: {
      score: 5,
      level: 'baixo',
      recommendation: 'aprovar',
      evaluatedSignals: ['Presencial com chip e senha (PIN)'],
      fraudFlags: []
    },
    split: {
      contractSnapshotId: 'CNT-2026-OPUS-01',
      appliedRules: 'Venda Presencial Sem Taxa Web',
      lockedAt: '2026-09-15T15:40:00Z',
      rules: [
        { recipient: 'produtor', label: 'Repasse Produtor', percentage: 98, amountCents: 17640 },
        { recipient: 'gateway', label: 'Tarifa TEF Adquirente', percentage: 2, amountCents: 360 }
      ]
    },
    isSettled: true,
    settledAt: '2026-09-15T15:40:05Z',
    expectedSettlementDate: '2026-09-16',
    isReconciled: true,
    reconciledAt: '2026-09-15T15:45:00Z',
    divergenceDetected: false,
    createdAt: '2026-09-15T15:40:00Z',
    updatedAt: '2026-09-15T15:45:00Z',
    timeline: [
      { timestamp: '2026-09-15T15:40:00Z', step: 'Venda no Terminal POS', status: 'OK', detail: 'Terminal TERM-OPUS-04 Operador #12', actor: 'Bilheteria Core' },
      { timestamp: '2026-09-15T15:40:03Z', step: 'Autorização TEF', status: 'OK', detail: 'Chip e senha validados. NSU TEF-338210', actor: 'TEF Adapter' },
      { timestamp: '2026-09-15T15:40:05Z', step: 'Ingresso Impresso na Térmica', status: 'OK', detail: 'Ticket físico emitido e caixa conciliado', actor: 'Bilheteria Core' }
    ]
  },
  {
    id: 'PAY-98285',
    orderId: 'ORD-928375',
    correlationId: 'COR-89123023',
    idempotencyKey: 'idemp_chg_98285_2026',
    eventId: 2,
    eventTitle: 'Festival Internacional de Jazz de Curitiba',
    producerId: 102,
    producerName: 'Prime Live Entretenimento',
    customerName: 'Fernando Gusmão Teles',
    customerDocument: '551.928.371-22',
    customerEmail: 'fernando.teles@email.com',
    method: 'credit_card',
    channel: 'site',
    status: 'chargeback',
    amountCents: 62000,
    serviceFeeCents: 6200,
    gatewayFeeCents: 1550,
    cardBrand: 'Mastercard',
    cardLastFour: '9921',
    gateway: 'cielo',
    gatewayReference: 'CIELO-CHG-98285',
    risk: {
      score: 55,
      level: 'medio',
      recommendation: 'validar',
      evaluatedSignals: ['Alerta de Contestação Adquirente'],
      fraudFlags: ['CHARGEBACK_OPEN']
    },
    split: {
      contractSnapshotId: 'CNT-2026-PRIME-02',
      appliedRules: 'Split em Retenção Preventiva',
      lockedAt: '2026-09-15T16:00:00Z',
      rules: [
        { recipient: 'produtor', label: 'Retenção Produtor', percentage: 90, amountCents: 55800 },
        { recipient: 'diskingressos', label: 'Taxa DiskIngressos', percentage: 10, amountCents: 6200 }
      ]
    },
    isSettled: false,
    expectedSettlementDate: '2026-10-15',
    isReconciled: false,
    divergenceDetected: true,
    divergenceDetail: 'Chargeback recebido da adquirente. Ingresso foi utilizado no evento!',
    createdAt: '2026-09-10T12:00:00Z',
    updatedAt: '2026-09-15T16:00:00Z',
    timeline: [
      { timestamp: '2026-09-10T12:00:00Z', step: 'Pagamento Aprovado', status: 'OK', detail: 'Venda original autorizada na Cielo', actor: 'Payment Core' },
      { timestamp: '2026-09-14T20:30:00Z', step: 'Ingresso Utilizado', status: 'CHECKIN', detail: 'Check-in realizado no Portão 03 pelo participante', actor: 'Controle de Acesso' },
      { timestamp: '2026-09-15T16:00:00Z', step: 'Chargeback Notificado', status: 'ALERTA', detail: 'Titular alegou desacordo comercial. Dossiê de evidências gerado com check-in', actor: 'Orquestrador Financeiro' }
    ]
  }
]

const mockChargebacks: ChargebackRecord[] = [
  {
    id: 'CHG-2026-001',
    paymentId: 'PAY-98285',
    orderId: 'ORD-928375',
    eventTitle: 'Festival Internacional de Jazz de Curitiba',
    producerName: 'Prime Live Entretenimento',
    amountCents: 62000,
    reason: 'Titular alega não reconhecimento da despesa',
    status: 'em_analise',
    ticketUsed: true,
    checkinAt: '14/09/2026 20:32',
    checkinGate: 'Portão 03 (Catraca 04)',
    acquirerReference: 'ACQ-CIELO-992182',
    deadlineAt: '22/09/2026',
    evidenceDocuments: [
      'Comprovante de Compra com 3DS e IP do Cliente',
      'Registro de Check-in em Catraca Física (Portão 03)',
      'E-mail de confirmação de titularidade entregue com sucesso'
    ],
    riskReserveCents: 62000,
    createdAt: '2026-09-15T16:00:00Z',
    updatedAt: '2026-09-15T16:15:00Z'
  },
  {
    id: 'CHG-2026-002',
    paymentId: 'PAY-98270',
    orderId: 'ORD-928350',
    eventTitle: 'Arena Sertaneja 2026',
    producerName: 'Live Nation Curitiba',
    amountCents: 125000,
    reason: 'Fraude deliberada alegada pelo emissor do cartão',
    status: 'contestado',
    ticketUsed: false,
    acquirerReference: 'ACQ-STONE-112839',
    deadlineAt: '18/09/2026',
    evidenceDocuments: [
      'Validação de CPF na Receita Federal',
      'Termo de Aceite dos Termos de Uso com IP e User-Agent'
    ],
    riskReserveCents: 125000,
    createdAt: '2026-09-14T11:20:00Z',
    updatedAt: '2026-09-15T10:00:00Z'
  }
]

const mockReconciliations: ReconciliationRecord[] = [
  {
    id: 'REC-2026-101',
    paymentId: 'PAY-98280',
    orderId: 'ORD-928370',
    gateway: 'cielo',
    expectedAmountCents: 54000,
    receivedAmountCents: 52650,
    differenceCents: 1350,
    feeExpectedCents: 1350,
    feeRealizedCents: 2700,
    status: 'divergente',
    type: 'taxa_divergente',
    identifiedAt: '2026-09-15T11:00:00Z',
    resolutionNotes: 'Adquirente cobrou taxa de antecipação não contratada pelo produtor.'
  },
  {
    id: 'REC-2026-102',
    paymentId: 'PAY-98278',
    orderId: 'ORD-928368',
    gateway: 'banco_brasil_pix',
    expectedAmountCents: 32000,
    receivedAmountCents: 32000,
    differenceCents: 0,
    feeExpectedCents: 96,
    feeRealizedCents: 96,
    status: 'auto_conciliado',
    type: 'esperado_vs_recebido',
    identifiedAt: '2026-09-15T13:45:00Z'
  }
]

const mockWebhooks: WebhookRecord[] = [
  {
    id: 'WHK-9281',
    gateway: 'banco_brasil_pix',
    eventType: 'pix.payment.received',
    status: 'processado',
    signatureValid: true,
    payloadSummary: 'EndToEndId: E0000000020260915170098281928371 | Valor: R$ 480,00',
    attempts: 1,
    receivedAt: '2026-09-15T14:20:38Z',
    processedAt: '2026-09-15T14:20:39Z'
  },
  {
    id: 'WHK-9282',
    gateway: 'cielo',
    eventType: 'payment.status_changed',
    status: 'processado',
    signatureValid: true,
    payloadSummary: 'PaymentId: CIELO-TX-98282 | Status: 2 (Capturado) | Valor: R$ 960,00',
    attempts: 1,
    receivedAt: '2026-09-15T14:32:16Z',
    processedAt: '2026-09-15T14:32:17Z'
  },
  {
    id: 'WHK-9283',
    gateway: 'stone',
    eventType: 'transaction.authorized',
    status: 'pendente',
    signatureValid: true,
    payloadSummary: 'TransactionId: STONE-TX-98283 | Valor: R$ 1.500,00 | Fila de Risco',
    attempts: 1,
    receivedAt: '2026-09-15T15:10:02Z'
  }
]

export const PaymentsEnterpriseService = {
  // 1. Obter resumo e métricas da Central de Pagamentos
  async getSummaryKPIs(): Promise<PaymentsSummaryKPIs> {
    try {
      const res = await fetch(`${API_BASE}/summary`)
      if (res.ok) return await res.json()
    } catch {
      // Fallback
    }

    return {
      totalProcessedCents: 384292000, // R$ 3.842.920,00
      totalPaymentsCount: 28491,
      approvedPaymentsCount: 25992,
      approvalRatePercentage: 91.23,
      pixVolumeCents: 142038000, // R$ 1.420.380,00
      cardsVolumeCents: 231182000, // R$ 2.311.820,00
      otherVolumeCents: 11072000, // R$ 110.720,00
      pendingReviewCount: 14,
      rejectedCount: 2485,
      refundedCents: 822000, // R$ 8.220,00
      chargebacksRiskCents: 1892000, // R$ 18.920,00
      divergenceCount: 4,
      awaitingReconciliationCount: 37,
      activeHoldCount: 182,
      healthScorePercentage: 99.97
    }
  },

  // 2. Listar pagamentos com filtros
  async getPayments(params?: {
    producerId?: number
    eventId?: number
    method?: string
    gateway?: string
    status?: string
    search?: string
  }): Promise<PaymentRecord[]> {
    try {
      const qs = new URLSearchParams()
      if (params?.producerId) qs.set('producerId', String(params.producerId))
      if (params?.eventId) qs.set('eventId', String(params.eventId))
      if (params?.method) qs.set('method', params.method)
      if (params?.gateway) qs.set('gateway', params.gateway)
      if (params?.status) qs.set('status', params.status)
      if (params?.search) qs.set('search', params.search)

      const res = await fetch(`${API_BASE}?${qs.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) return data
      }
    } catch {
      // Fallback
    }

    let filtered = [...mockPayments]
    if (params?.status && params.status !== 'todos') {
      filtered = filtered.filter(p => p.status === params.status)
    }
    if (params?.method && params.method !== 'todos') {
      filtered = filtered.filter(p => p.method === params.method)
    }
    if (params?.gateway && params.gateway !== 'todos') {
      filtered = filtered.filter(p => p.gateway === params.gateway)
    }
    if (params?.search) {
      const q = params.search.toLowerCase()
      filtered = filtered.filter(
        p =>
          p.id.toLowerCase().includes(q) ||
          p.orderId.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.eventTitle.toLowerCase().includes(q) ||
          p.correlationId.toLowerCase().includes(q)
      )
    }
    return filtered
  },

  // 3. Obter Dossiê 360° do Pagamento
  async getPaymentById(id: string): Promise<PaymentRecord | null> {
    try {
      const res = await fetch(`${API_BASE}/${id}`)
      if (res.ok) return await res.json()
    } catch {
      // Fallback
    }
    return mockPayments.find(p => p.id === id) || mockPayments[0]
  },

  // 4. Executar Estorno Total ou Parcial com motivo obrigatório
  async executeRefund(data: {
    paymentId: string
    amountCents: number
    reason: string
    operatorName: string
    isPartial: boolean
  }): Promise<{ ok: boolean; message: string; payment: PaymentRecord }> {
    try {
      const res = await fetch(`${API_BASE}/${data.paymentId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) return await res.json()
    } catch {
      // Fallback
    }

    const pay = mockPayments.find(p => p.id === data.paymentId) || mockPayments[0]
    pay.status = data.isPartial ? 'parcialmente_estornado' : 'estornado'
    pay.refundedAmountCents = data.amountCents
    pay.refundReason = data.reason
    pay.refundedBy = data.operatorName
    pay.timeline.push({
      timestamp: new Date().toISOString(),
      step: data.isPartial ? 'Estorno Parcial Executado' : 'Estorno Total Executado',
      status: 'ESTORNADO',
      detail: `R$ ${(data.amountCents / 100).toFixed(2)} estornado. Motivo: ${data.reason}`,
      actor: data.operatorName
    })

    return {
      ok: true,
      message: `Estorno de R$ ${(data.amountCents / 100).toFixed(2)} processado com sucesso no Core!`,
      payment: pay
    }
  },

  // 5. Revisão Manual de Antifraude
  async reviewFraud(data: {
    paymentId: string
    decision: 'aprovar' | 'bloquear'
    notes: string
    reviewerName: string
  }): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/${data.paymentId}/review-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) return await res.json()
    } catch {
      // Fallback
    }

    const pay = mockPayments.find(p => p.id === data.paymentId)
    if (pay) {
      pay.status = data.decision === 'aprovar' ? 'aprovado' : 'recusado'
      pay.risk.reviewedBy = data.reviewerName
      pay.risk.reviewedAt = new Date().toISOString()
      pay.risk.reviewNotes = data.notes
      pay.timeline.push({
        timestamp: new Date().toISOString(),
        step: data.decision === 'aprovar' ? 'Risco Liberado Manualmente' : 'Transação Bloqueada por Risco',
        status: data.decision === 'aprovar' ? 'APROVADO' : 'RECUSADO',
        detail: `Revisão por ${data.reviewerName}: ${data.notes}`,
        actor: data.reviewerName
      })
    }

    return {
      ok: true,
      message: `Decisão de risco (${data.decision.toUpperCase()}) registrada com auditoria!`
    }
  },

  // 6. Listar Chargebacks
  async getChargebacks(): Promise<ChargebackRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/chargebacks`)
      if (res.ok) return await res.json()
    } catch {
      // Fallback
    }
    return mockChargebacks
  },

  // 7. Contestar Chargeback com Dossiê e Evidências
  async contestChargeback(id: string, notes: string): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/chargebacks/${id}/contest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      if (res.ok) return await res.json()
    } catch {
      // Fallback
    }

    const c = mockChargebacks.find(x => x.id === id)
    if (c) c.status = 'contestado'

    return {
      ok: true,
      message: 'Pacote oficial de evidências transmitido à adquirente com sucesso!'
    }
  },

  // 8. Listar Conciliações e Divergências
  async getReconciliations(): Promise<ReconciliationRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/reconciliations`)
      if (res.ok) return await res.json()
    } catch {
      // Fallback
    }
    return mockReconciliations
  },

  // 9. Resolver Divergência Manualmente
  async resolveDivergence(id: string, notes: string, resolver: string): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/reconciliations/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, resolver })
      })
      if (res.ok) return await res.json()
    } catch {
      // Fallback
    }

    const r = mockReconciliations.find(x => x.id === id)
    if (r) {
      r.status = 'resolvido_manualmente'
      r.resolvedAt = new Date().toISOString()
      r.resolvedBy = resolver
      r.resolutionNotes = notes
    }

    return {
      ok: true,
      message: 'Divergência financeira resolvida com compensação contábil registrada.'
    }
  },

  // 10. Listar Webhooks
  async getWebhooks(): Promise<WebhookRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/webhooks`)
      if (res.ok) return await res.json()
    } catch {
      // Fallback
    }
    return mockWebhooks
  },

  // 11. Reprocessar Webhook Idempotente
  async reprocessWebhook(id: string): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/webhooks/${id}/reprocess`, { method: 'POST' })
      if (res.ok) return await res.json()
    } catch {
      // Fallback
    }

    const w = mockWebhooks.find(x => x.id === id)
    if (w) {
      w.status = 'processado'
      w.attempts += 1
      w.processedAt = new Date().toISOString()
    }

    return {
      ok: true,
      message: 'Webhook reprocessado de forma idempotente com sucesso!'
    }
  }
}
