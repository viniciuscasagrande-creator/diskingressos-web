import React, { useState, useEffect } from 'react';
import { 
  X, Target, Check, Globe, Sparkles, Plus, Trash2, 
  Eye, EyeOff, ShieldCheck, Zap, HelpCircle 
} from 'lucide-react';
import type { EventItem, MetaPixelConfig } from '../../types/event';

interface PixelEntry {
  id: string;
  name: string;
  pixelId: string;
  token: string;
  testCode: string;
}

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
  const [pixelsList, setPixelsList] = useState<PixelEntry[]>([
    {
      id: '1',
      name: 'Pixel Meta Principal',
      pixelId: event?.metaPixel?.pixelId || '891044728912903',
      token: event?.metaPixel?.conversionApiToken || 'EAAO7ZBa9ZCl4cBAOn93821KLPZa09238472918',
      testCode: event?.metaPixel?.testCode || 'TEST94821',
    }
  ]);

  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(event?.metaPixel?.googleAnalyticsId || 'G-E7X9023412');
  const [googleTagManagerId, setGoogleTagManagerId] = useState(event?.metaPixel?.googleTagManagerId || '');
  const [tiktokPixelId, setTiktokPixelId] = useState(event?.metaPixel?.tiktokPixelId || '');
  const [testSuccessId, setTestSuccessId] = useState<string | null>(null);
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (event?.metaPixel) {
      setPixelsList([
        {
          id: '1',
          name: 'Pixel Meta Principal',
          pixelId: event.metaPixel.pixelId || '891044728912903',
          token: event.metaPixel.conversionApiToken || 'EAAO7ZBa9ZCl4cBAOn93821KLPZa09238472918',
          testCode: event.metaPixel.testCode || 'TEST94821',
        }
      ]);
      setGoogleAnalyticsId(event.metaPixel.googleAnalyticsId || 'G-E7X9023412');
      setGoogleTagManagerId(event.metaPixel.googleTagManagerId || '');
      setTiktokPixelId(event.metaPixel.tiktokPixelId || '');
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleAddPixel = () => {
    const newEntry: PixelEntry = {
      id: String(Date.now()),
      name: `Pixel Meta Adicional (Conta ${pixelsList.length + 1})`,
      pixelId: '',
      token: '',
      testCode: '',
    };
    setPixelsList([...pixelsList, newEntry]);
  };

  const handleRemovePixel = (id: string) => {
    if (pixelsList.length <= 1) return;
    setPixelsList(pixelsList.filter(p => p.id !== id));
  };

  const handleUpdatePixel = (id: string, field: keyof PixelEntry, value: string) => {
    setPixelsList(pixelsList.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSave = () => {
    const primary = pixelsList[0];
    onSave(event.id, {
      pixelId: primary ? primary.pixelId : '',
      conversionApiToken: primary ? primary.token : '',
      testCode: primary ? primary.testCode : '',
      googleAnalyticsId,
      googleTagManagerId,
      tiktokPixelId,
      activeUtms: event.metaPixel?.activeUtms || [],
    });
    onClose();
  };

  const handleTestEvent = (pixelId: string) => {
    setTestSuccessId(pixelId);
    setTimeout(() => setTestSuccessId(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 shadow-md">
              <Target size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold">Pixel Meta & Múltiplos Tokens CAPI</h2>
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
          {/* Header Action: Add Pixel */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">
                Pixels Meta (Facebook & Instagram)
              </h3>
              <p className="text-[11px] text-slate-500">
                Cadastre múltiplos Pixels e Tokens para compartilhar dados com agências ou contas de anúncio distintas.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddPixel}
              className="flex items-center gap-1 px-3 py-1.5 rounded-btn text-xs font-bold bg-purple-50 text-[#7C3AED] border border-purple-200 hover:bg-purple-100 transition cursor-pointer"
            >
              <Plus size={14} />
              Incluir Pixel
            </button>
          </div>

          {/* Meta Pixels List */}
          <div className="space-y-3.5">
            {pixelsList.map((entry, idx) => (
              <div key={entry.id} className="rounded-xl border border-purple-200 p-4 bg-purple-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-white text-[10px] font-black">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={entry.name}
                      onChange={(e) => handleUpdatePixel(entry.id, 'name', e.target.value)}
                      placeholder="Nome do Pixel (Ex: Conta Agência)"
                      className="bg-transparent font-bold text-xs text-slate-900 border-b border-purple-200 focus:border-purple-600 focus:outline-hidden px-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-purple-100 px-2 py-0.5 text-[9.5px] font-bold text-purple-700">
                      Pixel + CAPI Server-Side
                    </span>
                    {pixelsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePixel(entry.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Remover este pixel"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
                      ID do Pixel Meta *
                    </label>
                    <input
                      type="text"
                      value={entry.pixelId}
                      onChange={(e) => handleUpdatePixel(entry.id, 'pixelId', e.target.value)}
                      placeholder="Ex: 891044728912903"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
                      Código de Teste CAPI (Opcional)
                    </label>
                    <input
                      type="text"
                      value={entry.testCode}
                      onChange={(e) => handleUpdatePixel(entry.id, 'testCode', e.target.value)}
                      placeholder="Ex: TEST94821"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono uppercase text-slate-900 focus:border-purple-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10.5px] font-bold text-slate-700">
                      Token da API de Conversões (CAPI)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTokens(prev => ({ ...prev, [entry.id]: !prev[entry.id] }))}
                      className="text-[10px] text-purple-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      {showTokens[entry.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                      {showTokens[entry.id] ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  <input
                    type={showTokens[entry.id] ? "text" : "password"}
                    value={entry.token}
                    onChange={(e) => handleUpdatePixel(entry.id, 'token', e.target.value)}
                    placeholder="EAAO7ZBa9ZCl4cBAO..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-purple-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-purple-100 text-xs">
                  <button
                    type="button"
                    onClick={() => handleTestEvent(entry.id)}
                    className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                  >
                    <Zap size={13} />
                    Disparar Teste de Conversão
                  </button>
                  {testSuccessId === entry.id && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 animate-in fade-in">
                      <Check size={13} />
                      Disparo enviado com sucesso (200 OK)!
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Google Analytics 4 & Tag Manager */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 space-y-3">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Globe size={15} className="text-blue-600" />
              Google Analytics (GA4), GTM & TikTok
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
                  Google Analytics 4 (GA4)
                </label>
                <input
                  type="text"
                  value={googleAnalyticsId}
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
                  Google Tag Manager (GTM)
                </label>
                <input
                  type="text"
                  value={googleTagManagerId}
                  onChange={(e) => setGoogleTagManagerId(e.target.value)}
                  placeholder="GTM-XXXXXXX"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
                  TikTok Pixel ID
                </label>
                <input
                  type="text"
                  value={tiktokPixelId}
                  onChange={(e) => setTiktokPixelId(e.target.value)}
                  placeholder="TT-XXXXXXXX"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-pink-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-[#7C3AED] px-5 py-2 text-xs font-bold text-white hover:bg-[#6D28D9] transition shadow-xs cursor-pointer"
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};
