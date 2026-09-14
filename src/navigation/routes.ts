// ==============================================================================
// FASE 28.15.1 + 28.15.4 — MAPA DE ROTAS UNIFICADO DO PDT DISKINGRESSOS
// ==============================================================================

import {
  ACCOUNTING_ROUTES,
  ACCOUNTING_TAB_TO_ROUTE,
  resolveAccountingRoute,
  type AccountingRouteDefinition
} from './accounting-routes'

export interface RouteConfig {
  path: string
  view: string
  module: string
  tab?: string | null
  title: string
  menuKey?: string
  breadcrumb?: string[]
}

export const CANONICAL_ROUTES: Record<string, RouteConfig> = {
  '/dashboard': {
    path: '/dashboard',
    view: 'profile-dashboard',
    module: 'events',
    title: 'Meu Dashboard',
    menuKey: 'profile-dashboard',
    breadcrumb: ['Início', 'Dashboard']
  },
  '/eventos': {
    path: '/eventos',
    view: 'events',
    module: 'events',
    title: 'Todos os Eventos',
    menuKey: 'events',
    breadcrumb: ['Eventos', 'Todos os Eventos']
  },
  '/financeiro/dashboard': {
    path: '/financeiro/dashboard',
    view: 'finance-dashboard',
    module: 'financeiro',
    title: 'Dashboard Financeiro',
    menuKey: 'finance-dashboard',
    breadcrumb: ['Financeiro', 'Dashboard']
  },
  '/marketing/dashboard': {
    path: '/marketing/dashboard',
    view: 'marketing-dashboard',
    module: 'marketing',
    title: 'Dashboard Marketing',
    menuKey: 'marketing-dashboard',
    breadcrumb: ['Marketing', 'Dashboard']
  },
  '/sac': {
    path: '/sac',
    view: 'sac-hub',
    module: 'sac',
    title: 'Atendimento / SAC',
    menuKey: 'sac-hub',
    breadcrumb: ['Atendimento', 'SAC']
  },
  // Injeta as 12 rotas contábeis canônicas
  ...ACCOUNTING_ROUTES
}

export const LEGACY_ROUTE_ALIASES: Record<string, string> = {
  'accounting-disk': '/contabilidade/dashboard',
  'view-accounting-disk': '/contabilidade/dashboard',
  'accounting-dashboard': '/contabilidade/dashboard',
  'accounting-chart': '/contabilidade/plano-de-contas',
  'accounting-journal': '/contabilidade/lancamentos',
  'accounting-ledger': '/contabilidade/lancamentos',
  'accounting-entries': '/contabilidade/lancamentos',
  'accounting-cost-centers': '/contabilidade/plano-de-contas',
  'accounting-reconciliation': '/contabilidade/conciliacao',
  'accounting-closing': '/contabilidade/fechamento',
  'accounting-dre': '/contabilidade/dre',
  'accounting-taxes': '/contabilidade/fiscal',
  'accounting-sped': '/contabilidade/fiscal',
  'accounting-balance-sheet': '/contabilidade/balanco',
  'accounting-trial-balance': '/contabilidade/balanco',
  'finance-accounting': '/contabilidade/dashboard',
  'finance-chart-accounts': '/contabilidade/plano-de-contas',
  'finance-cost-centers': '/contabilidade/plano-de-contas',
  'finance-accounting-entries': '/contabilidade/lancamentos',
  'finance-obligations': '/contabilidade/fiscal',
  'finance-dre': '/contabilidade/dre',
  'finance-borderos': '/contabilidade/documentos',
  'finance-signatures': '/contabilidade/documentos',
  'finance-closing': '/contabilidade/fechamento',
  'contabilidade': '/contabilidade/dashboard',
  'financial-dashboard': '/financeiro/dashboard',
  'financeiro': '/financeiro/dashboard',
  'marketing-hub': '/marketing/dashboard',
  'marketing-overview': '/marketing/dashboard',
  'dashboard-main': '/dashboard'
}

export function resolveRoute(pathOrAlias: string): RouteConfig {
  if (!pathOrAlias) {
    return CANONICAL_ROUTES['/dashboard']
  }

  const raw = pathOrAlias.trim()
  const clean = raw.replace(/^#\/?/, '/').replace(/^\/app\//, '/').split('?')[0].split('#')[0]
  const normalizedPath = clean.startsWith('/') ? clean : `/${clean}`

  // 1. Match direto em rota canônica
  if (CANONICAL_ROUTES[normalizedPath]) {
    return CANONICAL_ROUTES[normalizedPath]
  }

  // 2. É rota de contabilidade?
  if (normalizedPath.startsWith('/contabilidade')) {
    return resolveAccountingRoute(normalizedPath)
  }

  // 3. Alias legado sem barra ou com barra
  const aliasKey = raw.replace(/^#\/?/, '').replace(/^\/app\//, '').replace(/^\//, '')
  if (LEGACY_ROUTE_ALIASES[aliasKey]) {
    const canonical = LEGACY_ROUTE_ALIASES[aliasKey]
    return CANONICAL_ROUTES[canonical] || resolveAccountingRoute(canonical)
  }

  if (LEGACY_ROUTE_ALIASES[normalizedPath]) {
    const canonical = LEGACY_ROUTE_ALIASES[normalizedPath]
    return CANONICAL_ROUTES[canonical] || resolveAccountingRoute(canonical)
  }

  // 4. Default fallback
  return {
    path: normalizedPath,
    view: aliasKey || 'events',
    module: normalizedPath.includes('contabilidade') ? 'contabilidade' : 'events',
    title: 'DiskIngressos',
    breadcrumb: ['DiskIngressos']
  }
}
