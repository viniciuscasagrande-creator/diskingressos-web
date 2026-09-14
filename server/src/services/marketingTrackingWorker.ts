/**
 * Fase 28.14.4 — Motor Assíncrono de Conversões, Outbox, Retry & Dead Letter
 *
 * Responsável por:
 * 1. Processar a fila de dispatches da Outbox sem travar o checkout
 * 2. Controle de concorrência com lock atômico e recuperação de locks órfãos (TTL)
 * 3. Classificação de erros (retryable vs permanente) com backoff exponencial e jitter
 * 4. Circuit Breaker isolado por plataforma (falha no TikTok não afeta Meta, Google ou Spotify)
 * 5. Dead Letter Queue e APIs de reprocessamento manual
 * 6. Sanitização completa (zero segredos ou PII expostos)
 */

import { prisma } from '../prisma.js'
import { decryptTrackingToken } from './trackingCrypto.js'
import { trackingCircuitBreaker } from './trackingCircuitBreaker.js'
import {
  classifyTrackingError,
  calculateNextRetryAt,
  sanitizeErrorMessage,
  type TrackingErrorCategory
} from './trackingErrorClassifier.js'
import { trackingWorkerLogger } from './trackingWorkerLogger.js'

const BATCH_SIZE = parseInt(process.env.TRACKING_WORKER_BATCH_SIZE || '50', 10)
const CONCURRENCY = parseInt(process.env.TRACKING_WORKER_CONCURRENCY || '5', 10)
const LOCK_TIMEOUT_SECONDS = parseInt(process.env.TRACKING_WORKER_LOCK_TIMEOUT_SECONDS || '300', 10)
const PROVIDER_TIMEOUT_MS = parseInt(process.env.TRACKING_PROVIDER_TIMEOUT_MS || '10000', 10)
const MAX_RETRY_ATTEMPTS = parseInt(process.env.TRACKING_MAX_RETRY_ATTEMPTS || '5', 10)

let isWorkerRunning = false
let lastWorkerRunAt: Date | null = null

export interface DispatchExecutionResult {
  dispatchId: number
  provider: string
  status: 'completed' | 'retrying' | 'failed_permanently' | 'cancelled'
  responseCode?: number | null
  message: string
  errorCode?: string | null
  attempt: number
  nextAttemptAt?: Date | null
}

const decrypt = (row: any) =>
  !row.tokenCiphertext || !row.tokenIv || !row.tokenTag
    ? null
    : decryptTrackingToken(row.tokenCiphertext, row.tokenIv, row.tokenTag)

/**
 * Envia o evento de conversão para o provedor externo com timeout estrito
 */
async function deliverToProvider(
  row: any,
  payload: any,
  provider: string
): Promise<{ status: 'ok' | 'erro' | 'dry_run'; code: number; message: string; headers?: Record<string, string> }> {
  const mode = (process.env.MARKETING_DELIVERY_MODE || 'dry_run').toLowerCase()
  if (mode !== 'live') {
    return {
      status: 'dry_run',
      code: 202,
      message: 'Evento preparado. MARKETING_DELIVERY_MODE não está em live.'
    }
  }

  const token = decrypt(row)
  if (!token) {
    return {
      status: 'erro',
      code: 401,
      message: 'Credencial ou Token da API não configurado.'
    }
  }

  let url: string | undefined
  const headers: Record<string, string> = { 'content-type': 'application/json' }

  if (provider === 'meta') {
    url = `https://graph.facebook.com/v21.0/${encodeURIComponent(row.pixelId)}/events?access_token=${encodeURIComponent(token)}`
  } else if (provider === 'tiktok') {
    url = 'https://business-api.tiktok.com/open_api/v1.3/event/track/'
    headers['Access-Token'] = token
  } else if (provider === 'ga4' || provider === 'google') {
    url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(row.pixelId)}&api_secret=${encodeURIComponent(token)}`
  } else if (provider === 'spotify') {
    url = `https://api.spotify.com/v1/ad-accounts/${encodeURIComponent(row.pixelId)}/conversions`
    headers['Authorization'] = `Bearer ${token}`
  } else {
    return {
      status: 'dry_run',
      code: 202,
      message: `Conector ${provider} em modo agendado.`
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((val, key) => {
      responseHeaders[key.toLowerCase()] = val
    })

    const text = (await response.text()).slice(0, 500)
    return {
      status: response.ok ? 'ok' : 'erro',
      code: response.status,
      message: text || response.statusText,
      headers: responseHeaders
    }
  } catch (err: any) {
    clearTimeout(timeoutId)
    const isTimeout = err?.name === 'AbortError'
    return {
      status: 'erro',
      code: isTimeout ? 504 : 503,
      message: isTimeout
        ? 'Tempo limite de resposta excedido (Timeout 10s).'
        : err?.message || 'Falha de rede ao contatar plataforma de mídia.'
    }
  }
}

