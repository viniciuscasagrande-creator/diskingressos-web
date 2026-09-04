import React, { useState, useEffect, useCallback } from 'react'
import {
  ArrowRight,
  Share2,
  Edit,
  MapPin,
  Calendar,
  MoreHorizontal,
  RefreshCw,
  DollarSign,
  Ticket,
  PieChart,
  Gift,
  Gauge,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import {
  getEventCommercialDashboard,
  type CommercialDashboardResponse
} from '../../services/api'
import {
  SalesEvolutionChart,
  SalesVelocityChart,
  PaymentDonutChart,
  OccupancyGaugeChart,
  WeekdayBarChart
} from '../../components/event-commercial/EventCommercialCharts'
import EventOrderInvestigationPage from './EventOrderInvestigationPage'
import './event-commercial-dashboard.css'

interface Props {
  event: EventItem
  onNavigate?: (page: any, context?: any) => void
  notify?: (message: string) => void
}

const formatMoney = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

export default function EventCommercialDashboardPage({ event, onNavigate, notify }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CommercialDashboardResponse | null>(null)

  // Filtros locais
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'all'>('30d')
  const [viewMode, setViewMode] = useState<'both' | 'revenue' | 'tickets'>('both')
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [activeSubTab, setActiveSubTab] = useState('overview')
  const [investigatingOrderCode, setInvestigatingOrderCode] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getEventCommercialDashboard(event.id, {
        period,
        paymentMethod: selectedPayment || undefined
      })
      setData(res)
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar painel comercial do evento.')
      notify?.(err?.message || 'Falha ao buscar dados comerciais.')
    } finally {
      setLoading(false)
    }
  }, [event.id, period, selectedPayment, notify])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  // Se o usuário estiver investigando um pedido da tabela de últimas transações
  if (investigatingOrderCode) {
    return (
      <EventOrderInvestigationPage
        event={event}
        orderIdOrCode={investigatingOrderCode}
        onBack={() => setInvestigatingOrderCode(null)}
        onNavigate={onNavigate}
        notify={notify}
      />
    )
  }

  const summary = data?.summary
  const salesEvolution = data?.salesEvolution
  const salesVelocity = data?.salesVelocity
  const paymentMethods = data?.paymentMethods || []
  const ticketTypes = data?.ticketTypes || []
  const occupancy = data?.occupancy
  const recentTransactions = data?.recentTransactions || []
  const weekdayDistribution = data?.weekdayDistribution || []

  return (
    <div className="ecd-container" data-testid="event-commercial-dashboard">
      {/* 1. Breadcrumbs */}
      <nav className="ecd-breadcrumb" aria-label="Navegação estrutural">
        <span className="ecd-breadcrumb-link" onClick={() => onNavigate?.('events')}>
          Eventos
        </span>
        <ChevronRight size={13} />
        <span className="ecd-breadcrumb-current">{event.title}</span>
      </nav>

      {/* 2. Cabeçalho Executivo */}
      <header className="ecd-header">
        <div className="ecd-event-profile">
          {event.cover ? (
            <img src={event.cover} alt={event.title} className="ecd-event-avatar" />
          ) : (
            <div className="ecd-event-avatar-fallback">
              {event.title.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="ecd-title-line">
              <h1 className="ecd-title">{event.title}</h1>
              <span
                className={`ecd-status-badge ${
                  event.status === 'ativo' ? 'ecd-status-active' : 'ecd-status-inactive'
                }`}
              >
                {event.status === 'ativo' ? 'Ativo' : event.status}
              </span>
              <button
                type="button"
                className="ecd-more-btn"
                title="Mais opções"
                onClick={() => notify?.('Menu de opções rápidas do evento.')}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
            <div className="ecd-meta-line">
              <span className="ecd-meta-item">
                <MapPin size={14} className="text-slate-400" />
                {event.venue} - {event.city}
              </span>
              <span>•</span>
              <span className="ecd-meta-item">
                <Calendar size={14} className="text-slate-400" />
                {event.date}
              </span>
            </div>
          </div>
        </div>

        <div className="ecd-header-actions">
          <button
            type="button"
            className="ecd-btn-secondary"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href)
              }
              notify?.('Link do evento copiado para a área de transferência!')
            }}
          >
            <Share2 size={15} />
            Compartilhar
          </button>

          <button
            type="button"
            className="ecd-btn-secondary"
            onClick={() => onNavigate?.('edit-event')}
          >
            <Edit size={15} />
            Editar Evento
          </button>

          <button
            type="button"
            className="ecd-btn-primary"
            onClick={() => onNavigate?.('event-command-center')}
            data-testid="btn-access-event-os"
          >
            Acessar Event OS
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* 3. Sub-abas de Navegação Contextual */}
      <div className="ecd-subtabs" data-testid="event-subtabs">
        <button
          type="button"
          className={`ecd-tab-pill ${activeSubTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('overview')}
          data-testid="tab-overview"
        >
          Visão Geral
        </button>
        <button
          type="button"
          className="ecd-tab-pill"
          onClick={() => onNavigate?.('event-inventory')}
        >
          Vendas
        </button>
        <button
          type="button"
          className="ecd-tab-pill"
          onClick={() => onNavigate?.('event-tickets')}
        >
          Ingressos
        </button>
        <button
          type="button"
          className="ecd-tab-pill"
          onClick={() => onNavigate?.('finance-dashboard')}
        >
          Financeiro
        </button>
        <button
          type="button"
          className="ecd-tab-pill"
          onClick={() => onNavigate?.('event-customer-360')}
        >
          Público
        </button>
        <button
          type="button"
          className="ecd-tab-pill"
          onClick={() => onNavigate?.('marketing-dashboard')}
        >
          Marketing
        </button>
        <button
          type="button"
          className="ecd-tab-pill"
          onClick={() => onNavigate?.('event-details')}
        >
          Configurações
        </button>
      </div>

      {/* Loading state */}
      {loading && !data && (
        <div className="p-8 text-center text-slate-500 font-medium">
          Carregando indicadores comerciais do evento...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            type="button"
            className="ecd-btn-secondary"
            onClick={loadDashboard}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* 4. Cinco KPIs Coloridos Oficiais */}
      {summary && (
        <section className="ecd-kpi-grid" data-testid="commercial-kpis">
          {/* 1. Receita Total (Azul) */}
          <div className="ecd-kpi-card ecd-kpi-blue" data-testid="kpi-revenue">
            <div className="ecd-kpi-header">
              <span className="ecd-kpi-label">Receita Total</span>
              <div className="ecd-kpi-icon">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="ecd-kpi-value">{summary.grossRevenueFormatted}</div>
            <div className="ecd-kpi-trend">
              ↑ {summary.revenueVariationPercent.toFixed(1).replace('.', ',')}% vs. período anterior
            </div>
          </div>

          {/* 2. Ingressos Vendidos (Verde) */}
          <div className="ecd-kpi-card ecd-kpi-green" data-testid="kpi-sold">
            <div className="ecd-kpi-header">
              <span className="ecd-kpi-label">Ingressos Vendidos</span>
              <div className="ecd-kpi-icon">
                <Ticket size={18} />
              </div>
            </div>
            <div className="ecd-kpi-value">{summary.ticketsSold}</div>
            <div className="ecd-kpi-trend">
              ↑ {summary.ticketsSoldVariationPercent.toFixed(1).replace('.', ',')}% vs. período anterior
            </div>
          </div>

          {/* 3. Disponíveis (Roxo) */}
          <div className="ecd-kpi-card ecd-kpi-purple" data-testid="kpi-available">
            <div className="ecd-kpi-header">
              <span className="ecd-kpi-label">Disponíveis</span>
              <div className="ecd-kpi-icon">
                <PieChart size={18} />
              </div>
            </div>
            <div className="ecd-kpi-value">{summary.availableTickets}</div>
            <div className="ecd-kpi-trend">
              ↓ {Math.abs(summary.availableVariationPercent).toFixed(1).replace('.', ',')}% vs. período anterior
            </div>
          </div>

          {/* 4. Cortesias (Laranja) */}
          <div className="ecd-kpi-card ecd-kpi-orange" data-testid="kpi-courtesy">
            <div className="ecd-kpi-header">
              <span className="ecd-kpi-label">Cortesias</span>
              <div className="ecd-kpi-icon">
                <Gift size={18} />
              </div>
            </div>
            <div className="ecd-kpi-value">{summary.courtesyTickets}</div>
            <div className="ecd-kpi-trend">
              {summary.courtesyVariationPercent.toFixed(1).replace('.', ',')}% sem alteração
            </div>
          </div>

          {/* 5. Ocupação (Coral/Vermelho) */}
          <div className="ecd-kpi-card ecd-kpi-red" data-testid="kpi-occupancy">
            <div className="ecd-kpi-header">
              <span className="ecd-kpi-label">Ocupação</span>
              <div className="ecd-kpi-icon">
                <Gauge size={18} />
              </div>
            </div>
            <div className="ecd-kpi-value">{summary.occupancyPercent.toFixed(1).replace('.', ',')}%</div>
            <div className="ecd-kpi-trend">
              ↑ {summary.occupancyVariationPercent.toFixed(1).replace('.', ',')}% vs. período anterior
            </div>
          </div>
        </section>
      )}

      {/* 5. Linha Intermediária: Evolução de Vendas + Ritmo de Vendas */}
      <section className="ecd-row-two-col">
        {/* Evolução de Vendas */}
        <div className="ecd-card" data-testid="card-sales-evolution">
          <div className="ecd-card-header">
            <div>
              <h3 className="ecd-card-title">Evolução de Vendas</h3>
              <p className="ecd-card-subtitle">Receita e ingressos vendidos ao longo do tempo</p>
            </div>
            <div className="ecd-card-controls">
              <div className="ecd-pill-switch">
                <button
                  type="button"
                  className={`ecd-pill-btn ${viewMode === 'both' ? 'active' : ''}`}
                  onClick={() => setViewMode('both')}
                >
                  Ambos
                </button>
                <button
                  type="button"
                  className={`ecd-pill-btn ${viewMode === 'revenue' ? 'active' : ''}`}
                  onClick={() => setViewMode('revenue')}
                >
                  Receita (R$)
                </button>
                <button
                  type="button"
                  className={`ecd-pill-btn ${viewMode === 'tickets' ? 'active' : ''}`}
                  onClick={() => setViewMode('tickets')}
                >
                  Ingressos
                </button>
              </div>

              <select
                className="ecd-select"
                value={period}
                onChange={e => setPeriod(e.target.value as any)}
              >
                <option value="today">Hoje</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="all">Todo o período</option>
              </select>
            </div>
          </div>

          {salesEvolution && (
            <SalesEvolutionChart points={salesEvolution.points} viewMode={viewMode} />
          )}
        </div>

        {/* Ritmo de Vendas */}
        <div className="ecd-card" data-testid="card-sales-velocity">
          <div className="ecd-card-header">
            <div>
              <h3 className="ecd-card-title">Ritmo de Vendas</h3>
              <p className="ecd-card-subtitle">Atualizado {data?.updatedAtFormatted || 'recentemente'}</p>
            </div>
            <button
              type="button"
              className="ecd-btn-secondary"
              style={{ padding: '4px 8px' }}
              onClick={loadDashboard}
              title="Atualizar ritmo"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {salesVelocity && (
            <>
              <div className="ecd-velocity-kpis">
                <div className="ecd-vk-item">
                  <small>Ticket Médio</small>
                  <strong>{formatMoney(salesVelocity.averageTicketCents)}</strong>
                  <span>↑ {salesVelocity.averageTicketVariationPercent.toFixed(1).replace('.', ',')}%</span>
                </div>
                <div className="ecd-vk-item">
                  <small>Ponto de Equilíbrio</small>
                  <strong>{formatMoney(salesVelocity.breakEvenCents)}</strong>
                  <span className="text-slate-400">-</span>
                </div>
                <div className="ecd-vk-item">
                  <small>Meta de Vendas</small>
                  <strong>{formatMoney(salesVelocity.salesTargetCents)}</strong>
                  <span className="text-slate-400">-</span>
                </div>
                <div className="ecd-vk-item">
                  <small>Projeção Final</small>
                  <strong>{formatMoney(salesVelocity.projectedFinalCents)}</strong>
                  <span>↑ {salesVelocity.projectedVariationPercent.toFixed(1).replace('.', ',')}%</span>
                </div>
              </div>

              <SalesVelocityChart stats={salesVelocity} />
            </>
          )}
        </div>
      </section>

      {/* 6. Terceira Linha: Formas de Pagamento + Tipo de Ingresso + Ocupação */}
      <section className="ecd-row-three-col">
        {/* Formas de Pagamento */}
        <div className="ecd-card" data-testid="card-payment-methods">
          <div className="ecd-card-header">
            <h3 className="ecd-card-title">Vendas por Forma de Pagamento</h3>
            <button
              type="button"
              className="ecd-btn-secondary"
              style={{ fontSize: '11px', padding: '3px 8px' }}
              onClick={() => setSelectedPayment(null)}
            >
              Mostrar Todos
            </button>
          </div>

          <PaymentDonutChart
            items={paymentMethods}
            totalCount={summary?.ticketsSold || 108}
            selectedMethod={selectedPayment}
            onSelectMethod={id => setSelectedPayment(prev => (prev === id ? null : id))}
          />
        </div>

        {/* Vendas por Tipo de Ingresso */}
        <div className="ecd-card" data-testid="card-ticket-types">
          <div className="ecd-card-header">
            <h3 className="ecd-card-title">Vendas por Tipo de Ingresso</h3>
            <button
              type="button"
              className="ecd-btn-secondary"
              style={{ fontSize: '11px', padding: '3px 8px' }}
              onClick={() => onNavigate?.('event-inventory')}
            >
              Ver Detalhes
            </button>
          </div>

          <div className="ecd-ticket-list">
            {ticketTypes.map(t => (
              <div className="ecd-ticket-row" key={t.id}>
                <span className="ecd-ticket-info" title={t.name}>
                  {t.name}
                </span>
                <div className="ecd-ticket-bar-wrap">
                  <div
                    className="ecd-ticket-bar-fill"
                    style={{ width: `${Math.min(100, t.percentage * 3)}%` }}
                  />
                </div>
                <span className="ecd-ticket-pct">{t.percentage.toFixed(1).replace('.', ',')}%</span>
                <b className="ecd-ticket-count">{t.soldCount}</b>
              </div>
            ))}
          </div>
        </div>

        {/* Ocupação do Evento */}
        <div className="ecd-card" data-testid="card-occupancy-gauge">
          <div className="ecd-card-header">
            <h3 className="ecd-card-title">Ocupação do Evento</h3>
          </div>

          {occupancy && <OccupancyGaugeChart data={occupancy} />}
        </div>
      </section>

      {/* 7. Quarta Linha: Últimas Transações + Vendas por Dia da Semana */}
      <section className="ecd-row-two-col">
        {/* Últimas Transações */}
        <div className="ecd-card" data-testid="card-recent-transactions">
          <div className="ecd-card-header">
            <h3 className="ecd-card-title">Últimas Transações</h3>
            <button
              type="button"
              className="ecd-btn-secondary"
              style={{ fontSize: '11px', padding: '3px 8px' }}
              onClick={() => onNavigate?.('event-global-search')}
            >
              Ver Todas
            </button>
          </div>

          <div className="ecd-table-wrap">
            <table className="ecd-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Data/Hora</th>
                  <th>Pagamento</th>
                  <th>Valor</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(tx => (
                  <tr
                    key={tx.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setInvestigatingOrderCode(tx.orderCode)}
                    title="Clique para investigar o pedido em 360°"
                    data-testid={`tx-row-${tx.orderCode}`}
                  >
                    <td className="ecd-table-client">
                      <strong>{tx.buyerName}</strong>
                      <small className="text-slate-400">Pedido #{tx.orderCode}</small>
                    </td>
                    <td>
                      {tx.dateFormatted} <small className="text-slate-400">{tx.timeFormatted}</small>
                    </td>
                    <td>{tx.paymentMethod}</td>
                    <td>
                      <b>{formatMoney(tx.amountCents)}</b>
                    </td>
                    <td>
                      <span className="ecd-table-badge">{tx.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendas por Dia da Semana */}
        <div className="ecd-card" data-testid="card-weekday-distribution">
          <div className="ecd-card-header">
            <h3 className="ecd-card-title">Vendas por Dia da Semana</h3>
            <select className="ecd-select">
              <option>Últimas 4 semanas</option>
              <option>Últimas 8 semanas</option>
            </select>
          </div>

          <WeekdayBarChart items={weekdayDistribution} />
        </div>
      </section>
    </div>
  )
}
