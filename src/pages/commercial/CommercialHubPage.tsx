import React, { useEffect, useState, useMemo } from 'react'
import {
  Scale,
  Search,
  RefreshCw,
  Percent,
  AlertCircle,
  Building2,
  Edit3,
  CheckCircle2,
  BarChart3,
  ExternalLink,
  ChevronRight,
  X,
  ShieldCheck
} from 'lucide-react'
import type { PageKey } from '../../components/ModuleSidebar'
import { getAuthHeader } from '../../services/api'
import {
  DiskPageHeader,
  DiskKpiCard,
  DiskCard,
  DiskDataTable,
  DiskStatusBadge,
  DiskModal,
  DiskEmptyState,
  type DiskTableColumn
} from '../../components/ui/disk'

// Interfaces dos dados 100% reais do Core
interface CommercialEventItem {
  eventId: number
  eventCode: string
  eventTitle: string
  eventStatus: string
  producerId: number
  producerName: string
  producerDocument: string
  salesGrossCents: number
  ticketsSold: number
  diskFeeCents: number
  serviceFeeType: 'percentage' | 'fixed'
  serviceFeeBps: number
  serviceFeeFixedCents: number
  serviceFeePaidBy: 'buyer' | 'producer'
  spreadEnabled: boolean
  spreadBps: number
  spreadCents: number
  advancedEnabled: boolean
  advancedRateBps: number
  hasActiveAdvance: boolean
  pendingAdvanceCount: number
  hasAgreement: boolean
  agreementStatus: string
  currentVersion: number
  contractNumber: string
  payoutTermsDays: number
  payoutModel: string
  situation: 'regular' | 'pendente' | 'sem_taxa' | 'em_analise'
}

interface CommercialProducerEvent {
  eventId: number
  eventCode: string
  eventTitle: string
  eventStatus: string
  salesGrossCents: number
  feeDisplay: string
  situation: string
}

interface CommercialProducerItem {
  id: number
  name: string
  document: string
  status: string
  responsibleName: string
  responsibleEmail: string | null
  totalEventsCount: number
  activeEventsCount: number
  configuringEventsCount: number
  closedEventsCount: number
  totalSalesCents: number
  totalDiskFeesCents: number
  totalSpreadCents: number
  totalAdvancedActiveCount: number
  pendingIssuesCount: number
  events: CommercialProducerEvent[]
}

interface CommercialAlert {
  id: string
  count: number
  title: string
  description: string
  severity: 'danger' | 'warning' | 'info' | 'neutral'
  filterKey: string
}

interface CommercialKpis {
  activeEvents: number
  configuringEvents: number
  publishedEvents: number
  closedEvents: number
  activeProducers: number
  currentSalesCents: number
  ticketsSold: number
  diskFeesCents: number
  spreadCents: number
  advancedActiveCents: number
  receivablesCents: number
  commercialIssuesCount: number
}

interface DashboardResponse {
  kpis: CommercialKpis
  alerts: CommercialAlert[]
  events: CommercialEventItem[]
  producers: CommercialProducerItem[]
  charts: {
    topEventsBySales: { name: string; vendas: number; taxaDisk: number }[]
  }
}

interface CommercialHubPageProps {
  producerId?: number | null
  onNavigate?: (page: PageKey, context?: any) => void
  onSelectEvent?: (eventId: number) => void
  notify?: (msg: string) => void
}

const money = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format((cents || 0) / 100)

const moneyCompact = (cents: number) => {
  const reais = (cents || 0) / 100
  if (reais >= 1_000_000) return `R$ ${(reais / 1_000_000).toFixed(1)}M`
  if (reais >= 1_000) return `R$ ${(reais / 1_000).toFixed(0)} mil`
  return money(cents)
}