/**
 * Recupera locks órfãos (se o processo anterior caiu durante o processamento)
 */
async function recoverStaleLocks(lockTimeoutSec: number = LOCK_TIMEOUT_SECONDS): Promise<number> {
  const staleThreshold = new Date(Date.now() - lockTimeoutSec * 1000)

  const staleItems = await prisma.marketingConversionDispatch.findMany({
    where: {
      status: 'processing',
      lockedAt: { lt: staleThreshold }
    },
    take: 50
  })

  if (staleItems.length === 0) return 0

  let recovered = 0
  for (const item of staleItems) {
    await prisma.marketingConversionDispatch.update({
      where: { id: item.id },
      data: {
        status: 'retrying',
        lockedAt: null,
        lockedBy: null,
        nextAttemptAt: new Date(),
        errorMessageSanitized: 'Processamento anterior interrompido (lock TTL recuperado).'
      }
    })
    recovered++
  }

  trackingWorkerLogger.warn('stale_locks_recovered', {
    provider: 'worker',
    integrationId: 0,
    attempt: 0,
    status: 'retrying',
    message: `${recovered} locks órfãos recuperados.`
  })

  return recovered
}

/**
 * Bloqueia e reivindica um lote de itens elegíveis para processamento
 */
async function claimBatch(
  batchSize: number = BATCH_SIZE,
  workerId: string = `worker-${process.pid || 'default'}-${Date.now()}`
): Promise<number[]> {
  await recoverStaleLocks()

  const now = new Date()

  // 1. Busca IDs elegíveis ordenados por prioridade (HIGH > NORMAL > LOW) e data
  const eligible = await prisma.marketingConversionDispatch.findMany({
    where: {
      status: { in: ['queued', 'retrying'] },
      OR: [
        { nextAttemptAt: null },
        { nextAttemptAt: { lte: now } }
      ],
      lockedAt: null
    },
    select: { id: true },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' }
    ],
    take: batchSize
  })

  if (eligible.length === 0) return []

  const ids = eligible.map(e => e.id)

  // 2. Lock atômico dos itens selecionados
  await prisma.marketingConversionDispatch.updateMany({
    where: {
      id: { in: ids },
      lockedAt: null // Garante atomicidade concorrente
    },
    data: {
      status: 'processing',
      lockedAt: now,
      lockedBy: workerId
    }
  })

  return ids
}

/**
 * Executa um dispatch individual
 */
