import React from 'react';
import { 
  CircleDollarSign, ShoppingCart, Users, Ticket, 
  TrendingUp, ArrowUpRight, Plus, Calendar, MapPin,
  Building2, Globe, ArrowRight, ShieldCheck, CheckCircle2,
  ExternalLink, Layers
} from 'lucide-react';
import type { EventItem } from '../types/event';
import type { Producer } from '../types/producer';
import { PageHeader } from '../components/ui/PageHeader';
import { KpiCard } from '../components/ui/KpiCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';

interface DashboardPageProps {
  events: EventItem[];
  selectedProducer: Producer | null;
  allProducers?: Producer[];
  onSelectProducer?: (producerId: string) => void;
  onNavigateToEvents: () => void;
  onOpenNewEvent: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  events,
  selectedProducer,
  allProducers = [],
  onSelectProducer,
  onNavigateToEvents,
  onOpenNewEvent,
}) => {
  const isGlobalAdminView = !selectedProducer;

  const totalRevenue = events.reduce((acc, ev) => {
    const rev = typeof ev.totalRevenue === 'number' 
      ? ev.totalRevenue 
      : ((ev as any).totalCents ? (ev as any).totalCents / 100 : 0);
    return acc + rev;
  }, 0);

  const totalSales = events.reduce((acc, ev) => {
    const s = typeof ev.salesCount === 'number' ? ev.salesCount : (ev.sales ?? 0);
    return acc + s;
  }, 0);

  const totalAvailable = events.reduce((acc, ev) => {
    const a = typeof ev.availableCount === 'number' ? ev.availableCount : (ev.available ?? 0);
    return acc + a;
  }, 0);

  const totalCapacity = events.reduce((acc, ev) => {
    return acc + (ev.totalCapacity || 2000);
  }, 0);

  const averageOccupancy = totalCapacity > 0 ? (totalSales / totalCapacity) * 100 : 72.4;
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 341.50;

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const tableHeaders = [
    'Evento',
    'Data / Local',
    <div key="rec" className="text-right">Receita Total</div>,
    <div key="vend" className="text-center">Vendas</div>,
    <div key="ocup" className="text-center">Ocupação</div>,
    <div key="st" className="text-center">Status</div>
  ];

  return (
    <div className="w-full space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        eyebrow={isGlobalAdminView ? "VISÃO ADMINISTRATIVA GLOBAL" : "PAINEL DA PRODUTORA"}
        title={isGlobalAdminView ? "Dashboard Administrativo Master" : `Dashboard — ${selectedProducer?.name}`}
        subtitle={
          isGlobalAdminView
            ? "Visão executiva consolidada de todas as produtoras, eventos e receita da plataforma DiskIngressos."
            : `Visão executiva e indicadores consolidados para ${selectedProducer?.name}.`
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" onClick={onNavigateToEvents}>
              {isGlobalAdminView ? "Ver Todos os Eventos" : "Ver Meus Eventos"}
            </Button>
            <Button variant="primary" onClick={onOpenNewEvent} icon={<Plus size={16} />}>
              Criar Novo Evento
            </Button>
          </div>
        }
      />

      {/* 2. Main KPIs Row */}
      {isGlobalAdminView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="PRODUTORAS ATIVAS"
            value="184"
            trend="↑ 6 novas"
            trendDirection="up"
            note="cadastros homologados"
            accent="blue"
            icon={<Building2 size={20} />}
          />
          <KpiCard
            label="EVENTOS ATIVOS"
            value="427"
            trend="↑ 18 este mês"
            trendDirection="up"
            note="em comercialização"
            accent="purple"
            icon={<Ticket size={20} />}
          />
          <KpiCard
            label="USUÁRIOS DO SISTEMA"
            value="892"
            note="produtores e operadores"
            accent="cyan"
            icon={<Users size={20} />}
          />
          <KpiCard
            label="VENDAS HOJE (GLOBAL)"
            value={formatCurrency(485200.00)}
            trend="↑ 14,8%"
            trendDirection="up"
            note="receita processada hoje"
            accent="green"
            icon={<CircleDollarSign size={20} />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="RECEITA TOTAL"
            value={formatCurrency(totalRevenue || 580000)}
            trend="↑ 12,4%"
            trendDirection="up"
            note="vs. mês anterior"
            accent="green"
            icon={<CircleDollarSign size={20} />}
          />
          <KpiCard
            label="VENDAS TOTAIS"
            value={`${(totalSales || 1420).toLocaleString('pt-BR')} un.`}
            trend="↑ 8,7%"
            trendDirection="up"
            note="ingressos emitidos"
            accent="blue"
            icon={<ShoppingCart size={20} />}
          />
          <KpiCard
            label="TICKET MÉDIO"
            value={formatCurrency(avgTicket || 341.50)}
            note="por comprador"
            accent="purple"
            icon={<Ticket size={20} />}
          />
          <KpiCard
            label="TAXA DE OCUPAÇÃO"
            value={`${averageOccupancy.toFixed(1)}%`}
            note="capacidade geral dos eventos"
            accent="cyan"
            icon={<Users size={20} />}
          />
        </div>
      )}

      {/* 3. Seção Especial: Lista de Produtoras (Apenas na Visão Global Admin) */}
      {isGlobalAdminView && allProducers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-extrabold text-[#0E1726] flex items-center gap-2">
                <Building2 size={18} className="text-[#1677FF]" />
                Produtoras Cadastradas na Plataforma
              </h2>
              <p className="text-xs text-slate-500">
                Selecione uma produtora para acessar o painel exclusivo e visualizar seus eventos isoladamente.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-btn border border-slate-200">
              {allProducers.length} Produtoras
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allProducers.map((prod) => {
              const prodEvents = events.filter(e => e.producerId === prod.id || e.producerName === prod.name);
              const eventCount = prodEvents.length || (prod.id === 'prod-1' ? 15 : prod.id === 'prod-2' ? 8 : 4);
              const revenueEst = prod.id === 'prod-1' ? 'R$ 580 mil' : prod.id === 'prod-2' ? 'R$ 310 mil' : 'R$ 145 mil';

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-card border border-[#E2E8F0] p-5 shadow-xs hover:border-[#1677FF] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Produtora
                      </span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>

                    <strong className="text-[16px] font-black text-[#0E1726] block">
                      {prod.name}
                    </strong>
                    <span className="text-xs text-slate-500 block mt-0.5 font-mono">
                      CNPJ: {(prod as any).document || '04.912.839/0001-20'}
                    </span>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>{eventCount} eventos</span>
                      <span className="font-bold text-emerald-700">{revenueEst} em vendas</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => onSelectProducer ? onSelectProducer(prod.id) : null}
                      className="w-full py-2 px-3 rounded-btn bg-slate-50 hover:bg-[#1677FF] text-slate-800 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-200 hover:border-[#1677FF] cursor-pointer shadow-xs"
                    >
                      <span>Acessar produtora</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Eventos em Destaque Table */}
      <div className="rounded-card border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#EDF0F4] flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-extrabold text-[#0E1726]">
              {isGlobalAdminView ? "Eventos Recentes na Plataforma" : `Eventos Ativos de ${selectedProducer?.name}`}
            </h3>
            <p className="text-[12px] text-[#718096]">
              Desempenho de vendas, ocupação e status dos eventos.
            </p>
          </div>
          <Button variant="secondary" onClick={onNavigateToEvents}>
            Ver Lista Completa
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-500 font-bold border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Evento</th>
                <th className="py-3 px-4">Data / Local</th>
                <th className="py-3 px-4 text-right">Receita Total</th>
                <th className="py-3 px-4 text-center">Vendas</th>
                <th className="py-3 px-4 text-center">Ocupação</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {events.slice(0, 8).map((ev: EventItem) => {
                const evSales = typeof ev.salesCount === 'number' ? ev.salesCount : (ev.sales ?? 0);
                const evRev = typeof ev.totalRevenue === 'number' ? ev.totalRevenue : ((ev as any).totalCents ? (ev as any).totalCents / 100 : 0);
                const evOcc = typeof ev.occupancyRate === 'number' ? ev.occupancyRate : (ev.occupancy ?? 0);

                return (
                  <tr 
                    key={ev.id} 
                    onClick={onNavigateToEvents}
                    className="hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="py-3 px-4 font-bold text-[#0E1726]">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          #{ev.code}
                        </span>
                        <span>{ev.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-medium">
                      {ev.venue} • {ev.date}
                    </td>
                    <td className="py-3 px-4 font-bold text-right text-slate-900 text-xs">
                      {formatCurrency(evRev)}
                    </td>
                    <td className="py-3 px-4 text-center text-xs font-bold text-[#1677FF]">
                      {evSales.toLocaleString('pt-BR')} un.
                    </td>
                    <td className="py-3 px-4 text-center text-xs font-semibold">
                      <span className="bg-slate-100 px-2 py-0.5 rounded">
                        {Number(evOcc).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge status={ev.status as any} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
