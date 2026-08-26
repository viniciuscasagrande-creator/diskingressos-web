import React, { useState } from 'react';
import { ArrowLeft, Calculator, CircleDollarSign, TrendingUp, Sparkles, Sliders } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { KpiCard } from '../../components/ui/KpiCard';

interface SimuladorSpreadModuleProps {
  onBack: () => void;
}

export const SimuladorSpreadModule: React.FC<SimuladorSpreadModuleProps> = ({ onBack }) => {
  const [ticketPrice, setTicketPrice] = useState<number>(150);
  const [expectedQty, setExpectedQty] = useState<number>(2000);
  const [feePercent, setFeePercent] = useState<number>(12);
  const [gatewayFeePercent, setGatewayFeePercent] = useState<number>(2.5);
  const [fixedFee, setFixedFee] = useState<number>(2.00);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Calculations
  const grossSales = ticketPrice * expectedQty;
  const totalServiceFee = grossSales * (feePercent / 100);
  const gatewayCost = (grossSales + totalServiceFee) * (gatewayFeePercent / 100);
  const fixedCostTotal = fixedFee * expectedQty;
  const netSpreadRevenue = totalServiceFee - gatewayCost - fixedCostTotal;
  const netProducerRevenue = grossSales;
  const finalTotalProcessed = grossSales + totalServiceFee;
  const spreadPerTicket = expectedQty > 0 ? netSpreadRevenue / expectedQty : 0;

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
        eyebrow="SIMULADORES, MÉTODOS & LIQUIDAÇÕES"
        title="Simulador de Spread & Rentabilidade"
        subtitle="Simule preços de ingressos, taxa de conveniência e custos de processamento para prever seu lucro líquido."
      />

      {/* Main KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="LUCRO LÍQUIDO DO SPREAD"
          value={formatCurrency(Math.max(0, netSpreadRevenue))}
          trend={`${((netSpreadRevenue / finalTotalProcessed) * 100).toFixed(1)}% margem`}
          trendDirection="up"
          note="ganho operacional retido"
          accent="green"
          icon={<CircleDollarSign size={20} />}
        />
        <KpiCard
          label="FATURAMENTO TOTAL PROCESSADO"
          value={formatCurrency(finalTotalProcessed)}
          note="ingressos + taxas cobradas"
          accent="blue"
          icon={<TrendingUp size={20} />}
        />
        <KpiCard
          label="REPASSE LÍQUIDO DA PRODUTORA"
          value={formatCurrency(netProducerRevenue)}
          note="valor base dos ingressos"
          accent="purple"
          icon={<Calculator size={20} />}
        />
        <KpiCard
          label="SPREAD LÍQUIDO POR INGRESSO"
          value={formatCurrency(Math.max(0, spreadPerTicket))}
          note="lucro por tíquete emitido"
          accent="cyan"
          icon={<Sparkles size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <Card padding="md" className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-[#EDF0F4] pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-emerald-50 text-[#10B981]">
                <Sliders size={18} />
              </div>
              <h2 className="text-[17px] font-bold text-[#0E1726]">Parâmetros da Simulação</h2>
            </div>
            <span className="text-xs text-[#718096]">Ajuste os valores em tempo real</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Preço Médio do Ingresso (R$)
              </label>
              <Input
                type="number"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(Math.max(1, parseFloat(e.target.value) || 0))}
              />
              <span className="text-[11px] text-[#718096] mt-1 block">Valor nominal no carrinho</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Quantidade de Ingressos Estimada
              </label>
              <Input
                type="number"
                value={expectedQty}
                onChange={(e) => setExpectedQty(Math.max(1, parseInt(e.target.value, 10) || 0))}
              />
              <span className="text-[11px] text-[#718096] mt-1 block">Expectativa de público</span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Taxa de Serviço / Conveniência (%)</span>
                <span className="text-[#1677FF]">{feePercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={0.5}
                value={feePercent}
                onChange={(e) => setFeePercent(parseFloat(e.target.value))}
                className="w-full accent-[#1677FF] cursor-pointer"
              />
              <span className="text-[11px] text-[#718096] mt-1 block">Cobrada do comprador final</span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Custo Médio de Gateway / TEF (%)</span>
                <span className="text-[#EF4444]">{gatewayFeePercent}%</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5.0}
                step={0.1}
                value={gatewayFeePercent}
                onChange={(e) => setGatewayFeePercent(parseFloat(e.target.value))}
                className="w-full accent-[#EF4444] cursor-pointer"
              />
              <span className="text-[11px] text-[#718096] mt-1 block">Taxa média de cartão / Pix</span>
            </div>
          </div>
        </Card>

        {/* Breakdown Card */}
        <Card padding="md" className="flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-[17px] font-bold text-[#0E1726] mb-1">Demonstrativo da Operação</h2>
            <p className="text-[12px] text-[#718096]">Composição detalhada dos fluxos financeiros.</p>

            <div className="space-y-3 mt-4 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded bg-[#F8FAFC]">
                <span className="text-slate-600 font-medium">Ingressos Brutos ({expectedQty} un.)</span>
                <strong className="text-slate-900 font-bold">{formatCurrency(grossSales)}</strong>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-emerald-50 text-[#15803D]">
                <span className="font-semibold">+ Taxas de Conveniência ({feePercent}%)</span>
                <strong className="font-bold">{formatCurrency(totalServiceFee)}</strong>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-rose-50 text-[#991B1B]">
                <span className="font-semibold">- Custo de Gateway ({gatewayFeePercent}%)</span>
                <strong className="font-bold">- {formatCurrency(gatewayCost)}</strong>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-rose-50 text-[#991B1B]">
                <span className="font-semibold">- Custo Operacional Fixo (R$ 2/un.)</span>
                <strong className="font-bold">- {formatCurrency(fixedCostTotal)}</strong>
              </div>

              <div className="p-3.5 rounded-btn bg-[#DCFCE7] border border-[#15803D]/20">
                <span className="text-[11px] font-bold uppercase text-[#15803D] block">Spread Líquido Retido</span>
                <strong className="text-[20px] font-bold text-[#15803D] block mt-0.5">
                  {formatCurrency(Math.max(0, netSpreadRevenue))}
                </strong>
              </div>
            </div>
          </div>

          <Button variant="primary" fullWidth onClick={() => alert('Parâmetros salvos como modelo padrão para novos lotes.')}>
            Aplicar Parâmetros nos Eventos
          </Button>
        </Card>
      </div>
    </div>
  );
};
