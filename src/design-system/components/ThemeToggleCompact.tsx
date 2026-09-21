import React, { useState, useEffect } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import type { ThemeMode } from '../themes/theme.types'

interface ThemeToggleCompactProps {
  className?: string
}

const OPTIONS: { mode: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { mode: 'light', label: 'Claro', icon: Sun },
  { mode: 'dark', label: 'Escuro', icon: Moon },
  { mode: 'system', label: 'Sistema', icon: Monitor },
]

export const ThemeToggleCompact: React.FC<ThemeToggleCompactProps> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div
      role="radiogroup"
      aria-label="Seletor de Modo Visual"
      data-testid="disk-theme-toggle-compact"
      className={`inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/60 p-0.5 text-xs select-none ${className}`}
    >
      {OPTIONS.map((opt) => {
        const isSelected = theme === opt.mode
        const Icon = opt.icon
        return (
          <button
            key={opt.mode}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setTheme(opt.mode)}
            data-testid={`theme-toggle-${opt.mode}`}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors cursor-pointer ${
              isSelected
                ? 'bg-card text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 font-medium'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-500' : 'opacity-70'}`} />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

