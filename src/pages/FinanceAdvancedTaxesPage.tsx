import { useEffect, useState } from 'react'
import {
  Activity, Building2, CreditCard, Gauge, RefreshCw,
  Save, Settings2, ShieldCheck, SlidersHorizontal, WalletCards
} from 'lucide-react'
import {
  getCardAcquirers, getFinanceGateways, getFinancePaymentMethods,
  createCardAcquirer, createFinanceGateway, createFinancePaymentMethod,
  updateCardAcquirer, updateFinanceGateway, updateFinancePaymentMethod,
  validateFinanceGateway, getFinanceSpreadDashboard,
  type CardAcquirer, type FinanceGateway, type FinancePaymentMethod, type SpreadDashboard
} from '../services/api'

type Props = { producerId?: number; eventId?: number; notify?: (message: string) => void; onBack?: () => void; initialTab?: Tab }
type Tab = 'overview' | 'gateways' | 'acquirers' | 'rates' | 'methods'
const pct = (bps = 0) => `${(bps / 100).toFixed(2)}%`
const money = (c = 0) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100)

export default function FinanceAdvancedTaxesPage({ producerId, eventId, notify, initialTab = 'overview' }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [gateways, setGateways] = useState<FinanceGateway[]>([])
  const [acquirers, setAcquirers] = useState<CardAcquirer[]>([])
  const [methods, setMethods] = useState<FinancePaymentMethod[]>([])
  const [spread, setSpread] = useState<SpreadDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const flash = (m: string) => notify?.(m)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [g, a, m, s] = await Promise.all([
        getFinanceGateways(producerId),
        getCardAcquirers(producerId),
        getFinancePaymentMethods(producerId),
        getFinanceSpreadDashboard(producerId, eventId)
      ])
      setGateways(g)
      setAcquirers(a)
      setMethods(m)
      setSpread(s)
    } catch (e: any) {
      setError(e.message || 'Falha ao carregar Advanced & Taxas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [producerId, eventId])

  useEffect(() => {
    if (initialTab) setTab(initialTab)
  }, [initialTab])

  return (
    <div className="advtx-page">
      <header className="advtx-hero">
        <div>
          <span>FINANCEIRO 360° · ADVANCED & TAXAS</span>
          <h1>Advanced & Taxas</h1>
          <p>Central operacional de gateways, adquirentes, métodos, MDR, liquidação e custos que alimentam o Spread.</p>
        </div>
        <button className="fa-btn secondary" onClick={load}>
          <RefreshCw size={16} /> Atualizar
        </button>
      </header>

      {error && <div className="finance360-alert error">{error}</div>}

      <nav className="advtx-tabs">
        {([
          ['overview', 'Visão Geral', Gauge],
          ['gateways', 'Gateways', Settings2],
          ['acquirers', 'Operadoras & Adquirentes', Building2],
          ['rates', 'Central de Taxas', SlidersHorizontal],
          ['methods', 'Métodos de Pagamento', CreditCard]
        ] as const).map(([k, l, I]) => (
          <button
            key={k}
            className={tab === k ? 'active' : ''}
            onClick={() => setTab(k)}
          >
            <I size={16} />{l}
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="finance360-loading">Carregando configurações financeiras...</div>
      ) : (
        <>
          {tab === 'overview' && <Overview gateways={gateways} acquirers={acquirers} methods={methods} spread={spread} />}
          {tab === 'gateways' && <Gateways rows={gateways} producerId={producerId} reload={load} flash={flash} />}
          {tab === 'acquirers' && <Acquirers rows={acquirers} producerId={producerId} reload={load} flash={flash} />}
          {tab === 'rates' && <Rates rows={acquirers} producerId={producerId} reload={load} flash={flash} />}
          {tab === 'methods' && <Methods rows={methods} producerId={producerId} reload={load} flash={flash} />}
        </>
      )}
    </div>
  )
}

function Overview({
  gateways,
  acquirers,
  methods,
  spread
}: {
  gateways: FinanceGateway[]
  acquirers: CardAcquirer[]
  methods: FinancePaymentMethod[]
  spread: SpreadDashboard | null
}) {
  const activeG = gateways.filter(x => x.status === 'ativo').length
  const activeA = acquirers.filter(x => x.status === 'ativo').length
  const activeM = methods.filter(x => x.status === 'ativo').length

  return (
    <>
      <div className="advtx-kpis">
        <Kpi icon={Settings2} label="Gateways ativos" value={`${activeG}`} sub={`${gateways.length} configurados`} />
        <Kpi icon={Building2} label="Adquirentes ativas" value={`${activeA}`} sub={`${acquirers.length} cadastradas`} />
        <Kpi icon={WalletCards} label="Métodos ativos" value={`${activeM}`} sub={`${methods.length} configurados`} />
        <Kpi icon={Activity} label="Margem simulada" value={pct(spread?.avgMarginBps || 0)} sub={spread ? `${spread.simulations} simulações salvas` : 'Sem histórico'} />
      </div>

      <section className="finance360-panel">
        <div className="finance360-panel-head">
          <div>
            <h2>Fluxo operacional das taxas</h2>
            <p>Uma única fonte de configuração alimenta o cálculo e as simulações financeiras.</p>
          </div>
        </div>
        <div className="advtx-flow">
          <b>Gateway</b>
          <span>→</span>
          <b>Adquirente</b>
          <span>→</span>
          <b>Método / Parcelas</b>
          <span>→</span>
          <b>MDR & Custos</b>
          <span>→</span>
          <b>Spread</b>
          <span>→</span>
          <b>Margem</b>
        </div>
      </section>

      <section className="finance360-panel">
        <div className="finance360-panel-head">
          <div>
            <h2>Resumo de rentabilidade</h2>
            <p>Consolidado exclusivamente das simulações persistidas no Spread.</p>
          </div>
        </div>
        <div className="advtx-summary">
          <div>
            <small>Volume</small>
            <strong>{money(spread?.volumeCents || 0)}</strong>
          </div>
          <div>
            <small>Receita de serviço</small>
            <strong>{money(spread?.serviceRevenueCents || 0)}</strong>
          </div>
          <div>
            <small>Custos</small>
            <strong>{money(spread?.totalCostCents || 0)}</strong>
          </div>
          <div>
            <small>Margem líquida</small>
            <strong>{money(spread?.netMarginCents || 0)}</strong>
          </div>
        </div>
      </section>
    </>
  )
}

function Kpi({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <article className="advtx-kpi">
      <Icon size={20} />
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <span>{sub}</span>
      </div>
    </article>
  )
}

function Gateways({
  rows,
  producerId,
  reload,
  flash
}: {
  rows: FinanceGateway[]
  producerId?: number
  reload: () => Promise<void>
  flash: (s: string) => void
}) {
  const [form, setForm] = useState({ name: '', provider: '', environment: 'sandbox' })
  const [busy, setBusy] = useState(false)

  async function add() {
    if (!form.name || !form.provider) return flash('Informe nome e provedor.')
    setBusy(true)
    try {
      await createFinanceGateway({ ...form, producerId })
      flash('Gateway cadastrado com sucesso!')
      setForm({ name: '', provider: '', environment: 'sandbox' })
      await reload()
    } catch (e: any) {
      flash(e.message || 'Erro ao cadastrar gateway.')
    } finally {
      setBusy(false)
    }
  }

  async function toggle(x: FinanceGateway) {
    try {
      await updateFinanceGateway(x.id, { producerId, status: x.status === 'ativo' ? 'inativo' : 'ativo' })
      flash(`Gateway ${x.name} atualizado!`)
      await reload()
    } catch (e: any) {
      flash(e.message)
    }
  }

  async function validate(x: FinanceGateway) {
    try {
      const r = await validateFinanceGateway(x.id, producerId)
      flash(r.message || 'Validação executada com sucesso.')
      await reload()
    } catch (e: any) {
      flash(e.message)
    }
  }

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Gateways de Pagamento</h2>
          <p>Cadastro, ambiente, status e validação operacional.</p>
        </div>
      </div>
      <div className="advtx-inline-form">
        <input
          placeholder="Nome do gateway"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Provider/código"
          value={form.provider}
          onChange={e => setForm({ ...form, provider: e.target.value })}
        />
        <select
          value={form.environment}
          onChange={e => setForm({ ...form, environment: e.target.value })}
        >
          <option value="sandbox">Sandbox</option>
          <option value="production">Produção</option>
        </select>
        <button className="fa-btn primary" disabled={busy} onClick={add}>
          <Save size={16} /> Cadastrar
        </button>
      </div>
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Gateway</th>
              <th>Provider</th>
              <th>Ambiente</th>
              <th>Status</th>
              <th>Configuração</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(x => (
              <tr key={x.id}>
                <td><strong>{x.name}</strong></td>
                <td>{x.provider}</td>
                <td>{x.environment}</td>
                <td><span className={`fa-status ${x.status}`}>{x.status}</span></td>
                <td>
                  {x.configured ? (
                    <span className="advtx-ok">
                      <ShieldCheck size={14} /> Configurado
                    </span>
                  ) : 'Pendente'}
                </td>
                <td>
                  <div className="advtx-row-actions">
                    <button onClick={() => validate(x)}>Validar</button>
                    <button onClick={() => toggle(x)}>{x.status === 'ativo' ? 'Desativar' : 'Ativar'}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <div className="finops360-empty">Nenhum gateway cadastrado.</div>}
    </section>
  )
}

function Acquirers({
  rows,
  producerId,
  reload,
  flash
}: {
  rows: CardAcquirer[]
  producerId?: number
  reload: () => Promise<void>
  flash: (s: string) => void
}) {
  const [f, setF] = useState({
    name: '',
    code: '',
    creditCashMdrBps: 300,
    creditInstallmentMdrBps: 400,
    debitMdrBps: 200,
    pixFeeBps: 100,
    anticipationBps: 150,
    settlementDays: 30
  })

  async function add() {
    if (!f.name || !f.code) return flash('Informe nome e código da adquirente.')
    try {
      await createCardAcquirer({ ...f, producerId })
      flash('Adquirente cadastrada com sucesso!')
      setF({ ...f, name: '', code: '' })
      await reload()
    } catch (e: any) {
      flash(e.message)
    }
  }

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Operadoras & Adquirentes</h2>
          <p>Cadastre as operadoras que serão consideradas pelo Spread e pela liquidação.</p>
        </div>
      </div>
      <div className="advtx-acquirer-form">
        <input
          placeholder="Nome da adquirente"
          value={f.name}
          onChange={e => setF({ ...f, name: e.target.value })}
        />
        <input
          placeholder="Código (ex: stone, pagarme)"
          value={f.code}
          onChange={e => setF({ ...f, code: e.target.value })}
        />
        <label>
          Crédito %
          <input
            type="number"
            step=".01"
            value={f.creditCashMdrBps / 100}
            onChange={e => setF({ ...f, creditCashMdrBps: Math.round(Number(e.target.value) * 100) })}
          />
        </label>
        <label>
          Parcelado %
          <input
            type="number"
            step=".01"
            value={f.creditInstallmentMdrBps / 100}
            onChange={e => setF({ ...f, creditInstallmentMdrBps: Math.round(Number(e.target.value) * 100) })}
          />
        </label>
        <label>
          Débito %
          <input
            type="number"
            step=".01"
            value={f.debitMdrBps / 100}
            onChange={e => setF({ ...f, debitMdrBps: Math.round(Number(e.target.value) * 100) })}
          />
        </label>
        <label>
          PIX %
          <input
            type="number"
            step=".01"
            value={f.pixFeeBps / 100}
            onChange={e => setF({ ...f, pixFeeBps: Math.round(Number(e.target.value) * 100) })}
          />
        </label>
        <label>
          Antecipação %
          <input
            type="number"
            step=".01"
            value={f.anticipationBps / 100}
            onChange={e => setF({ ...f, anticipationBps: Math.round(Number(e.target.value) * 100) })}
          />
        </label>
        <label>
          Liquidação D+
          <input
            type="number"
            min="0"
            value={f.settlementDays}
            onChange={e => setF({ ...f, settlementDays: Number(e.target.value) })}
          />
        </label>
        <button className="fa-btn primary" onClick={add}>
          <Save size={16} /> Cadastrar adquirente
        </button>
      </div>
      <Rates rows={rows} producerId={producerId} reload={reload} flash={flash} embedded />
    </section>
  )
}

function Rates({
  rows,
  producerId,
  reload,
  flash,
  embedded = false
}: {
  rows: CardAcquirer[]
  producerId?: number
  reload: () => Promise<void>
  flash: (s: string) => void
  embedded?: boolean
}) {
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState<any>({})

  function edit(x: CardAcquirer) {
    setEditing(x.id)
    setDraft({ ...x })
  }

  async function save() {
    try {
      await updateCardAcquirer(editing!, {
        producerId,
        creditCashMdrBps: Number(draft.creditCashMdrBps),
        creditInstallmentMdrBps: Number(draft.creditInstallmentMdrBps),
        debitMdrBps: Number(draft.debitMdrBps),
        pixFeeBps: Number(draft.pixFeeBps),
        anticipationBps: Number(draft.anticipationBps),
        settlementDays: Number(draft.settlementDays)
      })
      setEditing(null)
      flash('Tabela de taxas atualizada! O Spread utilizará automaticamente os novos valores.')
      await reload()
    } catch (e: any) {
      flash(e.message)
    }
  }

  const table = (
    <>
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Adquirente</th>
              <th>Crédito</th>
              <th>Parcelado</th>
              <th>Débito</th>
              <th>PIX</th>
              <th>Antecipação</th>
              <th>D+</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(x => {
              const e = editing === x.id
              const d = e ? draft : x
              const field = (k: string) => (
                <input
                  className="advtx-rate-input"
                  type="number"
                  step=".01"
                  value={Number(d[k]) / 100}
                  onChange={ev => setDraft({ ...draft, [k]: Math.round(Number(ev.target.value) * 100) })}
                />
              )
              return (
                <tr key={x.id}>
                  <td>
                    <strong>{x.name}</strong>
                    <small>{x.code}</small>
                  </td>
                  <td>{e ? field('creditCashMdrBps') : pct(x.creditCashMdrBps)}</td>
                  <td>{e ? field('creditInstallmentMdrBps') : pct(x.creditInstallmentMdrBps)}</td>
                  <td>{e ? field('debitMdrBps') : pct(x.debitMdrBps)}</td>
                  <td>{e ? field('pixFeeBps') : pct(x.pixFeeBps)}</td>
                  <td>{e ? field('anticipationBps') : pct(x.anticipationBps)}</td>
                  <td>
                    {e ? (
                      <input
                        className="advtx-rate-input"
                        type="number"
                        value={draft.settlementDays}
                        onChange={ev => setDraft({ ...draft, settlementDays: Number(ev.target.value) })}
                      />
                    ) : (
                      x.settlementDays
                    )}
                  </td>
                  <td>
                    {e ? (
                      <div className="advtx-row-actions">
                        <button onClick={save}>Salvar</button>
                        <button onClick={() => setEditing(null)}>Cancelar</button>
                      </div>
                    ) : (
                      <button onClick={() => edit(x)}>Editar taxas</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!rows.length && <div className="finops360-empty">Nenhuma adquirente cadastrada.</div>}
    </>
  )

  if (embedded) return table
  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Central de Taxas</h2>
          <p>Alterações salvas aqui passam a ser utilizadas pelo simulador e comparador de Spread.</p>
        </div>
      </div>
      {table}
    </section>
  )
}

function Methods({
  rows,
  producerId,
  reload,
  flash
}: {
  rows: FinancePaymentMethod[]
  producerId?: number
  reload: () => Promise<void>
  flash: (s: string) => void
}) {
  const [f, setF] = useState({ code: 'credito', name: 'Crédito', maxInstallments: 12, minInstallmentCents: 500 })

  async function add() {
    try {
      await createFinancePaymentMethod({ ...f, producerId, method: f.code, label: f.name, minimumCents: f.minInstallmentCents })
      flash('Método cadastrado com sucesso!')
      await reload()
    } catch (e: any) {
      flash(e.message)
    }
  }

  async function toggle(x: FinancePaymentMethod) {
    try {
      await updateFinancePaymentMethod(x.id, { producerId, status: x.status === 'ativo' ? 'inativo' : 'ativo' })
      flash(`Método ${x.name || x.label || x.code} atualizado!`)
      await reload()
    } catch (e: any) {
      flash(e.message)
    }
  }

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Métodos de Pagamento</h2>
          <p>Controle disponibilidade e regras básicas usadas pela operação financeira.</p>
        </div>
      </div>
      <div className="advtx-inline-form">
        <select
          value={f.code}
          onChange={e => {
            const code = e.target.value
            setF({
              ...f,
              code,
              name: code === 'pix' ? 'PIX' : code === 'debito' ? 'Débito' : code === 'boleto' ? 'Boleto' : 'Crédito'
            })
          }}
        >
          <option value="credito">Crédito</option>
          <option value="debito">Débito</option>
          <option value="pix">PIX</option>
          <option value="boleto">Boleto</option>
        </select>
        <input
          value={f.name}
          onChange={e => setF({ ...f, name: e.target.value })}
        />
        <input
          type="number"
          min="1"
          placeholder="Máx. parcelas"
          value={f.maxInstallments}
          onChange={e => setF({ ...f, maxInstallments: Number(e.target.value) })}
        />
        <input
          type="number"
          min="0"
          step=".01"
          placeholder="Parcela mínima R$"
          value={f.minInstallmentCents / 100}
          onChange={e => setF({ ...f, minInstallmentCents: Math.round(Number(e.target.value) * 100) })}
        />
        <button className="fa-btn primary" onClick={add}>
          <Save size={16} /> Cadastrar
        </button>
      </div>
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Método</th>
              <th>Código</th>
              <th>Parcelas</th>
              <th>Parcela mínima</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(x => (
              <tr key={x.id}>
                <td><strong>{x.name || x.label || x.method}</strong></td>
                <td>{x.code || x.method}</td>
                <td>{x.maxInstallments}x</td>
                <td>{money(x.minInstallmentCents || x.minimumCents || 0)}</td>
                <td><span className={`fa-status ${x.status}`}>{x.status}</span></td>
                <td>
                  <button onClick={() => toggle(x)}>{x.status === 'ativo' ? 'Desativar' : 'Ativar'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
