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
  ThumbsUp, ThumbsDown, Eye, Archive, TicketCheck, LineChart, PieChart
} from 'lucide-react'
import type { EventItem } from '../data/events'

export type ServiceTab =
  | 'hub'
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
      { id: 1, cadence: '11:15 (Update 1)', message: 'Switch local reinicializado e tráfego de backup 5G ativado.', timestamp: '11:15' },
      { id: 1, cadence: '11:30 (Update 2)', message: 'Validação normalizada nas catracas 01 a 03. Monitorando catraca 04.', timestamp: '11:30' }
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

const initialKnowledgeArticles: KnowledgeArticleItem[] = [
  {
    id: 1,
    title: 'Como reenviar o ingresso com QR Code por E-mail e WhatsApp',
    category: 'Ingressos & Carteira',
    summary: 'Procedimento operacional para atendentes dispararem o voucher PDF e o QR Code atualizado direto pelo SAC.',
    content: '1. Localize o cliente pelo CPF ou código do pedido #DI.\n2. Verifique se o status do pedido consta como APROVADO.\n3. Na barra de ações rápidas, clique em "Reenviar Ingresso & QR Code".\n4. O sistema dispara a mensagem transacional pelo canal preferencial (WhatsApp ou E-mail) com entrega confirmada em tempo real.',
    status: 'PUBLISHED',
    visibility: 'PUBLIC_FAQ',
    viewsCount: 1420,
    helpfulCount: 380,
    unhelpfulCount: 8,
    tags: ['reenvio', 'qr_code', 'voucher', 'whatsapp', 'email'],
    links: [{ entityType: 'TICKET', label: 'Chamados de Reenvio' }],
    updatedAt: 'Hoje às 09:30'
  },
  {
    id: 2,
    title: 'Procedimento para cancelamento e estorno Pix em até 7 dias (CDC)',
    category: 'Financeiro & Estornos',
    summary: 'Regras do Art. 49 do Código de Defesa do Consumidor para devolução imediata do valor via gateway Efí Pix.',
    content: '1. Valide se a compra foi realizada há menos de 7 dias e com antecedência mínima de 48h antes do início do evento.\n2. No módulo Financeiro/SAC, acione o botão "Solicitar Estorno Pix".\n3. O webhook bancário processa o estorno na mesma chave Pix pagadora em até 60 segundos.',
    status: 'PUBLISHED',
    visibility: 'PUBLIC_FAQ',
    viewsCount: 890,
    helpfulCount: 215,
    unhelpfulCount: 5,
    tags: ['estorno', 'pix', 'reembolso', 'cdc_art49'],
    links: [{ entityType: 'PROBLEM', label: 'PRB-2026-001' }],
    updatedAt: 'Ontem'
  },
  {
    id: 3,
    title: 'Known Error: Divergência na Catraca 04 durante pico de portaria',
    category: 'Operação de Portaria & Hardware',
    summary: 'Workaround homologado para validação em contingência durante oscilação do switch local.',
    content: 'WORKAROUND OPERACIONAL:\n1. Roteie os compradores para as Catracas 01 a 03.\n2. Na Catraca 04, pressione F8 para ativar o modo de leitura de backup offline em cache.\n3. A sincronização de borda normaliza em até 3 minutos.',
    status: 'PUBLISHED',
    visibility: 'INTERNAL_SAC',
    viewsCount: 310,
    helpfulCount: 94,
    unhelpfulCount: 1,
    tags: ['catraca', 'portao_b', 'known_error', 'hardware'],
    links: [{ entityType: 'MAJOR_INCIDENT', label: 'MI-2026-001' }, { entityType: 'PROBLEM', label: 'PRB-2026-002' }],
    updatedAt: 'Hoje às 11:35'
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
  },
  {
    id: 2,
    customerName: 'Patrícia Rocha',
    surveyType: 'CSAT',
    score: 2,
    comment: 'A atendente foi educada, mas o link de biometria facial deu erro 3 vezes no Safari.',
    channel: 'CHAT',
    eventName: 'Festival Sertanejo Curitiba 2026',
    status: 'IN_CONTACT',
    createdAt: 'Há 2 horas'
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
      { id: 302, senderName: 'Rodrigo Financeiro', direction: 'OUTBOUND', body: 'A cobrança duplicada sofreu timeout e foi estornada com sucesso.', deliveryStatus: 'READ', createdAt: 'Ontem 17:10' }
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
    name: 'Pesquisa Automática CSAT/NPS pós-resolução',
    code: 'WF_SURVEY_AUTO_SEND',
    description: 'Dispara pesquisa de 1 a 5 estrelas por WhatsApp assim que o ticket for marcado como RESOLVIDO.',
    triggerEvent: 'TICKET_CREATED',
    priority: 2,
    isActive: true,
    runsCount: 240,
    successCount: 240,
    failedCount: 0,
    actions: ['SEND_MESSAGE(WHATSAPP_SURVEY)', 'SCHEDULE_REMINDER(2H)']
  }
]

