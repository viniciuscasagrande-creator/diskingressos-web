import { useEffect, useState } from 'react'
import { CreditCard, Landmark, RotateCcw, ServerCog, ShieldCheck, Plus, AlertTriangle } from 'lucide-react'
import {
  getFinancePaymentsSummary, getPaymentGateways, createPaymentGateway, updatePaymentGateway, validatePaymentGateway,
  getCardAcquirers, createCardAcquirer, updateCardAcquirer, getPaymentMethodRules, createPaymentMethodRule, updatePaymentMethodRule,
  getRefundRequests, createRefundRequest, approveRefundRequest, sendRefundToGateway,
  type PaymentGatewayConfig, type CardAcquirer, type PaymentMethodRule, type RefundRequest, type FinancePaymentsSummary
} from '../services/api'

type Tab = 'gateways' | 'operators' | 'methods' | 'refunds'
type Props = { producerId?: number; initialTab?: Tab; notify?: (message: string) => void }
const money = (c: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((c || 0) / 100)
const pct = (bps: number) => `${((bps || 0) / 100).toFixed(2)}%`

export default function FinancePayments360Page({ producerId, initialTab = 'gateways', notify }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState<FinancePaymentsSummary | null>(null)
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([])
  const [operators, setOperators] = useState<CardAcquirer[]>([])
  const [methods, setMethods] = useState<PaymentMethodRule[]>([])
  const [refunds, setRefunds] = useState<RefundRequest[]>([])

  const flash = (m: string) => notify ? notify(m) : undefined

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [s, g, o, m, r] = await Promise.all([
        getFinancePaymentsSummary(producerId),
        getPaymentGateways(producerId),
        getCardAcquirers(producerId),
        getPaymentMethodRules(producerId),
        getRefundRequests(producerId)
      ])
      setSummary(s)
      setGateways(g)
      setOperators(o)
      setMethods(m)
      setRefunds(r)
    } catch (e: any) {
      setError(e.message || 'Falha ao carregar Financeiro 360°')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [producerId])

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  return (
    <div className="finance360-page">
      <header className="finance360-hero">
        <div>
          <span className="finance360-kicker">FINANCEIRO 360° · MODELO OPERACIONAL</span>
          <h1>Pagamentos, Gateways, Operadoras e Estornos</h1>
          <p>Camada financeira inspirada no fluxo do vídeo: configuração, operação, taxas, devoluções e auditoria em um único núcleo.</p>
        </div>
        <button className="fa-btn secondary" onClick={load}>Atualizar</button>
      </header>
      {error && <div className="finance360-alert error"><AlertTriangle size={18} />{error}</div>}
      <div className="finance360-kpis">
        <K title="Gateways ativos" value={`${summary?.activeGateways || 0}/${summary?.gateways || 0}`} icon={ServerCog} />
        <K title="Operadoras ativas" value={`${summary?.activeAcquirers || 0}/${summary?.acquirers || 0}`} icon={Landmark} />
        <K title="Métodos configurados" value={String(summary?.methods || 0)} icon={CreditCard} />
        <K title="Estornos pendentes" value={String(summary?.pendingRefunds || 0)} icon={RotateCcw} />
        <K title="Total estornado" value={money(summary?.refundedCents || 0)} icon={ShieldCheck} />
      </div>
      <nav className="finance360-tabs">
        {([['gateways', 'Gateways'], ['operators', 'Operadoras'], ['methods', 'Métodos de Pagamento'], ['refunds', 'Estornos & Devoluções']] as const).map(([k, l]) => (
          <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </nav>
      {loading ? (
        <div className="finance360-loading">Carregando dados financeiros...</div>
      ) : (
        <>
          {tab === 'gateways' && <Gateways rows={gateways} producerId={producerId} reload={load} flash={flash} />}
          {tab === 'operators' && <Operators rows={operators} producerId={producerId} reload={load} flash={flash} />}
          {tab === 'methods' && <Methods rows={methods} gateways={gateways} operators={operators} producerId={producerId} reload={load} flash={flash} />}
          {tab === 'refunds' && <Refunds rows={refunds} gateways={gateways} operators={operators} producerId={producerId} reload={load} flash={flash} />}
        </>
      )}
    </div>
  )
}

function K({ title, value, icon: Icon }: { title: string; value: string; icon: any }) {
  return (
    <div className="finance360-kpi">
      <span><Icon size={20} /></span>
      <div>
        <small>{title}</small>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: any }) {
  return (
    <label className="finance360-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function Gateways({ rows, producerId, reload, flash }: { rows: PaymentGatewayConfig[]; producerId?: number; reload: () => Promise<void>; flash: (m: string) => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', provider: '', environment: 'sandbox', webhookUrl: '' })

  async function save(e: any) {
    e.preventDefault()
    await createPaymentGateway({ ...form, producerId, status: 'inativo', credentialsConfigured: false })
    setOpen(false)
    setForm({ name: '', provider: '', environment: 'sandbox', webhookUrl: '' })
    flash('Gateway cadastrado. Configure credenciais antes de ativar.')
    await reload()
  }

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Gateway de Pagamentos</h2>
          <p>Ambiente, credenciais, webhook, prioridade e validação de configuração.</p>
        </div>
        <button className="fa-btn primary" onClick={() => setOpen(v => !v)}><Plus size={17} />Novo Gateway</button>
      </div>
      {open && (
        <form className="finance360-form" onSubmit={save}>
          <Field label="Nome"><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Provedor"><input required placeholder="Ex.: Pagar.me, Mercado Pago..." value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} /></Field>
          <Field label="Ambiente">
            <select value={form.environment} onChange={e => setForm({ ...form, environment: e.target.value })}>
              <option value="sandbox">Sandbox</option>
              <option value="producao">Produção</option>
            </select>
          </Field>
          <Field label="Webhook"><input value={form.webhookUrl} onChange={e => setForm({ ...form, webhookUrl: e.target.value })} /></Field>
          <button className="fa-btn primary">Salvar Gateway</button>
        </form>
      )}
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Gateway</th>
              <th>Ambiente</th>
              <th>Credenciais</th>
              <th>Webhook</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>
                  <strong>{r.name}</strong>
                  <small>{r.provider}{r.isPrimary ? ' · principal' : ''}</small>
                </td>
                <td>{r.environment}</td>
                <td>{r.credentialsConfigured ? 'Configuradas' : 'Pendentes'}</td>
                <td>{r.webhookUrl ? 'Configurado' : 'Pendente'}</td>
                <td><span className={`fa-status ${r.status}`}>{r.status}</span></td>
                <td className="fa-actions">
                  <button onClick={async () => { const x = await validatePaymentGateway(r.id); flash(x.message); await reload() }}>Validar</button>
                  <button onClick={async () => { await updatePaymentGateway(r.id, { status: r.status === 'ativo' ? 'inativo' : 'ativo' }); await reload() }}>{r.status === 'ativo' ? 'Desativar' : 'Ativar'}</button>
                  <button onClick={async () => { await updatePaymentGateway(r.id, { isPrimary: true }); await reload() }}>Principal</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Operators({ rows, producerId, reload, flash }: { rows: CardAcquirer[]; producerId?: number; reload: () => Promise<void>; flash: (m: string) => void }) {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: '', code: '', creditCashMdr: '2.50', creditInstallmentMdr: '3.50', debitMdr: '1.50', pixFee: '0.70', settlementDays: '30', anticipation: '1.50' })

  async function save(e: any) {
    e.preventDefault()
    await createCardAcquirer({
      producerId,
      name: f.name,
      code: f.code,
      status: 'ativo',
      creditCashMdrBps: Math.round(+f.creditCashMdr * 100),
      creditInstallmentMdrBps: Math.round(+f.creditInstallmentMdr * 100),
      debitMdrBps: Math.round(+f.debitMdr * 100),
      pixFeeBps: Math.round(+f.pixFee * 100),
      settlementDays: +f.settlementDays,
      anticipationBps: Math.round(+f.anticipation * 100)
    })
    setOpen(false)
    flash('Contrato da operadora salvo.')
    await reload()
  }

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Operadoras / Adquirentes</h2>
          <p>MDR, prazo de liquidação, antecipação e disponibilidade por adquirente.</p>
        </div>
        <button className="fa-btn primary" onClick={() => setOpen(v => !v)}><Plus size={17} />Nova Operadora</button>
      </div>
      {open && (
        <form className="finance360-form dense" onSubmit={save}>
          <Field label="Nome"><input required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Código"><input required value={f.code} onChange={e => setF({ ...f, code: e.target.value })} /></Field>
          <Field label="Crédito à vista %"><input type="number" step="0.01" value={f.creditCashMdr} onChange={e => setF({ ...f, creditCashMdr: e.target.value })} /></Field>
          <Field label="Crédito parcelado %"><input type="number" step="0.01" value={f.creditInstallmentMdr} onChange={e => setF({ ...f, creditInstallmentMdr: e.target.value })} /></Field>
          <Field label="Débito %"><input type="number" step="0.01" value={f.debitMdr} onChange={e => setF({ ...f, debitMdr: e.target.value })} /></Field>
          <Field label="PIX %"><input type="number" step="0.01" value={f.pixFee} onChange={e => setF({ ...f, pixFee: e.target.value })} /></Field>
          <Field label="Liquidação D+"><input type="number" value={f.settlementDays} onChange={e => setF({ ...f, settlementDays: e.target.value })} /></Field>
          <Field label="Antecipação %"><input type="number" step="0.01" value={f.anticipation} onChange={e => setF({ ...f, anticipation: e.target.value })} /></Field>
          <button className="fa-btn primary">Salvar Operadora</button>
        </form>
      )}
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Operadora</th>
              <th>Crédito</th>
              <th>Parcelado</th>
              <th>Débito</th>
              <th>PIX</th>
              <th>Liquidação</th>
              <th>Antecipação</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>
                  <strong>{r.name}</strong>
                  <small>{r.code}</small>
                </td>
                <td>{pct(r.creditCashMdrBps)}</td>
                <td>{pct(r.creditInstallmentMdrBps)}</td>
                <td>{pct(r.debitMdrBps)}</td>
                <td>{pct(r.pixFeeBps)}</td>
                <td>D+{r.settlementDays}</td>
                <td>{pct(r.anticipationBps)}</td>
                <td>
                  <button className={`fa-status ${r.status}`} onClick={async () => { await updateCardAcquirer(r.id, { status: r.status === 'ativo' ? 'inativo' : 'ativo' }); await reload() }}>{r.status}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Methods({ rows, gateways, operators, producerId, reload, flash }: { rows: PaymentMethodRule[]; gateways: PaymentGatewayConfig[]; operators: CardAcquirer[]; producerId?: number; reload: () => Promise<void>; flash: (m: string) => void }) {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ method: 'credito', label: 'Cartão de Crédito', maxInstallments: '12', minimum: '0', gatewayId: '', acquirerId: '' })

  async function save(e: any) {
    e.preventDefault()
    await createPaymentMethodRule({
      producerId,
      method: f.method,
      label: f.label,
      maxInstallments: +f.maxInstallments,
      minimumCents: Math.round(+f.minimum * 100),
      gatewayId: f.gatewayId ? +f.gatewayId : undefined,
      acquirerId: f.acquirerId ? +f.acquirerId : undefined
    })
    setOpen(false)
    flash('Método de pagamento configurado.')
    await reload()
  }

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Métodos de Pagamento</h2>
          <p>PIX, crédito, débito e boleto com regras de parcelamento e roteamento.</p>
        </div>
        <button className="fa-btn primary" onClick={() => setOpen(v => !v)}><Plus size={17} />Novo Método</button>
      </div>
      {open && (
        <form className="finance360-form" onSubmit={save}>
          <Field label="Método">
            <select value={f.method} onChange={e => setF({ ...f, method: e.target.value })}>
              <option value="credito">Crédito</option>
              <option value="debito">Débito</option>
              <option value="pix">PIX</option>
              <option value="boleto">Boleto</option>
            </select>
          </Field>
          <Field label="Nome"><input value={f.label} onChange={e => setF({ ...f, label: e.target.value })} /></Field>
          <Field label="Máx. parcelas"><input type="number" min="1" value={f.maxInstallments} onChange={e => setF({ ...f, maxInstallments: e.target.value })} /></Field>
          <Field label="Valor mínimo R$"><input type="number" step="0.01" value={f.minimum} onChange={e => setF({ ...f, minimum: e.target.value })} /></Field>
          <Field label="Gateway">
            <select value={f.gatewayId} onChange={e => setF({ ...f, gatewayId: e.target.value })}>
              <option value="">Automático</option>
              {gateways.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </Field>
          <Field label="Operadora">
            <select value={f.acquirerId} onChange={e => setF({ ...f, acquirerId: e.target.value })}>
              <option value="">Automática</option>
              {operators.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </Field>
          <button className="fa-btn primary">Salvar Método</button>
        </form>
      )}
      <div className="finance360-card-list">
        {rows.map(r => (
          <article key={r.id} className="finance360-rule">
            <div>
              <CreditCard size={20} />
              <span>
                <strong>{r.label}</strong>
                <small>{r.method} · até {r.maxInstallments}x · mínimo {money(r.minimumCents)}</small>
              </span>
            </div>
            <button className={`fa-status ${r.status}`} onClick={async () => { await updatePaymentMethodRule(r.id, { status: r.status === 'ativo' ? 'inativo' : 'ativo' }); await reload() }}>{r.status}</button>
          </article>
        ))}
      </div>
    </section>
  )
}

function Refunds({ rows, gateways, operators, producerId, reload, flash }: { rows: RefundRequest[]; gateways: PaymentGatewayConfig[]; operators: CardAcquirer[]; producerId?: number; reload: () => Promise<void>; flash: (m: string) => void }) {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ orderCode: '', amount: '', kind: 'total', method: 'cartao', reason: '', gatewayId: '', acquirerId: '' })

  async function save(e: any) {
    e.preventDefault()
    await createRefundRequest({
      producerId,
      orderCode: f.orderCode,
      amountCents: Math.round(+f.amount * 100),
      kind: f.kind,
      method: f.method,
      reason: f.reason,
      gatewayId: f.gatewayId ? +f.gatewayId : undefined,
      acquirerId: f.acquirerId ? +f.acquirerId : undefined
    })
    setOpen(false)
    flash('Solicitação de estorno registrada para aprovação.')
    await reload()
  }

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Devoluções / Estornos</h2>
          <p>Solicitação, aprovação e envio controlado ao gateway. Nenhum estorno é marcado como concluído sem retorno do provedor.</p>
        </div>
        <button className="fa-btn primary" onClick={() => setOpen(v => !v)}><Plus size={17} />Solicitar Estorno</button>
      </div>
      {open && (
        <form className="finance360-form" onSubmit={save}>
          <Field label="Pedido"><input required value={f.orderCode} onChange={e => setF({ ...f, orderCode: e.target.value })} /></Field>
          <Field label="Valor R$"><input required type="number" min="0.01" step="0.01" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} /></Field>
          <Field label="Tipo">
            <select value={f.kind} onChange={e => setF({ ...f, kind: e.target.value })}>
              <option value="total">Total</option>
              <option value="parcial">Parcial</option>
            </select>
          </Field>
          <Field label="Método">
            <select value={f.method} onChange={e => setF({ ...f, method: e.target.value })}>
              <option value="cartao">Cartão</option>
              <option value="pix">PIX</option>
              <option value="boleto">Boleto</option>
            </select>
          </Field>
          <Field label="Gateway">
            <select value={f.gatewayId} onChange={e => setF({ ...f, gatewayId: e.target.value })}>
              <option value="">Não definido</option>
              {gateways.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </Field>
          <Field label="Operadora">
            <select value={f.acquirerId} onChange={e => setF({ ...f, acquirerId: e.target.value })}>
              <option value="">Não definida</option>
              {operators.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </Field>
          <Field label="Motivo"><input required value={f.reason} onChange={e => setF({ ...f, reason: e.target.value })} /></Field>
          <button className="fa-btn primary">Registrar Solicitação</button>
        </form>
      )}
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Pedido</th>
              <th>Valor</th>
              <th>Tipo</th>
              <th>Método</th>
              <th>Motivo</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.code}</td>
                <td>{r.orderCode}</td>
                <td>{money(r.amountCents)}</td>
                <td>{r.kind}</td>
                <td>{r.method}</td>
                <td>{r.reason}</td>
                <td><span className={`fa-status ${r.status}`}>{r.status.replaceAll('_', ' ')}</span></td>
                <td className="fa-actions">
                  {r.status === 'solicitado' && (
                    <button onClick={async () => { await approveRefundRequest(r.id); flash('Estorno aprovado.'); await reload() }}>Aprovar</button>
                  )}
                  {r.status === 'aprovado' && (
                    <button onClick={async () => { const x = await sendRefundToGateway(r.id); flash(x.message || 'Enviado ao gateway.'); await reload() }}>Enviar ao Gateway</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
