import { useState, useEffect, useMemo, type FormEvent } from 'react'
import {
  LayoutDashboard, Ticket, AlertTriangle, BookOpen, Users, Clock3, Plus, Search,
  RefreshCw, CheckCircle2, MessageCircle, Mail, Phone, Globe, ShieldAlert,
  Send, UserCheck, Sparkles, Filter, ChevronRight, ArrowRight, ExternalLink,
  Flame, HelpCircle, FileText, CheckCheck, PlayCircle, XCircle, AlertCircle, Headphones, Link2, Sparkle,
  Layers3, ArrowRightLeft, UserPlus, CheckSquare, Gauge, Calendar, BellRing, SlidersHorizontal, Zap,
  BarChart3, Activity, ShieldCheck, LifeBuoy, MessagesSquare, Tag, ShoppingBag, WalletCards, ScanLine,
  UserRound, CalendarDays, Workflow, Play, PauseCircle, Server, Radio, Wrench, Shield, Siren, Bug, Lightbulb,
  ClipboardCheck, MessageSquareText, GitBranch, Target
} from 'lucide-react'
import type { EventItem } from '../data/events'

export type ServiceTab =
  | 'hub'
  | 'dashboard'
  | 'inbox'
  | 'tickets'
  | 'new'
  | 'major'
  | 'incidents'
  | 'problems'
  | 'client360'
  | 'workflows'
  | 'sla'
  | 'knowledge'
  | 'teams'

interface ConversationItem {
  id: number
  channel: 'WHATSAPP' | 'EMAIL' | 'CHAT'
  contactName: string
  contactValue: string
  lastMessage: string
  unreadCount: number
  ticketNumber?: string
  priority?: 'P1' | 'P2' | 'P3' | 'P4'
  status: 'OPEN' | 'WAITING_CUSTOMER' | 'WAITING_AGENT' | 'RESOLVED'
  updatedAt: string
  messages: Array<{
    id: number
    senderName: string
    direction: 'INBOUND' | 'OUTBOUND'
    body: string
    deliveryStatus: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
    createdAt: string
  }>
}

interface TicketItem {
  id: number
  protocol: string
  subject: string
  description: string
  channel: 'WHATSAPP' | 'EMAIL' | 'CHAT' | 'PHONE' | 'FORM'
  priority: 'P1' | 'P2' | 'P3' | 'P4'
  status: 'NOVO' | 'EM_ATENDIMENTO' | 'PENDENTE_CLIENTE' | 'RESOLVIDO' | 'FECHADO'
  customerName: string
  customerEmail: string
  customerPhone: string
  eventName: string
  orderCode: string
  amount: string
  assignedAgent: string
  queueName: string
  slaResponseMinutes: number
  slaResolutionMinutes: number
  slaProgressPercent: number
  slaTimeRemaining: string
  createdAt: string
  firstResponseAt?: string
  resolvedAt?: string
  isBreached?: boolean
  messages: Array<{
    id: number
    author: string
    authorType: 'CUSTOMER' | 'AGENT' | 'SYSTEM'
    channel: string
    body: string
    createdAt: string
  }>
}

interface MajorIncidentItem {
  id: number
  majorNumber: string
  title: string
  summary: string
  status: 'DECLARED' | 'WAR_ROOM_ACTIVE' | 'MITIGATED' | 'MONITORING' | 'RESOLVED' | 'CLOSED'
  commanderName: string
  warRoomUrl: string
  eventName: string
  affectedServices: string[]
  participants: Array<{ id: number; name: string; role: string; team: string }>
  communications: Array<{ id: number; cadence: string; message: string; timestamp: string }>
  mttaMinutes: number
  mttrMinutes: number | null
  startedAt: string
}

interface ProblemItem {
  id: number
  problemNumber: string
  title: string
  category: string
  description: string
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'ROOT_CAUSE_IDENTIFIED' | 'KNOWN_ERROR' | 'RESOLVED' | 'CLOSED'
  priority: 'P1' | 'P2' | 'P3' | 'P4'
  ownerName: string
  linkedIncidents: string[]
  rcaMethod: '5_WHYS' | 'ISHIKAWA' | 'TIMELINE' | 'FAULT_TREE'
  rcaFindings: string
  workaround: string
  actionPlans: Array<{ id: number; task: string; assignee: string; status: 'PENDING' | 'DONE' }>
  createdAt: string
}

interface WorkflowRule {
  id: number
  name: string
  code: string
  description: string
  triggerEvent: 'TICKET_CREATED' | 'SLA_RISK' | 'SLA_BREACHED' | 'EVENT_NEAR' | 'PAYMENT_APPROVED' | 'REFUND_PROCESSED' | 'MANUAL'
  priority: number
  isActive: boolean
  runsCount: number
  successCount: number
  failedCount: number
  actions: string[]
}

interface WorkflowRun {
  id: number
  workflowName: string
  ticketNumber?: string
  triggerEvent: string
  status: 'SUCCESS' | 'FAILED' | 'RUNNING'
  executionTimeMs: number
  createdAt: string
}

interface IncidentItem {
  id: number
  code: string
  title: string
  description: string
  severity: 'P1' | 'P2' | 'P3' | 'P4'
  impact: 'ALTO' | 'MEDIO' | 'BAIXO'
  urgency: 'ALTA' | 'MEDIA' | 'BAIXA'
  status: 'INVESTIGANDO' | 'IDENTIFICADO' | 'MONITORANDO' | 'RESOLVIDO' | 'FECHADO'
  eventName: string
  affectedServices: string[]
  linkedTickets: string[]
  startedAt: string
  resolvedAt?: string
  leadAgent: string
  workaround?: string
  timelineUpdates: Array<{
    id: number
    stage: string
    message: string
    author: string
    timestamp: string
  }>
}

interface KnowledgeArticle {
  id: number
  title: string
  category: string
  snippet: string
  views: number
  helpfulPercent: number
  isPublic: boolean
  updatedAt: string
}

interface AgentItem {
  id: number
  name: string
  email: string
  level: 'N1' | 'N2' | 'N3' | 'SUPERVISOR'
  team: string
  status: 'ONLINE' | 'BUSY' | 'AWAY' | 'OFFLINE'
  activeTickets: number
  capacity: number
}

interface QueueItem {
  id: number
  name: string
  code: string
  strategy: 'ROUND_ROBIN' | 'LEAST_LOAD' | 'SKILL_BASED'
  agentsCount: number
  openTickets: number
}

interface SLAPolicy {
  id: string
  priority: 'P1' | 'P2' | 'P3' | 'P4'
  name: string
  example: string
  firstResponseMinutes: number
  resolutionMinutes: number
  calendar: '24x7_EVENT' | 'BUSINESS_HOURS'
  escalateSupervisorPercent: number
  escalateManagerPercent: number
}

const initialSLAPolicies: SLAPolicy[] = [
  {
    id: 'sla-p1',
    priority: 'P1',
    name: 'P1 - Crítica (Portão & Catracas)',
    example: 'Evento em andamento, catraca offline, acesso bloqueado',
    firstResponseMinutes: 15,
    resolutionMinutes: 120,
    calendar: '24x7_EVENT',
    escalateSupervisorPercent: 70,
    escalateManagerPercent: 85
  },
  {
    id: 'sla-p2',
    priority: 'P2',
    name: 'P2 - Alta (Ingresso & Pagamento)',
    example: 'Ingresso não recebido < 24h, erro de checkout Pix',
    firstResponseMinutes: 60,
    resolutionMinutes: 360,
    calendar: '24x7_EVENT',
    escalateSupervisorPercent: 70,
    escalateManagerPercent: 85
  },
  {
    id: 'sla-p3',
    priority: 'P3',
    name: 'P3 - Média (Titularidade & Dúvidas)',
    example: 'Troca de titularidade, informações sobre setores',
    firstResponseMinutes: 240,
    resolutionMinutes: 1440,
    calendar: 'BUSINESS_HOURS',
    escalateSupervisorPercent: 70,
    escalateManagerPercent: 85
  },
  {
    id: 'sla-p4',
    priority: 'P4',
    name: 'P4 - Baixa (Sugestões & Feedbacks)',
    example: 'Dúvidas sobre eventos futuros (> 30 dias), sugestões',
    firstResponseMinutes: 720,
    resolutionMinutes: 2880,
    calendar: 'BUSINESS_HOURS',
    escalateSupervisorPercent: 70,
    escalateManagerPercent: 85
  }
]

const initialQueues: QueueItem[] = [
  { id: 1, name: 'Reenvio & Ingressos', code: 'QUEUE_TICKETS', strategy: 'ROUND_ROBIN', agentsCount: 4, openTickets: 14 },
  { id: 2, name: 'Pagamentos & Pix', code: 'QUEUE_PAYMENTS', strategy: 'LEAST_LOAD', agentsCount: 3, openTickets: 6 },
  { id: 3, name: 'Reembolsos & Estornos', code: 'QUEUE_REFUNDS', strategy: 'LEAST_LOAD', agentsCount: 2, openTickets: 5 },
  { id: 4, name: 'Acesso & Catracas (Portão)', code: 'QUEUE_ACCESS', strategy: 'SKILL_BASED', agentsCount: 2, openTickets: 2 }
]

const initialMajorIncidents: MajorIncidentItem[] = [
  {
    id: 1,
    majorNumber: 'MI-2026-001',
    title: 'Falha Crítica na Validação de QR Code no Portão B do Rock Arena',
    summary: 'Degradação da sincronização entre servidor de borda e catracas gerando fila de espera de 800 pessoas no portão B.',
    status: 'WAR_ROOM_ACTIVE',
    commanderName: 'Camila Supervisora (Incident Commander)',
    warRoomUrl: 'https://meet.diskingressos.com.br/war-room-p1-rockarena',
    eventName: 'Rock Arena Festival 2026',
    affectedServices: ['Catracas Portão B', 'Servidor Local Edge', 'App Mobile Carteira'],
    participants: [
      { id: 1, name: 'Camila Supervisora', role: 'Incident Commander', team: 'Gestão de Crise' },
      { id: 2, name: 'Engenheiro Bruno', role: 'Tech Lead Infraestrutura', team: 'Cloud & Edge' },
      { id: 3, name: 'Rodrigo SRE', role: 'Comms Lead', team: 'Comunicação Executiva' }
    ],
    communications: [
      { id: 1, cadence: '11:00 (Abertura)', message: 'Incidente P1 declarado. War Room estabelecida e fluxo redirecionado.', timestamp: '11:00' },
      { id: 2, cadence: '11:15 (Update 1)', message: 'Switch local reinicializado e tráfego de backup 5G ativado.', timestamp: '11:15' },
      { id: 3, cadence: '11:30 (Update 2)', message: 'Validação normalizada nas catracas 01 a 03. Monitorando catraca 04.', timestamp: '11:30' }
    ],
    mttaMinutes: 4,
    mttrMinutes: null,
    startedAt: 'Há 32 minutos'
  }
]

