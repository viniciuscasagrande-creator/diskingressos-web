// ==============================================================================
// FASE 29.14.1.2 — DESIGN SYSTEM KOMPOSO / DISKINGRESSOS
// Menu do Usuário & Perfil Seguro no Header Global (UserMenu)
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react'
import { User, Settings, ShieldCheck, HelpCircle, LogOut, ChevronDown } from 'lucide-react'
import { roleLabel, type AppUser } from '../../auth/model'

export interface UserMenuProps {
  user: AppUser | null
  onLogout?: () => void
  className?: string
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
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

  const userName = user?.name || 'Usuário Disk'
  const userInitials =
    userName
      .split(' ')
      .filter(Boolean)
      .map((x) => x[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'DI'

  const userRole = user?.role ? roleLabel[user.role] || user.role : 'Acesso'

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="header-user-menu-trigger"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 p-1.5 rounded-xl border border-border/70 hover:border-primary/50 bg-surface hover:bg-surface-elevated transition shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs">
          {userInitials}
        </div>

        <div className="hidden xl:flex flex-col text-left leading-tight pr-1">
          <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
            {userName}
          </span>
          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
            {userRole}
          </span>
        </div>

        <ChevronDown
          size={13}
          className={`text-muted-foreground transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-elevated text-foreground border border-border shadow-2xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100"
          role="menu"
        >
          {/* Header do Perfil */}
          <div className="px-4 py-2.5 border-b border-border/50 bg-muted/20">
            <div className="text-xs font-bold text-foreground truncate">{userName}</div>
            <div className="text-[10px] text-muted-foreground truncate">{userRole}</div>
            {user?.email && (
              <div className="text-[10px] text-muted-foreground/80 truncate mt-0.5">{user.email}</div>
            )}
          </div>

          <div className="py-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-left text-foreground hover:bg-primary/10 transition cursor-pointer"
              role="menuitem"
            >
              <User size={14} className="text-muted-foreground" />
              <span>Minha Conta</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-left text-foreground hover:bg-primary/10 transition cursor-pointer"
              role="menuitem"
            >
              <Settings size={14} className="text-muted-foreground" />
              <span>Preferências</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-left text-foreground hover:bg-primary/10 transition cursor-pointer"
              role="menuitem"
            >
              <ShieldCheck size={14} className="text-muted-foreground" />
              <span>Segurança & Sessões</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-left text-foreground hover:bg-primary/10 transition cursor-pointer"
              role="menuitem"
            >
              <HelpCircle size={14} className="text-muted-foreground" />
              <span>Central de Ajuda</span>
            </button>
          </div>

          {onLogout && (
            <div className="pt-1 border-t border-border/50">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  onLogout()
                }}
                data-testid="btn-logout"
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-left text-destructive hover:bg-destructive/10 transition cursor-pointer font-semibold"
                role="menuitem"
              >
                <LogOut size={14} />
                <span>Sair da Plataforma</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default UserMenu
