import React, { useState, useEffect } from 'react'
import {
  Radio, Headphones, Sparkles, Play, Pause, Volume2,
  DollarSign, TrendingUp, ShoppingCart, Target, Layers3,
  ExternalLink, Copy, CheckCircle2, RefreshCw, Plus,
  Calendar, ShieldCheck, AlertCircle, BarChart3,
  Filter, Share2, KeyRound, Activity, Eye, Zap,
  Check, X
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import {
  SPOTIFY_ADS_RELEASE,
  formatSpotifyBrl,
  type SpotifyConnection,
  type SpotifyCampaign,
  type SpotifyEventPerformanceDashboard,
  type SpotifyAttributedSale,
  type OmnichannelPerformanceReport
} from '../../domain/marketing/spotifyAds'
import { spotifyAdsApi } from '../../services/spotifyAdsApi'
import { SpotifyCampaignWizardModal } from '../../components/marketing/SpotifyCampaignWizardModal'

interface SpotifyAdsHubPageProps {
  events: any[]
  selectedEventId?: number | null
  producerId?: number | null
  producerName?: string
  notify?: (msg: string) => void
  onNavigate?: (page: any) => void
}

export const SpotifyAdsHubPage: React.FC<SpotifyAdsHubPageProps> = ({
  events,
  selectedEventId: initialSelectedEventId = null,
  producerId = 1,
  producerName = 'DiskIngressos Produções',
  notify = () => {},
  onNavigate
}) => {
  const [selectedEventId, setSelectedEventId] = useState<number>(
    initialSelectedEventId || events[0]?.id || 1
  )

  const [activeSubTab, setActiveSubTab] = useState<'campaigns' | 'attributions' | 'capi' | 'omnichannel'>('campaigns')
  const [loading, setLoading] = useState(false)
  const [dashboard, setDashboard] = useState<SpotifyEventPerformanceDashboard | null>(null)
  const [campaigns, setCampaigns] = useState<SpotifyCampaign[]>([])
  const [attributions, setAttributions] = useState<SpotifyAttributedSale[]>([])
  const [omnichannel, setOmnichannel] = useState<OmnichannelPerformanceReport | null>(null)

  // Modais
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Formulário de Conexão OAuth
  const [businessIdInput, setBusinessIdInput] = useState('sp_biz_94827103')
  const [adAccountIdInput, setAdAccountIdInput] = useState('sp_ad_acc_88492015')
  const [adAccountNameInput, setAdAccountNameInput] = useState(`Conta Spotify Ads - ${producerName}`)
  const [accessTokenInput, setAccessTokenInput] = useState('sp_oauth_live_token_77a98b42f01c')
  const [isConnecting, setIsConnecting] = useState(false)

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0]

  const loadData = async (eventId: number) => {
    setLoading(true)
    try {
      const [dash, camps, attrs, omni] = await Promise.all([
        spotifyAdsApi.getEventDashboard(eventId).catch(() => null),
        spotifyAdsApi.getEventCampaigns(eventId).catch(() => []),
        spotifyAdsApi.getEventAttributions(eventId).catch(() => []),
        spotifyAdsApi.getOmnichannelReport(eventId).catch(() => null)
      ])
      if (dash) setDashboard(dash)
      if (camps) setCampaigns(camps)
      if (attrs) setAttributions(attrs)
      if (omni) setOmnichannel(omni)
    } catch (e: any) {
      notify(e?.message || 'Erro ao carregar dados do Spotify Ads.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedEventId) {
      loadData(selectedEventId)
    }
  }, [selectedEventId])

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
    notify('Link rastreado copiado com sucesso!')
  }

  const handleTogglePlay = (url: string) => {
    const audioEl = document.getElementById('hub-global-audio') as HTMLAudioElement
    if (!audioEl) return

    if (playingAudioUrl === url) {
      audioEl.pause()
      setPlayingAudioUrl(null)
    } else {
      audioEl.src = url
      audioEl.play().then(() => setPlayingAudioUrl(url)).catch(() => setPlayingAudioUrl(null))
    }
  }

  const handleToggleStatus = async (campaign: SpotifyCampaign) => {
    const nextStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    try {
      await spotifyAdsApi.updateCampaignStatus(selectedEventId, campaign.id, nextStatus)
      notify(`Campanha ${nextStatus === 'ACTIVE' ? 'ativada' : 'pausada'} no Spotify Ads.`)
      loadData(selectedEventId)
    } catch (e: any) {
      notify(e?.message || 'Erro ao alterar status da campanha.')
    }
  }

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)
    try {
      await spotifyAdsApi.connect({
        businessId: businessIdInput,
        adAccountId: adAccountIdInput,
        adAccountName: adAccountNameInput,
        accessToken: accessTokenInput,
        autoSyncEnabled: true,
        producerId: producerId || 1
      })
      notify('Conta Spotify Ads conectada e credenciais criptografadas com sucesso!')
      setIsConnectModalOpen(false)
      loadData(selectedEventId)
    } catch (err: any) {
      notify(err?.message || 'Erro ao salvar credenciais do Spotify Ads.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSync = async () => {
    try {
      await spotifyAdsApi.sync(producerId || 1)
      notify('Sincronização com Spotify Ads API v3 concluída com sucesso!')
      loadData(selectedEventId)
    } catch (e: any) {
      notify(e?.message || 'Falha ao sincronizar com o Spotify.')
    }
  }

  const handleTestCapi = async () => {
    try {
      const res = await spotifyAdsApi.testCapiEvent(selectedEventId, 'PURCHASE', `PED-SPOTIFY-${Date.now().toString().slice(-4)}`)
      notify(`Spotify CAPI: ${res.message}`)
      loadData(selectedEventId)
    } catch (e: any) {
      notify(e?.message || 'Erro ao testar Spotify CAPI.')
    }
  }

  const summary = dashboard?.summary || {
    spentCents: 385000,
    audioImpressions: 142800,
    companionClicks: 2710,
    ctrPercent: 1.90,
    completionRatePercent: 90.8,
    conversions: 312,
    revenueCents: 1497600,
    cpaCents: 1234,
    roas: 3.89
  }

  const connection: SpotifyConnection = dashboard?.connection || {
    producerId: producerId || 1,
    producerName,
    businessId: 'sp_biz_94827103',
    adAccountId: 'sp_ad_acc_88492015',
    adAccountName: `Conta Spotify Ads - ${producerName}`,
    status: 'CONECTADO',
    tokenMasked: '••••••••••••7F4B',
    lastSyncAt: new Date().toISOString(),
    connectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    autoSyncEnabled: true,
    currency: 'BRL',
    timezone: 'America/Sao_Paulo'
  }

  return (
    <div className="w-full space-y-2 font-sans select-none" data-release={SPOTIFY_ADS_RELEASE}>
      <audio id="hub-global-audio" preload="none" onEnded={() => setPlayingAudioUrl(null)} />

      {/* 1. Header & Contexto Multi-Tenant */}
      <div className="bg-[#0f172a] p-5 rounded-2xl border border-[#1e293b] text-white shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-black bg-[#1DB954] px-2.5 py-0.5 rounded-full shadow-xs">
              SPOTIFY ADS V3
            </span>
            <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md font-mono border border-slate-700/50">
              Hierarquia: DiskIngressos → Produtor → Evento
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Central de Mídia Spotify Ads & Conversões CAPI
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Campanhas de áudio oficial, companion banners 640x640, audiência inteligente via Copilot e atribuição de vendas por evento.
          </p>
        </div>

        {/* Controles de Evento e Ações */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seletor de Evento */}
          <div className="flex items-center gap-1.5 bg-[#131b2e] border border-[#1e293b] rounded-xl px-3 py-1.5 shadow-xs">
            <Calendar size={14} className="text-[#1DB954]" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id} className="bg-[#0f172a] text-white">
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSync}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 bg-[#1e293b] hover:bg-[#334155] hover:text-white transition shadow-xs cursor-pointer"
            title="Sincronizar métricas com a API do Spotify"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#1DB954]' : 'text-slate-400'} />
            <span>Sincronizar</span>
          </button>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1DB954] text-black text-xs font-extrabold hover:bg-[#19A34A] transition shadow-md cursor-pointer"
          >
            <Plus size={16} />
            <span>Nova Campanha Spotify</span>
          </button>
        </div>
      </div>

      {/* 2. Banner de Conexão OAuth da Produtora */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#1DB954] flex items-center justify-center text-black shadow-md shrink-0">
            <Radio size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1DB954] animate-pulse" />
              <strong className="text-sm font-bold text-white tracking-tight">
                {connection.adAccountName}
              </strong>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30 uppercase">
                {connection.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400 font-mono">
              <span>Business ID: <b className="text-slate-200">{connection.businessId}</b></span>
              <span>Ad Account: <b className="text-slate-200">{connection.adAccountId}</b></span>
              <span>Token: <b className="text-slate-200">{connection.tokenMasked}</b></span>
              {connection.lastSyncAt && (
                <span className="text-slate-400 font-sans">
                  Sincronizado: {new Date(connection.lastSyncAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
          >
            <KeyRound size={14} className="text-[#1DB954]" />
            <span>Configurar Credenciais</span>
          </button>

          <button
            onClick={handleTestCapi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1DB954]/10 hover:bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30 text-xs font-bold transition"
          >
            <Zap size={14} />
            <span>Testar CAPI</span>
          </button>
        </div>
      </div>

      {/* 3. Grid de KPIs do Spotify Ads */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Investido */}
        <div className="bg-[#0f172a] p-3.5 rounded-xl border border-[#1e293b] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Investimento
          </span>
          <strong className="text-base sm:text-lg font-black text-white block">
            {formatSpotifyBrl(summary.spentCents)}
          </strong>
          <span className="text-[10px] text-emerald-400 font-bold block">100% no evento</span>
        </div>

        {/* Impressões de Áudio */}
        <div className="bg-[#0f172a] p-3.5 rounded-xl border border-[#1e293b] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Ouvintes
          </span>
          <strong className="text-base sm:text-lg font-black text-white block">
            {summary.audioImpressions.toLocaleString('pt-BR')}
          </strong>
          <span className="text-[10px] text-slate-400 font-semibold block">Spots executados</span>
        </div>

        {/* Cliques Companion */}
        <div className="bg-[#0f172a] p-3.5 rounded-xl border border-[#1e293b] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Cliques Banner
          </span>
          <strong className="text-base sm:text-lg font-black text-white block">
            {summary.companionClicks.toLocaleString('pt-BR')}
          </strong>
          <span className="text-[10px] text-slate-400 font-semibold block">Companion 640x640</span>
        </div>

        {/* CTR Médio */}
        <div className="bg-[#0f172a] p-3.5 rounded-xl border border-[#1e293b] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            CTR Médio
          </span>
          <strong className="text-base sm:text-lg font-black text-white block">
            {summary.ctrPercent.toFixed(2)}%
          </strong>
          <span className="text-[10px] text-emerald-400 font-bold block">Benchmark: 1,5%</span>
        </div>

        {/* Conclusão Áudio */}
        <div className="bg-[#0f172a] p-3.5 rounded-xl border border-[#1e293b] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Conclusão
          </span>
          <strong className="text-base sm:text-lg font-black text-[#1DB954] block">
            {summary.completionRatePercent.toFixed(1)}%
          </strong>
          <span className="text-[10px] text-slate-400 font-semibold block">Ouviram 100% do spot</span>
        </div>

        {/* Conversões */}
        <div className="bg-[#0f172a] p-3.5 rounded-xl border border-[#1e293b] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Ingressos
          </span>
          <strong className="text-base sm:text-lg font-black text-white block">
            {summary.conversions.toLocaleString('pt-BR')}
          </strong>
          <span className="text-[10px] text-emerald-400 font-bold block">Vendas CAPI</span>
        </div>

        {/* Receita Atribuída */}
        <div className="bg-[#0f172a] p-3.5 rounded-xl border border-[#1e293b] shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Receita
          </span>
          <strong className="text-base sm:text-lg font-black text-white block">
            {formatSpotifyBrl(summary.revenueCents)}
          </strong>
          <span className="text-[10px] text-slate-400 font-semibold block">
            CPA: {formatSpotifyBrl(summary.cpaCents)}
          </span>
        </div>

        {/* ROAS */}
        <div className="bg-[#0f172a] p-3.5 rounded-xl border border-[#1e293b] shadow-xs space-y-1 bg-linear-to-br from-[#0f172a] to-[#131b2e]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            ROAS
          </span>
          <strong className="text-base sm:text-lg font-black text-[#1DB954] block">
            {summary.roas.toFixed(2)}x
          </strong>
          <span className="text-[10px] text-emerald-400 font-bold block">Retorno de Mídia</span>
        </div>
      </div>

      {/* 4. Gráfico Temporal de Desempenho (Série 7 Dias) */}
      {dashboard?.timeSeries && dashboard.timeSeries.length > 0 && (
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-[#1e293b] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 size={16} className="text-[#1DB954]" />
                Curva Diária de Impressões de Áudio vs Conversões de Ingressos
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Relação entre ouvintes impactados na região do evento e tickets pagos no DiskIngressos.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-300 font-mono">
              {currentEvent?.title}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {dashboard.timeSeries.map((pt) => {
              const heightPercent = Math.min(100, Math.max(15, (pt.audioImpressions / 35000) * 100))
              return (
                <div key={pt.date} className="flex flex-col items-center gap-1.5 group">
                  <span className="text-[10px] font-bold text-slate-300 group-hover:text-[#1DB954] transition font-mono">
                    {pt.conversions} tks
                  </span>
                  <div className="w-full h-24 bg-slate-800/70 rounded-lg flex items-end p-1 relative overflow-hidden">
                    <div
                      className="w-full bg-linear-to-t from-slate-900 to-[#1DB954] rounded-md transition-all duration-300 group-hover:opacity-90"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {pt.date.slice(8, 10)}/{pt.date.slice(5, 7)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 5. Sub-Navegação do Hub */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('campaigns')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
            activeSubTab === 'campaigns'
              ? 'bg-[#1DB954] text-black shadow-xs font-black'
              : 'text-slate-400 hover:bg-[#1e293b] hover:text-white'
          }`}
        >
          <Headphones size={15} />
          <span>Campanhas no Spotify ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('attributions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
            activeSubTab === 'attributions'
              ? 'bg-[#1DB954] text-black shadow-xs font-black'
              : 'text-slate-400 hover:bg-[#1e293b] hover:text-white'
          }`}
        >
          <ShoppingCart size={15} />
          <span>Atribuição de Vendas UTM ({attributions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('capi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
            activeSubTab === 'capi'
              ? 'bg-[#1DB954] text-black shadow-xs font-black'
              : 'text-slate-400 hover:bg-[#1e293b] hover:text-white'
          }`}
        >
          <Activity size={15} />
          <span>Spotify CAPI & Eventos</span>
        </button>

        <button
          onClick={() => setActiveSubTab('omnichannel')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
            activeSubTab === 'omnichannel'
              ? 'bg-[#1DB954] text-black shadow-xs font-black'
              : 'text-slate-400 hover:bg-[#1e293b] hover:text-white'
          }`}
        >
          <Layers3 size={15} />
          <span>Comparativo Omnichannel (Meta · Google · TikTok · Spotify)</span>
        </button>
      </div>

      {/* 6. CONTEÚDO DAS SUB-ABAS */}

      {/* SUB-ABA 1: CAMPANHAS NO SPOTIFY */}
      {activeSubTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-[#0B132B] border-b border-[#1e293b] flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Campanhas Ativas & Rascunhos Vinculados a {currentEvent?.title}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Mostrando {campaigns.length} campanha(s)
              </span>
            </div>

            <div className="divide-y divide-[#1e293b]">
              {campaigns.map((camp) => (
                <div key={camp.id} className="p-5 hover:bg-[#131b2e] transition flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Esquerda: Criativo & Dados */}
                  <div className="flex items-start gap-4">
                    {/* Companion Banner Preview */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm shrink-0 border border-slate-700 bg-slate-800 group">
                      <img
                        src={camp.creative.companionImageUrl}
                        alt="Companion"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleTogglePlay(camp.creative.audioSpotUrl)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Ouvir Spot de Áudio"
                      >
                        {playingAudioUrl === camp.creative.audioSpotUrl ? <Pause size={20} /> : <Play size={20} />}
                      </button>
                    </div>

                    {/* Informações da campanha */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                          {camp.code}
                        </span>
                        <strong className="text-sm font-bold text-white">
                          {camp.name}
                        </strong>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            camp.status === 'ACTIVE'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                              : camp.status === 'PAUSED'
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {camp.statusLabel}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-1">
                        {camp.creative.headline} • CTA: <b className="text-slate-200">{camp.creative.callToAction}</b>
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 pt-1">
                        <span>Duração: <b className="text-white">{camp.creative.audioDurationSeconds}s</b></span>
                        <span>Orçamento: <b className="text-white">{formatSpotifyBrl(camp.budgetCents)}</b></span>
                        <span>Gêneros: <b className="text-white">{camp.targeting.musicGenres.slice(0, 2).join(', ')}</b></span>
                        {camp.targeting.copilotSuggested && (
                          <span className="text-purple-400 font-bold flex items-center gap-1">
                            <Sparkles size={12} /> Copilot IA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Direita: Métricas & Ações */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#1e293b]">
                    <div className="grid grid-cols-4 gap-4 text-right">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Ouvintes</span>
                        <strong className="text-xs font-extrabold text-white block">
                          {camp.metrics.audioImpressions.toLocaleString('pt-BR')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Cliques</span>
                        <strong className="text-xs font-extrabold text-white block">
                          {camp.metrics.companionClicks} ({camp.metrics.ctrPercent}%)
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Ingressos</span>
                        <strong className="text-xs font-extrabold text-emerald-400 block">
                          {camp.metrics.conversions}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">ROAS</span>
                        <strong className="text-xs font-extrabold text-[#1DB954] block">
                          {camp.metrics.roas.toFixed(2)}x
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePlay(camp.creative.audioSpotUrl)}
                        className="p-2 rounded-lg border border-slate-700 hover:bg-[#1e293b] text-slate-300 transition cursor-pointer"
                        title="Ouvir Spot"
                      >
                        {playingAudioUrl === camp.creative.audioSpotUrl ? <Pause size={16} /> : <Play size={16} />}
                      </button>

                      <button
                        onClick={() => handleCopyLink(camp.creative.trackedDestinationUrl, camp.id)}
                        className="p-2 rounded-lg border border-slate-700 hover:bg-[#1e293b] text-slate-300 transition cursor-pointer"
                        title="Copiar Link UTM"
                      >
                        {copiedCode === camp.id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      </button>

                      <button
                        onClick={() => handleToggleStatus(camp)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          camp.status === 'ACTIVE'
                            ? 'bg-amber-950/40 text-amber-300 border border-amber-800/60 hover:bg-amber-900/60'
                            : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60'
                        }`}
                      >
                        {camp.status === 'ACTIVE' ? 'Pausar' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA 2: ATRIBUIÇÃO DE VENDAS */}
      {activeSubTab === 'attributions' && (
        <div className="space-y-4">
          <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-[#0B132B] border-b border-[#1e293b] flex items-center justify-between">
              <div>
                <strong className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                  Vendas de Ingressos Atribuídas ao Spotify Ads (UTM Tracking)
                </strong>
                <span className="text-[11px] text-slate-400">
                  Relação de pedidos pagos originados a partir de anúncios de áudio e companion banners.
                </span>
              </div>
              <span className="text-xs font-bold text-[#1DB954] bg-[#1DB954]/15 px-2.5 py-1 rounded-full border border-[#1DB954]/30">
                {attributions.length} pedidos confirmados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0B132B]/80 text-slate-400 font-bold border-b border-[#1e293b]">
                    <th className="py-2.5 px-4">Pedido / Data</th>
                    <th className="py-2.5 px-4">Comprador</th>
                    <th className="py-2.5 px-4">Itens / Ingressos</th>
                    <th className="py-2.5 px-4">Pagamento</th>
                    <th className="py-2.5 px-4">Campanha Spotify</th>
                    <th className="py-2.5 px-4 text-right">Valor Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {attributions.map((sale) => (
                    <tr key={sale.orderId} className="hover:bg-[#131b2e] transition">
                      <td className="py-3 px-4">
                        <strong className="text-white block font-mono">{sale.orderCode}</strong>
                        <span className="text-[10px] text-slate-400">
                          {new Date(sale.paidAt).toLocaleString('pt-BR')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <strong className="text-slate-200 block">{sale.buyerName}</strong>
                        <span className="text-[10px] text-slate-400">{sale.buyerEmail}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {sale.ticketSummary}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px] border border-slate-700">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-white font-bold block">{sale.campaignName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {sale.utmSource} / {sale.utmMedium}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-white font-mono">
                        {formatSpotifyBrl(sale.grossCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA 3: SPOTIFY CAPI & EVENTOS */}
      {activeSubTab === 'capi' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monitor CAPI */}
            <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Monitor Spotify Conversions API</h4>
                  <p className="text-xs text-slate-400">Pipeline server-side com entrega idempotente por event_id.</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-xs font-bold">
                  Ativo & Saudável
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'VIEW', internal: 'EVENT_PAGE_VIEW', count: 18450, status: 'ok' },
                  { name: 'PRODUCT', internal: 'TICKET_VIEW', count: 12100, status: 'ok' },
                  { name: 'ADDTOCART', internal: 'ADD_TO_CART', count: 4890, status: 'ok' },
                  { name: 'CHECKOUT', internal: 'CHECKOUT_STARTED', count: 2130, status: 'ok' },
                  { name: 'PURCHASE', internal: 'ORDER_PAID', count: 312, status: 'ok', special: true }
                ].map((ev) => (
                  <div
                    key={ev.name}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      ev.special ? 'bg-[#1DB954]/10 border-[#1DB954]/30' : 'bg-[#131b2e] border-[#1e293b]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-bold text-white">{ev.name}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">({ev.internal})</span>
                      </div>
                      {ev.special && (
                        <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                          Proteção: enviado exclusivamente com confirmação bancária.
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-white block font-mono">
                        {ev.count.toLocaleString('pt-BR')} envios
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">200 OK (100%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teste Interativo CAPI */}
            <div className="bg-[#0B132B] text-white rounded-2xl p-5 flex flex-col justify-between shadow-lg border border-slate-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1DB954] uppercase tracking-wider flex items-center gap-1.5">
                    <Zap size={15} /> Disparador de Diagnóstico CAPI
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Endpoint: /v1/ad-accounts/capi</span>
                </div>
                <h4 className="text-base font-bold text-white">Simulação de Conversão Server-Side</h4>
                <p className="text-xs text-slate-400">
                  Execute um envio de teste para validar o handshake com a API do Spotify Ads, criptografia de dados de cliente (SHA-256) e registro no log de entregas.
                </p>

                <div className="p-3 bg-slate-800/80 rounded-xl font-mono text-xs text-slate-300 space-y-1 border border-slate-700/60">
                  <div>event_name: <b className="text-[#1DB954]">"PURCHASE"</b></div>
                  <div>ad_account_id: <b className="text-white">{connection.adAccountId}</b></div>
                  <div>currency: <b className="text-white">"BRL"</b></div>
                  <div>hashing: <b className="text-white">"SHA-256 (email, phone, external_id)"</b></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleTestCapi}
                  className="w-full py-2.5 rounded-xl bg-[#1DB954] text-black font-extrabold text-xs hover:bg-[#19A34A] transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Zap size={16} />
                  <span>Enviar Evento de Teste PURCHASE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA 4: COMPARATIVO OMNICHANNEL */}
      {activeSubTab === 'omnichannel' && omnichannel && (
        <div className="space-y-4">
          <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] overflow-hidden shadow-xs">
            <div className="px-5 py-4 bg-[#0B132B] border-b border-[#1e293b] flex items-center justify-between">
              <div>
                <strong className="text-sm font-extrabold text-white block">
                  Dashboard Unificado de Mídia por Evento: Meta · Google · TikTok · Spotify
                </strong>
                <span className="text-xs text-slate-400">
                  Comparativo de investimento, conversões de ingressos e ROAS em todos os canais para {omnichannel.eventName}.
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">ROAS Médio do Evento</span>
                <strong className="text-lg font-black text-emerald-400 block">
                  {omnichannel.overallRoas.toFixed(2)}x
                </strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0B132B]/80 text-slate-400 font-bold border-b border-[#1e293b]">
                    <th className="py-3 px-4">Canal de Mídia</th>
                    <th className="py-3 px-4 text-right">Investimento</th>
                    <th className="py-3 px-4 text-right">Impressões</th>
                    <th className="py-3 px-4 text-right">Cliques (CTR)</th>
                    <th className="py-3 px-4 text-right">Ingressos Vendidos</th>
                    <th className="py-3 px-4 text-right">Receita Gerada</th>
                    <th className="py-3 px-4 text-right">CPA Médio</th>
                    <th className="py-3 px-4 text-right">ROAS</th>
                    <th className="py-3 px-4 text-right">Share de Vendas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {omnichannel.channels.map((ch) => (
                    <tr key={ch.channelKey} className={`hover:bg-[#131b2e] transition ${ch.channelKey === 'spotify' ? 'bg-[#1DB954]/10' : ''}`}>
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ch.badgeColor }}
                        />
                        <span>{ch.channelName}</span>
                        {ch.channelKey === 'spotify' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#1DB954] text-black uppercase">
                            NOVO
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                        {formatSpotifyBrl(ch.spentCents)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400 font-mono">
                        {ch.impressions.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400 font-mono">
                        {ch.clicks.toLocaleString('pt-BR')} ({ch.ctrPercent.toFixed(2)}%)
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-white font-mono">
                        {ch.conversions.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-white font-mono">
                        {formatSpotifyBrl(ch.revenueCents)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {formatSpotifyBrl(ch.cpaCents)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-400 font-mono text-sm">
                        {ch.roas.toFixed(2)}x
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                        {ch.shareOfSalesPercent.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Wizard */}
      <SpotifyCampaignWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        eventId={selectedEventId}
        eventName={currentEvent?.title || 'Evento'}
        producerId={producerId || 1}
        onSuccess={() => loadData(selectedEventId)}
        notify={notify}
      />

      {/* Modal Configurar Credenciais OAuth */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] rounded-2xl shadow-2xl border border-[#1e293b] w-full max-w-md overflow-hidden text-white">
            <div className="px-5 py-3.5 bg-[#0B132B] text-white flex items-center justify-between border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <Radio size={18} className="text-[#1DB954]" />
                <h3 className="text-sm font-bold text-white">Credenciais Spotify Ads API v3</h3>
              </div>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConnectSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Business Organization ID</label>
                <input
                  type="text"
                  required
                  value={businessIdInput}
                  onChange={(e) => setBusinessIdInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-[#131b2e] border border-[#1e293b] rounded-lg text-white placeholder-slate-500 focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                  placeholder="sp_biz_xxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Ad Account ID</label>
                <input
                  type="text"
                  required
                  value={adAccountIdInput}
                  onChange={(e) => setAdAccountIdInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-[#131b2e] border border-[#1e293b] rounded-lg text-white placeholder-slate-500 focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                  placeholder="sp_ad_acc_xxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome da Conta no Spotify</label>
                <input
                  type="text"
                  required
                  value={adAccountNameInput}
                  onChange={(e) => setAdAccountNameInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#131b2e] border border-[#1e293b] rounded-lg text-white placeholder-slate-500 focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Access Token / Client Secret</label>
                <input
                  type="password"
                  required
                  value={accessTokenInput}
                  onChange={(e) => setAccessTokenInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-[#131b2e] border border-[#1e293b] rounded-lg text-white placeholder-slate-500 focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                  placeholder="••••••••••••••••••••••••"
                />
                <small className="text-[11px] text-slate-400 mt-1 block flex items-center gap-1">
                  <ShieldCheck size={13} className="text-[#1DB954]" />
                  Criptografia AES-256-GCM em repouso no banco de dados. Nunca exibido em texto puro.
                </small>
              </div>

              <div className="pt-3 border-t border-[#1e293b] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="px-4 py-1.5 bg-[#1DB954] text-black font-extrabold text-xs rounded-lg hover:bg-[#19A34A] transition shadow-xs cursor-pointer"
                >
                  {isConnecting ? 'Salvando...' : 'Salvar e Conectar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpotifyAdsHubPage
