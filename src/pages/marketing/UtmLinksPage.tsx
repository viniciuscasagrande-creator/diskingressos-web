import React, { useState } from 'react';
import { 
  Link, QrCode, Copy, Check, Plus, ExternalLink, 
  MousePointerClick, ShoppingCart, DollarSign, Download
} from 'lucide-react';
import type { UtmLink } from '../../types/marketing';
import { mockUtmLinks } from '../../data/marketingData';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';

interface UtmLinksPageProps {
  notify?: (msg: string) => void;
}

export const UtmLinksPage: React.FC<UtmLinksPageProps> = ({ notify }) => {
  const [links, setLinks] = useState<UtmLink[]>(mockUtmLinks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://diskingressos.com.br/evento/sem-parar-2026');
  const [utmSource, setUtmSource] = useState('instagram');
  const [utmMedium, setUtmMedium] = useState('stories');
  const [utmCampaign, setUtmCampaign] = useState('lancamento');

  const generatedUrl = `${baseUrl}?utm_source=${encodeURIComponent(utmSource)}&utm_medium=${encodeURIComponent(utmMedium)}&utm_campaign=${encodeURIComponent(utmCampaign)}`;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (notify) notify('Link rastreável copiado para a área de transferência!');
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newLink: UtmLink = {
      id: `LNK-0${links.length + 1}`,
      title,
      baseUrl,
      utmSource,
      utmMedium,
      utmCampaign,
      fullUrl: generatedUrl,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };

    setLinks([newLink, ...links]);
    setIsModalOpen(false);
    setTitle('');
    if (notify) notify(`Link rastreável "${newLink.title}" gerado com sucesso!`);
  };

  const formatBrl = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const headers = [
    'Identificador / Título',
    'Parâmetros UTM',
    <div key="cl" className="text-center">Cliques</div>,
    <div key="cv" className="text-center">Conversões</div>,
    <div key="rc" className="text-right">Receita Gerada</div>,
    <div key="ac" className="text-right pr-2">Ações</div>
  ];

  return (
    <div className="w-full space-y-6 select-none font-sans">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              RASTREAMENTO DE TRÁFEGO
            </span>
          </div>
          <h2 className="text-[20px] font-extrabold text-[#0E1726] tracking-tight">
            Links Rastreáveis, UTMs & QR Codes
          </h2>
          <p className="text-[12px] text-[#718096] mt-0.5">
            Gere URLs personalizadas para parceiros, influenciadores, totens físicos e anúncios digitais.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus size={15} />}
          className="bg-[#1677FF] hover:bg-[#1260D6]"
        >
          Criar Link Rastreável
        </Button>
      </div>

      {/* Links Table */}
      <DataTable headers={headers} empty={links.length === 0}>
        {links.map((link) => (
          <tr key={link.id} className="hover:bg-slate-50 transition-colors">
            <td className="py-3.5 px-4">
              <strong className="block text-sm font-bold text-[#0E1726]">{link.title}</strong>
              <span className="text-[11px] text-[#718096] font-mono">{link.fullUrl.slice(0, 50)}...</span>
            </td>

            <td className="py-3.5 px-4">
              <span className="inline-block bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-mono px-2 py-0.5 rounded">
                source={link.utmSource} • campaign={link.utmCampaign}
              </span>
            </td>

            <td className="py-3.5 px-4 text-center font-bold text-slate-800 text-xs">
              {link.clicks.toLocaleString('pt-BR')}
            </td>

            <td className="py-3.5 px-4 text-center font-extrabold text-[#10B981] text-xs">
              {link.conversions} vendas ({((link.conversions / (link.clicks || 1)) * 100).toFixed(1)}%)
            </td>

            <td className="py-3.5 px-4 text-right font-bold text-[#0E1726] text-xs">
              {formatBrl(link.revenue)}
            </td>

            <td className="py-3.5 pr-4 pl-2 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(link.id, link.fullUrl)}
                  icon={copiedId === link.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                >
                  {copiedId === link.id ? 'Copiado!' : 'Copiar'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (notify) notify(`QR Code para "${link.title}" baixado em alta resolução PNG!`);
                  }}
                  icon={<QrCode size={14} />}
                  title="Baixar QR Code"
                />
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      {/* Create Link Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Gerador de Links UTM & QR Code"
        description="Preencha os parâmetros abaixo para gerar uma URL monitorada com atribuição de vendas."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Título do Link *</label>
            <input
              type="text"
              required
              placeholder="Ex: Parceria Influenciador Fulano"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">URL de Destino do Evento</label>
            <input
              type="url"
              required
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs text-slate-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">UTM Source</label>
              <input
                type="text"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs text-slate-900 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">UTM Medium</label>
              <input
                type="text"
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs text-slate-900 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">UTM Campaign</label>
              <input
                type="text"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs text-slate-900 outline-none font-mono"
              />
            </div>
          </div>

          {/* Preview of Generated URL */}
          <div className="bg-slate-100 p-3 rounded-btn border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">URL Rastreável Gerada:</span>
            <span className="text-[11px] font-mono text-slate-800 break-all">{generatedUrl}</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Salvar Link
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
