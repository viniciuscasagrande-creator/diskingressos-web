import { useState, useMemo } from 'react'
import {
  ReceiptText, Search, Filter, Download, ArrowDownLeft, ArrowUpRight,
  CreditCard, Calendar, Eye, FileSpreadsheet, X, CheckCircle2,
  Clock, AlertCircle, Sparkles, Building2, User
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  transactions, type FinancialTransaction
} from '../data/finance'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FinanceStatementPage({ events, notify, onNavigate }: Props) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [selectedTx, setSelectedTx] = useState<FinancialTransaction | null>(null)
  const [txList] = useState<FinancialTransaction[]>(transactions)

  const filtered = useMemo(() => {
    return txList.filter(t => {
      const q = search.toLowerCase()
      const matchesSearch =
        t.description.toLowerCase().includes(q) ||
        t.event.toLowerCase().includes(q) ||
        (t.orderCode || '').toLowerCase().includes(q) ||
        (t.customer || '').toLowerCase().includes(q)

      const matchesType = typeFilter === 'all' || t.type.toLowerCase() === typeFilter.toLowerCase()
      const matchesMethod = methodFilter === 'all' || t.method.toLowerCase() === methodFilter.toLowerCase()

      return matchesSearch && matchesType && matchesMethod
    })
  }, [txList, search, typeFilter, methodFilter])

  // Summary Metrics
  const totalEntries = filtered.filter(t => t.value > 0).reduce((acc, t) => acc + t.value, 0)
  const totalExits = filtered.filter(t => t.value < 0).reduce((acc, t) => acc + Math.abs(t.value), 0)
  const netTotal = totalEntries - totalExits

  const exportCSV = () => {
    const headers = ['ID', 'Data', 'Pedido', 'Descricao', 'Evento', 'Cliente', 'Tipo', 'Forma', 'Status', 'Valor (R$)']
    const rows = [headers.join(';')]
    filtered.forEach(t => {
      rows.push([
        t.id,
        `"${t.date}"`,
        `"${t.orderCode || ''}"`,
        `"${t.description}"`,
        `"${t.event}"`,
        `"${t.customer || ''}"`,
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
    a.download = `extrato_detalhado_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify('Extrato Financeiro exportado com sucesso em CSV!')
  }

  return (
    <div className="finance-dashboard-wrapper">
      {/* Header Section */}
      <section className="finance-header-section card-surface">
        <div className="finance-header-left">
          <span className="eyebrow">LANÇAMENTOS & CONCILIAÇÃO</span>
          <div className="finance-title-row">
            <h1>Extrato Financeiro Detalhado</h1>
            <span className="pipeline-status-badge">
              <CheckCircle2 size={13} /> Conciliação em Tempo Real
            </span>
          </div>
          <p className="page-subtitle">
            Histórico completo de vendas de ingressos, repasses bancários, taxas administrativas de gateway e estornos processados.
          </p>
        </div>

        <div className="finance-header-controls">
          <div className="finance-action-buttons">
            <button className="tool-btn" onClick={exportCSV} title="Exportar CSV">
              <Download size={15} /> Exportar CSV
            </button>
          </div>
        </div>
      </section>

      {/* Summary KPI Strip */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <ArrowDownLeft size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Entradas (Vendas)</span>
            <strong className="kpi-value">{brl(totalEntries)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">+ 100% faturado</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <ArrowUpRight size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Saídas & Repasses</span>
            <strong className="kpi-value">{brl(totalExits)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">Transferências efetuadas</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <ReceiptText size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Resultado Líquido</span>
            <strong className="kpi-value">{brl(netTotal)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">Balanço do Período</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <CreditCard size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Volume de Transações</span>
            <strong className="kpi-value">{filtered.length} registro(s)</strong>
            <div className="kpi-footer">
              <span className="kpi-tag warning">Auditado</span>
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
                placeholder="Buscar por descrição, pedido, cliente..."
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
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="all">Todos os tipos</option>
                  <option value="venda">Vendas</option>
                  <option value="repasse">Repasses</option>
                  <option value="taxa">Taxas</option>
                  <option value="estorno">Estornos</option>
                </select>
              </div>

              <div className="type-filter-select">
                <CreditCard size={13} />
                <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)}>
                  <option value="all">Todas as formas</option>
                  <option value="pix">PIX</option>
                  <option value="crédito">Crédito</option>
                  <option value="débito">Débito</option>
                  <option value="boleto">Boleto</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lots-table-wrap">
          <table className="lots-table finance-table">
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Lançamento / Descrição</th>
                <th>Evento</th>
                <th>Forma</th>
                <th>Cliente</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Valor Líquido</th>
                <th style={{ textAlign: 'center' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td><span className="tx-date">{t.date}</span></td>
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
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="text-action"
                      onClick={() => setSelectedTx(t)}
                      title="Ver Comprovante / Detalhes"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                    Nenhuma transação encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="utm-modal-backdrop" onClick={() => setSelectedTx(null)}>
          <div className="utm-modal-card wide" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">COMPROVANTE DE LANÇAMENTO</span>
                <h3>Transação #{selectedTx.id} — {selectedTx.description}</h3>
                <p>Auditoria contábil e autorização adquirente da operação</p>
              </div>
              <button className="icon-action" onClick={() => setSelectedTx(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="utm-order-detail-grid">
              <div className="utm-order-detail-item">
                <span>Tipo de Operação</span>
                <strong>{selectedTx.type}</strong>
              </div>
              <div className="utm-order-detail-item">
                <span>Status da Liquidação</span>
                <strong className={`finance-status ${selectedTx.status.toLowerCase()}`}>{selectedTx.status}</strong>
              </div>
              <div className="utm-order-detail-item">
                <span>Data do Registro</span>
                <strong>{selectedTx.date}</strong>
              </div>
              <div className="utm-order-detail-item">
                <span>Meio de Pagamento</span>
                <strong>{selectedTx.method}</strong>
              </div>
              <div className="utm-order-detail-item">
                <span>Evento de Origem</span>
                <strong>{selectedTx.event}</strong>
              </div>
              <div className="utm-order-detail-item">
                <span>Comprador / Titular</span>
                <strong>{selectedTx.customer || 'Transação do Sistema'}</strong>
              </div>
              <div className="utm-order-detail-item full">
                <span>Código de Rastreio / Conciliação</span>
                <code>{selectedTx.orderCode || `TX-SYS-${selectedTx.id}`}</code>
              </div>
              <div className="utm-order-detail-item full">
                <span>Valor Líquido Contabilizado</span>
                <strong style={{ color: selectedTx.value >= 0 ? '#10B981' : '#EF4444', fontSize: '18px' }}>
                  {brl(selectedTx.value)}
                </strong>
              </div>
            </div>

            <div className="utm-modal-actions">
              <button className="btn secondary" onClick={() => setSelectedTx(null)}>
                Fechar
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  notify(`Comprovante da transação #${selectedTx.id} exportado com sucesso!`)
                }}
              >
                <Download size={15} /> Baixar Recibo PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
