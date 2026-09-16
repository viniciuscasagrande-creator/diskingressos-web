import React, { useState } from 'react'
import { X, Headphones, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { CustomerMasterRecord, ServiceDeskScope, ITILPriority, ITILCaseType } from '../../types/customer-service-itil.types'
import { customerServiceItilService } from '../../services/customerServiceItil.service'

interface NewItilCaseModalProps {
  customer?: CustomerMasterRecord | null
  defaultScope?: ServiceDeskScope
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const NewItilCaseModal: React.FC<NewItilCaseModalProps> = ({
  customer,
  defaultScope = 'SAC_CLIENTE',
  isOpen,
  onClose,
  onSuccess
}) => {
  const [scope, setScope] = useState<ServiceDeskScope>(defaultScope)
  const [type, setType] = useState<ITILCaseType>('REQUISICAO_SERVICO')
  const [priority, setPriority] = useState<ITILPriority>('MEDIA')
  const [category, setCategory] = useState('DUVIDA_INGRESSO')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setError('Por favor, preencha o título e a descrição da solicitação.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await customerServiceItilService.createItilCase({
        scope,
        type,
        priority,
        category,
        title,
        description,
        customerId: customer?.id,
        customerName: customer?.name,
        customerEmail: customer?.email,
        customerDocument: customer?.document
      })
      if (res.success) {
        setSuccessMsg(res.message)
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1500)
      } else {
        setError(res.message || 'Erro ao registrar chamado.')
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao registrar chamado no motor ITIL.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scaleUp">
        {/* Cabeçalho */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Abertura de Chamado ITIL</h3>
              <p className="text-xs text-slate-400">Motor Unificado de Serviços • SLA Integrado</p>
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
          {/* Seletor de Escopo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Escopo do Atendimento *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope('SAC_CLIENTE')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center ${
                  scope === 'SAC_CLIENTE'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                SAC / Consumidor Final
              </button>
              <button
                type="button"
                onClick={() => setScope('SUPORTE_EVENTO')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center ${
                  scope === 'SUPORTE_EVENTO'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Suporte a Evento / Produtor
              </button>
            </div>
          </div>

          {/* Cliente Vinculado se houver */}
          {customer && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 block mb-0.5">Cliente Solicitante:</span>
              <strong className="text-slate-800">{customer.name}</strong>
              <span className="text-slate-500 block text-[11px] font-mono">{customer.document} • {customer.email}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Chamado</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as ITILCaseType)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="REQUISICAO_SERVICO">Requisição de Serviço</option>
                <option value="INCIDENTE">Incidente Operacional</option>
                <option value="PROBLEMA">Gerenciamento de Problema</option>
                <option value="MUDANCA">Gerenciamento de Mudança</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prioridade & SLA</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as ITILPriority)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BAIXA">Baixa (SLA 8h)</option>
                <option value="MEDIA">Média (SLA 4h)</option>
                <option value="ALTA">Alta (SLA 2h)</option>
                <option value="URGENTE_CRITICA">Urgente / Crítica (SLA 30m)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Título do Chamado *</label>
            <input
              type="text"
              required
              placeholder="Ex: Não recebeu o e-mail de confirmação ou erro de leitura"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Descrição Detalhada *</label>
            <textarea
              rows={3}
              required
              placeholder="Descreva o contexto, dados adicionais e relatos operacionais..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              {loading ? 'Abrindo...' : 'Abrir Chamado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
