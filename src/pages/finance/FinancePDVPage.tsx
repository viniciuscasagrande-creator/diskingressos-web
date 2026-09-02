import { useState } from 'react'
import {
  Store, Users, MonitorSmartphone, DollarSign, CreditCard,
  QrCode, Banknote, ArrowDownRight, RotateCcw, ShieldCheck,
  Plus, Search, ArrowUpRight, TrendingUp, RefreshCw, X, CheckCircle2, ArrowLeft
} from 'lucide-react'

interface PDVItem {
  id: number
  name: string
  operators: number
  salesCount: number
  revenue: number
  ticket: number
  status: string
  pix: number
  credit: number
  debit: number
  cash: number
  cancel: number
  refund: number
  caixas: number
  time: string
}

interface CaixaItem {
  id: string
  pdv: string
  operator: string
  status: string
  sales: number
  value: number
}

const initialPDVs: PDVItem[] = [
  { id: 1, name: 'Shopping Mueller', operators: 8, salesCount: 846, revenue: 46520, ticket: 54.99, status: 'Online', pix: 15420, credit: 22840, debit: 5880, cash: 2380, cancel: 420, refund: 0, caixas: 4, time: '01:42' },
  { id: 2, name: 'Teatro Positivo', operators: 6, salesCount: 612, revenue: 38740, ticket: 63.30, status: 'Online', pix: 13180, credit: 18960, debit: 4860, cash: 1740, cancel: 280, refund: 0, caixas: 3, time: '01:18' },
  { id: 3, name: 'Teatro Guaíra', operators: 7, salesCount: 735, revenue: 42380, ticket: 57.66, status: 'Online', pix: 14900, credit: 19460, debit: 5620, cash: 2400, cancel: 0, refund: 180, caixas: 4, time: '01:30' },
  { id: 4, name: 'Teatro Fernanda Montenegro', operators: 5, salesCount: 418, revenue: 24960, ticket: 59.71, status: 'Online', pix: 8520, credit: 12640, debit: 2140, cash: 1660, cancel: 0, refund: 0, caixas: 2, time: '01:25' },
  { id: 5, name: 'Família Pavê', operators: 4, salesCount: 322, revenue: 18950, ticket: 58.85, status: 'Online', pix: 6340, credit: 9120, debit: 2130, cash: 1360, cancel: 0, refund: 0, caixas: 2, time: '01:20' },
  { id: 6, name: 'Venda Online', operators: 0, salesCount: 493, revenue: 13300, ticket: 26.98, status: 'Online', pix: 5920, credit: 6520, debit: 860, cash: 0, cancel: 1120, refund: 500, caixas: 0, time: '00:05' }
]

const initialCaixas: CaixaItem[] = [
  { id: 'CX-001', pdv: 'Shopping Mueller', operator: 'Ana Paula', status: 'Online', sales: 214, value: 11820 },
  { id: 'CX-002', pdv: 'Shopping Mueller', operator: 'João Carlos', status: 'Online', sales: 206, value: 10940 },
  { id: 'CX-003', pdv: 'Teatro Positivo', operator: 'Carlos Henrique', status: 'Online', sales: 184, value: 12450 },
  { id: 'CX-004', pdv: 'Teatro Guaíra', operator: 'Juliana Costa', status: 'Online', sales: 228, value: 13920 },
  { id: 'CX-005', pdv: 'Teatro Fernanda Montenegro', operator: 'Ricardo Souza', status: 'Online', sales: 151, value: 8920 },
  { id: 'CX-006', pdv: 'Família Pavê', operator: 'Fernanda Lima', status: 'Online', sales: 136, value: 8140 }
]

