import React, { useState, useMemo, useEffect } from 'react'
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  Building,
  User,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Flame,
  ArrowUpDown,
  PlusCircle
} from 'lucide-react'
import { eventSupportService } from '../../services/eventSupport.service'
import type { EventSupportRequest, EventWorkflowStatus } from '../../types/event-support.types'
import { EventDossierModal } from './EventDossierModal'
import { CreateEventRequestModal } from './CreateEventRequestModal'

export const EventSupportHubPage: React.FC = () => {
  const [requests, setRequests] = useState<EventSupportRequest[]>(() =>
    eventSupportService.getRequests()
  )
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'todas' | 'fila' | 'montagem' | 'mapas' | 'homologacao' | 'urgentes'>('todas')

  useEffect(() => {
    eventSupportService.getRequestsFromApi().then((apiRows) => {
      if (apiRows && apiRows.length > 0) {
        setRequests(apiRows)
      }
    })
  }, [])

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchSearch =
        req.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.producerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.venueName.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchSearch) return false

      if (activeTab === 'fila') return req.supportAgent.includes('Maria')
      if (activeTab === 'montagem') return req.status === 'EM_MONTAGEM' || req.status === 'EM_CONFIGURACAO'
      if (activeTab === 'mapas') return req.status === 'MAPA_EM_CRIACAO' || req.hasMap
      if (activeTab === 'homologacao') return req.status === 'HOMOLOGACAO' || req.status === 'AGUARDANDO_APROVACAO'
      if (activeTab === 'urgentes') return req.priority === 'URGENTE'

      return true
    })
  }, [requests, searchTerm, activeTab])

  const selectedDossier = useMemo(() => {
    if (!selectedRequestId) return null
    return eventSupportService.getDossier(selectedRequestId)
  }, [selectedRequestId])

  const getStatusBadgePtBr = (status: EventWorkflowStatus) => {
    switch (status) {
      case 'HOMOLOGACAO':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">Homologação</span>
      case 'EM_MONTAGEM':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-50 text-sky-700 border border-sky-200">Em Montagem</span>
      case 'AGUARDANDO_PRODUTOR':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Aguardando Produtor</span>
      case 'MAPA_EM_CRIACAO':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Mapa em Criação</span>
      case 'SOLICITADO':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">Novo / Solicitado</span>
      case 'APROVADO':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Aprovado pelo Produtor</span>
      case 'PUBLICADO':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200">Publicado no Site</span>
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">{status}</span>
    }
  }

  const getPriorityBadge = (priority: EventSupportRequest['priority']) => {
    switch (priority) {
      case 'URGENTE':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1"><Flame className="w-3 h-3" /> Urgente</span>
      case 'ALTA':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-200">Alta</span>
      default:
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-slate-100 text-slate-600">Normal</span>
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fadeIn" data-testid="event-support-hub">
      {/* Cabeçalho da Central */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            Disk Interno • Central Operacional de Eventos
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Suporte a Eventos & Event Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestão integrada de solicitações, criação de mapas (Disk Maps), parametrização comercial e homologação no Disk Core.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-md shadow-indigo-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            Nova Solicitação de Evento
          </button>
          <span className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Fase 29.2 Homologada
          </span>
        </div>
      </div>

      {/* 4 Cards de Métricas Operacionais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Em Implantação</p>
            <p className="text-3xl font-black text-slate-900 mt-1">27</p>
            <p className="text-xs text-sky-600 font-medium mt-1">12 com mapas ativos</p>
          </div>
          <span className="p-3 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <Layers className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aguardando Produtor</p>
            <p className="text-3xl font-black text-amber-600 mt-1">8</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Pendência de mídias/docs</p>
          </div>
          <span className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Clock className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prontos p/ Homologação</p>
            <p className="text-3xl font-black text-purple-600 mt-1">5</p>
            <p className="text-xs text-purple-600 font-medium mt-1">Score acima de 90%</p>
          </div>
          <span className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <ShieldCheck className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Urgentes / SLA Crítico</p>
            <p className="text-3xl font-black text-rose-600 mt-1">3</p>
            <p className="text-xs text-rose-600 font-medium mt-1">Vencimento em menos de 24h</p>
          </div>
          <span className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <Flame className="w-6 h-6" />
          </span>
        </div>
      </div>

      {/* Controles de Busca e Abas da Fila */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por evento, produtor, local ou protocolo..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('todas')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'todas'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('fila')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'fila'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Minha Fila
            </button>
            <button
              onClick={() => setActiveTab('montagem')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'montagem'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Montagem
            </button>
            <button
              onClick={() => setActiveTab('mapas')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'mapas'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Disk Maps
            </button>
            <button
              onClick={() => setActiveTab('homologacao')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'homologacao'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Homologação
            </button>
            <button
              onClick={() => setActiveTab('urgentes')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'urgentes'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              Urgentes
            </button>
          </div>
        </div>

        {/* Tabela Operacional */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Protocolo</th>
                <th className="py-3.5 px-4">Evento & Produtor</th>
                <th className="py-3.5 px-4">Local / Cidade</th>
                <th className="py-3.5 px-4">Data Evento</th>
                <th className="py-3.5 px-4">Responsável Disk</th>
                <th className="py-3.5 px-4">Status & SLA</th>
                <th className="py-3.5 px-4 text-center">Score</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-indigo-50/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedRequestId(req.id)}
                >
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                    {req.protocol}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{req.eventName}</p>
                    <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3 text-slate-400" />
                      {req.producerName}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-800">{req.venueName}</p>
                    <p className="text-slate-400 text-[11px]">{req.city}/{req.state}</p>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                    {req.eventDate}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {req.supportAgent.split('(')[0]}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      {getStatusBadgePtBr(req.status)}
                      <span className="text-[10px] text-slate-400">SLA: {req.slaDeadline}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        req.readinessScore >= 90
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.readinessScore >= 70
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {req.readinessScore}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedRequestId(req.id)
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
                    >
                      Dossiê 360°
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 360 do Dossiê */}
      {selectedDossier && (
        <EventDossierModal
          dossier={selectedDossier}
          isOpen={Boolean(selectedDossier)}
          onClose={() => setSelectedRequestId(null)}
          onPublish={() => {
            setRequests((prev) =>
              prev.map((r) =>
                r.id === selectedDossier.request.id ? { ...r, status: 'PUBLICADO', readinessScore: 100 } : r
              )
            )
          }}
        />
      )}

      {/* Modal de Nova Solicitacao */}
      <CreateEventRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRequestCreated={(newReq) => {
          setRequests((prev) => [newReq, ...prev])
        }}
      />
    </div>
  )
}