const initialProblems: ProblemItem[] = [
  {
    id: 1,
    problemNumber: 'PRB-2026-002',
    title: 'Perda de pacotes na sincronização offline em picos de 3.000 req/min',
    category: 'Infraestrutura de Portaria & Catracas',
    description: 'A base local SQLite das catracas entrava em lock de escrita quando a rede mesh oscilava com alto volume simultâneo de check-in.',
    status: 'KNOWN_ERROR',
    priority: 'P1',
    ownerName: 'Equipe de Engenharia de Hardware',
    linkedIncidents: ['INC-2026-004', 'MI-2026-001'],
    rcaMethod: '5_WHYS',
    rcaFindings: '1. Catraca bloqueou -> 2. Lock SQLite no disco -> 3. Timeout de escrita -> 4. Fila síncrona sem buffer -> 5. Ausência de fila assíncrona WAL.',
    workaround: 'Ativação do modo WAL (Write-Ahead Logging) no SQLite e aumento do buffer em memória para 5.000 ingressos.',
    actionPlans: [
      { id: 1, task: 'Deploy do firmware v3.4 com WAL mode em todas as 80 catracas', assignee: 'Engenharia de Acesso', status: 'DONE' },
      { id: 2, task: 'Implementar failover automático 5G redundante', assignee: 'Infra Cloud', status: 'PENDING' }
    ],
    createdAt: 'Há 2 dias'
  }
]

const initialConversations: ConversationItem[] = [
  {
    id: 1,
    channel: 'WHATSAPP',
    contactName: 'João Silva Oliveira',
    contactValue: '+55 41 99882-1144',
    lastMessage: 'Olá, paguei via Pix e não recebi meu QR Code no e-mail.',
    unreadCount: 1,
    ticketNumber: 'DS-2026-984221',
    priority: 'P2',
    status: 'OPEN',
    updatedAt: '10:45',
    messages: [
      { id: 101, senderName: 'João Silva Oliveira', direction: 'INBOUND', body: 'Olá, paguei via Pix e não recebi meu QR Code no e-mail.', deliveryStatus: 'READ', createdAt: '10:45' },
      { id: 102, senderName: 'Disk Copilot (IA)', direction: 'OUTBOUND', body: 'Olá João! Localizei seu pedido DI-984221 com pagamento aprovado. Estou transferindo para um atendente.', deliveryStatus: 'DELIVERED', createdAt: '10:46' },
      { id: 103, senderName: 'Lucas Atendente (N1)', direction: 'OUTBOUND', body: 'Olá João! Estou forçando o reenvio do seu ingresso para seu e-mail e WhatsApp agora mesmo.', deliveryStatus: 'READ', createdAt: '10:50' }
    ]
  },
  {
    id: 2,
    channel: 'EMAIL',
    contactName: 'Carlos Eduardo Mendes',
    contactValue: 'carlos.mendes@adv.com.br',
    lastMessage: 'Gostaria de mudar o nome do titular do ingresso.',
    unreadCount: 0,
    ticketNumber: 'DS-2026-983950',
    priority: 'P3',
    status: 'WAITING_CUSTOMER',
    updatedAt: '09:00',
    messages: [
      { id: 201, senderName: 'Carlos Eduardo Mendes', direction: 'INBOUND', body: 'Gostaria de mudar o nome do titular do meu ingresso para Roberto Mendes.', deliveryStatus: 'READ', createdAt: '08:15' },
      { id: 202, senderName: 'Beatriz Castro (N2)', direction: 'OUTBOUND', body: 'Enviamos o link de validação biométrica para seu e-mail.', deliveryStatus: 'DELIVERED', createdAt: '09:00' }
    ]
  },
  {
    id: 3,
    channel: 'CHAT',
    contactName: 'Fernanda Lima Souza',
    contactValue: 'fernanda.lima@gmail.com',
    lastMessage: 'Perfeito, o estorno duplicado já caiu no meu cartão!',
    unreadCount: 0,
    ticketNumber: 'DS-2026-983110',
    priority: 'P2',
    status: 'RESOLVED',
    updatedAt: 'Ontem 17:15',
    messages: [
      { id: 301, senderName: 'Fernanda Lima Souza', direction: 'INBOUND', body: 'Apareceram duas cobranças de R$ 350,00 no meu cartão.', deliveryStatus: 'READ', createdAt: 'Ontem 16:30' },
      { id: 302, senderName: 'Rodrigo Financeiro', direction: 'OUTBOUND', body: 'A cobrança duplicada sofreu timeout e foi estornada com sucesso.', deliveryStatus: 'READ', createdAt: 'Ontem 17:10' },
      { id: 303, senderName: 'Fernanda Lima Souza', direction: 'INBOUND', body: 'Perfeito, o estorno duplicado já caiu no meu cartão!', deliveryStatus: 'READ', createdAt: 'Ontem 17:15' }
    ]
  }
]

const initialWorkflows: WorkflowRule[] = [
  {
    id: 1,
    name: 'QR Code Crítico Próximo do Evento',
    code: 'WF_QR_CRITICAL_NEAR_EVENT',
    description: 'Quando um ticket de problema de QR Code é criado para um show nas próximas 2 horas, eleva a prioridade para P1 e move para fila de Catracas.',
    triggerEvent: 'EVENT_NEAR',
    priority: 1,
    isActive: true,
    runsCount: 42,
    successCount: 42,
    failedCount: 0,
    actions: ['SET_PRIORITY(P1)', 'MOVE_QUEUE(QUEUE_ACCESS)', 'CREATE_ESCALATION(SUPERVISOR)']
  },
  {
    id: 2,
    name: 'Alerta de Risco de SLA 85%',
    code: 'WF_SLA_RISK_85',
    description: 'Quando um ticket atinge 85% do tempo limite de SLA, envia alerta sonoro e notifica o supervisor de plantão via Push.',
    triggerEvent: 'SLA_RISK',
    priority: 2,
    isActive: true,
    runsCount: 18,
    successCount: 18,
    failedCount: 0,
    actions: ['CREATE_ESCALATION(MANAGER)', 'SEND_INTERNAL_NOTE', 'OUTBOUND_WEBHOOK']
  },
  {
    id: 3,
    name: 'Auto-Reenvio de Ingresso após Pix Aprovado',
    code: 'WF_AUTO_RESEND_PIX',
    description: 'Quando o cliente pergunta sobre Pix pelo WhatsApp e o pagamento já consta como aprovado, dispara mensagem de autoatendimento com PDF/QR Code.',
    triggerEvent: 'PAYMENT_APPROVED',
    priority: 3,
    isActive: true,
    runsCount: 156,
    successCount: 154,
    failedCount: 2,
    actions: ['SEND_MESSAGE(WHATSAPP)', 'ADD_TICKET_TAG(AUTO_SOLVED)', 'SET_STATUS(RESOLVIDO)']
  },
  {
    id: 4,
    name: 'Reembolso Processado - Notificação Imediata',
    code: 'WF_REFUND_NOTIFY',
    description: 'Dispara comprovante bancário de estorno por WhatsApp e E-mail assim que o gateway confirmar a devolução.',
    triggerEvent: 'REFUND_PROCESSED',
    priority: 4,
    isActive: true,
    runsCount: 28,
    successCount: 28,
    failedCount: 0,
    actions: ['SEND_MESSAGE(WHATSAPP)', 'SEND_MESSAGE(EMAIL)', 'ADD_CUSTOMER_TAG(REFUND_COMPLETED)']
  }
]

const initialWorkflowRuns: WorkflowRun[] = [
  { id: 101, workflowName: 'Auto-Reenvio de Ingresso após Pix Aprovado', ticketNumber: 'DS-2026-984221', triggerEvent: 'PAYMENT_APPROVED', status: 'SUCCESS', executionTimeMs: 142, createdAt: 'Há 12 min' },
  { id: 102, workflowName: 'QR Code Crítico Próximo do Evento', ticketNumber: 'DS-2026-984180', triggerEvent: 'EVENT_NEAR', status: 'SUCCESS', executionTimeMs: 88, createdAt: 'Há 25 min' },
  { id: 103, workflowName: 'Alerta de Risco de SLA 85%', ticketNumber: 'DS-2026-983950', triggerEvent: 'SLA_RISK', status: 'SUCCESS', executionTimeMs: 110, createdAt: 'Há 1 hora' },
  { id: 104, workflowName: 'Reembolso Processado - Notificação Imediata', ticketNumber: 'DS-2026-983110', triggerEvent: 'REFUND_PROCESSED', status: 'SUCCESS', executionTimeMs: 195, createdAt: 'Ontem 17:15' }
]

const initialIncidents: IncidentItem[] = [
  {
    id: 1,
    code: 'INC-2026-004',
    title: 'Instabilidade na sincronização offline da Catraca 04 Portão B',
    description: 'Catraca 04 perdeu comunicação com o servidor de borda local, gerando falso-negativo na validação de ingressos emitidos nas últimas 2 horas.',
    severity: 'P1',
    impact: 'ALTO',
    urgency: 'ALTA',
    status: 'INVESTIGANDO',
    eventName: 'Rock Arena Festival 2026',
    affectedServices: ['Catracas Portão B', 'Servidor Local Edge', 'Validador Offline'],
    linkedTickets: ['DS-2026-984180', 'DS-2026-984182', 'DS-2026-984185'],
    startedAt: 'Há 18 minutos',
    leadAgent: 'Engenharia de Acesso (N3)',
    workaround: 'Redirecionar fluxo para Catracas 01 a 03 enquanto a base local é sincronizada via hotspot 5G.',
    timelineUpdates: [
      { id: 1, stage: 'Detecção', message: 'Alerta automático disparado por taxa de 40% de rejeição na Catraca 04.', author: 'Sistema de Monitoramento', timestamp: '11:00' },
      { id: 2, stage: 'Investigação', message: 'Identificada perda de pacotes no switch local do portão B.', author: 'Engenharia de Acesso', timestamp: '11:08' },
      { id: 3, stage: 'Contorno', message: 'Workaround aplicado: tráfego roteado para Catracas 01 a 03.', author: 'Supervisor Operacional', timestamp: '11:15' }
    ]
  },
  {
    id: 2,
    code: 'INC-2026-003',
    title: 'Atraso pontual no envio de e-mails transacionais com voucher em anexo',
    description: 'Fila do provedor SendGrid atingiu pico temporário de processamento.',
    severity: 'P2',
    impact: 'MEDIO',
    urgency: 'ALTA',
    status: 'RESOLVIDO',
    eventName: 'Festival Sertanejo Curitiba 2026',
    affectedServices: ['SendGrid E-mails', 'Webhook de Mensageria'],
    linkedTickets: ['DS-2026-984221', 'DS-2026-984225'],
    startedAt: 'Ontem às 10:00',
    resolvedAt: 'Ontem às 10:45',
    leadAgent: 'Infraestrutura Cloud',
    workaround: 'Ativação automática da rota secundária de WhatsApp transacional.',
    timelineUpdates: [
      { id: 1, stage: 'Detecção', message: 'Pico de latência de 180s reportado no envio de vouchers por e-mail.', author: 'CloudWatch Monitor', timestamp: '10:00' },
      { id: 2, stage: 'Resolução', message: 'Pool de IPs aquecidos ativado no SendGrid. Fila normalizada em 100%.', author: 'Infraestrutura Cloud', timestamp: '10:45' }
    ]
  }
]

