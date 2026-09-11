import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 28.13 — Monitoramento Real de Ativação e Entrega das Campanhas (Meta, Google, TikTok, Spotify)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Deve exibir o painel de monitoramento real no Dashboard de Marketing com os 4 canais', async ({ page }) => {
    await page.goto('/app/marketing-dashboard')

    // 1. Verifica presença do painel
    const panel = page.locator('[data-testid="campaign-delivery-monitoring-panel"]')
    await expect(panel).toBeVisible({ timeout: 15000 })

    // 2. Título e subtítulo
    await expect(panel).toContainText('Monitoramento de Ativação & Entrega Real das Campanhas')
    await expect(panel).toContainText('FASE 28.13 • CONFIRMAÇÃO REAL DE STATUS')

    // 3. Banner de Atenção Operacional quando houver campanhas sem entrega ou reprovadas
    const banner = page.locator('[data-testid="delivery-attention-banner"]')
    await expect(banner).toBeVisible()
    await expect(banner).toContainText('Atenção Operacional')

    // 4. Verifica presença dos 4 canais obrigatórios (Meta Ads, Google Ads, TikTok Ads, Spotify Ads)
    await expect(panel).toContainText('Meta Ads')
    await expect(panel).toContainText('Google Ads')
    await expect(panel).toContainText('TikTok Ads')
    await expect(panel).toContainText('Spotify Ads')

    // 5. Verifica os status de entrega específicos
    // Meta Ads -> Entregando
    const metaRow = page.locator('[data-testid="campaign-delivery-row-MON-META-001"]')
    await expect(metaRow).toBeVisible()
    await expect(metaRow).toContainText('Entregando')

    // Google Ads -> Sem entrega
    const googleRow = page.locator('[data-testid="campaign-delivery-row-MON-GOOGLE-002"]')
    await expect(googleRow).toBeVisible()
    await expect(googleRow).toContainText('Sem entrega')

    // TikTok Ads -> Em análise
    const tiktokRow = page.locator('[data-testid="campaign-delivery-row-MON-TIKTOK-003"]')
    await expect(tiktokRow).toBeVisible()
    await expect(tiktokRow).toContainText('Em análise')

    // Spotify Ads -> Entregando
    const spotifyRow = page.locator('[data-testid="campaign-delivery-row-MON-SPOTIFY-004"]')
    await expect(spotifyRow).toBeVisible()
    await expect(spotifyRow).toContainText('Entregando')

    // 6. Teste de Sincronização Geral
    const syncBtn = page.locator('[data-testid="sync-all-delivery-status-btn"]')
    await expect(syncBtn).toBeVisible()
    await syncBtn.click()

    // 7. Teste de Abertura do Modal de Diagnóstico
    const diagBtn = googleRow.locator('button', { hasText: 'Diagnóstico' })
    await diagBtn.click()

    const modal = page.locator('[data-testid="delivery-diagnostic-modal"]')
    await expect(modal).toBeVisible()
    await expect(modal).toContainText('DIAGNÓSTICO DE ENTREGA')
    await expect(modal).toContainText('Status Hierárquico na Plataforma')
    await expect(modal).toContainText('Prova de Entrega Recente (Últimas 6 Horas)')

    // Fecha o modal
    const closeBtn = modal.locator('button', { hasText: 'Fechar Diagnóstico' })
    await closeBtn.click()
    await expect(modal).not.toBeVisible()
  })

  test('Deve exibir a aba de telemetria e o indicador duplo na página de Campanhas', async ({ page }) => {
    await page.goto('/app/marketing-campaigns')

    // 1. Verifica presença da aba "📡 Telemetria & Entrega Real (6h)"
    const tabBtn = page.locator('[data-testid="tab-delivery-monitoring"]')
    await expect(tabBtn).toBeVisible({ timeout: 15000 })
    await expect(tabBtn).toContainText('Telemetria & Entrega Real (6h)')

    // 2. Na aba de campanhas, verifica indicador de entrega na tabela
    await expect(page.locator('body')).toContainText('Entregando')
    await expect(page.locator('body')).toContainText('Sem entrega (6h)')

    // 3. Ao clicar na aba de telemetria, renderiza a tabela de monitoramento
    await tabBtn.click()
    const panel = page.locator('[data-testid="campaign-delivery-monitoring-panel"]')
    await expect(panel).toBeVisible()
    await expect(panel).toContainText('Monitoramento de Ativação & Entrega Real das Campanhas')
  })
})
