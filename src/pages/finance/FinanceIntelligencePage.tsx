import {
  BrainCircuit, TrendingUp, Sparkles, Lightbulb, Trophy, AlertTriangle,
  CheckCircle2, DollarSign, BarChart3, PieChart, ArrowLeft
} from 'lucide-react'

const formatMoney = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export default function FinanceIntelligencePage({ notify, onBack, onNavigate }: { notify?: (msg: string) => void; onBack?: () => void; onNavigate?: (page: any) => void }) {
  const ranking = [
    { rank: '1º', name: 'Festival de Verão', margin: 48, revenue: 1450000 },
    { rank: '2º', name: 'Rodeio Nacional', margin: 44, revenue: 980000 },
    { rank: '3º', name: 'Expo Agro 2026', margin: 41, revenue: 1250000 },
    { rank: '4º', name: 'Show Internacional Rock', margin: 38, revenue: 1600000 }
  ]

  const insights = [
    {
      title: 'Melhor adquirente recomendado',
      desc: 'A Stone possui a menor taxa de antecipação média para parcelamento em 10x, economizando até 1.2% por venda.',
      badge: 'Economia MDR'
    },
    {
      title: 'Configuração de parcelamento ótima',
      desc: 'Limitar as parcelas em até 6x sem juros para o Festival de Verão aumenta a margem líquida média em R$ 14,20 por ingresso.',
      badge: 'Margem Líquida'
    },
    {
      title: 'Otimização de Meios de Pagamento',
      desc: 'Oferecer desconto de 5% em pagamentos via PIX aumentou o volume de vendas à vista em 18% no Show Internacional, reduzindo taxas de adquirentes.',
      badge: 'PIX Growth'
    },
    {
      title: 'Identificação de Risco Financeiro',
      desc: 'O evento Expo Agro apresenta risco de equilíbrio de custos por conta das altas despesas com segurança física programadas.',
      badge: 'Alerta de Custos'
    }
  ]

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
            <BrainCircuit className="text-amber-400" size={20} />
            Inteligência Financeira (Spread Analytics)
          </h2>
          <p className="text-xs text-slate-400">
            Análises preditivas baseadas em IA, EBITDA, ROI e recomendações para maximização de margem
          </p>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Receita Líquida</span>
          <h3 className="text-xl font-black text-white mt-1 font-mono">R$ 5.280.000</h3>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp size={13} /> +15.2% vs semestre anterior
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">EBITDA</span>
          <h3 className="text-xl font-black text-white mt-1 font-mono">R$ 1.950.000</h3>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
            Lucro operacional bruto
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Margem Líquida</span>
          <h3 className="text-xl font-black text-white mt-1 font-mono">36,9%</h3>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 size={13} /> Margem média consolidada
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">ROI Médio</span>
          <h3 className="text-xl font-black text-white mt-1 font-mono">248%</h3>
          <span className="text-[11px] text-sky-400 font-semibold mt-1 block">
            Retorno sobre Investimento
          </span>
        </div>
      </div>

      {/* Main Grid: Ranking & IA Insights */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Ranking */}
        <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4 shadow-sm text-xs">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" />
            Ranking de Rentabilidade por Evento
          </h3>

          <div className="space-y-3 pt-1">
            {ranking.map(item => (
              <div
                key={item.rank}
                className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-xs border border-amber-500/40">
                    {item.rank}
                  </span>
                  <div>
                    <span className="font-bold text-white block">{item.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{formatMoney(item.revenue)}</span>
                  </div>
                </div>

                <span className="bg-emerald-950/80 text-emerald-300 font-extrabold px-2.5 py-1 rounded-lg border border-emerald-800/40 font-mono text-xs">
                  Margem: {item.margin}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* IA Insights */}
        <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4 shadow-sm text-xs">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <Sparkles size={16} className="text-sky-400" />
            IA Financeira · Insights & Otimizações
          </h3>

          <div className="space-y-3 pt-1">
            {insights.map((ins, i) => (
              <div
                key={i}
                className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-start gap-3 hover:bg-slate-800/60 transition"
              >
                <Lightbulb size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-xs">{ins.title}</span>
                    <span className="text-[10px] font-bold bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800/40">
                      {ins.badge}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11.5px] leading-relaxed">{ins.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
