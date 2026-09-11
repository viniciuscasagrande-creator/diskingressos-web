import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 28.14.1 — Consolidação da Arquitetura de Pixels e Conversões', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('1. Submenu no Marketing deve exibir "Pixels e Conversões" e abrir a Central Oficial', async ({ page }) => {
    await page.goto('/app/marketing-dashboard')

    const sidebar = page.locator('aside')
    const trackingBtn = sidebar.locator('button', { hasText: 'Pixels e Conversões' })
    await expect(trackingBtn).toBeVisible({ timeout: 15_000 })
    await trackingBtn.click()

    // Verifica que carregou a tela oficial de Pixels e Conversões
    await expect(page.locator('h2:has-text("Pixels e Conversões")').first()).toBeVisible({ timeout: 10_000 })

    // Verifica o painel do Motor Universal de Conversões
    await expect(page.locator('.conversion-engine-panel').first()).toBeVisible()
  })

  test('2. Modal de Nova Integração deve ter como padrão eventos selecionados e exibir governança para escopo global', async ({ page }) => {
    await page.goto('/app/marketing-dashboard')

    const sidebar = page.locator('aside')
    const trackingBtn = sidebar.locator('button', { hasText: 'Pixels e Conversões' })
    await expect(trackingBtn).toBeVisible({ timeout: 15_000 })
    await trackingBtn.click()

    // Clica em Nova Integração
    const newBtn = page.locator('button:has-text("Nova integração")').first()
    await expect(newBtn).toBeVisible({ timeout: 10_000 })
    await newBtn.click()

    // Modal de criação aberto
    const modal = page.locator('.integration-editor')
    await expect(modal).toBeVisible()

    // Verifica que "Eventos selecionados" é o padrão (applyToAllEvents = false)
    const radios = modal.locator('.integration-scope input[type="radio"]')
    await expect(radios.nth(1)).toBeChecked()

    // Clica em "Todos os eventos da produtora"
    await radios.nth(0).click()

    // Valida que o aviso de governança e checkbox de confirmação são exibidos
    await expect(modal.locator('text=Atenção à governança de audiências')).toBeVisible()
    const confirmCheckbox = modal.locator('input[type="checkbox"]:near(:text("confirmo a aplicação global"))').first()
    await expect(confirmCheckbox).toBeVisible()
  })
})
