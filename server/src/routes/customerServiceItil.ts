// ============================================================================
// ROTAS DA CENTRAL DE CLIENTES & MOTOR ITIL SERVICE DESK (FASE 29.11)
// Disk Core • Gestão de Clientes, SLA, Incidentes, Problemas e Atendimento Omnichannel
// ============================================================================

import { Router, Request, Response } from 'express'

export const customerServiceItilRouter = Router()

// Mock de Clientes Unificados
let customers = [
  {
    id: 'CUST-2026-001',
    name: 'Maria Silva Santos',
    document: '049.281.938-12',
    documentRaw: '04928193812',
    email: 'maria.santos@email.com.br',
    phone: '(41) 98822-1099',
    city: 'Curitiba',
    state: 'PR',
    status: 'ATIVO',
    statusLabelPtBr: 'Cadastro Regular Ativo',
    riskScore: 12,
    rfmSegment: 'VIP Campeão',
    totalSpentCents: 480000,
    ordersCount: 8,
    ticketsCount: 18,
    openCasesCount: 1,
    resolvedCasesCount: 4,
    lastPurchaseDate: '2026-09-15T14:20:00Z',
    createdAt: '2024-03-10T11:00:00Z',
    updatedAt: '2026-09-15T14:25:00Z'
  },
  {
    id: 'CUST-2026-002',
    name: 'Carlos Eduardo Nogueira',
    document: '718.992.100-43',
    documentRaw: '71899210043',
    email: 'carlos.nogueira@adv.com.br',
    phone: '(41) 99911-2233',
    city: 'São José dos Pinhais',
    state: 'PR',
    status: 'ATIVO',
    statusLabelPtBr: 'Cadastro Regular Ativo',
    riskScore: 8,
    rfmSegment: 'Cliente Leal',
    totalSpentCents: 1250000,
    ordersCount: 14,
    ticketsCount: 32,
    openCasesCount: 0,
    resolvedCasesCount: 6,
    lastPurchaseDate: '2026-09-15T14:22:10Z',
    createdAt: '2023-08-15T09:30:00Z',
    updatedAt: '2026-09-15T14:22:10Z'
  },
  {
    id: 'CUST-2026-003',
    name: 'Lucas Fernandes Pereira',
    document: '512.981.234-99',
    documentRaw: '51298123499',
    email: 'lucas.pereira@email.com',
    phone: '(41) 99182-3344',
    city: 'Curitiba',
    state: 'PR',
    status: 'ATIVO',
    statusLabelPtBr: 'Cadastro Regular Ativo',
    riskScore: 15,
    rfmSegment: 'Novo Cliente',
    totalSpentCents: 24000,
    ordersCount: 1,
    ticketsCount: 1,
    openCasesCount: 1,
    resolvedCasesCount: 0,
    lastPurchaseDate: '2026-09-15T15:10:00Z',
    createdAt: '2026-09-15T15:00:00Z',
    updatedAt: '2026-09-15T15:10:00Z'
  },
  {
    id: 'CUST-2026-004',
    name: 'Fernanda Martins Costa',
    document: '331.442.889-01',
    documentRaw: '33144288901',
    email: 'fernanda.costa@empresa.com',
    phone: '(41) 98777-6655',
    city: 'Ponta Grossa',
    state: 'PR',
    status: 'SUSPEITO_FRAUDE',
    statusLabelPtBr: 'Em Monitoramento Antifraude',
    riskScore: 82,
    rfmSegment: 'Em Risco',
    totalSpentCents: 18000,
    ordersCount: 1,
    ticketsCount: 1,
    openCasesCount: 1,
    resolvedCasesCount: 1,
    lastPurchaseDate: '2026-09-15T14:26:00Z',
    createdAt: '2026-09-15T14:20:00Z',
    updatedAt: '2026-09-15T16:00:00Z'
  }
]

// Linha do tempo dos clientes
let customerTimelines = [
  {
    id: 'TL-001',
    customerId: 'CUST-2026-001',
    title: 'Pedido Aprovado via PIX',
    category: 'PEDIDO',
    description: 'Pedido #ORD-928371 no valor de R$ 480,00 aprovado com sucesso via Banco do Brasil PSP.',
    metadata: { orderId: 'ORD-928371', amountCents: 48000 },
    occurredAt: '2026-09-15T14:20:05Z'
  },
  {
    id: 'TL-002',
    customerId: 'CUST-2026-001',
    title: 'Transferência de Titularidade',
    category: 'TRANSFERENCIA',
    description: 'Ingresso TKT-2026-981240-01 transferido para Lucas Fernandes Pereira.',
    metadata: { ticketId: 'TKT-2026-981240-01', newHolder: 'Lucas Fernandes Pereira' },
    occurredAt: '2026-09-15T15:10:00Z'
  },
  {
    id: 'TL-003',
    customerId: 'CUST-2026-001',
    title: 'Check-in Realizado na Portaria',
    category: 'ACESSO',
    description: 'Ingresso TKT-2026-981240-02 validado com sucesso no Portão Sul (Principal).',
    metadata: { ticketId: 'TKT-2026-981240-02', gate: 'Portão Sul' },
    occurredAt: '2026-09-15T17:45:12Z'
  }
]