const formatMoney = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export default function FinancePDVPage({ notify, onBack, onNavigate }: { notify?: (msg: string) => void; onBack?: () => void; onNavigate?: (page: any) => void }) {
  const [pdvs, setPdvs] = useState<PDVItem[]>(initialPDVs)
  const [caixas, setCaixas] = useState<CaixaItem[]>(initialCaixas)
  const [selectedPDV, setSelectedPDV] = useState<PDVItem | null>(initialPDVs[0])
  const [modalOpen, setModalOpen] = useState(false)
  const [sangriaModalOpen, setSangriaModalOpen] = useState(false)
  const [selectedCaixa, setSelectedCaixa] = useState<CaixaItem | null>(null)
  const [sangriaValue, setSangriaValue] = useState('')
  const [simLog, setSimLog] = useState<string | null>(null)

  // Novo PDV Form State
  const [newPDVName, setNewPDVName] = useState('')
  const [newPDVOps, setNewPDVOps] = useState('4')
  const [newPDVCaixas, setNewPDVCaixas] = useState('2')
  const [newPDVOpName, setNewPDVOpName] = useState('Operador 1')
  const [newPDVPix, setNewPDVPix] = useState('5000')
  const [newPDVCredit, setNewPDVCredit] = useState('8000')
  const [newPDVDebit, setNewPDVDebit] = useState('2000')
  const [newPDVCash, setNewPDVCash] = useState('1000')

  // Totais calculados
  const totalRevenue = pdvs.reduce((acc, p) => acc + p.revenue, 0)
  const totalSold = pdvs.reduce((acc, p) => acc + p.salesCount, 0)
  const avgTicket = totalSold > 0 ? totalRevenue / totalSold : 0
  const totalPix = pdvs.reduce((acc, p) => acc + p.pix, 0)
  const totalCards = pdvs.reduce((acc, p) => acc + (p.credit + p.debit), 0)
  const totalCash = pdvs.reduce((acc, p) => acc + p.cash, 0)
  const totalCancel = pdvs.reduce((acc, p) => acc + p.cancel, 0)
  const totalRefunds = pdvs.reduce((acc, p) => acc + p.refund, 0)

  const handleCreatePDV = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPDVName) return

    const pixVal = parseFloat(newPDVPix) || 0
    const creditVal = parseFloat(newPDVCredit) || 0
    const debitVal = parseFloat(newPDVDebit) || 0
    const cashVal = parseFloat(newPDVCash) || 0
    const rev = pixVal + creditVal + debitVal + cashVal
    const sales = Math.max(1, Math.round(rev / 55))

    const newPDV: PDVItem = {
      id: Date.now(),
      name: newPDVName,
      operators: parseInt(newPDVOps) || 1,
      salesCount: sales,
      revenue: rev,
      ticket: rev / sales,
      status: 'Online',
      pix: pixVal,
      credit: creditVal,
      debit: debitVal,
      cash: cashVal,
      cancel: 0,
      refund: 0,
      caixas: parseInt(newPDVCaixas) || 1,
      time: '00:01'
    }

    const newCx: CaixaItem = {
      id: `CX-${Math.floor(Math.random() * 900 + 100)}`,
      pdv: newPDVName,
      operator: newPDVOpName,
      status: 'Online',
      sales: sales,
      value: rev
    }

    setPdvs(prev => [newPDV, ...prev])
    setCaixas(prev => [newCx, ...prev])
    setSelectedPDV(newPDV)
    setModalOpen(false)
    setNewPDVName('')
    notify?.(`PDV "${newPDVName}" cadastrado com sucesso!`)
  }

  const handleSangria = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCaixa) return
    const val = parseFloat(sangriaValue)
    if (isNaN(val) || val <= 0 || val > selectedCaixa.value) {
      notify?.('Valor inválido para sangria.')
      return
    }

    setCaixas(prev =>
      prev.map(c => (c.id === selectedCaixa.id ? { ...c, value: c.value - val } : c))
    )

    setPdvs(prev =>
      prev.map(p =>
        p.name === selectedCaixa.pdv
          ? { ...p, cash: Math.max(0, p.cash - val), revenue: p.revenue - val }
          : p
      )
    )

    setSangriaModalOpen(false)
    setSangriaValue('')
    notify?.(`Sangria de ${formatMoney(val)} realizada no Caixa ${selectedCaixa.id}!`)
  }

  const handleSimulateSale = () => {
    const physical = pdvs.filter(p => p.name !== 'Venda Online')
    const target = physical[Math.floor(Math.random() * physical.length)] || pdvs[0]
    const methods = ['Crédito', 'PIX', 'Débito', 'Dinheiro'] as const
    const m = methods[Math.floor(Math.random() * methods.length)]
    const val = parseFloat((Math.random() * 50 + 35).toFixed(2))

    setPdvs(prev =>
      prev.map(p => {
        if (p.id !== target.id) return p
        const newCount = p.salesCount + 1
        const newRev = p.revenue + val
        return {
          ...p,
          salesCount: newCount,
          revenue: newRev,
          ticket: newRev / newCount,
          credit: m === 'Crédito' ? p.credit + val : p.credit,
          pix: m === 'PIX' ? p.pix + val : p.pix,
          debit: m === 'Débito' ? p.debit + val : p.debit,
          cash: m === 'Dinheiro' ? p.cash + val : p.cash
        }
      })
    )

    setSimLog(`[Venda Simulada] +${formatMoney(val)} no PDV "${target.name}" via ${m}`)
    notify?.(`Venda de ${formatMoney(val)} simulada em ${target.name}!`)
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

      {/* Executive Header */}
      <div className="rounded-xl p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-900 shadow-md border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Store className="text-amber-800" size={24} />
              <h2 className="text-xl font-black tracking-tight text-slate-900">
                DISKINGRESSOS · PDV FINANCEIRO
              </h2>
            </div>
            <p className="text-xs text-slate-700">
              Empresa: DiskIngressos S.A. | Monitoramento de Bilheterias Físicas e PDVs Integrados
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-700 block">Caixas Abertos</span>
              <span className="text-base font-black text-slate-900">{caixas.length}</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-700 block">Operadores</span>
              <span className="text-base font-black text-slate-900">42</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700">Online</span>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus size={15} />
              Novo PDV
            </button>
            <button
              onClick={handleSimulateSale}
              className="bg-slate-700 hover:bg-slate-600 text-slate-900 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition border border-slate-600"
              title="Simular Venda em Tempo Real"
            >
              <RefreshCw size={13} />
              Simular Venda
            </button>
          </div>
        </div>

        {simLog && (
          <div className="mt-3 text-xs bg-emerald-100/60 border border-emerald-500/40 text-emerald-700 px-3 py-1.5 rounded-md flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-700" />
            <span>{simLog}</span>
          </div>
        )}
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Receita do Dia</span>
          <h3 className="text-lg font-black text-sky-700">{formatMoney(totalRevenue)}</h3>
        </div>
        <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Ingressos Vendidos</span>
          <h3 className="text-lg font-black text-emerald-700">{totalSold.toLocaleString('pt-BR')}</h3>
        </div>
        <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Ticket Médio</span>
          <h3 className="text-lg font-black text-indigo-700">{formatMoney(avgTicket)}</h3>
        </div>
        <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">PIX Recebido</span>
          <h3 className="text-lg font-black text-amber-800">{formatMoney(totalPix)}</h3>
        </div>
        <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Crédito / Débito</span>
          <h3 className="text-lg font-black text-cyan-800">{formatMoney(totalCards)}</h3>
        </div>
      </div>

      {/* Secondary KPI Info Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1.5"><Banknote size={14} className="text-emerald-700" /> Dinheiro em Caixa:</span>
          <span className="font-bold text-slate-900">{formatMoney(totalCash)}</span>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1.5"><X size={14} className="text-rose-700" /> Cancelamentos:</span>
          <span className="font-bold text-rose-700">{formatMoney(totalCancel)}</span>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1.5"><RotateCcw size={14} className="text-amber-800" /> Estornos:</span>
          <span className="font-bold text-amber-800">{formatMoney(totalRefunds)}</span>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-700" /> Aprovação Cartão:</span>
          <span className="font-bold text-emerald-700">98,9%</span>
        </div>
      </div>

      {/* Main Grid: Desempenho por PDVs & Monitor de Caixas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Tables */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tabela de Desempenho por PDV */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Store size={16} className="text-sky-700" />
                Desempenho por Pontos de Venda (PDVs)
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-800/40">
                ● Atualizando
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/20 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Ponto de Venda</th>
                    <th className="py-2.5 px-2 text-center">Operadores</th>
                    <th className="py-2.5 px-2 text-center">Vendas</th>
                    <th className="py-2.5 px-3 text-right">Receita</th>
                    <th className="py-2.5 px-3 text-right">Ticket Médio</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {pdvs.map(p => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPDV(p)}
                      className={`hover:bg-slate-100 cursor-pointer transition ${
                        selectedPDV?.id === p.id ? 'bg-sky-100/40 font-semibold text-slate-900' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-medium text-slate-900">{p.name}</td>
                      <td className="py-2.5 px-2 text-center text-slate-500">{p.operators || '—'}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{p.salesCount}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700 font-mono">{formatMoney(p.revenue)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">{formatMoney(p.ticket)}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className="text-[10px] bg-emerald-100/60 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-800/40">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monitor de Caixas Físicos (Terminais) */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3.5 border-b border-slate-200 bg-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MonitorSmartphone size={16} className="text-amber-800" />
                Monitor de Caixas Físicos (Terminais)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/20 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Caixa</th>
                    <th className="py-2.5 px-3">Ponto de Venda</th>
                    <th className="py-2.5 px-3">Operador</th>
                    <th className="py-2.5 px-2 text-center">Vendas</th>
                    <th className="py-2.5 px-3 text-right">Acumulado</th>
                    <th className="py-2.5 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {caixas.map(c => (
                    <tr key={c.id} className="hover:bg-slate-100">
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-700">{c.id}</td>
                      <td className="py-2.5 px-3 text-slate-900">{c.pdv}</td>
                      <td className="py-2.5 px-3 text-slate-700">{c.operator}</td>
                      <td className="py-2.5 px-2 text-center font-mono">{c.sales}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700 font-mono">{formatMoney(c.value)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedCaixa(c)
                            setSangriaValue('1000')
                            setSangriaModalOpen(true)
                          }}
                          className="bg-rose-900/40 hover:bg-rose-800/60 text-rose-700 text-[11px] font-bold px-2.5 py-1 rounded border border-rose-700/50 transition"
                        >
                          Sangria
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: PDV Details & Breakdown */}
        <div className="space-y-5">
          {/* Card Detalhes do PDV Selecionado */}
          {selectedPDV && (
            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-4 shadow-sm">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Detalhes do Ponto de Venda</span>
                <h4 className="text-base font-extrabold text-slate-900 mt-0.5">{selectedPDV.name}</h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase">Receita Total</span>
                  <span className="font-bold text-emerald-700 text-sm font-mono">{formatMoney(selectedPDV.revenue)}</span>
                </div>
                <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase">Ingressos</span>
                  <span className="font-bold text-slate-900 text-sm font-mono">{selectedPDV.salesCount}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">📱 PIX Recebido:</span>
                  <span className="font-mono text-amber-800 font-semibold">{formatMoney(selectedPDV.pix)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">💳 Cartão de Crédito:</span>
                  <span className="font-mono text-sky-700 font-semibold">{formatMoney(selectedPDV.credit)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">💳 Cartão de Débito:</span>
                  <span className="font-mono text-cyan-800 font-semibold">{formatMoney(selectedPDV.debit)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">💵 Dinheiro em Espécie:</span>
                  <span className="font-mono text-emerald-700 font-semibold">{formatMoney(selectedPDV.cash)}</span>
                </div>
                {selectedPDV.cancel > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">❌ Cancelamentos:</span>
                    <span className="font-mono text-rose-700 font-semibold">{formatMoney(selectedPDV.cancel)}</span>
                  </div>
                )}
                {selectedPDV.refund > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">🔄 Estornos Efetuados:</span>
                    <span className="font-mono text-rose-700 font-semibold">{formatMoney(selectedPDV.refund)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Formas de Pagamento Share */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-sm">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <CreditCard size={16} className="text-indigo-700" />
              Volume por Método de Pagamento
            </h4>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Cartão de Crédito (46,8%)</span>
                  <span className="font-mono font-bold text-slate-900">{formatMoney(totalCards * 0.75)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: '46.8%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>PIX Instantâneo (34,8%)</span>
                  <span className="font-mono font-bold text-slate-900">{formatMoney(totalPix)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '34.8%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Cartão de Débito (12,2%)</span>
                  <span className="font-mono font-bold text-slate-900">{formatMoney(totalCards * 0.25)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '12.2%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Dinheiro (6,2%)</span>
                  <span className="font-mono font-bold text-slate-900">{formatMoney(totalCash)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '6.2%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Novo PDV */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Store size={16} className="text-amber-800" />
                Cadastrar Novo Ponto de Venda (PDV)
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-slate-900">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePDV} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome do PDV / Local</label>
                <input
                  type="text"
                  required
                  value={newPDVName}
                  onChange={e => setNewPDVName(e.target.value)}
                  placeholder="Ex: Bilheteria Portão Principal"
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Qtd. Operadores</label>
                  <input
                    type="number"
                    min="1"
                    value={newPDVOps}
                    onChange={e => setNewPDVOps(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Qtd. Caixas Físicos</label>
                  <input
                    type="number"
                    min="1"
                    value={newPDVCaixas}
                    onChange={e => setNewPDVCaixas(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome do Operador Principal</label>
                <input
                  type="text"
                  required
                  value={newPDVOpName}
                  onChange={e => setNewPDVOpName(e.target.value)}
                  placeholder="Ex: Marcelo Silva"
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Abertura PIX (R$)</label>
                  <input
                    type="number"
                    value={newPDVPix}
                    onChange={e => setNewPDVPix(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Abertura Crédito (R$)</label>
                  <input
                    type="number"
                    value={newPDVCredit}
                    onChange={e => setNewPDVCredit(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
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
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold font-extrabold rounded-lg shadow-sm"
                >
                  Salvar PDV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sangria de Caixa */}
      {sangriaModalOpen && selectedCaixa && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Banknote size={16} className="text-rose-700" />
                Sangria de Caixa · {selectedCaixa.id}
              </h3>
              <button onClick={() => setSangriaModalOpen(false)} className="text-slate-500 hover:text-slate-900">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSangria} className="p-5 space-y-4 text-xs">
              <div className="bg-slate-100/70 p-3 rounded-lg border border-slate-200">
                <div className="text-slate-500 text-[11px]">Operador: <span className="text-slate-900 font-bold">{selectedCaixa.operator}</span></div>
                <div className="text-slate-500 text-[11px]">PDV: <span className="text-slate-900 font-bold">{selectedCaixa.pdv}</span></div>
                <div className="text-slate-500 text-[11px] mt-1">Saldo em Caixa: <span className="text-emerald-700 font-bold font-mono">{formatMoney(selectedCaixa.value)}</span></div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Valor da Sangria (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={sangriaValue}
                  onChange={e => setSangriaValue(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSangriaModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-slate-900 font-extrabold rounded-lg shadow-sm"
                >
                  Confirmar Sangria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
