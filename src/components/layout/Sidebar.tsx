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
import type { EventItem } from '../../types/event';
import { useAuth } from '../../context/AuthContext';
import { EventCoverVisual } from '../events/EventCoverVisual';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onOpenNewEvent: () => void;
  onBackToHome?: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  selectedEvent?: EventItem | null;
  onExitEventContext?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onOpenNewEvent,
  onBackToHome,
  collapsed,
  onToggleCollapse,
  selectedEvent,
  onExitEventContext,
}) => {
  const { currentUser, can } = useAuth();

  // Expandable submenus state — ALL CLOSED BY DEFAULT as requested
  const [eventosOpen, setEventosOpen] = useState(false);
  const [financeiroOpen, setFinanceiroOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);
  const [marketingOpen, setMarketingOpen] = useState(false);
  const [remarketingOpen, setRemarketingOpen] = useState(false);
  const [sacOpen, setSacOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  // 1. EVENT-SPECIFIC CONTEXTUAL SIDEBAR (FASE 15)
  if (selectedEvent) {
    return (
      <aside className={`relative flex flex-col border-r border-white/[0.08] bg-[#222A36] text-[#CAD3DF] transition-all duration-300 select-none z-20 shrink-0 ${
        collapsed ? 'w-[72px]' : 'w-[264px]'
      } min-h-[calc(100vh-74px)]`}>
        {/* Top Back Action to Global Events List */}
        <button
          onClick={onExitEventContext || (() => onNavigate('eventos'))}
          className="w-full h-[52px] px-4 border-b border-white/[0.06] bg-[#1E2530] text-white flex items-center justify-between font-bold text-[13px] hover:bg-[#2A3442] transition-colors"
          title="Voltar para Todos os Eventos (Painel Geral)"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft size={16} className="text-[#1677FF]" />
            {!collapsed && <span>← Voltar aos Eventos</span>}
          </div>
          {!collapsed && (
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-white/10 px-2 py-0.5 rounded">
              Geral
            </span>
          )}
        </button>

        {/* Selected Event Mini-Card / Header */}
        {!collapsed && (
          <div className="p-3 border-b border-white/[0.08] bg-[#1E2530]/80">
            <div className="flex items-center gap-3">
              {/* Square Event Image on Left */}
              <div className="h-14 w-14 min-w-[56px] min-h-[56px] aspect-square rounded-md overflow-hidden border border-white/20 bg-slate-900 shrink-0 shadow-sm relative">
                <EventCoverVisual event={selectedEvent} className="h-full w-full" />
              </div>

              {/* Event Info Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-black text-[#7DD3FC] font-mono tracking-tight bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/40">
                    #{selectedEvent.code}
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <h4 className="text-[12px] font-extrabold text-white truncate leading-tight" title={selectedEvent.title}>
                  {selectedEvent.title}
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-300 truncate mt-0.5" title={selectedEvent.venue}>
                  <span className="truncate">{selectedEvent.venue || 'Local não informado'}</span>
                </div>
                {selectedEvent.date && (
                  <span className="text-[9.5px] font-semibold text-slate-400 block truncate">
                    {selectedEvent.date}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Event-Specific Navigation Scroll */}
        <div className="flex-1 overflow-y-auto py-2.5 px-2 space-y-3 sidebar-scroll">
          {/* Section: EVENTO */}
          <div className="space-y-1">
            {!collapsed && (
              <span className="px-3 text-[10px] font-bold tracking-widest text-[#8F9BAD] uppercase block">
                Evento
              </span>
            )}
            
            {/* Dashboard Evento */}
            <button
              onClick={() => onNavigate('evento-dashboard')}
              className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2 text-[12px] font-semibold transition-all ${
                currentPage === 'evento-dashboard' || currentPage === 'dashboard-evento'
                  ? 'bg-[#173A52] text-[#7DD3FC] shadow-xs'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
            >
              <LayoutDashboard size={16} className={currentPage === 'evento-dashboard' || currentPage === 'dashboard-evento' ? 'text-[#7DD3FC]' : 'text-slate-400 group-hover:text-white'} />
              {!collapsed && <span>Dashboard</span>}
            </button>

            {/* Ingressos */}
            <button
              onClick={() => onNavigate('evento-ingressos')}
              className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2 text-[12px] font-semibold transition-all ${
                currentPage === 'evento-ingressos'
                  ? 'bg-[#173A52] text-[#7DD3FC] shadow-xs'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
            >
              <Users size={16} className={currentPage === 'evento-ingressos' ? 'text-[#7DD3FC]' : 'text-slate-400 group-hover:text-white'} />
              {!collapsed && <span>Consultar Ingressos</span>}
            </button>

            {/* Cortesias */}
            <button
              onClick={() => onNavigate('evento-cortesias')}
              className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2 text-[12px] font-semibold transition-all ${
                currentPage === 'evento-cortesias'
                  ? 'bg-[#173A52] text-[#7DD3FC] shadow-xs'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
            >
              <Tag size={16} className={currentPage === 'evento-cortesias' ? 'text-[#7DD3FC]' : 'text-slate-400 group-hover:text-white'} />
              {!collapsed && <span>Cortesias</span>}
            </button>

            {/* Relatórios */}
            <button
              onClick={() => onNavigate('evento-relatorios')}
              className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2 text-[12px] font-semibold transition-all ${
                currentPage === 'evento-relatorios'
                  ? 'bg-[#173A52] text-[#7DD3FC] shadow-xs'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
            >
              <FileText size={16} className={currentPage === 'evento-relatorios' ? 'text-[#7DD3FC]' : 'text-slate-400 group-hover:text-white'} />
              {!collapsed && <span>Relatórios de Vendas</span>}
            </button>

            {/* Detalhes / Edição */}
            <button
              onClick={() => onNavigate('evento-detalhes')}
              className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2 text-[12px] font-semibold transition-all ${
                currentPage === 'evento-detalhes' || currentPage === 'editar-evento'
                  ? 'bg-[#173A52] text-[#7DD3FC] shadow-xs'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
            >
              <Settings size={16} className={currentPage === 'evento-detalhes' || currentPage === 'editar-evento' ? 'text-[#7DD3FC]' : 'text-slate-400 group-hover:text-white'} />
              {!collapsed && <span>Detalhes do Evento</span>}
            </button>
          </div>

          {/* Section: MARKETING & CONFIGURAÇÕES */}
          <div className="space-y-1 pt-2 border-t border-white/[0.06]">
            {!collapsed && (
              <span className="px-3 text-[10px] font-bold tracking-widest text-[#8F9BAD] uppercase block">
                Marketing & Configurações
              </span>
            )}

            {/* Pixel GA */}
            <button
              onClick={() => onNavigate('evento-pixel')}
              className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2 text-[12px] font-semibold transition-all ${
                currentPage === 'evento-pixel'
                  ? 'bg-[#173A52] text-[#7DD3FC] shadow-xs'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
            >
              <Sliders size={16} className={currentPage === 'evento-pixel' ? 'text-[#7DD3FC]' : 'text-pink-400 group-hover:text-white'} />
              {!collapsed && <span>Pixel GA & Meta</span>}
            </button>

            {/* Links UTM */}
            <button
              onClick={() => onNavigate('evento-utm')}
              className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2 text-[12px] font-semibold transition-all ${
                currentPage === 'evento-utm'
                  ? 'bg-[#173A52] text-[#7DD3FC] shadow-xs'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
            >
              <Link size={16} className={currentPage === 'evento-utm' ? 'text-[#7DD3FC]' : 'text-amber-400 group-hover:text-white'} />
              {!collapsed && <span>Links UTM & Conversões</span>}
            </button>

            {/* Analytics GA4 */}
            <button
              onClick={() => onNavigate('evento-analytics')}
              className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2 text-[12px] font-semibold transition-all ${
                currentPage === 'evento-analytics'
                  ? 'bg-[#173A52] text-[#7DD3FC] shadow-xs'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
            >
              <TrendingUp size={16} className={currentPage === 'evento-analytics' ? 'text-[#7DD3FC]' : 'text-blue-400 group-hover:text-white'} />
              {!collapsed && <span>Analytics GA4</span>}
            </button>

            {/* Tráfego Site */}
            <button
              onClick={() => onNavigate('evento-trafego')}
              className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2 text-[12px] font-semibold transition-all ${
                currentPage === 'evento-trafego'
                  ? 'bg-[#173A52] text-[#7DD3FC] shadow-xs'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
            >
              <Activity size={16} className={currentPage === 'evento-trafego' ? 'text-[#7DD3FC]' : 'text-teal-400 group-hover:text-white'} />
              {!collapsed && <span>Tráfego Site</span>}
            </button>

            {/* Campanhas Meta Ads */}
            <button
              onClick={() => onNavigate('evento-meta-ads')}
              className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2 text-[12px] font-semibold transition-all ${
                currentPage === 'evento-meta-ads'
                  ? 'bg-[#173A52] text-[#7DD3FC] shadow-xs'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
            >
              <Megaphone size={16} className={currentPage === 'evento-meta-ads' ? 'text-[#7DD3FC]' : 'text-purple-400 group-hover:text-white'} />
              {!collapsed && <span>Campanhas Meta Ads</span>}
            </button>

            {/* Remarketing */}
            <button
              onClick={() => onNavigate('evento-remarketing')}
              className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2 text-[12px] font-semibold transition-all ${
                currentPage === 'evento-remarketing'
                  ? 'bg-[#173A52] text-[#7DD3FC] shadow-xs'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
            >
              <Repeat2 size={16} className={currentPage === 'evento-remarketing' ? 'text-[#7DD3FC]' : 'text-rose-400 group-hover:text-white'} />
              {!collapsed && <span>Remarketing do Evento</span>}
            </button>
          </div>

          {/* Section: OPERAÇÃO & ADMINISTRAÇÃO */}
          <div className="space-y-1 pt-2 border-t border-white/[0.06]">
            {!collapsed && (
              <span className="px-3 text-[10px] font-bold tracking-widest text-[#8F9BAD] uppercase block">
                Operação & Lotes
              </span>
            )}

            {/* Lotes & Setores */}
            <button
              onClick={() => onNavigate('evento-lotes')}
              className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2 text-[12px] font-semibold transition-all ${
                currentPage === 'evento-lotes' || currentPage === 'lotes'
                  ? 'bg-[#173A52] text-[#7DD3FC] shadow-xs'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
            >
              <Layers3 size={16} className={currentPage === 'evento-lotes' || currentPage === 'lotes' ? 'text-[#7DD3FC]' : 'text-slate-400 group-hover:text-white'} />
              {!collapsed && <span>Lotes & Setores</span>}
            </button>

            {/* Check-in */}
            <button
              onClick={() => onNavigate('evento-checkin')}
              className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2 text-[12px] font-semibold transition-all ${
                currentPage === 'evento-checkin'
                  ? 'bg-[#173A52] text-[#7DD3FC] shadow-xs'
                  : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
              }`}
            >
              <ScanFace size={16} className={currentPage === 'evento-checkin' ? 'text-[#7DD3FC]' : 'text-emerald-400 group-hover:text-white'} />
              {!collapsed && <span>Check-in ao Vivo</span>}
            </button>
          </div>
        </div>
      </aside>
    );
  }

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
    'fin-conciliacao', 'fin-spread', 'simulador-spread',
    'fin-methods', 'fin-custom', 'fin-operators', 'fin-gateways',
    'fin-refunds', 'fin-pdv', 'fin-reports',
    'saldo', 'vendas', 'recebimentos', 'repasses', 'conciliacao',
    'fluxo-caixa', 'extrato', 'finance', 'finance-dashboard',
    'finance-hub', 'finance-statement', 'finance-cashflow',
    'finance-receivables', 'finance-payables', 'finance-spread-simulator',
    'finance-payouts', 'finance-advance', 'finance-reconciliation',
    'finance-bank-accounts', 'finance-expenses', 'finance-bordero',
    'finance-spread', 'finance-split', 'finance-methods', 'finance-reports',
    'finance-intelligence', 'finance-custom', 'finance-operators',
    'finance-negotiations', 'finance-refunds', 'finance-gateways',
    'finance-advanced', 'finance-pdv'
  ].includes(currentPage);

  const isPOSActive = [
    'terminais-pos', 'pos-terminals', 'pos-sales', 'pos-closing'
  ].includes(currentPage);

  const isMarketingActive = [
    'marketing', 'mkt-hub', 'mkt-dashboard', 'mkt-campaigns', 'mkt-new-campaign', 
    'mkt-automations', 'mkt-whatsapp', 'mkt-email', 'mkt-coupons', 
    'mkt-links', 'mkt-affiliates', 'mkt-analytics', 'mkt-comm-integrations', 'mkt-reports', 'campanhas', 
    'pixel-meta', 'google-analytics', 'cupons'
  ].includes(currentPage);

  const isRemarketingActive = [
    'remarketing', 'rmk-hub', 'rmk-dashboard', 'rmk-carts', 'rmk-audiences', 
    'rmk-segments', 'rmk-flows', 'rmk-whatsapp', 'rmk-email', 'rmk-payments', 
    'rmk-inactive', 'rmk-postevent', 'rmk-automation', 'rmk-reports', 'mkt-abandoned'
  ].includes(currentPage);

  const isSacActive = [
    'atendimento', 'sac-hub', 'sac-dashboard', 'sac-tickets', 
    'sac-new', 'sac-sla', 'sac-integrations', 'sac-knowledge', 'sac-reports'
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
              <div className="ml-3 pl-3 border-l border-slate-700/60 my-1 space-y-0.5 max-h-[420px] overflow-y-auto sidebar-scroll pr-1">
                <button
                  onClick={() => onNavigate('fin-hub')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'financeiro' || currentPage === 'fin-hub'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid size={13} className="text-[#06B6D4]" />
                  <span>Dashboard Financeiro</span>
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

                <button
                  onClick={() => onNavigate('fin-pdv')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'fin-pdv' || (currentPage as string) === 'finance-pdv'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Pontos de Venda (PDV)</span>
                </button>

                <button
                  onClick={() => onNavigate('fin-refunds')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'fin-refunds' || (currentPage as string) === 'finance-refunds'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <span>Devoluções / Estornos</span>
                </button>

                <button
                  onClick={() => onNavigate('fin-despesas')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'fin-despesas'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Despesas</span>
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

                {/* Header Seção: OPERAÇÕES AVANÇADAS & GESTÃO */}
                <div className="pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-orange-400/90 pl-1">
                  Operações Avançadas & Gestão
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

                <button
                  onClick={() => onNavigate('fin-spread')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'fin-spread'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                  <span>Financeiro Spread</span>
                </button>

                <button
                  onClick={() => onNavigate('simulador-spread')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'simulador-spread' || (currentPage as string) === 'finance-spread-simulator'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Simulador de Spread</span>
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
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
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
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Inteligência Financeira</span>
                </button>

                <button
                  onClick={() => onNavigate('fin-operators')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'fin-operators' || (currentPage as string) === 'finance-operators'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>Operadoras & Gateways</span>
                </button>

                <button
                  onClick={() => onNavigate('fin-methods')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'fin-methods' || (currentPage as string) === 'finance-methods'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Métodos de Pagamento</span>
                </button>

                <button
                  onClick={() => onNavigate('fin-custom')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'fin-custom' || (currentPage as string) === 'finance-custom'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  <span>Pagamentos Customizados</span>
                </button>

                <button
                  onClick={() => onNavigate('fin-negociacoes')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'fin-negociacoes' || (currentPage as string) === 'finance-negotiations'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                  <span>Negociações Financeiras</span>
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
                  onClick={() => onNavigate('mkt-comm-integrations')}
                  className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                    currentPage === 'mkt-comm-integrations'
                      ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                      : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  <span>Integrações de Comunicação</span>
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

        {/* 9. Atendimento / SAC (Fase 14 ITIL & Service Desk) */}
        <div>
          <button
            onClick={() => {
              if (collapsed) onToggleCollapse();
              setSacOpen(!sacOpen);
            }}
            className={`group flex w-full items-center justify-between rounded-btn px-3 py-2 text-[13px] font-semibold transition-all ${
              isSacActive && !collapsed
                ? 'bg-[#2D3746] text-white'
                : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
            }`}
            title="Atendimento / SAC"
          >
            <div className="flex items-center gap-3">
              <Headphones size={18} className={isSacActive ? 'text-[#1677FF]' : 'text-slate-400 group-hover:text-white'} />
              {!collapsed && <span>Atendimento / SAC</span>}
            </div>
            {!collapsed && (
              <span className="text-slate-400">
                {sacOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
          </button>

          {/* SAC Submenu */}
          {!collapsed && sacOpen && (
            <div className="ml-3 pl-3 border-l border-slate-700/60 my-1 space-y-0.5">
              <button
                onClick={() => onNavigate('sac-hub')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'atendimento' || currentPage === 'sac-hub'
                    ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#1677FF]" />
                <span>Hub de Atendimento</span>
              </button>

              <button
                onClick={() => onNavigate('sac-dashboard')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'sac-dashboard'
                    ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                <span>Dashboard SAC</span>
              </button>

              <button
                onClick={() => onNavigate('sac-tickets')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'sac-tickets'
                    ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                <span>Chamados</span>
              </button>

              <button
                onClick={() => onNavigate('sac-new')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'sac-new'
                    ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                <span>Abrir Chamado</span>
              </button>

              <button
                onClick={() => onNavigate('sac-sla')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'sac-sla'
                    ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                <span>SLA & ITIL</span>
              </button>

              <button
                onClick={() => onNavigate('sac-integrations')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'sac-integrations'
                    ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                <span>Integrações</span>
              </button>

              <button
                onClick={() => onNavigate('sac-knowledge')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'sac-knowledge'
                    ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                <span>Base de Conhecimento</span>
              </button>

              <button
                onClick={() => onNavigate('sac-reports')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'sac-reports'
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
