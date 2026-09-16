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
  '/financeiro/conta-financeira': {
    path: '/financeiro/conta-financeira',
    view: 'finance-hub-account',
    module: 'financeiro',
    title: 'Conta Financeira',
    menuKey: 'finance-hub-account',
    breadcrumb: ['Financeiro', 'Conta Financeira'],
    context: { producer: true, event: false },
    permissions: ['financeiro.visualizar']
  },
  '/financeiro/contas': {
    path: '/financeiro/contas',
    view: 'finance-hub-bills',
    module: 'financeiro',
    title: 'Contas & Compromissos',
    menuKey: 'finance-hub-bills',
    breadcrumb: ['Financeiro', 'Contas'],
    context: { producer: true, event: false },
    permissions: ['financeiro.visualizar']
  },
  '/financeiro/tesouraria': {
    path: '/financeiro/tesouraria',
    view: 'finance-hub-treasury',
    module: 'financeiro',
    title: 'Tesouraria',
    menuKey: 'finance-hub-treasury',
    breadcrumb: ['Financeiro', 'Tesouraria'],
    context: { producer: true, event: false },
    permissions: ['financeiro.visualizar']
  },
  '/financeiro/compras-fornecedores': {
    path: '/financeiro/compras-fornecedores',
    view: 'finance-hub-procurement',
    module: 'financeiro',
    title: 'Compras & Fornecedores',
    menuKey: 'finance-hub-procurement',
    breadcrumb: ['Financeiro', 'Compras & Fornecedores'],
    context: { producer: true, event: false },
    permissions: ['financeiro.visualizar']
  },
  '/financeiro/controladoria': {
    path: '/financeiro/controladoria',
    view: 'finance-hub-controlling',
    module: 'financeiro',
    title: 'Controladoria',
    menuKey: 'finance-hub-controlling',
    breadcrumb: ['Financeiro', 'Controladoria'],
    context: { producer: true, event: false },
    permissions: ['financeiro.visualizar']
  },
  '/financeiro/conciliacao': {
    path: '/financeiro/conciliacao',
    view: 'finance-hub-reconciliation',
    module: 'financeiro',
    title: 'Conciliação',
    menuKey: 'finance-hub-reconciliation',
    breadcrumb: ['Financeiro', 'Conciliação'],
    context: { producer: true, event: false },
    permissions: ['financeiro.visualizar']
  },
  '/financeiro/relatorios': {
    path: '/financeiro/relatorios',
    view: 'finance-hub-reports',
    module: 'financeiro',
    title: 'Relatórios Financeiros',
    menuKey: 'finance-hub-reports',
    breadcrumb: ['Financeiro', 'Relatórios'],
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
    permissions: ['financeiro.transferencias.executar', 'financeiro.visualizar']
  },
  '/financial-core': {
    path: '/financial-core',
    view: 'financial-core',
    module: 'financeiro',
    title: 'Núcleo Financeiro & Contábil Enterprise',
    menuKey: 'finance-dashboard',
    breadcrumb: ['Financeiro', 'Núcleo Enterprise'],
    context: { producer: true, event: false },
    permissions: ['financeiro.visualizar']
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
  '/marketing/campanhas': {
    path: '/marketing/campanhas',
    view: 'marketing-hub-campaigns',
    module: 'marketing',
    title: 'Campanhas',
    menuKey: 'marketing-hub-campaigns',
    breadcrumb: ['Marketing', 'Campanhas'],
    context: { producer: true, event: false },
    permissions: ['marketing.visualizar']
  },
  '/marketing/comunicacao': {
    path: '/marketing/comunicacao',
    view: 'marketing-hub-communication',
    module: 'marketing',
    title: 'Comunicação',
    menuKey: 'marketing-hub-communication',
    breadcrumb: ['Marketing', 'Comunicação'],
    context: { producer: true, event: false },
    permissions: ['marketing.visualizar']
  },
  '/marketing/analytics': {
    path: '/marketing/analytics',
    view: 'marketing-hub-analytics',
    module: 'marketing',
    title: 'Analytics de Marketing',
    menuKey: 'marketing-hub-analytics',
    breadcrumb: ['Marketing', 'Analytics'],
    context: { producer: true, event: false },
    permissions: ['marketing.visualizar']
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
    view: 'marketing-hub-pixels',
    module: 'marketing',
    title: 'Pixels e Conversões',
    menuKey: 'marketing-hub-pixels',
    breadcrumb: ['Marketing', 'Pixels e Conversões'],
    context: { producer: true, event: true },
    permissions: ['marketing.pixels.gerenciar', 'marketing.visualizar']
  },
  '/contabilidade/operacao': {
    path: '/contabilidade/operacao',
    view: 'accounting-hub-operations',
    module: 'contabilidade',
    title: 'Operação Contábil',
    menuKey: 'accounting-hub-operations',
    breadcrumb: ['Contabilidade', 'Operação Contábil'],
    context: { producer: true, event: false },
    permissions: ['contabilidade.visualizar']
  },
  '/contabilidade/demonstracoes': {
    path: '/contabilidade/demonstracoes',
    view: 'accounting-hub-statements',
    module: 'contabilidade',
    title: 'Demonstrações Contábeis',
    menuKey: 'accounting-hub-statements',
    breadcrumb: ['Contabilidade', 'Demonstrações'],
    context: { producer: true, event: false },
    permissions: ['contabilidade.visualizar']
  },
  '/contabilidade/fiscal-compliance': {
    path: '/contabilidade/fiscal-compliance',
    view: 'accounting-hub-compliance',
    module: 'contabilidade',
    title: 'Fiscal & Compliance',
    menuKey: 'accounting-hub-compliance',
    breadcrumb: ['Contabilidade', 'Fiscal & Compliance'],
    context: { producer: true, event: false },
    permissions: ['contabilidade.visualizar']
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
  '/commerce-orders': {
    path: '/commerce-orders',
    view: 'commerce-orders',
    module: 'events',
    title: 'Pedidos & Vendas',
    menuKey: 'commerce-orders',
    breadcrumb: ['Vendas', 'Pedidos & Vendas'],
    context: { producer: true, event: false },
    permissions: ['eventos.visualizar']
  },
  '/payments': {
    path: '/payments',
    view: 'payments-hub',
    module: 'financeiro',
    title: 'Central de Pagamentos',
    menuKey: 'payments-hub',
    breadcrumb: ['Financeiro', 'Pagamentos'],
    context: { producer: true, event: false },
    permissions: ['financeiro.visualizar']
  },
  '/tickets': {
    path: '/tickets',
    view: 'tickets-hub',
    module: 'events',
    title: 'Central de Ingressos & Credenciais',
    menuKey: 'tickets-hub',
    breadcrumb: ['Ingressos', 'Central de Ingressos'],
    context: { producer: true, event: false },
    permissions: ['eventos.visualizar']
  },
  '/access-control': {
    path: '/access-control',
    view: 'access-control-hub',
    module: 'events',
    title: 'Central de Controle de Acesso',
    menuKey: 'access-control-hub',
    breadcrumb: ['Acesso', 'Disk Acesso'],
    context: { producer: true, event: false },
    permissions: ['eventos.visualizar']
  },
  '/customers': {
    path: '/customers',
    view: 'customer-search-hub',
    module: 'sac',
    title: 'Central de Consulta de Clientes',
    menuKey: 'customer-search-hub',
    breadcrumb: ['Clientes', 'Consulta Unificada'],
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
  'financial-dashboard': '/financeiro/dashboard',
  'financeiro': '/financeiro/dashboard',
  'finance-dashboard': '/financeiro/dashboard',
  'finance-hub': '/financeiro/conta-financeira',
  'finance-receivables': '/financeiro/contas',
  'finance-bank-accounts': '/financeiro/tesouraria',
  'finance-expenses': '/financeiro/compras-fornecedores',
  'finance-cost-centers': '/financeiro/controladoria',
  'finance-reconciliation': '/financeiro/conciliacao',
  'finance-reports': '/financeiro/relatorios',
  'financeiro/tesouraria/pix': '/app/finance-methods',
  'financeiro/tesouraria/contas': '/app/finance-bank-accounts',
  'finance': '/financeiro/saldos',
  'finance-refunds': '/financeiro/estornos',
  'marketing-hub': '/marketing/dashboard',
  'marketing-overview': '/marketing/dashboard',
  'marketing-campaigns': '/marketing/campanhas',
  'marketing-communications': '/marketing/comunicacao',
  'marketing-reports': '/marketing/analytics',
  'marketing-tracking': '/marketing/pixels',
  'marketing-pixels': '/marketing/pixels',
  'dashboard-main': '/dashboard',
  'finance-hub-account': '/financeiro/conta-financeira',
  'finance-hub-bills': '/financeiro/contas',
  'finance-hub-treasury': '/financeiro/tesouraria',
  'finance-hub-procurement': '/financeiro/compras-fornecedores',
  'finance-hub-controlling': '/financeiro/controladoria',
  'finance-hub-reconciliation': '/financeiro/conciliacao',
  'finance-hub-reports': '/financeiro/relatorios',
  'accounting-hub-operations': '/contabilidade/operacao',
  'accounting-hub-statements': '/contabilidade/demonstracoes',
  'accounting-hub-compliance': '/contabilidade/fiscal-compliance',
  'marketing-hub-campaigns': '/marketing/campanhas',
  'marketing-hub-communication': '/marketing/comunicacao',
  'marketing-hub-pixels': '/marketing/pixels',
  'marketing-hub-analytics': '/marketing/analytics',
  'commerce-orders': '/commerce-orders',
  'pedidos': '/commerce-orders',
  'payments': '/payments',
  'payments-hub': '/payments',
  'pagamentos': '/payments',
  'tickets': '/tickets',
  'tickets-hub': '/tickets',
  'ingressos': '/tickets',
  'access-control': '/access-control',
  'access-control-hub': '/access-control',
  'access': '/access-control',
  'acesso': '/access-control',
  'customers': '/customers',
  'customer-search-hub': '/customers',
  'clientes': '/customers'
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
