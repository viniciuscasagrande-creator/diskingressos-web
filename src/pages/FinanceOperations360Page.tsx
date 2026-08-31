import { useEffect, useMemo, useState } from 'react'
import { Activity, BrainCircuit, Calculator, CheckCircle2, RefreshCw, TrendingUp, WalletCards, AlertTriangle } from 'lucide-react'
import {
  getCardAcquirers, getFinancialObligations, getReconciliations, reconcileItem, autoReconcile,
  simulateFinanceSpread, getFinanceSpreadHistory, getFinanceOperations360Summary,
  type CardAcquirer, type FinancialObligation, type ReconciliationItem, type FinanceOperations360Summary, type SpreadSimulationResult
} from '../services/api'

type Tab = 'spread' | 'receivables' | 'reconciliation' | 'intelligence'
type Props = { producerId?: number; eventId?: number; initialTab?: Tab; notify?: (message: string) => void }
const money = (c = 0) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100)
const pct = (bps = 0) => `${(bps / 100).toFixed(2)}%`

export default function FinanceOperations360Page({ producerId, eventId, initialTab = 'spread', notify }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState<FinanceOperations360Summary | null>(null)
  const [acquirers, setAcquirers] = useState<CardAcquirer[]>([])
  const [receivables, setReceivables] = useState<FinancialObligation[]>([])
  const [recs, setRecs] = useState<ReconciliationItem[]>([])
  const [history, setHistory] = useState<any[]>([])

  const flash = (m: string) => notify?.(m)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [s, a, r, c, h] = await Promise.all([
        getFinanceOperations360Summary(producerId, eventId),
        getCardAcquirers(producerId),
        getFinancialObligations(producerId, eventId, 'receber'),
        getReconciliations(producerId, eventId),
        getFinanceSpreadHistory(producerId)
      ])
      setSummary(s)
      setAcquirers(a)
      setReceivables(r)
      setRecs(c)
      setHistory(h)
    } catch (e: any) {
      setError(e.message || 'Falha ao carregar Financeiro 360°')
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
    <div className="finops360-page">
      <header className="finops360-hero">
        <div>
          <span>FINANCEIRO 360° · FASE 20.2</span>
          <h1>Spread, Recebíveis, Conciliação e Inteligência</h1>
          <p>Operação financeira conectada às taxas das adquirentes, agenda de recebíveis e divergências reais.</p>
        </div>
        <button className="fa-btn secondary" onClick={load}>
          <RefreshCw size={16} />Atualizar
        </button>
      </header>

      {error && (
        <div className="finance360-alert error">
          <AlertTriangle size={18} />{error}
        </div>
      )}

      <div className="finops360-kpis">
        <K icon={WalletCards} label="Recebíveis em aberto" value={money(summary?.receivables.dueCents)} />
        <K icon={CheckCircle2} label="Conciliado" value={money(summary?.reconciliation.reconciledCents)} />
        <K icon={AlertTriangle} label="Divergências" value={money(summary?.reconciliation.divergenceCents)} />
        <K icon={TrendingUp} label="Margem média simulada" value={pct(summary?.spread.avgMarginBps)} />
      </div>

      <nav className="finance360-tabs">
        {([['spread', 'Spread & Simulador'], ['receivables', 'Recebíveis'], ['reconciliation', 'Conciliação'], ['intelligence', 'Inteligência Financeira']] as const).map(([k, l]) => (
          <button className={tab === k ? 'active' : ''} onClick={() => setTab(k)} key={k}>{l}</button>
        ))}
      </nav>

      {loading ? (
        <div className="finance360-loading">Carregando operação financeira...</div>
      ) : (
        <>
          {tab === 'spread' && <Spread acquirers={acquirers} producerId={producerId} eventId={eventId} history={history} reload={load} flash={flash} />}
          {tab === 'receivables' && <Receivables rows={receivables} />}
          {tab === 'reconciliation' && <Reconciliation rows={recs} producerId={producerId} eventId={eventId} reload={load} flash={flash} />}
          {tab === 'intelligence' && <Intelligence summary={summary} />}
        </>
      )}
    </div>
  )
}

