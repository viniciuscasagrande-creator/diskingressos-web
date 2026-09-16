// ==============================================================================
// FASE 29.14.1.2 — DESIGN SYSTEM KOMPOSO / DISKINGRESSOS
// Menu Rápido de Notificações no Header Global
// Separa claramente notificações Não Lidas de Alertas Críticos (Regra 29.14.1.2.33)
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react'
import { Bell, AlertTriangle, Info, CheckCircle2, ChevronRight, X } from 'lucide-react'

export interface QuickNotification {
  id: string
  title: string
  description: string
  category: 'financeiro' | 'marketing' | 'sac' | 'suporte' | 'sistema'
  severity: 'critica' | 'info' | 'sucesso'
  timestamp: string
  read: boolean
}

const INITIAL_NOTIFICATIONS: QuickNotification[] = [
  {
    id: 'notif-1',
    title: 'Disputa de chargeback aberta',
    description: 'Pedido #48291 recebeu notificação de disputa da adquirente.',
    category: 'financeiro',
    severity: 'critica',
    timestamp: 'Há 12 min',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Lote 1 esgotado',
    description: 'Festival de Inverno atingiu 100% da cota do lote 1.',
    category: 'marketing',
    severity: 'sucesso',
    timestamp: 'Há 45 min',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Atualização de conciliação bancária',
    description: 'Extrato bancário OFX processado com 98,4% de correspondência.',
    category: 'financeiro',
    severity: 'info',
    timestamp: 'Há 2 horas',
    read: true
  }
]

export const NotificationMenu: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<QuickNotification[]>(INITIAL_NOTIFICATIONS)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const unreadCount = notifications.filter((n) => !n.read).length
  const criticalCount = notifications.filter((n) => n.severity === 'critica' && !n.read).length

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="header-notifications-button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`Notificações: ${unreadCount} não lidas (${criticalCount} críticas)`}
        className="relative p-2 rounded-xl border bg-surface border-border/80 hover:border-primary/50 hover:bg-surface-elevated transition shadow-xs flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
      >
        <Bell size={17} className="text-foreground" />
        {unreadCount > 0 && (
          <span
            data-testid="header-notifications-badge"
            className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full text-white shadow-xs ${
              criticalCount > 0 ? 'bg-destructive animate-pulse' : 'bg-primary'
            }`}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-84 sm:w-96 rounded-2xl bg-surface-elevated text-foreground border border-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          role="dialog"
          aria-label="Central de Notificações Rápidas"
        >
          {/* Header do Menu */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Notificações
              </span>
              {criticalCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-destructive/15 text-destructive border border-destructive/30">
                  {criticalCount} crítica{criticalCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer bg-transparent border-0 p-0"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista de Notificações */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/30">
            {notifications.map((notif) => {
              const isCritical = notif.severity === 'critica'
              return (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-muted/40 ${
                    !notif.read ? 'bg-primary/5' : 'opacity-80'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCritical ? (
                      <AlertTriangle size={16} className="text-destructive" />
                    ) : notif.severity === 'sucesso' ? (
                      <CheckCircle2 size={16} className="text-primary" />
                    ) : (
                      <Info size={16} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span
                        className={`text-xs font-semibold truncate ${
                          isCritical ? 'text-destructive font-bold' : 'text-foreground'
                        }`}
                      >
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notif.description}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {notif.category}
                      </span>
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" title="Não lida" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {notifications.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Nenhuma notificação recente
              </div>
            )}
          </div>

          {/* Footer do Menu */}
          <div className="p-2 border-t border-border/50 bg-muted/20 text-center">
            <span className="text-[11px] text-muted-foreground">
              Acesso rápido do Header Komposo/Disk
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
export default NotificationMenu
