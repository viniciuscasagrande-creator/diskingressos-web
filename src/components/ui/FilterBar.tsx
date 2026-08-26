import React from 'react';
import { Search, X } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  selectFilters?: React.ReactNode;
  statusTabs?: {
    current: string;
    onChange: (status: string) => void;
    options: { id: string; label: string; count?: number }[];
  };
  actions?: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  selectFilters,
  statusTabs,
  actions,
  className = '',
}) => {
  return (
    <div className={`rounded-card border border-[#E2E8F0] bg-white p-3.5 shadow-card space-y-3 mb-6 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search input and select dropdowns */}
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Global search */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-[38px] w-full rounded-input border border-[#CBD5E1] bg-[#F8FAFC] pl-10 pr-8 text-[13px] text-[#0E1726] placeholder:text-slate-400 outline-none transition focus:border-[#1677FF] focus:bg-white focus:shadow-inputFocus"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {selectFilters}
        </div>

        {/* Status Tabs and Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {statusTabs && (
            <div className="inline-flex rounded-btn border border-[#CBD5E1] bg-[#F8FAFC] p-0.5">
              {statusTabs.options.map((tab) => {
                const isActive = statusTabs.current === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => statusTabs.onChange(tab.id)}
                    className={`rounded-[6px] px-3 py-1 text-[12px] font-bold transition select-none ${
                      isActive
                        ? 'bg-white text-[#1677FF] shadow-xs'
                        : 'text-[#64748B] hover:text-[#0E1726]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {typeof tab.count === 'number' && (
                      <span className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                        isActive ? 'bg-[#1677FF]/10 text-[#1677FF]' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {actions}
        </div>
      </div>
    </div>
  );
};
