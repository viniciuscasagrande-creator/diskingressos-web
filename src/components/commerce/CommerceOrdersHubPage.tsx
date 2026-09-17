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
  CreditCard,
  Users,
  Scan
} from 'lucide-react'
import { commerceCoreService } from '../../services/commerceCore.service'
import type {
  OrderRecord,
  CommerceKpiSummary,
  SalesChannel,
  OrderStatus
} from '../../types/commerce-orders.types'
import { OrderDossier360Modal } from './OrderDossier360Modal'
import {
  DiskPageHeader,
  DiskKpiCard,
  DiskButton,
  DiskBadge
} from '../../design-system'

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
        return <DiskBadge variant="success" size="sm">Pago</DiskBadge>
      case 'FULFILLED':
        return <DiskBadge variant="info" size="sm">Concluído</DiskBadge>
      case 'AWAITING_PAYMENT':
        return <DiskBadge variant="warning" size="sm">Aguardando Pagamento</DiskBadge>
      case 'REFUNDED':
        return <DiskBadge variant="danger" size="sm">Estornado</DiskBadge>
      default:
        return <DiskBadge variant="neutral" size="sm">{status}</DiskBadge>
    }
  }

  const getChannelBadge = (channel: SalesChannel) => {
    switch (channel) {
      case 'SITE':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 flex items-center gap-1">
            <Globe className="w-3 h-3" /> Site
          </span>
        )
      case 'BOX_OFFICE':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 flex items-center gap-1">
            <Building className="w-3 h-3" /> Bilheteria
          </span>
        )
      case 'PDV':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center gap-1">
            <Store className="w-3 h-3" /> PDV
          </span>
        )
      case 'DISK':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> Produtor
          </span>
        )
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{channel}</span>
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fadeIn" data-testid="commerce-orders-hub">
      {/* Cabeçalho da Central de Vendas Omnichannel com layout fluido e não esmagável */}
      <div className="border-b border-[var(--disk-border-subtle)] pb-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Operação Omnichannel • Vendas & Ingressos
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                Commerce Core Homologado
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--disk-text-primary)] tracking-tight">
              Pedidos, Ingressos & Integridade Operacional
            </h1>
            <p className="text-xs sm:text-sm text-[var(--disk-text-secondary)] mt-1 leading-relaxed">
              Operação unificada do Commerce Core: vendas originadas pelo Site, Bilheterias, PDVs e Portal do Produtor.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
            <DiskButton
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />}
            >
              Atualizar Vendas
            </DiskButton>
          </div>
        </div>

        {/* Toolbar de Acesso Rápido aos Módulos Operacionais Conectados */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--disk-border-subtle)]/60">
          <span className="text-xs font-semibold text-[var(--disk-text-muted)] mr-1">Acesso direto:</span>
          {onNavigateToPayments && (
            <button
              type="button"
              onClick={onNavigateToPayments}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
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
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
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
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
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
              className="px-3 py-1.5 bg-[var(--disk-bg-surface)] hover:bg-[var(--disk-bg-surface-hover)] text-[var(--disk-text-primary)] border border-[var(--disk-border-subtle)] text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
              data-testid="goto-customers-btn"
            >
              <Users className="w-3.5 h-3.5 text-[var(--disk-primary)]" />
              <span>Central de Clientes</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Cards de Métricas Reais com DiskKpiCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DiskKpiCard
          label="Faturamento do Dia"
          value={summary ? `R$ ${summary.todayRevenueBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00'}
          note={summary && summary.ordersPerMinute > 0 ? `${summary.ordersPerMinute} pedidos / minuto` : 'Dados reais do banco'}
          accent="success"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <DiskKpiCard
          label="Ingressos Emitidos Hoje"
          value={summary ? summary.ticketsIssuedToday.toLocaleString('pt-BR') : '0'}
          note="Consolidado no banco"
          accent="info"
          icon={<Ticket className="w-5 h-5" />}
        />
        <DiskKpiCard
          label="Holds Ativos (Redis)"
          value={summary ? summary.activeHoldsCount.toLocaleString('pt-BR') : '0'}
          note="Reserva atômica anti-overbooking"
          accent="brand"
          icon={<Layers className="w-5 h-5" />}
        />
        <DiskKpiCard
          label="Aprovação de Pagamento"
          value={summary && summary.approvalRatePercentage > 0 ? `${summary.approvalRatePercentage.toFixed(1)}%` : '0%'}
          note="Conversão real de checkout"
          accent="purple"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      {/* Alerta de Integridade Comercial do Core (29.8.65) */}
      <div className="bg-[var(--disk-bg-surface-sunken)] text-[var(--disk-text-primary)] border border-[var(--disk-border-subtle)] p-4 rounded-card shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-[var(--disk-primary)] rounded-btn text-white">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--disk-primary)]">
              Commerce Integrity Center • Monitoramento de Consistência
            </h3>
            <p className="text-xs text-[var(--disk-text-muted)] mt-0.5">
              Reconciliação contínua entre reservas no Redis, pagamentos de adquirentes e emissão de ingressos.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${(summary?.integrityAlerts?.inconsistentOrders ?? 0) > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <span className="text-[var(--disk-text-muted)]">Inconsistências:</span>
            <strong className={(summary?.integrityAlerts?.inconsistentOrders ?? 0) > 0 ? 'text-rose-400' : 'text-emerald-500'}>
              {summary?.integrityAlerts?.inconsistentOrders ?? 0}
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${(summary?.integrityAlerts?.paymentsWithoutTickets ?? 0) > 0 ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            <span className="text-[var(--disk-text-muted)]">Pagamentos sem Ingresso:</span>
            <strong className={(summary?.integrityAlerts?.paymentsWithoutTickets ?? 0) > 0 ? 'text-amber-400' : 'text-emerald-500'}>
              {summary?.integrityAlerts?.paymentsWithoutTickets ?? 0}
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${(summary?.integrityAlerts?.ticketsWithoutLedger ?? 0) > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <span className="text-[var(--disk-text-muted)]">Ingressos sem Ledger:</span>
            <strong className={(summary?.integrityAlerts?.ticketsWithoutLedger ?? 0) > 0 ? 'text-rose-400' : 'text-emerald-500'}>
              {summary?.integrityAlerts?.ticketsWithoutLedger ?? 0}
            </strong>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-[var(--disk-bg-surface)] p-4 rounded-card border border-[var(--disk-border-subtle)] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Abas de Canais de Venda */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold bg-[var(--disk-bg-surface-sunken)] p-1 rounded-btn border border-[var(--disk-border-subtle)]">
          <button
            type="button"
            onClick={() => setActiveChannelTab('TODOS')}
            className={`px-3 py-1.5 rounded-btn transition cursor-pointer ${
              activeChannelTab === 'TODOS'
                ? 'bg-[var(--disk-primary)] text-white shadow-xs'
                : 'text-[var(--disk-text-secondary)] hover:text-[var(--disk-text-primary)]'
            }`}
          >
            Todos os Canais
          </button>
          <button
            type="button"
            onClick={() => setActiveChannelTab('SITE')}
            className={`px-3 py-1.5 rounded-btn transition cursor-pointer ${
              activeChannelTab === 'SITE'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-[var(--disk-text-secondary)] hover:text-[var(--disk-text-primary)]'
            }`}
          >
            Site Oficial
          </button>
          <button
            type="button"
            onClick={() => setActiveChannelTab('BOX_OFFICE')}
            className={`px-3 py-1.5 rounded-btn transition cursor-pointer ${
              activeChannelTab === 'BOX_OFFICE'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-[var(--disk-text-secondary)] hover:text-[var(--disk-text-primary)]'
            }`}
          >
            Bilheteria
          </button>
          <button
            type="button"
            onClick={() => setActiveChannelTab('PDV')}
            className={`px-3 py-1.5 rounded-btn transition cursor-pointer ${
              activeChannelTab === 'PDV'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-[var(--disk-text-secondary)] hover:text-[var(--disk-text-primary)]'
            }`}
          >
            PDV
          </button>
          <button
            type="button"
            onClick={() => setActiveChannelTab('DISK')}
            className={`px-3 py-1.5 rounded-btn transition cursor-pointer ${
              activeChannelTab === 'DISK'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[var(--disk-text-secondary)] hover:text-[var(--disk-text-primary)]'
            }`}
          >
            Portal Produtor
          </button>
        </div>

        {/* Busca e Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--disk-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pedido, cliente, CPF..."
              className="w-full pl-9 pr-4 py-2 bg-[var(--disk-bg-surface-sunken)] border border-[var(--disk-border-subtle)] text-[var(--disk-text-primary)] placeholder:text-[var(--disk-text-muted)] rounded-btn text-xs focus:outline-none focus:ring-2 focus:ring-[var(--disk-primary)] transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-[var(--disk-bg-surface-sunken)] border border-[var(--disk-border-subtle)] text-[var(--disk-text-primary)] rounded-btn text-xs font-medium focus:outline-none"
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
      <div className="bg-[var(--disk-bg-surface)] border border-[var(--disk-border-subtle)] rounded-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[var(--disk-bg-surface-sunken)] border-b border-[var(--disk-border-subtle)] text-[var(--disk-text-muted)] font-bold uppercase tracking-wider text-[10px]">
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
            <tbody className="divide-y divide-[var(--disk-border-subtle)]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[var(--disk-text-muted)] text-xs">
                    Nenhum pedido encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--disk-bg-surface-hover)] transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <p className="font-bold text-[var(--disk-text-primary)]">{order.id}</p>
                      <p className="text-[10px] text-[var(--disk-text-muted)]">{order.protocol}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {getChannelBadge(order.channel)}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[var(--disk-text-primary)]">{order.customerName}</p>
                      <p className="text-[10px] text-[var(--disk-text-muted)] font-mono">{order.customerEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <p className="font-semibold text-[var(--disk-text-primary)] truncate">{order.eventName}</p>
                      <p className="text-[10px] text-[var(--disk-text-muted)]">{order.sessionDate}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[var(--disk-text-primary)]">
                      {order.tickets.length}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[var(--disk-text-primary)] font-mono">
                      R$ {order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 dark:text-indigo-300 rounded-btn font-bold text-xs transition flex items-center gap-1 ml-auto cursor-pointer"
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
    </div>
  )
}
