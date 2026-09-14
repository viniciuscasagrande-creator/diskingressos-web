// ==============================================================================
// FASE 28.15.4 — CONSOLIDAÇÃO CONTABILIDADE + SUBROTAS
// Rotas canônicas, abas, metadados e compatibilidade da Contabilidade
// ==============================================================================

export type AccountingTabKey =
  | 'dashboard'
  | 'inteligencia'
  | 'conciliacao'
  | 'rastreabilidade'
  | 'dre'
  | 'balanco'
  | 'fechamento'
  | 'plano-de-contas'
  | 'lancamentos'
  | 'documentos'
  | 'fiscal'
  | 'relatorios'

export interface AccountingRouteDefinition {
  path: string
  subroute: string
  tab: AccountingTabKey
  menuKey: string
  pageKey: string
  title: string
  shortTitle: string
  view: 'accounting-disk'
  module: 'contabilidade'
  breadcrumb: string[]
  context?: {
    producer?: boolean
    event?: boolean
  }
  permissions?: string[]
}

export const ACCOUNTING_TAB_TO_ROUTE: Record<AccountingTabKey, string> = {
  dashboard: '/contabilidade/dashboard',
  inteligencia: '/contabilidade/inteligencia',
  conciliacao: '/contabilidade/conciliacao',
  rastreabilidade: '/contabilidade/rastreabilidade',
  dre: '/contabilidade/dre',
  balanco: '/contabilidade/balanco',
  fechamento: '/contabilidade/fechamento',
  'plano-de-contas': '/contabilidade/plano-de-contas',
  lancamentos: '/contabilidade/lancamentos',
  documentos: '/contabilidade/documentos',
  fiscal: '/contabilidade/fiscal',
  relatorios: '/contabilidade/relatorios'
}

export const ACCOUNTING_ROUTE_TO_TAB: Record<string, AccountingTabKey> = {
  '/contabilidade/dashboard': 'dashboard',
  '/contabilidade/inteligencia': 'inteligencia',
  '/contabilidade/conciliacao': 'conciliacao',
  '/contabilidade/rastreabilidade': 'rastreabilidade',
  '/contabilidade/dre': 'dre',
  '/contabilidade/balanco': 'balanco',
  '/contabilidade/fechamento': 'fechamento',
  '/contabilidade/plano-de-contas': 'plano-de-contas',
  '/contabilidade/lancamentos': 'lancamentos',
  '/contabilidade/documentos': 'documentos',
  '/contabilidade/fiscal': 'fiscal',
  '/contabilidade/relatorios': 'relatorios'
}

