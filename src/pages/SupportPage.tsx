import { useState, useEffect, useMemo, type FormEvent } from 'react'
import {
  LayoutDashboard, Ticket, AlertTriangle, BookOpen, Users, Clock3, Plus, Search,
  RefreshCw, CheckCircle2, MessageCircle, Mail, Phone, Globe, ShieldAlert,
  Send, UserCheck, Sparkles, Filter, ChevronRight, ArrowRight, ExternalLink,
  Flame, HelpCircle, FileText, CheckCheck, PlayCircle, XCircle, AlertCircle, Headphones, Link2, Sparkle,
  Layers3, ArrowRightLeft, UserPlus, CheckSquare, Gauge, Calendar, BellRing, SlidersHorizontal, Zap,
  BarChart3, Activity, ShieldCheck, LifeBuoy, MessagesSquare, Tag, ShoppingBag, WalletCards, ScanLine,
  UserRound, CalendarDays, Workflow, Play, PauseCircle, Server, Radio, Wrench, Shield, Siren, Bug, Lightbulb,
  ClipboardCheck, MessageSquareText, GitBranch, Target, Star, Smile, Heart, MessageCircleWarning, TrendingUp,
  ThumbsUp, ThumbsDown, Eye, Archive, TicketCheck, LineChart, PieChart, Bot, Brain, Copy, DoorOpen, WifiOff,
  CalendarClock, ChartNoAxesCombined, Bell, ChevronLeft, ChevronDown, ListFilter, Grid, LayoutGrid, Download
} from 'lucide-react'
import type { EventItem } from '../data/events'

export type ServiceTab =
  | 'hub'
  | 'tickets'
  | 'inbox'
  | 'sla'
  | 'teams'
  | 'client360'
  | 'liveops'
  | 'incidents'
  | 'problems'
  | 'major'
  | 'knowledge'
  | 'csat'
  | 'copilot'
  | 'bi'
  | 'predictive'
  | 'workflows'
  | 'new'

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

interface CopilotAnalysis {
  confidence: number
  summary: string
  category: string
  priority: string
  sentiment: 'POSITIVO' | 'NEUTRO' | 'FRUSTRADO' | 'CRITICO'
  escalate: boolean
  escalationReason?: string
  nextBestAction: string
  suggestedReply: string
  articles: Array<{ id: number; title: string; summary: string }>
  incidents: Array<{ id: number; code: string; title: string; priority: string }>
  problems: Array<{ id: number; code: string; title: string }>
}

