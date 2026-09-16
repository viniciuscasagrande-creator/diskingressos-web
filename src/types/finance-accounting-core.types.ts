// ============================================================================
// TIPOS DO NÚCLEO FINANCEIRO & CONTÁBIL ENTERPRISE (FASE 29.12)
// Disk Core • Ledger Append-Only, 11 Tipos de Saldo, Subcontas por Evento,
// Maker × Checker, Alçadas, Conciliação em Camadas, Integridade & DRE Rastreável
// ============================================================================

export type FinancialBalanceType =
  | 'sold' // Saldo vendido
  | 'received' // Saldo recebido
  | 'inSettlement' // Saldo em liquidação
  | 'receivable' // Saldo a receber
  | 'available' // Saldo disponível
  | 'reserved' // Saldo reservado
  | 'blocked' // Saldo bloqueado
  | 'committed' // Saldo comprometido
  | 'inTransfer' // Saldo em transferência
  | 'inPayout' // Saldo em repasse
  | 'paidOut' // Saldo repassado

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

export type LedgerEntryType =
  | 'VENDA_INGRESSO'
  | 'TAXA_SERVICO'
  | 'CUSTO_GATEWAY'
  | 'COMISSAO'
  | 'DESPESA_PRODUCAO'
  | 'TRANSFERENCIA_ENTRE_EVENTOS'
  | 'REPASSE_PRODUTOR'
  | 'ESTORNO'
  | 'CHARGEBACK'
  | 'AJUSTE_CONCILIACAO'

export interface FinancialLedgerEntry {
  id: string // ex: LED-2026-918231
  orderId?: string
  paymentId?: string
  producerId: number
  eventId: number
  eventName: string
  entryType: LedgerEntryType
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
  correlationId?: string
  description?: string
  reversalOfLedgerId?: string
}

export type TransferStatus =
  | 'SOLICITADA'
  | 'EM_ANALISE'
  | 'APROVADA'
  | 'PROCESSANDO'
  | 'CONCLUIDA'
  | 'REJEITADA'
  | 'REVERTIDA'

export interface EventTransferRecord {
  id: string // ex: TRF-2026-9282
  producerId: number
  sourceEventId: number
  sourceEventName: string
  targetEventId: number
  targetEventName: string
  amountCents: number
  reason: string
  status: TransferStatus
  statusLabelPtBr: string
  tier?: string
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
  requestedBy?: string
  requestedAt?: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  reversalId?: string
  reversalReason?: string
  reversalAt?: string
  reversalBy?: string
  tierRequired?: 'NIVEL_1' | 'NIVEL_2' | 'DIRETORIA'
  tierRequiredLabelPtBr?: string
}

export interface ReceivableAgendaEntry {
  id: string
  producerId?: number
  eventId: number
  eventName: string
  dueDate: string
  amountCents: number
  gateway: string
  periodBucket: 'HOJE' | 'AMANHA' | '7_DIAS' | '30_DIAS' | 'VENCIDO'
  status: 'PREVISTO' | 'CONFIRMADO' | 'PENDENTE' | 'VENCIDO'
  statusLabelPtBr: string
  paymentMethod?: string
  periodBucketLabelPtBr?: string
  feeCents?: number
  netAmountCents?: number
}

export interface PayableExpenseRecord {
  id: string
  producerId?: number
  eventId: number
  eventName: string
  supplierName: string
  supplierDocument: string
  amountCents: number
  dueDate: string
  status: 'PENDENTE' | 'APROVADO' | 'AUTORIZADO' | 'PAGO' | 'CANCELADO'
  statusLabelPtBr: string
  costCenter?: string
  costCenterLabelPtBr?: string
  paymentMethod?: string
  competenceMonth?: string
  invoiceNumber?: string
  costCenterCategory?: string
  description?: string
}

export interface PayoutBatchRecord {
  id: string // ex: REP-20260916-001
  producerId?: number
  producerName?: string
  targetBank?: string
  amountCents: number
  method?: string
  scheduledFor: string
  executedAt?: string
  status: 'SOLICITADO' | 'CRIADO' | 'AGUARDANDO_APROVACAO' | 'APROVADO' | 'PROCESSANDO' | 'LIQUIDADO' | 'REJEITADO'
  statusLabelPtBr: string
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
  mfaAuthenticated?: boolean
  authenticationMethod?: string
  subAccountSplits?: {
    eventId: number
    eventName: string
    amountCents: number
  }[]
  bankReturnReceipt?: string
  producerCount?: number
  payoutsCount?: number
  totalAmountCents?: number
  scheduledDate?: string
  payoutMethod?: 'PIX_DIRETO' | 'CNAB_240' | 'TED'
  payoutMethodLabelPtBr?: string
  createdBy?: string
  createdAt?: string
  approvedBy?: string
  approvedAt?: string
}

export type ReconciliationLayer =
  | 'PAGAMENTOS'
  | 'LIQUIDACOES'
  | 'BANCARIA'
  | 'REPASSES'
  | 'CONTABIL'

export interface ReconciliationDivergence {
  id: string
  layer: ReconciliationLayer | string
  orderId?: string
  eventId: number
  eventName: string
  divergenceType?: string
  divergenceTypeLabelPtBr?: string
  expectedCents?: number
  actualCents?: number
  differenceCents: number
  notes?: string
  status: 'IDENTIFICADA' | 'EM_ANALISE' | 'JUSTIFICADA' | 'AJUSTADA' | 'RESOLVIDA' | 'CONCILIADA' | 'ESCALONADA'
  statusLabelPtBr: string
  identifiedAt: string
  resolvedAt?: string
  layerLabelPtBr?: string
  sourceIdentifier?: string
  expectedAmountCents?: number
  actualAmountCents?: number
  reasonDescription?: string
  resolvedBy?: string
  resolutionNotes?: string
}

