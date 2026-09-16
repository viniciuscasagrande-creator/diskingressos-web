import type { ResolvedTheme } from './theme.types'

export interface ChartPalette {
  primary: string
  success: string
  info: string
  purple: string
  pink: string
  cyan: string
  grid: string
  axisText: string
  tooltipBg: string
  tooltipBorder: string
  tooltipText: string
}

export const LIGHT_CHART_PALETTE: ChartPalette = {
  primary: '#F97316', // Laranja Disk
  success: '#10B981', // Verde Esmeralda
  info: '#3B82F6',    // Azul Claro
  purple: '#8B5CF6',  // Roxo
  pink: '#EC4899',    // Rosa
  cyan: '#06B6D4',    // Ciano
  grid: '#E2E8F0',
  axisText: '#64748B',
  tooltipBg: '#FFFFFF',
  tooltipBorder: '#E2E8F0',
  tooltipText: '#0F172A'
}

export const DARK_CHART_PALETTE: ChartPalette = {
  primary: '#FB923C', // Laranja vibrante
  success: '#34D399', // Esmeralda suave
  info: '#60A5FA',    // Azul suave
  purple: '#A78BFA',  // Roxo suave
  pink: '#F472B6',    // Rosa suave
  cyan: '#22D3EE',    // Ciano suave
  grid: '#1F2937',
  axisText: '#94A3B8',
  tooltipBg: '#1F2937',
  tooltipBorder: '#374151',
  tooltipText: '#F8FAFC'
}

export function getChartPalette(resolvedTheme: ResolvedTheme): ChartPalette {
  return resolvedTheme === 'dark' ? DARK_CHART_PALETTE : LIGHT_CHART_PALETTE
}
