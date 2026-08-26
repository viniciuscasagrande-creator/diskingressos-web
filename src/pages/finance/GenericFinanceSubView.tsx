import React from 'react';
import { ArrowLeft, Download, Filter, CheckCircle2, Shield, TrendingUp, AlertCircle, FileText } from 'lucide-react';
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

export const GenericFinanceSubView: React.FC<GenericFinanceSubViewProps> = ({
  moduleKey,
  onBack,
  notify,
}) => {
  const meta = financeModulesList.find((m) => m.key === moduleKey) || financeModulesList[0];

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
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
              onClick={() => {
                if (notify) notify(`Relatório de ${meta.title} exportado com sucesso.`);
                else alert(`Exportando dados de ${meta.title}...`);
              }}
              icon={<Download size={15} />}
            >
              Exportar Relatório
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (notify) notify(`Ação processada com sucesso no módulo ${meta.title}.`);
                else alert(`Operação registrada no módulo ${meta.title}.`);
              }}
            >
              Executar Ação
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
          value="Hoje, 16:45"
          note="sincronização contínua"
          accent="green"
          icon={<Shield size={20} />}
        />
        <KpiCard
          label="CONFORMIDADE FISCAL"
          value="Em Dia"
          note="auditoria DiskIngressos"
          accent="purple"
          icon={<FileText size={20} />}
        />
      </div>

      {/* Main Details Panel */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#EDF0F4] pb-3">
          <div>
            <h2 className="text-[17px] font-bold text-[#0E1726]">{meta.title} — Visão Operacional</h2>
            <p className="text-[12px] text-[#718096]">{meta.subtitle}</p>
          </div>
          {meta.badge && (
            <Badge status="ativo">{meta.badge}</Badge>
          )}
        </div>

        <div className="rounded-btn bg-[#F8FAFC] border border-[#CBD5E1] p-4 text-xs text-[#718096] space-y-2">
          <p className="font-semibold text-slate-800">
            {meta.description}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {meta.tags.map((tag) => (
              <span key={tag} className="rounded bg-white border border-[#CBD5E1] px-2 py-0.5 text-[11px] font-bold text-slate-700">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Mock Data Table for this module */}
        <DataTable
          headers={['Identificador', 'Descrição do Lançamento', 'Referência', 'Data', <div key="st" className="text-center">Status</div>, <div key="val" className="text-right pr-2">Valor</div>]}
        >
          <tr className="hover:bg-slate-50 transition-colors">
            <td className="py-3 px-4 font-mono font-bold text-xs text-[#1677FF]">#LAN-89102</td>
            <td className="py-3 px-4 font-bold text-slate-900 text-xs">Registro de Operação Automatizada</td>
            <td className="py-3 px-4 text-xs text-slate-600">Festival Curitiba 2026</td>
            <td className="py-3 px-4 text-xs text-slate-500">26/08/2026 15:30</td>
            <td className="py-3 px-4 text-center"><Badge status="pago">Liquidado</Badge></td>
            <td className="py-3 px-4 text-right font-bold text-xs text-[#10B981]">+ R$ 14.500,00</td>
          </tr>
          <tr className="hover:bg-slate-50 transition-colors">
            <td className="py-3 px-4 font-mono font-bold text-xs text-[#1677FF]">#LAN-89088</td>
            <td className="py-3 px-4 font-bold text-slate-900 text-xs">Taxa de Liquidação e Processamento</td>
            <td className="py-3 px-4 text-xs text-slate-600">Sem Parar - Experiência Música</td>
            <td className="py-3 px-4 text-xs text-slate-500">25/08/2026 19:10</td>
            <td className="py-3 px-4 text-center"><Badge status="pago">Processado</Badge></td>
            <td className="py-3 px-4 text-right font-bold text-xs text-[#EF4444]">- R$ 380,00</td>
          </tr>
        </DataTable>
      </Card>
    </div>
  );
};
