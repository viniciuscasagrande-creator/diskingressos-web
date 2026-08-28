export type AccountGroup = 'Ativo' | 'Passivo' | 'Patrimônio Líquido' | 'Receitas' | 'Custos & Despesas'

export type AccountNode = {
  id: number
  code: string
  name: string
  type: 'Sintética' | 'Analítica'
  nature: 'Devedora' | 'Credora'
  balance: number
  level: number
  group: AccountGroup
  description?: string
}

export type AccountingEntry = {
  id: number
  entryCode: string
  date: string
  origin: 'Venda' | 'Gateway' | 'Repasse' | 'Despesa' | 'Manual' | 'Estorno' | 'Antecipação'
  description: string
  debitCode: string
  debitAccount: string
  creditCode: string
  creditAccount: string
  amount: number
  status: 'Automático' | 'Manual' | 'Auditado' | 'Conciliado'
  costCenter?: string
  document?: string
}

export const chartOfAccountsSeed: AccountNode[] = [
  // 1. ATIVO
  { id: 1, code: '1', name: 'ATIVO', type: 'Sintética', nature: 'Devedora', balance: 1840250.00, level: 1, group: 'Ativo' },
  { id: 2, code: '1.1', name: 'ATIVO CIRCULANTE', type: 'Sintética', nature: 'Devedora', balance: 1680250.00, level: 2, group: 'Ativo' },
  { id: 3, code: '1.1.01', name: 'DISPONIBILIDADES', type: 'Sintética', nature: 'Devedora', balance: 248960.40, level: 3, group: 'Ativo' },
  { id: 4, code: '1.1.01.01', name: 'Caixa Geral / Bilheteria Física', type: 'Analítica', nature: 'Devedora', balance: 14820.00, level: 4, group: 'Ativo' },
  { id: 5, code: '1.1.01.02', name: 'Banco Itaú S.A. — Conta Principal Movimento', type: 'Analítica', nature: 'Devedora', balance: 168420.40, level: 4, group: 'Ativo' },
  { id: 6, code: '1.1.01.03', name: 'Banco Bradesco S.A. — Conta Operação', type: 'Analítica', nature: 'Devedora', balance: 45200.00, level: 4, group: 'Ativo' },
  { id: 7, code: '1.1.01.04', name: 'Nu Pagamentos (Nubank) — Conta Custódia', type: 'Analítica', nature: 'Devedora', balance: 20520.00, level: 4, group: 'Ativo' },
  { id: 8, code: '1.1.02', name: 'DIREITOS CREDITÓRIOS E CLIENTES', type: 'Sintética', nature: 'Devedora', balance: 1431289.60, level: 3, group: 'Ativo' },
  { id: 9, code: '1.1.02.01', name: 'Contas a Receber — Cartão de Crédito Cielo / Rede', type: 'Analítica', nature: 'Devedora', balance: 420580.90, level: 4, group: 'Ativo' },
  { id: 10, code: '1.1.02.02', name: 'Contas a Receber — PIX Liquidação Instantânea', type: 'Analítica', nature: 'Devedora', balance: 942288.70, level: 4, group: 'Ativo' },
  { id: 11, code: '1.1.02.03', name: 'Reserva de Garantia Bloqueada (Custódia)', type: 'Analítica', nature: 'Devedora', balance: 68420.00, level: 4, group: 'Ativo' },
  { id: 12, code: '1.2', name: 'ATIVO NÃO CIRCULANTE', type: 'Sintética', nature: 'Devedora', balance: 160000.00, level: 2, group: 'Ativo' },
  { id: 13, code: '1.2.01', name: 'Imobilizado e Equipamentos de Portaria/POS', type: 'Analítica', nature: 'Devedora', balance: 160000.00, level: 3, group: 'Ativo' },

  // 2. PASSIVO
  { id: 14, code: '2', name: 'PASSIVO', type: 'Sintética', nature: 'Credora', balance: 519120.40, level: 1, group: 'Passivo' },
  { id: 15, code: '2.1', name: 'PASSIVO CIRCULANTE', type: 'Sintética', nature: 'Credora', balance: 519120.40, level: 2, group: 'Passivo' },
  { id: 16, code: '2.1.01', name: 'FORNECEDORES E PRESTADORES DE SERVIÇO', type: 'Sintética', nature: 'Credora', balance: 98540.30, level: 3, group: 'Passivo' },
  { id: 17, code: '2.1.01.01', name: 'Gateways e Adquirentes a Pagar', type: 'Analítica', nature: 'Credora', balance: 18450.30, level: 4, group: 'Passivo' },
  { id: 18, code: '2.1.01.02', name: 'Fornecedores de Tecnologia & AWS Cloud', type: 'Analítica', nature: 'Credora', balance: 16340.00, level: 4, group: 'Passivo' },
  { id: 19, code: '2.1.01.03', name: 'ECAD e Taxas de Direitos Autorais', type: 'Analítica', nature: 'Credora', balance: 63750.00, level: 4, group: 'Passivo' },
  { id: 20, code: '2.1.02', name: 'OBRIGAÇÕES COM PRODUTORES (REPASSES)', type: 'Sintética', nature: 'Credora', balance: 420580.10, level: 3, group: 'Passivo' },
  { id: 21, code: '2.1.02.01', name: 'Repasses a Liberar — Iron Maiden Symphonic', type: 'Analítica', nature: 'Credora', balance: 184200.00, level: 4, group: 'Passivo' },
  { id: 22, code: '2.1.02.02', name: 'Repasses a Liberar — 4 Amigos 2026', type: 'Analítica', nature: 'Credora', balance: 124500.00, level: 4, group: 'Passivo' },
  { id: 23, code: '2.1.02.03', name: 'Repasses a Liberar — Sem Parar', type: 'Analítica', nature: 'Credora', balance: 111880.10, level: 4, group: 'Passivo' },

  // 3. PATRIMÔNIO LÍQUIDO
  { id: 24, code: '3', name: 'PATRIMÔNIO LÍQUIDO', type: 'Sintética', nature: 'Credora', balance: 1321129.60, level: 1, group: 'Patrimônio Líquido' },
  { id: 25, code: '3.1', name: 'CAPITAL SOCIAL INTEGRADO', type: 'Analítica', nature: 'Credora', balance: 1000000.00, level: 2, group: 'Patrimônio Líquido' },
  { id: 26, code: '3.2', name: 'RESERVAS DE LUCROS E CONTINGÊNCIA', type: 'Analítica', nature: 'Credora', balance: 68228.70, level: 2, group: 'Patrimônio Líquido' },
  { id: 27, code: '3.3', name: 'LUCRO LÍQUIDO ACUMULADO DO EXERCÍCIO', type: 'Analítica', nature: 'Credora', balance: 252900.90, level: 2, group: 'Patrimônio Líquido' },

  // 4. RECEITAS
  { id: 28, code: '4', name: 'RECEITAS OPERACIONAIS', type: 'Sintética', nature: 'Credora', balance: 1284320.00, level: 1, group: 'Receitas' },
  { id: 29, code: '4.1', name: 'RECEITA DE INTERMEDIAÇÃO DE INGRESSOS', type: 'Analítica', nature: 'Credora', balance: 1086140.50, level: 2, group: 'Receitas' },
  { id: 30, code: '4.2', name: 'RECEITA COM TAXA DE CONVENIÊNCIA E PROCESSAMENTO', type: 'Analítica', nature: 'Credora', balance: 153179.50, level: 2, group: 'Receitas' },
  { id: 31, code: '4.3', name: 'RECEITA COM ANTECIPAÇÕES E SPREAD FINANCEIRO', type: 'Analítica', nature: 'Credora', balance: 45000.00, level: 2, group: 'Receitas' },

  // 5. CUSTOS & DESPESAS
  { id: 32, code: '5', name: 'CUSTOS E DESPESAS OPERACIONAIS', type: 'Sintética', nature: 'Devedora', balance: 1031419.10, level: 1, group: 'Custos & Despesas' },
  { id: 33, code: '5.1', name: 'CUSTOS DIRETOS DE REPASSE A PRODUTORAS', type: 'Analítica', nature: 'Devedora', balance: 783960.00, level: 2, group: 'Custos & Despesas' },
  { id: 34, code: '5.2', name: 'TAXAS DE PROCESSAMENTO E ADQUIRENTES', type: 'Analítica', nature: 'Devedora', balance: 96120.40, level: 2, group: 'Custos & Despesas' },
  { id: 35, code: '5.3', name: 'INFRAESTRUTURA CLOUD, SERVIDORES E TI', type: 'Analítica', nature: 'Devedora', balance: 64200.00, level: 2, group: 'Custos & Despesas' },
  { id: 36, code: '5.4', name: 'MARKETING DIGITAL, ADS E ATRIBUIÇÃO UTM', type: 'Analítica', nature: 'Devedora', balance: 44338.70, level: 2, group: 'Custos & Despesas' },
  { id: 37, code: '5.5', name: 'DESPESAS ADMINISTRATIVAS E TRIBUTOS', type: 'Analítica', nature: 'Devedora', balance: 42800.00, level: 2, group: 'Custos & Despesas' },
]

