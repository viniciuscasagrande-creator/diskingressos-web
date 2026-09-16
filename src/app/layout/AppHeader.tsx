// ==============================================================================
// FASE 29.14.1.2 — DESIGN SYSTEM KOMPOSO / DISKINGRESSOS
// Cabeçalho Global Unificado da Plataforma (AppHeader)
// ==============================================================================

import React from 'react'
import { Menu } from 'lucide-react'
import type { AppUser, Producer } from '../../auth/model'
import type { HeaderEventItem } from '../../components/Header'
import type { BreadcrumbCrumb } from '../navigation/navigation.types'
import { ProducerSelector } from '../../components/context/ProducerSelector'
import { EventSelector } from '../../components/context/EventSelector'
import { ContextIndicator } from '../../components/context/ContextIndicator'
import { GlobalSearch } from '../../components/search/GlobalSearch'
import { NotificationMenu } from '../../components/user/NotificationMenu'
import { UserMenu } from '../../components/user/UserMenu'
import { ThemeToggleCompact } from '../../design-system/components/ThemeToggleCompact'
import { AppBreadcrumb } from './AppBreadcrumb'

export interface AppHeaderProps {
  user: AppUser | null
  producers?: Producer[]
  selectedProducerId?: number | 'all'
  onSelectProducer?: (producerId: number | 'all') => void
  events?: HeaderEventItem[]
  selectedEventId?: number | null
  onSelectEvent?: (eventId: number | null) => void
  searchQuery?: string
  onSearchChange?: (val: string) => void
  onToggleMobileNav?: () => void
  isMobileNavOpen?: boolean
  breadcrumbs?: BreadcrumbCrumb[]
  onLogout?: () => void
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  producers = [],
  selectedProducerId = 'all',
  onSelectProducer,
  events = [],
  selectedEventId = null,
  onSelectEvent,
  searchQuery = '',
  onSearchChange = () => {},
  onToggleMobileNav,
  isMobileNavOpen = false,
  breadcrumbs = [],
  onLogout
}) => {
  const isAdmin = user?.role === 'admin-master' || user?.role === 'admin'

  const currentProducerName =
    user && !isAdmin
      ? producers.find((p) => p.id === user.producerId)?.name || 'Minha Produtora'
      : selectedProducerId !== 'all'
      ? producers.find((p) => p.id === selectedProducerId)?.name || null
      : null

  const selectedEvent = events.find((e) => e.id === selectedEventId)
  const currentEventName = selectedEvent?.title || null

  return (
    <header
      className="sticky top-0 z-40 w-full h-[var(--header-height,4rem)] bg-surface/95 backdrop-blur-md border-b border-border/80 px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-4 transition-colors"
      data-testid="app-header-global"
    >
      {/* Bloco Esquerdo: Mobile Trigger + Logo + Breadcrumb / Contexto */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {onToggleMobileNav && (
          <button
            type="button"
            onClick={onToggleMobileNav}
            aria-label={isMobileNavOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={isMobileNavOpen}
            data-testid="mobile-menu-button"
            className="md:hidden p-2 rounded-xl border border-border/80 bg-surface hover:bg-surface-elevated text-foreground transition cursor-pointer"
          >
            <Menu size={18} />
          </button>
        )}

        <div className="flex items-center gap-2 select-none" title="DiskIngressos Enterprise">
          <img
            src="/logo-diskingressos.png"
            alt="DiskIngressos"
            className="h-7 w-auto object-contain hidden xs:block"
          />
        </div>

        {/* Indicador de Contexto Ativo (Produtora / Evento) */}
        <ContextIndicator
          producerName={currentProducerName}
          eventName={currentEventName}
        />

        {/* Breadcrumb Global Integrado */}
        <AppBreadcrumb items={breadcrumbs} className="hidden xl:flex ml-2" />
      </div>

      {/* Bloco Central: Seletores de Contexto + Busca Global */}
      <div className="hidden md:flex items-center gap-2 flex-1 max-w-2xl mx-2">
        {onSelectProducer && (
          <ProducerSelector
            producers={producers}
            selectedProducerId={selectedProducerId}
            onSelectProducer={onSelectProducer}
            isAdmin={isAdmin}
            fixedProducerName={currentProducerName}
          />
        )}

        {onSelectEvent && (
          <EventSelector
            events={events}
            selectedEventId={selectedEventId}
            onSelectEvent={onSelectEvent}
            producerName={currentProducerName}
          />
        )}

        <GlobalSearch
          value={searchQuery}
          onChange={onSearchChange}
          className="flex-1"
        />
      </div>

      {/* Bloco Direito: Tema + Notificações + Perfil */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* ThemeSwitcher da Fase 29.14.1.1 */}
        <ThemeToggleCompact />

        {/* Notificações com Separação Não Lidas x Críticas */}
        <NotificationMenu />

        {/* Perfil & Ações de Sessão */}
        <UserMenu user={user} onLogout={onLogout} />
      </div>
    </header>
  )
}
export default AppHeader
