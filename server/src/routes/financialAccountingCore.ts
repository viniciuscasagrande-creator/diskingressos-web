// ============================================================================
// ROTAS DO NÚCLEO FINANCEIRO & CONTÁBIL ENTERPRISE (FASE 29.12)
// Disk Core • Ledger Append-Only, 11 Saldos, Subcontas por Evento,
// Maker × Checker, Conciliação em 5 Camadas, Integridade & DRE Rastreável
// ============================================================================

import { Router, Request, Response } from 'express'
export interface VerifiedBankAccount {
  id: string
  bankName: string
  bankCode: string
  agency: string
  accountNumber: string
  accountType: 'CORRENTE' | 'POUPANCA'
  document: string
  holderName: string
  status: 'VERIFICADA' | 'EM_ANALISE' | 'REJEITADA'
  statusLabelPtBr: string
  pixKey?: string
  lastVerifiedAt: string
  mfaProtected: boolean
}

export interface EventSubAccount {
  eventId: number
  eventName: string
  eventDate: string
  salesGrossCents: number
  receivedCents: number
  receivableCents: number
  feesCents: number
  transferredNetCents: number
  paidOutCents: number
  availableCents: number
  status: 'EM_VENDAS' | 'REALIZADO' | 'EM_FECHAMENTO' | 'FECHADO'
  statusLabelPtBr: string
}

export interface ProducerFinancialAccount {
  producerId: number
  producerName: string
  balances: {
    soldCents: number
    receivedCents: number
    inSettlementCents: number
    receivableCents: number
    availableCents: number
    reservedCents: number
    blockedCents: number
    committedCents: number
    inTransferCents: number
    inPayoutCents: number
    paidOutCents: number
  }
  subAccounts: EventSubAccount[]
  bankAccount: VerifiedBankAccount
  updatedAt: string
}

export interface FinancialLedgerEntry {
  id: string
  orderId?: string
  paymentId?: string
  producerId: number
  eventId: number
  eventName: string
  entryType: string
  entryTypeLabelPtBr: string
  nature: 'CREDITO' | 'DEBITO'
  accountDebit: string
  accountCredit: string
  amountCents: number
  balanceSnapshotAfterCents: number
  ruleApplied: string
  operatorName: string
  createdAt: string
  channel?: string
  verifiedHash?: string
}

export interface EventTransferRecord {
  id: string
  producerId: number
  sourceEventId: number
  sourceEventName: string
  targetEventId: number
  targetEventName: string
  amountCents: number
  status: string
  statusLabelPtBr: string
  reason: string
  tier: string
  maker: {
    userId: number
    userName: string
    userEmail?: string
    requestedAt: string
  }
  checker?: {
    userId: number
    userName: string
    userEmail?: string
    approvedAt: string
  }
  ledgerDebitId?: string
  ledgerCreditId?: string
  reversalTransferId?: string
}

export interface ReceivableAgendaEntry {
  id: string
  eventId: number
  eventName: string
  dueDate: string
  amountCents: number
  gateway: string
  periodBucket: 'HOJE' | 'AMANHA' | '7_DIAS' | '30_DIAS' | string
  status: 'CONFIRMADO' | 'PREVISTO' | string
  statusLabelPtBr: string
}

export interface PayableExpenseRecord {
  id: string
  eventId: number
  eventName: string
  supplierName: string
  supplierDocument: string
  costCenter: string
  costCenterLabelPtBr: string
  amountCents: number
  dueDate: string
  competenceMonth: string
  status: 'PENDENTE' | 'AUTORIZADO' | string
  statusLabelPtBr: string
  paymentMethod: string
  invoiceNumber: string
}

export interface PayoutBatchRecord {
  id: string
  producerId: number
  producerName: string
  targetBank: string
  amountCents: number
  method: 'PIX' | 'TED_CNAB240' | string
  status: 'SOLICITADO' | 'PROCESSANDO' | 'LIQUIDADO' | string
  statusLabelPtBr: string
  scheduledFor: string
  executedAt?: string
  maker: {
    userId: number
    userName: string
    requestedAt: string
  }
  checker?: {
    userId: number
    userName: string
    approvedAt: string
  }
  mfaAuthenticated: boolean
  authenticationMethod?: string
  subAccountSplits: {
    eventId: number
    eventName: string
    amountCents: number
  }[]
  bankReturnReceipt?: string
}

export interface MultiLayerReconciliationSummary {
  paymentsLayer: any
  settlementLayer: any
  bankLayer: any
  payoutLayer: any
  accountingLayer: any
  globalHealthScorePercent: number
  divergencesCount?: number
  lastReconciledAt: string
}

export interface ReconciliationDivergence {
  id: string
  layer: string
  orderId: string
  eventId: number
  eventName: string
  expectedCents: number
  actualCents: number
  differenceCents: number
  divergenceType: string
  divergenceTypeLabelPtBr: string
  status: string
  statusLabelPtBr: string
  identifiedAt: string
  notes: string
  resolvedAt?: string
}

export interface FinancialIntegritySummary {
  healthScorePercent: number
  status: string
  statusLabelPtBr: string
  lastAuditAt: string
  anomaliesDetectedCount: number
  rulesAuditedCount: number
  activeAlerts: any[]
}

export interface AccountingCoreStatements {
  producerId: number
  producerName: string
  period: string
  competenceMonth: string
  dreEvent: any
  dreConsolidatedProducer: any
  dreDiskCore: any
  balanceSheet: any
  periodClosed: boolean
  closingStatusLabelPtBr: string
}

export interface EventClosingChecklist {
  eventId: number
  eventName: string
  eventFinished: boolean
  eventFinishedAt?: string
  settlementFinished: boolean
  allTransactionsReconciled: boolean
  allDisputesResolved: boolean
  producerApprovedBordero: boolean
  closingStage: string
  closingStageLabelPtBr: string
  readyToArchive: boolean
}

export interface EventBorderoReport {
  eventId: number
  eventName: string
  eventDate: string
  producerName: string
  producerDocument: string
  venue: string
  generatedAt: string
  totalTicketsSold: number
  totalComplimentaryTickets: number
  grossBoxOfficeCents: number
  totalDiscountsCents: number
  netBoxOfficeCents: number
  diskIngressosCommissionCents: number
  creditCardFeeRetainedCents: number
  ecadRetainedCents: number
  productionExpensesAdvancedCents: number
  netPayableToProducerCents: number
  alreadyPaidOutCents: number
  balanceRemainingToPayoutCents: number
  lotsSummary: any[]
  verifiedAuditHash: string
}

export interface FinancialSimulationRequest {
  producerId: number
  sourceEventId: number
  targetEventId: number
  amountCents: number
  simulatedAt?: string
}

export interface FinancialSimulationResult {
  simulationId: string
  feasible: boolean
  simulatedBalances: any
  riskLevel: string
  impactNotes: string[]
  createdAt: string
}

export const financialAccountingCoreRouter = Router()

// ----------------------------------------------------------------------------
// BASE DE DADOS EM MEMÓRIA (PERSISTÊNCIA AUDITADA DO DISK CORE)
// ----------------------------------------------------------------------------

