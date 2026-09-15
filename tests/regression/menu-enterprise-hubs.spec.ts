// ==============================================================================
// FASE 28.15.8.1 — TESTES E2E: REORGANIZAÇÃO DO MENU ENTERPRISE EM 2 NÍVEIS
// E CONTEXTO GLOBAL PRODUTOR × EVENTO (HUBS, CARDS, BUSCA E ESCOPO)
// ==============================================================================

import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'

test.describe('Fase 28.15.8.1 — Hubs Enterprise e Contexto Global Produtor × Evento', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, qaUsers.producerA.email, qaUsers.producerA.password)
  })

  // ===========================================================================
  // 1. FINANCEIRO: Navegação pelos 7 Hubs e Acesso a Funções Operacionais via Cards
  // ===========================================================================
  test('Financeiro: Renderiza hubs estratégicos e navega para tela operacional ao clicar em card', async ({ page }) => {
    // 1. Hub Conta Financeira
    await page.goto('/financeiro/conta-financeira')
    await page.waitForLoadState('domcontentloaded')
    const hubAccount = page.locator('[data-testid="module-hub-finance-hub-account"]')
    await expect(hubAccount).toBeVisible({ timeout: 10_000 })
    await expect(hubAccount.locator('.module-hub-title')).toContainText('Conta Financeira')
    await expect(page.locator('[data-testid="hub-card-acc-producer"]')).toBeVisible()
    await expect(page.locator('[data-testid="hub-card-acc-statement"]')).toBeVisible()

    // 2. Hub Contas & Compromissos
    await page.goto('/financeiro/contas')
    await page.waitForLoadState('domcontentloaded')
    const hubBills = page.locator('[data-testid="module-hub-finance-hub-bills"]')
    await expect(hubBills).toBeVisible({ timeout: 10_000 })
    await expect(hubBills.locator('.module-hub-title')).toContainText('Contas & Compromissos')
    await expect(page.locator('[data-testid="hub-card-bills-receivables"]')).toBeVisible()
    await expect(page.locator('[data-testid="hub-card-bills-payables"]')).toBeVisible()

    // Clica no card de Contas a Receber e valida navegação
    await page.locator('[data-testid="hub-card-bills-receivables"]').click()
    await page.waitForTimeout(600)
    // Deve navegar para tela de contas a receber ou rota correspondente
    await expect(page).toHaveURL(/finance-receivables/)

    // 3. Hub Tesouraria
    await page.goto('/financeiro/tesouraria')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="module-hub-finance-hub-treasury"]')).toBeVisible()

    // 4. Hub Compras & Fornecedores
    await page.goto('/financeiro/compras-fornecedores')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="module-hub-finance-hub-procurement"]')).toBeVisible()

    // 5. Hub Controladoria
    await page.goto('/financeiro/controladoria')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="module-hub-finance-hub-controlling"]')).toBeVisible()

    // 6. Hub Conciliação
    await page.goto('/financeiro/conciliacao')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="module-hub-finance-hub-reconciliation"]')).toBeVisible()

    // 7. Hub Relatórios Financeiros
    await page.goto('/financeiro/relatorios')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="module-hub-finance-hub-reports"]')).toBeVisible()
  })

  // ===========================================================================
  // 2. CONTABILIDADE: Hubs de Operação e Demonstrações com Redirecionamento de Abas
  // ===========================================================================
  test('Contabilidade: Hubs de Operação Contábil e Demonstrações ativam abas corretas', async ({ page }) => {
    // 1. Hub Operação Contábil
    await page.goto('/contabilidade/operacao')
    await page.waitForLoadState('domcontentloaded')
    const hubOps = page.locator('[data-testid="module-hub-accounting-hub-operations"]')
    await expect(hubOps).toBeVisible({ timeout: 10_000 })
    await expect(hubOps.locator('.module-hub-title')).toContainText('Operação Contábil')

    // Clica no card Plano de Contas Contábil
    const cardChart = page.locator('[data-testid="hub-card-ops-chart"]')
    await expect(cardChart).toBeVisible()
    await cardChart.click()
    await page.waitForTimeout(600)

    // Valida que foi para /contabilidade/plano-de-contas na view accounting-disk
    const accountingView = page.locator('#view-accounting-disk')
    await expect(accountingView).toBeVisible({ timeout: 10_000 })
    const activeTab = page.locator('[data-accounting-tab="plano-de-contas"]')
    await expect(activeTab).toHaveAttribute('aria-selected', 'true')

    // 2. Hub Demonstrações Contábeis
    await page.goto('/contabilidade/demonstracoes')
    await page.waitForLoadState('domcontentloaded')
    const hubStmts = page.locator('[data-testid="module-hub-accounting-hub-statements"]')
    await expect(hubStmts).toBeVisible({ timeout: 10_000 })
    await expect(hubStmts.locator('.module-hub-title')).toContainText('Demonstrações Contábeis')

    // Clica no card DRE Gerencial
    const cardDre = page.locator('[data-testid="hub-card-stmt-dre"]')
    await expect(cardDre).toBeVisible()
    await cardDre.click()
    await page.waitForTimeout(600)

    // Valida que foi para /contabilidade/dre na view accounting-disk
    await expect(page.locator('#view-accounting-disk')).toBeVisible()
    const dreTab = page.locator('[data-accounting-tab="dre"]')
    await expect(dreTab).toHaveAttribute('aria-selected', 'true')

    // 3. Hub Fiscal & Compliance
    await page.goto('/contabilidade/fiscal-compliance')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="module-hub-accounting-hub-compliance"]')).toBeVisible()
  })

  // ===========================================================================
  // 3. MARKETING: Hubs de Campanhas, Comunicação e Analytics
  // ===========================================================================
  test('Marketing: Hubs de Campanhas e Comunicação renderizam e abrem subrotas', async ({ page }) => {
    // 1. Hub Campanhas
    await page.goto('/marketing/campanhas')
    await page.waitForLoadState('domcontentloaded')
    const hubCmp = page.locator('[data-testid="module-hub-marketing-hub-campaigns"]')
    await expect(hubCmp).toBeVisible({ timeout: 10_000 })
    await expect(hubCmp.locator('.module-hub-title')).toContainText('Campanhas')
    await expect(page.locator('[data-testid="hub-card-cmp-coupons"]')).toBeVisible()
    await expect(page.locator('[data-testid="hub-card-cmp-utm"]')).toBeVisible()

    // Clica no card Cupons & Descontos
    await page.locator('[data-testid="hub-card-cmp-coupons"]').click()
    await page.waitForTimeout(600)
    await expect(page).toHaveURL(/marketing-coupons/)

    // 2. Hub Comunicação
    await page.goto('/marketing/comunicacao')
    await page.waitForLoadState('domcontentloaded')
    const hubCom = page.locator('[data-testid="module-hub-marketing-hub-communication"]')
    await expect(hubCom).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('[data-testid="hub-card-com-whatsapp"]')).toBeVisible()
    await expect(page.locator('[data-testid="hub-card-com-email"]')).toBeVisible()

    // 3. Hub Analytics
    await page.goto('/marketing/analytics')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('[data-testid="module-hub-marketing-hub-analytics"]')).toBeVisible()
  })

  // ===========================================================================
  // 4. CONTEXTO GLOBAL: Alternância entre Visão Consolidada e Evento Específico
  // ===========================================================================
  test('Contexto Global: Alternador no Header comuta entre PRODUCER e EVENT, desbloqueando hub de pixels', async ({ page }) => {
    await page.goto('/financeiro/dashboard')
    await page.waitForLoadState('domcontentloaded')

    // Localiza seletor global no cabeçalho
    const selector = page.locator('[data-testid="global-event-selector"]')
    await expect(selector).toBeVisible()

    // Clica no botão do seletor para abrir o dropdown
    await selector.locator('button').first().click()
    await page.waitForTimeout(300)

    // Valida presença da opção rápida "Todos os Eventos (Produtor)"
    const consolidatedBtn = page.getByRole('button', { name: /Todos os Eventos \(Produtor\)/i })
    await expect(consolidatedBtn).toBeVisible()

    // Localiza os eventos listados no dropdown
    const eventButtons = selector.locator('div.max-h-60 button')
    const count = await eventButtons.count()
    expect(count).toBeGreaterThan(0)

    // Seleciona o primeiro evento da lista
    await eventButtons.first().click()
    await page.waitForTimeout(400)

    // Verifica que o seletor agora indica escopo de evento individual
    await expect(selector.locator('button').first()).toContainText(/Evento #/i)

    // Com evento selecionado, rota /marketing/pixels deve abrir o Hub sem bloqueio need_event
    await page.goto('/marketing/pixels')
    await page.waitForLoadState('domcontentloaded')
    const hubPixels = page.locator('[data-testid="module-hub-marketing-hub-pixels"]')
    await expect(hubPixels).toBeVisible({ timeout: 10_000 })
    await expect(hubPixels.locator('.module-hub-title')).toContainText('Conversões & Pixels')

    // Restaura escopo consolidado via seletor
    await selector.locator('button').first().click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: /Todos os Eventos \(Produtor\)/i }).click()
    await page.waitForTimeout(400)

    // Valida que o seletor voltou para 'Todos os Eventos'
    await expect(selector.locator('button').first()).toContainText('Todos os Eventos')
  })

  // ===========================================================================
  // 5. BUSCA INTERNA NO HUB: Filtragem reativa de cards em tempo real
  // ===========================================================================
  test('Hub Search: Filtragem reativa esconde cards não correspondentes e restaura ao limpar', async ({ page }) => {
    await page.goto('/financeiro/conta-financeira')
    await page.waitForLoadState('domcontentloaded')

    const hubAccount = page.locator('[data-testid="module-hub-finance-hub-account"]')
    await expect(hubAccount).toBeVisible({ timeout: 10_000 })

    const searchInput = page.locator('.module-hub-search-input')
    await expect(searchInput).toBeVisible()

    // Digita 'Extrato'
    await searchInput.fill('Extrato')
    await page.waitForTimeout(300)

    // Card de Extrato deve continuar visível
    await expect(page.locator('[data-testid="hub-card-acc-statement"]')).toBeVisible()

    // Card de Divisão de Receitas (Split) deve estar oculto
    await expect(page.locator('[data-testid="hub-card-acc-split"]')).toHaveCount(0)

    // Limpa a busca
    await searchInput.fill('')
    await page.waitForTimeout(300)

    // Ambos voltam a estar visíveis
    await expect(page.locator('[data-testid="hub-card-acc-statement"]')).toBeVisible()
    await expect(page.locator('[data-testid="hub-card-acc-split"]')).toBeVisible()
  })
})
