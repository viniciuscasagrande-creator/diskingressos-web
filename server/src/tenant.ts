import type { AuthRequest } from './middleware/auth.js'
import { globalAdmin } from './auth.js'

export function requestedProducerId(req: AuthRequest): number | undefined {
  if (!globalAdmin(req.auth!.role)) return req.auth!.producerId ?? -1
  const raw = req.query.producerId
  if (raw === undefined || raw === '' || raw === 'all') return undefined
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

export function writeProducerId(req: AuthRequest, bodyProducerId?: number): number | null {
  return globalAdmin(req.auth!.role) ? (bodyProducerId ?? null) : (req.auth!.producerId ?? null)
}

export function ownsProducer(req: AuthRequest, producerId: number): boolean {
  return globalAdmin(req.auth!.role) || req.auth!.producerId === producerId
}

export function tenantWhere(user: { role: string; producerId?: number | null }, queryProducerId?: any): any {
  if (globalAdmin(user.role)) {
    if (queryProducerId && queryProducerId !== 'all') {
      const id = Number(queryProducerId);
      if (Number.isInteger(id) && id > 0) return { producerId: id };
    }
    return {};
  }
  return { producerId: user.producerId ?? -1 };
}

export function tenantProducerId(user: { role: string; producerId?: number | null }, bodyProducerId?: any): number {
  if (globalAdmin(user.role)) {
    return Number(bodyProducerId) || user.producerId || 1;
  }
  return user.producerId || 1;
}
