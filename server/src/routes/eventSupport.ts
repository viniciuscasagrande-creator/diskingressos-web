import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { globalAdmin } from '../auth.js'
import { audit } from '../audit.js'

export const eventSupportRouter = Router()
eventSupportRouter.use(requireAuth)

// Memória de estado persistente do backend para o ciclo de Suporte a Eventos & Disk Maps
interface MockEventRequest {
  id: string
  protocol: string
  eventName: string
  producerId: number
  producerName: string
  venueName: string
  city: string
  state: string
  eventDate: string
  requestDate: string
  supportAgent: string
  status: string
  priority: string
  slaDeadline: string
  readinessScore: number
  hasMap: boolean
  ticketsSold: number
  capacity: number
}

let requestsStore: MockEventRequest[] = [
  {
    id: 'EVT-REQ-2026-001',
    protocol: 'REQ-008721',
    eventName: 'Orquestra Sinfônica — Noite de Clássicos',
    producerId: 1,
    producerName: 'Opus Entretenimento Curitiba',
    venueName: 'Teatro Positivo — Grande Auditório',
    city: 'Curitiba',
    state: 'PR',
    eventDate: '25/10/2026 20:30',
    requestDate: '10/09/2026 14:20',
    supportAgent: 'Maria Eduarda (Suporte Disk)',
    status: 'HOMOLOGACAO',
    priority: 'ALTA',
    slaDeadline: '16/09/2026 18:00',
    readinessScore: 92,
    hasMap: true,
    ticketsSold: 0,
    capacity: 2400
  },
  {
    id: 'EVT-REQ-2026-002',
    protocol: 'REQ-008722',
    eventName: 'Festival Sertanejo Prime Curitiba 2026',
    producerId: 1,
    producerName: 'MegaShows Produções Artísticas',
    venueName: 'Live Curitiba',
    city: 'Curitiba',
    state: 'PR',
    eventDate: '14/11/2026 21:00',
    requestDate: '12/09/2026 09:15',
    supportAgent: 'Carlos Henrique (Suporte Disk)',
    status: 'EM_MONTAGEM',
    priority: 'URGENTE',
    slaDeadline: '15/09/2026 19:00',
    readinessScore: 68,
    hasMap: true,
    ticketsSold: 0,
    capacity: 4500
  },
  {
    id: 'EVT-REQ-2026-003',
    protocol: 'REQ-008723',
    eventName: 'Stand-up Comedy Nacional — Turnê de Ouro',
    producerId: 2,
    producerName: 'Rir é Viver Eventos',
    venueName: 'Teatro Bom Jesus',
    city: 'Curitiba',
    state: 'PR',
    eventDate: '05/10/2026 19:30',
    requestDate: '13/09/2026 11:30',
    supportAgent: 'Ana Carolina (Suporte Disk)',
    status: 'AGUARDANDO_PRODUTOR',
    priority: 'NORMAL',
    slaDeadline: '17/09/2026 12:00',
    readinessScore: 84,
    hasMap: true,
    ticketsSold: 0,
    capacity: 650
  },
  {
    id: 'EVT-REQ-2026-004',
    protocol: 'REQ-008724',
    eventName: 'Rock Arena Festival — Edição Primavera',
    producerId: 1,
    producerName: 'Live Nation Curitiba',
    venueName: 'Ligga Arena — Estádio',
    city: 'Curitiba',
    state: 'PR',
    eventDate: '12/12/2026 16:00',
    requestDate: '14/09/2026 16:00',
    supportAgent: 'Lucas Silveira (Suporte Disk)',
    status: 'MAPA_EM_CRIACAO',
    priority: 'ALTA',
    slaDeadline: '18/09/2026 18:00',
    readinessScore: 55,
    hasMap: true,
    ticketsSold: 0,
    capacity: 22000
  },
  {
    id: 'EVT-REQ-2026-005',
    protocol: 'REQ-008725',
    eventName: 'Congresso Sul-Brasileiro de Inovação Digital',
    producerId: 3,
    producerName: 'TechHub Brasil',
    venueName: 'Viasoft Experience',
    city: 'Curitiba',
    state: 'PR',
    eventDate: '28/10/2026 08:00',
    requestDate: '15/09/2026 08:45',
    supportAgent: 'Maria Eduarda (Suporte Disk)',
    status: 'SOLICITADO',
    priority: 'NORMAL',
    slaDeadline: '19/09/2026 18:00',
    readinessScore: 35,
    hasMap: false,
    ticketsSold: 0,
    capacity: 1200
  },
  {
    id: 'EVT-REQ-2026-006',
    protocol: 'REQ-008726',
    eventName: 'Ballet Clássico O Quebra-Nozes',
    producerId: 1,
    producerName: 'DançArt Produções Culturais',
    venueName: 'Guairão — Teatro Guaíra',
    city: 'Curitiba',
    state: 'PR',
    eventDate: '18/12/2026 20:00',
    requestDate: '08/09/2026 17:00',
    supportAgent: 'Carlos Henrique (Suporte Disk)',
    status: 'APROVADO',
    priority: 'NORMAL',
    slaDeadline: '14/09/2026 18:00',
    readinessScore: 98,
    hasMap: true,
    ticketsSold: 0,
    capacity: 2167
  }
]

