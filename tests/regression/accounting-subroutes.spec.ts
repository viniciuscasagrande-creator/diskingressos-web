// ==============================================================================
// FASE 28.15.4 — TESTES E2E DE CONSOLIDAÇÃO DA CONTABILIDADE E SUBROTAS
// ==============================================================================

import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

const ACCOUNTING_SUBROUTES = [
  { path: '/contabilidade/dashboard', tab: 'dashboard', label: 'Visão Geral', titleSnippet: 'Contábil' },
  { path: '/contabilidade/inteligencia', tab: 'inteligencia', label: 'Inteligência Contábil', titleSnippet: 'Inteligência Contábil' },
  { path: '/contabilidade/conciliacao', tab: 'conciliacao', label: 'Centro de Conciliação', titleSnippet: 'Conciliação' },
  { path: '/contabilidade/rastreabilidade', tab: 'rastreabilidade', label: 'Rastreabilidade', titleSnippet: 'Rastreabilidade' },
  { path: '/contabilidade/dre', tab: 'dre', label: 'DRE Gerencial', titleSnippet: 'DRE' },
  { path: '/contabilidade/balanco', tab: 'balanco', label: 'Balanço Patrimonial', titleSnippet: 'Balanço' },
  { path: '/contabilidade/fechamento', tab: 'fechamento', label: 'Fechamento Mensal', titleSnippet: 'Fechamento' },
  { path: '/contabilidade/plano-de-contas', tab: 'plano-de-contas', label: 'Plano de Contas', titleSnippet: 'Plano de Contas' },
  { path: '/contabilidade/lancamentos', tab: 'lancamentos', label: 'Lançamentos', titleSnippet: 'Lançamentos' },
  { path: '/contabilidade/documentos', tab: 'documentos', label: 'Documentos', titleSnippet: 'Documentos' },
  { path: '/contabilidade/fiscal', tab: 'fiscal', label: 'Fiscal', titleSnippet: 'Fiscal' },
  { path: '/contabilidade/relatorios', tab: 'relatorios', label: 'Relatórios', titleSnippet: 'Relatórios' }
] as const

test.describe('Fase 28.15.4 — Consolidação Contabilidade + Subrotas', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Deve manter view-accounting-disk única e renderizar todas as 12 subrotas contábeis', async ({ page }) => {
    for (const sub of ACCOUNTING_SUBROUTES) {
      await page.goto(sub.path)
      await page.waitForLoadState('domcontentloaded')

      // 1. Verifica view única
      const view = page.locator('#view-accounting-disk')
      await expect(view).toBeVisible({ timeout: 10_000 })
      await expect(view).toHaveAttribute('data-view', 'accounting-disk')

      // 2. Verifica painel ativo correto
      const activePanel = page.locator(`[data-accounting-panel="${sub.tab}"]`)
      await expect(activePanel).toBeVisible()
      await expect(activePanel).toHaveClass(/active/)

      // 3. Verifica aba ativa e atributo ARIA
      const activeTab = page.locator(`[data-accounting-tab="${sub.tab}"]`)
      await expect(activeTab).toBeVisible()
      await expect(activeTab).toHaveAttribute('aria-selected', 'true')

      // 4. Verifica que apenas um item contábil da sidebar está ativo
      const activeSidebarItems = page.locator('.safesaff-sidebar [data-route^="/contabilidade/"].active')
      await expect(activeSidebarItems).toHaveCount(1)

      // 5. Verifica se a seção Contabilidade permanece aberta
      const collapsible = page.locator('[data-testid="collapsible-contabilidade"]')
      await expect(collapsible).toHaveClass(/open/)
    }
  })

  test('Deve suportar troca de abas via AccountingController e switchAccountingTab() sem erros', async ({ page }) => {
    await page.goto('/contabilidade/dashboard')
    await expect(page.locator('#view-accounting-disk')).toBeVisible()

    // Testa chamada via window.switchAccountingTab com string direta
    await page.evaluate(() => {
      ;(window as any).switchAccountingTab('dre')
    })
    await expect(page.locator('[data-accounting-panel="dre"]')).toBeVisible()
    await expect(page.locator('[data-accounting-tab="dre"]')).toHaveAttribute('aria-selected', 'true')

    // Testa chamada via window.switchAccountingTab com assinatura antiga (event, tabName)
    await page.evaluate(() => {
      ;(window as any).switchAccountingTab(null, 'conciliacao')
    })
    await expect(page.locator('[data-accounting-panel="conciliacao"]')).toBeVisible()
    await expect(page.locator('[data-accounting-tab="conciliacao"]')).toHaveAttribute('aria-selected', 'true')

    // Testa caso de tabName = undefined (deve fallback para dashboard sem lançar exceção)
    await page.evaluate(() => {
      ;(window as any).switchAccountingTab(undefined)
    })
    await expect(page.locator('[data-accounting-panel="dashboard"]')).toBeVisible()

    // Testa chamada de Rastreabilidade sem causar undefined
    await page.evaluate(() => {
      ;(window as any).switchAccountingTab('rastreabilidade')
    })
    await expect(page.locator('[data-accounting-panel="rastreabilidade"]')).toBeVisible()
    await expect(page.locator('[data-accounting-tab="rastreabilidade"]')).toHaveAttribute('aria-selected', 'true')
  })

  test('Deve preservar aba e estado após F5 (reload) e navegação Voltar/Avançar (popstate)', async ({ page }) => {
    // 1. Acessa deep link diretamente
    await page.goto('/contabilidade/dre')
    await expect(page.locator('#view-accounting-disk')).toBeVisible()
    await expect(page.locator('[data-accounting-panel="dre"]')).toBeVisible()

    // 2. F5 / Reload da página
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('#view-accounting-disk')).toBeVisible()
    await expect(page.locator('[data-accounting-panel="dre"]')).toBeVisible()
    await expect(page.locator('[data-accounting-tab="dre"]')).toHaveAttribute('aria-selected', 'true')

    // 3. Navega para Balanço
    await page.locator('[data-accounting-tab="balanco"]').click()
    await expect(page.locator('[data-accounting-panel="balanco"]')).toBeVisible()
    await expect(page).toHaveURL(/\/contabilidade\/balanco/)

    // 4. Clica em Voltar do navegador
    await page.goBack()
    await expect(page.locator('[data-accounting-panel="dre"]')).toBeVisible()
    await expect(page.locator('[data-accounting-tab="dre"]')).toHaveAttribute('aria-selected', 'true')

    // 5. Clica em Avançar do navegador
    await page.goForward()
    await expect(page.locator('[data-accounting-panel="balanco"]')).toBeVisible()
    await expect(page.locator('[data-accounting-tab="balanco"]')).toHaveAttribute('aria-selected', 'true')
  })

  test('Deve aceitar alias legado accounting-disk redirecionando para /contabilidade/dashboard', async ({ page }) => {
    await page.goto('/contabilidade/dashboard')
    await expect(page.locator('#view-accounting-disk')).toBeVisible()

    // Testa resolução do alias no AppRouter
    const resolved = await page.evaluate(() => {
      return (window as any).AppRouter.resolve('accounting-disk')
    })
    expect(resolved.path).toBe('/contabilidade/dashboard')
    expect(resolved.view).toBe('accounting-disk')
  })
})
