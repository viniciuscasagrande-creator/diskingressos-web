export const SPOTIFY_ADS_RELEASE = '26.17.10-spotify-ads-attribution-2026-09-11'

export type SpotifyConnectionStatus = 
  | 'CONECTADO' 
  | 'DESCONECTADO' 
  | 'TOKEN_EXPIRADO' 
  | 'ERRO_SINCRONIZACAO'

export interface SpotifyConnection {
  producerId: number
  producerName?: string
  businessId: string
  adAccountId: string
  adAccountName: string
  status: SpotifyConnectionStatus
  tokenMasked: string
  tokenLast4?: string
  lastSyncAt: string | null
  connectedAt: string
  autoSyncEnabled: boolean
  currency: string
  timezone: string
}

export type SpotifyCampaignObjective = 'TICKET_SALES' | 'REACH' | 'TRAFFIC'

export type SpotifyCampaignWorkflowStatus = 
  | 'DRAFT' 
  | 'PENDING_INTERNAL_APPROVAL' 
  | 'READY_TO_PUBLISH' 
  | 'ACTIVE' 
  | 'PAUSED' 
  | 'COMPLETED'

export type SpotifyBidStrategy = 'AUTO_CPM' | 'TARGET_CPA' | 'MANUAL_CPC'

export interface SpotifyLocationTarget {
  state: string
  city?: string
  radiusKm?: number
}

export interface SpotifyAudienceTargeting {
  musicGenres: string[]
  relatedArtists: string[]
  playlistAffinities: string[]
  locations: SpotifyLocationTarget[]
  ageRanges: string[]
  genders: 'ALL' | 'MALE' | 'FEMALE'
  platforms: Array<'IOS' | 'ANDROID' | 'DESKTOP' | 'WEB'>
  copilotSuggested: boolean
  copilotRationale?: string
}

export interface SpotifyAudienceForecast {
  potentialReachMin: number
  potentialReachMax: number
  weeklyImpressionsMin: number
  weeklyImpressionsMax: number
  estimatedFrequency: number
  recommendedDailyBudgetCents: number
  audienceQualityScore: number
}

export interface SpotifyCreative {
  audioSpotUrl: string
  audioTitle: string
  audioDurationSeconds: 15 | 30
  companionImageUrl: string
  brandLogoUrl: string
  brandName: string
  headline: string
  callToAction: 'Garantir Ingresso' | 'Comprar Agora' | 'Ouvir Agora' | 'Saiba Mais'
  destinationUrl: string
  trackedDestinationUrl: string
}

export interface SpotifyCampaignMetrics {
  spentCents: number
  audioImpressions: number
  companionClicks: number
  ctrPercent: number
  completionRatePercent: number
  conversions: number
  revenueCents: number
  cpaCents: number
  roas: number
}

export interface SpotifyCampaign {
  id: string
  code: string
  producerId: number
  eventId: number
  eventName: string
  name: string
  objective: SpotifyCampaignObjective
  objectiveLabel: string
  status: SpotifyCampaignWorkflowStatus
  statusLabel: string
  budgetCents: number
  dailyBudgetCents: number
  bidStrategy: SpotifyBidStrategy
  startsAt: string
  endsAt: string
  externalCampaignId?: string
  targeting: SpotifyAudienceTargeting
  creative: SpotifyCreative
  forecast?: SpotifyAudienceForecast
  metrics: SpotifyCampaignMetrics
  createdAt: string
  updatedAt: string
}

export interface SpotifyTimeSeriesPoint {
  date: string
  audioImpressions: number
  companionClicks: number
  conversions: number
  spentCents: number
  revenueCents: number
}

export interface SpotifyEventPerformanceDashboard {
  eventId: number
  eventName: string
  producerId: number
  connection: SpotifyConnection
  summary: SpotifyCampaignMetrics
  timeSeries: SpotifyTimeSeriesPoint[]
  campaigns: SpotifyCampaign[]
  activeCampaignsCount: number
  audioSpotsCount: number
}

export interface SpotifyAttributedSale {
  orderId: number
  orderCode: string
  buyerName: string
  buyerEmail: string
  buyerPhone?: string
  ticketSummary: string
  grossCents: number
  paymentMethod: string
  paidAt: string
  campaignName: string
  campaignCode: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent?: string
}

export interface SpotifyCapiLogItem {
  id: string
  occurredAt: string
  canonicalEvent: string
  spotifyCapiEvent: 'VIEW' | 'PRODUCT' | 'ADDTOCART' | 'CHECKOUT' | 'PURCHASE' | 'LEAD' | 'SIGN_UP'
  status: 'ok' | 'queued' | 'dry_run' | 'erro'
  httpCode: number
  orderCode?: string
  valueBrl?: number
  message: string
}

export interface OmnichannelChannelMetrics {
  channelKey: 'spotify' | 'meta' | 'google' | 'tiktok'
  channelName: string
  family: 'audio' | 'social' | 'search' | 'video'
  badgeColor: string
  spentCents: number
  impressions: number
  clicks: number
  ctrPercent: number
  conversions: number
  revenueCents: number
  cpaCents: number
  roas: number
  shareOfSalesPercent: number
}

export interface OmnichannelPerformanceReport {
  eventId: number
  eventName: string
  producerId: number
  period: string
  totalInvestedCents: number
  totalRevenueCents: number
  totalConversions: number
  overallRoas: number
  channels: OmnichannelChannelMetrics[]
}

export const SPOTIFY_CANONICAL_GENRES = [
  'Sertanejo Universitário',
  'Sertanejo Raiz',
  'Pop Nacional',
  'Pop Internacional',
  'Rock / Indie',
  'Funk Carioca / BH',
  'Eletrônica / House / Techno',
  'Pagode & Samba',
  'Rap, Trap & Hip Hop',
  'Forró & Piseiro',
  'MPB & Reggae'
] as const

export const SPOTIFY_AGE_RANGES = [
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55+'
] as const

export const formatSpotifyBrl = (cents: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
