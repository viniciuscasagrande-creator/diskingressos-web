import { useState } from 'react'
import {
  Handshake, Calendar, DollarSign, Plus, Trash2, CheckCircle2,
  TrendingDown, TrendingUp, Sparkles, AlertCircle, Save, Info, ShieldCheck,
  ChevronDown, Layers, FileText, ArrowLeft
} from 'lucide-react'

interface EventOption {
  id: number
  name: string
  date: string
  status: 'ativos' | 'inativos'
  salesCount: number
  revenue: number
}

interface ReceitaItem {
  metodo: string
  taxa_pagamento: number
  pgto_taxa_servico: number // 2 = Sim, 3 = Não
  tx_ant_am: number
  pgto_ant: number // 2 = Sim, 3 = Não
  taxa_parcelado: number
  total_taxas: number
  qtd_ingressos: number
  receita_bruta: number
  taxa_servico: number
  receita_liquida: number
}

interface DespesaItem {
  fornecedor: string
  categoria: string
  data: string
  status: string
  valor: number
}

interface PatrocinioItem {
  marca: string
  categoria: string
  status: string
  valor: number
}

interface InstallmentItem {
  numero: number
  valor: number
  valor_pago: number
  status: number // 1 = Pago, 0 = Aguardando
  data: string
}

const defaultEvents: EventOption[] = [
  { id: 3368, name: 'Experiencia Música e Natureza - Julho', date: 'Sáb, 11/07/2026 - 11:00', status: 'ativos', salesCount: 674, revenue: 12851.00 },
  { id: 3195, name: '9º Knife Show Curitiba - Feira e Exposição de Facas', date: 'Sáb, 11/07/2026 - 11:00', status: 'ativos', salesCount: 328, revenue: 7720.00 },
  { id: 843, name: 'RENATO ALBANI - NOVO SHOW - SESSÃO EXTRA', date: 'Seg, 22/06/2026 - 17:00', status: 'inativos', salesCount: 843, revenue: 62098.00 },
  { id: 1500, name: 'Festival de Balonismo de Curitiba', date: 'Sáb, 18/07/2026 - 14:00', status: 'ativos', salesCount: 1500, revenue: 45000.00 }
]

const formatMoney = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

