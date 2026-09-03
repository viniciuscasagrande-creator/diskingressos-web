import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Visual Golden Master — módulos críticos', () => {
  test.use({ viewport: { width: 1520, height: 818 } })

  test('@visual-lock Central de Eventos permanece idêntica à referência aprovada', async ({ page }) => {
    await login(page)
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible()
    await page.getByTestId('events-filter-active').click()
    await expect(page.getByTestId('event-grid')).toBeVisible()

    await expect(page.getByTestId('events-page')).toHaveScreenshot('central-eventos-approved.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
    })
  })

  test('@visual-contract Estornos continua módulo independente e funcional', async ({ page }) => {
    await login(page)
    await page.goto('/app/finance-refunds')
    await expect(page).toHaveURL(/finance-refunds/)
    await expect(page.getByText(/estornos|reembolsos|chargebacks/i).first()).toBeVisible()
  })
})
