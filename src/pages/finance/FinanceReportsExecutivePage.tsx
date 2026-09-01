import React, { useState, useMemo } from 'react'
import {
  FileSpreadsheet, FileText, Download, TrendingUp, DollarSign,
  Filter, Calendar, ChevronRight, CheckCircle2, AlertCircle,
  Building2, Landmark, PieChart, BarChart3, Scale, Receipt, ArrowLeft
} from 'lucide-react'
import type { EventItem } from '../../data/events'

type Props = {
  events: EventItem[]
  producerId?: number | null
  producerName?: string
  notify?: (m: string) => void
  onBack?: () => void
}

const money = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FinanceReportsExecutivePage({ events, producerId, producerName, notify, onBack }: Props) {
  const [selectedEventId, setSelectedEventId] = useState<number | 'all'>('all')
  const [period, setPeriod] = useState<string>('30d')
  const [tab, setTab] = useState<'dre' | 'taxes' | 'statement' | 'export'>('dre')

  const flash = (m: string) => notify?.(m)

  // Mock comprehensive DRE by event
  const dreData = useMemo(() => {
    return [
      {
        eventId: events[0]?.id || 1,
        title: events[0]?.title || 'Sunset Eletrônico 2026',
        grossRevenue: 485000,
        ticketsSold: 2840,
        ticketAvgPrice: 170.77,
        gatewayFees: 19400, // ~4%
        convenienceFeeRetained: 38800, // ~8%
        splitArtist: 97000, // 20%
        splitVenue: 48500, // 10%
        operationalCosts: 62000, // Palco, segurança, som
        marketingSpend: 38450,
        netProfit: 180850,
        marginPct: 37.3
      },
      {
        eventId: events[1]?.id || 2,
        title: events[1]?.title || 'Rock Experience Curitiba',
        grossRevenue: 320000,
        ticketsSold: 1680,
        ticketAvgPrice: 190.47,
        gatewayFees: 12800,
        convenienceFeeRetained: 25600,
        splitArtist: 64000,
        splitVenue: 32000,
        operationalCosts: 45000,
        marketingSpend: 24000,
        netProfit: 116600,
        marginPct: 36.4
      },
      {
        eventId: events[2]?.id || 3,
        title: events[2]?.title || 'Festival de Verão 2026',
        grossRevenue: 240000,
        ticketsSold: 1200,
        ticketAvgPrice: 200.0,
        gatewayFees: 9600,
        convenienceFeeRetained: 19200,
        splitArtist: 48000,
        splitVenue: 24000,
        operationalCosts: 35000,
        marketingSpend: 18000,
        netProfit: 86200,
        marginPct: 35.9
      }
    ]
  }, [events])

  const filteredDre = dreData.filter(d => (selectedEventId === 'all' ? true : d.eventId === selectedEventId))

  const totals = useMemo(() => {
    return filteredDre.reduce(
      (acc, d) => {
        acc.gross += d.grossRevenue
        acc.tickets += d.ticketsSold
        acc.fees += d.gatewayFees + d.convenienceFeeRetained
        acc.splits += d.splitArtist + d.splitVenue
        acc.costs += d.operationalCosts + d.marketingSpend
        acc.profit += d.netProfit
        return acc
      },
      { gross: 0, tickets: 0, fees: 0, splits: 0, costs: 0, profit: 0 }
    )
  }, [filteredDre])

  // Tax Withholdings (ISS, IRRF, PIS/COFINS)
  const taxData = useMemo(() => {
    return [
      { code: 'ISSQN (5%)', name: 'Imposto Sobre Serviços de Qualquer Natureza', base: totals.gross * 0.12, rate: '5,00%', amount: totals.gross * 0.12 * 0.05, status: 'Recolhido pela Plataforma' },
      { code: 'IRRF (1,5%)', name: 'Imposto de Renda Retido na Fonte s/ Comissões', base: totals.fees, rate: '1,50%', amount: totals.fees * 0.015, status: 'Disponível p/ Compensação' },
      { code: 'PIS/COFINS (3,65% - Cumulativo)', name: 'Contribuições Federais sobre Faturamento', base: totals.gross, rate: '3,65%', amount: totals.gross * 0.0365, status: 'Apurado (Guia Própria)' },
      { code: 'INSS 11% s/ Cachê Artístico', name: 'Retenção Previdenciária sobre Terceiros', base: totals.splits * 0.6, rate: '11,00%', amount: totals.splits * 0.6 * 0.11, status: 'Retido no Borderô' }
    ]
  }, [totals])

  return (
    <section className="growth-page">
      {/* Back Button */}
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => (onBack ? onBack() : window.history.back())}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>
      </div>

      {/* 1. Header & Actions */}
      <div className="growth-intro" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>INTELIGÊNCIA CONTÁBIL & EXECUTIVA</p>
          <h2 style={{ color: '#0F172A', fontSize: '22px', margin: '2px 0 4px' }}>Relatórios Financeiros & DRE</h2>
          <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
            Demonstrativos de resultado, apuração de impostos e exportação executiva consolidada.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => flash('Exportando balancete financeiro em CSV para PowerBI/Excel...')}
            className="h-10 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 border border-slate-300 cursor-pointer"
          >
            <FileSpreadsheet size={15} /> CSV
          </button>
          <button
            onClick={() => flash('Gerando planilha financeira multi-abas Excel (.xlsx)...')}
            className="h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 border border-emerald-600 cursor-pointer"
          >
            <FileSpreadsheet size={15} /> Excel (.xlsx)
          </button>
          <button
            onClick={() => flash('Gerando Relatório Executivo Oficial em PDF com DRE e Assinatura...')}
            className="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 border border-blue-600 cursor-pointer"
          >
            <FileText size={15} /> PDF Executivo
          </button>
        </div>
      </div>

      {/* 2. Top 4 Financial KPIs */}
      <div className="growth-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '16px' }}>
        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '12px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Faturamento Bruto</span>
            <span style={{ padding: '6px', background: '#EFF6FF', color: '#2563EB', borderRadius: '8px' }}>
              <DollarSign size={18} />
            </span>
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', display: 'block', margin: '4px 0 2px' }}>
            {money(totals.gross)}
          </strong>
          <small style={{ color: '#64748B' }}>{totals.tickets.toLocaleString('pt-BR')} ingressos emitidos</small>
        </article>

        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '12px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Deduções & Taxas</span>
            <span style={{ padding: '6px', background: '#FEE2E2', color: '#DC2626', borderRadius: '8px' }}>
              <Receipt size={18} />
            </span>
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 900, color: '#DC2626', display: 'block', margin: '4px 0 2px' }}>
            - {money(totals.fees)}
          </strong>
          <small style={{ color: '#64748B' }}>Gateway + Taxa de Conveniência</small>
        </article>

        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '12px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Splits & Custos Operacionais</span>
            <span style={{ padding: '6px', background: '#FEF3C7', color: '#D97706', borderRadius: '8px' }}>
              <Scale size={18} />
            </span>
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 900, color: '#D97706', display: 'block', margin: '4px 0 2px' }}>
            - {money(totals.splits + totals.costs)}
          </strong>
          <small style={{ color: '#64748B' }}>Cachês, Espaço, Produção e Mídia</small>
        </article>

        <article className="growth-kpi" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '12px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Lucro Líquido do Produtor</span>
            <span style={{ padding: '6px', background: '#DCFCE7', color: '#16A34A', borderRadius: '8px' }}>
              <TrendingUp size={18} />
            </span>
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 900, color: '#16A34A', display: 'block', margin: '4px 0 2px' }}>
            {money(totals.profit)}
          </strong>
          <small style={{ color: '#16A34A', fontWeight: 700 }}>
            {totals.gross ? `${((totals.profit / totals.gross) * 100).toFixed(1)}%` : '0%'} de margem líquida
          </small>
        </article>
      </div>

      {/* 3. Filters & Tabs */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '14px 18px', borderRadius: '12px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Event Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', padding: '6px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
            <Filter size={14} color="#64748B" />
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              style={{ background: 'transparent', border: 0, fontWeight: 600, color: '#0F172A', cursor: 'pointer', outline: 'none' }}
            >
              <option value="all">Todos os eventos ({events.length})</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', padding: '4px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
            {[
              ['7d', '7 dias'],
              ['30d', '30 dias'],
              ['90d', '90 dias'],
              ['year', 'Ano 2026']
            ].map(([p, label]) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 0,
                  cursor: 'pointer',
                  background: period === p ? '#FFFFFF' : 'transparent',
                  color: period === p ? '#0F172A' : '#64748B',
                  fontWeight: period === p ? 800 : 600,
                  boxShadow: period === p ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F8FAFC', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 700 }}>
          {[
            ['dre', 'DRE por Evento'],
            ['taxes', 'Impostos & Retenções'],
            ['statement', 'Conciliação de Canais'],
            ['export', 'Central de Exportação']
          ].map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 0,
                cursor: 'pointer',
                background: tab === t ? '#2563EB' : 'transparent',
                color: tab === t ? '#FFFFFF' : '#475569',
                fontWeight: tab === t ? 800 : 600
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tab 1: DRE por Evento */}
      {tab === 'dre' && (
        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', marginTop: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>DRE — Demonstrativo do Resultado do Exercício</h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>Estrutura contábil detalhada por evento</p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: '999px' }}>
              ● Apuração Consolidada
            </span>
          </div>

          <div className="table-scroll">
            <table className="growth-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Evento</th>
                  <th style={{ padding: '12px 16px' }}>Receita Bruta</th>
                  <th style={{ padding: '12px 16px' }}>Taxas (Gateway + Conv)</th>
                  <th style={{ padding: '12px 16px' }}>Splits (Artista + Espaço)</th>
                  <th style={{ padding: '12px 16px' }}>Custos & Mídia</th>
                  <th style={{ padding: '12px 16px' }}>Lucro Líquido</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Margem</th>
                </tr>
              </thead>
              <tbody>
                {filteredDre.map(d => (
                  <tr key={d.eventId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <strong style={{ color: '#0F172A', display: 'block' }}>{d.title}</strong>
                      <small style={{ color: '#64748B', fontSize: '11px' }}>{d.ticketsSold} ingressos (Ticket Médio: {money(d.ticketAvgPrice)})</small>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0F172A' }}>{money(d.grossRevenue)}</td>
                    <td style={{ padding: '12px 16px', color: '#DC2626', fontWeight: 700 }}>- {money(d.gatewayFees + d.convenienceFeeRetained)}</td>
                    <td style={{ padding: '12px 16px', color: '#D97706', fontWeight: 700 }}>- {money(d.splitArtist + d.splitVenue)}</td>
                    <td style={{ padding: '12px 16px', color: '#64748B', fontWeight: 600 }}>- {money(d.operationalCosts + d.marketingSpend)}</td>
                    <td style={{ padding: '12px 16px', color: '#16A34A', fontWeight: 900, fontSize: '14px' }}>{money(d.netProfit)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#DCFCE7', color: '#16A34A' }}>
                        {d.marginPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {/* 5. Tab 2: Impostos & Retenções */}
      {tab === 'taxes' && (
        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', marginTop: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Apuração de Impostos & Retenções Tributárias</h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>Resumo para a contabilidade e escrituração fiscal</p>
            </div>
            <button onClick={() => flash('Exportando guia fiscal de apuração...')} className="btn secondary" style={{ fontSize: '11px', height: '32px' }}>
              <Download size={13} /> Exportar Fiscal
            </button>
          </div>

          <div className="table-scroll">
            <table className="growth-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#64748B', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Tributo / Código</th>
                  <th style={{ padding: '12px 16px' }}>Descrição Legal</th>
                  <th style={{ padding: '12px 16px' }}>Base de Cálculo</th>
                  <th style={{ padding: '12px 16px' }}>Alíquota</th>
                  <th style={{ padding: '12px 16px' }}>Valor Apurado</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Status de Recolhimento</th>
                </tr>
              </thead>
              <tbody>
                {taxData.map((t, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0F172A' }}>{t.code}</td>
                    <td style={{ padding: '12px 16px', color: '#64748B' }}>{t.name}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0F172A' }}>{money(t.base)}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2563EB' }}>{t.rate}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 900, color: '#DC2626' }}>{money(t.amount)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#F1F5F9', color: '#475569' }}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {/* 6. Tab 3: Conciliação de Canais */}
      {tab === 'statement' && (
        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', marginTop: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Conciliação de Vendas por Canal</h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>Vendas online vs PDVs físicos vs Permutas corporativas</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '6px' }}>ONLINE (WEB & APP)</span>
              <strong style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', display: 'block', margin: '8px 0 2px' }}>{money(totals.gross * 0.82)}</strong>
              <small style={{ color: '#64748B' }}>82% do volume total · Pix (58%) e Cartão de Crédito (42%)</small>
            </div>

            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '6px' }}>PDV FÍSICO / BILHETERIA</span>
              <strong style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', display: 'block', margin: '8px 0 2px' }}>{money(totals.gross * 0.14)}</strong>
              <small style={{ color: '#64748B' }}>14% do volume total · Máquinas POS DiskIngressos</small>
            </div>

            <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#9333EA', background: '#F3E8FF', padding: '2px 8px', borderRadius: '6px' }}>PERMUTAS & CORPORATIVO</span>
              <strong style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', display: 'block', margin: '8px 0 2px' }}>{money(totals.gross * 0.04)}</strong>
              <small style={{ color: '#64748B' }}>4% do volume total · Patrocinadores e Cortesias Pagas</small>
            </div>
          </div>
        </article>
      )}

      {/* 7. Tab 4: Central de Exportação */}
      {tab === 'export' && (
        <article className="growth-panel" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', marginTop: '16px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>Central de Emissão de Relatórios Executivos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '18px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <FileText size={28} color="#2563EB" style={{ marginBottom: '8px' }} />
              <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Relatório Executivo em PDF</h4>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748B' }}>
                Documento formatado com logotipo, DRE, conciliação e espaço para assinatura dos sócios e auditoria.
              </p>
              <button onClick={() => flash('Baixando PDF Executivo...')} className="btn primary" style={{ width: '100%', fontSize: '12px', height: '36px' }}>
                <Download size={14} /> Baixar PDF Oficial
              </button>
            </div>

            <div style={{ padding: '18px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <FileSpreadsheet size={28} color="#16A34A" style={{ marginBottom: '8px' }} />
              <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Planilha Excel (.xlsx) Multi-Abas</h4>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748B' }}>
                Planilha com abas de DRE, extrato detalhado por ingresso, retenções tributárias e centros de custos.
              </p>
              <button onClick={() => flash('Baixando Excel (.xlsx)...')} className="btn secondary" style={{ width: '100%', fontSize: '12px', height: '36px' }}>
                <Download size={14} /> Baixar Excel (.xlsx)
              </button>
            </div>

            <div style={{ padding: '18px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <FileSpreadsheet size={28} color="#475569" style={{ marginBottom: '8px' }} />
              <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>Arquivo CSV para BI & ERP</h4>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748B' }}>
                Base de dados bruta em formato CSV padronizado para importação direta no PowerBI e sistemas ERP.
              </p>
              <button onClick={() => flash('Baixando CSV de Integração...')} className="btn secondary" style={{ width: '100%', fontSize: '12px', height: '36px' }}>
                <Download size={14} /> Baixar CSV
              </button>
            </div>
          </div>
        </article>
      )}
    </section>
  )
}
