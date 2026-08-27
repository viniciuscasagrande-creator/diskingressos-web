import type { NextFunction, Request, Response } from 'express'
import { verifyToken, type TokenUser } from '../auth.js'
export type AuthRequest=Request & {auth?:TokenUser}
export function requireAuth(req:AuthRequest,res:Response,next:NextFunction){
  const raw=req.headers.authorization
  if(!raw?.startsWith('Bearer ')) return res.status(401).json({message:'Não autenticado.'})
  try{req.auth=verifyToken(raw.slice(7));next()}catch{return res.status(401).json({message:'Sessão inválida ou expirada.'})}
}
export function requireRoles(...roles:string[]){return (req:AuthRequest,res:Response,next:NextFunction)=>req.auth&&roles.includes(req.auth.role)?next():res.status(403).json({message:'Sem permissão.'})}
