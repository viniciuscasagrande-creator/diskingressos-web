import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.beforeEach(async ({ page }) => {
  await login(page)
  await page.goto('/eventos')
  await expect(page.getByTestId('events-page')).toBeVisible()
})

test('Fase 26.17.7.1 abre painel comercial moderno PT-BR', async ({ page }) => {
  await page.getByTestId('event-card').first().click()
  const panel=page.getByTestId('event-commercial-dashboard')
  await expect(panel).toBeVisible()
  for(const text of ['Receita Total','Ingressos Vendidos','Disponíveis','Cortesias','Ocupação','Evolução de Vendas','Ritmo de Vendas','Vendas por Forma de Pagamento','Vendas por Tipo de Ingresso','Últimas Transações']){
    await expect(panel.getByText(text,{exact:false}).first()).toBeVisible()
  }
})

test('Painel Comercial mantém ponte explícita para Event OS', async ({ page }) => {
  await page.getByTestId('event-card').first().click()
  await page.getByRole('button',{name:/Acessar Event OS/i}).click()
  await expect(page).toHaveURL(/command-center/)
})
