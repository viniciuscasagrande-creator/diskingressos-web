import React, { type HTMLAttributes, type ReactNode } from 'react'

export interface DiskCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  noPadding?: boolean
  interactive?: boolean
}

export const DiskCard: React.FC<DiskCardProps> = ({
  children,
  className = '',
  noPadding = false,
  interactive = false,
  ...props
}) => {
  return (
    <div
      className={`disk-card rounded-lg border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] text-[var(--disk-text-primary,#0f172a)] shadow-xs transition-all ${
        interactive ? 'hover:shadow-md hover:border-[var(--disk-border-strong,#cbd5e1)] cursor-pointer' : ''
      } ${noPadding ? 'p-0' : 'p-4 sm:p-5'} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export interface DiskCardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  subtitle?: ReactNode
  badge?: ReactNode
  actions?: ReactNode
  action?: ReactNode
  className?: string
}

export const DiskCardHeader: React.FC<DiskCardHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  action,
  children,
  className = '',
  ...props
}) => {
  const headerActions = actions || action
  return (
    <div
      className={`disk-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-[var(--disk-border-subtle,#f1f5f9)] ${className}`}
      {...props}
    >
      {title || subtitle ? (
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {typeof title === 'string' ? (
              <h3 className="text-sm sm:text-base font-bold text-[var(--disk-text-primary,#0f172a)] tracking-tight">
                {title}
              </h3>
            ) : (
              title
            )}
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-[var(--disk-text-muted,#64748b)] mt-0.5 leading-normal">
              {subtitle}
            </p>
          )}
        </div>
      ) : null}
      {headerActions && (
        <div className="flex items-center gap-2 shrink-0">
          {headerActions}
        </div>
      )}
      {children}
    </div>
  )
}

export interface DiskCardBodyProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const DiskCardBody: React.FC<DiskCardBodyProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`disk-card-body ${className}`} {...props}>
      {children}
    </div>
  )
}

export interface DiskCardFooterProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const DiskCardFooter: React.FC<DiskCardFooterProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`disk-card-footer pt-3 mt-4 border-t border-[var(--disk-border-subtle,#f1f5f9)] flex items-center justify-between gap-3 text-xs text-[var(--disk-text-muted,#64748b)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default DiskCard
