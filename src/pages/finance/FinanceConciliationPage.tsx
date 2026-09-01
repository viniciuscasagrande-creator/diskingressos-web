import { useState } from 'react'
import {
  Scale, Landmark, Filter, AlertTriangle, CheckCircle2,
  Download, Edit, ArrowUpRight, CreditCard, QrCode, Barcode,
  Check, ArrowLeft
} from 'lucide-react'

const formatMoney = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

interface DivergenceItem {
  id: number
  date: string
  type: 'pix' | 'card' | 'boleto'
  title: string
  description: string
  suggestion: string
  badge: string
  amount: number
  selected: boolean
}

const initialDivergences: DivergenceItem[] = [
  {
    id: 1,
    date: '15/07',
    type: 'pix',
    title: '15/07 - PIX Recebido - R$ 350,00',
    description: 'Lançamento bancário correspondente sem ID de transação no gateway.',
    suggestion: 'Sugestão: Conciliar com Venda #TK894562',
    badge: 'Ajuste Pendente',
    amount: 350.00,
    selected: true
  },
  {
    id: 2,
    date: '16/07',
    type: 'card',
    title: '16/07 - Repasse Cartão Crédito - R$ 1.200,00',
    description: 'Diferença de R$ 20,00 entre extrato bancário e relatório de taxas.',
    suggestion: 'Sugestão: Ajustar taxa do adquirente Stone.',
    badge: 'Valor Incompatível',
    amount: 1200.00,
    selected: true
  },
  {
    id: 3,
    date: '16/07',
    type: 'boleto',
    title: '16/07 - Boleto Pago - R$ 450,00',
    description: 'Valor compensado em conta sem correspondência no relatório de pedidos.',
    suggestion: 'Sugestão: Verificar compras duplicadas na portaria.',
    badge: 'Sem Registro',
    amount: 450.00,
    selected: true
  }
]

export default function FinanceConciliationPage({ notify, onBack, onNavigate }: { notify?: (msg: string) => void; onBack?: () => void; onNavigate?: (page: any) => void }) {
  const [selectedBank, setSelectedBank] = useState('santander')
  const [divergences, setDivergences] = useState<DivergenceItem[]>(initialDivergences)

  const [filterPixIn, setFilterPixIn] = useState(true)
  const [filterPixOut, setFilterPixOut] = useState(true)
  const [filterTed, setFilterTed] = useState(true)
  const [filterCards, setFilterCards] = useState(true)
  const [filterBoleto, setFilterBoleto] = useState(true)

  const handleToggleSelect = (id: number) => {
    setDivergences(prev =>
      prev.map(d => (d.id === id ? { ...d, selected: !d.selected } : d))
    )
  }

  const handleReconcileSelected = () => {
    const count = divergences.filter(d => d.selected).length
    if (count === 0) {
      notify?.('Nenhum item selecionado para conciliação.')
      return
    }
    setDivergences(prev => prev.filter(d => !d.selected))
    notify?.(`Conciliação automatizada processada com sucesso para os ${count} itens selecionados!`)
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
            <Scale className="text-teal-400" size={20} />
            Conciliação Bancária
          </h2>
          <p className="text-xs text-slate-400">
            Ajuste e validação de extratos bancários, adquirentes e liquidações automáticas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left: Bank Selection & Filters */}
        <div className="md:col-span-4 space-y-4">
          {/* Selecionar Banco */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3 text-xs shadow-sm">
            <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <Landmark size={15} className="text-sky-400" />
              Selecionar Banco
            </h3>

            <div className="space-y-2 pt-1">
              {[
                ['itau', 'Banco Itaú'],
                ['santander', 'Banco Santander'],
                ['bb', 'Banco do Brasil'],
                ['bradesco', 'Banco Bradesco']
              ].map(([key, name]) => (
                <label
                  key={key}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                    selectedBank === key
                      ? 'bg-sky-950/60 border-sky-600/60 text-white font-bold'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="bank"
                    checked={selectedBank === key}
                    onChange={() => setSelectedBank(key)}
                    className="accent-sky-500"
                  />
                  <span>{name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtros de Extrato */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3 text-xs shadow-sm">
            <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <Filter size={15} className="text-amber-400" />
              Filtros de Extrato
            </h3>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterPixIn}
                  onChange={e => setFilterPixIn(e.target.checked)}
                  className="accent-teal-500 rounded"
                />
                <span>PIX Recebido</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterPixOut}
                  onChange={e => setFilterPixOut(e.target.checked)}
                  className="accent-teal-500 rounded"
                />
                <span>PIX Pago (Repasses)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterTed}
                  onChange={e => setFilterTed(e.target.checked)}
                  className="accent-teal-500 rounded"
                />
                <span>TED / Transferência</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterCards}
                  onChange={e => setFilterCards(e.target.checked)}
                  className="accent-teal-500 rounded"
                />
                <span>Cartão de Crédito / Débito</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterBoleto}
                  onChange={e => setFilterBoleto(e.target.checked)}
                  className="accent-teal-500 rounded"
                />
                <span>Boleto Bancário</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Identified Divergences & Batch Actions */}
        <div className="md:col-span-8 bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4 shadow-sm text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              Divergências Identificadas
            </h3>
            <span className="bg-amber-950/80 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-amber-800/40 text-[11px]">
              {divergences.length} registros pendentes
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {divergences.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
                <p className="font-bold text-white">Extrato totalmente conciliado!</p>
                <span className="text-[11px]">Nenhuma divergência pendente para o banco selecionado.</span>
              </div>
            ) : (
              divergences.map(d => (
                <div
                  key={d.id}
                  onClick={() => handleToggleSelect(d.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    d.selected
                      ? 'bg-slate-800/80 border-sky-600/70 shadow-xs'
                      : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-700/60 rounded-lg shrink-0 mt-0.5">
                        {d.type === 'pix' && <QrCode size={16} className="text-teal-400" />}
                        {d.type === 'card' && <CreditCard size={16} className="text-sky-400" />}
                        {d.type === 'boleto' && <Barcode size={16} className="text-rose-400" />}
                      </div>

                      <div className="space-y-1">
                        <div className="font-bold text-white text-xs">{d.title}</div>
                        <div className="text-[11.5px] text-slate-300">{d.description}</div>
                        <div className="text-[11px] text-sky-400 font-semibold flex items-center gap-1">
                          <span>💡 {d.suggestion}</span>
                        </div>
                      </div>
                    </div>

                    <span className="bg-rose-950/80 text-rose-300 font-bold text-[10px] px-2 py-0.5 rounded border border-rose-800/40 shrink-0">
                      {d.badge}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              onClick={() => notify?.('Exportando logs de divergências bancárias em CSV...')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg flex items-center gap-1.5 transition"
            >
              <Download size={14} /> Exportar
            </button>
            <button
              onClick={() => notify?.('Formulário de lançamento manual aberto.')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg flex items-center gap-1.5 transition shadow-sm"
            >
              <Edit size={14} /> Ajustar Manualmente
            </button>
            <button
              onClick={handleReconcileSelected}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg flex items-center gap-1.5 transition shadow-sm"
            >
              <Check size={14} /> Conciliar Selecionados
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
