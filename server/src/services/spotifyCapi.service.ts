import crypto from 'node:crypto'
import type {
  SpotifyCapiIntegration,
  SpotifyConversionEventItem,
  SpotifyFunnelReport,
  SpotifyCapiDiagnostics,
  SpotifyCapiCanonicalEvent,
  CapiEventStatus
} from '../domain/marketing/spotifyCapi.js'

// Armazenamento em memória para CAPI integrations e eventos
const capiIntegrationsMap = new Map<number, SpotifyCapiIntegration>()
const conversionEventsMap = new Map<number, SpotifyConversionEventItem[]>()

// Inicializador para produtora DiskIngressos (ID 1)
capiIntegrationsMap.set(1, {
  id: 'capi-int-01',
  producerId: 1,
  producerName: 'DiskIngressos Produções',
  businessId: 'sp_biz_94827103',
  datasetId: 'sp_dataset_ecommerce_01',
  datasetName: 'DiskIngressos Ecommerce Dataset',
  capiConnectionId: '8f92a10b-44c1-4b11-912a-77e8a91c49b0',
  status: 'ACTIVE',
  tokenMasked: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9••••••••••••7F4B',
  tokenCreatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  lastEventAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  lastSuccessAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  lastErrorAt: null,
  totalEventsReceived: 12845,
  receivedEventTypes: ['VIEW', 'PRODUCT', 'ADD_TO_CART', 'CHECK_OUT', 'PURCHASE']
})

// Mock de eventos de conversão enviados para produtora 1
conversionEventsMap.set(1, [
  {
    id: 'evt-01',
    eventId: 1,
    eventName: 'Festival Curitiba 2026',
    orderId: 1042,
    orderCode: 'PED-928773',
    capiEventType: 'PURCHASE',
    eventTimeIso: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    deterministicEventId: 'spotify:purchase:PED-928773',
    amountBrl: 480.00,
    currency: 'BRL',
    status: 'SENT',
    attemptCount: 1,
    providerResponseCode: 200,
    providerTraceId: 'sp_trc_928173491028',
    actionSource: 'WEB',
    sentAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    confirmedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    campaignName: 'Spot Áudio 30s Venda Geral',
    utmSource: 'spotify'
  },
  {
    id: 'evt-02',
    eventId: 1,
    eventName: 'Festival Curitiba 2026',
    orderId: 1041,
    orderCode: 'PED-928770',
    capiEventType: 'CHECK_OUT',
    eventTimeIso: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    deterministicEventId: 'spotify:checkout:PED-928770',
    amountBrl: 320.00,
    currency: 'BRL',
    status: 'SENT',
    attemptCount: 1,
    providerResponseCode: 200,
    providerTraceId: 'sp_trc_928173490912',
    actionSource: 'WEB',
    sentAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    confirmedAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    campaignName: 'Spot Áudio 30s Venda Geral',
    utmSource: 'spotify'
  },
  {
    id: 'evt-03',
    eventId: 1,
    eventName: 'Festival Curitiba 2026',
    capiEventType: 'ADD_TO_CART',
    eventTimeIso: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    deterministicEventId: 'spotify:cart:cart-884129',
    amountBrl: 190.00,
    currency: 'BRL',
    status: 'SENT',
    attemptCount: 1,
    providerResponseCode: 200,
    actionSource: 'WEB',
    sentAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    confirmedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    campaignName: 'Spot Áudio 30s Venda Geral',
    utmSource: 'spotify'
  },
  {
    id: 'evt-04',
    eventId: 1,
    eventName: 'Festival Curitiba 2026',
    capiEventType: 'PRODUCT',
    eventTimeIso: new Date(Date.now() - 1000 * 60 * 52).toISOString(),
    deterministicEventId: 'spotify:prod:view-setor-pista',
    amountBrl: 95.00,
    currency: 'BRL',
    status: 'SENT',
    attemptCount: 1,
    providerResponseCode: 200,
    actionSource: 'WEB',
    sentAt: new Date(Date.now() - 1000 * 60 * 52).toISOString(),
    confirmedAt: new Date(Date.now() - 1000 * 60 * 52).toISOString(),
    campaignName: 'Spot Áudio 30s Venda Geral',
    utmSource: 'spotify'
  }
])

