// ==============================================================================
// FASE 28.15.1 + 28.15.4 + 28.15.6 — MAPA DE ROTAS UNIFICADO DO PDT DISKINGRESSOS
// Camada de rotas com requisitos de contexto (Produtor/Evento) e permissões granulares
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
  context?: {
    producer?: boolean
    event?: boolean
  }
  permissions?: string[]
  guardState?: {
    allowed: boolean
    blockedReason?: 'unauthorized' | 'need_producer' | 'need_event'
    message?: string
  }
}

export const CANONICAL_ROUTES: Record<string, RouteConfig> = {
  '/dashboard': {
    path: '/dashboard',
    view: 'profile-dashboard',
    module: 'events',
    title: 'Meu Dashboard',
    menuKey: 'profile-dashboard',
    breadcrumb: ['Início', 'Dashboard'],
    context: { producer: false, event: false },
    permissions: ['eventos.visualizar']
  },
  '/eventos': {
    path: '/eventos',
    view: 'events',
    module: 'events',
    title: 'Todos os Eventos',
    menuKey: 'events',
    breadcrumb: ['Eventos', 'Todos os Eventos'],
    context: { producer: false, event: false },
    permissions: ['eventos.visualizar']
  },
  '/financeiro/dashboard': {
    path: '/financeiro/dashboard',
    view: 'finance-dashboard',
    module: 'financeiro',
    title: 'Dashboard Financeiro',
    menuKey: 'finance-dashboard',
    breadcrumb: ['Financeiro', 'Dashboard'],
    context: { producer: true, event: false },
    permissions: ['financeiro.visualizar']
  },
  '/financeiro/saldos': {
    path: '/financeiro/saldos',
    view: 'finance',
    module: 'financeiro',
    title: 'Gestão de Saldos',
    menuKey: 'finance',
    breadcrumb: ['Financeiro', 'Gestão de Saldos'],
    context: { producer: true, event: false },
    permissions: ['financeiro.saldos.visualizar', 'financeiro.visualizar']
  },
  '/financeiro/estornos': {
    path: '/financeiro/estornos',
    view: 'finance-refunds',
    module: 'financeiro',
    title: 'Centro de Controle de Estornos',
    menuKey: 'finance-refunds',
    breadcrumb: ['Financeiro', 'Estornos'],
    context: { producer: true, event: false },
    permissions: ['financeiro.estornos.executar', 'financeiro.visualizar']
  },
  '/financeiro/transferencias': {
    path: '/financeiro/transferencias',
    view: 'finance',
    module: 'financeiro',
    title: 'Transferências entre Eventos',
    menuKey: 'finance',
    breadcrumb: ['Financeiro', 'Transferências'],
    context: { producer: true, event: false },
    permissions: ['financeiro.transferencias.criar', 'financeiro.visualizar']
  },
  '/app/finance-chart-accounts': {
    path: '/app/finance-chart-accounts',
    view: 'finance-chart-accounts',
    module: 'financeiro',
    title: 'Plano de Contas',
    menuKey: 'finance-chart-accounts',
    breadcrumb: ['Financeiro', 'Plano de Contas'],
    context: { producer: false, event: false },
    permissions: ['financeiro.visualizar']
  },
  '/app/finance-cost-centers': {
    path: '/app/finance-cost-centers',
    view: 'finance-cost-centers',
    module: 'financeiro',
    title: 'Centro de Custos',
    menuKey: 'finance-cost-centers',
    breadcrumb: ['Financeiro', 'Centro de Custos'],
    context: { producer: false, event: false },
    permissions: ['financeiro.visualizar']
  },
  '/marketing/dashboard': {
    path: '/marketing/dashboard',
    view: 'marketing-dashboard',
    module: 'marketing',
    title: 'Dashboard Marketing',
    menuKey: 'marketing-dashboard',
    breadcrumb: ['Marketing', 'Dashboard'],
    context: { producer: true, event: false },
    permissions: ['marketing.visualizar']
  },
  '/marketing/pixels': {
    path: '/marketing/pixels',
    view: 'marketing-tracking',
    module: 'marketing',
    title: 'Pixels e Conversões',
    menuKey: 'marketing-tracking',
    breadcrumb: ['Marketing', 'Pixels e Conversões'],
    context: { producer: true, event: true },
    permissions: ['marketing.pixels.gerenciar', 'marketing.visualizar']
  },
  '/marketing/spotify': {
    path: '/marketing/spotify',
    view: 'marketing-spotify',
    module: 'marketing',
    title: 'Spotify Ads & Conversões CAPI',
    menuKey: 'marketing-spotify',
    breadcrumb: ['Marketing', 'Spotify Ads & CAPI'],
    context: { producer: true, event: false },
    permissions: ['marketing.visualizar']
  },
  '/sac': {
    path: '/sac',
    view: 'sac-hub',
    module: 'sac',
    title: 'Atendimento / SAC',
    menuKey: 'sac-hub',
    breadcrumb: ['Atendimento', 'SAC'],
    context: { producer: false, event: false },
    permissions: ['sac.visualizar']
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
  'finance-chart-accounts': '/app/finance-chart-accounts',
  'finance-cost-centers': '/app/finance-cost-centers',
  'finance-accounting-entries': '/contabilidade/lancamentos',
  'finance-obligations': '/contabilidade/fiscal',
  'finance-dre': '/contabilidade/dre',
  'finance-borderos': '/contabilidade/documentos',
  'finance-signatures': '/contabilidade/documentos',
  'finance-closing': '/contabilidade/fechamento',
  'contabilidade': '/contabilidade/dashboard',
  'financial-dashboard': '/financeiro/dashboard',
  'financeiro': '/financeiro/dashboard',
  'finance-dashboard': '/financeiro/dashboard',
  'finance': '/financeiro/saldos',
  'finance-refunds': '/financeiro/estornos',
  'marketing-hub': '/marketing/dashboard',
  'marketing-overview': '/marketing/dashboard',
  'marketing-tracking': '/marketing/pixels',
  'marketing-pixels': '/marketing/pixels',
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

  // 4. Detecção de rota de contexto de evento: /eventos/:code/*
  const eventRouteMatch = normalizedPath.match(/^\/eventos\/([^\/]+)(?:\/(.+))?$/)
  if (eventRouteMatch) {
    const sub = eventRouteMatch[2] || 'dashboard'
    return {
      path: normalizedPath,
      view: `event-${sub}`,
      module: 'events',
      title: sub === 'pixel' ? 'Pixel e Rastreamento' : 'Dashboard do Evento',
      breadcrumb: ['Eventos', 'Dashboard do Evento'],
      context: { producer: true, event: true },
      permissions: ['eventos.visualizar']
    }
  }

  // 5. Default fallback
  const isFinance = normalizedPath.includes('finance') || normalizedPath.includes('fin-')
  const isMkt = normalizedPath.includes('marketing')
  const isAcc = normalizedPath.includes('contabilidade') || normalizedPath.includes('accounting')
  const isSac = normalizedPath.includes('sac')

  return {
    path: normalizedPath,
    view: aliasKey || 'events',
    module: isAcc ? 'contabilidade' : isFinance ? 'financeiro' : isMkt ? 'marketing' : isSac ? 'sac' : 'events',
    title: 'DiskIngressos',
    breadcrumb: ['DiskIngressos'],
    context: {
      producer: isFinance || isMkt || isAcc,
      event: false
    },
    permissions: isFinance
      ? ['financeiro.visualizar']
      : isMkt
      ? ['marketing.visualizar']
      : isAcc
      ? ['contabilidade.visualizar']
      : ['eventos.visualizar']
  }
}
