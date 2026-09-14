// ==============================================================================
// FASE 28.15.6 — BLOCKEDSTATEVIEW
// Apresentação amigável e segura em pt-BR de bloqueios de permissão ou contexto
// ==============================================================================

import React from 'react'
import { ShieldAlert, Building2, Calendar, ArrowLeft, Home } from 'lucide-react'
import { AppRouter } from '../navigation/router'

export interface BlockedStateProps {
  type: 'unauthorized' | 'need_producer' | 'need_event'
  message?: string
  onAction?: () => void
}

export const BlockedStateView: React.FC<BlockedStateProps> = ({
  type,
  message,
  onAction
}) => {
  if (type === 'unauthorized') {
    return (
      <div
        data-testid="blocked-state-unauthorized"
        className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center max-w-lg mx-auto"
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4 shadow-lg shadow-rose-500/5">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Acesso não autorizado</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          {message || 'Você não possui permissão para acessar esta funcionalidade.'}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="btn-blocked-back"
            onClick={() => {
              if (onAction) onAction()
              else AppRouter.navigate('/dashboard')
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <Home size={16} className="text-[#06B6D4]" />
            <span>Voltar ao Dashboard</span>
          </button>
        </div>
      </div>
    )
  }

  if (type === 'need_producer') {
    return (
      <div
        data-testid="blocked-state-need-producer"
        className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center max-w-lg mx-auto"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center text-[#06B6D4] mb-4 shadow-lg shadow-[#06B6D4]/5">
          <Building2 size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">
          Selecione um produtor para continuar
        </h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          {message ||
            'Esta funcionalidade opera no escopo de uma produtora específica. Escolha uma produtora no topo da página para carregar os dados.'}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="btn-blocked-dashboard"
            onClick={() => {
              if (onAction) onAction()
              else AppRouter.navigate('/dashboard')
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
          >
            <Home size={16} className="text-[#06B6D4]" />
            <span>Voltar ao Início</span>
          </button>
        </div>
      </div>
    )
  }

  // need_event
  return (
    <div
      data-testid="blocked-state-need-event"
      className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center max-w-lg mx-auto"
    >
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 shadow-lg shadow-amber-500/5">
        <Calendar size={32} />
      </div>
      <h2 className="text-xl font-bold text-slate-100 mb-2">
        Selecione um evento para continuar
      </h2>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">
        {message ||
          'Esta tela exige o contexto de um evento ativo. Selecione um evento no menu superior ou acesse através da listagem de eventos.'}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-testid="btn-blocked-to-events"
          onClick={() => {
            if (onAction) onAction()
            else AppRouter.navigate('/eventos')
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#17212F] hover:bg-[#253245] text-slate-200 border border-slate-700 transition cursor-pointer"
        >
          <ArrowLeft size={16} className="text-[#06B6D4]" />
          <span>Ver Lista de Eventos</span>
        </button>
      </div>
    </div>
  )
}
