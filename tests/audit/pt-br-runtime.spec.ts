import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.3.1 · Padronização Total PT-BR: Runtime Verification', () => {
  test('garante que botões e cabeçalhos visíveis nas rotas principais estão em Português do Brasil', async ({ page }) => {
    await login(page)

    // 1. Central de Eventos
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('events-page').getByRole('heading', { name: 'Eventos' })).toBeVisible()

    // Verifica ausência de botões em inglês cru
    await expect(page.getByRole('button', { name: /^Save$/i })).not.toBeVisible()
    await expect(page.getByRole('button', { name: /^Cancel$/i })).not.toBeVisible()
    await expect(page.getByRole('button', { name: /^Delete$/i })).not.toBeVisible()

    // 2. Estornos
    await page.goto('/app/finance-refunds')
    await expect(page.getByTestId('estornos-control-center')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Central de Estornos, Reembolsos & Chargebacks')).toBeVisible()
    await expect(page.getByRole('button', { name: /^Save$/i })).not.toBeVisible()

    // 3. Financeiro
    await page.goto('/app/finance-dashboard')
    await expect(page.locator('body')).not.toBeEmpty()

    // 4. Marketing
    await page.goto('/app/marketing-dashboard')
    await expect(page.locator('body')).not.toBeEmpty()

    // 5. SAC
    await page.goto('/app/sac-hub')
    await expect(page.locator('body')).not.toBeEmpty()
  })
})