interface LiveEventState {
  eventName: string
  venue: string
  city: string
  commanderName: string
  status: 'GATES_OPEN' | 'IN_PROGRESS' | 'PEAK_FLOW' | 'WRAPPING_UP' | 'CLOSED'
  validScans: number
  validationRate: number
  entriesPerMinute: number
  currentInside: number
  expectedAttendance: number
  openGates: number
  queueTotal: number
  offlineDevices: number
  criticalAlerts: number
  points: Array<{
    id: number
    name: string
    zone: string
    status: 'NORMAL' | 'HIGH_QUEUE' | 'DEGRADED' | 'OFFLINE'
    queueLength: number
    estimatedWaitMinutes: number
    devices: number
    offlineDevices: number
  }>
  alerts: Array<{
    id: number
    title: string
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
    status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
    timestamp: string
  }>
  timeline: Array<{
    id: number
    title: string
    description: string
    occurredAt: string
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

interface KnowledgeArticleItem {
  id: number
  title: string
  category: string
  summary: string
  content: string
  status: 'PUBLISHED' | 'IN_REVIEW' | 'DRAFT'
  visibility: 'PUBLIC_FAQ' | 'INTERNAL_SAC'
  viewsCount: number
  helpfulCount: number
  unhelpfulCount: number
  tags: string[]
  links: Array<{ entityType: string; label: string }>
  updatedAt: string
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

interface ExperienceAlert {
  id: number
  customerName: string
  surveyType: 'CSAT' | 'NPS'
  score: number
  comment: string
  channel: string
  eventName: string
  status: 'OPEN_RECOVERY' | 'IN_CONTACT' | 'RECOVERED'
  createdAt: string
}

interface ImprovementItem {
  id: number
  title: string
  description: string
  sourceType: 'MAJOR_INCIDENT' | 'ANOMALY' | 'CSAT_DETRACTOR' | 'SLA_BREACH' | 'COPILOT_FEEDBACK'
  impact: number
  effort: number
  priorityScore: number
  status: 'PROPOSED' | 'IN_PROGRESS' | 'COMPLETED'
  ownerName: string
}

const initialImprovements: ImprovementItem[] = [
  {
    id: 1,
    title: 'Failover 5G automático com switch redundante no Portão B',
    description: 'Implementar rota secundária redundante para evitar bloqueio de leitura de QR Code em oscilações locais.',
    sourceType: 'MAJOR_INCIDENT',
    impact: 5,
    effort: 2,
    priorityScore: 92,
    status: 'IN_PROGRESS',
    ownerName: 'Engenheiro Bruno (Infra)'
  },
  {
    id: 2,
    title: 'Automação de reenvio proativo de QR Code 3h antes do evento',
    description: 'Disparo transacional em lote para todos os pedidos aprovados sem check-in antecipado, reduzindo SAC em 35%.',
    sourceType: 'ANOMALY',
    impact: 4,
    effort: 1,
    priorityScore: 88,
    status: 'PROPOSED',
    ownerName: 'Lucas Atendente (N1 Lead)'
  }
]

const initialQueues: QueueItem[] = [
  { id: 1, name: 'Reenvio & Ingressos', code: 'QUEUE_TICKETS', strategy: 'ROUND_ROBIN', agentsCount: 4, openTickets: 14 },
  { id: 2, name: 'Pagamentos & Pix', code: 'QUEUE_PAYMENTS', strategy: 'LEAST_LOAD', agentsCount: 3, openTickets: 6 },
  { id: 3, name: 'Reembolsos & Estornos', code: 'QUEUE_REFUNDS', strategy: 'LEAST_LOAD', agentsCount: 2, openTickets: 5 },
  { id: 4, name: 'Acesso & Catracas (Portão)', code: 'QUEUE_ACCESS', strategy: 'SKILL_BASED', agentsCount: 2, openTickets: 2 }
]

const initialLiveEvent: LiveEventState = {
  eventName: 'Festival XPTO 2026 • Rock Arena Curitiba',
  venue: 'Pedreira Paulo Leminski',
  city: 'Curitiba, PR',
  commanderName: 'Camila Supervisora (Live Incident Commander)',
  status: 'PEAK_FLOW',
  validScans: 8742,
  validationRate: 98.6,
  entriesPerMinute: 142,
  currentInside: 8742,
  expectedAttendance: 10000,
  openGates: 4,
  queueTotal: 180,
  offlineDevices: 1,
  criticalAlerts: 1,
  points: [
    { id: 1, name: 'Portão A (Pista Premium)', zone: 'Acesso Norte', status: 'NORMAL', queueLength: 35, estimatedWaitMinutes: 3, devices: 4, offlineDevices: 0 },
    { id: 2, name: 'Portão B (Pista Geral)', zone: 'Acesso Sul', status: 'HIGH_QUEUE', queueLength: 95, estimatedWaitMinutes: 7, devices: 4, offlineDevices: 1 },
    { id: 3, name: 'Portão C (Camarotes & VIP)', zone: 'Acesso Leste', status: 'NORMAL', queueLength: 15, estimatedWaitMinutes: 2, devices: 2, offlineDevices: 0 },
    { id: 4, name: 'Portão D (Imprensa & Staff)', zone: 'Acesso Oeste', status: 'NORMAL', queueLength: 5, estimatedWaitMinutes: 1, devices: 2, offlineDevices: 0 }
  ],
  alerts: [
    { id: 1, title: 'Oscilação 5G no leitor óptico Catraca 04 Portão B', severity: 'CRITICAL', status: 'ACTIVE', timestamp: '11:10' },
    { id: 2, title: 'Fila superior a 5 minutos no Portão B', severity: 'HIGH', status: 'ACTIVE', timestamp: '11:15' }
  ],
  timeline: [
    { id: 1, title: 'Abertura oficial dos portões', description: 'Todos os 4 portões liberados e catracas sincronizadas.', occurredAt: '10:00' },
    { id: 2, title: 'Pico de entrada iniciado', description: 'Taxa atingiu 142 pessoas/minuto no complexo.', occurredAt: '11:00' }
  ]
}

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
      { id: 1, name: 'Camila Supervisora', role: 'Incident Commander', team: 'Gestão de Crise' }
    ],
    communications: [
      { id: 1, cadence: '11:00 (Abertura)', message: 'Incidente P1 declarado. War Room estabelecida.', timestamp: '11:00' }
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
      { id: 1, task: 'Deploy do firmware v3.4 com WAL mode em todas as 80 catracas', assignee: 'Engenharia de Acesso', status: 'DONE' }
    ],
    createdAt: 'Há 2 dias'
  }
]

const initialKnowledgeArticles: KnowledgeArticleItem[] = [
  {
    id: 1,
    title: 'Como reenviar o ingresso com QR Code por E-mail e WhatsApp',
    category: 'Ingressos & Carteira',
    summary: 'Procedimento operacional para atendentes dispararem o voucher PDF e o QR Code atualizado direto pelo SAC.',
    content: '1. Localize o cliente pelo CPF ou código do pedido #DI.\n2. Verifique se o status do pedido consta como APROVADO.\n3. Na barra de ações rápidas, clique em "Reenviar Ingresso & QR Code".\n4. O sistema dispara a mensagem transacional com confirmação em tempo real.',
    status: 'PUBLISHED',
    visibility: 'PUBLIC_FAQ',
    viewsCount: 1420,
    helpfulCount: 380,
    unhelpfulCount: 8,
    tags: ['reenvio', 'qr_code', 'voucher', 'whatsapp', 'email'],
    links: [{ entityType: 'TICKET', label: 'Chamados de Reenvio' }],
    updatedAt: 'Hoje às 09:30'
  }
]

const initialExperienceAlerts: ExperienceAlert[] = [
  {
    id: 1,
    customerName: 'Eduardo Silveira',
    surveyType: 'NPS',
    score: 3,
    comment: 'Demorou mais de 20 minutos para reenviar meu ingresso e quase perdi o início do show.',
    channel: 'WHATSAPP',
    eventName: 'Rock Arena Festival 2026',
    status: 'OPEN_RECOVERY',
    createdAt: 'Há 45 minutos'
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
  }
]

const initialWorkflowRuns: WorkflowRun[] = [
  { id: 101, workflowName: 'Pesquisa Automática CSAT/NPS pós-resolução', ticketNumber: 'DS-2026-983110', triggerEvent: 'PAYMENT_APPROVED', status: 'SUCCESS', executionTimeMs: 95, createdAt: 'Há 8 min' }
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
    linkedTickets: ['DS-2026-984180', 'DS-2026-984182'],
    startedAt: 'Há 18 minutos',
    leadAgent: 'Engenharia de Acesso (N3)',
    workaround: 'Redirecionar fluxo para Catracas 01 a 03 enquanto a base local é sincronizada via hotspot 5G.',
    timelineUpdates: [
      { id: 1, stage: 'Detecção', message: 'Alerta automático disparado por taxa de 40% de rejeição na Catraca 04.', author: 'Sistema de Monitoramento', timestamp: '11:00' }
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
      { id: 2, author: 'Disk Copilot (IA)', authorType: 'SYSTEM', channel: 'SYSTEM', body: 'Diagnóstico: Pedido DI-984221 localizado na Adquirente Efí Pix com status APROVADO.', createdAt: '10:46' },
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
      { id: 1, author: 'Mariana Costa Ferreira', authorType: 'CUSTOMER', channel: 'FORM', body: 'Estou na fila do portão B e a catraca diz que meu QR Code é inválido.', createdAt: '11:05' }
    ]
  }
]

