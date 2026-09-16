// ==============================================================================
// FASE 29.14.1.2 — DESIGN SYSTEM KOMPOSO / DISKINGRESSOS
// Painel de Diagnóstico de Contexto e Navegação para Desenvolvedor
// Regras 29.14.1.2.72 e 29.14.1.2.73
// ==============================================================================

import React from 'react'
import { Terminal, Shield, Building2, Calendar, Layout, Palette } from 'lucide-react'
import type { AppUser } from '../../auth/model'
import type { PageKey } from '../../components/ModuleSidebar'
import { useTheme } from '../../design-system/hooks/useTheme'

export interface NavigationDiagnosticProps {
  user: AppUser | null
  producerId: number | null
  producerName?: string | null
  eventId: number | null
  eventName?: string | null
  currentPage: PageKey
  className?: string
}

export const NavigationDiagnostic: React.FC<NavigationDiagnosticProps> = ({
  user,
  producerId,
  producerName,
  eventId,
  eventName,
  currentPage,
  className = ''
}) => {
  const { theme, resolvedTheme } = useTheme()

  return (
    <aside
      aria-label="Diagnóstico de Navegação e Contexto"
      className={`p-4 rounded-2xl bg-surface-elevated border border-border text-foreground text-xs shadow-md space-y-3 ${className}`}
      data-testid="navigation-diagnostic-panel"
    >
      <div className="flex items-center gap-2 font-bold text-primary border-b border-border/50 pb-2">
        <Terminal size={16} />
        <span>Diagnóstico de Contexto & Navegação (Modo Desenvolvedor)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <Shield size={13} className="text-primary" />
            <span>Usuário & Perfil</span>
          </div>
          <div className="font-bold truncate">{user?.name || 'Não autenticado'}</div>
          <div className="text-[11px] text-muted-foreground">{user?.role || 'Visitante'}</div>
        </div>

        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <Building2 size={13} className="text-primary" />
            <span>Produtora Ativa</span>
          </div>
          <div className="font-bold truncate">{producerName || 'Visão Global (Todas)'}</div>
          <div className="text-[11px] text-muted-foreground">
            ID: {producerId ?? 'Global (null)'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <Calendar size={13} className="text-primary" />
            <span>Evento no Escopo</span>
          </div>
          <div className="font-bold truncate">{eventName || 'Todos os Eventos'}</div>
          <div className="text-[11px] text-muted-foreground">
            {eventId ? `ID: ${eventId}` : 'Escopo Consolidado'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <Layout size={13} className="text-primary" />
            <span>Roteamento Ativo</span>
          </div>
          <div className="font-mono text-primary font-bold">{currentPage}</div>
          <div className="text-[11px] text-muted-foreground">PageKey do Módulo</div>
        </div>

        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <Palette size={13} className="text-primary" />
            <span>Aparência & Tema</span>
          </div>
          <div className="font-bold capitalize">{theme}</div>
          <div className="text-[11px] text-muted-foreground">Resolvido: {resolvedTheme}</div>
        </div>
      </div>
    </aside>
  )
}
export default NavigationDiagnostic