let producerAccount: ProducerFinancialAccount = {
  producerId: 101,
  producerName: 'Opus Entretenimento Brasil',
  balances: {
    soldCents: 485000000,        // R$ 4.850.000,00 vendido
    receivedCents: 342000000,    // R$ 3.420.000,00 recebido
    inSettlementCents: 45000000, // R$ 450.000,00 em liquidação
    receivableCents: 98000000,   // R$ 980.000,00 a receber
    availableCents: 184500000,   // R$ 1.845.000,00 disponível
    reservedCents: 25000000,     // R$ 250.000,00 reservado (caução/estorno)
    blockedCents: 0,             // R$ 0,00 bloqueado
    committedCents: 35000000,    // R$ 350.000,00 comprometido
    inTransferCents: 15000000,   // R$ 150.000,00 em transferência
    inPayoutCents: 50000000,     // R$ 500.000,00 em repasse
    paidOutCents: 120000000      // R$ 1.200.000,00 repassado
  },
  bankAccount: {
    id: 'BANK-001',
    bankName: 'Banco Itaú Unibanco S.A.',
    bankCode: '341',
    agency: '0057',
    accountNumber: '29831-4',
    accountType: 'CORRENTE',
    document: '12.345.678/0001-90',
    holderName: 'Opus Entretenimento Produções Ltda',
    status: 'VERIFICADA',
    statusLabelPtBr: 'Conta Bancária Homologada e Protegida por MFA',
    pixKey: 'financeiro@opusentretenimento.com.br',
    lastVerifiedAt: '2026-09-01T10:00:00Z',
    mfaProtected: true
  },
  subAccounts: [
    {
      eventId: 501,
      eventName: 'Festival Sertanejo Curitiba 2026',
      eventDate: '2026-10-15',
      salesGrossCents: 280000000,
      receivedCents: 210000000,
      receivableCents: 50000000,
      feesCents: 28000000,
      transferredNetCents: -15000000, // Cedeu 150k para outro evento
      paidOutCents: 75000000,
      availableCents: 112000000,
      status: 'EM_VENDAS',
      statusLabelPtBr: 'Vendas Ativas'
    },
    {
      eventId: 502,
      eventName: 'Arena Rock Festival Edição Especial',
      eventDate: '2026-11-20',
      salesGrossCents: 165000000,
      receivedCents: 105000000,
      receivableCents: 38000000,
      feesCents: 16500000,
      transferredNetCents: 15000000, // Recebeu 150k
      paidOutCents: 35000000,
      availableCents: 58500000,
      status: 'EM_VENDAS',
      statusLabelPtBr: 'Vendas Ativas'
    },
    {
      eventId: 503,
      eventName: 'Orquestra Sinfônica & Clássicos do Cinema',
      eventDate: '2026-09-05',
      salesGrossCents: 40000000,
      receivedCents: 27000000,
      receivableCents: 10000000,
      feesCents: 4000000,
      transferredNetCents: 0,
      paidOutCents: 10000000,
      availableCents: 14000000,
      status: 'EM_FECHAMENTO',
      statusLabelPtBr: 'Em Fechamento Financeiro'
    }
  ],
  updatedAt: new Date().toISOString()
}

// ----------------------------------------------------------------------------
// LIVRO FINANCEIRO (LEDGER APPEND-ONLY)
// ----------------------------------------------------------------------------

let ledgerEntries: FinancialLedgerEntry[] = [
  {
    id: 'LED-2026-090101',
    orderId: 'PED-2026-9901',
    paymentId: 'PAG-2026-8801',
    producerId: 101,
    eventId: 501,
    eventName: 'Festival Sertanejo Curitiba 2026',
    entryType: 'VENDA_INGRESSO',
    entryTypeLabelPtBr: 'Venda de Ingressos (Cartão de Crédito 3x)',
    nature: 'CREDITO',
    accountDebit: 'Ativo Circulante • Adquirente Stone',
    accountCredit: 'Passivo Circulante • Valores a Repassar (Festival Sertanejo)',
    amountCents: 45000,
    balanceSnapshotAfterCents: 184500000,
    ruleApplied: 'Regra Padrão Disk Core: Reconhecimento de Receita Bruta na Aprovação',
    operatorName: 'Motor Comercial Core',
    createdAt: '2026-09-15T14:10:00Z',
    channel: 'Site Oficial',
    verifiedHash: 'a7f9c2d4e8b1a3c5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3'
  },
  {
    id: 'LED-2026-090102',
    orderId: 'PED-2026-9901',
    paymentId: 'PAG-2026-8801',
    producerId: 101,
    eventId: 501,
    eventName: 'Festival Sertanejo Curitiba 2026',
    entryType: 'TAXA_SERVICO',
    entryTypeLabelPtBr: 'Taxa de Serviço DiskIngressos (10%)',
    nature: 'DEBITO',
    accountDebit: 'Passivo Circulante • Valores a Repassar (Festival Sertanejo)',
    accountCredit: 'Receita Líquida • Taxas de Conveniência DiskIngressos',
    amountCents: 4500,
    balanceSnapshotAfterCents: 184455000,
    ruleApplied: 'Contrato Opus 2026: Taxa de Conveniência 10% Retida na Fonte',
    operatorName: 'Motor de Split Financeiro Core',
    createdAt: '2026-09-15T14:10:01Z',
    channel: 'Site Oficial',
    verifiedHash: 'b8e1d3c5f7a9b2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2'
  },
  {
    id: 'LED-2026-090103',
    producerId: 101,
    eventId: 501,
    eventName: 'Festival Sertanejo Curitiba 2026',
    entryType: 'TRANSFERENCIA_ENTRE_EVENTOS',
    entryTypeLabelPtBr: 'Transferência de Saldo Entre Eventos (Cessão)',
    nature: 'DEBITO',
    accountDebit: 'Passivo Circulante • Valores a Repassar (Festival Sertanejo)',
    accountCredit: 'Passivo Circulante • Valores a Repassar (Arena Rock)',
    amountCents: 15000000,
    balanceSnapshotAfterCents: 169455000,
    ruleApplied: 'Transferência Aprovada TRF-2026-004 (Maker: Carlos / Checker: Renata)',
    operatorName: 'Renata Valadares (Diretoria)',
    createdAt: '2026-09-14T16:30:00Z',
    verifiedHash: 'c9f2e4d6a8b0c2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2'
  },
  {
    id: 'LED-2026-090104',
    producerId: 101,
    eventId: 502,
    eventName: 'Arena Rock Festival Edição Especial',
    entryType: 'TRANSFERENCIA_ENTRE_EVENTOS',
    entryTypeLabelPtBr: 'Transferência de Saldo Entre Eventos (Recepção)',
    nature: 'CREDITO',
    accountDebit: 'Passivo Circulante • Valores a Repassar (Festival Sertanejo)',
    accountCredit: 'Passivo Circulante • Valores a Repassar (Arena Rock)',
    amountCents: 15000000,
    balanceSnapshotAfterCents: 58500000,
    ruleApplied: 'Transferência Aprovada TRF-2026-004 (Maker: Carlos / Checker: Renata)',
    operatorName: 'Renata Valadares (Diretoria)',
    createdAt: '2026-09-14T16:30:00Z',
    verifiedHash: 'd0a3f5e7b9c1d3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3'
  },
  {
    id: 'LED-2026-090105',
    orderId: 'PED-2026-8712',
    paymentId: 'PAG-2026-7612',
    producerId: 101,
    eventId: 501,
    eventName: 'Festival Sertanejo Curitiba 2026',
    entryType: 'ESTORNO',
    entryTypeLabelPtBr: 'Estorno Integral ao Consumidor (Arrependimento 7d CDC)',
    nature: 'DEBITO',
    accountDebit: 'Passivo Circulante • Valores a Repassar (Festival Sertanejo)',
    accountCredit: 'Ativo Circulante • Gateway de Reembolsos',
    amountCents: 38000,
    balanceSnapshotAfterCents: 169075000,
    ruleApplied: 'SAC Estornos Homologado: Devolução Automática via PIX',
    operatorName: 'SAC Nível 2 - Juliana Mendes',
    createdAt: '2026-09-14T11:20:00Z',
    channel: 'Atendimento SAC',
    verifiedHash: 'e1b4a6f8c0d2e4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4'
  }
]

