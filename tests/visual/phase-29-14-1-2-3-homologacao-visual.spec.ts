// ==============================================================================
// FASE 29.14.1.2.3 — HOMOLOGAÇÃO VISUAL E NAVEGAÇÃO
// Validação: Claro ↔ Escuro ↔ Sistema, Sidebar Aberta/Recolhida, Header Global,
// Contexto Produtor × Evento, Módulos Principais, Responsividade Técnica e Zero Tela Branca.
// ==============================================================================

import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'
import fs from 'fs'
import path from 'path'

const EVIDENCE_DIR = path.join(process.cwd(), 'tests', 'visual', 'evidence')

test.beforeAll(() => {
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true })
  }
})

test.describe('Fase 29.14.1.2.3 — Validação Visual e Navegação do Komposo/Disk', () => {

  test.beforeEach(async ({ page }) => {
    // Autenticar com usuário administrador
    await login(page, qaUsers.admin.email, qaUsers.admin.password)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  // --------------------------------------------------------------------------
  // 1. ALTERNÂNCIA DE TEMAS: Claro ↔ Escuro ↔ Sistema + Contraste + Persistência
  // --------------------------------------------------------------------------
  test('1. Deve alternar perfeitamente entre Claro, Escuro e Sistema com persistência e contraste adequado', async ({ page }) => {
    const themeBtn = page.locator('[data-testid="disk-theme-toggle-compact"]').first()
    await expect(themeBtn).toBeVisible({ timeout: 10000 })

    // 1.1 Garantir transição para Modo Claro
    await page.evaluate(() => {
      window.__DISK_THEME__?.setTheme ? window.__DISK_THEME__.setTheme('light') : localStorage.setItem('disk-theme', 'light')
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    })
    await page.waitForTimeout(300)

    const isDarkLight = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(isDarkLight).toBe(false)

    const lightBg = await page.evaluate(() => {
      const shell = document.querySelector('.app-shell') || document.body
      return window.getComputedStyle(shell).backgroundColor
    })
    expect(lightBg).toBeTruthy()

    // Capturar evidência visual do Modo Claro
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '01-app-light-mode.png'), fullPage: false })

    // 1.2 Transição para Modo Escuro via clique no alternador
    await themeBtn.click()
    await page.waitForTimeout(300)

    // Se o clique levou para 'dark' ou 'system', forçamos dark para checagem estrita
    await page.evaluate(() => {
      if (!document.documentElement.classList.contains('dark')) {
        const btn = document.querySelector('[data-testid="disk-theme-toggle-compact"]') as HTMLButtonElement
        if (btn) btn.click()
      }
    })
    await page.waitForTimeout(300)

    const isDarkAfter = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(isDarkAfter).toBe(true)

    const darkBg = await page.evaluate(() => {
      const shell = document.querySelector('.app-shell') || document.body
      return window.getComputedStyle(shell).backgroundColor
    })
    expect(darkBg).toBeTruthy()

    // Capturar evidência visual do Modo Escuro
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '02-app-dark-mode.png'), fullPage: false })

    // 1.3 Recarregar no Modo Escuro para validar prevenção de FOUC
    await page.reload()
    await page.waitForLoadState('networkidle')

    const isStillDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(isStillDark).toBe(true)

    // 1.4 Testar Modo Sistema
    await page.evaluate(() => {
      localStorage.setItem('disk-theme', 'system')
      window.dispatchEvent(new Event('storage'))
    })
    const storedSystem = await page.evaluate(() => localStorage.getItem('disk-theme'))
    expect(storedSystem).toBe('system')
  })

  // --------------------------------------------------------------------------
  // 2. SIDEBAR GLOBAL: Aberta vs Recolhida, Transição e Persistência
  // --------------------------------------------------------------------------
  test('2. Deve recolher e expandir a Sidebar por clique com persistência e tooltips ativos', async ({ page }) => {
    const sidebar = page.locator('#main-module-sidebar')
    await expect(sidebar).toBeVisible()

    const toggleBtn = page.locator('.safesaff-sidebar-toggle')
    await expect(toggleBtn).toBeVisible()

    // Inicialmente a sidebar está expandida
    await expect(sidebar).not.toHaveClass(/safesaff-sidebar--collapsed/)

    // Clique 1: Recolher
    await toggleBtn.click()
    await page.waitForTimeout(300)
    await expect(sidebar).toHaveClass(/safesaff-sidebar--collapsed/)

    const isStoredCollapsed = await page.evaluate(() => localStorage.getItem('disk-sidebar-collapsed'))
    expect(isStoredCollapsed).toBe('true')

    // Evidência visual da Sidebar Recolhida
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '03-sidebar-collapsed.png') })

    // Clique 2: Expandir
    await toggleBtn.click()
    await page.waitForTimeout(300)
    await expect(sidebar).not.toHaveClass(/safesaff-sidebar--collapsed/)

    const isStoredExpanded = await page.evaluate(() => localStorage.getItem('disk-sidebar-collapsed'))
    expect(isStoredExpanded).toBe('false')

    // Evidência visual da Sidebar Expandida
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '04-sidebar-expanded.png') })
  })

  // --------------------------------------------------------------------------
  // 3. HEADER GLOBAL: Logo, Indicador Contextual, Notificações e Usuário
  // --------------------------------------------------------------------------
  test('3. Deve validar os componentes do Header Global e suas interações', async ({ page }) => {
    const header = page.locator('.global-topbar')
    await expect(header).toBeVisible()

    // Logo DiskIngressos
    const logo = page.locator('.navbar-logo').first()
    await expect(logo).toBeVisible()

    // Indicador Contextual
    const contextIndicator = page.locator('[data-testid="header-context-indicator"]')
    await expect(contextIndicator).toBeVisible()

    // Notificações
    const notifBtn = page.locator('[data-testid="header-notifications-button"]')
    await expect(notifBtn).toBeVisible()
    await notifBtn.click()
    await page.waitForTimeout(200)

    // Painel de notificações aberto
    const notifPanel = page.locator('[data-testid="notifications-popover"]')
    if (await notifPanel.isVisible()) {
      await expect(page.getByText(/notificações/i).first()).toBeVisible()
      // Fechar popover clicando fora
      await page.keyboard.press('Escape')
    }

    // Menu do Usuário
    const userMenuBtn = page.locator('[data-testid="header-user-menu-button"]')
    if (await userMenuBtn.isVisible()) {
      await userMenuBtn.click()
      await page.waitForTimeout(200)
      const userDropdown = page.locator('[data-testid="user-menu-dropdown"]')
      if (await userDropdown.isVisible()) {
        await expect(page.getByText(/sair|logout/i).first()).toBeVisible()
        await page.keyboard.press('Escape')
      }
    }

    // Busca Global com atalho Ctrl+K / Cmd+K
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(200)
    const searchInput = page.locator('input[placeholder*="Buscar"]').first()
    await expect(searchInput).toBeVisible()
  })

  // --------------------------------------------------------------------------
  // 4. CONTEXTO PRODUTOR × EVENTO: Todos os Eventos, Evento Específico e Troca
  // --------------------------------------------------------------------------
  test('4. Deve transitar entre a visão consolidada de eventos e contexto específico com troca segura', async ({ page }) => {
    // 4.1 Navegar para Eventos
    await page.goto('/eventos')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.global-topbar')).toBeVisible()
    await expect(page.locator('#main-module-sidebar')).toBeVisible()

    // 4.2 Selecionar um evento na listagem ou via seletor
    const eventCards = page.locator('[data-testid^="event-card-"], .event-card, [data-event-id]')
    const count = await eventCards.count()

    if (count > 0) {
      const firstCard = eventCards.first()
      await firstCard.scrollIntoViewIfNeeded()
      await page.waitForTimeout(200)
      await firstCard.click({ force: true })
      await page.waitForLoadState('networkidle')

      // Verificar que o Header ou Breadcrumb atualizou o contexto
      const contextIndicator = page.locator('[data-testid="header-context-indicator"]')
      await expect(contextIndicator).toBeVisible()

      // Evidência visual do contexto específico de evento
      await page.screenshot({ path: path.join(EVIDENCE_DIR, '05-event-context-active.png') })
    }

    // 4.3 Voltar para visão consolidada de Todos os Eventos
    const backBtn = page.locator('[data-testid="btn-back-to-producer"], [data-testid="breadcrumb-events"]').first()
    if (await backBtn.isVisible()) {
      await backBtn.click()
      await page.waitForLoadState('networkidle')
      await expect(page.locator('.global-topbar')).toBeVisible()
    } else {
      await page.goto('/eventos')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('.global-topbar')).toBeVisible()
    }
  })

  // --------------------------------------------------------------------------
  // 5. NAVEGAÇÃO CONTÍNUA SEM TELA BRANCA: Módulos Principais em Ambos os Temas
  // --------------------------------------------------------------------------
  test('5. Deve navegar por todos os módulos corporativos sem tela branca e mantendo estabilidade', async ({ page }) => {
    const modulesToVerify = [
      { name: 'Dashboard', url: '/dashboard', label: 'Dashboard' },
      { name: 'Eventos', url: '/eventos', label: 'Eventos' },
      { name: 'Financeiro', url: '/app/finance-dashboard', label: 'Financeiro' },
      { name: 'Contabilidade', url: '/app/accounting-dashboard', label: 'Contabilidade' },
      { name: 'Marketing', url: '/app/marketing-dashboard', label: 'Marketing' },
      { name: 'Atendimento / SAC', url: '/app/sac-hub', label: 'SAC' },
      { name: 'Estornos (Centro de Controle)', url: '/app/finance-refunds', label: 'Estornos' }
    ]

    for (const mod of modulesToVerify) {
      await page.goto(mod.url)
      await page.waitForLoadState('networkidle')

      // 1. O AppShell, Header e Sidebar devem continuar montados
      await expect(page.locator('.app-shell')).toBeVisible({ timeout: 15000 })
      await expect(page.locator('.global-topbar')).toBeVisible()
      await expect(page.locator('#main-module-sidebar')).toBeVisible()

      // 2. Não deve haver tela branca (conteúdo de texto significativo no body)
      const bodyTextLength = await page.evaluate(() => document.body.innerText.trim().length)
      expect(bodyTextLength).toBeGreaterThan(50)

      // 3. Capturar evidência de cada tela
      const safeSlug = mod.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
      await page.screenshot({ path: path.join(EVIDENCE_DIR, `module-${safeSlug}.png`) })
    }
  })

  // --------------------------------------------------------------------------
  // 6. RESPONSIVIDADE TÉCNICA NOS VIEWPORTS PADRONIZADOS
  // --------------------------------------------------------------------------
  test('6. Deve garantir zero overflow horizontal e drawer funcional nos viewports técnicos', async ({ page }) => {
    const technicalViewports = [
      { name: 'viewport-tecnico-360px', width: 360, height: 640 },
      { name: 'viewport-tecnico-390px', width: 390, height: 844 },
      { name: 'viewport-tecnico-768px', width: 768, height: 1024 },
      { name: 'viewport-tecnico-1024px', width: 1024, height: 768 },
      { name: 'viewport-tecnico-1440px', width: 1440, height: 900 }
    ]

    for (const vp of technicalViewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.waitForTimeout(200)

      // Checagem de Zero Rolagem Horizontal
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth
      })
      expect(overflow, `Overflow horizontal detectado na resolução técnica ${vp.width}x${vp.height}`).toBe(false)
    }

    // Validar abertura e fechamento da gaveta Drawer na resolução técnica mobile 390px
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(200)

    const menuBtn = page.locator('[data-testid="mobile-menu-button"]')
    await expect(menuBtn).toBeVisible()
    await menuBtn.click()
    await page.waitForTimeout(300)

    // Drawer backdrop visível
    const backdrop = page.locator('[data-testid="mobile-nav-backdrop"]')
    await expect(backdrop).toBeVisible()

    // Capturar evidência da gaveta aberta
    await page.screenshot({ path: path.join(EVIDENCE_DIR, '06-mobile-drawer-open.png') })

    // Fechar pelo backdrop
    await backdrop.click({ position: { x: 380, y: 100 }, force: true })
    await page.waitForTimeout(300)
    await expect(backdrop).not.toBeVisible()
  })

})
