import type {
  SpotifyReportMetrics,
  EntityPerformanceRow,
  SpotifyAttributionComparison,
  AudienceInsightBreakdownItem
} from '../domain/marketing/spotifyReporting.js'
import {
  safeRoas,
  safeCpa,
  safeCtr,
  safeCpc,
  safeCpm,
  safeAov,
  normalizeSpotifyPrivacyMetric
} from '../domain/marketing/spotifyReporting.js'

export function getSpotifyReportingOverview(producerId: number, eventId?: number): {
  metrics: SpotifyReportMetrics
  comparisons: SpotifyAttributionComparison[]
} {
  const spendCents = 500000 // R$ 5.000,00
  const impressions = 1284520
  const reach = 645720 // Deduplicado via Aggregated Totals
  const frequency = 1.99
  const clicks = 28421
  const purchases = 1284
  const revenueCents = 2410000 // R$ 24.100,00

  const metrics: SpotifyReportMetrics = {
    impressions,
    reach,
    frequency,
    clicks,
    spendCents,
    purchases,
    revenueCents,
    ctrPercent: safeCtr(clicks, impressions),
    cpcCents: safeCpc(spendCents, clicks),
    cpmCents: safeCpm(spendCents, impressions),
    cpaCents: safeCpa(spendCents, purchases),
    roas: safeRoas(revenueCents, spendCents),
    averageOrderValueCents: safeAov(revenueCents, purchases),
    privacySuppressedPurchases: false
  }

  const comparisons: SpotifyAttributionComparison[] = [
    {
      metricLabel: 'Compras (Conversões)',
      spotifyAttributedValue: '1.284',
      safesaffInternalValue: '1.243',
      divergencePercent: 3.3,
      explanation: 'O Spotify utiliza janela de clique de 7 dias e visualização de 1 dia; o SafeSaff utiliza modelo determinístico de último clique (Last Touch).'
    },
    {
      metricLabel: 'Receita de Ingressos',
      spotifyAttributedValue: 'R$ 24.100,00',
      safesaffInternalValue: 'R$ 23.480,00',
      divergencePercent: 2.64,
      explanation: 'Pequena diferença decorrente de pedidos multi-sessão e compras cruzadas entre dispositivos.'
    },
    {
      metricLabel: 'ROAS Médio',
      spotifyAttributedValue: '4,82x',
      safesaffInternalValue: '4,70x',
      divergencePercent: 2.55,
      explanation: 'Ambas as medições confirmam alto retorno sobre o investimento publicitário em áudio oficial.'
    }
  ]

  return { metrics, comparisons }
}

export function getSpotifyReportingBreakdown(producerId: number, eventId?: number): EntityPerformanceRow[] {
  return [
    {
      entityId: 'cmp-01',
      entityType: 'CAMPAIGN',
      name: 'Spot Áudio 30s — Lote VIP e Pista Premium',
      statusLabel: 'Ativa',
      badgeColor: '#1DB954',
      metrics: {
        impressions: 742000,
        reach: 410000,
        frequency: 1.81,
        clicks: 16820,
        spendCents: 310000,
        purchases: 820,
        revenueCents: 1640000,
        ctrPercent: 2.27,
        cpcCents: 184,
        cpmCents: 418,
        cpaCents: 378,
        roas: 5.29,
        averageOrderValueCents: 2000
      }
    },
    {
      entityId: 'cmp-02',
      entityType: 'CAMPAIGN',
      name: 'Spot Áudio 15s — Virada de Lote 48h',
      statusLabel: 'Ativa',
      badgeColor: '#1DB954',
      metrics: {
        impressions: 542520,
        reach: 235720,
        frequency: 2.30,
        clicks: 11601,
        spendCents: 190000,
        purchases: 464,
        revenueCents: 770000,
        ctrPercent: 2.14,
        cpcCents: 164,
        cpmCents: 350,
        cpaCents: 409,
        roas: 4.05,
        averageOrderValueCents: 1659
      }
    }
  ]
}

export function getSpotifyAudienceInsights(producerId: number, eventId: number): {
  hasSufficientData: boolean
  insights: AudienceInsightBreakdownItem[]
  privacyNote?: string
} {
  return {
    hasSufficientData: true,
    insights: [
      {
        dimension: 'Gênero Musical',
        category: 'Sertanejo Universitário',
        impressionsSharePercent: 44.5,
        clicksSharePercent: 51.2,
        conversionsSharePercent: 58.0,
        indexEfficiency: 130.3
      },
      {
        dimension: 'Gênero Musical',
        category: 'Pop Nacional',
        impressionsSharePercent: 32.0,
        clicksSharePercent: 29.8,
        conversionsSharePercent: 26.5,
        indexEfficiency: 82.8
      },
      {
        dimension: 'Faixa Etária',
        category: '25-34 anos',
        impressionsSharePercent: 48.0,
        clicksSharePercent: 54.0,
        conversionsSharePercent: 62.4,
        indexEfficiency: 130.0
      },
      {
        dimension: 'Faixa Etária',
        category: '18-24 anos',
        impressionsSharePercent: 34.0,
        clicksSharePercent: 31.0,
        conversionsSharePercent: 25.1,
        indexEfficiency: 73.8
      }
    ]
  }
}