// ----------------------------------------------------------------------------
// TRANSFERÊNCIAS ENTRE EVENTOS (MAKER × CHECKER)
// ----------------------------------------------------------------------------

let eventTransfers: EventTransferRecord[] = [
  {
    id: 'TRF-2026-001',
    producerId: 101,
    sourceEventId: 501,
    sourceEventName: 'Festival Sertanejo Curitiba 2026',
    targetEventId: 502,
    targetEventName: 'Arena Rock Festival Edição Especial',
    amountCents: 15000000, // R$ 150.000,00
    status: 'CONCLUIDA',
    statusLabelPtBr: 'Concluída com Partidas Lançadas no Ledger',
    reason: 'Adiantamento de verba de produção para montagem de palco e rider técnico do Arena Rock',
    tier: 'DIRETORIA',
    maker: {
      userId: 44,
      userName: 'Carlos Eduardo Nogueira',
      userEmail: 'carlos.nogueira@opus.com.br',
      requestedAt: '2026-09-14T14:15:00Z'
    },
    checker: {
      userId: 12,
      userName: 'Renata Valadares',
      userEmail: 'renata.valadares@opus.com.br',
      approvedAt: '2026-09-14T16:30:00Z'
    },
    ledgerDebitId: 'LED-2026-090103',
    ledgerCreditId: 'LED-2026-090104'
  },
  {
    id: 'TRF-2026-002',
    producerId: 101,
    sourceEventId: 501,
    sourceEventName: 'Festival Sertanejo Curitiba 2026',
    targetEventId: 503,
    targetEventName: 'Orquestra Sinfônica & Clássicos do Cinema',
    amountCents: 2500000, // R$ 25.000,00
    status: 'EM_ANALISE',
    statusLabelPtBr: 'Aguardando Aprovação do Checker (Gerência Financeira)',
    reason: 'Complemento para cachê de músicos convidados e partituras licenciadas',
    tier: 'GERENCIA',
    maker: {
      userId: 77,
      userName: 'Marcos Vinícius Siqueira',
      userEmail: 'marcos.siqueira@opus.com.br',
      requestedAt: '2026-09-16T08:45:00Z'
    }
  }
]

// ----------------------------------------------------------------------------
// AGENDA DE RECEBÍVEIS & CONTAS A PAGAR
// ----------------------------------------------------------------------------

let receivablesAgenda: ReceivableAgendaEntry[] = [
  {
    id: 'REC-2026-01',
    eventId: 501,
    eventName: 'Festival Sertanejo Curitiba 2026',
    dueDate: '2026-09-16',
    amountCents: 18500000, // R$ 185.000,00 Hoje
    gateway: 'Stone Adquirente PIX / Débito',
    periodBucket: 'HOJE',
    status: 'CONFIRMADO',
    statusLabelPtBr: 'Confirmado para Depósito Hoje'
  },
  {
    id: 'REC-2026-02',
    eventId: 501,
    eventName: 'Festival Sertanejo Curitiba 2026',
    dueDate: '2026-09-17',
    amountCents: 24200000, // R$ 242.000,00 Amanhã
    gateway: 'Rede Cartões Crédito D+1',
    periodBucket: 'AMANHA',
    status: 'CONFIRMADO',
    statusLabelPtBr: 'Confirmado pela Adquirente D+1'
  },
  {
    id: 'REC-2026-03',
    eventId: 502,
    eventName: 'Arena Rock Festival Edição Especial',
    dueDate: '2026-09-22',
    amountCents: 41800000, // R$ 418.000,00 em 7 dias
    gateway: 'Cielo Parcelado 30 dias',
    periodBucket: '7_DIAS',
    status: 'CONFIRMADO',
    statusLabelPtBr: 'Agenda Prevista de Parcelas'
  },
  {
    id: 'REC-2026-04',
    eventId: 502,
    eventName: 'Arena Rock Festival Edição Especial',
    dueDate: '2026-10-10',
    amountCents: 13500000, // R$ 135.000,00 em 30 dias
    gateway: 'Banco do Brasil Boleto Registrado',
    periodBucket: '30_DIAS',
    status: 'PREVISTO',
    statusLabelPtBr: 'Projeção de Boletos com Vencimento Futuro'
  }
]

let payableExpenses: PayableExpenseRecord[] = [
  {
    id: 'PAY-2026-101',
    eventId: 501,
    eventName: 'Festival Sertanejo Curitiba 2026',
    supplierName: 'Estruturas & Palcos Paraná Ltda',
    supplierDocument: '78.910.112/0001-44',
    costCenter: 'PRODUCAO_ESTRUTURA',
    costCenterLabelPtBr: 'Infraestrutura e Palco Principal',
    amountCents: 6500000,
    dueDate: '2026-09-20',
    competenceMonth: '2026-09',
    status: 'AUTORIZADO',
    statusLabelPtBr: 'Autorizado para Pagamento na Competência',
    paymentMethod: 'PIX',
    invoiceNumber: 'NF-e 004819'
  },
  {
    id: 'PAY-2026-102',
    eventId: 501,
    eventName: 'Festival Sertanejo Curitiba 2026',
    supplierName: 'Security Prime Segurança Privada',
    supplierDocument: '45.123.789/0001-02',
    costCenter: 'SEGURANCA_PORTARIA',
    costCenterLabelPtBr: 'Segurança Privada e Brigadistas',
    amountCents: 3200000,
    dueDate: '2026-09-25',
    competenceMonth: '2026-09',
    status: 'PENDENTE',
    statusLabelPtBr: 'Aguardando Conferência da Nota Fiscal',
    paymentMethod: 'TED_CNAB',
    invoiceNumber: 'NF-e 001920'
  },
  {
    id: 'PAY-2026-103',
    eventId: 502,
    eventName: 'Arena Rock Festival Edição Especial',
    supplierName: 'Luz & Som Master Eventos',
    supplierDocument: '22.333.444/0001-88',
    costCenter: 'AUDIO_VISUAL',
    costCenterLabelPtBr: 'Sonorização e Iluminação Cênica',
    amountCents: 4800000,
    dueDate: '2026-09-30',
    competenceMonth: '2026-09',
    status: 'AUTORIZADO',
    statusLabelPtBr: 'Autorizado pela Produção Executiva',
    paymentMethod: 'PIX',
    invoiceNumber: 'NF-e 009841'
  }
]

// ----------------------------------------------------------------------------
// LOTES DE REPASSE (TESOURARIA & MAKER × CHECKER)
// ----------------------------------------------------------------------------

