/**
 * Registro oficial de contratos de API do Event OS.
 * Fase 26.17.3 — API Contract & Real Data Integration
 */

export interface ApiContract {
  id: string
  module: string
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  frontendFunction: string
  backendHandler: string
  requiresEventId: boolean
  requiresTenant: boolean
  requiresRBAC: boolean
  responseSchema?: string
}

export const EVENT_OS_API_CONTRACTS: ApiContract[] = [
  // 1. Cockpit 360
  {
    id: 'cockpit-overview',
    module: 'cockpit',
    method: 'GET',
    path: '/api/events/:id/cockpit',
    frontendFunction: 'getEventCockpitData',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: false,
    responseSchema: 'EventCockpitResponse'
  },

  // 2. Inventário
  {
    id: 'inventory-lots-list',
    module: 'inventory',
    method: 'GET',
    path: '/api/events/:id/inventory-lots',
    frontendFunction: 'getInventoryLots',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: false
  },
  {
    id: 'inventory-lot-create',
    module: 'inventory',
    method: 'POST',
    path: '/api/events/:id/inventory-lots',
    frontendFunction: 'createInventoryLot',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: true
  },
  {
    id: 'inventory-lot-update',
    module: 'inventory',
    method: 'PATCH',
    path: '/api/events/:id/inventory-lots/:lotId',
    frontendFunction: 'updateInventoryLot',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: true
  },
  {
    id: 'inventory-hold-create',
    module: 'inventory',
    method: 'POST',
    path: '/api/events/:id/inventory-holds',
    frontendFunction: 'createInventoryHold',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: true
  },

  // 3. Customer 360
  {
    id: 'customer360-search',
    module: 'customer360',
    method: 'GET',
    path: '/api/events/:id/customer-360',
    frontendFunction: 'searchEventCustomer360',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: false
  },
  {
    id: 'customer360-profile',
    module: 'customer360',
    method: 'GET',
    path: '/api/events/:id/customer-360/profile',
    frontendFunction: 'getEventCustomer360Profile',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: false
  },

  // 4. Live Operations
  {
    id: 'liveops-overview',
    module: 'live-operations',
    method: 'GET',
    path: '/api/events/:id/live-operations',
    frontendFunction: 'getEventLiveOpsOverview',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: false
  },
  {
    id: 'liveops-flow',
    module: 'live-operations',
    method: 'GET',
    path: '/api/events/:id/live-ops/flow',
    frontendFunction: 'getEventLiveOpsFlow',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: false
  },

  // 5. Incident Center
  {
    id: 'incidents-list',
    module: 'incident-center',
    method: 'GET',
    path: '/api/events/:id/incidents',
    frontendFunction: 'getEventIncidents',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: false
  },
  {
    id: 'incidents-create',
    module: 'incident-center',
    method: 'POST',
    path: '/api/events/:id/incidents',
    frontendFunction: 'createEventIncident',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: false
  },

  // 6. Day Command
  {
    id: 'day-command-overview',
    module: 'event-day-command',
    method: 'GET',
    path: '/api/events/:id/day-command/overview',
    frontendFunction: 'getEventDayCommandOverview',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: false
  },

  // 7. Revenue Intelligence
  {
    id: 'revenue-intelligence',
    module: 'revenue-pricing',
    method: 'GET',
    path: '/api/events/:id/revenue-intelligence',
    frontendFunction: 'getRevenueIntelligence',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: false
  },

  // 8. Forecast Center
  {
    id: 'forecast-summary',
    module: 'forecast-center',
    method: 'GET',
    path: '/api/events/:id/forecast',
    frontendFunction: 'getForecastSummary',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: false
  },
  {
    id: 'forecast-simulate',
    module: 'forecast-center',
    method: 'POST',
    path: '/api/events/:id/forecast/simulate',
    frontendFunction: 'simulateForecastScenario',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: false
  },

  // 9. Disk Intelligence
  {
    id: 'disk-intelligence',
    module: 'disk-intelligence',
    method: 'GET',
    path: '/api/events/:id/intelligence',
    frontendFunction: 'getDiskIntelligence',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: false
  },
  {
    id: 'disk-intelligence-ask',
    module: 'disk-intelligence',
    method: 'POST',
    path: '/api/events/:id/intelligence/ask',
    frontendFunction: 'askDiskIntelligence',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: false
  },

  // 10. Executive Dashboard
  {
    id: 'executive-dashboard',
    module: 'executive-dashboard',
    method: 'GET',
    path: '/api/events/:id/executive-dashboard',
    frontendFunction: 'getExecutiveDashboard',
    backendHandler: 'server/src/routes/events.ts',
    requiresEventId: true,
    requiresTenant: true,
    requiresRBAC: false
  },

  // 11. Estornos (Isolado e Canônico)
  {
    id: 'finance-refunds-list',
    module: 'estornos',
    method: 'GET',
    path: '/api/refunds',
    frontendFunction: 'getRefundRequests',
    backendHandler: 'server/src/routes/refunds.ts',
    requiresEventId: false,
    requiresTenant: true,
    requiresRBAC: true
  }
]
