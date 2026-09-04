/**
 * Formatadores padronizados PT-BR para o PDT DiskIngressos.
 * Fase 26.17.3.1 — Padronização Total PT-BR
 */

export function formatBRL(cents: number): string {
  if (typeof cents !== 'number' || isNaN(cents)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(cents / 100)
}

export function formatNumber(val: number): string {
  if (typeof val !== 'number' || isNaN(val)) return '0'
  return new Intl.NumberFormat('pt-BR').format(val)
}

export function formatPercent(val: number, decimals = 1): string {
  if (typeof val !== 'number' || isNaN(val)) return '0%'
  return `${val.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return String(date)
  return new Intl.DateTimeFormat('pt-BR').format(d)
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return String(date)
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(d)
}

export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return String(date)
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}
