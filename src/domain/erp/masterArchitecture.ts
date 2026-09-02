/** FASE 25.0 — Arquitetura Mestre ERP + CRM + Financeiro + Produtor */
export const ERP_ARCHITECTURE_RELEASE = '25.0-master-erp-crm-finance-producer-2026-09-02' as const

export type ActorRole =
  | 'super_admin'
  | 'finance_admin'
  | 'accounting'
  | 'sac'
  | 'producer_owner'
  | 'producer_finance'
  | 'producer_operator'
  | 'auditor'

export type FinancialScope = 'platform' | 'producer' | 'event' | 'order'
export type LedgerNature = 'asset' | 'liability' | 'revenue' | 'expense' | 'equity'
export type EntrySide = 'debit' | 'credit'

export interface FinancialContext {
  tenantId: string
  producerId?: string
  eventId?: string
  orderId?: string
  transactionId?: string
}

export interface FinancialAgreementVersion extends FinancialContext {
  id: string
  version: number
  validFrom: string
  validUntil?: string
  status: 'draft' | 'pending_approval' | 'active' | 'superseded' | 'cancelled'
  rules: Record<string, unknown>
  approvedBy?: string
}

export interface LedgerEntry extends FinancialContext {
  id: string
  batchId: string
  accountCode: string
  side: EntrySide
  amountCents: number
  currency: 'BRL'
  occurredAt: string
  sourceType: string
  sourceId: string
  reversalOfEntryId?: string
}

export interface LedgerBatch extends FinancialContext {
  id: string
  description: string
  entries: LedgerEntry[]
  createdBy: string
  createdAt: string
  reversalOfBatchId?: string
}

export const permissionMatrix: Record<ActorRole, readonly string[]> = {
  super_admin: ['*'],
  finance_admin: ['finance.read_all','agreement.manage','payout.approve','refund.approve','ledger.adjust','reconciliation.manage'],
  accounting: ['finance.read_all','ledger.read','ledger.adjust','closing.manage','tax.read','reports.corporate'],
  sac: ['customer.read','order.read','ticket.read','finance.read_order','refund.request'],
  producer_owner: ['producer.read_own','event.read_own','finance.read_own','payout.request','bank_account.manage_own','agreement.request_change'],
  producer_finance: ['finance.read_own','payout.request','reports.read_own'],
  producer_operator: ['event.read_own','sales.read_own'],
  auditor: ['finance.read_all','ledger.read','audit.read']
}

export function assertBalancedBatch(batch: LedgerBatch): void {
  const debit = batch.entries.filter(e => e.side === 'debit').reduce((s,e) => s + e.amountCents, 0)
  const credit = batch.entries.filter(e => e.side === 'credit').reduce((s,e) => s + e.amountCents, 0)
  if (debit !== credit) throw new Error(`Ledger batch ${batch.id} não balanceado: débito=${debit}, crédito=${credit}`)
  if (batch.entries.some(e => e.amountCents <= 0)) throw new Error('Ledger não aceita lançamento com valor zero/negativo; use lado e reversão.')
}

export function can(role: ActorRole, permission: string): boolean {
  const grants = permissionMatrix[role]
  return grants.includes('*') || grants.includes(permission)
}

// Fase 25.1 acoplada à arquitetura mestre sem alterar as telas homologadas.
export const ERP_LEDGER_PHASE = 'Ledger Contábil e Plano de Contas' as const

// Fase 25.2: contrato financeiro versionado e motor de split acoplados ao Ledger.
export const ERP_SPLIT_PHASE = 'Motor de Split e Contratos Financeiros' as const
export const ERP_FINANCE_RELEASE_25_2 = '25.2-split-financial-agreements-2026-09-02' as const
