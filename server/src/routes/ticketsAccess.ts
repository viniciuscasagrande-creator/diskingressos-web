// ============================================================================
// ROTAS DO NÚCLEO ENTERPRISE DE INGRESSOS E CONTROLE DE ACESSO (FASE 29.10)
// Disk Core • Ingressos, Credenciais Seguras, Transferências, Reemissão e Acesso
// ============================================================================

import { Router, Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

export const ticketsAccessRouter = Router()

// Banco em memória mockado com persistência durante execução do servidor
interface MockCredential {
  id: string
  ticketId: string
  version: number
  code: string
  qrPayload: string
  secureHash: string
  status: 'ATIVA' | 'REVOGADA_REEMISSAO' | 'REVOGADA_TRANSFERENCIA' | 'REVOGADA_CANCELAMENTO' | 'CONSUMIDA'
  issuedAt: string
  revokedAt?: string
  revocationReason?: string
}

interface MockTransfer {
  id: string
  ticketId: string
  fromHolderName: string
  fromHolderDocument: string
  fromHolderEmail: string
  toHolderName: string
  toHolderDocument: string
  toHolderEmail: string
  toHolderPhone: string
  transferredAt: string
  transferredBy: 'COMPRADOR' | 'OPERADOR_SAC' | 'ADMIN'
  oldCredentialVersion: number
  newCredentialVersion: number
  notes?: string
}

interface MockTicket {
  id: string
  orderId: string
  eventId: number
  eventName: string
  sector: string
  lot: string
  modality: 'INTEIRA' | 'MEIA_ENTRADA' | 'CORTESIA' | 'PROMO'
  priceCents: number
  feeCents: number
  currency: 'BRL'
  buyerName: string
  buyerDocument: string
  buyerEmail: string
  buyerPhone: string
  holderName: string
  holderDocument: string
  holderEmail: string
  holderPhone: string
  status: 'EMITIDO' | 'ATIVO' | 'TRANSFERIDO' | 'REEMITIDO' | 'UTILIZADO' | 'CANCELADO' | 'BLOQUEADO'
  statusLabelPtBr: string
  currentCredentialVersion: number
  currentCredentialCode: string
  transferCount: number
  checkInAt?: string
  checkInGate?: string
  checkInDevice?: string
  checkInOperator?: string
  createdAt: string
  updatedAt: string
}

// Ingressos iniciais realistas
let tickets: MockTicket[] = [
  {
    id: 'TKT-2026-981240-01',
    orderId: 'ORD-928371',
    eventId: 1,
    eventName: 'Orquestra Sinfônica — Noite de Clássicos',
    sector: 'Plateia Premium A',
    lot: '1º Lote Antecipado',
    modality: 'INTEIRA',
    priceCents: 24000,
    feeCents: 2400,
    currency: 'BRL',
    buyerName: 'Maria Silva Santos',
    buyerDocument: '049.281.938-12',
    buyerEmail: 'maria.santos@email.com.br',
    buyerPhone: '(41) 98822-1099',
    holderName: 'Lucas Fernandes Pereira',
    holderDocument: '512.981.234-99',
    holderEmail: 'lucas.pereira@email.com',
    holderPhone: '(41) 99182-3344',
    status: 'ATIVO',
    statusLabelPtBr: 'Ativo para Entrada',
    currentCredentialVersion: 2,
    currentCredentialCode: 'SEC-TKT-981240-01-V2-7d8a9e',
    transferCount: 1,
    createdAt: '2026-09-15T14:20:05Z',
    updatedAt: '2026-09-15T15:10:00Z'
  },
  {
    id: 'TKT-2026-981240-02',
    orderId: 'ORD-928371',
    eventId: 1,
    eventName: 'Orquestra Sinfônica — Noite de Clássicos',
    sector: 'Plateia Premium A',
    lot: '1º Lote Antecipado',
    modality: 'MEIA_ENTRADA',
    priceCents: 12000,
    feeCents: 1200,
    currency: 'BRL',
    buyerName: 'Maria Silva Santos',
    buyerDocument: '049.281.938-12',
    buyerEmail: 'maria.santos@email.com.br',
    buyerPhone: '(41) 98822-1099',
    holderName: 'Maria Silva Santos',
    holderDocument: '049.281.938-12',
    holderEmail: 'maria.santos@email.com.br',
    holderPhone: '(41) 98822-1099',
    status: 'UTILIZADO',
    statusLabelPtBr: 'Check-in Realizado',
    currentCredentialVersion: 1,
    currentCredentialCode: 'SEC-TKT-981240-02-V1-3b4c5d',
    transferCount: 0,
    checkInAt: '2026-09-15T17:45:12Z',
    checkInGate: 'Portão Principal Sul',
    checkInDevice: 'Catraca 02 - Ótica',
    checkInOperator: 'Juliana Castro (Portaria)',
    createdAt: '2026-09-15T14:20:05Z',
    updatedAt: '2026-09-15T17:45:12Z'
  },
  {
    id: 'TKT-2026-981241-01',
    orderId: 'ORD-928372',
    eventId: 1,
    eventName: 'Orquestra Sinfônica — Noite de Clássicos',
    sector: 'Camarote Lateral B',
    lot: 'Lote Promocional',
    modality: 'INTEIRA',
    priceCents: 35000,
    feeCents: 3500,
    currency: 'BRL',
    buyerName: 'Carlos Eduardo Nogueira',
    buyerDocument: '718.992.100-43',
    buyerEmail: 'carlos.nogueira@adv.com.br',
    buyerPhone: '(41) 99911-2233',
    holderName: 'Carlos Eduardo Nogueira',
    holderDocument: '718.992.100-43',
    holderEmail: 'carlos.nogueira@adv.com.br',
    holderPhone: '(41) 99911-2233',
    status: 'ATIVO',
    statusLabelPtBr: 'Ativo para Entrada',
    currentCredentialVersion: 1,
    currentCredentialCode: 'SEC-TKT-981241-01-V1-9f1e2a',
    transferCount: 0,
    createdAt: '2026-09-15T14:22:10Z',
    updatedAt: '2026-09-15T14:22:10Z'
  },
  {
    id: 'TKT-2026-981242-01',
    orderId: 'ORD-928374',
    eventId: 1,
    eventName: 'Orquestra Sinfônica — Noite de Clássicos',
    sector: 'Pista Superior',
    lot: '2º Lote',
    modality: 'INTEIRA',
    priceCents: 18000,
    feeCents: 1800,
    currency: 'BRL',
    buyerName: 'Fernanda Martins Costa',
    buyerDocument: '331.442.889-01',
    buyerEmail: 'fernanda.costa@empresa.com',
    buyerPhone: '(41) 98777-6655',
    holderName: 'Fernanda Martins Costa',
    holderDocument: '331.442.889-01',
    holderEmail: 'fernanda.costa@empresa.com',
    holderPhone: '(41) 98777-6655',
    status: 'BLOQUEADO',
    statusLabelPtBr: 'Bloqueado Administrativamente',
    currentCredentialVersion: 1,
    currentCredentialCode: 'SEC-TKT-981242-01-V1-8c7b6a',
    transferCount: 0,
    createdAt: '2026-09-15T14:26:00Z',
    updatedAt: '2026-09-15T16:00:00Z'
  }
]

let credentials: MockCredential[] = [
  {
    id: 'CRED-TKT-981240-01-V1',
    ticketId: 'TKT-2026-981240-01',
    version: 1,
    code: 'SEC-TKT-981240-01-V1-1a2b3c',
    qrPayload: 'DI|TKT-2026-981240-01|V1|1a2b3c4d5e6f',
    secureHash: 'f4b321a0823901bce471029abde1230192',
    status: 'REVOGADA_TRANSFERENCIA',
    issuedAt: '2026-09-15T14:20:05Z',
    revokedAt: '2026-09-15T15:10:00Z',
    revocationReason: 'Transferência de titularidade para Lucas Fernandes Pereira'
  },
  {
    id: 'CRED-TKT-981240-01-V2',
    ticketId: 'TKT-2026-981240-01',
    version: 2,
    code: 'SEC-TKT-981240-01-V2-7d8a9e',
    qrPayload: 'DI|TKT-2026-981240-01|V2|7d8a9ef01234',
    secureHash: 'a8b92019c81726aefd90128390123456789',
    status: 'ATIVA',
    issuedAt: '2026-09-15T15:10:00Z'
  },
  {
    id: 'CRED-TKT-981240-02-V1',
    ticketId: 'TKT-2026-981240-02',
    version: 1,
    code: 'SEC-TKT-981240-02-V1-3b4c5d',
    qrPayload: 'DI|TKT-2026-981240-02|V1|3b4c5d6e7f8a',
    secureHash: 'bb928172901293810293810293812093812',
    status: 'CONSUMIDA',
    issuedAt: '2026-09-15T14:20:05Z'
  },
  {
    id: 'CRED-TKT-981241-01-V1',
    ticketId: 'TKT-2026-981241-01',
    version: 1,
    code: 'SEC-TKT-981241-01-V1-9f1e2a',
    qrPayload: 'DI|TKT-2026-981241-01|V1|9f1e2a3b4c5d',
    secureHash: 'cc102938475610293847561029384756102',
    status: 'ATIVA',
    issuedAt: '2026-09-15T14:22:10Z'
  },
  {
    id: 'CRED-TKT-981242-01-V1',
    ticketId: 'TKT-2026-981242-01',
    version: 1,
    code: 'SEC-TKT-981242-01-V1-8c7b6a',
    qrPayload: 'DI|TKT-2026-981242-01|V1|8c7b6a5d4e3f',
    secureHash: 'dd192837465019283746501928374650192',
    status: 'REVOGADA_CANCELAMENTO',
    issuedAt: '2026-09-15T14:26:00Z',
    revokedAt: '2026-09-15T16:00:00Z',
    revocationReason: 'Bloqueio preventivo pelo operador de segurança'
  }
]

let transfers: MockTransfer[] = [
  {
    id: 'TRF-2026-001',
    ticketId: 'TKT-2026-981240-01',
    fromHolderName: 'Maria Silva Santos',
    fromHolderDocument: '049.281.938-12',
    fromHolderEmail: 'maria.santos@email.com.br',
    toHolderName: 'Lucas Fernandes Pereira',
    toHolderDocument: '512.981.234-99',
    toHolderEmail: 'lucas.pereira@email.com',
    toHolderPhone: '(41) 99182-3344',
    transferredAt: '2026-09-15T15:10:00Z',
    transferredBy: 'COMPRADOR',
    oldCredentialVersion: 1,
    newCredentialVersion: 2,
    notes: 'Transferência solicitada via aplicativo pelo comprador titular'
  }
]

// Portões e Dispositivos de Acesso
let gates = [
  {
    id: 'GATE-SUL-01',
    eventId: 1,
    name: 'Portão Sul (Principal)',
    location: 'Acesso Avenidas Silva Jardim × Marechal Floriano',
    sectorsAllowed: ['Plateia Premium A', 'Camarote Lateral B', 'Pista Superior'],
    status: 'ONLINE',
    activeDevicesCount: 6,
    totalEntriesCount: 1420,
    entriesLastHour: 380
  },
  {
    id: 'GATE-NORTE-02',
    eventId: 1,
    name: 'Portão Norte (VIP & Acessibilidade)',
    location: 'Acesso Rua Engenheiros Rebouças',
    sectorsAllowed: ['Plateia Premium A', 'Camarote Lateral B'],
    status: 'ONLINE',
    activeDevicesCount: 3,
    totalEntriesCount: 640,
    entriesLastHour: 195
  },
  {
    id: 'GATE-LESTE-03',
    eventId: 1,
    name: 'Portão Leste (Pista Superior & Promocional)',
    location: 'Acesso Praça Afonso Camargo',
    sectorsAllowed: ['Pista Superior'],
    status: 'ONLINE',
    activeDevicesCount: 4,
    totalEntriesCount: 890,
    entriesLastHour: 230
  }
]

let devices = [
  {
    id: 'DEV-COL-01',
    gateId: 'GATE-SUL-01',
    gateName: 'Portão Sul (Principal)',
    name: 'Coletor Android Portaria 01',
    deviceType: 'COLETOR_ANDROID',
    operatorId: 'OP-401',
    operatorName: 'Juliana Castro',
    batteryLevel: 94,
    isCharging: false,
    syncStatus: 'SINCRONIZADO',
    cachedTicketsCount: 4800,
    pendingValidationsCount: 0,
    lastHeartbeat: new Date().toISOString()
  },
  {
    id: 'DEV-CAT-02',
    gateId: 'GATE-SUL-01',
    gateName: 'Portão Sul (Principal)',
    name: 'Catraca Ótica Automatizada 02',
    deviceType: 'CATRACA_ELETRONICA',
    operatorId: 'OP-SYS-AUTO',
    operatorName: 'Controle de Acesso Automático',
    batteryLevel: 100,
    isCharging: true,
    syncStatus: 'SINCRONIZADO',
    cachedTicketsCount: 4800,
    pendingValidationsCount: 0,
    lastHeartbeat: new Date().toISOString()
  },
  {
    id: 'DEV-APP-03',
    gateId: 'GATE-NORTE-02',
    gateName: 'Portão Norte (VIP & Acessibilidade)',
    name: 'Disk Acesso Móvel VIP 01',
    deviceType: 'APP_DISK_ACESSO',
    operatorId: 'OP-502',
    operatorName: 'Rodrigo Medeiros (Supervisor)',
    batteryLevel: 78,
    isCharging: false,
    syncStatus: 'SINCRONIZADO',
    cachedTicketsCount: 4800,
    pendingValidationsCount: 0,
    lastHeartbeat: new Date().toISOString()
  }
]

let validationLogs = [
  {
    id: 'VAL-99120',
    ticketId: 'TKT-2026-981240-02',
    credentialVersion: 1,
    credentialCode: 'SEC-TKT-981240-02-V1-3b4c5d',
    holderName: 'Maria Silva Santos',
    sector: 'Plateia Premium A',
    gateId: 'GATE-SUL-01',
    gateName: 'Portão Sul (Principal)',
    deviceId: 'DEV-CAT-02',
    operatorName: 'Catraca Ótica Automatizada 02',
    result: 'PERMITIDO',
    resultMessage: 'Entrada autorizada com sucesso',
    validatedAt: '2026-09-15T17:45:12Z',
    isOffline: false
  }
]

let conflicts = [
  {
    id: 'CONF-001',
    ticketId: 'TKT-2026-981240-01',
    holderName: 'Lucas Fernandes Pereira',
    sector: 'Plateia Premium A',
    reason: 'VERSAO_ANTERIOR_APRESENTADA',
    reasonLabelPtBr: 'Credencial Revogada (Tentativa de usar versão v1 após transferência)',
    status: 'RESOLVIDO_BARRADO',
    firstEntry: {
      gateName: 'Portão Sul',
      deviceName: 'Coletor 01',
      operatorName: 'Juliana Castro',
      at: '2026-09-15T17:30:00Z'
    },
    conflictAttempt: {
      gateName: 'Portão Sul',
      deviceName: 'Coletor 02',
      operatorName: 'Juliana Castro',
      at: '2026-09-15T17:30:15Z'
    },
    resolutionNotes: 'Portador da credencial v1 antiga foi orientado a procurar o titular com a versão v2 ativa.',
    resolvedAt: '2026-09-15T17:32:00Z',
    resolvedBy: 'Rodrigo Medeiros (Supervisor)'
  }
]

// ----------------------------------------------------------------------------
// ENDPOINTS DE INGRESSOS
// ----------------------------------------------------------------------------

// 1. Listar Ingressos
ticketsAccessRouter.get('/', (req: Request, res: Response) => {
  const { q, eventId, status, sector } = req.query
  let result = [...tickets]

  if (eventId) {
    result = result.filter(t => t.eventId === Number(eventId))
  }
  if (status && status !== 'TODOS') {
    result = result.filter(t => t.status === status)
  }
  if (sector && sector !== 'TODOS') {
    result = result.filter(t => t.sector === sector)
  }
  if (q && typeof q === 'string') {
    const s = q.toLowerCase()
    result = result.filter(
      t =>
        t.id.toLowerCase().includes(s) ||
        t.orderId.toLowerCase().includes(s) ||
        t.holderName.toLowerCase().includes(s) ||
        t.holderDocument.includes(s) ||
        t.buyerName.toLowerCase().includes(s) ||
        t.currentCredentialCode.toLowerCase().includes(s)
    )
  }

  res.json({
    success: true,
    total: result.length,
    data: result
  })
})

// 2. Detalhes do Ingresso + Histórico de Credenciais e Transferências
ticketsAccessRouter.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  if (id === 'access') return next()
  const ticket = tickets.find(t => t.id === id)
  if (!ticket) {
    return res.status(404).json({ success: false, error: 'Ingresso não encontrado.' })
  }

  const ticketCredentials = credentials.filter(c => c.ticketId === id)
  const ticketTransfers = transfers.filter(t => t.ticketId === id)

  res.json({
    success: true,
    ticket,
    credentials: ticketCredentials,
    transfers: ticketTransfers
  })
})

