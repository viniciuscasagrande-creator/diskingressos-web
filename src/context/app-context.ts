// ==============================================================================
// FASE 28.15.6 — APPCONTEXT
// Camada única de contexto seguro para Usuário, Perfil, Produtor e Evento
// ==============================================================================

import type { AppUser, Role, Producer } from '../auth/model'
import { isGlobalAdmin } from '../auth/model'

export type AuditActionType =
  | 'CONTEXT_PRODUCER_CHANGED'
  | 'CONTEXT_EVENT_CHANGED'
  | 'PERMISSION_DENIED'
  | 'CONTEXT_ACCESS_DENIED'

export interface AuditContextRecord {
  id: string
  timestamp: string
  userId: number | null
  userName: string
  role: Role | string | null
  producerId: number | null
  producerName: string | null
  eventId: number | null
  eventName: string | null
  route: string
  action: AuditActionType
  result: 'GRANTED' | 'DENIED' | 'CHANGED'
  details?: string
}

export interface AppContextState {
  user: AppUser | null
  role: Role | null
  producerId: number | null // null = todas as produtoras (somente Admin Master / Admin)
  producerName: string | null
  eventId: number | null
  eventName: string | null
}

export type AppContextListener = (state: AppContextState) => void

const STORAGE_KEY = 'safesaff_app_context_v28_15_6'
const AUDIT_STORAGE_KEY = 'safesaff_audit_context_logs_v28_15_6'

class AppContextManager {
  private state: AppContextState = {
    user: null,
    role: null,
    producerId: null,
    producerName: null,
    eventId: null,
    eventName: null
  }

  private listeners = new Set<AppContextListener>()
  private auditLogs: AuditContextRecord[] = []

  constructor() {
    this.restoreAuditLogs()
  }

  public getState(): AppContextState {
    return { ...this.state }
  }

  public subscribe(listener: AppContextListener): () => void {
    this.listeners.add(listener)
    listener(this.getState())
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    const currentState = this.getState()
    this.listeners.forEach((fn) => {
      try {
        fn(currentState)
      } catch (e) {
        console.error('[AppContext] Erro ao notificar listener:', e)
      }
    })
  }

