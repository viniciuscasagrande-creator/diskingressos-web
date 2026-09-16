// ==============================================================================
// FASE 29.14.1.2 — DESIGN SYSTEM KOMPOSO / DISKINGRESSOS
// Indicador Visual de Contexto Ativo (ContextIndicator)
// Mostra com clareza: Produtora Ativa / Evento Selecionado
// ==============================================================================

import React from 'react'
import { Building2, Calendar, ChevronRight } from 'lucide-react'

export interface ContextIndicatorProps {
  producerName?: string | null
  eventName?: string | null
  className?: string
}

export const ContextIndicator: React.FC<ContextIndicatorProps> = ({
  producerName,
  eventName,
  className = ''
}) => {
  const prod = producerName || 'Visão Global'
  const isAllEvents = !eventName

  return (
    <div
      className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/40 text-foreground border border-border/60 select-none ${className}`}
      data-testid="header-context-indicator"
      title={`Contexto Operacional Ativo: ${prod} › ${eventName || 'Todos os Eventos'}`}
    >
      <div className="flex items-center gap-1 text-muted-foreground">
        <Building2 size={12} className="text-primary" />
        <span className="truncate max-w-[120px] font-semibold text-foreground">{prod}</span>
      </div>

      <ChevronRight size={11} className="text-muted-foreground shrink-0" />

      <div className="flex items-center gap-1">
        <Calendar size={12} className={isAllEvents ? 'text-muted-foreground' : 'text-primary'} />
        <span
          className={`truncate max-w-[140px] font-semibold ${
            isAllEvents ? 'text-muted-foreground' : 'text-primary'
          }`}
        >
          {eventName || 'Todos os Eventos'}
        </span>
      </div>
    </div>
  )
}
export default ContextIndicator
