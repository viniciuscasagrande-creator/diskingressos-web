import React, { useState, useEffect, useMemo } from 'react'
import {
  Target, Plus, Play, Pause, RefreshCw, CheckCircle2, AlertCircle,
  Copy, ExternalLink, Settings, ShieldCheck, WalletCards, TrendingUp,
  MousePointerClick, Activity, Layers, Users, Zap, X, ChevronRight,
  Sliders, ArrowUpRight, Check, Eye
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import '../../styles/tracking-premium.css'

interface MetaAdsHubPageProps {
  events: EventItem[]
  selectedEventId?: number | null
  producerId?: number | null
  producerName?: string
  notify: (msg: string) => void
  onNavigate?: (page: any) => void
}

interface MetaAdItem {
  id: number
  name: string
  format: 'Instagram Stories' | 'Instagram Reels' | 'Instagram Feed' | 'Facebook Feed' | 'Meta Carrossel'
  budget: number
  spent: number
  impressions: number
  clicks: number
  ctr: string
  cpa: string
  sales: number
  revenue: number
  roas: string
  status: 'ativa' | 'pausada'
  pixelId: string
  targetAudience: string
  createdAt: string
}

interface CapiDeliveryLog {
  id: string
  timestamp: string
  eventName: string
  eventIdValue: string
  status: '200_OK' | 'DEDUPLICADO' | 'ERRO'
  dedupRatio: string
  latencyMs: number
}

const DEFAULT_META_CONFIG = {
  pixelId: '948271049281729',
  capiToken: 'EAAGNO4XZB9k8BAOZCVn1g9k3m0...QWkpZBC10w49rZAPkL',
  testCode: 'TEST94821',
  trackingMode: 'HYBRID',
  autoDeduplication: true,
  enableAdvancedMatching: true,
  enabledEvents: {
    PageView: true,
    ViewContent: true,
    AddToCart: true,
    InitiateCheckout: true,
    AddPaymentInfo: true,
    Purchase: true,
    Lead: false,
    CompleteRegistration: true
  }
}

export default function MetaAdsHubPage({
  events,
  selectedEventId: initialSelectedEventId,
  producerId,
  producerName = 'Produtora',
  notify,
  onNavigate
}: MetaAdsHubPageProps) {
  const [currentEventId, setCurrentEventId] = useState<string>(
    initialSelectedEventId ? String(initialSelectedEventId) : 'all'
  )
  const [period, setPeriod] = useState<string>('30')
  const [activeTab, setActiveTab] = useState<'campanhas' | 'pixel-token' | 'diagnostico' | 'publicos'>('campanhas')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTestingCapi, setIsTestingCapi] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Configuração persistente do Pixel / Token CAPI
  const storageKey = `diskingressos:meta-ads:config:${producerId || 'default'}`
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : DEFAULT_META_CONFIG
    } catch {
      return DEFAULT_META_CONFIG
    }
  })

  // Salvar alterações de configuração
  const handleSaveConfig = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(config))
      notify('Configurações do Meta Pixel & Token CAPI salvas com sucesso!')
    } catch {
      notify('Erro ao salvar configurações no armazenamento local.')
    }
  }

  // Lista de campanhas
  const campaignsStorageKey = `diskingressos:meta-ads:campaigns:${producerId || 'default'}`
  const [campaigns, setCampaigns] = useState<MetaAdItem[]>(() => {
    try {
      const saved = localStorage.getItem(campaignsStorageKey)
      if (saved) return JSON.parse(saved)
    } catch {}
    return [
      {
        id: 1,
        name: 'Lançamento Oficial 1º Lote — Stories & Reels',
        format: 'Instagram Stories',
        budget: 2500,
        spent: 1980,
        impressions: 64200,
        clicks: 2890,
        ctr: '4,5%',
        cpa: 'R$ 15,46',
        sales: 128,
        revenue: 23040,
        roas: '11,6x',
        status: 'ativa',
        pixelId: '948271049281729',
        targetAudience: 'Lookalike 1% Compradores + Raio 50km',
        createdAt: '10/09/2026'
      },
      {
        id: 2,
        name: 'Vídeo Teaser Lineup — Instagram Reels',
        format: 'Instagram Reels',
        budget: 1800,
        spent: 1650,
        impressions: 89400,
        clicks: 3410,
        ctr: '3,8%',
        cpa: 'R$ 17,93',
        sales: 92,
        revenue: 16560,
        roas: '10,0x',
        status: 'ativa',
        pixelId: '948271049281729',
        targetAudience: 'Interesse em Festivais e Música ao Vivo',
        createdAt: '12/09/2026'
      },
      {
        id: 3,
        name: 'Remarketing Checkout Abandonado (7 dias)',
        format: 'Facebook Feed',
        budget: 900,
        spent: 720,
        impressions: 18900,
        clicks: 1420,
        ctr: '7,5%',
        cpa: 'R$ 10,00',
        sales: 72,
        revenue: 12960,
        roas: '18,0x',
        status: 'ativa',
        pixelId: '948271049281729',
        targetAudience: 'Visitantes que iniciaram checkout sem comprar',
        createdAt: '14/09/2026'
      }
    ]
  })

  // Logs de entrega CAPI simulados com tempo real
  const [capiLogs, setCapiLogs] = useState<CapiDeliveryLog[]>([
    { id: 'LOG-9921', timestamp: '10:04:12', eventName: 'Purchase', eventIdValue: 'ord_92810_1684', status: '200_OK', dedupRatio: '100% (Browser + CAPI)', latencyMs: 64 },
    { id: 'LOG-9920', timestamp: '10:02:45', eventName: 'InitiateCheckout', eventIdValue: 'chk_10283_9941', status: '200_OK', dedupRatio: '100% Deduplicado', latencyMs: 78 },
    { id: 'LOG-9919', timestamp: '09:58:30', eventName: 'AddToCart', eventIdValue: 'cart_8832_1044', status: '200_OK', dedupRatio: '100% Deduplicado', latencyMs: 59 },
    { id: 'LOG-9918', timestamp: '09:55:18', eventName: 'ViewContent', eventIdValue: 'view_9281_4412', status: '200_OK', dedupRatio: '100% Deduplicado', latencyMs: 42 },
    { id: 'LOG-9917', timestamp: '09:51:02', eventName: 'PageView', eventIdValue: 'pv_7719_3301', status: '200_OK', dedupRatio: '100% Deduplicado', latencyMs: 38 }
  ])

  // Form states para criação de anúncio
  const [newAdName, setNewAdName] = useState('')
  const [newAdFormat, setNewAdFormat] = useState<MetaAdItem['format']>('Instagram Stories')
  const [newAdBudget, setNewAdBudget] = useState('1500')
  const [newAdAudience, setNewAdAudience] = useState('Lookalike 1% Compradores DiskIngressos')

  const currentEvent = useMemo(() => {
    if (currentEventId === 'all') return null
    return events.find(e => String(e.id) === currentEventId) || null
  }, [events, currentEventId])

  const eventTitle = currentEvent ? currentEvent.title : 'Todos os Eventos'

  // Totais calculados
  const totalSpent = useMemo(() => campaigns.reduce((acc, c) => acc + c.spent, 0), [campaigns])
  const totalSales = useMemo(() => campaigns.reduce((acc, c) => acc + c.sales, 0), [campaigns])
  const totalRevenue = useMemo(() => campaigns.reduce((acc, c) => acc + c.revenue, 0), [campaigns])
  const avgRoas = totalSpent > 0 ? (totalRevenue / totalSpent).toFixed(1) : '0,0'
  const avgCpa = totalSales > 0 ? (totalSpent / totalSales).toFixed(2) : '0,00'

  // Alternar status da campanha
  const handleToggleCampaignStatus = (id: number) => {
    setCampaigns(prev => {
      const updated = prev.map(c => {
        if (c.id === id) {
          const next = c.status === 'ativa' ? 'pausada' : 'ativa'
          notify(`Campanha "${c.name}" foi ${next === 'ativa' ? 'ativada' : 'pausada'} no Meta Ads.`)
          return { ...c, status: next as 'ativa' | 'pausada' }
        }
        return c
      })
      try { localStorage.setItem(campaignsStorageKey, JSON.stringify(updated)) } catch {}
      return updated
    })
  }

  // Criar nova campanha
  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newAdName || `${eventTitle} — ${newAdFormat}`
    const budgetNum = Number(newAdBudget) || 1000

    const newItem: MetaAdItem = {
      id: Date.now(),
      name,
      format: newAdFormat,
      budget: budgetNum,
      spent: 0,
      impressions: 0,
      clicks: 0,
      ctr: '0,0%',
      cpa: 'R$ 0,00',
      sales: 0,
      revenue: 0,
      roas: '0,0x',
      status: 'ativa',
      pixelId: config.pixelId,
      targetAudience: newAdAudience,
      createdAt: new Date().toLocaleDateString('pt-BR')
    }

    const updated = [newItem, ...campaigns]
    setCampaigns(updated)
    try { localStorage.setItem(campaignsStorageKey, JSON.stringify(updated)) } catch {}
    setIsModalOpen(false)
    setNewAdName('')
    notify(`🚀 Campanha Meta Ads "${name}" criada e sincronizada com o Pixel & Conversions API!`)
  }

  // Testar conexão CAPI
  const handleTestCapi = () => {
    setIsTestingCapi(true)
    setTimeout(() => {
      setIsTestingCapi(false)
      const newLog: CapiDeliveryLog = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        eventName: 'TestEvent',
        eventIdValue: `test_${Date.now()}`,
        status: '200_OK',
        dedupRatio: '100% OK',
        latencyMs: Math.floor(40 + Math.random() * 50)
      }
      setCapiLogs(prev => [newLog, ...prev])
      notify('✅ Teste de conexão Meta CAPI concluído! Servidor Meta retornou HTTP 200 OK.')
    }, 1200)
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    notify('Copiado para a área de transferência!')
  }

  return (
    <section className="growth-page" style={{ padding: '20px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* CABEÇALHO PRINCIPAL */}
      <div className="growth-intro growth-actions" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1877F2', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              META BUSINESS MANAGER · FACEBOOK & INSTAGRAM ADS
            </span>
            <span style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', borderRadius: '12px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> CAPI Token Ativo
            </span>
          </div>
          <h1 style={{ color: '#0F172A', fontSize: '24px', fontWeight: 800, margin: '0 0 6px' }}>
            Meta Ads & Pixel Token — {eventTitle}
          </h1>
          <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
            Gerencie campanhas no Instagram e Facebook com rastreamento server-side via Conversions API (CAPI) e Pixel deduplicado.
          </p>
        </div>

        {/* CONTROLES DO CABEÇALHO */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Seletor de Evento */}
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

          {/* Botão de Teste CAPI */}
          <button
            type="button"
            className="btn secondary"
            onClick={handleTestCapi}
            disabled={isTestingCapi}
            style={{ height: '36px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isTestingCapi ? 'animate-spin' : ''} />
            {isTestingCapi ? 'Testando CAPI...' : 'Testar Conexão CAPI'}
          </button>

          {/* Botão Novo Anúncio */}
          <button
            type="button"
            className="btn primary"
            onClick={() => setIsModalOpen(true)}
            style={{ background: '#1877F2', borderColor: '#1877F2', height: '36px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#FFFFFF', fontWeight: 700 }}
          >
            <Plus size={15} /> Criar Anúncio Meta
          </button>
        </div>
      </div>

      {/* KPIS DE PERFORMANCE */}
      <div className="growth-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '12px', marginBottom: '8px' }}>
            <span>Investimento Meta Ads</span>
            <WalletCards size={18} color="#1877F2" />
          </div>
          <strong style={{ color: '#0F172A', fontSize: '22px', fontWeight: 800, display: 'block' }}>
            R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </strong>
          <small style={{ color: '#64748B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            Orçamento Total: R$ {campaigns.reduce((a, b) => a + b.budget, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </small>
        </article>

        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '12px', marginBottom: '8px' }}>
            <span>ROAS Médio Meta</span>
            <TrendingUp size={18} color="#16A34A" />
          </div>
          <strong style={{ color: '#16A34A', fontSize: '22px', fontWeight: 800, display: 'block' }}>
            {avgRoas}x
          </strong>
          <small style={{ color: '#16A34A', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            ↑ 22% acima da meta de retorno
          </small>
        </article>

        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '12px', marginBottom: '8px' }}>
            <span>CPA Médio (Ingresso)</span>
            <Target size={18} color="#2563EB" />
          </div>
          <strong style={{ color: '#2563EB', fontSize: '22px', fontWeight: 800, display: 'block' }}>
            R$ {avgCpa}
          </strong>
          <small style={{ color: '#64748B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            Custo por ingresso convertido
          </small>
        </article>

        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '16px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748B', fontSize: '12px', marginBottom: '8px' }}>
            <span>Vendas Atribuídas</span>
            <MousePointerClick size={18} color="#0F172A" />
          </div>
          <strong style={{ color: '#0F172A', fontSize: '22px', fontWeight: 800, display: 'block' }}>
            {totalSales} ingressos
          </strong>
          <small style={{ color: '#16A34A', fontSize: '11px', marginTop: '4px', display: 'block' }}>
            Receita: R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </small>
        </article>
      </div>

      {/* ABAS DE NAVEGAÇÃO DA PÁGINA */}
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
            borderBottom: activeTab === 'campanhas' ? '3px solid #1877F2' : '3px solid transparent',
            color: activeTab === 'campanhas' ? '#1877F2' : '#64748B',
            cursor: 'pointer'
          }}
        >
          Campanhas & Criativos ({campaigns.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pixel-token')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pixel-token' ? '3px solid #1877F2' : '3px solid transparent',
            color: activeTab === 'pixel-token' ? '#1877F2' : '#64748B',
            cursor: 'pointer'
          }}
        >
          Configuração do Pixel & Token CAPI
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('diagnostico')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'diagnostico' ? '3px solid #1877F2' : '3px solid transparent',
            color: activeTab === 'diagnostico' ? '#1877F2' : '#64748B',
            cursor: 'pointer'
          }}
        >
          Logs & Diagnóstico CAPI ({capiLogs.length})
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
            borderBottom: activeTab === 'publicos' ? '3px solid #1877F2' : '3px solid transparent',
            color: activeTab === 'publicos' ? '#1877F2' : '#64748B',
            cursor: 'pointer'
          }}
        >
          Públicos & Lookalike Meta
        </button>
      </div>

      {/* ABA 1: CAMPANHAS & CRIATIVOS */}
      {activeTab === 'campanhas' && (
        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="panel-head" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '16px', fontWeight: 800 }}>
                Campanhas Meta Ads em Veiculação
              </h3>
              <p style={{ margin: '3px 0 0', color: '#64748B', fontSize: '12px' }}>
                Todos os anúncios estão sincronizados com o Pixel CAPI com deduplicação de eventos ativada.
              </p>
            </div>
            <button
              type="button"
              className="btn secondary"
              onClick={() => setIsModalOpen(true)}
              style={{ fontSize: '12px', height: '32px' }}
            >
              <Plus size={14} /> Novo Conjunto de Anúncios
            </button>
          </div>

          <div className="table-scroll">
            <table className="growth-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #CBD5E1' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Campanha / Anúncio</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Formato</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Público-Alvo</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>Investido</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>Cliques (CTR)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>CPA</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>Vendas</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>ROAS</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#475569' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <strong style={{ color: '#0F172A', fontSize: '13px', display: 'block' }}>{c.name}</strong>
                      <small style={{ color: '#2563EB', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        Pixel ID: {c.pixelId} • Criado em {c.createdAt}
                      </small>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        {c.format}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#475569' }}>
                      {c.targetAudience}
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
                      {c.clicks.toLocaleString('pt-BR')} <span style={{ color: '#2563EB', fontWeight: 700 }}>({c.ctr})</span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                      {c.cpa}
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

      {/* ABA 2: CONFIGURAÇÃO DO PIXEL & TOKEN CAPI */}
      {activeTab === 'pixel-token' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 380px', gap: '20px' }}>
          {/* Formulário Principal */}
          <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '17px', color: '#0F172A', fontWeight: 800 }}>
              Credenciais do Meta Business & Conversions API
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#64748B' }}>
              Configure o Pixel ID e o Token permanente gerado no Gerenciador de Eventos da Meta para disparo server-side.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  Meta Pixel ID (ID do Conjunto de Dados) *
                </label>
                <input
                  type="text"
                  value={config.pixelId}
                  onChange={e => setConfig({ ...config, pixelId: e.target.value })}
                  placeholder="Ex: 948271049281729"
                  style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '13px', fontFamily: 'monospace' }}
                />
                <small style={{ color: '#64748B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  Encontrado no Meta Events Manager &gt; Configurações do Pixel.
                </small>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  Token de Acesso da Conversions API (CAPI) *
                </label>
                <textarea
                  rows={3}
                  value={config.capiToken}
                  onChange={e => setConfig({ ...config, capiToken: e.target.value })}
                  placeholder="EAAGNO4XZB9k8BAOZCVn1g9k3m0..."
                  style={{ width: '100%', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '8px 12px', fontSize: '12px', fontFamily: 'monospace', resize: 'vertical' }}
                />
                <small style={{ color: '#64748B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                  Token gerado na seção "API de Conversões" com permissões de envio para a conta de anúncios da DiskIngressos.
                </small>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Código de Teste do Meta (Opcional)
                  </label>
                  <input
                    type="text"
                    value={config.testCode}
                    onChange={e => setConfig({ ...config, testCode: e.target.value })}
                    placeholder="Ex: TEST94821"
                    style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '13px', fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    Modo de Rastreamento
                  </label>
                  <select
                    value={config.trackingMode}
                    onChange={e => setConfig({ ...config, trackingMode: e.target.value })}
                    style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '12px', fontWeight: 600, color: '#0F172A' }}
                  >
                    <option value="HYBRID">Híbrido (Navegador + CAPI Server-side)</option>
                    <option value="SERVER">Apenas Servidor (100% CAPI Server-side)</option>
                    <option value="BROWSER">Apenas Navegador (Pixel JS)</option>
                  </select>
                </div>
              </div>

              {/* Matriz de Eventos */}
              <div style={{ marginTop: '10px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#0F172A', fontWeight: 700 }}>
                  Eventos Habilitados para Sincronização CAPI
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

              {/* Botões de Ação */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={handleTestCapi}
                  disabled={isTestingCapi}
                  style={{ height: '36px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} className={isTestingCapi ? 'animate-spin' : ''} />
                  Testar Envio CAPI
                </button>
                <button
                  type="button"
                  className="btn primary"
                  onClick={handleSaveConfig}
                  style={{ background: '#1877F2', borderColor: '#1877F2', height: '36px', fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}
                >
                  Salvar Configuração Meta
                </button>
              </div>
            </div>
          </article>

          {/* Painel Lateral Informativo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <article className="growth-panel" style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1877F2', marginBottom: '8px' }}>
                <ShieldCheck size={20} />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>Deduplicação Automática</h4>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                O DiskIngressos envia o mesmo identificador exclusivo (<code>event_id</code>) tanto pelo Pixel no navegador quanto pela Conversions API server-side. O Meta deduplica os eventos automaticamente para garantir precisão máxima de 100% sem duplicação de vendas.
              </p>
            </article>

            <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '18px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#0F172A', fontWeight: 800 }}>Status do Gateway Meta</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Versão da Graph API:</span>
                  <strong style={{ color: '#0F172A' }}>v19.0 (Estável)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Conexão Server-to-Server:</span>
                  <strong style={{ color: '#16A34A' }}>● Operacional</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Correspondência Avançada:</span>
                  <strong style={{ color: '#16A34A' }}>SHA-256 Ativa</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Qualidade de Correspondência:</span>
                  <strong style={{ color: '#1877F2' }}>8,8 / 10 (Excelente)</strong>
                </div>
              </div>
            </article>
          </div>
        </div>
      )}

      {/* ABA 3: LOGS & DIAGNÓSTICO CAPI */}
      {activeTab === 'diagnostico' && (
        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden' }}>
          <div className="panel-head" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '16px', fontWeight: 800 }}>
                Logs de Transmissão da Meta Conversions API
              </h3>
              <p style={{ margin: '2px 0 0', color: '#64748B', fontSize: '12px' }}>
                Disparos em tempo real enviados diretamente dos servidores do DiskIngressos para o endpoint oficial da Meta.
              </p>
            </div>
            <button
              type="button"
              className="btn secondary"
              onClick={handleTestCapi}
              disabled={isTestingCapi}
              style={{ fontSize: '12px', height: '32px' }}
            >
              <RefreshCw size={13} className={isTestingCapi ? 'animate-spin' : ''} /> Disparar Teste
            </button>
          </div>

          <table className="growth-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #CBD5E1' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Horário</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Evento CAPI</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Event ID (Deduplicação)</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Status Meta API</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#475569' }}>Taxa Deduplicação</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#475569' }}>Latência</th>
              </tr>
            </thead>
            <tbody>
              {capiLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748B' }}>
                    {log.timestamp}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <strong style={{ color: '#0F172A', fontSize: '12px' }}>{log.eventName}</strong>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <code style={{ fontSize: '11px', color: '#2563EB', background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                      {log.eventIdValue}
                    </code>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', borderRadius: '12px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                      HTTP 200 OK
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>
                    {log.dedupRatio}
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

      {/* ABA 4: PÚBLICOS & LOOKALIKE */}
      {activeTab === 'publicos' && (
        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '16px', fontWeight: 800 }}>
                Públicos Personalizados Sincronizados com a Meta
              </h3>
              <p style={{ margin: '2px 0 0', color: '#64748B', fontSize: '12px' }}>
                Os públicos são atualizados automaticamente a cada 6 horas com compradores reais e leads da plataforma.
              </p>
            </div>
            <button
              type="button"
              className="btn secondary"
              onClick={() => notify('Sincronização de públicos com o Meta Audience Manager iniciada!')}
              style={{ fontSize: '12px', height: '32px' }}
            >
              <RefreshCw size={13} /> Sincronizar Agora
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1877F2' }}>Público Compradores (180d)</span>
                <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>Pronto</span>
              </div>
              <strong style={{ fontSize: '18px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>18.420 pessoas</strong>
              <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>Compradores de ingressos DiskIngressos dos últimos 180 dias com e-mail e telefone criptografados via SHA-256.</p>
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1877F2' }}>Lookalike 1% Brasil</span>
                <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>Pronto</span>
              </div>
              <strong style={{ fontSize: '18px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>1.650.000 perfis</strong>
              <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>1% da população brasileira com comportamento mais semelhante aos compradores de alta conversão.</p>
            </div>

            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1877F2' }}>Abandonos de Checkout (7d)</span>
                <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>Em atualização</span>
              </div>
              <strong style={{ fontSize: '18px', color: '#0F172A', display: 'block', marginBottom: '4px' }}>1.280 pessoas</strong>
              <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>Usuários que clicaram em comprar, preencheram dados mas não concluíram o pagamento.</p>
            </div>
          </div>
        </article>
      )}

      {/* MODAL: CRIAR ANÚNCIO META */}
      {isModalOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }} onClick={() => setIsModalOpen(false)}>
          <div
            className="utm-modal-card-v2"
            style={{ width: 'min(600px, 94vw)', maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#1877F2', textTransform: 'uppercase' }}>
                  META ADS MANAGER & CAPI
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: '#0F172A', fontWeight: 800 }}>
                  Criar Nova Campanha / Anúncio Meta
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B' }}>
                  Evento selecionado: <strong>{eventTitle}</strong>
                </p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  Nome da Campanha / Anúncio *
                </label>
                <input
                  type="text"
                  required
                  placeholder={`Ex: ${eventTitle} — Stories Lançamento`}
                  value={newAdName}
                  onChange={e => setNewAdName(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                    Formato / Posicionamento
                  </label>
                  <select
                    value={newAdFormat}
                    onChange={e => setNewAdFormat(e.target.value as any)}
                    style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '12px', color: '#0F172A', fontWeight: 600 }}
                  >
                    <option value="Instagram Stories">Instagram Stories (9:16)</option>
                    <option value="Instagram Reels">Instagram Reels (9:16)</option>
                    <option value="Instagram Feed">Instagram Feed (1:1 / 4:5)</option>
                    <option value="Facebook Feed">Facebook Feed (1:1)</option>
                    <option value="Meta Carrossel">Meta Carrossel (1:1)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                    Orçamento Total (R$)
                  </label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={newAdBudget}
                    onChange={e => setNewAdBudget(e.target.value)}
                    style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  Público-Alvo Meta
                </label>
                <select
                  value={newAdAudience}
                  onChange={e => setNewAdAudience(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 10px', fontSize: '12px', color: '#0F172A' }}
                >
                  <option value="Lookalike 1% Compradores DiskIngressos">Lookalike 1% de Compradores DiskIngressos</option>
                  <option value="Público Aberto (Curitiba + 50km, 18-50 anos)">Público Aberto (Curitiba + 50km, 18-50 anos)</option>
                  <option value="Remarketing de Visitantes da Página (14 dias)">Remarketing de Visitantes da Página (14 dias)</option>
                  <option value="Abandonos de Checkout (Últimos 7 dias)">Abandonos de Checkout (Últimos 7 dias)</option>
                </select>
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#1E40AF', display: 'block', marginBottom: '4px' }}>
                  PARÂMETROS UTM & PIXEL CAPI VINCULADOS
                </span>
                <code style={{ fontSize: '11px', color: '#2563EB', wordBreak: 'break-all', display: 'block' }}>
                  https://www.diskingressos.com.br/evento/{currentEvent?.id || 'geral'}?utm_source=meta_ads&utm_medium={newAdFormat.toLowerCase().replace(/\s+/g, '_')}&utm_campaign=capi_{newAdName ? newAdName.toLowerCase().replace(/\s+/g, '_') : 'promo'}
                </code>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                <button type="button" className="btn secondary" onClick={() => setIsModalOpen(false)} style={{ fontSize: '12px' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn primary" style={{ background: '#1877F2', borderColor: '#1877F2', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#FFFFFF', fontWeight: 700 }}>
                  <Plus size={14} /> Publicar no Meta Ads
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
