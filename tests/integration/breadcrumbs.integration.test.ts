import test from 'node:test'
import assert from 'node:assert'
import { BreadcrumbManager } from '../../src/navigation/breadcrumbs'
import { resolveRoute } from '../../src/navigation/routes'

test('Integration - BreadcrumbManager: resolve rota padrão', () => {
  const routeFin = resolveRoute('/financeiro/saldos')
  const items = BreadcrumbManager.resolve(routeFin, {
    user: null,
    role: null,
    producerId: null,
    producerName: null,
    eventId: null,
    eventName: null
  })

  assert.strictEqual(items.length, 2)
  assert.strictEqual(items[0].label, 'Financeiro')
  assert.strictEqual(items[1].label, 'Gestão de Saldos')
  assert.strictEqual(items[1].isCurrent, true)
})

test('Integration - BreadcrumbManager: injeta contexto de evento quando ativo', () => {
  const routeEvent = resolveRoute('/eventos/EVT-01/tickets')
  const items = BreadcrumbManager.resolve(routeEvent, {
    user: null,
    role: null,
    producerId: 10,
    producerName: 'Produtora Alpha',
    eventId: 200,
    eventName: 'Rock Arena Festival 2026'
  })

  // Deve conter o evento ativo no caminho estrutural
  const hasEventName = items.some((it) => it.label === 'Rock Arena Festival 2026')
  assert.strictEqual(hasEventName, true)
  assert.strictEqual(items[items.length - 1].isCurrent, true)
})
