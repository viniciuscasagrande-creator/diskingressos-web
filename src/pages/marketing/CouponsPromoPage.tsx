import React, { useState } from 'react';
import { 
  Tag, Plus, Percent, DollarSign, Check, 
  Copy, Calendar, Users, ArrowUpRight
} from 'lucide-react';
import type { EventItem } from '../../types/event';
import type { CouponPromo } from '../../types/marketing';
import { mockCoupons } from '../../data/marketingData';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';

interface CouponsPromoPageProps {
  events: EventItem[];
  producerId?: number;
  notify?: (msg: string) => void;
}

export const CouponsPromoPage: React.FC<CouponsPromoPageProps> = ({ events, notify }) => {
  const [coupons, setCoupons] = useState<CouponPromo[]>(mockCoupons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [eventId, setEventId] = useState<string>('all');
  const [maxUses, setMaxUses] = useState('100');
  const [validUntil, setValidUntil] = useState('31/12/2026');

  const formatBrl = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    if (notify) notify(`Cupom "${couponCode}" copiado para a área de transferência!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const eventObj = eventId === 'all' ? null : events.find(ev => ev.id === Number(eventId));
    const newCoupon: CouponPromo = {
      id: `CUP-0${coupons.length + 1}`,
      code: code.toUpperCase().replace(/\s+/g, ''),
      discountType,
      discountValue: Number(discountValue) || 0,
      eventId: eventObj ? eventObj.id : null,
      eventName: eventObj ? eventObj.title : 'Todos os Eventos da Produtora',
      maxUses: Number(maxUses) || 100,
      currentUses: 0,
      totalDiscountGiven: 0,
      revenueGenerated: 0,
      validUntil,
      status: 'active',
    };

    setCoupons([newCoupon, ...coupons]);
    setIsModalOpen(false);
    setCode('');
    if (notify) notify(`Cupom de desconto "${newCoupon.code}" criado com sucesso!`);
  };

  const headers = [
    'Código do Cupom',
    'Desconto Aplicado',
    <div key="ev">Escopo do Evento</div>,
    <div key="us" className="text-center">Utilizações / Limite</div>,
    <div key="rc" className="text-right">Receita Gerada</div>,
    <div key="st" className="text-center">Status</div>,
    <div key="ac" className="text-right pr-2">Ações</div>
  ];

  return (
    <div className="w-full space-y-6 select-none font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              PROMOÇÕES & VOUCHERS
            </span>
          </div>
          <h2 className="text-[20px] font-extrabold text-[#0E1726] tracking-tight">
            Cupons de Desconto & Promoções
          </h2>
          <p className="text-[12px] text-[#718096] mt-0.5">
            Crie cupons percentuais ou em reais para campanhas de lançamento, parcerias ou afiliados.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus size={15} />}
          className="bg-[#10B981] hover:bg-[#059669] text-white"
        >
          Novo Cupom
        </Button>
      </div>

      {/* Coupons Table */}
      <DataTable headers={headers} empty={coupons.length === 0}>
        {coupons.map((cup) => (
          <tr key={cup.id} className="hover:bg-slate-50 transition-colors">
            <td className="py-3.5 px-4">
              <strong className="block text-sm font-mono font-extrabold text-[#7C3AED]">{cup.code}</strong>
              <span className="text-[11px] text-[#718096]">Válido até: {cup.validUntil}</span>
            </td>

            <td className="py-3.5 px-4">
              <span className="inline-block bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {cup.discountType === 'percentage' ? `${cup.discountValue}% OFF` : `R$ ${cup.discountValue} OFF`}
              </span>
            </td>

            <td className="py-3.5 px-4">
              <span className="text-xs font-semibold text-slate-800">{cup.eventName}</span>
            </td>

            <td className="py-3.5 px-4 text-center">
              <span className="text-xs font-bold text-slate-900 block">
                {cup.currentUses} / {cup.maxUses}
              </span>
              <div className="h-1.5 w-24 mx-auto bg-slate-100 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, (cup.currentUses / cup.maxUses) * 100)}%` }}
                />
              </div>
            </td>

            <td className="py-3.5 px-4 text-right">
              <strong className="text-xs font-extrabold text-[#0E1726] block">
                {formatBrl(cup.revenueGenerated)}
              </strong>
              <span className="text-[10px] text-slate-400">
                Desconto: {formatBrl(cup.totalDiscountGiven)}
              </span>
            </td>

            <td className="py-3.5 px-4 text-center">
              <Badge variant={cup.status === 'active' ? 'success' : 'neutral'}>
                {cup.status === 'active' ? 'Ativo' : 'Esgotado'}
              </Badge>
            </td>

            <td className="py-3.5 pr-4 pl-2 text-right">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopy(cup.code)}
                icon={copiedCode === cup.code ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              >
                {copiedCode === cup.code ? 'Copiado!' : 'Copiar'}
              </Button>
            </td>
          </tr>
        ))}
      </DataTable>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Criar Novo Cupom de Desconto"
        description="Defina as regras de desconto, validade e limite de utilizações."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Código Promocional *</label>
            <input
              type="text"
              required
              placeholder="Ex: PROMOVERAO2026"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Desconto *</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs text-slate-900 outline-none"
              >
                <option value="percentage">Percentual (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {discountType === 'percentage' ? 'Percentual (%)' : 'Valor em Reais (R$)'} *
              </label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs text-slate-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Aplicar ao Evento *</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs text-slate-900 outline-none"
            >
              <option value="all">Todos os Eventos da Produtora</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Limite de Usos</label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Data de Expiração</label>
              <input
                type="text"
                placeholder="Ex: 31/12/2026"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-btn px-3 py-2 text-xs text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="bg-[#10B981] hover:bg-[#059669]">
              Criar Cupom
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
