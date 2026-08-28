import { useState, type ComponentType } from 'react'
import { canAccess, type AppUser } from '../auth/model'
import {
  ArrowLeft, WalletCards, HandCoins, TrendingUp, ReceiptText, TrendingDown, Landmark, PenTool, Scale,
  ChartNoAxesCombined, Split, Brain, CreditCard, Settings, ShieldCheck, LayoutDashboard, Ticket,
  PlusSquare, SlidersHorizontal, Users, ScanFace, BarChart3, CircleGauge, MonitorSmartphone, ShoppingCart,
  LockKeyhole, MessageCircle, Megaphone, Repeat2, Building2, ChevronRight, UserCog, ScrollText,
  Mail, Tags, Bot, Target, QrCode, UsersRound, ShoppingBag, GitBranch, CreditCard as CreditCardIcon,
  UserRoundCheck, Headphones, Clock3, BookOpen, Link2, FileBarChart, Zap, FileSpreadsheet,
  ArrowDownLeft, ArrowUpRight, Percent, BookMarked, ClipboardList, Building, FileCheck, Sparkles,
  Layers, Lock, CheckCircle2, ChevronDown
} from 'lucide-react'

export type ModuleKey = 'events' | 'finance' | 'accounting' | 'pos' | 'facial' | 'admin' | 'marketing' | 'remarketing' | 'sac'

export type PageKey =
  | 'profile-dashboard' | 'global-dashboard' | 'events' | 'operations' | 'new-event' | 'lots' | 'participants' | 'edit-event' | 'event-dashboard'
  | 'event-tickets' | 'event-courtesy' | 'event-reports' | 'event-details' | 'event-pixel' | 'event-utm' | 'event-ga4' | 'event-traffic' | 'event-meta-ads' | 'event-remarketing' | 'event-users' | 'event-audit' | 'event-permissions'
  | 'facial'
  // FINANCEIRO
  | 'finance-dashboard' | 'finance-hub' | 'finance' | 'finance-statement' | 'finance-cashflow' | 'finance-receivables' | 'finance-payables'
  | 'finance-payouts' | 'finance-advance' | 'finance-reconciliation' | 'finance-bank-accounts' | 'finance-expenses' | 'finance-bordero'
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
  | 'marketing-hub' | 'marketing-dashboard' | 'marketing-campaigns' | 'marketing-create' | 'marketing-automations' | 'marketing-whatsapp' | 'marketing-email' | 'marketing-coupons' | 'marketing-links' | 'marketing-affiliates' | 'marketing-tracking' | 'marketing-communications' | 'marketing-reports'
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
  icon: ComponentType<{ size?: number }>
  badge?: string
  tier?: 'standard' | 'advanced' | 'expert'
}

// 1. FINANCEIRO (Menu Completo de 15+ itens)
const financeNavigation: Item[] = [
  { key: 'finance-dashboard', label: 'Dashboard Financeiro', icon: LayoutDashboard },
  { key: 'finance', label: 'Saldos & Carteira', icon: WalletCards },
  { key: 'finance-statement', label: 'Extrato', icon: ReceiptText },
  { key: 'finance-cashflow', label: 'Fluxo de Caixa', icon: TrendingUp },
  { key: 'finance-receivables', label: 'Contas a Receber', icon: ArrowDownLeft, tier: 'advanced' },
  { key: 'finance-payables', label: 'Contas a Pagar', icon: ArrowUpRight, tier: 'advanced' },
  { key: 'finance-payouts', label: 'Repasses', icon: HandCoins },
  { key: 'finance-advance', label: 'Antecipações', icon: Zap },
  { key: 'finance-reconciliation', label: 'Conciliação Bancária', icon: Scale, tier: 'advanced' },
  { key: 'finance-bank-accounts', label: 'Contas Bancárias', icon: Landmark },
  { key: 'finance-expenses', label: 'Despesas', icon: TrendingDown },
  { key: 'finance-bordero', label: 'Borderô', icon: PenTool },
  { key: 'finance-spread', label: 'Spread', icon: Percent, tier: 'advanced' },
  { key: 'finance-split', label: 'Split Financeiro', icon: Split, tier: 'advanced' },
  { key: 'finance-methods', label: 'Métodos de Pagamento', icon: CreditCard },
  { key: 'finance-reports', label: 'Relatórios Financeiros', icon: BarChart3 },
]

