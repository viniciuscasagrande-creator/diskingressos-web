/**
 * Fase 28.14.4 — Circuit Breaker por Provedor de Tracking
 * Previne sobrecarga e tempestade de requisições (thundering herd) caso uma plataforma externa esteja fora do ar.
 * Isola provedores: falha no TikTok não afeta Meta, Google ou Spotify.
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export interface ProviderCircuitStatus {
  provider: string
  state: CircuitState
  consecutiveFailures: number
  lastFailureAt: string | null
  openUntil: string | null
  totalSuccesses: number
  totalFailures: number
}

const FAILURE_THRESHOLD = 5 // Falhas consecutivas antes de abrir o circuito
const COOLDOWN_MS = 30_000 // 30 segundos em OPEN antes de passar para HALF_OPEN

interface InternalCircuit {
  state: CircuitState
  failures: number
  lastFailureAt: number | null
  openUntil: number | null
  totalSuccesses: number
  totalFailures: number
}

const circuits = new Map<string, InternalCircuit>()

function getOrCreateCircuit(provider: string): InternalCircuit {
  const key = provider.toLowerCase()
  let c = circuits.get(key)
  if (!c) {
    c = {
      state: 'CLOSED',
      failures: 0,
      lastFailureAt: null,
      openUntil: null,
      totalSuccesses: 0,
      totalFailures: 0
    }
    circuits.set(key, c)
  }
  return c
}

export const trackingCircuitBreaker = {
  canAttempt(provider: string): boolean {
    const c = getOrCreateCircuit(provider)
    const now = Date.now()

    if (c.state === 'CLOSED') {
      return true
    }

    if (c.state === 'OPEN') {
      if (c.openUntil && now >= c.openUntil) {
        // Cooldown expirou: passar para HALF_OPEN para testar 1 requisição sonda
        c.state = 'HALF_OPEN'
        return true
      }
      return false
    }

    if (c.state === 'HALF_OPEN') {
      // Permite requisições de teste controladas
      return true
    }

    return true
  },

  recordSuccess(provider: string): void {
    const c = getOrCreateCircuit(provider)
    c.totalSuccesses++
    c.failures = 0
    c.openUntil = null
    c.state = 'CLOSED'
  },

  recordFailure(provider: string, isRetryable: boolean = true): void {
    const c = getOrCreateCircuit(provider)
    c.totalFailures++
    c.lastFailureAt = Date.now()

    // Erros não-retryáveis (ex.: credencial ou payload inválido) não contam para queda global do provedor
    if (!isRetryable) {
      return
    }

    c.failures++

    if (c.state === 'HALF_OPEN') {
      // Falhou na sonda: reabre imediatamente com novo cooldown
      c.state = 'OPEN'
      c.openUntil = Date.now() + COOLDOWN_MS
    } else if (c.failures >= FAILURE_THRESHOLD) {
      c.state = 'OPEN'
      c.openUntil = Date.now() + COOLDOWN_MS
      console.warn(`[tracking-circuit-breaker] Circuit OPEN for provider ${provider}. Cooldown until ${new Date(c.openUntil).toISOString()}`)
    }
  },

  getStatus(provider?: string): Record<string, ProviderCircuitStatus> {
    const result: Record<string, ProviderCircuitStatus> = {}
    const keys = provider ? [provider.toLowerCase()] : ['meta', 'google', 'tiktok', 'spotify']

    for (const key of keys) {
      const c = getOrCreateCircuit(key)
      const now = Date.now()
      let currentState = c.state
      if (c.state === 'OPEN' && c.openUntil && now >= c.openUntil) {
        currentState = 'HALF_OPEN'
      }

      result[key] = {
        provider: key,
        state: currentState,
        consecutiveFailures: c.failures,
        lastFailureAt: c.lastFailureAt ? new Date(c.lastFailureAt).toISOString() : null,
        openUntil: c.openUntil ? new Date(c.openUntil).toISOString() : null,
        totalSuccesses: c.totalSuccesses,
        totalFailures: c.totalFailures
      }
    }

    return result
  },

  reset(provider?: string): void {
    if (provider) {
      circuits.delete(provider.toLowerCase())
    } else {
      circuits.clear()
    }
  }
}
