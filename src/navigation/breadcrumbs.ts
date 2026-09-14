// ==============================================================================
// FASE 28.15.6 — BREADCRUMB MANAGER
// Geração e gerenciamento contextual de breadcrumbs (Módulo › Evento › Subtela)
// ==============================================================================

import type { RouteConfig } from './routes'
import { AppContext, type AppContextState } from '../context/app-context'

export interface BreadcrumbItem {
  label: string
  path?: string
  isCurrent?: boolean
}

export const BreadcrumbManager = {
  /**
   * Resolve a lista de itens de breadcrumb a partir da rota atual e do contexto de produtor/evento.
   */
  resolve(route: RouteConfig, contextState?: AppContextState): BreadcrumbItem[] {
    const context = contextState || AppContext.getState()
    const rawCrumbs = route.breadcrumb || [route.title || 'DiskIngressos']

    // Se houver evento ativo e a rota exigir contexto de evento ou for contextualizada
    const hasEventContext = (route.context?.event || Boolean(context.eventId)) && Boolean(context.eventName)

    let items: string[] = []

    if (hasEventContext && context.eventName) {
      // Exemplo: Marketing › Festival XYZ 2026 › Pixels e Conversões
      if (rawCrumbs.length >= 2) {
        const first = rawCrumbs[0]
        const remaining = rawCrumbs.slice(1)
        // Evita duplicar se o evento já estiver explicitamente no breadcrumb
        if (!remaining.includes(context.eventName)) {
          items = [first, context.eventName, ...remaining]
        } else {
          items = [...rawCrumbs]
        }
      } else {
        items = [rawCrumbs[0] || 'Módulo', context.eventName, route.title]
      }
    } else {
      items = [...rawCrumbs]
    }

    // Mapeia para objetos com indicação de item atual
    return items.map((label, index) => {
      const isCurrent = index === items.length - 1
      let path: string | undefined = undefined

      // Atribui links aos itens ancestrais comuns
      if (index === 0) {
        if (label === 'Início' || label === 'Dashboard') path = '/dashboard'
        else if (label === 'Eventos') path = '/eventos'
        else if (label === 'Financeiro') path = '/financeiro/dashboard'
        else if (label === 'Marketing') path = '/marketing/dashboard'
        else if (label === 'Contabilidade') path = '/contabilidade/dashboard'
        else if (label === 'Atendimento' || label === 'SAC') path = '/sac'
      }

      return {
        label,
        path: isCurrent ? undefined : path,
        isCurrent
      }
    })
  }
}
