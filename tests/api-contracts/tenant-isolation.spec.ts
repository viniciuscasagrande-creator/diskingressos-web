import { test, expect } from '@playwright/test'
import { apiLogin, authHeader } from '../fixtures/api'
import { qaUsers } from '../fixtures/auth'

test.describe('Segurança e Isolamento Multi-Tenant — Event OS (Fase 26.17.3)', () => {
  test('Produtor A é estritamente bloqueado com 403 ao acessar módulos de evento do Produtor B', async ({ request }) => {
    const [authA, authB] = await Promise.all([
      apiLogin(request, qaUsers.producerA.email, qaUsers.producerA.password),
      apiLogin(request, qaUsers.producerB.email, qaUsers.producerB.password)
    ])

    const bRes = await request.get('/api/events', { headers: authHeader(authB.token) })
    expect(bRes.ok()).toBeTruthy()
    const bEvents = (await bRes.json()) as Array<{ id: number; producerId: number }>
    expect(bEvents.length, 'Produtor B deve possuir ao menos 1 evento para teste').toBeGreaterThan(0)
    const foreignEvent = bEvents[0]

    const eventEndpoints = [
      `/api/events/${foreignEvent!.id}`,
      `/api/events/${foreignEvent!.id}/cockpit`,
      `/api/events/${foreignEvent!.id}/live-operations`,
      `/api/events/${foreignEvent!.id}/incidents`,
      `/api/events/${foreignEvent!.id}/event-day-command`,
      `/api/events/${foreignEvent!.id}/revenue-intelligence`,
      `/api/events/${foreignEvent!.id}/forecast`,
      `/api/events/${foreignEvent!.id}/intelligence`,
      `/api/events/${foreignEvent!.id}/executive-dashboard`
    ]

    for (const ep of eventEndpoints) {
      const response = await request.get(ep, { headers: authHeader(authA.token) })
      expect([403, 404], `Tentativa de acesso não autorizada a ${ep} deve retornar 403 ou 404`).toContain(response.status())
    }
  })

  test('Tentativa de acesso sem autenticação (token ausente) é rejeitada com 401', async ({ request }) => {
    const endpoints = [
      '/api/events',
      '/api/events/1/cockpit',
      '/api/events/1/live-operations',
      '/api/events/1/revenue-intelligence',
      '/api/events/1/forecast',
      '/api/events/1/intelligence',
      '/api/events/1/executive-dashboard',
      '/api/finance/disputes/refunds'
    ]

    for (const ep of endpoints) {
      const res = await request.get(ep)
      expect([401, 403], `${ep} sem credencial deve ser bloqueado`).toContain(res.status())
    }
  })

  test('Acesso a evento inexistente retorna 404', async ({ request }) => {
    const authA = await apiLogin(request, qaUsers.producerA.email, qaUsers.producerA.password)
    const res = await request.get('/api/events/999999/cockpit', { headers: authHeader(authA.token) })
    expect(res.status()).toBe(404)
  })
})
