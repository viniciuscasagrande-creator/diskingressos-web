// ==============================================================================
// FASE 29.14.1.2 — DESIGN SYSTEM KOMPOSO / DISKINGRESSOS
// Barra de Busca Global Inteligente com Atalho Ctrl + K (GlobalSearch)
// ==============================================================================

import React, { useEffect, useRef } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'

export interface GlobalSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  value,
  onChange,
  placeholder = 'Buscar eventos, pedidos, clientes... (Ctrl + K)',
  className = ''
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div
      className={`relative flex items-center w-full max-w-md rounded-xl bg-surface border border-border/80 hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition shadow-xs ${className}`}
    >
      <Search size={15} className="absolute left-3 text-muted-foreground pointer-events-none" />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid="header-global-search-input"
        className="w-full pl-9 pr-14 py-1.5 text-xs bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
      />

      <div className="absolute right-2 flex items-center gap-1 pointer-events-none">
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground bg-muted border border-border/70 rounded shadow-2xs">
          Ctrl K
        </kbd>
      </div>
    </div>
  )
}
export default GlobalSearch
