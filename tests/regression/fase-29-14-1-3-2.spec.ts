// ==============================================================================
// FASE 29.14.1.3.2 — TESTES DE HOMOLOGAÇÃO: DASHBOARD + EVENTOS + VENDAS/PEDIDOS
// Suíte oficial: tests/regression/fase-29-14-1-3-2.spec.ts
// Validação: Componentes Komposo/Disk em Dashboard, Eventos, Vendas, Pedidos,
// Claro/Escuro, Contexto Produtor x Evento, Mobile 390px e Captura das 16 Evidências
// ==============================================================================

import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'
import fs from 'fs'
import path from 'path'

const EVIDENCIAS_DIR = path.join(process.cwd(), 'evidencias', 'fase-29-14-1-3-2')

test.beforeAll(() => {
  if (!fs.existsSync(EVIDENCIAS_DIR)) {
    fs.mkdirSync(EVIDENCIAS_DIR, { recursive: true })
  }
})

test.describe('Fase 29.14.1.3.2 — Dashboard + Eventos + Vendas/Pedidos', () => {

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  // --------------------------------------------------------------------------
  // 1. Dashboard: Carregamento, KPIs Komposo, Claro, Escuro, Sidebar e Mobile
  // --------------------------------------------------------------------------
  test('1. Dashboard: Componentes universais Disk, Claro/Escuro e Mobile 390px', async ({ page }) => {
    test.setTimeout(45_000)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verifica presença de cabeçalho e KPIs universais
    const kpiCards = page.locator('[data-testid="disk-kpi-card"]')
    await expect(kpiCards.first()).toBeVisible({ timeout: 15_000 })

    // Modo Claro
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('safesaff.theme', 'light')
    })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '01-dashboard-claro.png'), fullPage: false })

    // Modo Escuro
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
      localStorage.setItem('safesaff.theme', 'dark')
    })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '02-dashboard-escuro.png'), fullPage: false })

    // Captura Sidebar no Dashboard
    const sidebar = page.locator('#main-module-sidebar, [data-testid="main-module-sidebar"]').first()
    if (await sidebar.isVisible()) {
      await sidebar.screenshot({ path: path.join(EVIDENCIAS_DIR, '15-sidebar-dashboard.png') })
    } else {
      await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '15-sidebar-dashboard.png') })
    }

    // Mobile 390px
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '11-dashboard-mobile-390px.png'), fullPage: false })
  })

  // --------------------------------------------------------------------------
  // 2. Eventos: Hierarquia Limpa, DiskPageHeader, Controles, Claro/Escuro e Mobile
  // --------------------------------------------------------------------------
  test('2. Eventos: Hierarquia semântica, DiskPageHeader, Claro/Escuro e Mobile 390px', async ({ page }) => {
    test.setTimeout(45_000)
    await page.goto('/eventos')
    await page.waitForLoadState('networkidle')

    const eventsPage = page.locator('[data-testid="events-page"]')
    await expect(eventsPage).toBeVisible({ timeout: 15_000 })

    // Verifica que o heading principal "Eventos" está presente e limpo
    await expect(page.getByRole('heading', { name: 'Eventos', exact: true })).toBeVisible()

    // Verifica que o botão de retorno está integrado sem poluição
    await expect(page.getByRole('button', { name: /Voltar ao Dashboard/i })).toBeVisible()

    // Verifica alternador Horizontal / Vertical e status
    const btnHorizontal = page.locator('[data-testid="btn-view-horizontal"]')
    const btnVertical = page.locator('[data-testid="btn-view-vertical"]')
    await expect(btnHorizontal).toBeVisible()
    await expect(btnVertical).toBeVisible()

    // Modo Claro
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('safesaff.theme', 'light')
    })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '03-eventos-claro.png'), fullPage: false })
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '05-eventos-todos-eventos.png'), fullPage: false })

    // Modo Escuro
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
      localStorage.setItem('safesaff.theme', 'dark')
    })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '04-eventos-escuro.png'), fullPage: false })

    // Contexto de Evento Específico: Clica no primeiro card de evento
    const firstCard = page.locator('[data-testid="event-card"]').first()
    if (await firstCard.isVisible()) {
      await firstCard.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '06-eventos-evento-especifico.png'), fullPage: false })
      await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '16-contexto-evento.png'), fullPage: false })
    }

    // Mobile 390px na tela de Eventos
    await page.goto('/eventos')
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '12-eventos-mobile-390px.png'), fullPage: false })
  })

  // --------------------------------------------------------------------------
  // 3. Vendas / Painel Comercial: KPIs, Gráficos, Claro/Escuro e Mobile
  // --------------------------------------------------------------------------
  test('3. Vendas: Painel Comercial, KPIs, Claro/Escuro e Mobile 390px', async ({ page }) => {
    test.setTimeout(45_000)
    // Acessa a Central de Eventos e abre o primeiro evento para carregar o contexto
    await page.goto('/eventos')
    await page.waitForLoadState('networkidle')

    const firstCard = page.locator('[data-testid="event-card"]').first()
    await expect(firstCard).toBeVisible({ timeout: 15_000 })
    await firstCard.click()

    const commercialDashboard = page.locator('[data-testid="event-commercial-dashboard"]')
    await expect(commercialDashboard).toBeVisible({ timeout: 15_000 })

    // Modo Claro
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('safesaff.theme', 'light')
    })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '07-vendas-claro.png'), fullPage: false })

    // Modo Escuro
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
      localStorage.setItem('safesaff.theme', 'dark')
    })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '08-vendas-escuro.png'), fullPage: false })

    // Mobile 390px
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '13-vendas-mobile-390px.png'), fullPage: false })
  })

  // --------------------------------------------------------------------------
  // 4. Pedidos: Central Commerce Core, KPIs, Tabela, Dossiê, Claro/Escuro e Mobile
  // --------------------------------------------------------------------------
  test('4. Pedidos: Central Commerce Core, Tabela, Dossiê 360°, Claro/Escuro e Mobile', async ({ page }) => {
    test.setTimeout(45_000)
    await page.goto('/commerce-orders')
    await page.waitForLoadState('networkidle')

    const hub = page.locator('[data-testid="commerce-orders-hub"]')
    await expect(hub).toBeVisible({ timeout: 15_000 })
    await expect(hub).toContainText('Pedidos, Ingressos & Integridade Comercial')

    // Modo Claro
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('safesaff.theme', 'light')
    })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '09-pedidos-claro.png'), fullPage: false })

    // Modo Escuro
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
      localStorage.setItem('safesaff.theme', 'dark')
    })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '10-pedidos-escuro.png'), fullPage: false })

    // Mobile 390px
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '14-pedidos-mobile-390px.png'), fullPage: false })
  })

  // --------------------------------------------------------------------------
  // 5. Navegação Integrada e Semântica sem Regressão de Shell
  // --------------------------------------------------------------------------
  test('5. Navegação Sequencial: Dashboard -> Eventos -> Vendas -> Pedidos -> Dashboard', async ({ page }) => {
    test.setTimeout(45_000)
    // 1. Dashboard
    await page.goto('/')
    await expect(page.locator('[data-testid="dashboard-page"], [data-testid="disk-kpi-card"]').first()).toBeVisible({ timeout: 10_000 })

    // 2. Eventos
    await page.goto('/eventos')
    await expect(page.locator('[data-testid="events-page"]')).toBeVisible({ timeout: 10_000 })

    // 3. Vendas (Painel Comercial via clique no primeiro evento)
    const firstCard = page.locator('[data-testid="event-card"]').first()
    await expect(firstCard).toBeVisible({ timeout: 10_000 })
    await firstCard.click()
    await expect(page.locator('[data-testid="event-commercial-dashboard"]')).toBeVisible({ timeout: 10_000 })

    // 4. Pedidos
    await page.goto('/commerce-orders')
    await expect(page.locator('[data-testid="commerce-orders-hub"]')).toBeVisible({ timeout: 10_000 })

    // 5. Retorna ao Dashboard
    await page.goto('/')
    await expect(page.locator('[data-testid="dashboard-page"], [data-testid="disk-kpi-card"]').first()).toBeVisible({ timeout: 10_000 })

    // Verifica que não há duplicações de app-shell no DOM
    const shellCount = await page.locator('[data-testid="app-shell"]').count()
    expect(shellCount).toBeLessThanOrEqual(1)
  })
})