const mockTickets: TicketItem[] = [
  {
    id: 1,
    protocol: 'DS-2026-984221',
    subject: 'Ingresso não recebido após aprovação Pix',
    description: 'Cliente realizou pagamento via Pix, foi debitado da conta bancária, mas não recebeu o e-mail nem o QR Code na carteira do app.',
    channel: 'WHATSAPP',
    priority: 'P2',
    status: 'EM_ATENDIMENTO',
    customerName: 'João Silva Oliveira',
    customerEmail: 'joao.silva@email.com',
    customerPhone: '(41) 99882-1144',
    eventName: 'Festival Sertanejo Curitiba 2026',
    orderCode: 'DI-984221',
    amount: 'R$ 480,00',
    assignedAgent: 'Lucas Atendente (N1)',
    queueName: 'Reenvio & Ingressos',
    slaResponseMinutes: 60,
    slaResolutionMinutes: 360,
    slaProgressPercent: 72,
    slaTimeRemaining: '01h 40min',
    createdAt: 'Há 25 minutos',
    firstResponseAt: 'Há 12 minutos',
    messages: [
      { id: 1, author: 'João Silva Oliveira', authorType: 'CUSTOMER', channel: 'WHATSAPP', body: 'Olá, paguei meu ingresso via Pix tem 40 minutos e ainda não apareceu no meu aplicativo nem no e-mail.', createdAt: '10:45' },
      { id: 2, author: 'Disk Copilot (IA)', authorType: 'SYSTEM', channel: 'SYSTEM', body: 'Diagnóstico: Pedido DI-984221 localizado na Adquirente Efí Pix com status APROVADO. Falha pontual no disparo de webhook de mensageria.', createdAt: '10:46' },
      { id: 3, author: 'Lucas Atendente (N1)', authorType: 'AGENT', channel: 'WHATSAPP', body: 'Olá João! Já localizei seu pedido aprovado com sucesso. Estou forçando a emissão do seu QR Code agora mesmo.', createdAt: '10:58' }
    ]
  },
  {
    id: 2,
    protocol: 'DS-2026-984180',
    subject: 'Erro de leitura do QR Code na Catraca 04',
    description: 'Comprador informa que ao apresentar o voucher no portão B, o leitor acusou "Código não encontrado no lote atual".',
    channel: 'FORM',
    priority: 'P1',
    status: 'NOVO',
    customerName: 'Mariana Costa Ferreira',
    customerEmail: 'mariana.costa@empresa.com.br',
    customerPhone: '(11) 98765-4321',
    eventName: 'Rock Arena Festival 2026',
    orderCode: 'DI-983990',
    amount: 'R$ 320,00',
    assignedAgent: 'Aguardando atribuição',
    queueName: 'Acesso & Catracas (Portão)',
    slaResponseMinutes: 15,
    slaResolutionMinutes: 120,
    slaProgressPercent: 35,
    slaTimeRemaining: '01h 18min',
    createdAt: 'Há 8 minutos',
    messages: [
      { id: 1, author: 'Mariana Costa Ferreira', authorType: 'CUSTOMER', channel: 'FORM', body: 'Estou na fila do portão B e a catraca diz que meu QR Code é inválido, comprei semana passada.', createdAt: '11:05' }
    ]
  },
  {
    id: 3,
    protocol: 'DS-2026-983950',
    subject: 'Solicitação de alteração de titularidade',
    description: 'Comprador necessita transferir o ingresso nominal para seu irmão devido a viagem corporativa.',
    channel: 'EMAIL',
    priority: 'P3',
    status: 'PENDENTE_CLIENTE',
    customerName: 'Carlos Eduardo Mendes',
    customerEmail: 'carlos.mendes@adv.com.br',
    customerPhone: '(41) 99123-8899',
    eventName: 'Stand Up Comedy Night',
    orderCode: 'DI-981240',
    amount: 'R$ 160,00',
    assignedAgent: 'Beatriz Castro (N2)',
    queueName: 'Reenvio & Ingressos',
    slaResponseMinutes: 240,
    slaResolutionMinutes: 1440,
    slaProgressPercent: 18,
    slaTimeRemaining: '19h 45min',
    createdAt: 'Há 3 horas',
    firstResponseAt: 'Há 2 horas',
    messages: [
      { id: 1, author: 'Carlos Eduardo Mendes', authorType: 'CUSTOMER', channel: 'EMAIL', body: 'Gostaria de mudar o nome do meu ingresso para Roberto Mendes, CPF 098.765.432-11.', createdAt: '08:15' },
      { id: 2, author: 'Beatriz Castro (N2)', authorType: 'AGENT', channel: 'EMAIL', body: 'Olá Carlos! Enviamos um link de confirmação para o seu e-mail para validar a biometria do novo titular.', createdAt: '09:00' }
    ]
  },
  {
    id: 4,
    protocol: 'DS-2026-983110',
    subject: 'Cobrança duplicada no cartão de crédito',
    description: 'Fatura do cartão registrou duas cobranças idênticas para a mesma transação no checkout.',
    channel: 'CHAT',
    priority: 'P2',
    status: 'RESOLVIDO',
    customerName: 'Fernanda Lima Souza',
    customerEmail: 'fernanda.lima@gmail.com',
    customerPhone: '(41) 98877-6655',
    eventName: 'Festival Sertanejo Curitiba 2026',
    orderCode: 'DI-979912',
    amount: 'R$ 700,00',
    assignedAgent: 'Rodrigo Financeiro (N2)',
    queueName: 'Pagamentos & Pix',
    slaResponseMinutes: 60,
    slaResolutionMinutes: 360,
    slaProgressPercent: 100,
    slaTimeRemaining: 'Concluído no Prazo',
    createdAt: 'Ontem às 16:30',
    firstResponseAt: 'Ontem às 16:42',
    resolvedAt: 'Ontem às 17:15',
    messages: [
      { id: 1, author: 'Fernanda Lima Souza', authorType: 'CUSTOMER', channel: 'CHAT', body: 'Apareceram duas cobranças de R$ 350,00 no meu cartão Visa.', createdAt: '16:30' },
      { id: 2, author: 'Rodrigo Financeiro (N2)', authorType: 'AGENT', channel: 'CHAT', body: 'Identificamos que a primeira tentativa sofreu timeout e foi estornada automaticamente pelo gateway Stone. Enviamos o comprovante no seu e-mail.', createdAt: '17:10' }
    ]
  }
]

const mockArticles: KnowledgeArticle[] = [
  { id: 1, title: 'Como reenviar o ingresso com QR Code por E-mail e WhatsApp', category: 'Ingressos & Carteira', snippet: 'Passo a passo para o agente disparar o voucher atualizado com 1 clique direto pelo painel de SAC.', views: 1420, helpfulPercent: 98, isPublic: true, updatedAt: 'Hoje às 09:30' },
  { id: 2, title: 'Procedimento para cancelamento e estorno Pix em até 7 dias', category: 'Financeiro & Estornos', snippet: 'Regras do Art. 49 do CDC, prazos de devolução imediata e conferência de chave Pix pagadora.', views: 890, helpfulPercent: 95, isPublic: true, updatedAt: 'Ontem' },
  { id: 3, title: 'Troca de titularidade e validação de reconhecimento facial', category: 'Acessos & Biometria', snippet: 'Como desvincular a biometria anterior e convidar o novo portador para cadastrar sua selfie segura.', views: 640, helpfulPercent: 92, isPublic: true, updatedAt: '3 dias atrás' },
  { id: 4, title: 'Resolução de divergência em catraca offline no dia do evento', category: 'Operação de Portaria', snippet: 'Instruções para os fiscais de portão sincronizarem a lista local de ingressos via rede mesh.', views: 310, helpfulPercent: 100, isPublic: false, updatedAt: '1 semana atrás' }
]

const initialAgents: AgentItem[] = [
  { id: 1, name: 'Lucas Atendente', email: 'lucas.sac@diskingressos.com.br', level: 'N1', team: 'Fila Geral & WhatsApp', status: 'ONLINE', activeTickets: 4, capacity: 8 },
  { id: 2, name: 'Beatriz Castro', email: 'beatriz.castro@diskingressos.com.br', level: 'N2', team: 'Titularidade & Ingressos', status: 'ONLINE', activeTickets: 3, capacity: 6 },
  { id: 3, name: 'Rodrigo Financeiro', email: 'rodrigo.fin@diskingressos.com.br', level: 'N2', team: 'Estornos & Pagamentos', status: 'BUSY', activeTickets: 6, capacity: 6 },
  { id: 4, name: 'Engenharia de Acesso', email: 'acesso.ti@diskingressos.com.br', level: 'N3', team: 'Catracas & Hardware', status: 'ONLINE', activeTickets: 2, capacity: 4 },
  { id: 5, name: 'Camila Supervisora', email: 'camila.sup@diskingressos.com.br', level: 'SUPERVISOR', team: 'Gestão de Crise & SLA', status: 'ONLINE', activeTickets: 1, capacity: 10 }
]

type Props = {
  events: EventItem[]
  producerId: number | null
  producerName: string
  mode?: string
  notify: (m: string) => void
  onNavigate: (key: any) => void
}

