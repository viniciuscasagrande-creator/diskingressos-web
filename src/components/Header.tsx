// ==============================================================================
// FASE 28.15.5 + 28.15.6 — HEADER
// Cabeçalho global com seletores de contexto (Produtor → Evento) e perfil seguro
// ==============================================================================

import { LogOut, Menu, Search, SlidersHorizontal, Calendar, Building2 } from 'lucide-react'
import { isGlobalAdmin, roleLabel, type AppUser, type Producer } from '../auth/model'
import GlobalEventSelector from './GlobalEventSelector'
import type { SafeSaffScope } from '../context/app-context'
import { ThemeToggleCompact } from '../design-system/components/ThemeToggleCompact'
import { NotificationMenu } from './user/NotificationMenu'
import { ContextIndicator } from './context/ContextIndicator'

export type HeaderEventItem = {
  id: number
  code?: string
  title: string
  venue?: string
  city?: string
  date?: string
  status?: string
  producerId?: number
}

type Props = {
  scope?: SafeSaffScope
  query: string
  onQuery: (value: string) => void
  user: AppUser | null
  producers?: Producer[]
  selectedProducer?: number | 'all'
  onProducer?: (v: number | 'all') => void
  events?: HeaderEventItem[]
  selectedEventId?: number | null
  onEvent?: (eventId: number | null) => void
  onLogout?: () => void
  onToggleMenu?: () => void
  isMobileNavOpen?: boolean
}

export default function Header({
  scope = 'PRODUCER',
  query,
  onQuery,
  user,
  producers = [],
  selectedProducer = 'all',
  onProducer,
  events = [],
  selectedEventId = null,
  onEvent,
  onLogout,
  onToggleMenu,
  isMobileNavOpen = false
}: Props) {
  const userName = user?.name || 'Usuário'
  const userInitials =
    userName
      .split(' ')
      .filter(Boolean)
      .map((x) => x[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'DI'
  const userRole = user?.role ? roleLabel[user.role] || user.role : 'Acesso'

  const isAdmin = user ? isGlobalAdmin(user) : false

  // Nome da produtora para exibição fixa quando usuário não for Admin
  const currentProducerName =
    user && !isAdmin
      ? producers.find((p) => p.id === user.producerId)?.name || 'Minha Produtora'
      : null

  // Filtra os eventos disponíveis para o seletor:
  // Se for admin com produtora selecionada, filtra por ela; se for produtor regular, filtra pelo seu producerId
  const scopedProducerId = isAdmin
    ? selectedProducer === 'all'
      ? null
      : selectedProducer
    : user?.producerId || null

  const availableEvents = events.filter((e) => {
    if (scopedProducerId === null) return true
    return e.producerId === scopedProducerId
  })

  const effectiveProducerName =
    currentProducerName ||
    (selectedProducer !== 'all'
      ? producers.find((p) => p.id === selectedProducer)?.name || null
      : 'Visão Global')

  return (
    <header className="topbar global-topbar">
      <button
        type="button"
        className="mobile-menu-button sidebar-mobile-main-toggle"
        onClick={onToggleMenu}
        aria-label={isMobileNavOpen ? 'Fechar navegação' : 'Abrir navegação'}
        aria-expanded={isMobileNavOpen}
        data-testid="mobile-menu-button"
        data-sidebar-toggle="mobile"
      >
        <Menu size={22} />
      </button>

      <div className="brand global-brand" title="DiskIngressos">
        <img
          src="/logo-diskingressos.png"
          alt="DiskIngressos"
          className="navbar-logo"
        />
      </div>

      {/* Indicador de Contexto Ativo (Produtora / Evento) */}
      <ContextIndicator
        producerName={effectiveProducerName}
        eventName={availableEvents.find((e) => e.id === selectedEventId)?.title || null}
      />

      <div className="search-wrap global-search">
        <Search size={21} />
        <input
          value={query || ''}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Buscar eventos..."
        />
        <SlidersHorizontal size={19} />
      </div>

      <div className="profile-area global-profile flex items-center gap-2">
        {/* Seletor de Produtora: Somente para Administrador autorizado */}
        {user && isAdmin && onProducer && (
          <div className="context-selector-producer hidden sm:flex items-center">
            <select
              className="producer-switch"
              data-testid="header-producer-select"
              title="Selecione a Produtora Ativa"
              value={selectedProducer}
              onChange={(e) =>
                onProducer(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
            >
              <option value="all">Todas as produtoras</option>
              {producers
                .filter((p) => p?.status === 'ativo')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Produtora Fixa: Para perfil Produtor (nunca recebe seletor de outras produtoras) */}
        {user && !isAdmin && currentProducerName && (
          <div
            className="producer-badge-fixed hidden sm:inline-flex items-center gap-1.5"
            data-testid="header-producer-fixed"
            title={`Produtora Ativa: ${currentProducerName}`}
          >
            <Building2 size={13} className="text-[#06B6D4] shrink-0" />
            <span className="truncate max-w-[140px]">{currentProducerName}</span>
          </div>
        )}

        {/* Seletor Global de Evento Contextual (Produtor × Evento — Fase 28.15.8.1) */}
        {user && onEvent && (
          <div className="context-selector-event hidden md:flex items-center gap-2">
            <GlobalEventSelector
              scope={selectedEventId ? 'EVENT' : (scope || 'PRODUCER')}
              producerName={effectiveProducerName}
              events={availableEvents}
              selectedEventId={selectedEventId}
              onSelectEvent={(ev) => onEvent(ev ? ev.id : null)}
            />
            <select
              className="event-switch"
              data-testid="header-event-select"
              title="Filtrar por Evento no Contexto"
              value={selectedEventId ?? ''}
              onChange={(e) => {
                const val = e.target.value
                onEvent(val === '' ? null : Number(val))
              }}
            >
              <option value="">Selecione um evento...</option>
              {availableEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Alternador de Tema Komposo (Fase 29.14.1.1) */}
        <ThemeToggleCompact />

        {/* Notificações Rápidas do Header */}
        <NotificationMenu />

        <div className="avatar">
          {userInitials}
          <span className="online" />
        </div>

        <div className="profile-copy">
          <strong>{userName}</strong>
          <small>{userRole}</small>
        </div>

        {onLogout && (
          <button
            type="button"
            className="logout-btn"
            onClick={onLogout}
            title="Sair"
            data-testid="btn-logout"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  )
}
