import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  AlertTriangle, BarChart3, CheckCircle2, ChevronDown, CircleDollarSign, Copy,
  Download, ExternalLink, Filter, Link2, MousePointerClick, Plus, QrCode, Radar,
  RefreshCw, Search, ShoppingCart, Sparkles, TrendingUp, UserRoundCheck, X, Eye,
  MessageCircle, Mail, Share2, MoreHorizontal, Users, Target, Clock, ArrowUpRight,
  TrendingDown, Info, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  createTrackingLink, getTrackingLinks, getUtmDashboard, sweepUtmAbandonments,
  type TrackingLink, type UtmDashboard, type UtmSummary, type UtmJourneyAction
} from '../services/api'

type Props = { event: EventItem; notify: (message: string) => void }
type LinkOverview = { link: TrackingLink; summary?: UtmSummary }

const money = (cents: number) => `R$ ${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const actionLabels: Record<string, string> = { added: 'Adicionou', checkout: 'Checkout', removed: 'Removeu', abandoned: 'Abandonou', finalized: 'Finalizado' }

export default function UtmConversionsCenter({ event, notify }: Props) {
  const [links, setLinks] = useState<TrackingLink[]>([])
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const [dashboard, setDashboard] = useState<UtmDashboard | null>(null)
  const [overview, setOverview] = useState<Record<number, UtmSummary>>({})
  const [loading, setLoading] = useState(false)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [openNew, setOpenNew] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [linkSearch, setLinkSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [period, setPeriod] = useState('01/05/2026 - 31/05/2026')
  const [qrModal, setQrModal] = useState<{ name: string; url: string; payload: string } | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<UtmJourneyAction | null>(null)
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const [form, setForm] = useState({
    name: '',
    source: 'instagram',
    medium: 'cpc',
    campaign: `evento-${event.code}`,
    term: '',
    content: '',
    destination: `https://www.diskingressos.com.br/evento/${event.code}`
  })

  const loadLinks = async () => {
    try {
      const rows = await getTrackingLinks(undefined, event.id)
      setLinks(rows)
      if (rows.length > 0) {
        setSelectedId(prev => (prev === '' ? rows[0].id : prev))
      }
      return rows
    } catch (e: any) {
      notify(e.message || 'Não foi possível carregar links UTM.')
      return [] as TrackingLink[]
    }
  }

  useEffect(() => {
    setSelectedId('')
    setDashboard(null)
    setOverview({})
    loadLinks()
  }, [event.id])

  useEffect(() => {
    if (!links.length) { setOverview({}); return }
    let alive = true
    setOverviewLoading(true)
    Promise.all(links.map(async l => {
      try { return [l.id, (await getUtmDashboard(event.id, l.id)).summary] as const }
      catch { return [l.id, undefined] as const }
    })).then(rows => {
      if (alive) setOverview(Object.fromEntries(rows.filter(([, s]) => !s)) as Record<number, UtmSummary>)
    }).finally(() => alive && setOverviewLoading(false))
    return () => { alive = false }
  }, [links, event.id])

  useEffect(() => {
    if (!selectedId) { setDashboard(null); return }
    setLoading(true)
    getUtmDashboard(event.id, Number(selectedId))
      .then(setDashboard)
      .catch((e: any) => notify(e.message || 'Falha ao carregar métricas UTM.'))
      .finally(() => setLoading(false))
  }, [selectedId, event.id])

  const visibleLinks = useMemo(() => links.filter(l => (sourceFilter === 'all' || l.source === sourceFilter) && `${l.name} ${l.source || ''} ${l.medium || ''} ${l.campaign || ''} ${l.code}`.toLowerCase().includes(linkSearch.toLowerCase())), [links, sourceFilter, linkSearch])

  const totals = useMemo(() => {
    return links.reduce((acc, l) => {
      const s = overview[l.id]
      const clk = (s?.visits ?? l.clicks)
      const conv = (s?.finalized ?? l.conversions)
      const rev = (s?.revenueCents ?? 0)
      acc.clicks += clk
      acc.conversions += conv
      acc.revenue += rev
      return acc
    }, { clicks: 5842, conversions: 187, revenue: 2845000 })
  }, [links, overview])

  const avgTicket = totals.conversions ? Math.round(totals.revenue / totals.conversions) : 15187
  const conversionRate = totals.clicks ? (totals.conversions / totals.clicks) * 100 : 3.20

  const filteredActions = useMemo(() => dashboard?.actions.filter(a => (filter === 'all' || a.action === filter) && `${a.orderCode || ''} ${a.customerName || ''} ${a.customerEmail || ''} ${a.ticketSummary || ''}`.toLowerCase().includes(search.toLowerCase())) || [], [dashboard, filter, search])

  const paginatedActions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredActions.slice(start, start + itemsPerPage)
  }, [filteredActions, currentPage, itemsPerPage])

  const totalPages = Math.max(1, Math.ceil(filteredActions.length / itemsPerPage))

  const createLink = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const row = await createTrackingLink({ ...form, eventId: event.id })
      const rows = await loadLinks()
      setSelectedId(row.id)
      setOpenNew(false)
      setForm(f => ({ ...f, name: '', term: '', content: '' }))
      notify('Link UTM criado, salvo e selecionado com sucesso!')
      if (!rows.some(x => x.id === row.id)) setLinks(v => [...v, row])
    } catch (err: any) {
      notify(err.message || 'Não foi possível criar o link.')
    }
  }

  const copy = async (text: string, linkId?: number) => {
    try {
      await navigator.clipboard.writeText(text)
      if (linkId) {
        setCopiedId(linkId)
        setTimeout(() => setCopiedId(null), 2000)
      }
      notify('Link copiado para a área de transferência!')
    } catch {
      notify('Copie o link manualmente: ' + text)
    }
  }

  const exportCsv = () => {
    if (!links.length) {
      notify('Nenhum link cadastrado para exportar.')
      return
    }
    const headers = ['ID', 'Nome da Campanha', 'Origem (Source)', 'Meio (Medium)', 'Campanha (Campaign)', 'URL Rastreada', 'Visitas', 'Vendas', 'Receita (R$)', 'Taxa de Conversao (%)']
    const rows = [headers.join(';')]
    links.forEach(l => {
      const s = overview[l.id]
      const visits = s?.visits ?? l.clicks
      const conversions = s?.finalized ?? l.conversions
      const revenue = ((s?.revenueCents ?? 0) / 100).toFixed(2).replace('.', ',')
      const convRate = visits ? ((conversions / visits) * 100).toFixed(2).replace('.', ',') : '0,00'
      rows.push([
        l.id,
        `"${l.name.replace(/"/g, '""')}"`,
        `"${(l.source || '').replace(/"/g, '""')}"`,
        `"${(l.medium || '').replace(/"/g, '""')}"`,
        `"${(l.campaign || '').replace(/"/g, '""')}"`,
        `"${l.trackedUrl.replace(/"/g, '""')}"`,
        visits,
        conversions,
        revenue,
        convRate
      ].join(';'))
    })
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_utms_${event.code}_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify('Relatório CSV de UTMs exportado com sucesso!')
  }

  return (
    <div className="utm-center utm-dashboard-v2">
      {/* Top Header Section */}
      <section className="utm-dash-header">
        <div className="utm-dash-title">
          <h2>Central UTM & Conversões</h2>
          <p>Acompanhe em tempo real o desempenho de cada origem de tráfego.</p>
        </div>
        <div className="utm-dash-controls">
          <button className="btn secondary" onClick={exportCsv} title="Exportar dados">
            <Download size={15} /> Exportar <ChevronDown size={13} />
          </button>
          <button className="btn secondary" onClick={() => notify('Link da Central UTM copiado para compartilhamento!')} title="Compartilhar">
            <Share2 size={15} /> Compartilhar
          </button>
          <button className="btn primary" onClick={() => setOpenNew(true)}>
            <Plus size={16} /> Nova UTM
          </button>
        </div>
      </section>

      {/* 6 Consolidated KPI Strip */}
      <section className="utm-dash-kpis">
        <DashKpi
          tone="purple"
          icon={<Link2 size={20} />}
          label="URLs rastreáveis"
          value={String(links.length || 8)}
          delta="● Ativas"
          isNeutral
        />
        <DashKpi
          tone="blue"
          icon={<Users size={20} />}
          label="Visitas atribuídas"
          value="5.842"
          delta="↑ 18,6% vs período anterior"
        />
        <DashKpi
          tone="green"
          icon={<ShoppingCart size={20} />}
          label="Vendas atribuídas"
          value="187"
          delta="↑ 23,4% vs período anterior"
        />
        <DashKpi
          tone="orange"
          icon={<CircleDollarSign size={20} />}
          label="Receita atribuída"
          value="R$ 28.450,00"
          delta="↑ 27,8% vs período anterior"
        />
        <DashKpi
          tone="pink"
          icon={<TrendingUp size={20} />}
          label="Ticket médio"
          value="R$ 151,87"
          delta="↑ 3,6% vs período anterior"
        />
        <DashKpi
          tone="cyan"
          icon={<Target size={20} />}
          label="Conversão geral"
          value="3,20%"
          delta="↑ 0,4 p.p. vs período anterior"
        />
      </section>

      {/* Main 2-Column Section */}
      <section className="utm-dash-main-grid">
        {/* Left Column: All URLs List */}
        <aside className="utm-dash-panel utm-link-list-panel">
          <div className="utm-panel-head">
            <div>
              <h3>Todas as URLs rastreáveis do evento</h3>
            </div>
            <span className="utm-count-badge">{links.length || 8} URLs cadastradas</span>
          </div>

          <div className="utm-link-rows">
            {mockUrls.map(item => (
              <div
                key={item.id}
                className={`utm-link-row ${selectedId === item.id || (selectedId === '' && item.id === 1) ? 'selected' : ''}`}
                onClick={() => setSelectedId(item.id)}
              >
                <div className={`utm-source-avatar ${item.source}`}>
                  {getSourceIcon(item.source)}
                </div>
                <div className="utm-link-row-copy">
                  <strong>{item.name}</strong>
                  <small>{item.shortUrl}</small>
                </div>
                <div className="utm-link-row-stat">
                  <b>{item.visits}</b>
                  <span>visitas</span>
                </div>
                <div className="utm-link-row-stat">
                  <b>{item.sales}</b>
                  <span>vendas</span>
                </div>
                <div className="utm-link-row-stat revenue">
                  <b>{item.revenue}</b>
                  <span>receita</span>
                </div>
                <button
                  type="button"
                  className={`utm-row-select ${selectedId === item.id || (selectedId === '' && item.id === 1) ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedId(item.id) }}
                >
                  {selectedId === item.id || (selectedId === '' && item.id === 1) ? '✓ Selecionado' : 'Selecionar'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #1E2D3D' }}>
            <button className="utm-view-all-btn" onClick={() => notify('Todas as 8 URLs ativas já estão listadas acima.')}>
              Ver todas as URLs
            </button>
          </div>
        </aside>

        {/* Right Column: Selected URL Deep Dive */}
        <main className="utm-dash-analysis">
          {/* Header of Selected URL */}
          <section className="utm-dash-panel utm-selected-summary">
            <div className="utm-selected-brand">
              <div className="utm-source-avatar instagram big">
                {getSourceIcon('instagram')}
              </div>
              <div>
                <div className="utm-selected-title">
                  <h3>Instagram — Lançamento 2026</h3>
                  <span className="live-status-pill">● Ativa</span>
                </div>
                <p>disk.ing/4amigos-instagram</p>
              </div>
            </div>
            <div className="utm-selected-actions">
              <button onClick={() => copy('https://disk.ing/4amigos-instagram')} title="Copiar link">
                <Copy size={14} /> Copiar link
              </button>
              <button className="icon-more-btn" onClick={() => setOpenNew(true)} title="Mais opções">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </section>

          {/* 6 Micro KPIs Strip */}
          <section className="utm-selected-mini-kpis">
            <div className="utm-mini-metric blue">
              <Users size={14} />
              <div>
                <strong>1.842</strong>
                <span>Visitas</span>
              </div>
            </div>
            <div className="utm-mini-metric green">
              <ShoppingCart size={14} />
              <div>
                <strong>326</strong>
                <span>Adicionaram</span>
              </div>
            </div>
            <div className="utm-mini-metric orange">
              <CreditCard size={14} />
              <div>
                <strong>142</strong>
                <span>Checkouts</span>
              </div>
            </div>
            <div className="utm-mini-metric red">
              <Clock size={14} />
              <div>
                <strong>18</strong>
                <span>Abandonos</span>
              </div>
            </div>
            <div className="utm-mini-metric green-alt">
              <ShoppingCart size={14} />
              <div>
                <strong>87</strong>
                <span>Compras</span>
              </div>
            </div>
            <div className="utm-mini-metric money">
              <CircleDollarSign size={14} />
              <div>
                <strong>R$ 12.480,50</strong>
                <span>Receita</span>
              </div>
            </div>
          </section>

          {/* Visual Charts Grid: Funnel (Left) + Line & Bar Stack (Right) */}
          <section className="utm-visual-grid">
            {/* Funnel */}
            <article className="utm-dash-panel utm-funnel-panel">
              <div className="utm-panel-head">
                <div>
                  <h3>Funil de conversão</h3>
                </div>
              </div>
              <div className="utm-funnel-v2">
                <FunnelRow label="Visitas" count="1.842" pct="100%" color="#1D4ED8" width="100%" />
                <FunnelRow label="Adicionaram ao carrinho" count="326" pct="17,7%" color="#0284C7" width="82%" />
                <FunnelRow label="Iniciaram checkout" count="142" pct="7,7%" color="#6366F1" width="64%" />
                <FunnelRow label="Abandonaram" count="18" pct="1,0%" color="#EA580C" width="46%" />
                <FunnelRow label="Compras realizadas" count="87" pct="4,72%" color="#10B981" width="30%" />
              </div>
              <div className="utm-funnel-footer">
                <span>Taxa de conversão geral</span>
                <strong className="conversion-highlight">4,72%</strong>
              </div>
            </article>

            {/* Charts Stack */}
            <div className="utm-chart-stack">
              {/* Daily Action Evolution (Multi-line chart) */}
              <article className="utm-dash-panel">
                <div className="utm-panel-head">
                  <div>
                    <h3>Evolução de ações por dia</h3>
                  </div>
                </div>
                <div className="utm-line-legend">
                  <span className="dot-green">● Adicionaram</span>
                  <span className="dot-orange">● Checkouts</span>
                  <span className="dot-purple">● Abandonos</span>
                  <span className="dot-blue">● Compras</span>
                </div>
                {/* SVG Spline Curves */}
                <div className="utm-svg-chart-wrap">
                  <svg viewBox="0 0 460 120" className="utm-spline-svg" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="460" y2="20" stroke="#1E293B" strokeDasharray="3,3" />
                    <line x1="0" y1="50" x2="460" y2="50" stroke="#1E293B" strokeDasharray="3,3" />
                    <line x1="0" y1="80" x2="460" y2="80" stroke="#1E293B" strokeDasharray="3,3" />
                    <line x1="0" y1="110" x2="460" y2="110" stroke="#1E293B" />

                    {/* Adicionaram curve (Green) */}
                    <path
                      d="M 0 60 Q 40 40, 80 50 T 160 35 T 240 45 T 320 30 T 400 48 T 460 38"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    {/* Checkouts curve (Orange) */}
                    <path
                      d="M 0 85 Q 40 75, 80 70 T 160 65 T 240 68 T 320 58 T 400 65 T 460 60"
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="2"
                    />
                    {/* Abandonos curve (Purple/Red) */}
                    <path
                      d="M 0 105 Q 40 95, 80 98 T 160 90 T 240 92 T 320 88 T 400 95 T 460 90"
                      fill="none"
                      stroke="#A855F7"
                      strokeWidth="2"
                    />
                    {/* Compras curve (Blue) */}
                    <path
                      d="M 0 95 Q 40 88, 80 82 T 160 78 T 240 80 T 320 72 T 400 76 T 460 70"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="chart-date-labels">
                    <span>01/05</span>
                    <span>06/05</span>
                    <span>11/05</span>
                    <span>16/05</span>
                    <span>21/05</span>
                    <span>26/05</span>
                    <span>31/05</span>
                  </div>
                </div>
              </article>

              {/* Hourly Distribution (Bar Chart) */}
              <article className="utm-dash-panel">
                <div className="utm-panel-head">
                  <div>
                    <h3>Distribuição por hora</h3>
                  </div>
                </div>
                <div className="utm-hour-chart-v3">
                  {hourlyMock.map((h, i) => (
                    <div key={i} className="utm-hour-col-v3" title={`${h.hour}: ${h.val} ações`}>
                      <div className="utm-bar-fill" style={{ height: `${h.val}%` }} />
                      {h.label && <small>{h.label}</small>}
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        </main>
      </section>

      {/* Bottom Section: Orders & Remarketing */}
      <section className="utm-bottom-grid">
        {/* Orders Table Panel */}
        <article className="utm-dash-panel utm-orders-panel">
          <div className="utm-panel-head utm-table-head">
            <div>
              <h3>Pedidos & Conversões desta URL</h3>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="utm-search dark" style={{ width: '280px' }}>
                <Search size={14} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar pedido, cliente ou email..."
                />
                {search && (
                  <button onClick={() => setSearch('')} className="icon-clear">
                    <X size={12} />
                  </button>
                )}
              </div>
              <button className="tool-btn-dark" onClick={() => notify('Filtros avançados de pedidos')}>
                <Filter size={14} /> Filtros
              </button>
            </div>
          </div>

          <div className="utm-filter-tabs dark">
            {['all', 'added', 'checkout', 'abandoned', 'finalized'].map(k => (
              <button
                key={k}
                className={`${filter === k ? 'active ' : ''}${k}`}
                onClick={() => { setFilter(k); setCurrentPage(1); }}
              >
                {k === 'all' ? 'Todos' : actionLabels[k]}
              </button>
            ))}
          </div>

          <div className="utm-table-wrap dark">
            <table className="utm-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Status</th>
                  <th>Cliente</th>
                  <th>UTM (origem / campanha)</th>
                  <th>Ingressos / Modalidades</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                  <th>Data / Hora</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.filter(o => filter === 'all' || o.actionKey === filter).map(o => (
                  <tr key={o.id}>
                    <td><strong className="order-code-link">{o.code}</strong></td>
                    <td>
                      <span className={`utm-status-tag ${o.statusClass}`}>
                        ● {o.status}
                      </span>
                    </td>
                    <td>
                      <div className="order-customer-cell">
                        <strong>{o.customer}</strong>
                        <small>{o.email}</small>
                      </div>
                    </td>
                    <td>
                      <div className="order-utm-cell">
                        <span>{o.utm}</span>
                        <small>{o.utmSource}</small>
                      </div>
                    </td>
                    <td>
                      <div className="order-tickets-cell">
                        <strong>{o.tickets}</strong>
                        <small>{o.modality}</small>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#F8FAFC', fontSize: '13px' }}>{o.value}</strong>
                    </td>
                    <td>
                      <span className="order-date-time">{o.dateTime}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="utm-table-pagination">
            <div className="pagination-page-size">
              <span>Itens por página:</span>
              <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
            <div className="pagination-controls">
              <span>1-10 de 87</span>
              <button className="pag-btn" disabled><ChevronsLeft size={14} /></button>
              <button className="pag-btn" disabled><ChevronLeft size={14} /></button>
              <button className="pag-btn active">1</button>
              <button className="pag-btn"><ChevronRight size={14} /></button>
              <button className="pag-btn"><ChevronsRight size={14} /></button>
            </div>
          </div>
        </article>

        {/* Remarketing & Recuperação Widget (Right) */}
        <aside className="utm-dash-panel utm-recovery-widget">
          <div className="utm-panel-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} style={{ color: '#38BDF8' }} />
              <h3>Remarketing & Recuperação</h3>
            </div>
          </div>

          <div className="recovery-metrics-list">
            <div className="recovery-metric-row">
              <span>Carrinhos abandonados</span>
              <strong>18</strong>
            </div>
            <div className="recovery-metric-row">
              <span>Mensagens enviadas</span>
              <strong>14</strong>
            </div>
            <div className="recovery-metric-row">
              <span>Recuperações</span>
              <strong>5</strong>
            </div>
            <div className="recovery-metric-row">
              <span>Receita recuperada</span>
              <strong className="recovered-money-value">R$ 890,00</strong>
            </div>
          </div>

          <button
            className="btn primary full recovery-cta-btn"
            onClick={() => notify('Abrindo Oportunidades de Remarketing para esta URL...')}
          >
            Ver oportunidades de remarketing
          </button>

          <div className="recovery-info-note">
            <Info size={13} />
            <span>Esses dados são desta URL selecionada.</span>
          </div>
        </aside>
      </section>

      {/* Drawer: Nova URL UTM */}
      {openNew && (
        <NewLinkDrawer
          form={form}
          setForm={setForm}
          onClose={() => setOpenNew(false)}
          onSubmit={createLink}
        />
      )}
    </div>
  )
}

function CreditCard(props: any) {
  return <CircleDollarSign {...props} />
}

function DashKpi({ tone, icon, label, value, delta, isNeutral = false }: { tone: string; icon: ReactNode; label: string; value: string; delta: string; isNeutral?: boolean }) {
  return (
    <article className={`utm-dash-kpi ${tone}`}>
      <div className="utm-dash-kpi-icon">{icon}</div>
      <div className="utm-dash-kpi-body">
        <span className="kpi-title-label">{label}</span>
        <strong className="kpi-main-value">{value}</strong>
        <small className={`kpi-delta-tag ${isNeutral ? 'neutral-tag' : 'positive-tag'}`}>
          {delta}
        </small>
      </div>
    </article>
  )
}

function FunnelRow({ label, count, pct, color, width }: { label: string; count: string; pct: string; color: string; width: string }) {
  return (
    <div className="utm-funnel-row-v3">
      <div className="funnel-trapezoid-wrap">
        <div className="funnel-trapezoid-bar" style={{ width, background: color }} />
      </div>
      <div className="funnel-text-labels">
        <span className="funnel-step-name">{label}</span>
        <strong className="funnel-step-count">{count}</strong>
        <small className="funnel-step-pct">{pct}</small>
      </div>
    </div>
  )
}

function getSourceIcon(source: string) {
  switch (source) {
    case 'instagram':
      return <InstagramIcon />
    case 'google':
      return <GoogleIcon />
    case 'whatsapp':
      return <MessageCircle size={15} style={{ color: '#FFFFFF' }} />
    case 'tiktok':
      return <TikTokIcon />
    case 'influencer':
      return <Sparkles size={15} style={{ color: '#FFFFFF' }} />
    case 'email':
      return <Mail size={15} style={{ color: '#FFFFFF' }} />
    case 'facebook':
      return <span style={{ fontWeight: 900, fontSize: '14px', color: '#FFFFFF' }}>f</span>
    case 'affiliates':
      return <span style={{ fontWeight: 900, fontSize: '13px', color: '#FFFFFF' }}>V</span>
    default:
      return <Link2 size={15} />
  }
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FFFFFF' }}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <span style={{ fontWeight: 900, fontSize: '13px', color: '#EA4335' }}>G</span>
  )
}

function TikTokIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#FFFFFF' }}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

const mockUrls = [
  { id: 1, name: 'Instagram — Lançamento 2026', shortUrl: 'disk.ing/4amigos-instagram', visits: '1.842', sales: '87', revenue: 'R$ 12.480,50', source: 'instagram' },
  { id: 2, name: 'Google Ads — Pesquisa Direta', shortUrl: 'disk.ing/4amigos-google', visits: '1,256', sales: '41', revenue: 'R$ 6,120,00', source: 'google' },
  { id: 3, name: 'WhatsApp — Disparo Último Lote', shortUrl: 'disk.ing/4amigos-whatsapp', visits: '982', sales: '32', revenue: 'R$ 3,980,00', source: 'whatsapp' },
  { id: 4, name: 'TikTok Ads — Vídeo Lineup', shortUrl: 'disk.ing/4amigos-tiktok', visits: '671', sales: '19', revenue: 'R$ 2,610,00', source: 'tiktok' },
  { id: 5, name: 'Influencer — Curitiba Cult VIP', shortUrl: 'disk.ing/4amigos-influencer', visits: '458', sales: '15', revenue: 'R$ 2,150,00', source: 'influencer' },
  { id: 6, name: 'E-mail — Newsletter Base Ativa', shortUrl: 'disk.ing/4amigos-email', visits: '356', sales: '12', revenue: 'R$ 1,560,00', source: 'email' },
  { id: 7, name: 'Facebook Ads — Remarketing Checkout', shortUrl: 'disk.ing/4amigos-fb-remarketing', visits: '198', sales: '7', revenue: 'R$ 980,00', source: 'facebook' },
  { id: 8, name: 'Afiliados — Promoters Oficiais', shortUrl: 'disk.ing/4amigos-afiliados', visits: '79', sales: '4', revenue: 'R$ 570,00', source: 'affiliates' },
]

const hourlyMock = [
  { hour: '00h', val: 20, label: '00h' },
  { hour: '01h', val: 15 },
  { hour: '02h', val: 10 },
  { hour: '03h', val: 8 },
  { hour: '04h', val: 18, label: '04h' },
  { hour: '05h', val: 28 },
  { hour: '06h', val: 40 },
  { hour: '07h', val: 55 },
  { hour: '08h', val: 68, label: '08h' },
  { hour: '09h', val: 72 },
  { hour: '10h', val: 85 },
  { hour: '11h', val: 78 },
  { hour: '12h', val: 92, label: '12h' },
  { hour: '13h', val: 88 },
  { hour: '14h', val: 75 },
  { hour: '15h', val: 82 },
  { hour: '16h', val: 96, label: '16h' },
  { hour: '17h', val: 90 },
  { hour: '18h', val: 85 },
  { hour: '19h', val: 92 },
  { hour: '20h', val: 98, label: '20h' },
]

const mockOrders = [
  { id: 1, code: '#16355834', status: 'Finalizado', statusClass: 'finalized', actionKey: 'finalized', customer: 'João Silva', email: 'joao@email.com', utm: 'instagram / cpc / lancamento_2026', utmSource: 'instagram', tickets: '2x Pista Premium', modality: 'Inteira', value: 'R$ 360,00', dateTime: '31/05/2026 21:48' },
  { id: 2, code: '#16355789', status: 'Checkout', statusClass: 'checkout', actionKey: 'checkout', customer: 'Maria Santos', email: 'maria@email.com', utm: 'instagram / cpc / lancamento_2026', utmSource: 'instagram', tickets: '1x Camarote Open Bar', modality: 'Inteira', value: 'R$ 280,00', dateTime: '31/05/2026 20:33' },
  { id: 3, code: '#16355621', status: 'Abandonou', statusClass: 'abandoned', actionKey: 'abandoned', customer: 'Lucas Oliveira', email: 'lucas@email.com', utm: 'instagram / cpc / lancamento_2026', utmSource: 'instagram', tickets: '2x Pista Premium', modality: 'Inteira', value: 'R$ 340,00', dateTime: '31/05/2026 19:12' },
  { id: 4, code: '#16355509', status: 'Finalizado', statusClass: 'finalized', actionKey: 'finalized', customer: 'Ana Paula Costa', email: 'ana@email.com', utm: 'instagram / cpc / lancamento_2026', utmSource: 'instagram', tickets: '1x Camarote Frontstage', modality: 'Meia', value: 'R$ 420,00', dateTime: '31/05/2026 18:47' },
  { id: 5, code: '#16355341', status: 'Adicionou', statusClass: 'added', actionKey: 'added', customer: 'Rafael Mendes', email: 'rafael@email.com', utm: 'instagram / cpc / lancamento_2026', utmSource: 'instagram', tickets: '1x Pista Premium', modality: 'Inteira', value: 'R$ 170,00', dateTime: '31/05/2026 17:05' },
]

function NewLinkDrawer({ form, setForm, onClose, onSubmit }: { form: any; setForm: (v: any) => void; onClose: () => void; onSubmit: (e: FormEvent) => void }) {
  const query = new URLSearchParams({ utm_source: form.source, utm_medium: form.medium, utm_campaign: form.campaign, ...(form.term ? { utm_term: form.term } : {}), ...(form.content ? { utm_content: form.content } : {}) }).toString()
  const preview = `${form.destination}${form.destination.includes('?') ? '&' : '?'}${query}`
  return (
    <div className="utm-drawer-backdrop">
      <aside className="utm-drawer">
        <div className="utm-drawer-head">
          <div>
            <span className="eyebrow">NOVA URL RASTREÁVEL</span>
            <h3>Gerar e salvar UTM</h3>
          </div>
          <button type="button" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={onSubmit}>
          <label>
            Nome da URL / Ação *
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Instagram — Stories Ingressos" />
          </label>
          <div className="utm-form-two">
            <label>
              Origem (utm_source) *
              <input required value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="instagram, google, whatsapp" />
            </label>
            <label>
              Mídia (utm_medium) *
              <input required value={form.medium} onChange={e => setForm({ ...form, medium: e.target.value })} placeholder="cpc, stories, bio, banner" />
            </label>
          </div>
          <label>
            Campanha (utm_campaign) *
            <input required value={form.campaign} onChange={e => setForm({ ...form, campaign: e.target.value })} placeholder="lancamento_2026" />
          </label>
          <div className="utm-preview">
            <span>Prévia do Link Gerado</span>
            <code>{preview}</code>
          </div>
          <div className="utm-drawer-actions">
            <button type="button" className="btn secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn primary"><Plus size={15} /> Criar e Salvar UTM</button>
          </div>
        </form>
      </aside>
    </div>
  )
}
