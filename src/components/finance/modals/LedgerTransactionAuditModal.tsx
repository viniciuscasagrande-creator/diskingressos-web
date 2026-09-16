import React from 'react'
import {
  X,
  ShieldCheck,
  FileText,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2
} from 'lucide-react'
import type { FinancialLedgerEntry } from '../../../types/finance-accounting-core.types'

interface LedgerTransactionAuditModalProps {
  isOpen: boolean
  onClose: () => void
  entry: FinancialLedgerEntry | null
}

export const LedgerTransactionAuditModal: React.FC<LedgerTransactionAuditModalProps> = ({
  isOpen,
  onClose,
  entry
}) => {
  if (!isOpen || !entry) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      data-testid="modal-auditoria-ledger"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Topo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">
                  Auditoria de Partida do Ledger
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {entry.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Registro Imutável Append-Only • Disk Core Financial Ledger
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Card de Valor & Natureza */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                Fato Contábil
              </span>
              <span className="text-base font-semibold text-white">
                {entry.entryTypeLabelPtBr}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                Evento: <strong className="text-slate-200">{entry.eventName}</strong>
              </span>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 mb-0.5">
                {entry.nature === 'CREDITO' ? (
                  <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    <ArrowUpRight className="w-3.5 h-3.5" /> CRÉDITO
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                    <ArrowDownLeft className="w-3.5 h-3.5" /> DÉBITO
                  </span>
                )}
              </div>
              <span className="text-xl font-bold font-mono text-white">
                R$ {(entry.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Partida Dobrada Balanceada */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Partida Dobrada Oficial
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] font-medium text-rose-400 block mb-1">
                  Conta a Débito (Origem do Recurso)
                </span>
                <span className="text-xs text-slate-200 font-mono block">
                  {entry.accountDebit}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] font-medium text-emerald-400 block mb-1">
                  Conta a Crédito (Destino do Recurso)
                </span>
                <span className="text-xs text-slate-200 font-mono block">
                  {entry.accountCredit}
                </span>
              </div>
            </div>
          </div>

          {/* Rastreabilidade de Origem */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Pedido Comercial</span>
              <span className="font-mono text-slate-200 font-medium">
                {entry.orderId || 'Não aplicável (Transferência/Repasse)'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Pagamento Core</span>
              <span className="font-mono text-slate-200 font-medium">
                {entry.paymentId || 'Não aplicável'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-slate-400 block mb-0.5">Data e Hora do Registro</span>
              <span className="font-mono text-slate-200">
                {new Date(entry.createdAt).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Regra Aplicada e Operador */}
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Regra de Contabilização:</span>
              <p className="text-slate-300">{entry.ruleApplied}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block mb-0.5">Operador / Agente Responsável:</span>
                <span className="font-medium text-slate-200">{entry.operatorName}</span>
              </div>
              {entry.channel && (
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
                  Canal: {entry.channel}
                </span>
              )}
            </div>
          </div>

          {/* Hash Criptográfico de Integridade */}
          {entry.verifiedHash && (
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-emerald-400 block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 inline" /> Hash Criptográfico de Bloqueio (SHA-256)
                </span>
                <span className="font-mono text-[11px] text-emerald-300/80 break-all select-all">
                  {entry.verifiedHash}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-800 bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Fechar Auditoria
          </button>
        </div>
      </div>
    </div>
  )
}
