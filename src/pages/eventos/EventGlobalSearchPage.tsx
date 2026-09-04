import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  RefreshCw,
  Download,
  X,
  ShieldCheck,
  ShoppingBag,
  Users,
  Ticket,
  WalletCards,
  CheckCircle2,
  Headphones,
  Undo2,
  ArrowRight,
  CreditCard,
  AlertTriangle,
  FileText
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import {
  searchEventGlobal,
  type GlobalSearchResponse,
  type GlobalSearchResultItem
} from '../../services/api'
import './event-global-search.css'

interface Props {
  event: EventItem
  onNavigate?: (page: any, context?: any) => void
  notify?: (m: string) => void
}

const formatMoney = (cents?: number) => {
  if (cents === undefined || cents === null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

export default function EventGlobalSearchPage({ event, onNavigate, notify }: Props) {
  const [query, setQuery] = useState('')
  const [activeType, setActiveType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [filterPayment, setFilterPayment] = useState<string>('todos')
  const [autoUpdate, setAutoUpdate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<GlobalSearchResponse | null>(null)

  const executeSearch = useCallback(async (qStr: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await searchEventGlobal(event.id, {
        q: qStr,
        type: activeType,
        status: filterStatus === 'todos' ? undefined : filterStatus,
        paymentMethod: filterPayment === 'todos' ? undefined : filterPayment
      })
      setData(res)
    } catch (err: any) {
      setError(err?.message || 'Falha ao buscar dados no evento.')
      notify?.(err?.message || 'Erro na busca global.')
    } finally {
      setLoading(false)
    }
  }, [event.id, activeType, filterStatus, filterPayment, notify])

  // Initial load
  useEffect(() => {
    executeSearch(query)
  }, [executeSearch])

  // Debounced search when query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(query)
    }, 350)
    return () => clearTimeout(timer)
  }, [query, executeSearch])

  // Auto-refresh timer
  useEffect(() => {
    if (!autoUpdate) return
    const interval = setInterval(() => {
      executeSearch(query)
    }, 15000)
    return () => clearInterval(interval)
  }, [autoUpdate, query, executeSearch])

  const handleClear = () => {
    setQuery('')
    setFilterStatus('todos')
    setFilterPayment('todos')
    setActiveType('all')
  }

  const handleExportCSV = () => {
    if (!data || data.total === 0) {
      notify?.('Nenhum resultado disponível para exportação.')
      return
    }

    const rows: string[] = ['Tipo,ID/Código,Nome/Identificador,Detalhe,Status,Valor']

    data.groups.orders.forEach(o => {
      rows.push(`"Pedido","${o.code}","${o.buyerName}","${o.paymentMethod} - ${o.ticketsCount} ingresso(s)","${o.status}","${formatMoney(o.grossCents)}"`)
    })
    data.groups.customers.forEach(c => {
      rows.push(`"Cliente","${c.id}","${c.name}","${c.email || ''} - ${c.document || ''}","Ativo",""`)
    })
    data.groups.tickets.forEach(t => {
      rows.push(`"Ingresso","${t.code}","${t.participantName}","${t.lotName} - ${t.sector}","${t.status}",""`)
    })
    data.groups.financial.forEach(f => {
      rows.push(`"Financeiro","${f.code}","${f.description}","${f.category} - ${f.type}","${f.status}","${formatMoney(f.amountCents)}"`)
    })
    data.groups.checkins.forEach(c => {
      rows.push(`"Checkin","${c.id}","${c.participantName}","${c.gate} - ${c.method}","${c.status}",""`)
    })
    data.groups.support.forEach(s => {
      rows.push(`"SAC","${s.code}","${s.requesterName}","${s.subject}","${s.status} - P:${s.priority}",""`)
    })
    data.groups.refunds.forEach(r => {
      rows.push(`"Estorno","${r.code}","Pedido: ${r.orderCode}","${r.reason}","${r.status}","${formatMoney(r.amountCents)}"`)
    })

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `busca-global-${event.code}-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    notify?.('Resultado exportado em CSV com sucesso!')
  }

  const counts = data?.counts || {
    orders: 0,
    customers: 0,
    tickets: 0,
    financial: 0,
    checkins: 0,
    support: 0,
    refunds: 0
  }

  const totalCount = data?.total || 0

  return (
    <div className="egs-page" data-testid="global-search-container">
      {/* Header */}
      <header className="egs-header">
        <div className="egs-header-title">
          <span>EVENT OS · FASE 26.16.1</span>
          <h1>Global Search & Command</h1>
          <p>Busca operacional unificada por pedido, ingresso, cliente, transação, check-in, SAC e estornos.</p>
        </div>
        <div className="egs-header-actions">
          <button
            type="button"
            className={`egs-btn egs-btn-toggle ${autoUpdate ? 'active' : ''}`}
            onClick={() => setAutoUpdate(prev => !prev)}
            title="Alternar entre atualização automática e manual"
            data-testid="toggle-auto-refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {autoUpdate ? '● Atualização Automática (15s)' : 'Atualização Manual'}
          </button>
          <button
            type="button"
            className="egs-btn"
            onClick={() => executeSearch(query)}
            disabled={loading}
            data-testid="btn-refresh-now"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Atualizando...' : 'Atualizar agora'}
          </button>
          <button
            type="button"
            className="egs-btn"
            onClick={handleExportCSV}
            data-testid="btn-export-csv"
          >
            <Download size={14} />
            Exportar resultado
          </button>
        </div>
      </header>

      {/* Scope Bar */}
      <div className="egs-scope-bar">
        <ShieldCheck size={16} className="text-emerald-600" />
        <b>{event.code} · {event.title}</b>
        <span>Escopo protegido por produtora ({event.producerId}) e evento ({event.id})</span>
      </div>

      {/* Main Command Bar */}
      <div className="egs-command-bar">
        <div className="egs-search-input-wrap">
          <Search size={18} className="egs-search-icon" />
          <input
            type="text"
            className="egs-search-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') executeSearch(query) }}
            placeholder="Buscar pedido, CPF, ingresso, nome, telefone, e-mail ou transação..."
            data-testid="global-search-input"
            autoFocus
          />
          {query && (
            <button
              type="button"
              className="egs-clear-btn"
              onClick={() => setQuery('')}
              title="Limpar texto"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters and Tabs */}
        <div className="egs-filters-row">
          <div className="egs-type-tabs" data-testid="global-search-tabs">
            <button
              type="button"
              className={`egs-tab ${activeType === 'all' ? 'active' : ''}`}
              onClick={() => setActiveType('all')}
              data-testid="tab-all"
            >
              Todos <span className="egs-tab-badge">{totalCount}</span>
            </button>
            <button
              type="button"
              className={`egs-tab ${activeType === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveType('orders')}
              data-testid="tab-orders"
            >
              Pedidos <span className="egs-tab-badge">{counts.orders}</span>
            </button>
            <button
              type="button"
              className={`egs-tab ${activeType === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveType('customers')}
              data-testid="tab-customers"
            >
              Clientes <span className="egs-tab-badge">{counts.customers}</span>
            </button>
            <button
              type="button"
              className={`egs-tab ${activeType === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveType('tickets')}
              data-testid="tab-tickets"
            >
              Ingressos <span className="egs-tab-badge">{counts.tickets}</span>
            </button>
            <button
              type="button"
              className={`egs-tab ${activeType === 'financial' ? 'active' : ''}`}
              onClick={() => setActiveType('financial')}
              data-testid="tab-financial"
            >
              Financeiro <span className="egs-tab-badge">{counts.financial}</span>
            </button>
            <button
              type="button"
              className={`egs-tab ${activeType === 'checkins' ? 'active' : ''}`}
              onClick={() => setActiveType('checkins')}
              data-testid="tab-checkins"
            >
              Check-in <span className="egs-tab-badge">{counts.checkins}</span>
            </button>
            <button
              type="button"
              className={`egs-tab ${activeType === 'support' ? 'active' : ''}`}
              onClick={() => setActiveType('support')}
              data-testid="tab-support"
            >
              SAC <span className="egs-tab-badge">{counts.support}</span>
            </button>
            <button
              type="button"
              className={`egs-tab ${activeType === 'refunds' ? 'active' : ''}`}
              onClick={() => setActiveType('refunds')}
              data-testid="tab-refunds"
            >
              Estornos <span className="egs-tab-badge">{counts.refunds}</span>
            </button>
          </div>

          <div className="egs-sub-filters">
            <select
              className="egs-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              data-testid="filter-status"
            >
              <option value="todos">Status: Todos</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <select
              className="egs-select"
              value={filterPayment}
              onChange={e => setFilterPayment(e.target.value)}
              data-testid="filter-payment"
            >
              <option value="todos">Pagamento: Todos</option>
              <option value="pix">PIX</option>
              <option value="cartao">Cartão</option>
              <option value="boleto">Boleto</option>
            </select>
            {(query || filterStatus !== 'todos' || filterPayment !== 'todos' || activeType !== 'all') && (
              <button
                type="button"
                className="egs-action-btn"
                onClick={handleClear}
                data-testid="btn-clear-filters"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content States */}
      {loading && !data && (
        <div className="egs-state-box" data-testid="state-loading">
          <RefreshCw size={28} className="animate-spin text-sky-600" />
          <h3>Consultando no Event OS...</h3>
          <p>Pesquisando entidades vinculadas a este evento em tempo real.</p>
        </div>
      )}

      {error && (
        <div className="egs-state-box border-red-200 bg-red-50" data-testid="state-error">
          <AlertTriangle size={32} className="text-red-500" />
          <h3 className="text-red-800">Falha ao carregar busca</h3>
          <p className="text-red-600">{error}</p>
          <button
            type="button"
            className="egs-btn egs-btn-primary mt-2"
            onClick={() => executeSearch(query)}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && data && data.total === 0 && (
        <div className="egs-state-box" data-testid="state-empty">
          <Search size={32} className="egs-state-icon" />
          <h3>Nenhum resultado encontrado</h3>
          <p>
            Não encontramos pedidos, clientes, ingressos ou transações com o termo "{query}".
            Tente pesquisar por código, documento, e-mail ou limpar os filtros aplicados.
          </p>
          <button
            type="button"
            className="egs-btn mt-2"
            onClick={handleClear}
          >
            Limpar busca
          </button>
        </div>
      )}

      {/* Results Rendering */}
      {data && data.total > 0 && (
        <div className="egs-results-container" data-testid="global-search-results">
          {/* Orders */}
          {data.groups.orders.length > 0 && (
            <section className="egs-group-section" data-testid="group-orders">
              <div className="egs-group-header">
                <ShoppingBag size={18} className="text-sky-600" />
                <span>Pedidos ({data.groups.orders.length})</span>
              </div>
              <div className="egs-group-grid">
                {data.groups.orders.map(o => (
                  <div className="egs-card" key={`order-${o.id}`} data-testid={`card-order-${o.code}`}>
                    <div className="egs-card-top">
                      <span className="egs-card-id">PEDIDO #{o.code}</span>
                      <span className={`egs-badge ${o.status?.toLowerCase() === 'pago' ? 'egs-badge-success' : 'egs-badge-warning'}`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="egs-card-body">
                      <div className="egs-card-title">{o.buyerName}</div>
                      <div className="egs-card-meta">
                        <span>{o.buyerEmail} {o.buyerDocument ? `· CPF ${o.buyerDocument}` : ''}</span>
                        <span><b>{formatMoney(o.grossCents)}</b> · {o.paymentMethod} · {o.ticketsCount} ingresso(s)</span>
                        <span>{new Date(o.createdAt!).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="egs-card-actions">
                      <button
                        type="button"
                        className="egs-action-btn"
                        onClick={() => notify?.(`Visualizando pedido ${o.code}`)}
                        data-testid={`action-order-view-${o.code}`}
                      >
                        <FileText size={12} /> Ver Pedido
                      </button>
                      <button
                        type="button"
                        className="egs-action-btn"
                        onClick={() => onNavigate?.('event-customer-360')}
                        data-testid={`action-order-customer-${o.code}`}
                      >
                        <Users size={12} /> Customer 360
                      </button>
                      <button
                        type="button"
                        className="egs-action-btn"
                        onClick={() => onNavigate?.('event-tickets')}
                        data-testid={`action-order-tickets-${o.code}`}
                      >
                        <Ticket size={12} /> Ingressos
                      </button>
                      <button
                        type="button"
                        className="egs-action-btn"
                        onClick={() => onNavigate?.('finance-dashboard')}
                      >
                        <WalletCards size={12} /> Financeiro
                      </button>
                      <button
                        type="button"
                        className="egs-action-btn"
                        onClick={() => onNavigate?.('sac-hub')}
                      >
                        <Headphones size={12} /> Atendimento
                      </button>
                      <button
                        type="button"
                        className="egs-action-btn egs-action-btn-danger"
                        onClick={() => onNavigate?.('finance-refunds')}
                        data-testid={`action-order-refund-${o.code}`}
                      >
                        <Undo2 size={12} /> Estorno
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Customers */}
          {data.groups.customers.length > 0 && (
            <section className="egs-group-section" data-testid="group-customers">
              <div className="egs-group-header">
                <Users size={18} className="text-violet-600" />
                <span>Clientes ({data.groups.customers.length})</span>
              </div>
              <div className="egs-group-grid">
                {data.groups.customers.map(c => (
                  <div className="egs-card" key={`cust-${c.id}`} data-testid={`card-customer-${c.id}`}>
                    <div className="egs-card-top">
                      <span className="egs-card-id">CLIENTE #{c.id}</span>
                      <span className="egs-badge egs-badge-info">Identificado</span>
                    </div>
                    <div className="egs-card-body">
                      <div className="egs-card-title">{c.name}</div>
                      <div className="egs-card-meta">
                        <span>{c.email || 'E-mail não informado'}</span>
                        <span>{c.phone || 'Telefone não informado'}</span>
                        {c.document && <span>CPF: {c.document}</span>}
                      </div>
                    </div>
                    <div className="egs-card-actions">
                      <button
                        type="button"
                        className="egs-action-btn"
                        onClick={() => onNavigate?.('event-customer-360')}
                        data-testid={`action-customer-view-${c.id}`}
                      >
                        <Users size={12} /> Customer 360
                      </button>
                      <button
                        type="button"
                        className="egs-action-btn"
                        onClick={() => onNavigate?.('event-tickets')}
                      >
                        <Ticket size={12} /> Ingressos
                      </button>
                      <button
                        type="button"
                        className="egs-action-btn"
                        onClick={() => onNavigate?.('sac-hub')}
                      >
                        <Headphones size={12} /> Atendimento
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tickets */}
          {data.groups.tickets.length > 0 && (
            <section className="egs-group-section" data-testid="group-tickets">
              <div className="egs-group-header">
                <Ticket size={18} className="text-amber-600" />
                <span>Ingressos ({data.groups.tickets.length})</span>
              </div>
              <div className="egs-group-grid">
                {data.groups.tickets.map(t => (
                  <div className="egs-card" key={`ticket-${t.id}`} data-testid={`card-ticket-${t.code}`}>
                    <div className="egs-card-top">
                      <span className="egs-card-id">{t.code}</span>
                      <span className={`egs-badge ${t.status?.toLowerCase() === 'valido' ? 'egs-badge-success' : 'egs-badge-neutral'}`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="egs-card-body">
                      <div className="egs-card-title">{t.participantName}</div>
                      <div className="egs-card-meta">
                        <span>Lote: <b>{t.lotName}</b> ({t.sector})</span>
                        {t.orderCode && <span>Vinculado ao Pedido: #{t.orderCode}</span>}
                        <span className="font-mono text-[11px] text-slate-400">{(t as any).qrCode || t.code}</span>
                      </div>
                    </div>
                    <div className="egs-card-actions">
                      <button
                        type="button"
                        className="egs-action-btn"
                        onClick={() => onNavigate?.('event-tickets')}
                        data-testid={`action-ticket-view-${t.code}`}
                      >
                        <Ticket size={12} /> Consultar Ingresso
                      </button>
                      <button
                        type="button"
                        className="egs-action-btn"
                        onClick={() => onNavigate?.('event-live-ops')}
                      >
                        <CheckCircle2 size={12} /> Live Ops Check-in
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Financial Transactions */}
          {data.groups.financial.length > 0 && (
            <section className="egs-group-section" data-testid="group-financial">
              <div className="egs-group-header">
                <WalletCards size={18} className="text-emerald-600" />
                <span>Transações Financeiras ({data.groups.financial.length})</span>
              </div>
              <div className="egs-group-grid">
                {data.groups.financial.map(f => (
                  <div className="egs-card" key={`fin-${f.id}`} data-testid={`card-fin-${f.code}`}>
                    <div className="egs-card-top">
                      <span className="egs-card-id">{f.code}</span>
                      <span className="egs-badge egs-badge-info">{f.type}</span>
                    </div>
                    <div className="egs-card-body">
                      <div className="egs-card-title">{f.description || f.category}</div>
                      <div className="egs-card-meta">
                        <span>Valor: <b>{formatMoney(f.amountCents)}</b></span>
                        <span>{new Date(f.occurredAt!).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="egs-card-actions">
                      <button
                        type="button"
                        className="egs-action-btn"
                        onClick={() => onNavigate?.('finance-dashboard')}
                      >
                        <WalletCards size={12} /> Ver no Financeiro
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Checkins */}
          {data.groups.checkins.length > 0 && (
            <section className="egs-group-section" data-testid="group-checkins">
              <div className="egs-group-header">
                <CheckCircle2 size={18} className="text-teal-600" />
                <span>Acessos & Check-in ({data.groups.checkins.length})</span>
              </div>
              <div className="egs-group-grid">
                {data.groups.checkins.map(ci => (
                  <div className="egs-card" key={`ci-${ci.id}`} data-testid={`card-checkin-${ci.id}`}>
                    <div className="egs-card-top">
                      <span className="egs-card-id">CHECKIN #{ci.id}</span>
                      <span className="egs-badge egs-badge-success">{ci.status}</span>
                    </div>
                    <div className="egs-card-body">
                      <div className="egs-card-title">{ci.participantName}</div>
                      <div className="egs-card-meta">
                        <span>{ci.gate} · Operador: {ci.operatorName || 'Automático'} ({ci.method})</span>
                        <span>{new Date(ci.checkedAt!).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="egs-card-actions">
                      <button
                        type="button"
                        className="egs-action-btn"
                        onClick={() => onNavigate?.('event-live-ops')}
                      >
                        <CheckCircle2 size={12} /> Ver no Live Operations
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SAC Support Tickets */}
          {data.groups.support.length > 0 && (
            <section className="egs-group-section" data-testid="group-support">
              <div className="egs-group-header">
                <Headphones size={18} className="text-orange-600" />
                <span>Chamados SAC ({data.groups.support.length})</span>
              </div>
              <div className="egs-group-grid">
                {data.groups.support.map(s => (
                  <div className="egs-card" key={`sac-${s.id}`} data-testid={`card-sac-${s.code}`}>
                    <div className="egs-card-top">
                      <span className="egs-card-id">{s.code}</span>
                      <span className="egs-badge egs-badge-warning">{s.status}</span>
                    </div>
                    <div className="egs-card-body">
                      <div className="egs-card-title">{s.subject}</div>
                      <div className="egs-card-meta">
                        <span>Solicitante: {s.requesterName} ({s.requesterEmail || ''})</span>
                        <span>Prioridade: <b>{s.priority}</b></span>
                      </div>
                    </div>
                    <div className="egs-card-actions">
                      <button
                        type="button"
                        className="egs-action-btn"
                        onClick={() => onNavigate?.('sac-hub')}
                      >
                        <Headphones size={12} /> Abrir no SAC
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Refunds */}
          {data.groups.refunds.length > 0 && (
            <section className="egs-group-section" data-testid="group-refunds">
              <div className="egs-group-header">
                <Undo2 size={18} className="text-rose-600" />
                <span>Estornos & Reembolsos ({data.groups.refunds.length})</span>
              </div>
              <div className="egs-group-grid">
                {data.groups.refunds.map(r => (
                  <div className="egs-card" key={`ref-${r.id}`} data-testid={`card-refund-${r.code}`}>
                    <div className="egs-card-top">
                      <span className="egs-card-id">{r.code}</span>
                      <span className="egs-badge egs-badge-danger">{r.status}</span>
                    </div>
                    <div className="egs-card-body">
                      <div className="egs-card-title">Pedido: #{r.orderCode}</div>
                      <div className="egs-card-meta">
                        <span>Valor: <b>{formatMoney(r.amountCents)}</b> ({r.kind})</span>
                        <span>Motivo: {r.reason}</span>
                      </div>
                    </div>
                    <div className="egs-card-actions">
                      <button
                        type="button"
                        className="egs-action-btn egs-action-btn-danger"
                        onClick={() => onNavigate?.('finance-refunds')}
                      >
                        <Undo2 size={12} /> Centro de Controle de Estornos
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
