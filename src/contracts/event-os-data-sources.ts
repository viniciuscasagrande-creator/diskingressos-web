/**
 * Registro oficial de fontes da verdade (Data Source Registry) do Event OS.
 * Fase 26.17.3 — API Contract & Real Data Integration
 */

export interface DataSourceDefinition {
  metric: string
  module: string
  primarySource: string
  realTime: boolean
  tenantSecured: boolean
  description: string
  isProtected: boolean
}

export const DATA_SOURCE_REGISTRY: DataSourceDefinition[] = [
  {
    metric: 'Receita Bruta / Líquida',
    module: 'Revenue Intelligence',
    primarySource: 'Order / Transaction (aprovados)',
    realTime: true,
    tenantSecured: true,
    description: 'Consolidação direta das ordens de compra transacionadas no banco.',
    isProtected: true
  },
  {
    metric: 'Ingressos Vendidos',
    module: 'Inventário / Vendas',
    primarySource: 'Ticket / OrderItem',
    realTime: true,
    tenantSecured: true,
    description: 'Contagem oficial de ingressos emitidos e quitados.',
    isProtected: true
  },
  {
    metric: 'Check-ins / Presença',
    module: 'Live Operations',
    primarySource: 'CheckIn / AccessScan',
    realTime: true,
    tenantSecured: true,
    description: 'Registros de catraca e coletores validados nos portões.',
    isProtected: false
  },
  {
    metric: 'Capacidade & Lotes',
    module: 'Inventário',
    primarySource: 'InventoryLot / InventoryHold',
    realTime: true,
    tenantSecured: true,
    description: 'Capacidade alocada, holds e disponibilidade por setor.',
    isProtected: false
  },
  {
    metric: 'Estornos & Chargebacks',
    module: 'Estornos (/app/finance-refunds)',
    primarySource: 'RefundRequest / Dispute',
    realTime: true,
    tenantSecured: true,
    description: 'Fluxo oficial independente de estornos e disputas.',
    isProtected: true
  },
  {
    metric: 'Incidentes Operacionais',
    module: 'Incident Center',
    primarySource: 'EventIncident',
    realTime: true,
    tenantSecured: true,
    description: 'Ocorrências técnicas de acesso, bilheteria e infraestrutura.',
    isProtected: false
  },
  {
    metric: 'Previsões Comerciais',
    module: 'Forecast Center',
    primarySource: 'EventForecastSnapshot',
    realTime: true,
    tenantSecured: true,
    description: 'Projeção determinística de esgotamento e curva de vendas.',
    isProtected: false
  },
  {
    metric: 'Índice de Saúde & Insights',
    module: 'Disk Intelligence',
    primarySource: 'IntelligenceInsight',
    realTime: true,
    tenantSecured: true,
    description: 'Camada de síntese analítica baseada em sinais operacionais reais.',
    isProtected: false
  }
]
