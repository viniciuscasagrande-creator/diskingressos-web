import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test('@protected Estornos permanece módulo independente e abre a Central Enterprise', async ({ page }) => {
  await login(page)
  const estornos = page.getByTestId('nav-finance-refunds').or(page.getByRole('button', { name: /estornos/i })).first()
  await expect(estornos).toBeVisible()
  await estornos.click()
  await expect(page).toHaveURL(/\/app\/finance-refunds(?:$|[?#])/)
  await expect(page.getByRole('heading', { name: /Central de Estornos, Reembolsos & Chargebacks/i })).toBeVisible()
})

test('@protected rota direta de Estornos não pode desaparecer', async ({ page }) => {
  await login(page)
  await page.goto('/app/finance-refunds')
  await expect(page.getByText(/Central de Estornos/i).first()).toBeVisible()
})
