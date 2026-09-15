// ==============================================================================
// FASE 28.15.8.1.1 — EVENT SEARCH
// Input de busca de eventos com filtro em tempo real
// ==============================================================================

import React, { useState, useMemo } from 'react'
import { Search, X, Ticket } from 'lucide-react'
import { useSafeSaffContext } from '../../hooks/useSafeSaffContext'
import type { ProducerEvent } from '../../types/context.types'

interface EventSearchProps {
  onSelect?: (event: ProducerEvent) => void
  placeholder?: string
}

export default function EventSearch({
  onSelect,
  placeholder = 'Buscar evento por nome ou ID...'
}: EventSearchProps) {
  const { events, selectEvent } = useSafeSaffContext()
  const [query, setQuery] = useState('')
  const [openDropdown, setOpenDropdown] = useState(false)

  const matches = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return []
    return events.filter(
      (ev) =>
        String(ev.id).includes(q) ||
        (ev.code && ev.code.toLowerCase().includes(q)) ||
        (ev.name && ev.name.toLowerCase().includes(q)) ||
        (ev.title && ev.title.toLowerCase().includes(q))
    )
  }, [events, query])

  return (
    <div className="relative w-full" data-testid="event-search-container">
      <div className="relative flex items-center">
        <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpenDropdown(true)
          }}
          onFocus={() => setOpenDropdown(true)}
          placeholder={placeholder}
          className="w-full bg-[#131d36] text-slate-200 text-xs rounded-lg pl-8 pr-8 py-2 border border-[#23355d] focus:outline-hidden focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4]"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setOpenDropdown(false)
            }}
            className="absolute right-2.5 text-slate-400 hover:text-white"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {openDropdown && query && (
        <div className="absolute left-0 mt-1 w-full rounded-lg bg-[#0d162a] border border-[#23355d] shadow-xl z-50 max-h-48 overflow-y-auto p-1">
          {matches.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-400">Nenhum evento encontrado.</div>
          ) : (
            matches.map((ev) => (
              <button
                key={ev.id}
                type="button"
                onClick={() => {
                  selectEvent(ev)
                  onSelect?.(ev)
                  setQuery('')
                  setOpenDropdown(false)
                }}
                className="w-full flex items-center gap-2 p-2 rounded text-left text-xs hover:bg-[#162342] text-slate-200"
              >
                <Ticket size={13} className="text-[#06b6d4] shrink-0" />
                <span className="font-bold text-[#06b6d4]">#{ev.code || ev.id}</span>
                <span className="truncate">{ev.name || ev.title}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
