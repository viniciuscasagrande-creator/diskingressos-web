// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// Utilitários Universais de Formatação pt-BR
// ==============================================================================

/**
 * Formata um valor numérico para Moeda Brasileira (R$ 1.250,00).
 */
export function formatCurrencyBRL(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00'
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formata um número inteiro ou decimal no padrão brasileiro (1.420 ou 1.420,5).
 */
export function formatNumberBR(
  value: number | null | undefined,
  decimals: number = 0
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Formata uma taxa percentual com sinal explícito opcional (+12,4% ou -3,5%).
 */
export function formatPercentBR(
  value: number | null | undefined,
  includeSign: boolean = false,
  decimals: number = 1
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,0%'
  }
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value))

  if (includeSign) {
    const sign = value > 0 ? '+' : value < 0 ? '-' : ''
    return `${sign}${formatted}%`
  }

  return `${value < 0 ? '-' : ''}${formatted}%`
}

/**
 * Formata uma data ou timestamp para formato legível no Brasil (DD/MM/AAAA ou DD/MM/AAAA HH:mm).
 */
export function formatDateBR(
  dateInput: string | number | Date | null | undefined,
  includeTime: boolean = false
): string {
  if (!dateInput) return '-'
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput
    if (isNaN(d.getTime())) return '-'

    if (includeTime) {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d)
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d)
  } catch {
    return '-'
  }
}
