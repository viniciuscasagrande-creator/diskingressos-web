import { useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, ArrowRightLeft, Banknote, BrainCircuit, CheckCircle2,
  CreditCard, Gauge, Landmark, RefreshCw, Scale, TrendingUp, WalletCards
} from 'lucide-react'
import { getFinanceAdvancedSummary, type FinanceAdvancedSummary } from '../../services/api'

type Props = {
  producerId?: number
  eventId?: number
  notify?: (message: string) => void
  onNavigate?: (page: any) => void
}

const money = (c = 0) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100)
const pct = (bps = 0) => `${(bps / 100).toFixed(2)}%`

const modules = [
  { page: 'finance-reconciliation', title: 'Conciliação Bancária', desc: 'Divergências, conciliação automática e ajuste manual.', icon: Scale },
  { page: 'finance-spread', title: 'Spread & Rentabilidade', desc: 'Margem real, MDR, antecipação e custo de gateway.', icon: TrendingUp },
  { page: 'finance-spread-simulator', title: 'Simulador de Spread', desc: 'Simule cenários por adquirente, método e parcelamento.', icon: Gauge },
  { page: 'finance-split', title: 'Split Financeiro', desc: 'Regras, beneficiários, repasses e liquidações.', icon: ArrowRightLeft },
  { page: 'finance-intelligence', title: 'Inteligência Financeira', desc: 'Alertas, rentabilidade, recebíveis e eficiência.', icon: BrainCircuit },
  { page: 'finance-operators', title: 'Operadoras & Adquirentes', desc: 'MDR, D+, antecipação, aprovação e configuração.', icon: CreditCard },
  { page: 'finance-gateways', title: 'Gateways', desc: 'Ambiente, credenciais, webhook e validação operacional.', icon: Landmark },
] as const

export default function FinanceAdvancedCommandPage({ producerId, eventId, notify, onNavigate }: Props) {
  const [data, setData] = useState<FinanceAdvancedSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setData(await getFinanceAdvancedSummary(producerId, eventId))
    } catch (e: any) {
      const message = e?.message || 'Não foi possível carregar o Financeiro Advanced.'
      setError(message)
      notify?.(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [producerId, eventId])

  const healthLabel = useMemo(() => {
    if (!data) return 'Aguardando dados'
    if (data.health.unavailable.length) return `${data.health.ok}/${data.health.total} fontes disponíveis`
    return 'Todos os serviços financeiros disponíveis'
  }, [data])

  return (
    <div className="finadv-page">
      <header className="finadv-hero">
        <div>
          <span>FINANCEIRO · ADVANCED & INTELIGÊNCIA</span>
          <h1>Central Financeira Advanced</h1>
          <p>Conciliação, Spread, Split, adquirentes e inteligência usando dados operacionais do mesmo escopo financeiro.</p>
        </div>
        <button className="fa-btn secondary" onClick={load}><RefreshCw size={16}/>Atualizar</button>
      </header>

      {error && <div className="finance360-alert error"><AlertTriangle size={18}/>{error}</div>}
      {data?.health.unavailable.length ? (
        <div className="finance360-alert warning"><AlertTriangle size={18}/>Fontes indisponíveis: {data.health.unavailable.join(', ')}</div>
      ) : null}

      <section className="finadv-health">
        <Activity size={18}/><strong>{healthLabel}</strong>
        {data && !data.health.unavailable.length ? <CheckCircle2 size={18}/> : null}
      </section>

      <div className="finadv-kpis">
        <K icon={WalletCards} label="Recebíveis em aberto" value={money(data?.receivablesCents)} sub={`${data?.receivablesCount || 0} títulos`} />
        <K icon={Scale} label="Divergências" value={money(data?.divergenceCents)} sub={`${data?.divergences || 0} itens`} />
        <K icon={TrendingUp} label="Margem média Spread" value={pct(data?.avgMarginBps)} sub={`${data?.spreadSimulations || 0} simulações`} />
        <K icon={ArrowRightLeft} label="Liquidação prevista" value={money(data?.settlementExpectedCents)} sub={`Conciliado ${money(data?.settlementReconciledCents)}`} />
        <K icon={Banknote} label="Repasses pendentes" value={money(data?.pendingPayoutsCents)} sub={`${data?.pendingPayoutsCount || 0} solicitações`} />
        <K icon={CreditCard} label="Adquirentes ativas" value={String(data?.activeAcquirers || 0)} sub={`${data?.activeGateways || 0} gateways ativos`} />
      </div>

      <section className="finadv-section">
        <div className="finadv-section-head">
          <div><small>OPERAÇÃO AVANÇADA</small><h2>Ferramentas financeiras</h2></div>
        </div>
        <div className="finadv-grid">
          {modules.map(({ page, title, desc, icon: Icon }) => (
            <button key={page} className="finadv-card" onClick={() => onNavigate?.(page)}>
              <span className="finadv-card-icon"><Icon size={20}/></span>
              <strong>{title}</strong><p>{desc}</p><b>Abrir módulo →</b>
            </button>
          ))}
        </div>
      </section>

      <section className="finance360-panel">
        <div className="finance360-panel-head"><div><h2>Alertas & Inteligência</h2><p>Alertas calculados sobre o escopo atual; sem KPIs fictícios.</p></div></div>
        <div className="finadv-insights">
          {(data?.insights || []).map((x, index) => <article key={`${x.title}-${index}`} className={`finadv-insight ${x.level}`}><AlertTriangle size={18}/><div><strong>{x.title}</strong><p>{x.message}</p></div></article>)}
          {!loading && !(data?.insights || []).length && <article className="finadv-insight ok"><CheckCircle2 size={18}/><div><strong>Sem alertas críticos</strong><p>Não foram encontradas exceções financeiras relevantes no escopo selecionado.</p></div></article>}
        </div>
      </section>

      <section className="finance360-panel">
        <div className="finance360-panel-head"><div><h2>Ranking de adquirentes</h2><p>Taxas e aprovação configuradas no Financeiro.</p></div></div>
        <div className="finance360-table-wrap"><table><thead><tr><th>Adquirente</th><th>Status</th><th>Aprovação</th><th>MDR crédito</th><th>D+</th></tr></thead><tbody>
          {(data?.acquirers || []).map(a => <tr key={a.id}><td><strong>{a.name}</strong></td><td>{a.status}</td><td>{pct(a.approvalRateBps)}</td><td>{pct(a.creditMdrBps)}</td><td>D+{a.settlementDays}</td></tr>)}
        </tbody></table></div>
        {!loading && !(data?.acquirers || []).length && <div className="finops360-empty">Nenhuma adquirente cadastrada para este produtor.</div>}
      </section>
    </div>
  )
}

function K({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return <article className="finadv-kpi"><Icon size={20}/><div><small>{label}</small><strong>{value}</strong><span>{sub}</span></div></article>
}
