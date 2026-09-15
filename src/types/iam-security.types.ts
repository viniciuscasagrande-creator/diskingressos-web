// ==============================================================================
// FASE 29.7 — TIPOS OFICIAIS DE IAM, SEGURANÇA & OBSERVABILIDADE DEVELOPER
// Modelagem canônica de RBAC + ABAC, Policy Engine, SoD e Central Developer
// ==============================================================================

export type UserType =
  | 'DISK_INTERNAL'
  | 'PRODUCER'
  | 'PARTNER'
  | 'SERVICE_ACCOUNT'
  | 'CUSTOMER'

export type MembershipStatus = 'ACTIVE' | 'SUSPENDED' | 'INVITED' | 'EXPIRED'

export interface Membership {
  id: string
  userId: string
  organizationId: string
  roleId: string
  status: MembershipStatus
  validFrom: string
  validUntil: string | null
  createdAt: string
}

export type AuthenticationLevel = 'STANDARD' | 'MFA_VERIFIED' | 'STEP_UP'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface SecurityContext {
  actorUserId: string
  effectiveUserId: string
  organizationId: string
  producerId?: string
  eventId?: string
  roles: string[]
  permissions: string[]
  sessionId: string
  authenticationLevel: AuthenticationLevel
  impersonation: boolean
  riskLevel: RiskLevel
  correlationId: string
}

export interface PolicyEvaluationRequest {
  subject: {
    userId: string
    roles: string[]
    organizationId: string
    allowedEvents?: string[] // Lista de eventIds aos quais o usuário tem acesso
  }
  action: string // Ex: "finance.transfer.approve", "event.publish", "map.update_after_sales"
  resource: {
    type: 'EVENT' | 'MAP' | 'ORDER' | 'TICKET' | 'TRANSFER' | 'REFUND' | 'COURTESY' | 'LEDGER' | 'SYSTEM'
    id: string
    producerId?: string
    eventId?: string
    amount?: number
    creatorUserId?: string // Para validação de Segregação de Funções (SoD: Maker != Checker)
    hasSoldTickets?: boolean
  }
  context?: {
    mfaVerified?: boolean
    ip?: string
    timestamp?: string
  }
}

export interface PolicyEvaluationResult {
  allowed: boolean
  code:
    | 'ALLOW'
    | 'DENY_NO_MEMBERSHIP'
    | 'DENY_MISSING_PERMISSION'
    | 'DENY_EVENT_SCOPE'
    | 'DENY_SOD_MAKER_CHECKER'
    | 'DENY_FINANCIAL_LIMIT_EXCEEDED'
    | 'DENY_MAP_AFTER_SALES'
    | 'DENY_MFA_REQUIRED'
    | 'DENY_EXPIRED_ACCESS'
  reason: string
  requiredAction?: string
}

// ------------------------------------------------------------------------------
// Developer Disk & Observabilidade
// ------------------------------------------------------------------------------

export type DeveloperLevel = 'OBSERVER' | 'ENGINEER' | 'LEAD'

export type LogSeverity = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

export interface StructuredLogEntry {
  id: string
  timestamp: string
  severity: LogSeverity
  system: 'DISK_CORE' | 'DISK_INTERNO' | 'DISK' | 'SITE'
  module: string
  message: string
  correlationId: string
  traceId?: string
  requestId?: string
  userId?: string
  producerId?: string
  eventId?: string
  beforeState?: Record<string, any>
  afterState?: Record<string, any>
  metadata?: Record<string, any>
}

export interface CorrelationTimelineStep {
  stepIndex: number
  service: string
  action: string
  status: 'SUCCESS' | 'WARN' | 'ERROR'
  timestamp: string
  durationMs: number
  details?: string
  dlqReason?: string
}

export interface CorrelationJourney {
  correlationId: string
  rootAction: string
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED_DLQ'
  startedAt: string
  completedAt?: string
  totalDurationMs: number
  userId?: string
  eventId?: string
  orderId?: string
  steps: CorrelationTimelineStep[]
}

export interface ErrorFingerprint {
  fingerprint: string
  title: string
  severity: LogSeverity
  count24h: number
  firstSeen: string
  lastSeen: string
  affectedUsers: number
  affectedEvents: number
  estimatedRiskAmountBrl: number
  lastErrorMessage: string
  sampleStack: string
}

export interface QueueHealthStatus {
  queueName: string
  pendingCount: number
  inProgressCount: number
  dlqCount: number
  latencyAvgMs: number
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  canReprocess: boolean
}

export interface PlatformHealthMetric {
  component: string
  type: 'CORE' | 'DATABASE' | 'CACHE' | 'MESSAGE_BROKER' | 'GATEWAY' | 'SERVICE'
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE'
  latencyMs: number
  uptimePercentage: number
  lastChecked: string
  message?: string
}

export interface ActiveSessionItem {
  sessionId: string
  userId: string
  userName: string
  userEmail: string
  role: string
  device: string
  ip: string
  city: string
  startedAt: string
  lastActivityAt: string
  status: 'ACTIVE' | 'REVOKED'
}

export interface DeveloperCommandCenterSummary {
  uptimePercentage: number
  apiP95Ms: number
  errorRatePercentage: number
  requestsPerMinute: number
  ordersPerMinute: number
  ticketsIssuedPerMinute: number
  checkinsPerMinute: number
  pendingQueuesCount: number
  dlqCount: number
  activeIncidentsCount: number
  componentsHealth: PlatformHealthMetric[]
  criticalAlerts: Array<{
    id: string
    title: string
    severity: 'HIGH' | 'MEDIUM' | 'LOW'
    createdAt: string
  }>
}
