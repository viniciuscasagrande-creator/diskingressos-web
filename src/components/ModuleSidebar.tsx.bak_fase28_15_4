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
  PanelLeftClose, PanelLeftOpen, Activity, Play, ArrowLeftRight, ArrowDownLeft, ArrowUpRight, CircleDollarSign, Calendar, CheckCircle2
} from 'lucide-react'

export type ModuleKey = 'events' | 'finance' | 'accounting' | 'pos' | 'facial' | 'admin' | 'marketing' | 'remarketing' | 'sac'

export type PageKey =
  | 'profile-dashboard' | 'global-dashboard' | 'events' | 'operations' | 'new-event' | 'lots' | 'participants' | 'edit-event' | 'event-command-center' | 'event-inventory' | 'event-customer-360' | 'event-dashboard'
  | 'event-live-ops' | 'event-incidents' | 'event-revenue-intel' | 'event-global-search' | 'event-permission-engine' | 'event-compliance' | 'event-intelligence' | 'event-readiness' | 'event-forecast' | 'event-day-command' | 'event-producer-executive' | 'event-platform-noc'
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
  | 'marketing-hub' | 'marketing-dashboard' | 'marketing-status-real' | 'marketing-real-status' | 'marketing-campaigns' | 'marketing-ready-campaigns' | 'marketing-create' | 'marketing-meta-ads' | 'marketing-google-ads' | 'marketing-tiktok-ads' | 'marketing-spotify-ads' | 'marketing-spotify' | 'marketing-influencers' | 'marketing-automations' | 'marketing-whatsapp' | 'marketing-email' | 'marketing-crm' | 'marketing-audiences' | 'marketing-coupons' | 'marketing-cashback' | 'marketing-coins' | 'marketing-gamification' | 'marketing-referral' | 'marketing-affiliates' | 'marketing-utm-central' | 'marketing-links' | 'marketing-tracking' | 'marketing-attribution' | 'marketing-conversions' | 'marketing-remarketing' | 'marketing-recovery' | 'marketing-reports' | 'marketing-channel-performance' | 'marketing-campaign-ranking' | 'marketing-funnel-insights' | 'marketing-communications'
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

// 2. FINANCEIRO: ESTRUTURA ERP COMPLETA (FASE 26.17.9.4.2)
const independentRefundItem: Item = { key: 'finance-refunds', label: 'Estornos', icon: Undo2, badge: 'ERP' }

const mainFinanceDashboardItem: Item = { key: 'finance-dashboard', label: 'Dashboard Financeiro', icon: WalletCards }

// CONTA FINANCEIRA
const financeAccountGroup: Item[] = [
  { key: 'finance-producer-account', label: 'Conta do Produtor', icon: Landmark },
  { key: 'finance-hub', label: 'Saldo por Evento', icon: WalletCards },
  { key: 'finance-statement', label: 'Extrato', icon: ReceiptText },
  { key: 'finance-producer-account', label: 'Transferências entre Eventos', icon: ArrowLeftRight },
]

// GESTÃO
const financeManagementGroup: Item[] = [
  { key: 'finance-receivables', label: 'Contas a Receber', icon: ArrowDownLeft },
  { key: 'finance-payables', label: 'Contas a Pagar', icon: ArrowUpRight },
  { key: 'finance-cost-centers', label: 'Centro de Custos', icon: Boxes },
  { key: 'finance-dre', label: 'Orçamentos', icon: Scale },
  { key: 'finance-expenses', label: 'Fornecedores', icon: Users },
]

// RECEBIMENTOS
const financeReceivablesGroup: Item[] = [
  { key: 'finance-receivables', label: 'Recebíveis', icon: CircleDollarSign },
  { key: 'finance-cashflow', label: 'Agenda Financeira', icon: Calendar },
  { key: 'finance-payouts', label: 'Repasses', icon: HandCoins },
  { key: 'finance-advance', label: 'Antecipações', icon: Zap },
  { key: 'finance-reconciliation', label: 'Conciliação', icon: CheckCircle2 },
]