export function getProducerCapiIntegration(producerId: number): SpotifyCapiIntegration {
  let integration = capiIntegrationsMap.get(producerId)
  if (!integration) {
    integration = {
      id: `capi-int-${producerId}`,
      producerId,
      businessId: `sp_biz_${producerId}`,
      datasetId: `sp_dataset_${producerId}`,
      datasetName: `Dataset Produtora #${producerId}`,
      capiConnectionId: crypto.randomUUID(),
      status: 'ACTIVE',
      tokenMasked: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9••••••••••••7F4B',
      tokenCreatedAt: new Date().toISOString(),
      lastEventAt: new Date().toISOString(),
      lastSuccessAt: new Date().toISOString(),
      lastErrorAt: null,
      totalEventsReceived: 1420,
      receivedEventTypes: ['VIEW', 'PRODUCT', 'ADD_TO_CART', 'CHECK_OUT', 'PURCHASE']
    }
    capiIntegrationsMap.set(producerId, integration)
  }
  return integration
}

export function listProducerConversionEvents(producerId: number, eventId?: number): SpotifyConversionEventItem[] {
  const all = conversionEventsMap.get(producerId) || []
  if (!eventId) return all
  return all.filter(e => e.eventId === eventId)
}

export function getProducerFunnelReport(producerId: number, eventId: number, eventName = 'Festival Curitiba'): SpotifyFunnelReport {
  const clicks = 28421
  const views = 21824
  const carts = 4240
  const checkouts = 2180
  const purchases = 1284
  const revenue = 24100.00
  const cpa = purchases > 0 ? Number((5000 / purchases).toFixed(2)) : 0
  const roas = Number((revenue / 5000).toFixed(2))
  const ticket = purchases > 0 ? Number((revenue / purchases).toFixed(2)) : 0

  return {
    eventId,
    eventName,
    period: 'Últimos 30 Dias',
    totalClicks: clicks,
    totalViews: views,
    totalCart: carts,
    totalCheckout: checkouts,
    totalPurchases: purchases,
    totalRevenueBrl: revenue,
    cpaBrl: cpa,
    roas,
    averageTicketBrl: ticket,
    stages: [
      {
        stageKey: 'clicks',
        label: '1. Cliques no Companion Banner',
        count: clicks,
        previousStepConversionPercent: 100,
        overallConversionPercent: 100
      },
      {
        stageKey: 'views',
        label: '2. Visualizações da Página do Show',
        count: views,
        previousStepConversionPercent: Number(((views / clicks) * 100).toFixed(1)),
        overallConversionPercent: Number(((views / clicks) * 100).toFixed(1))
      },
      {
        stageKey: 'cart',
        label: '3. Ingressos Adicionados ao Carrinho',
        count: carts,
        previousStepConversionPercent: Number(((carts / views) * 100).toFixed(1)),
        overallConversionPercent: Number(((carts / clicks) * 100).toFixed(1))
      },
      {
        stageKey: 'checkout',
        label: '4. Checkouts Iniciados',
        count: checkouts,
        previousStepConversionPercent: Number(((checkouts / carts) * 100).toFixed(1)),
        overallConversionPercent: Number(((checkouts / clicks) * 100).toFixed(1))
      },
      {
        stageKey: 'purchase',
        label: '5. Ingressos Comprados (Pagos)',
        count: purchases,
        previousStepConversionPercent: Number(((purchases / checkouts) * 100).toFixed(1)),
        overallConversionPercent: Number(((purchases / clicks) * 100).toFixed(2))
      }
    ]
  }
}

export function getProducerCapiDiagnostics(producerId: number): SpotifyCapiDiagnostics {
  const events = conversionEventsMap.get(producerId) || []
  const breakdown: Record<SpotifyCapiCanonicalEvent, number> = {
    VIEW: 6240,
    PRODUCT: 3410,
    ADD_TO_CART: 1820,
    CHECK_OUT: 980,
    PURCHASE: 395,
    LEAD: 0,
    SIGN_UP: 0
  }

  return {
    totalSent: 12845,
    totalSuccess: 12721,
    totalFailed: 124,
    successRatePercent: 99.03,
    deadLetterCount: 0,
    activeTokensCount: 1,
    lastPingTime: new Date().toISOString(),
    receivedBreakdown: breakdown
  }
}

export function retryProducerConversionEvent(eventId: string, producerId: number): { ok: boolean; message: string } {
  const list = conversionEventsMap.get(producerId) || []
  const target = list.find(e => e.id === eventId)
  if (!target) {
    throw new Error('Evento de conversão não encontrado.')
  }

  target.status = 'SENT'
  target.attemptCount += 1
  target.sentAt = new Date().toISOString()
  target.confirmedAt = new Date().toISOString()

  return {
    ok: true,
    message: `Evento ${target.deterministicEventId} reprocessado e enviado com sucesso ao Spotify CAPI.`
  }
}
