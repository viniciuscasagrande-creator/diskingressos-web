// ==============================================================================
// FASE 28.15.8.1.1 — SAFESAFF CONTEXT
// Provedor único de contexto global: Produtor × Evento
// ==============================================================================

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { SafeSaffScope, ProducerEvent, SafeSaffContextValue } from '../types/context.types'
import { AppContext } from './app-context'
import { EventsService } from '../services/events.service'

const STORAGE_KEY = 'safesaff:selected-context'

export const SafeSaffContext = createContext<SafeSaffContextValue | undefined>(undefined)

export function SafeSaffProvider({
  children,
  producerId: propProducerId,
  initialEvents = []
}: {
  children: React.ReactNode
  producerId?: number | string | null
  initialEvents?: ProducerEvent[]
}) {
  const [producerId, setProducerIdState] = useState<number | string | null>(() => {
    return propProducerId ?? AppContext.getState().producerId
  })
  const [producerName, setProducerName] = useState<string | null>(() => AppContext.getState().producerName)
  const [events, setEvents] = useState<ProducerEvent[]>(initialEvents)
  const [eventId, setEventId] = useState<number | string | null>(() => AppContext.getState().eventId)
  const [eventName, setEventName] = useState<string | null>(() => AppContext.getState().eventName)
  const [selectedEvent, setSelectedEvent] = useState<ProducerEvent | null>(null)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)

  const scope: SafeSaffScope = eventId !== null ? 'EVENT' : 'PRODUCER'

  // Atualiza producerId quando prop mudar
  useEffect(() => {
    if (propProducerId !== undefined) {
      setProducerIdState(propProducerId)
    }
  }, [propProducerId])

  // Sincroniza com AppContext
  useEffect(() => {
    const unsub = AppContext.subscribe((state) => {
      setProducerIdState(state.producerId)
      setProducerName(state.producerName)
      setEventId(state.eventId)
      setEventName(state.eventName)
    })
    return unsub
  }, [])

  // Carrega eventos do produtor ativo
  useEffect(() => {
    let active = true
    async function loadEvents() {
      if (!producerId) {
        setEvents([])
        return
      }
      setIsLoadingEvents(true)
      try {
        const list = await EventsService.getProducerEvents(producerId)
        if (active) {
          setEvents(list)
        }
      } catch (err) {
        console.error('[SafeSaffContext] Erro ao carregar eventos:', err)
      } finally {
        if (active) setIsLoadingEvents(false)
      }
    }
    loadEvents()
    return () => {
      active = false
    }
  }, [producerId])

  // Restaura contexto persistido no localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed.producerId && String(parsed.producerId) === String(producerId) && parsed.eventId) {
        setEventId(parsed.eventId)
        setEventName(parsed.eventName ?? null)
        AppContext.setEvent(Number(parsed.eventId), parsed.eventName, Number(parsed.producerId))
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [producerId])

  // Mantém selectedEvent sincronizado com events e eventId
  useEffect(() => {
    if (!eventId) {
      setSelectedEvent(null)
      return
    }
    const match = events.find((ev) => String(ev.id) === String(eventId) || (ev.code && ev.code === String(eventId)))
    if (match) {
      setSelectedEvent(match)
      if (!eventName) setEventName(match.name || match.title || null)
    }
  }, [eventId, events, eventName])

  // Seleciona um evento específico (Escopo EVENT)
  const selectEvent = useCallback(
    (event: ProducerEvent | null) => {
      if (!event) {
        selectAllEvents()
        return
      }
      const rawId = event.id
      const label = event.name || event.title || (event.code ? `Evento #${event.code}` : `Evento #${event.id}`)

      setEventId(rawId)
      setEventName(label)
      setSelectedEvent(event)

      AppContext.selectEvent({
        id: Number(rawId),
        code: event.code,
        title: label,
        producerId: event.producerId || (typeof producerId === 'number' ? producerId : undefined)
      })

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            producerId,
            eventId: rawId,
            eventName: label
          })
        )
      }
    },
    [producerId]
  )

  // Seleciona todos os eventos (Escopo PRODUCER)
  const selectAllEvents = useCallback(() => {
    setEventId(null)
    setEventName(null)
    setSelectedEvent(null)

    AppContext.selectAllEvents()

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          producerId,
          eventId: null,
          eventName: null
        })
      )
    }
  }, [producerId])

  // Altera o evento ativo pelo ID
  const changeEvent = useCallback(
    (id: string | number) => {
      if (!id || id === 'all') {
        selectAllEvents()
        return
      }
      const found = events.find((ev) => String(ev.id) === String(id) || (ev.code && ev.code === String(id)))
      if (found) {
        selectEvent(found)
      } else {
        selectEvent({
          id,
          name: `Evento #${id}`,
          title: `Evento #${id}`
        })
      }
    },
    [events, selectEvent, selectAllEvents]
  )

  // Altera a produtora ativa
  const setProducer = useCallback(
    (pId: number | null, name?: string) => {
      setProducerIdState(pId)
      setProducerName(name || null)
      AppContext.setProducer(pId, name)
    },
    []
  )

  const value: SafeSaffContextValue = useMemo(
    () => ({
      producerId,
      producerName,
      scope,
      eventId,
      eventName,
      selectedEvent,
      events,
      isLoadingEvents,
      selectEvent,
      selectAllEvents,
      changeEvent,
      setProducer
    }),
    [
      producerId,
      producerName,
      scope,
      eventId,
      eventName,
      selectedEvent,
      events,
      isLoadingEvents,
      selectEvent,
      selectAllEvents,
      changeEvent,
      setProducer
    ]
  )

  return <SafeSaffContext.Provider value={value}>{children}</SafeSaffContext.Provider>
}
