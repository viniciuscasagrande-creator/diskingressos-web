// ==============================================================================
// FASE 29.14.1.2 — DESIGN SYSTEM KOMPOSO / DISKINGRESSOS
// Utilitários de Navegação e Filtragem Contextual
// ==============================================================================

import type { AppUser } from '../../auth/model'
import type { PageKey } from '../../components/ModuleSidebar'
import type { NavigationGroup, NavigationItem, NavScope, BreadcrumbCrumb } from './navigation.types'
import { isGroupAuthorized, isItemAuthorized } from './navigation.permissions'

export interface FilterNavigationOptions {
  user: AppUser | null
  scope: NavScope
  producerId: number | null
  eventId: number | null
}

export function filterNavigation(
  groups: NavigationGroup[],
  options: FilterNavigationOptions
): NavigationGroup[] {
  const { user, scope, eventId } = options

  return groups
    .filter((group) => isGroupAuthorized(group, user))
    .map((group) => {
      const authorizedItems = group.items.filter((item) => {
        // Checa permissão do item
        if (!isItemAuthorized(item, user)) return false

        // Se estamos no contexto de evento individual, itens globais que não fazem sentido podem ser ajustados
        if (scope === 'event' && item.scope === 'global' && item.pageKey === 'events') {
          return true
        }

        return true
      })

      return {
        ...group,
        items: authorizedItems
      }
    })
    // 29.14.1.2.49: Elimina grupos sem nenhum item disponível
    .filter((group) => group.items.length > 0)
}

export function findNavigationItemByPageKey(
  groups: NavigationGroup[],
  pageKey: PageKey
): NavigationItem | null {
  for (const group of groups) {
    for (const item of group.items) {
      if (item.pageKey === pageKey) return item
      if (item.children) {
        const sub = item.children.find((c) => c.pageKey === pageKey)
        if (sub) return sub
      }
    }
  }
  return null
}

export function buildBreadcrumbs(
  pageKey: PageKey,
  groups: NavigationGroup[],
  contextInfo?: { producerName?: string | null; eventName?: string | null }
): BreadcrumbCrumb[] {
  const crumbs: BreadcrumbCrumb[] = [{ id: 'home', label: 'Início', path: '/dashboard' }]

  if (contextInfo?.producerName) {
    crumbs.push({ id: 'producer', label: contextInfo.producerName, path: '/eventos' })
  }

  if (contextInfo?.eventName) {
    crumbs.push({ id: 'event', label: contextInfo.eventName })
  }

  const activeItem = findNavigationItemByPageKey(groups, pageKey)
  if (activeItem) {
    crumbs.push({
      id: activeItem.id,
      label: activeItem.label,
      path: activeItem.path,
      isCurrent: true
    })
  } else {
    crumbs.push({
      id: String(pageKey),
      label: formatFallbackTitle(pageKey),
      isCurrent: true
    })
  }

  return crumbs
}

function formatFallbackTitle(pageKey: string): string {
  const clean = pageKey.replace(/^(finance-|accounting-|marketing-|event-|sac-)/, '')
  return clean
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
