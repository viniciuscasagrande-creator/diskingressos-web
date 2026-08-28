export type SystemTier = 'standard' | 'advanced' | 'expert'

export type FinancialTransaction = {
  id: number
  date: string
  event: string
  description: string
  type: 'Venda' | 'Repasse' | 'Taxa' | 'Estorno' | 'Antecipação'
  method: 'Pix' | 'Crédito' | 'Débito' | 'Boleto' | 'Transferência'
  status: 'Pago' | 'Pendente' | 'Processando' | 'Estornado' | 'Confirmado' | 'Liquidado'
  value: number
  orderCode?: string
  customer?: string
  gross?: number
  fee?: number
}

export type Payout = {
  id: number
  event: string
  producer?: string
  requestedAt: string
  scheduledFor: string
  gross: number
  fees: number
  net: number
  bankAccount?: string
  status: 'Disponível' | 'Agendado' | 'Processando' | 'Pago' | 'Em Análise' | 'Em análise'
  method?: 'PIX' | 'TED'
  proofUrl?: string
}

export type BankAccount = {
  id: number
  bankName: string
  bankCode: string
  accountType: 'Corrente' | 'Poupança' | 'Pagamento'
  agency: string
  accountNumber: string
  pixKey: string
  pixType: 'CNPJ' | 'E-mail' | 'Telefone' | 'Aleatória'
  holderName: string
  holderDocument: string
  isPrimary: boolean
  status: 'Verificada' | 'Em Análise' | 'Inativa'
}

export type FlowPipelineStep = {
  id: string
  title: string
  subtitle: string
  amountCents: number
  count: number
  status: 'active' | 'synced' | 'pending' | 'completed'
}

export type EventBalance = {
  eventId: number
  eventName: string
  producer: string
  grossSales: number
  fees: number
  available: number
  receivable: number
  blocked: number
  paidOut: number
}

export type ReceivableItem = {
  id: number
  title: string
  event: string
  client: string
  method: 'Crédito' | 'Pix' | 'Boleto' | 'Débito'
  saleDate: string
  dueDate: string
  installment: string
  grossValue: number
  gatewayFee: number
  netValue: number
  status: 'A Vencer' | 'Liquidado' | 'Antecipado' | 'Processando'
}

export type PayableItem = {
  id: number
  description: string
  vendor: string
  category: 'Repasse Produtor' | 'Gateway Adquirente' | 'Servidores & Infra' | 'Equipe & Portaria' | 'Taxas & Impostos' | 'Direitos Autorais'
  event: string
  dueDate: string
  paymentMethod: 'PIX' | 'Boleto' | 'TED' | 'Débito Automático'
  amount: number
  status: 'Agendado' | 'Pendente' | 'Pago' | 'Atrasado'
  documentNumber?: string
}

export const financeSummary = {
  availableBalance: 248960.40,
  blockedBalance: 68420.15,
  receivable: 420580.90,
  payable: 98540.30,
  transfers: 221800.00,
  grossRevenue: 1284320.00,
  netRevenue: 1086140.50,
  fees: 96120.40,
  nextPayout: 84320.00,
}

export const monthlyCashFlow = [
  { month: 'Mar', receita: 148000, despesa: 92000, repasse: 68000 },
  { month: 'Abr', receita: 184000, despesa: 101000, repasse: 79000 },
  { month: 'Mai', receita: 216000, despesa: 113000, repasse: 96000 },
  { month: 'Jun', receita: 252000, despesa: 124000, repasse: 118000 },
  { month: 'Jul', receita: 298000, despesa: 139000, repasse: 132000 },
  { month: 'Ago', receita: 334000, despesa: 146000, repasse: 149000 }
]

export const cashFlow = [
  { day: '22/08', entry: 14800, exit: 3900 },
  { day: '23/08', entry: 21300, exit: 8500 },
  { day: '24/08', entry: 19750, exit: 6200 },
  { day: '25/08', entry: 26400, exit: 9200 },
  { day: '26/08', entry: 31100, exit: 7800 },
  { day: '27/08', entry: 38450, exit: 11200 },
  { day: '28/08', entry: 42900, exit: 8900 },
]

