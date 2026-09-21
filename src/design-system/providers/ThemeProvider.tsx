import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react'
import type { ThemeMode, ResolvedTheme, ThemeContextValue } from '../themes/theme.types'
import { THEME_STORAGE_KEY, DEFAULT_THEME } from '../themes/theme.constants'

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    const item = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (item === 'light' || item === 'dark' || item === 'system') {
      return item
    }
  } catch {
    // Falha silenciosa no acesso ao localStorage
  }
  return DEFAULT_THEME
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme)
  const [systemPreference, setSystemPreference] = useState<ResolvedTheme>(getSystemPreference)

  // Escutar alterações na preferência do sistema operacional
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light')
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else if ('addListener' in mediaQuery) {
      // Fallback para navegadores legados
      const legacyQuery = mediaQuery as { addListener: (fn: (e: MediaQueryListEvent) => void) => void; removeListener: (fn: (e: MediaQueryListEvent) => void) => void }
      legacyQuery.addListener(handleChange)
      return () => legacyQuery.removeListener(handleChange)
    }
  }, [])

  // Tema resolvido (claro ou escuro)
  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return systemPreference
    }
    return theme
  }, [theme, systemPreference])

  // Aplicar classes no DOM (evitando FOUC e sincronizando com Tailwind / CSS)
  useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
    root.style.colorScheme = resolvedTheme
    root.setAttribute('data-theme', resolvedTheme)

    // Atualizar meta theme-color para navegadores mobile
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#0D1218' : '#F8FAFC')
    }
  }, [resolvedTheme])

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode)
    } catch (e) {
      console.warn('Não foi possível salvar a preferência de tema no localStorage:', e)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      let next: ThemeMode
      if (current === 'light') next = 'dark'
      else if (current === 'dark') next = 'system'
      else next = 'light'

      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next)
      } catch (e) {
        console.warn('Não foi possível salvar a preferência de tema no localStorage:', e)
      }
      return next
    })
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
