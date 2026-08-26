import React, { useState } from 'react';
import { X, Target, Check, Globe, Sparkles, ExternalLink, HelpCircle } from 'lucide-react';
import type { EventItem, MetaPixelConfig } from '../../types/event';

interface MetaPixelModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventId: number, config: MetaPixelConfig) => void;
}

export const MetaPixelModal: React.FC<MetaPixelModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !event) return null;

  const [pixelId, setPixelId] = useState(event.metaPixel?.pixelId || '');
  const [conversionToken, setConversionToken] = useState(event.metaPixel?.conversionApiToken || '');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(event.metaPixel?.googleAnalyticsId || '');
  const [tiktokPixelId, setTiktokPixelId] = useState(event.metaPixel?.tiktokPixelId || '');
  const [testSuccess, setTestSuccess] = useState(false);

  const handleSave = () => {
    onSave(event.id, {
      pixelId,
      conversionApiToken: conversionToken,
      googleAnalyticsId,
      tiktokPixelId,
      activeUtms: event.metaPixel?.activeUtms || [],
    });
    onClose();
  };

  const handleTestEvent = () => {
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 shadow-md">
              <Target size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold">Pixel Meta & Rastreamento</h2>
              <p className="text-xs text-slate-300 truncate max-w-sm">
                {event.title} (Código #{event.code})
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

        {/* Form Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Meta Pixel Section */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Target size={15} className="text-purple-600" />
                Meta Ads (Facebook & Instagram)
              </span>
              <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                Pixel + Conversions API (CAPI)
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  ID do Pixel Meta
                </label>
                <input
                  type="text"
                  value={pixelId}
                  onChange={(e) => setPixelId(e.target.value)}
                  placeholder="Ex: 891044728912903"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Token da API de Conversões (CAPI) - Recomendado para iOS 14+
                </label>
                <input
                  type="password"
                  value={conversionToken}
                  onChange={(e) => setConversionToken(e.target.value)}
                  placeholder="EAAX7c9..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleTestEvent}
                className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                <Sparkles size={13} />
                Disparar Evento de Teste (PageView)
              </button>
              {testSuccess && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 animate-in fade-in">
                  <Check size={14} />
                  Disparo de teste enviado com sucesso!
                </span>
              )}
            </div>
          </div>

          {/* Google Analytics 4 & TikTok */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 space-y-3">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Globe size={15} className="text-blue-600" />
              Outras Plataformas de Tráfego
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Google Analytics 4 (GA4 ID)
                </label>
                <input
                  type="text"
                  value={googleAnalyticsId}
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  TikTok Pixel ID (Opcional)
                </label>
                <input
                  type="text"
                  value={tiktokPixelId}
                  onChange={(e) => setTiktokPixelId(e.target.value)}
                  placeholder="TT-XXXXXXXX"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Active UTMs Performance */}
          {event.metaPixel?.activeUtms && event.metaPixel.activeUtms.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                UTMs Ativas & Conversões Registradas
              </h4>
              <div className="space-y-1.5">
                {event.metaPixel.activeUtms.map((utm, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{utm.campaign}</span>
                      <span className="text-slate-500 text-[11px] ml-2 font-mono">
                        ({utm.source} / {utm.medium})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600">{utm.clicks} cliques</span>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {utm.conversions} vendas
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-500 transition shadow-xs"
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};
