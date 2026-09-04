import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.2 · Event OS Navigation Flow', () => {
  test('valida o ciclo de navegação sequencial entre módulos do Event OS sem perda de contexto nem tela branca', async ({ page }) => {
    await login(page)
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })

    const firstCard = page.getByTestId('event-card').first()
    await expect(firstCard).toBeVisible()
    await firstCard.click()

    // 1. Cockpit 360
    await expect(page.getByTestId('cockpit-360-container')).toBeVisible({ timeout: 15_000 })

    // 2. Inventário
    await page.getByText('Inventário', { exact: true }).first().click()
    await expect(page.getByTestId('event-inventory-operational')).toBeVisible({ timeout: 10_000 })

    // 3. Customer 360
    await page.getByText('Customer 360', { exact: true }).first().click()
    await expect(page.getByTestId('customer360-operational')).toBeVisible({ timeout: 10_000 })

    // 4. Live Operations
    await page.getByText('Live Operations', { exact: true }).first().click()
    await expect(page.getByTestId('live-operations-operational')).toBeVisible({ timeout: 10_000 })

    // 5. Incident Center
    await page.getByText('Incident Center', { exact: true }).first().click()
    await expect(page.getByTestId('incident-center-operational')).toBeVisible({ timeout: 10_000 })

    // 6. Day Command
    await page.getByText('Event Day Command', { exact: true }).first().click()
    await expect(page.getByTestId('event-day-command-operational')).toBeVisible({ timeout: 10_000 })

    // 7. Executive Dashboard
    await page.getByText('Executive Dashboard', { exact: true }).first().click()
    await expect(page.getByTestId('executive-dashboard-container')).toBeVisible({ timeout: 10_000 })
  })
})
