import React, { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  MapPin,
  Calendar,
  Layers,
  ShoppingBag,
  CreditCard,
  Image as ImageIcon,
  Radio,
  DoorClosed,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import type { EventBuilderStep, EventReadinessScore } from '../../types/event-support.types'

interface EventBuilderViewProps {
  steps: EventBuilderStep[]
  readiness: EventReadinessScore
  onOpenMap?: () => void
}

export const EventBuilderView: React.FC<EventBuilderViewProps> = ({
  steps,
  readiness,
  onOpenMap
}) => {
  const [selectedStepId, setSelectedStepId] = useState<number>(1)

  const getStepIcon = (id: number) => {
    switch (id) {
      case 1:
        return <FileText className="w-4 h-4" />
      case 2:
        return <MapPin className="w-4 h-4" />
      case 3:
        return <Calendar className="w-4 h-4" />
      case 4:
      case 5:
        return <Layers className="w-4 h-4" />
      case 6:
      case 7:
      case 8:
        return <ShoppingBag className="w-4 h-4" />
      case 9:
        return <CreditCard className="w-4 h-4" />
      case 10:
        return <ImageIcon className="w-4 h-4" />
      case 11:
        return <Radio className="w-4 h-4" />
      case 12:
        return <DoorClosed className="w-4 h-4" />
      case 13:
      default:
        return <ShieldCheck className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: EventBuilderStep['status']) => {
    switch (status) {
      case 'concluido':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Concluído
          </span>
        )
      case 'em_andamento':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Em Andamento
          </span>
        )
      case 'alerta':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" /> Pendência Leve
          </span>
        )
      case 'pendente':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> Pendente
          </span>
        )
    }
  }

  const activeStep = steps.find((s) => s.id === selectedStepId) || steps[0]

  return (
    <div className="space-y-6">
      {/* Barra de Score de Prontidão */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-4 border-b border-indigo-900/40">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Event Readiness Engine (Score de Homologação)
            </div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              Prontidão para Publicação:
              <span className="text-emerald-400 font-mono text-3xl">
                {readiness.totalPercent}%
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Auditoria de consistência do Disk Core validando regras de capacidade, concorrência, financeiro e mídias.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-indigo-900/40 text-center">
              <span className="text-xs text-slate-400 block font-medium">Bloqueadores</span>
              <span className={`text-xl font-bold ${readiness.blockersCount === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {readiness.blockersCount}
              </span>
            </div>
            <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-indigo-900/40 text-center">
              <span className="text-xs text-slate-400 block font-medium">Avisos Leves</span>
              <span className="text-xl font-bold text-amber-400">
                {readiness.warningsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso Visual */}
        <div className="mt-4">
          <div className="h-3 w-full bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-indigo-900/30">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
              style={{ width: `${readiness.totalPercent}%` }}
            />
          </div>
        </div>

        {/* Pilares */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6">
          {readiness.pillars.map((pillar) => (
            <div
              key={pillar.name}
              className="bg-slate-950/60 p-3 rounded-xl border border-indigo-900/30 text-center"
            >
              <span className="text-[11px] text-slate-300 block truncate font-medium">
                {pillar.name}
              </span>
              <span className={`text-sm font-bold ${pillar.score === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {pillar.score}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Principal: Lista das 13 Etapas + Painel de Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Lista de Etapas (7 Colunas) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">
              Etapas do Event Builder (13 Módulos de Montagem)
            </h4>
            <span className="text-xs text-slate-500">
              {steps.filter((s) => s.status === 'concluido').length} de {steps.length} concluídas
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
            {steps.map((step) => {
              const isSelected = step.id === selectedStepId
              return (
                <button
                  key={step.id}
                  onClick={() => setSelectedStepId(step.id)}
                  className={`w-full text-left p-4 transition-all flex items-center justify-between gap-4 hover:bg-slate-50 ${
                    isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-2 rounded-lg border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {getStepIcon(step.id)}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {step.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {getStatusBadge(step.status)}
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? 'rotate-90 text-indigo-600' : ''}`} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Painel da Etapa Ativa (5 Colunas) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              {activeStep.category}
            </span>
            {getStatusBadge(activeStep.status)}
          </div>

          <div className="my-4">
            <h3 className="text-lg font-bold text-slate-900">
              {activeStep.title}
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {activeStep.summary}
            </p>
          </div>

          {/* Checklist interno da etapa */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Itens Obrigatórios ({activeStep.itemsCompleted}/{activeStep.itemsTotal})
            </h5>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Parametrização validada pelo Suporte</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Regras de concorrência e integridade ativas</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Contrato único gravado no Disk Core</span>
              </div>
            </div>
          </div>

          {/* Ações Especiais conforme a etapa */}
          {activeStep.id === 4 && onOpenMap && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onOpenMap}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-lg"
              >
                <Layers className="w-4 h-4" />
                Abrir Editor Disk Maps (Grade de Assentos)
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Módulo auditado pelo Disk Core</span>
            <span className="font-mono font-semibold text-slate-700">v2.4</span>
          </div>
        </div>
      </div>
    </div>
  )
}
