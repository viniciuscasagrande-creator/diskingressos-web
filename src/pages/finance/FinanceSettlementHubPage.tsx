import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRightLeft, CheckCircle2, Clock, DollarSign,
  Plus, RefreshCw, Send, ShieldCheck, TrendingUp, AlertTriangle, X, Play, ArrowLeft
} from 'lucide-react'
import {
  getFinanceSettlementSummary, getFinanceSplits, createFinanceSplit, updateFinanceSplit, simulateFinanceSplit,
  getFinanceSettlementPayouts, createFinanceSettlementPayout, approveFinanceSettlementPayout, scheduleFinanceSettlementPayout,
  payFinanceSettlementPayout, cancelFinanceSettlementPayout, getFinanceAdvances, simulateFinanceAdvance,
  createFinanceAdvance, approveFinanceAdvance, contractFinanceAdvance, getFinanceSettlements, createFinanceSettlement,
  reconcileFinanceSettlement, getFinanceBankAccounts,
  type FinanceSettlementSummary, type FinanceSplitRule, type SplitSimulationResult,
  type FinanceAdvance, type AdvanceSimulationResult, type FinanceSettlement, type FinanceBankAccount
} from '../../services/api'

type Tab = 'split' | 'payouts' | 'advances' | 'settlements'
type Props = {
  producerId?: number
  eventId?: number
  initialTab?: Tab
  notify?: (message: string) => void
  onBack?: () => void
}

const money = (c = 0) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100)
const pct = (bps = 0) => `${(bps / 100).toFixed(2)}%`

