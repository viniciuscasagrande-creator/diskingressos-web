// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// DiskSelect — Seletor Universal Customizado com Busca e Seleção Múltipla
// ==============================================================================

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Check, X, Search } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
  group?: string
  description?: string
}

export interface DiskSelectProps {
  options: SelectOption[]
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  placeholder?: string
  label?: string
  description?: string
  errorMessage?: string
  multiple?: boolean
  searchable?: boolean
  disabled?: boolean
  loading?: boolean
  clearable?: boolean
  required?: boolean
  className?: string
  id?: string
}

export const DiskSelect: React.FC<DiskSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção...',
  label,
  description,
  errorMessage,
  multiple = false,
  searchable = false,
  disabled = false,
  loading = false,
  clearable = true,
  required = false,
  className = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)
  const hasError = !!errorMessage

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Foco no input de busca ao abrir
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  // Filtragem de opções pelo termo de busca
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options
    const lower = searchTerm.toLowerCase()
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lower) ||
        (opt.description && opt.description.toLowerCase().includes(lower))
    )
  }, [options, searchTerm])

  // Identificação dos valores selecionados
  const selectedValues = useMemo(() => {
    if (Array.isArray(value)) return value
    if (value !== undefined && value !== null && value !== '') return [value]
    return []
  }, [value])

  const handleSelectOption = (optValue: string) => {
    if (multiple) {
      const next = selectedValues.includes(optValue)
        ? selectedValues.filter((v) => v !== optValue)
        : [...selectedValues, optValue]
      onChange?.(next)
    } else {
      onChange?.(optValue)
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(multiple ? [] : '')
    setSearchTerm('')
  }

  const handleRemoveTag = (e: React.MouseEvent, valToRemove: string) => {
    e.stopPropagation()
    onChange?.(selectedValues.filter((v) => v !== valToRemove))
  }

  // Obter labels das opções selecionadas
  const selectedOptions = useMemo(() => {
    return options.filter((opt) => selectedValues.includes(opt.value))
  }, [options, selectedValues])

  return (
    <div ref={containerRef} className={`relative w-full flex flex-col gap-1.5 select-none ${className}`}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-foreground tracking-tight flex items-center gap-1 cursor-pointer"
          >
            <span>{label}</span>
            {required && <span className="text-primary font-bold">*</span>}
          </label>
          {description && (
            <span className="text-[11px] text-muted-foreground">{description}</span>
          )}
        </div>
      )}

      {/* Botão do Gatilho */}
      <div
        id={selectId}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
          if (e.key === 'Escape') setIsOpen(false)
        }}
        data-testid="disk-select-trigger"
        className={`w-full min-h-[40px] px-3 py-1.5 rounded-btn border bg-surface text-foreground transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer ${
          hasError
            ? 'border-destructive focus:ring-2 focus:ring-destructive/20'
            : isOpen
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-border hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-muted/40' : ''}`}
      >
        {/* Conteúdo Selecionado ou Placeholder */}
        <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
          {selectedOptions.length === 0 ? (
            <span className="text-xs sm:text-sm text-muted-foreground/70 truncate">
              {placeholder}
            </span>
          ) : multiple ? (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold text-xs shrink-0"
              >
                {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                <span className="truncate max-w-[120px]">{opt.label}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveTag(e, opt.value)}
                    aria-label={`Remover ${opt.label}`}
                    className="hover:text-primary-active transition"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))
          ) : (
            <div className="flex items-center gap-2 truncate text-xs sm:text-sm font-medium">
              {selectedOptions[0]?.icon && <span>{selectedOptions[0].icon}</span>}
              <span className="truncate">{selectedOptions[0]?.label}</span>
            </div>
          )}
        </div>

        {/* Ícones da Direita */}
        <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
          {loading && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}

          {!loading && clearable && selectedValues.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Limpar seleção"
              className="p-1 rounded hover:bg-muted transition text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}

          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`}
          />
        </div>
      </div>

      {/* Mensagem de Erro */}
      {hasError && (
        <p className="text-xs text-destructive font-medium mt-0.5" role="alert">
          {errorMessage}
        </p>
      )}

      {/* Menu Suspenso (Dropdown) */}
      {isOpen && (
        <div
          role="listbox"
          data-testid="disk-select-dropdown"
          className="absolute top-full left-0 mt-1.5 w-full rounded-card border border-border bg-surface text-foreground shadow-dropdown z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100"
        >
          {searchable && (
            <div className="p-2 border-b border-border bg-muted/30">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-2.5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Pesquisar opções..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface border border-border rounded-btn pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto p-1.5 divide-y divide-border/20">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Nenhuma opção encontrada
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value)
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => !opt.disabled && handleSelectOption(opt.value)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-btn text-xs sm:text-sm font-medium transition cursor-pointer ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'hover:bg-muted/70 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="truncate">
                        <div className="truncate">{opt.label}</div>
                        {opt.description && (
                          <div className="text-[11px] text-muted-foreground truncate">
                            {opt.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && <Check size={15} className="text-primary shrink-0" />}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
