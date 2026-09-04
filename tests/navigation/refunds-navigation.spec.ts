import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.2 · Navegação Protegida: Estornos & Devoluções', () => {
  test('abre o módulo independente de Estornos, valida renderização canônica e integridade de retorno', async ({ page }) => {
    await login(page)

    // 1. Acesso direto pela URL canônica
    await page.goto('/app/finance-refunds')
    await expect(page.getByTestId('estornos-control-center')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Central de Estornos, Reembolsos & Chargebacks')).toBeVisible()
    await expect(page.getByTestId('refund-approval-table')).toBeVisible()

    // 2. Acesso via menu lateral protegido
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })

    const menuEstornos = page.getByTestId('nav-finance-refunds')
    await expect(menuEstornos).toBeVisible()
    await expect(menuEstornos).toHaveAttribute('data-protected-module', 'estornos')
    await menuEstornos.click()

    await expect(page).toHaveURL(/\/app\/finance-refunds/)
    await expect(page.getByTestId('estornos-control-center')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Central de Estornos, Reembolsos & Chargebacks')).toBeVisible()
  })
})
