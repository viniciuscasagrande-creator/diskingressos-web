import React, { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Layers,
  CheckCircle2,
  DollarSign,
  Ticket,
  Store,
  Globe,
  Building,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  CreditCard,
  Users,
  Scan,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react'
import { commerceCoreService } from '../../services/commerceCore.service'
import type {
  OrderRecord,
  CommerceKpiSummary,
  SalesChannel,
  OrderStatus
} from '../../types/commerce-orders.types'
import { OrderDossier360Modal } from './OrderDossier360Modal'
import { LimitlessPage } from '../../integrations/limitless/LimitlessPage'

interface CommerceOrdersHubPageProps {
  onNavigateToPayments?: () => void
  onNavigateToTickets?: () => void
  onNavigateToAccess?: () => void
  onNavigateToCustomers?: () => void
}

export const CommerceOrdersHubPage: React.FC<CommerceOrdersHubPageProps> = ({
  onNavigateToPayments,
  onNavigateToTickets,
  onNavigateToAccess,
  onNavigateToCustomers
}) => {
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
        return (
          <span className="badge badge-subtle-success">
            <CheckCircle2 className="w-3 h-3" /> Pago
          </span>
        )
      case 'FULFILLED':
        return (
          <span className="badge badge-subtle-info">
            <CheckCircle2 className="w-3 h-3" /> Concluído
          </span>
        )
      case 'AWAITING_PAYMENT':
        return (
          <span className="badge badge-subtle-warning">
            <AlertCircle className="w-3 h-3" /> Aguardando Pagamento
          </span>
        )
      case 'REFUNDED':
        return (
          <span className="badge badge-subtle-danger">
            <AlertCircle className="w-3 h-3" /> Estornado
          </span>
        )
      default:
        return <span className="badge badge-subtle-primary">{status}</span>
    }
  }

  const getChannelBadge = (channel: SalesChannel) => {
    switch (channel) {
      case 'SITE':
        return (
          <span className="badge badge-subtle-info">
            <Globe className="w-3 h-3" /> Site
          </span>
        )
      case 'BOX_OFFICE':
        return (
          <span className="badge badge-subtle-purple">
            <Building className="w-3 h-3" /> Bilheteria
          </span>
        )
      case 'PDV':
        return (
          <span className="badge badge-subtle-indigo">
            <Store className="w-3 h-3" /> PDV
          </span>
        )
      case 'DISK':
        return (
          <span className="badge badge-subtle-success">
            <UserCheck className="w-3 h-3" /> Produtor
          </span>
        )
      default:
        return <span className="badge">{channel}</span>
    }
  }

  return (
    <LimitlessPage dataTestId="commerce-orders-hub" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Page Header Limitless */}
      <div className="card border-0 shadow-none bg-transparent mb-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--ll-border)]">
          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="badge badge-subtle-primary">
                Operação Omnichannel • Vendas & Ingressos
              </span>
              <span className="badge badge-subtle-info">
                <ShieldCheck className="w-3.5 h-3.5" />
                Commerce Core Homologado
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ll-text)]">
              Pedidos, Ingressos & Integridade Operacional
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ll-text-2)] mt-1 leading-relaxed">
              Operação unificada do Commerce Core: vendas originadas pelo Site, Bilheterias, PDVs e Portal do Produtor.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="btn-primary flex items-center gap-2 text-xs cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar Vendas</span>
            </button>
          </div>
        </div>

        {/* Toolbar de Acesso Rápido aos Módulos Operacionais Conectados */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <span className="text-xs font-semibold text-[var(--ll-text-muted)] mr-1">Navegação rápida:</span>
          {onNavigateToPayments && (
            <button
              type="button"
              onClick={onNavigateToPayments}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              data-testid="goto-payments-btn"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Central de Pagamentos</span>
            </button>
          )}
          {onNavigateToTickets && (
            <button
              type="button"
              onClick={onNavigateToTickets}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              data-testid="goto-tickets-btn"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Ingressos & QR Codes</span>
            </button>
          )}
          {onNavigateToAccess && (
            <button
              type="button"
              onClick={onNavigateToAccess}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              data-testid="goto-access-btn"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Disk Acesso</span>
            </button>
          )}
          {onNavigateToCustomers && (
            <button
              type="button"
              onClick={onNavigateToCustomers}
              className="px-3 py-1.5 bg-[var(--ll-surface)] hover:bg-[var(--ll-muted)] text-[var(--ll-text)] border border-[var(--ll-border)] text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              data-testid="goto-customers-btn"
            >
              <Users className="w-3.5 h-3.5 text-[var(--ll-primary)]" />
              <span>Central de Clientes</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Cards de Métricas Reais no Estilo Limitless */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento */}
        <div className="kpi-card-limitless">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ll-text-muted)]">
              Faturamento do Dia
            </span>
            <div className="text-xl lg:text-2xl font-black mt-1 text-[var(--ll-text)]">
              {summary ? `R$ ${summary.todayRevenueBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {summary && summary.ordersPerMinute > 0 ? `${summary.ordersPerMinute} pedidos / min` : 'Dados reais do banco'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Ingressos */}
        <div className="kpi-card-limitless">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ll-text-muted)]">
              Ingressos Emitidos Hoje
            </span>
            <div className="text-xl lg:text-2xl font-black mt-1 text-[var(--ll-text)]">
              {summary ? summary.ticketsIssuedToday.toLocaleString('pt-BR') : '0'}
            </div>
            <p className="text-[11px] text-[var(--ll-text-muted)] font-medium mt-1">
              Consolidado em tempo real
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Holds Ativos */}
        <div className="kpi-card-limitless">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ll-text-muted)]">
              Holds Ativos (Redis)
            </span>
            <div className="text-xl lg:text-2xl font-black mt-1 text-[var(--ll-text)]">
              {summary ? summary.activeHoldsCount.toLocaleString('pt-BR') : '0'}
            </div>
            <p className="text-[11px] text-orange-600 dark:text-orange-400 font-medium mt-1">
              Reserva anti-overbooking
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Aprovação */}
        <div className="kpi-card-limitless">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ll-text-muted)]">
              Aprovação de Checkout
            </span>
            <div className="text-xl lg:text-2xl font-black mt-1 text-[var(--ll-text)]">
              {summary && summary.approvalRatePercentage > 0 ? `${summary.approvalRatePercentage.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
              Conversão de pagamentos
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Alerta de Integridade Comercial do Core (Estilo Limitless Callout) */}
      <div className="card p-4 bg-[var(--ll-surface)] border-l-4 border-l-[var(--ll-primary)] shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--ll-primary)] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ll-primary)]">
                Commerce Integrity Center • Monitoramento de Consistência
              </h3>
              <p className="text-xs text-[var(--ll-text-2)] mt-0.5">
                Reconciliação contínua entre reservas no Redis, pagamentos de adquirentes e emissão de ingressos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--ll-muted)]">
              <span className={`w-2 h-2 rounded-full ${(summary?.integrityAlerts?.inconsistentOrders ?? 0) > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span className="text-[var(--ll-text-muted)]">Inconsistências:</span>
              <strong className={(summary?.integrityAlerts?.inconsistentOrders ?? 0) > 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}>
                {summary?.integrityAlerts?.inconsistentOrders ?? 0}
              </strong>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--ll-muted)]">
              <span className={`w-2 h-2 rounded-full ${(summary?.integrityAlerts?.paymentsWithoutTickets ?? 0) > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className="text-[var(--ll-text-muted)]">Sem Ingresso:</span>
              <strong className={(summary?.integrityAlerts?.paymentsWithoutTickets ?? 0) > 0 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}>
                {summary?.integrityAlerts?.paymentsWithoutTickets ?? 0}
              </strong>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--ll-muted)]">
              <span className={`w-2 h-2 rounded-full ${(summary?.integrityAlerts?.ticketsWithoutLedger ?? 0) > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span className="text-[var(--ll-text-muted)]">Sem Ledger:</span>
              <strong className={(summary?.integrityAlerts?.ticketsWithoutLedger ?? 0) > 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}>
                {summary?.integrityAlerts?.ticketsWithoutLedger ?? 0}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca (Estilo Limitless Card) */}
      <div className="card p-3 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Abas de Canais de Venda em Segmented Control */}
          <div className="limitless-tabs overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveChannelTab('TODOS')}
              className={`limitless-tab-btn ${activeChannelTab === 'TODOS' ? 'active' : ''}`}
            >
              Todos os Canais
            </button>
            <button
              type="button"
              onClick={() => setActiveChannelTab('SITE')}
              className={`limitless-tab-btn ${activeChannelTab === 'SITE' ? 'active' : ''}`}
            >
              Site Oficial
            </button>
            <button
              type="button"
              onClick={() => setActiveChannelTab('BOX_OFFICE')}
              className={`limitless-tab-btn ${activeChannelTab === 'BOX_OFFICE' ? 'active' : ''}`}
            >
              Bilheteria
            </button>
            <button
              type="button"
              onClick={() => setActiveChannelTab('PDV')}
              className={`limitless-tab-btn ${activeChannelTab === 'PDV' ? 'active' : ''}`}
            >
              PDV
            </button>
            <button
              type="button"
              onClick={() => setActiveChannelTab('DISK')}
              className={`limitless-tab-btn ${activeChannelTab === 'DISK' ? 'active' : ''}`}
            >
              Portal Produtor
            </button>
          </div>

          {/* Busca e Status */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--ll-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar pedido, cliente, CPF..."
                className="form-control w-full pl-9 pr-4 text-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="form-select text-xs font-medium cursor-pointer"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="PAID">Pago</option>
              <option value="FULFILLED">Concluído</option>
              <option value="AWAITING_PAYMENT">Aguardando Pagamento</option>
              <option value="REFUNDED">Estornado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Pedidos Omnichannel no Estilo Limitless */}
      <div className="card overflow-hidden shadow-sm">
        <div className="card-header">
          <h2 className="card-title text-sm font-bold flex items-center gap-2">
            <span>Listagem de Pedidos Omnichannel</span>
            <span className="badge badge-subtle-primary">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Pedido / Protocolo</th>
                <th>Canal</th>
                <th>Cliente / Comprador</th>
                <th>Evento & Sessão</th>
                <th className="text-center">Ingressos</th>
                <th className="text-right">Valor Total</th>
                <th>Status</th>
                <th className="text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--ll-text-muted)] text-xs">
                    Nenhum pedido encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono">
                      <p className="font-bold text-[var(--ll-text)]">{order.id}</p>
                      <p className="text-[10px] text-[var(--ll-text-muted)]">{order.protocol}</p>
                    </td>
                    <td>
                      {getChannelBadge(order.channel)}
                    </td>
                    <td>
                      <p className="font-bold text-[var(--ll-text)]">{order.customerName}</p>
                      <p className="text-[10px] text-[var(--ll-text-muted)] font-mono">{order.customerEmail}</p>
                    </td>
                    <td className="max-w-xs truncate">
                      <p className="font-semibold text-[var(--ll-text)] truncate">{order.eventName}</p>
                      <p className="text-[10px] text-[var(--ll-text-muted)]">{order.sessionDate}</p>
                    </td>
                    <td className="text-center font-bold text-[var(--ll-text)]">
                      {order.tickets.length}
                    </td>
                    <td className="text-right font-bold text-[var(--ll-text)] font-mono">
                      R$ {order.totalAmount.toFixed(2)}
                    </td>
                    <td>
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 dark:text-indigo-300 rounded-lg font-bold text-xs transition flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <span>Dossiê do Pedido</span>
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

      {/* Modal do Dossiê Completo do Pedido */}
      {selectedOrder && (
        <OrderDossier360Modal
          order={selectedOrder}
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={loadData}
        />
      )}
    </LimitlessPage>
  )
}
export default CommerceOrdersHubPage