export const bankAccountsSeed: BankAccount[] = [
  { id: 1, bankName: 'Banco Itaú S.A.', bankCode: '341', accountType: 'Corrente', agency: '0432', accountNumber: '29814-5', pixKey: '44.821.902/0001-38', pixType: 'CNPJ', holderName: 'Disk Produções e Eventos Ltda', holderDocument: '44.821.902/0001-38', isPrimary: true, status: 'Verificada' },
  { id: 2, bankName: 'Banco Bradesco S.A.', bankCode: '237', accountType: 'Corrente', agency: '1892', accountNumber: '55421-0', pixKey: 'financeiro@diskingressos.com.br', pixType: 'E-mail', holderName: 'Disk Produções e Eventos Ltda', holderDocument: '44.821.902/0001-38', isPrimary: false, status: 'Verificada' },
  { id: 3, bankName: 'Nu Pagamentos (Nubank)', bankCode: '260', accountType: 'Pagamento', agency: '0001', accountNumber: '849102-1', pixKey: '+5541998811223', pixType: 'Telefone', holderName: 'Vinicius Casagrande Produtora', holderDocument: '18.942.112/0001-09', isPrimary: false, status: 'Verificada' },
  { id: 4, bankName: 'Banco do Brasil S.A.', bankCode: '001', accountType: 'Corrente', agency: '3201', accountNumber: '12490-8', pixKey: 'd7a8e2b1-56c4-4a21-998f-124b890a21cf', pixType: 'Aleatória', holderName: 'Curitiba Shows e Eventos S.A.', holderDocument: '29.381.042/0001-55', isPrimary: false, status: 'Verificada' },
]

export const transactions: FinancialTransaction[] = [
  { id: 1, date: '28/08/2026 09:42', event: 'IRON MAIDEN — THE FUTURE PAST', description: 'Iron Maiden Symphonic — Setor Premium #DI-98240', type: 'Venda', method: 'Pix', status: 'Confirmado', value: 1250, gross: 1250, fee: 85, orderCode: 'PED-IM-98240', customer: 'Lucas Silveira' },
  { id: 2, date: '28/08/2026 08:15', event: '4 AMIGOS 2026', description: 'Repasse Produtora Rua da Música Lote 2', type: 'Repasse', method: 'Pix', status: 'Processando', value: -8420, gross: -8420, fee: 0, orderCode: 'REP-PIX-4AM-02' },
  { id: 3, date: '27/08/2026 20:11', event: 'CONFERÊNCIA FUTURO DIGITAL', description: '29ª Conferência — Ingresso Inteira #DI-98190', type: 'Venda', method: 'Crédito', status: 'Confirmado', value: 980, gross: 980, fee: 66.64, orderCode: 'PED-CF-98190', customer: 'Mariana Rocha' },
  { id: 4, date: '27/08/2026 18:03', event: 'GLOBAL', description: 'Taxa operacional de gateway adquirente', type: 'Taxa', method: 'Transferência', status: 'Liquidado', value: -184.90, gross: -184.90, fee: 0, orderCode: 'TAX-GTW-1803' },
  { id: 5, date: '27/08/2026 16:28', event: 'SEM PARAR — MÚSICA E NATUREZA', description: 'Sem Parar — Passaporte 3 Dias #DI-98155', type: 'Venda', method: 'Pix', status: 'Confirmado', value: 1640, gross: 1640, fee: 111.52, orderCode: 'PED-SP-98155', customer: 'Rodrigo Medeiros' },
  { id: 6, date: '27/08/2026 14:03', event: 'CONFERÊNCIA FUTURO DIGITAL', description: 'Estorno #DI-98081 (Direito de Arrependimento)', type: 'Estorno', method: 'Crédito', status: 'Estornado', value: -190, gross: -190, fee: 0, orderCode: 'EST-CF-98081', customer: 'Bruno Freitas' },
  { id: 7, date: '26/08/2026 15:20', event: 'SEM PARAR — MÚSICA E NATUREZA', description: 'Pedido PDV Balcão #DI-98055', type: 'Venda', method: 'Débito', status: 'Pago', value: 350, gross: 350, fee: 17.50, orderCode: 'PED-SP-98055', customer: 'Carla Dias' },
  { id: 8, date: '26/08/2026 10:08', event: 'IRON MAIDEN — THE FUTURE PAST', description: 'Camarote Open Bar #DI-97992', type: 'Venda', method: 'Pix', status: 'Pago', value: 920, gross: 920, fee: 62.56, orderCode: 'PED-IM-97992', customer: 'Diego Costa' },
  { id: 9, date: '25/08/2026 17:30', event: '4 AMIGOS 2026', description: 'Repasse PIX Lote 1 para Itaú', type: 'Repasse', method: 'Pix', status: 'Pago', value: -45000, gross: -45000, fee: 0, orderCode: 'REP-PIX-4AM-01' },
]