// Chamados ITIL (Segregação SAC × Suporte a Eventos)
let itilCases = [
  // 1. Chamado do SAC (Consumidor / Comprador Final)
  {
    id: 'CASE-2026-10491',
    protocol: '2026091500101',
    scope: 'SAC_CLIENTE',
    type: 'REQUISICAO_SERVICO',
    typeLabelPtBr: 'Requisição de Serviço',
    title: 'Dúvida sobre confirmação de recebimento do QR Code',
    description: 'Cliente informa que o pagamento PIX foi debitado na conta bancária mas não recebeu o e-mail de confirmação.',
    customerId: 'CUST-2026-001',
    customerName: 'Maria Silva Santos',
    customerDocument: '049.281.938-12',
    customerEmail: 'maria.santos@email.com.br',
    eventId: 1,
    eventName: 'Orquestra Sinfônica — Noite de Clássicos',
    category: 'DUVIDA_INGRESSO',
    priority: 'MEDIA',
    priorityLabelPtBr: 'Prioridade Média',
    status: 'EM_ATENDIMENTO',
    statusLabelPtBr: 'Em Atendimento',
    assignedAgentName: 'Camila Alcantara (SAC Nível 1)',
    assignedQueue: 'Fila Geral de Vendas e Pedidos',
    firstResponseDueAt: '2026-09-15T15:30:00Z',
    resolutionDueAt: '2026-09-15T18:30:00Z',
    firstRespondedAt: '2026-09-15T14:40:00Z',
    slaStatus: 'DENTRO_DO_PRAZO',
    slaStatusLabelPtBr: 'Dentro do Prazo de SLA',
    satisfactionScore: 5,
    createdAt: '2026-09-15T14:30:00Z',
    updatedAt: '2026-09-15T14:40:00Z'
  },
  // 2. Chamado de Suporte a Eventos (Produtor / Equipe Operacional)
  {
    id: 'CASE-2026-10492',
    protocol: '2026091500102',
    scope: 'SUPORTE_EVENTO',
    type: 'INCIDENTE',
    typeLabelPtBr: 'Incidente Operacional',
    title: 'Solicitação de calibragem de sensibilidade na Catraca 02 - Portão Sul',
    description: 'Coordenador de praça solicita verificação no leitor ótico da catraca 02 devido a reflexo no vidro dos celulares.',
    eventId: 1,
    eventName: 'Orquestra Sinfônica — Noite de Clássicos',
    producerId: 101,
    producerName: 'Opus Entretenimento Brasil',
    category: 'INFRA_PORTARIA',
    priority: 'ALTA',
    priorityLabelPtBr: 'Prioridade Alta',
    status: 'EM_ATENDIMENTO',
    statusLabelPtBr: 'Em Atendimento pela Engenharia',
    assignedAgentName: 'Felipe Santana (Operações de Campo)',
    assignedQueue: 'Equipe de Infraestrutura de Praça',
    firstResponseDueAt: '2026-09-15T16:00:00Z',
    resolutionDueAt: '2026-09-15T17:30:00Z',
    firstRespondedAt: '2026-09-15T15:50:00Z',
    slaStatus: 'DENTRO_DO_PRAZO',
    slaStatusLabelPtBr: 'Dentro do Prazo de SLA',
    createdAt: '2026-09-15T15:45:00Z',
    updatedAt: '2026-09-15T15:50:00Z'
  },
  // 3. Chamado de Suporte a Eventos (Homologação de Lote)
  {
    id: 'CASE-2026-10493',
    protocol: '2026091500103',
    scope: 'SUPORTE_EVENTO',
    type: 'MUDANCA',
    typeLabelPtBr: 'Gerenciamento de Mudança',
    title: 'Abertura antecipada de lote extra para Camarote Lateral B',
    description: 'Produtora solicita abertura de 50 vagas de cortesia e 100 ingressos de lote extra após liberação dos bombeiros.',
    eventId: 1,
    eventName: 'Orquestra Sinfônica — Noite de Clássicos',
    producerId: 101,
    producerName: 'Opus Entretenimento Brasil',
    category: 'HOMOLOGACAO_DISPOSITIVO',
    priority: 'MEDIA',
    priorityLabelPtBr: 'Prioridade Média',
    status: 'RESOLVIDO',
    statusLabelPtBr: 'Resolvido & Concluído',
    assignedAgentName: 'Guilherme Rocha (Gerente de Contas)',
    assignedQueue: 'Gestão de Produtores e Inventário',
    firstResponseDueAt: '2026-09-15T12:00:00Z',
    resolutionDueAt: '2026-09-15T14:00:00Z',
    firstRespondedAt: '2026-09-15T11:45:00Z',
    resolvedAt: '2026-09-15T13:30:00Z',
    slaStatus: 'DENTRO_DO_PRAZO',
    slaStatusLabelPtBr: 'Dentro do Prazo de SLA',
    createdAt: '2026-09-15T11:30:00Z',
    updatedAt: '2026-09-15T13:30:00Z'
  }
]