// 3. Transferir Titularidade (Comprador ≠ Titular + Revoga v(N) e Ativa v(N+1))
ticketsAccessRouter.post('/:id/transfer', (req: Request, res: Response) => {
  const { id } = req.params
  const { newHolderName, newHolderDocument, newHolderEmail, newHolderPhone, transferredBy, notes } = req.body

  if (!newHolderName || !newHolderDocument || !newHolderEmail) {
    return res.status(400).json({
      success: false,
      error: 'Nome, CPF e e-mail do novo titular são obrigatórios para transferência.'
    })
  }

  const ticketIndex = tickets.findIndex(t => t.id === id)
  if (ticketIndex === -1) {
    return res.status(404).json({ success: false, error: 'Ingresso não encontrado.' })
  }

  const ticket = tickets[ticketIndex]
  if (ticket.status === 'UTILIZADO') {
    return res.status(400).json({
      success: false,
      error: 'Não é possível transferir um ingresso que já realizou check-in no evento.'
    })
  }
  if (ticket.status === 'CANCELADO' || ticket.status === 'BLOQUEADO') {
    return res.status(400).json({
      success: false,
      error: `Ingresso com status ${ticket.status} não pode ser transferido.`
    })
  }

  // Revoga a credencial ativa anterior
  const previousVersion = ticket.currentCredentialVersion
  const activeCred = credentials.find(c => c.ticketId === id && c.status === 'ATIVA')
  if (activeCred) {
    activeCred.status = 'REVOGADA_TRANSFERENCIA'
    activeCred.revokedAt = new Date().toISOString()
    activeCred.revocationReason = `Transferência de titularidade para ${newHolderName} (${newHolderDocument})`
  }

  // Emite nova versão v(N+1)
  const nextVersion = previousVersion + 1
  const randomSalt = crypto.randomBytes(3).toString('hex')
  const newCredentialCode = `SEC-${ticket.id}-V${nextVersion}-${randomSalt}`
  const newQrPayload = `DI|${ticket.id}|V${nextVersion}|${crypto.randomBytes(6).toString('hex')}`

  const newCredential: MockCredential = {
    id: `CRED-${ticket.id}-V${nextVersion}`,
    ticketId: ticket.id,
    version: nextVersion,
    code: newCredentialCode,
    qrPayload: newQrPayload,
    secureHash: crypto.createHash('sha256').update(newCredentialCode).digest('hex'),
    status: 'ATIVA',
    issuedAt: new Date().toISOString()
  }
  credentials.push(newCredential)

  // Registra no histórico de transferências
  const transferRecord: MockTransfer = {
    id: `TRF-${Date.now().toString().slice(-6)}`,
    ticketId: ticket.id,
    fromHolderName: ticket.holderName,
    fromHolderDocument: ticket.holderDocument,
    fromHolderEmail: ticket.holderEmail,
    toHolderName: newHolderName,
    toHolderDocument: newHolderDocument,
    toHolderEmail: newHolderEmail,
    toHolderPhone: newHolderPhone || '',
    transferredAt: new Date().toISOString(),
    transferredBy: transferredBy || 'OPERADOR_SAC',
    oldCredentialVersion: previousVersion,
    newCredentialVersion: nextVersion,
    notes: notes || 'Transferência realizada com auditoria Disk Core.'
  }
  transfers.push(transferRecord)

  // Atualiza o registro do ingresso
  tickets[ticketIndex] = {
    ...ticket,
    holderName: newHolderName,
    holderDocument: newHolderDocument,
    holderEmail: newHolderEmail,
    holderPhone: newHolderPhone || ticket.holderPhone,
    status: 'ATIVO',
    statusLabelPtBr: 'Ativo para Entrada',
    currentCredentialVersion: nextVersion,
    currentCredentialCode: newCredentialCode,
    transferCount: ticket.transferCount + 1,
    updatedAt: new Date().toISOString()
  }

  res.json({
    success: true,
    message: 'Titularidade transferida com sucesso. Nova credencial gerada e versão anterior revogada.',
    ticket: tickets[ticketIndex],
    newCredential,
    transfer: transferRecord
  })
})

