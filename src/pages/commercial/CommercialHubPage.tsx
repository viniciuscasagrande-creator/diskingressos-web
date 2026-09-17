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
  Users
} from 'lucide-react'
import type { PageKey } from '../../components/ModuleSidebar'
import { getAuthHeader, getProducers } from '../../services/api'

interface CommercialOverviewItem {
  eventId: number
  eventCode: string
  eventTitle: string
  producerId: number
  producerName: string
  eventStatus: string
  hasAgreement: boolean
  agreementStatus: string
  currentVersion: number
  serviceFeeType: 'percentage' | 'fixed'
  serviceFeeBps: number
  serviceFeeFixedCents: number
  spreadEnabled: boolean
  advancedEnabled: boolean
  payoutTermsDays: number
}

interface ProducerItem {
  id: number
  name: string
  document?: string
  status?: string
}

interface CommercialHubPageProps {
  onNavigate?: (page: PageKey, context?: any) => void
  onSelectEvent?: (eventId: number) => void
  notify?: (msg: string) => void
}

export const CommercialHubPage: React.FC<CommercialHubPageProps> = ({
  onNavigate,
  onSelectEvent,
  notify
}) => {
  const [items, setItems] = useState<CommercialOverviewItem[]>([])
  const [producersList, setProducersList] = useState<ProducerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Abas de visualização do comercial
  const [mainTab, setMainTab] = useState<'eventos' | 'produtores'>('eventos')

  // Filtros
  const [search, setSearch] = useState('')
  const [producerFilter, setProducerFilter] = useState<number | 'all'>('all')
  const [filterType, setFilterType] = useState<'all' | 'active' | 'draft' | 'advanced' | 'spread'>('all')

  // Modal para inclusão / definição de taxa comercial
  const [editingItem, setEditingItem] = useState<CommercialOverviewItem | null>(null)
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

  const fetchOverview = async () => {
    setLoading(true)
    setError(null)
    try {
      const [overviewRes, producersData] = await Promise.all([
        fetch('/api/commercial/overview', {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          }
        }),
        getProducers().catch(() => [])
      ])

      if (!overviewRes.ok) {
        throw new Error(`Falha ao obter dados comerciais (${overviewRes.status}).`)
      }
      const data = await overviewRes.json()
      setItems(data.items || [])
      setProducersList(producersData || [])
    } catch (err: any) {
      console.error('[CommercialHub] Erro:', err)
      setError(err.message || 'Erro ao carregar visão comercial.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  // Abre modal para incluir ou definir taxa do evento
  const handleOpenFeeModal = (item: CommercialOverviewItem) => {
    setEditingItem(item)
    setModalError(null)

    // Preenche com os valores vigentes ou padrão comercial
    setServiceFeeType(item.serviceFeeType || 'percentage')
    setServiceFeePercent(item.serviceFeeBps ? (item.serviceFeeBps / 100).toFixed(1) : '10.0')
    setServiceFeeFixed(item.serviceFeeFixedCents ? (item.serviceFeeFixedCents / 100).toFixed(2) : '5.00')
    setServiceFeePaidBy('buyer')
    setSpreadEnabled(item.spreadEnabled || false)
    setSpreadPercent('1.5')
    setAdvancedEnabled(item.advancedEnabled || false)
    setAdvancedRate('2.5')
    setAdvancedMax('70')
    setPayoutTermsDays(String(item.payoutTermsDays || 2))
    setPayoutModel('pos_evento')
    setContractNumber(`CTR-${item.eventCode}`)
    setChangeReason(item.hasAgreement ? 'Ajuste de taxa comercial negociada' : 'Definição inicial de taxa de serviço do evento')
  }

  // Salva a taxa do evento
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
      await fetchOverview()
    } catch (err: any) {
      console.error('[CommercialHub] Erro ao salvar taxa:', err)
      setModalError(err.message || 'Falha ao gravar condições de taxa.')
    } finally {
      setModalLoading(false)
    }
  }

  // Filtros de eventos
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = search.toLowerCase()
      const matchesSearch =
        item.eventTitle.toLowerCase().includes(q) ||
        item.eventCode.toLowerCase().includes(q) ||
        item.producerName.toLowerCase().includes(q)

      if (!matchesSearch) return false

      if (producerFilter !== 'all' && item.producerId !== producerFilter) return false

      if (filterType === 'active') return item.agreementStatus === 'ativo'
      if (filterType === 'draft') return item.agreementStatus === 'rascunho' || !item.hasAgreement
      if (filterType === 'advanced') return item.advancedEnabled
      if (filterType === 'spread') return item.spreadEnabled
      return true
    })
  }, [items, search, producerFilter, filterType])

  // Produtoras com contagem de eventos
  const producerStats = useMemo(() => {
    const map = new Map<number, { id: number; name: string; document: string; eventCount: number; activeAgreements: number }>()

    producersList.forEach(p => {
      map.set(p.id, {
        id: p.id,
        name: p.name,
        document: p.document || 'Não informado',
        eventCount: 0,
        activeAgreements: 0
      })
    })

    items.forEach(ev => {
      let entry = map.get(ev.producerId)
      if (!entry) {
        entry = {
          id: ev.producerId,
          name: ev.producerName,
          document: 'Não informado',
          eventCount: 0,
          activeAgreements: 0
        }
        map.set(ev.producerId, entry)
      }
      entry.eventCount += 1
      if (ev.hasAgreement && ev.agreementStatus === 'ativo') {
        entry.activeAgreements += 1
      }
    })

    return Array.from(map.values()).filter(p => {
      if (!search) return true
      const q = search.toLowerCase()
      return p.name.toLowerCase().includes(q) || p.document.toLowerCase().includes(q)
    })
  }, [producersList, items, search])

  const stats = useMemo(() => {
    const total = items.length
    const withAgreement = items.filter(i => i.hasAgreement && i.agreementStatus === 'ativo').length
    const withAdvanced = items.filter(i => i.advancedEnabled).length
    const withSpread = items.filter(i => i.spreadEnabled).length
    return { total, withAgreement, withAdvanced, withSpread }
  }, [items])

  const handleOpenEventConditions = (eventId: number) => {
    if (onSelectEvent) {
      onSelectEvent(eventId)
    }
    if (onNavigate) {
      onNavigate('event-commercial-conditions')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" data-testid="commercial-hub-page">
      {/* Header com escopo de atuação do Comercial */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Motor Comercial por Evento
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Snapshot Imutável
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Consulta Geral & Autonomia de Taxas
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Scale className="text-emerald-400" size={28} />
            Gestão Comercial de Eventos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Consulta ampla de eventos e produtoras com autonomia para inclusão, negociação e aplicação de taxas Disk, spread e prazos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Regra de Autonomia Comercial */}
      <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-300 flex items-start gap-3">
        <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block font-semibold mb-0.5">Diretriz Operacional do Comercial:</strong>
          O menu Comercial consulta eventos e produtores de forma global e possui <strong>autonomia para incluir e definir o valor de taxa de serviço do evento</strong>, prazos de repasse e spread. O cadastro de novos eventos não é de competência do comercial (é realizado exclusivamente pelos produtores/gestores no módulo de Eventos).
        </div>
      </div>

      {/* KPIs no Topo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Eventos Monitorados</span>
            <Layers size={18} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-slate-500 mt-1">Total de eventos no banco operacional</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Acordos Ativos</span>
            <FileCheck size={18} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.withAgreement}</div>
          <div className="text-xs text-slate-500 mt-1">Taxas homologadas e em vigor</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Com Advanced</span>
            <ArrowUpRight size={18} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.withAdvanced}</div>
          <div className="text-xs text-slate-500 mt-1">Elegíveis a antecipação de receitas</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-semibold tracking-wider">Com Spread</span>
            <TrendingUp size={18} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">{stats.withSpread}</div>
          <div className="text-xs text-slate-500 mt-1">Regras comerciais de spread ativas</div>
        </div>
      </div>

      {/* Regras Operacionais do Motor Comercial */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-400" />
          Princípios do Motor Comercial Integrado Disk
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="font-semibold text-white block mb-1">1. Negociação por Evento</span>
            Cada evento possui sua própria condição de taxa (% ou fixa), prazo de repasse e contrato. O Comercial inclui a taxa de acordo com a negociação.
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="font-semibold text-white block mb-1">2. Snapshot Imutável de Venda</span>
            No momento do checkout, o percentual ou valor cobrado é congelado no pedido. Renegociações futuras nunca recalculam o passado.
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="font-semibold text-white block mb-1">3. Antecipação Segura (Advanced)</span>
            O produtor antecipa exclusivamente sobre vendas líquidas pagas reais, respeitando margem de segurança e taxa contratada.
          </div>
        </div>
      </div>

      {/* Alternador de Abas do Comercial */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setMainTab('eventos')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            mainTab === 'eventos'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale size={16} />
          <span>Consulta de Eventos & Taxas ({items.length})</span>
        </button>
        <button
          onClick={() => setMainTab('produtores')}
          className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            mainTab === 'produtores'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 size={16} />
          <span>Consulta de Produtores ({producerStats.length})</span>
        </button>
      </div>

      {/* ABA 1: CONSULTA DE EVENTOS & DEFINIÇÃO DE TAXAS */}
      {mainTab === 'eventos' && (
        <div className="space-y-4">
          {/* Barra de Filtros & Busca */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto flex-1">
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por evento, código ou produtora..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Filtro por Produtora */}
              <select
                value={producerFilter}
                onChange={e => setProducerFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full sm:w-56 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="all">Todas as Produtoras</option>
                {producerStats.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  filterType === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Todos ({items.length})
              </button>
              <button
                onClick={() => setFilterType('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  filterType === 'active'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Com Taxa Ativa ({stats.withAgreement})
              </button>
              <button
                onClick={() => setFilterType('draft')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  filterType === 'draft'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Sem Taxa / Rascunho ({items.length - stats.withAgreement})
              </button>
              <button
                onClick={() => setFilterType('advanced')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  filterType === 'advanced'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Advanced ({stats.withAdvanced})
              </button>
              <button
                onClick={() => setFilterType('spread')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  filterType === 'spread'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Spread ({stats.withSpread})
              </button>
            </div>
          </div>

          {/* Tabela de Eventos & Acordos Comerciais */}
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <RefreshCw size={24} className="animate-spin text-emerald-400" />
                <span>Carregando eventos do banco de dados...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-rose-400 flex flex-col items-center justify-center gap-2">
                <AlertCircle size={24} />
                <span className="font-semibold">Erro operacional ao carregar eventos</span>
                <span className="text-xs text-slate-400">{error}</span>
                <button
                  onClick={fetchOverview}
                  className="mt-2 px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs"
                >
                  Tentar novamente
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Scale size={32} className="mx-auto text-slate-600 mb-2" />
                <p className="font-medium">Nenhum evento encontrado para o filtro selecionado.</p>
                <p className="text-xs text-slate-500 mt-1">Ajuste os filtros de pesquisa ou produtora acima.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Evento & Código</th>
                      <th className="py-3 px-4">Produtora</th>
                      <th className="py-3 px-4">Status Acordo</th>
                      <th className="py-3 px-4">Taxa de Serviço Disk</th>
                      <th className="py-3 px-4">Spread</th>
                      <th className="py-3 px-4">Advanced (Antecipação)</th>
                      <th className="py-3 px-4">Repasse</th>
                      <th className="py-3 px-4">Versão</th>
                      <th className="py-3 px-4 text-right">Ação Comercial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredItems.map(item => {
                      const feeDisplay =
                        item.serviceFeeType === 'percentage'
                          ? `${(item.serviceFeeBps / 100).toFixed(2)}%`
                          : `R$ ${(item.serviceFeeFixedCents / 100).toFixed(2)} fixo`

                      const isAtivo = item.agreementStatus === 'ativo'

                      return (
                        <tr
                          key={item.eventId}
                          className="hover:bg-slate-800/40 transition group"
                        >
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white group-hover:text-emerald-400 transition">
                              {item.eventTitle}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {item.eventCode}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Building2 size={13} className="text-slate-500" />
                              <span>{item.producerName}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {isAtivo ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                Rascunho / Sem Taxa
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-mono font-medium text-white">
                            {item.hasAgreement ? (
                              <span className="text-emerald-300">{feeDisplay}</span>
                            ) : (
                              <span className="text-amber-400/80 text-xs italic">Não definida</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {item.spreadEnabled ? (
                              <span className="text-purple-400 text-xs font-medium bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                Habilitado
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs">Não contratado</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {item.advancedEnabled ? (
                              <span className="text-amber-400 text-xs font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                Elegível
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs">Desabilitado</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-xs text-slate-300">
                            D+{item.payoutTermsDays}
                          </td>

                          <td className="py-3 px-4 text-xs font-mono text-slate-400">
                            v{item.currentVersion}
                          </td>

                          <td className="py-3 px-4 text-right space-x-2">
                            {/* Botão de autonomia: Definir ou Incluir Taxa */}
                            <button
                              onClick={() => handleOpenFeeModal(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-medium transition shadow-sm"
                              title="Incluir ou ajustar taxa negociada deste evento"
                            >
                              <Edit3 size={12} />
                              <span>{item.hasAgreement ? 'Ajustar Taxa' : 'Definir Taxa'}</span>
                            </button>

                            {/* Link para histórico e simulações detalhadas */}
                            <button
                              onClick={() => handleOpenEventConditions(item.eventId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                              title="Ver histórico e auditoria completa do evento"
                            >
                              <span>Detalhes</span>
                              <ChevronRight size={12} />
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
      )}

      {/* ABA 2: CONSULTA DE PRODUTORES & CLIENTES PJ */}
      {mainTab === 'produtores' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por produtora ou CNPJ..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div className="text-xs text-slate-400">
              Total: <strong>{producerStats.length} produtoras</strong> no cadastro
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {producerStats.map(prod => (
              <div
                key={prod.id}
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                      {prod.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-base">{prod.name}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">CNPJ: {prod.document}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Cliente Ativo
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block">Eventos Vinculados</span>
                    <span className="font-bold text-white text-sm">{prod.eventCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Com Taxa Homologada</span>
                    <span className="font-bold text-emerald-400 text-sm">{prod.activeAgreements}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setProducerFilter(prod.id)
                      setMainTab('eventos')
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center justify-center gap-1.5"
                  >
                    <span>Consultar Eventos desta Produtora</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL PARA DEFINIR / INCLUIR TAXA DO EVENTO */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
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
              {/* 1. MODELO E VALOR DA TAXA DE SERVIÇO */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-white uppercase tracking-wider block">
                  1. Taxa de Serviço Disk (Cobrada por Ingresso)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Modelo de Cobrança</label>
                    <select
                      value={serviceFeeType}
                      onChange={e => setServiceFeeType(e.target.value as 'percentage' | 'fixed')}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
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
                            className="w-full pl-3 pr-8 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
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
                            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
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
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <strong className="block font-semibold">Comprador</strong>
                      <span className="text-[11px] text-slate-500">Taxa adicionada no checkout</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setServiceFeePaidBy('producer')}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition ${
                        serviceFeePaidBy === 'producer'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <strong className="block font-semibold">Produtor</strong>
                      <span className="text-[11px] text-slate-500">Descontado do valor facial</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. SPREAD & ANTECIPAÇÃO (ADVANCED) */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-white uppercase tracking-wider block">
                  2. Condições Financeiras Adicionais
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Spread */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                      <span className="font-semibold">Regra de Spread Comercial</span>
                      <input
                        type="checkbox"
                        checked={spreadEnabled}
                        onChange={e => setSpreadEnabled(e.target.checked)}
                        className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                      />
                    </label>
                    {spreadEnabled && (
                      <div className="pt-1">
                        <label className="text-[11px] text-slate-400 block mb-1">Percentual de Spread (%)</label>
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

                  {/* Advanced */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                      <span className="font-semibold">Habilitar Advanced (Antecipação)</span>
                      <input
                        type="checkbox"
                        checked={advancedEnabled}
                        onChange={e => setAdvancedEnabled(e.target.checked)}
                        className="rounded border-slate-700 text-emerald-600 focus:ring-0"
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
                          <label className="text-[11px] text-slate-400 block mb-0.5">Limite Máx (%)</label>
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

                {/* Prazo de Repasse */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Prazo de Liquidação / Repasse</label>
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
                    <label className="text-xs text-slate-400 block mb-1">Número do Contrato / Proposta</label>
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

              {/* 3. JUSTIFICATIVA COMERCIAL OBRIGATÓRIA */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-white uppercase tracking-wider block">
                  3. Justificativa Comercial Obrigatória
                </label>
                <textarea
                  required
                  rows={2}
                  value={changeReason}
                  onChange={e => setChangeReason(e.target.value)}
                  placeholder="Ex: Condição comercial padrão 10% acordada na proposta comercial nº 2026-X..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500">
                  Esta justificativa será registrada de forma permanente e auditável no log de versões imutáveis do evento.
                </p>
              </div>

              {/* AÇÕES DO MODAL */}
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
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-lg shadow-emerald-900/40 flex items-center gap-2"
                >
                  {modalLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Gravando Taxa...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Salvar & Aplicar Taxa</span>
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
