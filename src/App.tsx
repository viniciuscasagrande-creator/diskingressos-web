import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, Home, Megaphone, Menu, WalletCards } from 'lucide-react'
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
import FinanceCommandCenterPage from './pages/FinanceCommandCenterPage'
import FinanceDashboardPage from './pages/FinanceDashboardPage'
import FinanceBalancesPage from './pages/FinanceBalancesPage'
import FinanceProducerAccountPage from './pages/FinanceProducerAccountPage'
import FinanceCashOperationsPage from './pages/FinanceCashOperationsPage'
import FinanceStatementPage from './pages/FinanceStatementPage'
import FinancePayoutsPage from './pages/FinancePayoutsPage'
import FinanceCashFlowPage from './pages/FinanceCashFlowPage'
import FinanceReceivablesPage from './pages/FinanceReceivablesPage'
import FinancePayablesPage from './pages/FinancePayablesPage'
import EventCostCentersBudgetPage from './pages/finance/EventCostCentersBudgetPage'
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
import FinancePayments360Page from './pages/FinancePayments360Page'
import FinanceOperations360Page from './pages/FinanceOperations360Page'
import FinanceSpread360Page from './pages/FinanceSpread360Page'
import FinanceAdvancedTaxesPage from './pages/FinanceAdvancedTaxesPage'
import FinanceSettlementHubPage from './pages/finance/FinanceSettlementHubPage'
import FinanceDisputesHubPage from './pages/finance/FinanceDisputesHubPage'
import AdvancedTaxesRouter from './pages/finance/advanced/AdvancedTaxesRouter'
import './pages/finance/advanced/advanced-taxes.css'
import ModuleHubView from './components/ModuleHubView'
import { FINANCE_HUBS, ACCOUNTING_HUBS, MARKETING_HUBS } from './config/module-hubs'
import AppSidebar from './components/AppSidebar'
import AppShell from './app/layout/AppShell'
import { SafeSaffProvider } from './context/SafeSaffContext'
import type { ProducerEvent } from './types/context.types'
import { AppRouter } from './navigation/router'
import { MobileNavigationController } from './navigation/mobile-controller'
import { AppContext } from './context/app-context'
import { useAppContext } from './context/useAppContext'
import { BreadcrumbManager } from './navigation/breadcrumbs'
import { BreadcrumbNav } from './components/BreadcrumbNav'
import { BlockedStateView } from './components/BlockedStateView'
import type { RouteConfig } from './navigation/routes'
import {
  ACCOUNTING_TAB_TO_ROUTE,
  normalizeAccountingTab
} from './navigation/accounting-routes'
import { AccountingController } from './accounting/accounting-controller'
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
import { EventSupportHubPage } from './components/event-support/EventSupportHubPage'
import { DeveloperCommandCenterPage } from './components/developer/DeveloperCommandCenterPage'
import { CommerceOrdersHubPage } from './components/commerce/CommerceOrdersHubPage'
import { PaymentsHubPage } from './components/payments/PaymentsHubPage'
import { TicketsHubPage } from './components/tickets/TicketsHubPage'
import { AccessControlHubPage } from './components/access/AccessControlHubPage'
import { CustomerSearchHubPage } from './components/customers/CustomerSearchHubPage'
import { FinancialCoreHubPage } from './components/finance/FinancialCoreHubPage'

const mobileInternalHeaderPages = new Set<PageKey>([
  'events',
  'event-utm',
  'marketing-utm-central',
  'finance-dashboard',
  'finance',
  'finance-producer-account',
  'finance-statement',
  'finance-cashflow',
  'finance-receivables',
  'finance-payables',
  'finance-payouts',
  'finance-advance',
  'finance-reconciliation',
  'finance-bank-accounts',
  'finance-expenses',
  'finance-bordero',
  'finance-consolidated',
])

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
  'event-command-center': 'Cockpit Operacional',
  'event-inventory': 'Inventário Operacional',
  'event-customer-360': 'Central de Clientes',
  'event-live-ops': 'Live Event Operations',
  'event-incidents': 'Incident Center',
  'event-revenue-intel': 'Revenue & Pricing Intelligence',
  'event-global-search': 'Global Search & Command',
  'event-permission-engine': 'Permission Engine Enterprise',
  'event-compliance': 'Audit & Compliance Center',
  'event-intelligence': 'Disk Intelligence',
  'event-readiness': 'Event Readiness & Go-Live',
  'event-forecast': 'Analytics & Forecast Center',
  'event-day-command': 'Event Day Command Center',
  'event-producer-executive': 'Producer Executive Dashboard',
  'event-platform-noc': 'Platform Operations / NOC',
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
  'event-commercial-conditions': 'Condições Comerciais do Evento',
  'event-support': 'Suporte a Eventos & Event Builder',
  'commerce-orders': 'Pedidos, Ingressos & Integridade Comercial',
  'developer-center': 'Desenvolvedor • Central de Observabilidade',
  'payments-hub': 'Central de Pagamentos Enterprise',
  'tickets-hub': 'Central de Ingressos & Credenciais',
  'access-control-hub': 'Controle de Acesso (Disk Acesso)',
  'customer-search-hub': 'Central de Clientes',

  // HUBS ENTERPRISE (FASE 28.15.8.1)
  'finance-hub-account': 'Conta Financeira',
  'finance-hub-bills': 'Contas & Compromissos',
  'finance-hub-treasury': 'Tesouraria',
  'finance-hub-procurement': 'Compras & Fornecedores',
  'finance-hub-controlling': 'Controladoria',
  'finance-hub-reconciliation': 'Conciliação Financeira',
  'finance-hub-reports': 'Relatórios Financeiros',
  'accounting-hub-operations': 'Operação Contábil',
  'accounting-hub-statements': 'Demonstrações Contábeis',
  'accounting-hub-compliance': 'Fiscal & Compliance',
  'marketing-hub-campaigns': 'Campanhas de Marketing',
  'marketing-hub-communication': 'Comunicação & Automações',
  'marketing-hub-pixels': 'Conversões & Pixels',
  'marketing-hub-analytics': 'Analytics de Marketing',

  // FINANCEIRO
  'finance-dashboard': 'Dashboard Financeiro',
  'finance-hub': 'Hub Financeiro',
  'finance': 'Saldos',
  'finance-producer-account': 'Conta Gráfica do Produtor',
  'finance-statement': 'Extrato Financeiro',
  'finance-cashflow': 'Fluxo de Caixa',
  'finance-receivables': 'Contas a Receber',
  'finance-payables': 'Contas a Pagar',
  'finance-payouts': 'Solicitações de Repasse',
  'finance-advance': 'Antecipações',
  'finance-reconciliation': 'Conciliação Bancária',
  'finance-bank-accounts': 'Contas Bancárias',
  'finance-expenses': 'Controle de Despesas',
  'finance-bordero': 'Borderô Financeiro',
  'finance-spread': 'Financeiro Spread & Adquirentes',
  'finance-spread-simulator': 'Simulador de Spread',
  'finance-split': 'Divisão de Receitas',
  'finance-methods': 'Pagamentos & Taxas',
  'finance-reports': 'Relatórios Financeiros',
  'finance-sales': 'Vendas e Faturamento',
  'finance-bank': 'Conciliação Bancária',
  'finance-intelligence': 'Inteligência Financeira',
  'finance-custom': 'Pagamentos Customizados',
  'finance-operators': 'Operadoras de Cartão',
  'finance-negotiations': 'Negociações Financeiras',
  'finance-refunds': 'Devoluções / Estornos',
  'finance-gateways': 'Gateway de Pagamentos',
  'finance-pdv': 'Pontos de Venda (PDV)',
  'finance-chart-accounts': 'Plano de Contas',
  'financial-core': 'Núcleo Financeiro & Contábil',

  // CONTABILIDADE (FASE 28.15.4)
  'accounting-dashboard': 'Visão Geral Contábil',
  'accounting-inteligencia': 'Inteligência Contábil',
  'accounting-conciliacao': 'Centro de Conciliação',
  'accounting-rastreabilidade': 'Rastreabilidade Contábil',
  'accounting-dre': 'DRE Gerencial',
  'accounting-balanco': 'Balanço Patrimonial',
  'accounting-fechamento': 'Fechamento Mensal',
  'accounting-plano-de-contas': 'Plano de Contas',
  'accounting-lancamentos': 'Lançamentos Contábeis',
  'accounting-documentos': 'Documentos & Assinaturas',
  'accounting-fiscal': 'Fiscal & SPED',
  'accounting-relatorios': 'Relatórios Contábeis',
  // Aliases legados
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
  'marketing-hub': 'Dashboard Marketing', // alias legado
  'marketing-dashboard': 'Dashboard Marketing',
  'marketing-campaigns': 'Campanhas Multicanais',
  'marketing-ready-campaigns': 'Campanhas Prontas',
  'marketing-create': 'Criar Campanha',
  'marketing-meta-ads': 'Meta Ads',
  'marketing-google-ads': 'Google Ads',
  'marketing-tiktok-ads': 'TikTok Ads',
  'marketing-spotify-ads': 'Spotify Ads & Conversões CAPI',
  'marketing-spotify': 'Spotify Ads & Conversões CAPI',
  'marketing-status-real': 'Status Real das Campanhas',
  'marketing-real-status': 'Status Real das Campanhas',
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
  'marketing-tracking': 'Pixels e Conversões',
  'marketing-attribution': 'Atribuição Multicanal',
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

