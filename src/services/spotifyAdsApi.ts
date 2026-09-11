import type {
  SpotifyConnection,
  SpotifyCampaign,
  SpotifyCampaignWorkflowStatus,
  SpotifyAudienceForecast,
  SpotifyEventPerformanceDashboard,
  SpotifyAttributedSale,
  OmnichannelPerformanceReport
} from '../domain/marketing/spotifyAds'

const API = import.meta.env.VITE_API_URL || '/api'

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const tokenKey = Object.keys(sessionStorage).find(k => k.startsWith('disk_token:')) ||
                   Object.keys(localStorage).find(k => k.startsWith('disk_token:'))
  const token = tokenKey ? (sessionStorage.getItem(tokenKey) || localStorage.getItem(tokenKey)) : ''
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  }
  const res = await fetch(`${API}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || 'Erro ao comunicar com a API Spotify Ads.')
  }
  return data as T
}

function qs(values: Record<string, string | number | undefined | null>): string {
  const p = new URLSearchParams()
  Object.entries(values).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v))
  })
  const q = p.toString()
  return q ? `?${q}` : ''
}

export const spotifyAdsApi = {
  // 1. Conexão OAuth & Status
  async getConnection(producerId?: number): Promise<SpotifyConnection> {
    return request<SpotifyConnection>(`/marketing/spotify/connection${qs({ producerId })}`)
  },

  async connect(payload: {
    businessId: string
    adAccountId: string
    adAccountName: string
    accessToken: string
    autoSyncEnabled?: boolean
    producerId?: number
  }): Promise<{ ok: boolean; message: string; connection: SpotifyConnection }> {
    return request<{ ok: boolean; message: string; connection: SpotifyConnection }>('/marketing/spotify/connect', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  async disconnect(producerId?: number): Promise<{ ok: boolean; message: string }> {
    return request<{ ok: boolean; message: string }>('/marketing/spotify/disconnect', {
      method: 'POST',
      body: JSON.stringify({ producerId })
    })
  },

  async sync(producerId?: number): Promise<{ ok: boolean; message: string; lastSyncAt: string }> {
    return request<{ ok: boolean; message: string; lastSyncAt: string }>('/marketing/spotify/sync', {
      method: 'POST',
      body: JSON.stringify({ producerId })
    })
  },

  // 2. Dashboard do Evento
  async getEventDashboard(eventId: number): Promise<SpotifyEventPerformanceDashboard> {
    return request<SpotifyEventPerformanceDashboard>(`/marketing/spotify/events/${eventId}/dashboard`)
  },

  // 3. Campanhas do Evento
  async getEventCampaigns(eventId: number): Promise<SpotifyCampaign[]> {
    return request<SpotifyCampaign[]>(`/marketing/spotify/events/${eventId}/campaigns`)
  },

  async createEventCampaign(eventId: number, payload: any): Promise<SpotifyCampaign> {
    return request<SpotifyCampaign>(`/marketing/spotify/events/${eventId}/campaigns`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  async updateCampaignStatus(
    eventId: number,
    campaignId: string | number,
    status: SpotifyCampaignWorkflowStatus
  ): Promise<{ ok: boolean; campaignId: number; status: string }> {
    return request<{ ok: boolean; campaignId: number; status: string }>(
      `/marketing/spotify/events/${eventId}/campaigns/${campaignId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }
    )
  },

  // 4. Forecast & Estimativa de Alcance
  async getAudienceForecast(
    eventId: number,
    payload: {
      genres: string[]
      locations: any[]
      ageRanges: string[]
      dailyBudgetCents?: number
    }
  ): Promise<SpotifyAudienceForecast> {
    return request<SpotifyAudienceForecast>(`/marketing/spotify/events/${eventId}/forecast`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  // 5. Copilot Inteligente DiskIngressos
  async getCopilotSuggestion(eventId: number): Promise<{
    copilotSuggested: boolean
    suggestedGenres: string[]
    relatedArtists: string[]
    playlistAffinities: string[]
    locations: Array<{ state: string; city?: string; radiusKm?: number }>
    ageRanges: string[]
    genders: 'ALL' | 'MALE' | 'FEMALE'
    platforms: Array<'IOS' | 'ANDROID' | 'DESKTOP' | 'WEB'>
    rationale: string
    ordersAnalyzedCount: number
    estimatedAudienceMatchPercent: number
  }> {
    return request<any>(`/marketing/spotify/events/${eventId}/copilot-suggest`, {
      method: 'POST'
    })
  },

  // 6. Atribuição de Vendas
  async getEventAttributions(eventId: number): Promise<SpotifyAttributedSale[]> {
    return request<SpotifyAttributedSale[]>(`/marketing/spotify/events/${eventId}/attributions`)
  },

  // 7. Teste de Disparo CAPI
  async testCapiEvent(
    eventId: number,
    eventName = 'PURCHASE',
    orderCode = 'PED-SPOTIFY-TEST-01'
  ): Promise<{ ok: boolean; message: string; dispatch: any }> {
    return request<{ ok: boolean; message: string; dispatch: any }>('/marketing/spotify/capi/test-event', {
      method: 'POST',
      body: JSON.stringify({ eventId, eventName, orderCode })
    })
  },

  // 8. Relatório Omnichannel Comparativo
  async getOmnichannelReport(eventId: number): Promise<OmnichannelPerformanceReport> {
    return request<OmnichannelPerformanceReport>(`/marketing/spotify/events/${eventId}/omnichannel`)
  },

  // -------------------------------------------------------------
  // FASE 28.7 — GOVERNANÇA, VALIDAÇÃO, APROVAÇÃO E PUBLICAÇÃO
  // -------------------------------------------------------------
  async validateCampaign(campaignId: string | number, campaign?: any): Promise<{
    ok: boolean
    validationStatus: any
    checklist: any
    blockers: any[]
    warnings: any[]
    draftHierarchyVersion: number
  }> {
    return request<any>(`/marketing/spotify/campaigns/${campaignId}/validate`, {
      method: 'POST',
      body: JSON.stringify({ campaign })
    })
  },

  async requestApproval(campaignId: string | number, payload: { campaign?: any; eventId?: number }): Promise<{
    ok: boolean
    approval: any
  }> {
    return request<any>(`/marketing/spotify/campaigns/${campaignId}/approval/request`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  async approveCampaign(campaignId: string | number): Promise<{ ok: boolean; approval: any }> {
    return request<any>(`/marketing/spotify/campaigns/${campaignId}/approval/approve`, {
      method: 'POST'
    })
  },

  async rejectCampaign(campaignId: string | number, rejectionReason: string): Promise<{ ok: boolean; approval: any }> {
    return request<any>(`/marketing/spotify/campaigns/${campaignId}/approval/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason })
    })
  },

  async getApproval(campaignId: string | number): Promise<{ approval: any }> {
    return request<any>(`/marketing/spotify/campaigns/${campaignId}/approval`)
  },

  async getApprovalsQueue(producerId?: number): Promise<{ queue: any[] }> {
    return request<{ queue: any[] }>(`/marketing/spotify/approvals/queue${qs({ producerId })}`)
  },

  async publishHierarchy(campaignId: string | number, payload: { campaign?: any; eventId?: number }): Promise<{
    ok: boolean
    publication: any
  }> {
    return request<any>(`/marketing/spotify/campaigns/${campaignId}/publish`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  async getPublication(campaignId: string | number): Promise<{ publication: any }> {
    return request<any>(`/marketing/spotify/campaigns/${campaignId}/publication`)
  },

  async getTimeline(campaignId: string | number): Promise<{ timeline: any[] }> {
    return request<{ timeline: any[] }>(`/marketing/spotify/campaigns/${campaignId}/timeline`)
  },

  async pauseCampaignHierarchy(campaignId: string | number, reason?: string): Promise<{ ok: boolean; message: string }> {
    return request<{ ok: boolean; message: string }>(`/marketing/spotify/campaigns/${campaignId}/pause`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  },

  // -------------------------------------------------------------
  // FASE 28.8 — SPOTIFY CAPI, CONVERSÕES E DIAGNÓSTICO
  // -------------------------------------------------------------
  async getCapiIntegration(producerId?: number): Promise<{ integration: any }> {
    return request<{ integration: any }>(`/marketing/spotify/capi${qs({ producerId })}`)
  },

  async listConversions(producerId?: number, eventId?: number): Promise<{ events: any[] }> {
    return request<{ events: any[] }>(`/marketing/spotify/conversions${qs({ producerId, eventId })}`)
  },

  async getFunnelReport(producerId?: number, eventId?: number, eventName?: string): Promise<{ funnel: any }> {
    return request<{ funnel: any }>(`/marketing/spotify/conversions/funnel${qs({ producerId, eventId, eventName })}`)
  },

  async getCapiDiagnostics(producerId?: number): Promise<{ diagnostics: any }> {
    return request<{ diagnostics: any }>(`/marketing/spotify/conversions/diagnostics${qs({ producerId })}`)
  },

  async retryConversion(id: string, producerId?: number): Promise<{ ok: boolean; message: string }> {
    return request<{ ok: boolean; message: string }>(`/marketing/spotify/conversions/${id}/retry`, {
      method: 'POST',
      body: JSON.stringify({ producerId })
    })
  },

  // -------------------------------------------------------------
  // FASE 28.9 — REPORTING REAL, ATRIBUIÇÃO E AUDIENCE INSIGHTS
  // -------------------------------------------------------------
  async getReportingOverview(producerId?: number, eventId?: number): Promise<{ metrics: any; comparisons: any[] }> {
    return request<{ metrics: any; comparisons: any[] }>(`/marketing/spotify/reporting/overview${qs({ producerId, eventId })}`)
  },

  async getReportingBreakdown(producerId?: number, eventId?: number): Promise<{ rows: any[] }> {
    return request<{ rows: any[] }>(`/marketing/spotify/reporting/breakdown${qs({ producerId, eventId })}`)
  },

  async getAudienceInsights(producerId?: number, eventId?: number): Promise<{
    hasSufficientData: boolean
    insights: any[]
    privacyNote?: string
  }> {
    return request<any>(`/marketing/spotify/reporting/insights${qs({ producerId, eventId })}`)
  },

  // -------------------------------------------------------------
  // FASE 28.10 — DASHBOARD OMNICHANNEL UNIFICADO
  // -------------------------------------------------------------
  async getOmnichannelOverview(producerId?: number, eventId?: number): Promise<{
    producerId: number
    eventId: number
    period: string
    totalInvestedCents: number
    totalRevenueCents: number
    totalConversions: number
    weightedRoas: number
    matrixQuadrants: {
      scale: any[]
      maintain: any[]
      optimize: any[]
      reduce: any[]
    }
    channels: any[]
  }> {
    return request<any>(`/marketing/spotify/omnichannel/overview${qs({ producerId, eventId })}`)
  },

  // -------------------------------------------------------------
  // FASE 28.11 — MOTOR DE OTIMIZAÇÃO & INTELIGÊNCIA DE MÍDIA
  // -------------------------------------------------------------
  async getOptimizationOverview(producerId?: number, eventId?: number): Promise<{
    opportunitiesCount: number
    criticalAlertsCount: number
    healthyCampaignsCount: number
    attentionCampaignsCount: number
    potentialSavingsBrl: number
    potentialAdditionalRevenueBrl: number
    dataQualityScore: number
    insights: any[]
  }> {
    return request<any>(`/marketing/spotify/optimization/overview${qs({ producerId, eventId })}`)
  },

  async simulateInsight(id: string, deltaPercent = 25): Promise<{ ok: boolean; simulation: any }> {
    return request<{ ok: boolean; simulation: any }>(`/marketing/spotify/optimization/insights/${id}/simulate`, {
      method: 'POST',
      body: JSON.stringify({ deltaPercent })
    })
  },

  async acceptInsight(id: string): Promise<{ ok: boolean; message: string }> {
    return request<{ ok: boolean; message: string }>(`/marketing/spotify/optimization/insights/${id}/accept`, {
      method: 'POST'
    })
  },

  async rejectInsight(id: string, reason?: string): Promise<{ ok: boolean; message: string }> {
    return request<{ ok: boolean; message: string }>(`/marketing/spotify/optimization/insights/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  }
}
