/**
 * FASE 28.8 — SPOTIFY CONVERSIONS API (CAPI) + FUNIL DISKINGRESSOS + ATRIBUIÇÃO
 * 
 * Regra Crítica: A CAPI funciona exclusivamente via backend seguro (PDT -> CAPI).
 * Tokens CAPI (JWT de longa duração) nunca trafegam no frontend e são criptografados com AES-256-GCM.
 */

export type CapiIntegrationStatus = 
  | 'ACTIVE' 
  | 'INACTIVE' 
  | 'ERROR' 
  | 'REVOKED' 
  | 'NOT_CONFIGURED'

export const CAPI_INTEGRATION_STATUS_LABELS: Record<CapiIntegrationStatus, { label: string; badgeClass: string }> = {
  ACTIVE: { label: 'Ativa & Conectada', badgeClass: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  INACTIVE: { label: 'Inativa', badgeClass: 'bg-slate-800 text-slate-400 border-slate-700' },
  ERROR: { label: 'Falha de comunicação', badgeClass: 'bg-rose-950 text-rose-400 border-rose-800' },
  REVOKED: { label: 'Token revogado', badgeClass: 'bg-amber-950 text-amber-400 border-amber-800' },
  NOT_CONFIGURED: { label: 'Não configurada', badgeClass: 'bg-slate-800 text-slate-500 border-slate-700' }
}

export type SpotifyCapiCanonicalEvent = 
  | 'VIEW'
  | 'PRODUCT'
  | 'ADD_TO_CART'
  | 'CHECK_OUT'
  | 'PURCHASE'
  | 'LEAD'
  | 'SIGN_UP'

export type CapiActionSource = 'WEB' | 'APP' | 'OFFLINE'

export type CapiEventStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'SENT' 
  | 'FAILED' 
  | 'RETRY' 
  | 'DISCARDED' 
  | 'DEAD_LETTER'

export const CAPI_EVENT_STATUS_LABELS: Record<CapiEventStatus, { label: string; badgeClass: string }> = {
  PENDING: { label: 'Pendente', badgeClass: 'bg-slate-800 text-slate-300 border-slate-700' },
  PROCESSING: { label: 'Enviando...', badgeClass: 'bg-blue-950 text-blue-400 border-blue-800 animate-pulse' },
  SENT: { label: 'Enviado com sucesso', badgeClass: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  FAILED: { label: 'Falha no envio', badgeClass: 'bg-rose-950 text-rose-400 border-rose-800' },
  RETRY: { label: 'Em retentativa', badgeClass: 'bg-amber-950 text-amber-400 border-amber-800' },
  DISCARDED: { label: 'Descartado', badgeClass: 'bg-slate-800 text-slate-500 border-slate-700' },
  DEAD_LETTER: { label: 'Fila morta (Dead Letter)', badgeClass: 'bg-red-950 text-red-400 border-red-800' }
}

export interface SpotifyCapiIntegration {
  id: string
  producerId: number
  producerName?: string
  businessId: string
  datasetId: string
  datasetName: string
  capiConnectionId: string
  status: CapiIntegrationStatus
  tokenMasked: string
  tokenCreatedAt: string
  lastEventAt: string | null
  lastSuccessAt: string | null
  lastErrorAt: string | null
  totalEventsReceived: number
  receivedEventTypes: SpotifyCapiCanonicalEvent[]
}

export interface SpotifyConversionEventItem {
  id: string
  eventId: number
  eventName: string
  orderId?: number
  orderCode?: string
  capiEventType: SpotifyCapiCanonicalEvent
  eventTimeIso: string
  deterministicEventId: string
  amountBrl: number
  currency: 'BRL'
  status: CapiEventStatus
  attemptCount: number
  providerResponseCode?: number
  providerTraceId?: string
  actionSource: CapiActionSource
  sentAt?: string
  confirmedAt?: string
  campaignName?: string
  utmSource?: string
}

export interface SpotifyFunnelStage {
  stageKey: 'clicks' | 'views' | 'cart' | 'checkout' | 'purchase'
  label: string
  count: number
  previousStepConversionPercent: number
  overallConversionPercent: number
}

export interface SpotifyFunnelReport {
  eventId: number
  eventName: string
  period: string
  totalClicks: number
  totalViews: number
  totalCart: number
  totalCheckout: number
  totalPurchases: number
  totalRevenueBrl: number
  cpaBrl: number
  roas: number
  averageTicketBrl: number
  stages: SpotifyFunnelStage[]
}

export interface SpotifyCapiDiagnostics {
  totalSent: number
  totalSuccess: number
  totalFailed: number
  successRatePercent: number
  deadLetterCount: number
  activeTokensCount: number
  lastPingTime: string
  receivedBreakdown: Record<SpotifyCapiCanonicalEvent, number>
}

/**
 * Adapter oficial para mapeamento de eventos internos DiskIngressos para Spotify CAPI
 * Suporta ambas as variações de nomenclatura documentadas pelo Spotify
 */
export function mapInternalToSpotifyCapi(internalEventType: string): SpotifyCapiCanonicalEvent {
  const norm = internalEventType.toUpperCase().trim()
  switch (norm) {
    case 'EVENT_VIEW':
    case 'VIEW_CONTENT':
    case 'PAGE_VIEW':
    case 'VIEW':
      return 'VIEW'

    case 'EVENT_PRODUCT_VIEW':
    case 'TICKET_VIEW':
    case 'PRODUCT':
      return 'PRODUCT'

    case 'EVENT_ADD_TO_CART':
    case 'ADD_TO_CART':
    case 'ADDTOCART':
      return 'ADD_TO_CART'

    case 'EVENT_CHECKOUT':
    case 'CHECKOUT_STARTED':
    case 'BEGIN_CHECKOUT':
    case 'CHECK_OUT':
    case 'CHECKOUT':
      return 'CHECK_OUT'

    case 'EVENT_PURCHASE':
    case 'ORDER_PAID':
    case 'PURCHASE':
      return 'PURCHASE'

    case 'LEAD':
      return 'LEAD'

    case 'SIGN_UP':
    case 'SIGNUP':
      return 'SIGN_UP'

    default:
      return 'VIEW'
  }
}
