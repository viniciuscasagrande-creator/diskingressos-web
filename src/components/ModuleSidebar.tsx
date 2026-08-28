import { useState, type ComponentType, type ReactNode } from 'react'
import { canAccess, type AppUser } from '../auth/model'
import {
  ArrowLeft, WalletCards, HandCoins, TrendingUp, ReceiptText, TrendingDown, Landmark, PenTool, Scale,
  ChartNoAxesCombined, Split, Brain, CreditCard, Settings, ShieldCheck, LayoutDashboard, Ticket,
  PlusSquare, SlidersHorizontal, Users, ScanFace, BarChart3, CircleGauge, MonitorSmartphone, ShoppingCart,
  LockKeyhole, MessageCircle, Megaphone, Repeat2, Building2, ChevronRight, UserCog, ScrollText,
  Mail, Tags, Bot, Target, QrCode, UsersRound, ShoppingBag, GitBranch, CreditCard as CreditCardIcon,
  UserRoundCheck, Headphones, Clock3, BookOpen, Link2, FileBarChart, Zap, FileSpreadsheet,
  ArrowDownLeft, ArrowUpRight, Percent, BookMarked, ClipboardList, Building, FileCheck, Sparkles,
  Layers, Lock, CheckCircle2, ChevronDown, ListTree, NotebookTabs, BookOpenText, CalendarCheck2, ArrowLeftRight
} from 'lucide-react'

export type ModuleKey = 'events' | 'finance' | 'accounting' | 'pos' | 'facial' | 'admin' | 'marketing' | 'remarketing' | 'sac'

export type PageKey =
  | 'profile-dashboard' | 'global-dashboard' | 'events' | 'operations' | 'new-event' | 'lots' | 'participants' | 'edit-event' | 'event-dashboard'
  | 'event-tickets' | 'event-courtesy' | 'event-reports' | 'event-details' | 'event-pixel' | 'event-utm' | 'event-ga4' | 'event-traffic' | 'event-meta-ads' | 'event-remarketing' | 'event-users' | 'event-audit' | 'event-permissions'
  | 'facial'
  // FINANCEIRO
  | 'finance-dashboard' | 'finance-hub' | 'finance' | 'finance-statement' | 'finance-cashflow' | 'finance-receivables' | 'finance-payables'
  | 'finance-payouts' | 'finance-advance' | 'finance-reconciliation' | 'finance-bank-accounts' | 'finance-expenses' | 'finance-bordero' | 'finance-consolidated'
  | 'finance-spread' | 'finance-split' | 'finance-methods' | 'finance-reports' | 'finance-sales' | 'finance-bank' | 'finance-intelligence' | 'finance-custom' | 'finance-operators' | 'finance-negotiations' | 'finance-refunds'
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
  { key: 'marketing-hub', label: 'Marketing', icon: Megaphone },
  { key: 'remarketing-hub', label: 'Remarketing', icon: Repeat2 },
  { key: 'admin-hub', label: 'Administração', icon: Building2 },
]

// 2. FINANCEIRO
const financeItems: Item[] = [
  { key: 'finance-dashboard', label: 'Dashboard Financeiro', icon: BarChart3 },
  { key: 'finance', label: 'Saldos & Carteira', icon: WalletCards },
  { key: 'finance-statement', label: 'Extrato', icon: ReceiptText },
  { key: 'finance-cashflow', label: 'Fluxo de Caixa', icon: TrendingUp },
  { key: 'finance-receivables', label: 'Contas a Receber', icon: ArrowDownLeft, tier: 'advanced' },
  { key: 'finance-payables', label: 'Contas a Pagar', icon: ArrowUpRight, tier: 'advanced' },
  { key: 'finance-payouts', label: 'Repasses', icon: Landmark },
  { key: 'finance-advance', label: 'Antecipações', icon: Zap },
  { key: 'finance-reconciliation', label: 'Conciliação Bancária', icon: Scale, tier: 'advanced' },
  { key: 'finance-bank-accounts', label: 'Contas Bancárias', icon: Building },
  { key: 'finance-expenses', label: 'Despesas', icon: TrendingDown },
  { key: 'finance-bordero', label: 'Borderô', icon: FileSpreadsheet },
  { key: 'finance-consolidated', label: 'Consolidado (12)', icon: CheckCircle2, badge: 'Fase 17' },
]

// 3. CONTABILIDADE
const accountingItems: Item[] = [
  { key: 'accounting-dashboard', label: 'Dashboard Contábil', icon: BarChart3 },
  { key: 'accounting-chart', label: 'Plano de Contas', icon: ListTree },
  { key: 'accounting-entries', label: 'Lançamentos', icon: NotebookTabs },
  { key: 'accounting-journal', label: 'Livro Diário', icon: BookOpenText },
  { key: 'accounting-ledger', label: 'Livro Razão', icon: BookMarked },
  { key: 'accounting-cost-centers', label: 'Centro de Custos', icon: Building2, tier: 'advanced' },
  { key: 'accounting-reconciliation', label: 'Conciliação Contábil', icon: Scale, tier: 'advanced' },
  { key: 'accounting-audit', label: 'Auditoria', icon: ShieldCheck, tier: 'expert' },
  { key: 'accounting-closing', label: 'Fechamento', icon: CalendarCheck2, tier: 'advanced' },
  { key: 'accounting-dre', label: 'DRE / Balancete', icon: FileSpreadsheet },
]

