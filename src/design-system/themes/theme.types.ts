/**
 * Tipos Oficiais do Sistema de Temas Disk
 * Padrão: Claro (light), Escuro (dark) e Sistema (system)
 */

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeOption {
  value: ThemeMode
  label: string
  description: string
}

export interface ThemeContextValue {
  theme: ThemeMode
  resolvedTheme: ResolvedTheme
  setTheme: (mode: ThemeMode) => void
  toggleTheme: () => void
}