export const accountingEntriesSeed: AccountingEntry[] = [
  {
    id: 1,
    entryCode: 'LCT-2026-0881',
    date: '28/08/2026 09:42',
    origin: 'Venda',
    description: 'Venda Iron Maiden Symphonic — Setor Premium #DI-98240',
    debitCode: '1.1.02.01',
    debitAccount: 'Contas a Receber — Cartão Cielo',
    creditCode: '4.1',
    creditAccount: 'Receita de Intermediação de Ingressos',
    amount: 1250.00,
    status: 'Automático',
    costCenter: 'CC-001 — Show Iron Maiden',
    document: 'PED-IM-98240'
  },
  {
    id: 2,
    entryCode: 'LCT-2026-0882',
    date: '28/08/2026 09:42',
    origin: 'Gateway',
    description: 'Apropriação da Taxa de Intermediação DiskIngressos',
    debitCode: '5.2',
    debitAccount: 'Taxas de Processamento e Adquirentes',
    creditCode: '4.2',
    creditAccount: 'Receita com Taxa de Conveniência',
    amount: 85.00,
    status: 'Automático',
    costCenter: 'CC-001 — Show Iron Maiden',
    document: 'TAX-GTW-98240'
  },
  {
    id: 3,
    entryCode: 'LCT-2026-0883',
    date: '28/08/2026 08:15',
    origin: 'Repasse',
    description: 'Repasse PIX Lote 2 — Produtora Rua da Música',
    debitCode: '2.1.02.01',
    debitAccount: 'Repasses a Liberar — Iron Maiden',
    creditCode: '1.1.01.02',
    creditAccount: 'Banco Itaú S.A. Movimento',
    amount: 8420.00,
    status: 'Automático',
    costCenter: 'CC-001 — Show Iron Maiden',
    document: 'REP-PIX-4AM-02'
  },
  {
    id: 4,
    entryCode: 'LCT-2026-0884',
    date: '27/08/2026 20:11',
    origin: 'Venda',
    description: 'Venda 29ª Conferência Espírita — Inteira #DI-98190',
    debitCode: '1.1.02.02',
    debitAccount: 'Contas a Receber — PIX Instantâneo',
    creditCode: '4.1',
    creditAccount: 'Receita de Intermediação de Ingressos',
    amount: 980.00,
    status: 'Automático',
    costCenter: 'CC-004 — Conferência Espírita',
    document: 'PED-CF-98190'
  },
  {
    id: 5,
    entryCode: 'LCT-2026-0885',
    date: '27/08/2026 18:03',
    origin: 'Gateway',
    description: 'Taxa operacional diária adquirente Cielo',
    debitCode: '5.2',
    debitAccount: 'Taxas de Processamento e Adquirentes',
    creditCode: '1.1.02.01',
    creditAccount: 'Contas a Receber — Cartão Cielo',
    amount: 184.90,
    status: 'Automático',
    costCenter: 'CC-000 — Corporativo',
    document: 'TAX-CIE-1803'
  },
  {
    id: 6,
    entryCode: 'LCT-2026-0886',
    date: '27/08/2026 16:28',
    origin: 'Venda',
    description: 'Venda Sem Parar — Passaporte 3 Dias #DI-98155',
    debitCode: '1.1.02.02',
    debitAccount: 'Contas a Receber — PIX Instantâneo',
    creditCode: '4.1',
    creditAccount: 'Receita de Intermediação de Ingressos',
    amount: 1640.00,
    status: 'Automático',
    costCenter: 'CC-002 — Sem Parar',
    document: 'PED-SP-98155'
  },
  {
    id: 7,
    entryCode: 'LCT-2026-0887',
    date: '27/08/2026 14:03',
    origin: 'Estorno',
    description: 'Estorno e Cancelamento de Ingresso #DI-98081',
    debitCode: '4.1',
    debitAccount: 'Receita de Intermediação de Ingressos',
    creditCode: '1.1.02.01',
    creditAccount: 'Contas a Receber — Cartão Cielo',
    amount: 190.00,
    status: 'Automático',
    costCenter: 'CC-004 — Conferência Espírita',
    document: 'EST-CF-98081'
  },
  {
    id: 8,
    entryCode: 'LCT-2026-0888',
    date: '26/08/2026 15:30',
    origin: 'Despesa',
    description: 'Servidores de Nuvem AWS Brasil Mês 08',
    debitCode: '5.3',
    debitAccount: 'Infraestrutura Cloud, Servidores e TI',
    creditCode: '1.1.01.02',
    creditAccount: 'Banco Itaú S.A. Movimento',
    amount: 7420.00,
    status: 'Automático',
    costCenter: 'CC-000 — Corporativo',
    document: 'NF-90821'
  },
  {
    id: 9,
    entryCode: 'LCT-2026-0889',
    date: '25/08/2026 11:00',
    origin: 'Manual',
    description: 'Ajuste de Arredondamento e Conciliação Bancária',
    debitCode: '5.5',
    debitAccount: 'Despesas Administrativas e Tributos',
    creditCode: '1.1.01.02',
    creditAccount: 'Banco Itaú S.A. Movimento',
    amount: 12.40,
    status: 'Manual',
    costCenter: 'CC-000 — Corporativo',
    document: 'AJU-MAN-0826'
  }
]

