import { useState, useEffect, useMemo, type FormEvent } from 'react'
import {
  LayoutDashboard, Ticket, AlertTriangle, BookOpen, Users, Clock3, Plus, Search,
  RefreshCw, CheckCircle2, MessageCircle, Mail, Phone, Globe, ShieldAlert,
  Send, UserCheck, Sparkles, Filter, ChevronRight, ArrowRight, ExternalLink,
  Flame, HelpCircle, FileText, CheckCheck, PlayCircle, XCircle, AlertCircle, Headphones, Link2, Sparkle
} from 'lucide-react'
import type { EventItem } from '../data/events'

export type ServiceTab = 'dashboard' | 'tickets' | 'new' | 'incidents' | 'knowledge' | 'teams' | 'client360'

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
  slaResponseMinutes: number
  slaResolutionMinutes: number
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
    slaResponseMinutes: 60,
    slaResolutionMinutes: 360,
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
    slaResponseMinutes: 15,
    slaResolutionMinutes: 120,
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
    slaResponseMinutes: 240,
    slaResolutionMinutes: 1440,
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
    slaResponseMinutes: 60,
    slaResolutionMinutes: 360,
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

const mockAgents: AgentItem[] = [
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

export default function SupportPage({ events, producerId, producerName, notify, onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<ServiceTab>('dashboard')
  const [tickets, setTickets] = useState<TicketItem[]>(mockTickets)
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(mockTickets[0])
  const [ticketSearch, setTicketSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('TODOS')
  const [statusFilter, setStatusFilter] = useState<string>('TODOS')
  const [newReply, setNewReply] = useState('')

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

  // Knowledge search
  const [kbSearch, setKbSearch] = useState('')

  // Estatísticas e KPIs
  const stats = useMemo(() => {
    const total = tickets.length
    const open = tickets.filter(t => t.status !== 'RESOLVIDO' && t.status !== 'FECHADO').length
    const p1 = tickets.filter(t => t.priority === 'P1' && t.status !== 'RESOLVIDO').length
    const resolved = tickets.filter(t => t.status === 'RESOLVIDO').length
    const compliance = 96.4
    return { total, open, p1, resolved, compliance }
  }, [tickets])

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
      assignedAgent: 'Fila N1 (Automático)',
      slaResponseMinutes: formPriority === 'P1' ? 15 : formPriority === 'P2' ? 60 : formPriority === 'P3' ? 240 : 720,
      slaResolutionMinutes: formPriority === 'P1' ? 120 : formPriority === 'P2' ? 360 : formPriority === 'P3' ? 1440 : 2880,
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
    notify(`Chamado protocolado com sucesso: ${newProtocol}! SLA ativado.`)
    setActiveTab('tickets')
    setSelectedTicket(created)
  }

  return (
    <div className="support-module-container">
      {/* Header Principal */}
      <header className="support-main-header">
        <div className="header-brand-block">
          <div className="service-badge">
            <Headphones size={18} />
            <span>DISK SERVICE • ITIL V4 & SLA</span>
          </div>
          <h1>Central de Atendimento & Suporte</h1>
          <p>Gestão de tickets omnichannel, resolução rápida, SLA P1–P4, incidentes e suporte ao comprador.</p>
        </div>

        <div className="header-status-block">
          <div className="agent-status-indicator">
            <span className="dot pulse-green" />
            <span>Atendimento Online • 5 Agentes</span>
          </div>
          <button className="primary-service-btn" onClick={() => setActiveTab('new')}>
            <Plus size={18} />
            <span>Abrir Chamado</span>
          </button>
        </div>
      </header>

      {/* Sub-Navegação em Abas Modernas */}
      <nav className="service-nav-tabs">
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
          <span>Equipes & Matriz de SLA</span>
        </button>
        <button className={`service-tab-btn ${activeTab === 'client360' ? 'active' : ''}`} onClick={() => setActiveTab('client360')}>
          <Search size={17} />
          <span>Comprador 360°</span>
        </button>
      </nav>

      {/* CONTEÚDO DAS ABAS */}

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
            {/* Coluna 1: Fila em tempo real */}
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Fila de Atendimento em Tempo Real</h3>
                  <p>Distribuição automática por categoria e canal de contato.</p>
                </div>
                <span className="live-pill">AO VIVO</span>
              </div>

              <div className="queue-list">
                <div className="queue-item">
                  <div className="queue-title-block">
                    <span className="queue-dot blue" />
                    <strong>Reenvio de Ingressos & QR Code</strong>
                  </div>
                  <div className="queue-metric-block">
                    <span className="badge-count">14 tickets</span>
                    <small>TMA: 4 min</small>
                  </div>
                </div>

                <div className="queue-item">
                  <div className="queue-title-block">
                    <span className="queue-dot orange" />
                    <strong>Dúvidas de Pagamento & Pix</strong>
                  </div>
                  <div className="queue-metric-block">
                    <span className="badge-count">6 tickets</span>
                    <small>TMA: 7 min</small>
                  </div>
                </div>

                <div className="queue-item">
                  <div className="queue-title-block">
                    <span className="queue-dot purple" />
                    <strong>Troca de Titularidade & Biometria</strong>
                  </div>
                  <div className="queue-metric-block">
                    <span className="badge-count">5 tickets</span>
                    <small>TMA: 12 min</small>
                  </div>
                </div>

                <div className="queue-item">
                  <div className="queue-title-block">
                    <span className="queue-dot red" />
                    <strong>Suporte de Catraca & Portaria</strong>
                  </div>
                  <div className="queue-metric-block">
                    <span className="badge-count danger">2 tickets P1</span>
                    <small>TMA: 2 min</small>
                  </div>
                </div>
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

      {/* 2. ABA: CHAMADOS & FILA COM VISUALIZAÇÃO COMPLETA */}
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

                    <div className="ticket-bottom-info">
                      <div className="customer-inline">
                        <strong>{t.customerName}</strong>
                        <span>• Pedido {t.orderCode}</span>
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
                        <span className={`status-tag ${selectedTicket.status}`}>{selectedTicket.status.replace('_', ' ')}</span>
                      </div>
                      <h2>{selectedTicket.subject}</h2>
                    </div>

                    <div className="workspace-actions">
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
                      <span>Responsável & SLA</span>
                      <strong>{selectedTicket.assignedAgent}</strong>
                      <small>1ª Resposta: {selectedTicket.slaResponseMinutes}m • Resolução: {selectedTicket.slaResolutionMinutes}m</small>
                    </div>
                  </div>

                  {/* Ações Rápidas de Operação */}
                  <div className="fast-actions-bar">
                    <button className="fast-action-chip" onClick={() => notify('Ingresso com QR Code reenviado com sucesso por E-mail e WhatsApp!')}>
                      <Mail size={14} /> Reenviar Ingresso & QR Code
                    </button>
                    <button className="fast-action-chip" onClick={() => notify('QR Code reemitido e invalidado o anterior!')}>
                      <RefreshCw size={14} /> Reemitir QR Code
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

      {/* 3. ABA: ABRIR NOVO CHAMADO */}
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
                  rows={5}
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

      {/* 4. ABA: INCIDENTES ITIL (WAR ROOM) */}
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

      {/* 5. ABA: BASE DE CONHECIMENTO */}
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

      {/* 6. ABA: EQUIPES & MATRIZ DE SLA */}
      {activeTab === 'teams' && (
        <div className="service-content-body">
          <div className="service-two-col-grid">
            {/* Tabela de Agentes & Filas */}
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Agentes de Atendimento & Capacidade</h3>
                  <p>Escalação N1, N2, N3 e status de ocupação.</p>
                </div>
              </div>

              <div className="agents-list">
                {mockAgents.map(ag => (
                  <div key={ag.id} className="agent-row-card">
                    <div className="agent-avatar-col">
                      <div className={`status-dot ${ag.status.toLowerCase()}`} />
                      <div>
                        <strong>{ag.name}</strong>
                        <small>{ag.email}</small>
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

            {/* Matriz de SLA ITIL */}
            <div className="service-card-panel">
              <div className="panel-header-row">
                <div>
                  <h3>Matriz de SLA Oficial (P1–P4)</h3>
                  <p>Regras contratuais de tempo de atendimento.</p>
                </div>
              </div>

              <div className="sla-matrix-list">
                <div className="sla-matrix-card p1">
                  <div className="matrix-top">
                    <strong className="red-text">P1 - CRÍTICO (Bloqueio Total / Portão)</strong>
                    <span>100% dos eventos</span>
                  </div>
                  <div className="matrix-times">
                    <div><span>1ª Resposta:</span> <strong>15 minutos</strong></div>
                    <div><span>Resolução Máxima:</span> <strong>2 horas</strong></div>
                    <div><span>Escalação:</span> <strong>N3 & Gestão Imediata</strong></div>
                  </div>
                </div>

                <div className="sla-matrix-card p2">
                  <div className="matrix-top">
                    <strong className="orange-text">P2 - ALTO (Ingresso Não Recebido / Pagamento)</strong>
                    <span>Eventos ativos</span>
                  </div>
                  <div className="matrix-times">
                    <div><span>1ª Resposta:</span> <strong>60 minutos</strong></div>
                    <div><span>Resolução Máxima:</span> <strong>6 horas</strong></div>
                    <div><span>Escalação:</span> <strong>N2 Financeiro</strong></div>
                  </div>
                </div>

                <div className="sla-matrix-card p3">
                  <div className="matrix-top">
                    <strong className="yellow-text">P3 - MÉDIO (Titularidade / Dúvidas Gerais)</strong>
                    <span>Horário comercial</span>
                  </div>
                  <div className="matrix-times">
                    <div><span>1ª Resposta:</span> <strong>4 horas</strong></div>
                    <div><span>Resolução Máxima:</span> <strong>24 horas</strong></div>
                    <div><span>Escalação:</span> <strong>N1 Geral</strong></div>
                  </div>
                </div>

                <div className="sla-matrix-card p4">
                  <div className="matrix-top">
                    <strong className="green-text">P4 - BAIXO (Sugestões / Feedbacks)</strong>
                    <span>Horário comercial</span>
                  </div>
                  <div className="matrix-times">
                    <div><span>1ª Resposta:</span> <strong>12 horas</strong></div>
                    <div><span>Resolução Máxima:</span> <strong>48 horas</strong></div>
                    <div><span>Escalação:</span> <strong>N1 Backoffice</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. ABA: COMPRADOR 360° */}
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
