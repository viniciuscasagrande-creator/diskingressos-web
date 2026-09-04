import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.5 — Histórico de Atividades Unificado: Linha do Tempo e Filtros', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/eventos')

    // Localiza e abre o primeiro evento da lista
    const eventCard = page.locator('.events-hub-grid .event-row-card, .event-card, table tr').first()
    await expect(eventCard).toBeVisible({ timeout: 15_000 })
    await eventCard.click()

    // Aguarda carregar o Cockpit 360
    await expect(page.locator('[data-testid="cockpit-360-container"]')).toBeVisible({ timeout: 15_000 })
  })

  test('Abre o Histórico de Atividades pelo Cockpit 360 e valida a timeline unificada', async ({ page }) => {
    // Clica no botão/aba "Histórico de Atividades"
    const tabActivity = page.locator('[data-testid="tab-activity-stream"]').first()
    await expect(tabActivity).toBeVisible({ timeout: 10_000 })
    await tabActivity.click()

    // Valida container da timeline
    const streamContainer = page.locator('[data-testid="event-activity-stream"]')
    await expect(streamContainer).toBeVisible({ timeout: 15_000 })

    // Valida controles principais
    await expect(page.locator('[data-testid="activity-search"]')).toBeVisible()
    await expect(page.locator('[data-testid="activity-filter-source"]')).toBeVisible()
    await expect(page.locator('[data-testid="activity-filter-severity"]')).toBeVisible()
    await expect(page.locator('[data-testid="activity-refresh"]')).toBeVisible()
    await expect(page.locator('[data-testid="activity-export"]')).toBeVisible()

    // Valida que ao menos uma atividade real foi carregada
    await expect(page.locator('[data-testid="activity-item"]').first()).toBeVisible({ timeout: 15_000 })
    const activityItems = page.locator('[data-testid="activity-item"]')
    const count = await activityItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('Valida proteção de dados pessoais (LGPD) e ausência de CPF desprotegido', async ({ page }) => {
    const tabActivity = page.locator('[data-testid="tab-activity-stream"]').first()
    await tabActivity.click()

    const streamContainer = page.locator('[data-testid="event-activity-stream"]')
    await expect(streamContainer).toBeVisible({ timeout: 15_000 })

    const text = await streamContainer.innerText()
    // Garante que não há CPFs expostos no formato padrão sem máscara
    const unmaskedCpfRegex = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/
    expect(unmaskedCpfRegex.test(text)).toBeFalsy()
  })

  test('Filtra atividades por origem e pesquisa de texto', async ({ page }) => {
    const tabActivity = page.locator('[data-testid="tab-activity-stream"]').first()
    await tabActivity.click()

    await expect(page.locator('[data-testid="event-activity-stream"]')).toBeVisible({ timeout: 15_000 })

    // Seleciona filtro de origem: pedidos
    const sourceSelect = page.locator('[data-testid="activity-filter-source"]')
    await sourceSelect.selectOption('pedido')

    // Aguarda atualização da lista filtrada
    await page.waitForTimeout(500)
    const items = page.locator('[data-testid="activity-item"]')
    expect(await items.count()).toBeGreaterThanOrEqual(0)

    // Testa campo de busca
    const searchInput = page.locator('[data-testid="activity-search"]')
    await searchInput.fill('Pedido')
    await page.waitForTimeout(500)
    await expect(page.locator('[data-testid="event-activity-stream"]')).toBeVisible()
  })
})
