import { test, expect } from '@playwright/test'
import { login } from '../fixtures/auth'

test.describe('Fase 28.13.1 — Status Real das Campanhas & Spotify na Central UTM', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Deve exibir o submenu "Status Real" dentro de Marketing na sidebar e navegar para a tela oficial', async ({ page }) => {
    await page.goto('/app/marketing-dashboard')

    // 1. Verifica se o item Status Real está visível no menu Marketing
    const sidebar = page.locator('aside')
    const statusRealItem = sidebar.locator('button', { hasText: 'Status Real' })
    await expect(statusRealItem).toBeVisible({ timeout: 15000 })

    // 2. Clica no submenu Status Real
    await statusRealItem.click()
    await expect(page).toHaveURL(/.*marketing\/status-real/)

    // 3. Verifica título da tela
    await expect(page.locator('h2')).toContainText('Central de Status Real & Telemetria de Entrega')
    await expect(page.locator('body')).toContainText('Meta Ads')
    await expect(page.locator('body')).toContainText('Google Ads')
    await expect(page.locator('body')).toContainText('TikTok Ads')
    await expect(page.locator('body')).toContainText('Spotify Ads')

    // 4. Verifica os 4 KPIs consolidados (31 / 6 / 7 / 4)
    await expect(page.locator('body')).toContainText('31')
    await expect(page.locator('body')).toContainText('Ativas e Entregando')
    await expect(page.locator('body')).toContainText('6')
    await expect(page.locator('body')).toContainText('Ativas sem Entrega')
    await expect(page.locator('body')).toContainText('7')
    await expect(page.locator('body')).toContainText('Em Análise / Fila')
    await expect(page.locator('body')).toContainText('4')
    await expect(page.locator('body')).toContainText('Com Problemas / Erro')
  })

  test('Deve exibir o Card Executivo "Status Real das Campanhas" no Dashboard Marketing com botão direto', async ({ page }) => {
    await page.goto('/app/marketing-dashboard')

    // 1. Verifica presença do Card Executivo
    const executiveCard = page.locator('div', { hasText: 'Status Real das Campanhas (Meta, Google, TikTok e Spotify)' }).first()
    await expect(executiveCard).toBeVisible({ timeout: 15000 })

    // 2. Verifica as 4 métricas visuais no Card
    await expect(executiveCard).toContainText('31')
    await expect(executiveCard).toContainText('Ativas e entregando')
    await expect(executiveCard).toContainText('6')
    await expect(executiveCard).toContainText('Ativas sem entrega')
    await expect(executiveCard).toContainText('7')
    await expect(executiveCard).toContainText('Em análise / moderação')
    await expect(executiveCard).toContainText('4')
    await expect(executiveCard).toContainText('Com problemas / rejeitadas')

    // 3. Clica no botão "Ver Status Real"
    const verStatusBtn = executiveCard.locator('button', { hasText: 'Ver Status Real' })
    await expect(verStatusBtn).toBeVisible()
    await verStatusBtn.click()

    // 4. Deve redirecionar para a rota de Status Real
    await expect(page).toHaveURL(/.*marketing\/status-real/)
  })

  test('Deve abrir o Drawer de Diagnóstico de Causa-Raiz na tela de Status Real', async ({ page }) => {
    await page.goto('/app/marketing/status-real')

    // 1. Aguarda carregamento das campanhas
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 })

    // 2. Clica no botão Diagnóstico da primeira campanha com erro/aviso
    const diagButtons = page.locator('button', { hasText: 'Diagnóstico' })
    await expect(diagButtons.first()).toBeVisible()
    await diagButtons.nth(1).click() // Clica na segunda linha

    // 3. Verifica abertura do Drawer lateral
    const drawer = page.locator('aside', { hasText: 'DIAGNÓSTICO AUTOMATIZADO' })
    await expect(drawer).toBeVisible()
    await expect(drawer).toContainText('Análise de Causa-Raiz & Ação Sugerida')

    // 4. Fecha o drawer
    const closeBtn = drawer.locator('button', { hasText: 'Fechar' })
    await closeBtn.click()
    await expect(drawer).not.toBeVisible()
  })

  test('Deve integrar o Spotify Ads na Central UTM & Conversões', async ({ page }) => {
    await page.goto('/app/marketing-utm-central')

    // 1. Verifica presença do link rastreável do Spotify
    await expect(page.locator('body')).toContainText('Spotify Ads — Áudio Oficial & Companion Banner', { timeout: 15000 })
    await expect(page.locator('body')).toContainText('disk.ing/4amigos-spotify')

    // 2. Filtra por canal Spotify Ads
    const filterSelect = page.locator('.utm-source-filter select')
    await expect(filterSelect).toBeVisible()
    await filterSelect.selectOption('spotify')

    // 3. Apenas URLs do Spotify devem permanecer visíveis
    await expect(page.locator('body')).toContainText('disk.ing/4amigos-spotify')

    // 4. Abre modal de Nova UTM e verifica a opção de canal Spotify Ads
    const novaUtmBtn = page.locator('button', { hasText: 'Nova UTM' })
    await novaUtmBtn.click()

    const sourceSelect = page.locator('select').filter({ hasText: 'Spotify Ads (Áudio & Companion)' })
    await expect(sourceSelect).toBeVisible()
  })
})
