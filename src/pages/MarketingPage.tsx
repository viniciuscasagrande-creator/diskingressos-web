import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight, BarChart3, Download, Link2, Megaphone, MousePointerClick, Plus,
  Save, Settings2, TrendingUp, WalletCards, Zap, MessageSquare, Mail,
  TicketPercent, Users, Activity, QrCode, Coins, Gift, Trophy, UserPlus,
  Share2, Compass, Eye, CheckCircle2, Sliders, Filter, Sparkles, RefreshCw,
  Send, Trash2, Edit, Copy, Check, MessageCircle, ArrowRight, Layers,
  Target, ShieldCheck, Flame, Scale, FileSpreadsheet, FileText, ChevronDown,
  CheckCircle, Play, Pause, ExternalLink, Award, Search, X, UserCheck
} from 'lucide-react'
import type { EventItem } from '../data/events'
import AutomationCenterPage from './AutomationCenterPage'
import UtmConversionsCenter from '../components/UtmConversionsCenter'
import TrackingIntegrationsManager from '../components/TrackingIntegrationsManager'
import { MarketingCampaignsPage } from './marketing/MarketingCampaignsPage'
import ReadyCampaignsPage from './marketing/ReadyCampaignsPage'
import { CouponsPromoPage } from './marketing/CouponsPromoPage'
import { CommunicationPage } from './marketing/CommunicationPage'
import {
  createMarketingCampaign, getMarketingCampaigns, getResolvedTracking,
  getTrackingConfigs, saveTrackingConfig, updateMarketingCampaign,
  type MarketingCampaign, type ResolvedTracking, type TrackingConfig
} from '../services/api'

export type Mode =
  | 'hub'
  | 'dashboard'
  | 'campaigns'
  | 'ready-campaigns'
  | 'create'
  | 'meta-ads'
  | 'google-ads'
  | 'tiktok-ads'
  | 'influencers'
  | 'automations'
  | 'whatsapp'
  | 'email'
  | 'crm'
  | 'audiences'
  | 'communications'
  | 'coupons'
  | 'cashback'
  | 'coins'
  | 'gamification'
  | 'referral'
  | 'affiliates'
  | 'utm-central'
  | 'links'
  | 'tracking'
  | 'conversions'
  | 'remarketing'
  | 'recovery'
  | 'reports'
  | 'channel-performance'
  | 'campaign-ranking'
  | 'funnel-insights'

type Props = {
  events: EventItem[]
  producerName: string
  producerId: number | null
  mode: Mode
  notify: (m: string) => void
  onNavigate?: (page: any) => void
}

/* =========================================================================
   5 CATEGORIZED GROUPS OF MARKETING HUB (FASE 16.10.1)
   ========================================================================= */

interface HubModuleItem {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  badge?: string
}

interface HubGroup {
  name: string
  description: string
  badgeColor: string
  modules: HubModuleItem[]
}

const hubGroups: HubGroup[] = [
  {
    name: '1. Aquisição & Campanhas',
    description: 'Crie, programe e gerencie campanhas pagas e orgânicas multicanal.',
    badgeColor: '#2563EB',
    modules: [
      { id: 'marketing-dashboard', title: 'Dashboard', description: 'KPIs, funil de vendas e desempenho geral.', icon: BarChart3 },
      { id: 'marketing-campaigns', title: 'Campanhas', description: 'Criação e gestão de campanhas multicanais.', icon: Megaphone },
      { id: 'marketing-ready-campaigns', title: 'Campanhas Prontas', description: '8 modelos prontos para ativar no evento.', icon: Sparkles, badge: '⚡ Pronto' },
      { id: 'marketing-meta-ads', title: 'Meta Ads', description: 'Campanhas Instagram / Facebook e CAPI.', icon: Target },
      { id: 'marketing-google-ads', title: 'Google Ads', description: 'Rede de Pesquisa, YouTube e palavras-chave.', icon: Search },
      { id: 'marketing-tiktok-ads', title: 'TikTok Ads', description: 'Spark Ads, vídeos e conversões virais.', icon: Play },
      { id: 'marketing-influencers', title: 'Influenciadores', description: 'Criadores, comissões e links exclusivos.', icon: Users, badge: 'VIP' }
    ]
  },
  {
    name: '2. Comunicação & Relacionamento',
    description: 'Engaje compradores, envie notificações e automatize réguas de contato.',
    badgeColor: '#16A34A',
    modules: [
      { id: 'marketing-whatsapp', title: 'WhatsApp', description: 'Disparos transacionais e mensagens ativas.', icon: MessageSquare, badge: 'Oficial' },
      { id: 'marketing-email', title: 'E-mail Marketing', description: 'Disparos em massa e newsletters segmentadas.', icon: Mail },
      { id: 'marketing-automations', title: 'Automações', description: 'Jornadas automáticas e gatilhos por evento.', icon: Zap },
      { id: 'marketing-crm', title: 'CRM de Marketing', description: 'Gestão de leads, histórico e estágios.', icon: UserCheck },
      { id: 'marketing-audiences', title: 'Públicos & Segmentação', description: 'Listas inteligentes e sincronização CAPI.', icon: Layers },
      { id: 'marketing-communications', title: 'Integrações de Comunicação', description: 'WhatsApp API, SMTP, SMS e Webhooks.', icon: Settings2 }
    ]
  },
  {
    name: '3. Promoção & Fidelização',
    description: 'Acelere vendas com incentivos financeiros, cashback e gamificação.',
    badgeColor: '#D97706',
    modules: [
      { id: 'marketing-coupons', title: 'Cupons e Promoções', description: 'Ofertas, vouchers e descontos por lote.', icon: TicketPercent },
      { id: 'marketing-cashback', title: 'Cashback', description: 'Crédito promocional de volta para o cliente.', icon: WalletCards, badge: 'Fidelidade' },
      { id: 'marketing-coins', title: 'Coins / Pontos', description: 'DiskCoins por ingresso e catálogo de resgate.', icon: Coins },
      { id: 'marketing-gamification', title: 'Gamificação', description: 'Missões, desafios, medalhas e recompensas.', icon: Trophy },
      { id: 'marketing-referral', title: 'Indique e Ganhe', description: 'Programa de indicação entre compradores.', icon: UserPlus },
      { id: 'marketing-affiliates', title: 'Afiliados e Parceiros', description: 'Rede de promoters e comissionamento.', icon: Users }
    ]
  },
  {
    name: '4. Tracking & Conversão',
    description: 'Rastreie cada clique até a compra final com atribuição multi-touch.',
    badgeColor: '#7C3AED',
    modules: [
      { id: 'marketing-utm-central', title: 'Central UTM & Conversões', description: 'Dashboard executivo completo de UTMs.', icon: Link2, badge: 'Novo' },
      { id: 'marketing-links', title: 'Links, UTMs e QR Codes', description: 'URLs curtas e QR codes para totens/posts.', icon: QrCode },
      { id: 'marketing-tracking', title: 'Pixel & Analytics', description: 'Meta CAPI, GA4, TikTok Pixel e GTM.', icon: Activity },
      { id: 'marketing-conversions', title: 'Central de Conversões', description: 'Jornada clique → sessão → carrinho → compra.', icon: MousePointerClick },
      { id: 'marketing-remarketing', title: 'Remarketing', description: 'Recuperação de checkouts e abandono.', icon: RefreshCw },
      { id: 'marketing-recovery', title: 'Recuperação de Vendas', description: 'Acompanhamento de receita resgatada.', icon: ShieldCheck }
    ]
  },
  {
    name: '5. Inteligência & Performance',
    description: 'Tome decisões com relatórios comparativos, ROAS e diagnósticos.',
    badgeColor: '#0EA5E9',
    modules: [
      { id: 'marketing-reports', title: 'Relatórios', description: 'ROI, ROAS, canais e exportação de dados.', icon: FileSpreadsheet },
      { id: 'marketing-channel-performance', title: 'Performance por Canal', description: 'Comparação Instagram vs Google vs WhatsApp.', icon: Scale },
      { id: 'marketing-campaign-ranking', title: 'Ranking de Campanhas', description: 'Leaderboard por faturamento e menor CPA.', icon: Award },
      { id: 'marketing-funnel-insights', title: 'Diagnóstico do Funil & Insights', description: 'Alertas de abandono e oportunidades.', icon: Flame }
    ]
  }
]