let caseMessages: Array<{
  id: string
  caseId: string
  senderName: string
  senderRole: 'CLIENTE' | 'PRODUTOR' | 'ATENDENTE' | 'SISTEMA_IA'
  text: string
  isInternalNote: boolean
  sentAt: string
}> = [
  {
    id: 'MSG-001',
    caseId: 'CASE-2026-10491',
    senderName: 'Maria Silva Santos',
    senderRole: 'CLIENTE',
    text: 'Olá, fiz o pagamento via PIX do pedido ORD-928371 mas não recebi a confirmação por e-mail ainda. Poderiam me ajudar?',
    isInternalNote: false,
    sentAt: '2026-09-15T14:30:00Z'
  },
  {
    id: 'MSG-002',
    caseId: 'CASE-2026-10491',
    senderName: 'Camila Alcantara',
    senderRole: 'ATENDENTE',
    text: 'Olá, Maria! Localizei seu pedido e o pagamento já consta como APROVADO. Reenviei os ingressos com o QR Code ativo diretamente para o seu WhatsApp e e-mail alternativo.',
    isInternalNote: false,
    sentAt: '2026-09-15T14:40:00Z'
  }
]

// ----------------------------------------------------------------------------
// ENDPOINTS DA CENTRAL DE CLIENTES
// ----------------------------------------------------------------------------

// 1. Busca Universal de Clientes (sem 360)
customerServiceItilRouter.get('/customers', (req: Request, res: Response) => {
  const { q, segment, status } = req.query
  let result = [...customers]

  if (segment && segment !== 'TODOS') {
    result = result.filter(c => c.rfmSegment === segment)
  }
  if (status && status !== 'TODOS') {
    result = result.filter(c => c.status === status)
  }
  if (q && typeof q === 'string') {
    const s = q.toLowerCase().replace(/[\.-]/g, '')
    result = result.filter(
      c =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.documentRaw.includes(s) ||
        c.document.includes(q) ||
        c.email.toLowerCase().includes(q.toLowerCase()) ||
        c.phone.includes(q) ||
        c.id.toLowerCase().includes(q.toLowerCase())
    )
  }

  res.json({
    success: true,
    total: result.length,
    data: result
  })
})

// 2. Dossiê Completo do Cliente (Histórico Unificado)
customerServiceItilRouter.get('/customers/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const customer = customers.find(c => c.id === id || c.documentRaw === id.replace(/[\.-]/g, ''))
  if (!customer) {
    return res.status(404).json({ success: false, error: 'Cliente não encontrado.' })
  }

  const timeline = customerTimelines.filter(t => t.customerId === customer.id)
  const clientCases = itilCases.filter(c => c.customerId === customer.id)

  res.json({
    success: true,
    customer,
    timeline,
    cases: clientCases
  })
})

// ----------------------------------------------------------------------------
// ENDPOINTS DO MOTOR ITIL SERVICE DESK (SAC & SUPORTE A EVENTOS)
// ----------------------------------------------------------------------------

