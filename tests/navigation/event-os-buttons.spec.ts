import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.2 · Button Contract Execution', () => {
  test('valida o disparo de ações interativas reais: refresh, abas, filtros e exportações', async ({ page }) => {
    await login(page)
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })

    const firstCard = page.getByTestId('event-card').first()
    await expect(firstCard).toBeVisible()
    await firstCard.click()

    // 1. Cockpit 360: testar refresh e atalhos operacionais
    await expect(page.getByTestId('cockpit-360-container')).toBeVisible({ timeout: 15_000 })
    const refreshBtn = page.getByTestId('cockpit-refresh-btn')
    await expect(refreshBtn).toBeVisible()
    await refreshBtn.click()

    // 2. Navegar para Executive Dashboard
    await page.getByText('Executive Dashboard', { exact: true }).first().click()
    await expect(page.getByTestId('executive-dashboard-container')).toBeVisible({ timeout: 10_000 })

    // 3. Testar alternância de período
    const btnToday = page.getByTestId('period-btn-today')
    await expect(btnToday).toBeVisible()
    await btnToday.click()

    // 4. Testar exportação PDF e Excel
    await page.getByTestId('btn-export-pdf').click()
    await page.getByTestId('btn-export-excel').click()

    // 5. Testar modal de comparativo
    await page.getByTestId('btn-open-comparison').click()
    await expect(page.getByTestId('comparison-modal')).toBeVisible()
    await page.getByTestId('btn-close-comparison').click()
    await expect(page.getByTestId('comparison-modal')).not.toBeVisible()
  })
})
