// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// DiskDataTable — Tabela Enterprise Universal com Tipagem Genérica
// ==============================================================================

import React, { useState, useMemo } from 'react'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Inbox
} from 'lucide-react'

export type TableDensity = 'comfortable' | 'compact'
export type ResponsiveStrategy = 'table' | 'cards' | 'scroll'

export interface ColumnDef<T> {
  key: string
  header: React.ReactNode
  accessor?: (row: T) => React.ReactNode
  render?: (row: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  width?: string
  priority?: 'high' | 'medium' | 'low' // Para colunas ocultáveis em telas pequenas
  className?: string
}

export interface DiskDataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  keyExtractor?: (row: T, index: number) => string | number
  loading?: boolean
  error?: string | null
  emptyTitle?: string
  emptyMessage?: string
  density?: TableDensity
  responsiveStrategy?: ResponsiveStrategy
  stickyHeader?: boolean
  striped?: boolean

  // Ordenação
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (columnKey: string, direction: 'asc' | 'desc') => void

  // Paginação
  page?: number
  pageSize?: number
  totalItems?: number
  onPageChange?: (newPage: number) => void
  onPageSizeChange?: (newSize: number) => void
  pageSizeOptions?: number[]

  // Seleção e Ações em Lote
  selectable?: boolean
  selectedKeys?: string[]
  onSelectKeys?: (keys: string[]) => void
  bulkActions?: React.ReactNode

  // Renderização customizada de Card Mobile
  renderMobileCard?: (row: T, index: number) => React.ReactNode

  className?: string
}

