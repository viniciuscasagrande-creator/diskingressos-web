import type { AuthRequest } from './middleware/auth.js'
import { globalAdmin } from './auth.js'

export function requestedProducerId(req: AuthRequest): number | undefined {
  if (!req.auth || !globalAdmin(req.auth.role)) return req.auth?.producerId ?? -1
  const raw = req.query.producerId
  if (raw === undefined || raw === '' || raw === 'all') return undefined
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

export function writeProducerId(req: AuthRequest, bodyProducerId?: number): number | null {
  if (!req.auth) return null
  return globalAdmin(req.auth.role) ? (bodyProducerId ?? null) : (req.auth.producerId ?? null)
}

export function ownsProducer(req: AuthRequest, producerId: number): boolean {
  if (!req.auth) return false
  return globalAdmin(req.auth.role) || req.auth.producerId === producerId
}

export function tenantProducerId(user?: { role: string; producerId?: number | null }, paramProducerId?: any): number | undefined {
  if (!user || !user.role) return undefined
  if (!globalAdmin(user.role)) return user.producerId ?? -1
  if (!paramProducerId || paramProducerId === 'all') return undefined
  const id = Number(paramProducerId)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

export function tenantWhere(user?: { role: string; producerId?: number | null }, paramProducerId?: any): Record<string, any> {
  const pid = tenantProducerId(user, paramProducerId)
  return pid !== undefined ? { producerId: pid } : {}
}
