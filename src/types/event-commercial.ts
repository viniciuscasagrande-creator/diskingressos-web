export interface CommercialKpiSummary {
  grossRevenueCents: number
  grossRevenueFormatted: string
  revenueVariationPercent: number
  ticketsSold: number
  ticketsSoldVariationPercent: number
  availableTickets: number
  availableVariationPercent: number
  courtesyTickets: number
  courtesyVariationPercent: number
  occupancyPercent: number
  occupancyVariationPercent: number
  totalCapacity: number
}

export interface SalesEvolutionPoint {
  date: string
  formattedDate: string
  revenueCents: number
  ticketsCount: number
}

export interface SalesVelocityStats {
  averageTicketCents: number
  averageTicketVariationPercent: number
  breakEvenCents: number
  salesTargetCents: number
  projectedFinalCents: number
  projectedVariationPercent: number
  realizedHistory: { date: string; formattedDate: string; amountCents: number }[]
  projectedHistory: { date: string; formattedDate: string; amountCents: number }[]
}

export interface PaymentMethodItem {
  id: string
  name: string
  count: number
  amountCents: number
  percentage: number
  color: string
}

export interface TicketTypePerformanceItem {
  id: number | string
  name: string
  sector: string
  soldCount: number
  capacity: number
  revenueCents: number
  percentage: number
}

export interface OccupancyBreakdown {
  sold: number
  available: number
  courtesy: number
  blocked: number
  totalCapacity: number
  occupancyPercent: number
}

export interface RecentTransactionItem {
  id: number | string
  orderCode: string
  buyerName: string
  dateFormatted: string
  timeFormatted: string
  paymentMethod: string
  amountCents: number
  status: string
}

export interface WeekdayDistributionItem {
  weekdayIndex: number
  weekdayShort: string
  weekdayName: string
  count: number
  amountCents: number
}

export interface CommercialDashboardResponse {
  release: string
  event: {
    id: number
    code: string
    title: string
    venue: string
    city: string
    date: string
    status: string
    producerId: number
    producerName?: string
  }
  summary: CommercialKpiSummary
  salesEvolution: {
    period: string
    points: SalesEvolutionPoint[]
  }
  salesVelocity: SalesVelocityStats
  paymentMethods: PaymentMethodItem[]
  ticketTypes: TicketTypePerformanceItem[]
  occupancy: OccupancyBreakdown
  recentTransactions: RecentTransactionItem[]
  weekdayDistribution: WeekdayDistributionItem[]
  updatedAtFormatted: string
}
