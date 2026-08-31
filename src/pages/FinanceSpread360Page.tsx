import { useEffect, useState } from 'react'
import {
  BarChart3, Calculator, CreditCard, Download, Gauge, Landmark, RefreshCw,
  Save, TrendingUp, WalletCards, AlertTriangle, CheckCircle2
} from 'lucide-react'
import {
  getCardAcquirers, getFinanceSpreadDashboard, getFinanceSpreadHistory,
  compareFinanceSpread, simulateFinanceSpread,
  type CardAcquirer, type SpreadDashboard, type SpreadSimulationResult
} from '../services/api'

type Props = { producerId?: number; eventId?: number; notify?: (message: string) => void; onBack?: () => void }
type View = 'dashboard' | 'simulator' | 'acquirers' | 'history' | 'rates'
const money = (c = 0) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100)
const pct = (bps = 0) => `${(bps / 100).toFixed(2)}%`

export default function FinanceSpread360Page({ producerId, eventId, notify }: Props) {
  const [view, setView] = useState<View>('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboard, setDashboard] = useState<SpreadDashboard | null>(null)
  const [acquirers, setAcquirers] = useState<CardAcquirer[]>([])
  const [history, setHistory] = useState<any[]>([])
  const flash = (m: string) => notify?.(m)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [d, a, h] = await Promise.all([
        getFinanceSpreadDashboard(producerId, eventId),
        getCardAcquirers(producerId),
        getFinanceSpreadHistory(producerId, eventId)
      ])
      setDashboard(d)
      setAcquirers(a)
      setHistory(h)
    } catch (e: any) {
      setError(e.message || 'Falha ao carregar o Spread.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [producerId, eventId])

  return (
    <div className="spread360-page">
      <header className="spread360-hero">
        <div>
          <span>FINANCEIRO 360° · SPREAD</span>
          <h1>Spread & Rentabilidade</h1>
          <p>Taxas, custos, adquirentes, simulações e margem financeira em um único módulo.</p>
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

      <nav className="spread360-tabs">
        {([
          ['dashboard', 'Dashboard', BarChart3],
          ['simulator', 'Simulador', Calculator],
          ['acquirers', 'Por Adquirente', Landmark],
          ['rates', 'Taxas & Custos', CreditCard],
          ['history', 'Histórico', WalletCards]
        ] as const).map(([k, l, I]) => (
          <button
            key={k}
            className={view === k ? 'active' : ''}
            onClick={() => setView(k)}
          >
            <I size={16} />{l}
          </button>
        ))}
      </nav>

      {loading ? (
        <div className="finance360-loading">Carregando Spread...</div>
      ) : (
        <>
          {view === 'dashboard' && <Dashboard data={dashboard} />}
          {view === 'simulator' && (
            <Simulator
              producerId={producerId}
              eventId={eventId}
              acquirers={acquirers}
              reload={load}
              flash={flash}
            />
          )}
          {view === 'acquirers' && (
            <Acquirers
              acquirers={acquirers}
              producerId={producerId}
              eventId={eventId}
            />
          )}
          {view === 'rates' && <Rates acquirers={acquirers} />}
          {view === 'history' && <History rows={history} />}
        </>
      )}
    </div>
  )
}

function Kpi({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon: any }) {
  return (
    <article className="spread360-kpi">
      <Icon size={20} />
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        {sub && <span>{sub}</span>}
      </div>
    </article>
  )
}

function Dashboard({ data }: { data: SpreadDashboard | null }) {
  if (!data) return <div className="finops360-empty">Sem dados de Spread no escopo selecionado.</div>

  return (
    <>
      <div className="spread360-kpis">
        <Kpi icon={WalletCards} label="Volume simulado" value={money(data.volumeCents)} sub={`${data.simulations} simulações`} />
        <Kpi icon={TrendingUp} label="Receita de serviço" value={money(data.serviceRevenueCents)} sub={pct(data.avgServiceFeeBps)} />
        <Kpi icon={CreditCard} label="Custos financeiros" value={money(data.totalCostCents)} sub="MDR + antecipação + gateway" />
        <Kpi icon={Gauge} label="Margem líquida" value={money(data.netMarginCents)} sub={pct(data.avgMarginBps)} />
      </div>

      <section className="finance360-panel">
        <div className="finance360-panel-head">
          <div>
            <h2>Rentabilidade por adquirente</h2>
            <p>Consolidado das simulações salvas, sem números fictícios.</p>
          </div>
        </div>
        <div className="finance360-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Adquirente</th>
                <th>Simulações</th>
                <th>Volume</th>
                <th>Custos</th>
                <th>Margem</th>
                <th>Margem %</th>
              </tr>
            </thead>
            <tbody>
              {data.byAcquirer.map(x => (
                <tr key={x.acquirerId}>
                  <td><strong>{x.name}</strong></td>
                  <td>{x.simulations}</td>
                  <td>{money(x.volumeCents)}</td>
                  <td>{money(x.totalCostCents)}</td>
                  <td>{money(x.netMarginCents)}</td>
                  <td><strong>{pct(x.marginBps)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.byAcquirer.length && (
          <div className="finops360-empty">Salve simulações para formar o comparativo real.</div>
        )}
      </section>
    </>
  )
}

function Simulator({
  producerId,
  eventId,
  acquirers,
  reload,
  flash
}: {
  producerId?: number
  eventId?: number
  acquirers: CardAcquirer[]
  reload: () => Promise<void>
  flash: (m: string) => void
}) {
  const [f, setF] = useState({
    gross: '1000',
    method: 'credito',
    installments: '1',
    fee: '10',
    gateway: '0',
    acquirerId: String(acquirers[0]?.id || '')
  })
  const [result, setResult] = useState<SpreadSimulationResult | null>(null)
  const [comparison, setComparison] = useState<SpreadSimulationResult[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!f.acquirerId && acquirers[0]) {
      setF(x => ({ ...x, acquirerId: String(acquirers[0].id) }))
    }
  }, [acquirers])

  const payload = {
    producerId,
    eventId,
    grossCents: Math.round(Number(f.gross) * 100),
    paymentMethod: f.method as 'credito' | 'debito' | 'pix',
    installments: Number(f.installments),
    serviceFeeBps: Math.round(Number(f.fee) * 100),
    gatewayCostCents: Math.round(Number(f.gateway) * 100)
  }

  async function run(save = false) {
    if (!f.acquirerId) return flash('Cadastre ou selecione uma adquirente.')
    setBusy(true)
    try {
      const r = await simulateFinanceSpread({ ...payload, acquirerId: Number(f.acquirerId), save })
      setResult(r)
      if (save) {
        flash('Simulação salva.')
        await reload()
      }
    } catch (e: any) {
      flash(e.message || 'Falha ao simular.')
    } finally {
      setBusy(false)
    }
  }

  async function compare() {
    setBusy(true)
    try {
      setComparison(await compareFinanceSpread(payload))
    } catch (e: any) {
      flash(e.message || 'Falha ao comparar adquirentes.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <section className="finance360-panel">
        <div className="finance360-panel-head">
          <div>
            <h2>Simulador de Spread</h2>
            <p>Calcule MDR, antecipação, gateway, taxa de serviço e margem líquida.</p>
          </div>
        </div>
        <div className="spread360-simulator">
          <div className="finance360-form dense">
            <label>
              Valor da venda
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={f.gross}
                onChange={e => setF({ ...f, gross: e.target.value })}
              />
            </label>
            <label>
              Método
              <select
                value={f.method}
                onChange={e => setF({ ...f, method: e.target.value })}
              >
                <option value="credito">Crédito</option>
                <option value="debito">Débito</option>
                <option value="pix">PIX</option>
              </select>
            </label>
            <label>
              Parcelas
              <input
                type="number"
                min="1"
                max="24"
                value={f.installments}
                onChange={e => setF({ ...f, installments: e.target.value })}
              />
            </label>
            <label>
              Taxa cobrada %
              <input
                type="number"
                min="0"
                step="0.01"
                value={f.fee}
                onChange={e => setF({ ...f, fee: e.target.value })}
              />
            </label>
            <label>
              Custo gateway R$
              <input
                type="number"
                min="0"
                step="0.01"
                value={f.gateway}
                onChange={e => setF({ ...f, gateway: e.target.value })}
              />
            </label>
            <label>
              Adquirente
              <select
                value={f.acquirerId}
                onChange={e => setF({ ...f, acquirerId: e.target.value })}
              >
                {acquirers.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </label>
            <div className="spread360-actions">
              <button className="fa-btn secondary" disabled={busy} onClick={() => run(false)}>
                <Calculator size={16} /> Simular
              </button>
              <button className="fa-btn secondary" disabled={busy || !acquirers.length} onClick={compare}>
                <Landmark size={16} /> Comparar adquirentes
              </button>
              <button className="fa-btn primary" disabled={busy} onClick={() => run(true)}>
                <Save size={16} /> Salvar simulação
              </button>
            </div>
          </div>
          {result ? (
            <Result result={result} />
          ) : (
            <div className="spread360-result empty">
              <Calculator size={28} />
              <h3>Pronto para simular</h3>
              <p>Preencha os parâmetros e veja a margem financeira detalhada.</p>
            </div>
          )}
        </div>
      </section>

      {!!comparison.length && (
        <section className="finance360-panel">
          <div className="finance360-panel-head">
            <div>
              <h2>Comparação de adquirentes</h2>
              <p>Mesmo cenário calculado com as taxas cadastradas de cada operadora ativa.</p>
            </div>
          </div>
          <div className="finance360-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Adquirente</th>
                  <th>MDR</th>
                  <th>Antecipação</th>
                  <th>Custos</th>
                  <th>Margem líquida</th>
                  <th>Spread</th>
                  <th>Liquidação</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((x, i) => (
                  <tr key={x.acquirer.id} className={i === 0 ? 'spread360-best' : ''}>
                    <td>
                      <strong>{x.acquirer.name}</strong>
                      {i === 0 && <small>Melhor margem</small>}
                    </td>
                    <td>{pct(x.mdrBps)}</td>
                    <td>{pct(x.anticipationBps)}</td>
                    <td>{money(x.totalCostCents)}</td>
                    <td>{money(x.netMarginCents)}</td>
                    <td><strong>{pct(x.marginBps)}</strong></td>
                    <td>D+{x.settlementDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  )
}

function Result({ result: r }: { result: SpreadSimulationResult }) {
  const rows = [
    ['Valor bruto', money(r.grossCents)],
    ['Receita de serviço', money(r.serviceRevenueCents)],
    ['MDR', `-${money(r.mdrCostCents)} · ${pct(r.mdrBps)}`],
    ['Antecipação', `-${money(r.anticipationCents)} · ${pct(r.anticipationBps)}`],
    ['Gateway', `-${money(r.gatewayCostCents)}`],
    ['Custos totais', `-${money(r.totalCostCents)}`]
  ]

  return (
    <div className="spread360-result">
      <div className="spread360-result-title">
        <CheckCircle2 size={20} />
        <div>
          <h3>Resultado</h3>
          <small>{r.acquirer.name} · D+{r.settlementDays}</small>
        </div>
      </div>
      {rows.map(([l, v]) => (
        <div className="spread360-result-row" key={l}>
          <span>{l}</span>
          <b>{v}</b>
        </div>
      ))}
      <div className="spread360-margin">
        <span>Margem líquida</span>
        <strong>{money(r.netMarginCents)}</strong>
        <em>{pct(r.marginBps)}</em>
      </div>
    </div>
  )
}

function Acquirers({
  acquirers,
  producerId,
  eventId
}: {
  acquirers: CardAcquirer[]
  producerId?: number
  eventId?: number
}) {
  const [rows, setRows] = useState<SpreadSimulationResult[]>([])
  const [busy, setBusy] = useState(false)

  async function compare() {
    setBusy(true)
    try {
      setRows(
        await compareFinanceSpread({
          producerId,
          eventId,
          grossCents: 100000,
          paymentMethod: 'credito',
          installments: 1,
          serviceFeeBps: 1000,
          gatewayCostCents: 0
        })
      )
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (acquirers.length) compare()
  }, [acquirers, producerId, eventId])

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Spread por Adquirente</h2>
          <p>Cenário-base de R$ 1.000,00 no crédito à vista, usando exclusivamente taxas cadastradas.</p>
        </div>
        <button className="fa-btn secondary" disabled={busy} onClick={compare}>
          <RefreshCw size={16} /> Recalcular
        </button>
      </div>
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Adquirente</th>
              <th>Aprovação</th>
              <th>MDR crédito</th>
              <th>Antecipação</th>
              <th>Liquidação</th>
              <th>Margem no cenário</th>
            </tr>
          </thead>
          <tbody>
            {acquirers.map(a => {
              const r = rows.find(x => x.acquirer.id === a.id)
              return (
                <tr key={a.id}>
                  <td>
                    <strong>{a.name}</strong>
                    <small>{a.code}</small>
                  </td>
                  <td>{pct(a.approvalRateBps)}</td>
                  <td>{pct(a.creditCashMdrBps)}</td>
                  <td>{pct(a.anticipationBps)}</td>
                  <td>D+{a.settlementDays}</td>
                  <td>{r ? <strong>{money(r.netMarginCents)} · {pct(r.marginBps)}</strong> : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Rates({ acquirers }: { acquirers: CardAcquirer[] }) {
  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Taxas & Custos</h2>
          <p>Matriz operacional cadastrada nas operadoras. A edição continua no módulo Gateways & Adquirentes.</p>
        </div>
      </div>
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Adquirente</th>
              <th>Crédito à vista</th>
              <th>Parcelado</th>
              <th>Débito</th>
              <th>PIX</th>
              <th>Antecipação</th>
              <th>D+</th>
            </tr>
          </thead>
          <tbody>
            {acquirers.map(a => (
              <tr key={a.id}>
                <td><strong>{a.name}</strong></td>
                <td>{pct(a.creditCashMdrBps)}</td>
                <td>{pct(a.creditInstallmentMdrBps)}</td>
                <td>{pct(a.debitMdrBps)}</td>
                <td>{pct(a.pixFeeBps)}</td>
                <td>{pct(a.anticipationBps)}</td>
                <td>{a.settlementDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function History({ rows }: { rows: any[] }) {
  const csv = () => {
    const header = ['data', 'bruto', 'metodo', 'parcelas', 'mdr', 'antecipacao', 'receita', 'margem']
    const body = rows.map(x => [
      x.createdAt,
      x.grossCents,
      x.paymentMethod,
      x.installments,
      x.mdrBps,
      x.anticipationBps,
      x.serviceRevenueCents,
      x.netMarginCents
    ])
    const blob = new Blob([[header, ...body].map(r => r.join(';')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'spread-historico.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Histórico de Simulações</h2>
          <p>Registro persistido para comparação e auditoria.</p>
        </div>
        <button className="fa-btn secondary" disabled={!rows.length} onClick={csv}>
          <Download size={16} /> Exportar CSV
        </button>
      </div>
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Bruto</th>
              <th>Método</th>
              <th>MDR</th>
              <th>Receita</th>
              <th>Margem</th>
              <th>Spread</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(x => (
              <tr key={x.id}>
                <td>{new Date(x.createdAt).toLocaleString('pt-BR')}</td>
                <td>{money(x.grossCents)}</td>
                <td>{x.paymentMethod} · {x.installments}x</td>
                <td>{pct(x.mdrBps)}</td>
                <td>{money(x.serviceRevenueCents)}</td>
                <td><strong>{money(x.netMarginCents)}</strong></td>
                <td>{pct(x.grossCents ? Math.round((x.netMarginCents * 10000) / x.grossCents) : 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <div className="finops360-empty">Nenhuma simulação salva.</div>}
    </section>
  )
}
