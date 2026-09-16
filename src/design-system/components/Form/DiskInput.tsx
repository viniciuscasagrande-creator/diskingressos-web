// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// DiskInput — Campo de Entrada Universal com Suporte Semântico e Ícones
// ==============================================================================

import React, { forwardRef } from 'react'
import { X, AlertCircle } from 'lucide-react'

export interface DiskInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> {
  label?: string
  description?: string
  errorMessage?: string
  icon?: React.ReactNode
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  onClear?: () => void
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const DiskInput = forwardRef<HTMLInputElement, DiskInputProps>(
  (
    {
      label,
      description,
      errorMessage,
      icon,
      prefix,
      suffix,
      onClear,
      loading = false,
      size = 'md',
      disabled,
      required,
      className = '',
      value,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)
    const hasError = !!errorMessage

    const sizeClasses = {
      sm: 'h-8 text-xs px-2.5',
      md: 'h-10 text-sm px-3',
      lg: 'h-11 text-base px-4',
    }[size]

    return (
      <div className="w-full flex flex-col gap-1.5 select-none">
        {label && (
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor={inputId}
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

        <div className="relative flex items-center w-full">
          {/* Prefixo ou Ícone à Esquerda */}
          {(icon || prefix) && (
            <div className="absolute left-3 flex items-center justify-center text-muted-foreground pointer-events-none shrink-0" aria-hidden="true">
              {icon || prefix}
            </div>
          )}

          {/* Campo de Entrada */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled || loading}
            required={required}
            value={value}
            data-testid="disk-input"
            className={`w-full rounded-btn border bg-surface text-foreground transition-all duration-150 placeholder:text-muted-foreground/60 ${sizeClasses} ${
              icon || prefix ? 'pl-9' : ''
            } ${suffix || onClear || loading || hasError ? 'pr-9' : ''} ${
              hasError
                ? 'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20'
                : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
            } ${disabled ? 'opacity-50 cursor-not-allowed bg-muted/40' : ''} ${className}`}
            {...props}
          />

          {/* Ações e Indicadores à Direita */}
          <div className="absolute right-2.5 flex items-center gap-1.5">
            {loading && (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}

            {!loading && onClear && value && !disabled && (
              <button
                type="button"
                onClick={onClear}
                aria-label="Limpar campo"
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition cursor-pointer"
              >
                <X size={14} />
              </button>
            )}

            {!loading && hasError && (
              <span className="text-destructive" title={errorMessage}>
                <AlertCircle size={15} />
              </span>
            )}

            {suffix && !hasError && (
              <div className="text-muted-foreground text-xs">{suffix}</div>
            )}
          </div>
        </div>

        {/* Mensagem de Erro */}
        {hasError && (
          <p className="text-xs text-destructive font-medium flex items-center gap-1 mt-0.5" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

DiskInput.displayName = 'DiskInput'
