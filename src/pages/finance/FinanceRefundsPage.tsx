import { useState } from 'react'
import {
  RotateCcw, Search, CheckCircle2, AlertTriangle, ArrowRight,
  ShieldCheck, Clock, Ticket, DollarSign, User, X, ArrowLeft
} from 'lucide-react'

const formatMoney = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

interface RefundLogItem {
  txId: string
  client: string
  method: string
  value: number
  date: string
}

const initialRefundLogs: RefundLogItem[] = [
  { txId: 'TX-99001', client: 'Amanda Cruz', method: 'PIX Instantâneo', value: 120.00, date: '14/07/2026 12:45' },
  { txId: 'TX-99002', client: 'Bruno Senna', method: 'Estorno Gateway (Crédito)', value: 380.00, date: '14/07/2026 11:30' },
  { txId: 'TX-98750', client: 'Carlos Andrade', method: 'Voucher Crédito Disk', value: 250.00, date: '13/07/2026 16:10' }
]

export default function FinanceRefundsPage({ notify, onBack, onNavigate }: { notify?: (msg: string) => void; onBack?: () => void; onNavigate?: (page: any) => void }) {
  const [searchId, setSearchId] = useState('')
  const [searchResult, setSearchResult] = useState<{
    txId: string
    client: string
    event: string
    value: number
  } | null>(null)
  const [refundType, setRefundType] = useState('gateway')
  const [logs, setLogs] = useState<RefundLogItem[]>(initialRefundLogs)

  const handleSearch = () => {
    if (!searchId.trim()) {
      notify?.('Informe o ID da transação (ex: TX-98765)')
      return
    }

    if (searchId.toUpperCase().includes('98765') || searchId.toUpperCase().includes('TX')) {
      setSearchResult({
        txId: searchId.toUpperCase(),
        client: 'Juliana Fernandes',
        event: 'Experiencia Música e Natureza - Julho',
        value: 240.00
      })
      notify?.('Pedido localizado com sucesso!')
    } else {
      setSearchResult({
        txId: searchId.toUpperCase(),
        client: 'Comprador Demonstrativo',
        event: 'Festival de Balonismo de Curitiba',
        value: 150.00
      })
      notify?.('Transação localizada.')
    }
  }

  const handleConfirmRefund = () => {
    if (!searchResult) return

    const newLog: RefundLogItem = {
      txId: searchResult.txId,
      client: searchResult.client,
      method: refundType === 'gateway' ? 'Estorno Gateway Automático' : 'Voucher Crédito Disk',
      value: searchResult.value,
      date: new Date().toLocaleString('pt-BR')
    }

    setLogs(prev => [newLog, ...prev])
    notify?.(`Devolução da transação ${searchResult.txId} de ${formatMoney(searchResult.value)} confirmada com sucesso!`)
    setSearchResult(null)
    setSearchId('')
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
            <RotateCcw className="text-rose-400" size={20} />
            Central de Devoluções & Cancelamentos (CDC)
          </h2>
          <p className="text-xs text-slate-400">
            Localização de pedidos, estornos automáticos de cartões/PIX e emissão de vouchers de crédito
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left: Search & Execute */}
        <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4 shadow-sm text-xs">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <Search size={15} className="text-sky-400" />
            Localizar Venda / Pedido
          </h3>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              ID da Transação ou Cód. Ingresso
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: TX-98765"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold uppercase focus:outline-hidden focus:border-rose-400"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition"
              >
                Buscar
              </button>
            </div>
          </div>

          {searchResult ? (
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Detalhes do Pedido Localizado
              </span>

              <div className="space-y-1 text-xs">
                <div><span className="text-slate-400">Transação:</span> <strong className="text-sky-400 font-mono">{searchResult.txId}</strong></div>
                <div><span className="text-slate-400">Cliente:</span> <strong className="text-white">{searchResult.client}</strong></div>
                <div><span className="text-slate-400">Evento:</span> <strong className="text-white">{searchResult.event}</strong></div>
                <div><span className="text-slate-400">Valor do Ingresso:</span> <strong className="text-emerald-400 font-mono text-sm">{formatMoney(searchResult.value)}</strong></div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[10px] uppercase">Forma de Reembolso</label>
                <select
                  value={refundType}
                  onChange={e => setRefundType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold"
                >
                  <option value="gateway">Estorno Automático (Cartão / PIX)</option>
                  <option value="voucher">Crédito em Voucher DiskIngressos</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setSearchResult(null)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmRefund}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <CheckCircle2 size={15} /> Confirmar Devolução
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 bg-slate-800/30 rounded-xl border border-slate-800">
              Digite um ID de transação ou código de ingresso para iniciar o processo de estorno (ex: TX-98765).
            </div>
          )}
        </div>

        {/* Right: Refund Log Table */}
        <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm text-xs">
          <div className="p-3.5 border-b border-slate-800 bg-slate-800/40 flex justify-between items-center">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Clock size={15} className="text-rose-400" />
              Log Recente de Estornos & Cancelamentos
            </h3>
            <span className="text-rose-300 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded font-bold">
              {logs.length} registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/20 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Transação</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Método</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                  <th className="py-2.5 px-3 text-right">Data Estorno</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {logs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-400">{log.txId}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{log.client}</td>
                    <td className="py-2.5 px-3 text-slate-300">{log.method}</td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono text-rose-400">{formatMoney(log.value)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
