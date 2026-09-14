/**
 * Fase 28.14.4 — Logger Estruturado e Seguro do Worker de Tracking
 * Registra telemetria e auditoria de execução sem expor credenciais ou PII.
 */

import { sanitizeErrorMessage } from './trackingErrorClassifier.js'

export interface StructuredTrackingLog {
  timestamp: string
  dispatchId?: number
  provider: string
  eventId?: number | null
  integrationId: number
  attempt: number
  status: string
  durationMs?: number
  errorCode?: string | null
  responseCode?: number | null
  message?: string
}

export const trackingWorkerLogger = {
  info(event: string, data: Partial<StructuredTrackingLog>): void {
    const entry = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      event,
      ...data,
      message: data.message ? sanitizeErrorMessage(data.message) : undefined
    }
    console.log(`[tracking-worker:INFO] ${JSON.stringify(entry)}`)
  },

  warn(event: string, data: Partial<StructuredTrackingLog>): void {
    const entry = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      event,
      ...data,
      message: data.message ? sanitizeErrorMessage(data.message) : undefined
    }
    console.warn(`[tracking-worker:WARN] ${JSON.stringify(entry)}`)
  },

  error(event: string, data: Partial<StructuredTrackingLog>): void {
    const entry = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      event,
      ...data,
      message: data.message ? sanitizeErrorMessage(data.message) : undefined
    }
    console.error(`[tracking-worker:ERROR] ${JSON.stringify(entry)}`)
  }
}