  private persist() {
    if (typeof window === 'undefined') return
    try {
      const payload = {
        producerId: this.state.producerId,
        producerName: this.state.producerName,
        eventId: this.state.eventId,
        eventName: this.state.eventName
      }
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (e) {
      console.warn('[AppContext] Falha ao persistir em sessionStorage:', e)
    }
  }

  private restoreAuditLogs() {
    if (typeof window === 'undefined') return
    try {
      const raw = window.sessionStorage.getItem(AUDIT_STORAGE_KEY)
      if (raw) {
        this.auditLogs = JSON.parse(raw)
      }
    } catch {
      this.auditLogs = []
    }
  }

  public getAuditLogs(): AuditContextRecord[] {
    return [...this.auditLogs]
  }

  public recordAudit(
    action: AuditActionType,
    result: 'GRANTED' | 'DENIED' | 'CHANGED',
    details?: string,
    overrideRoute?: string
  ): AuditContextRecord {
    const currentRoute =
      overrideRoute ||
      (typeof window !== 'undefined' ? window.location.pathname + window.location.hash : '')

    const record: AuditContextRecord = {
      id: `CTX-AUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      userId: this.state.user?.id || null,
      userName: this.state.user?.name || 'Anônimo',
      role: this.state.role,
      producerId: this.state.producerId,
      producerName: this.state.producerName,
      eventId: this.state.eventId,
      eventName: this.state.eventName,
      route: currentRoute,
      action,
      result,
      details
    }

    this.auditLogs.unshift(record)
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop()
    }

    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.auditLogs.slice(0, 100)))
      } catch {
        // storage overflow fallback
      }
    }

    return record
  }

  /**
   * Define o usuário autenticado e revalida contexto de produtor e evento.
   */
  public setUser(user: AppUser | null, allProducers?: Producer[]) {
    const prevUser = this.state.user
    this.state.user = user
    this.state.role = user ? user.role : null

    if (!user) {
      this.state.producerId = null
      this.state.producerName = null
      this.state.eventId = null
      this.state.eventName = null
      this.persist()
      this.notify()
      return
    }

    const isAdmin = isGlobalAdmin(user)

    // Se é produtor regular, ele DEVE estar rigidamente restrito à sua própria produtora
    if (!isAdmin) {
      this.state.producerId = user.producerId || 1
      const prod = allProducers?.find((p) => p.id === this.state.producerId)
      this.state.producerName = prod?.name || `Produtora #${this.state.producerId}`

      // Se havia um evento no sessionStorage, só mantém se for do mesmo produtor
      if (typeof window !== 'undefined') {
        try {
          const raw = window.sessionStorage.getItem(STORAGE_KEY)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed.producerId === this.state.producerId && parsed.eventId) {
              this.state.eventId = parsed.eventId
              this.state.eventName = parsed.eventName || null
            } else {
              this.state.eventId = null
              this.state.eventName = null
            }
          }
        } catch {
          this.state.eventId = null
          this.state.eventName = null
        }
      }
    } else {
      // Para Admin Master, tentar restaurar seleção válida do sessionStorage (ou manter null = 'Todas as produtoras')
      let restoredProducerId: number | null = null
      let restoredProducerName: string | null = null
      let restoredEventId: number | null = null
      let restoredEventName: string | null = null

      if (typeof window !== 'undefined') {
        try {
          const raw = window.sessionStorage.getItem(STORAGE_KEY)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed.producerId) {
              restoredProducerId = Number(parsed.producerId)
              restoredProducerName = parsed.producerName || null
              restoredEventId = parsed.eventId ? Number(parsed.eventId) : null
              restoredEventName = parsed.eventName || null
            }
          }
        } catch {}
      }

      this.state.producerId = restoredProducerId
      this.state.producerName = restoredProducerName
      this.state.eventId = restoredEventId
      this.state.eventName = restoredEventName
    }

    this.persist()
    this.notify()
  }

  /**
   * Altera a produtora ativa.
   * REGRA CRÍTICA: Ao trocar de produtora, limpa obrigatoriamente o evento atual!
   */
  public setProducer(producerId: number | null, producerName?: string, producersList?: Producer[]): boolean {
    const user = this.state.user
    if (!user) return false

    const isAdmin = isGlobalAdmin(user)

    // Tentativa de invasão / troca não autorizada
    if (!isAdmin && producerId !== user.producerId) {
      this.recordAudit(
        'CONTEXT_ACCESS_DENIED',
        'DENIED',
        `Tentativa não autorizada de trocar para produtora #${producerId}`
      )
      console.warn(`[AppContext] Bloqueio IDOR: usuário #${user.id} tentou acessar produtora #${producerId}`)
      return false
    }

    const resolvedName =
      producerName ||
      producersList?.find((p) => p.id === producerId)?.name ||
      (producerId ? `Produtora #${producerId}` : 'Visão Global (Todas)')

    const changed = this.state.producerId !== producerId

    this.state.producerId = producerId
    this.state.producerName = producerId ? resolvedName : null

    // REGRA SUPREMA: Ao trocar de produtor, limpa obrigatoriamente o evento atual
    if (changed) {
      this.state.eventId = null
      this.state.eventName = null

      this.recordAudit(
        'CONTEXT_PRODUCER_CHANGED',
        'CHANGED',
        `Produtora alterada para ${this.state.producerName || 'Todas as Produtoras'} (evento resetado)`
      )
    }

    this.persist()
    this.notify()
    return true
  }

  /**
   * Altera o evento ativo dentro da produtora autorizada.
   */
  public setEvent(
    eventId: number | null,
    eventName?: string,
    eventProducerId?: number
  ): boolean {
    const user = this.state.user
    if (!user) return false

    // Se o evento especifica uma produtora diferente da produtora ativa
    if (eventProducerId && this.state.producerId && eventProducerId !== this.state.producerId) {
      this.recordAudit(
        'CONTEXT_ACCESS_DENIED',
        'DENIED',
        `Tentativa de selecionar evento #${eventId} pertencente à produtora #${eventProducerId} enquanto no contexto da produtora #${this.state.producerId}`
      )
      return false
    }

    // Se usuário regular tentar carregar evento de outro produtor
    if (!isGlobalAdmin(user) && eventProducerId && eventProducerId !== user.producerId) {
      this.recordAudit(
        'CONTEXT_ACCESS_DENIED',
        'DENIED',
        `Usuário regular tentou selecionar evento #${eventId} de outra produtora #${eventProducerId}`
      )
      return false
    }

    this.state.eventId = eventId
    this.state.eventName = eventName || (eventId ? `Evento #${eventId}` : null)

    this.recordAudit(
      'CONTEXT_EVENT_CHANGED',
      'CHANGED',
      `Evento ativo alterado para ${this.state.eventName || 'Nenhum'}`
    )

    this.persist()
    this.notify()
    return true
  }

  /**
   * Limpa o evento ativo.
   */
  public clearEvent(): void {
    if (this.state.eventId === null) return
    this.state.eventId = null
    this.state.eventName = null
    this.recordAudit('CONTEXT_EVENT_CHANGED', 'CHANGED', 'Evento ativo limpo manualmente')
    this.persist()
    this.notify()
  }
}

export const AppContext = new AppContextManager()
if (typeof window !== 'undefined') {
  ;(window as any).AppContext = AppContext
}