export interface ReconciliationLayerMetric {
  namePtBr: string
  totalProcessedCents: number
  matchedCents: number
  divergenceCents: number
  divergencesCount: number
  healthRatePercent: number
}

export interface MultiLayerReconciliationSummary {
  paymentsLayer: ReconciliationLayerMetric
  settlementLayer: ReconciliationLayerMetric
  bankLayer: ReconciliationLayerMetric
  payoutLayer: ReconciliationLayerMetric
  accountingLayer: ReconciliationLayerMetric
  globalHealthScorePercent: number
  divergencesCount?: number
  lastReconciledAt?: string
  layer?: ReconciliationLayer
  layerLabelPtBr?: string
  totalTransactions?: number
  matchedCount?: number
  pendingCount?: number
  divergentCount?: number
  divergentAmountCents?: number
}

export interface FinancialIntegrityAlert {
  id: string
  severity: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA' | 'INFO'
  title: string
  message: string
  detectedAt: string
  resolved?: boolean
  description?: string
  relatedEntity?: string
  amountCents?: number
  suggestedAction?: string
}

export interface FinancialIntegritySummary {
  healthScorePercent: number
  status: string
  statusLabelPtBr: string
  lastAuditAt: string
  anomaliesDetectedCount: number
  rulesAuditedCount: number
  activeAlerts: FinancialIntegrityAlert[]
  healthPercentage?: number
  criticalIssuesCount?: number
  highIssuesCount?: number
  mediumIssuesCount?: number
  paymentsWithoutLedger?: number
  ledgerDivergentCount?: number
  payoutsDivergentCount?: number
  pendingReconciliationsCount?: number
}

export interface AccountingCoreStatements {
  period: string
  producerId?: number
  producerName?: string
  competenceMonth?: string
  dreEvent: {
    eventId: number
    eventName: string
    grossRevenueCents: number
    deductionsCents: number
    netRevenueCents: number
    directExpensesCents: number
    grossContributionMarginCents: number
    contributionMarginPercent: number
    operationalExpensesCents: number
    netOperationalResultCents: number
    netMarginPercent: number
  }
  dreConsolidatedProducer: {
    producerId: number
    totalGrossRevenueCents: number
    totalDeductionsCents: number
    totalNetRevenueCents: number
    totalDirectExpensesCents: number
    totalContributionMarginCents: number
    totalOperationalExpensesCents: number
    totalNetResultCents: number
  }
  dreDiskCore: {
    convenienceFeesRevenueCents: number
    otherRevenuesCents: number
    grossDiskRevenueCents: number
    paymentGatewayCostsCents: number
    taxesDeductedCents: number
    netDiskRevenueCents: number
    infrastructureCostsCents: number
    netOperatingIncomeCents: number
  }
  balanceSheet: {
    assets: {
      cashAndEquivalentsCents: number
      receivablesFromGatewaysCents: number
      reserveGuaranteesCents: number
      totalCurrentAssetsCents: number
    }
    liabilities: {
      producerPayoutObligationsCents: number
      supplierPayablesCents: number
      taxObligationsCents: number
      totalCurrentLiabilitiesCents: number
    }
    equity: {
      retainedEarningsCents: number
      totalEquityCents: number
    }
    currentAssetsCents?: number
    thirdPartyObligationsCents?: number
    diskEquityCents?: number
  }
  periodClosed: boolean
  closingStatusLabelPtBr: string
  status?: 'ABERTO' | 'EM_FECHAMENTO' | 'FECHADO'
  reconciliationRate?: number
  totalEntries?: number
  pendingCount?: number
  divergenceCount?: number
  closedAt?: string
  closedBy?: string
  managerialDRE?: any
  diskCorporateDRE?: any
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
  salesClosed?: boolean
  paymentsReconciled?: boolean
  pixReconciled?: boolean
  cardsReconciled?: boolean
  refundsProcessed?: boolean
  pendingChargebacksCount?: number
  expensesRegistered?: boolean
  transfersReconciled?: boolean
  payoutsCompleted?: boolean
  accountingReviewed?: boolean
  borderoSigned?: boolean
  canFinalizeClosing?: boolean
}

export interface EventBorderoLotSummary {
  sectorName: string
  lotName: string
  unitPriceCents: number
  ticketsSoldCount: number
  grossTotalCents: number
}

export interface EventBorderoReport {
  eventId: number
  eventName: string
  producerName: string
  producerDocument: string
  venue: string
  eventDate: string
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
  lotsSummary: EventBorderoLotSummary[]
  verifiedAuditHash: string
  totalTicketsIssued?: number
  totalCourtesies?: number
  grossSalesCents?: number
  discountsCents?: number
  diskFeesCents?: number
  gatewayFeesCents?: number
  productionExpensesCents?: number
  transfersNetCents?: number
  paidOutCents?: number
  finalBalanceDueCents?: number
  signedAt?: string
  signedBy?: string
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
  simulatedBalances: {
    soldCents: number
    receivedCents: number
    availableCents: number
    inTransferCents: number
  }
  riskLevel: 'SEGURO' | 'MODERADO' | 'CRITICO' | string
  impactNotes: string[]
  createdAt: string
  sourceEventCurrentAvailableCents?: number
  sourceEventProjectedAvailableCents?: number
  targetEventCurrentAvailableCents?: number
  targetEventProjectedAvailableCents?: number
  isAllowed?: boolean
  message?: string
}
