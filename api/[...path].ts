import type { Request, Response } from 'express'
import app from '../server/src/app.js'

// Catch-all serverless da Vercel para /api/*.
// O ajuste de URL deixa o handler compatível tanto se a plataforma preservar
// /api no req.url quanto se entregar somente o caminho interno da função.
export default function handler(req: Request, res: Response) {
  const currentUrl = req.url || '/'
  if (!currentUrl.startsWith('/api')) {
    req.url = `/api${currentUrl.startsWith('/') ? currentUrl : `/${currentUrl}`}`
  }
  return app(req, res)
}
