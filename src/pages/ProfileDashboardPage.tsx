import { useState } from 'react'
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CalendarRange,
  CreditCard,
  Download,
  Headphones,
  LayoutGrid,
  MapPin,
  Megaphone,
  MonitorSmartphone,
  ShieldCheck,
  Ticket,
  TrendingUp,
  TrendingDown,
  Users,
  WalletCards
} from 'lucide-react'
import { canAccess, roleLabel, type AppUser, type Producer } from '../auth/model'
import type { EventItem } from '../data/events'
import type { Participant } from '../data/participants'
import type { PageKey } from '../components/ModuleSidebar'

type Props = {
  user: AppUser
  producer?: Producer
  events: EventItem[]
  participants: Participant[]
  onNavigate: (page: PageKey) => void
}

type Shortcut = {
  label: string
  description: string
  page: PageKey
  icon: any
  area: 'events' | 'finance' | 'pos' | 'admin' | 'marketing' | 'remarketing' | 'sac'
}

const shortcuts: Shortcut[] = [
  { label: 'Meus Eventos', description: 'Acesse os eventos disponíveis para sua conta.', page: 'events', icon: CalendarDays, area: 'events' },
  { label: 'Dashboard Financeiro', description: 'Saldo consolidado, vendas, repasses e extratos.', page: 'finance-dashboard', icon: WalletCards, area: 'finance' },
  { label: 'Terminais POS', description: 'Operação presencial e fechamento de caixa.', page: 'pos', icon: MonitorSmartphone, area: 'pos' },
  { label: 'Marketing', description: 'Campanhas, pixels, links e automações.', page: 'marketing-dashboard', icon: Megaphone, area: 'marketing' },
  { label: 'Atendimento / SAC', description: 'Chamados, SLA e operação de suporte.', page: 'sac-hub', icon: Headphones, area: 'sac' },
  { label: 'Contabilidade', description: 'Plano de contas, lançamentos e fechamento.', page: 'accounting-dashboard', icon: CreditCard, area: 'finance' },
  { label: 'Administração', description: 'Usuários, permissões e segurança.', page: 'admin-hub', icon: ShieldCheck, area: 'admin' },
]

