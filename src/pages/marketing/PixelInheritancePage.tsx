import React, { useState } from 'react';
import { 
  Sliders, ShieldCheck, CheckCircle2, Globe, 
  Layers, ArrowRight, Save, Info, RefreshCw
} from 'lucide-react';
import type { EventItem } from '../../types/event';
import type { TrackingTagConfig, TrackingInheritanceMode } from '../../types/marketing';
import { mockTrackingTags } from '../../data/marketingData';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface PixelInheritancePageProps {
  events: EventItem[];
  notify?: (msg: string) => void;
}

export const PixelInheritancePage: React.FC<PixelInheritancePageProps> = ({ events, notify }) => {
  const [selectedEventId, setSelectedEventId] = useState<number>(events[0]?.id || 1);
  const [tags, setTags] = useState<TrackingTagConfig[]>(mockTrackingTags);

  const activeEvent = events.find((e) => e.id === selectedEventId);

  const handleModeChange = (tagId: string, mode: TrackingInheritanceMode) => {
    setTags(tags.map(t => t.id === tagId ? { ...t, mode } : t));
  };

  const handleTokenChange = (tagId: string, token: string) => {
    setTags(tags.map(t => t.id === tagId ? { ...t, token } : t));
  };

  const handleSave = () => {
    if (notify) notify(`Configurações de herança de tracking salvas para "${activeEvent?.title}"!`);
  };

  return (
    <div className="w-full space-y-6 select-none font-sans">
      {/* Header & Hierarchy Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              SISTEMA DE HERANÇA (FASE 4)
            </span>
          </div>
          <h2 className="text-[20px] font-extrabold text-[#0E1726] tracking-tight">
            Pixel, Analytics & Tags de Conversão
          </h2>
          <p className="text-[12px] text-[#718096] mt-0.5">
            Defina como cada evento herda ou customiza as tags de rastreamento configuradas na Produtora.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-btn px-3 py-1.5 shadow-xs">
            <span className="text-xs font-bold text-slate-700">Evento Alvo:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-[#0E1726] outline-none cursor-pointer"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            onClick={handleSave}
            icon={<Save size={15} />}
            className="bg-[#7C3AED] hover:bg-[#6D28D9]"
          >
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Visual Hierarchy Diagram */}
      <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
        <h4 className="text-[13px] font-bold text-[#0E1726] uppercase tracking-wider mb-3">
          Fluxo de Herança em 3 Níveis
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-card">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Nível 1</span>
            <strong className="text-sm text-slate-800 block mt-0.5">Configuração Global DiskIngressos</strong>
            <span className="text-[11px] text-slate-500">Padrões do sistema e infraestrutura</span>
          </div>
          <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-card">
            <span className="text-[10px] font-bold text-purple-700 uppercase block">Nível 2</span>
            <strong className="text-sm text-purple-950 block mt-0.5">Conta da Produtora</strong>
            <span className="text-[11px] text-purple-700">Pixels principais da organização</span>
          </div>
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-card shadow-xs">
            <span className="text-[10px] font-bold text-blue-700 uppercase block">Nível 3 (Evento Atual)</span>
            <strong className="text-sm text-blue-950 block mt-0.5">{activeEvent?.title}</strong>
            <span className="text-[11px] text-blue-700">Pode herdar, customizar ou desativar</span>
          </div>
        </div>
      </div>

      {/* Tags Configuration Matrix */}
      <div className="space-y-4">
        {tags.map((tag) => (
          <Card key={tag.id} padding="md" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-[#EDF0F4] pb-3">
              <div>
                <strong className="text-[15px] font-bold text-[#0E1726] block">{tag.name}</strong>
                <span className="text-[11px] text-[#718096] font-mono">Tipo: {tag.type} • ID: {tag.id}</span>
              </div>
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                tag.mode === 'inherit' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : tag.mode === 'custom' 
                  ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                  : 'bg-slate-100 text-slate-600 border border-slate-300'
              }`}>
                <CheckCircle2 size={12} />
                {tag.mode === 'inherit' ? 'Herdando da Produtora' : tag.mode === 'custom' ? 'Configuração Própria' : 'Desativado'}
              </span>
            </div>

            {/* Radio Options: 3 Choices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className={`flex items-start gap-3 p-3 rounded-card border cursor-pointer transition ${
                tag.mode === 'inherit' ? 'bg-blue-50/60 border-[#1677FF]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}>
                <input
                  type="radio"
                  name={`mode_${tag.id}`}
                  checked={tag.mode === 'inherit'}
                  onChange={() => handleModeChange(tag.id, 'inherit')}
                  className="mt-0.5 text-[#1677FF]"
                />
                <div>
                  <strong className="text-xs font-bold text-[#0E1726] block">◉ Herdar configuração</strong>
                  <span className="text-[11px] text-slate-500">Utiliza o ID e token global configurado na produtora.</span>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-card border cursor-pointer transition ${
                tag.mode === 'custom' ? 'bg-purple-50/60 border-[#7C3AED]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}>
                <input
                  type="radio"
                  name={`mode_${tag.id}`}
                  checked={tag.mode === 'custom'}
                  onChange={() => handleModeChange(tag.id, 'custom')}
                  className="mt-0.5 text-[#7C3AED]"
                />
                <div>
                  <strong className="text-xs font-bold text-[#0E1726] block">○ Utilizar configuração própria</strong>
                  <span className="text-[11px] text-slate-500">Insira um Pixel/ID exclusivo para este evento.</span>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-card border cursor-pointer transition ${
                tag.mode === 'disabled' ? 'bg-rose-50/60 border-rose-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}>
                <input
                  type="radio"
                  name={`mode_${tag.id}`}
                  checked={tag.mode === 'disabled'}
                  onChange={() => handleModeChange(tag.id, 'disabled')}
                  className="mt-0.5 text-rose-600"
                />
                <div>
                  <strong className="text-xs font-bold text-[#0E1726] block">○ Desativar para este evento</strong>
                  <span className="text-[11px] text-slate-500">Não dispara scripts nem registra eventos de compra.</span>
                </div>
              </label>
            </div>

            {/* Input Token (Active when custom) */}
            {tag.mode === 'custom' && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ID do Pixel / Tag Exclusiva do Evento *
                </label>
                <input
                  type="text"
                  value={tag.token}
                  onChange={(e) => handleTokenChange(tag.id, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs font-mono text-slate-900 outline-none focus:border-[#7C3AED]"
                  placeholder="Ex: 891029381029381 ou G-XXXXXXX"
                />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
