import { useState } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, AlertCircle,
  Plus, CheckCircle2, ArrowUpRight, BarChart3, Filter, X, ArrowLeft
} from 'lucide-react'

const formatMoney = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

interface ReceberItem {
  id: number
  name: string
  event: string
  value: number
  status: string
}

interface PagarItem {
  id: number
  vendor: string
  value: number
  due: string
}

export default function FinanceAdvancedPage({ notify, onBack, onNavigate }: { notify?: (msg: string) => void; onBack?: () => void; onNavigate?: (page: any) => void }) {
  const [receber, setReceber] = useState<ReceberItem[]>([
    { id: 1, name: 'Lote 01 - Experiencia Música', event: 'Experiencia Música e Natureza', value: 12851.00, status: 'Aprovado' },
    { id: 2, name: 'Lote Promo - Knife Show', event: '9º Knife Show Curitiba', value: 7720.00, status: 'Aprovado' },
    { id: 3, name: 'Patrocínio Master Cervejaria', event: 'Festival de Balonismo', value: 18000.00, status: 'Pendente' }
  ])

  const [pagar, setPagar] = useState<PagarItem[]>([
    { id: 101, vendor: 'Mega Som & Iluminação', value: 14500.00, due: '2026-07-10' },
    { id: 102, vendor: 'Segurança Forte Ltda', value: 9800.00, due: '2026-07-12' },
    { id: 103, vendor: 'Agência Tráfego Ads', value: 7600.00, due: '2026-07-05' }
  ])

  const [modalOpen, setModalOpen] = useState(false)
  const [txType, setTxType] = useState<'receita' | 'despesa'>('receita')
  const [txName, setTxName] = useState('')
  const [txDesc, setTxDesc] = useState('')
  const [txVal, setTxVal] = useState('')
  const [txDate, setTxDate] = useState('2026-07-15')
  const [txStatus, setTxStatus] = useState('Aprovado')

  const totalReceber = receber.reduce((acc, r) => acc + r.value, 0)
  const totalPagar = pagar.reduce((acc, p) => acc + p.value, 0)
  const saldoCaixa = 322550.00

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(txVal) || 0
    if (!txName || val <= 0) return

    if (txType === 'receita') {
      setReceber(prev => [{ id: Date.now(), name: txName, event: txDesc || 'Geral', value: val, status: txStatus }, ...prev])
    } else {
      setPagar(prev => [{ id: Date.now(), vendor: txName, value: val, due: txDate }, ...prev])
    }

    setModalOpen(false)
    setTxName('')
    setTxDesc('')
    setTxVal('')
    notify?.('Lançamento financeiro adicionado com sucesso!')
  }

  const handlePayExpense = (id: number) => {
    const item = pagar.find(p => p.id === id)
    if (item && confirm(`Deseja confirmar a liquidação (pagamento) do lançamento "${item.vendor}" no valor de ${formatMoney(item.value)}?`)) {
      setPagar(prev => prev.filter(p => p.id !== id))
      notify?.('Despesa liquidada e caixa atualizado!')
    }
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
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-emerald-700" size={20} />
            Financeiro Advanced · Fluxo Previsto x Realizado
          </h2>
          <p className="text-xs text-slate-500">
            Controle de liquidez, contas a receber, pagamentos agendados e provisão de caixa
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus size={15} /> Novo Lançamento
        </button>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Receita Hoje</span>
          <h4 className="text-base font-black text-emerald-700 mt-1 font-mono">R$ 85.420,00</h4>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">+12.4% vs média</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Contas a Receber</span>
          <h4 className="text-base font-black text-sky-700 mt-1 font-mono">{formatMoney(totalReceber)}</h4>
          <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">Previsão 30 dias</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Contas a Pagar</span>
          <h4 className="text-base font-black text-rose-700 mt-1 font-mono">{formatMoney(totalPagar)}</h4>
          <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">Vencimentos ativos</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Saldo em Caixa</span>
          <h4 className="text-base font-black text-slate-900 mt-1 font-mono">{formatMoney(saldoCaixa)}</h4>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">Disponível imediato</span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Inadimplência</span>
          <h4 className="text-base font-black text-amber-800 mt-1 font-mono">2,31%</h4>
          <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">Dentro da meta (&lt;3%)</span>
        </div>
      </div>

      {/* Visual Fluxo Previsto x Realizado */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-sm text-xs">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
          <BarChart3 size={16} className="text-sky-700" />
          Fluxo de Caixa: Previsto vs Realizado (Semestral)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-1 text-center">
          {[
            { month: 'Janeiro', prev: 280000, real: 310000 },
            { month: 'Fevereiro', prev: 320000, real: 345000 },
            { month: 'Março', prev: 410000, real: 395000 },
            { month: 'Abril', prev: 390000, real: 420000 },
            { month: 'Maio', prev: 450000, real: 480000 },
            { month: 'Junho', prev: 520000, real: 560000 }
          ].map(m => (
            <div key={m.month} className="p-3 bg-slate-100 rounded-xl border border-slate-200/50 space-y-1.5">
              <span className="font-bold text-slate-900 block">{m.month}</span>
              <div className="text-[11px] font-mono text-slate-500">Prev: {formatMoney(m.prev)}</div>
              <div className="text-xs font-mono font-bold text-emerald-700">Real: {formatMoney(m.real)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tables Grid: Receber & Pagar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Contas a Receber */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm text-xs">
          <div className="p-3.5 border-b border-slate-200 bg-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-700" />
              Contas a Receber
            </h3>
            <span className="text-emerald-700 font-mono font-bold">{formatMoney(totalReceber)}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/20 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Lançamento / Origem</th>
                  <th className="py-2.5 px-3">Evento</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {receber.map(r => (
                  <tr key={r.id} className="hover:bg-slate-100">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{r.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{r.event}</td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono text-emerald-700">{formatMoney(r.value)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${r.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contas a Pagar */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm text-xs">
          <div className="p-3.5 border-b border-slate-200 bg-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingDown size={15} className="text-rose-700" />
              Contas a Pagar (Despesas)
            </h3>
            <span className="text-rose-700 font-mono font-bold">{formatMoney(totalPagar)}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/20 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Fornecedor / Credor</th>
                  <th className="py-2.5 px-3">Vencimento</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                  <th className="py-2.5 px-2 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {pagar.map(p => (
                  <tr key={p.id} className="hover:bg-slate-100">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{p.vendor}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{p.due}</td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono text-rose-700">{formatMoney(p.value)}</td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => handlePayExpense(p.id)}
                        className="bg-emerald-100/80 hover:bg-emerald-900 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-800/40 transition"
                      >
                        Liquidar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Novo Lançamento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Plus size={16} className="text-emerald-700" />
                Novo Lançamento Financeiro
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-slate-900">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tipo de Lançamento</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-slate-900 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="txtype"
                      checked={txType === 'receita'}
                      onChange={() => setTxType('receita')}
                      className="accent-emerald-500"
                    />
                    Receita (A Receber)
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-900 font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="txtype"
                      checked={txType === 'despesa'}
                      onChange={() => setTxType('despesa')}
                      className="accent-rose-500"
                    />
                    Despesa (A Pagar)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome / Descrição / Fornecedor</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Patrocínio ou Fornecedor"
                  value={txName}
                  onChange={e => setTxName(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              {txType === 'receita' ? (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Evento Relacionado</label>
                  <input
                    type="text"
                    placeholder="Ex: Festival de Verão"
                    value={txDesc}
                    onChange={e => setTxDesc(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={e => setTxDate(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 15000.00"
                  value={txVal}
                  onChange={e => setTxVal(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg shadow-sm"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