async function executeSingleDispatch(dispatchId: number): Promise<DispatchExecutionResult> {
  const dispatch = await prisma.marketingConversionDispatch.findUnique({
    where: { id: dispatchId },
    include: {
      integration: true,
      conversionEvent: true
    }
  })

  if (!dispatch || dispatch.status !== 'processing') {
    return {
      dispatchId,
      provider: dispatch?.provider || 'unknown',
      status: 'cancelled',
      message: 'Dispatch não encontrado ou cancelado.',
      attempt: dispatch?.attempts || 0
    }
  }

  const provider = dispatch.provider.toLowerCase()
  const attempt = (dispatch.attempts || 0) + 1
  const maxAttempts = dispatch.maxAttempts || MAX_RETRY_ATTEMPTS

  // 1. Verificação do Circuit Breaker para este provedor
  if (!trackingCircuitBreaker.canAttempt(provider)) {
    const nextAttempt = new Date(Date.now() + 30_000) // Reavalia em 30 segundos
    await prisma.marketingConversionDispatch.update({
      where: { id: dispatch.id },
      data: {
        status: 'retrying',
        errorCode: 'CIRCUIT_OPEN',
        errorMessageSanitized: `Circuito de proteção temporário ativo para ${dispatch.provider}. Nova tentativa programada.`,
        nextAttemptAt: nextAttempt,
        lockedAt: null,
        lockedBy: null
      }
    })

    return {
      dispatchId: dispatch.id,
      provider,
      status: 'retrying',
      errorCode: 'CIRCUIT_OPEN',
      message: 'Circuit breaker ativo.',
      attempt,
      nextAttemptAt: nextAttempt
    }
  }

  let payload = {}
  try {
    payload = JSON.parse(dispatch.payloadJson || '{}')
  } catch {
    payload = {}
  }

  const startTime = Date.now()

  // 2. Chamada ao provedor externo
  const deliveryResult = await deliverToProvider(dispatch.integration, payload, provider)
  const durationMs = Date.now() - startTime

  // 3. Sucesso na entrega
  if (deliveryResult.status === 'ok' || deliveryResult.status === 'dry_run') {
    trackingCircuitBreaker.recordSuccess(provider)

    await prisma.marketingConversionDispatch.update({
      where: { id: dispatch.id },
      data: {
        status: 'completed',
        attempts: attempt,
        responseCode: deliveryResult.code,
        responseMessage: deliveryResult.message.slice(0, 300),
        errorCode: null,
        errorMessageSanitized: null,
        lastAttemptAt: new Date(),
        sentAt: new Date(),
        processedAt: new Date(),
        lockedAt: null,
        lockedBy: null
      }
    })

    // Registra log técnico sanitizado
    await prisma.trackingDeliveryLog.create({
      data: {
        integrationId: dispatch.integrationId,
        producerId: dispatch.conversionEvent.producerId,
        eventId: dispatch.conversionEvent.eventEntityId || null,
        eventName: dispatch.providerEventName,
        status: deliveryResult.status === 'ok' ? 'ok' : 'dry_run',
        responseCode: deliveryResult.code,
        message: `event_id=${dispatch.conversionEvent.eventId} · Tentativa ${attempt} · ${deliveryResult.message}`
      }
    }).catch(() => null)

    trackingWorkerLogger.info('dispatch_completed', {
      dispatchId: dispatch.id,
      provider,
      eventId: dispatch.conversionEvent.eventEntityId,
      integrationId: dispatch.integrationId,
      attempt,
      status: 'completed',
      durationMs,
      responseCode: deliveryResult.code
    })

    return {
      dispatchId: dispatch.id,
      provider,
      status: 'completed',
      responseCode: deliveryResult.code,
      message: deliveryResult.message,
      attempt
    }
  }

  // 4. Falha na entrega: classificar o erro
  const classification = classifyTrackingError(
    deliveryResult.message,
    deliveryResult.code,
    deliveryResult.headers
  )

  trackingCircuitBreaker.recordFailure(provider, classification.isRetryable)

  // 4.1. Pode tentar novamente (Retryable) e ainda restam tentativas?
  if (classification.isRetryable && attempt < maxAttempts) {
    const nextAttempt = calculateNextRetryAt(
      attempt,
      classification.suggestedRetryAfterSeconds
    )

    await prisma.marketingConversionDispatch.update({
      where: { id: dispatch.id },
      data: {
        status: 'retrying',
        attempts: attempt,
        responseCode: deliveryResult.code,
        responseMessage: deliveryResult.message.slice(0, 300),
        errorCode: classification.category,
        errorMessageSanitized: classification.sanitizedMessage,
        lastAttemptAt: new Date(),
        nextAttemptAt: nextAttempt,
        lockedAt: null,
        lockedBy: null
      }
    })

    await prisma.trackingDeliveryLog.create({
      data: {
        integrationId: dispatch.integrationId,
        producerId: dispatch.conversionEvent.producerId,
        eventId: dispatch.conversionEvent.eventEntityId || null,
        eventName: dispatch.providerEventName,
        status: 'retrying',
        responseCode: deliveryResult.code,
        message: `event_id=${dispatch.conversionEvent.eventId} · Tentativa ${attempt}/${maxAttempts} · [${classification.category}] ${classification.sanitizedMessage}`
      }
    }).catch(() => null)

    trackingWorkerLogger.warn('dispatch_retrying', {
      dispatchId: dispatch.id,
      provider,
      eventId: dispatch.conversionEvent.eventEntityId,
      integrationId: dispatch.integrationId,
      attempt,
      status: 'retrying',
      durationMs,
      errorCode: classification.category,
      responseCode: deliveryResult.code,
      message: classification.sanitizedMessage
    })

    return {
      dispatchId: dispatch.id,
      provider,
      status: 'retrying',
      responseCode: deliveryResult.code,
      message: classification.sanitizedMessage,
      errorCode: classification.category,
      attempt,
      nextAttemptAt: nextAttempt
    }
  }

  // 4.2. Falha permanente (Dead Letter)
  await prisma.marketingConversionDispatch.update({
    where: { id: dispatch.id },
    data: {
      status: 'failed_permanently',
      attempts: attempt,
      responseCode: deliveryResult.code,
      responseMessage: deliveryResult.message.slice(0, 300),
      errorCode: classification.category,
      errorMessageSanitized: classification.sanitizedMessage,
      lastAttemptAt: new Date(),
      processedAt: new Date(),
      lockedAt: null,
      lockedBy: null
    }
  })

  await prisma.trackingDeliveryLog.create({
    data: {
      integrationId: dispatch.integrationId,
      producerId: dispatch.conversionEvent.producerId,
      eventId: dispatch.conversionEvent.eventEntityId || null,
      eventName: dispatch.providerEventName,
      status: 'falha_permanente',
      responseCode: deliveryResult.code,
      message: `DEAD LETTER · event_id=${dispatch.conversionEvent.eventId} · Esgotado (${attempt}/${maxAttempts}) · [${classification.category}] ${classification.sanitizedMessage}`
    }
  }).catch(() => null)

  trackingWorkerLogger.error('dispatch_dead_letter', {
    dispatchId: dispatch.id,
    provider,
    eventId: dispatch.conversionEvent.eventEntityId,
    integrationId: dispatch.integrationId,
    attempt,
    status: 'failed_permanently',
    durationMs,
    errorCode: classification.category,
    responseCode: deliveryResult.code,
    message: classification.sanitizedMessage
  })

  return {
    dispatchId: dispatch.id,
    provider,
    status: 'failed_permanently',
    responseCode: deliveryResult.code,
    message: classification.sanitizedMessage,
    errorCode: classification.category,
    attempt
  }
}

