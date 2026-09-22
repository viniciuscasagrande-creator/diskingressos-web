import { useMemo, useState } from 'react'
import {
  ArrowLeft, CalendarClock, MoreHorizontal, Plus, Search,
  Ticket, Trash2, CheckCircle2, AlertCircle, Sparkles, Layers,
  Calendar, MapPin
} from 'lucide-react'
import type { EventItem } from '../data/events'
import { LimitlessPage } from '../integrations/limitless/LimitlessPage'
import {
  DiskPageHeader,
  DiskKpiCard,
  DiskCard,
  DiskCardHeader,
  DiskCardBody
} from '../components/ui/disk'

type Lot = {
  id: number
  name: string
  type: string
  price: number
  qty: number
  sold: number
  start: string
  end: string
  status: 'ativo' | 'agendado' | 'encerrado'
}

const initialLots: Lot[] = [
  { id: 1, name: '1º Lote - Pista', type: 'Inteira', price: 120, qty: 500, sold: 318, start: '01/10/2026', end: '15/12/2026', status: 'ativo' },
  { id: 2, name: '1º Lote - Pista', type: 'Meia', price: 60, qty: 300, sold: 180, start: '01/10/2026', end: '15/12/2026', status: 'ativo' },
  { id: 3, name: '2º Lote - Pista', type: 'Inteira', price: 150, qty: 700, sold: 0, start: '16/12/2026', end: '28/02/2027', status: 'agendado' },
]

type Props = {
  events: EventItem[]
  selectedEvent: EventItem | null
  onSelect: (event: EventItem) => void
  onBack: () => void
}

