// ==============================================================================
// FASE 29.14.1.2 — DESIGN SYSTEM KOMPOSO / DISKINGRESSOS
// Breadcrumb Padronizado do AppShell (AppBreadcrumb)
// ==============================================================================

import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import type { BreadcrumbCrumb } from '../navigation/navigation.types'
import { AppRouter } from '../../navigation/router'

export interface AppBreadcrumbProps {
  items: BreadcrumbCrumb[]
  className?: string
}

export const AppBreadcrumb: React.FC<AppBreadcrumbProps> = ({ items, className = '' }) => {
  if (!items || items.length === 0) return null

  const handleNavigate = (path?: string) => {
    if (path) {
      AppRouter.navigate(path)
    }
  }

  return (
    <nav
      aria-label="Caminho de navegação"
      data-testid="app-breadcrumb"
      className={`hidden md:flex items-center text-xs font-medium text-muted-foreground select-none max-w-xl ${className}`}
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((crumb, idx) => {
          const isLast = crumb.isCurrent || idx === items.length - 1
          return (
            <li key={crumb.id || idx} className="inline-flex items-center gap-1.5">
              {idx > 0 && (
                <ChevronRight size={12} className="text-muted-foreground/60 shrink-0" aria-hidden="true" />
              )}
              {idx === 0 && (
                <Home size={12} className="text-muted-foreground/70 shrink-0 mr-0.5" />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  data-testid="app-breadcrumb-current"
                  className="font-bold text-primary truncate max-w-[220px]"
                >
                  {crumb.label}
                </span>
              ) : crumb.path ? (
                <button
                  type="button"
                  onClick={() => handleNavigate(crumb.path)}
                  className="hover:text-foreground transition truncate max-w-[160px] cursor-pointer bg-transparent border-0 p-0 text-muted-foreground"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="truncate max-w-[160px] text-muted-foreground">{crumb.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
export default AppBreadcrumb
