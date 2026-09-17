import React, { type ReactNode } from 'react'

export interface DiskBreadcrumbItem {
  label: string
  href?: string
  active?: boolean
  onClick?: () => void
}

export interface DiskPageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  badge?: ReactNode
  badges?: ReactNode[]
  actions?: ReactNode
  breadcrumbs?: DiskBreadcrumbItem[]
  className?: string
}

export const DiskPageHeader: React.FC<DiskPageHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  badge,
  badges = [],
  actions,
  breadcrumbs,
  className = ''
}) => {
  return (
    <div
      className={`disk-page-header mb-6 pb-4 border-b border-[var(--disk-border-default,#e2e8f0)] ${className}`}
      data-testid="disk-page-header"
    >
      {/* Breadcrumbs se houver */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-[var(--disk-text-muted,#64748b)] mb-2 overflow-x-auto py-0.5">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1
            return (
              <React.Fragment key={crumb.label + idx}>
                {idx > 0 && <span className="opacity-40">/</span>}
                {crumb.onClick || crumb.href ? (
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className="hover:text-[var(--disk-color-primary,#f97316)] transition-colors font-medium whitespace-nowrap cursor-pointer bg-transparent border-0 p-0 text-inherit text-xs"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className={`${isLast ? 'font-semibold text-[var(--disk-text-primary,#0f172a)]' : ''} whitespace-nowrap`}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            )
          })}
        </nav>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0 max-w-4xl">
          {/* Eyebrow & Badges */}
          {(eyebrow || badge || (badges && badges.length > 0)) && (
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {eyebrow && (
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--disk-text-muted,#64748b)]">
                  {eyebrow}
                </span>
              )}
              {badge}
              {badges.map((b, i) => (
                <React.Fragment key={i}>{b}</React.Fragment>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--disk-text-primary,#0f172a)] tracking-tight leading-tight">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs sm:text-sm text-[var(--disk-text-secondary,#475569)] mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action buttons */}
        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export default DiskPageHeader