export default function FinanceNegotiationsPage({ notify, onBack, onNavigate }: { notify?: (msg: string) => void; onBack?: () => void; onNavigate?: (page: any) => void }) {
  const [events] = useState<EventOption[]>(defaultEvents)
  const [selectedEventId, setSelectedEventId] = useState<number>(defaultEvents[0].id)
  const [activeTab, setActiveTab] = useState<'receita' | 'despesas' | 'patrocinio' | 'advanced' | 'informacoes'>('receita')

  // Data state for selected event
  const [receitas, setReceitas] = useState<ReceitaItem[]>([
    { metodo: 'Cartão de Crédito 1x', taxa_pagamento: 2.35, pgto_taxa_servico: 2, tx_ant_am: 1.80, pgto_ant: 2, taxa_parcelado: 0.00, total_taxas: 1850.20, qtd_ingressos: 280, receita_bruta: 42000.00, taxa_servico: 5460.00, receita_liquida: 36540.00 },
    { metodo: 'Cartão de Crédito Parcelado (2-6x)', taxa_pagamento: 3.10, pgto_taxa_servico: 2, tx_ant_am: 1.80, pgto_ant: 2, taxa_parcelado: 2.50, total_taxas: 1420.00, qtd_ingressos: 95, receita_bruta: 19000.00, taxa_servico: 2470.00, receita_liquida: 16530.00 },
    { metodo: 'PIX Instantâneo', taxa_pagamento: 0.95, pgto_taxa_servico: 2, tx_ant_am: 0.00, pgto_ant: 3, taxa_parcelado: 0.00, total_taxas: 98.50, qtd_ingressos: 60, receita_bruta: 9500.00, taxa_servico: 1235.00, receita_liquida: 8265.00 },
    { metodo: 'Boleto Bancário', taxa_pagamento: 1.50, pgto_taxa_servico: 3, tx_ant_am: 0.00, pgto_ant: 3, taxa_parcelado: 0.00, total_taxas: 22.50, qtd_ingressos: 11, receita_bruta: 1476.20, taxa_servico: 223.20, receita_liquida: 1253.00 }
  ])

  const [despesas, setDespesas] = useState<DespesaItem[]>([
    { fornecedor: 'Mega Som & Iluminação', categoria: 'Som & Luz', data: '2026-07-10', status: 'Pago', valor: 14500.00 },
    { fornecedor: 'Segurança Forte Ltda', categoria: 'Segurança', data: '2026-07-12', status: 'Pendente', valor: 9800.00 },
    { fornecedor: 'Agência Tráfego Ads', categoria: 'Marketing', data: '2026-07-05', status: 'Pago', valor: 7600.00 },
    { fornecedor: 'Buffet & Camarim VIP', categoria: 'Catering', data: '2026-07-11', status: 'Pendente', valor: 8000.00 }
  ])

  const [patrocinios, setPatrocinios] = useState<PatrocinioItem[]>([
    { marca: 'Cervejaria Artesanal Curitiba', categoria: 'Master', status: 'Ativo', valor: 18000.00 },
    { marca: 'Banco Digital Paraná', categoria: 'Gold', status: 'Ativo', valor: 10000.00 }
  ])

  const [advancedInstallments, setAdvancedInstallments] = useState<InstallmentItem[]>([
    { numero: 1, valor: 10000.00, valor_pago: 10000.00, status: 1, data: '15/06/2026' },
    { numero: 2, valor: 10000.00, valor_pago: 0.00, status: 0, data: '05/07/2026' }
  ])

  // Inline forms state
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [newExpSupplier, setNewExpSupplier] = useState('')
  const [newExpCategory, setNewExpCategory] = useState('Som & Luz')
  const [newExpVal, setNewExpVal] = useState('')
  const [newExpDate, setNewExpDate] = useState('2026-07-11')

  const [showAddSponsor, setShowAddSponsor] = useState(false)
  const [newSponsName, setNewSponsName] = useState('')
  const [newSponsTier, setNewSponsTier] = useState('Master')
  const [newSponsVal, setNewSponsVal] = useState('')

  const curEvent = events.find(e => e.id === selectedEventId) || events[0]

  // Totais
  const totalReceitaBruta = receitas.reduce((acc, r) => acc + r.receita_bruta, 0)
  const totalTaxasServico = receitas.reduce((acc, r) => acc + r.taxa_servico, 0)
  const totalReceitaLiquida = receitas.reduce((acc, r) => acc + r.receita_liquida, 0)
  const totalTaxasOperadoras = receitas.reduce((acc, r) => acc + r.total_taxas, 0)
  const totalQtdIngressos = receitas.reduce((acc, r) => acc + r.qtd_ingressos, 0)

  const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0)
  const totalPatrocinio = patrocinios.reduce((acc, p) => acc + p.valor, 0)

  const resultadoEconomicoReceitas = totalReceitaBruta + totalPatrocinio
  const resultadoEconomicoCustos = totalDespesas + totalTaxasOperadoras + totalTaxasServico
  const resultadoLiquidoFinal = resultadoEconomicoReceitas - resultadoEconomicoCustos
  const ratioCustos = resultadoEconomicoReceitas > 0 ? (resultadoEconomicoCustos / resultadoEconomicoReceitas) * 100 : 0

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(newExpVal) || 0
    if (!newExpSupplier || val <= 0) return
    setDespesas(prev => [...prev, { fornecedor: newExpSupplier, categoria: newExpCategory, data: newExpDate, status: 'Pendente', valor: val }])
    setShowAddExpense(false)
    setNewExpSupplier('')
    setNewExpVal('')
    notify?.('Despesa adicionada com sucesso!')
  }

  const handleSaveSponsor = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(newSponsVal) || 0
    if (!newSponsName || val <= 0) return
    setPatrocinios(prev => [...prev, { marca: newSponsName, categoria: newSponsTier, status: 'Ativo', valor: val }])
    setShowAddSponsor(false)
    setNewSponsName('')
    setNewSponsVal('')
    notify?.('Patrocínio cadastrado com sucesso!')
  }

  const handlePayInstallment = (index: number) => {
    setAdvancedInstallments(prev =>
      prev.map((inst, i) =>
        i === index ? { ...inst, status: 1, valor_pago: inst.valor } : inst
      )
    )
    notify?.('Parcela de adiantamento liquidada com sucesso!')
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

      {/* Event Info Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Selecionar Evento para Negociação
            </label>
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(Number(e.target.value))}
              className="bg-slate-100 border border-slate-200 text-slate-900 font-bold text-xs rounded-lg px-3 py-2 min-w-[280px] focus:outline-hidden focus:border-sky-400"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  ID.{ev.id} - {ev.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-700 space-y-0.5 border-l border-slate-200 pl-4">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-500" />
              <span>Início das Vendas: <strong className="text-slate-900">01/07/2025 às 16h38</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-500" />
              <span>Final das Vendas: <strong className="text-slate-900">{curEvent.date}</strong></span>
            </div>
          </div>
        </div>

        <div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
            curEvent.status === 'ativos'
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
              : 'bg-sky-950/60 text-sky-300 border-sky-800/40'
          }`}>
            <CheckCircle2 size={13} />
            {curEvent.status === 'ativos' ? 'Evento Ativo' : 'Evento Realizado'}
          </span>
        </div>
      </div>

      {/* Top Title & Sub-tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Handshake className="text-sky-400" size={20} />
            Negociações Financeiras
          </h2>
          <p className="text-xs text-slate-500">
            Regras de receita, adiantamentos, tributação por setor e resultado econômico
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
          {(
            [
              ['receita', 'RECEITA'],
              ['despesas', 'DESPESAS'],
              ['patrocinio', 'PATROCÍNIO'],
              ['advanced', 'ADVANCED'],
              ['informacoes', 'INFORMAÇÕES FINANCEIRAS']
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === key
                  ? 'bg-sky-600 text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: RECEITA */}
      {activeTab === 'receita' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-3.5 border-b border-slate-200 bg-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Informações sobre a Receita de Vendas
              </h3>
              <span className="text-[11px] text-slate-500">MDR, taxas de antecipação e receita líquida</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/20 text-slate-500 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Forma de Pagamento</th>
                    <th className="py-2.5 px-2 text-center">Taxa Pgto %</th>
                    <th className="py-2.5 px-2 text-center">Pgto Taxa Serv.</th>
                    <th className="py-2.5 px-2 text-center">Tx Ant. a.m %</th>
                    <th className="py-2.5 px-2 text-center">Pgto Ant.</th>
                    <th className="py-2.5 px-2 text-center">Taxa Parc. %</th>
                    <th className="py-2.5 px-2 text-center">Qtd. Ingressos</th>
                    <th className="py-2.5 px-3 text-right">Receita Bruta</th>
                    <th className="py-2.5 px-3 text-right">Taxa Serviço</th>
                    <th className="py-2.5 px-3 text-right">Receita Líquida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-700">
                  {receitas.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-100">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{r.metodo}</td>
                      <td className="py-2.5 px-2 text-center font-mono text-sky-400 font-bold">{r.taxa_pagamento.toFixed(2)}%</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${r.pgto_taxa_servico === 2 ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                          {r.pgto_taxa_servico === 2 ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-amber-400">{r.tx_ant_am.toFixed(2)}%</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${r.pgto_ant === 2 ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                          {r.pgto_ant === 2 ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-indigo-400">{r.taxa_parcelado.toFixed(2)}%</td>
                      <td className="py-2.5 px-2 text-center font-mono">{r.qtd_ingressos}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-200">{formatMoney(r.receita_bruta)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-300">{formatMoney(r.taxa_servico)}</td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-emerald-400">{formatMoney(r.receita_liquida)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-200">
                    <td colSpan={6} className="py-3 px-3 text-right uppercase text-xs">Totais Acumulados:</td>
                    <td className="py-3 px-2 text-center font-mono text-sky-400">{totalQtdIngressos}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900">{formatMoney(totalReceitaBruta)}</td>
                    <td className="py-3 px-3 text-right font-mono text-amber-400">{formatMoney(totalTaxasServico)}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">{formatMoney(totalReceitaLiquida)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => notify?.('Configurações de negociação gravadas com sucesso no banco de dados!')}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-extrabold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm"
            >
              <Save size={15} />
              SALVAR RECEITA
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: DESPESAS */}
      {activeTab === 'despesas' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingDown size={16} className="text-rose-400" />
                Custos e Despesas Operacionais do Evento
              </h3>
              <button
                onClick={() => setShowAddExpense(!showAddExpense)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
              >
                <Plus size={14} />
                Adicionar Despesa
              </button>
            </div>

            {showAddExpense && (
              <form onSubmit={handleSaveExpense} className="p-4 bg-slate-100 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Fornecedor / Credor</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Palco & Estruturas"
                      value={newExpSupplier}
                      onChange={e => setNewExpSupplier(e.target.value)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Categoria</label>
                    <select
                      value={newExpCategory}
                      onChange={e => setNewExpCategory(e.target.value)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                    >
                      <option value="Som & Luz">Som & Luz</option>
                      <option value="Segurança">Segurança</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Catering">Catering</option>
                      <option value="Locação">Locação</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Ex: 5000.00"
                      value={newExpVal}
                      onChange={e => setNewExpVal(e.target.value)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Data Vencimento</label>
                    <input
                      type="date"
                      required
                      value={newExpDate}
                      onChange={e => setNewExpDate(e.target.value)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded-lg font-bold"
                  >
                    Salvar Despesa
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/20 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Fornecedor / Credor</th>
                    <th className="py-2.5 px-3">Categoria</th>
                    <th className="py-2.5 px-3">Vencimento</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Valor Pactuado</th>
                    <th className="py-2.5 px-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-700">
                  {despesas.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-100">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{d.fornecedor}</td>
                      <td className="py-2.5 px-3 text-slate-500">{d.categoria}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{d.data}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${d.status === 'Pago' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-rose-400">{formatMoney(d.valor)}</td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => setDespesas(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Remover"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-200">
                    <td colSpan={4} className="py-3 px-3 text-right uppercase text-xs">Total de Despesas:</td>
                    <td className="py-3 px-3 text-right font-mono text-rose-400 text-sm">{formatMoney(totalDespesas)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PATROCÍNIO */}
      {activeTab === 'patrocinio' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />
                Contratos de Patrocínio & Marcas Parceiras
              </h3>
              <button
                onClick={() => setShowAddSponsor(!showAddSponsor)}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
              >
                <Plus size={14} />
                Novo Patrocínio
              </button>
            </div>

            {showAddSponsor && (
              <form onSubmit={handleSaveSponsor} className="p-4 bg-slate-100 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Marca / Patrocinador</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Bebidas do Sul"
                      value={newSponsName}
                      onChange={e => setNewSponsName(e.target.value)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Cota / Categoria</label>
                    <select
                      value={newSponsTier}
                      onChange={e => setNewSponsTier(e.target.value)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                    >
                      <option value="Master">Cota Master (Apresenta)</option>
                      <option value="Gold">Cota Ouro (Patrocínio)</option>
                      <option value="Silver">Cota Prata (Apoio)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Valor do Contrato (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Ex: 25000.00"
                      value={newSponsVal}
                      onChange={e => setNewSponsVal(e.target.value)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSponsor(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded-lg font-bold"
                  >
                    Salvar Patrocínio
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/20 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Marca / Patrocinador</th>
                    <th className="py-2.5 px-3">Cota / Categoria</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Valor do Contrato</th>
                    <th className="py-2.5 px-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-700">
                  {patrocinios.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-100">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{p.marca}</td>
                      <td className="py-2.5 px-3 text-amber-300 font-medium">{p.categoria}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-emerald-400">{formatMoney(p.valor)}</td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => setPatrocinios(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Remover"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-200">
                    <td colSpan={3} className="py-3 px-3 text-right uppercase text-xs">Total de Patrocínios:</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">{formatMoney(totalPatrocinio)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADVANCED */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          {/* Negociação de Adiantamento */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
              Parcelas de Adiantamento (Advanced)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/20 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3 text-center">Nº Parcela</th>
                    <th className="py-2.5 px-3 text-center">Valor Acordado</th>
                    <th className="py-2.5 px-3 text-center">Valor Pago</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Data Prevista</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-700">
                  {advancedInstallments.map((inst, i) => (
                    <tr key={i} className="hover:bg-slate-100">
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-sky-400">#{inst.numero}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{formatMoney(inst.valor)}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">{formatMoney(inst.valor_pago)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${inst.status === 1 ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                          {inst.status === 1 ? 'PAGO' : 'AGUARDANDO'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">{inst.data}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          disabled={inst.status === 1}
                          onClick={() => handlePayInstallment(i)}
                          className={`text-xs font-bold px-3 py-1 rounded-md transition ${
                            inst.status === 1
                              ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-slate-900'
                          }`}
                        >
                          {inst.status === 1 ? 'Liquidado' : 'Pagar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Divisão Tributária por Setor (disk_area_taxes) */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers size={15} className="text-indigo-400" />
                Divisão Tributária e Tarifária por Setores (disk_area_taxes)
              </h3>
              <span className="text-[11px] bg-indigo-950/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800/40 font-mono">
                Regras por Setor
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/20 text-slate-500 font-semibold">
                    <th className="py-2 px-3">Setor (Área)</th>
                    <th className="py-2 px-3">Canal (Forma de Vendas)</th>
                    <th className="py-2 px-3 text-center">Taxa de Conveniência (Tax)</th>
                    <th className="py-2 px-3 text-center">Comissão (Commission)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-700">
                  <tr className="hover:bg-slate-100">
                    <td className="py-2 px-3 font-semibold text-slate-900">Pista Premium</td>
                    <td className="py-2 px-3 text-slate-500">Site / App DiskIngressos</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-indigo-400">15.0 %</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-indigo-400">10.0 %</td>
                  </tr>
                  <tr className="hover:bg-slate-100">
                    <td className="py-2 px-3 font-semibold text-slate-900">Camarote VIP</td>
                    <td className="py-2 px-3 text-slate-500">PDV Físico / Quiosque</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-indigo-400">10.0 %</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-indigo-400">8.0 %</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INFORMAÇÕES FINANCEIRAS & DRE */}
      {activeTab === 'informacoes' && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Receita de Ingressos (Bruta)</span>
              <h4 className="text-base font-black text-slate-900 mt-1 font-mono">{formatMoney(totalReceitaBruta)}</h4>
            </div>
            <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Receita de Patrocínios</span>
              <h4 className="text-base font-black text-emerald-400 mt-1 font-mono">{formatMoney(totalPatrocinio)}</h4>
            </div>
            <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Total de Custos & Despesas</span>
              <h4 className="text-base font-black text-rose-400 mt-1 font-mono">{formatMoney(totalDespesas)}</h4>
            </div>
            <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Taxas de Operadoras (MDR)</span>
              <h4 className="text-base font-black text-amber-400 mt-1 font-mono">{formatMoney(totalTaxasOperadoras)}</h4>
            </div>
            <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Taxas de Serviço (Conveniência)</span>
              <h4 className="text-base font-black text-cyan-400 mt-1 font-mono">{formatMoney(totalTaxasServico)}</h4>
            </div>
            <div className="bg-gradient-to-r from-emerald-900/80 to-emerald-800/80 border border-emerald-700/60 p-3.5 rounded-xl text-slate-900">
              <span className="text-emerald-200 block text-[10px] uppercase font-bold">Resultado Líquido do Evento</span>
              <h4 className="text-lg font-black text-slate-900 mt-1 font-mono">{formatMoney(resultadoLiquidoFinal)}</h4>
            </div>
          </div>

          {/* DRE Progress Card */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <FileText size={16} className="text-sky-400" />
              Visão de Resultado Econômico (DRE do Evento)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Receitas Totais (Ingressos + Patrocínios)</span>
                  <span className="font-mono font-bold text-emerald-400">{formatMoney(resultadoEconomicoReceitas)}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Custos & Taxas Totais (Despesas + MDR + Conveniência)</span>
                  <span className="font-mono font-bold text-rose-400">{formatMoney(resultadoEconomicoCustos)}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, Math.round(ratioCustos))}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
