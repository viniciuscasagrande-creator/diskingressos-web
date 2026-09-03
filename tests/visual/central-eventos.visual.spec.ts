import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.use({ viewport: { width: 1520, height: 818 } })

test('Central de Eventos — regressão visual aprovada', async ({ page }) => {
  await login(page)
  await page.goto('/eventos')
  await expect(page.getByTestId('events-page')).toBeVisible()
  await page.getByTestId('events-filter-active').click()
  await expect(page.getByTestId('event-grid')).toBeVisible()
  await expect(page.getByTestId('events-page')).toHaveScreenshot('central-eventos.png', {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.01,
  })
})
