import type { Request } from 'express'
import { prisma } from './prisma.js'
export async function audit(req:Request,userId:number|null,producerId:number|null,action:string,resource:string,resourceId?:string,details?:unknown){
  await prisma.auditLog.create({data:{userId,producerId,action,resource,resourceId,status:'success',ip:req.ip,details:details?JSON.stringify(details):null}})
}
