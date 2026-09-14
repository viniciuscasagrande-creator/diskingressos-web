// ==============================================================================
// FASE 28.15.6 — CONTEXTGUARD
// Validação de contexto obrigatório (Produtor e/ou Evento) antes da renderização
// ==============================================================================

import type { RouteConfig } from '../navigation/routes'
import { AppContext, type AppContextState } from '../context/app-context'

export type ContextBlockedReason = 'need_producer' | 'need_event'

export interface ContextCheckResult {
  allowed: boolean
  blockedReason?: ContextBlockedReason
  message?: string
}

export const ContextGuard = {
  /**
   * Verifica se a rota possui exigências de contexto (produtor ou evento)
   * que não estão atendidas no AppContext atual.
   */
  checkRoute(route: RouteConfig, contextState?: AppContextState): ContextCheckResult {
    const context = contextState || AppContext.getState()

    // Rotas abertas ou sem exigência de contexto
    if (!route.context) {
      return { allowed: true }
    }

    // 1. Exigência de Produtor
    if (route.context.producer && !context.producerId) {
      AppContext.recordAudit(
        'CONTEXT_ACCESS_DENIED',
        'DENIED',
        `Acesso bloqueado: rota ${route.path} exige seleção de produtor`,
        route.path
      )
      return {
        allowed: false,
        blockedReason: 'need_producer',
        message: 'Selecione um produtor para continuar'
      }
    }

    // 2. Exigência de Evento
    if (route.context.event && !context.eventId) {
      AppContext.recordAudit(
        'CONTEXT_ACCESS_DENIED',
        'DENIED',
        `Acesso bloqueado: rota ${route.path} exige seleção de evento`,
        route.path
      )
      return {
        allowed: false,
        blockedReason: 'need_event',
        message: 'Selecione um evento para continuar'
      }
    }

    return { allowed: true }
  }
}
