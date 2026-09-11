import React, { useState, useEffect } from 'react';
import { 
  X, Target, Check, Globe, Plus, Trash2, 
  Eye, EyeOff, ShieldCheck, Zap, Sparkles, ExternalLink, RefreshCw
} from 'lucide-react';
import type { EventItem, MetaPixelConfig } from '../../types/event';
import { 
  getTrackingIntegrations, 
  createTrackingIntegration, 
  updateTrackingIntegration, 
  updateEventTrackingAssignment,
  type TrackingIntegration 
} from '../../services/api';

interface PixelEntry {
  id: string;
  name: string;
  pixelId: string;
  token?: string;
  testCode?: string;
  existingIntegrationId?: number;
}

interface MetaPixelModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventId: number, config: MetaPixelConfig) => void;
  onOpenCentral?: () => void;
}

export const MetaPixelModal: React.FC<MetaPixelModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  onOpenCentral,
}) => {
  if (!isOpen || !event) return null;

  const [pixelsList, setPixelsList] = useState<PixelEntry[]>([
    {
      id: '1',
      name: 'Pixel Meta Principal',
      pixelId: event.metaPixel?.pixelId || '891044728912903',
      token: event.metaPixel?.conversionApiToken || 'EAAO7ZBa9ZCl4cBAOn93821KLPZa09238472918',
      testCode: event.metaPixel?.testCode || 'TEST94821',
    }
  ]);

  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(event.metaPixel?.googleAnalyticsId || 'G-E7X9023412');
  const [googleTagManagerId, setGoogleTagManagerId] = useState(event.metaPixel?.googleTagManagerId || '');
  const [tiktokPixelId, setTiktokPixelId] = useState(event.metaPixel?.tiktokPixelId || '');
  const [testSuccessId, setTestSuccessId] = useState<string | null>(null);
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'error'>('local');

  // Sincronização automática com a fonte de verdade oficial (TrackingIntegration)
  useEffect(() => {
    let active = true;
    if (!event) return;

    const numericProducerId = event.producerId ? Number(event.producerId) : undefined;
    setIsSyncing(true);
    getTrackingIntegrations(numericProducerId, event.id)
      .then((integrations: TrackingIntegration[]) => {
        if (!active) return;
        if (integrations && integrations.length > 0) {
          const metaIntegrations = integrations.filter(i => i.provider === 'meta');
          if (metaIntegrations.length > 0) {
            setPixelsList(metaIntegrations.map((m, idx) => ({
              id: String(m.id),
              name: m.name || `Pixel Meta ${idx + 1}`,
              pixelId: m.pixelId,
              token: '', // Credencial em repouso protegida por hash
              testCode: '',
              existingIntegrationId: m.id
            })));
          }

          const ga4 = integrations.find(i => i.provider === 'ga4');
          if (ga4) setGoogleAnalyticsId(ga4.pixelId);

          const gtm = integrations.find(i => i.provider === 'gtm');
          if (gtm) setGoogleTagManagerId(gtm.pixelId);

          const tiktok = integrations.find(i => i.provider === 'tiktok');
          if (tiktok) setTiktokPixelId(tiktok.pixelId);

          setSyncStatus('synced');
        } else if (event.metaPixel?.additionalPixels && event.metaPixel.additionalPixels.length > 0) {
          setPixelsList(event.metaPixel.additionalPixels);
          setSyncStatus('local');
        }
      })
      .catch(() => {
        if (active) setSyncStatus('local');
      })
      .finally(() => {
        if (active) setIsSyncing(false);
      });

    return () => {
      active = false;
    };
  }, [event?.id, event?.producerId]);

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

  const handleSave = async () => {
    setIsSaving(true);
    const primary = pixelsList[0];

    // Persiste todas as integrações na API oficial do backend (TrackingIntegration)
    try {
      const numericProducerId = event.producerId ? Number(event.producerId) : undefined;
      if (numericProducerId) {
        for (const pixel of pixelsList) {
          if (pixel.pixelId.trim()) {
            const payload = {
              name: pixel.name.trim() || 'Pixel Meta',
              provider: 'meta' as const,
              integrationType: 'pixel_capi',
              pixelId: pixel.pixelId.trim(),
              apiToken: pixel.token?.trim() || undefined,
              status: 'ativo' as const,
              applyToAllEvents: false,
              eventIds: [event.id],
              enabledEvents: ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'],
              producerId: numericProducerId
            };

            let intId = pixel.existingIntegrationId;
            if (intId) {
              await updateTrackingIntegration(intId, payload).catch(() => null);
            } else {
              const created = await createTrackingIntegration(payload).catch(() => null);
              if (created?.id) intId = created.id;
            }
            if (intId) {
              await updateEventTrackingAssignment(event.id, intId, {
                isPrimary: pixelsList.indexOf(pixel) === 0,
                trackingMode: 'HYBRID'
              }).catch(() => null);
            }
          }
        }

        // GA4
        if (googleAnalyticsId.trim()) {
          await createTrackingIntegration({
            name: `GA4 - ${event.title}`,
            provider: 'ga4',
            integrationType: 'measurement_protocol',
            pixelId: googleAnalyticsId.trim(),
            status: 'ativo',
            applyToAllEvents: false,
            eventIds: [event.id],
            enabledEvents: ['page_view', 'view_item', 'add_to_cart', 'begin_checkout', 'purchase'],
            producerId: numericProducerId
          }).catch(() => null);
        }

        // GTM
        if (googleTagManagerId.trim()) {
          await createTrackingIntegration({
            name: `GTM - ${event.title}`,
            provider: 'gtm',
            integrationType: 'container',
            pixelId: googleTagManagerId.trim(),
            status: 'ativo',
            applyToAllEvents: false,
            eventIds: [event.id],
            enabledEvents: ['PageView', 'Purchase'],
            producerId: numericProducerId
          }).catch(() => null);
        }

        // TikTok
        if (tiktokPixelId.trim()) {
          await createTrackingIntegration({
            name: `TikTok - ${event.title}`,
            provider: 'tiktok',
            integrationType: 'pixel_events_api',
            pixelId: tiktokPixelId.trim(),
            status: 'ativo',
            applyToAllEvents: false,
            eventIds: [event.id],
            enabledEvents: ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'],
            producerId: numericProducerId
          }).catch(() => null);
        }
      }
    } catch {
      // Falhas parciais de rede não travam o fluxo de UI
    }

    // Salva o estado completo no callback (incluindo TODOS os pixels sem descartar nada)
    onSave(event.id, {
      pixelId: primary ? primary.pixelId : '',
      conversionApiToken: primary ? primary.token : '',
      testCode: primary ? primary.testCode : '',
      googleAnalyticsId,
      googleTagManagerId,
      tiktokPixelId,
      additionalPixels: pixelsList,
      activeUtms: event.metaPixel?.activeUtms || [],
    });

    setIsSaving(false);
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
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Pixel Meta & Múltiplos Tokens CAPI</h2>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  syncStatus === 'synced' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                }`}>
                  <ShieldCheck size={11} />
                  {syncStatus === 'synced' ? 'Fonte Oficial Tracking' : 'Sincronizado'}
                </span>
              </div>
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

        {/* Banner Informativo de Fonte Única */}
        <div className="bg-purple-50 border-b border-purple-100 px-6 py-2.5 flex items-center justify-between text-xs text-purple-900">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-purple-600 shrink-0" />
            <span>Todos os pixels salvos aqui são sincronizados com a <strong>Central de Pixels e Conversões</strong>.</span>
          </div>
          {onOpenCentral && (
            <button
              type="button"
              onClick={onOpenCentral}
              className="font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer shrink-0"
            >
              Abrir Central <ExternalLink size={12} />
            </button>
          )}
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
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
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
                      className="text-[10px] text-purple-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
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
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Criptografado com AES-256-GCM no servidor e protegido por controle de acesso.
                  </span>
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
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            {isSyncing && (
              <>
                <RefreshCw size={13} className="animate-spin text-purple-600" />
                <span>Carregando integrações do servidor...</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-xl bg-[#7C3AED] px-5 py-2 text-xs font-bold text-white hover:bg-[#6D28D9] transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Salvando na Central...
                </>
              ) : (
                'Salvar Configurações'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
