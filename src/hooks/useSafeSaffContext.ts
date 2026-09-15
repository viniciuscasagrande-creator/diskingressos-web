// ==============================================================================
// FASE 28.15.8.1.1 — HOOK USESAFESAFFCONTEXT
// Acesso seguro ao contexto unificado de Produtor × Evento
// ==============================================================================

import { useContext } from 'react'
import { SafeSaffContext } from '../context/SafeSaffContext'
import type { SafeSaffContextValue } from '../types/context.types'

export function useSafeSaffContext(): SafeSaffContextValue {
  const context = useContext(SafeSaffContext)
  if (!context) {
    throw new Error('useSafeSaffContext deve ser utilizado dentro de um SafeSaffProvider.')
  }
  return context
}
