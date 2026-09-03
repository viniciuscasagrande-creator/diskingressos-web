import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('@critical Central de Eventos visual/funcional', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible()
  })

  test('mantém o contrato visual aprovado', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Eventos', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /Comparar/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Horizontal/i })).toBeVisible()
    for (const id of ['events-filter-active', 'events-filter-inactive', 'events-filter-all']) {
      await expect(page.getByTestId(id)).toBeVisible()
    }
    const card = page.getByTestId('event-card').first()
    await expect(card).toBeVisible()
    const metrics = card.getByTestId('event-metrics')
    for (const metric of ['Total (R$)', 'Vendas', 'Disponível', 'Cortesia', 'Ocupação']) {
      await expect(metrics).toContainText(metric)
    }
  })
})
