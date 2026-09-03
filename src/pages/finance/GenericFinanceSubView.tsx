import React, { useState } from 'react';
import { ArrowLeft, Download, CheckCircle2, Shield, TrendingUp, Plus, X, Search, FileText } from 'lucide-react';
import type { FinanceModuleKey } from '../../types/financeHub';
import { financeModulesList } from '../../data/financeModules';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { KpiCard } from '../../components/ui/KpiCard';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { SimuladorSpreadModule } from './SimuladorSpreadModule';
import FinanceReconciliationPage from '../FinanceReconciliationPage';

interface GenericFinanceSubViewProps {
  moduleKey: FinanceModuleKey;
  onBack: () => void;
  notify?: (msg: string) => void;
}

interface OperationRow {
  id: string;
  code: string;
  description: string;
  reference: string;
  date: string;
  status: 'liquidado' | 'pendente';
  type: 'entrada' | 'saida';
  amountCents: number;
}

const GenericFinanceTableView: React.FC<GenericFinanceSubViewProps> = ({
  moduleKey,
  onBack,
  notify,
}) => {
  const meta = financeModulesList.find((m) => m.key === moduleKey) || financeModulesList[0];
  const [rows, setRows] = useState<OperationRow[]>([
    { id: '1', code: '#LAN-89102', description: 'Registro de Operação Automatizada', reference: 'Festival Curitiba 2026', date: '28/08/2026 15:30', status: 'liquidado', type: 'entrada', amountCents: 1450000 },
    { id: '2', code: '#LAN-89088', description: 'Taxa de Liquidação e Processamento', reference: 'Sem Parar - Experiência Música', date: '28/08/2026 14:10', status: 'liquidado', type: 'saida', amountCents: 38000 },
    { id: '3', code: '#LAN-89045', description: 'Repasse Programado Coprodutor', reference: 'Arena Prime Show', date: '28/08/2026 11:20', status: 'pendente', type: 'saida', amountCents: 520000 },
    { id: '4', code: '#LAN-89012', description: 'Ajuste de Split & Adquirência', reference: 'Festival Curitiba 2026', date: '27/08/2026 18:45', status: 'liquidado', type: 'entrada', amountCents: 98000 }
  ]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newRef, setNewRef] = useState('Festival Curitiba 2026');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'entrada' | 'saida'>('entrada');

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getSubcategoryName = (cat: string) => {
    switch (cat) {
      case 'operacoes-caixa': return 'OPERAÇÕES DE CAIXA';
      case 'advanced-inteligencia': return 'ADVANCED & INTELIGÊNCIA';
      case 'simuladores-liquidacoes': return 'SIMULADORES, MÉTODOS & LIQUIDAÇÕES';
      default: return 'FINANCEIRO';
    }
  };

  const handleExportCsv = () => {
    if (!rows.length) {
      notify?.('Não há dados para exportar.');
      return;
    }
    const headers = ['Identificador', 'Descricao', 'Referencia', 'Data', 'Status', 'Tipo', 'Valor_BRL'];
    const esc = (v: any) => `"${String(v ?? '').replaceAll('"', '""')}"`;
    const csvContent = [
      headers.join(';'),
      ...rows.map(r => [
        esc(r.code),
        esc(r.description),
        esc(r.reference),
        esc(r.date),
        esc(r.status),
        esc(r.type),
        esc((r.amountCents / 100).toFixed(2))
      ].join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${meta.key}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify?.(`Relatório de ${meta.title} exportado com sucesso em CSV.`);
  };

  const handleCreateRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) {
      alert('Informe a descrição da operação.');
      return;
    }
    const cents = Math.round((parseFloat(newAmount) || 0) * 100);
    if (cents <= 0) {
      alert('Informe um valor válido maior que zero.');
      return;
    }

    const newRow: OperationRow = {
      id: Date.now().toString(),
      code: `#LAN-${Math.floor(10000 + Math.random() * 90000)}`,
      description: newDesc.trim(),
      reference: newRef.trim() || 'Operação Manual',
      date: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      status: 'liquidado',
      type: newType,
      amountCents: cents
    };

    setRows([newRow, ...rows]);
    setNewDesc('');
    setNewAmount('');
    setShowModal(false);
    notify?.(`Novo registro ${newRow.code} adicionado com sucesso em ${meta.title}.`);
  };

  const filteredRows = rows.filter((r) => {
    const matchesQuery = (r.description + ' ' + r.code + ' ' + r.reference)
      .toLowerCase()
      .includes(q.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || r.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const totalEntradas = rows
    .filter((r) => r.type === 'entrada')
    .reduce((acc, curr) => acc + curr.amountCents, 0);

  const totalSaidas = rows
    .filter((r) => r.type === 'saida')
    .reduce((acc, curr) => acc + curr.amountCents, 0);

  const saldoLiquido = totalEntradas - totalSaidas;

  return (
    <div className="w-full space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-[#1677FF] hover:underline"
      >
        <ArrowLeft size={16} />
        Voltar para o Hub Financeiro
      </button>

      <PageHeader
        eyebrow={getSubcategoryName(meta.category)}
        title={meta.title}
        subtitle={meta.description}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleExportCsv}
              icon={<Download size={15} />}
            >
              Exportar CSV
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
              icon={<Plus size={15} />}
            >
              Novo Lançamento
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="SALDO CONCILIADO DO MÓDULO"
          value={formatCurrency(saldoLiquido)}
          note="movimentação líquida"
          accent={saldoLiquido >= 0 ? 'green' : 'orange'}
          icon={<Shield size={20} />}
        />
        <KpiCard
          label="TOTAL DE ENTRADAS"
          value={formatCurrency(totalEntradas)}
          note="créditos e liquidações"
          accent="blue"
          icon={<TrendingUp size={20} />}
        />
        <KpiCard
          label="TOTAL DE SAÍDAS / REPASSES"
          value={formatCurrency(totalSaidas)}
          note="débitos e taxas deduzidas"
          accent="purple"
          icon={<CheckCircle2 size={20} />}
        />
        <KpiCard
          label="STATUS DO SISTEMA"
          value={meta.badge}
          note="auditoria em tempo real"
          accent="cyan"
          icon={<CheckCircle2 size={20} />}
        />
      </div>

      <Card padding="md" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#EDF0F4] pb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" size={16} />
            <input
              type="text"
              placeholder="Buscar por descrição, código ou referência..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-btn pl-9 pr-3 py-2 text-xs text-[#0E1726] outline-none focus:border-[#1677FF] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none bg-white font-medium text-slate-700"
            >
              <option value="todos">Todos os Status</option>
              <option value="liquidado">Liquidados</option>
              <option value="pendente">Pendentes</option>
            </select>
          </div>
        </div>

        <DataTable
          headers={[
            'Identificador',
            'Descrição da Operação',
            'Referência / Evento',
            'Data / Hora',
            <div key="tipo" className="text-center">Tipo</div>,
            <div key="st" className="text-center">Status</div>,
            <div key="val" className="text-right pr-2">Valor</div>
          ]}
          empty={filteredRows.length === 0}
          emptyMessage={`Nenhuma movimentação localizada para ${meta.title}.`}
        >
          {filteredRows.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50/80 transition-colors border-b border-[#EDF0F4] last:border-0 text-xs">
              <td className="py-3 px-3 font-mono font-bold text-[#1677FF]">
                {r.code}
              </td>
              <td className="py-3 px-3 font-semibold text-[#0E1726]">
                {r.description}
              </td>
              <td className="py-3 px-3 text-[#718096]">
                {r.reference}
              </td>
              <td className="py-3 px-3 text-[#718096] whitespace-nowrap">
                {r.date}
              </td>
              <td className="py-3 px-3 text-center">
                <Badge variant={r.type === 'entrada' ? 'success' : 'neutral'}>
                  {r.type === 'entrada' ? 'Crédito (+)' : 'Débito (-)'}
                </Badge>
              </td>
              <td className="py-3 px-3 text-center">
                <Badge variant={r.status === 'liquidado' ? 'success' : 'warning'}>
                  {r.status === 'liquidado' ? 'Liquidado' : 'Pendente'}
                </Badge>
              </td>
              <td className="py-3 px-3 text-right pr-2 font-mono font-bold whitespace-nowrap">
                <span className={r.type === 'entrada' ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                  {r.type === 'entrada' ? '+' : '-'} {formatCurrency(r.amountCents)}
                </span>
              </td>
            </tr>
          ))}
        </DataTable>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-modal border border-[#EDF0F4] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[#EDF0F4] bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <FileText className="text-[#1677FF]" size={18} />
                <h3 className="font-bold text-sm text-[#0E1726]">Novo Lançamento - {meta.title}</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#718096] hover:text-[#0E1726] p-1 rounded-btn hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRow} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Descrição da Operação *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Liquidação de lote adicional"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#1677FF] bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Referência / Evento
                </label>
                <input
                  type="text"
                  placeholder="Ex: Festival Curitiba 2026"
                  value={newRef}
                  onChange={(e) => setNewRef(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#1677FF] bg-white text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tipo de Movimento
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'entrada' | 'saida')}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none bg-white font-medium text-slate-800"
                  >
                    <option value="entrada">Crédito / Entrada (+)</option>
                    <option value="saida">Débito / Saída (-)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-[#1677FF] bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EDF0F4]">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Confirmar Lançamento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const GenericFinanceSubView: React.FC<GenericFinanceSubViewProps> = ({
  moduleKey,
  onBack,
  notify,
}) => {
  if (moduleKey === 'simulador-spread') {
    return <SimuladorSpreadModule onBack={onBack} notify={notify} />;
  }

  if (moduleKey === 'conciliacao-bancaria') {
    return <FinanceReconciliationPage onBack={onBack} notify={notify} />;
  }

  return <GenericFinanceTableView moduleKey={moduleKey} onBack={onBack} notify={notify} />;
};

