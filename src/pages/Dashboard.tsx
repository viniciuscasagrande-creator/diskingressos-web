import React from 'react';
import { 
  CircleDollarSign, ShoppingCart, Users, Ticket, 
  TrendingUp, ArrowUpRight, Plus, Calendar, MapPin
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
  selectedProducer: Producer;
  onNavigateToEvents: () => void;
  onOpenNewEvent: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  events,
  selectedProducer,
  onNavigateToEvents,
  onOpenNewEvent,
}) => {
  const totalRevenue = events.reduce((acc, ev) => acc + (ev.totalRevenue || 0), 0);
  const totalSales = events.reduce((acc, ev) => acc + (ev.salesCount || 0), 0);
  const totalAvailable = events.reduce((acc, ev) => acc + (ev.availableCount || 0), 0);
  const totalCapacity = events.reduce((acc, ev) => acc + (ev.totalCapacity || 0), 0);
  const averageOccupancy = totalCapacity > 0 ? (totalSales / totalCapacity) * 100 : 0;
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

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
      {/* Page Header */}
      <PageHeader
        eyebrow="PAINEL EXECUTIVO"
        title="Dashboard Geral"
        subtitle={`Visão executiva e indicadores consolidados para ${selectedProducer.name}.`}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" onClick={onNavigateToEvents}>
              Ver Todos os Eventos
            </Button>
            <Button variant="primary" onClick={onOpenNewEvent} icon={<Plus size={16} />}>
              Criar Novo Evento
            </Button>
          </div>
        }
      />

      {/* Main KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="RECEITA TOTAL"
          value={formatCurrency(totalRevenue)}
          trend="↑ 12,4%"
          trendDirection="up"
          note="vs. mês anterior"
          accent="green"
          icon={<CircleDollarSign size={20} />}
        />
        <KpiCard
          label="VENDAS TOTAIS"
          value={`${totalSales.toLocaleString('pt-BR')} un.`}
          trend="↑ 8,7%"
          trendDirection="up"
          note="ingressos emitidos"
          accent="blue"
          icon={<ShoppingCart size={20} />}
        />
        <KpiCard
          label="TICKET MÉDIO"
          value={formatCurrency(avgTicket)}
          note="por comprador"
          accent="purple"
          icon={<Ticket size={20} />}
        />
        <KpiCard
          label="TAXA DE OCUPAÇÃO"
          value={`${averageOccupancy.toFixed(1)}%`}
          note="capacidade geral"
          accent="orange"
          icon={<Users size={20} />}
        />
      </div>

      {/* Two-Column Graphs Placeholder / Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Receita por Período */}
        <Card padding="md" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[17px] font-bold text-[#0E1726]">Receita por Período</h2>
              <span className="text-[12px] font-bold text-[#10B981]">Últimos 30 dias</span>
            </div>
            <p className="text-[12px] text-[#718096]">Curva acumulada de faturamento bruto processado.</p>
          </div>

          <div className="my-6 flex items-end gap-2 h-40 pt-6">
            {[40, 55, 30, 75, 90, 65, 80, 95, 70, 85, 100, 88].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <div 
                  className="w-full bg-[#1677FF]/80 rounded-t group-hover:bg-[#1677FF] transition-all"
                  style={{ height: `${val}%` }}
                />
                <span className="text-[10px] text-slate-400 font-mono">D{idx+1}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#EDF0F4] flex items-center justify-between text-xs text-[#718096]">
            <span>Total processado no período:</span>
            <strong className="text-[#0E1726] font-bold">{formatCurrency(totalRevenue)}</strong>
          </div>
        </Card>

        {/* Vendas por Evento */}
        <Card padding="md" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[17px] font-bold text-[#0E1726]">Vendas por Evento</h2>
              <span className="text-[12px] font-bold text-[#1677FF]">Top Desempenho</span>
            </div>
            <p className="text-[12px] text-[#718096]">Volume proporcional de vendas entre os eventos ativos.</p>
          </div>

          <div className="my-4 space-y-3">
            {events.slice(0, 4).map((ev) => (
              <div key={ev.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0E1726] truncate max-w-[200px]">{ev.title}</span>
                  <span className="font-semibold text-slate-600">{ev.salesCount} vendas</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-[#1677FF] h-full rounded-full" 
                    style={{ width: `${Math.min(ev.occupancyRate, 100)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#EDF0F4] flex items-center justify-between text-xs text-[#718096]">
            <span>Total de ingressos emitidos:</span>
            <strong className="text-[#0E1726] font-bold">{totalSales.toLocaleString('pt-BR')} un.</strong>
          </div>
        </Card>
      </div>

      {/* Latest Events DataTable */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold text-[#0E1726]">Últimos Eventos & Vendas</h2>
          <button onClick={onNavigateToEvents} className="text-xs font-bold text-[#1677FF] hover:underline">
            Ver Todos →
          </button>
        </div>

        <DataTable headers={tableHeaders}>
          {events.map((ev) => (
            <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3.5 px-4 font-bold text-[#0E1726]">
                {ev.title}
              </td>
              <td className="py-3.5 px-4 text-xs text-[#718096]">
                {ev.date} • {ev.venue}
              </td>
              <td className="py-3.5 px-4 text-right font-bold text-[#0E1726]">
                {formatCurrency(ev.totalRevenue)}
              </td>
              <td className="py-3.5 px-4 text-center font-bold text-[#1677FF]">
                {ev.salesCount.toLocaleString('pt-BR')}
              </td>
              <td className="py-3.5 px-4 text-center font-bold text-[#F97316]">
                {ev.occupancyRate.toFixed(1)}%
              </td>
              <td className="py-3.5 px-4 text-center">
                <Badge status={ev.status} />
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
};
