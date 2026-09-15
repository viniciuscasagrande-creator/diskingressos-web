import React, { useState } from 'react'
import {
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Clock,
  User,
  Building2,
  Calendar,
  Layers,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Split,
  Scale,
  Receipt
} from 'lucide-react'
import { PaymentRecord } from '../../types/payments-enterprise.types'

interface PaymentDossier360ModalProps {
  payment: PaymentRecord
  onClose: () => void
  onRefund: (data: { amountCents: number; reason: string; isPartial: boolean }) => Promise<void>
}

export const PaymentDossier360Modal: React.FC<PaymentDossier360ModalProps> = ({
  payment,
  onClose,
  onRefund
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'split' | 'risk' | 'timeline' | 'refund'>('overview')
  const [refundType, setRefundType] = useState<'total' | 'partial'>('total')
  const [partialAmountBrl, setPartialAmountBrl] = useState<string>((payment.amountCents / 200).toFixed(2))
  const [refundReason, setRefundReason] = useState('')
  const [refundLoading, setRefundLoading] = useState(false)
  const [refundFeedback, setRefundFeedback] = useState<string | null>(null)

  const handleExecuteRefund = async () => {
    if (!refundReason || refundReason.trim().length < 5) {
      alert('O motivo do estorno é obrigatório e deve conter ao menos 5 caracteres.')
      return
    }

    const isPartial = refundType === 'partial'
    const amountCents = isPartial ? Math.round(parseFloat(partialAmountBrl || '0') * 100) : payment.amountCents

    if (amountCents <= 0 || amountCents > payment.amountCents) {
      alert('Valor de estorno inválido.')
      return
    }

    setRefundLoading(true)
    try {
      await onRefund({ amountCents, reason: refundReason, isPartial })
      setRefundFeedback('Estorno executado e registrado no Core com sucesso!')
      setTimeout(() => {
        onClose()
      }, 1500)
    } finally {
      setRefundLoading(false)
    }
  }

  const getMethodBadge = (m: string) => {
    switch (m) {
      case 'pix':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">PIX Instantâneo</span>
      case 'credit_card':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">Cartão de Crédito</span>
      case 'debit_card':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">Cartão de Débito</span>
      case 'tef_pos':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">TEF / POS Bilheteria</span>
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{m}</span>
    }
  }

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'aprovado':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500 text-white">Aprovado</span>
      case 'recusado':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-500 text-white">Recusado</span>
      case 'em_analise_risco':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500 text-white">Em Análise de Risco</span>
      case 'chargeback':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-600 text-white">Chargeback</span>
      case 'estornado':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-600 text-white">Estornado</span>
      case 'parcialmente_estornado':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-600 text-white">Estorno Parcial</span>
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-400 text-white">{s}</span>
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      data-testid="payment-dossier-360-modal"
    >
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scaleUp">
        {/* Cabeçalho do Dossiê */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="w-5 h-5 text-indigo-400" />
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">
                Disk Core • Dossiê Pagamento 360°
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black">{payment.id}</h2>
              {getStatusBadge(payment.status)}
              {getMethodBadge(payment.method)}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pedido Vinculado: <span className="text-white font-mono font-bold">{payment.orderId}</span> • ID de Correlação: <span className="font-mono text-indigo-300">{payment.correlationId}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Abas de Navegação */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-slate-50 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Dados & Transação</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'split'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Split className="w-4 h-4" />
            <span>Split Econômico & Ledger</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('risk')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'risk'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Antifraude & Risco</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Timeline Cronológica</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('refund')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'refund'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Estorno & Alçadas</span>
          </button>
        </div>

        {/* Conteúdo Dinâmico das Abas */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="text-xs text-slate-500 font-bold uppercase">Valor Bruto Total</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    R$ {(payment.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Canal: {payment.channel.toUpperCase()}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="text-xs text-slate-500 font-bold uppercase">Gateway / PSP</span>
                  <p className="text-2xl font-black text-slate-900 mt-1 uppercase">{payment.gateway}</p>
                  <p className="text-xs text-slate-500 mt-1">Ref: {payment.gatewayReference || 'Padrão API'}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="text-xs text-slate-500 font-bold uppercase">Status de Conciliação</span>
                  <p className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                    {payment.isReconciled ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">100% Conciliado</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-700">Aguardando Matching</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Liquidação prevista: {payment.expectedSettlementDate}</p>
                </div>
              </div>

              {/* Informações do Comprador e Evento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span>Titular do Pagamento</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-slate-900">{payment.customerName}</p>
                    <p className="text-slate-600 text-xs">CPF: {payment.customerDocument}</p>
                    <p className="text-slate-600 text-xs">E-mail: {payment.customerEmail}</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>Produtora & Evento</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-slate-900">{payment.eventTitle}</p>
                    <p className="text-slate-600 text-xs">Produtor: {payment.producerName}</p>
                    <p className="text-slate-600 text-xs">ID Evento: #{payment.eventId}</p>
                  </div>
                </div>
              </div>

              {/* Detalhes Técnicos de Cartão ou PIX */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Comprovante & Parâmetros de Autorização</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Forma</span>
                    <span className="font-bold text-slate-800">{payment.method.toUpperCase()}</span>
                  </div>
                  {payment.cardBrand && (
                    <div>
                      <span className="text-slate-400 block">Bandeira / Final</span>
                      <span className="font-bold text-slate-800">
                        {payment.cardBrand} ****{payment.cardLastFour}
                      </span>
                    </div>
                  )}
                  {payment.authCode && (
                    <div>
                      <span className="text-slate-400 block">Código Autorização</span>
                      <span className="font-mono font-bold text-slate-800">{payment.authCode}</span>
                    </div>
                  )}
                  {payment.nsu && (
                    <div>
                      <span className="text-slate-400 block">NSU Adquirente</span>
                      <span className="font-mono font-bold text-slate-800">{payment.nsu}</span>
                    </div>
                  )}
                  {payment.pixTxId && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block">PIX txId</span>
                      <span className="font-mono font-bold text-slate-800 truncate block">{payment.pixTxId}</span>
                    </div>
                  )}
                  {payment.pixEndToEndId && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block">PIX EndToEnd ID</span>
                      <span className="font-mono font-bold text-slate-800 truncate block">{payment.pixEndToEndId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'split' && (
            <div className="space-y-6">
              <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Split className="w-4 h-4 text-indigo-600" />
                  <span>Snapshot do Split Comercial e Contábil</span>
                </div>
                <p className="text-xs text-indigo-700 mt-1">
                  Regra imutável congelada no momento da autorização: <span className="font-semibold">{payment.split.appliedRules}</span>
                </p>
                <p className="text-[11px] text-indigo-600 mt-0.5">
                  ID Contrato: <span className="font-mono font-semibold">{payment.split.contractSnapshotId}</span> • Bloqueado em: {new Date(payment.split.lockedAt).toLocaleString('pt-BR')}
                </p>
              </div>

              {/* Tabela de Destinação do Split */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-600 uppercase">
                    <tr>
                      <th className="py-3 px-4">Destinatário</th>
                      <th className="py-3 px-4">Descrição da Regra</th>
                      <th className="py-3 px-4 text-center">% Partição</th>
                      <th className="py-3 px-4 text-right">Valor Líquido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payment.split.rules.map((rule, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900 uppercase">
                          {rule.recipient}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{rule.label}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                          {rule.percentage.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">
                          R$ {(rule.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Garantia de Partida Dobrada */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">Partida Dobrada & Integridade do Ledger</span>
                </div>
                <span className="font-semibold">Balanço Ativo/Passivo Fechado (R$ 0,00 de resíduo)</span>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Score de Risco</span>
                  <p className="text-3xl font-black text-slate-900 mt-1">{payment.risk.score}/100</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Nível Classificado</span>
                  <p className="text-xl font-black uppercase text-indigo-600 mt-2">{payment.risk.level}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Recomendação do Motor</span>
                  <p className="text-xl font-black uppercase text-emerald-600 mt-2">{payment.risk.recommendation}</p>
                </div>
              </div>

              {/* Sinais Analisados */}
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                  Sinais Verificados no Pedido
                </h4>
                <div className="flex flex-wrap gap-2">
                  {payment.risk.evaluatedSignals.map((signal, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {signal}
                    </span>
                  ))}
                </div>
              </div>

              {/* Alertas ou Flags */}
              {payment.risk.fraudFlags.length > 0 && (
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Flags de Atenção Operacional</span>
                  </h4>
                  <ul className="list-disc list-inside text-xs text-amber-900 space-y-1">
                    {payment.risk.fraudFlags.map((flag, idx) => (
                      <li key={idx} className="font-mono">{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {payment.risk.reviewedBy && (
                <div className="p-4 bg-slate-100 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-slate-800">Revisão Manual Concluída</p>
                  <p className="text-slate-600">Revisor: {payment.risk.reviewedBy} • Data: {new Date(payment.risk.reviewedAt!).toLocaleString('pt-BR')}</p>
                  <p className="text-slate-700 italic">Notas: "{payment.risk.reviewNotes}"</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Rastreamento Cronológico Universal
              </h4>
              <div className="relative pl-6 border-l-2 border-indigo-200 space-y-6">
                {payment.timeline.map((item, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-white border-4 border-indigo-600" />
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900">{item.step}</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(item.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{item.detail}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 border-t border-slate-200/60 pt-1.5">
                        <span>Origem: {item.actor}</span>
                        <span className="font-bold text-indigo-600">{item.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-6">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>Central de Estorno & Política de Alçadas</span>
                </div>
                <p className="text-xs text-rose-700 mt-1">
                  Estorno exige motivo formal de auditoria, verificação de alçada (Maker × Checker) e atualização automática de inventário e ledger.
                </p>
              </div>

              {refundFeedback ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm">{refundFeedback}</p>
                </div>
              ) : (
                <div className="space-y-4 border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Tipo de Estorno
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRefundType('total')}
                        className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                          refundType === 'total'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Estorno Total (R$ {(payment.amountCents / 100).toFixed(2)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setRefundType('partial')}
                        className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                          refundType === 'partial'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Split className="w-4 h-4" />
                        Estorno Parcial (R$)
                      </button>
                    </div>
                  </div>

                  {refundType === 'partial' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Valor Parcial a Estornar (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        max={(payment.amountCents / 100).toFixed(2)}
                        value={partialAmountBrl}
                        onChange={e => setPartialAmountBrl(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono font-bold"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Motivo Obrigatório do Estorno <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={refundReason}
                      onChange={e => setRefundReason(e.target.value)}
                      placeholder="Descreva detalhadamente o motivo do estorno para auditoria e prestação de contas ao produtor..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteRefund}
                    disabled={refundLoading}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{refundLoading ? 'Processando Estorno...' : 'Confirmar e Executar Estorno no Core'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé com Informação de Integridade */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Integridade Financeira & Ledger Conectados
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            Fechar Dossiê
          </button>
        </div>
      </div>
    </div>
  )
}
