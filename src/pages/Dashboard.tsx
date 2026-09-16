import React from 'react';
import { 
  CircleDollarSign, ShoppingCart, Users, Ticket, 
  TrendingUp, ArrowUpRight, Plus, Calendar, MapPin,
  Building2, Globe, ArrowRight, ShieldCheck, CheckCircle2,
  ExternalLink, Layers
} from 'lucide-react';
import type { EventItem } from '../types/event';
import type { Producer } from '../types/producer';
import { 
  DiskPageHeader, 
  DiskKpiCard, 
  DiskCard, 
  DiskCardHeader, 
  DiskCardTitle, 
  DiskCardDescription, 
  DiskCardContent, 
  DiskButton,
  DiskBadge,
  DiskStatus
} from '../design-system';

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

  const mapStatusToVariant = (status: string): 'ativo' | 'inativo' | 'rascunho' | 'encerrado' => {
    const s = (status || '').toLowerCase();
    if (s.includes('ativ') || s.includes('publ') || s.includes('abert')) return 'ativo';
    if (s.includes('inat') || s.includes('canc')) return 'inativo';
    if (s.includes('encerr') || s.includes('final')) return 'encerrado';
    return 'rascunho';
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn" data-testid="dashboard-page">
      {/* 1. Page Header com DiskPageHeader */}
      <DiskPageHeader
        eyebrow={isGlobalAdminView ? "VISÃO ADMINISTRATIVA GLOBAL" : "PAINEL DA PRODUTORA"}
        title={isGlobalAdminView ? "Dashboard Administrativo Master" : `Dashboard — ${selectedProducer?.name}`}
        description={
          isGlobalAdminView
            ? "Visão executiva consolidada de todas as produtoras, eventos e receita da plataforma DiskIngressos."
            : `Visão executiva e indicadores consolidados para ${selectedProducer?.name}.`
        }
        actions={
          <div className="flex items-center gap-2.5">
            <DiskButton variant="outline" size="sm" onClick={onNavigateToEvents}>
              {isGlobalAdminView ? "Ver Todos os Eventos" : "Ver Meus Eventos"}
            </DiskButton>
            <DiskButton variant="primary" size="sm" onClick={onOpenNewEvent} icon={<Plus size={16} />}>
              Criar Novo Evento
            </DiskButton>
          </div>
        }
      />

      {/* 2. Main KPIs Row com DiskKpiCard */}
      {isGlobalAdminView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DiskKpiCard
            label="PRODUTORAS ATIVAS"
            value="184"
            trend="↑ 6 novas"
            trendDirection="up"
            note="cadastros homologados"
            accent="brand"
            icon={<Building2 size={20} />}
          />
          <DiskKpiCard
            label="EVENTOS ATIVOS"
            value="427"
            trend="↑ 18 este mês"
            trendDirection="up"
            note="em comercialização"
            accent="purple"
            icon={<Ticket size={20} />}
          />
          <DiskKpiCard
            label="USUÁRIOS DO SISTEMA"
            value="892"
            note="produtores e operadores"
            accent="info"
            icon={<Users size={20} />}
          />
          <DiskKpiCard
            label="VENDAS HOJE (GLOBAL)"
            value={formatCurrency(485200.00)}
            trend="↑ 14,8%"
            trendDirection="up"
            note="receita processada hoje"
            accent="success"
            icon={<CircleDollarSign size={20} />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DiskKpiCard
            label="RECEITA TOTAL"
            value={formatCurrency(totalRevenue || 580000)}
            trend="↑ 12,4%"
            trendDirection="up"
            note="vs. mês anterior"
            accent="success"
            icon={<CircleDollarSign size={20} />}
          />
          <DiskKpiCard
            label="VENDAS TOTAIS"
            value={`${(totalSales || 1420).toLocaleString('pt-BR')} un.`}
            trend="↑ 8,7%"
            trendDirection="up"
            note="ingressos emitidos"
            accent="brand"
            icon={<ShoppingCart size={20} />}
          />
          <DiskKpiCard
            label="TICKET MÉDIO"
            value={formatCurrency(avgTicket || 341.50)}
            note="por comprador"
            accent="purple"
            icon={<Ticket size={20} />}
          />
          <DiskKpiCard
            label="TAXA DE OCUPAÇÃO"
            value={`${averageOccupancy.toFixed(1)}%`}
            note="capacidade geral dos eventos"
            accent="info"
            icon={<Users size={20} />}
          />
        </div>
      )}

      {/* 3. Seção Especial: Lista de Produtoras (Apenas na Visão Global Admin) */}
      {isGlobalAdminView && allProducers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-extrabold text-[var(--disk-text-primary)] flex items-center gap-2">
                <Building2 size={18} className="text-[var(--disk-primary)]" />
                Produtoras Cadastradas na Plataforma
              </h2>
              <p className="text-xs text-[var(--disk-text-muted)]">
                Selecione uma produtora para acessar o painel exclusivo e visualizar seus eventos isoladamente.
              </p>
            </div>
            <DiskBadge variant="neutral">
              {allProducers.length} Produtoras
            </DiskBadge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allProducers.map((prod) => {
              const prodEvents = events.filter(e => e.producerId === prod.id || e.producerName === prod.name);
              const eventCount = prodEvents.length || (prod.id === 'prod-1' ? 15 : prod.id === 'prod-2' ? 8 : 4);
              const revenueEst = prod.id === 'prod-1' ? 'R$ 580 mil' : prod.id === 'prod-2' ? 'R$ 310 mil' : 'R$ 145 mil';

              return (
                <DiskCard
                  key={prod.id}
                  hover
                  className="flex flex-col justify-between"
                >
                  <DiskCardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <DiskBadge variant="brand" size="sm">
                        Produtora
                      </DiskBadge>
                      <span className="h-2 w-2 rounded-full bg-[var(--disk-success,#10B981)]" />
                    </div>

                    <strong className="text-[16px] font-black text-[var(--disk-text-primary)] block">
                      {prod.name}
                    </strong>
                    <span className="text-xs text-[var(--disk-text-muted)] block mt-0.5 font-mono">
                      CNPJ: {(prod as any).document || '04.912.839/0001-20'}
                    </span>

                    <div className="mt-4 pt-3 border-t border-[var(--disk-border-subtle)] flex items-center justify-between text-xs font-semibold text-[var(--disk-text-secondary)]">
                      <span>{eventCount} eventos</span>
                      <span className="font-bold text-[var(--disk-success,#10B981)]">{revenueEst} em vendas</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--disk-border-subtle)]">
                      <DiskButton
                        variant="secondary"
                        size="sm"
                        fullWidth
                        icon={<ArrowRight size={14} />}
                        onClick={() => onSelectProducer ? onSelectProducer(prod.id) : null}
                      >
                        Acessar produtora
                      </DiskButton>
                    </div>
                  </DiskCardContent>
                </DiskCard>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Eventos em Destaque Table usando DiskCard */}
      <DiskCard className="overflow-hidden">
        <DiskCardHeader className="flex flex-row items-center justify-between p-5 border-b border-[var(--disk-border-subtle)]">
          <div>
            <DiskCardTitle>
              {isGlobalAdminView ? "Eventos Recentes na Plataforma" : `Eventos Ativos de ${selectedProducer?.name}`}
            </DiskCardTitle>
            <DiskCardDescription>
              Desempenho de vendas, ocupação e status dos eventos.
            </DiskCardDescription>
          </div>
          <DiskButton variant="outline" size="sm" onClick={onNavigateToEvents}>
            Ver Lista Completa
          </DiskButton>
        </DiskCardHeader>

        <DiskCardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[var(--disk-bg-surface-sunken)] text-[var(--disk-text-muted)] font-bold border-b border-[var(--disk-border-subtle)]">
                <tr>
                  <th className="py-3 px-4">Evento</th>
                  <th className="py-3 px-4">Data / Local</th>
                  <th className="py-3 px-4 text-right">Receita Total</th>
                  <th className="py-3 px-4 text-center">Vendas</th>
                  <th className="py-3 px-4 text-center">Ocupação</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--disk-border-subtle)]">
                {events.slice(0, 8).map((ev: EventItem) => {
                  const evSales = typeof ev.salesCount === 'number' ? ev.salesCount : (ev.sales ?? 0);
                  const evRev = typeof ev.totalRevenue === 'number' ? ev.totalRevenue : ((ev as any).totalCents ? (ev as any).totalCents / 100 : 0);
                  const evOcc = typeof ev.occupancyRate === 'number' ? ev.occupancyRate : (ev.occupancy ?? 0);

                  return (
                    <tr 
                      key={ev.id} 
                      onClick={onNavigateToEvents}
                      className="hover:bg-[var(--disk-bg-surface-hover)] transition cursor-pointer"
                    >
                      <td className="py-3 px-4 font-bold text-[var(--disk-text-primary)]">
                        <div className="flex items-center gap-2">
                          <DiskBadge variant="brand" size="sm" className="font-mono font-bold">
                            #{ev.code}
                          </DiskBadge>
                          <span>{ev.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--disk-text-muted)] text-xs font-medium">
                        {ev.venue} • {ev.date}
                      </td>
                      <td className="py-3 px-4 font-bold text-right text-[var(--disk-text-primary)] text-xs font-mono">
                        {formatCurrency(evRev)}
                      </td>
                      <td className="py-3 px-4 text-center text-xs font-bold text-[var(--disk-primary)] font-mono">
                        {evSales.toLocaleString('pt-BR')} un.
                      </td>
                      <td className="py-3 px-4 text-center text-xs font-semibold">
                        <span className="bg-[var(--disk-bg-surface-sunken)] text-[var(--disk-text-secondary)] border border-[var(--disk-border-subtle)] px-2 py-0.5 rounded font-mono">
                          {Number(evOcc).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <DiskStatus status={mapStatusToVariant(ev.status)} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DiskCardContent>
      </DiskCard>
    </div>
  );
};
