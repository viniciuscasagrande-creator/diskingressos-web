// ==============================================================================
// FASE 28.15.8.1 — EVENTS SERVICE
// Carregamento contextualizado de eventos por produtor
// ==============================================================================

import type { ProducerEvent } from '../types/context.types'
import { events as seedEvents } from '../data/events'

export const EventsService = {
  /**
   * Obtém lista de eventos do produtor autenticado
   */
  async getProducerEvents(producerId: number | string | null): Promise<ProducerEvent[]> {
    if (!producerId) return []

    try {
      const res = await fetch(`/api/producers/${producerId}/events`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.events)) {
          return data.events.map((ev: any) => ({
            id: ev.id,
            name: ev.title || ev.name,
            title: ev.title || ev.name,
            code: ev.code || String(ev.id),
            venue: ev.venue,
            city: ev.city,
            date: ev.date,
            status: ev.status || 'ativo',
            producerId: ev.producerId,
            cover: ev.cover
          }))
        }
      }
    } catch (e) {
      console.warn('[EventsService] Fallback na rota /api/producers/:id/events:', e)
    }

    try {
      const res = await fetch(`/api/events?producerId=${producerId}`)
      if (res.ok) {
        const list = await res.json()
        if (Array.isArray(list)) {
          return list.map((ev: any) => ({
            id: ev.id,
            name: ev.title || ev.name,
            title: ev.title || ev.name,
            code: ev.code || String(ev.id),
            venue: ev.venue,
            city: ev.city,
            date: ev.date,
            status: ev.status || 'ativo',
            producerId: ev.producerId,
            cover: ev.cover
          }))
        }
      }
    } catch {}

    // Fallback para seedEvents em memória
    return seedEvents
      .filter((e) => e.producerId === Number(producerId))
      .map((ev) => ({
        id: ev.id,
        name: ev.title,
        title: ev.title,
        code: ev.code,
        venue: ev.venue,
        city: ev.city,
        date: ev.date,
        status: ev.status,
        producerId: ev.producerId,
        cover: ev.cover
      }))
  }
}
