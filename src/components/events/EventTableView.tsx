import React from 'react';
import { 
  CalendarDays, MapPin, Layers3, Pencil, 
  BarChart2, Target, ScanFace, 
  CheckSquare, Square, Settings2, Users
} from 'lucide-react';
import type { EventItem } from '../../types/event';

interface EventTableViewProps {
  events: EventItem[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onSelectAll: (select: boolean) => void;
  onEventDashboard: (event: EventItem) => void;
  onEdit: (event: EventItem) => void;
  onManageLots: (event: EventItem) => void;
  onMetaPixel: (event: EventItem) => void;
  onReports: (event: EventItem) => void;
  onParticipants: (event: EventItem) => void;
  onQuickView: (event: EventItem) => void;
}

export const EventTableView: React.FC<EventTableViewProps> = ({
  events,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onEventDashboard,
  onEdit,
  onManageLots,
  onMetaPixel,
  onReports,
  onParticipants,
  onQuickView,
}) => {
  const allSelected = events.length > 0 && selectedIds.length === events.length;

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <th className="py-3.5 pl-4 pr-2 w-10 text-center">
              <button
                type="button"
                onClick={() => onSelectAll(!allSelected)}
                className="flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                {allSelected ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
              </button>
            </th>
            <th className="py-3.5 px-3">Código</th>
            <th className="py-3.5 px-4 min-w-[260px]">Evento / Produtora</th>
            <th className="py-3.5 px-3 min-w-[170px]">Data & Local</th>
            <th className="py-3.5 px-3 text-right">Total (R$)</th>
            <th className="py-3.5 px-3 text-center">Vendas</th>
            <th className="py-3.5 px-3 text-center">Disponível</th>
            <th className="py-3.5 px-3 text-center">Cortesia</th>
            <th className="py-3.5 px-3 text-center min-w-[120px]">Ocupação</th>
            <th className="py-3.5 px-3 text-center">Status</th>
            <th className="py-3.5 pr-4 pl-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {events.map((event) => {
            const isSelected = selectedIds.includes(event.id);
            const isHigh = event.occupancyRate > 50;

            return (
              <tr 
                key={event.id}
                className={`transition hover:bg-slate-50/80 ${isSelected ? 'bg-blue-50/40' : ''}`}
              >
                {/* Select Checkbox */}
                <td className="py-3 pl-4 pr-2 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleSelect(event.id)}
                    className="flex items-center justify-center text-slate-400 hover:text-slate-700"
                  >
                    {isSelected ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
                  </button>
                </td>

                {/* Code */}
                <td className="py-3 px-3 font-mono font-bold text-slate-900">
                  <span className="rounded bg-slate-100 px-2 py-1 text-[11px]">
                    #{event.code}
                  </span>
                </td>

                {/* Title and producer */}
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <button
                      onClick={() => onEventDashboard(event)}
                      className="text-left font-bold text-slate-900 hover:text-blue-600 transition truncate max-w-sm"
                      title={event.title}
                    >
                      {event.title}
                    </button>
                    <span className="text-[11px] text-slate-500">{event.producerName || event.producer} • {event.category}</span>
                  </div>
                </td>

                {/* Date and venue */}
                <td className="py-3 px-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <CalendarDays size={12} className="text-blue-500" />
                      {event.date}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <MapPin size={11} className="text-rose-500" />
                      {event.venue}
                    </span>
                  </div>
                </td>

                {/* Revenue */}
                <td className="py-3 px-3 text-right font-black text-slate-900 text-sm">
                  {formatCurrency(event.totalRevenue)}
                </td>

                {/* Sales */}
                <td className="py-3 px-3 text-center font-bold text-blue-600">
                  {event.salesCount.toLocaleString('pt-BR')}
                </td>

                {/* Available */}
                <td className="py-3 px-3 text-center font-semibold text-slate-700">
                  {event.availableCount.toLocaleString('pt-BR')}
                </td>

                {/* Courtesy */}
                <td className="py-3 px-3 text-center text-slate-500">
                  {event.courtesyCount.toLocaleString('pt-BR')}
                </td>

                {/* Occupancy */}
                <td className="py-3 px-3">
                  <div className="flex flex-col items-center">
                    <span className={`text-[11px] font-bold ${isHigh ? 'text-orange-600' : 'text-slate-800'}`}>
                      {event.occupancyRate.toFixed(1)}%
                    </span>
                    <div className="w-20 h-1.5 rounded-full bg-slate-100 mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isHigh ? 'bg-orange-500' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(event.occupancyRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3 px-3 text-center">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    event.status === 'ativo' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : event.status === 'rascunho'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      event.status === 'ativo' ? 'bg-emerald-500' : event.status === 'rascunho' ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
                    {event.status === 'ativo' ? 'Ativo' : event.status === 'rascunho' ? 'Rascunho' : 'Encerrado'}
                  </span>
                </td>

                {/* Actions Toolbar */}
                <td className="py-3 pr-4 pl-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEventDashboard(event)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                      title="Painel do Evento (Dashboard)"
                    >
                      <Settings2 size={15} />
                    </button>
                    <button
                      onClick={() => onEdit(event)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                      title="Editar Evento"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onManageLots(event)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-purple-600 transition"
                      title="Gerenciar Lotes"
                    >
                      <Layers3 size={15} />
                    </button>
                    <button
                      onClick={() => onParticipants(event)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition"
                      title="Participantes"
                    >
                      <Users size={14} />
                    </button>
                    <button
                      onClick={() => onMetaPixel(event)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-purple-600 transition"
                      title="Pixel Meta"
                    >
                      <Target size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