export default function ProfileDashboardPage({ user, producer, events, participants, onNavigate }: Props) {
  const [periodFilter, setPeriodFilter] = useState('30d')
  const activeEvents = events.filter(e => e.status === 'ativo').length
  const totalSalesCount = events.reduce((sum, e) => sum + (e.sales || 0), 0)
  const checkedIn = participants.filter(p => p.checkin === 'presente').length
  const allowed = shortcuts.filter(s => canAccess(user, s.area))

  const roleMessage = user.role === 'producer-finance'
    ? 'Seu acesso está direcionado às operações financeiras da produtora.'
    : user.role === 'producer-marketing'
    ? 'Seu acesso está direcionado a Marketing, Remarketing e análise dos seus eventos.'
    : user.role === 'producer-operation'
    ? 'Seu acesso está direcionado à operação dos eventos, participantes, check-in, POS e SAC.'
    : user.role === 'viewer'
    ? 'Seu perfil é somente leitura. As informações disponíveis respeitam as permissões da sua produtora.'
    : 'Você tem acesso administrativo à sua produtora e aos módulos liberados para sua conta.'

  // Estatísticas executivas harmonizadas
  const stats = [
    {
      label: 'Ingressos vendidos',
      value: totalSalesCount > 0 ? totalSalesCount.toLocaleString('pt-BR') : '18.4k',
      change: '+12.4%',
      trend: 'up',
      tone: 'blue'
    },
    {
      label: 'Receita líquida',
      value: totalSalesCount > 0 ? `R$ ${(totalSalesCount * 85).toLocaleString('pt-BR')}` : 'R$ 184k',
      change: '+8.7%',
      trend: 'up',
      tone: 'green'
    },
    {
      label: 'Check-in médio',
      value: totalSalesCount > 0 && checkedIn > 0 ? `${Math.min(100, Math.round((checkedIn / totalSalesCount) * 100))}%` : '92%',
      change: '+3.1%',
      trend: 'up',
      tone: 'orange'
    },
    {
      label: 'Cancelamentos / Estornos',
      value: '1.8%',
      change: '-0.6%',
      trend: 'down',
      tone: 'orange'
    },
  ]

  const weeklyBars = [
    { day: 'Seg', height: 48, value: 'R$ 18.2k' },
    { day: 'Ter', height: 62, value: 'R$ 24.5k' },
    { day: 'Qua', height: 58, value: 'R$ 21.9k' },
    { day: 'Qui', height: 74, value: 'R$ 29.8k' },
    { day: 'Sex', height: 82, value: 'R$ 34.6k' },
    { day: 'Sáb', height: 96, value: 'R$ 42.8k' },
    { day: 'Dom', height: 76, value: 'R$ 31.4k' },
  ]

  const timeline = [
    { label: 'Faturamento de Ingressos', value: 'R$ 42.8k', percent: 76, color: 'bg-blue-500' },
    { label: 'Tráfego & Marketing', value: 'R$ 18.3k', percent: 58, color: 'bg-emerald-500' },
    { label: 'Operações & Bar', value: 'R$ 13.9k', percent: 43, color: 'bg-[#ff8047]' },
  ]

  const eventCards = events.length > 0 ? events.slice(0, 3).map((e, idx) => ({
    name: e.title,
    date: e.date || '04/10 · 20h',
    location: `${e.venue} · ${e.city}`,
    seats: `${(e.sales || 0).toLocaleString('pt-BR')} / ${((e.sales || 0) + (e.available || 500)).toLocaleString('pt-BR')}`,
    status: e.status === 'ativo' ? 'Ativo' : 'Encerrado',
    accent: idx === 0 ? 'blue' : idx === 1 ? 'green' : 'orange',
    progress: `${Math.min(96, Math.max(25, Math.round(((e.sales || 0) / Math.max(1, (e.sales || 0) + (e.available || 500))) * 100)))}%`
  })) : [
    { name: 'Sunset Beats Curitiba', date: '28 set · 20h', location: 'Pedreira Paulo Leminski', seats: '1.240 / 1.600', status: 'Vendido', accent: 'blue', progress: '76%' },
    { name: 'Festival Disk Verão 2027', date: '12 out · 09h', location: 'Live Curitiba', seats: '780 / 1.200', status: 'Quase cheio', accent: 'green', progress: '68%' },
    { name: 'Rock Experience Curitiba', date: '18 out · 18h', location: 'White Hall Jockey Eventos', seats: '520 / 900', status: 'Em alta', accent: 'orange', progress: '63%' },
  ]

  const sales = [
    { event: 'Festival Disk Verão 2027', category: 'Show', sold: '3.280', revenue: 'R$ 82.400,00', rate: '92%' },
    { event: 'Sunset Beats Curitiba', category: 'Eletrônico', sold: '1.910', revenue: 'R$ 38.100,00', rate: '88%' },
    { event: 'Rock Experience Curitiba', category: 'Festival', sold: '2.540', revenue: 'R$ 69.800,00', rate: '96%' },
    { event: 'Teatro Positivo Especial', category: 'Cultural', sold: '1.460', revenue: 'R$ 26.500,00', rate: '82%' },
  ]

  return (
    <div className="profile-dashboard space-y-2 w-full max-w-none">
      {/* 1. Hero do Perfil & Contexto da Produtora */}
      <section className="profile-hero">
        <div>
          <span className="eyebrow">PAINEL EXECUTIVO</span>
          <h2>Olá, {user.name.split(' ')[0]}</h2>
          <p>{roleMessage}</p>
        </div>
        <div className="profile-scope-card">
          <span>Contexto da Produtora</span>
          <strong>{producer?.name || 'DiskIngressos Produções'}</strong>
          <small>{roleLabel[user.role]}</small>
        </div>
      </section>

      {/* 2. 4 Cards de Métricas Principais com Tendência */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, change, trend, tone }) => (
          <article
            key={label}
            className={`stat-card stat-${tone} rounded-xl p-5 shadow-sm transition-all hover:scale-[1.01]`}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  tone === 'blue'
                    ? 'badge-blue'
                    : tone === 'green'
                    ? 'badge-green'
                    : 'badge-orange'
                }`}
              >
                {trend === 'up' ? '↗' : '↘'} {change}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {value}
              </h2>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  tone === 'blue'
                    ? 'badge-blue'
                    : tone === 'green'
                    ? 'badge-green'
                    : 'badge-orange'
                }`}
              >
                {trend === 'up' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* 3. Seção Dividida: Performance Semanal + Eventos em Destaque */}
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        {/* Gráfico Semanal de Receita Consolidada */}
        <article className="surface-card p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Performance</p>
              <h3 className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white">Receita Consolidada da Semana</h3>
            </div>
            <button
              onClick={() => onNavigate('finance-dashboard')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#ff8047] hover:bg-[#ff6c26] text-white px-3.5 py-2 text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Ver relatório financeiro
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-6 flex h-[200px] items-end justify-between gap-2 px-2 pt-6">
            {weeklyBars.map(({ day, height, value }) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {value}
                </span>
                <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 via-blue-500 to-[#ff8047] transition-all duration-300"
                    style={{ height: `${height * 1.8}px` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{day}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3 pt-3 border-t border-slate-100 dark:border-[#1e293b]">
            {timeline.map(({ label, value, percent, color }) => (
              <div key={label} className="subtle-card p-3.5">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
                  <span className="font-bold text-slate-800 dark:text-white tabular-nums">{value}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-2 rounded-full ${color}`} style={{ width: `${percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Eventos em Destaque */}
        <article className="surface-card p-5 flex flex-col justify-between">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Atividades</p>
                <h3 className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white">Eventos em Destaque</h3>
              </div>
              <button
                onClick={() => onNavigate('events')}
                className="text-xs font-bold text-[#ff8047] hover:underline cursor-pointer"
              >
                Ver todos ({events.length})
              </button>
            </div>

            <div className="space-y-3.5">
              {eventCards.map(({ name, date, location, seats, status, accent, progress }) => (
                <div
                  key={name}
                  onClick={() => onNavigate('events')}
                  className="subtle-card p-3.5 hover:border-slate-300 dark:hover:border-[#283548] transition cursor-pointer"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{name}</h4>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                        accent === 'blue'
                          ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                          : accent === 'green'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                          : 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-[#ff8047]'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>{location} · {date}</span>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Ingressos reservados</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{seats}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          accent === 'blue' ? 'bg-blue-500' : accent === 'green' ? 'bg-emerald-500' : 'bg-[#ff8047]'
                        }`}
                        style={{ width: progress }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      {/* 4. Tabela de Desempenho de Vendas por Evento */}
      <section className="surface-card p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Venda por Evento</p>
            <h3 className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white">Desempenho de Ingressos</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPeriodFilter('30d')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-[#283548] bg-slate-50 dark:bg-[#111721] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-[#1c2432]"
            >
              <CalendarRange className="h-3.5 w-3.5" />
              Últimos 30 dias
            </button>
            <button
              onClick={() => onNavigate('events')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-[#1f2736] hover:bg-slate-200 dark:hover:bg-[#283548] px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-white transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#283548] text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="pb-3">Evento</th>
                <th className="pb-3">Categoria</th>
                <th className="pb-3">Vendidos</th>
                <th className="pb-3">Receita Bruta</th>
                <th className="pb-3">Taxa de Conversão</th>
                <th className="pb-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1e293b]">
              {sales.map(({ event, category, sold, revenue, rate }) => (
                <tr key={event} className="hover:bg-slate-50/50 dark:hover:bg-[#1c2432]/50 transition">
                  <td className="py-3.5 font-bold text-slate-900 dark:text-white">{event}</td>
                  <td className="py-3.5 text-slate-600 dark:text-slate-400">{category}</td>
                  <td className="py-3.5 font-medium text-slate-700 dark:text-slate-300 tabular-nums">{sold}</td>
                  <td className="py-3.5 font-bold text-slate-900 dark:text-white tabular-nums">{revenue}</td>
                  <td className="py-3.5">
                    <span className="inline-flex rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {rate}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => onNavigate('events')}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-[#1e293b] hover:bg-slate-200 dark:hover:bg-[#283548] px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    >
                      Detalhes
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Atalhos Rápidos dos Módulos Liberados */}
      <section className="profile-section">
        <div className="profile-section-head">
          <div>
            <span className="eyebrow">ACESSOS LIBERADOS</span>
            <h3>Atalhos Operacionais do Perfil</h3>
          </div>
          <span className="role-chip">{roleLabel[user.role]}</span>
        </div>
        <div className="profile-shortcuts">
          {allowed.map(item => {
            const Icon = item.icon
            return (
              <button key={item.label} className="profile-shortcut" onClick={() => onNavigate(item.page)}>
                <span className="shortcut-icon"><Icon size={22} /></span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 6. Nota de Escopo e Segurança */}
      <section className="profile-access-note">
        <BarChart3 size={20} />
        <div>
          <strong>Escopo de Produtor Aplicado pelo Login</strong>
          <p>Os dados desta tela estão limitados à produtora vinculada à sua conta. O backend valida estritamente produtor, evento e permissão em cada transação via tokens JWT.</p>
        </div>
      </section>
    </div>
  )
}
