// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// DiskCard — Contêiner de Superfície Semântica Padronizado
// ==============================================================================

import React from 'react'

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface DiskCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
  hover?: boolean
  selected?: boolean
  loading?: boolean
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export const DiskCard: React.FC<DiskCardProps> = ({
  variant = 'default',
  padding = 'md',
  hover = false,
  selected = false,
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  const effectiveVariant: CardVariant = hover ? 'interactive' : variant
  const paddingClasses: Record<CardPadding, string> = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  }

  const variantClasses: Record<CardVariant, string> = {
    default: 'bg-surface border border-border text-foreground shadow-xs',
    elevated: 'bg-surface border border-border/80 text-foreground shadow-card hover:shadow-cardHover transition-shadow duration-200',
    outlined: 'bg-surface/50 border-2 border-border text-foreground',
    interactive:
      'bg-surface border border-border text-foreground shadow-xs hover:border-primary/60 hover:shadow-card cursor-pointer transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99]',
  }

  const selectedClasses = selected
    ? 'ring-2 ring-primary border-primary bg-primary/5'
    : ''

  const disabledClasses = disabled
    ? 'opacity-50 pointer-events-none select-none cursor-not-allowed'
    : ''

  return (
    <div
      data-testid="disk-card"
      className={`rounded-card relative overflow-hidden transition-colors duration-150 ${paddingClasses[padding]} ${variantClasses[effectiveVariant]} ${selectedClasses} ${disabledClasses} ${className}`}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 bg-surface/60 backdrop-blur-[1px] flex items-center justify-center z-10">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {children}
    </div>
  )
}

export interface DiskCardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export const DiskCardHeader: React.FC<DiskCardHeaderProps> = ({
  title,
  description,
  icon,
  actions,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`flex items-start justify-between gap-3 pb-3 border-b border-border/60 mb-4 ${className}`}
      {...props}
    >
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {title && (
            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  )
}

export interface DiskCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

export const DiskCardContent: React.FC<DiskCardContentProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`text-sm text-foreground ${className}`} {...props}>
      {children}
    </div>
  )
}

export interface DiskCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: React.ReactNode
}

export const DiskCardFooter: React.FC<DiskCardFooterProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`pt-3 border-t border-border/60 mt-4 flex items-center justify-between gap-2 text-xs text-muted-foreground ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const DiskCardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <h3 className={`text-sm sm:text-base font-bold text-foreground tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  )
}

export const DiskCardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <p className={`text-xs text-muted-foreground mt-0.5 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  )
}
