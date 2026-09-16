import React, { useState } from 'react'
import {
  X,
  ShoppingBag,
  Ticket,
  CreditCard,
  History,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  RefreshCw,
  QrCode,
  UserCheck,
  ShieldCheck,
  Building,
  Calendar,
  Layers,
  FileCheck,
  ExternalLink
} from 'lucide-react'
import type { OrderRecord } from '../../types/commerce-orders.types'
import { commerceCoreService } from '../../services/commerceCore.service'

interface OrderDossier360ModalProps {
  order: OrderRecord
  isOpen: boolean
  onClose: () => void
  onOrderUpdated?: () => void
}

export const OrderDossier360Modal: React.FC<OrderDossier360ModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'ingressos' | 'pagamento' | 'timeline' | 'developer'>('geral')
  const [reissuingTicketId, setReissuingTicketId] = useState<string | null>(null)
  const [isReconciling, setIsReconciling] = useState(false)
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleReissueTicket = async (ticketId: string) => {
    setReissuingTicketId(ticketId)
    try {
      const res = await commerceCoreService.reissueTicket(ticketId)
      setNoticeMessage(res.message)
      if (onOrderUpdated) onOrderUpdated()
    } finally {
      setReissuingTicketId(null)
      setTimeout(() => setNoticeMessage(null), 4000)
    }
  }

  const handleReconcileOrder = async () => {
    setIsReconciling(true)
    try {
      const res = await commerceCoreService.reconcileOrder(order.id)
      setNoticeMessage(res.message)
      if (onOrderUpdated) onOrderUpdated()
    } finally {
      setIsReconciling(false)
      setTimeout(() => setNoticeMessage(null), 4000)
    }
  }

  return (
    <div
      data-testid="order-dossier-360-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn"
    >
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho do Dossiê */}
        <div className="bg-slate-900 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-black text-indigo-400">{order.id}</span>
                <span className="text-slate-400 text-xs">({order.protocol})</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {order.statusLabelPtBr}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Canal: <strong className="text-slate-200">{order.channelLabelPtBr}</strong> • Data:{' '}
                {order.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReconcileOrder}
              disabled={isReconciling}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReconciling ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Reconciliar Pedido</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificação de Feedback */}
        {noticeMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Abas do Dossiê */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 gap-1 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'geral'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Visão Geral & Itens</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ingressos')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ingressos'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Ingressos & Titularidade ({order.tickets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pagamento')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pagamento'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pagamento & Split</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Timeline do Pedido</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('developer')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'developer'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Rastreamento Técnico (Developer)</span>
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* ABA 1: VISÃO GERAL & ITENS */}
          {activeTab === 'geral' && (
            <div className="space-y-6">
              {/* Card Resumo do Evento e Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Dados do Evento
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{order.eventName}</p>
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sessão: {order.sessionDate}</span>
                  </p>
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.venueName}</span>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Produtora: <strong className="text-slate-700">{order.producerName}</strong>
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Dados do Comprador
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
                  <p className="text-slate-600">
                    E-mail: <strong className="text-slate-800 font-mono">{order.customerEmail}</strong>
                  </p>
                  <p className="text-slate-600">
                    CPF: <strong className="text-slate-800 font-mono">{order.customerCpf}</strong>
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-500">
                    <span>E-mail Enviado: {order.notificationsSent.email ? '✅ Sim' : '❌ Não'}</span>
                    <span>•</span>
                    <span>WhatsApp: {order.notificationsSent.whatsapp ? '✅ Sim' : '⚠️ Fila'}</span>
                  </div>
                </div>
              </div>

              {/* Tabela de Itens Comprados */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">Itens do Pedido</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Item / Setor</th>
                        <th className="py-2.5 px-3">Modalidade</th>
                        <th className="py-2.5 px-3">Assentos Selecionados</th>
                        <th className="py-2.5 px-3 text-right">Qtd</th>
                        <th className="py-2.5 px-3 text-right">Preço Unit.</th>
                        <th className="py-2.5 px-3 text-right">Taxa Serviço</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 px-3 font-bold text-slate-900">{item.description}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                              {item.modality}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-indigo-600 font-semibold">
                            {item.seatReferences?.join(', ') || 'Lugar Livre'}
                          </td>
                          <td className="py-3 px-3 text-right font-bold">{item.quantity}</td>
                          <td className="py-3 px-3 text-right">R$ {item.unitPrice.toFixed(2)}</td>
                          <td className="py-3 px-3 text-right text-slate-500">R$ {item.serviceFee.toFixed(2)}</td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">
                            R$ {item.totalPrice.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totalizadores Financeiros */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Snapshot comercial e regras financeiras congeladas no momento da compra.</span>
                </div>
                <div className="text-right space-y-1 sm:w-60">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>R$ {order.subtotalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Taxa de Serviço:</span>
                    <span>R$ {order.serviceFeeAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                    <span>Valor Total:</span>
                    <span className="text-indigo-600">R$ {order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: INGRESSOS & TITULARIDADE */}
          {activeTab === 'ingressos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Ingressos Individuais Emitidos</h4>
                  <p className="text-slate-500">
                    Cada ingresso possui chave criptográfica única de acesso (QR Code anti-fraude com rotação segura).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.tickets.map((tck) => (
                  <div key={tck.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Ticket className="w-4 h-4" />
                        </span>
                        <div>
                          <p className="font-mono font-black text-slate-900">{tck.ticketNumber}</p>
                          <p className="text-[10px] text-slate-400">ID Atômico: {tck.id}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {tck.status === 'ACTIVE' ? 'Ativo / Válido' : tck.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-700">
                      <p>
                        Setor: <strong className="text-slate-900">{tck.sectorName}</strong>
                        {tck.row && <span> • Fila <strong>{tck.row}</strong></span>}
                        {tck.seatNumber && <span> • Assento <strong>{tck.seatNumber}</strong></span>}
                      </p>
                      <p>
                        Titular Atual: <strong className="text-slate-900">{tck.holderName}</strong>{' '}
                        <span className="font-mono text-slate-400">({tck.holderCpf})</span>
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 truncate">
                        Credencial de Acesso: {tck.qrCredential}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Face: R$ {tck.price.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleReissueTicket(tck.id)}
                        disabled={reissuingTicketId === tck.id}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs transition flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${reissuingTicketId === tck.id ? 'animate-spin' : ''}`} />
                        <span>Reemitir Ingresso</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 3: PAGAMENTO & SPLIT */}
          {activeTab === 'pagamento' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Confirmação de Pagamento</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Método</span>
                    <p className="font-bold text-slate-900 mt-0.5">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Status</span>
                    <p className="font-bold text-emerald-600 mt-0.5">{order.paymentStatus}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Data Confirmação</span>
                    <p className="font-bold text-slate-900 mt-0.5">{order.paidAt || 'Pendente'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Ledger Contábil</span>
                    <p className="font-bold text-emerald-600 mt-0.5">
                      {order.ledgerPosted ? 'Partida Dobrada OK' : 'Pendente'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Composição de Split Financeiro */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">Composição do Split Comercial</h4>
                <div className="p-4 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-800">Produtora (Opus Entretenimento Curitiba)</span>
                    <span className="font-bold text-slate-900 font-mono">
                      R$ {(order.totalAmount - order.serviceFeeAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-800">DiskIngressos (Taxa de Conveniência/Serviço)</span>
                    <span className="font-bold text-slate-900 font-mono">
                      R$ {order.serviceFeeAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-800">Custo do Gateway (Adquirente / PIX Central)</span>
                    <span className="text-slate-500 font-mono">R$ 1,89</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-indigo-600 pt-1">
                    <span>Total Liquidado:</span>
                    <span className="font-mono">R$ {order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: TIMELINE DO PEDIDO */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Timeline Cronológica Universal</h4>
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
                {order.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div
                      className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        event.status === 'ERROR'
                          ? 'border-rose-600 bg-rose-600'
                          : event.status === 'WARN'
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-emerald-600 bg-emerald-600'
                      }`}
                    />
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {event.service} • {event.action}
                        </span>
                        <span className="font-mono text-slate-400 text-[11px]">{event.timestamp}</span>
                      </div>
                      {event.details && (
                        <p className="mt-1 text-slate-600 text-[11px] font-mono">{event.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 5: RASTREAMENTO DEVELOPER */}
          {activeTab === 'developer' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Rastreamento Técnico & Diagnóstico</h4>
                  <p className="text-slate-500">
                    Identificadores canônicos para auditoria e rastreio de ponta a ponta no Core.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-3 font-mono text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Correlation ID:</span>
                  <p className="text-indigo-400 font-bold">{order.correlationId}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Order ID Canônico:</span>
                  <p className="text-emerald-400">{order.id}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Payload JSON do Pedido:</span>
                  <pre className="mt-1 p-3 bg-slate-950 rounded-lg text-[11px] text-slate-300 overflow-x-auto">
                    {JSON.stringify(order, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Ações */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Integridade Comercial Homologada no Disk Core
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
