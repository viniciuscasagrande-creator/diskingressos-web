/** FASE 25.2 — Motor de Split e Contratos Financeiros */
export const SPLIT_ENGINE_RELEASE = '25.2-split-financial-agreements-2026-09-02' as const

export type PaymentMethodKey = 'cash' | 'pix' | 'debit' | 'credit_single' | 'credit_2_6' | 'credit_7_12' | 'courtesy'
export type FeeBearer = 'customer' | 'producer' | 'platform'
export type SplitParticipantKind = 'producer' | 'platform' | 'coproducer' | 'affiliate' | 'reserve' | 'third_party'

export interface FinancialAgreementRule {
  paymentMethod: PaymentMethodKey
  paymentFeeBps: number
  installmentFeeBps: number
  anticipationFeeBps: number
  serviceFeeBps: number
  serviceFeeBearer: FeeBearer
  anticipationFeeBearer: FeeBearer
  platformShareBps?: number
  reserveBps?: number
  active: boolean
}

export interface AgreementParticipant {
  id: string
  kind: SplitParticipantKind
  shareBps: number
  fixedCents?: number
  destinationRef?: string
}

export interface SplitInput {
  grossTicketCents: number
  serviceFeeCents?: number
  paymentMethod: PaymentMethodKey
  installments?: number
}

export interface SplitAllocation {
  participantId: string
  kind: SplitParticipantKind
  amountCents: number
  destinationRef?: string
}

export interface SplitResult {
  customerTotalCents: number
  grossTicketCents: number
  serviceFeeCents: number
  paymentCostCents: number
  installmentCostCents: number
  anticipationCostCents: number
  producerNetCents: number
  platformRevenueCents: number
  reserveCents: number
  allocations: SplitAllocation[]
  ledgerPreview: { accountCode: string; side: 'debit' | 'credit'; amountCents: number; memo: string }[]
}

const bpsAmount = (base: number, bps: number) => Math.round((base * bps) / 10_000)
const assertBps = (value: number, field: string) => {
  if (!Number.isInteger(value) || value < 0 || value > 10_000) throw new Error(`${field} deve estar entre 0 e 10000 bps.`)
}

export function validateAgreementRule(rule: FinancialAgreementRule): void {
  assertBps(rule.paymentFeeBps, 'paymentFeeBps')
  assertBps(rule.installmentFeeBps, 'installmentFeeBps')
  assertBps(rule.anticipationFeeBps, 'anticipationFeeBps')
  assertBps(rule.serviceFeeBps, 'serviceFeeBps')
  assertBps(rule.platformShareBps ?? 0, 'platformShareBps')
  assertBps(rule.reserveBps ?? 0, 'reserveBps')
}

export function calculateSplit(rule: FinancialAgreementRule, participants: AgreementParticipant[], input: SplitInput): SplitResult {
  validateAgreementRule(rule)
  if (!Number.isInteger(input.grossTicketCents) || input.grossTicketCents < 0) throw new Error('grossTicketCents inválido.')
  if (!rule.active) throw new Error('Regra financeira inativa.')

  const gross = input.grossTicketCents
  const serviceFee = input.serviceFeeCents ?? bpsAmount(gross, rule.serviceFeeBps)
  const paymentCost = bpsAmount(gross, rule.paymentFeeBps)
  const installmentCost = bpsAmount(gross, rule.installmentFeeBps)
  const anticipationCost = bpsAmount(gross, rule.anticipationFeeBps)
  const reserve = bpsAmount(gross, rule.reserveBps ?? 0)
  const platformShare = bpsAmount(gross, rule.platformShareBps ?? 0)

  const producerServiceFee = rule.serviceFeeBearer === 'producer' ? serviceFee : 0
  const producerAnticipation = rule.anticipationFeeBearer === 'producer' ? anticipationCost : 0
  const producerNet = Math.max(0, gross - paymentCost - installmentCost - producerAnticipation - producerServiceFee - reserve - platformShare)
  const platformRevenue = serviceFee + platformShare
  const customerTotal = gross + (rule.serviceFeeBearer === 'customer' ? serviceFee : 0)

  const explicit = participants.filter(p => p.kind !== 'producer')
  const explicitTotal = explicit.reduce((sum, p) => sum + (p.fixedCents ?? bpsAmount(gross, p.shareBps)), 0)
  if (explicitTotal > producerNet) throw new Error('Participações configuradas excedem o líquido disponível do produtor.')

  const allocations: SplitAllocation[] = explicit.map(p => ({
    participantId: p.id,
    kind: p.kind,
    amountCents: p.fixedCents ?? bpsAmount(gross, p.shareBps),
    destinationRef: p.destinationRef,
  }))
  allocations.push({ participantId: participants.find(p => p.kind === 'producer')?.id ?? 'producer', kind: 'producer', amountCents: producerNet - explicitTotal, destinationRef: participants.find(p => p.kind === 'producer')?.destinationRef })
  if (platformRevenue > 0) allocations.push({ participantId: 'platform', kind: 'platform', amountCents: platformRevenue })
  if (reserve > 0) allocations.push({ participantId: 'reserve', kind: 'reserve', amountCents: reserve })

  const gatewayReceivable = customerTotal
  const credits: SplitResult['ledgerPreview'] = []
  const custody = allocations.filter(a => ['producer','coproducer','affiliate'].includes(a.kind)).reduce((s,a)=>s+a.amountCents,0)
  if (custody > 0) credits.push({ accountCode: '2.1.01', side: 'credit', amountCents: custody, memo: 'Recursos de terceiros / produtor' })
  if (reserve > 0) credits.push({ accountCode: '2.1.03', side: 'credit', amountCents: reserve, memo: 'Reserva financeira do produtor' })
  if (platformRevenue > 0) credits.push({ accountCode: '3.1.01', side: 'credit', amountCents: platformRevenue, memo: 'Receita própria da plataforma' })

  const financialCosts = paymentCost + installmentCost + (rule.anticipationFeeBearer === 'platform' ? anticipationCost : 0)
  const debit = gatewayReceivable + financialCosts
  const credit = credits.reduce((s,l)=>s+l.amountCents,0)
  const balancingCost = Math.max(0, debit - credit)
  const ledgerPreview: SplitResult['ledgerPreview'] = [
    { accountCode: '1.1.01', side: 'debit', amountCents: gatewayReceivable, memo: 'Valor a receber do gateway' },
    ...credits,
  ]
  if (financialCosts > 0) ledgerPreview.push({ accountCode: '4.1.01', side: 'debit', amountCents: financialCosts, memo: 'Custos financeiros da transação' })
  if (balancingCost > 0) ledgerPreview.push({ accountCode: '3.1.03', side: 'credit', amountCents: balancingCost, memo: 'Ajuste de composição do split / receita operacional' })

  return {
    customerTotalCents: customerTotal,
    grossTicketCents: gross,
    serviceFeeCents: serviceFee,
    paymentCostCents: paymentCost,
    installmentCostCents: installmentCost,
    anticipationCostCents: anticipationCost,
    producerNetCents: producerNet,
    platformRevenueCents: platformRevenue,
    reserveCents: reserve,
    allocations,
    ledgerPreview,
  }
}

export function selectAgreementVersion<T extends { validFrom: string; validUntil?: string; status: string }>(versions: T[], occurredAt: string): T | undefined {
  const when = new Date(occurredAt).getTime()
  return versions
    .filter(v => v.status === 'active' && new Date(v.validFrom).getTime() <= when && (!v.validUntil || new Date(v.validUntil).getTime() >= when))
    .sort((a,b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime())[0]
}
