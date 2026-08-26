import React, { useState } from 'react';
import { 
  Users, UserPlus, Shield, Check, X, KeyRound, 
  Trash2, Edit3, UserCheck, AlertCircle, Search, 
  SlidersHorizontal, Building2, CheckCircle2, XCircle
} from 'lucide-react';
import type { User, UserRole, PermissionMatrix } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';
import { defaultPermissionsByRole } from '../../data/users';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';

export const UserManagerPage: React.FC = () => {
  const { users, allProducers, createUser, updateUser, deleteUser, currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('produtor-operacional');
  const [formProducerId, setFormProducerId] = useState<string>('prod-1');
  const [formStatus, setFormStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [formPermissions, setFormPermissions] = useState<PermissionMatrix>(defaultPermissionsByRole['produtor-operacional']);

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'todos' || u.role === roleFilter;
    const matchSearch = `${u.name} ${u.email} ${u.producerName || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchRole && matchSearch;
  });

  const handleOpenCreate = () => {
    setEditingUserId(null);
    setFormName('');
    setFormEmail('');
    setFormRole('produtor-admin');
    setFormProducerId('prod-1');
    setFormStatus('ativo');
    setFormPermissions(defaultPermissionsByRole['produtor-admin']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormProducerId(user.producerId || 'prod-1');
    setFormStatus(user.status === 'ativo' ? 'ativo' : 'inativo');
    setFormPermissions(user.permissions);
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setFormRole(newRole);
    setFormPermissions(defaultPermissionsByRole[newRole]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const prodObj = allProducers.find((p) => p.id === formProducerId);

    const roleLabels: Record<UserRole, string> = {
      'admin-master': 'Admin Master',
      'admin': 'Admin',
      'produtor-admin': 'Produtor Admin',
      'produtor-financeiro': 'Produtor Financeiro',
      'produtor-operacional': 'Produtor Operacional',
      'produtor-marketing': 'Produtor Marketing',
      'leitura': 'Leitura',
    };

    if (editingUserId) {
      updateUser(editingUserId, {
        name: formName,
        email: formEmail,
        role: formRole,
        roleLabel: roleLabels[formRole],
        producerId: formRole === 'admin-master' ? null : formProducerId,
        producerName: formRole === 'admin-master' ? 'Visão Global (Todas as Produtoras)' : prodObj?.name,
        status: formStatus,
        permissions: formPermissions,
      });
    } else {
      createUser({
        name: formName,
        email: formEmail,
        role: formRole,
        roleLabel: roleLabels[formRole],
        producerId: formRole === 'admin-master' ? null : formProducerId,
        producerName: formRole === 'admin-master' ? 'Visão Global (Todas as Produtoras)' : prodObj?.name,
        status: formStatus,
        avatarColor: '#1677FF',
        permissions: formPermissions,
      });
    }

    setIsModalOpen(false);
  };

  const togglePermission = (module: keyof PermissionMatrix, action: string) => {
    setFormPermissions((prev) => ({
      ...prev,
      [module]: {
        ...(prev[module] as Record<string, boolean>),
        [action]: !(prev[module] as Record<string, boolean>)[action],
      },
    }));
  };

  const headers = [
    'Usuário / Identificação',
    'Perfil de Acesso (RBAC)',
    'Produtora Vinculada (Tenant)',
    <div key="st" className="text-center">Status</div>,
    'Último Acesso',
    <div key="ac" className="text-right pr-2">Ações</div>
  ];

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="ADMINISTRAÇÃO & CONTROLE DE ACESSO"
        title="Gerenciamento de Usuários & Perfis"
        subtitle="Controle multi-tenant: crie operadores, gerencie perfis de produtores e defina permissões granulares."
        actions={
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            icon={<UserPlus size={16} />}
          >
            Novo Usuário
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-card border border-[#E2E8F0] shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, e-mail ou produtora..."
            className="w-full h-[40px] pl-10 pr-4 rounded-input border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0E1726] placeholder-[#718096] outline-none transition focus:border-[#1677FF] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="todos">Todos os Perfis ({users.length})</option>
            <option value="admin-master">Admin Master</option>
            <option value="produtor-admin">Produtor Admin</option>
            <option value="produtor-financeiro">Produtor Financeiro</option>
            <option value="produtor-operacional">Produtor Operacional</option>
            <option value="produtor-marketing">Produtor Marketing</option>
            <option value="leitura">Leitura</option>
          </Select>
        </div>
      </div>

      {/* Users DataTable */}
      <DataTable headers={headers} empty={filteredUsers.length === 0} emptyMessage="Nenhum usuário encontrado.">
        {filteredUsers.map((u) => (
          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
            <td className="py-3.5 px-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white font-bold text-xs"
                  style={{ backgroundColor: u.avatarColor || '#1677FF' }}
                >
                  {u.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <strong className="block text-[#0E1726] font-bold text-sm">{u.name}</strong>
                  <span className="text-[12px] text-[#718096]">{u.email}</span>
                </div>
              </div>
            </td>

            <td className="py-3.5 px-4">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                u.role === 'admin-master'
                  ? 'bg-blue-100 text-[#1677FF] border border-blue-200'
                  : u.role === 'produtor-admin'
                  ? 'bg-emerald-100 text-[#15803D] border border-emerald-200'
                  : u.role === 'produtor-financeiro'
                  ? 'bg-orange-100 text-[#EA580C] border border-orange-200'
                  : 'bg-purple-100 text-[#7C3AED] border border-purple-200'
              }`}>
                ● {u.roleLabel}
              </span>
            </td>

            <td className="py-3.5 px-4 font-semibold text-slate-700 text-xs">
              <div className="flex items-center gap-1.5">
                <Building2 size={14} className="text-[#1677FF]" />
                <span>{u.producerName || 'Visão Global'}</span>
              </div>
            </td>

            <td className="py-3.5 px-4 text-center">
              <Badge status={u.status} />
            </td>

            <td className="py-3.5 px-4 text-xs text-[#64748B] font-medium">
              {u.lastLogin}
            </td>

            <td className="py-3.5 pr-4 pl-2 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <button
                  onClick={() => handleOpenEdit(u)}
                  className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition"
                  title="Editar usuário e permissões"
                >
                  <Edit3 size={15} />
                </button>
                {u.id !== currentUser?.id && (
                  <button
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja excluir o usuário ${u.name}?`)) {
                        deleteUser(u.id);
                      }
                    }}
                    className="p-1.5 rounded text-slate-400 hover:bg-rose-50 hover:text-[#EF4444] transition"
                    title="Excluir usuário"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      {/* User Create/Edit Modal with Permission Matrix */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-card shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#222A36] px-6 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <Shield size={20} className="text-[#1677FF]" />
                <h3 className="text-[17px] font-bold">
                  {editingUserId ? 'Editar Usuário & Permissões' : 'Criar Novo Usuário Multi-Produtor'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nome Completo"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Carlos Silva"
                  required
                />
                <Input
                  label="E-mail de Acesso"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="usuario@produtora.com.br"
                  required
                />
                <Select
                  label="Perfil de Acesso (RBAC)"
                  value={formRole}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                >
                  <option value="admin-master">Admin Master (Global)</option>
                  <option value="admin">Admin</option>
                  <option value="produtor-admin">Produtor Admin (Total da Produtora)</option>
                  <option value="produtor-financeiro">Produtor Financeiro (Apenas Financeiro)</option>
                  <option value="produtor-operacional">Produtor Operacional (Portaria/POS/Check-in)</option>
                  <option value="produtor-marketing">Produtor Marketing (Pixels/Campanhas)</option>
                  <option value="leitura">Leitura (Somente Consulta)</option>
                </Select>

                {formRole !== 'admin-master' ? (
                  <Select
                    label="Produtora Vinculada (Isolamento de Dados)"
                    value={formProducerId}
                    onChange={(e) => setFormProducerId(e.target.value)}
                  >
                    {allProducers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — CNPJ {p.cnpj}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="flex flex-col justify-center text-xs text-blue-600 bg-blue-50 p-2.5 rounded-btn border border-blue-200">
                    <strong className="block font-bold">Acesso Global Master</strong>
                    <span>Pode alternar entre qualquer produtora no sistema.</span>
                  </div>
                )}
              </div>

              {/* PERMISSION MATRIX GRANULAR */}
              <div className="pt-2 border-t border-[#EDF0F4]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Matriz de Permissões Granulares
                  </h4>
                  <span className="text-[11px] text-slate-400">Personalize os acessos do usuário</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F8FAFC] p-4 rounded-btn border border-[#E2E8F0]">
                  {/* Eventos */}
                  <div className="space-y-1.5 p-2 bg-white rounded border border-[#E2E8F0]">
                    <strong className="block text-[#0E1726] font-bold text-[11px] uppercase text-[#1677FF]">
                      1. Eventos & Lotes
                    </strong>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={formPermissions.events.view}
                        onChange={() => togglePermission('events', 'view')}
                        className="accent-[#1677FF]"
                      />
                      <span>Visualizar Eventos</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={formPermissions.events.create}
                        onChange={() => togglePermission('events', 'create')}
                        className="accent-[#1677FF]"
                      />
                      <span>Criar Novo Evento</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={formPermissions.events.edit}
                        onChange={() => togglePermission('events', 'edit')}
                        className="accent-[#1677FF]"
                      />
                      <span>Editar e Alterar Lotes</span>
                    </label>
                  </div>

                  {/* Financeiro */}
                  <div className="space-y-1.5 p-2 bg-white rounded border border-[#E2E8F0]">
                    <strong className="block text-[#0E1726] font-bold text-[11px] uppercase text-[#10B981]">
                      2. Financeiro & Repasses
                    </strong>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={formPermissions.finance.view}
                        onChange={() => togglePermission('finance', 'view')}
                        className="accent-[#10B981]"
                      />
                      <span>Visualizar Saldos e Extrato</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={formPermissions.finance.requestPayout}
                        onChange={() => togglePermission('finance', 'requestPayout')}
                        className="accent-[#10B981]"
                      />
                      <span>Solicitar Repasse de Saldo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={formPermissions.finance.anticipate}
                        onChange={() => togglePermission('finance', 'anticipate')}
                        className="accent-[#10B981]"
                      />
                      <span>Antecipar Recebíveis</span>
                    </label>
                  </div>

                  {/* Participantes */}
                  <div className="space-y-1.5 p-2 bg-white rounded border border-[#E2E8F0]">
                    <strong className="block text-[#0E1726] font-bold text-[11px] uppercase text-[#7C3AED]">
                      3. Participantes & Check-in
                    </strong>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={formPermissions.participants.view}
                        onChange={() => togglePermission('participants', 'view')}
                        className="accent-[#7C3AED]"
                      />
                      <span>Ver Compradores</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={formPermissions.participants.checkin}
                        onChange={() => togglePermission('participants', 'checkin')}
                        className="accent-[#7C3AED]"
                      />
                      <span>Realizar Check-in / Portaria</span>
                    </label>
                  </div>

                  {/* POS & Terminais */}
                  <div className="space-y-1.5 p-2 bg-white rounded border border-[#E2E8F0]">
                    <strong className="block text-[#0E1726] font-bold text-[11px] uppercase text-[#EA580C]">
                      4. Terminais POS & PDV
                    </strong>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={formPermissions.pos.operate}
                        onChange={() => togglePermission('pos', 'operate')}
                        className="accent-[#EA580C]"
                      />
                      <span>Operar Venda Presencial</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={formPermissions.pos.closeCashier}
                        onChange={() => togglePermission('pos', 'closeCashier')}
                        className="accent-[#EA580C]"
                      />
                      <span>Confirmar Fechamento de Caixa</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EDF0F4]">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  {editingUserId ? 'Salvar Alterações' : 'Criar Usuário'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
