// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// DiskKpiCard — Cartão Universal de Métricas Corporativas (KPIs)
// ==============================================================================

import React from 'react'
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'

export type KpiTrendDirection = 'positive' | 'negative' | 'neutral' | 'up' | 'down'
export type KpiTrendStatus = 'success' | 'warning' | 'danger' | 'neutral' | 'info'
export type KpiAccent = 'primary' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral'

export interface DiskKpiCardProps {
  label: string
  value: React.ReactNode
  formattedValue?: string
  icon?: React.ReactNode
  trend?: string
  trendLabel?: string
  trendDirection?: KpiTrendDirection
  trendStatus?: KpiTrendStatus
  helperText?: string
  note?: string
  comparison?: string
  accent?: KpiAccent
  loading?: boolean
  onClick?: () => void
  tooltip?: string
  className?: string
  progressPercent?: number
}

export const DiskKpiCard: React.FC<DiskKpiCardProps> = ({
  label,
  value,
  formattedValue,
  icon,
  trend,
  trendLabel,
  trendDirection = 'neutral',
  trendStatus = 'neutral',
  helperText,
  note,
  comparison,
  accent = 'primary',
  loading = false,
  onClick,
  tooltip,
  className = '',
  progressPercent,
}) => {
  const isClickable = !!onClick
  const displayHelper = helperText || note
  const normalizedDirection: 'positive' | 'negative' | 'neutral' = 
    trendDirection === 'up' ? 'positive' : trendDirection === 'down' ? 'negative' : trendDirection
  const normalizedAccent = accent === 'brand' ? 'primary' : accent

  // Cores de fundo do ícone baseadas no tema Komposo/Disk
  const accentStyles: Record<KpiAccent, { bg: string; text: string }> = {
    primary: { bg: 'bg-primary/10 text-primary', text: 'text-primary' },
    brand: { bg: 'bg-primary/10 text-primary', text: 'text-primary' },
    success: { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', text: 'text-emerald-600 dark:text-emerald-400' },
    warning: { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', text: 'text-amber-600 dark:text-amber-400' },
    danger: { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', text: 'text-rose-600 dark:text-rose-400' },
    info: { bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', text: 'text-blue-600 dark:text-blue-400' },
    purple: { bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', text: 'text-purple-600 dark:text-purple-400' },
    neutral: { bg: 'bg-muted text-muted-foreground', text: 'text-muted-foreground' },
  }

  // Estilos de tendência: desacoplados da matemática (definidos pelo consumidor)
  const trendStatusStyles: Record<KpiTrendStatus, { text: string; bg: string }> = {
    success: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    warning: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
    danger: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
    info: { text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
    neutral: { text: 'text-muted-foreground', bg: 'bg-muted' },
  }

  const renderTrendIcon = () => {
    switch (normalizedDirection) {
      case 'positive':
        return <TrendingUp size={13} className="shrink-0" aria-hidden="true" />
      case 'negative':
        return <TrendingDown size={13} className="shrink-0" aria-hidden="true" />
      default:
        return <Minus size={13} className="shrink-0" aria-hidden="true" />
    }
  }

  const displayValue = formattedValue !== undefined ? formattedValue : value

  return (
    <div
      data-testid="disk-kpi-card"
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      className={`relative overflow-hidden rounded-card border border-border bg-surface p-4 sm:p-5 shadow-xs transition-all duration-200 ${
        isClickable
          ? 'hover:border-primary/50 hover:shadow-card hover:-translate-y-[1px] cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none'
          : ''
      } ${className}`}
    >
      {/* Indicador de Carregamento */}
      {loading && (
        <div className="absolute inset-0 bg-surface/70 backdrop-blur-[1px] flex items-center justify-center z-10">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {/* Cabeçalho do Card: Rótulo + Ícone Tematizado */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
            {label}
          </span>
          {tooltip && (
            <span title={tooltip} className="cursor-help text-muted-foreground/60 hover:text-muted-foreground">
              <Info size={12} />
            </span>
          )}
        </div>

        {icon && (
          <div
            className={`shrink-0 rounded-lg p-2.5 flex items-center justify-center transition-colors ${accentStyles[normalizedAccent].bg}`}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Valor Central */}
      <div className="mt-2.5">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          {displayValue}
        </div>

        {/* Linha de Tendência e Comparação */}
        {(trend || comparison) && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {trend && (
              <span
                className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md ${trendStatusStyles[trendStatus].bg} ${trendStatusStyles[trendStatus].text}`}
              >
                {renderTrendIcon()}
                <span>{trend}</span>
                {trendLabel && <span className="font-normal opacity-80">{trendLabel}</span>}
              </span>
            )}
            {comparison && (
              <span className="text-muted-foreground/80 truncate text-[11px]">
                {comparison}
              </span>
            )}
          </div>
        )}

        {/* Texto de Ajuda / Note Opcional */}
        {displayHelper && (
          <p className="mt-1.5 text-xs text-muted-foreground leading-normal line-clamp-1">
            {displayHelper}
          </p>
        )}

        {/* Barra de Progresso Opcional */}
        {typeof progressPercent === 'number' && (
          <div className="mt-3 w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${accentStyles[normalizedAccent].bg.replace('/10', '')}`}
              style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
