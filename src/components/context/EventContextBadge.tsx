// ==============================================================================
// FASE 28.15.8.1.1 — EVENT CONTEXT BADGE
// Indicador visual de escopo do contexto ativo
// ==============================================================================

import React from 'react'
import { Layers, Ticket } from 'lucide-react'
import { useSafeSaffContext } from '../../hooks/useSafeSaffContext'

export default function EventContextBadge() {
  const { scope, selectedEvent, eventName } = useSafeSaffContext()

  if (scope === 'EVENT' && selectedEvent) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0891b2]/20 border border-[#06b6d4]/50 text-[#67e8f9]"
        data-testid="event-context-badge"
      >
        <Ticket size={13} className="text-[#06b6d4]" />
        <span>#{selectedEvent.code || selectedEvent.id}</span>
        <span className="opacity-60">•</span>
        <span className="truncate max-w-[140px]">{eventName || selectedEvent.name || selectedEvent.title}</span>
      </div>
    )
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1e293b] border border-slate-700 text-slate-300"
      data-testid="event-context-badge"
    >
      <Layers size={13} className="text-[#3b82f6]" />
      <span>Todos os Eventos</span>
    </div>
  )
}
