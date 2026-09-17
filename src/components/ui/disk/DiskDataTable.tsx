import React, { type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export interface DiskTableColumn<T> {
  key: string
  header: string
  align?: 'left' | 'center' | 'right'
  width?: string
  className?: string
  render?: (item: T, index: number) => ReactNode
}

export interface DiskTablePaginationProps {
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}

export interface DiskDataTableProps<T> {
  columns: DiskTableColumn<T>[]
  data: T[]
  keyExtractor: (item: T, index: number) => string | number
  loading?: boolean
  emptyMessage?: string
  emptyState?: ReactNode
  pagination?: DiskTablePaginationProps
  className?: string
  cardTitle?: ReactNode
  cardActions?: ReactNode
}

export function DiskDataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado.',
  emptyState,
  pagination,
  className = '',
  cardTitle,
  cardActions
}: DiskDataTableProps<T>) {
  // Cálculo de paginação
  const totalItems = pagination?.totalItems ?? data.length
  const pageSize = pagination?.pageSize ?? 10
  const currentPage = pagination?.currentPage ?? 1
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const startRecord = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endRecord = Math.min(currentPage * pageSize, totalItems)

  return (
    <div
      className={`disk-data-table rounded-lg border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] shadow-xs overflow-hidden ${className}`}
      data-testid="disk-data-table"
    >
      {/* Opcional Card Header */}
      {(cardTitle || cardActions) && (
        <div className="p-4 sm:px-5 border-b border-[var(--disk-border-subtle,#f1f5f9)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--disk-bg-surface,#ffffff)]">
          {cardTitle && (
            <div className="flex items-center gap-2">
              {typeof cardTitle === 'string' ? (
                <h3 className="text-sm font-bold text-[var(--disk-text-primary,#0f172a)]">
                  {cardTitle}
                </h3>
              ) : (
                cardTitle
              )}
            </div>
          )}
          {cardActions && <div className="flex items-center gap-2 shrink-0">{cardActions}</div>}
        </div>
      )}

      {/* Container de Rolagem da Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-muted,#f8fafc)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-[var(--disk-text-muted,#64748b)] whitespace-nowrap ${
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--disk-border-subtle,#f1f5f9)]">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-[var(--disk-text-muted,#64748b)]">
                  <div className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[var(--disk-color-primary,#f97316)] border-t-transparent rounded-full animate-spin" />
                    <span>Carregando dados...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  {emptyState ? (
                    emptyState
                  ) : (
                    <p className="text-xs text-[var(--disk-text-muted,#64748b)]">{emptyMessage}</p>
                  )}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={keyExtractor(item, idx)}
                  className="hover:bg-[var(--disk-bg-hover,#f8fafc)] transition-colors group"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3 px-4 text-xs text-[var(--disk-text-primary,#0f172a)] ${
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render ? col.render(item, idx) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação Limitless Oficial */}
      {pagination && totalItems > 0 && (
        <div className="p-3 sm:px-5 border-t border-[var(--disk-border-subtle,#f1f5f9)] bg-[var(--disk-bg-surface,#ffffff)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--disk-text-secondary,#475569)]">
          {/* Contagem */}
          <div className="flex items-center gap-3">
            <span>
              Mostrando <strong>{startRecord}</strong> a <strong>{endRecord}</strong> de{' '}
              <strong>{totalItems}</strong> registros
            </span>

            {pagination.onPageSizeChange && (
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-[var(--disk-text-muted,#64748b)]">Linhas por página:</span>
                <select
                  value={pageSize}
                  onChange={(e) => pagination.onPageSizeChange!(Number(e.target.value))}
                  className="py-1 px-2 rounded border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] text-xs font-medium cursor-pointer"
                >
                  {(pagination.pageSizeOptions || [10, 25, 50, 100]).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Botões de Navegação */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => pagination.onPageChange(1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded hover:bg-[var(--disk-bg-muted,#f1f5f9)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Primeira página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => pagination.onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded hover:bg-[var(--disk-bg-muted,#f1f5f9)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 py-1 font-semibold text-[var(--disk-text-primary,#0f172a)]">
              {currentPage} de {totalPages}
            </span>

            <button
              type="button"
              onClick={() => pagination.onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded hover:bg-[var(--disk-bg-muted,#f1f5f9)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Próxima página"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => pagination.onPageChange(totalPages)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded hover:bg-[var(--disk-bg-muted,#f1f5f9)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Última página"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiskDataTable
