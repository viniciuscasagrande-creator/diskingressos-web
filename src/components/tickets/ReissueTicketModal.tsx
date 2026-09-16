import React, { useState } from 'react'
import { X, RefreshCw, ShieldAlert, CheckCircle2 } from 'lucide-react'
import type { TicketRecord } from '../../types/tickets-access.types'
import { ticketsAccessService } from '../../services/ticketsAccess.service'

interface ReissueTicketModalProps {
  ticket: TicketRecord
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const ReissueTicketModal: React.FC<ReissueTicketModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [reason, setReason] = useState('Suspeita de vazamento ou envio indevido do QR Code')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleReissue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Por favor, informe a justificativa da reemissão.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await ticketsAccessService.reissueTicket(ticket.id, reason)
      if (res.success) {
        setSuccessMsg(res.message)
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        setError(res.message || 'Erro ao reemitir ingresso.')
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao reemitir credencial de acesso.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Topo */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Reemissão Segura Antifraude</h3>
              <p className="text-xs text-slate-400">Ingresso #{ticket.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleReissue} className="p-6 space-y-4">
          <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Invalidação Imediata de Credencial:</strong>
              O QR Code atualmente em posse do titular (versão v{ticket.currentCredentialVersion}) será <span className="font-bold">permanentemente revogado</span>. Caso alguém tente utilizá-lo nas catracas, o acesso será barrado como tentativa de fraude e enviado para a Central de Conflitos.
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Titular:</span>
              <strong className="text-slate-800">{ticket.holderName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Setor / Lote:</span>
              <span className="text-slate-700">{ticket.sector} • {ticket.lot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Versão atual:</span>
              <span className="font-mono font-bold text-indigo-600">v{ticket.currentCredentialVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Nova versão após reemissão:</span>
              <span className="font-mono font-bold text-emerald-600">v{ticket.currentCredentialVersion + 1}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Justificativa Operacional da Reemissão *
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
            >
              <option value="Suspeita de vazamento ou envio indevido do QR Code">
                Suspeita de vazamento ou envio indevido do QR Code
              </option>
              <option value="Perda, roubo ou furto do aparelho do titular">
                Perda, roubo ou furto do aparelho do titular
              </option>
              <option value="Troca preventiva solicitada pelo suporte SAC">
                Troca preventiva solicitada pelo suporte SAC
              </option>
              <option value="Falha na leitura ótica da imagem do voucher">
                Falha na leitura ótica da imagem do voucher
              </option>
              <option value="Outro motivo operacional auditado">Outro motivo operacional auditado</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs font-semibold">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              {loading ? 'Reemitindo...' : 'Reemitir e Revogar v' + ticket.currentCredentialVersion}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
