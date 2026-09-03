import { test, expect } from '@playwright/test'
import { apiLogin, authHeader } from '../fixtures/api'
import { qaUsers } from '../fixtures/auth'

test.describe('Segurança multi-tenant producerId + eventId', () => {
  test('produtor recebe somente eventos da própria produtora', async ({ request }) => {
    const a = await apiLogin(request, qaUsers.producerA.email, qaUsers.producerA.password)
    const response = await request.get('/api/events', { headers: authHeader(a.token) })
    expect(response.ok()).toBeTruthy()
    const events = await response.json() as Array<{ producerId: number }>
    expect(events.length).toBeGreaterThan(0)
    expect(events.every(event => event.producerId === qaUsers.producerA.producerId)).toBeTruthy()
  })

  test('produtor A não acessa eventId do produtor B', async ({ request }) => {
    const [a, b] = await Promise.all([
      apiLogin(request, qaUsers.producerA.email, qaUsers.producerA.password),
      apiLogin(request, qaUsers.producerB.email, qaUsers.producerB.password),
    ])
    const producerBEvents = await request.get('/api/events', { headers: authHeader(b.token) })
    expect(producerBEvents.ok()).toBeTruthy()
    const events = await producerBEvents.json() as Array<{ id: number; producerId: number }>
    const foreignEvent = events.find(event => event.producerId === qaUsers.producerB.producerId)
    expect(foreignEvent, 'QA precisa de ao menos um evento da produtora B').toBeTruthy()

    const forbidden = await request.get(`/api/events/${foreignEvent!.id}`, { headers: authHeader(a.token) })
    expect(forbidden.status()).toBe(403)
  })

  test('Cockpit, Inventory e Customer 360 também bloqueiam evento estrangeiro', async ({ request }) => {
    const [a, b] = await Promise.all([
      apiLogin(request, qaUsers.producerA.email, qaUsers.producerA.password),
      apiLogin(request, qaUsers.producerB.email, qaUsers.producerB.password),
    ])
    const bResponse = await request.get('/api/events', { headers: authHeader(b.token) })
    const foreign = (await bResponse.json() as Array<{ id: number }>)[0]
    expect(foreign).toBeTruthy()

    const endpoints = [
      `/api/events/${foreign.id}/command-center`,
      `/api/events/${foreign.id}/inventory-engine`,
      `/api/events/${foreign.id}/customer-360`,
      `/api/events/${foreign.id}/event-os/advanced`,
    ]
    for (const endpoint of endpoints) {
      const response = await request.get(endpoint, { headers: authHeader(a.token) })
      expect([403, 404], `${endpoint} deve negar acesso cross-tenant`).toContain(response.status())
    }
  })
})