const initialWorkflowRuns: WorkflowRun[] = [
  { id: 101, workflowName: 'Pesquisa Automática CSAT/NPS pós-resolução', ticketNumber: 'DS-2026-983110', triggerEvent: 'PAYMENT_APPROVED', status: 'SUCCESS', executionTimeMs: 95, createdAt: 'Há 8 min' },
  { id: 102, workflowName: 'QR Code Crítico Próximo do Evento', ticketNumber: 'DS-2026-984180', triggerEvent: 'EVENT_NEAR', status: 'SUCCESS', executionTimeMs: 88, createdAt: 'Há 25 min' }
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
  const [inboxChannelFilter, setInboxChannelFilter] = useState<string>('ALL')
  const [inboxSearch, setInboxSearch] = useState('')
  const [inboxReply, setInboxReply] = useState('')

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

  const [customerSearchQuery, setCustomerSearchQuery] = useState('João Silva Oliveira')
  const [tickets, setTickets] = useState<TicketItem[]>(mockTickets)
  const [agents, setAgents] = useState<AgentItem[]>(initialAgents)
  const [queues, setQueues] = useState<QueueItem[]>(initialQueues)
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(mockTickets[0])
  const [ticketSearch, setTicketSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('TODOS')
  const [statusFilter, setStatusFilter] = useState<string>('TODOS')
  const [newReply, setNewReply] = useState('')

  useEffect(() => {
    if (!mode) return
    if (mode === 'hub') setActiveTab('hub')
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
    const frtMinutes = 8
    const mttrMinutes = 42
    const slaCompliance = 96.4
    return { total, open, csatPercent, npsScore, promotersPercent, detractorsPercent, responseRate, openAlerts, onlineAgents, unreadOmnichannel, activeMajorIncidents, frtMinutes, mttrMinutes, slaCompliance }
  }, [tickets, agents, conversations, majorIncidents, experienceAlerts])

  const filteredArticles = useMemo(() => {
    return knowledgeArticles.filter(a => {
      return (
        a.title.toLowerCase().includes(kbSearch.toLowerCase()) ||
        a.summary.toLowerCase().includes(kbSearch.toLowerCase()) ||
        a.category.toLowerCase().includes(kbSearch.toLowerCase()) ||
        a.tags.some(t => t.toLowerCase().includes(kbSearch.toLowerCase()))
      )
    })
  }, [knowledgeArticles, kbSearch])

  const handleHelpfulFeedback = (artId: number, isHelpful: boolean) => {
    setKnowledgeArticles(knowledgeArticles.map(a => {
      if (a.id === artId) {
        return {
          ...a,
          helpfulCount: isHelpful ? a.helpfulCount + 1 : a.helpfulCount,
          unhelpfulCount: !isHelpful ? a.unhelpfulCount + 1 : a.unhelpfulCount
        }
      }
      return a
    }))
    notify(isHelpful ? 'Feedback positivo computado!' : 'Feedback registrado para revisão editorial.')
  }

  const handleExperienceRecovery = (alertId: number) => {
    setExperienceAlerts(experienceAlerts.map(a => a.id === alertId ? { ...a, status: 'RECOVERED' as const } : a))
    notify(`Alerta #${alertId} recuperado com sucesso via contato prioritário!`)
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
            <span>DISK SERVICE • SAC + SLA + ITIL + BI COMMAND CENTER</span>
          </div>
          <h1>Central de Atendimento & Suporte</h1>
          <p>Business Intelligence, War Room de Major Incidents P1, CSAT/NPS, Base de Conhecimento e Omnichannel Desk.</p>
        </div>

        <div className="header-status-block">
          <div className="agent-status-indicator">
            <span className="dot pulse-green" />
            <span>{stats.onlineAgents} Agentes Online • SLA {stats.slaCompliance}%</span>
          </div>
          <button className="primary-service-btn" onClick={() => setActiveTab('new')}>
            <Plus size={18} />
            <span>Abrir Chamado</span>
          </button>
        </div>
      </header>

      {/* Sub-Navegação em Abas Modernas com Fases 22.1 a 22.12 */}
      <nav className="service-nav-tabs">
        <button className={`service-tab-btn ${activeTab === 'hub' ? 'active' : ''}`} onClick={() => setActiveTab('hub')}>
          <LifeBuoy size={17} />
          <span>Hub Geral</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'bi' ? 'active' : ''}`} onClick={() => setActiveTab('bi')}>
          <BarChart3 size={17} />
          <span>Dashboard & BI (Command Center)</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <LayoutDashboard size={17} />
          <span>Dashboard Operacional</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'csat' ? 'active' : ''}`} onClick={() => setActiveTab('csat')}>
          <Smile size={17} />
          <span>CSAT + NPS</span>
          {stats.openAlerts > 0 && <span className="tab-pill danger">{stats.openAlerts} Recovery</span>}
        </button>
        <button className={`service-tab-btn ${activeTab === 'knowledge' ? 'active' : ''}`} onClick={() => setActiveTab('knowledge')}>
          <BookOpen size={17} />
          <span>Base de Conhecimento</span>
          <span className="tab-pill">{knowledgeArticles.length}</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'major' ? 'active' : ''}`} onClick={() => setActiveTab('major')}>
          <Siren size={17} />
          <span>Major Incidents (P1)</span>
          {stats.activeMajorIncidents > 0 && <span className="tab-pill danger">{stats.activeMajorIncidents} War Room</span>}
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
                <span style={{ background: '#38bdf8', color: '#0f172a', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}>
                  COMMAND CENTER FASE 22.12
                </span>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Produtora: {producerName}</span>
              </div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 800 }}>
                Disk Service Enterprise Command Center
              </h2>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '14px', maxWidth: '650px' }}>
                Painel executivo unificado com Business Intelligence histórico, War Room P1, Gestão de Problemas e Satisfação CSAT/NPS.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="primary-service-btn" onClick={() => setActiveTab('bi')} style={{ background: '#2563eb' }}>
                <BarChart3 size={16} />
                <span>Abrir Command Center BI</span>
              </button>
              <button className="primary-service-btn" onClick={() => setActiveTab('csat')} style={{ background: '#059669' }}>
                <Smile size={16} />
                <span>CSAT & NPS ({stats.csatPercent}%)</span>
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div className="service-card-panel" style={{ cursor: 'pointer', borderLeft: '4px solid #2563eb' }} onClick={() => setActiveTab('bi')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center' }}>
                  <BarChart3 size={20} />
                </div>
                <span className="badge-count" style={{ background: '#ecfdf5', color: '#047857' }}>SLA {stats.slaCompliance}%</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>Dashboard & BI Executivo (Fase 22.12)</h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                Tendências históricas diárias, scorecards executivos, canais, filas, categorias e eventos.
              </p>
              <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Acessar Scorecard BI <ArrowRight size={14} />
              </span>
            </div>

            <div className="service-card-panel" style={{ cursor: 'pointer', borderLeft: '4px solid #059669' }} onClick={() => setActiveTab('csat')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center' }}>
                  <Smile size={20} />
                </div>
                <span className="badge-count" style={{ background: '#ecfdf5', color: '#047857' }}>NPS +{stats.npsScore}</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>CSAT + NPS & Recovery (Fase 22.11)</h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                Pesquisas transacionais automáticas, recuperação de detratores e voz do cliente.
              </p>
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Ver Experiência <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 1. ABA: DASHBOARD & BI (COMMAND CENTER EXECUTIVO - FASE 22.12) */}
      {activeTab === 'bi' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <BarChart3 size={22} style={{ color: '#38bdf8' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Command Center Executivo & Business Intelligence</h3>
              </div>
              <p style={{ margin: 0, color: '#93c5fd' }}>
                Consolidação executiva de Backlog, SLA, FRT, MTTR, CSAT, NPS, ITIL e tendências de volume diário.
              </p>
            </div>
            <button className="primary-service-btn" onClick={() => notify('Snapshots diários de BI recalculados com sucesso!')}>
              <RefreshCw size={16} />
              <span>Atualizar Métricas BI</span>
            </button>
          </div>

          {/* 6 Scorecards Executivos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px',
            margin: '20px 0'
          }}>
            <div className="service-kpi-card blue">
              <div className="kpi-icon-wrap"><TicketCheck size={20} /></div>
              <div className="kpi-info">
                <span>Backlog Operacional</span>
                <strong>{stats.open}</strong>
                <small>{stats.activeMajorIncidents} P1 ativos</small>
              </div>
            </div>

            <div className="service-kpi-card green">
              <div className="kpi-icon-wrap"><Gauge size={20} /></div>
              <div className="kpi-info">
                <span>SLA Compliance</span>
                <strong>{stats.slaCompliance}%</strong>
                <small>Meta operacional ≥ 95%</small>
              </div>
            </div>

            <div className="service-kpi-card purple">
              <div className="kpi-icon-wrap"><Clock3 size={20} /></div>
              <div className="kpi-info">
                <span>1ª Resposta (FRT)</span>
                <strong>{stats.frtMinutes} min</strong>
                <small>Meta: ≤ 15 min</small>
              </div>
            </div>

            <div className="service-kpi-card orange">
              <div className="kpi-icon-wrap"><Activity size={20} /></div>
              <div className="kpi-info">
                <span>MTTR Médio</span>
                <strong>{stats.mttrMinutes} min</strong>
                <small>Tempo de resolução</small>
              </div>
            </div>

            <div className="service-kpi-card green">
              <div className="kpi-icon-wrap"><Heart size={20} /></div>
              <div className="kpi-info">
                <span>CSAT / NPS</span>
                <strong>{stats.csatPercent}%</strong>
                <small>NPS +{stats.npsScore}</small>
              </div>
            </div>

            <div className="service-kpi-card red">
              <div className="kpi-icon-wrap"><Siren size={20} /></div>
              <div className="kpi-info">
                <span>Major Incidents</span>
                <strong>{stats.activeMajorIncidents}</strong>
                <small>1 Problem ativo</small>
              </div>
            </div>
          </div>

          {/* Gráfico de Tendências e Distribuição por Canal */}
          <div className="service-two-col-grid" style={{ marginBottom: '20px' }}>
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Tendência Histórica de Volume (Últimos 14 Dias)</h3>
                  <p>Volume diário de tickets abertos e resolvidos.</p>
                </div>
                <TrendingUp size={18} style={{ color: '#2563eb' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                {[
                  { day: '18/08', val: 45 }, { day: '19/08', val: 52 }, { day: '20/08', val: 38 },
                  { day: '21/08', val: 64 }, { day: '22/08', val: 80 }, { day: '23/08', val: 95 },
                  { day: '24/08', val: 120 }, { day: '25/08', val: 110 }, { day: '26/08', val: 75 },
                  { day: '27/08', val: 58 }, { day: '28/08', val: 62 }, { day: '29/08', val: 88 },
                  { day: '30/08', val: 140 }, { day: '01/09', val: 92 }
                ].map((item, idx) => (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>{item.val}</span>
                    <div style={{
                      width: '100%',
                      background: idx === 13 ? '#2563eb' : '#93c5fd',
                      height: `${(item.val / 140) * 110}px`,
                      borderRadius: '4px 4px 0 0'
                    }} />
                    <span style={{ fontSize: '9px', color: '#94a3b8' }}>{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Distribuição por Canal de Atendimento</h3>
                  <p>Participação de cada canal no volume total.</p>
                </div>
                <PieChart size={18} style={{ color: '#059669' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'WhatsApp Oficial', val: 58, count: 534, color: '#25d366' },
                  { label: 'Chat Web ao Vivo', val: 24, count: 221, color: '#7c3aed' },
                  { label: 'E-mail SAC', val: 14, count: 128, color: '#2563eb' },
                  { label: 'Formulário & Outros', val: 4, count: 37, color: '#f59e0b' }
                ].map((c, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <strong>{c.label}</strong>
                      <span><b>{c.count} chamados</b> ({c.val}%)</span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: '7px' }}>
                      <div className="progress-bar-fill" style={{ width: `${c.val}%`, background: c.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance por Fila & Agente */}
          <div className="service-two-col-grid" style={{ marginBottom: '20px' }}>
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Filas Operacionais & SLA por Especialidade</h3>
                  <p>Acompanhamento de backlog e cumprimento de metas.</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Fila</th>
                    <th style={{ padding: '8px' }}>Backlog</th>
                    <th style={{ padding: '8px' }}>P1 Ativos</th>
                    <th style={{ padding: '8px' }}>SLA Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {queues.map(q => (
                    <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px' }}><strong>{q.name}</strong></td>
                      <td style={{ padding: '8px' }}>{q.openTickets} tickets</td>
                      <td style={{ padding: '8px', color: q.code === 'QUEUE_ACCESS' ? '#dc2626' : '#64748b' }}>
                        {q.code === 'QUEUE_ACCESS' ? '1 P1' : '0'}
                      </td>
                      <td style={{ padding: '8px' }}><span className="status-pill green">97.8%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Performance & Ocupação dos Agentes</h3>
                  <p>Produtividade individual e taxa de resolução.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {agents.map(ag => (
                  <div key={ag.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{ag.name}</strong>
                      <small style={{ display: 'block', color: '#64748b' }}>{ag.level} • {ag.team}</small>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge-count">{ag.activeTickets}/{ag.capacity} tickets</span>
                      <small style={{ display: 'block', color: '#059669', fontWeight: 600 }}>SLA 98.4%</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ABA: DASHBOARD OPERACIONAL */}
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
              <div className="kpi-icon-wrap"><Smile size={22} /></div>
              <div className="kpi-info">
                <span>Satisfação CSAT</span>
                <strong>{stats.csatPercent}%</strong>
                <small>NPS Score: {stats.npsScore} (Excelente)</small>
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
              <div className="kpi-icon-wrap"><BookOpen size={22} /></div>
              <div className="kpi-info">
                <span>Base de Conhecimento</span>
                <strong>{knowledgeArticles.length} artigos</strong>
                <small>Procedimentos homologados</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ABA: CSAT + NPS (FASE 22.11) */}
      {activeTab === 'csat' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Smile size={22} style={{ color: '#6ee7b7' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Experiência do Cliente: CSAT + NPS + Experience Recovery</h3>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', margin: '20px 0' }}>
            <div className="service-kpi-card green">
              <div className="kpi-icon-wrap"><Smile size={20} /></div>
              <div className="kpi-info">
                <span>CSAT Global</span>
                <strong>{stats.csatPercent}%</strong>
                <small>Média 4.8 / 5 estrelas</small>
              </div>
            </div>

            <div className="service-kpi-card purple">
              <div className="kpi-icon-wrap"><TrendingUp size={20} /></div>
              <div className="kpi-info">
                <span>NPS Score</span>
                <strong>+{stats.npsScore}</strong>
                <small>Zona de Excelência</small>
              </div>
            </div>

            <div className="service-kpi-card orange">
              <div className="kpi-icon-wrap"><Heart size={20} /></div>
              <div className="kpi-info">
                <span>Experience Recovery</span>
                <strong>{stats.openAlerts} alertas</strong>
                <small>Atendimento proativo</small>
              </div>
            </div>
          </div>

          <div className="service-card-panel">
            <h3>Alertas de Insatisfação & Experience Recovery</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              {experienceAlerts.map(alert => (
                <div key={alert.id} style={{ border: '1px solid #fee2e2', background: '#fff5f5', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong>{alert.customerName} ({alert.surveyType} Nota: {alert.score})</strong>
                    <span className={alert.status === 'RECOVERED' ? 'status-pill green' : 'badge-count danger'}>
                      {alert.status === 'RECOVERED' ? 'Recuperado' : 'Aberto'}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#7f1d1d' }}>"{alert.comment}"</p>
                  {alert.status !== 'RECOVERED' && (
                    <button type="button" className="fast-action-chip" onClick={() => handleExperienceRecovery(alert.id)}>
                      <Heart size={12} /> Marcar como Recuperado
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. ABA: BASE DE CONHECIMENTO (FASE 22.10) */}
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

          <div className="ticket-split-layout" style={{ marginTop: '20px' }}>
            <div className="ticket-list-panel">
              <div className="tickets-scroll-container">
                {filteredArticles.map(art => (
                  <div key={art.id} className={`ticket-summary-card ${selectedArticle?.id === art.id ? 'active' : ''}`} onClick={() => setSelectedArticle(art)}>
                    <strong>{art.title}</strong>
                    <p>{art.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="ticket-detail-panel">
              {selectedArticle && (
                <div className="ticket-workspace">
                  <h2>{selectedArticle.title}</h2>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: '#334155', lineHeight: 1.6, marginTop: '12px' }}>
                    {selectedArticle.content}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button type="button" className="fast-action-chip" onClick={() => handleHelpfulFeedback(selectedArticle.id, true)}>
                      <ThumbsUp size={13} /> Útil ({selectedArticle.helpfulCount})
                    </button>
                    <button type="button" className="fast-action-chip" onClick={() => handleHelpfulFeedback(selectedArticle.id, false)}>
                      <ThumbsDown size={13} /> Não útil ({selectedArticle.unhelpfulCount})
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. ABA: MAJOR INCIDENTS P1 (FASE 22.9) */}
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

      {/* 6. ABA: PROBLEM MANAGEMENT (FASE 22.8) */}
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

      {/* 7. ABA: INCIDENTES ITIL (FASE 22.7) */}
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

      {/* 8. ABA: INBOX OMNICHANNEL (FASE 22.4) */}
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

      {/* 9. ABA: CHAMADOS & FILA (FASE 22.1 + 22.2) */}
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

      {/* 10. ABA: ABRIR NOVO CHAMADO */}
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

      {/* 11. ABA: CLIENTE 360° (FASE 22.5) */}
      {activeTab === 'client360' && (
        <div className="service-content-body">
          <div className="service-card-panel">
            <h3>Cliente 360° • João Silva Oliveira (VIP Diamond)</h3>
            <p>Histórico completo de compras ERP e validações de catraca.</p>
          </div>
        </div>
      )}

      {/* 12. ABA: WORKFLOWS (FASE 22.6) */}
      {activeTab === 'workflows' && (
        <div className="service-content-body">
          <div className="service-card-panel">
            <h3>Automações & Regras de Atendimento</h3>
            <p>Gatilhos de SLA, proximidade de evento e ações automáticas.</p>
          </div>
        </div>
      )}

      {/* 13. ABA: MOTOR DE SLA (FASE 22.3) */}
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
