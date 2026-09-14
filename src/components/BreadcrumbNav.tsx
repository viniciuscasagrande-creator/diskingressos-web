// ==============================================================================
// FASE 28.15.6 — BREADCRUMBNAV
// Componente de navegação estrutural adaptável para Desktop e Mobile 360°
// ==============================================================================

import React from 'react'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import type { BreadcrumbItem } from '../navigation/breadcrumbs'
import { AppRouter } from '../navigation/router'

export interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
  className?: string
  dataTestId?: string
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  items,
  className = '',
  dataTestId = 'breadcrumb-nav'
}) => {
  if (!items || items.length === 0) return null

  const currentItem = items[items.length - 1]
  const parentItem = items.length > 1 ? items[items.length - 2] : null

  const handleNavigate = (path?: string) => {
    if (path) {
      AppRouter.navigate(path)
    }
  }

  return (
    <nav
      aria-label="Caminho de navegação"
      data-testid={dataTestId}
      className={`breadcrumb-container select-none max-w-full ${className}`}
    >
      {/* Desktop / Tablet Breadcrumbs (>= 768px) */}
      <ol className="breadcrumb-desktop hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-400">
        {items.map((item, idx) => {
          const isLast = item.isCurrent || idx === items.length - 1
          return (
            <li key={idx} className="inline-flex items-center gap-1.5">
              {idx > 0 && (
                <ChevronRight size={12} className="text-slate-500 shrink-0" aria-hidden="true" />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  data-testid="breadcrumb-current-item"
                  className="font-bold text-[#06B6D4] truncate max-w-[280px]"
                >
                  {item.label}
                </span>
              ) : item.path ? (
                <button
                  type="button"
                  onClick={() => handleNavigate(item.path)}
                  className="text-slate-400 hover:text-slate-200 transition truncate max-w-[200px] cursor-pointer bg-transparent border-0 p-0"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-slate-400 truncate max-w-[200px]">{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>

      {/* Mobile Breadcrumbs (< 768px — 360px a 430px) */}
      <div className="breadcrumb-mobile flex md:hidden flex-col gap-0.5 text-left max-w-full overflow-hidden">
        {parentItem && (
          <button
            type="button"
            data-testid="breadcrumb-mobile-parent"
            onClick={() => handleNavigate(parentItem.path)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer truncate max-w-full bg-transparent border-0 p-0"
          >
            <ArrowLeft size={11} className="text-[#06B6D4] shrink-0" />
            <span className="truncate">{parentItem.label}</span>
          </button>
        )}
        <div
          aria-current="page"
          data-testid="breadcrumb-mobile-current"
          className="text-xs font-bold text-[#06B6D4] truncate max-w-full"
        >
          {currentItem?.label}
        </div>
      </div>
    </nav>
  )
}
