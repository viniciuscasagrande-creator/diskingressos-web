import React, { useState, useMemo } from 'react';
import { 
  Download, Search, ScanFace, TicketCheck, UserCheck, 
  Users, CheckCircle2, ShieldCheck
} from 'lucide-react';
import type { EventItem } from '../types/event';
import type { Participant } from '../data/participants';
import { PageHeader } from '../components/ui/PageHeader';
import { KpiCard } from '../components/ui/KpiCard';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FilterBar } from '../components/ui/FilterBar';

interface ParticipantsPageProps {
  events: EventItem[];
  participants: Participant[];
  selectedEvent: EventItem | null;
  onSelectEvent: (event: EventItem | null) => void;
  onToggleCheckin: (id: number) => void;
}

export const ParticipantsPage: React.FC<ParticipantsPageProps> = ({
  events,
  participants,
  selectedEvent,
  onSelectEvent,
  onToggleCheckin,
}) => {
  const [query, setQuery] = useState('');
  const [eventIdFilter, setEventIdFilter] = useState<string>(selectedEvent ? String(selectedEvent.id) : 'todos');
  const [checkinFilter, setCheckinFilter] = useState<string>('todos');

  // Filter logic
  const filtered = useMemo(() => {
    return participants.filter((p) => {
      const matchQuery = `${p.name} ${p.email} ${p.order || ''} ${p.document || ''} ${p.ticket || ''}`
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchEvent = eventIdFilter === 'todos' || p.eventId === Number(eventIdFilter);
      const matchCheckin = checkinFilter === 'todos' || p.checkin === checkinFilter;

      return matchQuery && matchEvent && matchCheckin;
    });
  }, [participants, query, eventIdFilter, checkinFilter]);

  const presentCount = filtered.filter((p) => p.checkin === 'presente').length;
  const pendingCount = filtered.length - presentCount;
  const entryPercentage = filtered.length > 0 ? Math.round((presentCount / filtered.length) * 100) : 0;

  const handleEventChange = (val: string) => {
    setEventIdFilter(val);
    if (val === 'todos') {
      onSelectEvent(null);
    } else {
      const found = events.find((e) => e.id === Number(val));
      if (found) onSelectEvent(found);
    }
  };

  const tableHeaders = [
    'Participante',
    'Ingresso / Evento',
    'Pedido / Data',
    <div key="facial" className="text-center">Status Facial</div>,
    <div key="checkin" className="text-center">Check-in</div>,
    <div key="valor" className="text-right">Valor</div>,
    <div key="acao" className="text-right pr-2">Ação</div>
  ];

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <PageHeader
        eyebrow="EVENTOS / OPERAÇÃO DE ENTRADA"
        title="Participantes & Check-in"
        subtitle="Consulte compradores, validação facial, ingressos e realize check-in em tempo real."
        actions={
          <Button
            variant="secondary"
            onClick={() => alert('Exportando lista de participantes em formato CSV/Excel...')}
            icon={<Download size={16} />}
          >
            Exportar CSV
          </Button>
        }
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="PARTICIPANTES"
          value={`${filtered.length} pessoas`}
          note="cadastrados na base"
          accent="blue"
          icon={<Users size={20} />}
        />
        <KpiCard
          label="CHECK-INS REALIZADOS"
          value={`${presentCount} presentes`}
          note="acesso liberado"
          accent="green"
          icon={<UserCheck size={20} />}
        />
        <KpiCard
          label="ENTRADAS PENDENTES"
          value={`${pendingCount} aguardando`}
          note="não realizaram entrada"
          accent="orange"
          icon={<CheckCircle2 size={20} />}
        />
        <KpiCard
          label="TAXA DE ENTRADA"
          value={`${entryPercentage}%`}
          note="percentual de presença"
          accent="cyan"
          icon={<ShieldCheck size={20} />}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar nome, e-mail, pedido (#DI-XXXXX) ou documento..."
        statusTabs={{
          current: checkinFilter,
          onChange: setCheckinFilter,
          options: [
            { id: 'todos', label: 'Todos os Status', count: filtered.length },
            { id: 'presente', label: 'Check-in Realizado', count: presentCount },
            { id: 'pendente', label: 'Pendente', count: pendingCount },
          ]
        }}
        selectFilters={
          <select
            value={eventIdFilter}
            onChange={(e) => handleEventChange(e.target.value)}
            className="h-[38px] rounded-input border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[12px] font-bold text-[#0E1726] outline-none transition focus:border-[#1677FF] focus:bg-white"
          >
            <option value="todos">Todos os Eventos ({events.length})</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                #{e.code} — {e.title}
              </option>
            ))}
          </select>
        }
      />

      {/* Standardized DataTable */}
      <DataTable
        headers={tableHeaders}
        empty={filtered.length === 0}
        emptyMessage="Nenhum participante encontrado com os filtros aplicados."
      >
        {filtered.map((p) => {
          const eventName = events.find((e) => e.id === p.eventId)?.title || 'Evento';
          const initials = p.name
            .split(' ')
            .slice(0, 2)
            .map((x) => x[0])
            .join('');

          return (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
              {/* Participante */}
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-800 text-xs shadow-inner">
                    {initials}
                  </div>
                  <div>
                    <strong className="block text-[#0E1726] font-bold">{p.name}</strong>
                    <small className="block text-[11px] text-[#718096]">{p.email}</small>
                    <small className="block text-[10px] text-slate-400 font-mono">{p.document}</small>
                  </div>
                </div>
              </td>

              {/* Ingresso / Evento */}
              <td className="py-3.5 px-4">
                <strong className="block text-[#0E1726] font-bold">{p.ticket}</strong>
                <small className="block text-[11px] text-[#718096] truncate max-w-[200px]" title={eventName}>
                  {eventName}
                </small>
              </td>

              {/* Pedido / Data */}
              <td className="py-3.5 px-4">
                <span className="font-mono font-bold text-[#1677FF] block">{p.order}</span>
                <small className="text-[11px] text-slate-400">{p.purchaseDate}</small>
              </td>

              {/* Facial */}
              <td className="py-3.5 px-4 text-center">
                <Badge status={p.facial} />
              </td>

              {/* Check-in */}
              <td className="py-3.5 px-4 text-center">
                {p.checkin === 'presente' ? (
                  <div className="flex flex-col items-center">
                    <Badge status="presente">Presente</Badge>
                    <small className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      {p.checkinTime || 'Hoje'} {p.gate ? `• ${p.gate}` : ''}
                    </small>
                  </div>
                ) : (
                  <Badge status="pendente">Pendente</Badge>
                )}
              </td>

              {/* Valor */}
              <td className="py-3.5 px-4 text-right font-bold text-[#0E1726]">
                {p.value > 0
                  ? p.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : <span className="text-[#7C3AED] font-bold">Cortesia</span>
                }
              </td>

              {/* Ação */}
              <td className="py-3.5 pr-4 pl-2 text-right">
                <Button
                  variant={p.checkin === 'presente' ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => onToggleCheckin(p.id)}
                  icon={<TicketCheck size={14} />}
                >
                  {p.checkin === 'presente' ? 'Desfazer' : 'Check-in'}
                </Button>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </div>
  );
};