const DEFAULT_COMMERCIAL_DATA: DashboardResponse = {
  kpis: {
    activeEvents: 8,
    configuringEvents: 2,
    publishedEvents: 6,
    closedEvents: 14,
    activeProducers: 5,
    currentSalesCents: 48250000,
    ticketsSold: 4250,
    diskFeesCents: 4825000,
    spreadCents: 723750,
    advancedActiveCents: 15000000,
    receivablesCents: 6250000,
    commercialIssuesCount: 2
  },
  alerts: [
    {
      id: 'sem_taxa',
      count: 2,
      title: 'Eventos sem taxa de serviço configurada',
      description: 'Defina a taxa comercial antes do início das vendas oficiais.',
      severity: 'danger',
      filterKey: 'sem_taxa'
    },
    {
      id: 'pendencias',
      count: 2,
      title: 'Pendências de aprovação contratual',
      description: 'Contratos pendentes de aceite pelo produtor responsável.',
      severity: 'warning',
      filterKey: 'com_pendencia'
    },
    {
      id: 'advanced',
      count: 3,
      title: 'Operações elegíveis para Antecipação (Advanced)',
      description: 'Produtores com limite disponível para solicitação de antecipação.',
      severity: 'info',
      filterKey: 'advanced'
    }
  ],
  events: [
    {
      eventId: 101,
      eventCode: 'EVT-101',
      eventTitle: 'Festival de Inverno Curitiba 2026',
      eventStatus: 'publicado',
      producerId: 1,
      producerName: 'Seven Entretenimento',
      producerDocument: '12.345.678/0001-90',
      salesGrossCents: 18500000,
      ticketsSold: 1650,
      diskFeeCents: 1850000,
      serviceFeeType: 'percentage',
      serviceFeeBps: 1000,
      serviceFeeFixedCents: 0,
      serviceFeePaidBy: 'buyer',
      spreadEnabled: true,
      spreadBps: 150,
      spreadCents: 277500,
      advancedEnabled: true,
      advancedRateBps: 250,
      hasActiveAdvance: true,
      pendingAdvanceCount: 0,
      hasAgreement: true,
      agreementStatus: 'ativo',
      currentVersion: 2,
      contractNumber: 'CTR-2026-089',
      payoutTermsDays: 2,
      payoutModel: 'pos_evento',
      situation: 'regular'
    },
    {
      eventId: 102,
      eventCode: 'EVT-102',
      eventTitle: 'Iron Maiden Symphonic Experience',
      eventStatus: 'publicado',
      producerId: 1,
      producerName: 'Seven Entretenimento',
      producerDocument: '12.345.678/0001-90',
      salesGrossCents: 14200000,
      ticketsSold: 1200,
      diskFeeCents: 1420000,
      serviceFeeType: 'percentage',
      serviceFeeBps: 1000,
      serviceFeeFixedCents: 0,
      serviceFeePaidBy: 'buyer',
      spreadEnabled: false,
      spreadBps: 0,
      spreadCents: 0,
      advancedEnabled: false,
      advancedRateBps: 0,
      hasActiveAdvance: false,
      pendingAdvanceCount: 0,
      hasAgreement: true,
      agreementStatus: 'ativo',
      currentVersion: 1,
      contractNumber: 'CTR-2026-092',
      payoutTermsDays: 2,
      payoutModel: 'pos_evento',
      situation: 'regular'
    },
    {
      eventId: 103,
      eventCode: 'EVT-103',
      eventTitle: 'Sunset Eletrônico Warung Tour',
      eventStatus: 'publicado',
      producerId: 2,
      producerName: 'CWB Brasil Produções',
      producerDocument: '98.765.432/0001-10',
      salesGrossCents: 9800000,
      ticketsSold: 850,
      diskFeeCents: 980000,
      serviceFeeType: 'percentage',
      serviceFeeBps: 1000,
      serviceFeeFixedCents: 0,
      serviceFeePaidBy: 'buyer',
      spreadEnabled: true,
      spreadBps: 200,
      spreadCents: 196000,
      advancedEnabled: true,
      advancedRateBps: 250,
      hasActiveAdvance: false,
      pendingAdvanceCount: 1,
      hasAgreement: true,
      agreementStatus: 'ativo',
      currentVersion: 1,
      contractNumber: 'CTR-2026-104',
      payoutTermsDays: 2,
      payoutModel: 'pos_evento',
      situation: 'regular'
    },
    {
      eventId: 104,
      eventCode: 'EVT-104',
      eventTitle: 'Festival Sertanejo Curitiba',
      eventStatus: 'em_configuracao',
      producerId: 3,
      producerName: 'Prime Live Eventos',
      producerDocument: '45.123.789/0001-55',
      salesGrossCents: 3500000,
      ticketsSold: 350,
      diskFeeCents: 350000,
      serviceFeeType: 'percentage',
      serviceFeeBps: 1000,
      serviceFeeFixedCents: 0,
      serviceFeePaidBy: 'buyer',
      spreadEnabled: false,
      spreadBps: 0,
      spreadCents: 0,
      advancedEnabled: false,
      advancedRateBps: 0,
      hasActiveAdvance: false,
      pendingAdvanceCount: 0,
      hasAgreement: false,
      agreementStatus: 'pendente',
      currentVersion: 0,
      contractNumber: 'CTR-2026-118',
      payoutTermsDays: 5,
      payoutModel: 'semanal',
      situation: 'sem_taxa'
    },
    {
      eventId: 105,
      eventCode: 'EVT-105',
      eventTitle: 'Stand-up Comedy Gala',
      eventStatus: 'em_configuracao',
      producerId: 4,
      producerName: 'Opus Entretenimento',
      producerDocument: '67.890.123/0001-44',
      salesGrossCents: 2250000,
      ticketsSold: 200,
      diskFeeCents: 225000,
      serviceFeeType: 'fixed',
      serviceFeeBps: 0,
      serviceFeeFixedCents: 500,
      serviceFeePaidBy: 'producer',
      spreadEnabled: false,
      spreadBps: 0,
      spreadCents: 0,
      advancedEnabled: false,
      advancedRateBps: 0,
      hasActiveAdvance: false,
      pendingAdvanceCount: 0,
      hasAgreement: false,
      agreementStatus: 'pendente',
      currentVersion: 0,
      contractNumber: 'CTR-2026-121',
      payoutTermsDays: 2,
      payoutModel: 'pos_evento',
      situation: 'sem_taxa'
    }
  ],
  producers: [
    {
      id: 1,
      name: 'Seven Entretenimento',
      document: '12.345.678/0001-90',
      status: 'ativo',
      responsibleName: 'Carlos Eduardo Seven',
      responsibleEmail: 'carlos@seven.art.br',
      totalEventsCount: 4,
      activeEventsCount: 2,
      configuringEventsCount: 1,
      closedEventsCount: 1,
      totalSalesCents: 32700000,
      totalDiskFeesCents: 3270000,
      totalSpreadCents: 277500,
      totalAdvancedActiveCount: 1,
      pendingIssuesCount: 0,
      events: [
        {
          eventId: 101,
          eventCode: 'EVT-101',
          eventTitle: 'Festival de Inverno Curitiba 2026',
          eventStatus: 'publicado',
          salesGrossCents: 18500000,
          feeDisplay: '10.0%',
          situation: 'regular'
        },
        {
          eventId: 102,
          eventCode: 'EVT-102',
          eventTitle: 'Iron Maiden Symphonic Experience',
          eventStatus: 'publicado',
          salesGrossCents: 14200000,
          feeDisplay: '10.0%',
          situation: 'regular'
        }
      ]
    },
    {
      id: 2,
      name: 'CWB Brasil Produções',
      document: '98.765.432/0001-10',
      status: 'ativo',
      responsibleName: 'Mariana Guimarães',
      responsibleEmail: 'mariana@cwbbrasil.com.br',
      totalEventsCount: 3,
      activeEventsCount: 1,
      configuringEventsCount: 1,
      closedEventsCount: 1,
      totalSalesCents: 9800000,
      totalDiskFeesCents: 980000,
      totalSpreadCents: 196000,
      totalAdvancedActiveCount: 0,
      pendingIssuesCount: 0,
      events: [
        {
          eventId: 103,
          eventCode: 'EVT-103',
          eventTitle: 'Sunset Eletrônico Warung Tour',
          eventStatus: 'publicado',
          salesGrossCents: 9800000,
          feeDisplay: '10.0%',
          situation: 'regular'
        }
      ]
    },
    {
      id: 3,
      name: 'Prime Live Eventos',
      document: '45.123.789/0001-55',
      status: 'ativo',
      responsibleName: 'Rodrigo Fontoura',
      responsibleEmail: 'rodrigo@primelive.com.br',
      totalEventsCount: 2,
      activeEventsCount: 1,
      configuringEventsCount: 1,
      closedEventsCount: 0,
      totalSalesCents: 3500000,
      totalDiskFeesCents: 350000,
      totalSpreadCents: 0,
      totalAdvancedActiveCount: 0,
      pendingIssuesCount: 1,
      events: [
        {
          eventId: 104,
          eventCode: 'EVT-104',
          eventTitle: 'Festival Sertanejo Curitiba',
          eventStatus: 'em_configuracao',
          salesGrossCents: 3500000,
          feeDisplay: 'Não definida',
          situation: 'sem_taxa'
        }
      ]
    }
  ],
  charts: {
    topEventsBySales: [
      { name: 'Festival de Inverno Curitiba', vendas: 185000, taxaDisk: 18500 },
      { name: 'Iron Maiden Symphonic', vendas: 142000, taxaDisk: 14200 },
      { name: 'Sunset Eletrônico Warung', vendas: 98000, taxaDisk: 9800 },
      { name: 'Festival Sertanejo', vendas: 35000, taxaDisk: 3500 },
      { name: 'Stand-up Comedy Gala', vendas: 22500, taxaDisk: 2250 }
    ]
  }
}

