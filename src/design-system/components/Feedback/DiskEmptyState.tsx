// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// DiskEmptyState & DiskSkeleton — Estados Vazios e Placeholders Pulsantes
// ==============================================================================

import React from 'react'
import { Inbox } from 'lucide-react'

export interface DiskEmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  primaryAction?: React.ReactNode
  secondaryAction?: React.ReactNode
  compact?: boolean
  className?: string
}

export const DiskEmptyState: React.FC<DiskEmptyStateProps> = ({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  compact = false,
  className = '',
}) => {
  return (
    <div
      data-testid="disk-empty-state"
      className={`flex flex-col items-center justify-center text-center rounded-card border border-dashed border-border/80 bg-surface/50 select-none ${
        compact ? 'p-6 sm:p-8' : 'p-10 sm:p-14'
      } ${className}`}
    >
      {/* Ícone ou Ilustração */}
      <div className="p-3.5 rounded-2xl bg-primary/10 text-primary mb-3.5 flex items-center justify-center shrink-0">
        {icon || <Inbox size={28} />}
      </div>

      {/* Textos */}
      <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight max-w-md">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {/* Botões de Ação */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// DiskSkeleton: Placeholders de Carregamento
// -----------------------------------------------------------------------------

export type SkeletonVariant = 'text' | 'card' | 'table' | 'chart' | 'avatar'

export interface DiskSkeletonProps {
  variant?: SkeletonVariant
  rows?: number
  columns?: number
  height?: string
  width?: string
  className?: string
}

export const DiskSkeleton: React.FC<DiskSkeletonProps> = ({
  variant = 'text',
  rows = 3,
  columns = 4,
  height,
  width,
  className = '',
}) => {
  if (variant === 'card') {
    return (
      <div
        data-testid="disk-skeleton-card"
        className={`rounded-card border border-border bg-surface p-5 space-y-3 animate-pulse ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-24 bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded-xl" />
        </div>
        <div className="h-7 w-32 bg-muted rounded mt-2" />
        <div className="h-3 w-40 bg-muted/60 rounded" />
      </div>
    )
  }

  if (variant === 'avatar') {
    return (
      <div
        data-testid="disk-skeleton-avatar"
        className={`rounded-full bg-muted animate-pulse ${width || 'w-10'} ${height || 'h-10'} ${className}`}
      />
    )
  }

  if (variant === 'chart') {
    return (
      <div
        data-testid="disk-skeleton-chart"
        className={`rounded-card border border-border bg-surface p-5 space-y-4 animate-pulse ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted/60 rounded" />
        </div>
        <div className="h-48 w-full bg-muted/40 rounded-xl flex items-end justify-between p-4 gap-2">
          {[40, 75, 50, 90, 60, 80, 45].map((h, i) => (
            <div key={i} className="bg-muted rounded-t w-full" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div
        data-testid="disk-skeleton-table"
        className={`rounded-card border border-border bg-surface overflow-hidden animate-pulse ${className}`}
      >
        <div className="h-10 bg-muted/70 border-b border-border" />
        <div className="divide-y divide-border/60">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="p-3.5 flex items-center justify-between gap-4">
              {Array.from({ length: columns }).map((_, c) => (
                <div key={c} className="h-3 bg-muted rounded flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Variante Text (padrão)
  return (
    <div
      data-testid="disk-skeleton-text"
      className={`space-y-2 animate-pulse ${className}`}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`bg-muted rounded ${height || 'h-3.5'} ${
            i === rows - 1 ? 'w-3/4' : width || 'w-full'
          }`}
        />
      ))}
    </div>
  )
}
