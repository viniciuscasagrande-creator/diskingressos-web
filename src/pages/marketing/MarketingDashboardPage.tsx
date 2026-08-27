import React, { useState } from 'react';
import { 
  Megaphone, TrendingUp, ShoppingCart, Percent, 
  DollarSign, Users, Eye, CreditCard, ArrowRight, 
  Share2, Filter, Download, Plus, Calendar, 
  Sparkles, CheckCircle2, ArrowUpRight, ShieldCheck, 
  Globe, MessageCircle, Mail, ExternalLink, Sliders
} from 'lucide-react';
import type { EventItem } from '../../types/event';
import { 
  mockMarketingFunnel, 
  mockChannelsPerformance, 
  mockDailyRevenue, 
  mockMarketingCampaigns 
} from '../../data/marketingData';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { KpiCard } from '../../components/ui/KpiCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';

interface MarketingDashboardPageProps {
  events: EventItem[];
  selectedEventId: number | null;
  onSelectEventId: (id: number | null) => void;
  onOpenCreateCampaign: () => void;
  onNavigateToTab: (tabKey: string) => void;
  notify?: (msg: string) => void;
}

export const MarketingDashboardPage: React.FC<MarketingDashboardPageProps> = ({
  events,
  selectedEventId,
  onSelectEventId,
  onOpenCreateCampaign,
  onNavigateToTab,
  notify,
}) => {
  const [period, setPeriod] = useState<'7d' | '30d' | 'month' | 'year'>('30d');

  const activeEvent = events.find((e) => e.id === selectedEventId);

  const formatBrl = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const funnel = mockMarketingFunnel;

  const campaignHeaders = [
    'Campanha / Ação',
    'Canal de Tráfego',
    <div key="vd" className="text-center">Vendas Realizadas</div>,
    <div key="rc" className="text-right">Receita Gerada</div>,
    <div key="roi" className="text-right pr-2">ROI / Retorno</div>
  ];

  return (
    <div className="w-full space-y-6 select-none font-sans">
      {/* 1. Header & Context Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              MARKETING
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">• Painel de Performance</span>
          </div>
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#0E1726] tracking-tight">
            Desempenho de Campanhas & Conversões
          </h2>
          <p className="text-[12px] text-[#718096] mt-0.5">
            Métricas consolidadas de tráfego, funil de checkout, ROI de mídia paga e recuperação.
          </p>
        </div>

        {/* Global Context Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Event Context Selector */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-btn px-3 py-1.5 shadow-xs">
            <Calendar size={14} className="text-[#7C3AED]" />
            <select
              value={selectedEventId === null ? 'all' : String(selectedEventId)}
              onChange={(e) => onSelectEventId(e.target.value === 'all' ? null : Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-[#0E1726] outline-none cursor-pointer"
            >
              <option value="all">Todos os Eventos (Consolidado)</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-btn p-0.5 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setPeriod('7d')}
              className={`px-2.5 py-1 rounded transition ${period === '7d' ? 'bg-[#1677FF] text-white font-bold' : 'hover:bg-slate-200'}`}
            >
              7 Dias
            </button>
            <button
              onClick={() => setPeriod('30d')}
              className={`px-2.5 py-1 rounded transition ${period === '30d' ? 'bg-[#1677FF] text-white font-bold' : 'hover:bg-slate-200'}`}
            >
              30 Dias
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-2.5 py-1 rounded transition ${period === 'month' ? 'bg-[#1677FF] text-white font-bold' : 'hover:bg-slate-200'}`}
            >
              Este Mês
            </button>
          </div>

          {/* Export Action */}
          <Button
            variant="secondary"
            onClick={() => {
              if (notify) notify('Relatório de marketing exportado em PDF/Excel!');
            }}
            icon={<Download size={14} />}
          >
            Exportar
          </Button>

          {/* Create Campaign Action */}
          <Button
            variant="primary"
            onClick={onOpenCreateCampaign}
            icon={<Plus size={15} />}
            className="bg-[#7C3AED] hover:bg-[#6D28D9]"
          >
            Criar Campanha
          </Button>
        </div>
      </div>

      {/* 2. 4 Principal KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Receita Gerada */}
        <div className="rounded-card bg-white p-5 border border-[#E2E8F0] shadow-xs hover:border-[#7C3AED]/40 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Receita Gerada
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-purple-50 text-[#7C3AED]">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-[24px] font-extrabold tracking-tight text-[#0E1726]">
              {formatBrl(125430)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-[#10B981]">
            <span className="flex items-center">↑ 18,4%</span>
            <span className="text-slate-400 font-normal">vs. período anterior</span>
          </div>
        </div>

        {/* Card 2: Conversões */}
        <div className="rounded-card bg-white p-5 border border-[#E2E8F0] shadow-xs hover:border-[#1677FF]/40 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Conversões (Vendas)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-blue-50 text-[#1677FF]">
              <ShoppingCart size={18} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-[24px] font-extrabold tracking-tight text-[#0E1726]">
              2.847 ingressos
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-[#10B981]">
            <span className="flex items-center">↑ 12,8%</span>
            <span className="text-slate-400 font-normal">pedidos aprovados</span>
          </div>
        </div>

        {/* Card 3: Taxa de Conversão */}
        <div className="rounded-card bg-white p-5 border border-[#E2E8F0] shadow-xs hover:border-[#10B981]/40 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Taxa de Conversão
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-emerald-50 text-[#10B981]">
              <Percent size={18} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-[24px] font-extrabold tracking-tight text-[#0E1726]">
              4,82%
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-[#10B981]">
            <span className="flex items-center">↑ 0,9%</span>
            <span className="text-slate-400 font-normal">visita para compra</span>
          </div>
        </div>

        {/* Card 4: ROI Marketing */}
        <div className="rounded-card bg-white p-5 border border-[#E2E8F0] shadow-xs hover:border-[#F97316]/40 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              ROI Médio das Campanhas
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-orange-50 text-[#F97316]">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-[24px] font-extrabold tracking-tight text-[#0E1726]">
              342%
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-[#10B981]">
            <span className="flex items-center">↑ 22%</span>
            <span className="text-slate-400 font-normal">R$ 3,42 para cada R$ 1</span>
          </div>
        </div>
      </div>

      {/* 3. Funil de Conversão Integrado */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#EDF0F4] pb-3">
          <div>
            <h3 className="text-[16px] font-bold text-[#0E1726]">
              Funil de Conversão de Vendas (E-commerce & Portais)
            </h3>
            <span className="text-[12px] text-[#718096]">
              Passo a passo desde o tráfego de entrada até a confirmação do pagamento
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#7C3AED] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            Conversão Geral: 2,36%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {/* Step 1: Visitantes */}
          <div className="relative flex flex-col justify-between p-3.5 rounded-card bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                1. Visitantes
              </span>
              <strong className="text-[20px] font-extrabold text-slate-900 block mt-1">
                {funnel.visitors.toLocaleString('pt-BR')}
              </strong>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-semibold">
              100% tráfego bruto
            </div>
          </div>

          {/* Step 2: Visualizações */}
          <div className="relative flex flex-col justify-between p-3.5 rounded-card bg-blue-50/70 border border-blue-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                2. Visualizações
              </span>
              <strong className="text-[20px] font-extrabold text-blue-950 block mt-1">
                {funnel.views.toLocaleString('pt-BR')}
              </strong>
            </div>
            <div className="mt-3 pt-2 border-t border-blue-200 text-[11px] text-blue-700 font-bold">
              40,1% retenção na página
            </div>
          </div>

          {/* Step 3: Checkout */}
          <div className="relative flex flex-col justify-between p-3.5 rounded-card bg-purple-50/70 border border-purple-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                3. Checkout
              </span>
              <strong className="text-[20px] font-extrabold text-purple-950 block mt-1">
                {funnel.checkout.toLocaleString('pt-BR')}
              </strong>
            </div>
            <div className="mt-3 pt-2 border-t border-purple-200 text-[11px] text-purple-700 font-bold">
              17,7% início de compra
            </div>
          </div>

          {/* Step 4: Pagamentos */}
          <div className="relative flex flex-col justify-between p-3.5 rounded-card bg-orange-50/70 border border-orange-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 block">
                4. Pagamentos
              </span>
              <strong className="text-[20px] font-extrabold text-orange-950 block mt-1">
                {funnel.payments.toLocaleString('pt-BR')}
              </strong>
            </div>
            <div className="mt-3 pt-2 border-t border-orange-200 text-[11px] text-orange-700 font-bold">
              48,3% checkout gerado
            </div>
          </div>

          {/* Step 5: Vendas Concluídas */}
          <div className="relative flex flex-col justify-between p-3.5 rounded-card bg-emerald-50 border border-emerald-200 shadow-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                5. Vendas Concluídas
              </span>
              <strong className="text-[20px] font-extrabold text-emerald-950 block mt-1">
                {funnel.sales.toLocaleString('pt-BR')}
              </strong>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-200 text-[11px] text-emerald-800 font-bold">
              69,0% aprovação de gateway
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Gráficos & Canais de Desempenho */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Receita Diária por Período */}
        <div className="lg:col-span-7 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDF0F4] pb-3">
            <div>
              <h3 className="text-[16px] font-bold text-[#0E1726]">
                Evolução da Receita por Período
              </h3>
              <span className="text-[12px] text-[#718096]">
                Faturamento acumulado nos dias de campanha
              </span>
            </div>
            <span className="text-[12px] font-bold text-[#1677FF]">
              Total: {formatBrl(125430)}
            </span>
          </div>

          {/* Bar Chart Visualizer */}
          <div className="pt-4 space-y-3">
            {mockDailyRevenue.map((d) => {
              const maxRev = 45000;
              const pct = (d.revenue / maxRev) * 100;
              return (
                <div key={d.day} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 w-12">{d.day} ({d.date})</span>
                    <span className="text-slate-500 font-mono">{d.sales} ingressos</span>
                    <span className="font-bold text-[#0E1726]">{formatBrl(d.revenue)}</span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7C3AED] to-[#1677FF] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Conversões por Canal */}
        <div className="lg:col-span-5 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDF0F4] pb-3">
            <div>
              <h3 className="text-[16px] font-bold text-[#0E1726]">
                Conversões por Canal
              </h3>
              <span className="text-[12px] text-[#718096]">
                Participação de receita por origem de mídia
              </span>
            </div>
          </div>

          <div className="space-y-3.5 pt-1">
            {mockChannelsPerformance.map((ch) => (
              <div key={ch.channel} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#0E1726] font-bold">{ch.channelLabel}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{formatBrl(ch.revenue)}</span>
                    <span className="font-extrabold text-slate-900 w-9 text-right">{ch.percentage}%</span>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${ch.percentage}%`, backgroundColor: ch.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Tabela de Campanhas com Melhor Desempenho */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[16px] font-bold text-[#0E1726]">
              Campanhas com Melhor Desempenho
            </h3>
            <span className="text-[12px] text-[#718096]">
              Métricas de retorno sobre investimento (ROI), vendas e receita atribuída
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateToTab('mkt-campaigns')}
            icon={<ArrowRight size={14} />}
          >
            Ver Todas as Campanhas
          </Button>
        </div>

        <DataTable headers={campaignHeaders} empty={mockMarketingCampaigns.length === 0}>
          {mockMarketingCampaigns.map((cmp) => (
            <tr key={cmp.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3.5 px-4">
                <strong className="block text-sm font-bold text-[#0E1726]">{cmp.name}</strong>
                <span className="text-[11px] text-[#718096]">{cmp.eventName || 'Global'} • UTM: {cmp.utmCampaign}</span>
              </td>

              <td className="py-3.5 px-4">
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  {cmp.channelLabel}
                </span>
              </td>

              <td className="py-3.5 px-4 text-center font-bold text-slate-800 text-xs">
                {cmp.salesCount} vendas
              </td>

              <td className="py-3.5 px-4 text-right font-bold text-[#0E1726] text-xs">
                {formatBrl(cmp.revenue)}
              </td>

              <td className="py-3.5 pr-4 pl-2 text-right">
                <span className="inline-flex items-center gap-0.5 font-extrabold text-xs text-[#10B981] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ArrowUpRight size={13} />
                  {cmp.roi}% ROI
                </span>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      {/* 6. Banner do Sistema de Herança de Rastreamento (Fase 4) */}
      <div className="bg-gradient-to-r from-[#222A36] to-[#17202A] rounded-card p-5 text-white flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-btn bg-[#7C3AED] text-white shrink-0 shadow-md">
            <Sliders size={22} />
          </div>
          <div>
            <h4 className="text-[15px] font-bold">Sistema de Herança de Tags & Pixels</h4>
            <p className="text-[12px] text-slate-300">
              Configure tags globais no nível da Produtora ou personalize por Evento individual (Meta Pixel, GA4, GTM).
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => onNavigateToTab('mkt-analytics')}
          className="bg-white text-[#222A36] hover:bg-slate-100 shrink-0 font-bold text-xs"
        >
          Configurar Herança de Pixels
        </Button>
      </div>
    </div>
  );
};
