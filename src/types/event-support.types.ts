// Tipos do Domínio de Suporte a Eventos, Event Builder e Disk Maps (Fase 29.2)

export type EventWorkflowStatus =
  | 'RASCUNHO'
  | 'SOLICITADO'
  | 'EM_TRIAGEM'
  | 'EM_CONFIGURACAO'
  | 'AGUARDANDO_PRODUTOR'
  | 'EM_MONTAGEM'
  | 'MAPA_EM_CRIACAO'
  | 'CONFIGURACAO_COMERCIAL'
  | 'HOMOLOGACAO'
  | 'AGUARDANDO_APROVACAO'
  | 'APROVADO'
  | 'PUBLICADO'
  | 'EM_VENDAS'
  | 'EM_OPERACAO'
  | 'REALIZADO'
  | 'ENCERRADO'
  | 'BLOQUEADO'

export type PriorityLevel = 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE'

export type SeatStatus =
  | 'AVAILABLE'      // Disponível
  | 'HELD'           // Em reserva temporária (TTL)
  | 'RESERVED'       // Reservado
  | 'SOLD'           // Vendido
  | 'BLOCKED'        // Bloqueado
  | 'COURTESY'       // Cortesia
  | 'TECHNICAL_HOLD' // Bloqueio técnico
  | 'CANCELLED'      // Cancelado

export type MapType =
  | 'LIVRE'
  | 'SETORIZADO'
  | 'ASSENTO_MARCADO'
  | 'MESAS'
  | 'CAMAROTES'
  | 'HIBRIDO'

export interface EventSupportRequest {
  id: string
  protocol: string
  eventName: string
  producerId: number
  producerName: string
  venueName: string
  city: string
  state: string
  eventDate: string
  requestDate: string
  supportAgent: string
  status: EventWorkflowStatus
  priority: PriorityLevel
  slaDeadline: string
  readinessScore: number
  hasMap: boolean
  ticketsSold?: number
  capacity: number
}

export interface EventBuilderStep {
  id: number
  key: string
  title: string
  category: 'Geral' | 'Mapa' | 'Comercial' | 'Financeiro' | 'Conteudo' | 'Operacao' | 'Homologacao'
  status: 'concluido' | 'em_andamento' | 'pendente' | 'alerta'
  summary: string
  required: boolean
  itemsCompleted: number
  itemsTotal: number
}

export interface MapSector {
  id: string
  name: string
  color: string
  capacity: number
  basePrice: number
  type: 'MARCADO' | 'LIVRE' | 'MESA' | 'CAMAROTE'
}

export interface SeatItem {
  id: string
  sectorId: string
  row: string
  number: number
  status: SeatStatus
  price: number
  ticketType?: string
  isAccessible?: boolean
  isRestrictedView?: boolean
  heldExpiresAt?: string
}

export interface SeatingMap {
  id: string
  venueId: string
  venueName: string
  name: string
  version: string
  type: MapType
  sectors: MapSector[]
  seats: SeatItem[]
  totalCapacity: number
  totalSold: number
  totalHeld: number
  totalBlocked: number
  totalAvailable: number
  lastModified: string
  modifiedBy: string
}

export interface VenueItem {
  id: string
  name: string
  city: string
  state: string
  address: string
  maxCapacity: number
  availableMapsCount: number
  contactPerson: string
}

export interface ReadinessPillar {
  name: string
  score: number
  weight: number
  status: 'OK' | 'ALERTA' | 'BLOQUEIO'
  items: { label: string; passed: boolean; required: boolean }[]
}

export interface EventReadinessScore {
  totalPercent: number
  canPublish: boolean
  blockersCount: number
  warningsCount: number
  pillars: ReadinessPillar[]
}

export interface EventAuditLog {
  id: string
  timestamp: string
  author: string
  systemOrigin: 'DISK_INTERNO' | 'DISK' | 'DISK_CORE'
  action: string
  previousState?: string
  newState: string
  notes?: string
}

export interface EventDossier {
  request: EventSupportRequest
  builderSteps: EventBuilderStep[]
  map: SeatingMap
  venue: VenueItem
  readiness: EventReadinessScore
  auditHistory: EventAuditLog[]
}