export default function LotsPage({ events, selectedEvent, onSelect, onBack }: Props) {
  const event = selectedEvent || events[0]
  const [lots, setLots] = useState(initialLots)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState({ name: '', type: 'Inteira', price: '', qty: '', start: '', end: '' })

  const filtered = useMemo(
    () => lots.filter(l => `${l.name} ${l.type}`.toLowerCase().includes(search.toLowerCase())),
    [lots, search]
  )

  const totalQty = lots.reduce((s, l) => s + l.qty, 0)
  const sold = lots.reduce((s, l) => s + l.sold, 0)

  const addLot = () => {
    if (!draft.name || !draft.price || !draft.qty) return
    setLots(prev => [
      ...prev,
      {
        id: Date.now(),
        name: draft.name,
        type: draft.type,
        price: Number(draft.price),
        qty: Number(draft.qty),
        sold: 0,
        start: draft.start || 'A definir',
        end: draft.end || 'A definir',
        status: 'agendado'
      }
    ])
    setDraft({ name: '', type: 'Inteira', price: '', qty: '', start: '', end: '' })
    setShowForm(false)
  }

  return (
    <LimitlessPage className="space-y-2 w-full max-w-none">
      {/* 1. Header Canônico Limitless V7 */}
      <DiskPageHeader
        title="Lotes & Ingressos"
        subtitle="Defina preços, lotes, capacidade de público e períodos de vigência do evento"
        breadcrumbs={['DiskIngressos', 'Eventos', event?.title || 'Evento', 'Lotes']}
        badge={`${lots.length} Lotes`}
        badgeTone="primary"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition cursor-pointer"
              title="Voltar para eventos"
            >
              <ArrowLeft size={14} className="text-cyan-400" />
              <span>Voltar a Eventos</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition cursor-pointer shadow-sm"
              onClick={() => setShowForm(true)}
            >
              <Plus size={14} />
              <span>Novo Lote</span>
            </button>
          </div>
        }
      />

      {/* 2. Cartão de Contexto do Evento Selecionado */}
      <DiskCard>
        <DiskCardBody className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center font-black">
              <Ticket size={20} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Evento Selecionado</span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">{event?.title || 'Nenhum evento'}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1"><MapPin size={12} /> {event?.venue}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> {event?.date}</span>
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Trocar Evento:</label>
            <select
              value={event?.id || ''}
              onChange={e => {
                const found = events.find(x => x.id === Number(e.target.value))
                if (found) onSelect(found)
              }}
              className="w-full sm:w-64 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
            >
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>
        </DiskCardBody>
      </DiskCard>

      {/* 3. Strip de KPIs dos Lotes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DiskKpiCard
          icon={<Layers size={20} />}
          label="Lotes Cadastrados"
          value={lots.length}
          note="Configuração ativa"
          accent="info"
        />
        <DiskKpiCard
          icon={<Ticket size={20} />}
          label="Ingressos Configurados"
          value={totalQty.toLocaleString('pt-BR')}
          note="Carga total autorizada"
          accent="purple"
        />
        <DiskKpiCard
          icon={<CheckCircle2 size={20} />}
          label="Ingressos Vendidos"
          value={sold.toLocaleString('pt-BR')}
          note={`${Math.round((sold / Math.max(totalQty, 1)) * 100)}% da capacidade`}
          accent="success"
        />
        <DiskKpiCard
          icon={<Sparkles size={20} />}
          label="Disponibilidade"
          value={Math.max(0, totalQty - sold).toLocaleString('pt-BR')}
          note="Saldo restante para venda"
          accent="warning"
        />
      </div>

      {/* 4. Formulário Inline de Criação de Lote */}
      {showForm && (
        <DiskCard className="border-sky-500/40 shadow-md">
          <DiskCardHeader
            title="Novo Lote de Ingressos"
            subtitle="Preencha as diretrizes comerciais para abertura de vendas"
            action={
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            }
          />
          <DiskCardBody className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Lote</label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={e => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Ex.: 3º Lote - Pista Premium"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Ingresso</label>
                <select
                  value={draft.type}
                  onChange={e => setDraft({ ...draft, type: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option>Inteira</option>
                  <option>Meia</option>
                  <option>VIP</option>
                  <option>Cortesia</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Preço Unitário (R$)</label>
                <input
                  type="number"
                  value={draft.price}
                  onChange={e => setDraft({ ...draft, price: e.target.value })}
                  placeholder="0,00"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantidade de Ingressos</label>
                <input
                  type="number"
                  value={draft.qty}
                  onChange={e => setDraft({ ...draft, qty: e.target.value })}
                  placeholder="Ex.: 500"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data Início</label>
                <input
                  type="text"
                  value={draft.start}
                  onChange={e => setDraft({ ...draft, start: e.target.value })}
                  placeholder="DD/MM/AAAA"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data Fim</label>
                <input
                  type="text"
                  value={draft.end}
                  onChange={e => setDraft({ ...draft, end: e.target.value })}
                  placeholder="DD/MM/AAAA"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-1.5 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition cursor-pointer shadow-xs"
                onClick={addLot}
              >
                Salvar Lote
              </button>
            </div>
          </DiskCardBody>
        </DiskCard>
      )}

      {/* 5. Tabela de Lotes Cadastrados */}
      <DiskCard>
        <DiskCardHeader
          title="Lotes Cadastrados"
          subtitle={`Controle comercial e status do lote para ${event?.title || 'o evento'}`}
          action={
            <div className="relative w-48 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar lote ou tipo..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
              />
            </div>
          }
        />
        <DiskCardBody className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Lote & Tipo</th>
                <th className="px-4 py-3">Preço Unitário</th>
                <th className="px-4 py-3">Carga Total</th>
                <th className="px-4 py-3">Vendidos (Progresso)</th>
                <th className="px-4 py-3">Período de Vendas</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map(l => {
                const pct = l.qty > 0 ? Math.min(100, Math.round((l.sold / l.qty) * 100)) : 0
                return (
                  <tr key={l.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                          <Ticket size={16} />
                        </div>
                        <div>
                          <strong className="text-slate-900 dark:text-slate-100 block">{l.name}</strong>
                          <span className="text-[11px] text-slate-400">{l.type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                      {l.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                      {l.qty.toLocaleString('pt-BR')} un
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{l.sold} un</span>
                          <span className="text-slate-400">{pct}%</span>
                        </div>
                        <div className="w-28 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1.5 text-[11px]">
                        <CalendarClock size={13} className="text-slate-400" />
                        <span>{l.start} → {l.end}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.status === 'ativo'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                          : l.status === 'agendado'
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {l.status === 'ativo' ? 'Ativo' : l.status === 'agendado' ? 'Agendado' : 'Encerrado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setLots(prev => prev.filter(x => x.id !== l.id))}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Excluir Lote"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </DiskCardBody>
      </DiskCard>
    </LimitlessPage>
  )
}
