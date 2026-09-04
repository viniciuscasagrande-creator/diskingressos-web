/**
 * Registro único de navegação do Event OS.
 * Fase 26.17.2 — Button Contract & Navigation Repair
 */

import type { NavigationRouteDefinition, PageDestination } from './navigationTypes'

export const EVENT_OS_NAVIGATION: Record<string, NavigationRouteDefinition> = {
  // Módulos Protegidos Globais
  events: {
    pageKey: 'events',
    canonicalPath: '/eventos',
    labelPtBr: 'Todos os Eventos',
    requiresEventContext: false,
    isProtectedModule: true
  },
  financeDashboard: {
    pageKey: 'finance-dashboard',
    canonicalPath: '/app/finance-dashboard',
    labelPtBr: 'Painel Financeiro',
    requiresEventContext: false,
    isProtectedModule: true
  },
  financeRefunds: {
    pageKey: 'finance-refunds',
    canonicalPath: '/app/finance-refunds',
    labelPtBr: 'Estornos',
    requiresEventContext: false,
    isProtectedModule: true
  },
  marketingDashboard: {
    pageKey: 'marketing-dashboard',
    canonicalPath: '/app/marketing-dashboard',
    labelPtBr: 'Painel Marketing',
    requiresEventContext: false,
    isProtectedModule: true
  },
  sacHub: {
    pageKey: 'sac-hub',
    canonicalPath: '/app/sac-hub',
    labelPtBr: 'Atendimento / SAC',
    requiresEventContext: false,
    isProtectedModule: true
  },

  // Event OS Contextual
  cockpit: {
    pageKey: 'event-command-center',
    canonicalPath: '/eventos/:eventId/cockpit',
    labelPtBr: 'Cockpit 360',
    requiresEventContext: true
  },
  inventory: {
    pageKey: 'event-inventory',
    canonicalPath: '/eventos/:eventId/inventory',
    labelPtBr: 'Inventário',
    requiresEventContext: true
  },
  customer360: {
    pageKey: 'event-customer-360',
    canonicalPath: '/eventos/:eventId/customer-360',
    labelPtBr: 'Cliente 360°',
    requiresEventContext: true
  },
  liveOperations: {
    pageKey: 'event-live-ops',
    canonicalPath: '/eventos/:eventId/live-operations',
    labelPtBr: 'Operação ao Vivo',
    requiresEventContext: true
  },
  incidents: {
    pageKey: 'event-incidents',
    canonicalPath: '/eventos/:eventId/incidents',
    labelPtBr: 'Central de Incidentes',
    requiresEventContext: true
  },
  eventDay: {
    pageKey: 'event-day-command',
    canonicalPath: '/eventos/:eventId/event-day',
    labelPtBr: 'Central do Dia do Evento',
    requiresEventContext: true
  },
  revenue: {
    pageKey: 'event-revenue-intel',
    canonicalPath: '/eventos/:eventId/revenue',
    labelPtBr: 'Inteligência de Receita',
    requiresEventContext: true
  },
  readiness: {
    pageKey: 'event-readiness',
    canonicalPath: '/eventos/:eventId/readiness',
    labelPtBr: 'Preparação do Evento',
    requiresEventContext: true
  },
  forecast: {
    pageKey: 'event-forecast',
    canonicalPath: '/eventos/:eventId/forecast',
    labelPtBr: 'Central de Previsões',
    requiresEventContext: true
  },
  intelligence: {
    pageKey: 'event-intelligence',
    canonicalPath: '/eventos/:eventId/intelligence',
    labelPtBr: 'Inteligência Disk',
    requiresEventContext: true
  },
  executive: {
    pageKey: 'event-producer-executive',
    canonicalPath: '/eventos/:eventId/executive',
    labelPtBr: 'Painel Executivo',
    requiresEventContext: true
  },
  platformNoc: {
    pageKey: 'event-platform-noc',
    canonicalPath: '/eventos/:eventId/platform-noc',
    labelPtBr: 'Operações da Plataforma',
    requiresEventContext: true,
    adminOnly: true
  },
  globalSearch: {
    pageKey: 'event-global-search',
    canonicalPath: '/eventos/:eventId/search',
    labelPtBr: 'Pesquisa Global',
    requiresEventContext: true
  }
}

/**
 * Validador de contexto de evento para evitar perda ou drift de eventId.
 */
export function validateNavigationContext(
  target: PageDestination,
  eventId?: number | null
): { allowed: boolean; reason?: string } {
  const definition = Object.values(EVENT_OS_NAVIGATION).find(d => d.pageKey === target)

  if (definition?.requiresEventContext && (!eventId || eventId <= 0)) {
    return {
      allowed: false,
      reason: 'AÇÃO BLOQUEADA: Selecione um evento antes de continuar para este módulo.'
    }
  }

  return { allowed: true }
}
