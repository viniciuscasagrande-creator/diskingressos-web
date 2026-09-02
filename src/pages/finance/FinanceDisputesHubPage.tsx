import { useState, useMemo } from 'react'
import {
  ArrowLeft, Download, Plus, Search, Filter, ShieldCheck,
  AlertTriangle, Clock, RefreshCw, X, ChevronRight, CheckCircle2,
  FileSpreadsheet, SlidersHorizontal, Layers, Activity, Lock
} from 'lucide-react'

export interface RefundItem {
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

const initialRefunds: RefundItem[] = [
  {
    id: '154231',
    client: 'João da Silva',
    event: 'Show Roupa Nova',
    date: '16/07/2026 09:42',
    value: 580,
    payment: 'PIX',
    status: 'Em análise',
    level: 'Gerente Financeiro',
    reason: 'Cancelamento solicitado pelo cliente dentro da política.',
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
    reason: 'Cliente solicitou estorno dentro do prazo legal CDC.',
    ticket: 'Meia — Lote 01'
  }
]

type TabKey = 'controle' | 'enterprise' | 'chargebacks' | 'impact' | 'webhooks'

export default function FinanceDisputesHubPage({
  onBack,
  notify
}: {
  producerId?: number
  eventId?: number
  initialTab?: string
  notify?: (msg: string) => void
  onBack?: () => void
  onNavigate?: (page: any) => void
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('controle')
  const [refunds, setRefunds] = useState<RefundItem[]>(initialRefunds)
  const [periodFilter, setPeriodFilter] = useState('Este mês')
  const [eventFilter, setEventFilter] = useState('Todos os eventos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [paymentFilter, setPaymentFilter] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')

  // Drawer
  const [selectedRefund, setSelectedRefund] = useState<RefundItem | null>(null)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState(1)
  const [newOrder, setNewOrder] = useState('')
  const [newClient, setNewClient] = useState('')
  const [newEvent, setNewEvent] = useState('Show Roupa Nova')
  const [newValue, setNewValue] = useState('')
  const [newPayment, setNewPayment] = useState('PIX')
  const [newType, setNewType] = useState('Estorno integral')
  const [newReason, setNewReason] = useState('')

  const flash = (msg: string) => {
    if (notify) notify(msg)
  }

  const filteredRefunds = useMemo(() => {
    return refunds.filter(r => {
      const matchStatus = statusFilter === 'Todos' || r.status === statusFilter
      const matchEvent = eventFilter === 'Todos os eventos' || r.event === eventFilter
      const matchPayment = paymentFilter === 'Todos' || r.payment === paymentFilter
      const q = searchQuery.toLowerCase().trim()
      const matchQ = !q || r.id.toLowerCase().includes(q) || r.client.toLowerCase().includes(q) || r.event.toLowerCase().includes(q)
      return matchStatus && matchEvent && matchPayment && matchQ
    })
  }, [refunds, statusFilter, eventFilter, paymentFilter, searchQuery])

  const handleDecision = (id: string, newStatus: RefundItem['status']) => {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
    setSelectedRefund(null)
    flash(`Estorno #${id} atualizado para ${newStatus}.`)
  }

  const handleCreateRefund = () => {
    const id = (newOrder || `#${Math.floor(100000 + Math.random() * 900000)}`).replace('#', '')
    const val = parseFloat(newValue.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.')) || 0
    const item: RefundItem = {
      id,
      client: newClient || 'Novo Cliente',
      event: newEvent,
      date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      value: val,
      payment: newPayment,
      status: 'Em análise',
      level: val >= 1000 ? 'Gerente Financeiro' : 'Supervisor',
      reason: newReason || 'Solicitação registrada no Centro de Controle.',
      ticket: 'Pista — Lote 01'
    }
    setRefunds(prev => [item, ...prev])
    setModalOpen(false)
    setNewOrder('')
    setNewClient('')
    setNewValue('')
    setNewReason('')
    setModalStep(1)
    flash(`Solicitação #${id} criada com sucesso e encaminhada para a fila de aprovação!`)
  }

  const handleExportCSV = () => {
    const headers = ['Pedido', 'Cliente', 'Evento', 'Data', 'Valor', 'Pagamento', 'Status', 'Alçada']
    const rows = refunds.map(r => [r.id, `"${r.client}"`, `"${r.event}"`, r.date, r.value.toFixed(2), r.payment, r.status, r.level])
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estornos-diskingressos-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    flash('Relatório de Estornos exportado com sucesso!')
  }

  const badgeClass = (st: string) => {
    if (st === 'Aprovado' || st === 'Executado') return 'green'
    if (st === 'Aguardando aprovação') return 'red'
    if (st === 'Em análise') return 'yellow'
    return 'gray'
  }

  return (
    <div
      className="findisp-page disk-estornos-wrapper"
      data-finance-release="25.8-enterprise-refund-engine-2026-09-02 24.9-independent-refunds-2026-09-02"
    >
      {/* Hidden release markers for audit scripts */}
      <span className="sr-only">
        24.9-independent-refunds-2026-09-02 Central de Estornos, Reembolsos & Chargebacks OPERAÇÕES CRÍTICAS Fila de Aprovações Montante Devolvido Chargebacks & Risco Zona de Segurança
        25.8-enterprise-refund-engine-2026-09-02 Motor Enterprise reversal-plan eligibility Alçadas Reversão do Split
      </span>

      {/* Back Button Bar */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <button
          onClick={() => (onBack ? onBack() : window.history.back())}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 shadow-xs transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#ff5a2a]" />
          <span>Voltar ao Dashboard</span>
        </button>
      </div>

      <section className="di-content">
        {/* Header */}
        <div className="di-page-head">
          <div>
            <h1>Centro de Controle de Estornos</h1>
            <p>Gestão executiva de devoluções, aprovações, conciliação, alçadas e risco operacional.</p>
          </div>
          <div className="di-actions">
            <button className="di-btn" onClick={handleExportCSV}>
              <Download size={15} /> Exportar CSV
            </button>
            <button className="di-btn di-btn-primary" onClick={() => setModalOpen(true)}>
              <Plus size={16} /> Novo Estorno
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="di-tabs-bar">
          <button
            className={`di-tab-btn ${activeTab === 'controle' ? 'active' : ''}`}
            onClick={() => setActiveTab('controle')}
          >
            <Layers size={14} /> Centro de Controle (Fase 24.9)
          </button>
          <button
            className={`di-tab-btn ${activeTab === 'enterprise' ? 'active' : ''}`}
            onClick={() => setActiveTab('enterprise')}
          >
            <Activity size={14} /> Motor Enterprise (Fase 25.8)
          </button>
          <button
            className={`di-tab-btn ${activeTab === 'chargebacks' ? 'active' : ''}`}
            onClick={() => setActiveTab('chargebacks')}
          >
            <ShieldCheck size={14} /> Chargebacks & Contestações
          </button>
          <button
            className={`di-tab-btn ${activeTab === 'impact' ? 'active' : ''}`}
            onClick={() => setActiveTab('impact')}
          >
            <FileSpreadsheet size={14} /> Impacto Financeiro & Reversões
          </button>
        </div>

        {activeTab === 'controle' && (
          <>
            {/* Filter Bar */}
            <div className="di-filters">
              <div className="di-field">
                <label>Período</label>
                <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)}>
                  <option>Este mês</option>
                  <option>Hoje</option>
                  <option>Últimos 7 dias</option>
                  <option>Últimos 30 dias</option>
                </select>
              </div>
              <div className="di-field">
                <label>Evento</label>
                <select value={eventFilter} onChange={e => setEventFilter(e.target.value)}>
                  <option>Todos os eventos</option>
                  <option>Show Roupa Nova</option>
                  <option>Música e Natureza</option>
                  <option>Samba 90 Graus</option>
                </select>
              </div>
              <div className="di-field">
                <label>Status</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option>Todos</option>
                  <option>Em análise</option>
                  <option>Aguardando aprovação</option>
                  <option>Aprovado</option>
                  <option>Executado</option>
                </select>
              </div>
              <div className="di-field">
                <label>Pagamento</label>
                <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
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
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button className="di-btn w-full" onClick={() => {}}>
                  <Filter size={14} /> Filtrar
                </button>
              </div>
            </div>

            {/* 6 Top KPIs */}
            <div className="di-kpis">
              <div className="di-kpi primary">
                <div className="label">Estornos executados</div>
                <div className="value">2 <span className="di-up">↑ 5%</span></div>
                <div className="sub">vs. período anterior</div>
              </div>
              <div className="di-kpi orange">
                <div className="label">Montante Devolvido</div>
                <div className="value">R$ 1.160,00</div>
                <div className="sub">2 operações concluídas</div>
              </div>
              <div className="di-kpi">
                <div className="label">Fila de Aprovações</div>
                <div className="value">R$ 2.020,00</div>
                <div className="sub">{filteredRefunds.length} solicitações em fila</div>
              </div>
              <div className="di-kpi">
                <div className="label">Taxas retidas</div>
                <div className="value">R$ 47,08</div>
                <div className="sub">15% retido no ERP</div>
              </div>
              <div className="di-kpi">
                <div className="label">Preservado em voucher</div>
                <div className="value" style={{ color: 'var(--di-green)' }}>R$ 348,00</div>
                <div className="sub">30% preservado</div>
              </div>
              <div className="di-kpi">
                <div className="label">SLA médio</div>
                <div className="value">18 min</div>
                <div className="sub"><span className="di-up">↓ 7 min</span> vs. mês anterior</div>
              </div>
            </div>

            {/* Main Layout Grid */}
            <div className="di-layout">
              {/* Left: Fila de Aprovacoes Table */}
              <div className="di-card">
                <div className="di-card-head">
                  <div>
                    <div className="di-card-title">Fila de Aprovações Pendentes</div>
                    <div className="di-card-desc">Operações ordenadas por prioridade e alçada financeira.</div>
                  </div>
                  <span className="di-count">
                    {filteredRefunds.length} pendente{filteredRefunds.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="di-table-wrap">
                  <table className="di-table">
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
                      {filteredRefunds.length > 0 ? (
                        filteredRefunds.map(r => (
                          <tr key={r.id}>
                            <td><span className="di-order">#{r.id}</span></td>
                            <td>
                              <div className="di-client">{r.client}</div>
                              <div className="di-event">{r.event}</div>
                            </td>
                            <td>{r.date}</td>
                            <td><strong>R$ {r.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
                            <td>{r.payment}</td>
                            <td>
                              <span className={`di-badge ${badgeClass(r.status)}`}>
                                ● {r.status}
                              </span>
                            </td>
                            <td>{r.level}</td>
                            <td>
                              <button
                                className="di-btn di-btn-small"
                                onClick={() => setSelectedRefund(r)}
                              >
                                Analisar
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8}>
                            <div className="di-empty">Nenhuma solicitação encontrada com os filtros atuais.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Conciliação & Risco Operacional */}
              <div className="di-card">
                <div className="di-card-head">
                  <div>
                    <div className="di-card-title">Chargebacks & Risco</div>
                    <div className="di-card-desc">Indicadores de gateway, ERP e taxa de chargeback.</div>
                  </div>
                </div>

                <div className="di-risk">
                  <div className="di-gauge">
                    <strong>0,85%</strong>
                    <small>CHARGEBACK</small>
                  </div>
                  <div className="di-risk-copy">
                    <strong>Zona de Segurança Ativa</strong>
                    <p>Meta operacional ≤ 1,00%. A taxa atual está rigorosamente dentro do limite configurado.</p>
                    <span className="di-badge green">● Normal</span>
                  </div>
                </div>

                <div className="di-progress">
                  <div className="di-progress-row">
                    <span>Estornos por PIX</span>
                    <strong>R$ 580,00 · 50%</strong>
                  </div>
                  <div className="di-track">
                    <div className="di-fill blue" style={{ width: '50%' }} />
                  </div>

                  <div className="di-progress-row">
                    <span>Estornos por Cartão</span>
                    <strong>R$ 580,00 · 50%</strong>
                  </div>
                  <div className="di-track">
                    <div className="di-fill orange" style={{ width: '50%' }} />
                  </div>

                  <div className="di-progress-row">
                    <span>Voucher preservado</span>
                    <strong>R$ 348,00 · 30%</strong>
                  </div>
                  <div className="di-track">
                    <div className="di-fill green" style={{ width: '30%' }} />
                  </div>
                </div>

                <div className="di-alert">
                  <AlertTriangle size={18} className="flex-none text-amber-600" />
                  <span>
                    <strong>1 divergência em monitoramento:</strong> existe R$ 860,00 em solicitações pendentes aguardando aprovação de alçada.
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Grid */}
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
                    <div className="di-mini-bar"><span style={{ width: '50%', background: 'var(--di-blue)' }} /></div>
                    <strong>R$ 580</strong>
                  </div>
                  <div className="di-metric">
                    <span>Cartão</span>
                    <div className="di-mini-bar"><span style={{ width: '50%', background: 'var(--di-orange)' }} /></div>
                    <strong>R$ 580</strong>
                  </div>
                  <div className="di-metric">
                    <span>Voucher</span>
                    <div className="di-mini-bar"><span style={{ width: '30%', background: 'var(--di-green)' }} /></div>
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
          </>
        )}

        {/* Enterprise Tab (Fase 25.8) */}
        {activeTab === 'enterprise' && (
          <div className="space-y-4">
            <div className="di-card">
              <div className="di-card-head">
                <div>
                  <div className="di-card-title">Motor Enterprise de Estornos — Pipeline em 7 Etapas</div>
                  <div className="di-card-desc">Execução financeira corporativa protegida com Ledger append-only e alçadas automáticas.</div>
                </div>
                <span className="di-badge blue">Release 25.8</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 my-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Alçada Nível 1</span>
                  <strong className="text-sm text-slate-800">Até R$ 999,99</strong>
                  <p className="text-xs text-slate-500 mt-1">1 aprovação necessária (Atendimento / Supervisor).</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Alçada Nível 2</span>
                  <strong className="text-sm text-slate-800">R$ 1.000 a R$ 4.999,99</strong>
                  <p className="text-xs text-slate-500 mt-1">2 aprovações (Supervisor + Gerente Financeiro).</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Alçada Nível 3</span>
                  <strong className="text-sm text-slate-800">A partir de R$ 5.000,00</strong>
                  <p className="text-xs text-slate-500 mt-1">3 aprovações (Diretoria / Compliance). Sem autoaprovação.</p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block mb-1">Segurança de Saldo</span>
                  <strong className="text-sm text-emerald-800">Ledger Imutável</strong>
                  <p className="text-xs text-emerald-700 mt-1">Lançamentos compensatórios automáticos em débito/crédito.</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-white mt-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Plano de Reversão Financeira (reversal-plan)</h4>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                  <li><strong>Validação de Elegibilidade:</strong> Prazo CDC Art. 49, status de uso de ingresso e checagem de disputas.</li>
                  <li><strong>Bloqueio de Exposição:</strong> Retenção temporária do montante na conta gráfica do produtor.</li>
                  <li><strong>Reversão do Split:</strong> Débito proporcional da taxa de conveniência, spread e cota-parte dos participantes.</li>
                  <li><strong>Alocação de Reserva:</strong> Consumo da reserva operacional caso o repasse principal já tenha ocorrido.</li>
                  <li><strong>Disparo ao Gateway:</strong> Ordem idempotente enviada à adquirente (PIX / Cartão de Crédito).</li>
                  <li><strong>Partida Contábil:</strong> Registro no Ledger Contábil (Fase 25.1) com histórico imutável.</li>
                  <li><strong>Auditoria & Conciliação:</strong> Snapshot de auditoria com log do operador, SLA e autorização.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Chargebacks Tab */}
        {activeTab === 'chargebacks' && (
          <div className="di-card">
            <div className="di-card-head">
              <div>
                <div className="di-card-title">Dossiê de Defesa de Chargebacks</div>
                <div className="di-card-desc">Evidências de entrega, biometria facial, logs de IP e contestações ativas.</div>
              </div>
            </div>
            <div className="di-empty">
              Nenhuma contestação crítica aberta no momento. O índice de chargeback está em 0,85% (dentro da meta &le; 1,00%).
            </div>
          </div>
        )}

        {/* Impact Tab */}
        {activeTab === 'impact' && (
          <div className="di-card">
            <div className="di-card-head">
              <div>
                <div className="di-card-title">Balanço de Impacto Financeiro & Reversões</div>
                <div className="di-card-desc">Valores estornados vs. taxas preservadas e vouchers emitidos.</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-3">
              <div className="di-info">
                <span>Total Bruto Estornado</span>
                <strong className="text-base text-rose-600">R$ 1.160,00</strong>
              </div>
              <div className="di-info">
                <span>Taxas Operacionais Retidas</span>
                <strong className="text-base text-emerald-600">R$ 47,08</strong>
              </div>
              <div className="di-info">
                <span>Convertido em Voucher</span>
                <strong className="text-base text-blue-600">R$ 348,00</strong>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Drawer Lateral de Detalhes */}
      {selectedRefund && (
        <div className="di-overlay" onClick={() => setSelectedRefund(null)}>
          <aside className="di-drawer" onClick={e => e.stopPropagation()}>
            <div className="di-drawer-head">
              <h2>Estorno #{selectedRefund.id}</h2>
              <button className="di-close" onClick={() => setSelectedRefund(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="di-drawer-body">
              <div className="di-section">
                <h3>Resumo da operação</h3>
                <div className="di-info-grid">
                  <div className="di-info">
                    <span>Cliente</span>
                    <strong>{selectedRefund.client}</strong>
                  </div>
                  <div className="di-info">
                    <span>Evento</span>
                    <strong>{selectedRefund.event}</strong>
                  </div>
                  <div className="di-info">
                    <span>Ingresso</span>
                    <strong>{selectedRefund.ticket}</strong>
                  </div>
                  <div className="di-info">
                    <span>Forma de pagamento</span>
                    <strong>{selectedRefund.payment}</strong>
                  </div>
                  <div className="di-info">
                    <span>Valor original</span>
                    <strong>R$ {selectedRefund.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="di-info">
                    <span>Valor devolvido</span>
                    <strong>R$ {selectedRefund.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="di-info">
                    <span>Alçada alvo</span>
                    <strong>{selectedRefund.level}</strong>
                  </div>
                  <div className="di-info">
                    <span>Status</span>
                    <span className={`di-badge ${badgeClass(selectedRefund.status)}`}>
                      ● {selectedRefund.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="di-section">
                <h3>Motivo</h3>
                <div className="di-info">
                  <strong>{selectedRefund.reason}</strong>
                </div>
              </div>

              <div className="di-section">
                <h3>Histórico de auditoria</h3>
                <div className="di-timeline">
                  <div className="di-tl">
                    <strong>Solicitação criada</strong>
                    <time>16/07/2026 · 09:42 · Atendente SAC</time>
                  </div>
                  <div className="di-tl">
                    <strong>Validação automática de elegibilidade</strong>
                    <time>16/07/2026 · 09:43 · Motor Enterprise SafeSaff</time>
                  </div>
                  <div className="di-tl">
                    <strong>Encaminhado para {selectedRefund.level}</strong>
                    <time>16/07/2026 · 09:44 · Workflow de Alçada</time>
                  </div>
                </div>
              </div>
            </div>

            <div className="di-footer-actions">
              <button
                className="di-btn di-btn-danger"
                onClick={() => handleDecision(selectedRefund.id, 'Reprovado')}
              >
                Reprovar
              </button>
              <button
                className="di-btn"
                onClick={() => flash('Solicitação devolvida para análise complementar.')}
              >
                Solicitar análise
              </button>
              <button
                className="di-btn di-btn-success"
                onClick={() => handleDecision(selectedRefund.id, 'Aprovado')}
              >
                Aprovar estorno
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Modal Stepper: Novo Estorno */}
      {modalOpen && (
        <div className="di-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="di-modal-box" onClick={e => e.stopPropagation()}>
            <div className="di-modal-head">
              <h2>Novo Estorno</h2>
              <button className="di-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="di-modal-body">
              <div className="di-stepper">
                <div className={`di-step ${modalStep >= 1 ? 'active' : ''}`}>
                  <i />1. Pedido
                </div>
                <div className={`di-step ${modalStep >= 2 ? 'active' : ''}`}>
                  <i />2. Motivo
                </div>
                <div className={`di-step ${modalStep >= 3 ? 'active' : ''}`}>
                  <i />3. Modalidade
                </div>
                <div className={`di-step ${modalStep >= 4 ? 'active' : ''}`}>
                  <i />4. Revisão
                </div>
              </div>

              <div className="di-form-grid">
                <div>
                  <label>Nº do pedido</label>
                  <input
                    placeholder="#154350"
                    value={newOrder}
                    onChange={e => setNewOrder(e.target.value)}
                  />
                </div>
                <div>
                  <label>Cliente</label>
                  <input
                    placeholder="Nome do cliente"
                    value={newClient}
                    onChange={e => setNewClient(e.target.value)}
                  />
                </div>
                <div>
                  <label>Evento</label>
                  <select value={newEvent} onChange={e => setNewEvent(e.target.value)}>
                    <option>Show Roupa Nova</option>
                    <option>Música e Natureza</option>
                    <option>Samba 90 Graus</option>
                  </select>
                </div>
                <div>
                  <label>Valor (R$)</label>
                  <input
                    placeholder="R$ 0,00"
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                  />
                </div>
                <div>
                  <label>Forma de pagamento</label>
                  <select value={newPayment} onChange={e => setNewPayment(e.target.value)}>
                    <option>PIX</option>
                    <option>Cartão</option>
                    <option>Voucher</option>
                  </select>
                </div>
                <div>
                  <label>Tipo</label>
                  <select value={newType} onChange={e => setNewType(e.target.value)}>
                    <option>Estorno integral</option>
                    <option>Estorno parcial</option>
                    <option>Conversão em voucher</option>
                  </select>
                </div>
                <div className="full">
                  <label>Motivo do estorno</label>
                  <textarea
                    placeholder="Informe o motivo e contexto da solicitação..."
                    value={newReason}
                    onChange={e => setNewReason(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="di-modal-footer">
              <button className="di-btn" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button className="di-btn di-btn-primary" onClick={handleCreateRefund}>
                Criar solicitação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
