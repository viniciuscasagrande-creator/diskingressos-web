// ============================================================================
// FASE 29.11: CENTRAL DE CLIENTES & MOTOR ITIL SERVICE DESK (SAC & SUPORTE A EVENTOS)
// Disk Core • Gestão de Clientes, SLA, Incidentes, Problemas e Atendimento Omnichannel
// ============================================================================

export type CustomerStatus = 'ATIVO' | 'BLOQUEADO' | 'SUSPEITO_FRAUDE' | 'VIP'

export type ServiceDeskScope = 'SAC_CLIENTE' | 'SUPORTE_EVENTO'

export type ITILCaseType =
  | 'REQUISICAO_SERVICO'
  | 'INCIDENTE'
  | 'PROBLEMA'
  | 'MUDANCA'

export type ITILCaseStatus =
  | 'NOVO'
  | 'EM_TRIAGEM'
  | 'EM_ATENDIMENTO'
  | 'AGUARDANDO_CLIENTE'
  | 'AGUARDANDO_PRODUTOR'
  | 'RESOLVIDO'
  | 'FECHADO'
  | 'CANCELADO'

export type ITILPriority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE_CRITICA'

export type SLAStatus = 'DENTRO_DO_PRAZO' | 'ALERTA_EM_RISCO' | 'ESTOURADO'

export interface CustomerMasterRecord {
  id: string
  name: string
  document: string // CPF / CNPJ formatado
  documentRaw: string
  email: string
  phone: string
  city: string
  state: string
  status: CustomerStatus
  statusLabelPtBr: string
  riskScore: number // 0-100
  rfmSegment: 'VIP Campeão' | 'Cliente Leal' | 'Potencial Leal' | 'Novo Cliente' | 'Em Risco'
  totalSpentCents: number
  ordersCount: number
  ticketsCount: number
  openCasesCount: number
  resolvedCasesCount: number
  lastPurchaseDate?: string
  createdAt: string
  updatedAt: string
}

export interface CustomerTimelineItem {
  id: string
  customerId: string
  title: string
  category: 'PEDIDO' | 'INGRESSO' | 'ACESSO' | 'SAC' | 'ESTORNO' | 'TRANSFERENCIA'
  description: string
  metadata?: Record<string, string | number>
  occurredAt: string
}

export interface ITILServiceCaseRecord {
  id: string // CASE-2026-90124
  protocol: string // 2026091500124
  scope: ServiceDeskScope // SAC_CLIENTE ou SUPORTE_EVENTO
  type: ITILCaseType
  typeLabelPtBr: string
  title: string
  description: string
  customerId?: string
  customerName?: string
  customerDocument?: string
  customerEmail?: string
  eventId?: number
  eventName?: string
  producerId?: number
  producerName?: string
  category: string
  priority: ITILPriority
  priorityLabelPtBr: string
  status: ITILCaseStatus
  statusLabelPtBr: string
  assignedAgentName: string
  assignedQueue: string
  // SLAs
  firstResponseDueAt: string
  resolutionDueAt: string
  firstRespondedAt?: string
  resolvedAt?: string
  slaStatus: SLAStatus
  slaStatusLabelPtBr: string
  satisfactionScore?: number // 1 a 5
  createdAt: string
  updatedAt: string
}

export interface ITILCaseMessage {
  id: string
  caseId: string
  senderName: string
  senderRole: 'CLIENTE' | 'PRODUTOR' | 'ATENDENTE' | 'SISTEMA_IA'
  text: string
  isInternalNote: boolean
  sentAt: string
}

export interface CustomerServiceDeskSummary {
  totalCustomers: number
  activeCasesSac: number
  activeCasesEventSupport: number
  slaCompliancePercentage: number
  averageResponseTimeMinutes: number
  averageResolutionTimeHours: number
  criticalIncidentsCount: number
  satisfactionRatePercentage: number
}
