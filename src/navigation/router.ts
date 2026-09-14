// ==============================================================================
// FASE 28.15.1 + 28.15.4 — APPROUTER
// Router único da aplicação DiskIngressos
// ==============================================================================

import { resolveRoute, type RouteConfig } from './routes'
import { MenuStateManager } from './menu-state'
import { AccountingController } from '../accounting/accounting-controller'
import { MobileNavigationController } from './mobile-controller'

export interface NavigationOptions {
  replace?: boolean
  source?: string
  skipAccountingController?: boolean
}

export interface RouterListener {
  (route: RouteConfig): void
}

export const AppRouter = {
  _current: null as RouteConfig | null,
  _listeners: new Set<RouterListener>(),
  _initialized: false,

  init() {
    if (this._initialized) return
    this._initialized = true

    if (typeof window !== 'undefined') {
      ;(window as any).AppRouter = this
      ;(window as any).openView = (routeOrView: string) => this.navigateLegacy(routeOrView)
      ;(window as any).navigateTo = (window as any).openView
      ;(window as any).switchActiveView = (window as any).openView

      // 1. Único listener delegado para links de navegação
      document.addEventListener('click', (event: MouseEvent) => {
        const target = event.target as HTMLElement | null
        if (!target) return

        const link = target.closest('[data-route], [data-view]') as HTMLElement | null
        if (!link) return

        // Se for um link de submódulo ou de aba interna gerenciada por outro componente com preventDefault, respeita
        const route = link.dataset.route
        const view = link.dataset.view

        if (route) {
          event.preventDefault()
          this.navigate(route)
        } else if (view) {
          event.preventDefault()
          this.navigateLegacy(view)
        }
      })

      // 2. Listener de histórico do navegador (Voltar / Avançar)
      window.addEventListener('popstate', (event: PopStateEvent) => {
        const stateRoute = event.state?.route || window.location.pathname
        this.syncFromLocation(stateRoute, true)
      })

      // 3. Sincronização inicial na carga da página
      this.syncFromLocation(window.location.pathname + window.location.hash)
    }
  },

  subscribe(listener: RouterListener) {
    this._listeners.add(listener)
    return () => {
      this._listeners.delete(listener)
    }
  },

  current(): RouteConfig {
    if (!this._current) {
      const initial = typeof window !== 'undefined'
        ? window.location.pathname + window.location.hash
        : '/dashboard'
      this._current = resolveRoute(initial)
    }
    return this._current
  },

  resolve(path: string): RouteConfig {
    return resolveRoute(path)
  },

  navigate(path: string, options?: NavigationOptions): boolean {
    const route = resolveRoute(path)
    this._current = route

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      const currentHash = window.location.hash

      // Histórico: pushState para nova navegação, replaceState para normalização
      if (options?.replace) {
        window.history.replaceState({ route: route.path, tab: route.tab }, '', route.path)
      } else if (currentPath !== route.path && currentHash !== `#${route.path}`) {
        window.history.pushState({ route: route.path, tab: route.tab }, '', route.path)
      }

      // Sincroniza estado de menu
      MenuStateManager.sync(route)

      // Se for rota contábil, ativa a aba no AccountingController
      if (route.module === 'contabilidade' && route.tab && !options?.skipAccountingController) {
        AccountingController.activateTab(route.tab, { skipRouter: true })
      }

      // Fecha o drawer mobile ao navegar para rota
      MobileNavigationController.close()
    }

    // Notifica listeners (como o React App)
    this._listeners.forEach(fn => {
      try {
        fn(route)
      } catch (e) {
        console.error('[AppRouter] Erro ao notificar listener:', e)
      }
    })

    return true
  },

  navigateLegacy(legacyView: string): boolean {
    const route = resolveRoute(legacyView)
    return this.navigate(route.path)
  },

  syncFromLocation(locationString?: string, isPopState = false): boolean {
    if (typeof window === 'undefined') return false
    const loc = locationString || (window.location.pathname + window.location.hash)
    const route = resolveRoute(loc)
    this._current = route

    if (!isPopState) {
      window.history.replaceState({ route: route.path, tab: route.tab }, '', window.location.href)
    }

    MenuStateManager.sync(route)

    if (route.module === 'contabilidade' && route.tab) {
      AccountingController.activateTab(route.tab, { skipRouter: true })
    }

    this._listeners.forEach(fn => {
      try {
        fn(route)
      } catch (e) {
        console.error('[AppRouter] Erro em syncFromLocation listener:', e)
      }
    })

    return true
  }
}

// Inicializa no carregamento
AppRouter.init()