export const payouts: Payout[] = [
  { id: 1, producer: 'Rua da Música', event: 'IRON MAIDEN — THE FUTURE PAST', requestedAt: '28/08/2026', scheduledFor: '30/08/2026', gross: 42300, fees: 0, net: 42300, bankAccount: 'Banco Itaú (341) Ag. 0432 C/C 29814-5', status: 'Agendado', method: 'PIX' },
  { id: 2, producer: 'Eventos Paraná', event: '29ª CONFERÊNCIA ESPÍRITA', requestedAt: '27/08/2026', scheduledFor: '02/09/2026', gross: 21840, fees: 0, net: 21840, bankAccount: 'Banco Bradesco (237) Ag. 1892 C/C 55421-0', status: 'Em Análise', method: 'TED' },
  { id: 3, producer: 'Nature Experience', event: 'SEM PARAR — MÚSICA E NATUREZA', requestedAt: '26/08/2026', scheduledFor: '05/09/2026', gross: 20180, fees: 0, net: 20180, bankAccount: 'Nu Pagamentos (260) Ag. 0001 C/P 849102-1', status: 'Agendado', method: 'PIX' },
  { id: 4, producer: 'Disk Produções', event: '4 AMIGOS 2026', requestedAt: '23/08/2026', scheduledFor: '25/08/2026', gross: 45000, fees: 0, net: 45000, bankAccount: 'Banco Itaú (341) Ag. 0432 C/C 29814-5', status: 'Pago', method: 'PIX', proofUrl: '#' },
  { id: 5, producer: 'Curitiba Shows', event: 'FESTIVAL GASTRONÔMICO CURITIBA', requestedAt: '20/08/2026', scheduledFor: '22/08/2026', gross: 64200, fees: 0, net: 64200, bankAccount: 'Banco do Brasil (001) Ag. 3201 C/C 12490-8', status: 'Pago', method: 'TED', proofUrl: '#' },
]

export const eventBalances: EventBalance[] = [
  { eventId: 1, eventName: 'SEM PARAR — EXPERIÊNCIA MÚSICA E NATUREZA', producer: 'Nature Experience', grossSales: 168400.00, fees: 11451.20, available: 64200.00, receivable: 82748.80, blocked: 10000.00, paidOut: 35000.00 },
  { eventId: 2, eventName: 'IRON MAIDEN — THE FUTURE PAST TOUR', producer: 'Rua da Música', grossSales: 485200.00, fees: 32993.60, available: 112500.40, receivable: 289706.00, blocked: 35000.00, paidOut: 115000.00 },
  { eventId: 3, eventName: '4 AMIGOS 2026 — EDIÇÃO ESPECIAL', producer: 'Disk Produções', grossSales: 312000.00, fees: 21216.00, available: 52400.00, receivable: 183384.00, blocked: 15000.00, paidOut: 45000.00 },
  { eventId: 4, eventName: '29ª CONFERÊNCIA ESTADUAL ESPÍRITA', producer: 'Eventos Paraná', grossSales: 94800.00, fees: 6446.40, available: 19860.00, receivable: 60133.60, blocked: 8420.15, paidOut: 26800.00 },
]

export const integratedPipelineSeed: FlowPipelineStep[] = [
  { id: 'venda', title: '1. VENDA', subtitle: 'Ingressos faturados no e-commerce e PDV', amountCents: 128432000, count: 4820, status: 'completed' },
  { id: 'gateway', title: '2. GATEWAY', subtitle: 'Captura, antifraude e liquidação adquirente', amountCents: 128432000, count: 4820, status: 'completed' },
  { id: 'financeiro', title: '3. FINANCEIRO', subtitle: 'Saldo disponível, retenções e taxas', amountCents: 108614050, count: 4790, status: 'active' },
  { id: 'contabilidade', title: '4. CONTABILIDADE', subtitle: 'Partidas dobradas, DRE e lançamentos', amountCents: 108614050, count: 4790, status: 'synced' },
  { id: 'conciliacao', title: '5. CONCILIAÇÃO', subtitle: 'Batimento bancário e divergências', amountCents: 108614050, count: 4790, status: 'synced' },
  { id: 'repasse', title: '6. REPASSE', subtitle: 'Pagamentos PIX/TED liberados ao produtor', amountCents: 24896040, count: 8, status: 'active' },
]

