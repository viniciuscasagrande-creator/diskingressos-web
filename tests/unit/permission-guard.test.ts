import test from 'node:test'
import assert from 'node:assert'
import { PermissionGuard } from '../../src/security/permission-guard'
import { resolveRoute } from '../../src/navigation/routes'

test('Unit - PermissionGuard: Administrador Global tem acesso total', () => {
  const adminUser = {
    id: 1,
    name: 'Admin',
    email: 'admin@diskingressos.com.br',
    role: 'admin' as const
  }

  assert.strictEqual(PermissionGuard.hasPermission(adminUser, 'admin.usuarios'), true)
  assert.strictEqual(PermissionGuard.hasPermission(adminUser, 'financeiro.transferencias.criar'), true)
  assert.strictEqual(PermissionGuard.hasPermission(adminUser, 'contabilidade.fechamento'), true)

  const adminRoute = resolveRoute('/admin/usuarios')
  const check = PermissionGuard.checkRoute(adminRoute, adminUser)
  assert.strictEqual(check.allowed, true)
})

test('Unit - PermissionGuard: Produtor Financeiro tem acesso restrito ao financeiro e contábil', () => {
  const finUser = {
    id: 12,
    name: 'Financeiro',
    email: 'fin@produtora.com',
    role: 'producer-finance' as const,
    producerId: 20
  }

  assert.strictEqual(PermissionGuard.hasPermission(finUser, 'financeiro.visualizar'), true)
  assert.strictEqual(PermissionGuard.hasPermission(finUser, 'contabilidade.visualizar'), true)
  assert.strictEqual(PermissionGuard.hasPermission(finUser, 'marketing.pixels.gerenciar'), false)
  assert.strictEqual(PermissionGuard.hasPermission(finUser, 'sac.tickets.responder'), false)
  assert.strictEqual(PermissionGuard.hasPermission(finUser, 'admin.usuarios'), false)

  const mktRoute = resolveRoute('/marketing/pixels')
  const checkMkt = PermissionGuard.checkRoute(mktRoute, finUser)
  assert.strictEqual(checkMkt.allowed, false)
})

test('Unit - PermissionGuard: Produtor Marketing tem acesso ao marketing e bloqueio a financeiro/admin', () => {
  const mktUser = {
    id: 15,
    name: 'Marketing',
    email: 'mkt@produtora.com',
    role: 'producer-marketing' as const,
    producerId: 30
  }

  assert.strictEqual(PermissionGuard.hasPermission(mktUser, 'marketing.visualizar'), true)
  assert.strictEqual(PermissionGuard.hasPermission(mktUser, 'marketing.pixels.gerenciar'), true)
  assert.strictEqual(PermissionGuard.hasPermission(mktUser, 'financeiro.transferencias.criar'), false)
  assert.strictEqual(PermissionGuard.hasPermission(mktUser, 'contabilidade.fechamento'), false)
})