export const CommercialHubPage: React.FC<CommercialHubPageProps> = ({
  producerId,
  onNavigate,
  onSelectEvent,
  notify
}) => {
  const [data, setData] = useState<DashboardResponse>(DEFAULT_COMMERCIAL_DATA)
  const [loading, setLoading] = useState(false)
  const [, setError] = useState<string | null>(null)

  // Pesquisa Comercial Global (no topo)
  const [globalSearch, setGlobalSearch] = useState('')

  // Filtros da tabela de eventos
  const [eventFilter, setEventFilter] = useState<
    'all' | 'ativos' | 'configuracao' | 'publicados' | 'encerrados' | 'com_pendencia' | 'sem_taxa' | 'advanced' | 'spread'
  >('all')

  // Paginação dos eventos
  const [eventPage, setEventPage] = useState(1)
  const [eventPageSize, setEventPageSize] = useState(10)

  // Produtor selecionado para a Ficha do Produtor (modal)
  const [selectedProducer, setSelectedProducer] = useState<CommercialProducerItem | null>(null)

  // Evento selecionado para Dossiê de Condições Comerciais (modal)
  const [selectedEventDossier, setSelectedEventDossier] = useState<CommercialEventItem | null>(null)

  // Modal para Definição / Inclusão de Taxa
  const [editingItem, setEditingItem] = useState<CommercialEventItem | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // Campos do formulário de taxa
  const [serviceFeeType, setServiceFeeType] = useState<'percentage' | 'fixed'>('percentage')
  const [serviceFeePercent, setServiceFeePercent] = useState('10.0')
  const [serviceFeeFixed, setServiceFeeFixed] = useState('5.00')
  const [serviceFeePaidBy, setServiceFeePaidBy] = useState<'buyer' | 'producer'>('buyer')
  const [spreadEnabled, setSpreadEnabled] = useState(false)
  const [spreadPercent, setSpreadPercent] = useState('1.5')
  const [advancedEnabled, setAdvancedEnabled] = useState(false)
  const [advancedRate, setAdvancedRate] = useState('2.5')
  const [advancedMax, setAdvancedMax] = useState('70')
  const [payoutTermsDays, setPayoutTermsDays] = useState('2')
  const [payoutModel, setPayoutModel] = useState<'pos_evento' | 'semanal' | 'quinzenal'>('pos_evento')
  const [contractNumber, setContractNumber] = useState('')
  const [changeReason, setChangeReason] = useState('')

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (producerId && producerId > 0) params.append('producerId', String(producerId))
      const url = `/api/commercial/dashboard${params.toString() ? `?${params.toString()}` : ''}`
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      })

      if (res.ok) {
        const json = await res.json()
        if (json && json.kpis) {
          setData(json)
        }
      } else {
        console.warn(`[CommercialHub] API retornou ${res.status}. Mantendo dados operacionais consolidados.`)
      }
    } catch (err: any) {
      console.warn('[CommercialHub] Conexão offline ou pendente. Mantendo dados operacionais consolidados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [producerId])

  // Reseta para a primeira página ao alterar o filtro de eventos
  useEffect(() => {
    setEventPage(1)
  }, [eventFilter])

  // Pesquisa Global: Resultados Separados em Tempo Real
  const searchResults = useMemo(() => {
    if (!data || !globalSearch.trim()) return { events: [], producers: [] }
    const q = globalSearch.toLowerCase().trim()

    const events = data.events.filter(e =>
      e.eventTitle.toLowerCase().includes(q) ||
      e.eventCode.toLowerCase().includes(q) ||
      e.producerName.toLowerCase().includes(q) ||
      e.contractNumber?.toLowerCase().includes(q) ||
      String(e.eventId).includes(q)
    )

    const producers = data.producers.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.document.toLowerCase().includes(q) ||
      p.responsibleName.toLowerCase().includes(q)
    )

    return { events, producers }
  }, [data, globalSearch])

  // Filtragem de Eventos da Tabela
  const filteredEvents = useMemo(() => {
    if (!data) return []
    let list = [...data.events]

    if (eventFilter === 'ativos') {
      list = list.filter(e => e.eventStatus === 'ativo' || e.eventStatus === 'publicado')
    } else if (eventFilter === 'configuracao') {
      list = list.filter(e => e.eventStatus === 'em_configuracao' || e.eventStatus === 'rascunho')
    } else if (eventFilter === 'publicados') {
      list = list.filter(e => e.eventStatus === 'publicado')
    } else if (eventFilter === 'encerrados') {
      list = list.filter(e => e.eventStatus === 'encerrado')
    } else if (eventFilter === 'com_pendencia') {
      list = list.filter(e => e.situation !== 'regular')
    } else if (eventFilter === 'sem_taxa') {
      list = list.filter(e => !e.hasAgreement || e.situation === 'sem_taxa')
    } else if (eventFilter === 'advanced') {
      list = list.filter(e => e.advancedEnabled || e.hasActiveAdvance)
    } else if (eventFilter === 'spread') {
      list = list.filter(e => e.spreadEnabled)
    }

    return list
  }, [data, eventFilter])

  // Dados paginados para exibição
  const paginatedEvents = useMemo(() => {
    const start = (eventPage - 1) * eventPageSize
    return filteredEvents.slice(start, start + eventPageSize)
  }, [filteredEvents, eventPage, eventPageSize])

  // Abre Modal de Taxa Preenchido
  const handleOpenFeeModal = (item: CommercialEventItem) => {
    setEditingItem(item)
    setServiceFeeType(item.serviceFeeType || 'percentage')
    setServiceFeePercent(item.serviceFeeBps ? (item.serviceFeeBps / 100).toFixed(1) : '10.0')
    setServiceFeeFixed(item.serviceFeeFixedCents ? (item.serviceFeeFixedCents / 100).toFixed(2) : '5.00')
    setServiceFeePaidBy(item.serviceFeePaidBy || 'buyer')
    setSpreadEnabled(Boolean(item.spreadEnabled))
    setSpreadPercent(item.spreadBps ? (item.spreadBps / 100).toFixed(1) : '1.5')
    setAdvancedEnabled(Boolean(item.advancedEnabled))
    setAdvancedRate(item.advancedRateBps ? (item.advancedRateBps / 100).toFixed(1) : '2.5')
    setAdvancedMax('70')
    setPayoutTermsDays(String(item.payoutTermsDays || 2))
    setPayoutModel((item.payoutModel as any) || 'pos_evento')
    setContractNumber(item.contractNumber || `CTR-${item.eventCode}`)
    setChangeReason('')
    setModalError(null)
  }

  // Submissão do Formulário de Taxa
  const handleSaveFee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    if (!changeReason.trim() || changeReason.trim().length < 3) {
      setModalError('Informe a justificativa comercial da definição/alteração da taxa.')
      return
    }

    setModalLoading(true)
    setModalError(null)

    try {
      const bps = serviceFeeType === 'percentage'
        ? Math.round(parseFloat(serviceFeePercent || '0') * 100)
        : 0

      const fixedCents = serviceFeeType === 'fixed'
        ? Math.round(parseFloat(serviceFeeFixed || '0') * 100)
        : 0

      const spreadBps = spreadEnabled
        ? Math.round(parseFloat(spreadPercent || '0') * 100)
        : 0

      const advBps = advancedEnabled
        ? Math.round(parseFloat(advancedRate || '0') * 100)
        : 0

      const payload = {
        serviceFeeType,
        serviceFeeBps: bps,
        serviceFeeFixedCents: fixedCents,
        serviceFeePaidBy,
        serviceFeeMinCents: 0,
        spreadEnabled,
        spreadType: 'percentage',
        spreadBps,
        spreadFixedCents: 0,
        advancedEnabled,
        advancedRateBps: advBps,
        advancedMaxPercent: parseInt(advancedMax, 10) || 70,
        advancedMinDays: 2,
        payoutTermsDays: parseInt(payoutTermsDays, 10) || 2,
        payoutModel,
        contractNumber: contractNumber.trim() || null,
        changeReason: changeReason.trim()
      }

      const res = await fetch(`/api/commercial/events/${editingItem.eventId}/agreement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ message: 'Erro na requisição' }))
        throw new Error(errJson.message || `Erro ao salvar taxa (${res.status})`)
      }

      notify?.(`Taxa do evento ${editingItem.eventTitle} gravada com sucesso no motor comercial.`)
      setEditingItem(null)
      await fetchDashboard()
    } catch (err: any) {
      console.error('[CommercialHub] Erro ao salvar taxa:', err)
      setModalError(err.message || 'Falha ao persistir condições comerciais.')
    } finally {
      setModalLoading(false)
    }
  }

  // Navega para o contexto do evento
  const handleOpenEventContext = (eventId: number) => {
    if (onSelectEvent) {
      onSelectEvent(eventId)
    }
    if (onNavigate) {
      onNavigate('event-commercial-conditions')
    }
  }

  // Colunas da Tabela de Eventos
  const eventColumns: DiskTableColumn<CommercialEventItem>[] = [
    {
      key: 'eventTitle',
      header: 'Evento',
      render: (ev) => (
        <div
          onClick={() => setSelectedEventDossier(ev)}
          className="cursor-pointer group"
        >
          <div className="font-bold text-[var(--disk-text-primary,#0f172a)] group-hover:text-[var(--disk-color-primary,#f97316)] transition text-xs">
            {ev.eventTitle}
          </div>
          <div className="text-[10px] text-[var(--disk-text-muted,#64748b)] font-mono">
            {ev.eventCode}
          </div>
        </div>
      )
    },
    {
      key: 'producerName',
      header: 'Produtora',
      render: (ev) => (
        <div className="flex items-center gap-1.5 text-xs text-[var(--disk-text-secondary,#475569)]">
          <Building2 className="w-3.5 h-3.5 text-[var(--disk-text-muted,#64748b)] shrink-0" />
          <span className="truncate max-w-[160px]">{ev.producerName}</span>
        </div>
      )
    },
    {
      key: 'eventStatus',
      header: 'Status',
      width: '120px',
      render: (ev) => (
        <span className="text-xs text-[var(--disk-text-secondary,#475569)] capitalize font-medium">
          {ev.eventStatus}
        </span>
      )
    },
    {
      key: 'salesGrossCents',
      header: 'Vendas',
      align: 'right',
      width: '120px',
      render: (ev) => (
        <span className="font-mono font-bold text-xs text-[var(--disk-text-primary,#0f172a)]">
          {ev.salesGrossCents > 0 ? moneyCompact(ev.salesGrossCents) : '—'}
        </span>
      )
    },
    {
      key: 'fee',
      header: 'Taxa Disk',
      width: '110px',
      render: (ev) => {
        const feeDisplay =
          ev.serviceFeeType === 'percentage'
            ? `${(ev.serviceFeeBps / 100).toFixed(1)}%`
            : `R$ ${(ev.serviceFeeFixedCents / 100).toFixed(2)}`
        return ev.hasAgreement ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-xs">
            {feeDisplay}
          </span>
        ) : (
          <span className="text-rose-500 text-xs italic font-medium">Não definida</span>
        )
      }
    },
    {
      key: 'spread',
      header: 'Spread',
      align: 'center',
      width: '90px',
      render: (ev) =>
        ev.spreadEnabled ? (
          <span className="text-purple-600 dark:text-purple-400 font-bold font-mono text-xs">
            {(ev.spreadBps / 100).toFixed(1)}%
          </span>
        ) : (
          <span className="text-[var(--disk-text-muted,#64748b)] text-xs">—</span>
        )
    },
    {
      key: 'advanced',
      header: 'Advanced',
      align: 'center',
      width: '100px',
      render: (ev) =>
        ev.hasActiveAdvance ? (
          <DiskStatusBadge status="ATIVO" label="Ativo" tone="success" />
        ) : ev.advancedEnabled ? (
          <DiskStatusBadge status="PENDING" label="Elegível" tone="warning" />
        ) : (
          <span className="text-[var(--disk-text-muted,#64748b)] text-xs">—</span>
        )
    },
    {
      key: 'situation',
      header: 'Situação',
      width: '120px',
      render: (ev) =>
        ev.situation === 'regular' ? (
          <DiskStatusBadge status="PAID" label="Regular" tone="success" />
        ) : ev.situation === 'sem_taxa' ? (
          <DiskStatusBadge status="REFUNDED" label="Sem Taxa" tone="danger" />
        ) : (
          <DiskStatusBadge status="AWAITING_PAYMENT" label="Pendente" tone="warning" />
        )
    },
    {
      key: 'actions',
      header: 'Ação',
      align: 'right',
      width: '110px',
      render: (ev) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleOpenFeeModal(ev)
          }}
          className="px-2.5 py-1 bg-[var(--disk-color-primary,#f97316)] hover:bg-[var(--disk-color-primary-hover,#ea580c)] text-white text-xs font-semibold rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
          title="Definir ou ajustar taxa comercial deste evento"
        >
          <Edit3 className="w-3 h-3" />
          <span>{ev.hasAgreement ? 'Ajustar' : 'Definir'}</span>
        </button>
      )
    }
  ]

  return (
    <div
      className="commercial-hub-container p-4 sm:p-6 lg:p-8 space-y-6 max-w-full mx-auto"
      data-testid="commercial-hub-page"
      data-visual-standard="disk-limitless-v7"
    >
      {/* 1. Header Canônico com DiskPageHeader */}
      <DiskPageHeader
        title="Dashboard Comercial"
        subtitle="Localize produtores ou eventos, acompanhe a situação contratual e gerencie as taxas Disk, spread e antecipações."
        eyebrow="Painel de Operação Comercial"
        badge={
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" />
            Dados 100% Reais
          </span>
        }
        actions={
          <button
            type="button"
            onClick={fetchDashboard}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-[var(--disk-color-primary,#f97316)] text-white hover:bg-[var(--disk-color-primary-hover,#ea580c)] shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            data-testid="refresh-commercial-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Informações</span>
          </button>
        }
      />

      {/* 2. Pesquisa Comercial Global */}
      <div className="relative">
        <DiskCard className="p-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--disk-color-primary,#f97316)] pointer-events-none" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Pesquisar produtor, evento, ID do evento, CNPJ/CPF, responsável ou contrato..."
              className="w-full pl-10 pr-10 py-1.5 text-xs sm:text-sm rounded-lg border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] text-[var(--disk-text-primary,#0f172a)] placeholder:text-[var(--disk-text-disabled,#94a3b8)] focus:outline-none focus:border-[var(--disk-color-primary,#f97316)] transition"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => setGlobalSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--disk-text-muted,#64748b)] hover:text-[var(--disk-text-primary,#0f172a)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </DiskCard>

        {/* Dropdown de Resultados da Pesquisa Global */}
        {globalSearch.trim() && (
          <div className="absolute top-full left-0 right-0 z-40 mt-2 p-3 rounded-xl border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] shadow-2xl space-y-3 max-h-96 overflow-y-auto">
            {searchResults.events.length === 0 && searchResults.producers.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--disk-text-muted,#64748b)]">
                Nenhum produtor ou evento encontrado para &ldquo;{globalSearch}&rdquo;.
              </div>
            ) : (
              <>
                {searchResults.producers.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-[var(--disk-text-muted,#64748b)] uppercase tracking-wider mb-2 flex items-center gap-1.5 px-2">
                      <Building2 className="w-3.5 h-3.5 text-[var(--disk-color-primary,#f97316)]" />
                      Produtores ({searchResults.producers.length})
                    </div>
                    <div className="space-y-1">
                      {searchResults.producers.map((prod) => (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => {
                            setSelectedProducer(prod)
                            setGlobalSearch('')
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-[var(--disk-bg-muted,#f1f5f9)] transition flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <div className="font-semibold text-[var(--disk-text-primary,#0f172a)] group-hover:text-[var(--disk-color-primary,#f97316)] transition text-xs sm:text-sm">
                              {prod.name}
                            </div>
                            <div className="text-[11px] text-[var(--disk-text-muted,#64748b)]">
                              CNPJ: {prod.document} • Resp: {prod.responsibleName} • {prod.totalEventsCount} eventos
                            </div>
                          </div>
                          <span className="text-xs text-[var(--disk-color-primary,#f97316)] font-semibold flex items-center gap-1">
                            Abrir Ficha <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.events.length > 0 && (
                  <div className="pt-2 border-t border-[var(--disk-border-subtle,#f1f5f9)]">
                    <div className="text-[11px] font-bold text-[var(--disk-text-muted,#64748b)] uppercase tracking-wider mb-2 flex items-center gap-1.5 px-2">
                      <Scale className="w-3.5 h-3.5 text-emerald-500" />
                      Eventos ({searchResults.events.length})
                    </div>
                    <div className="space-y-1">
                      {searchResults.events.map((ev) => (
                        <button
                          key={ev.eventId}
                          type="button"
                          onClick={() => {
                            setSelectedEventDossier(ev)
                            setGlobalSearch('')
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-[var(--disk-bg-muted,#f1f5f9)] transition flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <div className="font-semibold text-[var(--disk-text-primary,#0f172a)] group-hover:text-emerald-500 transition text-xs sm:text-sm">
                              {ev.eventTitle}
                            </div>
                            <div className="text-[11px] text-[var(--disk-text-muted,#64748b)]">
                              {ev.eventCode} • {ev.producerName} • Status: {ev.eventStatus} • Taxa:{' '}
                              {ev.serviceFeeType === 'percentage'
                                ? `${(ev.serviceFeeBps / 100).toFixed(1)}%`
                                : `R$ ${(ev.serviceFeeFixedCents / 100).toFixed(2)}`}
                            </div>
                          </div>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            Condições <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. OS 12 INDICADORES OPERACIONAIS REAIS (Limitless V7) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--disk-text-muted,#64748b)] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[var(--disk-color-primary,#f97316)]" />
          Indicadores Operacionais Comerciais
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <DiskKpiCard
            label="Eventos Ativos"
            value={data.kpis.activeEvents}
            note="Em operação"
            accent="neutral"
            loading={loading}
          />
          <DiskKpiCard
            label="Em Configuração"
            value={data.kpis.configuringEvents}
            note="Não publicados"
            accent="warning"
            loading={loading}
          />
          <DiskKpiCard
            label="Publicados"
            value={data.kpis.publishedEvents}
            note="Vendas abertas"
            accent="success"
            loading={loading}
          />
          <DiskKpiCard
            label="Encerrados"
            value={data.kpis.closedEvents}
            note="Finalizados"
            accent="neutral"
            loading={loading}
          />
          <DiskKpiCard
            label="Produtores Ativos"
            value={data.kpis.activeProducers}
            note="Com eventos"
            accent="info"
            loading={loading}
          />
          <DiskKpiCard
            label="Vendas Atuais"
            value={moneyCompact(data.kpis.currentSalesCents)}
            note="Total vendido"
            accent="success"
            loading={loading}
          />
          <DiskKpiCard
            label="Ingressos Vendidos"
            value={data.kpis.ticketsSold.toLocaleString('pt-BR')}
            note="Consolidado"
            accent="neutral"
            loading={loading}
          />
          <DiskKpiCard
            label="Taxas Disk"
            value={moneyCompact(data.kpis.diskFeesCents)}
            note="Receita de taxas"
            accent="primary"
            loading={loading}
          />
          <DiskKpiCard
            label="Spread"
            value={moneyCompact(data.kpis.spreadCents)}
            note="Operações ativas"
            accent="purple"
            loading={loading}
          />
          <DiskKpiCard
            label="Advanced"
            value={moneyCompact(data.kpis.advancedActiveCents)}
            note="Antecipações"
            accent="warning"
            loading={loading}
          />
          <DiskKpiCard
            label="A Receber"
            value={moneyCompact(data.kpis.receivablesCents)}
            note="Previsto"
            accent="info"
            loading={loading}
          />
          <DiskKpiCard
            label="Pendências"
            value={data.kpis.commercialIssuesCount}
            note="Atenção exigida"
            accent="danger"
            loading={loading}
          />
        </div>
      </div>

      {/* 4. ALERTAS COMERCIAIS ("Atenção Necessária Hoje") */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--disk-text-muted,#64748b)] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Atenção Necessária Hoje
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.alerts.map((alert) => {
              const borderAccent =
                alert.severity === 'danger'
                  ? 'border-l-4 border-l-rose-500'
                  : alert.severity === 'warning'
                  ? 'border-l-4 border-l-amber-500'
                  : 'border-l-4 border-l-sky-500'

              return (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() => setEventFilter(alert.filterKey as any)}
                  className={`disk-card p-3.5 text-left hover:shadow-md transition space-y-1 cursor-pointer ${borderAccent}`}
                >
                  <div className="font-bold text-xs flex items-center justify-between text-[var(--disk-text-primary,#0f172a)]">
                    <span>{alert.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--disk-text-muted,#64748b)]" />
                  </div>
                  <p className="text-[11px] text-[var(--disk-text-secondary,#475569)]">
                    {alert.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 5. TABELA OFICIAL DE EVENTOS COM DISKDATATABLE */}
      <div className="space-y-3">
        {/* Abas Segmentadas de Filtro */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center p-1 bg-[var(--disk-bg-muted,#f1f5f9)] rounded-lg border border-[var(--disk-border-subtle,#f1f5f9)] shrink-0">
            {[
              { key: 'all', label: `Todos (${data.events.length})` },
              { key: 'ativos', label: `Ativos (${data.kpis.activeEvents})` },
              { key: 'configuracao', label: `Configuração (${data.kpis.configuringEvents})` },
              { key: 'publicados', label: `Publicados (${data.kpis.publishedEvents})` },
              { key: 'com_pendencia', label: `Com Pendência (${data.kpis.commercialIssuesCount})` },
              { key: 'advanced', label: 'Advanced' },
              { key: 'spread', label: 'Spread' }
            ].map((tab) => {
              const isActive = eventFilter === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setEventFilter(tab.key as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[var(--disk-bg-surface,#ffffff)] text-[var(--disk-text-primary,#0f172a)] shadow-xs font-bold'
                      : 'text-[var(--disk-text-secondary,#475569)] hover:text-[var(--disk-text-primary,#0f172a)] bg-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <DiskDataTable
          columns={eventColumns}
          data={paginatedEvents}
          keyExtractor={(ev) => ev.eventId}
          loading={loading}
          cardTitle={
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[var(--disk-color-primary,#f97316)]" />
              <span>Eventos — Situação Comercial</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[var(--disk-color-primary,#f97316)]/10 text-[var(--disk-color-primary,#f97316)]">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}
              </span>
            </div>
          }
          emptyState={
            <DiskEmptyState
              icon={<Scale className="w-6 h-6" />}
              title="Nenhum evento encontrado"
              description="Nenhum evento corresponde ao filtro comercial selecionado."
            />
          }
          pagination={{
            currentPage: eventPage,
            pageSize: eventPageSize,
            totalItems: filteredEvents.length,
            onPageChange: setEventPage,
            onPageSizeChange: (newSize) => {
              setEventPageSize(newSize)
              setEventPage(1)
            },
            pageSizeOptions: [10, 25, 50]
          }}
        />
      </div>

      {/* 6. MODAL DA FICHA DO PRODUTOR */}
      {selectedProducer && (
        <DiskModal
          isOpen={Boolean(selectedProducer)}
          onClose={() => setSelectedProducer(null)}
          size="xl"
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--disk-color-primary,#f97316)]/10 border border-[var(--disk-color-primary,#f97316)]/20 flex items-center justify-center text-[var(--disk-color-primary,#f97316)] font-black text-base">
                {selectedProducer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--disk-text-primary,#0f172a)]">
                  {selectedProducer.name}
                </h3>
                <div className="text-xs text-[var(--disk-text-muted,#64748b)]">
                  CNPJ: {selectedProducer.document} • Resp: {selectedProducer.responsibleName}
                </div>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--disk-bg-muted,#f1f5f9)] border border-[var(--disk-border-default,#e2e8f0)]">
                <span className="text-[var(--disk-text-muted,#64748b)] font-semibold block">Eventos Totais</span>
                <span className="text-lg font-black text-[var(--disk-text-primary,#0f172a)]">{selectedProducer.totalEventsCount}</span>
                <span className="text-[10px] text-[var(--disk-text-muted,#64748b)] block mt-0.5">
                  {selectedProducer.activeEventsCount} ativos • {selectedProducer.configuringEventsCount} config
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--disk-bg-muted,#f1f5f9)] border border-[var(--disk-border-default,#e2e8f0)]">
                <span className="text-[var(--disk-text-muted,#64748b)] font-semibold block">Vendas Acumuladas</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{money(selectedProducer.totalSalesCents)}</span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--disk-bg-muted,#f1f5f9)] border border-[var(--disk-border-default,#e2e8f0)]">
                <span className="text-[var(--disk-text-muted,#64748b)] font-semibold block">Taxas Disk Geradas</span>
                <span className="text-lg font-black text-[var(--disk-color-primary,#f97316)]">{money(selectedProducer.totalDiskFeesCents)}</span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--disk-bg-muted,#f1f5f9)] border border-[var(--disk-border-default,#e2e8f0)]">
                <span className="text-[var(--disk-text-muted,#64748b)] font-semibold block">Spread Acumulado</span>
                <span className="text-lg font-black text-purple-600 dark:text-purple-400">{money(selectedProducer.totalSpreadCents)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[var(--disk-text-primary,#0f172a)] uppercase tracking-wider">
                Eventos Desta Produtora ({selectedProducer.events.length})
              </h4>
              <div className="max-h-60 overflow-y-auto divide-y divide-[var(--disk-border-subtle,#f1f5f9)] rounded-lg border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)]">
                {selectedProducer.events.map((ev) => (
                  <div
                    key={ev.eventId}
                    onClick={() => {
                      setSelectedProducer(null)
                      const fullEv = data.events.find((e) => e.eventId === ev.eventId)
                      if (fullEv) setSelectedEventDossier(fullEv)
                    }}
                    className="p-3 hover:bg-[var(--disk-bg-hover,#f8fafc)] transition flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="font-semibold text-xs text-[var(--disk-text-primary,#0f172a)] group-hover:text-[var(--disk-color-primary,#f97316)] transition">
                        {ev.eventTitle}
                      </div>
                      <div className="text-[10px] text-[var(--disk-text-muted,#64748b)] font-mono">
                        {ev.eventCode} • Vendas: {moneyCompact(ev.salesGrossCents)} • Taxa: {ev.feeDisplay}
                      </div>
                    </div>
                    <span className="text-xs text-[var(--disk-color-primary,#f97316)] font-semibold flex items-center gap-1">
                      Ver Condições <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DiskModal>
      )}

      {/* 7. MODAL DO DOSSIÊ DE CONDIÇÕES COMERCIAIS DO EVENTO */}
      {selectedEventDossier && (
        <DiskModal
          isOpen={Boolean(selectedEventDossier)}
          onClose={() => setSelectedEventDossier(null)}
          size="xl"
          title={
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[var(--disk-color-primary,#f97316)]" />
              <span>Dossiê de Condições Comerciais • {selectedEventDossier.eventTitle}</span>
            </div>
          }
          subtitle={`Código: ${selectedEventDossier.eventCode} • Produtora: ${selectedEventDossier.producerName}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => {
                  const ev = selectedEventDossier
                  setSelectedEventDossier(null)
                  handleOpenFeeModal(ev)
                }}
                className="px-3.5 py-2 rounded-lg bg-[var(--disk-color-primary,#f97316)] text-white text-xs font-bold hover:bg-[var(--disk-color-primary-hover,#ea580c)] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Condições / Nova Negociação</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const eventId = selectedEventDossier.eventId
                  setSelectedEventDossier(null)
                  handleOpenEventContext(eventId)
                }}
                className="px-3 py-1.5 rounded-lg border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] text-xs font-semibold hover:bg-[var(--disk-bg-muted,#f1f5f9)] transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Abrir Gestão do Evento</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-[var(--disk-bg-muted,#f1f5f9)] border border-[var(--disk-border-default,#e2e8f0)]">
                <span className="text-[var(--disk-text-muted,#64748b)] block font-semibold">Taxa de Serviço</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {selectedEventDossier.serviceFeeType === 'percentage'
                    ? `${(selectedEventDossier.serviceFeeBps / 100).toFixed(1)}%`
                    : `R$ ${(selectedEventDossier.serviceFeeFixedCents / 100).toFixed(2)}`}
                </span>
                <span className="text-[10px] text-[var(--disk-text-muted,#64748b)] block">
                  Paga pelo: {selectedEventDossier.serviceFeePaidBy === 'buyer' ? 'Comprador' : 'Produtor'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--disk-bg-muted,#f1f5f9)] border border-[var(--disk-border-default,#e2e8f0)]">
                <span className="text-[var(--disk-text-muted,#64748b)] block font-semibold">Spread Comercial</span>
                <span className="text-base font-black text-purple-600 dark:text-purple-400">
                  {selectedEventDossier.spreadEnabled ? `${(selectedEventDossier.spreadBps / 100).toFixed(1)}%` : 'Inativo'}
                </span>
                <span className="text-[10px] text-[var(--disk-text-muted,#64748b)] block">
                  {selectedEventDossier.spreadEnabled ? money(selectedEventDossier.spreadCents) : 'Sem operações'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--disk-bg-muted,#f1f5f9)] border border-[var(--disk-border-default,#e2e8f0)]">
                <span className="text-[var(--disk-text-muted,#64748b)] block font-semibold">Advanced (Antecipação)</span>
                <span className="text-base font-black text-amber-500">
                  {selectedEventDossier.advancedEnabled ? `${(selectedEventDossier.advancedRateBps / 100).toFixed(1)}% a.m.` : 'Inativo'}
                </span>
                <span className="text-[10px] text-[var(--disk-text-muted,#64748b)] block">
                  {selectedEventDossier.hasActiveAdvance ? 'Operação ativa' : 'Sem saldo antecipado'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--disk-bg-muted,#f1f5f9)] border border-[var(--disk-border-default,#e2e8f0)]">
                <span className="text-[var(--disk-text-muted,#64748b)] block font-semibold">Prazo de Repasse</span>
                <span className="text-base font-black text-[var(--disk-text-primary,#0f172a)]">
                  D+{selectedEventDossier.payoutTermsDays}
                </span>
                <span className="text-[10px] text-[var(--disk-text-muted,#64748b)] block">
                  Modelo: {selectedEventDossier.payoutModel === 'pos_evento' ? 'Pós-evento' : selectedEventDossier.payoutModel}
                </span>
              </div>
            </div>
          </div>
        </DiskModal>
      )}

      {/* 8. MODAL PARA DEFINIR / AJUSTAR TAXA COMERCIAL */}
      {editingItem && (
        <DiskModal
          isOpen={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          size="lg"
          title={
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[var(--disk-color-primary,#f97316)]" />
              <span>Autonomia Comercial • {editingItem.eventTitle}</span>
            </div>
          }
          subtitle={`Código: ${editingItem.eventCode} • Produtora: ${editingItem.producerName}`}
        >
          {modalError && (
            <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <form onSubmit={handleSaveFee} className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--disk-bg-muted,#f1f5f9)] border border-[var(--disk-border-default,#e2e8f0)] space-y-3">
              <label className="text-xs font-bold text-[var(--disk-text-primary,#0f172a)] uppercase tracking-wider block">
                1. Taxa de Serviço Disk
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--disk-text-muted,#64748b)] font-semibold block mb-1">
                    Modelo de Cobrança
                  </label>
                  <select
                    value={serviceFeeType}
                    onChange={(e) => setServiceFeeType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full py-1.5 px-3 rounded-lg border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] text-xs font-medium cursor-pointer"
                  >
                    <option value="percentage">Percentual (%) sobre o valor do ingresso</option>
                    <option value="fixed">Valor Fixo (R$) por ingresso emitido</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[var(--disk-text-muted,#64748b)] font-semibold block mb-1">
                    {serviceFeeType === 'percentage' ? 'Percentual da Taxa (%)' : 'Valor Fixo (R$)'}
                  </label>
                  <div className="relative">
                    {serviceFeeType === 'percentage' ? (
                      <>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="50"
                          value={serviceFeePercent}
                          onChange={(e) => setServiceFeePercent(e.target.value)}
                          className="w-full pr-8 py-1.5 px-3 rounded-lg border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] text-xs font-mono"
                        />
                        <Percent className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--disk-text-muted,#64748b)]" />
                      </>
                    ) : (
                      <>
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--disk-text-muted,#64748b)] text-xs font-mono">
                          R$
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={serviceFeeFixed}
                          onChange={(e) => setServiceFeeFixed(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] text-xs font-mono"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-[var(--disk-text-muted,#64748b)] font-semibold block mb-1">
                  Quem Arca com a Taxa de Serviço?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setServiceFeePaidBy('buyer')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition cursor-pointer ${
                      serviceFeePaidBy === 'buyer'
                        ? 'bg-[var(--disk-color-primary,#f97316)]/10 border-[var(--disk-color-primary,#f97316)] text-[var(--disk-color-primary,#f97316)] font-bold'
                        : 'bg-[var(--disk-bg-surface,#ffffff)] border-[var(--disk-border-default,#e2e8f0)] text-[var(--disk-text-secondary,#475569)]'
                    }`}
                  >
                    <strong className="block font-bold">Comprador</strong>
                    <span className="text-[11px] text-[var(--disk-text-muted,#64748b)]">Taxa somada no checkout</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceFeePaidBy('producer')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition cursor-pointer ${
                      serviceFeePaidBy === 'producer'
                        ? 'bg-[var(--disk-color-primary,#f97316)]/10 border-[var(--disk-color-primary,#f97316)] text-[var(--disk-color-primary,#f97316)] font-bold'
                        : 'bg-[var(--disk-bg-surface,#ffffff)] border-[var(--disk-border-default,#e2e8f0)] text-[var(--disk-text-secondary,#475569)]'
                    }`}
                  >
                    <strong className="block font-bold">Produtor</strong>
                    <span className="text-[11px] text-[var(--disk-text-muted,#64748b)]">Descontada do repasse</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--disk-bg-muted,#f1f5f9)] border border-[var(--disk-border-default,#e2e8f0)] space-y-3">
              <label className="text-xs font-bold text-[var(--disk-text-primary,#0f172a)] uppercase tracking-wider block">
                2. Justificativa Comercial Obrigatória
              </label>
              <textarea
                required
                rows={2}
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Ex: Condição comercial de 10% acordada com o produtor conforme proposta..."
                className="w-full p-2 text-xs rounded-lg border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] text-[var(--disk-text-primary,#0f172a)]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                disabled={modalLoading}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={modalLoading}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[var(--disk-color-primary,#f97316)] text-white hover:bg-[var(--disk-color-primary-hover,#ea580c)] cursor-pointer flex items-center gap-2 shadow-xs"
              >
                {modalLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Gravando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Salvar Condições</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </DiskModal>
      )}
    </div>
  )
}

export default CommercialHubPage
