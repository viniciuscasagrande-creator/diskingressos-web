import React from 'react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import type { ThemeMode } from '../themes/theme.types'

interface ThemeSwitcherProps {
  variant?: 'segmented' | 'dropdown' | 'cards'
  showLabels?: boolean
  className?: string
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'segmented',
  showLabels = true,
  className = ''
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      mode: 'light',
      label: 'Claro',
      icon: <Sun className="w-4 h-4" />,
      desc: 'Tema claro institucional com alto contraste'
    },
    {
      mode: 'dark',
      label: 'Escuro',
      icon: <Moon className="w-4 h-4" />,
      desc: 'Tema escuro focado em imersão e produtividade'
    },
    {
      mode: 'system',
      label: 'Sistema',
      icon: <Monitor className="w-4 h-4" />,
      desc: 'Segue automaticamente a preferência do dispositivo'
    }
  ]

  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`} data-testid="disk-theme-switcher-cards">
        {options.map((opt) => {
          const isSelected = theme === opt.mode
          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => setTheme(opt.mode)}
              data-testid={`theme-btn-${opt.mode}`}
              className={`p-4 rounded-xl text-left border transition-all relative ${
                isSelected
                  ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-sm ring-1 ring-orange-500'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {opt.icon}
                </div>
                {isSelected && (
                  <span className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400">
                    <Check className="w-3.5 h-3.5" /> Ativo
                  </span>
                )}
              </div>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{opt.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label="Seletor de Modo Visual"
      data-testid="disk-theme-switcher"
      className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 ${className}`}
    >
      {options.map((opt) => {
        const isSelected = theme === opt.mode
        return (
          <button
            key={opt.mode}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setTheme(opt.mode)}
            data-testid={`theme-btn-${opt.mode}`}
            title={`${opt.label} (${opt.desc})`}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isSelected
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200/60 dark:border-slate-700/50'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-700/40 border border-transparent'
            }`}
          >
            {opt.icon}
            {showLabels && <span>{opt.label}</span>}
          </button>
        )
      })}
    </div>
  )
}
