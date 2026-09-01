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
  | 'bi'
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
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [improvements, setImprovements] = useState<ImprovementItem[]>(initialImprovements)
  const [liveEvent, setLiveEvent] = useState<LiveEventState>(initialLiveEvent)
  const [tickets, setTickets] = useState<TicketItem[]>(mockTickets)
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(mockTickets[0])
  const [newReply, setNewReply] = useState('')

  // Form Abrir Chamado
  const [formChannel, setFormChannel] = useState<'WHATSAPP' | 'EMAIL' | 'CHAT' | 'PHONE' | 'FORM'>('WHATSAPP')
  const [formSubject, setFormSubject] = useState('Ingresso não recebido após aprovação Pix')
  const [formDescription, setFormDescription] = useState('Cliente realizou pagamento via Pix, valor debitado e necessita de reenvio do QR Code.')
  const [formPriority, setFormPriority] = useState<'P1' | 'P2' | 'P3' | 'P4'>('P2')
  const [formCustomerName, setFormCustomerName] = useState('Roberto Almeida')
  const [formCustomerEmail, setFormCustomerEmail] = useState('roberto.almeida@email.com')
  const [formCustomerPhone, setFormCustomerPhone] = useState('(41) 99881-2233')

  useEffect(() => {
    if (!mode) return
    if (mode === 'hub') setActiveTab('hub')
    else if (mode === 'bi' || mode === 'reports' || mode === 'dashboard') setActiveTab('bi')
    else if (mode === 'predictive') setActiveTab('predictive')
    else if (mode === 'liveops') setActiveTab('liveops')
    else if (mode === 'copilot') setActiveTab('copilot')
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

  const handleCreateTicket = (e: FormEvent) => {
    e.preventDefault()
    const newId = tickets.length + 1
    const newProtocol = `DS-2026-${Math.floor(100000 + Math.random() * 900000)}`
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
      eventName: events[0]?.title || 'Festival XPTO 2026',
      orderCode: 'DI-985100',
      amount: 'R$ 240,00',
      assignedAgent: 'Lucas Atendente (N1)',
      queueName: 'Reenvio & Ingressos',
      slaResponseMinutes: 60,
      slaResolutionMinutes: 360,
      slaProgressPercent: 10,
      slaTimeRemaining: '05h 30min',
      createdAt: 'Agora mesmo',
      messages: [{ id: 1, author: formCustomerName, authorType: 'CUSTOMER', channel: formChannel, body: formDescription, createdAt: 'Agora' }]
    }
    setTickets([created, ...tickets])
    notify(`Chamado protocolado com sucesso: ${newProtocol}!`)
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

        {/* Top Launcher Carousel */}
        <div className="ds-launcher-bar">
          <button className={`ds-launcher-item ${activeTab === 'hub' ? 'active' : ''}`} onClick={() => setActiveTab('hub')}>
            <div className="ds-launcher-circle">
              <LifeBuoy size={22} />
            </div>
            <span className="ds-launcher-label">Hub Geral (Operacional)</span>
          </button>

          <button className={`ds-launcher-item ${activeTab === 'bi' ? 'active' : ''}`} onClick={() => setActiveTab('bi')}>
            <div className="ds-launcher-circle">
              <BarChart3 size={22} />
            </div>
            <span className="ds-launcher-label">Dashboard & BI (Analytics)</span>
          </button>

          <button className={`ds-launcher-item ${activeTab === 'copilot' ? 'active' : ''}`} onClick={() => setActiveTab('copilot')}>
            <div className="ds-launcher-circle">
              <Bot size={22} />
              <span className="ds-mini-tag purple">94%</span>
            </div>
            <span className="ds-launcher-label">Disk Copilot IA</span>
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

          <button className={`ds-launcher-item ${activeTab === 'predictive' ? 'active' : ''}`} onClick={() => setActiveTab('predictive')}>
            <div className="ds-launcher-circle">
              <Brain size={22} />
            </div>
            <span className="ds-launcher-label">Analytics Preditivo</span>
          </button>
        </div>

        {/* ========================================================
            TELA 1: HUB GERAL (TOTALMENTE OPERACIONAL)
            Conforme ChatGPT Image 1 de set. de 2026, 13_50_13.png
            ======================================================== */}
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
              <div className="ds-module-card" onClick={() => setActiveTab('tickets')}>
                <div className="ds-card-icon-wrap green"><TicketCheck size={22} /></div>
                <div className="ds-card-text"><h4>Tickets</h4><p>Chamados, atendimentos e resoluções</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('inbox')}>
                <div className="ds-card-icon-wrap cyan"><MessagesSquare size={22} /></div>
                <div className="ds-card-text"><h4>Omnichannel</h4><p>WhatsApp, Email, Chat, Instagram e mais</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('sla')}>
                <div className="ds-card-icon-wrap purple"><Clock3 size={22} /></div>
                <div className="ds-card-text"><h4>SLA</h4><p>Acordos, metas e conformidade de SLA</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('teams')}>
                <div className="ds-card-icon-wrap yellow"><Users size={22} /></div>
                <div className="ds-card-text"><h4>Filas & Agentes</h4><p>Distribuição, agentes e carga de trabalho</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('client360')}>
                <div className="ds-card-icon-wrap pink"><UserRound size={22} /></div>
                <div className="ds-card-text"><h4>Clientes 360°</h4><p>Histórico completo do cliente em um só lugar</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('liveops')}>
                <div className="ds-card-icon-wrap emerald"><CalendarDays size={22} /></div>
                <div className="ds-card-text"><h4>Eventos</h4><p>Eventos, check-in, acesso e operação ao vivo</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('incidents')}>
                <div className="ds-card-icon-wrap red"><AlertTriangle size={22} /></div>
                <div className="ds-card-text"><h4>Incidentes</h4><p>Registro, impacto, prioridade e resolução</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('problems')}>
                <div className="ds-card-icon-wrap purple"><Bug size={22} /></div>
                <div className="ds-card-text"><h4>Problems (RCA)</h4><p>Gestão de problemas, causas e planos</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('major')}>
                <div className="ds-card-icon-wrap red"><Siren size={22} /></div>
                <div className="ds-card-text"><h4>Major Incidents (P1)</h4><p>Incidentes críticos e War Room</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('knowledge')}>
                <div className="ds-card-icon-wrap blue"><BookOpen size={22} /></div>
                <div className="ds-card-text"><h4>Base de Conhecimento</h4><p>Artigos, manuais e soluções inteligentes</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('csat')}>
                <div className="ds-card-icon-wrap green"><Smile size={22} /></div>
                <div className="ds-card-text"><h4>CSAT + NPS</h4><p>Satisfação do cliente e experiência</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('copilot')}>
                <div className="ds-card-icon-wrap purple"><Bot size={22} /></div>
                <div className="ds-card-text"><h4>Disk Copilot IA</h4><p>IA aplicada ao atendimento com sugestões inteligentes</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('bi')}>
                <div className="ds-card-icon-wrap cyan"><BarChart3 size={22} /></div>
                <div className="ds-card-text"><h4>Dashboard & BI</h4><p>Indicadores, métricas e análises em tempo real</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('liveops')}>
                <div className="ds-card-icon-wrap orange"><Radio size={22} /></div>
                <div className="ds-card-text"><h4>Operação em Tempo Real</h4><p>Monitoramento ao vivo dos eventos</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('predictive')}>
                <div className="ds-card-icon-wrap teal"><Brain size={22} /></div>
                <div className="ds-card-text"><h4>Analytics Preditivo</h4><p>Previsões, riscos e recomendações</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>
            </div>

            {/* VISÃO GERAL DA OPERAÇÃO */}
            <div className="ds-section-header">
              <h2 className="ds-section-title">VISÃO GERAL DA OPERAÇÃO</h2>
            </div>

            <div className="ds-stats-strip">
              <div className="ds-stat-card">
                <div className="ds-stat-icon-wrap"><Ticket size={20} /></div>
                <div className="ds-stat-content">
                  <span className="ds-stat-label">Tickets Abertos</span>
                  <div className="ds-stat-val-row">
                    <span className="ds-stat-val">128</span>
                    <span className="ds-stat-delta green">-12% vs ontem</span>
                  </div>
                </div>
              </div>

              <div className="ds-stat-card">
                <div className="ds-stat-icon-wrap"><Clock3 size={20} /></div>
                <div className="ds-stat-content">
                  <span className="ds-stat-label">Atrasados (SLA)</span>
                  <div className="ds-stat-val-row">
                    <span className="ds-stat-val" style={{ color: '#f59e0b' }}>18</span>
                    <span className="ds-stat-delta orange">+4% vs ontem</span>
                  </div>
                </div>
              </div>

              <div className="ds-stat-card">
                <div className="ds-stat-icon-wrap"><Smile size={20} /></div>
                <div className="ds-stat-content">
                  <span className="ds-stat-label">CSAT (Hoje)</span>
                  <div className="ds-stat-val-row">
                    <span className="ds-stat-val" style={{ color: '#10b981' }}>4.6/5</span>
                    <span className="ds-stat-delta green">+0.3 vs ontem</span>
                  </div>
                </div>
              </div>

              <div className="ds-stat-card">
                <div className="ds-stat-icon-wrap"><TrendingUp size={20} /></div>
                <div className="ds-stat-content">
                  <span className="ds-stat-label">NPS (Hoje)</span>
                  <div className="ds-stat-val-row">
                    <span className="ds-stat-val" style={{ color: '#10b981' }}>53+</span>
                    <span className="ds-stat-delta green">+5 vs ontem</span>
                  </div>
                </div>
              </div>

              <div className="ds-stat-card">
                <div className="ds-stat-icon-wrap"><Users size={20} /></div>
                <div className="ds-stat-content">
                  <span className="ds-stat-label">Check-ins (Hoje)</span>
                  <div className="ds-stat-val-row">
                    <span className="ds-stat-val" style={{ color: '#38bdf8' }}>8.742</span>
                    <span className="ds-stat-delta green">+18% vs ontem</span>
                  </div>
                </div>
              </div>

              <div className="ds-stat-card">
                <div className="ds-stat-icon-wrap"><Shield size={20} /></div>
                <div className="ds-stat-content">
                  <span className="ds-stat-label">P1 Ativos</span>
                  <div className="ds-stat-val-row">
                    <span className="ds-stat-val" style={{ color: '#ef4444' }}>3</span>
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
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('new')}><Plus size={14} style={{ color: '#10b981' }} /> Novo Ticket</button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('incidents')}><AlertTriangle size={14} style={{ color: '#ef4444' }} /> Novo Incidente</button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('major')}><Siren size={14} style={{ color: '#ef4444' }} /> War Room</button>
              <button className="ds-quick-action-pill" onClick={() => notify('Disparo de broadcast em massa configurado')}><Radio size={14} style={{ color: '#f59e0b' }} /> Broadcast</button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('bi')}><BarChart3 size={14} style={{ color: '#38bdf8' }} /> Relatório Executivo</button>
              <button className="ds-quick-action-pill" onClick={() => notify('Exportação de dados CSV/PDF iniciada')}><Download size={14} style={{ color: '#8b5cf6' }} /> Exportar Dados</button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('sla')}><SlidersHorizontal size={14} /> Configurações</button>
            </div>
          </>
        )}

        {/* ========================================================
            TELA 2: DASHBOARD & BI (TOTALMENTE INFORMATIVO & ANALÍTICO)
            Conforme ChatGPT Image 1 de set. de 2026, 13_50_05.png
            ======================================================== */}
        {activeTab === 'bi' && (
          <div style={{ marginTop: '10px' }}>
            
            {/* 6 Scorecards com Sparkline Graphs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '14px', marginBottom: '20px' }}>
              
              {/* Scorecard 1: Tickets Abertos */}
              <div className="ds-spark-card">
                <div className="ds-spark-top">
                  <div className="ds-spark-icon blue"><Ticket size={20} /></div>
                  <div className="ds-spark-header-text">
                    <span>Tickets Abertos</span>
                    <div className="ds-spark-value-row">
                      <strong className="ds-spark-value">128</strong>
                      <small className="ds-stat-delta green">-12% vs ontem</small>
                    </div>
                  </div>
                </div>
                <svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M0,25 Q15,5 30,20 T60,10 T90,22 L100,15" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Scorecard 2: P1 Ativos */}
              <div className="ds-spark-card">
                <div className="ds-spark-top">
                  <div className="ds-spark-icon red"><Shield size={20} /></div>
                  <div className="ds-spark-header-text">
                    <span>P1 Ativos</span>
                    <div className="ds-spark-value-row">
                      <strong className="ds-spark-value" style={{ color: '#ef4444' }}>3</strong>
                      <small className="ds-stat-delta red">+1 vs ontem</small>
                    </div>
                  </div>
                </div>
                <svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M0,22 Q20,28 40,12 T70,25 T90,5 L100,18" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Scorecard 3: Atrasados (SLA) */}
              <div className="ds-spark-card">
                <div className="ds-spark-top">
                  <div className="ds-spark-icon orange"><Clock3 size={20} /></div>
                  <div className="ds-spark-header-text">
                    <span>Atrasados (SLA)</span>
                    <div className="ds-spark-value-row">
                      <strong className="ds-spark-value" style={{ color: '#f59e0b' }}>18</strong>
                      <small className="ds-stat-delta orange">+4% vs ontem</small>
                    </div>
                  </div>
                </div>
                <svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M0,20 Q25,25 45,8 T75,22 T95,14 L100,18" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Scorecard 4: CSAT (Hoje) */}
              <div className="ds-spark-card">
                <div className="ds-spark-top">
                  <div className="ds-spark-icon green"><Smile size={20} /></div>
                  <div className="ds-spark-header-text">
                    <span>CSAT (Hoje)</span>
                    <div className="ds-spark-value-row">
                      <strong className="ds-spark-value" style={{ color: '#10b981' }}>4.6/5</strong>
                      <small className="ds-stat-delta green">+0.3 vs ontem</small>
                    </div>
                  </div>
                </div>
                <svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M0,24 Q20,10 40,22 T70,8 T90,16 L100,10" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Scorecard 5: NPS (Hoje) */}
              <div className="ds-spark-card">
                <div className="ds-spark-top">
                  <div className="ds-spark-icon teal"><TrendingUp size={20} /></div>
                  <div className="ds-spark-header-text">
                    <span>NPS (Hoje)</span>
                    <div className="ds-spark-value-row">
                      <strong className="ds-spark-value" style={{ color: '#14b8a6' }}>53</strong>
                      <small className="ds-stat-delta green">+5 vs ontem</small>
                    </div>
                  </div>
                </div>
                <svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M0,22 Q25,26 50,14 T80,18 T95,6 L100,10" fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Scorecard 6: Check-ins (Hoje) */}
              <div className="ds-spark-card">
                <div className="ds-spark-top">
                  <div className="ds-spark-icon cyan"><Users size={20} /></div>
                  <div className="ds-spark-header-text">
                    <span>Check-ins (Hoje)</span>
                    <div className="ds-spark-value-row">
                      <strong className="ds-spark-value" style={{ color: '#06b6d4' }}>8.742</strong>
                      <small className="ds-stat-delta green">+18% vs ontem</small>
                    </div>
                  </div>
                </div>
                <svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M0,26 Q20,18 45,22 T70,10 T90,8 L100,5" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

            </div>

            {/* Acessos Rápidos Bar */}
            <div className="ds-section-header" style={{ marginTop: '10px' }}>
              <h2 className="ds-section-title">Acesso rápido</h2>
            </div>
            <div className="ds-quick-actions-bar" style={{ marginBottom: '24px' }}>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('new')}><Plus size={14} style={{ color: '#10b981' }} /> Novo Ticket</button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('incidents')}><AlertTriangle size={14} style={{ color: '#ef4444' }} /> Novo Incidente</button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('major')}><Siren size={14} style={{ color: '#ef4444' }} /> War Room</button>
              <button className="ds-quick-action-pill" onClick={() => notify('Disparo de broadcast em massa configurado')}><Radio size={14} style={{ color: '#f59e0b' }} /> Broadcast</button>
              <button className="ds-quick-action-pill active" style={{ background: '#1e3a8a', color: '#60a5fa' }} onClick={() => notify('Relatório Executivo atualizado')}><BarChart3 size={14} /> Relatório Executivo</button>
              <button className="ds-quick-action-pill" onClick={() => notify('Exportação iniciada')}><Download size={14} style={{ color: '#8b5cf6' }} /> Exportar Dados</button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('sla')}><SlidersHorizontal size={14} /> Configurações</button>
            </div>

            {/* LINHA 1 DE GRÁFICOS: Volume de Tickets | Tickets por Canal | Alertas Críticos */}
            <div className="ds-bi-row three-col">
              
              {/* Gráfico 1: Volume de Tickets */}
              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title">Volume de Tickets</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><i style={{ width: '8px', height: '8px', background: '#2563eb', borderRadius: '2px', display: 'inline-block' }} /> Abertos</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><i style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '2px', display: 'inline-block' }} /> Resolvidos</span>
                    </div>
                    <select className="ds-filter-select">
                      <option>Últimos 7 dias</option>
                      <option>Últimos 14 dias</option>
                      <option>Mês atual</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '170px', padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                  {[
                    { day: '13/05', open: 280, closed: 210 },
                    { day: '14/05', open: 310, closed: 260 },
                    { day: '15/05', open: 295, closed: 245 },
                    { day: '16/05', open: 340, closed: 290 },
                    { day: '17/05', open: 260, closed: 215 },
                    { day: '18/05', open: 285, closed: 190 },
                    { day: '19/05', open: 250, closed: 180 }
                  ].map((d, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '130px' }}>
                        <div style={{ width: '12px', background: '#2563eb', height: `${(d.open / 350) * 125}px`, borderRadius: '3px 3px 0 0' }} />
                        <div style={{ width: '12px', background: '#10b981', height: `${(d.closed / 350) * 125}px`, borderRadius: '3px 3px 0 0' }} />
                      </div>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gráfico 2: Tickets por Canal (Donut) */}
              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title">Tickets por Canal</h3>
                  <select className="ds-filter-select">
                    <option>Hoje</option>
                    <option>7 dias</option>
                    <option>Mês atual</option>
                  </select>
                </div>

                <div className="ds-donut-wrapper">
                  <div className="ds-donut-circle-wrap">
                    <svg viewBox="0 0 36 36" style={{ width: '140px', height: '140px', transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#1e293b" strokeWidth="4.5" />
                      {/* WhatsApp 52% */}
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#2563eb" strokeWidth="4.5" strokeDasharray="45.7 100" strokeDashoffset="0" />
                      {/* Email 21% */}
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#f97316" strokeWidth="4.5" strokeDasharray="18.5 100" strokeDashoffset="-45.7" />
                      {/* Chat 12% */}
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#eab308" strokeWidth="4.5" strokeDasharray="10.5 100" strokeDashoffset="-64.2" />
                      {/* Instagram 7% */}
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#ec4899" strokeWidth="4.5" strokeDasharray="6.1 100" strokeDashoffset="-74.7" />
                      {/* Telefone 6% */}
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#14b8a6" strokeWidth="4.5" strokeDasharray="5.2 100" strokeDashoffset="-80.8" />
                      {/* Outros 2% */}
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#64748b" strokeWidth="4.5" strokeDasharray="1.8 100" strokeDashoffset="-86" />
                    </svg>
                    <div className="ds-donut-center-text">
                      <strong>1.245</strong>
                      <small>Total</small>
                    </div>
                  </div>

                  <div className="ds-donut-legend">
                    <div className="ds-legend-item"><div className="ds-legend-left"><span className="ds-legend-dot" style={{ background: '#2563eb' }} /> WhatsApp</div><strong>52%</strong></div>
                    <div className="ds-legend-item"><div className="ds-legend-left"><span className="ds-legend-dot" style={{ background: '#f97316' }} /> Email</div><strong>21%</strong></div>
                    <div className="ds-legend-item"><div className="ds-legend-left"><span className="ds-legend-dot" style={{ background: '#eab308' }} /> Chat</div><strong>12%</strong></div>
                    <div className="ds-legend-item"><div className="ds-legend-left"><span className="ds-legend-dot" style={{ background: '#ec4899' }} /> Instagram</div><strong>7%</strong></div>
                    <div className="ds-legend-item"><div className="ds-legend-left"><span className="ds-legend-dot" style={{ background: '#14b8a6' }} /> Telefone</div><strong>6%</strong></div>
                    <div className="ds-legend-item"><div className="ds-legend-left"><span className="ds-legend-dot" style={{ background: '#64748b' }} /> Outros</div><strong>2%</strong></div>
                  </div>
                </div>
              </div>

              {/* Lista: Alertas Críticos */}
              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 className="ds-bi-card-title">Alertas críticos</h3>
                    <span className="ds-badge-count-pill" style={{ position: 'static' }}>5</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#38bdf8', cursor: 'pointer', fontWeight: 700 }} onClick={() => setActiveTab('incidents')}>Ver todos</span>
                </div>

                <div className="ds-alerts-list">
                  <div className="ds-alert-item">
                    <div className="ds-alert-icon p1"><Siren size={16} /></div>
                    <div className="ds-alert-content">
                      <div className="ds-alert-title-row"><span className="ds-alert-tag p1">P1</span><span className="ds-alert-title">Catraca Principal Offline</span></div>
                      <p className="ds-alert-sub">Festival XPTO 2026 • Portão 02</p>
                    </div>
                    <span className="ds-alert-time">Agora</span>
                  </div>

                  <div className="ds-alert-item">
                    <div className="ds-alert-icon p1"><ShieldAlert size={16} /></div>
                    <div className="ds-alert-content">
                      <div className="ds-alert-title-row"><span className="ds-alert-tag p1">P1</span><span className="ds-alert-title">Falha na API de Validação</span></div>
                      <p className="ds-alert-sub">Validação de ingressos instável</p>
                    </div>
                    <span className="ds-alert-time">2 min</span>
                  </div>

                  <div className="ds-alert-item">
                    <div className="ds-alert-icon p2"><AlertTriangle size={16} /></div>
                    <div className="ds-alert-content">
                      <div className="ds-alert-title-row"><span className="ds-alert-tag p2">P2</span><span className="ds-alert-title">Alto volume de tickets</span></div>
                      <p className="ds-alert-sub">Fila: Suporte - WhatsApp</p>
                    </div>
                    <span className="ds-alert-time">5 min</span>
                  </div>

                  <div className="ds-alert-item">
                    <div className="ds-alert-icon p2"><Clock3 size={16} /></div>
                    <div className="ds-alert-content">
                      <div className="ds-alert-title-row"><span className="ds-alert-tag p2">P2</span><span className="ds-alert-title">SLA acima do limite</span></div>
                      <p className="ds-alert-sub">Fila: Financeiro</p>
                    </div>
                    <span className="ds-alert-time">8 min</span>
                  </div>

                  <div className="ds-alert-item">
                    <div className="ds-alert-icon p3"><WifiOff size={16} /></div>
                    <div className="ds-alert-content">
                      <div className="ds-alert-title-row"><span className="ds-alert-tag p3">P3</span><span className="ds-alert-title">Scanner com baixa bateria</span></div>
                      <p className="ds-alert-sub">Portão 04 - Scanner 12</p>
                    </div>
                    <span className="ds-alert-time">12 min</span>
                  </div>
                </div>
              </div>

            </div>

            {/* LINHA 2 DE GRÁFICOS: SLA Compliance | FRT | MTTR | Próximos Eventos */}
            <div className="ds-bi-row four-col">
              
              {/* Gráfico SLA Compliance (Gauge) */}
              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title">SLA Compliance</h3>
                  <select className="ds-filter-select"><option>Mês atual</option></select>
                </div>
                <div className="ds-gauge-container">
                  <svg viewBox="0 0 100 55" style={{ width: '130px', height: '70px' }}>
                    <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
                    <path d="M10,50 A40,40 0 0,1 84,26" fill="none" stroke="#14b8a6" strokeWidth="8" strokeLinecap="round" />
                  </svg>
                  <strong className="ds-gauge-score">92%</strong>
                  <span className="ds-gauge-label">Conformidade</span>
                </div>
                <div className="ds-gauge-footer">
                  <span>Meta: 90%</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>+2pp vs mês anterior</span>
                </div>
              </div>

              {/* Gráfico FRT Primeira Resposta */}
              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title">FRT (Primeira Resposta)</h3>
                  <select className="ds-filter-select"><option>Mês atual</option></select>
                </div>
                <div>
                  <strong style={{ fontSize: '24px', color: '#fff', display: 'block' }}>2h 38m</strong>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Tempo médio</span>
                </div>
                <svg viewBox="0 0 100 35" style={{ width: '100%', height: '55px', margin: '8px 0' }} preserveAspectRatio="none">
                  <path d="M0,28 Q15,10 30,22 T60,8 T90,18 L100,12" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <div className="ds-gauge-footer">
                  <span>Meta: 4h</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>-1h 22m vs mês anterior</span>
                </div>
              </div>

              {/* Gráfico MTTR Resolução */}
              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title">MTTR (Resolução)</h3>
                  <select className="ds-filter-select"><option>Mês atual</option></select>
                </div>
                <div>
                  <strong style={{ fontSize: '24px', color: '#fff', display: 'block' }}>8h 41m</strong>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Tempo médio</span>
                </div>
                <svg viewBox="0 0 100 35" style={{ width: '100%', height: '55px', margin: '8px 0' }} preserveAspectRatio="none">
                  <path d="M0,22 Q20,30 40,12 T70,20 T95,6 L100,14" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <div className="ds-gauge-footer">
                  <span>Meta: 12h</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>-3h 19m vs mês anterior</span>
                </div>
              </div>

              {/* Próximos Eventos */}
              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title">Próximos eventos</h3>
                  <span style={{ fontSize: '11px', color: '#38bdf8', cursor: 'pointer', fontWeight: 700 }}>Ver agenda</span>
                </div>
                <div className="ds-events-list">
                  <div className="ds-event-item">
                    <div className="ds-event-date-box"><span className="ds-event-date-day">20</span><span className="ds-event-date-month">MAI</span></div>
                    <div className="ds-event-info"><h4 className="ds-event-title">Festival XPTO 2026</h4><p className="ds-event-meta">Hoje • 16:00 • 15.000 esperado</p></div>
                    <span className="ds-event-status-pill green">Em andamento</span>
                  </div>

                  <div className="ds-event-item">
                    <div className="ds-event-date-box"><span className="ds-event-date-day">24</span><span className="ds-event-date-month">MAI</span></div>
                    <div className="ds-event-info"><h4 className="ds-event-title">Show do Seu Jorge</h4><p className="ds-event-meta">Sáb • 20:00 • 8.000 esperado</p></div>
                    <span className="ds-event-status-pill orange">Aguardando</span>
                  </div>

                  <div className="ds-event-item">
                    <div className="ds-event-date-box"><span className="ds-event-date-day">31</span><span className="ds-event-date-month">MAI</span></div>
                    <div className="ds-event-info"><h4 className="ds-event-title">Rap in Festival</h4><p className="ds-event-meta">Sáb • 18:00 • 12.000 esperado</p></div>
                    <span className="ds-event-status-pill blue">Programado</span>
                  </div>
                </div>
              </div>

            </div>

            {/* LINHA 3 DE GRÁFICOS: Tickets por Categoria | Top Agentes por Conformidade de SLA */}
            <div className="ds-bi-row two-col">
              
              {/* Tickets por Categoria */}
              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title">Tickets por Categoria</h3>
                  <select className="ds-filter-select"><option>Mês atual</option></select>
                </div>

                <div className="ds-category-row">
                  <div className="ds-category-header"><span className="ds-category-name">Acesso e Validação</span><span className="ds-category-val">425 (34%)</span></div>
                  <div className="ds-category-track"><div className="ds-category-fill" style={{ width: '34%', background: '#3b82f6' }} /></div>
                </div>

                <div className="ds-category-row">
                  <div className="ds-category-header"><span className="ds-category-name">Pagamento e Reembolso</span><span className="ds-category-val">312 (25%)</span></div>
                  <div className="ds-category-track"><div className="ds-category-fill" style={{ width: '25%', background: '#10b981' }} /></div>
                </div>

                <div className="ds-category-row">
                  <div className="ds-category-header"><span className="ds-category-name">Informações de Evento</span><span className="ds-category-val">198 (16%)</span></div>
                  <div className="ds-category-track"><div className="ds-category-fill" style={{ width: '16%', background: '#f59e0b' }} /></div>
                </div>

                <div className="ds-category-row">
                  <div className="ds-category-header"><span className="ds-category-name">Transferência e Titularidade</span><span className="ds-category-val">142 (11%)</span></div>
                  <div className="ds-category-track"><div className="ds-category-fill" style={{ width: '11%', background: '#8b5cf6' }} /></div>
                </div>

                <div className="ds-category-row">
                  <div className="ds-category-header"><span className="ds-category-name">Outros</span><span className="ds-category-val">168 (14%)</span></div>
                  <div className="ds-category-track"><div className="ds-category-fill" style={{ width: '14%', background: '#64748b' }} /></div>
                </div>
              </div>

              {/* Top Agentes por Conformidade de SLA */}
              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title">Top Agentes por Conformidade de SLA</h3>
                  <select className="ds-filter-select"><option>Mês atual</option></select>
                </div>

                <div className="ds-agent-rank-table">
                  <div className="ds-agent-rank-row">
                    <span className="ds-agent-num">1</span>
                    <div className="ds-agent-avatar" style={{ background: '#ec4899' }}>GM</div>
                    <span className="ds-agent-name">Gabriela Martins</span>
                    <div className="ds-agent-bar-wrap"><div className="ds-agent-bar-fill" style={{ width: '98%' }} /></div>
                    <span className="ds-agent-pct">98%</span>
                    <span className="ds-agent-tickets-count">320 tickets</span>
                  </div>

                  <div className="ds-agent-rank-row">
                    <span className="ds-agent-num">2</span>
                    <div className="ds-agent-avatar" style={{ background: '#3b82f6' }}>LF</div>
                    <span className="ds-agent-name">Lucas Ferreira</span>
                    <div className="ds-agent-bar-wrap"><div className="ds-agent-bar-fill" style={{ width: '95%' }} /></div>
                    <span className="ds-agent-pct">95%</span>
                    <span className="ds-agent-tickets-count">280 tickets</span>
                  </div>

                  <div className="ds-agent-rank-row">
                    <span className="ds-agent-num">3</span>
                    <div className="ds-agent-avatar" style={{ background: '#10b981' }}>JC</div>
                    <span className="ds-agent-name">Juliana Costa</span>
                    <div className="ds-agent-bar-wrap"><div className="ds-agent-bar-fill" style={{ width: '93%' }} /></div>
                    <span className="ds-agent-pct">93%</span>
                    <span className="ds-agent-tickets-count">265 tickets</span>
                  </div>

                  <div className="ds-agent-rank-row">
                    <span className="ds-agent-num">4</span>
                    <div className="ds-agent-avatar" style={{ background: '#f59e0b' }}>RA</div>
                    <span className="ds-agent-name">Rafael Almeida</span>
                    <div className="ds-agent-bar-wrap"><div className="ds-agent-bar-fill" style={{ width: '91%' }} /></div>
                    <span className="ds-agent-pct">91%</span>
                    <span className="ds-agent-tickets-count">240 tickets</span>
                  </div>

                  <div className="ds-agent-rank-row">
                    <span className="ds-agent-num">5</span>
                    <div className="ds-agent-avatar" style={{ background: '#8b5cf6' }}>BS</div>
                    <span className="ds-agent-name">Beatriz Santos</span>
                    <div className="ds-agent-bar-wrap"><div className="ds-agent-bar-fill" style={{ width: '89%' }} /></div>
                    <span className="ds-agent-pct">89%</span>
                    <span className="ds-agent-tickets-count">210 tickets</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SUBMÓDULOS ESPECÍFICOS */}
        {activeTab === 'tickets' && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('hub')}><ChevronLeft size={16} /> Voltar ao Hub Operacional</button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('new')} style={{ background: '#2563eb', color: '#fff' }}><Plus size={16} /> Abrir Chamado</button>
            </div>

            <div className="ticket-split-layout">
              <div className="ticket-list-panel">
                <div className="tickets-scroll-container">
                  {tickets.map(t => (
                    <div key={t.id} className={`ticket-summary-card ${selectedTicket?.id === t.id ? 'active' : ''}`} onClick={() => setSelectedTicket(t)}>
                      <div className="ticket-top-row"><span className="channel-badge">{t.channel}</span><span className="priority-tag P1">{t.priority}</span><span className="status-pill green">{t.status}</span></div>
                      <h4 className="ticket-card-subject">#{t.protocol} - {t.subject}</h4>
                      <p style={{ margin: '4px 0', fontSize: '12px', color: '#94a3b8' }}>{t.customerName} • {t.eventName}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ticket-detail-panel">
                {selectedTicket && (
                  <div className="ticket-workspace">
                    <div className="workspace-header">
                      <div>
                        <h2>{selectedTicket.subject}</h2>
                        <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '13px' }}>Protocolo: <b>{selectedTicket.protocol}</b> · Cliente: <b>{selectedTicket.customerName}</b></p>
                      </div>
                    </div>

                    <div className="timeline-chat-box" style={{ flex: 1, overflowY: 'auto', background: '#0f172a', borderRadius: '10px', padding: '16px', margin: '14px 0' }}>
                      {selectedTicket.messages.map(m => (
                        <div key={m.id} style={{ marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', background: m.authorType === 'CUSTOMER' ? '#1e293b' : '#1e3a8a', maxWidth: '85%', marginLeft: m.authorType === 'CUSTOMER' ? '0' : 'auto' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}><strong>{m.author}</strong><span>{m.createdAt}</span></div>
                          <p style={{ margin: 0, fontSize: '13px', color: '#f8fafc' }}>{m.body}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder="Escreva uma resposta ao cliente..." value={newReply} onChange={e => setNewReply(e.target.value)} style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#fff' }} />
                      <button className="ds-quick-action-pill" style={{ background: '#2563eb', color: '#fff', border: 0 }} onClick={() => { if (!newReply) return; notify('Resposta enviada!'); setNewReply('') }}><Send size={15} /> Enviar</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MÓDULO: NOVO CHAMADO */}
        {activeTab === 'new' && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('hub')}><ChevronLeft size={16} /> Voltar ao Hub Geral</button>
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
                  <button type="submit" className="ds-quick-action-pill" style={{ background: '#2563eb', color: '#fff', border: 0, padding: '10px 20px', fontSize: '14px' }}><Plus size={16} /> Protocolar Chamado com SLA</button>
                </div>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}
