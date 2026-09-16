// ==============================================================================
// FASE 29.14.1.2 — DESIGN SYSTEM KOMPOSO / DISKINGRESSOS
// Camada de Tipos da Navegação Declarativa Unificada
// ==============================================================================

import type { ComponentType } from 'react'
import type { PageKey } from '../../components/ModuleSidebar'
import type { Role } from '../../auth/model'

export type NavScope = 'global' | 'producer' | 'event'

export interface NavigationItem {
  id: string
  label: string
  pageKey: PageKey
  path?: string
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  badge?: string
  scope: NavScope
  permissions?: string[]
  roles?: Role[]
  children?: NavigationItem[]
  isProtectedModule?: boolean
  description?: string
  tier?: 'standard' | 'advanced' | 'expert'
}

export interface NavigationGroup {
  id: string
  label: string
  icon?: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  scope: NavScope
  permissions?: string[]
  roles?: Role[]
  items: NavigationItem[]
}

export interface BreadcrumbCrumb {
  id: string
  label: string
  path?: string
  isCurrent?: boolean
}
