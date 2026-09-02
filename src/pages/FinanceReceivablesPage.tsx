import { useState, useMemo } from 'react'
import { consumeFinanceDrilldown } from '../utils/financeDrilldown'
import {
  ArrowDownLeft, CreditCard, Search, Filter, Download, Zap, Eye,
  CheckCircle2, Clock, Calendar, AlertCircle, X, ShieldCheck, ArrowLeft
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  receivablesSeed, financeSummary,
  type ReceivableItem
} from '../data/finance'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FinanceReceivablesPage({ events, notify, onNavigate }: Props) {
  const [drilldown] = useState(() => consumeFinanceDrilldown('finance-receivables'))
  const [search, setSearch] = useState(drilldown?.eventName || '')
  const [statusFilter, setStatusFilter] = useState(drilldown?.status || 'all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [showAdvanceModal, setShowAdvanceModal] = useState(false)
  const [advanceAmount, setAdvanceAmount] = useState(50000)

  const advanceFee = advanceAmount * 0.035
  const advanceNet = advanceAmount - advanceFee

  const filtered = useMemo(() => {
    return receivablesSeed.filter(r => {
      const q = search.toLowerCase()
      const matchesSearch =
        r.title.toLowerCase().includes(q) ||
        r.event.toLowerCase().includes(q) ||
        r.client.toLowerCase().includes(q)

      const normalizedStatus = r.status.toLowerCase()
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'open' ? normalizedStatus !== 'liquidado' : normalizedStatus === statusFilter.toLowerCase())
      const matchesMethod = methodFilter === 'all' || r.method.toLowerCase() === methodFilter.toLowerCase()

      return matchesSearch && matchesStatus && matchesMethod
    })
  }, [search, statusFilter, methodFilter])

  const totalReceivables = financeSummary.receivable
  const totalIn30Days = 185340.00
  const totalIn60Days = 171120.90
  const totalAlreadyAdvanced = 45000.00

  // Fase 24.6 — agenda financeira de recebíveis.
  // Em produção estes valores devem vir da API financeira/agendamentos da adquirente.
  const receivablesAgenda = [
    { label: 'Hoje', period: 'D+0', amount: 8202.50, count: 1, status: 'Processando' },
    { label: 'Próximos 7 dias', period: 'D+7', amount: 31580.00, count: 24, status: 'Previsto' },
    { label: 'Próximos 15 dias', period: 'D+15', amount: 74430.00, count: 61, status: 'Previsto' },
    { label: 'Próximos 30 dias', period: 'D+30', amount: totalIn30Days, count: 138, status: 'Previsto' },
    { label: '31 a 60 dias', period: 'D+60', amount: totalIn60Days, count: 117, status: 'Futuro' },
  ]

  const agendaMax = Math.max(...receivablesAgenda.map(item => item.amount))
  const projected60Days = totalIn30Days + totalIn60Days
  const projectedFees = projected60Days * 0.0328
  const projectedNet = projected60Days - projectedFees

  const exportReceivablesCSV = () => {
    const headers = ['ID', 'Titulo', 'Evento', 'Cliente', 'Forma', 'Data Venda', 'Vencimento', 'Parcela', 'Valor Bruto (R$)', 'Taxa Gateway (R$)', 'Valor Liquido (R$)', 'Status']
    const rows = [headers.join(';')]
    filtered.forEach(r => {
      rows.push([
        r.id,
        `"${r.title}"`,
        `"${r.event}"`,
        `"${r.client}"`,
        `"${r.method}"`,
        `"${r.saleDate}"`,
        `"${r.dueDate}"`,
        `"${r.installment}"`,
        r.grossValue.toFixed(2).replace('.', ','),
        r.gatewayFee.toFixed(2).replace('.', ','),
        r.netValue.toFixed(2).replace('.', ','),
        `"${r.status}"`
      ].join(';'))
    })
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contas_a_receber_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify('Relatório de Contas a Receber exportado com sucesso em CSV!')
  }

  return (
    <div className="finance-dashboard-wrapper" data-finance-release="24.6-receivables-agenda-2026-09-02">
      <span className="sr-only">24.6-receivables-agenda-2026-09-02</span>
      {/* Back to Dashboard bar */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => onNavigate ? onNavigate('finance-dashboard') : window.history.back()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 shadow-xs transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>
      </div>

      {/* Header Section */}
      <section className="finance-header-section card-surface">
        <div className="finance-header-left">
          <span className="eyebrow">RECEBÍVEIS & CRÉDITO</span>
          <div className="finance-title-row">
            <h1>Contas a Receber (Recebíveis Futuros)</h1>
            <span className="pipeline-status-badge">
              <CheckCircle2 size={13} /> Liquidações Adquirentes Cielo / Rede
            </span>
          </div>
          <p className="page-subtitle">
            Acompanhe o cronograma de liquidação de vendas a prazo e parceladas em cartão de crédito, boletos e lotes corporativos.
          </p>
        </div>

        <div className="finance-header-controls">
          <div className="finance-action-buttons">
            <button className="tool-btn" onClick={exportReceivablesCSV} title="Exportar CSV">
              <Download size={15} /> Exportar CSV
            </button>
            <button className="primary-btn" onClick={() => setShowAdvanceModal(true)}>
              <Zap size={16} /> Antecipar Recebíveis
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards Strip */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <ArrowDownLeft size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Total a Receber</span>
            <strong className="kpi-value">{brl(totalReceivables)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">Em Liquidação</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <Clock size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Vencendo em 30 Dias</span>
            <strong className="kpi-value">{brl(totalIn30Days)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">Próximo Ciclo</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <Calendar size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Vencendo em 60+ Dias</span>
            <strong className="kpi-value">{brl(totalIn60Days)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">Longo Prazo</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <Zap size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Antecipações Concluídas</span>
            <strong className="kpi-value">{brl(totalAlreadyAdvanced)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag warning">Taxa 3,5%</span>
            </div>
          </div>
        </article>
      </section>

      {/* Fase 24.6 — Agenda Financeira */}
      <section className="card-surface" style={{ marginBottom: '16px', padding: '18px' }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="eyebrow">AGENDA FINANCEIRA</span>
            <h2 style={{ margin: '4px 0 5px', fontSize: '18px', fontWeight: 800 }}>Recebimentos previstos</h2>
            <p className="page-subtitle" style={{ margin: 0 }}>
              Visão do calendário de liquidação para antecipar caixa, repasses e compromissos financeiros.
            </p>
          </div>
          <button
            className="tool-btn"
            onClick={() => onNavigate?.('finance-cashflow')}
            title="Abrir Fluxo de Caixa"
          >
            <Calendar size={15} /> Abrir Fluxo de Caixa
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mb-4">
          {receivablesAgenda.map(item => (
            <article key={item.period} className="rounded-xl border border-slate-700/70 bg-slate-900/45 p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-extrabold tracking-wide text-slate-400">{item.period}</span>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full border border-slate-700 text-slate-300">
                  {item.status}
                </span>
              </div>
              <strong className="block text-base text-white">{brl(item.amount)}</strong>
              <span className="block text-xs text-slate-400 mt-1">{item.label}</span>
              <span className="block text-[11px] text-slate-500 mt-2">{item.count} liquidações previstas</span>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr] gap-4">
          <div className="rounded-xl border border-slate-700/70 bg-slate-900/35 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <strong className="text-sm text-white">Projeção de liquidação</strong>
                <div className="text-xs text-slate-500 mt-1">Distribuição dos recebíveis por janela financeira</div>
              </div>
              <span className="text-xs font-bold text-slate-400">Próximos 60 dias</span>
            </div>
            <div className="space-y-3">
              {receivablesAgenda.map(item => (
                <div key={`bar-${item.period}`} className="grid grid-cols-[95px_1fr_115px] items-center gap-3">
                  <span className="text-xs text-slate-400">{item.period}</span>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-500/80"
                      style={{ width: `${Math.max(5, (item.amount / agendaMax) * 100)}%` }}
                    />
                  </div>
                  <strong className="text-xs text-right text-slate-200">{brl(item.amount)}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/70 bg-slate-900/35 p-4">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-emerald-400" />
              <strong className="text-sm text-white">Resumo de caixa projetado</strong>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between gap-3 text-xs">
                <span className="text-slate-400">Bruto previsto (60 dias)</span>
                <strong className="text-slate-100">{brl(projected60Days)}</strong>
              </div>
              <div className="flex justify-between gap-3 text-xs">
                <span className="text-slate-400">Taxas estimadas</span>
                <strong className="text-amber-300">- {brl(projectedFees)}</strong>
              </div>
              <div className="border-t border-slate-700 pt-3 flex justify-between gap-3">
                <span className="text-xs font-bold text-slate-300">Líquido projetado</span>
                <strong className="text-sm text-emerald-400">{brl(projectedNet)}</strong>
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex gap-2">
                <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-4 text-slate-400">
                  Valores são previsões de liquidação e podem variar por estornos, chargebacks e regras da adquirente.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="finance-table-section card-surface">
        <div className="table-header-tabs">
          <div className="table-tools-right" style={{ width: '100%', justifyContent: 'space-between' }}>
            <div className="small-search" style={{ width: '320px' }}>
              <Search size={14} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por título, evento ou cliente..."
              />
              {search && (
                <button onClick={() => setSearch('')} className="icon-clear">
                  <X size={12} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="type-filter-select">
                <Filter size={13} />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">Todos os status</option>
                  <option value="open">Em aberto do Dashboard</option>
                  <option value="a vencer">A Vencer</option>
                  <option value="processando">Processando</option>
                  <option value="antecipado">Antecipado</option>
                  <option value="liquidado">Liquidado</option>
                </select>
              </div>

              <div className="type-filter-select">
                <CreditCard size={13} />
                <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)}>
                  <option value="all">Todas as formas</option>
                  <option value="crédito">Crédito</option>
                  <option value="boleto">Boleto</option>
                  <option value="débito">Débito</option>
                  <option value="pix">PIX</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lots-table-wrap">
          <table className="lots-table finance-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título / Venda</th>
                <th>Evento</th>
                <th>Cliente / Titular</th>
                <th>Forma / Parcela</th>
                <th>Vencimento</th>
                <th style={{ textAlign: 'right' }}>Valor Bruto</th>
                <th style={{ textAlign: 'right' }}>Valor Líquido</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td><b>#{r.id}</b></td>
                  <td>
                    <div className="transaction-desc">
                      <strong>{r.title}</strong>
                      <small>Venda em: {r.saleDate}</small>
                    </div>
                  </td>
                  <td className="event-name-cell">{r.event}</td>
                  <td><span>{r.client}</span></td>
                  <td>
                    <span className="badge-method">{r.method} ({r.installment})</span>
                  </td>
                  <td><b>{r.dueDate}</b></td>
                  <td style={{ textAlign: 'right' }}>{brl(r.grossValue)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#10B981' }}>{brl(r.netValue)}</strong>
                  </td>
                  <td>
                    <span className={`finance-status ${r.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '32px' }}>
                    Nenhum recebível localizado para os critérios informados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Advance Simulation Modal */}
      {showAdvanceModal && (
        <div className="utm-modal-backdrop" onClick={() => setShowAdvanceModal(false)}>
          <div className="utm-modal-card" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">CRÉDITO & ANTECIPAÇÃO</span>
                <h3>Simulador de Antecipação de Recebíveis</h3>
                <p>Receba agora o saldo futuro de vendas parceladas com taxa fixa de 3,5% a.m.</p>
              </div>
              <button className="icon-action" onClick={() => setShowAdvanceModal(false)}>✕</button>
            </div>

            <div className="advance-simulation-body">
              <label>
                Valor a antecipar:
                <input
                  type="range"
                  min={10000}
                  max={totalReceivables}
                  step={5000}
                  value={advanceAmount}
                  onChange={e => setAdvanceAmount(Number(e.target.value))}
                  style={{ width: '100%', margin: '12px 0' }}
                />
                <strong className="advance-big-val">{brl(advanceAmount)}</strong>
              </label>

              <div className="advance-breakdown-card">
                <div className="breakdown-line">
                  <span>Valor Bruto Selecionado</span>
                  <strong>{brl(advanceAmount)}</strong>
                </div>
                <div className="breakdown-line">
                  <span>Taxa de Antecipação (3,5%)</span>
                  <strong style={{ color: '#EF4444' }}>- {brl(advanceFee)}</strong>
                </div>
                <div className="breakdown-line total">
                  <span>Valor Líquido Creditado Imediato</span>
                  <strong style={{ color: '#10B981' }}>{brl(advanceNet)}</strong>
                </div>
              </div>
            </div>

            <div className="utm-modal-actions">
              <button className="btn secondary" onClick={() => setShowAdvanceModal(false)}>Cancelar</button>
              <button
                className="btn primary"
                onClick={() => {
                  setShowAdvanceModal(false)
                  notify(`Proposta de antecipação de ${brl(advanceNet)} contratada com sucesso!`)
                }}
              >
                <Zap size={15} /> Contratar Antecipação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
