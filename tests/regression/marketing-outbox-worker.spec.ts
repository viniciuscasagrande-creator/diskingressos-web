import { test, expect } from '@playwright/test'
import { login, qaUsers } from '../fixtures/auth'

test.describe('Fase 28.14.4 — Motor Assíncrono de Conversões + Outbox + Retry + Dead Letter', () => {
  test('1. UI: Aba de Fila Assíncrona, Métricas da Outbox, Circuit Breakers e Ações Operacionais', async ({ page }) => {
    await login(page)
    await page.goto('/app/marketing-dashboard')

    const sidebar = page.locator('aside')
    const trackingBtn = sidebar.locator('button', { hasText: 'Pixels e Conversões' })
    await expect(trackingBtn).toBeVisible({ timeout: 15_000 })
    await trackingBtn.click()

    // Header da Central de Pixels
    await expect(page.locator('h2:has-text("Pixels e Conversões")').first()).toBeVisible({ timeout: 10_000 })

    // Botão de Aba Fila Assíncrona & Outbox
    const outboxTabBtn = page.locator('button:has-text("Fila Assíncrona & Outbox")').first()
    await expect(outboxTabBtn).toBeVisible({ timeout: 10_000 })
    await outboxTabBtn.click()

    // Valida cards de métricas operacionais da Outbox (PT-BR)
    await expect(page.locator('text=Na Fila').first()).toBeVisible()
    await expect(page.locator('text=Em Processamento').first()).toBeVisible()
    await expect(page.locator('text=Reprocessando (Retry)').first()).toBeVisible()
    await expect(page.locator('text=Entregues com Sucesso').first()).toBeVisible()
    await expect(page.locator('text=Dead Letter (Esgotados)').first()).toBeVisible()

    // Valida painel de Circuit Breakers por provedor
    await expect(page.locator('text=Circuit Breakers por Provedor').first()).toBeVisible()

    // Botão de ação "Processar Fila Agora"
    const runTickBtn = page.locator('button:has-text("Processar Fila Agora")').first()
    await expect(runTickBtn).toBeVisible()
  })

  test('2. APIs de Fila Outbox, Saúde do Worker, Reprocessamento e Dead Letter', async ({ request }) => {
    // 1. Autenticação via API
    const authRes = await request.post('/api/auth/login', {
      data: { email: qaUsers.producerA.email, password: qaUsers.producerA.password }
    })
    expect(authRes.ok()).toBeTruthy()
    const { token } = await authRes.json()
    const headers = { Authorization: `Bearer ${token}` }

    // 2. Diagnóstico de Saúde do Worker
    const healthRes = await request.get('/api/marketing/tracking/worker/health', { headers })
    expect(healthRes.ok()).toBeTruthy()
    const health = await healthRes.json()

    expect(['healthy', 'degraded', 'critical']).toContain(health.status)
    expect(health).toHaveProperty('queueDepth')
    expect(health).toHaveProperty('queuedCount')
    expect(health).toHaveProperty('processingCount')
    expect(health).toHaveProperty('retryingCount')
    expect(health).toHaveProperty('completedCount')
    expect(health).toHaveProperty('deadLetterCount')
    expect(health).toHaveProperty('providers')
    expect(health.providers).toHaveProperty('meta')
    expect(health.providers).toHaveProperty('google')
    expect(health.providers).toHaveProperty('tiktok')
    expect(health.providers).toHaveProperty('spotify')

    // 3. Consulta da Fila de Disparos (Queue)
    const queueRes = await request.get('/api/marketing/tracking/queue?limit=20', { headers })
    expect(queueRes.ok()).toBeTruthy()
    const queueItems = await queueRes.json()
    expect(Array.isArray(queueItems)).toBeTruthy()

    // 4. Consulta da Dead Letter Queue
    const deadLetterRes = await request.get('/api/marketing/tracking/dead-letter?limit=20', { headers })
    expect(deadLetterRes.ok()).toBeTruthy()
    const deadLetterItems = await deadLetterRes.json()
    expect(Array.isArray(deadLetterItems)).toBeTruthy()

    // 5. Enfileiramento assíncrono via /api/marketing/conversions/dispatch
    const testEventId = `e2e_outbox_${Date.now()}`
    const dispatchRes = await request.post('/api/marketing/conversions/dispatch', {
      headers,
      data: {
        eventId: testEventId,
        eventName: 'purchase',
        valueCents: 15000,
        currency: 'BRL',
        email: 'cliente.teste@diskingressos.com.br'
      }
    })
    expect([200, 201]).toContain(dispatchRes.status())
    const dispatchData = await dispatchRes.json()
    expect(dispatchData.event).toBeDefined()
    expect(dispatchData.event.eventId).toBe(testEventId)

    // Os dispatches gerados devem estar em modo queued (não-bloqueante)
    if (dispatchData.dispatches && dispatchData.dispatches.length > 0) {
      for (const d of dispatchData.dispatches) {
        expect(['queued', 'processing', 'completed', 'retrying', 'dry_run']).toContain(d.status)
        expect(d.priority).toBe('HIGH')
        // Segurança: nunca vazar token ou credencial
        expect(d).not.toHaveProperty('tokenCiphertext')
        expect(d).not.toHaveProperty('apiToken')
      }

      const firstDispatchId = dispatchData.dispatches[0].id

      // 6. Teste de cancelamento manual
      const cancelRes = await request.post(`/api/marketing/tracking/dispatches/${firstDispatchId}/cancel`, {
        headers,
        data: { reason: 'Teste automatizado de cancelamento' }
      })
      expect(cancelRes.ok()).toBeTruthy()
      const cancelData = await cancelRes.json()
      expect(cancelData.ok).toBe(true)
      expect(cancelData.dispatch.status).toBe('cancelled')

      // 7. Teste de reprocessamento manual (re-queue)
      const retryRes = await request.post(`/api/marketing/tracking/dispatches/${firstDispatchId}/retry`, {
        headers
      })
      expect(retryRes.ok()).toBeTruthy()
      const retryData = await retryRes.json()
      expect(retryData.ok).toBe(true)
      expect(retryData.dispatch.status).toBe('queued')
      expect(retryData.dispatch.attempts).toBe(0)
    }

    // 8. Teste de acionamento do tick do worker
    const tickRes = await request.post('/api/marketing/tracking/worker/tick', { headers })
    expect(tickRes.ok()).toBeTruthy()
    const tickData = await tickRes.json()
    expect(tickData).toHaveProperty('processed')
    expect(tickData).toHaveProperty('results')
  })

  test('3. Princípio Crítico: Falha em tracking NUNCA trava checkout, criação de pedido ou emissão de ingressos', async ({ request }) => {
    const authRes = await request.post('/api/auth/login', {
      data: { email: qaUsers.producerA.email, password: qaUsers.producerA.password }
    })
    expect(authRes.ok()).toBeTruthy()
    const { token } = await authRes.json()
    const headers = { Authorization: `Bearer ${token}` }

    // Busca eventos da produtora
    const eventsRes = await request.get('/api/events', { headers })
    expect(eventsRes.ok()).toBeTruthy()
    const events = await eventsRes.json()
    expect(events.length).toBeGreaterThan(0)
    const targetEvent = events[0]

    // Busca lotes disponíveis do evento
    const lotsRes = await request.get(`/api/events/${targetEvent.id}/lots`, { headers })
    const lots = lotsRes.ok() ? await lotsRes.json() : []
    const lotId = lots.length > 0 ? lots[0].id : undefined

    // Cria venda / pedido com status 'pago'
    const orderCode = `ORD-OUTBOX-${Date.now()}`
    const startOrderTime = Date.now()

    const orderRes = await request.post('/api/orders', {
      headers,
      data: {
        code: orderCode,
        buyerName: 'Comprador Resiliência Teste',
        buyerEmail: 'resiliencia@diskingressos.com.br',
        paymentMethod: 'PIX',
        status: 'pago',
        quantity: 2,
        grossCents: 20000,
        netCents: 18000,
        eventId: targetEvent.id,
        lotId
      }
    })

    const orderDurationMs = Date.now() - startOrderTime
    expect(orderRes.status()).toBe(201)
    const order = await orderRes.json()

    // Validações fundamentais de integridade de checkout
    expect(order.id).toBeDefined()
    expect(order.code).toBe(orderCode)
    expect(order.status).toBe('pago')

    // O pedido DEVE ser criado rapidamente sem aguardar APIs de terceiros (Meta, TikTok, Spotify)
    // Tempo menor que 3000ms garante que chamadas de rede externas não foram bloqueantes síncronas
    expect(orderDurationMs).toBeLessThan(3500)

    // Valida que os ingressos foram emitidos perfeitamente
    const ticketsRes = await request.get(`/api/orders?status=pago`, { headers })
    expect(ticketsRes.ok()).toBeTruthy()
    const ordersList = await ticketsRes.json()
    const createdOrder = ordersList.find((o: any) => o.code === orderCode)
    expect(createdOrder).toBeDefined()
    expect(createdOrder.tickets.length).toBe(2)
  })
})
