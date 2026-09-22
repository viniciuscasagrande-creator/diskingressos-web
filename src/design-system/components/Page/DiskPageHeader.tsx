// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// DiskPageHeader & DiskSectionHeader — Cabeçalhos Padronizados sem Duplicações
// ==============================================================================

import React from 'react'

export interface DiskPageHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  subtitle?: React.ReactNode
  badge?: React.ReactNode
  tag?: string
  eyebrow?: string
  primaryAction?: React.ReactNode
  secondaryActions?: React.ReactNode
  actions?: React.ReactNode
  tabs?: React.ReactNode
  metadata?: React.ReactNode
  className?: string
}

export const DiskPageHeader: React.FC<DiskPageHeaderProps> = ({
  title,
  description,
  subtitle,
  badge,
  tag,
  eyebrow,
  primaryAction,
  secondaryActions,
  actions,
  tabs,
  metadata,
  className = '',
}) => {
  const displayTag = tag || eyebrow
  const displayDesc = description || subtitle
  return (
    <div
      data-testid="disk-page-header"
      className={`w-full flex flex-col gap-4 pb-4 sm:pb-5 border-b border-border/80 mb-6 select-none transition-colors ${className}`}
    >
      {/* Linha Superior: Título + Badges + Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          {displayTag && (
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-primary mb-1 block">
              {displayTag}
            </span>
          )}

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
              {title}
            </h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>

          {displayDesc && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
              {displayDesc}
            </p>
          )}

          {metadata && (
            <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-muted-foreground">
              {metadata}
            </div>
          )}
        </div>

        {/* Grupo de Ações Primárias e Secundárias */}
        {(actions || primaryAction || secondaryActions) && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center">
            {actions}
            {secondaryActions}
            {primaryAction}
          </div>
        )}
      </div>

      {/* Abas Integradas Opcionais (Sem criar borda concorrente) */}
      {tabs && <div className="mt-1 -mb-4 overflow-x-auto">{tabs}</div>}
    </div>
  )
}

// -----------------------------------------------------------------------------
// DiskSectionHeader: Cabeçalho para Seções Internas de Página
// -----------------------------------------------------------------------------

export interface DiskSectionHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  badge?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export const DiskSectionHeader: React.FC<DiskSectionHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  className = '',
}) => {
  return (
    <div
      data-testid="disk-section-header"
      className={`w-full flex items-center justify-between gap-3 pb-2.5 border-b border-border/60 mb-4 select-none ${className}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate">
            {title}
          </h3>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed truncate">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
