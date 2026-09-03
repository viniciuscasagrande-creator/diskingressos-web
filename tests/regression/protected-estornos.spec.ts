import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test('@protected Estornos permanece módulo independente e abre a Central Enterprise', async ({ page }) => {
  await login(page)
  const estornos = page.getByTestId('nav-finance-refunds')
  await expect(estornos).toBeVisible()
  await expect(estornos).toHaveAttribute('data-protected-module', 'estornos')
  await estornos.click()
  await expect(page).toHaveURL(/\/app\/finance-refunds(?:$|[?#])/)
  await expect(page.getByRole('heading', { name: /Central de Estornos, Reembolsos & Chargebacks/i })).toBeVisible()
})

test('@protected rota direta de Estornos não pode desaparecer', async ({ page }) => {
  await login(page)
  await page.goto('/app/finance-refunds')
  await expect(page.getByText(/Centro de Controle de Estornos|Central de Estornos/i).first()).toBeVisible()
})

test('Estornos mantém Centro de Controle oficial', async ({ page }) => {
  await login(page)
  await page.goto('/app/finance-refunds')

  await expect(page).toHaveURL(/\/app\/finance-refunds/)
  await expect(page.getByTestId('estornos-control-center')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Centro de Controle de Estornos' })).toBeVisible()

  await expect(page.getByText('Estornos executados')).toBeVisible()
  await expect(page.getByText('Montante estornado')).toBeVisible()
  await expect(page.getByText('Solicitações pendentes')).toBeVisible()
  await expect(page.getByText('Taxas retidas')).toBeVisible()
  await expect(page.getByText('Preservado em voucher')).toBeVisible()
  await expect(page.getByText('SLA médio')).toBeVisible()

  await expect(page.getByTestId('refund-approval-table')).toBeVisible()
  await expect(page.getByText('Conciliação & Risco Operacional')).toBeVisible()
})
