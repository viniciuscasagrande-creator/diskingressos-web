import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.5 — Histórico de Atividades Unificado: Drill-Downs Operacionais', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/eventos')

    const eventCard = page.locator('.events-hub-grid .event-row-card, .event-card, table tr').first()
    await expect(eventCard).toBeVisible({ timeout: 15_000 })
    await eventCard.click()

    await expect(page.locator('[data-testid="cockpit-360-container"]')).toBeVisible({ timeout: 15_000 })
  })

  test('Jornada 1: Cockpit 360 -> Histórico de Atividades -> Drill-down na entidade -> Preserva contexto', async ({ page }) => {
    const tabActivity = page.locator('[data-testid="tab-activity-stream"]').first()
    await expect(tabActivity).toBeVisible({ timeout: 10_000 })
    await tabActivity.click()

    const streamContainer = page.locator('[data-testid="event-activity-stream"]')
    await expect(streamContainer).toBeVisible({ timeout: 15_000 })

    // Filtra incidentes e aguarda a resposta do backend
    const sourceSelect = page.locator('[data-testid="activity-filter-source"]')
    await Promise.all([
      page.waitForResponse(res => res.url().includes('activity-stream') && res.status() === 200),
      sourceSelect.selectOption('incidente')
    ])

    await expect(page.locator('.activity-origin-pill.origem-incidente').first()).toBeVisible({ timeout: 15_000 })
    const incidentItem = page.locator('[data-testid="activity-item"]', { has: page.locator('.origem-incidente') }).first()
    const openBtn = incidentItem.locator('[data-testid="activity-open-entity"]')
    await expect(openBtn).toBeVisible()
    await openBtn.click()

    // Valida que abriu a Central de Incidentes
    await expect(page.locator('[data-testid="incident-center-operational"]')).toBeVisible({ timeout: 15_000 })
  })

  test('Jornada 2 Protegida: Histórico de Atividades -> Estorno -> Abre Centro de Controle de Estornos Canônico', async ({ page }) => {
    const tabActivity = page.locator('[data-testid="tab-activity-stream"]').first()
    await expect(tabActivity).toBeVisible({ timeout: 10_000 })
    await tabActivity.click()

    await expect(page.locator('[data-testid="event-activity-stream"]')).toBeVisible({ timeout: 15_000 })

    // Filtra estornos e aguarda resposta
    const sourceSelect = page.locator('[data-testid="activity-filter-source"]')
    await Promise.all([
      page.waitForResponse(res => res.url().includes('activity-stream') && res.status() === 200),
      sourceSelect.selectOption('estorno')
    ])

    await expect(page.locator('.activity-origin-pill.origem-estorno').first()).toBeVisible({ timeout: 15_000 })
    const estornoItem = page.locator('[data-testid="activity-item"]').first()
    const openEstornosBtn = estornoItem.locator('[data-testid="activity-open-entity"]')
    await expect(openEstornosBtn).toBeVisible()
    await openEstornosBtn.click()

    // Valida que a tela oficial de Estornos foi renderizada
    await expect(page.locator('[data-testid="estornos-control-center"]')).toBeVisible({ timeout: 15_000 })
  })
})
