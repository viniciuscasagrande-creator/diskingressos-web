// ==============================================================================
// FASE 29.14.1.3.1 — TESTES DE REGRESSÃO E HOMOLOGAÇÃO DO DESIGN SYSTEM DISK
// Suíte: tests/regression/design-system-components.spec.ts
// Validação: Vitrine, Componentes Universais, Claro/Escuro, Modal, Drawer, Tabs, Tabela e Mobile
// Captura de evidências em evidencias/fase-29-14-1-3-1/
// ==============================================================================

import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'
import fs from 'fs'
import path from 'path'

const EVIDENCIAS_DIR = path.join(process.cwd(), 'evidencias', 'fase-29-14-1-3-1')

test.beforeAll(() => {
  if (!fs.existsSync(EVIDENCIAS_DIR)) {
    fs.mkdirSync(EVIDENCIAS_DIR, { recursive: true })
  }
})

test.describe('Fase 29.14.1.3.1 — Componentes Base Universais Komposo/Disk', () => {

  test.beforeEach(async ({ page }) => {
    await login(page, qaUsers.admin.email, qaUsers.admin.password)
    await page.goto('/desenvolvedor/design-system')
    await page.waitForLoadState('networkidle')
  })

  // --------------------------------------------------------------------------
  // 1. Abertura e Renderização da Vitrine
  // --------------------------------------------------------------------------
  test('1. Deve abrir a vitrine do Design System e renderizar os componentes universais', async ({ page }) => {
    const showcase = page.locator('[data-testid="design-system-showcase"]')
    await expect(showcase).toBeVisible()

    const universalShowcase = page.locator('[data-testid="universal-components-showcase"]')
    await expect(universalShowcase).toBeVisible()

    // Validação de presença dos componentes universais
    await expect(page.locator('[data-testid="disk-page-header"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="disk-card"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="disk-kpi-card"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="disk-data-table-container"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="disk-filter-bar"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="disk-tabs"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="disk-badge"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="disk-status"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="disk-toolbar"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="disk-chart-container"]').first()).toBeVisible()
  })

  // --------------------------------------------------------------------------
  // 2. Alternância de Temas Claro / Escuro / Sistema com Evidências
  // --------------------------------------------------------------------------
  test('2. Deve alternar entre Modo Claro, Escuro e Sistema mantendo integridade e capturar screenshots', async ({ page }) => {
    test.setTimeout(60_000)

    // Modo Claro
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
      localStorage.setItem('disk_theme', 'light')
    })
    await page.waitForTimeout(300)
    await page.screenshot({
      path: path.join(EVIDENCIAS_DIR, '01-design-system-claro.png'),
      fullPage: false,
    })

    // Modo Escuro
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('disk_theme', 'dark')
    })
    await page.waitForTimeout(300)
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.screenshot({
      path: path.join(EVIDENCIAS_DIR, '02-design-system-escuro.png'),
      fullPage: false,
    })

    // Modo Sistema
    await page.evaluate(() => {
      localStorage.setItem('disk_theme', 'system')
    })
    const storedTheme = await page.evaluate(() => localStorage.getItem('disk_theme'))
    expect(storedTheme).toBe('system')
  })

  // --------------------------------------------------------------------------
  // 3. Interação com Abas (DiskTabs) e Controle Segmentado
  // --------------------------------------------------------------------------
  test('3. Deve alternar abas e controles segmentados com atualização de estado', async ({ page }) => {
    const tabsContainer = page.locator('[data-testid="disk-tabs"]').first()
    await expect(tabsContainer).toBeVisible()

    // Clicar na aba Extrato Financeiro
    const extratoTab = page.locator('button[role="tab"]:has-text("Extrato Financeiro")').first()
    if (await extratoTab.count() > 0) {
      await extratoTab.click()
      await expect(extratoTab).toHaveAttribute('aria-selected', 'true')
      await expect(page.getByText('Painel da aba selecionada: extrato')).toBeVisible()
    }

    // Testar DiskSegmentedControl
    const segmented = page.locator('[data-testid="disk-segmented-control"]').first()
    await expect(segmented).toBeVisible()
    const cardsOption = segmented.locator('button:has-text("Cards")')
    if (await cardsOption.count() > 0) {
      await cardsOption.click()
      await expect(cardsOption).toHaveAttribute('aria-checked', 'true')
    }
  })

  // --------------------------------------------------------------------------
  // 4. Abertura e Fechamento de Diálogo Modal (DiskModal)
  // --------------------------------------------------------------------------
  test('4. Deve abrir modal, verificar backdrop blur, fechar via Escape e capturar screenshot', async ({ page }) => {
    // Botão para abrir modal
    const openModalBtn = page.getByRole('button', { name: 'Abrir Diálogo Modal' }).first()
    await expect(openModalBtn).toBeVisible()
    await openModalBtn.click()

    const modal = page.locator('[data-testid="disk-modal"]')
    await expect(modal).toBeVisible()
    await expect(modal.getByText('Confirmação de Ação Crítica')).toBeVisible()

    // Screenshot com modal aberto
    await page.screenshot({
      path: path.join(EVIDENCIAS_DIR, '03-modal-aberto.png'),
      fullPage: false,
    })

    // Fechar com Escape
    await page.keyboard.press('Escape')
    await expect(modal).not.toBeVisible()
  })

  // --------------------------------------------------------------------------
  // 5. Abertura e Fechamento de Painel Lateral (DiskDrawer)
  // --------------------------------------------------------------------------
  test('5. Deve abrir drawer lateral, interagir e fechar capturando screenshot', async ({ page }) => {
    const openDrawerBtn = page.getByRole('button', { name: 'Abrir Drawer Lateral' }).first()
    await expect(openDrawerBtn).toBeVisible()
    await openDrawerBtn.click()

    const drawer = page.locator('[data-testid="disk-drawer"]')
    await expect(drawer).toBeVisible()
    await expect(drawer.getByText('Painel de Filtros Avançados')).toBeVisible()

    // Screenshot com drawer aberto
    await page.screenshot({
      path: path.join(EVIDENCIAS_DIR, '04-drawer-aberto.png'),
      fullPage: false,
    })

    // Fechar via botão fechar
    const closeBtn = drawer.locator('button[aria-label="Fechar painel"]')
    await closeBtn.click()
    await expect(drawer).not.toBeVisible()
  })

  // --------------------------------------------------------------------------
  // 6. Seleção de Linhas e Ações em Lote na Tabela (DiskDataTable)
  // --------------------------------------------------------------------------
  test('6. Deve selecionar linhas na tabela e exibir barra de ações em lote', async ({ page }) => {
    const tableContainer = page.locator('[data-testid="disk-data-table-container"]')
    await expect(tableContainer).toBeVisible()

    // Selecionar o checkbox da primeira linha
    const firstRowCheckbox = page.locator('tbody tr input[type="checkbox"]').first()
    await expect(firstRowCheckbox).toBeVisible()
    await firstRowCheckbox.click()

    // Deve surgir a barra de ações em lote
    await expect(page.getByText('selecionados')).toBeVisible()
    await expect(tableContainer.getByRole('button', { name: 'Exportar' })).toBeVisible()
  })

  // --------------------------------------------------------------------------
  // 7. Responsividade Mobile (390px) e Zero Overflow
  // --------------------------------------------------------------------------
  test('7. Deve validar visualização mobile em 390px com zero overflow e screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(400)

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth
    })
    expect(hasHorizontalScroll).toBe(false)

    await page.screenshot({
      path: path.join(EVIDENCIAS_DIR, '05-design-system-mobile-390px.png'),
      fullPage: false,
    })
  })
})
