import React, { useState, useMemo } from 'react'
import { 
  Megaphone, Plus, Search, Play, Pause, 
  Trash2, ArrowUpRight, DollarSign, 
  Calendar, Check, X, Tag, Download, Filter,
  TrendingUp, BarChart3, Users, MousePointerClick,
  Sparkles, Layers3, Copy, CheckCircle2, ChevronRight,
  Sliders, MessageSquare, Mail, Share2, Target,
  ExternalLink, Eye, ArrowRight, ShieldCheck, Zap
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import type { MarketingCampaign, CampaignTemplate, CampaignChannelDetail, MarketingChannel } from '../../types/marketing'
import { mockMarketingCampaigns, mockCampaignTemplates } from '../../data/marketingData'

interface MarketingCampaignsPageProps {
  events: EventItem[]
  notify?: (msg: string) => void
}

const channelMeta: Record<MarketingChannel, { label: string; color: string; bg: string; border: string }> = {
  instagram: { label: 'Instagram', color: '#E1306C', bg: '#FDF2F8', border: '#FBCFE8' },
  facebook: { label: 'Meta Ads', color: '#1877F2', bg: '#EFF6FF', border: '#BFDBFE' },
  google: { label: 'Google Ads', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  whatsapp: { label: 'WhatsApp', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  email: { label: 'E-mail Marketing', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  tiktok: { label: 'TikTok Ads', color: '#0F172A', bg: '#F8FAFC', border: '#E2E8F0' },
  affiliate: { label: 'Afiliados / Promoters', color: '#7C3AED', bg: '#FAF5FF', border: '#E9D5FF' },
  influencer: { label: 'Influenciadores VIP', color: '#9333EA', bg: '#FAF5FF', border: '#E9D5FF' },
  crm: { label: 'CRM & Reativação', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
  coupon: { label: 'Promoção / Cupons', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  qrcode: { label: 'QR Code / Mídia Física', color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
  multichannel: { label: 'Multicanal', color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
  direct: { label: 'Direto / Orgânico', color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' },
}

export const MarketingCampaignsPage: React.FC<MarketingCampaignsPageProps> = ({ events, notify }) => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates'>('campaigns')
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(mockMarketingCampaigns)
  const [templates] = useState<CampaignTemplate[]>(mockCampaignTemplates)
  
  // Filters
  const [search, setSearch] = useState('')
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'scheduled' | 'paused'>('all')
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>('all')

  // Modals & Drawers
  const [selectedCampaignForDrilldown, setSelectedCampaignForDrilldown] = useState<MarketingCampaign | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  // Creation Form State
  const [formName, setFormName] = useState('')
  const [formObjective, setFormObjective] = useState<MarketingCampaign['objective']>('vendas')
  const [formEventId, setFormEventId] = useState<number>(events[0]?.id || 1)
  const [formBudget, setFormBudget] = useState('10000')
  const [formUtmCampaign, setFormUtmCampaign] = useState('')
  const [enabledChannels, setEnabledChannels] = useState<MarketingChannel[]>([
    'instagram', 'facebook', 'google', 'whatsapp', 'email', 'influencer'
  ])

  const formatBrl = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedUrl(text)
    setTimeout(() => setCopiedUrl(null), 2500)
    if (notify) notify('Link UTM copiado para a área de transferência!')
  }

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchSearch = 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.utmCampaign.toLowerCase().includes(search.toLowerCase()) ||
        (c.eventName && c.eventName.toLowerCase().includes(search.toLowerCase()))
      
      const matchStatus = selectedStatus === 'all' || c.status === selectedStatus
      const matchEvent = selectedEventId === 'all' || (c.eventId !== null && String(c.eventId) === selectedEventId)
      
      return matchSearch && matchStatus && matchEvent
    })
  }, [campaigns, search, selectedStatus, selectedEventId])

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
      const matchCategory = selectedTemplateCategory === 'all' || t.category === selectedTemplateCategory
      return matchSearch && matchCategory
    })
  }, [templates, search, selectedTemplateCategory])

  // Summary Metrics
  const totalBudget = useMemo(() => filteredCampaigns.reduce((acc, c) => acc + (c.budget || 0), 0), [filteredCampaigns])
  const totalSpent = useMemo(() => filteredCampaigns.reduce((acc, c) => acc + (c.spent || 0), 0), [filteredCampaigns])
  const totalRevenue = useMemo(() => filteredCampaigns.reduce((acc, c) => acc + (c.revenue || 0), 0), [filteredCampaigns])
  const totalSales = useMemo(() => filteredCampaigns.reduce((acc, c) => acc + (c.salesCount || 0), 0), [filteredCampaigns])
  const avgRoi = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0

  // Apply Template as New Campaign
  const handleUseTemplate = (template: CampaignTemplate) => {
    const selectedEvent = events.find(e => String(e.id) === selectedEventId) || events[0]
    setFormName(`${template.name} — ${selectedEvent?.title.split('•')[0].trim() || 'Evento'}`)
    setFormBudget(String(template.recommendedBudget))
    setFormEventId(selectedEvent?.id || 1)
    setFormUtmCampaign(template.name.toLowerCase().replace(/[^a-z0-9]/g, '_'))
    setEnabledChannels(template.channels.map(c => c.channel))
    setIsCreateModalOpen(true)
  }

  // Create Campaign Action
  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    const eventObj = events.find(ev => ev.id === formEventId)
    const budgetNum = Number(formBudget) || 10000
    const utmCamp = formUtmCampaign || formName.toLowerCase().replace(/[^a-z0-9]/g, '_')

    // Generate channels for this campaign
    const channelBudgetPortion = Math.round(budgetNum / (enabledChannels.length || 1))
    const generatedChannels: CampaignChannelDetail[] = enabledChannels.map((ch, idx) => {
      const meta = channelMeta[ch] || { label: ch }
      return {
        id: `ch-${Date.now()}-${idx}`,
        channel: ch,
        channelName: meta.label,
        subchannel: 'Principal',
        utmSource: ch,
        utmMedium: ch === 'google' ? 'search_cpc' : ch === 'instagram' ? 'stories_ads' : ch === 'whatsapp' ? 'direct_msg' : 'cpc',
        utmCampaign: utmCamp,
        budget: channelBudgetPortion,
        spent: 0,
        salesCount: 0,
        revenue: 0,
        roi: 0,
        cpa: 0,
        ctr: 4.5,
        status: 'active',
        trackingUrl: `https://diskingressos.com.br/evento/${eventObj?.code || eventObj?.id || 1}?utm_source=${ch}&utm_medium=${ch === 'google' ? 'search_cpc' : 'cpc'}&utm_campaign=${utmCamp}`
      }
    })

    const newCamp: MarketingCampaign = {
      id: `CMP-00${campaigns.length + 1}`,
      code: `CMP-00${campaigns.length + 1}`,
      name: formName,
      objective: formObjective,
      objectiveLabel: formObjective === 'lancamento' ? 'Lançamento & Pré-Venda' : formObjective === 'urgencia' ? 'Virada de Lote / Escassez' : formObjective === 'remarketing' ? 'Recuperação de Vendas' : 'Vendas Gerais',
      eventId: formEventId === 0 ? null : formEventId,
      eventName: formEventId === 0 ? 'Campanha Global' : (eventObj?.title || 'Evento'),
      status: 'active',
      budget: budgetNum,
      spent: 0,
      salesCount: 0,
      revenue: 0,
      roi: 0,
      cpa: 0,
      ctr: 0,
      startDate: new Date().toLocaleDateString('pt-BR'),
      utmCampaign: utmCamp,
      channels: generatedChannels
    }

    setCampaigns([newCamp, ...campaigns])
    setIsCreateModalOpen(false)
    setActiveTab('campaigns')
    if (notify) notify(`Campanha Multicanal "${newCamp.name}" criada com ${newCamp.channels.length} canais ativos!`)
  }

  const toggleStatus = (cmpId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === cmpId) {
        const nextStatus = c.status === 'active' ? 'paused' : 'active'
        if (notify) notify(`Campanha "${c.name}" ${nextStatus === 'active' ? 'reativada' : 'pausada'}.`)
        return { ...c, status: nextStatus }
      }
      return c
    }))
  }

  return (
    <div className="growth-page campaigns-multichannel-page">
      {/* Standard Header */}
      <section className="page-head">
        <div>
          <p className="eyebrow">MARKETING & GROWTH • ARQUITETURA MULTICANAL</p>
          <h1>Campanhas de Marketing</h1>
          <p className="head-subtitle">
            Gerencie campanhas multicanais integradas (Meta, Google, WhatsApp, E-mail, TikTok e Afiliados) com rastreamento UTM individual e ROI consolidado.
          </p>
        </div>
        <div className="toolbar">
          <button 
            type="button" 
            className="tool-btn" 
            onClick={() => notify ? notify('Relatório consolidado de campanhas multicanais exportado.') : null}
          >
            <Download size={16} />
            Exportar
          </button>
          <button 
            type="button" 
            className="primary-btn" 
            onClick={() => {
              setFormName('')
              setFormBudget('10000')
              setFormUtmCampaign('')
              setIsCreateModalOpen(true)
            }}
            style={{ background: '#2563EB', borderColor: '#2563EB' }}
          >
            <Plus size={16} />
            Nova Campanha Multicanal
          </button>
        </div>
      </section>

      {/* Primary KPI Strip */}
      <section className="summary-strip" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div>
          <span>Orçamento Total Planejado</span>
          <strong style={{ color: '#0F172A' }}>{formatBrl(totalBudget)}</strong>
        </div>
        <div>
          <span>Total Investido em Mídia</span>
          <strong style={{ color: '#2563EB' }}>{formatBrl(totalSpent)}</strong>
        </div>
        <div>
          <span>Receita Atribuída Total</span>
          <strong style={{ color: '#16A34A' }}>{formatBrl(totalRevenue)}</strong>
        </div>
        <div>
          <span>Vendas Atribuídas</span>
          <strong style={{ color: '#0F172A' }}>{totalSales} <small style={{ fontSize: '11px', color: '#64748B', fontWeight: 'normal' }}>pedidos</small></strong>
        </div>
        <div>
          <span>ROI Multicanal Médio</span>
          <strong style={{ color: avgRoi >= 0 ? '#16A34A' : '#DC2626' }}>
            {avgRoi >= 0 ? `+${avgRoi.toFixed(1)}%` : `${avgRoi.toFixed(1)}%`}
          </strong>
        </div>
      </section>

      {/* View Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid',
            borderColor: activeTab === 'campaigns' ? '#2563EB' : '#CBD5E1',
            background: activeTab === 'campaigns' ? '#EFF6FF' : '#FFFFFF',
            color: activeTab === 'campaigns' ? '#1D4ED8' : '#64748B',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <Layers3 size={16} />
          Campanhas Cadastradas ({campaigns.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid',
            borderColor: activeTab === 'templates' ? '#2563EB' : '#CBD5E1',
            background: activeTab === 'templates' ? '#EFF6FF' : '#FFFFFF',
            color: activeTab === 'templates' ? '#1D4ED8' : '#64748B',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <Sparkles size={16} style={{ color: '#F59E0B' }} />
          Modelos Prontos de Campanhas ({templates.length})
        </button>
      </div>

      {/* TAB 1: CAMPANHAS CADASTRADAS */}
      {activeTab === 'campaigns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filters Bar */}
          <div className="growth-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="utm-search" style={{ flex: 1, minWidth: '280px', maxWidth: '460px' }}>
                <Search size={16} style={{ color: '#94A3B8' }} />
                <input 
                  type="text" 
                  placeholder="Buscar por nome da campanha, canal ou UTM..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                />
                {search && (
                  <button 
                    type="button" 
                    onClick={() => setSearch('')} 
                    style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Event Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Evento:</span>
                <select 
                  value={selectedEventId} 
                  onChange={e => setSelectedEventId(e.target.value)}
                  style={{
                    height: '38px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    padding: '0 10px',
                    fontSize: '12px',
                    color: '#0F172A',
                    fontWeight: 600,
                    outline: 0
                  }}
                >
                  <option value="all">Todos os Eventos ({events.length})</option>
                  {events.map(ev => (
                    <option key={ev.id} value={String(ev.id)}>{ev.title}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {(['all', 'active', 'scheduled', 'paused'] as const).map(st => {
                  const labelMap = { all: 'Todas', active: 'Ativas', scheduled: 'Agendadas', paused: 'Pausadas' }
                  const active = selectedStatus === st
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStatus(st)}
                      style={{
                        height: '32px',
                        padding: '0 12px',
                        borderRadius: '999px',
                        border: '1px solid',
                        borderColor: active ? '#2563EB' : '#E2E8F0',
                        background: active ? '#EFF6FF' : '#FFFFFF',
                        color: active ? '#1D4ED8' : '#64748B',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {labelMap[st]}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Multichannel Table */}
          <div className="growth-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#0F172A', fontWeight: 700 }}>
                  Campanhas Multicanais em Execução
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748B' }}>
                  Cada campanha agrupa múltiplos canais de tráfego, links UTM dedicados e atribuição de receita.
                </p>
              </div>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                Exibindo {filteredCampaigns.length} de {campaigns.length} campanhas
              </span>
            </div>

            <div className="utm-table-wrap" style={{ border: 0, borderRadius: 0 }}>
              <table className="utm-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>Campanha / Objetivo</th>
                    <th style={{ width: '24%' }}>Canais Ativos na Campanha</th>
                    <th style={{ width: '16%' }}>Evento Alvo</th>
                    <th style={{ width: '12%', textAlign: 'right' }}>Orçamento / Gasto</th>
                    <th style={{ width: '12%', textAlign: 'right' }}>Vendas & Receita</th>
                    <th style={{ width: '8%', textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                        <Megaphone size={32} style={{ margin: '0 auto 8px', color: '#CBD5E1' }} />
                        <strong style={{ display: 'block', fontSize: '13px', color: '#334155' }}>Nenhuma campanha encontrada</strong>
                        <span style={{ fontSize: '11px' }}>Crie uma nova campanha ou ative um dos modelos prontos abaixo.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((cmp) => {
                      const spentPercent = cmp.budget > 0 ? Math.min(100, Math.round((cmp.spent / cmp.budget) * 100)) : 0

                      return (
                        <tr key={cmp.id} style={{ transition: 'background 0.15s', cursor: 'pointer' }} onClick={() => setSelectedCampaignForDrilldown(cmp)}>
                          {/* Name, Code & Objective */}
                          <td>
                            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>
                              {cmp.name}
                            </strong>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px' }}>
                              <span style={{ fontSize: '10px', color: '#64748B', fontFamily: 'monospace', background: '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>
                                {cmp.code}
                              </span>
                              <span style={{ fontSize: '10px', color: '#2563EB', fontWeight: 600 }}>
                                {cmp.objectiveLabel}
                              </span>
                              <span style={{ fontSize: '10px', color: '#64748B' }}>
                                • Início: {cmp.startDate}
                              </span>
                            </div>
                          </td>

                          {/* Active Channels Strip */}
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                              {cmp.channels.map(ch => {
                                const meta = channelMeta[ch.channel] || { label: ch.channel, color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' }
                                return (
                                  <span
                                    key={ch.id}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      background: meta.bg,
                                      border: `1px solid ${meta.border}`,
                                      color: meta.color
                                    }}
                                  >
                                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: meta.color }} />
                                    {meta.label}
                                  </span>
                                )
                              })}
                            </div>
                            <span style={{ display: 'block', fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
                              {cmp.channels.length} canais com links UTM dedicados
                            </span>
                          </td>

                          {/* Event */}
                          <td>
                            <strong style={{ fontSize: '12px', color: '#334155', display: 'block' }}>
                              {cmp.eventName}
                            </strong>
                            <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                              utm_campaign={cmp.utmCampaign}
                            </span>
                          </td>

                          {/* Budget vs Spent */}
                          <td style={{ textAlign: 'right' }}>
                            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>
                              {formatBrl(cmp.budget)}
                            </strong>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>
                              Gasto: {formatBrl(cmp.spent)} ({spentPercent}%)
                            </span>
                            <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
                              <div style={{ width: `${spentPercent}%`, height: '100%', background: spentPercent > 90 ? '#EF4444' : '#2563EB' }} />
                            </div>
                          </td>

                          {/* Sales & Revenue */}
                          <td style={{ textAlign: 'right' }}>
                            <strong style={{ fontSize: '13px', color: '#16A34A', display: 'block' }}>
                              {formatBrl(cmp.revenue)}
                            </strong>
                            <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '2px' }}>
                              <span><strong>{cmp.salesCount}</strong> vendas</span>
                              {cmp.roi > 0 && (
                                <span style={{ color: '#16A34A', fontWeight: 700 }}>ROI {cmp.roi}%</span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedCampaignForDrilldown(cmp)}
                                title="Ver Detalhamento dos Canais"
                                style={{
                                  padding: '5px 8px',
                                  border: '1px solid #CBD5E1',
                                  borderRadius: '6px',
                                  background: '#FFFFFF',
                                  color: '#2563EB',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                <Eye size={12} />
                                Canais
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleStatus(cmp.id)}
                                title={cmp.status === 'active' ? 'Pausar Campanha' : 'Ativar Campanha'}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  border: '1px solid #CBD5E1',
                                  borderRadius: '6px',
                                  background: '#FFFFFF',
                                  color: cmp.status === 'active' ? '#64748B' : '#16A34A',
                                  display: 'inline-grid',
                                  placeItems: 'center',
                                  cursor: 'pointer'
                                }}
                              >
                                {cmp.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODELOS PRONTOS DE CAMPANHAS */}
      {activeTab === 'templates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter Row for Templates */}
          <div className="growth-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#0F172A', fontWeight: 800 }}>
                Biblioteca de Modelos Prontos (Presets Multicanais)
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B' }}>
                Selecione uma estratégia pronta para ativar instantaneamente canais, orçamentos sugeridos e parâmetros UTM.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Filtrar Categoria:</span>
              <select
                value={selectedTemplateCategory}
                onChange={e => setSelectedTemplateCategory(e.target.value)}
                style={{
                  height: '36px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  background: '#FFFFFF',
                  padding: '0 10px',
                  fontSize: '12px',
                  color: '#0F172A',
                  fontWeight: 600,
                  outline: 0
                }}
              >
                <option value="all">Todas as Estratégias ({templates.length})</option>
                <option value="lancamento">Lançamento de Vendas</option>
                <option value="urgencia">Urgência & Virada de Lote</option>
                <option value="remarketing">Remarketing de Checkout</option>
                <option value="midia_paga">Mídia Paga & Google</option>
                <option value="engajamento">Engajamento & Base Ativa</option>
                <option value="influencia">Influenciadores & Afiliados</option>
              </select>
            </div>
          </div>

          {/* Template Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
            {filteredTemplates.map((tmpl) => (
              <div 
                key={tmpl.id} 
                className="growth-panel" 
                style={{ 
                  padding: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  gap: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s ease-in-out'
                }}
              >
                <div>
                  {/* Top Badge & Channels Count */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: '#FEF3C7',
                      color: '#B45309',
                      border: '1px solid #FDE68A'
                    }}>
                      {tmpl.badge}
                    </span>

                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '999px' }}>
                      {tmpl.channelsCount} canais integrados
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#0F172A', fontWeight: 800 }}>
                    {tmpl.name}
                  </h4>
                  <p style={{ margin: '4px 0 10px', fontSize: '12px', color: '#2563EB', fontWeight: 600 }}>
                    {tmpl.tagline}
                  </p>

                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '1.5' }}>
                    {tmpl.description}
                  </p>

                  {/* Channels Included */}
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#64748B', display: 'block', marginBottom: '6px' }}>
                      Canais Inclusos neste Modelo:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {tmpl.channels.map(ch => {
                        const meta = channelMeta[ch.channel] || { label: ch.channel, color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' }
                        return (
                          <span
                            key={ch.id}
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: meta.bg,
                              border: `1px solid ${meta.border}`,
                              color: meta.color
                            }}
                          >
                            {meta.label}
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  {/* Metrics preview */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '14px', background: '#F8FAFC', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Orçamento Sugerido</span>
                      <strong style={{ fontSize: '13px', color: '#0F172A' }}>{formatBrl(tmpl.recommendedBudget)}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>ROI Estimado</span>
                      <strong style={{ fontSize: '13px', color: '#16A34A' }}>{tmpl.expectedRoi}</strong>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={() => handleUseTemplate(tmpl)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #2563EB',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 2px rgba(37,99,235,0.2)'
                  }}
                >
                  <Zap size={14} />
                  Usar este Modelo no Evento
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DRILLDOWN DRAWER / MODAL: PERFORMANCE POR CANAL */}
      {selectedCampaignForDrilldown && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setSelectedCampaignForDrilldown(null)}>
          <div 
            className="utm-modal-card-v2" 
            style={{ width: 'min(900px, 95vw)', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>
                  {selectedCampaignForDrilldown.code} • DETALHAMENTO DE PERFORMANCE POR CANAL
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: '#0F172A', fontWeight: 800 }}>
                  {selectedCampaignForDrilldown.name}
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B' }}>
                  Evento: <strong>{selectedCampaignForDrilldown.eventName}</strong> • Identificador: <code>utm_campaign={selectedCampaignForDrilldown.utmCampaign}</code>
                </p>
              </div>
              <button 
                type="button" 
                className="drawer-close-btn" 
                onClick={() => setSelectedCampaignForDrilldown(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Campaign Metrics Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Orçamento Total</span>
                <strong style={{ fontSize: '14px', color: '#0F172A' }}>{formatBrl(selectedCampaignForDrilldown.budget)}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Total Gasto</span>
                <strong style={{ fontSize: '14px', color: '#2563EB' }}>{formatBrl(selectedCampaignForDrilldown.spent)}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Receita Total Atribuída</span>
                <strong style={{ fontSize: '14px', color: '#16A34A' }}>{formatBrl(selectedCampaignForDrilldown.revenue)}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>ROI Multicanal</span>
                <strong style={{ fontSize: '14px', color: '#16A34A' }}>+{selectedCampaignForDrilldown.roi}%</strong>
              </div>
            </div>

            {/* Channels Detailed Table */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', fontWeight: 700, fontSize: '12px', color: '#334155' }}>
                Desempenho Individual por Canal & Links Rastreáveis
              </div>

              <table className="utm-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Canal & Subcanal</th>
                    <th style={{ width: '30%' }}>Link Rastreável (UTM)</th>
                    <th style={{ width: '15%', textAlign: 'right' }}>Orçamento / Gasto</th>
                    <th style={{ width: '15%', textAlign: 'right' }}>Receita / ROI</th>
                    <th style={{ width: '15%', textAlign: 'right' }}>Vendas & CPA</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCampaignForDrilldown.channels.map((ch) => {
                    const meta = channelMeta[ch.channel] || { label: ch.channel, color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0' }
                    const url = ch.trackingUrl || `https://diskingressos.com.br/evento/${selectedCampaignForDrilldown.eventId}?utm_source=${ch.utmSource}&utm_medium=${ch.utmMedium}&utm_campaign=${ch.utmCampaign}`

                    return (
                      <tr key={ch.id}>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: meta.bg,
                            border: `1px solid ${meta.border}`,
                            color: meta.color
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.color }} />
                            {ch.channelName}
                          </span>
                          <span style={{ display: 'block', fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                            {ch.subchannel || 'Canal Ativo'}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="text"
                              readOnly
                              value={url}
                              style={{
                                width: '100%',
                                fontSize: '10px',
                                fontFamily: 'monospace',
                                background: '#F8FAFC',
                                border: '1px solid #CBD5E1',
                                borderRadius: '4px',
                                padding: '4px 6px',
                                color: '#1E3A8A'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => copyToClipboard(url)}
                              title="Copiar URL"
                              style={{
                                padding: '5px 8px',
                                border: '1px solid #CBD5E1',
                                borderRadius: '4px',
                                background: '#FFFFFF',
                                color: copiedUrl === url ? '#16A34A' : '#2563EB',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '10px',
                                fontWeight: 700
                              }}
                            >
                              {copiedUrl === url ? <Check size={12} /> : <Copy size={12} />}
                              {copiedUrl === url ? 'Copiado' : 'Copiar'}
                            </button>
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '12px', color: '#0F172A', display: 'block' }}>
                            {formatBrl(ch.budget)}
                          </strong>
                          <span style={{ fontSize: '10px', color: '#64748B' }}>
                            Gasto: {formatBrl(ch.spent)}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '12px', color: '#16A34A', display: 'block' }}>
                            {formatBrl(ch.revenue)}
                          </strong>
                          <span style={{ fontSize: '10px', color: '#16A34A', fontWeight: 700 }}>
                            {ch.roi > 0 ? `+${ch.roi}% ROI` : '—'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '12px', color: '#0F172A', display: 'block' }}>
                            {ch.salesCount} vendas
                          </strong>
                          <span style={{ fontSize: '10px', color: '#64748B' }}>
                            {ch.cpa > 0 ? `CPA ${formatBrl(ch.cpa)}` : '—'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                className="primary-btn"
                onClick={() => setSelectedCampaignForDrilldown(null)}
                style={{ background: '#2563EB', borderColor: '#2563EB' }}
              >
                Fechar Detalhamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / USE TEMPLATE MODAL */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setIsCreateModalOpen(false)}>
          <div 
            className="utm-modal-card-v2" 
            style={{ width: 'min(620px, 94vw)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0F172A', fontWeight: 800 }}>
                  Criar Campanha de Marketing Multicanal
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B' }}>
                  A campanha gerará links UTM individualizados para cada canal selecionado.
                </p>
              </div>
              <button 
                type="button" 
                className="drawer-close-btn" 
                onClick={() => setIsCreateModalOpen(false)}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="utm-form-field">
                <span>Nome da Campanha Multicanal *</span>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lançamento Oficial — Marcos & Belutti 18 Anos"
                  value={formName}
                  onChange={e => {
                    setFormName(e.target.value)
                    if (!formUtmCampaign) {
                      setFormUtmCampaign(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'))
                    }
                  }}
                />
              </div>

              <div className="utm-form-two-cols">
                <div className="utm-form-field">
                  <span>Objetivo da Campanha *</span>
                  <select
                    value={formObjective}
                    onChange={e => setFormObjective(e.target.value as any)}
                  >
                    <option value="lancamento">Lançamento de Vendas / Pré-Venda</option>
                    <option value="urgencia">Virada de Lote & Urgência</option>
                    <option value="remarketing">Remarketing de Checkout & Abandono</option>
                    <option value="vendas">Vendas & Conversão Direta</option>
                    <option value="reconhecimento">Branding & Alcance</option>
                    <option value="reativacao">Reativação de Base / Pós-Evento</option>
                  </select>
                </div>

                <div className="utm-form-field">
                  <span>Evento Vinculado *</span>
                  <select
                    value={formEventId}
                    onChange={e => setFormEventId(Number(e.target.value))}
                  >
                    <option value={0}>Campanha Global (Todos os Eventos)</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="utm-form-two-cols">
                <div className="utm-form-field">
                  <span>Orçamento Total Planejado (R$) *</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={formBudget}
                    onChange={e => setFormBudget(e.target.value)}
                  />
                </div>

                <div className="utm-form-field">
                  <span>Parâmetro UTM Campaign *</span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: lancamento_marcos_belutti"
                    value={formUtmCampaign}
                    onChange={e => setFormUtmCampaign(e.target.value)}
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              {/* Channels Selector (Checkboxes) */}
              <div style={{ marginTop: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Canais Ativos nesta Campanha ({enabledChannels.length} selecionados):
                </span>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {(['instagram', 'facebook', 'google', 'whatsapp', 'email', 'tiktok', 'influencer', 'affiliate'] as MarketingChannel[]).map((ch) => {
                    const meta = channelMeta[ch] || { label: ch, color: '#64748B' }
                    const isChecked = enabledChannels.includes(ch)
                    return (
                      <label
                        key={ch}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid',
                          borderColor: isChecked ? '#2563EB' : '#E2E8F0',
                          background: isChecked ? '#EFF6FF' : '#FFFFFF',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: isChecked ? 700 : 500,
                          color: isChecked ? '#1E3A8A' : '#475569'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setEnabledChannels([...enabledChannels, ch])
                            } else {
                              setEnabledChannels(enabledChannels.filter(c => c !== ch))
                            }
                          }}
                        />
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: meta.color }} />
                        {meta.label}
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Preview */}
              <div className="utm-live-preview-box" style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, color: '#1E40AF', display: 'block', marginBottom: '4px' }}>
                  Estrutura de Rastreamento que será criada:
                </span>
                <code style={{ fontSize: '11px', color: '#1E3A8A', wordBreak: 'break-all' }}>
                  {enabledChannels.length} links rastreáveis com utm_campaign={formUtmCampaign || 'campanha'} e utm_source individual por canal.
                </code>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  style={{ background: '#2563EB', borderColor: '#2563EB' }}
                >
                  <Plus size={16} />
                  Ativar Campanha Multicanal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarketingCampaignsPage
