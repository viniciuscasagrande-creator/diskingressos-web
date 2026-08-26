import React, { useState, useMemo } from 'react';
import { 
  Search, ArrowRight, WalletCards, Banknote, Zap, 
  ReceiptText, CreditCard, RotateCcw, Cpu, CheckCircle2, 
  TrendingUp, Split, BrainCircuit, Landmark, Calculator, 
  Smartphone, Gift, FileSpreadsheet, FileCheck, Building2, 
  Handshake, Sparkles, Filter, ChevronRight, Sliders
} from 'lucide-react';
import type { FinanceModuleKey, FinanceSectionCategory } from '../../types/financeHub';
import { financeModulesList } from '../../data/financeModules';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface FinanceHubHomeProps {
  onSelectModule: (key: FinanceModuleKey) => void;
}

export const FinanceHubHome: React.FC<FinanceHubHomeProps> = ({ onSelectModule }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('todos');

  // Filter modules
  const filteredModules = useMemo(() => {
    return financeModulesList.filter((m) => {
      const matchCategory = activeCategory === 'todos' || m.category === activeCategory;
      const matchSearch = `${m.title} ${m.subtitle} ${m.description} ${m.tags.join(' ')}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [searchQuery, activeCategory]);

  const operacoesCaixa = filteredModules.filter((m) => m.category === 'operacoes-caixa');
  const advancedInteligencia = filteredModules.filter((m) => m.category === 'advanced-inteligencia');
  const simuladoresLiquidacoes = filteredModules.filter((m) => m.category === 'simuladores-liquidacoes');

  // Helper icon mapper
  const getModuleIcon = (key: FinanceModuleKey, accent: 'blue' | 'orange' | 'green') => {
    switch (key) {
      case 'saldo-consolidado': return <WalletCards size={22} />;
      case 'solicitar-repasse': return <Banknote size={22} />;
      case 'antecipacoes': return <Zap size={22} />;
      case 'extrato-geral': return <ReceiptText size={22} />;
      case 'pontos-venda': return <CreditCard size={22} />;
      case 'devolucoes-estornos': return <RotateCcw size={22} />;
      case 'financeiro-advanced': return <Cpu size={22} />;
      case 'conciliacao-bancaria': return <CheckCircle2 size={22} />;
      case 'financeiro-spread': return <TrendingUp size={22} />;
      case 'split-financeiro': return <Split size={22} />;
      case 'inteligencia-financeira': return <BrainCircuit size={22} />;
      case 'operadoras-cartao': return <Landmark size={22} />;
      case 'simulador-spread': return <Calculator size={22} />;
      case 'metodos-pagamento': return <Smartphone size={22} />;
      case 'pagamentos-customizados': return <Gift size={22} />;
      case 'despesas': return <FileSpreadsheet size={22} />;
      case 'bordero-assinaturas': return <FileCheck size={22} />;
      case 'contas-bancarias': return <Building2 size={22} />;
      case 'negociacoes': return <Handshake size={22} />;
      default: return <Sparkles size={22} />;
    }
  };

  return (
    <div className="w-full space-y-7 pb-12">
      {/* Top Page Header */}
      <PageHeader
        eyebrow="ECOSSISTEMA FINANCEIRO DISKINGRESSOS"
        title="Hub Financeiro"
        subtitle="Central executiva e operacional de gestão de caixa, conciliação, inteligência preditiva e liquidações."
      />

      {/* Global Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 bg-white p-3.5 rounded-card border border-[#E2E8F0] shadow-xs">
        {/* Search Field */}
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar módulo financeiro, operação ou taxa..."
            className="w-full h-[40px] pl-10 pr-4 rounded-input border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0E1726] placeholder-[#718096] outline-none transition focus:border-[#1677FF] focus:bg-white"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'todos', label: 'Todos os Módulos', count: financeModulesList.length },
            { id: 'operacoes-caixa', label: 'Operações de Caixa', count: 6 },
            { id: 'advanced-inteligencia', label: 'Advanced & Inteligência', count: 6 },
            { id: 'simuladores-liquidacoes', label: 'Simuladores & Liquidações', count: 7 },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-btn px-3 py-2 text-xs font-bold transition whitespace-nowrap select-none ${
                activeCategory === cat.id
                  ? 'bg-[#1677FF] text-white shadow-xs'
                  : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:bg-white hover:text-[#0E1726]'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: OPERAÇÕES DE CAIXA (AZUL #1677FF) */}
      {(activeCategory === 'todos' || activeCategory === 'operacoes-caixa') && operacoesCaixa.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-[#1677FF]" />
              <h2 className="text-[16px] font-bold uppercase tracking-wider text-[#0E1726]">
                Operações de Caixa
              </h2>
            </div>
            <span className="text-xs font-bold text-[#1677FF] bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
              {operacoesCaixa.length} módulos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {operacoesCaixa.map((mod) => (
              <div
                key={mod.key}
                onClick={() => onSelectModule(mod.key)}
                className="group relative flex flex-col justify-between rounded-card border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#1677FF] hover:shadow-card cursor-pointer"
              >
                <div>
                  {/* Card Header: Icon + Badge */}
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-btn bg-[#EFF6FF] text-[#1677FF] transition group-hover:scale-105">
                      {getModuleIcon(mod.key, 'blue')}
                    </div>
                    {mod.badge && (
                      <span className="rounded-full bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-0.5 text-[11px] font-bold text-[#1677FF]">
                        {mod.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-[17px] font-bold text-[#0E1726] group-hover:text-[#1677FF] transition-colors">
                    {mod.title}
                  </h3>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block mt-0.5">
                    {mod.subtitle}
                  </span>

                  {/* Description */}
                  <p className="text-[12px] text-[#718096] mt-2.5 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                {/* Footer Metric + Action Link */}
                <div className="mt-5 pt-3.5 border-t border-[#EDF0F4] flex items-center justify-between">
                  {mod.metrics ? (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                        {mod.metrics.label}
                      </span>
                      <strong className="text-[13px] font-bold text-[#0E1726]">
                        {mod.metrics.value}
                      </strong>
                    </div>
                  ) : <div />}

                  <span className="flex items-center gap-1 text-xs font-bold text-[#1677FF] group-hover:underline">
                    Acessar Módulo <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: ADVANCED & INTELIGÊNCIA (LARANJA #F97316) */}
      {(activeCategory === 'todos' || activeCategory === 'advanced-inteligencia') && advancedInteligencia.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-[#F97316]" />
              <h2 className="text-[16px] font-bold uppercase tracking-wider text-[#0E1726]">
                Advanced & Inteligência
              </h2>
            </div>
            <span className="text-xs font-bold text-[#F97316] bg-orange-50 border border-orange-200 rounded-full px-2.5 py-0.5">
              {advancedInteligencia.length} módulos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {advancedInteligencia.map((mod) => (
              <div
                key={mod.key}
                onClick={() => onSelectModule(mod.key)}
                className="group relative flex flex-col justify-between rounded-card border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#F97316] hover:shadow-card cursor-pointer"
              >
                <div>
                  {/* Card Header: Icon + Badge */}
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-btn bg-[#FFF7ED] text-[#F97316] transition group-hover:scale-105">
                      {getModuleIcon(mod.key, 'orange')}
                    </div>
                    {mod.badge && (
                      <span className="rounded-full bg-[#FFF7ED] border border-[#FED7AA] px-2.5 py-0.5 text-[11px] font-bold text-[#EA580C]">
                        {mod.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-[17px] font-bold text-[#0E1726] group-hover:text-[#F97316] transition-colors">
                    {mod.title}
                  </h3>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block mt-0.5">
                    {mod.subtitle}
                  </span>

                  {/* Description */}
                  <p className="text-[12px] text-[#718096] mt-2.5 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                {/* Footer Metric + Action Link */}
                <div className="mt-5 pt-3.5 border-t border-[#EDF0F4] flex items-center justify-between">
                  {mod.metrics ? (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                        {mod.metrics.label}
                      </span>
                      <strong className="text-[13px] font-bold text-[#0E1726]">
                        {mod.metrics.value}
                      </strong>
                    </div>
                  ) : <div />}

                  <span className="flex items-center gap-1 text-xs font-bold text-[#F97316] group-hover:underline">
                    Acessar Módulo <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: SIMULADORES, MÉTODOS & LIQUIDAÇÕES (VERDE #10B981) */}
      {(activeCategory === 'todos' || activeCategory === 'simuladores-liquidacoes') && simuladoresLiquidacoes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-[#10B981]" />
              <h2 className="text-[16px] font-bold uppercase tracking-wider text-[#0E1726]">
                Simuladores, Métodos & Liquidações
              </h2>
            </div>
            <span className="text-xs font-bold text-[#10B981] bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
              {simuladoresLiquidacoes.length} módulos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {simuladoresLiquidacoes.map((mod) => (
              <div
                key={mod.key}
                onClick={() => onSelectModule(mod.key)}
                className="group relative flex flex-col justify-between rounded-card border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#10B981] hover:shadow-card cursor-pointer"
              >
                <div>
                  {/* Card Header: Icon + Badge */}
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-btn bg-[#ECFDF5] text-[#10B981] transition group-hover:scale-105">
                      {getModuleIcon(mod.key, 'green')}
                    </div>
                    {mod.badge && (
                      <span className="rounded-full bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-0.5 text-[11px] font-bold text-[#047857]">
                        {mod.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-[17px] font-bold text-[#0E1726] group-hover:text-[#10B981] transition-colors">
                    {mod.title}
                  </h3>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block mt-0.5">
                    {mod.subtitle}
                  </span>

                  {/* Description */}
                  <p className="text-[12px] text-[#718096] mt-2.5 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                {/* Footer Metric + Action Link */}
                <div className="mt-5 pt-3.5 border-t border-[#EDF0F4] flex items-center justify-between">
                  {mod.metrics ? (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                        {mod.metrics.label}
                      </span>
                      <strong className="text-[13px] font-bold text-[#0E1726]">
                        {mod.metrics.value}
                      </strong>
                    </div>
                  ) : <div />}

                  <span className="flex items-center gap-1 text-xs font-bold text-[#10B981] group-hover:underline">
                    Acessar Módulo <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
