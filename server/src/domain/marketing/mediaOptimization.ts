/**
 * FASE 28.11 — MOTOR DE OTIMIZAÇÃO + INTELIGÊNCIA DE MÍDIA + RECOMENDAÇÕES OMNICHANNEL
 * 
 * Princípio Fundamental: Human-in-the-loop.
 * DADOS -> DETECÇÃO -> DIAGNÓSTICO -> RECOMENDAÇÃO -> SIMULAÇÃO -> APROVAÇÃO HUMANA -> AÇÃO.
 * Nenhuma alteração de orçamento ou pausa é executada automaticamente sem aprovação expressa.
 */

export type OptimizationInsightType = 
  | 'SCALE_OPPORTUNITY'
  | 'BUDGET_WASTE'
  | 'ROAS_DROP'
  | 'CPA_INCREASE'
  | 'CREATIVE_FATIGUE'
  | 'CHANNEL_OPPORTUNITY'
  | 'EVENT_RISK'
  | 'INVENTORY_CONFLICT'
  | 'TRACKING_PROBLEM'

export type InsightSeverity = 'INFO' | 'OPPORTUNITY' | 'WARNING' | 'CRITICAL'

export const SEVERITY_BADGES: Record<InsightSeverity, { label: string; badgeClass: string }> = {
  INFO: { label: 'Informativo', badgeClass: 'bg-blue-950 text-blue-400 border-blue-800' },
  OPPORTUNITY: { label: 'Oportunidade', badgeClass: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  WARNING: { label: 'Atenção', badgeClass: 'bg-amber-950 text-amber-400 border-amber-800' },
  CRITICAL: { label: 'Crítico', badgeClass: 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse' }
}

export type InsightStatus = 'NEW' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'

export type OptimizationAction = 
  | 'INCREASE_BUDGET'
  | 'DECREASE_BUDGET'
  | 'PAUSE_CAMPAIGN'
  | 'REVIEW_CREATIVE'
  | 'REVIEW_TARGETING'
  | 'SHIFT_BUDGET'
  | 'FIX_TRACKING'
  | 'NO_ACTION'

export interface ImpactSimulation {
  currentDailyBudgetCents: number
  proposedDailyBudgetCents: number
  budgetDeltaPercent: number
  periodDays: number
  additionalInvestmentCents: number
  conservativeReturnCents: number
  centralReturnCents: number
  optimisticReturnCents: number
  saturationFactorPercent: number
  confidenceScore: number
}

export interface OptimizationInsight {
  id: string
  producerId: number
  eventId: number
  eventName: string
  channel: 'SPOTIFY' | 'META' | 'GOOGLE' | 'TIKTOK'
  campaignId?: string
  campaignName: string
  adSetName?: string
  creativeName?: string
  type: OptimizationInsightType
  severity: InsightSeverity
  status: InsightStatus
  titlePtBr: string
  headlinePtBr: string
  descriptionPtBr: string
  actionSuggested: OptimizationAction
  actionLabelPtBr: string
  reasonPtBr: string
  explainabilityPoints: string[]
  currentRoas?: number
  targetRoas?: number
  currentCpaCents?: number
  targetCpaCents?: number
  availableTickets?: number
  opportunityScore: number
  confidenceScore: number
  priorityScore: number
  detectedAt: string
  expiresAt: string
  simulation?: ImpactSimulation
  decisionNotes?: string
  reviewedBy?: string
  reviewedAt?: string
}

export interface OptimizationOverviewSummary {
  opportunitiesCount: number
  criticalAlertsCount: number
  healthyCampaignsCount: number
  attentionCampaignsCount: number
  potentialSavingsBrl: number
  potentialAdditionalRevenueBrl: number
  dataQualityScore: number
  insights: OptimizationInsight[]
}
