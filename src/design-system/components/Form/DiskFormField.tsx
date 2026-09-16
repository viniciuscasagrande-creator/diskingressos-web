// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// DiskFormField — Wrapper Padronizado para Campos de Formulário
// ==============================================================================

import React from 'react'

export interface DiskFormFieldProps {
  label?: string
  required?: boolean
  description?: string
  error?: string
  htmlFor?: string
  className?: string
  children: React.ReactNode
}

export const DiskFormField: React.FC<DiskFormFieldProps> = ({
  label,
  required = false,
  description,
  error,
  htmlFor,
  className = '',
  children,
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full select-none ${className}`}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={htmlFor}
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

      {children}

      {error && (
        <p className="text-xs text-destructive font-medium mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