const initialAgents: AgentItem[] = [
  { id: 1, name: 'Lucas Atendente', email: 'lucas.sac@diskingressos.com.br', level: 'N1', team: 'Fila Geral & WhatsApp', status: 'ONLINE', activeTickets: 4, capacity: 8 },
  { id: 2, name: 'Beatriz Castro', email: 'beatriz.castro@diskingressos.com.br', level: 'N2', team: 'Titularidade & Ingressos', status: 'ONLINE', activeTickets: 3, capacity: 6 },
  { id: 3, name: 'Rodrigo Financeiro', email: 'rodrigo.fin@diskingressos.com.br', level: 'N2', team: 'Estornos & Pagamentos', status: 'BUSY', activeTickets: 6, capacity: 6 },
  { id: 4, name: 'Camila Supervisora', email: 'camila.sup@diskingressos.com.br', level: 'SUPERVISOR', team: 'Gestão de Crise & SLA', status: 'ONLINE', activeTickets: 1, capacity: 10 }
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
  const [viewMode, setViewMode] = useState<'grade' | 'lista'>('grade')
  const [conversations, setConversations] = useState<ConversationItem[]>(initialConversations)
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(initialConversations[0])

  // Fase 22.15 Predictive Analytics & Continuous Improvement State
  const [improvements, setImprovements] = useState<ImprovementItem[]>(initialImprovements)

  // Fase 22.14 Live Event Command Center State
  const [liveEvent, setLiveEvent] = useState<LiveEventState>(initialLiveEvent)

  // Fase 22.13 Disk Copilot IA State
  const [copilotSelectedTicketId, setCopilotSelectedTicketId] = useState<number>(1)
  const [copilotLoading, setCopilotLoading] = useState<boolean>(false)
  const [copilotAnalysis, setCopilotAnalysis] = useState<CopilotAnalysis | null>({
    confidence: 0.94,
    summary: 'Comprador realizou pagamento Pix de R$ 480,00 aprovado no gateway Efí. Falha temporária no webhook impediu a entrega do QR Code no e-mail.',
    category: 'Pagamentos & Reenvio de Ingressos',
    priority: 'P2 - Alta',
    sentiment: 'FRUSTRADO',
    escalate: false,
    nextBestAction: 'Forçar reenvio transacional do voucher por WhatsApp e E-mail e validar se o pedido DI-984221 está com biometria associada.',
    suggestedReply: 'Olá João! Localizamos seu pedido DI-984221 com pagamento Pix confirmado. Acabamos de disparar o seu voucher atualizado com QR Code para o seu WhatsApp e e-mail joao.silva@email.com. Qualquer dúvida estamos à disposição!',
    articles: [
      { id: 1, title: 'Como reenviar o ingresso com QR Code por E-mail e WhatsApp', summary: 'Procedimento operacional para disparo imediato do voucher atualizado.' }
    ],
    incidents: [
      { id: 1, code: 'INC-2026-003', title: 'Atraso pontual no envio de e-mails transacionais SendGrid', priority: 'P2' }
    ],
    problems: []
  })

  const [majorIncidents, setMajorIncidents] = useState<MajorIncidentItem[]>(initialMajorIncidents)
  const [selectedMajorIncident, setSelectedMajorIncident] = useState<MajorIncidentItem | null>(initialMajorIncidents[0])

  const [problems, setProblems] = useState<ProblemItem[]>(initialProblems)
  const [selectedProblem, setSelectedProblem] = useState<ProblemItem | null>(initialProblems[0])

  const [incidents, setIncidents] = useState<IncidentItem[]>(initialIncidents)
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(initialIncidents[0])

  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticleItem[]>(initialKnowledgeArticles)
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticleItem | null>(initialKnowledgeArticles[0])
  const [kbSearch, setKbSearch] = useState('')

  const [experienceAlerts, setExperienceAlerts] = useState<ExperienceAlert[]>(initialExperienceAlerts)

  const [workflows, setWorkflows] = useState<WorkflowRule[]>(initialWorkflows)
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>(initialWorkflowRuns)

  const [tickets, setTickets] = useState<TicketItem[]>(mockTickets)
  const [agents, setAgents] = useState<AgentItem[]>(initialAgents)
  const [queues, setQueues] = useState<QueueItem[]>(initialQueues)
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(mockTickets[0])
  const [newReply, setNewReply] = useState('')

  useEffect(() => {
    if (!mode) return
    if (mode === 'hub') setActiveTab('hub')
    else if (mode === 'predictive') setActiveTab('predictive')
    else if (mode === 'liveops') setActiveTab('liveops')
    else if (mode === 'copilot') setActiveTab('copilot')
    else if (mode === 'bi' || mode === 'reports') setActiveTab('bi')
    else if (mode === 'dashboard') setActiveTab('bi')
    else if (mode === 'csat') setActiveTab('csat')
    else if (mode === 'inbox' || mode === 'integrations') setActiveTab('inbox')
    else if (mode === 'tickets') setActiveTab('tickets')
    else if (mode === 'major') setActiveTab('major')
    else if (mode === 'incidents') setActiveTab('incidents')
    else if (mode === 'problems') setActiveTab('problems')
    else if (mode === 'client360') setActiveTab('client360')
    else if (mode === 'workflows') setActiveTab('workflows')
    else if (mode === 'sla') setActiveTab('sla')
    else if (mode === 'knowledge') setActiveTab('knowledge')
    else if (mode === 'teams') setActiveTab('teams')
  }, [mode])

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

  const stats = useMemo(() => {
    const total = tickets.length
    const open = 128
    const delayedSla = 18
    const csatToday = '4.6/5'
    const npsToday = '53+'
    const checkinsToday = '8.742'
    const p1Active = 3
    const onlineAgents = agents.filter(a => a.status === 'ONLINE' || a.status === 'BUSY').length
    const unreadOmnichannel = conversations.reduce((acc, c) => acc + c.unreadCount, 0)
    const activeMajorIncidents = majorIncidents.filter(m => m.status !== 'RESOLVED' && m.status !== 'CLOSED').length
    return { total, open, delayedSla, csatToday, npsToday, checkinsToday, p1Active, onlineAgents, unreadOmnichannel, activeMajorIncidents }
  }, [tickets, agents, conversations, majorIncidents])

  const handleRunCopilotAnalysis = (tId: number) => {
    setCopilotLoading(true)
    setTimeout(() => {
      const ticket = tickets.find(t => t.id === tId) || tickets[0]
      setCopilotAnalysis({
        confidence: 0.96,
        summary: `Análise IA: Chamado #${ticket.protocol} de ${ticket.customerName}. Solicitação referente ao evento ${ticket.eventName}. Diagnóstico: pedido ${ticket.orderCode} com dados consistentes na base ERP.`,
        category: ticket.queueName,
        priority: ticket.priority,
        sentiment: ticket.priority === 'P1' ? 'CRITICO' : 'FRUSTRADO',
        escalate: ticket.priority === 'P1',
        escalationReason: ticket.priority === 'P1' ? 'Possível impacto direto no portão de acesso do evento em andamento.' : undefined,
        nextBestAction: ticket.priority === 'P1' ? 'Acionar supervisor de plantão e rotear para contingência Catracas 01-03.' : 'Confirmar recebimento do voucher e fechar chamado.',
        suggestedReply: `Olá ${ticket.customerName}! Verificamos seu chamado #${ticket.protocol} referente ao evento ${ticket.eventName}. Sua solicitação foi analisada e o procedimento operacional foi executado com sucesso.`,
        articles: [
          { id: 1, title: 'Procedimento padrão de suporte para ' + ticket.queueName, summary: 'Instruções de atendimento rápido e SLA.' }
        ],
        incidents: ticket.priority === 'P1' ? [{ id: 1, code: 'INC-2026-004', title: 'Instabilidade Catraca Portão B', priority: 'P1' }] : [],
        problems: []
      })
      setCopilotLoading(false)
      notify(`Disk Copilot concluiu a análise do chamado #${ticket.protocol} com 96% de confiança!`)
    }, 450)
  }

  const handleApplyCopilotReply = () => {
    if (!copilotAnalysis) return
    setNewReply(copilotAnalysis.suggestedReply)
    setActiveTab('tickets')
    notify('Resposta do Disk Copilot aplicada no compositor de resposta do chamado!')
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
    <div className="disk-service-shell" style={{ width: '100%', minHeight: '100vh', background: '#080c16', color: '#f8fafc' }}>
      <div className="disk-service-inner">
        
        {/* Topbar / Greeting */}
        <header className="ds-topbar">
          <div className="ds-topbar-left">
            <h1>👋 Bem-vindo de volta, {producerName || 'Fernando'}!</h1>
            <p>Visão integrada de toda a operação Disk Service</p>
          </div>

          <div className="ds-topbar-right">
            <div className="ds-search-box">
              <Search size={16} />
              <input type="text" placeholder="Buscar (Ctrl + K)" />
            </div>

            <div className="ds-icon-btn" onClick={() => notify('12 notificações ativas: 1 War Room P1, 3 alertas de SLA e 8 novos chamados')}>
              <Bell size={18} />
              <span className="ds-badge-count-pill">12</span>
            </div>

            <div className="ds-icon-btn" onClick={() => setActiveTab('knowledge')}>
              <HelpCircle size={18} />
            </div>

            <div className="ds-user-profile" onClick={() => notify('Perfil operacional: Vinicius Casagrande (Admin Master)')}>
              <div className="ds-user-avatar">
                {producerName ? producerName.slice(0, 2).toUpperCase() : 'VC'}
                <span className="online-dot" />
              </div>
            </div>
          </div>
        </header>

        {/* Top Launcher Carousel (Horizontal App Circles with Badges) */}
        <div className="ds-launcher-bar">
          <button className={`ds-launcher-item ${activeTab === 'hub' ? 'active' : ''}`} onClick={() => setActiveTab('hub')}>
            <div className="ds-launcher-circle">
              <LifeBuoy size={22} />
            </div>
            <span className="ds-launcher-label">Hub Geral</span>
          </button>

          <button className={`ds-launcher-item ${activeTab === 'copilot' ? 'active' : ''}`} onClick={() => setActiveTab('copilot')}>
            <div className="ds-launcher-circle">
              <Bot size={22} />
              <span className="ds-mini-tag purple">94%</span>
            </div>
            <span className="ds-launcher-label">Disk Copilot IA</span>
          </button>

          <button className={`ds-launcher-item ${activeTab === 'bi' ? 'active' : ''}`} onClick={() => setActiveTab('bi')}>
            <div className="ds-launcher-circle">
              <BarChart3 size={22} />
            </div>
            <span className="ds-launcher-label">Dashboard & BI</span>
          </button>

          <button className={`ds-launcher-item ${activeTab === 'csat' ? 'active' : ''}`} onClick={() => setActiveTab('csat')}>
            <div className="ds-launcher-circle">
              <Smile size={22} />
              <span className="ds-mini-tag red">1 Recovery</span>
            </div>
            <span className="ds-launcher-label">CSAT + NPS</span>
          </button>

          <button className={`ds-launcher-item ${activeTab === 'knowledge' ? 'active' : ''}`} onClick={() => setActiveTab('knowledge')}>
            <div className="ds-launcher-circle">
              <BookOpen size={22} />
              <span className="ds-mini-tag blue">2</span>
            </div>
            <span className="ds-launcher-label">Base de Conhecimento</span>
          </button>

          <button className={`ds-launcher-item ${activeTab === 'major' ? 'active' : ''}`} onClick={() => setActiveTab('major')}>
            <div className="ds-launcher-circle">
              <Siren size={22} />
              <span className="ds-mini-tag red">1 War Room</span>
            </div>
            <span className="ds-launcher-label">Major Incidents (P1)</span>
          </button>

          <button className={`ds-launcher-item ${activeTab === 'problems' ? 'active' : ''}`} onClick={() => setActiveTab('problems')}>
            <div className="ds-launcher-circle">
              <Bug size={22} />
            </div>
            <span className="ds-launcher-label">Problem Mgmt (RCA)</span>
          </button>

          <button className={`ds-launcher-item ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>
            <div className="ds-launcher-circle">
              <Ticket size={22} />
            </div>
            <span className="ds-launcher-label">Tickets</span>
          </button>

          <button className={`ds-launcher-item ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}>
            <div className="ds-launcher-circle">
              <MessagesSquare size={22} />
            </div>
            <span className="ds-launcher-label">Omnichannel</span>
          </button>

          <button className="ds-launcher-item" onClick={() => setActiveTab('predictive')}>
            <div className="ds-launcher-circle">
              <ChevronRight size={20} />
            </div>
            <span className="ds-launcher-label">Mais Módulos</span>
          </button>
        </div>

        {/* MÓDULOS PRINCIPAIS - GRID 5x3 */}
        {activeTab === 'hub' && (
          <>
            <div className="ds-section-header">
              <h2 className="ds-section-title">MÓDULOS PRINCIPAIS</h2>
              <div className="ds-view-toggles">
                <button className={`ds-view-btn ${viewMode === 'grade' ? 'active' : ''}`} onClick={() => setViewMode('grade')}>
                  <LayoutGrid size={14} /> Grade
                </button>
                <button className={`ds-view-btn ${viewMode === 'lista' ? 'active' : ''}`} onClick={() => setViewMode('lista')}>
                  <ListFilter size={14} /> Lista
                </button>
                <button className="ds-view-btn" onClick={() => notify('Personalização de cards salva no perfil')}>
                  Personalizar <ChevronDown size={14} />
                </button>
              </div>
            </div>

            <div className="ds-modules-grid">
              {/* Card 1: Tickets */}
              <div className="ds-module-card" onClick={() => setActiveTab('tickets')}>
                <div className="ds-card-icon-wrap green"><TicketCheck size={22} /></div>
                <div className="ds-card-text">
                  <h4>Tickets</h4>
                  <p>Chamados, atendimentos e resoluções</p>
                </div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              {/* Card 2: Omnichannel */}
              <div className="ds-module-card" onClick={() => setActiveTab('inbox')}>
                <div className="ds-card-icon-wrap cyan"><MessagesSquare size={22} /></div>
                <div className="ds-card-text">
                  <h4>Omnichannel</h4>
                  <p>WhatsApp, Email, Chat, Instagram e mais</p>
                </div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              {/* Card 3: SLA */}
              <div className="ds-module-card" onClick={() => setActiveTab('sla')}>
                <div className="ds-card-icon-wrap purple"><Clock3 size={22} /></div>
                <div className="ds-card-text">
                  <h4>SLA</h4>
                  <p>Acordos, metas e conformidade de SLA</p>
                </div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              {/* Card 4: Filas & Agentes */}
              <div className="ds-module-card" onClick={() => setActiveTab('teams')}>
                <div className="ds-card-icon-wrap yellow"><Users size={22} /></div>
                <div className="ds-card-text">
                  <h4>Filas & Agentes</h4>
                  <p>Distribuição, agentes e carga de trabalho</p>
                </div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              {/* Card 5: Clientes 360° */}
              <div className="ds-module-card" onClick={() => setActiveTab('client360')}>
                <div className="ds-card-icon-wrap pink"><UserRound size={22} /></div>
                <div className="ds-card-text">
                  <h4>Clientes 360°</h4>
                  <p>Histórico completo do cliente em um só lugar</p>
                </div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              {/* Card 6: Eventos */}
              <div className="ds-module-card" onClick={() => setActiveTab('liveops')}>
                <div className="ds-card-icon-wrap emerald"><CalendarDays size={22} /></div>
                <div className="ds-card-text">
                  <h4>Eventos</h4>
                  <p>Eventos, check-in, acesso e operação ao vivo</p>
                </div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              {/* Card 7: Incidentes */}
              <div className="ds-module-card" onClick={() => setActiveTab('incidents')}>
                <div className="ds-card-icon-wrap red"><AlertTriangle size={22} /></div>
                <div className="ds-card-text">
                  <h4>Incidentes</h4>
                  <p>Registro, impacto, prioridade e resolução</p>
                </div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              {/* Card 8: Problems (RCA) */}
              <div className="ds-module-card" onClick={() => setActiveTab('problems')}>
                <div className="ds-card-icon-wrap purple"><Bug size={22} /></div>
                <div className="ds-card-text">
                  <h4>Problems (RCA)</h4>
                  <p>Gestão de problemas, causas e planos</p>
                </div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              {/* Card 9: Major Incidents (P1) */}
              <div className="ds-module-card" onClick={() => setActiveTab('major')}>
                <div className="ds-card-icon-wrap red"><Siren size={22} /></div>
                <div className="ds-card-text">
                  <h4>Major Incidents (P1)</h4>
                  <p>Incidentes críticos e War Room</p>
                </div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              {/* Card 10: Base de Conhecimento */}
              <div className="ds-module-card" onClick={() => setActiveTab('knowledge')}>
                <div className="ds-card-icon-wrap blue"><BookOpen size={22} /></div>
                <div className="ds-card-text">
                  <h4>Base de Conhecimento</h4>
                  <p>Artigos, manuais e soluções inteligentes</p>
                </div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              {/* Card 11: CSAT + NPS */}
              <div className="ds-module-card" onClick={() => setActiveTab('csat')}>
                <div className="ds-card-icon-wrap green"><Smile size={22} /></div>
                <div className="ds-card-text">
                  <h4>CSAT + NPS</h4>
                  <p>Satisfação do cliente e experiência</p>
                </div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              {/* Card 12: Disk Copilot IA */}
              <div className="ds-module-card" onClick={() => setActiveTab('copilot')}>
                <div className="ds-card-icon-wrap purple"><Bot size={22} /></div>
                <div className="ds-card-text">
                  <h4>Disk Copilot IA</h4>
                  <p>IA aplicada ao atendimento com sugestões inteligentes</p>
                </div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              {/* Card 13: Dashboard & BI */}
              <div className="ds-module-card" onClick={() => setActiveTab('bi')}>
                <div className="ds-card-icon-wrap cyan"><BarChart3 size={22} /></div>
                <div className="ds-card-text">
                  <h4>Dashboard & BI</h4>
                  <p>Indicadores, métricas e análises em tempo real</p>
                </div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              {/* Card 14: Operação em Tempo Real */}
              <div className="ds-module-card" onClick={() => setActiveTab('liveops')}>
                <div className="ds-card-icon-wrap orange"><Radio size={22} /></div>
                <div className="ds-card-text">
                  <h4>Operação em Tempo Real</h4>
                  <p>Monitoramento ao vivo dos eventos</p>
                </div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              {/* Card 15: Analytics Preditivo */}
              <div className="ds-module-card" onClick={() => setActiveTab('predictive')}>
                <div className="ds-card-icon-wrap teal"><Brain size={22} /></div>
                <div className="ds-card-text">
                  <h4>Analytics Preditivo</h4>
                  <p>Previsões, riscos e recomendações</p>
                </div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>
            </div>

            {/* VISÃO GERAL DA OPERAÇÃO (6 Stats Bar) */}
            <div className="ds-section-header">
              <h2 className="ds-section-title">VISÃO GERAL DA OPERAÇÃO</h2>
            </div>

            <div className="ds-stats-strip">
              <div className="ds-stat-card">
                <div className="ds-stat-icon-wrap"><Ticket size={20} /></div>
                <div className="ds-stat-content">
                  <span className="ds-stat-label">Tickets Abertos</span>
                  <div className="ds-stat-val-row">
                    <span className="ds-stat-val">{stats.open}</span>
                    <span className="ds-stat-delta green">-12% vs ontem</span>
                  </div>
                </div>
              </div>

              <div className="ds-stat-card">
                <div className="ds-stat-icon-wrap"><Clock3 size={20} /></div>
                <div className="ds-stat-content">
                  <span className="ds-stat-label">Atrasados (SLA)</span>
                  <div className="ds-stat-val-row">
                    <span className="ds-stat-val" style={{ color: '#f59e0b' }}>{stats.delayedSla}</span>
                    <span className="ds-stat-delta orange">+4% vs ontem</span>
                  </div>
                </div>
              </div>

              <div className="ds-stat-card">
                <div className="ds-stat-icon-wrap"><Smile size={20} /></div>
                <div className="ds-stat-content">
                  <span className="ds-stat-label">CSAT (Hoje)</span>
                  <div className="ds-stat-val-row">
                    <span className="ds-stat-val" style={{ color: '#10b981' }}>{stats.csatToday}</span>
                    <span className="ds-stat-delta green">+0.3 vs ontem</span>
                  </div>
                </div>
              </div>

              <div className="ds-stat-card">
                <div className="ds-stat-icon-wrap"><TrendingUp size={20} /></div>
                <div className="ds-stat-content">
                  <span className="ds-stat-label">NPS (Hoje)</span>
                  <div className="ds-stat-val-row">
                    <span className="ds-stat-val" style={{ color: '#10b981' }}>{stats.npsToday}</span>
                    <span className="ds-stat-delta green">+5 vs ontem</span>
                  </div>
                </div>
              </div>

              <div className="ds-stat-card">
                <div className="ds-stat-icon-wrap"><Users size={20} /></div>
                <div className="ds-stat-content">
                  <span className="ds-stat-label">Check-ins (Hoje)</span>
                  <div className="ds-stat-val-row">
                    <span className="ds-stat-val" style={{ color: '#38bdf8' }}>{stats.checkinsToday}</span>
                    <span className="ds-stat-delta green">+18% vs ontem</span>
                  </div>
                </div>
              </div>

              <div className="ds-stat-card">
                <div className="ds-stat-icon-wrap"><Shield size={20} /></div>
                <div className="ds-stat-content">
                  <span className="ds-stat-label">P1 Ativos</span>
                  <div className="ds-stat-val-row">
                    <span className="ds-stat-val" style={{ color: '#ef4444' }}>{stats.p1Active}</span>
                    <span className="ds-stat-delta red">+1 vs ontem</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ACESSOS RÁPIDOS */}
            <div className="ds-section-header">
              <h2 className="ds-section-title">ACESSOS RÁPIDOS</h2>
            </div>

            <div className="ds-quick-actions-bar">
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('new')}>
                <Plus size={14} style={{ color: '#10b981' }} /> Novo Ticket
              </button>

              <button className="ds-quick-action-pill" onClick={() => setActiveTab('incidents')}>
                <AlertTriangle size={14} style={{ color: '#ef4444' }} /> Novo Incidente
              </button>

              <button className="ds-quick-action-pill" onClick={() => setActiveTab('major')}>
                <Siren size={14} style={{ color: '#ef4444' }} /> War Room
              </button>

              <button className="ds-quick-action-pill" onClick={() => notify('Disparo de broadcast em massa para participantes configurado')}>
                <Radio size={14} style={{ color: '#f59e0b' }} /> Broadcast
              </button>

              <button className="ds-quick-action-pill" onClick={() => setActiveTab('bi')}>
                <BarChart3 size={14} style={{ color: '#38bdf8' }} /> Relatório Executivo
              </button>

              <button className="ds-quick-action-pill" onClick={() => notify('Exportação de dados CSV/PDF iniciada')}>
                <Download size={14} style={{ color: '#8b5cf6' }} /> Exportar Dados
              </button>

              <button className="ds-quick-action-pill" onClick={() => setActiveTab('sla')}>
                <SlidersHorizontal size={14} /> Configurações
              </button>
            </div>
          </>
        )}

        {/* SUBMÓDULOS DETALHADOS (QUANDO QUALQUER CARD É CLICADO) */}

        {/* 1. MÓDULO: TICKETS */}
        {activeTab === 'tickets' && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('hub')}>
                <ChevronLeft size={16} /> Voltar ao Hub Geral
              </button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('new')} style={{ background: '#2563eb', color: '#fff' }}>
                <Plus size={16} /> Abrir Chamado
              </button>
            </div>

            <div className="ticket-split-layout">
              <div className="ticket-list-panel">
                <div className="tickets-scroll-container">
                  {tickets.map(t => (
                    <div key={t.id} className={`ticket-summary-card ${selectedTicket?.id === t.id ? 'active' : ''}`} onClick={() => setSelectedTicket(t)}>
                      <div className="ticket-top-row">
                        <span className="channel-badge">{t.channel}</span>
                        <span className="priority-tag P1">{t.priority}</span>
                        <span className="status-pill green">{t.status}</span>
                      </div>
                      <h4 className="ticket-card-subject">#{t.protocol} - {t.subject}</h4>
                      <p style={{ margin: '4px 0', fontSize: '12px', color: '#94a3b8' }}>{t.customerName} • {t.eventName}</p>
                      <div className="ticket-bottom-info">
                        <span>Fila: {t.queueName}</span>
                        <small>{t.createdAt}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ticket-detail-panel">
                {selectedTicket && (
                  <div className="ticket-workspace">
                    <div className="workspace-header">
                      <div>
                        <div className="protocol-meta">
                          <span className="channel-badge">{selectedTicket.channel}</span>
                          <span className="priority-tag P1">{selectedTicket.priority}</span>
                          <span className="status-pill green">{selectedTicket.status}</span>
                        </div>
                        <h2>{selectedTicket.subject}</h2>
                        <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>
                          Protocolo: <b>{selectedTicket.protocol}</b> · Cliente: <b>{selectedTicket.customerName}</b> ({selectedTicket.customerPhone})
                        </p>
                      </div>
                    </div>

                    <div className="timeline-chat-box" style={{ flex: 1, overflowY: 'auto', background: '#0f172a', borderRadius: '10px', padding: '16px', margin: '14px 0' }}>
                      {selectedTicket.messages.map(m => (
                        <div key={m.id} style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', background: m.authorType === 'CUSTOMER' ? '#1e293b' : '#1e3a8a', maxWidth: '85%', marginLeft: m.authorType === 'CUSTOMER' ? '0' : 'auto' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                            <strong>{m.author}</strong>
                            <span>{m.createdAt}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '13px', color: '#f8fafc' }}>{m.body}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Escreva uma resposta ao cliente..."
                        value={newReply}
                        onChange={e => setNewReply(e.target.value)}
                        style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#fff' }}
                      />
                      <button className="ds-quick-action-pill" style={{ background: '#2563eb', color: '#fff', border: 0 }} onClick={() => {
                        if (!newReply) return
                        notify(`Resposta enviada ao cliente via ${selectedTicket.channel}!`)
                        setNewReply('')
                      }}>
                        <Send size={15} /> Enviar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. MÓDULO: DISK COPILOT IA */}
        {activeTab === 'copilot' && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('hub')}>
                <ChevronLeft size={16} /> Voltar ao Hub Geral
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={copilotSelectedTicketId}
                  onChange={e => setCopilotSelectedTicketId(Number(e.target.value))}
                  style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}
                >
                  {tickets.map(t => (
                    <option key={t.id} value={t.id}>#{t.protocol} - {t.customerName}</option>
                  ))}
                </select>
                <button className="ds-quick-action-pill" onClick={() => handleRunCopilotAnalysis(copilotSelectedTicketId)} disabled={copilotLoading} style={{ background: '#7c3aed', color: '#fff', border: 0 }}>
                  <Sparkles size={16} /> {copilotLoading ? 'Analisando...' : 'Executar Análise IA'}
                </button>
              </div>
            </div>

            {copilotAnalysis && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="ds-module-card" style={{ cursor: 'default', display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bot size={20} style={{ color: '#c084fc' }} />
                      <strong style={{ fontSize: '16px', color: '#fff' }}>Resumo Inteligente & Diagnóstico</strong>
                    </div>
                    <span className="ds-mini-tag purple" style={{ position: 'static' }}>
                      {Math.round(copilotAnalysis.confidence * 100)}% Confiança
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                    {copilotAnalysis.summary}
                  </p>
                </div>

                <div className="ds-modules-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 0 }}>
                  <div className="ds-module-card" style={{ cursor: 'default', display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Brain size={18} style={{ color: '#10b981' }} />
                      <strong style={{ color: '#fff' }}>Next Best Action</strong>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>{copilotAnalysis.nextBestAction}</p>
                  </div>

                  <div className="ds-module-card" style={{ cursor: 'default', display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquareText size={18} style={{ color: '#38bdf8' }} />
                        <strong style={{ color: '#fff' }}>Resposta Sugerida (AI Draft)</strong>
                      </div>
                      <button className="ds-quick-action-pill" onClick={handleApplyCopilotReply} style={{ padding: '4px 8px', fontSize: '11px' }}>
                        <Copy size={12} /> Aplicar
                      </button>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, fontStyle: 'italic' }}>"{copilotAnalysis.suggestedReply}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. MÓDULO: DASHBOARD & BI (FASE 22.12) */}
        {activeTab === 'bi' && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('hub')}>
                <ChevronLeft size={16} /> Voltar ao Hub Geral
              </button>
              <button className="ds-quick-action-pill" onClick={() => notify('Métricas recalculadas em tempo real!')}>
                <RefreshCw size={15} /> Recalcular Indicadores
              </button>
            </div>

            <div className="ds-stats-strip">
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">Backlog</span><span className="ds-stat-val">128</span></div></div>
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">SLA Compliance</span><span className="ds-stat-val" style={{ color: '#10b981' }}>96.4%</span></div></div>
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">FRT Médio</span><span className="ds-stat-val">8 min</span></div></div>
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">MTTR Médio</span><span className="ds-stat-val">42 min</span></div></div>
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">CSAT</span><span className="ds-stat-val" style={{ color: '#10b981' }}>92.4%</span></div></div>
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">NPS Score</span><span className="ds-stat-val" style={{ color: '#10b981' }}>+78</span></div></div>
            </div>
          </div>
        )}

        {/* 4. MÓDULO: LIVE EVENT OPS (FASE 22.14) */}
        {activeTab === 'liveops' && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('hub')}>
                <ChevronLeft size={16} /> Voltar ao Hub Geral
              </button>
              <span className="ds-quick-action-pill" style={{ background: '#7f1d1d', color: '#fca5a5' }}>
                <Radio size={14} /> LIVE MONITORING (10s)
              </span>
            </div>

            <div className="ds-stats-strip">
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">Check-ins Válidos</span><span className="ds-stat-val">{liveEvent.validScans}</span></div></div>
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">Entradas / Min</span><span className="ds-stat-val" style={{ color: '#ef4444' }}>{liveEvent.entriesPerMinute}</span></div></div>
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">Dentro do Evento</span><span className="ds-stat-val">{liveEvent.currentInside}</span></div></div>
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">Portões Abertos</span><span className="ds-stat-val">{liveEvent.openGates}</span></div></div>
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">Fila Total</span><span className="ds-stat-val">{liveEvent.queueTotal}</span></div></div>
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">Devices Offline</span><span className="ds-stat-val" style={{ color: '#ef4444' }}>{liveEvent.offlineDevices}</span></div></div>
            </div>
          </div>
        )}

        {/* 5. MÓDULO: ANALYTICS PREDITIVO (FASE 22.15) */}
        {activeTab === 'predictive' && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('hub')}>
                <ChevronLeft size={16} /> Voltar ao Hub Geral
              </button>
              <button className="ds-quick-action-pill" onClick={() => notify('Modelos preditivos sincronizados!')}>
                <RefreshCw size={15} /> Recalcular Previsões
              </button>
            </div>

            <div className="ds-stats-strip">
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">Forecast 7 Dias</span><span className="ds-stat-val">584 tickets</span></div></div>
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">SLA em Risco</span><span className="ds-stat-val" style={{ color: '#f59e0b' }}>2 chamados</span></div></div>
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">Filas em Alerta</span><span className="ds-stat-val">1 fila</span></div></div>
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">Eventos em Risco</span><span className="ds-stat-val" style={{ color: '#ef4444' }}>1 evento</span></div></div>
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">Anomalias Z-Score</span><span className="ds-stat-val">1 ativa</span></div></div>
              <div className="ds-stat-card"><div className="ds-stat-content"><span className="ds-stat-label">Melhorias CSI</span><span className="ds-stat-val">{improvements.length}</span></div></div>
            </div>
          </div>
        )}

        {/* 6. MÓDULO: NOVO CHAMADO */}
        {activeTab === 'new' && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('hub')}>
                <ChevronLeft size={16} /> Voltar ao Hub Geral
              </button>
            </div>

            <form onSubmit={handleCreateTicket} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '24px', maxWidth: '800px' }}>
              <h3 style={{ margin: '0 0 16px', color: '#fff' }}>Protocolar Novo Chamado no Disk Service</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Assunto</label>
                  <input type="text" required value={formSubject} onChange={e => setFormSubject(e.target.value)} style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#fff' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Descrição do Problema</label>
                  <textarea rows={4} required value={formDescription} onChange={e => setFormDescription(e.target.value)} style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#fff' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Nome do Cliente</label>
                    <input type="text" required value={formCustomerName} onChange={e => setFormCustomerName(e.target.value)} style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#fff' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Telefone / WhatsApp</label>
                    <input type="text" required value={formCustomerPhone} onChange={e => setFormCustomerPhone(e.target.value)} style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#fff' }} />
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <button type="submit" className="ds-quick-action-pill" style={{ background: '#2563eb', color: '#fff', border: 0, padding: '10px 20px', fontSize: '14px' }}>
                    <Plus size={16} /> Protocolar Chamado com SLA
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}
