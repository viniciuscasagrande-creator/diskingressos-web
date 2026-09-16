import React, { useState } from 'react'
import {
  ArrowRightLeft,
  X,
  AlertTriangle,
  CheckCircle2,
  Scale,
  DollarSign,
  ShieldCheck
} from 'lucide-react'
import type {
  EventSubAccount,
  FinancialSimulationResult
} from '../../../types/finance-accounting-core.types'
import { financialAccountingCoreService } from '../../../services/financialAccountingCore.service'

interface TransferBetweenEventsModalProps {
  isOpen: boolean
  onClose: () => void
  subAccounts: EventSubAccount[]
  onSuccess: () => void
}

export const TransferBetweenEventsModal: React.FC<TransferBetweenEventsModalProps> = ({
  isOpen,
  onClose,
  subAccounts,
  onSuccess
}) => {
  const [sourceEventId, setSourceEventId] = useState<number>(subAccounts[0]?.eventId || 501)
  const [targetEventId, setTargetEventId] = useState<number>(subAccounts[1]?.eventId || 502)
  const [amountStr, setAmountStr] = useState<string>('50000')
  const [reason, setReason] = useState<string>('')
  const [makerName, setMakerName] = useState<string>('Carlos Eduardo Nogueira')
  const [loading, setLoading] = useState<boolean>(false)
  const [simulating, setSimulating] = useState<boolean>(false)
  const [simulationResult, setSimulationResult] = useState<FinancialSimulationResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const sourceSub = subAccounts.find(s => s.eventId === Number(sourceEventId))
  const targetSub = subAccounts.find(s => s.eventId === Number(targetEventId))
  const amountCents = Math.round((parseFloat(amountStr) || 0) * 100)

  const getTier = (cents: number): string => {
    if (cents > 10000000) return 'DIRETORIA (Alçada Máxima - Acima de R$ 100.000,00)'
    if (cents > 2000000) return 'GERÊNCIA FINANCEIRA (Alçada Média - Até R$ 100.000,00)'
    return 'OPERACIONAL (Alçada Básica - Até R$ 20.000,00)'
  }

  const handleSimulate = async () => {
    if (sourceEventId === targetEventId) {
      setErrorMessage('O evento de origem e destino devem ser diferentes.')
      return
    }
    if (amountCents <= 0) {
      setErrorMessage('Informe um valor válido maior que zero.')
      return
    }
    setSimulating(true)
    setErrorMessage(null)
    try {
      const res = await financialAccountingCoreService.runSimulation({
        producerId: 101,
        sourceEventId: Number(sourceEventId),
        targetEventId: Number(targetEventId),
        amountCents,
        simulatedAt: new Date().toISOString()
      })
      setSimulationResult(res)
    } catch {
      setErrorMessage('Falha ao executar simulação de impacto financeiro.')
    } finally {
      setSimulating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (sourceEventId === targetEventId) {
      setErrorMessage('O evento de origem e de destino devem ser distintos.')
      return
    }

    if (amountCents <= 0) {
      setErrorMessage('Informe um valor maior que R$ 0,00.')
      return
    }

    if (!reason.trim()) {
      setErrorMessage('A justificativa operacional é obrigatória para fins de auditoria contábil.')
      return
    }

    if (sourceSub && sourceSub.availableCents < amountCents) {
      setErrorMessage(
        `Saldo disponível insuficiente no evento de origem (Disponível: R$ ${(sourceSub.availableCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`
      )
      return
    }

    setLoading(true)
    try {
      const res = await financialAccountingCoreService.requestTransfer({
        sourceEventId: Number(sourceEventId),
        targetEventId: Number(targetEventId),
        amountCents,
        reason,
        makerName
      })

      if (res.ok) {
        setSuccessMessage('Transferência solicitada com sucesso. Aguardando aprovação do Checker!')
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1200)
      } else {
        setErrorMessage(res.message || 'Erro ao solicitar transferência.')
      }
    } catch {
      setErrorMessage('Erro de conexão ao solicitar transferência.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      data-testid="modal-transferencia-eventos"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Nova Transferência de Recursos Entre Eventos
              </h2>
              <p className="text-xs text-slate-400">
                Governança Maker × Checker • Segregação de Subcontas e Ledger Imutável
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

        {/* Mensagens de Alerta */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Evento Origem */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Evento de Origem (Cede Recursos)
              </label>
              <select
                value={sourceEventId}
                onChange={e => setSourceEventId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              >
                {subAccounts.map(sub => (
                  <option key={sub.eventId} value={sub.eventId}>
                    {sub.eventName} (Disponível: R$ {(sub.availableCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
              {sourceSub && (
                <div className="mt-1.5 text-xs text-slate-400 flex items-center justify-between">
                  <span>Disponível para cessão:</span>
                  <span className="font-semibold text-emerald-400">
                    R$ {(sourceSub.availableCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* Evento Destino */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Evento de Destino (Recebe Recursos)
              </label>
              <select
                value={targetEventId}
                onChange={e => setTargetEventId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              >
                {subAccounts.map(sub => (
                  <option key={sub.eventId} value={sub.eventId} disabled={sub.eventId === Number(sourceEventId)}>
                    {sub.eventName} {sub.eventId === Number(sourceEventId) ? '(Origem)' : ''}
                  </option>
                ))}
              </select>
              {targetSub && (
                <div className="mt-1.5 text-xs text-slate-400 flex items-center justify-between">
                  <span>Saldo disponível atual:</span>
                  <span className="font-semibold text-slate-300">
                    R$ {(targetSub.availableCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Valor */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Valor da Transferência (R$)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amountStr}
                  onChange={e => setAmountStr(e.target.value)}
                  placeholder="Ex: 50000.00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono transition-colors"
                  required
                />
              </div>
            </div>

            {/* Solicitante Maker */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Operador Solicitante (Maker)
              </label>
              <input
                type="text"
                value={makerName}
                onChange={e => setMakerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Alçada Calculada */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Alçada Regulamentar Requerida:</span>
            </div>
            <span className="font-semibold text-amber-400">{getTier(amountCents)}</span>
          </div>

          {/* Justificativa */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Justificativa Operacional e Finalidade Contábil
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Descreva a finalidade (ex: adiantamento de verba para montagem de palco, rider técnico ou publicidade local)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              required
            />
          </div>

          {/* Simulação de Impacto */}
          {simulationResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-amber-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Simulação de Impacto Contábil ({simulationResult.simulationId})
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                    simulationResult.riskLevel === 'SEGURO'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  Risco: {simulationResult.riskLevel}
                </span>
              </div>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                {simulationResult.impactNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Rodapé com Botões */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleSimulate}
              disabled={simulating || amountCents <= 0}
              className="px-4 py-2 rounded-xl text-xs font-medium text-amber-400 hover:bg-amber-500/10 border border-amber-500/30 transition-colors disabled:opacity-50"
            >
              {simulating ? 'Simulando...' : 'Simular Impacto no Saldo'}
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Solicitar Transferência (Maker)'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
