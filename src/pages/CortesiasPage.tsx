import React, { useState } from 'react';
import { 
  Gift, Plus, Search, Filter, Download, 
  Trash2, Mail, CheckCircle2, AlertCircle, ArrowLeft,
  Users, Tag, ShieldCheck, Ticket, Send
} from 'lucide-react';
import type { EventItem } from '../types/event';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

interface CourtesyItem {
  id: number;
  code: string;
  recipientName: string;
  email: string;
  cpf: string;
  category: string;
  sector: string;
  issuedAt: string;
  status: 'enviado' | 'utilizado' | 'cancelado';
}

interface CortesiasPageProps {
  event: EventItem;
  onBack?: () => void;
  notify?: (msg: string) => void;
}

export const CortesiasPage: React.FC<CortesiasPageProps> = ({
  event,
  onBack,
  notify,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form State
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientCpf, setRecipientCpf] = useState('');
  const [sector, setSector] = useState('VIP');
  const [quantity, setQuantity] = useState(1);

  const [cortesias, setCortesias] = useState<CourtesyItem[]>([
    { id: 1, code: 'CRT-1760-001', recipientName: 'Carlos Eduardo Silveira', email: 'carlos.silveira@patrocinio.com.br', cpf: '043.***.***-21', category: 'Patrocinador Master', sector: 'Camarote Open Bar', issuedAt: '24/08/2026 14:30', status: 'enviado' },
    { id: 2, code: 'CRT-1760-002', recipientName: 'Mariana Guimarães Rocha', email: 'mariana.imprensa@gazeta.com.br', cpf: '112.***.***-55', category: 'Imprensa / Mídia', sector: 'Pista Premium', issuedAt: '25/08/2026 10:15', status: 'utilizado' },
    { id: 3, code: 'CRT-1760-003', recipientName: 'Felipe Augusto Antunes', email: 'felipe.antunes@artista.com', cpf: '098.***.***-34', category: 'Convidado Artista', sector: 'Área VIP', issuedAt: '26/08/2026 18:20', status: 'enviado' },
    { id: 4, code: 'CRT-1760-004', recipientName: 'Juliana Beatriz Santos', email: 'juliana.santos@curitiba.gov.br', cpf: '345.***.***-89', category: 'Órgãos Públicos', sector: 'Pista Geral', issuedAt: '27/08/2026 09:00', status: 'enviado' },
  ]);

  const handleIssueCourtesy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !recipientEmail) {
      if (notify) notify('Preencha o nome e e-mail do destinatário.');
      return;
    }

    const newItems: CourtesyItem[] = [];
    for (let i = 0; i < quantity; i++) {
      const id = Date.now() + i;
      newItems.push({
        id,
        code: `CRT-${event.code || '1760'}-${String(cortesias.length + i + 1).padStart(3, '0')}`,
        recipientName: quantity > 1 ? `${recipientName} (Convite ${i + 1})` : recipientName,
        email: recipientEmail,
        cpf: recipientCpf || 'Não informado',
        category: 'Convidado VIP',
        sector,
        issuedAt: 'Agora mesmo',
        status: 'enviado',
      });
    }

    setCortesias((prev) => [...newItems, ...prev]);
    setIsNewModalOpen(false);
    setRecipientName('');
    setRecipientEmail('');
    setRecipientCpf('');
    setQuantity(1);
    if (notify) notify(`${quantity} cortesia(s) emitida(s) com sucesso para ${recipientEmail}!`);
  };

  const filteredCortesias = cortesias.filter((c) => {
    const q = search.toLowerCase().trim();
    const matchQ = !q || c.recipientName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    const matchCat = selectedCategory === 'todos' || c.sector === selectedCategory;
    return matchQ && matchCat;
  });

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <span className="text-[#1677FF] font-mono">#{event.code}</span>
            <span>•</span>
            <span>{event.title}</span>
          </div>
          <h1 className="text-[22px] font-black text-[#0E1726] tracking-tight">
            Gestão & Emissão de Cortesias
          </h1>
          <p className="text-xs text-[#718096] mt-0.5">
            Emita cortesias nominais rastreadas com QR Code e biometria para convidados, patrocinadores e imprensa.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onBack && (
            <Button variant="secondary" onClick={onBack} icon={<ArrowLeft size={15} />}>
              Voltar
            </Button>
          )}
          <Button variant="primary" onClick={() => setIsNewModalOpen(true)} icon={<Plus size={15} />}>
            Emitir Cortesia
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-card border border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">Cortesias Emitidas</span>
          <strong className="text-[22px] font-black text-[#0E1726] mt-1 block">{cortesias.length}</strong>
          <span className="text-[10.5px] text-emerald-600 font-semibold">100% entregues</span>
        </div>
        <div className="bg-white p-4 rounded-card border border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">Utilizadas na Portaria</span>
          <strong className="text-[22px] font-black text-blue-600 mt-1 block">
            {cortesias.filter(c => c.status === 'utilizado').length}
          </strong>
          <span className="text-[10.5px] text-slate-500 font-semibold">Validação biométrica</span>
        </div>
        <div className="bg-white p-4 rounded-card border border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">Pendentes de Entrada</span>
          <strong className="text-[22px] font-black text-amber-600 mt-1 block">
            {cortesias.filter(c => c.status === 'enviado').length}
          </strong>
          <span className="text-[10.5px] text-slate-500 font-semibold">Aguardando check-in</span>
        </div>
        <div className="bg-white p-4 rounded-card border border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">Cota Máxima Autorizada</span>
          <strong className="text-[22px] font-black text-purple-600 mt-1 block">150</strong>
          <span className="text-[10.5px] text-slate-500 font-semibold">Restam {150 - cortesias.length} vagas</span>
        </div>
      </div>

      {/* Filter and Table Container */}
      <div className="bg-white rounded-card border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC]">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou código CRT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#CBD5E1] rounded-btn text-xs font-semibold text-[#0E1726] focus:outline-hidden focus:border-[#1677FF]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-white border border-[#CBD5E1] rounded-btn text-xs font-bold text-slate-700"
            >
              <option value="todos">Todos os Setores</option>
              <option value="Camarote Open Bar">Camarote Open Bar</option>
              <option value="Pista Premium">Pista Premium</option>
              <option value="Área VIP">Área VIP</option>
              <option value="Pista Geral">Pista Geral</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1F5F9] text-slate-600 font-bold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Destinatário</th>
                <th className="py-3 px-4">Setor / Lote</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Data Emissão</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredCortesias.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#1677FF]">{c.code}</td>
                  <td className="py-3 px-4">
                    <strong className="text-[#0E1726] block font-bold">{c.recipientName}</strong>
                    <span className="text-[11px] text-slate-500 block">{c.email} • {c.cpf}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{c.sector}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {c.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">{c.issuedAt}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      c.status === 'utilizado'
                        ? 'bg-blue-100 text-blue-800'
                        : c.status === 'enviado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => notify ? notify(`Reenviando e-mail de cortesia para ${c.email}...`) : null}
                      className="p-1.5 rounded-btn hover:bg-slate-200 text-slate-600 transition"
                      title="Reenviar por E-mail"
                    >
                      <Mail size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Emissão */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#0E1726] flex items-center gap-2">
                <Gift size={18} className="text-[#1677FF]" />
                Emitir Nova Cortesia
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueCourtesy} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome Completo do Destinatário *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ana Clara Menezes"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-btn text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">E-mail para Envio do Ingresso *</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: ana.clara@email.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-btn text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CPF (Opcional)</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={recipientCpf}
                    onChange={(e) => setRecipientCpf(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-btn text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantidade</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-btn text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Setor Autorizado</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-btn text-xs font-bold text-slate-700"
                >
                  <option value="VIP">Área VIP</option>
                  <option value="Camarote Open Bar">Camarote Open Bar</option>
                  <option value="Pista Premium">Pista Premium</option>
                  <option value="Pista Geral">Pista Geral</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button variant="secondary" type="button" onClick={() => setIsNewModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" icon={<Send size={14} />}>
                  Emitir e Disparar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
