import React, { useState } from 'react';
import { 
  LayoutDashboard, Building, ScanFace, Calendar, 
  PlusCircle, Layers3, Users, DollarSign, 
  CreditCard, Headphones, Megaphone, RotateCw, 
  Settings, ChevronDown, ChevronRight, PanelLeftClose,
  PanelLeft, ShieldAlert, Receipt, Landmark, TrendingUp, FileText
} from 'lucide-react';
import type { NavigationPage } from '../../types/producer';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onOpenNewEvent: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onOpenNewEvent,
  collapsed,
  onToggleCollapse,
}) => {
  // Expandable submenus state
  const [eventosOpen, setEventosOpen] = useState(true);
  const [financeiroOpen, setFinanceiroOpen] = useState(true);

  const isEventosActive = [
    'eventos', 'novo-evento', 'editar-evento', 'lotes', 
    'participantes', 'dashboard-evento', 'categorias-setores', 
    'cupons', 'cortesias'
  ].includes(currentPage);

  const isFinanceiroActive = [
    'financeiro', 'saldo', 'vendas', 'recebimentos', 
    'repasses', 'conciliacao', 'fluxo-caixa', 'extrato'
  ].includes(currentPage);

  return (
    <aside className={`relative flex flex-col border-r border-white/[0.08] bg-[#222A36] text-[#CAD3DF] transition-all duration-300 select-none z-20 shrink-0 ${
      collapsed ? 'w-[72px]' : 'w-[264px]'
    } min-h-[calc(100vh-74px)]`}>
      {/* Sidebar Header / Toggle Collapse */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
        {!collapsed && (
          <span className="text-[11px] font-bold tracking-widest text-[#8F9BAD] uppercase">
            Menu Operacional
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className={`flex h-8 w-8 items-center justify-center rounded-btn text-slate-400 hover:bg-[#2D3746] hover:text-white transition ${
            collapsed ? 'mx-auto' : ''
          }`}
          title={collapsed ? 'Expandir Menu' : 'Recolher Menu'}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Navigation Links Scroll Container */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 sidebar-scroll">
        {/* 1. Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-[13px] font-semibold transition-all ${
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
          className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-[13px] font-semibold transition-all ${
            currentPage === 'produtora'
              ? 'bg-[#3B4553] text-white shadow-xs'
              : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
          }`}
          title="Dados da Produtora"
        >
          <Building size={18} className={currentPage === 'produtora' ? 'text-[#1677FF]' : 'text-slate-400 group-hover:text-white'} />
          {!collapsed && <span className="truncate">Dados da Produtora</span>}
        </button>

        {/* 3. Status Faciais */}
        <button
          onClick={() => onNavigate('status-faciais')}
          className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-[13px] font-semibold transition-all ${
            currentPage === 'status-faciais'
              ? 'bg-[#3B4553] text-white shadow-xs'
              : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
          }`}
          title="Status Faciais"
        >
          <ScanFace size={18} className={currentPage === 'status-faciais' ? 'text-[#06B6D4]' : 'text-slate-400 group-hover:text-white'} />
          {!collapsed && <span className="truncate">Status Faciais</span>}
        </button>

        {/* 4. Eventos (Expandable Group) */}
        <div>
          <button
            onClick={() => {
              if (collapsed) onToggleCollapse();
              setEventosOpen(!eventosOpen);
            }}
            className={`group flex w-full items-center justify-between rounded-btn px-3 py-2.5 text-[13px] font-semibold transition-all ${
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
              {/* Todos os Eventos */}
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

              {/* Novo Evento */}
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

              {/* Configurar Lotes */}
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

              {/* Participantes */}
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
            </div>
          )}
        </div>

        {/* 5. Financeiro (Expandable Group) */}
        <div>
          <button
            onClick={() => {
              if (collapsed) onToggleCollapse();
              setFinanceiroOpen(!financeiroOpen);
            }}
            className={`group flex w-full items-center justify-between rounded-btn px-3 py-2.5 text-[13px] font-semibold transition-all ${
              isFinanceiroActive && !collapsed
                ? 'bg-[#2D3746] text-white'
                : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
            }`}
            title="Módulo Financeiro"
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
              {/* Visão Geral */}
              <button
                onClick={() => onNavigate('financeiro')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'financeiro' || currentPage === 'saldo'
                    ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${currentPage === 'financeiro' || currentPage === 'saldo' ? 'bg-[#06B6D4]' : 'bg-slate-500'}`} />
                <span>Visão Geral</span>
              </button>

              {/* Vendas */}
              <button
                onClick={() => onNavigate('vendas')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'vendas'
                    ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${currentPage === 'vendas' ? 'bg-[#06B6D4]' : 'bg-slate-500'}`} />
                <span>Vendas</span>
              </button>

              {/* Repasses */}
              <button
                onClick={() => onNavigate('repasses')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'repasses'
                    ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${currentPage === 'repasses' ? 'bg-[#06B6D4]' : 'bg-slate-500'}`} />
                <span>Repasses</span>
              </button>

              {/* Fluxo de Caixa */}
              <button
                onClick={() => onNavigate('fluxo-caixa')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'fluxo-caixa'
                    ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${currentPage === 'fluxo-caixa' ? 'bg-[#06B6D4]' : 'bg-slate-500'}`} />
                <span>Fluxo de Caixa</span>
              </button>

              {/* Extrato */}
              <button
                onClick={() => onNavigate('extrato')}
                className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-1.5 text-[12px] font-medium transition ${
                  currentPage === 'extrato'
                    ? 'bg-[#173A52] text-[#7DD3FC] font-bold'
                    : 'text-slate-400 hover:bg-[#283243] hover:text-slate-200'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${currentPage === 'extrato' ? 'bg-[#06B6D4]' : 'bg-slate-500'}`} />
                <span>Extrato</span>
              </button>
            </div>
          )}
        </div>

        {/* 6. Terminais POS */}
        <button
          onClick={() => onNavigate('terminais-pos')}
          className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-[13px] font-semibold transition-all ${
            currentPage === 'terminais-pos'
              ? 'bg-[#3B4553] text-white shadow-xs'
              : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
          }`}
          title="Terminais POS"
        >
          <CreditCard size={18} className={currentPage === 'terminais-pos' ? 'text-[#1677FF]' : 'text-slate-400 group-hover:text-white'} />
          {!collapsed && <span className="truncate">Terminais POS</span>}
        </button>

        {/* 7. Atendimento / SAC */}
        <button
          onClick={() => onNavigate('atendimento')}
          className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-[13px] font-semibold transition-all ${
            currentPage === 'atendimento'
              ? 'bg-[#3B4553] text-white shadow-xs'
              : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
          }`}
          title="Atendimento e SAC"
        >
          <Headphones size={18} className={currentPage === 'atendimento' ? 'text-[#1677FF]' : 'text-slate-400 group-hover:text-white'} />
          {!collapsed && <span className="truncate">Atendimento / SAC</span>}
        </button>

        {/* 8. Marketing */}
        <button
          onClick={() => onNavigate('marketing')}
          className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-[13px] font-semibold transition-all ${
            currentPage === 'marketing'
              ? 'bg-[#3B4553] text-white shadow-xs'
              : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
          }`}
          title="Marketing & Campanhas"
        >
          <Megaphone size={18} className={currentPage === 'marketing' ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-white'} />
          {!collapsed && <span className="truncate">Marketing</span>}
        </button>

        {/* 9. Remarketing */}
        <button
          onClick={() => onNavigate('remarketing')}
          className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-[13px] font-semibold transition-all ${
            currentPage === 'remarketing'
              ? 'bg-[#3B4553] text-white shadow-xs'
              : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
          }`}
          title="Remarketing & Recuperação de Vendas"
        >
          <RotateCw size={18} className={currentPage === 'remarketing' ? 'text-[#7C3AED]' : 'text-slate-400 group-hover:text-white'} />
          {!collapsed && <span className="truncate">Remarketing</span>}
        </button>

        {/* 10. Administração */}
        <button
          onClick={() => onNavigate('administracao')}
          className={`group flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-[13px] font-semibold transition-all ${
            currentPage === 'administracao' || currentPage === 'gerenciar-acessos'
              ? 'bg-[#3B4553] text-white shadow-xs'
              : 'text-[#CAD3DF] hover:bg-[#2D3746] hover:text-white'
          }`}
          title="Administração e Acessos"
        >
          <Settings size={18} className={currentPage === 'administracao' ? 'text-[#1677FF]' : 'text-slate-400 group-hover:text-white'} />
          {!collapsed && <span className="truncate">Administração</span>}
        </button>
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
