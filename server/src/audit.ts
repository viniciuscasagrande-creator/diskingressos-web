import type { Request } from 'express'
import { prisma } from './prisma.js'

export async function audit(
  req: Request,
  action: string,
  resource: string,
  resourceId?: string,
  details?: unknown
): Promise<void>
export async function audit(
  req: Request,
  userId: number | null,
  producerId: number | null,
  action: string,
  resource: string,
  resourceId?: string,
  details?: unknown
): Promise<void>
export async function audit(
  req: any,
  arg1: any,
  arg2: any,
  arg3?: any,
  arg4?: any,
  arg5?: any,
  arg6?: any
) {
  let userId: number | null = null
  let producerId: number | null = null
  let action: string
  let resource: string
  let resourceId: string | undefined
  let details: unknown

  if (typeof arg1 === 'string') {
    action = arg1
    resource = arg2
    resourceId = arg3
    details = arg4
    userId = req.auth?.id ?? null
    producerId = req.auth?.producerId ?? null
  } else {
    userId = arg1
    producerId = arg2
    action = arg3
    resource = arg4
    resourceId = arg5
    details = arg6
  }

  await prisma.auditLog.create({
    data: {
      userId,
      producerId,
      action,
      resource,
      resourceId,
      status: 'success',
      ip: req.ip,
      details: details ? JSON.stringify(details) : null,
    },
  })
}

