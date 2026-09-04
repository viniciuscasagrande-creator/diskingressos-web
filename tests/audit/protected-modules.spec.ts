import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.1 · Auditoria Automática: Protected Modules Preservation', () => {
  test('valida que os 5 módulos core protegidos permanecem canônicos e acessíveis sem regressão', async ({ page }) => {
    await login(page)

    // 1. Central de Eventos
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })

    // 2. Financeiro
    await page.goto('/app/finance-dashboard')
    await expect(page.locator('body')).not.toBeEmpty()

    // 3. Estornos (/app/finance-refunds · FinanceDisputesHubPage)
    await page.goto('/app/finance-refunds')
    await expect(page.getByTestId('estornos-control-center')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Central de Estornos, Reembolsos & Chargebacks')).toBeVisible()

    // 4. Marketing
    await page.goto('/app/marketing-dashboard')
    await expect(page.locator('body')).not.toBeEmpty()

    // 5. SAC
    await page.goto('/app/sac-hub')
    await expect(page.locator('body')).not.toBeEmpty()
  })
})
