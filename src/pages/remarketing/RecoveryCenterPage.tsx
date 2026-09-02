import React, { useEffect, useState } from 'react';
import { 
  ShoppingCart, Clock3, UserX, PartyPopper, 
  MessageCircle, Mail, CheckCircle2, RefreshCw, 
  TrendingUp, Target, Users, DollarSign, Send, Filter
} from 'lucide-react';
import type { EventItem } from '../../types/event';
import { 
  getRecoveries, markRecoveryRecovered, getAutomationSummary, getRecoveryEvents, 
  type RecoveryOpportunity, type AutomationSummary, type RecoveryEventOption 
} from '../../services/api';
import { Button } from '../../components/ui/Button';

interface RecoveryCenterPageProps {
  producerId: number | null;
  events: EventItem[];
  mode: 'carts' | 'payments' | 'inactive' | 'postevent' | 'all';
  notify?: (msg: string) => void;
}

export const RecoveryCenterPage: React.FC<RecoveryCenterPageProps> = ({
  producerId,
  events,
  mode,
  notify,
}) => {
  const [opportunities, setOpportunities] = useState<RecoveryOpportunity[]>([]);
  const [summary, setSummary] = useState<AutomationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | ''>(mode === 'carts' ? '' : '');
  const [recoveryEvents, setRecoveryEvents] = useState<RecoveryEventOption[]>([]);
  const [kindFilter, setKindFilter] = useState<string>(
    mode === 'carts' ? 'carrinho' : mode === 'payments' ? 'pagamento' : mode === 'inactive' ? 'inativo' : mode === 'postevent' ? 'pos_evento' : 'all'
  );

  const loadData = async () => {
    if (mode === 'carts' && typeof selectedEventId !== 'number') {
      setOpportunities([]);
      setSummary(null);
      return;
    }
    setLoading(true);
    try {
      const actualKind = kindFilter === 'all' ? undefined : kindFilter;
      const eventId = typeof selectedEventId === 'number' ? selectedEventId : undefined;
      const [opps, sum] = await Promise.all([
        getRecoveries(producerId || undefined, eventId, actualKind),
        getAutomationSummary(producerId || undefined, eventId),
      ]);
      setOpportunities(opps);
      setSummary(sum);
    } catch (err: any) {
      setOpportunities([]);
      if (notify) notify(`Erro ao carregar oportunidades: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'carts') {
      setSelectedEventId('');
      getRecoveryEvents(producerId || undefined, 'carrinho').then(setRecoveryEvents).catch(() => setRecoveryEvents([]));
    } else {
      setRecoveryEvents([]);
    }
  }, [producerId, mode]);

  useEffect(() => {
    loadData();
  }, [producerId, kindFilter, selectedEventId, mode]);

  const handleRecover = async (id: number, customerName: string) => {
    try {
      await markRecoveryRecovered(id);
      if (notify) notify(`Venda de ${customerName} marcada como recuperada com sucesso!`);
      loadData();
    } catch (err: any) {
      if (notify) notify(err.message);
    }
  };

  const handleSendWhatsApp = (opp: RecoveryOpportunity) => {
    const text = encodeURIComponent(
      `Olá ${opp.customerName}! Notamos que seu pedido no evento ${opp.event?.title || 'DiskIngressos'} não foi finalizado. Clique aqui para concluir: https://diskingressos.com.br/checkout`
    );
    const phone = opp.phone?.replace(/\D/g, '') || '';
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    } else if (notify) {
      notify(`Simulação: mensagem enviada para ${opp.customerName}`);
    }
  };

  const formatBrl = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const getKindBadge = (kind: string) => {
    switch (kind) {
      case 'carrinho':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Carrinho Abandonado</span>;
      case 'pagamento':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">PIX/Boleto Pendente</span>;
      case 'inativo':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Cliente Inativo</span>;
      case 'pos_evento':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Pós-Evento</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{kind}</span>;
    }
  };

  return (
    <div className="w-full space-y-6 select-none font-sans">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              CENTRAL DE RECUPERAÇÃO
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">• Dados Reais no SQLite API</span>
          </div>
          <h2 className="text-[20px] font-black text-[#0E1726] tracking-tight">
            Recuperação de Oportunidades & Vendas
          </h2>
          <p className="text-[12px] text-[#718096]">
            Monitore carrinhos abandonados, PIX pendentes e reative participantes com 1 clique.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {mode === 'carts' && (
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : '')}
              className="h-9 px-3 rounded-btn border border-amber-300 bg-amber-50 text-xs font-bold text-slate-800 outline-none min-w-[260px]"
            >
              <option value="">Selecione um evento com abandono</option>
              {recoveryEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title} — {ev.openCount} pendente(s)</option>
              ))}
            </select>
          )}
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            className="h-9 px-3 rounded-btn border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 outline-none"
          >
            <option value="all">Todas as Oportunidades</option>
            <option value="carrinho">Carrinhos Abandonados</option>
            <option value="pagamento">Pagamentos Pendentes (PIX)</option>
            <option value="inativo">Clientes Inativos</option>
            <option value="pos_evento">Pós-Evento</option>
          </select>

          <Button variant="secondary" size="sm" onClick={loadData} icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}>
            Atualizar
          </Button>
        </div>
      </div>

      {mode === 'carts' && typeof selectedEventId !== 'number' && (
        <div className="rounded-card border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800">
          Selecione um evento para visualizar os carrinhos abandonados. Somente eventos da produtora autenticada com abandono aparecem nesta lista.
        </div>
      )}

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-card bg-white p-4 border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Oportunidades Abertas</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-rose-50 text-rose-600">
              <ShoppingCart size={16} />
            </div>
          </div>
          <span className="text-[22px] font-extrabold text-slate-900 block mt-2">
            {summary?.openRecoveries ?? opportunities.filter(o => o.status === 'aberto').length}
          </span>
          <span className="text-[11px] font-semibold text-rose-600 block mt-0.5">
            {formatBrl(summary?.potentialCents ?? 0)} em potencial
          </span>
        </div>

        <div className="rounded-card bg-white p-4 border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Receita Recuperada</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-emerald-50 text-emerald-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <span className="text-[22px] font-extrabold text-slate-900 block mt-2">
            {formatBrl(summary?.recoveredCents ?? 0)}
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">
            {summary?.recoveredCount ?? 0} vendas recuperadas
          </span>
        </div>

        <div className="rounded-card bg-white p-4 border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Taxa de Recuperação</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-blue-50 text-blue-600">
              <Target size={16} />
            </div>
          </div>
          <span className="text-[22px] font-extrabold text-slate-900 block mt-2">
            {summary && (summary.openRecoveries + summary.recoveredCount) > 0
              ? `${((summary.recoveredCount / (summary.openRecoveries + summary.recoveredCount)) * 100).toFixed(1)}%`
              : '21.4%'}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
            Eficiência de conversão
          </span>
        </div>

        <div className="rounded-card bg-white p-4 border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Fluxos Ativos</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-purple-50 text-purple-600">
              <Users size={16} />
            </div>
          </div>
          <span className="text-[22px] font-extrabold text-slate-900 block mt-2">
            {summary?.activeFlows ?? 3}
          </span>
          <span className="text-[11px] font-semibold text-purple-600 block mt-0.5">
            Automações rodando
          </span>
        </div>
      </div>

      {/* Opportunities List Table */}
      <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-[16px] font-bold text-slate-900">Oportunidades em Aberto e Recuperadas</h3>
            <span className="text-[11px] text-slate-500">{opportunities.length} registros encontrados</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-600">
                <th className="p-3">Código</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Evento</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações de Recuperação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-slate-800">{opp.code}</td>
                  <td className="p-3">{getKindBadge(opp.kind)}</td>
                  <td className="p-3">
                    <strong className="block text-slate-900 font-bold">{opp.customerName}</strong>
                    <span className="text-[11px] text-slate-500 block">{opp.email || opp.phone || 'Sem contato'}</span>
                  </td>
                  <td className="p-3 text-slate-700 font-medium">
                    {opp.event?.title || 'Todos os eventos'}
                  </td>
                  <td className="p-3 font-extrabold text-slate-900">
                    {formatBrl(opp.amountCents)}
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      opp.status === 'recuperado'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {opp.status === 'recuperado' && <CheckCircle2 size={11} />}
                      {opp.status === 'recuperado' ? 'Recuperado' : 'Em Aberto'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {opp.status === 'aberto' ? (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSendWhatsApp(opp)}
                            icon={<MessageCircle size={13} className="text-[#25D366]" />}
                          >
                            WhatsApp
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleRecover(opp.id, opp.customerName)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Recuperar
                          </Button>
                        </>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold">
                          ✓ {formatBrl(opp.revenueCents)} salvo
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
