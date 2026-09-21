import React, { useState, useEffect, useMemo } from 'react'
import {
  BarChart3, RefreshCw, CheckCircle2, ShieldCheck, TrendingUp,
  Users, Eye, Activity, ShoppingCart, Target, ArrowUpRight,
  ExternalLink, Sliders, Check, X, Layers, Globe, Zap
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import '../../styles/tracking-premium.css'

interface GoogleAnalyticsHubPageProps {
  events: EventItem[]
  selectedEventId?: number | null
  producerId?: number | null
  producerName?: string
  notify: (msg: string) => void
  onNavigate?: (page: any) => void
}

interface Ga4RealtimeEvent {
  id: string
  timestamp: string
  name: string
  pageTitle: string
  source: string
  value?: string
  userId?: string
  status: 'enviado' | 'processado'
}

const DEFAULT_GA4_CONFIG = {
  measurementId: 'G-7X9827B910',
  apiSecret: 'mp_sec_9948271038_Ga4LiveDisk',
  streamName: 'DiskIngressos Web & Mobile Checkout',
  streamUrl: 'https://www.diskingressos.com.br',
  enableEnhancedMeasurement: true,
  enableDebugView: true,
  enableECommerceReporting: true,
  enabledEvents: {
    page_view: true,
    view_item: true,
    add_to_cart: true,
    begin_checkout: true,
    add_payment_info: true,
    purchase: true,
    generate_lead: true,
    search: true
  }
}

export default function GoogleAnalyticsHubPage({
  events,
  selectedEventId: initialSelectedEventId,
  producerId,
  producerName = 'Produtora',
  notify,
  onNavigate
}: GoogleAnalyticsHubPageProps) {
  const [currentEventId, setCurrentEventId] = useState<string>(
    initialSelectedEventId ? String(initialSelectedEventId) : 'all'
  )
  const [period, setPeriod] = useState<string>('30')
  const [activeTab, setActiveTab] = useState<'visao-geral' | 'funil' | 'configuracao' | 'debugview' | 'canais'>('visao-geral')
  const [isSendingTest, setIsSendingTest] = useState(false)

  // Configuração persistente do GA4
  const storageKey = `diskingressos:ga4:config:${producerId || 'default'}`
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : DEFAULT_GA4_CONFIG
    } catch {
      return DEFAULT_GA4_CONFIG
    }
  })

  const handleSaveConfig = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(config))
      notify('Configuração do Google Analytics 4 (GA4) salva com sucesso!')
    } catch {
      notify('Erro ao salvar configurações do GA4.')
    }
  }

  const currentEvent = useMemo(() => {
    if (currentEventId === 'all') return null
    return events.find(e => String(e.id) === currentEventId) || null
  }, [events, currentEventId])

  const eventTitle = currentEvent ? currentEvent.title : 'Todos os Eventos'

  // Stream de eventos em tempo real
  const [realtimeEvents, setRealtimeEvents] = useState<Ga4RealtimeEvent[]>([
    { id: 'EV-101', timestamp: '10:06:14', name: 'purchase', pageTitle: `Checkout Concluído — ${eventTitle}`, source: 'google / cpc', value: 'R$ 360,00', userId: 'usr_849201', status: 'processado' },
    { id: 'EV-102', timestamp: '10:05:40', name: 'begin_checkout', pageTitle: `Ingressos — ${eventTitle}`, source: 'google / organic', value: 'R$ 180,00', userId: 'usr_772183', status: 'processado' },
    { id: 'EV-103', timestamp: '10:04:12', name: 'add_to_cart', pageTitle: `Seleção de Lote — ${eventTitle}`, source: 'instagram / stories', value: 'R$ 180,00', userId: 'usr_663910', status: 'processado' },
    { id: 'EV-104', timestamp: '10:02:55', name: 'view_item', pageTitle: `Detalhes do Evento — ${eventTitle}`, source: 'google / organic', userId: 'usr_902144', status: 'processado' },
    { id: 'EV-105', timestamp: '10:00:20', name: 'page_view', pageTitle: `DiskIngressos — ${eventTitle}`, source: 'direct / (none)', userId: 'usr_518293', status: 'processado' }
  ])

  // Disparo de teste DebugView
  const handleSendTestEvent = () => {
    setIsSendingTest(true)
    setTimeout(() => {
      setIsSendingTest(false)
      const newEv: Ga4RealtimeEvent = {
        id: `EV-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        name: 'test_purchase_debugview',
        pageTitle: `DebugView Ping — ${eventTitle}`,
        source: 'diskingressos_debugger / admin',
        value: 'R$ 250,00',
        userId: 'usr_admin_test',
        status: 'processado'
      }
      setRealtimeEvents(prev => [newEv, ...prev])
      notify('✅ Evento GA4 enviado via Measurement Protocol! Recebido no DebugView.')
    }, 1000)
  }

  // Dados do Funil
  const funnelSteps = [
    { step: 1, name: 'page_view', label: 'Visualização da Página', count: 48200, pctTotal: '100%', dropOff: '—' },
    { step: 2, name: 'view_item', label: 'Visualização de Ingressos/Lotes', count: 32600, pctTotal: '67,6%', dropOff: '-32,4%' },
    { step: 3, name: 'add_to_cart', label: 'Ingresso Adicionado ao Carrinho', count: 12400, pctTotal: '25,7%', dropOff: '-61,9%' },
    { step: 4, name: 'begin_checkout', label: 'Início de Checkout', count: 6850, pctTotal: '14,2%', dropOff: '-44,7%' },
    { step: 5, name: 'purchase', label: 'Compra Aprovada (Conversão)', count: 2140, pctTotal: '4,4%', dropOff: '-68,7%' }
  ]

  // Canais de Aquisição GA4
  const channels = [
    { channel: 'Pesquisa Orgânica (Google)', sessions: 18450, users: 14200, bounceRate: '34,2%', convRate: '5,8%', revenue: 'R$ 88.420,00' },
    { channel: 'Google Ads (Search & PMax)', sessions: 12800, users: 9640, bounceRate: '28,6%', convRate: '6,4%', revenue: 'R$ 72.150,00' },
    { channel: 'Redes Sociais (Meta & TikTok)', sessions: 10420, users: 8100, bounceRate: '38,1%', convRate: '4,9%', revenue: 'R$ 48.960,00' },
    { channel: 'Tráfego Direto', sessions: 6400, users: 4920, bounceRate: '26,4%', convRate: '7,1%', revenue: 'R$ 41.200,00' },
    { channel: 'E-mail Marketing DiskIngressos', sessions: 3820, users: 2950, bounceRate: '22,1%', convRate: '8,4%', revenue: 'R$ 29.800,00' }
  ]

  return (
    <section className="growth-page" style={{ padding: '20px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* CABEÇALHO PRINCIPAL */}
      <div className="growth-intro growth-actions" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              GOOGLE ANALYTICS 4 · MEASUREMENT PROTOCOL
            </span>
            <span style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', borderRadius: '12px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> Coleta Ativa ({config.measurementId})
            </span>
          </div>
          <h1 style={{ color: '#0F172A', fontSize: '24px', fontWeight: 800, margin: '0 0 6px' }}>
            Google Analytics 4 — {eventTitle}
          </h1>
          <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
            Métricas de engajamento, funil de compras e-commerce e transmissão server-side via Measurement Protocol.
          </p>
        </div>

        {/* CONTROLES DO CABEÇALHO */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={currentEventId}
            onChange={e => setCurrentEventId(e.target.value)}
            style={{ height: '36px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '12px', color: '#0F172A', background: '#FFFFFF', fontWeight: 600 }}
          >
            <option value="all">Todos os Eventos ({events.length})</option>
            {events.map(ev => (
              <option key={ev.id} value={String(ev.id)}>{ev.title}</option>
            ))}
          </select>

          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            style={{ height: '36px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '12px', color: '#0F172A', background: '#FFFFFF', fontWeight: 600 }}
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="all">Todo o Período</option>
          </select>

          <button
            type="button"
            className="btn secondary"
            onClick={handleSendTestEvent}
            disabled={isSendingTest}
            style={{ height: '36px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Zap size={14} className={isSendingTest ? 'animate-spin' : ''} color="#EA580C" />
            {isSendingTest ? 'Enviando ao GA4...' : 'Enviar Ping DebugView'}
          </button>
        </div>
      </div>

      {/* KPIS PRINCIPAIS */}
      <div className="growth-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '12px', marginBottom: '8px' }}>
            <span>Usuários Ativos (30d)</span>
            <Users size={18} color="#EA580C" />
          </div>
          <strong style={{ color: '#0F172A', fontSize: '22px', fontWeight: 800, display: 'block' }}>
            39.810
          </strong>
          <small style={{ color: '#16A34A', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            ↑ 14,2% vs período anterior
          </small>
        </article>

        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '12px', marginBottom: '8px' }}>
            <span>Visualizações de Tela</span>
            <Eye size={18} color="#2563EB" />
          </div>
          <strong style={{ color: '#2563EB', fontSize: '22px', fontWeight: 800, display: 'block' }}>
            82.490
          </strong>
          <small style={{ color: '#64748B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            2,07 telas por usuário
          </small>
        </article>

        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '12px', marginBottom: '8px' }}>
            <span>Taxa de Engajamento</span>
            <Activity size={18} color="#16A34A" />
          </div>
          <strong style={{ color: '#16A34A', fontSize: '22px', fontWeight: 800, display: 'block' }}>
            68,4%
          </strong>
          <small style={{ color: '#16A34A', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            Sessões com mais de 10s ou 2+ conversões
          </small>
        </article>

        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '12px', marginBottom: '8px' }}>
            <span>Receita E-commerce GA4</span>
            <ShoppingCart size={18} color="#0F172A" />
          </div>
          <strong style={{ color: '#0F172A', fontSize: '22px', fontWeight: 800, display: 'block' }}>
            R$ 280.530,00
          </strong>
          <small style={{ color: '#16A34A', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            2.140 compras aprovadas
          </small>
        </article>
      </div>

      {/* ABAS DA PÁGINA */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #E2E8F0', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('visao-geral')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'visao-geral' ? '3px solid #EA580C' : '3px solid transparent',
            color: activeTab === 'visao-geral' ? '#EA580C' : '#64748B',
            cursor: 'pointer'
          }}
        >
          Visão Geral & Desempenho
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('funil')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'funil' ? '3px solid #EA580C' : '3px solid transparent',
            color: activeTab === 'funil' ? '#EA580C' : '#64748B',
            cursor: 'pointer'
          }}
        >
          Funil de Compras E-commerce (5 Etapas)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('canais')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'canais' ? '3px solid #EA580C' : '3px solid transparent',
            color: activeTab === 'canais' ? '#EA580C' : '#64748B',
            cursor: 'pointer'
          }}
        >
          Canais de Aquisição GA4
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('debugview')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'debugview' ? '3px solid #EA580C' : '3px solid transparent',
            color: activeTab === 'debugview' ? '#EA580C' : '#64748B',
            cursor: 'pointer'
          }}
        >
          DebugView em Tempo Real ({realtimeEvents.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('configuracao')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'configuracao' ? '3px solid #EA580C' : '3px solid transparent',
            color: activeTab === 'configuracao' ? '#EA580C' : '#64748B',
            cursor: 'pointer'
          }}
        >
          Configuração do GA4 & Protocolo
        </button>
      </div>

      {/* ABA 1: VISÃO GERAL */}
      {activeTab === 'visao-geral' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0F172A', fontWeight: 800 }}>
              Eventos de Conversão Mais Disparados no GA4
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748B' }}>
              Mapeamento de eventos automáticos e e-commerce avançado registrados pelo Measurement Protocol.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'page_view', desc: 'Visualização da página ou tela do evento', count: 48200, pct: 100 },
                { name: 'view_item', desc: 'Abertura da tabela de preços e lotes de ingressos', count: 32600, pct: 67 },
                { name: 'add_to_cart', desc: 'Ingresso inserido na sacola de compras', count: 12400, pct: 25 },
                { name: 'begin_checkout', desc: 'Usuário iniciou a inserção de dados e forma de pagamento', count: 6850, pct: 14 },
                { name: 'purchase', desc: 'Transação PIX, Cartão ou Boleto concluída com sucesso', count: 2140, pct: 4.4 }
              ].map(item => (
                <div key={item.name} style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <code style={{ fontSize: '13px', fontWeight: 800, color: '#EA580C' }}>{item.name}</code>
                    <strong style={{ fontSize: '14px', color: '#0F172A' }}>{item.count.toLocaleString('pt-BR')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748B', marginBottom: '6px' }}>
                    <span>{item.desc}</span>
                    <span>{item.pct}% do total</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.pct}%`, height: '100%', background: '#EA580C', borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#0F172A', fontWeight: 800 }}>Dispositivos & Tecnologia</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#475569' }}>Dispositivos Móveis (Smartphones)</span>
                    <strong style={{ color: '#0F172A' }}>82,4%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#E2E8F0', borderRadius: '3px' }}>
                    <div style={{ width: '82.4%', height: '100%', background: '#2563EB', borderRadius: '3px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#475569' }}>Computadores (Desktop)</span>
                    <strong style={{ color: '#0F172A' }}>16,8%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#E2E8F0', borderRadius: '3px' }}>
                    <div style={{ width: '16.8%', height: '100%', background: '#64748B', borderRadius: '3px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#475569' }}>Tablets</span>
                    <strong style={{ color: '#0F172A' }}>0,8%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#E2E8F0', borderRadius: '3px' }}>
                    <div style={{ width: '0.8%', height: '100%', background: '#CBD5E1', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>
            </article>

            <article className="growth-panel" style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16A34A', marginBottom: '8px' }}>
                <ShieldCheck size={20} />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>Consent Mode v2 Ativo</h4>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                A DiskIngressos aplica o Google Consent Mode v2 com suporte a <code>analytics_storage</code> e <code>ad_storage</code> garantindo conformidade com a LGPD e modelagem de conversões com inteligência artificial para usuários que recusam cookies.
              </p>
            </article>
          </div>
        </div>
      )}

      {/* ABA 2: FUNIL DE COMPRAS */}
      {activeTab === 'funil' && (
        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#0F172A', fontSize: '17px', fontWeight: 800 }}>
              Funil de Compras E-commerce DiskIngressos (GA4)
            </h3>
            <p style={{ margin: '3px 0 0', color: '#64748B', fontSize: '12px' }}>
              Acompanhe a retenção e o abandono de usuários desde a primeira visita à página do evento até a emissão do ingresso.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {funnelSteps.map((step, idx) => (
              <div key={step.step} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', background: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#EA580C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
                      {step.step}
                    </span>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block' }}>{step.label}</strong>
                      <code style={{ fontSize: '11px', color: '#EA580C' }}>{step.name}</code>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '16px', color: '#0F172A', display: 'block' }}>{step.count.toLocaleString('pt-BR')} sessões</strong>
                    <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>{step.pctTotal} do público inicial</span>
                  </div>
                </div>

                <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: step.pctTotal, height: '100%', background: '#EA580C', borderRadius: '4px' }} />
                </div>

                {idx < funnelSteps.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#94A3B8' }}>
                    <span>Drop-off para próxima etapa:</span>
                    <strong style={{ color: '#EF4444' }}>{step.dropOff}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </article>
      )}

      {/* ABA 3: CANAIS DE AQUISIÇÃO */}
      {activeTab === 'canais' && (
        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="panel-head" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: 0, color: '#0F172A', fontSize: '16px', fontWeight: 800 }}>
              Canais de Aquisição e Origens de Tráfego GA4
            </h3>
            <p style={{ margin: '2px 0 0', color: '#64748B', fontSize: '12px' }}>
              Performance consolidada de faturamento e taxa de conversão por grupo de canais primários.
            </p>
          </div>

          <table className="growth-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #CBD5E1' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Grupo de Canais Primário</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>Sessões</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>Usuários</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>Taxa Rejeição</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>Taxa Conversão</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>Receita Total</th>
              </tr>
            </thead>
            <tbody>
              {channels.map(ch => (
                <tr key={ch.channel} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    {ch.channel}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>
                    {ch.sessions.toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>
                    {ch.users.toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', color: '#64748B' }}>
                    {ch.bounceRate}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 800, color: '#16A34A' }}>
                    {ch.convRate}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    {ch.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}

      {/* ABA 4: DEBUGVIEW EM TEMPO REAL */}
      {activeTab === 'debugview' && (
        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="panel-head" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '16px', fontWeight: 800 }}>
                DebugView em Tempo Real — Eventos Recebidos
              </h3>
              <p style={{ margin: '2px 0 0', color: '#64748B', fontSize: '12px' }}>
                Monitore requisições transmitidas pelo Measurement Protocol e SDK Web do Google Analytics 4.
              </p>
            </div>
            <button
              type="button"
              className="btn secondary"
              onClick={handleSendTestEvent}
              disabled={isSendingTest}
              style={{ fontSize: '12px', height: '32px' }}
            >
              <RefreshCw size={13} className={isSendingTest ? 'animate-spin' : ''} /> Disparar Teste
            </button>
          </div>

          <table className="growth-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #CBD5E1' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Horário</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Nome do Evento</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Página / Tela</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Origem / Mídia</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Valor da Compra</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#475569' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {realtimeEvents.map(ev => (
                <tr key={ev.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748B' }}>
                    {ev.timestamp}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <code style={{ fontSize: '12px', fontWeight: 800, color: '#EA580C', background: '#FFF7ED', padding: '2px 6px', borderRadius: '4px' }}>
                      {ev.name}
                    </code>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#0F172A' }}>
                    {ev.pageTitle}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#475569' }}>
                    {ev.source}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: ev.value ? '#16A34A' : '#94A3B8' }}>
                    {ev.value || '—'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', borderRadius: '12px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                      ● Processado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}

      {/* ABA 5: CONFIGURAÇÃO DO GA4 */}
      {activeTab === 'configuracao' && (
        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '24px', maxWidth: '800px' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '17px', color: '#0F172A', fontWeight: 800 }}>
            Credenciais do Google Analytics 4 & Measurement Protocol
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#64748B' }}>
            Configure o Measurement ID e a Chave de API de Protocolo de Medição para permitir o envio server-side de conversões.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                ID de Medição GA4 (Measurement ID) *
              </label>
              <input
                type="text"
                value={config.measurementId}
                onChange={e => setConfig({ ...config, measurementId: e.target.value })}
                placeholder="Ex: G-XXXXXXXXXX"
                style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '13px', fontFamily: 'monospace' }}
              />
              <small style={{ color: '#64748B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                Encontrado em Administrador &gt; Coleta e modificação de dados &gt; Fluxos de dados.
              </small>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                Segredo da API do Measurement Protocol (API Secret) *
              </label>
              <input
                type="password"
                value={config.apiSecret}
                onChange={e => setConfig({ ...config, apiSecret: e.target.value })}
                placeholder="mp_sec_..."
                style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '13px', fontFamily: 'monospace' }}
              />
              <small style={{ color: '#64748B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                Gerado na seção "Segredos da API do Measurement Protocol" do fluxo de dados web no GA4.
              </small>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                URL do Fluxo da Web
              </label>
              <input
                type="text"
                value={config.streamUrl}
                onChange={e => setConfig({ ...config, streamUrl: e.target.value })}
                placeholder="https://www.diskingressos.com.br"
                style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '13px' }}
              />
            </div>

            <div style={{ marginTop: '10px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#0F172A', fontWeight: 700 }}>
                Eventos GA4 Habilitados para Transmissão Automática
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                {Object.entries(config.enabledEvents).map(([eventName, enabled]) => (
                  <label key={eventName} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#0F172A', cursor: 'pointer', background: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <input
                      type="checkbox"
                      checked={enabled as boolean}
                      onChange={e => setConfig({
                        ...config,
                        enabledEvents: { ...config.enabledEvents, [eventName]: e.target.checked }
                      })}
                    />
                    <code style={{ fontWeight: 700, color: '#EA580C' }}>{eventName}</code>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
              <button
                type="button"
                className="btn secondary"
                onClick={handleSendTestEvent}
                disabled={isSendingTest}
                style={{ height: '36px', fontSize: '12px' }}
              >
                Testar Envio DebugView
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={handleSaveConfig}
                style={{ background: '#EA580C', borderColor: '#EA580C', height: '36px', fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}
              >
                Salvar Configurações GA4
              </button>
            </div>
          </div>
        </article>
      )}
    </section>
  )
}
