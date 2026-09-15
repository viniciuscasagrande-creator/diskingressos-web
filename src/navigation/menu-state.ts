// ==============================================================================
// FASE 28.15.2 + 28.15.4 — MENUSTATEMANAGER
// Gerenciador centralizado de estado dos menus e submenus
// ==============================================================================

import type { RouteConfig } from './routes'

export interface MenuStateListener {
  (state: RouteConfig): void
}

export const MenuStateManager = {
  _listeners: new Set<MenuStateListener>(),
  _currentRoute: null as RouteConfig | null,

  init() {
    if (typeof window !== 'undefined') {
      ;(window as any).MenuStateManager = this
    }
  },

  subscribe(fn: MenuStateListener) {
    this._listeners.add(fn)
    return () => {
      this._listeners.delete(fn)
    }
  },

  sync(routeState: RouteConfig) {
    this._currentRoute = routeState
    this.clearActiveItems()
    this.setActiveItem(routeState)
    this.openActiveParent(routeState)
    this.syncAccessibility(routeState)

    this._listeners.forEach(fn => {
      try {
        fn(routeState)
      } catch (e) {
        console.error('[MenuStateManager] Erro em listener:', e)
      }
    })
  },

  clearActiveItems() {
    if (typeof document === 'undefined') return
    // Remove active somente dos itens contábeis quando estamos sincronizando contabilidade
    document.querySelectorAll('.safesaff-sidebar [data-route], .safesaff-sidebar [data-menu-key]').forEach(el => {
      // Nunca mexer em atributos de módulos protegidos
      if (el.getAttribute('data-protected-module')) return
      el.classList.remove('active')
      el.removeAttribute('aria-current')
    })
  },

  setActiveItem(routeState: RouteConfig) {
    if (typeof document === 'undefined') return
    const route = routeState.path
    const menuKey = routeState.menuKey || (routeState.tab ? `accounting-${routeState.tab}` : '')

    // Tenta encontrar por data-route ou data-menu-key
    let item = document.querySelector(`.safesaff-sidebar [data-route="${route}"]`)
    if (!item && menuKey) {
      item = document.querySelector(`.safesaff-sidebar [data-menu-key="${menuKey}"], .safesaff-sidebar [data-nav-key="${menuKey}"]`)
    }

    // Se não encontrou diretamente, mapeia subrotas contábeis para seus hubs
    if (!item && (routeState.module === 'contabilidade' || route.startsWith('/contabilidade'))) {
      const tab = routeState.tab || route.replace('/contabilidade/', '')
      const hubMap: Record<string, string> = {
        'dashboard': 'accounting-dashboard',
        'dre': 'accounting-dre',
        'inteligencia': 'accounting-hub-statements',
        'balanco': 'accounting-hub-statements',
        'conciliacao': 'accounting-hub-operations',
        'rastreabilidade': 'accounting-hub-operations',
        'plano-de-contas': 'accounting-hub-operations',
        'lancamentos': 'accounting-hub-operations',
        'fechamento': 'accounting-hub-operations',
        'documentos': 'accounting-hub-compliance',
        'fiscal': 'accounting-hub-compliance',
        'relatorios': 'accounting-relatorios'
      }
      const targetKey = hubMap[tab]
      if (targetKey) {
        item = document.querySelector(`.safesaff-sidebar [data-menu-key="${targetKey}"], .safesaff-sidebar [data-nav-key="${targetKey}"]`)
      }
    }

    // Se for rota financeira, mapeia subrotas para seus respectivos hubs
    if (!item && (routeState.module === 'financeiro' || route.startsWith('/financeiro') || route.startsWith('/app/finance-'))) {
      const financeSubMap: Record<string, string> = {
        'finance-producer-account': 'finance-hub-account',
        'finance-statement': 'finance-hub-account',
        'finance-split': 'finance-hub-account',
        'finance-methods': 'finance-hub-account',
        'finance-receivables': 'finance-hub-bills',
        'finance-payables': 'finance-hub-bills',
        'finance-advance': 'finance-hub-bills',
        'finance-payouts': 'finance-hub-bills',
        'finance-cashflow': 'finance-hub-bills',
        'finance-bank-accounts': 'finance-hub-treasury',
        'finance-expenses': 'finance-hub-procurement',
        'finance-cost-centers': 'finance-hub-controlling',
        'finance-chart-accounts': 'finance-chart-accounts',
        'finance-reconciliation': 'finance-hub-reconciliation',
        'finance-reports': 'finance-hub-reports',
        'finance-bordero': 'finance-hub-reports',
        'finance-consolidated': 'finance-hub-reports',
      }
      const pageKey = (routeState.view || route.replace('/app/', '').replace('/financeiro/', '')) as string
      const targetKey = financeSubMap[pageKey]
      if (targetKey) {
        item = document.querySelector(`.safesaff-sidebar [data-menu-key="${targetKey}"], .safesaff-sidebar [data-nav-key="${targetKey}"]`)
      }
    }

    // Se for rota de marketing, mapeia subrotas para seus respectivos hubs
    if (!item && (routeState.module === 'marketing' || route.startsWith('/marketing') || route.startsWith('/app/marketing'))) {
      const mktSubMap: Record<string, string> = {
        'marketing-campaigns': 'marketing-hub-campaigns',
        'marketing-status-real': 'marketing-hub-campaigns',
        'marketing-real-status': 'marketing-hub-campaigns',
        'marketing-ready-campaigns': 'marketing-hub-campaigns',
        'marketing-create': 'marketing-hub-campaigns',
        'marketing-coupons': 'marketing-hub-campaigns',
        'marketing-utm-central': 'marketing-hub-campaigns',
        'marketing-links': 'marketing-hub-campaigns',
        'marketing-affiliates': 'marketing-hub-campaigns',
        'marketing-communications': 'marketing-hub-communication',
        'marketing-whatsapp': 'marketing-hub-communication',
        'marketing-email': 'marketing-hub-communication',
        'marketing-automations': 'marketing-hub-communication',
        'marketing-tracking': 'marketing-hub-pixels',
        'marketing-pixels': 'marketing-hub-pixels',
        'marketing-meta-ads': 'marketing-hub-pixels',
        'marketing-google-ads': 'marketing-hub-pixels',
        'marketing-tiktok-ads': 'marketing-hub-pixels',
        'marketing-spotify': 'marketing-hub-pixels',
        'marketing-reports': 'marketing-hub-analytics',
        'marketing-channel-performance': 'marketing-hub-analytics',
        'marketing-campaign-ranking': 'marketing-hub-analytics',
      }
      const pageKey = (routeState.view || route.replace('/app/', '').replace('/marketing/', '')) as string
      const targetKey = mktSubMap[pageKey]
      if (targetKey) {
        item = document.querySelector(`.safesaff-sidebar [data-menu-key="${targetKey}"], .safesaff-sidebar [data-nav-key="${targetKey}"]`)
      }
    }

    if (item) {
      item.classList.add('active')
      item.setAttribute('aria-current', 'page')
    }
  },

  openActiveParent(routeState: RouteConfig) {
    if (typeof document === 'undefined') return
    if (routeState.module === 'contabilidade' || routeState.path.startsWith('/contabilidade')) {
      // Localiza a seção recolhível de contabilidade e garante que esteja aberta
      const head = document.querySelector('[data-testid="collapsible-contabilidade"]')
      if (head && !head.classList.contains('open')) {
        const btn = head as HTMLElement
        btn.click()
      }
    }
  },

  syncAccessibility(routeState: RouteConfig) {
    if (typeof document === 'undefined') return
    const isAccounting = routeState.module === 'contabilidade' || routeState.path.startsWith('/contabilidade')
    const head = document.querySelector('[data-testid="collapsible-contabilidade"]')
    if (head) {
      head.setAttribute('aria-expanded', isAccounting ? 'true' : 'false')
    }
  }
}

// Inicializa no escopo global
MenuStateManager.init()
