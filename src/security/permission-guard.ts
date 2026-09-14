// ==============================================================================
// FASE 28.15.6 — PERMISSIONGUARD
// Validação granular de permissões e perfis por rota e ação
// ==============================================================================

import type { AppUser, Role } from '../auth/model'
import { isGlobalAdmin, canAccess } from '../auth/model'
import type { RouteConfig } from '../navigation/routes'
import { AppContext } from '../context/app-context'

export interface PermissionCheckResult {
  allowed: boolean
  reason?: string
}

// Matriz de permissões atribuídas a cada perfil de usuário
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  'admin-master': ['*'],
  'admin': ['*'],
  'producer-admin': [
    'eventos.*',
    'financeiro.*',
    'contabilidade.*',
    'marketing.*',
    'sac.*',
    'pos.*'
  ],
  'producer-finance': [
    'financeiro.*',
    'contabilidade.*',
    'eventos.visualizar'
  ],
  'producer-marketing': [
    'marketing.*',
    'eventos.visualizar'
  ],
  'producer-operation': [
    'eventos.*',
    'pos.*',
    'sac.*'
  ],
  'viewer': [
    'eventos.visualizar',
    'financeiro.visualizar',
    'financeiro.saldos.visualizar',
    'contabilidade.visualizar',
    'marketing.visualizar',
    'sac.visualizar',
    'sac.pedidos.consultar',
    'pos.visualizar'
  ]
}

export const PermissionGuard = {
  /**
   * Verifica se o usuário autenticado possui uma ou mais permissões específicas.
   */
  hasPermission(user: AppUser | null, permissionOrPermissions: string | string[]): boolean {
    if (!user) return false
    if (isGlobalAdmin(user)) return true

    const userRole = user.role
    const userGranted = ROLE_PERMISSIONS[userRole] || []

    // Suporte a curinga global
    if (userGranted.includes('*')) return true

    const needed = Array.isArray(permissionOrPermissions)
      ? permissionOrPermissions
      : [permissionOrPermissions]

    if (needed.length === 0) return true

    // Todas as permissões exigidas devem ser atendidas
    return needed.every((reqPerm) => {
      // Checagem direta
      if (userGranted.includes(reqPerm)) return true

      // Checagem por curinga de módulo (ex: financeiro.* cobre financeiro.transferencias.criar)
      const prefix = reqPerm.split('.')[0] + '.*'
      if (userGranted.includes(prefix)) return true

      return false
    })
  },

  /**
   * Valida o acesso à rota especificada para o usuário autenticado.
   */
  checkRoute(route: RouteConfig, user: AppUser | null): PermissionCheckResult {
    // Rotas públicas ou abertas (ex: login, dashboard inicial básico)
    if (route.path === '/login' || route.path === '/dashboard' || route.view === 'profile-dashboard') {
      return { allowed: true }
    }

    if (!user) {
      return {
        allowed: false,
        reason: 'Sessão não autenticada. Faça login para continuar.'
      }
    }

    if (isGlobalAdmin(user)) {
      return { allowed: true }
    }

    // 1. Validação por permissões granulares explícitas na rota
    if (route.permissions && route.permissions.length > 0) {
      const hasGranular = this.hasPermission(user, route.permissions)
      if (!hasGranular) {
        AppContext.recordAudit(
          'PERMISSION_DENIED',
          'DENIED',
          `Acesso negado: perfil ${user.role} não possui permissão [${route.permissions.join(', ')}]`,
          route.path
        )
        return {
          allowed: false,
          reason: 'Você não possui permissão para acessar esta funcionalidade.'
        }
      }
    }

    // 2. Validação de compatibilidade por módulo (canAccess existente)
    const areaMap: Record<string, 'events' | 'finance' | 'pos' | 'admin' | 'marketing' | 'remarketing' | 'sac'> = {
      events: 'events',
      financeiro: 'finance',
      finance: 'finance',
      contabilidade: 'finance',
      accounting: 'finance',
      marketing: 'marketing',
      remarketing: 'remarketing',
      sac: 'sac',
      pos: 'pos',
      admin: 'admin'
    }

    const area = areaMap[route.module] || 'events'
    if (!canAccess(user, area)) {
      AppContext.recordAudit(
        'PERMISSION_DENIED',
        'DENIED',
        `Acesso negado: perfil ${user.role} não possui permissão para o módulo ${route.module}`,
        route.path
      )
      return {
        allowed: false,
        reason: 'Você não possui permissão para acessar esta funcionalidade.'
      }
    }

    return { allowed: true }
  }
}