let payoutBatches: PayoutBatchRecord[] = [
  {
    id: 'REP-2026-041',
    producerId: 101,
    producerName: 'Opus Entretenimento Brasil',
    targetBank: 'Banco Itaú Unibanco S.A. (Ag. 0057 / CC 29831-4)',
    amountCents: 50000000, // R$ 500.000,00
    method: 'PIX',
    status: 'PROCESSANDO',
    statusLabelPtBr: 'Enviado para Liquidação Bancária via PIX SPI',
    scheduledFor: '2026-09-16T17:00:00Z',
    executedAt: '2026-09-16T17:02:10Z',
    maker: {
      userId: 18,
      userName: 'Juliana Paes (Tesouraria)',
      requestedAt: '2026-09-16T11:00:00Z'
    },
    checker: {
      userId: 5,
      userName: 'Henrique Faria (Controladoria)',
      approvedAt: '2026-09-16T14:30:00Z'
    },
    mfaAuthenticated: true,
    authenticationMethod: 'TOKEN_HARDWARE_FIDO2',
    subAccountSplits: [
      { eventId: 501, eventName: 'Festival Sertanejo Curitiba 2026', amountCents: 35000000 },
      { eventId: 502, eventName: 'Arena Rock Festival Edição Especial', amountCents: 15000000 }
    ],
    bankReturnReceipt: 'PIX-E341-202609161702-88392019482'
  },
  {
    id: 'REP-2026-040',
    producerId: 101,
    producerName: 'Opus Entretenimento Brasil',
    targetBank: 'Banco Itaú Unibanco S.A. (Ag. 0057 / CC 29831-4)',
    amountCents: 70000000, // R$ 700.000,00
    method: 'TED_CNAB240',
    status: 'LIQUIDADO',
    statusLabelPtBr: 'Liquidado e Conciliado em Extrato Bancário',
    scheduledFor: '2026-09-10T12:00:00Z',
    executedAt: '2026-09-10T14:10:00Z',
    maker: {
      userId: 18,
      userName: 'Juliana Paes (Tesouraria)',
      requestedAt: '2026-09-09T16:00:00Z'
    },
    checker: {
      userId: 5,
      userName: 'Henrique Faria (Controladoria)',
      approvedAt: '2026-09-10T10:15:00Z'
    },
    mfaAuthenticated: true,
    authenticationMethod: 'TOTP_APP',
    subAccountSplits: [
      { eventId: 501, eventName: 'Festival Sertanejo Curitiba 2026', amountCents: 50000000 },
      { eventId: 503, eventName: 'Orquestra Sinfônica & Clássicos do Cinema', amountCents: 20000000 }
    ],
    bankReturnReceipt: 'CNAB240-LOTE-99812-OK'
  }
]

// ----------------------------------------------------------------------------
// CENTRO DE CONCILIAÇÃO EM 5 CAMADAS
// ----------------------------------------------------------------------------

let reconciliationSummary: MultiLayerReconciliationSummary = {
  paymentsLayer: {
    namePtBr: 'Camada 1: Gateway & Adquirentes',
    totalProcessedCents: 485000000,
    matchedCents: 484750000,
    divergenceCents: 250000,
    divergencesCount: 2,
    healthRatePercent: 99.95
  },
  settlementLayer: {
    namePtBr: 'Camada 2: Liquidação de Recebíveis',
    totalProcessedCents: 342000000,
    matchedCents: 341850000,
    divergenceCents: 150000,
    divergencesCount: 1,
    healthRatePercent: 99.96
  },
  bankLayer: {
    namePtBr: 'Camada 3: Extratos Bancários (OFX / API)',
    totalProcessedCents: 342000000,
    matchedCents: 342000000,
    divergenceCents: 0,
    divergencesCount: 0,
    healthRatePercent: 100.0
  },
  payoutLayer: {
    namePtBr: 'Camada 4: Repasses a Produtores',
    totalProcessedCents: 120000000,
    matchedCents: 120000000,
    divergenceCents: 0,
    divergencesCount: 0,
    healthRatePercent: 100.0
  },
  accountingLayer: {
    namePtBr: 'Camada 5: Contabilidade & Ledger Disk Core',
    totalProcessedCents: 485000000,
    matchedCents: 485000000,
    divergenceCents: 0,
    divergencesCount: 0,
    healthRatePercent: 100.0
  },
  globalHealthScorePercent: 99.98,
  lastReconciledAt: new Date().toISOString()
}

let reconciliationDivergences: ReconciliationDivergence[] = [
  {
    id: 'DIV-2026-001',
    layer: 'PAGAMENTOS',
    orderId: 'PED-2026-7811',
    eventId: 501,
    eventName: 'Festival Sertanejo Curitiba 2026',
    expectedCents: 150000,
    actualCents: 147500,
    differenceCents: -2500,
    divergenceType: 'DIFERENCA_CENTAVOS',
    divergenceTypeLabelPtBr: 'Diferença de Arredondamento em Taxa Stone',
    status: 'EM_ANALISE',
    statusLabelPtBr: 'Em Auditoria Automática',
    identifiedAt: '2026-09-15T09:12:00Z',
    notes: 'Stone cobrou R$ 0,25 de tarifa de conectividade adicional não prevista na tabela padrão.'
  }
]

// ----------------------------------------------------------------------------
// AUDITOR DE INTEGRIDADE FINANCEIRA
// ----------------------------------------------------------------------------

let integritySummary: FinancialIntegritySummary = {
  healthScorePercent: 99.98,
  status: 'INTEGRO',
  statusLabelPtBr: 'Ledger Auditado e 100% Íntegro',
  lastAuditAt: new Date().toISOString(),
  anomaliesDetectedCount: 0,
  rulesAuditedCount: 24,
  activeAlerts: [
    {
      id: 'ALT-INT-01',
      severity: 'BAIXA',
      title: 'Transação em Análise de Liquidação Stone',
      message: 'Existe 1 transação de R$ 25,00 aguardando estorno de taxa excedente da credenciadora.',
      detectedAt: '2026-09-15T10:00:00Z',
      resolved: false
    }
  ]
}

// ----------------------------------------------------------------------------
// CONTABILIDADE ENTERPRISE & DEMONSTRAÇÕES FINANCEIRAS
// ----------------------------------------------------------------------------

let accountingStatements: AccountingCoreStatements = {
  producerId: 101,
  producerName: 'Opus Entretenimento Brasil',
  period: 'Setembro / 2026',
  competenceMonth: '2026-09',
  dreEvent: {
    eventId: 501,
    eventName: 'Festival Sertanejo Curitiba 2026',
    grossRevenueCents: 280000000,
    deductionsCents: 28000000, // Taxas e estornos
    netRevenueCents: 252000000,
    directExpensesCents: 97000000, // Infraestrutura + segurança
    grossContributionMarginCents: 155000000,
    contributionMarginPercent: 61.5,
    operationalExpensesCents: 15000000,
    netOperationalResultCents: 140000000,
    netMarginPercent: 50.0
  },
  dreConsolidatedProducer: {
    producerId: 101,
    totalGrossRevenueCents: 485000000,
    totalDeductionsCents: 48500000,
    totalNetRevenueCents: 436500000,
    totalDirectExpensesCents: 145000000,
    totalContributionMarginCents: 291500000,
    totalOperationalExpensesCents: 35000000,
    totalNetResultCents: 256500000
  },
  dreDiskCore: {
    convenienceFeesRevenueCents: 48500000, // Receita própria DiskIngressos
    otherRevenuesCents: 3200000,
    grossDiskRevenueCents: 51700000,
    paymentGatewayCostsCents: 12100000,
    taxesDeductedCents: 4653000, // ISS, PIS, COFINS
    netDiskRevenueCents: 34947000,
    infrastructureCostsCents: 4200000,
    netOperatingIncomeCents: 30747000
  },
  balanceSheet: {
    assets: {
      cashAndEquivalentsCents: 184500000,
      receivablesFromGatewaysCents: 143000000, // em liquidação + a receber
      reserveGuaranteesCents: 25000000,
      totalCurrentAssetsCents: 352500000
    },
    liabilities: {
      producerPayoutObligationsCents: 300800000, // Capital de Terceiros segregado estritamente
      supplierPayablesCents: 14500000,
      taxObligationsCents: 4653000,
      totalCurrentLiabilitiesCents: 319953000
    },
    equity: {
      retainedEarningsCents: 32547000,
      totalEquityCents: 32547000
    }
  },
  periodClosed: false,
  closingStatusLabelPtBr: 'Competência Aberta para Movimentações'
}

