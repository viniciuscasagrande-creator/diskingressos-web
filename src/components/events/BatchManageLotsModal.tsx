import React, { useState } from 'react';
import { X, Layers3, Plus, Trash2 } from 'lucide-react';
import type { EventItem, TicketBatch } from '../../types/event';

interface BatchManageLotsModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveBatches: (eventId: number, batches: TicketBatch[]) => void;
}

export const BatchManageLotsModal: React.FC<BatchManageLotsModalProps> = ({
  event,
  isOpen,
  onClose,
  onSaveBatches,
}) => {
  if (!isOpen || !event) return null;

  const [batches, setBatches] = useState<TicketBatch[]>(event.batches || []);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchCategory, setNewBatchCategory] = useState<'Pista' | 'VIP' | 'Camarote' | 'Plateia'>('Pista');
  const [newBatchPrice, setNewBatchPrice] = useState('100.00');
  const [newBatchQty, setNewBatchQty] = useState('500');

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;

    const priceNum = parseFloat(newBatchPrice) || 0;
    const qtyNum = parseInt(newBatchQty, 10) || 0;

    const newBatch: TicketBatch = {
      id: `b-${Date.now()}`,
      name: newBatchName.trim(),
      category: newBatchCategory,
      type: newBatchCategory,
      price: priceNum,
      fee: priceNum * 0.1,
      totalQuantity: qtyNum,
      qty: qtyNum,
      soldQuantity: 0,
      sold: 0,
      courtesyQuantity: 0,
      availableQuantity: qtyNum,
      status: 'ativo',
    };

    setBatches([...batches, newBatch]);
    setNewBatchName('');
    setNewBatchPrice('100.00');
    setNewBatchQty('500');
  };

  const handleRemoveBatch = (id: string | number) => {
    setBatches(batches.filter(b => b.id !== id));
  };

  const handleToggleStatus = (id: string | number) => {
    setBatches(batches.map(b => {
      if (b.id === id) {
        const nextStatus = b.status === 'ativo' ? 'pausado' : 'ativo';
        return { ...b, status: nextStatus as any };
      }
      return b;
    }));
  };

  const handleSave = () => {
    onSaveBatches(event.id, batches);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-md">
              <Layers3 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold">Gestão de Lotes & Ingressos</h2>
              <p className="text-xs text-slate-300 truncate max-w-md">
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

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Add New Batch Form */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Plus size={14} className="text-blue-600" />
              Adicionar Novo Lote ou Setor
            </h3>
            <form onSubmit={handleAddBatch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nome do Lote</label>
                <input
                  type="text"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="Ex: Pista Premium - 2º Lote"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Setor / Tipo</label>
                <select
                  value={newBatchCategory}
                  onChange={(e) => setNewBatchCategory(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Pista">Pista</option>
                  <option value="VIP">VIP</option>
                  <option value="Camarote">Camarote</option>
                  <option value="Plateia">Plateia</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Valor Unitário (R$)</label>
                <input
                  type="number"
                  step="0.50"
                  value={newBatchPrice}
                  onChange={(e) => setNewBatchPrice(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Qtd. Ingressos</label>
                  <input
                    type="number"
                    value={newBatchQty}
                    onChange={(e) => setNewBatchQty(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-xs"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>

          {/* Current Batches Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Lotes Configurados ({batches.length})
              </h3>
              <span className="text-xs text-slate-500">
                Total de ingressos: {batches.reduce((acc, b) => acc + (b.totalQuantity || b.qty || 0), 0).toLocaleString('pt-BR')} un.
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-2.5 px-4">Lote / Setor</th>
                    <th className="py-2.5 px-3">Preço</th>
                    <th className="py-2.5 px-3 text-center">Total</th>
                    <th className="py-2.5 px-3 text-center">Vendidos</th>
                    <th className="py-2.5 px-3 text-center">Disponível</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 pr-4 pl-2 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{batch.name}</span>
                        <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                          {batch.type || batch.category || 'Pista'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        R$ {batch.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center">{batch.totalQuantity || batch.qty || 0}</td>
                      <td className="py-3 px-3 text-center font-bold text-blue-600">{batch.soldQuantity || batch.sold || 0}</td>
                      <td className="py-3 px-3 text-center font-semibold text-emerald-600">
                        {batch.availableQuantity || 0}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(batch.id)}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition ${
                            batch.status === 'ativo'
                              ? 'bg-emerald-100 text-emerald-800'
                              : batch.status === 'esgotado'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {batch.status}
                        </button>
                      </td>
                      <td className="py-3 pr-4 pl-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveBatch(batch.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded"
                          title="Excluir Lote"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <span className="text-xs text-slate-500">
            As alterações de lotes entram em vigor imediatamente na página de vendas.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-xs"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
