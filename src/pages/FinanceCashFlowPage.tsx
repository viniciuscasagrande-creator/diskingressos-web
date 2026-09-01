import { useState } from 'react'
import {
  TrendingUp, ArrowDownLeft, ArrowUpRight, Download, CalendarRange,
  CircleDollarSign, Filter, RefreshCw, CheckCircle2, ChevronRight,
  Landmark, Layers, BarChart3, ArrowLeft
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  monthlyCashFlow, financeSummary
} from '../data/finance'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FinanceCashFlowPage({ events, notify, onNavigate }: Props) {
  const [periodFilter, setPeriodFilter] = useState('6m')
  const [eventFilter, setEventFilter] = useState('all')

  const max = Math.max(...monthlyCashFlow.flatMap(i => [i.receita, i.despesa, i.repasse]))

  const exportCashFlowCSV = () => {
    const headers = ['Mes', 'Receita Bruta (R$)', 'Despesas Operacionais (R$)', 'Repasses Liquidados (R$)', 'Saldo Liquido do Mes (R$)']
    const rows = [headers.join(';')]
    monthlyCashFlow.forEach(m => {
      const net = m.receita - m.despesa - m.repasse
      rows.push([
        m.month,
        m.receita.toFixed(2).replace('.', ','),
        m.despesa.toFixed(2).replace('.', ','),
        m.repasse.toFixed(2).replace('.', ','),
        net.toFixed(2).replace('.', ',')
      ].join(';'))
    })
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fluxo_de_caixa_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify('Demonstração de Fluxo de Caixa (DFC) exportada com sucesso em CSV!')
  }

  return (
    <div className="finance-dashboard-wrapper">
      {/* Back to Dashboard bar */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => onNavigate ? onNavigate('finance-dashboard') : window.history.back()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>
      </div>

      {/* Header Section */}
      <section className="finance-header-section card-surface">
        <div className="finance-header-left">
          <span className="eyebrow">LIQUIDEZ & PLANEJAMENTO</span>
          <div className="finance-title-row">
            <h1>Fluxo de Caixa Consolidado (DFC)</h1>
            <span className="pipeline-status-badge">
              <CheckCircle2 size={13} /> Projeção Financeira Ativa
            </span>
          </div>
          <p className="page-subtitle">
            Acompanhamento histórico e projetado de receitas operacionais de bilheteria, custos de intermediação e saídas de repasses.
          </p>
        </div>

        <div className="finance-header-controls">
          <div className="finance-select-group">
            <span>Período</span>
            <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)}>
              <option value="3m">Últimos 3 Meses</option>
              <option value="6m">Últimos 6 Meses (Mar-Ago)</option>
              <option value="12m">Ano de 2026</option>
            </select>
          </div>

          <div className="finance-action-buttons">
            <button className="tool-btn" onClick={exportCashFlowCSV} title="Exportar CSV">
              <Download size={15} /> Exportar DFC
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards Strip */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <ArrowDownLeft size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Entradas no Mês (Agosto)</span>
            <strong className="kpi-value">{brl(334000.00)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">+12.1% vs Julho</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <ArrowUpRight size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Saídas & Despesas</span>
            <strong className="kpi-value">{brl(146000.00)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">Operação + Gateway</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <Landmark size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Repasses Transferidos</span>
            <strong className="kpi-value">{brl(149000.00)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">8 lotes pagos</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <CircleDollarSign size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Resultado Líquido Caixa</span>
            <strong className="kpi-value">{brl(39000.00)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag warning">Superávit</span>
            </div>
          </div>
        </article>
      </section>

      {/* Main Cash Flow Evolution Chart */}
      <section className="finance-chart-box card-surface">
        <div className="card-heading">
          <div>
            <h3>Demonstração Gráfica da Evolução de Caixa</h3>
            <p>Comparativo mês a mês entre faturamento de ingressos, custos e repasses transferidos</p>
          </div>
          <div className="chart-legend-row">
            <span className="legend-item" style={{ color: '#10B981' }}><i style={{ background: '#10B981' }} /> Receitas</span>
            <span className="legend-item" style={{ color: '#F43F5E' }}><i style={{ background: '#F43F5E' }} /> Despesas</span>
            <span className="legend-item" style={{ color: '#3B82F6' }}><i style={{ background: '#3B82F6' }} /> Repasses</span>
          </div>
        </div>

        <div className="cashflow-bars-container" style={{ height: '240px' }}>
          {monthlyCashFlow.map(item => (
            <div key={item.month} className="cashflow-col">
              <div className="cashflow-pair" style={{ gap: '8px' }}>
                <div
                  className="bar-entry"
                  style={{ height: `${Math.max(16, (item.receita / max) * 180)}px`, background: '#10B981', width: '18px' }}
                  title={`Receita (${item.month}): ${brl(item.receita)}`}
                />
                <div
                  className="bar-exit"
                  style={{ height: `${Math.max(10, (item.despesa / max) * 180)}px`, background: '#F43F5E', width: '18px' }}
                  title={`Despesa (${item.month}): ${brl(item.despesa)}`}
                />
                <div
                  className="bar-entry"
                  style={{ height: `${Math.max(10, (item.repasse / max) * 180)}px`, background: '#3B82F6', width: '18px' }}
                  title={`Repasse (${item.month}): ${brl(item.repasse)}`}
                />
              </div>
              <span className="day-label" style={{ fontWeight: 700, marginTop: '8px' }}>{item.month}/2026</span>
            </div>
          ))}
        </div>
      </section>

      {/* DFC Monthly Matrix Table */}
      <section className="finance-table-section card-surface">
        <div className="table-header-tabs">
          <div className="card-heading">
            <div>
              <h3>Demonstração do Fluxo de Caixa Mensal (DFC)</h3>
              <p>Estrutura contábil por grupos de receitas, custos e saídas operacionais</p>
            </div>
          </div>
        </div>

        <div className="lots-table-wrap">
          <table className="lots-table finance-table">
            <thead>
              <tr>
                <th>Mês de Competência</th>
                <th style={{ textAlign: 'right' }}>Receita Bruta (Vendas)</th>
                <th style={{ textAlign: 'right' }}>Despesas & Gateway</th>
                <th style={{ textAlign: 'right' }}>Repasses Liquidados</th>
                <th style={{ textAlign: 'right' }}>Resultado do Mês</th>
                <th style={{ textAlign: 'center' }}>Margem Líquida</th>
              </tr>
            </thead>
            <tbody>
              {monthlyCashFlow.map(m => {
                const net = m.receita - m.despesa - m.repasse
                const margin = ((net / m.receita) * 100).toFixed(1)
                return (
                  <tr key={m.month}>
                    <td><strong>{m.month} de 2026</strong></td>
                    <td style={{ textAlign: 'right' }}><strong style={{ color: '#10B981' }}>+ {brl(m.receita)}</strong></td>
                    <td style={{ textAlign: 'right', color: '#F43F5E' }}>- {brl(m.despesa)}</td>
                    <td style={{ textAlign: 'right', color: '#3B82F6' }}>- {brl(m.repasse)}</td>
                    <td style={{ textAlign: 'right' }}><strong style={{ color: net >= 0 ? '#10B981' : '#EF4444', fontSize: '14px' }}>{brl(net)}</strong></td>
                    <td style={{ textAlign: 'center' }}><span className="kpi-tag positive">{margin}%</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
