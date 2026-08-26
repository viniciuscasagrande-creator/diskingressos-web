import React from 'react';
import { CircleDollarSign, ShoppingBag, Ticket, Percent, Calendar } from 'lucide-react';
import type { EventItem } from '../../types/event';
import { KpiCard } from '../ui/KpiCard';

interface EventSummaryKPIsProps {
  events: EventItem[];
}

export const EventSummaryKPIs: React.FC<EventSummaryKPIsProps> = ({ events }) => {
  const totalRevenue = events.reduce((acc, ev) => acc + (ev.totalRevenue || 0), 0);
  const totalSales = events.reduce((acc, ev) => acc + (ev.salesCount || 0), 0);
  const totalAvailable = events.reduce((acc, ev) => acc + (ev.availableCount || 0), 0);
  const totalCapacity = events.reduce((acc, ev) => acc + (ev.totalCapacity || 0), 0);
  const averageOccupancy = totalCapacity > 0 ? (totalSales / totalCapacity) * 100 : 0;

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* 1. Receita Bruta (Verde) */}
      <KpiCard
        label="RECEITA TOTAL"
        value={formatCurrency(totalRevenue)}
        trend="↑ 12,4%"
        trendDirection="up"
        note="vs. mês anterior"
        accent="green"
        icon={<CircleDollarSign size={20} />}
      />

      {/* 2. Ingressos Vendidos (Azul) */}
      <KpiCard
        label="VENDAS PROCESSADAS"
        value={`${totalSales.toLocaleString('pt-BR')} un.`}
        trend="↑ 8,7%"
        trendDirection="up"
        note="conversão alta"
        accent="blue"
        icon={<ShoppingBag size={20} />}
      />

      {/* 3. Ingressos Disponíveis (Ciano) */}
      <KpiCard
        label="DISPONIBILIDADE"
        value={`${totalAvailable.toLocaleString('pt-BR')} un.`}
        note="estoque ativo"
        accent="cyan"
        icon={<Ticket size={20} />}
      />

      {/* 4. Ocupação Média (Laranja) */}
      <KpiCard
        label="OCUPAÇÃO MÉDIA"
        value={`${averageOccupancy.toFixed(1)}%`}
        note="capacidade total"
        accent="orange"
        icon={<Percent size={20} />}
      />

      {/* 5. Eventos Ativos (Slate) */}
      <KpiCard
        label="EVENTOS FILTRADOS"
        value={`${events.length} eventos`}
        note="na visualização"
        accent="slate"
        icon={<Calendar size={20} />}
      />
    </div>
  );
};
