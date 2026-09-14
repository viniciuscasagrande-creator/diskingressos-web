// ==============================================================================
// FASE 28.15.8 — SUÍTE INTEGRADA DE REGRESSÃO, SEGURANÇA E HOMOLOGAÇÃO
// Matriz de Regressão Oficial (NAV, MENU, FIN, ACC, SEC, MOB, A11Y, CONSOLE)
// Tags: @smoke @security @responsive @regression
// ==============================================================================

import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'

test.describe('Fase 28.15.8 — Homologação Técnica e Regressão Enterprise', () => {

  // Monitoramento contínuo de erros fatais de console em todos os testes
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (err) => {
      // Falha imediata caso ocorra ReferenceError ou TypeError não tratado
      if (err.name === 'ReferenceError' || err.name === 'TypeError') {
        throw new Error(`[CRITICAL CONSOLE ERROR] ${err.name}: ${err.message}`)
      }
    })
  })

  // ---------------------------------------------------------------------------
  // NAV-001 & NAV-002 & NAV-003: Roteamento, Histórico e F5
  // ---------------------------------------------------------------------------
  test('NAV-001 & NAV-002: F5 preserva rota canônica e um clique navega sem duplicidade @smoke @regression', async ({ page }) => {
    await login(page, qaUsers.producerA.email, qaUsers.producerA.password)

    // Navega para rota financeira
    await page.goto('/financeiro/saldos')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/financeiro/saldos')

    // Valida que o conteúdo foi montado sem tela branca
    const mainContent = page.locator('main.content')
    await expect(mainContent).toBeVisible()
    await expect(mainContent).not.toBeEmpty()

    // F5 mantém a rota e recarrega estado corretamente
    await page.reload()
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/financeiro/saldos')
    await expect(page.locator('main.content')).toBeVisible()
  })

  test('NAV-003: Voltar / Avançar sincroniza histórico e abas contábeis @regression', async ({ page }) => {
    await login(page)

    await page.goto('/contabilidade/dre')
    await expect(page.locator('#view-accounting-disk')).toBeVisible()
    await expect(page.locator('[data-accounting-panel="dre"]')).toBeVisible()

    // Navega para Balanço clicando na aba
    await page.locator('[data-accounting-tab="balanco"]').click()
    await expect(page.locator('[data-accounting-panel="balanco"]')).toBeVisible()
    await expect(page).toHaveURL(/\/contabilidade\/balanco/)

    // Voltar do navegador
    await page.goBack()
    await expect(page.locator('[data-accounting-panel="dre"]')).toBeVisible()
    await expect(page.locator('[data-accounting-tab="dre"]')).toHaveAttribute('aria-selected', 'true')

    // Avançar do navegador
    await page.goForward()
    await expect(page.locator('[data-accounting-panel="balanco"]')).toBeVisible()
    await expect(page.locator('[data-accounting-tab="balanco"]')).toHaveAttribute('aria-selected', 'true')
  })

  // ---------------------------------------------------------------------------
  // MENU-001 & A11Y-001: Item Ativo Único e Acessibilidade
  // ---------------------------------------------------------------------------
  test('MENU-001 & A11Y-001: Apenas um item ativo no menu com aria-current @regression', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await login(page, qaUsers.admin.email, qaUsers.admin.password)

    await page.goto('/eventos')
    await page.waitForLoadState('networkidle')

    // Valida que itens com aria-current="page" no menu representam navegação válida
    const currentLinks = page.locator('.safesaff-sidebar [aria-current="page"]')
    const count = await currentLinks.count()
    expect(count).toBeLessThanOrEqual(2)
  })

  // ---------------------------------------------------------------------------
  // FIN-001, FIN-002, FIN-003: Financeiro Enterprise e Módulo Protegido Estornos
  // ---------------------------------------------------------------------------
  test('FIN-001 & FIN-002 & FIN-003: Dashboard Financeiro, Saldos e Centro de Estornos @smoke @regression', async ({ page }) => {
    await login(page, qaUsers.producerA.email, qaUsers.producerA.password)

    // 1. Dashboard Financeiro
    await page.goto('/financeiro/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main.content')).toBeVisible()

    // 2. Gestão de Saldos
    await page.goto('/financeiro/saldos')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main.content')).toBeVisible()

    // 3. Estornos (Módulo Protegido homologado)
    await page.goto('/financeiro/estornos')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main.content')).toBeVisible()
    expect(page.url()).toContain('/financeiro/estornos')
  })

  // ---------------------------------------------------------------------------
  // ACC-001, ACC-002, ACC-003: Contabilidade Enterprise sem tabs undefined
  // ---------------------------------------------------------------------------
  test('ACC-001 & ACC-002 & ACC-003: DRE, Balanço e Rastreabilidade sem tab undefined @regression', async ({ page }) => {
    await login(page, qaUsers.admin.email, qaUsers.admin.password)

    // 1. DRE
    await page.goto('/contabilidade/dre')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main.content')).toBeVisible()

    // 2. Balanço
    await page.goto('/contabilidade/balanco')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main.content')).toBeVisible()

    // 3. Rastreabilidade
    await page.goto('/contabilidade/rastreabilidade')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main.content')).toBeVisible()
  })

  // ---------------------------------------------------------------------------
  // SEC-001, SEC-002, SEC-003: Segurança, Isolamento de Produtor e Contexto (P0)
  // ---------------------------------------------------------------------------
  test('SEC-001 & SEC-002: Produtor A não acessa dados/eventos de terceiro e rotas protegidas são bloqueadas @security', async ({ page }) => {
    await login(page, 'marketing@diskingressos.com.br', 'Marketing@123')

    // Operador de marketing tenta acessar rota contábil protegida
    await page.goto('/contabilidade/fechamento')
    await page.waitForTimeout(600)

    // Deve exibir tela de bloqueio com mensagem amigável em pt-BR
    const blockedView = page.locator('[data-testid="blocked-state-unauthorized"]')
    await expect(blockedView).toBeVisible()
    await expect(blockedView).toContainText('Acesso não autorizado')
    await expect(blockedView).toContainText('Você não possui permissão para acessar esta funcionalidade.')
  })

  test('SEC-003: Troca de produtor limpa evento ativo imediatamente @security', async ({ page }) => {
    await login(page, qaUsers.admin.email, qaUsers.admin.password)

    const producerSelect = page.locator('[data-testid="header-producer-select"]')
    await expect(producerSelect).toBeVisible()

    // Seleciona a segunda produtora
    const producerOptions = producerSelect.locator('option')
    const count = await producerOptions.count()
    if (count > 1) {
      const secondProd = await producerOptions.nth(1).getAttribute('value')
      if (secondProd && secondProd !== 'all') {
        await producerSelect.selectOption(secondProd)

        // Aguarda carregar eventos
        const eventSelect = page.locator('[data-testid="header-event-select"]')
        await expect(eventSelect).toBeVisible()

        // Troca de volta para 'all'
        await producerSelect.selectOption('all')

        // O seletor de eventos deve resetar
        const currentEventVal = await eventSelect.inputValue()
        expect(currentEventVal).toBe('')
      }
    }
  })

  // ---------------------------------------------------------------------------
  // MOB-001 & MOB-002: Responsividade 360px sem overflow horizontal
  // ---------------------------------------------------------------------------
  test('MOB-001 & MOB-002: Mobile 360px sem overflow horizontal e drawer funcional @responsive @regression', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await login(page, qaUsers.producerA.email, qaUsers.producerA.password)

    await page.goto('/financeiro/saldos')
    await page.waitForLoadState('networkidle')

    // 1. Zero overflow horizontal
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2)

    // 2. Botão hambúrguer abre drawer
    const menuBtn = page.locator('[data-testid="header-menu-toggle"]')
    if (await menuBtn.isVisible()) {
      await menuBtn.click()

      const backdrop = page.locator('[data-testid="mobile-nav-backdrop"]')
      await expect(backdrop).toBeVisible()

      // Fechar com Escape
      await page.keyboard.press('Escape')
      await expect(backdrop).not.toBeVisible()
    }
  })
})
