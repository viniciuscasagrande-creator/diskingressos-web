import { useState, useEffect, type ComponentType } from 'react'
import { canAccess, type AppUser } from '../auth/model'
import {
  ArrowLeft, ArrowLeftRight, WalletCards, HandCoins, ReceiptText, TrendingDown,
  Landmark, Scale, ChartNoAxesCombined, Split, Brain, CreditCard, ShieldCheck,
  Ticket, PlusSquare, Users, ScanFace, BarChart3, MonitorSmartphone,
  LockKeyhole, MessageCircle, Building2, Headphones, FileSpreadsheet,
  Zap, Undo2, Store
} from 'lucide-react'

export type ModuleKey = 'events' | 'finance' | 'accounting' | 'pos' | 'facial' | 'admin' | 'marketing' | 'remarketing' | 'sac'

export type PageKey =
  | 'profile-dashboard' | 'global-dashboard' | 'events' | 'operations' | 'new-event' | 'lots' | 'participants' | 'edit-event' | 'event-dashboard'
  | 'event-tickets' | 'event-courtesy' | 'event-reports' | 'event-details' | 'event-pixel' | 'event-utm' | 'event-ga4' | 'event-traffic' | 'event-meta-ads' | 'event-remarketing' | 'event-users' | 'event-audit' | 'event-permissions'
  | 'facial'
  // FINANCEIRO
  | 'finance-dashboard' | 'finance-hub' | 'finance' | 'finance-producer-account' | 'finance-statement' | 'finance-cashflow' | 'finance-receivables' | 'finance-payables' | 'finance-spread-simulator'
  | 'finance-payouts' | 'finance-advance' | 'finance-reconciliation' | 'finance-bank-accounts' | 'finance-expenses' | 'finance-bordero' | 'finance-consolidated'
  | 'finance-spread' | 'finance-split' | 'finance-methods' | 'finance-reports' | 'finance-sales' | 'finance-bank' | 'finance-intelligence' | 'finance-custom' | 'finance-operators' | 'finance-negotiations' | 'finance-refunds' | 'finance-disputes' | 'finance-chargebacks' | 'finance-gateways' | 'finance-advanced' | 'finance-rates' | 'finance-pdv'
  | 'finance-accounting' | 'finance-cost-centers' | 'finance-chart-accounts' | 'finance-accounting-entries' | 'finance-obligations' | 'finance-dre' | 'finance-borderos' | 'finance-signatures' | 'finance-closing'
  // CONTABILIDADE
  | 'accounting-dashboard' | 'accounting-chart' | 'accounting-journal' | 'accounting-ledger' | 'accounting-entries' | 'accounting-cost-centers'
  | 'accounting-reconciliation' | 'accounting-audit' | 'accounting-closing'
  | 'accounting-taxes' | 'accounting-nfse' | 'accounting-nfe' | 'accounting-sped' | 'accounting-obligations'
  | 'accounting-dre' | 'accounting-balance-sheet' | 'accounting-trial-balance' | 'accounting-cashflow' | 'accounting-journal-rep' | 'accounting-ledger-rep' | 'accounting-exports'
  | 'accounting-settings' | 'accounting-companies' | 'accounting-integrations'
  // POS & ADMIN & OUTROS
  | 'pos' | 'pos-terminals' | 'pos-sales' | 'pos-closing'
  | 'admin-hub' | 'admin-users' | 'admin-producers' | 'admin-permissions' | 'admin-audit' | 'admin-security'
  | 'marketing-hub' | 'marketing-dashboard' | 'marketing-campaigns' | 'marketing-ready-campaigns' | 'marketing-create' | 'marketing-meta-ads' | 'marketing-google-ads' | 'marketing-tiktok-ads' | 'marketing-influencers' | 'marketing-automations' | 'marketing-whatsapp' | 'marketing-email' | 'marketing-crm' | 'marketing-audiences' | 'marketing-coupons' | 'marketing-cashback' | 'marketing-coins' | 'marketing-gamification' | 'marketing-referral' | 'marketing-affiliates' | 'marketing-utm-central' | 'marketing-links' | 'marketing-tracking' | 'marketing-conversions' | 'marketing-remarketing' | 'marketing-recovery' | 'marketing-reports' | 'marketing-channel-performance' | 'marketing-campaign-ranking' | 'marketing-funnel-insights' | 'marketing-communications'
  | 'remarketing-hub' | 'remarketing-dashboard' | 'remarketing-carts' | 'remarketing-audiences' | 'remarketing-segments' | 'remarketing-flows' | 'remarketing-whatsapp' | 'remarketing-email' | 'remarketing-payments' | 'remarketing-inactive' | 'remarketing-postevent' | 'remarketing-automation' | 'remarketing-reports'
  | 'sac-hub' | 'sac-dashboard' | 'sac-tickets' | 'sac-new' | 'sac-sla' | 'sac-integrations' | 'sac-knowledge' | 'sac-reports'

