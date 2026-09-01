import { useState } from 'react'
import {
  Sliders, Plus, Tag, CheckCircle2, Trash2, X,
  Building, Calendar, Percent, ArrowLeft
} from 'lucide-react'

interface CustomRuleItem {
  id: number
  name: string
  type: string
  event: string
  rate: string
  status: string
}

const initialRules: CustomRuleItem[] = [
  { id: 1, name: 'Parceria Festivais do Sul', type: 'Taxa Zero Gateway', event: 'Experiencia Música e Natureza', rate: '0.00%', status: 'Ativo' },
  { id: 2, name: 'Acordo Institucional Teatro', type: 'MDR Reduzido Cartão', event: 'Todos os Teatros', rate: '1.20%', status: 'Ativo' },
  { id: 3, name: 'Cortesia Patrocinador Master', type: 'Isenção de Conveniência', event: 'Festival de Balonismo', rate: 'R$ 0,00', status: 'Ativo' }
]

export default function FinanceCustomPayPage({ notify, onBack, onNavigate }: { notify?: (msg: string) => void; onBack?: () => void; onNavigate?: (page: any) => void }) {
  const [rules, setRules] = useState<CustomRuleItem[]>(initialRules)
  const [modalOpen, setModalOpen] = useState(false)

  const [ruleName, setRuleName] = useState('')
  const [ruleType, setRuleType] = useState('MDR Reduzido')
  const [ruleEvent, setRuleEvent] = useState('Todos os Eventos')
  const [ruleRate, setRuleRate] = useState('1.5%')

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ruleName) return
    const newRule: CustomRuleItem = {
      id: Date.now(),
      name: ruleName,
      type: ruleType,
      event: ruleEvent,
      rate: ruleRate,
      status: 'Ativo'
    }
    setRules(prev => [newRule, ...prev])
    setModalOpen(false)
    setRuleName('')
    notify?.(`Regra customizada "${ruleName}" criada com sucesso!`)
  }

  const handleDeleteRule = (id: number) => {
    setRules(prev => prev.filter(r => r.id !== id))
    notify?.('Regra customizada removida.')
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
            <Sliders className="text-purple-400" size={20} />
            Pagamentos Customizados & Parcerias
          </h2>
          <p className="text-xs text-slate-400">
            Regras de cobrança especiais, cortesias e acordos tarifários personalizados por produtor/evento
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus size={15} /> Nova Regra Customizada
        </button>
      </div>

      {/* Rules Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm text-xs">
        <div className="p-3.5 border-b border-slate-800 bg-slate-800/40 flex justify-between items-center">
          <h3 className="font-bold text-xs text-white uppercase tracking-wider">
            Regras de Cobrança e Gateway Especiais
          </h3>
          <span className="text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded font-bold">
            {rules.length} regras ativas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/20 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Regra / Nome</th>
                <th className="py-2.5 px-3">Tipo de Acordo</th>
                <th className="py-2.5 px-3">Evento Aplicado</th>
                <th className="py-2.5 px-3 text-center">MDR / Tarifa Customizada</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {rules.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/50">
                  <td className="py-2.5 px-3 font-bold text-white">{r.name}</td>
                  <td className="py-2.5 px-3 text-purple-300 font-medium">{r.type}</td>
                  <td className="py-2.5 px-3 text-slate-300">{r.event}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-400">{r.rate}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-800/40">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <button
                      onClick={() => handleDeleteRule(r.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                      title="Remover regra"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nova Regra */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sliders size={16} className="text-purple-400" />
                Nova Regra de Pagamento Customizado
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddRule} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome da Regra</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Parceria Patrocinador"
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tipo de Acordo</label>
                <select
                  value={ruleType}
                  onChange={e => setRuleType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Taxa Zero Gateway">Taxa Zero Gateway</option>
                  <option value="MDR Reduzido">MDR Reduzido</option>
                  <option value="Isenção de Conveniência">Isenção de Conveniência</option>
                  <option value="Split Customizado">Split Customizado</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Evento Aplicado</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Festival de Balonismo ou Todos"
                  value={ruleEvent}
                  onChange={e => setRuleEvent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">MDR / Tarifa Customizada</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 1.2% ou R$ 0,00"
                  value={ruleRate}
                  onChange={e => setRuleRate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-lg shadow-sm"
                >
                  Salvar Regra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
