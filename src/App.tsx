import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Home, Megaphone, Menu, WalletCards } from 'lucide-react'
import Header from './components/Header'
import ModuleSidebar, { type ModuleKey, type PageKey } from './components/ModuleSidebar'
import EventContextSidebar from './components/EventContextSidebar'
import AppFooter from './components/AppFooter'
import ScrollTop from './components/ScrollTop'
import { events as seedEvents, type EventItem } from './data/events'
import { participants as seedParticipants, type Participant } from './data/participants'
import EventsPage from './pages/EventsPage'
import EventFormPage from './pages/EventFormPage'
import LotsPage from './pages/LotsPage'
import ParticipantsPage from './pages/ParticipantsPage'
import FacialPage from './pages/FacialPage'
import FinancePage from './pages/FinancePage'
import FinanceHubPage from './pages/FinanceHubPage'
import FinanceDashboardPage from './pages/FinanceDashboardPage'
import FinanceBalancesPage from './pages/FinanceBalancesPage'
import FinanceStatementPage from './pages/FinanceStatementPage'
import FinancePayoutsPage from './pages/FinancePayoutsPage'
import FinanceCashFlowPage from './pages/FinanceCashFlowPage'
import FinanceReceivablesPage from './pages/FinanceReceivablesPage'
import FinancePayablesPage from './pages/FinancePayablesPage'
import FinanceReconciliationPage from './pages/FinanceReconciliationPage'
import FinanceBankAccountsPage from './pages/FinanceBankAccountsPage'
import FinanceAdvancePage from './pages/FinanceAdvancePage'
import FinanceExpensesPage from './pages/FinanceExpensesPage'
import FinanceBorderoPage from './pages/FinanceBorderoPage'
import FinanceiroConsolidadoPage from './pages/FinanceiroConsolidadoPage'
import AccountingDashboardPage from './pages/AccountingDashboardPage'
import AccountingChartPage from './pages/AccountingChartPage'
import AccountingEntriesPage from './pages/AccountingEntriesPage'
import AccountingJournalPage from './pages/AccountingJournalPage'
import AccountingLedgerPage from './pages/AccountingLedgerPage'
import { SimuladorSpreadModule } from './pages/finance/SimuladorSpreadModule'
import { SplitFinanceiroModule } from './pages/finance/SplitFinanceiroModule'
import { GenericFinanceSubView } from './pages/finance/GenericFinanceSubView'
import FinanceAccountingHubPage from './pages/FinanceAccountingHubPage'
import ModulePlaceholder from './pages/ModulePlaceholder'
import POSPage from './pages/POSPage'
import LoginPage from './pages/LoginPage'
import UsersPage from './pages/UsersPage'
import AdminHubPage from './pages/AdminHubPage'
import ProducersPage from './pages/ProducersPage'
import PermissionsPage from './pages/PermissionsPage'
import AuditPage from './pages/AuditPage'
import SecurityPage from './pages/SecurityPage'
import OperationsPage from './pages/OperationsPage'
import MarketingPage from './pages/MarketingPage'
import RemarketingPage from './pages/RemarketingPage'
import SupportPage from './pages/SupportPage'
import CommunicationPage from './pages/CommunicationPage'
import EventContextPage from './pages/EventContextPage'
import GlobalDashboardPage from './pages/GlobalDashboardPage'
import ProfileDashboardPage from './pages/ProfileDashboardPage'
import { canAccess, isGlobalAdmin, producers as seedProducers, seedUsers, type AppUser } from './auth/model'
import { login as apiLogin, setApiToken, clearApiToken, hasStoredToken, getMe, getProducers, getUsers, getEvents } from './services/api'

