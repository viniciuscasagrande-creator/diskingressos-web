import type { Request, Response } from 'express'
import app from '../server/src/app.js'

export default function handler(req: Request, res: Response) {
  req.url = '/api'
  return app(req, res)
}