// ANÁLISE
const financeAnalysisGroup: Item[] = [
  { key: 'finance-cashflow', label: 'Fluxo de Caixa', icon: TrendingUp },
  { key: 'finance-cost-centers', label: 'Resultado por Evento', icon: BarChart3 },
  { key: 'finance-split', label: 'Divisão de Receitas', icon: Split },
  { key: 'finance-methods', label: 'Pagamentos & Taxas', icon: CreditCard },
  { key: 'finance-reports', label: 'Relatórios Financeiros', icon: FileSpreadsheet },
]

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
  { key: 'marketing-status-real', label: 'Status Real', icon: Activity, badge: 'Ao vivo' },
  { key: 'marketing-ready-campaigns', label: 'Campanhas Prontas', icon: Sparkles, badge: '⚡ Pronto' },
  { key: 'marketing-campaigns', label: 'Campanhas Multicanais', icon: Megaphone },
  { key: 'marketing-meta-ads', label: 'Meta Ads', icon: Target },
  { key: 'marketing-google-ads', label: 'Google Ads', icon: ListTree },
  { key: 'marketing-tiktok-ads', label: 'TikTok Ads', icon: Play },
  { key: 'marketing-spotify', label: 'Spotify Ads', icon: Headphones },
  { key: 'marketing-tracking', label: 'Pixels e Conversões', icon: Activity, badge: '360°' },
  { key: 'marketing-attribution', label: 'Atribuição Multicanal', icon: Scale, badge: '25.7.2' },
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
  const isFinanceActive = (page.startsWith('finance-') || page === 'finance') && !refundIndependentPages.includes(page)
  const isAccountingActive = page.startsWith('accounting-') || page === 'finance-accounting'
  const isMarketingActive =
    page.startsWith('marketing-') ||
    page === 'marketing-spotify' ||
    page === 'marketing-spotify-ads' ||
    (typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/app/marketing') ||
      window.location.pathname.startsWith('/app/marketing-')
    ))
  const isRemarketingActive = page.startsWith('remarketing-')
  const isAdminActive = page.startsWith('admin-')

  const [openFinance, setOpenFinance] = useState(isFinanceActive)
  const [openAccounting, setOpenAccounting] = useState(isAccountingActive)
  const [openMarketing, setOpenMarketing] = useState(isMarketingActive)
  const [openRemarketing, setOpenRemarketing] = useState(isRemarketingActive)
  const [openAdmin, setOpenAdmin] = useState(isAdminActive)

  useEffect(() => {
    if (isMarketingActive) setOpenMarketing(true)
  }, [page, isMarketingActive])

  useEffect(() => {
    if (isFinanceActive) setOpenFinance(true)
  }, [page, isFinanceActive])

  useEffect(() => {
    if (isAccountingActive) setOpenAccounting(true)
  }, [page, isAccountingActive])

  useEffect(() => {
    if (isRemarketingActive) setOpenRemarketing(true)
  }, [page, isRemarketingActive])

  useEffect(() => {
    if (isAdminActive) setOpenAdmin(true)
  }, [page, isAdminActive])
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
      data-core-protection-release="26.x.3.10-runtime-functional-stability-2026-09-03"
      data-finance-release="25.8.2-event-remarketing-functional-2026-09-02 25.8.1-abandoned-cart-tenant-event-scope-2026-09-02 25.8-enterprise-refund-engine-2026-09-02 25.7.1.1-sidebar-typography-hotfix-2026-09-02 25.7.1-universal-conversion-engine-2026-09-02 25.7-marketing-integrations-360-2026-09-02 25.6.1-sidebar-reference-navigation-2026-09-02 25.3.2.1-premium-sidebar-auto-collapse-2026-09-02"
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

        {/* Section: Financeiro (ERP Estruturado - Fase 26.17.9.4.2) */}
        <CollapsibleSection
          label="Financeiro"
          icon={WalletCards}
          open={openFinance}
          keepOpen={isFinanceActive}
          onToggle={() => setOpenFinance(!openFinance)}
          onClose={() => {
            if (!isFinanceActive) setOpenFinance(false)
          }}
        >
          {/* Dashboard Financeiro Principal Preservado */}
          <NavItem
            item={mainFinanceDashboardItem}
            active={page === 'finance-dashboard' || page === 'finance'}
            onNavigate={onNavigate}
            indent
          />

          {/* Grupo 1: CONTA FINANCEIRA */}
          <div className="module-caption" style={{ padding: '8px 12px 2px 18px', fontSize: '9px', fontWeight: 800, color: '#64748b' }}>
            CONTA FINANCEIRA
          </div>
          {financeAccountGroup.map((it, idx) => (
            <NavItem
              key={`acc-${it.key}-${it.label}-${idx}`}
              item={it}
              active={page === it.key && (it.label !== 'Extrato' || page === 'finance-statement')}
              onNavigate={onNavigate}
              indent
            />
          ))}

          {/* Grupo 2: GESTÃO */}
          <div className="module-caption" style={{ padding: '8px 12px 2px 18px', fontSize: '9px', fontWeight: 800, color: '#64748b' }}>
            GESTÃO
          </div>
          {financeManagementGroup.map((it, idx) => (
            <NavItem
              key={`mgt-${it.key}-${it.label}-${idx}`}
              item={it}
              active={page === it.key}
              onNavigate={onNavigate}
              indent
            />
          ))}

          {/* Grupo 3: RECEBIMENTOS */}
          <div className="module-caption" style={{ padding: '8px 12px 2px 18px', fontSize: '9px', fontWeight: 800, color: '#64748b' }}>
            RECEBIMENTOS
          </div>
          {financeReceivablesGroup.map((it, idx) => (
            <NavItem
              key={`rec-${it.key}-${it.label}-${idx}`}
              item={it}
              active={page === it.key}
              onNavigate={onNavigate}
              indent
            />
          ))}

          {/* Grupo 4: ANÁLISE */}
          <div className="module-caption" style={{ padding: '8px 12px 2px 18px', fontSize: '9px', fontWeight: 800, color: '#64748b' }}>
            ANÁLISE
          </div>
          {financeAnalysisGroup.map((it, idx) => (
            <NavItem
              key={`ana-${it.key}-${it.label}-${idx}`}
              item={it}
              active={page === it.key}
              onNavigate={onNavigate}
              indent
            />
          ))}
        </CollapsibleSection>

        {/* Fase 24.9 — Estornos é módulo independente */}
        <span className="sr-only">24.9-independent-refunds-2026-09-02</span>
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
          keepOpen={isAccountingActive}
          onToggle={() => setOpenAccounting(!openAccounting)}
          onClose={() => {
            if (!isAccountingActive) setOpenAccounting(false)
          }}
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
          keepOpen={isMarketingActive}
          onToggle={() => setOpenMarketing(!openMarketing)}
          onClose={() => {
            if (!isMarketingActive) setOpenMarketing(false)
          }}
        >
          {marketingItems.map((it, index) => {
            const isItemActive =
              page === it.key ||
              ((it.key === 'marketing-spotify' || it.key === 'marketing-spotify-ads') &&
                (page === 'marketing-spotify' || page === 'marketing-spotify-ads'))
            return (
              <NavItem
                key={`mkt-${it.key}-${index}`}
                item={it}
                active={isItemActive}
                onNavigate={onNavigate}
                indent
              />
            )
          })}
        </CollapsibleSection>

        {/* Section: Remarketing */}
        <CollapsibleSection
          label="Remarketing"
          icon={Repeat2}
          open={openRemarketing}
          keepOpen={isRemarketingActive}
          onToggle={() => setOpenRemarketing(!openRemarketing)}
          onClose={() => {
            if (!isRemarketingActive) setOpenRemarketing(false)
          }}
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
            keepOpen={isAdminActive}
            onToggle={() => setOpenAdmin(!openAdmin)}
            onClose={() => {
              if (!isAdminActive) setOpenAdmin(false)
            }}
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
  keepOpen = false,
  children
}: {
  label: string
  icon?: ComponentType<{ size?: number; strokeWidth?: number }>
  open: boolean
  onToggle: () => void
  onClose: () => void
  keepOpen?: boolean
  children: ReactNode
}) {
  return (
    <div
      className="collapsible-nav-section"
      onMouseLeave={() => {
        // Desktop com mouse: mantém a expansão temporária aprovada na Fase 25.3.2.1.
        // Touch/tablet não fecha por mouseleave sintético.
        if (open && !keepOpen && typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          onClose()
        }
      }}
    >
      <button
        type="button"
        className={`collapsible-section-head ${open ? 'open' : ''}`}
        onClick={onToggle}
        aria-expanded={open}
        title={label}
        data-testid={`collapsible-${label.toLowerCase().replace(/\s+/g, '-')}`}
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
      data-testid={`nav-${item.key}`}
      data-nav-key={item.key}
      data-protected-module={({
        'events': 'eventos',
        'finance-dashboard': 'financeiro',
        'finance-refunds': 'estornos',
        'marketing-dashboard': 'marketing',
        'sac-hub': 'sac'
      } as Partial<Record<PageKey, string>>)[item.key]}
    >
      <span className="module-nav-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.8} /></span>
      <span className="module-nav-label">{item.label}</span>
      {item.badge && <span className="nav-item-badge">{item.badge}</span>}
      {item.tier === 'expert' && <span className="expert-dot" title="Recurso Expert" />}
    </button>
  )
}
