import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
// FASE 25.3.2.1 RELEASE: 25.3.2.1-premium-sidebar-auto-collapse-2026-09-02
import { canAccess, type AppUser } from '../auth/model'
import {
  ArrowLeft, WalletCards, HandCoins, TrendingUp, ReceiptText, TrendingDown, Landmark, Scale,
  ChartNoAxesCombined, Split, Brain, CreditCard, ShieldCheck, Ticket,
  PlusSquare, SlidersHorizontal, Users, ScanFace, BarChart3, MonitorSmartphone, ShoppingCart,
  LockKeyhole, MessageCircle, Megaphone, Repeat2, Building2, ChevronRight, UserCog, ScrollText,
  Mail, Tags, Target, UsersRound, ShoppingBag, Clock3,
  FileSpreadsheet, Sparkles, ChevronDown, ListTree, BookOpenText, BookMarked,
  FileSignature, Boxes, BookOpenCheck, FileText, Zap, Link2, Headphones, NotebookTabs, Percent, Store, Undo2,
  PanelLeftClose, PanelLeftOpen, Play, Activity
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
  onCollapsedChange?: (collapsed: boolean) => void
}

type Item = {
  key: PageKey
  label: string
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
  badge?: string
  tier?: 'standard' | 'advanced' | 'expert'
}

