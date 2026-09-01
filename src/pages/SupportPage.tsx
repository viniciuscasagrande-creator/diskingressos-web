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
  ThumbsUp, ThumbsDown, Eye, Archive, TicketCheck, LineChart, PieChart, Bot, Brain, Copy, DoorOpen, WifiOff
} from 'lucide-react'
import type { EventItem } from '../data/events'

export type ServiceTab =
  | 'hub'
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
    { id: 2, title: 'Pico de entrada iniciado', description: 'Taxa atingiu 142 pessoas/minuto no complexo.', occurredAt: '11:00' },
    { id: 3, title: 'Alerta Catraca 04', description: 'Acionada equipe de campo com hotspot 5G de backup.', occurredAt: '11:12' }
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
      { id: 1, name: 'Camila Supervisora', role: 'Incident Commander', team: 'Gestão de Crise' },
      { id: 2, name: 'Engenheiro Bruno', role: 'Tech Lead Infraestrutura', team: 'Cloud & Edge' }
    ],
    communications: [
      { id: 1, cadence: '11:00 (Abertura)', message: 'Incidente P1 declarado. War Room estabelecida.', timestamp: '11:00' },
      { id: 2, cadence: '11:15 (Update 1)', message: 'Switch local reinicializado e backup 5G ativo.', timestamp: '11:15' }
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
    return { total, open, csatPercent, npsScore, promotersPercent, detractorsPercent, responseRate, openAlerts, onlineAgents, unreadOmnichannel, activeMajorIncidents }
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
            <Radio size={18} />
            <span>DISK SERVICE • LIVE EVENT COMMAND CENTER (FASE 22.14)</span>
          </div>
          <h1>Central de Atendimento & Operações ao Vivo</h1>
          <p>Operação de eventos em tempo real, telemetria de catracas, controle de filas, Copilot IA e War Room P1.</p>
        </div>

        <div className="header-status-block">
          <div className="agent-status-indicator">
            <span className="dot pulse-green" />
            <span>{liveEvent.entriesPerMinute} entradas/min • {liveEvent.validScans} check-ins</span>
          </div>
          <button className="primary-service-btn" onClick={() => setActiveTab('new')}>
            <Plus size={18} />
            <span>Abrir Chamado</span>
          </button>
        </div>
      </header>

      {/* Sub-Navegação em Abas Modernas com Fases 22.1 a 22.14 */}
      <nav className="service-nav-tabs">
        <button className={`service-tab-btn ${activeTab === 'hub' ? 'active' : ''}`} onClick={() => setActiveTab('hub')}>
          <LifeBuoy size={17} />
          <span>Hub Geral</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'liveops' ? 'active' : ''}`} onClick={() => setActiveTab('liveops')}>
          <Radio size={17} />
          <span>Operação ao Vivo (Live Ops)</span>
          <span className="tab-pill danger">LIVE</span>
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
                <span style={{ background: '#ef4444', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                  LIVE EVENT COMMAND CENTER • FASE 22.14
                </span>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Produtora: {producerName}</span>
              </div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 800 }}>
                Live Event Command Center & Disk Service ITIL
              </h2>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '14px', maxWidth: '650px' }}>
                Telemetria de portões e catracas ao vivo, monitoramento de filas, inteligência Copilot IA e War Room P1.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="primary-service-btn" onClick={() => setActiveTab('liveops')} style={{ background: '#dc2626' }}>
                <Radio size={16} />
                <span>Abrir Live Ops ({liveEvent.validScans} check-ins)</span>
              </button>
              <button className="primary-service-btn" onClick={() => setActiveTab('copilot')} style={{ background: '#7c3aed' }}>
                <Bot size={16} />
                <span>Disk Copilot IA</span>
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div className="service-card-panel" style={{ cursor: 'pointer', borderLeft: '4px solid #dc2626' }} onClick={() => setActiveTab('liveops')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', display: 'grid', placeItems: 'center' }}>
                  <Radio size={20} />
                </div>
                <span className="badge-count danger">142 entr/min</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>Operação de Eventos ao Vivo (Fase 22.14)</h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                Controle de portões, tempo de espera em fila, status de catracas e alertas operacionais.
              </p>
              <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Acessar Live Ops <ArrowRight size={14} />
              </span>
            </div>

            <div className="service-card-panel" style={{ cursor: 'pointer', borderLeft: '4px solid #7c3aed' }} onClick={() => setActiveTab('copilot')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', display: 'grid', placeItems: 'center' }}>
                  <Bot size={20} />
                </div>
                <span className="badge-count" style={{ background: '#f5f3ff', color: '#7c3aed' }}>Copilot IA</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>Disk Copilot IA (Fase 22.13)</h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                Classificação preditiva, Next Best Action e respostas prontas com artigos ITIL.
              </p>
              <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Interagir com IA <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 1. ABA: OPERAÇÃO DE EVENTOS AO VIVO (FASE 22.14 LIVE EVENT COMMAND CENTER) */}
      {activeTab === 'liveops' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #1e1b4b 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Radio size={22} style={{ color: '#f87171' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Live Event Command Center • {liveEvent.eventName}</h3>
              </div>
              <p style={{ margin: 0, color: '#fecaca' }}>
                {liveEvent.venue} · {liveEvent.city} · Commander: <strong>{liveEvent.commanderName}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button className="primary-service-btn" onClick={() => notify('Telemetria das 12 catracas e 4 portões atualizada com sucesso!')}>
                <RefreshCw size={16} />
                <span>Sincronizar Telemetria</span>
              </button>
            </div>
          </div>

          {/* 6 KPIs Operacionais ao Vivo */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px',
            margin: '20px 0'
          }}>
            <div className="service-kpi-card green">
              <div className="kpi-icon-wrap"><ScanLine size={20} /></div>
              <div className="kpi-info">
                <span>Check-ins Válidos</span>
                <strong>{liveEvent.validScans}</strong>
                <small>{liveEvent.validationRate}% de aprovação</small>
              </div>
            </div>

            <div className="service-kpi-card blue">
              <div className="kpi-icon-wrap"><Zap size={20} /></div>
              <div className="kpi-info">
                <span>Entradas / Minuto</span>
                <strong>{liveEvent.entriesPerMinute}</strong>
                <small>Fluxo em tempo real</small>
              </div>
            </div>

            <div className="service-kpi-card purple">
              <div className="kpi-icon-wrap"><Users size={20} /></div>
              <div className="kpi-info">
                <span>Dentro do Evento</span>
                <strong>{liveEvent.currentInside}</strong>
                <small>Esperado: {liveEvent.expectedAttendance}</small>
              </div>
            </div>

            <div className="service-kpi-card orange">
              <div className="kpi-icon-wrap"><DoorOpen size={20} /></div>
              <div className="kpi-info">
                <span>Portões & Filas</span>
                <strong>{liveEvent.openGates} abertos</strong>
                <small>{liveEvent.queueTotal} em fila</small>
              </div>
            </div>

            <div className="service-kpi-card red">
              <div className="kpi-icon-wrap"><WifiOff size={20} /></div>
              <div className="kpi-info">
                <span>Dispositivos Offline</span>
                <strong>{liveEvent.offlineDevices}</strong>
                <small>Catraca 04 Portão B</small>
              </div>
            </div>

            <div className="service-kpi-card red">
              <div className="kpi-icon-wrap"><Siren size={20} /></div>
              <div className="kpi-info">
                <span>Alertas Críticos</span>
                <strong>{liveEvent.criticalAlerts}</strong>
                <small>1 War Room Ativa</small>
              </div>
            </div>
          </div>

          {/* Gráfico de Fluxo de Entrada e Alertas Operacionais */}
          <div className="service-two-col-grid" style={{ marginBottom: '20px' }}>
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Fluxo de Entrada por Minuto (Tempo Real)</h3>
                  <p>Telemetria instantânea dos validadores de catraca.</p>
                </div>
                <Activity size={18} style={{ color: '#dc2626' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                {[
                  { time: '10:00', val: 20 }, { time: '10:15', val: 45 }, { time: '10:30', val: 80 },
                  { time: '10:45', val: 110 }, { time: '11:00', val: 135 }, { time: '11:15', val: 142 },
                  { time: '11:30', val: 140 }, { time: '11:45', val: 125 }
                ].map((item, idx) => (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>{item.val}</span>
                    <div style={{
                      width: '100%',
                      background: idx >= 5 ? '#dc2626' : '#f87171',
                      height: `${(item.val / 150) * 110}px`,
                      borderRadius: '4px 4px 0 0'
                    }} />
                    <span style={{ fontSize: '9px', color: '#94a3b8' }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Alertas Operacionais & Contingência</h3>
                  <p>Incidentes em portões e ações imediatas recomendadas.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {liveEvent.alerts.map(al => (
                  <div key={al.id} style={{ border: '1px solid #fee2e2', background: '#fff5f5', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '13px', color: '#991b1b' }}>{al.title}</strong>
                      <span className="badge-count danger">{al.severity}</span>
                    </div>
                    <small style={{ color: '#b91c1c' }}>Horário: {al.timestamp} • Status: {al.status}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pontos de Acesso & Filas */}
          <div className="service-card-panel" style={{ marginBottom: '20px' }}>
            <div className="panel-header-row">
              <div>
                <h3>Monitoramento de Pontos de Acesso & Filas</h3>
                <p>Taxa de ocupação, tempo estimado de espera e integridade dos dispositivos de portão.</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Ponto de Acesso</th>
                  <th style={{ padding: '8px' }}>Zona</th>
                  <th style={{ padding: '8px' }}>Status</th>
                  <th style={{ padding: '8px' }}>Pessoas em Fila</th>
                  <th style={{ padding: '8px' }}>Espera Estimada</th>
                  <th style={{ padding: '8px' }}>Dispositivos</th>
                </tr>
              </thead>
              <tbody>
                {liveEvent.points.map(pt => (
                  <tr key={pt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px' }}><strong>{pt.name}</strong></td>
                    <td style={{ padding: '8px', color: '#64748b' }}>{pt.zone}</td>
                    <td style={{ padding: '8px' }}>
                      <span className={pt.status === 'NORMAL' ? 'status-pill green' : 'badge-count danger'}>
                        {pt.status === 'NORMAL' ? 'Operação Normal' : 'Fila Elevada / Atenção'}
                      </span>
                    </td>
                    <td style={{ padding: '8px' }}><b>{pt.queueLength} pessoas</b></td>
                    <td style={{ padding: '8px' }}><strong>{pt.estimatedWaitMinutes} min</strong></td>
                    <td style={{ padding: '8px' }}>
                      {pt.devices} catracas {pt.offlineDevices > 0 && <span style={{ color: '#dc2626', fontWeight: 700 }}>({pt.offlineDevices} offline)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ABA: DISK COPILOT IA (FASE 22.13) */}
      {activeTab === 'copilot' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #3b0764 0%, #1e1b4b 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Bot size={22} style={{ color: '#c084fc' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Disk Copilot IA • Assistente Operacional Inteligente</h3>
              </div>
              <p style={{ margin: 0, color: '#e9d5ff' }}>
                Modelo human-in-the-loop: Análise preditiva, Next Best Action, respostas recomendadas e busca de casos semelhantes.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={copilotSelectedTicketId}
                onChange={e => setCopilotSelectedTicketId(Number(e.target.value))}
                style={{ background: '#fff', border: 0, padding: '8px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}
              >
                {tickets.map(t => (
                  <option key={t.id} value={t.id}>#{t.protocol} - {t.customerName}</option>
                ))}
              </select>
              <button className="primary-service-btn" onClick={() => handleRunCopilotAnalysis(copilotSelectedTicketId)} disabled={copilotLoading} style={{ background: '#7c3aed' }}>
                <Sparkles size={16} />
                <span>{copilotLoading ? 'Analisando...' : 'Executar Análise IA'}</span>
              </button>
            </div>
          </div>

          {copilotAnalysis && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              <div className="service-card-panel">
                <div className="panel-header-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={20} style={{ color: '#7c3aed' }} />
                    <h3 style={{ margin: 0 }}>Resumo Inteligente & Diagnóstico</h3>
                    <span className="badge-count" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                      {Math.round(copilotAnalysis.confidence * 100)}% Confiança
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '14px', color: '#1e293b', lineHeight: 1.6, background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  {copilotAnalysis.summary}
                </p>
              </div>

              <div className="service-two-col-grid">
                <div className="service-card-panel">
                  <div className="panel-header-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Brain size={18} style={{ color: '#059669' }} />
                      <h3 style={{ margin: 0 }}>Next Best Action (Ação Recomendada)</h3>
                    </div>
                  </div>
                  <div style={{ padding: '14px', background: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '13px', lineHeight: 1.5 }}>
                    {copilotAnalysis.nextBestAction}
                  </div>
                </div>

                <div className="service-card-panel">
                  <div className="panel-header-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageSquareText size={18} style={{ color: '#2563eb' }} />
                      <h3 style={{ margin: 0 }}>Resposta Sugerida (AI Draft)</h3>
                    </div>
                    <button className="primary-service-btn" onClick={handleApplyCopilotReply} style={{ fontSize: '12px', padding: '5px 10px' }}>
                      <Copy size={13} /> Aplicar no Chamado
                    </button>
                  </div>
                  <div style={{ padding: '14px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', color: '#1e3a8a', fontSize: '13px', lineHeight: 1.5 }}>
                    "{copilotAnalysis.suggestedReply}"
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. ABA: DASHBOARD & BI (COMMAND CENTER EXECUTIVO - FASE 22.12) */}
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

      {/* 4. ABA: CSAT + NPS (FASE 22.11) */}
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

      {/* 5. ABA: BASE DE CONHECIMENTO (FASE 22.10) */}
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

      {/* 6. ABA: MAJOR INCIDENTS P1 (FASE 22.9) */}
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

      {/* 7. ABA: PROBLEM MANAGEMENT (FASE 22.8) */}
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

      {/* 8. ABA: INCIDENTES ITIL (FASE 22.7) */}
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

      {/* 9. ABA: INBOX OMNICHANNEL (FASE 22.4) */}
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

      {/* 10. ABA: CHAMADOS & FILA (FASE 22.1 + 22.2) */}
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

      {/* 11. ABA: ABRIR NOVO CHAMADO */}
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

      {/* 12. ABA: CLIENTE 360° (FASE 22.5) */}
      {activeTab === 'client360' && (
        <div className="service-content-body">
          <div className="service-card-panel">
            <h3>Cliente 360° • João Silva Oliveira (VIP Diamond)</h3>
            <p>Histórico completo de compras ERP e validações de catraca.</p>
          </div>
        </div>
      )}

      {/* 13. ABA: WORKFLOWS (FASE 22.6) */}
      {activeTab === 'workflows' && (
        <div className="service-content-body">
          <div className="service-card-panel">
            <h3>Automações & Regras de Atendimento</h3>
            <p>Gatilhos de SLA, proximidade de evento e ações automáticas.</p>
          </div>
        </div>
      )}

      {/* 14. ABA: MOTOR DE SLA (FASE 22.3) */}
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
