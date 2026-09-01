import React, { useEffect, useState } from 'react'
import {
  CreditCard, Landmark, RotateCcw, ServerCog, ShieldCheck, Plus,
  AlertTriangle, Handshake, SlidersHorizontal, CheckCircle2, Clock,
  DollarSign, FileText, Check
} from 'lucide-react'
import {
  getFinancePaymentsSummary, getPaymentGateways, createPaymentGateway, updatePaymentGateway, validatePaymentGateway,
  getCardAcquirers, createCardAcquirer, updateCardAcquirer, getPaymentMethodRules, createPaymentMethodRule, updatePaymentMethodRule,
  getRefundRequests, createRefundRequest, approveRefundRequest, sendRefundToGateway,
  type PaymentGatewayConfig, type CardAcquirer, type PaymentMethodRule, type RefundRequest, type FinancePaymentsSummary
} from '../services/api'

type Tab = 'gateways' | 'operators' | 'methods' | 'custom' | 'negotiations' | 'refunds'
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

  const flash = (m: string) => (notify ? notify(m) : undefined)

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
          <h1>Pagamentos, Gateways, Operadoras e Taxas</h1>
          <p>
            Camada financeira completa: meios de pagamento, adquirentes, taxas negociadas, pagamentos customizados e devoluções.
          </p>
        </div>
        <button className="fa-btn secondary" onClick={load}>
          Atualizar
        </button>
      </header>
      {error && (
        <div className="finance360-alert error">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}
      <div className="finance360-kpis">
        <K title="Gateways ativos" value={`${summary?.activeGateways || 0}/${summary?.gateways || 0}`} icon={ServerCog} />
        <K title="Operadoras ativas" value={`${summary?.activeAcquirers || 0}/${summary?.acquirers || 0}`} icon={Landmark} />
        <K title="Métodos configurados" value={String(summary?.methods || 0)} icon={CreditCard} />
        <K title="Estornos pendentes" value={String(summary?.pendingRefunds || 0)} icon={RotateCcw} />
        <K title="Total estornado" value={money(summary?.refundedCents || 0)} icon={ShieldCheck} />
      </div>
      <nav className="finance360-tabs">
        {(
          [
            ['gateways', 'Gateways'],
            ['operators', 'Operadoras'],
            ['methods', 'Métodos de Pagamento'],
            ['custom', 'Pagamentos Customizados'],
            ['negotiations', 'Negociações & Taxas'],
            ['refunds', 'Estornos & Devoluções']
          ] as const
        ).map(([k, l]) => (
          <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </nav>
      {loading ? (
        <div className="finance360-loading">Carregando dados financeiros...</div>
      ) : (
        <>
          {tab === 'gateways' && <Gateways rows={gateways} producerId={producerId} reload={load} flash={flash} />}
          {tab === 'operators' && <Operators rows={operators} producerId={producerId} reload={load} flash={flash} />}
          {tab === 'methods' && <Methods rows={methods} gateways={gateways} operators={operators} producerId={producerId} reload={load} flash={flash} />}
          {tab === 'custom' && <CustomPayments flash={flash} />}
          {tab === 'negotiations' && <Negotiations flash={flash} />}
          {tab === 'refunds' && <Refunds rows={refunds} gateways={gateways} operators={operators} producerId={producerId} reload={load} flash={flash} />}
        </>
      )}
    </div>
  )
}

function K({ title, value, icon: Icon }: { title: string; value: string; icon: any }) {
  return (
    <div className="finance360-kpi">
      <span>
        <Icon size={20} />
      </span>
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

function Gateways({ rows, producerId, reload, flash }: any) {
  const [show, setShow] = useState(false)
  const [f, setF] = useState({ name: '', provider: 'cielo', environment: 'production', isPrimary: false, active: true })

  return (
    <section className="finance360-card">
      <div className="finance360-card-head">
        <div>
          <h3>Gateways de Pagamento</h3>
          <p>Configure provedores, credenciais de produção e contingência automática.</p>
        </div>
        <button className="fa-btn primary" onClick={() => setShow(!show)}>
          <Plus size={16} /> Novo Gateway
        </button>
      </div>
      {show && (
        <form
          className="finance360-form"
          onSubmit={async e => {
            e.preventDefault()
            await createPaymentGateway({ ...f, producerId: producerId || 1 })
            flash('Gateway cadastrado.')
            setShow(false)
            await reload()
          }}
        >
          <Field label="Nome do Gateway">
            <input required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
          </Field>
          <Field label="Provedor">
            <select value={f.provider} onChange={e => setF({ ...f, provider: e.target.value })}>
              <option value="cielo">Cielo</option>
              <option value="stone">Stone / Pagar.me</option>
              <option value="rede">Rede</option>
              <option value="pagseguro">PagBank</option>
              <option value="asaas">Asaas</option>
            </select>
          </Field>
          <Field label="Ambiente">
            <select value={f.environment} onChange={e => setF({ ...f, environment: e.target.value })}>
              <option value="production">Produção</option>
              <option value="sandbox">Sandbox / Homologação</option>
            </select>
          </Field>
          <button className="fa-btn primary">Salvar Gateway</button>
        </form>
      )}
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Gateway</th>
              <th>Provedor</th>
              <th>Ambiente</th>
              <th>Principal</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((g: any) => (
              <tr key={g.id}>
                <td>
                  <strong>{g.name}</strong>
                </td>
                <td>{g.provider}</td>
                <td>{g.environment}</td>
                <td>{g.isPrimary ? 'Sim' : 'Não'}</td>
                <td>
                  <span className={`fa-status ${g.active ? 'active' : 'inactive'}`}>{g.active ? 'Ativo' : 'Inativo'}</span>
                </td>
                <td className="fa-actions">
                  <button
                    onClick={async () => {
                      const res = await validatePaymentGateway(g.id)
                      flash(res.ok ? 'Credenciais verificadas com sucesso!' : 'Falha na validação do gateway.')
                      await reload()
                    }}
                  >
                    Validar
                  </button>
                  <button
                    onClick={async () => {
                      await updatePaymentGateway(g.id, { active: !g.active })
                      flash(`Gateway ${g.active ? 'desativado' : 'ativado'}.`)
                      await reload()
                    }}
                  >
                    {g.active ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Operators({ rows, producerId, reload, flash }: any) {
  const [show, setShow] = useState(false)
  const [f, setF] = useState({ name: '', code: '', mdrBps: 219, anticipationRateBps: 149, settlementDays: 30, active: true })

  return (
    <section className="finance360-card">
      <div className="finance360-card-head">
        <div>
          <h3>Operadoras de Cartão & Adquirentes</h3>
          <p>Gerencie taxas de MDR, prazos de liquidação e adquirentes contratadas.</p>
        </div>
        <button className="fa-btn primary" onClick={() => setShow(!show)}>
          <Plus size={16} /> Nova Operadora
        </button>
      </div>
      {show && (
        <form
          className="finance360-form"
          onSubmit={async e => {
            e.preventDefault()
            await createCardAcquirer({ ...f, producerId: producerId || 1 })
            flash('Operadora cadastrada.')
            setShow(false)
            await reload()
          }}
        >
          <Field label="Nome da Operadora">
            <input required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
          </Field>
          <Field label="Código">
            <input required value={f.code} onChange={e => setF({ ...f, code: e.target.value })} />
          </Field>
          <Field label="Taxa MDR (BPS ex: 219 = 2,19%)">
            <input type="number" required value={f.mdrBps} onChange={e => setF({ ...f, mdrBps: Number(e.target.value) })} />
          </Field>
          <Field label="Prazo de Liquidação (Dias)">
            <input type="number" required value={f.settlementDays} onChange={e => setF({ ...f, settlementDays: Number(e.target.value) })} />
          </Field>
          <button className="fa-btn primary">Salvar Operadora</button>
        </form>
      )}
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Operadora</th>
              <th>Código</th>
              <th>MDR Base</th>
              <th>Taxa Antecipação</th>
              <th>Prazo Liquidação</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o: any) => (
              <tr key={o.id}>
                <td>
                  <strong>{o.name}</strong>
                </td>
                <td>{o.code}</td>
                <td>{pct(o.mdrBps)}</td>
                <td>{pct(o.anticipationRateBps)}</td>
                <td>D+{o.settlementDays}</td>
                <td>
                  <span className={`fa-status ${o.active ? 'active' : 'inactive'}`}>{o.active ? 'Ativa' : 'Inativa'}</span>
                </td>
                <td className="fa-actions">
                  <button
                    onClick={async () => {
                      await updateCardAcquirer(o.id, { active: !o.active })
                      flash(`Operadora ${o.active ? 'desativada' : 'ativada'}.`)
                      await reload()
                    }}
                  >
                    {o.active ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Methods({ rows, gateways, operators, producerId, reload, flash }: any) {
  const [show, setShow] = useState(false)
  const [f, setF] = useState({ name: '', method: 'pix', fixedFeeCents: 0, percentBps: 99, maxInstallments: 1, active: true })

  return (
    <section className="finance360-card">
      <div className="finance360-card-head">
        <div>
          <h3>Métodos de Pagamento Ativos</h3>
          <p>Controle as formas de pagamento disponíveis para os compradores no checkout.</p>
        </div>
        <button className="fa-btn primary" onClick={() => setShow(!show)}>
          <Plus size={16} /> Novo Método
        </button>
      </div>
      {show && (
        <form
          className="finance360-form"
          onSubmit={async e => {
            e.preventDefault()
            await createPaymentMethodRule({ ...f, producerId: producerId || 1 })
            flash('Método configurado.')
            setShow(false)
            await reload()
          }}
        >
          <Field label="Nome">
            <input required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
          </Field>
          <Field label="Método">
            <select value={f.method} onChange={e => setF({ ...f, method: e.target.value })}>
              <option value="pix">PIX Dinâmico</option>
              <option value="credit_card">Cartão de Crédito</option>
              <option value="debit_card">Cartão de Débito</option>
              <option value="boleto">Boleto Bancário</option>
            </select>
          </Field>
          <Field label="Taxa Percentual (BPS ex: 99 = 0,99%)">
            <input type="number" required value={f.percentBps} onChange={e => setF({ ...f, percentBps: Number(e.target.value) })} />
          </Field>
          <Field label="Máximo de Parcelas">
            <input type="number" required value={f.maxInstallments} onChange={e => setF({ ...f, maxInstallments: Number(e.target.value) })} />
          </Field>
          <button className="fa-btn primary">Salvar Método</button>
        </form>
      )}
      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Taxa Fixa</th>
              <th>Taxa %</th>
              <th>Parcelas</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m: any) => (
              <tr key={m.id}>
                <td>
                  <strong>{m.name}</strong>
                </td>
                <td>{m.method}</td>
                <td>{money(m.fixedFeeCents)}</td>
                <td>{pct(m.percentBps)}</td>
                <td>{m.maxInstallments}x</td>
                <td>
                  <span className={`fa-status ${m.active ? 'active' : 'inactive'}`}>{m.active ? 'Ativo' : 'Inativo'}</span>
                </td>
                <td className="fa-actions">
                  <button
                    onClick={async () => {
                      await updatePaymentMethodRule(m.id, { active: !m.active })
                      flash(`Método ${m.active ? 'desativado' : 'ativado'}.`)
                      await reload()
                    }}
                  >
                    {m.active ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function CustomPayments({ flash }: { flash: (m: string) => void }) {
  const [customRules, setCustomRules] = useState([
    { id: 1, name: 'Venda Balcão / Bilheteria Física', channel: 'POS / Dinheiro', fee: 'Isento', maxLimit: 'R$ 50.000,00', status: 'Ativo' },
    { id: 2, name: 'Permuta de Patrocinadores Master', channel: 'Contrato B2B', fee: 'Taxa Adm 2%', maxLimit: 'R$ 150.000,00', status: 'Ativo' },
    { id: 3, name: 'Faturamento Corporativo a Prazo (30d)', channel: 'Fatura B2B', fee: '1,50% a.m.', maxLimit: 'R$ 80.000,00', status: 'Ativo' },
    { id: 4, name: 'Cortesias Pagas VIP / Taxa de Serviço', channel: 'Emissão VIP', fee: 'R$ 15,00 fixo', maxLimit: 'Sem limite', status: 'Ativo' }
  ])

  return (
    <section className="finance360-card">
      <div className="finance360-card-head">
        <div>
          <h3>Pagamentos Customizados & Offline</h3>
          <p>Regras especiais para faturamento corporativo, permutas, cortesias e bilheterias físicas.</p>
        </div>
        <button className="fa-btn primary" onClick={() => flash('Abrindo formulário de nova regra customizada...')}>
          <Plus size={16} /> Nova Regra Customizada
        </button>
      </div>

      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Modalidade</th>
              <th>Canal / Tipo</th>
              <th>Taxa / Comissão</th>
              <th>Limite Autorizado</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {customRules.map(r => (
              <tr key={r.id}>
                <td>
                  <strong>{r.name}</strong>
                </td>
                <td>{r.channel}</td>
                <td>{r.fee}</td>
                <td>{r.maxLimit}</td>
                <td>
                  <span className="fa-status active">● {r.status}</span>
                </td>
                <td className="fa-actions">
                  <button onClick={() => flash(`Regra ${r.name} configurada com sucesso.`)}>Editar Regra</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Negotiations({ flash }: { flash: (m: string) => void }) {
  const [agreements, setAgreements] = useState([
    { id: 1, title: 'Acordo Especial de Pix por Volume', partner: 'DiskIngressos Banking', rate: '0,79% (Economia de 20 BPS)', volume: '> R$ 500.000 / mês', validUntil: '31/12/2026', status: 'Vigente' },
    { id: 2, title: 'Taxa Diferenciada Cartão 1x (MDR)', partner: 'Adquirente Cielo', rate: '2,19% no Crédito à Vista', volume: '> 1.000 pedidos', validUntil: '31/12/2026', status: 'Vigente' },
    { id: 3, title: 'Spread de Parcelamento 12x Repassado', partner: 'Gateway Stone', rate: '1,29% a.m. repassado ao fã', volume: 'Todos os eventos', validUntil: '31/12/2026', status: 'Vigente' },
    { id: 4, title: 'Retenção de Garantia Contratual (Escrow)', partner: 'Produtora Parceira', rate: '5% liberado D+2 pós-show', volume: 'Grandes Festivais', validUntil: '31/12/2026', status: 'Vigente' }
  ])

  return (
    <section className="finance360-card">
      <div className="finance360-card-head">
        <div>
          <h3>Negociações Financeiras & Acordos de Taxa</h3>
          <p>Condições comerciais personalizadas, descontos de volume e regras de comissão ativas.</p>
        </div>
        <button className="fa-btn primary" onClick={() => flash('Iniciando solicitação de nova negociação de taxa...')}>
          <Handshake size={16} /> Solicitar Nova Negociação
        </button>
      </div>

      <div className="finance360-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Acordo Comercial</th>
              <th>Parceiro / Adquirente</th>
              <th>Condição Especial Negociada</th>
              <th>Critério de Volume</th>
              <th>Validade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {agreements.map(a => (
              <tr key={a.id}>
                <td>
                  <strong>{a.title}</strong>
                </td>
                <td>{a.partner}</td>
                <td style={{ color: '#16A34A', fontWeight: 800 }}>{a.rate}</td>
                <td>{a.volume}</td>
                <td>{a.validUntil}</td>
                <td>
                  <span className="fa-status active">● {a.status}</span>
                </td>
                <td className="fa-actions">
                  <button onClick={() => flash(`Visualizando termo do acordo: ${a.title}`)}>Ver Contrato</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Refunds({ rows, gateways, operators, producerId, reload, flash }: any) {
  const [show, setShow] = useState(false)
  const [f, setF] = useState({
    code: `DEV-${Date.now().toString().slice(-4)}`,
    orderCode: '',
    amountCents: 15000,
    kind: 'total',
    method: 'credit_card',
    reason: 'Desistência do comprador no prazo de 7 dias (CDC)',
    gatewayId: '',
    acquirerId: ''
  })

  return (
    <section className="finance360-card">
      <div className="finance360-card-head">
        <div>
          <h3>Devoluções, Estornos e Cancelamentos</h3>
          <p>Gerencie pedidos de reembolso, auditoria do motivo e envio automático ao adquirente.</p>
        </div>
        <button className="fa-btn primary" onClick={() => setShow(!show)}>
          <Plus size={16} /> Nova Devolução
        </button>
      </div>
      {show && (
        <form
          className="finance360-form"
          onSubmit={async e => {
            e.preventDefault()
            await createRefundRequest({
              ...f,
              producerId: producerId || 1,
              gatewayId: f.gatewayId ? Number(f.gatewayId) : undefined,
              acquirerId: f.acquirerId ? Number(f.acquirerId) : undefined
            })
            flash('Solicitação de devolução criada.')
            setShow(false)
            await reload()
          }}
        >
          <Field label="Código do Pedido">
            <input required value={f.orderCode} onChange={e => setF({ ...f, orderCode: e.target.value })} placeholder="Ex: #PED-99881" />
          </Field>
          <Field label="Valor em Centavos (ex: 15000 = R$ 150,00)">
            <input type="number" required value={f.amountCents} onChange={e => setF({ ...f, amountCents: Number(e.target.value) })} />
          </Field>
          <Field label="Tipo">
            <select value={f.kind} onChange={e => setF({ ...f, kind: e.target.value })}>
              <option value="total">Total</option>
              <option value="parcial">Parcial</option>
            </select>
          </Field>
          <Field label="Método Original">
            <select value={f.method} onChange={e => setF({ ...f, method: e.target.value })}>
              <option value="credit_card">Cartão de Crédito</option>
              <option value="pix">PIX</option>
              <option value="boleto">Boleto</option>
            </select>
          </Field>
          <Field label="Motivo">
            <input required value={f.reason} onChange={e => setF({ ...f, reason: e.target.value })} />
          </Field>
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
            {rows.map((r: any) => (
              <tr key={r.id}>
                <td>{r.code}</td>
                <td>{r.orderCode}</td>
                <td>{money(r.amountCents)}</td>
                <td>{r.kind}</td>
                <td>{r.method}</td>
                <td>{r.reason}</td>
                <td>
                  <span className={`fa-status ${r.status}`}>{r.status.replaceAll('_', ' ')}</span>
                </td>
                <td className="fa-actions">
                  {r.status === 'solicitado' && (
                    <button
                      onClick={async () => {
                        await approveRefundRequest(r.id)
                        flash('Estorno aprovado.')
                        await reload()
                      }}
                    >
                      Aprovar
                    </button>
                  )}
                  {r.status === 'aprovado' && (
                    <button
                      onClick={async () => {
                        const x = await sendRefundToGateway(r.id)
                        flash(x.message || 'Enviado ao gateway.')
                        await reload()
                      }}
                    >
                      Enviar ao Gateway
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
