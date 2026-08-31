import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
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

const app=express()
app.use(helmet())
const allowedOrigins=(process.env.FRONTEND_URL||process.env.PUBLIC_APP_URL||'')
  .split(',').map(v=>v.trim()).filter(Boolean)
app.set('trust proxy',1)
app.use(cors({
  origin:(origin,cb)=>{
    if(!origin || allowedOrigins.length===0 || allowedOrigins.includes(origin)) return cb(null,true)
    return cb(new Error('Origem não autorizada pelo CORS'))
  },
  credentials:false
}))
app.use(express.json({limit:'1mb'}))

app.get('/api/health',(_req,res)=>res.json({ok:true,service:'DiskIngressos API',phase:'21.1.11',database:process.env.DATABASE_URL?.startsWith('postgresql://')?'postgresql':'other'}))
app.use('/api/tracking',trackingPublicRouter)
app.use('/api/auth',authRouter)
app.use('/api/scope',scopeRouter)
app.use('/api/producers',producersRouter)
app.use('/api/users',usersRouter)
app.use('/api/events',eventsRouter)
app.use('/api/lots',lotsRouter)
app.use('/api/orders',ordersRouter)
app.use('/api/tickets',ticketsRouter)
app.use('/api/participants',participantsRouter)
app.use('/api/checkins',checkinsRouter)
app.use('/api/pos',posRouter)
app.use('/api/finance',financeOperationsRouter)
app.use('/api/finance/accounting',financeAccountingRouter)
app.use('/api/finance/payments',financePaymentsRouter)
app.use('/api/finance/settlement',financeSettlementRouter)
app.use('/api/finance/disputes',financeDisputesRouter)
app.use('/api/operations',operationsRouter)
app.use('/api/marketing',marketingRouter)
app.use('/api/automation',automationRouter)
app.use('/api/support',supportRouter)
app.use('/api/communication',communicationRouter)
app.use('/api/audit',auditRouter)
app.use((_req,res)=>res.status(404).json({message:'Rota não encontrada.'}))

const port=Number(process.env.PORT||process.env.API_PORT||3333)
app.listen(port,()=>console.log(`DiskIngressos API Fase 21.1.11: http://localhost:${port}/api`))