const titleMap: Partial<Record<PageKey, string>> = {
  'profile-dashboard': 'Meu Dashboard',
  'global-dashboard': 'Visão Geral Administrativa',
  'events': 'Todos os Eventos',
  'operations': 'Núcleo Operacional',
  'new-event': 'Novo Evento',
  'edit-event': 'Editar Evento',
  'lots': 'Configurar Lotes',
  'participants': 'Participantes',
  'facial': 'Status Faciais',
  'event-dashboard': 'Dashboard do Evento',
  'event-tickets': 'Consultar Ingresso',
  'event-courtesy': 'Cortesias',
  'event-reports': 'Relatórios do Evento',
  'event-details': 'Detalhes do Evento',
  'event-pixel': 'Pixel GA',
  'event-utm': 'Central UTM & Conversões',
  'event-ga4': 'Analytics GA4',
  'event-traffic': 'Tráfego Site',
  'event-meta-ads': 'Campanhas Meta Ads',
  'event-remarketing': 'Remarketing',
  'event-users': 'Usuários do Evento',
  'event-audit': 'Logs do Evento',
  'event-permissions': 'Permissões do Evento',

  // FINANCEIRO
  'finance-dashboard': 'Dashboard Financeiro',
  'finance-hub': 'Hub Financeiro',
  'finance': 'Saldos & Carteira',
  'finance-statement': 'Extrato Financeiro',
  'finance-cashflow': 'Fluxo de Caixa',
  'finance-receivables': 'Contas a Receber',
  'finance-payables': 'Contas a Pagar',
  'finance-payouts': 'Solicitações de Repasse',
  'finance-advance': 'Antecipações de Receitas',
  'finance-reconciliation': 'Conciliação Bancária',
  'finance-bank-accounts': 'Contas Bancárias',
  'finance-expenses': 'Controle de Despesas',
  'finance-bordero': 'Borderô Financeiro',
  'finance-spread': 'Financeiro Spread & Adquirentes',
  'finance-split': 'Split Financeiro',
  'finance-methods': 'Métodos de Pagamento',
  'finance-reports': 'Relatórios Financeiros',
  'finance-sales': 'Vendas e Faturamento',
  'finance-bank': 'Conciliação Bancária',
  'finance-intelligence': 'Inteligência Financeira',
  'finance-custom': 'Pagamentos Customizados',
  'finance-operators': 'Operadoras de Cartão',
  'finance-negotiations': 'Negociações Financeiras',
  'finance-refunds': 'Devoluções / Estornos',

  // CONTABILIDADE
  'accounting-dashboard': 'Dashboard Contábil',
  'accounting-chart': 'Plano de Contas',
  'accounting-journal': 'Livro Diário',
  'accounting-ledger': 'Livro Razão',
  'accounting-entries': 'Lançamentos Contábeis',
  'accounting-cost-centers': 'Centro de Custos & Rateios',
  'accounting-reconciliation': 'Conciliação Contábil',
  'accounting-audit': 'Auditoria Contábil',
  'accounting-closing': 'Fechamento Contábil Periódico',
  'accounting-taxes': 'Apuração de Impostos',
  'accounting-nfse': 'NFS-e (Notas Fiscais de Serviços)',
  'accounting-nfe': 'NF-e (Notas de Produtos & PDV)',
  'accounting-sped': 'Declarações Fiscais & SPED',
  'accounting-obligations': 'Agenda de Obrigações Fiscais',
  'accounting-dre': 'DRE — Demonstração do Resultado',
  'accounting-balance-sheet': 'Balanço Patrimonial (BP)',
  'accounting-trial-balance': 'Balancete de Verificação',
  'accounting-cashflow': 'DFC — Fluxo de Caixa Contábil',
  'accounting-journal-rep': 'Livro Diário Oficial',
  'accounting-ledger-rep': 'Livro Razão Oficial',
  'accounting-exports': 'Exportações Contábeis (SPED / CNAB)',
  'accounting-settings': 'Configurações Contábeis',
  'accounting-companies': 'Empresas do Grupo DiskIngressos',
  'accounting-integrations': 'Integrações de Software Contábil',

  // POS
  'pos': 'Hub POS / PDV',
  'pos-terminals': 'Terminais POS',
  'pos-sales': 'Vendas Presenciais',
  'pos-closing': 'Fechamento de Caixa',

  // MARKETING (Fase 16.10.1)
  'marketing-hub': 'Hub Marketing',
  'marketing-dashboard': 'Dashboard Marketing',
  'marketing-campaigns': 'Campanhas Multicanais',
  'marketing-ready-campaigns': 'Campanhas Prontas',
  'marketing-create': 'Criar Campanha',
  'marketing-meta-ads': 'Meta Ads',
  'marketing-google-ads': 'Google Ads',
  'marketing-tiktok-ads': 'TikTok Ads',
  'marketing-influencers': 'Influenciadores & Promoters',
  'marketing-automations': 'Automações & Jornadas',
  'marketing-whatsapp': 'WhatsApp Marketing',
  'marketing-email': 'E-mail Marketing',
  'marketing-crm': 'CRM de Marketing',
  'marketing-audiences': 'Públicos & Segmentação',
  'marketing-communications': 'Integrações de Comunicação',
  'marketing-coupons': 'Cupons e Promoções',
  'marketing-cashback': 'Cashback Promocional',
  'marketing-coins': 'Coins & Pontos de Fidelidade',
  'marketing-gamification': 'Gamificação de Eventos',
  'marketing-referral': 'Indique e Ganhe',
  'marketing-affiliates': 'Afiliados e Parceiros',
  'marketing-utm-central': 'Central UTM & Conversões',
  'marketing-links': 'Links, UTMs e QR Codes',
  'marketing-tracking': 'Pixel & Analytics',
  'marketing-conversions': 'Central de Conversões',
  'marketing-remarketing': 'Remarketing',
  'marketing-recovery': 'Recuperação de Vendas',
  'marketing-reports': 'Relatórios de Marketing',
  'marketing-channel-performance': 'Performance por Canal',
  'marketing-campaign-ranking': 'Ranking de Campanhas',
  'marketing-funnel-insights': 'Diagnóstico do Funil & Insights',

  // REMARKETING
  'remarketing-hub': 'Hub Remarketing',
  'remarketing-dashboard': 'Dashboard Remarketing',
  'remarketing-carts': 'Carrinhos Abandonados',
  'remarketing-audiences': 'Públicos',
  'remarketing-segments': 'Segmentações',
  'remarketing-flows': 'Fluxos de Recuperação',
  'remarketing-whatsapp': 'WhatsApp Remarketing',
  'remarketing-email': 'E-mail Remarketing',
  'remarketing-payments': 'Recuperação de Pagamento',
  'remarketing-inactive': 'Clientes Inativos',
  'remarketing-postevent': 'Pós-Evento',
  'remarketing-automation': 'Remarketing Automático',
  'remarketing-reports': 'Relatórios de Remarketing',

  // SAC
  'sac-hub': 'Hub de Atendimento',
  'sac-dashboard': 'Dashboard SAC',
  'sac-tickets': 'Chamados',
  'sac-new': 'Abrir Chamado',
  'sac-sla': 'SLA & ITIL',
  'sac-integrations': 'Integrações do SAC',
  'sac-knowledge': 'Base de Conhecimento',
  'sac-reports': 'Relatórios SAC',

  // ADMIN
  'admin-hub': 'Central Administrativa',
  'admin-users': 'Usuários e Acessos',
  'admin-producers': 'Produtoras',
  'admin-permissions': 'Perfis e Permissões',
  'admin-audit': 'Logs de Auditoria',
  'admin-security': 'Segurança'
}