export const receivablesSeed: ReceivableItem[] = [
  { id: 101, title: 'Venda Parcelada #DI-98240 (Parc. 1/6)', event: 'IRON MAIDEN — THE FUTURE PAST TOUR', client: 'Lucas Silveira', method: 'Crédito', saleDate: '28/08/2026', dueDate: '28/09/2026', installment: '1/6', grossValue: 208.33, gatewayFee: 14.16, netValue: 194.17, status: 'A Vencer' },
  { id: 102, title: 'Lote Corporativo 50 Ingressos #DI-98210', event: '4 AMIGOS 2026 — EDIÇÃO ESPECIAL', client: 'Tech Paraná Soluções', method: 'Boleto', saleDate: '27/08/2026', dueDate: '02/09/2026', installment: 'À Vista', grossValue: 8500.00, gatewayFee: 297.50, netValue: 8202.50, status: 'Processando' },
  { id: 103, title: 'Venda Parcelada #DI-98180 (Parc. 2/4)', event: 'SEM PARAR — EXPERIÊNCIA MÚSICA E NATUREZA', client: 'Mariana Rocha', method: 'Crédito', saleDate: '25/08/2026', dueDate: '25/09/2026', installment: '2/4', grossValue: 410.00, gatewayFee: 27.88, netValue: 382.12, status: 'A Vencer' },
  { id: 104, title: 'Venda Parcelada #DI-97990 (Parc. 3/10)', event: 'IRON MAIDEN — THE FUTURE PAST TOUR', client: 'Rodrigo Medeiros', method: 'Crédito', saleDate: '20/08/2026', dueDate: '20/09/2026', installment: '3/10', grossValue: 129.00, gatewayFee: 8.77, netValue: 120.23, status: 'A Vencer' },
  { id: 105, title: 'Liquidação Lote 2 Antecipada', event: '4 AMIGOS 2026 — EDIÇÃO ESPECIAL', client: 'Disk Produções', method: 'Crédito', saleDate: '15/08/2026', dueDate: '15/09/2026', installment: 'Lote Completo', grossValue: 45000.00, gatewayFee: 1575.00, netValue: 43425.00, status: 'Antecipado' },
  { id: 106, title: 'Venda PDV Cartão Débito D+1 #DI-98288', event: '29ª CONFERÊNCIA ESTADUAL ESPÍRITA', client: 'Bruno Freitas', method: 'Débito', saleDate: '28/08/2026', dueDate: '29/08/2026', installment: 'À Vista', grossValue: 680.00, gatewayFee: 13.60, netValue: 666.40, status: 'A Vencer' },
]

export const payablesSeed: PayableItem[] = [
  { id: 201, description: 'Repasse Programado Lote 2', vendor: 'Rua da Música Produções Ltda', category: 'Repasse Produtor', event: 'IRON MAIDEN — THE FUTURE PAST TOUR', dueDate: '30/08/2026', paymentMethod: 'PIX', amount: 42300.00, status: 'Agendado', documentNumber: 'REP-2026-IM02' },
  { id: 202, description: 'Tarifa Adquirente Cielo / Rede Mês 08', vendor: 'Adquirente Cielo S.A.', category: 'Gateway Adquirente', event: 'GLOBAL', dueDate: '05/09/2026', paymentMethod: 'Débito Automático', amount: 18450.30, status: 'Agendado', documentNumber: 'FAT-CIE-8891' },
  { id: 203, description: 'Servidores e Infraestrutura Cloud AWS', vendor: 'Amazon Web Services Brasil', category: 'Servidores & Infra', event: 'GLOBAL', dueDate: '10/09/2026', paymentMethod: 'Boleto', amount: 8920.00, status: 'Agendado', documentNumber: 'INV-AWS-2910' },
  { id: 204, description: 'Equipe de Portaria & Controle Facial', vendor: 'Staff Eventos Segurança e Acesso', category: 'Equipe & Portaria', event: 'SEM PARAR — EXPERIÊNCIA MÚSICA E NATUREZA', dueDate: '02/09/2026', paymentMethod: 'TED', amount: 7200.00, status: 'Pendente', documentNumber: 'NF-STF-1092' },
  { id: 205, description: 'Direitos Autorais ECAD Lote 1', vendor: 'ECAD - Escritório Central de Arrecadação', category: 'Direitos Autorais', event: 'IRON MAIDEN — THE FUTURE PAST TOUR', dueDate: '15/09/2026', paymentMethod: 'Boleto', amount: 21670.00, status: 'Agendado', documentNumber: 'BOL-ECAD-8941' },
]

