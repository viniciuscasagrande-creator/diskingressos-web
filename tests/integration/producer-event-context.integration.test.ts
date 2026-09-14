import test from 'node:test'
import assert from 'node:assert'
import { AppContext } from '../../src/context/app-context'
import { AppRouter } from '../../src/navigation/router'

test('Integration - Contexto Produtor/Evento: Ciclo completo com bloqueio de acesso cruzado', () => {
  // 1. Login como Produtor A (Produtora #1)
  AppContext.setUser({
    id: 101,
    name: 'Produtor Alpha',
    email: 'alpha@produtora.com',
    role: 'producer-finance',
    producerId: 1
  })

  // Produtor A seleciona seu próprio evento (#10)
  const setEventSuccess = AppContext.setEvent(10, 'Show Alpha', 1)
  assert.strictEqual(setEventSuccess, true)
  assert.strictEqual(AppContext.getState().producerId, 1)
  assert.strictEqual(AppContext.getState().eventId, 10)

  // 2. Tentativa de IDOR: Produtor A tenta selecionar evento pertencente ao Produtor B (#2)
  const idorEventAttempt = AppContext.setEvent(20, 'Show Beta Invasão', 2)
  assert.strictEqual(idorEventAttempt, false)
  // O evento ativo NÃO é alterado para o evento do terceiro
  assert.strictEqual(AppContext.getState().eventId, 10)

  // 3. Tentativa de IDOR: Produtor A tenta alterar seu producerId para Produtor B (#2)
  const idorProducerAttempt = AppContext.setProducer(2)
  assert.strictEqual(idorProducerAttempt, false)
  assert.strictEqual(AppContext.getState().producerId, 1)

  // 4. Logout limpa completamente o contexto
  AppContext.setUser(null)
  assert.strictEqual(AppContext.getState().user, null)
  assert.strictEqual(AppContext.getState().producerId, null)
  assert.strictEqual(AppContext.getState().eventId, null)
})
