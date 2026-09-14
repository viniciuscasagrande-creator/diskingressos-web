import test from 'node:test'
import assert from 'node:assert'
import { MenuStateManager } from '../../src/navigation/menu-state'
import { resolveRoute } from '../../src/navigation/routes'

test('Unit - MenuStateManager: sync armazena rota ativa e notifica listeners', () => {
  let notifiedPath: string | null = null
  const unsub = MenuStateManager.subscribe((route) => {
    notifiedPath = route.path
  })

  const routeMkt = resolveRoute('/marketing/dashboard')
  MenuStateManager.sync(routeMkt)
  assert.strictEqual(MenuStateManager._currentRoute?.path, '/marketing/dashboard')
  assert.strictEqual(notifiedPath, '/marketing/dashboard')

  const routeDre = resolveRoute('/contabilidade/dre')
  MenuStateManager.sync(routeDre)
  assert.strictEqual(MenuStateManager._currentRoute?.path, '/contabilidade/dre')
  assert.strictEqual(notifiedPath, '/contabilidade/dre')

  unsub()
})
