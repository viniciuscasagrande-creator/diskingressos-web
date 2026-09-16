// ==============================================================================
// FASE 29.14.1.2 — DESIGN SYSTEM KOMPOSO / DISKINGRESSOS
// Configuração Declarativa Centralizada de Navegação
// ==============================================================================

import {
  BarChart3,
  Ticket,
  ShoppingBag,
  Layers,
  Terminal,
  ChartNoAxesCombined,
  PlusSquare,
  SlidersHorizontal,
  Users,
  ScanFace,
  MonitorSmartphone,
  Headphones,
  Building2,
  WalletCards,
  Landmark,
  ArrowDownLeft,
  Boxes,
  BookOpenCheck,
  CheckCircle2,
  FileSpreadsheet,
  Undo2,
  Scale,
  Download,
  Megaphone,
  MessageCircle,
  Activity,
  Repeat2,
  ShoppingCart,
  Mail,
  Clock3,
  UserCog,
  ShieldCheck,
  ScrollText,
  LockKeyhole
} from 'lucide-react'
import type { NavigationGroup } from './navigation.types'

export const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    id: 'visao-geral',
    label: 'Visão Geral & Operação',
    icon: BarChart3,
    scope: 'global',
    items: [
      {
        id: 'nav-profile-dashboard',
        label: 'Dashboard',
        pageKey: 'profile-dashboard',
        path: '/dashboard',
        icon: BarChart3,
        scope: 'global'
      },
      {
        id: 'nav-events',
        label: 'Todos os Eventos',
        pageKey: 'events',
        path: '/eventos',
        icon: Ticket,
        scope: 'global',
        isProtectedModule: true
      },
      {
        id: 'nav-commerce-orders',
        label: 'Pedidos & Vendas',
        pageKey: 'commerce-orders',
        path: '/vendas',
        icon: ShoppingBag,
        scope: 'producer'
      },
      {
        id: 'nav-event-support',
        label: 'Suporte a Eventos',
        pageKey: 'event-support',
        path: '/suporte-eventos',
        icon: Layers,
        scope: 'producer'
      },
      {
        id: 'nav-developer-center',
        label: 'Desenvolvedor',
        pageKey: 'developer-center',
        path: '/desenvolvedor',
        icon: Terminal,
        scope: 'global',
        roles: ['admin-master', 'admin']
      },
      {
        id: 'nav-operations',
        label: 'Núcleo Operacional',
        pageKey: 'operations',
        path: '/operacional',
        icon: ChartNoAxesCombined,
        scope: 'producer'
      },
      {
        id: 'nav-new-event',
        label: 'Novo Evento',
        pageKey: 'new-event',
        path: '/eventos/novo',
        icon: PlusSquare,
        scope: 'producer',
        roles: ['admin-master', 'admin', 'producer-admin']
      },
      {
        id: 'nav-lots',
        label: 'Configurar Lotes',
        pageKey: 'lots',
        path: '/lotes',
        icon: SlidersHorizontal,
        scope: 'producer'
      },
      {
        id: 'nav-participants',
        label: 'Participantes',
        pageKey: 'participants',
        path: '/participantes',
        icon: Users,
        scope: 'producer'
      },
      {
        id: 'nav-facial',
        label: 'Status Faciais',
        pageKey: 'facial',
        path: '/faciais',
        icon: ScanFace,
        scope: 'producer'
      },
      {
        id: 'nav-pos',
        label: 'Terminais POS',
        pageKey: 'pos',
        path: '/pos',
        icon: MonitorSmartphone,
        scope: 'producer'
      }
    ]
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: WalletCards,
    scope: 'producer',
    permissions: ['financeiro.visualizar'],
    items: [
      {
        id: 'nav-finance-dashboard',
        label: 'Dashboard Financeiro',
        pageKey: 'finance-dashboard',
        path: '/financeiro/dashboard',
        icon: WalletCards,
        scope: 'producer',
        isProtectedModule: true
      },
      {
        id: 'nav-finance-hub-account',
        label: 'Conta Financeira',
        pageKey: 'finance-hub-account',
        path: '/financeiro/conta-financeira',
        icon: Landmark,
        scope: 'producer'
      },
      {
        id: 'nav-finance-hub-bills',
        label: 'Contas',
        pageKey: 'finance-hub-bills',
        path: '/financeiro/contas',
        icon: ArrowDownLeft,
        scope: 'producer'
      },
      {
        id: 'nav-finance-hub-treasury',
        label: 'Tesouraria',
        pageKey: 'finance-hub-treasury',
        path: '/financeiro/tesouraria',
        icon: Landmark,
        scope: 'producer'
      },
      {
        id: 'nav-finance-hub-procurement',
        label: 'Compras & Fornecedores',
        pageKey: 'finance-hub-procurement',
        path: '/financeiro/compras-fornecedores',
        icon: Users,
        scope: 'producer'
      },
      {
        id: 'nav-finance-hub-controlling',
        label: 'Controladoria',
        pageKey: 'finance-hub-controlling',
        path: '/financeiro/controladoria',
        icon: Boxes,
        scope: 'producer'
      },
      {
        id: 'nav-finance-chart-accounts',
        label: 'Plano de Contas',
        pageKey: 'finance-chart-accounts',
        path: '/app/finance-chart-accounts',
        icon: BookOpenCheck,
        scope: 'producer'
      },
      {
        id: 'nav-finance-hub-reconciliation',
        label: 'Conciliação',
        pageKey: 'finance-hub-reconciliation',
        path: '/financeiro/conciliacao',
        icon: CheckCircle2,
        scope: 'producer'
      },
      {
        id: 'nav-finance-hub-reports',
        label: 'Relatórios',
        pageKey: 'finance-hub-reports',
        path: '/financeiro/relatorios',
        icon: FileSpreadsheet,
        scope: 'producer'
      }
    ]
  },
  {
    id: 'estornos-independente',
    label: 'Estornos & Devoluções',
    icon: Undo2,
    scope: 'producer',
    items: [
      {
        id: 'nav-finance-refunds',
        label: 'Estornos',
        pageKey: 'finance-refunds',
        path: '/app/finance-refunds',
        icon: Undo2,
        badge: 'ERP',
        scope: 'producer',
        isProtectedModule: true
      }
    ]
  },
  {
    id: 'contabilidade',
    label: 'Contabilidade',
    icon: BookOpenCheck,
    scope: 'producer',
    permissions: ['contabilidade.visualizar'],
    items: [
      {
        id: 'nav-accounting-dashboard',
        label: 'Visão Geral',
        pageKey: 'accounting-dashboard',
        path: '/contabilidade/dashboard',
        icon: BarChart3,
        badge: 'Contábil',
        scope: 'producer'
      },
      {
        id: 'nav-accounting-hub-operations',
        label: 'Operação Contábil',
        pageKey: 'accounting-hub-operations',
        path: '/contabilidade/operacao',
        icon: BookOpenCheck,
        scope: 'producer'
      },
      {
        id: 'nav-accounting-dre',
        label: 'DRE Gerencial',
        pageKey: 'accounting-dre',
        path: '/contabilidade/dre',
        icon: BarChart3,
        scope: 'producer'
      },
      {
        id: 'nav-accounting-hub-statements',
        label: 'Demonstrações',
        pageKey: 'accounting-hub-statements',
        path: '/contabilidade/demonstracoes',
        icon: Scale,
        scope: 'producer'
      },
      {
        id: 'nav-accounting-hub-compliance',
        label: 'Fiscal & Compliance',
        pageKey: 'accounting-hub-compliance',
        path: '/contabilidade/fiscal-compliance',
        icon: FileSpreadsheet,
        scope: 'producer'
      },
      {
        id: 'nav-accounting-relatorios',
        label: 'Relatórios',
        pageKey: 'accounting-relatorios',
        path: '/contabilidade/relatorios',
        icon: Download,
        scope: 'producer'
      }
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing & CRM',
    icon: Megaphone,
    scope: 'producer',
    permissions: ['marketing.visualizar'],
    items: [
      {
        id: 'nav-marketing-dashboard',
        label: 'Dashboard Marketing',
        pageKey: 'marketing-dashboard',
        path: '/marketing/dashboard',
        icon: BarChart3,
        scope: 'producer',
        isProtectedModule: true
      },
      {
        id: 'nav-marketing-hub-campaigns',
        label: 'Campanhas',
        pageKey: 'marketing-hub-campaigns',
        path: '/marketing/campanhas',
        icon: Megaphone,
        scope: 'producer'
      },
      {
        id: 'nav-marketing-hub-communication',
        label: 'Comunicação',
        pageKey: 'marketing-hub-communication',
        path: '/marketing/comunicacao',
        icon: MessageCircle,
        scope: 'producer'
      },
      {
        id: 'nav-marketing-hub-pixels',
        label: 'Conversões & Pixels',
        pageKey: 'marketing-hub-pixels',
        path: '/marketing/pixels',
        icon: Activity,
        badge: 'Pixels',
        scope: 'producer'
      },
      {
        id: 'nav-marketing-hub-analytics',
        label: 'Analytics',
        pageKey: 'marketing-hub-analytics',
        path: '/marketing/analytics',
        icon: FileSpreadsheet,
        scope: 'producer'
      }
    ]
  },
  {
    id: 'remarketing',
    label: 'Remarketing',
    icon: Repeat2,
    scope: 'producer',
    items: [
      {
        id: 'nav-remarketing-hub',
        label: 'Hub Remarketing',
        pageKey: 'remarketing-hub',
        path: '/remarketing',
        icon: Repeat2,
        scope: 'producer'
      },
      {
        id: 'nav-remarketing-dashboard',
        label: 'Dashboard',
        pageKey: 'remarketing-dashboard',
        path: '/remarketing/dashboard',
        icon: BarChart3,
        scope: 'producer'
      },
      {
        id: 'nav-remarketing-carts',
        label: 'Carrinhos Abandonados',
        pageKey: 'remarketing-carts',
        path: '/remarketing/carrinhos',
        icon: ShoppingCart,
        scope: 'producer'
      },
      {
        id: 'nav-remarketing-flows',
        label: 'Fluxos de Recuperação',
        pageKey: 'remarketing-flows',
        path: '/remarketing/fluxos',
        icon: Repeat2,
        scope: 'producer'
      },
      {
        id: 'nav-remarketing-whatsapp',
        label: 'WhatsApp Remarketing',
        pageKey: 'remarketing-whatsapp',
        path: '/remarketing/whatsapp',
        icon: MessageCircle,
        scope: 'producer'
      },
      {
        id: 'nav-remarketing-email',
        label: 'E-mail Remarketing',
        pageKey: 'remarketing-email',
        path: '/remarketing/email',
        icon: Mail,
        scope: 'producer'
      },
      {
        id: 'nav-remarketing-payments',
        label: 'Recuperação de Pagamento',
        pageKey: 'remarketing-payments',
        path: '/remarketing/pagamentos',
        icon: Clock3,
        scope: 'producer'
      }
    ]
  },
  {
    id: 'atendimento-sac',
    label: 'Atendimento & SAC',
    icon: Headphones,
    scope: 'global',
    items: [
      {
        id: 'nav-sac-hub',
        label: 'Atendimento / SAC',
        pageKey: 'sac-hub',
        path: '/sac',
        icon: Headphones,
        scope: 'global',
        isProtectedModule: true
      }
    ]
  },
  {
    id: 'administracao',
    label: 'Administração',
    icon: Building2,
    scope: 'global',
    roles: ['admin-master', 'admin'],
    items: [
      {
        id: 'nav-admin-hub',
        label: 'Central Administrativa',
        pageKey: 'admin-hub',
        path: '/admin',
        icon: Building2,
        scope: 'global',
        roles: ['admin-master', 'admin']
      },
      {
        id: 'nav-admin-users',
        label: 'Usuários e Acessos',
        pageKey: 'admin-users',
        path: '/admin/usuarios',
        icon: UserCog,
        scope: 'global',
        roles: ['admin-master', 'admin']
      },
      {
        id: 'nav-admin-producers',
        label: 'Produtoras',
        pageKey: 'admin-producers',
        path: '/admin/produtoras',
        icon: Building2,
        scope: 'global',
        roles: ['admin-master', 'admin']
      },
      {
        id: 'nav-admin-permissions',
        label: 'Perfis e Permissões',
        pageKey: 'admin-permissions',
        path: '/admin/permissoes',
        icon: ShieldCheck,
        scope: 'global',
        roles: ['admin-master', 'admin']
      },
      {
        id: 'nav-admin-audit',
        label: 'Logs de Auditoria',
        pageKey: 'admin-audit',
        path: '/admin/auditoria',
        icon: ScrollText,
        scope: 'global',
        roles: ['admin-master', 'admin']
      },
      {
        id: 'nav-admin-security',
        label: 'Segurança & LGPD',
        pageKey: 'admin-security',
        path: '/admin/seguranca',
        icon: LockKeyhole,
        scope: 'global',
        roles: ['admin-master', 'admin']
      }
    ]
  }
]
