/**
 * FASE 28.13 — MONITORAMENTO REAL DE ATIVAÇÃO E ENTREGA DAS CAMPANHAS
 * 
 * Camada de Confirmação Real de Status & Telemetria Recente (Meta, Google, TikTok, Spotify):
 * 1. Status da campanha na plataforma (ACTIVE, ENABLED, PAUSED, REJECTED, RESTRICTED, etc.)
 * 2. Prova de entrega real (impressões, cliques e gasto nas últimas 6 horas + última telemetria)
 * 
 * Regra de Ouro:
 * Uma campanha pode estar marcada como "Ativa" e mesmo assim NÃO estar entregando
 * por falta de aprovação de criativo, ad set pausado, orçamento esgotado ou problema na conta.
 * PDT DiskIngressos: Interface 100% PT-BR.
 */

export type MonitoredChannelKey = 'META' | 'GOOGLE' | 'TIKTOK' | 'SPOTIFY'

export type CampaignDeliveryStatus =
  | 'ACTIVE_DELIVERING'   // 🟢 Entregando (Ativa + métricas recentes registradas nas últimas 6h)
  | 'ACTIVE_NO_DELIVERY'  // 🟡 Sem entrega (Ativa na plataforma, porém 0 impressões/gasto nas últimas 6h)
  | 'PENDING_REVIEW'      // 🔵 Em análise (Ad Set ou anúncio pendente de aprovação pela plataforma)
  | 'PAUSED'              // ⚪ Pausada (Pausada pelo usuário ou na plataforma)
  | 'REJECTED'            // 🔴 Rejeitada (Criativo reprovado, violação de políticas ou conta com pendência)
  | 'RESTRICTED'          // 🟠 Restrita (Restrição parcial na conta ou limitação de entrega)
  | 'COMPLETED'           // 🏁 Finalizada (Orçamento total esgotado ou data de término atingida)
  | 'ERROR'               // ⚠️ Erro de API (Falha de sincronização, token expirado ou erro de conexão)

export interface DeliveryStatusMeta {
  code: CampaignDeliveryStatus
  label: string
  shortLabel: string
  badgeBg: string
  badgeColor: string
  badgeBorder: string
  indicatorColor: string
  description: string
}

export const DELIVERY_STATUS_DICTIONARY: Record<CampaignDeliveryStatus, DeliveryStatusMeta> = {
  ACTIVE_DELIVERING: {
    code: 'ACTIVE_DELIVERING',
    label: 'Ativa e entregando',
    shortLabel: 'Entregando',
    badgeBg: '#DCFCE7',
    badgeColor: '#166534',
    badgeBorder: '#86EFAC',
    indicatorColor: '#16A34A',
    description: 'Campanha ativa na plataforma com impressões e cliques registrados recentemente nas últimas 6 horas.'
  },
  ACTIVE_NO_DELIVERY: {
    code: 'ACTIVE_NO_DELIVERY',
    label: 'Ativa, sem entrega (6h)',
    shortLabel: 'Sem entrega',
    badgeBg: '#FEF3C7',
    badgeColor: '#92400E',
    badgeBorder: '#FDE68A',
    indicatorColor: '#D97706',
    description: 'Campanha marcada como ativa na plataforma, mas com 0 impressões ou gasto nas últimas 6 horas. Requer atenção operacional.'
  },
  PENDING_REVIEW: {
    code: 'PENDING_REVIEW',
    label: 'Em análise / Moderação',
    shortLabel: 'Em análise',
    badgeBg: '#EFF6FF',
    badgeColor: '#1E40AF',
    badgeBorder: '#BFDBFE',
    indicatorColor: '#2563EB',
    description: 'Anúncios ou criativos submetidos à moderação da plataforma aguardando aprovação oficial.'
  },
  PAUSED: {
    code: 'PAUSED',
    label: 'Pausada',
    shortLabel: 'Pausada',
    badgeBg: '#F1F5F9',
    badgeColor: '#475569',
    badgeBorder: '#CBD5E1',
    indicatorColor: '#64748B',
    description: 'Campanha ou conjunto pausado manualmente pelo produtor ou na plataforma de origem.'
  },
  REJECTED: {
    code: 'REJECTED',
    label: 'Rejeitada / Reprovada',
    shortLabel: 'Rejeitada',
    badgeBg: '#FEE2E2',
    badgeColor: '#991B1B',
    badgeBorder: '#FCA5A5',
    indicatorColor: '#DC2626',
    description: 'Criativo ou configuração rejeitados pela plataforma por violação de diretrizes ou falha técnica.'
  },
  RESTRICTED: {
    code: 'RESTRICTED',
    label: 'Restrita / Limitada',
    shortLabel: 'Restrita',
    badgeBg: '#FFEDD5',
    badgeColor: '#9A3412',
    badgeBorder: '#FDBA74',
    indicatorColor: '#EA580C',
    description: 'A campanha está veiculando com limites de alcance devido a restrições de público ou da conta.'
  },
  COMPLETED: {
    code: 'COMPLETED',
    label: 'Finalizada / Encerrada',
    shortLabel: 'Finalizada',
    badgeBg: '#F3F4F6',
    badgeColor: '#374151',
    badgeBorder: '#E5E7EB',
    indicatorColor: '#4B5563',
    description: 'Campanha encerrou a janela de veiculação programada ou esgotou o orçamento estipulado.'
  },
  ERROR: {
    code: 'ERROR',
    label: 'Erro de Sincronização',
    shortLabel: 'Erro de API',
    badgeBg: '#FCE7F3',
    badgeColor: '#9D174D',
    badgeBorder: '#FBCFE8',
    indicatorColor: '#BE185D',
    description: 'Não foi possível consultar os dados da plataforma. Verifique as credenciais ou token OAuth.'
  }
}