export default function MarketingPage({ events, producerName, producerId, mode, notify, onNavigate }: Props) {
  const [eventId, setEventId] = useState<string>('all')
  const [period, setPeriod] = useState('30')
  const selectedEventId = eventId === 'all' ? undefined : Number(eventId)
  const selectedEvent = events.find(e => String(e.id) === eventId) || events[0]
  const eventName = useMemo(() => eventId === 'all' ? 'Todos os eventos' : events.find(e => String(e.id) === eventId)?.title || 'Evento', [eventId, events])

  /* -------------------------------------------------------------------------
     HUB OVERVIEW (5 GROUPS)
     ------------------------------------------------------------------------- */
  if (mode === 'hub') {
    return (
      <section className="growth-page" style={{ background: '#F8FAFC' }}>
        <Context producerName={producerName} events={events} eventId={eventId} setEventId={setEventId} period={period} setPeriod={setPeriod} />

        <div className="growth-intro" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginBottom: '8px' }}>
          <div>
            <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>MARKETING & GROWTH • CENTRAL UNIFICADA</p>
            <h2 style={{ color: '#0F172A', fontSize: '24px', fontWeight: 800 }}>Hub Marketing Operacional</h2>
            <p style={{ color: '#64748B', fontSize: '13px' }}>
              Centralize aquisição, tráfego pago, comunicação, programas de fidelidade, atribuição UTM e inteligência de vendas.
            </p>
          </div>
          <div className="page-actions">
            <button className="btn secondary" onClick={() => notify('Gerando relatório completo do Hub em PDF...')}>
              <Download size={15} /> Exportar Hub
            </button>
            <button className="btn primary" onClick={() => onNavigate ? onNavigate('marketing-create') : notify('Criar nova campanha...')}>
              <Plus size={16} /> Nova Campanha
            </button>
          </div>
        </div>

        {/* 5 Categorized Hub Groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {hubGroups.map((group, gIndex) => (
            <section key={gIndex} className="hub-category-block">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px', paddingBottom: '6px', borderBottom: '2px solid #E2E8F0' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: group.badgeColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {group.name}
                  </span>
                  <p style={{ margin: '2px 0 0', color: '#64748B', fontSize: '12px' }}>{group.description}</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8' }}>
                  {group.modules.length} módulos disponíveis
                </span>
              </div>

              <div className="module-card-grid">
                {group.modules.map(item => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="finance-module-card marketing-card interactive-hub-card"
                      style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px' }}
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate(item.id)
                        } else {
                          notify(`Abrindo ${item.title}...`)
                        }
                      }}
                    >
                      <span className="module-card-icon" style={{ background: '#EFF6FF', color: group.badgeColor }}>
                        <Icon size={24} />
                      </span>
                      <span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ color: '#0F172A', fontSize: '14px' }}>{item.title}</strong>
                          {item.badge && (
                            <span style={{ fontSize: '9px', fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '1px 5px', borderRadius: '4px' }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <small style={{ color: '#64748B', fontSize: '11px' }}>{item.description}</small>
                      </span>
                      <ArrowUpRight size={18} className="card-arrow-icon" style={{ color: '#94A3B8' }} />
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </section>
    )
  }

  /* -------------------------------------------------------------------------
     1. AQUISIÇÃO & CAMPANHAS
     ------------------------------------------------------------------------- */
  if (mode === 'dashboard') {
    return <Dashboard producerName={producerName} events={events} eventId={eventId} setEventId={setEventId} period={period} setPeriod={setPeriod} eventName={eventName} notify={notify} onNavigate={onNavigate} />
  }

  if (mode === 'ready-campaigns') {
    return <ReadyCampaignsPage producerId={producerId} events={events} notify={notify} />
  }

  if (mode === 'campaigns' || mode === 'create') {
    return <MarketingCampaignsPage events={events} notify={notify} />
  }

  if (mode === 'meta-ads') {
    return <MetaAdsManager events={events} event={selectedEvent} notify={notify} />
  }

  if (mode === 'google-ads') {
    return <GoogleAdsManager events={events} event={selectedEvent} notify={notify} />
  }

  if (mode === 'tiktok-ads') {
    return <TikTokAdsManager events={events} event={selectedEvent} notify={notify} />
  }

  if (mode === 'influencers') {
    return <InfluencerManager events={events} event={selectedEvent} notify={notify} />
  }

  /* -------------------------------------------------------------------------
     2. COMUNICAÇÃO & RELACIONAMENTO
     ------------------------------------------------------------------------- */
  if (mode === 'whatsapp' || mode === 'email' || mode === 'automations') {
    return <AutomationCenterPage producerId={producerId} events={events} mode={mode} notify={notify} />
  }

  if (mode === 'crm') {
    return <MarketingCrmPage events={events} event={selectedEvent} notify={notify} />
  }

  if (mode === 'audiences') {
    return <AudiencesPage events={events} event={selectedEvent} notify={notify} />
  }

  if (mode === 'communications') {
    return <CommunicationPage producerId={producerId} producerName={producerName} notify={notify} />
  }

  /* -------------------------------------------------------------------------
     3. PROMOÇÃO & FIDELIZAÇÃO
     ------------------------------------------------------------------------- */
  if (mode === 'coupons') {
    return <CouponsPromoPage events={events as any} producerId={producerId} notify={notify} />
  }

  if (mode === 'cashback') {
    return <CashbackPage events={events} event={selectedEvent} notify={notify} />
  }

  if (mode === 'coins') {
    return <DiskCoinsPage events={events} event={selectedEvent} notify={notify} />
  }

  if (mode === 'gamification') {
    return <GamificationPage events={events} event={selectedEvent} notify={notify} />
  }

  if (mode === 'referral') {
    return <ReferralProgramPage events={events} event={selectedEvent} notify={notify} />
  }

  if (mode === 'affiliates') {
    return <AffiliatesManager events={events} event={selectedEvent} notify={notify} />
  }

  /* -------------------------------------------------------------------------
     4. TRACKING & CONVERSÃO
     ------------------------------------------------------------------------- */
  if (mode === 'utm-central' || mode === 'links') {
    return (
      <section className="growth-page utm-marketing-entry" style={{ padding: '0 4px', background: 'transparent' }}>
        <UtmConversionsCenter 
          event={selectedEvent}
          events={events}
          onSelectEvent={(ev) => setEventId(String(ev.id))}
          notify={notify}
        />
      </section>
    )
  }

  if (mode === 'tracking') {
    return <Tracking producerId={producerId} events={events} initialEventId={selectedEventId} notify={notify} />
  }

  if (mode === 'conversions') {
    return <ConversionJourneyPage events={events} event={selectedEvent} notify={notify} />
  }

  if (mode === 'remarketing' || mode === 'recovery') {
    return <RecoverySalesPage events={events} event={selectedEvent} notify={notify} />
  }

  /* -------------------------------------------------------------------------
     5. INTELIGÊNCIA & PERFORMANCE
     ------------------------------------------------------------------------- */
  if (mode === 'reports') {
    return <MarketingReportsPage events={events} event={selectedEvent} notify={notify} />
  }

  if (mode === 'channel-performance' || mode === 'campaign-ranking' || mode === 'funnel-insights') {
    return <ChannelPerformancePage events={events} event={selectedEvent} subMode={mode} notify={notify} />
  }

  return (
    <FeaturePage 
      title="Módulo de Marketing" 
      eventName={eventName} 
      producerName={producerName} 
      notify={notify} 
    />
  )
}

/* =========================================================================
   SUB-PAGES & OPERATIONAL MODULES (FASE 16.10.1)
   ========================================================================= */

// 1. Dashboard Principal
function Dashboard({ producerName, events, eventId, setEventId, period, setPeriod, eventName, notify, onNavigate }: any) {
  const dashboardCards = [
    { title: 'Receita Atribuída', value: 'R$ 148.650,00', delta: '↑ 24,8%', icon: WalletCards },
    { title: 'Ingressos Vendidos', value: '3.412', delta: '↑ 18,2%', icon: MousePointerClick },
    { title: 'Taxa de Conversão Média', value: '4,65%', delta: '↑ 0,8 p.p.', icon: TrendingUp },
    { title: 'ROAS Consolidado', value: '5,2x', delta: '↑ 32%', icon: BarChart3 }
  ]

  return (
    <section className="growth-page">
      <Context producerName={producerName} events={events} eventId={eventId} setEventId={setEventId} period={period} setPeriod={setPeriod} />
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow">MARKETING & GROWTH</p>
          <h2>Dashboard Marketing & Atribuição</h2>
          <p>Acompanhe o desempenho consolidado das campanhas e canais de {eventName.toLowerCase()}.</p>
        </div>
        <div className="page-actions">
          <button className="btn secondary" onClick={() => notify('Relatório executivo exportado com sucesso!')}>
            <Download size={16} /> Exportar Relatório
          </button>
          <button className="btn primary" onClick={() => onNavigate ? onNavigate('marketing-create') : notify('Criar Campanha')}>
            <Plus size={16} /> Criar Campanha
          </button>
        </div>
      </div>

      <div className="growth-kpis">
        {dashboardCards.map(c => {
          const I = c.icon
          return (
            <article className="growth-kpi" key={c.title} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
              <div className="kpi-top">
                <span>{c.title}</span>
                <I size={19} />
              </div>
              <strong style={{ color: '#0F172A' }}>{c.value}</strong>
              <small style={{ color: '#16A34A' }}>{c.delta} vs. período anterior</small>
            </article>
          )
        })}
      </div>

      <div className="growth-grid">
        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="panel-head">
            <div>
              <h3 style={{ color: '#0F172A' }}>Funil Geral de Conversão</h3>
              <p>Da visualização da campanha até o ingresso emitido</p>
            </div>
          </div>
          <div className="funnel">
            <Funnel n="142.800" label="1. Impressões / Cliques" w="100%" />
            <Funnel n="58.320" label="2. Visitas no Evento" w="80%" />
            <Funnel n="12.450" label="3. Adicionaram Carrinho" w="60%" />
            <Funnel n="5.890" label="4. Checkouts Iniciados" w="42%" />
            <Funnel n="3.412" label="5. Ingressos Comprados" w="28%" />
          </div>
        </article>

        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="panel-head">
            <div>
              <h3 style={{ color: '#0F172A' }}>Participação na Receita por Canal</h3>
              <p>Atribuição ponderada por canal ativo</p>
            </div>
          </div>
          <div className="channel-list">
            {[
              ['Instagram (Stories & Reels)', 44, 'R$ 65.406'],
              ['Google Ads (Search & YouTube)', 26, 'R$ 38.649'],
              ['WhatsApp (Base Ativa & VIP)', 16, 'R$ 23.784'],
              ['TikTok Ads (Spark Ads)', 8, 'R$ 11.892'],
              ['E-mail Marketing & CRM', 6, 'R$ 8.919']
            ].map(([n, v, r]) => (
              <div className="channel-row" key={String(n)}>
                <div>
                  <span style={{ fontWeight: 600 }}>{n}</span>
                  <b style={{ color: '#0F172A' }}>{r} ({v}%)</b>
                </div>
                <div className="channel-track">
                  <i style={{ width: `${v}%`, background: '#2563EB' }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

// 2. Meta Ads Manager
function MetaAdsManager({ events, event, notify }: { events: EventItem[]; event: EventItem; notify: (m: string) => void }) {
  const [metaCampaigns, setMetaCampaigns] = useState([
    { id: 1, name: 'Marcos & Belutti — Stories Lançamento', format: 'Instagram Stories', budget: 1500, spent: 1240, ctr: '3,8%', cpa: 'R$ 16,40', sales: 75, roas: '4,8x', status: 'ativa' },
    { id: 2, name: 'Reels Vídeo Teaser — Lineup Completo', format: 'Instagram Reels', budget: 2000, spent: 1850, ctr: '4,2%', cpa: 'R$ 18,20', sales: 101, roas: '5,1x', status: 'ativa' },
    { id: 3, name: 'Remarketing Feed — Abandono Checkout', format: 'Facebook Feed', budget: 800, spent: 620, ctr: '5,6%', cpa: 'R$ 11,50', sales: 54, roas: '8,2x', status: 'ativa' }
  ])

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>META BUSINESS MANAGER & ADS CAPI</p>
          <h2 style={{ color: '#0F172A', fontSize: '22px' }}>Meta Ads — {event.title}</h2>
          <p style={{ color: '#64748B' }}>Gerencie anúncios no Facebook e Instagram com sincronização em tempo real via Conversions API (CAPI).</p>
        </div>
        <div className="page-actions">
          <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '6px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#166534' }}>
            <CheckCircle size={14} /> Meta CAPI Token Ativo
          </div>
          <button className="btn primary" onClick={() => notify('Abrindo criação de conjunto de anúncios Meta...')}>
            <Plus size={15} /> Criar Anúncio Meta
          </button>
        </div>
      </div>

      <div className="growth-kpis">
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Gasto Meta Ads</span><WalletCards size={18} /></div>
          <strong style={{ color: '#0F172A' }}>R$ 3.710,00</strong>
          <small style={{ color: '#16A34A' }}>Orçado: R$ 4.300,00</small>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>ROAS Médio</span><TrendingUp size={18} /></div>
          <strong style={{ color: '#16A34A' }}>5,4x</strong>
          <small style={{ color: '#16A34A' }}>↑ 18% vs média do mercado</small>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>CPA Médio</span><Target size={18} /></div>
          <strong style={{ color: '#2563EB' }}>R$ 16,13</strong>
          <small style={{ color: '#64748B' }}>Custo por ingresso vendido</small>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Vendas Atribuídas</span><MousePointerClick size={18} /></div>
          <strong style={{ color: '#0F172A' }}>230</strong>
          <small style={{ color: '#16A34A' }}>R$ 41.400 em receita</small>
        </article>
      </div>

      <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <div className="panel-head">
          <div>
            <h3 style={{ color: '#0F172A' }}>Campanhas Meta Ads Ativas</h3>
            <p>Sincronizadas com o Pixel CAPI do evento</p>
          </div>
        </div>
        <div className="table-scroll">
          <table className="growth-table">
            <thead>
              <tr>
                <th>Campanha / Criativo</th>
                <th>Formato</th>
                <th>Status</th>
                <th>Investido</th>
                <th>CTR</th>
                <th>CPA</th>
                <th>Vendas</th>
                <th>ROAS</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {metaCampaigns.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td><span className="badge-method">{c.format}</span></td>
                  <td><span className="status-badge green">● Ativa</span></td>
                  <td>R$ {c.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>{c.ctr}</td>
                  <td>{c.cpa}</td>
                  <td><strong>{c.sales}</strong></td>
                  <td style={{ color: '#16A34A', fontWeight: 800 }}>{c.roas}</td>
                  <td>
                    <button className="btn secondary" style={{ height: '30px', fontSize: '11px' }} onClick={() => notify('Campanha pausada com sucesso!')}>
                      Pausar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}

// 3. Google Ads Manager
function GoogleAdsManager({ events, event, notify }: { events: EventItem[]; event: EventItem; notify: (m: string) => void }) {
  const keywords = [
    { kw: `ingressos ${event.title.toLowerCase()}`, cpc: 'R$ 0,65', clicks: 4210, conv: 142, roas: '6,2x' },
    { kw: `show ${event.title.toLowerCase()} curitiba`, cpc: 'R$ 0,82', clicks: 2890, conv: 98, roas: '5,8x' },
    { kw: `comprar ingresso ${event.title.toLowerCase()}`, cpc: 'R$ 0,95', clicks: 1750, conv: 84, roas: '7,4x' }
  ]

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>GOOGLE ADS & SEARCH ENGINE</p>
          <h2 style={{ color: '#0F172A', fontSize: '22px' }}>Google Ads — {event.title}</h2>
          <p style={{ color: '#64748B' }}>Campanhas de intenção direta de compra na Rede de Pesquisa e YouTube Ads.</p>
        </div>
        <button className="btn primary" onClick={() => notify('Adicionando nova palavra-chave...')}>
          <Plus size={15} /> Nova Palavra-Chave
        </button>
      </div>

      <div className="growth-kpis">
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Gasto Google</span><WalletCards size={18} /></div>
          <strong style={{ color: '#0F172A' }}>R$ 6.840,00</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Cliques Totais</span><MousePointerClick size={18} /></div>
          <strong style={{ color: '#2563EB' }}>8.850</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>CPC Médio</span><Target size={18} /></div>
          <strong style={{ color: '#0F172A' }}>R$ 0,77</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>ROAS Google</span><TrendingUp size={18} /></div>
          <strong style={{ color: '#16A34A' }}>6,4x</strong>
        </article>
      </div>

      <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <div className="panel-head">
          <div><h3 style={{ color: '#0F172A' }}>Palavras-Chave de Alta Conversão</h3></div>
        </div>
        <table className="growth-table">
          <thead><tr><th>Palavra-Chave</th><th>CPC Médio</th><th>Cliques</th><th>Conversões</th><th>ROAS</th><th>Ação</th></tr></thead>
          <tbody>
            {keywords.map(k => (
              <tr key={k.kw}>
                <td><strong>{k.kw}</strong></td>
                <td>{k.cpc}</td>
                <td>{k.clicks}</td>
                <td><strong style={{ color: '#2563EB' }}>{k.conv}</strong></td>
                <td style={{ color: '#16A34A', fontWeight: 800 }}>{k.roas}</td>
                <td><button className="btn secondary" style={{ height: '28px', fontSize: '11px' }} onClick={() => notify('Lance atualizado!')}>Ajustar Lance</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  )
}

// 4. TikTok Ads Manager
function TikTokAdsManager({ events, event, notify }: { events: EventItem[]; event: EventItem; notify: (m: string) => void }) {
  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>TIKTOK ADS & SPARK ADS</p>
          <h2 style={{ color: '#0F172A', fontSize: '22px' }}>TikTok Ads — {event.title}</h2>
          <p style={{ color: '#64748B' }}>Campanhas virais em vídeo com rastreamento via TikTok Pixel & Event API.</p>
        </div>
        <button className="btn primary" onClick={() => notify('Criando campanha TikTok Spark Ads...')}>
          <Plus size={15} /> Criar Spark Ad
        </button>
      </div>

      <div className="growth-kpis">
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Gasto TikTok</span><WalletCards size={18} /></div>
          <strong style={{ color: '#0F172A' }}>R$ 2.450,00</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Visualizações de Vídeo</span><Play size={18} /></div>
          <strong style={{ color: '#2563EB' }}>184.200</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>CPM</span><Target size={18} /></div>
          <strong style={{ color: '#0F172A' }}>R$ 13,30</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Ingressos Vendidos</span><MousePointerClick size={18} /></div>
          <strong style={{ color: '#16A34A' }}>94</strong>
        </article>
      </div>
    </section>
  )
}

// 5. Influenciadores & Promoters
function InfluencerManager({ events, event, notify }: { events: EventItem[]; event: EventItem; notify: (m: string) => void }) {
  const [influencers, setInfluencers] = useState([
    { id: 1, name: 'Curitiba Cult', handle: '@curitibacult', link: 'disk.ing/cult-vip', commission: '10%', sales: 142, revenue: 24140, status: 'ativo' },
    { id: 2, name: 'Lucas Baladas PR', handle: '@lucasbaladas', link: 'disk.ing/lucas-show', commission: 'R$ 15/ing', sales: 98, revenue: 16660, status: 'ativo' },
    { id: 3, name: 'Gabi Entretenimento', handle: '@gabishows', link: 'disk.ing/gabi-vip', commission: '10%', sales: 64, revenue: 10880, status: 'ativo' }
  ])

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>REDE DE INFLUENCIADORES & PARCERIAS</p>
          <h2 style={{ color: '#0F172A', fontSize: '22px' }}>Influenciadores & Promoters — {event.title}</h2>
          <p style={{ color: '#64748B' }}>Acompanhe as vendas individuais de criadores de conteúdo com links UTM exclusivos.</p>
        </div>
        <button className="btn primary" onClick={() => notify('Cadastrando novo influenciador com UTM...')}>
          <Plus size={15} /> Cadastrar Influenciador
        </button>
      </div>

      <div className="growth-kpis">
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Criadores Ativos</span><Users size={18} /></div>
          <strong style={{ color: '#0F172A' }}>{influencers.length}</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Vendas por Criadores</span><MousePointerClick size={18} /></div>
          <strong style={{ color: '#16A34A' }}>304</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Receita Gerada</span><WalletCards size={18} /></div>
          <strong style={{ color: '#0F172A' }}>R$ 51.680,00</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Comissão Total</span><TrendingUp size={18} /></div>
          <strong style={{ color: '#2563EB' }}>R$ 5.168,00</strong>
        </article>
      </div>

      <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <table className="growth-table">
          <thead><tr><th>Influenciador</th><th>Link Rastreável</th><th>Comissão</th><th>Vendas</th><th>Receita</th><th>Ações</th></tr></thead>
          <tbody>
            {influencers.map(i => (
              <tr key={i.id}>
                <td><strong>{i.name}</strong> <small style={{ color: '#64748B' }}>({i.handle})</small></td>
                <td><code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', color: '#2563EB' }}>{i.link}</code></td>
                <td><span className="badge-method">{i.commission}</span></td>
                <td><strong>{i.sales}</strong></td>
                <td style={{ color: '#16A34A', fontWeight: 700 }}>R$ {i.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>
                  <button className="btn secondary" style={{ height: '28px', fontSize: '11px' }} onClick={() => notify(`Link ${i.link} copiado!`)}>
                    <Copy size={12} /> Copiar Link
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  )
}

// 6. CRM de Marketing
function MarketingCrmPage({ events, event, notify }: { events: EventItem[]; event: EventItem; notify: (m: string) => void }) {
  const leads = [
    { id: 1, name: 'Rodrigo Medeiros', email: 'rodrigo@email.com', phone: '(41) 99881-2233', stage: 'VIP (Comprador > R$ 500)', utm: 'instagram / stories', orders: 3, totalSpent: 780 },
    { id: 2, name: 'Juliana Castro', email: 'juliana@email.com', phone: '(41) 98712-4411', stage: 'Checkout Iniciado (2h atrás)', utm: 'whatsapp / base_vip', orders: 0, totalSpent: 0 },
    { id: 3, name: 'Felipe Santos', email: 'felipe@email.com', phone: '(41) 99122-8899', stage: 'Comprador 1º Lote', utm: 'google / search', orders: 1, totalSpent: 260 }
  ]

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>CRM DE MARKETING & LEADS</p>
          <h2 style={{ color: '#0F172A', fontSize: '22px' }}>CRM de Relacionamento — {event.title}</h2>
          <p style={{ color: '#64748B' }}>Histórico completo, tags e ações 1-a-1 por WhatsApp e E-mail.</p>
        </div>
        <button className="btn primary" onClick={() => notify('Exportando base de leads para CSV...')}>
          <Download size={15} /> Exportar Contatos
        </button>
      </div>

      <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <table className="growth-table">
          <thead><tr><th>Cliente</th><th>Estágio no Funil</th><th>Origem UTM</th><th>Compras</th><th>Valor Total</th><th>Ação Rápida</th></tr></thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id}>
                <td><strong>{l.name}</strong><br /><small style={{ color: '#64748B' }}>{l.email} • {l.phone}</small></td>
                <td><span className="badge-method">{l.stage}</span></td>
                <td><small>{l.utm}</small></td>
                <td>{l.orders} pedido(s)</td>
                <td style={{ color: '#16A34A', fontWeight: 700 }}>R$ {l.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>
                  <button className="btn secondary" style={{ height: '28px', fontSize: '11px' }} onClick={() => notify(`Iniciando WhatsApp para ${l.name}...`)}>
                    <MessageSquare size={13} /> WhatsApp
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  )
}

// 7. Públicos & Segmentação
function AudiencesPage({ events, event, notify }: { events: EventItem[]; event: EventItem; notify: (m: string) => void }) {
  const audiences = [
    { name: 'Compradores VIP (Ticket Médio > R$ 300)', size: '1.240 contatos', capi: 'Sincronizado', color: '#16A34A' },
    { name: 'Abandonos de Checkout (Últimos 14 dias)', size: '380 contatos', capi: 'Sincronizado', color: '#2563EB' },
    { name: 'Compradores de Edições Anteriores 2025', size: '4.520 contatos', capi: 'Pendente', color: '#D97706' },
    { name: 'Visitantes Recorrentes sem Compra', size: '2.180 contatos', capi: 'Sincronizado', color: '#7C3AED' }
  ]

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>AUDIÊNCIAS & SEGMENTAÇÃO</p>
          <h2 style={{ color: '#0F172A', fontSize: '22px' }}>Públicos Personalizados — {event.title}</h2>
          <p style={{ color: '#64748B' }}>Crie listas para remarketing e sincronize com Meta Custom Audiences e Google Ads.</p>
        </div>
        <button className="btn primary" onClick={() => notify('Criando novo público segmentado...')}>
          <Plus size={15} /> Criar Público
        </button>
      </div>

      <div className="module-card-grid">
        {audiences.map((a, i) => (
          <div key={i} className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, background: '#EFF6FF', color: a.color, padding: '2px 6px', borderRadius: '4px' }}>
                {a.capi}
              </span>
              <Users size={16} style={{ color: '#64748B' }} />
            </div>
            <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>{a.name}</strong>
            <span style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', display: 'block' }}>{a.size}</span>
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '6px' }}>
              <button className="btn secondary" style={{ height: '28px', fontSize: '11px', flex: 1 }} onClick={() => notify('Sincronizando com Meta Ads...')}>
                Sincronizar Meta
              </button>
              <button className="btn secondary" style={{ height: '28px', fontSize: '11px', flex: 1 }} onClick={() => notify('Exportando CSV do público...')}>
                <Download size={12} /> CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// 8. Cashback Promocional
function CashbackPage({ events, event, notify }: { events: EventItem[]; event: EventItem; notify: (m: string) => void }) {
  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>MOTOR DE CASHBACK & RECOMPENSAS</p>
          <h2 style={{ color: '#0F172A', fontSize: '22px' }}>Cashback Promocional — {event.title}</h2>
          <p style={{ color: '#64748B' }}>Conceda saldo promocional de volta na carteira do cliente para compras futuras.</p>
        </div>
        <button className="btn primary" onClick={() => notify('Criando nova regra de cashback...')}>
          <Plus size={15} /> Nova Regra de Cashback
        </button>
      </div>

      <div className="growth-kpis">
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Saldo Emitido</span><WalletCards size={18} /></div>
          <strong style={{ color: '#0F172A' }}>R$ 14.280,00</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Saldo Resgatado</span><Coins size={18} /></div>
          <strong style={{ color: '#16A34A' }}>R$ 9.450,00</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Taxa de Recompra</span><TrendingUp size={18} /></div>
          <strong style={{ color: '#2563EB' }}>66,1%</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Regra Vigente</span><TicketPercent size={18} /></div>
          <strong style={{ color: '#0F172A' }}>5% no Pix</strong>
        </article>
      </div>
    </section>
  )
}

// 9. Coins / Pontos de Fidelidade
function DiskCoinsPage({ events, event, notify }: { events: EventItem[]; event: EventItem; notify: (m: string) => void }) {
  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>PROGRAMA DE PONTOS DISKCOINS</p>
          <h2 style={{ color: '#0F172A', fontSize: '22px' }}>DiskCoins Fidelidade — {event.title}</h2>
          <p style={{ color: '#64748B' }}>Acúmulo automático de pontos por real gasto em ingressos.</p>
        </div>
        <button className="btn primary" onClick={() => notify('Criando recompensa no catálogo...')}>
          <Plus size={15} /> Nova Recompensa
        </button>
      </div>

      <div className="growth-kpis">
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Coins Emitidos</span><Coins size={18} /></div>
          <strong style={{ color: '#0F172A' }}>345.000</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Coins Resgatados</span><Gift size={18} /></div>
          <strong style={{ color: '#16A34A' }}>210.000</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Clientes Ativos</span><Users size={18} /></div>
          <strong style={{ color: '#2563EB' }}>2.840</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Regra Padrão</span><Sparkles size={18} /></div>
          <strong style={{ color: '#0F172A' }}>10 coins / R$ 100</strong>
        </article>
      </div>
    </section>
  )
}

// 10. Gamificação de Eventos
function GamificationPage({ events, event, notify }: { events: EventItem[]; event: EventItem; notify: (m: string) => void }) {
  const missions = [
    { title: 'Compre no 1º Lote', desc: 'Garanta seu ingresso nas primeiras 48h', reward: '500 Coins + Badge Fã VIP', progress: '1.240 completaram' },
    { title: 'Indique 3 Amigos', desc: 'Compartilhe seu link e traga amigos para o evento', reward: 'Copo Oficial no Evento', progress: '418 completaram' },
    { title: 'Compartilhe o Lineup', desc: 'Poste o flyer nos Stories com a tag oficial', reward: 'Cupom 10% OFF no Bar', progress: '890 completaram' }
  ]

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>MISSÕES & GAMIFICAÇÃO</p>
          <h2 style={{ color: '#0F172A', fontSize: '22px' }}>Gamificação do Evento — {event.title}</h2>
          <p style={{ color: '#64748B' }}>Engaje o público com desafios e libere benefícios exclusivos.</p>
        </div>
        <button className="btn primary" onClick={() => notify('Criando nova missão de gamificação...')}>
          <Plus size={15} /> Criar Missão
        </button>
      </div>

      <div className="module-card-grid">
        {missions.map((m, idx) => (
          <div key={idx} className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Trophy size={18} style={{ color: '#D97706' }} />
              <strong style={{ color: '#0F172A', fontSize: '14px' }}>{m.title}</strong>
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0' }}>{m.desc}</p>
            <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', padding: '6px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: '#92400E', marginTop: '8px' }}>
              🎁 Recompensa: {m.reward}
            </div>
            <small style={{ color: '#16A34A', fontWeight: 600, display: 'block', marginTop: '8px' }}>
              ✓ {m.progress}
            </small>
          </div>
        ))}
      </div>
    </section>
  )
}

// 11. Indique e Ganhe
function ReferralProgramPage({ events, event, notify }: { events: EventItem[]; event: EventItem; notify: (m: string) => void }) {
  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>PROGRAMA DE INDICAÇÃO</p>
          <h2 style={{ color: '#0F172A', fontSize: '22px' }}>Indique e Ganhe — {event.title}</h2>
          <p style={{ color: '#64748B' }}>Transforme seus clientes em promotores ativos do evento.</p>
        </div>
        <button className="btn primary" onClick={() => notify('Configurando regras de indicação...')}>
          <Settings2 size={15} /> Configurar Programa
        </button>
      </div>

      <div className="growth-kpis">
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Indicações Totais</span><Share2 size={18} /></div>
          <strong style={{ color: '#0F172A' }}>1.420</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Vendas Geradas</span><MousePointerClick size={18} /></div>
          <strong style={{ color: '#16A34A' }}>486</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Receita de Indicação</span><WalletCards size={18} /></div>
          <strong style={{ color: '#2563EB' }}>R$ 78.400,00</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Bônus Concedidos</span><Gift size={18} /></div>
          <strong style={{ color: '#0F172A' }}>R$ 7.840,00</strong>
        </article>
      </div>
    </section>
  )
}

// 12. Afiliados & Parceiros
function AffiliatesManager({ events, event, notify }: { events: EventItem[]; event: EventItem; notify: (m: string) => void }) {
  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>REDE DE AFILIADOS OFICIAIS</p>
          <h2 style={{ color: '#0F172A', fontSize: '22px' }}>Afiliados e Promoters — {event.title}</h2>
          <p style={{ color: '#64748B' }}>Gestão de comissionamento automático para promotores parceiros.</p>
        </div>
        <button className="btn primary" onClick={() => notify('Cadastrando novo parceiro oficial...')}>
          <Plus size={15} /> Novo Afiliado
        </button>
      </div>

      <div className="growth-kpis">
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Afiliados Ativos</span><Users size={18} /></div>
          <strong style={{ color: '#0F172A' }}>28</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Vendas dos Parceiros</span><MousePointerClick size={18} /></div>
          <strong style={{ color: '#16A34A' }}>612</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Receita Gerada</span><WalletCards size={18} /></div>
          <strong style={{ color: '#0F172A' }}>R$ 98.450,00</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Comissão Paga</span><TrendingUp size={18} /></div>
          <strong style={{ color: '#2563EB' }}>R$ 9.845,00</strong>
        </article>
      </div>
    </section>
  )
}

// 13. Central de Conversões (Jornada Multi-Touch)
function ConversionJourneyPage({ events, event, notify }: { events: EventItem[]; event: EventItem; notify: (m: string) => void }) {
  const touchpoints = [
    { step: '1. Clique no Anúncio', channel: 'Instagram Stories (UTM: lancamento_2026)', count: '14.850 cliques', rate: '100%' },
    { step: '2. Sessão no Site', channel: 'Landing Page Oficial DiskIngressos', count: '11.880 sessões', rate: '80,0%' },
    { step: '3. Adicionou ao Carrinho', channel: 'Seleção de Setor & Quantidade', count: '2.376 adições', rate: '16,0%' },
    { step: '4. Início de Checkout', channel: 'Identificação CPF / Pagamento', count: '1.188 checkouts', rate: '8,0%' },
    { step: '5. Compra Concluída', channel: 'Pagamento Aprovado (Pix / Cartão)', count: '712 compras', rate: '4,8%' }
  ]

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>JORNADA DE ATRIBUIÇÃO MULTI-TOUCH</p>
          <h2 style={{ color: '#0F172A', fontSize: '22px' }}>Central de Conversões — {event.title}</h2>
          <p style={{ color: '#64748B' }}>Mapeamento ponta a ponta desde o primeiro ponto de contato até a emissão do ingresso.</p>
        </div>
        <button className="btn secondary" onClick={() => notify('Exportando fluxo de conversão...')}>
          <Download size={15} /> Exportar Fluxo
        </button>
      </div>

      <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <table className="growth-table">
          <thead><tr><th>Etapa da Jornada</th><th>Canal / Ponto de Contato</th><th>Volume</th><th>Taxa de Retenção</th></tr></thead>
          <tbody>
            {touchpoints.map((t, idx) => (
              <tr key={idx}>
                <td><strong>{t.step}</strong></td>
                <td><span className="badge-method">{t.channel}</span></td>
                <td><strong>{t.count}</strong></td>
                <td style={{ color: '#2563EB', fontWeight: 700 }}>{t.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  )
}

// 14. Recuperação de Vendas & Remarketing
function RecoverySalesPage({ events, event, notify }: { events: EventItem[]; event: EventItem; notify: (m: string) => void }) {
  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>RECUPERAÇÃO OPERACIONAL DE VENDAS</p>
          <h2 style={{ color: '#0F172A', fontSize: '22px' }}>Recuperação de Vendas — {event.title}</h2>
          <p style={{ color: '#64748B' }}>Resgate carrinhos e checkouts abandonados com disparos automáticos de WhatsApp e e-mail.</p>
        </div>
        <button className="btn primary" onClick={() => notify('Disparando régua de recuperação para 18 abandonos...')}>
          <Send size={15} /> Disparar Régua de Recuperação
        </button>
      </div>

      <div className="growth-kpis">
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Carrinhos Abandonados</span><ShieldCheck size={18} /></div>
          <strong style={{ color: '#EA580C' }}>48</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Recuperados</span><CheckCircle size={18} /></div>
          <strong style={{ color: '#16A34A' }}>19</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Taxa de Recuperação</span><TrendingUp size={18} /></div>
          <strong style={{ color: '#2563EB' }}>39,5%</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Receita Salva</span><WalletCards size={18} /></div>
          <strong style={{ color: '#16A34A' }}>R$ 5.890,00</strong>
        </article>
      </div>
    </section>
  )
}

// 15. Performance por Canal, Ranking & Insights
function ChannelPerformancePage({ events, event, subMode, notify }: { events: EventItem[]; event: EventItem; subMode: Mode; notify: (m: string) => void }) {
  const channelData = [
    { channel: 'Instagram Ads', spent: 4500, sales: 245, revenue: 39200, roi: '771%', cpa: 'R$ 18,36', rank: '🥇 1º' },
    { channel: 'Google Search Ads', spent: 3200, sales: 154, revenue: 26180, roi: '718%', cpa: 'R$ 20,77', rank: '🥈 2º' },
    { channel: 'WhatsApp Disparo VIP', spent: 850, sales: 88, revenue: 14960, roi: '1660%', cpa: 'R$ 9,65', rank: '🥉 3º' },
    { channel: 'TikTok Ads', spent: 1800, sales: 72, revenue: 11520, roi: '540%', cpa: 'R$ 25,00', rank: '4º' },
    { channel: 'E-mail Marketing', spent: 400, sales: 41, revenue: 6560, roi: '1540%', cpa: 'R$ 9,75', rank: '5º' }
  ]

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>INTELIGÊNCIA DE PERFORMANCE & CANAIS</p>
          <h2 style={{ color: '#0F172A', fontSize: '22px' }}>
            {subMode === 'campaign-ranking' ? 'Ranking de Campanhas' : subMode === 'funnel-insights' ? 'Diagnóstico do Funil & Insights' : 'Performance por Canal'} — {event.title}
          </h2>
          <p style={{ color: '#64748B' }}>Comparação de ROI, ROAS, CPA e eficiência econômica de cada canal.</p>
        </div>
        <button className="btn secondary" onClick={() => notify('Exportando matriz de performance...')}>
          <Download size={15} /> Exportar Matriz
        </button>
      </div>

      <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <table className="growth-table">
          <thead><tr><th>Posição</th><th>Canal de Marketing</th><th>Investimento</th><th>Vendas</th><th>Receita</th><th>CPA</th><th>ROI</th></tr></thead>
          <tbody>
            {channelData.map(c => (
              <tr key={c.channel}>
                <td><strong>{c.rank}</strong></td>
                <td><strong>{c.channel}</strong></td>
                <td>R$ {c.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td><strong>{c.sales}</strong></td>
                <td style={{ color: '#16A34A', fontWeight: 700 }}>R$ {c.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>{c.cpa}</td>
                <td style={{ color: '#2563EB', fontWeight: 800 }}>{c.roi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  )
}

// 16. Relatórios de Marketing
function MarketingReportsPage({ events, event, notify }: { events: EventItem[]; event: EventItem; notify: (m: string) => void }) {
  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>RELATÓRIOS EXECUTIVOS & CONSOLIDAÇÃO</p>
          <h2 style={{ color: '#0F172A', fontSize: '22px' }}>Relatórios de Marketing — {event.title}</h2>
          <p style={{ color: '#64748B' }}>Gere relatórios completos de ROI, atribuição e conversão em PDF, Excel ou CSV.</p>
        </div>
        <div className="page-actions">
          <button className="btn secondary" onClick={() => notify('Baixando relatório CSV completo...')}>
            <FileSpreadsheet size={15} /> CSV
          </button>
          <button className="btn secondary" onClick={() => notify('Baixando relatório Excel (.xlsx)...')}>
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button className="btn primary" onClick={() => notify('Gerando relatório executivo em PDF...')}>
            <FileText size={15} /> PDF Executivo
          </button>
        </div>
      </div>

      <div className="growth-kpis">
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Investimento Total</span><WalletCards size={18} /></div>
          <strong style={{ color: '#0F172A' }}>R$ 10.750,00</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Receita Total Atribuída</span><TrendingUp size={18} /></div>
          <strong style={{ color: '#16A34A' }}>R$ 98.420,00</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>ROAS Geral</span><BarChart3 size={18} /></div>
          <strong style={{ color: '#2563EB' }}>9,15x</strong>
        </article>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <div className="kpi-top"><span>Ingressos Emitidos</span><MousePointerClick size={18} /></div>
          <strong style={{ color: '#0F172A' }}>600</strong>
        </article>
      </div>
    </section>
  )
}

/* =========================================================================
   HELPER UTILITIES
   ========================================================================= */

function Links({ events, initialEventId, notify }: { producerId: number | null; events: EventItem[]; initialEventId?: number; notify: (m: string) => void }) {
  const [eventId, setEventId] = useState<number | undefined>(initialEventId || events[0]?.id)
  const selectedEvent = events.find(e => e.id === eventId) || events[0]
  return (
    <section className="growth-page utm-marketing-entry" style={{ padding: '0 4px', background: 'transparent' }}>
      {!selectedEvent ? (
        <article className="growth-panel feature-empty utm-event-empty">
          <Link2 size={36} />
          <h3>A Central UTM começa pelo evento</h3>
          <p>Nenhum evento encontrado para carregar métricas de UTM.</p>
        </article>
      ) : (
        <UtmConversionsCenter
          event={selectedEvent}
          events={events}
          onSelectEvent={(ev) => setEventId(ev.id)}
          notify={notify}
        />
      )}
    </section>
  )
}

function Tracking({ producerId, events, initialEventId, notify }: { producerId: number | null; events: EventItem[]; initialEventId?: number; notify: (m: string) => void }) {
  return <section className="growth-page"><TrackingIntegrationsManager producerId={producerId} events={events} fixedEventId={initialEventId} notify={notify} /></section>
}

function Context({ producerName, events, eventId, setEventId, period, setPeriod }: { producerName: string; events: EventItem[]; eventId: string; setEventId: (v: string) => void; period: string; setPeriod: (v: string) => void }) {
  return (
    <div className="growth-context" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
      <div>
        <span style={{ color: '#64748B' }}>Produtora</span>
        <strong style={{ color: '#0F172A' }}>{producerName}</strong>
      </div>
      <label>
        <span style={{ color: '#64748B' }}>Evento Selecionado</span>
        <select value={eventId} onChange={e => setEventId(e.target.value)} style={{ color: '#0F172A', fontWeight: 600 }}>
          <option value="all">Todos os eventos ({events.length})</option>
          {events.map(e => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
      </label>
      <label>
        <span style={{ color: '#64748B' }}>Período de Análise</span>
        <select value={period} onChange={e => setPeriod(e.target.value)} style={{ color: '#0F172A', fontWeight: 600 }}>
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
          <option value="year">Ano 2026 (Consolidado)</option>
        </select>
      </label>
    </div>
  )
}

function Funnel({ n, label, w }: { n: string; label: string; w: string }) {
  return (
    <div className="funnel-step" style={{ width: w, background: '#EFF6FF', borderColor: '#BFDBFE' }}>
      <span style={{ color: '#334155' }}>{label}</span>
      <b style={{ color: '#1E40AF' }}>{n}</b>
    </div>
  )
}

function FeaturePage({ title, eventName, producerName, notify }: { title: string; eventName: string; producerName: string; notify: (m: string) => void }) {
  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>MARKETING & GROWTH</p>
          <h2>{title}</h2>
          <p>{producerName} · {eventName}</p>
        </div>
        <button className="btn primary" onClick={() => notify(`${title}: ação registrada com sucesso.`)}>
          <Plus size={17} /> Nova ação
        </button>
      </div>
      <article className="growth-panel feature-empty" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
        <Megaphone size={34} style={{ color: '#2563EB' }} />
        <h3>{title}</h3>
        <p>Módulo operacional integrado ao contexto de eventos, produtores e atribuição de receitas.</p>
        <div className="feature-badges">
          <span>Multi-produtor</span>
          <span>Contexto por evento</span>
          <span>Atribuição UTM</span>
          <span>Auditoria</span>
        </div>
      </article>
    </section>
  )
}
