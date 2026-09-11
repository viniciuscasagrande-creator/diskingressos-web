import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'

test.describe('Fase 28.14.2 — Multi-Pixel e Regras Individuais por Evento', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('1. Central Pixels e Conversões exibe seletor de Modo de Disparo (Híbrido, Navegador, Servidor)', async ({ page }) => {
    await page.goto('/app/marketing-dashboard')

    const sidebar = page.locator('aside')
    const trackingBtn = sidebar.locator('button', { hasText: 'Pixels e Conversões' })
    await expect(trackingBtn).toBeVisible({ timeout: 15_000 })
    await trackingBtn.click()

    // Abre a Central
    await expect(page.locator('h2:has-text("Pixels e Conversões")').first()).toBeVisible({ timeout: 10_000 })

    // Clica em Nova Integração
    const newBtn = page.locator('button:has-text("Nova integração")').first()
    await expect(newBtn).toBeVisible({ timeout: 10_000 })
    await newBtn.click()

    const modal = page.locator('.integration-editor')
    await expect(modal).toBeVisible()

    // Verifica que o seletor de Modo de Disparo está presente com as 3 opções da Fase 28.14.2
    const modeSelect = modal.locator('label:has-text("Modo de Disparo") select')
    await expect(modeSelect).toBeVisible()

    const options = await modeSelect.locator('option').allInnerTexts()
    expect(options.some(opt => opt.includes('Híbrido 360°'))).toBeTruthy()
    expect(options.some(opt => opt.includes('Apenas Navegador'))).toBeTruthy()
    expect(options.some(opt => opt.includes('Apenas Servidor'))).toBeTruthy()

    // Fecha o modal
    await modal.locator('button:has-text("Cancelar")').click()
  })

  test('2. Validação da API de Associações Granulares por Evento (GET e PUT com regras por etapa)', async ({ request }) => {
    // Busca token de autenticação via login na API
    const authRes = await request.post('/api/auth/login', {
      data: { email: qaUsers.admin.email, password: qaUsers.admin.password }
    })
    expect(authRes.ok()).toBeTruthy()
    const { token } = await authRes.json()

    // Busca eventos disponíveis
    const eventsRes = await request.get('/api/events', {
      headers: { Authorization: `Bearer ${token}` }
    })
    expect(eventsRes.ok()).toBeTruthy()
    const events = await eventsRes.json()
    expect(events.length).toBeGreaterThan(0)
    const targetEventId = events[0].id

    // Consulta associações de tracking do evento
    const assignmentsRes = await request.get(`/api/marketing/events/${targetEventId}/tracking-assignments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    expect(assignmentsRes.ok()).toBeTruthy()
    const data = await assignmentsRes.json()

    expect(data.event).toBeDefined()
    expect(data.event.id).toBe(targetEventId)
    expect(Array.isArray(data.assignments)).toBeTruthy()
    expect(Array.isArray(data.globalIntegrations)).toBeTruthy()

    // Cria ou atualiza uma integração de teste para verificar persistência das regras granulares
    const createIntRes = await request.post('/api/marketing/integrations', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'Pixel Meta Teste Granular',
        provider: 'meta',
        integrationType: 'pixel_capi',
        pixelId: '998877665544',
        status: 'ativo',
        applyToAllEvents: false,
        eventIds: [targetEventId],
        enabledEvents: ['PageView', 'ViewContent', 'AddToCart', 'Purchase']
      }
    })
    expect(createIntRes.ok()).toBeTruthy()
    const newInt = await createIntRes.json()

    // Atualiza regras da associação para o evento:
    // Define como Parceiro (isPrimary: false), modo SERVER-only, e regras customizadas
    const updateAssignmentRes = await request.put(`/api/marketing/events/${targetEventId}/tracking-assignments/${newInt.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        isPrimary: false,
        trackingMode: 'SERVER',
        rules: [
          { eventName: 'PageView', enabled: false, browserEnabled: false, serverEnabled: false },
          { eventName: 'Purchase', enabled: true, browserEnabled: false, serverEnabled: true }
        ]
      }
    })
    expect(updateAssignmentRes.ok()).toBeTruthy()
    const updatedAssignment = await updateAssignmentRes.json()

    expect(updatedAssignment.isPrimary).toBe(false)
    expect(updatedAssignment.trackingMode).toBe('SERVER')
    expect(updatedAssignment.rules).toBeDefined()
    expect(updatedAssignment.rules.length).toBe(2)

    const pageViewRule = updatedAssignment.rules.find((r: any) => r.eventName === 'PageView')
    expect(pageViewRule.enabled).toBe(false)

    const purchaseRule = updatedAssignment.rules.find((r: any) => r.eventName === 'Purchase')
    expect(purchaseRule.enabled).toBe(true)
    expect(purchaseRule.serverEnabled).toBe(true)

    // Limpeza (soft delete da integração de teste)
    await request.delete(`/api/marketing/integrations/${newInt.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  })
})
