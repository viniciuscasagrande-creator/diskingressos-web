import React, { useState } from 'react';
import { Building2, Plus, Search, X, Check, Building, AlertCircle } from 'lucide-react';
import type { Producer } from '../../types/producer';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';

export const ProducersPage: React.FC<{ notify?: (msg: string) => void }> = ({ notify }) => {
  const { allProducers, recordAuditLog } = useAuth();
  const [producersList, setProducersList] = useState<Producer[]>(allProducers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [cnpj, setCnpj] = useState('');

  const filteredProducers = producersList.filter((p) =>
    `${p.name} ${p.legalName} ${p.cnpj}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newProd: Producer = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      legalName: legalName.trim() || name.trim(),
      cnpj: cnpj.trim(),
      logoInitial: name.trim().slice(0, 1).toUpperCase(),
      activeEventsCount: 0,
      totalEventsCount: 0,
      verified: true,
      avatarColor: '#10B981',
    };

    setProducersList([...producersList, newProd]);
    setName('');
    setLegalName('');
    setCnpj('');
    setIsModalOpen(false);
    recordAuditLog('Cadastro de Produtora', 'Administração', `Nova produtora cadastrada: ${newProd.name} (CNPJ: ${newProd.cnpj})`);
    if (notify) notify('Produtora cadastrada com sucesso.');
  };

  const headers = [
    'Produtora / Razão Social',
    'CNPJ / Documento',
    'Eventos Ativos',
    <div key="st" className="text-center">Status</div>,
    <div key="ac" className="text-right pr-2">Ações</div>
  ];

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="ADMINISTRAÇÃO DE TENANTS"
        title="Produtoras Cadastradas"
        subtitle="Gerencie as organizações que operam eventos e isolam dados dentro da plataforma DiskIngressos."
        actions={
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus size={16} />}
          >
            Nova Produtora
          </Button>
        }
      />

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-blue-50 text-[#1677FF]">
            <Building2 size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-[#64748B] block">Total de Produtoras</span>
            <strong className="text-[20px] font-bold text-[#0E1726]">{producersList.length} cadastradas</strong>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-emerald-50 text-[#10B981]">
            <Check size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-[#64748B] block">Produtoras Ativas</span>
            <strong className="text-[20px] font-bold text-[#10B981]">{producersList.filter(p => p.verified).length} contas</strong>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-purple-50 text-[#7C3AED]">
            <Building size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-[#64748B] block">Eventos Gerenciados</span>
            <strong className="text-[20px] font-bold text-[#7C3AED]">
              {producersList.reduce((acc, p) => acc + p.activeEventsCount, 0)} no ar
            </strong>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-card border border-[#E2E8F0] shadow-xs">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar produtora por nome ou CNPJ..."
            className="w-full h-[40px] pl-10 pr-4 rounded-input border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0E1726] placeholder-[#718096] outline-none transition focus:border-[#1677FF] focus:bg-white"
          />
        </div>
      </div>

      {/* DataTable */}
      <DataTable headers={headers} empty={filteredProducers.length === 0} emptyMessage="Nenhuma produtora encontrada.">
        {filteredProducers.map((p) => (
          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
            <td className="py-3.5 px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-slate-900 text-white font-bold text-xs">
                  {p.logoInitial}
                </div>
                <div>
                  <strong className="block text-[#0E1726] font-bold text-sm">{p.name}</strong>
                  <span className="text-[11px] text-[#718096]">{p.legalName} • ID: {p.id}</span>
                </div>
              </div>
            </td>

            <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
              {p.cnpj}
            </td>

            <td className="py-3.5 px-4 font-bold text-xs text-[#1677FF]">
              {p.activeEventsCount} ativos ({p.totalEventsCount} total)
            </td>

            <td className="py-3.5 px-4 text-center">
              <Badge status={p.verified ? 'ativo' : 'inativo'}>
                {p.verified ? 'Ativa' : 'Inativa'}
              </Badge>
            </td>

            <td className="py-3.5 pr-4 pl-2 text-right">
              <button
                onClick={() => {
                  setProducersList(producersList.map(item => item.id === p.id ? { ...item, verified: !item.verified } : item));
                  if (notify) notify(`Status da produtora ${p.name} alterado.`);
                }}
                className="text-xs font-bold text-[#1677FF] hover:underline"
              >
                {p.verified ? 'Desativar Conta' : 'Ativar Conta'}
              </button>
            </td>
          </tr>
        ))}
      </DataTable>

      {/* Modal Nova Produtora */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-card shadow-2xl border border-slate-200 p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-emerald-50 text-[#10B981]">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[#0E1726]">Cadastrar Nova Produtora</h3>
                <p className="text-[12px] text-[#718096]">Organização com isolamento multi-tenant de dados.</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Nome Fantasia da Produtora"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Live Entretenimento"
                required
              />
              <Input
                label="Razão Social (PJ)"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Ex: Live Produções Artísticas Ltda"
                required
              />
              <Input
                label="CNPJ"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0001-00"
                required
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-[#EDF0F4]">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Salvar Produtora
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
