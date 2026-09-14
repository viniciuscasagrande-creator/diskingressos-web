import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'

test.describe('Plano de Contas no Financeiro e Desvinculação da Contabilidade', () => {
  test('Deve acessar Plano de Contas no Financeiro e não misturar com a Contabilidade', async ({ page }) => {
    await login(page, qaUsers.admin.email, qaUsers.admin.password)

    // Seleciona um produtor para permitir acesso à Contabilidade (ContextGuard)
    const producerSelect = page.locator('select[aria-label*="produtor" i], select:has-text("Produtora")')
    if (await producerSelect.count() > 0) {
      await producerSelect.first().selectOption({ index: 1 })
      await page.waitForTimeout(500)
    }

    // 1. Navega para Plano de Contas no Financeiro
    await page.goto('/app/finance-chart-accounts')
    await page.waitForLoadState('domcontentloaded')

    // Verifica que a tela de Plano de Contas Estruturado está visível
    const heading = page.locator('h1:has-text("Plano de Contas Estruturado")')
    await expect(heading).toBeVisible({ timeout: 10_000 })

    // Verifica que o menu Financeiro está aberto e Plano de Contas no Financeiro está ativo
    const financeiroCollapsible = page.locator('[data-testid="collapsible-financeiro"]')
    await expect(financeiroCollapsible).toHaveClass(/open/)

    const navItemPlano = page.locator('[data-testid="nav-finance-chart-accounts"]')
    await expect(navItemPlano).toBeVisible()
    await expect(navItemPlano).toHaveClass(/active/)

    // Verifica que itens da Contabilidade NÃO estão ativos
    const activeAccountingItems = page.locator('[data-testid="collapsible-contabilidade"] .module-nav-item.active')
    await expect(activeAccountingItems).toHaveCount(0)

    // 2. Navega para a Visão Geral da Contabilidade
    await page.goto('/contabilidade/dashboard')
    await page.waitForLoadState('domcontentloaded')

    // Verifica que a tela de Contabilidade abriu na Visão Geral
    const contabilidadeView = page.locator('#view-accounting-disk')
    await expect(contabilidadeView).toBeVisible({ timeout: 10_000 })

    const activeTab = page.locator('[data-accounting-tab="dashboard"]')
    await expect(activeTab).toHaveAttribute('aria-selected', 'true')

    // Verifica que o menu Contabilidade está aberto e Visão Geral está ativo
    const contabilidadeCollapsible = page.locator('[data-testid="collapsible-contabilidade"]')
    await expect(contabilidadeCollapsible).toHaveClass(/open/)

    const navItemVisaoGeral = page.locator('[data-testid="nav-accounting-dashboard"]')
    await expect(navItemVisaoGeral).toHaveClass(/active/)

    // Verifica que Plano de Contas no Financeiro NÃO está ativo quando na Contabilidade
    await expect(navItemPlano).not.toHaveClass(/active/)
  })
})
