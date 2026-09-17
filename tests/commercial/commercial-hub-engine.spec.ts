import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Motor Comercial por Evento — Hub & Condições Imutáveis', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Comercial Hub: deve exibir KPIs, princípios operacionais e listagem de eventos com taxas', async ({ page }) => {
    // Navega para o Hub Comercial
    await page.goto('/app/comercial')
    await expect(page.locator('[data-testid="commercial-hub-page"]')).toBeVisible({ timeout: 15_000 })

    // Valida Header e Título
    await expect(page.locator('h1')).toContainText('Gestão Comercial de Eventos')
    await expect(page.getByText('Motor Comercial por Evento')).toBeVisible()
    await expect(page.getByText('Snapshot Imutável')).toBeVisible()

    // Valida KPIs
    await expect(page.getByText('Eventos Monitorados')).toBeVisible()
    await expect(page.getByText('Acordos Ativos')).toBeVisible()
    await expect(page.getByText('Com Advanced')).toBeVisible()
    await expect(page.getByText('Com Spread')).toBeVisible()

    // Valida Princípios do Motor Comercial
    await expect(page.getByText('1. Negociação por Evento')).toBeVisible()
    await expect(page.getByText('2. Snapshot Imutável de Venda')).toBeVisible()
    await expect(page.getByText('3. Antecipação Segura (Advanced)')).toBeVisible()

    // Valida presença da tabela de acordos comerciais
    const table = page.locator('table')
    await expect(table).toBeVisible()
    await expect(page.getByText('Evento & Código')).toBeVisible()
    await expect(page.getByText('Taxa de Serviço Disk')).toBeVisible()
    await expect(page.getByText('Spread')).toBeVisible()
    await expect(page.getByText('Advanced (Antecipação)')).toBeVisible()
  })
})
