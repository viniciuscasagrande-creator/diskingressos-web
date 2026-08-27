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
import { operationsRouter } from './routes/operations.js'
import { ticketsRouter } from './routes/tickets.js'

const app=express()
app.use(helmet())
app.use(cors({origin:true,credentials:false}))
app.use(express.json({limit:'1mb'}))

app.get('/api/health',(_req,res)=>res.json({ok:true,service:'DiskIngressos API',phase:10}))
app.use('/api/auth',authRouter)
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
app.use('/api/operations',operationsRouter)
app.use('/api/audit',auditRouter)
app.use((_req,res)=>res.status(404).json({message:'Rota não encontrada.'}))

const port=Number(process.env.API_PORT||3333)
app.listen(port,()=>console.log(`DiskIngressos API Fase 10: http://localhost:${port}/api`))
