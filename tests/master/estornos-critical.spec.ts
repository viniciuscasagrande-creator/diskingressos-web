import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('@critical @estornos módulo permanente', () => {
  test.beforeEach(async ({ page }) => { await login(page) })

  test('Estornos existe como item independente e não some do menu', async ({ page }) => {
    const nav = page.getByTestId('nav-finance-refunds')
    await expect(nav).toBeVisible({ timeout: 10_000 })
    await expect(nav).toHaveAttribute('data-protected-module', 'estornos')
    await expect(nav).toContainText(/Estornos/i)
  })

  test('rota oficial de Estornos carrega e não redireciona para Financeiro', async ({ page }) => {
    await page.goto('/app/finance-refunds')
    await expect(page).toHaveURL(/\/app\/finance-refunds(?:$|[?#])/)
    await expect(page.getByText(/Central de Estornos|Estornos|Reembolsos|Chargebacks/i).first()).toBeVisible({ timeout: 15_000 })
    await expect(page).not.toHaveURL(/finance-dashboard/)
  })

  test('menu Estornos continua funcional após navegar por outro módulo', async ({ page }) => {
    await page.goto('/app/marketing-dashboard')
    await expect(page.getByText(/Marketing/i).first()).toBeVisible({ timeout: 15_000 })
    const nav = page.getByTestId('nav-finance-refunds')
    await expect(nav).toBeVisible()
    await nav.click()
    await expect(page).toHaveURL(/\/app\/finance-refunds/)
    await expect(page.getByText(/Estornos|Reembolsos|Chargebacks/i).first()).toBeVisible()
  })
})
