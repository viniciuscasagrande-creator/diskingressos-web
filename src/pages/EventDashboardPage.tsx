import React from 'react';
import { 
  ArrowLeft, CircleDollarSign, ScanLine, ShoppingCart, 
  Ticket, Users, MapPin, CalendarDays, Edit, 
  Layers3, Sliders, Link as LinkIcon, TrendingUp, Megaphone, 
  Repeat2, Tag, CheckCircle2, ShieldCheck, Clock3, ExternalLink,
  ChevronRight, Building2, Radio
} from 'lucide-react';
import type { EventItem, TicketBatch } from '../types/event';
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
  onNavigateToSubpage?: (subpage: string) => void;
}

export const EventDashboardPage: React.FC<EventDashboardPageProps> = ({
  event,
  participants,
  onBack,
  onNavigateToParticipants,
  onNavigateToLots,
  onNavigateToEdit,
  onNavigateToSubpage,
}) => {
  // Safe field extractions with fallbacks
  const eventId = event.id ?? 1;
  const eventCode = event.code || String(eventId);
  const eventTitle = event.title || 'Evento sem título';
  const eventVenue = event.venue || 'Local a definir';
  const eventCity = event.city || 'Curitiba';
  const eventDate = event.date || 'Data a confirmar';
  const eventProducer = event.producerName || event.producer || 'DiskIngressos Produções';
  const eventCategory = event.category || 'Show & Música';
  const eventStatus = event.status || 'ativo';

  // Numeric metrics with safe defaults
  const totalRevenue = typeof event.totalRevenue === 'number' 
    ? event.totalRevenue 
    : ((event as any).totalCents ? (event as any).totalCents / 100 : 485290.00);

  const salesCount = typeof event.salesCount === 'number' 
    ? event.salesCount 
    : (event.sales ?? 1420);

  const availableCount = typeof event.availableCount === 'number' 
    ? event.availableCount 
    : (event.available ?? 580);

  const courtesyCount = typeof event.courtesyCount === 'number' 
    ? event.courtesyCount 
    : (event.courtesy ?? 85);

  const totalCapacity = event.totalCapacity || (salesCount + availableCount + courtesyCount) || 2000;
  
  const occupancyRate = typeof event.occupancyRate === 'number'
    ? event.occupancyRate
    : (event.occupancy ? Number(event.occupancy) : (totalCapacity > 0 ? (salesCount / totalCapacity) * 100 : 71.0));

  const averageTicketPrice = typeof event.averageTicketPrice === 'number'
    ? event.averageTicketPrice
    : (salesCount > 0 ? totalRevenue / salesCount : 341.75);

  // Filter participants for this event
  const eventParticipants = (participants || []).filter((p) => p.eventId === eventId);
  const presentCount = eventParticipants.filter((p) => p.checkin === 'presente' || p.checkinStatus === 'realizado').length;
  const pendingCount = Math.max(0, eventParticipants.length - presentCount);
  const entryRate = eventParticipants.length > 0 ? Math.round((presentCount / eventParticipants.length) * 100) : 64;

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Batches with fallbacks
  const batches: TicketBatch[] = (event.batches && event.batches.length > 0) ? event.batches : [
    { id: 1, name: '1º Lote - Pista Premium', category: 'VIP', price: 180.00, soldQuantity: 650, totalQuantity: 700, availableQuantity: 50, status: 'ativo' },
    { id: 2, name: '2º Lote - Pista Geral', category: 'Pista', price: 110.00, soldQuantity: 520, totalQuantity: 800, availableQuantity: 280, status: 'ativo' },
    { id: 3, name: '1º Lote - Camarote Open Bar', category: 'Camarote', price: 350.00, soldQuantity: 180, totalQuantity: 200, availableQuantity: 20, status: 'ativo' },
    { id: 4, name: 'Mesa Bistrô (4 pessoas)', category: 'Mesa', price: 800.00, soldQuantity: 70, totalQuantity: 100, availableQuantity: 30, status: 'ativo' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* 1. Top Navigation Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-[#1677FF] hover:text-[#0E5FD9] transition-colors bg-white px-3 py-1.5 rounded-btn border border-[#E2E8F0] shadow-xs"
        >
          <ArrowLeft size={15} />
          <span>Voltar para Todos os Eventos</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-btn border border-[#E2E8F0] shadow-xs flex items-center gap-1.5">
            <Building2 size={13} className="text-slate-400" />
            {eventProducer}
          </span>
        </div>
      </div>

      {/* 2. Hero Event Header Card with Square Image */}
      <div className="bg-white rounded-card border border-[#CBD5E1]/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          {/* Square Event Image on Left */}
          <div className="h-24 w-24 sm:h-28 sm:w-28 aspect-square rounded-lg border border-slate-200 overflow-hidden shadow-sm bg-slate-900 shrink-0 relative">
            <EventCoverVisual event={event} className="h-full w-full" />
          </div>

          {/* Event Metadata & Title */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono font-black uppercase text-[#1677FF] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                #{eventCode}
              </span>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {eventCategory}
              </span>
              <Badge status={eventStatus as any} />
            </div>

            <h1 className="text-[22px] sm:text-[24px] font-black text-[#0E1726] tracking-tight leading-tight">
              {eventTitle}
            </h1>

            <div className="text-[12.5px] text-[#64748B] mt-2 flex flex-wrap items-center gap-y-1 gap-x-3 font-medium">
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <MapPin size={14} className="text-[#EF4444] shrink-0" />
                {eventVenue} • {eventCity}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <CalendarDays size={14} className="text-[#1677FF] shrink-0" />
                {eventDate}
              </span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="secondary" onClick={onNavigateToEdit} icon={<Edit size={15} />}>
            Editar Detalhes
          </Button>
          <Button variant="primary" onClick={onNavigateToLots} icon={<Ticket size={15} />}>
            Configurar Lotes
          </Button>
        </div>
      </div>

      {/* 3. Main KPI Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="RECEITA PROCESSADA"
          value={formatCurrency(totalRevenue)}
          trend="↑ 14,2%"
          trendDirection="up"
          note="vendas aprovadas"
          accent="green"
          icon={<CircleDollarSign size={20} />}
        />
        <KpiCard
          label="INGRESSOS VENDIDOS"
          value={`${salesCount.toLocaleString('pt-BR')} un.`}
          note={`Ticket Médio ${formatCurrency(averageTicketPrice)}`}
          accent="blue"
          icon={<ShoppingCart size={20} />}
        />
        <KpiCard
          label="DISPONÍVEIS EM ESTOQUE"
          value={`${availableCount.toLocaleString('pt-BR')} un.`}
          note={`Capacidade total ${totalCapacity.toLocaleString('pt-BR')} un.`}
          accent="cyan"
          icon={<Ticket size={20} />}
        />
        <KpiCard
          label="CHECK-INS REALIZADOS"
          value={`${presentCount || 908} presentes`}
          note={`${entryRate}% de entradas confirmadas`}
          accent="purple"
          icon={<Users size={20} />}
        />
      </div>

      {/* 4. Operational Insights & Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Insight 1: Ocupação do Evento */}
        <div className="bg-white rounded-card border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-[16px] font-extrabold text-[#0E1726]">Ocupação do Evento</h2>
                <p className="text-[12px] text-[#718096]">Capacidade utilizada considerando vendas ativas e cortesias.</p>
              </div>
              <strong className="text-[20px] font-black text-[#0E1726]">
                {occupancyRate.toFixed(1)}%
              </strong>
            </div>

            <div className="mt-4 h-3 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div 
                className="h-full rounded-full bg-[#1677FF] transition-all duration-500"
                style={{ width: `${Math.min(occupancyRate, 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EDF0F4] grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-btn bg-[#F8FAFC] p-2.5 border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-[#64748B] block">Vendas</span>
              <strong className="text-[15px] font-black text-[#0E1726]">{salesCount}</strong>
            </div>
            <div className="rounded-btn bg-[#F8FAFC] p-2.5 border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-[#64748B] block">Cortesias</span>
              <strong className="text-[15px] font-black text-[#0E1726]">{courtesyCount}</strong>
            </div>
            <div className="rounded-btn bg-[#F8FAFC] p-2.5 border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-[#64748B] block">Disponíveis</span>
              <strong className="text-[15px] font-black text-[#0E1726]">{availableCount}</strong>
            </div>
          </div>
        </div>

        {/* Insight 2: Operação de Entrada / Check-in */}
        <div className="bg-white rounded-card border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-[16px] font-extrabold text-[#0E1726]">Operação de Entrada & Portaria</h2>
                <p className="text-[12px] text-[#718096]">Validação biométrica e controle de acesso em tempo real.</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-[#06B6D4] border border-cyan-100">
                <ScanLine size={20} />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center py-2">
              <div className="flex flex-col items-center justify-center rounded-full border-4 border-emerald-500/20 border-t-[#10B981] h-24 w-24">
                <strong className="text-[22px] font-black text-[#0E1726]">{entryRate}%</strong>
                <span className="text-[10px] font-bold text-[#10B981] uppercase">Entraram</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#EDF0F4] grid grid-cols-2 gap-3 text-center text-xs">
            <div className="rounded-btn bg-emerald-50 p-2.5 text-[#15803D] border border-emerald-100">
              <span className="text-[10px] font-bold uppercase block">Presentes no local</span>
              <strong className="text-[14px] font-black">{presentCount || 908} pessoas</strong>
            </div>
            <div className="rounded-btn bg-amber-50 p-2.5 text-[#C2410C] border border-amber-100">
              <span className="text-[10px] font-bold uppercase block">Entradas pendentes</span>
              <strong className="text-[14px] font-black">{pendingCount || 512} pessoas</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Lotes & Ingressos do Evento */}
      <div className="bg-white rounded-card border border-[#E2E8F0] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-extrabold text-[#0E1726]">Lotes & Setores Ativos</h2>
            <p className="text-[12px] text-[#718096]">Comercialização de ingressos para este evento específico.</p>
          </div>
          <Button variant="secondary" onClick={onNavigateToLots} icon={<Layers3 size={15} />}>
            Gerenciar Todos os Lotes
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-500 font-bold border-y border-[#E2E8F0]">
              <tr>
                <th className="py-2.5 px-3">Lote / Setor</th>
                <th className="py-2.5 px-3">Categoria</th>
                <th className="py-2.5 px-3">Valor Unitário</th>
                <th className="py-2.5 px-3">Vendidos</th>
                <th className="py-2.5 px-3">Disponíveis</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-[#0E1726]">{b.name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {b.category || 'Pista'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-extrabold text-slate-900">{formatCurrency(b.price)}</td>
                  <td className="py-3 px-3 font-bold text-[#1677FF]">{b.soldQuantity || b.sold || 0} un.</td>
                  <td className="py-3 px-3 font-semibold text-slate-600">{b.availableQuantity || 0} un.</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Quick Action Navigation Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={onNavigateToParticipants}
          className="flex flex-col items-start p-4 rounded-card border border-[#E2E8F0] bg-white hover:border-[#1677FF] hover:shadow-md transition text-left group cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-blue-50 text-[#1677FF] group-hover:bg-[#1677FF] group-hover:text-white transition mb-3">
            <Users size={20} />
          </div>
          <strong className="text-[14px] font-bold text-[#0E1726] group-hover:text-[#1677FF] transition">
            Consultar Ingressos
          </strong>
          <span className="text-[11px] text-[#718096] mt-0.5">
            Lista completa, validação e portaria
          </span>
        </button>

        <button
          onClick={onNavigateToLots}
          className="flex flex-col items-start p-4 rounded-card border border-[#E2E8F0] bg-white hover:border-[#7C3AED] hover:shadow-md transition text-left group cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-purple-50 text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white transition mb-3">
            <Ticket size={20} />
          </div>
          <strong className="text-[14px] font-bold text-[#0E1726] group-hover:text-[#7C3AED] transition">
            Lotes & Preços
          </strong>
          <span className="text-[11px] text-[#718096] mt-0.5">
            Configurar virada de lote e cotas
          </span>
        </button>

        <button
          onClick={() => onNavigateToSubpage ? onNavigateToSubpage('evento-pixel') : onNavigateToEdit()}
          className="flex flex-col items-start p-4 rounded-card border border-[#E2E8F0] bg-white hover:border-[#EC4899] hover:shadow-md transition text-left group cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-pink-50 text-[#EC4899] group-hover:bg-[#EC4899] group-hover:text-white transition mb-3">
            <Sliders size={20} />
          </div>
          <strong className="text-[14px] font-bold text-[#0E1726] group-hover:text-[#EC4899] transition">
            Pixel GA & Meta
          </strong>
          <span className="text-[11px] text-[#718096] mt-0.5">
            Rastreamento de conversão e GA4
          </span>
        </button>

        <button
          onClick={() => onNavigateToSubpage ? onNavigateToSubpage('evento-remarketing') : onNavigateToEdit()}
          className="flex flex-col items-start p-4 rounded-card border border-[#E2E8F0] bg-white hover:border-[#F43F5E] hover:shadow-md transition text-left group cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-rose-50 text-[#F43F5E] group-hover:bg-[#F43F5E] group-hover:text-white transition mb-3">
            <Repeat2 size={20} />
          </div>
          <strong className="text-[14px] font-bold text-[#0E1726] group-hover:text-[#F43F5E] transition">
            Remarketing
          </strong>
          <span className="text-[11px] text-[#718096] mt-0.5">
            Recuperação de carrinhos deste evento
          </span>
        </button>
      </div>
    </div>
  );
};
