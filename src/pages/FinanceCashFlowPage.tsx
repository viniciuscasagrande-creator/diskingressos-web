import { useState, useEffect } from 'react'
import {
  TrendingUp, ArrowDownLeft, ArrowUpRight, Download, CalendarRange,
  CircleDollarSign, Filter, RefreshCw, CheckCircle2, ChevronRight,
  Landmark, Layers, BarChart3, ArrowLeft, Calendar, Clock, AlertCircle,
  X, Eye, ShieldCheck, DollarSign, FileSpreadsheet
} from 'lucide-react'
import type { EventItem } from '../data/events'
import { monthlyCashFlow } from '../data/finance'
import {
  getCashflowProjection,
  getCashflowCalendar,
  type CashflowProjectionResponse,
  type CashflowCalendarResponse,
  type CashflowCalendarDay,
  type CashflowCalendarItem,
} from '../services/financeErpApi'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FinanceCashFlowPage({ events, notify, onNavigate }: Props) {
  const [periodFilter, setPeriodFilter] = useState<'today' | '7d' | '30d' | '90d' | 'custom'>('30d')
  const [granularity, setGranularity] = useState<'diaria' | 'semanal' | 'mensal'>('diaria')
  const [regime, setRegime] = useState<'caixa' | 'competencia'>('caixa')
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  const [projectionData, setProjectionData] = useState<CashflowProjectionResponse | null>(null)
  const [calendarData, setCalendarData] = useState<CashflowCalendarResponse | null>(null)
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<CashflowCalendarDay | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const eventIdNum = selectedEventFilter !== 'all' ? Number(selectedEventFilter) : undefined
      const [proj, cal] = await Promise.all([
        getCashflowProjection({
          eventId: eventIdNum,
          period: periodFilter,
          regime,
        }).catch(() => null),
        getCashflowCalendar({
          eventId: eventIdNum,
          month: 9,
          year: 2026,
        }).catch(() => null),
      ])

      if (proj && proj.ok) {
        setProjectionData(proj)
      } else {
        setProjectionData({
          ok: true,
          producerId: 1,
          period: periodFilter,
          regime,
          kpis: {
            initialBalanceCents: 184263045,
            realizedEntriesCents: 48500000,
            realizedExitsCents: 21000000,
            currentBalanceCents: 211763045,
            receivablesCents: 38420000,
            payablesCents: 9450000,
            projectedBalanceCents: 240733045,
            netCashflowCents: 27500000,
            netProjectedCashflowCents: 28970000,
          },
          timeline: [
            { date: '2026-09-01', label: '01/09', isPast: true, realizedEntryCents: 1200000, realizedExitCents: 400000, projectedEntryCents: 0, projectedExitCents: 0, realizedBalanceCents: 185063045, projectedBalanceCents: 185063045 },
            { date: '2026-09-04', label: '04/09', isPast: true, realizedEntryCents: 4500000, realizedExitCents: 12000000, projectedEntryCents: 0, projectedExitCents: 0, realizedBalanceCents: 177563045, projectedBalanceCents: 177563045 },
            { date: '2026-09-07', label: '07/09', isPast: true, realizedEntryCents: 32000000, realizedExitCents: 25000000, projectedEntryCents: 0, projectedExitCents: 0, realizedBalanceCents: 184563045, projectedBalanceCents: 184563045 },
            { date: '2026-09-08', label: '08/09', isPast: true, realizedEntryCents: 15400000, realizedExitCents: 8500000, projectedEntryCents: 0, projectedExitCents: 0, realizedBalanceCents: 191463045, projectedBalanceCents: 191463045 },
            { date: '2026-09-11', label: '11/09', isPast: false, realizedEntryCents: 0, realizedExitCents: 0, projectedEntryCents: 14850000, projectedExitCents: 9400000, realizedBalanceCents: null, projectedBalanceCents: 196913045 },
            { date: '2026-09-14', label: '14/09', isPast: false, realizedEntryCents: 0, realizedExitCents: 0, projectedEntryCents: 21500000, projectedExitCents: 15000000, realizedBalanceCents: null, projectedBalanceCents: 203413045 },
            { date: '2026-09-20', label: '20/09', isPast: false, realizedEntryCents: 0, realizedExitCents: 0, projectedEntryCents: 18000000, projectedExitCents: 7500000, realizedBalanceCents: null, projectedBalanceCents: 213913045 },
            { date: '2026-09-28', label: '28/09', isPast: false, realizedEntryCents: 0, realizedExitCents: 0, projectedEntryCents: 12400000, projectedExitCents: 5300000, realizedBalanceCents: null, projectedBalanceCents: 221013045 },
          ],
        })
      }

      if (cal && cal.ok) {
        setCalendarData(cal)
      } else {
        const mockDays: CashflowCalendarDay[] = []
        for (let i = 1; i <= 30; i++) {
          const items: CashflowCalendarItem[] = []
          if (i === 2) items.push({ type: 'in', title: 'Liquidação D+30 Cielo', category: 'gateway', amountCents: 18500000, status: 'liquidado' })
          if (i === 4) {
            items.push({ type: 'in', title: 'Compensação Boleto BB', category: 'boleto', amountCents: 4500000, status: 'liquidado' })
            items.push({ type: 'out', title: 'Locação Espaço Pedreira', category: 'local', amountCents: 12000000, status: 'pago' })
          }
          if (i === 7) {
            items.push({ type: 'in', title: 'Repasse Semanal Stone', category: 'gateway', amountCents: 32000000, status: 'liquidado' })
            items.push({ type: 'out', title: 'Cachê Artista Principal (1ª Parcela)', category: 'artistas', amountCents: 25000000, status: 'pago' })
          }
          if (i === 8) {
            items.push({ type: 'in', title: 'Pix Instantâneo Itaú', category: 'pix', amountCents: 15400000, status: 'liquidado' })
            items.push({ type: 'out', title: 'Empresa de Segurança & Brigada', category: 'seguranca', amountCents: 8500000, status: 'pago' })
          }
          if (i === 11) {
            items.push({ type: 'in', title: 'Recebíveis Cartão de Crédito Stone D+30', category: 'recebiveis', amountCents: 14850000, status: 'previsto' })
            items.push({ type: 'out', title: 'Fornecedor Sonorização & Rider Técnico', category: 'fornecedor', amountCents: 9400000, status: 'a_pagar' })
          }
          if (i === 12) items.push({ type: 'in', title: 'Liquidação Gateway Rede E-commerce', category: 'gateway', amountCents: 9200000, status: 'previsto' })
          if (i === 13) {
            items.push({ type: 'out', title: 'Palco, Cenografia & Painéis LED', category: 'estrutura', amountCents: 15000000, status: 'a_pagar' })
            items.push({ type: 'out', title: 'Cachê Banda de Abertura', category: 'artista', amountCents: 5000000, status: 'a_pagar' })
          }
          if (i === 14) items.push({ type: 'in', title: 'Liquidação Lotes VIP e Camarote', category: 'liquidacao', amountCents: 21500000, status: 'previsto' })
          if (i === 15) {
            items.push({ type: 'out', title: 'Contratação de Segurança Privada & Apoio', category: 'seguranca', amountCents: 6800000, status: 'a_pagar' })
            items.push({ type: 'out', title: 'Taxa de Licenciamento ECAD', category: 'tributos', amountCents: 4200000, status: 'a_pagar' })
          }
          if (i === 20) {
            items.push({ type: 'in', title: 'Recebíveis Banco Central Pix', category: 'pix', amountCents: 18000000, status: 'previsto' })
            items.push({ type: 'out', title: 'Agência de Marketing & Mídia Meta Ads', category: 'marketing', amountCents: 7500000, status: 'a_pagar' })
          }
          if (i === 25) items.push({ type: 'out', title: 'Geradores de Energia & Combustível', category: 'operacao', amountCents: 5300000, status: 'a_pagar' })
          if (i === 28) items.push({ type: 'in', title: 'Fechamento de Bilheteria Presencial PDV', category: 'pdv', amountCents: 12400000, status: 'previsto' })

          const totalIn = items.filter(x => x.type === 'in').reduce((a, b) => a + b.amountCents, 0)
          const totalOut = items.filter(x => x.type === 'out').reduce((a, b) => a + b.amountCents, 0)

          mockDays.push({
            date: `2026-09-${String(i).padStart(2, '0')}`,
            day: i,
            totalInCents: totalIn,
            totalOutCents: totalOut,
            netCents: totalIn - totalOut,
            itemsCount: items.length,
            items,
          })
        }
        setCalendarData({
          ok: true,
          year: 2026,
          month: 9,
          monthLabel: 'Setembro de 2026',
          totalMonthInCents: mockDays.reduce((a, d) => a + d.totalInCents, 0),
          totalMonthOutCents: mockDays.reduce((a, d) => a + d.totalOutCents, 0),
          days: mockDays,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [periodFilter, regime, selectedEventFilter])

  const kpis = projectionData?.kpis || {
    initialBalanceCents: 184263045,
    realizedEntriesCents: 48500000,
    realizedExitsCents: 21000000,
    currentBalanceCents: 211763045,
    receivablesCents: 38420000,
    payablesCents: 9450000,
    projectedBalanceCents: 240733045,
    netCashflowCents: 27500000,
    netProjectedCashflowCents: 28970000,
  }

  const exportCashFlowCSV = () => {
    const headers = ['Mes', 'Receita Bruta (R$)', 'Despesas Operacionais (R$)', 'Repasses Liquidados (R$)', 'Saldo Liquido do Mes (R$)']
    const rows = [headers.join(';')]
    monthlyCashFlow.forEach(m => {
      const net = m.receita - m.despesa - m.repasse
      rows.push([
        m.month,
        m.receita.toFixed(2).replace('.', ','),
        m.despesa.toFixed(2).replace('.', ','),
        m.repasse.toFixed(2).replace('.', ','),
        net.toFixed(2).replace('.', ',')
      ].join(';'))
    })
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fluxo_de_caixa_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify('Demonstração de Fluxo de Caixa (DFC) exportada com sucesso em CSV!')
  }

  const timeline = projectionData?.timeline || []
  const maxBarValue = Math.max(
    100000,
    ...timeline.map(t => Math.max(t.realizedEntryCents, t.realizedExitCents, t.projectedEntryCents, t.projectedExitCents))
  )

  return (
    <div className="finance-dashboard-wrapper space-y-6">
      {/* Botão de Retorno e Toggle de Regime */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => (onNavigate ? onNavigate('finance-dashboard') : window.history.back())}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>

        {/* Toggle Regime de Caixa vs Regime de Competência */}
        <div className="flex items-center bg-[#0b1320] p-1 rounded-xl border border-slate-700/80 shadow-inner">
          <button
            onClick={() => {
              setRegime('caixa')
              notify('Exibindo fluxo sob Regime de Caixa (data de liquidação financeira).')
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              regime === 'caixa'
                ? 'bg-[#0284c7] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CircleDollarSign size={13} />
            Regime de Caixa
          </button>
          <button
            onClick={() => {
              setRegime('competencia')
              notify('Exibindo fluxo sob Regime de Competência (data do fato gerador/venda).')
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              regime === 'competencia'
                ? 'bg-[#0284c7] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarRange size={13} />
            Regime de Competência
          </button>
        </div>
      </div>

      {/* Header Section */}
      <section className="finance-header-section card-surface">
        <div className="finance-header-left">
          <span className="eyebrow">PLANEJAMENTO DE LIQUIDEZ & TESOURARIA</span>
          <div className="finance-title-row">
            <h1>Fluxo de Caixa Realizado & Projetado</h1>
            <span className="pipeline-status-badge">
              <CheckCircle2 size={13} /> Previsibilidade Ativa
            </span>
          </div>
          <p className="page-subtitle">
            Acompanhamento integrado de entradas e saídas realizadas no saldo da conta, cruzado com contas a receber e pagar para projetar a liquidez futura do produtor.
          </p>
        </div>

        <div className="finance-header-controls flex flex-wrap items-center gap-3">
          {/* Filtro de Evento */}
          <div className="finance-select-group">
            <span>Evento</span>
            <select
              value={selectedEventFilter}
              onChange={e => setSelectedEventFilter(e.target.value)}
              className="bg-[#0b1320] text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs"
            >
              <option value="all">Todos os Eventos do Produtor</option>
              {events.map(ev => (
                <option key={ev.id} value={String(ev.id)}>
                  {ev.title} ({ev.code || ev.id})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Período */}
          <div className="flex items-center gap-1 bg-[#0b1320] p-1 rounded-lg border border-slate-700">
            {(
              [
                { id: 'today', label: 'Hoje' },
                { id: '7d', label: '7 dias' },
                { id: '30d', label: '30 dias' },
                { id: '90d', label: '90 dias' },
              ] as const
            ).map(opt => (
              <button
                key={opt.id}
                onClick={() => setPeriodFilter(opt.id)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  periodFilter === opt.id
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Granularidade */}
          <div className="finance-select-group">
            <span>Granularidade</span>
            <select
              value={granularity}
              onChange={e => setGranularity(e.target.value as any)}
              className="bg-[#0b1320] text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs"
            >
              <option value="diaria">Visão Diária</option>
              <option value="semanal">Visão Semanal</option>
              <option value="mensal">Visão Mensal</option>
            </select>
          </div>

          <div className="finance-action-buttons">
            <button className="tool-btn" onClick={exportCashFlowCSV} title="Exportar DFC em CSV">
              <Download size={14} /> Exportar DFC
            </button>
          </div>
        </div>
      </section>

      {/* Grid de KPIs: Realizado × Projetado */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {/* 1. Saldo Inicial */}
        <div className="bg-[#0f172a]/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Saldo Inicial</span>
          <strong className="text-base text-slate-100 block mt-1">{brl(kpis.initialBalanceCents / 100)}</strong>
          <span className="text-[10px] text-slate-500 mt-1 block">Posição de abertura</span>
        </div>

        {/* 2. Entradas Realizadas */}
        <div className="bg-[#0f172a]/90 border border-emerald-950/60 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Entradas Realizadas</span>
            <ArrowDownLeft size={14} className="text-emerald-400" />
          </div>
          <strong className="text-base text-emerald-300 block mt-1">+{brl(kpis.realizedEntriesCents / 100)}</strong>
          <span className="text-[10px] text-emerald-500/80 mt-1 block">Recebimentos no banco</span>
        </div>

        {/* 3. Saídas Realizadas */}
        <div className="bg-[#0f172a]/90 border border-rose-950/60 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Saídas Realizadas</span>
            <ArrowUpRight size={14} className="text-rose-400" />
          </div>
          <strong className="text-base text-rose-300 block mt-1">-{brl(kpis.realizedExitsCents / 100)}</strong>
          <span className="text-[10px] text-rose-500/80 mt-1 block">Pagamentos liquidados</span>
        </div>

        {/* 4. Saldo Atual (Caixa Efetivo) */}
        <div className="bg-[#0f172a]/90 border-2 border-cyan-500/50 rounded-xl p-3.5 shadow-md bg-gradient-to-br from-cyan-950/20 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">Saldo Atual</span>
            <CircleDollarSign size={14} className="text-cyan-400" />
          </div>
          <strong className="text-base text-white block mt-1 font-extrabold">{brl(kpis.currentBalanceCents / 100)}</strong>
          <span className="text-[10px] text-cyan-400 font-medium mt-1 block">Disponível agora em conta</span>
        </div>

        {/* 5. A Receber (Projetado) */}
        <div className="bg-[#0f172a]/90 border border-blue-950/60 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">A Receber</span>
            <CalendarRange size={14} className="text-blue-400" />
          </div>
          <strong className="text-base text-blue-300 block mt-1">+{brl(kpis.receivablesCents / 100)}</strong>
          <span className="text-[10px] text-blue-500/80 mt-1 block">Gateways & parcelamentos</span>
        </div>

        {/* 6. A Pagar (Projetado) */}
        <div className="bg-[#0f172a]/90 border border-amber-950/60 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">A Pagar</span>
            <Clock size={14} className="text-amber-400" />
          </div>
          <strong className="text-base text-amber-300 block mt-1">-{brl(kpis.payablesCents / 100)}</strong>
          <span className="text-[10px] text-amber-500/80 mt-1 block">Fornecedores & produção</span>
        </div>

        {/* 7. Saldo Projetado Final */}
        <div className="bg-[#0f172a]/90 border-2 border-purple-500/50 rounded-xl p-3.5 shadow-md bg-gradient-to-br from-purple-950/30 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Saldo Projetado</span>
            <TrendingUp size={14} className="text-purple-400" />
          </div>
          <strong className="text-base text-white block mt-1 font-extrabold">{brl(kpis.projectedBalanceCents / 100)}</strong>
          <span className="text-[10px] text-purple-300 font-medium mt-1 block">Final do período</span>
        </div>
      </section>

      {/* Gráfico de Evolução: Realizado (passado) vs Projetado (futuro) */}
      <section className="finance-chart-box card-surface">
        <div className="card-heading flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-[#06B6D4]" />
              <h3 className="text-base font-bold text-slate-100">Curva de Evolução Financeira (Realizado × Projetado)</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Barras sólidas representam movimentações já liquidadas no extrato; barras tracejadas indicam liquidações e vencimentos futuros agendados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Entradas Realizadas
            </span>
            <span className="flex items-center gap-1.5 text-rose-400 font-medium">
              <span className="w-3 h-3 rounded bg-rose-500 inline-block" /> Saídas Realizadas
            </span>
            <span className="flex items-center gap-1.5 text-blue-400 font-medium">
              <span className="w-3 h-3 rounded bg-blue-500/50 border border-blue-400 border-dashed inline-block" /> Previsão a Receber
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <span className="w-3 h-3 rounded bg-amber-500/50 border border-amber-400 border-dashed inline-block" /> Previsão a Pagar
            </span>
          </div>
        </div>

        {/* Timeline Bars */}
        <div className="pt-6 pb-2 overflow-x-auto">
          <div className="flex items-end justify-between min-w-[700px] h-[220px] gap-2 px-2 border-b border-slate-700/60 pb-3">
            {timeline.map((point, idx) => {
              const entryCents = point.isPast ? point.realizedEntryCents : point.projectedEntryCents
              const exitCents = point.isPast ? point.realizedExitCents : point.projectedExitCents
              const entryHeight = Math.max(8, Math.min(170, Math.round((entryCents / maxBarValue) * 170)))
              const exitHeight = Math.max(8, Math.min(170, Math.round((exitCents / maxBarValue) * 170)))

              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-[#0b1320] border border-slate-700 text-slate-200 text-[11px] p-2 rounded-lg shadow-xl z-20 pointer-events-none whitespace-nowrap">
                    <strong className="text-white block">{point.label} ({point.isPast ? 'Realizado' : 'Projetado'})</strong>
                    <div className="text-emerald-400 mt-0.5">Entrada: {brl(entryCents / 100)}</div>
                    <div className="text-rose-400">Saída: {brl(exitCents / 100)}</div>
                    <div className="text-purple-300 font-semibold mt-1 border-t border-slate-800 pt-0.5">
                      Saldo Projetado: {brl(point.projectedBalanceCents / 100)}
                    </div>
                  </div>

                  {/* Par de Barras */}
                  <div className="flex items-end gap-1 mb-1 w-full justify-center">
                    {/* Barra de Entrada */}
                    <div
                      style={{ height: `${entryHeight}px` }}
                      className={`w-3 sm:w-4 rounded-t transition-all ${
                        point.isPast
                          ? 'bg-emerald-500 hover:bg-emerald-400'
                          : 'bg-blue-500/70 border border-blue-400 border-dashed hover:bg-blue-500'
                      }`}
                    />
                    {/* Barra de Saída */}
                    <div
                      style={{ height: `${exitHeight}px` }}
                      className={`w-3 sm:w-4 rounded-t transition-all ${
                        point.isPast
                          ? 'bg-rose-500 hover:bg-rose-400'
                          : 'bg-amber-500/70 border border-amber-400 border-dashed hover:bg-amber-500'
                      }`}
                    />
                  </div>

                  {/* Rótulo de Data e Linha Divisória Hoje */}
                  <span className="text-[10px] text-slate-400 font-medium mt-2">{point.label}</span>
                  {!point.isPast && timeline[idx - 1]?.isPast && (
                    <span className="absolute -top-3 text-[9px] font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/50">
                      Hoje
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CALENDÁRIO OPERACIONAL FINANCEIRO INTERATIVO (ITEM 2 DO PEDIDO)
          ========================================================================= */}
      <section className="finance-table-section card-surface">
        <div className="table-header-tabs flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#06B6D4]" />
              <h3 className="text-base font-bold text-slate-100">Calendário Financeiro Operacional</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualize entradas previstas (gateways, recebíveis) e saídas operacionais agendadas (artistas, fornecedores, impostos) dia a dia. Clique em qualquer dia para inspecionar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              {calendarData?.monthLabel || 'Setembro de 2026'}
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-emerald-950/60 border border-emerald-800/80 rounded text-emerald-300 font-semibold">
                ↑ Entradas: {brl((calendarData?.totalMonthInCents || 0) / 100)}
              </span>
              <span className="px-2 py-1 bg-rose-950/60 border border-rose-800/80 rounded text-rose-300 font-semibold">
                ↓ Saídas: {brl((calendarData?.totalMonthOutCents || 0) / 100)}
              </span>
            </div>
          </div>
        </div>

        {/* Grid do Calendário */}
        <div className="mt-4">
          {/* Cabeçalho dos Dias da Semana */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 pb-2 border-b border-slate-800">
            <div>DOM</div>
            <div>SEG</div>
            <div>TER</div>
            <div>QUA</div>
            <div>QUI</div>
            <div>SEX</div>
            <div>SÁB</div>
          </div>

          {/* Células dos Dias */}
          <div className="grid grid-cols-7 gap-1.5 mt-2">
            {/* Offset inicial (Setembro de 2026 começa na Terça-feira) */}
            <div className="bg-slate-900/30 rounded-lg min-h-[90px] border border-slate-800/30 opacity-30" />
            <div className="bg-slate-900/30 rounded-lg min-h-[90px] border border-slate-800/30 opacity-30" />

            {(calendarData?.days || []).map(day => {
              const hasEvents = day.items.length > 0
              const isToday = day.day === 11

              return (
                <div
                  key={day.date}
                  onClick={() => hasEvents && setSelectedCalendarDay(day)}
                  className={`rounded-lg p-2 min-h-[90px] flex flex-col justify-between transition border ${
                    hasEvents
                      ? 'bg-[#0f172a] hover:bg-[#1e293b] border-slate-700 cursor-pointer shadow-sm hover:border-cyan-500'
                      : 'bg-[#0a0f18] border-slate-850 opacity-60'
                  } ${isToday ? 'ring-2 ring-cyan-500' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                        isToday ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
                      }`}
                    >
                      {day.day}
                    </span>
                    {hasEvents && (
                      <span className="text-[10px] bg-slate-800 text-cyan-400 font-semibold px-1.5 py-0.5 rounded">
                        {day.items.length} {day.items.length === 1 ? 'item' : 'itens'}
                      </span>
                    )}
                  </div>

                  {/* Mini Tags de Entradas e Saídas do Dia */}
                  <div className="space-y-1 mt-1">
                    {day.totalInCents > 0 && (
                      <div className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1 py-0.5 rounded flex items-center justify-between">
                        <span>↑</span>
                        <span>{brl(day.totalInCents / 100)}</span>
                      </div>
                    )}
                    {day.totalOutCents > 0 && (
                      <div className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-1 py-0.5 rounded flex items-center justify-between">
                        <span>↓</span>
                        <span>{brl(day.totalOutCents / 100)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          TABELA DFC MENSAL (CONSOLIDAÇÃO CONTÁBIL)
          ========================================================================= */}
      <section className="finance-table-section card-surface">
        <div className="table-header-tabs">
          <div className="card-heading">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-[#06B6D4]" />
                <h3 className="text-base font-bold text-slate-100">Demonstração do Fluxo de Caixa Mensal (DFC)</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Estrutura contábil por grupos de receitas operacionais, custos e repasses transferidos.
              </p>
            </div>
          </div>
        </div>

        <div className="lots-table-wrap">
          <table className="lots-table finance-table">
            <thead>
              <tr>
                <th>Mês de Competência</th>
                <th style={{ textAlign: 'right' }}>Receita Bruta (Vendas)</th>
                <th style={{ textAlign: 'right' }}>Despesas & Gateway</th>
                <th style={{ textAlign: 'right' }}>Repasses Liquidados</th>
                <th style={{ textAlign: 'right' }}>Resultado do Mês</th>
                <th style={{ textAlign: 'center' }}>Margem Líquida</th>
              </tr>
            </thead>
            <tbody>
              {monthlyCashFlow.map(m => {
                const net = m.receita - m.despesa - m.repasse
                const margin = ((net / m.receita) * 100).toFixed(1)
                return (
                  <tr key={m.month}>
                    <td>
                      <strong>{m.month} de 2026</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#10B981' }}>+ {brl(m.receita)}</strong>
                    </td>
                    <td style={{ textAlign: 'right', color: '#F43F5E' }}>- {brl(m.despesa)}</td>
                    <td style={{ textAlign: 'right', color: '#3B82F6' }}>- {brl(m.repasse)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <strong style={{ color: net >= 0 ? '#10B981' : '#EF4444', fontSize: '14px' }}>
                        {brl(net)}
                      </strong>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="kpi-tag positive">{margin}%</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          MODAL DE INSPEÇÃO DO DIA DO CALENDÁRIO
          ========================================================================= */}
      {selectedCalendarDay && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1320] border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <Calendar size={18} className="text-cyan-400" />
                <h3 className="font-bold text-white text-base">
                  Agenda Financeira: {selectedCalendarDay.day} de Setembro de 2026
                </h3>
              </div>
              <button
                onClick={() => setSelectedCalendarDay(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Resumo do Dia */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 bg-[#070c14] p-3 rounded-xl border border-slate-800 text-center">
                <div>
                  <span className="text-[11px] text-slate-400 block">Entradas Previstas</span>
                  <strong className="text-emerald-400 text-sm">{brl(selectedCalendarDay.totalInCents / 100)}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Saídas Previstas</span>
                  <strong className="text-rose-400 text-sm">{brl(selectedCalendarDay.totalOutCents / 100)}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Saldo Líquido</span>
                  <strong
                    className={`text-sm ${
                      selectedCalendarDay.netCents >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {brl(selectedCalendarDay.netCents / 100)}
                  </strong>
                </div>
              </div>

              {/* Lista de Itens do Dia */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Lançamentos Programados ({selectedCalendarDay.items.length})
                </span>
                {selectedCalendarDay.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0e1726] border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          item.type === 'in'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                            : 'bg-rose-950 text-rose-400 border border-rose-800/80'
                        }`}
                      >
                        {item.type === 'in' ? '↑' : '↓'}
                      </div>
                      <div>
                        <strong className="text-xs text-white block">{item.title}</strong>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">{item.category}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded">
                            {item.status === 'liquidado' || item.status === 'pago' ? 'Efetivado' : 'Agendado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <strong
                      className={`text-sm ${
                        item.type === 'in' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.type === 'in' ? '+' : '-'} {brl(item.amountCents / 100)}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-900/60 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCalendarDay(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
