import React, { useState, useEffect } from 'react';
import { 
  Sliders, ShieldCheck, CheckCircle2, Globe, 
  Layers, ArrowRight, Save, Info, RefreshCw, Plus, 
  Trash2, Edit, Copy, Check, Eye, EyeOff, Zap, 
  Target, TrendingUp, Radio, AlertCircle, Sparkles,
  ExternalLink, BarChart3, Lock, CopyCheck, Play, Pause,
  Terminal, History, AlertTriangle, Building2, Calendar
} from 'lucide-react';
import type { EventItem } from '../../types/event';
import { 
  getTrackingSummary, 
  getTrackingIntegrations, 
  createTrackingIntegration, 
  updateTrackingIntegration, 
  toggleTrackingIntegration, 
  duplicateTrackingIntegration, 
  deleteTrackingIntegration, 
  testTrackingIntegration, 
  getTrackingIntegrationLogs, 
  type ApiTrackingIntegration, 
  type TrackingSummary, 
  type TrackingLogItem 
} from '../../services/api';
import { Button } from '../../components/ui/Button';

interface PixelInheritancePageProps {
  events: EventItem[];
  producerId?: number | null;
  producerName?: string;
  notify?: (msg: string) => void;
}

const ALL_AVAILABLE_EVENTS = [
  { key: 'PageView', label: 'PageView (Visitas de página)' },
  { key: 'ViewContent', label: 'ViewContent (Visualização do evento)' },
  { key: 'AddToCart', label: 'AddToCart (Seleção de ingressos)' },
  { key: 'InitiateCheckout', label: 'InitiateCheckout (Início de pagamento)' },
  { key: 'AddPaymentInfo', label: 'AddPaymentInfo (Preenchimento de dados/PIX/Cartão)' },
  { key: 'Purchase', label: 'Purchase (Compra aprovada)' },
  { key: 'Lead', label: 'Lead (Captura de interessado)' },
  { key: 'CompleteRegistration', label: 'CompleteRegistration (Cadastro de participante)' },
];