// 4. Reemissão Segura Antifraude (Invalida v(N) e Emite v(N+1) mantendo titular)
ticketsAccessRouter.post('/:id/reissue', (req: Request, res: Response) => {
  const { id } = req.params
  const { reason } = req.body

  const ticketIndex = tickets.findIndex(t => t.id === id)
  if (ticketIndex === -1) {
    return res.status(404).json({ success: false, error: 'Ingresso não encontrado.' })
  }

  const ticket = tickets[ticketIndex]
  if (ticket.status === 'UTILIZADO') {
    return res.status(400).json({
      success: false,
      error: 'Ingresso já utilizado não pode ser reemitido.'
    })
  }

  // Revoga a credencial anterior
  const previousVersion = ticket.currentCredentialVersion
  const activeCred = credentials.find(c => c.ticketId === id && c.status === 'ATIVA')
  if (activeCred) {
    activeCred.status = 'REVOGADA_REEMISSAO'
    activeCred.revokedAt = new Date().toISOString()
    activeCred.revocationReason = reason || 'Reemissão preventiva antifraude solicitada pelo operador.'
  }

  // Emite nova versão v(N+1)
  const nextVersion = previousVersion + 1
  const randomSalt = crypto.randomBytes(3).toString('hex')
  const newCredentialCode = `SEC-${ticket.id}-V${nextVersion}-${randomSalt}`
  const newQrPayload = `DI|${ticket.id}|V${nextVersion}|${crypto.randomBytes(6).toString('hex')}`

  const newCredential: MockCredential = {
    id: `CRED-${ticket.id}-V${nextVersion}`,
    ticketId: ticket.id,
    version: nextVersion,
    code: newCredentialCode,
    qrPayload: newQrPayload,
    secureHash: crypto.createHash('sha256').update(newCredentialCode).digest('hex'),
    status: 'ATIVA',
    issuedAt: new Date().toISOString()
  }
  credentials.push(newCredential)

  tickets[ticketIndex] = {
    ...ticket,
    status: 'ATIVO',
    statusLabelPtBr: 'Ativo para Entrada (Reemitido)',
    currentCredentialVersion: nextVersion,
    currentCredentialCode: newCredentialCode,
    updatedAt: new Date().toISOString()
  }

  res.json({
    success: true,
    message: 'Ingresso reemitido com sucesso. QR Code anterior foi revogado e não permitirá entrada.',
    ticket: tickets[ticketIndex],
    newCredential
  })
})

