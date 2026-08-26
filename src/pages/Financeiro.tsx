import React, { useState, useMemo } from 'react';
import { 
  CircleDollarSign, ShoppingCart, Landmark, CalendarDays, 
  Download, Banknote, Filter, Search, TrendingUp, 
  ArrowDownLeft, ArrowUpRight, ChevronRight, ReceiptText, 
  CreditCard, WalletCards, LayoutGrid, ArrowLeft
} from 'lucide-react';
import type { EventItem } from '../types/event';
import type { FinanceModuleKey } from '../types/financeHub';
import { 
  transactions as initialTransactions, 
  payouts as initialPayouts, 
  cashFlow, 
  type FinancialTransaction, 
  type Payout 
} from '../data/finance';
import { PageHeader } from '../components/ui/PageHeader';
import { KpiCard } from '../components/ui/KpiCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';
import { FilterBar } from '../components/ui/FilterBar';
import { RequestPayoutModal } from '../components/finance/RequestPayoutModal';

// Dedicated Sub-Modules
import { FinanceHubHome } from './finance/FinanceHubHome';
import { SimuladorSpreadModule } from './finance/SimuladorSpreadModule';
import { SplitFinanceiroModule } from './finance/SplitFinanceiroModule';
import { BorderoAssinaturasModule } from './finance/BorderoAssinaturasModule';
import { ContasBancariasModule } from './finance/ContasBancariasModule';
import { AntecipacoesModule } from './finance/AntecipacoesModule';
import { GenericFinanceSubView } from './finance/GenericFinanceSubView';

export type FinanceTab = 'hub' | 'overview' | 'sales' | 'payouts' | 'cashflow' | 'statement';

interface FinanceiroPageProps {
  events: EventItem[];
  initialTab?: FinanceTab;
  initialSubModule?: FinanceModuleKey;
  notify?: (message: string) => void;
}

