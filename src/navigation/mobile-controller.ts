// ==============================================================================
// FASE 28.15.5 — MOBILENAVIGATIONCONTROLLER
// Controlador unificado de navegação mobile, drawer e responsividade Enterprise
// ==============================================================================

export interface MobileNavListener {
  (isOpen: boolean): void
}

export const MobileNavigationController = {
  _isOpen: false,
  _listeners: new Set<MobileNavListener>(),
  _initialized: false,
  _previousOverflow: '',

  init() {
    if (this._initialized) return
    this._initialized = true

    if (typeof window !== 'undefined') {
      ;(window as any).MobileNavigationController = this
      ;(window as any).toggleMobileSidebar = () => this.toggle()
      ;(window as any).openMobileSidebar = () => this.open()
      ;(window as any).closeMobileSidebar = () => this.close()

      // 1. Escuta da tecla Escape para fechamento acessível
      window.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this._isOpen) {
          this.close()
        }
      })

      // 2. Fechamento automático se redimensionar para Desktop/Tablet (>= 768px)
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && this._isOpen) {
          this.close()
        }
      })

      // 3. Listener delegado único para fechar drawer ao selecionar rota
      document.addEventListener('click', (event: MouseEvent) => {
        if (!this._isOpen) return
        const target = event.target as HTMLElement | null
        if (!target) return

        // Não fechar se clicar no botão hambúrguer (ele faz toggle)
        if (target.closest('.mobile-menu-button, .sidebar-mobile-main-toggle, [data-testid="mobile-menu-button"]')) {
          return
        }

        // Não fechar se clicar no cabeçalho de um submenu recolhível (accordion)
        if (target.closest('.collapsible-section-head, [data-testid^="collapsible-"]')) {
          return
        }

        // Fechar se clicar no backdrop overlay
        if (target.closest('.mobile-nav-backdrop, [data-mobile-backdrop], [data-testid="mobile-nav-backdrop"]')) {
          event.preventDefault()
          this.close()
          return
        }

        // Fechar se clicar em qualquer item de navegação dentro do drawer
        const navItem = target.closest('.safesaff-sidebar .module-nav-item, .event-context-sidebar .module-nav-item, [data-nav-key], [data-route], [data-view]')
        if (navItem) {
          // Permite que o evento de clique termine e fecha o drawer
          this.close()
        }
      })
    }
  },

  isOpen(): boolean {
    return this._isOpen
  },

  subscribe(listener: MobileNavListener) {
    this._listeners.add(listener)
    return () => {
      this._listeners.delete(listener)
    }
  },

  open() {
    if (this._isOpen) return
    this._isOpen = true
    this._applyDomState(true)
    this._notifyListeners()
  },

  close() {
    if (!this._isOpen) return
    this._isOpen = false
    this._applyDomState(false)
    this._notifyListeners()
  },

  toggle() {
    if (this._isOpen) {
      this.close()
    } else {
      this.open()
    }
  },

  _applyDomState(open: boolean) {
    if (typeof document === 'undefined') return

    const body = document.body
    const shell = document.querySelector('.app-shell')
    const sidebar = document.querySelector('.safesaff-sidebar, .module-sidebar')
    const togglers = document.querySelectorAll('.mobile-menu-button, .sidebar-mobile-main-toggle, [data-testid="mobile-menu-button"]')

    if (open) {
      this._previousOverflow = body.style.overflow
      body.style.overflow = 'hidden'
      body.classList.add('mobile-nav-open', 'sidebar-mobile-expanded')

      if (shell) {
        shell.classList.add('mobile-nav-open', 'sidebar-mobile-expanded')
      }
      if (sidebar) {
        sidebar.classList.add('sidebar-mobile-expanded')
      }

      togglers.forEach(btn => {
        btn.setAttribute('aria-expanded', 'true')
      })
    } else {
      body.style.overflow = this._previousOverflow || ''
      body.classList.remove('mobile-nav-open', 'sidebar-mobile-expanded')

      if (shell) {
        shell.classList.remove('mobile-nav-open', 'sidebar-mobile-expanded')
      }
      if (sidebar) {
        sidebar.classList.remove('sidebar-mobile-expanded')
      }

      togglers.forEach(btn => {
        btn.setAttribute('aria-expanded', 'false')
      })
    }
  },

  _notifyListeners() {
    const state = this._isOpen
    this._listeners.forEach(fn => {
      try {
        fn(state)
      } catch (e) {
        console.error('[MobileNavigationController] Erro em listener:', e)
      }
    })
  }
}

// Auto-inicializa
MobileNavigationController.init()
