// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// DiskToolbar — Barra de Ferramentas de Módulo Universal e Responsiva
// ==============================================================================

import React from 'react'

export interface DiskToolbarProps {
  left?: React.ReactNode
  center?: React.ReactNode
  right?: React.ReactNode
  title?: React.ReactNode
  className?: string
}

export const DiskToolbar: React.FC<DiskToolbarProps> = ({
  left,
  center,
  right,
  title,
  className = '',
}) => {
  return (
    <div
      data-testid="disk-toolbar"
      className={`w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-card bg-surface border border-border shadow-xs select-none transition-colors ${className}`}
    >
      {/* Bloco Esquerdo: Título ou Controles Primários */}
      <div className="flex flex-wrap items-center gap-2.5 min-w-0">
        {title && (
          <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight mr-1 truncate">
            {title}
          </h2>
        )}
        {left}
      </div>

      {/* Bloco Central: Filtros Rápidos, Segmented Controls ou Busca */}
      {center && (
        <div className="flex flex-1 items-center justify-start md:justify-center gap-2 min-w-0">
          {center}
        </div>
      )}

      {/* Bloco Direito: Botões de Ação, Exportação, Atualização */}
      {right && (
        <div className="flex flex-wrap items-center justify-end gap-2 shrink-0 self-end md:self-center">
          {right}
        </div>
      )}
    </div>
  )
}
