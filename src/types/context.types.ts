// ==============================================================================
// FASE 28.15.8.1 — TIPOS OFICIAIS DO CONTEXTO GLOBAL PRODUTOR × EVENTO
// ==============================================================================

export type SafeSaffScope = 'PRODUCER' | 'EVENT'

export interface ProducerEvent {
  id: string | number
  name?: string
  title?: string
  code?: string
  venue?: string
  city?: string
  date?: string
  endDate?: string
  status?: 'ACTIVE' | 'UPCOMING' | 'FINISHED' | 'ativo' | 'inativo' | 'rascunho' | 'encerrado'
  producerId?: number
  cover?: string
  total?: string
  sales?: number
  available?: number
  courtesy?: number
}

export interface SafeSaffContextValue {
  producerId: number | string | null
  producerName: string | null
  scope: SafeSaffScope
  eventId: number | string | null
  eventName: string | null
  selectedEvent: ProducerEvent | null
  events: ProducerEvent[]
  isLoadingEvents: boolean
  selectEvent: (event: ProducerEvent | null) => void
  selectAllEvents: () => void
  changeEvent: (eventId: string | number) => void
  setProducer: (producerId: number | null, name?: string) => void
}
