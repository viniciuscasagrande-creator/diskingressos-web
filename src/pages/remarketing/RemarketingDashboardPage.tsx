import React, { useState } from 'react';
import { 
  Repeat2, ShoppingCart, TrendingUp, Target, 
  Users, MessageCircle, Mail, Clock3, Zap, 
  ArrowUpRight, Send, Filter, Download, Calendar, CheckCircle2
} from 'lucide-react';
import type { EventItem } from '../../types/event';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';

interface RemarketingDashboardPageProps {
  events: EventItem[];
  producerName: string;
  onNavigateToTab: (tab: string) => void;
  notify?: (msg: string) => void;
}

export const RemarketingDashboardPage: React.FC<RemarketingDashboardPageProps> = ({
  events,
  producerName,
  onNavigateToTab,
  notify,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [period, setPeriod] = useState<string>('30');

  const formatBrl = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const activeEventName = selectedEventId === 'all' 
    ? 'Todos os Eventos da Produtora' 
    : events.find(e => String(e.id) === selectedEventId)?.title || 'Evento Selecionado';

  const flows = [
    { name: 'Carrinho 30 min (WhatsApp)', count: '124 recuperações', revenue: 14200, status: 'Ativo' },
    { name: 'PIX Pendente 15 min (WhatsApp + SMS)', count: '68 recuperações', revenue: 8400, status: 'Ativo' },
    { name: 'Último Lote / Urgência (E-mail)', count: '42 recuperações', revenue: 4980, status: 'Ativo' },
    { name: 'Pós-Evento +30 dias (Reengajamento)', count: '1.480 contatos', revenue: 4000, status: 'Ativo' },
  ];

  return (
    <div className="w-full space-y-6 select-none font-sans">
      {/* 1. Top Context Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              REMARKETING & RECUPERAÇÃO
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">• Visão Consolidada</span>
          </div>
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#0E1726] tracking-tight">
            Dashboard de Remarketing & Reengajamento
          </h2>
          <p className="text-[12px] text-[#718096] mt-0.5">
            Recupere carrinhos abandonados, boletos/PIX pendentes e reative participantes inativos.
          </p>
        </div>

        {/* Global Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-btn px-3 py-1.5 shadow-xs">
            <Calendar size={14} className="text-rose-600" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#0E1726] outline-none cursor-pointer"
            >
              <option value="all">Todos os eventos</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-btn px-3 py-1.5 shadow-xs">
            <span className="text-xs font-bold text-slate-600">Período:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#0E1726] outline-none cursor-pointer"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>

          <Button
            variant="secondary"
            onClick={() => {
              if (notify) notify('Relatório de Remarketing exportado em PDF/Excel!');
            }}
            icon={<Download size={14} />}
          >
            Exportar
          </Button>

          <Button
            variant="primary"
            onClick={() => onNavigateToTab('rmk-flows')}
            icon={<Zap size={14} />}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            Novo Fluxo
          </Button>
        </div>
      </div>

      {/* 2. 4 Principal KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-card bg-white p-5 border border-[#E2E8F0] shadow-xs hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Carrinhos Abandonados
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-rose-50 text-rose-600">
              <ShoppingCart size={18} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-[24px] font-extrabold tracking-tight text-[#0E1726]">
              1.248
            </span>
          </div>
          <span className="text-[11px] font-semibold text-rose-600 block mt-1.5">
            R$ 86.420 em potencial
          </span>
        </div>

        <div className="rounded-card bg-white p-5 border border-[#E2E8F0] shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Receita Recuperada
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-emerald-50 text-emerald-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-[24px] font-extrabold tracking-tight text-[#0E1726]">
              {formatBrl(31580)}
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 block mt-1.5">
            ↑ 21,6% no período
          </span>
        </div>

        <div className="rounded-card bg-white p-5 border border-[#E2E8F0] shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Taxa de Recuperação
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-blue-50 text-blue-600">
              <Target size={18} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-[24px] font-extrabold tracking-tight text-[#0E1726]">
              18,7%
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 block mt-1.5">
            234 vendas salvas
          </span>
        </div>

        <div className="rounded-card bg-white p-5 border border-[#E2E8F0] shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Públicos Ativos
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-purple-50 text-purple-600">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-[24px] font-extrabold tracking-tight text-[#0E1726]">
              12
            </span>
          </div>
          <span className="text-[11px] font-semibold text-purple-600 block mt-1.5">
            8 automações em execução
          </span>
        </div>
      </div>

      {/* 3. Canais de Recuperação e Fluxos Ativos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recuperação por Canal */}
        <div className="lg:col-span-5 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="border-b border-[#EDF0F4] pb-3">
            <h3 className="text-[16px] font-bold text-[#0E1726]">
              Recuperação por Canal
            </h3>
            <span className="text-[12px] text-[#718096]">
              Participação na receita recuperada
            </span>
          </div>

          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <MessageCircle size={15} className="text-[#25D366]" /> WhatsApp Direct
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{formatBrl(17420)}</span>
                  <span className="font-extrabold text-slate-900">55%</span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#25D366] rounded-full" style={{ width: '55%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <Mail size={15} className="text-blue-500" /> E-mail Remarketing
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{formatBrl(8840)}</span>
                  <span className="font-extrabold text-slate-900">28%</span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <Clock3 size={15} className="text-orange-500" /> Recuperação de Pagamento
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{formatBrl(5320)}</span>
                  <span className="font-extrabold text-slate-900">17%</span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '17%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Fluxos Automáticos */}
        <div className="lg:col-span-7 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDF0F4] pb-3">
            <div>
              <h3 className="text-[16px] font-bold text-[#0E1726]">
                Fluxos Automáticos em Execução
              </h3>
              <span className="text-[12px] text-[#718096]">
                Jornadas inteligentes com gatilhos automáticos
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToTab('rmk-flows')}
              icon={<ArrowUpRight size={14} />}
            >
              Gerenciar Fluxos
            </Button>
          </div>

          <div className="space-y-2.5 pt-1">
            {flows.map((f) => (
              <div
                key={f.name}
                className="flex items-center justify-between p-3 rounded-card bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition"
              >
                <div>
                  <strong className="text-xs font-bold text-[#0E1726] block">{f.name}</strong>
                  <span className="text-[11px] text-[#718096]">{f.count} • Recuperado: {formatBrl(f.revenue)}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={12} /> {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Button for Abandoned Carts */}
      <div className="bg-gradient-to-r from-[#222A36] to-[#1E2530] rounded-card p-5 text-white flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-btn bg-rose-600 text-white shrink-0 shadow-md">
            <ShoppingCart size={22} />
          </div>
          <div>
            <h4 className="text-[15px] font-bold">1.248 Carrinhos Abandonados Aguardando Disparo</h4>
            <p className="text-[12px] text-slate-300">
              Dispare mensagens automáticas com link de pagamento direto via WhatsApp e converta até 22% a mais.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => onNavigateToTab('rmk-carts')}
          className="bg-white text-[#222A36] hover:bg-slate-100 shrink-0 font-bold text-xs"
        >
          Ver Todos os Carrinhos
        </Button>
      </div>
    </div>
  );
};
