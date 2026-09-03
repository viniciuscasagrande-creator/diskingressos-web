import { expect, type Page } from '@playwright/test'

export const qaUsers = {
  producerA: {
    email: process.env.E2E_PRODUCER_A_EMAIL || 'vinicius@diskingressos.com.br',
    password: process.env.E2E_PRODUCER_A_PASSWORD || 'Produtor@123',
    producerId: Number(process.env.E2E_PRODUCER_A_ID || 1),
  },
  producerB: {
    email: process.env.E2E_PRODUCER_B_EMAIL || 'financeiro@fep.com.br',
    password: process.env.E2E_PRODUCER_B_PASSWORD || 'Financeiro@123',
    producerId: Number(process.env.E2E_PRODUCER_B_ID || 2),
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'admin@diskingressos.com.br',
    password: process.env.E2E_ADMIN_PASSWORD || 'Admin@123',
  },
}

export async function login(page: Page, email = qaUsers.producerA.email, password = qaUsers.producerA.password) {
  await page.goto('/login')
  const emailInput = page.locator('input[type="email"]')
  const passwordInput = page.locator('input[type="password"]')
  await expect(emailInput).toBeVisible()
  await emailInput.fill(email)
  await passwordInput.fill(password)
  await page.getByRole('button', { name: 'Entrar no sistema' }).click()
  await expect(page.locator('.login-page')).toHaveCount(0, { timeout: 15_000 })
}