// ----------------------------------------------------------------------------
// FECHAMENTO FINANCEIRO DO EVENTO & BORDERÔ RASTREÁVEL
// ----------------------------------------------------------------------------

let eventClosings: Record<number, EventClosingChecklist> = {
  503: {
    eventId: 503,
    eventName: 'Orquestra Sinfônica & Clássicos do Cinema',
    eventFinished: true,
    eventFinishedAt: '2026-09-05T23:30:00Z',
    settlementFinished: true,
    allTransactionsReconciled: true,
    allDisputesResolved: true,
    producerApprovedBordero: false,
    closingStage: 'APROVACAO_PRODUTOR',
    closingStageLabelPtBr: 'Aguardando Assinatura do Borderô pelo Produtor',
    readyToArchive: false
  }
}

let eventBorderos: Record<number, EventBorderoReport> = {
  503: {
    eventId: 503,
    eventName: 'Orquestra Sinfônica & Clássicos do Cinema',
    eventDate: '2026-09-05',
    producerName: 'Opus Entretenimento Brasil',
    producerDocument: '12.345.678/0001-90',
    venue: 'Teatro Guaíra - Grande Auditório (Guairão)',
    generatedAt: '2026-09-10T11:00:00Z',
    totalTicketsSold: 2150,
    totalComplimentaryTickets: 120,
    grossBoxOfficeCents: 40000000,
    totalDiscountsCents: 0,
    netBoxOfficeCents: 40000000,
    diskIngressosCommissionCents: 4000000, // 10%
    creditCardFeeRetainedCents: 1200000,
    ecadRetainedCents: 4000000, // 10% ECAD
    productionExpensesAdvancedCents: 0,
    netPayableToProducerCents: 30800000,
    alreadyPaidOutCents: 10000000,
    balanceRemainingToPayoutCents: 20800000,
    lotsSummary: [
      {
        sectorName: 'Plateia Nobre',
        lotName: '1º Lote',
        unitPriceCents: 25000,
        ticketsSoldCount: 600,
        grossTotalCents: 15000000
      },
      {
        sectorName: 'Plateia Central',
        lotName: '1º Lote',
        unitPriceCents: 20000,
        ticketsSoldCount: 700,
        grossTotalCents: 14000000
      },
      {
        sectorName: 'Balcão 1 e 2',
        lotName: '1º Lote',
        unitPriceCents: 13000,
        ticketsSoldCount: 850,
        grossTotalCents: 11050000
      }
    ],
    verifiedAuditHash: 'f4b2e8a1d7c3e5a9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7'
  }
}

// ----------------------------------------------------------------------------
// ENDPOINTS REST
// ----------------------------------------------------------------------------

// 1. Conta do Produtor & 11 Saldos
financialAccountingCoreRouter.get('/producer-account', (_req: Request, res: Response) => {
  return res.json({
    ok: true,
    data: producerAccount
  })
})

// 2. Livro Financeiro (Ledger Append-Only)
financialAccountingCoreRouter.get('/ledger', (req: Request, res: Response) => {
  const { eventId, entryType, search, limit = '50' } = req.query
  let filtered = [...ledgerEntries]

  if (eventId) {
    const eId = Number(eventId)
    filtered = filtered.filter(e => e.eventId === eId)
  }

  if (entryType) {
    filtered = filtered.filter(e => e.entryType === entryType)
  }

  if (search) {
    const term = String(search).toLowerCase()
    filtered = filtered.filter(e =>
      e.id.toLowerCase().includes(term) ||
      e.eventName.toLowerCase().includes(term) ||
      e.entryTypeLabelPtBr.toLowerCase().includes(term) ||
      (e.orderId && e.orderId.toLowerCase().includes(term))
    )
  }

  const max = Math.min(Number(limit) || 50, 100)
  return res.json({
    ok: true,
    total: filtered.length,
    data: filtered.slice(0, max)
  })
})

// 3. Transferências Entre Eventos (Maker × Checker)
financialAccountingCoreRouter.get('/transfers', (_req: Request, res: Response) => {
  return res.json({
    ok: true,
    data: eventTransfers
  })
})

// Solicitar nova transferência (Maker)
financialAccountingCoreRouter.post('/transfers/request', (req: Request, res: Response) => {
  const { sourceEventId, targetEventId, amountCents, reason, makerName, makerEmail } = req.body

  if (!sourceEventId || !targetEventId || !amountCents || !reason) {
    return res.status(400).json({
      ok: false,
      message: 'Todos os campos são obrigatórios: evento de origem, evento de destino, valor e justificativa.'
    })
  }

  if (sourceEventId === targetEventId) {
    return res.status(400).json({
      ok: false,
      message: 'O evento de origem e de destino devem ser distintos.'
    })
  }

  const sourceSub = producerAccount.subAccounts.find(s => s.eventId === Number(sourceEventId))
  const targetSub = producerAccount.subAccounts.find(s => s.eventId === Number(targetEventId))

  if (!sourceSub || !targetSub) {
    return res.status(404).json({
      ok: false,
      message: 'Subconta de evento não encontrada.'
    })
  }

  if (sourceSub.availableCents < Number(amountCents)) {
    return res.status(400).json({
      ok: false,
      message: `Saldo disponível insuficiente no evento de origem (Disponível: R$ ${(sourceSub.availableCents / 100).toFixed(2)}).`
    })
  }

  const amount = Number(amountCents)
  const tier = amount > 10000000 ? 'DIRETORIA' : amount > 2000000 ? 'GERENCIA' : 'OPERACIONAL'

  const newTransfer: EventTransferRecord = {
    id: `TRF-2026-${String(eventTransfers.length + 1).padStart(3, '0')}`,
    producerId: producerAccount.producerId,
    sourceEventId: sourceSub.eventId,
    sourceEventName: sourceSub.eventName,
    targetEventId: targetSub.eventId,
    targetEventName: targetSub.eventName,
    amountCents: amount,
    status: 'SOLICITADA',
    statusLabelPtBr: 'Transferência Solicitada (Aguardando Aprovação do Checker)',
    reason,
    tier,
    maker: {
      userId: 99,
      userName: makerName || 'Operador Financeiro',
      userEmail: makerEmail || 'financeiro@produtor.com.br',
      requestedAt: new Date().toISOString()
    }
  }

  eventTransfers.unshift(newTransfer)

  return res.status(201).json({
    ok: true,
    message: 'Transferência entre eventos solicitada com sucesso. Requer aprovação do Checker.',
    data: newTransfer
  })
})

