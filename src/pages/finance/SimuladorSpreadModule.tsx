import React, { useState } from 'react';
import { ArrowLeft, Calculator, CircleDollarSign, TrendingUp, Sparkles, Sliders, Download, CheckCircle2, BookmarkCheck, ArrowRight, Layers, Percent } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { KpiCard } from '../../components/ui/KpiCard';

interface SimuladorSpreadModuleProps {
  onBack: () => void;
  notify?: (m: string) => void;
}

export const SimuladorSpreadModule: React.FC<SimuladorSpreadModuleProps> = ({ onBack, notify }) => {
  const [scenario, setScenario] = useState<'padrao' | 'premium' | 'volume'>('padrao');
  const [ticketPrice, setTicketPrice] = useState<number>(150);
  const [expectedQty, setExpectedQty] = useState<number>(2000);
  const [feePercent, setFeePercent] = useState<number>(12);
  const [gatewayFeePercent, setGatewayFeePercent] = useState<number>(2.5);
  const [fixedFee, setFixedFee] = useState<number>(2.00);
  const [installments, setInstallments] = useState<number>(6);
  const [installmentInterestPercent, setInstallmentInterestPercent] = useState<number>(1.99);

  const applyPreset = (preset: 'padrao' | 'premium' | 'volume') => {
    setScenario(preset);
    if (preset === 'padrao') {
      setFeePercent(12);
      setGatewayFeePercent(2.5);
      setFixedFee(2.00);
      notify?.('Cenário Padrão de Mercado aplicado.');
    } else if (preset === 'premium') {
      setFeePercent(15);
      setGatewayFeePercent(2.2);
      setFixedFee(1.50);
      notify?.('Cenário Alta Rentabilidade / Premium aplicado.');
    } else if (preset === 'volume') {
      setFeePercent(10);
      setGatewayFeePercent(2.8);
      setFixedFee(2.50);
      notify?.('Cenário Escala / Volume aplicado.');
    }
  };

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
  const marginPercent = finalTotalProcessed > 0 ? (netSpreadRevenue / finalTotalProcessed) * 100 : 0;

  // Parcelamento
  const installmentValue = (ticketPrice * (1 + feePercent / 100)) / installments;

  const handleExportCsv = () => {
    const headers = ['Parametro', 'Valor_Simulado'];
    const rows = [
      ['Preco_Ingresso_BRL', ticketPrice.toFixed(2)],
      ['Quantidade_Estimada', expectedQty.toString()],
      ['Taxa_Conveniencia_Percentual', `${feePercent}%`],
      ['Custo_Gateway_Percentual', `${gatewayFeePercent}%`],
      ['Custo_Fixo_Por_Ingresso_BRL', fixedFee.toFixed(2)],
      ['Faturamento_Bruto_Ingressos_BRL', grossSales.toFixed(2)],
      ['Receita_Taxa_Conveniencia_BRL', totalServiceFee.toFixed(2)],
      ['Custo_Total_Gateway_BRL', gatewayCost.toFixed(2)],
      ['Custo_Total_Fixo_BRL', fixedCostTotal.toFixed(2)],
      ['Lucro_Liquido_Spread_BRL', Math.max(0, netSpreadRevenue).toFixed(2)],
      ['Margem_Liquida_Spread', `${marginPercent.toFixed(2)}%`],
      ['Spread_Por_Ingresso_BRL', Math.max(0, spreadPerTicket).toFixed(2)]
    ];

    const csvContent = [headers.join(';'), ...rows.map(r => `"${r[0]}";"${r[1]}"`)].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulacao-spread-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify?.('Simulação de Spread exportada com sucesso em CSV.');
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
        eyebrow="SIMULADORES, MÉTODOS & LIQUIDAÇÕES"
        title="Simulador de Spread & Rentabilidade"
        subtitle="Simule preços de ingressos, taxa de conveniência e custos de processamento para maximizar seu lucro operacional."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleExportCsv}
              icon={<Download size={15} />}
            >
              Exportar Simulação
            </Button>
            <Button
              variant="primary"
              onClick={() => notify?.('Parâmetros salvos e aplicados aos lotes ativos com sucesso.')}
              icon={<BookmarkCheck size={15} />}
            >
              Salvar Modelo
            </Button>
          </div>
        }
      />

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Cenários Rápidos:</span>
        <button
          onClick={() => applyPreset('padrao')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${scenario === 'padrao' ? 'bg-[#1677FF] text-white border-[#1677FF]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
        >
          🎯 Padrão de Mercado (12% Taxa)
        </button>
        <button
          onClick={() => applyPreset('premium')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${scenario === 'premium' ? 'bg-[#10B981] text-white border-[#10B981]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
        >
          🔥 Alta Rentabilidade (15% Taxa)
        </button>
        <button
          onClick={() => applyPreset('volume')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${scenario === 'volume' ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
        >
          ⚡ Escala & Volume (10% Taxa)
        </button>
      </div>

      {/* Main KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="LUCRO LÍQUIDO DO SPREAD"
          value={formatCurrency(Math.max(0, netSpreadRevenue))}
          trend={`${marginPercent.toFixed(1)}% margem`}
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
                <span className="text-[#1677FF] font-mono">{feePercent}%</span>
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
                <span className="text-[#EF4444] font-mono">{gatewayFeePercent}%</span>
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

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Custo Operacional Fixo por Tíquete (R$)
              </label>
              <Input
                type="number"
                step="0.10"
                value={fixedFee}
                onChange={(e) => setFixedFee(Math.max(0, parseFloat(e.target.value) || 0))}
              />
              <span className="text-[11px] text-[#718096] mt-1 block">Infraestrutura, antifraude e emissão</span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Parcelamento Médio Simulado</span>
                <span className="text-purple-600 font-mono">{installments}x de {formatCurrency(installmentValue)}</span>
              </div>
              <select
                value={installments}
                onChange={e => setInstallments(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none bg-white font-medium text-slate-800"
              >
                {[1, 2, 3, 4, 6, 10, 12].map(n => (
                  <option key={n} value={n}>{n}x sem juros para o comprador</option>
                ))}
              </select>
              <span className="text-[11px] text-[#718096] mt-1 block">Simulação de parcelamento no checkout</span>
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
                <span className="font-semibold">- Custo Operacional Fixo (R$ {fixedFee.toFixed(2)}/un.)</span>
                <strong className="font-bold">- {formatCurrency(fixedCostTotal)}</strong>
              </div>

              <div className="p-3.5 rounded-btn bg-[#DCFCE7] border border-[#15803D]/20">
                <span className="text-[11px] font-bold uppercase text-[#15803D] block">Spread Líquido Retido</span>
                <strong className="text-[20px] font-bold text-[#15803D] block mt-0.5">
                  {formatCurrency(Math.max(0, netSpreadRevenue))}
                </strong>
                <span className="text-[11px] text-[#15803D] font-medium block mt-1">
                  Margem Líquida Real: {marginPercent.toFixed(1)}% do faturamento
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={() => notify?.(`Parâmetros de spread aplicados: Taxa ${feePercent}%, Margem ${marginPercent.toFixed(1)}%.`)}
          >
            Aplicar Parâmetros nos Eventos
          </Button>
        </Card>
      </div>
    </div>
  );
};

