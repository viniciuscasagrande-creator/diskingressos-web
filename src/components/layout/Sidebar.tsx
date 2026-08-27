import React, { useState } from 'react';
import { 
  LayoutDashboard, Building, ScanFace, Calendar, 
  Layers3, Users, DollarSign, CreditCard, 
  Headphones, Megaphone, Repeat2, Settings, 
  ChevronDown, ChevronRight, PanelLeftClose, PanelLeft,
  MonitorSmartphone, ShoppingCart, LockKeyhole,
  WalletCards, Banknote, Zap, ReceiptText, FileSpreadsheet,
  Building2, FileCheck, Handshake, Cpu, Split,
  BrainCircuit, CheckCircle2, TrendingUp, LayoutGrid,
  ArrowLeft, ChevronLeft, UserPlus, ShieldAlert, FileText,
  ShieldCheck, ScrollText, KeyRound, Activity,
  MessageCircle, Mail, Link, Tag, Sliders, Users2, Sparkles,
  Plus, Target, Clock3, UserX, PartyPopper
} from 'lucide-react';
import type { NavigationPage } from '../../types/producer';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onOpenNewEvent: () => void;
  onBackToHome?: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onOpenNewEvent,
  onBackToHome,
  collapsed,
  onToggleCollapse,
}) => {
  const { currentUser, can } = useAuth();

  // Expandable submenus state — ALL CLOSED BY DEFAULT as requested
  const [eventosOpen, setEventosOpen] = useState(false);
  const [financeiroOpen, setFinanceiroOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);
  const [marketingOpen, setMarketingOpen] = useState(false);
  const [remarketingOpen, setRemarketingOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const isEventosActive = [
    'eventos', 'nucleo-operacional', 'novo-evento', 'editar-evento', 'lotes', 
    'participantes', 'dashboard-evento', 'categorias-setores', 
    'cortesias'
  ].includes(currentPage);

  const isFinanceiroActive = [
    'financeiro', 'fin-hub', 'fin-saldo', 'fin-repasses', 
    'fin-antecipacoes', 'fin-extrato', 'fin-despesas', 
    'fin-contas', 'fin-bordero', 'fin-negociacoes', 
    'fin-advanced', 'fin-split', 'fin-inteligencia', 
    'fin-conciliacao', 'fin-spread', 'saldo', 'vendas', 
    'recebimentos', 'repasses', 'conciliacao', 'fluxo-caixa', 'extrato'
  ].includes(currentPage);

  const isPOSActive = [
    'terminais-pos', 'pos-terminals', 'pos-sales', 'pos-closing'
  ].includes(currentPage);

  const isMarketingActive = [
    'marketing', 'mkt-hub', 'mkt-dashboard', 'mkt-campaigns', 'mkt-new-campaign', 
    'mkt-automations', 'mkt-whatsapp', 'mkt-email', 'mkt-coupons', 
    'mkt-links', 'mkt-affiliates', 'mkt-analytics', 'mkt-reports', 'campanhas', 
    'pixel-meta', 'google-analytics', 'cupons'
  ].includes(currentPage);

  const isRemarketingActive = [
    'remarketing', 'rmk-hub', 'rmk-dashboard', 'rmk-carts', 'rmk-audiences', 
    'rmk-segments', 'rmk-flows', 'rmk-whatsapp', 'rmk-email', 'rmk-payments', 
    'rmk-inactive', 'rmk-postevent', 'rmk-automation', 'rmk-reports', 'mkt-abandoned'
  ].includes(currentPage);

  const isAdminActive = [
    'administracao', 'admin-hub', 'gerenciar-usuarios', 'admin-users', 
    'admin-producers', 'admin-permissions', 'logs-auditoria', 'admin-audit', 
    'admin-security', 'gerenciar-acessos'
  ].includes(currentPage);

  return (
    <aside className={`relative flex flex-col border-r border-white/[0.08] bg-[#222A36] text-[#CAD3DF] transition-all duration-300 select-none z-20 shrink-0 ${
      collapsed ? 'w-[72px]' : 'w-[264px]'
    } min-h-[calc(100vh-74px)]`}>
      {/* Top Back / Contextual Action */}
      {!collapsed && (
        <button
          onClick={onBackToHome || (() => onNavigate('eventos'))}
          className="w-full h-[54px] px-5 border-b border-white/[0.06] bg-[#222A36] text-white flex items-center justify-between font-bold text-[14px] hover:bg-[#2A3442] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ArrowLeft size={17} className="text-slate-300" />
            <span>Voltar ao Início</span>
          </div>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#38424F] text-slate-300">
            <ChevronLeft size={14} />
          </div>
        </button>
      )}

      {/* Sidebar Header / Toggle Collapse */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
        {!collapsed && (
          <span className="text-[10px] font-bold tracking-widest text-[#8F9BAD] uppercase">
            Menu Operacional
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className={`flex h-7 w-7 items-center justify-center rounded-btn text-slate-400 hover:bg-[#2D3746] hover:text-white transition ${
            collapsed ? 'mx-auto' : ''
          }`}
          title={collapsed ? 'Expandir Menu' : 'Recolher Menu'}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Navigation Links Scroll Container */}
      <div className="flex-1 overflow-y-auto py-2.5 px-2 space-y-1 sidebar-scroll">
        {/* 1. Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2 text-[13px] font-semibold transition-all ${
            currentPage === 'dashboard'
              ? 'bg-[#3B4553] text-white shadow-xs'
              : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
          }`}
          title="Dashboard Geral"
        >
          <LayoutDashboard size={18} className={currentPage === 'dashboard' ? 'text-[#1677FF]' : 'text-slate-400 group-hover:text-white'} />
          {!collapsed && <span className="truncate">Dashboard</span>}
        </button>

        {/* 2. Dados da Produtora */}
        <button
          onClick={() => onNavigate('produtora')}
          className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2 text-[13px] font-semibold transition-all ${
            currentPage === 'produtora'
              ? 'bg-[#3B4553] text-white shadow-xs'
              : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
          }`}
          title="Dados da Produtora"
        >
          <Building size={18} className={currentPage === 'produtora' ? 'text-[#1677FF]' : 'text-slate-400 group-hover:text-white'} />
          {!collapsed && <span className="truncate">Dados da Produtora</span>}
        </button>


        {/* 4. Eventos (Expandable Group) */}
        {can('events', 'view') && (
          <div>
            <button
              onClick={() => {
                if (collapsed) onToggleCollapse();
                setEventosOpen(!eventosOpen);
              }}
              className={`group flex w-full items-center justify-between rounded-btn px-3 py-2 text-[13px] font-semibold transition-all ${
                isEventosActive && !collapsed
                  ? 'bg-[#2D3746] text-white'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
              title="Gestão de Eventos"
            >
              <div className="flex items-center gap-3">
                <Calendar size={18} className={isEventosActive ? 'text-[#1677FF]' : 'text-slate-400 group-hover:text-white'} />
                {!collapsed && <span>Eventos</span>}
              </div>
              {!collapsed && (
                <span className="text-slate-400">
                  {eventosOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              )}
            </button>

            {/* Eventos Submenu */}
            {!collapsed && eventosOpen && (
              <div className="ml-3 pl-3 border-l border-slate-700/60 my-1 space-y-0.5">
                <button
                  onClick={() => onNavigate('eventos')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'eventos' || currentPage === 'dashboard-evento'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${currentPage === 'eventos' || currentPage === 'dashboard-evento' ? 'bg-[#06B6D4]' : 'bg-slate-500'}`} />
                  <span>Todos os Eventos</span>
                </button>

                {/* Núcleo Operacional (Fase 10) */}
                <button
                  onClick={() => onNavigate('nucleo-operacional')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'nucleo-operacional'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <Activity size={13} className="text-[#10B981]" />
                  <span>Núcleo Operacional</span>
                </button>

                {can('events', 'create') && (
                  <button
                    onClick={() => onNavigate('novo-evento')}
                    className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                      currentPage === 'novo-evento'
                        ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                        : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${currentPage === 'novo-evento' ? 'bg-[#06B6D4]' : 'bg-slate-500'}`} />
                    <span>Novo Evento</span>
                  </button>
                )}

                {can('events', 'edit') && (
                  <button
                    onClick={() => onNavigate('lotes')}
                    className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                      currentPage === 'lotes'
                        ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                        : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${currentPage === 'lotes' ? 'bg-[#06B6D4]' : 'bg-slate-500'}`} />
                    <span>Configurar Lotes</span>
                  </button>
                )}

                {can('participants', 'view') && (
                  <button
                    onClick={() => onNavigate('participantes')}
                    className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                      currentPage === 'participantes'
                        ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                        : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${currentPage === 'participantes' ? 'bg-[#06B6D4]' : 'bg-slate-500'}`} />
                    <span>Participantes & Check-in</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 5. Financeiro (Hub & Módulos Expandíveis) */}
        {can('finance', 'view') && (
          <div>
            <button
              onClick={() => {
                if (collapsed) onToggleCollapse();
                setFinanceiroOpen(!financeiroOpen);
              }}
              className={`group flex w-full items-center justify-between rounded-btn px-3 py-2 text-[13px] font-semibold transition-all ${
                isFinanceiroActive && !collapsed
                  ? 'bg-[#2D3746] text-white'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
              title="Hub Financeiro"
            >
              <div className="flex items-center gap-3">
                <DollarSign size={18} className={isFinanceiroActive ? 'text-[#10B981]' : 'text-slate-400 group-hover:text-white'} />
                {!collapsed && <span>Financeiro</span>}
              </div>
              {!collapsed && (
                <span className="text-slate-400">
                  {financeiroOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              )}
            </button>

            {/* Financeiro Submenu */}
            {!collapsed && financeiroOpen && (
              <div className="ml-3 pl-3 border-l border-slate-700/60 my-1 space-y-0.5">
                <button
                  onClick={() => onNavigate('fin-hub')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'financeiro' || currentPage === 'fin-hub'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid size={13} className="text-[#06B6D4]" />
                  <span>Hub Financeiro</span>
                </button>

                <button
                  onClick={() => onNavigate('fin-saldo')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'fin-saldo' || currentPage === 'saldo'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Saldo Consolidado</span>
                </button>

                {can('finance', 'requestPayout') && (
                  <button
                    onClick={() => onNavigate('fin-repasses')}
                    className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                      currentPage === 'fin-repasses' || currentPage === 'repasses'
                        ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                        : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    <span>Solicitações de Repasse</span>
                  </button>
                )}

                {can('finance', 'anticipate') && (
                  <button
                    onClick={() => onNavigate('fin-antecipacoes')}
                    className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                      currentPage === 'fin-antecipacoes'
                        ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                        : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    <span>Antecipações</span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate('fin-extrato')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'fin-extrato' || currentPage === 'extrato'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Extrato Detalhado</span>
                </button>

                {can('finance', 'viewBankAccounts') && (
                  <button
                    onClick={() => onNavigate('fin-contas')}
                    className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                      currentPage === 'fin-contas'
                        ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                        : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    <span>Contas Bancárias</span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate('fin-bordero')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'fin-bordero'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Borderô / Assinaturas</span>
                </button>

                {/* Header Seção: OPERAÇÕES AVANÇADAS */}
                <div className="pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-orange-400/90 pl-1">
                  Operações Avançadas
                </div>

                <button
                  onClick={() => onNavigate('fin-advanced')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'fin-advanced'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  <span>Financeiro Advanced</span>
                </button>

                {can('finance', 'manageSplit') && (
                  <button
                    onClick={() => onNavigate('fin-split')}
                    className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                      currentPage === 'fin-split'
                        ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                        : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                    <span>Split Financeiro</span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate('fin-inteligencia')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'fin-inteligencia'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  <span>Inteligência Financeira</span>
                </button>

                <button
                  onClick={() => onNavigate('fin-conciliacao')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'fin-conciliacao'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  <span>Conciliação Bancária</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 6. Terminais POS */}
        {can('pos', 'view') && (
          <div>
            <button
              onClick={() => {
                if (collapsed) onToggleCollapse();
                setPosOpen(!posOpen);
              }}
              className={`group flex w-full items-center justify-between rounded-btn px-3 py-2 text-[13px] font-semibold transition-all ${
                isPOSActive && !collapsed
                  ? 'bg-[#2D3746] text-white'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
              title="Terminais POS e PDV"
            >
              <div className="flex items-center gap-3">
                <CreditCard size={18} className={isPOSActive ? 'text-[#1677FF]' : 'text-slate-400 group-hover:text-white'} />
                {!collapsed && <span>Terminais POS</span>}
              </div>
              {!collapsed && (
                <span className="text-slate-400">
                  {posOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              )}
            </button>

            {/* POS Submenu */}
            {!collapsed && posOpen && (
              <div className="ml-3 pl-3 border-l border-slate-700/60 my-1 space-y-0.5">
                <button
                  onClick={() => onNavigate('terminais-pos')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'terminais-pos'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#06B6D4]" />
                  <span>Visão Geral</span>
                </button>

                <button
                  onClick={() => onNavigate('pos-terminals')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'pos-terminals'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Terminais</span>
                </button>

                {can('pos', 'operate') && (
                  <button
                    onClick={() => onNavigate('pos-sales')}
                    className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                      currentPage === 'pos-sales'
                        ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Vendas Presenciais</span>
                </button>
              )}

                {can('pos', 'closeCashier') && (
                  <button
                    onClick={() => onNavigate('pos-closing')}
                    className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                      currentPage === 'pos-closing'
                        ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    <span>Fechamento de Caixa</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 7. Marketing (Fase 11 Completo) */}
        {can('marketing', 'view') && (
          <div>
            <button
              onClick={() => {
                if (collapsed) onToggleCollapse();
                setMarketingOpen(!marketingOpen);
              }}
              className={`group flex w-full items-center justify-between rounded-btn px-3 py-2 text-[13px] font-semibold transition-all ${
                isMarketingActive && !collapsed
                  ? 'bg-[#2D3746] text-white'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
              title="Marketing"
            >
              <div className="flex items-center gap-3">
                <Megaphone size={18} className={isMarketingActive ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-white'} />
                {!collapsed && <span>Marketing</span>}
              </div>
              {!collapsed && (
                <span className="text-slate-400">
                  {marketingOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              )}
            </button>

            {/* Marketing Submenu */}
            {!collapsed && marketingOpen && (
              <div className="ml-3 pl-3 border-l border-slate-700/60 my-1 space-y-0.5">
                <button
                  onClick={() => onNavigate('mkt-hub')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'marketing' || currentPage === 'mkt-hub'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
                  <span>Hub Marketing</span>
                </button>

                <button
                  onClick={() => onNavigate('mkt-dashboard')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'mkt-dashboard'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => onNavigate('mkt-campaigns')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'mkt-campaigns' || currentPage === 'campanhas'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Campanhas</span>
                </button>

                <button
                  onClick={() => onNavigate('mkt-new-campaign')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'mkt-new-campaign'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Criar Campanha</span>
                </button>

                <button
                  onClick={() => onNavigate('mkt-automations')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'mkt-automations'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Automações</span>
                </button>

                <button
                  onClick={() => onNavigate('mkt-whatsapp')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'mkt-whatsapp'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => onNavigate('mkt-email')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'mkt-email'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>E-mail Marketing</span>
                </button>

                <button
                  onClick={() => onNavigate('mkt-coupons')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'mkt-coupons' || currentPage === 'cupons'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Cupons e Promoções</span>
                </button>

                <button
                  onClick={() => onNavigate('mkt-links')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'mkt-links'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Links, UTMs e QR Codes</span>
                </button>

                <button
                  onClick={() => onNavigate('mkt-affiliates')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'mkt-affiliates'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Afiliados e Parceiros</span>
                </button>

                <button
                  onClick={() => onNavigate('mkt-analytics')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'mkt-analytics' || currentPage === 'pixel-meta' || currentPage === 'google-analytics'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Pixel & Analytics</span>
                </button>

                <button
                  onClick={() => onNavigate('mkt-reports')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'mkt-reports'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Relatórios</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 8. Remarketing (Fase 11 Completo) */}
        {can('marketing', 'view') && (
          <div>
            <button
              onClick={() => {
                if (collapsed) onToggleCollapse();
                setRemarketingOpen(!remarketingOpen);
              }}
              className={`group flex w-full items-center justify-between rounded-btn px-3 py-2 text-[13px] font-semibold transition-all ${
                isRemarketingActive && !collapsed
                  ? 'bg-[#2D3746] text-white'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
              title="Remarketing"
            >
              <div className="flex items-center gap-3">
                <Repeat2 size={18} className={isRemarketingActive ? 'text-rose-400' : 'text-slate-400 group-hover:text-white'} />
                {!collapsed && <span>Remarketing</span>}
              </div>
              {!collapsed && (
                <span className="text-slate-400">
                  {remarketingOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              )}
            </button>

            {/* Remarketing Submenu */}
            {!collapsed && remarketingOpen && (
              <div className="ml-3 pl-3 border-l border-slate-700/60 my-1 space-y-0.5">
                <button
                  onClick={() => onNavigate('rmk-hub')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'remarketing' || currentPage === 'rmk-hub'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <span>Hub Remarketing</span>
                </button>

                <button
                  onClick={() => onNavigate('rmk-dashboard')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'rmk-dashboard'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => onNavigate('rmk-carts')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'rmk-carts' || currentPage === 'mkt-abandoned'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Carrinhos Abandonados</span>
                </button>

                <button
                  onClick={() => onNavigate('rmk-audiences')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'rmk-audiences'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Públicos</span>
                </button>

                <button
                  onClick={() => onNavigate('rmk-segments')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'rmk-segments'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Segmentações</span>
                </button>

                <button
                  onClick={() => onNavigate('rmk-flows')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'rmk-flows'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Fluxos de Recuperação</span>
                </button>

                <button
                  onClick={() => onNavigate('rmk-whatsapp')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'rmk-whatsapp'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>WhatsApp Remarketing</span>
                </button>

                <button
                  onClick={() => onNavigate('rmk-email')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'rmk-email'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>E-mail Remarketing</span>
                </button>

                <button
                  onClick={() => onNavigate('rmk-payments')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'rmk-payments'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Recuperação de Pagamento</span>
                </button>

                <button
                  onClick={() => onNavigate('rmk-inactive')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'rmk-inactive'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Clientes Inativos</span>
                </button>

                <button
                  onClick={() => onNavigate('rmk-postevent')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'rmk-postevent'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Pós-Evento</span>
                </button>

                <button
                  onClick={() => onNavigate('rmk-automation')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'rmk-automation'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Remarketing Automático</span>
                </button>

                <button
                  onClick={() => onNavigate('rmk-reports')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'rmk-reports'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Relatórios</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 9. Atendimento / SAC */}
        <button
          onClick={() => onNavigate('atendimento')}
          className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2 text-[13px] font-semibold transition-all ${
            currentPage === 'atendimento'
              ? 'bg-[#3B4553] text-white shadow-xs'
              : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
          }`}
          title="Atendimento e SAC"
        >
          <Headphones size={18} className={currentPage === 'atendimento' ? 'text-[#1677FF]' : 'text-slate-400 group-hover:text-white'} />
          {!collapsed && <span className="truncate">Atendimento / SAC</span>}
        </button>

        {/* 10. Administração & Governança (Fase 8 Full Menu) */}
        <div>
          <button
            onClick={() => {
              if (collapsed) onToggleCollapse();
              setAdminOpen(!adminOpen);
            }}
            className={`group flex w-full items-center justify-between rounded-btn px-3 py-2 text-[13px] font-semibold transition-all ${
              isAdminActive && !collapsed
                ? 'bg-[#2D3746] text-white'
                : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
            }`}
            title="Administração e Governança"
          >
            <div className="flex items-center gap-3">
              <Settings size={18} className={isAdminActive ? 'text-[#1677FF]' : 'text-slate-400 group-hover:text-white'} />
              {!collapsed && <span>Administração</span>}
            </div>
            {!collapsed && (
              <span className="text-slate-400">
                {adminOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
          </button>

          {!collapsed && adminOpen && (
            <div className="ml-3 pl-3 border-l border-slate-700/60 my-1 space-y-0.5">
              {/* Central Administrativa */}
              <button
                onClick={() => onNavigate('admin-hub')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'administracao' || currentPage === 'admin-hub'
                    ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                }`}
              >
                <LayoutGrid size={13} className="text-[#06B6D4]" />
                <span>Central Administrativa</span>
              </button>

              {/* Usuários e Acessos */}
              {can('admin', 'manageUsers') && (
                <button
                  onClick={() => onNavigate('gerenciar-usuarios')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'gerenciar-usuarios' || currentPage === 'admin-users'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Usuários e Acessos</span>
                </button>
              )}

              {/* Produtoras */}
              <button
                onClick={() => onNavigate('admin-producers')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'admin-producers'
                    ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                <span>Produtoras</span>
              </button>

              {/* Perfis e Permissões */}
              <button
                onClick={() => onNavigate('admin-permissions')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'admin-permissions'
                    ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                <span>Perfis e Permissões</span>
              </button>

              {/* Logs de Auditoria */}
              {can('admin', 'viewAuditLogs') && (
                <button
                  onClick={() => onNavigate('logs-auditoria')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'logs-auditoria' || currentPage === 'admin-audit'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Logs de Auditoria</span>
                </button>
              )}

              {/* Segurança */}
              <button
                onClick={() => onNavigate('admin-security')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'admin-security'
                    ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                <span>Segurança</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info / Support */}
      {!collapsed && (
        <div className="p-3 border-t border-white/[0.06] bg-[#1E2530]">
          <div className="rounded-btn bg-[#27303E] p-3 text-center">
            <span className="text-[11px] font-bold text-slate-300 block">Suporte DiskIngressos</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Plantão de Eventos 24/7</span>
            <a
              href="tel:4133150808"
              className="mt-2 inline-block text-[11px] font-bold text-[#1677FF] hover:underline"
            >
              (41) 3315-0808
            </a>
          </div>
        </div>
      )}
    </aside>
  );
};
