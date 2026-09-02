import React, { useState } from 'react'
import { consumeFinanceDrilldown } from '../utils/financeDrilldown'
import {
  Scale, Landmark, Filter, AlertCircle, ArrowUpRight, CreditCard,
  ScanLine, Download, Pencil, CheckCircle2, ArrowLeft, Check
} from 'lucide-react'
import type { EventItem } from '../data/events'

interface Props {
  events?: EventItem[]
  notify?: (message: string) => void
  onNavigate?: (page: any) => void
  onBack?: () => void
}

interface DivergenceItem {
  id: number
  date: string
  type: string
  amount: number
  status: 'Ajuste Pendente' | 'Valor Incompatível' | 'Sem Registro' | 'Conciliado'
  description: string
  suggestion: string
  icon: 'arrow' | 'card' | 'barcode'
  selected?: boolean
}

const initialDivergences: DivergenceItem[] = [
  {
    id: 1,
    date: '15/07',
    type: 'PIX Recebido',
    amount: 350.0,
    status: 'Ajuste Pendente',
    description: 'Lançamento bancário correspondente sem id de transação no gateway.',
    suggestion: 'Sugestão: Conciliar com Venda #TK894562',
    icon: 'arrow',
    selected: true,
  },
  {
    id: 2,
    date: '16/07',
    type: 'Repasse Cartão Crédito',
    amount: 1200.0,
    status: 'Valor Incompatível',
    description: 'Diferença de R$ 20,00 entre extrato bancário e relatório de taxas.',
    suggestion: 'Sugestão: Ajustar taxa do adquirente Stone.',
    icon: 'card',
    selected: true,
  },
  {
    id: 3,
    date: '16/07',
    type: 'Boleto Pago',
    amount: 450.0,
    status: 'Sem Registro',
    description: 'Valor compensado em conta sem correspondência no relatório de pedidos.',
    suggestion: 'Sugestão: Verificar compras duplicadas na portaria.',
    icon: 'barcode',
    selected: true,
  },
]

