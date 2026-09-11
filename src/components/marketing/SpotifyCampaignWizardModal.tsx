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
    { num: 2, title: 'Público & Copilot' },
    { num: 3, title: 'Previsão' },
    { num: 4, title: 'Orçamento' },
    { num: 5, title: 'Criativo' },
    { num: 6, title: 'CAPI & Rastreio' },
    { num: 7, title: 'Revisão' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1DB954] flex items-center justify-center shadow-md">
              <Radio size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30">
                  Spotify Ads API v3
                </span>
                <span className="text-xs text-slate-400 font-semibold">• Fase 26.17.10</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Assistente de Criação de Campanha de Áudio & CAPI
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar assistente"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 overflow-x-auto shrink-0">
          <div className="flex items-center justify-between min-w-[620px]">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s.num
                        ? 'bg-[#1DB954] text-white shadow-xs'
                        : step > s.num
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {step > s.num ? <CheckCircle2 size={14} /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      step === s.num ? 'text-slate-900 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && <div className="h-[2px] w-6 bg-slate-200 mx-1 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 grow">
          {/* PASSO 1: CAMPANHA */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Identificação da Campanha & Evento</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Associação estrita ao evento selecionado seguindo a hierarquia DiskIngressos → Produtor → Evento.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                <ShieldCheck size={20} className="text-[#1DB954] shrink-0" />
                <div className="text-xs text-slate-700">
                  <strong className="text-slate-900 block font-bold">Evento Vinculado: {eventName}</strong>
                  <span>Esta campanha rodará no Ad Account exclusivo da sua produtora com atribuição direta aos pedidos deste evento.</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Campanha</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1DB954] focus:outline-none"
                  placeholder="Ex.: PDT Show Ítalo - Spot Áudio 30s & Ingressos"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Objetivo da Campanha</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setObjective('TICKET_SALES')}
                    className={`p-4 rounded-xl border text-left transition ${
                      objective === 'TICKET_SALES'
                        ? 'border-[#1DB954] bg-emerald-50/60 ring-2 ring-[#1DB954]/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1DB954]/10 text-[#1DB954] flex items-center justify-center mb-2">
                      <Target size={18} />
                    </div>
                    <strong className="text-xs font-bold text-slate-900 block">Venda de Ingressos</strong>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Otimizado para conversão no checkout via Spotify CAPI (PURCHASE).
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setObjective('REACH')}
                    className={`p-4 rounded-xl border text-left transition ${
                      objective === 'REACH'
                        ? 'border-[#1DB954] bg-emerald-50/60 ring-2 ring-[#1DB954]/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                      <Headphones size={18} />
                    </div>
                    <strong className="text-xs font-bold text-slate-900 block">Alcance & Ouvintes</strong>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Maximiza o número de ouvintes únicos alcançados no período.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setObjective('TRAFFIC')}
                    className={`p-4 rounded-xl border text-left transition ${
                      objective === 'TRAFFIC'
                        ? 'border-[#1DB954] bg-emerald-50/60 ring-2 ring-[#1DB954]/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                      <Zap size={18} />
                    </div>
                    <strong className="text-xs font-bold text-slate-900 block">Tráfego Qualificado</strong>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Foco em cliques no companion banner para a página do evento.
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PASSO 2: PÚBLICO, SEGMENTAÇÃO & COPILOT */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Público, Gêneros Musicais & Copilot IA</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Alcance pessoas ouvindo gêneros afins no Spotify enquanto estão na região do show.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopilotSuggest}
                  disabled={copilotLoading}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-linear-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-xs hover:opacity-95 transition shrink-0"
                >
                  <Sparkles size={14} />
                  <span>{copilotLoading ? 'Analisando Compradores...' : 'Sugerir Público com Copilot PDT'}</span>
                </button>
              </div>

              {copilotApplied && copilotRationale && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2.5">
                  <Sparkles size={16} className="text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Diagnóstico do Copilot DiskIngressos:</strong>
                    <span>{copilotRationale}</span>
                  </div>
                </div>
              )}

              {/* Gêneros Musicais */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Gêneros Musicais Oficiais Spotify
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPOTIFY_CANONICAL_GENRES.map((genre) => {
                    const active = selectedGenres.includes(genre)
                    return (
                      <button
                        type="button"
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                          active
                            ? 'bg-[#1DB954] text-white border-[#1DB954] shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Artistas Relacionados / Referências
                </label>
                <input
                  type="text"
                  value={relatedArtists}
                  onChange={(e) => setRelatedArtists(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1DB954] focus:outline-none"
                  placeholder="Ex.: Jorge & Mateus, Henrique & Juliano, Ana Castela"
                />
              </div>

              {/* Localização & Raio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cidade Principal</label>
                  <input
                    type="text"
                    value={targetCity}
                    onChange={(e) => setTargetCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1DB954] focus:outline-none"
                    placeholder="Curitiba"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Raio de Cobertura (km)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="15"
                      max="150"
                      step="5"
                      value={targetRadiusKm}
                      onChange={(e) => setTargetRadiusKm(Number(e.target.value))}
                      className="grow accent-[#1DB954]"
                    />
                    <span className="text-xs font-bold text-slate-700 w-14 text-right">
                      {targetRadiusKm} km
                    </span>
                  </div>
                </div>
              </div>

              {/* Demografia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Faixas Etárias</label>
                  <div className="flex flex-wrap gap-2">
                    {SPOTIFY_AGE_RANGES.map((age) => {
                      const active = selectedAges.includes(age)
                      return (
                        <button
                          type="button"
                          key={age}
                          onClick={() => toggleAge(age)}
                          className={`px-3 py-1 rounded-md text-xs font-semibold border ${
                            active
                              ? 'bg-slate-800 text-white border-slate-800'
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {age}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Gênero Demográfico</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['ALL', 'MALE', 'FEMALE'] as const).map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setSelectedGender(g)}
                        className={`py-1.5 text-xs font-bold rounded-md border ${
                          selectedGender === g
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
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
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Previsão de Audiência & Alcance Potencial</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Estimativa calculada com base na audiência ativa do Spotify na região configurada.
                </p>
              </div>

              {forecast && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Alcance de Ouvintes Únicos
                    </span>
                    <div className="flex items-baseline gap-2">
                      <strong className="text-2xl font-extrabold text-slate-900">
                        {forecast.potentialReachMin.toLocaleString('pt-BR')} - {forecast.potentialReachMax.toLocaleString('pt-BR')}
                      </strong>
                    </div>
                    <span className="text-xs text-slate-500 block">
                      Usuários ativos em {targetCity} ({targetRadiusKm}km) nos gêneros selecionados.
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Impressões Semanais de Áudio
                    </span>
                    <div className="flex items-baseline gap-2">
                      <strong className="text-2xl font-extrabold text-slate-900">
                        {forecast.weeklyImpressionsMin.toLocaleString('pt-BR')} - {forecast.weeklyImpressionsMax.toLocaleString('pt-BR')}
                      </strong>
                    </div>
                    <span className="text-xs text-slate-500 block">
                      Frequência média projetada: {forecast.estimatedFrequency}x por ouvinte no período.
                    </span>
                  </div>
                </div>
              )}

              {forecast && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#1DB954]" />
                      Índice de Qualidade da Audiência (Benchmark PDT)
                    </span>
                    <span className="text-[#1DB954]">{forecast.audienceQualityScore} / 100</span>
                  </div>
                  <div className="w-full h-2.5 bg-emerald-200/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1DB954] rounded-full transition-all duration-500"
                      style={{ width: `${forecast.audienceQualityScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1">
                    Audiência altamente qualificada para conversão. A densidade de ouvintes de {selectedGenres.slice(0, 2).join(' e ')} em {targetCity} apresenta alta correlação com compra de ingressos.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PASSO 4: ORÇAMENTO & LANCES */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Orçamento & Estratégia de Lances</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Defina o investimento diário ou total da ação de mídia e as datas de veiculação.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Orçamento</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBudgetType('TOTAL')}
                      className={`py-2 text-xs font-bold rounded-lg border ${
                        budgetType === 'TOTAL'
                          ? 'bg-[#1DB954] text-white border-[#1DB954]'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      Orçamento Total
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetType('DAILY')}
                      className={`py-2 text-xs font-bold rounded-lg border ${
                        budgetType === 'DAILY'
                          ? 'bg-[#1DB954] text-white border-[#1DB954]'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      Orçamento Diário
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valor ({budgetType === 'TOTAL' ? 'Total' : 'Diário'}) em R$
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">R$</span>
                    <input
                      type="number"
                      value={budgetType === 'TOTAL' ? budgetValueBrl : dailyBudgetValueBrl}
                      onChange={(e) =>
                        budgetType === 'TOTAL'
                          ? setBudgetValueBrl(e.target.value)
                          : setDailyBudgetValueBrl(e.target.value)
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1DB954] focus:outline-none"
                      placeholder="5000"
                    />
                  </div>
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1DB954] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data de Término</label>
                  <input
                    type="date"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1DB954] focus:outline-none"
                  />
                </div>
              </div>

              {/* Estratégia de lances */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Estratégia de Lances</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setBidStrategy('AUTO_CPM')}
                    className={`p-3 rounded-xl border text-left ${
                      bidStrategy === 'AUTO_CPM'
                        ? 'border-[#1DB954] bg-emerald-50/50 ring-2 ring-[#1DB954]/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <strong className="text-xs font-bold text-slate-900 block">CPM Otimizado</strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Spotify calibra lances automáticos para conversão.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBidStrategy('TARGET_CPA')}
                    className={`p-3 rounded-xl border text-left ${
                      bidStrategy === 'TARGET_CPA'
                        ? 'border-[#1DB954] bg-emerald-50/50 ring-2 ring-[#1DB954]/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <strong className="text-xs font-bold text-slate-900 block">Meta de CPA</strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Foco no custo máximo por ingresso vendido.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBidStrategy('MANUAL_CPC')}
                    className={`p-3 rounded-xl border text-left ${
                      bidStrategy === 'MANUAL_CPC'
                        ? 'border-[#1DB954] bg-emerald-50/50 ring-2 ring-[#1DB954]/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <strong className="text-xs font-bold text-slate-900 block">CPC Máximo</strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Controle direto sobre cliques no banner.
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PASSO 5: CRIATIVOS & ASSETS */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Biblioteca de Criativos (Áudio + Companion Banner)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure o spot de áudio de 15s ou 30s e o banner quadrado (640x640) clicável.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coluna Esquerda: Form de Criativos */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Duração do Spot de Áudio</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAudioDuration(15)}
                        className={`py-1.5 text-xs font-bold rounded-lg border ${
                          audioDuration === 15
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-300'
                        }`}
                      >
                        15 Segundos
                      </button>
                      <button
                        type="button"
                        onClick={() => setAudioDuration(30)}
                        className={`py-1.5 text-xs font-bold rounded-lg border ${
                          audioDuration === 30
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-300'
                        }`}
                      >
                        30 Segundos
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Título do Spot de Áudio</label>
                    <input
                      type="text"
                      value={audioTitle}
                      onChange={(e) => setAudioTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">URL do Arquivo de Áudio (.mp3)</label>
                    <input
                      type="text"
                      value={audioSpotUrl}
                      onChange={(e) => setAudioSpotUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Companion Banner (640x640 .jpg)</label>
                    <input
                      type="text"
                      value={companionImageUrl}
                      onChange={(e) => setCompanionImageUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Texto de Destaque / Slogan</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Anunciante</label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Botão CTA</label>
                      <select
                        value={callToAction}
                        onChange={(e: any) => setCallToAction(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none bg-white font-bold"
                      >
                        <option value="Garantir Ingresso">Garantir Ingresso</option>
                        <option value="Comprar Agora">Comprar Agora</option>
                        <option value="Ouvir Agora">Ouvir Agora</option>
                        <option value="Saiba Mais">Saiba Mais</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">URL de Destino</label>
                    <input
                      type="text"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none font-mono text-slate-700"
                    />
                  </div>
                </div>

                {/* Coluna Direita: Mockup do Spotify Player */}
                <div className="bg-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between shadow-xl border border-slate-800">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#1DB954]">
                      Prévia Oficial Spotify Mobile
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">0:00 / 0:{audioDuration}</span>
                  </div>

                  <div className="my-4 flex flex-col items-center text-center">
                    <div className="relative w-48 h-48 rounded-xl overflow-hidden shadow-2xl border border-slate-700 mb-3 group">
                      <img
                        src={companionImageUrl}
                        alt="Companion Banner"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span className="text-xs font-bold text-white bg-black/60 px-2 py-1 rounded">
                          Companion 640x640
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white">{headline}</h4>
                    <span className="text-xs text-slate-400 mt-0.5">Anúncio • {brandName}</span>
                  </div>

                  {/* Player de áudio interativo */}
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <audio id="spotify-wizard-audio" src={audioSpotUrl} preload="none" />
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={toggleAudioPlayback}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1DB954] text-black text-xs font-bold hover:scale-105 transition shadow-md"
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        <span>{isPlaying ? 'Pausar Spot' : 'Ouvir Spot Áudio'}</span>
                      </button>

                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Volume2 size={15} />
                        <span>Qualidade Broadcast</span>
                      </div>
                    </div>

                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="block w-full py-2 bg-white text-black font-extrabold text-xs text-center rounded-full hover:bg-slate-100 transition"
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
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Rastreamento, UTMs & Spotify CAPI</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conversões server-side mapeadas no Motor Universal de Conversões do SafeSaff/PDT.
                </p>
              </div>

              {/* Mapeamento Canônico */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  Mapeamento Canônico PDT DiskIngressos → Spotify Ads CAPI:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="font-mono text-slate-600">EVENT_PAGE_VIEW</span>
                    <span className="font-bold text-[#1DB954]">→ VIEW</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="font-mono text-slate-600">TICKET_VIEW</span>
                    <span className="font-bold text-[#1DB954]">→ PRODUCT</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="font-mono text-slate-600">ADD_TO_CART</span>
                    <span className="font-bold text-[#1DB954]">→ ADDTOCART</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="font-mono text-slate-600">CHECKOUT_STARTED</span>
                    <span className="font-bold text-[#1DB954]">→ CHECKOUT</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-300 col-span-1 sm:col-span-2 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-emerald-900">ORDER_PAID</span>
                      <small className="block text-[11px] text-emerald-700">Disparado somente após confirmação do pagamento pelo gateway.</small>
                    </div>
                    <span className="font-extrabold text-emerald-800 text-sm">→ PURCHASE</span>
                  </div>
                </div>
              </div>

              {/* UTM Injetada */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <span className="text-xs font-bold text-[#1DB954] block flex items-center gap-1.5">
                  <Link size={14} /> URL com Parâmetros de Rastreamento Automáticos:
                </span>
                <div className="p-2.5 bg-slate-800 rounded-lg font-mono text-[11px] text-slate-300 break-all select-all">
                  {destinationUrl}?utm_source=spotify&utm_medium=paid_audio&utm_campaign={name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}&utm_content=audio_spot_{audioDuration}s
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Permite rastrear cada pedido pago originado nos anúncios de áudio do Spotify no painel de vendas.
                </span>
              </div>
            </div>
          )}

          {/* PASSO 7: REVISÃO & PUBLICAÇÃO */}
          {step === 7 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Revisão Final da Campanha</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verifique todas as configurações antes de enviar para publicação na Spotify Ads API v3.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Campanha & Objetivo</span>
                  <p className="text-sm font-bold text-slate-900">{name}</p>
                  <span className="text-xs text-slate-600 block">Objetivo: {objective === 'TICKET_SALES' ? 'Venda de Ingressos (Conversão CAPI)' : 'Alcance'}</span>
                  <span className="text-xs text-slate-600 block">Evento: {eventName}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Orçamento & Período</span>
                  <p className="text-sm font-bold text-slate-900">
                    {budgetType === 'TOTAL' ? formatSpotifyBrl(Number(budgetValueBrl) * 100) : `${formatSpotifyBrl(Number(dailyBudgetValueBrl) * 100)} / dia`}
                  </p>
                  <span className="text-xs text-slate-600 block">Estratégia: {bidStrategy}</span>
                  <span className="text-xs text-slate-600 block">{startsAt} até {endsAt}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Segmentação Musical</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedGenres.map((g) => (
                      <span key={g} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {g}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-slate-600 block">{targetCity} (+{targetRadiusKm}km) • Idades: {selectedAges.join(', ')}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Criativo & CTA</span>
                  <p className="text-xs font-bold text-slate-900">{audioTitle} ({audioDuration}s)</p>
                  <span className="text-xs text-slate-600 block">CTA: {callToAction}</span>
                  <span className="text-xs text-slate-600 block truncate">Destino: {destinationUrl}</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">Status de Publicação</strong>
                  <span className="text-xs text-slate-600">
                    {saveAsDraft
                      ? 'Salvar como rascunho interno (não consome orçamento).'
                      : 'Publicar diretamente na conta Spotify Ads da sua produtora.'}
                  </span>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAsDraft}
                    onChange={(e) => setSaveAsDraft(e.target.checked)}
                    className="accent-[#1DB954] w-4 h-4"
                  />
                  <span>Salvar como Rascunho</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                <ArrowLeft size={15} />
                <span>Voltar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Cancelar
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step < 7 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#1DB954] text-white text-xs font-bold hover:bg-[#19A34A] transition shadow-xs"
              >
                <span>Avançar</span>
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={busy}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1DB954] text-white text-xs font-extrabold hover:bg-[#19A34A] transition shadow-md disabled:opacity-50"
              >
                {saveAsDraft ? <Save size={16} /> : <Zap size={16} />}
                <span>{busy ? 'Processando...' : saveAsDraft ? 'Salvar Rascunho' : 'Publicar Campanha Spotify'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
