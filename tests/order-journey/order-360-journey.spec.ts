import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 26.17.7 — Jornada Operacional 360° do Pedido, Cliente e Ingresso', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/eventos')

    // Abre o primeiro evento
    const eventCard = page.locator('.events-hub-grid .event-row-card, .event-card, table tr').first()
    await expect(eventCard).toBeVisible({ timeout: 15_000 })
    await eventCard.click()

    await expect(page.locator('[data-testid="cockpit-360-container"]')).toBeVisible({ timeout: 15_000 })

    // Abre a Pesquisa Global
    const searchNav = page.locator('.event-context-sidebar button, .event-context-sidebar a').filter({ hasText: 'Busca Global' }).first()
    if (await searchNav.isVisible()) {
      await searchNav.click()
    } else {
      await page.goto(page.url().replace(/\/command-center.*$/, '/global-search'))
    }

    await expect(page.locator('[data-testid="global-search-container"]')).toBeVisible({ timeout: 15_000 })
  })

  test('Jornada Completa: Busca -> [Ver Pedido] -> Central 360 -> Inspeciona Acessos e Recusa -> Voltar sem sair do contexto', async ({ page }) => {
    // 1. Digita pedido na busca global
    const input = page.locator('[data-testid="global-search-input"]')
    await input.fill('154821')

    const orderCard = page.locator('[data-testid="card-order-154821"]')
    await expect(orderCard).toBeVisible({ timeout: 10_000 })

    // 2. Clica em "Ver Pedido"
    const btnViewOrder = orderCard.locator('[data-testid="action-order-view-154821"]')
    await expect(btnViewOrder).toBeVisible()
    await btnViewOrder.click()

    // 3. Valida carregamento da Central de Investigação Operacional 360°
    const hub = page.locator('[data-testid="order-360-investigation-hub"]')
    await expect(hub).toBeVisible({ timeout: 15_000 })

    // 4. Valida Breadcrumbs e Barra de Contexto
    const breadcrumbs = page.locator('.order-360-breadcrumbs')
    await expect(breadcrumbs).toBeVisible()
    await expect(breadcrumbs).toContainText('154821')
    await expect(breadcrumbs).toContainText('João da Silva')

    // 5. Valida Master Card do Pedido
    const overview = page.locator('[data-testid="order-360-overview"]')
    await expect(overview).toBeVisible()
    await expect(overview).toContainText('R$ 480,00')
    await expect(overview).toContainText('Aprovado / Pago')
    await expect(overview).toContainText('PIX')

    // 6. Valida os 7 Cards Correlacionados
    await expect(page.locator('[data-testid="card-correlated-customer"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-correlated-tickets"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-correlated-checkins"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-correlated-financial"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-correlated-sac"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-correlated-refunds"]')).toBeVisible()
    await expect(page.locator('[data-testid="card-correlated-timeline"]')).toBeVisible()

    // 7. Valida Investigação de Recusa no Check-in
    const refusalBox = page.locator('[data-testid="checkin-refusal-details"]')
    await expect(refusalBox).toBeVisible()
    await expect(refusalBox).toContainText('Motivo da recusa')

    // Valida 4 Ações Rápidas de Investigação
    await expect(page.locator('[data-testid="btn-checkin-investigate-ticket"]')).toBeVisible()
    await expect(page.locator('[data-testid="btn-checkin-customer-360"]')).toBeVisible()
    await expect(page.locator('[data-testid="btn-checkin-create-incident"]')).toBeVisible()
    await expect(page.locator('[data-testid="btn-checkin-open-sac"]')).toBeVisible()

    // 8. Valida Ação "Investigar Ingresso" abrindo modal de detalhes
    await page.locator('[data-testid="btn-checkin-investigate-ticket"]').click()
    const ticketModal = page.locator('.modal-backdrop')
    await expect(ticketModal).toBeVisible({ timeout: 5_000 })
    await expect(ticketModal).toContainText('TK-928341')

    // Fecha modal
    await ticketModal.locator('button').filter({ hasText: 'Fechar' }).click()
    await expect(ticketModal).not.toBeVisible()

    // 9. Valida "Voltar ao pedido" restaurando a busca sem deslogar ou chutar para /app
    const btnReturn = page.locator('[data-testid="btn-order-return"]').first()
    await expect(btnReturn).toBeVisible()
    await btnReturn.click()

    // Confirma que voltou para a Pesquisa Global preservando o termo
    await expect(page.locator('[data-testid="global-search-container"]')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('[data-testid="global-search-input"]')).toHaveValue('154821')
  })

  test('Drill-down direto para Estornos a partir do Pedido mantém tela oficial e independente', async ({ page }) => {
    const input = page.locator('[data-testid="global-search-input"]')
    await input.fill('154821')

    const orderCard = page.locator('[data-testid="card-order-154821"]')
    await expect(orderCard).toBeVisible({ timeout: 10_000 })

    await orderCard.locator('[data-testid="action-order-view-154821"]').click()
    await expect(page.locator('[data-testid="order-360-investigation-hub"]')).toBeVisible({ timeout: 15_000 })

    // Clica no botão "Centro de Controle de Estornos"
    const btnRefunds = page.locator('[data-testid="order-action-refunds"]')
    await expect(btnRefunds).toBeVisible()
    await btnRefunds.click()

    // Valida que foi para /app/finance-refunds e carregou a tela oficial
    await expect(page).toHaveURL(/.*finance-refunds/)
    await expect(page.locator('[data-testid="estornos-control-center"]')).toBeVisible({ timeout: 15_000 })
  })
})
