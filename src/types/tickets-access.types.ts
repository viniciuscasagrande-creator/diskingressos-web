// ============================================================================
// FASE 29.10: TIPOS DO NÚCLEO ENTERPRISE DE INGRESSOS E CONTROLE DE ACESSO
// Disk Core • Ingressos, Credenciais Seguras, Transferências, Reemissão e Acesso
// ============================================================================

export type TicketStatus =
  | 'EMITIDO'
  | 'ATIVO'
  | 'TRANSFERIDO'
  | 'REEMITIDO'
  | 'UTILIZADO'
  | 'CANCELADO'
  | 'BLOQUEADO'

export type CredentialStatus =
  | 'ATIVA'
  | 'REVOGADA_REEMISSAO'
  | 'REVOGADA_TRANSFERENCIA'
  | 'REVOGADA_CANCELAMENTO'
  | 'CONSUMIDA'

export interface TicketCredentialRecord {
  id: string
  ticketId: string
  version: number
  code: string // Ex: SEC-TKT-981240-01-V2-8f921a
  qrPayload: string // DI|TKT-2026-981240-01|V2|hash (sem dados sensíveis)
  secureHash: string
  status: CredentialStatus
  issuedAt: string
  revokedAt?: string
  revocationReason?: string
}

export interface TicketTransferRecord {
  id: string
  ticketId: string
  fromHolderName: string
  fromHolderDocument: string
  fromHolderEmail: string
  toHolderName: string
  toHolderDocument: string
  toHolderEmail: string
  toHolderPhone: string
  transferredAt: string
  transferredBy: 'COMPRADOR' | 'OPERADOR_SAC' | 'ADMIN'
  oldCredentialVersion: number
  newCredentialVersion: number
  notes?: string
}

export interface TicketRecord {
  id: string // TKT-2026-981240-01
  orderId: string // ORD-2026-981240
  eventId: number
  eventName: string
  sector: string // Pista Premium, Camarote, etc.
  lot: string // 1º Lote, 2º Lote
  modality: 'INTEIRA' | 'MEIA_ENTRADA' | 'CORTESIA' | 'PROMO'
  priceCents: number
  feeCents: number
  currency: 'BRL'
  // Comprador original (responsável financeiro)
  buyerName: string
  buyerDocument: string
  buyerEmail: string
  buyerPhone: string
  // Titular atual (quem entra no evento)
  holderName: string
  holderDocument: string
  holderEmail: string
  holderPhone: string
  status: TicketStatus
  statusLabelPtBr: string
  currentCredentialVersion: number
  currentCredentialCode: string
  transferCount: number
  checkInAt?: string
  checkInGate?: string
  checkInDevice?: string
  checkInOperator?: string
  createdAt: string
  updatedAt: string
}

export interface AccessGateRecord {
  id: string
  eventId: number
  name: string
  location: string
  sectorsAllowed: string[]
  status: 'ONLINE' | 'OFFLINE' | 'MANUTENCAO'
  activeDevicesCount: number
  totalEntriesCount: number
  entriesLastHour: number
}

export interface AccessDeviceRecord {
  id: string
  gateId: string
  gateName: string
  name: string
  deviceType: 'COLETOR_ANDROID' | 'CATRACA_ELETRONICA' | 'APP_DISK_ACESSO'
  operatorId: string
  operatorName: string
  batteryLevel: number
  isCharging: boolean
  syncStatus: 'SINCRONIZADO' | 'PENDENTE_SINCRONIZACAO' | 'OFFLINE'
  cachedTicketsCount: number
  pendingValidationsCount: number
  lastHeartbeat: string
}

export type AccessValidationResult =
  | 'PERMITIDO'
  | 'DUPLICADO'
  | 'REVOGADO'
  | 'CANCELADO'
  | 'SETOR_INVALIDO'
  | 'OVERRIDE_SUPERVISOR'

export interface AccessValidationLog {
  id: string
  ticketId: string
  credentialVersion: number
  credentialCode: string
  holderName: string
  sector: string
  gateId: string
  gateName: string
  deviceId: string
  operatorName: string
  result: AccessValidationResult
  resultMessage: string
  validatedAt: string
  isOffline: boolean
  syncedAt?: string
  supervisorOverrideReason?: string
}

export interface AccessConflictRecord {
  id: string
  ticketId: string
  holderName: string
  sector: string
  reason: 'DUPLA_ENTRADA_MESMO_INGRESSO' | 'LEITURA_DESINCRONIZADA_OFFLINE' | 'VERSAO_ANTERIOR_APRESENTADA'
  reasonLabelPtBr: string
  status: 'PENDENTE' | 'RESOLVIDO_ACESSO_CONFIRMADO' | 'RESOLVIDO_BARRADO'
  firstEntry: {
    gateName: string
    deviceName: string
    operatorName: string
    at: string
  }
  conflictAttempt: {
    gateName: string
    deviceName: string
    operatorName: string
    at: string
  }
  resolutionNotes?: string
  resolvedAt?: string
  resolvedBy?: string
}

export interface TicketsAccessSummary {
  totalTickets: number
  activeTickets: number
  usedTickets: number
  reissuedTickets: number
  transferredTickets: number
  blockedTickets: number
  checkinPercentage: number
  liveGatesOnline: number
  devicesConnected: number
  activeConflictsCount: number
}
