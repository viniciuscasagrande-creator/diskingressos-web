import { useState, type ComponentType, type ReactNode } from 'react'
import { canAccess, type AppUser } from '../auth/model'
import {
  ArrowLeft, WalletCards, HandCoins, TrendingUp, ReceiptText, TrendingDown, Landmark, Scale,
  ChartNoAxesCombined, Split, Brain, CreditCard, ShieldCheck, Ticket,
  PlusSquare, SlidersHorizontal, Users, ScanFace, BarChart3, MonitorSmartphone, ShoppingCart,
  LockKeyhole, MessageCircle, Megaphone, Repeat2, Building2, ChevronRight, UserCog, ScrollText,
  Mail, Tags, Target, UsersRound, ShoppingBag, Clock3,
  FileSpreadsheet, Sparkles, ChevronDown, ListTree, BookOpenText, BookMarked,
  FileSignature, Boxes, BookOpenCheck, FileText, Zap, Link2, Headphones, NotebookTabs, Percent,
  CheckCircle2, Handshake
} from 'lucide-react'

export type ModuleKey = 'events' | 'finance' | 'accounting' | 'pos' | 'facial' | 'admin' | 'marketing' | 'remarketing' | 'sac'

export type PageKey =
  | 'profile-dashboard' | 'global-dashboard' | 'events' | 'operations' | 'new-event' | 'lots' | 'participants' | 'edit-event' | 'event-dashboard'
  | 'event-tickets' | 'event-courtesy' | 'event-reports' | 'event-details' | 'event-pixel' | 'event-utm' | 'event-ga4' | 'event-traffic' | 'event-meta-ads' | 'event-remarketing' | 'event-users' | 'event-audit' | 'event-permissions'
  | 'facial'
  // FINANCEIRO
  | 'finance-dashboard' | 'finance-hub' | 'finance' | 'finance-statement' | 'finance-cashflow' | 'finance-receivables' | 'finance-payables' | 'finance-spread-simulator'
  | 'finance-payouts' | 'finance-advance' | 'finance-reconciliation' | 'finance-bank-accounts' | 'finance-expenses' | 'finance-bordero' | 'finance-consolidated'
  | 'finance-spread' | 'finance-split' | 'finance-methods' | 'finance-reports' | 'finance-sales' | 'finance-bank' | 'finance-intelligence' | 'finance-custom' | 'finance-operators' | 'finance-negotiations' | 'finance-refunds' | 'finance-gateways' | 'finance-advanced' | 'finance-rates' | 'finance-settlement' | 'finance-settlements'
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

// 2. PILAR 1: TESOURARIA, SALDOS & CAIXA
const treasuryFinanceItems: Item[] = [
  { key: 'finance-dashboard', label: 'Dashboard Financeiro', icon: BarChart3, badge: 'Novo' },
  { key: 'finance', label: 'Saldos & Carteira', icon: WalletCards },
  { key: 'finance-statement', label: 'Extrato Unificado', icon: ReceiptText },
  { key: 'finance-payouts', label: 'Solicitar Repasse Pix', icon: HandCoins },
  { key: 'finance-cashflow', label: 'Fluxo de Caixa', icon: TrendingUp },
  { key: 'finance-bank-accounts', label: 'Contas Bancárias & Pix', icon: Landmark },
  { key: 'finance-expenses', label: 'Despesas Operacionais', icon: TrendingDown },
  { key: 'finance-payables', label: 'Contas a Pagar', icon: TrendingDown },
  { key: 'finance-receivables', label: 'Contas a Receber', icon: TrendingUp },
  { key: 'finance-reconciliation', label: 'Conciliação Bancária', icon: Scale },
]

