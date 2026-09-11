import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'

test.describe('Fase 28.14.3 — Central de Pixels e Conversões por Evento — UI Premium', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('1. Central Pixels e Conversões exibe UI Premium completa (Contexto, KPIs, Saúde, Provedores e Matriz)', async ({ page }) => {
    await page.goto('/app/marketing-dashboard')

    const sidebar = page.locator('aside')
    const trackingBtn = sidebar.locator('button', { hasText: 'Pixels e Conversões' })
    await expect(trackingBtn).toBeVisible({ timeout: 15_000 })
    await trackingBtn.click()

    // Header da Central
    await expect(page.locator('h2:has-text("Pixels e Conversões")').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('.eyebrow:has-text("MARKETING INTEGRATIONS 360")').first()).toBeVisible()

    // Barra de Contexto do Evento
    const contextBar = page.locator('.event-tracking-context-bar')
    await expect(contextBar).toBeVisible()

    // KPI Row
    const kpiRow = page.locator('.tracking-kpi-row')
    await expect(kpiRow).toBeVisible()
    await expect(kpiRow.locator('.tracking-kpi-card')).toHaveCount(5)
    await expect(kpiRow).toContainText('Total de Integrações')
    await expect(kpiRow).toContainText('Integrações Ativas')

    // Card de Saúde do Rastreamento
    const healthCard = page.locator('.tracking-health-summary-card')
    await expect(healthCard).toBeVisible()
    await expect(healthCard).toContainText('Saúde do Rastreamento')
    await expect(healthCard).toContainText('Configuração')
    await expect(healthCard).toContainText('Conectividade')

    // Cards de Plataformas de Mídia
    const providerGrid = page.locator('.tracking-provider-cards-grid')
    await expect(providerGrid).toBeVisible()
    await expect(providerGrid).toContainText('Meta')
    await expect(providerGrid).toContainText('Google')
    await expect(providerGrid).toContainText('TikTok')
    await expect(providerGrid).toContainText('Spotify')

    // Navegação de Abas: Matriz de Conversões
    const matrixTabBtn = page.locator('.tracking-tab-btn:has-text("Matriz de Conversões")')
    await expect(matrixTabBtn).toBeVisible()
    await matrixTabBtn.click()

    const matrixCard = page.locator('.tracking-matrix-card')
    await expect(matrixCard).toBeVisible()
    await expect(matrixCard).toContainText('Matriz de Disparos por Conversão')
    await expect(matrixCard).toContainText('Visualização de página')
    await expect(matrixCard).toContainText('Compra aprovada')

    // Navegação de Abas: Telemetria & Atividade
    const activityTabBtn = page.locator('.tracking-tab-btn:has-text("Telemetria & Atividade")')
    await expect(activityTabBtn).toBeVisible()
    await activityTabBtn.click()

    await expect(page.locator('h4:has-text("Fluxo de Disparos & Telemetria")')).toBeVisible()

    // Navegação de Abas: Integrações
    const integrationsTabBtn = page.locator('.tracking-tab-btn:has-text("Integrações")')
    await expect(integrationsTabBtn).toBeVisible()
    await integrationsTabBtn.click()

    await expect(page.locator('h3:has-text("Integrações Associadas a este Evento")')).toBeVisible()
  })

  test('2. APIs de Tracking Overview e Browser-Config sem vazamento de credenciais', async ({ request }) => {
    // Login API
    const authRes = await request.post('/api/auth/login', {
      data: { email: qaUsers.admin.email, password: qaUsers.admin.password }
    })
    expect(authRes.ok()).toBeTruthy()
    const { token } = await authRes.json()

    // Busca eventos
    const eventsRes = await request.get('/api/events', {
      headers: { Authorization: `Bearer ${token}` }
    })
    expect(eventsRes.ok()).toBeTruthy()
    const events = await eventsRes.json()
    expect(events.length).toBeGreaterThan(0)
    const targetEventId = events[0].id

    // Teste endpoint Tracking Overview
    const overviewRes = await request.get(`/api/marketing/events/${targetEventId}/tracking-overview`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    expect(overviewRes.ok()).toBeTruthy()
    const overview = await overviewRes.json()

    expect(overview).toHaveProperty('summary')
    expect(overview.summary).toHaveProperty('totalIntegrations')
    expect(overview.summary).toHaveProperty('healthScore')
    expect(overview).toHaveProperty('providers')
    expect(overview.providers.length).toBeGreaterThanOrEqual(4)

    // Verifica que nenhum segredo bruto vazou no overview
    const overviewRaw = JSON.stringify(overview)
    expect(overviewRaw).not.toContain('tokenCiphertext')
    expect(overviewRaw).not.toContain('tokenIv')
    expect(overviewRaw).not.toContain('tokenTag')
    expect(overviewRaw).not.toContain('secret_')

    // Teste endpoint Browser-Config (público / cliente)
    const browserConfigRes = await request.get(`/api/marketing/events/${targetEventId}/tracking/browser-config`)
    expect(browserConfigRes.ok()).toBeTruthy()
    const browserConfig = await browserConfigRes.json()

    expect(browserConfig).toHaveProperty('eventId', targetEventId)
    expect(browserConfig).toHaveProperty('integrations')

    const browserConfigRaw = JSON.stringify(browserConfig)
    expect(browserConfigRaw).not.toContain('tokenCiphertext')
    expect(browserConfigRaw).not.toContain('tokenIv')
    expect(browserConfigRaw).not.toContain('apiToken')
  })
})
