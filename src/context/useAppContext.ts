// ==============================================================================
// FASE 28.15.6 — USEAPPCONTEXT HOOK
// Hook React para escutar alterações de estado do AppContext de forma reativa
// ==============================================================================

import { useState, useEffect } from 'react'
import { AppContext, type AppContextState } from './app-context'

export function useAppContext(): AppContextState & {
  setProducer: (producerId: number | null, producerName?: string, producersList?: any[]) => boolean
  setEvent: (eventId: number | null, eventName?: string, eventProducerId?: number) => boolean
  clearEvent: () => void
  selectEvent: (event: { id: number; code?: string; title?: string; name?: string; producerId?: number } | null) => boolean
  selectAllEvents: () => void
  setScope: (scope: import('./app-context').SafeSaffScope) => void
  recordAudit: typeof AppContext.recordAudit
} {
  const [state, setState] = useState<AppContextState>(AppContext.getState())

  useEffect(() => {
    const unsubscribe = AppContext.subscribe((next) => {
      setState(next)
    })
    return () => {
      unsubscribe()
    }
  }, [])

  return {
    ...state,
    setProducer: (pId, pName, list) => AppContext.setProducer(pId, pName, list),
    setEvent: (eId, eName, pId) => AppContext.setEvent(eId, eName, pId),
    clearEvent: () => AppContext.clearEvent(),
    selectEvent: (ev) => AppContext.selectEvent(ev),
    selectAllEvents: () => AppContext.selectAllEvents(),
    setScope: (scope) => AppContext.setScope(scope),
    recordAudit: AppContext.recordAudit.bind(AppContext)
  }
}
