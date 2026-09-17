// ==============================================================================
// COMMERCE CORE SERVICE — PEDIDOS & INGRESSOS OMNICHANNEL (SEM DADOS FICTÍCIOS)
// Conexão com a API do Core para gestão de pedidos e integridade
// ==============================================================================

import type {
  OrderRecord,
  CommerceKpiSummary
} from '../types/commerce-orders.types'
import { getAuthHeader } from './api'

export const commerceCoreService = {
  /**
   * Resumo de KPIs operacionais de vendas do Commerce Core
   */
  async getSummary(): Promise<CommerceKpiSummary> {
    try {
      const res = await fetch('/api/v1/commerce/summary', {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      })
      if (res.ok) {
        return await res.json()
      }
    } catch (e) {
      console.warn('[commerceCoreService] Erro ao consultar summary do Commerce Core:', e)
    }

    return {
      ordersPerMinute: 0,
      paymentsPerMinute: 0,
      todayRevenueBrl: 0,
      activeHoldsCount: 0,
      ticketsIssuedToday: 0,
      approvalRatePercentage: 0,
      channelShare: {
        sitePercentage: 0,
        boxOfficePercentage: 0,
        posPercentage: 0,
        partnersPercentage: 0
      },
      integrityAlerts: {
        inconsistentOrders: 0,
        paymentsWithoutTickets: 0,
        ticketsWithoutLedger: 0,
        stuckExpiredHolds: 0
      }
    }
  },

  /**
   * Consulta pedidos omnichannel com filtros combinados
   */
  async getOrders(filters?: { channel?: string; status?: string; query?: string }): Promise<OrderRecord[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.channel && filters.channel !== 'TODOS') params.append('channel', filters.channel)
      if (filters?.status && filters.status !== 'TODOS') params.append('status', filters.status)
      if (filters?.query) params.append('query', filters.query)

      const res = await fetch(`/api/v1/commerce/orders?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      })
      if (res.ok) {
        return await res.json()
      }
    } catch (e) {
      console.warn('[commerceCoreService] Erro ao consultar orders do Commerce Core:', e)
    }

    return []
  },

  /**
   * Obtém o Dossiê do pedido
   */
  async getOrderById(orderId: string): Promise<OrderRecord | null> {
    try {
      const res = await fetch(`/api/v1/commerce/orders/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      })
      if (res.ok) {
        return await res.json()
      }
    } catch (e) {
      console.warn('[commerceCoreService] Erro ao consultar pedido por id:', e)
    }

    return null
  },

  /**
   * Reemite um ingresso com rotação segura de credencial QR
   */
  async reissueTicket(ticketId: string): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`/api/v1/commerce/tickets/${ticketId}/reissue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      })
      if (res.ok) {
        const data = await res.json()
        return { ok: true, message: data.message }
      }
    } catch (e) {
      console.warn('[commerceCoreService] Erro ao reemitir ingresso:', e)
    }

    return {
      ok: false,
      message: 'Não foi possível reemitir o ingresso no momento.'
    }
  },

  /**
   * Força a reconciliação do pedido
   */
  async reconcileOrder(orderId: string): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`/api/v1/commerce/orders/${orderId}/reconcile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      })
      if (res.ok) {
        const data = await res.json()
        return { ok: true, message: data.message }
      }
    } catch (e) {
      console.warn('[commerceCoreService] Erro ao reconciliar pedido:', e)
    }

    return {
      ok: false,
      message: 'Não foi possível reconciliar o pedido no momento.'
    }
  }
}