export interface MonitoredChannelMeta {
  key: MonitoredChannelKey
  displayName: string
  iconLabel: string
  color: string
  lightBg: string
  border: string
}

export const MONITORED_CHANNELS_META: Record<MonitoredChannelKey, MonitoredChannelMeta> = {
  META: {
    key: 'META',
    displayName: 'Meta Ads',
    iconLabel: 'Instagram & Facebook',
    color: '#1877F2',
    lightBg: '#EFF6FF',
    border: '#BFDBFE'
  },
  GOOGLE: {
    key: 'GOOGLE',
    displayName: 'Google Ads',
    iconLabel: 'Pesquisa & YouTube',
    color: '#2563EB',
    lightBg: '#EFF6FF',
    border: '#BFDBFE'
  },
  TIKTOK: {
    key: 'TIKTOK',
    displayName: 'TikTok Ads',
    iconLabel: 'Spark & In-Feed',
    color: '#0F172A',
    lightBg: '#F8FAFC',
    border: '#E2E8F0'
  },
  SPOTIFY: {
    key: 'SPOTIFY',
    displayName: 'Spotify Ads',
    iconLabel: 'Áudio Oficial & Banners',
    color: '#1DB954',
    lightBg: '#F0FDF4',
    border: '#BBF7D0'
  }
}

export interface DeliveryAlert {
  level: 'CRITICAL' | 'WARNING' | 'INFO'
  message: string
  suggestion?: string
}

export interface MonitoredCampaignDeliveryItem {
  id: string
  campaignName: string
  channel: MonitoredChannelKey
  eventName?: string
  eventId?: number
  externalCampaignId?: string
  
  // Níveis de Status da Plataforma
  platformCampaignStatus: string
  platformAdSetStatus?: string
  platformAdStatus?: string
  platformStatusLabelPtBr: string
  
  // Status de Entrega Unificado & Telemetria
  deliveryStatus: CampaignDeliveryStatus
  deliveryMeta: DeliveryStatusMeta
  impressionsLast6h: number
  clicksLast6h: number
  spendLast6hCents: number
  lastTelemetryAt: string // ex: "há 8 min"
  lastSyncAt: string
  
  // Diagnóstico & Alertas Operacionais
  issueReason?: string
  alerts: DeliveryAlert[]
  
  // Métricas Acumuladas da Campanha
  totalSpentCents: number
  totalRevenueCents: number
  totalConversions: number
  roas: number
  
  // Período
  startDate?: string
  endDate?: string
  budgetRemainingCents?: number
}

export interface TelemetryEvaluationInput {
  channel: MonitoredChannelKey
  platformCampaignStatus: string
  platformAdSetStatus?: string
  platformAdStatus?: string
  impressionsLast6h: number
  clicksLast6h?: number
  spendLast6hCents: number
  startDate?: string
  endDate?: string
  hasApiError?: boolean
  apiErrorMessage?: string
}