export function DiskDataTable<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  error = null,
  emptyTitle = 'Nenhum registro encontrado',
  emptyMessage = 'Tente ajustar seus filtros ou critérios de busca.',
  density = 'comfortable',
  responsiveStrategy = 'table',
  stickyHeader = false,
  striped = false,

  sortColumn,
  sortDirection,
  onSort,

  page = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],

  selectable = false,
  selectedKeys = [],
  onSelectKeys,
  bulkActions,

  renderMobileCard,
  className = '',
}: DiskDataTableProps<T>) {
  // Controle interno de ordenação quando não controlado por props
  const [internalSortCol, setInternalSortCol] = useState<string | undefined>(sortColumn)
  const [internalSortDir, setInternalSortDir] = useState<'asc' | 'desc'>('asc')

  const activeSortCol = sortColumn !== undefined ? sortColumn : internalSortCol
  const activeSortDir = sortDirection !== undefined ? sortDirection : internalSortDir

  const handleSortClick = (colKey: string) => {
    let nextDir: 'asc' | 'desc' = 'asc'
    if (activeSortCol === colKey) {
      nextDir = activeSortDir === 'asc' ? 'desc' : 'asc'
    }
    if (onSort) {
      onSort(colKey, nextDir)
    } else {
      setInternalSortCol(colKey)
      setInternalSortDir(nextDir)
    }
  }

  // Extração de chaves das linhas
  const getRowKey = (row: T, index: number): string => {
    if (keyExtractor) return String(keyExtractor(row, index))
    if (typeof row === 'object' && row !== null && 'id' in row) {
      return String((row as { id: unknown }).id)
    }
    return String(index)
  }

  // Seleção de todas as linhas
  const allCurrentKeys = useMemo(() => {
    return data.map((row, idx) => getRowKey(row, idx))
  }, [data])

  const isAllSelected = allCurrentKeys.length > 0 && allCurrentKeys.every((k) => selectedKeys.includes(k))
  const isPartiallySelected = selectedKeys.length > 0 && !isAllSelected

  const handleToggleAll = () => {
    if (!onSelectKeys) return
    if (isAllSelected) {
      onSelectKeys(selectedKeys.filter((k) => !allCurrentKeys.includes(k)))
    } else {
      const merged = Array.from(new Set([...selectedKeys, ...allCurrentKeys]))
      onSelectKeys(merged)
    }
  }

  const handleToggleRow = (rowKey: string) => {
    if (!onSelectKeys) return
    if (selectedKeys.includes(rowKey)) {
      onSelectKeys(selectedKeys.filter((k) => k !== rowKey))
    } else {
      onSelectKeys([...selectedKeys, rowKey])
    }
  }

  // Estilos de densidade
  const cellPadding = density === 'compact' ? 'py-2 px-3 text-xs' : 'py-3.5 px-4 text-sm'
  const headerPadding = density === 'compact' ? 'py-2.5 px-3 text-[11px]' : 'py-3 px-4 text-xs'

  // Paginação computada
  const total = totalItems !== undefined ? totalItems : data.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(total, page * pageSize)

  return (
    <div
      data-testid="disk-data-table-container"
      className={`w-full rounded-card border border-border bg-surface shadow-xs overflow-hidden flex flex-col ${className}`}
    >
      {/* Barra de Ações em Lote (Bulk Actions) quando há linhas selecionadas */}
      {selectable && selectedKeys.length > 0 && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-semibold text-primary transition-colors">
          <div className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-[11px] font-bold">
              {selectedKeys.length}
            </span>
            <span>selecionados</span>
          </div>
          {bulkActions && <div className="flex items-center gap-2">{bulkActions}</div>}
        </div>
      )}

      {/* Visualização de Tabela ou Cards Responsivos */}
      <div className="w-full overflow-x-auto min-w-0">
        <table className="w-full text-left border-collapse min-w-full table-auto">
          {/* Cabeçalho */}
          <thead className={`bg-muted/60 border-b border-border text-muted-foreground select-none ${stickyHeader ? 'sticky top-0 z-20 backdrop-blur-md' : ''}`}>
            <tr>
              {selectable && (
                <th className={`w-10 text-center ${headerPadding}`}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected
                    }}
                    onChange={handleToggleAll}
                    aria-label="Selecionar todas as linhas"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                </th>
              )}

              {columns.map((col) => {
                const isSorted = activeSortCol === col.key
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left'

                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    onClick={col.sortable ? () => handleSortClick(col.key) : undefined}
                    className={`font-bold tracking-wider uppercase ${alignClass} ${headerPadding} ${
                      col.sortable ? 'cursor-pointer hover:text-foreground transition' : ''
                    } ${col.priority === 'low' ? 'hidden lg:table-cell' : col.priority === 'medium' ? 'hidden sm:table-cell' : ''} ${col.className || ''}`}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'flex-row-reverse' : ''}`}>
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-muted-foreground/60 shrink-0">
                          {isSorted ? (
                            activeSortDir === 'asc' ? (
                              <ChevronUp size={13} className="text-primary" />
                            ) : (
                              <ChevronDown size={13} className="text-primary" />
                            )
                          ) : (
                            <ChevronsUpDown size={13} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>

          {/* Corpo da Tabela */}
          <tbody className="divide-y divide-border/70 text-foreground">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium">Carregando registros...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-12 text-center text-rose-600 dark:text-rose-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle size={24} />
                    <span className="text-sm font-semibold">{error}</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 rounded-full bg-muted/60 text-muted-foreground">
                      <Inbox size={26} />
                    </div>
                    <strong className="text-sm font-bold text-foreground">{emptyTitle}</strong>
                    <p className="text-xs text-muted-foreground max-w-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const rowKey = getRowKey(row, index)
                const isSelected = selectedKeys.includes(rowKey)
                const isEven = index % 2 === 0

                return (
                  <tr
                    key={rowKey}
                    data-testid={`disk-table-row-${rowKey}`}
                    className={`transition-colors duration-150 ${
                      isSelected
                        ? 'bg-primary/5 hover:bg-primary/10'
                        : striped && isEven
                        ? 'bg-muted/20 hover:bg-surface-elevated'
                        : 'hover:bg-surface-elevated'
                    }`}
                  >
                    {selectable && (
                      <td className={`w-10 text-center ${cellPadding}`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(rowKey)}
                          aria-label={`Selecionar linha ${index + 1}`}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                        />
                      </td>
                    )}

                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'

                      const cellContent = col.render
                        ? col.render(row, index)
                        : col.accessor
                        ? col.accessor(row)
                        : typeof row === 'object' && row !== null && col.key in row
                        ? (row as Record<string, unknown>)[col.key] as React.ReactNode
                        : null

                      return (
                        <td
                          key={col.key}
                          className={`${cellPadding} ${alignClass} ${
                            col.priority === 'low'
                              ? 'hidden lg:table-cell'
                              : col.priority === 'medium'
                              ? 'hidden sm:table-cell'
                              : ''
                          } ${col.className || ''}`}
                        >
                          {cellContent}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação Inferior */}
      {onPageChange && total > 0 && (
        <div className="border-t border-border px-4 py-3 bg-surface flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground select-none">
          <div className="flex items-center gap-2">
            <span>
              Exibindo <strong className="text-foreground">{startItem}</strong> a{' '}
              <strong className="text-foreground">{endItem}</strong> de{' '}
              <strong className="text-foreground">{total}</strong> registros
            </span>

            {onPageSizeChange && pageSizeOptions.length > 0 && (
              <div className="flex items-center gap-1.5 ml-2 border-l border-border pl-3">
                <span>Por página:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="bg-surface border border-border rounded-md px-1.5 py-0.5 text-xs text-foreground focus:ring-1 focus:ring-primary"
                >
                  {pageSizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label="Página anterior"
              className="p-1.5 rounded-lg border border-border bg-surface text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>

            <span className="px-2 text-xs font-semibold text-foreground">
              Página {page} de {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              aria-label="Próxima página"
              className="p-1.5 rounded-lg border border-border bg-surface text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
