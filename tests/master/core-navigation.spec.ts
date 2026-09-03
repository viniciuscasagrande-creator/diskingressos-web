import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

const routes = [
  ['/eventos', /Eventos/i],
  ['/app/finance-dashboard', /Financeiro/i],
  ['/app/finance-refunds', /Estornos|Reembolsos|Chargebacks/i],
  ['/app/marketing-dashboard', /Marketing/i],
  ['/app/sac-hub', /SAC|Atendimento/i],
] as const

test.describe('@master navegação core', () => {
  test.beforeEach(async ({ page }) => { await login(page) })

  for (const [path, visible] of routes) {
    test(`${path} responde sem tela em branco`, async ({ page }) => {
      await page.goto(path)
      await expect(page.locator('body')).not.toBeEmpty()
      await expect(page.getByText(visible).first()).toBeVisible({ timeout: 15_000 })
      await expect(page.locator('body')).not.toContainText(/Cannot GET|Application error|Internal Server Error/i)
    })
  }
})