export default function FinanceSettlementHubPage({ producerId, eventId, initialTab = 'split', notify, onBack }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [summary, setSummary] = useState<FinanceSettlementSummary | null>(null)
  const [splits, setSplits] = useState<FinanceSplitRule[]>([])
  const [payouts, setPayouts] = useState<any[]>([])
  const [advances, setAdvances] = useState<FinanceAdvance[]>([])
  const [settlements, setSettlements] = useState<FinanceSettlement[]>([])
  const [bankAccounts, setBankAccounts] = useState<FinanceBankAccount[]>([])

  const flash = (m: string) => notify?.(m)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [s, sp, po, adv, st, ba] = await Promise.all([
        getFinanceSettlementSummary(producerId, eventId),
        getFinanceSplits(producerId, eventId),
        getFinanceSettlementPayouts(producerId),
        getFinanceAdvances(producerId, eventId),
        getFinanceSettlements(producerId, eventId),
        getFinanceBankAccounts(producerId)
      ])
      setSummary(s)
      setSplits(sp)
      setPayouts(po)
      setAdvances(adv)
      setSettlements(st)
      setBankAccounts(ba)
    } catch (e: any) {
      setError(e.message || 'Falha ao carregar dados operacionais da liquidação.')
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
    <div className="finset-page">
      {/* Back Button */}
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => (onBack ? onBack() : window.history.back())}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-[#334155] text-slate-700 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>
      </div>

      <header className="finset-hero">
        <div>
          <span>FINANCEIRO 360° · FASE 20.3</span>
          <h1>Split, Repasses, Antecipações e Liquidação</h1>
          <p>Fechamento do ciclo operacional: regras de split, saldo em tempo real, repasses, antecipações e liquidação auditada.</p>
        </div>
        <div className="finset-hero-actions">
          <button className="fa-btn secondary" onClick={load}>
            <RefreshCw size={16} /> Atualizar
          </button>
        </div>
      </header>

      {error && (
        <div className="finance360-alert error">
          <AlertTriangle size={18} />{error}
        </div>
      )}

      <div className="finset-kpis">
        <div className="finset-kpi highlight">
          <DollarSign size={22} />
          <div>
            <small>Saldo Disponível</small>
            <strong>{money(summary?.availableBalanceCents)}</strong>
            <span className="finset-kpi-sub">Bloqueado: {money(summary?.blockedBalanceCents)}</span>
          </div>
        </div>
        <div className="finset-kpi">
          <ArrowRightLeft size={22} />
          <div>
            <small>Split Ativos</small>
            <strong>{summary?.activeSplitsCount || 0} regras</strong>
            <span className="finset-kpi-sub">Total cadastrado: {summary?.totalSplits || 0}</span>
          </div>
        </div>
        <div className="finset-kpi">
          <Clock size={22} />
          <div>
            <small>Repasses Pendentes</small>
            <strong>{money(summary?.pendingPayoutsCents)}</strong>
            <span className="finset-kpi-sub">{summary?.pendingPayoutsCount || 0} solicitações</span>
          </div>
        </div>
        <div className="finset-kpi">
          <TrendingUp size={22} />
          <div>
            <small>Liquidação Prevista</small>
            <strong>{money(summary?.expectedSettlementCents)}</strong>
            <span className="finset-kpi-sub">Conciliado: {money(summary?.reconciledSettlementCents)}</span>
          </div>
        </div>
      </div>

      <nav className="finance360-tabs">
        {([
          ['split', 'Split & Beneficiários'],
          ['payouts', 'Central de Repasses'],
          ['advances', 'Antecipações'],
          ['settlements', 'Liquidações']
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
        <div className="finance360-loading">Carregando ciclo financeiro 360°...</div>
      ) : (
        <>
          {tab === 'split' && (
            <SplitTab
              splits={splits}
              producerId={producerId}
              eventId={eventId}
              reload={load}
              flash={flash}
            />
          )}
          {tab === 'payouts' && (
            <PayoutsTab
              payouts={payouts}
              availableBalanceCents={summary?.availableBalanceCents || 0}
              producerId={producerId}
              bankAccounts={bankAccounts}
              reload={load}
              flash={flash}
            />
          )}
          {tab === 'advances' && (
            <AdvancesTab
              advances={advances}
              producerId={producerId}
              eventId={eventId}
              reload={load}
              flash={flash}
            />
          )}
          {tab === 'settlements' && (
            <SettlementsTab
              settlements={settlements}
              producerId={producerId}
              eventId={eventId}
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
// ABA 1: SPLIT & BENEFICIÁRIOS
// ==========================================
function SplitTab({
  splits,
  producerId,
  eventId,
  reload,
  flash
}: {
  splits: FinanceSplitRule[]
  producerId?: number
  eventId?: number
  reload: () => Promise<void>
  flash: (m: string) => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [simulatingRule, setSimulatingRule] = useState<FinanceSplitRule | null>(null)
  const [simResult, setSimResult] = useState<SplitSimulationResult | null>(null)
  const [simGross, setSimGross] = useState('1000')

  const [form, setForm] = useState({
    title: '',
    recipientName: '',
    recipientDocument: '',
    recipientAccount: '',
    splitType: 'percentage' as 'percentage' | 'fixed',
    splitValuePercent: '10',
    fixedReais: '0',
    feeDeductionMode: 'net' as 'gross' | 'net',
    priority: '1',
    status: 'active' as 'active' | 'draft',
    notes: ''
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.recipientName.trim()) {
      return flash('Informe o título da regra e o nome do beneficiário.')
    }
    try {
      await createFinanceSplit({
        title: form.title.trim(),
        recipientName: form.recipientName.trim(),
        recipientDocument: form.recipientDocument.trim() || undefined,
        recipientAccount: form.recipientAccount.trim() || undefined,
        splitType: form.splitType,
        splitValueBps: Math.round(parseFloat(form.splitValuePercent || '0') * 100),
        fixedCents: Math.round(parseFloat(form.fixedReais || '0') * 100),
        feeDeductionMode: form.feeDeductionMode,
        priority: parseInt(form.priority, 10) || 1,
        status: form.status,
        notes: form.notes.trim() || undefined,
        producerId,
        eventId
      })
      flash('Regra de split criada com sucesso!')
      setShowAdd(false)
      setForm({
        title: '',
        recipientName: '',
        recipientDocument: '',
        recipientAccount: '',
        splitType: 'percentage',
        splitValuePercent: '10',
        fixedReais: '0',
        feeDeductionMode: 'net',
        priority: '1',
        status: 'active',
        notes: ''
      })
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao criar regra de split.')
    }
  }

  async function handleToggleStatus(rule: FinanceSplitRule) {
    const nextStatus = rule.status === 'active' ? 'inactive' : 'active'
    try {
      await updateFinanceSplit(rule.id, { status: nextStatus })
      flash(`Regra "${rule.title}" ${nextStatus === 'active' ? 'ativada' : 'desativada'}.`)
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao alterar status da regra.')
    }
  }

  async function runSimulation(rule: FinanceSplitRule) {
    try {
      const gross = Math.round(parseFloat(simGross || '1000') * 100)
      const res = await simulateFinanceSplit(rule.id, { grossAmountCents: gross, feeBps: 1000 })
      setSimResult(res)
    } catch (err: any) {
      flash(err.message || 'Erro na simulação do split.')
    }
  }

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Divisão de Valores (Split) & Beneficiários</h2>
          <p>Configure percentuais, valores fixos, comissões de parceiros e prioridade de liquidação.</p>
        </div>
        <button className="fa-btn primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? <X size={16} /> : <Plus size={16} />}
          {showAdd ? 'Cancelar' : 'Nova Regra de Split'}
        </button>
      </div>

      {showAdd && (
        <form className="finset-form-box" onSubmit={handleCreate}>
          <h3>Cadastrar Regra de Split</h3>
          <div className="finance360-form">
            <div className="finance360-field">
              <span>Título da Regra</span>
              <input
                type="text"
                placeholder="Ex: Coprodução Seven 20%"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="finance360-field">
              <span>Nome do Beneficiário</span>
              <input
                type="text"
                placeholder="Ex: Seven Entretenimento"
                value={form.recipientName}
                onChange={e => setForm({ ...form, recipientName: e.target.value })}
                required
              />
            </div>
            <div className="finance360-field">
              <span>CPF/CNPJ</span>
              <input
                type="text"
                placeholder="Ex: 00.000.000/0001-99"
                value={form.recipientDocument}
                onChange={e => setForm({ ...form, recipientDocument: e.target.value })}
              />
            </div>
            <div className="finance360-field">
              <span>Chave PIX / Conta Destino</span>
              <input
                type="text"
                placeholder="Ex: financeiro@seven.com.br"
                value={form.recipientAccount}
                onChange={e => setForm({ ...form, recipientAccount: e.target.value })}
              />
            </div>
            <div className="finance360-field">
              <span>Tipo de Split</span>
              <select
                value={form.splitType}
                onChange={e => setForm({ ...form, splitType: e.target.value as any })}
              >
                <option value="percentage">Percentual (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>
            {form.splitType === 'percentage' ? (
              <div className="finance360-field">
                <span>Percentual (%)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100"
                  value={form.splitValuePercent}
                  onChange={e => setForm({ ...form, splitValuePercent: e.target.value })}
                />
              </div>
            ) : (
              <div className="finance360-field">
                <span>Valor Fixo por Transação (R$)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.fixedReais}
                  onChange={e => setForm({ ...form, fixedReais: e.target.value })}
                />
              </div>
            )}
            <div className="finance360-field">
              <span>Base de Cálculo</span>
              <select
                value={form.feeDeductionMode}
                onChange={e => setForm({ ...form, feeDeductionMode: e.target.value as any })}
              >
                <option value="net">Líquido (Após taxas da plataforma)</option>
                <option value="gross">Bruto (Sobre valor facial total)</option>
              </select>
            </div>
            <div className="finance360-field">
              <span>Prioridade</span>
              <input
                type="number"
                min="1"
                max="99"
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
              />
            </div>
          </div>
          <div className="finset-form-actions">
            <button className="fa-btn secondary" type="button" onClick={() => setShowAdd(false)}>Cancelar</button>
            <button className="fa-btn primary" type="submit">Salvar Regra de Split</button>
          </div>
        </form>
      )}

      {simulatingRule && (
        <div className="finset-modal-backdrop">
          <div className="finset-modal">
            <div className="finset-modal-head">
              <h3>Simulação de Split: {simulatingRule.title}</h3>
              <button className="fa-btn tiny" onClick={() => { setSimulatingRule(null); setSimResult(null) }}><X size={14} /></button>
            </div>
            <div className="finset-sim-form">
              <label>
                Valor da Venda Simulado (R$):
                <input
                  type="number"
                  step="0.01"
                  value={simGross}
                  onChange={e => setSimGross(e.target.value)}
                />
              </label>
              <button className="fa-btn primary" onClick={() => runSimulation(simulatingRule)}>
                <Play size={14} /> Calcular Divisão
              </button>
            </div>
            {simResult && (
              <div className="finset-sim-result">
                <div className="finset-sim-row"><span>Valor Bruto da Venda:</span><strong>{money(simResult.grossAmountCents)}</strong></div>
                <div className="finset-sim-row"><span>Taxa Plataforma (10%):</span><span>-{money(simResult.platformFeeCents)}</span></div>
                <div className="finset-sim-row"><span>Valor Líquido Base:</span><strong>{money(simResult.netAmountCents)}</strong></div>
                <div className="finset-sim-row highlight"><span>Parte do Beneficiário ({simulatingRule.recipientName}):</span><strong>{money(simResult.recipientShareCents)}</strong></div>
                <div className="finset-sim-row success"><span>Saldo Restante Produtor:</span><strong>{money(simResult.producerRemainingCents)}</strong></div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Prioridade</th>
              <th>Regra / Beneficiário</th>
              <th>Documento / Conta</th>
              <th>Divisão</th>
              <th>Base</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {splits.map(r => (
              <tr key={r.id}>
                <td><strong>#{r.priority}</strong></td>
                <td>
                  <strong>{r.title}</strong>
                  <small>{r.recipientName}</small>
                </td>
                <td>
                  <span>{r.recipientDocument || '—'}</span>
                  <small>{r.recipientAccount || 'Sem chave PIX'}</small>
                </td>
                <td>
                  <strong>{r.splitType === 'percentage' ? pct(r.splitValueBps) : money(r.fixedCents)}</strong>
                </td>
                <td>
                  <span className="finset-badge-sub">{r.feeDeductionMode === 'gross' ? 'Bruto' : 'Líquido'}</span>
                </td>
                <td>
                  <span className={`fa-status ${r.status}`}>
                    {r.status === 'active' ? 'Ativo' : r.status === 'draft' ? 'Rascunho' : 'Inativo'}
                  </span>
                </td>
                <td>
                  <div className="fa-actions">
                    <button
                      className="fa-btn tiny"
                      onClick={() => {
                        setSimulatingRule(r)
                        runSimulation(r)
                      }}
                      title="Simular divisão"
                    >
                      Simular
                    </button>
                    <button
                      className="fa-btn tiny"
                      onClick={() => handleToggleStatus(r)}
                    >
                      {r.status === 'active' ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!splits.length && (
        <div className="finops360-empty">Nenhuma regra de split configurada para este produtor/evento.</div>
      )}
    </section>
  )
}

// ==========================================
// ABA 2: CENTRAL DE REPASSES
// ==========================================
function PayoutsTab({
  payouts,
  availableBalanceCents,
  producerId,
  bankAccounts,
  reload,
  flash
}: {
  payouts: any[]
  availableBalanceCents: number
  producerId?: number
  bankAccounts: FinanceBankAccount[]
  reload: () => Promise<void>
  flash: (m: string) => void
}) {
  const [showRequest, setShowRequest] = useState(false)
  const [amount, setAmount] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [notes, setNotes] = useState('')

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault()
    const cents = Math.round(parseFloat(amount || '0') * 100)
    if (cents <= 0) return flash('Informe um valor válido.')
    if (cents > availableBalanceCents) {
      return flash(`Valor excede o saldo disponível de ${money(availableBalanceCents)}.`)
    }

    try {
      await createFinanceSettlementPayout({
        amountCents: cents,
        bankAccount: bankAccount.trim() || undefined,
        notes: notes.trim() || undefined,
        producerId
      })
      flash('Solicitação de repasse enviada com sucesso!')
      setShowRequest(false)
      setAmount('')
      setBankAccount('')
      setNotes('')
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao solicitar repasse.')
    }
  }

  async function handleApprove(id: number) {
    try {
      await approveFinanceSettlementPayout(id)
      flash('Repasse aprovado!')
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao aprovar repasse.')
    }
  }

  async function handleSchedule(id: number) {
    try {
      await scheduleFinanceSettlementPayout(id)
      flash('Repasse agendado para liquidação!')
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao agendar repasse.')
    }
  }

  async function handlePay(id: number) {
    try {
      await payFinanceSettlementPayout(id)
      flash('Repasse marcado como PAGO e liquidado!')
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao liquidar repasse.')
    }
  }

  async function handleCancel(id: number) {
    try {
      await cancelFinanceSettlementPayout(id)
      flash('Repasse cancelado.')
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao cancelar repasse.')
    }
  }

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Central de Repasses & Transferências</h2>
          <p>Solicite, aprove e efetue a liquidação de repasses para a conta bancária do produtor.</p>
        </div>
        <button className="fa-btn primary" onClick={() => { if (!showRequest && !bankAccount) { const primary=bankAccounts.find(b=>b.isPrimary&&b.status==='ativo')||bankAccounts.find(b=>b.status==='ativo'); if(primary) setBankAccount(`${primary.bankName} - Ag ${primary.agency} Conta ${primary.accountNumber}${primary.pixKey?` - PIX ${primary.pixKey}`:''}`) } setShowRequest(!showRequest) }}>
          {showRequest ? <X size={16} /> : <Plus size={16} />}
          {showRequest ? 'Fechar' : 'Solicitar Repasse'}
        </button>
      </div>

      {showRequest && (
        <form className="finset-form-box" onSubmit={handleRequest}>
          <div className="finset-balance-callout">
            <span>Saldo Disponível para Repasse:</span>
            <strong>{money(availableBalanceCents)}</strong>
          </div>
          <div className="finance360-form">
            <div className="finance360-field">
              <span>Valor do Repasse (R$)</span>
              <input
                type="number"
                step="0.01"
                min="1"
                max={availableBalanceCents / 100}
                placeholder="Ex: 5000.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="finance360-field">
              <span>Conta Destino / Chave PIX</span>
              {bankAccounts.filter(b=>b.status==='ativo').length ? (
                <select value={bankAccount} onChange={e=>setBankAccount(e.target.value)} required>
                  <option value="">Selecione a conta cadastrada</option>
                  {bankAccounts.filter(b=>b.status==='ativo').map(b=>{const label=`${b.bankName} - Ag ${b.agency} Conta ${b.accountNumber}${b.pixKey?` - PIX ${b.pixKey}`:''}`;return <option key={b.id} value={label}>{b.isPrimary?'★ ':''}{label}</option>})}
                </select>
              ) : (
                <input type="text" placeholder="Cadastre uma conta bancária ou informe o destino" value={bankAccount} onChange={e=>setBankAccount(e.target.value)} required />
              )}
            </div>
            <div className="finance360-field" style={{ gridColumn: 'span 2' }}>
              <span>Observações Operacionais</span>
              <input
                type="text"
                placeholder="Ex: Repasse referente ao primeiro lote"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="finset-form-actions">
            <button className="fa-btn secondary" type="button" onClick={() => setShowRequest(false)}>Cancelar</button>
            <button className="fa-btn primary" type="submit">Confirmar Solicitação de Repasse</button>
          </div>
        </form>
      )}

      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Data / Solicitante</th>
              <th>Conta Destino</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações Operacionais</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map(p => (
              <tr key={p.id}>
                <td><strong>{p.code}</strong></td>
                <td>
                  <span>{new Date(p.requestedAt || p.createdAt).toLocaleString('pt-BR')}</span>
                  <small>{p.notes || p.producer?.name || '—'}</small>
                </td>
                <td>{p.bankAccount || 'Conta padrão cadastrada'}</td>
                <td><strong>{money(p.amountCents)}</strong></td>
                <td>
                  <span className={`fa-status ${p.status}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <div className="fa-actions">
                    {['solicitado', 'requested', 'under_review'].includes(p.status) && (
                      <button className="fa-btn tiny" onClick={() => handleApprove(p.id)}>Aprovar</button>
                    )}
                    {p.status === 'approved' && (
                      <button className="fa-btn tiny" onClick={() => handleSchedule(p.id)}>Agendar</button>
                    )}
                    {['approved', 'scheduled'].includes(p.status) && (
                      <button className="fa-btn tiny primary" onClick={() => handlePay(p.id)}>Efetuar Pagamento</button>
                    )}
                    {!['paid', 'cancelled'].includes(p.status) && (
                      <button className="fa-btn tiny" onClick={() => handleCancel(p.id)}>Cancelar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!payouts.length && (
        <div className="finops360-empty">Nenhum repasse registrado para este produtor.</div>
      )}
    </section>
  )
}

// ==========================================
// ABA 3: ANTECIPAÇÕES
// ==========================================
function AdvancesTab({
  advances,
  producerId,
  eventId,
  reload,
  flash
}: {
  advances: FinanceAdvance[]
  producerId?: number
  eventId?: number
  reload: () => Promise<void>
  flash: (m: string) => void
}) {
  const [simulation, setSimulation] = useState<AdvanceSimulationResult | null>(null)
  const [requestedValue, setRequestedValue] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSimulate() {
    try {
      const res = await simulateFinanceAdvance(producerId, eventId)
      setSimulation(res)
      setRequestedValue((res.totalEligibleCents / 100).toFixed(2))
    } catch (err: any) {
      flash(err.message || 'Erro ao simular recebíveis elegíveis.')
    }
  }

  useEffect(() => {
    handleSimulate()
  }, [producerId, eventId])

  async function handleRequestAdvance() {
    const cents = Math.round(parseFloat(requestedValue || '0') * 100)
    if (cents <= 0) return flash('Informe um valor de antecipação válido.')
    try {
      await createFinanceAdvance({
        requestedAmountCents: cents,
        feeBps: simulation?.feeBps || 250,
        notes: notes.trim() || undefined,
        producerId,
        eventId
      })
      flash('Solicitação de antecipação criada!')
      setNotes('')
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao criar solicitação de antecipação.')
    }
  }

  async function handleApprove(id: number) {
    try {
      await approveFinanceAdvance(id)
      flash('Antecipação aprovada!')
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao aprovar antecipação.')
    }
  }

  async function handleContract(id: number) {
    try {
      await contractFinanceAdvance(id)
      flash('Antecipação contratada com sucesso! Saldo creditado.')
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao contratar antecipação.')
    }
  }

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Antecipação de Recebíveis Futuros</h2>
          <p>Simule a antecipação de títulos a receber, aprove limites e contrate a liberação imediata no saldo.</p>
        </div>
      </div>

      <div className="finset-sim-box">
        <div className="finset-sim-col">
          <h3>Simulador de Elegibilidade</h3>
          <p>Recebíveis futuros elegíveis identificados na agenda de vendas.</p>
          <div className="finset-stat-row">
            <span>Títulos elegíveis:</span>
            <strong>{simulation?.eligibleReceivablesCount || 0} títulos</strong>
          </div>
          <div className="finset-stat-row">
            <span>Valor Bruto Elegível:</span>
            <strong>{money(simulation?.totalEligibleCents)}</strong>
          </div>
          <div className="finset-stat-row">
            <span>Taxa de Antecipação:</span>
            <span>{pct(simulation?.feeBps)} (-{money(simulation?.feeCents)})</span>
          </div>
          <div className="finset-stat-row highlight">
            <span>Valor Líquido a Receber:</span>
            <strong>{money(simulation?.netAmountCents)}</strong>
          </div>
        </div>

        <div className="finset-sim-col">
          <h3>Solicitar Antecipação</h3>
          <label>
            Valor a Antecipar (R$):
            <input
              type="number"
              step="0.01"
              max={(simulation?.totalEligibleCents || 0) / 100}
              value={requestedValue}
              onChange={e => setRequestedValue(e.target.value)}
            />
          </label>
          <label>
            Motivo / Observações:
            <input
              type="text"
              placeholder="Ex: Cobertura de custos de produção"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </label>
          <button
            className="fa-btn primary"
            disabled={!simulation?.totalEligibleCents}
            onClick={handleRequestAdvance}
          >
            <Send size={16} /> Solicitar Contratação
          </button>
        </div>
      </div>

      <h3 className="finops360-subtitle">Histórico de Antecipações</h3>
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Data</th>
              <th>Bruto</th>
              <th>Taxa</th>
              <th>Líquido</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {advances.map(a => (
              <tr key={a.id}>
                <td><strong>{a.code}</strong></td>
                <td>{new Date(a.createdAt).toLocaleString('pt-BR')}</td>
                <td>{money(a.requestedAmountCents)}</td>
                <td>{pct(a.feeBps)} ({money(a.feeCents)})</td>
                <td><strong>{money(a.netAmountCents)}</strong></td>
                <td><span className={`fa-status ${a.status}`}>{a.status}</span></td>
                <td>
                  <div className="fa-actions">
                    {a.status === 'requested' && (
                      <button className="fa-btn tiny" onClick={() => handleApprove(a.id)}>Aprovar</button>
                    )}
                    {['requested', 'approved'].includes(a.status) && (
                      <button className="fa-btn tiny primary" onClick={() => handleContract(a.id)}>Contratar & Liberar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!advances.length && (
        <div className="finops360-empty">Nenhuma antecipação realizada até o momento.</div>
      )}
    </section>
  )
}

// ==========================================
// ABA 4: LIQUIDAÇÕES
// ==========================================
function SettlementsTab({
  settlements,
  producerId,
  eventId,
  reload,
  flash
}: {
  settlements: FinanceSettlement[]
  producerId?: number
  eventId?: number
  reload: () => Promise<void>
  flash: (m: string) => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    gatewayName: 'Pagar.me',
    acquirerName: 'Stone',
    batchRef: '',
    expectedReais: '1000',
    expectedDate: new Date().toISOString().split('T')[0]
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createFinanceSettlement({
        gatewayName: form.gatewayName,
        acquirerName: form.acquirerName || undefined,
        batchRef: form.batchRef || undefined,
        expectedCents: Math.round(parseFloat(form.expectedReais || '0') * 100),
        expectedDate: form.expectedDate,
        producerId,
        eventId
      })
      flash('Lote de liquidação registrado com sucesso!')
      setShowAdd(false)
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao registrar lote de liquidação.')
    }
  }

  async function handleReconcile(id: number) {
    try {
      await reconcileFinanceSettlement(id, {})
      flash('Lote liquidado e conciliado com sucesso!')
      await reload()
    } catch (err: any) {
      flash(err.message || 'Erro ao conciliar liquidação.')
    }
  }

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Agenda de Liquidações por Gateway / Adquirente</h2>
          <p>Acompanhe o fechamento dos lotes de recebimento entre os provedores de pagamento e a conta bancária.</p>
        </div>
        <button className="fa-btn primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? <X size={16} /> : <Plus size={16} />}
          {showAdd ? 'Cancelar' : 'Novo Lote de Liquidação'}
        </button>
      </div>

      {showAdd && (
        <form className="finset-form-box" onSubmit={handleCreate}>
          <h3>Registrar Lote de Liquidação</h3>
          <div className="finance360-form">
            <div className="finance360-field">
              <span>Gateway</span>
              <input
                type="text"
                value={form.gatewayName}
                onChange={e => setForm({ ...form, gatewayName: e.target.value })}
                required
              />
            </div>
            <div className="finance360-field">
              <span>Adquirente</span>
              <input
                type="text"
                value={form.acquirerName}
                onChange={e => setForm({ ...form, acquirerName: e.target.value })}
              />
            </div>
            <div className="finance360-field">
              <span>Identificador / Lote</span>
              <input
                type="text"
                placeholder="Ex: BATCH-2026-08-31"
                value={form.batchRef}
                onChange={e => setForm({ ...form, batchRef: e.target.value })}
              />
            </div>
            <div className="finance360-field">
              <span>Valor Previsto (R$)</span>
              <input
                type="number"
                step="0.01"
                value={form.expectedReais}
                onChange={e => setForm({ ...form, expectedReais: e.target.value })}
                required
              />
            </div>
            <div className="finance360-field">
              <span>Data Prevista</span>
              <input
                type="date"
                value={form.expectedDate}
                onChange={e => setForm({ ...form, expectedDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="finset-form-actions">
            <button className="fa-btn secondary" type="button" onClick={() => setShowAdd(false)}>Cancelar</button>
            <button className="fa-btn primary" type="submit">Salvar Lote</button>
          </div>
        </form>
      )}

      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Lote / Código</th>
              <th>Provedor</th>
              <th>Data Prevista</th>
              <th>Previsto</th>
              <th>Realizado</th>
              <th>Diferença</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {settlements.map(s => (
              <tr key={s.id}>
                <td>
                  <strong>{s.code}</strong>
                  <small>{s.batchRef || '—'}</small>
                </td>
                <td>
                  <strong>{s.gatewayName}</strong>
                  <small>{s.acquirerName || 'Adquirente direta'}</small>
                </td>
                <td>{new Date(s.expectedDate).toLocaleDateString('pt-BR')}</td>
                <td>{money(s.expectedCents)}</td>
                <td>{money(s.receivedCents)}</td>
                <td className={s.differenceCents ? 'finops360-negative' : ''}>
                  {money(s.differenceCents)}
                </td>
                <td><span className={`fa-status ${s.status}`}>{s.status}</span></td>
                <td>
                  {s.status !== 'reconciled' && (
                    <button
                      className="fa-btn tiny primary"
                      onClick={() => handleReconcile(s.id)}
                    >
                      <CheckCircle2 size={13} /> Liquidar & Conciliar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!settlements.length && (
        <div className="finops360-empty">Nenhum lote de liquidação pendente.</div>
      )}
    </section>
  )
}
