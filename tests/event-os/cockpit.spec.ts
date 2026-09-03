import { test, expect } from '@playwright/test'
import { apiLogin, authHeader } from '../fixtures/api'
import { qaUsers } from '../fixtures/auth'

test('@smoke Event OS responde Cockpit 360 para evento autorizado', async ({ request }) => {
  const auth = await apiLogin(request, qaUsers.producerA.email, qaUsers.producerA.password)
  const eventsResponse = await request.get('/api/events', { headers: authHeader(auth.token) })
  const events = await eventsResponse.json() as Array<{ id: number }>
  expect(events.length).toBeGreaterThan(0)
  const response = await request.get(`/api/events/${events[0].id}/command-center`, { headers: authHeader(auth.token) })
  expect(response.ok()).toBeTruthy()
  const body = await response.json()
  expect(body.event.id).toBe(events[0].id)
  expect(body.kpis).toBeTruthy()
  expect(body.health).toBeTruthy()
})
