import React, { useState, useMemo } from 'react';
import { 
  CreditCard, MonitorSmartphone, ReceiptText, CircleDollarSign, 
  Wifi, WifiOff, ShoppingCart, Search, SlidersHorizontal, 
  Printer, CheckCircle2, Clock3, Banknote, Smartphone, 
  XCircle, LockKeyhole, RotateCcw, Battery, BatteryCharging, 
  Download, ArrowLeftRight, UserCheck
} from 'lucide-react';
import type { EventItem } from '../types/event';
import { 
  initialTerminals, 
  initialSales, 
  type POSTerminal, 
  type POSSale 
} from '../data/pos';
import { PageHeader } from '../components/ui/PageHeader';
import { KpiCard } from '../components/ui/KpiCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';
import { FilterBar } from '../components/ui/FilterBar';

export type POSTab = 'overview' | 'terminals' | 'sales' | 'closing';

interface POSPageProps {
  events: EventItem[];
  initialTab?: POSTab;
  notify?: (message: string) => void;
}

export const POSPage: React.FC<POSPageProps> = ({
  events,
  initialTab = 'overview',
  notify,
}) => {
  const [tab, setTab] = useState<POSTab>(initialTab);
  const [terminals, setTerminals] = useState<POSTerminal[]>(initialTerminals);
  const [sales, setSales] = useState<POSSale[]>(initialSales);
  const [query, setQuery] = useState('');
  const [eventFilter, setEventFilter] = useState('Todos');
  const [closingDone, setClosingDone] = useState(false);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const approvedSales = sales.filter((s) => s.status === 'Aprovada');
  const totalSalesAmount = approvedSales.reduce((acc, s) => acc + s.value, 0);
  const onlineCount = terminals.filter((t) => t.status === 'online').length;
  const avgTicket = approvedSales.length > 0 ? totalSalesAmount / approvedSales.length : 0;

  // Payment method aggregations
  const paymentTotals = useMemo(() => {
    return approvedSales.reduce<Record<string, number>>((acc, s) => {
      acc[s.payment] = (acc[s.payment] || 0) + s.value;
      return acc;
    }, {});
  }, [sales, approvedSales]);

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchEvent = eventFilter === 'Todos' || s.event === eventFilter;
      const matchQuery = `${s.id} ${s.terminal} ${s.event} ${s.item} ${s.payment}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchEvent && matchQuery;
    });
  }, [sales, eventFilter, query]);

  // Simulate new POS sale
  const simulateSale = () => {
    const newSale: POSSale = {
      id: `#PDV-${92842 + sales.length}`,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      terminal: 'POS-001',
      event: events[0]?.title || 'SEM PARAR — EXPERIÊNCIA MÚSICA E NATUREZA',
      item: 'Ingresso Inteira - 1º Lote',
      payment: 'Pix',
      status: 'Aprovada',
      value: 180.00,
    };

    setSales((prev) => [newSale, ...prev]);
    // update terminal sales
    setTerminals((prev) =>
      prev.map((t) => (t.id === 'POS-001' ? { ...t, sales: t.sales + 1, total: t.total + 180 } : t))
    );

    if (notify) {
      notify('Venda presencial no terminal POS-001 registrada e sincronizada!');
    } else {
      alert('Nova venda presencial registrada com sucesso!');
    }
  };

  // Toggle terminal connectivity
  const toggleTerminal = (id: string) => {
    setTerminals((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === 'online' ? 'offline' : 'online',
              lastSync: 'Agora',
            }
          : t
      )
    );
    if (notify) {
      notify(`Status do terminal ${id} atualizado.`);
    }
  };

  const salesHeaders = [
    'Pedido / Data',
    'Terminal',
    'Evento / Item',
    'Forma de Pagamento',
    <div key="st" className="text-center">Status</div>,
    <div key="val" className="text-right pr-2">Valor</div>
  ];

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <PageHeader
        eyebrow="OPERAÇÃO PRESENCIAL & BILHETERIA"
        title="Terminais POS / PDV"
        subtitle="Controle terminais físicos, vendas presenciais de bilheteria e fechamento de caixa."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={() => {
                if (notify) notify('Sincronização em tempo real concluída com todos os terminais.');
                else alert('Sincronizando terminais...');
              }}
              icon={<RotateCcw size={16} />}
            >
              Sincronizar
            </Button>
            <Button
              variant="primary"
              onClick={simulateSale}
              icon={<ShoppingCart size={16} />}
            >
              Nova Venda PDV
            </Button>
          </div>
        }
      />

      {/* Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Visão Geral' },
          { id: 'terminals', label: 'Gerenciamento de Terminais' },
          { id: 'sales', label: 'Vendas Presenciais' },
          { id: 'closing', label: 'Fechamento de Caixa' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as POSTab)}
            className={`rounded-btn px-4 py-2 text-[13px] font-bold transition whitespace-nowrap select-none ${
              tab === item.id
                ? 'bg-[#1677FF] text-white shadow-xs'
                : 'text-[#64748B] hover:bg-white hover:text-[#0E1726]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* TAB 1: VISÃO GERAL */}
      {tab === 'overview' && (
        <>
          {/* Main 4 KPIs Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="VENDAS HOJE (PDV)"
              value={formatCurrency(totalSalesAmount)}
              note={`${approvedSales.length} transações aprovadas`}
              accent="blue"
              icon={<CircleDollarSign size={20} />}
            />
            <KpiCard
              label="TERMINAIS ONLINE"
              value={`${onlineCount}/${terminals.length}`}
              trend={`${Math.round((onlineCount / terminals.length) * 100)}%`}
              trendDirection="up"
              note="disponíveis para venda"
              accent="green"
              icon={<MonitorSmartphone size={20} />}
            />
            <KpiCard
              label="TICKET MÉDIO PRESENCIAL"
              value={formatCurrency(avgTicket)}
              note="por cliente na bilheteria"
              accent="purple"
              icon={<ReceiptText size={20} />}
            />
            <KpiCard
              label="ÚLTIMA SINCRONIZAÇÃO"
              value="Agora"
              note={`${onlineCount} terminais ativos`}
              accent="orange"
              icon={<Clock3 size={20} />}
            />
          </div>

          {/* Grid Principal: Terminais em Operação + Meios de Pagamento */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Terminais em Operação (2 cols) */}
            <Card padding="md" className="lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-[17px] font-bold text-[#0E1726]">Terminais em Operação</h2>
                    <p className="text-[12px] text-[#718096]">Status em tempo real das máquinas e bilheteiros.</p>
                  </div>
                  <button
                    onClick={() => setTab('terminals')}
                    className="text-xs font-bold text-[#1677FF] hover:underline"
                  >
                    Ver Todos →
                  </button>
                </div>

                <div className="divide-y divide-[#EDF0F4] mt-3">
                  {terminals.map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-btn ${
                          t.status === 'online' ? 'bg-emerald-50 text-[#10B981]' : 'bg-slate-100 text-[#64748B]'
                        }`}>
                          {t.status === 'online' ? <Wifi size={16} /> : <WifiOff size={16} />}
                        </div>
                        <div>
                          <strong className="block text-[#0E1726] font-bold text-sm">{t.name}</strong>
                          <span className="text-[11px] text-[#718096]">{t.id} • Operador: {t.operator}</span>
                        </div>
                      </div>

                      <div className="text-center hidden sm:block">
                        <span className="text-[10px] uppercase font-bold text-[#64748B] block">Vendas</span>
                        <strong className="text-slate-900 font-bold">{t.sales} un.</strong>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#64748B] block">Faturamento</span>
                        <strong className="text-[#10B981] font-bold">{formatCurrency(t.total)}</strong>
                      </div>

                      <Badge status={t.status === 'online' ? 'ativo' : 'inativo'}>
                        {t.status === 'online' ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Meios de Pagamento (1 col) */}
            <Card padding="md" className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-[17px] font-bold text-[#0E1726]">Meios de Pagamento</h2>
                    <p className="text-[12px] text-[#718096]">Distribuição das vendas presenciais</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-purple-50 text-[#7C3AED]">
                    <CreditCard size={20} />
                  </div>
                </div>

                <div className="space-y-3.5 mt-4">
                  {(['Crédito', 'Pix', 'Débito', 'Dinheiro'] as const).map((method, idx) => {
                    const value = paymentTotals[method] || 0;
                    const pct = totalSalesAmount > 0 ? Math.round((value / totalSalesAmount) * 100) : 0;
                    const icon = method === 'Pix' 
                      ? <Smartphone size={15} /> 
                      : method === 'Dinheiro' 
                      ? <Banknote size={15} /> 
                      : <CreditCard size={15} />;

                    return (
                      <div key={method} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-slate-800">
                            <span className="text-[#1677FF]">{icon}</span>
                            <span>{method}</span>
                            <span className="text-[11px] text-slate-400 font-normal">({pct}%)</span>
                          </div>
                          <strong className="text-[#0E1726] font-bold">{formatCurrency(value)}</strong>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              idx === 0 ? 'bg-[#1677FF]' : idx === 1 ? 'bg-[#06B6D4]' : idx === 2 ? 'bg-[#7C3AED]' : 'bg-[#10B981]'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-[#EDF0F4] flex items-center justify-between text-xs text-[#718096]">
                <span>Total faturado no PDV:</span>
                <strong className="text-[#0E1726] font-bold">{formatCurrency(totalSalesAmount)}</strong>
              </div>
            </Card>
          </div>

          {/* Tabela de Últimas Vendas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-bold text-[#0E1726]">Últimas Vendas Presenciais</h2>
                <p className="text-[12px] text-[#718096]">Transações processadas nos terminais da portaria e bilheteria.</p>
              </div>
              <button
                onClick={() => setTab('sales')}
                className="text-xs font-bold text-[#1677FF] hover:underline"
              >
                Ver Histórico Completo →
              </button>
            </div>

            <DataTable
              headers={salesHeaders}
              empty={sales.length === 0}
              emptyMessage="Nenhuma venda presencial registrada."
            >
              {sales.slice(0, 5).map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <strong className="block text-[#1677FF]">{s.id}</strong>
                    <small className="text-slate-400">{s.time}</small>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-bold text-slate-700">
                    {s.terminal}
                  </td>
                  <td className="py-3.5 px-4">
                    <strong className="block text-[#0E1726] font-bold truncate max-w-[240px]">{s.event}</strong>
                    <span className="text-[11px] text-[#718096]">{s.item}</span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                    {s.payment}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge status={s.status === 'Aprovada' ? 'confirmado' : s.status === 'Cancelada' ? 'cancelado' : 'pendente'}>
                      {s.status}
                    </Badge>
                  </td>
                  <td className={`py-3.5 px-4 text-right font-bold text-sm ${
                    s.status === 'Cancelada' ? 'text-[#EF4444]' : 'text-[#10B981]'
                  }`}>
                    {formatCurrency(s.value)}
                  </td>
                </tr>
              ))}
            </DataTable>
          </div>
        </>
      )}

      {/* TAB 2: TERMINAIS */}
      {tab === 'terminals' && (
        <div className="space-y-6">
          <Card padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[17px] font-bold text-[#0E1726]">Parque de Terminais POS</h2>
              <p className="text-[12px] text-[#718096]">Monitore conexão, nível de bateria, operador e volume de vendas de cada ponto.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#15803D] border border-emerald-200">
              {onlineCount} Terminais Online
            </span>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {terminals.map((t) => (
              <Card key={t.id} padding="md" className="flex flex-col justify-between hover:border-[#1677FF]">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-btn ${
                      t.status === 'online' ? 'bg-emerald-50 text-[#10B981]' : 'bg-slate-100 text-[#64748B]'
                    }`}>
                      {t.status === 'online' ? <Wifi size={18} /> : <WifiOff size={18} />}
                    </div>
                    <Badge status={t.status === 'online' ? 'ativo' : 'inativo'}>
                      {t.status === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </div>

                  <h3 className="text-[16px] font-bold text-[#0E1726]">{t.name}</h3>
                  <p className="text-[12px] text-[#718096] mt-0.5 truncate">{t.id} • {t.event}</p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#EDF0F4] text-xs">
                    <div className="rounded bg-[#F8FAFC] p-2">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">Operador</span>
                      <strong className="text-slate-800 font-bold truncate block">{t.operator}</strong>
                    </div>
                    <div className="rounded bg-[#F8FAFC] p-2">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">Bateria</span>
                      <strong className={`font-bold flex items-center gap-1 ${t.battery < 20 ? 'text-[#EF4444]' : 'text-slate-800'}`}>
                        <Battery size={13} /> {t.battery}%
                      </strong>
                    </div>
                    <div className="rounded bg-[#F8FAFC] p-2">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">Vendas</span>
                      <strong className="text-[#1677FF] font-bold">{t.sales} un.</strong>
                    </div>
                    <div className="rounded bg-[#F8FAFC] p-2">
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">Faturamento</span>
                      <strong className="text-[#10B981] font-bold">{formatCurrency(t.total)}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EDF0F4] flex items-center justify-between">
                  <span className="text-[11px] text-[#718096]">Sync: {t.lastSync}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleTerminal(t.id)}
                  >
                    {t.status === 'online' ? 'Desconectar' : 'Reconectar'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: VENDAS PRESENCIAIS */}
      {tab === 'sales' && (
        <div className="space-y-6">
          <FilterBar
            searchQuery={query}
            onSearchChange={setQuery}
            searchPlaceholder="Buscar por pedido (#PDV), terminal, evento ou item..."
            selectFilters={
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="h-[38px] rounded-input border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[12px] font-bold text-[#0E1726] outline-none transition focus:border-[#1677FF] focus:bg-white"
              >
                <option value="Todos">Todos os Eventos</option>
                {events.map((e) => (
                  <option key={e.id} value={e.title}>
                    #{e.code} — {e.title}
                  </option>
                ))}
              </select>
            }
            actions={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => alert('Exportando relatório de vendas presenciais...')}
                icon={<Printer size={15} />}
              >
                Exportar / Imprimir
              </Button>
            }
          />

          <DataTable
            headers={salesHeaders}
            empty={filteredSales.length === 0}
            emptyMessage="Nenhuma venda presencial encontrada com os filtros aplicados."
          >
            {filteredSales.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-800">
                  <strong className="block text-[#1677FF]">{s.id}</strong>
                  <small className="text-slate-400">{s.time}</small>
                </td>
                <td className="py-3.5 px-4 text-xs font-bold text-slate-700">
                  {s.terminal}
                </td>
                <td className="py-3.5 px-4">
                  <strong className="block text-[#0E1726] font-bold truncate max-w-[240px]">{s.event}</strong>
                  <span className="text-[11px] text-[#718096]">{s.item}</span>
                </td>
                <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                  {s.payment}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <Badge status={s.status === 'Aprovada' ? 'confirmado' : s.status === 'Cancelada' ? 'cancelado' : 'pendente'}>
                    {s.status}
                  </Badge>
                </td>
                <td className={`py-3.5 px-4 text-right font-bold text-sm ${
                  s.status === 'Cancelada' ? 'text-[#EF4444]' : 'text-[#10B981]'
                }`}>
                  {formatCurrency(s.value)}
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}

      {/* TAB 4: FECHAMENTO DE CAIXA */}
      {tab === 'closing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Card Principal de Fechamento */}
          <Card padding="md" className="lg:col-span-2 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between border-b border-[#EDF0F4] pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-slate-900 text-white">
                    <LockKeyhole size={18} />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-bold text-[#0E1726]">Fechamento de Caixa do Turno</h2>
                    <p className="text-[12px] text-[#718096]">Consolidação do movimento dos terminais presenciais.</p>
                  </div>
                </div>
                <Badge status={closingDone ? 'confirmado' : 'pendente'}>
                  {closingDone ? 'Caixa Fechado' : 'Turno em Aberto'}
                </Badge>
              </div>

              {/* Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFC] p-3.5 rounded-btn border border-[#EDF0F4] mb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#64748B] block">Início do Turno</span>
                  <strong className="text-xs font-bold text-slate-800">26/08/2026 • 09:00</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#64748B] block">Operadores</span>
                  <strong className="text-xs font-bold text-slate-800">4 bilheteiros</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#64748B] block">Transações</span>
                  <strong className="text-xs font-bold text-slate-800">{sales.length} pedidos</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#64748B] block">Total Vendido</span>
                  <strong className="text-xs font-bold text-[#10B981]">{formatCurrency(totalSalesAmount)}</strong>
                </div>
              </div>

              {/* Payment Methods Totals */}
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
                Consolidação por Meio de Pagamento
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(paymentTotals).map(([p, v]) => (
                  <div key={p} className="p-3 rounded-btn border border-[#E2E8F0] bg-white">
                    <span className="text-[11px] font-bold text-slate-600 block">{p}</span>
                    <strong className="text-[15px] font-bold text-[#0E1726] mt-0.5 block">{formatCurrency(v)}</strong>
                  </div>
                ))}
              </div>

              {/* Total Expected Box */}
              <div className="rounded-btn bg-[#DCFCE7]/70 border border-[#15803D]/20 p-4 mt-5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase text-[#15803D] block">Valor Total Esperado em Caixa</span>
                  <strong className="text-[24px] font-bold text-[#15803D]">{formatCurrency(totalSalesAmount)}</strong>
                </div>
                <span className="text-xs font-semibold text-emerald-800 bg-white/80 rounded-full px-3 py-1">
                  100% Conciliado
                </span>
              </div>
            </div>

            {/* Closing Actions Footer */}
            <div className="pt-4 border-t border-[#EDF0F4] flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={() => {
                  if (notify) notify('Prévia do fechamento e borderô de caixa impressos.');
                  else alert('Imprimindo borderô do fechamento...');
                }}
                icon={<Printer size={16} />}
              >
                Imprimir Prévia
              </Button>

              <Button
                variant="primary"
                disabled={closingDone}
                onClick={() => {
                  setClosingDone(true);
                  if (notify) notify('Caixa fechado com sucesso e valores enviados ao módulo Financeiro!');
                  else alert('Fechamento de caixa confirmado e enviado ao Financeiro!');
                }}
                icon={<CheckCircle2 size={16} />}
              >
                {closingDone ? 'Caixa Encerrado' : 'Confirmar Fechamento'}
              </Button>
            </div>
          </Card>

          {/* Painel Lateral: Conciliação Rápida */}
          <Card padding="md" className="space-y-4 flex flex-col justify-between">
            <div>
              <h2 className="text-[17px] font-bold text-[#0E1726] mb-1">Conciliação Rápida</h2>
              <p className="text-[12px] text-[#718096]">Conferência automática com a operadora de cartões e TEF.</p>

              <div className="rounded-btn bg-emerald-50 border border-emerald-200 p-3.5 my-4 flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs font-bold text-[#15803D] block">Operação 100% Conciliada</strong>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Os valores dos 4 terminais POS conferem com os registros do banco de dados.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-[#F8FAFC]">
                  <span className="font-semibold text-slate-700">Vendas Aprovadas</span>
                  <strong className="font-bold text-slate-900">{approvedSales.length} transações</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#F8FAFC]">
                  <span className="font-semibold text-slate-700">Canceladas / Estornos</span>
                  <strong className="font-bold text-[#EF4444]">{sales.filter((s) => s.status === 'Cancelada').length} un.</strong>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#F8FAFC]">
                  <span className="font-semibold text-slate-700">Pendentes</span>
                  <strong className="font-bold text-slate-700">{sales.filter((s) => s.status === 'Pendente').length} un.</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-emerald-50 border border-emerald-200">
                  <span className="font-bold text-emerald-900">Diferença de Caixa</span>
                  <strong className="font-bold text-[#10B981]">R$ 0,00</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EDF0F4]">
              <span className="text-[11px] text-[#718096] block text-center">
                Fechamento assinado digitalmente pelo operador master.
              </span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
