import {
  WalletCards, Landmark, ReceiptText, ArrowLeftRight, ArrowDownLeft, ArrowUpRight,
  BookOpenCheck, Boxes, Scale, Users, CircleDollarSign, Calendar, HandCoins, Zap,
  CheckCircle2, TrendingUp, BarChart3, Split, CreditCard, FileSpreadsheet, FileText,
  LockKeyhole, FileSignature, Brain, Megaphone, Activity, Sparkles, Target, ListTree,
  Play, Headphones, Link2, UsersRound, MessageCircle, Mail, Tags, Clock3,
  ShoppingCart, Repeat2, ShieldCheck, Download, Award
} from 'lucide-react'
import type { ModuleHubCardItem } from '../components/ModuleHubView'
import type { PageKey } from '../components/ModuleSidebar'

export interface ModuleHubDefinition {
  id: string
  pageKey: PageKey
  route: string
  title: string
  subtitle: string
  badge?: string
  categories?: string[]
  items: ModuleHubCardItem[]
}

// ==============================================================================
// HUBS DO FINANCEIRO (8 HUBS ESTRATÉGICOS)
// ==============================================================================

export const FINANCE_HUBS: Record<string, ModuleHubDefinition> = {
  // 1. Conta Financeira
  'finance-hub-account': {
    id: 'finance-hub-account',
    pageKey: 'finance-hub' as PageKey,
    route: '/app/finance-hub',
    title: 'Conta Financeira',
    subtitle: 'Gestão de saldos do produtor, extrato unificado e transferências entre eventos',
    badge: 'Conta Digital',
    items: [
      {
        id: 'acc-producer',
        title: 'Conta do Produtor',
        description: 'Saldo consolidado, limites disponíveis e visão patrimonial',
        icon: Landmark,
        pageKey: 'finance-producer-account',
        badge: 'Consolidado',
        badgeVariant: 'primary'
      },
      {
        id: 'acc-balance-event',
        title: 'Saldo por Evento',
        description: 'Visualização de saldos segregados por evento e praça',
        icon: WalletCards,
        pageKey: 'finance-hub'
      },
      {
        id: 'acc-cash-ops',
        title: 'Gestão de Saldos',
        description: 'Entradas, saídas em conta e ajustes operacionais',
        icon: CircleDollarSign,
        pageKey: 'finance'
      },
      {
        id: 'acc-transfers',
        title: 'Transferência entre Eventos',
        description: 'Manejo de fundos entre centros de custo de diferentes eventos',
        icon: ArrowLeftRight,
        pageKey: 'finance-producer-account'
      },
      {
        id: 'acc-statement',
        title: 'Extrato Financeiro',
        description: 'Movimentações detalhadas com exportação para PDF e OFX',
        icon: ReceiptText,
        pageKey: 'finance-statement',
        badge: 'OFX / CSV',
        badgeVariant: 'info'
      },
      {
        id: 'acc-split',
        title: 'Divisão de Receitas',
        description: 'Regras de split automático entre coprodutores e parceiros',
        icon: Split,
        pageKey: 'finance-split'
      },
      {
        id: 'acc-rates',
        title: 'Pagamentos & Taxas',
        description: 'Configurações de taxas por meio de pagamento e bandeira',
        icon: CreditCard,
        pageKey: 'finance-methods'
      }
    ]
  },

  // 2. Contas (Receber & Pagar)
  'finance-hub-bills': {
    id: 'finance-hub-bills',
    pageKey: 'finance-receivables' as PageKey,
    route: '/app/finance-receivables',
    title: 'Contas & Compromissos',
    subtitle: 'Gestão de contas a receber, contas a pagar, antecipações e agenda de repasses',
    badge: 'Gestão Ativa',
    items: [
      {
        id: 'bills-receivables',
        title: 'Contas a Receber',
        description: 'Lançamentos a receber, prazos de liquidação e adquirentes',
        icon: ArrowDownLeft,
        pageKey: 'finance-receivables',
        badge: 'Recebíveis',
        badgeVariant: 'success'
      },
      {
        id: 'bills-payables',
        title: 'Contas a Pagar',
        description: 'Compromissos pendentes, fornecedores e controle de boletos',
        icon: ArrowUpRight,
        pageKey: 'finance-payables',
        badge: 'Despesas',
        badgeVariant: 'warning'
      },
      {
        id: 'bills-advances',
        title: 'Antecipações',
        description: 'Solicitação e simulação de antecipação de recebíveis futuros',
        icon: Zap,
        pageKey: 'finance-advance',
        badge: 'Crédito Rápido',
        badgeVariant: 'primary'
      },
      {
        id: 'bills-payouts',
        title: 'Repasses Financeiros',
        description: 'Agendamento e histórico de repasses bancários solicitados',
        icon: HandCoins,
        pageKey: 'finance-payouts'
      },
      {
        id: 'bills-cashflow',
        title: 'Agenda Financeira',
        description: 'Visão cronológica de vencimentos, entradas e saídas programadas',
        icon: Calendar,
        pageKey: 'finance-cashflow'
      },
      {
        id: 'bills-methods',
        title: 'Métodos de Pagamento',
        description: 'Monitoramento de transações PIX, Cartão e Boleto',
        icon: CreditCard,
        pageKey: 'finance-methods'
      }
    ]
  },

  // 3. Tesouraria
  'finance-hub-treasury': {
    id: 'finance-hub-treasury',
    pageKey: 'finance-bank-accounts' as PageKey,
    route: '/app/finance-bank-accounts',
    title: 'Tesouraria',
    subtitle: 'Gestão de contas bancárias, conciliação PIX, remessas CNAB e pagamentos em lote',
    badge: 'Operação Bancária',
    items: [
      {
        id: 'trs-bank-accounts',
        title: 'Contas Bancárias',
        description: 'Cadastro e gestão de contas correntes e domicílios bancários',
        icon: Landmark,
        pageKey: 'finance-bank-accounts',
        badge: 'Domicílios',
        badgeVariant: 'info'
      },
      {
        id: 'trs-pix',
        title: 'PIX & Liquidação Instantânea',
        description: 'Monitoramento de chaves, webhooks e taxas de liquidação PIX',
        icon: Zap,
        pageKey: 'finance-methods'
      },
      {
        id: 'trs-batch',
        title: 'Pagamentos em Lote',
        description: 'Processamento em massa de transferências e liquidações a fornecedores',
        icon: ArrowUpRight,
        pageKey: 'finance-payables'
      },
      {
        id: 'trs-payout-schedule',
        title: 'Agenda de Repasses',
        description: 'Controle de prazos D+1, D+14 e D+30 com as adquirentes',
        icon: Calendar,
        pageKey: 'finance-payouts'
      },
      {
        id: 'trs-settlement',
        title: 'Central de Liquidação',
        description: 'Conciliação entre valores processados e depósitos bancários efetivados',
        icon: CheckCircle2,
        pageKey: 'finance-advance'
      },
      {
        id: 'trs-cash-projection',
        title: 'Projeção de Caixa',
        description: 'Previsão de saldos futuros com base em vendas e compromissos',
        icon: TrendingUp,
        pageKey: 'finance-cashflow'
      }
    ]
  },

  // 4. Compras & Fornecedores
  'finance-hub-procurement': {
    id: 'finance-hub-procurement',
    pageKey: 'finance-expenses' as PageKey,
    route: '/app/finance-expenses',
    title: 'Compras & Fornecedores',
    subtitle: 'Gestão completa de fornecedores 360°, contratos, cotações e despesas operacionais',
    badge: 'P2P / Suprimentos',
    categories: ['Compras & Pedidos', 'Gestão de Fornecedores', 'Contratos & Vencimentos'],
    items: [
      {
        id: 'proc-approvals',
        category: 'Compras & Pedidos',
        title: 'Central de Aprovações',
        description: 'Aprovação de solicitações de compras e pedidos de despesa',
        icon: CheckCircle2,
        pageKey: 'finance-expenses',
        badge: 'Alçada',
        badgeVariant: 'warning'
      },
      {
        id: 'proc-requests',
        category: 'Compras & Pedidos',
        title: 'Solicitações & Cotações',
        description: 'Requisições internas de compras e comparação de orçamentos',
        icon: FileText,
        pageKey: 'finance-expenses'
      },
      {
        id: 'proc-orders',
        category: 'Compras & Pedidos',
        title: 'Pedidos & Recebimentos',
        description: 'Acompanhamento de entrega física e aceite de notas fiscais',
        icon: Boxes,
        pageKey: 'finance-expenses'
      },
      {
        id: 'proc-suppliers',
        category: 'Gestão de Fornecedores',
        title: 'Cadastro de Fornecedores',
        description: 'Base unificada de prestadores de serviços, produtoras e técnicos',
        icon: Users,
        pageKey: 'finance-expenses',
        badge: 'Fornecedor 360°',
        badgeVariant: 'primary'
      },
      {
        id: 'proc-cnd',
        category: 'Gestão de Fornecedores',
        title: 'Documentos & CNDs',
        description: 'Validação de certidões negativas, contratos sociais e conformidade',
        icon: ShieldCheck,
        pageKey: 'finance-expenses'
      },
      {
        id: 'proc-contracts',
        category: 'Contratos & Vencimentos',
        title: 'Central de Contratos',
        description: 'Contratos de prestação de serviços com assinaturas e termos',
        icon: FileSignature,
        pageKey: 'finance-expenses'
      },
      {
        id: 'proc-installments',
        category: 'Contratos & Vencimentos',
        title: 'Parcelas & Vencimentos',
        description: 'Controle de parcelamento de serviços e aluguéis de espaços',
        icon: Calendar,
        pageKey: 'finance-expenses'
      }
    ]
  },

  // 5. Controladoria
  'finance-hub-controlling': {
    id: 'finance-hub-controlling',
    pageKey: 'finance-cost-centers' as PageKey,
    route: '/app/finance-cost-centers',
    title: 'Controladoria',
    subtitle: 'Centros de custos, orçamentos, DRE gerencial e resultado consolidado dos eventos',
    badge: 'Gestão Estratégica',
    items: [
      {
        id: 'ctrl-cost-centers',
        title: 'Centros de Custos',
        description: 'Segregação de despesas por área, artista, palco ou estrutura',
        icon: Boxes,
        pageKey: 'finance-cost-centers',
        badge: 'Rateios',
        badgeVariant: 'primary'
      },
      {
        id: 'ctrl-budget',
        title: 'Orçamentos & Budgets',
        description: 'Orçamento previsto versus realizado por centro de custo',
        icon: Scale,
        pageKey: 'finance-cost-centers'
      },
      {
        id: 'ctrl-cashflow',
        title: 'Fluxo de Caixa',
        description: 'Visão de liquidez diária, semanal e mensal do produtor',
        icon: TrendingUp,
        pageKey: 'finance-cashflow'
      },
      {
        id: 'ctrl-dre',
        title: 'DRE Gerencial',
        description: 'Demonstração do Resultado do Exercício com margem de contribuição',
        icon: BarChart3,
        pageKey: 'accounting-dre',
        badge: 'DRE',
        badgeVariant: 'info'
      },
      {
        id: 'ctrl-consolidated',
        title: 'Resultado Consolidado',
        description: 'Análise integrada de rentabilidade de todos os eventos da produtora',
        icon: FileSpreadsheet,
        pageKey: 'finance-consolidated'
      },
      {
        id: 'ctrl-chart',
        title: 'Plano de Contas Estruturado',
        description: 'Estrutura de contas do plano gerencial e financeiro',
        icon: BookOpenCheck,
        pageKey: 'finance-chart-accounts',
        badge: 'Financeiro',
        badgeVariant: 'success'
      }
    ]
  },

  // 6. Conciliação
  'finance-hub-reconciliation': {
    id: 'finance-hub-reconciliation',
    pageKey: 'finance-reconciliation' as PageKey,
    route: '/app/finance-reconciliation',
    title: 'Conciliação Financeira',
    subtitle: 'Conciliação bancária, conciliação de adquirentes e rastreabilidade total',
    badge: 'Auditoria 100%',
    items: [
      {
        id: 'rec-banking',
        title: 'Conciliação Bancária',
        description: 'Cruzamento de extrato bancário com lançamentos do sistema',
        icon: Landmark,
        pageKey: 'finance-reconciliation',
        badge: 'Bancos',
        badgeVariant: 'primary'
      },
      {
        id: 'rec-gateways',
        title: 'Conciliação de Gateways',
        description: 'Auditoria de transações de cartão e PIX com adquirentes',
        icon: CheckCircle2,
        pageKey: 'finance-reconciliation'
      },
      {
        id: 'rec-payouts',
        title: 'Conciliação de Repasses',
        description: 'Verificação de créditos efetuados nas contas dos produtores',
        icon: HandCoins,
        pageKey: 'finance-payouts'
      },
      {
        id: 'rec-traceability',
        title: 'Rastreabilidade Financeira',
        description: 'Trilha de auditoria ponta a ponta desde a venda até a liquidação',
        icon: ReceiptText,
        pageKey: 'accounting-rastreabilidade',
        badge: 'Auditoria',
        badgeVariant: 'info'
      }
    ]
  },

  // 7. Relatórios Financeiros
  'finance-hub-reports': {
    id: 'finance-hub-reports',
    pageKey: 'finance-reports' as PageKey,
    route: '/app/finance-reports',
    title: 'Relatórios Financeiros',
    subtitle: 'Emissão de borderôs oficiais, extratos consolidados e relatórios detalhados',
    badge: 'Exportações',
    items: [
      {
        id: 'rep-bordero',
        title: 'Borderô Financeiro',
        description: 'Fechamento oficial de bilheteria e taxas para artistas e auditores',
        icon: FileSpreadsheet,
        pageKey: 'finance-bordero',
        badge: 'Oficial',
        badgeVariant: 'primary'
      },
      {
        id: 'rep-consolidated',
        title: 'Relatório Consolidado',
        description: 'Panorama financeiro de todos os eventos ativos e encerrados',
        icon: BarChart3,
        pageKey: 'finance-consolidated'
      },
      {
        id: 'rep-statement',
        title: 'Extrato Completo',
        description: 'Histórico consolidado de todas as entradas, repasses e taxas',
        icon: ReceiptText,
        pageKey: 'finance-statement'
      },
      {
        id: 'rep-sales',
        title: 'Receitas Detalhadas',
        description: 'Discriminação de ingressos vendidos por lote, setor e canal',
        icon: CircleDollarSign,
        pageKey: 'finance-reports'
      },
      {
        id: 'rep-expenses',
        title: 'Despesas Detalhadas',
        description: 'Relatório discriminado de custos operacionais e contratuais',
        icon: ArrowUpRight,
        pageKey: 'finance-expenses'
      }
    ]
  }
}