// 1. MENU PRINCIPAL
const mainItems: Item[] = [
  { key: 'profile-dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'events', label: 'Todos os Eventos', icon: Ticket },
  { key: 'operations', label: 'Núcleo Operacional', icon: ChartNoAxesCombined },
  { key: 'new-event', label: 'Novo Evento', icon: PlusSquare },
  { key: 'lots', label: 'Configurar Lotes', icon: SlidersHorizontal },
  { key: 'participants', label: 'Participantes', icon: Users },
  { key: 'facial', label: 'Status Faciais', icon: ScanFace },
  { key: 'pos', label: 'Terminais POS', icon: MonitorSmartphone },
  { key: 'sac-hub', label: 'Atendimento / SAC', icon: Headphones },
  { key: 'admin-hub', label: 'Administração', icon: Building2 },
]

// 2. FINANCEIRO: MÓDULOS DE GESTÃO E CAIXA
const independentRefundItem: Item = { key: 'finance-refunds', label: 'Estornos', icon: Undo2, badge: 'ERP' }

const cashFinanceItems: Item[] = [
  { key: 'finance-dashboard', label: 'Dashboard Financeiro', icon: WalletCards },
  { key: 'finance-advance', label: 'Antecipações', icon: Zap },
  { key: 'finance-split', label: 'Divisão de Receitas', icon: Split },
  { key: 'finance-methods', label: 'Pagamentos & Taxas', icon: CreditCard },
  { key: 'finance-reports', label: 'Relatórios Financeiros', icon: FileSpreadsheet },
]

// 3. CONTABILIDADE & BORDERÔS (ERP COMPLETO)
const accountingFinanceItems: Item[] = [
  { key: 'accounting-dashboard', label: 'Dashboard Contábil', icon: BarChart3, badge: 'Contábil' },
  { key: 'finance-chart-accounts', label: 'Plano de Contas', icon: BookOpenCheck },
  { key: 'finance-cost-centers', label: 'Centros de Custos', icon: Boxes },
  { key: 'finance-accounting-entries', label: 'Lançamentos Contábeis', icon: FileText },
  { key: 'accounting-journal', label: 'Livro Diário Oficial', icon: BookOpenText },
  { key: 'accounting-ledger', label: 'Livro Razão Analítico', icon: BookMarked },
  { key: 'finance-dre', label: 'DRE & Orçamento', icon: BarChart3 },
  { key: 'accounting-trial-balance', label: 'Balancete', icon: Scale },
  { key: 'accounting-balance-sheet', label: 'Balanço Patrimonial', icon: Landmark },
  { key: 'accounting-taxes', label: 'Fiscal & Tributos', icon: FileSpreadsheet },
  { key: 'finance-closing', label: 'Fechamento Contábil', icon: LockKeyhole },
  { key: 'accounting-sped', label: 'SPED / ECD / ECF', icon: FileSpreadsheet },
]

// 4. MARKETING & GROWTH
const marketingItems: Item[] = [
  { key: 'marketing-dashboard', label: 'Dashboard Marketing', icon: BarChart3 },
  { key: 'marketing-ready-campaigns', label: 'Campanhas Prontas', icon: Sparkles, badge: '⚡ Pronto' },
  { key: 'marketing-campaigns', label: 'Campanhas Multicanais', icon: Megaphone },
  { key: 'marketing-meta-ads', label: 'Meta Ads', icon: Target },
  { key: 'marketing-google-ads', label: 'Google Ads', icon: ListTree },
  { key: 'marketing-tiktok-ads', label: 'TikTok Ads', icon: Play },
  { key: 'marketing-tracking', label: 'Pixels & Integrações', icon: Activity, badge: '360°' },
  { key: 'marketing-influencers', label: 'Influenciadores', icon: UsersRound },
  { key: 'marketing-utm-central', label: 'Central UTM & Conversões', icon: Link2, badge: 'Novo' },
  { key: 'marketing-whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { key: 'marketing-email', label: 'E-mail Marketing', icon: Mail },
  { key: 'marketing-coupons', label: 'Cupons & Descontos', icon: Tags },
  { key: 'marketing-cashback', label: 'Cashback Promocional', icon: WalletCards },
  { key: 'marketing-reports', label: 'Relatórios de Marketing', icon: FileSpreadsheet }
]

// 5. REMARKETING & RESGATE
const remarketingItems: Item[] = [
  { key: 'remarketing-hub', label: 'Hub Remarketing', icon: Repeat2 },
  { key: 'remarketing-dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'remarketing-carts', label: 'Carrinhos Abandonados', icon: ShoppingCart },
  { key: 'remarketing-flows', label: 'Fluxos de Recuperação', icon: Repeat2 },
  { key: 'remarketing-whatsapp', label: 'WhatsApp Remarketing', icon: MessageCircle },
  { key: 'remarketing-email', label: 'E-mail Remarketing', icon: Mail },
  { key: 'remarketing-payments', label: 'Recuperação de Pagamento', icon: Clock3 }
]

// 6. ADMINISTRAÇÃO & GOVERNANÇA
const adminItems: Item[] = [
  { key: 'admin-hub', label: 'Central Administrativa', icon: Building2 },
  { key: 'admin-users', label: 'Usuários e Acessos', icon: UserCog },
  { key: 'admin-producers', label: 'Produtoras', icon: Building2 },
  { key: 'admin-permissions', label: 'Perfis e Permissões', icon: ShieldCheck },
  { key: 'admin-audit', label: 'Logs de Auditoria', icon: ScrollText },
  { key: 'admin-security', label: 'Segurança & LGPD', icon: LockKeyhole }
]

export default function ModuleSidebar({ module, page, onNavigate, onHome, canAdmin = true, user, onCollapsedChange }: Props) {
  const refundIndependentPages: PageKey[] = ['finance-refunds', 'finance-disputes', 'finance-chargebacks']
  const [openFinance, setOpenFinance] = useState((page.startsWith('finance-') || page === 'finance') && !refundIndependentPages.includes(page))
  const [openAccounting, setOpenAccounting] = useState(page.startsWith('accounting-') || page === 'finance-accounting')
  const [openMarketing, setOpenMarketing] = useState(page.startsWith('marketing-'))
  const [openRemarketing, setOpenRemarketing] = useState(page.startsWith('remarketing-'))
  const [openAdmin, setOpenAdmin] = useState(page.startsWith('admin-'))
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('safesaff.sidebar.collapsed') === 'true'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('safesaff.sidebar.collapsed', String(collapsed))
    }
    onCollapsedChange?.(collapsed)
  }, [collapsed, onCollapsedChange])

  const toggleCollapsed = () => setCollapsed(value => !value)

  return (
    <aside
      className={`module-sidebar safesaff-sidebar ${collapsed ? 'safesaff-sidebar--collapsed' : ''}`}
      aria-label="Navegação principal"
      data-finance-release="25.7.1.1-sidebar-typography-hotfix-2026-09-02 25.7.1-universal-conversion-engine-2026-09-02 25.7-marketing-integrations-360-2026-09-02 25.6.1-sidebar-reference-navigation-2026-09-02 25.3.2.1-premium-sidebar-auto-collapse-2026-09-02"
    >
      <div className="sidebar-top-bar safesaff-sidebar-header">
        <button className="back-module safesaff-sidebar-home" onClick={onHome} title="Ir para o início" aria-label="Ir para o início">
          <ArrowLeft size={18} />
          <span>Navegação</span>
        </button>
        <button
          type="button"
          className="safesaff-sidebar-toggle"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
        >
          {collapsed ? <PanelLeftOpen size={18} strokeWidth={1.8} /> : <PanelLeftClose size={18} strokeWidth={1.8} />}
        </button>
      </div>

      <nav className="module-nav">
        <div className="module-caption">MENU PRINCIPAL</div>
        {mainItems.map((it, index) => {
          if (it.key === 'new-event' && user && user.role !== 'producer-admin' && user.role !== 'admin-master' && user.role !== 'admin') return null
          if (it.key === 'admin-hub' && !canAdmin) return null
          return (
            <NavItem
              key={`${it.key}-${index}`}
              item={it}
              active={page === it.key || (it.key === 'events' && ['edit-event', 'event-dashboard'].includes(page))}
              onNavigate={onNavigate}
            />
          )
        })}

        {/* Section: Financeiro (5 Pilares Principais) */}
        <CollapsibleSection
          label="Financeiro"
          icon={WalletCards}
          open={openFinance}
          onToggle={() => setOpenFinance(!openFinance)}
          onClose={() => setOpenFinance(false)}
        >
          {cashFinanceItems.map((it, index) => {
            const isActive =
              (it.key === 'finance-dashboard' && ['finance', 'finance-dashboard', 'finance-hub', 'finance-producer-account', 'finance-statement', 'finance-payouts', 'finance-cashflow', 'finance-bank-accounts', 'finance-expenses', 'finance-payables', 'finance-receivables', 'finance-reconciliation'].includes(page)) ||
              (it.key === 'finance-advance' && ['finance-advance', 'finance-spread', 'finance-spread-simulator'].includes(page)) ||
              (it.key === 'finance-split' && ['finance-split', 'finance-settlement', 'finance-settlements', 'finance-negotiations'].includes(page)) ||
              (it.key === 'finance-methods' && ['finance-methods', 'finance-custom', 'finance-operators', 'finance-gateways', 'finance-intelligence', 'finance-rates'].includes(page)) ||
              (it.key === 'finance-reports' && ['finance-reports', 'finance-bordero', 'finance-advanced', 'finance-consolidated'].includes(page)) ||
              page === it.key

            return (
              <NavItem
                key={`cash-${it.key}-${index}`}
                item={it}
                active={isActive}
                onNavigate={onNavigate}
                indent
              />
            )
          })}
        </CollapsibleSection>

        {/* Fase 24.9 — Estornos é módulo independente, fora do Financeiro */}
        <div className="module-caption">OPERAÇÕES CRÍTICAS</div>
        <NavItem
          item={independentRefundItem}
          active={refundIndependentPages.includes(page)}
          onNavigate={onNavigate}
        />

        {/* Section: Financeiro Contábil & Borderôs */}
        <CollapsibleSection
          label="Contabilidade"
          icon={BookOpenCheck}
          open={openAccounting}
          onToggle={() => setOpenAccounting(!openAccounting)}
          onClose={() => setOpenAccounting(false)}
        >
          {accountingFinanceItems.map((it, index) => (
            <NavItem
              key={`acc-${it.key}-${index}`}
              item={it}
              active={page === it.key}
              onNavigate={onNavigate}
              indent
            />
          ))}
        </CollapsibleSection>

        {/* Section: Marketing */}
        <CollapsibleSection
          label="Marketing"
          icon={Megaphone}
          open={openMarketing}
          onToggle={() => setOpenMarketing(!openMarketing)}
          onClose={() => setOpenMarketing(false)}
        >
          {marketingItems.map((it, index) => (
            <NavItem
              key={`mkt-${it.key}-${index}`}
              item={it}
              active={page === it.key}
              onNavigate={onNavigate}
              indent
            />
          ))}
        </CollapsibleSection>

        {/* Section: Remarketing */}
        <CollapsibleSection
          label="Remarketing"
          icon={Repeat2}
          open={openRemarketing}
          onToggle={() => setOpenRemarketing(!openRemarketing)}
          onClose={() => setOpenRemarketing(false)}
        >
          {remarketingItems.map((it, index) => (
            <NavItem
              key={`rmk-${it.key}-${index}`}
              item={it}
              active={page === it.key}
              onNavigate={onNavigate}
              indent
            />
          ))}
        </CollapsibleSection>

        {/* Section: Administração */}
        {canAdmin && (
          <CollapsibleSection
            label="Administração"
            icon={Building2}
            open={openAdmin}
            onToggle={() => setOpenAdmin(!openAdmin)}
            onClose={() => setOpenAdmin(false)}
          >
            {adminItems.map((it, index) => (
              <NavItem
                key={`adm-${it.key}-${index}`}
                item={it}
                active={page === it.key}
                onNavigate={onNavigate}
                indent
              />
            ))}
          </CollapsibleSection>
        )}
      </nav>
    </aside>
  )
}