function moduleFor(page: PageKey, user?: AppUser | null): ModuleKey {
  if (page === 'profile-dashboard') {
    if (user?.role === 'producer-finance') return 'finance'
    if (user?.role === 'producer-marketing') return 'marketing'
    return 'events'
  }
  if (page === 'global-dashboard' || page.startsWith('admin-')) return 'admin'
  if (page.startsWith('finance-') || page === 'finance') return 'finance'
  if (page.startsWith('accounting-')) return 'accounting'
  if (page.startsWith('pos')) return 'pos'
  if (page.startsWith('marketing-')) return 'marketing'
  if (page.startsWith('remarketing-')) return 'remarketing'
  if (page.startsWith('sac-')) return 'sac'
  if (page === 'facial') return 'events'
  return 'events'
}

function areaFor(page: PageKey): 'events' | 'finance' | 'pos' | 'admin' | 'marketing' | 'remarketing' | 'sac' {
  if (page === 'global-dashboard' || page.startsWith('admin-') || ['event-users', 'event-audit', 'event-permissions'].includes(page)) return 'admin'
  if (page.startsWith('finance-') || page === 'finance' || page.startsWith('accounting-')) return 'finance'
  if (page.startsWith('pos')) return 'pos'
  if (page.startsWith('marketing-') || ['event-pixel', 'event-utm', 'event-ga4', 'event-traffic', 'event-meta-ads'].includes(page)) return 'marketing'
  if (page.startsWith('remarketing-') || page === 'event-remarketing') return 'remarketing'
  if (page.startsWith('sac-')) return 'sac'
  return 'events'
}

function firstPageFor(user: AppUser): PageKey {
  if (isGlobalAdmin(user)) return 'global-dashboard'
  return 'profile-dashboard'
}

