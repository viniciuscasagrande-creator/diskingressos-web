import { useState } from 'react'
import {
  Calculator, Percent, Scale, TrendingUp, AlertCircle, ArrowRight,
  ShieldCheck, RefreshCw, ArrowLeft
} from 'lucide-react'

const formatMoney = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export default function FinanceSimulatorPage({ notify, onBack, onNavigate }: { notify?: (msg: string) => void; onBack?: () => void; onNavigate?: (page: any) => void }) {
  const [saleValue, setSaleValue] = useState<string>('500.00')
  const [installments, setInstallments] = useState<number>(10)
  const [anticipation, setAnticipation] = useState<'yes' | 'no'>('yes')
  const [gatewayTax, setGatewayTax] = useState<string>('1.80')
  const [cardTax, setCardTax] = useState<string>('3.20')
  const [platformTax, setPlatformTax] = useState<string>('8.00')

  const val = parseFloat(saleValue) || 0
  const gwPct = parseFloat(gatewayTax) || 0
  const cardPct = parseFloat(cardTax) || 0
  const platPct = parseFloat(platformTax) || 0

  // Cálculos matemáticos exatos do simulador de spread
  const opsCost = val * ((gwPct + cardPct) / 100)
  const platCost = val * (platPct / 100)
  const antCost = anticipation === 'yes' ? val * (0.00584 * installments) : 0
  const netProfit = Math.max(0, val - opsCost - platCost - antCost)
  const effectiveSpread = val > 0 ? ((val - netProfit) / val) * 100 : 0

  const handleSimulate = () => {
    notify?.(`Simulação calculada: Lucro Líquido de ${formatMoney(netProfit)} (Spread efetivo: ${effectiveSpread.toFixed(2)}%)`)
  }

  return (
    <div className="space-y-5">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => (onBack ? onBack() : onNavigate ? onNavigate('finance-dashboard') : window.history.back())}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>
      </div>

      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Calculator className="text-amber-400" size={20} />
            Simulador de Spread & Tarifas
          </h2>
          <p className="text-xs text-slate-400">
            Simule taxas de adquirentes, adiantamentos e margem líquida por venda de ingressos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Input Parameters Form */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4 shadow-sm text-xs">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <Percent size={15} className="text-sky-400" />
            Parâmetros de Simulação
          </h3>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Valor da Venda (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold">R$</span>
              <input
                type="number"
                step="0.01"
                value={saleValue}
                onChange={e => setSaleValue(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white font-mono font-bold text-sm focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Parcelas
              </label>
              <select
                value={installments}
                onChange={e => setInstallments(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold"
              >
                <option value={1}>1x à Vista</option>
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
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Antecipação Automática
              </label>
              <select
                value={anticipation}
                onChange={e => setAnticipation(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold"
              >
                <option value="yes">Sim (Antecipado)</option>
                <option value="no">Não (Recebe parcelado)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Taxa Gateway (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={gatewayTax}
                onChange={e => setGatewayTax(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Taxa Cartão (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={cardTax}
                onChange={e => setCardTax(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Comissão Disk (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={platformTax}
                onChange={e => setPlatformTax(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleSimulate}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm mt-2"
          >
            <Calculator size={15} />
            Calcular Spread
          </button>
        </div>

        {/* Output Result Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-lg text-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <Scale size={15} className="text-amber-400" />
              Resultado da Simulação
            </h3>

            <div className="space-y-3 py-2">
              <div className="flex justify-between items-center text-slate-300">
                <span>Receita Bruta</span>
                <span className="font-mono font-bold text-white text-sm">{formatMoney(val)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Taxas Operacionais (Cartão + Gateway)</span>
                <span className="font-mono font-bold text-rose-400">- {formatMoney(opsCost)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Comissão DiskIngressos ({platPct}%)</span>
                <span className="font-mono font-bold text-rose-400">- {formatMoney(platCost)}</span>
              </div>
              {anticipation === 'yes' && (
                <div className="flex justify-between items-center text-slate-300">
                  <span>Custo de Antecipação ({installments}x parcelas)</span>
                  <span className="font-mono font-bold text-rose-400">- {formatMoney(antCost)}</span>
                </div>
              )}

              <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                <span className="font-bold text-emerald-400 text-sm">Lucro Líquido Recebido</span>
                <span className="font-mono font-black text-emerald-400 text-lg">{formatMoney(netProfit)}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 p-3.5 rounded-xl flex justify-between items-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Spread Efetivo</span>
              <span className="text-[11px] text-slate-500">Tarifa total retida pela plataforma</span>
            </div>
            <h2 className="text-xl font-black text-amber-400 font-mono">{effectiveSpread.toFixed(2)} %</h2>
          </div>
        </div>
      </div>
    </div>
  )
}
