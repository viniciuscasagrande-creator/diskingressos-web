import type { Request, Response } from 'express'
import app from '../server/src/app.js'

export default function handler(req: Request, res: Response) {
  const currentUrl = req.url || '/'
  if (!currentUrl.startsWith('/api')) {
    req.url = `/api${currentUrl.startsWith('/') ? currentUrl : `/${currentUrl}`}`
  }
  return app(req, res)
}
