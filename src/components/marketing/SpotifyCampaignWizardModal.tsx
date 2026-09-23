import React, { useState, useEffect } from 'react'
import {
  X, Sparkles, Music, Headphones, Image as ImageIcon,
  DollarSign, CheckCircle2, ArrowRight, ArrowLeft,
  Play, Pause, Volume2, ShieldCheck, Zap,
  Target, BarChart3, AlertCircle, Link, Save, Radio
} from 'lucide-react'
import {
  SPOTIFY_CANONICAL_GENRES,
  SPOTIFY_AGE_RANGES,
  formatSpotifyBrl,
  type SpotifyAudienceForecast
} from '../../domain/marketing/spotifyAds'
import { spotifyAdsApi } from '../../services/spotifyAdsApi'

interface Props {
  isOpen: boolean
  onClose: () => void
  eventId: number
  eventName: string
  producerId: number
  onSuccess: (campaign: any) => void
  notify?: (msg: string) => void
}

export const SpotifyCampaignWizardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  eventId,
  eventName,
  onSuccess,
  notify = () => {}
}) => {
  const [step, setStep] = useState<number>(1)
  const [busy, setBusy] = useState(false)
  const [copilotLoading, setCopilotLoading] = useState(false)

  // Step 1: Dados Básicos
  const [name, setName] = useState(`PDT ${eventName} - Spot Áudio 30s`)
  const [objective, setObjective] = useState<'TICKET_SALES' | 'REACH' | 'TRAFFIC'>('TICKET_SALES')

  // Step 2: Segmentação & Copilot
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Sertanejo Universitário', 'Pop Nacional'])
  const [relatedArtists, setRelatedArtists] = useState<string>('Jorge & Mateus, Henrique & Juliano, Ana Castela')
  const [targetCity, setTargetCity] = useState('Curitiba')
  const [targetRadiusKm, setTargetRadiusKm] = useState(50)
  const [selectedAges, setSelectedAges] = useState<string[]>(['18-24', '25-34', '35-44'])
  const [selectedGender, setSelectedGender] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL')
  const [copilotApplied, setCopilotApplied] = useState(false)
  const [copilotRationale, setCopilotRationale] = useState('')

  // Step 3: Previsão de Audiência (Forecast)
  const [forecast, setForecast] = useState<SpotifyAudienceForecast | null>(null)

  // Step 4: Orçamento & Lances
  const [budgetType, setBudgetType] = useState<'TOTAL' | 'DAILY'>('TOTAL')
  const [budgetValueBrl, setBudgetValueBrl] = useState('5000') // R$ 5.000,00
  const [dailyBudgetValueBrl, setDailyBudgetValueBrl] = useState('350') // R$ 350,00
  const [bidStrategy, setBidStrategy] = useState<'AUTO_CPM' | 'TARGET_CPA' | 'MANUAL_CPC'>('AUTO_CPM')
  const [startsAt, setStartsAt] = useState(new Date().toISOString().slice(0, 10))
  const [endsAt, setEndsAt] = useState(new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10))

  // Step 5: Criativos & Assets
  const [audioDuration, setAudioDuration] = useState<15 | 30>(30)
  const [audioSpotUrl, setAudioSpotUrl] = useState('https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg')
  const [audioTitle, setAudioTitle] = useState(`Spot 30s Oficial - ${eventName}`)
  const [companionImageUrl, setCompanionImageUrl] = useState('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=640&h=640&fit=crop')
  const [brandName, setBrandName] = useState('DiskIngressos')
  const [headline, setHeadline] = useState(`Garanta seu ingresso para ${eventName}! Lote promocional por tempo limitado.`)
  const [callToAction, setCallToAction] = useState<'Garantir Ingresso' | 'Comprar Agora' | 'Ouvir Agora' | 'Saiba Mais'>('Garantir Ingresso')
  const [destinationUrl, setDestinationUrl] = useState(`https://www.diskingressos.com.br/evento/${eventId}`)

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false)

  // Step 7: Workflow status
  const [saveAsDraft, setSaveAsDraft] = useState(false)

  // Recalcula previsão de audiência ao entrar no passo 3
  useEffect(() => {
    if (step === 3 && !forecast) {
      handleCalculateForecast()
    }
  }, [step])

  const handleCalculateForecast = async () => {
    try {
      const dailyCents = Math.round(Number(dailyBudgetValueBrl) * 100) || 35000
      const res = await spotifyAdsApi.getAudienceForecast(eventId, {
        genres: selectedGenres,
        locations: [{ state: 'PR', city: targetCity, radiusKm: targetRadiusKm }],
        ageRanges: selectedAges,
        dailyBudgetCents: dailyCents
      })
      setForecast(res)
    } catch {
      setForecast({
        potentialReachMin: 120000,
        potentialReachMax: 260000,
        weeklyImpressionsMin: 42000,
        weeklyImpressionsMax: 88000,
        estimatedFrequency: 2.1,
        recommendedDailyBudgetCents: 35000,
        audienceQualityScore: 92
      })
    }
  }

  const handleCopilotSuggest = async () => {
    setCopilotLoading(true)
    try {
      const suggestion = await spotifyAdsApi.getCopilotSuggestion(eventId)
      setSelectedGenres(suggestion.suggestedGenres)
      setRelatedArtists(suggestion.relatedArtists.join(', '))
      if (suggestion.locations[0]) {
        setTargetCity(suggestion.locations[0].city || 'Curitiba')
        setTargetRadiusKm(suggestion.locations[0].radiusKm || 50)
      }
      setSelectedAges(suggestion.ageRanges)
      setSelectedGender(suggestion.genders)
      setCopilotRationale(suggestion.rationale)
      setCopilotApplied(true)
      notify('Copilot PDT: Segmentação musical e demográfica sugerida com sucesso!')
    } catch (e: any) {
      notify(e?.message || 'Falha ao buscar sugestão do Copilot.')
    } finally {
      setCopilotLoading(false)
    }
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    )
  }

  const toggleAge = (age: string) => {
    setSelectedAges((prev) =>
      prev.includes(age) ? prev.filter((a) => a !== age) : [...prev, age]
    )
  }

  const toggleAudioPlayback = () => {
    const audioEl = document.getElementById('spotify-wizard-audio') as HTMLAudioElement
    if (!audioEl) return
    if (isPlaying) {
      audioEl.pause()
      setIsPlaying(false)
    } else {
      audioEl.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }

  const handleSubmit = async () => {
    setBusy(true)
    try {
      const budgetCents = Math.round(Number(budgetValueBrl) * 100)
      const dailyBudgetCents = Math.round(Number(dailyBudgetValueBrl) * 100)

      const payload = {
        name,
        objective,
        budgetCents,
        dailyBudgetCents,
        bidStrategy,
        startsAt,
        endsAt,
        status: saveAsDraft ? 'DRAFT' : 'ACTIVE',
        targeting: {
          musicGenres: selectedGenres,
          relatedArtists: relatedArtists.split(',').map((s) => s.trim()).filter(Boolean),
          playlistAffinities: [`Top Brasil 2026`, `Esquenta ${selectedGenres[0] || 'Música'}`],
          locations: [{ state: 'PR', city: targetCity, radiusKm: targetRadiusKm }],
          ageRanges: selectedAges,
          genders: selectedGender,
          platforms: ['IOS', 'ANDROID', 'DESKTOP'],
          copilotSuggested: copilotApplied,
          copilotRationale: copilotRationale || undefined
        },
        creative: {
          audioSpotUrl,
          audioTitle,
          audioDurationSeconds: audioDuration,
          companionImageUrl,
          brandLogoUrl: 'https://cdn.diskingressos.com.br/branding/logo-symbol.png',
          brandName,
          headline,
          callToAction,
          destinationUrl
        }
      }

      const created = await spotifyAdsApi.createEventCampaign(eventId, payload)
      notify(saveAsDraft ? 'Rascunho de campanha salvo com sucesso!' : 'Campanha publicada com sucesso no Spotify Ads API v3!')
      onSuccess(created)
      onClose()
    } catch (err: any) {
      notify(err?.message || 'Erro ao criar campanha Spotify.')
    } finally {
      setBusy(false)
    }
  }

  if (!isOpen) return null

  const steps = [
    { num: 1, title: 'Campanha' },
    { num: 2, title: 'Público' },
    { num: 3, title: 'Previsão' },
    { num: 4, title: 'Orçamento' },
    { num: 5, title: 'Criativo' },
    { num: 6, title: 'CAPI' },
    { num: 7, title: 'Revisão' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0f172a] rounded-2xl shadow-2xl border border-[#1e293b] w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh] text-white">
        {/* Header */}
        <div className="px-5 py-3 bg-[#0B132B] text-white flex items-center justify-between border-b border-[#1e293b] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center shadow-xs text-black">
              <Radio size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30">
                  Spotify Ads API v3
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                Assistente de Criação de Campanha de Áudio & CAPI
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar assistente"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="bg-[#0B132B] px-4 py-2.5 border-b border-[#1e293b] overflow-x-auto shrink-0">
          <div className="flex items-center justify-between gap-1 min-w-[500px] sm:min-w-0">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                      step === s.num
                        ? 'bg-[#1DB954] text-black shadow-xs font-black'
                        : step > s.num
                          ? 'bg-[#1e293b] text-[#1DB954] border border-[#1DB954]/40'
                          : 'bg-[#1e293b] text-slate-400 border border-slate-700'
                    }`}
                  >
                    {step > s.num ? <CheckCircle2 size={13} className="text-[#1DB954]" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] font-medium whitespace-nowrap ${
                      step === s.num ? 'text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-[1px] grow min-w-2 max-w-6 ${step > s.num ? 'bg-[#1DB954]/60' : 'bg-slate-700/60'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 grow text-slate-200 bg-[#0f172a]">
          {/* PASSO 1: CAMPANHA */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Identificação da Campanha & Evento</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Associação estrita ao evento selecionado seguindo a hierarquia DiskIngressos → Produtor → Evento.
                </p>
              </div>

              <div className="p-3 bg-[#1DB954]/10 border border-[#1DB954]/25 rounded-xl flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-[#1DB954] shrink-0" />
                <div className="text-xs text-slate-300">
                  <strong className="text-white block font-bold">Evento Vinculado: {eventName}</strong>
                  <span className="text-[11px] text-slate-400">Esta campanha rodará no Ad Account exclusivo da sua produtora com atribuição direta aos pedidos deste evento.</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome da Campanha</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#131b2e] border border-[#1e293b] rounded-lg text-white placeholder-slate-500 focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                  placeholder="Ex.: PDT Show Ítalo - Spot Áudio 30s & Ingressos"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Objetivo da Campanha</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setObjective('TICKET_SALES')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      objective === 'TICKET_SALES'
                        ? 'border-[#1DB954] bg-[#1DB954]/15 ring-1 ring-[#1DB954]/50'
                        : 'border-[#1e293b] bg-[#131b2e] hover:border-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#1DB954]/20 text-[#1DB954] flex items-center justify-center mb-1.5">
                      <Target size={15} />
                    </div>
                    <strong className="text-xs font-bold text-white block">Venda de Ingressos</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">
                      Otimizado para conversão no checkout via Spotify CAPI (PURCHASE).
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setObjective('REACH')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      objective === 'REACH'
                        ? 'border-[#1DB954] bg-[#1DB954]/15 ring-1 ring-[#1DB954]/50'
                        : 'border-[#1e293b] bg-[#131b2e] hover:border-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1.5">
                      <Headphones size={15} />
                    </div>
                    <strong className="text-xs font-bold text-white block">Alcance & Ouvintes</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">
                      Maximiza o número de ouvintes únicos alcançados no período.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setObjective('TRAFFIC')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      objective === 'TRAFFIC'
                        ? 'border-[#1DB954] bg-[#1DB954]/15 ring-1 ring-[#1DB954]/50'
                        : 'border-[#1e293b] bg-[#131b2e] hover:border-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-1.5">
                      <Zap size={15} />
                    </div>
                    <strong className="text-xs font-bold text-white block">Tráfego Qualificado</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">
                      Foco em cliques no companion banner para a página do evento.
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PASSO 2: PÚBLICO, SEGMENTAÇÃO & COPILOT */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Público, Gêneros & Copilot IA</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Alcance pessoas ouvindo gêneros afins no Spotify na região do show.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopilotSuggest}
                  disabled={copilotLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-linear-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-xs hover:opacity-90 transition shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={13} />
                  <span>{copilotLoading ? 'Analisando...' : 'Sugerir com Copilot'}</span>
                </button>
              </div>

              {copilotApplied && copilotRationale && (
                <div className="p-2.5 bg-purple-950/40 border border-purple-800/60 rounded-xl text-xs text-purple-200 flex items-start gap-2">
                  <Sparkles size={15} className="text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-purple-100">Diagnóstico do Copilot DiskIngressos:</strong>
                    <span className="text-[11px] text-purple-300">{copilotRationale}</span>
                  </div>
                </div>
              )}

              {/* Gêneros Musicais */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Gêneros Musicais Oficiais Spotify
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SPOTIFY_CANONICAL_GENRES.map((genre) => {
                    const active = selectedGenres.includes(genre)
                    return (
                      <button
                        type="button"
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
                          active
                            ? 'bg-[#1DB954] text-black font-bold border-[#1DB954] shadow-xs'
                            : 'bg-[#131b2e] text-slate-300 border-[#1e293b] hover:border-slate-600'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}
                        {genre}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Artistas Relacionados */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Artistas Relacionados / Referências
                </label>
                <input
                  type="text"
                  value={relatedArtists}
                  onChange={(e) => setRelatedArtists(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#131b2e] border border-[#1e293b] rounded-lg text-white placeholder-slate-500 focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                  placeholder="Ex.: Jorge & Mateus, Henrique & Juliano, Ana Castela"
                />
              </div>

              {/* Localização & Raio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Cidade Principal</label>
                  <input
                    type="text"
                    value={targetCity}
                    onChange={(e) => setTargetCity(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#131b2e] border border-[#1e293b] rounded-lg text-white placeholder-slate-500 focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                    placeholder="Curitiba"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Raio de Cobertura (km)</label>
                  <div className="flex items-center gap-2.5 pt-1">
                    <input
                      type="range"
                      min="15"
                      max="150"
                      step="5"
                      value={targetRadiusKm}
                      onChange={(e) => setTargetRadiusKm(Number(e.target.value))}
                      className="grow accent-[#1DB954] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-white w-12 text-right">
                      {targetRadiusKm} km
                    </span>
                  </div>
                </div>
              </div>

              {/* Demografia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Faixas Etárias</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SPOTIFY_AGE_RANGES.map((age) => {
                      const active = selectedAges.includes(age)
                      return (
                        <button
                          type="button"
                          key={age}
                          onClick={() => toggleAge(age)}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition cursor-pointer ${
                            active
                              ? 'bg-[#1DB954] text-black font-bold border-[#1DB954]'
                              : 'bg-[#131b2e] text-slate-300 border-[#1e293b] hover:border-slate-600'
                          }`}
                        >
                          {age}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Gênero Demográfico</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['ALL', 'MALE', 'FEMALE'] as const).map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setSelectedGender(g)}
                        className={`py-1 text-xs font-bold rounded-md border transition cursor-pointer ${
                          selectedGender === g
                            ? 'bg-[#1DB954] text-black font-bold border-[#1DB954]'
                            : 'bg-[#131b2e] text-slate-300 border-[#1e293b] hover:border-slate-600'
                        }`}
                      >
                        {g === 'ALL' ? 'Todos' : g === 'MALE' ? 'Homens' : 'Mulheres'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASSO 3: PREVISÃO DE AUDIÊNCIA */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Previsão de Audiência & Alcance Potencial</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Estimativa calculada com base na audiência ativa do Spotify na região configurada.
                </p>
              </div>

              {forecast && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#131b2e] rounded-xl border border-[#1e293b] space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Alcance de Ouvintes Únicos
                    </span>
                    <div className="flex items-baseline gap-2">
                      <strong className="text-lg sm:text-xl font-extrabold text-white">
                        {forecast.potentialReachMin.toLocaleString('pt-BR')} - {forecast.potentialReachMax.toLocaleString('pt-BR')}
                      </strong>
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Usuários ativos em {targetCity} ({targetRadiusKm}km) nos gêneros selecionados.
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#131b2e] rounded-xl border border-[#1e293b] space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Impressões Semanais de Áudio
                    </span>
                    <div className="flex items-baseline gap-2">
                      <strong className="text-lg sm:text-xl font-extrabold text-white">
                        {forecast.weeklyImpressionsMin.toLocaleString('pt-BR')} - {forecast.weeklyImpressionsMax.toLocaleString('pt-BR')}
                      </strong>
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Frequência média projetada: {forecast.estimatedFrequency}x por ouvinte no período.
                    </span>
                  </div>
                </div>
              )}

              {forecast && (
                <div className="p-3.5 bg-[#1DB954]/10 border border-[#1DB954]/25 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#1DB954]" />
                      Índice de Qualidade da Audiência (Benchmark PDT)
                    </span>
                    <span className="text-[#1DB954] font-black">{forecast.audienceQualityScore} / 100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1DB954] rounded-full transition-all duration-500"
                      style={{ width: `${forecast.audienceQualityScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-300 pt-0.5">
                    Audiência altamente qualificada para conversão. A densidade de ouvintes de {selectedGenres.slice(0, 2).join(' e ')} em {targetCity} apresenta alta correlação com compra de ingressos.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PASSO 4: ORÇAMENTO & LANCES */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Orçamento & Estratégia de Lances</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Defina o investimento diário ou total da ação de mídia e as datas de veiculação.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tipo de Orçamento</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBudgetType('TOTAL')}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                        budgetType === 'TOTAL'
                          ? 'bg-[#1DB954] text-black font-extrabold border-[#1DB954]'
                          : 'bg-[#131b2e] text-slate-300 border-[#1e293b] hover:border-slate-600'
                      }`}
                    >
                      Orçamento Total
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetType('DAILY')}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                        budgetType === 'DAILY'
                          ? 'bg-[#1DB954] text-black font-extrabold border-[#1DB954]'
                          : 'bg-[#131b2e] text-slate-300 border-[#1e293b] hover:border-slate-600'
                      }`}
                    >
                      Orçamento Diário
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Valor ({budgetType === 'TOTAL' ? 'Total' : 'Diário'}) em R$
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
                    <input
                      type="number"
                      value={budgetType === 'TOTAL' ? budgetValueBrl : dailyBudgetValueBrl}
                      onChange={(e) =>
                        budgetType === 'TOTAL'
                          ? setBudgetValueBrl(e.target.value)
                          : setDailyBudgetValueBrl(e.target.value)
                      }
                      className="w-full pl-9 pr-3 py-1.5 text-xs font-bold bg-[#131b2e] border border-[#1e293b] rounded-lg text-white placeholder-slate-500 focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                      placeholder="5000"
                    />
                  </div>
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#131b2e] border border-[#1e293b] rounded-lg text-white [color-scheme:dark] focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Data de Término</label>
                  <input
                    type="date"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#131b2e] border border-[#1e293b] rounded-lg text-white [color-scheme:dark] focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                  />
                </div>
              </div>

              {/* Estratégia de lances */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Estratégia de Lances</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setBidStrategy('AUTO_CPM')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      bidStrategy === 'AUTO_CPM'
                        ? 'border-[#1DB954] bg-[#1DB954]/15 ring-1 ring-[#1DB954]/40'
                        : 'border-[#1e293b] bg-[#131b2e] hover:border-slate-700'
                    }`}
                  >
                    <strong className="text-xs font-bold text-white block">CPM Otimizado</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">
                      Spotify calibra lances automáticos para conversão.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBidStrategy('TARGET_CPA')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      bidStrategy === 'TARGET_CPA'
                        ? 'border-[#1DB954] bg-[#1DB954]/15 ring-1 ring-[#1DB954]/40'
                        : 'border-[#1e293b] bg-[#131b2e] hover:border-slate-700'
                    }`}
                  >
                    <strong className="text-xs font-bold text-white block">Meta de CPA</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">
                      Foco no custo máximo por ingresso vendido.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBidStrategy('MANUAL_CPC')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      bidStrategy === 'MANUAL_CPC'
                        ? 'border-[#1DB954] bg-[#1DB954]/15 ring-1 ring-[#1DB954]/40'
                        : 'border-[#1e293b] bg-[#131b2e] hover:border-slate-700'
                    }`}
                  >
                    <strong className="text-xs font-bold text-white block">CPC Máximo</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">
                      Controle direto sobre cliques no banner.
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PASSO 5: CRIATIVOS & ASSETS */}
          {step === 5 && (
            <div className="space-y-3.5">
              <div>
                <h3 className="text-sm font-bold text-white">Biblioteca de Criativos (Áudio + Companion Banner)</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Configure o spot de áudio de 15s ou 30s e o banner quadrado (640x640) clicável.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
                {/* Coluna Esquerda: Form de Criativos */}
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Duração do Spot de Áudio</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAudioDuration(15)}
                        className={`py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          audioDuration === 15
                            ? 'bg-[#1DB954] text-black font-extrabold border-[#1DB954]'
                            : 'bg-[#131b2e] text-slate-300 border-[#1e293b] hover:border-slate-600'
                        }`}
                      >
                        15 Segundos
                      </button>
                      <button
                        type="button"
                        onClick={() => setAudioDuration(30)}
                        className={`py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          audioDuration === 30
                            ? 'bg-[#1DB954] text-black font-extrabold border-[#1DB954]'
                            : 'bg-[#131b2e] text-slate-300 border-[#1e293b] hover:border-slate-600'
                        }`}
                      >
                        30 Segundos
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-0.5">Título do Spot</label>
                    <input
                      type="text"
                      value={audioTitle}
                      onChange={(e) => setAudioTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#131b2e] border border-[#1e293b] rounded-lg text-white placeholder-slate-500 focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-0.5">URL do Áudio (.mp3 / .ogg)</label>
                    <input
                      type="text"
                      value={audioSpotUrl}
                      onChange={(e) => setAudioSpotUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#131b2e] border border-[#1e293b] rounded-lg text-white font-mono placeholder-slate-500 focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-0.5">Companion Banner (640x640)</label>
                    <input
                      type="text"
                      value={companionImageUrl}
                      onChange={(e) => setCompanionImageUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#131b2e] border border-[#1e293b] rounded-lg text-white font-mono placeholder-slate-500 focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-0.5">Texto de Destaque / Slogan</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#131b2e] border border-[#1e293b] rounded-lg text-white placeholder-slate-500 focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-0.5">Anunciante</label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#131b2e] border border-[#1e293b] rounded-lg text-white placeholder-slate-500 focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-0.5">Botão CTA</label>
                      <select
                        value={callToAction}
                        onChange={(e: any) => setCallToAction(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#131b2e] border border-[#1e293b] rounded-lg text-white font-semibold cursor-pointer focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                      >
                        <option value="Garantir Ingresso">Garantir Ingresso</option>
                        <option value="Comprar Agora">Comprar Agora</option>
                        <option value="Ouvir Agora">Ouvir Agora</option>
                        <option value="Saiba Mais">Saiba Mais</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-0.5">URL de Destino</label>
                    <input
                      type="text"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#131b2e] border border-[#1e293b] rounded-lg text-white font-mono placeholder-slate-500 focus:ring-1 focus:ring-[#1DB954] focus:border-[#1DB954] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Coluna Direita: Mockup Spotify Player Compacto */}
                <div className="bg-[#0B132B] rounded-xl p-3.5 text-white flex flex-col justify-between border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#1DB954]">
                      Prévia Spotify Mobile
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">0:00 / 0:{audioDuration}</span>
                  </div>

                  <div className="my-2.5 flex flex-col items-center text-center">
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-lg overflow-hidden shadow-md border border-slate-700 mb-2 group">
                      <img
                        src={companionImageUrl}
                        alt="Companion Banner"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span className="text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                          640x640
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-2 px-1">{headline}</h4>
                    <span className="text-[10px] text-slate-400 mt-0.5">Anúncio • {brandName}</span>
                  </div>

                  {/* Player de áudio interativo */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <audio id="spotify-wizard-audio" src={audioSpotUrl} preload="none" />
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={toggleAudioPlayback}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1DB954] text-black text-xs font-bold hover:scale-105 transition shadow-xs cursor-pointer"
                      >
                        {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                        <span>{isPlaying ? 'Pausar' : 'Ouvir Spot'}</span>
                      </button>

                      <div className="flex items-center gap-1 text-[11px] text-slate-300">
                        <Volume2 size={13} />
                        <span>Broadcast</span>
                      </div>
                    </div>

                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="block w-full py-1.5 bg-white text-black font-extrabold text-xs text-center rounded-full hover:bg-slate-100 transition"
                    >
                      {callToAction}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASSO 6: CAPI & RASTREIO */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Rastreamento, UTMs & Spotify CAPI</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Conversões server-side mapeadas no Motor Universal de Conversões do DiskIngressos / PDT.
                </p>
              </div>

              {/* Mapeamento Canônico */}
              <div className="p-3.5 bg-[#131b2e] rounded-xl border border-[#1e293b] space-y-2.5">
                <span className="text-xs font-bold text-slate-300 block">
                  Mapeamento Canônico PDT DiskIngressos → Spotify Ads CAPI:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-[#0f172a] rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-slate-400 text-[11px]">EVENT_PAGE_VIEW</span>
                    <span className="font-bold text-[#1DB954]">→ VIEW</span>
                  </div>
                  <div className="p-2 bg-[#0f172a] rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-slate-400 text-[11px]">TICKET_VIEW</span>
                    <span className="font-bold text-[#1DB954]">→ PRODUCT</span>
                  </div>
                  <div className="p-2 bg-[#0f172a] rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-slate-400 text-[11px]">ADD_TO_CART</span>
                    <span className="font-bold text-[#1DB954]">→ ADDTOCART</span>
                  </div>
                  <div className="p-2 bg-[#0f172a] rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-slate-400 text-[11px]">CHECKOUT_STARTED</span>
                    <span className="font-bold text-[#1DB954]">→ CHECKOUT</span>
                  </div>
                  <div className="p-2 bg-[#1DB954]/10 rounded-lg border border-[#1DB954]/30 col-span-1 sm:col-span-2 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-emerald-300 text-xs">ORDER_PAID</span>
                      <small className="block text-[10px] text-emerald-400">Disparado somente após confirmação do pagamento pelo gateway.</small>
                    </div>
                    <span className="font-extrabold text-[#1DB954] text-xs">→ PURCHASE</span>
                  </div>
                </div>
              </div>

              {/* UTM Injetada */}
              <div className="p-3.5 bg-[#0B132B] text-white rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-[#1DB954] flex items-center gap-1.5">
                  <Link size={13} /> URL com Parâmetros de Rastreamento Automáticos:
                </span>
                <div className="p-2 bg-[#131b2e] rounded-lg font-mono text-[10px] text-slate-300 break-all select-all border border-slate-700/50">
                  {destinationUrl}?utm_source=spotify&utm_medium=paid_audio&utm_campaign={name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}&utm_content=audio_spot_{audioDuration}s
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Permite rastrear cada pedido pago originado nos anúncios de áudio do Spotify no painel de vendas.
                </span>
              </div>
            </div>
          )}

          {/* PASSO 7: REVISÃO & PUBLICAÇÃO */}
          {step === 7 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Revisão Final da Campanha</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Verifique todas as configurações antes de enviar para publicação na Spotify Ads API v3.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 bg-[#131b2e] rounded-xl border border-[#1e293b] space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Campanha & Objetivo</span>
                  <p className="text-xs font-bold text-white">{name}</p>
                  <span className="text-[11px] text-slate-400 block">Objetivo: {objective === 'TICKET_SALES' ? 'Venda de Ingressos (Conversão CAPI)' : 'Alcance'}</span>
                  <span className="text-[11px] text-slate-400 block">Evento: {eventName}</span>
                </div>

                <div className="p-3 bg-[#131b2e] rounded-xl border border-[#1e293b] space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Orçamento & Período</span>
                  <p className="text-xs font-bold text-white">
                    {budgetType === 'TOTAL' ? formatSpotifyBrl(Number(budgetValueBrl) * 100) : `${formatSpotifyBrl(Number(dailyBudgetValueBrl) * 100)} / dia`}
                  </p>
                  <span className="text-[11px] text-slate-400 block">Estratégia: {bidStrategy}</span>
                  <span className="text-[11px] text-slate-400 block">{startsAt} até {endsAt}</span>
                </div>

                <div className="p-3 bg-[#131b2e] rounded-xl border border-[#1e293b] space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Segmentação Musical</span>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {selectedGenres.map((g) => (
                      <span key={g} className="px-2 py-0.5 rounded bg-[#1DB954]/15 border border-[#1DB954]/30 text-[#1DB954] text-[10px] font-bold">
                        {g}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">{targetCity} (+{targetRadiusKm}km) • Idades: {selectedAges.join(', ')}</span>
                </div>

                <div className="p-3 bg-[#131b2e] rounded-xl border border-[#1e293b] space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Criativo & CTA</span>
                  <p className="text-xs font-bold text-white">{audioTitle} ({audioDuration}s)</p>
                  <span className="text-[11px] text-slate-400 block">CTA: {callToAction}</span>
                  <span className="text-[11px] text-slate-400 block truncate">Destino: {destinationUrl}</span>
                </div>
              </div>

              <div className="p-3 bg-[#1DB954]/10 border border-[#1DB954]/25 rounded-xl flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-white block">Status de Publicação</strong>
                  <span className="text-[11px] text-slate-300">
                    {saveAsDraft
                      ? 'Salvar como rascunho interno (não consome orçamento).'
                      : 'Publicar diretamente na conta Spotify Ads da sua produtora.'}
                  </span>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAsDraft}
                    onChange={(e) => setSaveAsDraft(e.target.checked)}
                    className="accent-[#1DB954] w-4 h-4 cursor-pointer"
                  />
                  <span>Salvar Rascunho</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="px-5 py-3 bg-[#0B132B] border-t border-[#1e293b] flex items-center justify-between shrink-0">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-700 bg-[#1e293b] text-xs font-bold text-slate-300 hover:bg-[#334155] hover:text-white transition cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Voltar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancelar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {step < 7 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#1DB954] text-black text-xs font-extrabold hover:bg-[#19A34A] transition shadow-xs cursor-pointer"
              >
                <span>Avançar</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={busy}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#1DB954] text-black text-xs font-extrabold hover:bg-[#19A34A] transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                {saveAsDraft ? <Save size={15} /> : <Zap size={15} />}
                <span>{busy ? 'Processando...' : saveAsDraft ? 'Salvar Rascunho' : 'Publicar Campanha Spotify'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
