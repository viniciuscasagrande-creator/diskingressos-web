import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

const protectedModules = [
  { id: 'eventos', testId: 'nav-events', url: /\/app\/(?:events|eventos)(?:$|[?#])/i },
  { id: 'financeiro', testId: 'nav-finance-dashboard', url: /\/app\/finance-dashboard(?:$|[?#])/i },
  { id: 'estornos', testId: 'nav-finance-refunds', url: /\/app\/finance-refunds(?:$|[?#])/i },
  { id: 'marketing', testId: 'nav-marketing-dashboard', url: /\/app\/marketing-dashboard(?:$|[?#])/i },
  { id: 'sac', testId: 'nav-sac-hub', url: /\/app\/sac-hub(?:$|[?#])/i },
]

test.describe('@critical @runtime-functional módulos essenciais funcionando', () => {
  test.beforeEach(async ({ page }) => { await login(page) })

  test('sidebar mantém os cinco módulos protegidos clicáveis', async ({ page }) => {
    for (const mod of protectedModules) {
      const nav = page.getByTestId(mod.testId)
      await expect(nav, `${mod.id} deve continuar visível`).toBeVisible({ timeout: 10_000 })
      await expect(nav).toBeEnabled()
    }
  })

  test('Estornos abre na rota independente sem erro fatal', async ({ page }) => {
    const runtimeErrors: string[] = []
    page.on('pageerror', e => runtimeErrors.push(e.message))
    await page.goto('/app/finance-refunds')
    await expect(page).toHaveURL(/\/app\/finance-refunds(?:$|[?#])/)
    await expect(page.getByText(/Estornos|Reembolsos|Chargebacks/i).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('body')).not.toContainText(/Cannot read properties|Application error|Unhandled Runtime Error/i)
    expect(runtimeErrors, runtimeErrors.join('\n')).toEqual([])
  })

  test('navegação protegida não perde Estornos após trocar de módulo', async ({ page }) => {
    await page.goto('/app/marketing-dashboard')
    const estornos = page.getByTestId('nav-finance-refunds')
    await expect(estornos).toBeVisible({ timeout: 10_000 })
    await estornos.click()
    await expect(page).toHaveURL(/\/app\/finance-refunds/)
    await expect(page.getByTestId('nav-finance-refunds')).toHaveAttribute('data-protected-module', 'estornos')
  })
})
