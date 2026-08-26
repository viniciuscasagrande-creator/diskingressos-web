import React from 'react';
import { X, ArrowLeftRight, Calendar, Award } from 'lucide-react';
import type { EventItem } from '../../types/event';
import { EventCoverVisual } from './EventCoverVisual';

interface CompareEventsModalProps {
  events: EventItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveFromCompare: (id: number) => void;
}

export const CompareEventsModal: React.FC<CompareEventsModalProps> = ({
  events,
  isOpen,
  onClose,
  onRemoveFromCompare,
}) => {
  if (!isOpen || events.length === 0) return null;

  const formatCurrency = (val?: number) => {
    return (val || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const highestRevenueId = [...events].sort((a, b) => b.totalRevenue - a.totalRevenue)[0]?.id;
  const highestSalesId = [...events].sort((a, b) => b.salesCount - a.salesCount)[0]?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-6xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-md">
              <ArrowLeftRight size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold">Comparador de Eventos</h2>
              <p className="text-xs text-slate-300">
                Análise comparativa de {events.length} eventos selecionados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Comparison Content */}
        <div className="overflow-x-auto p-6">
          <div className="grid grid-flow-col auto-cols-[300px] gap-6 min-w-full">
            {events.map((event) => {
              const isTopRevenue = event.id === highestRevenueId && events.length > 1;
              const isTopSales = event.id === highestSalesId && events.length > 1 && event.salesCount > 0;

              return (
                <div
                  key={event.id}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden"
                >
                  {/* Event Mini Cover */}
                  <div className="relative h-32 w-full">
                    <EventCoverVisual event={event} className="h-full w-full" />
                    <button
                      onClick={() => onRemoveFromCompare(event.id)}
                      className="absolute top-2 right-2 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-rose-600 transition"
                      title="Remover da comparação"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Badges of best performer */}
                      {isTopRevenue && (
                        <div className="mb-2 inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200">
                          <Award size={12} />
                          MAIOR FATURAMENTO
                        </div>
                      )}

                      <h3 className="text-sm font-black text-slate-900 line-clamp-1" title={event.title}>
                        {event.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{event.venue}</p>
                      <p className="text-[11px] font-semibold text-slate-700 mt-1 flex items-center gap-1">
                        <Calendar size={12} className="text-blue-500" />
                        {event.date}
                      </p>

                      {/* Metrics Comparison List */}
                      <div className="mt-4 space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Receita Bruta:</span>
                          <span className={`font-black ${isTopRevenue ? 'text-emerald-600 text-sm' : 'text-slate-800'}`}>
                            {formatCurrency(event.totalRevenue)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Ingressos Vendidos:</span>
                          <span className={`font-bold ${isTopSales ? 'text-blue-600' : 'text-slate-800'}`}>
                            {event.salesCount.toLocaleString('pt-BR')} un.
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Disponíveis:</span>
                          <span className="font-semibold text-slate-800">
                            {event.availableCount.toLocaleString('pt-BR')} un.
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Cortesias:</span>
                          <span className="font-semibold text-slate-600">
                            {event.courtesyCount.toLocaleString('pt-BR')} un.
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Ticket Médio:</span>
                          <span className="font-bold text-slate-800">
                            {formatCurrency(event.averageTicketPrice || 0)}
                          </span>
                        </div>

                        <div className="pt-2">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-slate-500 font-medium">Ocupação:</span>
                            <span className="font-black text-slate-900">{event.occupancyRate.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{ width: `${Math.min(event.occupancyRate, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <span className="text-slate-500 font-medium">Biometria Facial:</span>
                          <span className={event.facialRecognition?.enabled ? 'text-cyan-600 font-bold' : 'text-slate-400'}>
                            {event.facialRecognition?.enabled ? `Ativa (${event.facialRecognition.validationRate}%)` : 'Não habilitada'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Pixel Meta / CAPI:</span>
                          <span className={event.metaPixel?.pixelId ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                            {event.metaPixel?.pixelId ? 'Configurado' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
          >
            Fechar Comparação
          </button>
        </div>
      </div>
    </div>
  );
};
