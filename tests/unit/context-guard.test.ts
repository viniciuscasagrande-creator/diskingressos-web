import test from 'node:test'
import assert from 'node:assert'
import { ContextGuard } from '../../src/security/context-guard'
import { resolveRoute } from '../../src/navigation/routes'

test('Unit - ContextGuard: rota sem requisito de contexto é sempre liberada', () => {
  const publicRoute = resolveRoute('/sac')
  const check = ContextGuard.checkRoute(publicRoute, {
    user: null,
    role: null,
    producerId: null,
    producerName: null,
    eventId: null,
    eventName: null
  })

  assert.strictEqual(check.allowed, true)
})

test('Unit - ContextGuard: rota que exige produtor é bloqueada sem produtor selecionado', () => {
  const producerRoute = resolveRoute('/financeiro/saldos')
  const check = ContextGuard.checkRoute(producerRoute, {
    user: null,
    role: null,
    producerId: null,
    producerName: null,
    eventId: null,
    eventName: null
  })

  assert.strictEqual(check.allowed, false)
  assert.strictEqual(check.blockedReason, 'need_producer')
})

test('Unit - ContextGuard: rota que exige evento é bloqueada sem evento selecionado', () => {
  const eventRoute = resolveRoute('/marketing/pixels')
  const check = ContextGuard.checkRoute(eventRoute, {
    user: null,
    role: null,
    producerId: 10,
    producerName: 'Produtora Alpha',
    eventId: null,
    eventName: null
  })

  assert.strictEqual(check.allowed, false)
  assert.strictEqual(check.blockedReason, 'need_event')
})

test('Unit - ContextGuard: rota que exige produtor e evento é liberada com contexto completo', () => {
  const eventRoute = resolveRoute('/marketing/pixels')
  const check = ContextGuard.checkRoute(eventRoute, {
    user: null,
    role: null,
    producerId: 10,
    producerName: 'Produtora Alpha',
    eventId: 101,
    eventName: 'Festival 2026'
  })

  assert.strictEqual(check.allowed, true)
})
