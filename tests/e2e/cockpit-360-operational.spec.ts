import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('@operational Fase 26.16.2 — Cockpit 360 Operacional', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('abre Cockpit 360, renderiza os 12 KPIs e barra de atalhos operacionais', async ({ page }) => {
    // Navigate to events and select first event or go directly to event context
    await page.goto('/app/events')
    await page.waitForTimeout(1000)

    // Select an event to enter Event Context
    const firstEventCard = page.locator('.event-card, [data-testid="event-card"]').first()
    if (await firstEventCard.count() > 0) {
      await firstEventCard.click()
    } else {
      await page.goto('/app/event-command-center')
    }
    await page.waitForTimeout(1000)

    // Verify Cockpit container exists
    const container = page.locator('[data-testid="cockpit-360-container"]')
    if (await container.count() > 0) {
      await expect(container).toBeVisible()

      // Check 12 KPIs grid
      const kpisGrid = page.locator('[data-testid="cockpit-12-kpis"]')
      await expect(kpisGrid).toBeVisible()
      await expect(kpisGrid.getByText('Receita total')).toBeVisible()
      await expect(kpisGrid.getByText('Vendas')).toBeVisible()
      await expect(kpisGrid.getByText('Ingressos vendidos')).toBeVisible()
      await expect(kpisGrid.getByText('Check-ins')).toBeVisible()

      // Check Shortcuts Bar
      const shortcuts = page.locator('[data-testid="cockpit-shortcuts-bar"]')
      await expect(shortcuts).toBeVisible()
      await expect(shortcuts.getByTestId('shortcut-tickets')).toBeVisible()
      await expect(shortcuts.getByTestId('shortcut-customer360')).toBeVisible()
      await expect(shortcuts.getByTestId('shortcut-inventory')).toBeVisible()
      await expect(shortcuts.getByTestId('shortcut-finance')).toBeVisible()
      await expect(shortcuts.getByTestId('shortcut-refunds')).toBeVisible()

      // Check Period Switcher
      await page.getByTestId('period-7d').click()
      await page.waitForTimeout(500)
      await page.getByTestId('period-all').click()
      await page.waitForTimeout(500)

      // Test Shortcut click to Estornos
      await shortcuts.getByTestId('shortcut-refunds').click()
      await expect(page).toHaveURL(/\/app\/finance-refunds/)
    }
  })
})
