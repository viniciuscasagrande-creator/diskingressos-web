import React, { type ReactNode } from 'react'
import { Search, X } from 'lucide-react'

export interface DiskFilterTab {
  key: string
  label: string
  count?: number
}

export interface DiskSelectFilter {
  id: string
  label?: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (val: string) => void
}

export interface DiskFiltersProps {
  searchValue?: string
  onSearchChange?: (val: string) => void
  searchPlaceholder?: string
  channelTabs?: DiskFilterTab[]
  activeChannelTab?: string
  onChannelTabChange?: (key: string) => void
  selectFilters?: DiskSelectFilter[]
  extraActions?: ReactNode
  className?: string
}

export const DiskFilters: React.FC<DiskFiltersProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Pesquisar...',
  channelTabs,
  activeChannelTab,
  onChannelTabChange,
  selectFilters,
  extraActions,
  className = ''
}) => {
  return (
    <div
      className={`disk-filters rounded-lg border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] p-3 sm:p-4 mb-4 shadow-xs space-y-3 ${className}`}
      data-testid="disk-filters"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Channel Tabs / Segmented Control */}
        {channelTabs && channelTabs.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <div className="flex items-center p-1 bg-[var(--disk-bg-muted,#f1f5f9)] rounded-lg border border-[var(--disk-border-subtle,#f1f5f9)] shrink-0">
              {channelTabs.map((tab) => {
                const isActive = activeChannelTab === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => onChannelTabChange?.(tab.key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[var(--disk-bg-surface,#ffffff)] text-[var(--disk-text-primary,#0f172a)] shadow-xs font-bold'
                        : 'text-[var(--disk-text-secondary,#475569)] hover:text-[var(--disk-text-primary,#0f172a)] bg-transparent'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {typeof tab.count === 'number' && (
                      <span
                        className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                          isActive
                            ? 'bg-[var(--disk-color-primary,#f97316)] text-white'
                            : 'bg-[var(--disk-border-default,#e2e8f0)] text-[var(--disk-text-secondary,#475569)]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Inputs de Busca e Selects */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 lg:justify-end">
          {/* Campo de Busca */}
          {typeof onSearchChange === 'function' && (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--disk-text-muted,#64748b)] pointer-events-none" />
              <input
                type="text"
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] text-[var(--disk-text-primary,#0f172a)] placeholder:text-[var(--disk-text-disabled,#94a3b8)] focus:outline-none focus:border-[var(--disk-color-primary,#f97316)] focus:ring-1 focus:ring-[var(--disk-color-primary,#f97316)] transition-all"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--disk-text-muted,#64748b)] hover:text-[var(--disk-text-primary,#0f172a)] p-0.5"
                  title="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Select Filters */}
          {selectFilters &&
            selectFilters.map((sel) => (
              <div key={sel.id} className="min-w-[140px]">
                <select
                  value={sel.value}
                  onChange={(e) => sel.onChange(e.target.value)}
                  className="w-full py-1.5 px-3 text-xs font-medium rounded-lg border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] text-[var(--disk-text-primary,#0f172a)] focus:outline-none focus:border-[var(--disk-color-primary,#f97316)] cursor-pointer"
                >
                  {sel.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}

          {extraActions}
        </div>
      </div>
    </div>
  )
}

export default DiskFilters
