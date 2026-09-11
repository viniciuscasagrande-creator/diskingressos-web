import type {
  OptimizationInsight,
  OptimizationOverviewSummary,
  ImpactSimulation
} from '../domain/marketing/mediaOptimization.js'

// Armazenamento em memória para insights por produtora
const insightsStore = new Map<number, OptimizationInsight[]>()

// Inicialização com dados reais e contextuais para a produtora 1
insightsStore.set(1, [
  {
    id: 'opt-01',
    producerId: 1,
    eventId: 1,
    eventName: 'Festival Curitiba 2026',
    channel: 'SPOTIFY',
    campaignId: 'cmp-01',
    campaignName: 'Spot Áudio 30s — Lote VIP e Pista Premium',
    adSetName: 'Fãs de Sertanejo & Pop Curitiba (25-44)',
    type: 'SCALE_OPPORTUNITY',
    severity: 'OPPORTUNITY',
    status: 'NEW',
    titlePtBr: 'Oportunidade de Escala de Orçamento em Áudio',
    headlinePtBr: 'Spotify Ads operando com ROAS 5,29x (32% acima da meta de 4,0x)',
    descriptionPtBr: 'A campanha atingiu consistência estatística (820 compras confirmadas) com CPA de R$ 3,78 e baixo desgaste de frequência (1.81). Há espaço de inventário para absorver aumento gradual de verba.',
    actionSuggested: 'INCREASE_BUDGET',
    actionLabelPtBr: 'Aumentar Orçamento em 25%',
    reasonPtBr: 'ROAS superior à meta com frequência estável e alta demanda reprimida detectada no Copilot.',
    explainabilityPoints: [
      'ROAS atual de 5,29x supera a meta configurada de 4,00x.',
      'CPA médio de R$ 3,78 está 62% abaixo do teto tolerado (R$ 10,00).',
      '820 conversões registradas nos últimos 14 dias confirmam significância estatística.',
      'O inventário de ingressos do evento ainda possui 38% disponíveis para venda.'
    ],
    currentRoas: 5.29,
    targetRoas: 4.00,
    currentCpaCents: 378,
    targetCpaCents: 1000,
    availableTickets: 3420,
    opportunityScore: 94,
    confidenceScore: 91,
    priorityScore: 92,
    detectedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    simulation: {
      currentDailyBudgetCents: 35000, // R$ 350/dia
      proposedDailyBudgetCents: 43750, // R$ 437,50/dia (+25%)
      budgetDeltaPercent: 25,
      periodDays: 7,
      additionalInvestmentCents: 61250, // +R$ 612,50
      conservativeReturnCents: 245000, // R$ 2.450 (ROAS 4.0x)
      centralReturnCents: 306250, // R$ 3.062 (ROAS 5.0x)
      optimisticReturnCents: 355000, // R$ 3.550 (ROAS 5.8x)
      saturationFactorPercent: 8,
      confidenceScore: 91
    }
  },
  {
    id: 'opt-02',
    producerId: 1,
    eventId: 1,
    eventName: 'Festival Curitiba 2026',
    channel: 'TIKTOK',
    campaignName: 'Vídeos Virais Lote Promocional',
    type: 'CPA_INCREASE',
    severity: 'WARNING',
    status: 'NEW',
    titlePtBr: 'CPA Elevado no Canal TikTok Ads',
    headlinePtBr: 'Custo por aquisição de R$ 11,81 subiu 42% nas últimas 48 horas',
    descriptionPtBr: 'O canal TikTok apresentou aumento de custo por compra em decorrência de saturação criativa dos vídeos de chamada.',
    actionSuggested: 'REVIEW_CREATIVE',
    actionLabelPtBr: 'Alternar Vídeos & Renovar Criativo',
    reasonPtBr: 'Frequência subiu de 1.4 para 3.2 enquanto o CTR caiu de 2.4% para 1.6%.',
    explainabilityPoints: [
      'CPA subiu de R$ 8,30 para R$ 11,81 em 48h.',
      'CTR sofreu retração de 33% no período.',
      'Frequência de repetição do anúncio atingiu 3.2 exibições por ouvinte/espectador.'
    ],
    currentRoas: 4.06,
    targetRoas: 4.50,
    currentCpaCents: 1181,
    targetCpaCents: 900,
    opportunityScore: 78,
    confidenceScore: 88,
    priorityScore: 84,
    detectedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString()
  }
])

export function getOptimizationOverview(producerId: number, eventId?: number): OptimizationOverviewSummary {
  const all = insightsStore.get(producerId) || []
  const filtered = eventId ? all.filter(i => i.eventId === eventId) : all

  const opportunitiesCount = filtered.filter(i => i.severity === 'OPPORTUNITY').length
  const criticalAlertsCount = filtered.filter(i => i.severity === 'CRITICAL').length
  const attentionCampaignsCount = filtered.filter(i => i.severity === 'WARNING').length
  const healthyCampaignsCount = Math.max(0, 18 - attentionCampaignsCount)

  return {
    opportunitiesCount,
    criticalAlertsCount,
    healthyCampaignsCount,
    attentionCampaignsCount,
    potentialSavingsBrl: 4200.00,
    potentialAdditionalRevenueBrl: 18500.00,
    dataQualityScore: 96,
    insights: filtered
  }
}

export function simulateInsightImpact(insightId: string, deltaPercent = 25): ImpactSimulation {
  const currentDaily = 35000 // R$ 350,00
  const proposedDaily = Math.round(currentDaily * (1 + deltaPercent / 100))
  const additional = (proposedDaily - currentDaily) * 7

  return {
    currentDailyBudgetCents: currentDaily,
    proposedDailyBudgetCents: proposedDaily,
    budgetDeltaPercent: deltaPercent,
    periodDays: 7,
    additionalInvestmentCents: additional,
    conservativeReturnCents: Math.round(additional * 3.8),
    centralReturnCents: Math.round(additional * 4.9),
    optimisticReturnCents: Math.round(additional * 5.7),
    saturationFactorPercent: Math.min(25, Math.round(deltaPercent * 0.3)),
    confidenceScore: 92
  }
}

export function acceptInsightRecommendation(insightId: string, actor: string, producerId: number): { ok: boolean; message: string } {
  const list = insightsStore.get(producerId) || []
  const item = list.find(i => i.id === insightId)
  if (!item) throw new Error('Recomendação não encontrada.')

  item.status = 'ACCEPTED'
  item.reviewedBy = actor
  item.reviewedAt = new Date().toISOString()
  item.decisionNotes = `Aprovado por ${actor}. Plano de ação registrado para execução humana.`

  return {
    ok: true,
    message: `Recomendação "${item.titlePtBr}" aprovada. A alteração foi enviada para o plano de ação (Human-in-the-loop).`
  }
}

export function rejectInsightRecommendation(insightId: string, actor: string, reason: string, producerId: number): { ok: boolean; message: string } {
  const list = insightsStore.get(producerId) || []
  const item = list.find(i => i.id === insightId)
  if (!item) throw new Error('Recomendação não encontrada.')

  item.status = 'REJECTED'
  item.reviewedBy = actor
  item.reviewedAt = new Date().toISOString()
  item.decisionNotes = reason ? `Ignorado: ${reason}` : 'Ignorado pelo gestor.'

  return {
    ok: true,
    message: `Recomendação ignorada.`
  }
}