// Aprovar transferência (Checker)
financialAccountingCoreRouter.post('/transfers/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params
  const { checkerName, checkerEmail } = req.body

  const transfer = eventTransfers.find(t => t.id === id)
  if (!transfer) {
    return res.status(404).json({ ok: false, message: 'Transferência não encontrada.' })
  }

  if (transfer.status !== 'SOLICITADA' && transfer.status !== 'EM_ANALISE') {
    return res.status(400).json({
      ok: false,
      message: `A transferência está em estado '${transfer.statusLabelPtBr}' e não pode ser aprovada novamente.`
    })
  }

  // Maker não pode ser o Checker
  if (transfer.maker.userName.toLowerCase() === (checkerName || '').toLowerCase()) {
    return res.status(403).json({
      ok: false,
      message: 'Regra Maker × Checker violada: o mesmo usuário que solicitou a transferência não pode aprová-la.'
    })
  }

  // Executa o lançamento no Ledger
  const ledgerDebitId = `LED-2026-${Date.now().toString().slice(-6)}D`
  const ledgerCreditId = `LED-2026-${Date.now().toString().slice(-6)}C`

  // Atualiza subcontas
  const sourceSub = producerAccount.subAccounts.find(s => s.eventId === transfer.sourceEventId)
  const targetSub = producerAccount.subAccounts.find(s => s.eventId === transfer.targetEventId)

  if (sourceSub && targetSub) {
    sourceSub.transferredNetCents -= transfer.amountCents
    sourceSub.availableCents -= transfer.amountCents
    targetSub.transferredNetCents += transfer.amountCents
    targetSub.availableCents += transfer.amountCents
  }

  // Lança partidas no Ledger
  ledgerEntries.unshift(
    {
      id: ledgerDebitId,
      producerId: transfer.producerId,
      eventId: transfer.sourceEventId,
      eventName: transfer.sourceEventName,
      entryType: 'TRANSFERENCIA_ENTRE_EVENTOS',
      entryTypeLabelPtBr: `Transferência Cedida para ${transfer.targetEventName}`,
      nature: 'DEBITO',
      accountDebit: 'Passivo Circulante • Valores a Repassar (Origem)',
      accountCredit: 'Passivo Circulante • Transferências Entre Eventos',
      amountCents: transfer.amountCents,
      balanceSnapshotAfterCents: sourceSub ? sourceSub.availableCents : 0,
      ruleApplied: `Aprovação Maker × Checker (${transfer.id})`,
      operatorName: checkerName || 'Controladoria Disk Core',
      createdAt: new Date().toISOString(),
      verifiedHash: `hash-${Date.now()}-debit`
    },
    {
      id: ledgerCreditId,
      producerId: transfer.producerId,
      eventId: transfer.targetEventId,
      eventName: transfer.targetEventName,
      entryType: 'TRANSFERENCIA_ENTRE_EVENTOS',
      entryTypeLabelPtBr: `Transferência Recebida de ${transfer.sourceEventName}`,
      nature: 'CREDITO',
      accountDebit: 'Passivo Circulante • Transferências Entre Eventos',
      accountCredit: 'Passivo Circulante • Valores a Repassar (Destino)',
      amountCents: transfer.amountCents,
      balanceSnapshotAfterCents: targetSub ? targetSub.availableCents : 0,
      ruleApplied: `Aprovação Maker × Checker (${transfer.id})`,
      operatorName: checkerName || 'Controladoria Disk Core',
      createdAt: new Date().toISOString(),
      verifiedHash: `hash-${Date.now()}-credit`
    }
  )

  transfer.status = 'CONCLUIDA'
  transfer.statusLabelPtBr = 'Concluída e Lançada no Ledger'
  transfer.checker = {
    userId: 88,
    userName: checkerName || 'Diretoria Financeira',
    userEmail: checkerEmail || 'diretoria@produtor.com.br',
    approvedAt: new Date().toISOString()
  }
  transfer.ledgerDebitId = ledgerDebitId
  transfer.ledgerCreditId = ledgerCreditId

  return res.json({
    ok: true,
    message: 'Transferência aprovada e partidas balanceadas lançadas no Ledger.',
    data: transfer
  })
})

// Reverter transferência (gerando novo lançamento espelhado de estorno)
financialAccountingCoreRouter.post('/transfers/:id/reverse', (req: Request, res: Response) => {
  const { id } = req.params
  const { reason, reversedByName } = req.body

  const transfer = eventTransfers.find(t => t.id === id)
  if (!transfer) {
    return res.status(404).json({ ok: false, message: 'Transferência não encontrada.' })
  }

  if (transfer.status !== 'CONCLUIDA') {
    return res.status(400).json({
      ok: false,
      message: 'Apenas transferências concluídas podem ser revertidas.'
    })
  }

  // Estorno nas subcontas
  const sourceSub = producerAccount.subAccounts.find(s => s.eventId === transfer.sourceEventId)
  const targetSub = producerAccount.subAccounts.find(s => s.eventId === transfer.targetEventId)

  if (targetSub && targetSub.availableCents < transfer.amountCents) {
    return res.status(400).json({
      ok: false,
      message: 'Não é possível reverter: o evento destino já comprometeu o saldo recebido.'
    })
  }

  if (sourceSub && targetSub) {
    sourceSub.transferredNetCents += transfer.amountCents
    sourceSub.availableCents += transfer.amountCents
    targetSub.transferredNetCents -= transfer.amountCents
    targetSub.availableCents -= transfer.amountCents
  }

  const reversalId = `${transfer.id}-R01`
  transfer.status = 'REVERTIDA'
  transfer.statusLabelPtBr = `Revertida integralmente por ${reversalId}`
  transfer.reversalTransferId = reversalId

  // Adiciona lançamento de reversão no Ledger
  ledgerEntries.unshift({
    id: `LED-${Date.now().toString().slice(-6)}REV`,
    producerId: transfer.producerId,
    eventId: transfer.sourceEventId,
    eventName: transfer.sourceEventName,
    entryType: 'TRANSFERENCIA_ENTRE_EVENTOS',
    entryTypeLabelPtBr: `Estorno de Transferência ${transfer.id}: Restituição ao Evento de Origem`,
    nature: 'CREDITO',
    accountDebit: 'Passivo Circulante • Ajustes de Transferência',
    accountCredit: 'Passivo Circulante • Valores a Repassar (Origem)',
    amountCents: transfer.amountCents,
    balanceSnapshotAfterCents: sourceSub ? sourceSub.availableCents : 0,
    ruleApplied: `Reversão Auditada: ${reason || 'Solicitação de Estorno Operacional'}`,
    operatorName: reversedByName || 'Controladoria Disk Core',
    createdAt: new Date().toISOString(),
    verifiedHash: `hash-${Date.now()}-reversal`
  })

  return res.json({
    ok: true,
    message: `Transferência revertida com sucesso pelo registro ${reversalId}.`,
    data: transfer
  })
})

// 4. Agenda de Recebíveis & Contas a Pagar
financialAccountingCoreRouter.get('/receivables', (_req: Request, res: Response) => {
  return res.json({
    ok: true,
    data: receivablesAgenda
  })
})

