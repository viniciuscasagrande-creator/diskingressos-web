import React, { useState } from 'react'
import { X, ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react'
import { PaymentRecord } from '../../types/payments-enterprise.types'

interface ManualReviewModalProps {
  payment: PaymentRecord
  onClose: () => void
  onConfirm: (data: { decision: 'aprovar' | 'bloquear'; notes: string }) => Promise<void>
}

export const ManualReviewModal: React.FC<ManualReviewModalProps> = ({
  payment,
  onClose,
  onConfirm
}) => {
  const [decision, setDecision] = useState<'aprovar' | 'bloquear'>('aprovar')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notes || notes.trim().length < 5) {
      alert('A justificativa de análise manual é obrigatória e deve ter ao menos 5 caracteres.')
      return
    }

    setLoading(true)
    try {
      await onConfirm({ decision, notes })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      data-testid="manual-review-modal"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">Revisão Manual de Antifraude</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1">
            <p>
              <span className="font-bold text-slate-700">Pagamento:</span> {payment.id} ({payment.orderId})
            </p>
            <p>
              <span className="font-bold text-slate-700">Titular:</span> {payment.customerName} (CPF {payment.customerDocument})
            </p>
            <p>
              <span className="font-bold text-slate-700">Valor:</span> R$ {(payment.amountCents / 100).toFixed(2)}
            </p>
            <p>
              <span className="font-bold text-slate-700">Score de Risco:</span> {payment.risk.score}/100 ({payment.risk.level.toUpperCase()})
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Decisão de Auditoria
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('aprovar')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  decision === 'aprovar'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Liberar Pagamento
              </button>
              <button
                type="button"
                onClick={() => setDecision('bloquear')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  decision === 'bloquear'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                Bloquear Transação
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Justificativa Obrigatória de Auditoria <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Documentação conferida pelo WhatsApp oficial, titular confirmou a aquisição dos ingressos..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 ${
                decision === 'aprovar' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {loading ? 'Gravando...' : 'Confirmar Decisão de Risco'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
