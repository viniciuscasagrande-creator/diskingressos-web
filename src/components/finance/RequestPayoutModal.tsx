import React, { useState } from 'react';
import { X, Banknote, Building2, AlertCircle, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { EventItem } from '../../types/event';

interface RequestPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  events: EventItem[];
  onRequestPayout: (amount: number, eventId: number, bankKey: string) => void;
}

export const RequestPayoutModal: React.FC<RequestPayoutModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  events,
  onRequestPayout,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<number>(events[0]?.id || 1);
  const [amount, setAmount] = useState<string>(String(availableBalance.toFixed(2)));
  const [bankAccount, setBankAccount] = useState<string>('Banco Itaú (Ag 0142 • CC 89410-2) - CNPJ Produtora');
  const [pixKey, setPixKey] = useState<string>('financeiro@produtora.com.br');

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0 || numericAmount > availableBalance) {
      alert('Valor inválido ou acima do saldo disponível.');
      return;
    }
    onRequestPayout(numericAmount, selectedEventId, pixKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-card border border-[#E2E8F0] bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#222A36] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-[#10B981] shadow-xs text-white">
              <Banknote size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold">Solicitar Repasse de Vendas</h2>
              <p className="text-[12px] text-slate-300">
                Transferência para a conta bancária da produtora
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-btn bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleConfirm} className="p-6 space-y-4">
          {/* Balance Strip */}
          <div className="rounded-btn bg-[#DCFCE7]/70 border border-[#15803D]/20 p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#15803D] block">
                Saldo Disponível para Saque
              </span>
              <strong className="text-[20px] font-bold text-[#15803D]">
                {formatCurrency(availableBalance)}
              </strong>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-white/80 rounded-full px-2.5 py-1">
              Liberação em D+2
            </span>
          </div>

          <Select
            label="Evento de Origem"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(Number(e.target.value))}
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                #{e.code} — {e.title}
              </option>
            ))}
          </Select>

          <Input
            label="Valor do Repasse (R$)"
            type="number"
            step="0.01"
            max={availableBalance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            helperText={`Máximo permitido: ${formatCurrency(availableBalance)}`}
            required
          />

          <Select
            label="Conta Bancária Cadastrada"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
          >
            <option value="Banco Itaú (Ag 0142 • CC 89410-2) - CNPJ Produtora">
              Banco Itaú (Ag 0142 • CC 89410-2) - CNPJ Produtora
            </option>
            <option value="Banco Bradesco (Ag 2210 • CC 44012-9) - Chave Pix">
              Banco Bradesco (Ag 2210 • CC 44012-9) - Chave Pix
            </option>
          </Select>

          <Input
            label="Chave Pix para TED/PIX"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            required
          />

          <div className="rounded-btn bg-[#F8FAFC] border border-[#CBD5E1] p-3 text-[12px] text-[#718096] flex items-start gap-2">
            <AlertCircle size={16} className="text-[#1677FF] shrink-0 mt-0.5" />
            <span>
              Os repasses solicitados em dias úteis até as 14h são creditados na conta da produtora no mesmo dia ou no próximo dia útil.
            </span>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#EDF0F4] flex items-center justify-end gap-2.5">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" icon={<Check size={16} />}>
              Confirmar Solicitação
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
