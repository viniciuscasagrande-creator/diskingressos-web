import { useState } from 'react'
import {
  Split, Users, CheckCircle2, ShieldCheck, Download,
  ArrowRight, DollarSign, Percent, Clock, FileSpreadsheet, ArrowLeft
} from 'lucide-react'

const formatMoney = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export default function FinanceSplitPage({ notify, onBack, onNavigate }: { notify?: (msg: string) => void; onBack?: () => void; onNavigate?: (page: any) => void }) {
  const [splitValue, setSplitValue] = useState<string>('1000.00')

  const val = parseFloat(splitValue) || 0

  const orgShare = val * 0.70
  const afiShare = val * 0.10
  const prodShare = val * 0.15
  const diskShare = val * 0.05

  const handleExport = () => {
    notify?.('Histórico e regras de split exportados em formato auditável CSV/Excel!')
  }

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
            <Split className="text-indigo-400" size={20} />
            Split Financeiro & Divisão de Receitas
          </h2>
          <p className="text-xs text-slate-500">
            Partilha automatizada de receitas entre produtores, coprodutores, afiliados e plataforma
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left: Input & Dynamic Breakdown */}
        <div className="md:col-span-7 bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm text-xs">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <DollarSign size={15} className="text-sky-400" />
              Configurar Venda para Divisão
            </h3>
            <span className="text-[11px] text-slate-500">Preencha o valor da venda para simular a partilha</span>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Valor da Venda (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold">R$</span>
              <input
                type="number"
                step="0.01"
                value={splitValue}
                onChange={e => setSplitValue(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 font-mono font-bold text-base text-sky-400 focus:outline-hidden focus:border-indigo-400"
              />
            </div>
          </div>

          <h4 className="font-bold text-xs text-slate-900 border-b border-slate-200 pb-2 pt-2 flex items-center gap-2">
            <Users size={14} className="text-amber-400" />
            Beneficiários Cadastrados
          </h4>

          <div className="space-y-3 pt-1">
            {/* Beneficiário 1: Organizador */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-900">Organizador (Principal)</span>
                <span className="text-slate-700">
                  <span className="font-bold text-slate-900">70%</span> | <span className="font-mono font-bold text-sky-400">{formatMoney(orgShare)}</span>
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '70%' }} />
              </div>
            </div>

            {/* Beneficiário 2: Afiliado */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-900">Afiliado / Coprodutor</span>
                <span className="text-slate-700">
                  <span className="font-bold text-slate-900">10%</span> | <span className="font-mono font-bold text-cyan-400">{formatMoney(afiShare)}</span>
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>

            {/* Beneficiário 3: Produtor Artístico */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-900">Produtor Artístico</span>
                <span className="text-slate-700">
                  <span className="font-bold text-slate-900">15%</span> | <span className="font-mono font-bold text-amber-400">{formatMoney(prodShare)}</span>
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>

            {/* Beneficiário 4: DiskIngressos */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-900">Plataforma DiskIngressos</span>
                <span className="text-slate-700">
                  <span className="font-bold text-slate-900">5%</span> | <span className="font-mono font-bold text-emerald-400">{formatMoney(diskShare)}</span>
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '5%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Features & Actions */}
        <div className="md:col-span-5 bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between shadow-sm text-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-400" />
              Recursos do Split Financeiro
            </h3>

            <div className="space-y-3.5 mt-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Split Automático</span>
                  <span className="text-[11px] text-slate-500">A divisão ocorre no momento exato em que a venda é aprovada no gateway.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">PIX Instantâneo</span>
                  <span className="text-[11px] text-slate-500">O repasse para os beneficiários é creditado diretamente na conta cadastrada.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Agendamento Flexível</span>
                  <span className="text-[11px] text-slate-500">Programe splits para datas específicas, como fechamento mensal ou quinzenal.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Histórico & Rastreabilidade</span>
                  <span className="text-[11px] text-slate-500">Rastreabilidade completa de todas as divisões e repasses efetuados.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <button
              onClick={handleExport}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition shadow-sm"
            >
              <FileSpreadsheet size={15} />
              Visualizar Histórico de Splits
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
