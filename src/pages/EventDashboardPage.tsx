import React from 'react';
import { 
  ArrowLeft, CircleDollarSign, ScanLine, ShoppingCart, 
  Ticket, Users, MapPin, CalendarDays, Edit
} from 'lucide-react';
import type { EventItem } from '../types/event';
import type { Participant } from '../data/participants';
import { PageHeader } from '../components/ui/PageHeader';
import { KpiCard } from '../components/ui/KpiCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EventCoverVisual } from '../components/events/EventCoverVisual';

interface EventDashboardPageProps {
  event: EventItem;
  participants: Participant[];
  onBack: () => void;
  onNavigateToParticipants: () => void;
  onNavigateToLots: () => void;
  onNavigateToEdit: () => void;
}

export const EventDashboardPage: React.FC<EventDashboardPageProps> = ({
  event,
  participants,
  onBack,
  onNavigateToParticipants,
  onNavigateToLots,
  onNavigateToEdit,
}) => {
  const eventParticipants = participants.filter((p) => p.eventId === event.id);
  const presentCount = eventParticipants.filter((p) => p.checkin === 'presente' || p.checkinStatus === 'realizado').length;
  const pendingCount = eventParticipants.length - presentCount;
  const entryRate = eventParticipants.length > 0 ? Math.round((presentCount / eventParticipants.length) * 100) : 0;

  const formatCurrency = (val?: number) => {
    return (val || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-[#1677FF] hover:underline"
      >
        <ArrowLeft size={16} />
        Voltar para Todos os Eventos
      </button>

      {/* Hero Header Card */}
      <Card padding="md" className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="hidden sm:block h-20 w-28 rounded-btn overflow-hidden shadow-xs shrink-0 bg-slate-900">
            <EventCoverVisual event={event} className="h-full w-full" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold tracking-widest uppercase text-[#64748B]">
                PAINEL DO EVENTO • #{event.code}
              </span>
              <Badge status={event.status} />
            </div>
            <h1 className="text-[22px] sm:text-[26px] font-bold text-[#0E1726] tracking-tight leading-tight">
              {event.title}
            </h1>
            <p className="text-[13px] text-[#718096] mt-1 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <MapPin size={13} className="text-[#EF4444]" />
                {event.venue} — {event.city || 'Curitiba'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <CalendarDays size={13} className="text-[#1677FF]" />
                {event.date}
              </span>
              <span>•</span>
              <span>{event.producerName || event.producer}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="secondary" onClick={onNavigateToEdit} icon={<Edit size={15} />}>
            Editar
          </Button>
          <Button variant="primary" onClick={onNavigateToLots} icon={<Ticket size={15} />}>
            Configurar Lotes
          </Button>
        </div>
      </Card>

      {/* Main KPIs Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="RECEITA PROCESSADA"
          value={formatCurrency(event.totalRevenue)}
          trend="↑ 14,2%"
          trendDirection="up"
          note="vendas aprovadas"
          accent="green"
          icon={<CircleDollarSign size={20} />}
        />
        <KpiCard
          label="INGRESSOS VENDIDOS"
          value={`${event.salesCount.toLocaleString('pt-BR')} un.`}
          note={`Ticket Médio ${formatCurrency(event.averageTicketPrice || 0)}`}
          accent="blue"
          icon={<ShoppingCart size={20} />}
        />
        <KpiCard
          label="DISPONÍVEIS"
          value={`${event.availableCount.toLocaleString('pt-BR')} un.`}
          note="estoque ativo"
          accent="cyan"
          icon={<Ticket size={20} />}
        />
        <KpiCard
          label="CHECK-INS"
          value={`${presentCount} presentes`}
          note={`${eventParticipants.length} na base`}
          accent="purple"
          icon={<Users size={20} />}
        />
      </div>

      {/* Operational Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Insight 1: Ocupação do Evento */}
        <Card padding="md" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-[17px] font-bold text-[#0E1726]">Ocupação do Evento</h2>
                <p className="text-[12px] text-[#718096]">Capacidade utilizada considerando vendas e cortesias.</p>
              </div>
              <strong className="text-[20px] font-bold text-[#0E1726]">
                {event.occupancyRate.toFixed(1)}%
              </strong>
            </div>

            <div className="mt-4 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full rounded-full bg-[#1677FF] transition-all duration-500"
                style={{ width: `${Math.min(event.occupancyRate, 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EDF0F4] grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-btn bg-[#F8FAFC] p-2.5">
              <span className="text-[10px] font-bold uppercase text-[#64748B] block">Vendas</span>
              <strong className="text-[15px] font-bold text-[#0E1726]">{event.salesCount}</strong>
            </div>
            <div className="rounded-btn bg-[#F8FAFC] p-2.5">
              <span className="text-[10px] font-bold uppercase text-[#64748B] block">Cortesias</span>
              <strong className="text-[15px] font-bold text-[#0E1726]">{event.courtesyCount}</strong>
            </div>
            <div className="rounded-btn bg-[#F8FAFC] p-2.5">
              <span className="text-[10px] font-bold uppercase text-[#64748B] block">Disponíveis</span>
              <strong className="text-[15px] font-bold text-[#0E1726]">{event.availableCount}</strong>
            </div>
          </div>
        </Card>

        {/* Insight 2: Operação de Entrada */}
        <Card padding="md" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-[17px] font-bold text-[#0E1726]">Operação de Entrada</h2>
                <p className="text-[12px] text-[#718096]">Status dos participantes vinculados a este evento.</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-[#06B6D4]">
                <ScanLine size={20} />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center py-2">
              <div className="flex flex-col items-center justify-center rounded-full border-4 border-emerald-500/20 border-t-[#10B981] h-24 w-24">
                <strong className="text-[22px] font-bold text-[#0E1726]">{entryRate}%</strong>
                <span className="text-[10px] font-bold text-[#10B981] uppercase">Já entraram</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#EDF0F4] grid grid-cols-2 gap-3 text-center text-xs">
            <div className="rounded-btn bg-emerald-50 p-2.5 text-[#15803D]">
              <span className="text-[10px] font-bold uppercase block">Presentes no local</span>
              <strong className="text-[14px] font-bold">{presentCount} pessoas</strong>
            </div>
            <div className="rounded-btn bg-amber-50 p-2.5 text-[#C2410C]">
              <span className="text-[10px] font-bold uppercase block">Entradas pendentes</span>
              <strong className="text-[14px] font-bold">{pendingCount} pessoas</strong>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Action Navigation Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={onNavigateToParticipants}
          className="flex flex-col items-start p-5 rounded-card border border-[#E2E8F0] bg-white hover:border-[#1677FF] hover:shadow-cardHover transition text-left group cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-blue-50 text-[#1677FF] group-hover:bg-[#1677FF] group-hover:text-white transition mb-3">
            <Users size={20} />
          </div>
          <strong className="text-[15px] font-bold text-[#0E1726] group-hover:text-[#1677FF] transition">
            Ver Participantes
          </strong>
          <span className="text-[12px] text-[#718096] mt-0.5">
            Lista completa, validação facial e check-in
          </span>
        </button>

        <button
          onClick={onNavigateToLots}
          className="flex flex-col items-start p-5 rounded-card border border-[#E2E8F0] bg-white hover:border-[#7C3AED] hover:shadow-cardHover transition text-left group cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-purple-50 text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white transition mb-3">
            <Ticket size={20} />
          </div>
          <strong className="text-[15px] font-bold text-[#0E1726] group-hover:text-[#7C3AED] transition">
            Gerenciar Lotes
          </strong>
          <span className="text-[12px] text-[#718096] mt-0.5">
            Configuração de preços e disponibilidade
          </span>
        </button>

        <button
          onClick={onNavigateToParticipants}
          className="flex flex-col items-start p-5 rounded-card border border-[#E2E8F0] bg-white hover:border-[#06B6D4] hover:shadow-cardHover transition text-left group cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-cyan-50 text-[#06B6D4] group-hover:bg-[#06B6D4] group-hover:text-white transition mb-3">
            <ScanLine size={20} />
          </div>
          <strong className="text-[15px] font-bold text-[#0E1726] group-hover:text-[#06B6D4] transition">
            Controle de Acesso
          </strong>
          <span className="text-[12px] text-[#718096] mt-0.5">
            Operação de portões e biometria facial
          </span>
        </button>
      </div>
    </div>
  );
};
