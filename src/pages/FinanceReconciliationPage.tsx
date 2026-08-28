import { useState, useMemo } from 'react'
import {
  Scale, Upload, Download, CheckCircle2, AlertCircle, RefreshCw,
  Search, Filter, Landmark, FileSpreadsheet, Eye, X, ArrowLeftRight
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  reconciliationsSeed, financeSummary, bankAccountsSeed,
  type ReconciliationItem
} from '../data/finance'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FinanceReconciliationPage({ events, notify, onNavigate }: Props) {
  const [search, setSearch] = useState('')
  const [bankFilter, setBankFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showImportModal, setShowImportModal] = useState(false)
  const [reconciliations, setReconciliations] = useState<ReconciliationItem[]>(reconciliationsSeed)

  const filtered = useMemo(() => {
    return reconciliations.filter(r => {
      const q = search.toLowerCase()
      const matchesSearch =
        r.systemDescription.toLowerCase().includes(q) ||
        r.bankDescription.toLowerCase().includes(q) ||
        (r.orderCode || '').toLowerCase().includes(q)

      const matchesBank = bankFilter === 'all' || r.bankName.includes(bankFilter)
      const matchesStatus = statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesBank && matchesStatus
    })
  }, [reconciliations, search, bankFilter, statusFilter])

  const reconciledCount = reconciliations.filter(r => r.status === 'Conciliado').length
  const pendingCount = reconciliations.filter(r => r.status === 'Pendente').length
  const divergenceCount = reconciliations.filter(r => r.status === 'Divergente').length

  const handleConciliateItem = (id: number) => {
    setReconciliations(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'Conciliado' } : r)
    )
    notify(`Lançamento #${id} conciliado com sucesso!`)
  }

  const exportReconciliationCSV = () => {
    const headers = ['ID', 'Data', 'Banco', 'Lancamento Sistema', 'Extrato Bancario', 'Codigo Conciliacao', 'Valor Sistema (R$)', 'Valor Extrato (R$)', 'Diferenca (R$)', 'Status']
    const rows = [headers.join(';')]
    filtered.forEach(r => {
      rows.push([
        r.id,
        `"${r.date}"`,
        `"${r.bankName}"`,
        `"${r.systemDescription}"`,
        `"${r.bankDescription}"`,
        `"${r.orderCode || ''}"`,
        r.systemValue.toFixed(2).replace('.', ','),
        r.bankValue.toFixed(2).replace('.', ','),
        r.difference.toFixed(2).replace('.', ','),
        `"${r.status}"`
      ].join(';'))
    })
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conciliacao_bancaria_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify('Relatório de Conciliação exportado em CSV com sucesso!')
  }

  return (
    <div className="finance-dashboard-wrapper">
      {/* Header Section */}
      <section className="finance-header-section card-surface">
        <div className="finance-header-left">
          <span className="eyebrow">AUDITORIA & CONFORMIDADE</span>
          <div className="finance-title-row">
            <h1>Conciliação Bancária (OFX / CNAB)</h1>
            <span className="pipeline-status-badge">
              <CheckCircle2 size={13} /> Batimento Automático 99,4%
            </span>
          </div>
          <p className="page-subtitle">
            Conferência automática entre os lançamentos do sistema DiskIngressos e os extratos das contas bancárias correntes.
          </p>
        </div>

        <div className="finance-header-controls">
          <div className="finance-action-buttons">
            <button className="tool-btn" onClick={exportReconciliationCSV} title="Exportar CSV">
              <Download size={15} /> Exportar CSV
            </button>
            <button className="primary-btn" onClick={() => setShowImportModal(true)}>
              <Upload size={16} /> Importar Extrato OFX
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards Strip */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <Landmark size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Saldo em Sistema</span>
            <strong className="kpi-value">{brl(financeSummary.availableBalance)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">Contábil</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Itens Conciliados</span>
            <strong className="kpi-value">{reconciledCount} de {reconciliations.length}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">99.4% precisão</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <RefreshCw size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Pendentes de Batimento</span>
            <strong className="kpi-value">{pendingCount} item(ns)</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">{brl(1840.00)}</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <Scale size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Divergências</span>
            <strong className="kpi-value">{divergenceCount}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">R$ 0,00</span>
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
                placeholder="Buscar por lançamento ou extrato..."
              />
              {search && (
                <button onClick={() => setSearch('')} className="icon-clear">
                  <X size={12} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="type-filter-select">
                <Landmark size={13} />
                <select value={bankFilter} onChange={e => setBankFilter(e.target.value)}>
                  <option value="all">Todos os bancos</option>
                  <option value="Itaú">Banco Itaú</option>
                  <option value="Bradesco">Banco Bradesco</option>
                  <option value="Nubank">Nu Pagamentos</option>
                  <option value="Brasil">Banco do Brasil</option>
                </select>
              </div>

              <div className="type-filter-select">
                <Filter size={13} />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">Todos os status</option>
                  <option value="conciliado">Conciliado</option>
                  <option value="pendente">Pendente</option>
                  <option value="divergente">Divergente</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lots-table-wrap">
          <table className="lots-table finance-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Conta Bancária</th>
                <th>Lançamento do Sistema</th>
                <th>Extrato Bancário (OFX)</th>
                <th style={{ textAlign: 'right' }}>Valor Sistema</th>
                <th style={{ textAlign: 'right' }}>Valor Banco</th>
                <th style={{ textAlign: 'right' }}>Diferença</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td><span className="tx-date">{r.date}</span></td>
                  <td><span className="bank-account-tag">{r.bankName}</span></td>
                  <td>
                    <div className="transaction-desc">
                      <strong>{r.systemDescription}</strong>
                      <small>{r.orderCode || 'Sem Código'}</small>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '11px', color: '#64748B' }}>{r.bankDescription}</code>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong className={r.systemValue >= 0 ? 'money-positive' : 'money-negative'}>
                      {brl(r.systemValue)}
                    </strong>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong className={r.bankValue >= 0 ? 'money-positive' : 'money-negative'}>
                      {brl(r.bankValue)}
                    </strong>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ color: r.difference === 0 ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                      {brl(r.difference)}
                    </span>
                  </td>
                  <td>
                    <span className={`finance-status ${r.status.toLowerCase()}`}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {r.status === 'Pendente' ? (
                      <button
                        className="primary-btn compact-btn"
                        onClick={() => handleConciliateItem(r.id)}
                        title="Aprovar Conciliação"
                      >
                        <CheckCircle2 size={13} /> Conciliar
                      </button>
                    ) : (
                      <span className="status-verified" style={{ fontSize: '12px' }}>
                        <CheckCircle2 size={13} /> OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '32px' }}>
                    Nenhum item localizado para a conciliação.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: Importar Extrato OFX/CNAB */}
      {showImportModal && (
        <div className="utm-modal-backdrop" onClick={() => setShowImportModal(false)}>
          <div className="utm-modal-card" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">IMPORTAÇÃO DE EXTRATO</span>
                <h3>Importar Arquivo OFX / CNAB 240</h3>
                <p>Faça upload do extrato bancário para conciliação automática com as vendas.</p>
              </div>
              <button className="icon-action" onClick={() => setShowImportModal(false)}>✕</button>
            </div>

            <div className="advance-simulation-body">
              <label>
                Selecione a Conta Bancária de Destino:
                <select defaultValue={bankAccountsSeed[0].id} style={{ width: '100%', marginTop: '6px' }}>
                  {bankAccountsSeed.map(b => (
                    <option key={b.id} value={b.id}>{b.bankName} (Ag. {b.agency} C/C {b.accountNumber})</option>
                  ))}
                </select>
              </label>

              <div
                style={{
                  border: '2px dashed #334155',
                  borderRadius: '10px',
                  padding: '30px 20px',
                  textAlign: 'center',
                  background: '#08121F',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setShowImportModal(false)
                  notify('Extrato OFX processado! 18 transações conciliadas com sucesso.')
                }}
              >
                <Upload size={32} style={{ color: '#38BDF8', margin: '0 auto 10px' }} />
                <strong style={{ display: 'block', color: '#FFFFFF', fontSize: '13px' }}>
                  Clique para selecionar arquivo .OFX ou .RET
                </strong>
                <small style={{ color: '#94A3B8' }}>Formatos suportados: OFX 2.0, CNAB 240, CNAB 400, CSV Bancário</small>
              </div>
            </div>

            <div className="utm-modal-actions">
              <button className="btn secondary" onClick={() => setShowImportModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