// 5. Bloquear / Cancelar Ingresso (Revoga Credencial Ativa Imediatamente)
ticketsAccessRouter.post('/:id/block', (req: Request, res: Response) => {
  const { id } = req.params
  const { reason, action } = req.body // action: 'BLOQUEAR' | 'CANCELAR'

  const ticketIndex = tickets.findIndex(t => t.id === id)
  if (ticketIndex === -1) {
    return res.status(404).json({ success: false, error: 'Ingresso não encontrado.' })
  }

  const ticket = tickets[ticketIndex]
  const newStatus = action === 'CANCELAR' ? 'CANCELADO' : 'BLOQUEADO'
  const newLabel = action === 'CANCELAR' ? 'Cancelado pelo Sistema' : 'Bloqueado Administrativamente'

  // Revoga credencial ativa
  const activeCred = credentials.find(c => c.ticketId === id && c.status === 'ATIVA')
  if (activeCred) {
    activeCred.status = 'REVOGADA_CANCELAMENTO'
    activeCred.revokedAt = new Date().toISOString()
    activeCred.revocationReason = reason || `${newStatus} pelo operador de segurança.`
  }

  tickets[ticketIndex] = {
    ...ticket,
    status: newStatus,
    statusLabelPtBr: newLabel,
    updatedAt: new Date().toISOString()
  }

  res.json({
    success: true,
    message: `Ingresso ${newStatus.toLowerCase()} com sucesso. Qualquer credencial QR code vinculada foi revogada.`,
    ticket: tickets[ticketIndex]
  })
})

