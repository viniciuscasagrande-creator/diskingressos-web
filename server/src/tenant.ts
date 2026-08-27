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

export function tenantProducerId(reqOrUser: any, rawProducerId?: any): number | null {
  const user = reqOrUser.auth || reqOrUser.user || reqOrUser
  if (!user) return null
  const isGlobal = globalAdmin(user.role)
  if (isGlobal) {
    const raw = rawProducerId !== undefined ? rawProducerId : reqOrUser.query?.producerId
    if (raw === undefined || raw === '' || raw === 'all' || raw === null) return null
    const id = Number(raw)
    return Number.isInteger(id) && id > 0 ? id : null
  }
  return user.producerId ?? null
}

export function tenantWhere(reqOrUser: any, rawProducerId?: any): Record<string, any> {
  const pId = tenantProducerId(reqOrUser, rawProducerId)
  return pId ? { producerId: pId } : {}
}