// 3. PILAR 2: ANTECIPAÇÕES, SPREAD & SPLIT
const advanceFinanceItems: Item[] = [
  { key: 'finance-advance', label: 'Antecipações de Recebíveis', icon: Zap },
  { key: 'finance-spread', label: 'Financeiro Spread', icon: ChartNoAxesCombined },
  { key: 'finance-spread-simulator', label: 'Simulador de Spread (1x-12x)', icon: Percent },
  { key: 'finance-split', label: 'Split Financeiro & Sócios', icon: Split },
  { key: 'finance-settlement', label: 'Liquidação & Fechamento', icon: CheckCircle2 },
  { key: 'finance-negotiations', label: 'Negociações & Acordos', icon: Handshake },
]

// 4. PILAR 3: MEIOS DE PAGAMENTO, TAXAS & GATEWAYS
const paymentFinanceItems: Item[] = [
  { key: 'finance-methods', label: 'Métodos (Pix/Cartão/Boleto)', icon: CreditCard },
  { key: 'finance-custom', label: 'Pagamentos Customizados / PDV', icon: SlidersHorizontal },
  { key: 'finance-operators', label: 'Operadoras de Cartão', icon: ShieldCheck },
  { key: 'finance-gateways', label: 'Gateways de Pagamento', icon: WalletCards },
  { key: 'finance-refunds', label: 'Devoluções & Estornos', icon: ReceiptText },
  { key: 'finance-intelligence', label: 'Inteligência Financeira', icon: Brain },
]

// 5. PILAR 4: BORDERÔS, RELATÓRIOS & DRE
const reportsFinanceItems: Item[] = [
  { key: 'finance-bordero', label: 'Borderô Oficial do Show', icon: FileSignature },
  { key: 'finance-reports', label: 'Relatórios Financeiros & DRE', icon: FileSpreadsheet },
  { key: 'finance-advanced', label: 'Central Financeira Advanced', icon: ChartNoAxesCombined },
]

// 6. PILAR 5: CONTABILIDADE & ERP FISCAL
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

