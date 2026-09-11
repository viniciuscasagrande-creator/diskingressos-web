/**
 * @deprecated LEGACY / OBSOLETO — NÃO UTILIZAR
 * 
 * Este arquivo foi descontinuado e aposentado na Fase 28.14.1.
 * A FONTE ÚNICA DE VERDADE para Pixels, CAPI e rastreamento multi-evento é:
 *   - Rotas oficiais da API: server/src/routes/marketing.ts (/api/marketing/integrations)
 *   - Modelos Prisma oficiais: TrackingIntegration, TrackingIntegrationEvent, TrackingDeliveryLog
 *   - Criptografia centralizada: server/src/services/trackingCrypto.ts
 *   - Motor de conversões: server/src/services/conversionEngine.ts
 * 
 * Este router NÃO é montado no app.ts para garantir que não haja duplicidade de arquiteturas.
 */

import { Router } from 'express'
export { encryptTrackingToken, decryptTrackingToken, maskToken } from '../services/trackingCrypto.js'

export const trackingRouter = Router()

trackingRouter.use((_req, res) => {
  res.status(410).json({
    message: 'Rota de tracking legada descontinuada na Fase 28.14.1. Utilize a API oficial em /api/marketing/integrations.',
    canonicalEndpoint: '/api/marketing/integrations'
  })
})