export const PixelInheritancePage: React.FC<PixelInheritancePageProps> = ({ 
  events, 
  producerId = null,
  producerName = 'DiskIngressos Produções',
  notify 
}) => {
  const [selectedEventId, setSelectedEventId] = useState<number | 'all'>('all');
  const [integrations, setIntegrations] = useState<ApiTrackingIntegration[]>([]);
  const [summary, setSummary] = useState<TrackingSummary>({
    total: 3,
    active: 3,
    paused: 0,
    attention: 0,
    eventsSentToday: 4432,
    matchQuality: '8.9 / 10 (Excelente)',
    serverSideCoverage: '100% CAPI Server + Browser',
  });
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);

  // Logs Modal State
  const [logsModalIntegration, setLogsModalIntegration] = useState<ApiTrackingIntegration | null>(null);
  const [logsList, setLogsList] = useState<TrackingLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formProvider, setFormProvider] = useState<'meta' | 'google' | 'tiktok' | 'gtm' | 'custom'>('meta');
  const [formPixelId, setFormPixelId] = useState('');
  const [formApiToken, setFormApiToken] = useState('');
  const [replaceTokenMode, setReplaceTokenMode] = useState(false);
  const [formTestCode, setFormTestCode] = useState('');
  const [formInheritanceMode, setFormInheritanceMode] = useState<'all_events' | 'selected_events' | 'current_event'>('all_events');
  const [formSelectedEventIds, setFormSelectedEventIds] = useState<number[]>([]);
  const [formTrackedEvents, setFormTrackedEvents] = useState<string[]>([
    'PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'AddPaymentInfo', 'Purchase'
  ]);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const pId = producerId || undefined;
      const evId = selectedEventId === 'all' ? undefined : Number(selectedEventId);
      const [sum, items] = await Promise.all([
        getTrackingSummary(pId),
        getTrackingIntegrations(pId, evId),
      ]);
      setSummary(sum);
      setIntegrations(items);
    } catch (e: any) {
      console.error('Error loading tracking data:', e);
      if (notify) notify(e.message || 'Falha ao carregar integrações de tracking.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [producerId, selectedEventId]);

  // Copy helper
  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
    if (notify) notify('Copiado para a área de transferência!');
  };

  // Open Modal for New Integration
  const handleOpenNewModal = () => {
    setEditingId(null);
    setFormName('');
    setFormProvider('meta');
    setFormPixelId('');
    setFormApiToken('');
    setReplaceTokenMode(true);
    setFormTestCode('');
    setFormInheritanceMode(selectedEventId === 'all' ? 'all_events' : 'current_event');
    setFormSelectedEventIds(selectedEventId === 'all' ? [] : [Number(selectedEventId)]);
    setFormTrackedEvents(['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'AddPaymentInfo', 'Purchase']);
    setIsModalOpen(true);
  };

  // Open Modal for Edit Integration
  const handleOpenEditModal = (item: ApiTrackingIntegration) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormProvider(item.provider);
    setFormPixelId(item.pixelId);
    setFormApiToken('');
    setReplaceTokenMode(false);
    setFormTestCode(item.testEventCode || '');
    setFormInheritanceMode(item.inheritanceMode);
    setFormSelectedEventIds(item.events?.map(e => e.eventId) || []);
    setFormTrackedEvents(item.trackedEvents && item.trackedEvents.length > 0 ? item.trackedEvents : ['PageView', 'Purchase']);
    setIsModalOpen(true);
  };

  // Submit Save Integration
  const handleSaveIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPixelId.trim()) {
      if (notify) notify('Preencha o nome da integração e o Pixel ID.');
      return;
    }

    try {
      const payload: any = {
        name: formName.trim(),
        provider: formProvider,
        type: formProvider === 'meta' ? 'meta-capi' : formProvider === 'google' ? 'ga4' : formProvider,
        pixelId: formPixelId.trim(),
        testEventCode: formTestCode.trim() || undefined,
        inheritanceMode: formInheritanceMode,
        eventIds: formInheritanceMode === 'selected_events' || formInheritanceMode === 'current_event' 
          ? formSelectedEventIds 
          : [],
        trackedEvents: formTrackedEvents,
        producerId: producerId || undefined,
      };

      if (replaceTokenMode && formApiToken.trim()) {
        payload.apiToken = formApiToken.trim();
      }

      if (editingId) {
        await updateTrackingIntegration(editingId, payload);
        if (notify) notify(`Integração "${formName}" atualizada com sucesso!`);
      } else {
        await createTrackingIntegration(payload);
        if (notify) notify(`Integração "${formName}" criada e ativada com sucesso!`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      if (notify) notify(err.message || 'Falha ao salvar integração.');
    }
  };

  // Toggle Active / Paused
  const handleToggle = async (id: number, currentStatus: string) => {
    try {
      const res = await toggleTrackingIntegration(id);
      setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: res.status as any } : i));
      if (notify) notify(`Integração ${res.status === 'ativo' ? 'ativada' : 'pausada'} com sucesso.`);
    } catch (err: any) {
      if (notify) notify(err.message || 'Falha ao alterar status.');
    }
  };

  // Duplicate Integration
  const handleDuplicate = async (id: number) => {
    try {
      await duplicateTrackingIntegration(id);
      if (notify) notify('Integração duplicada com sucesso!');
      loadData();
    } catch (err: any) {
      if (notify) notify(err.message || 'Falha ao duplicar integração.');
    }
  };

  // Delete Integration
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja remover a integração "${name}"?`)) return;
    try {
      await deleteTrackingIntegration(id);
      if (notify) notify(`Integração "${name}" removida com sucesso.`);
      loadData();
    } catch (err: any) {
      if (notify) notify(err.message || 'Falha ao remover integração.');
    }
  };

  // Test CAPI Connection
  const handleTestConnection = async (item: ApiTrackingIntegration) => {
    setTestingId(item.id);
    try {
      const res = await testTrackingIntegration(item.id, 'Purchase');
      if (notify) notify(`⚡ ${res.message} (Código ${res.responseStatus})`);
      loadData();
    } catch (err: any) {
      if (notify) notify(err.message || 'Falha ao testar conexão.');
    } finally {
      setTestingId(null);
    }
  };

  // View Logs
  const handleViewLogs = async (item: ApiTrackingIntegration) => {
    setLogsModalIntegration(item);
    setLoadingLogs(true);
    try {
      const logs = await getTrackingIntegrationLogs(item.id);
      setLogsList(logs);
    } catch (err: any) {
      if (notify) notify('Falha ao carregar logs.');
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div className="w-full space-y-6 select-none font-sans">
      {/* 1. Header & Hierarchy Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              FASE 16.1 — MULTI-PIXEL & MULTI-TOKEN CAPI
            </span>
          </div>
          <h1 className="text-[22px] font-black text-[#0E1726] tracking-tight">
            Pixel & Analytics — Múltiplos Pixels e Tokens API
          </h1>
          <div className="flex items-center gap-2 text-xs text-[#718096] mt-0.5">
            <span>Produtora: <strong className="text-slate-800">{producerName}</strong></span>
            <span>•</span>
            <span>Cada evento e produtora pode gerenciar múltiplos Pixels Meta, GA4 e Tokens CAPI simultâneos.</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter by Event */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-btn px-3 py-1.5 shadow-xs">
            <span className="text-xs font-bold text-slate-700">Filtrar Evento:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-[#0E1726] outline-hidden cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">Todos os Eventos (Visão Global)</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  #{ev.code} - {ev.title}
                </option>
              ))}
            </select>
          </div>

          {/* Button: + Adicionar Pixel / Token */}
          <Button
            variant="primary"
            onClick={handleOpenNewModal}
            icon={<Plus size={16} />}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] font-bold shadow-xs cursor-pointer"
          >
            + Adicionar Pixel / Token
          </Button>
        </div>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-card border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Integrações Ativas</span>
            <Target size={17} className="text-[#7C3AED]" />
          </div>
          <strong className="text-[22px] font-black text-[#0E1726] mt-1 block">
            {summary.active} de {summary.total} Pixels
          </strong>
          <span className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            100% monitorando conversões
          </span>
        </div>

        <div className="bg-white p-4 rounded-card border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Disparos Hoje</span>
            <Zap size={17} className="text-amber-500" />
          </div>
          <strong className="text-[22px] font-black text-amber-600 mt-1 block">
            {summary.eventsSentToday.toLocaleString('pt-BR')} eventos
          </strong>
          <span className="text-[10.5px] text-slate-500 font-semibold">
            {summary.serverSideCoverage}
          </span>
        </div>

        <div className="bg-white p-4 rounded-card border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Qualidade de Correspondência</span>
            <ShieldCheck size={17} className="text-emerald-500" />
          </div>
          <strong className="text-[22px] font-black text-emerald-600 mt-1 block">
            {summary.matchQuality}
          </strong>
          <span className="text-[10.5px] text-emerald-700 font-semibold">
            Hash SHA-256 (E-mail + Telefone + IP)
          </span>
        </div>

        <div className="bg-white p-4 rounded-card border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Herança por Integração</span>
            <Globe size={17} className="text-blue-500" />
          </div>
          <strong className="text-[22px] font-black text-blue-600 mt-1 block">
            Global → Evento
          </strong>
          <span className="text-[10.5px] text-blue-700 font-semibold">
            Tokens isolados e criptografados
          </span>
        </div>
      </div>

      {/* 3. Integrations Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-8 rounded-card border border-slate-200 text-center text-slate-500 text-xs font-semibold">
            Carregando integrações e tokens...
          </div>
        ) : integrations.length === 0 ? (
          <div className="bg-white p-8 rounded-card border border-dashed border-slate-300 text-center space-y-3">
            <Target size={32} className="mx-auto text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700">Nenhum Pixel ou Token cadastrado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Cadastre seu Pixel Meta, Token CAPI, GA4 ou TikTok para acompanhar as vendas deste evento ou de toda a produtora.
            </p>
            <Button variant="primary" onClick={handleOpenNewModal} icon={<Plus size={15} />}>
              Adicionar Primeiro Pixel / Token
            </Button>
          </div>
        ) : (
          integrations.map((item) => (
            <div
              key={item.id}
              className={`rounded-card border bg-white shadow-xs p-5 transition-all ${
                item.status === 'ativo'
                  ? 'border-[#CBD5E1]/80 hover:border-purple-300'
                  : 'border-slate-200 opacity-60 bg-slate-50/70'
              }`}
            >
              {/* Card Top Row: Name & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDF0F4] pb-3.5">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide">
                      {item.provider === 'meta' ? 'Meta Pixel + CAPI' : item.provider === 'google' ? 'Google GA4' : item.provider.toUpperCase()}
                    </span>
                    <h3 className="text-[16px] font-black text-[#0E1726]">
                      {item.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase px-2.5 py-1 rounded-full ${
                    item.status === 'ativo'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'atencao'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${
                      item.status === 'ativo' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`} />
                    {item.status === 'ativo' ? 'ATIVO' : item.status === 'atencao' ? 'ATENÇÃO' : 'PAUSADO'}
                  </span>
                </div>
              </div>

              {/* Card Middle: Pixel ID & Masked Token */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3.5 border-b border-[#EDF0F4] text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
                    {item.provider === 'google' ? 'Measurement ID' : 'Meta Pixel ID'}:
                  </span>
                  <div className="flex items-center gap-2 font-mono font-bold text-slate-900 bg-slate-50 px-2.5 py-1.5 rounded-btn border border-slate-200 w-fit">
                    <span>{item.pixelId}</span>
                    <button
                      onClick={() => copyToClipboard(item.pixelId, `id-${item.id}`)}
                      className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      title="Copiar ID"
                    >
                      {copiedField === `id-${item.id}` ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-0.5">
                    Token API (CAPI):
                  </span>
                  <div className="flex items-center gap-2 font-mono font-bold text-slate-900 bg-slate-50 px-2.5 py-1.5 rounded-btn border border-slate-200 w-fit">
                    <span>{item.maskedToken || '••••••••••••••••4F8A'}</span>
                    <Lock size={13} className="text-slate-400 ml-1" />
                  </div>
                </div>
              </div>

              {/* Card Scope & Operational Stats */}
              <div className="py-3 text-xs space-y-2">
                <div>
                  <span className="font-bold text-slate-700">Uso: </span>
                  <span className="font-medium text-slate-600">
                    {item.inheritanceMode === 'all_events' 
                      ? 'Todos os eventos da produtora' 
                      : (item.targetEventNames?.join(', ') || 'Eventos selecionados')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11.5px] text-slate-500 bg-slate-50 p-2.5 rounded-card border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-700">Último evento: </span>
                    <span className="font-mono text-purple-700 font-bold">{item.lastEventName || 'Purchase'}</span>
                  </div>
                  <span>•</span>
                  <div>
                    <span className="font-bold text-slate-700">Último envio: </span>
                    <span>{item.lastFiredAt ? new Date(item.lastFiredAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Hoje 11:14'}</span>
                  </div>
                  <span>•</span>
                  <div>
                    <span className="font-bold text-slate-700">Resposta Meta: </span>
                    <span className="font-bold text-emerald-700">{item.lastResponseStatus || '200 OK'}</span>
                  </div>
                  <span>•</span>
                  <div>
                    <span className="font-bold text-slate-700">Eventos enviados hoje: </span>
                    <span className="font-bold text-[#0E1726]">{item.eventsSentToday.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#EDF0F4]">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="px-3 py-1.5 rounded-btn text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit size={13} />
                    Editar
                  </button>

                  <button
                    onClick={() => handleTestConnection(item)}
                    disabled={testingId === item.id || item.status !== 'ativo'}
                    className="px-3 py-1.5 rounded-btn text-xs font-bold bg-purple-50 text-[#7C3AED] border border-purple-200 hover:bg-purple-100 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Zap size={13} className={testingId === item.id ? 'animate-spin' : ''} />
                    {testingId === item.id ? 'Enviando teste...' : 'Testar conexão'}
                  </button>

                  <button
                    onClick={() => handleDuplicate(item.id)}
                    className="px-3 py-1.5 rounded-btn text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CopyCheck size={13} />
                    Duplicar
                  </button>

                  <button
                    onClick={() => handleViewLogs(item)}
                    className="px-3 py-1.5 rounded-btn text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <History size={13} />
                    Ver Logs / Erros
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(item.id, item.status)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                  >
                    {item.status === 'ativo' ? 'Desativar' : 'Ativar'}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 ml-2 cursor-pointer"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. Modal: Nova Integração / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-[#0E1726] flex items-center gap-2">
                <Target size={20} className="text-[#7C3AED]" />
                {editingId ? 'Editar Integração' : 'Nova Integração'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveIntegration} className="space-y-4 text-xs">
              {/* Nome da Integração */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nome da integração *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pixel Agência XYZ"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-btn text-xs font-semibold focus:outline-hidden focus:border-[#7C3AED]"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tipo
                </label>
                <select
                  value={formProvider}
                  onChange={(e) => setFormProvider(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-btn text-xs font-bold text-slate-800"
                >
                  <option value="meta">Meta Pixel + Conversion API (CAPI)</option>
                  <option value="google">Google Analytics 4 (GA4)</option>
                  <option value="tiktok">TikTok Ads Pixel</option>
                  <option value="gtm">Google Tag Manager (GTM)</option>
                  <option value="custom">Outro / Custom Tag</option>
                </select>
              </div>

              {/* Pixel ID */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Pixel ID / Tag ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 123456789012345"
                  value={formPixelId}
                  onChange={(e) => setFormPixelId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-btn text-xs font-mono font-semibold focus:outline-hidden focus:border-[#7C3AED]"
                />
              </div>

              {/* Token da API */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Token da API (CAPI)
                  </label>
                  {editingId && !replaceTokenMode && (
                    <button
                      type="button"
                      onClick={() => setReplaceTokenMode(true)}
                      className="text-[#7C3AED] font-bold hover:underline cursor-pointer"
                    >
                      Substituir token
                    </button>
                  )}
                </div>

                {editingId && !replaceTokenMode ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-btn bg-slate-100 border border-slate-200 font-mono text-slate-600">
                    <Lock size={13} />
                    <span>••••••••••••••••4F8A (Token protegido)</span>
                  </div>
                ) : (
                  <input
                    type="password"
                    placeholder="Cole o token gerado no Gerenciador de Eventos da Meta"
                    value={formApiToken}
                    onChange={(e) => setFormApiToken(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-btn text-xs font-mono focus:outline-hidden focus:border-[#7C3AED]"
                  />
                )}
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  O token é armazenado de forma segura e nunca é exibido em texto puro.
                </span>
              </div>

              {/* Código de teste CAPI */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Código de Teste CAPI (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: TEST94821"
                  value={formTestCode}
                  onChange={(e) => setFormTestCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-btn text-xs font-mono uppercase"
                />
              </div>

              {/* Aplicar em (Herança & Escopo) */}
              <div className="bg-slate-50 p-4 rounded-card border border-slate-200 space-y-3">
                <label className="font-bold text-slate-800 block">
                  Aplicar em:
                </label>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="inheritanceMode"
                      checked={formInheritanceMode === 'all_events'}
                      onChange={() => setFormInheritanceMode('all_events')}
                    />
                    <span className="font-semibold text-slate-800">Todos os eventos da produtora</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="inheritanceMode"
                      checked={formInheritanceMode === 'selected_events'}
                      onChange={() => setFormInheritanceMode('selected_events')}
                    />
                    <span className="font-semibold text-slate-800">Eventos selecionados</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="inheritanceMode"
                      checked={formInheritanceMode === 'current_event'}
                      onChange={() => setFormInheritanceMode('current_event')}
                    />
                    <span className="font-semibold text-slate-800">Apenas evento atual</span>
                  </label>
                </div>

                {/* Eventos Checkboxes */}
                {(formInheritanceMode === 'selected_events' || formInheritanceMode === 'current_event') && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5 max-h-40 overflow-y-auto">
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">Eventos:</span>
                    {events.map((ev) => (
                      <label key={ev.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-white text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formSelectedEventIds.includes(ev.id)}
                          onChange={(e) => {
                            if (e.target.checked) setFormSelectedEventIds([...formSelectedEventIds, ev.id]);
                            else setFormSelectedEventIds(formSelectedEventIds.filter(id => id !== ev.id));
                          }}
                        />
                        <span className="font-bold text-slate-800">#{ev.code}</span>
                        <span className="truncate">{ev.title}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Eventos enviados */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Eventos enviados:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_AVAILABLE_EVENTS.map((ev) => (
                    <label key={ev.key} className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-200 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formTrackedEvents.includes(ev.key)}
                        onChange={(e) => {
                          if (e.target.checked) setFormTrackedEvents([...formTrackedEvents, ev.key]);
                          else setFormTrackedEvents(formTrackedEvents.filter(k => k !== ev.key));
                        }}
                      />
                      <span>{ev.key}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" className="bg-[#7C3AED] hover:bg-[#6D28D9]">
                  Salvar integração
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Logs e Erros da Integração */}
      {logsModalIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-[#0E1726] flex items-center gap-2">
                  <Terminal size={18} className="text-[#7C3AED]" />
                  Logs & Diagnóstico de Disparos CAPI
                </h3>
                <p className="text-xs text-slate-500">
                  {logsModalIntegration.name} (Pixel ID: {logsModalIntegration.pixelId})
                </p>
              </div>
              <button
                onClick={() => setLogsModalIntegration(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>

            {loadingLogs ? (
              <div className="py-8 text-center text-xs text-slate-500">Carregando logs...</div>
            ) : logsList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Nenhum log registrado ainda. Clique em <strong>Testar conexão</strong> para disparar um evento.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
                {logsList.map((log) => (
                  <div key={log.id} className="p-3 rounded-card border border-slate-200 bg-slate-50 text-xs space-y-1.5 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-700">{log.eventName}</span>
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                        HTTP {log.responseCode} {log.status === 'success' ? 'OK' : 'ERROR'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Resposta: <span className="text-slate-800">{log.responseBody}</span>
                    </div>
                    {log.payloadSample && (
                      <div className="text-[10px] text-slate-500 bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                        Payload: {log.payloadSample}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 block text-right">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 flex justify-end border-t border-slate-200">
              <Button variant="secondary" onClick={() => setLogsModalIntegration(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