export default function App() {
  const [users, setUsers] = useState<AppUser[]>(seedUsers)
  const [producers, setProducers] = useState(seedProducers)
  const [user, setUser] = useState<AppUser | null>(seedUsers[1])
  const [selectedProducer, setSelectedProducer] = useState<number | 'all'>(1)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'ativos' | 'inativos' | 'todos'>('todos')
  const [view, setView] = useState<'horizontal' | 'compact'>('horizontal')
  const [page, setPage] = useState<PageKey>('events')
  const [events, setEvents] = useState<EventItem[]>(seedEvents)
  const [participants, setParticipants] = useState<Participant[]>(seedParticipants)
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [toast, setToast] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const module = useMemo(() => moduleFor(page, user), [page, user])
  const notify = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(''), 2400)
  }

  const eventContextPages = new Set<PageKey>([
    'event-dashboard', 'event-tickets', 'event-courtesy', 'event-reports', 'event-details',
    'event-pixel', 'event-utm', 'event-ga4', 'event-traffic', 'event-meta-ads', 'event-remarketing',
    'event-users', 'event-audit', 'event-permissions'
  ])

  const inEventContext = !!selectedEvent && eventContextPages.has(page)
  const scopedProducerId = user ? (isGlobalAdmin(user) ? (selectedProducer === 'all' ? null : selectedProducer) : user.producerId) : null
  const visibleEvents = useMemo(() => !user ? [] : events.filter(e => scopedProducerId === null || e.producerId === scopedProducerId), [events, user, scopedProducerId])
  const visibleEventIds = useMemo(() => new Set(visibleEvents.map(e => e.id)), [visibleEvents])
  const visibleParticipants = useMemo(() => participants.filter(p => visibleEventIds.has(p.eventId)), [participants, visibleEventIds])

  const normalizeEvents = (rows: any[]): EventItem[] =>
    rows.map((e: any) => ({
      id: e.id,
      code: String(e.code),
      title: e.title,
      venue: e.venue,
      city: e.city,
      date: e.date,
      endDate: e.endDate || undefined,
      total: ((e.totalCents || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      sales: e.sales || 0,
      available: e.available || 0,
      courtesy: e.courtesy || 0,
      occupancy: `${Number(e.occupancy || 0).toFixed(1)}%`,
      cover: e.cover || 'nature',
      badge: e.badge || undefined,
      status: e.status || 'ativo',
      description: e.description || undefined,
      category: e.category || undefined,
      producer: e.producer?.name || '',
      visibility: e.visibility || 'publico',
      producerId: e.producerId
    }))

  const loadScopeData = async (u: AppUser, producerSelection: number | 'all') => {
    try {
      const requested = isGlobalAdmin(u) ? (producerSelection === 'all' ? undefined : producerSelection) : (u.producerId || undefined)
      const rows = await getEvents(requested)
      if (rows && rows.length) setEvents(normalizeEvents(rows))
    } catch {}
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      clearApiToken()
      setUser(null)
      return
    }
    if (!hasStoredToken()) return
    let active = true
    ;(async () => {
      try {
        const u = await getMe()
        if (!active) return
        setUser(u)
        const producerSelection: number | 'all' = isGlobalAdmin(u) ? 'all' : (u.producerId || 'all')
        setSelectedProducer(producerSelection)
        setPage(firstPageFor(u))
        const tasks: any[] = [loadScopeData(u, producerSelection)]
        if (isGlobalAdmin(u)) tasks.push(getProducers().then(setProducers), getUsers().then(setUsers))
        await Promise.all(tasks)
      } catch {
        // Keep seed default user
      }
    })()
    return () => { active = false }
  }, [])

  if (!user) {
    return (
      <LoginPage
        onLogin={async (email, password, remember) => {
          try {
            const result = await apiLogin(email, password)
            setApiToken(result.token, remember)
            const u = result.user
            const producerSelection: number | 'all' = isGlobalAdmin(u) ? 'all' : (u.producerId || 'all')
            setUser(u)
            setSelectedProducer(producerSelection)
            setPage(firstPageFor(u))
            await loadScopeData(u, producerSelection)
            if (isGlobalAdmin(u)) {
              try {
                const [ps, us] = await Promise.all([getProducers(), getUsers()])
                setProducers(ps)
                setUsers(us)
              } catch {}
            }
            window.history.pushState({}, '', isGlobalAdmin(u) ? '/' : '/dashboard')
            return u
          } catch (e) {
            const seedUser = seedUsers.find(su => su.email.toLowerCase() === email.toLowerCase())
            if (seedUser) {
              setUser(seedUser)
              setSelectedProducer(isGlobalAdmin(seedUser) ? 'all' : (seedUser.producerId || 'all'))
              setPage(firstPageFor(seedUser))
              window.history.pushState({}, '', isGlobalAdmin(seedUser) ? '/' : '/dashboard')
              return seedUser
            }
            throw e
          }
        }}
      />
    )
  }

  const editEvent = (e: EventItem) => { setSelectedEvent(e); setPage('edit-event') }
  const openLots = (e: EventItem) => { setSelectedEvent(e); setPage('lots') }
  const openEventContext = (e: EventItem) => {
    setSelectedEvent(e)
    setPage('event-dashboard')
    window.history.pushState({}, '', `/eventos/${e.code}/dashboard`)
    window.scrollTo({ top: 0 })
  }
  const openDashboard = openEventContext

  const saveEvent = (event: EventItem) => {
    const producerId = isGlobalAdmin(user) ? (scopedProducerId || producers[0].id) : (user.producerId || 1)
    const producer = producers.find(p => p.id === producerId)?.name || event.producer
    const secured = { ...event, producerId, producer }
    const exists = events.some(e => e.id === secured.id)
    setEvents(prev => exists ? prev.map(e => e.id === secured.id ? secured : e) : [secured, ...prev])
    notify(exists ? 'Alterações salvas com sucesso.' : 'Evento criado com sucesso.')
    setSelectedEvent(null)
    setPage('events')
  }

  const navigate = (next: PageKey) => {
    setMobileNavOpen(false)
    if (next !== 'profile-dashboard' && !canAccess(user, areaFor(next))) {
      notify('Seu perfil não possui permissão para este módulo.')
      return
    }
    if (next === 'new-event') setSelectedEvent(null)
    setPage(next)
    if (selectedEvent && eventContextPages.has(next)) {
      window.history.pushState({}, '', `/eventos/${selectedEvent.code}/${next.replace('event-', '')}`)
    } else if (next === 'events') {
      window.history.pushState({}, '', '/eventos')
    }
    window.scrollTo({ top: 0 })
  }

  const toggleCheckin = (id: number) => {
    if (!visibleParticipants.some(p => p.id === id)) return
    setParticipants(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              checkin: p.checkin === 'presente' ? 'pendente' : 'presente',
              checkinTime: p.checkin === 'presente' ? undefined : new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              gate: p.checkin === 'presente' ? undefined : 'Portão A'
            }
          : p
      )
    )
    notify('Status de check-in atualizado.')
  }

  const financePlaceholder = [
    'finance-spread', 'finance-split', 'finance-intelligence',
    'finance-methods', 'finance-custom', 'finance-operators',
    'finance-negotiations', 'finance-refunds', 'finance-reports'
  ] as PageKey[]

  const accountingPlaceholder = [
    'accounting-cost-centers', 'accounting-reconciliation', 'accounting-audit',
    'accounting-closing', 'accounting-taxes', 'accounting-nfse', 'accounting-nfe', 'accounting-sped',
    'accounting-obligations', 'accounting-dre', 'accounting-balance-sheet', 'accounting-trial-balance',
    'accounting-cashflow', 'accounting-journal-rep', 'accounting-ledger-rep', 'accounting-exports',
    'accounting-settings', 'accounting-companies', 'accounting-integrations'
  ] as PageKey[]

  const logout = () => {
    clearApiToken()
    setUser(null)
    setQuery('')
    setSelectedEvent(null)
    setSelectedProducer('all')
    window.history.replaceState({}, '', '/login')
  }

  return (
    <div className={`app-shell phase6-shell phase7-shell ${mobileNavOpen ? 'mobile-nav-open' : ''}`}>
      <Header
        query={query}
        onQuery={setQuery}
        user={user}
        producers={producers}
        selectedProducer={selectedProducer}
        onProducer={async v => {
          setSelectedProducer(v)
          setSelectedEvent(null)
          await loadScopeData(user, v)
          if (isGlobalAdmin(user)) setPage(v === 'all' ? 'global-dashboard' : 'events')
        }}
        onLogout={logout}
        onToggleMenu={() => setMobileNavOpen(v => !v)}
      />

      <button className="mobile-nav-backdrop" aria-label="Fechar navegação" onClick={() => setMobileNavOpen(false)} />

      {inEventContext && selectedEvent ? (
        <EventContextSidebar
          event={selectedEvent}
          page={page}
          onNavigate={(p) => { navigate(p); setMobileNavOpen(false) }}
          onBack={() => {
            setSelectedEvent(null)
            setPage('events')
            window.history.pushState({}, '', '/eventos')
            window.scrollTo({ top: 0 })
          }}
          canAdmin={canAccess(user, 'admin')}
        />
      ) : (
        <ModuleSidebar
          module={module}
          page={page}
          onNavigate={(p) => { navigate(p); setMobileNavOpen(false) }}
          onHome={() => { setMobileNavOpen(false); navigate(isGlobalAdmin(user) ? 'global-dashboard' : 'profile-dashboard') }}
          canAdmin={canAccess(user, 'admin')}
          user={user}
        />
      )}

      <div className="module-titlebar">
        <h1>{titleMap[page] || 'DiskIngressos'}</h1>
        <div className="scope-pill">
          {inEventContext && selectedEvent
            ? `Evento ${selectedEvent.code}`
            : scopedProducerId === null
            ? 'Visão global'
            : producers.find(p => p.id === scopedProducerId)?.name}
        </div>
      </div>

      <main className="content phase6-content">
        {page === 'profile-dashboard' && !isGlobalAdmin(user) && (
          <ProfileDashboardPage
            user={user}
            producer={producers.find(p => p.id === user.producerId)}
            events={visibleEvents}
            participants={visibleParticipants}
            onNavigate={navigate}
          />
        )}
        {page === 'global-dashboard' && isGlobalAdmin(user) && (
          <GlobalDashboardPage
            events={events}
            producers={producers}
            users={users}
            onAllEvents={() => { setSelectedProducer('all'); setPage('events') }}
            onSelectProducer={async id => {
              setSelectedProducer(id)
              setSelectedEvent(null)
              await loadScopeData(user, id)
              setPage('events')
            }}
          />
        )}

        {/* ADMIN */}
        {page === 'admin-hub' && <AdminHubPage onNavigate={navigate} />}
        {page === 'admin-users' && <UsersPage users={users} setUsers={setUsers} currentUser={user} producers={producers} notify={notify} />}
        {page === 'admin-producers' && <ProducersPage producers={producers} setProducers={setProducers} notify={notify} />}
        {page === 'admin-permissions' && <PermissionsPage notify={notify} />}
        {page === 'admin-audit' && <AuditPage notify={notify} />}
        {page === 'admin-security' && <SecurityPage notify={notify} />}

        {/* OPERATIONS & EVENTS */}
        {page === 'operations' && (
          <OperationsPage
            producerId={scopedProducerId}
            producerName={scopedProducerId === null ? 'Todas as produtoras' : (producers.find(p => p.id === scopedProducerId)?.name || 'Produtora')}
            notify={notify}
          />
        )}
        {page === 'events' && (
          <EventsPage
            events={visibleEvents}
            query={query}
            status={status}
            setStatus={setStatus}
            view={view}
            setView={setView}
            onEdit={editEvent}
            onLots={openLots}
            onDashboard={openDashboard}
            onOpen={openEventContext}
          />
        )}
        {page === 'new-event' && <EventFormPage mode="new" onCancel={() => setPage('events')} onSave={saveEvent} />}
        {page === 'edit-event' && <EventFormPage mode="edit" event={selectedEvent} onCancel={() => setPage('events')} onSave={saveEvent} />}
        {page === 'lots' && <LotsPage events={visibleEvents} selectedEvent={selectedEvent} onSelect={setSelectedEvent} onBack={() => setPage('events')} />}
        {page === 'participants' && <ParticipantsPage events={visibleEvents} participants={visibleParticipants} onToggleCheckin={toggleCheckin} />}
        {page === 'facial' && <FacialPage participants={visibleParticipants} />}

        {/* EVENT CONTEXT */}
        {selectedEvent && eventContextPages.has(page) && visibleEvents.some(e => e.id === selectedEvent.id) && (
          <EventContextPage event={selectedEvent} participants={visibleParticipants} page={page} onNavigate={navigate} notify={notify} />
        )}

        {/* HUB FINANCEIRO & DASHBOARD */}
        {page === 'finance-hub' && (
          <FinanceHubPage onNavigate={navigate} />
        )}
        {page === 'finance-dashboard' && (
          <FinanceAccountingHubPage
            events={visibleEvents}
            producerId={scopedProducerId}
            initialTab="dashboard"
            notify={notify}
            onBack={() => setPage('finance-hub')}
          />
        )}

        {/* FASE 17.3 & 17.4: OPERAÇÕES FINANCEIRAS INTEGRADAS */}
        {page === 'finance' && (
          <FinanceBalancesPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}
        {page === 'finance-statement' && (
          <FinanceStatementPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}
        {page === 'finance-payouts' && (
          <FinancePayoutsPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}
        {page === 'finance-cashflow' && (
          <FinanceCashFlowPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}
        {page === 'finance-receivables' && (
          <FinanceReceivablesPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}
        {page === 'finance-payables' && (
          <FinancePayablesPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}

        {/* FASE 17.5: CONCILIAÇÃO BANCÁRIA, CONTAS BANCÁRIAS E ANTECIPAÇÕES */}
        {(page === 'finance-reconciliation' || page === 'finance-bank') && (
          <FinanceReconciliationPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}
        {page === 'finance-bank-accounts' && (
          <FinanceBankAccountsPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}
        {page === 'finance-advance' && (
          <FinanceAdvancePage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}

        {/* FASE 17.6: DESPESAS, BORDERÔ E CONSOLIDAÇÃO FINAL */}
        {page === 'finance-expenses' && (
          <FinanceExpensesPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}
        {page === 'finance-bordero' && (
          <FinanceBorderoPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}
        {page === 'finance-consolidated' && (
          <FinanceiroConsolidadoPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}

        {/* FASE 18.4: ERP FINANCEIRO, CONTÁBIL, BORDERÔS E ASSINATURA DIGITAL */}
        {['finance-accounting', 'finance-cost-centers', 'finance-chart-accounts', 'finance-accounting-entries', 'finance-obligations', 'finance-dre', 'finance-borderos', 'finance-signatures', 'finance-closing'].includes(page) && (
          <FinanceAccountingHubPage
            events={visibleEvents}
            producerId={scopedProducerId}
            initialTab={
              page === 'finance-cost-centers' ? 'cost-centers' :
              page === 'finance-chart-accounts' ? 'accounts' :
              page === 'finance-accounting-entries' ? 'entries' :
              page === 'finance-obligations' ? 'obligations' :
              page === 'finance-dre' ? 'dre' :
              page === 'finance-borderos' ? 'borderos' :
              page === 'finance-signatures' ? 'signatures' :
              page === 'finance-closing' ? 'closing' : 'dashboard'
            }
            notify={notify}
            onBack={() => setPage('finance-dashboard')}
          />
        )}

        {/* FASE 18.1, 18.2 & 18.3: CONTABILIDADE INTEGRADA */}
        {page === 'accounting-dashboard' && (
          <FinanceAccountingHubPage events={visibleEvents} producerId={scopedProducerId} initialTab="dashboard" notify={notify} onBack={() => setPage('finance-dashboard')} />
        )}
        {page === 'accounting-chart' && (
          <FinanceAccountingHubPage events={visibleEvents} producerId={scopedProducerId} initialTab="accounts" notify={notify} onBack={() => setPage('finance-dashboard')} />
        )}
        {page === 'accounting-entries' && (
          <FinanceAccountingHubPage events={visibleEvents} producerId={scopedProducerId} initialTab="entries" notify={notify} onBack={() => setPage('finance-dashboard')} />
        )}
        {page === 'accounting-cost-centers' && (
          <FinanceAccountingHubPage events={visibleEvents} producerId={scopedProducerId} initialTab="cost-centers" notify={notify} onBack={() => setPage('finance-dashboard')} />
        )}
        {page === 'accounting-reconciliation' && (
          <FinanceAccountingHubPage events={visibleEvents} producerId={scopedProducerId} initialTab="reconciliation" notify={notify} onBack={() => setPage('finance-dashboard')} />
        )}
        {page === 'accounting-closing' && (
          <FinanceAccountingHubPage events={visibleEvents} producerId={scopedProducerId} initialTab="closing" notify={notify} onBack={() => setPage('finance-dashboard')} />
        )}
        {page === 'accounting-dre' && (
          <FinanceAccountingHubPage events={visibleEvents} producerId={scopedProducerId} initialTab="dre" notify={notify} onBack={() => setPage('finance-dashboard')} />
        )}
        {page === 'accounting-journal' && (
          <AccountingJournalPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}
        {page === 'accounting-ledger' && (
          <AccountingLedgerPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}

        {/* OUTRAS TELAS FINANCEIRAS */}
        {page === 'finance-sales' && <FinancePage events={visibleEvents} initialTab="sales" notify={notify} />}
        {page === 'finance-spread' && <SimuladorSpreadModule onBack={() => setPage('finance-dashboard')} notify={notify} />}
        {page === 'finance-split' && <SplitFinanceiroModule onBack={() => setPage('finance-dashboard')} />}
        {['finance-intelligence', 'finance-methods', 'finance-custom', 'finance-operators', 'finance-negotiations', 'finance-refunds', 'finance-reports'].includes(page) && (
          <GenericFinanceSubView moduleKey={page as any} onBack={() => setPage('finance-dashboard')} notify={notify} />
        )}

        {/* CONTABILIDADE ADVANCED */}
        {accountingPlaceholder.includes(page) && (
          <FinanceAccountingHubPage
            events={visibleEvents}
            producerId={scopedProducerId}
            initialTab="reports"
            notify={notify}
            onBack={() => setPage('finance-dashboard')}
          />
        )}

        {/* MARKETING */}
        {page === 'marketing-communications' && (
          <CommunicationPage
            producerId={scopedProducerId}
            producerName={scopedProducerId === null ? 'Todas as produtoras' : (producers.find(p => p.id === scopedProducerId)?.name || 'Produtora')}
            notify={notify}
          />
        )}
        {page.startsWith('marketing-') && page !== 'marketing-communications' && (
          <MarketingPage
            events={visibleEvents}
            producerId={scopedProducerId}
            producerName={scopedProducerId === null ? 'Todas as produtoras' : (producers.find(p => p.id === scopedProducerId)?.name || 'Produtora')}
            mode={({
              'marketing-hub': 'hub',
              'marketing-dashboard': 'dashboard',
              'marketing-campaigns': 'campaigns',
              'marketing-ready-campaigns': 'ready-campaigns',
              'marketing-create': 'create',
              'marketing-meta-ads': 'meta-ads',
              'marketing-google-ads': 'google-ads',
              'marketing-tiktok-ads': 'tiktok-ads',
              'marketing-influencers': 'influencers',
              'marketing-automations': 'automations',
              'marketing-whatsapp': 'whatsapp',
              'marketing-email': 'email',
              'marketing-crm': 'crm',
              'marketing-audiences': 'audiences',
              'marketing-coupons': 'coupons',
              'marketing-cashback': 'cashback',
              'marketing-coins': 'coins',
              'marketing-gamification': 'gamification',
              'marketing-referral': 'referral',
              'marketing-affiliates': 'affiliates',
              'marketing-utm-central': 'utm-central',
              'marketing-links': 'links',
              'marketing-tracking': 'tracking',
              'marketing-conversions': 'conversions',
              'marketing-remarketing': 'remarketing',
              'marketing-recovery': 'recovery',
              'marketing-reports': 'reports',
              'marketing-channel-performance': 'channel-performance',
              'marketing-campaign-ranking': 'campaign-ranking',
              'marketing-funnel-insights': 'funnel-insights'
            } as Record<string, any>)[page] || 'hub'}
            notify={notify}
            onNavigate={navigate}
          />
        )}

        {/* REMARKETING */}
        {page.startsWith('remarketing-') && (
          <RemarketingPage
            events={visibleEvents}
            producerId={scopedProducerId}
            producerName={scopedProducerId === null ? 'Todas as produtoras' : (producers.find(p => p.id === scopedProducerId)?.name || 'Produtora')}
            mode={({
              'remarketing-hub': 'hub', 'remarketing-dashboard': 'dashboard', 'remarketing-carts': 'carts',
              'remarketing-audiences': 'audiences', 'remarketing-segments': 'segments', 'remarketing-flows': 'flows',
              'remarketing-whatsapp': 'whatsapp', 'remarketing-email': 'email', 'remarketing-payments': 'payments',
              'remarketing-inactive': 'inactive', 'remarketing-postevent': 'postevent', 'remarketing-automation': 'automation',
              'remarketing-reports': 'reports'
            } as Record<string, any>)[page]}
            notify={notify}
            onNavigate={navigate}
          />
        )}

        {/* SAC */}
        {page.startsWith('sac-') && (
          <SupportPage
            events={visibleEvents}
            producerId={scopedProducerId}
            producerName={scopedProducerId === null ? 'Todas as produtoras' : (producers.find(p => p.id === scopedProducerId)?.name || 'Produtora')}
            mode={({
              'sac-hub': 'hub', 'sac-dashboard': 'dashboard', 'sac-tickets': 'tickets', 'sac-new': 'new',
              'sac-sla': 'sla', 'sac-integrations': 'integrations', 'sac-knowledge': 'knowledge', 'sac-reports': 'reports'
            } as Record<string, any>)[page]}
            notify={notify}
            onNavigate={navigate}
          />
        )}

        {/* POS */}
        {page === 'pos' && <POSPage events={visibleEvents} initialTab="overview" notify={notify} />}
        {page === 'pos-terminals' && <POSPage events={visibleEvents} initialTab="terminals" notify={notify} />}
        {page === 'pos-sales' && <POSPage events={visibleEvents} initialTab="sales" notify={notify} />}
        {page === 'pos-closing' && <POSPage events={visibleEvents} initialTab="closing" notify={notify} />}
      </main>

      <nav className="mobile-bottom-nav" aria-label="Navegação mobile">
        <button onClick={() => { navigate(isGlobalAdmin(user) ? 'global-dashboard' : 'profile-dashboard'); setMobileNavOpen(false) }}><Home size={20}/><span>Início</span></button>
        <button onClick={() => { navigate('events'); setMobileNavOpen(false) }}><CalendarDays size={20}/><span>Eventos</span></button>
        <button onClick={() => { navigate('finance-dashboard'); setMobileNavOpen(false) }}><WalletCards size={20}/><span>Financeiro</span></button>
        <button onClick={() => { navigate('marketing-hub'); setMobileNavOpen(false) }}><Megaphone size={20}/><span>Marketing</span></button>
        <button onClick={() => setMobileNavOpen(true)}><Menu size={20}/><span>Mais</span></button>
      </nav>

      <AppFooter />
      <ScrollTop />
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