// 3. Listar Chamados ITIL (Filtro rigoroso por scope)
customerServiceItilRouter.get('/itil/cases', (req: Request, res: Response) => {
  const { scope, status, priority, q, eventId } = req.query
  let result = [...itilCases]

  if (scope) {
    result = result.filter(c => c.scope === scope)
  }
  if (status && status !== 'TODOS') {
    result = result.filter(c => c.status === status)
  }
  if (priority && priority !== 'TODOS') {
    result = result.filter(c => c.priority === priority)
  }
  if (eventId) {
    result = result.filter(c => c.eventId === Number(eventId))
  }
  if (q && typeof q === 'string') {
    const s = q.toLowerCase()
    result = result.filter(
      c =>
        c.id.toLowerCase().includes(s) ||
        c.protocol.includes(s) ||
        c.title.toLowerCase().includes(s) ||
        (c.customerName && c.customerName.toLowerCase().includes(s)) ||
        (c.producerName && c.producerName.toLowerCase().includes(s))
    )
  }

  res.json({
    success: true,
    total: result.length,
    data: result
  })
})

// 4. Detalhes de um Chamado com Mensagens
customerServiceItilRouter.get('/itil/cases/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const caseItem = itilCases.find(c => c.id === id || c.protocol === id)
  if (!caseItem) {
    return res.status(404).json({ success: false, error: 'Chamado ITIL não encontrado.' })
  }

  const messages = caseMessages.filter(m => m.caseId === caseItem.id)

  res.json({
    success: true,
    case: caseItem,
    messages
  })
})

// 5. Criar Novo Chamado ITIL (SAC ou Suporte a Eventos)
customerServiceItilRouter.post('/itil/cases', (req: Request, res: Response) => {
  const {
    scope,
    type,
    title,
    description,
    customerId,
    customerName,
    customerEmail,
    customerDocument,
    eventId,
    eventName,
    producerId,
    producerName,
    category,
    priority,
    assignedQueue
  } = req.body

  if (!scope || !title || !description) {
    return res.status(400).json({
      success: false,
      error: 'Escopo (SAC_CLIENTE ou SUPORTE_EVENTO), título e descrição são obrigatórios.'
    })
  }

  const newId = `CASE-${Date.now().toString().slice(-6)}`
  const newProtocol = `2026${Date.now().toString().slice(-8)}`

  // Calcula SLA com base na prioridade
  const now = new Date()
  const firstResponseHours = priority === 'URGENTE_CRITICA' ? 0.5 : priority === 'ALTA' ? 1 : 2
  const resolutionHours = priority === 'URGENTE_CRITICA' ? 2 : priority === 'ALTA' ? 4 : 8

  const firstResponseDue = new Date(now.getTime() + firstResponseHours * 3600000).toISOString()
  const resolutionDue = new Date(now.getTime() + resolutionHours * 3600000).toISOString()

  const newCase = {
    id: newId,
    protocol: newProtocol,
    scope: scope as 'SAC_CLIENTE' | 'SUPORTE_EVENTO',
    type: type || 'REQUISICAO_SERVICO',
    typeLabelPtBr:
      type === 'INCIDENTE'
        ? 'Incidente Operacional'
        : type === 'PROBLEMA'
        ? 'Gerenciamento de Problema'
        : type === 'MUDANCA'
        ? 'Gerenciamento de Mudança'
        : 'Requisição de Serviço',
    title,
    description,
    customerId,
    customerName,
    customerEmail,
    customerDocument,
    eventId: eventId ? Number(eventId) : undefined,
    eventName,
    producerId: producerId ? Number(producerId) : undefined,
    producerName,
    category: category || 'GERAL',
    priority: priority || 'MEDIA',
    priorityLabelPtBr:
      priority === 'URGENTE_CRITICA'
        ? 'Urgente / Crítica'
        : priority === 'ALTA'
        ? 'Alta'
        : priority === 'BAIXA'
        ? 'Baixa'
        : 'Média',
    status: 'NOVO' as const,
    statusLabelPtBr: 'Novo Chamado Aberto',
    assignedAgentName: 'Triagem Automática',
    assignedQueue: assignedQueue || (scope === 'SAC_CLIENTE' ? 'Fila Geral SAC' : 'Suporte Operacional Praça'),
    firstResponseDueAt: firstResponseDue,
    resolutionDueAt: resolutionDue,
    slaStatus: 'DENTRO_DO_PRAZO' as const,
    slaStatusLabelPtBr: 'Dentro do Prazo de SLA',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }

  itilCases.unshift(newCase)

  res.json({
    success: true,
    message: `Chamado ${newProtocol} aberto com sucesso no escopo ${scope}.`,
    case: newCase
  })
})

