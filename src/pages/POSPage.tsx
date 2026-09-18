import { useMemo, useState } from 'react'
import {
  CreditCard, MonitorSmartphone, ReceiptText, CircleDollarSign,
  Wifi, WifiOff, ShoppingCart, Search, SlidersHorizontal, Printer,
  CheckCircle2, Clock3, Banknote, Smartphone, XCircle, LockKeyhole,
  RotateCcw, ArrowLeft, RefreshCw, Zap, Store
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

type Tab = 'overview' | 'terminals' | 'sales' | 'closing'
type Props = {
  events: EventItem[]
  initialTab?: Tab
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

type Terminal = {
  id: string
  name: string
  event: string
  operator: string
  status: 'online' | 'offline'
  battery: number
  lastSync: string
  sales: number
  total: number
}

type Sale = {
  id: string
  time: string
  terminal: string
  event: string
  item: string
  payment: 'Crédito' | 'Débito' | 'Pix' | 'Dinheiro'
  status: 'Aprovada' | 'Cancelada' | 'Pendente'
  value: number
}

const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const terminalSeed: Terminal[] = [
  { id: 'POS-001', name: 'Bilheteria Principal', event: 'SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA', operator: 'Ana Martins', status: 'online', battery: 92, lastSync: 'Agora', sales: 184, total: 28460 },
  { id: 'POS-002', name: 'Portão Norte', event: 'IRON MAIDEN', operator: 'Carlos Souza', status: 'online', battery: 76, lastSync: 'Há 1 min', sales: 132, total: 21680 },
  { id: 'POS-003', name: 'Bilheteria VIP', event: 'Conferência Nacional', operator: 'Marina Alves', status: 'online', battery: 64, lastSync: 'Há 2 min', sales: 96, total: 15480 },
  { id: 'POS-004', name: 'Caixa Externo', event: 'SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA', operator: 'Paulo Lima', status: 'offline', battery: 18, lastSync: 'Há 38 min', sales: 41, total: 6120 },
]

const salesSeed: Sale[] = [
  { id: '#PDV-92841', time: '16:48', terminal: 'POS-001', event: 'SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA', item: 'Ingresso Inteira', payment: 'Crédito', status: 'Aprovada', value: 180 },
  { id: '#PDV-92840', time: '16:45', terminal: 'POS-002', event: 'IRON MAIDEN', item: 'Pista Premium', payment: 'Pix', status: 'Aprovada', value: 350 },
  { id: '#PDV-92839', time: '16:42', terminal: 'POS-003', event: 'Conferência Nacional', item: 'Lote 2', payment: 'Débito', status: 'Aprovada', value: 220 },
  { id: '#PDV-92838', time: '16:39', terminal: 'POS-001', event: 'SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA', item: 'Meia Entrada', payment: 'Dinheiro', status: 'Aprovada', value: 90 },
  { id: '#PDV-92837', time: '16:31', terminal: 'POS-004', event: 'SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA', item: 'Ingresso Inteira', payment: 'Crédito', status: 'Cancelada', value: 180 },
]

export default function POSPage({ events, initialTab = 'overview', notify, onNavigate }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [terminals, setTerminals] = useState<Terminal[]>(terminalSeed)
  const [sales, setSales] = useState<Sale[]>(salesSeed)
  const [query, setQuery] = useState('')
  const [eventFilter, setEventFilter] = useState('Todos')
  const [closingDone, setClosingDone] = useState(false)

  const approved = sales.filter(s => s.status === 'Aprovada')
  const total = approved.reduce((a, b) => a + b.value, 0)
  const online = terminals.filter(t => t.status === 'online').length

  const paymentTotals = useMemo(
    () => approved.reduce<Record<string, number>>((acc, s) => {
      acc[s.payment] = (acc[s.payment] || 0) + s.value
      return acc
    }, {}),
    [sales]
  )

  const filteredSales = sales.filter(s =>
    (eventFilter === 'Todos' || s.event === eventFilter) &&
    (`${s.id} ${s.terminal} ${s.event} ${s.item}`.toLowerCase().includes(query.toLowerCase()))
  )

  const simulateSale = () => {
    const sale: Sale = {
      id: `#PDV-${92842 + sales.length}`,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      terminal: 'POS-001',
      event: events[0]?.title || 'Evento Presencial',
      item: 'Ingresso Inteira',
      payment: 'Pix',
      status: 'Aprovada',
      value: 180
    }
    setSales(v => [sale, ...v])
    notify('Venda presencial simulada com sucesso.')
  }

  const toggleTerminal = (id: string) => {
    setTerminals(t => t.map(x => x.id === id ? { ...x, status: x.status === 'online' ? 'offline' : 'online', lastSync: 'Agora' } : x))
    notify('Status do terminal atualizado.')
  }

  const tabs: [Tab, string][] = [
    ['overview', 'Visão Geral'],
    ['terminals', `Terminais (${online}/${terminals.length})`],
    ['sales', `Vendas Presenciais (${filteredSales.length})`],
    ['closing', 'Fechamento de Caixa']
  ]

  return (
    <LimitlessPage className="p-4 md:p-6 space-y-6">
      {/* 1. Header Canônico Limitless V7 */}
      <DiskPageHeader
        title="Terminais & Ponto de Venda (PDV)"
        subtitle="Controle de terminais presenciais, sincronização de maquininhas e fechamento de caixa"
        breadcrumbs={['DiskIngressos', 'Operação Presencial', 'PDV & Terminais']}
        badge={`${online} Terminais Online`}
        badgeTone={online > 0 ? 'success' : 'danger'}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('profile-dashboard')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition cursor-pointer"
                title="Voltar ao Painel Principal"
              >
                <ArrowLeft size={14} className="text-cyan-400" />
                <span>Painel</span>
              </button>
            )}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition cursor-pointer"
              onClick={() => notify('Sincronização solicitada para todos os terminais.')}
            >
              <RotateCcw size={14} className="text-slate-400" />
              <span>Sincronizar</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition cursor-pointer shadow-sm"
              onClick={simulateSale}
            >
              <ShoppingCart size={14} />
              <span>Nova Venda PDV</span>
            </button>
          </div>
        }
      />

      {/* 2. Barra de Navegação por Abas */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap ${
              tab === key
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 3. Conteúdo por Aba */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DiskKpiCard
              icon={<CircleDollarSign size={20} />}
              label="Vendas Hoje"
              value={money(total)}
              note={`${approved.length} transações aprovadas`}
              accent="info"
            />
            <DiskKpiCard
              icon={<MonitorSmartphone size={20} />}
              label="Terminais Online"
              value={`${online}/${terminals.length}`}
              note={`${Math.round((online / terminals.length) * 100)}% disponíveis`}
              accent="success"
            />
            <DiskKpiCard
              icon={<ReceiptText size={20} />}
              label="Ticket Médio"
              value={money(total / Math.max(approved.length, 1))}
              note="Venda presencial balcão"
              accent="purple"
            />
            <DiskKpiCard
              icon={<Clock3 size={20} />}
              label="Última Sincronização"
              value="Agora"
              note={`${terminals.length} terminais ativos`}
              accent="warning"
            />
          </div>

          {/* Grids de Terminais e Meios de Pagamento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Terminais em operação */}
            <DiskCard>
              <DiskCardHeader
                title="Terminais em Operação"
                subtitle="Status em tempo real das maquininhas físicas"
                action={
                  <button
                    type="button"
                    onClick={() => setTab('terminals')}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 cursor-pointer"
                  >
                    Ver todos →
                  </button>
                }
              />
              <DiskCardBody className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {terminals.map(t => (
                    <div key={t.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${t.status === 'online' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'}`}>
                          {t.status === 'online' ? <Wifi size={18} /> : <WifiOff size={18} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{t.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.id} · {t.operator}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-900 dark:text-slate-100">{money(t.total)}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.sales} vendas</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'online' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400'}`}>
                        {t.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  ))}
                </div>
              </DiskCardBody>
            </DiskCard>

            {/* Meios de Pagamento */}
            <DiskCard>
              <DiskCardHeader
                title="Meios de Pagamento"
                subtitle="Distribuição de faturamento por método nas maquininhas"
              />
              <DiskCardBody className="p-4 space-y-4">
                {(['Crédito', 'Pix', 'Débito', 'Dinheiro'] as const).map(p => {
                  const v = paymentTotals[p] || 0
                  const pct = total ? Math.round((v / total) * 100) : 0
                  return (
                    <div key={p} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {p === 'Pix' ? <Smartphone size={14} className="text-teal-500" /> : p === 'Dinheiro' ? <Banknote size={14} className="text-emerald-500" /> : <CreditCard size={14} className="text-sky-500" />}
                          <span className="font-bold text-slate-800 dark:text-slate-200">{p}</span>
                          <span className="text-slate-400 text-[11px]">({pct}% do total)</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{money(v)}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            p === 'Pix' ? 'bg-teal-500' : p === 'Dinheiro' ? 'bg-emerald-500' : p === 'Crédito' ? 'bg-sky-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </DiskCardBody>
            </DiskCard>
          </div>

          {/* Últimas vendas presenciais */}
          <DiskCard>
            <DiskCardHeader
              title="Últimas Vendas Presenciais"
              subtitle="Transações mais recentes processadas nos caixas físicos"
              action={
                <button
                  type="button"
                  onClick={() => setTab('sales')}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 cursor-pointer"
                >
                  Ver histórico completo →
                </button>
              }
            />
            <DiskCardBody className="p-0 overflow-x-auto">
              <SalesTable rows={sales.slice(0, 5)} />
            </DiskCardBody>
          </DiskCard>
        </div>
      )}

      {tab === 'terminals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {terminals.map(t => (
              <DiskCard key={t.id} className="relative overflow-hidden">
                <div className={`h-1 w-full ${t.status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <DiskCardBody className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-md ${t.status === 'online' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'}`}>
                        {t.status === 'online' ? <Wifi size={14} /> : <WifiOff size={14} />}
                      </span>
                      <span className="text-[10px] font-black uppercase text-slate-400">{t.id}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'online' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'}`}>
                      {t.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">{t.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.event}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Operador</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{t.operator}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Bateria</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{t.battery}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Vendas</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{t.sales} un</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{money(t.total)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400">Sync: {t.lastSync}</span>
                    <button
                      type="button"
                      onClick={() => toggleTerminal(t.id)}
                      className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
                        t.status === 'online'
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                      }`}
                    >
                      {t.status === 'online' ? 'Desconectar' : 'Reconectar'}
                    </button>
                  </div>
                </DiskCardBody>
              </DiskCard>
            ))}
          </div>
        </div>
      )}

      {tab === 'sales' && (
        <div className="space-y-4">
          <DiskCard>
            <DiskCardBody className="p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Buscar pedido, terminal, item..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <select
                  value={eventFilter}
                  onChange={e => setEventFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
                >
                  <option>Todos</option>
                  {events.map(e => (
                    <option key={e.id} value={e.title}>{e.title}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                  onClick={() => notify('Exportando relatório de vendas presenciais...')}
                >
                  <Printer size={14} />
                  <span>Exportar</span>
                </button>
              </div>
            </DiskCardBody>
          </DiskCard>

          <DiskCard>
            <DiskCardHeader
              title="Transações Presenciais"
              subtitle={`${filteredSales.length} transações localizadas • Total aprovado: ${money(filteredSales.filter(s => s.status === 'Aprovada').reduce((a, b) => a + b.value, 0))}`}
            />
            <DiskCardBody className="p-0 overflow-x-auto">
              <SalesTable rows={filteredSales} />
            </DiskCardBody>
          </DiskCard>
        </div>
      )}

      {tab === 'closing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DiskCard>
              <DiskCardHeader
                title="Fechamento de Caixa do Turno"
                subtitle="Consolidação e conferência dos terminais para envio contábil"
                action={
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${closingDone ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'}`}>
                    {closingDone ? 'Caixa Fechado' : 'Em Aberto'}
                  </span>
                }
              />
              <DiskCardBody className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Início do Turno</span>
                    <strong className="text-slate-900 dark:text-slate-100">26/08/2026 · 09:00</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Operadores</span>
                    <strong className="text-slate-900 dark:text-slate-100">4 operadores</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Transações</span>
                    <strong className="text-slate-900 dark:text-slate-100">{sales.length} un</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Total Vendido</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{money(total)}</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Totalizadores por Meio de Pagamento</h4>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {Object.entries(paymentTotals).map(([p, v]) => (
                      <div key={p} className="py-2.5 flex items-center justify-between">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{p}</span>
                        <strong className="text-slate-900 dark:text-slate-100">{money(v)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Valor Esperado em Caixa</span>
                    <strong className="text-xl font-black text-emerald-400">{money(total)}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                      onClick={() => notify('Prévia do fechamento impressa com sucesso.')}
                    >
                      Imprimir Prévia
                    </button>
                    <button
                      type="button"
                      disabled={closingDone}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 transition cursor-pointer flex items-center gap-1.5"
                      onClick={() => {
                        setClosingDone(true)
                        notify('Caixa fechado e transmitido ao módulo Financeiro com sucesso.')
                      }}
                    >
                      <CheckCircle2 size={15} />
                      <span>{closingDone ? 'Caixa Fechado' : 'Confirmar Fechamento'}</span>
                    </button>
                  </div>
                </div>
              </DiskCardBody>
            </DiskCard>
          </div>

          <div>
            <DiskCard>
              <DiskCardHeader
                title="Conciliação Rápida"
                subtitle="Validação em tempo real"
              />
              <DiskCardBody className="p-4 space-y-4 text-xs">
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Operação Conciliada</strong>
                    <span className="text-[11px] leading-tight block">Os valores dos terminais conferem rigorosamente com os registros contábeis.</span>
                  </div>
                </div>

                <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-slate-500">Vendas Aprovadas</span>
                    <strong className="text-slate-800 dark:text-slate-200">{approved.length}</strong>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-slate-500">Canceladas</span>
                    <strong className="text-slate-800 dark:text-slate-200">{sales.filter(s => s.status === 'Cancelada').length}</strong>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-slate-500">Pendentes</span>
                    <strong className="text-slate-800 dark:text-slate-200">{sales.filter(s => s.status === 'Pendente').length}</strong>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-slate-500">Divergência de Caixa</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">R$ 0,00</strong>
                  </div>
                </div>
              </DiskCardBody>
            </DiskCard>
          </div>
        </div>
      )}
    </LimitlessPage>
  )
}

function SalesTable({ rows }: { rows: Sale[] }) {
  return (
    <table className="w-full text-xs text-left text-slate-700 dark:text-slate-300">
      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
        <tr>
          <th className="px-4 py-3">Pedido</th>
          <th className="px-4 py-3">Horário</th>
          <th className="px-4 py-3">Terminal</th>
          <th className="px-4 py-3">Evento / Item</th>
          <th className="px-4 py-3">Pagamento</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3 text-right">Valor</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {rows.map(s => (
          <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
            <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">{s.id}</td>
            <td className="px-4 py-3 text-slate-500">{s.time}</td>
            <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{s.terminal}</td>
            <td className="px-4 py-3">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">{s.event}</span>
              <span className="text-[11px] text-slate-400">{s.item}</span>
            </td>
            <td className="px-4 py-3 font-medium">{s.payment}</td>
            <td className="px-4 py-3">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                s.status === 'Aprovada'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                  : s.status === 'Cancelada'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
              }`}>
                {s.status === 'Aprovada' ? <CheckCircle2 size={11} /> : s.status === 'Cancelada' ? <XCircle size={11} /> : <Clock3 size={11} />}
                <span>{s.status}</span>
              </span>
            </td>
            <td className={`px-4 py-3 text-right font-bold ${s.status === 'Cancelada' ? 'text-rose-600 dark:text-rose-400 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
              {money(s.value)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
