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

export const GenericFinanceSubView: React.FC<GenericFinanceSubViewProps> = ({
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
    const cents = Math.round(Number(newAmount.replace(',', '.')) * 100) || 10000;
    const newOp: OperationRow = {
      id: String(Date.now()),
      code: `#LAN-${Math.floor(10000 + Math.random() * 90000)}`,
      description: newDesc.trim(),
      reference: newRef.trim() || 'Operação Global',
      date: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      status: 'liquidado',
      type: newType,
      amountCents: cents
    };

    setRows([newOp, ...rows]);
    setNewDesc('');
    setNewAmount('');
    setShowModal(false);
    notify?.(`Operação ${newOp.code} registrada com sucesso em ${meta.title}.`);
  };

  const handleToggleStatus = (id: string) => {
    setRows(rows.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'liquidado' ? 'pendente' : 'liquidado';
        notify?.(`Lançamento ${r.code} alterado para ${nextStatus}.`);
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  const filteredRows = rows.filter(r => {
    const matchesQ = (r.code + ' ' + r.description + ' ' + r.reference).toLowerCase().includes(q.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || r.status === statusFilter;
    return matchesQ && matchesStatus;
  });

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
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={handleExportCsv}
              icon={<Download size={15} />}
            >
              Exportar Relatório
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
              icon={<Plus size={15} />}
            >
              Nova Operação
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="STATUS OPERACIONAL"
          value="100% Ativo"
          note="sem divergências"
          accent={meta.accentColor}
          icon={<CheckCircle2 size={20} />}
        />
        <KpiCard
          label="VOLUME CONSOLIDADO"
          value={meta.metrics ? meta.metrics.value : 'R$ 148.750,00'}
          note="acumulado no ciclo"
          accent="blue"
          icon={<TrendingUp size={20} />}
        />
        <KpiCard
          label="ÚLTIMA ATUALIZAÇÃO"
          value="Hoje, em tempo real"
          note="sincronização contínua"
          accent="green"
          icon={<Shield size={20} />}
        />
        <KpiCard
          label="CONFORMIDADE FISCAL"
          value="Auditado"
          note="DiskIngressos Compliance"
          accent="purple"
          icon={<FileText size={20} />}
        />
      </div>

      {/* Main Details Panel */}
      <Card padding="md" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDF0F4] pb-3">
          <div>
            <h2 className="text-[17px] font-bold text-[#0E1726]">{meta.title} — Visão Operacional</h2>
            <p className="text-[12px] text-[#718096]">{meta.subtitle}</p>
          </div>
          {meta.badge && (
            <Badge status="ativo">{meta.badge}</Badge>
          )}
        </div>

        {/* Toolbar with Search and Status Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 max-w-sm w-full bg-slate-50 border border-slate-200 rounded-btn px-3 py-1.5">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Pesquisar lançamentos..."
              className="bg-transparent text-xs outline-none w-full text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {['todos', 'liquidado', 'pendente'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-semibold rounded-btn transition-colors ${statusFilter === st ? 'bg-[#1677FF] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {st === 'todos' ? 'Todos' : st === 'liquidado' ? 'Liquidados' : 'Pendentes'}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          headers={['Identificador', 'Descrição do Lançamento', 'Referência', 'Data', <div key="st" className="text-center">Status</div>, <div key="val" className="text-right pr-2">Valor</div>, <div key="ac" className="text-center">Ações</div>]}
        >
          {filteredRows.map(row => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-3 px-4 font-mono font-bold text-xs text-[#1677FF]">{row.code}</td>
              <td className="py-3 px-4 font-bold text-slate-900 text-xs">{row.description}</td>
              <td className="py-3 px-4 text-xs text-slate-600">{row.reference}</td>
              <td className="py-3 px-4 text-xs text-slate-500">{row.date}</td>
              <td className="py-3 px-4 text-center">
                <Badge status={row.status === 'liquidado' ? 'pago' : 'pendente'}>
                  {row.status === 'liquidado' ? 'Liquidado' : 'Pendente'}
                </Badge>
              </td>
              <td className={`py-3 px-4 text-right font-bold text-xs ${row.type === 'entrada' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {row.type === 'entrada' ? '+ ' : '- '}{formatCurrency(row.amountCents)}
              </td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => handleToggleStatus(row.id)}
                  title="Alternar Status"
                  className="px-2.5 py-1 text-[11px] font-bold border border-slate-200 rounded hover:bg-slate-100 text-slate-700"
                >
                  {row.status === 'liquidado' ? 'Pendente' : 'Liquidar'}
                </button>
              </td>
            </tr>
          ))}
          {filteredRows.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-xs text-slate-500">
                Nenhum lançamento encontrado.
              </td>
            </tr>
          )}
        </DataTable>
      </Card>

      {/* Interactive Modal to Create Operation */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Nova Operação — {meta.title}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRow} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Ex: Liquidação de Lote ou Ajuste"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#1677FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Referência / Evento</label>
                <input
                  type="text"
                  value={newRef}
                  onChange={e => setNewRef(e.target.value)}
                  placeholder="Ex: Festival Curitiba 2026"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#1677FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#1677FF] bg-white"
                  >
                    <option value="entrada">Entrada (+)</option>
                    <option value="saida">Saída (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                    placeholder="1500.00"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#1677FF]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#1677FF] text-white rounded-lg hover:bg-blue-600"
                >
                  Confirmar e Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

