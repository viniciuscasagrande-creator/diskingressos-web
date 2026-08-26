import React, { useState } from 'react';
import { 
  Search, Bell, Plus, ChevronDown, Building2, 
  User as UserIcon, LogOut, ShieldCheck, Check, 
  ExternalLink, KeyRound, Globe
} from 'lucide-react';
import type { Producer } from '../../types/producer';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  selectedProducer: Producer | null;
  producers: Producer[];
  onSelectProducer: (producer: Producer | null) => void;
  onOpenNewEvent: () => void;
  onOpenAdvancedFilters: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  query,
  onQueryChange,
  selectedProducer,
  producers,
  onSelectProducer,
  onOpenNewEvent,
  onOpenAdvancedFilters,
}) => {
  const { currentUser, logout, selectProducer, activeProducer } = useAuth();

  const [producerDropdownOpen, setProducerDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isAdminMaster = currentUser?.role === 'admin-master' || currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 flex h-[74px] w-full items-center justify-between border-b border-white/[0.08] bg-[#222A36] px-4 sm:px-6 lg:px-7 select-none">
      {/* 1. Left: Brand Logo & Producer Selector */}
      <div className="flex items-center gap-4 sm:gap-6 min-w-0">
        {/* Logo DiskIngressos */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-[#1677FF] text-white shadow-md">
            <span className="font-extrabold text-[17px] tracking-tight">Di</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-black text-[18px] tracking-tight text-white block leading-none">
              DiskIngressos
            </span>
            <span className="text-[10px] font-semibold text-[#8F9BAD] uppercase tracking-widest mt-0.5 block">
              Painel do Produtor
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-white/[0.12] hidden md:block" />

        {/* Multi-Tenant Producer Indicator / Selector */}
        {isAdminMaster ? (
          /* Admin Master Dropdown: Pode ver "Todas as Produtoras" ou escolher uma */
          <div className="relative">
            <button
              onClick={() => setProducerDropdownOpen(!producerDropdownOpen)}
              className="flex items-center gap-2 rounded-btn border border-white/[0.12] bg-[#2A3442] px-3 py-1.5 text-xs text-white hover:bg-[#344052] transition shadow-xs"
              title="Alternar Produtora (Acesso Global Admin Master)"
            >
              <Building2 size={15} className="text-[#1677FF]" />
              <span className="font-bold max-w-[160px] truncate">
                {activeProducer ? activeProducer.name : 'Todas as Produtoras'}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {producerDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-card border border-[#E2E8F0] bg-white p-2 shadow-2xl text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] px-2 py-1 block">
                  Visão Multi-Produtor (Master)
                </span>

                {/* Opção: Todas as Produtoras */}
                <button
                  onClick={() => {
                    selectProducer(null);
                    onSelectProducer(null);
                    setProducerDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded px-2.5 py-2 text-xs font-semibold transition ${
                    activeProducer === null
                      ? 'bg-[#1677FF] text-white font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Globe size={14} />
                    <span>Todas as Produtoras (Global)</span>
                  </div>
                  {activeProducer === null && <Check size={14} />}
                </button>

                <div className="my-1 border-t border-slate-100" />

                {producers.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      selectProducer(prod.id);
                      onSelectProducer(prod);
                      setProducerDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded px-2.5 py-2 text-xs font-semibold transition ${
                      activeProducer?.id === prod.id
                        ? 'bg-[#1677FF] text-white font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                      <span className="truncate">{prod.name}</span>
                    </div>
                    {activeProducer?.id === prod.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Regular Producer: Fixo na própria produtora (Sem dropdown) */
          <div className="flex items-center gap-2 rounded-btn bg-[#2A3442] border border-white/[0.12] px-3 py-1.5 text-xs text-white">
            <Building2 size={14} className="text-[#10B981]" />
            <span className="font-bold">{activeProducer?.name || 'Sua Produtora'}</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-mono">
              PJ
            </span>
          </div>
        )}
      </div>

      {/* 2. Center: Global Search Bar */}
      <div className="hidden md:flex flex-1 max-w-[480px] mx-4 lg:mx-8">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar eventos, pedidos, participantes ou transações..."
            className="w-full h-[40px] pl-10 pr-4 rounded-input border border-white/[0.08] bg-[#2A3442] text-xs font-medium text-white placeholder-slate-400 outline-none transition focus:border-[#1677FF] focus:bg-[#323E4F]"
          />
        </div>
      </div>

      {/* 3. Right: Action Buttons, Notifications & User Menu */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick New Event Button (if allowed) */}
        <button
          onClick={onOpenNewEvent}
          className="hidden sm:flex items-center gap-1.5 rounded-btn bg-[#1677FF] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1366DB] active:scale-95 transition shadow-sm"
        >
          <Plus size={15} />
          <span>Novo Evento</span>
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="relative flex h-9 w-9 items-center justify-center rounded-btn text-slate-300 hover:bg-[#2D3746] hover:text-white transition"
          title="Notificações do Sistema"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EF4444]" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-btn hover:bg-[#2D3746] transition"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-white font-bold text-xs shadow-inner"
              style={{ backgroundColor: currentUser?.avatarColor || '#1677FF' }}
            >
              {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : 'VI'}
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-bold text-white block leading-tight truncate max-w-[130px]">
                {currentUser?.name || 'Vinícius Admin'}
              </span>
              <span className="text-[10px] text-[#06B6D4] font-medium block">
                {currentUser?.roleLabel || 'Admin Master'}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-card border border-[#E2E8F0] bg-white p-2 shadow-2xl text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 border-b border-slate-100">
                <strong className="block text-xs font-bold text-[#0E1726]">{currentUser?.name}</strong>
                <span className="text-[11px] text-[#64748B] block truncate">{currentUser?.email}</span>
                <span className="mt-1.5 inline-block rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-[#1677FF]">
                  ● {currentUser?.roleLabel}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-bold text-[#EF4444] hover:bg-rose-50 transition"
                >
                  <LogOut size={15} />
                  <span>Sair do Sistema</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
