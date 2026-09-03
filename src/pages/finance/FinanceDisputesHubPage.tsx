import { useEffect, useState } from 'react'
import {
  AlertOctagon, AlertTriangle, CheckCircle2, Clock, DollarSign,
  FileText, Plus, RefreshCw, Send, ShieldAlert, ShieldCheck, X, Zap, ArrowLeft
} from 'lucide-react'
import {
  getFinanceDisputesSummary, getFinanceDisputesRefunds, createFinanceDisputesRefund,
  approveFinanceDisputesRefund, processFinanceDisputesRefund, completeFinanceDisputesRefund,
  getFinanceChargebacks, createFinanceChargeback, submitChargebackEvidence, resolveFinanceChargeback,
  sendPaymentWebhook,
  type FinanceDisputesSummary, type FinanceChargeback, type RefundRequest
} from '../../services/api'

type Tab = 'refunds' | 'chargebacks' | 'financial-impact' | 'enterprise' | 'webhooks'
type Props = {
  producerId?: number
  eventId?: number
  initialTab?: Tab
  notify?: (message: string) => void
  onBack?: () => void
}

const money = (c = 0) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100)
const pct = (val = 0) => `${val.toFixed(1)}%`

export default function FinanceDisputesHubPage({ producerId, eventId, initialTab = 'refunds', notify, onBack }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [summary, setSummary] = useState<FinanceDisputesSummary | null>(null)
  const [refunds, setRefunds] = useState<RefundRequest[]>([])
  const [chargebacks, setChargebacks] = useState<FinanceChargeback[]>([])

  const flash = (m: string) => notify?.(m)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [s, r, c] = await Promise.all([
        getFinanceDisputesSummary(producerId, eventId),
        getFinanceDisputesRefunds(producerId, eventId),
        getFinanceChargebacks(producerId, eventId)
      ])
      setSummary(s)
      setRefunds(r)
      setChargebacks(c)
    } catch (e: any) {
      setError(e.message || 'Falha ao carregar central de estornos e disputas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [producerId, eventId])

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  return (
    <div className="findisp-page" data-finance-release="25.8-enterprise-refund-engine-2026-09-02">
      {/* Back Button */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => (onBack ? onBack() : window.history.back())}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 shadow-xs transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Painel</span>
        </button>
      </div>

      <header className="findisp-hero">
        <div>
          <span>ERP · FASE 25.8 · MOTOR ENTERPRISE</span>
          <h1>Central de Estornos, Reembolsos & Chargebacks</h1>
          <p>
            Operação independente para devoluções financeiras, alçadas de aprovação, conciliação, chargebacks, vouchers e auditoria — integrada ao Financeiro, SAC e gateways.
          </p>
        </div>
        <button className="fa-btn secondary" onClick={load}>
          <RefreshCw size={16} /> Atualizar
        </button>
      </header>

      {error && (
        <div className="finance360-alert error">
          <AlertTriangle size={18} />{error}
        </div>
      )}

      <div className="findisp-kpis">
        <div className="findisp-kpi warning">
          <Clock size={22} />
          <div>
            <small>Fila de Aprovações</small>
            <strong>{summary?.pendingRefundsCount || 0} solicitações</strong>
            <span className="findisp-kpi-sub">Total solicitado: {money(summary?.totalRequestedRefundCents)}</span>
          </div>
        </div>
        <div className="findisp-kpi success">
          <CheckCircle2 size={22} />
          <div>
            <small>Montante Devolvido</small>
            <strong>{money(summary?.totalCompletedRefundCents)}</strong>
            <span className="findisp-kpi-sub">{summary?.partialRefundsCount || 0} parciais</span>
          </div>
        </div>
        <div className="findisp-kpi danger">
          <ShieldAlert size={22} />
          <div>
            <small>Chargebacks & Risco</small>
            <strong>{money(summary?.openChargebacksCents)}</strong>
            <span className="findisp-kpi-sub">{summary?.openChargebacksCount || 0} contestações ativas</span>
          </div>
        </div>
        <div className="findisp-kpi highlight">
          <ShieldCheck size={22} />
          <div>
            <small>Zona de Segurança</small>
            <strong>{pct(summary?.recoveryRatePct || 0)}</strong>
            <span className="findisp-kpi-sub">Disputas ganhas: {money(summary?.wonChargebacksCents)}</span>
          </div>
        </div>
      </div>

      <nav className="finance360-tabs">
        {([
          ['refunds', 'Estornos & Devoluções'],
          ['chargebacks', 'Chargebacks & Contestações'],
          ['financial-impact', 'Impacto Financeiro & Reversões'],
          ['enterprise', 'Motor Enterprise'],
          ['webhooks', 'Webhooks & Logs Provedor']
        ] as const).map(([k, l]) => (
          <button
            key={k}
            className={tab === k ? 'active' : ''}
            onClick={() => setTab(k)}
          >
            {l}
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="finance360-loading">Carregando dados de estornos e disputas...</div>
      ) : (
        <>
          {tab === 'refunds' && (
            <RefundsTab
              refunds={refunds}
              producerId={producerId}
              eventId={eventId}
              reload={load}
              flash={flash}
            />
          )}
          {tab === 'chargebacks' && (
            <ChargebacksTab
              chargebacks={chargebacks}
              producerId={producerId}
              eventId={eventId}
              reload={load}
              flash={flash}
            />
          )}
          {tab === 'financial-impact' && (
            <FinancialImpactTab
              summary={summary}
              refunds={refunds}
              chargebacks={chargebacks}
            />
          )}
          {tab === 'enterprise' && (
            <EnterpriseRefundEngineTab summary={summary} refunds={refunds} />
          )}
          {tab === 'webhooks' && (
            <WebhooksTab
              producerId={producerId}
              reload={load}
              flash={flash}
            />
          )}
        </>
      )}
    </div>
  )
}

// ==========================================
// ABA 1: ESTORNOS & DEVOLUÇÕES
// ==========================================
function RefundsTab({
  refunds,
  producerId,
  eventId,
  reload,
  flash
}: {
  refunds: RefundRequest[]
  producerId?: number
  eventId?: number
  reload: () => Promise<void>
  flash: (m: string) => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    orderCode: '',
    amountReais: '',
    kind: 'total' as 'total' | 'parcial',
    method: 'credito',
    reason: '',
    transactionRef: ''
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const cents = Math.round(parseFloat(form.amountReais || '0') * 100)
    if (cents <= 0) return flash('Informe um valor válido para devolução.')
    if (!form.orderCode.trim() || !form.reason.trim()) {
      return flash('Preencha o código do pedido e o motivo.')
    }

    try {
      await createFinanceDisputesRefund({
        orderCode: form.orderCode.trim(),
        amountCents: cents,
        kind: form.kind,
        method: form.method,
        reason: form.reason.trim(),
        transactionRef: form.transactionRef.trim() || undefined,
        producerId,
        eventId
      })
      flash('Solicitação de estorno registrada com sucesso!')
      setShowAdd(false)
      setForm({ orderCode: '', amountReais: '', kind: 'total', method: 'credito', reason: '', transactionRef: '' })
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao registrar estorno.')
    }
  }

  async function handleApprove(id: number) {
    try {
      await approveFinanceDisputesRefund(id)
      flash('Estorno aprovado internamente!')
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao aprovar estorno.')
    }
  }

  async function handleProcess(id: number) {
    try {
      const res = await processFinanceDisputesRefund(id)
      flash(res.message || 'Solicitação enviada ao gateway/adquirente!')
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao enviar estorno ao gateway.')
    }
  }

  async function handleComplete(id: number) {
    try {
      await completeFinanceDisputesRefund(id)
      flash('Estorno confirmado pelo provedor e baixado no saldo!')
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao confirmar conclusão do estorno.')
    }
  }

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Central de Estornos & Devoluções</h2>
          <p>Fluxo auditado: Solicitação ➔ Aprovação ➔ Envio ao Gateway ➔ Confirmação Real do Provedor.</p>
        </div>
        <button className="fa-btn primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? <X size={16} /> : <Plus size={16} />}
          {showAdd ? 'Cancelar' : 'Solicitar Estorno'}
        </button>
      </div>

      {showAdd && (
        <form className="findisp-form-box" onSubmit={handleCreate}>
          <h3>Nova Solicitação de Estorno / Reembolso</h3>
          <div className="finance360-form">
            <div className="finance360-field">
              <span>Código do Pedido</span>
              <input
                type="text"
                placeholder="Ex: PED-100293"
                value={form.orderCode}
                onChange={e => setForm({ ...form, orderCode: e.target.value })}
                required
              />
            </div>
            <div className="finance360-field">
              <span>Valor do Estorno (R$)</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ex: 250.00"
                value={form.amountReais}
                onChange={e => setForm({ ...form, amountReais: e.target.value })}
                required
              />
            </div>
            <div className="finance360-field">
              <span>Tipo de Estorno</span>
              <select
                value={form.kind}
                onChange={e => setForm({ ...form, kind: e.target.value as any })}
              >
                <option value="total">Total (100% do pedido)</option>
                <option value="parcial">Parcial (Taxa/Item cancelado)</option>
              </select>
            </div>
            <div className="finance360-field">
              <span>Meio de Pagamento Original</span>
              <select
                value={form.method}
                onChange={e => setForm({ ...form, method: e.target.value })}
              >
                <option value="credito">Cartão de Crédito</option>
                <option value="pix">PIX</option>
                <option value="debito">Cartão de Débito</option>
              </select>
            </div>
            <div className="finance360-field" style={{ gridColumn: 'span 2' }}>
              <span>Motivo / Justificativa</span>
              <input
                type="text"
                placeholder="Ex: Cancelamento no prazo de arrependimento (CDC art. 49)"
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="findisp-form-actions">
            <button className="fa-btn secondary" type="button" onClick={() => setShowAdd(false)}>Cancelar</button>
            <button className="fa-btn primary" type="submit">Cadastrar Solicitação</button>
          </div>
        </form>
      )}

      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código / Pedido</th>
              <th>Data</th>
              <th>Tipo / Meio</th>
              <th>Motivo</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações Operacionais</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map(r => (
              <tr key={r.id}>
                <td>
                  <strong>{r.code}</strong>
                  <small>Pedido: {r.orderCode}</small>
                </td>
                <td>{new Date(r.createdAt).toLocaleString('pt-BR')}</td>
                <td>
                  <strong>{r.kind.toUpperCase()}</strong>
                  <small>{r.method}</small>
                </td>
                <td>{r.reason}</td>
                <td><strong>{money(r.amountCents)}</strong></td>
                <td>
                  <span className={`fa-status ${r.status}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  <div className="fa-actions">
                    {['solicitado', 'requested'].includes(r.status) && (
                      <button className="fa-btn tiny" onClick={() => handleApprove(r.id)}>Aprovar</button>
                    )}
                    {['aprovado', 'approved'].includes(r.status) && (
                      <button className="fa-btn tiny primary" onClick={() => handleProcess(r.id)}>Enviar ao Gateway</button>
                    )}
                    {['aguardando_gateway', 'processing'].includes(r.status) && (
                      <button className="fa-btn tiny success" onClick={() => handleComplete(r.id)}>Confirmar Estorno Real</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!refunds.length && (
        <div className="finops360-empty">Nenhum estorno ou devolução registrada.</div>
      )}
    </section>
  )
}

// ==========================================
// ABA 2: CHARGEBACKS & DISPUTAS
// ==========================================
function ChargebacksTab({
  chargebacks,
  producerId,
  eventId,
  reload,
  flash
}: {
  chargebacks: FinanceChargeback[]
  producerId?: number
  eventId?: number
  reload: () => Promise<void>
  flash: (m: string) => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [defending, setDefending] = useState<FinanceChargeback | null>(null)
  const [evidenceNotes, setEvidenceNotes] = useState('')
  const [evidenceUrls, setEvidenceUrls] = useState('')

  const [form, setForm] = useState({
    orderCode: '',
    amountReais: '',
    cardBrand: 'Mastercard',
    cardLast4: '4321',
    reason: 'Fraude alegada pelo titular do cartão',
    slaDays: '7'
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const cents = Math.round(parseFloat(form.amountReais || '0') * 100)
    if (cents <= 0) return flash('Informe um valor válido.')

    try {
      await createFinanceChargeback({
        orderCode: form.orderCode.trim(),
        amountCents: cents,
        cardBrand: form.cardBrand,
        cardLast4: form.cardLast4,
        reason: form.reason.trim(),
        slaDays: parseInt(form.slaDays, 10) || 7,
        producerId,
        eventId
      })
      flash('Chargeback registrado para acompanhamento de disputa!')
      setShowAdd(false)
      setForm({ orderCode: '', amountReais: '', cardBrand: 'Mastercard', cardLast4: '4321', reason: 'Fraude alegada pelo titular do cartão', slaDays: '7' })
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao registrar chargeback.')
    }
  }

  async function handleSendEvidence() {
    if (!defending) return
    if (!evidenceNotes.trim()) return flash('Descreva as evidências de defesa.')

    try {
      await submitChargebackEvidence(defending.id, {
        evidenceNotes: evidenceNotes.trim(),
        evidenceUrls: evidenceUrls.trim() || undefined
      })
      flash('Dossiê de defesa e evidências enviado para a bandeira/adquirente!')
      setDefending(null)
      setEvidenceNotes('')
      setEvidenceUrls('')
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao enviar evidências.')
    }
  }

  async function handleResolve(id: number, decision: 'chargeback_won' | 'chargeback_lost') {
    try {
      await resolveFinanceChargeback(id, { decision })
      flash(decision === 'chargeback_won' ? 'Disputa GANHA! Valor mantido na conta do produtor.' : 'Disputa PERDIDA. Valor debitado do saldo com reversão contábil.')
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao resolver chargeback.')
    }
  }

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Chargebacks & Contestações de Cartão</h2>
          <p>Acompanhe disputas abertas por adquirentes, controle prazos de SLA e envie dossiês de defesa.</p>
        </div>
        <button className="fa-btn primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? <X size={16} /> : <Plus size={16} />}
          {showAdd ? 'Cancelar' : 'Notificar Chargeback'}
        </button>
      </div>

      {showAdd && (
        <form className="findisp-form-box" onSubmit={handleCreate}>
          <h3>Registrar Notificação de Chargeback</h3>
          <div className="finance360-form">
            <div className="finance360-field">
              <span>Código do Pedido</span>
              <input
                type="text"
                placeholder="Ex: PED-100450"
                value={form.orderCode}
                onChange={e => setForm({ ...form, orderCode: e.target.value })}
                required
              />
            </div>
            <div className="finance360-field">
              <span>Valor em Disputa (R$)</span>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 480.00"
                value={form.amountReais}
                onChange={e => setForm({ ...form, amountReais: e.target.value })}
                required
              />
            </div>
            <div className="finance360-field">
              <span>Bandeira / Final</span>
              <input
                type="text"
                placeholder="Ex: Visa final 8821"
                value={`${form.cardBrand} ${form.cardLast4}`}
                onChange={e => setForm({ ...form, cardBrand: e.target.value })}
              />
            </div>
            <div className="finance360-field">
              <span>Prazo de Defesa (Dias)</span>
              <input
                type="number"
                min="1"
                max="30"
                value={form.slaDays}
                onChange={e => setForm({ ...form, slaDays: e.target.value })}
              />
            </div>
            <div className="finance360-field" style={{ gridColumn: 'span 2' }}>
              <span>Motivo da Contestação</span>
              <input
                type="text"
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="findisp-form-actions">
            <button className="fa-btn secondary" type="button" onClick={() => setShowAdd(false)}>Cancelar</button>
            <button className="fa-btn primary" type="submit">Salvar Chargeback</button>
          </div>
        </form>
      )}

      {defending && (
        <div className="finset-modal-backdrop">
          <div className="finset-modal">
            <div className="finset-modal-head">
              <h3>Dossiê de Defesa: {defending.code}</h3>
              <button className="fa-btn tiny" onClick={() => setDefending(null)}><X size={14} /></button>
            </div>
            <p className="findisp-modal-desc">
              Pedido: <strong>{defending.orderCode}</strong> | Valor: <strong>{money(defending.amountCents)}</strong>
            </p>
            <div className="finance360-field" style={{ marginBottom: 14 }}>
              <span>Relatório de Evidências (Log de compra, IP, ingresso utilizado, etc.)</span>
              <textarea
                rows={4}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                placeholder="Ex: Ingresso nominal validado na catraca via check-in facial em 20/08 às 21h15..."
                value={evidenceNotes}
                onChange={e => setEvidenceNotes(e.target.value)}
              />
            </div>
            <div className="finance360-field" style={{ marginBottom: 16 }}>
              <span>Links de Comprovantes / PDFs (opcional)</span>
              <input
                type="text"
                placeholder="https://..."
                value={evidenceUrls}
                onChange={e => setEvidenceUrls(e.target.value)}
              />
            </div>
            <div className="finset-form-actions">
              <button className="fa-btn secondary" onClick={() => setDefending(null)}>Cancelar</button>
              <button className="fa-btn primary" onClick={handleSendEvidence}>
                <Send size={14} /> Enviar Defesa para Adquirente
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código / Pedido</th>
              <th>Cartão</th>
              <th>Motivo</th>
              <th>SLA Limite</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações de Defesa / Resolução</th>
            </tr>
          </thead>
          <tbody>
            {chargebacks.map(c => (
              <tr key={c.id}>
                <td>
                  <strong>{c.code}</strong>
                  <small>Pedido: {c.orderCode}</small>
                </td>
                <td>{c.cardBrand} {c.cardLast4 ? `• ${c.cardLast4}` : ''}</td>
                <td>{c.reason}</td>
                <td>
                  {c.slaDeadline ? (
                    <span className="findisp-sla-badge">
                      <Clock size={12} />
                      {new Date(c.slaDeadline).toLocaleDateString('pt-BR')}
                    </span>
                  ) : '—'}
                </td>
                <td><strong>{money(c.amountCents)}</strong></td>
                <td>
                  <span className={`fa-status ${c.status}`}>
                    {c.status}
                  </span>
                </td>
                <td>
                  <div className="fa-actions">
                    {['disputed', 'evidence_required'].includes(c.status) && (
                      <button className="fa-btn tiny" onClick={() => setDefending(c)}>
                        <FileText size={12} /> Montar Defesa
                      </button>
                    )}
                    {['disputed', 'evidence_sent'].includes(c.status) && (
                      <>
                        <button className="fa-btn tiny success" onClick={() => handleResolve(c.id, 'chargeback_won')}>Ganha</button>
                        <button className="fa-btn tiny danger" onClick={() => handleResolve(c.id, 'chargeback_lost')}>Perdida</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!chargebacks.length && (
        <div className="finops360-empty">Nenhum chargeback ou contestação ativa.</div>
      )}
    </section>
  )
}

// ==========================================
// ABA 3: IMPACTO FINANCEIRO & REVERSÕES
// ==========================================
function FinancialImpactTab({
  summary,
  refunds,
  chargebacks
}: {
  summary: FinanceDisputesSummary | null
  refunds: RefundRequest[]
  chargebacks: FinanceChargeback[]
}) {
  const completedRefunds = refunds.filter(r => ['estornado', 'refunded', 'parcialmente_estornado'].includes(r.status))
  const lostChargebacks = chargebacks.filter(c => c.status === 'chargeback_lost')

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Impacto Financeiro, Saldo & Reversões</h2>
          <p>Resumo contábil das baixas de recebíveis, saídas de caixa e ajustes de borderô decorrentes de exceções.</p>
        </div>
      </div>

      <div className="findisp-impact-grid">
        <div className="findisp-impact-card">
          <h3>Total Revertido em Estornos</h3>
          <strong>{money(summary?.totalCompletedRefundCents)}</strong>
          <p>{completedRefunds.length} transações baixadas de entrada de vendas.</p>
        </div>
        <div className="findisp-impact-card danger">
          <h3>Prejuízo por Chargebacks Perdidos</h3>
          <strong>{money(summary?.lostChargebacksCents)}</strong>
          <p>{lostChargebacks.length} contestações com débito definitivo no saldo do produtor.</p>
        </div>
        <div className="findisp-impact-card success">
          <h3>Valores Preservados com Defesa</h3>
          <strong>{money(summary?.wonChargebacksCents)}</strong>
          <p>Disputas vencidas após apresentação tempestiva de evidências.</p>
        </div>
      </div>

      <h3 className="finops360-subtitle">Trilha de Reversões Efetuadas</h3>
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Origem</th>
              <th>Referência</th>
              <th>Tipo de Reversão</th>
              <th>Impacto Contábil</th>
              <th>Valor Debitado</th>
            </tr>
          </thead>
          <tbody>
            {completedRefunds.map(r => (
              <tr key={`ref-${r.id}`}>
                <td>Estorno de Pedido</td>
                <td>{r.orderCode} ({r.code})</td>
                <td>Reversão de Venda ({r.kind})</td>
                <td>Débito em Caixa / Conta Provedor</td>
                <td><strong>-{money(r.amountCents)}</strong></td>
              </tr>
            ))}
            {lostChargebacks.map(c => (
              <tr key={`chg-${c.id}`}>
                <td>Contestação Bancária</td>
                <td>{c.orderCode} ({c.code})</td>
                <td>Chargeback Definitivo</td>
                <td>Débito no Saldo Disponível do Produtor</td>
                <td><strong className="finops360-negative">-{money(c.amountCents + c.feeCents)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!completedRefunds.length && !lostChargebacks.length && (
        <div className="finops360-empty">Nenhuma reversão financeira realizada no período.</div>
      )}
    </section>
  )
}

// ==========================================
// ABA 4: WEBHOOKS & LOGS PROVEDOR
// ==========================================
function WebhooksTab({
  producerId,
  reload,
  flash
}: {
  producerId?: number
  reload: () => Promise<void>
  flash: (m: string) => void
}) {
  const [orderCode, setOrderCode] = useState('PED-100293')
  const [provider, setProvider] = useState('Pagar.me')
  const [eventType, setEventType] = useState('refund.completed')

  async function handleSimulateWebhook() {
    const eventId = `EVT-${Date.now()}`
    try {
      const res = await sendPaymentWebhook({
        provider,
        eventId,
        eventType,
        orderCode,
        payload: { simulated: true, eventId, timestamp: new Date().toISOString() }
      })
      flash(`Webhook recebido com sucesso (Idempotência verificada: ${res.status})!`)
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao processar webhook.')
    }
  }

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Webhooks & Notificações Assíncronas de Provedores</h2>
          <p>Recepção idempotente de eventos de gateway, adquirentes e bandeiras para atualização de estornos em tempo real.</p>
        </div>
      </div>

      <div className="findisp-form-box">
        <h3>Simulador de Webhook do Gateway (Idempotente)</h3>
        <div className="finance360-form">
          <div className="finance360-field">
            <span>Provedor</span>
            <select value={provider} onChange={e => setProvider(e.target.value)}>
              <option value="Pagar.me">Pagar.me</option>
              <option value="Stone">Stone</option>
              <option value="Cielo">Cielo</option>
              <option value="MercadoPago">Mercado Pago</option>
            </select>
          </div>
          <div className="finance360-field">
            <span>Tipo de Evento</span>
            <select value={eventType} onChange={e => setEventType(e.target.value)}>
              <option value="refund.completed">refund.completed (Estorno Confirmado)</option>
              <option value="chargeback.opened">chargeback.opened (Nova Contestação)</option>
              <option value="chargeback.won">chargeback.won (Disputa Ganha)</option>
            </select>
          </div>
          <div className="finance360-field">
            <span>Pedido Alvo</span>
            <input
              type="text"
              value={orderCode}
              onChange={e => setOrderCode(e.target.value)}
              placeholder="Ex: PED-100293"
            />
          </div>
        </div>
        <div className="findisp-form-actions">
          <button className="fa-btn primary" type="button" onClick={handleSimulateWebhook}>
            <Zap size={16} /> Disparar Webhook de Teste
          </button>
        </div>
      </div>
    </section>
  )
}


// ==========================================
// FASE 25.8: MOTOR ENTERPRISE DE ESTORNOS
// ==========================================
function EnterpriseRefundEngineTab({ summary, refunds }: { summary: FinanceDisputesSummary | null; refunds: RefundRequest[] }) {
  const critical = refunds.filter(r => r.amountCents >= 500000 && !['estornado','refunded','completed'].includes(r.status)).length
  const underReview = refunds.filter(r => ['solicitado','requested','under_review'].includes(r.status)).length
  return (
    <section className="space-y-4" data-refund-engine="25.8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4"><small className="text-slate-500 font-semibold">EM APROVAÇÃO</small><div className="text-2xl font-bold tabular-nums mt-1">{underReview}</div><span className="text-xs text-slate-500">workflow multinível</span></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><small className="text-slate-500 font-semibold">CASOS CRÍTICOS</small><div className="text-2xl font-bold tabular-nums mt-1">{critical}</div><span className="text-xs text-slate-500">alçada nível 3</span></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><small className="text-slate-500 font-semibold">EXPOSIÇÃO</small><div className="text-2xl font-bold tabular-nums mt-1">{money(summary?.totalRequestedRefundCents)}</div><span className="text-xs text-slate-500">solicitações registradas</span></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><small className="text-slate-500 font-semibold">LEDGER</small><div className="text-lg font-bold mt-2 text-emerald-700">Imutável</div><span className="text-xs text-slate-500">somente compensações</span></div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4"><ShieldCheck size={18}/><div><h3 className="font-bold text-slate-900">Política de alçadas e segregação</h3><p className="text-xs text-slate-500">Aprovação progressiva por exposição financeira.</p></div></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3"><b>Nível 1</b><p className="text-xs text-slate-500 mt-1">Até R$ 999,99 · 1 aprovação</p></div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3"><b>Nível 2</b><p className="text-xs text-slate-500 mt-1">R$ 1.000 a R$ 4.999,99 · 2 aprovações</p></div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3"><b>Nível 3</b><p className="text-xs text-slate-500 mt-1">A partir de R$ 5.000 · 3 aprovações</p></div>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-bold text-slate-900 mb-4">Pipeline de reversão financeira</h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-center text-xs">
          {['Elegibilidade','Bloqueio','Reversão Split','Reservas','Gateway','Ledger','Conciliação'].map((x,i)=><div key={x} className="rounded-lg border border-slate-200 bg-slate-50 p-3"><span className="block text-slate-400 mb-1">0{i+1}</span><b>{x}</b></div>)}
        </div>
        <div className="mt-4 flex gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900"><AlertTriangle size={15} className="shrink-0"/> Nenhum saldo é editado diretamente. Toda correção financeira deve gerar lançamento compensatório rastreável e auditável.</div>
      </div>
    </section>
  )
}
