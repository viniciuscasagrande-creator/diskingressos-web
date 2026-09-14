/**
 * Fase 28.14.4 — Classificador de Erros e Agendador de Backoff
 * Padroniza a inteligência de retry e garante que dados sensíveis nunca sejam gravados em logs ou erros.
 */

export type TrackingErrorCategory =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'PROVIDER_5XX'
  | 'PROVIDER_4XX'
  | 'AUTH'
  | 'PERMISSION'
  | 'CONFIGURATION'
  | 'INVALID_PAYLOAD'
  | 'CIRCUIT_OPEN'
  | 'UNKNOWN'

export interface ErrorClassification {
  category: TrackingErrorCategory
  isRetryable: boolean
  suggestedRetryAfterSeconds?: number
  sanitizedMessage: string
}

const BASE_RETRY_DELAY_SECONDS = [
  60,        // Tentativa 1: 1 minuto
  300,       // Tentativa 2: 5 minutos
  900,       // Tentativa 3: 15 minutos
  3600,      // Tentativa 4: 1 hora
  21600      // Tentativa 5: 6 horas
]

export function sanitizeErrorMessage(message: string): string {
  if (!message) return 'Erro desconhecido.'

  let clean = message

  // Remove JWTs
  clean = clean.replace(/eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, '[TOKEN_REMOVIDO]')

  // Remove Authorization headers e Bearer
  clean = clean.replace(/Bearer\s+[a-zA-Z0-9_.-]+/gi, 'Bearer [REMOVIDO]')

  // Remove parâmetros sensíveis em URLs ou queries
  clean = clean.replace(/access_token=[^&\s]+/gi, 'access_token=[REMOVIDO]')
  clean = clean.replace(/api_secret=[^&\s]+/gi, 'api_secret=[REMOVIDO]')
  clean = clean.replace(/token=[^&\s]+/gi, 'token=[REMOVIDO]')
  clean = clean.replace(/secret=[^&\s]+/gi, 'secret=[REMOVIDO]')

  // Remove possíveis dados pessoais acidentais (emails, CPFs, cartões)
  clean = clean.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_HASHED]')
  clean = clean.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[DOC_REMOVIDO]')
  clean = clean.replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, '[CARTAO_REMOVIDO]')

  return clean.slice(0, 500).trim()
}

export function classifyTrackingError(
  error: any,
  httpStatus?: number,
  responseHeaders?: Record<string, string>
): ErrorClassification {
  const rawMsg = error instanceof Error ? error.message : String(error || '')
  const sanitizedMessage = sanitizeErrorMessage(rawMsg)

  // 1. Timeout explícito
  if (rawMsg.includes('timeout') || rawMsg.includes('AbortError') || rawMsg.includes('TIMEDOUT')) {
    return {
      category: 'TIMEOUT',
      isRetryable: true,
      sanitizedMessage: 'Tempo limite de resposta excedido junto à plataforma de mídia (Timeout).'
    }
  }

  // 2. Erros de rede (DNS, socket reset, ECONNREFUSED)
  if (
    rawMsg.includes('fetch failed') ||
    rawMsg.includes('ECONNRESET') ||
    rawMsg.includes('ENOTFOUND') ||
    rawMsg.includes('ECONNREFUSED') ||
    rawMsg.includes('EAI_AGAIN')
  ) {
    return {
      category: 'NETWORK',
      isRetryable: true,
      sanitizedMessage: 'Falha de conectividade ou rede ao contatar a API da plataforma.'
    }
  }

  // 3. Status HTTP 429 — Rate Limit
  if (httpStatus === 429) {
    let retryAfterSec: number | undefined
    if (responseHeaders?.['retry-after']) {
      const parsed = parseInt(responseHeaders['retry-after'], 10)
      if (!isNaN(parsed) && parsed > 0) {
        retryAfterSec = Math.min(parsed, 3600) // Teto de 1 hora
      }
    }

    return {
      category: 'RATE_LIMIT',
      isRetryable: true,
      suggestedRetryAfterSeconds: retryAfterSec || 120,
      sanitizedMessage: `Limite de requisições excedido pela plataforma (HTTP 429).${retryAfterSec ? ` Aguardar ${retryAfterSec}s.` : ''}`
    }
  }

  // 4. Status HTTP 5xx — Falha no servidor do provedor
  if (httpStatus && httpStatus >= 500 && httpStatus <= 599) {
    return {
      category: 'PROVIDER_5XX',
      isRetryable: true,
      sanitizedMessage: `Instabilidade temporária na plataforma de mídia (HTTP ${httpStatus}).`
    }
  }

  // 5. Falha de autenticação (HTTP 401)
  if (httpStatus === 401 || rawMsg.includes('Invalid OAuth') || rawMsg.includes('Credencial não configurada')) {
    return {
      category: 'AUTH',
      isRetryable: false,
      sanitizedMessage: 'Credencial ou Token da API de Conversão inválido ou expirado.'
    }
  }

  // 6. Falha de permissão (HTTP 403)
  if (httpStatus === 403) {
    return {
      category: 'PERMISSION',
      isRetryable: false,
      sanitizedMessage: 'Permissão insuficiente na conta de anúncios ou Pixel da plataforma (HTTP 403).'
    }
  }

  // 7. Payload inválido (HTTP 400)
  if (httpStatus === 400) {
    return {
      category: 'INVALID_PAYLOAD',
      isRetryable: false,
      sanitizedMessage: `Parâmetros do evento rejeitados pela plataforma: ${sanitizedMessage.slice(0, 160)}`
    }
  }

  // 8. Circuit Breaker aberto
  if (rawMsg.includes('Circuit OPEN')) {
    return {
      category: 'CIRCUIT_OPEN',
      isRetryable: true,
      suggestedRetryAfterSeconds: 30,
      sanitizedMessage: 'Circuito de proteção temporário ativo para esta plataforma devido a instabilidades recentes.'
    }
  }

  // Padrão: considerar desconhecido
  return {
    category: 'UNKNOWN',
    isRetryable: httpStatus ? httpStatus >= 500 : true,
    sanitizedMessage: sanitizedMessage || 'Erro não categorizado no processamento do evento.'
  }
}

/**
 * Calcula a próxima data de tentativa com backoff exponencial e jitter (0-15s)
 * para evitar sobrecarga sincronizada de requisições (thundering herd).
 */
export function calculateNextRetryAt(
  attempt: number,
  retryAfterSeconds?: number,
  now: Date = new Date()
): Date {
  if (retryAfterSeconds && retryAfterSeconds > 0) {
    const jitterSec = Math.floor(Math.random() * 5)
    return new Date(now.getTime() + (retryAfterSeconds + jitterSec) * 1000)
  }

  const index = Math.min(attempt - 1, BASE_RETRY_DELAY_SECONDS.length - 1)
  const baseSec = BASE_RETRY_DELAY_SECONDS[Math.max(0, index)]
  const jitterSec = Math.floor(Math.random() * 15)

  return new Date(now.getTime() + (baseSec + jitterSec) * 1000)
}
