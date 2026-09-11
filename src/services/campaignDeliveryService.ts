import {
  type MonitoredCampaignDeliveryItem,
  type MonitoredChannelKey,
  type CampaignDeliveryStatus,
  DELIVERY_STATUS_DICTIONARY,
  evaluateCampaignDeliveryStatus
} from '../domain/marketing/campaignDeliveryMonitoring'

const STORAGE_KEY = 'diskingressos:campaign-delivery-telemetry'

const INITIAL_CAMPAIGNS: MonitoredCampaignDeliveryItem[] = [
  {
    id: 'MON-META-001',
    campaignName: 'Festival Curitiba — Ingressos Oficiais (Feed & Stories)',
    channel: 'META',
    eventName: 'FESTIVAL CURITIBA 2026',
    eventId: 1,
    externalCampaignId: 'act_492019482_camp_9921',
    platformCampaignStatus: 'ACTIVE',
    platformAdSetStatus: 'ACTIVE',
    platformAdStatus: 'ACTIVE',
    platformStatusLabelPtBr: 'Ativa',
    deliveryStatus: 'ACTIVE_DELIVERING',
    deliveryMeta: DELIVERY_STATUS_DICTIONARY.ACTIVE_DELIVERING,
    impressionsLast6h: 14820,
    clicksLast6h: 684,
    spendLast6hCents: 42000,
    lastTelemetryAt: 'há 8 min',
    lastSyncAt: 'há 8 min',
    alerts: [
      {
        level: 'INFO',
        message: 'Entregando normalmente em Instagram Feed, Reels e Facebook Stories com CTR de 4,6% nas últimas 6h.'
      }
    ],
    totalSpentCents: 1240000,
    totalRevenueCents: 6840000,
    totalConversions: 312,
    roas: 5.51,
    startDate: '10/08/2026',
    endDate: '18/09/2026',
    budgetRemainingCents: 610000
  },
  {
    id: 'MON-GOOGLE-002',
    campaignName: 'Pesquisa Ingressos — Rede de Pesquisa & Discovery',
    channel: 'GOOGLE',
    eventName: 'MATEUS ASATO • World Tour 2026',
    eventId: 5,
    externalCampaignId: 'gads_88294710_camp_334',
    platformCampaignStatus: 'ENABLED',
    platformAdSetStatus: 'ENABLED',
    platformAdStatus: 'ELIGIBLE',
    platformStatusLabelPtBr: 'Ativa',
    deliveryStatus: 'ACTIVE_NO_DELIVERY',
    deliveryMeta: DELIVERY_STATUS_DICTIONARY.ACTIVE_NO_DELIVERY,
    impressionsLast6h: 0,
    clicksLast6h: 0,
    spendLast6hCents: 0,
    lastTelemetryAt: 'há 18h',
    lastSyncAt: 'há 12 min',
    issueReason: 'Sem impressões nas últimas 6 horas. O lance de CPC pode estar abaixo do mínimo do leilão ou orçamento diário esgotado.',
    alerts: [
      {
        level: 'WARNING',
        message: 'ATENÇÃO: Campanha ativa no Google Ads, mas sem impressões nas últimas 6 horas.',
        suggestion: 'Ajuste a estratégia de lances (Target CPA) ou eleve o teto de lance máximo por palavra-chave.'
      }
    ],
    totalSpentCents: 310000,
    totalRevenueCents: 1716000,
    totalConversions: 78,
    roas: 5.53,
    startDate: '12/08/2026',
    endDate: '15/09/2026',
    budgetRemainingCents: 210000
  },
  {
    id: 'MON-TIKTOK-003',
    campaignName: 'Viral Lineup — Spark Ads & Vídeos Curtos',
    channel: 'TIKTOK',
    eventName: 'FESTIVAL CURITIBA 2026',
    eventId: 1,
    externalCampaignId: 'tt_adv_582910_camp_118',
    platformCampaignStatus: 'OPERATION_STATUS_ENABLE',
    platformAdSetStatus: 'AUDIT_STATUS_PENDING',
    platformAdStatus: 'AUDIT_STATUS_PENDING',
    platformStatusLabelPtBr: 'Em análise',
    deliveryStatus: 'PENDING_REVIEW',
    deliveryMeta: DELIVERY_STATUS_DICTIONARY.PENDING_REVIEW,
    impressionsLast6h: 0,
    clicksLast6h: 0,
    spendLast6hCents: 0,
    lastTelemetryAt: 'Nunca entregou',
    lastSyncAt: 'há 20 min',
    issueReason: 'O criativo em vídeo foi submetido e está na fila de revisão automatizada e humana do TikTok Ads.',
    alerts: [
      {
        level: 'INFO',
        message: 'Campanha ou anúncio aguardando aprovação dos moderadores do TikTok Ads.',
        suggestion: 'Tempo médio estimado de aprovação: ~45 minutos.'
      }
    ],
    totalSpentCents: 0,
    totalRevenueCents: 0,
    totalConversions: 0,
    roas: 0,
    startDate: '11/09/2026',
    endDate: '25/09/2026',
    budgetRemainingCents: 250000
  },
  {
    id: 'MON-SPOTIFY-004',
    campaignName: 'Áudio Oficial Spotify — Marcos & Belutti 18 Anos',
    channel: 'SPOTIFY',
    eventName: 'MARCOS & BELUTTI • Tour 18 Anos',
    eventId: 1,
    externalCampaignId: 'sp_camp_892019482',
    platformCampaignStatus: 'ACTIVE',
    platformAdSetStatus: 'ACTIVE',
    platformAdStatus: 'APPROVED',
    platformStatusLabelPtBr: 'Ativa',
    deliveryStatus: 'ACTIVE_DELIVERING',
    deliveryMeta: DELIVERY_STATUS_DICTIONARY.ACTIVE_DELIVERING,
    impressionsLast6h: 8450,
    clicksLast6h: 312,
    spendLast6hCents: 26000,
    lastTelemetryAt: 'há 5 min',
    lastSyncAt: 'há 5 min',
    alerts: [
      {
        level: 'INFO',
        message: 'Veiculação ativa no Spotify Free (Mobile e Desktop) com companion banner 640x640 sincronizado.'
      }
    ],
    totalSpentCents: 340000,
    totalRevenueCents: 2180000,
    totalConversions: 94,
    roas: 6.41,
    startDate: '15/08/2026',
    endDate: '18/09/2026',
    budgetRemainingCents: 410000
  },
  {
    id: 'MON-META-005',
    campaignName: 'Virada de Lote — Urgência & Remarketing Checkout',
    channel: 'META',
    eventName: 'TOQUINHO • 60 Anos de Carreira',
    eventId: 3,
    externalCampaignId: 'act_492019482_camp_9944',
    platformCampaignStatus: 'ACTIVE',
    platformAdSetStatus: 'PAUSED',
    platformAdStatus: 'ACTIVE',
    platformStatusLabelPtBr: 'Ad Set Pausado',
    deliveryStatus: 'ACTIVE_NO_DELIVERY',
    deliveryMeta: DELIVERY_STATUS_DICTIONARY.ACTIVE_NO_DELIVERY,
    impressionsLast6h: 0,
    clicksLast6h: 0,
    spendLast6hCents: 0,
    lastTelemetryAt: 'há 1 dia',
    lastSyncAt: 'há 15 min',
    issueReason: 'Inconsistência de veiculação: a campanha está marcada como Ativa no Meta Ads, mas o Grupo de Anúncios (Ad Set) correspondente foi pausado.',
    alerts: [
      {
        level: 'CRITICAL',
        message: 'CRÍTICO: Ad Set pausado no Meta Ads enquanto a campanha está ativa.',
        suggestion: 'Ative o conjunto de anúncios no Meta Ads Manager para voltar a entregar imediatamente.'
      }
    ],
    totalSpentCents: 560000,
    totalRevenueCents: 3608000,
    totalConversions: 164,
    roas: 6.44,
    startDate: '18/08/2026',
    endDate: '29/08/2026',
    budgetRemainingCents: 290000
  },
  {
    id: 'MON-GOOGLE-006',
    campaignName: 'Google Display — Banners Retargeting Visitantes',
    channel: 'GOOGLE',
    eventName: 'ED MOTTA • Manual Prático 30 Anos',
    eventId: 2,
    externalCampaignId: 'gads_88294710_camp_778',
    platformCampaignStatus: 'ENABLED',
    platformAdSetStatus: 'ENABLED',
    platformAdStatus: 'DISAPPROVED',
    platformStatusLabelPtBr: 'Criativo Reprovado',
    deliveryStatus: 'REJECTED',
    deliveryMeta: DELIVERY_STATUS_DICTIONARY.REJECTED,
    impressionsLast6h: 0,
    clicksLast6h: 0,
    spendLast6hCents: 0,
    lastTelemetryAt: 'Nunca entregou',
    lastSyncAt: 'há 32 min',
    issueReason: 'O banner 300x250 foi reprovado pela política de publicidade do Google Ads devido à presença de texto em proporção excessiva sobre a arte.',
    alerts: [
      {
        level: 'CRITICAL',
        message: 'Anúncio reprovado na moderação do Google Ads (Política de Criativos).',
        suggestion: 'Substitua a imagem do banner por uma versão com menor proporção de texto e solicite reanálise.'
      }
    ],
    totalSpentCents: 0,
    totalRevenueCents: 0,
    totalConversions: 0,
    roas: 0,
    startDate: '15/08/2026',
    endDate: '29/08/2026',
    budgetRemainingCents: 140000
  }
]

