import { expect, type APIRequestContext } from '@playwright/test'

export async function apiLogin(request: APIRequestContext, email: string, password: string) {
  const response = await request.post('/api/auth/login', { data: { email, password } })
  expect(response.ok(), `Falha no login de QA: ${response.status()}`).toBeTruthy()
  const body = await response.json()
  expect(body.token).toBeTruthy()
  return body as { token: string; user: { id: number; role: string; producerId: number | null } }
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}
