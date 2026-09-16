// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// DiskFilterBar — Barra Integrada de Filtros, Chips Ativos e Busca Rápida
// ==============================================================================

import React from 'react'
import { Search, Filter, X, RotateCcw } from 'lucide-react'

export interface ActiveFilterChip {
  id: string
  label: string
  value: string
  onRemove: () => void
}

export interface DiskFilterBarProps {
  // Busca Rápida
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string

  // Slots para Controles Customizados (Selects, Datas, etc.)
  children?: React.ReactNode

  // Filtros Avançados
  onToggleAdvancedFilters?: () => void
  isAdvancedOpen?: boolean
  hasAdvancedFilters?: boolean

  // Chips de Filtros Ativos
  activeFilters?: ActiveFilterChip[]
  onClearAllFilters?: () => void

  // Ações à Direita (Ex: Exportar, Atualizar)
  actions?: React.ReactNode

  className?: string
}

export const DiskFilterBar: React.FC<DiskFilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  children,
  onToggleAdvancedFilters,
  isAdvancedOpen = false,
  hasAdvancedFilters = false,
  activeFilters = [],
  onClearAllFilters,
  actions,
  className = '',
}) => {
  const activeFilterCount = activeFilters.length

  return (
    <div
      data-testid="disk-filter-bar"
      className={`w-full rounded-card border border-border bg-surface p-3 sm:p-4 shadow-xs flex flex-col gap-3 transition-colors ${className}`}
    >
      {/* Linha Principal: Busca + Selects + Filtros Avançados + Ações */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        {/* Bloco de Busca e Controles Rápidos */}
        <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
          {onSearchChange !== undefined && (
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 pl-9 pr-8 text-xs sm:text-sm bg-surface border border-border rounded-btn text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Limpar busca"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          {/* Filtros embutidos (Selects, Segmentos, etc.) */}
          {children}

          {/* Botão de Filtros Avançados */}
          {onToggleAdvancedFilters && (
            <button
              type="button"
              onClick={onToggleAdvancedFilters}
              aria-expanded={isAdvancedOpen}
              className={`h-9 px-3 rounded-btn border text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
                isAdvancedOpen || hasAdvancedFilters
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-surface border-border text-foreground hover:bg-muted'
              }`}
            >
              <Filter size={14} />
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          {/* Botão de Limpar Todos */}
          {activeFilterCount > 0 && onClearAllFilters && (
            <button
              type="button"
              onClick={onClearAllFilters}
              aria-label="Limpar todos os filtros"
              className="h-9 px-2.5 rounded-btn border border-transparent text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>

        {/* Ações à Direita */}
        {actions && <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">{actions}</div>}
      </div>

      {/* Linha de Chips de Filtros Ativos */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-border/60 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
            Filtros ativos:
          </span>
          {activeFilters.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-foreground border border-border/80 text-xs font-medium transition"
            >
              <span className="text-muted-foreground font-normal">{chip.label}:</span>
              <strong className="text-foreground">{chip.value}</strong>
              <button
                type="button"
                onClick={chip.onRemove}
                aria-label={`Remover filtro ${chip.label}: ${chip.value}`}
                className="p-0.5 rounded hover:bg-surface hover:text-primary transition text-muted-foreground cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {onClearAllFilters && (
            <button
              type="button"
              onClick={onClearAllFilters}
              className="text-xs text-primary hover:underline ml-1 font-semibold cursor-pointer"
            >
              Limpar todos ({activeFilterCount})
            </button>
          )}
        </div>
      )}
    </div>
  )
}
