// ==============================================================================
// FASE 28.15.4 — CONSOLIDAÇÃO CONTABILIDADE + SUBROTAS
// AccountingController oficial do PDT DiskIngressos
// ==============================================================================

import {
  ACCOUNTING_TAB_TO_ROUTE,
  normalizeAccountingTab,
  type AccountingTabKey
} from '../navigation/accounting-routes'

export interface TabChangeListener {
  (tab: AccountingTabKey, route: string): void
}

export interface AccountingHook {
  (): void
}

export const AccountingController = {
  currentTab: 'dashboard' as AccountingTabKey,
  _listeners: new Set<TabChangeListener>(),
  _hooks: new Map<string, AccountingHook>(),
  _isInitialized: false,

  init() {
    if (this._isInitialized) return
    this._isInitialized = true
    if (typeof window !== 'undefined') {
      ;(window as any).AccountingController = this
      ;(window as any).switchAccountingTab = switchAccountingTab
    }
  },

  subscribe(listener: TabChangeListener) {
    this._listeners.add(listener)
    return () => {
      this._listeners.delete(listener)
    }
  },

  registerHook(tabName: string, hook: AccountingHook) {
    const norm = normalizeAccountingTab(tabName)
    this._hooks.set(norm, hook)
  },

  unregisterHook(tabName: string) {
    const norm = normalizeAccountingTab(tabName)
    this._hooks.delete(norm)
  },

  getCurrentTab(): AccountingTabKey {
    return this.currentTab
  },

  getCurrentRoute(): string {
    return ACCOUNTING_TAB_TO_ROUTE[this.currentTab] || '/contabilidade/dashboard'
  },

  activateTab(
    tabName: string | AccountingTabKey | undefined | null,
    options?: { skipRouter?: boolean; skipState?: boolean }
  ): boolean {
    const normalized = normalizeAccountingTab(tabName)
    const previousTab = this.currentTab
    this.currentTab = normalized
    const targetRoute = ACCOUNTING_TAB_TO_ROUTE[normalized] || '/contabilidade/dashboard'

    // 1. Atualização DOM nativa de alta fidelidade
    if (typeof document !== 'undefined') {
      const root = document.getElementById('view-accounting-disk')
      if (root) {
        // Atualiza painéis internos
        root.querySelectorAll('[data-accounting-panel]').forEach(el => {
          const panel = el as HTMLElement
          const active = panel.dataset.accountingPanel === normalized
          panel.hidden = !active
          panel.classList.toggle('active', active)
        })

        // Atualiza tabs e ARIA
        root.querySelectorAll('[data-accounting-tab]').forEach(el => {
          const tab = el as HTMLElement
          const active = tab.dataset.accountingTab === normalized
          tab.classList.toggle('active', active)
          tab.setAttribute('aria-selected', String(active))
        })
      }
    }

    // 2. Notifica assinantes (ex: componente React que gerencia a tela)
    if (!options?.skipState) {
      this._listeners.forEach(listener => {
        try {
          listener(normalized, targetRoute)
        } catch (e) {
          console.error('[AccountingController] Erro no listener de tab:', e)
        }
      })
    }

    // 3. Executa hooks específicos da tab sem duplicar execuções
    if (previousTab !== normalized) {
      const hook = this._hooks.get(normalized)
      if (hook) {
        try {
          hook()
        } catch (e) {
          console.error(`[AccountingController] Erro ao executar hook da aba ${normalized}:`, e)
        }
      }
    }

    // 4. Se não estiver pulando o Router, sincroniza a URL e o Menu
    if (!options?.skipRouter && typeof window !== 'undefined') {
      const router = (window as any).AppRouter
      if (router && typeof router.navigate === 'function') {
        router.navigate(targetRoute, { source: 'AccountingController' })
      } else {
        const urlState = window.history.state || {}
        if (window.location.pathname !== targetRoute && window.location.hash !== `#${targetRoute}`) {
          window.history.pushState({ ...urlState, route: targetRoute, tab: normalized }, '', targetRoute)
        }
      }
    }

    return true
  }
}

/**
 * Função de migração segura de switchAccountingTab()
 * Aceita:
 * - switchAccountingTab('dre')
 * - switchAccountingTab(e, 'dre')
 * - switchAccountingTab({ currentTarget: { dataset: { tab: 'dre' } } })
 * Corrige casos de tabName undefined e mapeia Rastreabilidade com precisão.
 */
export function switchAccountingTab(arg1?: any, arg2?: any): boolean {
  let tabCandidate: any = undefined

  if (typeof arg1 === 'string') {
    tabCandidate = arg1
  } else if (typeof arg2 === 'string') {
    tabCandidate = arg2
  } else if (arg1 && typeof arg1 === 'object') {
    if (arg1.currentTarget?.dataset?.accountingTab) {
      tabCandidate = arg1.currentTarget.dataset.accountingTab
    } else if (arg1.currentTarget?.dataset?.tab) {
      tabCandidate = arg1.currentTarget.dataset.tab
    } else if (arg1.target?.dataset?.accountingTab) {
      tabCandidate = arg1.target.dataset.accountingTab
    } else if (arg1.target?.dataset?.tab) {
      tabCandidate = arg1.target.dataset.tab
    }
  }

  // Previne comportamento padrão de <a> se for evento
  if (arg1 && typeof arg1.preventDefault === 'function') {
    arg1.preventDefault()
  }

  if (arg2 && typeof arg2.preventDefault === 'function') {
    arg2.preventDefault()
  }

  if (!tabCandidate || tabCandidate === 'undefined' || tabCandidate === 'null') {
    tabCandidate = 'dashboard'
  }

  return AccountingController.activateTab(tabCandidate)
}

// Inicializa no escopo global
AccountingController.init()
