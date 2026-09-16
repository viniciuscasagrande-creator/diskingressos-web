import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

interface ThemeToggleCompactProps {
  className?: string
}

export const ThemeToggleCompact: React.FC<ThemeToggleCompactProps> = ({ className = '' }) => {
  const { theme, resolvedTheme, toggleTheme } = useTheme()

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-4 h-4 text-orange-500" />
    }
    if (resolvedTheme === 'dark') {
      return <Moon className="w-4 h-4 text-orange-400" />
    }
    return <Sun className="w-4 h-4 text-orange-500" />
  }

  const getLabel = () => {
    if (theme === 'system') return 'Modo Sistema (Automático)'
    if (theme === 'dark') return 'Modo Escuro'
    return 'Modo Claro'
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`${getLabel()} — Clique para alternar`}
      aria-label={getLabel()}
      data-testid="disk-theme-toggle-compact"
      className={`p-2 rounded-xl transition border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 shadow-sm flex items-center justify-center ${className}`}
    >
      {getIcon()}
    </button>
  )
}
