import React, { useState } from 'react';
import { Shield, Search, Filter, Download, Activity, Clock, Terminal, UserCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('todos');

  const filteredLogs = auditLogs.filter((log) => {
    const matchModule = moduleFilter === 'todos' || log.module === moduleFilter;
    const matchSearch = `${log.action} ${log.userName} ${log.producerName} ${log.details} ${log.ipAddress}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchModule && matchSearch;
  });

  const headers = [
    'Data / Horário',
    'Usuário & Perfil',
    'Produtora (Tenant)',
    'Ação Realizada',
    'Detalhes da Operação',
    'IP Registrado',
    <div key="st" className="text-center">Status</div>
  ];

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="GOVERNANÇA & SEGURANÇA"
        title="Logs de Auditoria do Sistema"
        subtitle="Rastreamento em tempo real de todas as operações sensíveis, repasses financeiros, fechamentos e acessos."
        actions={
          <Button
            variant="secondary"
            onClick={() => alert('Download do log de auditoria oficial em formato JSON/CSV.')}
            icon={<Download size={15} />}
          >
            Exportar Auditoria
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
            placeholder="Buscar por ação, usuário, valor, IP ou produtora..."
            className="w-full h-[40px] pl-10 pr-4 rounded-input border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0E1726] placeholder-[#718096] outline-none transition focus:border-[#1677FF] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
          >
            <option value="todos">Todos os Módulos ({auditLogs.length})</option>
            <option value="Financeiro">Financeiro</option>
            <option value="Eventos">Eventos</option>
            <option value="POS">POS / Bilheteria</option>
            <option value="Segurança">Segurança & Auth</option>
            <option value="Administração">Administração</option>
          </Select>
        </div>
      </div>

      {/* DataTable */}
      <DataTable headers={headers} empty={filteredLogs.length === 0} emptyMessage="Nenhum registro de auditoria encontrado.">
        {filteredLogs.map((log) => (
          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
            <td className="py-3 px-4 font-mono text-xs text-[#64748B] whitespace-nowrap">
              {log.timestamp}
            </td>

            <td className="py-3 px-4">
              <strong className="block text-[#0E1726] font-bold text-xs">{log.userName}</strong>
              <span className="text-[11px] text-[#1677FF] font-semibold">{log.userRole}</span>
            </td>

            <td className="py-3 px-4 text-xs font-medium text-slate-700">
              {log.producerName}
            </td>

            <td className="py-3 px-4 font-bold text-xs text-slate-900">
              <span className="inline-flex items-center gap-1">
                {log.action}
              </span>
            </td>

            <td className="py-3 px-4 text-xs text-[#64748B] max-w-[280px] truncate" title={log.details}>
              {log.details}
            </td>

            <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
              {log.ipAddress}
            </td>

            <td className="py-3 px-4 text-center">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                log.status === 'Concluído'
                  ? 'bg-emerald-50 text-[#15803D] border border-emerald-200'
                  : 'bg-rose-50 text-[#991B1B] border border-rose-200'
              }`}>
                ● {log.status}
              </span>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
};
