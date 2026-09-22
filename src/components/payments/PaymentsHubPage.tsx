import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Clock,
  User,
  Building2,
  Layers,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Split,
  Scale,
  DollarSign,
  Landmark,
  Webhook,
  SlidersHorizontal,
  FileText,
  AlertOctagon,
  Ban,
  Check,
  Calendar
} from 'lucide-react'
import {
  PaymentRecord,
  PaymentsSummaryKPIs,
  ChargebackRecord,
  ReconciliationRecord,
  WebhookRecord
} from '../../types/payments-enterprise.types'
import { PaymentsEnterpriseService } from '../../services/paymentsEnterprise.service'
import { PaymentDossier360Modal } from './PaymentDossier360Modal'
import { ManualReviewModal } from './ManualReviewModal'
import { PixPaymentModal } from './PixPaymentModal'

interface PaymentsHubPageProps {
  onNavigateToOrders?: () => void
  onNavigateToFinance?: () => void
}

export const PaymentsHubPage: React.FC<PaymentsHubPageProps> = ({
  onNavigateToOrders,
  onNavigateToFinance
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'transactions' | 'pix_cards' | 'antifraud' | 'chargebacks' | 'reconciliation' | 'settlement_split' | 'webhooks_dev'
  >('overview')

  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<PaymentsSummaryKPIs | null>(null)
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [chargebacks, setChargebacks] = useState<ChargebackRecord[]>([])
  const [reconciliations, setReconciliations] = useState<ReconciliationRecord[]>([])
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>([])

  // Filtros
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [gatewayFilter, setGatewayFilter] = useState('todos')

  // Modais
  const [selectedPaymentForDossier, setSelectedPaymentForDossier] = useState<PaymentRecord | null>(null)
  const [selectedPaymentForReview, setSelectedPaymentForReview] = useState<PaymentRecord | null>(null)
  const [selectedPaymentForPix, setSelectedPaymentForPix] = useState<PaymentRecord | null>(null)

  // Notificações
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [sum, payList, chgList, recList, whkList] = await Promise.all([
        PaymentsEnterpriseService.getSummaryKPIs(),
        PaymentsEnterpriseService.getPayments({
          search,
          method: methodFilter,
          status: statusFilter,
          gateway: gatewayFilter
        }),
        PaymentsEnterpriseService.getChargebacks(),
        PaymentsEnterpriseService.getReconciliations(),
        PaymentsEnterpriseService.getWebhooks()
      ])
      setSummary(sum)
      setPayments(payList)
      setChargebacks(chgList)
      setReconciliations(recList)
      setWebhooks(whkList)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [search, methodFilter, statusFilter, gatewayFilter])

  const handleRefundAction = async (data: { amountCents: number; reason: string; isPartial: boolean }) => {
    if (!selectedPaymentForDossier) return
    const res = await PaymentsEnterpriseService.executeRefund({
      paymentId: selectedPaymentForDossier.id,
      amountCents: data.amountCents,
      reason: data.reason,
      operatorName: 'Controlador Financeiro',
      isPartial: data.isPartial
    })
    setActionNotice(res.message)
    loadData()
  }

  const handleManualReviewAction = async (data: { decision: 'aprovar' | 'bloquear'; notes: string }) => {
    if (!selectedPaymentForReview) return
    const res = await PaymentsEnterpriseService.reviewFraud({
      paymentId: selectedPaymentForReview.id,
      decision: data.decision,
      notes: data.notes,
      reviewerName: 'Auditor de Risco Disk Core'
    })
    setActionNotice(res.message)
    loadData()
  }

  const handleContestChargeback = async (id: string) => {
    const res = await PaymentsEnterpriseService.contestChargeback(id, 'Dossiê completo com log de catraca transmitido')
    setActionNotice(res.message)
    loadData()
  }

  const handleResolveDivergence = async (id: string) => {
    const res = await PaymentsEnterpriseService.resolveDivergence(id, 'Ajuste contábil aprovado na alçada do gerente', 'Gerente Financeiro')
    setActionNotice(res.message)
    loadData()
  }

  const handleReprocessWebhook = async (id: string) => {
    const res = await PaymentsEnterpriseService.reprocessWebhook(id)
    setActionNotice(res.message)
    loadData()
  }

  return (
    <div className="space-y-2 w-full max-w-none animate-fadeIn" data-testid="payments-hub">
      {/* Modais Alinhados */}
      {selectedPaymentForDossier && (
        <PaymentDossier360Modal
          payment={selectedPaymentForDossier}
          onClose={() => setSelectedPaymentForDossier(null)}
          onRefund={handleRefundAction}
        />
      )}

      {selectedPaymentForReview && (
        <ManualReviewModal
          payment={selectedPaymentForReview}
          onClose={() => setSelectedPaymentForReview(null)}
          onConfirm={handleManualReviewAction}
        />
      )}

      {selectedPaymentForPix && (
        <PixPaymentModal
          payment={selectedPaymentForPix}
          onClose={() => setSelectedPaymentForPix(null)}
          onSimulateSuccess={() => {
            setActionNotice('Pagamento PIX confirmado e conciliado no Core!')
            loadData()
          }}
        />
      )}

      {/* Notificação Temporária de Sucesso */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <button type="button" onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900">
            ×
          </button>
        </div>
      )}

      {/* Cabeçalho da Central de Pagamentos */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Landmark className="w-4 h-4" />
            Disk Core • Orquestrador Financeiro Omnichannel
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Central de Pagamentos Enterprise
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestão integrada de PIX, cartões, adquirentes, motor antifraude, split de pagamentos, liquidações e conciliação em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToOrders && (
            <button
              type="button"
              onClick={onNavigateToOrders}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Ver Pedidos</span>
            </button>
          )}

          {onNavigateToFinance && (
            <button
              type="button"
              onClick={onNavigateToFinance}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Scale className="w-3.5 h-3.5 text-slate-600" />
              <span>Dashboard Financeiro</span>
            </button>
          )}

          <button
            type="button"
            onClick={loadData}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Painel</span>
          </button>
          <span className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Payment Core Homologado
          </span>
        </div>
      </div>

      {/* 4 Cards Principais de Indicadores (29.9.3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Volume Processado Hoje</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              R$ {summary ? (summary.totalProcessedCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '3.842.920,00'}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              {summary ? summary.totalPaymentsCount.toLocaleString('pt-BR') : '28.491'} transações
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taxa de Aprovação</p>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">
              {summary ? summary.approvalRatePercentage.toFixed(2) : '91,23'}%
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {summary ? summary.approvedPaymentsCount.toLocaleString('pt-BR') : '25.992'} aprovadas
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">PIX vs Cartões</p>
            <p className="text-lg font-black text-slate-900 mt-1">
              PIX: R$ {summary ? (summary.pixVolumeCents / 100).toLocaleString('pt-BR', { notation: 'compact' }) : '1.42M'}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Cartão: R$ {summary ? (summary.cardsVolumeCents / 100).toLocaleString('pt-BR', { notation: 'compact' }) : '2.31M'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saúde da Conciliação</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              {summary ? summary.healthScorePercentage.toFixed(2) : '99,97'}%
            </p>
            <p className="text-xs text-rose-600 font-medium mt-1">
              {summary ? summary.divergenceCount : 4} divergências pendentes
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Barra de Navegação das 8 Abas Especializadas */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Visão Geral</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'transactions'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Transações & Meios</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pix_cards')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'pix_cards'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>PIX, Cartões & PDV</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('antifraud')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'antifraud'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Antifraude & Risco</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('chargebacks')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'chargebacks'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Chargebacks</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reconciliation')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'reconciliation'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Conciliação & Divergências</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settlement_split')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'settlement_split'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Split className="w-4 h-4" />
          <span>Liquidações & Split</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('webhooks_dev')}
          className={`py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'webhooks_dev'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Webhook className="w-4 h-4" />
          <span>Webhooks & Diagnóstico</span>
        </button>
      </div>

      {/* Filtros Globais (29.9.4) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por ID (PAY-98281), Pedido, Titular, Evento ou Correlação..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white"
          >
            <option value="todos">Todos os Meios</option>
            <option value="pix">PIX</option>
            <option value="credit_card">Cartão de Crédito</option>
            <option value="debit_card">Cartão de Débito</option>
            <option value="tef_pos">TEF / POS</option>
            <option value="cash">Dinheiro</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white"
          >
            <option value="todos">Todos os Status</option>
            <option value="aprovado">Aprovado</option>
            <option value="em_analise_risco">Em Análise de Risco</option>
            <option value="recusado">Recusado</option>
            <option value="chargeback">Chargeback</option>
            <option value="estornado">Estornado</option>
          </select>

          <select
            value={gatewayFilter}
            onChange={e => setGatewayFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white"
          >
            <option value="todos">Todos os Gateways</option>
            <option value="banco_brasil_pix">Banco do Brasil PIX</option>
            <option value="cielo">Cielo</option>
            <option value="stone">Stone</option>
            <option value="rede">Rede</option>
            <option value="tef_local">TEF Local</option>
          </select>
        </div>
      </div>

      {/* ABA 1: VISÃO GERAL */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Métricas por Gateway (29.9.65) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Landmark className="w-4 h-4 text-indigo-600" />
              <span>Desempenho por Gateway & PSP Homologado</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">Banco do Brasil PIX</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">Saudável</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Volume</span>
                    <span className="font-black text-slate-900">R$ 1.420.380</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Aprovação</span>
                    <span className="font-black text-emerald-600">97,8%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Latência Média</span>
                    <span className="font-bold text-slate-700">840ms</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Falhas PSP</span>
                    <span className="font-bold text-slate-700">0,02%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">Cielo E-commerce</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">Saudável</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Volume</span>
                    <span className="font-black text-slate-900">R$ 1.680.500</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Aprovação</span>
                    <span className="font-black text-indigo-600">92,4%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Latência Média</span>
                    <span className="font-bold text-slate-700">1.120ms</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Chargebacks</span>
                    <span className="font-bold text-rose-600">0,38%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">Stone / TEF PDV</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">Saudável</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Volume</span>
                    <span className="font-black text-slate-900">R$ 742.040</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Aprovação</span>
                    <span className="font-black text-emerald-600">99,1%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Latência Média</span>
                    <span className="font-bold text-slate-700">450ms</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Estornos</span>
                    <span className="font-bold text-slate-700">0,12%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alertas Financeiros & Integridade (29.9.64 & 29.9.72) */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black uppercase tracking-wider">Centro de Integridade Financeira (24h)</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Saúde Financeira: 99,97%
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-slate-400 block">Pagamentos Inconsistentes</span>
                <span className="text-lg font-black text-emerald-400">0</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-slate-400 block">Divergências de Conciliação</span>
                <span className="text-lg font-black text-amber-400">4 pendentes</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-slate-400 block">Fila de Risco Antifraude</span>
                <span className="text-lg font-black text-indigo-300">14 em análise</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-slate-400 block">Ledger em Partida Dobrada</span>
                <span className="text-lg font-black text-emerald-400">100% OK</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: TRANSAÇÕES & MEIOS */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Extrato Operacional de Pagamentos
              </h3>
              <p className="text-xs text-slate-500">
                Transações capturadas, identificadas e conciliadas no Disk Core.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">{payments.length} transações</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">ID Pagamento</th>
                  <th className="py-3 px-4">Pedido / Titular</th>
                  <th className="py-3 px-4">Evento / Produtora</th>
                  <th className="py-3 px-4">Meio & Gateway</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Risco</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      {payment.id}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{payment.customerName}</p>
                      <p className="font-mono text-slate-400 text-[11px]">{payment.orderId}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800 truncate max-w-[200px]">{payment.eventTitle}</p>
                      <p className="text-slate-400 text-[11px] truncate max-w-[200px]">{payment.producerName}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {payment.method === 'pix' ? (
                          <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">PIX</span>
                        ) : payment.method === 'tef_pos' ? (
                          <span className="px-2 py-0.5 rounded font-bold bg-purple-100 text-purple-800">POS</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded font-bold bg-indigo-100 text-indigo-800">Cartão</span>
                        )}
                        <span className="text-[11px] font-mono text-slate-500 uppercase">{payment.gateway}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      R$ {(payment.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          payment.status === 'aprovado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : payment.status === 'em_analise_risco'
                            ? 'bg-amber-100 text-amber-800'
                            : payment.status === 'chargeback'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          payment.risk.level === 'baixo'
                            ? 'text-emerald-700 bg-emerald-50'
                            : payment.risk.level === 'medio'
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {payment.risk.score}/100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentForDossier(payment)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Dossiê</span>
                        </button>
                        {payment.method === 'pix' && (
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentForPix(payment)}
                            className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                            title="Ver QR Code PIX"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: PIX, CARTÕES & PDV */}
      {activeTab === 'pix_cards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bloco PIX */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <span>Motor PIX Instantâneo (PSP Direto)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Banco Central Conectado
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Geração atômica com tempo de expiração estrito (10 minutos), validação de webhook com assinatura HMAC e tratamento para PIX pago próximo da expiração (29.9.11).
              </p>
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Provedor PSP Padrão:</span>
                  <span className="font-bold text-slate-900">Banco do Brasil S.A.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Latência Média de Confirmação:</span>
                  <span className="font-bold text-emerald-700">1.8 segundos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Regra de Idempotência:</span>
                  <span className="font-bold text-indigo-700">txId Único por Pedido</span>
                </div>
              </div>
            </div>

            {/* Bloco Cartões & Tokenização */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <span>Tokenização & Segurança PCI (29.9.14)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                  PCI DSS Nível 1
                </span>
              </div>
              <p className="text-xs text-slate-600">
                O Disk Core <b>não armazena número completo de cartão ou CVV</b>. Apenas tokens, bandeira, 4 últimos dígitos e códigos de autorização trafegam internamente.
              </p>
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Regra de Parcelamento:</span>
                  <span className="font-bold text-slate-900">Até 12x com Repasse MDR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Gateways Ativos:</span>
                  <span className="font-bold text-slate-900">Cielo, Stone, Rede</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Proteção Timeout (29.9.24):</span>
                  <span className="font-bold text-emerald-700">Consulta Status Pré-Retry</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: ANTIFRAUDE & RISCO */}
      {activeTab === 'antifraud' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Fila de Revisão Manual de Antifraude (29.9.30)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Transações com score elevado ou flags de velocidade aguardando liberação auditada.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold">
              {payments.filter(p => p.status === 'em_analise_risco').length} Pendentes
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4">Titular / CPF</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4">Motivo / Flags de Risco</th>
                  <th className="py-3 px-4 text-center">Ações de Auditoria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments
                  .filter(p => p.status === 'em_analise_risco' || p.risk.level === 'alto')
                  .map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{p.id}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{p.customerName}</p>
                        <p className="text-slate-500 text-[11px]">{p.customerDocument}</p>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        R$ {(p.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded font-black text-rose-700 bg-rose-100">
                          {p.risk.score}/100
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.risk.evaluatedSignals.map((sig, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                              {sig}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentForReview(p)}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition text-xs shadow-sm"
                        >
                          Revisar Decisão
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 5: CHARGEBACKS */}
      {activeTab === 'chargebacks' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                <span>Central de Chargebacks & Contestações (29.9.44 - 29.9.46)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Dossiês com validação de check-in em catraca física e evidências probatórias.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-red-100 text-red-900 rounded-full text-xs font-bold">
              R$ 18.920 em risco
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">ID Caso</th>
                  <th className="py-3 px-4">Pagamento / Pedido</th>
                  <th className="py-3 px-4">Evento / Produtora</th>
                  <th className="py-3 px-4 text-right">Valor Disputado</th>
                  <th className="py-3 px-4 text-center">Ingresso Utilizado?</th>
                  <th className="py-3 px-4 text-center">Prazo Limite</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chargebacks.map(chg => (
                  <tr key={chg.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{chg.id}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {chg.paymentId} ({chg.orderId})
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{chg.eventTitle}</p>
                      <p className="text-slate-400 text-[11px]">{chg.producerName}</p>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-rose-600">
                      R$ {(chg.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {chg.ticketUsed ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[11px]">
                            SIM (Portão 03)
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5">{chg.checkinAt}</span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold text-[11px]">
                          NÃO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {chg.deadlineAt}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleContestChargeback(chg.id)}
                        disabled={chg.status === 'contestado'}
                        className={`px-3 py-1 rounded-lg font-bold text-xs shadow-sm transition ${
                          chg.status === 'contestado'
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {chg.status === 'contestado' ? 'Contestado OK' : 'Enviar Evidências'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 6: CONCILIAÇÃO & DIVERGÊNCIAS */}
      {activeTab === 'reconciliation' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" />
                <span>Central de Divergências & Conciliação Automática (29.9.49 - 29.9.52)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Matching automatizado entre Pedido, Adquirente/PSP e Balancete do Ledger.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold">
              {reconciliations.filter(r => r.status === 'divergente').length} Divergências Ativas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Registro</th>
                  <th className="py-3 px-4">Pagamento / Gateway</th>
                  <th className="py-3 px-4 text-right">Valor Esperado</th>
                  <th className="py-3 px-4 text-right">Valor Recebido</th>
                  <th className="py-3 px-4 text-right">Diferença</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reconciliations.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{rec.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-indigo-600">{rec.paymentId}</p>
                      <p className="text-slate-400 text-[11px] uppercase">{rec.gateway}</p>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      R$ {(rec.expectedAmountCents / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      R$ {(rec.receivedAmountCents / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-rose-600">
                      R$ {(rec.differenceCents / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                          rec.status === 'auto_conciliado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'resolvido_manualmente'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {rec.status === 'divergente' ? (
                        <button
                          type="button"
                          onClick={() => handleResolveDivergence(rec.id)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition text-xs shadow-sm"
                        >
                          Compensar Ledger
                        </button>
                      ) : (
                        <span className="text-slate-400 font-semibold text-xs">Concluído</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 7: LIQUIDAÇÕES & SPLIT */}
      {activeTab === 'settlement_split' && (
        <div className="space-y-6">
          {/* Agenda de Recebíveis (29.9.38) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Agenda de Recebíveis & Liquidações Futuras</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-slate-500 uppercase">Hoje</span>
                <p className="text-xl font-black text-slate-900 mt-1">R$ 82.000,00</p>
                <span className="text-[11px] text-emerald-600 font-semibold">100% compensado</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-slate-500 uppercase">Amanhã</span>
                <p className="text-xl font-black text-slate-900 mt-1">R$ 37.000,00</p>
                <span className="text-[11px] text-slate-500">Agendado adquirente</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-slate-500 uppercase">Próximos 7 dias</span>
                <p className="text-xl font-black text-slate-900 mt-1">R$ 281.000,00</p>
                <span className="text-[11px] text-slate-500">Em processamento</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-slate-500 uppercase">Próximos 30 dias</span>
                <p className="text-xl font-black text-slate-900 mt-1">R$ 920.000,00</p>
                <span className="text-[11px] text-slate-500">Vendas parceladas</span>
              </div>
            </div>
          </div>

          {/* Composição do Saldo do Produtor (29.9.37) */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>Garantia de Saldo Não Editável Manualmente (29.9.37)</span>
            </h4>
            <p className="text-xs text-slate-600">
              O saldo exibido ao produtor é consequência matemática estrita de vendas, recebimentos, taxas contratuais congeladas no snapshot e reservas de chargeback:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Saldo Vendido</span>
                <span className="font-black text-slate-900">R$ 500.000,00</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Reserva de Risco</span>
                <span className="font-black text-rose-600">- R$ 18.920,00</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Em Liquidação</span>
                <span className="font-black text-amber-600">- R$ 38.420,00</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-300 bg-emerald-50/50">
                <span className="text-emerald-800 font-bold block">Saldo Disponível</span>
                <span className="font-black text-emerald-700">R$ 442.660,00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 8: WEBHOOKS & DIAGNÓSTICO DEVELOPER */}
      {activeTab === 'webhooks_dev' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Webhook className="w-4 h-4 text-indigo-600" />
                <span>Pipeline de Webhooks & Idempotência (29.9.56 - 29.9.58)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Assinatura criptográfica validada, proteção contra replay e reprocessamento idempotente.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
              42.810 Processados Hoje
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">ID Webhook</th>
                  <th className="py-3 px-4">Gateway</th>
                  <th className="py-3 px-4">Tipo do Evento</th>
                  <th className="py-3 px-4">Resumo do Payload</th>
                  <th className="py-3 px-4 text-center">Assinatura</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {webhooks.map(whk => (
                  <tr key={whk.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{whk.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 uppercase">{whk.gateway}</td>
                    <td className="py-3 px-4 font-mono text-indigo-600">{whk.eventType}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px] truncate max-w-[280px]">
                      {whk.payloadSummary}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {whk.signatureValid ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                          HMAC Válida
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                          Inválida
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                          whk.status === 'processado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {whk.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleReprocessWebhook(whk.id)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition text-xs shadow-sm flex items-center gap-1 mx-auto"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reprocessar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