function CollapsibleSection({
  label,
  icon: SectionIcon,
  open,
  onToggle,
  onClose,
  children
}: {
  label: string
  icon?: ComponentType<{ size?: number; strokeWidth?: number }>
  open: boolean
  onToggle: () => void
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div
      className="collapsible-nav-section"
      onMouseLeave={() => {
        // Desktop com mouse: mantém a expansão temporária aprovada na Fase 25.3.2.1.
        // Touch/tablet não fecha por mouseleave sintético.
        if (open && typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) onClose()
      }}
    >
      <button
        type="button"
        className={`collapsible-section-head ${open ? 'open' : ''}`}
        onClick={onToggle}
        aria-expanded={open}
        title={label}
      >
        {SectionIcon && <span className="module-nav-icon collapsible-section-icon" aria-hidden="true"><SectionIcon size={18} strokeWidth={1.8} /></span>}
        <span className="collapsible-section-label">{label}</span>
        <span className="collapsible-section-chevron" aria-hidden="true">
          <ChevronRight size={14} />
        </span>
      </button>
      <div className={`collapsible-section-body ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="collapsible-section-inner">{children}</div>
      </div>
    </div>
  )
}

function NavItem({
  item,
  active,
  onNavigate,
  indent = false
}: {
  item: Item
  active: boolean
  onNavigate: (p: PageKey) => void
  indent?: boolean
}) {
  const Icon = item.icon
  return (
    <button
      className={`module-nav-item ${active ? 'active' : ''} ${indent ? 'indent' : ''}`}
      onClick={() => onNavigate(item.key)}
      title={item.label}
      aria-current={active ? 'page' : undefined}
    >
      <span className="module-nav-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.8} /></span>
      <span className="module-nav-label">{item.label}</span>
      {item.badge && <span className="nav-item-badge">{item.badge}</span>}
      {item.tier === 'expert' && <span className="expert-dot" title="Recurso Expert" />}
    </button>
  )
}