export function evaluateCampaignDeliveryStatus(input: TelemetryEvaluationInput): {
  deliveryStatus: CampaignDeliveryStatus
  platformStatusLabelPtBr: string
  issueReason?: string
  alerts: DeliveryAlert[]
} {
  const alerts: DeliveryAlert[] = []

  // 1. Falha de Conexão com a API
  if (input.hasApiError) {
    alerts.push({
      level: 'CRITICAL',
      message: input.apiErrorMessage || 'Falha na comunicação com a API da plataforma.',
      suggestion: 'Revalide o token de acesso OAuth nas integrações de marketing.'
    })
    return {
      deliveryStatus: 'ERROR',
      platformStatusLabelPtBr: 'Erro de Conexão',
      issueReason: 'Credenciais de API inválidas ou serviço indisponível.',
      alerts
    }
  }

  const campStatusNorm = (input.platformCampaignStatus || '').trim().toUpperCase()
  const adsetStatusNorm = (input.platformAdSetStatus || '').trim().toUpperCase()
  const adStatusNorm = (input.platformAdStatus || '').trim().toUpperCase()

  // 2. Rejeição / Reprovação na Plataforma
  const isRejected = 
    campStatusNorm.includes('REJECT') || 
    campStatusNorm.includes('DISAPPROV') ||
    campStatusNorm.includes('FAILED') ||
    adsetStatusNorm.includes('REJECT') ||
    adStatusNorm.includes('REJECT') ||
    adStatusNorm.includes('DISAPPROV')

  if (isRejected) {
    alerts.push({
      level: 'CRITICAL',
      message: `Anúncio reprovado na moderação do ${input.channel}.`,
      suggestion: 'Verifique as diretrizes de imagem, áudio ou texto e submeta uma nova versão.'
    })
    return {
      deliveryStatus: 'REJECTED',
      platformStatusLabelPtBr: 'Rejeitada',
      issueReason: 'Criativo ou anúncio não aprovado pelas políticas da plataforma.',
      alerts
    }
  }

  // 3. Em Análise / Moderação
  const isPendingReview = 
    campStatusNorm.includes('PENDING') || 
    campStatusNorm.includes('UNDER_REVIEW') || 
    campStatusNorm.includes('AUDIT_PENDING') ||
    adsetStatusNorm.includes('PENDING') ||
    adStatusNorm.includes('PENDING')

  if (isPendingReview) {
    alerts.push({
      level: 'INFO',
      message: `Campanha ou anúncio aguardando aprovação dos moderadores do ${input.channel}.`,
      suggestion: 'A aprovação de anúncios costuma levar de 15 minutos a poucas horas.'
    })
    return {
      deliveryStatus: 'PENDING_REVIEW',
      platformStatusLabelPtBr: 'Em Análise',
      issueReason: 'Aguardando moderação de criativos e conformidade.',
      alerts
    }
  }

  // 4. Pausada na Plataforma ou pelo Produtor
  const isPaused = 
    campStatusNorm.includes('PAUSE') || 
    campStatusNorm.includes('DISABLE') || 
    campStatusNorm.includes('INACTIVE')

  if (isPaused) {
    return {
      deliveryStatus: 'PAUSED',
      platformStatusLabelPtBr: 'Pausada',
      issueReason: 'A veiculação foi interrompida na plataforma de origem.',
      alerts: [{
        level: 'INFO',
        message: 'Campanha pausada pelo produtor.',
        suggestion: 'Clique em "Ativar" na plataforma quando quiser retomar a entrega.'
      }]
    }
  }

  // 5. Ad Set pausado enquanto Campanha está ativa (inconsistência crítica)
  if (adsetStatusNorm.includes('PAUSE') || adsetStatusNorm.includes('DISABLE')) {
    alerts.push({
      level: 'CRITICAL',
      message: `Atenção: A campanha está ativa, mas o Grupo de Anúncios (Ad Set) está pausado no ${input.channel}.`,
      suggestion: 'Acesse o gerenciador de anúncios e ative o Ad Set para restabelecer a veiculação.'
    })
    return {
      deliveryStatus: 'ACTIVE_NO_DELIVERY',
      platformStatusLabelPtBr: 'Ad Set Pausado',
      issueReason: 'O grupo de anúncios está inativo, impedindo a veiculação das impressões.',
      alerts
    }
  }

  // 6. Restrições da Plataforma (ex: Spotify ACTIVE_RESTRICTED ou Meta account warnings)
  const isRestricted = 
    campStatusNorm.includes('RESTRICT') || 
    adsetStatusNorm.includes('RESTRICT') ||
    campStatusNorm.includes('BUDGET_CONSTRAINED')

  // 7. Campanha Ativa na Plataforma -> Avaliar Prova Real de Telemetria (últimas 6h)
  const hasTelemetry = input.impressionsLast6h > 0 || input.spendLast6hCents > 0

  if (hasTelemetry) {
    if (isRestricted) {
      alerts.push({
        level: 'WARNING',
        message: `Campanha entregando com restrições operacionais no ${input.channel}.`,
        suggestion: 'Revise o orçamento diário ou os limites de lance.'
      })
      return {
        deliveryStatus: 'RESTRICTED',
        platformStatusLabelPtBr: 'Ativa com Restrições',
        issueReason: 'Entrega limitada por restrições de público ou orçamento.',
        alerts
      }
    }

    return {
      deliveryStatus: 'ACTIVE_DELIVERING',
      platformStatusLabelPtBr: 'Ativa',
      alerts: [{
        level: 'INFO',
        message: `Entregando com telemetria ativa: ${input.impressionsLast6h.toLocaleString('pt-BR')} impressões nas últimas 6h.`
      }]
    }
  }

  // 8. Ativa na plataforma, porém SEM entrega nas últimas 6 horas
  const channelName = MONITORED_CHANNELS_META[input.channel]?.displayName || input.channel
  alerts.push({
    level: 'WARNING',
    message: `ATENÇÃO: Campanha ativa no ${channelName}, mas sem impressões nas últimas 6 horas.`,
    suggestion: 'Verifique se o orçamento diário foi atingido, se o lance está competitivo ou se o público é amplo o suficiente.'
  })

  return {
    deliveryStatus: 'ACTIVE_NO_DELIVERY',
    platformStatusLabelPtBr: 'Ativa (Sem Entrega)',
    issueReason: '0 impressões registradas nas últimas 6 horas apesar do status ativo na plataforma.',
    alerts
  }
}