export const ACCOUNTING_ROUTES: Record<string, AccountingRouteDefinition> = {
  '/contabilidade/dashboard': {
    path: '/contabilidade/dashboard',
    subroute: 'dashboard',
    tab: 'dashboard',
    menuKey: 'accounting-dashboard',
    pageKey: 'accounting-dashboard',
    title: 'Dashboard Contábil & Visão Geral',
    shortTitle: 'Visão Geral',
    view: 'accounting-disk',
    module: 'contabilidade',
    breadcrumb: ['Contabilidade', 'Visão Geral']
  },
  '/contabilidade/inteligencia': {
    path: '/contabilidade/inteligencia',
    subroute: 'inteligencia',
    tab: 'inteligencia',
    menuKey: 'accounting-inteligencia',
    pageKey: 'accounting-inteligencia',
    title: 'Inteligência Contábil & Performance',
    shortTitle: 'Inteligência Contábil',
    view: 'accounting-disk',
    module: 'contabilidade',
    breadcrumb: ['Contabilidade', 'Inteligência Contábil']
  },
  '/contabilidade/conciliacao': {
    path: '/contabilidade/conciliacao',
    subroute: 'conciliacao',
    tab: 'conciliacao',
    menuKey: 'accounting-conciliacao',
    pageKey: 'accounting-conciliacao',
    title: 'Centro de Conciliação Contábil & Bancária',
    shortTitle: 'Centro de Conciliação',
    view: 'accounting-disk',
    module: 'contabilidade',
    breadcrumb: ['Contabilidade', 'Centro de Conciliação']
  },
  '/contabilidade/rastreabilidade': {
    path: '/contabilidade/rastreabilidade',
    subroute: 'rastreabilidade',
    tab: 'rastreabilidade',
    menuKey: 'accounting-rastreabilidade',
    pageKey: 'accounting-rastreabilidade',
    title: 'Rastreabilidade de Vendas & Ingressos',
    shortTitle: 'Rastreabilidade',
    view: 'accounting-disk',
    module: 'contabilidade',
    breadcrumb: ['Contabilidade', 'Rastreabilidade']
  },
  '/contabilidade/dre': {
    path: '/contabilidade/dre',
    subroute: 'dre',
    tab: 'dre',
    menuKey: 'accounting-dre',
    pageKey: 'accounting-dre',
    title: 'DRE Gerencial & Orçamentário',
    shortTitle: 'DRE Gerencial',
    view: 'accounting-disk',
    module: 'contabilidade',
    breadcrumb: ['Contabilidade', 'DRE Gerencial']
  },
  '/contabilidade/balanco': {
    path: '/contabilidade/balanco',
    subroute: 'balanco',
    tab: 'balanco',
    menuKey: 'accounting-balanco',
    pageKey: 'accounting-balanco',
    title: 'Balanço Patrimonial & Balancete',
    shortTitle: 'Balanço Patrimonial',
    view: 'accounting-disk',
    module: 'contabilidade',
    breadcrumb: ['Contabilidade', 'Balanço Patrimonial']
  },
  '/contabilidade/fechamento': {
    path: '/contabilidade/fechamento',
    subroute: 'fechamento',
    tab: 'fechamento',
    menuKey: 'accounting-fechamento',
    pageKey: 'accounting-fechamento',
    title: 'Fechamento Mensal & Auditoria Contábil',
    shortTitle: 'Fechamento Mensal',
    view: 'accounting-disk',
    module: 'contabilidade',
    breadcrumb: ['Contabilidade', 'Fechamento Mensal']
  },
  '/contabilidade/plano-de-contas': {
    path: '/contabilidade/plano-de-contas',
    subroute: 'plano-de-contas',
    tab: 'plano-de-contas',
    menuKey: 'accounting-plano-de-contas',
    pageKey: 'accounting-plano-de-contas',
    title: 'Plano de Contas & Centros de Custos',
    shortTitle: 'Plano de Contas',
    view: 'accounting-disk',
    module: 'contabilidade',
    breadcrumb: ['Contabilidade', 'Plano de Contas']
  },
  '/contabilidade/lancamentos': {
    path: '/contabilidade/lancamentos',
    subroute: 'lancamentos',
    tab: 'lancamentos',
    menuKey: 'accounting-lancamentos',
    pageKey: 'accounting-lancamentos',
    title: 'Lançamentos Contábeis (Partidas Dobradas)',
    shortTitle: 'Lançamentos',
    view: 'accounting-disk',
    module: 'contabilidade',
    breadcrumb: ['Contabilidade', 'Lançamentos']
  },
  '/contabilidade/documentos': {
    path: '/contabilidade/documentos',
    subroute: 'documentos',
    tab: 'documentos',
    menuKey: 'accounting-documentos',
    pageKey: 'accounting-documentos',
    title: 'Documentos & Assinaturas Digitais',
    shortTitle: 'Documentos',
    view: 'accounting-disk',
    module: 'contabilidade',
    breadcrumb: ['Contabilidade', 'Documentos']
  },
  '/contabilidade/fiscal': {
    path: '/contabilidade/fiscal',
    subroute: 'fiscal',
    tab: 'fiscal',
    menuKey: 'accounting-fiscal',
    pageKey: 'accounting-fiscal',
    title: 'Fiscal, Tributos & Obrigações SPED',
    shortTitle: 'Fiscal',
    view: 'accounting-disk',
    module: 'contabilidade',
    breadcrumb: ['Contabilidade', 'Fiscal']
  },
  '/contabilidade/relatorios': {
    path: '/contabilidade/relatorios',
    subroute: 'relatorios',
    tab: 'relatorios',
    menuKey: 'accounting-relatorios',
    pageKey: 'accounting-relatorios',
    title: 'Relatórios Contábeis & Exportações',
    shortTitle: 'Relatórios',
    view: 'accounting-disk',
    module: 'contabilidade',
    breadcrumb: ['Contabilidade', 'Relatórios']
  }
}

