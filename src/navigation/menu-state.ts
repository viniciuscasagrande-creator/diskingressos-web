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
