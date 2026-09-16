import React, { useState } from 'react'
import { X, ArrowRightLeft, User, Mail, Phone, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { TicketRecord } from '../../types/tickets-access.types'
import { ticketsAccessService } from '../../services/ticketsAccess.service'

interface TransferTicketModalProps {
  ticket: TicketRecord
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const TransferTicketModal: React.FC<TransferTicketModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [newHolderName, setNewHolderName] = useState('')
  const [newHolderDocument, setNewHolderDocument] = useState('')
  const [newHolderEmail, setNewHolderEmail] = useState('')
  const [newHolderPhone, setNewHolderPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHolderName.trim() || !newHolderDocument.trim() || !newHolderEmail.trim()) {
      setError('Preencha os campos obrigatórios: Nome, CPF e E-mail do novo titular.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await ticketsAccessService.transferTicket(ticket.id, {
        newHolderName,
        newHolderDocument,
        newHolderEmail,
        newHolderPhone,
        notes
      })
      if (res.success) {
        setSuccessMsg(res.message)
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        setError(res.message || 'Erro ao realizar transferência.')
      }
    } catch (err: any) {
      setError(err?.message || 'Erro de comunicação ao transferir titularidade.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Cabeçalho */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Transferência de Titularidade</h3>
              <p className="text-xs text-slate-400">Ingresso #{ticket.id} • Versão atual v{ticket.currentCredentialVersion}</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Alerta explicativo */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Regra de Segurança Disk Core:</strong>
              O comprador original ({ticket.buyerName}) permanece vinculado para auditoria financeira. A credencial QR atual (v{ticket.currentCredentialVersion}) será imediatamente <span className="font-bold text-rose-700">revogada</span> e uma nova versão (v{ticket.currentCredentialVersion + 1}) será gerada para o novo titular.
            </div>
          </div>

          {/* Titular Atual */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-semibold block mb-1">Titular Atual:</span>
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>{ticket.holderName}</span>
              <span className="font-mono text-slate-500">{ticket.holderDocument}</span>
            </div>
          </div>

          {/* Dados do Novo Titular */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Dados do Novo Titular</h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Nome de quem vai entrar no evento"
                  value={newHolderName}
                  onChange={e => setNewHolderName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CPF *</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={newHolderDocument}
                    onChange={e => setNewHolderDocument(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="(41) 90000-0000"
                    value={newHolderPhone}
                    onChange={e => setNewHolderPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-mail do Novo Titular *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="email@exemplo.com"
                  value={newHolderEmail}
                  onChange={e => setNewHolderEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Observações de Auditoria</label>
              <textarea
                rows={2}
                placeholder="Motivo ou canal da solicitação (ex: Atendimento WhatsApp SAC)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
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
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              {loading ? 'Processando...' : 'Confirmar Transferência'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
