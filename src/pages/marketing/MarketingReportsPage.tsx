import React, { useState, useMemo } from 'react'
import {
  FileSpreadsheet, FileText, Download, TrendingUp, WalletCards, BarChart3,
  MousePointerClick, Filter, Calendar, Layers, Split, Clock, Users,
  MapPin, Smartphone, Monitor, CheckCircle2, ArrowUpRight, ArrowDownRight,
  Sparkles, DollarSign, Percent, ShieldCheck, PieChart, Send, Check
} from 'lucide-react'
import type { EventItem } from '../../data/events'

interface Props {
  events: EventItem[]
  event?: EventItem
  producerId: number | null
  producerName?: string
  notify: (msg: string) => void
}

type AttributionModel = 'last_touch' | 'first_touch' | 'linear' | 'time_decay' | 'u_shaped'

export default function MarketingReportsPage({ events, event, producerId, producerName, notify }: Props) {
  const [selectedEventId, setSelectedEventId] = useState<number | 'all'>('all')
  const [period, setPeriod] = useState<'7d' | '14d' | '30d' | '90d' | 'year'>('30d')
  const [activeTab, setActiveTab] = useState<'atribuicao' | 'dre_marketing' | 'jornada_cohort' | 'geografia_horarios' | 'exportador'>('atribuicao')
  const [attributionModel, setAttributionModel] = useState<AttributionModel>('last_touch')
  const [pdfGenerating, setPdfGenerating] = useState(false)

  // Attribution comparison data
  const attributionData = useMemo(() => {
    return [
      {
        channel: 'Meta Ads (Instagram & Facebook)',
        firstTouch: { pct: 42, revenue: 173376, orders: 1240 },
        lastTouch: { pct: 28, revenue: 115584, orders: 825 },
        linear: { pct: 34, revenue: 140352, orders: 1003 },
        timeDecay: { pct: 30, revenue: 123840, orders: 885 },
        uShaped: { pct: 38, revenue: 156864, orders: 1120 },
        role: 'Principal canal de descoberta e topo de funil'
      },
      {
        channel: 'WhatsApp Marketing & Resgate',
        firstTouch: { pct: 8, revenue: 33024, orders: 236 },
        lastTouch: { pct: 32, revenue: 132096, orders: 943 },
        linear: { pct: 22, revenue: 90816, orders: 649 },
        timeDecay: { pct: 29, revenue: 119712, orders: 855 },
        uShaped: { pct: 25, revenue: 103200, orders: 737 },
        role: 'Canal de fechamento definitivo e maior conversão de checkout'
      },
      {
        channel: 'Google Ads (Pesquisa & YouTube)',
        firstTouch: { pct: 22, revenue: 90816, orders: 649 },
        lastTouch: { pct: 18, revenue: 74304, orders: 531 },
        linear: { pct: 20, revenue: 82560, orders: 590 },
        timeDecay: { pct: 19, revenue: 78432, orders: 560 },
        uShaped: { pct: 21, revenue: 86688, orders: 619 },
        role: 'Captura de intenção alta de compra e busca direta'
      },
      {
        channel: 'E-mail Marketing & Newsletter',
        firstTouch: { pct: 6, revenue: 24768, orders: 177 },
        lastTouch: { pct: 12, revenue: 49536, orders: 354 },
        linear: { pct: 10, revenue: 41280, orders: 295 },
        timeDecay: { pct: 11, revenue: 45408, orders: 324 },
        uShaped: { pct: 9, revenue: 37152, orders: 265 },
        role: 'Nutrição de base própria com custo quase zero'
      },
      {
        channel: 'TikTok Ads (Vídeo Viral)',
        firstTouch: { pct: 14, revenue: 57792, orders: 413 },
        lastTouch: { pct: 4, revenue: 16512, orders: 118 },
        linear: { pct: 8, revenue: 33024, orders: 236 },
        timeDecay: { pct: 5, revenue: 20640, orders: 147 },
        uShaped: { pct: 10, revenue: 41280, orders: 295 },
        role: 'Impacto visual e alcance de público jovem'
      },
      {
        channel: 'Influenciadores & Afiliados',
        firstTouch: { pct: 8, revenue: 33024, orders: 236 },
        lastTouch: { pct: 6, revenue: 24768, orders: 177 },
        linear: { pct: 6, revenue: 24768, orders: 177 },
        timeDecay: { pct: 6, revenue: 24768, orders: 177 },
        uShaped: { pct: 7, revenue: 28896, orders: 206 },
        role: 'Autoridade e recomendação de embaixadores da marca'
      }
    ]
  }, [])

  // DRE Financial Breakdown
  const dreFinancial = useMemo(() => {
    const grossRevenue = 412800
    const discounts = 16500
    const netTicketsRevenue = grossRevenue - discounts

    const paidMedia = 24800
    const wppApiCost = 1450
    const smtpCost = 280
    const influencerCommissions = 3920
    const affiliateCommissions = 2400
    const toolsAndTracking = 650

    const totalMarketingCost = paidMedia + wppApiCost + smtpCost + influencerCommissions + affiliateCommissions + toolsAndTracking
    const marketingNetMargin = netTicketsRevenue - totalMarketingCost
    const marginPct = (marketingNetMargin / netTicketsRevenue) * 100
    const mer = grossRevenue / totalMarketingCost

    return {
      grossRevenue,
      discounts,
      netTicketsRevenue,
      paidMedia,
      wppApiCost,
      smtpCost,
      influencerCommissions,
      affiliateCommissions,
      toolsAndTracking,
      totalMarketingCost,
      marketingNetMargin,
      marginPct,
      mer
    }
  }, [])

  const formatMoney = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleGeneratePdf = () => {
    setPdfGenerating(true)
    notify('Gerando Relatório Executivo em PDF com gráficos e sumário...')
    setTimeout(() => {
      setPdfGenerating(false)
      notify('✅ Relatório Executivo em PDF gerado com sucesso! Iniciando download...')
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Context Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Relatórios & Inteligência de Marketing</h1>
              <p className="text-sm text-slate-500">
                Modelos de atribuição multi-toque, DRE de marketing, jornada do comprador e exportação executiva.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Event Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent border-0 font-medium text-slate-700 focus:ring-0 cursor-pointer"
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
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => setPeriod('7d')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${period === '7d' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'hover:text-slate-900'}`}
            >
              7d
            </button>
            <button
              onClick={() => setPeriod('30d')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${period === '30d' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'hover:text-slate-900'}`}
            >
              30d
            </button>
            <button
              onClick={() => setPeriod('90d')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${period === '90d' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'hover:text-slate-900'}`}
            >
              90d
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${period === 'year' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'hover:text-slate-900'}`}
            >
              2026
            </button>
          </div>

          {/* Export Actions */}
          <button
            onClick={handleGeneratePdf}
            disabled={pdfGenerating}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" /> {pdfGenerating ? 'Gerando...' : 'PDF Executivo'}
          </button>
        </div>
      </div>

      {/* 2. Top Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Receita Atribuída */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Receita Total Atribuída</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{formatMoney(dreFinancial.grossRevenue)}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +28.4%
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            2.940 ingressos convertidos no período
          </p>
        </div>

        {/* KPI 2: Investimento Total */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Investimento em Marketing</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <WalletCards className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{formatMoney(dreFinancial.totalMarketingCost)}</span>
            <span className="text-xs font-semibold text-slate-500">Mídia + Envios</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Mídia paga, disparos API e comissões integradas
          </p>
        </div>

        {/* KPI 3: MER Geral */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Índice MER (Eficiência)</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600">{dreFinancial.mer.toFixed(2)}x</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
              Excelente
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            R$ {dreFinancial.mer.toFixed(2)} retornados para cada R$ 1,00 investido
          </p>
        </div>

        {/* KPI 4: Margem Líquida */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Margem Líquida do Mkt</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{formatMoney(dreFinancial.marketingNetMargin)}</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {dreFinancial.marginPct.toFixed(1)}%
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Lucro líquido gerado após dedução de todos os custos de marketing
          </p>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('atribuicao')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'atribuicao'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Split className="w-4 h-4" /> Modelos de Atribuição Multi-Toque
          </button>
          <button
            onClick={() => setActiveTab('dre_marketing')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dre_marketing'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> DRE de Marketing & MER
          </button>
          <button
            onClick={() => setActiveTab('jornada_cohort')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'jornada_cohort'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" /> Jornada de Compra & LTV
          </button>
          <button
            onClick={() => setActiveTab('geografia_horarios')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'geografia_horarios'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4" /> Geografia & Heatmap de Vendas
          </button>
          <button
            onClick={() => setActiveTab('exportador')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'exportador'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Download className="w-4 h-4" /> Central de Exportações
          </button>
        </nav>
      </div>

      {/* 4. Tab 1: Modelos de Atribuição Multi-Toque */}
      {activeTab === 'atribuicao' && (
        <div className="space-y-5">
          {/* Model Selector Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Selecione o Modelo de Atribuição</h3>
                <p className="text-xs text-slate-500">
                  Compare como cada canal contribui para a descoberta (topo), consideração (meio) e fechamento (fundo de funil).
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Deduplicação CAPI Ativa
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              {[
                { id: 'last_touch', label: 'Último Toque (Last)', desc: '100% de crédito para quem fechou o pedido' },
                { id: 'first_touch', label: 'Primeiro Toque (First)', desc: '100% de crédito para quem atraiu o lead' },
                { id: 'linear', label: 'Linear Uniforme', desc: 'Crédito igual entre todos os pontos de contato' },
                { id: 'time_decay', label: 'Declínio Temporal', desc: 'Mais peso para toques próximos da compra' },
                { id: 'u_shaped', label: 'Baseado em Posição (U)', desc: '40% Descoberta, 40% Fechamento, 20% Meio' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setAttributionModel(m.id as AttributionModel)}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    attributionModel === m.id
                      ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 text-slate-900'
                      : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-xs">{m.label}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Attribution Comparison Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Distribuição de Receita por Canal no Modelo Selecionado</h4>
              <span className="text-xs text-slate-500">Base: <strong>R$ 412.800,00</strong></span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Canal de Aquisição</th>
                    <th className="px-4 py-3">Função na Jornada</th>
                    <th className="px-4 py-3 text-right">Participação (%)</th>
                    <th className="px-4 py-3 text-right">Receita Atribuída</th>
                    <th className="px-4 py-3 text-right">Pedidos / Vendas</th>
                    <th className="px-4 py-3">Barra Visual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {attributionData.map(item => {
                    const current =
                      attributionModel === 'last_touch'
                        ? item.lastTouch
                        : attributionModel === 'first_touch'
                        ? item.firstTouch
                        : attributionModel === 'linear'
                        ? item.linear
                        : attributionModel === 'time_decay'
                        ? item.timeDecay
                        : item.uShaped

                    return (
                      <tr key={item.channel} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900">{item.channel}</td>
                        <td className="px-4 py-3.5 text-slate-500 text-[11px]">{item.role}</td>
                        <td className="px-4 py-3.5 text-right font-black text-slate-900">{current.pct}%</td>
                        <td className="px-4 py-3.5 text-right font-bold text-emerald-600">{formatMoney(current.revenue)}</td>
                        <td className="px-4 py-3.5 text-right font-medium text-slate-700">{current.orders.toLocaleString('pt-BR')}</td>
                        <td className="px-4 py-3.5 w-48">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${current.pct}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Attribution Executive Insight Alert */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <strong className="text-blue-900 block font-bold">Insight Estratégico de Atribuição:</strong>
              <p>
                O <strong>Meta Ads</strong> é responsável por <strong>42% do primeiro contato</strong> com os fãs do evento (descoberta), enquanto o <strong>WhatsApp</strong> é responsável por <strong>32% do fechamento da compra</strong> (último clique). Cortar investimento em Meta Ads reduziria drasticamente as conversões finais do WhatsApp nos próximos dias.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: DRE de Marketing & MER */}
      {activeTab === 'dre_marketing' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Demonstrativo de Resultado de Marketing (DRE de Aquisição)</h3>
                <p className="text-xs text-slate-500">Balanço detalhado de receita, custos operacionais e margem de contribuição líquida.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                MER: {dreFinancial.mer.toFixed(2)}x
              </span>
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Linha Financeira</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3 text-right">Valor (R$)</th>
                  <th className="px-4 py-3 text-right">% Receita Bruta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-slate-50/60 font-bold text-slate-900">
                  <td className="px-5 py-3">(+) Receita Bruta de Ingressos</td>
                  <td className="px-4 py-3">Vendas Totais</td>
                  <td className="px-4 py-3 text-right text-emerald-600">{formatMoney(dreFinancial.grossRevenue)}</td>
                  <td className="px-4 py-3 text-right">100,0%</td>
                </tr>
                <tr className="text-slate-500">
                  <td className="px-5 py-2.5 pl-8">(-) Descontos Promocionais & Cupons VIP</td>
                  <td className="px-4 py-2.5">Deduções Comerciais</td>
                  <td className="px-4 py-2.5 text-right text-red-600">- {formatMoney(dreFinancial.discounts)}</td>
                  <td className="px-4 py-2.5 text-right">4,0%</td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900 border-t border-b border-slate-200">
                  <td className="px-5 py-3">(=) Receita Líquida de Ingressos</td>
                  <td className="px-4 py-3">Receita Efetiva</td>
                  <td className="px-4 py-3 text-right">{formatMoney(dreFinancial.netTicketsRevenue)}</td>
                  <td className="px-4 py-3 text-right">96,0%</td>
                </tr>

                <tr className="text-slate-600">
                  <td className="px-5 py-2.5 pl-8">(-) Investimento em Mídia Paga (Meta, Google, TikTok)</td>
                  <td className="px-4 py-2.5">Tráfego Pago</td>
                  <td className="px-4 py-2.5 text-right text-red-600">- {formatMoney(dreFinancial.paidMedia)}</td>
                  <td className="px-4 py-2.5 text-right">6,0%</td>
                </tr>
                <tr className="text-slate-600">
                  <td className="px-5 py-2.5 pl-8">(-) Custos de Disparo WhatsApp Cloud API</td>
                  <td className="px-4 py-2.5">Comunicação Direta</td>
                  <td className="px-4 py-2.5 text-right text-red-600">- {formatMoney(dreFinancial.wppApiCost)}</td>
                  <td className="px-4 py-2.5 text-right">0,35%</td>
                </tr>
                <tr className="text-slate-600">
                  <td className="px-5 py-2.5 pl-8">(-) Servidor SMTP Dedicado (Amazon SES)</td>
                  <td className="px-4 py-2.5">E-mail Marketing</td>
                  <td className="px-4 py-2.5 text-right text-red-600">- {formatMoney(dreFinancial.smtpCost)}</td>
                  <td className="px-4 py-2.5 text-right">0,07%</td>
                </tr>
                <tr className="text-slate-600">
                  <td className="px-5 py-2.5 pl-8">(-) Comissões de Influenciadores</td>
                  <td className="px-4 py-2.5">Parcerias</td>
                  <td className="px-4 py-2.5 text-right text-red-600">- {formatMoney(dreFinancial.influencerCommissions)}</td>
                  <td className="px-4 py-2.5 text-right">0,95%</td>
                </tr>
                <tr className="text-slate-600">
                  <td className="px-5 py-2.5 pl-8">(-) Comissões de Afiliados & Promoters</td>
                  <td className="px-4 py-2.5">Vendas Indiretas</td>
                  <td className="px-4 py-2.5 text-right text-red-600">- {formatMoney(dreFinancial.affiliateCommissions)}</td>
                  <td className="px-4 py-2.5 text-right">0,58%</td>
                </tr>
                <tr className="text-slate-600">
                  <td className="px-5 py-2.5 pl-8">(-) Ferramentas de Tracking & Servidor CAPI</td>
                  <td className="px-4 py-2.5">Infraestrutura</td>
                  <td className="px-4 py-2.5 text-right text-red-600">- {formatMoney(dreFinancial.toolsAndTracking)}</td>
                  <td className="px-4 py-2.5 text-right">0,16%</td>
                </tr>

                <tr className="bg-emerald-50/70 font-black text-slate-900 text-sm border-t-2 border-emerald-300">
                  <td className="px-5 py-4">(=) MARGEM DE CONTRIBUIÇÃO LÍQUIDA DO MARKETING</td>
                  <td className="px-4 py-4 text-emerald-800">Resultado Líquido</td>
                  <td className="px-4 py-4 text-right text-emerald-700">{formatMoney(dreFinancial.marketingNetMargin)}</td>
                  <td className="px-4 py-4 text-right text-emerald-800">{dreFinancial.marginPct.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Jornada & Cohort */}
      {activeTab === 'jornada_cohort' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Time to purchase */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Tempo da Decisão de Compra (Time-to-Convert)</h3>
              <p className="text-xs text-slate-500">Intervalo de tempo entre o 1º clique do fã e a confirmação do pagamento.</p>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { label: 'Menos de 1 hora (Impulso Imediato)', pct: 24, count: '705 ingressos', color: 'bg-emerald-600' },
                { label: 'Entre 1 e 24 horas (Decisão Rápida)', pct: 44, count: '1.294 ingressos', color: 'bg-blue-600' },
                { label: 'Entre 2 e 7 dias (Pesquisa / Amigos)', pct: 22, count: '646 ingressos', color: 'bg-purple-600' },
                { label: 'Mais de 7 dias (Acompanhamento / Virada)', pct: 10, count: '295 ingressos', color: 'bg-amber-600' }
              ].map(item => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="text-slate-900">{item.pct}% <span className="text-slate-400 font-normal">({item.count})</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-Sell & Cohort */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Fidelidade & Recompra Cruzada (LTV)</h3>
              <p className="text-xs text-slate-500">Comportamento de recompra de fãs entre eventos da mesma produtora.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Ticket Médio Geral</span>
                <strong className="text-lg font-black text-slate-900">R$ 140,40</strong>
                <span className="text-[10px] text-emerald-600 block mt-0.5">↑ 12.8% vs 2025</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Taxa de Clientes Fiéis</span>
                <strong className="text-lg font-black text-blue-600">38,4%</strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">Compraram 2+ eventos</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Média de Ingressos/Pedido</span>
                <strong className="text-lg font-black text-slate-900">2,34 un.</strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">Compras em grupo</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block">Pontos de Contato Médio</span>
                <strong className="text-lg font-black text-purple-600">3,4 toques</strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">Até a compra final</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Tab 4: Geografia & Heatmap */}
      {activeTab === 'geografia_horarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Geography (Left) */}
          <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Origem Geográfica das Vendas (Top Cidades)</h3>
            <div className="space-y-2.5 text-xs">
              {[
                { city: 'Curitiba / PR', share: '54%', revenue: 'R$ 222.912,00', flag: 'PR' },
                { city: 'Londrina / PR', share: '14%', revenue: 'R$ 57.792,00', flag: 'PR' },
                { city: 'Florianópolis / SC', share: '12%', revenue: 'R$ 49.536,00', flag: 'SC' },
                { city: 'Maringá / PR', share: '9%', revenue: 'R$ 37.152,00', flag: 'PR' },
                { city: 'São Paulo / SP', share: '6%', revenue: 'R$ 24.768,00', flag: 'SP' },
                { city: 'Outras Regiões', share: '5%', revenue: 'R$ 20.640,00', flag: 'BR' }
              ].map(c => (
                <div key={c.city} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px]">
                      {c.flag}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{c.city}</div>
                      <div className="text-[10px] text-slate-400">{c.share} do total</div>
                    </div>
                  </div>
                  <strong className="text-slate-900 font-bold">{c.revenue}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap of Purchase Hours (Right) */}
          <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Heatmap de Horários Quentes de Compra</h3>
            <p className="text-xs text-slate-500">
              Concentração de pedidos por dia da semana e faixa horária para otimização de disparos.
            </p>

            <div className="space-y-2 text-xs">
              {[
                { day: 'Sexta-feira', peak: '11:00 às 14:00 & 19:00 às 22:00', heat: '🔥 Extremo (32% das vendas)' },
                { day: 'Quinta-feira', peak: '12:00 às 14:00 & 20:00 às 23:00', heat: '🔥 Alto (24% das vendas)' },
                { day: 'Sábado', peak: '14:00 às 19:00', heat: '⚡ Médio-Alto (18% das vendas)' },
                { day: 'Terça-feira', peak: '19:00 às 22:00 (Viradas de Lote)', heat: '⚡ Médio (14% das vendas)' },
                { day: 'Demais dias', peak: 'Horários comerciais dispersos', heat: 'Normal (12% das vendas)' }
              ].map(h => (
                <div key={h.day} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{h.day}</span>
                    <span className="text-amber-600">{h.heat}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">Pico: {h.peak}</p>
                </div>
              ))}
            </div>

            {/* Devices */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <Smartphone className="w-4 h-4 text-blue-600" /> Mobile iOS / Android: <strong>93%</strong>
              </span>
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <Monitor className="w-4 h-4 text-slate-500" /> Desktop Web: <strong>7%</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 8. Tab 5: Central de Exportações */}
      {activeTab === 'exportador' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: PDF */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mt-3">Relatório Executivo em PDF</h4>
              <p className="text-xs text-slate-500 mt-1">
                Documento visual diagramado com gráficos de pizza, barras de canal, DRE e sumário executivo para prestação de contas com parceiros e artistas.
              </p>
            </div>
            <button
              onClick={handleGeneratePdf}
              disabled={pdfGenerating}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" /> {pdfGenerating ? 'Gerando...' : 'Baixar PDF Executivo'}
            </button>
          </div>

          {/* Card 2: Excel */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mt-3">Planilha Completa em Excel (.xlsx)</h4>
              <p className="text-xs text-slate-500 mt-1">
                Arquivo tabular multi-abas contendo dados brutos de Campanhas, UTMs, Cupons, Transações e Custos Operacionais.
              </p>
            </div>
            <button
              onClick={() => notify('Iniciando download da planilha Excel (.xlsx)...')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" /> Baixar Planilha Excel
            </button>
          </div>

          {/* Card 3: CSV */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="p-3 bg-slate-100 text-slate-700 rounded-xl w-fit">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base mt-3">Exportação de Dados Brutos (CSV)</h4>
              <p className="text-xs text-slate-500 mt-1">
                Exportação de dados no padrão CSV para importação em PowerBI, Google Looker Studio ou ferramentas internas de BI.
              </p>
            </div>
            <button
              onClick={() => notify('Iniciando download dos dados em CSV...')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" /> Baixar Dados CSV
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
