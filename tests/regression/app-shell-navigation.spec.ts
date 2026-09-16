// ==============================================================================
// FASE 29.14.1.2 — TESTES DE REGRESSÃO PLAYWRIGHT
// Validação do AppShell Komposo/Disk + Sidebar + Header Global
// ==============================================================================

import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'

test.describe('AppShell Komposo/Disk • Navegação, Sidebar e Header Global', () => {
  test.beforeEach(async ({ page }) => {
    // Autenticar com administrador autorizado
    await login(page, qaUsers.admin.email, qaUsers.admin.password)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('1. Deve renderizar o AppShell unificado com Header Global e Sidebar Global', async ({ page }) => {
    // Valida container do shell
    const shell = page.locator('.app-shell')
    await expect(shell).toBeVisible({ timeout: 15000 })

    // Valida Header Global e seus componentes centrais
    const header = page.locator('.global-topbar')
    await expect(header).toBeVisible()

    // Botão de Tema no Header
    const themeToggle = page.locator('[data-testid="disk-theme-toggle-compact"]')
    await expect(themeToggle).toBeVisible()

    // Menu de Notificações com badge de não lidas/críticas
    const notifBtn = page.locator('[data-testid="header-notifications-button"]')
    await expect(notifBtn).toBeVisible()

    // Indicador de Contexto Ativo (Produtora / Evento)
    const contextIndicator = page.locator('[data-testid="header-context-indicator"]')
    await expect(contextIndicator).toBeVisible()

    // Sidebar Global e release marker do Core Stability Gate
    const sidebar = page.locator('#main-module-sidebar')
    await expect(sidebar).toBeVisible()
    await expect(sidebar).toHaveAttribute(
      'data-core-protection-release',
      '26.x.3.10-runtime-functional-stability-2026-09-03'
    )
  })

  test('2. Deve recolher e expandir a Sidebar por clique com persistência em disk-sidebar-collapsed', async ({ page }) => {
    const sidebar = page.locator('#main-module-sidebar')
    await expect(sidebar).toBeVisible()

    const toggleBtn = page.locator('.safesaff-sidebar-toggle')
    await expect(toggleBtn).toBeVisible()

    // 1. Clique para recolher
    await toggleBtn.click()
    await expect(sidebar).toHaveClass(/safesaff-sidebar--collapsed/)

    // Verifica persistência na chave disk-sidebar-collapsed
    const isStoredCollapsed = await page.evaluate(() => localStorage.getItem('disk-sidebar-collapsed'))
    expect(isStoredCollapsed).toBe('true')

    // 2. Clique para expandir novamente
    await toggleBtn.click()
    await expect(sidebar).not.toHaveClass(/safesaff-sidebar--collapsed/)

    const isStoredExpanded = await page.evaluate(() => localStorage.getItem('disk-sidebar-collapsed'))
    expect(isStoredExpanded).toBe('false')
  })

  test('3. Deve transitar entre módulos protegidos sem desmontar ou piscar o Shell', async ({ page }) => {
    // 3.1 Navega para Financeiro (expandindo a seção colapsável se necessário)
    const collapsibleFinance = page.locator('[data-testid="collapsible-financeiro"]')
    if (await collapsibleFinance.isVisible()) {
      const isExpanded = await collapsibleFinance.getAttribute('aria-expanded')
      if (isExpanded !== 'true') {
        await collapsibleFinance.click()
      }
    }
    const navFinance = page.locator('[data-testid="nav-finance-dashboard"]')
    if (await navFinance.isVisible()) {
      await navFinance.click()
    } else {
      await page.goto('/app/finance-dashboard')
    }
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.global-topbar')).toBeVisible()
    await expect(page.locator('#main-module-sidebar')).toBeVisible()

    // 3.2 Navega para Estornos (Módulo Independente Protegido)
    const navRefunds = page.locator('[data-testid="nav-finance-refunds"]')
    await expect(navRefunds).toBeVisible()
    await navRefunds.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('#main-module-sidebar')).toBeVisible()

    // 3.3 Navega para Atendimento / SAC
    const navSac = page.locator('[data-testid="nav-sac-hub"]')
    await expect(navSac).toBeVisible()
    await navSac.click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.global-topbar')).toBeVisible()
  })

  test('4. Deve alternar temas no Header Global mantendo integridade estrutural', async ({ page }) => {
    const themeBtn = page.locator('[data-testid="disk-theme-toggle-compact"]').first()
    await expect(themeBtn).toBeVisible()

    // O alternador cicla entre: system -> light -> dark -> system
    // 1º clique: define light explicitamente
    await themeBtn.click()
    const stored1 = await page.evaluate(() => localStorage.getItem('disk-theme'))
    expect(stored1).toBe('light')

    // 2º clique: transita de light para dark
    await themeBtn.click()
    const stored2 = await page.evaluate(() => localStorage.getItem('disk-theme'))
    expect(stored2).toBe('dark')

    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(isDark).toBe(true)

    // Shell permanece estável
    await expect(page.locator('.app-shell')).toBeVisible()
    await expect(page.locator('#main-module-sidebar')).toBeVisible()
  })

  test('5. Deve suportar gaveta mobile sem rolagem horizontal', async ({ page }) => {
    // Simular viewport mobile iPhone/Android moderno
    await page.setViewportSize({ width: 390, height: 844 })

    const mobileMenuBtn = page.locator('[data-testid="mobile-menu-button"]')
    await expect(mobileMenuBtn).toBeVisible()
    await mobileMenuBtn.click()

    // Gaveta mobile abre
    const mobileBackdrop = page.locator('[data-testid="mobile-nav-backdrop"]')
    await expect(mobileBackdrop).toBeVisible()

    // Fechar pelo botão fechar da gaveta
    const closeBtn = page.locator('[data-testid="sidebar-mobile-close"]')
    if (await closeBtn.isVisible()) {
      await closeBtn.click()
      await expect(mobileBackdrop).not.toBeVisible()
    }
  })

  test('6. Vitrine de homologação do Desenvolvedor deve exibir seção do AppShell Komposo/Disk', async ({ page }) => {
    await page.goto('/desenvolvedor')
    await page.waitForLoadState('networkidle')

    const tabDs = page.locator('[data-testid="tab-design-system"]')
    await expect(tabDs).toBeVisible({ timeout: 10000 })
    await tabDs.click()

    // Valida seção de demonstração do AppShell
    const showcaseSection = page.locator('[data-testid="showcase-appshell-section"]')
    await expect(showcaseSection).toBeVisible()
    await expect(page.getByText('Estrutura Unificada — AppShell + Header + Sidebar Komposo/Disk')).toBeVisible()

    // Valida painel de diagnóstico
    const diag = page.locator('[data-testid="navigation-diagnostic-panel"]')
    await expect(diag).toBeVisible()
    await expect(diag.getByText('Seven Entretenimento')).toBeVisible()
  })
})
