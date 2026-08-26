import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Bell, ChevronDown, Check, Building2, 
  SlidersHorizontal, User, Shield, LogOut,
  HelpCircle, Sparkles, X, CheckCheck
} from 'lucide-react';
import type { Producer } from '../../types/producer';
import type { NotificationItem } from '../../data/mockNotifications';
import { mockNotifications } from '../../data/mockNotifications';
import { Button } from '../ui/Button';

interface HeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  selectedProducer: Producer;
  producers: Producer[];
  onSelectProducer: (producer: Producer) => void;
  onOpenNewEvent: () => void;
  onOpenAdvancedFilters: () => void;
  activeFiltersCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  query,
  onQueryChange,
  selectedProducer,
  producers,
  onSelectProducer,
  onOpenNewEvent,
  onOpenAdvancedFilters,
  activeFiltersCount = 0,
}) => {
  const [producerDropdownOpen, setProducerDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>(mockNotifications);

  const producerRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (producerRef.current && !producerRef.current.contains(event.target as Node)) {
        setProducerDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notificationsList.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-30 flex h-[74px] w-full items-center justify-between border-b border-white/[0.08] bg-[#222A36] px-4 md:px-7 text-white select-none">
      {/* Brand & Producer Selector */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => window.location.reload()}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-[#1677FF] shadow-sm shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <span className="text-xl font-black italic tracking-tighter text-white">Di</span>
          </div>
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[17px] font-extrabold tracking-tight text-white">DiskIngressos</span>
              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-black text-blue-400 border border-blue-500/30">PRO</span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">Painel de Gestão</span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block h-7 w-[1px] bg-slate-700/60" />

        {/* Selected Producer Switcher */}
        <div className="relative" ref={producerRef}>
          <button
            onClick={() => setProducerDropdownOpen(!producerDropdownOpen)}
            className="flex items-center gap-2.5 rounded-btn border border-slate-700/70 bg-[#2A3442] px-3 py-1.5 text-left transition hover:border-slate-600 hover:bg-[#344052]"
            title="Trocar produtora ativa"
          >
            <div className={`flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br ${selectedProducer.avatarColor} text-xs font-bold text-white shadow-xs`}>
              {selectedProducer.logoInitial}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-semibold text-slate-200 line-clamp-1 max-w-[140px] lg:max-w-[180px]">
                {selectedProducer.name}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Building2 size={10} />
                {selectedProducer.cnpj}
              </span>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${producerDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Producer Dropdown Menu */}
          {producerDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 rounded-card border border-slate-700/80 bg-[#1E2530] p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-700/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Produtora Ativa</p>
                <p className="text-xs text-slate-300 font-medium">Selecione para filtrar os eventos</p>
              </div>
              <div className="py-1 space-y-0.5 max-h-64 overflow-y-auto">
                {producers.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      onSelectProducer(prod);
                      setProducerDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                      selectedProducer.id === prod.id
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-[#283243]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br ${prod.avatarColor} text-[11px] font-bold text-white`}>
                        {prod.logoInitial}
                      </div>
                      <div>
                        <p className="font-semibold">{prod.name}</p>
                        <p className="text-[10px] text-slate-400">{prod.activeEventsCount} eventos ativos</p>
                      </div>
                    </div>
                    {selectedProducer.id === prod.id && <Check size={16} className="text-blue-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Bar (Fundo #2A3442) */}
      <div className="flex-1 max-w-xl mx-3 lg:mx-6">
        <div className="relative flex items-center">
          <Search size={17} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Buscar eventos, locais, pedidos (#DI-XXXXX)..."
            className="w-full h-[42px] rounded-full border border-slate-700/80 bg-[#2A3442] pl-10 pr-24 text-[13px] text-slate-100 placeholder:text-slate-400 focus:border-[#1677FF] focus:bg-[#303B4B] focus:outline-none focus:shadow-[0_0_0_3px_rgba(22,119,255,0.15)] transition"
          />
          {query && (
            <button
              onClick={() => onQueryChange('')}
              className="absolute right-12 text-slate-400 hover:text-slate-200"
              title="Limpar busca"
            >
              <X size={15} />
            </button>
          )}
          <button
            onClick={onOpenAdvancedFilters}
            className={`absolute right-1.5 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
              activeFiltersCount > 0
                ? 'bg-[#1677FF] text-white shadow-xs'
                : 'bg-slate-700/70 text-slate-300 hover:bg-slate-600/70'
            }`}
            title="Filtros avançados"
          >
            <SlidersHorizontal size={12} />
            <span className="hidden sm:inline">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-[#1677FF]">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Right Navigation & Profile Area */}
      <div className="flex items-center gap-2 lg:gap-3.5">
        {/* Quick New Event Button (Header Shortcut) */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenNewEvent}
          icon={<Sparkles size={14} />}
          className="hidden xl:inline-flex"
        >
          Novo Evento
        </Button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-btn border border-slate-700/60 bg-[#2A3442] text-slate-300 transition hover:bg-[#344052] hover:text-white"
            title="Notificações e Alertas"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white ring-2 ring-[#222A36]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-card border border-slate-700/80 bg-[#1E2530] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Notificações</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
                      {unreadCount} novas
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium transition"
                  >
                    <CheckCheck size={13} />
                    Marcar lidas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                {notificationsList.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 transition hover:bg-[#252E3C] ${item.read ? 'opacity-70' : 'bg-blue-950/20'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{item.time}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">{item.message}</p>
                    {item.eventCode && (
                      <span className="mt-2 inline-block rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-700">
                        Evento #{item.eventCode}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Area */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 rounded-btn border border-slate-700/60 bg-[#2A3442] p-1.5 pr-2.5 transition hover:bg-[#344052]"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-800 text-xs shadow-inner">
              VI
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#10B981] ring-2 ring-[#222A36]" />
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-100">Vinicius</span>
              <span className="text-[10px] text-slate-400">Administrador</span>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-card border border-slate-700/80 bg-[#1E2530] p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2.5 border-b border-slate-700/60">
                <p className="text-xs font-bold text-white">Vinicius Casagrande</p>
                <p className="text-[11px] text-slate-400">vinicius@diskingressos.com.br</p>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#10B981]" />
                  <span className="text-[10px] text-emerald-400 font-medium">Conta Master Ativa</span>
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-[#283243] hover:text-white transition">
                  <User size={15} className="text-slate-400" />
                  Meu Perfil & Segurança
                </button>
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-[#283243] hover:text-white transition">
                  <Shield size={15} className="text-slate-400" />
                  Permissões & Tokens de API
                </button>
              </div>

              <div className="pt-1 mt-1 border-t border-slate-700/60">
                <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#EF4444] hover:bg-rose-950/40 transition">
                  <LogOut size={15} />
                  Sair do Painel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
