export type SystemTier = 'standard' | 'advanced' | 'expert'

export type FinancialTransaction = {
  id: number
  date: string
  event: string
  description: string
  type: 'Venda' | 'Repasse' | 'Taxa' | 'Estorno' | 'Antecipação'
  method: 'Pix' | 'Crédito' | 'Débito' | 'Boleto' | 'Transferência'
  status: 'Pago' | 'Pendente' | 'Processando' | 'Estornado'
  value: number
  orderCode?: string
  customer?: string
}

export type Payout = {
  id: number
  event: string
  requestedAt: string
  scheduledFor: string
  gross: number
  fees: number
  net: number
  bankAccount?: string
  status: 'Disponível' | 'Agendado' | 'Processando' | 'Pago' | 'Em Análise'
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

export const bankAccountsSeed: BankAccount[] = [
  { id: 1, bankName: 'Banco Itaú S.A.', bankCode: '341', accountType: 'Corrente', agency: '0432', accountNumber: '29814-5', pixKey: '44.821.902/0001-38', pixType: 'CNPJ', holderName: 'Disk Produções e Eventos Ltda', holderDocument: '44.821.902/0001-38', isPrimary: true, status: 'Verificada' },
  { id: 2, bankName: 'Banco Bradesco S.A.', bankCode: '237', accountType: 'Corrente', agency: '1892', accountNumber: '55421-0', pixKey: 'financeiro@diskingressos.com.br', pixType: 'E-mail', holderName: 'Disk Produções e Eventos Ltda', holderDocument: '44.821.902/0001-38', isPrimary: false, status: 'Verificada' },
  { id: 3, bankName: 'Nu Pagamentos (Nubank)', bankCode: '260', accountType: 'Pagamento', agency: '0001', accountNumber: '849102-1', pixKey: '+5541998811223', pixType: 'Telefone', holderName: 'Vinicius Casagrande Produtora', holderDocument: '18.942.112/0001-09', isPrimary: false, status: 'Verificada' },
  { id: 4, bankName: 'Banco do Brasil S.A.', bankCode: '001', accountType: 'Corrente', agency: '3201', accountNumber: '12490-8', pixKey: 'd7a8e2b1-56c4-4a21-998f-124b890a21cf', pixType: 'Aleatória', holderName: 'Curitiba Shows e Eventos S.A.', holderDocument: '29.381.042/0001-55', isPrimary: false, status: 'Verificada' },
]

export const transactions: FinancialTransaction[] = [
  { id: 1, date: '28/08/2026 09:32', event: '4 AMIGOS 2026', description: 'Pedido #DI-98231', type: 'Venda', method: 'Pix', status: 'Pago', value: 420, orderCode: 'PED-4AM-98231', customer: 'Lucas Silveira' },
  { id: 2, date: '28/08/2026 09:15', event: 'SEM PARAR — MÚSICA E NATUREZA', description: 'Pedido #DI-98212', type: 'Venda', method: 'Crédito', status: 'Pago', value: 780, orderCode: 'PED-SP-98212', customer: 'Mariana Rocha' },
  { id: 3, date: '28/08/2026 08:41', event: 'IRON MAIDEN — THE FUTURE PAST', description: 'Pedido #DI-98197', type: 'Venda', method: 'Pix', status: 'Pago', value: 1290, orderCode: 'PED-IM-98197', customer: 'Rodrigo Medeiros' },
  { id: 4, date: '27/08/2026 18:14', event: '4 AMIGOS 2026', description: 'Taxa operacional de conveniência', type: 'Taxa', method: 'Transferência', status: 'Pago', value: -42.0, orderCode: 'TAX-4AM-1814' },
  { id: 5, date: '27/08/2026 16:26', event: 'CONFERÊNCIA FUTURO DIGITAL', description: 'Pedido #DI-98144', type: 'Venda', method: 'Crédito', status: 'Processando', value: 560, orderCode: 'PED-CF-98144', customer: 'Aline Pires' },
  { id: 6, date: '27/08/2026 14:03', event: 'CONFERÊNCIA FUTURO DIGITAL', description: 'Estorno #DI-98081 (Arrependimento 7d)', type: 'Estorno', method: 'Crédito', status: 'Estornado', value: -190, orderCode: 'EST-CF-98081', customer: 'Bruno Freitas' },
  { id: 7, date: '26/08/2026 15:20', event: 'SEM PARAR — MÚSICA E NATUREZA', description: 'Pedido #DI-98055', type: 'Venda', method: 'Débito', status: 'Pago', value: 350, orderCode: 'PED-SP-98055', customer: 'Carla Dias' },
  { id: 8, date: '26/08/2026 10:08', event: 'IRON MAIDEN — THE FUTURE PAST', description: 'Pedido #DI-97992', type: 'Venda', method: 'Pix', status: 'Pago', value: 920, orderCode: 'PED-IM-97992', customer: 'Diego Costa' },
  { id: 9, date: '25/08/2026 17:30', event: '4 AMIGOS 2026', description: 'Repasse PIX Lote 1 para Itaú', type: 'Repasse', method: 'Pix', status: 'Pago', value: -45000, orderCode: 'REP-PIX-4AM-01' },
]

export const payouts: Payout[] = [
  { id: 1, event: '4 AMIGOS 2026', requestedAt: '27/08/2026', scheduledFor: '29/08/2026', gross: 35000, fees: 0, net: 35000, bankAccount: 'Banco Itaú (341) Ag. 0432 C/C 29814-5', status: 'Em Análise', method: 'PIX' },
  { id: 2, event: 'SEM PARAR — MÚSICA E NATUREZA', requestedAt: '26/08/2026', scheduledFor: '28/08/2026', gross: 28500, fees: 0, net: 28500, bankAccount: 'Banco Bradesco (237) Ag. 1892 C/C 55421-0', status: 'Agendado', method: 'TED' },
  { id: 3, event: 'IRON MAIDEN — THE FUTURE PAST', requestedAt: '25/08/2026', scheduledFor: '27/08/2026', gross: 48320, fees: 0, net: 48320, bankAccount: 'Banco Itaú (341) Ag. 0432 C/C 29814-5', status: 'Processando', method: 'PIX' },
  { id: 4, event: 'CONFERÊNCIA FUTURO DIGITAL', requestedAt: '23/08/2026', scheduledFor: '25/08/2026', gross: 12900, fees: 0, net: 12900, bankAccount: 'Nu Pagamentos (260) Ag. 0001 C/P 849102-1', status: 'Pago', method: 'PIX', proofUrl: '#' },
  { id: 5, event: 'FESTIVAL GASTRONÔMICO CURITIBA', requestedAt: '20/08/2026', scheduledFor: '22/08/2026', gross: 64200, fees: 0, net: 64200, bankAccount: 'Banco do Brasil (001) Ag. 3201 C/C 12490-8', status: 'Pago', method: 'TED', proofUrl: '#' },
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

export const integratedPipelineSeed: FlowPipelineStep[] = [
  { id: 'venda', title: '1. VENDA', subtitle: 'Ingressos faturados no e-commerce e PDV', amountCents: 44334690, count: 1842, status: 'completed' },
  { id: 'gateway', title: '2. GATEWAY', subtitle: 'Captura, antifraude e liquidação adquirente', amountCents: 44334690, count: 1842, status: 'completed' },
  { id: 'financeiro', title: '3. FINANCEIRO', subtitle: 'Saldo disponível, retenções e taxas', amountCents: 38656221, count: 1836, status: 'active' },
  { id: 'contabilidade', title: '4. CONTABILIDADE', subtitle: 'Partidas dobradas, DRE e lançamentos', amountCents: 38656221, count: 1836, status: 'synced' },
  { id: 'conciliacao', title: '5. CONCILIAÇÃO', subtitle: 'Batimento bancário e divergências', amountCents: 38656221, count: 1836, status: 'synced' },
  { id: 'repasse', title: '6. REPASSE', subtitle: 'Pagamentos PIX/TED liberados ao produtor', amountCents: 24896000, count: 5, status: 'active' },
]
