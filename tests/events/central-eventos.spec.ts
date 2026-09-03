import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.beforeEach(async ({ page }) => {
  await login(page)
  await page.goto('/eventos')
  await expect(page.getByTestId('events-page')).toBeVisible()
})

test('@smoke Central de Eventos mantém controles oficiais', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Eventos', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /Comparar/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Horizontal/ })).toBeVisible()
  await expect(page.getByTestId('events-filter-active')).toBeVisible()
  await expect(page.getByTestId('events-filter-inactive')).toBeVisible()
  await expect(page.getByTestId('events-filter-all')).toBeVisible()
})

test('cards exibem os cinco indicadores aprovados', async ({ page }) => {
  const cards = page.getByTestId('event-card')
  await expect(cards.first()).toBeVisible()
  const first = cards.first()
  for (const label of ['Total (R$)', 'Vendas', 'Disponível', 'Cortesia', 'Ocupação']) {
    await expect(first.getByTestId('event-metrics')).toContainText(label)
  }
  await expect(first.getByTestId('event-code')).not.toBeEmpty()
})

test('Ativos, Inativos e Todos funcionam sem quebrar a grade', async ({ page }) => {
  for (const id of ['events-filter-active', 'events-filter-inactive', 'events-filter-all']) {
    await page.getByTestId(id).click()
    await expect(page.getByTestId('event-grid')).toBeVisible()
  }
})

test('abrir evento leva ao Event Cockpit 360', async ({ page }) => {
  const first = page.getByTestId('event-card').first()
  const code = await first.getAttribute('data-event-code')
  await first.click()
  await expect(page).toHaveURL(new RegExp(`/eventos/${code}/command-center`))
  await expect(page.getByText(/Event Cockpit 360|Centro de Comando/i).first()).toBeVisible()
})