export const FinanceiroPage: React.FC<FinanceiroPageProps> = ({
  events,
  initialTab = 'hub',
  initialSubModule = 'hub',
  notify,
}) => {
  const [tab, setTab] = useState<FinanceTab>(initialTab);
  const [activeModule, setActiveModule] = useState<FinanceModuleKey>(initialSubModule);

  const [query, setQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('Todos os eventos');
  const [selectedPeriod, setSelectedPeriod] = useState('Últimos 30 dias');
  
  // State for Transactions & Payouts
  const [transactionsList, setTransactionsList] = useState<FinancialTransaction[]>(initialTransactions);
  const [payoutsList, setPayoutsList] = useState<Payout[]>(initialPayouts);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactionsList.filter((t) => {
      const matchQuery = `${t.event} ${t.description} ${t.type} ${t.method}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchEvent = selectedEvent === 'Todos os eventos' || t.event === selectedEvent;
      return matchQuery && matchEvent;
    });
  }, [transactionsList, query, selectedEvent]);

  // Main balances
  const availableBalance = 15265.60;
  const receivableBalance = 72410.80;
  const totalBalance = availableBalance + receivableBalance;
  const totalSalesVolume = 148750.00;
  const totalPaidOut = 57546.80;
  const estimatedFees = 4820.30;

  const handleRequestPayout = (amount: number, eventId: number, pixKey: string) => {
    const eventObj = events.find((e) => e.id === eventId);
    const newPayout: Payout = {
      id: Date.now(),
      event: eventObj ? eventObj.title : 'SEM PARAR — EXPERIÊNCIA MÚSICA E NATUREZA',
      requestedAt: '26/08/2026',
      scheduledFor: '28/08/2026',
      gross: amount,
      fees: amount * 0.06,
      net: amount * 0.94,
      status: 'Agendado',
    };

    setPayoutsList([newPayout, ...payoutsList]);
    if (notify) {
      notify(`Solicitação de repasse de ${formatCurrency(amount)} agendada com sucesso!`);
    } else {
      alert(`Solicitação de repasse de ${formatCurrency(amount)} agendada para ${pixKey}.`);
    }
  };

  const handleSelectModuleFromHub = (key: FinanceModuleKey) => {
    setActiveModule(key);
    if (key === 'saldo-consolidado') {
      setTab('overview');
    } else if (key === 'solicitar-repasse') {
      setTab('payouts');
      setIsPayoutModalOpen(true);
    } else if (key === 'extrato-geral') {
      setTab('statement');
    } else {
      setTab('hub');
    }
  };

  const transactionHeaders = [
    'Data / Hora',
    'Descrição / Tipo',
    'Evento',
    'Forma',
    <div key="st" className="text-center">Status</div>,
    <div key="val" className="text-right pr-2">Valor</div>
  ];

  const payoutHeaders = [
    'Evento',
    'Solicitado em',
    'Previsão de Crédito',
    <div key="bruto" className="text-right">Valor Bruto</div>,
    <div key="taxas" className="text-right">Taxas</div>,
    <div key="liq" className="text-right">Líquido a Receber</div>,
    <div key="st" className="text-center">Status</div>,
    <div key="acao" className="text-right pr-2">Ação</div>
  ];

  const maxCashValue = Math.max(...cashFlow.flatMap((d) => [d.entry, d.exit]));

  // Route specialized modules
  if (tab === 'hub' && activeModule !== 'hub') {
    if (activeModule === 'simulador-spread') {
      return <SimuladorSpreadModule onBack={() => setActiveModule('hub')} />;
    }
    if (activeModule === 'split-financeiro') {
      return <SplitFinanceiroModule onBack={() => setActiveModule('hub')} />;
    }
    if (activeModule === 'bordero-assinaturas') {
      return <BorderoAssinaturasModule events={events} onBack={() => setActiveModule('hub')} />;
    }
    if (activeModule === 'contas-bancarias') {
      return <ContasBancariasModule onBack={() => setActiveModule('hub')} />;
    }
    if (activeModule === 'antecipacoes') {
      return <AntecipacoesModule onBack={() => setActiveModule('hub')} />;
    }
    // Generic subviews for all other modules
    return (
      <GenericFinanceSubView
        moduleKey={activeModule}
        onBack={() => setActiveModule('hub')}
        notify={notify}
      />
    );
  }

  // Hub Homepage
  if (tab === 'hub') {
    return <FinanceHubHome onSelectModule={handleSelectModuleFromHub} />;
  }

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <PageHeader
        eyebrow="GESTÃO FINANCEIRA & REPASSES"
        title="Financeiro"
        subtitle="Acompanhe saldo disponível, valores a receber, faturamento e fluxo de caixa."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={() => {
                setActiveModule('hub');
                setTab('hub');
              }}
              icon={<LayoutGrid size={15} />}
            >
              Ver Hub Financeiro
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (notify) notify('Relatório financeiro preparado para download (CSV/PDF).');
                else alert('Exportando relatório financeiro consolidado...');
              }}
              icon={<Download size={16} />}
            >
              Exportar
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsPayoutModalOpen(true)}
              icon={<Banknote size={16} />}
            >
              Solicitar Repasse
            </Button>
          </div>
        }
      />

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2 overflow-x-auto">
        {[
          { id: 'hub', label: '⊞ Hub Financeiro' },
          { id: 'overview', label: 'Visão Geral & Saldo' },
          { id: 'sales', label: 'Vendas & Recebimentos' },
          { id: 'payouts', label: 'Repasses' },
          { id: 'cashflow', label: 'Fluxo de Caixa' },
          { id: 'statement', label: 'Extrato Geral' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'hub') {
                setActiveModule('hub');
              }
              setTab(item.id as FinanceTab);
            }}
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

      {/* Filter Bar */}
      <FilterBar
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar por pedido (#DI-XXXXX), evento ou lançamento..."
        selectFilters={
          <>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="h-[38px] rounded-input border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[12px] font-bold text-[#0E1726] outline-none transition focus:border-[#1677FF] focus:bg-white"
            >
              <option value="Todos os eventos">Todos os eventos ({events.length})</option>
              {events.map((e) => (
                <option key={e.id} value={e.title}>
                  #{e.code} — {e.title}
                </option>
              ))}
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="h-[38px] rounded-input border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[12px] font-bold text-[#0E1726] outline-none transition focus:border-[#1677FF] focus:bg-white"
            >
              <option value="Hoje">Hoje</option>
              <option value="Últimos 7 dias">Últimos 7 dias</option>
              <option value="Últimos 30 dias">Últimos 30 dias</option>
              <option value="Este ano">Este ano</option>
            </select>
          </>
        }
      />

      {/* TAB 1: VISÃO GERAL & SALDO CONSOLIDADO */}
      {tab === 'overview' && (
        <>
          {/* Main 4 KPIs Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="SALDO DISPONÍVEL"
              value={formatCurrency(availableBalance)}
              note="liberado para repasse"
              accent="blue"
              icon={<WalletCards size={20} />}
            />
            <KpiCard
              label="VALORES A RECEBER"
              value={formatCurrency(receivableBalance)}
              note="próximos 30 dias"
              accent="cyan"
              icon={<CalendarDays size={20} />}
            />
            <KpiCard
              label="VENDAS DO PERÍODO"
              value={formatCurrency(totalSalesVolume)}
              trend="↑ 12,4%"
              trendDirection="up"
              note="vs. período anterior"
              accent="green"
              icon={<TrendingUp size={20} />}
            />
            <KpiCard
              label="TOTAL REPASSADO"
              value={formatCurrency(totalPaidOut)}
              note="4 repasses concluídos"
              accent="purple"
              icon={<Landmark size={20} />}
            />
          </div>

          {/* Grid Principal: Gráfico de Entradas x Saídas + Composição do Saldo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Gráfico Receita e Saídas (2 cols) */}
            <Card padding="md" className="lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-[17px] font-bold text-[#0E1726]">Receita e Saídas</h2>
                    <p className="text-[12px] text-[#718096]">Movimentação financeira consolidada dos últimos 7 dias.</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#1677FF] border border-blue-200">
                    {selectedPeriod}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold mt-3">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                    Entradas (Vendas)
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                    Saídas (Repasses & Taxas)
                  </span>
                </div>
              </div>

              {/* Bar Chart Bars */}
              <div className="my-6 flex items-end justify-between gap-3 h-44 pt-4 border-b border-[#EDF0F4] pb-2">
                {cashFlow.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      <div
                        className="w-3.5 sm:w-5 bg-[#10B981] rounded-t transition-all group-hover:brightness-110"
                        style={{ height: `${Math.max(10, (d.entry / maxCashValue) * 100)}%` }}
                        title={`Entradas: ${formatCurrency(d.entry)}`}
                      />
                      <div
                        className="w-3.5 sm:w-5 bg-[#EF4444] rounded-t transition-all group-hover:brightness-110"
                        style={{ height: `${Math.max(8, (d.exit / maxCashValue) * 100)}%` }}
                        title={`Saídas: ${formatCurrency(d.exit)}`}
                      />
                    </div>
                    <span className="text-[11px] text-[#718096] font-medium mt-1">{d.day}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#718096]">
                <span>Total de entradas na semana: <strong className="text-[#10B981]">{formatCurrency(142650)}</strong></span>
                <span>Total de saídas / repasses: <strong className="text-[#EF4444]">{formatCurrency(44900)}</strong></span>
              </div>
            </Card>

            {/* Composição do Saldo (1 col) */}
            <Card padding="md" className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-[17px] font-bold text-[#0E1726]">Composição do Saldo</h2>
                    <p className="text-[12px] text-[#718096]">Visão consolidada da carteira</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-emerald-50 text-[#10B981]">
                    <CircleDollarSign size={20} />
                  </div>
                </div>

                <div className="rounded-btn bg-[#F8FAFC] p-4 border border-[#EDF0F4] mb-4">
                  <span className="text-[11px] font-bold uppercase text-[#64748B] block">Saldo Total em Carteira</span>
                  <strong className="text-[24px] font-bold text-[#0E1726] block leading-tight mt-0.5">
                    {formatCurrency(totalBalance)}
                  </strong>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">Saldo Disponível</span>
                      <strong className="text-[#10B981] font-bold">{formatCurrency(availableBalance)}</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#10B981] rounded-full"
                        style={{ width: `${(availableBalance / totalBalance) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">A Receber (D+30)</span>
                      <strong className="text-[#06B6D4] font-bold">{formatCurrency(receivableBalance)}</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#06B6D4] rounded-full"
                        style={{ width: `${(receivableBalance / totalBalance) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-[#EDF0F4] flex items-center justify-between text-xs">
                <span className="text-[#718096]">Taxas operacionais retidas:</span>
                <strong className="text-slate-800 font-bold">{formatCurrency(estimatedFees)}</strong>
              </div>
            </Card>
          </div>

          {/* Movimentações Recentes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-bold text-[#0E1726]">Movimentações Recentes</h2>
                <p className="text-[12px] text-[#718096]">Últimos lançamentos financeiros registrados.</p>
              </div>
              <button
                onClick={() => setTab('statement')}
                className="text-xs font-bold text-[#1677FF] hover:underline flex items-center gap-1"
              >
                Ver extrato completo <ChevronRight size={14} />
              </button>
            </div>

            <DataTable
              headers={transactionHeaders}
              empty={filteredTransactions.length === 0}
              emptyMessage="Nenhuma movimentação encontrada."
            >
              {filteredTransactions.slice(0, 6).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#64748B] text-xs">
                    {t.date}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-md ${
                        t.value >= 0 ? 'bg-emerald-50 text-[#10B981]' : 'bg-rose-50 text-[#EF4444]'
                      }`}>
                        {t.value >= 0 ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                      </div>
                      <div>
                        <strong className="block text-[#0E1726] font-bold">{t.description}</strong>
                        <small className="block text-[11px] text-[#718096]">{t.type}</small>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 truncate max-w-[220px]" title={t.event}>
                    {t.event}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                    {t.method}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge status={t.status} />
                  </td>
                  <td className={`py-3.5 px-4 text-right font-bold text-sm ${
                    t.value >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}>
                    {t.value >= 0 ? `+ ${formatCurrency(t.value)}` : formatCurrency(t.value)}
                  </td>
                </tr>
              ))}
            </DataTable>
          </div>
        </>
      )}

      {/* TAB 2: VENDAS & RECEBIMENTOS */}
      {tab === 'sales' && (
        <div className="space-y-6">
          <Card padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white to-blue-50/40">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-btn bg-blue-50 text-[#1677FF]">
                <ReceiptText size={24} />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-[#0E1726]">Vendas e Recebimentos</h2>
                <p className="text-[12px] text-[#718096]">Controle financeiro de pedidos aprovados, pendentes e estornos.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="rounded-btn bg-white border border-[#E2E8F0] p-2.5 text-center min-w-[120px]">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">Faturamento</span>
                <strong className="text-[15px] font-bold text-[#10B981]">{formatCurrency(totalSalesVolume)}</strong>
              </div>
              <div className="rounded-btn bg-white border border-[#E2E8F0] p-2.5 text-center min-w-[100px]">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">Pedidos</span>
                <strong className="text-[15px] font-bold text-[#0E1726]">428 un.</strong>
              </div>
              <div className="rounded-btn bg-white border border-[#E2E8F0] p-2.5 text-center min-w-[110px]">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">Ticket Médio</span>
                <strong className="text-[15px] font-bold text-[#1677FF]">{formatCurrency(347.55)}</strong>
              </div>
            </div>
          </Card>

          <DataTable
            headers={transactionHeaders}
            empty={filteredTransactions.filter((t) => t.type === 'Venda' || t.type === 'Estorno').length === 0}
            emptyMessage="Nenhuma venda registrada com os filtros aplicados."
          >
            {filteredTransactions
              .filter((t) => t.type === 'Venda' || t.type === 'Estorno')
              .map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#64748B] text-xs">{t.date}</td>
                  <td className="py-3.5 px-4">
                    <strong className="block text-[#0E1726] font-bold">{t.description}</strong>
                    <small className="block text-[11px] text-[#718096]">{t.type}</small>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 truncate max-w-[240px]">{t.event}</td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">{t.method}</td>
                  <td className="py-3.5 px-4 text-center"><Badge status={t.status} /></td>
                  <td className={`py-3.5 px-4 text-right font-bold text-sm ${t.value >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {t.value >= 0 ? `+ ${formatCurrency(t.value)}` : formatCurrency(t.value)}
                  </td>
                </tr>
              ))}
          </DataTable>
        </div>
      )}

      {/* TAB 3: REPASSES */}
      {tab === 'payouts' && (
        <div className="space-y-6">
          <Card padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white to-purple-50/30">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-btn bg-purple-50 text-[#7C3AED]">
                <Landmark size={24} />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-[#0E1726]">Gestão de Repasses Bancários</h2>
                <p className="text-[12px] text-[#718096]">Acompanhe transferências agendadas, em processamento e liquidadas.</p>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => setIsPayoutModalOpen(true)}
              icon={<Banknote size={16} />}
            >
              Novo Repasse
            </Button>
          </Card>

          <DataTable headers={payoutHeaders} empty={payoutsList.length === 0} emptyMessage="Nenhum repasse registrado.">
            {payoutsList.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4">
                  <strong className="block text-[#0E1726] font-bold">{p.event}</strong>
                  <span className="text-[11px] text-[#718096]">Transferência Bancária / TED</span>
                </td>
                <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">{p.requestedAt}</td>
                <td className="py-3.5 px-4 text-xs font-bold text-slate-800">{p.scheduledFor}</td>
                <td className="py-3.5 px-4 text-right font-semibold text-slate-700">{formatCurrency(p.gross)}</td>
                <td className="py-3.5 px-4 text-right text-xs text-[#EF4444] font-semibold">{formatCurrency(p.fees)}</td>
                <td className="py-3.5 px-4 text-right font-bold text-[#10B981] text-sm">{formatCurrency(p.net)}</td>
                <td className="py-3.5 px-4 text-center"><Badge status={p.status} /></td>
                <td className="py-3.5 pr-4 pl-2 text-right">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => alert(`Borderô e comprovante do repasse #${p.id} gerado.`)}
                  >
                    Borderô
                  </Button>
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}

      {/* TAB 4: FLUXO DE CAIXA */}
      {tab === 'cashflow' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card padding="md" className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[17px] font-bold text-[#0E1726]">Fluxo de Caixa Diário</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">7 dias</span>
              </div>
              <p className="text-[12px] text-[#718096]">Comparativo de entradas brutas e saídas de capital.</p>
            </div>

            <div className="my-8 flex items-end justify-between gap-4 h-52 pt-4 border-b border-[#EDF0F4] pb-2">
              {cashFlow.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    <div
                      className="w-5 sm:w-7 bg-[#10B981] rounded-t transition-all group-hover:brightness-110"
                      style={{ height: `${Math.max(10, (d.entry / maxCashValue) * 100)}%` }}
                    />
                    <div
                      className="w-5 sm:w-7 bg-[#EF4444] rounded-t transition-all group-hover:brightness-110"
                      style={{ height: `${Math.max(8, (d.exit / maxCashValue) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-[#718096] font-medium mt-1">{d.day}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#10B981]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                Entradas: {formatCurrency(cashFlow.reduce((a, b) => a + b.entry, 0))}
              </span>
              <span className="flex items-center gap-1.5 text-[#EF4444]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                Saídas: {formatCurrency(cashFlow.reduce((a, b) => a + b.exit, 0))}
              </span>
            </div>
          </Card>

          <Card padding="md" className="flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-[17px] font-bold text-[#0E1726] mb-1">Resumo Consolidado</h2>
              <p className="text-[12px] text-[#718096]">Resultado operacional do período selecionado.</p>
            </div>

            <div className="space-y-3">
              <div className="rounded-btn bg-[#DCFCE7]/60 border border-[#15803D]/20 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownLeft size={18} className="text-[#15803D]" />
                  <span className="text-xs font-bold text-slate-700">Total Entradas</span>
                </div>
                <strong className="text-sm font-bold text-[#15803D]">
                  {formatCurrency(cashFlow.reduce((a, b) => a + b.entry, 0))}
                </strong>
              </div>

              <div className="rounded-btn bg-[#FEE2E2]/60 border border-[#991B1B]/20 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpRight size={18} className="text-[#991B1B]" />
                  <span className="text-xs font-bold text-slate-700">Total Saídas</span>
                </div>
                <strong className="text-sm font-bold text-[#991B1B]">
                  {formatCurrency(cashFlow.reduce((a, b) => a + b.exit, 0))}
                </strong>
              </div>

              <div className="rounded-btn bg-[#E0F2FE] border border-[#0369A1]/20 p-4">
                <span className="text-[11px] font-bold uppercase text-[#0369A1] block">Resultado Líquido do Período</span>
                <strong className="text-[22px] font-bold text-[#0369A1] block leading-tight mt-1">
                  {formatCurrency(cashFlow.reduce((a, b) => a + b.entry, 0) - cashFlow.reduce((a, b) => a + b.exit, 0))}
                </strong>
              </div>
            </div>

            <Button
              variant="secondary"
              fullWidth
              onClick={() => alert('Download do relatório de fluxo de caixa em PDF.')}
              icon={<Download size={15} />}
            >
              Exportar Fluxo de Caixa
            </Button>
          </Card>
        </div>
      )}

      {/* TAB 5: EXTRATO COMPLETO */}
      {tab === 'statement' && (
        <div className="space-y-4">
          <Card padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-btn bg-slate-100 text-slate-700">
                <CreditCard size={24} />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-[#0E1726]">Extrato Financeiro Completo</h2>
                <p className="text-[12px] text-[#718096]">Histórico cronológico detalhado de entradas, repasses, taxas e estornos.</p>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => alert('Extrato exportado em formato Excel / OFX.')}
              icon={<Download size={15} />}
            >
              Exportar Extrato OFX/CSV
            </Button>
          </Card>

          <DataTable
            headers={transactionHeaders}
            empty={filteredTransactions.length === 0}
            emptyMessage="Nenhum lançamento no extrato."
          >
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-[#64748B] text-xs">{t.date}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded ${t.value >= 0 ? 'bg-emerald-50 text-[#10B981]' : 'bg-rose-50 text-[#EF4444]'}`}>
                      {t.value >= 0 ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                    </span>
                    <div>
                      <strong className="block text-[#0E1726] font-bold">{t.description}</strong>
                      <small className="block text-[11px] text-[#718096]">{t.type}</small>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-700 truncate max-w-[220px]">{t.event}</td>
                <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">{t.method}</td>
                <td className="py-3.5 px-4 text-center"><Badge status={t.status} /></td>
                <td className={`py-3.5 px-4 text-right font-bold text-sm ${t.value >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {t.value >= 0 ? `+ ${formatCurrency(t.value)}` : formatCurrency(t.value)}
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}

      {/* Request Payout Modal */}
      <RequestPayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        availableBalance={availableBalance}
        events={events}
        onRequestPayout={handleRequestPayout}
      />
    </div>
  );
};