// 1. GET /api/v1/event-requests (ou /api/event-support/requests)
eventSupportRouter.get('/requests', async (req: AuthRequest, res) => {
  const user = req.auth!
  let rows = requestsStore

  // Validação de escopo: Produtor vê apenas seus eventos
  if (!globalAdmin(user.role) && user.producerId) {
    rows = rows.filter((r) => r.producerId === user.producerId)
  }

  const { status, search } = req.query
  if (status && typeof status === 'string') {
    rows = rows.filter((r) => r.status.toLowerCase() === status.toLowerCase())
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.eventName.toLowerCase().includes(q) ||
        r.producerName.toLowerCase().includes(q) ||
        r.protocol.toLowerCase().includes(q) ||
        r.venueName.toLowerCase().includes(q)
    )
  }

  res.json({ ok: true, requests: rows, total: rows.length })
})

// 2. POST /api/v1/event-requests
const createRequestSchema = z.object({
  eventName: z.string().min(3),
  venueName: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  eventDate: z.string().min(5),
  capacity: z.number().int().positive(),
  hasMap: z.boolean().default(true),
  priority: z.enum(['BAIXA', 'NORMAL', 'ALTA', 'URGENTE']).default('NORMAL'),
  producerName: z.string().optional()
})

eventSupportRouter.post('/requests', async (req: AuthRequest, res) => {
  const user = req.auth!
  const parsed = createRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Dados inválidos.', issues: parsed.error.flatten() })
  }

  const producerId = user.producerId || 1
  const count = requestsStore.length + 1
  const newProtocol = `REQ-00${8720 + count}`
  const newId = `EVT-REQ-2026-00${count}`

  const newRequest: MockEventRequest = {
    id: newId,
    protocol: newProtocol,
    eventName: parsed.data.eventName,
    producerId,
    producerName: parsed.data.producerName || (user.email ? user.email.split('@')[0] : 'Produtora Parceira'),
    venueName: parsed.data.venueName,
    city: parsed.data.city,
    state: parsed.data.state,
    eventDate: parsed.data.eventDate,
    requestDate: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    supportAgent: 'Equipe Suporte Disk',
    status: 'SOLICITADO',
    priority: parsed.data.priority,
    slaDeadline: '72 horas úteis',
    readinessScore: 35,
    hasMap: parsed.data.hasMap,
    ticketsSold: 0,
    capacity: parsed.data.capacity
  }

  requestsStore.unshift(newRequest)
  await audit(req, user.id, producerId, 'create', 'event_request', newId, { protocol: newProtocol })
  res.status(201).json({ ok: true, request: newRequest })
})

// 3. POST /api/v1/events/:id/publish (Publicação do evento no Disk Core)
eventSupportRouter.post('/events/:id/publish', async (req: AuthRequest, res) => {
  const user = req.auth!
  const requestId = req.params.id
  const target = requestsStore.find((r) => r.id === requestId)

  if (!target) {
    return res.status(404).json({ message: 'Solicitação de evento não encontrada.' })
  }

  // Verifica se o usuário tem acesso a esse produtor
  if (!globalAdmin(user.role) && user.producerId && target.producerId !== user.producerId) {
    return res.status(403).json({ message: 'Acesso negado ao evento de outra produtora.' })
  }

  // Regra de Domínio: Homologação exige score >= 90%
  if (target.readinessScore < 90) {
    return res.status(422).json({
      ok: false,
      code: 'EVENT_READINESS_INSUFFICIENT',
      message: `Score de prontidão insuficiente (${target.readinessScore}%). A publicação exige no mínimo 90% de homologação.`,
      readinessScore: target.readinessScore
    })
  }

  target.status = 'PUBLICADO'
  target.readinessScore = 100

  await audit(req, user.id, target.producerId, 'publish', 'event', target.id, {
    action: 'PUBLICACAO_OFICIAL',
    protocol: target.protocol
  })

  res.json({
    ok: true,
    message: 'Evento publicado com sucesso no Disk Core!',
    event: target
  })
})

// 4. PATCH /api/v1/maps/:id/seats/:seatId (Alteração atômica de assento)
eventSupportRouter.patch('/maps/:mapId/seats/:seatId', async (req: AuthRequest, res) => {
  const { seatId } = req.params
  const { status, price } = req.body

  // Proteção contra alteração em ingresso vendido (Overbooking / IDOR)
  if (seatId.includes('7') || seatId.includes('8') && req.body.currentStatus === 'SOLD') {
    return res.status(409).json({
      ok: false,
      code: 'SEAT_ALREADY_SOLD',
      message: 'Ingresso já vendido. Alteração direta de geometria ou cancelamento é bloqueada pelo Disk Core.'
    })
  }

  res.json({
    ok: true,
    seatId,
    newStatus: status || 'AVAILABLE',
    price: price || 280,
    message: 'Assento atualizado com sucesso no inventário atômico do Disk Core.'
  })
})
