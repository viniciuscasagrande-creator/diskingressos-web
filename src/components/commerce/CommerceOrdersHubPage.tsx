import React, { useState, useEffect, useMemo } from 'react'
import {
  DollarSign,
  Ticket,
  Layers,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  CreditCard,
  Scan,
  Users,
  Eye,
  FileText
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
  DiskToolbar,
  DiskToolbarButton,
  DiskKpiCard,
  DiskCard,
  DiskFilters,
  DiskDataTable,
  DiskStatusBadge,
  DiskEmptyState,
  type DiskTableColumn
} from '../ui/disk'

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

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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

  // Reseta para página 1 ao alterar filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [activeChannelTab, statusFilter, searchQuery])

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

  // Dados fatiados para a página ativa
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredOrders.slice(start, start + pageSize)
  }, [filteredOrders, currentPage, pageSize])

  // Contagem por canal para as abas
  const channelCounts = useMemo(() => {
    const counts: Record<string, number> = {
      TODOS: orders.length,
      SITE: 0,
      BOX_OFFICE: 0,
      PDV: 0,
      DISK: 0
    }
    orders.forEach((ord) => {
      if (counts[ord.channel] !== undefined) {
        counts[ord.channel]++
      }
    })
    return counts
  }, [orders])

  // Colunas da Tabela DiskDataTable
  const columns: DiskTableColumn<OrderRecord>[] = [
    {
      key: 'id',
      header: 'Pedido / Protocolo',
      width: '180px',
      render: (order) => (
        <div className="font-mono">
          <p className="font-bold text-[var(--disk-text-primary,#0f172a)] text-xs">{order.id}</p>
          <p className="text-[10px] text-[var(--disk-text-muted,#64748b)]">{order.protocol}</p>
        </div>
      )
    },
    {
      key: 'channel',
      header: 'Canal',
      width: '140px',
      render: (order) => (
        <DiskStatusBadge
          status={order.channel}
          label={order.channelLabelPtBr}
        />
      )
    },
    {
      key: 'customer',
      header: 'Comprador / Cliente',
      render: (order) => (
        <div>
          <p className="font-bold text-[var(--disk-text-primary,#0f172a)] text-xs">
            {order.customerName}
          </p>
          <p className="text-[11px] text-[var(--disk-text-muted,#64748b)] font-mono">
            {order.customerEmail}
          </p>
        </div>
      )
    },
    {
      key: 'event',
      header: 'Evento & Sessão',
      render: (order) => (
        <div className="max-w-xs">
          <p className="font-semibold text-[var(--disk-text-primary,#0f172a)] text-xs truncate">
            {order.eventName}
          </p>
          <p className="text-[10px] text-[var(--disk-text-muted,#64748b)]">
            {order.sessionDate}
          </p>
        </div>
      )
    },
    {
      key: 'tickets',
      header: 'Ingressos',
      align: 'center',
      width: '90px',
      render: (order) => (
        <span className="font-bold text-xs text-[var(--disk-text-primary,#0f172a)] bg-[var(--disk-bg-muted,#f1f5f9)] px-2 py-0.5 rounded-full">
          {order.tickets.length}
        </span>
      )
    },
    {
      key: 'totalAmount',
      header: 'Valor Total',
      align: 'right',
      width: '130px',
      render: (order) => (
        <span className="font-mono font-bold text-xs text-[var(--disk-text-primary,#0f172a)]">
          R$ {(order.totalAmount ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '160px',
      render: (order) => (
        <DiskStatusBadge
          status={order.status}
          label={order.statusLabelPtBr}
        />
      )
    },
    {
      key: 'actions',
      header: 'Ação',
      align: 'right',
      width: '130px',
      render: (order) => (
        <button
          type="button"
          onClick={() => setSelectedOrder(order)}
          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[var(--disk-color-primary,#f97316)]/10 text-[var(--disk-color-primary,#f97316)] hover:bg-[var(--disk-color-primary,#f97316)] hover:text-white transition-all flex items-center gap-1 ml-auto cursor-pointer"
          title="Abrir dossiê operacional do pedido"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Dossiê</span>
        </button>
      )
    }
  ]

  return (
    <div
      className="commerce-orders-container space-y-2 w-full max-w-none"
      data-testid="commerce-orders-hub"
      data-visual-standard="disk-limitless-v7"
    >
      {/* 1. Cabeçalho Padronizado Limitless V7 */}
      <DiskPageHeader
        title="Pedidos, Vendas & Integridade Operacional"
        subtitle="Operação unificada do Commerce Core: vendas originadas pelo Site Oficial, Bilheterias, PDVs e Portal do Produtor."
        eyebrow="Operação Omnichannel • Vendas & Ingressos"
        badge={
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" />
            Commerce Core Homologado
          </span>
        }
        actions={
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-[var(--disk-color-primary,#f97316)] text-white hover:bg-[var(--disk-color-primary-hover,#ea580c)] shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            data-testid="refresh-commerce-orders-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Vendas</span>
          </button>
        }
      />

      {/* 2. Barra de Navegação Rápida entre Módulos Operacionais */}
      <DiskToolbar label="Navegação rápida:">
        {onNavigateToPayments && (
          <DiskToolbarButton
            variant="indigo"
            icon={<CreditCard className="w-3.5 h-3.5" />}
            onClick={onNavigateToPayments}
          >
            Central de Pagamentos
          </DiskToolbarButton>
        )}
        {onNavigateToTickets && (
          <DiskToolbarButton
            variant="sky"
            icon={<Ticket className="w-3.5 h-3.5" />}
            onClick={onNavigateToTickets}
          >
            Ingressos & QR Codes
          </DiskToolbarButton>
        )}
        {onNavigateToAccess && (
          <DiskToolbarButton
            variant="emerald"
            icon={<Scan className="w-3.5 h-3.5" />}
            onClick={onNavigateToAccess}
          >
            Disk Acesso
          </DiskToolbarButton>
        )}
        {onNavigateToCustomers && (
          <DiskToolbarButton
            variant="secondary"
            icon={<Users className="w-3.5 h-3.5 text-[var(--disk-color-primary,#f97316)]" />}
            onClick={onNavigateToCustomers}
          >
            Central de Clientes
          </DiskToolbarButton>
        )}
      </DiskToolbar>

      {/* 3. 4 Cards de Métricas Operacionais Limitless V7 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DiskKpiCard
          label="Faturamento do Dia"
          value={
            summary && typeof summary.todayRevenueBrl === 'number'
              ? `R$ ${summary.todayRevenueBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : 'R$ 0,00'
          }
          icon={<DollarSign className="w-5 h-5" />}
          accent="success"
          trend={summary && summary.ordersPerMinute > 0 ? `${summary.ordersPerMinute} pedidos / min` : 'Dados reais do banco'}
          trendDirection="up"
          loading={loading}
        />

        <DiskKpiCard
          label="Ingressos Emitidos Hoje"
          value={summary && typeof summary.ticketsIssuedToday === 'number' ? summary.ticketsIssuedToday.toLocaleString('pt-BR') : '0'}
          icon={<Ticket className="w-5 h-5" />}
          accent="info"
          note="Consolidado em tempo real"
          loading={loading}
        />

        <DiskKpiCard
          label="Holds Ativos (Redis)"
          value={summary && typeof summary.activeHoldsCount === 'number' ? summary.activeHoldsCount.toLocaleString('pt-BR') : '0'}
          icon={<Layers className="w-5 h-5" />}
          accent="warning"
          note="Reserva anti-overbooking"
          loading={loading}
        />

        <DiskKpiCard
          label="Aprovação de Checkout"
          value={summary && summary.approvalRatePercentage > 0 ? `${summary.approvalRatePercentage.toFixed(1)}%` : '0%'}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accent="purple"
          note="Conversão de pagamentos"
          loading={loading}
        />
      </div>

      {/* 4. Card de Integridade Comercial do Core */}
      <DiskCard className="border-l-4 border-l-[var(--disk-color-primary,#f97316)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--disk-color-primary,#f97316)] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--disk-color-primary,#f97316)]">
                Commerce Integrity Center • Monitoramento de Consistência
              </h3>
              <p className="text-xs text-[var(--disk-text-secondary,#475569)] mt-0.5">
                Reconciliação contínua entre reservas no Redis, pagamentos de adquirentes e emissão de ingressos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--disk-bg-muted,#f1f5f9)] border border-[var(--disk-border-subtle,#f1f5f9)]">
              <span
                className={`w-2 h-2 rounded-full ${
                  (summary?.integrityAlerts?.inconsistentOrders ?? 0) > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              />
              <span className="text-[var(--disk-text-muted,#64748b)]">Inconsistências:</span>
              <strong
                className={
                  (summary?.integrityAlerts?.inconsistentOrders ?? 0) > 0
                    ? 'text-rose-500'
                    : 'text-emerald-600 dark:text-emerald-400'
                }
              >
                {summary?.integrityAlerts?.inconsistentOrders ?? 0}
              </strong>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--disk-bg-muted,#f1f5f9)] border border-[var(--disk-border-subtle,#f1f5f9)]">
              <span
                className={`w-2 h-2 rounded-full ${
                  (summary?.integrityAlerts?.paymentsWithoutTickets ?? 0) > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              <span className="text-[var(--disk-text-muted,#64748b)]">Sem Ingresso:</span>
              <strong
                className={
                  (summary?.integrityAlerts?.paymentsWithoutTickets ?? 0) > 0
                    ? 'text-amber-500'
                    : 'text-emerald-600 dark:text-emerald-400'
                }
              >
                {summary?.integrityAlerts?.paymentsWithoutTickets ?? 0}
              </strong>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--disk-bg-muted,#f1f5f9)] border border-[var(--disk-border-subtle,#f1f5f9)]">
              <span
                className={`w-2 h-2 rounded-full ${
                  (summary?.integrityAlerts?.ticketsWithoutLedger ?? 0) > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              />
              <span className="text-[var(--disk-text-muted,#64748b)]">Sem Ledger:</span>
              <strong
                className={
                  (summary?.integrityAlerts?.ticketsWithoutLedger ?? 0) > 0
                    ? 'text-rose-500'
                    : 'text-emerald-600 dark:text-emerald-400'
                }
              >
                {summary?.integrityAlerts?.ticketsWithoutLedger ?? 0}
              </strong>
            </div>
          </div>
        </div>
      </DiskCard>

      {/* 5. Barra de Filtros e Busca Padronizada */}
      <DiskFilters
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por código do pedido, protocolo, cliente, CPF, email ou evento..."
        channelTabs={[
          { key: 'TODOS', label: 'Todos os Canais', count: channelCounts.TODOS },
          { key: 'SITE', label: 'Site Oficial', count: channelCounts.SITE },
          { key: 'BOX_OFFICE', label: 'Bilheteria', count: channelCounts.BOX_OFFICE },
          { key: 'PDV', label: 'PDV', count: channelCounts.PDV },
          { key: 'DISK', label: 'Portal Produtor', count: channelCounts.DISK }
        ]}
        activeChannelTab={activeChannelTab}
        onChannelTabChange={(key) => setActiveChannelTab(key as any)}
        selectFilters={[
          {
            id: 'status',
            value: statusFilter,
            onChange: (val) => setStatusFilter(val as any),
            options: [
              { value: 'TODOS', label: 'Todos os Status' },
              { value: 'PAID', label: 'Pago' },
              { value: 'FULFILLED', label: 'Concluído' },
              { value: 'AWAITING_PAYMENT', label: 'Aguardando Pagamento' },
              { value: 'REFUNDED', label: 'Estornado' }
            ]
          }
        ]}
      />

      {/* 6. Tabela Oficial DiskDataTable com Paginação Limitless */}
      <DiskDataTable
        columns={columns}
        data={paginatedOrders}
        keyExtractor={(order) => order.id}
        loading={loading}
        cardTitle={
          <div className="flex items-center gap-2">
            <span>Listagem de Pedidos Omnichannel</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--disk-color-primary,#f97316)]/10 text-[var(--disk-color-primary,#f97316)]">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>
        }
        emptyState={
          <DiskEmptyState
            icon={<FileText className="w-6 h-6" />}
            title="Nenhum pedido encontrado"
            description="Tente ajustar os termos de pesquisa ou selecionar outro canal/status para encontrar os pedidos desejados."
          />
        }
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredOrders.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: (newSize) => {
            setPageSize(newSize)
            setCurrentPage(1)
          },
          pageSizeOptions: [10, 25, 50, 100]
        }}
      />

      {/* 7. Modal do Dossiê Completo do Pedido */}
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

export default CommerceOrdersHubPage