type Props = {
  module: ModuleKey
  page: PageKey
  onNavigate: (p: PageKey) => void
  onHome: () => void
  canAdmin?: boolean
  user?: AppUser
}

type Item = {
  key: PageKey
  label: string
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
  badge?: string
  onClick?: () => void
}

export default function ModuleSidebar({ module, page, onNavigate, onHome, canAdmin = true, user }: Props) {
  const isFinancePage = (page.startsWith('finance-') || page === 'finance')
  const [viewMode, setViewMode] = useState<'main' | 'finance'>(isFinancePage ? 'finance' : 'main')
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (isFinancePage) {
      setViewMode('finance')
    }
  }, [page, isFinancePage])

  // 1. MENU PRINCIPAL (1:1 com o vídeo de referência)
  const mainItems: Item[] = [
    { key: 'profile-dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'admin-producers', label: 'Dados da Produtora', icon: Building2 },
    { key: 'facial', label: 'Status Faciais', icon: ScanFace },
    { key: 'events', label: 'Todos os Eventos', icon: Ticket },
    {
      key: 'finance-dashboard',
      label: 'Financeiro',
      icon: WalletCards,
      onClick: () => {
        setViewMode('finance')
        onNavigate('finance-dashboard')
      }
    },
    { key: 'new-event', label: 'Novo Evento', icon: PlusSquare },
    { key: 'pos', label: 'Terminais POS', icon: MonitorSmartphone },
    { key: 'marketing-communications', label: 'Mensagens', icon: MessageCircle },
    { key: 'sac-hub', label: 'SAC / Atendimento', icon: Headphones },
    { key: 'admin-users', label: 'Gerenciar Acessos', icon: LockKeyhole },
    { key: 'admin-hub', label: 'Administração', icon: ShieldCheck },
    { key: 'events', label: 'Clube Rua da Musica', icon: Store }
  ]

  // 2. SUBMENU FINANCEIRO (1:1 com o vídeo de referência)
  const financeItems: Item[] = [
    { key: 'finance-dashboard', label: 'Hub Financeiro', icon: WalletCards },
    { key: 'finance', label: 'Saldo Consolidado', icon: WalletCards },
    { key: 'finance-payouts', label: 'Solicitações de Repasse', icon: HandCoins },
    { key: 'finance-advance', label: 'Antecipações', icon: Zap },
    { key: 'finance-statement', label: 'Extrato Detalhado', icon: ReceiptText },
    { key: 'finance-expenses', label: 'Despesas', icon: TrendingDown },
    { key: 'finance-bank-accounts', label: 'Contas Bancárias', icon: Landmark },
    { key: 'finance-bordero', label: 'Borderô', icon: FileSpreadsheet },
    { key: 'finance-negotiations', label: 'Negociações', icon: Scale }
  ]

  // 3. OPERAÇÕES AVANÇADAS FINANCEIRAS
  const financeAdvancedItems: Item[] = [
    { key: 'finance-advanced', label: 'Financeiro Advanced', icon: ChartNoAxesCombined },
    { key: 'finance-split', label: 'Split Financeiro', icon: Split },
    { key: 'finance-intelligence', label: 'Inteligência Financ.', icon: Brain },
    { key: 'finance-methods', label: 'Métodos de Pagamento', icon: CreditCard }
  ]

  // 4. ESTORNO INDEPENDENTE (Fase 24.9)
  const independentRefundItem: Item = {
    key: 'finance-refunds',
    label: 'Estornos & Reembolsos',
    icon: Undo2,
    badge: 'ERP'
  }

  return (
    <aside
      className={`module-sidebar ${collapsed ? 'collapsed' : ''}`}
      data-finance-release="25.3.2.1-premium-sidebar-auto-collapse-2026-09-02"
    >
      {/* Top Header Row com botão de colapso ⇄ */}
      <div className="sidebar-top-bar">
        {viewMode === 'main' ? (
          <div className="sidebar-title-row">
            {!collapsed && <span className="sidebar-title-text">Navegação</span>}
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
              aria-label="Alternar recolhimento"
            >
              <ArrowLeftRight size={15} />
            </button>
          </div>
        ) : (
          <div className="sidebar-title-row">
            <button
              type="button"
              className="sidebar-back-btn"
              onClick={() => {
                setViewMode('main')
                onHome()
              }}
              title="Voltar ao Menu Principal"
            >
              <ArrowLeft size={16} />
              {!collapsed && <span>Voltar</span>}
            </button>
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
              aria-label="Alternar recolhimento"
            >
              <ArrowLeftRight size={15} />
            </button>
          </div>
        )}
      </div>

      <nav className="module-nav">
        {viewMode === 'main' ? (
          <>
            {!collapsed && <div className="module-caption">MENU PRINCIPAL</div>}
            {mainItems.map((it, index) => {
              if (it.key === 'new-event' && user && user.role !== 'producer-admin' && user.role !== 'admin-master' && user.role !== 'admin') return null
              if (it.key === 'admin-hub' && !canAdmin) return null

              const isActive =
                page === it.key ||
                (it.key === 'events' && ['edit-event', 'event-dashboard'].includes(page)) ||
                (it.key === 'finance-dashboard' && isFinancePage)

              return (
                <NavItem
                  key={`${it.key}-${index}`}
                  item={it}
                  active={isActive}
                  collapsed={collapsed}
                  onNavigate={it.onClick || (() => onNavigate(it.key))}
                />
              )
            })}
          </>
        ) : (
          <>
            {financeItems.map((it, index) => {
              const isActive = page === it.key || (it.key === 'finance-dashboard' && page === 'finance-hub')
              return (
                <NavItem
                  key={`fin-${it.key}-${index}`}
                  item={it}
                  active={isActive}
                  collapsed={collapsed}
                  onNavigate={() => onNavigate(it.key)}
                />
              )
            })}

            {!collapsed && <div className="module-caption">OPERAÇÕES AVANÇADAS</div>}
            {financeAdvancedItems.map((it, index) => (
              <NavItem
                key={`adv-${it.key}-${index}`}
                item={it}
                active={page === it.key}
                collapsed={collapsed}
                onNavigate={() => onNavigate(it.key)}
              />
            ))}

            {/* Estornos Independente */}
            {!collapsed && <div className="module-caption">ESTORNO</div>}
            <NavItem
              item={independentRefundItem}
              active={['finance-refunds', 'finance-disputes', 'finance-chargebacks'].includes(page)}
              collapsed={collapsed}
              onNavigate={() => onNavigate('finance-refunds')}
            />
          </>
        )}
      </nav>
    </aside>
  )
}

function NavItem({
  item,
  active,
  collapsed,
  onNavigate
}: {
  item: Item
  active: boolean
  collapsed: boolean
  onNavigate: () => void
}) {
  const Icon = item.icon
  return (
    <button
      className={`module-nav-item ${active ? 'active' : ''}`}
      onClick={onNavigate}
      title={item.label}
      aria-current={active ? 'page' : undefined}
    >
      <span className="module-nav-icon" aria-hidden="true">
        <Icon size={18} strokeWidth={1.8} />
      </span>
      {!collapsed && <span className="module-nav-label">{item.label}</span>}
      {!collapsed && item.badge && <span className="nav-item-badge">{item.badge}</span>}
    </button>
  )
}
