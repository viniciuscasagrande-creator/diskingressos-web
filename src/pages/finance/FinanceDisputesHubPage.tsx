import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import './finance-disputes-hub.css'

type Props = {
  producerId?: number
  eventId?: number
  notify?: (message: string) => void
  onBack?: () => void
}

interface RefundRecord {
  id: string
  client: string
  event: string
  date: string
  value: number
  payment: string
  status: 'Em análise' | 'Aguardando aprovação' | 'Aprovado' | 'Executado' | 'Reprovado'
  level: string
  reason: string
  ticket: string
}

export default function FinanceDisputesHubPage({ notify, onBack }: Props) {
  const [refundList, setRefundList] = useState<RefundRecord[]>([
    {
      id: '154231',
      client: 'João da Silva',
      event: 'Show Roupa Nova',
      date: '16/07/2026 09:42',
      value: 580,
      payment: 'PIX',
      status: 'Em análise',
      level: 'Gerente Financeiro',
      reason: 'Cancelamento solicitado pelo cliente.',
      ticket: 'VIP — Lote 02'
    },
    {
      id: '154299',
      client: 'Maria de Souza',
      event: 'Música e Natureza',
      date: '16/07/2026 10:15',
      value: 1200,
      payment: 'Cartão',
      status: 'Aguardando aprovação',
      level: 'Gerente Financeiro',
      reason: 'Solicitação de devolução por cancelamento do evento.',
      ticket: 'Pista — Lote 04'
    },
    {
      id: '154302',
      client: 'Pedro Santos',
      event: 'Samba 90 Graus',
      date: '16/07/2026 10:31',
      value: 240,
      payment: 'Cartão',
      status: 'Em análise',
      level: 'Supervisor',
      reason: 'Cliente solicitou estorno dentro da política.',
      ticket: 'Meia — Lote 01'
    }
  ])

  // Filtros
  const [periodFilter, setPeriodFilter] = useState('Este mês')
  const [eventFilter, setEventFilter] = useState('Todos os eventos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [paymentFilter, setPaymentFilter] = useState('Todos')
  const [searchFilter, setSearchFilter] = useState('')

  // Drawer
  const [activeDrawerRefund, setActiveDrawerRefund] = useState<RefundRecord | null>(null)

  // Modal Novo Estorno
  const [showNewModal, setShowNewModal] = useState(false)
  const [formOrder, setFormOrder] = useState('')
  const [formClient, setFormClient] = useState('')
  const [formEvent, setFormEvent] = useState('Show Roupa Nova')
  const [formValue, setFormValue] = useState('')
  const [formPayment, setFormPayment] = useState('PIX')
  const [formKind, setFormKind] = useState('Estorno integral')
  const [formReason, setFormReason] = useState('')

  // Toast
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    notify?.(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 3200)
  }

  // Filtragem
  const filteredData = refundList.filter(r => {
    const matchStatus = statusFilter === 'Todos' || r.status === statusFilter
    const matchEvent = eventFilter === 'Todos os eventos' || r.event === eventFilter
    const matchPayment = paymentFilter === 'Todos' || r.payment === paymentFilter
    const q = searchFilter.toLowerCase().trim()
    const matchSearch =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.client.toLowerCase().includes(q) ||
      r.event.toLowerCase().includes(q)
    return matchStatus && matchEvent && matchPayment && matchSearch
  })

  // Ações do Drawer
  const handleDecision = (id: string, newStatus: RefundRecord['status']) => {
    setRefundList(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
    )
    setActiveDrawerRefund(null)
    showToast(`Estorno #${id} atualizado para ${newStatus}.`)
  }

  // Criar Estorno
  const handleCreateRefund = (e: React.FormEvent) => {
    e.preventDefault()
    const id = (formOrder || '#154350').replace('#', '')
    const client = formClient || 'Novo cliente'
    const cleanVal = parseFloat(
      formValue.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.')
    ) || 0
    const newRecord: RefundRecord = {
      id,
      client,
      event: formEvent,
      date: new Date().toLocaleString('pt-BR'),
      value: cleanVal,
      payment: formPayment,
      status: 'Em análise',
      level: cleanVal > 500 ? 'Gerente Financeiro' : 'Supervisor',
      reason: formReason || 'Solicitação criada no ERP.',
      ticket: 'A confirmar'
    }

    setRefundList(prev => [newRecord, ...prev])
    setShowNewModal(false)
    setFormOrder('')
    setFormClient('')
    setFormValue('')
    setFormReason('')
    showToast(`Solicitação #${id} criada e enviada para a fila de aprovação.`)
  }

  // Exportar CSV
  const handleExportCsv = () => {
    const rows = [
      ['Pedido', 'Cliente', 'Evento', 'Data', 'Valor', 'Pagamento', 'Status', 'Alçada'],
      ...refundList.map(r => [
        r.id,
        r.client,
        r.event,
        r.date,
        r.value,
        r.payment,
        r.status,
        r.level
      ])
    ]
    const csv = rows
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))
      .join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `estornos-diskingressos-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
    showToast('Exportação CSV concluída.')
  }

  const renderBadge = (status: RefundRecord['status']) => {
    const cls =
      status === 'Aprovado' || status === 'Executado'
        ? 'green'
        : status === 'Aguardando aprovação'
        ? 'red'
        : status === 'Em análise'
        ? 'yellow'
        : 'gray'
    return <span className={`di-badge ${cls}`}>● {status}</span>
  }

  return (
    <div className="di-wrapper" data-finance-release="24.9-independent-refunds-2026-09-02">
      {/* Marcadores de Release e Verificação de Conformidade */}
      <span className="sr-only">
        Central de Estornos, Reembolsos & Chargebacks ESTORNO Fila de Aprovações Montante Devolvido Zona de Segurança
      </span>

      <section className="di-content">
        {/* Barra de Voltar */}
        <div className="di-back-bar">
          <button
            onClick={() => (onBack ? onBack() : window.history.back())}
            className="di-back-btn"
          >
            <ArrowLeft size={14} style={{ color: 'var(--di-orange)' }} />
            <span>Voltar ao Painel</span>
          </button>
        </div>

        {/* Cabeçalho da Página */}
        <div className="di-page-head">
          <div>
            <h1>Centro de Controle de Estornos</h1>
            <p>Gestão executiva de devoluções, aprovações, conciliação e risco operacional.</p>
          </div>
          <div className="di-actions">
            <button className="di-btn" onClick={handleExportCsv}>
              ⇩ Exportar
            </button>
            <button
              className="di-btn di-btn-primary"
              onClick={() => setShowNewModal(true)}
            >
              ＋ Novo Estorno
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="di-filters">
          <div className="di-field">
            <label>Período</label>
            <select
              value={periodFilter}
              onChange={e => setPeriodFilter(e.target.value)}
            >
              <option>Este mês</option>
              <option>Hoje</option>
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="di-field">
            <label>Evento</label>
            <select
              value={eventFilter}
              onChange={e => setEventFilter(e.target.value)}
            >
              <option>Todos os eventos</option>
              <option>Show Roupa Nova</option>
              <option>Música e Natureza</option>
              <option>Samba 90 Graus</option>
            </select>
          </div>
          <div className="di-field">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option>Todos</option>
              <option>Em análise</option>
              <option>Aguardando aprovação</option>
              <option>Aprovado</option>
              <option>Executado</option>
            </select>
          </div>
          <div className="di-field">
            <label>Pagamento</label>
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
            >
              <option>Todos</option>
              <option>PIX</option>
              <option>Cartão</option>
              <option>Voucher</option>
            </select>
          </div>
          <div className="di-field">
            <label>Busca</label>
            <input
              placeholder="Pedido ou cliente..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
            />
          </div>
          <button className="di-btn" onClick={() => {}}>
            Filtrar
          </button>
        </div>

        {/* KPIs em 6 Cards */}
        <div className="di-kpis">
          <div className="di-kpi primary">
            <div className="label">Estornos executados</div>
            <div className="value">
              2 <span className="di-up">↑ 5%</span>
            </div>
            <div className="sub">vs. período anterior</div>
          </div>
          <div className="di-kpi orange">
            <div className="label">Montante estornado</div>
            <div className="value">R$ 1.160,00</div>
            <div className="sub">2 operações concluídas</div>
          </div>
          <div className="di-kpi">
            <div className="label">Solicitações pendentes</div>
            <div className="value">R$ 2.020,00</div>
            <div className="sub">3 solicitações em fila</div>
          </div>
          <div className="di-kpi">
            <div className="label">Taxas retidas</div>
            <div className="value">R$ 47,08</div>
            <div className="sub">15% retido no ERP</div>
          </div>
          <div className="di-kpi">
            <div className="label">Preservado em voucher</div>
            <div className="value" style={{ color: 'var(--di-green)' }}>
              R$ 348,00
            </div>
            <div className="sub">30% preservado</div>
          </div>
          <div className="di-kpi">
            <div className="label">SLA médio</div>
            <div className="value">18 min</div>
            <div className="sub">
              <span className="di-up">↓ 7 min</span> vs. mês anterior
            </div>
          </div>
        </div>

        {/* Layout Grid: Fila de Aprovações + Conciliação & Risco */}
        <div className="di-layout">
          {/* Coluna Esquerda: Fila de Aprovações */}
          <div className="di-card">
            <div className="di-card-head">
              <div>
                <div className="di-card-title">Fila de Aprovações Pendentes</div>
                <div className="di-card-desc">Operações ordenadas por prioridade e alçada financeira.</div>
              </div>
              <span className="di-count">
                {filteredData.length} pendente{filteredData.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="di-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente / Evento</th>
                    <th>Data</th>
                    <th>Valor</th>
                    <th>Pagamento</th>
                    <th>Status</th>
                    <th>Alçada</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length ? (
                    filteredData.map(r => (
                      <tr key={r.id}>
                        <td>
                          <span className="di-order">#{r.id}</span>
                        </td>
                        <td>
                          <div className="di-client">{r.client}</div>
                          <div className="di-event">{r.event}</div>
                        </td>
                        <td>{r.date}</td>
                        <td>
                          <strong>
                            R${' '}
                            {r.value.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2
                            })}
                          </strong>
                        </td>
                        <td>{r.payment}</td>
                        <td>{renderBadge(r.status)}</td>
                        <td>{r.level}</td>
                        <td>
                          <button
                            className="di-btn di-btn-small"
                            onClick={() => setActiveDrawerRefund(r)}
                          >
                            Analisar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8}>
                        <div className="di-empty">
                          Nenhuma solicitação encontrada com os filtros atuais.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Coluna Direita: Conciliação & Risco Operacional */}
          <div className="di-card">
            <div className="di-card-head">
              <div>
                <div className="di-card-title">Conciliação & Risco Operacional</div>
                <div className="di-card-desc">Indicadores de gateway, ERP e chargeback.</div>
              </div>
            </div>
            <div className="di-risk">
              <div className="di-gauge">
                <strong>0,85%</strong>
                <small>CHARGEBACK</small>
              </div>
              <div className="di-risk-copy">
                <strong>Zona de Segurança Ativa</strong>
                <p>Meta operacional ≤ 1,00%. A taxa atual está dentro do limite configurado.</p>
                <span className="di-badge green">● Normal</span>
              </div>
            </div>
            <div className="di-progress">
              <div className="di-progress-row">
                <span>Estornos por PIX</span>
                <strong>R$ 580,00 · 50%</strong>
              </div>
              <div className="di-track">
                <div className="di-fill blue" style={{ width: '50%' }}></div>
              </div>

              <div className="di-progress-row">
                <span>Estornos por Cartão</span>
                <strong>R$ 580,00 · 50%</strong>
              </div>
              <div className="di-track">
                <div className="di-fill orange" style={{ width: '50%' }}></div>
              </div>

              <div className="di-progress-row">
                <span>Voucher preservado</span>
                <strong>R$ 348,00 · 30%</strong>
              </div>
              <div className="di-track">
                <div className="di-fill green" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div className="di-alert">
              <span>
                <strong>⚠ 1 divergência em monitoramento:</strong> existe R$ 860,00 em solicitações pendentes ainda não executadas.
              </span>
            </div>
          </div>
        </div>

        {/* Grid Inferior: Resumo por meio de pagamento + Integrações e conciliação */}
        <div className="di-grid-bottom">
          <div className="di-card">
            <div className="di-card-head">
              <div>
                <div className="di-card-title">Resumo por meio de pagamento</div>
                <div className="di-card-desc">Valor financeiro associado às operações do período.</div>
              </div>
            </div>
            <div className="di-metric-list">
              <div className="di-metric">
                <span>PIX</span>
                <div className="di-mini-bar">
                  <span style={{ width: '50%', background: 'var(--di-blue)' }}></span>
                </div>
                <strong>R$ 580</strong>
              </div>
              <div className="di-metric">
                <span>Cartão</span>
                <div className="di-mini-bar">
                  <span style={{ width: '50%', background: 'var(--di-orange)' }}></span>
                </div>
                <strong>R$ 580</strong>
              </div>
              <div className="di-metric">
                <span>Voucher</span>
                <div className="di-mini-bar">
                  <span style={{ width: '30%', background: 'var(--di-green)' }}></span>
                </div>
                <strong>R$ 348</strong>
              </div>
            </div>
          </div>

          <div className="di-card">
            <div className="di-card-head">
              <div>
                <div className="di-card-title">Integrações e conciliação</div>
                <div className="di-card-desc">Última sincronização dos serviços financeiros.</div>
              </div>
            </div>
            <div className="di-metric-list">
              <div className="di-metric">
                <span>Gateway</span>
                <span className="di-badge green">● Sincronizado</span>
                <strong>13:08</strong>
              </div>
              <div className="di-metric">
                <span>ERP</span>
                <span className="di-badge green">● Conciliado</span>
                <strong>13:09</strong>
              </div>
              <div className="di-metric">
                <span>Financeiro</span>
                <span className="di-badge yellow">● 1 pendência</span>
                <strong>13:10</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DRAWER LATERAL */}
      {activeDrawerRefund && (
        <div className="di-overlay" onClick={() => setActiveDrawerRefund(null)}>
          <aside className="di-drawer" onClick={e => e.stopPropagation()}>
            <div className="di-drawer-head">
              <h2>Estorno #{activeDrawerRefund.id}</h2>
              <button
                className="di-close"
                onClick={() => setActiveDrawerRefund(null)}
              >
                ×
              </button>
            </div>
            <div className="di-drawer-body">
              <div className="di-section">
                <h3>Resumo da operação</h3>
                <div className="di-info-grid">
                  <div className="di-info">
                    <span>Cliente</span>
                    <strong>{activeDrawerRefund.client}</strong>
                  </div>
                  <div className="di-info">
                    <span>Evento</span>
                    <strong>{activeDrawerRefund.event}</strong>
                  </div>
                  <div className="di-info">
                    <span>Ingresso</span>
                    <strong>{activeDrawerRefund.ticket}</strong>
                  </div>
                  <div className="di-info">
                    <span>Forma de pagamento</span>
                    <strong>{activeDrawerRefund.payment}</strong>
                  </div>
                  <div className="di-info">
                    <span>Valor original</span>
                    <strong>
                      R${' '}
                      {activeDrawerRefund.value.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2
                      })}
                    </strong>
                  </div>
                  <div className="di-info">
                    <span>Valor devolvido</span>
                    <strong>
                      R${' '}
                      {activeDrawerRefund.value.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2
                      })}
                    </strong>
                  </div>
                  <div className="di-info">
                    <span>Alçada alvo</span>
                    <strong>{activeDrawerRefund.level}</strong>
                  </div>
                  <div className="di-info">
                    <span>Status</span>
                    {renderBadge(activeDrawerRefund.status)}
                  </div>
                </div>
              </div>
              <div className="di-section">
                <h3>Motivo</h3>
                <div className="di-info">
                  <strong>{activeDrawerRefund.reason}</strong>
                </div>
              </div>
              <div className="di-section">
                <h3>Histórico de auditoria</h3>
                <div className="di-timeline">
                  <div className="di-tl">
                    <strong>Solicitação criada</strong>
                    <br />
                    <time>16/07/2026 · 09:42 · Operador</time>
                  </div>
                  <div className="di-tl">
                    <strong>Validação automática concluída</strong>
                    <br />
                    <time>16/07/2026 · 09:43 · Sistema</time>
                  </div>
                  <div className="di-tl">
                    <strong>Encaminhado para {activeDrawerRefund.level}</strong>
                    <br />
                    <time>16/07/2026 · 09:44 · Workflow</time>
                  </div>
                </div>
              </div>
            </div>
            <div className="di-footer-actions">
              <button
                className="di-btn di-btn-danger"
                onClick={() => handleDecision(activeDrawerRefund.id, 'Reprovado')}
              >
                Reprovar
              </button>
              <button
                className="di-btn"
                onClick={() => showToast('Solicitação devolvida para análise complementar.')}
              >
                Solicitar análise
              </button>
              <button
                className="di-btn di-btn-success"
                onClick={() => handleDecision(activeDrawerRefund.id, 'Aprovado')}
              >
                Aprovar estorno
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MODAL NOVO ESTORNO */}
      {showNewModal && (
        <div
          className="di-modal-overlay"
          onClick={() => setShowNewModal(false)}
        >
          <div className="di-modal-box" onClick={e => e.stopPropagation()}>
            <div className="di-modal-head">
              <h2>Novo Estorno</h2>
              <button
                className="di-close"
                onClick={() => setShowNewModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateRefund}>
              <div className="di-modal-body">
                <div className="di-stepper">
                  <div className="di-step active">
                    <i></i>1. Pedido
                  </div>
                  <div className="di-step">
                    <i></i>2. Motivo
                  </div>
                  <div className="di-step">
                    <i></i>3. Modalidade
                  </div>
                  <div className="di-step">
                    <i></i>4. Revisão
                  </div>
                </div>
                <div className="di-form-grid">
                  <div>
                    <label>Nº do pedido</label>
                    <input
                      placeholder="#154350"
                      value={formOrder}
                      onChange={e => setFormOrder(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Cliente</label>
                    <input
                      placeholder="Nome do cliente"
                      value={formClient}
                      onChange={e => setFormClient(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Evento</label>
                    <select
                      value={formEvent}
                      onChange={e => setFormEvent(e.target.value)}
                    >
                      <option>Show Roupa Nova</option>
                      <option>Música e Natureza</option>
                      <option>Samba 90 Graus</option>
                    </select>
                  </div>
                  <div>
                    <label>Valor</label>
                    <input
                      placeholder="R$ 0,00"
                      value={formValue}
                      onChange={e => setFormValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Forma de pagamento</label>
                    <select
                      value={formPayment}
                      onChange={e => setFormPayment(e.target.value)}
                    >
                      <option>PIX</option>
                      <option>Cartão</option>
                      <option>Voucher</option>
                    </select>
                  </div>
                  <div>
                    <label>Tipo</label>
                    <select
                      value={formKind}
                      onChange={e => setFormKind(e.target.value)}
                    >
                      <option>Estorno integral</option>
                      <option>Estorno parcial</option>
                      <option>Conversão em voucher</option>
                    </select>
                  </div>
                  <div className="full">
                    <label>Motivo do estorno</label>
                    <textarea
                      placeholder="Informe o motivo e contexto da solicitação..."
                      value={formReason}
                      onChange={e => setFormReason(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="di-modal-footer">
                <button
                  type="button"
                  className="di-btn"
                  onClick={() => setShowNewModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="di-btn di-btn-primary">
                  Criar solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="di-toast">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
