import { useEffect, useState } from 'react'
import {
  WalletCards,
  Landmark,
  ReceiptText,
  ShieldCheck,
  Undo2,
  BookOpenCheck,
  RefreshCw,
  CheckCircle2,
  Clock,
  Plus,
  SlidersHorizontal,
  AlertCircle,
  Percent,
  Zap,
  Building2,
  X,
  Scale,
  ArrowRight,
} from 'lucide-react'
import {
  getInternalAccountDashboard,
  updateInternalAccountPolicy,
  createInternalRetention,
  createInternalRelease,
  createInternalObligation,
  updateInternalObligationStatus,
  createInternalCredit,
  amortizeInternalCredit,
  recordInternalRevenue,
  createInternalRefund,
  authorizeInternalRefund,
  executeInternalRefund,
  rejectInternalRefund,
  requestEventPayout,
  type InternalAccountDashboardData,
  type InternalAccountEvent,
  type InternalAccountObligation,
  type InternalAccountCredit,
  type InternalAccountRefund,
} from '../../services/financeInternalAccountApi'
import './finance-internal-account.css'

type TabKey = 'conta' | 'retencoes' | 'obrigacoes' | 'creditos' | 'estornos' | 'ledger' | 'politica'

const formatBrl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

const formatPct = (v: number) => `${Number(v || 0).toFixed(1).replace('.', ',')}%`

