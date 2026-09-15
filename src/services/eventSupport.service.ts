import type {
  EventSupportRequest,
  EventDossier,
  EventBuilderStep,
  SeatingMap,
  SeatItem,
  MapSector,
  VenueItem,
  EventReadinessScore,
  EventAuditLog,
  SeatStatus
} from '../types/event-support.types'

const mockRequests: EventSupportRequest[] = [
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

const mockSteps: EventBuilderStep[] = [
  { id: 1, key: 'geral', title: '01. Dados Gerais', category: 'Geral', status: 'concluido', summary: 'Nome, descrição, classificação indicativa e release cadastrados', required: true, itemsCompleted: 6, itemsTotal: 6 },
  { id: 2, key: 'local', title: '02. Local e Venue', category: 'Geral', status: 'concluido', summary: 'Teatro Positivo selecionado com endereço e capacidade validados', required: true, itemsCompleted: 4, itemsTotal: 4 },
  { id: 3, key: 'sessoes', title: '03. Sessões e Horários', category: 'Geral', status: 'concluido', summary: '1 sessão definida para 25/10/2026 20:30 (portões 19:00)', required: true, itemsCompleted: 3, itemsTotal: 3 },
  { id: 4, key: 'mapa', title: '04. Disk Maps (Mapa de Assentos)', category: 'Mapa', status: 'concluido', summary: 'Mapa base auditório configurado com 2.400 lugares identificados', required: true, itemsCompleted: 5, itemsTotal: 5 },
  { id: 5, key: 'setores', title: '05. Setores e Categorias', category: 'Mapa', status: 'concluido', summary: '4 setores configurados (Plateia Premium, Geral, Balcão Nobre, Balcão)', required: true, itemsCompleted: 4, itemsTotal: 4 },
  { id: 6, key: 'inventario', title: '06. Inventário de Ingressos', category: 'Comercial', status: 'concluido', summary: '2.400 unidades sincronizadas e vinculadas às cadeiras', required: true, itemsCompleted: 5, itemsTotal: 5 },
  { id: 7, key: 'lotes', title: '07. Lotes de Venda', category: 'Comercial', status: 'concluido', summary: 'Lote 1 (abertura) e Lote 2 configurados com virada por data/venda', required: true, itemsCompleted: 3, itemsTotal: 3 },
  { id: 8, key: 'precos', title: '08. Modalidades e Preços', category: 'Comercial', status: 'concluido', summary: 'Inteira, Meia-Entrada legal, ClubeDisk e Social cadastrados', required: true, itemsCompleted: 4, itemsTotal: 4 },
  { id: 9, key: 'financeiro', title: '09. Configuração Financeira', category: 'Financeiro', status: 'concluido', summary: 'Conta bancária homologada, taxas negociadas e split de conveniência', required: true, itemsCompleted: 4, itemsTotal: 4 },
  { id: 10, key: 'conteudo', title: '10. Mídias e Imagens', category: 'Conteudo', status: 'concluido', summary: 'Banner home (1920x800), card e flyer nos padrões da nova dawn', required: true, itemsCompleted: 3, itemsTotal: 3 },
  { id: 11, key: 'marketing', title: '11. Marketing & Pixels', category: 'Conteudo', status: 'alerta', summary: 'Pixel Meta configurado; Pixel Google Analytics pendente de ID', required: false, itemsCompleted: 1, itemsTotal: 2 },
  { id: 12, key: 'operacao', title: '12. Controle de Acesso', category: 'Operacao', status: 'concluido', summary: '4 portões definidos e regras de leitura offline pré-configuradas', required: true, itemsCompleted: 3, itemsTotal: 3 },
  { id: 13, key: 'homologacao', title: '13. Homologação e Publicação', category: 'Homologacao', status: 'em_andamento', summary: 'Validações automáticas aprovadas; aguardando aceite final do produtor', required: true, itemsCompleted: 4, itemsTotal: 5 }
]

const mockSectors: MapSector[] = [
  { id: 'sec-prem', name: 'Plateia Premium', color: '#8b5cf6', capacity: 60, basePrice: 280, type: 'MARCADO' },
  { id: 'sec-geral', name: 'Plateia Geral', color: '#3b82f6', capacity: 60, basePrice: 190, type: 'MARCADO' },
  { id: 'sec-balc-nobre', name: 'Balcão Nobre', color: '#10b981', capacity: 36, basePrice: 140, type: 'MARCADO' },
  { id: 'sec-balc-sup', name: 'Balcão Superior', color: '#f59e0b', capacity: 36, basePrice: 90, type: 'MARCADO' }
]

// Gerador de assentos matriciais para o teatro de demonstração
function generateMockSeats(): SeatItem[] {
  const seats: SeatItem[] = []
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

  rows.forEach((row, rowIndex) => {
    let sectorId = 'sec-prem'
    let price = 280
    if (rowIndex >= 3 && rowIndex < 6) {
      sectorId = 'sec-geral'
      price = 190
    } else if (rowIndex >= 6 && rowIndex < 8) {
      sectorId = 'sec-balc-nobre'
      price = 140
    } else if (rowIndex >= 8) {
      sectorId = 'sec-balc-sup'
      price = 90
    }

    for (let num = 1; num <= 16; num++) {
      let status: SeatStatus = 'AVAILABLE'
      if (rowIndex === 0 && (num === 7 || num === 8)) {
        status = 'SOLD'
      } else if (rowIndex === 1 && num === 5) {
        status = 'HELD'
      } else if (rowIndex === 2 && num === 1) {
        status = 'COURTESY'
      } else if (rowIndex === 4 && (num === 8 || num === 9)) {
        status = 'BLOCKED'
      }

      seats.push({
        id: `seat-${row}-${num}`,
        sectorId,
        row,
        number: num,
        status,
        price,
        ticketType: status === 'COURTESY' ? 'Cortesia' : 'Inteira',
        isAccessible: (row === 'A' && (num === 1 || num === 16))
      })
    }
  })

  return seats
}

export const eventSupportService = {
  getRequests(): EventSupportRequest[] {
    return mockRequests
  },

  getDossier(requestId: string): EventDossier {
    const request = mockRequests.find((r) => r.id === requestId) || mockRequests[0]
    const seats = generateMockSeats()
    const sold = seats.filter((s) => s.status === 'SOLD').length
    const held = seats.filter((s) => s.status === 'HELD').length
    const blocked = seats.filter((s) => s.status === 'BLOCKED' || s.status === 'TECHNICAL_HOLD').length
    const available = seats.filter((s) => s.status === 'AVAILABLE').length

    const seatingMap: SeatingMap = {
      id: 'map-tp-001',
      venueId: 'ven-001',
      venueName: request.venueName,
      name: 'Mapa Auditório Clássico v2',
      version: 'v2.4',
      type: 'ASSENTO_MARCADO',
      sectors: mockSectors,
      seats,
      totalCapacity: seats.length,
      totalSold: sold,
      totalHeld: held,
      totalBlocked: blocked,
      totalAvailable: available,
      lastModified: '14/09/2026 16:45',
      modifiedBy: request.supportAgent
    }

    const venue: VenueItem = {
      id: 'ven-001',
      name: request.venueName,
      city: request.city,
      state: request.state,
      address: 'Rua Prof. Pedro Viriato Parigot de Souza, 5300 — Campo Comprido',
      maxCapacity: request.capacity,
      availableMapsCount: 3,
      contactPerson: 'Administração Teatro Positivo (41 3317-3000)'
    }

    const readiness: EventReadinessScore = {
      totalPercent: request.readinessScore,
      canPublish: request.readinessScore >= 90,
      blockersCount: request.readinessScore >= 90 ? 0 : 2,
      warningsCount: 1,
      pillars: [
        {
          name: 'Cadastro & Local',
          score: 100,
          weight: 20,
          status: 'OK',
          items: [
            { label: 'Dados gerais e descrição completos', passed: true, required: true },
            { label: 'Local e capacidade física validados', passed: true, required: true },
            { label: 'Classificação indicativa informada', passed: true, required: true }
          ]
        },
        {
          name: 'Mapa & Setores',
          score: 100,
          weight: 25,
          status: 'OK',
          items: [
            { label: 'Capacidade do mapa igual à do evento', passed: true, required: true },
            { label: 'Numeração e coordenadas íntegras', passed: true, required: true },
            { label: 'Assentos acessíveis (PCD) sinalizados', passed: true, required: true }
          ]
        },
        {
          name: 'Comercial & Preços',
          score: 100,
          weight: 20,
          status: 'OK',
          items: [
            { label: 'Lotes de venda configurados', passed: true, required: true },
            { label: 'Preços de inteira e meia homologados', passed: true, required: true },
            { label: 'Inventário sincronizado com mapa', passed: true, required: true }
          ]
        },
        {
          name: 'Financeiro & Bancário',
          score: 100,
          weight: 15,
          status: 'OK',
          items: [
            { label: 'Conta bancária de repasse validada', passed: true, required: true },
            { label: 'Contrato e taxas cadastrados', passed: true, required: true }
          ]
        },
        {
          name: 'Conteúdo & Marketing',
          score: 80,
          weight: 10,
          status: 'ALERTA',
          items: [
            { label: 'Banner home e flyer nas dimensões corretas', passed: true, required: true },
            { label: 'Pixel Meta ativo', passed: true, required: false },
            { label: 'Pixel Google Analytics configurado', passed: false, required: false }
          ]
        },
        {
          name: 'Operação & Acesso',
          score: 100,
          weight: 10,
          status: 'OK',
          items: [
            { label: 'Portões e leitura de QR codes associados', passed: true, required: true },
            { label: 'Controle de catracas parametrizado', passed: true, required: true }
          ]
        }
      ]
    }

    const auditHistory: EventAuditLog[] = [
      {
        id: 'aud-01',
        timestamp: '10/09/2026 14:20:11',
        author: 'Produtor (Opus Entretenimento)',
        systemOrigin: 'DISK',
        action: 'SOLICITACAO_CRIADA',
        newState: 'SOLICITADO',
        notes: 'Formulário de solicitação preenchido com 1 sessão e necessidade de assentos marcados'
      },
      {
        id: 'aud-02',
        timestamp: '11/09/2026 09:12:40',
        author: 'Maria Eduarda (Suporte Disk)',
        systemOrigin: 'DISK_INTERNO',
        action: 'TRIAGEM_INICIADA',
        previousState: 'SOLICITADO',
        newState: 'EM_TRIAGEM',
        notes: 'Documentos do produtor validados, SLA definido para 16/09'
      },
      {
        id: 'aud-03',
        timestamp: '12/09/2026 11:45:00',
        author: 'Maria Eduarda (Suporte Disk)',
        systemOrigin: 'DISK_INTERNO',
        action: 'MAPA_VINCULADO',
        previousState: 'EM_TRIAGEM',
        newState: 'MAPA_EM_CRIACAO',
        notes: 'Mapa base do Grande Auditório Teatro Positivo importado e calibrado'
      },
      {
        id: 'aud-04',
        timestamp: '14/09/2026 16:45:22',
        author: 'Maria Eduarda (Suporte Disk)',
        systemOrigin: 'DISK_INTERNO',
        action: 'SUBMISSAO_HOMOLOGACAO',
        previousState: 'MAPA_EM_CRIACAO',
        newState: 'HOMOLOGACAO',
        notes: 'Event Builder 92% concluído. Pronto para conferência e homologação'
      }
    ]

    return {
      request,
      builderSteps: mockSteps,
      map: seatingMap,
      venue,
      readiness,
      auditHistory
    }
  },

  async getRequestsFromApi(): Promise<EventSupportRequest[]> {
    try {
      const res = await fetch('/api/event-support/requests')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.requests)) {
          return data.requests
        }
      }
    } catch (e) {
      console.warn('[eventSupportService] Fallback na rota /api/event-support/requests:', e)
    }
    return mockRequests
  },

  async createRequest(payload: {
    eventName: string
    producerName?: string
    venueName: string
    city: string
    state: string
    eventDate: string
    capacity: number
    hasMap: boolean
    priority: any
  }): Promise<EventSupportRequest> {
    try {
      const res = await fetch('/api/event-support/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const data = await res.json()
        if (data.request) {
          mockRequests.unshift(data.request)
          return data.request
        }
      }
    } catch (e) {
      console.warn('[eventSupportService] Fallback na criacao de request:', e)
    }

    // Fallback local caso offline
    const count = mockRequests.length + 1
    const localReq: EventSupportRequest = {
      id: `EVT-REQ-2026-00${count}`,
      protocol: `REQ-00${8720 + count}`,
      eventName: payload.eventName,
      producerId: 1,
      producerName: payload.producerName || 'Produtor Autenticado',
      venueName: payload.venueName,
      city: payload.city,
      state: payload.state,
      eventDate: payload.eventDate,
      requestDate: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      supportAgent: 'Maria Eduarda (Suporte Disk)',
      status: 'SOLICITADO',
      priority: payload.priority,
      slaDeadline: '72 horas úteis',
      readinessScore: 35,
      hasMap: payload.hasMap,
      ticketsSold: 0,
      capacity: payload.capacity
    }
    mockRequests.unshift(localReq)
    return localReq
  },

  async publishEvent(eventId: string): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`/api/event-support/events/${eventId}/publish`, {
        method: 'POST'
      })
      if (res.ok) {
        const data = await res.json()
        const target = mockRequests.find((r) => r.id === eventId)
        if (target) {
          target.status = 'PUBLICADO'
          target.readinessScore = 100
        }
        return { ok: true, message: data.message || 'Evento publicado no Disk Core!' }
      }
    } catch (e) {
      console.warn('[eventSupportService] Fallback na publicacao:', e)
    }

    const target = mockRequests.find((r) => r.id === eventId)
    if (target) {
      target.status = 'PUBLICADO'
      target.readinessScore = 100
    }
    return { ok: true, message: 'Evento publicado com sucesso no Disk Core (Modo Local)!' }
  },

  async updateSeatStatus(mapId: string, seatId: string, status: SeatStatus, currentStatus?: SeatStatus): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`/api/event-support/maps/${mapId}/seats/${seatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, currentStatus })
      })
      if (res.ok) {
        const data = await res.json()
        return { ok: true, message: data.message }
      }
      if (res.status === 409) {
        const err = await res.json()
        return { ok: false, message: err.message }
      }
    } catch (e) {
      console.warn('[eventSupportService] Fallback na atualizacao de assento:', e)
    }

    return { ok: true, message: 'Assento atualizado localmente no Disk Maps.' }
  }
}
