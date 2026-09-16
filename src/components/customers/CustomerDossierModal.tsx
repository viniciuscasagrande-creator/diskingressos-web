import React, { useState, useEffect } from 'react'
import {
  X,
  User,
  ShoppingBag,
  Ticket,
  Headphones,
  History,
  ShieldCheck,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react'
import type { CustomerMasterRecord, CustomerTimelineItem, ITILServiceCaseRecord } from '../../types/customer-service-itil.types'
import { customerServiceItilService } from '../../services/customerServiceItil.service'

interface CustomerDossierModalProps {
  customer: CustomerMasterRecord
  isOpen: boolean
  onClose: () => void
  onOpenCase: (customer: CustomerMasterRecord) => void
}

export const CustomerDossierModal: React.FC<CustomerDossierModalProps> = ({
  customer,
  isOpen,
  onClose,
  onOpenCase
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'cases'>('overview')
  const [timeline, setTimeline] = useState<CustomerTimelineItem[]>([])
  const [cases, setCases] = useState<ITILServiceCaseRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const loadDetails = async () => {
      setLoading(true)
      try {
        const res = await customerServiceItilService.getCustomerDetails(customer.id)
        setTimeline(res.timeline)
        setCases(res.cases)
      } finally {
        setLoading(false)
      }
    }
    loadDetails()
  }, [isOpen, customer.id])

  if (!isOpen) return null

  const formatMoney = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scaleUp">
        {/* Cabeçalho */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black">{customer.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {customer.rfmSegment}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    customer.status === 'ATIVO'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {customer.statusLabelPtBr}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ID: <span className="font-mono text-indigo-300">{customer.id}</span> • CPF: <span className="font-mono">{customer.document}</span> • Cadastrado em {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-2 bg-slate-50 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Visão Cadastral & Comercial</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Linha do Tempo de Interações</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cases')}
            className={`px-4 py-2 font-bold text-xs border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'cases'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Chamados de Atendimento ({customer.openCasesCount})</span>
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPIs de Consumo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Receita Total Gasta</span>
                  <strong className="text-lg font-black text-slate-900 block mt-0.5">
                    {formatMoney(customer.totalSpentCents)}
                  </strong>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Pedidos Realizados</span>
                  <strong className="text-lg font-black text-slate-900 block mt-0.5">
                    {customer.ordersCount} pedidos
                  </strong>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Ingressos Adquiridos</span>
                  <strong className="text-lg font-black text-indigo-600 block mt-0.5">
                    {customer.ticketsCount} ingressos
                  </strong>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Score de Risco</span>
                  <strong className={`text-lg font-black block mt-0.5 ${customer.riskScore > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {customer.riskScore}/100 ({customer.riskScore > 50 ? 'Alto Risco' : 'Seguro'})
                  </strong>
                </div>
              </div>

              {/* Contato e Localização */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">E-mail Cadastrado:</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{customer.email}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Telefone Celular:</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{customer.phone}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Cidade / Estado:</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{customer.city} / {customer.state}</span>
                  </div>
                </div>
              </div>

              {/* Botão de Ação Rápida */}
              <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 flex items-center justify-between">
                <div>
                  <strong className="text-xs text-indigo-950 font-bold block">Necessita de atendimento?</strong>
                  <span className="text-[11px] text-indigo-700">Abra um chamado com histórico anexado.</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenCase(customer)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Headphones className="w-4 h-4" />
                  <span>Novo Chamado SAC</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-3">
              {timeline.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Nenhuma interação registrada recentemente.
                </div>
              ) : (
                timeline.map(t => (
                  <div key={t.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="font-bold text-slate-800">{t.title}</strong>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(t.occurredAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{t.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'cases' && (
            <div className="space-y-3">
              {cases.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Nenhum chamado aberto para este cliente.
                </div>
              ) : (
                cases.map(c => (
                  <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-700">{c.protocol}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          {c.typeLabelPtBr}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {c.statusLabelPtBr}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{c.title}</h4>
                    <p className="text-slate-600">{c.description}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition"
          >
            Fechar Dossiê
          </button>
        </div>
      </div>
    </div>
  )
}
