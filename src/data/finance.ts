export type FinancialTransaction = {
  id: number
  date: string
  event: string
  description: string
  type: 'Venda' | 'Repasse' | 'Taxa' | 'Estorno'
  method: 'Pix' | 'Crédito' | 'Débito' | 'Boleto' | 'Transferência'
  status: 'Pago' | 'Pendente' | 'Processando' | 'Estornado'
  value: number
}

export type Payout = {
  id: number
  event: string
  requestedAt: string
  scheduledFor: string
  gross: number
  fees: number
  net: number
  status: 'Disponível' | 'Agendado' | 'Processando' | 'Pago'
}

export const transactions: FinancialTransaction[] = [
  { id: 1, date: '26/08/2026 14:32', event: 'SEM PARAR — EXPERIÊNCIA MÚSICA E NATUREZA', description: 'Pedido #DI-98231', type: 'Venda', method: 'Pix', status: 'Pago', value: 420 },
  { id: 2, date: '26/08/2026 13:58', event: 'IRON MAIDEN — THE FUTURE PAST', description: 'Pedido #DI-98212', type: 'Venda', method: 'Crédito', status: 'Pago', value: 780 },
  { id: 3, date: '26/08/2026 12:41', event: 'CONFERÊNCIA FUTURO DIGITAL', description: 'Pedido #DI-98197', type: 'Venda', method: 'Pix', status: 'Pago', value: 190 },
  { id: 4, date: '26/08/2026 11:14', event: 'SEM PARAR — EXPERIÊNCIA MÚSICA E NATUREZA', description: 'Taxa operacional', type: 'Taxa', method: 'Transferência', status: 'Pago', value: -31.5 },
  { id: 5, date: '25/08/2026 19:26', event: 'IRON MAIDEN — THE FUTURE PAST', description: 'Pedido #DI-98144', type: 'Venda', method: 'Crédito', status: 'Processando', value: 560 },
  { id: 6, date: '25/08/2026 17:03', event: 'CONFERÊNCIA FUTURO DIGITAL', description: 'Estorno #DI-98081', type: 'Estorno', method: 'Crédito', status: 'Estornado', value: -190 },
  { id: 7, date: '25/08/2026 15:20', event: 'SEM PARAR — EXPERIÊNCIA MÚSICA E NATUREZA', description: 'Pedido #DI-98055', type: 'Venda', method: 'Débito', status: 'Pago', value: 350 },
  { id: 8, date: '25/08/2026 10:08', event: 'IRON MAIDEN — THE FUTURE PAST', description: 'Pedido #DI-97992', type: 'Venda', method: 'Pix', status: 'Pago', value: 920 },
]

export const payouts: Payout[] = [
  { id: 1, event: 'SEM PARAR — EXPERIÊNCIA MÚSICA E NATUREZA', requestedAt: '26/08/2026', scheduledFor: '28/08/2026', gross: 28500, fees: 1710, net: 26790, status: 'Agendado' },
  { id: 2, event: 'IRON MAIDEN — THE FUTURE PAST', requestedAt: '25/08/2026', scheduledFor: '27/08/2026', gross: 48320, fees: 2899.2, net: 45420.8, status: 'Processando' },
  { id: 3, event: 'CONFERÊNCIA FUTURO DIGITAL', requestedAt: '23/08/2026', scheduledFor: '25/08/2026', gross: 12900, fees: 774, net: 12126, status: 'Pago' },
  { id: 4, event: 'SEM PARAR — EXPERIÊNCIA MÚSICA E NATUREZA', requestedAt: '—', scheduledFor: '—', gross: 16240, fees: 974.4, net: 15265.6, status: 'Disponível' },
]

export const cashFlow = [
  { day: '20/08', entry: 12400, exit: 4100 },
  { day: '21/08', entry: 16900, exit: 5200 },
  { day: '22/08', entry: 14800, exit: 3900 },
  { day: '23/08', entry: 21300, exit: 8500 },
  { day: '24/08', entry: 19750, exit: 6200 },
  { day: '25/08', entry: 26400, exit: 9200 },
  { day: '26/08', entry: 31100, exit: 7800 },
]
