import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('@master @inventory-operational Fase 26.16.3', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/eventos')
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })
    const firstCard = page.getByTestId('event-card').first()
    await expect(firstCard).toBeVisible()
    await firstCard.click()
    const inventoryNav = page.getByText('Inventário', { exact: true }).first()
    await expect(inventoryNav).toBeVisible({ timeout: 15_000 })
    await inventoryNav.click()
    await expect(page.getByTestId('event-inventory-operational')).toBeVisible({ timeout: 15_000 })
  })

  test('inventário apresenta controles operacionais e dados do evento', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Inventário Operacional/i })).toBeVisible()
    await expect(page.getByTestId('inventory-refresh')).toBeVisible()
    await expect(page.getByTestId('inventory-new-lot')).toBeVisible()
    await expect(page.getByTestId('inventory-new-hold')).toBeVisible()
    await expect(page.getByText(/producerId \+ eventId protegidos/i)).toBeVisible()
    await expect(page.getByText(/Capacidade/i).first()).toBeVisible()
    await expect(page.getByText(/Disponível/i).first()).toBeVisible()
  })

  test('novo lote abre formulário funcional sem alterar estoque', async ({ page }) => {
    await page.getByTestId('inventory-new-lot').click()
    const modal = page.getByTestId('inventory-lot-modal')
    await expect(modal).toBeVisible()
    await expect(modal.getByText(/Nome do lote/i)).toBeVisible()
    await expect(modal.getByText(/Capacidade/i)).toBeVisible()
    await expect(modal.getByText(/Preço/i)).toBeVisible()
    await expect(page.getByTestId('inventory-save-lot')).toBeEnabled()
    await modal.getByRole('button', { name: '×' }).click()
    await expect(modal).toBeHidden()
  })

  test('hold abre fluxo operacional quando existe lote disponível', async ({ page }) => {
    const btn = page.getByTestId('inventory-new-hold')
    if (await btn.isEnabled()) {
      await btn.click()
      await expect(page.getByTestId('inventory-hold-modal')).toBeVisible()
      await expect(page.getByText(/Quantidade/i).last()).toBeVisible()
      await expect(page.getByText(/Duração/i).last()).toBeVisible()
    }
  })

  test('filtro de lotes funciona na tela', async ({ page }) => {
    const search = page.getByRole('textbox', { name: 'Buscar lote' })
    await search.fill('__lote_que_nao_existe__')
    await expect(page.getByText(/Nenhum lote encontrado/i)).toBeVisible()
    await search.fill('')
  })
})
