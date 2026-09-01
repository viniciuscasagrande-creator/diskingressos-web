import React, { useState } from 'react'
import { Calculator, Pencil, Scale, ArrowLeft } from 'lucide-react'

interface SimuladorSpreadModuleProps {
  onBack?: () => void
  notify?: (m: string) => void
}

export const SimuladorSpreadModule: React.FC<SimuladorSpreadModuleProps> = ({ onBack, notify }) => {
  const [grossAmount, setGrossAmount] = useState<number>(500.0)
  const [installments, setInstallments] = useState<number>(10)
  const [automaticAdvance, setAutomaticAdvance] = useState<'sim' | 'nao'>('sim')
  const [gatewayFeePercent, setGatewayFeePercent] = useState<number>(1.8)
  const [cardFeePercent, setCardFeePercent] = useState<number>(3.2)
  const [diskCommissionPercent, setDiskCommissionPercent] = useState<number>(8.0)

  // Format currency
  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    })
  }

  // Format input number helper
  const formatPercent = (val: number) => {
    return val.toFixed(2).replace('.', ',')
  }

  // Calculations
  const operationalFeePercent = gatewayFeePercent + cardFeePercent
  const operationalFeeAmount = grossAmount * (operationalFeePercent / 100)
  const commissionAmount = grossAmount * (diskCommissionPercent / 100)
  
  // Anticipation rate: 0.584% per installment if active
  const anticipationPercent = automaticAdvance === 'sim' ? installments * 0.584 : 0
  const anticipationAmount = grossAmount * (anticipationPercent / 100)

  const netAmount = grossAmount - operationalFeeAmount - commissionAmount - anticipationAmount
  const totalRetained = operationalFeeAmount + commissionAmount + anticipationAmount
  const effectiveSpreadPercent = grossAmount > 0 ? (totalRetained / grossAmount) * 100 : 0

  return (
    <div className="w-full space-y-4">
      {/* Back Button */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => (onBack ? onBack() : window.history.back())}
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
            <Calculator size={22} />
          </div>
          <h1>Simulador de Spread</h1>
        </div>
        <div className="ds-finance-header-subtitle">
          Simule taxas, adiantamentos e lucros líquidos por venda
        </div>
      </div>

      {/* 2-Column Main Simulation Container */}
      <div className="ds-spread-container">
        {/* Left Column: Parâmetros de Simulação */}
        <div className="ds-spread-left-card">
          <div className="ds-spread-card-title">
            <Pencil size={18} style={{ color: '#2563eb' }} />
            <span>Parâmetros de Simulação</span>
          </div>

          <div className="ds-spread-form-group">
            <label className="ds-spread-label">VALOR DA VENDA (R$)</label>
            <input
              type="number"
              step="10"
              value={grossAmount}
              onChange={e => setGrossAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="ds-spread-input"
              placeholder="500,00"
            />
          </div>

          <div className="ds-spread-grid-2">
            <div>
              <label className="ds-spread-label">PARCELAS</label>
              <select
                value={installments}
                onChange={e => setInstallments(parseInt(e.target.value, 10))}
                className="ds-spread-select"
              >
                <option value={1}>1x À Vista</option>
                <option value={2}>2x Sem Juros</option>
                <option value={3}>3x Sem Juros</option>
                <option value={4}>4x Sem Juros</option>
                <option value={5}>5x Sem Juros</option>
                <option value={6}>6x Sem Juros</option>
                <option value={10}>10x Sem Juros</option>
                <option value={12}>12x Sem Juros</option>
              </select>
            </div>

            <div>
              <label className="ds-spread-label">ANTECIPAÇÃO AUTOMÁTICA</label>
              <select
                value={automaticAdvance}
                onChange={e => setAutomaticAdvance(e.target.value as 'sim' | 'nao')}
                className="ds-spread-select"
              >
                <option value="sim">Sim (Antecipado)</option>
                <option value="nao">Não (Fluxo Normal)</option>
              </select>
            </div>
          </div>

          <div className="ds-spread-grid-3">
            <div>
              <label className="ds-spread-label">TAXA GATEWAY (%)</label>
              <input
                type="number"
                step="0.10"
                value={gatewayFeePercent}
                onChange={e => setGatewayFeePercent(Math.max(0, parseFloat(e.target.value) || 0))}
                className="ds-spread-input"
              />
            </div>

            <div>
              <label className="ds-spread-label">TAXA CARTÃO (%)</label>
              <input
                type="number"
                step="0.10"
                value={cardFeePercent}
                onChange={e => setCardFeePercent(Math.max(0, parseFloat(e.target.value) || 0))}
                className="ds-spread-input"
              />
            </div>

            <div>
              <label className="ds-spread-label">COMISSÃO DISK (%)</label>
              <input
                type="number"
                step="0.50"
                value={diskCommissionPercent}
                onChange={e => setDiskCommissionPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                className="ds-spread-input"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Resultado da Simulação (Dark) */}
        <div className="ds-spread-right-card">
          <div className="ds-spread-right-title">
            <Scale size={20} style={{ color: '#f97316' }} />
            <span>Resultado da Simulação</span>
          </div>

          <div className="ds-spread-row">
            <span>Receita Bruta</span>
            <strong>{formatBRL(grossAmount)}</strong>
          </div>

          <div className="ds-spread-row">
            <span>Taxas Operacionais (Cartão + Gateway)</span>
            <strong className="negative">- {formatBRL(operationalFeeAmount)}</strong>
          </div>

          <div className="ds-spread-row">
            <span>Comissão DiskIngressos ({diskCommissionPercent.toFixed(0)}%)</span>
            <strong className="negative">- {formatBRL(commissionAmount)}</strong>
          </div>

          <div className="ds-spread-row">
            <span>Custo de Antecipação ({installments} parcelas)</span>
            <strong className="negative">- {formatBRL(anticipationAmount)}</strong>
          </div>

          <div className="ds-spread-row total">
            <span>Lucro Líquido Recebido</span>
            <strong>{formatBRL(Math.max(0, netAmount))}</strong>
          </div>

          {/* SPREAD EFETIVO Highlight Box */}
          <div className="ds-spread-highlight-box">
            <div>
              <h4>SPREAD EFETIVO</h4>
              <p>Tarifa total retida pela plataforma</p>
            </div>
            <div className="ds-spread-highlight-val">
              {formatPercent(effectiveSpreadPercent)} %
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default SimuladorSpreadModule
