import React from 'react';
import { 
  X, Calendar, MapPin, Layers3, Target, ScanFace, 
  Edit, Share2
} from 'lucide-react';
import type { EventItem } from '../../types/event';
import { EventCoverVisual } from './EventCoverVisual';

interface EventDetailDrawerProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: EventItem) => void;
  onManageLots: (event: EventItem) => void;
  onMetaPixel: (event: EventItem) => void;
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
  onManageLots,
  onMetaPixel,
}) => {
  if (!isOpen || !event) return null;

  const formatCurrency = (val?: number) => {
    return (val || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const batches = event.batches || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                #{event.code}
              </span>
              <h2 className="text-sm font-bold truncate max-w-xs">Detalhes do Evento</h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Visual Cover */}
            <div className="relative h-44 w-full rounded-xl overflow-hidden shadow-sm">
              <EventCoverVisual event={event} className="h-full w-full" />
            </div>

            {/* Title & Info */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                  event.status === 'ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {event.status === 'ativo' ? 'Vendas Liberadas' : 'Rascunho'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-600">{event.category}</span>
              </div>

              <h1 className="text-xl font-black text-slate-900 tracking-tight">{event.title}</h1>
              {event.subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{event.subtitle}</p>
              )}

              <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600 shrink-0" />
                  <span className="font-semibold">{event.date} {event.endDate ? `até ${event.endDate}` : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-rose-500 shrink-0" />
                  <span>{event.venue} — {event.address || `${event.city}/${event.state || 'PR'}`}</span>
                </div>
              </div>
            </div>

            {/* Financial & Ticket Indicators */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Indicadores de Desempenho
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Receita Bruta</span>
                  <p className="text-lg font-black text-emerald-600 mt-0.5">
                    {formatCurrency(event.totalRevenue)}
                  </p>
                  <span className="text-[10px] text-slate-400">Ticket Médio: {formatCurrency(event.averageTicketPrice || 0)}</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Ingressos Vendidos</span>
                  <p className="text-lg font-black text-blue-600 mt-0.5">
                    {event.salesCount.toLocaleString('pt-BR')} un.
                  </p>
                  <span className="text-[10px] text-slate-400">Capacidade: {event.totalCapacity || 1000} un.</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Disponíveis</span>
                  <p className="text-lg font-black text-slate-800 mt-0.5">
                    {event.availableCount.toLocaleString('pt-BR')} un.
                  </p>
                  <span className="text-[10px] text-slate-400">{event.courtesyCount} cortesias emitidas</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Ocupação do Evento</span>
                  <p className="text-lg font-black text-orange-600 mt-0.5">
                    {event.occupancyRate.toFixed(1)}%
                  </p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full" style={{ width: `${Math.min(event.occupancyRate, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Batches Overview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Lotes Ativos ({batches.length})
                </h3>
                <button
                  onClick={() => onManageLots(event)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Layers3 size={13} />
                  Configurar
                </button>
              </div>

              <div className="space-y-2">
                {batches.map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{batch.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {batch.soldQuantity || batch.sold || 0} de {batch.totalQuantity || batch.qty || 0} vendidos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">R$ {batch.price.toFixed(2)}</p>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 uppercase">
                        {batch.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Facial & Meta Tracking status */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                  <ScanFace size={15} className="text-cyan-600" />
                  Biometria Facial
                </div>
                <p className="text-xs text-slate-600">
                  {event.facialRecognition?.enabled 
                    ? `${event.facialRecognition.registeredCount} biometrias cadastradas (${event.facialRecognition.validationRate}%)`
                    : 'Desativado para este evento'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                  <Target size={15} className="text-purple-600" />
                  Meta Pixel & CAPI
                </div>
                <p className="text-xs text-slate-600">
                  {event.metaPixel?.pixelId ? `Pixel: ${event.metaPixel.pixelId}` : 'Nenhum pixel vinculado'}
                </p>
              </div>
            </div>
          </div>

          {/* Drawer Actions Footer */}
          <div className="border-t border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(`https://diskingressos.com.br/evento/${event.code}`);
                alert('Link de vendas copiado com sucesso!');
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-xs"
            >
              <Share2 size={14} />
              Compartilhar Link
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onMetaPixel(event)}
                className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100 transition"
              >
                <Target size={14} />
                Pixel
              </button>
              <button
                onClick={() => onEdit(event)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-xs"
              >
                <Edit size={14} />
                Editar Evento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
