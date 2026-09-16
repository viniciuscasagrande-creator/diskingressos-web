// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// DiskChartContainer — Contêiner Padronizado para Gráficos Corporativos
// ==============================================================================

import React from 'react'
import { BarChart3, AlertCircle } from 'lucide-react'

export interface ChartLegendItem {
  label: string
  color: string
  value?: string | number
}

export interface DiskChartContainerProps {
  title: string
  description?: string
  period?: string
  actions?: React.ReactNode
  legends?: ChartLegendItem[]
  loading?: boolean
  error?: string | null
  empty?: boolean
  emptyMessage?: string
  height?: string
  className?: string
  children: React.ReactNode
}

export const DiskChartContainer: React.FC<DiskChartContainerProps> = ({
  title,
  description,
  period,
  actions,
  legends,
  loading = false,
  error = null,
  empty = false,
  emptyMessage = 'Nenhum dado disponível para o período selecionado.',
  height = 'h-72 sm:h-80',
  className = '',
  children,
}) => {
  return (
    <div
      data-testid="disk-chart-container"
      className={`w-full rounded-card border border-border bg-surface p-4 sm:p-5 shadow-xs flex flex-col justify-between select-none transition-colors ${className}`}
    >
      {/* Cabeçalho do Gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight truncate">
              {title}
            </h3>
            {period && (
              <span className="px-2 py-0.5 rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                {period}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-1">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {/* Área do Gráfico */}
      <div className={`relative w-full ${height} my-3 flex items-center justify-center overflow-hidden`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2.5 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Carregando visualização...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-2 text-rose-600 dark:text-rose-400 text-center p-4">
            <AlertCircle size={22} />
            <span className="text-xs font-semibold">{error}</span>
          </div>
        ) : empty ? (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground text-center p-4">
            <BarChart3 size={28} className="text-muted-foreground/60" />
            <span className="text-xs">{emptyMessage}</span>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Legenda Semântica Padronizada */}
      {legends && legends.length > 0 && (
        <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs">
          {legends.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="text-muted-foreground">{item.label}</span>
              {item.value !== undefined && (
                <strong className="text-foreground font-bold">{item.value}</strong>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
