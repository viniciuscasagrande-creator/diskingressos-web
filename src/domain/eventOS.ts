export const EVENT_OS_RELEASE = '26.3-customer-360-crm-2026-09-03'

export type EventOSArea =
  | 'command' | 'sales' | 'inventory' | 'customers' | 'finance' | 'marketing'
  | 'recovery' | 'access' | 'support' | 'risk' | 'analytics' | 'governance'

export type EventOSModule = {
  key: EventOSArea
  name: string
  purpose: string
  criticality: 'core' | 'high' | 'standard'
}

export const EVENT_OS_MODULES: EventOSModule[] = [
  { key: 'command', name: 'Event Command Center', purpose: 'Saúde, prontidão, alertas e atividade operacional em tempo real.', criticality: 'core' },
  { key: 'sales', name: 'Vendas & Pedidos', purpose: 'Pedidos, pagamentos, canais, conversão e receita do evento.', criticality: 'core' },
  { key: 'inventory', name: 'Inventory Engine', purpose: 'Lotes, setores, capacidade, disponibilidade, holds e cortesias.', criticality: 'core' },
  { key: 'customers', name: 'Customer 360', purpose: 'Participantes, histórico, segmentação, RFM e first-party data.', criticality: 'high' },
  { key: 'finance', name: 'Finance Event Ledger', purpose: 'Ledger, split, recebíveis, repasses, estornos e conciliação por evento.', criticality: 'core' },
  { key: 'marketing', name: 'Growth & Attribution', purpose: 'Campanhas, pixels, UTMs, conversões, atribuição e ROAS.', criticality: 'high' },
  { key: 'recovery', name: 'Recovery Engine', purpose: 'Carrinho, pagamento pendente e recuperação multicanal automatizada.', criticality: 'high' },
  { key: 'access', name: 'Live Event Operations', purpose: 'Check-in, portões, capacidade, fraude de acesso e ritmo de entrada.', criticality: 'core' },
  { key: 'support', name: 'SAC & Incident Center', purpose: 'SLA, incidentes, atendimento e coordenação operacional.', criticality: 'high' },
  { key: 'risk', name: 'Risk & Fraud', purpose: 'Chargebacks, anomalias, exposição financeira e segurança transacional.', criticality: 'high' },
  { key: 'analytics', name: 'Analytics & Intelligence', purpose: 'BI, forecast, benchmark e recomendações operacionais.', criticality: 'high' },
  { key: 'governance', name: 'Governança & Auditoria', purpose: 'RBAC, logs, trilha de alterações e segregação de funções.', criticality: 'core' },
]

export const EVENT_OS_PRINCIPLES = [
  'event_id é o contexto operacional central do PDT.',
  'producer_id é sempre derivado da autenticação para perfis não globais.',
  'Toda mutação crítica gera trilha de auditoria.',
  'Financeiro usa ledger imutável e lançamentos compensatórios.',
  'Frontend público vende; PDT opera e governa o ciclo completo do evento.',
  'Módulos compartilham eventos de domínio e não duplicam a fonte de verdade.',
] as const

export function healthBand(score: number) {
  if (score >= 85) return { key: 'healthy', label: 'Saudável' }
  if (score >= 65) return { key: 'attention', label: 'Atenção' }
  return { key: 'critical', label: 'Crítico' }
}