export type LedgerMovement = {
  id: number
  date: string
  entryCode: string
  description: string
  counterpart: string
  debit: number
  credit: number
  balance: number
}

export const sampleLedgerMovements: Record<string, LedgerMovement[]> = {
  '1.1.01.02': [
    { id: 1, date: '01/08/2026', entryCode: 'SALDO-ANT', description: 'Saldo Inicial de Transporte do Exercício', counterpart: 'Transporte de Balancete', debit: 145200.00, credit: 0, balance: 145200.00 },
    { id: 2, date: '25/08/2026', entryCode: 'LCT-2026-0889', description: 'Ajuste de Arredondamento e Conciliação', counterpart: '5.5 Despesas Administrativas', debit: 0, credit: 12.40, balance: 145187.60 },
    { id: 3, date: '26/08/2026', entryCode: 'LCT-2026-0888', description: 'Pagamento Servidores Nuvem AWS Brasil', counterpart: '5.3 Infraestrutura Cloud', debit: 0, credit: 7420.00, balance: 137767.60 },
    { id: 4, date: '27/08/2026', entryCode: 'LCT-2026-0886', description: 'Recebimento Vendas PIX Sem Parar', counterpart: '4.1 Receita Intermediação', debit: 39072.80, credit: 0, balance: 176840.40 },
    { id: 5, date: '28/08/2026', entryCode: 'LCT-2026-0883', description: 'Repasse PIX Lote 2 Produtora Rua da Música', counterpart: '2.1.02.01 Repasses Produtores', debit: 0, credit: 8420.00, balance: 168420.40 },
  ],
  '1.1.02.01': [
    { id: 1, date: '01/08/2026', entryCode: 'SALDO-ANT', description: 'Saldo a Liquidar Adquirentes', counterpart: 'Transporte', debit: 380500.00, credit: 0, balance: 380500.00 },
    { id: 2, date: '27/08/2026', entryCode: 'LCT-2026-0885', description: 'Taxa operacional diária Cielo', counterpart: '5.2 Taxas Processamento', debit: 0, credit: 184.90, balance: 380315.10 },
    { id: 3, date: '27/08/2026', entryCode: 'LCT-2026-0887', description: 'Estorno cancelamento ingresso #DI-98081', counterpart: '4.1 Receita Intermediação', debit: 0, credit: 190.00, balance: 380125.10 },
    { id: 4, date: '28/08/2026', entryCode: 'LCT-2026-0881', description: 'Venda parcelada Iron Maiden Premium', counterpart: '4.1 Receita Intermediação', debit: 40455.80, credit: 0, balance: 420580.90 },
  ]
}

