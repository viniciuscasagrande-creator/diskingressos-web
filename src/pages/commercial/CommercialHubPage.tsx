import React, { useEffect, useState, useMemo } from 'react'
import {
  Scale,
  Search,
  Filter,
  RefreshCw,
  Plus,
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
  Lock
} from 'lucide-react'
import type { PageKey } from '../../components/ModuleSidebar'
import { getAuthHeader } from '../../services/api'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'active' | 'draft' | 'advanced' | 'spread'>('all')

  const fetchOverview = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/commercial/overview', {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      })
      if (!res.ok) {
        throw new Error(`Falha ao obter dados comerciais (${res.status}).`)
      }
      const data = await res.json()
      setItems(data.items || [])
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

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = search.toLowerCase()
      const matchesSearch =
        item.eventTitle.toLowerCase().includes(q) ||
        item.eventCode.toLowerCase().includes(q) ||
        item.producerName.toLowerCase().includes(q)

      if (!matchesSearch) return false

      if (filterType === 'active') return item.agreementStatus === 'ativo'
      if (filterType === 'draft') return item.agreementStatus === 'rascunho' || !item.hasAgreement
      if (filterType === 'advanced') return item.advancedEnabled
      if (filterType === 'spread') return item.spreadEnabled
      return true
    })
  }, [items, search, filterType])

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Motor Comercial por Evento
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Snapshot Imutável
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Scale className="text-emerald-400" size={28} />
            Gestão Comercial de Eventos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Contratos de taxas Disk por evento, esteira de antecipação (Advanced), split/spread e prazos de liquidação financeira.
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
          <button
            onClick={() => onNavigate?.('new-event')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition shadow-lg shadow-emerald-900/30"
          >
            <Plus size={16} />
            Novo Evento
          </button>
        </div>
      </div>

      {/* KPI Cards */}
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
            Cada evento possui sua própria condição de taxa (% ou fixa), prazo de repasse e contrato. Nenhuma taxa é global forçada sem contexto.
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

      {/* Barra de Filtros & Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por evento, código ou produtora..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
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
            Ativos ({stats.withAgreement})
          </button>
          <button
            onClick={() => setFilterType('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              filterType === 'draft'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Rascunhos ({items.length - stats.withAgreement})
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
            <span>Carregando condições comerciais do banco de dados...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle size={24} />
            <span className="font-semibold">Erro operacional ao carregar acordos comerciais</span>
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
            <p className="text-xs text-slate-500 mt-1">Crie um novo evento ou ajuste a busca acima.</p>
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
                  <th className="py-3 px-4 text-right">Ações</th>
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
                            Rascunho
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-white">
                        {feeDisplay}
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

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenEventConditions(item.eventId)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-medium transition shadow-sm"
                        >
                          <span>Gerenciar</span>
                          <ChevronRight size={13} />
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
  )
}

export default CommercialHubPage
