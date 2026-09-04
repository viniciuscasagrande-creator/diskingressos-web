/**
 * Mapeamento padronizado de status para Português do Brasil (pt-BR).
 * Fase 26.17.3.1 — Padronização Total PT-BR
 */

export const STATUS_LABELS: Record<string, string> = {
  // Saúde / Health
  HEALTHY: 'Saudável',
  DEGRADED: 'Degradado',
  CRITICAL: 'Crítico',
  UNKNOWN: 'Desconhecido',
  STABLE: 'Estável',

  // Ciclo de Incidentes / Chamados
  OPEN: 'Aberto',
  CLOSED: 'Encerrado',
  RESOLVED: 'Resolvido',
  REOPENED: 'Reaberto',
  IN_ANALYSIS: 'Em Análise',

  // Transações / Pedidos
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  FAILED: 'Falhou',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Estornado',
  DISPUTED: 'Em Disputa',

  // Operação / Atividade
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  AVAILABLE: 'Disponível',
  UNAVAILABLE: 'Indisponível',
  PAUSED: 'Pausado',

  // Conectividade (Termos consolidados no vocabulário técnico)
  ONLINE: 'Online',
  OFFLINE: 'Offline'
}

export function translateStatus(status: string | null | undefined): string {
  if (!status) return '—'
  const upper = status.toUpperCase().trim()
  return STATUS_LABELS[upper] || status
}
