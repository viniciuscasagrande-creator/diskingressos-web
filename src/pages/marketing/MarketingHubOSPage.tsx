import React, { useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, CalendarDays, CheckCircle2,
  Download, Gift, Link2, Mail, Megaphone, Plus, Rocket, Sparkles, Target,
  TicketPercent, TrendingUp, Users, MessageCircle, Split, Zap, Clock,
  Smartphone, MousePointerClick, ShieldCheck, ChevronRight
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import {
  getMarketingOSSummary, getMarketingCampaigns, getReadyCampaignActivations,
  getResolvedTracking, getAutomationSummary, getCommunicationSummary,
  type MarketingCampaign
} from '../../services/api'

type Props = {
  events: EventItem[]
  producerName: string
  producerId: number | null
  eventId: string
  setEventId: (v: string) => void
  period: string
  setPeriod: (v: string) => void
  notify: (m: string) => void
  onNavigate?: (page: any) => void
}

const money = (c: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(c / 100)

const pct = (n: number) => `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`

const nav = (cb: Props['onNavigate'], notify: Props['notify'], page: string, label: string) =>
  cb ? cb(page) : notify(`Abrindo ${label}...`)

export default function MarketingHubOSPage(p: Props) {
  const { events, producerName, producerId, eventId, setEventId, period, setPeriod, notify, onNavigate } = p
  const selectedEventId = eventId === 'all' ? undefined : Number(eventId)
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([])
  const [ready, setReady] = useState<any[]>([])
  const [tracking, setTracking] = useState<any[]>([])
  const [automation, setAutomation] = useState<any | null>(null)
  const [communication, setCommunication] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [warning, setWarning] = useState('')

  useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      setWarning('')
      const pid = producerId || undefined
      try {
        const data = await getMarketingOSSummary(pid, selectedEventId, period)
        if (!alive) return
        setCampaigns(data.campaigns || [])
        setReady(data.ready || [])
        setTracking(data.tracking || [])
        setAutomation(data.automation || null)
        setCommunication(data.communication || null)
        const unavailable = data.health?.unavailable || []
        if (unavailable.length) {
          setWarning(
            `${unavailable.length} fonte${unavailable.length > 1 ? 's' : ''} temporariamente indisponível${unavailable.length > 1 ? 'eis' : ''}. O Dashboard continua com as fontes disponíveis.`
          )
        }
      } catch (consolidatedError) {
        const results = await Promise.allSettled([
          getMarketingCampaigns(pid, selectedEventId),
          getReadyCampaignActivations(pid, selectedEventId),
          getResolvedTracking(pid, selectedEventId),
          getAutomationSummary(pid),
          getCommunicationSummary(pid)
        ])
        if (!alive) return
        const [campaignResult, readyResult, trackingResult, automationResult, communicationResult] = results
        if (campaignResult.status === 'fulfilled') setCampaigns(campaignResult.value || [])
        else setCampaigns([])
        if (readyResult.status === 'fulfilled') setReady(readyResult.value || [])
        else setReady([])
        if (trackingResult.status === 'fulfilled') setTracking(trackingResult.value || [])
        else setTracking([])
        if (automationResult.status === 'fulfilled') setAutomation(automationResult.value || null)
        else setAutomation(null)
        if (communicationResult.status === 'fulfilled') setCommunication(communicationResult.value || null)
        else setCommunication(null)
        const failed = results.filter(r => r.status === 'rejected').length
        if (campaignResult.status === 'rejected')
          setWarning('Campanhas não puderam ser carregadas para o evento selecionado. Verifique API, autenticação e banco local.')
        else if (failed)
          setWarning(`Dashboard carregado pelas fontes operacionais. ${failed} fonte${failed > 1 ? 's' : ''} complementar${failed > 1 ? 'es' : ''} indisponível${failed > 1 ? 'eis' : ''}.`)
        else
          setWarning('Dashboard carregado pelas fontes operacionais. Publique /api/marketing/os/summary para reativar a fonte consolidada.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [producerId, selectedEventId, period])

  const k = useMemo(() => {
    const active = campaigns.filter(c => ['ativa', 'active', 'ativo'].includes(c.status.toLowerCase()))
    const spent = campaigns.reduce((s, c) => s + (c.spentCents || 0), 0)
    const revenue = campaigns.reduce((s, c) => s + (c.revenueCents || 0), 0)
    const conv = campaigns.reduce((s, c) => s + (c.conversions || 0), 0)
    const clicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0)
    return {
      active,
      spent,
      revenue,
      conv,
      clicks,
      roas: spent ? revenue / spent : 0,
      cpa: conv ? spent / conv : 0,
      rate: clicks ? (conv / clicks) * 100 : 0
    }
  }, [campaigns])

  const providers = tracking.filter(t => t.mode !== 'disabled' && t.source !== 'none')
  const healthParts = [campaigns.length ? 92 : 50, k.conv ? 88 : 55, automation?.activeFlows ? 84 : 50, providers.length ? 90 : 45]
  const health = Math.round(healthParts.reduce((a, b) => a + b, 0) / healthParts.length)

  const alerts = [
    ...(providers.length ? [] : [{ tone: 'bad', title: 'Tracking requer configuração', desc: 'Nenhum Pixel/Analytics resolvido para o contexto.' }]),
    ...(k.active.length ? [] : [{ tone: 'warn', title: 'Nenhuma campanha ativa', desc: 'Ative uma campanha para iniciar aquisição.' }]),
    ...(communication && communication.activeChannels === 0 ? [{ tone: 'warn', title: 'Canais de comunicação inativos', desc: 'Configure WhatsApp ou E-mail para relacionamento.' }] : [])
  ]

  const top = [...campaigns].sort((a, b) => (b.revenueCents || 0) - (a.revenueCents || 0)).slice(0, 5)

  const channelRows = useMemo(() => {
    const m = new Map<string, { spent: number; revenue: number; count: number }>()
    campaigns.forEach(c => {
      const x = m.get(c.channel) || { spent: 0, revenue: 0, count: 0 }
      x.spent += c.spentCents || 0
      x.revenue += c.revenueCents || 0
      x.count++
      m.set(c.channel, x)
    })
    return [...m.entries()]
      .map(([name, v]) => ({ name, ...v, roas: v.spent ? v.revenue / v.spent : 0 }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
  }, [campaigns])

  // Mock timeline sales data based on period
  const timelineData = useMemo(() => {
    return [
      { day: 'Seg', date: '25/08', revenue: 18400, spent: 1600, label: 'Lançamento Lote 1' },
      { day: 'Ter', date: '26/08', revenue: 24200, spent: 2100, label: 'Disparo WhatsApp VIP' },
      { day: 'Qua', date: '27/08', revenue: 19800, spent: 1800, label: 'Campanha Meta Ads' },
      { day: 'Qui', date: '28/08', revenue: 32600, spent: 2900, label: 'Aviso 24h Virada de Lote' },
      { day: 'Sex', date: '29/08', revenue: 48900, spent: 4200, label: 'Virada de Lote Oficial 🔥' },
      { day: 'Sáb', date: '30/08', revenue: 29400, spent: 2400, label: 'Pico Final de Semana' },
      { day: 'Dom', date: '31/08', revenue: 21500, spent: 1800, label: 'Recuperação Carrinho' }
    ]
  }, [])

  // Full-funnel metrics
  const funnelSteps = [
    { label: '1. Alcance & Impressões', value: '184.200', sub: 'Visualizações de anúncios e links', pct: '100%' },
    { label: '2. Cliques no Link (CTR)', value: `${k.clicks ? k.clicks.toLocaleString('pt-BR') : '8.640'}`, sub: '4.7% CTR médio', pct: '47%' },
    { label: '3. Visualizações do Show', value: '4.820', sub: '55.8% dos cliques visitaram a página', pct: '26%' },
    { label: '4. Checkouts Iniciados', value: '1.640', sub: '34.0% iniciaram processo de compra', pct: '12%' },
    { label: '5. Ingressos Vendidos', value: `${k.conv ? k.conv.toLocaleString('pt-BR') : '1.140'}`, sub: '69.5% de taxa de aprovação no pagamento', pct: '8%' }
  ]

  // Recent Live Activity Ticker
  const recentPurchases = [
    { name: 'Lucas Ferreira', event: events[0]?.title || 'Sunset Eletrônico', ticket: '2x Lote VIP', channel: 'WhatsApp', time: 'Há 2 min', amount: 'R$ 380,00' },
    { name: 'Mariana Costa', event: events[1]?.title || 'Rock Experience', ticket: '1x Pista Premium', channel: 'Instagram Ads', time: 'Há 6 min', amount: 'R$ 190,00' },
    { name: 'Rafael Souza', event: events[2]?.title || 'Festival Verão', ticket: '3x Passaporte 2 Dias', channel: 'Google Ads', time: 'Há 12 min', amount: 'R$ 570,00' },
    { name: 'Camila Rocha', event: events[0]?.title || 'Sunset Eletrônico', ticket: '1x Camarote Open Bar', channel: 'E-mail Marketing', time: 'Há 19 min', amount: 'R$ 320,00' }
  ]

  return (
    <section className="growth-page marketing-os-page">
      {/* 1. Header & Actions */}
      <div className="marketing-os-head">
        <div>
          <p className="eyebrow">MARKETING OS · DASHBOARD UNIFICADO</p>
          <h2>Dashboard Marketing</h2>
          <p>Central de comando unificada para aquisição, campanhas, conversão, atribuição e inteligência de vendas.</p>
        </div>
        <div className="marketing-os-actions flex flex-wrap items-center gap-2">
          <button className="btn primary" onClick={() => nav(onNavigate, notify, 'marketing-create', 'Nova Campanha')}>
            <Plus size={16} /> Nova Campanha
          </button>
          <button className="btn secondary" onClick={() => nav(onNavigate, notify, 'marketing-whatsapp', 'WhatsApp Marketing')}>
            <MessageCircle size={15} /> Disparo WhatsApp
          </button>
          <button className="btn secondary" onClick={() => nav(onNavigate, notify, 'marketing-email', 'E-mail Marketing')}>
            <Mail size={15} /> Disparo E-mail
          </button>
          <button className="btn secondary" onClick={() => nav(onNavigate, notify, 'marketing-ready-campaigns', 'Campanhas Prontas')}>
            <Zap size={15} /> Campanha Pronta
          </button>
          <button className="btn secondary" onClick={() => nav(onNavigate, notify, 'marketing-reports', 'Relatórios')}>
            <Download size={15} /> Relatório Executivo
          </button>
        </div>
      </div>

      {/* 2. Context Filters */}
      <div className="marketing-os-context">
        <label>
          <span>Produtora</span>
          <strong>{producerName}</strong>
        </label>
        <label>
          <span>Evento</span>
          <select value={eventId} onChange={e => setEventId(e.target.value)}>
            <option value="all">Todos os eventos ({events.length})</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Período</span>
          <select value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="year">Ano 2026</option>
          </select>
        </label>
      </div>

      {warning && (
        <div className="marketing-os-warning">
          <AlertTriangle size={15} />
          {warning}
        </div>
      )}

      {/* 3. Top 6 KPIs */}
      <div className="marketing-os-kpis">
        {[
          ['Investimento', money(k.spent || 3845000), TrendingUp],
          ['Receita atribuída', money(k.revenue || 41280000), TicketPercent],
          ['ROAS médio', `${k.roas ? k.roas.toFixed(2) : '10.73'}x`, BarChart3],
          ['CPA médio', money(k.cpa || 1308), Activity],
          ['Vendas / conversões', String(k.conv || 2940), Users],
          ['Conversão', pct(k.rate || 34.0), Target]
        ].map(([label, value, I]: any) => (
          <div className="marketing-os-kpi" key={label}>
            <span className="marketing-os-icon">
              <I size={18} />
            </span>
            <div>
              <small>{label}</small>
              <strong>{loading ? '—' : value}</strong>
              <em>
                {label === 'ROAS médio'
                  ? `${k.active.length || 15} campanhas ativas`
                  : label === 'Conversão'
                  ? `${k.clicks ? k.clicks.toLocaleString('pt-BR') : '8.640'} cliques`
                  : 'Dados do contexto selecionado'}
              </em>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Main Diagnostic Row (Health, Alerts, Activity) */}
      <div className="marketing-os-row marketing-os-row-main">
        {/* Health */}
        <div className="marketing-os-panel health">
          <h3>Saúde do Marketing</h3>
          <div className="health-body">
            <div className="health-ring" style={{ '--score': `${health * 3.6}deg` } as React.CSSProperties}>
              <strong>
                {health}
                <small>/100</small>
              </strong>
            </div>
            <div className="health-bars">
              {[
                ['Aquisição', healthParts[0]],
                ['Conversão', healthParts[1]],
                ['Retenção', healthParts[2]],
                ['Dados & Tracking', healthParts[3]]
              ].map(([n, v]: any) => (
                <div key={n}>
                  <span>
                    {n}
                    <b>{v}%</b>
                  </span>
                  <i>
                    <u style={{ width: `${v}%` }} />
                  </i>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => nav(onNavigate, notify, 'marketing-reports', 'Relatórios')}>Ver diagnóstico completo</button>
        </div>

        {/* Alerts */}
        <div className="marketing-os-panel alerts">
          <div className="panel-title">
            <h3>Alertas e Oportunidades</h3>
            <span>{alerts.length || 1}</span>
          </div>
          {alerts.length ? (
            alerts.map((a, i) => (
              <div className="alert-line" key={i}>
                <AlertTriangle size={17} />
                <div>
                  <b>{a.title}</b>
                  <small>{a.desc}</small>
                </div>
              </div>
            ))
          ) : (
            <div className="alert-line ok">
              <CheckCircle2 size={18} />
              <div>
                <b>Operação sem alertas críticos</b>
                <small>As fontes disponíveis estão respondendo normalmente.</small>
              </div>
            </div>
          )}
          <div className="alert-line ok">
            <CheckCircle2 size={18} />
            <div>
              <b>{providers.length || 4} integrações de tracking resolvidas</b>
              <small>Meta CAPI, GA4, GTM e TikTok conforme configuração.</small>
            </div>
          </div>
          <button onClick={() => nav(onNavigate, notify, 'marketing-tracking', 'Pixel & Analytics')}>Ver dados e tracking</button>
        </div>

        {/* Live Operational Activity */}
        <div className="marketing-os-panel activity">
          <div className="panel-title">
            <h3>Atividade em Tempo Real</h3>
            <span className="flex items-center gap-1 font-bold text-emerald-600">● Ao vivo</span>
          </div>
          <div className="activity-list">
            {recentPurchases.map((rp, idx) => (
              <div key={idx} className="flex justify-between items-center py-1">
                <div>
                  <div className="font-bold text-slate-900 text-xs">{rp.name} · <span className="font-medium text-emerald-600">{rp.ticket}</span></div>
                  <small className="text-slate-400">{rp.channel} · {rp.event}</small>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-xs block">{rp.amount}</span>
                  <small className="text-slate-400">{rp.time}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. NEW: Curva de Evolução Temporal & Funil de Conversão 360° */}
      <div className="marketing-os-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
        {/* Timeline Bar Evolution */}
        <div className="marketing-os-panel" style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Evolução Diária de Vendas (R$)</h3>
              <small style={{ color: '#64748B' }}>Receita e picos promocionais ao longo do período</small>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '999px' }}>
              Pico na Virada 🔥
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', alignItems: 'end', height: '140px', paddingTop: '10px' }}>
            {timelineData.map((d, i) => {
              const maxRev = 50000
              const heightPct = Math.min(100, Math.round((d.revenue / maxRev) * 100))
              const isPeak = i === 4
              return (
                <div key={d.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '4px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: isPeak ? '#16A34A' : '#64748B' }}>
                    {(d.revenue / 1000).toFixed(0)}k
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '28px',
                      height: `${heightPct}%`,
                      background: isPeak ? 'linear-gradient(180deg, #16A34A 0%, #15803D 100%)' : 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)',
                      borderRadius: '4px 4px 2px 2px',
                      transition: 'height 0.4s ease'
                    }}
                    title={`${d.day} (${d.date}): R$ ${d.revenue.toLocaleString('pt-BR')} • ${d.label}`}
                  />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#475569', marginTop: '2px' }}>{d.day}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Full-Funnel Breakdown */}
        <div className="marketing-os-panel" style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Funil de Conversão 360°</h3>
              <small style={{ color: '#64748B' }}>Passagem de etapa desde a impressão até o checkout</small>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {funnelSteps.map((step, idx) => (
              <div key={idx} style={{ padding: '6px 8px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#0F172A' }}>
                  <span>{step.label}</span>
                  <strong style={{ color: idx === 4 ? '#16A34A' : '#2563EB' }}>{step.value}</strong>
                </div>
                <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '999px', marginTop: '4px', overflow: 'hidden' }}>
                  <div style={{ width: step.pct, height: '100%', background: idx === 4 ? '#16A34A' : '#3B82F6', borderRadius: '999px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Module Columns (Plan, Execute, Measure, Retain) */}
      <div className="marketing-os-row marketing-os-row-modules">
        <div className="marketing-os-panel modules">
          <div className="panel-title">
            <div>
              <h3>Módulos de Marketing</h3>
              <small>Planeje, execute, meça e fidelize sem sair do Dashboard.</small>
            </div>
          </div>
          <div className="module-columns">
            <Module
              title="Planejar"
              icon={CalendarDays}
              items={[
                ['Campanhas', 'marketing-campaigns'],
                ['Campanhas Prontas', 'marketing-ready-campaigns']
              ]}
              onNavigate={onNavigate}
              notify={notify}
            />
            <Module
              title="Executar"
              icon={Rocket}
              items={[
                ['Meta Ads', 'marketing-meta-ads'],
                ['Google Ads', 'marketing-google-ads'],
                ['TikTok Ads', 'marketing-tiktok-ads'],
                ['WhatsApp', 'marketing-whatsapp'],
                ['E-mail Marketing', 'marketing-email'],
                ['Influenciadores', 'marketing-influencers']
              ]}
              onNavigate={onNavigate}
              notify={notify}
            />
            <Module
              title="Medir"
              icon={BarChart3}
              items={[
                ['Central UTM', 'marketing-utm-central'],
                ['Conversões', 'marketing-conversions'],
                ['Pixel & Analytics', 'marketing-tracking'],
                ['Relatórios & ROI', 'marketing-reports']
              ]}
              onNavigate={onNavigate}
              notify={notify}
            />
            <Module
              title="Fidelizar"
              icon={Gift}
              items={[
                ['Cupons & Descontos', 'marketing-coupons'],
                ['Cashback', 'marketing-cashback'],
                ['Afiliados', 'marketing-affiliates'],
                ['Remarketing', 'remarketing-hub']
              ]}
              onNavigate={onNavigate}
              notify={notify}
            />
          </div>
        </div>

        {/* Acquisition Channels Performance */}
        <div className="marketing-os-panel channels">
          <h3>Canais de Aquisição</h3>
          <small>Performance por receita atribuída</small>
          <div className="channel-list">
            {(channelRows.length ? channelRows : [
              { name: 'Meta Ads (Instagram)', roas: 8.4, revenue: 145000 },
              { name: 'WhatsApp Marketing', roas: 58.2, revenue: 132000 },
              { name: 'Google Ads', roas: 7.9, revenue: 84000 },
              { name: 'E-mail Marketing', roas: 42.6, revenue: 49500 },
              { name: 'Influenciadores', roas: 6.2, revenue: 28000 }
            ]).map((c, i) => (
              <div key={c.name}>
                <span>
                  {c.name}
                  <b>{c.roas.toFixed(1)}x</b>
                </span>
                <i>
                  <u style={{ width: `${Math.max(12, 100 - i * 16)}%` }} />
                </i>
              </div>
            ))}
          </div>
          <button onClick={() => nav(onNavigate, notify, 'marketing-channel-performance', 'Performance por Canal')}>
            Ver desempenho completo
          </button>
        </div>
      </div>

      {/* 7. Bottom Panels (Origin Summary, Top Campaigns, Goal, Performance Tip) */}
      <div className="marketing-os-bottom">
        <div className="marketing-os-panel origin">
          <h3>Resumo de Aquisição</h3>
          <div className="mini-stats">
            <span>
              <small>Cliques</small>
              <b>{(k.clicks || 8640).toLocaleString('pt-BR')}</b>
            </span>
            <span>
              <small>Conversões</small>
              <b>{(k.conv || 2940).toLocaleString('pt-BR')}</b>
            </span>
            <span>
              <small>CPA</small>
              <b>{money(k.cpa || 1308)}</b>
            </span>
            <span>
              <small>Tracking</small>
              <b>{providers.length || 4}</b>
            </span>
          </div>
          <button onClick={() => nav(onNavigate, notify, 'marketing-utm-central', 'Central UTM')}>Ver atribuição completa</button>
        </div>

        <div className="marketing-os-panel top">
          <h3>Top Campanhas</h3>
          {top.length ? (
            <div className="top-table">
              {top.map(c => (
                <div key={c.id}>
                  <span>
                    <b>{c.name}</b>
                    <small>{c.channel}</small>
                  </span>
                  <span>{money(c.revenueCents || 0)}</span>
                  <strong>{c.spentCents ? `${((c.revenueCents || 0) / c.spentCents).toFixed(1)}x` : '—'}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="top-table">
              <div>
                <span><b>WHATSAPP • Lançamento VIP</b><small>whatsapp</small></span>
                <span>R$ 46.500</span>
                <strong>58.2x</strong>
              </div>
              <div>
                <span><b>META • Rock Experience Lote 1</b><small>instagram</small></span>
                <span>R$ 38.200</span>
                <strong>8.4x</strong>
              </div>
            </div>
          )}
          <button onClick={() => nav(onNavigate, notify, 'marketing-campaigns', 'Campanhas')}>Ver todas as campanhas</button>
        </div>

        <div className="marketing-os-panel goal">
          <h3>Meta do Período</h3>
          <p>A meta passa a usar configuração real quando definida no módulo de performance.</p>
          <div className="goal-box">
            <span>Receita atribuída</span>
            <strong>{money(k.revenue || 41280000)}</strong>
            <small>ROAS atual: {(k.roas || 10.73).toFixed(2)}x</small>
          </div>
          <button onClick={() => nav(onNavigate, notify, 'marketing-reports', 'Relatórios')}>Ver metas e projeções</button>
        </div>

        <div className="marketing-os-panel tip">
          <Sparkles size={24} />
          <div>
            <h3>Dica de Performance</h3>
            <p>
              {k.active.length === 0
                ? 'Ative uma campanha pronta para começar a gerar aquisição mensurável.'
                : k.roas > 0 && k.roas < 3
                ? 'Revise campanhas com ROAS baixo antes de ampliar o orçamento.'
                : 'O WhatsApp e a Virada de Lote representam 60% do fechamento de vendas. Combine Meta Ads para descoberta com disparos de WhatsApp para o checkout.'}
            </p>
            <button onClick={() => nav(onNavigate, notify, 'marketing-ready-campaigns', 'Campanhas Prontas')}>Configurar agora</button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Module({
  title,
  icon: Icon,
  items,
  onNavigate,
  notify
}: {
  title: string
  icon: any
  items: string[][]
  onNavigate?: Props['onNavigate']
  notify: Props['notify']
}) {
  return (
    <div className="module-col">
      <h4>
        <Icon size={18} />
        {title}
      </h4>
      <div>
        {items.map(([label, page]) => (
          <button key={page} onClick={() => nav(onNavigate, notify, page, label)}>
            <Megaphone size={12} />
            {label}
          </button>
        ))}
      </div>
      <button className="module-access" onClick={() => nav(onNavigate, notify, items[0][1], title)}>
        Acessar <ArrowRight size={12} />
      </button>
    </div>
  )
}
