import test from 'node:test'
import assert from 'node:assert'
import { resolveRoute, CANONICAL_ROUTES, LEGACY_ROUTE_ALIASES } from '../../src/navigation/routes'
import { AppRouter } from '../../src/navigation/router'
import { AppContext } from '../../src/context/app-context'

test('Unit - Router: resolveRoute mapeia rotas canônicas', () => {
  const dashboard = resolveRoute('/dashboard')
  assert.strictEqual(dashboard.path, '/dashboard')
  assert.strictEqual(dashboard.module, 'events')

  const saldos = resolveRoute('/financeiro/saldos')
  assert.strictEqual(saldos.path, '/financeiro/saldos')
  assert.strictEqual(saldos.module, 'financeiro')
  assert.strictEqual(saldos.view, 'finance')

  const dre = resolveRoute('/contabilidade/dre')
  assert.strictEqual(dre.path, '/contabilidade/dre')
  assert.strictEqual(dre.module, 'contabilidade')
  assert.strictEqual(dre.tab, 'dre')
})

test('Unit - Router: resolveRoute mapeia aliases legados para rotas canônicas', () => {
  const aliasAcc = resolveRoute('accounting-disk')
  assert.strictEqual(aliasAcc.path, '/contabilidade/dashboard')

  const aliasFin = resolveRoute('financial-dashboard')
  assert.strictEqual(aliasFin.path, '/financeiro/dashboard')

  const aliasHash = resolveRoute('#/financeiro/dashboard')
  assert.strictEqual(aliasHash.path, '/financeiro/dashboard')

  const aliasRefunds = resolveRoute('finance-refunds')
  assert.strictEqual(aliasRefunds.path, '/financeiro/estornos')
})

test('Unit - Router: resolveRoute mapeia contexto de evento dinâmico', () => {
  const eventRoute = resolveRoute('/eventos/EVT-999/dashboard')
  assert.strictEqual(eventRoute.path, '/eventos/EVT-999/dashboard')
  assert.strictEqual(eventRoute.context.producer, true)
  assert.strictEqual(eventRoute.context.event, true)
})

test('Unit - Router: evaluateRouteGuards valida segurança e contexto', () => {
  // Configura usuário regular de financeiro
  AppContext.setUser({
    id: 10,
    email: 'finance@produtor.com',
    name: 'Financeiro Alpha',
    role: 'producer-finance',
    producerId: 20
  })

  // Rota permitida para financeiro
  const allowedRoute = AppRouter.resolve('/financeiro/saldos')
  assert.strictEqual(allowedRoute.guardState?.allowed, true)

  // Rota administrativa não permitida
  const blockedRoute = AppRouter.resolve('/admin/usuarios')
  assert.strictEqual(blockedRoute.guardState?.allowed, false)
  assert.strictEqual(blockedRoute.guardState?.blockedReason, 'unauthorized')
})
