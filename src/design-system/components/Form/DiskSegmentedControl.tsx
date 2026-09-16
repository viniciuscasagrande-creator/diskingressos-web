// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// DiskSegmentedControl — Controle de Segmento Padronizado (Toggles/Modos)
// ==============================================================================

import React from 'react'

export interface SegmentOption<T extends string = string> {
  value: T
  label: React.ReactNode
  icon?: React.ReactNode
  badge?: string | number
  disabled?: boolean
}

export interface DiskSegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  className?: string
  name?: string
}

export function DiskSegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  name,
}: DiskSegmentedControlProps<T>) {
  const sizeClasses = {
    sm: 'p-0.5 text-xs gap-0.5',
    md: 'p-1 text-xs sm:text-sm gap-1',
    lg: 'p-1.5 text-sm gap-1.5',
  }[size]

  const itemSizeClasses = {
    sm: 'py-1 px-2.5 min-h-[26px]',
    md: 'py-1.5 px-3 min-h-[32px]',
    lg: 'py-2 px-4 min-h-[38px]',
  }[size]

  return (
    <div
      role="radiogroup"
      aria-label={name || 'Controle segmentado'}
      data-testid="disk-segmented-control"
      className={`inline-flex items-center rounded-btn bg-muted/60 border border-border/80 select-none ${sizeClasses} ${
        fullWidth ? 'w-full flex' : ''
      } ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled || opt.disabled}
            onClick={() => onChange(opt.value)}
            className={`relative flex items-center justify-center gap-1.5 font-semibold rounded-md transition-all duration-150 cursor-pointer ${itemSizeClasses} ${
              fullWidth ? 'flex-1 text-center' : ''
            } ${
              isSelected
                ? 'bg-surface text-primary shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface/50'
            } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {opt.icon && <span className="shrink-0" aria-hidden="true">{opt.icon}</span>}
            <span className="truncate">{opt.label}</span>
            {opt.badge !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}
              >
                {opt.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
