// ==============================================================================
// FASE 29.14.1.2 — DESIGN SYSTEM KOMPOSO / DISKINGRESSOS
// Seletor Contextual de Produtora (ProducerSelector)
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react'
import { Building2, ChevronDown, Check, Search } from 'lucide-react'
import type { Producer } from '../../auth/model'

export interface ProducerSelectorProps {
  producers: Producer[]
  selectedProducerId: number | 'all'
  onSelectProducer: (producerId: number | 'all') => void
  isAdmin: boolean
  fixedProducerName?: string | null
  className?: string
}

export const ProducerSelector: React.FC<ProducerSelectorProps> = ({
  producers,
  selectedProducerId,
  onSelectProducer,
  isAdmin,
  fixedProducerName,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Se não for admin, exibe badge fixo não interativo
  if (!isAdmin) {
    const displayName = fixedProducerName || 'Minha Produtora'
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-muted/60 text-foreground border border-border/50 select-none ${className}`}
        data-testid="header-producer-fixed"
        title={`Produtora Ativa: ${displayName}`}
      >
        <Building2 size={13} className="text-primary shrink-0" />
        <span className="truncate max-w-[150px]">{displayName}</span>
      </div>
    )
  }

  const activeProducer =
    selectedProducerId === 'all'
      ? null
      : producers.find((p) => p.id === selectedProducerId)

  const label = activeProducer ? activeProducer.name : 'Todas as Produtoras'

  const filtered = producers.filter((p) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Elemento select para compatibilidade com Playwright selectOption */}
      <select
        className="sr-only"
        data-testid="header-producer-select"
        value={selectedProducerId}
        onChange={(e) =>
          onSelectProducer(e.target.value === 'all' ? 'all' : Number(e.target.value))
        }
        tabIndex={-1}
        aria-hidden="true"
      >
        <option value="all">Todas as Produtoras</option>
        {producers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="header-producer-select-trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface text-foreground border border-border/80 hover:border-primary/50 hover:bg-surface-elevated transition shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
      >
        <Building2 size={14} className="text-primary shrink-0" />
        <span className="truncate max-w-[160px] font-semibold">{label}</span>
        <ChevronDown
          size={13}
          className={`text-muted-foreground transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 mt-1.5 w-64 rounded-xl bg-surface-elevated text-foreground border border-border shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100"
          role="listbox"
        >
          <div className="px-2.5 py-1 pb-2 border-b border-border/50">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar produtora..."
                className="w-full pl-8 pr-2 py-1.5 text-xs rounded-md bg-muted/40 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => {
                onSelectProducer('all')
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-primary/10 transition cursor-pointer ${
                selectedProducerId === 'all' ? 'text-primary font-bold bg-primary/5' : 'text-foreground'
              }`}
            >
              <span>Todas as Produtoras (Visão Global)</span>
              {selectedProducerId === 'all' && <Check size={13} className="text-primary" />}
            </button>

            {filtered.map((prod) => {
              const isSelected = selectedProducerId === prod.id
              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => {
                    onSelectProducer(prod.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-primary/10 transition cursor-pointer ${
                    isSelected ? 'text-primary font-bold bg-primary/5' : 'text-foreground'
                  }`}
                >
                  <span className="truncate">{prod.name}</span>
                  {isSelected && <Check size={13} className="text-primary" />}
                </button>
              )
            })}

            {filtered.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                Nenhuma produtora encontrada
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
export default ProducerSelector