function resolvePageFromPath(path: string, user: AppUser): PageKey {
  const clean = path.replace(/^#\/?/, '').replace(/^\/app\//, '').replace(/^\//, '').split('?')[0].split('#')[0]
  if (!clean || clean === 'login' || clean === 'dashboard') {
    return firstPageFor(user)
  }
  if (clean === 'eventos') return 'events'
  if (clean === 'event-support' || clean === 'app/event-support') return 'event-support'
  if (clean === 'commerce-orders' || clean === 'app/commerce-orders' || clean === 'pedidos' || clean === 'app/pedidos') return 'commerce-orders'
  if (clean === 'developer-center' || clean === 'app/developer-center' || clean === 'desenvolvedor' || clean === 'app/desenvolvedor' || clean === 'desenvolvedor/design-system' || clean === 'app/desenvolvedor/design-system') return 'developer-center'
  if (clean === 'payments-hub' || clean === 'payments' || clean === 'app/payments' || clean === 'pagamentos' || clean === 'app/pagamentos') return 'payments-hub'
  if (clean === 'tickets-hub' || clean === 'tickets' || clean === 'app/tickets' || clean === 'ingressos' || clean === 'app/ingressos') return 'tickets-hub'
  if (clean === 'access-control-hub' || clean === 'access-control' || clean === 'access' || clean === 'app/access-control' || clean === 'acesso' || clean === 'app/acesso') return 'access-control-hub'
  if (clean === 'customer-search-hub' || clean === 'customers' || clean === 'app/customers' || clean === 'clientes' || clean === 'app/clientes') return 'customer-search-hub'
  if (clean.startsWith('eventos/')) {
    const parts = clean.split('/')
    const tool = parts[2] || 'dashboard'
    const candidate = (`event-${tool}` in titleMap ? `event-${tool}` : tool) as PageKey
    if (candidate in titleMap) return candidate
    return 'event-dashboard'
  }
  // Hubs Financeiro (Fase 28.15.8.1)
  if (clean === 'financeiro/conta-financeira' || clean === 'app/finance-hub-account') return 'finance-hub-account'
  if (clean === 'financeiro/contas' || clean === 'app/finance-hub-bills') return 'finance-hub-bills'
  if (clean === 'financeiro/tesouraria' || clean === 'app/finance-hub-treasury') return 'finance-hub-treasury'
  if (clean === 'financeiro/compras-fornecedores' || clean === 'app/finance-hub-procurement') return 'finance-hub-procurement'
  if (clean === 'financeiro/controladoria' || clean === 'app/finance-hub-controlling') return 'finance-hub-controlling'
  if (clean === 'financeiro/conciliacao' || clean === 'app/finance-hub-reconciliation') return 'finance-hub-reconciliation'
  if (clean === 'financeiro/relatorios' || clean === 'app/finance-hub-reports') return 'finance-hub-reports'

  // Hubs Contabilidade (Fase 28.15.8.1)
  if (clean === 'contabilidade/operacao' || clean === 'app/accounting-hub-operations') return 'accounting-hub-operations'
  if (clean === 'contabilidade/demonstracoes' || clean === 'app/accounting-hub-statements') return 'accounting-hub-statements'
  if (clean === 'contabilidade/fiscal-compliance' || clean === 'app/accounting-hub-compliance') return 'accounting-hub-compliance'

  // Hubs Marketing (Fase 28.15.8.1)
  if (clean === 'marketing/campanhas' || clean === 'app/marketing-hub-campaigns') return 'marketing-hub-campaigns'
  if (clean === 'marketing/comunicacao' || clean === 'app/marketing-hub-communication') return 'marketing-hub-communication'
  if (clean === 'marketing/pixels' || clean === 'app/marketing-hub-pixels') return 'marketing-hub-pixels'
  if (clean === 'marketing/analytics' || clean === 'app/marketing-hub-analytics') return 'marketing-hub-analytics'

  if (clean.startsWith('contabilidade/')) {
    const sub = clean.replace('contabilidade/', '')
    const tab = normalizeAccountingTab(sub)
    return `accounting-${tab}` as PageKey
  }
  if (clean === 'contabilidade' || clean === 'accounting-disk') return 'accounting-dashboard'
  if (clean === 'marketing/spotify' || clean === 'marketing-spotify' || clean === 'marketing-spotify-ads') return 'marketing-spotify'
  if (clean === 'marketing/status-real' || clean === 'marketing-status-real' || clean === 'marketing-real-status') return 'marketing-status-real'
  const resolved = AppRouter.resolve(path)
  if (resolved && resolved.view && (resolved.view as string) in titleMap) {
    return resolved.view as PageKey
  }
  if (clean in titleMap) return clean as PageKey
  return firstPageFor(user)
}

export default function App() {
  const [users, setUsers] = useState<AppUser[]>(seedUsers)
  const [producers, setProducers] = useState(seedProducers)
  const [user, setUser] = useState<AppUser | null>(null)
  const [selectedProducer, setSelectedProducer] = useState<number | 'all'>('all')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'ativos' | 'inativos' | 'todos'>('todos')
  const [view, setView] = useState<'horizontal' | 'compact'>('horizontal')
  const [page, setPage] = useState<PageKey>(() => {
    if (typeof window !== 'undefined') {
      const pathWithHash = window.location.hash.startsWith('#/') ? window.location.hash.slice(2) : window.location.pathname
      const clean = pathWithHash.replace(/^\/app\//, '').replace(/^\//, '').split('?')[0].split('#')[0]
      if (clean === 'commerce-orders' || clean === 'pedidos') return 'commerce-orders'
      if (clean === 'developer-center' || clean === 'desenvolvedor' || clean === 'desenvolvedor/design-system') return 'developer-center'
      if (clean === 'payments-hub' || clean === 'payments' || clean === 'pagamentos') return 'payments-hub'
      if (clean === 'tickets-hub' || clean === 'tickets' || clean === 'ingressos') return 'tickets-hub'
      if (clean === 'access-control-hub' || clean === 'access-control' || clean === 'access' || clean === 'acesso') return 'access-control-hub'
      if (clean === 'customer-search-hub' || clean === 'customers' || clean === 'clientes') return 'customer-search-hub'
      if (clean === 'financial-core' || clean === 'finance-core' || clean === 'financeiro-core') return 'financial-core'
      if (clean.startsWith('eventos/')) {
        const parts = clean.split('/')
        const tool = parts[2] || 'dashboard'
        const candidate = (`event-${tool}` in titleMap ? `event-${tool}` : tool) as PageKey
        if (candidate in titleMap) return candidate
        return 'event-dashboard'
      }
      if (clean === 'financeiro/conta-financeira' || clean === 'app/finance-hub-account') return 'finance-hub-account'
      if (clean === 'financeiro/contas' || clean === 'app/finance-hub-bills') return 'finance-hub-bills'
      if (clean === 'financeiro/tesouraria' || clean === 'app/finance-hub-treasury') return 'finance-hub-treasury'
      if (clean === 'financeiro/compras-fornecedores' || clean === 'app/finance-hub-procurement') return 'finance-hub-procurement'
      if (clean === 'financeiro/controladoria' || clean === 'app/finance-hub-controlling') return 'finance-hub-controlling'
      if (clean === 'financeiro/conciliacao' || clean === 'app/finance-hub-reconciliation') return 'finance-hub-reconciliation'
      if (clean === 'financeiro/relatorios' || clean === 'app/finance-hub-reports') return 'finance-hub-reports'

      if (clean === 'contabilidade/operacao' || clean === 'app/accounting-hub-operations') return 'accounting-hub-operations'
      if (clean === 'contabilidade/demonstracoes' || clean === 'app/accounting-hub-statements') return 'accounting-hub-statements'
      if (clean === 'contabilidade/fiscal-compliance' || clean === 'app/accounting-hub-compliance') return 'accounting-hub-compliance'

      if (clean === 'marketing/campanhas' || clean === 'app/marketing-hub-campaigns') return 'marketing-hub-campaigns'
      if (clean === 'marketing/comunicacao' || clean === 'app/marketing-hub-communication') return 'marketing-hub-communication'
      if (clean === 'marketing/pixels' || clean === 'app/marketing-hub-pixels') return 'marketing-hub-pixels'
      if (clean === 'marketing/analytics' || clean === 'app/marketing-hub-analytics') return 'marketing-hub-analytics'

      if (clean.startsWith('contabilidade/')) {
        const sub = clean.replace('contabilidade/', '')
        const tab = normalizeAccountingTab(sub)
        return `accounting-${tab}` as PageKey
      }
      if (clean === 'contabilidade' || clean === 'accounting-disk') return 'accounting-dashboard'
      if (clean === 'marketing/spotify' || clean === 'marketing-spotify' || clean === 'marketing-spotify-ads') return 'marketing-spotify'
      if (clean === 'marketing/status-real' || clean === 'marketing-status-real' || clean === 'marketing-real-status') return 'marketing-status-real'
      if (clean in titleMap) return clean as PageKey
    }
    return 'events'
  })
  const [events, setEvents] = useState<EventItem[]>([])
  const [participants, setParticipants] = useState<Participant[]>(seedParticipants)
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [toast, setToast] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('safesaff.sidebar.collapsed') === 'true'
  })

  // Fase 28.15.6: Contexto centralizado e Breadcrumbs contextuais
  const appContextState = useAppContext()
  const [currentRoute, setCurrentRoute] = useState<RouteConfig>(() => AppRouter.current())

  const breadcrumbItems = useMemo(() => {
    return BreadcrumbManager.resolve(currentRoute, appContextState)
  }, [currentRoute, appContextState])

  // Fase 28.15.5: Controlador unificado de navegação mobile e drawer
  useEffect(() => {
    const unsubMobile = MobileNavigationController.subscribe(setMobileNavOpen)
    return () => {
      unsubMobile()
    }
  }, [])

  // Fase 21.1.5 + Fase 28.15.4 + Fase 28.15.6: histórico do navegador, Voltar/Avançar e deep-links contábeis
  useEffect(() => {
    const current = window.history.state || {}
    if (!current.page) window.history.replaceState({ ...current, page }, '', window.location.href)
    const onPopState = (ev: PopStateEvent) => {
      MobileNavigationController.close()
      const currentLoc = window.location.pathname + window.location.hash
      AppRouter.syncFromLocation(currentLoc, true)
      const previous = ev.state?.page as PageKey | undefined
      if (previous) {
        setMobileNavOpen(false)
        setPage(previous)
        if (previous.startsWith('accounting-') && !ACCOUNTING_HUBS[previous]) {
          const tab = normalizeAccountingTab(previous.replace('accounting-', ''))
          AccountingController.activateTab(tab, { skipRouter: true })
        }
        window.scrollTo({ top: 0 })
      } else if (typeof window !== 'undefined') {
        const pathWithHash = window.location.hash.startsWith('#/') ? window.location.hash.slice(2) : window.location.pathname
        const clean = pathWithHash.replace(/^\/app\//, '').replace(/^\//, '').split('?')[0].split('#')[0]
        if (clean.startsWith('eventos/')) {
          const parts = clean.split('/')
          const tool = parts[2] || 'dashboard'
          const candidate = (`event-${tool}` in titleMap ? `event-${tool}` : tool) as PageKey
          setMobileNavOpen(false)
          setPage(candidate in titleMap ? candidate : 'event-dashboard')
          window.scrollTo({ top: 0 })
        } else if (clean === 'contabilidade/operacao' || clean === 'app/accounting-hub-operations') {
          setMobileNavOpen(false)
          setPage('accounting-hub-operations')
          window.scrollTo({ top: 0 })
        } else if (clean === 'contabilidade/demonstracoes' || clean === 'app/accounting-hub-statements') {
          setMobileNavOpen(false)
          setPage('accounting-hub-statements')
          window.scrollTo({ top: 0 })
        } else if (clean === 'contabilidade/fiscal-compliance' || clean === 'app/accounting-hub-compliance') {
          setMobileNavOpen(false)
          setPage('accounting-hub-compliance')
          window.scrollTo({ top: 0 })
        } else if (clean.startsWith('contabilidade/')) {
          const sub = clean.replace('contabilidade/', '')
          const tab = normalizeAccountingTab(sub)
          setMobileNavOpen(false)
          setPage(`accounting-${tab}` as PageKey)
          AccountingController.activateTab(tab, { skipRouter: true })
          window.scrollTo({ top: 0 })
        } else if (clean === 'contabilidade' || clean === 'accounting-disk') {
          setMobileNavOpen(false)
          setPage('accounting-dashboard')
          AccountingController.activateTab('dashboard', { skipRouter: true })
          window.scrollTo({ top: 0 })
        } else if (clean === 'marketing/spotify' || clean === 'marketing-spotify' || clean === 'marketing-spotify-ads') {
          setMobileNavOpen(false)
          setPage('marketing-spotify')
          window.scrollTo({ top: 0 })
        } else if (clean === 'commerce-orders' || clean === 'pedidos') {
          setMobileNavOpen(false)
          setPage('commerce-orders')
          window.scrollTo({ top: 0 })
        } else if (clean === 'payments-hub' || clean === 'payments' || clean === 'pagamentos') {
          setMobileNavOpen(false)
          setPage('payments-hub')
          window.scrollTo({ top: 0 })
        } else if (clean === 'tickets-hub' || clean === 'tickets' || clean === 'ingressos') {
          setMobileNavOpen(false)
          setPage('tickets-hub')
          window.scrollTo({ top: 0 })
        } else if (clean === 'access-control-hub' || clean === 'access-control' || clean === 'access' || clean === 'acesso') {
          setMobileNavOpen(false)
          setPage('access-control-hub')
          window.scrollTo({ top: 0 })
        } else if (clean === 'customer-search-hub' || clean === 'customers' || clean === 'clientes') {
          setMobileNavOpen(false)
          setPage('customer-search-hub')
          window.scrollTo({ top: 0 })
        } else if (clean === 'marketing/status-real' || clean === 'marketing-status-real' || clean === 'marketing-real-status') {
          setMobileNavOpen(false)
          setPage('marketing-status-real')
          window.scrollTo({ top: 0 })
        }
      }
    }
    window.addEventListener('popstate', onPopState)
    const unsubRouter = AppRouter.subscribe((route) => {
      setCurrentRoute(route)
      if (route.view && ((route.view as string) in ACCOUNTING_HUBS || (route.view as string) in FINANCE_HUBS || (route.view as string) in MARKETING_HUBS)) {
        setPage(route.view as PageKey)
      } else if (route.module === 'contabilidade' && route.tab) {
        const tab = normalizeAccountingTab(route.tab)
        setPage(`accounting-${tab}` as PageKey)
      } else if (route.view && (route.view as string) in titleMap) {
        setPage(route.view as PageKey)
      }
    })
    return () => {
      window.removeEventListener('popstate', onPopState)
      unsubRouter()
    }
  }, [])

  const module = useMemo(() => moduleFor(page, user), [page, user])
  const notify = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(''), 2400)
  }

  const eventContextPages = new Set<PageKey>([
    'event-command-center', 'event-inventory', 'event-customer-360', 'event-dashboard', 'event-tickets', 'event-courtesy', 'event-reports', 'event-details', 'event-commercial-conditions',
    'event-live-ops', 'event-incidents', 'event-revenue-intel', 'event-global-search', 'event-permission-engine', 'event-compliance', 'event-intelligence', 'event-readiness', 'event-forecast', 'event-day-command', 'event-producer-executive', 'event-platform-noc',
    'event-pixel', 'event-utm', 'event-ga4', 'event-traffic', 'event-meta-ads', 'event-remarketing',
    'event-users', 'event-audit', 'event-permissions'
  ])

  const inEventContext = !!selectedEvent && (appContextState.scope === 'EVENT' || eventContextPages.has(page))
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
      if (rows) {
        const norm = normalizeEvents(rows)
        setEvents(norm)
        // Sincroniza evento com URL ou com AppContext
        const currentCtx = AppContext.getState()
        const path = typeof window !== 'undefined' ? window.location.pathname : ''
        const eventMatch = path.match(/^\/(?:app\/)?eventos\/([^\/]+)(?:\/([^\/]+))?/)
        const urlCode = eventMatch ? eventMatch[1] : null

        if (urlCode) {
          const matched = norm.find((e) => e.code === urlCode || String(e.id) === urlCode)
          if (matched) {
            setSelectedEvent(matched)
            AppContext.selectEvent(matched.id, matched.title, matched.producerId)
            const tool = eventMatch[2]
            if (tool) {
              const mappedPage = (`event-${tool}` in titleMap ? `event-${tool}` : tool) as PageKey
              if (mappedPage in titleMap) setPage(mappedPage)
            }
          }
        } else if (currentCtx.eventId) {
          const matched = norm.find((e) => e.id === currentCtx.eventId)
          if (matched) {
            setSelectedEvent(matched)
          } else {
            setSelectedEvent(null)
            AppContext.clearEvent()
          }
        }
      }
    } catch (error) {
      setEvents([])
      console.error('Falha ao carregar eventos da API/banco:', error)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      clearApiToken()
      setUser(null)
      AppContext.setUser(null)
      return
    }
    if (!hasStoredToken()) return
    let active = true
    ;(async () => {
      try {
        const u = await getMe()
        if (!active) return
        setUser(u)
        AppContext.setUser(u, seedProducers)
        const ctxState = AppContext.getState()
        const producerSelection: number | 'all' = isGlobalAdmin(u)
          ? (ctxState.producerId !== null ? ctxState.producerId : 'all')
          : (u.producerId || 'all')
        setSelectedProducer(producerSelection)
        const initialPage = typeof window !== 'undefined' ? resolvePageFromPath(window.location.pathname, u) : firstPageFor(u)
        setPage(initialPage)
        if (producerSelection !== 'all') {
          AppContext.setProducer(producerSelection, ctxState.producerName || undefined, seedProducers)
        }
        const tasks: any[] = [
          loadScopeData(u, producerSelection),
          getProducers().then((prods) => {
            setProducers(prods)
            AppContext.setUser(u, prods)
          })
        ]
        if (isGlobalAdmin(u)) tasks.push(getUsers().then(setUsers))
        await Promise.all(tasks)
        AppRouter.syncFromLocation()
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
            const initialPage = typeof window !== 'undefined' ? resolvePageFromPath(window.location.pathname, u) : firstPageFor(u)
            setPage(initialPage)
            // O login só é concluído visualmente depois que o escopo real da produtora
            // e seus eventos forem carregados da mesma API que autenticou o usuário.
            AppContext.setUser(u, producers)
            AppContext.setProducer(producerSelection === 'all' ? null : producerSelection, undefined, producers)
            const tasks: any[] = [loadScopeData(u, producerSelection), getProducers().then(setProducers)]
            if (isGlobalAdmin(u)) tasks.push(getUsers().then(setUsers))
            await Promise.all(tasks)
            const targetUrl = initialPage === firstPageFor(u)
              ? (isGlobalAdmin(u) ? '/' : '/dashboard')
              : ((initialPage === 'marketing-spotify' || initialPage === 'marketing-spotify-ads')
                  ? '/app/marketing/spotify'
                  : (window.location.pathname.startsWith('/app/') ? window.location.pathname : `/app/${initialPage}`))
            window.history.pushState({ page: initialPage }, '', targetUrl)
            AppRouter.syncFromLocation(targetUrl)
            return u
          } catch (e) {
            // Nunca simular login de produtor com seed local quando a API/cloud falhar.
            // Isso escondia erros de autenticação/escopo e deixava o painel sem dados.
            clearApiToken()
            setUser(null)
            AppContext.setUser(null)
            setEvents([])
            throw e
          }
        }}
      />
    )
  }

  const editEvent = (e: EventItem) => {
    setSelectedEvent(e)
    AppContext.selectEvent(e.id, e.title, e.producerId)
    setPage('edit-event')
    AppRouter.syncFromLocation('/app/edit-event')
  }
  const openLots = (e: EventItem) => {
    setSelectedEvent(e)
    AppContext.selectEvent(e.id, e.title, e.producerId)
    setPage('lots')
    AppRouter.syncFromLocation('/app/lots')
  }
  const openEventContext = (e: EventItem) => {
    setSelectedEvent(e)
    AppContext.selectEvent(e.id, e.title, e.producerId)
    setPage('event-dashboard')
    const targetUrl = `/eventos/${e.code}/dashboard`
    window.history.pushState({ page: 'event-dashboard' }, '', targetUrl)
    AppRouter.syncFromLocation(targetUrl)
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
    AppContext.selectAllEvents()
    setPage('events')
    AppRouter.syncFromLocation('/eventos')
  }

  const navigate = (next: PageKey) => {
    MobileNavigationController.close()
    setMobileNavOpen(false)
    if (next !== 'profile-dashboard' && !canAccess(user, areaFor(next))) {
      notify('Seu perfil não possui permissão para este módulo.')
      return
    }
    if (next === 'new-event') {
      setSelectedEvent(null)
      AppContext.selectAllEvents()
    }
    setPage(next)
    let targetUrl = `/app/${next}`

    const hubRouteMap: Partial<Record<PageKey, string>> = {
      'finance-hub-account': '/financeiro/conta-financeira',
      'finance-hub-bills': '/financeiro/contas',
      'finance-hub-treasury': '/financeiro/tesouraria',
      'finance-hub-procurement': '/financeiro/compras-fornecedores',
      'finance-hub-controlling': '/financeiro/controladoria',
      'finance-hub-reconciliation': '/financeiro/conciliacao',
      'finance-hub-reports': '/financeiro/relatorios',
      'accounting-hub-operations': '/contabilidade/operacao',
      'accounting-hub-statements': '/contabilidade/demonstracoes',
      'accounting-hub-compliance': '/contabilidade/fiscal-compliance',
      'marketing-hub-campaigns': '/marketing/campanhas',
      'marketing-hub-communication': '/marketing/comunicacao',
      'marketing-hub-pixels': '/marketing/pixels',
      'marketing-hub-analytics': '/marketing/analytics',
    }

    if (selectedEvent && eventContextPages.has(next)) {
      targetUrl = `/eventos/${selectedEvent.code}/${next.replace('event-', '')}`
      window.history.pushState({ page: next }, '', targetUrl)
    } else if (hubRouteMap[next]) {
      targetUrl = hubRouteMap[next]!
      window.history.pushState({ page: next }, '', targetUrl)
    } else if (next.startsWith('accounting-') || next === 'finance-accounting') {
      const tab = normalizeAccountingTab(next.replace('accounting-', ''))
      targetUrl = ACCOUNTING_TAB_TO_ROUTE[tab] || '/contabilidade/dashboard'
      window.history.pushState({ page: next, route: targetUrl, tab }, '', targetUrl)
      AccountingController.activateTab(tab, { skipRouter: true })
    } else if (next === 'marketing-spotify' || next === 'marketing-spotify-ads') {
      targetUrl = '/app/marketing/spotify'
      window.history.pushState({ page: next }, '', targetUrl)
    } else if (next === 'marketing-status-real' || next === 'marketing-real-status') {
      targetUrl = '/app/marketing/status-real'
      window.history.pushState({ page: next }, '', targetUrl)
    } else {
      window.history.pushState({ page: next }, '', targetUrl)
    }
    AppRouter.syncFromLocation(targetUrl)
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
    AppContext.setUser(null)
    setQuery('')
    setSelectedEvent(null)
    setSelectedProducer('all')
    window.history.replaceState({}, '', '/login')
  }

  return (
    <SafeSaffProvider
      producerId={scopedProducerId}
      initialEvents={visibleEvents.map(e => ({
        id: e.id,
        name: e.title,
        title: e.title,
        code: e.code,
        venue: e.venue,
        city: e.city,
        date: e.date,
        status: e.status,
        producerId: e.producerId,
        cover: e.cover
      }))}
    >
      <AppShell
        module={module}
        page={page}
        user={user}
        producers={producers}
        selectedProducerId={selectedProducer}
        onSelectProducer={async (v) => {
          setSelectedProducer(v)
          setSelectedEvent(null)
          AppContext.setProducer(v === 'all' ? null : v, undefined, producers)
          await loadScopeData(user, v)
          if (isGlobalAdmin(user)) {
            const next = v === 'all' ? 'global-dashboard' : 'events'
            setPage(next)
            AppRouter.navigate(next === 'events' ? '/eventos' : '/dashboard')
          }
        }}
        events={events}
        selectedEventId={selectedEvent?.id ?? appContextState.eventId}
        selectedEvent={selectedEvent}
        onSelectEvent={(evId) => {
          if (!evId) {
            setSelectedEvent(null)
            AppContext.selectAllEvents()
            return
          }
          const found = events.find((e) => e.id === evId)
          if (found) {
            setSelectedEvent(found)
            AppContext.selectEvent(found.id, found.title, found.producerId)
          }
        }}
        onNavigate={(p) => { navigate(p); MobileNavigationController.close() }}
        onBackToProducer={() => {
          setSelectedEvent(null)
          AppContext.clearEvent()
          setPage('events')
          window.history.pushState({}, '', '/eventos')
          AppRouter.syncFromLocation('/eventos')
          window.scrollTo({ top: 0 })
        }}
        onSelectOtherEvent={(newEvent) => {
          const match = visibleEvents.find(e => String(e.id) === String(newEvent.id) || (e.code && e.code === String(newEvent.id))) || (newEvent as unknown as EventItem)
          setSelectedEvent(match)
          AppContext.selectEvent(Number(newEvent.id), newEvent.name || newEvent.title, newEvent.producerId)

          if (inEventContext) {
            const code = match.code || String(match.id)
            const toolSlug = page.startsWith('event-') ? page.replace('event-', '') : page
            const targetUrl = `/eventos/${code}/${toolSlug}`
            window.history.pushState({ page }, '', targetUrl)
            AppRouter.syncFromLocation(targetUrl)
          }
        }}
        onHome={() => { MobileNavigationController.close(); navigate(isGlobalAdmin(user) ? 'global-dashboard' : 'profile-dashboard') }}
        onLogout={logout}
        searchQuery={query}
        onSearchChange={setQuery}
        breadcrumbs={breadcrumbItems}
        inEventContext={inEventContext}
        canAdmin={canAccess(user, 'admin')}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        mobileNavOpen={mobileNavOpen}
        onToggleMobileNav={() => MobileNavigationController.toggle()}
        onCloseMobileNav={() => MobileNavigationController.close()}
      >

      <div className={`module-titlebar ${mobileInternalHeaderPages.has(page) ? 'mobile-titlebar-hidden' : ''}`}>
        <div className="flex flex-col gap-1.5 min-w-0">
          <BreadcrumbNav items={breadcrumbItems} />
          <div className="flex items-center gap-3">
            {page !== 'profile-dashboard' && page !== 'global-dashboard' && (
              <button
                onClick={() => {
                  if (inEventContext && selectedEvent) {
                    setSelectedEvent(null)
                    AppContext.clearEvent()
                    setPage('events')
                    AppRouter.syncFromLocation('/eventos')
                  } else if (page === 'finance-dashboard' || page === 'finance-hub') {
                    setPage(isGlobalAdmin(user) ? 'global-dashboard' : 'profile-dashboard')
                  } else if (page.startsWith('finance') || page.startsWith('fin-') || (page as string) === 'simulador-spread') {
                    setPage('finance-dashboard')
                  } else if (page.startsWith('accounting')) {
                    setPage('accounting-dashboard')
                  } else if (page.startsWith('marketing')) {
                    setPage('marketing-dashboard')
                  } else if (page.startsWith('remarketing')) {
                    setPage('remarketing-dashboard')
                  } else if (page.startsWith('sac')) {
                    setPage('sac-hub')
                  } else if (page.startsWith('admin')) {
                    setPage('admin-hub')
                  } else if (['lots', 'participants', 'edit-event', 'event-dashboard', 'new-event'].includes(page)) {
                    setPage('events')
                  } else {
                    setPage(isGlobalAdmin(user) ? 'global-dashboard' : 'profile-dashboard')
                  }
                  window.scrollTo({ top: 0 })
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#17212F] hover:bg-[#253245] text-slate-700 hover:text-slate-900 border border-slate-200 transition shadow-xs cursor-pointer select-none"
                title="Voltar ao Painel Anterior"
              >
                <ArrowLeft size={14} className="text-[#06B6D4]" />
                <span>
                  {page.startsWith('finance') || page.startsWith('fin-') || (page as string) === 'simulador-spread'
                    ? page === 'finance-dashboard' || page === 'finance-hub'
                      ? 'Voltar ao Início'
                      : 'Voltar ao Dashboard'
                    : inEventContext
                    ? 'Voltar aos Eventos'
                    : 'Voltar'}
                </span>
              </button>
            )}
            <h1>{titleMap[page] || 'DiskIngressos'}</h1>
          </div>
        </div>
        <div className="scope-pill shrink-0">
          {inEventContext && selectedEvent
            ? `Evento ${selectedEvent.code}`
            : scopedProducerId === null
            ? 'Visão global'
            : producers.find(p => p.id === scopedProducerId)?.name}
        </div>
      </div>

      {mobileInternalHeaderPages.has(page) && (
        <div className="md:hidden px-4 py-2 border-b border-slate-800 bg-[#0F172A]/90">
          <BreadcrumbNav items={breadcrumbItems} dataTestId="breadcrumb-nav-mobile" />
        </div>
      )}

      <div className="content phase6-content w-full min-w-0">
        {currentRoute.guardState && !currentRoute.guardState.allowed ? (
          <BlockedStateView
            type={currentRoute.guardState.blockedReason || 'unauthorized'}
            message={currentRoute.guardState.message}
            onAction={() => {
              if (currentRoute.guardState?.blockedReason === 'need_event') {
                navigate('events')
              } else {
                navigate(isGlobalAdmin(user) ? 'global-dashboard' : 'profile-dashboard')
              }
            }}
          />
        ) : (
          <>
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
        {page === 'admin-users' && <UsersPage users={users} setUsers={setUsers} currentUser={user} producers={producers} notify={notify} onNavigate={navigate} />}
        {page === 'admin-producers' && <ProducersPage producers={producers} setProducers={setProducers} notify={notify} onNavigate={navigate} />}
        {page === 'admin-permissions' && <PermissionsPage notify={notify} onNavigate={navigate} />}
        {page === 'admin-audit' && <AuditPage notify={notify} onNavigate={navigate} />}
        {page === 'admin-security' && <SecurityPage notify={notify} onNavigate={navigate} />}

        {/* OPERATIONS & EVENTS */}
        {page === 'operations' && (
          <OperationsPage
            producerId={scopedProducerId}
            producerName={scopedProducerId === null ? 'Todas as produtoras' : (producers.find(p => p.id === scopedProducerId)?.name || 'Produtora')}
            notify={notify}
            onNavigate={navigate}
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
            onNavigate={navigate}
          />
        )}
        {page === 'event-support' && (
          <EventSupportHubPage />
        )}
        {page === 'commerce-orders' && (
          <CommerceOrdersHubPage
            onNavigateToPayments={() => navigate('payments-hub')}
            onNavigateToTickets={() => navigate('tickets-hub')}
            onNavigateToAccess={() => navigate('access-control-hub')}
            onNavigateToCustomers={() => navigate('customer-search-hub')}
          />
        )}
        {page === 'developer-center' && (
          <DeveloperCommandCenterPage />
        )}
        {page === 'payments-hub' && (
          <PaymentsHubPage
            onNavigateToOrders={() => navigate('commerce-orders')}
            onNavigateToFinance={() => navigate('finance-dashboard')}
          />
        )}
        {page === 'tickets-hub' && (
          <TicketsHubPage />
        )}
        {page === 'access-control-hub' && (
          <AccessControlHubPage />
        )}
        {page === 'customer-search-hub' && (
          <CustomerSearchHubPage />
        )}
        {page === 'financial-core' && (
          <FinancialCoreHubPage />
        )}
        {page === 'new-event' && <EventFormPage mode="new" onCancel={() => setPage('events')} onSave={saveEvent} />}
        {page === 'edit-event' && <EventFormPage mode="edit" event={selectedEvent} onCancel={() => setPage('events')} onSave={saveEvent} />}
        {page === 'lots' && <LotsPage events={visibleEvents} selectedEvent={selectedEvent} onSelect={setSelectedEvent} onBack={() => setPage('events')} />}
        {page === 'participants' && <ParticipantsPage events={visibleEvents} participants={visibleParticipants} onToggleCheckin={toggleCheckin} onNavigate={navigate} />}
        {page === 'facial' && <FacialPage participants={visibleParticipants} onNavigate={navigate} />}
        {page === 'pos' && <POSPage events={visibleEvents} notify={notify} onNavigate={navigate} />}

        {/* EVENT CONTEXT */}
        {selectedEvent && eventContextPages.has(page) && visibleEvents.some(e => e.id === selectedEvent.id) && (
          <EventContextPage event={selectedEvent} participants={visibleParticipants} page={page} onNavigate={navigate} notify={notify} />
        )}

        {/* HUBS DO FINANCEIRO (FASE 28.15.8.1) */}
        {FINANCE_HUBS[page] && (
          <ModuleHubView
            hubDef={FINANCE_HUBS[page]}
            onNavigate={navigate}
          />
        )}

        {/* HUB FINANCEIRO & DASHBOARD */}
        {page === 'finance-hub' && (
          <FinanceHubPage onNavigate={navigate} />
        )}
        {page === 'finance-dashboard' && (
          <FinanceCommandCenterPage events={visibleEvents} producerId={scopedProducerId} notify={notify} onNavigate={navigate} />
        )}

        {/* FASE 17.3 & 17.4: OPERAÇÕES FINANCEIRAS INTEGRADAS */}
        {page === 'finance' && (
          <FinanceCashOperationsPage mode="balance" events={visibleEvents} producerId={scopedProducerId ?? undefined} notify={notify} onNavigate={navigate} />
        )}
        {page === 'finance-producer-account' && (
          <FinanceProducerAccountPage events={visibleEvents} producerId={scopedProducerId} notify={notify} onNavigate={navigate} />
        )}
        {page === 'finance-statement' && (
          <FinanceCashOperationsPage mode="statement" events={visibleEvents} producerId={scopedProducerId ?? undefined} notify={notify} onNavigate={navigate} />
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

        {/* FASE 17.5 & 20.2: CONCILIAÇÃO BANCÁRIA & OPERACIONAL E ANTECIPAÇÕES */}
        {(page === 'finance-reconciliation' || page === 'finance-bank' || (page as string) === 'fin-conciliacao' || (page as string) === 'conciliacao') && (
          <FinanceReconciliationPage events={visibleEvents} notify={notify} onNavigate={navigate} onBack={() => setPage('finance-dashboard')} />
        )}
        {page === 'finance-advance' && (
          <FinanceSettlementHubPage producerId={scopedProducerId ?? undefined} eventId={selectedEvent?.id} initialTab="advances" notify={notify} onBack={() => setPage('finance-dashboard')} />
        )}

        {/* FASE 17.6: DESPESAS, BORDERÔ E CONSOLIDAÇÃO FINAL */}
        {page === 'finance-expenses' && (
          <FinanceCashOperationsPage mode="expenses" events={visibleEvents} producerId={scopedProducerId ?? undefined} notify={notify} onNavigate={navigate} />
        )}
        {page === 'finance-bordero' && (
          <FinanceBorderoPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}
        {page === 'finance-consolidated' && (
          <FinanceiroConsolidadoPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}

        {/* FASE 26.17.9.4.2: CENTRO DE CUSTOS, ORÇAMENTO E DRE DO EVENTO */}
        {page === 'finance-cost-centers' && (
          <EventCostCentersBudgetPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}

        {/* PLANO DE CONTAS NO FINANCEIRO */}
        {page === 'finance-chart-accounts' && (
          <AccountingChartPage events={visibleEvents} notify={notify} onNavigate={navigate} />
        )}

        {/* HUBS DA CONTABILIDADE (FASE 28.15.8.1) */}
        {ACCOUNTING_HUBS[page] && (
          <ModuleHubView
            hubDef={ACCOUNTING_HUBS[page]}
            onNavigate={navigate}
          />
        )}

        {/* FASE 28.15.4: VIEW FÍSICA ÚNICA DE CONTABILIDADE (view-accounting-disk) */}
        {((page.startsWith('accounting-') && !ACCOUNTING_HUBS[page]) || ['finance-accounting', 'finance-accounting-entries', 'finance-obligations', 'finance-dre', 'finance-borderos', 'finance-signatures', 'finance-closing'].includes(page)) && (
          <FinanceAccountingHubPage
            events={visibleEvents}
            producerId={scopedProducerId}
            initialTab={
              page.startsWith('accounting-')
                ? normalizeAccountingTab(page.replace('accounting-', ''))
                : page === 'finance-accounting-entries' ? 'lancamentos'
                : page === 'finance-obligations' ? 'fiscal'
                : page === 'finance-dre' ? 'dre'
                : page === 'finance-borderos' ? 'documentos'
                : page === 'finance-signatures' ? 'documentos'
                : page === 'finance-closing' ? 'fechamento'
                : 'dashboard'
            }
            notify={notify}
            onBack={() => setPage('profile-dashboard')}
          />
        )}

        {page === 'finance-bank-accounts' && (
          <FinanceCashOperationsPage mode="bank-accounts" events={visibleEvents} producerId={scopedProducerId ?? undefined} notify={notify} onNavigate={navigate} />
        )}

        {/* OUTRAS TELAS FINANCEIRAS */}
        {page === 'finance-sales' && <FinancePage events={visibleEvents} initialTab="sales" notify={notify} />}
        {(page === 'finance-spread-simulator' || (page as string) === 'simulador-spread') && (
          <SimuladorSpreadModule onBack={() => setPage('finance-dashboard')} notify={notify} />
        )}
        {['finance-advanced', 'finance-spread', 'finance-split', 'finance-rates', 'finance-gateways', 'finance-operators', 'finance-methods', 'finance-custom', 'finance-negotiations', 'finance-reports', 'finance-intelligence', 'finance-refunds', 'finance-disputes', 'finance-chargebacks', 'fin-advanced', 'fin-spread', 'simulador-spread', 'fin-split', 'split-financeiro', 'fin-bank-accounts', 'contas-bancarias', 'fin-methods', 'metodos-pagamento', 'fin-custom', 'pagamentos-customizados', 'fin-negotiations', 'negociacoes-financeiras', 'fin-operators', 'operadoras-cartao', 'fin-gateways', 'gateway-pagamentos', 'fin-inteligencia', 'inteligencia-financeira', 'fin-refunds', 'devolucoes-estornos', 'fin-reports', 'relatorios-financeiros', 'finance-pdv', 'fin-pdv', 'pdv'].includes(page) && (
          <AdvancedTaxesRouter
            activeModule={page}
            producerId={scopedProducerId ?? undefined}
            events={visibleEvents}
            eventId={selectedEvent?.id}
            notify={notify}
            onNavigate={navigate}
            onBack={() => setPage('finance-dashboard')}
          />
        )}
        {((page as any) === 'finance-settlement' || (page as any) === 'finance-settlements') && (
          <FinanceSettlementHubPage producerId={scopedProducerId ?? undefined} initialTab="settlements" notify={notify} onBack={() => setPage('finance-dashboard')} />
        )}

        {/* HUBS DO MARKETING (FASE 28.15.8.1) */}
        {MARKETING_HUBS[page] && (
          <ModuleHubView
            hubDef={MARKETING_HUBS[page]}
            onNavigate={navigate}
          />
        )}

        {/* MARKETING */}
        {page === 'marketing-communications' && (
          <CommunicationPage
            producerId={scopedProducerId}
            producerName={scopedProducerId === null ? 'Todas as produtoras' : (producers.find(p => p.id === scopedProducerId)?.name || 'Produtora')}
            notify={notify}
            onNavigate={navigate}
          />
        )}
        {page.startsWith('marketing-') && !MARKETING_HUBS[page] && page !== 'marketing-communications' && (
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
              'marketing-spotify-ads': 'spotify-ads',
              'marketing-spotify': 'spotify-ads',
              'marketing-status-real': 'status-real',
              'marketing-real-status': 'status-real',
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
              'marketing-attribution': 'attribution',
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
              'atendimento': 'hub', 'sac-hub': 'hub', 'sac-dashboard': 'dashboard', 'sac-tickets': 'tickets', 'sac-new': 'new',
              'sac-sla': 'sla', 'sac-integrations': 'integrations', 'sac-knowledge': 'knowledge', 'sac-reports': 'reports'
            } as Record<string, any>)[page] || 'hub'}
            notify={notify}
            onNavigate={navigate}
          />
        )}

        {/* POS */}
        {page === 'pos' && <POSPage events={visibleEvents} initialTab="overview" notify={notify} />}
        {page === 'pos-terminals' && <POSPage events={visibleEvents} initialTab="terminals" notify={notify} />}
        {page === 'pos-sales' && <POSPage events={visibleEvents} initialTab="sales" notify={notify} />}
        {page === 'pos-closing' && <POSPage events={visibleEvents} initialTab="closing" notify={notify} />}
          </>
        )}
      </div>
      </AppShell>

      <nav className="mobile-bottom-nav" aria-label="Navegação mobile">
        <button onClick={() => { navigate(isGlobalAdmin(user) ? 'global-dashboard' : 'profile-dashboard'); setMobileNavOpen(false) }}><Home size={20}/><span>Início</span></button>
        <button onClick={() => { navigate('events'); setMobileNavOpen(false) }}><CalendarDays size={20}/><span>Eventos</span></button>
        <button onClick={() => { navigate('finance-dashboard'); setMobileNavOpen(false) }}><WalletCards size={20}/><span>Financeiro</span></button>
        <button onClick={() => { navigate('marketing-dashboard'); setMobileNavOpen(false) }}><Megaphone size={20}/><span>Marketing</span></button>
        <button onClick={() => setMobileNavOpen(true)}><Menu size={20}/><span>Mais</span></button>
      </nav>

      <AppFooter />
      <ScrollTop />
      {toast && <div className="toast">{toast}</div>}
    </SafeSaffProvider>
  )
}
