import React from 'react';
import { 
  ArrowLeftRight, RotateCcw, 
  LayoutList, LayoutGrid, TableProperties, Sparkles
} from 'lucide-react';
import type { EventFilterState } from '../../types/event';
import { FilterBar } from '../ui/FilterBar';
import { Button } from '../ui/Button';

interface EventFiltersProps {
  filters: EventFilterState;
  onFilterChange: (key: keyof EventFilterState, value: any) => void;
  onResetFilters: () => void;
  selectedCompareCount: number;
  onOpenCompare: () => void;
  onOpenNewEvent: () => void;
  totalCounts: {
    todos: number;
    ativos: number;
    inativos: number;
    rascunhos: number;
  };
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  selectedCompareCount,
  onOpenCompare,
  onOpenNewEvent,
  totalCounts,
}) => {
  const statusTabOptions = [
    { id: 'todos', label: 'Todos', count: totalCounts.todos },
    { id: 'ativos', label: 'Ativos', count: totalCounts.ativos },
    { id: 'inativos', label: 'Inativos', count: totalCounts.inativos },
    { id: 'rascunhos', label: 'Rascunhos', count: totalCounts.rascunhos },
  ];

  return (
    <FilterBar
      searchQuery={filters.searchQuery}
      onSearchChange={(q) => onFilterChange('searchQuery', q)}
      searchPlaceholder="Buscar por título, local ou código (#DK)..."
      statusTabs={{
        current: filters.statusFilter,
        onChange: (s) => onFilterChange('statusFilter', s),
        options: statusTabOptions,
      }}
      selectFilters={
        <>
          {/* Categoria */}
          <select
            value={filters.categoryFilter}
            onChange={(e) => onFilterChange('categoryFilter', e.target.value)}
            className="h-[38px] rounded-input border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[12px] font-bold text-[#0E1726] outline-none transition focus:border-[#1677FF] focus:bg-white"
          >
            <option value="">Todas as Categorias</option>
            <option value="Show & Concerto">Show & Concerto</option>
            <option value="Congresso & Palestra">Congresso & Palestra</option>
            <option value="Festival">Festival</option>
            <option value="Stand-up Comedy">Stand-up Comedy</option>
            <option value="Música Eletrônica">Música Eletrônica</option>
          </select>

          {/* Cidade */}
          <select
            value={filters.cityFilter}
            onChange={(e) => onFilterChange('cityFilter', e.target.value)}
            className="h-[38px] rounded-input border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[12px] font-bold text-[#0E1726] outline-none transition focus:border-[#1677FF] focus:bg-white"
          >
            <option value="">Todas as Cidades</option>
            <option value="Curitiba">Curitiba / PR</option>
            <option value="Pinhais">Pinhais / PR</option>
            <option value="São Paulo">São Paulo / SP</option>
            <option value="Florianópolis">Florianópolis / SC</option>
          </select>

          {/* Ordenação */}
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="h-[38px] rounded-input border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[12px] font-bold text-[#0E1726] outline-none transition focus:border-[#1677FF] focus:bg-white"
          >
            <option value="dateAsc">Data (Mais Próximos)</option>
            <option value="revenueDesc">Maior Faturamento (R$)</option>
            <option value="salesDesc">Maior Volume de Vendas</option>
            <option value="occupancyDesc">Maior Taxa de Ocupação</option>
            <option value="nameAsc">Nome (A - Z)</option>
          </select>
        </>
      }
      actions={
        <>
          {/* View Mode Toggle Switch */}
          <div className="inline-flex rounded-btn border border-[#CBD5E1] bg-[#F8FAFC] p-0.5">
            <button
              type="button"
              onClick={() => onFilterChange('viewMode', 'horizontal')}
              className={`p-1.5 rounded-[6px] transition ${
                filters.viewMode === 'horizontal' ? 'bg-white text-[#1677FF] shadow-xs' : 'text-[#64748B] hover:text-[#0E1726]'
              }`}
              title="Visualização Horizontal"
            >
              <LayoutList size={16} />
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('viewMode', 'grid')}
              className={`p-1.5 rounded-[6px] transition ${
                filters.viewMode === 'grid' ? 'bg-white text-[#1677FF] shadow-xs' : 'text-[#64748B] hover:text-[#0E1726]'
              }`}
              title="Visualização em Grade"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('viewMode', 'table')}
              className={`p-1.5 rounded-[6px] transition ${
                filters.viewMode === 'table' ? 'bg-white text-[#1677FF] shadow-xs' : 'text-[#64748B] hover:text-[#0E1726]'
              }`}
              title="Visualização em Tabela"
            >
              <TableProperties size={16} />
            </button>
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={onResetFilters}
            className="flex h-9 w-9 items-center justify-center rounded-btn border border-[#CBD5E1] bg-white text-[#64748B] hover:bg-slate-50 hover:text-[#0E1726] transition"
            title="Limpar todos os filtros"
          >
            <RotateCcw size={15} />
          </button>

          {/* Compare Button */}
          {selectedCompareCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenCompare}
              icon={<ArrowLeftRight size={14} className="text-[#1677FF]" />}
              className="border-[#1677FF] text-[#1677FF] bg-blue-50"
            >
              Comparar ({selectedCompareCount})
            </Button>
          )}
        </>
      }
    />
  );
};