// ----------------------------------------------------------------------------
// ENDPOINTS DO CONTROLE DE ACESSO (DISK ACESSO)
// ----------------------------------------------------------------------------

// 6. Resumo Executivo de Controle de Acesso
ticketsAccessRouter.get('/access/summary', (req: Request, res: Response) => {
  const total = tickets.length
  const active = tickets.filter(t => t.status === 'ATIVO' || t.status === 'REEMITIDO').length
  const used = tickets.filter(t => t.status === 'UTILIZADO').length
  const transferred = tickets.filter(t => t.transferCount > 0).length
  const reissued = credentials.filter(c => c.status === 'REVOGADA_REEMISSAO').length
  const blocked = tickets.filter(t => t.status === 'BLOQUEADO' || t.status === 'CANCELADO').length
  const activeConflicts = conflicts.filter(c => c.status === 'PENDENTE').length

  res.json({
    success: true,
    summary: {
      totalTickets: total,
      activeTickets: active,
      usedTickets: used,
      reissuedTickets: reissued,
      transferredTickets: transferred,
      blockedTickets: blocked,
      checkinPercentage: total > 0 ? Number(((used / total) * 100).toFixed(1)) : 0,
      liveGatesOnline: gates.filter(g => g.status === 'ONLINE').length,
      devicesConnected: devices.length,
      activeConflictsCount: activeConflicts
    }
  })
})

