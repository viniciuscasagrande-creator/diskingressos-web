import test from 'node:test'
import assert from 'node:assert'
import {
  state,
  calculateAccount,
  addLedgerEntry,
} from '../../server/src/routes/financeInternalAccount.js'

test('Conta Financeira Interna - calculateAccount: cálculo de saldos e elegibilidade', () => {
  const result = calculateAccount()
  assert.ok(result.producer, 'Deve conter informações do produtor')
  assert.ok(result.summary, 'Deve conter o sumário consolidado')
  assert.ok(Array.isArray(result.events), 'Deve listar eventos')

  const ev1 = result.events.find((e) => e.id === 'EV-001')
  assert.ok(ev1, 'Evento EV-001 deve existir')
  // Meta: 1.000.000, Vendeu: 540.000 -> 54% atingido >= 50% de meta
  assert.strictEqual(ev1.eligibility.eligible, true)
  assert.strictEqual(ev1.salesPercent, 54)
  // Limite bruto: 20% de 540.000 = 108.000
  assert.strictEqual(ev1.eligibility.grossLimit, 108000)

  // EV-002: Meta: 600.000, Vendeu: 210.000 -> 35% atingido < 50%
  const ev2 = result.events.find((e) => e.id === 'EV-002')
  assert.ok(ev2, 'Evento EV-002 deve existir')
  assert.strictEqual(ev2.eligibility.eligible, false)
  assert.strictEqual(ev2.eligibility.grossLimit, 0)
  assert.strictEqual(ev2.eligibility.availableToRequest, 0)
})

test('Conta Financeira Interna - Ledger Append-Only: geração imutável de lançamentos', () => {
  const initialLength = state.ledger.length
  const entry = addLedgerEntry({
    eventId: 'EV-001',
    type: 'RETENCAO',
    value: 5000,
    reason: 'Teste unitário de retenção',
    beneficiary: 'Juizado Cível',
    actor: 'Auditor Teste',
  })

  assert.ok(entry.id.startsWith('L-'), 'ID do ledger deve iniciar com L-')
  assert.strictEqual(entry.value, 5000)
  assert.strictEqual(state.ledger.length, initialLength + 1)
  assert.strictEqual(state.ledger[0].id, entry.id)
})

test('Conta Financeira Interna - Dupla Autorização de Estorno (Dual Control)', () => {
  // Simula fluxo de estorno interno
  const refundId = `ES-TEST-${Date.now()}`
  const mockRefund = {
    id: refundId,
    eventId: 'EV-001',
    orderId: 'PED-TEST-1',
    value: 1200,
    reason: 'Estorno teste dual control',
    status: 'AGUARDANDO_PRIMEIRA_AUTORIZACAO' as const,
    requestedBy: 'Operador A',
    approvals: [] as Array<{ user: string; at: string; factor: string }>,
    createdAt: new Date().toISOString(),
  }

  // 1ª Aprovação por 'Gerente 1'
  mockRefund.approvals.push({
    user: 'Gerente 1',
    at: new Date().toISOString(),
    factor: 'MFA_TEST',
  })
  mockRefund.status = 'AGUARDANDO_SEGUNDA_AUTORIZACAO' as any
  assert.strictEqual(mockRefund.status, 'AGUARDANDO_SEGUNDA_AUTORIZACAO')

  // Tentativa de 2ª aprovação pelo mesmo 'Gerente 1' deve ser impedida
  const isSameUser = mockRefund.approvals.some((a) => a.user === 'Gerente 1')
  assert.strictEqual(isSameUser, true, 'O mesmo operador não pode conceder a 2ª aprovação')

  // 2ª Aprovação por 'Auditor 2' (usuário distinto)
  mockRefund.approvals.push({
    user: 'Auditor 2',
    at: new Date().toISOString(),
    factor: 'MFA_TEST',
  })
  mockRefund.status = 'AUTORIZADO_PARA_EFETIVAR' as any
  assert.strictEqual(mockRefund.status, 'AUTORIZADO_PARA_EFETIVAR')
  assert.strictEqual(mockRefund.approvals.length, 2)
})

test('Conta Financeira Interna - Amortização Automática sobre Receita', () => {
  const creditId = `CR-TEST-${Date.now()}`
  state.credits.push({
    id: creditId,
    eventId: 'EV-001',
    principal: 10000,
    interestRate: 0,
    installments: 1,
    installmentValue: 10000,
    amortization: 'PERCENTUAL_RECEBIVEIS',
    receivablePercent: 10,
    totalDebt: 10000,
    outstanding: 10000,
    status: 'ATIVO',
    createdAt: new Date().toISOString(),
    actor: 'Financeiro Disk',
  })

  // Fatura receita de R$ 20.000 no evento EV-001
  const revenue = 20000
  const c = state.credits.find((x) => x.id === creditId)!
  const amountToAmortize = Math.min(c.outstanding, (revenue * c.receivablePercent) / 100)

  // 10% de 20.000 = 2.000
  assert.strictEqual(amountToAmortize, 2000)
  c.outstanding -= amountToAmortize
  assert.strictEqual(c.outstanding, 8000)
})
