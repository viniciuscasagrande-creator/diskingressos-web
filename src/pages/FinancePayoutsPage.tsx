import { useState, useMemo, type FormEvent } from 'react'
import {
  Landmark, Banknote, Calendar, Plus, Download, Eye, CheckCircle2,
  Clock, AlertCircle, Search, Filter, X, ArrowUpRight, Zap, Copy, Building2, ArrowLeft
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  payouts, bankAccountsSeed, financeSummary,
  type Payout, type BankAccount
} from '../data/finance'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FinancePayoutsPage({ events, notify, onNavigate }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [payoutList, setPayoutList] = useState<Payout[]>(payouts)

  // Form State
  const [formData, setFormData] = useState({
    eventId: events[0]?.id || 1,
    bankAccountId: bankAccountsSeed[0].id,
    amount: '25000.00',
    method: 'PIX' as 'PIX' | 'TED',
  })

  const availableBalance = financeSummary.availableBalance
  const totalTransferredMonth = financeSummary.transfers
  const nextPayoutScheduled = financeSummary.nextPayout

  const filtered = useMemo(() => {
    return payoutList.filter(p => {
      const q = search.toLowerCase()
      const matchesSearch =
        p.event.toLowerCase().includes(q) ||
        (p.producer || '').toLowerCase().includes(q) ||
        (p.bankAccount || '').toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [payoutList, search, statusFilter])

  const handleRequestSubmit = (e: FormEvent) => {
    e.preventDefault()
    const val = parseFloat(formData.amount)
    if (isNaN(val) || val <= 0) {
      notify('Informe um valor válido para o repasse.')
      return
    }
    if (val > availableBalance) {
      notify('Valor solicitado excede o saldo disponível.')
      return
    }

    const selectedEv = events.find(ev => ev.id === Number(formData.eventId))
    const selectedBank = bankAccountsSeed.find(b => b.id === Number(formData.bankAccountId))

    const newPayout: Payout = {
      id: payoutList.length + 1,
      event: selectedEv ? selectedEv.title : 'Evento Selecionado',
      producer: selectedEv?.producer || 'Produtora Parceira',
      requestedAt: new Date().toLocaleDateString('pt-BR'),
      scheduledFor: new Date(Date.now() + 48 * 3600 * 1000).toLocaleDateString('pt-BR'),
      gross: val,
      fees: 0,
      net: val,
      bankAccount: selectedBank ? `${selectedBank.bankName} (${selectedBank.bankCode}) Ag. ${selectedBank.agency}` : 'Conta Principal',
      status: 'Em Análise',
      method: formData.method,
    }

    setPayoutList([newPayout, ...payoutList])
    setShowRequestModal(false)
    notify(`Solicitação de repasse no valor de ${brl(val)} criada com sucesso!`)
  }

  return (
    <div className="finance-dashboard-wrapper">
      {/* Back to Dashboard bar */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => onNavigate ? onNavigate('finance-dashboard') : window.history.back()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>
      </div>

      {/* Header Section */}
      <section className="finance-header-section card-surface">
        <div className="finance-header-left">
          <span className="eyebrow">LIQUIDAÇÃO & TRANSFERÊNCIAS</span>
          <div className="finance-title-row">
            <h1>Repasses & Pagamentos a Produtoras</h1>
            <span className="pipeline-status-badge">
              <CheckCircle2 size={13} /> Liquidação PIX D+0 / TED D+1
            </span>
          </div>
          <p className="page-subtitle">
            Gerenciamento de transferências bancárias, solicitações de payout, borderôs de fechamento e comprovantes oficiais.
          </p>
        </div>

        <div className="finance-header-controls">
          <button className="primary-btn" onClick={() => setShowRequestModal(true)}>
            <Plus size={16} /> Solicitar Novo Repasse
          </button>
        </div>
      </section>

      {/* KPI Strip */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <Landmark size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Repasses no Mês (Agosto)</span>
            <strong className="kpi-value">{brl(totalTransferredMonth)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">8 lotes liquidados</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <Calendar size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Próximo Payout Agendado</span>
            <strong className="kpi-value">{brl(nextPayoutScheduled)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">30/08/2026</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <Clock size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Em Análise de Compliance</span>
            <strong className="kpi-value">{brl(21840.00)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag warning">1 solicitação</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <Banknote size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Saldo Disponível p/ Saque</span>
            <strong className="kpi-value">{brl(availableBalance)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">Liberado agora</span>
            </div>
          </div>
          <button className="kpi-quick-btn" onClick={() => setShowRequestModal(true)}>
            Sacar
          </button>
        </article>
      </section>

      {/* Table Section */}
      <section className="finance-table-section card-surface">
        <div className="table-header-tabs">
          <div className="card-heading">
            <div>
              <h3>Histórico de Repasses e Transferências</h3>
              <p>Rastreamento de solicitações, pagamentos executados e comprovantes bancários</p>
            </div>
          </div>

          <div className="table-tools-right">
            <div className="small-search">
              <Search size={14} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por evento, produtora ou conta..."
              />
              {search && (
                <button onClick={() => setSearch('')} className="icon-clear">
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="type-filter-select">
              <Filter size={13} />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">Todos os status</option>
                <option value="pago">Pago</option>
                <option value="agendado">Agendado</option>
                <option value="processando">Processando</option>
                <option value="em análise">Em Análise</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lots-table-wrap">
          <table className="lots-table finance-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Evento de Origem</th>
                <th>Produtora</th>
                <th>Conta de Destino</th>
                <th>Solicitado em</th>
                <th>Previsão / Pago em</th>
                <th>Forma</th>
                <th style={{ textAlign: 'right' }}>Valor Líquido</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><b>#{p.id}</b></td>
                  <td className="event-name-cell">
                    <strong>{p.event}</strong>
                  </td>
                  <td>
                    <span>{p.producer || 'Produtora Parceira'}</span>
                  </td>
                  <td>
                    <span className="bank-account-tag">{p.bankAccount}</span>
                  </td>
                  <td>{p.requestedAt}</td>
                  <td><b>{p.scheduledFor}</b></td>
                  <td>
                    <span className="badge-method">{p.method}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#10B981', fontSize: '14px' }}>{brl(p.net)}</strong>
                  </td>
                  <td>
                    <span className={`finance-status ${p.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="text-action"
                      onClick={() => setSelectedPayout(p)}
                      title="Ver Comprovante"
                    >
                      <Eye size={14} /> Detalhes
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '32px' }}>
                    Nenhum repasse encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: Solicitar Novo Repasse */}
      {showRequestModal && (
        <div className="utm-modal-backdrop" onClick={() => setShowRequestModal(false)}>
          <div className="utm-modal-card wide" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">NOVA SOLICITAÇÃO</span>
                <h3>Solicitar Repasse Bancário</h3>
                <p>Transferência de saldo disponível de vendas para a conta bancária do produtor.</p>
              </div>
              <button className="icon-action" onClick={() => setShowRequestModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit}>
              <div className="modal-form-grid">
                <label>
                  Evento de Origem *
                  <select
                    value={formData.eventId}
                    onChange={e => setFormData({ ...formData, eventId: Number(e.target.value) })}
                    required
                  >
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title} (ID.{ev.code})</option>
                    ))}
                  </select>
                </label>

                <label>
                  Conta Bancária Cadastrada *
                  <select
                    value={formData.bankAccountId}
                    onChange={e => setFormData({ ...formData, bankAccountId: Number(e.target.value) })}
                    required
                  >
                    {bankAccountsSeed.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} — Ag. {b.agency} C/C {b.accountNumber} ({b.holderName})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Forma de Liquidação *
                  <div className="radio-pills">
                    <button
                      type="button"
                      className={`radio-pill ${formData.method === 'PIX' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, method: 'PIX' })}
                    >
                      <Zap size={14} /> PIX Instantâneo (Gratuito)
                    </button>
                    <button
                      type="button"
                      className={`radio-pill ${formData.method === 'TED' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, method: 'TED' })}
                    >
                      <Landmark size={14} /> TED Tradicional (Mesmo dia)
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
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Saldo disponível: <b>{brl(availableBalance)}</b>
                  </small>
                </label>
              </div>

              <div className="payout-summary-box">
                <div className="payout-summary-row">
                  <span>Valor Solicitado (Bruto)</span>
                  <strong>{brl(parseFloat(formData.amount) || 0)}</strong>
                </div>
                <div className="payout-summary-row">
                  <span>Taxa de Transferência</span>
                  <strong style={{ color: '#10B981' }}>R$ 0,00 (Gratuito)</strong>
                </div>
                <div className="payout-summary-row total">
                  <span>Valor Líquido Creditado</span>
                  <strong>{brl(parseFloat(formData.amount) || 0)}</strong>
                </div>
              </div>

              <div className="utm-modal-actions">
                <button type="button" className="btn secondary" onClick={() => setShowRequestModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn primary">
                  <Banknote size={15} /> Confirmar Repasse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalhes do Repasse */}
      {selectedPayout && (
        <div className="utm-modal-backdrop" onClick={() => setSelectedPayout(null)}>
          <div className="utm-modal-card wide" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">COMPROVANTE DE REPASSE BANCÁRIO</span>
                <h3>Repasse #{selectedPayout.id} — {selectedPayout.event}</h3>
                <p>Informações completas de liquidação, banco creditado e chave PIX.</p>
              </div>
              <button className="icon-action" onClick={() => setSelectedPayout(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="utm-order-detail-grid">
              <div className="utm-order-detail-item">
                <span>Evento de Origem</span>
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
                <span>Previsão / Data Efetiva</span>
                <strong>{selectedPayout.scheduledFor}</strong>
              </div>
              <div className="utm-order-detail-item full">
                <span>Conta Bancária Creditada</span>
                <strong>{selectedPayout.bankAccount}</strong>
              </div>
              <div className="utm-order-detail-item">
                <span>Método de Transferência</span>
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