// ==============================================================================
// HUBS DA CONTABILIDADE (5 HUBS ESTRATÉGICOS)
// ==============================================================================

export const ACCOUNTING_HUBS: Record<string, ModuleHubDefinition> = {
  // 1. Operação Contábil
  'accounting-hub-operations': {
    id: 'accounting-hub-operations',
    pageKey: 'accounting-plano-de-contas' as PageKey,
    route: '/contabilidade/operacao',
    title: 'Operação Contábil',
    subtitle: 'Plano de contas, lançamentos contábeis, conciliação e fechamento mensal',
    badge: 'Contabilidade Oficial',
    items: [
      {
        id: 'ops-chart',
        title: 'Plano de Contas Contábil',
        description: 'Hierarquia de contas patrimoniais e de resultado',
        icon: BookOpenCheck,
        pageKey: 'accounting-plano-de-contas',
        badge: 'Contábil',
        badgeVariant: 'primary'
      },
      {
        id: 'ops-entries',
        title: 'Lançamentos Contábeis',
        description: 'Livro Diário e partidas dobradas de todas as transações',
        icon: FileText,
        pageKey: 'accounting-lancamentos'
      },
      {
        id: 'ops-reconciliation',
        title: 'Centro de Conciliação Contábil',
        description: 'Confronto entre registros contábeis e extratos financeiros',
        icon: Scale,
        pageKey: 'accounting-conciliacao'
      },
      {
        id: 'ops-traceability',
        title: 'Rastreabilidade Contábil',
        description: 'Trilha de auditoria dos fatos geradores e lançamentos',
        icon: ReceiptText,
        pageKey: 'accounting-rastreabilidade'
      },
      {
        id: 'ops-closing',
        title: 'Fechamento Mensal',
        description: 'Bloqueio contábil de competência e encerramento de período',
        icon: LockKeyhole,
        pageKey: 'accounting-fechamento',
        badge: 'Competência',
        badgeVariant: 'warning'
      }
    ]
  },

  // 2. Demonstrações Contábeis
  'accounting-hub-statements': {
    id: 'accounting-hub-statements',
    pageKey: 'accounting-dre' as PageKey,
    route: '/contabilidade/demonstracoes',
    title: 'Demonstrações Contábeis',
    subtitle: 'DRE oficial, Balanço Patrimonial, DFC e indicadores contábeis',
    badge: 'Demonstrações',
    items: [
      {
        id: 'stmt-dre',
        title: 'DRE Gerencial & Contábil',
        description: 'Demonstração de resultados por competência e regime de caixa',
        icon: BarChart3,
        pageKey: 'accounting-dre',
        badge: 'DRE',
        badgeVariant: 'primary'
      },
      {
        id: 'stmt-balance',
        title: 'Balanço Patrimonial',
        description: 'Ativo, Passivo e Patrimônio Líquido apurados por competência',
        icon: Landmark,
        pageKey: 'accounting-balanco'
      },
      {
        id: 'stmt-intel',
        title: 'Inteligência Contábil',
        description: 'Indicadores contábeis, margens de contribuição e índices de liquidez',
        icon: Brain,
        pageKey: 'accounting-inteligencia',
        badge: 'AI Insights',
        badgeVariant: 'purple'
      }
    ]
  },

  // 3. Fiscal & Compliance
  'accounting-hub-compliance': {
    id: 'accounting-hub-compliance',
    pageKey: 'accounting-fiscal' as PageKey,
    route: '/contabilidade/fiscal-compliance',
    title: 'Fiscal & Compliance',
    subtitle: 'Apuração tributária, emissão de NFS-e, obrigações SPED e arquivo de documentos',
    badge: 'Compliance Fiscal',
    items: [
      {
        id: 'cmp-fiscal',
        title: 'Fiscal & SPED',
        description: 'Apuração de ISS, PIS, COFINS e geração de arquivos fiscais',
        icon: FileSpreadsheet,
        pageKey: 'accounting-fiscal',
        badge: 'Tributário',
        badgeVariant: 'primary'
      },
      {
        id: 'cmp-docs',
        title: 'Documentos & Assinaturas',
        description: 'Contratos sociais, borderôs assinados e custódia digital',
        icon: FileSignature,
        pageKey: 'accounting-documentos'
      }
    ]
  }
}

