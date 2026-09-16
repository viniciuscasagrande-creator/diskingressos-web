// ==============================================================================
// FASE 29.14.1.2 — DESIGN SYSTEM KOMPOSO / DISKINGRESSOS
// Camada de Verificação de Permissões da Navegação (RBAC + ABAC)
// ==============================================================================

import { canAccess, isGlobalAdmin, type AppUser } from '../../auth/model'
import type { NavigationItem, NavigationGroup } from './navigation.types'

type AccessArea = 'events' | 'finance' | 'pos' | 'admin' | 'marketing' | 'remarketing' | 'sac'

function mapPermToArea(perm: string): AccessArea {
  if (perm.startsWith('finance') || perm.startsWith('contabilidade')) return 'finance'
  if (perm.startsWith('marketing')) return 'marketing'
  if (perm.startsWith('remarketing')) return 'remarketing'
  if (perm.startsWith('sac')) return 'sac'
  if (perm.startsWith('pos')) return 'pos'
  if (perm.startsWith('admin')) return 'admin'
  return 'events'
}

export function isItemAuthorized(item: NavigationItem, user: AppUser | null): boolean {
  if (!user) return false

  // Se o usuário é Global Admin (master ou admin), tem acesso irrestrito
  if (isGlobalAdmin(user)) return true

  // Verificação por roles explícitas do item
  if (item.roles && item.roles.length > 0) {
    if (!item.roles.includes(user.role)) {
      return false
    }
  }

  // Verificação de permissões específicas
  if (item.permissions && item.permissions.length > 0) {
    for (const perm of item.permissions) {
      if (!canAccess(user, mapPermToArea(perm))) {
        return false
      }
    }
  }

  return true
}

export function isGroupAuthorized(group: NavigationGroup, user: AppUser | null): boolean {
  if (!user) return false
  if (isGlobalAdmin(user)) return true

  if (group.roles && group.roles.length > 0) {
    if (!group.roles.includes(user.role)) {
      return false
    }
  }

  if (group.permissions && group.permissions.length > 0) {
    for (const perm of group.permissions) {
      if (!canAccess(user, mapPermToArea(perm))) {
        return false
      }
    }
  }

  return true
}