// 6. Enviar Mensagem / Nota Interna em Chamado
customerServiceItilRouter.post('/itil/cases/:id/messages', (req: Request, res: Response) => {
  const { id } = req.params
  const { senderName, senderRole, text, isInternalNote } = req.body

  if (!text) {
    return res.status(400).json({ success: false, error: 'Texto da mensagem é obrigatório.' })
  }

  const caseIndex = itilCases.findIndex(c => c.id === id || c.protocol === id)
  if (caseIndex === -1) {
    return res.status(404).json({ success: false, error: 'Chamado não encontrado.' })
  }

  const msgId = `MSG-${Date.now().toString().slice(-6)}`
  const newMsg = {
    id: msgId,
    caseId: itilCases[caseIndex].id,
    senderName: senderName || 'Operador Disk Core',
    senderRole: senderRole || 'ATENDENTE',
    text,
    isInternalNote: Boolean(isInternalNote),
    sentAt: new Date().toISOString()
  }
  caseMessages.push(newMsg)

  // Atualiza firstRespondedAt se for a primeira resposta de atendente
  if (!itilCases[caseIndex].firstRespondedAt && (senderRole === 'ATENDENTE' || senderRole === 'SISTEMA_IA')) {
    itilCases[caseIndex].firstRespondedAt = new Date().toISOString()
    itilCases[caseIndex].status = 'EM_ATENDIMENTO'
    itilCases[caseIndex].statusLabelPtBr = 'Em Atendimento'
  }
  itilCases[caseIndex].updatedAt = new Date().toISOString()

  res.json({
    success: true,
    message: 'Mensagem registrada com sucesso.',
    msg: newMsg,
    case: itilCases[caseIndex]
  })
})

// 7. Atualizar Status do Chamado
customerServiceItilRouter.patch('/itil/cases/:id/status', (req: Request, res: Response) => {
  const { id } = req.params
  const { status, resolutionNotes } = req.body

  const caseIndex = itilCases.findIndex(c => c.id === id || c.protocol === id)
  if (caseIndex === -1) {
    return res.status(404).json({ success: false, error: 'Chamado não encontrado.' })
  }

  const labelsMap: Record<string, string> = {
    NOVO: 'Novo Chamado Aberto',
    EM_TRIAGEM: 'Em Triagem Técnica',
    EM_ATENDIMENTO: 'Em Atendimento',
    AGUARDANDO_CLIENTE: 'Aguardando Resposta do Cliente',
    AGUARDANDO_PRODUTOR: 'Aguardando Resposta do Produtor',
    RESOLVIDO: 'Resolvido com Sucesso',
    FECHADO: 'Chamado Fechado',
    CANCELADO: 'Cancelado'
  }

  itilCases[caseIndex].status = status
  itilCases[caseIndex].statusLabelPtBr = labelsMap[status] || status
  itilCases[caseIndex].updatedAt = new Date().toISOString()

  if (status === 'RESOLVIDO' || status === 'FECHADO') {
    itilCases[caseIndex].resolvedAt = new Date().toISOString()
  }

  if (resolutionNotes) {
    caseMessages.push({
      id: `MSG-RES-${Date.now().toString().slice(-6)}`,
      caseId: itilCases[caseIndex].id,
      senderName: 'Sistema de Encerramento',
      senderRole: 'SISTEMA_IA',
      text: `Resolução: ${resolutionNotes}`,
      isInternalNote: true,
      sentAt: new Date().toISOString()
    })
  }

  res.json({
    success: true,
    message: `Status do chamado alterado para ${itilCases[caseIndex].statusLabelPtBr}.`,
    case: itilCases[caseIndex]
  })
})

// 8. Resumo e Métricas ITIL do Service Desk
customerServiceItilRouter.get('/itil/metrics', (req: Request, res: Response) => {
  const sacCases = itilCases.filter(c => c.scope === 'SAC_CLIENTE')
  const eventCases = itilCases.filter(c => c.scope === 'SUPORTE_EVENTO')

  const total = itilCases.length
  const withinSla = itilCases.filter(c => c.slaStatus === 'DENTRO_DO_PRAZO').length

  res.json({
    success: true,
    summary: {
      totalCustomers: customers.length,
      activeCasesSac: sacCases.filter(c => c.status !== 'RESOLVIDO' && c.status !== 'FECHADO' && c.status !== 'CANCELADO').length,
      activeCasesEventSupport: eventCases.filter(c => c.status !== 'RESOLVIDO' && c.status !== 'FECHADO' && c.status !== 'CANCELADO').length,
      slaCompliancePercentage: total > 0 ? Number(((withinSla / total) * 100).toFixed(1)) : 100,
      averageResponseTimeMinutes: 18,
      averageResolutionTimeHours: 2.4,
      criticalIncidentsCount: itilCases.filter(c => c.priority === 'URGENTE_CRITICA' && c.status !== 'RESOLVIDO').length,
      satisfactionRatePercentage: 97.4
    }
  })
})