// ==============================================================================
// HUBS DO MARKETING (5 HUBS ESTRATÉGICOS)
// ==============================================================================

export const MARKETING_HUBS: Record<string, ModuleHubDefinition> = {
  // 1. Campanhas
  'marketing-hub-campaigns': {
    id: 'marketing-hub-campaigns',
    pageKey: 'marketing-campaigns' as PageKey,
    route: '/app/marketing/campanhas',
    title: 'Campanhas de Marketing',
    subtitle: 'Criação, gestão multicanal, cupons, afiliados e acompanhamento em tempo real',
    badge: 'Growth Engine',
    items: [
      {
        id: 'cmp-multichannel',
        title: 'Campanhas Multicanais',
        description: 'Gestão unificada de anúncios e ações promocionais',
        icon: Megaphone,
        pageKey: 'marketing-campaigns',
        badge: 'Multicanal',
        badgeVariant: 'primary'
      },
      {
        id: 'cmp-status-real',
        title: 'Status Real',
        description: 'Monitoramento ao vivo de entrega e veiculação de campanhas',
        icon: Activity,
        pageKey: 'marketing-status-real',
        badge: 'Ao Vivo',
        badgeVariant: 'success'
      },
      {
        id: 'cmp-ready',
        title: 'Campanhas Prontas',
        description: 'Modelos testados de alta conversão para eventos',
        icon: Sparkles,
        pageKey: 'marketing-ready-campaigns',
        badge: 'Templates',
        badgeVariant: 'purple'
      },
      {
        id: 'cmp-coupons',
        title: 'Cupons & Descontos',
        description: 'Criação de cupons promocionais, limites de uso e lotes secretos',
        icon: Tags,
        pageKey: 'marketing-coupons'
      },
      {
        id: 'cmp-utm',
        title: 'Central UTM & Links',
        description: 'Gerador de links parametrizados, QR Codes e tags de rastreamento',
        icon: Link2,
        pageKey: 'marketing-utm-central',
        badge: 'UTM / QR',
        badgeVariant: 'info'
      },
      {
        id: 'cmp-affiliates',
        title: 'Afiliados & Promoters',
        description: 'Comissionamento e controle de vendas por canal de influenciadores',
        icon: UsersRound,
        pageKey: 'marketing-affiliates'
      }
    ]
  },

  // 2. Comunicação
  'marketing-hub-communication': {
    id: 'marketing-hub-communication',
    pageKey: 'marketing-communications' as PageKey,
    route: '/app/marketing/comunicacao',
    title: 'Comunicação & Automações',
    subtitle: 'WhatsApp Oficial, E-mail marketing, réguas de relacionamento e resgate de vendas',
    badge: 'Comunicação 360°',
    items: [
      {
        id: 'com-whatsapp',
        title: 'WhatsApp Marketing',
        description: 'Disparos oficiais, notificações de ingresso e comunicados de evento',
        icon: MessageCircle,
        pageKey: 'marketing-whatsapp',
        badge: 'Oficial',
        badgeVariant: 'success'
      },
      {
        id: 'com-email',
        title: 'E-mail Marketing',
        description: 'Newsletters, comunicados de abertura de lotes e templates',
        icon: Mail,
        pageKey: 'marketing-email'
      },
      {
        id: 'com-automations',
        title: 'Automações & Jornadas',
        description: 'Gatilhos automáticos por comportamento de compra e interesse',
        icon: Zap,
        pageKey: 'marketing-automations'
      },
      {
        id: 'com-carts',
        title: 'Carrinhos Abandonados',
        description: 'Recuperação automática de clientes que não concluíram o checkout',
        icon: ShoppingCart,
        pageKey: 'remarketing-carts',
        badge: 'Resgate',
        badgeVariant: 'warning'
      }
    ]
  },

  // 3. Conversões & Pixels
  'marketing-hub-pixels': {
    id: 'marketing-hub-pixels',
    pageKey: 'marketing-tracking' as PageKey,
    route: '/app/marketing/pixels',
    title: 'Conversões & Pixels',
    subtitle: 'Central unificada de pixels, Meta CAPI, Google Ads, TikTok Ads e Spotify CAPI',
    badge: 'Server-Side CAPI',
    items: [
      {
        id: 'pix-central',
        title: 'Pixels e Conversões',
        description: 'Diagnóstico e monitoramento de saúde de todos os rastreadores',
        icon: Activity,
        pageKey: 'marketing-tracking',
        badge: 'Central 360°',
        badgeVariant: 'primary'
      },
      {
        id: 'pix-meta',
        title: 'Meta Ads & CAPI',
        description: 'Conversions API do Facebook e Instagram com deduplicação de eventos',
        icon: Target,
        pageKey: 'marketing-meta-ads'
      },
      {
        id: 'pix-google',
        title: 'Google Ads & GA4',
        description: 'Integração direta com Enhanced Conversions e Google Analytics 4',
        icon: ListTree,
        pageKey: 'marketing-google-ads'
      },
      {
        id: 'pix-tiktok',
        title: 'TikTok Ads Events API',
        description: 'Rastreamento de campanhas na rede de vídeos TikTok',
        icon: Play,
        pageKey: 'marketing-tiktok-ads'
      },
      {
        id: 'pix-spotify',
        title: 'Spotify Ads & Audio CAPI',
        description: 'Conversões e anúncios de áudio e display no Spotify',
        icon: Headphones,
        pageKey: 'marketing-spotify',
        badge: 'CAPI',
        badgeVariant: 'success'
      },
      {
        id: 'pix-attribution',
        title: 'Atribuição Multicanal',
        description: 'Modelos de atribuição (primeiro clique, último clique e linear)',
        icon: Scale,
        pageKey: 'marketing-attribution'
      }
    ]
  },

  // 4. Analytics de Marketing
  'marketing-hub-analytics': {
    id: 'marketing-hub-analytics',
    pageKey: 'marketing-reports' as PageKey,
    route: '/app/marketing/analytics',
    title: 'Analytics de Marketing',
    subtitle: 'Relatórios de performance, ranking de campanhas e insights de funil',
    badge: 'Business Intelligence',
    items: [
      {
        id: 'anl-channel',
        title: 'Performance por Canal',
        description: 'Comparativo de ROI, CPA e receita gerada por canal de marketing',
        icon: BarChart3,
        pageKey: 'marketing-channel-performance',
        badge: 'ROI / CPA',
        badgeVariant: 'primary'
      },
      {
        id: 'anl-ranking',
        title: 'Ranking de Campanhas',
        description: 'Campanhas mais eficientes ordenadas por conversão e receita',
        icon: Award,
        pageKey: 'marketing-campaign-ranking'
      },
      {
        id: 'anl-reports',
        title: 'Relatórios de Marketing',
        description: 'Exportação detalhada de dados de tráfego, conversão e receita',
        icon: FileSpreadsheet,
        pageKey: 'marketing-reports'
      }
    ]
  }
}
