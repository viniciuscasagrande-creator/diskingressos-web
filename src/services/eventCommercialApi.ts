import { getEventCommercialDashboard } from './api'
import type { CommercialDashboardResponse } from '../types/event-commercial'

export interface CommercialDashboardParams {
  period?: 'today' | '7d' | '30d' | 'all'
  paymentMethod?: string
}

/**
 * Serviço de API Comercial do Evento - Fase 26.17.7.1
 * Endpoint oficial: GET /api/events/:eventId/commercial-dashboard
 */
export async function getCommercialDashboard(
  eventId: number | string,
  params?: CommercialDashboardParams
): Promise<CommercialDashboardResponse> {
  return getEventCommercialDashboard(Number(eventId), params)
}

export * from '../types/event-commercial'
