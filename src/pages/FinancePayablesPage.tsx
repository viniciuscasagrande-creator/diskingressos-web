import { useState, useMemo, type FormEvent } from 'react'
import { consumeFinanceDrilldown } from '../utils/financeDrilldown'
import {
  ArrowUpRight, Landmark, Search, Filter, Download, Plus,
  CheckCircle2, Clock, Calendar, AlertCircle, X, Building2,
  ReceiptText, CreditCard, ArrowLeft
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  payablesSeed, financeSummary,
  type PayableItem
} from '../data/finance'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FinancePayablesPage({ events, notify, onNavigate }: Props) {
  const [drilldown] = useState(() => consumeFinanceDrilldown('finance-payables'))
  const [search, setSearch] = useState(drilldown?.eventName || '')
  const [categoryFilter, setCategoryFilter] = useState(drilldown?.category || 'all')
  const [statusFilter, setStatusFilter] = useState(drilldown?.status || 'all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [payablesList, setPayablesList] = useState<PayableItem[]>(payablesSeed)

  // Form State
  const [formData, setFormData] = useState({
    description: '',
    vendor: '',
    category: 'Repasse Produtor' as PayableItem['category'],
    event: events[0]?.title || 'Geral',
    dueDate: '10/09/2026',
    paymentMethod: 'PIX' as PayableItem['paymentMethod'],
    amount: '',
  })

  const filtered = useMemo(() => {
    return payablesList.filter(p => {
      const q = search.toLowerCase()
      const matchesSearch =
        p.description.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.event.toLowerCase().includes(q)

      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter
      const normalizedStatus = p.status.toLowerCase()
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'open' ? normalizedStatus !== 'pago' : normalizedStatus === statusFilter.toLowerCase())

      return matchesSearch && matchesCat && matchesStatus
    })
  }, [payablesList, search, categoryFilter, statusFilter])

  const totalPayables = financeSummary.payable
  const totalIn7Days = 42300.00
  const totalInfra = 14800.00

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault()
    const val = parseFloat(formData.amount)
    if (isNaN(val) || val <= 0) {
      notify('Informe um valor válido.')
      return
    }

    const newItem: PayableItem = {
      id: payablesList.length + 201,
      description: formData.description || 'Despesa Operacional',
      vendor: formData.vendor || 'Fornecedor Cadastrado',
      category: formData.category,
      event: formData.event,
      dueDate: formData.dueDate,
      paymentMethod: formData.paymentMethod,
      amount: val,
      status: 'Agendado',
      documentNumber: `DOC-MAN-${Date.now().toString().slice(-4)}`
    }

    setPayablesList([newItem, ...payablesList])
    setShowAddModal(false)
    notify(`Conta a pagar no valor de ${brl(val)} agendada com sucesso!`)
  }

  const exportPayablesCSV = () => {
    const headers = ['ID', 'Descricao', 'Favorecido', 'Categoria', 'Evento', 'Vencimento', 'Forma', 'Valor (R$)', 'Status', 'Documento']
    const rows = [headers.join(';')]
    filtered.forEach(p => {
      rows.push([
        p.id,
        `"${p.description}"`,
        `"${p.vendor}"`,
        `"${p.category}"`,
        `"${p.event}"`,
        `"${p.dueDate}"`,
        `"${p.paymentMethod}"`,
        p.amount.toFixed(2).replace('.', ','),
        `"${p.status}"`,
        `"${p.documentNumber || ''}"`
      ].join(';'))
    })
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contas_a_pagar_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify('Relatório de Contas a Pagar exportado com sucesso em CSV!')
  }

  return (
    <div className="finance-dashboard-wrapper">
      {/* Back to Dashboard bar */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => onNavigate ? onNavigate('finance-dashboard') : window.history.back()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-[#334155] text-slate-700 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>
      </div>

      {/* Header Section */}
      <section className="finance-header-section card-surface">
        <div className="finance-header-left">
          <span className="eyebrow">OBRIGAÇÕES & DESPESAS</span>
          <div className="finance-title-row">
            <h1>Contas a Pagar (Obrigações Operacionais)</h1>
            <span className="pipeline-status-badge">
              <CheckCircle2 size={13} /> 100% dos Pagamentos em Dia
            </span>
          </div>
          <p className="page-subtitle">
            Controle de compromissos financeiros, repasses a produtores, tarifas de adquirentes e custos de infraestrutura.
          </p>
        </div>

        <div className="finance-header-controls">
          <div className="finance-action-buttons">
            <button className="tool-btn" onClick={exportPayablesCSV} title="Exportar CSV">
              <Download size={15} /> Exportar CSV
            </button>
            <button className="primary-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Nova Conta a Pagar
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards Strip */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <ArrowUpRight size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Total a Pagar no Mês</span>
            <strong className="kpi-value">{brl(totalPayables)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">Compromissos Mês 08</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <Clock size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Próximos 7 Dias</span>
            <strong className="kpi-value">{brl(totalIn7Days)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">Agendado PIX/TED</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <Building2 size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Custos de Infra & Cloud</span>
            <strong className="kpi-value">{brl(totalInfra)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">AWS + Gateways</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Pontualidade Financeira</span>
            <strong className="kpi-value">100% em dia</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">Sem atrasos</span>
            </div>
          </div>
        </article>
      </section>

      {/* Table Section */}
      <section className="finance-table-section card-surface">
        <div className="table-header-tabs">
          <div className="table-tools-right" style={{ width: '100%', justifyContent: 'space-between' }}>
            <div className="small-search" style={{ width: '320px' }}>
              <Search size={14} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por descrição, favorecido ou evento..."
              />
              {search && (
                <button onClick={() => setSearch('')} className="icon-clear">
                  <X size={12} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="type-filter-select">
                <Filter size={13} />
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                  <option value="all">Todas as categorias</option>
                  <option value="Repasse Produtor">Repasse Produtor</option>
                  <option value="Gateway Adquirente">Gateway Adquirente</option>
                  <option value="Servidores & Infra">Servidores & Infra</option>
                  <option value="Equipe & Portaria">Equipe & Portaria</option>
                  <option value="Direitos Autorais">Direitos Autorais</option>
                </select>
              </div>

              <div className="type-filter-select">
                <Clock size={13} />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">Todos os status</option>
                  <option value="open">Em aberto do Dashboard</option>
                  <option value="agendado">Agendado</option>
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lots-table-wrap">
          <table className="lots-table finance-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descrição da Conta</th>
                <th>Favorecido / Fornecedor</th>
                <th>Categoria</th>
                <th>Evento</th>
                <th>Vencimento</th>
                <th>Forma</th>
                <th style={{ textAlign: 'right' }}>Valor a Pagar</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><b>#{p.id}</b></td>
                  <td>
                    <div className="transaction-desc">
                      <strong>{p.description}</strong>
                      <small>{p.documentNumber || 'Sem DOC'}</small>
                    </div>
                  </td>
                  <td><span>{p.vendor}</span></td>
                  <td><span className="bank-account-tag">{p.category}</span></td>
                  <td className="event-name-cell">{p.event}</td>
                  <td><b>{p.dueDate}</b></td>
                  <td><span className="badge-method">{p.paymentMethod}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#F43F5E', fontSize: '14px' }}>{brl(p.amount)}</strong>
                  </td>
                  <td>
                    <span className={`finance-status ${p.status.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '32px' }}>
                    Nenhuma conta a pagar localizada para os critérios informados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: Nova Conta a Pagar */}
      {showAddModal && (
        <div className="utm-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="utm-modal-card wide" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">NOVA OBRIGAÇÃO</span>
                <h3>Cadastrar Nova Conta a Pagar</h3>
                <p>Agendamento de pagamentos operacionais e despesas de evento.</p>
              </div>
              <button className="icon-action" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-form-grid">
                <label>
                  Descrição do Pagamento *
                  <input
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Equipe de som e iluminação Lote 1"
                    required
                  />
                </label>

                <label>
                  Favorecido / Fornecedor *
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="Ex: Áudio Master Produções Ltda"
                    required
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label>
                    Categoria *
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    >
                      <option value="Repasse Produtor">Repasse Produtor</option>
                      <option value="Gateway Adquirente">Gateway Adquirente</option>
                      <option value="Servidores & Infra">Servidores & Infra</option>
                      <option value="Equipe & Portaria">Equipe & Portaria</option>
                      <option value="Direitos Autorais">Direitos Autorais</option>
                    </select>
                  </label>

                  <label>
                    Evento de Origem *
                    <select
                      value={formData.event}
                      onChange={e => setFormData({ ...formData, event: e.target.value })}
                    >
                      <option value="Geral">Geral / Operação Global</option>
                      {events.map(ev => (
                        <option key={ev.id} value={ev.title}>{ev.title}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label>
                    Data de Vencimento *
                    <input
                      type="date"
                      defaultValue="2026-09-10"
                      onChange={e => setFormData({ ...formData, dueDate: e.target.value.split('-').reverse().join('/') })}
                      required
                    />
                  </label>

                  <label>
                    Forma de Pagamento *
                    <select
                      value={formData.paymentMethod}
                      onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    >
                      <option value="PIX">PIX</option>
                      <option value="Boleto">Boleto Bancário</option>
                      <option value="TED">TED</option>
                      <option value="Débito Automático">Débito Automático</option>
                    </select>
                  </label>
                </div>

                <label>
                  Valor da Obrigação (R$) *
                  <div className="input-money-wrap">
                    <span>R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1.00"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0,00"
                      required
                    />
                  </div>
                </label>
              </div>

              <div className="utm-modal-actions">
                <button type="button" className="btn secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn primary">
                  <Plus size={15} /> Agendar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
