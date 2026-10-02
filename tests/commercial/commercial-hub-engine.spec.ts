import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Dashboard Comercial — Central de Trabalho da Equipe Comercial', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Dashboard Comercial: Pesquisa Global, Indicadores Operacionais Reais e Tabela de Situação Comercial', async ({ page }) => {
    // Navega para o Dashboard Comercial
    await page.goto('/app/comercial')
    await expect(page.locator('[data-testid="commercial-hub-page"]')).toBeVisible({ timeout: 15_000 })

    await expect(page.getByRole('heading', { name: 'Dashboard Comercial' })).toBeVisible()

    // Valida Pesquisa Comercial Global com o placeholder exato requerido
    const searchInput = page.locator('input[placeholder*="Pesquisar produtor, evento, ID do evento"]')
    await expect(searchInput).toBeVisible()

    // Valida os Indicadores Operacionais Reais da operação
    await expect(page.getByText('Eventos Ativos')).toBeVisible()
    await expect(page.getByText('Em Configuração')).toBeVisible()
    await expect(page.getByText('Publicados', { exact: true })).toBeVisible()
    await expect(page.getByText('Encerrados')).toBeVisible()
    await expect(page.getByText('Produtores Ativos')).toBeVisible()
    await expect(page.getByText('Vendas Atuais')).toBeVisible()
    await expect(page.getByText('Ingressos Vendidos')).toBeVisible()
    await expect(page.getByText('Taxas Disk')).toBeVisible()
    await expect(page.getByText('A Receber')).toBeVisible()
    await expect(page.getByText('Pendências', { exact: true })).toBeVisible()

    // Valida que o painel Comercial NÃO tem botão para cadastrar evento
    await expect(page.locator('[data-testid="commercial-hub-page"]').getByRole('button', { name: /Novo Evento/i })).not.toBeVisible()

    // Valida presença da seção "Eventos — Situação Comercial"
    await expect(page.getByText('Eventos — Situação Comercial')).toBeVisible()

    // Valida tabela e colunas operacionais
    const table = page.locator('table')
    await expect(table).toBeVisible()
    await expect(table.getByRole('columnheader', { name: /Evento/i })).toBeVisible()
    await expect(table.getByRole('columnheader', { name: /Produtora/i })).toBeVisible()
    await expect(table.getByRole('columnheader', { name: /Status/i })).toBeVisible()
    await expect(table.getByRole('columnheader', { name: /Vendas/i })).toBeVisible()
    await expect(table.getByRole('columnheader', { name: /Taxa Disk/i })).toBeVisible()
    await expect(table.getByRole('columnheader', { name: /Situação/i })).toBeVisible()
    await expect(table.getByRole('columnheader', { name: /Spread/i })).not.toBeVisible()
    await expect(table.getByRole('columnheader', { name: /Advanced/i })).not.toBeVisible()

    // Valida botão de autonomia comercial para definir ou ajustar taxa
    const btnTaxa = page.locator('button:has-text("Definir"), button:has-text("Ajustar")').first()
    await expect(btnTaxa).toBeVisible()
  })
})