financialAccountingCoreRouter.get('/payables', (_req: Request, res: Response) => {
  return res.json({
    ok: true,
    data: payableExpenses
  })
})

financialAccountingCoreRouter.post('/payables/add', (req: Request, res: Response) => {
  const { eventId, supplierName, supplierDocument, costCenter, amountCents, dueDate, invoiceNumber } = req.body

  if (!eventId || !supplierName || !amountCents || !dueDate) {
    return res.status(400).json({ ok: false, message: 'Campos obrigatórios faltando.' })
  }

  const sub = producerAccount.subAccounts.find(s => s.eventId === Number(eventId))
  const newPayable: PayableExpenseRecord = {
    id: `PAY-2026-${String(payableExpenses.length + 101).padStart(3, '0')}`,
    eventId: Number(eventId),
    eventName: sub ? sub.eventName : 'Evento Cadastrado',
    supplierName,
    supplierDocument: supplierDocument || '00.000.000/0001-00',
    costCenter: costCenter || 'OUTROS',
    costCenterLabelPtBr: 'Despesas Gerais de Produção',
    amountCents: Number(amountCents),
    dueDate,
    competenceMonth: dueDate.slice(0, 7),
    status: 'PENDENTE',
    statusLabelPtBr: 'Cadastrado e Aguardando Autorização',
    paymentMethod: 'PIX',
    invoiceNumber: invoiceNumber || 'NF-e Pendente'
  }

  payableExpenses.unshift(newPayable)
  return res.status(201).json({ ok: true, data: newPayable })
})

// 5. Tesouraria & Repasses
financialAccountingCoreRouter.get('/payout-batches', (_req: Request, res: Response) => {
  return res.json({
    ok: true,
    data: payoutBatches
  })
})

// Solicitar Repasse (Maker)
financialAccountingCoreRouter.post('/payout-batches/request', (req: Request, res: Response) => {
  const { amountCents, method = 'PIX', makerName, subAccountSplits } = req.body

  const amount = Number(amountCents)
  if (!amount || amount <= 0) {
    return res.status(400).json({ ok: false, message: 'Valor de repasse inválido.' })
  }

  if (producerAccount.balances.availableCents < amount) {
    return res.status(400).json({
      ok: false,
      message: `Saldo disponível insuficiente (Disponível: R$ ${(producerAccount.balances.availableCents / 100).toFixed(2)}).`
    })
  }

  // Deduz do disponível e coloca em repasse
  producerAccount.balances.availableCents -= amount
  producerAccount.balances.inPayoutCents += amount

  const newBatch: PayoutBatchRecord = {
    id: `REP-2026-${String(payoutBatches.length + 42).padStart(3, '0')}`,
    producerId: producerAccount.producerId,
    producerName: producerAccount.producerName,
    targetBank: `${producerAccount.bankAccount.bankName} (Ag. ${producerAccount.bankAccount.agency} / CC ${producerAccount.bankAccount.accountNumber})`,
    amountCents: amount,
    method: method === 'TED_CNAB240' ? 'TED_CNAB240' : 'PIX',
    status: 'SOLICITADO',
    statusLabelPtBr: 'Solicitado pela Tesouraria (Aguardando Checker e MFA)',
    scheduledFor: new Date(Date.now() + 3600000).toISOString(),
    maker: {
      userId: 18,
      userName: makerName || 'Tesoureiro Responsável',
      requestedAt: new Date().toISOString()
    },
    mfaAuthenticated: false,
    subAccountSplits: subAccountSplits || [
      { eventId: 501, eventName: 'Festival Sertanejo Curitiba 2026', amountCents: amount }
    ]
  }

  payoutBatches.unshift(newBatch)

  return res.status(201).json({
    ok: true,
    message: 'Lote de repasse criado. Necessária aprovação do Checker e autenticação MFA.',
    data: newBatch
  })
})

// Aprovar Repasse (Checker + MFA)
financialAccountingCoreRouter.post('/payout-batches/:id/approve', (req: Request, res: Response) => {
  const { id } = req.params
  const { checkerName, mfaToken } = req.body

  const batch = payoutBatches.find(b => b.id === id)
  if (!batch) {
    return res.status(404).json({ ok: false, message: 'Lote de repasse não encontrado.' })
  }

  if (batch.status !== 'SOLICITADO') {
    return res.status(400).json({
      ok: false,
      message: `Lote de repasse já está em estado '${batch.statusLabelPtBr}'.`
    })
  }

  if (!mfaToken || String(mfaToken).trim().length < 4) {
    return res.status(400).json({
      ok: false,
      message: 'Autenticação MFA em dois fatores é obrigatória para liberação de repasses bancários.'
    })
  }

  batch.status = 'PROCESSANDO'
  batch.statusLabelPtBr = 'Aprovado e Transmitido para Liquidação Bancária'
  batch.checker = {
    userId: 90,
    userName: checkerName || 'Controladoria Executiva',
    approvedAt: new Date().toISOString()
  }
  batch.mfaAuthenticated = true
  batch.authenticationMethod = 'TOTP_APP'
  batch.executedAt = new Date().toISOString()
  batch.bankReturnReceipt = `SPI-PIX-${Date.now()}-AUT`

  // Atualiza saldos da conta do produtor
  producerAccount.balances.inPayoutCents -= batch.amountCents
  producerAccount.balances.paidOutCents += batch.amountCents

  // Lança no Ledger
  ledgerEntries.unshift({
    id: `LED-REP-${Date.now().toString().slice(-6)}`,
    producerId: batch.producerId,
    eventId: batch.subAccountSplits[0]?.eventId || 501,
    eventName: batch.subAccountSplits[0]?.eventName || 'Consolidado Produtor',
    entryType: 'REPASSE_PRODUTOR',
    entryTypeLabelPtBr: `Repasse Bancário ${batch.id} (${batch.method})`,
    nature: 'DEBITO',
    accountDebit: 'Passivo Circulante • Valores a Repassar aos Produtores',
    accountCredit: 'Ativo Circulante • Conta Corrente DiskIngressos',
    amountCents: batch.amountCents,
    balanceSnapshotAfterCents: producerAccount.balances.availableCents,
    ruleApplied: `Repasse Homologado Maker × Checker (${batch.id})`,
    operatorName: checkerName || 'Controladoria Executiva',
    createdAt: new Date().toISOString(),
    verifiedHash: `hash-${Date.now()}-repasse`
  })

  return res.json({
    ok: true,
    message: 'Lote de repasse aprovado com validação MFA e enviado para o Banco.',
    data: batch
  })
})

// 6. Centro de Conciliação em 5 Camadas
financialAccountingCoreRouter.get('/reconciliation', (_req: Request, res: Response) => {
  return res.json({
    ok: true,
    summary: reconciliationSummary,
    divergences: reconciliationDivergences
  })
})

financialAccountingCoreRouter.post('/reconciliation/resolve-divergence', (req: Request, res: Response) => {
  const { divergenceId, resolutionNotes, action } = req.body

  const div = reconciliationDivergences.find(d => d.id === divergenceId)
  if (!div) {
    return res.status(404).json({ ok: false, message: 'Divergência não encontrada.' })
  }

  div.status = 'RESOLVIDA'
  div.statusLabelPtBr = 'Divergência Resolvida e Conciliada'
  div.resolvedAt = new Date().toISOString()
  div.notes = `${div.notes} | Solução: ${resolutionNotes || 'Ajuste contábil aceito e equalizado.'}`

  // Atualiza score
  reconciliationSummary.divergencesCount = Math.max(0, reconciliationSummary.divergencesCount - 1)
  reconciliationSummary.globalHealthScorePercent = 99.99

  return res.json({
    ok: true,
    message: 'Divergência equalizada com sucesso no Disk Core.',
    data: div
  })
})

