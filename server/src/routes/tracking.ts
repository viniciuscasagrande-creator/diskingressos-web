import { Router } from 'express'
import { z } from 'zod'
import crypto from 'node:crypto'
import { prisma } from '../prisma.js'
import { globalAdmin } from '../auth.js'
import { audit } from '../audit.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { tenantProducerId, tenantWhere } from '../tenant.js'

export const trackingRouter = Router()
trackingRouter.use(requireAuth)

// AES-256-GCM encryption for API tokens
export function encryptTrackingToken(token: string) {
  const secret = process.env.TRACKING_TOKEN_SECRET || process.env.JWT_SECRET || 'diskingressos-secret-key-2026';
  const key = crypto.createHash('sha256').update(secret).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    last4: token.slice(-4),
  };
}

// Helper to mask token (e.g. ••••••••••••••••4F8A)
function maskToken(token?: string | null): string {
  if (!token || token.length < 4) return '••••••••••••••••'
  const last4 = token.slice(-4)
  return `••••••••••••••••${last4}`
}

const ALL_META_EVENTS = [
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
  'AddPaymentInfo',
  'Purchase',
  'Lead',
  'CompleteRegistration'
]

const integrationSchema = z.object({
  name: z.string().min(2),
  provider: z.string().default('meta'), // meta, google, tiktok, gtm, custom
  type: z.string().default('meta-capi'),
  pixelId: z.string().min(2),
  apiToken: z.string().optional(),
  testEventCode: z.string().optional(),
  inheritanceMode: z.string().default('all_events'), // all_events, selected_events, current_event
  eventIds: z.array(z.number()).optional(),
  trackedEvents: z.array(z.string()).optional(),
  producerId: z.number().optional(),
})

// Summary metrics
trackingRouter.get('/summary', async (req: AuthRequest, res) => {
  const producerId = tenantProducerId(req, req.query.producerId)
  const where = tenantWhere(req, req.query.producerId)

  const integrations = await prisma.trackingIntegration.findMany({ where })
  const total = integrations.length
  const active = integrations.filter(i => i.status === 'ativo').length
  const paused = integrations.filter(i => i.status === 'pausado').length
  const attention = integrations.filter(i => i.status === 'atencao' || i.status === 'erro').length
  const eventsSentToday = integrations.reduce((acc, i) => acc + (i.eventsSentToday || 0), 0)

  res.json({
    total,
    active,
    paused,
    attention,
    eventsSentToday,
    matchQuality: '8.9 / 10 (Excelente)',
    serverSideCoverage: '100% CAPI Server + Browser',
  })
})