function K({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="finops360-kpi">
      <Icon size={20} />
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

function Spread({ acquirers, producerId, eventId, history, reload, flash }: { acquirers: CardAcquirer[]; producerId?: number; eventId?: number; history: any[]; reload: () => Promise<void>; flash: (m: string) => void }) {
  const [f, setF] = useState({
    gross: '1000',
    method: 'credito',
    installments: '1',
    fee: '10',
    gateway: '0',
    acquirerId: String(acquirers[0]?.id || '')
  })
  const [result, setResult] = useState<SpreadSimulationResult | null>(null)

  useEffect(() => {
    if (!f.acquirerId && acquirers[0]) {
      setF(x => ({ ...x, acquirerId: String(acquirers[0].id) }))
    }
  }, [acquirers])

  async function run(save = false) {
    if (!f.acquirerId) return flash('Cadastre ou selecione uma operadora.')
    const r = await simulateFinanceSpread({
      producerId,
      eventId,
      grossCents: Math.round(+f.gross * 100),
      paymentMethod: f.method,
      installments: +f.installments,
      serviceFeeBps: Math.round(+f.fee * 100),
      gatewayCostCents: Math.round(+f.gateway * 100),
      acquirerId: +f.acquirerId,
      save
    })
    setResult(r)
    if (save) {
      flash('Simulação salva no histórico.')
      await reload()
    }
  }

  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Simulador de Spread</h2>
          <p>Compare taxa cobrada, MDR, antecipação, gateway e margem líquida.</p>
        </div>
      </div>
      <div className="finops360-sim">
        <div className="finance360-form dense">
          <label>Valor bruto
            <input type="number" step="0.01" value={f.gross} onChange={e => setF({ ...f, gross: e.target.value })} />
          </label>
          <label>Pagamento
            <select value={f.method} onChange={e => setF({ ...f, method: e.target.value })}>
              <option value="credito">Crédito</option>
              <option value="debito">Débito</option>
              <option value="pix">PIX</option>
            </select>
          </label>
          <label>Parcelas
            <input type="number" min="1" max="24" value={f.installments} onChange={e => setF({ ...f, installments: e.target.value })} />
          </label>
          <label>Taxa de serviço %
            <input type="number" step="0.01" value={f.fee} onChange={e => setF({ ...f, fee: e.target.value })} />
          </label>
          <label>Custo gateway R$
            <input type="number" step="0.01" value={f.gateway} onChange={e => setF({ ...f, gateway: e.target.value })} />
          </label>
          <label>Operadora
            <select value={f.acquirerId} onChange={e => setF({ ...f, acquirerId: e.target.value })}>
              {acquirers.map(a => <option value={a.id} key={a.id}>{a.name}</option>)}
            </select>
          </label>
          <div className="finops360-form-actions">
            <button className="fa-btn secondary" type="button" onClick={() => run(false)}>
              <Calculator size={16} />Simular
            </button>
            <button className="fa-btn primary" type="button" onClick={() => run(true)}>Salvar simulação</button>
          </div>
        </div>
        {result && (
          <div className="finops360-result">
            <h3>Resultado</h3>
            <Metric l="Receita de serviço" v={money(result.serviceRevenueCents)} />
            <Metric l="MDR" v={`-${money(result.mdrCostCents)} · ${pct(result.mdrBps)}`} />
            <Metric l="Antecipação" v={`-${money(result.anticipationCents)}`} />
            <Metric l="Gateway" v={`-${money(result.gatewayCostCents)}`} />
            <Metric l="Margem líquida" v={`${money(result.netMarginCents)} · ${pct(result.marginBps)}`} strong />
            <small>Liquidação estimada: D+{result.settlementDays} · {result.acquirer.name}</small>
          </div>
        )}
      </div>
      <h3 className="finops360-subtitle">Histórico salvo</h3>
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Bruto</th>
              <th>Meio</th>
              <th>MDR</th>
              <th>Margem</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(0, 12).map(x => (
              <tr key={x.id}>
                <td>{new Date(x.createdAt).toLocaleString('pt-BR')}</td>
                <td>{money(x.grossCents)}</td>
                <td>{x.paymentMethod} {x.installments}x</td>
                <td>{pct(x.mdrBps)}</td>
                <td><strong>{money(x.netMarginCents)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Metric({ l, v, strong }: { l: string; v: string; strong?: boolean }) {
  return (
    <div className="finops360-metric">
      <span>{l}</span>
      {strong ? <strong>{v}</strong> : <b>{v}</b>}
    </div>
  )
}

function Receivables({ rows }: { rows: FinancialObligation[] }) {
  const open = useMemo(() => rows.filter(x => x.status !== 'pago'), [rows])
  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Agenda de Recebíveis</h2>
          <p>Valores a receber, vencimentos, origem e status operacional.</p>
        </div>
      </div>
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>Contraparte</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {open.map(r => (
              <tr key={r.id}>
                <td>{r.code}</td>
                <td><strong>{r.description}</strong><small>{r.category}</small></td>
                <td>{r.counterparty || '—'}</td>
                <td>{new Date(r.dueDate).toLocaleDateString('pt-BR')}</td>
                <td>{money(r.amountCents)}</td>
                <td><span className={`fa-status ${r.status}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!open.length && <div className="finops360-empty">Nenhum recebível em aberto.</div>}
    </section>
  )
}

function Reconciliation({ rows, producerId, eventId, reload, flash }: { rows: ReconciliationItem[]; producerId?: number; eventId?: number; reload: () => Promise<void>; flash: (m: string) => void }) {
  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Conciliação Operacional</h2>
          <p>Pedido, gateway, banco e diferenças financeiras no mesmo fluxo.</p>
        </div>
        <button className="fa-btn primary" onClick={async () => { const x = await autoReconcile({ producerId, eventId }); flash(`${x.created} itens conciliados/criados pelo motor.`); await reload() }}>
          <Activity size={16} />Executar conciliação
        </button>
      </div>
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Origem</th>
              <th>Referência</th>
              <th>Esperado</th>
              <th>Recebido</th>
              <th>Diferença</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.sourceType}</td>
                <td>{r.sourceRef || r.externalRef || r.code}</td>
                <td>{money(r.expectedCents)}</td>
                <td>{money(r.receivedCents)}</td>
                <td className={r.differenceCents ? 'finops360-negative' : ''}>{money(r.differenceCents)}</td>
                <td><span className={`fa-status ${r.status}`}>{r.status}</span></td>
                <td>
                  {r.status === 'divergente' && (
                    <button className="fa-btn tiny" onClick={async () => { await reconcileItem(r.id, { receivedCents: r.expectedCents, reason: 'Ajuste manual confirmado na Central Financeira', force: true }); flash('Item conciliado manualmente com auditoria.'); await reload() }}>
                      Conciliar
                    </button>
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

function Intelligence({ summary }: { summary: FinanceOperations360Summary | null }) {
  return (
    <section className="finance360-panel">
      <div className="finance360-panel-head">
        <div>
          <h2>Inteligência Financeira</h2>
          <p>Alertas derivados dos dados reais do escopo financeiro atual.</p>
        </div>
        <BrainCircuit size={26} />
      </div>
      <div className="finops360-insights">
        {summary?.insights.map((x, i) => (
          <article className={`finops360-insight ${x.level}`} key={i}>
            <div>
              <strong>{x.title}</strong>
              <p>{x.message}</p>
            </div>
          </article>
        ))}
      </div>
      <h3 className="finops360-subtitle">Ranking de operadoras</h3>
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Operadora</th>
              <th>Aprovação</th>
              <th>MDR à vista</th>
              <th>MDR parcelado</th>
              <th>Liquidação</th>
            </tr>
          </thead>
          <tbody>
            {summary?.acquirers.map(a => (
              <tr key={a.id}>
                <td><strong>{a.name}</strong></td>
                <td>{pct(a.approvalRateBps)}</td>
                <td>{pct(a.creditCashMdrBps)}</td>
                <td>{pct(a.creditInstallmentMdrBps)}</td>
                <td>D+{a.settlementDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