export default function SupportPage({ events, producerId, producerName, mode = 'hub', notify, onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<ServiceTab>('hub')
  const [conversations, setConversations] = useState<ConversationItem[]>(initialConversations)
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(initialConversations[0])
  const [inboxChannelFilter, setInboxChannelFilter] = useState<string>('ALL')
  const [inboxSearch, setInboxSearch] = useState('')
  const [inboxReply, setInboxReply] = useState('')

  const [majorIncidents, setMajorIncidents] = useState<MajorIncidentItem[]>(initialMajorIncidents)
  const [selectedMajorIncident, setSelectedMajorIncident] = useState<MajorIncidentItem | null>(initialMajorIncidents[0])

  const [problems, setProblems] = useState<ProblemItem[]>(initialProblems)
  const [selectedProblem, setSelectedProblem] = useState<ProblemItem | null>(initialProblems[0])
  const [problemSearch, setProblemSearch] = useState('')

  const [incidents, setIncidents] = useState<IncidentItem[]>(initialIncidents)
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(initialIncidents[0])
  const [incidentSearch, setIncidentSearch] = useState('')

  const [workflows, setWorkflows] = useState<WorkflowRule[]>(initialWorkflows)
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>(initialWorkflowRuns)

  const [customerSearchQuery, setCustomerSearchQuery] = useState('João Silva Oliveira')
  const [customerTags, setCustomerTags] = useState<string[]>(['VIP Diamond', 'Biometria Facial OK', 'NPS 10 Promotor', 'Comprador Frequente'])
  const [newCustomerTag, setNewCustomerTag] = useState('')

  const [tickets, setTickets] = useState<TicketItem[]>(mockTickets)
  const [agents, setAgents] = useState<AgentItem[]>(initialAgents)
  const [queues, setQueues] = useState<QueueItem[]>(initialQueues)
  const [slaPolicies, setSlaPolicies] = useState<SLAPolicy[]>(initialSLAPolicies)
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(mockTickets[0])
  const [ticketSearch, setTicketSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('TODOS')
  const [statusFilter, setStatusFilter] = useState<string>('TODOS')
  const [newReply, setNewReply] = useState('')

  useEffect(() => {
    if (!mode) return
    if (mode === 'hub') setActiveTab('hub')
    else if (mode === 'dashboard') setActiveTab('dashboard')
    else if (mode === 'inbox' || mode === 'integrations') setActiveTab('inbox')
    else if (mode === 'tickets') setActiveTab('tickets')
    else if (mode === 'major') setActiveTab('major')
    else if (mode === 'incidents') setActiveTab('incidents')
    else if (mode === 'problems') setActiveTab('problems')
    else if (mode === 'client360' || mode === 'reports') setActiveTab('client360')
    else if (mode === 'workflows') setActiveTab('workflows')
    else if (mode === 'sla') setActiveTab('sla')
    else if (mode === 'knowledge') setActiveTab('knowledge')
    else if (mode === 'teams') setActiveTab('teams')
  }, [mode])

  // Simulador SLA Event-Aware
  const [eventAwareProximity, setEventAwareProximity] = useState<'GT_7D' | 'LE_7D' | 'LE_24H' | 'LE_2H' | 'LIVE'>('LE_24H')

  // Form Abrir Chamado
  const [formChannel, setFormChannel] = useState<'WHATSAPP' | 'EMAIL' | 'CHAT' | 'PHONE' | 'FORM'>('WHATSAPP')
  const [formSubject, setFormSubject] = useState('Ingresso não recebido após aprovação Pix')
  const [formDescription, setFormDescription] = useState('Cliente realizou pagamento via Pix, valor debitado e necessita de reenvio do QR Code.')
  const [formPriority, setFormPriority] = useState<'P1' | 'P2' | 'P3' | 'P4'>('P2')
  const [formCustomerName, setFormCustomerName] = useState('Roberto Almeida')
  const [formCustomerEmail, setFormCustomerEmail] = useState('roberto.almeida@email.com')
  const [formCustomerPhone, setFormCustomerPhone] = useState('(41) 99881-2233')
  const [formEventId, setFormEventId] = useState<string>(events[0]?.id ? String(events[0].id) : '1')
  const [formOrderCode, setFormOrderCode] = useState('DI-985100')
  const [formQueueId, setFormQueueId] = useState<number>(1)

  const [kbSearch, setKbSearch] = useState('')

  const stats = useMemo(() => {
    const total = tickets.length
    const open = tickets.filter(t => t.status !== 'RESOLVIDO' && t.status !== 'FECHADO').length
    const p1 = tickets.filter(t => t.priority === 'P1' && t.status !== 'RESOLVIDO').length
    const resolved = tickets.filter(t => t.status === 'RESOLVIDO').length
    const compliance = 96.4
    const onlineAgents = agents.filter(a => a.status === 'ONLINE' || a.status === 'BUSY').length
    const unreadOmnichannel = conversations.reduce((acc, c) => acc + c.unreadCount, 0)
    const openIncidents = incidents.filter(i => i.status !== 'RESOLVIDO' && i.status !== 'FECHADO').length
    const activeMajorIncidents = majorIncidents.filter(m => m.status !== 'RESOLVED' && m.status !== 'CLOSED').length
    const knownErrorsCount = problems.filter(p => p.status === 'KNOWN_ERROR').length
    return { total, open, p1, resolved, compliance, onlineAgents, unreadOmnichannel, openIncidents, activeMajorIncidents, knownErrorsCount }
  }, [tickets, agents, conversations, incidents, majorIncidents, problems])

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchSearch =
        t.protocol.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        t.customerName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        t.orderCode.toLowerCase().includes(ticketSearch.toLowerCase())

      const matchPriority = priorityFilter === 'TODOS' || t.priority === priorityFilter
      const matchStatus = statusFilter === 'TODOS' || t.status === statusFilter

      return matchSearch && matchPriority && matchStatus
    })
  }, [tickets, ticketSearch, priorityFilter, statusFilter])

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      const matchChannel = inboxChannelFilter === 'ALL' || c.channel === inboxChannelFilter
      const matchSearch =
        c.contactName.toLowerCase().includes(inboxSearch.toLowerCase()) ||
        c.contactValue.toLowerCase().includes(inboxSearch.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(inboxSearch.toLowerCase()) ||
        (c.ticketNumber && c.ticketNumber.toLowerCase().includes(inboxSearch.toLowerCase()))
      return matchChannel && matchSearch
    })
  }, [conversations, inboxChannelFilter, inboxSearch])

  const filteredIncidents = useMemo(() => {
    return incidents.filter(i => {
      return (
        i.code.toLowerCase().includes(incidentSearch.toLowerCase()) ||
        i.title.toLowerCase().includes(incidentSearch.toLowerCase()) ||
        i.eventName.toLowerCase().includes(incidentSearch.toLowerCase()) ||
        i.affectedServices.some(s => s.toLowerCase().includes(incidentSearch.toLowerCase()))
      )
    })
  }, [incidents, incidentSearch])

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      return (
        p.problemNumber.toLowerCase().includes(problemSearch.toLowerCase()) ||
        p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(problemSearch.toLowerCase()) ||
        p.workaround.toLowerCase().includes(problemSearch.toLowerCase())
      )
    })
  }, [problems, problemSearch])

  const simulatedPriority = useMemo(() => {
    switch (eventAwareProximity) {
      case 'LIVE': return { p: 'P1', label: 'P1 - Operacional Portão (Crítica)', frt: '5 min', res: '30 min', action: 'Atendimento prioritário na portaria do evento' }
      case 'LE_2H': return { p: 'P1', label: 'P1 - Crítica (< 2 horas para início)', frt: '15 min', res: '1 hora', action: 'Roteamento imediato para plantão de catracas' }
      case 'LE_24H': return { p: 'P2', label: 'P2 - Alta (< 24 horas)', frt: '30 min', res: '2 horas', action: 'Fila prioritária de emissão e reenvio WhatsApp' }
      case 'LE_7D': return { p: 'P3', label: 'P3 - Média (<= 7 dias)', frt: '2 horas', res: '8 horas', action: 'Atendimento regular com SLA controlado' }
      default: return { p: 'P4', label: 'P4 - Normal (> 7 dias)', frt: '4 horas', res: '24 horas', action: 'Fila de esclarecimento de dúvidas e autosserviço' }
    }
  }, [eventAwareProximity])

  const handleRecalculateAllSLA = () => {
    notify('Motor SLA Engine recalculou os timers de todos os chamados com base nas regras Event-Aware!')
  }

  const handleToggleAgentStatus = (agentId: number) => {
    const nextStatus: Record<string, 'ONLINE' | 'BUSY' | 'AWAY' | 'OFFLINE'> = {
      'ONLINE': 'BUSY',
      'BUSY': 'AWAY',
      'AWAY': 'OFFLINE',
      'OFFLINE': 'ONLINE'
    }
    setAgents(agents.map(a => a.id === agentId ? { ...a, status: nextStatus[a.status] || 'ONLINE' } : a))
    const ag = agents.find(a => a.id === agentId)
    if (ag) {
      notify(`Status do agente ${ag.name} alterado para ${nextStatus[ag.status]}.`)
    }
  }

  const handleAutoAssign = (ticketId: number) => {
    const available = agents.filter(a => a.status === 'ONLINE' && a.activeTickets < a.capacity)
    const assignedTo = available.length > 0 ? available.sort((a, b) => a.activeTickets - b.activeTickets)[0].name : 'Lucas Atendente (N1)'
    
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, assignedAgent: assignedTo, status: 'EM_ATENDIMENTO' } : t))
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, assignedAgent: assignedTo, status: 'EM_ATENDIMENTO' })
    }
    notify(`Ticket atribuído automaticamente a ${assignedTo} via algoritmo Least-Load!`)
  }

  const handleTransferQueue = (ticketId: number, targetQueue: string) => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, queueName: targetQueue } : t))
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, queueName: targetQueue })
    }
    notify(`Chamado transferido para a fila: ${targetQueue}!`)
  }

  const handleSendMessage = () => {
    if (!newReply.trim() || !selectedTicket) return
    const updated = {
      ...selectedTicket,
      messages: [
        ...selectedTicket.messages,
        {
          id: Date.now(),
          author: 'Você (Agente Disk Service)',
          authorType: 'AGENT' as const,
          channel: selectedTicket.channel,
          body: newReply,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    }
    setSelectedTicket(updated)
    setTickets(tickets.map(t => t.id === updated.id ? updated : t))
    setNewReply('')
    notify(`Resposta enviada ao cliente via ${selectedTicket.channel}!`)
  }

  const handleSendInboxMessage = () => {
    if (!inboxReply.trim() || !selectedConversation) return
    const updated: ConversationItem = {
      ...selectedConversation,
      unreadCount: 0,
      lastMessage: inboxReply,
      updatedAt: 'Agora',
      messages: [
        ...selectedConversation.messages,
        {
          id: Date.now(),
          senderName: 'Atendimento DiskIngressos',
          direction: 'OUTBOUND',
          body: inboxReply,
          deliveryStatus: 'DELIVERED',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    }
    setSelectedConversation(updated)
    setConversations(conversations.map(c => c.id === updated.id ? updated : c))
    setInboxReply('')
    notify(`Mensagem enviada com sucesso via ${selectedConversation.channel}! Status: DELIVERED.`)
  }

  const handleToggleWorkflow = (wfId: number) => {
    setWorkflows(workflows.map(w => w.id === wfId ? { ...w, isActive: !w.isActive } : w))
    const wf = workflows.find(w => w.id === wfId)
    notify(`Regra "${wf?.name}" ${wf?.isActive ? 'desativada' : 'ativada com sucesso'}!`)
  }

  const handleTestWorkflow = (wf: WorkflowRule) => {
    const newRun: WorkflowRun = {
      id: Date.now(),
      workflowName: wf.name,
      ticketNumber: 'DS-2026-984221',
      triggerEvent: wf.triggerEvent,
      status: 'SUCCESS',
      executionTimeMs: Math.floor(45 + Math.random() * 90),
      createdAt: 'Agora'
    }
    setWorkflowRuns([newRun, ...workflowRuns])
    setWorkflows(workflows.map(w => w.id === wf.id ? { ...w, runsCount: w.runsCount + 1, successCount: w.successCount + 1 } : w))
    notify(`Workflow "${wf.name}" executado com sucesso em ${newRun.executionTimeMs}ms! Ações disparadas: ${wf.actions.join(', ')}`)
  }

  const handleAddCustomerTag = () => {
    if (!newCustomerTag.trim()) return
    if (!customerTags.includes(newCustomerTag.trim())) {
      setCustomerTags([...customerTags, newCustomerTag.trim()])
      notify(`Tag "${newCustomerTag.trim()}" adicionada ao perfil do cliente!`)
    }
    setNewCustomerTag('')
  }

  const handleResolveMajorIncident = (majorId: number) => {
    const updated = majorIncidents.map(m => m.id === majorId ? {
      ...m,
      status: 'RESOLVED' as const,
      mttrMinutes: 48,
      communications: [
        ...m.communications,
        {
          id: Date.now(),
          cadence: '11:45 (Resolução)',
          message: 'Incidente crítico solucionado com sucesso. Estabilidade restabelecida e follow-up para Problem Management criado.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    } : m)
    setMajorIncidents(updated)
    if (selectedMajorIncident?.id === majorId) {
      setSelectedMajorIncident(updated.find(m => m.id === majorId) || null)
    }
    notify(`Major Incident #${majorId} RESOLVIDO com sucesso! MTTR final: 48 minutos. Follow-up gerado no Problem Management.`)
  }

  const handleResolveProblem = (probId: number) => {
    const updated = problems.map(p => p.id === probId ? {
      ...p,
      status: 'RESOLVED' as const,
      actionPlans: p.actionPlans.map(a => ({ ...a, status: 'DONE' as const }))
    } : p)
    setProblems(updated)
    if (selectedProblem?.id === probId) {
      setSelectedProblem(updated.find(p => p.id === probId) || null)
    }
    notify(`Problema #${probId} resolvido com validação permanente de causa raiz e planos de ação concluídos!`)
  }

  const handleResolveTicket = (ticketId: number) => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'RESOLVIDO' as const, resolvedAt: 'Agora mesmo' } : t))
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: 'RESOLVIDO', resolvedAt: 'Agora mesmo' })
    }
    notify('Chamado finalizado e marcado como RESOLVIDO com sucesso!')
  }

  const handleCreateTicket = (e: FormEvent) => {
    e.preventDefault()
    const newId = tickets.length + 1
    const newProtocol = `DS-2026-${Math.floor(100000 + Math.random() * 900000)}`
    const selectedQ = queues.find(q => q.id === formQueueId)?.name || 'Reenvio & Ingressos'
    
    const created: TicketItem = {
      id: newId,
      protocol: newProtocol,
      subject: formSubject,
      description: formDescription,
      channel: formChannel,
      priority: formPriority,
      status: 'NOVO',
      customerName: formCustomerName,
      customerEmail: formCustomerEmail,
      customerPhone: formCustomerPhone,
      eventName: events.find(e => String(e.id) === formEventId)?.title || 'Evento Geral',
      orderCode: formOrderCode,
      amount: 'R$ 240,00',
      assignedAgent: 'Lucas Atendente (N1)',
      queueName: selectedQ,
      slaResponseMinutes: formPriority === 'P1' ? 15 : formPriority === 'P2' ? 60 : formPriority === 'P3' ? 240 : 720,
      slaResolutionMinutes: formPriority === 'P1' ? 120 : formPriority === 'P2' ? 360 : formPriority === 'P3' ? 1440 : 2880,
      slaProgressPercent: 10,
      slaTimeRemaining: formPriority === 'P1' ? '01h 50min' : formPriority === 'P2' ? '05h 30min' : '23h 40min',
      createdAt: 'Agora mesmo',
      messages: [
        {
          id: 1,
          author: formCustomerName,
          authorType: 'CUSTOMER',
          channel: formChannel,
          body: formDescription,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    }
    setTickets([created, ...tickets])
    notify(`Chamado protocolado com sucesso: ${newProtocol}! SLA ativado na fila ${selectedQ}.`)
    setActiveTab('tickets')
    setSelectedTicket(created)
  }

  return (
    <div className="support-module-container" style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Header Principal */}
      <header className="support-main-header">
        <div className="header-brand-block">
          <div className="service-badge">
            <Headphones size={18} />
            <span>DISK SERVICE • SAC + SLA + MAJOR INCIDENTS + PROBLEM MANAGEMENT (ITIL)</span>
          </div>
          <h1>Central de Atendimento & Suporte</h1>
          <p>Dashboard operacional em tempo real, War Room de Major Incidents P1, Problem Management (RCA) e Omnichannel Desk.</p>
        </div>

        <div className="header-status-block">
          <div className="agent-status-indicator">
            <span className="dot pulse-green" />
            <span>{stats.onlineAgents} Agentes Online • SLA {stats.compliance}%</span>
          </div>
          <button className="primary-service-btn" onClick={() => setActiveTab('new')}>
            <Plus size={18} />
            <span>Abrir Chamado</span>
          </button>
        </div>
      </header>

      {/* Sub-Navegação em Abas Modernas com Fases 22.1 a 22.9 */}
      <nav className="service-nav-tabs">
        <button className={`service-tab-btn ${activeTab === 'hub' ? 'active' : ''}`} onClick={() => setActiveTab('hub')}>
          <LifeBuoy size={17} />
          <span>Hub Geral</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <LayoutDashboard size={17} />
          <span>Dashboard Operacional</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'major' ? 'active' : ''}`} onClick={() => setActiveTab('major')}>
          <Siren size={17} />
          <span>Major Incidents (P1)</span>
          {stats.activeMajorIncidents > 0 && <span className="tab-pill danger">{stats.activeMajorIncidents} War Room</span>}
        </button>
        <button className={`service-tab-btn ${activeTab === 'problems' ? 'active' : ''}`} onClick={() => setActiveTab('problems')}>
          <Bug size={17} />
          <span>Problem Management (RCA)</span>
          <span className="tab-pill">{stats.knownErrorsCount} KEDB</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'incidents' ? 'active' : ''}`} onClick={() => setActiveTab('incidents')}>
          <ShieldAlert size={17} />
          <span>Incidentes ITIL</span>
          {stats.openIncidents > 0 && <span className="tab-pill danger">{stats.openIncidents} P1</span>}
        </button>
        <button className={`service-tab-btn ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}>
          <MessagesSquare size={17} />
          <span>Inbox Omnichannel</span>
          {stats.unreadOmnichannel > 0 && <span className="tab-pill danger">{stats.unreadOmnichannel}</span>}
        </button>
        <button className={`service-tab-btn ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>
          <Ticket size={17} />
          <span>Chamados & Fila</span>
          <span className="tab-pill">{stats.open}</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'client360' ? 'active' : ''}`} onClick={() => setActiveTab('client360')}>
          <UserRound size={17} />
          <span>Cliente 360°</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'workflows' ? 'active' : ''}`} onClick={() => setActiveTab('workflows')}>
          <Workflow size={17} />
          <span>Automações</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'sla' ? 'active' : ''}`} onClick={() => setActiveTab('sla')}>
          <Gauge size={17} />
          <span>Motor de SLA</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'knowledge' ? 'active' : ''}`} onClick={() => setActiveTab('knowledge')}>
          <BookOpen size={17} />
          <span>Base de Conhecimento</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'teams' ? 'active' : ''}`} onClick={() => setActiveTab('teams')}>
          <Users size={17} />
          <span>Filas & Agentes</span>
        </button>
      </nav>

      {/* CONTEÚDO DAS ABAS */}

      {/* 0. ABA: HUB DE ATENDIMENTO */}
      {activeTab === 'hub' && (
        <div className="service-content-body">
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '16px',
            padding: '24px 28px',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ background: '#38bdf8', color: '#0f172a', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                  CENTRAL UNIFICADA FASE 22.9
                </span>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Produtora: {producerName}</span>
              </div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 800 }}>
                Disk Service Enterprise ITIL Desk
              </h2>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '14px', maxWidth: '650px' }}>
                Ciclo completo ITIL: Atendimento Omnichannel, War Room de Major Incidents P1, Análise de Causa Raiz (RCA) e Gestão de Problemas.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="primary-service-btn" onClick={() => setActiveTab('major')} style={{ background: '#dc2626' }}>
                <Siren size={16} />
                <span>War Room P1 ({stats.activeMajorIncidents})</span>
              </button>
              <button className="primary-service-btn" onClick={() => setActiveTab('problems')} style={{ background: '#7c3aed' }}>
                <Bug size={16} />
                <span>Problem Mgmt ({problems.length})</span>
              </button>
              <button className="primary-service-btn" onClick={() => setActiveTab('dashboard')} style={{ background: '#2563eb' }}>
                <LayoutDashboard size={16} />
                <span>Dashboard Operacional</span>
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div className="service-card-panel" style={{ cursor: 'pointer', borderLeft: '4px solid #dc2626' }} onClick={() => setActiveTab('major')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', display: 'grid', placeItems: 'center' }}>
                  <Siren size={20} />
                </div>
                <span className="badge-count danger">{stats.activeMajorIncidents} Ativo</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>Major Incidents (Fase 22.9)</h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                Incident Commander, War Room em tempo real, cadência de comunicação a cada 15 min e MTTR.
              </p>
              <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Acessar War Room <ArrowRight size={14} />
              </span>
            </div>

            <div className="service-card-panel" style={{ cursor: 'pointer', borderLeft: '4px solid #7c3aed' }} onClick={() => setActiveTab('problems')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', display: 'grid', placeItems: 'center' }}>
                  <Bug size={20} />
                </div>
                <span className="badge-count">{problems.length} Problemas</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>Problem Management (Fase 22.8)</h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                Análise de Causa Raiz (5 Whys / Ishikawa), Known Errors (KEDB) e planos de ação definitivos.
              </p>
              <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Investigar Problemas <ArrowRight size={14} />
              </span>
            </div>

            <div className="service-card-panel" style={{ cursor: 'pointer', borderLeft: '4px solid #3b82f6' }} onClick={() => setActiveTab('dashboard')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center' }}>
                  <LayoutDashboard size={20} />
                </div>
                <span className="badge-count" style={{ background: '#ecfdf5', color: '#047857' }}>{stats.compliance}% SLA</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>Dashboard Operacional</h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                Monitoramento de filas em tempo real, FRT, MTTR, volume de tickets e saúde de atendimento.
              </p>
              <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Ver Dashboard <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 1. ABA: DASHBOARD OPERACIONAL COMPLETO */}
      {activeTab === 'dashboard' && (
        <div className="service-content-body">
          <div className="service-kpi-grid">
            <div className="service-kpi-card blue">
              <div className="kpi-icon-wrap"><Ticket size={22} /></div>
              <div className="kpi-info">
                <span>Chamados em Aberto</span>
                <strong>{stats.open}</strong>
                <small>Backlog operacional ativo</small>
              </div>
            </div>

            <div className="service-kpi-card green">
              <div className="kpi-icon-wrap"><Clock3 size={22} /></div>
              <div className="kpi-info">
                <span>Conformidade de SLA</span>
                <strong>{stats.compliance}%</strong>
                <small>Meta operacional ≥ 95%</small>
              </div>
            </div>

            <div className="service-kpi-card red">
              <div className="kpi-icon-wrap"><Siren size={22} /></div>
              <div className="kpi-info">
                <span>Major Incidents (P1)</span>
                <strong>{stats.activeMajorIncidents}</strong>
                <small>War Room ativa em tempo real</small>
              </div>
            </div>

            <div className="service-kpi-card purple">
              <div className="kpi-icon-wrap"><Bug size={22} /></div>
              <div className="kpi-info">
                <span>Known Errors (KEDB)</span>
                <strong>{stats.knownErrorsCount}</strong>
                <small>Workarounds documentados</small>
              </div>
            </div>
          </div>

          <div className="service-two-col-grid" style={{ marginBottom: '20px' }}>
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Filas de Atendimento & Estratégias</h3>
                  <p>Distribuição automática (Round-Robin & Least-Load).</p>
                </div>
                <span className="live-pill">AO VIVO</span>
              </div>

              <div className="queue-list">
                {queues.map(q => (
                  <div key={q.id} className="queue-item">
                    <div className="queue-title-block">
                      <span className="queue-dot blue" />
                      <div>
                        <strong>{q.name}</strong>
                        <small style={{ display: 'block', color: '#64748b' }}>Estratégia: {q.strategy}</small>
                      </div>
                    </div>
                    <div className="queue-metric-block">
                      <span className="badge-count">{q.openTickets} tickets</span>
                      <small>{q.agentsCount} agentes</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Saúde do SLA Operacional</h3>
                  <p>Cumprimento de 1ª resposta e resolução no prazo.</p>
                </div>
                <span className="badge-status green">ITIL COMPLIANT</span>
              </div>

              <div className="sla-ring-container">
                <div className="sla-ring-graphic">
                  <span className="ring-value">96.4%</span>
                  <span className="ring-label">SLA GLOBAL</span>
                </div>
                <div className="sla-metrics-summary">
                  <div className="sla-mini-stat">
                    <span>1ª Resposta Média (FRT)</span>
                    <strong>8 minutos</strong>
                  </div>
                  <div className="sla-mini-stat">
                    <span>Tempo Médio Resolução (MTTR)</span>
                    <strong>42 minutos</strong>
                  </div>
                  <div className="sla-mini-stat">
                    <span>Resolução no 1º Contato (FCR)</span>
                    <strong>78.2%</strong>
                  </div>
                </div>
              </div>

              <div className="copilot-tip-box">
                <div className="copilot-head">
                  <Sparkles size={16} />
                  <strong>Disk Copilot (IA) Ativado</strong>
                </div>
                <p>82% das solicitações de reenvio de ingresso foram solucionadas automaticamente pelo bot do WhatsApp sem necessidade de intervenção humana.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ABA: MAJOR INCIDENTS P1 (FASE 22.9) */}
      {activeTab === 'major' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #1c1917 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Siren size={22} style={{ color: '#fca5a5' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Major Incident Management (Incidentes Críticos P1)</h3>
              </div>
              <p style={{ margin: 0, color: '#fecaca' }}>
                Incident Commander dedicado, War Room ao vivo, cadência de comunicação a cada 15 min e acompanhamento de MTTA/MTTR.
              </p>
            </div>
            <button className="primary-service-btn danger" onClick={() => notify('Iniciando declaração de Major Incident P1...')}>
              <Flame size={16} />
              <span>Declarar Major Incident P1</span>
            </button>
          </div>

          <div className="ticket-split-layout" style={{ marginTop: '20px' }}>
            <div className="ticket-list-panel">
              <div className="list-count-header">
                <strong>{majorIncidents.length} Major Incidents registrados</strong>
              </div>

              <div className="tickets-scroll-container">
                {majorIncidents.map(m => (
                  <div
                    key={m.id}
                    className={`ticket-summary-card ${selectedMajorIncident?.id === m.id ? 'active' : ''} P1`}
                    onClick={() => setSelectedMajorIncident(m)}
                  >
                    <div className="ticket-top-row">
                      <span className="inc-severity-tag" style={{ background: '#dc2626' }}>{m.majorNumber}</span>
                      <span className={`status-tag ${m.status}`}>{m.status.replace('_', ' ')}</span>
                    </div>

                    <h4 className="ticket-card-subject">{m.title}</h4>
                    <small style={{ color: '#64748b', display: 'block', margin: '4px 0' }}>{m.eventName}</small>

                    <div className="ticket-bottom-info">
                      <span>Commander: {m.commanderName.split(' ')[0]}</span>
                      <small>{m.startedAt}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ticket-detail-panel">
              {selectedMajorIncident ? (
                <div className="ticket-workspace">
                  <div className="workspace-header">
                    <div>
                      <div className="protocol-meta">
                        <span className="inc-severity-tag" style={{ background: '#dc2626' }}>CRÍTICO P1</span>
                        <span className="protocol-num">{selectedMajorIncident.majorNumber}</span>
                        <span className={`status-tag ${selectedMajorIncident.status}`}>{selectedMajorIncident.status.replace('_', ' ')}</span>
                      </div>
                      <h2>{selectedMajorIncident.title}</h2>
                      <p style={{ margin: '6px 0 0', color: '#475569', fontSize: '13px' }}>{selectedMajorIncident.summary}</p>
                    </div>

                    <div className="workspace-actions">
                      {selectedMajorIncident.status !== 'RESOLVED' && (
                        <button className="resolve-btn" onClick={() => handleResolveMajorIncident(selectedMajorIncident.id)}>
                          <ShieldCheck size={16} />
                          <span>Resolver Major Incident</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="workspace-context-card">
                    <div className="ctx-item">
                      <span>Incident Commander</span>
                      <strong>{selectedMajorIncident.commanderName}</strong>
                      <small>War Room: <a href={selectedMajorIncident.warRoomUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>Acessar Link</a></small>
                    </div>

                    <div className="ctx-item">
                      <span>MTTA & MTTR</span>
                      <strong>MTTA: {selectedMajorIncident.mttaMinutes} min</strong>
                      <small>MTTR: {selectedMajorIncident.mttrMinutes ? `${selectedMajorIncident.mttrMinutes} min` : 'Em andamento'}</small>
                    </div>

                    <div className="ctx-item">
                      <span>Serviços Afetados</span>
                      <strong style={{ color: '#dc2626' }}>{selectedMajorIncident.affectedServices.length} serviços</strong>
                      <small>{selectedMajorIncident.affectedServices.join(', ')}</small>
                    </div>
                  </div>

                  {/* Equipes e Participantes da War Room */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Users size={16} style={{ color: '#2563eb' }} />
                      <strong style={{ fontSize: '12px' }}>PARTICIPANTES MOBILIZADOS NA WAR ROOM:</strong>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                      {selectedMajorIncident.participants.map(p => (
                        <div key={p.id} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '8px 10px', borderRadius: '6px' }}>
                          <strong style={{ fontSize: '12px', display: 'block', color: '#0f172a' }}>{p.name}</strong>
                          <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>{p.role}</span> • <small style={{ color: '#64748b' }}>{p.team}</small>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comunicações Executivas (Cadência a cada 15 min) */}
                  <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#0f172a' }}>Comunicações Executivas (Cadência 15 Min)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedMajorIncident.communications.map(c => (
                        <div key={c.id} style={{ padding: '8px 12px', background: '#fff7ed', borderLeft: '3px solid #ea580c', borderRadius: '6px' }}>
                          <strong style={{ fontSize: '11px', color: '#ea580c' }}>{c.cadence} ({c.timestamp})</strong>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#334155' }}>{c.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-ticket-selected">
                  <Siren size={48} />
                  <h3>Selecione um Major Incident</h3>
                  <p>Acompanhe a War Room, comunique as partes interessadas e resolva incidentes críticos.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. ABA: PROBLEM MANAGEMENT & RCA (FASE 22.8) */}
      {activeTab === 'problems' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #3b0764 0%, #0f172a 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Bug size={22} style={{ color: '#d8b4fe' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Problem Management & Análise de Causa Raiz (RCA)</h3>
              </div>
              <p style={{ margin: 0, color: '#e9d5ff' }}>
                Investigação de causas raízes com 5 Whys / Ishikawa, catálogo Known Errors (KEDB) e planos de ação preventivos.
              </p>
            </div>
            <button className="primary-service-btn" onClick={() => notify('Abrindo formulário de criação de Problema ITIL...')}>
              <Plus size={16} />
              <span>Registrar Novo Problema</span>
            </button>
          </div>

          <div className="ticket-split-layout" style={{ marginTop: '20px' }}>
            <div className="ticket-list-panel">
              <div className="list-count-header">
                <div className="search-input-wrap" style={{ height: '38px' }}>
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Buscar problema ou known error..."
                    value={problemSearch}
                    onChange={e => setProblemSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="tickets-scroll-container">
                {filteredProblems.map(p => (
                  <div
                    key={p.id}
                    className={`ticket-summary-card ${selectedProblem?.id === p.id ? 'active' : ''}`}
                    onClick={() => setSelectedProblem(p)}
                  >
                    <div className="ticket-top-row">
                      <span className="channel-badge" style={{ background: '#f5f3ff', color: '#7c3aed', fontWeight: 800 }}>{p.problemNumber}</span>
                      <span className="badge-status orange">{p.status}</span>
                    </div>

                    <h4 className="ticket-card-subject">{p.title}</h4>
                    <small style={{ color: '#64748b', display: 'block', margin: '4px 0' }}>{p.category}</small>

                    <div className="ticket-bottom-info">
                      <span>{p.linkedIncidents.length} incidentes vinculados</span>
                      <small>{p.createdAt}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ticket-detail-panel">
              {selectedProblem ? (
                <div className="ticket-workspace">
                  <div className="workspace-header">
                    <div>
                      <div className="protocol-meta">
                        <span className="channel-badge" style={{ background: '#7c3aed', color: '#fff' }}>{selectedProblem.problemNumber}</span>
                        <span className="status-tag RESOLVIDO">{selectedProblem.status}</span>
                        <span className={`priority-tag ${selectedProblem.priority}`}>{selectedProblem.priority}</span>
                      </div>
                      <h2>{selectedProblem.title}</h2>
                      <p style={{ margin: '6px 0 0', color: '#475569', fontSize: '13px' }}>{selectedProblem.description}</p>
                    </div>

                    <div className="workspace-actions">
                      {selectedProblem.status !== 'RESOLVED' && (
                        <button className="resolve-btn" onClick={() => handleResolveProblem(selectedProblem.id)}>
                          <ShieldCheck size={16} />
                          <span>Concluir Resolução Permanente</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="workspace-context-card">
                    <div className="ctx-item">
                      <span>Responsável pelo RCA</span>
                      <strong>{selectedProblem.ownerName}</strong>
                      <small>Método: {selectedProblem.rcaMethod.replace('_', ' ')}</small>
                    </div>

                    <div className="ctx-item">
                      <span>Incidentes Relacionados</span>
                      <strong style={{ color: '#dc2626' }}>{selectedProblem.linkedIncidents.length} incidentes</strong>
                      <small>{selectedProblem.linkedIncidents.join(', ')}</small>
                    </div>

                    <div className="ctx-item">
                      <span>Status KEDB</span>
                      <strong style={{ color: '#059669' }}>Known Error Ativo</strong>
                      <small>Workaround disponível para SAC</small>
                    </div>
                  </div>

                  {/* Análise de Causa Raiz (RCA Findings) */}
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Lightbulb size={16} style={{ color: '#2563eb' }} />
                      <strong style={{ color: '#1e40af', fontSize: '12px' }}>ANÁLISE DE CAUSA RAIZ (RCA - 5 WHYS):</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#1e3a8a', lineHeight: 1.5 }}>{selectedProblem.rcaFindings}</p>
                  </div>

                  {/* Workaround */}
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Wrench size={16} style={{ color: '#059669' }} />
                      <strong style={{ color: '#065f46', fontSize: '12px' }}>WORKAROUND DOCUMENTADO (KEDB):</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#047857', lineHeight: 1.5 }}>{selectedProblem.workaround}</p>
                  </div>

                  {/* Planos de Ação Preventivos */}
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#0f172a' }}>Planos de Ação Corretivos e Preventivos</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedProblem.actionPlans.map(act => (
                        <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                          <div>
                            <strong style={{ fontSize: '13px', color: '#0f172a' }}>{act.task}</strong>
                            <small style={{ display: 'block', color: '#64748b' }}>Responsável: {act.assignee}</small>
                          </div>
                          <span className={act.status === 'DONE' ? 'status-pill green' : 'badge-status orange'}>
                            {act.status === 'DONE' ? 'Concluído' : 'Pendente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-ticket-selected">
                  <Bug size={48} />
                  <h3>Selecione um problema na lista</h3>
                  <p>Visualize as análises de causa raiz, consulte Known Errors e acompanhe planos de ação.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. ABA: INCIDENTES ITIL (FASE 22.7) */}
      {activeTab === 'incidents' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #450a0a 0%, #1c1917 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ShieldAlert size={22} style={{ color: '#f87171' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Gestão de Incidentes ITIL (Incident Management)</h3>
              </div>
              <p style={{ margin: 0, color: '#fca5a5' }}>
                Matriz de Impacto × Urgência, controle de serviços afetados, agrupamento de tickets e resolução em lote.
              </p>
            </div>
            <button className="primary-service-btn danger" onClick={() => notify('Modal de Abertura de Incidente ITIL acionado.')}>
              <Flame size={16} />
              <span>Declarar Incidente Crítico P1</span>
            </button>
          </div>

          <div className="ticket-split-layout" style={{ marginTop: '20px' }}>
            <div className="ticket-list-panel">
              <div className="list-count-header">
                <div className="search-input-wrap" style={{ height: '38px' }}>
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Buscar incidente ou serviço..."
                    value={incidentSearch}
                    onChange={e => setIncidentSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="tickets-scroll-container">
                {filteredIncidents.map(inc => (
                  <div
                    key={inc.id}
                    className={`ticket-summary-card ${selectedIncident?.id === inc.id ? 'active' : ''} ${inc.severity}`}
                    onClick={() => setSelectedIncident(inc)}
                  >
                    <div className="ticket-top-row">
                      <span className="inc-severity-tag" style={{ background: inc.severity === 'P1' ? '#dc2626' : '#ea580c' }}>
                        {inc.severity} - {inc.code}
                      </span>
                      <span className={`status-tag ${inc.status}`}>{inc.status}</span>
                    </div>

                    <h4 className="ticket-card-subject">{inc.title}</h4>
                    <small style={{ color: '#64748b', display: 'block', margin: '4px 0' }}>{inc.eventName}</small>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '6px 0' }}>
                      {inc.affectedServices.map(svc => (
                        <span key={svc} style={{ background: '#f1f5f9', color: '#475569', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
                          🖥️ {svc}
                        </span>
                      ))}
                    </div>

                    <div className="ticket-bottom-info">
                      <span>{inc.linkedTickets.length} tickets vinculados</span>
                      <small>{inc.startedAt}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ticket-detail-panel">
              {selectedIncident ? (
                <div className="ticket-workspace">
                  <div className="workspace-header">
                    <div>
                      <div className="protocol-meta">
                        <span className="inc-severity-tag" style={{ background: '#dc2626' }}>{selectedIncident.severity}</span>
                        <span className="protocol-num">{selectedIncident.code}</span>
                        <span className={`status-tag ${selectedIncident.status}`}>{selectedIncident.status}</span>
                      </div>
                      <h2>{selectedIncident.title}</h2>
                      <p style={{ margin: '6px 0 0', color: '#475569', fontSize: '13px' }}>{selectedIncident.description}</p>
                    </div>
                  </div>

                  <div className="workspace-context-card">
                    <div className="ctx-item">
                      <span>Matriz ITIL</span>
                      <strong>Impacto {selectedIncident.impact} × Urgência {selectedIncident.urgency}</strong>
                      <small>Prioridade: {selectedIncident.severity}</small>
                    </div>

                    <div className="ctx-item">
                      <span>Líder do Incidente</span>
                      <strong>{selectedIncident.leadAgent}</strong>
                      <small>Evento: {selectedIncident.eventName}</small>
                    </div>

                    <div className="ctx-item">
                      <span>Tickets Impactados</span>
                      <strong style={{ color: '#dc2626' }}>{selectedIncident.linkedTickets.length} chamados</strong>
                      <small>{selectedIncident.linkedTickets.join(', ')}</small>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-ticket-selected">
                  <ShieldAlert size={48} />
                  <h3>Selecione um incidente na lista</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. ABA: INBOX OMNICHANNEL (FASE 22.4) */}
      {activeTab === 'inbox' && (
        <div className="service-content-body">
          <div className="ticket-split-layout">
            <div className="ticket-list-panel">
              <div className="list-count-header">
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  <button
                    className={`fast-action-chip ${inboxChannelFilter === 'ALL' ? 'active' : ''}`}
                    onClick={() => setInboxChannelFilter('ALL')}
                    style={{ background: inboxChannelFilter === 'ALL' ? '#2563eb' : '#fff', color: inboxChannelFilter === 'ALL' ? '#fff' : '#334155' }}
                  >
                    Todos
                  </button>
                  <button
                    className={`fast-action-chip ${inboxChannelFilter === 'WHATSAPP' ? 'active' : ''}`}
                    onClick={() => setInboxChannelFilter('WHATSAPP')}
                    style={{ background: inboxChannelFilter === 'WHATSAPP' ? '#25d366' : '#fff', color: inboxChannelFilter === 'WHATSAPP' ? '#fff' : '#334155' }}
                  >
                    <MessageCircle size={13} /> WhatsApp
                  </button>
                  <button
                    className={`fast-action-chip ${inboxChannelFilter === 'EMAIL' ? 'active' : ''}`}
                    onClick={() => setInboxChannelFilter('EMAIL')}
                    style={{ background: inboxChannelFilter === 'EMAIL' ? '#2563eb' : '#fff', color: inboxChannelFilter === 'EMAIL' ? '#fff' : '#334155' }}
                  >
                    <Mail size={13} /> E-mail
                  </button>
                </div>
              </div>

              <div className="tickets-scroll-container">
                {filteredConversations.map(c => (
                  <div
                    key={c.id}
                    className={`ticket-summary-card ${selectedConversation?.id === c.id ? 'active' : ''}`}
                    onClick={() => { setSelectedConversation(c); setConversations(conversations.map(cv => cv.id === c.id ? { ...cv, unreadCount: 0 } : cv)) }}
                  >
                    <div className="ticket-top-row">
                      <span className={`channel-badge ${c.channel.toLowerCase()}`}>{c.channel}</span>
                      {c.ticketNumber && <span className="ticket-protocol">#{c.ticketNumber}</span>}
                      {c.unreadCount > 0 && <span className="badge-count danger">{c.unreadCount}</span>}
                    </div>

                    <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', margin: '4px 0 2px' }}>{c.contactName}</strong>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{c.lastMessage}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="ticket-detail-panel">
              {selectedConversation ? (
                <div className="ticket-workspace">
                  <div className="workspace-header">
                    <div>
                      <h2>{selectedConversation.contactName}</h2>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>{selectedConversation.contactValue} • {selectedConversation.channel}</span>
                    </div>
                  </div>

                  <div className="messages-stream">
                    {selectedConversation.messages.map(m => (
                      <div key={m.id} className={`message-bubble-wrap ${m.direction === 'INBOUND' ? 'customer' : 'agent'}`}>
                        <div className="bubble-header">
                          <strong>{m.senderName}</strong>
                          <span>{m.createdAt}</span>
                        </div>
                        <div className="bubble-body">{m.body}</div>
                      </div>
                    ))}
                  </div>

                  <div className="reply-composer-box">
                    <textarea
                      rows={3}
                      placeholder={`Escrever mensagem para ${selectedConversation.contactName}...`}
                      value={inboxReply}
                      onChange={e => setInboxReply(e.target.value)}
                    />
                    <div className="composer-footer">
                      <button className="send-reply-btn" onClick={handleSendInboxMessage}>
                        <Send size={15} />
                        <span>Enviar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-ticket-selected">
                  <MessagesSquare size={48} />
                  <h3>Selecione uma conversa</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. ABA: CHAMADOS & FILA (FASE 22.1 + 22.2) */}
      {activeTab === 'tickets' && (
        <div className="service-content-body">
          <div className="ticket-split-layout">
            <div className="ticket-list-panel">
              <div className="list-count-header">
                <strong>{filteredTickets.length} chamados encontrados</strong>
              </div>

              <div className="tickets-scroll-container">
                {filteredTickets.map(t => (
                  <div
                    key={t.id}
                    className={`ticket-summary-card ${selectedTicket?.id === t.id ? 'active' : ''} ${t.priority}`}
                    onClick={() => setSelectedTicket(t)}
                  >
                    <div className="ticket-top-row">
                      <span className="ticket-protocol">#{t.protocol}</span>
                      <span className={`priority-tag ${t.priority}`}>{t.priority}</span>
                      <span className={`status-tag ${t.status}`}>{t.status.replace('_', ' ')}</span>
                    </div>

                    <h4 className="ticket-card-subject">{t.subject}</h4>

                    <div className="ticket-bottom-info">
                      <div className="customer-inline">
                        <strong>{t.customerName}</strong>
                        <span>• {t.queueName}</span>
                      </div>
                      <div className="sla-inline">
                        <Clock3 size={13} />
                        <span>{t.createdAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ticket-detail-panel">
              {selectedTicket ? (
                <div className="ticket-workspace">
                  <div className="workspace-header">
                    <div>
                      <h2>{selectedTicket.subject}</h2>
                      <span className="protocol-num">#{selectedTicket.protocol}</span>
                    </div>

                    <div className="workspace-actions">
                      <button className="fast-action-chip" onClick={() => handleAutoAssign(selectedTicket.id)}>
                        <UserPlus size={14} /> Atribuir Auto
                      </button>
                      {selectedTicket.status !== 'RESOLVIDO' && (
                        <button className="resolve-btn" onClick={() => handleResolveTicket(selectedTicket.id)}>
                          <CheckCircle2 size={16} />
                          <span>Marcar Resolvido</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="messages-stream">
                    {selectedTicket.messages.map(m => (
                      <div key={m.id} className={`message-bubble-wrap ${m.authorType.toLowerCase()}`}>
                        <div className="bubble-header">
                          <strong>{m.author}</strong>
                          <span>{m.channel} • {m.createdAt}</span>
                        </div>
                        <div className="bubble-body">{m.body}</div>
                      </div>
                    ))}
                  </div>

                  {selectedTicket.status !== 'RESOLVIDO' && (
                    <div className="reply-composer-box">
                      <textarea
                        rows={3}
                        placeholder="Escrever resposta..."
                        value={newReply}
                        onChange={e => setNewReply(e.target.value)}
                      />
                      <div className="composer-footer">
                        <button className="send-reply-btn" onClick={handleSendMessage}>
                          <Send size={15} />
                          <span>Enviar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-ticket-selected">
                  <Headphones size={48} />
                  <h3>Selecione um chamado</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. ABA: CLIENTE 360° (FASE 22.5) */}
      {activeTab === 'client360' && (
        <div className="service-content-body">
          <div className="service-card-panel">
            <div className="client-profile-header">
              <div className="client-avatar">JS</div>
              <div className="client-main-data">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0 }}>João Silva Oliveira</h3>
                  <span className="client-pill vip">VIP DIAMOND</span>
                </div>
                <span style={{ display: 'block', margin: '4px 0', color: '#64748b' }}>
                  CPF: 123.456.789-00 • joao.silva@email.com • (41) 99882-1144
                </span>
              </div>
            </div>

            <div className="client-360-grid" style={{ marginTop: '20px' }}>
              <div className="client-orders-box">
                <h4>Pedidos Recentes ERP</h4>
                <div className="client-order-item">
                  <div className="order-head">
                    <strong>#DI-984221 • Festival Sertanejo Curitiba</strong>
                    <span className="status-pill green">Aprovado</span>
                  </div>
                  <p>2 × Pista Premium • R$ 480,00</p>
                </div>
              </div>

              <div className="client-tickets-history-box">
                <h4>Ingressos & Validação</h4>
                <div className="client-order-item">
                  <div className="order-head">
                    <strong>Pista Premium - Setor B</strong>
                    <span className="status-pill green">QR Ativo</span>
                  </div>
                  <p>Código: QR-984221-01</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. ABA: WORKFLOWS (FASE 22.6) */}
      {activeTab === 'workflows' && (
        <div className="service-content-body">
          <div className="service-card-panel">
            <div className="panel-header-row">
              <div>
                <h3>Regras de Automação Ativas</h3>
                <p>Gatilhos de SLA, proximidade de evento e ações automáticas.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {workflows.map(wf => (
                <div key={wf.id} style={{ border: '1px solid #e2e8f0', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong>{wf.name}</strong>
                    <span className="channel-badge">{wf.triggerEvent}</span>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#64748b' }}>{wf.description}</p>
                  <button type="button" className="fast-action-chip" onClick={() => handleTestWorkflow(wf)}>
                    <Play size={12} /> Testar Agora
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. ABA: MOTOR DE SLA (FASE 22.3) */}
      {activeTab === 'sla' && (
        <div className="service-content-body">
          <div className="service-card-panel">
            <div className="panel-header-row">
              <div>
                <h3>Motor de SLA Event-Aware</h3>
                <p>Simulação de prioridade por proximidade do evento.</p>
              </div>
              <button className="primary-service-btn" onClick={handleRecalculateAllSLA}>
                <RefreshCw size={16} />
                <span>Recalcular SLA</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', margin: '16px 0' }}>
              <button
                type="button"
                onClick={() => setEventAwareProximity('LIVE')}
                className={`sla-matrix-card ${eventAwareProximity === 'LIVE' ? 'p1' : ''}`}
                style={{ cursor: 'pointer', textAlign: 'left', border: eventAwareProximity === 'LIVE' ? '2px solid #dc2626' : '1px solid #e2e8f0' }}
              >
                <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700 }}>AO VIVO 🔥</span>
                <strong style={{ display: 'block', margin: '4px 0', fontSize: '14px' }}>Evento Acontecendo</strong>
                <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 700 }}>P1 Portão / Catracas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. ABA: ABRIR NOVO CHAMADO */}
      {activeTab === 'new' && (
        <div className="service-content-body">
          <form className="create-ticket-form-grid" onSubmit={handleCreateTicket}>
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>1. Informações do Atendimento</h3>
                  <p>Preencha os dados do canal e solicitação.</p>
                </div>
              </div>

              <div className="form-group">
                <label>Fila de Destino</label>
                <select value={formQueueId} onChange={e => setFormQueueId(Number(e.target.value))}>
                  {queues.map(q => (
                    <option key={q.id} value={q.id}>{q.name} ({q.strategy})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Canal de Origem</label>
                <select value={formChannel} onChange={e => setFormChannel(e.target.value as any)}>
                  <option value="WHATSAPP">WhatsApp Oficial DiskIngressos</option>
                  <option value="EMAIL">E-mail (sac@diskingressos.com.br)</option>
                  <option value="CHAT">Chat Web ao Vivo</option>
                  <option value="PHONE">Telefone / Central Telefônica</option>
                  <option value="FORM">Formulário de Contato Portal</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assunto do Chamado</label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={e => setFormSubject(e.target.value)}
                  placeholder="Ex: Ingresso não recebido, erro no QR Code..."
                />
              </div>

              <div className="form-group">
                <label>Descrição do Problema</label>
                <textarea
                  rows={4}
                  required
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Descreva detalhadamente a solicitação..."
                />
              </div>

              <div className="form-group">
                <label>Classificação de Prioridade (ITIL SLA)</label>
                <select value={formPriority} onChange={e => setFormPriority(e.target.value as any)}>
                  <option value="P1">P1 - Crítico (Catracas, Portão, Acesso Imediato) • 15 min</option>
                  <option value="P2">P2 - Alto (Ingresso Não Recebido, Erro de Pagamento) • 1h</option>
                  <option value="P3">P3 - Médio (Troca de Titularidade, Informações Gerais) • 4h</option>
                  <option value="P4">P4 - Baixo (Dúvidas Futuras, Sugestões) • 12h</option>
                </select>
              </div>
            </div>

            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>2. Vínculo do Comprador & Pedido</h3>
                  <p>Integração direta com a base do ERP.</p>
                </div>
              </div>

              <div className="form-group">
                <label>Nome Completo do Cliente</label>
                <input
                  type="text"
                  required
                  value={formCustomerName}
                  onChange={e => setFormCustomerName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>E-mail do Comprador</label>
                <input
                  type="email"
                  required
                  value={formCustomerEmail}
                  onChange={e => setFormCustomerEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Telefone / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={formCustomerPhone}
                  onChange={e => setFormCustomerPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Evento Relacionado</label>
                <select value={formEventId} onChange={e => setFormEventId(e.target.value)}>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Código do Pedido ERP (se houver)</label>
                <input
                  type="text"
                  value={formOrderCode}
                  onChange={e => setFormOrderCode(e.target.value)}
                  placeholder="Ex: DI-985100"
                />
              </div>

              <div className="form-submit-block" style={{ marginTop: '20px' }}>
                <button type="submit" className="primary-service-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  <Plus size={18} />
                  <span>Protocolar Chamado no ERP</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 10. ABA: BASE DE CONHECIMENTO */}
      {activeTab === 'knowledge' && (
        <div className="service-content-body">
          <div className="kb-search-hero">
            <h2>Base de Conhecimento ITIL & FAQ</h2>
            <p>Procedimentos de suporte e respostas rápidas.</p>
          </div>

          <div className="kb-articles-grid">
            {mockArticles.map(article => (
              <div key={article.id} className="kb-article-card">
                <h3>{article.title}</h3>
                <p>{article.snippet}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. ABA: FILAS & AGENTES */}
      {activeTab === 'teams' && (
        <div className="service-content-body">
          <div className="service-card-panel">
            <div className="panel-header-row">
              <div>
                <h3>Agentes de Atendimento & Presença</h3>
                <p>Clique no status para alternar presença.</p>
              </div>
            </div>

            <div className="agents-list">
              {agents.map(ag => (
                <div key={ag.id} className="agent-row-card">
                  <div className="agent-avatar-col">
                    <button
                      type="button"
                      className={`status-dot ${ag.status.toLowerCase()}`}
                      onClick={() => handleToggleAgentStatus(ag.id)}
                      style={{ cursor: 'pointer', border: 0 }}
                    />
                    <div>
                      <strong>{ag.name}</strong>
                      <small>{ag.email} • <b>{ag.status}</b></small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
