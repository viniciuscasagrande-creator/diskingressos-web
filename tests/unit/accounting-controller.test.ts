import test from 'node:test'
import assert from 'node:assert'
import { AccountingController, switchAccountingTab } from '../../src/accounting/accounting-controller'
import { normalizeAccountingTab } from '../../src/navigation/accounting-routes'

test('Unit - AccountingController: normaliza abas canônicas e legadas', () => {
  assert.strictEqual(normalizeAccountingTab('dashboard'), 'dashboard')
  assert.strictEqual(normalizeAccountingTab('dre'), 'dre')
  assert.strictEqual(normalizeAccountingTab('balanco'), 'balanco')
  assert.strictEqual(normalizeAccountingTab('balance-sheet'), 'balanco')
  assert.strictEqual(normalizeAccountingTab('plano-de-contas'), 'plano-de-contas')
  assert.strictEqual(normalizeAccountingTab('chart'), 'plano-de-contas')
  assert.strictEqual(normalizeAccountingTab('lancamentos'), 'lancamentos')
  assert.strictEqual(normalizeAccountingTab('entries'), 'lancamentos')
  assert.strictEqual(normalizeAccountingTab('fiscal'), 'fiscal')
  assert.strictEqual(normalizeAccountingTab('sped'), 'fiscal')
})

test('Unit - AccountingController: ativa abas e dispara listeners', () => {
  let activeFromListener = ''
  const unsub = AccountingController.subscribe((tab) => {
    activeFromListener = tab
  })

  AccountingController.activateTab('conciliacao', { skipRouter: true })
  assert.strictEqual(AccountingController.getCurrentTab(), 'conciliacao')
  assert.strictEqual(activeFromListener, 'conciliacao')

  AccountingController.activateTab('fechamento', { skipRouter: true })
  assert.strictEqual(AccountingController.getCurrentTab(), 'fechamento')
  assert.strictEqual(activeFromListener, 'fechamento')

  unsub()
})
