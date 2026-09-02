/** FASE 25.1 — Ledger Contábil e Plano de Contas */
export const LEDGER_RELEASE = '25.1-ledger-chart-of-accounts-2026-09-02' as const

export type LedgerAccountNature = 'asset' | 'liability' | 'revenue' | 'expense' | 'equity'
export type LedgerSide = 'debit' | 'credit'
export type LedgerOwnerScope = 'platform' | 'producer' | 'event' | 'order'

export interface ChartAccountDefinition {
  code: string
  name: string
  nature: LedgerAccountNature
  ownerScope: LedgerOwnerScope
  parentCode?: string
  allowsPosting: boolean
}

export const defaultTicketingChartOfAccounts: readonly ChartAccountDefinition[] = [
  { code: '1', name: 'ATIVO', nature: 'asset', ownerScope: 'platform', allowsPosting: false },
  { code: '1.1', name: 'Disponibilidades e Liquidações', nature: 'asset', ownerScope: 'platform', parentCode: '1', allowsPosting: false },
  { code: '1.1.01', name: 'Gateway / Valores a Receber', nature: 'asset', ownerScope: 'platform', parentCode: '1.1', allowsPosting: true },
  { code: '1.1.02', name: 'Conta de Liquidação', nature: 'asset', ownerScope: 'platform', parentCode: '1.1', allowsPosting: true },
  { code: '1.1.03', name: 'Banco Operacional', nature: 'asset', ownerScope: 'platform', parentCode: '1.1', allowsPosting: true },
  { code: '2', name: 'PASSIVO / RECURSOS DE TERCEIROS', nature: 'liability', ownerScope: 'platform', allowsPosting: false },
  { code: '2.1', name: 'Obrigações com Produtores', nature: 'liability', ownerScope: 'producer', parentCode: '2', allowsPosting: false },
  { code: '2.1.01', name: 'Custódia / Valor de Ingressos do Produtor', nature: 'liability', ownerScope: 'producer', parentCode: '2.1', allowsPosting: true },
  { code: '2.1.02', name: 'Repasses a Executar', nature: 'liability', ownerScope: 'producer', parentCode: '2.1', allowsPosting: true },
  { code: '2.1.03', name: 'Reservas Financeiras do Produtor', nature: 'liability', ownerScope: 'producer', parentCode: '2.1', allowsPosting: true },
  { code: '2.1.04', name: 'Estornos e Chargebacks Pendentes', nature: 'liability', ownerScope: 'producer', parentCode: '2.1', allowsPosting: true },
  { code: '3', name: 'RECEITAS DA PLATAFORMA', nature: 'revenue', ownerScope: 'platform', allowsPosting: false },
  { code: '3.1.01', name: 'Taxa de Conveniência / Serviço', nature: 'revenue', ownerScope: 'platform', parentCode: '3', allowsPosting: true },
  { code: '3.1.02', name: 'Receita de Antecipação / Spread', nature: 'revenue', ownerScope: 'platform', parentCode: '3', allowsPosting: true },
  { code: '3.1.03', name: 'Serviços Adicionais', nature: 'revenue', ownerScope: 'platform', parentCode: '3', allowsPosting: true },
  { code: '4', name: 'CUSTOS E DESPESAS', nature: 'expense', ownerScope: 'platform', allowsPosting: false },
  { code: '4.1.01', name: 'MDR / Adquirência', nature: 'expense', ownerScope: 'platform', parentCode: '4', allowsPosting: true },
  { code: '4.1.02', name: 'Gateway / Processamento', nature: 'expense', ownerScope: 'platform', parentCode: '4', allowsPosting: true },
  { code: '4.1.03', name: 'Antifraude', nature: 'expense', ownerScope: 'platform', parentCode: '4', allowsPosting: true },
  { code: '4.1.04', name: 'Custos Bancários / PIX', nature: 'expense', ownerScope: 'platform', parentCode: '4', allowsPosting: true },
  { code: '4.1.05', name: 'Perdas com Chargeback', nature: 'expense', ownerScope: 'platform', parentCode: '4', allowsPosting: true },
] as const

export interface PostLedgerLine {
  accountCode: string
  side: LedgerSide
  amountCents: number
  memo?: string
}

export function assertPostableLines(lines: PostLedgerLine[]): void {
  if (lines.length < 2) throw new Error('Um lote contábil exige pelo menos dois lançamentos.')
  const debit = lines.filter((x) => x.side === 'debit').reduce((s, x) => s + x.amountCents, 0)
  const credit = lines.filter((x) => x.side === 'credit').reduce((s, x) => s + x.amountCents, 0)
  if (lines.some((x) => !Number.isInteger(x.amountCents) || x.amountCents <= 0)) throw new Error('Valores do ledger devem ser inteiros positivos em centavos.')
  if (debit !== credit) throw new Error(`Lote não balanceado: débito=${debit}, crédito=${credit}.`)
}

export function naturalBalanceSign(nature: LedgerAccountNature): 1 | -1 {
  return nature === 'asset' || nature === 'expense' ? 1 : -1
}
