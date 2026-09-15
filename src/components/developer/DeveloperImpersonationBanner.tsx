import React from 'react'
import { ShieldAlert, AlertTriangle, XCircle, Clock, UserCheck } from 'lucide-react'

interface DeveloperImpersonationBannerProps {
  actorUserName?: string
  impersonatedEntityName?: string
  startedAt?: string
  onClose?: () => void
}

export const DeveloperImpersonationBanner: React.FC<DeveloperImpersonationBannerProps> = ({
  actorUserName = 'Carlos Henrique (Developer Lead)',
  impersonatedEntityName = 'Opus Entretenimento Curitiba (PRD-441)',
  startedAt = '15/09/2026 16:30',
  onClose
}) => {
  return (
    <aside
      aria-label="Aviso de Modo de Suporte Técnico e Investigação Developer"
      data-testid="developer-impersonation-banner"
      className="bg-amber-500 text-slate-950 px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs font-semibold z-50 border-b-2 border-amber-600 animate-fadeIn"
    >
      <div className="flex items-center gap-2.5">
        <span className="p-1 bg-amber-950 text-amber-300 rounded-md">
          <ShieldAlert className="w-4 h-4" />
        </span>
        <div>
          <span className="font-black uppercase tracking-wider text-[11px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded mr-2">
            Modo Suporte Técnico / Investigação Developer
          </span>
          <span>
            Visualizando sob a perspectiva de:{' '}
            <strong className="underline decoration-amber-950/40">{impersonatedEntityName}</strong>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-1.5 text-amber-950/80 text-[11px]">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Ator Real: {actorUserName}</span>
          <span className="mx-1">•</span>
          <Clock className="w-3.5 h-3.5" />
          <span>Início: {startedAt}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-block text-[11px] bg-amber-600/30 text-amber-950 px-2 py-0.5 rounded border border-amber-600/50">
            Ações auditadas no Disk Core
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-amber-950 hover:bg-slate-900 text-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Encerrar Suporte</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
