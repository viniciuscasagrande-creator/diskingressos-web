import { useState, useEffect, useMemo, type FormEvent } from 'react'
import {
  LayoutDashboard, Ticket, AlertTriangle, BookOpen, Users, Clock3, Plus, Search,
  RefreshCw, CheckCircle2, MessageCircle, Mail, Phone, Globe, ShieldAlert,
  Send, UserCheck, Sparkles, Filter, ChevronRight, ArrowRight, ExternalLink,
  Flame, HelpCircle, FileText, CheckCheck, PlayCircle, XCircle, AlertCircle, Headphones, Link2, Sparkle,
  Layers3, ArrowRightLeft, UserPlus, CheckSquare, Gauge, Calendar, BellRing, SlidersHorizontal, Zap,
  BarChart3, Activity, ShieldCheck, LifeBuoy
} from 'lucide-react'
import type { EventItem } from '../data/events'

export type ServiceTab = 'hub' | 'dashboard' | 'tickets' | 'new' | 'sla' | 'incidents' | 'knowledge' | 'teams' | 'client360'

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

interface IncidentItem {
  id: number
  code: string
  title: string
  description: string
  severity: 'P1' | 'P2' | 'P3'
  status: 'INVESTIGANDO' | 'IDENTIFICADO' | 'MONITORANDO' | 'RESOLVIDO'
  eventName: string
  affectedTicketsCount: number
  startedAt: string
  resolvedAt?: string
  leadAgent: string
  workaround?: string
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

const mockIncidents: IncidentItem[] = [
  {
    id: 1,
    code: 'INC-2026-004',
    title: 'Instabilidade na sincronização offline da Catraca 04 Portão B',
    description: 'Catraca 04 perdeu comunicação com o servidor de borda local, gerando falso-negativo na validação de ingressos emitidos nas últimas 2 horas.',
    severity: 'P1',
    status: 'INVESTIGANDO',
    eventName: 'Rock Arena Festival 2026',
    affectedTicketsCount: 8,
    startedAt: 'Há 18 minutos',
    leadAgent: 'Engenharia de Acesso (N3)',
    workaround: 'Redirecionar fluxo para Catracas 01 a 03 enquanto a base local é sincronizada via hotspot 5G.'
  },
  {
    id: 2,
    code: 'INC-2026-003',
    title: 'Atraso pontual no envio de e-mails transacionais com ingresso em anexo',
    description: 'Fila do provedor SendGrid atingiu pico temporário de processamento.',
    severity: 'P2',
    status: 'RESOLVIDO',
    eventName: 'Festival Sertanejo Curitiba 2026',
    affectedTicketsCount: 14,
    startedAt: 'Ontem às 10:00',
    resolvedAt: 'Ontem às 10:45',
    leadAgent: 'Infraestrutura Cloud',
    workaround: 'Ativação automática da rota secundária de WhatsApp transacional.'
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
  const [tickets, setTickets] = useState<TicketItem[]>(mockTickets)
  const [agents, setAgents] = useState<AgentItem[]>(initialAgents)
  const [queues, setQueues] = useState<QueueItem[]>(initialQueues)
  const [slaPolicies, setSlaPolicies] = useState<SLAPolicy[]>(initialSLAPolicies)
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(mockTickets[0])
  const [ticketSearch, setTicketSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('TODOS')
  const [statusFilter, setStatusFilter] = useState<string>('TODOS')
  const [newReply, setNewReply] = useState('')

  // Sincronização inteligente com a prop mode do Sidebar
  useEffect(() => {
    if (!mode) return
    if (mode === 'hub') setActiveTab('hub')
    else if (mode === 'dashboard') setActiveTab('dashboard')
    else if (mode === 'tickets') setActiveTab('tickets')
    else if (mode === 'new') setActiveTab('new')
    else if (mode === 'sla') setActiveTab('sla')
    else if (mode === 'incidents') setActiveTab('incidents')
    else if (mode === 'knowledge') setActiveTab('knowledge')
    else if (mode === 'integrations' || mode === 'teams') setActiveTab('teams')
    else if (mode === 'reports' || mode === 'client360') setActiveTab('client360')
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

  // Knowledge search
  const [kbSearch, setKbSearch] = useState('')

  // Estatísticas e KPIs
  const stats = useMemo(() => {
    const total = tickets.length
    const open = tickets.filter(t => t.status !== 'RESOLVIDO' && t.status !== 'FECHADO').length
    const p1 = tickets.filter(t => t.priority === 'P1' && t.status !== 'RESOLVIDO').length
    const resolved = tickets.filter(t => t.status === 'RESOLVIDO').length
    const compliance = 96.4
    const onlineAgents = agents.filter(a => a.status === 'ONLINE' || a.status === 'BUSY').length
    return { total, open, p1, resolved, compliance, onlineAgents }
  }, [tickets, agents])

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

  // Recálculo SLA Event-Aware
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
            <span>DISK SERVICE • SAC + SLA + ITIL ENTERPRISE HUB</span>
          </div>
          <h1>Central de Atendimento & Suporte</h1>
          <p>Motor de SLA Event-Aware, gestão de tickets omnichannel, escalonamento automático e incidentes ITIL.</p>
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

      {/* Sub-Navegação em Abas Modernas */}
      <nav className="service-nav-tabs">
        <button className={`service-tab-btn ${activeTab === 'hub' ? 'active' : ''}`} onClick={() => setActiveTab('hub')}>
          <LifeBuoy size={17} />
          <span>Hub de Atendimento</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <LayoutDashboard size={17} />
          <span>Dashboard Operacional</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>
          <Ticket size={17} />
          <span>Chamados & Fila</span>
          <span className="tab-pill">{stats.open}</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>
          <Plus size={17} />
          <span>Novo Atendimento</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'sla' ? 'active' : ''}`} onClick={() => setActiveTab('sla')}>
          <Gauge size={17} />
          <span>Motor de SLA (Event-Aware)</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'incidents' ? 'active' : ''}`} onClick={() => setActiveTab('incidents')}>
          <Flame size={17} />
          <span>Incidentes ITIL (War Room)</span>
          {mockIncidents.filter(i => i.status === 'INVESTIGANDO').length > 0 && <span className="tab-pill danger">1 P1</span>}
        </button>
        <button className={`service-tab-btn ${activeTab === 'knowledge' ? 'active' : ''}`} onClick={() => setActiveTab('knowledge')}>
          <BookOpen size={17} />
          <span>Base de Conhecimento</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'teams' ? 'active' : ''}`} onClick={() => setActiveTab('teams')}>
          <Users size={17} />
          <span>Filas & Agentes</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'client360' ? 'active' : ''}`} onClick={() => setActiveTab('client360')}>
          <Search size={17} />
          <span>Comprador 360°</span>
        </button>
      </nav>

      {/* CONTEÚDO DAS ABAS */}

      {/* 0. ABA: HUB DE ATENDIMENTO (VISÃO GERAL DO DISK SERVICE) */}
      {activeTab === 'hub' && (
        <div className="service-content-body">
          {/* Hero Banner do Hub */}
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
                  CENTRAL UNIFICADA
                </span>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Produtora: {producerName}</span>
              </div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: 800 }}>
                Disk Service Omnichannel Desk
              </h2>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '14px', maxWidth: '650px' }}>
                Atendimento integrado ao ERP com motor SLA inteligente, distribuição automática por menor carga e suporte 360° aos participantes.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="primary-service-btn"
                onClick={() => setActiveTab('tickets')}
                style={{ background: '#3b82f6' }}
              >
                <Ticket size={16} />
                <span>Ver Todos os Chamados ({stats.open})</span>
              </button>
              <button
                className="primary-service-btn"
                onClick={() => setActiveTab('new')}
                style={{ background: '#10b981' }}
              >
                <Plus size={16} />
                <span>Novo Atendimento</span>
              </button>
            </div>
          </div>

          {/* Cards Rápidos dos 6 Pilares do Atendimento */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {/* Pilar 1: Chamados */}
            <div
              className="service-card-panel"
              style={{ cursor: 'pointer', transition: 'all 0.2s', borderLeft: '4px solid #3b82f6' }}
              onClick={() => setActiveTab('tickets')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center' }}>
                  <Ticket size={20} />
                </div>
                <span className="badge-count">{stats.open} abertos</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>Fila de Chamados</h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                Workspace split com timeline, canais WhatsApp/E-mail e ações rápidas com 1 clique.
              </p>
              <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Acessar Workspace <ArrowRight size={14} />
              </span>
            </div>

            {/* Pilar 2: Motor de SLA */}
            <div
              className="service-card-panel"
              style={{ cursor: 'pointer', transition: 'all 0.2s', borderLeft: '4px solid #10b981' }}
              onClick={() => setActiveTab('sla')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center' }}>
                  <Gauge size={20} />
                </div>
                <span className="badge-count" style={{ background: '#ecfdf5', color: '#047857' }}>96.4% Compliance</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>Motor de SLA & Event-Aware</h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                Cálculo automático de prioridades P1-P4 ajustado pela proximidade do show.
              </p>
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Configurar SLA <ArrowRight size={14} />
              </span>
            </div>

            {/* Pilar 3: War Room Incidentes */}
            <div
              className="service-card-panel"
              style={{ cursor: 'pointer', transition: 'all 0.2s', borderLeft: '4px solid #ef4444' }}
              onClick={() => setActiveTab('incidents')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', display: 'grid', placeItems: 'center' }}>
                  <Flame size={20} />
                </div>
                <span className="badge-count danger">1 Ativo</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>Incidentes ITIL (War Room)</h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                Declaração de falhas massivas em catracas, agrupamento de tickets e broadcast.
              </p>
              <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Abrir War Room <ArrowRight size={14} />
              </span>
            </div>

            {/* Pilar 4: Base de Conhecimento */}
            <div
              className="service-card-panel"
              style={{ cursor: 'pointer', transition: 'all 0.2s', borderLeft: '4px solid #8b5cf6' }}
              onClick={() => setActiveTab('knowledge')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', display: 'grid', placeItems: 'center' }}>
                  <BookOpen size={20} />
                </div>
                <span className="badge-count">{mockArticles.length} Artigos</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>Base de Conhecimento</h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                Procedimentos de reenvio, estornos, biometria e FAQ com índice de utilidade.
              </p>
              <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Consultar Artigos <ArrowRight size={14} />
              </span>
            </div>

            {/* Pilar 5: Agentes & Equipes */}
            <div
              className="service-card-panel"
              style={{ cursor: 'pointer', transition: 'all 0.2s', borderLeft: '4px solid #f59e0b' }}
              onClick={() => setActiveTab('teams')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fffbeb', color: '#d97706', display: 'grid', placeItems: 'center' }}>
                  <Users size={20} />
                </div>
                <span className="badge-count">{agents.length} Agentes</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>Filas, Agentes & Presença</h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                Presença operacional em tempo real (ONLINE/BUSY/AWAY) e distribuição Least-Load.
              </p>
              <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Gerenciar Equipe <ArrowRight size={14} />
              </span>
            </div>

            {/* Pilar 6: Comprador 360 */}
            <div
              className="service-card-panel"
              style={{ cursor: 'pointer', transition: 'all 0.2s', borderLeft: '4px solid #06b6d4' }}
              onClick={() => setActiveTab('client360')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfeff', color: '#0891b2', display: 'grid', placeItems: 'center' }}>
                  <Search size={20} />
                </div>
                <span className="badge-count">Visão 360°</span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>Comprador 360°</h3>
              <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b' }}>
                Histórico completo de pedidos, ingressos emitidos, biometria facial e CSAT.
              </p>
              <span style={{ fontSize: '12px', color: '#0891b2', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                Buscar Comprador <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 1. ABA: DASHBOARD OPERACIONAL */}
      {activeTab === 'dashboard' && (
        <div className="service-content-body">
          {/* Grid de KPIs */}
          <div className="service-kpi-grid">
            <div className="service-kpi-card blue">
              <div className="kpi-icon-wrap"><Ticket size={22} /></div>
              <div className="kpi-info">
                <span>Chamados em Aberto</span>
                <strong>{stats.open}</strong>
                <small>Backlog com SLA ativo</small>
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
              <div className="kpi-icon-wrap"><Flame size={22} /></div>
              <div className="kpi-info">
                <span>Incidentes Críticos P1</span>
                <strong>{stats.p1}</strong>
                <small>Resposta em até 15 min</small>
              </div>
            </div>

            <div className="service-kpi-card purple">
              <div className="kpi-icon-wrap"><Sparkles size={22} /></div>
              <div className="kpi-info">
                <span>Satisfação CSAT</span>
                <strong>4,8 ★</strong>
                <small>Avaliações positivas: 96%</small>
              </div>
            </div>
          </div>

          {/* Grid de 2 Colunas: Fila em Tempo Real vs Saúde SLA */}
          <div className="service-two-col-grid">
            {/* Coluna 1: Filas e Estratégia de Roteamento */}
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Filas de Atendimento & Estratégia</h3>
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

            {/* Coluna 2: Saúde do SLA e Copilot */}
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Saúde do SLA Operacional</h3>
                  <p>Cumprimento de 1ª resposta e resolução no prazo.</p>
                </div>
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
                <p>82% das solicitações de reenvio de ingresso foram solucionadas automaticamente pelo bot de autoatendimento do WhatsApp sem intervenção humana.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ABA: CHAMADOS & FILA COM TIMERS DE SLA EM TEMPO REAL */}
      {activeTab === 'tickets' && (
        <div className="service-content-body">
          {/* Filtros e Busca */}
          <div className="service-filters-bar">
            <div className="search-input-wrap">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar por protocolo, nome do cliente, pedido #DI ou assunto..."
                value={ticketSearch}
                onChange={e => setTicketSearch(e.target.value)}
              />
            </div>

            <div className="filter-selects">
              <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                <option value="TODOS">Todas as Prioridades</option>
                <option value="P1">P1 - Crítico (15 min)</option>
                <option value="P2">P2 - Alto (1h)</option>
                <option value="P3">P3 - Médio (4h)</option>
                <option value="P4">P4 - Baixo (12h)</option>
              </select>

              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="TODOS">Todos os Status</option>
                <option value="NOVO">Novo</option>
                <option value="EM_ATENDIMENTO">Em Atendimento</option>
                <option value="PENDENTE_CLIENTE">Pendente Cliente</option>
                <option value="RESOLVIDO">Resolvido</option>
              </select>
            </div>
          </div>

          {/* Grid de Split: Lista de Tickets na Esquerda, Detalhes na Direita */}
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

                    {/* Timer SLA Bar */}
                    <div style={{ margin: '8px 0 4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                        <span>SLA Consumido: {t.slaProgressPercent}%</span>
                        <span style={{ fontWeight: 600, color: t.slaProgressPercent > 80 ? '#dc2626' : '#2563eb' }}>{t.slaTimeRemaining}</span>
                      </div>
                      <div className="progress-bar-bg" style={{ height: '5px', marginTop: '3px' }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${t.slaProgressPercent}%`,
                            background: t.slaProgressPercent > 85 ? '#dc2626' : t.slaProgressPercent > 70 ? '#f59e0b' : '#10b981'
                          }}
                        />
                      </div>
                    </div>

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

            {/* Painel do Chamado Selecionado */}
            <div className="ticket-detail-panel">
              {selectedTicket ? (
                <div className="ticket-workspace">
                  {/* Cabeçalho do Ticket */}
                  <div className="workspace-header">
                    <div>
                      <div className="protocol-meta">
                        <span className="protocol-num">#{selectedTicket.protocol}</span>
                        <span className={`priority-tag ${selectedTicket.priority}`}>{selectedTicket.priority}</span>
                        <span className="channel-badge">{selectedTicket.channel}</span>
                        <span className="channel-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>{selectedTicket.queueName}</span>
                        <span className={`status-tag ${selectedTicket.status}`}>{selectedTicket.status.replace('_', ' ')}</span>
                      </div>
                      <h2>{selectedTicket.subject}</h2>
                    </div>

                    <div className="workspace-actions">
                      <button className="fast-action-chip" onClick={() => handleAutoAssign(selectedTicket.id)}>
                        <UserPlus size={14} /> Atribuir Auto (Least-Load)
                      </button>
                      {selectedTicket.status !== 'RESOLVIDO' && (
                        <button className="resolve-btn" onClick={() => handleResolveTicket(selectedTicket.id)}>
                          <CheckCircle2 size={16} />
                          <span>Marcar Resolvido</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contexto do Comprador e Evento */}
                  <div className="workspace-context-card">
                    <div className="ctx-item">
                      <span>Comprador</span>
                      <strong>{selectedTicket.customerName}</strong>
                      <small>{selectedTicket.customerEmail} • {selectedTicket.customerPhone}</small>
                    </div>

                    <div className="ctx-item">
                      <span>Evento & Pedido</span>
                      <strong>{selectedTicket.eventName}</strong>
                      <small>Pedido: {selectedTicket.orderCode} • Total: {selectedTicket.amount}</small>
                    </div>

                    <div className="ctx-item">
                      <span>Timer SLA Restante</span>
                      <strong style={{ color: '#2563eb' }}>{selectedTicket.slaTimeRemaining}</strong>
                      <small>1ª Resposta: {selectedTicket.slaResponseMinutes}m • Resolução: {selectedTicket.slaResolutionMinutes}m</small>
                    </div>
                  </div>

                  {/* Ações Rápidas de Operação & Transferência */}
                  <div className="fast-actions-bar">
                    <button className="fast-action-chip" onClick={() => notify('Ingresso com QR Code reenviado com sucesso por E-mail e WhatsApp!')}>
                      <Mail size={14} /> Reenviar Ingresso & QR Code
                    </button>
                    <button className="fast-action-chip" onClick={() => notify('QR Code reemitido e invalidado o anterior!')}>
                      <RefreshCw size={14} /> Reemitir QR Code
                    </button>
                    <button className="fast-action-chip" onClick={() => handleTransferQueue(selectedTicket.id, 'Reembolsos & Estornos')}>
                      <ArrowRightLeft size={14} /> Transferir Fila: Reembolsos
                    </button>
                    <button className="fast-action-chip" onClick={() => notify('Iniciado fluxo de conferência de estorno Pix!')}>
                      <AlertCircle size={14} /> Solicitar Estorno Pix
                    </button>
                  </div>

                  {/* Histórico de Mensagens / Timeline */}
                  <div className="messages-stream">
                    {selectedTicket.messages.map(m => (
                      <div key={m.id} className={`message-bubble-wrap ${m.authorType.toLowerCase()}`}>
                        <div className="bubble-header">
                          <strong>{m.author}</strong>
                          <span>{m.channel} • {m.createdAt}</span>
                        </div>
                        <div className="bubble-body">
                          {m.body}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Caixa de Resposta */}
                  {selectedTicket.status !== 'RESOLVIDO' ? (
                    <div className="reply-composer-box">
                      <textarea
                        rows={3}
                        placeholder={`Escrever resposta ao cliente (será enviada via ${selectedTicket.channel})...`}
                        value={newReply}
                        onChange={e => setNewReply(e.target.value)}
                      />
                      <div className="composer-footer">
                        <span className="copilot-suggestion">
                          <Sparkles size={14} /> Sugestão Copilot: "Seu QR Code foi atualizado e enviado para seu WhatsApp."
                        </span>
                        <button className="send-reply-btn" onClick={handleSendMessage}>
                          <Send size={15} />
                          <span>Enviar Resposta</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ticket-resolved-banner">
                      <CheckCheck size={20} />
                      <span>Este chamado foi finalizado e resolvido. Todas as ações foram gravadas no histórico.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-ticket-selected">
                  <Headphones size={48} />
                  <h3>Selecione um chamado na lista ao lado</h3>
                  <p>Veja a conversa completa, acesse os dados do pedido e responda ao comprador com SLA controlado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. ABA: MOTOR DE SLA & EVENT-AWARE (FASE 22.3) */}
      {activeTab === 'sla' && (
        <div className="service-content-body">
          {/* Top Hero & Recálculo */}
          <div className="incidents-hero-bar" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Gauge size={20} style={{ color: '#38bdf8' }} />
                <h3 style={{ margin: 0, color: '#fff' }}>Motor de SLA Inteligente & Event-Aware</h3>
              </div>
              <p style={{ margin: 0, color: '#94a3b8' }}>
                Cálculo dinâmico de 1ª resposta, tempo de resolução e elevação de prioridade conforme a proximidade do show.
              </p>
            </div>
            <button className="primary-service-btn" onClick={handleRecalculateAllSLA}>
              <RefreshCw size={16} />
              <span>Recalcular SLA dos Tickets</span>
            </button>
          </div>

          {/* Simulador SLA Event-Aware */}
          <div className="service-card-panel" style={{ marginTop: '20px' }}>
            <div className="panel-header-row">
              <div>
                <h3>🎟️ Simulador de Regra Especial: SLA Event-Aware</h3>
                <p>Veja como o sistema ajusta a prioridade automaticamente conforme o horário do evento se aproxima.</p>
              </div>
              <span className="live-pill" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                MOTOR ATIVO
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', margin: '16px 0' }}>
              <button
                type="button"
                onClick={() => setEventAwareProximity('GT_7D')}
                className={`sla-matrix-card ${eventAwareProximity === 'GT_7D' ? 'p4' : ''}`}
                style={{ cursor: 'pointer', textAlign: 'left', border: eventAwareProximity === 'GT_7D' ? '2px solid #3b82f6' : '1px solid #e2e8f0' }}
              >
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>CENÁRIO 1</span>
                <strong style={{ display: 'block', margin: '4px 0', fontSize: '14px' }}>Evento &gt; 7 dias</strong>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>Prioridade Normal (P4)</span>
              </button>

              <button
                type="button"
                onClick={() => setEventAwareProximity('LE_7D')}
                className={`sla-matrix-card ${eventAwareProximity === 'LE_7D' ? 'p3' : ''}`}
                style={{ cursor: 'pointer', textAlign: 'left', border: eventAwareProximity === 'LE_7D' ? '2px solid #3b82f6' : '1px solid #e2e8f0' }}
              >
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>CENÁRIO 2</span>
                <strong style={{ display: 'block', margin: '4px 0', fontSize: '14px' }}>Evento &le; 7 dias</strong>
                <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 600 }}>Prioridade Média (P3)</span>
              </button>

              <button
                type="button"
                onClick={() => setEventAwareProximity('LE_24H')}
                className={`sla-matrix-card ${eventAwareProximity === 'LE_24H' ? 'p2' : ''}`}
                style={{ cursor: 'pointer', textAlign: 'left', border: eventAwareProximity === 'LE_24H' ? '2px solid #3b82f6' : '1px solid #e2e8f0' }}
              >
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>CENÁRIO 3</span>
                <strong style={{ display: 'block', margin: '4px 0', fontSize: '14px' }}>Evento &le; 24 horas</strong>
                <span style={{ fontSize: '12px', color: '#ea580c', fontWeight: 600 }}>Prioridade Alta (P2)</span>
              </button>

              <button
                type="button"
                onClick={() => setEventAwareProximity('LE_2H')}
                className={`sla-matrix-card ${eventAwareProximity === 'LE_2H' ? 'p1' : ''}`}
                style={{ cursor: 'pointer', textAlign: 'left', border: eventAwareProximity === 'LE_2H' ? '2px solid #3b82f6' : '1px solid #e2e8f0' }}
              >
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>CENÁRIO 4</span>
                <strong style={{ display: 'block', margin: '4px 0', fontSize: '14px' }}>Evento &le; 2 horas</strong>
                <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>Prioridade Crítica (P1)</span>
              </button>

              <button
                type="button"
                onClick={() => setEventAwareProximity('LIVE')}
                className={`sla-matrix-card ${eventAwareProximity === 'LIVE' ? 'p1' : ''}`}
                style={{ cursor: 'pointer', textAlign: 'left', border: eventAwareProximity === 'LIVE' ? '2px solid #dc2626' : '1px solid #e2e8f0', background: eventAwareProximity === 'LIVE' ? '#fef2f2' : '#fff' }}
              >
                <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700 }}>AO VIVO 🔥</span>
                <strong style={{ display: 'block', margin: '4px 0', fontSize: '14px' }}>Evento Acontecendo</strong>
                <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 700 }}>P1 Portão / Catracas</span>
              </button>
            </div>

            {/* Resultado da Simulação */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Resultado Calculado pelo Motor:</span>
                <h4 style={{ margin: '4px 0', fontSize: '16px', color: '#0f172a' }}>{simulatedPriority.label}</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>{simulatedPriority.action}</p>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>1ª RESPOSTA</span>
                  <strong style={{ fontSize: '16px', color: '#2563eb' }}>{simulatedPriority.frt}</strong>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>RESOLUÇÃO TOTAL</span>
                  <strong style={{ fontSize: '16px', color: '#059669' }}>{simulatedPriority.res}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Matriz de Políticas P1-P4 e Escalonamento */}
          <div className="service-two-col-grid" style={{ marginTop: '20px' }}>
            {/* Políticas de SLA */}
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Matriz de Políticas Contratuais (P1 a P4)</h3>
                  <p>Metas contratuais de tempo de atendimento.</p>
                </div>
              </div>

              <div className="sla-matrix-list">
                {slaPolicies.map(pol => (
                  <div key={pol.id} className={`sla-matrix-card ${pol.priority.toLowerCase()}`}>
                    <div className="matrix-top">
                      <strong>{pol.name}</strong>
                      <span className={`priority-tag ${pol.priority}`}>{pol.priority}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 10px' }}>{pol.example}</p>
                    <div className="matrix-times">
                      <div><span>1ª Resposta:</span> <strong>{pol.firstResponseMinutes < 60 ? `${pol.firstResponseMinutes} min` : `${pol.firstResponseMinutes / 60} h`}</strong></div>
                      <div><span>Resolução:</span> <strong>{pol.resolutionMinutes < 60 ? `${pol.resolutionMinutes} min` : `${pol.resolutionMinutes / 60} h`}</strong></div>
                      <div><span>Calendário:</span> <strong>{pol.calendar === '24x7_EVENT' ? '24x7 Ininterrupto' : 'Comercial 08-18h'}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Escalonamento e Alertas Automáticos */}
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Gatilhos de Escalonamento Automático</h3>
                  <p>Regras acionadas conforme o tempo do SLA é consumido.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ border: '1px solid #fef3c7', background: '#fffbeb', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BellRing size={16} style={{ color: '#d97706' }} />
                    <strong style={{ color: '#b45309', fontSize: '13px' }}>70% do SLA Consumido &bull; Alerta Amarelo</strong>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#78350f' }}>
                    Disparo de notificação sonora no painel do atendente e aviso na fila do Supervisor N2.
                  </p>
                </div>

                <div style={{ border: '1px solid #fed7aa', background: '#fff7ed', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} style={{ color: '#ea580c' }} />
                    <strong style={{ color: '#c2410c', fontSize: '13px' }}>85% do SLA Consumido &bull; Alerta Laranja (Risco Alto)</strong>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#7c2d12' }}>
                    Chamado recebe destaque piscante no topo da fila e SMS/Push para o Coordenador Operacional de Plantão.
                  </p>
                </div>

                <div style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} style={{ color: '#dc2626' }} />
                    <strong style={{ color: '#b91c1c', fontSize: '13px' }}>100% do SLA Consumido &bull; SLA Violado (Crítico)</strong>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#7f1d1d' }}>
                    Ticket é marcado com flag de Violação no BI, redistribuído para nível N3 com prioridade máxima e registrado em log imutável de auditoria.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ABA: ABRIR NOVO CHAMADO */}
      {activeTab === 'new' && (
        <div className="service-content-body">
          <form className="create-ticket-form-grid" onSubmit={handleCreateTicket}>
            {/* Coluna 1: Informações do Chamado */}
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
                <label>Descrição do Problema / Relato do Cliente</label>
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

            {/* Coluna 2: Dados do Cliente e Pedido */}
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
            </div>

            {/* Coluna 3: Diagnóstico Copilot & SLA */}
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>3. Inteligência & SLA Ativado</h3>
                  <p>Cálculo automático de metas operacionais.</p>
                </div>
              </div>

              <div className={`sla-preview-badge ${formPriority}`}>
                <Clock3 size={18} />
                <div>
                  <strong>Prioridade Selecionada: {formPriority}</strong>
                  <span>Meta de 1ª Resposta: {formPriority === 'P1' ? '15 min' : formPriority === 'P2' ? '1 hora' : formPriority === 'P3' ? '4 horas' : '12 horas'}</span>
                </div>
              </div>

              <div className="copilot-suggestion-card">
                <div className="copilot-badge">
                  <Sparkles size={15} />
                  <span>DIAGNÓSTICO DISK COPILOT</span>
                </div>
                <p>Identificamos que o pedido <strong>{formOrderCode}</strong> já consta com pagamento aprovado no gateway. Ao abrir o chamado, o sistema já tentará enviar um reenvio automático para <strong>{formCustomerEmail}</strong>.</p>
              </div>

              <div className="form-submit-block">
                <button type="submit" className="submit-ticket-btn">
                  <Plus size={18} />
                  <span>Protocolar Chamado no ERP</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 5. ABA: INCIDENTES ITIL (WAR ROOM) */}
      {activeTab === 'incidents' && (
        <div className="service-content-body">
          <div className="incidents-hero-bar">
            <div>
              <h3>Gestão de Incidentes ITIL (War Room)</h3>
              <p>Agrupamento de múltiplos tickets em uma ocorrência central para diagnóstico e resolução unificada.</p>
            </div>
            <button className="primary-service-btn danger" onClick={() => notify('Módulo de Abertura de Incidente P1 acionado.')}>
              <Flame size={16} />
              <span>Declarar Incidente P1</span>
            </button>
          </div>

          <div className="incidents-grid">
            {mockIncidents.map(inc => (
              <div key={inc.id} className={`incident-card-panel ${inc.severity}`}>
                <div className="incident-card-header">
                  <div className="inc-badge-title">
                    <span className={`inc-severity-tag ${inc.severity}`}>{inc.severity} - {inc.code}</span>
                    <span className={`inc-status-tag ${inc.status}`}>{inc.status}</span>
                  </div>
                  <span className="inc-time">{inc.startedAt}</span>
                </div>

                <h3 className="inc-title">{inc.title}</h3>
                <p className="inc-desc">{inc.description}</p>

                <div className="inc-meta-row">
                  <div>
                    <span>Evento Impactado</span>
                    <strong>{inc.eventName}</strong>
                  </div>
                  <div>
                    <span>Tickets Vinculados</span>
                    <strong className="red-text">{inc.affectedTicketsCount} chamados</strong>
                  </div>
                  <div>
                    <span>Líder do Incidente</span>
                    <strong>{inc.leadAgent}</strong>
                  </div>
                </div>

                {inc.workaround && (
                  <div className="inc-workaround-box">
                    <strong>Contorno Operacional (Workaround):</strong>
                    <p>{inc.workaround}</p>
                  </div>
                )}

                <div className="incident-actions-row">
                  <button className="inc-btn" onClick={() => notify(`Broadcast enviado para os ${inc.affectedTicketsCount} clientes vinculados ao incidente ${inc.code}!`)}>
                    <MessageCircle size={14} /> Disparar Atualização em Massa
                  </button>
                  {inc.status !== 'RESOLVIDO' && (
                    <button className="inc-btn success" onClick={() => notify(`Incidente ${inc.code} resolvido e fechamento em lote concluído!`)}>
                      <CheckCircle2 size={14} /> Resolver Incidente
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. ABA: BASE DE CONHECIMENTO */}
      {activeTab === 'knowledge' && (
        <div className="service-content-body">
          <div className="kb-search-hero">
            <h2>Base de Conhecimento ITIL & FAQ</h2>
            <p>Artigos técnicos, procedimentos de suporte e respostas rápidas para o time de atendimento.</p>
            <div className="kb-search-input-wrap">
              <Search size={20} />
              <input
                type="text"
                placeholder="Pesquisar por assunto (ex: reenvio, estorno, QR code, catraca, titularidade)..."
                value={kbSearch}
                onChange={e => setKbSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="kb-articles-grid">
            {mockArticles
              .filter(a => a.title.toLowerCase().includes(kbSearch.toLowerCase()) || a.snippet.toLowerCase().includes(kbSearch.toLowerCase()))
              .map(article => (
                <div key={article.id} className="kb-article-card">
                  <div className="article-cat-row">
                    <span className="kb-cat-tag">{article.category}</span>
                    <span className="kb-views">{article.views} visualizações</span>
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.snippet}</p>
                  <div className="kb-footer-row">
                    <span className="kb-helpful">⭐ {article.helpfulPercent}% acharam útil</span>
                    <button className="read-article-btn" onClick={() => notify(`Artigo "${article.title}" aberto para consulta.`)}>
                      <span>Ler Procedimento</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 7. ABA: FILAS, AGENTES & ESCALAÇÃO */}
      {activeTab === 'teams' && (
        <div className="service-content-body">
          <div className="service-two-col-grid">
            {/* Tabela de Agentes & Presença Interativa */}
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Agentes de Atendimento & Presença</h3>
                  <p>Clique no status para alterar presença (ONLINE, BUSY, AWAY, OFFLINE).</p>
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
                        title="Clique para alternar presença"
                        style={{ cursor: 'pointer', border: 0 }}
                      />
                      <div>
                        <strong>{ag.name}</strong>
                        <small>{ag.email} • <b>{ag.status}</b></small>
                      </div>
                    </div>

                    <div className="agent-level-col">
                      <span className="level-badge">{ag.level}</span>
                      <small>{ag.team}</small>
                    </div>

                    <div className="agent-capacity-col">
                      <span>Ocupação</span>
                      <strong>{ag.activeTickets} / {ag.capacity} tickets</strong>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${(ag.activeTickets / ag.capacity) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filas & Estratégias */}
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Filas de Roteamento de Tickets</h3>
                  <p>Estratégias de distribuição de carga de trabalho.</p>
                </div>
              </div>

              <div className="sla-matrix-list">
                {queues.map(q => (
                  <div key={q.id} className="sla-matrix-card p2">
                    <div className="matrix-top">
                      <strong>{q.name} ({q.code})</strong>
                      <span className="badge-count">{q.openTickets} tickets</span>
                    </div>
                    <div className="matrix-times">
                      <div><span>Estratégia:</span> <strong>{q.strategy}</strong></div>
                      <div><span>Agentes Ativos:</span> <strong>{q.agentsCount}</strong></div>
                      <div><span>Tempo Médio:</span> <strong>4 min</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. ABA: COMPRADOR 360° */}
      {activeTab === 'client360' && (
        <div className="service-content-body">
          <div className="service-card-panel">
            <div className="panel-header-row">
              <div>
                <h3>Visão 360° do Comprador & Histórico</h3>
                <p>Consulte todos os pedidos, ingressos, check-ins e atendimentos anteriores do cliente.</p>
              </div>
            </div>

            <div className="client-360-preview">
              <div className="client-profile-header">
                <div className="client-avatar">JS</div>
                <div className="client-main-data">
                  <h3>João Silva Oliveira</h3>
                  <span>CPF: 123.456.789-00 • joao.silva@email.com • (41) 99882-1144</span>
                  <div className="client-badges-row">
                    <span className="client-pill vip">Cliente VIP • 6 Pedidos</span>
                    <span className="client-pill verified">Biometria Facial Cadastrada</span>
                    <span className="client-pill csat">NPS 10 Promotor</span>
                  </div>
                </div>
              </div>

              <div className="client-360-grid">
                <div className="client-orders-box">
                  <h4>Pedidos & Ingressos Recentes</h4>
                  <div className="client-order-item">
                    <div className="order-head">
                      <strong>#DI-984221 • Festival Sertanejo Curitiba</strong>
                      <span className="status-pill green">Pix Aprovado</span>
                    </div>
                    <p>2 × Pista Premium • R$ 480,00 • QR Codes emitidos e ativos</p>
                  </div>

                  <div className="client-order-item">
                    <div className="order-head">
                      <strong>#DI-876120 • Stand Up Comedy Night</strong>
                      <span className="status-pill green">Cartão de Crédito</span>
                    </div>
                    <p>1 × Cadeira Central • R$ 120,00 • Check-in realizado</p>
                  </div>
                </div>

                <div className="client-tickets-history-box">
                  <h4>Histórico de Chamados no SAC</h4>
                  <div className="hist-ticket-row">
                    <span>#DS-2026-984221</span>
                    <strong>Ingresso não recebido após Pix</strong>
                    <span className="badge-status orange">Em Atendimento</span>
                  </div>
                  <div className="hist-ticket-row">
                    <span>#DS-2025-441200</span>
                    <strong>Dúvida sobre horário de abertura de portão</strong>
                    <span className="badge-status green">Resolvido</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
