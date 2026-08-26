import React, { useState } from 'react';
import { ArrowLeft, Zap, CircleDollarSign, CheckCircle2, AlertCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { KpiCard } from '../../components/ui/KpiCard';

export const AntecipacoesModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const maxAvailable = 72410.80;
  const [amount, setAmount] = useState<number>(30000);
  const monthlyRate = 1.89; // 1.89%

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const discountFee = amount * (monthlyRate / 100);
  const iofTax = amount * 0.0038;
  const netReceived = amount - discountFee - iofTax;

  const handleRequest = () => {
    alert(`Antecipação de ${formatCurrency(amount)} solicitada com sucesso!\nValor líquido de ${formatCurrency(netReceived)} creditado em até 2 horas na conta.`);
  };

  return (
    <div className="w-full space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-[#1677FF] hover:underline"
      >
        <ArrowLeft size={16} />
        Voltar para o Hub Financeiro
      </button>

      <PageHeader
        eyebrow="OPERAÇÕES DE CAIXA"
        title="Antecipação de Recebíveis"
        subtitle="Transforme suas vendas a prazo em saldo disponível imediato para custear a produção do evento."
      />

      {/* Main KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="LIMITE DISPONÍVEL"
          value={formatCurrency(maxAvailable)}
          note="cartão de crédito em D+30"
          accent="blue"
          icon={<CircleDollarSign size={20} />}
        />
        <KpiCard
          label="TAXA DE ANTECIPAÇÃO"
          value={`${monthlyRate}% a.m.`}
          note="sem tarifas adicionais"
          accent="green"
          icon={<TrendingUp size={20} />}
        />
        <KpiCard
          label="VALOR LÍQUIDO A LIBERAR"
          value={formatCurrency(netReceived)}
          note="em sua conta PJ"
          accent="purple"
          icon={<Zap size={20} />}
        />
        <KpiCard
          label="PRAZO DE LIBERAÇÃO"
          value="Em até 2 horas"
          note="PIX automático"
          accent="cyan"
          icon={<CheckCircle2 size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="md" className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-[#EDF0F4] pb-3">
            <h2 className="text-[17px] font-bold text-[#0E1726]">Simulação de Antecipação</h2>
            <span className="text-xs text-[#718096]">Ajuste o valor desejado</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Valor a Antecipar:</span>
                <span className="text-[18px] text-[#1677FF] font-black">{formatCurrency(amount)}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={maxAvailable}
                step={500}
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                className="w-full accent-[#1677FF] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-[#718096] mt-1">
                <span>Mínimo: R$ 1.000,00</span>
                <span>Máximo: {formatCurrency(maxAvailable)}</span>
              </div>
            </div>

            <div className="rounded-btn bg-[#F8FAFC] border border-[#CBD5E1] p-3 text-xs text-[#718096] flex items-start gap-2">
              <AlertCircle size={16} className="text-[#1677FF] shrink-0 mt-0.5" />
              <span>
                As antecipações utilizam os recebíveis das vendas já aprovadas no cartão de crédito como garantia. Não há necessidade de avalista.
              </span>
            </div>
          </div>
        </Card>

        {/* Summary Card */}
        <Card padding="md" className="flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-[17px] font-bold text-[#0E1726] mb-1">Resumo da Antecipação</h2>
            <p className="text-[12px] text-[#718096]">Valores calculados em tempo real.</p>

            <div className="space-y-3 mt-4 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#F8FAFC]">
                <span className="text-slate-600">Valor Bruto Solicitado</span>
                <strong className="text-slate-900 font-bold">{formatCurrency(amount)}</strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-rose-50 text-[#991B1B]">
                <span>Desconto de Taxa ({monthlyRate}%)</span>
                <strong className="font-bold">- {formatCurrency(discountFee)}</strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-rose-50 text-[#991B1B]">
                <span>IOF Retido</span>
                <strong className="font-bold">- {formatCurrency(iofTax)}</strong>
              </div>
              <div className="p-3 rounded-btn bg-[#DCFCE7] border border-[#15803D]/20">
                <span className="text-[10px] font-bold uppercase text-[#15803D] block">Valor Líquido na Conta</span>
                <strong className="text-[20px] font-bold text-[#15803D] block mt-0.5">{formatCurrency(netReceived)}</strong>
              </div>
            </div>
          </div>

          <Button variant="primary" fullWidth onClick={handleRequest} icon={<Zap size={16} />}>
            Confirmar e Antecipar Agora
          </Button>
        </Card>
      </div>
    </div>
  );
};
