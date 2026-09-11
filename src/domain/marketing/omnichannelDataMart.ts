/**
 * FASE 28.10 — DASHBOARD OMNICHANNEL (META + GOOGLE + TIKTOK + SPOTIFY)
 * 
 * Camada analítica unificada da DiskIngressos:
 * - Adapters independentes para cada canal de mídia
 * - ROAS consolidado calculado estritamente como Σ Receita / Σ Investimento (NUNCA média de ROAS)
 * - CTR consolidado como Σ Cliques / Σ Impressões × 100
 * - CPA consolidado como Σ Investimento / Σ Compras
 * - Alcance cross-channel reportado sem soma ingênua de pessoas únicas
 * - Matriz de Desempenho (Escalar, Manter, Otimizar, Reduzir)
 */

export type MarketingChannelKey = 'META' | 'GOOGLE' | 'TIKTOK' | 'SPOTIFY'

export interface ChannelPerformanceItem {
  channelKey: MarketingChannelKey
  channelName: string
  family: 'social' | 'search' | 'video' | 'audio'
  badgeColor: string
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'SYNCING'
  lastSyncAt: string
  spentCents: number
  impressions: number
  clicks: number
  ctrPercent: number
  purchases: number
  revenueCents: number
  cpaCents: number
  roas: number
  shareOfSpendPercent: number
  shareOfRevenuePercent: number
}

export interface OmnichannelPerformanceMatrixItem {
  entityName: string
  channel: MarketingChannelKey
  eventName: string
  spentBrl: number
  roas: number
  revenueBrl: number
  quadrant: 'ESCALAR' | 'MANTER' | 'OTIMIZAR' | 'REDUZIR'
  recommendationPtBr: string
}

export interface CrossChannelCampaignRankingItem {
  campaignName: string
  channel: MarketingChannelKey
  eventName: string
  spentCents: number
  purchases: number
  revenueCents: number
  roas: number
  cpaCents: number
}

export interface EventMarketingSummaryItem {
  eventId: number
  eventTitle: string
  producerName: string
  totalSpentCents: number
  totalRevenueCents: number
  totalPurchases: number
  totalTicketsSold: number
  overallRoas: number
  overallCpaCents: number
  topChannel: MarketingChannelKey
}

export interface OmnichannelExecutiveDashboard {
  periodLabel: string
  producerId?: number | null
  eventId?: number | null
  totalInvestedCents: number
  totalAttributedRevenueCents: number
  totalSafesaffRevenueCents: number
  totalPurchases: number
  totalTicketsSold: number
  overallRoas: number
  overallCpaCents: number
  overallCtrPercent: number
  totalImpressions: number
  totalClicks: number
  channels: ChannelPerformanceItem[]
  performanceMatrix: OmnichannelPerformanceMatrixItem[]
  topCampaigns: CrossChannelCampaignRankingItem[]
  eventSummaries: EventMarketingSummaryItem[]
  attributionCoveragePercent: number
  unattributedOrdersCount: number
}