// 7. Listar Portões
ticketsAccessRouter.get('/access/gates', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: gates
  })
})

// 8. Listar Dispositivos (Coletores e Catracas)
ticketsAccessRouter.get('/access/devices', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: devices
  })
})

// 9. Histórico de Validações
ticketsAccessRouter.get('/access/validations', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: validationLogs.slice().reverse()
  })
})

// 10. Central de Conflitos
ticketsAccessRouter.get('/access/conflicts', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: conflicts
  })
})

// 11. Resolver Conflito de Acesso
ticketsAccessRouter.post('/access/conflicts/:id/resolve', (req: Request, res: Response) => {
  const { id } = req.params
  const { resolution, notes, resolvedBy } = req.body // resolution: 'RESOLVIDO_ACESSO_CONFIRMADO' | 'RESOLVIDO_BARRADO'

  const confIndex = conflicts.findIndex(c => c.id === id)
  if (confIndex === -1) {
    return res.status(404).json({ success: false, error: 'Conflito não encontrado.' })
  }

  conflicts[confIndex] = {
    ...conflicts[confIndex],
    status: resolution || 'RESOLVIDO_BARRADO',
    resolutionNotes: notes || 'Conflito resolvido pela supervisão de portaria.',
    resolvedAt: new Date().toISOString(),
    resolvedBy: resolvedBy || 'Supervisor de Portaria'
  }

  res.json({
    success: true,
    message: 'Conflito de acesso atualizado com sucesso.',
    conflict: conflicts[confIndex]
  })
})

