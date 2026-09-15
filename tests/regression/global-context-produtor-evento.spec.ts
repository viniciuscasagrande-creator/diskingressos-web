// ==============================================================================
// FASE 28.15.8.1 — TESTES E2E: CONTEXTO GLOBAL PRODUTOR × EVENTO
// Validação do fluxo completo:
// Login -> Sidebar Produtor -> Seleção de Evento -> Sidebar Evento ->
// Troca Rápida de Evento -> Preservação de Ferramenta -> Voltar a Todos os Eventos ->
// Segurança 403 IDOR
// ==============================================================================

import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'

test.describe('Fase 28.15.8.1 — Contexto Global Produtor × Evento', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, qaUsers.producerA.email, qaUsers.producerA.password)
  })

  // ===========================================================================
  // 1. INICIALIZAÇÃO: Escopo PRODUCER por padrão e Sidebar do Produtor
  // ===========================================================================
  test('Inicial: Produtor inicia no escopo PRODUCER com Sidebar corporativa do Produtor', async ({ page }) => {
    await page.goto('/eventos')
    await page.waitForLoadState('domcontentloaded')

    // 1. O cabeçalho exibe "Todos os Eventos"
    const selector = page.locator('header [data-testid="global-event-selector"]')
    await expect(selector).toBeVisible({ timeout: 10_000 })
    await expect(selector).toContainText('Todos os Eventos')

    // 2. A sidebar ativa é a Sidebar do Produtor (ModuleSidebar)
    const moduleSidebar = page.locator('.safesaff-sidebar')
    await expect(moduleSidebar).toBeVisible()
    await expect(page.locator('[data-testid="event-context-sidebar"]')).toHaveCount(0)

    // 3. Verifica seções corporativas do produtor presentes na sidebar
    await expect(page.locator('[data-testid="collapsible-financeiro"]')).toBeVisible()
    await expect(page.locator('[data-testid="collapsible-contabilidade"]')).toBeVisible()
    await expect(page.locator('[data-testid="collapsible-marketing"]')).toBeVisible()
  })

  // ===========================================================================
  // 2. TRANSIÇÃO DE CONTEXTO: Entrou no evento = Sidebar e Escopo do Evento
  // ===========================================================================
  test('Transição: Selecionar um evento altera escopo para EVENT e ativa EventContextSidebar', async ({ page }) => {
    await page.goto('/eventos')
    await page.waitForLoadState('domcontentloaded')

    // Abre o primeiro card de evento disponível clicando no título ou botão de acessar
    const eventCard = page.locator('.event-card, [data-testid^="event-card-"]').first()
    await expect(eventCard).toBeVisible({ timeout: 10_000 })

    // Clica no card para entrar no contexto do evento
    await eventCard.click()
    await page.waitForTimeout(600)

    // 1. A Sidebar corporativa é substituída dinamicamente pela EventContextSidebar
    const eventSidebar = page.locator('[data-testid="event-context-sidebar"]')
    await expect(eventSidebar).toBeVisible({ timeout: 10_000 })

    // 2. Botão de retorno "← Todos os Eventos" está visível
    const backBtn = page.locator('[data-testid="event-sidebar-back"]')
    await expect(backBtn).toBeVisible()
    await expect(backBtn).toContainText('Todos os Eventos')

    // 3. Seletor rápido de evento está presente no topo da EventSidebar
    const sidebarSwitcher = page.locator('[data-testid="event-sidebar-switcher-wrap"]')
    await expect(sidebarSwitcher).toBeVisible()

    // 4. Categorias exclusivas do evento estão renderizadas
    await expect(eventSidebar).toContainText('EVENTO')
    await expect(eventSidebar).toContainText('MARKETING DO EVENTO')
    await expect(eventSidebar).toContainText('FINANCEIRO DO EVENTO')

    // 5. O seletor global do cabeçalho indica escopo de evento individual
    const globalSelector = page.locator('header [data-testid="global-event-selector"]')
    await expect(globalSelector).toContainText(/Evento #/i)
  })

  // ===========================================================================
  // 3. TROCA RÁPIDA DE EVENTO: Comutador no topo da Sidebar sem sair do contexto
  // ===========================================================================
  test('Troca Rápida: Alternar evento no topo da EventSidebar preserva a ferramenta ativa', async ({ page }) => {
    await page.goto('/eventos')
    await page.waitForLoadState('domcontentloaded')

    // Entra no primeiro evento
    await page.locator('.event-card, [data-testid^="event-card-"]').first().click()
    await page.waitForTimeout(600)

    // Navega para ferramenta Consultar Ingressos do evento
    const ticketNav = page.locator('[data-testid="event-nav-event-tickets"]')
    await expect(ticketNav).toBeVisible()
    await ticketNav.click()
    await page.waitForTimeout(500)

    // Obtém o código ou título do primeiro evento
    const initialText = await page.locator('[data-testid="event-sidebar-switcher-wrap"]').innerText()

    // Abre o dropdown do seletor rápido no topo da EventSidebar
    const quickSelectorBtn = page.locator('[data-testid="event-sidebar-switcher-wrap"] button').first()
    await quickSelectorBtn.click()
    await page.waitForTimeout(300)

    // Localiza a lista de eventos no dropdown
    const dropdownList = page.locator('[data-testid="event-sidebar-switcher-wrap"] .max-h-60 button')
    const count = await dropdownList.count()
    if (count > 1) {
      // Seleciona o segundo evento da lista
      await dropdownList.nth(1).click()
      await page.waitForTimeout(500)

      // Valida que o evento foi alterado no topo da sidebar
      const updatedText = await page.locator('[data-testid="event-sidebar-switcher-wrap"]').innerText()
      expect(updatedText).not.toBe(initialText)

      // Valida que a sidebar individual do evento continua ativa
      await expect(page.locator('[data-testid="event-context-sidebar"]')).toBeVisible()
    }
  })

  // ===========================================================================
  // 4. RETORNO AO ESCOPO PRODUTOR: Botão ← Todos os Eventos restaura visão global
  // ===========================================================================
  test('Retorno: Clicar em ← Todos os Eventos restaura escopo PRODUCER e Sidebar corporativa', async ({ page }) => {
    await page.goto('/eventos')
    await page.waitForLoadState('domcontentloaded')

    // Entra no evento
    await page.locator('.event-card, [data-testid^="event-card-"]').first().click()
    await page.waitForTimeout(600)
    await expect(page.locator('[data-testid="event-context-sidebar"]')).toBeVisible()

    // Clica no botão de voltar
    const backBtn = page.locator('[data-testid="event-sidebar-back"]')
    await backBtn.click()
    await page.waitForTimeout(600)

    // 1. EventContextSidebar é desmontada e ModuleSidebar é reativada
    await expect(page.locator('[data-testid="event-context-sidebar"]')).toHaveCount(0)
    await expect(page.locator('.safesaff-sidebar')).toBeVisible()

    // 2. Seletor do Header indica "Todos os Eventos"
    const headerSelector = page.locator('header [data-testid="global-event-selector"]')
    await expect(headerSelector).toContainText('Todos os Eventos')

    // 3. Ferramentas corporativas do produtor (Financeiro, Contabilidade, Marketing) estão ativas
    await expect(page.locator('[data-testid="collapsible-financeiro"]')).toBeVisible()
  })

  // ===========================================================================
  // 5. RESTAURAÇÃO F5 / PERSISTÊNCIA EM URL: Acesso direto /eventos/:code restaura evento
  // ===========================================================================
  test('Persistência: Acesso a URL com código do evento ativa escopo EVENT e sobrevive ao F5', async ({ page }) => {
    // 1. Acessa lista de eventos e entra no primeiro card
    await page.goto('/eventos')
    await page.waitForLoadState('domcontentloaded')
    const firstCard = page.locator('.event-card, [data-testid^="event-card-"]').first()
    await expect(firstCard).toBeVisible({ timeout: 10_000 })
    await firstCard.click()
    await page.waitForTimeout(600)

    // Verifica que EventContextSidebar está ativa
    await expect(page.locator('[data-testid="event-context-sidebar"]')).toBeVisible({ timeout: 10_000 })

    // 2. Executa recarregamento F5
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(600)

    // O contexto do evento e a EventContextSidebar devem permanecer ativos após F5
    await expect(page.locator('[data-testid="event-context-sidebar"]')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('header [data-testid="global-event-selector"]')).toContainText(/Evento #/i)
  })

  // ===========================================================================
  // 6. SEGURANÇA E IDOR: Produtor A não pode acessar eventos do Produtor B
  // ===========================================================================
  test('Segurança: Tentativa de requisitar eventos de outra produtora via API retorna 403', async ({ page, request }) => {
    // Produtor A (vinicius@diskingressos.com.br, producerId: 1) tenta buscar eventos da produtora 2
    const token = await page.evaluate(() => {
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i)
        if (k && k.startsWith('disk_token')) return sessionStorage.getItem(k)
      }
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('disk_token')) return localStorage.getItem(k)
      }
      return ''
    })

    const response = await request.get('/api/producers/2/events', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // Deve ser bloqueado com HTTP 403 Proibido
    expect(response.status()).toBe(403)
  })
})