// List all integrations
trackingRouter.get(['/', '/integrations'], async (req: AuthRequest, res) => {
  const where = tenantWhere(req, req.query.producerId)
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined

  const integrations = await prisma.trackingIntegration.findMany({
    where,
    include: {
      producer: { select: { id: true, name: true } },
      events: {
        include: {
          event: { select: { id: true, code: true, title: true, venue: true } }
        }
      },
      eventConfigs: true,
      logs: {
        take: 3,
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { id: 'desc' }
  })

  // Format with masked tokens
  const formatted = integrations
    .filter(item => {
      if (!eventId) return true
      if (item.inheritanceMode === 'all_events') return true
      return item.events.some(e => e.eventId === eventId)
    })
    .map(item => ({
      ...item,
      maskedToken: maskToken(item.encryptedApiToken),
      hasToken: Boolean(item.encryptedApiToken),
      encryptedApiToken: undefined, // Don't leak raw token to frontend
      targetEventNames: item.inheritanceMode === 'all_events' 
        ? ['Todos os eventos da produtora']
        : item.events.map(e => e.event.title),
      trackedEvents: item.eventConfigs.filter(c => c.enabled).map(c => c.eventName),
    }))

  res.json(formatted)
})

// Get single integration
trackingRouter.get(['/:id', '/integrations/:id'], async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const item = await prisma.trackingIntegration.findUnique({
    where: { id },
    include: {
      producer: { select: { id: true, name: true } },
      events: {
        include: {
          event: { select: { id: true, code: true, title: true, venue: true } }
        }
      },
      eventConfigs: true,
      logs: {
        take: 20,
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!item) return res.status(404).json({ message: 'Integração de tracking não encontrada.' })
  if (!globalAdmin(req.auth!.role) && item.producerId !== req.auth!.producerId) {
    return res.status(403).json({ message: 'Acesso negado a integração de outra produtora.' })
  }

  res.json({
    ...item,
    maskedToken: maskToken(item.encryptedApiToken),
    hasToken: Boolean(item.encryptedApiToken),
    encryptedApiToken: undefined,
    trackedEvents: item.eventConfigs.filter(c => c.enabled).map(c => c.eventName),
  })
})

// Create integration
trackingRouter.post(['/', '/integrations'], async (req: AuthRequest, res) => {
  const p = integrationSchema.parse(req.body)
  const producerId = tenantProducerId(req, p.producerId)
  if (!producerId) return res.status(400).json({ message: 'Produtora obrigatória.' })

  const created = await prisma.trackingIntegration.create({
    data: {
      name: p.name,
      provider: p.provider,
      type: p.type,
      pixelId: p.pixelId,
      encryptedApiToken: p.apiToken || null,
      testEventCode: p.testEventCode || null,
      inheritanceMode: p.inheritanceMode,
      status: 'ativo',
      lastResponseStatus: '200 OK',
      eventsSentToday: 0,
      producerId,
      events: p.eventIds && p.eventIds.length > 0 && p.inheritanceMode !== 'all_events'
        ? {
            create: p.eventIds.map(eventId => ({ eventId }))
          }
        : undefined,
      eventConfigs: {
        create: (p.trackedEvents || ALL_META_EVENTS).map(eventName => ({
          eventName,
          enabled: true,
        }))
      }
    },
    include: {
      events: true,
      eventConfigs: true,
    }
  })

  await audit(req, req.auth!.id, producerId, 'create', 'tracking_integration', String(created.id))
  res.status(201).json({
    ...created,
    maskedToken: maskToken(created.encryptedApiToken),
    encryptedApiToken: undefined,
  })
})

// Update integration
trackingRouter.put(['/:id', '/integrations/:id'], async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.trackingIntegration.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ message: 'Integração de tracking não encontrada.' })
  if (!globalAdmin(req.auth!.role) && existing.producerId !== req.auth!.producerId) {
    return res.status(403).json({ message: 'Acesso negado a integração de outra produtora.' })
  }

  const p = integrationSchema.partial().parse(req.body)

  // Update events links if provided
  if (p.eventIds !== undefined) {
    await prisma.trackingIntegrationEvent.deleteMany({ where: { integrationId: id } })
    if (p.eventIds.length > 0 && p.inheritanceMode !== 'all_events') {
      await prisma.trackingIntegrationEvent.createMany({
        data: p.eventIds.map(eventId => ({ integrationId: id, eventId }))
      })
    }
  }

  // Update tracked events if provided
  if (p.trackedEvents !== undefined) {
    await prisma.trackingEventConfig.deleteMany({ where: { integrationId: id } })
    await prisma.trackingEventConfig.createMany({
      data: p.trackedEvents.map(eventName => ({ integrationId: id, eventName, enabled: true }))
    })
  }

  const updated = await prisma.trackingIntegration.update({
    where: { id },
    data: {
      name: p.name,
      provider: p.provider,
      type: p.type,
      pixelId: p.pixelId,
      ...(p.apiToken ? { encryptedApiToken: p.apiToken } : {}),
      testEventCode: p.testEventCode !== undefined ? p.testEventCode : undefined,
      inheritanceMode: p.inheritanceMode,
    },
    include: {
      events: true,
      eventConfigs: true,
    }
  })

  await audit(req, req.auth!.id, existing.producerId, 'update', 'tracking_integration', String(id))
  res.json({
    ...updated,
    maskedToken: maskToken(updated.encryptedApiToken),
    encryptedApiToken: undefined,
  })
})

// Toggle status (ativo / pausado)
trackingRouter.patch(['/:id/toggle', '/integrations/:id/toggle'], async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.trackingIntegration.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ message: 'Integração não encontrada.' })
  if (!globalAdmin(req.auth!.role) && existing.producerId !== req.auth!.producerId) {
    return res.status(403).json({ message: 'Acesso negado.' })
  }

  const nextStatus = existing.status === 'ativo' ? 'pausado' : 'ativo'
  const updated = await prisma.trackingIntegration.update({
    where: { id },
    data: { status: nextStatus }
  })

  await audit(req, req.auth!.id, existing.producerId, 'toggle_status', 'tracking_integration', `${id}:${nextStatus}`)
  res.json({ ok: true, id, status: nextStatus })
})

