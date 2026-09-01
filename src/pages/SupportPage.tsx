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
  CalendarClock, ChartNoAxesCombined
} from 'lucide-react'
import type { EventItem } from '../data/events'

export type ServiceTab =
  | 'hub'
  | 'predictive'
  | 'liveops'
  | 'copilot'
  | 'bi'
  | 'dashboard'
  | 'csat'
  | 'knowledge'
  | 'inbox'
  | 'tickets'
  | 'new'
  | 'major'
  | 'incidents'
  | 'problems'
  | 'client360'
  | 'workflows'
  | 'sla'
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
  },
  {
    id: 3,
    title: 'Refinamento do Copilot IA para dúvidas de biometria facial no iOS',
    description: 'Atualizar prompt e templates com FAQ detalhado de compatibilidade com Safari / FaceID.',
    sourceType: 'CSAT_DETRACTOR',
    impact: 4,
    effort: 1,
    priorityScore: 85,
    status: 'COMPLETED',
    ownerName: 'Beatriz Castro (N2)'
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
  validScans: 4250,
  validationRate: 98.6,
  entriesPerMinute: 142,
  currentInside: 4250,
  expectedAttendance: 8000,
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
  const [conversations, setConversations] = useState<ConversationItem[]>(initialConversations)
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(initialConversations[0])

  // Fase 22.15 Predictive Analytics & Continuous Improvement State
  const [improvements, setImprovements] = useState<ImprovementItem[]>(initialImprovements)
  const [predictiveForecastDays, setPredictiveForecastDays] = useState<number>(7)

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
    else if (mode === 'dashboard') setActiveTab('dashboard')
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
    const open = tickets.filter(t => t.status !== 'RESOLVIDO' && t.status !== 'FECHADO').length
    const csatPercent = 92.4
    const npsScore = 78
    const promotersPercent = 84
    const detractorsPercent = 4
    const responseRate = 46.8
    const openAlerts = experienceAlerts.filter(a => a.status === 'OPEN_RECOVERY').length
    const onlineAgents = agents.filter(a => a.status === 'ONLINE' || a.status === 'BUSY').length
    const unreadOmnichannel = conversations.reduce((acc, c) => acc + c.unreadCount, 0)
    const activeMajorIncidents = majorIncidents.filter(m => m.status !== 'RESOLVED' && m.status !== 'CLOSED').length
    const predicted7DaysTickets = 584
    const slaAtRiskCount = 2
    const criticalQueuesCount = 1
    return { total, open, csatPercent, npsScore, promotersPercent, detractorsPercent, responseRate, openAlerts, onlineAgents, unreadOmnichannel, activeMajorIncidents, predicted7DaysTickets, slaAtRiskCount, criticalQueuesCount }
  }, [tickets, agents, conversations, majorIncidents, experienceAlerts])

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
    <div className="support-module-container" style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Header Principal */}
      <header className="support-main-header">
        <div className="header-brand-block">
          <div className="service-badge">
            <Brain size={18} />
            <span>DISK SERVICE • PREDICTIVE ANALYTICS & CSI (FASE 22.15 - ROADMAP COMPLETO)</span>
          </div>
          <h1>Central de Atendimento, Inteligência & Suporte</h1>
          <p>Modelos preditivos, forecast de demanda, mitigação de risco de SLA, melhoria contínua e Command Center ITIL.</p>
        </div>

        <div className="header-status-block">
          <div className="agent-status-indicator">
            <span className="dot pulse-green" />
            <span>Forecast 7d: {stats.predicted7DaysTickets} tickets • {stats.onlineAgents} Agentes</span>
          </div>
          <button className="primary-service-btn" onClick={() => setActiveTab('new')}>
            <Plus size={18} />
            <span>Abrir Chamado</span>
          </button>
        </div>
      </header>

      {/* Sub-Navegação em Abas Modernas com Todas as Fases 22.1 a 22.15 */}
      <nav className="service-nav-tabs">
        <button className={`service-tab-btn ${activeTab === 'hub' ? 'active' : ''}`} onClick={() => setActiveTab('hub')}>
          <LifeBuoy size={17} />
          <span>Hub Geral</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'predictive' ? 'active' : ''}`} onClick={() => setActiveTab('predictive')}>
          <Brain size={17} />
          <span>Analytics Preditivo & CSI</span>
          <span className="tab-pill" style={{ background: '#059669', color: '#fff' }}>22.15</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'liveops' ? 'active' : ''}`} onClick={() => setActiveTab('liveops')}>
          <Radio size={17} />
          <span>Operação ao Vivo (Live Ops)</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'copilot' ? 'active' : ''}`} onClick={() => setActiveTab('copilot')}>
          <Bot size={17} />
          <span>Disk Copilot IA</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'bi' ? 'active' : ''}`} onClick={() => setActiveTab('bi')}>
          <BarChart3 size={17} />
          <span>Dashboard & BI</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'csat' ? 'active' : ''}`} onClick={() => setActiveTab('csat')}>
          <Smile size={17} />
          <span>CSAT + NPS</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'knowledge' ? 'active' : ''}`} onClick={() => setActiveTab('knowledge')}>
          <BookOpen size={17} />
          <span>Base de Conhecimento</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'major' ? 'active' : ''}`} onClick={() => setActiveTab('major')}>
          <Siren size={17} />
          <span>Major Incidents (P1)</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'problems' ? 'active' : ''}`} onClick={() => setActiveTab('problems')}>
          <Bug size={17} />
          <span>Problem Mgmt (RCA)</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'incidents' ? 'active' : ''}`} onClick={() => setActiveTab('incidents')}>
          <ShieldAlert size={17} />
          <span>Incidentes ITIL</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}>
          <MessagesSquare size={17} />
          <span>Inbox Omnichannel</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>
          <Ticket size={17} />
          <span>Chamados & Fila</span>
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
      </nav>

      {/* CONTEÚDO DAS ABAS */}

      {/* 0. ABA: HUB GERAL */}
      {activeTab === 'hub' && (
        <div className="service-content-body">
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)',
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
                <span style={{ background: '#10b981', color: '#0f172a', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                  ROADMAP 22.1 → 22.15 CONCLUÍDO COM SUCESSO
                </span>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Produtora: {producerName}</span>
              </div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 800 }}>
                Disk Service Enterprise Ecosystem
              </h2>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '14px', maxWidth: '650px' }}>
                Arquitetura unificada de SAC, SLA, ITIL, Omnichannel, Copilot IA, Live Ops e Analytics Preditivo.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="primary-service-btn" onClick={() => setActiveTab('predictive')} style={{ background: '#059669' }}>
                <Brain size={16} />
                <span>Analytics Preditivo & CSI</span>
              </button>
              <button className="primary-service-btn" onClick={() => setActiveTab('liveops')} style={{ background: '#dc2626' }}>
                <Radio size={16} />
                <span>Live Event Ops</span>
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div className="service-card-panel" style={{ cursor: 'pointer', borderLeft: '4px solid #059669' }} onClick={() => setActiveTab('predictive')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center' }}>
                  <Brain size={20} />
                </div>
                <span className="badge-count" style={{ background: '#ecfdf5', color: '#047857' }}>Fase 22.15</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>Analytics Preditivo & CSI</h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                Forecast 7 dias, mitigação preventiva de SLA, anomalias e backlog de melhoria contínua.
              </p>
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Ver Inteligência Preditiva <ArrowRight size={14} />
              </span>
            </div>

            <div className="service-card-panel" style={{ cursor: 'pointer', borderLeft: '4px solid #dc2626' }} onClick={() => setActiveTab('liveops')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', display: 'grid', placeItems: 'center' }}>
                  <Radio size={20} />
                </div>
                <span className="badge-count danger">Live Ops</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>Live Event Command Center</h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                Telemetria de catracas, entradas/minuto, controle de portões e alertas ao vivo.
              </p>
              <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Acessar Operação <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 1. ABA: ANALYTICS PREDITIVO & MELHORIA CONTÍNUA (FASE 22.15) */}
      {activeTab === 'predictive' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Brain size={22} style={{ color: '#6ee7b7' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Predictive Operations & Continual Service Improvement (CSI)</h3>
              </div>
              <p style={{ margin: 0, color: '#a7f3d0' }}>
                Modelos estatísticos de previsão de demanda, detecção de anomalias (Z-Score) e ciclo PDCA de melhorias.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button className="primary-service-btn" onClick={() => notify('Modelos preditivos e forecast de 7 dias recalculados com sucesso!')} style={{ background: '#059669' }}>
                <RefreshCw size={16} />
                <span>Recalcular Forecast</span>
              </button>
            </div>
          </div>

          {/* 6 Scorecards Preditivos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px',
            margin: '20px 0'
          }}>
            <div className="service-kpi-card green">
              <div className="kpi-icon-wrap"><TrendingUp size={20} /></div>
              <div className="kpi-info">
                <span>Forecast 7 Dias</span>
                <strong>{stats.predicted7DaysTickets}</strong>
                <small>Tickets esperados</small>
              </div>
            </div>

            <div className="service-kpi-card orange">
              <div className="kpi-icon-wrap"><ShieldAlert size={20} /></div>
              <div className="kpi-info">
                <span>Risco de SLA</span>
                <strong>{stats.slaAtRiskCount} chamados</strong>
                <small>Consumo ≥ 70% da meta</small>
              </div>
            </div>

            <div className="service-kpi-card blue">
              <div className="kpi-icon-wrap"><Users size={20} /></div>
              <div className="kpi-info">
                <span>Filas em Alerta</span>
                <strong>{stats.criticalQueuesCount} fila</strong>
                <small>Sobrecarga iminente</small>
              </div>
            </div>

            <div className="service-kpi-card red">
              <div className="kpi-icon-wrap"><CalendarClock size={20} /></div>
              <div className="kpi-info">
                <span>Risco em Eventos</span>
                <strong>1 evento</strong>
                <small>Rock Arena Festival</small>
              </div>
            </div>

            <div className="service-kpi-card purple">
              <div className="kpi-icon-wrap"><AlertTriangle size={20} /></div>
              <div className="kpi-info">
                <span>Anomalias Z-Score</span>
                <strong>1 detectada</strong>
                <small>Rejeição de QR Code</small>
              </div>
            </div>

            <div className="service-kpi-card green">
              <div className="kpi-icon-wrap"><Lightbulb size={20} /></div>
              <div className="kpi-info">
                <span>Melhorias Ativas</span>
                <strong>{improvements.length} planos</strong>
                <small>Backlog PDCA</small>
              </div>
            </div>
          </div>

          {/* Forecast 7 Dias e Detecção de Anomalias */}
          <div className="service-two-col-grid" style={{ marginBottom: '20px' }}>
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Forecast de Volume para os Próximos 7 Dias</h3>
                  <p>Projeção de chamados e intervalo de confiança operacional.</p>
                </div>
                <ChartNoAxesCombined size={18} style={{ color: '#059669' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '160px', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                {[
                  { day: '02/09', pred: 82, upper: 105 },
                  { day: '03/09', pred: 76, upper: 98 },
                  { day: '04/09', pred: 89, upper: 115 },
                  { day: '05/09', pred: 120, upper: 155 },
                  { day: '06/09', pred: 145, upper: 185 },
                  { day: '07/09', pred: 42, upper: 60 },
                  { day: '08/09', pred: 30, upper: 45 }
                ].map((item, idx) => (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#059669', fontWeight: 700 }}>{item.pred}</span>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '110px' }}>
                      <div style={{
                        width: '100%',
                        background: '#059669',
                        height: `${(item.pred / 185) * 110}px`,
                        borderRadius: '4px 4px 0 0'
                      }} />
                    </div>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Detecção de Anomalias Estatísticas (Baseline vs Atual)</h3>
                  <p>Desvios que exigem intervenção proativa da engenharia.</p>
                </div>
                <Brain size={18} style={{ color: '#7c3aed' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ border: '1px solid #fee2e2', background: '#fff5f5', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '13px', color: '#991b1b' }}>Taxa de Rejeição Catraca 04</strong>
                    <span className="badge-count danger">Z-SCORE +3.4</span>
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#7f1d1d' }}>
                    Atual: 40% de rejeição · Baseline histórico: 1.4% (Oscilação de rede detectada).
                  </p>
                  <small style={{ color: '#b91c1c' }}>Ação automática: Workaround acionado e tráfego roteado.</small>
                </div>

                <div style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>Tempo de Resposta Pix Webhook</strong>
                    <span className="status-pill green">NORMAL</span>
                  </div>
                  <p style={{ margin: '0', fontSize: '12px', color: '#64748b' }}>
                    Atual: 180ms · Baseline histórico: 195ms (Desempenho estável).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Backlog de Melhoria Contínua (CSI / PDCA) */}
          <div className="service-card-panel" style={{ marginBottom: '20px' }}>
            <div className="panel-header-row">
              <div>
                <h3>Backlog de Melhoria Contínua (Continual Service Improvement - ITIL)</h3>
                <p>Planos de ação derivados de Incidentes, Anomalias e Detratores CSAT/NPS.</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Iniciativa de Melhoria</th>
                  <th style={{ padding: '8px' }}>Origem</th>
                  <th style={{ padding: '8px' }}>Impacto</th>
                  <th style={{ padding: '8px' }}>Esforço</th>
                  <th style={{ padding: '8px' }}>Prioridade</th>
                  <th style={{ padding: '8px' }}>Status</th>
                  <th style={{ padding: '8px' }}>Responsável</th>
                </tr>
              </thead>
              <tbody>
                {improvements.map(imp => (
                  <tr key={imp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}>
                      <strong>{imp.title}</strong>
                      <small style={{ display: 'block', color: '#64748b' }}>{imp.description}</small>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <span className="channel-badge">{imp.sourceType}</span>
                    </td>
                    <td style={{ padding: '8px' }}>{imp.impact}/5 ⭐</td>
                    <td style={{ padding: '8px' }}>{imp.effort}/5</td>
                    <td style={{ padding: '8px' }}><b>Score {imp.priorityScore}</b></td>
                    <td style={{ padding: '8px' }}>
                      <span className={imp.status === 'COMPLETED' ? 'status-pill green' : imp.status === 'IN_PROGRESS' ? 'badge-count orange' : 'channel-badge'}>
                        {imp.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px' }}>{imp.ownerName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ABA: OPERAÇÃO DE EVENTOS AO VIVO (FASE 22.14) */}
      {activeTab === 'liveops' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #1e1b4b 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Radio size={22} style={{ color: '#f87171' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Live Event Command Center • {liveEvent.eventName}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ABA: DISK COPILOT IA (FASE 22.13) */}
      {activeTab === 'copilot' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #3b0764 0%, #1e1b4b 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Bot size={22} style={{ color: '#c084fc' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Disk Copilot IA • Assistente Operacional Inteligente</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ABA: DASHBOARD & BI (FASE 22.12) */}
      {activeTab === 'bi' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <BarChart3 size={22} style={{ color: '#38bdf8' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Command Center Executivo & Business Intelligence</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ABA: CSAT + NPS (FASE 22.11) */}
      {activeTab === 'csat' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Smile size={22} style={{ color: '#6ee7b7' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Experiência do Cliente: CSAT + NPS</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. ABA: BASE DE CONHECIMENTO (FASE 22.10) */}
      {activeTab === 'knowledge' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <BookOpen size={22} style={{ color: '#93c5fd' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Base de Conhecimento Editorial ITIL & FAQ</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. ABA: MAJOR INCIDENTS P1 (FASE 22.9) */}
      {activeTab === 'major' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #1c1917 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Siren size={22} style={{ color: '#fca5a5' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Major Incident Management (Incidentes Críticos P1)</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. ABA: PROBLEM MANAGEMENT (FASE 22.8) */}
      {activeTab === 'problems' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #3b0764 0%, #0f172a 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Bug size={22} style={{ color: '#d8b4fe' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Problem Management & Análise de Causa Raiz (RCA)</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. ABA: INCIDENTES ITIL (FASE 22.7) */}
      {activeTab === 'incidents' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #450a0a 0%, #1c1917 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ShieldAlert size={22} style={{ color: '#f87171' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Gestão de Incidentes ITIL (Incident Management)</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. ABA: INBOX OMNICHANNEL (FASE 22.4) */}
      {activeTab === 'inbox' && (
        <div className="service-content-body">
          <div className="ticket-split-layout">
            <div className="ticket-list-panel">
              <div className="tickets-scroll-container">
                {conversations.map(c => (
                  <div key={c.id} className="ticket-summary-card" onClick={() => setSelectedConversation(c)}>
                    <strong>{c.contactName}</strong>
                    <p>{c.lastMessage}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. ABA: CHAMADOS & FILA (FASE 22.1 + 22.2) */}
      {activeTab === 'tickets' && (
        <div className="service-content-body">
          <div className="ticket-split-layout">
            <div className="ticket-list-panel">
              <div className="tickets-scroll-container">
                {tickets.map(t => (
                  <div key={t.id} className="ticket-summary-card" onClick={() => setSelectedTicket(t)}>
                    <strong>#{t.protocol} - {t.customerName}</strong>
                    <p>{t.subject}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. ABA: ABRIR NOVO CHAMADO */}
      {activeTab === 'new' && (
        <div className="service-content-body">
          <form className="create-ticket-form-grid" onSubmit={handleCreateTicket}>
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>1. Informações do Atendimento</h3>
                </div>
              </div>

              <div className="form-group">
                <label>Assunto</label>
                <input type="text" required value={formSubject} onChange={e => setFormSubject(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea rows={4} required value={formDescription} onChange={e => setFormDescription(e.target.value)} />
              </div>

              <div className="form-submit-block" style={{ marginTop: '16px' }}>
                <button type="submit" className="primary-service-btn">
                  <Plus size={18} />
                  <span>Protocolar Chamado</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 13. ABA: CLIENTE 360° (FASE 22.5) */}
      {activeTab === 'client360' && (
        <div className="service-content-body">
          <div className="service-card-panel">
            <h3>Cliente 360° • João Silva Oliveira (VIP Diamond)</h3>
            <p>Histórico completo de compras ERP e validações de catraca.</p>
          </div>
        </div>
      )}

      {/* 14. ABA: WORKFLOWS (FASE 22.6) */}
      {activeTab === 'workflows' && (
        <div className="service-content-body">
          <div className="service-card-panel">
            <h3>Automações & Regras de Atendimento</h3>
            <p>Gatilhos de SLA, proximidade de evento e ações automáticas.</p>
          </div>
        </div>
      )}

      {/* 15. ABA: MOTOR DE SLA (FASE 22.3) */}
      {activeTab === 'sla' && (
        <div className="service-content-body">
          <div className="service-card-panel">
            <h3>Motor de SLA Event-Aware</h3>
            <p>Cálculo de metas e timers operacionais.</p>
          </div>
        </div>
      )}
    </div>
  )
}
