import React, { type ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export type DiskKpiAccent = 
  | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral'
  | 'orange' | 'emerald' | 'sky' | 'indigo'

export interface DiskKpiCardProps {
  label?: string
  title?: string
  value: string | number
  icon?: ReactNode
  trend?: string
  trendDirection?: 'up' | 'down' | 'neutral'
  note?: string
  subtitle?: string
  accent?: DiskKpiAccent
  loading?: boolean
  className?: string
  onClick?: () => void
}

export const DiskKpiCard: React.FC<DiskKpiCardProps> = ({
  label,
  title,
  value,
  icon,
  trend,
  trendDirection = 'up',
  note,
  subtitle,
  accent = 'neutral',
  loading = false,
  className = '',
  onClick
}) => {
  const displayLabel = label || title || ''
  const displayNote = note || subtitle
  const normalizedAccent: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral' = 
    accent === 'orange' ? 'primary' :
    accent === 'emerald' ? 'success' :
    accent === 'sky' ? 'info' :
    accent === 'indigo' ? 'purple' :
    accent
  const accentConfigs = {
    primary: {
      bg: 'bg-orange-500/10 text-[var(--disk-color-primary,#f97316)]',
      border: 'border-l-4 border-l-[var(--disk-color-primary,#f97316)]'
    },
    success: {
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      border: 'border-l-4 border-l-emerald-500'
    },
    warning: {
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      border: 'border-l-4 border-l-amber-500'
    },
    danger: {
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      border: 'border-l-4 border-l-rose-500'
    },
    info: {
      bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      border: 'border-l-4 border-l-sky-500'
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      border: 'border-l-4 border-l-purple-500'
    },
    neutral: {
      bg: 'bg-[var(--disk-bg-muted,#f1f5f9)] text-[var(--disk-text-secondary,#475569)]',
      border: 'border-l-4 border-l-[var(--disk-border-strong,#cbd5e1)]'
    }
  }[normalizedAccent]

  return (
    <div
      className={`disk-kpi-card rounded-lg border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] p-4 sm:p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${accentConfigs.border} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      data-testid="disk-kpi-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--disk-text-muted,#64748b)] block truncate">
            {displayLabel}
          </span>
          <div className="text-xl sm:text-2xl lg:text-2xl font-black text-[var(--disk-text-primary,#0f172a)] mt-1 tracking-tight">
            {loading ? (
              <span className="inline-block w-20 h-6 bg-[var(--disk-bg-muted,#f1f5f9)] animate-pulse rounded" />
            ) : (
              value
            )}
          </div>
        </div>

        {icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accentConfigs.bg}`}
          >
            {icon}
          </div>
        )}
      </div>

      {(trend || displayNote) && (
        <div className="mt-2.5 pt-2 border-t border-[var(--disk-border-subtle,#f1f5f9)] flex flex-wrap items-center gap-1.5 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                trendDirection === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : trendDirection === 'down'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-[var(--disk-text-muted,#64748b)]'
              }`}
            >
              {trendDirection === 'up' && <TrendingUp className="w-3.5 h-3.5 shrink-0" />}
              {trendDirection === 'down' && <TrendingDown className="w-3.5 h-3.5 shrink-0" />}
              {trendDirection === 'neutral' && <Minus className="w-3.5 h-3.5 shrink-0" />}
              <span>{trend}</span>
            </span>
          )}
          {displayNote && (
            <span className="text-[11px] text-[var(--disk-text-muted,#64748b)] truncate">
              {displayNote}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default DiskKpiCard
