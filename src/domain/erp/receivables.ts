/** Fase 25.4 — Recebíveis, Liquidação e Agenda Financeira */
export const RECEIVABLES_RELEASE = '25.4-receivables-settlement-agenda-2026-09-02'
export type ReceivableLifecycleStatus = 'captured'|'scheduled'|'pending_settlement'|'settled'|'reconciled'|'advanced'|'reversed'|'chargeback'
export type SettlementRail = 'credit_card'|'debit_card'|'pix'|'boleto'|'bank_transfer'|'other'
export interface ReceivableLedgerLink { receivableId:string; transactionId:string; ledgerBatchId:string; producerId:string; eventId?:string; grossCents:number; feeCents:number; netCents:number; expectedAt:string; settledAt?:string; status:ReceivableLifecycleStatus }
export interface SettlementAgendaBucket { bucket:'D+0'|'D+7'|'D+15'|'D+30'|'D+60'; grossCents:number; feeCents:number; netCents:number; itemCount:number }
export const assertReceivableAmounts=(grossCents:number,feeCents:number,netCents:number)=>{ if(!Number.isInteger(grossCents)||!Number.isInteger(feeCents)||!Number.isInteger(netCents)) throw new Error('Valores de recebíveis devem ser inteiros em centavos.'); if(grossCents-feeCents!==netCents) throw new Error('Recebível inconsistente: bruto - taxas deve ser igual ao líquido.'); return true }
