import React, { useState } from 'react';
import { 
  CalendarDays, MapPin, Settings2, Pencil, Layers3, 
  MoreHorizontal, BarChart2, Users, Target, ScanFace, 
  Copy, ExternalLink, PauseCircle, CheckSquare, Square
} from 'lucide-react';
import type { EventItem } from '../../types/event';
import { EventCoverVisual } from './EventCoverVisual';
import { Badge } from '../ui/Badge';

interface EventCardHorizontalProps {
  event: EventItem;
  isSelectedForCompare: boolean;
  onToggleCompare: (id: number) => void;
  onEventDashboard: (event: EventItem) => void;
  onEdit: (event: EventItem) => void;
  onManageLots: (event: EventItem) => void;
  onMetaPixel: (event: EventItem) => void;
  onReports: (event: EventItem) => void;
  onParticipants: (event: EventItem) => void;
  onCheckin: (event: EventItem) => void;
  onQuickView: (event: EventItem) => void;
}

export const EventCardHorizontal: React.FC<EventCardHorizontalProps> = ({
  event,
  isSelectedForCompare,
  onToggleCompare,
  onEventDashboard,
  onEdit,
  onManageLots,
  onMetaPixel,
  onReports,
  onParticipants,
  onCheckin,
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
    <article className={`group relative flex flex-col sm:grid sm:grid-cols-[280px_1fr] rounded-card border bg-white shadow-card transition-all duration-200 hover:shadow-cardHover hover:-translate-y-[1px] ${
      isSelectedForCompare ? 'border-[#1677FF] ring-2 ring-[#1677FF]/20' : 'border-[#E2E8F0]'
    } overflow-hidden`}>
      {/* Cover Left Side - Fixed Width */}
      <div 
        className="relative h-48 sm:h-auto min-h-[220px] w-full cursor-pointer bg-slate-900"
        onClick={() => onEventDashboard(event)}
      >
        <EventCoverVisual event={event} className="h-full w-full" horizontal />
        
        {/* Selection Checkbox for Compare */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(event.id);
          }}
          className="absolute top-2.5 left-2.5 z-30 flex items-center justify-center rounded bg-black/60 p-1 text-white backdrop-blur-md transition hover:bg-black/80"
          title="Selecionar para comparar"
        >
          {isSelectedForCompare ? (
            <CheckSquare size={16} className="text-blue-400" />
          ) : (
            <Square size={16} className="text-slate-300" />
          )}
        </button>
      </div>

      {/* Card Content Right Side */}
      <div className="flex flex-col justify-between p-5 min-w-0">
        <div>
          {/* Header Row: Title & Venue */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 truncate">
                <Badge status={event.status} />
                <span className="text-[11px] text-[#718096] font-medium truncate">
                  {event.producerName || event.producer}
                </span>
              </div>

              {event.facialRecognition?.enabled && (
                <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-bold text-[#06B6D4] border border-cyan-200">
                  <ScanFace size={11} />
                  Facial {event.facialRecognition.validationRate}%
                </span>
              )}
            </div>

            <h3 
              onClick={() => onEventDashboard(event)}
              className="text-[18px] font-semibold text-[#0E1726] tracking-tight leading-snug hover:text-[#1677FF] transition cursor-pointer truncate"
              title={event.title}
            >
              {event.title}
            </h3>

            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#64748B] font-medium">
              <MapPin size={14} className="text-[#EF4444] shrink-0" />
              <span className="truncate">{event.venue} — {event.city || 'Curitiba'}</span>
            </p>
          </div>

          {/* Metrics Grid (Total, Vendas, Disponível, Cortesia) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4 pt-3.5 border-t border-[#EDF0F4]">
            {/* Total (R$) */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Total</span>
              <strong className="text-[15px] sm:text-[16px] font-bold text-[#0E1726] mt-0.5 truncate">
                R$ {formatCurrency(event.totalRevenue)}
              </strong>
              <span className="mt-1.5 h-0.5 w-7 rounded-full bg-[#10B981]" />
            </div>

            {/* Vendas */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Vendas</span>
              <strong className="text-[15px] sm:text-[16px] font-bold text-[#0E1726] mt-0.5 truncate">
                {event.salesCount.toLocaleString('pt-BR')}
              </strong>
              <span className="mt-1.5 h-0.5 w-7 rounded-full bg-[#1677FF]" />
            </div>

            {/* Disponível */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Disponível</span>
              <strong className="text-[15px] sm:text-[16px] font-bold text-[#0E1726] mt-0.5 truncate">
                {event.availableCount.toLocaleString('pt-BR')}
              </strong>
              <span className="mt-1.5 h-0.5 w-7 rounded-full bg-[#06B6D4]" />
            </div>

            {/* Cortesia */}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Cortesia</span>
              <strong className="text-[15px] sm:text-[16px] font-bold text-[#0E1726] mt-0.5 truncate">
                {event.courtesyCount.toLocaleString('pt-BR')}
              </strong>
              <span className="mt-1.5 h-0.5 w-7 rounded-full bg-[#64748B]" />
            </div>
          </div>

          {/* Ocupação Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold uppercase tracking-wider text-[#64748B]">Ocupação</span>
              <span className={`font-bold ${isHighOccupancy ? 'text-[#F97316]' : 'text-[#0E1726]'}`}>
                {event.occupancyRate.toFixed(1)}%
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div 
                className={`h-full rounded-full ${isHighOccupancy ? 'bg-[#F97316]' : 'bg-[#1677FF]'}`}
                style={{ width: `${Math.min(event.occupancyRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card Footer: Date & Quick Actions */}
        <div className="mt-4 pt-3 border-t border-[#EDF0F4] flex flex-wrap items-center justify-between gap-2">
          {/* Date and time */}
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#64748B]">
            <CalendarDays size={14} className="text-[#1677FF]" />
            <span>{event.date}</span>
          </div>

          {/* Action Icons Toolbar */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onMetaPixel(event)}
              className="flex items-center gap-1 rounded-btn px-2 py-1 text-[11px] font-bold text-[#7C3AED] hover:bg-purple-50 transition border border-purple-200"
              title="Meta Pixel & Campanhas"
            >
              <Target size={13} />
              <span>Meta</span>
            </button>

            <button
              onClick={() => onEventDashboard(event)}
              className="flex h-8 w-8 items-center justify-center rounded-btn text-slate-600 transition hover:bg-slate-100 hover:text-[#1677FF]"
              title="Painel do Evento"
            >
              <Settings2 size={16} />
            </button>

            <button
              onClick={() => onEdit(event)}
              className="flex h-8 w-8 items-center justify-center rounded-btn text-slate-600 transition hover:bg-slate-100 hover:text-[#1677FF]"
              title="Editar Evento"
            >
              <Pencil size={15} />
            </button>

            <button
              onClick={() => onManageLots(event)}
              className="flex h-8 w-8 items-center justify-center rounded-btn text-slate-600 transition hover:bg-slate-100 hover:text-[#7C3AED]"
              title="Configurar Lotes"
            >
              <Layers3 size={16} />
            </button>

            <button
              onClick={() => onParticipants(event)}
              className="flex h-8 w-8 items-center justify-center rounded-btn text-slate-600 transition hover:bg-slate-100 hover:text-[#1677FF]"
              title="Participantes & Check-in"
            >
              <Users size={16} />
            </button>

            {/* More Options Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-btn text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                title="Mais opções"
              >
                <MoreHorizontal size={16} />
              </button>

              {dropdownOpen && (
                <div 
                  className="absolute right-0 bottom-full mb-2 w-48 rounded-card border border-[#CBD5E1] bg-white p-1.5 shadow-dropdown z-40 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      onReports(event);
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <BarChart2 size={14} className="text-[#10B981]" />
                    Relatório Financeiro
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(`https://diskingressos.com.br/evento/${event.code}`);
                      alert('Link da página de vendas copiado!');
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <ExternalLink size={14} className="text-slate-500" />
                    Copiar Link de Venda
                  </button>

                  <button
                    onClick={() => {
                      alert(`Duplicar evento #${event.code}`);
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <Copy size={14} className="text-slate-500" />
                    Duplicar Evento
                  </button>

                  <div className="my-1 border-t border-[#EDF0F4]" />

                  <button
                    onClick={() => {
                      alert(`Status do evento alterado.`);
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-xs font-medium text-[#EF4444] hover:bg-rose-50"
                  >
                    <PauseCircle size={14} />
                    Pausar Vendas
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
