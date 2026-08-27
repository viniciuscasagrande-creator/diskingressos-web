import React, { useState } from 'react';
import { ShieldCheck, Shield, Check, X, Save, Lock, AlertCircle } from 'lucide-react';
import type { UserRole } from '../../types/auth';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface PermissionsPageProps {
  notify?: (msg: string) => void;
}

const roles: { role: UserRole; label: string; desc: string }[] = [
  { role: 'admin-master', label: 'Admin Master', desc: 'Acesso total irrestrito e visão global' },
  { role: 'admin', label: 'Admin', desc: 'Acesso administrativo conforme regras configuradas' },
  { role: 'produtor-admin', label: 'Produtor Admin', desc: 'Gestão completa da própria produtora' },
  { role: 'produtor-financeiro', label: 'Produtor Financeiro', desc: 'Acesso a saldos, extratos e repasses' },
  { role: 'produtor-operacional', label: 'Produtor Operacional', desc: 'Portaria, check-in, lotes e POS' },
  { role: 'produtor-marketing', label: 'Produtor Marketing', desc: 'Campanhas, pixels e conversões' },
  { role: 'leitura', label: 'Somente Leitura', desc: 'Apenas visualização para auditoria' },
];

const modules = [
  { key: 'events', label: 'Eventos & Lotes' },
  { key: 'finance', label: 'Financeiro & Saldos' },
  { key: 'pos', label: 'POS & Bilheteria Presencial' },
  { key: 'participants', label: 'Participantes & Check-in' },
  { key: 'marketing', label: 'Marketing & Campanhas' },
  { key: 'admin', label: 'Administração & Usuários' },
];

const actions = [
  { key: 'view', label: 'Visualizar' },
  { key: 'create', label: 'Criar' },
  { key: 'edit', label: 'Editar' },
  { key: 'delete', label: 'Excluir' },
];

export const PermissionsPage: React.FC<PermissionsPageProps> = ({ notify }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('produtor-admin');

  // Matrix State: role -> module -> action -> boolean
  const [matrix, setMatrix] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    roles.forEach((r) => {
      modules.forEach((m) => {
        actions.forEach((a) => {
          const key = `${r.role}|${m.key}|${a.key}`;
          if (r.role === 'admin-master') {
            initial[key] = true;
          } else if (r.role === 'admin') {
            initial[key] = a.key !== 'delete' || m.key === 'events';
          } else if (r.role === 'produtor-admin') {
            initial[key] = m.key !== 'admin' || a.key === 'view';
          } else if (r.role === 'produtor-financeiro') {
            initial[key] = m.key === 'finance' || (m.key === 'events' && a.key === 'view');
          } else if (r.role === 'produtor-operacional') {
            initial[key] = ['events', 'pos', 'participants'].includes(m.key) && a.key !== 'delete';
          } else if (r.role === 'produtor-marketing') {
            initial[key] = (m.key === 'marketing' && a.key !== 'delete') || (m.key === 'events' && a.key === 'view');
          } else if (r.role === 'leitura') {
            initial[key] = a.key === 'view' && m.key !== 'admin';
          }
        });
      });
    });
    return initial;
  });

  const togglePermission = (moduleKey: string, actionKey: string) => {
    if (selectedRole === 'admin-master') return; // Locked for Master
    const key = `${selectedRole}|${moduleKey}|${actionKey}`;
    setMatrix((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    if (notify) notify('Matriz de permissões atualizada com sucesso!');
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="CONTROLE DE ACESSO BASEADO EM FUNÇÃO (RBAC)"
        title="Perfis & Matriz de Permissões"
        subtitle="Defina o que cada perfil pode visualizar, criar, editar ou excluir em cada módulo do sistema."
        actions={
          <Button
            variant="primary"
            onClick={handleSave}
            icon={<Save size={16} />}
          >
            Salvar Matriz
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role Selector Sidebar */}
        <div className="lg:col-span-1 space-y-2 bg-white p-3 rounded-card border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] px-3 py-1 block">
            Selecione o Perfil
          </span>
          {roles.map((r) => (
            <button
              key={r.role}
              onClick={() => setSelectedRole(r.role)}
              className={`flex flex-col w-full text-left p-3 rounded-btn transition ${
                selectedRole === r.role
                  ? 'bg-[#1677FF] text-white shadow-sm'
                  : 'hover:bg-slate-100 text-[#0E1726]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">{r.label}</span>
                {r.role === 'admin-master' && (
                  <Lock size={12} className={selectedRole === r.role ? 'text-white' : 'text-slate-400'} />
                )}
              </div>
              <span className={`text-[11px] mt-0.5 ${selectedRole === r.role ? 'text-blue-100' : 'text-[#718096]'}`}>
                {r.desc}
              </span>
            </button>
          ))}
        </div>

        {/* Permission Matrix Table */}
        <div className="lg:col-span-3 bg-white rounded-card border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
            <div>
              <strong className="text-sm font-bold text-[#0E1726]">
                Matriz de Acesso: {roles.find(r => r.role === selectedRole)?.label}
              </strong>
              <span className="text-xs text-[#718096] block mt-0.5">
                {selectedRole === 'admin-master'
                  ? 'O perfil Admin Master possui todas as permissões ativas por definição.'
                  : 'Clique nos marcadores para conceder ou revogar acessos.'}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#1677FF] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              ● Configuração Ativa
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="py-3 px-4 font-bold text-[#64748B] uppercase tracking-wider">Módulo do Sistema</th>
                  {actions.map((act) => (
                    <th key={act.key} className="py-3 px-4 font-bold text-[#64748B] uppercase tracking-wider text-center">
                      {act.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {modules.map((mod) => (
                  <tr key={mod.key} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#0E1726]">
                      {mod.label}
                    </td>
                    {actions.map((act) => {
                      const isAllowed = matrix[`${selectedRole}|${mod.key}|${act.key}`];
                      return (
                        <td key={act.key} className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            disabled={selectedRole === 'admin-master'}
                            onClick={() => togglePermission(mod.key, act.key)}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-btn transition-all ${
                              isAllowed
                                ? 'bg-emerald-500 text-white shadow-xs hover:bg-emerald-600'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                            title={isAllowed ? 'Permitido (Clique para revogar)' : 'Negado (Clique para permitir)'}
                          >
                            {isAllowed ? <Check size={16} /> : <X size={14} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
