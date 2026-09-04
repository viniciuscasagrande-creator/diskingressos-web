import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.6 — Pesquisa Global 360° Operacional: Classificação e LGPD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/eventos')

    // Abre o primeiro evento disponível
    const eventCard = page.locator('.events-hub-grid .event-row-card, .event-card, table tr').first()
    await expect(eventCard).toBeVisible({ timeout: 15_000 })
    await eventCard.click()

    // Aguarda o Cockpit 360
    await expect(page.locator('[data-testid="cockpit-360-container"]')).toBeVisible({ timeout: 15_000 })

    // Navega para a Pesquisa Global usando a sidebar contextual
    const searchNav = page.locator('.event-context-sidebar button, .event-context-sidebar a').filter({ hasText: 'Busca Global' }).first()
    if (await searchNav.isVisible()) {
      await searchNav.click()
    } else {
      // Fallback: seletor com testid ou query
      await page.goto(page.url().replace(/\/command-center.*$/, '/global-search'))
    }

    await expect(page.locator('[data-testid="global-search-container"]')).toBeVisible({ timeout: 15_000 })
  })

  test('Renderiza container, abas com Incidentes e controles operacionais em 100% PT-BR', async ({ page }) => {
    await expect(page.locator('[data-testid="global-search-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="global-search-tabs"]')).toBeVisible()
    await expect(page.locator('[data-testid="tab-all"]')).toBeVisible()
    await expect(page.locator('[data-testid="tab-orders"]')).toBeVisible()
    await expect(page.locator('[data-testid="tab-customers"]')).toBeVisible()
    await expect(page.locator('[data-testid="tab-tickets"]')).toBeVisible()
    await expect(page.locator('[data-testid="tab-financial"]')).toBeVisible()
    await expect(page.locator('[data-testid="tab-checkins"]')).toBeVisible()
    await expect(page.locator('[data-testid="tab-support"]')).toBeVisible()
    await expect(page.locator('[data-testid="tab-refunds"]')).toBeVisible()
    await expect(page.locator('[data-testid="tab-incidents"]')).toBeVisible()

    // Valida texto do título
    const heading = page.locator('.egs-header-title h1')
    await expect(heading).toHaveText('Pesquisa Global 360°')
  })

  test('Atalho de teclado Ctrl+K focaliza o campo de busca automaticamente', async ({ page }) => {
    const input = page.locator('[data-testid="global-search-input"]')

    // Clica fora para perder o foco
    await page.locator('.egs-header-title h1').click()
    await expect(input).not.toBeFocused()

    // Pressiona Ctrl+K
    await page.keyboard.press('Control+k')
    await expect(input).toBeFocused()
  })

  test('Detecta automaticamente tipo CPF e exibe badge de classificação inteligente', async ({ page }) => {
    const input = page.locator('[data-testid="global-search-input"]')
    await input.fill('12345678901')

    const badge = page.locator('[data-testid="global-search-detected-type"]')
    await expect(badge).toBeVisible({ timeout: 5_000 })
    await expect(badge).toContainText('CPF')
  })

  test('Detecta automaticamente tipo Número do Pedido e exibe resultados agrupados', async ({ page }) => {
    const input = page.locator('[data-testid="global-search-input"]')
    await input.fill('154821')

    const badge = page.locator('[data-testid="global-search-detected-type"]')
    await expect(badge).toBeVisible({ timeout: 5_000 })
    await expect(badge).toContainText('Número do Pedido')

    // Valida card do pedido
    await expect(page.locator('[data-testid="card-order-154821"]')).toBeVisible({ timeout: 10_000 })
  })

  test('Detecta automaticamente tipo Código do Ingresso', async ({ page }) => {
    const input = page.locator('[data-testid="global-search-input"]')
    await input.fill('TK-928341')

    const badge = page.locator('[data-testid="global-search-detected-type"]')
    await expect(badge).toBeVisible({ timeout: 5_000 })
    await expect(badge).toContainText('Código do Ingresso')
  })

  test('Detecta tipo Incidente e lista em Incidentes Operacionais', async ({ page }) => {
    const input = page.locator('[data-testid="global-search-input"]')
    await input.fill('INC-109')

    const badge = page.locator('[data-testid="global-search-detected-type"]')
    await expect(badge).toBeVisible({ timeout: 5_000 })
    await expect(badge).toContainText('Incidente Operacional')

    await expect(page.locator('[data-testid="card-incident-INC-109"]')).toBeVisible({ timeout: 10_000 })
  })

  test('Proteção LGPD ativa: nenhum CPF sem máscara é exposto nos resultados', async ({ page }) => {
    const container = page.locator('[data-testid="global-search-container"]')
    const text = await container.innerText()

    // Garante que não há CPFs expostos sem máscara
    const rawCpfRegex = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/
    expect(rawCpfRegex.test(text)).toBeFalsy()
  })
})