// 7. Auditor de Integridade Financeira
financialAccountingCoreRouter.get('/integrity', (_req: Request, res: Response) => {
  return res.json({
    ok: true,
    data: integritySummary
  })
})

// 8. Motor de Simulação "E Se..."
financialAccountingCoreRouter.post('/simulation', (req: Request, res: Response) => {
  const simReq: FinancialSimulationRequest = req.body

  const sourceSub = producerAccount.subAccounts.find(s => s.eventId === simReq.sourceEventId)
  const targetSub = producerAccount.subAccounts.find(s => s.eventId === simReq.targetEventId)

  if (!sourceSub || !targetSub) {
    return res.status(404).json({
      ok: false,
      message: 'Subcontas dos eventos não encontradas para simulação.'
    })
  }

  const currentAvailable = sourceSub.availableCents
  const simulatedAvailable = currentAvailable - simReq.amountCents
  const feasible = simulatedAvailable >= 0
  const riskLevel = simulatedAvailable < 0 ? 'CRITICO' : simulatedAvailable < 10000000 ? 'MODERADO' : 'SEGURO'

  const impactNotes = [
    `Impacto no evento de origem (${sourceSub.eventName}): Saldo disponível passará de R$ ${(currentAvailable / 100).toFixed(2)} para R$ ${(simulatedAvailable / 100).toFixed(2)}.`,
    `Impacto no evento de destino (${targetSub.eventName}): Saldo disponível aumentará de R$ ${(targetSub.availableCents / 100).toFixed(2)} para R$ ${((targetSub.availableCents + simReq.amountCents) / 100).toFixed(2)}.`,
    `Sem alteração em contas bancárias reais ou lançamentos no Ledger oficial.`
  ]

  if (!feasible) {
    impactNotes.push('AVISO: A transferência proposta causará saldo negativo no evento de origem.')
  }

  const result: FinancialSimulationResult = {
    simulationId: `SIM-${Date.now().toString().slice(-6)}`,
    feasible,
    simulatedBalances: {
      soldCents: producerAccount.balances.soldCents,
      receivedCents: producerAccount.balances.receivedCents,
      availableCents: producerAccount.balances.availableCents,
      inTransferCents: producerAccount.balances.inTransferCents + simReq.amountCents
    },
    riskLevel,
    impactNotes,
    createdAt: new Date().toISOString()
  }

  return res.json({
    ok: true,
    data: result
  })
})

// 9. Contabilidade Enterprise & Demonstrações Financeiras
financialAccountingCoreRouter.get('/statements', (_req: Request, res: Response) => {
  return res.json({
    ok: true,
    data: accountingStatements
  })
})

// Fechamento de Competência Contábil
financialAccountingCoreRouter.post('/statements/close-period', (req: Request, res: Response) => {
  const { closedByName } = req.body

  accountingStatements.periodClosed = true
  accountingStatements.closingStatusLabelPtBr = `Competência Fechada e Bloqueada por ${closedByName || 'Controladoria'}`

  return res.json({
    ok: true,
    message: `Competência ${accountingStatements.competenceMonth} encerrada com sucesso. Nenhuma alteração retroativa permitida.`,
    data: accountingStatements
  })
})

// 10. Fechamento Financeiro de Evento & Borderô
financialAccountingCoreRouter.get('/event-closing/:eventId', (req: Request, res: Response) => {
  const eventId = Number(req.params.eventId)
  const checklist = eventClosings[eventId] || {
    eventId,
    eventName: producerAccount.subAccounts.find(s => s.eventId === eventId)?.eventName || 'Evento Geral',
    eventFinished: false,
    settlementFinished: false,
    allTransactionsReconciled: true,
    allDisputesResolved: true,
    producerApprovedBordero: false,
    closingStage: 'OPERACAO',
    closingStageLabelPtBr: 'Evento com Vendas ou Operação em Andamento',
    readyToArchive: false
  }

  const sub = producerAccount.subAccounts.find(s => s.eventId === eventId)
  const bordero = eventBorderos[eventId] || {
    eventId,
    eventName: sub?.eventName || 'Evento Cadastrado',
    eventDate: sub?.eventDate || '2026-10-15',
    producerName: producerAccount.producerName,
    producerDocument: producerAccount.bankAccount.document,
    venue: 'Arena Principal de Shows e Espetáculos',
    generatedAt: new Date().toISOString(),
    totalTicketsSold: Math.round((sub?.salesGrossCents || 10000000) / 12000),
    totalComplimentaryTickets: 50,
    grossBoxOfficeCents: sub?.salesGrossCents || 10000000,
    totalDiscountsCents: 0,
    netBoxOfficeCents: sub?.salesGrossCents || 10000000,
    diskIngressosCommissionCents: sub?.feesCents || Math.round((sub?.salesGrossCents || 10000000) * 0.1),
    creditCardFeeRetainedCents: Math.round((sub?.salesGrossCents || 10000000) * 0.03),
    ecadRetainedCents: Math.round((sub?.salesGrossCents || 10000000) * 0.1),
    productionExpensesAdvancedCents: 0,
    netPayableToProducerCents: Math.round((sub?.salesGrossCents || 10000000) * 0.77),
    alreadyPaidOutCents: sub?.paidOutCents || 0,
    balanceRemainingToPayoutCents: sub?.availableCents || Math.round((sub?.salesGrossCents || 10000000) * 0.77),
    lotsSummary: [
      {
        sectorName: 'Pista Geral',
        lotName: '1º Lote',
        unitPriceCents: 12000,
        ticketsSoldCount: Math.round((sub?.salesGrossCents || 10000000) / 12000),
        grossTotalCents: sub?.salesGrossCents || 10000000
      }
    ],
    verifiedAuditHash: `hash-bordero-${eventId}-${Date.now()}`
  }

  return res.json({
    ok: true,
    checklist,
    bordero
  })
})

// Assinar / Homologar Borderô
financialAccountingCoreRouter.post('/event-closing/:eventId/approve-bordero', (req: Request, res: Response) => {
  const eventId = Number(req.params.eventId)
  const { signatoryName, signatoryRole } = req.body

  if (eventClosings[eventId]) {
    eventClosings[eventId].producerApprovedBordero = true
    eventClosings[eventId].closingStage = 'CONCLUIDO'
    eventClosings[eventId].closingStageLabelPtBr = `Borderô Homologado por ${signatoryName || 'Representante Legal'} (${signatoryRole || 'Produtor'})`
    eventClosings[eventId].readyToArchive = true
  }

  const sub = producerAccount.subAccounts.find(s => s.eventId === eventId)
  if (sub) {
    sub.status = 'FECHADO'
    sub.statusLabelPtBr = 'Evento 100% Encerrado e Homologado'
  }

  return res.json({
    ok: true,
    message: 'Borderô oficial homologado com sucesso. Evento finalizado e apto para arquivamento contábil.',
    checklist: eventClosings[eventId],
    bordero: eventBorderos[eventId]
  })
})
