import React, { useState, useEffect, useMemo } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  X,
  Zap,
  AlertCircle,
  Check,
  Headphones,
  Target
} from 'lucide-react'
import {
  type MonitoredCampaignDeliveryItem,
  type MonitoredChannelKey,
  type CampaignDeliveryStatus,
  MONITORED_CHANNELS_META,
  DELIVERY_STATUS_DICTIONARY
} from '../../domain/marketing/campaignDeliveryMonitoring'
import { CampaignDeliveryService } from '../../services/campaignDeliveryService'

interface CampaignDeliveryMonitoringTableProps {
  eventId?: number | null
  notify?: (msg: string) => void
  onNavigate?: (page: any) => void
  compact?: boolean
}

export const CampaignDeliveryMonitoringTable: React.FC<CampaignDeliveryMonitoringTableProps> = ({
  eventId,
  notify = () => {},
  onNavigate,
  compact = false
}) => {
  const [campaigns, setCampaigns] = useState<MonitoredCampaignDeliveryItem[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<MonitoredChannelKey | 'ALL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<CampaignDeliveryStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [selectedDetailCampaign, setSelectedDetailCampaign] = useState<MonitoredCampaignDeliveryItem | null>(null)
  const [syncingItemId, setSyncingItemId] = useState<string | null>(null)

  const reloadData = () => {
    const data = CampaignDeliveryService.getMonitoredCampaigns({
      channel: selectedChannel,
      deliveryStatus: selectedStatus,
      eventId
    })
    setCampaigns(data)
  }

  useEffect(() => {
    reloadData()
  }, [selectedChannel, selectedStatus, eventId])

  const kpis = useMemo(() => {
    return CampaignDeliveryService.getSummaryKpis(eventId)
  }, [campaigns, eventId])

  const formatBrl = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
  }

  const handleSyncAll = async () => {
    setIsSyncing(true)
    try {
      const updated = await CampaignDeliveryService.syncAllCampaigns()
      setCampaigns(updated)
      notify('Telemetria e status das campanhas atualizados com sucesso nas 4 plataformas!')
    } catch {
      notify('Erro ao sincronizar status das plataformas.')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSyncSingle = async (item: MonitoredCampaignDeliveryItem) => {
    setSyncingItemId(item.id)
    try {
      const updated = await CampaignDeliveryService.syncSingleCampaign(item.id)
      if (updated) {
        setCampaigns(prev => prev.map(c => (c.id === item.id ? updated : c)))
        if (selectedDetailCampaign && selectedDetailCampaign.id === item.id) {
          setSelectedDetailCampaign(updated)
        }
        notify(`Status de "${item.campaignName}" atualizado com sucesso!`)
      }
    } catch {
      notify('Erro ao sincronizar campanha.')
    } finally {
      setSyncingItemId(null)
    }
  }

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      if (!search.trim()) return true
      const s = search.toLowerCase()
      return (
        c.campaignName.toLowerCase().includes(s) ||
        (c.eventName && c.eventName.toLowerCase().includes(s)) ||
        (c.externalCampaignId && c.externalCampaignId.toLowerCase().includes(s))
      )
    })
  }, [campaigns, search])

  // Campanhas com alerta crítico ou atenção operacional
  const criticalItems = useMemo(() => {
    return campaigns.filter(c => c.deliveryStatus === 'ACTIVE_NO_DELIVERY' || c.deliveryStatus === 'REJECTED')
  }, [campaigns])

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #CBD5E1',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        marginBottom: '20px'
      }}
      data-testid="campaign-delivery-monitoring-panel"
    >
      {/* HEADER */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#F8FAFC'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#2563EB',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              FASE 28.13 • CONFIRMAÇÃO REAL DE STATUS
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#16A34A',
                background: '#DCFCE7',
                border: '1px solid #BBF7D0',
                padding: '2px 8px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Activity size={12} /> Telemetria 6h Ao Vivo
            </span>
          </div>
          <h3 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
            Monitoramento de Ativação & Entrega Real das Campanhas
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
            Verificação dupla: Status oficial da plataforma vs. Prova real de entrega (impressões e gasto nas últimas 6 horas).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn secondary"
            onClick={handleSyncAll}
            disabled={isSyncing}
            style={{
              fontSize: '12px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFFFFF'
            }}
            data-testid="sync-all-delivery-status-btn"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Sincronizando plataformas...' : 'Sincronizar Status Agora'}
          </button>
        </div>
      </div>

      {/* ALERT BANNER QUANDO HOUVER CAMPANHAS SEM ENTREGA OU REJEITADAS */}
      {criticalItems.length > 0 && (
        <div
          style={{
            background: '#FFFBEB',
            borderBottom: '1px solid #FDE68A',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
          data-testid="delivery-attention-banner"
        >
          <AlertTriangle size={18} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1, fontSize: '12px' }}>
            <strong style={{ color: '#92400E', display: 'block', fontSize: '13px' }}>
              Atenção Operacional: {criticalItems.length} campanha(s) requerem intervenção
            </strong>
            <p style={{ color: '#B45309', margin: '2px 0 0' }}>
              Detectamos campanhas marcadas como "Ativas" na plataforma que não registraram nenhuma impressão nas últimas 6 horas,
              ou anúncios com Ad Set pausado / criativos reprovados. Clique em "Ver Diagnóstico" para orientações de correção.
            </p>
          </div>
        </div>
      )}

      {/* 5 KPIS OPERACIONAIS DE TELEMETRIA */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '12px',
          padding: '16px 20px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0'
        }}
      >
        <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block' }}>Total Monitoradas</span>
          <strong style={{ fontSize: '18px', color: '#0F172A', display: 'block' }}>{kpis.totalCampaigns}</strong>
          <small style={{ fontSize: '10px', color: '#64748B' }}>Meta, Google, TikTok, Spotify</small>
        </div>

        <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>Entregando Ativas</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#16A34A' }} />
          </div>
          <strong style={{ fontSize: '18px', color: '#166534', display: 'block' }}>{kpis.deliveringCount}</strong>
          <small style={{ fontSize: '10px', color: '#15803D' }}>Telemetria confirmada (6h)</small>
        </div>

        <div style={{ background: '#FEF3C7', padding: '12px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#92400E', fontWeight: 700 }}>Sem Entrega (6h)</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#D97706' }} />
          </div>
          <strong style={{ fontSize: '18px', color: '#92400E', display: 'block' }}>{kpis.noDeliveryCount}</strong>
          <small style={{ fontSize: '10px', color: '#B45309' }}>Ativas mas sem veiculação</small>
        </div>

        <div style={{ background: '#EFF6FF', padding: '12px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 700 }}>Em Análise</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#2563EB' }} />
          </div>
          <strong style={{ fontSize: '18px', color: '#1E40AF', display: 'block' }}>{kpis.inReviewCount}</strong>
          <small style={{ fontSize: '10px', color: '#1D4ED8' }}>Moderação de criativos</small>
        </div>

        <div style={{ background: '#FEE2E2', padding: '12px', borderRadius: '8px', border: '1px solid #FCA5A5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#991B1B', fontWeight: 700 }}>Rejeitadas / Atenção</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#DC2626' }} />
          </div>
          <strong style={{ fontSize: '18px', color: '#991B1B', display: 'block' }}>{kpis.rejectedCount}</strong>
          <small style={{ fontSize: '10px', color: '#B91C1C' }}>Políticas ou falhas</small>
        </div>

        <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block' }}>Volume Recente (6h)</span>
          <strong style={{ fontSize: '15px', color: '#0F172A', display: 'block' }}>
            {kpis.totalImpressions6h.toLocaleString('pt-BR')} imp.
          </strong>
          <small style={{ fontSize: '10px', color: '#16A34A', fontWeight: 700 }}>
            {formatBrl(kpis.totalSpend6hCents)} investidos
          </small>
        </div>
      </div>

      {/* FILTROS & BARRA DE BUSCA */}
      <div
        style={{
          padding: '12px 20px',
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={14} style={{ color: '#64748B' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Canal:</span>
          </div>
          {(['ALL', 'META', 'GOOGLE', 'TIKTOK', 'SPOTIFY'] as const).map(ch => {
            const isSel = selectedChannel === ch
            const label = ch === 'ALL' ? 'Todos os Canais' : MONITORED_CHANNELS_META[ch].displayName
            return (
              <button
                key={ch}
                type="button"
                onClick={() => setSelectedChannel(ch)}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: isSel ? '1px solid #2563EB' : '1px solid #CBD5E1',
                  background: isSel ? '#2563EB' : '#FFFFFF',
                  color: isSel ? '#FFFFFF' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.1s'
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1, justifyContent: 'flex-end', minWidth: '260px' }}>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as any)}
            style={{
              height: '34px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              padding: '0 8px',
              fontSize: '12px',
              color: '#0F172A',
              fontWeight: 600,
              background: '#FFFFFF'
            }}
          >
            <option value="ALL">Todos os Status de Entrega</option>
            <option value="ACTIVE_DELIVERING">🟢 Entregando</option>
            <option value="ACTIVE_NO_DELIVERY">🟡 Sem Entrega (6h)</option>
            <option value="PENDING_REVIEW">🔵 Em Análise</option>
            <option value="REJECTED">🔴 Rejeitadas</option>
            <option value="PAUSED">⚪ Pausadas</option>
          </select>

          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '8px', top: '10px', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Buscar campanha..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: '34px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                paddingLeft: '28px',
                paddingRight: '8px',
                fontSize: '12px',
                background: '#FFFFFF'
              }}
            />
          </div>
        </div>
      </div>

      {/* TABELA DE CAMPANHAS MONITORADAS */}
      <div style={{ overflowX: 'auto' }}>
        <table className="growth-table" style={{ margin: 0, width: '100%' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ width: '110px', padding: '10px 14px' }}>Canal</th>
              <th style={{ padding: '10px 14px' }}>Campanha & Evento</th>
              <th style={{ width: '130px', padding: '10px 14px' }}>Status Plataforma</th>
              <th style={{ width: '150px', padding: '10px 14px' }}>Entrega Real</th>
              <th style={{ width: '120px', textAlign: 'right', padding: '10px 14px' }}>Impressões (6h)</th>
              <th style={{ width: '110px', textAlign: 'right', padding: '10px 14px' }}>Gasto (6h)</th>
              <th style={{ width: '130px', padding: '10px 14px' }}>Última Sinc.</th>
              <th style={{ width: '130px', textAlign: 'center', padding: '10px 14px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredCampaigns.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                  Nenhuma campanha encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredCampaigns.map(item => {
                const chMeta = MONITORED_CHANNELS_META[item.channel]
                const delMeta = item.deliveryMeta || DELIVERY_STATUS_DICTIONARY[item.deliveryStatus]
                const isItemSyncing = syncingItemId === item.id

                return (
                  <tr
                    key={item.id}
                    style={{
                      cursor: 'pointer',
                      background: item.deliveryStatus === 'ACTIVE_NO_DELIVERY' ? '#FFFDF5' : '#FFFFFF',
                      transition: 'background 0.1s'
                    }}
                    onClick={() => setSelectedDetailCampaign(item)}
                    data-testid={`campaign-delivery-row-${item.id}`}
                  >
                    {/* CANAL */}
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: chMeta.lightBg,
                          color: chMeta.color,
                          border: `1px solid ${chMeta.border}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {item.channel === 'SPOTIFY' && <Headphones size={11} />}
                        {item.channel === 'META' && <Target size={11} />}
                        {item.channel === 'GOOGLE' && <Search size={11} />}
                        {item.channel === 'TIKTOK' && <PlayCircle size={11} />}
                        {chMeta.displayName}
                      </span>
                    </td>

                    {/* CAMPANHA & EVENTO */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <strong style={{ color: '#0F172A', fontSize: '13px' }}>{item.campaignName}</strong>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '11px', color: '#64748B' }}>
                          <span>{item.eventName || 'Evento Geral'}</span>
                          {item.externalCampaignId && (
                            <>
                              <span>•</span>
                              <code style={{ fontSize: '10px', color: '#2563EB', background: '#EFF6FF', padding: '1px 4px', borderRadius: '3px' }}>
                                {item.externalCampaignId}
                              </code>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* STATUS PLATAFORMA */}
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: '#F1F5F9',
                          color: '#334155',
                          border: '1px solid #CBD5E1'
                        }}
                      >
                        {item.platformStatusLabelPtBr}
                      </span>
                    </td>

                    {/* STATUS DE ENTREGA REAL */}
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '999px',
                          background: delMeta.badgeBg,
                          color: delMeta.badgeColor,
                          border: `1px solid ${delMeta.badgeBorder}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        data-testid={`delivery-status-badge-${item.id}`}
                      >
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '999px',
                            background: delMeta.indicatorColor,
                            display: 'inline-block'
                          }}
                        />
                        {delMeta.shortLabel}
                      </span>
                    </td>

                    {/* IMPRESSÕES (6H) */}
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <strong
                        style={{
                          fontSize: '13px',
                          color: item.impressionsLast6h > 0 ? '#0F172A' : '#94A3B8'
                        }}
                      >
                        {item.impressionsLast6h.toLocaleString('pt-BR')}
                      </strong>
                    </td>

                    {/* GASTO (6H) */}
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <strong
                        style={{
                          fontSize: '13px',
                          color: item.spendLast6hCents > 0 ? '#16A34A' : '#94A3B8'
                        }}
                      >
                        {formatBrl(item.spendLast6hCents)}
                      </strong>
                    </td>

                    {/* ÚLTIMA SINCRONIZAÇÃO */}
                    <td style={{ padding: '10px 14px', fontSize: '11px', color: '#64748B' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} style={{ color: '#94A3B8' }} />
                        <span>{item.lastSyncAt}</span>
                      </div>
                    </td>

                    {/* AÇÕES */}
                    <td style={{ padding: '10px 14px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedDetailCampaign(item)}
                          title="Ver Diagnóstico Completo"
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #CBD5E1',
                            background: '#FFFFFF',
                            color: '#2563EB',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Eye size={12} /> Diagnóstico
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSyncSingle(item)}
                          title="Sincronizar esta campanha agora"
                          disabled={isItemSyncing}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '4px',
                            border: '1px solid #CBD5E1',
                            background: '#FFFFFF',
                            color: '#475569',
                            display: 'grid',
                            placeItems: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <RefreshCw size={12} className={isItemSyncing ? 'animate-spin' : ''} />
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

      {/* FOOTER SUMMARY */}
      <div
        style={{
          padding: '12px 20px',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#64748B',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <span>
          Exibindo <strong>{filteredCampaigns.length}</strong> de <strong>{campaigns.length}</strong> campanhas ativas monitoradas.
        </span>
        <span style={{ fontSize: '11px', color: '#475569' }}>
          💡 As métricas de telemetria das últimas 6h refletem dados coletados diretamente das APIs de marketing.
        </span>
      </div>

      {/* MODAL DE DIAGNÓSTICO COMPLETO DA CAMPANHA */}
      {selectedDetailCampaign && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 1200 }}
          onClick={() => setSelectedDetailCampaign(null)}
          data-testid="delivery-diagnostic-modal"
        >
          <div
            className="utm-modal-card-v2"
            style={{
              width: 'min(780px, 95vw)',
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '14px',
                marginBottom: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: MONITORED_CHANNELS_META[selectedDetailCampaign.channel].color,
                      textTransform: 'uppercase'
                    }}
                  >
                    {MONITORED_CHANNELS_META[selectedDetailCampaign.channel].displayName} • DIAGNÓSTICO DE ENTREGA
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: selectedDetailCampaign.deliveryMeta.badgeBg,
                      color: selectedDetailCampaign.deliveryMeta.badgeColor,
                      border: `1px solid ${selectedDetailCampaign.deliveryMeta.badgeBorder}`
                    }}
                  >
                    {selectedDetailCampaign.deliveryMeta.label}
                  </span>
                </div>
                <h3 style={{ margin: '3px 0 0', fontSize: '18px', color: '#0F172A', fontWeight: 800 }}>
                  {selectedDetailCampaign.campaignName}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                  Evento: <strong>{selectedDetailCampaign.eventName}</strong> • ID Externo:{' '}
                  <code>{selectedDetailCampaign.externalCampaignId || '—'}</code>
                </p>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setSelectedDetailCampaign(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* ALERTAS OPERACIONAIS NO TOPO DO MODAL */}
            {selectedDetailCampaign.alerts.map((al, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  background: al.level === 'CRITICAL' ? '#FEE2E2' : al.level === 'WARNING' ? '#FEF3C7' : '#EFF6FF',
                  border: `1px solid ${al.level === 'CRITICAL' ? '#FCA5A5' : al.level === 'WARNING' ? '#FDE68A' : '#BFDBFE'}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                {al.level === 'CRITICAL' && <ShieldAlert size={16} style={{ color: '#DC2626', marginTop: '2px' }} />}
                {al.level === 'WARNING' && <AlertTriangle size={16} style={{ color: '#D97706', marginTop: '2px' }} />}
                {al.level === 'INFO' && <CheckCircle2 size={16} style={{ color: '#2563EB', marginTop: '2px' }} />}
                <div style={{ fontSize: '12px' }}>
                  <strong
                    style={{
                      color: al.level === 'CRITICAL' ? '#991B1B' : al.level === 'WARNING' ? '#92400E' : '#1E40AF',
                      display: 'block'
                    }}
                  >
                    {al.message}
                  </strong>
                  {al.suggestion && (
                    <small
                      style={{
                        color: al.level === 'CRITICAL' ? '#B91C1C' : al.level === 'WARNING' ? '#B45309' : '#1D4ED8',
                        marginTop: '2px',
                        display: 'block'
                      }}
                    >
                      👉 Recomendação: {al.suggestion}
                    </small>
                  )}
                </div>
              </div>
            ))}

            {/* NÍVEIS HIERÁRQUICOS DE STATUS DA PLATAFORMA */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                1. Status Hierárquico na Plataforma ({MONITORED_CHANNELS_META[selectedDetailCampaign.channel].displayName})
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  background: '#F8FAFC',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Nível Campanha</span>
                  <strong style={{ fontSize: '13px', color: '#0F172A' }}>{selectedDetailCampaign.platformCampaignStatus}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Nível Ad Set / Grupo</span>
                  <strong
                    style={{
                      fontSize: '13px',
                      color: selectedDetailCampaign.platformAdSetStatus?.includes('PAUSE') ? '#DC2626' : '#0F172A'
                    }}
                  >
                    {selectedDetailCampaign.platformAdSetStatus || 'ACTIVE'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Nível Anúncio / Criativo</span>
                  <strong
                    style={{
                      fontSize: '13px',
                      color: selectedDetailCampaign.platformAdStatus?.includes('DISAPPROV') ? '#DC2626' : '#0F172A'
                    }}
                  >
                    {selectedDetailCampaign.platformAdStatus || 'ACTIVE'}
                  </strong>
                </div>
              </div>
            </div>

            {/* PROVA DE TELEMETRIA REAL (ÚLTIMAS 6 HORAS) */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                2. Prova de Entrega Recente (Últimas 6 Horas)
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  background: '#F8FAFC',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Impressões (6h)</span>
                  <strong style={{ fontSize: '15px', color: '#0F172A' }}>
                    {selectedDetailCampaign.impressionsLast6h.toLocaleString('pt-BR')}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Cliques (6h)</span>
                  <strong style={{ fontSize: '15px', color: '#2563EB' }}>
                    {selectedDetailCampaign.clicksLast6h.toLocaleString('pt-BR')}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Gasto (6h)</span>
                  <strong style={{ fontSize: '15px', color: '#16A34A' }}>
                    {formatBrl(selectedDetailCampaign.spendLast6hCents)}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Último Sinal</span>
                  <strong style={{ fontSize: '13px', color: '#475569' }}>
                    {selectedDetailCampaign.lastTelemetryAt}
                  </strong>
                </div>
              </div>
            </div>

            {/* HISTÓRICO ACUMULADO DA CAMPANHA */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                3. Desempenho Acumulado no Evento
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  background: '#F8FAFC',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Total Investido</span>
                  <strong style={{ fontSize: '13px', color: '#0F172A' }}>
                    {formatBrl(selectedDetailCampaign.totalSpentCents)}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Receita Gerada</span>
                  <strong style={{ fontSize: '13px', color: '#16A34A' }}>
                    {formatBrl(selectedDetailCampaign.totalRevenueCents)}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Vendas / Conversões</span>
                  <strong style={{ fontSize: '13px', color: '#2563EB' }}>
                    {selectedDetailCampaign.totalConversions}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>ROAS Geral</span>
                  <strong style={{ fontSize: '13px', color: '#16A34A' }}>
                    {selectedDetailCampaign.roas ? `${selectedDetailCampaign.roas.toFixed(2)}x` : '—'}
                  </strong>
                </div>
              </div>
            </div>

            {/* AÇÕES DO MODAL */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #E2E8F0',
                paddingTop: '14px'
              }}
            >
              <button
                type="button"
                className="btn secondary"
                onClick={() => handleSyncSingle(selectedDetailCampaign)}
                disabled={syncingItemId === selectedDetailCampaign.id}
                style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} className={syncingItemId === selectedDetailCampaign.id ? 'animate-spin' : ''} />
                Sincronizar Esta Campanha Agora
              </button>

              <button
                type="button"
                className="btn primary"
                onClick={() => setSelectedDetailCampaign(null)}
                style={{ fontSize: '12px' }}
              >
                Fechar Diagnóstico
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
