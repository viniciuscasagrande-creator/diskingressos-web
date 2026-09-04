import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.2 · Context Preservation Across Navigation', () => {
  test('assegura que atalhos e drill-downs preservam o contexto operacional do evento', async ({ page }) => {
    await login(page)
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })

    const firstCard = page.getByTestId('event-card').first()
    await expect(firstCard).toBeVisible()
    await firstCard.click()

    // 1. Acessa Cockpit
    await expect(page.getByTestId('cockpit-360-container')).toBeVisible({ timeout: 15_000 })

    // 2. Atalho de Customer 360 do Cockpit
    const btnCustomerShortcut = page.getByTestId('shortcut-customer360')
    await expect(btnCustomerShortcut).toBeVisible()
    await btnCustomerShortcut.click()
    await expect(page.getByTestId('customer360-operational')).toBeVisible({ timeout: 10_000 })

    // 3. Atalho de Inventário do Customer 360 / Sidebar
    await page.getByText('Inventário', { exact: true }).first().click()
    await expect(page.getByTestId('event-inventory-operational')).toBeVisible({ timeout: 10_000 })
  })
})
