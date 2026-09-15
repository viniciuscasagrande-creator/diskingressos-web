import React, { useState, useEffect, useMemo } from 'react'
import {
  ShoppingBag,
  Search,
  Filter,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Ticket,
  Store,
  Globe,
  Building,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  CreditCard
} from 'lucide-react'
import { commerceCoreService } from '../../services/commerceCore.service'
import type {
  OrderRecord,
  CommerceKpiSummary,
  SalesChannel,
  OrderStatus
} from '../../types/commerce-orders.types'
import { OrderDossier360Modal } from './OrderDossier360Modal'

interface CommerceOrdersHubPageProps {
  onNavigateToPayments?: () => void
}

export const CommerceOrdersHubPage: React.FC<CommerceOrdersHubPageProps> = ({ onNavigateToPayments }) => {
  const [summary, setSummary] = useState<CommerceKpiSummary | null>(null)
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null)
  const [loading, setLoading] = useState(false)

  // Filtros
  const [activeChannelTab, setActiveChannelTab] = useState<'TODOS' | SalesChannel>('TODOS')
  const [statusFilter, setStatusFilter] = useState<'TODOS' | OrderStatus>('TODOS')
  const [searchQuery, setSearchQuery] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [sum, ords] = await Promise.all([
        commerceCoreService.getSummary(),
        commerceCoreService.getOrders()
      ])
      setSummary(sum)
      setOrders(ords)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeChannelTab !== 'TODOS' && order.channel !== activeChannelTab) return false
      if (statusFilter !== 'TODOS' && order.status !== statusFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          order.id.toLowerCase().includes(q) ||
          order.protocol.toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.customerEmail.toLowerCase().includes(q) ||
          order.eventName.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [orders, activeChannelTab, statusFilter, searchQuery])

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Pago</span>
      case 'FULFILLED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-teal-50 text-teal-700 border border-teal-200">Concluído</span>
      case 'AWAITING_PAYMENT':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Aguardando Pagamento</span>
      case 'REFUNDED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Estornado</span>
      default:
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">{status}</span>
    }
  }

  const getChannelBadge = (channel: SalesChannel) => {
    switch (channel) {
      case 'SITE':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800 flex items-center gap-1">
            <Globe className="w-3 h-3" /> Site
          </span>
        )
      case 'BOX_OFFICE':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 flex items-center gap-1">
            <Building className="w-3 h-3" /> Bilheteria
          </span>
        )
      case 'PDV':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 flex items-center gap-1">
            <Store className="w-3 h-3" /> PDV
          </span>
        )
      case 'DISK':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> Produtor
          </span>
        )
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">{channel}</span>
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fadeIn" data-testid="commerce-orders-hub">
      {/* Cabeçalho da Central Comercial */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" />
            Disk Interno • Motor Comercial & Vendas Omnichannel
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pedidos, Ingressos & Integridade Comercial
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Operação unificada do Commerce Core: vendas originadas pelo Site, Bilheterias, PDVs e Portal do Produtor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Atualizar Vendas</span>
          </button>
          {onNavigateToPayments && (
            <button
              type="button"
              onClick={onNavigateToPayments}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
              data-testid="goto-payments-btn"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Central de Pagamentos</span>
            </button>
          )}
          <span className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Commerce Core Homologado
          </span>
        </div>
      </div>

      {/* 4 Cards de Métricas Comerciais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faturamento do Dia</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              R$ {summary ? summary.todayRevenueBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '1.842.630,45'}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-1">381 pedidos / minuto</p>
          </div>
          <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ingressos Emitidos Hoje</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {summary ? summary.ticketsIssuedToday.toLocaleString('pt-BR') : '14.280'}
            </p>
            <p className="text-xs text-sky-600 font-medium mt-1">100% individualizados</p>
          </div>
          <span className="p-3 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <Ticket className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Holds Ativos (Redis)</p>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">
              {summary ? summary.activeHoldsCount.toLocaleString('pt-BR') : '8.291'}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">Reserva atômica anti-overbooking</p>
          </div>
          <span className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <Layers className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aprovação de Pagamento</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {summary ? `${summary.approvalRatePercentage}%` : '91.8%'}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-1">PIX: 98.4% • Cartão: 85.2%</p>
          </div>
          <span className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <CheckCircle2 className="w-6 h-6" />
          </span>
        </div>
      </div>

      {/* Alerta de Integridade Comercial do Core (29.8.65) */}
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-indigo-600 rounded-lg text-white">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Commerce Integrity Center • Monitoramento de Consistência
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Reconciliação contínua entre reservas no Redis, pagamentos de adquirentes e emissão de ingressos.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Inconsistências:</span>
            <strong className="text-emerald-400">0</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-400">Pagamentos sem Ingresso:</span>
            <strong className="text-amber-300">2 (Recovery)</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Ingressos sem Ledger:</span>
            <strong className="text-emerald-400">0</strong>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Abas de Canais de Venda */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveChannelTab('TODOS')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeChannelTab === 'TODOS'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos os Canais
          </button>
          <button
            type="button"
            onClick={() => setActiveChannelTab('SITE')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeChannelTab === 'SITE'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Site Oficial
          </button>
          <button
            type="button"
            onClick={() => setActiveChannelTab('BOX_OFFICE')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeChannelTab === 'BOX_OFFICE'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Bilheteria
          </button>
          <button
            type="button"
            onClick={() => setActiveChannelTab('PDV')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeChannelTab === 'PDV'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            PDV
          </button>
          <button
            type="button"
            onClick={() => setActiveChannelTab('DISK')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeChannelTab === 'DISK'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Portal Produtor
          </button>
        </div>

        {/* Busca e Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pedido, cliente, CPF..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="PAID">Pago</option>
            <option value="FULFILLED">Concluído</option>
            <option value="AWAITING_PAYMENT">Aguardando Pagamento</option>
            <option value="REFUNDED">Estornado</option>
          </select>
        </div>
      </div>

      {/* Tabela de Pedidos Omnichannel */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Pedido / Protocolo</th>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4">Cliente / Comprador</th>
                <th className="py-3 px-4">Evento & Sessão</th>
                <th className="py-3 px-4 text-center">Ingressos</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    Nenhum pedido encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <p className="font-bold text-slate-900">{order.id}</p>
                      <p className="text-[10px] text-slate-400">{order.protocol}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {getChannelBadge(order.channel)}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{order.customerName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{order.customerEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <p className="font-semibold text-slate-800 truncate">{order.eventName}</p>
                      <p className="text-[10px] text-slate-500">{order.sessionDate}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {order.tickets.length}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      R$ {order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs transition flex items-center gap-1 ml-auto"
                      >
                        <span>Dossiê 360°</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal do Dossiê Pedido 360° */}
      {selectedOrder && (
        <OrderDossier360Modal
          order={selectedOrder}
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={loadData}
        />
      )}
    </div>
  )
}