export class CampaignDeliveryService {
  private static loadState(): MonitoredCampaignDeliveryItem[] {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // ignore
    }
    return INITIAL_CAMPAIGNS
  }

  private static saveState(items: MonitoredCampaignDeliveryItem[]): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore
    }
  }

  public static getMonitoredCampaigns(filter?: {
    channel?: MonitoredChannelKey | 'ALL'
    deliveryStatus?: CampaignDeliveryStatus | 'ALL'
    eventId?: number | null
  }): MonitoredCampaignDeliveryItem[] {
    const items = this.loadState()
    return items.filter(c => {
      if (filter?.channel && filter.channel !== 'ALL' && c.channel !== filter.channel) {
        return false
      }
      if (filter?.deliveryStatus && filter.deliveryStatus !== 'ALL' && c.deliveryStatus !== filter.deliveryStatus) {
        return false
      }
      if (filter?.eventId && c.eventId && c.eventId !== filter.eventId) {
        return false
      }
      return true
    })
  }

  public static getSummaryKpis(eventId?: number | null) {
    const items = this.getMonitoredCampaigns({ eventId })
    const delivering = items.filter(c => c.deliveryStatus === 'ACTIVE_DELIVERING').length
    const noDelivery = items.filter(c => c.deliveryStatus === 'ACTIVE_NO_DELIVERY').length
    const inReview = items.filter(c => c.deliveryStatus === 'PENDING_REVIEW').length
    const rejected = items.filter(c => c.deliveryStatus === 'REJECTED').length
    const paused = items.filter(c => c.deliveryStatus === 'PAUSED').length
    const totalImpressions6h = items.reduce((sum, c) => sum + c.impressionsLast6h, 0)
    const totalSpend6hCents = items.reduce((sum, c) => sum + c.spendLast6hCents, 0)
    const totalClicks6h = items.reduce((sum, c) => sum + c.clicksLast6h, 0)

    return {
      totalCampaigns: items.length,
      deliveringCount: delivering,
      noDeliveryCount: noDelivery,
      inReviewCount: inReview,
      rejectedCount: rejected,
      pausedCount: paused,
      totalImpressions6h,
      totalSpend6hCents,
      totalClicks6h
    }
  }

  public static async syncAllCampaigns(): Promise<MonitoredCampaignDeliveryItem[]> {
    // Simula sincronização com APIs oficiais (Meta Graph, Google Ads API, TikTok MKT, Spotify Ads API)
    await new Promise(r => setTimeout(r, 450))
    const current = this.loadState()

    const updated = current.map(item => {
      // Simula pequena variação na telemetria das ativas
      let newImpressions = item.impressionsLast6h
      let newSpend = item.spendLast6hCents
      let newClicks = item.clicksLast6h

      if (item.deliveryStatus === 'ACTIVE_DELIVERING') {
        const deltaImp = Math.floor(Math.random() * 80) + 20
        newImpressions += deltaImp
        newClicks += Math.max(1, Math.floor(deltaImp * 0.045))
        newSpend += Math.floor(deltaImp * 3.2)
      }

      const evaluation = evaluateCampaignDeliveryStatus({
        channel: item.channel,
        platformCampaignStatus: item.platformCampaignStatus,
        platformAdSetStatus: item.platformAdSetStatus,
        platformAdStatus: item.platformAdStatus,
        impressionsLast6h: newImpressions,
        clicksLast6h: newClicks,
        spendLast6hCents: newSpend,
        startDate: item.startDate,
        endDate: item.endDate
      })

      return {
        ...item,
        impressionsLast6h: newImpressions,
        clicksLast6h: newClicks,
        spendLast6hCents: newSpend,
        deliveryStatus: evaluation.deliveryStatus,
        deliveryMeta: DELIVERY_STATUS_DICTIONARY[evaluation.deliveryStatus],
        platformStatusLabelPtBr: evaluation.platformStatusLabelPtBr,
        issueReason: evaluation.issueReason || item.issueReason,
        alerts: evaluation.alerts.length ? evaluation.alerts : item.alerts,
        lastTelemetryAt: 'há menos de 1 min',
        lastSyncAt: 'agora mesmo'
      }
    })

    this.saveState(updated)
    return updated
  }

  public static async syncSingleCampaign(campaignId: string): Promise<MonitoredCampaignDeliveryItem | null> {
    await new Promise(r => setTimeout(r, 300))
    const current = this.loadState()
    const target = current.find(c => c.id === campaignId)
    if (!target) return null

    let newImpressions = target.impressionsLast6h
    let newSpend = target.spendLast6hCents
    let newClicks = target.clicksLast6h

    if (target.deliveryStatus === 'ACTIVE_DELIVERING') {
      newImpressions += 45
      newClicks += 2
      newSpend += 150
    }

    const evaluation = evaluateCampaignDeliveryStatus({
      channel: target.channel,
      platformCampaignStatus: target.platformCampaignStatus,
      platformAdSetStatus: target.platformAdSetStatus,
      platformAdStatus: target.platformAdStatus,
      impressionsLast6h: newImpressions,
      clicksLast6h: newClicks,
      spendLast6hCents: newSpend
    })

    const updatedItem: MonitoredCampaignDeliveryItem = {
      ...target,
      impressionsLast6h: newImpressions,
      clicksLast6h: newClicks,
      spendLast6hCents: newSpend,
      deliveryStatus: evaluation.deliveryStatus,
      deliveryMeta: DELIVERY_STATUS_DICTIONARY[evaluation.deliveryStatus],
      platformStatusLabelPtBr: evaluation.platformStatusLabelPtBr,
      issueReason: evaluation.issueReason,
      alerts: evaluation.alerts,
      lastTelemetryAt: 'há menos de 1 min',
      lastSyncAt: 'agora mesmo'
    }

    const updatedList = current.map(c => (c.id === campaignId ? updatedItem : c))
    this.saveState(updatedList)
    return updatedItem
  }
}
