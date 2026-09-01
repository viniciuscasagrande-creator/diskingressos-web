import { useState } from 'react'
import {
  CreditCard, QrCode, Barcode, Sliders, Save, PieChart,
  CheckCircle2, DollarSign, Clock, ShieldCheck, ArrowLeft
} from 'lucide-react'

export default function FinancePayMethodsPage({ notify, onBack, onNavigate }: { notify?: (msg: string) => void; onBack?: () => void; onNavigate?: (page: any) => void }) {
  const [pixMdr, setPixMdr] = useState('0.95')
  const [pixDays, setPixDays] = useState('0')

  const [ccMdr, setCcMdr] = useState('2.35')
  const [ccDays, setCcDays] = useState('30')

  const [boletoFee, setBoletoFee] = useState('1.50')
  const [boletoDays, setBoletoDays] = useState('2')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    notify?.('Tarifas e prazos de métodos de pagamento salvos com sucesso!')
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
            <CreditCard className="text-emerald-400" size={20} />
            Métodos de Pagamento & Configurações de Tarifas
          </h2>
          <p className="text-xs text-slate-400">
            Configure taxas de MDR, tarifas fixas e prazos de liquidação por canal de pagamento
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left: Settings Form */}
        <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4 shadow-sm text-xs">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <Sliders size={15} className="text-emerald-400" />
            Tarifas e Prazos por Método
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            {/* PIX */}
            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-3">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <QrCode size={16} className="text-emerald-400" />
                <span>PIX Instantâneo</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase">MDR (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pixMdr}
                    onChange={e => setPixMdr(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase">Prazo de Repasse</label>
                  <select
                    value={pixDays}
                    onChange={e => setPixDays(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                  >
                    <option value="0">Imediato (D+0)</option>
                    <option value="1">D+1 Útil</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cartão de Crédito */}
            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-3">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <CreditCard size={16} className="text-sky-400" />
                <span>Cartão de Crédito (1x à Vista)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase">MDR (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ccMdr}
                    onChange={e => setCcMdr(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase">Prazo de Repasse</label>
                  <select
                    value={ccDays}
                    onChange={e => setCcDays(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                  >
                    <option value="1">D+1 (Antecipado)</option>
                    <option value="30">D+30 (Fluxo Padrão)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Boleto Bancário */}
            <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-3">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <Barcode size={16} className="text-rose-400" />
                <span>Boleto Bancário Registrado</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase">Tarifa Fixa (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={boletoFee}
                    onChange={e => setBoletoFee(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 text-[10px] uppercase">Prazo de Compensação</label>
                  <select
                    value={boletoDays}
                    onChange={e => setBoletoDays(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                  >
                    <option value="1">D+1 Útil</option>
                    <option value="2">D+2 Úteis</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Save size={14} /> Salvar Tarifas
              </button>
            </div>
          </form>
        </div>

        {/* Right: Share de Vendas */}
        <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4 shadow-sm text-xs">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <PieChart size={15} className="text-sky-400" />
            Share de Vendas (Volume)
          </h3>

          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-white">PIX Instantâneo</span>
                <span className="font-mono font-bold text-emerald-400">45%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-white">Cartão de Crédito</span>
                <span className="font-mono font-bold text-sky-400">40%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '40%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-white">Boleto Bancário</span>
                <span className="font-mono font-bold text-rose-400">12%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-white">Cartão de Débito</span>
                <span className="font-mono font-bold text-amber-400">3%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '3%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
