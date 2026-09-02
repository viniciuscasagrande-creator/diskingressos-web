export type RefundEligibilityInput = {
  amountCents: number
  kind: string
  status: string
  method: string
  requestedBy?: string | null
  approvedBy?: string | null
}

export type RefundEligibilityResult = {
  eligible: boolean
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  requiredApprovals: number
  checks: Array<{ key: string; label: string; status: 'ok' | 'warning' | 'blocked'; detail: string }>
  blockingReasons: string[]
}

export function requiredApprovalLevels(amountCents: number) {
  if (amountCents >= 500000) return 3
  if (amountCents >= 100000) return 2
  return 1
}

export function evaluateRefundEligibility(input: RefundEligibilityInput): RefundEligibilityResult {
  const blockingReasons: string[] = []
  const mutable = ['solicitado', 'requested', 'under_review', 'aprovado', 'approved']
  if (!mutable.includes(input.status)) blockingReasons.push('Solicitação fora da etapa elegível para nova aprovação.')
  if (input.amountCents <= 0) blockingReasons.push('Valor de estorno inválido.')
  const approvals = requiredApprovalLevels(input.amountCents)
  const riskLevel = input.amountCents >= 500000 ? 'critical' : input.amountCents >= 100000 ? 'high' : input.kind === 'parcial' ? 'medium' : 'low'
  return {
    eligible: blockingReasons.length === 0,
    riskLevel,
    requiredApprovals: approvals,
    blockingReasons,
    checks: [
      { key: 'status', label: 'Etapa do workflow', status: mutable.includes(input.status) ? 'ok' : 'blocked', detail: input.status },
      { key: 'amount', label: 'Valor solicitado', status: input.amountCents > 0 ? 'ok' : 'blocked', detail: `${input.amountCents} centavos` },
      { key: 'kind', label: 'Modalidade', status: input.kind === 'parcial' ? 'warning' : 'ok', detail: input.kind },
      { key: 'method', label: 'Meio de pagamento', status: 'ok', detail: input.method },
      { key: 'segregation', label: 'Segregação de função', status: input.requestedBy && input.approvedBy === input.requestedBy ? 'warning' : 'ok', detail: 'Solicitante e aprovador devem ser distintos em alçadas críticas.' }
    ]
  }
}

export function buildReversalPlan(refund: { code: string; orderCode: string; amountCents: number; kind: string; producerId: number; eventId?: number | null }) {
  return {
    strategy: 'compensating_entries',
    immutableLedger: true,
    refundCode: refund.code,
    orderCode: refund.orderCode,
    amountCents: refund.amountCents,
    steps: [
      { order: 1, action: 'lock_exposure', label: 'Bloquear exposição financeira do valor em análise' },
      { order: 2, action: 'reverse_split', label: 'Calcular reversão proporcional do split original' },
      { order: 3, action: 'consume_reserve', label: 'Consumir reserva elegível antes de gerar saldo negativo' },
      { order: 4, action: 'gateway_refund', label: 'Executar estorno no gateway/adquirente com idempotência' },
      { order: 5, action: 'ledger_compensation', label: 'Gerar lançamentos compensatórios no ledger; nunca editar saldo' },
      { order: 6, action: 'reconcile', label: 'Conciliar retorno do provedor e atualizar conta gráfica' },
      { order: 7, action: 'audit', label: 'Fechar trilha de auditoria e protocolo SAC' }
    ]
  }
}
