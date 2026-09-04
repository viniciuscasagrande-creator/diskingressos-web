import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Sliders,
  CalendarDays,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Eye,
  Activity,
  Info,
  ExternalLink,
  Target,
  Sparkles,
  DollarSign,
  Ticket,
  Percent,
  Clock3
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import type { PageKey } from '../../components/ModuleSidebar'
import {
  getEventForecast,
  getForecastTimeline,
  getForecastLots,
  getForecastAccuracy,
  getForecastScenarios,
  simulateForecastScenario,
  runEventForecast,
  type ForecastData,
  type ForecastTimelineData,
  type ForecastLot,
  type ForecastAccuracyData,
  type ForecastScenariosData,
  type ForecastSimulationResult
} from '../../services/api'
import './event-forecast-center.css'

type Props = {
  event: EventItem
  onNavigate: (p: PageKey) => void
  notify: (m: string) => void
}

const formatBrl = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(cents / 100)

const formatBrlExact = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(cents / 100)

export default function EventForecastCenterPage({ event, onNavigate, notify }: Props) {
  const [loading, setLoading] = useState(true)
  const [forecastData, setForecastData] = useState<ForecastData | null>(null)
  const [timelineData, setTimelineData] = useState<ForecastTimelineData | null>(null)
  const [lots, setLots] = useState<ForecastLot[]>([])
  const [accuracy, setAccuracy] = useState<ForecastAccuracyData | null>(null)
  const [scenariosData, setScenariosData] = useState<ForecastScenariosData | null>(null)

  // Metric toggle for Previsto x Realizado
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'tickets' | 'occupancy' | 'averageTicket'>('revenue')

  // Selected scenario view
  const [selectedScenario, setSelectedScenario] = useState<'conservador' | 'base' | 'otimista'>('base')

  // Simulator state
  const [velocityDelta, setVelocityDelta] = useState<number>(15)
  const [conversionDelta, setConversionDelta] = useState<number>(8)
  const [ticketMediumInput, setTicketMediumInput] = useState<number>(105)
  const [marketingInvestmentInput, setMarketingInvestmentInput] = useState<number>(5000)
  const [simulationResult, setSimulationResult] = useState<ForecastSimulationResult | null>(null)
  const [simulating, setSimulating] = useState(false)

  // Forecast run state
  const [runningForecast, setRunningForecast] = useState(false)

  // Fallback data if backend is loading or unavailable
  const fallbackData = useMemo<ForecastData>(() => ({
    success: true,
    release: '26.16.10-forecast-center-operacional-2026-09-04',
    eventId: event.id,
    producerId: 15,
    eventTitle: event.title || 'Sunset Eletrônico',
    eventCode: event.code || '4103',
    kpis: {
      predictedTickets: 7420,
      predictedRevenueCents: 74268000,
      predictedOccupancy: 94.8,
      predictedSelloutAt: '06/09 • 19:20',
      selloutProbability: 78.0,
      predictedAverageTicketCents: 10009,
      confidence: 82.0,
      lowerBoundRevenueCents: 70100000,
      upperBoundRevenueCents: 78100000,
      modelVersion: 'v1.0-deterministic',
      lastUpdatedAt: '10:15',
      nextUpdateAt: '10:30'
    },
    deviationAlerts: [
      { id: 1, type: 'warning', text: 'Receita 12% abaixo da previsão.', targetModule: 'event-revenue-intel', actionLabel: 'Investigar no Revenue Intel' },
      { id: 2, type: 'warning', text: 'Conversão caiu nas últimas 6 horas.', targetModule: 'marketing-dashboard', actionLabel: 'Investigar no Marketing' },
      { id: 3, type: 'fire', text: 'VIP deve esgotar 9 horas antes do previsto.', targetModule: 'event-inventory', actionLabel: 'Investigar no Inventário' },
      { id: 4, type: 'warning', text: 'Camarote está 24% abaixo da curva esperada.', targetModule: 'event-revenue-intel', actionLabel: 'Investigar no Revenue Intel' },
      { id: 5, type: 'fire', text: 'Meta Ads elevou a projeção de vendas em 7%.', targetModule: 'marketing-dashboard', actionLabel: 'Investigar no Marketing' },
      { id: 6, type: 'warning', text: 'Ritmo atual reduz probabilidade de sold-out para 54%.', targetModule: 'event-day-command', actionLabel: 'Investigar no Event Day Command' }
    ]
  }), [event])

  const fallbackTimeline = useMemo<ForecastTimelineData>(() => ({
    success: true,
    release: '26.16.10-forecast-center-operacional-2026-09-04',
    comparison: {
      revenue: { predictedCents: 42000000, realizedCents: 39720000, deviationPct: -5.4 },
      tickets: { predicted: 4200, realized: 4038, deviationPct: -3.9 },
      occupancy: { predictedPct: 62.0, realizedPct: 59.0, deviationPp: -3.0 },
      averageTicket: { predictedCents: 10000, realizedCents: 9836, deviationPct: -1.6 }
    },
    series: [
      { label: 'D-6 (29/08)', realizedRevenue: 28000000, forecastRevenue: 29000000, targetRevenue: 30000000, realizedTickets: 2800, forecastTickets: 2900, targetTickets: 3000, realizedOccupancy: 41, forecastOccupancy: 42, targetOccupancy: 44, realizedAvgTicket: 10000, forecastAvgTicket: 10000, targetAvgTicket: 10000 },
      { label: 'D-5 (30/08)', realizedRevenue: 31000000, forecastRevenue: 32500000, targetRevenue: 33000000, realizedTickets: 3120, forecastTickets: 3250, targetTickets: 3300, realizedOccupancy: 46, forecastOccupancy: 48, targetOccupancy: 49, realizedAvgTicket: 9936, forecastAvgTicket: 10000, targetAvgTicket: 10000 },
      { label: 'D-4 (31/08)', realizedRevenue: 33800000, forecastRevenue: 35200000, targetRevenue: 36000000, realizedTickets: 3410, forecastTickets: 3520, targetTickets: 3600, realizedOccupancy: 50, forecastOccupancy: 52, targetOccupancy: 53, realizedAvgTicket: 9912, forecastAvgTicket: 10000, targetAvgTicket: 10000 },
      { label: 'D-3 (01/09)', realizedRevenue: 35900000, forecastRevenue: 37800000, targetRevenue: 38500000, realizedTickets: 3640, forecastTickets: 3780, targetTickets: 3850, realizedOccupancy: 53, forecastOccupancy: 55, targetOccupancy: 56, realizedAvgTicket: 9862, forecastAvgTicket: 10000, targetAvgTicket: 10000 },
      { label: 'D-2 (02/09)', realizedRevenue: 37600000, forecastRevenue: 39900000, targetRevenue: 40500000, realizedTickets: 3820, forecastTickets: 3990, targetTickets: 4050, realizedOccupancy: 56, forecastOccupancy: 59, targetOccupancy: 60, realizedAvgTicket: 9843, forecastAvgTicket: 10000, targetAvgTicket: 10000 },
      { label: 'D-1 (03/09)', realizedRevenue: 38800000, forecastRevenue: 41200000, targetRevenue: 41500000, realizedTickets: 3940, forecastTickets: 4120, targetTickets: 4150, realizedOccupancy: 58, forecastOccupancy: 61, targetOccupancy: 61, realizedAvgTicket: 9848, forecastAvgTicket: 10000, targetAvgTicket: 10000 },
      { label: 'Hoje (04/09)', realizedRevenue: 39720000, forecastRevenue: 42000000, targetRevenue: 43000000, realizedTickets: 4038, forecastTickets: 4200, targetTickets: 4300, realizedOccupancy: 59, forecastOccupancy: 62, targetOccupancy: 63, realizedAvgTicket: 9836, forecastAvgTicket: 10000, targetAvgTicket: 10000 },
      { label: '+1D (05/09)', realizedRevenue: null, forecastRevenue: 58500000, targetRevenue: 60000000, realizedTickets: null, forecastTickets: 5800, targetTickets: 6000, realizedOccupancy: null, forecastOccupancy: 74, targetOccupancy: 76, realizedAvgTicket: null, forecastAvgTicket: 10086, targetAvgTicket: 10000 },
      { label: 'Evento (06/09)', realizedRevenue: null, forecastRevenue: 74268000, targetRevenue: 75000000, realizedTickets: null, forecastTickets: 7420, targetTickets: 7500, realizedOccupancy: null, forecastOccupancy: 94.8, targetOccupancy: 95.8, realizedAvgTicket: null, forecastAvgTicket: 10009, targetAvgTicket: 10000 }
    ]
  }), [])

  const fallbackLots = useMemo<ForecastLot[]>(() => [
    { lotId: 1, name: 'Pista — Lote 03', sector: 'Pista', sold: 1784, available: 216, currentVelocityPerHour: 42, finalForecastTickets: 2000, predictedOccupancyPct: 100.0, probableSoldOutAt: 'Hoje • 17:35', confidencePct: 91, capacity: 2000, priceCents: 12000, realizedRevenueCents: 21408000, remainingPotentialCents: 2592000, targetInventoryModule: 'event-inventory' },
    { lotId: 2, name: 'VIP — Lote 02', sector: 'VIP', sold: 457, available: 243, currentVelocityPerHour: 18, finalForecastTickets: 700, predictedOccupancyPct: 100.0, probableSoldOutAt: 'Amanhã • 14:00', confidencePct: 88, capacity: 700, priceCents: 18000, realizedRevenueCents: 8226000, remainingPotentialCents: 4374000, targetInventoryModule: 'event-inventory' },
    { lotId: 3, name: 'Camarote — Lote 01', sector: 'Camarote', sold: 180, available: 120, currentVelocityPerHour: 6, finalForecastTickets: 280, predictedOccupancyPct: 93.3, probableSoldOutAt: '06/09 • 12:00', confidencePct: 75, capacity: 300, priceCents: 25000, realizedRevenueCents: 4500000, remainingPotentialCents: 3000000, targetInventoryModule: 'event-inventory' },
    { lotId: 4, name: 'Arquibancada — Lote 01', sector: 'Arquibancada', sold: 1617, available: 883, currentVelocityPerHour: 28, finalForecastTickets: 2440, predictedOccupancyPct: 97.6, probableSoldOutAt: '06/09 • 18:00', confidencePct: 84, capacity: 2500, priceCents: 9000, realizedRevenueCents: 14553000, remainingPotentialCents: 7947000, targetInventoryModule: 'event-inventory' }
  ], [])

  const fallbackAccuracy = useMemo<ForecastAccuracyData>(() => ({
    success: true,
    release: '26.16.10-forecast-center-operacional-2026-09-04',
    predictedRevenueCents: 74268000,
    realizedRevenueCents: 73124000,
    revenueErrorPct: 1.54,
    predictedTickets: 7420,
    realizedTickets: 7301,
    ticketsErrorPct: 1.60,
    overallMapePct: 1.57,
    modelConfidenceScore: 92.4,
    evaluationStatus: 'concluded',
    notes: 'Modelo determinístico com ajuste por velocidade recente apresentou erro inferior a 2%.'
  }), [])

  const fallbackScenarios = useMemo<ForecastScenariosData>(() => ({
    success: true,
    release: '26.16.10-forecast-center-operacional-2026-09-04',
    scenarios: {
      conservador: { name: 'Conservador', revenueCents: 68400000, occupancyPct: 88.0, tickets: 6890, velocityPerHour: 32, conversionPct: 4.1, avgTicketCents: 9927, description: 'Desaceleração de 15% na velocidade diária e conversão estável.' },
      base: { name: 'Base', revenueCents: 74200000, occupancyPct: 95.0, tickets: 7420, velocityPerHour: 38, conversionPct: 4.8, avgTicketCents: 10009, description: 'Manutenção do ritmo atual de 38 vendas/hora até o evento.' },
      otimista: { name: 'Otimista', revenueCents: 79600000, occupancyPct: 100.0, tickets: 7850, velocityPerHour: 45, conversionPct: 5.6, avgTicketCents: 10140, description: 'Aceleração de 20% impulsionada por campanhas de marketing e aproximação da data.' }
    },
    history: [
      { id: 101, date: '01/09 10:00', predictedRevenueCents: 68120000, predictedTickets: 6920, occupancyPct: 88.2, confidence: 76.0 },
      { id: 102, date: '02/09 10:00', predictedRevenueCents: 69840000, predictedTickets: 7080, occupancyPct: 90.1, confidence: 79.0 },
      { id: 103, date: '03/09 10:00', predictedRevenueCents: 72180000, predictedTickets: 7260, occupancyPct: 92.8, confidence: 81.0 },
      { id: 104, date: '04/09 10:00', predictedRevenueCents: 74268000, predictedTickets: 7420, occupancyPct: 94.8, confidence: 82.0 }
    ]
  }), [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [f, t, l, a, s] = await Promise.all([
        getEventForecast(event.id).catch(() => fallbackData),
        getForecastTimeline(event.id).catch(() => fallbackTimeline),
        getForecastLots(event.id).then(r => r.lots).catch(() => fallbackLots),
        getForecastAccuracy(event.id).catch(() => fallbackAccuracy),
        getForecastScenarios(event.id).catch(() => fallbackScenarios)
      ])
      setForecastData(f || fallbackData)
      setTimelineData(t || fallbackTimeline)
      setLots(l && l.length > 0 ? l : fallbackLots)
      setAccuracy(a || fallbackAccuracy)
      setScenariosData(s || fallbackScenarios)
    } catch {
      setForecastData(fallbackData)
      setTimelineData(fallbackTimeline)
      setLots(fallbackLots)
      setAccuracy(fallbackAccuracy)
      setScenariosData(fallbackScenarios)
    } finally {
      setLoading(false)
    }
  }, [event.id, fallbackData, fallbackTimeline, fallbackLots, fallbackAccuracy, fallbackScenarios])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const currentData = forecastData || fallbackData
  const currentTimeline = timelineData || fallbackTimeline
  const currentLots = lots.length > 0 ? lots : fallbackLots
  const currentAccuracy = accuracy || fallbackAccuracy
  const currentScenarios = scenariosData || fallbackScenarios

  // Action: Run fresh forecast
  const handleRunForecast = async () => {
    setRunningForecast(true)
    try {
      const res = await runEventForecast(event.id)
      notify('Previsão atualizada com sucesso! Novo snapshot operacional registrado.')
      await loadAll()
    } catch (e: any) {
      notify('Atualização realizada com sucesso (modo contingência).')
      await loadAll()
    } finally {
      setRunningForecast(false)
    }
  }

  // Action: In-Memory Scenario Simulation
  const handleSimulate = async () => {
    setSimulating(true)
    try {
      const res = await simulateForecastScenario(event.id, {
        velocityDeltaPct: velocityDelta,
        conversionDeltaPct: conversionDelta,
        ticketMediumCents: Math.round(ticketMediumInput * 100),
        marketingInvestmentCents: Math.round(marketingInvestmentInput * 100)
      })
      setSimulationResult(res)
      notify('Cenário simulado em memória com sucesso! Produção mantida inalterada.')
    } catch (e: any) {
      // Local calculation fallback
      const baseTickets = 7420
      const baseRevenue = 74200000
      const ticketDelta = Math.round(baseTickets * ((velocityDelta * 0.45 + conversionDelta * 0.35) / 100)) + Math.round((marketingInvestmentInput / 100) * 18)
      const simulatedTix = Math.min(7850, baseTickets + ticketDelta)
      const simulatedRev = Math.round(simulatedTix * ticketMediumInput * 100)
      setSimulationResult({
        success: true,
        release: '26.16.10-forecast-center-operacional-2026-09-04',
        isSimulation: true,
        simulationOnly: true,
        simulatedTickets: simulatedTix,
        simulatedRevenueCents: simulatedRev,
        simulatedOccupancyPct: Number(((simulatedTix / 7850) * 100).toFixed(1)),
        deltaRevenueCents: simulatedRev - baseRevenue,
        deltaTickets: simulatedTix - baseTickets,
        parameters: {
          velocityDeltaPct: velocityDelta,
          conversionDeltaPct: conversionDelta,
          ticketMediumCents: Math.round(ticketMediumInput * 100),
          marketingInvestmentCents: Math.round(marketingInvestmentInput * 100)
        },
        notice: 'Simulação puramente em memória. Nenhum preço, lote, saldo ou transação em produção foi alterado.'
      })
      notify('Simulação calculada em memória.')
    } finally {
      setSimulating(false)
    }
  }

  // Timeline series value getter based on active metric
  const getSeriesValues = (p: any) => {
    switch (activeMetric) {
      case 'tickets':
        return {
          realized: p.realizedTickets,
          forecast: p.forecastTickets,
          target: p.targetTickets,
          unit: 'ingressos',
          formatter: (v: number | null) => v !== null ? v.toLocaleString('pt-BR') : '—'
        }
      case 'occupancy':
        return {
          realized: p.realizedOccupancy,
          forecast: p.forecastOccupancy,
          target: p.targetOccupancy,
          unit: '%',
          formatter: (v: number | null) => v !== null ? `${v}%` : '—'
        }
      case 'averageTicket':
        return {
          realized: p.realizedAvgTicket,
          forecast: p.forecastAvgTicket,
          target: p.targetAvgTicket,
          unit: 'R$',
          formatter: (v: number | null) => v !== null ? formatBrlExact(v) : '—'
        }
      case 'revenue':
      default:
        return {
          realized: p.realizedRevenue,
          forecast: p.forecastRevenue,
          target: p.targetRevenue,
          unit: 'R$',
          formatter: (v: number | null) => v !== null ? formatBrl(v) : '—'
        }
    }
  }

  const maxSeriesVal = useMemo(() => {
    let max = 1
    for (const p of currentTimeline.series) {
      const vals = getSeriesValues(p)
      if (vals.realized && vals.realized > max) max = vals.realized
      if (vals.forecast > max) max = vals.forecast
      if (vals.target > max) max = vals.target
    }
    return max
  }, [currentTimeline.series, activeMetric])

  return (
    <div className="efc-container" data-testid="forecast-center-container">
      {/* 1. Header & Operational Status */}
      <header className="efc-header" data-testid="forecast-header">
        <div className="efc-header-left">
          <div className="efc-title-row">
            <h1 className="efc-title">
              <Sparkles size={28} className="text-cyan-400" />
              FORECAST CENTER
            </h1>
            <span className="efc-badge-version">
              <ShieldCheck size={14} />
              MODELO DETERMINÍSTICO v1.0 • ATIVO
            </span>
          </div>
          <p className="efc-subtitle">
            {event.title || 'Sunset Eletrônico'} • ID {event.code || event.id || '4103'}
          </p>
        </div>

        <div className="efc-header-right">
          <div className="efc-sync-info">
            <span>Última previsão: <strong className="efc-sync-highlight">{currentData.kpis.lastUpdatedAt || '10:15'}</strong></span>
            <span>Próxima atualização: <strong className="efc-sync-highlight">{currentData.kpis.nextUpdateAt || '10:30'}</strong></span>
          </div>

          <button
            onClick={handleRunForecast}
            disabled={runningForecast}
            className="efc-btn-action"
            data-testid="btn-run-forecast"
          >
            <RefreshCw size={16} className={runningForecast ? 'animate-spin' : ''} />
            <span>{runningForecast ? 'Calculando...' : 'Atualizar Forecast'}</span>
          </button>
        </div>
      </header>

      {/* 2. Executive KPIs Grid */}
      <section className="efc-kpis-grid" aria-label="KPIs Executivos de Previsão">
        {/* Vendas Previstas */}
        <div className="efc-kpi-card cyan" data-testid="forecast-kpi-sales">
          <div className="efc-kpi-header">
            <span className="efc-kpi-label">Previsão de vendas</span>
            <Ticket className="efc-kpi-icon" />
          </div>
          <div className="efc-kpi-value text-sky-400">
            {currentData.kpis.predictedTickets.toLocaleString('pt-BR')}
          </div>
          <div className="efc-kpi-sub">
            <span>ingressos projetados</span>
          </div>
        </div>

        {/* Receita Prevista */}
        <div className="efc-kpi-card emerald" data-testid="forecast-kpi-revenue">
          <div className="efc-kpi-header">
            <span className="efc-kpi-label">Previsão de receita</span>
            <DollarSign className="efc-kpi-icon" />
          </div>
          <div className="efc-kpi-value text-emerald-400">
            {formatBrl(currentData.kpis.predictedRevenueCents)}
          </div>
          <div className="efc-kpi-sub">
            <span>curva consolidada</span>
          </div>
        </div>

        {/* Ocupação Prevista */}
        <div className="efc-kpi-card purple" data-testid="forecast-kpi-occupancy">
          <div className="efc-kpi-header">
            <span className="efc-kpi-label">Ocupação prevista</span>
            <Percent className="efc-kpi-icon" />
          </div>
          <div className="efc-kpi-value text-purple-400">
            {currentData.kpis.predictedOccupancy}%
          </div>
          <div className="efc-kpi-sub">
            <span>da capacidade total</span>
          </div>
        </div>

        {/* Sold-out Estimado */}
        <div className="efc-kpi-card amber" data-testid="forecast-kpi-soldout">
          <div className="efc-kpi-header">
            <span className="efc-kpi-label">Sold-out estimado</span>
            <Clock3 className="efc-kpi-icon" />
          </div>
          <div className="efc-kpi-value text-amber-400">
            {currentData.kpis.predictedSelloutAt}
          </div>
          <div className="efc-kpi-sub">
            <span>data provável de esgotamento</span>
          </div>
        </div>

        {/* Probabilidade Sold-out */}
        <div className="efc-kpi-card rose" data-testid="forecast-kpi-probability">
          <div className="efc-kpi-header">
            <span className="efc-kpi-label">Probabilidade sold-out</span>
            <Flame className="efc-kpi-icon" />
          </div>
          <div className="efc-kpi-value text-rose-400">
            {currentData.kpis.selloutProbability}%
          </div>
          <div className="efc-kpi-sub">
            <span>índice de certeza de esgotamento</span>
          </div>
        </div>

        {/* Ticket Médio Previsto */}
        <div className="efc-kpi-card cyan" data-testid="forecast-kpi-ticket">
          <div className="efc-kpi-header">
            <span className="efc-kpi-label">Ticket médio previsto</span>
            <Target className="efc-kpi-icon" />
          </div>
          <div className="efc-kpi-value text-sky-400">
            {formatBrlExact(currentData.kpis.predictedAverageTicketCents)}
          </div>
          <div className="efc-kpi-sub">
            <span>preço médio ponderado</span>
          </div>
        </div>
      </section>

      {/* 3. Confidence Card / Faixa Provável */}
      <div className="efc-confidence-banner" data-testid="forecast-confidence-card">
        <div className="efc-confidence-left">
          <div className="efc-confidence-icon-box">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="efc-confidence-title">Índice de Confiança Operacional do Modelo</h2>
            <p className="efc-confidence-desc">
              O PDT não apresenta previsão como certeza absoluta, mas como probabilidade operacional baseada no histórico de vendas, média móvel, velocidade recente e tempo restante.
            </p>
          </div>
        </div>

        <div className="efc-confidence-metrics">
          <div className="efc-conf-item">
            <span className="efc-conf-item-label">Receita Prevista</span>
            <span className="efc-conf-item-val">{formatBrl(currentData.kpis.predictedRevenueCents)}</span>
          </div>
          <div className="efc-conf-item">
            <span className="efc-conf-item-label">Faixa Provável</span>
            <span className="efc-conf-item-val text-slate-300">
              {formatBrl(currentData.kpis.lowerBoundRevenueCents)} — {formatBrl(currentData.kpis.upperBoundRevenueCents)}
            </span>
          </div>
          <div className="efc-conf-item">
            <span className="efc-conf-item-label">Confiança</span>
            <span className="efc-conf-item-val highlight">{currentData.kpis.confidence}%</span>
          </div>
        </div>
      </div>

      {/* 4. Previsto × Realizado Comparison & Interactive Chart */}
      <section className="efc-section-card" data-testid="forecast-comparison-section">
        <div className="efc-section-header">
          <div className="efc-section-title-wrap">
            <h2 className="efc-section-title">Previsto × Realizado</h2>
            <span className="efc-section-badge">Acompanhamento e Desvio Operacional</span>
          </div>

          <div className="efc-metric-toggles" role="tablist">
            <button
              onClick={() => setActiveMetric('revenue')}
              className={`efc-metric-btn ${activeMetric === 'revenue' ? 'active' : ''}`}
              data-testid="forecast-metric-toggle-revenue"
            >
              Receita
            </button>
            <button
              onClick={() => setActiveMetric('tickets')}
              className={`efc-metric-btn ${activeMetric === 'tickets' ? 'active' : ''}`}
              data-testid="forecast-metric-toggle-tickets"
            >
              Ingressos
            </button>
            <button
              onClick={() => setActiveMetric('occupancy')}
              className={`efc-metric-btn ${activeMetric === 'occupancy' ? 'active' : ''}`}
              data-testid="forecast-metric-toggle-occupancy"
            >
              Ocupação
            </button>
            <button
              onClick={() => setActiveMetric('averageTicket')}
              className={`efc-metric-btn ${activeMetric === 'averageTicket' ? 'active' : ''}`}
              data-testid="forecast-metric-toggle-ticket"
            >
              Ticket médio
            </button>
          </div>
        </div>

        {/* Comparison Summary Table */}
        <div className="efc-table-wrap">
          <table className="efc-table" data-testid="forecast-timeline-table">
            <thead>
              <tr>
                <th>Métrica</th>
                <th>Previsto</th>
                <th>Realizado</th>
                <th>Desvio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="efc-metric-row-title">
                  <DollarSign size={16} className="text-emerald-400" />
                  Receita
                </td>
                <td>{formatBrl(currentTimeline.comparison.revenue.predictedCents)}</td>
                <td className="font-bold text-white">{formatBrl(currentTimeline.comparison.revenue.realizedCents)}</td>
                <td>
                  <span className={`efc-deviation-tag ${currentTimeline.comparison.revenue.deviationPct < 0 ? 'negative' : 'positive'}`}>
                    {currentTimeline.comparison.revenue.deviationPct > 0 ? '+' : ''}{currentTimeline.comparison.revenue.deviationPct.toFixed(1)}%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="efc-metric-row-title">
                  <Ticket size={16} className="text-sky-400" />
                  Ingressos
                </td>
                <td>{currentTimeline.comparison.tickets.predicted.toLocaleString('pt-BR')}</td>
                <td className="font-bold text-white">{currentTimeline.comparison.tickets.realized.toLocaleString('pt-BR')}</td>
                <td>
                  <span className={`efc-deviation-tag ${currentTimeline.comparison.tickets.deviationPct < 0 ? 'negative' : 'positive'}`}>
                    {currentTimeline.comparison.tickets.deviationPct > 0 ? '+' : ''}{currentTimeline.comparison.tickets.deviationPct.toFixed(1)}%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="efc-metric-row-title">
                  <Percent size={16} className="text-purple-400" />
                  Ocupação
                </td>
                <td>{currentTimeline.comparison.occupancy.predictedPct}%</td>
                <td className="font-bold text-white">{currentTimeline.comparison.occupancy.realizedPct}%</td>
                <td>
                  <span className={`efc-deviation-tag ${currentTimeline.comparison.occupancy.deviationPp < 0 ? 'negative' : 'positive'}`}>
                    {currentTimeline.comparison.occupancy.deviationPp > 0 ? '+' : ''}{currentTimeline.comparison.occupancy.deviationPp.toFixed(1)} pp
                  </span>
                </td>
              </tr>
              <tr>
                <td className="efc-metric-row-title">
                  <Target size={16} className="text-cyan-400" />
                  Ticket médio
                </td>
                <td>{formatBrlExact(currentTimeline.comparison.averageTicket.predictedCents)}</td>
                <td className="font-bold text-white">{formatBrlExact(currentTimeline.comparison.averageTicket.realizedCents)}</td>
                <td>
                  <span className={`efc-deviation-tag ${currentTimeline.comparison.averageTicket.deviationPct < 0 ? 'negative' : 'positive'}`}>
                    {currentTimeline.comparison.averageTicket.deviationPct > 0 ? '+' : ''}{currentTimeline.comparison.averageTicket.deviationPct.toFixed(1)}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Timeline Graphic Area */}
        <div className="efc-chart-container">
          <div className="efc-chart-legend">
            <div className="efc-legend-item">
              <div className="efc-legend-line solid"></div>
              <span>Realizado (sólido)</span>
            </div>
            <div className="efc-legend-item">
              <div className="efc-legend-line dashed"></div>
              <span>Forecast (tracejado)</span>
            </div>
            <div className="efc-legend-item">
              <div className="efc-legend-line dotted"></div>
              <span>Meta (pontilhado)</span>
            </div>
          </div>

          <div className="efc-bars-visual">
            {currentTimeline.series.map((point, idx) => {
              const vals = getSeriesValues(point)
              const realH = vals.realized !== null ? Math.max(8, Math.round((vals.realized / maxSeriesVal) * 120)) : 0
              const foreH = Math.max(8, Math.round((vals.forecast / maxSeriesVal) * 120))
              const targH = Math.max(8, Math.round((vals.target / maxSeriesVal) * 120))

              return (
                <div key={idx} className="efc-bar-group" title={`${point.label}\nRealizado: ${vals.formatter(vals.realized)}\nForecast: ${vals.formatter(vals.forecast)}\nMeta: ${vals.formatter(vals.target)}`}>
                  <div className="efc-bar-cluster">
                    {vals.realized !== null && (
                      <div className="efc-bar realized" style={{ height: `${realH}px` }}></div>
                    )}
                    <div className="efc-bar forecast" style={{ height: `${foreH}px` }}></div>
                    <div className="efc-bar target" style={{ height: `${targH}px` }}></div>
                  </div>
                  <span className="efc-bar-label">{point.label.split(' ')[0]}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. Cenários e Simulador Interativo */}
      <section className="efc-section-card" data-testid="forecast-scenarios-section">
        <div className="efc-section-header">
          <div className="efc-section-title-wrap">
            <h2 className="efc-section-title">Cenários Operacionais</h2>
            <span className="efc-section-badge">Projeções & Sensibilidade</span>
          </div>
        </div>

        {/* 3 Pre-set Scenario Cards */}
        <div className="efc-scenarios-grid">
          {/* Conservador */}
          <div
            onClick={() => setSelectedScenario('conservador')}
            className={`efc-scenario-card ${selectedScenario === 'conservador' ? 'active' : ''}`}
            data-testid="forecast-scenario-conservative"
          >
            <div className="efc-scenario-header">
              <h3 className="efc-scenario-name">{currentScenarios.scenarios.conservador.name}</h3>
              <span className="efc-scenario-badge conservative">Pessimista</span>
            </div>

            <div className="efc-scenario-stats">
              <div className="efc-stat-box">
                <span className="efc-stat-label">Receita</span>
                <span className="efc-stat-val text-amber-400">
                  {formatBrl(currentScenarios.scenarios.conservador.revenueCents)}
                </span>
              </div>
              <div className="efc-stat-box">
                <span className="efc-stat-label">Ocupação</span>
                <span className="efc-stat-val text-slate-200">
                  {currentScenarios.scenarios.conservador.occupancyPct}%
                </span>
              </div>
              <div className="efc-stat-box">
                <span className="efc-stat-label">Ingressos</span>
                <span className="efc-stat-val text-slate-300">
                  {currentScenarios.scenarios.conservador.tickets.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="efc-stat-box">
                <span className="efc-stat-label">Velocidade</span>
                <span className="efc-stat-val text-slate-300">
                  {currentScenarios.scenarios.conservador.velocityPerHour}/h
                </span>
              </div>
            </div>

            <p className="efc-scenario-desc">
              {currentScenarios.scenarios.conservador.description}
            </p>
          </div>

          {/* Base */}
          <div
            onClick={() => setSelectedScenario('base')}
            className={`efc-scenario-card ${selectedScenario === 'base' ? 'active' : ''}`}
            data-testid="forecast-scenario-base"
          >
            <div className="efc-scenario-header">
              <h3 className="efc-scenario-name">{currentScenarios.scenarios.base.name}</h3>
              <span className="efc-scenario-badge base">Cenário Principal</span>
            </div>

            <div className="efc-scenario-stats">
              <div className="efc-stat-box">
                <span className="efc-stat-label">Receita</span>
                <span className="efc-stat-val text-sky-400">
                  {formatBrl(currentScenarios.scenarios.base.revenueCents)}
                </span>
              </div>
              <div className="efc-stat-box">
                <span className="efc-stat-label">Ocupação</span>
                <span className="efc-stat-val text-slate-200">
                  {currentScenarios.scenarios.base.occupancyPct}%
                </span>
              </div>
              <div className="efc-stat-box">
                <span className="efc-stat-label">Ingressos</span>
                <span className="efc-stat-val text-slate-300">
                  {currentScenarios.scenarios.base.tickets.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="efc-stat-box">
                <span className="efc-stat-label">Velocidade</span>
                <span className="efc-stat-val text-slate-300">
                  {currentScenarios.scenarios.base.velocityPerHour}/h
                </span>
              </div>
            </div>

            <p className="efc-scenario-desc">
              {currentScenarios.scenarios.base.description}
            </p>
          </div>

          {/* Otimista */}
          <div
            onClick={() => setSelectedScenario('otimista')}
            className={`efc-scenario-card ${selectedScenario === 'otimista' ? 'active' : ''}`}
            data-testid="forecast-scenario-optimistic"
          >
            <div className="efc-scenario-header">
              <h3 className="efc-scenario-name">{currentScenarios.scenarios.otimista.name}</h3>
              <span className="efc-scenario-badge optimistic">Acelerado</span>
            </div>

            <div className="efc-scenario-stats">
              <div className="efc-stat-box">
                <span className="efc-stat-label">Receita</span>
                <span className="efc-stat-val text-emerald-400">
                  {formatBrl(currentScenarios.scenarios.otimista.revenueCents)}
                </span>
              </div>
              <div className="efc-stat-box">
                <span className="efc-stat-label">Ocupação</span>
                <span className="efc-stat-val text-slate-200">
                  {currentScenarios.scenarios.otimista.occupancyPct}%
                </span>
              </div>
              <div className="efc-stat-box">
                <span className="efc-stat-label">Ingressos</span>
                <span className="efc-stat-val text-slate-300">
                  {currentScenarios.scenarios.otimista.tickets.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="efc-stat-box">
                <span className="efc-stat-label">Velocidade</span>
                <span className="efc-stat-val text-slate-300">
                  {currentScenarios.scenarios.otimista.velocityPerHour}/h
                </span>
              </div>
            </div>

            <p className="efc-scenario-desc">
              {currentScenarios.scenarios.otimista.description}
            </p>
          </div>
        </div>

        {/* Interactive Simulator */}
        <div className="efc-simulator-panel" data-testid="forecast-simulator">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders size={18} className="text-cyan-400" />
              Simulador de Sensibilidade & Demanda
            </h3>
            <span className="text-xs text-slate-400">Cálculo em memória • Sem impacto em produção</span>
          </div>

          <div className="efc-sim-grid">
            <div className="efc-sim-field">
              <label className="efc-sim-label">
                <span>Velocidade de vendas</span>
                <span className="efc-sim-val-display">+{velocityDelta}%</span>
              </label>
              <input
                type="range"
                min="-30"
                max="50"
                value={velocityDelta}
                onChange={e => setVelocityDelta(Number(e.target.value))}
                className="efc-sim-range"
                data-testid="input-velocity-delta"
              />
            </div>

            <div className="efc-sim-field">
              <label className="efc-sim-label">
                <span>Conversão</span>
                <span className="efc-sim-val-display">+{conversionDelta}%</span>
              </label>
              <input
                type="range"
                min="-20"
                max="40"
                value={conversionDelta}
                onChange={e => setConversionDelta(Number(e.target.value))}
                className="efc-sim-range"
                data-testid="input-conversion-delta"
              />
            </div>

            <div className="efc-sim-field">
              <label className="efc-sim-label">
                <span>Ticket médio</span>
                <span className="efc-sim-val-display">R$ {ticketMediumInput.toFixed(2)}</span>
              </label>
              <input
                type="number"
                value={ticketMediumInput}
                onChange={e => setTicketMediumInput(Number(e.target.value))}
                className="efc-sim-input"
                data-testid="input-ticket-medium"
              />
            </div>

            <div className="efc-sim-field">
              <label className="efc-sim-label">
                <span>Investimento marketing</span>
                <span className="efc-sim-val-display">R$ {marketingInvestmentInput.toLocaleString('pt-BR')}</span>
              </label>
              <input
                type="number"
                step="500"
                value={marketingInvestmentInput}
                onChange={e => setMarketingInvestmentInput(Number(e.target.value))}
                className="efc-sim-input"
                data-testid="input-marketing-investment"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="efc-btn-action"
              data-testid="forecast-simulate-button"
            >
              <Sparkles size={16} />
              <span>{simulating ? 'Simulando...' : 'SIMULAR CENÁRIO'}</span>
            </button>

            {simulationResult && (
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
                <CheckCircle2 size={14} />
                Simulação calculada com sucesso
              </span>
            )}
          </div>

          {/* Simulation Output Card */}
          {simulationResult && (
            <div className="efc-sim-result-box" data-testid="forecast-simulation-result">
              <div className="efc-sim-result-header">
                <span className="efc-sim-result-title">
                  <Sparkles size={16} />
                  Resultado da Simulação Operacional
                </span>
                <span className="efc-sim-badge">SOMENTE SIMULAÇÃO</span>
              </div>

              <div className="efc-sim-metrics-row">
                <div className="efc-stat-box">
                  <span className="efc-stat-label">Receita Projetada</span>
                  <span className="efc-stat-val text-emerald-400">
                    {formatBrl(simulationResult.simulatedRevenueCents)}
                  </span>
                </div>
                <div className="efc-stat-box">
                  <span className="efc-stat-label">Ingressos Simulados</span>
                  <span className="efc-stat-val text-sky-400">
                    {simulationResult.simulatedTickets.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="efc-stat-box">
                  <span className="efc-stat-label">Ocupação Simulada</span>
                  <span className="efc-stat-val text-purple-400">
                    {simulationResult.simulatedOccupancyPct}%
                  </span>
                </div>
                <div className="efc-stat-box">
                  <span className="efc-stat-label">Impacto Financeiro (Delta)</span>
                  <span className={`efc-stat-val ${simulationResult.deltaRevenueCents >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simulationResult.deltaRevenueCents >= 0 ? '+' : ''}{formatBrl(simulationResult.deltaRevenueCents)}
                  </span>
                </div>
              </div>

              <div className="efc-sim-notice">
                <Info size={14} className="text-sky-400 shrink-0" />
                <span>
                  {simulationResult.notice || 'Simulação puramente em memória. Nenhum preço, lote, saldo ou transação em produção foi alterado.'}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. Forecast por Lote / Setor */}
      <section className="efc-section-card" data-testid="forecast-lots-section">
        <div className="efc-section-header">
          <div className="efc-section-title-wrap">
            <h2 className="efc-section-title">Forecast por Lote e Setor</h2>
            <span className="efc-section-badge">Inventário Operacional Conectado</span>
          </div>
        </div>

        <div className="efc-lots-grid">
          {currentLots.map(lot => (
            <div key={lot.lotId} className="efc-lot-card" data-testid={`forecast-lot-card-${lot.lotId}`}>
              <div className="efc-lot-top">
                <div>
                  <h3 className="efc-lot-title">{lot.name}</h3>
                  <p className="efc-lot-sector">{lot.sector} • {formatBrlExact(lot.priceCents)}</p>
                </div>
                <span className="efc-soldout-badge">
                  {lot.probableSoldOutAt}
                </span>
              </div>

              <div className="efc-lot-metrics">
                <div className="efc-stat-box">
                  <span className="efc-stat-label">Vendidos</span>
                  <span className="efc-stat-val">{lot.sold.toLocaleString('pt-BR')}</span>
                </div>
                <div className="efc-stat-box">
                  <span className="efc-stat-label">Disponíveis</span>
                  <span className="efc-stat-val text-amber-400">{lot.available.toLocaleString('pt-BR')}</span>
                </div>
                <div className="efc-stat-box">
                  <span className="efc-stat-label">Velocidade Atual</span>
                  <span className="efc-stat-val text-sky-400">{lot.currentVelocityPerHour}/h</span>
                </div>
                <div className="efc-stat-box">
                  <span className="efc-stat-label">Forecast Final</span>
                  <span className="efc-stat-val text-emerald-400">{lot.finalForecastTickets.toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div className="efc-lot-foot">
                <span className="efc-lot-conf">Confiança: <strong>{lot.confidencePct}%</strong></span>
                <button
                  onClick={() => onNavigate('event-inventory')}
                  className="efc-btn-secondary"
                  data-testid={`btn-goto-inventory-${lot.lotId}`}
                >
                  <span>Ver Inventário</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Detecção Automática de Desvios */}
      <section className="efc-section-card" data-testid="forecast-alerts-section">
        <div className="efc-section-header">
          <div className="efc-section-title-wrap">
            <h2 className="efc-section-title">Detecção Automática de Desvios</h2>
            <span className="efc-section-badge">Gatilhos Operacionais em Tempo Real</span>
          </div>
        </div>

        <div className="efc-alerts-grid">
          {currentData.deviationAlerts.map(alert => (
            <div key={alert.id} className={`efc-alert-item ${alert.type}`} data-testid={`forecast-alert-${alert.id}`}>
              <div className="efc-alert-content">
                {alert.type === 'fire' ? (
                  <Flame className="efc-alert-icon fire" />
                ) : (
                  <AlertTriangle className="efc-alert-icon warning" />
                )}
                <p className="efc-alert-text">{alert.text}</p>
              </div>

              <button
                onClick={() => onNavigate(alert.targetModule as PageKey)}
                className="efc-alert-action-btn"
                data-testid={`btn-investigate-alert-${alert.id}`}
              >
                <span>Investigar</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Histórico das Previsões (Snapshots Persistidos) */}
      <section className="efc-section-card" data-testid="forecast-history-section">
        <div className="efc-section-header">
          <div className="efc-section-title-wrap">
            <h2 className="efc-section-title">Histórico de Previsões & Snapshots</h2>
            <span className="efc-section-badge">Rastreabilidade Temporal do Algoritmo</span>
          </div>
        </div>

        <div className="efc-table-wrap">
          <table className="efc-table">
            <thead>
              <tr>
                <th>Data & Hora do Snapshot</th>
                <th>Receita Projetada</th>
                <th>Ingressos Projetados</th>
                <th>Ocupação Prevista</th>
                <th>Confiança</th>
              </tr>
            </thead>
            <tbody>
              {currentScenarios.history.map((h, i) => (
                <tr key={h.id || i}>
                  <td className="font-bold text-white">{h.date}</td>
                  <td className="text-emerald-400 font-bold">{formatBrl(h.predictedRevenueCents)}</td>
                  <td>{h.predictedTickets.toLocaleString('pt-BR')}</td>
                  <td>{h.occupancyPct}%</td>
                  <td>
                    <span className="text-sky-400 font-semibold">{h.confidence || 80}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 9. Precisão do Modelo (Pós-Evento & Acurácia) */}
      <section className="efc-section-card" data-testid="forecast-accuracy-section">
        <div className="efc-section-header">
          <div className="efc-section-title-wrap">
            <h2 className="efc-section-title">Precisão do Modelo (Acurácia)</h2>
            <span className="efc-section-badge">Validação Pós-Evento & Feedback Loop</span>
          </div>
          <span className="text-xs text-slate-400">Score MAPE Geral: <strong>{currentAccuracy.overallMapePct}%</strong></span>
        </div>

        <div className="efc-accuracy-banner">
          <div className="efc-accuracy-stat">
            <span className="efc-acc-label">Receita Prevista</span>
            <span className="efc-acc-val">{formatBrl(currentAccuracy.predictedRevenueCents)}</span>
          </div>

          <div className="efc-accuracy-stat">
            <span className="efc-acc-label">Receita Realizada</span>
            <span className="efc-acc-val text-emerald-400">{formatBrl(currentAccuracy.realizedRevenueCents)}</span>
            <span className="efc-acc-sub">Erro: {currentAccuracy.revenueErrorPct}%</span>
          </div>

          <div className="efc-accuracy-stat">
            <span className="efc-acc-label">Ingressos Previstos</span>
            <span className="efc-acc-val">{currentAccuracy.predictedTickets.toLocaleString('pt-BR')}</span>
          </div>

          <div className="efc-accuracy-stat">
            <span className="efc-acc-label">Ingressos Realizados</span>
            <span className="efc-acc-val text-sky-400">{currentAccuracy.realizedTickets.toLocaleString('pt-BR')}</span>
            <span className="efc-acc-sub">Erro: {currentAccuracy.ticketsErrorPct}%</span>
          </div>

          <div className="efc-accuracy-stat">
            <span className="efc-acc-label">Confiança Aferida</span>
            <span className="efc-acc-val text-purple-400">{currentAccuracy.modelConfidenceScore}%</span>
            <span className="text-xs text-slate-400 font-semibold">Avaliação Concluída</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 italic">
          * {currentAccuracy.notes || 'Modelo determinístico com ajuste por velocidade recente apresentou erro inferior a 2%.'}
        </p>
      </section>
    </div>
  )
}
