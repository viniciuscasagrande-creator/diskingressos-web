import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, Calendar, Ticket, Check, Layers, X, Clock } from 'lucide-react'
import type { SafeSaffScope } from '../context/app-context'

export interface GlobalEventSelectorItem {
  id: number
  code?: string
  title: string
  venue?: string
  city?: string
  date?: string
  status?: string
  producerId?: number
}

interface Props {
  scope: SafeSaffScope
  producerName?: string | null
  events: GlobalEventSelectorItem[]
  selectedEventId: number | null
  onSelectEvent: (event: GlobalEventSelectorItem | null) => void
  disabled?: boolean
}

export default function GlobalEventSelector({
  scope,
  producerName,
  events,
  selectedEventId,
  onSelectEvent,
  disabled = false
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'encerrado'>('all')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Fecha com tecla ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null
    return events.find((e) => e.id === selectedEventId) || null
  }, [events, selectedEventId])

  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return events.filter((ev) => {
      // Filtro de status
      if (statusFilter === 'ativo' && ev.status && ev.status !== 'ativo') return false
      if (statusFilter === 'encerrado' && ev.status !== 'encerrado' && ev.status !== 'inativo') return false

      // Busca por ID ou título
      if (!q) return true
      const idStr = String(ev.id)
      const codeStr = (ev.code || '').toLowerCase()
      const titleStr = (ev.title || '').toLowerCase()
      const venueStr = (ev.venue || '').toLowerCase()
      return idStr.includes(q) || codeStr.includes(q) || titleStr.includes(q) || venueStr.includes(q)
    })
  }, [events, searchQuery, statusFilter])

  const isConsolidated = scope === 'PRODUCER' || !selectedEvent

  return (
    <div className="relative inline-block text-left select-none" ref={containerRef} data-testid="global-event-selector">
      {/* Botão seletor principal */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-xs ${
          isConsolidated
            ? 'bg-[#131d38] border-[#253761] text-[#93c5fd] hover:bg-[#182547] hover:border-[#3b82f6]'
            : 'bg-[#0f2438] border-[#0891b2]/60 text-[#67e8f9] hover:bg-[#13334e] hover:border-[#06b6d4]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={
          isConsolidated
            ? 'Escopo: Visão Consolidada do Produtor (Todos os Eventos)'
            : `Escopo: Evento Individual ${selectedEvent?.code ? '#' + selectedEvent.code : ''}`
        }
      >
        {isConsolidated ? (
          <Layers size={14} className="text-[#3b82f6] shrink-0" />
        ) : (
          <Ticket size={14} className="text-[#06b6d4] shrink-0" />
        )}

        <div className="flex flex-col items-start leading-tight max-w-[190px] sm:max-w-[240px] truncate">
          <span className="text-[10px] uppercase tracking-wider font-bold opacity-75">
            {isConsolidated ? 'Todos os Eventos' : `Evento ${selectedEvent?.code ? '#' + selectedEvent.code : ''}`}
          </span>
          <span className="truncate text-white font-medium text-xs">
            {isConsolidated ? (producerName || 'Visão Consolidada') : selectedEvent?.title}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 text-slate-400 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Painel suspenso do seletor */}
      {isOpen && (
        <div
          className="absolute left-0 mt-1.5 w-80 sm:w-96 rounded-xl bg-[#0d162a] border border-[#23355d] shadow-2xl z-50 overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
          style={{ boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)' }}
        >
          {/* Header do painel */}
          <div className="p-3 border-b border-[#1f2e52] bg-[#0b1222]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Contexto Global de Operação
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#1e293b] text-slate-300 border border-slate-700">
                {events.length} {events.length === 1 ? 'evento' : 'eventos'}
              </span>
            </div>

            {/* Opção rápida: Visão Consolidada */}
            <button
              type="button"
              onClick={() => {
                onSelectEvent(null)
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                isConsolidated
                  ? 'bg-[#1d4ed8]/20 border-[#3b82f6] text-white shadow-xs'
                  : 'bg-[#141e36] border-[#223358] text-slate-300 hover:bg-[#1a2745] hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-1.5 rounded-md ${
                    isConsolidated ? 'bg-[#2563eb] text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Layers size={14} />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">
                    Todos os Eventos (Produtor)
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Visão financeira e operacional consolidada
                  </div>
                </div>
              </div>
              {isConsolidated && <Check size={16} className="text-[#3b82f6] shrink-0" />}
            </button>
          </div>

          {/* Campo de busca */}
          <div className="p-2 border-b border-[#1f2e52] bg-[#0c1426]">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ID, código ou nome..."
                className="w-full bg-[#131d36] text-slate-200 text-xs rounded-lg pl-8 pr-8 py-2 border border-[#23355d] focus:outline-hidden focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Filtros rápidos: Todos / Ativos / Encerrados */}
            <div className="flex items-center gap-1 mt-2">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-[#2563eb] text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a2846]'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ativo')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  statusFilter === 'ativo'
                    ? 'bg-[#059669] text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a2846]'
                }`}
              >
                Ativos
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('encerrado')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  statusFilter === 'encerrado'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a2846]'
                }`}
              >
                Encerrados
              </button>
            </div>
          </div>

          {/* Lista de eventos scrollável */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {filteredEvents.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Nenhum evento encontrado com os filtros atuais.
              </div>
            ) : (
              filteredEvents.map((ev) => {
                const isSelected = selectedEventId === ev.id
                const isAtivo = ev.status === 'ativo' || !ev.status
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => {
                      onSelectEvent(ev)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'bg-[#0891b2]/20 border border-[#06b6d4] text-white'
                        : 'hover:bg-[#162342] text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0 pr-2">
                      <div className="mt-0.5 shrink-0">
                        <Ticket
                          size={13}
                          className={isSelected ? 'text-[#06b6d4]' : 'text-slate-500'}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#06b6d4] bg-[#0891b2]/15 px-1.5 py-0.2 rounded border border-[#0891b2]/30">
                            #{ev.code || ev.id}
                          </span>
                          <span className="text-xs font-semibold text-white truncate">
                            {ev.title}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          {ev.venue && <span className="truncate">{ev.venue}</span>}
                          {ev.date && (
                            <span className="shrink-0 flex items-center gap-0.5">
                              <Calendar size={10} /> {ev.date}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          isAtivo
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isAtivo ? 'Ativo' : 'Encerrado'}
                      </span>
                      {isSelected && <Check size={14} className="text-[#06b6d4]" />}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
