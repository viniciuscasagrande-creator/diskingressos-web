import React from 'react';
import { Target, Globe, Megaphone, TrendingUp, Sparkles, Plus, ExternalLink } from 'lucide-react';
import type { EventItem } from '../types/event';

interface MarketingPageProps {
  events: EventItem[];
  onOpenMetaModal: (event: EventItem) => void;
}

export const MarketingPage: React.FC<MarketingPageProps> = ({ events, onOpenMetaModal }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold tracking-widest uppercase text-slate-500">
            MARKETING & PERFORMANCE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Meta Pixel, Google & Campanhas
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Gestão de rastreamento de anúncios, Conversions API, tags UTM e campanhas de remarketing.
          </p>
        </div>
      </div>

      {/* Grid of Events Pixel Configurations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {events.map((event) => (
          <div key={event.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-500">#{event.code}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                  event.metaPixel?.pixelId ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {event.metaPixel?.pixelId ? 'Pixel Conectado' : 'Pixel Pendente'}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2 truncate">{event.title}</h3>
              <p className="text-xs text-slate-500">{event.venue}</p>

              <div className="mt-4 space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Pixel ID:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {event.metaPixel?.pixelId || 'Não informado'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Google Analytics:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {event.metaPixel?.googleAnalyticsId || 'Não vinculado'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">UTMs Rastreadas:</span>
                  <span className="font-bold text-blue-600">
                    {event.metaPixel?.activeUtms?.length || 0} campanhas ativas
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenMetaModal(event)}
              className="mt-4 w-full rounded-xl border border-purple-200 bg-purple-50 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100 transition flex items-center justify-center gap-1.5"
            >
              <Target size={14} />
              Configurar Pixels & CAPI
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
