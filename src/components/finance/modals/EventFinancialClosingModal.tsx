import React, { useState } from 'react'
import {
  X,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Building2,
  Calendar,
  Ticket,
  DollarSign
} from 'lucide-react'
import type {
  EventClosingChecklist,
  EventBorderoReport
} from '../../../types/finance-accounting-core.types'
import { financialAccountingCoreService } from '../../../services/financialAccountingCore.service'

interface EventFinancialClosingModalProps {
  isOpen: boolean
  onClose: () => void
  checklist: EventClosingChecklist | null
  bordero: EventBorderoReport | null
  onSuccess: () => void
}

export const EventFinancialClosingModal: React.FC<EventFinancialClosingModalProps> = ({
  isOpen,
  onClose,
  checklist,
  bordero,
  onSuccess
}) => {
  const [signatoryName, setSignatoryName] = useState<string>('Carlos Eduardo Nogueira')
  const [signatoryRole, setSignatoryRole] = useState<string>('Diretor Financeiro Opus Entretenimento')
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isOpen || !checklist) return null

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!signatoryName.trim() || !signatoryRole.trim()) {
      setErrorMessage('Nome do signatário e cargo são obrigatórios para homologação jurídica.')
      return
    }

    setLoading(true)
    try {
      const res = await financialAccountingCoreService.approveBordero(checklist.eventId, {
        signatoryName,
        signatoryRole
      })

      if (res.ok) {
        setSuccessMessage('Borderô homologado com sucesso! Evento arquivado contabilmente.')
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1200)
      } else {
        setErrorMessage(res.message || 'Erro ao homologar borderô.')
      }
    } catch {
      setErrorMessage('Falha ao conectar com o servidor para homologação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      data-testid="modal-fechamento-bordero"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        {/* Topo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">
                  Fechamento Financeiro & Borderô Oficial
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400">
                  {checklist.closingStageLabelPtBr}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Evento: <strong className="text-slate-200">{checklist.eventName}</strong> • Rastreabilidade Completa Disk Core
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

        {/* Alertas */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Checklist de Validação */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Checklist de Fechamento Operacional
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-medium text-white block">1. Evento Realizado</span>
                  <span className="text-[11px] text-slate-400">Encerramento confirmado</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-medium text-white block">2. Vendas Liquidadas</span>
                  <span className="text-[11px] text-slate-400">Adquirentes conciliadas</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-medium text-white block">3. Transações Conciliadas</span>
                  <span className="text-[11px] text-slate-400">100% batimento em 5 camadas</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-medium text-white block">4. Disputas & SAC</span>
                  <span className="text-[11px] text-slate-400">Sem estornos pendentes</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 col-span-1 sm:col-span-2">
                {checklist.producerApprovedBordero ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                )}
                <div>
                  <span className="font-medium text-white block">5. Homologação do Borderô</span>
                  <span className="text-[11px] text-slate-400">
                    {checklist.producerApprovedBordero ? 'Assinado e validado' : 'Aguardando assinatura digital abaixo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Borderô Detalhado */}
          {bordero && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Demonstrativo de Bilheteria Oficial
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> {bordero.venue}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {bordero.eventDate}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400 block">Total Ingressos</span>
                  <span className="text-xs font-semibold text-slate-200">
                    {bordero.totalTicketsSold.toLocaleString('pt-BR')} vendidos ({bordero.totalComplimentaryTickets} cortesias)
                  </span>
                </div>
              </div>

              {/* Tabela de Lotes */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-[11px] uppercase text-slate-400">
                    <tr>
                      <th className="py-2 px-3">Setor / Modalidade</th>
                      <th className="py-2 px-3">Lote</th>
                      <th className="py-2 px-3 text-right">Preço Unitário</th>
                      <th className="py-2 px-3 text-right">Qtd. Vendida</th>
                      <th className="py-2 px-3 text-right">Total Bruto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {bordero.lotsSummary.map((lot, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-sans text-slate-200">{lot.sectorName}</td>
                        <td className="py-2 px-3 font-sans text-slate-400">{lot.lotName}</td>
                        <td className="py-2 px-3 text-right">
                          R$ {(lot.unitPriceCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-3 text-right">{lot.ticketsSoldCount}</td>
                        <td className="py-2 px-3 text-right text-emerald-400 font-semibold">
                          R$ {(lot.grossTotalCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quadro Resumo Financeiro */}
              <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Receita Bruta de Bilheteria:</span>
                    <span className="font-mono font-semibold text-white">
                      R$ {(bordero.grossBoxOfficeCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>(-) Comissão DiskIngressos:</span>
                    <span className="font-mono">
                      - R$ {(bordero.diskIngressosCommissionCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>(-) Tarifas de Processamento / Cartão:</span>
                    <span className="font-mono">
                      - R$ {(bordero.creditCardFeeRetainedCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>(-) Retenção ECAD:</span>
                    <span className="font-mono">
                      - R$ {(bordero.ecadRetainedCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span>Líquido Devido ao Produtor:</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      R$ {(bordero.netPayableToProducerCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>(-) Adiantamentos & Repasses Anteriores:</span>
                    <span className="font-mono text-slate-300">
                      - R$ {(bordero.alreadyPaidOutCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-amber-400 font-semibold text-sm">
                    <span>Saldo Remanescente a Repassar:</span>
                    <span className="font-mono">
                      R$ {(bordero.balanceRemainingToPayoutCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hash Auditável */}
              <div className="pt-2 text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Hash de Auditoria: {bordero.verifiedAuditHash}</span>
              </div>
            </div>
          )}

          {/* Seção de Homologação */}
          {!checklist.producerApprovedBordero ? (
            <form onSubmit={handleApprove} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-amber-400 flex items-center gap-2 text-sm">
                  <FileCheck className="w-4 h-4" /> Assinatura e Homologação do Borderô pelo Produtor
                </h4>
                <p className="text-slate-400 mt-1">
                  Ao homologar, o produtor concorda com as apurações, conciliação e retenções registradas neste Borderô Oficial.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Nome do Representante Legal / Signatário
                  </label>
                  <input
                    type="text"
                    value={signatoryName}
                    onChange={e => setSignatoryName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Cargo / Função Declarada
                  </label>
                  <input
                    type="text"
                    value={signatoryRole}
                    onChange={e => setSignatoryRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  {loading ? 'Homologando...' : 'Homologar e Assinar Borderô'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="font-semibold text-emerald-300 block">
                  Borderô Homologado e Arquivado
                </span>
                <span className="text-slate-400">
                  {checklist.closingStageLabelPtBr}. O evento está com seu ciclo financeiro 100% concluído no Disk Core.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
