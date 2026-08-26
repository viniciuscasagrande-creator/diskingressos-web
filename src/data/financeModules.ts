import type { FinanceModuleMeta } from '../types/financeHub';

export const financeModulesList: FinanceModuleMeta[] = [
  // ==========================================
  // 1. OPERAÇÕES DE CAIXA (AZUL #1677FF)
  // ==========================================
  {
    key: 'saldo-consolidado',
    category: 'operacoes-caixa',
    title: 'Saldo Consolidado',
    subtitle: 'Visão executiva em tempo real',
    description: 'Acompanhe saldo disponível para saque imediato, recebíveis futuros em D+30 e montante bloqueado.',
    badge: 'Disponível R$ 15.265,60',
    badgeTone: 'blue',
    accentColor: 'blue',
    metrics: { label: 'Disponível', value: 'R$ 15.265,60' },
    tags: ['Saldo', 'Carteira', 'D+30', 'Liquidez']
  },
  {
    key: 'solicitar-repasse',
    category: 'operacoes-caixa',
    title: 'Solicitar Repasse',
    subtitle: 'Transferência para conta bancária',
    description: 'Solicite resgate de saldo de vendas para as contas bancárias ou chaves PIX cadastradas da produtora.',
    badge: 'Liberação D+1 / D+2',
    badgeTone: 'blue',
    accentColor: 'blue',
    metrics: { label: 'Em Processamento', value: 'R$ 48.320,00' },
    tags: ['TED', 'PIX', 'Bancos', 'Resgates']
  },
  {
    key: 'antecipacoes',
    category: 'operacoes-caixa',
    title: 'Antecipações de Recebíveis',
    subtitle: 'Liquidez para produção do evento',
    description: 'Simule e solicite adiantamento de vendas com taxas competitivas e liberação em até 24 horas úteis.',
    badge: 'Taxa 1.89% a.m.',
    badgeTone: 'blue',
    accentColor: 'blue',
    metrics: { label: 'Disponível para Antecipar', value: 'R$ 72.410,80' },
    tags: ['Crédito', 'Adiantamento', 'Giro', 'Fluxo']
  },
  {
    key: 'extrato-geral',
    category: 'operacoes-caixa',
    title: 'Extrato Geral Detalhado',
    subtitle: 'Histórico contábil completo',
    description: 'Consulte cada lançamento financeiro por data, pedido, evento, taxas retidas, estornos e créditos.',
    badge: 'Últimos 30 dias',
    badgeTone: 'blue',
    accentColor: 'blue',
    metrics: { label: 'Lançamentos', value: '428 registros' },
    tags: ['Auditoria', 'Transações', 'OFX', 'CSV']
  },
  {
    key: 'pontos-venda',
    category: 'operacoes-caixa',
    title: 'Pontos de Venda (PDV / POS)',
    subtitle: 'Caixas físicos e maquininhas',
    description: 'Conciliação de vendas em dinheiro, débito, crédito e TEF registradas nos caixas físicos da bilheteria.',
    badge: '3 Terminais Ativos',
    badgeTone: 'blue',
    accentColor: 'blue',
    metrics: { label: 'Faturamento PDV', value: 'R$ 28.460,00' },
    tags: ['POS', 'Maquininhas', 'Bilheteria', 'Operadores']
  },
  {
    key: 'devolucoes-estornos',
    category: 'operacoes-caixa',
    title: 'Devoluções & Estornos',
    subtitle: 'Gestão de cancelamentos e chargebacks',
    description: 'Controle de reembolsos ao consumidor, estornos de cartão de crédito e contestações de compras.',
    badge: '0.4% Taxa de Estorno',
    badgeTone: 'blue',
    accentColor: 'blue',
    metrics: { label: 'Total Estornado', value: 'R$ 1.240,00' },
    tags: ['Chargeback', 'Reembolso', 'Cancelamento']
  },

  // ==========================================
  // 2. ADVANCED & INTELIGÊNCIA (LARANJA #F97316)
  // ==========================================
  {
    key: 'financeiro-advanced',
    category: 'advanced-inteligencia',
    title: 'Financeiro Advanced',
    subtitle: 'Adiantamentos estruturados de grande porte',
    description: 'Gestão de contratos financeiros de aportes de capital, juros acordados e amortização automática.',
    badge: 'Módulo Corporativo',
    badgeTone: 'orange',
    accentColor: 'orange',
    metrics: { label: 'Volume Alocado', value: 'R$ 250.000,00' },
    tags: ['Contratos', 'Aportes', 'Juros', 'Amortização']
  },
  {
    key: 'conciliacao-bancaria',
    category: 'advanced-inteligencia',
    title: 'Conciliação Bancária',
    subtitle: 'Conferência automática com bancos',
    description: 'Importe extratos OFX/CNAB e cruze recebimentos de adquirentes com o borderô de vendas da bilheteria.',
    badge: '99.8% Conciliado',
    badgeTone: 'orange',
    accentColor: 'orange',
    metrics: { label: 'Divergência', value: 'R$ 0,00' },
    tags: ['OFX', 'CNAB', 'Adquirentes', 'Auditoria']
  },
  {
    key: 'financeiro-spread',
    category: 'advanced-inteligencia',
    title: 'Financeiro Spread',
    subtitle: 'Margem comercial e taxa de conveniência',
    description: 'Análise de rentabilidade por ingresso vendido, margem de serviço retida e comissões de parceiros.',
    badge: 'Margem 12.5%',
    badgeTone: 'orange',
    accentColor: 'orange',
    metrics: { label: 'Spread Líquido', value: 'R$ 18.590,00' },
    tags: ['Conveniência', 'Margem', 'Lucro', 'Markup']
  },
  {
    key: 'split-financeiro',
    category: 'advanced-inteligencia',
    title: 'Split Financeiro',
    subtitle: 'Partilha automatizada de receitas',
    description: 'Divisão automática de pagamentos entre produtora, coprodutor, casa de eventos, artista e bilheteria.',
    badge: 'Regras Ativas',
    badgeTone: 'orange',
    accentColor: 'orange',
    metrics: { label: 'Coprodutores', value: '3 integrados' },
    tags: ['Split', 'Comissões', 'Subcontas', 'Partilha']
  },
  {
    key: 'inteligencia-financeira',
    category: 'advanced-inteligencia',
    title: 'Inteligência Financeira (IA)',
    subtitle: 'Previsões de receita e curvas de venda',
    description: 'Algoritmos preditivos que calculam data estimada de sold-out, ticket médio otimizado e LTV.',
    badge: 'Projeção IA',
    badgeTone: 'orange',
    accentColor: 'orange',
    metrics: { label: 'Previsão de Sold-out', value: '92% probabilidade' },
    tags: ['IA', 'Projeção', 'LTV', 'Machine Learning']
  },
  {
    key: 'operadoras-cartao',
    category: 'advanced-inteligencia',
    title: 'Operadoras de Cartão & Adquirentes',
    subtitle: 'Monitoramento de taxas MDR e prazos',
    description: 'Comparativo de taxas de processamento entre adquirentes (Stone, Cielo, Rede, PagSeguro e Mercado Pago).',
    badge: 'MDR Médio 2.45%',
    badgeTone: 'orange',
    accentColor: 'orange',
    metrics: { label: 'Adquirente Ativa', value: 'Stone / Rede' },
    tags: ['Gateways', 'MDR', 'TEF', 'Antifraude']
  },

  // ==========================================
  // 3. SIMULADORES, MÉTODOS & LIQUIDAÇÕES (VERDE #10B981)
  // ==========================================
  {
    key: 'simulador-spread',
    category: 'simuladores-liquidacoes',
    title: 'Simulador de Spread & Lucro',
    subtitle: 'Calculadora de taxas e retorno líquido',
    description: 'Simule diferentes preços de lote, taxas de serviço ao cliente e custos financeiros para maximizar seu lucro.',
    badge: 'Calculadora Interativa',
    badgeTone: 'green',
    accentColor: 'green',
    metrics: { label: 'Simulador Ativo', value: 'Calculadora 2.0' },
    tags: ['Simulador', 'Projeção', 'Lucro', 'Precificação']
  },
  {
    key: 'metodos-pagamento',
    category: 'simuladores-liquidacoes',
    title: 'Métodos de Pagamento',
    subtitle: 'PIX, Cartão em 12x, Débito e Boleto',
    description: 'Configure prazos de vencimento de boleto, regras de parcelamento sem juros e chave PIX de recebimento.',
    badge: 'PIX Instantâneo',
    badgeTone: 'green',
    accentColor: 'green',
    metrics: { label: 'Conversão PIX', value: '68% do total' },
    tags: ['PIX', 'Cartão 12x', 'Boleto', 'Checkout']
  },
  {
    key: 'pagamentos-customizados',
    category: 'simuladores-liquidacoes',
    title: 'Pagamentos Customizados & Permutas',
    subtitle: 'Cortesias comerciais e patrocínios',
    description: 'Controle ingressos emitidos com taxa administrativa personalizada, permutas de rádio e cotas de patrocinador.',
    badge: 'Cotas Especiais',
    badgeTone: 'green',
    accentColor: 'green',
    metrics: { label: 'Permutas Emitidas', value: '584 ingressos' },
    tags: ['Permutas', 'Cortesias', 'Patrocinadores']
  },
  {
    key: 'despesas',
    category: 'simuladores-liquidacoes',
    title: 'Gestão de Despesas do Evento',
    subtitle: 'Custos diretos, ECAD e infraestrutura',
    description: 'Lançamento de contas a pagar: segurança, brigada, gerador, limpeza, aluguel do espaço e ECAD.',
    badge: 'Orçamento Controlado',
    badgeTone: 'green',
    accentColor: 'green',
    metrics: { label: 'Despesas Lançadas', value: 'R$ 38.500,00' },
    tags: ['Custos', 'ECAD', 'Fornecedores', 'Contas a Pagar']
  },
  {
    key: 'bordero-assinaturas',
    category: 'simuladores-liquidacoes',
    title: 'Borderô / Assinaturas Digitais',
    subtitle: 'Fechamento fiscal e borderô oficial',
    description: 'Gere o borderô final do evento com cálculo de ISS municipal, taxas DiskIngressos e assinatura digital em blockchain.',
    badge: 'Hash SHA-256',
    badgeTone: 'green',
    accentColor: 'green',
    metrics: { label: 'Status Borderô', value: 'Pronto para Fechar' },
    tags: ['Borderô', 'Fiscal', 'Assinatura', 'ISS']
  },
  {
    key: 'contas-bancarias',
    category: 'simuladores-liquidacoes',
    title: 'Contas Bancárias & Chaves Pix',
    subtitle: 'Dados bancários para liquidação',
    description: 'Cadastre e gerencie contas correntes de titularidade da produtora (PJ) para recebimento de TED e PIX.',
    badge: '2 Contas Validadas',
    badgeTone: 'green',
    accentColor: 'green',
    metrics: { label: 'Conta Principal', value: 'Banco Itaú' },
    tags: ['Bancos', 'Contas PJ', 'Chaves Pix', 'Validação']
  },
  {
    key: 'negociacoes',
    category: 'simuladores-liquidacoes',
    title: 'Negociações Comerciais',
    subtitle: 'Tabelas de taxas por volume de evento',
    description: 'Consulte as condições comerciais negociadas com a DiskIngressos para seus próximos festivais e shows.',
    badge: 'Plano Enterprise',
    badgeTone: 'green',
    accentColor: 'green',
    metrics: { label: 'Taxa Base', value: '8.0% + R$ 2,50' },
    tags: ['Contrato', 'Taxas', 'Condições', 'Acordo']
  }
];
