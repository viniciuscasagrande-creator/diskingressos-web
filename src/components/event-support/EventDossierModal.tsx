import React, { useState } from 'react'
import {
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  MapPin,
  Building,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Layers,
  History,
  Send,
  Globe
} from 'lucide-react'
import type { EventDossier } from '../../types/event-support.types'
import { eventSupportService } from '../../services/eventSupport.service'
import { DiskMapsViewer } from './DiskMapsViewer'
import { EventBuilderView } from './EventBuilderView'

interface EventDossierModalProps {
  dossier: EventDossier
  isOpen: boolean
  onClose: () => void
  onPublish?: () => void
}

export const EventDossierModal: React.FC<EventDossierModalProps> = ({
  dossier,
  isOpen,
  onClose,
  onPublish
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'builder' | 'mapa' | 'checklist' | 'auditoria'>('builder')
  const [published, setPublished] = useState(false)

  if (!isOpen) return null

  const { request, venue, map, builderSteps, readiness, auditHistory } = dossier

  const handlePublishClick = async () => {
    const res = await eventSupportService.publishEvent(request.id)
    if (res.ok) {
      setPublished(true)
      if (onPublish) onPublish()
    }
  }

  return (
    <div
      data-testid="event-dossier-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn"
    >
      <div className="bg-slate-50 border border-slate-300 rounded-2xl w-full max-w-7xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho do Dossiê */}
        <div className="bg-white px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
              DI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {request.protocol}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Prioridade {request.priority}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                  Status: {request.status}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                {request.eventName}
              </h2>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <strong>Produtor:</strong> {request.producerName}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <strong>Local:</strong> {request.venueName} ({request.city}/{request.state})
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <strong>Data:</strong> {request.eventDate}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => alert(`Pré-visualização do site DiskIngressos (newdawn.diskingressos.com.br) para ${request.eventName}`)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-300"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              Visualizar como Comprador
            </button>

            {published ? (
              <span className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md">
                <CheckCircle2 className="w-4 h-4" />
                Evento Publicado no Core!
              </span>
            ) : (
              <button
                type="button"
                onClick={handlePublishClick}
                disabled={!readiness.canPublish}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md ${
                  readiness.canPublish
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Homologar e Publicar
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Abas de Navegação do Dossiê */}
        <div className="bg-white px-6 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('builder')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'builder'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Event Builder (13 Etapas)
          </button>
          <button
            onClick={() => setActiveTab('mapa')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'mapa'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Disk Maps (Assentos & Inventário)
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'checklist'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Score de Prontidão ({readiness.totalPercent}%)
          </button>
          <button
            onClick={() => setActiveTab('auditoria')}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'auditoria'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            Histórico & Auditoria
          </button>
        </div>

        {/* Corpo do Conteúdo por Aba */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'builder' && (
            <EventBuilderView
              steps={builderSteps}
              readiness={readiness}
              onOpenMap={() => setActiveTab('mapa')}
            />
          )}

          {activeTab === 'mapa' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-xs text-indigo-950">
                <span className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <strong>Motor de Mapas e Assentos:</strong> As alterações físicas impactam diretamente a tabela de inventário atômico do Disk Core.
                </span>
                <span className="font-bold text-indigo-700">
                  Total de Assentos: {map.totalCapacity}
                </span>
              </div>
              <DiskMapsViewer map={map} />
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="text-base font-bold text-slate-900 mb-4">
                  Validações Automáticas de Homologação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {readiness.pillars.map((pillar) => (
                    <div key={pillar.name} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-800">{pillar.name}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${pillar.score === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {pillar.score}%
                        </span>
                      </div>
                      <ul className="space-y-2 text-xs">
                        {pillar.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            {item.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            )}
                            <span className={item.passed ? 'text-slate-700' : 'text-amber-800 font-medium'}>
                              {item.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'auditoria' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Trilha Oficial de Auditoria (Disk Core Audit Log)
              </h3>
              <div className="divide-y divide-slate-100">
                {auditHistory.map((log) => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{log.action}</p>
                      <p className="text-slate-600 mt-0.5">{log.notes}</p>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Origem: <strong>{log.systemOrigin}</strong> • Autor: <strong>{log.author}</strong>
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px] flex-shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
