import React, { useState } from 'react';
import { 
  X, Plus, Calendar, MapPin, Ticket, 
  Sparkles, Layers3, ScanFace, Target, Check
} from 'lucide-react';
import type { EventCategory, EventItem, TicketBatch } from '../../types/event';
import type { Producer } from '../../types/producer';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newEvent: EventItem) => void;
  selectedProducer: Producer;
  producers: Producer[];
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedProducer,
  producers,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Show & Música');
  const [venue, setVenue] = useState('Ópera de Arame');
  const [city, setCity] = useState('Curitiba');
  const [state, setState] = useState('PR');
  const [address, setAddress] = useState('Rua João Gava, 920 - Abranches');
  const [date, setDate] = useState('2027-08-20T20:00');
  const [totalCapacity, setTotalCapacity] = useState('1500');
  const [producerId, setProducerId] = useState(selectedProducer.id);
  const [coverType, setCoverType] = useState<'nature' | 'maiden' | 'conference' | 'festival' | 'standup' | 'electronic'>('festival');
  const [enableFacial, setEnableFacial] = useState(true);
  const [badge, setBadge] = useState('NOVO EVENTO');

  // Initial Batch
  const [initialBatchPrice, setInitialBatchPrice] = useState('120.00');
  const [initialBatchQty, setInitialBatchQty] = useState('500');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const prod = producers.find(p => p.id === producerId) || selectedProducer;
    const priceNum = parseFloat(initialBatchPrice) || 0;
    const qtyNum = parseInt(initialBatchQty, 10) || 500;
    const capacityNum = parseInt(totalCapacity, 10) || qtyNum;

    const formattedDate = date ? `${date.replace('T', ' ')}` : '20/08/2027 20:00';

    const newBatches: TicketBatch[] = [
      {
        id: `b-${Date.now()}`,
        name: 'Ingresso Geral - 1º Lote',
        category: 'Pista',
        price: priceNum,
        fee: priceNum * 0.1,
        totalQuantity: qtyNum,
        soldQuantity: 0,
        courtesyQuantity: 0,
        availableQuantity: qtyNum,
        status: 'ativo'
      }
    ];

    const newEvent: EventItem = {
      id: Date.now(),
      code: String(Math.floor(1000 + Math.random() * 9000)),
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      category,
      venue,
      city,
      state,
      address,
      date: formattedDate,
      status: 'ativo',
      producerId: prod.id,
      producerName: prod.name,
      totalRevenue: 0,
      salesCount: 0,
      availableCount: qtyNum,
      courtesyCount: 0,
      totalCapacity: capacityNum,
      occupancyRate: 0,
      averageTicketPrice: priceNum,
      coverType,
      badge: badge.trim() || undefined,
      featured: true,
      batches: newBatches,
      metaPixel: {
        pixelId: '',
        activeUtms: []
      },
      facialRecognition: {
        enabled: enableFacial,
        registeredCount: 0,
        pendingCount: 0,
        validationRate: 0
      },
      createdAt: new Date().toISOString()
    };

    onSave(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-md">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Cadastrar Novo Evento</h2>
              <p className="text-xs text-slate-300">
                Configure os dados básicos, local, data e o 1º lote de ingressos
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Main info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Identificação do Evento
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome Principal do Evento *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Turnê Nacional 2027 — Show Especial"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtítulo / Slogan
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Uma noite inesquecível em Curitiba"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Show & Música">Show & Música</option>
                  <option value="Festival">Festival</option>
                  <option value="Teatro & Espetáculo">Teatro & Espetáculo</option>
                  <option value="Stand-up & Comédia">Stand-up & Comédia</option>
                  <option value="Conferência & Palestra">Conferência & Palestra</option>
                  <option value="Gastronômico">Gastronômico</option>
                  <option value="Esportivo">Esportivo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Produtora Responsável
                </label>
                <select
                  value={producerId}
                  onChange={(e) => setProducerId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  {producers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.cnpj})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Badge de Destaque no Card
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Ex: LANÇAMENTO, ÚLTIMOS INGRESSOS"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Location & Date */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Data e Localização
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Local / Espaço *
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Ex: Ópera de Arame, Teatro Positivo..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Data e Horário de Início *
                </label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número e bairro"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cidade / UF
                </label>
                <input
                  type="text"
                  value={`${city}/${state}`}
                  onChange={(e) => {
                    const [c, s] = e.target.value.split('/');
                    if (c) setCity(c.trim());
                    if (s) setState(s.trim());
                  }}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Initial Batch & Capacity */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Capacidade e 1º Lote
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Capacidade Total do Local
                </label>
                <input
                  type="number"
                  value={totalCapacity}
                  onChange={(e) => setTotalCapacity(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Valor do 1º Lote (R$)
                </label>
                <input
                  type="number"
                  step="0.50"
                  value={initialBatchPrice}
                  onChange={(e) => setInitialBatchPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Qtd. Ingressos 1º Lote
                </label>
                <input
                  type="number"
                  value={initialBatchQty}
                  onChange={(e) => setInitialBatchQty(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Theme & Extras */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              4. Identidade Visual & Recursos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tema Visual da Capa
                </label>
                <select
                  value={coverType}
                  onChange={(e) => setCoverType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="festival">Festival / Roxo Neon</option>
                  <option value="maiden">Show Rock / Ouro & Chamas</option>
                  <option value="nature">Natureza / Verde e Arte</option>
                  <option value="conference">Conferência / Azul & Dourado</option>
                  <option value="standup">Stand-up Comedy / Dark Amber</option>
                  <option value="electronic">Eletrônico / Sunset</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableFacial}
                    onChange={(e) => setEnableFacial(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <ScanFace size={14} className="text-cyan-600" />
                      Ativar Validação por Biometria Facial
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      Permite entrada rápida e antifraude por reconhecimento facial
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-md shadow-blue-600/30 flex items-center gap-2"
            >
              <Check size={16} />
              Publicar e Liberar Vendas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
