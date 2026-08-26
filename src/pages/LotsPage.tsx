import React, { useState } from 'react';
import { 
  Layers3, Plus, Trash2, ArrowLeft, 
  Check, Ticket, AlertCircle, ShoppingBag, ShieldCheck
} from 'lucide-react';
import type { EventItem, TicketBatch } from '../types/event';
import { PageHeader } from '../components/ui/PageHeader';
import { KpiCard } from '../components/ui/KpiCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

interface LotsPageProps {
  events: EventItem[];
  selectedEvent: EventItem | null;
  onSelectEvent: (event: EventItem) => void;
  onBack: () => void;
  onSaveBatches: (eventId: number, batches: TicketBatch[]) => void;
}

export const LotsPage: React.FC<LotsPageProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  onBack,
  onSaveBatches,
}) => {
  const activeEvent = selectedEvent || events[0];
  const [batches, setBatches] = useState<TicketBatch[]>(activeEvent?.batches || []);
  const [showAddForm, setShowAddForm] = useState(false);

  // New batch form state
  const [name, setName] = useState('');
  const [type, setType] = useState('Pista');
  const [price, setPrice] = useState('100.00');
  const [qty, setQty] = useState('500');
  const [start, setStart] = useState('2026-08-01');
  const [end, setEnd] = useState('2026-10-30');

  // Handle Event Selector switch
  const handleEventSwitch = (eventId: number) => {
    const ev = events.find((e) => e.id === eventId);
    if (ev) {
      onSelectEvent(ev);
      setBatches(ev.batches || []);
    }
  };

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const priceNum = parseFloat(price) || 0;
    const qtyNum = parseInt(qty, 10) || 0;

    const newBatch: TicketBatch = {
      id: `b-${Date.now()}`,
      name: name.trim(),
      type: type as any,
      category: type as any,
      price: priceNum,
      fee: priceNum * 0.1,
      totalQuantity: qtyNum,
      qty: qtyNum,
      soldQuantity: 0,
      sold: 0,
      availableQuantity: qtyNum,
      startDate: start,
      endDate: end,
      status: 'ativo',
    };

    const updated = [...batches, newBatch];
    setBatches(updated);
    onSaveBatches(activeEvent.id, updated);

    setName('');
    setPrice('100.00');
    setQty('500');
    setShowAddForm(false);
  };

  const handleRemoveBatch = (id: string | number) => {
    const updated = batches.filter((b) => b.id !== id);
    setBatches(updated);
    onSaveBatches(activeEvent.id, updated);
  };

  const handleToggleStatus = (id: string | number) => {
    const updated = batches.map((b) => {
      if (b.id === id) {
        const next = b.status === 'ativo' ? 'pausado' : 'ativo';
        return { ...b, status: next as any };
      }
      return b;
    });
    setBatches(updated);
    onSaveBatches(activeEvent.id, updated);
  };

  const totalCapacity = batches.reduce((acc, b) => acc + (b.totalQuantity || b.qty || 0), 0);
  const totalSold = batches.reduce((acc, b) => acc + (b.soldQuantity || b.sold || 0), 0);
  const totalAvailable = batches.reduce((acc, b) => acc + (b.availableQuantity || 0), 0);

  const tableHeaders = [
    'Lote / Setor',
    'Preço Unitário',
    <div key="prog" className="text-center">Progresso de Vendas</div>,
    <div key="disp" className="text-center">Disponível</div>,
    <div key="vig" className="text-center">Vigência</div>,
    <div key="st" className="text-center">Status</div>,
    <div key="ac" className="text-right pr-2">Ação</div>
  ];

  return (
    <div className="w-full space-y-6">
      {/* Back link */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-[#1677FF] hover:underline"
      >
        <ArrowLeft size={16} />
        Voltar para Todos os Eventos
      </button>

      {/* Page Header */}
      <PageHeader
        eyebrow="EVENTOS / GESTÃO DE INGRESSOS"
        title="Configuração de Lotes & Preços"
        subtitle="Gerencie setores, limites de vendas, precificação e períodos de vigência dos lotes."
        actions={
          <Button
            variant="primary"
            onClick={() => setShowAddForm(!showAddForm)}
            icon={<Plus size={16} />}
          >
            {showAddForm ? 'Fechar Formulário' : 'Novo Lote'}
          </Button>
        }
      />

      {/* Event Selector Card */}
      <Card padding="sm" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
            Evento Selecionado
          </span>
          <strong className="text-[16px] font-bold text-[#0E1726]">
            {activeEvent.title}
          </strong>
          <span className="text-[12px] text-[#718096] block">
            {activeEvent.venue} — #{activeEvent.code}
          </span>
        </div>

        <div className="min-w-[280px]">
          <Select
            value={activeEvent.id}
            onChange={(e) => handleEventSwitch(Number(e.target.value))}
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                #{e.code} — {e.title}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="TOTAL DE INGRESSOS"
          value={`${totalCapacity.toLocaleString('pt-BR')} un.`}
          note="capacidade dos lotes"
          accent="blue"
          icon={<Layers3 size={20} />}
        />
        <KpiCard
          label="INGRESSOS VENDIDOS"
          value={`${totalSold.toLocaleString('pt-BR')} un.`}
          note="processados na plataforma"
          accent="green"
          icon={<ShoppingBag size={20} />}
        />
        <KpiCard
          label="SALDO DISPONÍVEL"
          value={`${totalAvailable.toLocaleString('pt-BR')} un.`}
          note="restantes para venda"
          accent="cyan"
          icon={<Ticket size={20} />}
        />
      </div>

      {/* Inline Batch Creation Form */}
      {showAddForm && (
        <Card padding="md" className="border-[#1677FF]/40 animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[16px] font-bold text-[#0E1726]">Adicionar Novo Lote ou Setor</h3>
              <p className="text-[12px] text-[#718096]">Defina a categoria, preço e quantidade limite.</p>
            </div>
          </div>

          <form onSubmit={handleAddBatch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2">
              <Input
                label="Nome do Lote"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Pista Premium - 2º Lote"
                required
              />
            </div>

            <div>
              <Select
                label="Setor / Tipo"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Pista">Pista</option>
                <option value="VIP">VIP</option>
                <option value="Camarote">Camarote</option>
                <option value="Plateia">Plateia</option>
                <option value="Cortesia">Cortesia</option>
              </Select>
            </div>

            <div>
              <Input
                label="Valor Unitário (R$)"
                type="number"
                step="0.50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                label="Quantidade"
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                required
              />
            </div>

            <div className="flex items-end">
              <Button type="submit" variant="primary" fullWidth icon={<Plus size={15} />}>
                Salvar Lote
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Standardized DataTable of Batches */}
      <DataTable
        headers={tableHeaders}
        empty={batches.length === 0}
        emptyMessage="Nenhum lote configurado para este evento."
      >
        {batches.map((batch) => {
          const totalQ = batch.totalQuantity || batch.qty || 0;
          const soldQ = batch.soldQuantity || batch.sold || 0;
          const percent = totalQ > 0 ? Math.round((soldQ / totalQ) * 100) : 0;

          return (
            <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
              {/* Name */}
              <td className="py-3.5 px-4">
                <strong className="block text-[#0E1726] font-bold">{batch.name}</strong>
                <span className="inline-block text-[11px] text-[#718096] bg-slate-100 rounded px-1.5 py-0.2 mt-0.5">
                  {batch.type || batch.category || 'Pista'}
                </span>
              </td>

              {/* Price */}
              <td className="py-3.5 px-4 font-bold text-[#0E1726]">
                R$ {batch.price.toFixed(2)}
              </td>

              {/* Progress */}
              <td className="py-3.5 px-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-between w-full max-w-[120px] text-[11px]">
                    <span className="font-bold text-[#1677FF]">{soldQ}</span>
                    <span className="text-slate-400">/ {totalQ}</span>
                  </div>
                  <div className="w-full max-w-[120px] bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div className="bg-[#1677FF] h-full rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </td>

              {/* Available */}
              <td className="py-3.5 px-4 text-center font-bold text-[#10B981]">
                {batch.availableQuantity || 0} un.
              </td>

              {/* Period */}
              <td className="py-3.5 px-4 text-center text-[11px] text-[#718096]">
                {batch.startDate || '01/08/2026'} até {batch.endDate || '30/10/2026'}
              </td>

              {/* Status */}
              <td className="py-3.5 px-4 text-center">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(batch.id)}
                  title="Clique para alternar status"
                >
                  <Badge status={batch.status} />
                </button>
              </td>

              {/* Actions */}
              <td className="py-3.5 pr-4 pl-2 text-right">
                <button
                  type="button"
                  onClick={() => handleRemoveBatch(batch.id)}
                  className="p-1.5 text-slate-400 hover:text-[#EF4444] transition rounded-btn"
                  title="Excluir Lote"
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </div>
  );
};
