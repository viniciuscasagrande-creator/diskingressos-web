import { test, expect } from '@playwright/test'
import { apiLogin, authHeader } from '../fixtures/api'
import { qaUsers } from '../fixtures/auth'

test.describe('Contratos de API — Event OS 360º (Fase 26.17.3)', () => {
  let token: string
  let eventId: number

  test.beforeAll(async ({ request }) => {
    const auth = await apiLogin(request, qaUsers.producerA.email, qaUsers.producerA.password)
    token = auth.token

    const eventsRes = await request.get('/api/events', { headers: authHeader(token) })
    expect(eventsRes.ok()).toBeTruthy()
    const events = (await eventsRes.json()) as Array<{ id: number; producerId: number }>
    expect(events.length).toBeGreaterThan(0)
    const myEvent = events.find(e => e.producerId === qaUsers.producerA.producerId) || events[0]
    eventId = myEvent.id
  })

  test('1. Cockpit 360: GET /api/events/:id/cockpit retorna payload completo', async ({ request }) => {
    const res = await request.get(`/api/events/${eventId}/cockpit`, { headers: authHeader(token) })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('event')
    expect(body).toHaveProperty('kpis')
  })

  test('2. Inventário: GET /api/events/:id/inventory-engine retorna lotes e status', async ({ request }) => {
    const res = await request.get(`/api/events/${eventId}/inventory-engine`, { headers: authHeader(token) })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('lots')
  })

  test('3. Customer 360: GET /api/events/:id/customer-360 retorna clientes e compras', async ({ request }) => {
    const res = await request.get(`/api/events/${eventId}/customer-360`, { headers: authHeader(token) })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('customers')
  })

  test('4. Live Operations: GET /api/events/:id/live-operations retorna entradas e portões', async ({ request }) => {
    const res = await request.get(`/api/events/${eventId}/live-operations`, { headers: authHeader(token) })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('kpis')
    expect(body).toHaveProperty('gates')
  })

  test('5. Central de Incidentes: GET /api/events/:id/incidents retorna lista de incidentes', async ({ request }) => {
    const res = await request.get(`/api/events/${eventId}/incidents`, { headers: authHeader(token) })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('incidents')
  })

  test('6. Event Day Command: GET /api/events/:id/event-day-command retorna central de comando', async ({ request }) => {
    const res = await request.get(`/api/events/${eventId}/event-day-command`, { headers: authHeader(token) })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('attendance')
    expect(body).toHaveProperty('status')
  })

  test('7. Revenue Intelligence: GET /api/events/:id/revenue-intelligence retorna inteligência comercial', async ({ request }) => {
    const res = await request.get(`/api/events/${eventId}/revenue-intelligence`, { headers: authHeader(token) })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('kpis')
    expect(body).toHaveProperty('lots')
  })

  test('8. Previsões (Forecast): GET /api/events/:id/forecast retorna projeções e sell-out', async ({ request }) => {
    const res = await request.get(`/api/events/${eventId}/forecast`, { headers: authHeader(token) })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('kpis')
  })

  test('9. Disk Intelligence: GET /api/events/:id/intelligence retorna saúde e insights', async ({ request }) => {
    const res = await request.get(`/api/events/${eventId}/intelligence`, { headers: authHeader(token) })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('healthScore')
    expect(body).toHaveProperty('insights')
  })

  test('10. Painel Executivo: GET /api/events/:id/executive-dashboard retorna visão executiva', async ({ request }) => {
    const res = await request.get(`/api/events/${eventId}/executive-dashboard`, { headers: authHeader(token) })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('kpis')
    expect(body).toHaveProperty('funnel')
  })

  test('11. Estornos (Canônico): GET /api/finance/disputes/refunds responde com 200', async ({ request }) => {
    const res = await request.get('/api/finance/disputes/refunds', { headers: authHeader(token) })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBeTruthy()
  })
})
