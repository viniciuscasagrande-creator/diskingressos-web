import test from 'node:test'
import assert from 'node:assert'
import { AppContext } from '../../src/context/app-context'

test('Unit - AppContext: inicialização e restrição de produtor regular', () => {
  AppContext.setUser({
    id: 5,
    name: 'Produtor Beta',
    email: 'beta@produtora.com',
    role: 'producer-marketing',
    producerId: 40
  })

  const state = AppContext.getState()
  assert.strictEqual(state.producerId, 40)
  assert.strictEqual(state.eventId, null)
})

test('Unit - AppContext: tentativa de IDOR por usuário regular é rejeitada', () => {
  AppContext.setUser({
    id: 5,
    name: 'Produtor Beta',
    email: 'beta@produtora.com',
    role: 'producer-marketing',
    producerId: 40
  })

  // Tentativa de trocar para produtora 99
  const success = AppContext.setProducer(99)
  assert.strictEqual(success, false)
  // Permanece restrito à produtora 40
  assert.strictEqual(AppContext.getState().producerId, 40)

  // Verifica log de auditoria
  const logs = AppContext.getAuditLogs()
  const idorLog = logs.find((l) => l.action === 'CONTEXT_ACCESS_DENIED')
  assert.ok(idorLog)
})

test('Unit - AppContext: troca de produtora limpa evento obrigatoriamente', () => {
  // Usuário admin
  AppContext.setUser({
    id: 1,
    name: 'Admin Master',
    email: 'admin@diskingressos.com.br',
    role: 'admin-master',
    producerId: null
  })

  AppContext.setProducer(10, 'Produtora Alpha')
  AppContext.setEvent(101, 'Show Festival', 10)

  assert.strictEqual(AppContext.getState().producerId, 10)
  assert.strictEqual(AppContext.getState().eventId, 101)

  // Troca para produtora 20
  AppContext.setProducer(20, 'Produtora Beta')

  // REGRA SUPREMA: Ao trocar de produtor, limpa obrigatoriamente o evento!
  assert.strictEqual(AppContext.getState().producerId, 20)
  assert.strictEqual(AppContext.getState().eventId, null)
})

test('Unit - AppContext: setEvent valida pertencimento de produtora', () => {
  AppContext.setUser({
    id: 1,
    name: 'Admin Master',
    email: 'admin@diskingressos.com.br',
    role: 'admin-master',
    producerId: null
  })

  AppContext.setProducer(10, 'Produtora Alpha')

  // Tentar atribuir evento pertencente à produtora 99 enquanto context = 10
  const success = AppContext.setEvent(999, 'Evento de Terceiro', 99)
  assert.strictEqual(success, false)
  assert.strictEqual(AppContext.getState().eventId, null)
})
