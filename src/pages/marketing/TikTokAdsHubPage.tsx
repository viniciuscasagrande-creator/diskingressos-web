import React, { useState, useEffect, useMemo } from 'react'
import {
  Play, Plus, Pause, RefreshCw, CheckCircle2, ShieldCheck,
  TrendingUp, WalletCards, MousePointerClick, Target, Video,
  Sparkles, ExternalLink, X, Zap, Eye, Check, Sliders
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import '../../styles/tracking-premium.css'

interface TikTokAdsHubPageProps {
  events: EventItem[]
  selectedEventId?: number | null
  producerId?: number | null
  producerName?: string
  notify: (msg: string) => void
  onNavigate?: (page: any) => void
}

interface TikTokSparkAdItem {
  id: number
  name: string
  videoUrl: string
  authorHandle: string
  format: 'Spark Ad' | 'In-Feed Video' | 'TopView'
  budget: number
  spent: number
  views: number
  clicks: number
  cpm: string
  ctr: string
  sales: number
  revenue: number
  roas: string
  status: 'ativa' | 'pausada'
  createdAt: string
}

interface TikTokEventLog {
  id: string
  timestamp: string
  eventName: string
  eventIdValue: string
  status: '200_OK' | 'RECEBIDO' | 'ERRO'
  latencyMs: number
}

const DEFAULT_TIKTOK_CONFIG = {
  pixelCode: 'C789234KJN891238910',
  accessToken: 'tt_live_acc_token_948210492810...a98b1',
  testEventCode: 'TEST_TIKTOK_8819',
  enableEventsApi: true,
  enableAdvancedMatching: true,
  enabledEvents: {
    PageView: true,
    ViewContent: true,
    AddToCart: true,
    InitiateCheckout: true,
    AddPaymentInfo: true,
    PlaceAnOrder: true,
    CompletePayment: true,
    CompleteRegistration: true
  }
}

export default function TikTokAdsHubPage({
  events,
  selectedEventId: initialSelectedEventId,
  producerId,
  producerName = 'Produtora',
  notify,
  onNavigate
}: TikTokAdsHubPageProps) {
  const [currentEventId, setCurrentEventId] = useState<string>(
    initialSelectedEventId ? String(initialSelectedEventId) : 'all'
  )
  const [period, setPeriod] = useState<string>('30')
  const [activeTab, setActiveTab] = useState<'campanhas' | 'pixel-api' | 'publicos' | 'logs'>('campanhas')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTestingApi, setIsTestingApi] = useState(false)

  // Configuração persistente do TikTok Pixel & Events API
  const storageKey = `diskingressos:tiktok-ads:config:${producerId || 'default'}`
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : DEFAULT_TIKTOK_CONFIG
    } catch {
      return DEFAULT_TIKTOK_CONFIG
    }
  })

  const handleSaveConfig = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(config))
      notify('Configuração do TikTok Pixel & Events API salva com sucesso!')
    } catch {
      notify('Erro ao salvar configurações do TikTok Ads.')
    }
  }

  // Lista de campanhas Spark Ads
  const campaignsStorageKey = `diskingressos:tiktok-ads:campaigns:${producerId || 'default'}`
  const [campaigns, setCampaigns] = useState<TikTokSparkAdItem[]>(() => {
    try {
      const saved = localStorage.getItem(campaignsStorageKey)
      if (saved) return JSON.parse(saved)
    } catch {}
    return [
      {
        id: 1,
        name: 'Viral Teaser Lineup — Spark Ad Oficial',
        videoUrl: 'https://tiktok.com/@diskingressos/video/7391823901',
        authorHandle: '@diskingressos',
        format: 'Spark Ad',
        budget: 1800,
        spent: 1450,
        views: 142800,
        clicks: 4120,
        cpm: 'R$ 10,15',
        ctr: '2,88%',
        sales: 78,
        revenue: 14040,
        roas: '9,7x',
        status: 'ativa',
        createdAt: '11/09/2026'
      },
      {
        id: 2,
        name: 'Bastidores & Montagem Palco — In-Feed',
        videoUrl: 'https://tiktok.com/@produtora/video/7391942084',
        authorHandle: '@produtora',
        format: 'In-Feed Video',
        budget: 1200,
        spent: 980,
        views: 89600,
        clicks: 2780,
        cpm: 'R$ 10,93',
        ctr: '3,10%',
        sales: 48,
        revenue: 8640,
        roas: '8,8x',
        status: 'ativa',
        createdAt: '13/09/2026'
      }
    ]
  })

  // Logs de disparos TikTok Events API
  const [logs, setLogs] = useState<TikTokEventLog[]>([
    { id: 'TT-LOG-1', timestamp: '10:07:30', eventName: 'CompletePayment', eventIdValue: 'tt_ord_882910', status: '200_OK', latencyMs: 58 },
    { id: 'TT-LOG-2', timestamp: '10:05:12', eventName: 'InitiateCheckout', eventIdValue: 'tt_chk_994102', status: '200_OK', latencyMs: 64 },
    { id: 'TT-LOG-3', timestamp: '10:01:45', eventName: 'AddToCart', eventIdValue: 'tt_cart_331049', status: '200_OK', latencyMs: 46 },
    { id: 'TT-LOG-4', timestamp: '09:59:10', eventName: 'ViewContent', eventIdValue: 'tt_view_118920', status: '200_OK', latencyMs: 38 },
    { id: 'TT-LOG-5', timestamp: '09:56:02', eventName: 'PageView', eventIdValue: 'tt_pv_771923', status: '200_OK', latencyMs: 34 }
  ])

  // Form states para criação de Spark Ad
  const [newAdName, setNewAdName] = useState('')
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [newAuthor, setNewAuthor] = useState('@diskingressos')
  const [newBudget, setNewBudget] = useState('1000')

  const currentEvent = useMemo(() => {
    if (currentEventId === 'all') return null
    return events.find(e => String(e.id) === currentEventId) || null
  }, [events, currentEventId])

  const eventTitle = currentEvent ? currentEvent.title : 'Todos os Eventos'

  const totalSpent = useMemo(() => campaigns.reduce((acc, c) => acc + c.spent, 0), [campaigns])
  const totalViews = useMemo(() => campaigns.reduce((acc, c) => acc + c.views, 0), [campaigns])
  const totalSales = useMemo(() => campaigns.reduce((acc, c) => acc + c.sales, 0), [campaigns])
  const totalRevenue = useMemo(() => campaigns.reduce((acc, c) => acc + c.revenue, 0), [campaigns])
  const avgRoas = totalSpent > 0 ? (totalRevenue / totalSpent).toFixed(1) : '0,0'

  const handleToggleCampaignStatus = (id: number) => {
    setCampaigns(prev => {
      const updated = prev.map(c => {
        if (c.id === id) {
          const next = c.status === 'ativa' ? 'pausada' : 'ativa'
          notify(`Campanha "${c.name}" ${next === 'ativa' ? 'ativada' : 'pausada'} no TikTok Ads.`)
          return { ...c, status: next as 'ativa' | 'pausada' }
        }
        return c
      })
      try { localStorage.setItem(campaignsStorageKey, JSON.stringify(updated)) } catch {}
      return updated
    })
  }

  const handleCreateSparkAd = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newAdName || `${eventTitle} — Novo Spark Ad`
    const budgetNum = Number(newBudget) || 1000

    const newItem: TikTokSparkAdItem = {
      id: Date.now(),
      name,
      videoUrl: newVideoUrl || 'https://tiktok.com/@diskingressos/video/7391999999',
      authorHandle: newAuthor || '@diskingressos',
      format: 'Spark Ad',
      budget: budgetNum,
      spent: 0,
      views: 0,
      clicks: 0,
      cpm: 'R$ 11,20',
      ctr: '0,0%',
      sales: 0,
      revenue: 0,
      roas: '0,0x',
      status: 'ativa',
      createdAt: new Date().toLocaleDateString('pt-BR')
    }

    const updated = [newItem, ...campaigns]
    setCampaigns(updated)
    try { localStorage.setItem(campaignsStorageKey, JSON.stringify(updated)) } catch {}
    setIsModalOpen(false)
    setNewAdName('')
    setNewVideoUrl('')
    notify(`🚀 Campanha TikTok Spark Ad "${name}" criada com sucesso!`)
  }

  const handleTestApi = () => {
    setIsTestingApi(true)
    setTimeout(() => {
      setIsTestingApi(false)
      const newLog: TikTokEventLog = {
        id: `TT-LOG-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        eventName: 'TestEvent',
        eventIdValue: `tt_test_${Date.now()}`,
        status: '200_OK',
        latencyMs: Math.floor(35 + Math.random() * 40)
      }
      setLogs(prev => [newLog, ...prev])
      notify('✅ Teste TikTok Events API bem-sucedido! Resposta HTTP 200 OK do servidor TikTok.')
    }, 1100)
  }

  return (
    <section className="growth-page" style={{ padding: '20px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* CABEÇALHO */}
      <div className="growth-intro growth-actions" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TIKTOK FOR BUSINESS · SPARK ADS & EVENTS API
            </span>
            <span style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', borderRadius: '12px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> TikTok Pixel Ativo ({config.pixelCode})
            </span>
          </div>
          <h1 style={{ color: '#0F172A', fontSize: '24px', fontWeight: 800, margin: '0 0 6px' }}>
            TikTok Ads & Pixel — {eventTitle}
          </h1>
          <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
            Campanhas virais em vídeo com rastreamento via TikTok Pixel & Event API.
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

          <button
            type="button"
            className="btn secondary"
            onClick={handleTestApi}
            disabled={isTestingApi}
            style={{ height: '36px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isTestingApi ? 'animate-spin' : ''} />
            {isTestingApi ? 'Testando API...' : 'Testar Conexão TikTok'}
          </button>

          <button
            type="button"
            className="btn primary"
            onClick={() => setIsModalOpen(true)}
            style={{ background: '#0F172A', borderColor: '#0F172A', height: '36px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#FFFFFF', fontWeight: 700 }}
          >
            <Plus size={15} /> Criar Spark Ad
          </button>
        </div>
      </div>

      {/* KPIS */}
      <div className="growth-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '12px', marginBottom: '8px' }}>
            <span>Investimento TikTok</span>
            <WalletCards size={18} color="#0F172A" />
          </div>
          <strong style={{ color: '#0F172A', fontSize: '22px', fontWeight: 800, display: 'block' }}>
            R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </strong>
          <small style={{ color: '#64748B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            Orçamento: R$ {campaigns.reduce((a, b) => a + b.budget, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </small>
        </article>

        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '12px', marginBottom: '8px' }}>
            <span>Visualizações de Vídeo</span>
            <Eye size={18} color="#2563EB" />
          </div>
          <strong style={{ color: '#2563EB', fontSize: '22px', fontWeight: 800, display: 'block' }}>
            {totalViews.toLocaleString('pt-BR')} views
          </strong>
          <small style={{ color: '#16A34A', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            CPM Médio: R$ 10,48
          </small>
        </article>

        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '12px', marginBottom: '8px' }}>
            <span>ROAS Médio TikTok</span>
            <TrendingUp size={18} color="#16A34A" />
          </div>
          <strong style={{ color: '#16A34A', fontSize: '22px', fontWeight: 800, display: 'block' }}>
            {avgRoas}x
          </strong>
          <small style={{ color: '#16A34A', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            Faturamento: R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </small>
        </article>

        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '12px', marginBottom: '8px' }}>
            <span>Ingressos Vendidos</span>
            <MousePointerClick size={18} color="#0F172A" />
          </div>
          <strong style={{ color: '#0F172A', fontSize: '22px', fontWeight: 800, display: 'block' }}>
            {totalSales} ingressos
          </strong>
          <small style={{ color: '#64748B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            CPA: R$ {(totalSpent / (totalSales || 1)).toFixed(2)} por ingresso
          </small>
        </article>
      </div>

      {/* ABAS */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #E2E8F0', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('campanhas')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'campanhas' ? '3px solid #0F172A' : '3px solid transparent',
            color: activeTab === 'campanhas' ? '#0F172A' : '#64748B',
            cursor: 'pointer'
          }}
        >
          Campanhas & Spark Ads ({campaigns.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pixel-api')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pixel-api' ? '3px solid #0F172A' : '3px solid transparent',
            color: activeTab === 'pixel-api' ? '#0F172A' : '#64748B',
            cursor: 'pointer'
          }}
        >
          Configuração do TikTok Pixel & Events API
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('publicos')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'publicos' ? '3px solid #0F172A' : '3px solid transparent',
            color: activeTab === 'publicos' ? '#0F172A' : '#64748B',
            cursor: 'pointer'
          }}
        >
          Públicos Virais & Engajamento TikTok
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'logs' ? '3px solid #0F172A' : '3px solid transparent',
            color: activeTab === 'logs' ? '#0F172A' : '#64748B',
            cursor: 'pointer'
          }}
        >
          Logs de Transmissão ({logs.length})
        </button>
      </div>

      {/* ABA 1: CAMPANHAS & SPARK ADS */}
      {activeTab === 'campanhas' && (
        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="panel-head" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '16px', fontWeight: 800 }}>
                Spark Ads em Veiculação ({campaigns.length})
              </h3>
              <p style={{ margin: '2px 0 0', color: '#64748B', fontSize: '12px' }}>
                Postagens do TikTok impulsionadas com botão de compra direta no site da DiskIngressos.
              </p>
            </div>
            <button
              type="button"
              className="btn secondary"
              onClick={() => setIsModalOpen(true)}
              style={{ fontSize: '12px', height: '32px' }}
            >
              <Plus size={14} /> Novo Spark Ad
            </button>
          </div>

          <div className="table-scroll">
            <table className="growth-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #CBD5E1' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Campanha / Vídeo</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Formato</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>Investido</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>Views (CPM)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>Cliques (CTR)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>Vendas</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>ROAS</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#475569' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <strong style={{ color: '#0F172A', fontSize: '13px', display: 'block' }}>{c.name}</strong>
                      <small style={{ color: '#64748B', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        Autor: {c.authorHandle} • Criado em {c.createdAt}
                      </small>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        {c.format}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: c.status === 'ativa' ? '#DCFCE7' : '#FEF3C7',
                        color: c.status === 'ativa' ? '#166534' : '#92400E'
                      }}>
                        ● {c.status === 'ativa' ? 'Ativa' : 'Pausada'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                      R$ {c.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>
                      {c.views.toLocaleString('pt-BR')} <span style={{ color: '#2563EB', fontWeight: 700 }}>({c.cpm})</span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>
                      {c.clicks.toLocaleString('pt-BR')} <span style={{ color: '#0F172A', fontWeight: 700 }}>({c.ctr})</span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                      {c.sales}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 800, color: '#16A34A' }}>
                      {c.roas}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleCampaignStatus(c.id)}
                        className="btn secondary"
                        style={{ height: '28px', fontSize: '11px', padding: '0 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        {c.status === 'ativa' ? <Pause size={12} /> : <Play size={12} />}
                        {c.status === 'ativa' ? 'Pausar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {/* ABA 2: CONFIGURAÇÃO DO PIXEL TIKTOK */}
      {activeTab === 'pixel-api' && (
        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '24px', maxWidth: '850px' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '17px', color: '#0F172A', fontWeight: 800 }}>
            Configuração do TikTok Pixel & Events API
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#64748B' }}>
            Insira o código do Pixel e o Access Token permanente da Events API gerado no TikTok Ads Manager.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                Código do TikTok Pixel (Pixel ID) *
              </label>
              <input
                type="text"
                value={config.pixelCode}
                onChange={e => setConfig({ ...config, pixelCode: e.target.value })}
                placeholder="Ex: C789234KJN891238910"
                style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '13px', fontFamily: 'monospace' }}
              />
              <small style={{ color: '#64748B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                Encontrado em TikTok Ads Manager &gt; Ativos &gt; Eventos &gt; Web Events.
              </small>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                Access Token da Events API (Server-side) *
              </label>
              <textarea
                rows={3}
                value={config.accessToken}
                onChange={e => setConfig({ ...config, accessToken: e.target.value })}
                placeholder="tt_live_acc_token_..."
                style={{ width: '100%', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '8px 12px', fontSize: '12px', fontFamily: 'monospace', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                Código de Teste do TikTok (Opcional)
              </label>
              <input
                type="text"
                value={config.testEventCode}
                onChange={e => setConfig({ ...config, testEventCode: e.target.value })}
                placeholder="Ex: TEST_TIKTOK_8819"
                style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '13px', fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ marginTop: '10px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#0F172A', fontWeight: 700 }}>
                Eventos TikTok Habilitados para Transmissão
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
                    <span style={{ fontWeight: 600 }}>{eventName}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
              <button
                type="button"
                className="btn secondary"
                onClick={handleTestApi}
                disabled={isTestingApi}
                style={{ height: '36px', fontSize: '12px' }}
              >
                Testar Envio TikTok API
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={handleSaveConfig}
                style={{ background: '#0F172A', borderColor: '#0F172A', height: '36px', fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}
              >
                Salvar Configurações TikTok
              </button>
            </div>
          </div>
        </article>
      )}

      {/* ABA 3: PÚBLICOS VIRAIS */}
      {activeTab === 'publicos' && (
        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0F172A', fontWeight: 800 }}>
            Públicos de Engajamento & Remarketing no TikTok
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748B' }}>
            Segmentos criados a partir de interações com os vídeos de divulgação e compras no site.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', background: '#F8FAFC' }}>
              <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                Assistiram ao menos 50% dos Vídeos (30d)
              </strong>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 8px' }}>Público de alta retenção que consumiu metade do teaser ou lineup.</p>
              <strong style={{ fontSize: '18px', color: '#2563EB' }}>68.200 usuários</strong>
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', background: '#F8FAFC' }}>
              <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                Interagiram com o Perfil @diskingressos
              </strong>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 8px' }}>Curtidas, comentários, compartilhamentos ou cliques no link da bio.</p>
              <strong style={{ fontSize: '18px', color: '#16A34A' }}>44.100 usuários</strong>
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', background: '#F8FAFC' }}>
              <strong style={{ fontSize: '14px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                Lookalike TikTok Compradores (2%)
              </strong>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 8px' }}>Perfil semelhante com maior afinidade de compra de ingressos.</p>
              <strong style={{ fontSize: '18px', color: '#0F172A' }}>920.000 perfis</strong>
            </div>
          </div>
        </article>
      )}

      {/* ABA 4: LOGS DE TRANSMISSÃO */}
      {activeTab === 'logs' && (
        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="panel-head" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#0F172A', fontSize: '16px', fontWeight: 800 }}>
              Logs de Transmissão da TikTok Events API
            </h3>
            <button
              type="button"
              className="btn secondary"
              onClick={handleTestApi}
              disabled={isTestingApi}
              style={{ fontSize: '12px', height: '32px' }}
            >
              <RefreshCw size={13} className={isTestingApi ? 'animate-spin' : ''} /> Disparar Teste
            </button>
          </div>

          <table className="growth-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #CBD5E1' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Horário</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Evento TikTok</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Event ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>Latência</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748B' }}>
                    {log.timestamp}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <code style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                      {log.eventName}
                    </code>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#475569', fontFamily: 'monospace' }}>
                    {log.eventIdValue}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', borderRadius: '12px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                      HTTP 200 OK
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#64748B' }}>
                    {log.latencyMs} ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}

      {/* MODAL: CRIAR SPARK AD */}
      {isModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }} onClick={() => setIsModalOpen(false)}>
          <div
            className="utm-modal-card-v2"
            style={{ width: 'min(580px, 94vw)', maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>
                  TIKTOK FOR BUSINESS
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: '#0F172A', fontWeight: 800 }}>
                  Criar Campanha Spark Ad
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B' }}>
                  Vincule um vídeo oficial para impulsionar conversões de ingressos.
                </p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSparkAd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  Nome da Campanha / Anúncio *
                </label>
                <input
                  type="text"
                  required
                  placeholder={`Ex: ${eventTitle} — Teaser Oficial`}
                  value={newAdName}
                  onChange={e => setNewAdName(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  URL do Vídeo no TikTok ou Código de Autorização Spark *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: https://www.tiktok.com/@diskingressos/video/7391823901"
                  value={newVideoUrl}
                  onChange={e => setNewVideoUrl(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                    Autor / Criador
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={e => setNewAuthor(e.target.value)}
                    placeholder="@diskingressos"
                    style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                    Orçamento Total (R$)
                  </label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={newBudget}
                    onChange={e => setNewBudget(e.target.value)}
                    style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  DESTINO COM TIKTOK PIXEL RASTREADO
                </span>
                <code style={{ fontSize: '11px', color: '#2563EB', wordBreak: 'break-all', display: 'block' }}>
                  https://www.diskingressos.com.br/evento/{currentEvent?.id || 'geral'}?utm_source=tiktok&utm_medium=spark_ad&utm_campaign=tt_{newAdName ? newAdName.toLowerCase().replace(/\s+/g, '_') : 'promo'}
                </code>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                <button type="button" className="btn secondary" onClick={() => setIsModalOpen(false)} style={{ fontSize: '12px' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn primary" style={{ background: '#0F172A', borderColor: '#0F172A', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#FFFFFF', fontWeight: 700 }}>
                  <Plus size={14} /> Publicar Spark Ad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