// 4. MARKETING
const marketingItems: Item[] = [
  { key: 'marketing-hub', label: 'Hub Marketing', icon: Megaphone },
  { key: 'marketing-dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'marketing-ready-campaigns', label: 'Campanhas Prontas', icon: Sparkles, badge: '⚡ Pronto' },
  { key: 'marketing-campaigns', label: 'Campanhas Multicanais', icon: Megaphone },
  { key: 'marketing-meta-ads', label: 'Meta Ads', icon: Target },
  { key: 'marketing-google-ads', label: 'Google Ads', icon: ListTree },
  { key: 'marketing-influencers', label: 'Influenciadores', icon: UsersRound },
  { key: 'marketing-utm-central', label: 'Central UTM & Conversões', icon: Link2, badge: 'Novo' },
  { key: 'marketing-whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { key: 'marketing-email', label: 'E-mail Marketing', icon: Mail },
  { key: 'marketing-coupons', label: 'Cupons & Descontos', icon: Tags },
  { key: 'marketing-cashback', label: 'Cashback Promocional', icon: WalletCards },
  { key: 'marketing-reports', label: 'Relatórios de Marketing', icon: FileSpreadsheet }
]

// 5. REMARKETING
const remarketingItems: Item[] = [
  { key: 'remarketing-hub', label: 'Hub Remarketing', icon: Repeat2 },
  { key: 'remarketing-dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'remarketing-carts', label: 'Carrinhos Abandonados', icon: ShoppingCart },
  { key: 'remarketing-flows', label: 'Fluxos de Recuperação', icon: Repeat2 },
  { key: 'remarketing-whatsapp', label: 'WhatsApp Remarketing', icon: MessageCircle },
  { key: 'remarketing-email', label: 'E-mail Remarketing', icon: Mail },
  { key: 'remarketing-payments', label: 'Recuperação de Pagamento', icon: Clock3 }
]

// 6. ADMINISTRAÇÃO
const adminItems: Item[] = [
  { key: 'admin-hub', label: 'Central Administrativa', icon: Building2 },
  { key: 'admin-users', label: 'Usuários e Acessos', icon: UserCog },
  { key: 'admin-producers', label: 'Produtoras', icon: Building },
  { key: 'admin-permissions', label: 'Perfis e Permissões', icon: ShieldCheck },
  { key: 'admin-audit', label: 'Logs de Auditoria', icon: ScrollText },
  { key: 'admin-security', label: 'Segurança', icon: LockKeyhole }
]

export default function ModuleSidebar({ module, page, onNavigate, onHome, canAdmin = true, user }: Props) {
  const [openFinance, setOpenFinance] = useState(page.startsWith('finance-') || page === 'finance')
  const [openAccounting, setOpenAccounting] = useState(page.startsWith('accounting-'))
  const [openMarketing, setOpenMarketing] = useState(page.startsWith('marketing-'))
  const [openRemarketing, setOpenRemarketing] = useState(page.startsWith('remarketing-'))
  const [openAdmin, setOpenAdmin] = useState(page.startsWith('admin-'))

  return (
    <aside className="module-sidebar">
      <div className="sidebar-top-bar">
        <button className="back-module" onClick={onHome}>
          <ArrowLeft size={18} />
          <span>Navegação</span>
        </button>
        <button
          className="sidebar-quick-swap"
          onClick={() => onNavigate(module === 'finance' ? 'events' : 'finance-dashboard')}
          title="Alternar Visão"
        >
          <ArrowLeftRight size={18} />
        </button>
      </div>

      {/* Commercial Tier Indicator */}
      <div className="sidebar-tier-badge">
        <span className="tier-tag expert">
          <Sparkles size={11} /> NÍVEL EXPERT ATIVO
        </span>
        <small>Marketing + Financeiro + Contabilidade</small>
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

        {/* Collapsible Section: Marketing */}
        <CollapsibleSection
          label="Marketing & Growth"
          open={openMarketing}
          onToggle={() => setOpenMarketing(!openMarketing)}
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

        {/* Collapsible Section: Remarketing */}
        <CollapsibleSection
          label="Remarketing & Recuperação"
          open={openRemarketing}
          onToggle={() => setOpenRemarketing(!openRemarketing)}
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

        {/* Collapsible Section: Financeiro */}
        <CollapsibleSection
          label="Financeiro"
          open={openFinance}
          onToggle={() => setOpenFinance(!openFinance)}
        >
          {financeItems.map((it, index) => (
            <NavItem
              key={`fin-${it.key}-${index}`}
              item={it}
              active={page === it.key || (it.key === 'finance-dashboard' && page === 'finance-hub')}
              onNavigate={onNavigate}
              indent
            />
          ))}
        </CollapsibleSection>

        {/* Collapsible Section: Contabilidade */}
        <CollapsibleSection
          label="Contabilidade"
          open={openAccounting}
          onToggle={() => setOpenAccounting(!openAccounting)}
        >
          {accountingItems.map((it, index) => (
            <NavItem
              key={`acc-${it.key}-${index}`}
              item={it}
              active={page === it.key}
              onNavigate={onNavigate}
              indent
            />
          ))}
        </CollapsibleSection>

        {/* Collapsible Section: Administração */}
        {canAdmin && (
          <CollapsibleSection
            label="Administração"
            open={openAdmin}
            onToggle={() => setOpenAdmin(!openAdmin)}
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
  open,
  onToggle,
  children
}: {
  label: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="collapsible-nav-section">
      <button type="button" className="collapsible-section-head" onClick={onToggle}>
        <span>{label}</span>
        {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
      </button>
      {open && <div className="collapsible-section-body">{children}</div>}
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
    >
      <Icon size={19} strokeWidth={1.9} />
      <span>{item.label}</span>
      {item.tier === 'expert' && <span className="expert-dot" title="Recurso Expert" />}
    </button>
  )
}
