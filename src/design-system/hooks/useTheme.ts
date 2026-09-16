import { useContext } from 'react'
import { ThemeContext } from '../providers/ThemeProvider'
import type { ThemeContextValue } from '../themes/theme.types'

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um <ThemeProvider>')
  }
  return context
}
