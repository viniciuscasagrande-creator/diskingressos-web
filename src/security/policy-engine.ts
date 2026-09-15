// ==============================================================================
// FASE 29.7 — MOTOR DE POLÍTICAS DE SEGURANÇA (POLICY ENGINE)
// Avaliação de RBAC + ABAC, Segregação de Funções (SoD) e Escopo Hierárquico
// ==============================================================================

import type {
  PolicyEvaluationRequest,
  PolicyEvaluationResult
} from '../types/iam-security.types'

/**
 * Matriz canônica de permissões técnicas por perfil
 */
export const IAM_ROLE_PERMISSIONS: Record<string, string[]> = {
  // Perfis da Plataforma & Disk Interno
  'DEVELOPER_LEAD': ['*'],
  'DEVELOPER_ENGINEER': [
    'developer.*',
    'system.diagnostics',
    'event.read',
    'map.read',
    'order.read',
    'ticket.read',
    'finance.read'
  ],
  'DEVELOPER_OBSERVER': [
    'developer.logs.read',
    'developer.traces.read',
    'developer.health.read',
    'developer.audit.read'
  ],
  'ADMIN_DISK': [
    'admin.*',
    'event.*',
    'map.*',
    'order.*',
    'ticket.*',
    'finance.*',
    'refund.*',
    'courtesy.*',
    'sac.*',
    'marketing.*'
  ],
  'GESTAO_DIRETORIA': [
    'dashboard.executive.read',
    'finance.read',
    'event.read',
    'order.read',
    'reports.all.read',
    'finance.transfer.approve' // Alçada acima de 100k
  ],
  'EVENT_SUPPORT': [
    'event.read',
    'event.create',
    'event.update',
    'event.publish',
    'map.read',
    'map.create',
    'map.update',
    'venue.manage',
    'checklist.manage'
  ],
  'SAC_N1': [
    'customer.read',
    'order.read',
    'ticket.read',
    'ticket.resend',
    'sac.case.manage'
  ],
  'SAC_N2': [
    'customer.read',
    'order.read',
    'ticket.read',
    'ticket.resend',
    'ticket.cancel.request',
    'refund.request',
    'sac.case.manage'
  ],
  'SAC_SUPERVISOR': [
    'customer.read',
    'order.read',
    'ticket.read',
    'ticket.cancel',
    'refund.request',
    'sac.override',
    'sac.case.manage'
  ],
  'FINANCEIRO_OPERADOR': [
    'finance.read',
    'finance.balance.read',
    'finance.transfer.create',
    'finance.bordero.read',
    'refund.request'
  ],
  'FINANCEIRO_ANALISTA': [
    'finance.read',
    'finance.balance.read',
    'finance.transfer.create',
    'finance.transfer.approve', // Até R$ 10.000
    'refund.approve',
    'reconciliation.read'
  ],
  'FINANCEIRO_GESTOR': [
    'finance.read',
    'finance.balance.read',
    'finance.transfer.create',
    'finance.transfer.approve', // Até R$ 100.000
    'refund.approve',
    'refund.execute',
    'reconciliation.manage'
  ],
  'CONTABILIDADE': [
    'accounting.read',
    'accounting.entries.read',
    'accounting.dre.read',
    'reports.accounting.read'
  ],
  'MARKETING': [
    'marketing.read',
    'marketing.campaign.manage',
    'marketing.pixel.manage',
    'marketing.utm.manage',
    'marketing.coupon.manage',
    'event.read'
  ],

  // Perfis do Produtor no Disk
  'PRODUTOR_ADMIN': [
    'event.read',
    'event.create.request',
    'event.update.limited',
    'event.publish.approve',
    'finance.read',
    'finance.transfer.create',
    'marketing.*',
    'reports.producer.read',
    'team.manage'
  ],
  'PRODUTOR_FINANCEIRO': [
    'finance.read',
    'finance.transfer.create',
    'reports.financial.read'
  ],
  'PRODUTOR_MARKETING': [
    'marketing.*',
    'event.read'
  ],
  'PRODUTOR_OPERACAO': [
    'event.read',
    'ticket.read',
    'access.read',
    'participants.read'
  ]
}

