// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// DiskTabs — Abas Universais com Suporte a Estilos Underline e Pills
// ==============================================================================

import React, { useState } from 'react'

export type TabsVariant = 'underline' | 'pills'

export interface TabItem {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
  badge?: string | number
  disabled?: boolean
  content?: React.ReactNode
}

export interface DiskTabsProps {
  tabs: TabItem[]
  activeTab?: string
  onChange?: (tabId: string) => void
  variant?: TabsVariant
  children?: React.ReactNode
  className?: string
  lazy?: boolean
}

export const DiskTabs: React.FC<DiskTabsProps> = ({
  tabs,
  activeTab: controlledActiveTab,
  onChange,
  variant = 'underline',
  children,
  className = '',
  lazy = false,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<string>(tabs[0]?.id || '')

  const activeTabId = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab

  const handleTabClick = (tabId: string) => {
    if (onChange) {
      onChange(tabId)
    } else {
      setInternalActiveTab(tabId)
    }
  }

  const activeTabObj = tabs.find((t) => t.id === activeTabId)

  return (
    <div data-testid="disk-tabs" className={`w-full flex flex-col select-none ${className}`}>
      {/* Lista de Abas */}
      <div
        role="tablist"
        aria-label="Navegação em abas"
        className={`flex items-center overflow-x-auto scrollbar-none gap-1 ${
          variant === 'underline'
            ? 'border-b border-border'
            : 'p-1 rounded-btn bg-muted/60 border border-border/80 inline-flex self-start'
        }`}
      >
        {tabs.map((tab) => {
          const isSelected = tab.id === activeTabId

          if (variant === 'pills') {
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                id={`tab-${tab.id}`}
                aria-controls={`panel-${tab.id}`}
                aria-selected={isSelected}
                disabled={tab.disabled}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-surface text-primary shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface/50'
                } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          }

          // Variante Underline (Padrão Komposo/Disk)
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              aria-selected={isSelected}
              disabled={tab.disabled}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
                isSelected
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              } ${tab.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div
        role="tabpanel"
        id={`panel-${activeTabId}`}
        aria-labelledby={`tab-${activeTabId}`}
        className="pt-4 w-full focus-visible:outline-none"
      >
        {children ? (
          children
        ) : lazy ? (
          activeTabObj?.content || null
        ) : (
          tabs.map((t) => (
            <div key={t.id} className={t.id === activeTabId ? 'block' : 'hidden'}>
              {t.content}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