// 7. MARKETING & GROWTH
const marketingItems: Item[] = [
  { key: 'marketing-dashboard', label: 'Dashboard Marketing', icon: BarChart3 },
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

// 8. REMARKETING & RESGATE
const remarketingItems: Item[] = [
  { key: 'remarketing-hub', label: 'Hub Remarketing', icon: Repeat2 },
  { key: 'remarketing-dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'remarketing-carts', label: 'Carrinhos Abandonados', icon: ShoppingCart },
  { key: 'remarketing-flows', label: 'Fluxos de Recuperação', icon: Repeat2 },
  { key: 'remarketing-whatsapp', label: 'WhatsApp Remarketing', icon: MessageCircle },
  { key: 'remarketing-email', label: 'E-mail Remarketing', icon: Mail },
  { key: 'remarketing-payments', label: 'Recuperação de Pagamento', icon: Clock3 }
]

// 9. ADMINISTRAÇÃO & GOVERNANÇA
const adminItems: Item[] = [
  { key: 'admin-hub', label: 'Central Administrativa', icon: Building2 },
  { key: 'admin-users', label: 'Usuários e Acessos', icon: UserCog },
  { key: 'admin-producers', label: 'Produtoras', icon: Building2 },
  { key: 'admin-permissions', label: 'Perfis e Permissões', icon: ShieldCheck },
  { key: 'admin-audit', label: 'Logs de Auditoria', icon: ScrollText },
  { key: 'admin-security', label: 'Segurança & LGPD', icon: LockKeyhole }
]

export default function ModuleSidebar({ module, page, onNavigate, onHome, canAdmin = true, user }: Props) {
  const [openTreasury, setOpenTreasury] = useState(
    ['finance-dashboard', 'finance', 'finance-statement', 'finance-payouts', 'finance-cashflow', 'finance-bank-accounts', 'finance-expenses', 'finance-payables', 'finance-receivables', 'finance-reconciliation'].includes(page)
  )
  const [openAdvance, setOpenAdvance] = useState(
    ['finance-advance', 'finance-spread', 'finance-spread-simulator', 'finance-split', 'finance-settlement', 'finance-settlements', 'finance-negotiations'].includes(page)
  )
  const [openPayments, setOpenPayments] = useState(
    ['finance-methods', 'finance-custom', 'finance-operators', 'finance-gateways', 'finance-refunds', 'finance-intelligence'].includes(page)
  )
  const [openReports, setOpenReports] = useState(
    ['finance-bordero', 'finance-reports', 'finance-advanced', 'finance-consolidated'].includes(page)
  )
  const [openAccounting, setOpenAccounting] = useState(
    page.startsWith('accounting-') || page.startsWith('finance-accounting') || ['finance-chart-accounts', 'finance-cost-centers', 'finance-accounting-entries', 'finance-dre', 'finance-closing'].includes(page)
  )
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

        {/* 1. Tesouraria & Saldos */}
        <CollapsibleSection
          label="1. Tesouraria & Saldos"
          open={openTreasury}
          onToggle={() => setOpenTreasury(!openTreasury)}
        >
          {treasuryFinanceItems.map((it, index) => (
            <NavItem
              key={`tr-${it.key}-${index}`}
              item={it}
              active={page === it.key}
              onNavigate={onNavigate}
              indent
            />
          ))}
        </CollapsibleSection>

        {/* 2. Antecipação, Spread & Split */}
        <CollapsibleSection
          label="2. Antecipação & Split"
          open={openAdvance}
          onToggle={() => setOpenAdvance(!openAdvance)}
        >
          {advanceFinanceItems.map((it, index) => (
            <NavItem
              key={`adv-${it.key}-${index}`}
              item={it}
              active={page === it.key}
              onNavigate={onNavigate}
              indent
            />
          ))}
        </CollapsibleSection>

        {/* 3. Meios de Pagamento & Taxas */}
        <CollapsibleSection
          label="3. Meios de Pagamento"
          open={openPayments}
          onToggle={() => setOpenPayments(!openPayments)}
        >
          {paymentFinanceItems.map((it, index) => (
            <NavItem
              key={`pay-${it.key}-${index}`}
              item={it}
              active={page === it.key}
              onNavigate={onNavigate}
              indent
            />
          ))}
        </CollapsibleSection>

        {/* 4. Borderôs & Relatórios */}
        <CollapsibleSection
          label="4. Borderôs & Relatórios"
          open={openReports}
          onToggle={() => setOpenReports(!openReports)}
        >
          {reportsFinanceItems.map((it, index) => (
            <NavItem
              key={`rep-${it.key}-${index}`}
              item={it}
              active={page === it.key}
              onNavigate={onNavigate}
              indent
            />
          ))}
        </CollapsibleSection>

        {/* 5. Contabilidade & ERP */}
        <CollapsibleSection
          label="5. Contabilidade & ERP"
          open={openAccounting}
          onToggle={() => setOpenAccounting(!openAccounting)}
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

        {/* Section: Remarketing */}
        <CollapsibleSection
          label="Remarketing & Resgate"
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

        {/* Section: Administração */}
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

function NavItem({ item, active, onNavigate, indent }: { item: Item; active: boolean; onNavigate: (p: PageKey) => void; indent?: boolean }) {
  const Icon = item.icon
  return (
    <button
      className={`nav-item ${active ? 'active' : ''} ${indent ? 'indent' : ''}`}
      onClick={() => onNavigate(item.key)}
      title={item.label}
    >
      <Icon size={17} />
      <span className="nav-label">{item.label}</span>
      {item.badge && <span className="nav-badge">{item.badge}</span>}
    </button>
  )
}

function CollapsibleSection({ label, open, onToggle, children }: { label: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div className={`collapsible-section ${open ? 'open' : ''}`}>
      <button className="collapsible-header" onClick={onToggle}>
        <span>{label}</span>
        <ChevronDown size={14} className={`collapsible-icon ${open ? 'rotated' : ''}`} />
      </button>
      {open && <div className="collapsible-content">{children}</div>}
    </div>
  )
}
