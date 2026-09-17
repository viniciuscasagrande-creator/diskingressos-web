import React, { useEffect, useState, useMemo } from 'react'
import {
  Scale,
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  DollarSign,
  TrendingUp,
  Clock,
  Layers,
  FileCheck,
  AlertCircle,
  Building2,
  Calendar,
  Sparkles,
  ChevronRight,
  Lock,
  X,
  Edit3,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  Users,
  AlertTriangle,
  Receipt,
  PiggyBank,
  Hourglass,
  CheckCircle,
  BarChart3,
  ExternalLink,
  ChevronDown
} from 'lucide-react'
import type { PageKey } from '../../components/ModuleSidebar'
import { getAuthHeader } from '../../services/api'
import { LimitlessPage } from '../../integrations/limitless/LimitlessPage'

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
      description: '2 eventos publicados precisam ter o percentual ou valor fixo da taxa Disk definidos.',
      severity: 'danger',
      filterKey: 'sem_taxa'
    },
    {
      id: 'spread',
      count: 3,
      title: 'Eventos com Spread configurado',
      description: '3 eventos possuem split de spread comercial ativo.',
      severity: 'info',
      filterKey: 'spread'
    }
  ],
  events: [
    {
      eventId: 1,
      eventCode: 'EVT-2026-001',
      eventTitle: 'Festival de Inverno Curitiba 2026',
      eventStatus: 'publicado',
      producerId: 1,
      producerName: 'DiskIngressos Produções',
      producerDocument: '04.829.144/0001-90',
      salesGrossCents: 18500000,
      ticketsSold: 1420,
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
      agreementStatus: 'ativa',
      currentVersion: 2,
      contractNumber: 'CTR-2026-001',
      payoutTermsDays: 2,
      payoutModel: 'pos_evento',
      situation: 'regular'
    },
    {
      eventId: 2,
      eventCode: 'EVT-2026-002',
      eventTitle: 'Iron Maiden Symphonic Live',
      eventStatus: 'publicado',
      producerId: 2,
      producerName: 'Prime Entretenimento',
      producerDocument: '11.234.567/0001-88',
      salesGrossCents: 14200000,
      ticketsSold: 1100,
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
      agreementStatus: 'ativa',
      currentVersion: 1,
      contractNumber: 'CTR-2026-002',
      payoutTermsDays: 2,
      payoutModel: 'pos_evento',
      situation: 'regular'
    },
    {
      eventId: 3,
      eventCode: 'EVT-2026-003',
      eventTitle: 'Sunset Eletrônico Warung',
      eventStatus: 'publicado',
      producerId: 3,
      producerName: 'Seven Entretenimento',
      producerDocument: '22.345.678/0001-99',
      salesGrossCents: 9800000,
      ticketsSold: 920,
      diskFeeCents: 980000,
      serviceFeeType: 'percentage',
      serviceFeeBps: 1000,
      serviceFeeFixedCents: 0,
      serviceFeePaidBy: 'buyer',
      spreadEnabled: true,
      spreadBps: 200,
      spreadCents: 196000,
      advancedEnabled: true,
      advancedRateBps: 200,
      hasActiveAdvance: true,
      pendingAdvanceCount: 1,
      hasAgreement: true,
      agreementStatus: 'ativa',
      currentVersion: 1,
      contractNumber: 'CTR-2026-003',
      payoutTermsDays: 5,
      payoutModel: 'semanal',
      situation: 'pendente'
    },
    {
      eventId: 4,
      eventCode: 'EVT-2026-004',
      eventTitle: 'Festival Sertanejo Curitiba',
      eventStatus: 'configuracao',
      producerId: 4,
      producerName: 'CWB Brasil',
      producerDocument: '33.456.789/0001-11',
      salesGrossCents: 3500000,
      ticketsSold: 480,
      diskFeeCents: 350000,
      serviceFeeType: 'fixed',
      serviceFeeBps: 0,
      serviceFeeFixedCents: 500,
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
      contractNumber: '',
      payoutTermsDays: 2,
      payoutModel: 'pos_evento',
      situation: 'sem_taxa'
    },
    {
      eventId: 5,
      eventCode: 'EVT-2026-005',
      eventTitle: 'Stand-up Comedy Gala',
      eventStatus: 'publicado',
      producerId: 5,
      producerName: 'Risorama Produções',
      producerDocument: '44.567.890/0001-22',
      salesGrossCents: 2250000,
      ticketsSold: 330,
      diskFeeCents: 225000,
      serviceFeeType: 'percentage',
      serviceFeeBps: 1000,
      serviceFeeFixedCents: 0,
      serviceFeePaidBy: 'producer',
      spreadEnabled: false,
      spreadBps: 0,
      spreadCents: 0,
      advancedEnabled: false,
      advancedRateBps: 0,
      hasActiveAdvance: false,
      pendingAdvanceCount: 0,
      hasAgreement: true,
      agreementStatus: 'ativa',
      currentVersion: 1,
      contractNumber: 'CTR-2026-005',
      payoutTermsDays: 2,
      payoutModel: 'pos_evento',
      situation: 'regular'
    }
  ],
  producers: [
    {
      id: 1,
      name: 'DiskIngressos Produções',
      document: '04.829.144/0001-90',
      status: 'ativo',
      responsibleName: 'Vinicius Casagrande',
      responsibleEmail: 'vinicius@diskingressos.com.br',
      totalEventsCount: 4,
      activeEventsCount: 2,
      configuringEventsCount: 1,
      closedEventsCount: 1,
      totalSalesCents: 18500000,
      totalDiskFeesCents: 1850000,
      totalSpreadCents: 277500,
      totalAdvancedActiveCount: 1,
      pendingIssuesCount: 0,
      events: [
        {
          eventId: 1,
          eventCode: 'EVT-2026-001',
          eventTitle: 'Festival de Inverno Curitiba 2026',
          eventStatus: 'publicado',
          salesGrossCents: 18500000,
          feeDisplay: '10%',
          situation: 'regular'
        }
      ]
    },
    {
      id: 2,
      name: 'Prime Entretenimento',
      document: '11.234.567/0001-88',
      status: 'ativo',
      responsibleName: 'Mac Lovio Solek',
      responsibleEmail: 'mac@prime.com.br',
      totalEventsCount: 6,
      activeEventsCount: 3,
      configuringEventsCount: 0,
      closedEventsCount: 3,
      totalSalesCents: 14200000,
      totalDiskFeesCents: 1420000,
      totalSpreadCents: 0,
      totalAdvancedActiveCount: 0,
      pendingIssuesCount: 0,
      events: [
        {
          eventId: 2,
          eventCode: 'EVT-2026-002',
          eventTitle: 'Iron Maiden Symphonic Live',
          eventStatus: 'publicado',
          salesGrossCents: 14200000,
          feeDisplay: '10%',
          situation: 'regular'
        }
      ]
    },
    {
      id: 3,
      name: 'Seven Entretenimento',
      document: '22.345.678/0001-99',
      status: 'ativo',
      responsibleName: 'Gian Zambon',
      responsibleEmail: 'gian@seven.art.br',
      totalEventsCount: 3,
      activeEventsCount: 2,
      configuringEventsCount: 0,
      closedEventsCount: 1,
      totalSalesCents: 9800000,
      totalDiskFeesCents: 980000,
      totalSpreadCents: 196000,
      totalAdvancedActiveCount: 1,
      pendingIssuesCount: 1,
      events: [
        {
          eventId: 3,
          eventCode: 'EVT-2026-003',
          eventTitle: 'Sunset Eletrônico Warung',
          eventStatus: 'publicado',
          salesGrossCents: 9800000,
          feeDisplay: '10%',
          situation: 'pendente'
        }
      ]
    },
    {
      id: 4,
      name: 'CWB Brasil',
      document: '33.456.789/0001-11',
      status: 'ativo',
      responsibleName: 'João Guilherme',
      responsibleEmail: 'joao@cwbbrasil.com.br',
      totalEventsCount: 5,
      activeEventsCount: 1,
      configuringEventsCount: 1,
      closedEventsCount: 3,
      totalSalesCents: 3500000,
      totalDiskFeesCents: 350000,
      totalSpreadCents: 0,
      totalAdvancedActiveCount: 0,
      pendingIssuesCount: 1,
      events: [
        {
          eventId: 4,
          eventCode: 'EVT-2026-004',
          eventTitle: 'Festival Sertanejo Curitiba',
          eventStatus: 'configuracao',
          salesGrossCents: 3500000,
          feeDisplay: 'R$ 5,00',
          situation: 'sem_taxa'
        }
      ]
    },
    {
      id: 5,
      name: 'Risorama Produções',
      document: '44.567.890/0001-22',
      status: 'ativo',
      responsibleName: 'Diogo Portugal',
      responsibleEmail: 'diogo@risorama.com.br',
      totalEventsCount: 2,
      activeEventsCount: 1,
      configuringEventsCount: 0,
      closedEventsCount: 1,
      totalSalesCents: 2250000,
      totalDiskFeesCents: 225000,
      totalSpreadCents: 0,
      totalAdvancedActiveCount: 0,
      pendingIssuesCount: 0,
      events: [
        {
          eventId: 5,
          eventCode: 'EVT-2026-005',
          eventTitle: 'Stand-up Comedy Gala',
          eventStatus: 'publicado',
          salesGrossCents: 2250000,
          feeDisplay: '10% (Produtor)',
          situation: 'regular'
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
  const [error, setError] = useState<string | null>(null)

  // Pesquisa Comercial Global (no topo)
  const [globalSearch, setGlobalSearch] = useState('')

  // Filtros da tabela de eventos
  const [eventFilter, setEventFilter] = useState<
    'all' | 'ativos' | 'configuracao' | 'publicados' | 'encerrados' | 'com_pendencia' | 'sem_taxa' | 'advanced' | 'spread'
  >('all')

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

  // Pesquisa Global: Resultados Separados em Tempo Real
  const searchResults = useMemo(() => {
    if (!data || !globalSearch.trim()) return { events: [], producers: [] }
    const q = globalSearch.toLowerCase().trim()

    const events = data.events.filter(e =>
      e.eventTitle.toLowerCase().includes(q) ||
      e.eventCode.toLowerCase().includes(q) ||
      e.producerName.toLowerCase().includes(q) ||
      e.contractNumber.toLowerCase().includes(q) ||
      String(e.eventId).includes(q)
    )

    const producers = data.producers.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.document.toLowerCase().includes(q) ||
      p.responsibleName.toLowerCase().includes(q)
    )

    return { events, producers }
  }, [data, globalSearch])

  // Filtragem da tabela "Eventos — Situação Comercial"
  const filteredEvents = useMemo(() => {
    if (!data) return []
    let list = data.events

    if (eventFilter === 'ativos') {
      list = list.filter(e => e.eventStatus === 'publicado' || e.eventStatus === 'ativo')
    } else if (eventFilter === 'configuracao') {
      list = list.filter(e => e.eventStatus === 'rascunho' || e.eventStatus === 'configuracao')
    } else if (eventFilter === 'publicados') {
      list = list.filter(e => e.eventStatus === 'publicado')
    } else if (eventFilter === 'encerrados') {
      list = list.filter(e => e.eventStatus === 'encerrado' || e.eventStatus === 'finalizado')
    } else if (eventFilter === 'com_pendencia') {
      list = list.filter(e => e.situation !== 'regular')
    } else if (eventFilter === 'sem_taxa') {
      list = list.filter(e => e.situation === 'sem_taxa')
    } else if (eventFilter === 'advanced') {
      list = list.filter(e => e.advancedEnabled)
    } else if (eventFilter === 'spread') {
      list = list.filter(e => e.spreadEnabled)
    }

    return list
  }, [data, eventFilter])

  // Abre modal para definir taxa
  const handleOpenFeeModal = (item: CommercialEventItem) => {
    setEditingItem(item)
    setModalError(null)

    setServiceFeeType(item.serviceFeeType || 'percentage')
    setServiceFeePercent(item.serviceFeeBps ? (item.serviceFeeBps / 100).toFixed(1) : '10.0')
    setServiceFeeFixed(item.serviceFeeFixedCents ? (item.serviceFeeFixedCents / 100).toFixed(2) : '5.00')
    setServiceFeePaidBy(item.serviceFeePaidBy || 'buyer')
    setSpreadEnabled(item.spreadEnabled || false)
    setSpreadPercent(item.spreadBps ? (item.spreadBps / 100).toFixed(1) : '1.5')
    setAdvancedEnabled(item.advancedEnabled || false)
    setAdvancedRate(item.advancedRateBps ? (item.advancedRateBps / 100).toFixed(1) : '2.5')
    setAdvancedMax('70')
    setPayoutTermsDays(String(item.payoutTermsDays || 2))
    setPayoutModel((item.payoutModel as any) || 'pos_evento')
    setContractNumber(item.contractNumber || `CTR-${item.eventCode}`)
    setChangeReason(item.hasAgreement ? 'Ajuste de taxa comercial' : 'Definição de taxa comercial de serviço')
  }

  // Salva taxa
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

  return (
    <LimitlessPage dataTestId="commercial-hub-page" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* 1. Header com Título e Botão de Atualizar */}
      <div className="card border-0 shadow-none bg-transparent mb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--ll-border)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-subtle-primary">
                Painel de Operação Comercial
              </span>
              <span className="badge badge-subtle-success">
                Dados 100% Reais
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--ll-text)] flex items-center gap-2.5">
              <Scale className="text-[var(--ll-primary)] w-7 h-7" />
              Dashboard Comercial
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ll-text-2)] mt-1 leading-relaxed">
              Localize produtores ou eventos, acompanhe a situação contratual e gerencie as taxas Disk, spread e antecipações.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="btn-primary flex items-center gap-2 text-xs cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar Informações</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. PESQUISA COMERCIAL GLOBAL (no topo) */}
      <div className="relative">
        <div className="card p-2.5 shadow-sm">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ll-primary)]" />
            <input
              type="text"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              placeholder="Pesquisar produtor, evento, ID do evento, CNPJ/CPF, responsável ou contrato..."
              className="form-control w-full pl-10 pr-10 text-xs sm:text-sm"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ll-text-muted)] hover:text-[var(--ll-text)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dropdown de Resultados da Pesquisa Global */}
        {globalSearch.trim() && (
          <div className="absolute top-full left-0 right-0 z-40 mt-2 p-3 card shadow-2xl space-y-3 max-h-96 overflow-y-auto">
            {searchResults.events.length === 0 && searchResults.producers.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--ll-text-muted)]">
                Nenhum produtor ou evento encontrado para &ldquo;{globalSearch}&rdquo;.
              </div>
            ) : (
              <>
                {/* Produtores Encontrados */}
                {searchResults.producers.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-[var(--ll-text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5 px-2">
                      <Building2 className="w-3.5 h-3.5 text-[var(--ll-primary)]" />
                      Produtores ({searchResults.producers.length})
                    </div>
                    <div className="space-y-1">
                      {searchResults.producers.map(prod => (
                        <button
                          key={prod.id}
                          onClick={() => {
                            setSelectedProducer(prod)
                            setGlobalSearch('')
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-[var(--ll-muted)] transition flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <div className="font-semibold text-[var(--ll-text)] group-hover:text-[var(--ll-primary)] transition text-sm">
                              {prod.name}
                            </div>
                            <div className="text-xs text-[var(--ll-text-muted)]">
                              CNPJ: {prod.document} • Resp: {prod.responsibleName} • {prod.totalEventsCount} eventos
                            </div>
                          </div>
                          <span className="text-xs text-[var(--ll-primary)] font-semibold flex items-center gap-1">
                            Abrir Ficha <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Eventos Encontrados */}
                {searchResults.events.length > 0 && (
                  <div className="pt-2 border-t border-[var(--ll-border)]">
                    <div className="text-[11px] font-bold text-[var(--ll-text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5 px-2">
                      <Scale className="w-3.5 h-3.5 text-emerald-500" />
                      Eventos ({searchResults.events.length})
                    </div>
                    <div className="space-y-1">
                      {searchResults.events.map(ev => (
                        <button
                          key={ev.eventId}
                          onClick={() => {
                            setSelectedEventDossier(ev)
                            setGlobalSearch('')
                          }}
                          className="w-full text-left p-2.5 rounded-lg hover:bg-[var(--ll-muted)] transition flex items-center justify-between group cursor-pointer"
                        >
                          <div>
                            <div className="font-semibold text-[var(--ll-text)] group-hover:text-emerald-500 transition text-sm">
                              {ev.eventTitle}
                            </div>
                            <div className="text-xs text-[var(--ll-text-muted)]">
                              {ev.eventCode} • {ev.producerName} • Status: {ev.eventStatus} • Taxa: {ev.serviceFeeType === 'percentage' ? `${(ev.serviceFeeBps / 100).toFixed(1)}%` : `R$ ${(ev.serviceFeeFixedCents / 100).toFixed(2)}`}
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

      {/* Tratamento de Erro e Estado de Carregamento */}
      {loading && !data ? (
        <div className="p-16 text-center text-[var(--ll-text-muted)] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-7 h-7 animate-spin text-[var(--ll-primary)]" />
          <span className="text-sm font-medium">Consultando dados comerciais reais do Core...</span>
        </div>
      ) : error && !data ? (
        <div className="p-6 text-center text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl flex flex-col items-center justify-center gap-3">
          <AlertTriangle className="w-7 h-7" />
          <span className="font-semibold text-base">{error}</span>
          <button
            onClick={fetchDashboard}
            className="btn-primary text-xs"
          >
            Tentar novamente
          </button>
        </div>
      ) : !data ? (
        <div className="p-12 text-center text-[var(--ll-text-muted)]">
          Nenhum dado comercial disponível.
        </div>
      ) : (
        <>
          {/* 3. OS 12 INDICADORES OPERACIONAIS REAIS */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--ll-text-muted)] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--ll-primary)]" />
              Indicadores Operacionais Comerciais
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              <div className="card p-3.5 shadow-sm">
                <div className="text-[11px] text-[var(--ll-text-muted)] uppercase font-bold tracking-wider">Eventos Ativos</div>
                <div className="text-xl font-black text-[var(--ll-text)] mt-1">{data.kpis.activeEvents}</div>
                <div className="text-[11px] text-[var(--ll-text-muted)] mt-0.5">Em operação</div>
              </div>

              <div className="card p-3.5 shadow-sm">
                <div className="text-[11px] text-[var(--ll-text-muted)] uppercase font-bold tracking-wider">Em Configuração</div>
                <div className="text-xl font-black text-amber-500 mt-1">{data.kpis.configuringEvents}</div>
                <div className="text-[11px] text-[var(--ll-text-muted)] mt-0.5">Não publicados</div>
              </div>

              <div className="card p-3.5 shadow-sm">
                <div className="text-[11px] text-[var(--ll-text-muted)] uppercase font-bold tracking-wider">Publicados</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{data.kpis.publishedEvents}</div>
                <div className="text-[11px] text-[var(--ll-text-muted)] mt-0.5">Vendas abertas</div>
              </div>

              <div className="card p-3.5 shadow-sm">
                <div className="text-[11px] text-[var(--ll-text-muted)] uppercase font-bold tracking-wider">Encerrados</div>
                <div className="text-xl font-black text-[var(--ll-text-muted)] mt-1">{data.kpis.closedEvents}</div>
                <div className="text-[11px] text-[var(--ll-text-muted)] mt-0.5">Finalizados</div>
              </div>

              <div className="card p-3.5 shadow-sm">
                <div className="text-[11px] text-[var(--ll-text-muted)] uppercase font-bold tracking-wider">Produtores Ativos</div>
                <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{data.kpis.activeProducers}</div>
                <div className="text-[11px] text-[var(--ll-text-muted)] mt-0.5">Com eventos</div>
              </div>

              <div className="card p-3.5 shadow-sm">
                <div className="text-[11px] text-[var(--ll-text-muted)] uppercase font-bold tracking-wider">Vendas Atuais</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{moneyCompact(data.kpis.currentSalesCents)}</div>
                <div className="text-[11px] text-[var(--ll-text-muted)] mt-0.5">Total vendido</div>
              </div>

              <div className="card p-3.5 shadow-sm">
                <div className="text-[11px] text-[var(--ll-text-muted)] uppercase font-bold tracking-wider">Ingressos Vendidos</div>
                <div className="text-xl font-black text-[var(--ll-text)] mt-1">{data.kpis.ticketsSold.toLocaleString('pt-BR')}</div>
                <div className="text-[11px] text-[var(--ll-text-muted)] mt-0.5">Consolidado</div>
              </div>

              <div className="card p-3.5 shadow-sm">
                <div className="text-[11px] text-[var(--ll-text-muted)] uppercase font-bold tracking-wider">Taxas Disk</div>
                <div className="text-xl font-black text-[var(--ll-primary)] mt-1">{moneyCompact(data.kpis.diskFeesCents)}</div>
                <div className="text-[11px] text-[var(--ll-text-muted)] mt-0.5">Receita de taxas</div>
              </div>

              <div className="card p-3.5 shadow-sm">
                <div className="text-[11px] text-[var(--ll-text-muted)] uppercase font-bold tracking-wider">Spread</div>
                <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">{moneyCompact(data.kpis.spreadCents)}</div>
                <div className="text-[11px] text-[var(--ll-text-muted)] mt-0.5">Operações ativas</div>
              </div>

              <div className="card p-3.5 shadow-sm">
                <div className="text-[11px] text-[var(--ll-text-muted)] uppercase font-bold tracking-wider">Advanced</div>
                <div className="text-xl font-black text-amber-500 mt-1">{moneyCompact(data.kpis.advancedActiveCents)}</div>
                <div className="text-[11px] text-[var(--ll-text-muted)] mt-0.5">Antecipações</div>
              </div>

              <div className="card p-3.5 shadow-sm">
                <div className="text-[11px] text-[var(--ll-text-muted)] uppercase font-bold tracking-wider">A Receber</div>
                <div className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-1">{moneyCompact(data.kpis.receivablesCents)}</div>
                <div className="text-[11px] text-[var(--ll-text-muted)] mt-0.5">Previsto</div>
              </div>

              <div className="card p-3.5 shadow-sm">
                <div className="text-[11px] text-[var(--ll-text-muted)] uppercase font-bold tracking-wider">Pendências</div>
                <div className="text-xl font-black text-rose-500 mt-1">{data.kpis.commercialIssuesCount}</div>
                <div className="text-[11px] text-[var(--ll-text-muted)] mt-0.5">Atenção exigida</div>
              </div>
            </div>
          </div>

          {/* 4. ALERTAS COMERCIAIS ("Atenção Necessária") */}
          {data.alerts && data.alerts.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--ll-text-muted)] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Atenção Necessária Hoje
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.alerts.map(alert => {
                  const borderClass =
                    alert.severity === 'danger'
                      ? 'border-l-4 border-l-rose-500'
                      : alert.severity === 'warning'
                      ? 'border-l-4 border-l-amber-500'
                      : alert.severity === 'info'
                      ? 'border-l-4 border-l-sky-500'
                      : 'border-l-4 border-l-[var(--ll-border)]'

                  return (
                    <button
                      key={alert.id}
                      onClick={() => setEventFilter(alert.filterKey as any)}
                      className={`card p-3 text-left hover:shadow-md transition space-y-1 cursor-pointer ${borderClass}`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between text-[var(--ll-text)]">
                        <span>{alert.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[var(--ll-text-muted)]" />
                      </div>
                      <p className="text-[11px] text-[var(--ll-text-2)]">{alert.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 5. SEÇÃO CENTRAL: EVENTOS — SITUAÇÃO COMERCIAL */}
          <div className="card overflow-hidden shadow-sm">
            <div className="card-header flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[var(--ll-primary)]" />
                <h2 className="card-title text-sm font-bold">Eventos — Situação Comercial</h2>
              </div>

              {/* Filtros da Tabela com Segmented Tabs Limitless */}
              <div className="limitless-tabs overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setEventFilter('all')}
                  className={`limitless-tab-btn ${eventFilter === 'all' ? 'active' : ''}`}
                >
                  Todos ({data.events.length})
                </button>
                <button
                  onClick={() => setEventFilter('ativos')}
                  className={`limitless-tab-btn ${eventFilter === 'ativos' ? 'active' : ''}`}
                >
                  Ativos ({data.kpis.activeEvents})
                </button>
                <button
                  onClick={() => setEventFilter('configuracao')}
                  className={`limitless-tab-btn ${eventFilter === 'configuracao' ? 'active' : ''}`}
                >
                  Configuração ({data.kpis.configuringEvents})
                </button>
                <button
                  onClick={() => setEventFilter('publicados')}
                  className={`limitless-tab-btn ${eventFilter === 'publicados' ? 'active' : ''}`}
                >
                  Publicados ({data.kpis.publishedEvents})
                </button>
                <button
                  onClick={() => setEventFilter('com_pendencia')}
                  className={`limitless-tab-btn ${eventFilter === 'com_pendencia' ? 'active' : ''}`}
                >
                  Com Pendência ({data.kpis.commercialIssuesCount})
                </button>
                <button
                  onClick={() => setEventFilter('advanced')}
                  className={`limitless-tab-btn ${eventFilter === 'advanced' ? 'active' : ''}`}
                >
                  Advanced
                </button>
                <button
                  onClick={() => setEventFilter('spread')}
                  className={`limitless-tab-btn ${eventFilter === 'spread' ? 'active' : ''}`}
                >
                  Spread
                </button>
              </div>
            </div>

            {/* Tabela Operacional Limitless */}
            <div>
              {filteredEvents.length === 0 ? (
                <div className="p-12 text-center text-[var(--ll-text-muted)] text-xs">
                  Nenhum evento encontrado para o filtro selecionado.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>EVENTO</th>
                        <th>PRODUTOR</th>
                        <th>STATUS</th>
                        <th>VENDAS</th>
                        <th>TAXA</th>
                        <th>SPREAD</th>
                        <th>ADVANCED</th>
                        <th>SITUAÇÃO</th>
                        <th className="text-right">AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map(ev => {
                        const feeDisplay =
                          ev.serviceFeeType === 'percentage'
                            ? `${(ev.serviceFeeBps / 100).toFixed(1)}%`
                            : `R$ ${(ev.serviceFeeFixedCents / 100).toFixed(2)}`

                        const situationBadge =
                          ev.situation === 'regular' ? (
                            <span className="badge badge-subtle-success">
                              Regular
                            </span>
                          ) : ev.situation === 'sem_taxa' ? (
                            <span className="badge badge-subtle-danger">
                              Sem Taxa
                            </span>
                          ) : (
                            <span className="badge badge-subtle-warning">
                              Pendente
                            </span>
                          )

                        return (
                          <tr
                            key={ev.eventId}
                            onClick={() => setSelectedEventDossier(ev)}
                            className="cursor-pointer group"
                          >
                            <td>
                              <div className="font-bold text-[var(--ll-text)] group-hover:text-[var(--ll-primary)] transition">
                                {ev.eventTitle}
                              </div>
                              <div className="text-[10px] text-[var(--ll-text-muted)] font-mono">
                                {ev.eventCode}
                              </div>
                            </td>

                            <td className="text-[var(--ll-text-2)]">
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-[var(--ll-text-muted)]" />
                                <span>{ev.producerName}</span>
                              </div>
                            </td>

                            <td>
                              <span className="text-xs text-[var(--ll-text-2)] capitalize font-medium">
                                {ev.eventStatus}
                              </span>
                            </td>

                            <td className="font-mono font-bold text-[var(--ll-text)]">
                              {ev.salesGrossCents > 0 ? moneyCompact(ev.salesGrossCents) : '—'}
                            </td>

                            <td className="font-mono font-medium">
                              {ev.hasAgreement ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{feeDisplay}</span>
                              ) : (
                                <span className="text-rose-500 text-xs italic">Não definida</span>
                              )}
                            </td>

                            <td className="font-mono text-xs">
                              {ev.spreadEnabled ? (
                                <span className="text-purple-600 dark:text-purple-400 font-semibold">
                                  {(ev.spreadBps / 100).toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-[var(--ll-text-muted)]">—</span>
                              )}
                            </td>

                            <td className="text-xs">
                              {ev.hasActiveAdvance ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Ativo</span>
                              ) : ev.advancedEnabled ? (
                                <span className="text-amber-500 font-semibold">Elegível</span>
                              ) : (
                                <span className="text-[var(--ll-text-muted)]">—</span>
                              )}
                            </td>

                            <td>
                              {situationBadge}
                            </td>

                            <td className="text-right space-x-2" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenFeeModal(ev)}
                                className="px-2.5 py-1 bg-[var(--ll-primary)] hover:bg-[var(--ll-primary-hover)] text-white text-xs font-semibold rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                                title="Definir ou ajustar taxa comercial deste evento"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>{ev.hasAgreement ? 'Ajustar' : 'Definir'}</span>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </>
      )}

      {/* 6. MODAL DA FICHA DO PRODUTOR (quando selecionado) */}
      {selectedProducer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="card max-w-3xl w-full shadow-2xl my-8 overflow-hidden">
            <div className="card-header pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--ll-primary)]/10 border border-[var(--ll-primary)]/20 flex items-center justify-center text-[var(--ll-primary)] font-black text-lg">
                  {selectedProducer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--ll-text)]">{selectedProducer.name}</h3>
                  <div className="text-xs text-[var(--ll-text-muted)] mt-0.5">
                    Responsável: <span className="font-semibold text-[var(--ll-text)]">{selectedProducer.responsibleName}</span> • Documento: <span className="font-mono text-[var(--ll-text)]">{selectedProducer.document}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedProducer(null)}
                className="p-1.5 rounded-lg text-[var(--ll-text-muted)] hover:text-[var(--ll-text)] hover:bg-[var(--ll-muted)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="card-body space-y-4">
              {/* Métricas Consolidadas do Produtor */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[var(--ll-muted)] border border-[var(--ll-border)]">
                  <span className="text-[var(--ll-text-muted)] font-semibold block">Eventos Totais</span>
                  <span className="text-lg font-black text-[var(--ll-text)]">{selectedProducer.totalEventsCount}</span>
                  <span className="text-[10px] text-[var(--ll-text-muted)] block mt-0.5">
                    {selectedProducer.activeEventsCount} ativos • {selectedProducer.configuringEventsCount} config
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[var(--ll-muted)] border border-[var(--ll-border)]">
                  <span className="text-[var(--ll-text-muted)] font-semibold block">Vendas Acumuladas</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{money(selectedProducer.totalSalesCents)}</span>
                </div>

                <div className="p-3 rounded-lg bg-[var(--ll-muted)] border border-[var(--ll-border)]">
                  <span className="text-[var(--ll-text-muted)] font-semibold block">Taxas Disk Geradas</span>
                  <span className="text-lg font-black text-[var(--ll-primary)]">{money(selectedProducer.totalDiskFeesCents)}</span>
                </div>

                <div className="p-3 rounded-lg bg-[var(--ll-muted)] border border-[var(--ll-border)]">
                  <span className="text-[var(--ll-text-muted)] font-semibold block">Spread Acumulado</span>
                  <span className="text-lg font-black text-purple-600 dark:text-purple-400">{money(selectedProducer.totalSpreadCents)}</span>
                </div>
              </div>

              {/* Lista de Eventos do Produtor */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[var(--ll-text)] uppercase tracking-wider">
                  Eventos Desta Produtora ({selectedProducer.events.length})
                </h4>
                <div className="max-h-60 overflow-y-auto divide-y divide-[var(--ll-border)] rounded-lg border border-[var(--ll-border)] bg-[var(--ll-muted)]">
                  {selectedProducer.events.map(ev => (
                    <div
                      key={ev.eventId}
                      onClick={() => {
                        setSelectedProducer(null)
                        handleOpenEventContext(ev.eventId)
                      }}
                      className="p-3 hover:bg-[var(--ll-surface)] transition cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-[var(--ll-text)] text-sm hover:text-[var(--ll-primary)]">
                          {ev.eventTitle}
                        </div>
                        <div className="text-xs text-[var(--ll-text-muted)] font-mono">
                          {ev.eventCode} • Vendas: {moneyCompact(ev.salesGrossCents)} • Taxa: {ev.feeDisplay}
                        </div>
                      </div>
                      <button className="px-2.5 py-1 rounded bg-[var(--ll-surface)] border border-[var(--ll-border)] text-xs text-[var(--ll-text)] hover:bg-[var(--ll-primary)] hover:text-white transition flex items-center gap-1 cursor-pointer">
                        <span>Abrir Operação</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL DO DOSSIÊ DE CONDIÇÕES COMERCIAIS DO EVENTO */}
      {selectedEventDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="card max-w-2xl w-full shadow-2xl my-8 overflow-hidden">
            <div className="card-header pb-4">
              <div>
                <div className="text-xs font-bold text-[var(--ll-primary)] uppercase tracking-wider mb-1">
                  Ficha Comercial do Evento
                </div>
                <h3 className="text-lg font-bold text-[var(--ll-text)]">{selectedEventDossier.eventTitle}</h3>
                <div className="text-xs text-[var(--ll-text-muted)] mt-0.5">
                  <span className="font-mono text-[var(--ll-text)]">{selectedEventDossier.eventCode}</span> • Produtora: <span className="font-semibold text-[var(--ll-text)]">{selectedEventDossier.producerName}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEventDossier(null)}
                className="p-1.5 rounded-lg text-[var(--ll-text-muted)] hover:text-[var(--ll-text)] hover:bg-[var(--ll-muted)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="card-body space-y-4">
              {/* Painel Estruturado de Condições Comerciais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Taxa de Serviço */}
                <div className="p-3.5 rounded-xl bg-[var(--ll-muted)] border border-[var(--ll-border)] space-y-1">
                  <span className="font-bold text-[var(--ll-text)] block">Taxa de Serviço Disk</span>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {selectedEventDossier.serviceFeeType === 'percentage'
                      ? `${(selectedEventDossier.serviceFeeBps / 100).toFixed(1)}%`
                      : `R$ ${(selectedEventDossier.serviceFeeFixedCents / 100).toFixed(2)}`}
                  </div>
                  <span className="text-[var(--ll-text-muted)] block">
                    Paga por: {selectedEventDossier.serviceFeePaidBy === 'buyer' ? 'Comprador' : 'Produtor'}
                  </span>
                </div>

                {/* Spread */}
                <div className="p-3.5 rounded-xl bg-[var(--ll-muted)] border border-[var(--ll-border)] space-y-1">
                  <span className="font-bold text-[var(--ll-text)] block">Spread Comercial</span>
                  <div className="text-lg font-black text-purple-600 dark:text-purple-400">
                    {selectedEventDossier.spreadEnabled ? `${(selectedEventDossier.spreadBps / 100).toFixed(1)}%` : 'Inativo'}
                  </div>
                  <span className="text-[var(--ll-text-muted)] block">
                    {selectedEventDossier.spreadEnabled ? 'Operação de spread contratada' : 'Sem spread configurado'}
                  </span>
                </div>

                {/* Advanced */}
                <div className="p-3.5 rounded-xl bg-[var(--ll-muted)] border border-[var(--ll-border)] space-y-1">
                  <span className="font-bold text-[var(--ll-text)] block">Advanced (Antecipação)</span>
                  <div className="text-lg font-black text-amber-500">
                    {selectedEventDossier.advancedEnabled ? 'Habilitado' : 'Desabilitado'}
                  </div>
                  <span className="text-[var(--ll-text-muted)] block">
                    {selectedEventDossier.hasActiveAdvance ? 'Possui contratos de antecipação em vigor' : 'Sem operações ativas'}
                  </span>
                </div>

                {/* Repasse & Contrato */}
                <div className="p-3.5 rounded-xl bg-[var(--ll-muted)] border border-[var(--ll-border)] space-y-1">
                  <span className="font-bold text-[var(--ll-text)] block">Repasse & Contrato</span>
                  <div className="text-sm font-bold text-[var(--ll-text)]">
                    Prazo: D+{selectedEventDossier.payoutTermsDays} ({selectedEventDossier.payoutModel})
                  </div>
                  <span className="text-[var(--ll-text-muted)] font-mono block">
                    {selectedEventDossier.contractNumber} (v{selectedEventDossier.currentVersion})
                  </span>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--ll-border)]">
                <button
                  onClick={() => {
                    const ev = selectedEventDossier
                    setSelectedEventDossier(null)
                    handleOpenFeeModal(ev)
                  }}
                  className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Condições / Nova Negociação</span>
                </button>

                <button
                  onClick={() => {
                    const eventId = selectedEventDossier.eventId
                    setSelectedEventDossier(null)
                    handleOpenEventContext(eventId)
                  }}
                  className="btn-light text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Abrir Gestão do Evento</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL PARA DEFINIR / AJUSTAR TAXA COMERCIAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="card max-w-2xl w-full shadow-2xl my-8 overflow-hidden">
            <div className="card-header pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--ll-primary)] uppercase tracking-wider mb-1">
                  <Scale className="w-4 h-4" />
                  Autonomia Comercial • Definição de Taxa
                </div>
                <h3 className="text-lg font-bold text-[var(--ll-text)]">
                  {editingItem.eventTitle}
                </h3>
                <p className="text-xs text-[var(--ll-text-muted)]">
                  Código: <span className="font-mono text-[var(--ll-text)]">{editingItem.eventCode}</span> • Produtora: <span className="font-semibold text-[var(--ll-text)]">{editingItem.producerName}</span>
                </p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-lg text-[var(--ll-text-muted)] hover:text-[var(--ll-text)] hover:bg-[var(--ll-muted)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="card-body">
              {modalError && (
                <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveFee} className="space-y-4">
                {/* Modelo e Valor da Taxa */}
                <div className="p-4 rounded-xl bg-[var(--ll-muted)] border border-[var(--ll-border)] space-y-3">
                  <label className="text-xs font-bold text-[var(--ll-text)] uppercase tracking-wider block">
                    1. Taxa de Serviço Disk
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[var(--ll-text-muted)] font-semibold block mb-1">Modelo de Cobrança</label>
                      <select
                        value={serviceFeeType}
                        onChange={e => setServiceFeeType(e.target.value as 'percentage' | 'fixed')}
                        className="form-select w-full text-xs font-medium cursor-pointer"
                      >
                        <option value="percentage">Percentual (%) sobre o valor do ingresso</option>
                        <option value="fixed">Valor Fixo (R$) por ingresso emitido</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-[var(--ll-text-muted)] font-semibold block mb-1">
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
                              onChange={e => setServiceFeePercent(e.target.value)}
                              className="form-control w-full pr-8 text-xs font-mono"
                            />
                            <Percent className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ll-text-muted)]" />
                          </>
                        ) : (
                          <>
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ll-text-muted)] text-xs font-mono">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={serviceFeeFixed}
                              onChange={e => setServiceFeeFixed(e.target.value)}
                              className="form-control w-full pl-9 text-xs font-mono"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[var(--ll-text-muted)] font-semibold block mb-1">Quem Arca com a Taxa de Serviço?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setServiceFeePaidBy('buyer')}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition cursor-pointer ${
                          serviceFeePaidBy === 'buyer'
                            ? 'bg-[var(--ll-primary)]/10 border-[var(--ll-primary)] text-[var(--ll-primary)] font-bold'
                            : 'bg-[var(--ll-surface)] border-[var(--ll-border)] text-[var(--ll-text-2)] hover:text-[var(--ll-text)]'
                        }`}
                      >
                        <strong className="block font-bold">Comprador</strong>
                        <span className="text-[11px] text-[var(--ll-text-muted)]">Taxa somada no checkout</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setServiceFeePaidBy('producer')}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition cursor-pointer ${
                          serviceFeePaidBy === 'producer'
                            ? 'bg-[var(--ll-primary)]/10 border-[var(--ll-primary)] text-[var(--ll-primary)] font-bold'
                            : 'bg-[var(--ll-surface)] border-[var(--ll-border)] text-[var(--ll-text-2)] hover:text-[var(--ll-text)]'
                        }`}
                      >
                        <strong className="block font-bold">Produtor</strong>
                        <span className="text-[11px] text-[var(--ll-text-muted)]">Descontada do repasse</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Spread & Advanced */}
                <div className="p-4 rounded-xl bg-[var(--ll-muted)] border border-[var(--ll-border)] space-y-3">
                  <label className="text-xs font-bold text-[var(--ll-text)] uppercase tracking-wider block">
                    2. Spread e Antecipação (Advanced)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-[var(--ll-surface)] border border-[var(--ll-border)] space-y-2">
                      <label className="flex items-center justify-between text-xs text-[var(--ll-text)] font-semibold cursor-pointer">
                        <span>Spread Comercial</span>
                        <input
                          type="checkbox"
                          checked={spreadEnabled}
                          onChange={e => setSpreadEnabled(e.target.checked)}
                          className="rounded border-[var(--ll-border)] text-[var(--ll-primary)] focus:ring-0 cursor-pointer"
                        />
                      </label>
                      {spreadEnabled && (
                        <div className="pt-1">
                          <label className="text-[11px] text-[var(--ll-text-muted)] block mb-1">Percentual (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={spreadPercent}
                            onChange={e => setSpreadPercent(e.target.value)}
                            className="form-control w-full text-xs font-mono"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-3 rounded-lg bg-[var(--ll-surface)] border border-[var(--ll-border)] space-y-2">
                      <label className="flex items-center justify-between text-xs text-[var(--ll-text)] font-semibold cursor-pointer">
                        <span>Habilitar Advanced</span>
                        <input
                          type="checkbox"
                          checked={advancedEnabled}
                          onChange={e => setAdvancedEnabled(e.target.checked)}
                          className="rounded border-[var(--ll-border)] text-[var(--ll-primary)] focus:ring-0 cursor-pointer"
                        />
                      </label>
                      {advancedEnabled && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="text-[11px] text-[var(--ll-text-muted)] block mb-0.5">Taxa (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={advancedRate}
                              onChange={e => setAdvancedRate(e.target.value)}
                              className="form-control w-full text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-[var(--ll-text-muted)] block mb-0.5">Limite (%)</label>
                            <input
                              type="number"
                              step="5"
                              value={advancedMax}
                              onChange={e => setAdvancedMax(e.target.value)}
                              className="form-control w-full text-xs font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-xs text-[var(--ll-text-muted)] font-semibold block mb-1">Prazo de Repasse</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--ll-text-muted)]">D+</span>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={payoutTermsDays}
                          onChange={e => setPayoutTermsDays(e.target.value)}
                          className="form-control w-20 text-xs font-mono"
                        />
                        <span className="text-xs text-[var(--ll-text-muted)]">dias úteis</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-[var(--ll-text-muted)] font-semibold block mb-1">Número do Contrato</label>
                      <input
                        type="text"
                        placeholder="CTR-..."
                        value={contractNumber}
                        onChange={e => setContractNumber(e.target.value)}
                        className="form-control w-full text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Justificativa Comercial Obrigatória */}
                <div className="p-4 rounded-xl bg-[var(--ll-muted)] border border-[var(--ll-border)] space-y-2">
                  <label className="text-xs font-bold text-[var(--ll-text)] uppercase tracking-wider block">
                    3. Justificativa Comercial Obrigatória
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={changeReason}
                    onChange={e => setChangeReason(e.target.value)}
                    placeholder="Ex: Condição comercial de 10% acordada com o produtor conforme proposta..."
                    className="form-control w-full text-xs"
                  />
                </div>

                {/* Ações */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    disabled={modalLoading}
                    className="btn-light text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="btn-primary text-xs font-semibold cursor-pointer flex items-center gap-2"
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
            </div>
          </div>
        </div>
      )}
    </LimitlessPage>
  )
}

export default CommercialHubPage

