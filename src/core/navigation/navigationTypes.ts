/**
 * Tipos centrais de navegação e contratos de botões do Event OS.
 * Fase 26.17.2 — Button Contract & Navigation Repair
 */

export type PageDestination =
  | 'events'
  | 'event-command-center'
  | 'event-inventory'
  | 'event-customer-360'
  | 'event-global-search'
  | 'event-live-ops'
  | 'event-incidents'
  | 'event-day-command'
  | 'event-revenue-intel'
  | 'event-forecast'
  | 'event-intelligence'
  | 'event-producer-executive'
  | 'event-permission-engine'
  | 'event-compliance'
  | 'event-readiness'
  | 'event-platform-noc'
  | 'finance-dashboard'
  | 'finance-refunds'
  | 'marketing-dashboard'
  | 'sac-hub'
  | 'event-dashboard'
  | 'event-tickets'
  | 'event-courtesy'
  | 'event-reports'
  | 'event-details'

export type ActionType =
  | 'navigate'
  | 'modal'
  | 'drawer'
  | 'api'
  | 'download'
  | 'external'
  | 'disabled_with_reason'

export interface ButtonContract {
  id: string
  module: string
  label: string
  actionType: ActionType
  target?: PageDestination | string
  requiredContext?: ('eventId' | 'producerId' | 'entityId')[]
  requiredPermission?: string
  disabledReason?: string
}

export interface NavigationRouteDefinition {
  pageKey: PageDestination
  canonicalPath: string
  labelPtBr: string
  requiresEventContext: boolean
  adminOnly?: boolean
  isProtectedModule?: boolean
}
