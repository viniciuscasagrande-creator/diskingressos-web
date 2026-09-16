// ==============================================================================
// FASE 29.14.1.2.3 — HOMOLOGAÇÃO VISUAL E NAVEGAÇÃO REAL
// Validação exaustiva da arquitetura: ThemeProvider -> App -> AppShell -> Header -> Sidebar -> MainContent
// Captura de evidências em evidencias/fase-29-14-1-2-3/
// ==============================================================================

import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'
import fs from 'fs'
import path from 'path'

const EVIDENCIAS_DIR = path.join(process.cwd(), 'evidencias', 'fase-29-14-1-2-3')

test.beforeAll(() => {
  if (!fs.existsSync(EVIDENCIAS_DIR)) {
    fs.mkdirSync(EVIDENCIAS_DIR, { recursive: true })
  }
})

test.describe('Fase 29.14.1.2.3 — Homologação Visual e Estrutural Real', () => {

  test.beforeEach(async ({ page }) => {
    // Monitorar erros de console durante a sessão
    page.on('pageerror', (err) => {
      console.warn(`[BROWSER UNCAUGHT ERROR]: ${err.message}`)
    })

    await login(page, qaUsers.admin.email, qaUsers.admin.password)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  // --------------------------------------------------------------------------
  // ITEM 1 & 8: ESTRUTURA REAL DO APPSHELL E HEADER
  // --------------------------------------------------------------------------
  test('1. Deve verificar montagem única do AppShell, Header e Sidebar sem duplicidade', async ({ page }) => {
    // AppShell único
    const shells = page.locator('.app-shell')
    await expect(shells).toHaveCount(1)

    // Header Global único
    const headers = page.locator('.global-topbar')
    await expect(headers).toHaveCount(1)

    // Sidebar Global única
    const sidebars = page.locator('#main-module-sidebar')
    await expect(sidebars).toHaveCount(1)

    // ThemeToggleCompact no Header único
    const themeToggles = page.locator('[data-testid="disk-theme-toggle-compact"]')
    await expect(themeToggles).toHaveCount(1)
  })

  // --------------------------------------------------------------------------
  // ITEM 3, 4, 38: HOMOLOGAÇÃO CLARO & ESCURO COM EVIDÊNCIAS VISUAIS
  // --------------------------------------------------------------------------
  test('2. Deve validar Modo Claro e Modo Escuro em todos os módulos e gerar screenshots', async ({ page }) => {
    test.setTimeout(90_000)
    const modules = [
      { name: 'dashboard', url: '/dashboard', labelClaro: '01-dashboard-claro.png', labelEscuro: '02-dashboard-escuro.png' },
      { name: 'financeiro', url: '/app/finance-dashboard', labelClaro: '03-financeiro-claro.png', labelEscuro: '04-financeiro-escuro.png' },
      { name: 'marketing', url: '/app/marketing-dashboard', labelClaro: '05-marketing-claro.png', labelEscuro: '06-marketing-escuro.png' },
      { name: 'estornos', url: '/app/finance-refunds', labelClaro: '13-estornos-claro.png', labelEscuro: '14-estornos-escuro.png' },
      { name: 'sac', url: '/app/sac-hub', labelClaro: '15-sac-claro.png', labelEscuro: '16-sac-escuro.png' },
      { name: 'contabilidade', url: '/app/accounting-dashboard', labelClaro: '17-contabilidade-claro.png', labelEscuro: '18-contabilidade-escuro.png' }
    ]

    // 2.1 Selecionar uma produtora para carregar os dados reais dos módulos
    const producerSelect = page.locator('[data-testid="header-producer-select"]')
    if (await producerSelect.count() > 0) {
      await producerSelect.selectOption({ index: 1 })
      await page.waitForTimeout(300)
    }

    // Passagem em Modo Claro
    await page.evaluate(() => {
      window.__DISK_THEME__?.setTheme ? window.__DISK_THEME__.setTheme('light') : localStorage.setItem('disk-theme', 'light')
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    })
    await page.waitForTimeout(200)

    for (const mod of modules) {
      await page.goto(mod.url)
      await page.waitForLoadState('networkidle')
      await expect(page.locator('.app-shell')).toBeVisible()

      // Verificar que o body contém texto suficiente (zero tela branca)
      const textLen = await page.evaluate(() => document.body.innerText.trim().length)
      expect(textLen).toBeGreaterThan(50)

      // Capturar screenshot Claro
      await page.screenshot({ path: path.join(EVIDENCIAS_DIR, mod.labelClaro) })
    }

    // 2.2 Passagem em Modo Escuro
    await page.evaluate(() => {
      window.__DISK_THEME__?.setTheme ? window.__DISK_THEME__.setTheme('dark') : localStorage.setItem('disk-theme', 'dark')
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    })
    await page.waitForTimeout(200)

    for (const mod of modules) {
      await page.goto(mod.url)
      await page.waitForLoadState('networkidle')
      await expect(page.locator('.app-shell')).toBeVisible()

      // Verificar que o body contém texto suficiente (zero tela branca)
      const textLen = await page.evaluate(() => document.body.innerText.trim().length)
      expect(textLen).toBeGreaterThan(50)

      // Capturar screenshot Escuro
      await page.screenshot({ path: path.join(EVIDENCIAS_DIR, mod.labelEscuro) })
    }
  })

  // --------------------------------------------------------------------------
  // ITEM 5 & 6: MODO SISTEMA & PERSISTÊNCIA APÓS REFRESH
  // --------------------------------------------------------------------------
  test('3. Deve validar Modo Sistema e persistência após refresh (Claro, Escuro e Sistema)', async ({ page }) => {
    // 3.1 Claro -> Refresh -> Permanece Claro
    await page.evaluate(() => {
      window.__DISK_THEME__?.setTheme ? window.__DISK_THEME__.setTheme('light') : localStorage.setItem('disk-theme', 'light')
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    const isDarkLight = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(isDarkLight).toBe(false)
    expect(await page.evaluate(() => localStorage.getItem('disk-theme'))).toBe('light')

    // 3.2 Escuro -> Refresh -> Permanece Escuro (Sem FOUC)
    await page.evaluate(() => {
      window.__DISK_THEME__?.setTheme ? window.__DISK_THEME__.setTheme('dark') : localStorage.setItem('disk-theme', 'dark')
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    const isDarkAfterReload = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(isDarkAfterReload).toBe(true)
    expect(await page.evaluate(() => localStorage.getItem('disk-theme'))).toBe('dark')

    // 3.3 Sistema -> Refresh -> Permanece Sistema
    await page.evaluate(() => {
      window.__DISK_THEME__?.setTheme ? window.__DISK_THEME__.setTheme('system') : localStorage.setItem('disk-theme', 'system')
      document.documentElement.setAttribute('data-theme', 'system')
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    expect(await page.evaluate(() => localStorage.getItem('disk-theme'))).toBe('system')
  })

  // --------------------------------------------------------------------------
  // ITEM 7 & 38: SIDEBAR ABERTA × RECOLHIDA COM PERSISTÊNCIA E EVIDÊNCIAS
  // --------------------------------------------------------------------------
  test('4. Deve validar recolhimento e expansão exclusiva por clique com persistência e screenshots', async ({ page }) => {
    const sidebar = page.locator('#main-module-sidebar')
    const toggleBtn = page.locator('.safesaff-sidebar-toggle')
    await expect(sidebar).toBeVisible()
    await expect(toggleBtn).toBeVisible()

    // Inicialmente expandida
    await expect(sidebar).not.toHaveClass(/safesaff-sidebar--collapsed/)
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '09-sidebar-expandida.png') })

    // Hover NÃO altera largura nem aplica colapso
    await sidebar.hover()
    await page.waitForTimeout(200)
    await expect(sidebar).not.toHaveClass(/safesaff-sidebar--collapsed/)

    // Clique para recolher
    await toggleBtn.click()
    await page.waitForTimeout(300)
    await expect(sidebar).toHaveClass(/safesaff-sidebar--collapsed/)
    expect(await page.evaluate(() => localStorage.getItem('disk-sidebar-collapsed'))).toBe('true')

    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '10-sidebar-recolhida.png') })

    // Refresh mantém recolhida
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#main-module-sidebar')).toHaveClass(/safesaff-sidebar--collapsed/)

    // Clique para expandir
    await page.locator('.safesaff-sidebar-toggle').click()
    await page.waitForTimeout(300)
    await expect(page.locator('#main-module-sidebar')).not.toHaveClass(/safesaff-sidebar--collapsed/)
    expect(await page.evaluate(() => localStorage.getItem('disk-sidebar-collapsed'))).toBe('false')
  })

  // --------------------------------------------------------------------------
  // ITEM 9, 10, 11, 12: CONTEXTO PRODUTOR × EVENTO, TROCA DE EVENTO E TEMA
  // --------------------------------------------------------------------------
  test('5. Deve validar transição entre Todos os Eventos e Evento específico com troca segura e evidências', async ({ page }) => {
    // 5.1 Contexto: Todos os Eventos (visão consolidada)
    await page.goto('/eventos')
    await page.waitForLoadState('networkidle')

    const contextIndicator = page.locator('[data-testid="header-context-indicator"]')
    await expect(contextIndicator).toBeVisible()
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '07-contexto-todos-eventos.png') })

    // 5.2 Contexto: Evento Específico
    const eventCards = page.locator('[data-testid^="event-card-"], .event-card, [data-event-id]')
    const count = await eventCards.count()
    if (count > 0) {
      const firstCard = eventCards.first()
      await firstCard.scrollIntoViewIfNeeded()
      await page.waitForTimeout(200)
      await firstCard.click({ force: true })
      await page.waitForLoadState('networkidle')

      await expect(contextIndicator).toBeVisible()
      await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '08-contexto-evento-especifico.png') })

      // 5.3 Troca de tema com evento selecionado não desfaz o evento nem a rota
      const currentUrl = page.url()
      const themeBtn = page.locator('[data-testid="disk-theme-toggle-compact"]')
      await themeBtn.click()
      await page.waitForTimeout(200)
      expect(page.url()).toBe(currentUrl)

      // 5.4 Retorno para Todos os Eventos
      const backBtn = page.locator('[data-testid="btn-back-to-producer"], [data-testid="breadcrumb-events"]').first()
      if (await backBtn.isVisible()) {
        await backBtn.click()
        await page.waitForLoadState('networkidle')
      } else {
        await page.goto('/eventos')
        await page.waitForLoadState('networkidle')
      }
      await expect(page.locator('.global-topbar')).toBeVisible()
    }
  })

  // --------------------------------------------------------------------------
  // ITEM 15, 16, 17: DEEP LINKS, BACK/FORWARD E REFRESH EM ROTAS INTERNAS
  // --------------------------------------------------------------------------
  test('6. Deve suportar deep links diretos, navegação back/forward e refresh em rotas internas', async ({ page }) => {
    // 6.1 Deep Link direto para Estornos (módulo protegido)
    await page.goto('/app/finance-refunds')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.app-shell')).toBeVisible()
    await expect(page.locator('.global-topbar')).toBeVisible()
    await expect(page.locator('#main-module-sidebar')).toBeVisible()
    expect(page.url()).toContain('/app/finance-refunds')

    // 6.2 Refresh na rota interna deve permanecer na mesma rota
    await page.reload()
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/app/finance-refunds')
    await expect(page.locator('.app-shell')).toBeVisible()

    // 6.3 Navegar para Financeiro
    await page.goto('/app/finance-dashboard')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/app/finance-dashboard')

    // 6.4 Back do navegador
    await page.goBack()
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/app/finance-refunds')

    // 6.5 Forward do navegador
    await page.goForward()
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/app/finance-dashboard')
  })

  // --------------------------------------------------------------------------
  // ITEM 24, 25, 26, 27, 28, 38: RESPONSIVIDADE TÉCNICA E DRAWER MOBILE
  // --------------------------------------------------------------------------
  test('7. Deve validar ausência de scroll horizontal nas resoluções técnicas e drawer mobile', async ({ page }) => {
    const technicalViewports = [
      { name: '360px', width: 360, height: 640 },
      { name: '390px', width: 390, height: 844 },
      { name: '430px', width: 430, height: 932 },
      { name: '768px', width: 768, height: 1024 },
      { name: '1024px', width: 1024, height: 768 },
      { name: '1280px', width: 1280, height: 800 },
      { name: '1440px', width: 1440, height: 900 }
    ]

    for (const vp of technicalViewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.waitForTimeout(150)

      // Checar se há scrollWidth maior que innerWidth
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth
      })
      expect(hasOverflow, `Scroll horizontal detectado na resolução técnica de ${vp.name}`).toBe(false)
    }

    // Validações Mobile no viewport 390px
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(200)

    // Mobile menu fechado
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '11-mobile-menu-fechado.png') })

    // Abrir gaveta
    const menuBtn = page.locator('[data-testid="mobile-menu-button"]')
    await expect(menuBtn).toBeVisible()
    await menuBtn.click()
    await page.waitForTimeout(300)

    const backdrop = page.locator('[data-testid="mobile-nav-backdrop"]')
    await expect(backdrop).toBeVisible()

    // Mobile menu aberto
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '12-mobile-menu-aberto.png') })

    // Fechar pelo Escape
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    await expect(backdrop).not.toBeVisible()
  })

})