const formatDate = (iso: string) => {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export default function FinanceInternalAccountModule() {
  const [data, setData] = useState<InternalAccountDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('conta')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Modais
  const [payoutModalEvent, setPayoutModalEvent] = useState<InternalAccountEvent | null>(null)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutException, setPayoutException] = useState(false)

  const [amortizeCredit, setAmortizeCredit] = useState<InternalAccountCredit | null>(null)
  const [amortizeValue, setAmortizeValue] = useState('')

  const [revenueModalOpen, setRevenueModalOpen] = useState(false)
  const [revenueEventId, setRevenueEventId] = useState('')
  const [revenueValue, setRevenueValue] = useState('')

  const [authorizeRefundItem, setAuthorizeRefundItem] = useState<InternalAccountRefund | null>(null)
  const [operatorName, setOperatorName] = useState('')

  // Formulários
  const [retentionForm, setRetentionForm] = useState({
    eventId: '',
    type: 'RETENCAO' as 'RETENCAO' | 'BLOQUEIO',
    value: '',
    reason: '',
    beneficiary: '',
  })

  const [releaseForm, setReleaseForm] = useState({
    eventId: '',
    value: '',
    reason: '',
  })

  const [obligationForm, setObligationForm] = useState({
    eventId: '',
    category: 'ALUGUEL_ESPACO',
    description: '',
    beneficiary: '',
    value: '',
    dueDate: '',
    reserveNow: true,
  })

  const [creditForm, setCreditForm] = useState({
    eventId: '',
    principal: '',
    interestRate: '2.0',
    installments: '5',
    amortization: 'PERCENTUAL_RECEBIVEIS' as 'PERCENTUAL_RECEBIVEIS' | 'PARCELAS_FIXAS' | 'FECHAMENTO_EVENTO',
    receivablePercent: '15',
  })

  const [refundForm, setRefundForm] = useState({
    eventId: '',
    orderId: '',
    value: '',
    reason: '',
  })

  const [policyForm, setPolicyForm] = useState({
    minimumSalesPercent: 50,
    releasePercent: 20,
    requireApproval: true,
    requireSignature: true,
    refundDualAuthorization: true,
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await getInternalAccountDashboard()
      setData(res)
      if (res.policy) {
        setPolicyForm(res.policy)
      }
      if (res.events && res.events.length > 0) {
        const firstId = res.events[0].id
        setRetentionForm((prev) => ({ ...prev, eventId: prev.eventId || firstId }))
        setReleaseForm((prev) => ({ ...prev, eventId: prev.eventId || firstId }))
        setObligationForm((prev) => ({ ...prev, eventId: prev.eventId || firstId }))
        setCreditForm((prev) => ({ ...prev, eventId: prev.eventId || firstId }))
        setRefundForm((prev) => ({ ...prev, eventId: prev.eventId || firstId }))
        setRevenueEventId((prev) => prev || firstId)
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao carregar dados da conta interna.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const showSuccess = (msg: string) => {
    setFeedback({ type: 'success', message: msg })
    loadData()
  }

  const showError = (msg: string) => {
    setFeedback({ type: 'error', message: msg })
  }

  // --- Handlers de Ações ---

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateInternalAccountPolicy(policyForm)
      showSuccess('Política de repasse e parâmetros operacionais atualizados com sucesso.')
    } catch (err: any) {
      showError(err.message)
    }
  }

  const handleCreateRetention = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!retentionForm.eventId || !retentionForm.value || !retentionForm.reason) {
      showError('Preencha todos os campos obrigatórios.')
      return
    }
    try {
      await createInternalRetention({
        eventId: retentionForm.eventId,
        type: retentionForm.type,
        value: Number(retentionForm.value),
        reason: retentionForm.reason,
        beneficiary: retentionForm.beneficiary || undefined,
      })
      showSuccess(`${retentionForm.type === 'RETENCAO' ? 'Retenção' : 'Bloqueio'} registrado no ledger com sucesso.`)
      setRetentionForm({
        eventId: data?.events[0]?.id || '',
        type: 'RETENCAO',
        value: '',
        reason: '',
        beneficiary: '',
      })
    } catch (err: any) {
      showError(err.message)
    }
  }

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!releaseForm.eventId || !releaseForm.value || !releaseForm.reason) {
      showError('Preencha todos os campos para a liberação.')
      return
    }
    try {
      await createInternalRelease({
        eventId: releaseForm.eventId,
        value: Number(releaseForm.value),
        reason: releaseForm.reason,
      })
      showSuccess('Liberação de saldo retido registrada no ledger com sucesso.')
      setReleaseForm({
        eventId: data?.events[0]?.id || '',
        value: '',
        reason: '',
      })
    } catch (err: any) {
      showError(err.message)
    }
  }

  const handleCreateObligation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!obligationForm.eventId || !obligationForm.description || !obligationForm.value || !obligationForm.dueDate) {
      showError('Preencha os dados da obrigação financeira.')
      return
    }
    try {
      await createInternalObligation({
        eventId: obligationForm.eventId,
        category: obligationForm.category,
        description: obligationForm.description,
        beneficiary: obligationForm.beneficiary || undefined,
        value: Number(obligationForm.value),
        dueDate: obligationForm.dueDate,
        reserveNow: obligationForm.reserveNow,
      })
      showSuccess(`Obrigação programada com sucesso${obligationForm.reserveNow ? ' e valor reservado no saldo' : ''}.`)
      setObligationForm({
        eventId: data?.events[0]?.id || '',
        category: 'ALUGUEL_ESPACO',
        description: '',
        beneficiary: '',
        value: '',
        dueDate: '',
        reserveNow: true,
      })
    } catch (err: any) {
      showError(err.message)
    }
  }

  const handleUpdateObligationStatus = async (id: string, status: string) => {
    try {
      await updateInternalObligationStatus(id, status)
      showSuccess(`Status da obrigação atualizado para ${status}.`)
    } catch (err: any) {
      showError(err.message)
    }
  }

  const handleCreateCredit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!creditForm.eventId || !creditForm.principal) {
      showError('Informe o evento e o valor principal do crédito.')
      return
    }
    try {
      await createInternalCredit({
        eventId: creditForm.eventId,
        principal: Number(creditForm.principal),
        interestRate: Number(creditForm.interestRate || 0),
        installments: Number(creditForm.installments || 1),
        amortization: creditForm.amortization,
        receivablePercent: Number(creditForm.receivablePercent || 0),
      })
      showSuccess('Crédito / Antecipação concedido e registrado no ledger com sucesso.')
      setCreditForm({
        eventId: data?.events[0]?.id || '',
        principal: '',
        interestRate: '2.0',
        installments: '5',
        amortization: 'PERCENTUAL_RECEBIVEIS',
        receivablePercent: '15',
      })
    } catch (err: any) {
      showError(err.message)
    }
  }

  const handleExecuteAmortization = async () => {
    if (!amortizeCredit || !amortizeValue || Number(amortizeValue) <= 0) {
      showError('Informe um valor de amortização válido.')
      return
    }
    try {
      await amortizeInternalCredit(amortizeCredit.id, Number(amortizeValue))
      showSuccess(`Amortização de ${formatBrl(Number(amortizeValue))} realizada no contrato ${amortizeCredit.id}.`)
      setAmortizeCredit(null)
      setAmortizeValue('')
    } catch (err: any) {
      showError(err.message)
    }
  }

  const handleRecordRevenue = async () => {
    if (!revenueEventId || !revenueValue || Number(revenueValue) <= 0) {
      showError('Selecione o evento e informe o valor da receita.')
      return
    }
    try {
      const res = await recordInternalRevenue({
        eventId: revenueEventId,
        value: Number(revenueValue),
        reason: 'Receita de faturamento registrada para amortização automática',
      })
      showSuccess(
        `Receita de ${formatBrl(Number(revenueValue))} registrada! Foram disparadas ${res.amortizations?.length || 0} amortizações automáticas de crédito.`
      )
      setRevenueModalOpen(false)
      setRevenueValue('')
    } catch (err: any) {
      showError(err.message)
    }
  }

  const handleCreateRefund = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!refundForm.eventId || !refundForm.orderId || !refundForm.value || !refundForm.reason) {
      showError('Preencha os campos obrigatórios do estorno.')
      return
    }
    try {
      await createInternalRefund({
        eventId: refundForm.eventId,
        orderId: refundForm.orderId,
        value: Number(refundForm.value),
        reason: refundForm.reason,
      })
      showSuccess('Estorno solicitado com sucesso. Reserva cautelar retida imediatamente no saldo!')
      setRefundForm({
        eventId: data?.events[0]?.id || '',
        orderId: '',
        value: '',
        reason: '',
      })
    } catch (err: any) {
      showError(err.message)
    }
  }

  const handleExecuteAuthorizeRefund = async () => {
    if (!authorizeRefundItem || !operatorName.trim()) {
      showError('Informe o nome ou identificação do operador autorizador.')
      return
    }
    try {
      await authorizeInternalRefund(authorizeRefundItem.id, operatorName.trim())
      showSuccess(`Autorização registrada com sucesso por "${operatorName.trim()}".`)
      setAuthorizeRefundItem(null)
      setOperatorName('')
    } catch (err: any) {
      showError(err.message)
    }
  }

  const handleExecuteRefund = async (id: string) => {
    try {
      await executeInternalRefund(id)
      showSuccess(`Estorno ${id} efetivado com sucesso! Baixa contábil concluída no ledger.`)
    } catch (err: any) {
      showError(err.message)
    }
  }

  const handleRejectRefund = async (id: string) => {
    try {
      await rejectInternalRefund(id)
      showSuccess(`Estorno ${id} rejeitado. Saldo da reserva cautelar desbloqueado no evento.`)
    } catch (err: any) {
      showError(err.message)
    }
  }

  const handleRequestPayout = async () => {
    if (!payoutModalEvent || !payoutAmount || Number(payoutAmount) <= 0) {
      showError('Informe um valor de repasse válido.')
      return
    }
    try {
      await requestEventPayout({
        eventId: payoutModalEvent.id,
        value: Number(payoutAmount),
        exceptionAuthorization: payoutException,
      })
      showSuccess(`Solicitação de repasse no valor de ${formatBrl(Number(payoutAmount))} enviada com sucesso!`)
      setPayoutModalEvent(null)
      setPayoutAmount('')
      setPayoutException(false)
    } catch (err: any) {
      showError(err.message)
    }
  }

  if (loading && !data) {
    return (
      <div className="fia-section-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 16px', color: '#0284c7' }} />
        <h3 style={{ margin: 0 }}>Carregando Conta Financeira Interna...</h3>
        <p style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>Sincronizando ledger imutável e saldos por evento</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="fia-container">
      {/* Header Executivo da Conta Interna */}
      <header className="fia-header">
        <div className="fia-header-info">
          <h2>
            <Building2 size={24} color="#0284c7" />
            Conta Financeira Interna — {data.producer.name}
          </h2>
          <p>
            CNPJ: <strong>{data.producer.cnpj}</strong> • Identificador: <code>{data.producer.id}</code> • Uso Exclusivo Financeiro Disk
          </p>
        </div>
        <div className="fia-header-actions">
          <button className="fia-btn secondary" onClick={() => setRevenueModalOpen(true)}>
            <Zap size={15} color="#d97706" />
            Simular Receita
          </button>
          <button className="fia-btn primary" onClick={loadData}>
            <RefreshCw size={15} />
            Atualizar Saldos
          </button>
        </div>
      </header>

      {/* Alerta de Feedback */}
      {feedback && (
        <div className={`fia-alert ${feedback.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 0, cursor: 'pointer', color: 'inherit' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Cards de Resumo da Conta Interna (5 KPIs Globais) */}
      <section className="fia-kpi-grid">
        <div className="fia-kpi-card">
          <span className="fia-kpi-label">
            <WalletCards size={14} /> Vendas Registradas
          </span>
          <strong className="fia-kpi-val">{formatBrl(data.summary.sold)}</strong>
        </div>
        <div className="fia-kpi-card">
          <span className="fia-kpi-label">
            <Landmark size={14} /> Reservado / Retido
          </span>
          <strong className="fia-kpi-val" style={{ color: '#d97706' }}>
            {formatBrl(data.summary.reserved)}
          </strong>
        </div>
        <div className="fia-kpi-card">
          <span className="fia-kpi-label">
            <ShieldCheck size={14} /> Créditos em Aberto
          </span>
          <strong className="fia-kpi-val" style={{ color: '#7c3aed' }}>
            {formatBrl(data.summary.outstandingCredits)}
          </strong>
        </div>
        <div className="fia-kpi-card highlight">
          <span className="fia-kpi-label">
            <CheckCircle2 size={14} /> Elegível a Repasse
          </span>
          <strong className="fia-kpi-val">{formatBrl(data.summary.availableForRepasse)}</strong>
        </div>
        <div className="fia-kpi-card">
          <span className="fia-kpi-label">
            <Undo2 size={14} /> Estornos Pendentes
          </span>
          <strong className="fia-kpi-val" style={{ color: '#dc2626' }}>
            {formatBrl(data.summary.pendingRefunds)}
          </strong>
        </div>
      </section>

      {/* Navegação de Abas do Módulo */}
      <nav className="fia-nav-tabs">
        <button
          className={`fia-nav-btn ${activeTab === 'conta' ? 'active' : ''}`}
          onClick={() => setActiveTab('conta')}
        >
          <WalletCards size={16} /> Saldos & Elegibilidade de Repasse
          <span className="fia-tab-badge">{data.events.length}</span>
        </button>
        <button
          className={`fia-nav-btn ${activeTab === 'retencoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('retencoes')}
        >
          <Landmark size={16} /> Reservas e Retenções
          <span className="fia-tab-badge">
            {data.ledger.filter((x) => ['RETENCAO', 'BLOQUEIO', 'RESERVA_ESTORNO'].includes(x.type)).length}
          </span>
        </button>
        <button
          className={`fia-nav-btn ${activeTab === 'obrigacoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('obrigacoes')}
        >
          <ReceiptText size={16} /> Agenda de Obrigações
          <span className="fia-tab-badge">{data.obligations.length}</span>
        </button>
        <button
          className={`fia-nav-btn ${activeTab === 'creditos' ? 'active' : ''}`}
          onClick={() => setActiveTab('creditos')}
        >
          <ShieldCheck size={16} /> Créditos & Antecipações
          <span className="fia-tab-badge">{data.credits.length}</span>
        </button>
        <button
          className={`fia-nav-btn ${activeTab === 'estornos' ? 'active' : ''}`}
          onClick={() => setActiveTab('estornos')}
        >
          <Undo2 size={16} /> Estornos (Dupla Autorização)
          <span className="fia-tab-badge">{data.refunds.length}</span>
        </button>
        <button
          className={`fia-nav-btn ${activeTab === 'ledger' ? 'active' : ''}`}
          onClick={() => setActiveTab('ledger')}
        >
          <BookOpenCheck size={16} /> Ledger Imutável
          <span className="fia-tab-badge">{data.ledger.length}</span>
        </button>
        <button
          className={`fia-nav-btn ${activeTab === 'politica' ? 'active' : ''}`}
          onClick={() => setActiveTab('politica')}
        >
          <SlidersHorizontal size={16} /> Parâmetros de Política
        </button>
      </nav>

      {/* ====================================================================
          ABA 1: SALDOS E ELEGIBILIDADE DE REPASSE POR EVENTO
          ==================================================================== */}
      {activeTab === 'conta' && (
        <section className="fia-section-card">
          <div className="fia-section-title">
            <div>
              <h3>
                <Scale size={18} color="#0284c7" />
                Motor de Repasse Parametrizado por Evento
              </h3>
              <span>
                Regra atual: Libera {data.policy.releasePercent}% da base vendida somente após atingir{' '}
                {data.policy.minimumSalesPercent}% da meta de vendas, deduzindo retenções, estornos e amortizações.
              </span>
            </div>
          </div>

          <div className="fia-events-grid">
            {data.events.map((ev) => (
              <article key={ev.id} className="fia-event-card">
                <div className="fia-event-card-header">
                  <div>
                    <div className="fia-event-name">{ev.name}</div>
                    <div className="fia-event-id">{ev.id}</div>
                  </div>
                  <span className={`fia-badge ${ev.eligibility.eligible ? 'success' : 'warning'}`}>
                    {ev.eligibility.eligible ? (
                      <>
                        <CheckCircle2 size={12} /> Elegível a Repasse
                      </>
                    ) : (
                      <>
                        <Clock size={12} /> Aguardando Regra ({formatPct(ev.salesPercent)})
                      </>
                    )}
                  </span>
                </div>

                <div className="fia-event-metrics">
                  <div className="fia-event-metric-row">
                    <span>Vendas Realizadas:</span>
                    <strong>{formatBrl(ev.sold)}</strong>
                  </div>
                  <div className="fia-event-metric-row">
                    <span>Meta de Vendas:</span>
                    <strong>{formatBrl(ev.salesTarget)}</strong>
                  </div>
                  <div className="fia-event-metric-row">
                    <span>Meta Atingida:</span>
                    <strong>{formatPct(ev.salesPercent)}</strong>
                  </div>
                  <div className="fia-event-metric-row">
                    <span>Limite Bruto ({data.policy.releasePercent}%):</span>
                    <strong>{formatBrl(ev.eligibility.grossLimit)}</strong>
                  </div>
                  <div className="fia-event-metric-row">
                    <span>Retido / Reservado:</span>
                    <strong style={{ color: '#d97706' }}>{formatBrl(ev.reserved)}</strong>
                  </div>
                  <div className="fia-event-metric-row">
                    <span>Já Repassado:</span>
                    <strong>{formatBrl(ev.paid)}</strong>
                  </div>
                  <div className="fia-event-metric-row">
                    <span>Estornos Efetivados:</span>
                    <strong style={{ color: '#dc2626' }}>{formatBrl(ev.refunds)}</strong>
                  </div>
                  <div className="fia-event-metric-row">
                    <span>Dívida de Crédito:</span>
                    <strong style={{ color: '#7c3aed' }}>{formatBrl(ev.creditDebt)}</strong>
                  </div>
                </div>

                <div className={`fia-event-available-box ${ev.eligibility.availableToRequest <= 0 ? 'locked' : ''}`}>
                  <div>
                    <span>Disponível para Repasse</span>
                    <strong>{formatBrl(ev.eligibility.availableToRequest)}</strong>
                  </div>
                  <button
                    className="fia-btn primary"
                    onClick={() => {
                      setPayoutModalEvent(ev)
                      setPayoutAmount(String(ev.eligibility.availableToRequest))
                      setPayoutException(false)
                    }}
                  >
                    Solicitar Repasse <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ====================================================================
          ABA 2: RESERVAS E RETENÇÕES
          ==================================================================== */}
      {activeTab === 'retencoes' && (
        <section className="fia-section-card">
          <div className="fia-section-title">
            <h3>
              <Landmark size={18} color="#0284c7" />
              Gestão de Reservas, Retenções e Bloqueios Cautelares
            </h3>
            <span>Trava de saldos para garantia de custos, ECAD, fornecedores ou medidas cautelares</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Formulário de Inclusão de Retenção */}
            <div className="fia-form-card">
              <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700 }}>Nova Retenção ou Bloqueio</h4>
              <form onSubmit={handleCreateRetention} className="fia-form-grid">
                <div className="fia-form-group">
                  <label>Evento</label>
                  <select
                    className="fia-select"
                    value={retentionForm.eventId}
                    onChange={(e) => setRetentionForm({ ...retentionForm, eventId: e.target.value })}
                  >
                    {data.events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} ({ev.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="fia-form-group">
                  <label>Tipo</label>
                  <select
                    className="fia-select"
                    value={retentionForm.type}
                    onChange={(e) => setRetentionForm({ ...retentionForm, type: e.target.value as any })}
                  >
                    <option value="RETENCAO">Retenção Cautelar</option>
                    <option value="BLOQUEIO">Bloqueio Judicial/Operacional</option>
                  </select>
                </div>
                <div className="fia-form-group">
                  <label>Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    required
                    className="fia-input"
                    value={retentionForm.value}
                    onChange={(e) => setRetentionForm({ ...retentionForm, value: e.target.value })}
                  />
                </div>
                <div className="fia-form-group span-2">
                  <label>Motivo da Retenção</label>
                  <input
                    type="text"
                    placeholder="Ex: Aluguel do espaço, ECAD, custas técnicas..."
                    required
                    className="fia-input"
                    value={retentionForm.reason}
                    onChange={(e) => setRetentionForm({ ...retentionForm, reason: e.target.value })}
                  />
                </div>
                <div className="fia-form-group">
                  <label>Beneficiário</label>
                  <input
                    type="text"
                    placeholder="Ex: Teatro Positivo, ECAD..."
                    className="fia-input"
                    value={retentionForm.beneficiary}
                    onChange={(e) => setRetentionForm({ ...retentionForm, beneficiary: e.target.value })}
                  />
                </div>
                <div>
                  <button type="submit" className="fia-btn primary" style={{ width: '100%' }}>
                    <Plus size={15} /> Registrar Retenção
                  </button>
                </div>
              </form>
            </div>

            {/* Formulário de Liberação de Saldo Retido */}
            <div className="fia-form-card">
              <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700 }}>Liberar Saldo Retido</h4>
              <form onSubmit={handleCreateRelease} className="fia-form-grid">
                <div className="fia-form-group">
                  <label>Evento</label>
                  <select
                    className="fia-select"
                    value={releaseForm.eventId}
                    onChange={(e) => setReleaseForm({ ...releaseForm, eventId: e.target.value })}
                  >
                    {data.events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} ({ev.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="fia-form-group">
                  <label>Valor a Liberar (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    required
                    className="fia-input"
                    value={releaseForm.value}
                    onChange={(e) => setReleaseForm({ ...releaseForm, value: e.target.value })}
                  />
                </div>
                <div className="fia-form-group span-2">
                  <label>Motivo da Liberação</label>
                  <input
                    type="text"
                    placeholder="Ex: Pagamento comprovado pelo produtor, liberação judicial..."
                    required
                    className="fia-input"
                    value={releaseForm.reason}
                    onChange={(e) => setReleaseForm({ ...releaseForm, reason: e.target.value })}
                  />
                </div>
                <div className="span-2">
                  <button type="submit" className="fia-btn success" style={{ width: '100%' }}>
                    <CheckCircle2 size={15} /> Confirmar Liberação no Ledger
                  </button>
                </div>
              </form>
            </div>
          </div>

          <h4 style={{ margin: '20px 0 10px 0', fontSize: 15, fontWeight: 700 }}>Histórico de Retenções e Bloqueios</h4>
          <div className="fia-table-responsive">
            <table className="fia-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Evento</th>
                  <th>Tipo</th>
                  <th>Motivo</th>
                  <th>Beneficiário</th>
                  <th>Valor</th>
                  <th>Operador</th>
                </tr>
              </thead>
              <tbody>
                {data.ledger
                  .filter((x) => ['RETENCAO', 'BLOQUEIO', 'RESERVA_ESTORNO', 'LIBERACAO'].includes(x.type))
                  .map((entry) => (
                    <tr key={entry.id}>
                      <td>{formatDate(entry.createdAt)}</td>
                      <td>
                        <strong>{entry.eventId}</strong>
                      </td>
                      <td>
                        <span
                          className={`fia-badge ${
                            entry.type === 'LIBERACAO'
                              ? 'success'
                              : entry.type === 'BLOQUEIO'
                                ? 'warning'
                                : entry.type === 'RESERVA_ESTORNO'
                                  ? 'purple'
                                  : 'neutral'
                          }`}
                        >
                          {entry.type}
                        </span>
                      </td>
                      <td>{entry.reason}</td>
                      <td>{entry.beneficiary || '—'}</td>
                      <td>
                        <strong style={{ color: entry.type === 'LIBERACAO' ? '#16a34a' : '#dc2626' }}>
                          {entry.type === 'LIBERACAO' ? '+' : '-'} {formatBrl(entry.value)}
                        </strong>
                      </td>
                      <td>{entry.actor}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ====================================================================
          ABA 3: AGENDA DE OBRIGAÇÕES
          ==================================================================== */}
      {activeTab === 'obrigacoes' && (
        <section className="fia-section-card">
          <div className="fia-section-title">
            <h3>
              <ReceiptText size={18} color="#0284c7" />
              Agenda de Obrigações Financeiras com Reserva Automática
            </h3>
            <span>Compromissos vinculados aos eventos com retenção de segurança prévia no saldo</span>
          </div>

          <div className="fia-form-card">
            <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700 }}>Programar Nova Obrigação</h4>
            <form onSubmit={handleCreateObligation} className="fia-form-grid">
              <div className="fia-form-group">
                <label>Evento</label>
                <select
                  className="fia-select"
                  value={obligationForm.eventId}
                  onChange={(e) => setObligationForm({ ...obligationForm, eventId: e.target.value })}
                >
                  {data.events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="fia-form-group">
                <label>Categoria</label>
                <select
                  className="fia-select"
                  value={obligationForm.category}
                  onChange={(e) => setObligationForm({ ...obligationForm, category: e.target.value })}
                >
                  <option value="ALUGUEL_ESPACO">Aluguel do Espaço</option>
                  <option value="ECAD">Direitos Autorais (ECAD)</option>
                  <option value="FORNECEDOR">Fornecedor / Estrutura</option>
                  <option value="IMPOSTOS">Impostos & Tributos</option>
                  <option value="OUTROS">Outras Obrigações</option>
                </select>
              </div>
              <div className="fia-form-group">
                <label>Data de Vencimento</label>
                <input
                  type="date"
                  required
                  className="fia-input"
                  value={obligationForm.dueDate}
                  onChange={(e) => setObligationForm({ ...obligationForm, dueDate: e.target.value })}
                />
              </div>
              <div className="fia-form-group">
                <label>Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  required
                  className="fia-input"
                  value={obligationForm.value}
                  onChange={(e) => setObligationForm({ ...obligationForm, value: e.target.value })}
                />
              </div>
              <div className="fia-form-group span-2">
                <label>Descrição da Obrigação</label>
                <input
                  type="text"
                  placeholder="Ex: Parcela 2/3 da locação do pavilhão..."
                  required
                  className="fia-input"
                  value={obligationForm.description}
                  onChange={(e) => setObligationForm({ ...obligationForm, description: e.target.value })}
                />
              </div>
              <div className="fia-form-group">
                <label>Beneficiário</label>
                <input
                  type="text"
                  placeholder="Ex: Teatro Guaíra"
                  className="fia-input"
                  value={obligationForm.beneficiary}
                  onChange={(e) => setObligationForm({ ...obligationForm, beneficiary: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={obligationForm.reserveNow}
                    onChange={(e) => setObligationForm({ ...obligationForm, reserveNow: e.target.checked })}
                  />
                  <strong>Reservar valor no saldo agora</strong>
                </label>
              </div>
              <div>
                <button type="submit" className="fia-btn primary" style={{ width: '100%' }}>
                  <Plus size={15} /> Programar Obrigação
                </button>
              </div>
            </form>
          </div>

          <h4 style={{ margin: '20px 0 10px 0', fontSize: 15, fontWeight: 700 }}>Obrigações Programadas</h4>
          <div className="fia-table-responsive">
            <table className="fia-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Evento</th>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th>Beneficiário</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.obligations.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                      Nenhuma obrigação programada.
                    </td>
                  </tr>
                ) : (
                  data.obligations.map((ob: InternalAccountObligation) => (
                    <tr key={ob.id}>
                      <td>
                        <code>{ob.id}</code>
                      </td>
                      <td>
                        <strong>{ob.eventId}</strong>
                      </td>
                      <td>
                        <span className="fia-badge info">{ob.category}</span>
                      </td>
                      <td>{ob.description}</td>
                      <td>{ob.beneficiary || '—'}</td>
                      <td>{ob.dueDate}</td>
                      <td>
                        <strong>{formatBrl(ob.value)}</strong>
                      </td>
                      <td>
                        <span
                          className={`fia-badge ${
                            ob.status === 'PAGO'
                              ? 'success'
                              : ob.status === 'RESERVADO'
                                ? 'warning'
                                : ob.status === 'CANCELADO'
                                  ? 'neutral'
                                  : 'info'
                          }`}
                        >
                          {ob.status}
                        </span>
                      </td>
                      <td>
                        <div className="fia-actions-cell">
                          {ob.status !== 'PAGO' && (
                            <button
                              className="fia-btn success"
                              style={{ padding: '4px 8px', fontSize: 11 }}
                              onClick={() => handleUpdateObligationStatus(ob.id, 'PAGO')}
                            >
                              Marcar Pago
                            </button>
                          )}
                          {ob.status !== 'CANCELADO' && (
                            <button
                              className="fia-btn secondary"
                              style={{ padding: '4px 8px', fontSize: 11 }}
                              onClick={() => handleUpdateObligationStatus(ob.id, 'CANCELADO')}
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ====================================================================
          ABA 4: CRÉDITOS E ANTECIPAÇÕES COM AMORTIZAÇÃO AUTOMÁTICA
          ==================================================================== */}
      {activeTab === 'creditos' && (
        <section className="fia-section-card">
          <div className="fia-section-title">
            <h3>
              <ShieldCheck size={18} color="#0284c7" />
              Concessão de Créditos / Antecipações com Amortização Automática
            </h3>
            <span>Amortização vinculada a percentual sobre faturamento de recebíveis ou parcelas</span>
          </div>

          <div className="fia-form-card">
            <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700 }}>Conceder Novo Crédito / Antecipação</h4>
            <form onSubmit={handleCreateCredit} className="fia-form-grid">
              <div className="fia-form-group">
                <label>Evento</label>
                <select
                  className="fia-select"
                  value={creditForm.eventId}
                  onChange={(e) => setCreditForm({ ...creditForm, eventId: e.target.value })}
                >
                  {data.events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="fia-form-group">
                <label>Valor Principal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  required
                  className="fia-input"
                  value={creditForm.principal}
                  onChange={(e) => setCreditForm({ ...creditForm, principal: e.target.value })}
                />
              </div>
              <div className="fia-form-group">
                <label>Taxa de Juros (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className="fia-input"
                  value={creditForm.interestRate}
                  onChange={(e) => setCreditForm({ ...creditForm, interestRate: e.target.value })}
                />
              </div>
              <div className="fia-form-group">
                <label>Número de Parcelas</label>
                <input
                  type="number"
                  min="1"
                  className="fia-input"
                  value={creditForm.installments}
                  onChange={(e) => setCreditForm({ ...creditForm, installments: e.target.value })}
                />
              </div>
              <div className="fia-form-group">
                <label>Modelo de Amortização</label>
                <select
                  className="fia-select"
                  value={creditForm.amortization}
                  onChange={(e) => setCreditForm({ ...creditForm, amortization: e.target.value as any })}
                >
                  <option value="PERCENTUAL_RECEBIVEIS">Percentual dos Recebíveis</option>
                  <option value="PARCELAS_FIXAS">Parcelas Fixas Periódicas</option>
                  <option value="FECHAMENTO_EVENTO">No Fechamento do Evento</option>
                </select>
              </div>
              <div className="fia-form-group">
                <label>% dos Recebíveis</label>
                <input
                  type="number"
                  step="0.01"
                  className="fia-input"
                  value={creditForm.receivablePercent}
                  onChange={(e) => setCreditForm({ ...creditForm, receivablePercent: e.target.value })}
                />
              </div>
              <div className="span-2">
                <button type="submit" className="fia-btn primary" style={{ width: '100%' }}>
                  <Plus size={15} /> Conceder Crédito & Lançar no Ledger
                </button>
              </div>
            </form>
          </div>

          <h4 style={{ margin: '20px 0 10px 0', fontSize: 15, fontWeight: 700 }}>Contratos de Crédito em Aberto e Liquidados</h4>
          <div className="fia-table-responsive">
            <table className="fia-table">
              <thead>
                <tr>
                  <th>Contrato</th>
                  <th>Evento</th>
                  <th>Principal</th>
                  <th>Juros</th>
                  <th>Parcelas</th>
                  <th>Valor Parcela</th>
                  <th>Saldo Devedor</th>
                  <th>Amortização</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.credits.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                      Nenhum contrato de crédito ativo ou registrado.
                    </td>
                  </tr>
                ) : (
                  data.credits.map((cr: InternalAccountCredit) => (
                    <tr key={cr.id}>
                      <td>
                        <code>{cr.id}</code>
                      </td>
                      <td>
                        <strong>{cr.eventId}</strong>
                      </td>
                      <td>{formatBrl(cr.principal)}</td>
                      <td>{cr.interestRate}%</td>
                      <td>{cr.installments}x</td>
                      <td>{formatBrl(cr.installmentValue)}</td>
                      <td>
                        <strong style={{ color: cr.outstanding > 0 ? '#dc2626' : '#16a34a' }}>
                          {formatBrl(cr.outstanding)}
                        </strong>
                      </td>
                      <td>
                        <span className="fia-badge info">
                          {cr.amortization === 'PERCENTUAL_RECEBIVEIS'
                            ? `${cr.receivablePercent}% Recebíveis`
                            : cr.amortization}
                        </span>
                      </td>
                      <td>
                        <span className={`fia-badge ${cr.status === 'ATIVO' ? 'warning' : 'success'}`}>{cr.status}</span>
                      </td>
                      <td>
                        {cr.status === 'ATIVO' && (
                          <button
                            className="fia-btn secondary"
                            style={{ padding: '4px 8px', fontSize: 11 }}
                            onClick={() => {
                              setAmortizeCredit(cr)
                              setAmortizeValue(String(cr.installmentValue || 1000))
                            }}
                          >
                            Amortizar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ====================================================================
          ABA 5: FILA DE ESTORNOS (DUPLA AUTORIZAÇÃO / DUAL CONTROL)
          ==================================================================== */}
      {activeTab === 'estornos' && (
        <section className="fia-section-card">
          <div className="fia-section-title">
            <h3>
              <Undo2 size={18} color="#0284c7" />
              Fila de Estornos Internos • Dupla Autorização Obrigatória (Dual Control)
            </h3>
            <span>
              Segregação de funções: exige autorização de dois operadores financeiros distintos antes da efetivação
            </span>
          </div>

          <div className="fia-form-card">
            <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700 }}>Solicitar Novo Estorno Interno</h4>
            <form onSubmit={handleCreateRefund} className="fia-form-grid">
              <div className="fia-form-group">
                <label>Evento</label>
                <select
                  className="fia-select"
                  value={refundForm.eventId}
                  onChange={(e) => setRefundForm({ ...refundForm, eventId: e.target.value })}
                >
                  {data.events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="fia-form-group">
                <label>Número do Pedido</label>
                <input
                  type="text"
                  placeholder="Ex: PED-10842"
                  required
                  className="fia-input"
                  value={refundForm.orderId}
                  onChange={(e) => setRefundForm({ ...refundForm, orderId: e.target.value })}
                />
              </div>
              <div className="fia-form-group">
                <label>Valor do Estorno (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  required
                  className="fia-input"
                  value={refundForm.value}
                  onChange={(e) => setRefundForm({ ...refundForm, value: e.target.value })}
                />
              </div>
              <div className="fia-form-group span-2">
                <label>Motivo do Estorno</label>
                <input
                  type="text"
                  placeholder="Ex: Cancelamento solicitado pelo titular, duplicidade..."
                  required
                  className="fia-input"
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                />
              </div>
              <div>
                <button type="submit" className="fia-btn primary" style={{ width: '100%' }}>
                  <Plus size={15} /> Solicitar & Reter Reserva
                </button>
              </div>
            </form>
          </div>

          <h4 style={{ margin: '20px 0 10px 0', fontSize: 15, fontWeight: 700 }}>Fila de Aprovação de Estornos</h4>
          <div className="fia-table-responsive">
            <table className="fia-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Pedido</th>
                  <th>Evento</th>
                  <th>Valor</th>
                  <th>Solicitado Por</th>
                  <th>Aprovações</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.refunds.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                      Nenhum estorno interno em fila.
                    </td>
                  </tr>
                ) : (
                  data.refunds.map((rf: InternalAccountRefund) => (
                    <tr key={rf.id}>
                      <td>
                        <code>{rf.id}</code>
                      </td>
                      <td>
                        <strong>#{rf.orderId}</strong>
                      </td>
                      <td>{rf.eventId}</td>
                      <td>
                        <strong>{formatBrl(rf.value)}</strong>
                      </td>
                      <td>{rf.requestedBy}</td>
                      <td>
                        {rf.approvals && rf.approvals.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {rf.approvals.map((ap, i) => (
                              <span key={i} className="fia-badge success" style={{ fontSize: 10 }}>
                                #{i + 1}: {ap.user}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="fia-badge neutral" style={{ fontSize: 10 }}>
                            Nenhuma
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`fia-badge ${
                            rf.status === 'EFETIVADO'
                              ? 'success'
                              : rf.status === 'REJEITADO'
                                ? 'neutral'
                                : rf.status === 'AUTORIZADO_PARA_EFETIVAR'
                                  ? 'purple'
                                  : 'warning'
                          }`}
                        >
                          {rf.status === 'AGUARDANDO_PRIMEIRA_AUTORIZACAO' && '1ª Aprovação Pendente'}
                          {rf.status === 'AGUARDANDO_SEGUNDA_AUTORIZACAO' && '2ª Aprovação Pendente'}
                          {rf.status === 'AUTORIZADO_PARA_EFETIVAR' && 'Pronto p/ Efetivar'}
                          {rf.status === 'EFETIVADO' && 'Efetivado'}
                          {rf.status === 'REJEITADO' && 'Rejeitado'}
                        </span>
                      </td>
                      <td>
                        <div className="fia-actions-cell">
                          {/* Botão de Autorizar */}
                          {!['EFETIVADO', 'REJEITADO'].includes(rf.status) && (rf.approvals?.length || 0) < 2 && (
                            <button
                              className="fia-btn primary"
                              style={{ padding: '4px 8px', fontSize: 11 }}
                              onClick={() => {
                                setAuthorizeRefundItem(rf)
                                setOperatorName('')
                              }}
                            >
                              Autorizar
                            </button>
                          )}

                          {/* Botão de Efetivar */}
                          {rf.status === 'AUTORIZADO_PARA_EFETIVAR' && (
                            <button
                              className="fia-btn success"
                              style={{ padding: '4px 8px', fontSize: 11 }}
                              onClick={() => handleExecuteRefund(rf.id)}
                            >
                              Efetivar
                            </button>
                          )}

                          {/* Botão de Rejeitar */}
                          {!['EFETIVADO', 'REJEITADO'].includes(rf.status) && (
                            <button
                              className="fia-btn danger"
                              style={{ padding: '4px 8px', fontSize: 11 }}
                              onClick={() => handleRejectRefund(rf.id)}
                            >
                              Rejeitar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ====================================================================
          ABA 6: LEDGER IMUTÁVEL (APPEND-ONLY)
          ==================================================================== */}
      {activeTab === 'ledger' && (
        <section className="fia-section-card">
          <div className="fia-section-title">
            <h3>
              <BookOpenCheck size={18} color="#0284c7" />
              Extrato Imutável do Ledger Financeiro (Append-Only)
            </h3>
            <span>Rastreabilidade completa de todas as operações contábeis. Nenhum saldo é editado diretamente.</span>
          </div>

          <div className="fia-table-responsive">
            <table className="fia-table">
              <thead>
                <tr>
                  <th>Lançamento</th>
                  <th>Data/Hora</th>
                  <th>Evento</th>
                  <th>Tipo de Transação</th>
                  <th>Motivo / Descrição</th>
                  <th>Beneficiário</th>
                  <th>Valor</th>
                  <th>Operador Responsável</th>
                </tr>
              </thead>
              <tbody>
                {data.ledger.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <code>{entry.id}</code>
                    </td>
                    <td>{formatDate(entry.createdAt)}</td>
                    <td>
                      <strong>{entry.eventId}</strong>
                    </td>
                    <td>
                      <span
                        className={`fia-badge ${
                          ['RECEITA_EVENTO', 'LIBERACAO'].includes(entry.type)
                            ? 'success'
                            : ['BLOQUEIO', 'RETENCAO'].includes(entry.type)
                              ? 'warning'
                              : entry.type === 'RESERVA_ESTORNO'
                                ? 'purple'
                                : entry.type === 'ESTORNO_EFETIVADO'
                                  ? 'neutral'
                                  : 'info'
                        }`}
                      >
                        {entry.type}
                      </span>
                    </td>
                    <td>{entry.reason}</td>
                    <td>{entry.beneficiary || '—'}</td>
                    <td>
                      <strong
                        style={{
                          color: ['RECEITA_EVENTO', 'LIBERACAO'].includes(entry.type)
                            ? '#16a34a'
                            : ['REPASSE', 'ESTORNO_EFETIVADO'].includes(entry.type)
                              ? '#dc2626'
                              : '#0f172a',
                        }}
                      >
                        {formatBrl(entry.value)}
                      </strong>
                    </td>
                    <td>{entry.actor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ====================================================================
          ABA 7: PARÂMETROS DE POLÍTICA
          ==================================================================== */}
      {activeTab === 'politica' && (
        <section className="fia-section-card">
          <div className="fia-section-title">
            <h3>
              <SlidersHorizontal size={18} color="#0284c7" />
              Parâmetros de Política de Repasse da Conta Interna
            </h3>
            <span>Ajuste global das regras de elegibilidade, metas e requisitos de aprovação</span>
          </div>

          <form onSubmit={handleSavePolicy} style={{ maxWidth: 640 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="fia-form-group">
                <label>Meta Mínima de Vendas para Liberação (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  className="fia-input"
                  value={policyForm.minimumSalesPercent}
                  onChange={(e) =>
                    setPolicyForm({ ...policyForm, minimumSalesPercent: Number(e.target.value) })
                  }
                />
                <small style={{ color: '#64748b' }}>
                  Percentual do alvo de vendas que o evento precisa atingir antes de liberar repasses. Padrão: 50%.
                </small>
              </div>

              <div className="fia-form-group">
                <label>Percentual de Liberação sobre a Base Vendida (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  className="fia-input"
                  value={policyForm.releasePercent}
                  onChange={(e) => setPolicyForm({ ...policyForm, releasePercent: Number(e.target.value) })}
                />
                <small style={{ color: '#64748b' }}>
                  Percentual máximo liberado sobre o montante bruto vendido. Padrão: 20%.
                </small>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={policyForm.refundDualAuthorization}
                    onChange={(e) =>
                      setPolicyForm({ ...policyForm, refundDualAuthorization: e.target.checked })
                    }
                  />
                  <strong>Exigir Dupla Autorização Obrigatória (Dual Control) para Estornos</strong>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={policyForm.requireApproval}
                    onChange={(e) => setPolicyForm({ ...policyForm, requireApproval: e.target.checked })}
                  />
                  <strong>Exigir Aprovação de Alçada para Repasses Acima da Margem</strong>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={policyForm.requireSignature}
                    onChange={(e) => setPolicyForm({ ...policyForm, requireSignature: e.target.checked })}
                  />
                  <strong>Exigir Assinatura Digital do Borderô no Encerramento</strong>
                </label>
              </div>

              <div style={{ marginTop: 16 }}>
                <button type="submit" className="fia-btn primary">
                  <CheckCircle2 size={16} /> Salvar Parâmetros da Política
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      {/* ====================================================================
          MODAL: SOLICITAR REPASSE COM VALIDAÇÃO DE LIMITE
          ==================================================================== */}
      {payoutModalEvent && (
        <div className="fia-modal-backdrop" onClick={() => setPayoutModalEvent(null)}>
          <div className="fia-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="fia-modal-header">
              <h3>Solicitar Repasse — {payoutModalEvent.name}</h3>
              <button
                onClick={() => setPayoutModalEvent(null)}
                style={{ background: 'none', border: 0, cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="fia-modal-body">
              <div className="fia-event-metric-row">
                <span>Disponível Elegível Calculado:</span>
                <strong style={{ color: '#16a34a' }}>
                  {formatBrl(payoutModalEvent.eligibility.availableToRequest)}
                </strong>
              </div>
              <div className="fia-form-group">
                <label>Valor Desejado para Repasse (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="fia-input"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                />
              </div>

              {Number(payoutAmount) > payoutModalEvent.eligibility.availableToRequest && (
                <div className="fia-alert error" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                  <strong>Atenção: Limite Excedido!</strong>
                  <span>
                    O valor solicitado excede o limite disponível de{' '}
                    {formatBrl(payoutModalEvent.eligibility.availableToRequest)}. Requer autorização de exceção da
                    diretoria financeira.
                  </span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={payoutException}
                      onChange={(e) => setPayoutException(e.target.checked)}
                    />
                    <strong>Confirmar Autorização de Exceção Financeira</strong>
                  </label>
                </div>
              )}
            </div>
            <div className="fia-modal-footer">
              <button className="fia-btn secondary" onClick={() => setPayoutModalEvent(null)}>
                Cancelar
              </button>
              <button className="fia-btn primary" onClick={handleRequestPayout}>
                Confirmar Solicitação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: AMORTIZAÇÃO DE CRÉDITO
          ==================================================================== */}
      {amortizeCredit && (
        <div className="fia-modal-backdrop" onClick={() => setAmortizeCredit(null)}>
          <div className="fia-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="fia-modal-header">
              <h3>Amortizar Crédito {amortizeCredit.id}</h3>
              <button onClick={() => setAmortizeCredit(null)} style={{ background: 'none', border: 0, cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div className="fia-modal-body">
              <div className="fia-event-metric-row">
                <span>Saldo Devedor Atual:</span>
                <strong style={{ color: '#dc2626' }}>{formatBrl(amortizeCredit.outstanding)}</strong>
              </div>
              <div className="fia-form-group">
                <label>Valor da Amortização (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="fia-input"
                  value={amortizeValue}
                  onChange={(e) => setAmortizeValue(e.target.value)}
                />
              </div>
            </div>
            <div className="fia-modal-footer">
              <button className="fia-btn secondary" onClick={() => setAmortizeCredit(null)}>
                Cancelar
              </button>
              <button className="fia-btn primary" onClick={handleExecuteAmortization}>
                Confirmar Amortização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: SIMULAR RECEITA COM AMORTIZAÇÃO AUTOMÁTICA
          ==================================================================== */}
      {revenueModalOpen && (
        <div className="fia-modal-backdrop" onClick={() => setRevenueModalOpen(false)}>
          <div className="fia-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="fia-modal-header">
              <h3>Simular Registro de Receita</h3>
              <button onClick={() => setRevenueModalOpen(false)} style={{ background: 'none', border: 0, cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div className="fia-modal-body">
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                Ao registrar receita em um evento com créditos vinculados por % dos recebíveis, o motor financeiro
                realiza o abatimento automático proporcional e lança no ledger imutável.
              </p>
              <div className="fia-form-group">
                <label>Evento</label>
                <select
                  className="fia-select"
                  value={revenueEventId}
                  onChange={(e) => setRevenueEventId(e.target.value)}
                >
                  {data.events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="fia-form-group">
                <label>Valor da Receita Faturada (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 50000"
                  required
                  className="fia-input"
                  value={revenueValue}
                  onChange={(e) => setRevenueValue(e.target.value)}
                />
              </div>
            </div>
            <div className="fia-modal-footer">
              <button className="fia-btn secondary" onClick={() => setRevenueModalOpen(false)}>
                Cancelar
              </button>
              <button className="fia-btn primary" onClick={handleRecordRevenue}>
                Faturar Receita
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: DUPLA AUTORIZAÇÃO DE ESTORNO
          ==================================================================== */}
      {authorizeRefundItem && (
        <div className="fia-modal-backdrop" onClick={() => setAuthorizeRefundItem(null)}>
          <div className="fia-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="fia-modal-header">
              <h3>Autorizar Estorno {authorizeRefundItem.id}</h3>
              <button
                onClick={() => setAuthorizeRefundItem(null)}
                style={{ background: 'none', border: 0, cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="fia-modal-body">
              <div className="fia-event-metric-row">
                <span>Pedido:</span>
                <strong>#{authorizeRefundItem.orderId}</strong>
              </div>
              <div className="fia-event-metric-row">
                <span>Valor:</span>
                <strong>{formatBrl(authorizeRefundItem.value)}</strong>
              </div>
              <div className="fia-event-metric-row">
                <span>Aprovações Concluídas:</span>
                <strong>{authorizeRefundItem.approvals?.length || 0} de 2 obrigatórias</strong>
              </div>

              {authorizeRefundItem.approvals && authorizeRefundItem.approvals.length > 0 && (
                <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, fontSize: 12 }}>
                  <span>Operadores que já autorizaram:</span>
                  <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                    {authorizeRefundItem.approvals.map((ap, i) => (
                      <li key={i}>
                        <strong>{ap.user}</strong> em {formatDate(ap.at)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="fia-form-group">
                <label>Identificação do Operador Autorizador</label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Ferreira - Auditor Financeiro"
                  required
                  className="fia-input"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                />
                <small style={{ color: '#64748b' }}>
                  Aviso: O mesmo operador não pode conceder a 1ª e a 2ª autorização (regra de segregação estrita).
                </small>
              </div>
            </div>
            <div className="fia-modal-footer">
              <button className="fia-btn secondary" onClick={() => setAuthorizeRefundItem(null)}>
                Cancelar
              </button>
              <button className="fia-btn primary" onClick={handleExecuteAuthorizeRefund}>
                Confirmar Autorização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
