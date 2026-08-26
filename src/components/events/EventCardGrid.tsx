import React, { useState } from 'react';
import { 
  CalendarDays, MapPin, Layers3, Pencil, 
  MoreHorizontal, BarChart2, Target, Settings2,
  CheckSquare, Square, ExternalLink, Copy, Users
} from 'lucide-react';
import type { EventItem } from '../../types/event';
import { EventCoverVisual } from './EventCoverVisual';

interface EventCardGridProps {
  event: EventItem;
  isSelectedForCompare: boolean;
  onToggleCompare: (id: number) => void;
  onEventDashboard: (event: EventItem) => void;
  onEdit: (event: EventItem) => void;
  onManageLots: (event: EventItem) => void;
  onMetaPixel: (event: EventItem) => void;
  onReports: (event: EventItem) => void;
  onParticipants: (event: EventItem) => void;
  onQuickView: (event: EventItem) => void;
}

export const EventCardGrid: React.FC<EventCardGridProps> = ({
  event,
  isSelectedForCompare,
  onToggleCompare,
  onEventDashboard,
  onEdit,
  onManageLots,
  onMetaPixel,
  onReports,
  onParticipants,
  onQuickView,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isHighOccupancy = event.occupancyRate > 50;

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <article className={`group relative flex flex-col rounded-xl border bg-white shadow-xs transition-all duration-200 hover:shadow-cardHover hover:-translate-y-1 ${
      isSelectedForCompare ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/90'
    } overflow-hidden`}>
      {/* Cover Header */}
      <div 
        className="relative h-48 w-full cursor-pointer"
        onClick={() => onEventDashboard(event)}
      >
        <EventCoverVisual event={event} className="h-full w-full" />

        {/* Selection Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(event.id);
          }}
          className="absolute top-3 left-3 z-30 flex items-center justify-center rounded bg-black/60 p-1 text-white backdrop-blur-md transition hover:bg-black/80"
          title="Selecionar para comparar"
        >
          {isSelectedForCompare ? (
            <CheckSquare size={16} className="text-blue-400" />
          ) : (
            <Square size={16} className="text-slate-300" />
          )}
        </button>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Status & Producer */}
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider ${
              event.status === 'ativo' ? 'text-emerald-600' : event.status === 'rascunho' ? 'text-amber-600' : 'text-slate-500'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                event.status === 'ativo' ? 'bg-emerald-500' : event.status === 'rascunho' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              {event.status === 'ativo' ? 'Vendas Liberadas' : event.status === 'rascunho' ? 'Rascunho' : 'Encerrado'}
            </span>
            <span className="text-slate-500 truncate max-w-[130px] font-medium">{event.producerName || event.producer}</span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onEventDashboard(event)}
            className="text-base font-bold text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 transition cursor-pointer min-h-[44px]"
            title={event.title}
          >
            {event.title}
          </h3>

          {/* Venue */}
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <MapPin size={13} className="text-rose-500 shrink-0" />
            <span className="truncate">{event.venue} — {event.city || 'Curitiba'}</span>
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-slate-100">
            <div className="rounded-lg bg-slate-50/80 p-2.5 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total</span>
              <p className="text-sm font-black text-slate-900 mt-0.5">
                R$ {formatCurrency(event.totalRevenue)}
              </p>
              <div className="h-0.5 w-8 bg-emerald-500 rounded-full mt-1.5" />
            </div>

            <div className="rounded-lg bg-slate-50/80 p-2.5 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Vendas</span>
              <p className="text-sm font-black text-slate-900 mt-0.5">
                {event.salesCount.toLocaleString('pt-BR')} un.
              </p>
              <div className="h-0.5 w-8 bg-blue-600 rounded-full mt-1.5" />
            </div>

            <div className="rounded-lg bg-slate-50/80 p-2.5 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Disponível</span>
              <p className="text-sm font-black text-slate-900 mt-0.5">
                {event.availableCount.toLocaleString('pt-BR')}
              </p>
              <div className="h-0.5 w-8 bg-cyan-500 rounded-full mt-1.5" />
            </div>

            <div className="rounded-lg bg-slate-50/80 p-2.5 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cortesia</span>
              <p className="text-sm font-black text-slate-900 mt-0.5">
                {event.courtesyCount.toLocaleString('pt-BR')}
              </p>
              <div className="h-0.5 w-8 bg-slate-400 rounded-full mt-1.5" />
            </div>
          </div>

          {/* Occupancy Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Taxa de Ocupação</span>
              <span className={`font-black ${isHighOccupancy ? 'text-orange-600' : 'text-slate-700'}`}>
                {event.occupancyRate.toFixed(1)}%
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div 
                className={`h-full rounded-full ${isHighOccupancy ? 'bg-orange-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(event.occupancyRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <CalendarDays size={14} className="text-blue-600" />
            <span>{event.date.split(' ')[0]}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEventDashboard(event)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition"
              title="Painel do Evento"
            >
              <Settings2 size={15} />
            </button>
            <button
              onClick={() => onEdit(event)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition"
              title="Editar"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onManageLots(event)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-purple-600 transition"
              title="Lotes"
            >
              <Layers3 size={15} />
            </button>
            <button
              onClick={() => onParticipants(event)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition"
              title="Participantes"
            >
              <Users size={14} />
            </button>

            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <MoreHorizontal size={15} />
              </button>

              {dropdownOpen && (
                <div 
                  className="absolute right-0 bottom-full mb-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-dropdown z-40 animate-in fade-in duration-150"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      onMetaPixel(event);
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <Target size={13} />
                    Pixel Meta
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(`https://diskingressos.com.br/evento/${event.code}`);
                      alert('Link copiado!');
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <ExternalLink size={13} />
                    Copiar Link
                  </button>
                  <button
                    onClick={() => {
                      alert('Evento duplicado!');
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <Copy size={13} />
                    Duplicar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
