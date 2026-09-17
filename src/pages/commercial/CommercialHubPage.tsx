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

export const CommercialHubPage: React.FC<CommercialHubPageProps> = ({
  producerId,
  onNavigate,
  onSelectEvent,
  notify
}) => {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        if (res.status === 401) {
          throw new Error('Sua sessão expirou ou não está autenticada. Faça login novamente para carregar o Comercial.')
        }
        throw new Error(errorData.message || `Erro na API (${res.status})`)
      }

      const json = await res.json()
      setData(json)
    } catch (err: any) {
      console.error('[CommercialHub] Erro:', err)
      setError(err?.message || 'Não foi possível carregar as informações comerciais. Tente novamente.')
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
    <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="commercial-hub-page">
      {/* 1. Header com Título e Botão de Atualizar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e293b] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              Painel de Operação Comercial
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Dados 100% Reais
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Scale className="text-orange-500" size={28} />
            Dashboard Comercial
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Localize produtores ou eventos, acompanhe a situação contratual e gerencie as taxas Disk, spread e antecipações.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Atualizar Informações
          </button>
        </div>
      </div>

      {/* 2. PESQUISA COMERCIAL GLOBAL (no topo) */}
      <div className="relative">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            placeholder="Pesquisar produtor, evento, ID do evento, CNPJ/CPF, responsável ou contrato..."
            className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-orange-500 text-sm text-white placeholder-slate-400 focus:outline-none transition shadow-lg"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Dropdown de Resultados da Pesquisa Global */}
        {globalSearch.trim() && (
          <div className="absolute top-full left-0 right-0 z-40 mt-2 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl space-y-3 max-h-96 overflow-y-auto">
            {searchResults.events.length === 0 && searchResults.producers.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Nenhum produtor ou evento encontrado para &ldquo;{globalSearch}&rdquo;.
              </div>
            ) : (
              <>
                {/* Produtores Encontrados */}
                {searchResults.producers.length > 0 && (
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-2">
                      <Building2 size={13} className="text-orange-400" />
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
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800 transition flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-semibold text-white group-hover:text-orange-400 transition text-sm">
                              {prod.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              CNPJ: {prod.document} • Resp: {prod.responsibleName} • {prod.totalEventsCount} eventos
                            </div>
                          </div>
                          <span className="text-xs text-orange-400 flex items-center gap-1">
                            Abrir Ficha <ChevronRight size={13} />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Eventos Encontrados */}
                {searchResults.events.length > 0 && (
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-2">
                      <Scale size={13} className="text-emerald-400" />
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
                          className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800 transition flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-semibold text-white group-hover:text-emerald-400 transition text-sm">
                              {ev.eventTitle}
                            </div>
                            <div className="text-xs text-slate-400">
                              {ev.eventCode} • {ev.producerName} • Status: {ev.eventStatus} • Taxa: {ev.serviceFeeType === 'percentage' ? `${(ev.serviceFeeBps / 100).toFixed(1)}%` : `R$ ${(ev.serviceFeeFixedCents / 100).toFixed(2)}`}
                            </div>
                          </div>
                          <span className="text-xs text-emerald-400 flex items-center gap-1">
                            Condições <ChevronRight size={13} />
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
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw size={28} className="animate-spin text-orange-500" />
          <span className="text-sm font-medium">Consultando dados comerciais reais do Core...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-rose-400 bg-rose-950/20 border border-rose-800/40 rounded-xl flex flex-col items-center justify-center gap-3">
          <AlertTriangle size={28} />
          <span className="font-semibold text-base">{error}</span>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Tentar novamente
          </button>
        </div>
      ) : !data ? (
        <div className="p-12 text-center text-slate-400">
          Nenhum dado disponível.
        </div>
      ) : (
        <>
          {/* 3. OS 12 INDICADORES OPERACIONAIS REAIS */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BarChart3 size={15} className="text-orange-400" />
              Indicadores Operacionais Comerciais
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Eventos Ativos</div>
                <div className="text-xl font-bold text-white mt-1">{data.kpis.activeEvents}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Em operação</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Em Configuração</div>
                <div className="text-xl font-bold text-amber-400 mt-1">{data.kpis.configuringEvents}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Não publicados</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Publicados</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">{data.kpis.publishedEvents}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Vendas abertas</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Encerrados</div>
                <div className="text-xl font-bold text-slate-400 mt-1">{data.kpis.closedEvents}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Finalizados</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Produtores Ativos</div>
                <div className="text-xl font-bold text-blue-400 mt-1">{data.kpis.activeProducers}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Com eventos</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Vendas Atuais</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">{moneyCompact(data.kpis.currentSalesCents)}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Total vendido</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Ingressos Vendidos</div>
                <div className="text-xl font-bold text-white mt-1">{data.kpis.ticketsSold.toLocaleString('pt-BR')}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Consolidado</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Taxas Disk</div>
                <div className="text-xl font-bold text-orange-400 mt-1">{moneyCompact(data.kpis.diskFeesCents)}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Receita de taxas</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Spread</div>
                <div className="text-xl font-bold text-purple-400 mt-1">{moneyCompact(data.kpis.spreadCents)}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Operações ativas</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Advanced</div>
                <div className="text-xl font-bold text-amber-400 mt-1">{moneyCompact(data.kpis.advancedActiveCents)}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Antecipações</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">A Receber</div>
                <div className="text-xl font-bold text-cyan-400 mt-1">{moneyCompact(data.kpis.receivablesCents)}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Previsto</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Pendências</div>
                <div className="text-xl font-bold text-rose-400 mt-1">{data.kpis.commercialIssuesCount}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Atenção exigida</div>
              </div>
            </div>
          </div>

          {/* 4. ALERTAS COMERCIAIS ("Atenção Necessária") */}
          {data.alerts && data.alerts.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <AlertCircle size={15} className="text-amber-400" />
                Atenção Necessária Hoje
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.alerts.map(alert => {
                  const borderClass =
                    alert.severity === 'danger'
                      ? 'border-rose-800/60 bg-rose-950/20 text-rose-400'
                      : alert.severity === 'warning'
                      ? 'border-amber-800/60 bg-amber-950/20 text-amber-400'
                      : alert.severity === 'info'
                      ? 'border-blue-800/60 bg-blue-950/20 text-blue-400'
                      : 'border-slate-800 bg-slate-900/80 text-slate-300'

                  return (
                    <button
                      key={alert.id}
                      onClick={() => setEventFilter(alert.filterKey as any)}
                      className={`p-3 rounded-xl border text-left hover:scale-[1.01] transition space-y-1 ${borderClass}`}
                    >
                      <div className="font-semibold text-xs flex items-center justify-between">
                        <span>{alert.title}</span>
                        <ChevronRight size={13} />
                      </div>
                      <p className="text-[11px] text-slate-400">{alert.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 5. SEÇÃO CENTRAL: EVENTOS — SITUAÇÃO COMERCIAL */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Scale size={18} className="text-orange-400" />
                <h2 className="text-base font-bold text-white">Eventos — Situação Comercial</h2>
              </div>

              {/* Filtros da Tabela */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setEventFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    eventFilter === 'all'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Todos ({data.events.length})
                </button>
                <button
                  onClick={() => setEventFilter('ativos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    eventFilter === 'ativos'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Ativos ({data.kpis.activeEvents})
                </button>
                <button
                  onClick={() => setEventFilter('configuracao')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    eventFilter === 'configuracao'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Configuração ({data.kpis.configuringEvents})
                </button>
                <button
                  onClick={() => setEventFilter('publicados')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    eventFilter === 'publicados'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Publicados ({data.kpis.publishedEvents})
                </button>
                <button
                  onClick={() => setEventFilter('com_pendencia')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    eventFilter === 'com_pendencia'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Com Pendência ({data.kpis.commercialIssuesCount})
                </button>
                <button
                  onClick={() => setEventFilter('advanced')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    eventFilter === 'advanced'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Advanced
                </button>
                <button
                  onClick={() => setEventFilter('spread')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    eventFilter === 'spread'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Spread
                </button>
              </div>
            </div>

            {/* Tabela Operacional */}
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
              {filteredEvents.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  Nenhum evento encontrado para o filtro selecionado.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">EVENTO</th>
                        <th className="py-3 px-4">PRODUTOR</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4">VENDAS</th>
                        <th className="py-3 px-4">TAXA</th>
                        <th className="py-3 px-4">SPREAD</th>
                        <th className="py-3 px-4">ADVANCED</th>
                        <th className="py-3 px-4">SITUAÇÃO</th>
                        <th className="py-3 px-4 text-right">AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredEvents.map(ev => {
                        const feeDisplay =
                          ev.serviceFeeType === 'percentage'
                            ? `${(ev.serviceFeeBps / 100).toFixed(1)}%`
                            : `R$ ${(ev.serviceFeeFixedCents / 100).toFixed(2)}`

                        const situationBadge =
                          ev.situation === 'regular' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Regular
                            </span>
                          ) : ev.situation === 'sem_taxa' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              Sem Taxa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              Pendente
                            </span>
                          )

                        return (
                          <tr
                            key={ev.eventId}
                            onClick={() => setSelectedEventDossier(ev)}
                            className="hover:bg-slate-800/50 transition cursor-pointer group"
                          >
                            <td className="py-3 px-4">
                              <div className="font-semibold text-white group-hover:text-orange-400 transition">
                                {ev.eventTitle}
                              </div>
                              <div className="text-xs text-slate-500 font-mono">
                                {ev.eventCode}
                              </div>
                            </td>

                            <td className="py-3 px-4 text-slate-300">
                              <div className="flex items-center gap-1.5">
                                <Building2 size={13} className="text-slate-500" />
                                <span>{ev.producerName}</span>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className="text-xs text-slate-300 capitalize font-medium">
                                {ev.eventStatus}
                              </span>
                            </td>

                            <td className="py-3 px-4 font-mono font-medium text-white">
                              {ev.salesGrossCents > 0 ? moneyCompact(ev.salesGrossCents) : '—'}
                            </td>

                            <td className="py-3 px-4 font-mono font-medium">
                              {ev.hasAgreement ? (
                                <span className="text-emerald-400">{feeDisplay}</span>
                              ) : (
                                <span className="text-rose-400/90 text-xs italic">Não definida</span>
                              )}
                            </td>

                            <td className="py-3 px-4 font-mono text-xs">
                              {ev.spreadEnabled ? (
                                <span className="text-purple-400 font-medium">
                                  {(ev.spreadBps / 100).toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-xs">
                              {ev.hasActiveAdvance ? (
                                <span className="text-emerald-400 font-medium">Ativo</span>
                              ) : ev.advancedEnabled ? (
                                <span className="text-amber-400 font-medium">Elegível</span>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              {situationBadge}
                            </td>

                            <td className="py-3 px-4 text-right space-x-2" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenFeeModal(ev)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-orange-600/90 hover:bg-orange-500 text-white text-xs font-medium transition"
                                title="Definir ou ajustar taxa comercial deste evento"
                              >
                                <Edit3 size={12} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-lg">
                  {selectedProducer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedProducer.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Responsável: <span className="text-slate-200">{selectedProducer.responsibleName}</span> • Documento: <span className="font-mono text-slate-200">{selectedProducer.document}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedProducer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Métricas Consolidadas do Produtor */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block">Eventos Totais</span>
                <span className="text-lg font-bold text-white">{selectedProducer.totalEventsCount}</span>
                <span className="text-[10px] text-slate-500 block">
                  {selectedProducer.activeEventsCount} ativos • {selectedProducer.configuringEventsCount} config • {selectedProducer.closedEventsCount} encerrados
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block">Vendas Acumuladas</span>
                <span className="text-lg font-bold text-emerald-400">{money(selectedProducer.totalSalesCents)}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block">Taxas Disk Geradas</span>
                <span className="text-lg font-bold text-orange-400">{money(selectedProducer.totalDiskFeesCents)}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block">Spread Acumulado</span>
                <span className="text-lg font-bold text-purple-400">{money(selectedProducer.totalSpreadCents)}</span>
              </div>
            </div>

            {/* Lista de Eventos do Produtor */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Eventos Desta Produtora ({selectedProducer.events.length})
              </h4>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 rounded-lg border border-slate-800 bg-slate-950/40">
                {selectedProducer.events.map(ev => (
                  <div
                    key={ev.eventId}
                    onClick={() => {
                      setSelectedProducer(null)
                      handleOpenEventContext(ev.eventId)
                    }}
                    className="p-3 hover:bg-slate-800/60 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white text-sm hover:text-orange-400">
                        {ev.eventTitle}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {ev.eventCode} • Vendas: {moneyCompact(ev.salesGrossCents)} • Taxa: {ev.feeDisplay}
                      </div>
                    </div>
                    <button className="px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1">
                      <span>Abrir Operação</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL DO DOSSIÊ DE CONDIÇÕES COMERCIAIS DO EVENTO */}
      {selectedEventDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
                  Ficha Comercial do Evento
                </div>
                <h3 className="text-xl font-bold text-white">{selectedEventDossier.eventTitle}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  <span className="font-mono text-slate-200">{selectedEventDossier.eventCode}</span> • Produtora: <span className="text-slate-200">{selectedEventDossier.producerName}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEventDossier(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Painel Estruturado de Condições Comerciais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Taxa de Serviço */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-semibold text-white block">Taxa de Serviço Disk</span>
                <div className="text-lg font-bold text-emerald-400">
                  {selectedEventDossier.serviceFeeType === 'percentage'
                    ? `${(selectedEventDossier.serviceFeeBps / 100).toFixed(1)}%`
                    : `R$ ${(selectedEventDossier.serviceFeeFixedCents / 100).toFixed(2)}`}
                </div>
                <span className="text-slate-400 block">
                  Paga por: {selectedEventDossier.serviceFeePaidBy === 'buyer' ? 'Comprador' : 'Produtor'}
                </span>
              </div>

              {/* Spread */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-semibold text-white block">Spread Comercial</span>
                <div className="text-lg font-bold text-purple-400">
                  {selectedEventDossier.spreadEnabled ? `${(selectedEventDossier.spreadBps / 100).toFixed(1)}%` : 'Inativo'}
                </div>
                <span className="text-slate-400 block">
                  {selectedEventDossier.spreadEnabled ? 'Operação de spread contratada' : 'Sem spread configurado'}
                </span>
              </div>

              {/* Advanced */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-semibold text-white block">Advanced (Antecipação)</span>
                <div className="text-lg font-bold text-amber-400">
                  {selectedEventDossier.advancedEnabled ? 'Habilitado' : 'Desabilitado'}
                </div>
                <span className="text-slate-400 block">
                  {selectedEventDossier.hasActiveAdvance ? 'Possui contratos de antecipação em vigor' : 'Sem operações ativas'}
                </span>
              </div>

              {/* Repasse & Contrato */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-semibold text-white block">Repasse & Contrato</span>
                <div className="text-sm font-bold text-white">
                  Prazo: D+{selectedEventDossier.payoutTermsDays} ({selectedEventDossier.payoutModel})
                </div>
                <span className="text-slate-400 font-mono block">
                  {selectedEventDossier.contractNumber} (v{selectedEventDossier.currentVersion})
                </span>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  const ev = selectedEventDossier
                  setSelectedEventDossier(null)
                  handleOpenFeeModal(ev)
                }}
                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Edit3 size={14} />
                <span>Editar Condições / Nova Negociação</span>
              </button>

              <button
                onClick={() => {
                  const eventId = selectedEventDossier.eventId
                  setSelectedEventDossier(null)
                  handleOpenEventContext(eventId)
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <span>Abrir Gestão do Evento</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL PARA DEFINIR / AJUSTAR TAXA COMERCIAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
                  <Scale size={14} />
                  Autonomia Comercial • Definição de Taxa
                </div>
                <h3 className="text-lg font-bold text-white">
                  {editingItem.eventTitle}
                </h3>
                <p className="text-xs text-slate-400">
                  Código: <span className="font-mono text-slate-300">{editingItem.eventCode}</span> • Produtora: <span className="text-slate-300">{editingItem.producerName}</span>
                </p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveFee} className="space-y-4">
              {/* Modelo e Valor da Taxa */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-white uppercase tracking-wider block">
                  1. Taxa de Serviço Disk
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Modelo de Cobrança</label>
                    <select
                      value={serviceFeeType}
                      onChange={e => setServiceFeeType(e.target.value as 'percentage' | 'fixed')}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="percentage">Percentual (%) sobre o valor do ingresso</option>
                      <option value="fixed">Valor Fixo (R$) por ingresso emitido</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
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
                            className="w-full pl-3 pr-8 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                          />
                          <Percent size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </>
                      ) : (
                        <>
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={serviceFeeFixed}
                            onChange={e => setServiceFeeFixed(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Quem Arca com a Taxa de Serviço?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setServiceFeePaidBy('buyer')}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition ${
                        serviceFeePaidBy === 'buyer'
                          ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <strong className="block font-semibold">Comprador</strong>
                      <span className="text-[11px] text-slate-500">Taxa somada no checkout</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setServiceFeePaidBy('producer')}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition ${
                        serviceFeePaidBy === 'producer'
                          ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <strong className="block font-semibold">Produtor</strong>
                      <span className="text-[11px] text-slate-500">Descontada do repasse</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Spread & Advanced */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-white uppercase tracking-wider block">
                  2. Spread e Antecipação (Advanced)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                      <span className="font-semibold">Spread Comercial</span>
                      <input
                        type="checkbox"
                        checked={spreadEnabled}
                        onChange={e => setSpreadEnabled(e.target.checked)}
                        className="rounded border-slate-700 text-orange-600 focus:ring-0"
                      />
                    </label>
                    {spreadEnabled && (
                      <div className="pt-1">
                        <label className="text-[11px] text-slate-400 block mb-1">Percentual (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={spreadPercent}
                          onChange={e => setSpreadPercent(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                      <span className="font-semibold">Habilitar Advanced</span>
                      <input
                        type="checkbox"
                        checked={advancedEnabled}
                        onChange={e => setAdvancedEnabled(e.target.checked)}
                        className="rounded border-slate-700 text-orange-600 focus:ring-0"
                      />
                    </label>
                    {advancedEnabled && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-0.5">Taxa (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={advancedRate}
                            onChange={e => setAdvancedRate(e.target.value)}
                            className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-0.5">Limite (%)</label>
                          <input
                            type="number"
                            step="5"
                            value={advancedMax}
                            onChange={e => setAdvancedMax(e.target.value)}
                            className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Prazo de Repasse</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">D+</span>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={payoutTermsDays}
                        onChange={e => setPayoutTermsDays(e.target.value)}
                        className="w-20 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                      />
                      <span className="text-xs text-slate-500">dias úteis</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Número do Contrato</label>
                    <input
                      type="text"
                      placeholder="CTR-..."
                      value={contractNumber}
                      onChange={e => setContractNumber(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Justificativa Comercial Obrigatória */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-white uppercase tracking-wider block">
                  3. Justificativa Comercial Obrigatória
                </label>
                <textarea
                  required
                  rows={2}
                  value={changeReason}
                  onChange={e => setChangeReason(e.target.value)}
                  placeholder="Ex: Condição comercial de 10% acordada com o produtor conforme proposta..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition shadow-lg shadow-orange-900/40 flex items-center gap-2"
                >
                  {modalLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Gravando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Salvar Condições</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommercialHubPage
