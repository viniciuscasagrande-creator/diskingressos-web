import React, { useState } from 'react';
import { ArrowLeft, Users, Plus, Trash2, CheckCircle2, Percent, ArrowRightLeft, Shield } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';

interface SplitRule {
  id: string;
  name: string;
  role: string;
  percentage: number;
  pixKey: string;
  status: 'ativo' | 'pendente';
}

const initialRules: SplitRule[] = [
  { id: '1', name: 'Live Entretenimento (Produtora Master)', role: 'Produtor Titular', percentage: 60, pixKey: 'financeiro@live.com.br', status: 'ativo' },
  { id: '2', name: 'Seven Entretenimento', role: 'Coprodutor / Divulgação', percentage: 20, pixKey: 'contato@seven.com.br', status: 'ativo' },
  { id: '3', name: 'Banda / Artista Produção', role: 'Cachê Variável', percentage: 15, pixKey: 'artista@management.com', status: 'ativo' },
  { id: '4', name: 'Teatro Positivo / Espaço', role: 'Taxa de Locação %', percentage: 5, pixKey: 'locacao@positivo.com.br', status: 'ativo' },
];

export const SplitFinanceiroModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [rules, setRules] = useState<SplitRule[]>(initialRules);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPercent, setNewPercent] = useState('');
  const [newPix, setNewPix] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const totalAllocated = rules.reduce((acc, r) => acc + r.percentage, 0);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(newPercent) || 0;
    if (totalAllocated + p > 100) {
      alert(`O percentual total não pode ultrapassar 100%. Disponível: ${100 - totalAllocated}%`);
      return;
    }
    const newRule: SplitRule = {
      id: String(Date.now()),
      name: newName.trim(),
      role: newRole.trim() || 'Beneficiário',
      percentage: p,
      pixKey: newPix.trim(),
      status: 'ativo',
    };
    setRules([...rules, newRule]);
    setNewName('');
    setNewRole('');
    setNewPercent('');
    setNewPix('');
    setShowAdd(false);
  };

  const handleRemove = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const headers = [
    'Beneficiário / Razão Social',
    'Papel na Produção',
    <div key="pct" className="text-center">Percentual de Partilha</div>,
    'Chave Pix / Conta',
    <div key="st" className="text-center">Status</div>,
    <div key="ac" className="text-right pr-2">Ação</div>
  ];

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
        eyebrow="ADVANCED & INTELIGÊNCIA"
        title="Split Financeiro Automatizado"
        subtitle="Configure a divisão e liquidação automática das receitas dos ingressos entre os parceiros do evento."
        actions={
          <Button
            variant="primary"
            onClick={() => setShowAdd(!showAdd)}
            icon={<Plus size={16} />}
          >
            Adicionar Beneficiário
          </Button>
        }
      />

      {/* Allocation Status Card */}
      <Card padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
            Distribuição da Receita Líquida
          </span>
          <strong className="text-[20px] font-bold text-[#0E1726] mt-0.5 block">
            {totalAllocated}% alocado de 100%
          </strong>
          <span className="text-[12px] text-[#718096]">
            {100 - totalAllocated === 0 ? 'Partilha 100% configurada e validada.' : `Saldo restante a alocar: ${100 - totalAllocated}%`}
          </span>
        </div>

        <div className="min-w-[200px]">
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${totalAllocated === 100 ? 'bg-[#10B981]' : 'bg-[#1677FF]'}`}
              style={{ width: `${Math.min(totalAllocated, 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Inline Form */}
      {showAdd && (
        <Card padding="md" className="border-[#1677FF]/40 animate-in fade-in duration-150">
          <h3 className="text-[16px] font-bold text-[#0E1726] mb-3">Novo Beneficiário no Split</h3>
          <form onSubmit={handleAddRule} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              label="Nome / Razão Social"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Ex: Coprodutora Alpha"
              required
            />
            <Input
              label="Função / Papel"
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              placeholder="Ex: Marketing & Tráfego"
            />
            <Input
              label="Percentual (%)"
              type="number"
              step="0.1"
              max={100 - totalAllocated}
              value={newPercent}
              onChange={e => setNewPercent(e.target.value)}
              placeholder={`Máx: ${100 - totalAllocated}%`}
              required
            />
            <Input
              label="Chave Pix para TED/PIX"
              value={newPix}
              onChange={e => setNewPix(e.target.value)}
              placeholder="CNPJ ou E-mail"
              required
            />
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Salvar Regra de Split
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Rules Table */}
      <DataTable headers={headers}>
        {rules.map(r => (
          <tr key={r.id} className="hover:bg-slate-50 transition-colors">
            <td className="py-3.5 px-4 font-bold text-[#0E1726]">
              {r.name}
            </td>
            <td className="py-3.5 px-4 text-slate-600 text-xs">
              {r.role}
            </td>
            <td className="py-3.5 px-4 text-center font-bold text-[#1677FF] text-sm">
              {r.percentage}%
            </td>
            <td className="py-3.5 px-4 text-xs font-mono text-slate-700">
              {r.pixKey}
            </td>
            <td className="py-3.5 px-4 text-center">
              <Badge status={r.status} />
            </td>
            <td className="py-3.5 pr-4 pl-2 text-right">
              <button
                onClick={() => handleRemove(r.id)}
                className="p-1 text-slate-400 hover:text-[#EF4444] transition rounded"
                title="Excluir regra"
              >
                <Trash2 size={15} />
              </button>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
};