export const PolicyEngine = {
  /**
   * Avaliação principal de RBAC + ABAC + SoD
   */
  evaluate(req: PolicyEvaluationRequest): PolicyEvaluationResult {
    const { subject, action, resource, context } = req

    // 1. Coleta todas as permissões concedidas aos papéis do sujeito
    const grantedPermissions = new Set<string>()
    for (const role of subject.roles) {
      const perms = IAM_ROLE_PERMISSIONS[role] || []
      for (const p of perms) {
        grantedPermissions.add(p)
      }
    }

    const hasWildcard = grantedPermissions.has('*')

    // 2. Validação da Permissão Básica (RBAC)
    const hasPermission =
      hasWildcard ||
      grantedPermissions.has(action) ||
      Array.from(grantedPermissions).some((p) => {
        if (p.endsWith('.*')) {
          const prefix = p.slice(0, -2)
          return action.startsWith(prefix)
        }
        return false
      })

    if (!hasPermission) {
      return {
        allowed: false,
        code: 'DENY_MISSING_PERMISSION',
        reason: `Acesso negado: o usuário não possui a permissão técnica '${action}'.`
      }
    }

    // 3. Validação de Escopo de Evento (ABAC)
    // Se o recurso pertence a um evento e o usuário possui restrição de eventos
    if (resource.eventId && subject.allowedEvents && subject.allowedEvents.length > 0) {
      const hasAccessToAll = subject.allowedEvents.includes('*')
      const hasAccessToEvent = subject.allowedEvents.includes(resource.eventId)

      if (!hasAccessToAll && !hasAccessToEvent) {
        return {
          allowed: false,
          code: 'DENY_EVENT_SCOPE',
          reason: `Acesso negado: o usuário não possui autorização para operar sobre o evento '${resource.eventId}'.`
        }
      }
    }

    // 4. Segregação de Funções (SoD — Maker × Checker)
    // O criador de uma transferência/estorno/operação não pode aprová-la
    const isApprovalAction =
      action.includes('.approve') ||
      action.includes('.execute') ||
      action === 'finance.transfer.approve' ||
      action === 'refund.approve'

    if (isApprovalAction && resource.creatorUserId && resource.creatorUserId === subject.userId) {
      return {
        allowed: false,
        code: 'DENY_SOD_MAKER_CHECKER',
        reason: 'Segregação de Funções (SoD): o criador da solicitação não pode aprovar a própria operação (creator != approver).'
      }
    }

    // 5. Alçada de Limites Financeiros (ABAC)
    if (action === 'finance.transfer.approve' && typeof resource.amount === 'number') {
      const isLeadOrAdmin =
        subject.roles.includes('DEVELOPER_LEAD') ||
        subject.roles.includes('ADMIN_DISK') ||
        subject.roles.includes('GESTAO_DIRETORIA')

      const isGestor = subject.roles.includes('FINANCEIRO_GESTOR')
      const isAnalista = subject.roles.includes('FINANCEIRO_ANALISTA')

      if (resource.amount > 100_000 && !isLeadOrAdmin) {
        return {
          allowed: false,
          code: 'DENY_FINANCIAL_LIMIT_EXCEEDED',
          reason: `Alçada financeira excedida: transferências acima de R$ 100.000,00 exigem aprovação da Diretoria.`
        }
      }

      if (resource.amount > 10_000 && isAnalista && !isGestor && !isLeadOrAdmin) {
        return {
          allowed: false,
          code: 'DENY_FINANCIAL_LIMIT_EXCEEDED',
          reason: `Alçada financeira excedida: Analista Financeiro possui teto de R$ 10.000,00. Valores superiores requerem Gestor Financeiro.`
        }
      }
    }

    // 6. Proteção de Alteração de Mapa Pós-Vendas
    if (action === 'map.update' && resource.hasSoldTickets) {
      const hasAfterSalesPerm = grantedPermissions.has('map.update_after_sales') || hasWildcard
      if (!hasAfterSalesPerm) {
        return {
          allowed: false,
          code: 'DENY_MAP_AFTER_SALES',
          reason: 'Proteção contra Overbooking: o evento já possui ingressos vendidos. É necessária a permissão especial map.update_after_sales.'
        }
      }
    }

    // 7. Exigência de MFA para Operações Críticas
    const isCriticalStepUp =
      (action === 'finance.transfer.approve' && (resource.amount ?? 0) > 100_000) ||
      action.startsWith('developer.emergency_') ||
      action === 'system.break_glass'

    if (isCriticalStepUp && context && !context.mfaVerified) {
      return {
        allowed: false,
        code: 'DENY_MFA_REQUIRED',
        reason: 'Esta operação crítica exige verificação em duas etapas (MFA / Step-Up).',
        requiredAction: 'REQUEST_MFA'
      }
    }

    // Tudo satisfeito: ALLOW
    return {
      allowed: true,
      code: 'ALLOW',
      reason: 'Acesso autorizado pelo Policy Engine.'
    }
  },

  /**
   * Sanitizador de Logs: Garante que senhas, tokens, PAN e CVV nunca sejam expostos
   */
  sanitizeLog<T extends Record<string, any>>(data: T): T {
    if (!data || typeof data !== 'object') return data

    const SENSITIVE_KEYS = [
      'password',
      'senha',
      'secret',
      'cvv',
      'cardnumber',
      'cartao',
      'authorization',
      'token',
      'apikey',
      'privatekey'
    ]

    const copy: any = Array.isArray(data) ? [...data] : { ...data }

    for (const key of Object.keys(copy)) {
      const lowerKey = key.toLowerCase()
      const isSensitive = SENSITIVE_KEYS.some((s) => lowerKey.includes(s))

      if (isSensitive && typeof copy[key] === 'string') {
        copy[key] = '*** MASCARADO PELO LOG SANITIZER ***'
      } else if (typeof copy[key] === 'object' && copy[key] !== null) {
        copy[key] = this.sanitizeLog(copy[key])
      }
    }

    return copy
  }
}