export default function FinanceReconciliationPage({ events, notify, onNavigate, onBack }: Props) {
  const [drilldown] = useState(() => consumeFinanceDrilldown('finance-reconciliation'))
  const [selectedBank, setSelectedBank] = useState<string>('Banco Santander')
  const [filterPixIn, setFilterPixIn] = useState<boolean>(true)
  const [filterPixOut, setFilterPixOut] = useState<boolean>(true)
  const [filterTed, setFilterTed] = useState<boolean>(true)
  const [filterCards, setFilterCards] = useState<boolean>(true)
  const [filterBoleto, setFilterBoleto] = useState<boolean>(true)

  const [divergences, setDivergences] = useState<DivergenceItem[]>(initialDivergences)

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    })
  }

  const handleApplySuggestion = (item: DivergenceItem) => {
    setDivergences(prev =>
      prev.map(d => (d.id === item.id ? { ...d, status: 'Conciliado' } : d))
    )
    notify?.(`Ajuste aplicado com sucesso: ${item.suggestion.replace('Sugestão: ', '')}!`)
  }

  const handleConciliateAll = () => {
    setDivergences(prev => prev.map(d => ({ ...d, status: 'Conciliado' })))
    notify?.('Todos os 3 lançamentos divergentes foram conciliados com sucesso no Santander!')
  }

  const handleExport = () => {
    const csvContent = [
      'Data;Tipo;Valor;Status;Descricao;Sugestao',
      ...divergences.map(
        d => `"${d.date}";"${d.type}";"${d.amount.toFixed(2)}";"${d.status}";"${d.description}";"${d.suggestion}"`
      ),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conciliacao-bancaria-${selectedBank.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    notify?.('Relatório de divergências bancárias exportado em CSV com sucesso!')
  }

  const activeCount = divergences.filter(d => d.status !== 'Conciliado').length
  const visibleDivergences = drilldown?.status === 'divergent'
    ? divergences.filter(d => d.status !== 'Conciliado')
    : divergences

  return (
    <div className="ds-finance-page-wrapper w-full space-y-4">
      {/* Back Button */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => (onBack ? onBack() : onNavigate ? onNavigate('finance-dashboard') : window.history.back())}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>
      </div>

      {/* Top Header Card */}
      <div className="ds-finance-header-card">
        <div className="ds-finance-header-title">
          <div style={{ color: '#2563eb', display: 'grid', placeItems: 'center' }}>
            <Scale size={22} />
          </div>
          <h1>Conciliação Bancária</h1>
        </div>
        <div className="ds-finance-header-subtitle">
          Ajuste e validação de extratos
        </div>
      </div>

      {/* 2-Column Main Layout */}
      <div className="ds-reconciliation-container">
        
        {/* Left Column: Selecionar Banco & Filtros */}
        <div className="ds-reconciliation-left-card">
          <div className="ds-reconciliation-section-title">
            <Landmark size={18} style={{ color: '#2563eb' }} />
            <span>Selecionar Banco</span>
          </div>

          <div className="ds-reconciliation-radio-list">
            {['Banco Itaú', 'Banco Santander', 'Banco do Brasil', 'Banco Bradesco'].map(bank => (
              <label
                key={bank}
                className={`ds-reconciliation-radio-item ${selectedBank === bank ? 'active' : ''}`}
                onClick={() => {
                  setSelectedBank(bank)
                  notify?.(`Banco selecionado: ${bank}`)
                }}
              >
                <input
                  type="radio"
                  name="selected_bank"
                  checked={selectedBank === bank}
                  onChange={() => setSelectedBank(bank)}
                />
                <span>{bank}</span>
              </label>
            ))}
          </div>

          <div className="ds-reconciliation-divider" />

          <div className="ds-reconciliation-section-title">
            <Filter size={18} style={{ color: '#2563eb' }} />
            <span>Filtros de Extrato</span>
          </div>

          <div className="ds-reconciliation-checkbox-list">
            <label className="ds-reconciliation-checkbox-item">
              <input
                type="checkbox"
                checked={filterPixIn}
                onChange={e => setFilterPixIn(e.target.checked)}
              />
              <span>PIX Recebido</span>
            </label>

            <label className="ds-reconciliation-checkbox-item">
              <input
                type="checkbox"
                checked={filterPixOut}
                onChange={e => setFilterPixOut(e.target.checked)}
              />
              <span>PIX Pago</span>
            </label>

            <label className="ds-reconciliation-checkbox-item">
              <input
                type="checkbox"
                checked={filterTed}
                onChange={e => setFilterTed(e.target.checked)}
              />
              <span>TED</span>
            </label>

            <label className="ds-reconciliation-checkbox-item">
              <input
                type="checkbox"
                checked={filterCards}
                onChange={e => setFilterCards(e.target.checked)}
              />
              <span>Cartão de Crédito/Débito</span>
            </label>

            <label className="ds-reconciliation-checkbox-item">
              <input
                type="checkbox"
                checked={filterBoleto}
                onChange={e => setFilterBoleto(e.target.checked)}
              />
              <span>Boleto Bancário</span>
            </label>
          </div>
        </div>

        {/* Right Column: Divergências Identificadas */}
        <div>
          <div className="ds-divergence-header">
            <div className="ds-divergence-title">
              <AlertCircle size={20} style={{ color: '#ea580c' }} />
              <span>Divergências Identificadas</span>
            </div>
            <span className="ds-divergence-badge">
              {activeCount} registros encontrados
            </span>
          </div>

          {visibleDivergences.map(d => (
            <div key={d.id} className="ds-divergence-card">
              <div className="ds-divergence-icon-wrap">
                {d.icon === 'arrow' && <ArrowUpRight size={20} />}
                {d.icon === 'card' && <CreditCard size={20} />}
                {d.icon === 'barcode' && <ScanLine size={20} />}
              </div>

              <div className="ds-divergence-content">
                <div className="ds-divergence-top-row">
                  <span className="ds-divergence-card-title">
                    {d.date} - {d.type} - {formatBRL(d.amount)}
                  </span>
                  <span
                    className="ds-divergence-status-tag"
                    style={{
                      color: d.status === 'Conciliado' ? '#059669' : '#dc2626',
                    }}
                  >
                    {d.status}
                  </span>
                </div>

                <p className="ds-divergence-desc">
                  {d.description.includes('R$ 20,00') ? (
                    <>
                      Diferença de <strong>R$ 20,00</strong> entre extrato bancário e relatório de taxas.
                    </>
                  ) : (
                    d.description
                  )}
                </p>

                {d.status !== 'Conciliado' ? (
                  <button
                    className="ds-divergence-suggestion"
                    onClick={() => handleApplySuggestion(d)}
                  >
                    <AlertCircle size={14} />
                    <span>{d.suggestion}</span>
                  </button>
                ) : (
                  <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={14} /> Batimento efetuado e registrado
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Bottom Actions Bar */}
          <div className="ds-divergence-actions-bar">
            <button className="ds-btn-outline" onClick={handleExport}>
              <Download size={16} />
              <span>Exportar</span>
            </button>

            <button
              className="ds-btn-orange"
              onClick={() => notify?.('Janela de ajuste manual de divergência aberta!')}
            >
              <Pencil size={16} />
              <span>Ajustar Manualmente</span>
            </button>

            <button className="ds-btn-green" onClick={handleConciliateAll}>
              <CheckCircle2 size={16} />
              <span>Conciliar Selecionados</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