// 2. CONTABILIDADE (Menu Completo com Grupos)
const accountingNavigation: Item[] = [
  { key: 'accounting-dashboard', label: 'Dashboard Contábil', icon: LayoutDashboard },
  { key: 'accounting-chart', label: 'Plano de Contas', icon: Layers },
  { key: 'accounting-journal', label: 'Livro Diário', icon: BookOpen },
  { key: 'accounting-ledger', label: 'Livro Razão', icon: BookMarked },
  { key: 'accounting-entries', label: 'Lançamentos', icon: ClipboardList },
  { key: 'accounting-cost-centers', label: 'Centro de Custos', icon: Building, tier: 'advanced' },
  { key: 'accounting-reconciliation', label: 'Conciliação Contábil', icon: Scale, tier: 'advanced' },
  { key: 'accounting-audit', label: 'Auditoria', icon: ShieldCheck, tier: 'expert' },
  { key: 'accounting-closing', label: 'Fechamento', icon: LockKeyhole, tier: 'advanced' },
]

const accountingFiscal: Item[] = [
  { key: 'accounting-taxes', label: 'Impostos', icon: Percent, tier: 'advanced' },
  { key: 'accounting-nfse', label: 'NFS-e', icon: FileSpreadsheet, tier: 'advanced' },
  { key: 'accounting-nfe', label: 'NF-e', icon: FileSpreadsheet, tier: 'advanced' },
  { key: 'accounting-sped', label: 'SPED', icon: ScrollText, tier: 'advanced' },
  { key: 'accounting-obligations', label: 'Obrigações', icon: Clock3, tier: 'advanced' },
]

const accountingReports: Item[] = [
  { key: 'accounting-dre', label: 'DRE', icon: BarChart3 },
  { key: 'accounting-balance-sheet', label: 'Balanço Patrimonial', icon: Landmark },
  { key: 'accounting-trial-balance', label: 'Balancete', icon: FileBarChart },
  { key: 'accounting-cashflow', label: 'Fluxo de Caixa Contábil', icon: TrendingUp },
  { key: 'accounting-journal-rep', label: 'Livro Diário Oficial', icon: BookOpen },
  { key: 'accounting-ledger-rep', label: 'Livro Razão Oficial', icon: BookMarked },
  { key: 'accounting-exports', label: 'Exportações', icon: FileCheck },
]

const accountingSettings: Item[] = [
  { key: 'accounting-settings', label: 'Configurações', icon: Settings },
  { key: 'accounting-companies', label: 'Empresas do Grupo', icon: Building2 },
  { key: 'accounting-integrations', label: 'Integrações Contábeis', icon: Link2 },
]

// 3. EVENTOS
const eventMain: Item[] = [
  { key: 'profile-dashboard', label: 'Meu Dashboard', icon: LayoutDashboard },
  { key: 'events', label: 'Todos os Eventos', icon: Ticket },
  { key: 'operations', label: 'Núcleo Operacional', icon: ChartNoAxesCombined },
  { key: 'new-event', label: 'Novo Evento', icon: PlusSquare },
  { key: 'lots', label: 'Configurar Lotes', icon: SlidersHorizontal },
  { key: 'participants', label: 'Participantes', icon: Users },
  { key: 'facial', label: 'Status Faciais', icon: ScanFace },
]