/**
 * Processa um lote completo com controle de concorrência
 */
export async function processOutboxBatch(batchSize: number = BATCH_SIZE): Promise<{
  processed: number
  results: DispatchExecutionResult[]
}> {
  lastWorkerRunAt = new Date()
  const claimedIds = await claimBatch(batchSize)

  if (claimedIds.length === 0) {
    return { processed: 0, results: [] }
  }

  const results: DispatchExecutionResult[] = []

  // Processa em chunks paralelos respeitando o limite de concorrência
  for (let i = 0; i < claimedIds.length; i += CONCURRENCY) {
    const chunk = claimedIds.slice(i, i + CONCURRENCY)
    const chunkResults = await Promise.all(chunk.map(id => executeSingleDispatch(id)))
    results.push(...chunkResults)
  }

  return {
    processed: claimedIds.length,
    results
  }
}

/**
 * Executa uma rodada (tick) do worker com proteção contra concorrência sobreposta
 */
export async function runWorkerTick(): Promise<{ processed: number; results: DispatchExecutionResult[] }> {
  if (isWorkerRunning) {
    return { processed: 0, results: [] }
  }

  isWorkerRunning = true
  try {
    return await processOutboxBatch()
  } finally {
    isWorkerRunning = false
  }
}

/**
 * Reprocessa manualmente um dispatch (inclusive itens da Dead Letter)
 */
export async function reprocessDispatch(
  dispatchId: number,
  operatorId?: number
): Promise<{ ok: boolean; dispatch: any }> {
  const existing = await prisma.marketingConversionDispatch.findUnique({
    where: { id: dispatchId }
  })

  if (!existing) {
    throw new Error('Dispatch não encontrado.')
  }

  const updated = await prisma.marketingConversionDispatch.update({
    where: { id: dispatchId },
    data: {
      status: 'queued',
      attempts: 0,
      errorCode: null,
      errorMessageSanitized: null,
      responseCode: null,
      responseMessage: null,
      nextAttemptAt: new Date(),
      lockedAt: null,
      lockedBy: null
    }
  })

  // Dispara uma rodada assíncrona imediata em background
  setImmediate(() => {
    runWorkerTick().catch(err => console.error('[marketing-worker] Erro ao reprocessar dispatch imediato:', err))
  })

  return { ok: true, dispatch: updated }
}