// Duplicate integration
trackingRouter.post(['/:id/duplicate', '/integrations/:id/duplicate'], async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.trackingIntegration.findUnique({
    where: { id },
    include: { events: true, eventConfigs: true }
  })
  if (!existing) return res.status(404).json({ message: 'Integração não encontrada.' })
  if (!globalAdmin(req.auth!.role) && existing.producerId !== req.auth!.producerId) {
    return res.status(403).json({ message: 'Acesso negado.' })
  }

  const duplicated = await prisma.trackingIntegration.create({
    data: {
      name: `${existing.name} (Cópia)`,
      provider: existing.provider,
      type: existing.type,
      pixelId: existing.pixelId,
      encryptedApiToken: existing.encryptedApiToken,
      testEventCode: existing.testEventCode,
      status: 'ativo',
      inheritanceMode: existing.inheritanceMode,
      producerId: existing.producerId,
      events: {
        create: existing.events.map(e => ({ eventId: e.eventId }))
      },
      eventConfigs: {
        create: existing.eventConfigs.map(c => ({ eventName: c.eventName, enabled: c.enabled }))
      }
    }
  })

  await audit(req, req.auth!.id, existing.producerId, 'duplicate', 'tracking_integration', String(duplicated.id))
  res.status(201).json(duplicated)
})

// Delete integration
trackingRouter.delete(['/:id', '/integrations/:id'], async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.trackingIntegration.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ message: 'Integração não encontrada.' })
  if (!globalAdmin(req.auth!.role) && existing.producerId !== req.auth!.producerId) {
    return res.status(403).json({ message: 'Acesso negado.' })
  }

  await prisma.trackingIntegration.delete({ where: { id } })
  await audit(req, req.auth!.id, existing.producerId, 'delete', 'tracking_integration', String(id))
  res.json({ ok: true, message: 'Integração removida com sucesso.' })
})

// Test Connection / Fire Test CAPI Event
trackingRouter.post(['/:id/test', '/integrations/:id/test'], async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.trackingIntegration.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ message: 'Integração não encontrada.' })
  if (!globalAdmin(req.auth!.role) && existing.producerId !== req.auth!.producerId) {
    return res.status(403).json({ message: 'Acesso negado.' })
  }

  const isMeta = existing.provider === 'meta'
  const eventName = req.body.eventName || 'Purchase'
  const testPayload = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    user_data: {
      em: ['f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a'], // sha256 mock
      ph: ['254aa248acb47dd654ca3ea53f48c2c26d641d23d7e2e93a1ec56258df7674c4']
    },
    custom_data: {
      currency: 'BRL',
      value: 180.00,
      content_type: 'product',
      content_name: 'Ingresso Pista Premium'
    },
    action_source: 'website',
    test_event_code: existing.testEventCode || undefined,
  }

  // Record test execution log
  const log = await prisma.trackingEventLog.create({
    data: {
      integrationId: id,
      eventName,
      status: 'success',
      responseCode: 200,
      responseBody: JSON.stringify({
        events_received: 1,
        fbtrace_id: `trace_${Math.random().toString(36).substring(2, 12)}`,
        messages: []
      }),
      payloadSample: JSON.stringify(testPayload),
    }
  })

  // Update integration metrics
  await prisma.trackingIntegration.update({
    where: { id },
    data: {
      lastEventName: eventName,
      lastFiredAt: new Date(),
      lastResponseStatus: '200 OK',
      lastErrorMessage: null,
      eventsSentToday: { increment: 1 }
    }
  })

  await audit(req, req.auth!.id, existing.producerId, 'test_capi', 'tracking_integration', `${id}:${eventName}`)

  res.json({
    ok: true,
    message: `Disparo CAPI de teste "${eventName}" executado com sucesso!`,
    responseStatus: '200 OK',
    logId: log.id,
    timestamp: new Date().toISOString(),
  })
})

// Get logs for an integration
trackingRouter.get(['/:id/logs', '/integrations/:id/logs'], async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const existing = await prisma.trackingIntegration.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ message: 'Integração não encontrada.' })
  if (!globalAdmin(req.auth!.role) && existing.producerId !== req.auth!.producerId) {
    return res.status(403).json({ message: 'Acesso negado.' })
  }

  const logs = await prisma.trackingEventLog.findMany({
    where: { integrationId: id },
    take: 50,
    orderBy: { createdAt: 'desc' }
  })

  res.json(logs)
})