// Fase 28.15.6: Enriquecimento das rotas contábeis com contexto de produtor e permissões granulares
Object.values(ACCOUNTING_ROUTES).forEach(def => {
  if (!def.context) {
    def.context = { producer: true, event: false }
  }
  if (!def.permissions) {
    if (def.tab === 'fechamento') {
      def.permissions = ['contabilidade.fechamento.executar', 'contabilidade.visualizar']
    } else if (def.tab === 'lancamentos') {
      def.permissions = ['contabilidade.lancamentos.criar', 'contabilidade.visualizar']
    } else {
      def.permissions = ['contabilidade.visualizar']
    }
  }
})

// Aliases legados de abas e nomes antigos para normalização segura
export const ACCOUNTING_TAB_ALIASES: Record<string, AccountingTabKey> = {
  'dashboard': 'dashboard',
  'overview': 'dashboard',
  'visao-geral': 'dashboard',
  'inteligencia': 'inteligencia',
  'intelligence': 'inteligencia',
  'conciliacao': 'conciliacao',
  'reconciliation': 'conciliacao',
  'reconciliacao': 'conciliacao',
  'rastreabilidade': 'rastreabilidade',
  'traceability': 'rastreabilidade',
  'dre': 'dre',
  'balanco': 'balanco',
  'balance': 'balanco',
  'balance-sheet': 'balanco',
  'trial-balance': 'balanco',
  'balancete': 'balanco',
  'fechamento': 'fechamento',
  'closing': 'fechamento',
  'plano-de-contas': 'plano-de-contas',
  'chart': 'plano-de-contas',
  'accounts': 'plano-de-contas',
  'cost-centers': 'plano-de-contas',
  'centros-de-custos': 'plano-de-contas',
  'lancamentos': 'lancamentos',
  'entries': 'lancamentos',
  'journal': 'lancamentos',
  'ledger': 'lancamentos',
  'documentos': 'documentos',
  'documents': 'documentos',
  'borderos': 'documentos',
  'signatures': 'documentos',
  'fiscal': 'fiscal',
  'taxes': 'fiscal',
  'sped': 'fiscal',
  'obligations': 'fiscal',
  'relatorios': 'relatorios',
  'reports': 'relatorios'
}

export function normalizeAccountingTab(input?: string | null): AccountingTabKey {
  if (!input || input === 'undefined' || typeof input !== 'string') {
    return 'dashboard'
  }
  const clean = input.toLowerCase().trim()
  return ACCOUNTING_TAB_ALIASES[clean] || 'dashboard'
}

export function resolveAccountingRoute(pathOrSubroute: string): AccountingRouteDefinition {
  const clean = pathOrSubroute.trim().toLowerCase()
  // 1. Exact match with canonical path
  if (ACCOUNTING_ROUTES[clean]) {
    return ACCOUNTING_ROUTES[clean]
  }

  // 2. Format /contabilidade/<subrota>
  const subrouteMatch = clean.match(/^\/?contabilidade\/(.+)$/)
  if (subrouteMatch) {
    const rawSub = subrouteMatch[1].split('?')[0].split('#')[0]
    const tab = normalizeAccountingTab(rawSub)
    const canonicalPath = ACCOUNTING_TAB_TO_ROUTE[tab]
    return ACCOUNTING_ROUTES[canonicalPath] || ACCOUNTING_ROUTES['/contabilidade/dashboard']
  }

  // 3. Fallback by normalized tab
  const tab = normalizeAccountingTab(clean)
  const canonicalPath = ACCOUNTING_TAB_TO_ROUTE[tab]
  return ACCOUNTING_ROUTES[canonicalPath] || ACCOUNTING_ROUTES['/contabilidade/dashboard']
}
