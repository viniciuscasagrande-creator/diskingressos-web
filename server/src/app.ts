import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { prisma } from './prisma.js'
import { authRouter } from './routes/auth.js'
import { producersRouter } from './routes/producers.js'
import { usersRouter } from './routes/users.js'
import { eventsRouter } from './routes/events.js'
import { auditRouter } from './routes/audit.js'
import { lotsRouter } from './routes/lots.js'
import { ordersRouter } from './routes/orders.js'
import { participantsRouter } from './routes/participants.js'
import { checkinsRouter } from './routes/checkins.js'
import { posRouter } from './routes/pos.js'
import { financeOperationsRouter } from './routes/financeOperations.js'
import { financeAccountingRouter } from './routes/financeAccounting.js'
import { financePaymentsRouter } from './routes/financePayments.js'
import { financeSettlementRouter } from './routes/financeSettlement.js'
import { financeDisputesRouter } from './routes/financeDisputes.js'
import { operationsRouter } from './routes/operations.js'
import { ticketsRouter } from './routes/tickets.js'
import { marketingRouter } from './routes/marketing.js'
import { automationRouter } from './routes/automation.js'
import { supportRouter } from './routes/support.js'
import { communicationRouter } from './routes/communication.js'
import { trackingPublicRouter } from './routes/trackingPublic.js'
import { scopeRouter } from './routes/scope.js'

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(helmet())

const allowedOrigins = (process.env.FRONTEND_URL || process.env.PUBLIC_APP_URL || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Same-origin requests used by Vercel normally arrive without Origin.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Origem não autorizada pelo CORS'))
  },
  credentials: false,
}))
app.use(express.json({ limit: '1mb' }))

app.get('/api', (_req, res) => {
  res.json({ ok: true, service: 'DiskIngressos API', phase: '21.1.12' })
})

app.get('/api/health', async (_req, res) => {
  const databaseType = process.env.DATABASE_URL?.startsWith('postgresql://') || process.env.DATABASE_URL?.startsWith('postgres://')
    ? 'postgresql'
    : process.env.DATABASE_URL?.startsWith('file:')
      ? 'sqlite'
      : 'not-configured'

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({
      ok: false,
      service: 'DiskIngressos API',
      phase: '21.1.12',
      database: databaseType,
      databaseConnected: false,
      message: 'DATABASE_URL não configurada no ambiente da API.',
    })
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    return res.json({
      ok: true,
      service: 'DiskIngressos API',
      phase: '21.1.12',
      runtime: process.env.VERCEL ? 'vercel' : 'node',
      database: databaseType,
      databaseConnected: true,
    })
  } catch (error) {
    console.error('[health] Falha ao conectar no banco:', error)
    return res.status(503).json({
      ok: false,
      service: 'DiskIngressos API',
      phase: '21.1.12',
      runtime: process.env.VERCEL ? 'vercel' : 'node',
      database: databaseType,
      databaseConnected: false,
      message: 'API publicada, mas o banco de dados não está acessível.',
    })
  }
})

app.use('/api/tracking', trackingPublicRouter)
app.use('/api/auth', authRouter)
app.use('/api/scope', scopeRouter)
app.use('/api/producers', producersRouter)
app.use('/api/users', usersRouter)
app.use('/api/events', eventsRouter)
app.use('/api/lots', lotsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/tickets', ticketsRouter)
app.use('/api/participants', participantsRouter)
app.use('/api/checkins', checkinsRouter)
app.use('/api/pos', posRouter)
app.use('/api/finance', financeOperationsRouter)
app.use('/api/finance/accounting', financeAccountingRouter)
app.use('/api/finance/payments', financePaymentsRouter)
app.use('/api/finance/settlement', financeSettlementRouter)
app.use('/api/finance/disputes', financeDisputesRouter)
app.use('/api/operations', operationsRouter)
app.use('/api/marketing', marketingRouter)
app.use('/api/automation', automationRouter)
app.use('/api/support', supportRouter)
app.use('/api/communication', communicationRouter)
app.use('/api/audit', auditRouter)

app.use((_req, res) => res.status(404).json({ message: 'Rota não encontrada.' }))

// Garante JSON também para erros de CORS/Express, evitando o frontend receber HTML.
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[api] Erro não tratado:', error)
  const isCors = error?.message === 'Origem não autorizada pelo CORS'
  res.status(isCors ? 403 : 500).json({
    message: isCors ? error.message : 'Erro interno da API.',
  })
})

export default app
