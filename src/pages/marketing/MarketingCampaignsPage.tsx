import React, { useState } from 'react';
import { 
  Megaphone, Plus, Filter, Search, Play, Pause, 
  Trash2, ExternalLink, ArrowUpRight, DollarSign, 
  Calendar, Check, X, Tag
} from 'lucide-react';
import type { EventItem } from '../../types/event';
import type { MarketingCampaign, MarketingChannel } from '../../types/marketing';
import { mockMarketingCampaigns } from '../../data/marketingData';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';

interface MarketingCampaignsPageProps {
  events: EventItem[];
  notify?: (msg: string) => void;
}

export const MarketingCampaignsPage: React.FC<MarketingCampaignsPageProps> = ({ events, notify }) => {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(mockMarketingCampaigns);
  const [search, setSearch] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<MarketingChannel>('instagram');
  const [eventId, setEventId] = useState<number>(events[0]?.id || 1);
  const [budget, setBudget] = useState('5000');
  const [utmSource, setUtmSource] = useState('instagram');
  const [utmCampaign, setUtmCampaign] = useState('');

  const formatBrl = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const filtered = campaigns.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.utmCampaign.toLowerCase().includes(search.toLowerCase());
    const matchChannel = selectedChannel === 'all' || c.channel === selectedChannel;
    return matchSearch && matchChannel;
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const eventObj = events.find((ev) => ev.id === eventId);
    const newCamp: MarketingCampaign = {
      id: `CMP-00${campaigns.length + 1}`,
      name,
      channel,
      channelLabel: channel === 'instagram' ? 'Instagram' : channel === 'google' ? 'Google Ads' : channel === 'whatsapp' ? 'WhatsApp' : 'E-mail',
      eventId,
      eventName: eventObj?.title || 'Evento Geral',
      status: 'active',
      budget: Number(budget) || 0,
      spent: 0,
      salesCount: 0,
      revenue: 0,
      roi: 0,
      ctr: 0,
      cpa: 0,
      startDate: new Date().toLocaleDateString('pt-BR'),
      utmSource: utmSource || channel,
      utmCampaign: utmCampaign || name.toLowerCase().replace(/\s+/g, '_'),
    };

    setCampaigns([newCamp, ...campaigns]);
    setIsModalOpen(false);
    setName('');
    setUtmCampaign('');
    if (notify) notify(`Campanha "${newCamp.name}" criada com sucesso!`);
  };

  const headers = [
    'Campanha / Nome',
    'Canal & UTM',
    <div key="ev">Evento Alvo</div>,
    <div key="bg" className="text-right">Orçamento / Gasto</div>,
    <div key="rc" className="text-right">Receita</div>,
    <div key="st" className="text-center">Status</div>,
    <div key="ac" className="text-right pr-2">Ações</div>
  ];

  return (
    <div className="w-full space-y-6 select-none font-sans">
      {/* Top Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
        <div>
          <h2 className="text-[20px] font-extrabold text-[#0E1726] tracking-tight">
            Gerenciamento de Campanhas
          </h2>
          <p className="text-[12px] text-[#718096] mt-0.5">
            Crie, monitore e atribua conversões para campanhas de mídia paga, WhatsApp e e-mail.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus size={15} />}
          className="bg-[#7C3AED] hover:bg-[#6D28D9]"
        >
          Nova Campanha
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-white border border-[#CBD5E1] rounded-btn px-3 py-2 w-full sm:w-80 shadow-xs">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome da campanha ou UTM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-[#0E1726] outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filtrar Canal:</span>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="bg-white border border-[#CBD5E1] rounded-btn px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs cursor-pointer"
          >
            <option value="all">Todos os Canais</option>
            <option value="instagram">Instagram Ads</option>
            <option value="google">Google Ads</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="facebook">Meta Pixel</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      <DataTable headers={headers} empty={filtered.length === 0}>
        {filtered.map((cmp) => (
          <tr key={cmp.id} className="hover:bg-slate-50 transition-colors">
            <td className="py-3.5 px-4">
              <strong className="block text-sm font-bold text-[#0E1726]">{cmp.name}</strong>
              <span className="text-[11px] text-[#718096] font-mono">ID: {cmp.id} • Início: {cmp.startDate}</span>
            </td>

            <td className="py-3.5 px-4">
              <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-purple-50 text-[#7C3AED] border border-purple-200">
                {cmp.channelLabel}
              </span>
              <span className="block text-[11px] text-slate-500 font-mono mt-0.5">utm_campaign={cmp.utmCampaign}</span>
            </td>

            <td className="py-3.5 px-4">
              <span className="text-xs font-semibold text-slate-800">{cmp.eventName || 'Global'}</span>
            </td>

            <td className="py-3.5 px-4 text-right">
              <span className="block text-xs font-bold text-slate-900">{formatBrl(cmp.budget)}</span>
              <span className="block text-[11px] text-slate-400">Gasto: {formatBrl(cmp.spent)}</span>
            </td>

            <td className="py-3.5 px-4 text-right">
              <span className="block text-xs font-extrabold text-[#10B981]">{formatBrl(cmp.revenue)}</span>
              <span className="block text-[11px] text-slate-500">{cmp.salesCount} vendas</span>
            </td>

            <td className="py-3.5 px-4 text-center">
              <Badge variant={cmp.status === 'active' ? 'success' : 'neutral'}>
                {cmp.status === 'active' ? 'Ativa' : 'Pausada'}
              </Badge>
            </td>

            <td className="py-3.5 pr-4 pl-2 text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCampaigns(campaigns.map(c => c.id === cmp.id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c));
                  if (notify) notify(`Status da campanha "${cmp.name}" atualizado.`);
                }}
              >
                {cmp.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
              </Button>
            </td>
          </tr>
        ))}
      </DataTable>

      {/* Create Campaign Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Criar Nova Campanha de Marketing"
        description="Configure o canal de tráfego, UTMs e orçamento planejado para este evento."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Campanha *</label>
            <input
              type="text"
              required
              placeholder="Ex: Lançamento Lote Promocional - Instagram"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Canal de Divulgação *</label>
              <select
                value={channel}
                onChange={(e) => {
                  const val = e.target.value as MarketingChannel;
                  setChannel(val);
                  setUtmSource(val);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs text-slate-900 outline-none cursor-pointer"
              >
                <option value="instagram">Instagram Ads / Stories</option>
                <option value="google">Google Ads (Search & Display)</option>
                <option value="whatsapp">WhatsApp Direct / Disparos</option>
                <option value="facebook">Meta Pixel Ads</option>
                <option value="email">E-mail Marketing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Evento Vinculado *</label>
              <select
                value={eventId}
                onChange={(e) => setEventId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs text-slate-900 outline-none cursor-pointer"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Orçamento Planejado (R$)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parâmetro UTM Campaign</label>
              <input
                type="text"
                placeholder="Ex: lancamento_lote1"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs text-slate-900 outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="bg-[#7C3AED] hover:bg-[#6D28D9]">
              Criar e Publicar Campanha
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
