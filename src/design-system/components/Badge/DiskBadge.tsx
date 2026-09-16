// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// DiskBadge & DiskStatus — Indicadores Semânticos Universais
// ==============================================================================

import React from 'react'
import { X } from 'lucide-react'

export type BadgeVariant =
  | 'primary'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'outline'

export type BadgeSize = 'sm' | 'md'

export interface DiskBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  onRemove?: () => void
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const DiskBadge: React.FC<DiskBadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  onRemove,
  icon,
  children,
  className = '',
  ...props
}) => {
  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  }

  const normalizedVariant = variant === 'brand' ? 'primary' : variant

  const variantStyles: Record<'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'outline', { bg: string; text: string; dot: string; border: string }> = {
    primary: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      dot: 'bg-primary',
      border: 'border-primary/20',
    },
    success: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500',
      border: 'border-emerald-500/20',
    },
    warning: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-700 dark:text-amber-400',
      dot: 'bg-amber-500',
      border: 'border-amber-500/20',
    },
    danger: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-700 dark:text-rose-400',
      dot: 'bg-rose-500',
      border: 'border-rose-500/20',
    },
    info: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-700 dark:text-blue-400',
      dot: 'bg-blue-500',
      border: 'border-blue-500/20',
    },
    neutral: {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      dot: 'bg-muted-foreground',
      border: 'border-border',
    },
    outline: {
      bg: 'bg-transparent',
      text: 'text-foreground',
      dot: 'bg-foreground',
      border: 'border-border',
    },
  }

  const styles = variantStyles[normalizedVariant]

  return (
    <span
      data-testid="disk-badge"
      className={`inline-flex items-center rounded-full font-semibold border select-none transition-colors ${
        sizeClasses[size]
      } ${styles.bg} ${styles.text} ${styles.border} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label="Remover etiqueta"
          className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
        >
          <X size={11} />
        </button>
      )}
    </span>
  )
}

// -----------------------------------------------------------------------------
// DiskStatus: Indicador explícito de status com pulso opcional
// -----------------------------------------------------------------------------

export interface DiskStatusProps {
  label?: string
  status?: string
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary'
  pulse?: boolean
  size?: 'sm' | 'md' | string
  description?: string
  tooltip?: string
  className?: string
}

export const DiskStatus: React.FC<DiskStatusProps> = ({
  label,
  status,
  variant = 'neutral',
  pulse = false,
  size = 'md',
  description,
  tooltip,
  className = '',
}) => {
  let effectiveLabel = label || ''
  let effectiveVariant = variant

  if (status && !label) {
    const s = status.toLowerCase()
    if (s.includes('ativ') || s.includes('publ') || s.includes('abert') || s === 'paid') {
      effectiveLabel = 'Ativo'
      effectiveVariant = 'success'
    } else if (s.includes('inat') || s.includes('canc') || s === 'refunded') {
      effectiveLabel = 'Inativo'
      effectiveVariant = 'danger'
    } else if (s.includes('encerr') || s.includes('final') || s === 'fulfilled') {
      effectiveLabel = 'Encerrado'
      effectiveVariant = 'neutral'
    } else if (s.includes('rascunho') || s === 'awaiting_payment') {
      effectiveLabel = 'Pendente'
      effectiveVariant = 'warning'
    } else {
      effectiveLabel = status
    }
  }

  const dotColor: Record<string, string> = {
    primary: 'bg-primary',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-blue-500',
    neutral: 'bg-muted-foreground',
  }

  return (
    <div
      data-testid="disk-status"
      title={tooltip}
      className={`inline-flex items-center gap-1.5 select-none ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {pulse && (
          <span
            className={`absolute inline-flex h-3 w-3 rounded-full opacity-75 animate-ping ${dotColor[effectiveVariant]}`}
          />
        )}
        <span className={`relative inline-flex rounded-full ${size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'} ${dotColor[effectiveVariant]}`} />
      </div>

      <div className="flex flex-col">
        <span className={`${size === 'sm' ? 'text-[11px]' : 'text-xs'} font-semibold text-foreground tracking-tight leading-none`}>
          {effectiveLabel}
        </span>
        {description && (
          <span className="text-[10px] text-muted-foreground mt-0.5">{description}</span>
        )}
      </div>
    </div>
  )
}
