/**
 * FASE 28.9 — REPORTING REAL + ATRIBUIÇÃO AVANÇADA SPOTIFY ADS
 * 
 * Utiliza o modelo v3 atual da Ads API:
 * - Aggregate Report (entity_type: CAMPAIGN, AD_SET, AD)
 * - Aggregated Totals (para Reach e Frequência deduplicados)
 * - Proteção de privacidade: valores suprimidos (-5) não entram em somas aritméticas
 * - Duas camadas de atribuição: Atribuição Spotify vs Atribuição SafeSaff (UTM / Pedidos)
 */

export interface SpotifyReportMetrics {
  impressions: number
  reach: number
  frequency: number
  clicks: number
  spendCents: number
  purchases: number
  revenueCents: number
  ctrPercent: number
  cpcCents: number
  cpmCents: number
  cpaCents: number
  roas: number
  averageOrderValueCents: number
  privacySuppressedPurchases?: boolean
}

export interface EntityPerformanceRow {
  entityId: string
  entityType: 'CAMPAIGN' | 'AD_SET' | 'AD'
  name: string
  parentName?: string
  statusLabel: string
  badgeColor?: string
  format?: 'AUDIO' | 'VIDEO' | 'COMPANION'
  metrics: SpotifyReportMetrics
}

export interface SpotifyAttributionComparison {
  metricLabel: string
  spotifyAttributedValue: string
  safesaffInternalValue: string
  divergencePercent: number
  explanation: string
}

export interface AudienceInsightBreakdownItem {
  dimension: string
  category: string
  impressionsSharePercent: number
  clicksSharePercent: number
  conversionsSharePercent: number
  indexEfficiency: number
}

// Helpers seguros para evitar divisão por zero (retorna 0 ou '—')
export function safeDivide(numerator: number, denominator: number): number {
  if (!denominator || isNaN(denominator) || denominator === 0) return 0
  const res = numerator / denominator
  return isFinite(res) ? res : 0
}

export function safeRoas(revenueCents: number, spendCents: number): number {
  if (!spendCents || spendCents <= 0) return 0
  return Number((revenueCents / spendCents).toFixed(2))
}

export function safeCpa(spendCents: number, conversions: number): number {
  if (!conversions || conversions <= 0) return 0
  return Math.round(spendCents / conversions)
}

export function safeCtr(clicks: number, impressions: number): number {
  if (!impressions || impressions <= 0) return 0
  return Number(((clicks / impressions) * 100).toFixed(2))
}

export function safeCpc(spendCents: number, clicks: number): number {
  if (!clicks || clicks <= 0) return 0
  return Math.round(spendCents / clicks)
}

export function safeCpm(spendCents: number, impressions: number): number {
  if (!impressions || impressions <= 0) return 0
  return Math.round((spendCents / impressions) * 1000)
}

export function safeAov(revenueCents: number, purchases: number): number {
  if (!purchases || purchases <= 0) return 0
  return Math.round(revenueCents / purchases)
}

/**
 * Normaliza valores mascarados pelo Spotify por limiares de privacidade (ex: -5 significa < 5)
 */
export function normalizeSpotifyPrivacyMetric(rawValue: number): { value: number; isSuppressed: boolean; display: string } {
  if (rawValue === -5 || (rawValue > 0 && rawValue < 5)) {
    return {
      value: 0,
      isSuppressed: true,
      display: '< 5 (Privacidade Spotify)'
    }
  }
  return {
    value: rawValue,
    isSuppressed: false,
    display: String(rawValue)
  }
}
