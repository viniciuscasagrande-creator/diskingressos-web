import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, ScanFace, Search, UserX, ShieldCheck } from 'lucide-react';
import type { Participant } from '../data/participants';
import type { EventItem } from '../types/event';
import { PageHeader } from '../components/ui/PageHeader';
import { KpiCard } from '../components/ui/KpiCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FilterBar } from '../components/ui/FilterBar';

interface StatusFaciaisPageProps {
  events: EventItem[];
  participants: Participant[];
}

export const StatusFaciaisPage: React.FC<StatusFaciaisPageProps> = ({ events, participants }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const filtered = useMemo(() => {
    return participants.filter((p) => {
      const matchQuery = `${p.name} ${p.email} ${p.document || ''}`.toLowerCase().includes(search.toLowerCase());
      if (!matchQuery) return false;
      if (statusFilter !== 'todos' && p.facial !== statusFilter) return false;
      return true;
    });
  }, [participants, search, statusFilter]);

  const approved = participants.filter((p) => p.facial === 'aprovado').length;
  const pending = participants.filter((p) => p.facial === 'pendente').length;
  const missing = participants.filter((p) => p.facial === 'nao-cadastrado').length;
  const approvedPercent = participants.length > 0 ? Math.round((approved / participants.length) * 100) : 0;

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <PageHeader
        eyebrow="CONTROLE DE ACESSO & BIOMETRIA"
        title="Status Faciais"
        subtitle="Acompanhe a situação de cadastro, análise e validação facial dos participantes."
        actions={
          <span className="flex items-center gap-1.5 rounded-btn bg-emerald-50 px-3.5 py-2 text-[12px] font-bold text-[#15803D] border border-emerald-200">
            <ShieldCheck size={16} />
            Sincronizador de Catracas Ativo
          </span>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="FACES APROVADAS"
          value={`${approved} biometrias`}
          trend={`${approvedPercent}%`}
          trendDirection="up"
          note="da base total"
          accent="green"
          icon={<CheckCircle2 size={20} />}
        />
        <KpiCard
          label="EM ANÁLISE / PENDENTE"
          value={`${pending} fotos`}
          note="requer acompanhamento"
          accent="orange"
          icon={<AlertTriangle size={20} />}
        />
        <KpiCard
          label="NÃO CADASTRADOS"
          value={`${missing} sem foto`}
          note="envio de lembrete recomendado"
          accent="slate"
          icon={<UserX size={20} />}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar participante por nome, e-mail ou documento..."
        statusTabs={{
          current: statusFilter,
          onChange: setStatusFilter,
          options: [
            { id: 'todos', label: 'Todos', count: participants.length },
            { id: 'aprovado', label: 'Aprovados', count: approved },
            { id: 'pendente', label: 'Pendentes', count: pending },
            { id: 'nao-cadastrado', label: 'Sem Foto', count: missing },
          ]
        }}
      />

      {/* Grid of Facial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((p) => {
          const eventName = events.find((e) => e.id === p.eventId)?.title || 'Evento';

          return (
            <Card key={p.id} padding="sm" className="flex flex-col justify-between hover:border-[#1677FF]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-btn bg-cyan-50 text-[#06B6D4]">
                    <ScanFace size={22} />
                  </div>
                  <Badge status={p.facial} />
                </div>

                <strong className="block text-[14px] font-bold text-[#0E1726] truncate" title={p.name}>
                  {p.name}
                </strong>
                <small className="block text-[12px] text-[#718096] truncate">{p.email}</small>
                <span className="block text-[10px] text-slate-400 font-mono mt-1">{p.document}</span>

                <div className="mt-3 pt-2.5 border-t border-[#EDF0F4] text-[11px]">
                  <span className="block font-semibold truncate text-[#0E1726]">{eventName}</span>
                  <span className="block text-[#718096]">{p.ticket}</span>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
                onClick={() => alert(`Detalhes biométricos de ${p.name}`)}
              >
                Ver Detalhes
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
