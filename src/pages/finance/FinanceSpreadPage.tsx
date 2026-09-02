import {
  Percent, TrendingUp, CreditCard, Building2, CheckCircle2,
  DollarSign, ArrowUpRight, PieChart, BarChart3, ArrowLeft
} from 'lucide-react'

const formatMoney = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export default function FinanceSpreadPage({ notify, onBack, onNavigate }: { notify?: (msg: string) => void; onBack?: () => void; onNavigate?: (page: any) => void }) {
  return (
    <div className="space-y-5">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => (onBack ? onBack() : onNavigate ? onNavigate('finance-dashboard') : window.history.back())}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-[#334155] text-slate-700 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>
      </div>

      {/* Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Percent className="text-pink-400" size={20} />
            Financeiro Spread & Adquirentes
          </h2>
          <p className="text-xs text-slate-500">
            Análise de receitas, tarifas retidas e rentabilidade do ecossistema de pagamentos
          </p>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Volume Processado</span>
          <h3 className="text-lg font-black text-slate-900 mt-1 font-mono">R$ 8.540.000</h3>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp size={13} /> +8.2% vs mês anterior
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Receita de Taxas</span>
          <h3 className="text-lg font-black text-slate-900 mt-1 font-mono">R$ 412.800</h3>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp size={13} /> +5.4% vs mês anterior
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Spread Médio</span>
          <h3 className="text-lg font-black text-sky-700 mt-1 font-mono">4,83%</h3>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            Estável e calibrado
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Lucro Líquido</span>
          <h3 className="text-lg font-black text-emerald-700 mt-1 font-mono">R$ 231.540</h3>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp size={13} /> +9.1% margem de lucro
          </span>
        </div>
      </div>

      {/* Analysis Grid: Methods vs Acquirers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Spread por Meio de Pagamento */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm text-xs">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <CreditCard size={16} className="text-sky-700" />
            Spread por Meio de Pagamento
          </h3>

          <div className="space-y-3.5 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-900">PIX</span>
                <span className="text-slate-700 font-mono font-bold text-emerald-700">1,10% (R$ 93.940)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '22%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-900">Cartão de Crédito</span>
                <span className="text-slate-700 font-mono font-bold text-rose-700">5,20% (R$ 225.400)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '55%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-900">Cartão de Débito</span>
                <span className="text-slate-700 font-mono font-bold text-amber-800">2,80% (R$ 51.240)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-900">Boleto Bancário</span>
                <span className="text-slate-700 font-mono font-bold text-sky-700">3,10% (R$ 42.220)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '11%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Spread por Adquirente */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm text-xs">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Building2 size={16} className="text-purple-700" />
            Spread por Adquirente
          </h3>

          <div className="space-y-3.5 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-900">Cielo</span>
                <span className="text-slate-700 font-mono font-bold text-sky-700">5,20%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-900">Rede</span>
                <span className="text-slate-700 font-mono font-bold text-sky-700">4,80%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '74%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-900">Stone</span>
                <span className="text-slate-700 font-mono font-bold text-emerald-700">4,50% (Melhor Taxa)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-900">PagBank</span>
                <span className="text-slate-700 font-mono font-bold text-sky-700">4,20%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '64%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