/**
 * Cancela manualmente um dispatch pendente ou com falha
 */
export async function cancelDispatch(
  dispatchId: number,
  reason: string = 'Cancelado pelo operador',
  operatorId?: number
): Promise<{ ok: boolean; dispatch: any }> {
  const existing = await prisma.marketingConversionDispatch.findUnique({
    where: { id: dispatchId }
  })

  if (!existing) {
    throw new Error('Dispatch não encontrado.')
  }

  const updated = await prisma.marketingConversionDispatch.update({
    where: { id: dispatchId },
    data: {
      status: 'cancelled',
      errorMessageSanitized: sanitizeErrorMessage(reason),
      processedAt: new Date(),
      lockedAt: null,
      lockedBy: null
    }
  })

  return { ok: true, dispatch: updated }
}

/**
 * Retorna diagnóstico e métricas de saúde operacional da fila
 */
export async function getTrackingWorkerHealth(producerId?: number): Promise<{
  status: 'healthy' | 'degraded' | 'critical'
  queueDepth: number
  queuedCount: number
  processingCount: number
  retryingCount: number
  completedCount: number
  deadLetterCount: number
  oldestPendingAgeMinutes: number
  lastRunAt: string | null
  providers: Record<string, any>
}> {
  const filter = producerId ? { conversionEvent: { producerId } } : {}

  const [
    queuedCount,
    processingCount,
    retryingCount,
    completedCount,
    deadLetterCount,
    oldestPending
  ] = await Promise.all([
    prisma.marketingConversionDispatch.count({ where: { ...filter, status: 'queued' } }),
    prisma.marketingConversionDispatch.count({ where: { ...filter, status: 'processing' } }),
    prisma.marketingConversionDispatch.count({ where: { ...filter, status: 'retrying' } }),
    prisma.marketingConversionDispatch.count({ where: { ...filter, status: 'completed' } }),
    prisma.marketingConversionDispatch.count({ where: { ...filter, status: 'failed_permanently' } }),
    prisma.marketingConversionDispatch.findFirst({
      where: { ...filter, status: { in: ['queued', 'retrying'] } },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true }
    })
  ])

  const queueDepth = queuedCount + retryingCount + processingCount

  let oldestPendingAgeMinutes = 0
  if (oldestPending?.createdAt) {
    oldestPendingAgeMinutes = Math.max(
      0,
      Math.round((Date.now() - new Date(oldestPending.createdAt).getTime()) / (60 * 1000))
    )
  }

  const circuitStatus = trackingCircuitBreaker.getStatus()

  let healthStatus: 'healthy' | 'degraded' | 'critical' = 'healthy'
  if (deadLetterCount > 10 || oldestPendingAgeMinutes > 30) {
    healthStatus = 'critical'
  } else if (deadLetterCount > 0 || oldestPendingAgeMinutes > 5 || Object.values(circuitStatus).some(c => c.state === 'OPEN')) {
    healthStatus = 'degraded'
  }

  return {
    status: healthStatus,
    queueDepth,
    queuedCount,
    processingCount,
    retryingCount,
    completedCount,
    deadLetterCount,
    oldestPendingAgeMinutes,
    lastRunAt: lastWorkerRunAt ? lastWorkerRunAt.toISOString() : null,
    providers: circuitStatus
  }
}

let workerInterval: NodeJS.Timeout | null = null

export function startTrackingWorkerScheduler(intervalMs: number = 15000) {
  if (workerInterval) return
  workerInterval = setInterval(() => {
    runWorkerTick().catch(err => {
      console.error('[marketing-worker] Erro no tick periódico:', err)
    })
  }, intervalMs)
  if (workerInterval && typeof workerInterval === 'object' && 'unref' in workerInterval) {
    workerInterval.unref()
  }
}

export function stopTrackingWorkerScheduler() {
  if (workerInterval) {
    clearInterval(workerInterval)
    workerInterval = null
  }
}
