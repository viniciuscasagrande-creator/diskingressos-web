import { describe, it, expect } from 'vitest'
import { PolicyEngine } from '../../src/security/policy-engine'

describe('Fase 29.7 — Policy Engine & SoD (Maker × Checker)', () => {
  it('1. RBAC: Deve permitir ação para papel autorizado e negar para papel sem permissão', () => {
    // Suporte a Eventos possui event.publish
    const allowRes = PolicyEngine.evaluate({
      subject: { userId: 'usr-1', roles: ['EVENT_SUPPORT'], organizationId: 'org-disk' },
      action: 'event.publish',
      resource: { type: 'EVENT', id: 'EVT-100' }
    })
    expect(allowRes.allowed).toBe(true)
    expect(allowRes.code).toBe('ALLOW')

    // Marketing NÃO possui event.publish
    const denyRes = PolicyEngine.evaluate({
      subject: { userId: 'usr-2', roles: ['MARKETING'], organizationId: 'org-disk' },
      action: 'event.publish',
      resource: { type: 'EVENT', id: 'EVT-100' }
    })
    expect(denyRes.allowed).toBe(false)
    expect(denyRes.code).toBe('DENY_MISSING_PERMISSION')
  })

  it('2. ABAC: Deve bloquear acesso fora do escopo de eventos autorizados', () => {
    // Maria tem acesso apenas a EVT-100 e EVT-102
    const subject = {
      userId: 'usr-maria',
      roles: ['PRODUTOR_MARKETING'],
      organizationId: 'org-prod',
      allowedEvents: ['EVT-100', 'EVT-102']
    }

    // Acesso a EVT-100: Permitido
    const resAllowed = PolicyEngine.evaluate({
      subject,
      action: 'marketing.read',
      resource: { type: 'EVENT', id: 'EVT-100', eventId: 'EVT-100' }
    })
    expect(resAllowed.allowed).toBe(true)

    // Acesso a EVT-101: Negado por escopo
    const resDenied = PolicyEngine.evaluate({
      subject,
      action: 'marketing.read',
      resource: { type: 'EVENT', id: 'EVT-101', eventId: 'EVT-101' }
    })
    expect(resDenied.allowed).toBe(false)
    expect(resDenied.code).toBe('DENY_EVENT_SCOPE')
  })

  it('3. SoD (Maker × Checker): Criador da solicitação NÃO pode aprovar a própria operação', () => {
    const approver = {
      userId: 'usr-carlos',
      roles: ['FINANCEIRO_GESTOR'],
      organizationId: 'org-disk'
    }

    // Caso 1: Carlos criou a transferência de R$ 50.000 e tenta aprovar
    const selfApprovalRes = PolicyEngine.evaluate({
      subject: approver,
      action: 'finance.transfer.approve',
      resource: {
        type: 'TRANSFER',
        id: 'TRF-901',
        amount: 50_000,
        creatorUserId: 'usr-carlos' // Mesmo usuário!
      }
    })
    expect(selfApprovalRes.allowed).toBe(false)
    expect(selfApprovalRes.code).toBe('DENY_SOD_MAKER_CHECKER')

    // Caso 2: Maria criou a transferência de R$ 50.000 e Carlos aprova
    const validApprovalRes = PolicyEngine.evaluate({
      subject: approver,
      action: 'finance.transfer.approve',
      resource: {
        type: 'TRANSFER',
        id: 'TRF-901',
        amount: 50_000,
        creatorUserId: 'usr-maria' // Criador diferente!
      }
    })
    expect(validApprovalRes.allowed).toBe(true)
    expect(validApprovalRes.code).toBe('ALLOW')
  })

  it('4. Limites Financeiros: Deve respeitar as alçadas de R$ 10k (Analista) e R$ 100k (Gestor)', () => {
    const analista = { userId: 'usr-an', roles: ['FINANCEIRO_ANALISTA'], organizationId: 'org-disk' }
    const gestor = { userId: 'usr-ge', roles: ['FINANCEIRO_GESTOR'], organizationId: 'org-disk' }

    // R$ 8.000: Analista pode aprovar
    const res8k = PolicyEngine.evaluate({
      subject: analista,
      action: 'finance.transfer.approve',
      resource: { type: 'TRANSFER', id: 'T1', amount: 8_000, creatorUserId: 'usr-other' }
    })
    expect(res8k.allowed).toBe(true)

    // R$ 25.000: Analista é bloqueado por limite
    const res25kAnalista = PolicyEngine.evaluate({
      subject: analista,
      action: 'finance.transfer.approve',
      resource: { type: 'TRANSFER', id: 'T2', amount: 25_000, creatorUserId: 'usr-other' }
    })
    expect(res25kAnalista.allowed).toBe(false)
    expect(res25kAnalista.code).toBe('DENY_FINANCIAL_LIMIT_EXCEEDED')

    // R$ 25.000: Gestor pode aprovar
    const res25kGestor = PolicyEngine.evaluate({
      subject: gestor,
      action: 'finance.transfer.approve',
      resource: { type: 'TRANSFER', id: 'T2', amount: 25_000, creatorUserId: 'usr-other' }
    })
    expect(res25kGestor.allowed).toBe(true)

    // R$ 150.000: Gestor é bloqueado (acima de R$ 100k exige Diretoria)
    const res150k = PolicyEngine.evaluate({
      subject: gestor,
      action: 'finance.transfer.approve',
      resource: { type: 'TRANSFER', id: 'T3', amount: 150_000, creatorUserId: 'usr-other' }
    })
    expect(res150k.allowed).toBe(false)
    expect(res150k.code).toBe('DENY_FINANCIAL_LIMIT_EXCEEDED')
  })

  it('5. Proteção de Mapa Pós-Vendas: Exige permissão especial map.update_after_sales', () => {
    const supportAnalyst = { userId: 'usr-sp', roles: ['EVENT_SUPPORT'], organizationId: 'org-disk' }

    // Evento com ingressos vendidos tentando update sem a permissão after_sales
    const res = PolicyEngine.evaluate({
      subject: supportAnalyst,
      action: 'map.update',
      resource: { type: 'MAP', id: 'MAP-1', hasSoldTickets: true }
    })
    expect(res.allowed).toBe(false)
    expect(res.code).toBe('DENY_MAP_AFTER_SALES')
  })

  it('6. Log Sanitizer: Deve mascarar senhas, tokens e dados sensíveis recursivamente', () => {
    const rawPayload = {
      user: 'joao',
      password: 'mypassword123',
      nested: {
        cvv: '123',
        cardNumber: '4111222233334444',
        authorization: 'Bearer eyJhbGciOiJIUzI1Ni...',
        safeField: 'Valor seguro'
      }
    }

    const sanitized = PolicyEngine.sanitizeLog(rawPayload)
    expect(sanitized.password).toBe('*** MASCARADO PELO LOG SANITIZER ***')
    expect(sanitized.nested.cvv).toBe('*** MASCARADO PELO LOG SANITIZER ***')
    expect(sanitized.nested.cardNumber).toBe('*** MASCARADO PELO LOG SANITIZER ***')
    expect(sanitized.nested.authorization).toBe('*** MASCARADO PELO LOG SANITIZER ***')
    expect(sanitized.nested.safeField).toBe('Valor seguro')
  })
})
