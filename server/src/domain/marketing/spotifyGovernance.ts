/**
 * FASE 28.7 — GOVERNANÇA, VALIDAÇÃO, APROVAÇÃO INTERNA E PUBLICAÇÃO SPOTIFY ADS
 * 
 * Regra Suprema: Salvar Campanha != Publicar Campanha.
 * Fluxo: Configuração -> Rascunho -> Validação SafeSaff -> Validação Spotify ->
 *        Aprovação Interna -> Publicação -> Moderação Spotify -> Ativa / Rejeitada / Restrita
 */

export type ValidationStatus = 
  | 'NOT_VALIDATED' 
  | 'VALIDATING' 
  | 'VALID' 
  | 'INVALID' 
  | 'STALE'

export const VALIDATION_STATUS_LABELS: Record<ValidationStatus, { label: string; badgeClass: string }> = {
  NOT_VALIDATED: { label: 'Não validada', badgeClass: 'bg-slate-800 text-slate-400 border-slate-700' },
  VALIDATING: { label: 'Validando...', badgeClass: 'bg-blue-950 text-blue-400 border-blue-800' },
  VALID: { label: 'Validada', badgeClass: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  INVALID: { label: 'Requer correções', badgeClass: 'bg-rose-950 text-rose-400 border-rose-800' },
  STALE: { label: 'Validação desatualizada', badgeClass: 'bg-amber-950 text-amber-400 border-amber-800' }
}

export type InternalApprovalStatus = 
  | 'NOT_REQUIRED' 
  | 'DRAFT' 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CANCELLED'

export const APPROVAL_STATUS_LABELS: Record<InternalApprovalStatus, { label: string; badgeClass: string }> = {
  NOT_REQUIRED: { label: 'Aprovação não exigida', badgeClass: 'bg-slate-800 text-slate-400 border-slate-700' },
  DRAFT: { label: 'Rascunho interno', badgeClass: 'bg-slate-800 text-slate-300 border-slate-700' },
  PENDING: { label: 'Aguardando aprovação', badgeClass: 'bg-amber-950 text-amber-400 border-amber-800' },
  APPROVED: { label: 'Aprovada internamente', badgeClass: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  REJECTED: { label: 'Ajustes solicitados', badgeClass: 'bg-rose-950 text-rose-400 border-rose-800' },
  CANCELLED: { label: 'Cancelada', badgeClass: 'bg-slate-800 text-slate-500 border-slate-700' }
}

export type PublishStatus = 
  | 'NOT_PUBLISHED' 
  | 'READY' 
  | 'PUBLISHING' 
  | 'PUBLISHED' 
  | 'PUBLISH_FAILED'

export const PUBLISH_STATUS_LABELS: Record<PublishStatus, { label: string; badgeClass: string }> = {
  NOT_PUBLISHED: { label: 'Não publicada', badgeClass: 'bg-slate-800 text-slate-400 border-slate-700' },
  READY: { label: 'Pronta para publicar', badgeClass: 'bg-cyan-950 text-cyan-400 border-cyan-800' },
  PUBLISHING: { label: 'Publicando no Spotify...', badgeClass: 'bg-purple-950 text-purple-400 border-purple-800 animate-pulse' },
  PUBLISHED: { label: 'Publicada', badgeClass: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  PUBLISH_FAILED: { label: 'Falha na publicação', badgeClass: 'bg-rose-950 text-rose-400 border-rose-800' }
}

export type SpotifyAdModerationStatus = 
  | 'ACTIVE' 
  | 'APPROVED' 
  | 'ARCHIVED' 
  | 'FAILED' 
  | 'PENDING' 
  | 'PENDING_APPROVAL' 
  | 'REJECTED' 
  | 'UNRECOGNIZED'

export const SPOTIFY_AD_STATUS_LABELS: Record<SpotifyAdModerationStatus, { label: string; badgeClass: string }> = {
  ACTIVE: { label: 'Ativo', badgeClass: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  APPROVED: { label: 'Aprovado', badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-700' },
  ARCHIVED: { label: 'Arquivado', badgeClass: 'bg-slate-800 text-slate-400 border-slate-700' },
  FAILED: { label: 'Falha', badgeClass: 'bg-rose-950 text-rose-400 border-rose-800' },
  PENDING: { label: 'Pendente', badgeClass: 'bg-amber-950 text-amber-300 border-amber-800' },
  PENDING_APPROVAL: { label: 'Em análise no Spotify', badgeClass: 'bg-blue-950 text-blue-400 border-blue-800' },
  REJECTED: { label: 'Rejeitado pelo Spotify', badgeClass: 'bg-rose-950 text-rose-300 border-rose-700' },
  UNRECOGNIZED: { label: 'Status não reconhecido', badgeClass: 'bg-slate-800 text-amber-400 border-amber-700' }
}

export type SpotifyAdSetModerationStatus = 
  | 'ACTIVE' 
  | 'ACTIVE_RESTRICTED' 
  | 'APPROVED' 
  | 'ARCHIVED' 
  | 'COMPLETED' 
  | 'PENDING_APPROVAL' 
  | 'READY' 
  | 'REJECTED'

export const SPOTIFY_ADSET_STATUS_LABELS: Record<SpotifyAdSetModerationStatus, { label: string; badgeClass: string; note?: string }> = {
  ACTIVE: { label: 'Ativo', badgeClass: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  ACTIVE_RESTRICTED: { label: 'Ativo com restrições', badgeClass: 'bg-amber-950 text-amber-300 border-amber-700', note: 'A entrega está ativa, mas existe alguma restrição aplicada pelo Spotify.' },
  APPROVED: { label: 'Aprovado', badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-700' },
  ARCHIVED: { label: 'Arquivado', badgeClass: 'bg-slate-800 text-slate-400 border-slate-700' },
  COMPLETED: { label: 'Finalizado', badgeClass: 'bg-slate-800 text-slate-300 border-slate-700' },
  PENDING_APPROVAL: { label: 'Em análise', badgeClass: 'bg-blue-950 text-blue-400 border-blue-800' },
  READY: { label: 'Pronto', badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-700' },
  REJECTED: { label: 'Rejeitado', badgeClass: 'bg-rose-950 text-rose-300 border-rose-700' }
}

export interface HierarchyCheckItem {
  id: string
  label: string
  passed: boolean
  detail?: string
}

export interface SpotifyHierarchyChecklist {
  overallPercentage: number
  isReadyForValidation: boolean
  items: HierarchyCheckItem[]
}

export interface SpotifyValidationError {
  severity: 'BLOCKER' | 'WARNING'
  field: string
  code: string
  titlePtBr: string
  messagePtBr: string
  suggestedActionPtBr: string
  rawApiError?: any
}

export interface SpotifyCampaignSnapshot {
  campaignId: string
  campaignName: string
  eventName: string
  eventId: number
  producerId: number
  budgetCents: number
  dailyBudgetCents: number
  startsAt: string
  endsAt: string
  targeting: any
  creative: any
  draftHierarchyVersion: number
  snapshotCreatedAt: string
}

export interface SpotifyApprovalRecord {
  id: string
  campaignId: string
  producerId: number
  eventId: number
  requestedBy: string
  requestedAt: string
  status: InternalApprovalStatus
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
  configurationHash: string
  snapshot: SpotifyCampaignSnapshot
}

export interface SpotifyPublicationRecord {
  id: string
  campaignId: string
  producerId: number
  eventId: number
  adAccountId: string
  draftCampaignId: string
  draftHierarchyVersion: number
  publishRequestId: string
  status: PublishStatus
  requestedBy: string
  requestedAt: string
  completedAt?: string
  spotifyTraceId?: string
  spotifyCampaignId?: string
  spotifyAdSetId?: string
  spotifyAdId?: string
  errorCode?: string
  errorMessage?: string
}

export interface SpotifyTimelineAuditItem {
  id: string
  occurredAt: string
  action: 
    | 'VALIDATION_STARTED'
    | 'VALIDATION_PASSED'
    | 'VALIDATION_FAILED'
    | 'APPROVAL_REQUESTED'
    | 'APPROVAL_APPROVED'
    | 'APPROVAL_REJECTED'
    | 'PUBLICATION_STARTED'
    | 'PUBLICATION_SUCCESS'
    | 'PUBLICATION_FAILED'
    | 'MODERATION_PENDING'
    | 'MODERATION_APPROVED'
    | 'MODERATION_REJECTED'
    | 'MODERATION_RESTRICTED'
    | 'CAMPAIGN_PAUSED'
  actorName: string
  descriptionPtBr: string
  metadata?: Record<string, any>
}

/**
 * Deriva o status consolidado de visualização considerando todas as camadas
 */
export function getSpotifyCampaignDisplayStatus(camp: {
  validationStatus?: ValidationStatus
  internalApprovalStatus?: InternalApprovalStatus
  publishStatus?: PublishStatus
  spotifyAdStatus?: SpotifyAdModerationStatus
  spotifyAdSetStatus?: SpotifyAdSetModerationStatus
}): { label: string; badgeClass: string; helperText: string } {
  if (camp.spotifyAdStatus === 'REJECTED' || camp.spotifyAdSetStatus === 'REJECTED') {
    return {
      label: 'Rejeitado pelo Spotify',
      badgeClass: 'bg-rose-950 text-rose-300 border-rose-700',
      helperText: 'O anúncio ou conjunto foi rejeitado após análise do Spotify. Revise os motivos e reenvie.'
    }
  }

  if (camp.spotifyAdSetStatus === 'ACTIVE_RESTRICTED') {
    return {
      label: 'Ativo com restrições',
      badgeClass: 'bg-amber-950 text-amber-300 border-amber-700',
      helperText: 'A entrega está ativa, mas existe alguma restrição de público ou conteúdo aplicada pelo Spotify.'
    }
  }

  if (camp.spotifyAdStatus === 'ACTIVE' || camp.spotifyAdSetStatus === 'ACTIVE') {
    return {
      label: 'Ativa no Spotify',
      badgeClass: 'bg-emerald-950 text-emerald-400 border-emerald-800',
      helperText: 'Campanha em veiculação ativa gerando impressões e conversões para o evento.'
    }
  }

  if (camp.spotifyAdStatus === 'PENDING_APPROVAL' || camp.spotifyAdSetStatus === 'PENDING_APPROVAL') {
    return {
      label: 'Em análise no Spotify',
      badgeClass: 'bg-blue-950 text-blue-400 border-blue-800',
      helperText: 'A hierarquia foi publicada com sucesso e está sob revisão da equipe de moderação do Spotify.'
    }
  }

  if (camp.publishStatus === 'PUBLISHED') {
    return {
      label: 'Publicada no Spotify',
      badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-700',
      helperText: 'Campanha transmitida com sucesso para a Ad Account oficial do Spotify Ads.'
    }
  }

  if (camp.publishStatus === 'PUBLISHING') {
    return {
      label: 'Publicando...',
      badgeClass: 'bg-purple-950 text-purple-400 border-purple-800 animate-pulse',
      helperText: 'Processando envio seguro da hierarquia completa para a API do Spotify.'
    }
  }

  if (camp.internalApprovalStatus === 'APPROVED') {
    return {
      label: 'Aprovada internamente',
      badgeClass: 'bg-emerald-950 text-emerald-400 border-emerald-800',
      helperText: 'Aprovada pela gestão da produtora. Pronta para publicação na conta real do Spotify.'
    }
  }

  if (camp.internalApprovalStatus === 'PENDING') {
    return {
      label: 'Aguardando aprovação interna',
      badgeClass: 'bg-amber-950 text-amber-400 border-amber-800',
      helperText: 'Validação técnica concluída. Aguardando revisão do gestor antes da liberação de verba.'
    }
  }

  if (camp.internalApprovalStatus === 'REJECTED') {
    return {
      label: 'Ajustes solicitados',
      badgeClass: 'bg-rose-950 text-rose-400 border-rose-800',
      helperText: 'O gestor solicitou alterações antes de aprovar a publicação.'
    }
  }

  if (camp.validationStatus === 'VALID') {
    return {
      label: 'Validada tecnicamente',
      badgeClass: 'bg-cyan-950 text-cyan-400 border-cyan-800',
      helperText: 'Checklist completo e validado pelo endpoint oficial. Pronta para solicitação de aprovação.'
    }
  }

  if (camp.validationStatus === 'INVALID') {
    return {
      label: 'Requer correções',
      badgeClass: 'bg-rose-950 text-rose-400 border-rose-800',
      helperText: 'Existem pendências impeditivas na hierarquia (criativo, orçamento, URL ou segmentação).'
    }
  }

  if (camp.validationStatus === 'STALE') {
    return {
      label: 'Validação desatualizada',
      badgeClass: 'bg-amber-950 text-amber-400 border-amber-800',
      helperText: 'A configuração foi alterada após a última validação. Valide novamente antes de publicar.'
    }
  }

  return {
    label: 'Rascunho',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    helperText: 'Campanha em edição. Preencha todos os dados obrigatórios para validar.'
  }
}
