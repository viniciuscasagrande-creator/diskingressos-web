import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.1 · Auditoria Automática: Runtime Routes', () => {
  test('navega pelas rotas principais sem crash, chunk load error ou tela branca', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', err => pageErrors.push(err.message))

    await login(page)

    // 1. Central de Eventos
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })
    expect(pageErrors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)

    // 2. Dashboard Financeiro
    await page.goto('/app/finance-dashboard')
    await expect(page.locator('body')).not.toBeEmpty()
    expect(pageErrors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)

    // 3. Estornos
    await page.goto('/app/finance-refunds')
    await expect(page.getByTestId('estornos-control-center')).toBeVisible({ timeout: 15_000 })
    expect(pageErrors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)

    // 4. Marketing
    await page.goto('/app/marketing-dashboard')
    await expect(page.locator('body')).not.toBeEmpty()

    // 5. SAC
    await page.goto('/app/sac-hub')
    await expect(page.locator('body')).not.toBeEmpty()
  })
})
