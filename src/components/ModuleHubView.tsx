import React, { useState, useMemo, type ComponentType } from 'react'
import { ArrowRight, Search, Sparkles, ChevronRight, ArrowLeft } from 'lucide-react'
import type { PageKey } from './ModuleSidebar'
import '../styles/module-hub.css'

export interface ModuleHubCardItem {
  id: string
  title: string
  description: string
  icon: ComponentType<{ size?: number; className?: string }>
  badge?: string
  badgeVariant?: 'primary' | 'success' | 'warning' | 'info' | 'purple'
  route?: string
  pageKey?: PageKey
  onClick?: () => void
  category?: string
  highlight?: boolean
}

export interface ModuleHubViewProps {
  hubDef?: {
    id: string
    title: string
    subtitle: string
    badge?: string
    items: ModuleHubCardItem[]
    categories?: string[]
  }
  hubId?: string
  title?: string
  subtitle?: string
  badge?: string
  items?: ModuleHubCardItem[]
  categories?: string[]
  onNavigate: (pageKey: PageKey, route?: string) => void
  onBack?: () => void
}

export default function ModuleHubView({
  hubDef,
  hubId = hubDef?.id || 'hub',
  title = hubDef?.title || '',
  subtitle = hubDef?.subtitle || '',
  badge = hubDef?.badge,
  items = hubDef?.items || [],
  categories = hubDef?.categories,
  onNavigate,
  onBack
}: ModuleHubViewProps) {
  const [search, setSearch] = useState('')

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return items
    return items.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q) ||
        (it.category && it.category.toLowerCase().includes(q)) ||
        (it.badge && it.badge.toLowerCase().includes(q))
    )
  }, [items, search])

  const groupedItems = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [{ category: '', items: filteredItems }]
    }

    const groups: { category: string; items: ModuleHubCardItem[] }[] = []
    const mapped = new Set<string>()

    for (const cat of categories) {
      const inCat = filteredItems.filter((it) => it.category === cat)
      if (inCat.length > 0) {
        groups.push({ category: cat, items: inCat })
        inCat.forEach((it) => mapped.add(it.id))
      }
    }

    // Itens sem categoria explicitada
    const others = filteredItems.filter((it) => !mapped.has(it.id))
    if (others.length > 0) {
      groups.push({ category: 'Outras Operações', items: others })
    }

    return groups
  }, [categories, filteredItems])

  const handleCardClick = (item: ModuleHubCardItem) => {
    if (item.onClick) {
      item.onClick()
      return
    }
    if (item.pageKey) {
      onNavigate(item.pageKey, item.route)
    }
  }

  return (
    <div className="module-hub-container" data-testid={`module-hub-${hubId}`}>
      {/* Header do Hub */}
      <div className="module-hub-header">
        <div className="module-hub-header-main">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="module-hub-back-btn"
              title="Voltar"
              aria-label="Voltar"
            >
              <ArrowLeft size={16} />
              <span>Voltar</span>
            </button>
          )}

          <div className="module-hub-title-group">
            <div className="module-hub-title-row">
              <h1 className="module-hub-title">{title}</h1>
              {badge && <span className="module-hub-badge">{badge}</span>}
            </div>
            <p className="module-hub-subtitle">{subtitle}</p>
          </div>
        </div>

        {/* Busca rápida se houver mais de 4 itens */}
        {items.length > 4 && (
          <div className="module-hub-search-wrap">
            <Search size={15} className="module-hub-search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar função..."
              className="module-hub-search-input"
            />
          </div>
        )}
      </div>

      {/* Grid de Cards organizado por categorias */}
      <div className="module-hub-content">
        {filteredItems.length === 0 ? (
          <div className="module-hub-empty">
            Nenhuma função encontrada com o termo "{search}".
          </div>
        ) : (
          groupedItems.map((group, gIdx) => (
            <div key={group.category || `grp-${gIdx}`} className="module-hub-group">
              {group.category && (
                <div className="module-hub-category-title">{group.category}</div>
              )}
              <div className="module-hub-grid">
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleCardClick(item)}
                      className={`module-hub-card ${item.highlight ? 'module-hub-card--highlight' : ''}`}
                      data-testid={`hub-card-${item.id}`}
                    >
                      <div className="module-hub-card-header">
                        <div className="module-hub-card-icon-wrap">
                          <Icon size={20} className="module-hub-card-icon" />
                        </div>
                        {item.badge && (
                          <span
                            className={`module-hub-card-badge module-hub-card-badge--${item.badgeVariant || 'info'}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <div className="module-hub-card-body">
                        <h3 className="module-hub-card-title">{item.title}</h3>
                        <p className="module-hub-card-desc">{item.description}</p>
                      </div>

                      <div className="module-hub-card-footer">
                        <span className="module-hub-card-action">Acessar</span>
                        <ChevronRight size={14} className="module-hub-card-arrow" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