// 4. ADMIN
const adminMain: Item[] = [
  { key: 'global-dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { key: 'admin-hub', label: 'Central Administrativa', icon: LayoutDashboard },
  { key: 'admin-users', label: 'Usuários e Acessos', icon: UserCog },
  { key: 'admin-producers', label: 'Produtoras', icon: Building2 },
  { key: 'admin-permissions', label: 'Perfis e Permissões', icon: ShieldCheck },
  { key: 'admin-audit', label: 'Logs de Auditoria', icon: ScrollText },
  { key: 'admin-security', label: 'Segurança', icon: LockKeyhole },
]

// 5. MARKETING & REMARKETING
const marketingMain: Item[] = [
  { key: 'profile-dashboard', label: 'Meu Dashboard', icon: LayoutDashboard },
  { key: 'marketing-hub', label: 'Hub Marketing', icon: Megaphone },
  { key: 'marketing-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'marketing-campaigns', label: 'Campanhas', icon: Target },
  { key: 'marketing-create', label: 'Criar Campanha', icon: PlusSquare },
  { key: 'marketing-automations', label: 'Automações', icon: Bot },
  { key: 'marketing-whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { key: 'marketing-email', label: 'E-mail Marketing', icon: Mail },
  { key: 'marketing-coupons', label: 'Cupons e Promoções', icon: Tags },
  { key: 'marketing-links', label: 'Links, UTMs e QR Codes', icon: QrCode },
  { key: 'marketing-affiliates', label: 'Afiliados e Parceiros', icon: UsersRound },
  { key: 'marketing-communications', label: 'Integrações de Comunicação', icon: MessageCircle },
]

const remarketingMain: Item[] = [
  { key: 'remarketing-hub', label: 'Hub Remarketing', icon: Repeat2 },
  { key: 'remarketing-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'remarketing-carts', label: 'Carrinhos Abandonados', icon: ShoppingBag },
  { key: 'remarketing-audiences', label: 'Públicos', icon: UsersRound },
  { key: 'remarketing-segments', label: 'Segmentações', icon: Target },
  { key: 'remarketing-flows', label: 'Fluxos de Recuperação', icon: GitBranch },
]

const sacMain: Item[] = [
  { key: 'profile-dashboard', label: 'Meu Dashboard', icon: LayoutDashboard },
  { key: 'sac-hub', label: 'Hub de Atendimento', icon: Headphones },
  { key: 'sac-dashboard', label: 'Dashboard SAC', icon: LayoutDashboard },
  { key: 'sac-tickets', label: 'Chamados', icon: Ticket },
  { key: 'sac-new', label: 'Abrir Chamado', icon: PlusSquare },
  { key: 'sac-sla', label: 'SLA & ITIL', icon: Clock3 },
  { key: 'sac-integrations', label: 'Integrações', icon: Link2 },
  { key: 'sac-knowledge', label: 'Base de Conhecimento', icon: BookOpen },
  { key: 'sac-reports', label: 'Relatórios', icon: FileBarChart },
]

const posMain: Item[] = [
  { key: 'profile-dashboard', label: 'Meu Dashboard', icon: LayoutDashboard },
  { key: 'pos', label: 'Hub POS / PDV', icon: LayoutDashboard },
  { key: 'pos-terminals', label: 'Terminais', icon: MonitorSmartphone },
  { key: 'pos-sales', label: 'Vendas Presenciais', icon: ShoppingCart },
  { key: 'pos-closing', label: 'Fechamento de Caixa', icon: LockKeyhole },
]

export default function ModuleSidebar({ module, page, onNavigate, onHome, canAdmin = true, user }: Props) {
  let main =
    module === 'finance' ? financeNavigation :
    module === 'accounting' ? accountingNavigation :
    module === 'pos' ? posMain :
    module === 'admin' ? adminMain :
    module === 'marketing' ? marketingMain :
    module === 'remarketing' ? remarketingMain :
    module === 'sac' ? sacMain : eventMain

  if (module === 'events' && user && user.role !== 'producer-admin' && user.role !== 'admin-master' && user.role !== 'admin') {
    main = main.filter(it => !['new-event', 'lots'].includes(it.key))
  }

  return (
    <aside className="module-sidebar">
      <button className="back-module" onClick={onHome}>
        <ArrowLeft size={20} />
        <span>Voltar</span>
        <i>
          <ArrowLeft size={15} />
          <ChevronRight size={15} />
        </i>
      </button>

      {/* Commercial Tier Indicator */}
      {(module === 'finance' || module === 'accounting') && (
        <div className="sidebar-tier-badge">
          <span className="tier-tag expert">
            <Sparkles size={11} /> NÍVEL EXPERT ATIVO
          </span>
          <small>Financeiro + Contabilidade Integrada</small>
        </div>
      )}

      <nav className="module-nav">
        {/* Main Section */}
        {main.map((it, index) => (
          <NavItem
            key={`${it.key}-${index}`}
            item={it}
            active={page === it.key || (it.key === 'events' && ['edit-event', 'event-dashboard'].includes(page))}
            onNavigate={onNavigate}
          />
        ))}

        {/* Contabilidade Sub-groups */}
        {module === 'accounting' && (
          <>
            <div className="nav-divider" />
            <p className="module-caption">FISCAL & TRIBUTÁRIO</p>
            {accountingFiscal.map((it, index) => (
              <NavItem key={`${it.key}-${index}`} item={it} active={page === it.key} onNavigate={onNavigate} />
            ))}

            <div className="nav-divider" />
            <p className="module-caption">RELATÓRIOS & DEMONSTRAÇÕES</p>
            {accountingReports.map((it, index) => (
              <NavItem key={`${it.key}-${index}`} item={it} active={page === it.key} onNavigate={onNavigate} />
            ))}

            <div className="nav-divider" />
            <p className="module-caption">CONFIGURAÇÕES & EMPRESAS</p>
            {accountingSettings.map((it, index) => (
              <NavItem key={`${it.key}-${index}`} item={it} active={page === it.key} onNavigate={onNavigate} />
            ))}
          </>
        )}

        {/* Quick Cross-Module Links */}
        {module !== 'finance' && module !== 'accounting' && module !== 'admin' && module !== 'marketing' && module !== 'remarketing' && module !== 'sac' && (
          <>
            <div className="nav-divider" />
            <p className="module-caption">ACESSOS RÁPIDOS</p>
            {(!user || canAccess(user, 'finance')) && (
              <>
                <button className="module-nav-item" onClick={() => onNavigate('finance-dashboard')}>
                  <WalletCards size={19} />
                  <span>Financeiro</span>
                </button>
                <button className="module-nav-item" onClick={() => onNavigate('accounting-dashboard')}>
                  <CalculatorIcon size={19} />
                  <span>Contabilidade</span>
                </button>
              </>
            )}
            {(!user || canAccess(user, 'pos')) && (
              <button className="module-nav-item" onClick={() => onNavigate('pos')}>
                <MonitorSmartphone size={19} />
                <span>Terminais POS</span>
              </button>
            )}
            {(!user || canAccess(user, 'sac')) && (
              <button className="module-nav-item" onClick={() => onNavigate('sac-hub')}>
                <MessageCircle size={19} />
                <span>Atendimento / SAC</span>
              </button>
            )}
            {(!user || canAccess(user, 'marketing')) && (
              <button className="module-nav-item" onClick={() => onNavigate('marketing-hub')}>
                <Megaphone size={19} />
                <span>Marketing</span>
              </button>
            )}
            {(!user || canAccess(user, 'remarketing')) && (
              <button className="module-nav-item" onClick={() => onNavigate('remarketing-hub')}>
                <Repeat2 size={19} />
                <span>Remarketing</span>
              </button>
            )}
            {canAdmin && (
              <button className="module-nav-item" onClick={() => onNavigate('admin-hub')}>
                <Building2 size={19} />
                <span>Administração</span>
              </button>
            )}
          </>
        )}

        {/* If in Finance, link to Accounting and vice-versa */}
        {module === 'finance' && (
          <>
            <div className="nav-divider" />
            <p className="module-caption">MÓDULO CONTÁBIL</p>
            <button className="module-nav-item" onClick={() => onNavigate('accounting-dashboard')}>
              <Layers size={19} />
              <span>Ir para Contabilidade</span>
              <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />
            </button>
          </>
        )}

        {module === 'accounting' && (
          <>
            <div className="nav-divider" />
            <p className="module-caption">MÓDULO FINANCEIRO</p>
            <button className="module-nav-item" onClick={() => onNavigate('finance-dashboard')}>
              <WalletCards size={19} />
              <span>Ir para Financeiro</span>
              <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />
            </button>
          </>
        )}
      </nav>
    </aside>
  )
}

function CalculatorIcon({ size }: { size?: number }) {
  return <Layers size={size} />
}

function NavItem({ item, active, onNavigate }: { item: Item; active: boolean; onNavigate: (p: PageKey) => void }) {
  const Icon = item.icon
  return (
    <button className={`module-nav-item ${active ? 'active' : ''}`} onClick={() => onNavigate(item.key)}>
      <Icon size={20} />
      <span>{item.label}</span>
      {item.tier === 'expert' && <span className="expert-dot" title="Recurso Expert" />}
    </button>
  )
}
