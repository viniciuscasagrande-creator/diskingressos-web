import { useState, useMemo, type FormEvent } from 'react'
import {
  ArrowDownLeft, ArrowUpRight, Banknote, Building2, Calendar, CheckCircle2, ChevronRight,
  CircleDollarSign, Clock, Copy, CreditCard, Download, ExternalLink, Eye, Filter,
  HelpCircle, Landmark, Layers, Lock, Percent, Plus, RefreshCw, Search, ShieldCheck,
  Sparkles, TrendingDown, TrendingUp, Wallet, WalletCards, X, Zap, FileSpreadsheet,
  Check, AlertCircle, ArrowRight, Banknote as BanknoteIcon, ReceiptText, CalendarRange
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  bankAccountsSeed, monthlyCashFlow, integratedPipelineSeed, payouts, transactions, financeSummary,
  type BankAccount, type FinancialTransaction, type FlowPipelineStep, type Payout, type SystemTier
} from '../data/finance'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FinanceDashboardPage({ events, notify, onNavigate }: Props) {
  const [tier, setTier] = useState<SystemTier>('advanced')
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [period, setPeriod] = useState<string>('30d')
  const [txSearch, setTxSearch] = useState<string>('')
  const [txFilter, setTxFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'transactions' | 'accounts' | 'payouts'>('transactions')

  // Modals state
  const [showPayoutModal, setShowPayoutModal] = useState<boolean>(false)
  const [showAdvanceModal, setShowAdvanceModal] = useState<boolean>(false)
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)

  // Form State for Payout Request
  const [payoutForm, setPayoutForm] = useState({
    eventId: events[0]?.id || 1,
    bankAccountId: bankAccountsSeed[0].id,
    amount: '15000.00',
    method: 'PIX' as 'PIX' | 'TED',
    pixKey: bankAccountsSeed[0].pixKey,
  })

  // Form State for Advance Simulation
  const [advanceAmount, setAdvanceAmount] = useState<number>(50000)
  const advanceFee = advanceAmount * 0.035
  const advanceNet = advanceAmount - advanceFee

  // Local mutable state for dynamic updates
  const [payoutList, setPayoutList] = useState<Payout[]>(payouts)
  const [txList, setTxList] = useState<FinancialTransaction[]>(transactions)
  const [bankAccounts] = useState<BankAccount[]>(bankAccountsSeed)

  // Metrics from centralized financeSummary
  const availableBalance = financeSummary.availableBalance
  const receivableBalance = financeSummary.receivable
  const payableBalance = financeSummary.payable
  const transfersMonth = financeSummary.transfers
  const feesMonth = financeSummary.fees
  const blockedBalance = financeSummary.blockedBalance
  const nextPayoutDate = '30/08/2026'
  const pendingRequestsCount = payoutList.filter(p => p.status === 'Em Análise' || p.status === 'Processando').length

  const filteredTx = useMemo(() => {
    return txList.filter(t => {
      const matchesSearch = `${t.description} ${t.event} ${t.type} ${t.orderCode || ''} ${t.customer || ''}`
        .toLowerCase()
        .includes(txSearch.toLowerCase())
      const matchesFilter = txFilter === 'all' || t.type.toLowerCase() === txFilter.toLowerCase()
      return matchesSearch && matchesFilter
    })
  }, [txList, txSearch, txFilter])

  const handleRequestPayout = (e: FormEvent) => {
    e.preventDefault()
    const value = parseFloat(payoutForm.amount)
    if (isNaN(value) || value <= 0) {
      notify('Informe um valor válido para o repasse.')
      return
    }
    if (value > availableBalance) {
      notify('Valor solicitado excede o saldo disponível.')
      return
    }
    const selectedEvent = events.find(ev => ev.id === Number(payoutForm.eventId))
    const selectedBank = bankAccounts.find(b => b.id === Number(payoutForm.bankAccountId))

    const newPayout: Payout = {
      id: payoutList.length + 1,
      event: selectedEvent ? selectedEvent.title : 'Todos os eventos',
      producer: selectedEvent?.producer || 'Produtora Parceira',
      requestedAt: new Date().toLocaleDateString('pt-BR'),
      scheduledFor: new Date(Date.now() + 48 * 3600 * 1000).toLocaleDateString('pt-BR'),
      gross: value,
      fees: 0,
      net: value,
      bankAccount: selectedBank ? `${selectedBank.bankName} (${selectedBank.bankCode}) Ag. ${selectedBank.agency}` : 'Conta Cadastrada',
      status: 'Em Análise',
      method: payoutForm.method,
    }

    setPayoutList([newPayout, ...payoutList])
    setShowPayoutModal(false)
    notify(`Solicitação de repasse no valor de ${brl(value)} enviada com sucesso para auditoria!`)
  }

  const exportFinancialReport = () => {
    const headers = ['ID', 'Data', 'Descricao', 'Evento', 'Tipo', 'Metodo', 'Status', 'Valor (R$)']
    const rows = [headers.join(';')]
    filteredTx.forEach(t => {
      rows.push([
        t.id,
        `"${t.date}"`,
        `"${t.description}"`,
        `"${t.event}"`,
        `"${t.type}"`,
        `"${t.method}"`,
        `"${t.status}"`,
        t.value.toFixed(2).replace('.', ',')
      ].join(';'))
    })
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_financeiro_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify('Relatório Financeiro exportado com sucesso em CSV!')
  }

  const maxCashFlow = Math.max(...monthlyCashFlow.flatMap(i => [i.receita, i.despesa, i.repasse]))

  return (
    <div className="finance-dashboard-wrapper">
      {/* Top Header Bar */}
      <section className="finance-header-section card-surface">
        <div className="finance-header-left">
          <div className="finance-title-badge">
            <span className="eyebrow">MÓDULO FINANCEIRO & REPASSES</span>
            <div className="finance-title-row">
              <h1>Dashboard Financeiro</h1>
              <div className="tier-pill-selector">
                <button
                  type="button"
                  className={`tier-btn ${tier === 'standard' ? 'active' : ''}`}
                  onClick={() => { setTier('standard'); notify('Modo Standard ativado: Essencial financeiro e DRE.') }}
                  title="Standard: Financeiro essencial, DRE e relatórios"
                >
                  STANDARD
                </button>
                <button
                  type="button"
                  className={`tier-btn ${tier === 'advanced' ? 'active' : ''}`}
                  onClick={() => { setTier('advanced'); notify('Modo Advanced ativado: Conciliação, centros de custo e automação.') }}
                  title="Advanced: Conciliação, centros de custo, rateios e fiscal"
                >
                  ADVANCED
                </button>
                <button
                  type="button"
                  className={`tier-btn expert ${tier === 'expert' ? 'active' : ''}`}
                  onClick={() => { setTier('expert'); notify('Modo Expert ativado: IA contábil, detecção de anomalias e projeções.') }}
                  title="Expert: Inteligência contábil, anomalias, projeções e IA"
                >
                  <Sparkles size={13} /> EXPERT
                </button>
              </div>
            </div>
            <p className="page-subtitle">
              Visão consolidada de saldos, receitas, despesas, repasses e movimentações em tempo real.
            </p>
          </div>
        </div>

        <div className="finance-header-controls">
          <div className="finance-select-group">
            <span>Período</span>
            <select value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="today">Hoje (24h)</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Agosto 2026</option>
              <option value="month">Mês Atual (Julho/2026)</option>
              <option value="year">Ano de 2026</option>
            </select>
          </div>

          <div className="finance-select-group">
            <span>Evento</span>
            <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
              <option value="all">Todos os eventos</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div className="finance-action-buttons">
            <button className="tool-btn" onClick={exportFinancialReport} title="Exportar CSV">
              <Download size={15} /> Exportar
            </button>
            <button className="tool-btn secondary-highlight" onClick={() => setShowAdvanceModal(true)} title="Simular Antecipação">
              <Zap size={15} /> Antecipar
            </button>
            <button className="primary-btn" onClick={() => setShowPayoutModal(true)}>
              <Plus size={16} /> Solicitar Repasse
            </button>
          </div>
        </div>
      </section>

      {/* Integrated Lifecycle Banner */}
      <section className="integrated-pipeline-card card-surface">
        <div className="pipeline-header">
          <div className="pipeline-title">
            <Layers size={18} className="pipeline-icon" />
            <div>
              <strong>Ciclo Integrado de Faturamento e Liquidação</strong>
              <small>Rastreabilidade ponta a ponta desde a compra do cliente até o repasse bancário na conta do produtor</small>
            </div>
          </div>
          <span className="pipeline-status-badge">
            <CheckCircle2 size={14} /> Partidas Dobradas Ativas
          </span>
        </div>

        <div className="pipeline-flow-steps">
          {integratedPipelineSeed.map((step, idx) => (
            <div key={step.id} className={`pipeline-step-item ${step.status}`}>
              <div className="step-circle">{idx + 1}</div>
              <div className="step-content">
                <strong>{step.title}</strong>
                <span>{step.subtitle}</span>
                <b>{brl(step.amountCents / 100)}</b>
              </div>
              {idx < integratedPipelineSeed.length - 1 && (
                <div className="step-arrow">
                  <ArrowRight size={18} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Top 5 KPIs Grid (Fase 17.2 Pattern) */}
      <section className="finance-kpis-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <WalletCards size={22} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Saldo disponível</span>
            <strong className="kpi-value">{brl(availableBalance)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">+8.4%</span>
              <small>Disponível p/ repasse</small>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <ArrowDownLeft size={22} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">A receber</span>
            <strong className="kpi-value">{brl(receivableBalance)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">+12.1%</span>
              <small>Liquidações futuras</small>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <ArrowUpRight size={22} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">A pagar</span>
            <strong className="kpi-value">{brl(payableBalance)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">-3.2%</span>
              <small>Compromissos em aberto</small>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <Landmark size={22} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Repasses no mês</span>
            <strong className="kpi-value">{brl(transfersMonth)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">+6.8%</span>
              <small>Processados em agosto</small>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <ReceiptText size={22} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Taxas</span>
            <strong className="kpi-value">{brl(feesMonth)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">-1.5%</span>
              <small>Gateway + operação</small>
            </div>
          </div>
        </article>
      </section>

      {/* Main Charts & Analytics Grid */}
      <section className="finance-analytics-grid">
        {/* Monthly Cashflow Evolution Chart */}
        <article className="finance-chart-box card-surface">
          <div className="card-heading">
            <div>
              <h3>Evolução Financeira</h3>
              <p>Receitas, despesas e repasses nos últimos 6 meses</p>
            </div>
            <div className="chart-legend-row">
              <span className="legend-item" style={{ color: '#10B981' }}><i style={{ background: '#10B981' }} /> Receita</span>
              <span className="legend-item" style={{ color: '#F43F5E' }}><i style={{ background: '#F43F5E' }} /> Despesa</span>
              <span className="legend-item" style={{ color: '#3B82F6' }}><i style={{ background: '#3B82F6' }} /> Repasse</span>
            </div>
          </div>

          <div className="cashflow-bars-container" style={{ height: '220px' }}>
            {monthlyCashFlow.map(item => (
              <div key={item.month} className="cashflow-col">
                <div className="cashflow-pair" style={{ gap: '6px' }}>
                  <div
                    className="bar-entry"
                    style={{ height: `${Math.max(12, (item.receita / maxCashFlow) * 160)}px`, background: '#10B981', width: '12px' }}
                    title={`Receita: ${brl(item.receita)}`}
                  />
                  <div
                    className="bar-exit"
                    style={{ height: `${Math.max(8, (item.despesa / maxCashFlow) * 160)}px`, background: '#F43F5E', width: '12px' }}
                    title={`Despesa: ${brl(item.despesa)}`}
                  />
                  <div
                    className="bar-entry"
                    style={{ height: `${Math.max(8, (item.repasse / maxCashFlow) * 160)}px`, background: '#3B82F6', width: '12px' }}
                    title={`Repasse: ${brl(item.repasse)}`}
                  />
                </div>
                <span className="day-label">{item.month}</span>
              </div>
            ))}
          </div>

          <div className="cashflow-summary-footer">
            <div className="summary-item">
              <ArrowDownLeft size={16} className="text-green" />
              <div>
                <span>Total Receita no Período</span>
                <strong>{brl(financeSummary.grossRevenue)}</strong>
              </div>
            </div>
            <div className="summary-item">
              <ArrowUpRight size={16} className="text-red" />
              <div>
                <span>Total Repasses no Mês</span>
                <strong>{brl(transfersMonth)}</strong>
              </div>
            </div>
            <div className="summary-item highlight">
              <TrendingUp size={16} className="text-blue" />
              <div>
                <span>Resultado Líquido</span>
                <strong>{brl(financeSummary.netRevenue)}</strong>
              </div>
            </div>
          </div>
        </article>

        {/* Upcoming Payouts Card */}
        <aside className="finance-side-panels">
          <article className="card-surface side-card">
            <div className="card-heading">
              <div>
                <h3>Próximos Repasses</h3>
                <p>Pagamentos programados para produtoras</p>
              </div>
              <Landmark size={20} className="text-muted" />
            </div>

            <div className="payment-shares" style={{ gap: '12px' }}>
              {payoutList.slice(0, 3).map((item) => (
                <div key={item.id} className="share-item" style={{ padding: '12px' }}>
                  <div className="share-info">
                    <strong style={{ fontSize: '13px' }}>{item.producer || 'Produtora Parceira'}</strong>
                    <span style={{ color: '#64748B' }}>{item.event}</span>
                    <small style={{ color: '#94A3B8', marginTop: '2px', display: 'block' }}>Previsão: {item.scheduledFor}</small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <b style={{ color: '#0F172A', fontSize: '13px' }}>{brl(item.net)}</b>
                    <span className="kpi-tag active" style={{ display: 'block', marginTop: '4px', textAlign: 'center' }}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="tool-btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
              onClick={() => onNavigate?.('finance-payouts')}
            >
              Ver Todos os Repasses <ChevronRight size={14} />
            </button>
          </article>
        </aside>
      </section>

      {/* Operational Sections Tabs */}
      <section className="finance-table-section card-surface">
        <div className="table-header-tabs">
          <div className="tabs-list">
            <button
              className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              <CreditCard size={15} /> Últimas Movimentações ({txList.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'payouts' ? 'active' : ''}`}
              onClick={() => setActiveTab('payouts')}
            >
              <Landmark size={15} /> Solicitações de Repasse ({payoutList.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
              onClick={() => setActiveTab('accounts')}
            >
              <Building2 size={15} /> Contas Bancárias Cadastradas ({bankAccounts.length})
            </button>
          </div>

          <div className="table-tools-right">
            {activeTab === 'transactions' && (
              <>
                <div className="small-search">
                  <Search size={14} />
                  <input
                    value={txSearch}
                    onChange={e => setTxSearch(e.target.value)}
                    placeholder="Buscar transação, pedido ou cliente..."
                  />
                  {txSearch && (
                    <button onClick={() => setTxSearch('')} className="icon-clear">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="type-filter-select">
                  <Filter size={13} />
                  <select value={txFilter} onChange={e => setTxFilter(e.target.value)}>
                    <option value="all">Todos os tipos</option>
                    <option value="venda">Vendas</option>
                    <option value="repasse">Repasses</option>
                    <option value="taxa">Taxas</option>
                    <option value="estorno">Estornos</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === 'payouts' && (
              <button className="primary-btn compact-btn" onClick={() => setShowPayoutModal(true)}>
                <Plus size={14} /> Solicitar Novo Repasse
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Extrato & Transações */}
        {activeTab === 'transactions' && (
          <div className="lots-table-wrap">
            <table className="lots-table finance-table">
              <thead>
                <tr>
                  <th>Data / Hora</th>
                  <th>Pedido / Lançamento</th>
                  <th>Evento</th>
                  <th>Forma</th>
                  <th>Cliente</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Valor Líquido</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.map(t => (
                  <tr key={t.id}>
                    <td>
                      <span className="tx-date">{t.date}</span>
                    </td>
                    <td>
                      <div className="transaction-desc">
                        <span className={`transaction-icon ${t.value >= 0 ? 'in' : 'out'}`}>
                          {t.value >= 0 ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                        </span>
                        <div>
                          <strong>{t.description}</strong>
                          <small>{t.orderCode || t.type}</small>
                        </div>
                      </div>
                    </td>
                    <td className="event-name-cell">{t.event}</td>
                    <td>
                      <span className="badge-method">{t.method}</span>
                    </td>
                    <td>
                      <span>{t.customer || '—'}</span>
                    </td>
                    <td>
                      <span className={`finance-status ${t.status.toLowerCase()}`}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }} className={t.value >= 0 ? 'money-positive' : 'money-negative'}>
                      <strong>{t.value >= 0 ? '+ ' : ''}{brl(t.value)}</strong>
                    </td>
                  </tr>
                ))}
                {!filteredTx.length && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                      Nenhuma transação encontrada com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Repasses */}
        {activeTab === 'payouts' && (
          <div className="lots-table-wrap">
            <table className="lots-table finance-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Evento / Produtora</th>
                  <th>Conta de Destino</th>
                  <th>Solicitado em</th>
                  <th>Previsão</th>
                  <th>Forma</th>
                  <th>Valor Bruto</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {payoutList.map(p => (
                  <tr key={p.id}>
                    <td><b>#{p.id}</b></td>
                    <td className="event-name-cell">
                      <strong>{p.event}</strong>
                      <small style={{ color: '#64748B', display: 'block' }}>{p.producer}</small>
                    </td>
                    <td>
                      <span className="bank-account-tag">{p.bankAccount}</span>
                    </td>
                    <td>{p.requestedAt}</td>
                    <td><b>{p.scheduledFor}</b></td>
                    <td>
                      <span className="badge-method">{p.method}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#10B981' }}>{brl(p.net)}</strong>
                    </td>
                    <td>
                      <span className={`finance-status ${p.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="text-action"
                        onClick={() => setSelectedPayout(p)}
                        title="Ver Comprovante / Detalhes"
                      >
                        <Eye size={14} /> Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Contas Bancárias */}
        {activeTab === 'accounts' && (
          <div className="bank-accounts-grid">
            {bankAccounts.map(b => (
              <div key={b.id} className="bank-card card-surface">
                <div className="bank-card-head">
                  <div>
                    <span className="bank-code-badge">{b.bankCode}</span>
                    <strong>{b.bankName}</strong>
                  </div>
                  {b.isPrimary && <span className="primary-pill">Conta Principal</span>}
                </div>

                <div className="bank-details-rows">
                  <div className="bank-detail">
                    <span>Agência:</span> <b>{b.agency}</b>
                  </div>
                  <div className="bank-detail">
                    <span>Conta {b.accountType}:</span> <b>{b.accountNumber}</b>
                  </div>
                  <div className="bank-detail">
                    <span>Chave PIX ({b.pixType}):</span> <code>{b.pixKey}</code>
                  </div>
                  <div className="bank-detail">
                    <span>Titular / Razão Social:</span> <small>{b.holderName}</small>
                  </div>
                  <div className="bank-detail">
                    <span>CNPJ / CPF:</span> <small>{b.holderDocument}</small>
                  </div>
                </div>

                <div className="bank-card-footer">
                  <span className="status-verified">
                    <CheckCircle2 size={13} /> {b.status}
                  </span>
                  <button
                    className="icon-action"
                    onClick={() => {
                      navigator.clipboard.writeText(b.pixKey)
                      notify('Chave PIX copiada!')
                    }}
                    title="Copiar Chave PIX"
                  >
                    <Copy size={14} /> Copiar PIX
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal: Solicitar Repasse Bancário */}
      {showPayoutModal && (
        <div className="utm-modal-backdrop" onClick={() => setShowPayoutModal(false)}>
          <div className="utm-modal-card wide" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">TRANSFERÊNCIA BANCÁRIA</span>
                <h3>Solicitar Novo Repasse</h3>
                <p>Transferência dos valores liberados de vendas para a conta bancária cadastrada.</p>
              </div>
              <button className="icon-action" onClick={() => setShowPayoutModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRequestPayout}>
              <div className="modal-form-grid">
                <label>
                  Evento Elegível *
                  <select
                    value={payoutForm.eventId}
                    onChange={e => setPayoutForm({ ...payoutForm, eventId: Number(e.target.value) })}
                    required
                  >
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title} (ID.{ev.code})</option>
                    ))}
                  </select>
                </label>

                <label>
                  Conta Bancária de Destino *
                  <select
                    value={payoutForm.bankAccountId}
                    onChange={e => {
                      const bId = Number(e.target.value)
                      const b = bankAccounts.find(x => x.id === bId)
                      setPayoutForm({
                        ...payoutForm,
                        bankAccountId: bId,
                        pixKey: b?.pixKey || ''
                      })
                    }}
                    required
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} — Ag. {b.agency} / C.C {b.accountNumber} ({b.holderName})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Forma de Recebimento *
                  <div className="radio-pills">
                    <button
                      type="button"
                      className={`radio-pill ${payoutForm.method === 'PIX' ? 'active' : ''}`}
                      onClick={() => setPayoutForm({ ...payoutForm, method: 'PIX' })}
                    >
                      <Zap size={14} /> PIX (Liquidação Instantânea)
                    </button>
                    <button
                      type="button"
                      className={`radio-pill ${payoutForm.method === 'TED' ? 'active' : ''}`}
                      onClick={() => setPayoutForm({ ...payoutForm, method: 'TED' })}
                    >
                      <Landmark size={14} /> TED Tradicional (Mesmo dia útil)
                    </button>
                  </div>
                </label>

                <label>
                  Valor a Transferir (R$) *
                  <div className="input-money-wrap">
                    <span>R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="100.00"
                      max={availableBalance}
                      value={payoutForm.amount}
                      onChange={e => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                      required
                    />
                  </div>
                  <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Saldo disponível para este saque: <b>{brl(availableBalance)}</b>
                  </small>
                </label>
              </div>

              <div className="payout-summary-box">
                <div className="payout-summary-row">
                  <span>Valor Solicitado (Bruto)</span>
                  <strong>{brl(parseFloat(payoutForm.amount) || 0)}</strong>
                </div>
                <div className="payout-summary-row">
                  <span>Taxa de Transferência Bancária</span>
                  <strong style={{ color: '#10B981' }}>R$ 0,00 (Gratuito)</strong>
                </div>
                <div className="payout-summary-row total">
                  <span>Valor Líquido a Receber</span>
                  <strong>{brl(parseFloat(payoutForm.amount) || 0)}</strong>
                </div>
              </div>

              <div className="utm-modal-actions">
                <button type="button" className="btn secondary" onClick={() => setShowPayoutModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn primary">
                  <Banknote size={15} /> Confirmar Solicitação de Repasse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Simular Antecipação de Receitas */}
      {showAdvanceModal && (
        <div className="utm-modal-backdrop" onClick={() => setShowAdvanceModal(false)}>
          <div className="utm-modal-card" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">CRÉDITO & LIQUIDEZ</span>
                <h3>Simulador de Antecipação de Receitas</h3>
                <p>Antecipe o faturamento das vendas parceladas e lotes futuros com taxa preferencial de 3,5% a.m.</p>
              </div>
              <button className="icon-action" onClick={() => setShowAdvanceModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="advance-simulation-body">
              <label>
                Valor que deseja antecipar (R$):
                <input
                  type="range"
                  min={5000}
                  max={200000}
                  step={5000}
                  value={advanceAmount}
                  onChange={e => setAdvanceAmount(Number(e.target.value))}
                  style={{ width: '100%', margin: '12px 0' }}
                />
                <strong className="advance-big-val">{brl(advanceAmount)}</strong>
              </label>

              <div className="advance-breakdown-card">
                <div className="breakdown-line">
                  <span>Valor Bruto Solicitado</span>
                  <strong>{brl(advanceAmount)}</strong>
                </div>
                <div className="breakdown-line">
                  <span>Taxa Administrativa de Antecipação (3,5%)</span>
                  <strong style={{ color: '#EF4444' }}>- {brl(advanceFee)}</strong>
                </div>
                <div className="breakdown-line total">
                  <span>Valor Líquido Creditado na Conta</span>
                  <strong style={{ color: '#10B981' }}>{brl(advanceNet)}</strong>
                </div>
              </div>
            </div>

            <div className="utm-modal-actions">
              <button className="btn secondary" onClick={() => setShowAdvanceModal(false)}>
                Fechar
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  setShowAdvanceModal(false)
                  notify(`Proposta de antecipação no valor de ${brl(advanceNet)} enviada para aprovação!`)
                }}
              >
                <Zap size={15} /> Contratar Antecipação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalhes do Repasse */}
      {selectedPayout && (
        <div className="utm-modal-backdrop" onClick={() => setSelectedPayout(null)}>
          <div className="utm-modal-card wide" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">DETALHES DO REPASSE BANCÁRIO</span>
                <h3>Repasse #{selectedPayout.id} — {selectedPayout.event}</h3>
                <p>Auditoria, informações bancárias e comprovante de liquidação financeira.</p>
              </div>
              <button className="icon-action" onClick={() => setSelectedPayout(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="utm-order-detail-grid">
              <div className="utm-order-detail-item">
                <span>Evento</span>
                <strong>{selectedPayout.event}</strong>
              </div>
              <div className="utm-order-detail-item">
                <span>Status da Liquidação</span>
                <strong className={`finance-status ${selectedPayout.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {selectedPayout.status}
                </strong>
              </div>
              <div className="utm-order-detail-item">
                <span>Data da Solicitação</span>
                <strong>{selectedPayout.requestedAt}</strong>
              </div>
              <div className="utm-order-detail-item">
                <span>Data de Previsão / Liquidação</span>
                <strong>{selectedPayout.scheduledFor}</strong>
              </div>
              <div className="utm-order-detail-item full">
                <span>Conta Bancária Creditada</span>
                <strong>{selectedPayout.bankAccount}</strong>
              </div>
              <div className="utm-order-detail-item">
                <span>Forma de Envio</span>
                <strong className="badge-method">{selectedPayout.method}</strong>
              </div>
              <div className="utm-order-detail-item">
                <span>Valor Líquido Transferido</span>
                <strong style={{ color: '#10B981', fontSize: '18px' }}>{brl(selectedPayout.net)}</strong>
              </div>
            </div>

            <div className="utm-modal-actions">
              <button className="btn secondary" onClick={() => setSelectedPayout(null)}>
                Fechar
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  notify(`Download do comprovante do repasse #${selectedPayout.id} iniciado!`)
                }}
              >
                <Download size={15} /> Baixar Comprovante PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
