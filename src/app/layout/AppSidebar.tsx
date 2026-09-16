// ==============================================================================
// FASE 29.14.1.2 — DESIGN SYSTEM KOMPOSO / DISKINGRESSOS
// Sidebar Global Unificada da Plataforma (AppSidebar)
// Gerencia a transição fluida entre Visão do Produtor e Visão do Evento
// ==============================================================================

import React from 'react'
import ModuleSidebar, { type PageKey, type ModuleKey } from '../../components/ModuleSidebar'
import EventContextSidebar from '../../components/EventContextSidebar'
import type { EventItem } from '../../data/events'
import type { AppUser } from '../../auth/model'
import type { ProducerEvent } from '../../types/context.types'

export interface AppSidebarProps {
  module: ModuleKey
  page: PageKey
  selectedEvent: EventItem | null
  onNavigate: (page: PageKey) => void
  onBackToProducer: () => void
  onSelectOtherEvent?: (event: ProducerEvent) => void
  onHome: () => void
  canAdmin?: boolean
  user: AppUser | null
  onCollapsedChange?: (collapsed: boolean) => void
  mobileNavOpen?: boolean
  inEventContext?: boolean
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  module,
  page,
  selectedEvent,
  onNavigate,
  onBackToProducer,
  onSelectOtherEvent,
  onHome,
  canAdmin = true,
  user,
  onCollapsedChange,
  mobileNavOpen = false,
  inEventContext = false
}) => {
  // Se estiver no contexto de um evento específico, renderiza a navegação focada no evento
  if (inEventContext && selectedEvent) {
    return (
      <EventContextSidebar
        event={selectedEvent}
        page={page}
        onNavigate={onNavigate}
        onBack={onBackToProducer}
        onSelectOtherEvent={onSelectOtherEvent}
        canAdmin={canAdmin}
      />
    )
  }

  // Visão corporativa consolidada (Produtor / Todos os Eventos)
  return (
    <ModuleSidebar
      module={module}
      page={page}
      onNavigate={onNavigate}
      onHome={onHome}
      canAdmin={canAdmin}
      user={user || undefined}
      onCollapsedChange={onCollapsedChange}
      mobileNavOpen={mobileNavOpen}
    />
  )
}
export default AppSidebar
