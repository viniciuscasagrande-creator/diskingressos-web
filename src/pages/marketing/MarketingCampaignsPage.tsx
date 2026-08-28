import React, { useState, useMemo } from 'react'
import { 
  Megaphone, Plus, Search, Play, Pause, 
  Trash2, ArrowUpRight, DollarSign, 
  Calendar, Check, X, Tag, Download, Filter,
  TrendingUp, BarChart3, Users, MousePointerClick,
  Sparkles, Layers3
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import type { MarketingCampaign, MarketingChannel } from '../../types/marketing'
import { mockMarketingCampaigns } from '../../data/marketingData'

interface MarketingCampaignsPageProps {
  events: EventItem[]
  notify?: (msg: string) => void
}

const channelLabels: Record<MarketingChannel, { label: string; badgeClass: string; iconColor: string }> = {
  instagram: { label: 'Instagram Ads', badgeClass: 'badge-instagram', iconColor: '#E1306C' },
  facebook: { label: 'Meta Ads', badgeClass: 'badge-meta', iconColor: '#1877F2' },
  google: { label: 'Google Ads', badgeClass: 'badge-google', iconColor: '#4285F4' },
  whatsapp: { label: 'WhatsApp', badgeClass: 'badge-whatsapp', iconColor: '#25D366' },
  email: { label: 'E-mail Marketing', badgeClass: 'badge-email', iconColor: '#EA580C' },
  tiktok: { label: 'TikTok Ads', badgeClass: 'badge-tiktok', iconColor: '#000000' },
  affiliate: { label: 'Afiliados / Influencers', badgeClass: 'badge-affiliate', iconColor: '#7C3AED' },
  crm: { label: 'CRM / Reativação', badgeClass: 'badge-crm', iconColor: '#2563EB' },
  coupon: { label: 'Promoção / Cupom', badgeClass: 'badge-coupon', iconColor: '#D97706' },
  multichannel: { label: 'Multicanal', badgeClass: 'badge-multi', iconColor: '#0D9488' },
  direct: { label: 'Direto / Orgânico', badgeClass: 'badge-direct', iconColor: '#64748B' },
}

export const MarketingCampaignsPage: React.FC<MarketingCampaignsPageProps> = ({ events, notify }) => {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(mockMarketingCampaigns)
  const [search, setSearch] = useState('')
  const [selectedChannel, setSelectedChannel] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'scheduled' | 'paused'>('all')
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [channel, setChannel] = useState<MarketingChannel>('instagram')
  const [eventId, setEventId] = useState<number>(events[0]?.id || 1)
  const [budget, setBudget] = useState('5000')
  const [utmSource, setUtmSource] = useState('instagram')
  const [utmCampaign, setUtmCampaign] = useState('')

  const formatBrl = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      const matchSearch = 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.utmCampaign.toLowerCase().includes(search.toLowerCase()) ||
        (c.eventName && c.eventName.toLowerCase().includes(search.toLowerCase()))
      
      const matchChannel = selectedChannel === 'all' || c.channel === selectedChannel
      const matchStatus = selectedStatus === 'all' || c.status === selectedStatus
      const matchEvent = selectedEventId === 'all' || (c.eventId !== null && String(c.eventId) === selectedEventId)
      
      return matchSearch && matchChannel && matchStatus && matchEvent
    })
  }, [campaigns, search, selectedChannel, selectedStatus, selectedEventId])

  // Summary Metrics
  const totalBudget = useMemo(() => filtered.reduce((acc, c) => acc + (c.budget || 0), 0), [filtered])
  const totalSpent = useMemo(() => filtered.reduce((acc, c) => acc + (c.spent || 0), 0), [filtered])
  const totalRevenue = useMemo(() => filtered.reduce((acc, c) => acc + (c.revenue || 0), 0), [filtered])
  const totalSales = useMemo(() => filtered.reduce((acc, c) => acc + (c.salesCount || 0), 0), [filtered])
  const avgRoi = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const eventObj = events.find((ev) => ev.id === eventId)
    const newCamp: MarketingCampaign = {
      id: `CMP-00${campaigns.length + 1}`,
      name,
      channel,
      channelLabel: channelLabels[channel]?.label || channel,
      eventId: eventId === 0 ? null : eventId,
      eventName: eventId === 0 ? 'Campanha Global' : (eventObj?.title || 'Evento Geral'),
      status: 'active',
      budget: Number(budget) || 0,
      spent: 0,
      salesCount: 0,
      revenue: 0,
      roi: 0,
      ctr: 0,
      cpa: 0,
      startDate: new Date().toLocaleDateString('pt-BR'),
      utmSource: utmSource || channel,
      utmCampaign: utmCampaign || name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    }

    setCampaigns([newCamp, ...campaigns])
    setIsModalOpen(false)
    setName('')
    setUtmCampaign('')
    if (notify) notify(`Campanha "${newCamp.name}" criada com sucesso!`)
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
    <div className="growth-page campaigns-standard-view">
      {/* Top Standard Head */}
      <section className="page-head">
        <div>
          <p className="eyebrow">MARKETING & GROWTH</p>
          <h1>Campanhas de Marketing</h1>
          <p className="head-subtitle">
            Crie, monitore orçamentos, ROI, canais e atribuições de conversão por campanha.
          </p>
        </div>
        <div className="toolbar">
          <button 
            type="button" 
            className="tool-btn" 
            onClick={() => notify ? notify('Relatório de campanhas exportado com sucesso.') : null}
          >
            <Download size={16} />
            Exportar
          </button>
          <button 
            type="button" 
            className="primary-btn" 
            onClick={() => setIsModalOpen(true)}
            style={{ background: '#2563EB', borderColor: '#2563EB' }}
          >
            <Plus size={16} />
            Nova Campanha
          </button>
        </div>
      </section>

      {/* Standard Summary Strip (5 KPIs) */}
      <section className="summary-strip" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div>
          <span>Orçamento Total</span>
          <strong style={{ color: '#0F172A' }}>{formatBrl(totalBudget)}</strong>
        </div>
        <div>
          <span>Total Investido</span>
          <strong style={{ color: '#2563EB' }}>{formatBrl(totalSpent)}</strong>
        </div>
        <div>
          <span>Receita Atribuída</span>
          <strong style={{ color: '#16A34A' }}>{formatBrl(totalRevenue)}</strong>
        </div>
        <div>
          <span>Vendas Atribuídas</span>
          <strong style={{ color: '#0F172A' }}>{totalSales} <small style={{ fontSize: '11px', color: '#64748B', fontWeight: 'normal' }}>pedidos</small></strong>
        </div>
        <div>
          <span>ROI Médio</span>
          <strong style={{ color: avgRoi >= 0 ? '#16A34A' : '#DC2626' }}>
            {avgRoi >= 0 ? `+${avgRoi.toFixed(1)}%` : `${avgRoi.toFixed(1)}%`}
          </strong>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="growth-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
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

          {/* Channel Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Canal:</span>
            <select 
              value={selectedChannel} 
              onChange={e => setSelectedChannel(e.target.value)}
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
              <option value="all">Todos os Canais ({campaigns.length})</option>
              <option value="instagram">Instagram Ads</option>
              <option value="google">Google Ads</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="facebook">Meta Ads</option>
              <option value="email">E-mail Marketing</option>
              <option value="tiktok">TikTok Ads</option>
              <option value="affiliate">Afiliados / Influenciadores</option>
              <option value="crm">CRM</option>
              <option value="coupon">Promoções / Cupons</option>
              <option value="multichannel">Multicanal</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginRight: '4px' }}>Status:</span>
          {(['all', 'active', 'scheduled', 'paused'] as const).map(st => {
            const labelMap = { all: 'Todas', active: 'Ativas', scheduled: 'Agendadas', paused: 'Pausadas' }
            const count = st === 'all' ? campaigns.length : campaigns.filter(c => c.status === st).length
            const active = selectedStatus === st
            return (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                style={{
                  height: '28px',
                  padding: '0 12px',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: active ? '#2563EB' : '#E2E8F0',
                  background: active ? '#EFF6FF' : '#FFFFFF',
                  color: active ? '#1D4ED8' : '#64748B',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {labelMap[st]}
                <span style={{ 
                  background: active ? '#2563EB' : '#F1F5F9', 
                  color: active ? '#FFFFFF' : '#64748B', 
                  borderRadius: '999px', 
                  padding: '1px 6px', 
                  fontSize: '10px' 
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Campaigns Table Panel */}
      <div className="growth-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0F172A', fontWeight: 700 }}>
              Campanhas Cadastradas
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748B' }}>
              Exibindo {filtered.length} de {campaigns.length} campanhas filtradas
            </p>
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Atualizado em tempo real • Escopo Multi-canal
          </span>
        </div>

        <div className="utm-table-wrap" style={{ border: 0, borderRadius: 0 }}>
          <table className="utm-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Campanha / Identificador</th>
                <th style={{ width: '18%' }}>Canal & Parâmetros UTM</th>
                <th style={{ width: '18%' }}>Evento Vinculado</th>
                <th style={{ width: '14%', textAlign: 'right' }}>Orçamento / Gasto</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Vendas & Receita</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Status</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <Megaphone size={32} style={{ margin: '0 auto 8px', color: '#CBD5E1' }} />
                    <strong style={{ display: 'block', fontSize: '13px', color: '#334155' }}>Nenhuma campanha encontrada</strong>
                    <span style={{ fontSize: '11px' }}>Tente alterar os termos da busca ou filtros acima.</span>
                  </td>
                </tr>
              ) : (
                filtered.map((cmp) => {
                  const spentPercent = cmp.budget > 0 ? Math.min(100, Math.round((cmp.spent / cmp.budget) * 100)) : 0
                  const chInfo = channelLabels[cmp.channel] || { label: cmp.channelLabel || cmp.channel, iconColor: '#64748B' }

                  return (
                    <tr key={cmp.id} style={{ transition: 'background 0.15s' }}>
                      {/* Name & ID */}
                      <td>
                        <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>
                          {cmp.name}
                        </strong>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px' }}>
                          <span style={{ fontSize: '10px', color: '#64748B', fontFamily: 'monospace', background: '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>
                            {cmp.id}
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748B' }}>
                            Início: {cmp.startDate}
                          </span>
                        </div>
                      </td>

                      {/* Channel & UTM */}
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '999px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          color: '#1E293B'
                        }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: chInfo.iconColor }} />
                          {chInfo.label}
                        </span>
                        <code style={{ display: 'block', fontSize: '10px', color: '#2563EB', marginTop: '4px', background: '#EFF6FF', padding: '2px 5px', borderRadius: '4px', maxWidth: 'max-content' }}>
                          utm_campaign={cmp.utmCampaign}
                        </code>
                      </td>

                      {/* Event */}
                      <td>
                        <strong style={{ fontSize: '12px', color: '#334155', display: 'block' }}>
                          {cmp.eventName || 'Global / Todos os Eventos'}
                        </strong>
                        {cmp.eventId && (
                          <small style={{ fontSize: '10px', color: '#94A3B8' }}>
                            ID Evento: #{cmp.eventId}
                          </small>
                        )}
                      </td>

                      {/* Budget / Spent */}
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

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span 
                          className={`live-status-pill ${cmp.status === 'active' ? 'active' : cmp.status === 'scheduled' ? 'scheduled' : 'paused'}`}
                          style={{
                            padding: '3px 9px',
                            borderRadius: '999px',
                            fontSize: '10px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            background: cmp.status === 'active' ? '#DCFCE7' : cmp.status === 'scheduled' ? '#FEF3C7' : '#F1F5F9',
                            color: cmp.status === 'active' ? '#166534' : cmp.status === 'scheduled' ? '#B45309' : '#64748B',
                            border: `1px solid ${cmp.status === 'active' ? '#BBF7D0' : cmp.status === 'scheduled' ? '#FDE68A' : '#E2E8F0'}`
                          }}
                        >
                          {cmp.status === 'active' ? 'Ativa' : cmp.status === 'scheduled' ? 'Agendada' : 'Pausada'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => toggleStatus(cmp.id)}
                          title={cmp.status === 'active' ? 'Pausar Campanha' : 'Ativar Campanha'}
                          style={{
                            width: '30px',
                            height: '30px',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            background: '#FFFFFF',
                            color: cmp.status === 'active' ? '#64748B' : '#16A34A',
                            display: 'inline-grid',
                            placeItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          {cmp.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Standard Clean Modal: Nova Campanha */}
      {isModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setIsModalOpen(false)}>
          <div 
            className="utm-modal-card-v2" 
            style={{ width: 'min(580px, 94vw)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0F172A', fontWeight: 800 }}>
                  Criar Nova Campanha de Marketing
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B' }}>
                  Configure o canal de tráfego, parâmetros UTM e orçamento planejado.
                </p>
              </div>
              <button 
                type="button" 
                className="drawer-close-btn" 
                onClick={() => setIsModalOpen(false)}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="utm-form-field">
                <span>Nome da Campanha *</span>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lançamento Lote Promocional — Instagram"
                  value={name}
                  onChange={e => {
                    setName(e.target.value)
                    if (!utmCampaign) {
                      setUtmCampaign(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'))
                    }
                  }}
                />
              </div>

              <div className="utm-form-two-cols">
                <div className="utm-form-field">
                  <span>Canal de Divulgação *</span>
                  <select
                    value={channel}
                    onChange={e => {
                      const val = e.target.value as MarketingChannel
                      setChannel(val)
                      setUtmSource(val)
                    }}
                  >
                    <option value="instagram">Instagram Ads / Stories</option>
                    <option value="google">Google Ads (Search & Display)</option>
                    <option value="whatsapp">WhatsApp Direct / Disparos</option>
                    <option value="facebook">Meta Pixel Ads</option>
                    <option value="email">E-mail Marketing</option>
                    <option value="tiktok">TikTok Ads</option>
                    <option value="affiliate">Afiliados / Influenciadores</option>
                    <option value="crm">CRM / Reativação</option>
                    <option value="coupon">Promoção / Cupom</option>
                    <option value="multichannel">Multicanal</option>
                  </select>
                </div>

                <div className="utm-form-field">
                  <span>Evento Vinculado *</span>
                  <select
                    value={eventId}
                    onChange={e => setEventId(Number(e.target.value))}
                  >
                    <option value={0}>Campanha Global / Todos os Eventos</option>
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
                  <span>Orçamento Planejado (R$) *</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                  />
                </div>

                <div className="utm-form-field">
                  <span>Parâmetro UTM Campaign *</span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: lancamento_lote1"
                    value={utmCampaign}
                    onChange={e => setUtmCampaign(e.target.value)}
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="utm-live-preview-box" style={{ marginTop: '4px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, color: '#1E40AF', display: 'block', marginBottom: '4px' }}>
                  Prévia dos Parâmetros de Rastreamento:
                </span>
                <code style={{ fontSize: '11px', color: '#1E3A8A', wordBreak: 'break-all' }}>
                  utm_source={utmSource}&utm_medium=cpc&utm_campaign={utmCampaign || 'campanha_exemplo'}
                </code>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  style={{ background: '#2563EB', borderColor: '#2563EB' }}
                >
                  <Plus size={16} />
                  Criar e Ativar Campanha
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