// 12. Validador Ótico de Acesso (Simulação da Catraca / App Disk Acesso)
ticketsAccessRouter.post('/access/validate', (req: Request, res: Response) => {
  const {
    credentialCode,
    gateId,
    deviceId,
    operatorName,
    isOffline,
    supervisorOverride,
    overrideReason
  } = req.body

  if (!credentialCode) {
    return res.status(400).json({ success: false, error: 'Código de validação é obrigatório.' })
  }

  const gate = gates.find(g => g.id === gateId) || gates[0]
  const device = devices.find(d => d.id === deviceId) || devices[0]
  const opName = operatorName || device.operatorName

  // Busca a credencial correspondente
  const cred = credentials.find(c => c.code === credentialCode || c.qrPayload.includes(credentialCode))

  if (!cred) {
    const logEntry = {
      id: `VAL-${Date.now().toString().slice(-6)}`,
      ticketId: 'DESCONHECIDO',
      credentialVersion: 0,
      credentialCode,
      holderName: 'Não Identificado',
      sector: 'Indefinido',
      gateId: gate.id,
      gateName: gate.name,
      deviceId: device.id,
      operatorName: opName,
      result: 'REVOGADO' as const,
      resultMessage: 'Código QR não reconhecido pela base de dados do Disk Core.',
      validatedAt: new Date().toISOString(),
      isOffline: Boolean(isOffline)
    }
    validationLogs.push(logEntry)
    return res.json({
      success: false,
      result: 'REVOGADO',
      message: 'Código de validação inválido ou não encontrado.',
      log: logEntry
    })
  }

  const ticketIndex = tickets.findIndex(t => t.id === cred.ticketId)
  if (ticketIndex === -1) {
    return res.status(404).json({ success: false, error: 'Ingresso correspondente não existe.' })
  }
  const ticket = tickets[ticketIndex]

  // Supervisor Override
  if (supervisorOverride) {
    const logEntry = {
      id: `VAL-${Date.now().toString().slice(-6)}`,
      ticketId: ticket.id,
      credentialVersion: cred.version,
      credentialCode: cred.code,
      holderName: ticket.holderName,
      sector: ticket.sector,
      gateId: gate.id,
      gateName: gate.name,
      deviceId: device.id,
      operatorName: opName,
      result: 'OVERRIDE_SUPERVISOR' as const,
      resultMessage: `Liberação manual autorizada pelo supervisor. Justificativa: ${overrideReason || 'Liberação direta em catraca'}`,
      validatedAt: new Date().toISOString(),
      isOffline: Boolean(isOffline),
      supervisorOverrideReason: overrideReason || 'Liberação manual pelo supervisor'
    }
    validationLogs.push(logEntry)

    tickets[ticketIndex] = {
      ...ticket,
      status: 'UTILIZADO',
      statusLabelPtBr: 'Check-in Realizado (Override)',
      checkInAt: new Date().toISOString(),
      checkInGate: gate.name,
      checkInDevice: device.name,
      checkInOperator: opName,
      updatedAt: new Date().toISOString()
    }

    return res.json({
      success: true,
      result: 'OVERRIDE_SUPERVISOR',
      message: 'Entrada autorizada via Override de Supervisor.',
      ticket: tickets[ticketIndex],
      log: logEntry
    })
  }

  // Validação: Credencial Revogada
  if (cred.status !== 'ATIVA') {
    const logEntry = {
      id: `VAL-${Date.now().toString().slice(-6)}`,
      ticketId: ticket.id,
      credentialVersion: cred.version,
      credentialCode: cred.code,
      holderName: ticket.holderName,
      sector: ticket.sector,
      gateId: gate.id,
      gateName: gate.name,
      deviceId: device.id,
      operatorName: opName,
      result: 'REVOGADO' as const,
      resultMessage: `Credencial revogada (${cred.status}). Motivo: ${cred.revocationReason || 'Versão substituída'}`,
      validatedAt: new Date().toISOString(),
      isOffline: Boolean(isOffline)
    }
    validationLogs.push(logEntry)

    // Cria conflito para análise de portaria se for versão anterior
    if (cred.version < ticket.currentCredentialVersion) {
      conflicts.push({
        id: `CONF-${Date.now().toString().slice(-6)}`,
        ticketId: ticket.id,
        holderName: ticket.holderName,
        sector: ticket.sector,
        reason: 'VERSAO_ANTERIOR_APRESENTADA',
        reasonLabelPtBr: `Apresentada versão v${cred.version}, mas versão ativa é v${ticket.currentCredentialVersion}`,
        status: 'PENDENTE',
        firstEntry: {
          gateName: gate.name,
          deviceName: device.name,
          operatorName: opName,
          at: new Date().toISOString()
        },
        conflictAttempt: {
          gateName: gate.name,
          deviceName: device.name,
          operatorName: opName,
          at: new Date().toISOString()
        }
      })
    }

    return res.json({
      success: false,
      result: 'REVOGADO',
      message: `Acesso negado: Credencial Revogada (versão v${cred.version}). A versão ativa é a v${ticket.currentCredentialVersion}.`,
      log: logEntry
    })
  }

  // Validação: Ingresso Cancelado ou Bloqueado
  if (ticket.status === 'BLOQUEADO' || ticket.status === 'CANCELADO') {
    const logEntry = {
      id: `VAL-${Date.now().toString().slice(-6)}`,
      ticketId: ticket.id,
      credentialVersion: cred.version,
      credentialCode: cred.code,
      holderName: ticket.holderName,
      sector: ticket.sector,
      gateId: gate.id,
      gateName: gate.name,
      deviceId: device.id,
      operatorName: opName,
      result: 'CANCELADO' as const,
      resultMessage: `Ingresso com status ${ticket.status} no Disk Core. Entrada bloqueada.`,
      validatedAt: new Date().toISOString(),
      isOffline: Boolean(isOffline)
    }
    validationLogs.push(logEntry)

    return res.json({
      success: false,
      result: 'CANCELADO',
      message: `Acesso negado: Ingresso bloqueado ou cancelado (${ticket.statusLabelPtBr}).`,
      log: logEntry
    })
  }

  // Validação: Ingresso Já Utilizado (Dupla Entrada)
  if (ticket.status === 'UTILIZADO') {
    const logEntry = {
      id: `VAL-${Date.now().toString().slice(-6)}`,
      ticketId: ticket.id,
      credentialVersion: cred.version,
      credentialCode: cred.code,
      holderName: ticket.holderName,
      sector: ticket.sector,
      gateId: gate.id,
      gateName: gate.name,
      deviceId: device.id,
      operatorName: opName,
      result: 'DUPLICADO' as const,
      resultMessage: `Tentativa de reuso. Ingresso já utilizado em ${ticket.checkInAt} no ${ticket.checkInGate}.`,
      validatedAt: new Date().toISOString(),
      isOffline: Boolean(isOffline)
    }
    validationLogs.push(logEntry)

    // Cria conflito na central de conflitos
    conflicts.push({
      id: `CONF-${Date.now().toString().slice(-6)}`,
      ticketId: ticket.id,
      holderName: ticket.holderName,
      sector: ticket.sector,
      reason: 'DUPLA_ENTRADA_MESMO_INGRESSO',
      reasonLabelPtBr: 'Tentativa de reuso de ingresso já validado anteriormente',
      status: 'PENDENTE',
      firstEntry: {
        gateName: ticket.checkInGate || 'Portão Anterior',
        deviceName: ticket.checkInDevice || 'Catraca',
        operatorName: ticket.checkInOperator || 'Operador',
        at: ticket.checkInAt || 'Horário anterior'
      },
      conflictAttempt: {
        gateName: gate.name,
        deviceName: device.name,
        operatorName: opName,
        at: new Date().toISOString()
      }
    })

    return res.json({
      success: false,
      result: 'DUPLICADO',
      message: `Alerta de Duplicidade: Ingresso já deu entrada em ${ticket.checkInAt} no ${ticket.checkInGate}!`,
      log: logEntry
    })
  }

  // Validação: Setor do Portão
  if (!gate.sectorsAllowed.includes(ticket.sector)) {
    const logEntry = {
      id: `VAL-${Date.now().toString().slice(-6)}`,
      ticketId: ticket.id,
      credentialVersion: cred.version,
      credentialCode: cred.code,
      holderName: ticket.holderName,
      sector: ticket.sector,
      gateId: gate.id,
      gateName: gate.name,
      deviceId: device.id,
      operatorName: opName,
      result: 'SETOR_INVALIDO' as const,
      resultMessage: `Portão incorreto para o setor "${ticket.sector}". Portões autorizados: ${gate.sectorsAllowed.join(', ')}`,
      validatedAt: new Date().toISOString(),
      isOffline: Boolean(isOffline)
    }
    validationLogs.push(logEntry)

    return res.json({
      success: false,
      result: 'SETOR_INVALIDO',
      message: `Acesso não permitido neste portão. O setor do ingresso é "${ticket.sector}".`,
      log: logEntry
    })
  }

  // Sucesso: Validação Autorizada
  cred.status = 'CONSUMIDA'
  tickets[ticketIndex] = {
    ...ticket,
    status: 'UTILIZADO',
    statusLabelPtBr: 'Check-in Realizado',
    checkInAt: new Date().toISOString(),
    checkInGate: gate.name,
    checkInDevice: device.name,
    checkInOperator: opName,
    updatedAt: new Date().toISOString()
  }

  const logEntry = {
    id: `VAL-${Date.now().toString().slice(-6)}`,
    ticketId: ticket.id,
    credentialVersion: cred.version,
    credentialCode: cred.code,
    holderName: ticket.holderName,
    sector: ticket.sector,
    gateId: gate.id,
    gateName: gate.name,
    deviceId: device.id,
    operatorName: opName,
    result: 'PERMITIDO' as const,
    resultMessage: 'Validação ótica confirmada. Catraca liberada.',
    validatedAt: new Date().toISOString(),
    isOffline: Boolean(isOffline)
  }
  validationLogs.push(logEntry)

  // Incrementa contadores
  gate.totalEntriesCount += 1
  gate.entriesLastHour += 1

  res.json({
    success: true,
    result: 'PERMITIDO',
    message: `Acesso Liberado! Bem-vindo(a), ${ticket.holderName}.`,
    ticket: tickets[ticketIndex],
    log: logEntry
  })
})
