import { useState, useMemo, type FormEvent } from 'react'
import {
  Search, Phone, Mail, MessageSquare, Star, Clock3, Users,
  CheckCircle2, AlertTriangle, ChevronRight, SendHorizontal, Paperclip,
  Bot, Sparkles, HelpCircle, Ticket, RotateCcw, QrCode, Shield, ArrowRightLeft,
  UserCheck, ExternalLink, Download, Plus, Filter, ThumbsUp, ChevronDown,
  RefreshCw, Check, X, ShieldAlert, FileText, ArrowUpRight, Zap, Info,
  CircleDot, Radio, MessageCircle, AlertCircle
} from 'lucide-react'

function InstagramIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

export interface SacConversation {
  id: number
  customerName: string
  cpfMasked: string
  phone: string
  email: string
  channel: 'WhatsApp' | 'Email' | 'Chat' | 'Instagram'
  status: 'EM_ATENDIMENTO' | 'AGUARDANDO' | 'IA' | 'FINALIZADO'
  operator: string
  queue: 'Geral' | 'IA' | 'Financeiro' | 'Ingressos' | 'VIP'
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isFavorite: boolean
  slaTime: string
  slaStatus: 'normal' | 'warning' | 'danger'
  orderNumber: string
  eventName: string
  ticketCount: number
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  qrCodes: Array<{
    code: string
    status: string
    checkin: string
    sector: string
  }>
  messages: Array<{
    id: number
    sender: 'customer' | 'agent' | 'bot'
    senderName: string
    text: string
    time: string
    channel?: string
  }>
  previousTickets: Array<{
    id: string
    subject: string
    priority: string
    status: string
    date: string
  }>
}

interface Props {
  notify: (msg: string) => void
  onOpenTicketTab?: () => void
  onOpenSearch360?: (query: string) => void
  onOpenKnowledgeTab?: () => void
}

const mockConversationsData: SacConversation[] = [
  {
    id: 1,
    customerName: 'Maria Silva Oliveira',
    cpfMasked: '***.452.889-**',
    phone: '(41) 99872-3344',
    email: 'maria.silva@exemplo.com.br',
    channel: 'WhatsApp',
    status: 'EM_ATENDIMENTO',
    operator: 'Lucas SAC',
    queue: 'Ingressos',
    lastMessage: 'Não recebi meu ingresso no e-mail após confirmação do Pix...',
    lastMessageTime: '10:48',
    unreadCount: 1,
    isFavorite: true,
    slaTime: '02:14',
    slaStatus: 'normal',
    orderNumber: 'DI-284519',
    eventName: 'Rua da Música Festival 2026',
    ticketCount: 4,
    totalAmount: 480.0,
    paymentMethod: 'PIX (Efí Bank)',
    paymentStatus: 'APROVADO',
    qrCodes: [
      { code: 'ING-77401', status: 'DISPONÍVEL', checkin: 'NÃO UTILIZADO', sector: 'Pista Premium' },
      { code: 'ING-77402', status: 'DISPONÍVEL', checkin: 'NÃO UTILIZADO', sector: 'Pista Premium' },
      { code: 'ING-77403', status: 'DISPONÍVEL', checkin: 'NÃO UTILIZADO', sector: 'Pista Premium' },
      { code: 'ING-77404', status: 'UTILIZADO', checkin: 'VALIDADO PORTÃO 2', sector: 'Pista Premium' },
    ],
    messages: [
      {
        id: 1,
        sender: 'customer',
        senderName: 'Maria Silva Oliveira',
        text: 'Olá, bom dia! Realizei o pagamento via Pix do pedido #DI-284519 para a Rua da Música, mas não achei os ingressos no app nem recebi no e-mail.',
        time: '10:46',
        channel: 'WhatsApp'
      },
      {
        id: 2,
        sender: 'bot',
        senderName: 'Disk Copilot IA',
        text: 'Olá Maria! Identifiquei seu pedido #DI-284519 aprovado em nosso sistema. Transferi seu contato para nossa equipe com histórico priorizado.',
        time: '10:47',
        channel: 'WhatsApp'
      },
      {
        id: 3,
        sender: 'agent',
        senderName: 'Lucas SAC',
        text: 'Bom dia, Maria! Já estou com seus dados em tela. Identifiquei os 4 ingressos. Deseja que eu envie os vouchers e QR Codes diretamente por aqui no WhatsApp?',
        time: '10:48',
        channel: 'WhatsApp'
      },
      {
        id: 4,
        sender: 'customer',
        senderName: 'Maria Silva Oliveira',
        text: 'Não recebi meu ingresso no e-mail após confirmação do Pix... Por favor, pode enviar por aqui sim!',
        time: '10:48',
        channel: 'WhatsApp'
      }
    ],
    previousTickets: [
      { id: 'DS-2026-8812', subject: 'Dúvida sobre classificação etária', priority: 'P3', status: 'RESOLVIDO', date: '12/08/2026' },
      { id: 'DS-2026-9430', subject: 'Segunda via de comprovante', priority: 'P3', status: 'RESOLVIDO', date: '29/08/2026' },
    ]
  },
  {
    id: 2,
    customerName: 'João Santos Pereira',
    cpfMasked: '***.712.309-**',
    phone: '(41) 98411-9922',
    email: 'joao.santos@empresa.com.br',
    channel: 'Email',
    status: 'AGUARDANDO',
    operator: 'Beatriz N2',
    queue: 'Financeiro',
    lastMessage: 'Gostaria de solicitar o estorno referente a desistência no prazo legal...',
    lastMessageTime: '10:32',
    unreadCount: 0,
    isFavorite: false,
    slaTime: '05:32',
    slaStatus: 'warning',
    orderNumber: 'DI-281094',
    eventName: 'Rock Arena Festival 2026',
    ticketCount: 2,
    totalAmount: 520.0,
    paymentMethod: 'Cartão de Crédito Visa',
    paymentStatus: 'APROVADO',
    qrCodes: [
      { code: 'ING-66101', status: 'DISPONÍVEL', checkin: 'NÃO UTILIZADO', sector: 'Camarote Open Bar' },
      { code: 'ING-66102', status: 'DISPONÍVEL', checkin: 'NÃO UTILIZADO', sector: 'Camarote Open Bar' }
    ],
    messages: [
      {
        id: 1,
        sender: 'customer',
        senderName: 'João Santos Pereira',
        text: 'Prezados, comprei 2 ingressos para o Rock Arena ontem, mas tive um imprevisto de viagem. Gostaria de solicitar o estorno referente a desistência no prazo legal de 7 dias.',
        time: '10:32',
        channel: 'Email'
      }
    ],
    previousTickets: [
      { id: 'DS-2026-7719', subject: 'Consulta de disponibilidade PCD', priority: 'P2', status: 'RESOLVIDO', date: '04/07/2026' }
    ]
  },
  {
    id: 3,
    customerName: 'Carlos Oliveira Costa',
    cpfMasked: '***.883.190-**',
    phone: '(41) 99122-8811',
    email: 'carlos.oliveira@gmail.com',
    channel: 'WhatsApp',
    status: 'IA',
    operator: 'Disk Copilot IA',
    queue: 'IA',
    lastMessage: 'Meu pagamento Pix expirou antes de eu escanear, o que faço?',
    lastMessageTime: '10:49',
    unreadCount: 1,
    isFavorite: true,
    slaTime: '00:48',
    slaStatus: 'normal',
    orderNumber: 'DI-284990',
    eventName: 'Festival XPTO 2026',
    ticketCount: 1,
    totalAmount: 180.0,
    paymentMethod: 'PIX (Efí Bank)',
    paymentStatus: 'EXPIRADO',
    qrCodes: [],
    messages: [
      {
        id: 1,
        sender: 'customer',
        senderName: 'Carlos Oliveira Costa',
        text: 'Meu pagamento Pix expirou antes de eu escanear, o que faço? Os ingressos continuam reservados?',
        time: '10:49',
        channel: 'WhatsApp'
      },
      {
        id: 2,
        sender: 'bot',
        senderName: 'Disk Copilot IA',
        text: 'Olá Carlos! Quando o Pix expira, a reserva expira automaticamente para liberar o lote. Deseja que eu gere um novo link de pagamento com o mesmo lote ou prefere falar com um atendente?',
        time: '10:49',
        channel: 'WhatsApp'
      }
    ],
    previousTickets: []
  },
  {
    id: 4,
    customerName: 'Juliana Paes Ferreira',
    cpfMasked: '***.104.920-**',
    phone: '(11) 97722-1100',
    email: 'juliana.paes@terra.com.br',
    channel: 'Instagram',
    status: 'EM_ATENDIMENTO',
    operator: 'Fernando SAC',
    queue: 'Geral',
    lastMessage: 'Quais documentos são válidos para meia-entrada estudante?',
    lastMessageTime: '09:58',
    unreadCount: 0,
    isFavorite: false,
    slaTime: '12:40',
    slaStatus: 'normal',
    orderNumber: 'DI-283110',
    eventName: 'Rua da Música Festival 2026',
    ticketCount: 1,
    totalAmount: 140.0,
    paymentMethod: 'PIX (Efí Bank)',
    paymentStatus: 'APROVADO',
    qrCodes: [
      { code: 'ING-55901', status: 'DISPONÍVEL', checkin: 'NÃO UTILIZADO', sector: 'Pista Meia-Entrada' }
    ],
    messages: [
      {
        id: 1,
        sender: 'customer',
        senderName: 'Juliana Paes Ferreira',
        text: 'Olá equipe Disk Ingressos! Quais documentos são válidos para meia-entrada estudante na entrada do festival?',
        time: '09:58',
        channel: 'Instagram'
      }
    ],
    previousTickets: []
  },
  {
    id: 5,
    customerName: 'Rodrigo Mendonça',
    cpfMasked: '***.559.201-**',
    phone: '(41) 99881-2233',
    email: 'rodrigo.mendonca@gmail.com',
    channel: 'Chat',
    status: 'FINALIZADO',
    operator: 'Lucas SAC',
    queue: 'Ingressos',
    lastMessage: 'Muito obrigado, consegui salvar no aplicativo!',
    lastMessageTime: '09:15',
    unreadCount: 0,
    isFavorite: false,
    slaTime: 'Concluído',
    slaStatus: 'normal',
    orderNumber: 'DI-281900',
    eventName: 'Festival XPTO 2026',
    ticketCount: 2,
    totalAmount: 360.0,
    paymentMethod: 'Cartão de Crédito Elo',
    paymentStatus: 'APROVADO',
    qrCodes: [
      { code: 'ING-44001', status: 'DISPONÍVEL', checkin: 'NÃO UTILIZADO', sector: 'Pista' },
      { code: 'ING-44002', status: 'DISPONÍVEL', checkin: 'NÃO UTILIZADO', sector: 'Pista' }
    ],
    messages: [
      {
        id: 1,
        sender: 'customer',
        senderName: 'Rodrigo Mendonça',
        text: 'Bom dia, não encontrava os ingressos no app.',
        time: '09:10',
        channel: 'Chat'
      },
      {
        id: 2,
        sender: 'agent',
        senderName: 'Lucas SAC',
        text: 'Bom dia Rodrigo! Sincronizamos seu cadastro e os 2 ingressos já estão ativos na sua carteira.',
        time: '09:12',
        channel: 'Chat'
      },
      {
        id: 3,
        sender: 'customer',
        senderName: 'Rodrigo Mendonça',
        text: 'Muito obrigado, consegui salvar no aplicativo!',
        time: '09:15',
        channel: 'Chat'
      }
    ],
    previousTickets: [
      { id: 'DS-2026-6640', subject: 'Atualização cadastral', priority: 'P4', status: 'RESOLVIDO', date: '10/06/2026' }
    ]
  }
]

type QueueKey = 'TODOS' | 'IA' | 'AGUARDANDO' | 'EM_ATENDIMENTO' | 'MEUS' | 'FINALIZADOS'
type OperatorStatus = 'ONLINE' | 'AUSENTE' | 'OCUPADO' | 'OFFLINE'

export function SacCentralAtendimento({ notify, onOpenTicketTab, onOpenSearch360, onOpenKnowledgeTab }: Props) {
  const [conversations, setConversations] = useState<SacConversation[]>(mockConversationsData)
  const [selectedConvId, setSelectedConvId] = useState<number>(1)
  const [activeQueue, setActiveQueue] = useState<QueueKey>('TODOS')
  const [operatorFilter, setOperatorFilter] = useState<string>('TODOS')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [channelFilter, setChannelFilter] = useState<string>('TODOS')
  const [myPresence, setMyPresence] = useState<OperatorStatus>('ONLINE')
  const [chatInput, setChatInput] = useState<string>('')
  const [copilotSummary, setCopilotSummary] = useState<string | null>(null)
  const [copilotSuggestion, setCopilotSuggestion] = useState<string | null>(null)
  const [showOperatorsDrawer, setShowOperatorsDrawer] = useState<boolean>(false)
  const [showKnowledgeModal, setShowKnowledgeModal] = useState<boolean>(false)
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false)
  const [showRefundModal, setShowRefundModal] = useState<boolean>(false)
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false)
  const [showQrModal, setShowQrModal] = useState<{ open: boolean; code?: string; event?: string } | null>(null)

  // New Chat Form State
  const [newChatCustomer, setNewChatCustomer] = useState('')
  const [newChatContact, setNewChatContact] = useState('')
  const [newChatChannel, setNewChatChannel] = useState<'WhatsApp' | 'Email' | 'Chat' | 'Instagram'>('WhatsApp')
  const [newChatMessage, setNewChatMessage] = useState('')

  // Transfer Form State
  const [transferTarget, setTransferTarget] = useState('Beatriz N2')
  const [transferQueue, setTransferQueue] = useState('Financeiro')

  // Refund Form State
  const [refundReason, setRefundReason] = useState('Desistência no prazo legal de 7 dias (CDC)')
  const [refundAmount, setRefundAmount] = useState('480,00')

  // Active conversation
  const selectedConv = useMemo(() => {
    return conversations.find(c => c.id === selectedConvId) || conversations[0]
  }, [conversations, selectedConvId])

  // Queue Counters
  const counters = useMemo(() => {
    return {
      todos: 333,
      ia: 110,
      aguardando: 6,
      emAtendimento: 97,
      meus: 10,
      finalizados: 106,
    }
  }, [])

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      // Queue Filter
      if (activeQueue === 'IA' && c.status !== 'IA') return false
      if (activeQueue === 'AGUARDANDO' && c.status !== 'AGUARDANDO') return false
      if (activeQueue === 'EM_ATENDIMENTO' && c.status !== 'EM_ATENDIMENTO') return false
      if (activeQueue === 'MEUS' && c.operator !== 'Lucas SAC') return false
      if (activeQueue === 'FINALIZADOS' && c.status !== 'FINALIZADO') return false

      // Operator Filter
      if (operatorFilter !== 'TODOS' && c.operator !== operatorFilter) return false

      // Channel Filter
      if (channelFilter !== 'TODOS' && c.channel !== channelFilter) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = c.customerName.toLowerCase().includes(q)
        const matchPhone = c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
        const matchEmail = c.email.toLowerCase().includes(q)
        const matchOrder = c.orderNumber.toLowerCase().includes(q)
        const matchCpf = c.cpfMasked.includes(q)
        const matchTicket = c.qrCodes.some(qr => qr.code.toLowerCase().includes(q))
        if (!matchName && !matchPhone && !matchEmail && !matchOrder && !matchCpf && !matchTicket) {
          return false
        }
      }

      return true
    })
  }, [conversations, activeQueue, operatorFilter, channelFilter, searchQuery])

  // Toggle Favorite
  const toggleFavorite = (convId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setConversations(prev =>
      prev.map(c => (c.id === convId ? { ...c, isFavorite: !c.isFavorite } : c))
    )
    notify('Status de prioridade / favorito atualizado!')
  }

  // Send Message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || chatInput).trim()
    if (!text) return

    const newMsg = {
      id: Date.now(),
      sender: 'agent' as const,
      senderName: 'Lucas SAC (Você)',
      text,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      channel: selectedConv.channel
    }

    setConversations(prev =>
      prev.map(c => {
        if (c.id === selectedConv.id) {
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: newMsg.time,
            status: c.status === 'IA' ? 'EM_ATENDIMENTO' : c.status,
            operator: c.operator === 'Disk Copilot IA' ? 'Lucas SAC' : c.operator,
            messages: [...c.messages, newMsg]
          }
        }
        return c
      })
    )

    setChatInput('')
    setCopilotSuggestion(null)
    notify(`Mensagem enviada com sucesso no canal ${selectedConv.channel}!`)
  }

  // Copilot Actions
  const handleCopilotSummarize = () => {
    setCopilotSummary(
      `Resumo Disk Copilot: Cliente ${selectedConv.customerName} comprou ${selectedConv.ticketCount} ingressos para "${selectedConv.eventName}" via ${selectedConv.paymentMethod} no valor de R$ ${selectedConv.totalAmount.toFixed(2)}. Pagamento aprovado no gateway. Solicitou reenvio dos QR Codes pois não recebeu e-mail.`
    )
    notify('Resumo da conversa gerado pelo Disk Copilot IA!')
  }

  const handleCopilotSuggest = () => {
    const sug = `Olá ${selectedConv.customerName.split(' ')[0]}! Verifiquei seu pedido #${selectedConv.orderNumber} e todos os ${selectedConv.ticketCount} ingressos estão válidos. Acabei de reenviar o voucher e os QR Codes diretamente por aqui e também no seu e-mail cadastrado. Poderia verificar se já recebeu?`
    setCopilotSuggestion(sug)
    notify('Sugestão de resposta gerada pela IA contextual!')
  }

  const handleCopilotHandoff = () => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === selectedConv.id) {
          return {
            ...c,
            status: 'EM_ATENDIMENTO',
            operator: 'Lucas SAC',
            messages: [
              ...c.messages,
              {
                id: Date.now(),
                sender: 'agent' as const,
                senderName: 'Lucas SAC',
                text: 'Olá! Sou o Lucas da equipe humana do SAC Disk Ingressos. Assumi o atendimento com todo o seu histórico preservado. Como posso ajudar?',
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                channel: c.channel
              }
            ]
          }
        }
        return c
      })
    )
    notify('Conversa assumida pela equipe humana com contexto 100% preservado!')
  }

  // End Support
  const handleEndSupport = () => {
    setConversations(prev =>
      prev.map(c => (c.id === selectedConv.id ? { ...c, status: 'FINALIZADO' } : c))
    )
    notify(`Atendimento de ${selectedConv.customerName} finalizado com sucesso!`)
  }

  // Start New Chat
  const handleCreateNewChat = (e: FormEvent) => {
    e.preventDefault()
    if (!newChatCustomer.trim() || !newChatMessage.trim()) return

    const newChat: SacConversation = {
      id: Date.now(),
      customerName: newChatCustomer,
      cpfMasked: '***.***.***-**',
      phone: newChatContact.includes('@') ? '(41) 99999-0000' : newChatContact,
      email: newChatContact.includes('@') ? newChatContact : 'cliente@contato.com.br',
      channel: newChatChannel,
      status: 'EM_ATENDIMENTO',
      operator: 'Lucas SAC',
      queue: 'Geral',
      lastMessage: newChatMessage,
      lastMessageTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      unreadCount: 0,
      isFavorite: false,
      slaTime: '15:00',
      slaStatus: 'normal',
      orderNumber: 'DI-285000',
      eventName: 'Festival XPTO 2026',
      ticketCount: 1,
      totalAmount: 150.0,
      paymentMethod: 'PIX (Efí Bank)',
      paymentStatus: 'APROVADO',
      qrCodes: [
        { code: 'ING-99001', status: 'DISPONÍVEL', checkin: 'NÃO UTILIZADO', sector: 'Pista' }
      ],
      messages: [
        {
          id: 1,
          sender: 'agent',
          senderName: 'Lucas SAC (Você)',
          text: newChatMessage,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          channel: newChatChannel
        }
      ],
      previousTickets: []
    }

    setConversations([newChat, ...conversations])
    setSelectedConvId(newChat.id)
    setShowNewChatModal(false)
    setNewChatCustomer('')
    setNewChatContact('')
    setNewChatMessage('')
    notify(`Nova conversa iniciada via ${newChatChannel} com ${newChatCustomer}!`)
  }

  // Transfer Chat
  const handleConfirmTransfer = (e: FormEvent) => {
    e.preventDefault()
    setConversations(prev =>
      prev.map(c => {
        if (c.id === selectedConv.id) {
          return {
            ...c,
            operator: transferTarget,
            queue: transferQueue as any,
            messages: [
              ...c.messages,
              {
                id: Date.now(),
                sender: 'agent' as const,
                senderName: 'Sistema Disk SAC',
                text: `Atendimento transferido de Lucas SAC para ${transferTarget} (Fila: ${transferQueue}).`,
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          }
        }
        return c
      })
    )
    setShowTransferModal(false)
    notify(`Atendimento transferido para ${transferTarget} na fila ${transferQueue}!`)
  }

  // Request Refund
  const handleConfirmRefund = (e: FormEvent) => {
    e.preventDefault()
    setShowRefundModal(false)
    notify(`Solicitação de estorno de R$ ${refundAmount} para o pedido #${selectedConv.orderNumber} protocolada junto ao gateway financeiro!`)
  }

  return (
    <div className="ds-central-container w-full flex flex-col gap-3 font-sans text-slate-100">
      
      {/* ========================================================
          BARRA DE CONTROLE SUPERIOR DA CENTRAL
          ======================================================== */}
      <div className="bg-[#111722] border border-[#1e293b] rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        
        {/* Lado Esquerdo: Identificação & Status de Presença */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Central de Atendimento</h2>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Ao Vivo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ambiente operacional unificado • Omnichannel • Contexto 360° • IA Copilot
            </p>
          </div>
        </div>

        {/* Lado Direito: Presença do Atendente & Ações Operacionais */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Seletor de Presença */}
          <div className="flex items-center bg-[#151c27] border border-[#283548] rounded-lg p-1">
            <span className="text-[11px] font-semibold text-slate-400 px-2">Meu Status:</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => { setMyPresence('ONLINE'); notify('Status alterado para Online! Recebendo atendimentos.') }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                  myPresence === 'ONLINE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Disponível para novos chamados"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                Online
              </button>

              <button
                type="button"
                onClick={() => { setMyPresence('AUSENTE'); notify('Status alterado para Ausente (Pausa).') }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  myPresence === 'AUSENTE'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Pausa programada"
              >
                <Clock3 size={12} />
                Ausente
              </button>

              <button
                type="button"
                onClick={() => { setMyPresence('OCUPADO'); notify('Status alterado para Ocupado.') }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  myPresence === 'OCUPADO'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Em atendimento prioritário"
              >
                <AlertCircle size={12} />
                Ocupado
              </button>
            </div>
          </div>

          {/* Botão Operadores em Tempo Real */}
          <button
            type="button"
            onClick={() => setShowOperatorsDrawer(!showOperatorsDrawer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1e293b] hover:bg-[#283548] text-slate-200 border border-[#334155] transition cursor-pointer"
          >
            <Users size={14} className="text-cyan-400" />
            <span>Operadores ({showOperatorsDrawer ? 'Ocultar' : '4 Ativos'})</span>
          </button>

          {/* Botão Nova Conversa */}
          <button
            type="button"
            onClick={() => setShowNewChatModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm cursor-pointer"
          >
            <Plus size={14} />
            <span>Nova Conversa</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          PAINEL DE OPERADORES EM TEMPO REAL (DRAWER RETRÁTIL)
          ======================================================== */}
      {showOperatorsDrawer && (
        <div className="bg-[#111722] border border-[#283548] rounded-xl p-3.5 shadow-lg">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Operadores & Capacidade em Tempo Real
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Distribuição com Balanceamento Dinâmico</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="bg-[#151c27] border border-[#283548] rounded-lg p-2.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <strong className="text-xs text-white">Lucas SAC (Você)</strong>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Fila N1 • Ingressos</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-blue-400">4 ativos</span>
                <div className="text-[10px] text-emerald-400 font-semibold">98.5% SLA</div>
              </div>
            </div>

            <div className="bg-[#151c27] border border-[#283548] rounded-lg p-2.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <strong className="text-xs text-white">Beatriz N2</strong>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Fila N2 • Financeiro</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-blue-400">2 ativos</span>
                <div className="text-[10px] text-emerald-400 font-semibold">96.2% SLA</div>
              </div>
            </div>

            <div className="bg-[#151c27] border border-[#283548] rounded-lg p-2.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <strong className="text-xs text-white">Fernando SAC</strong>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Fila Geral • Ausente</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-amber-400">1 ativo</span>
                <div className="text-[10px] text-slate-400 font-semibold">94.0% SLA</div>
              </div>
            </div>

            <div className="bg-[#151c27] border border-[#283548] rounded-lg p-2.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Bot size={14} className="text-purple-400" />
                  <strong className="text-xs text-white">Disk Copilot IA</strong>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Triagem & Auto-atend.</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-purple-400">110 conversas</span>
                <div className="text-[10px] text-emerald-400 font-semibold">99.1% Resolução</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          GRID OPERACIONAL DE 3 COLUNAS
          COLUNA 1: FILAS & SUPERVISÃO
          COLUNA 2: CONVERSA / TIMELINE & COPILOT
          COLUNA 3: CONTEXTO 360° DO CLIENTE & AÇÕES RÁPIDAS
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        
        {/* --------------------------------------------------------
            COLUNA 1: FILAS & OPERADORES (Lg: 3 colunas)
            -------------------------------------------------------- */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          
          {/* Card das Filas com Contadores Reais */}
          <div className="bg-[#111722] border border-[#1e293b] rounded-xl p-3 shadow-md flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Filas de Atendimento</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-600/30 text-blue-400 border border-blue-500/30">
                {counters.todos} total
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setActiveQueue('TODOS')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeQueue === 'TODOS'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-[#151c27] hover:bg-[#1e293b] text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className={activeQueue === 'TODOS' ? 'text-white' : 'text-blue-400'} />
                  <span>Todos os Chamados</span>
                </div>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                  activeQueue === 'TODOS' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {counters.todos}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveQueue('IA')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeQueue === 'IA'
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : 'bg-[#151c27] hover:bg-[#1e293b] text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bot size={14} className={activeQueue === 'IA' ? 'text-white' : 'text-purple-400'} />
                  <span>Disk Copilot (IA)</span>
                </div>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                  activeQueue === 'IA' ? 'bg-white/20 text-white' : 'bg-purple-900/40 text-purple-300'
                }`}>
                  {counters.ia}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveQueue('AGUARDANDO')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeQueue === 'AGUARDANDO'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'bg-[#151c27] hover:bg-[#1e293b] text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock3 size={14} className={activeQueue === 'AGUARDANDO' ? 'text-white' : 'text-amber-400'} />
                  <span>Aguardando Operador</span>
                </div>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                  activeQueue === 'AGUARDANDO' ? 'bg-white/20 text-white' : 'bg-amber-900/40 text-amber-300'
                }`}>
                  {counters.aguardando}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveQueue('EM_ATENDIMENTO')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeQueue === 'EM_ATENDIMENTO'
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'bg-[#151c27] hover:bg-[#1e293b] text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} className={activeQueue === 'EM_ATENDIMENTO' ? 'text-white' : 'text-sky-400'} />
                  <span>Em Atendimento</span>
                </div>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                  activeQueue === 'EM_ATENDIMENTO' ? 'bg-white/20 text-white' : 'bg-sky-900/40 text-sky-300'
                }`}>
                  {counters.emAtendimento}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveQueue('MEUS')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeQueue === 'MEUS'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-[#151c27] hover:bg-[#1e293b] text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck size={14} className={activeQueue === 'MEUS' ? 'text-white' : 'text-emerald-400'} />
                  <span>Meus Atendimentos</span>
                </div>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                  activeQueue === 'MEUS' ? 'bg-white/20 text-white' : 'bg-emerald-900/40 text-emerald-300'
                }`}>
                  {counters.meus}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveQueue('FINALIZADOS')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeQueue === 'FINALIZADOS'
                    ? 'bg-slate-700 text-white font-bold shadow-xs'
                    : 'bg-[#151c27] hover:bg-[#1e293b] text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className={activeQueue === 'FINALIZADOS' ? 'text-white' : 'text-slate-400'} />
                  <span>Finalizados</span>
                </div>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                  activeQueue === 'FINALIZADOS' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {counters.finalizados}
                </span>
              </button>
            </div>
          </div>

          {/* Filtros de Operador & Canal */}
          <div className="bg-[#111722] border border-[#1e293b] rounded-xl p-3 shadow-md flex flex-col gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">Filtro por Operador</span>
            <select
              value={operatorFilter}
              onChange={e => setOperatorFilter(e.target.value)}
              className="w-full bg-[#151c27] text-slate-200 border border-[#283548] rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-blue-500"
            >
              <option value="TODOS">Todos os Operadores (Supervisão)</option>
              <option value="Lucas SAC">Lucas SAC</option>
              <option value="Beatriz N2">Beatriz N2</option>
              <option value="Fernando SAC">Fernando SAC</option>
              <option value="Disk Copilot IA">Disk Copilot IA</option>
            </select>

            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mt-1">Canal de Entrada</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setChannelFilter('TODOS')}
                className={`py-1 px-2 rounded text-[11px] font-semibold border cursor-pointer ${
                  channelFilter === 'TODOS'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-[#151c27] text-slate-300 border-[#283548] hover:bg-[#1e293b]'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setChannelFilter('WhatsApp')}
                className={`flex items-center justify-center gap-1 py-1 px-2 rounded text-[11px] font-semibold border cursor-pointer ${
                  channelFilter === 'WhatsApp'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-[#151c27] text-emerald-400 border-[#283548] hover:bg-[#1e293b]'
                }`}
              >
                <Phone size={11} /> WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setChannelFilter('Email')}
                className={`flex items-center justify-center gap-1 py-1 px-2 rounded text-[11px] font-semibold border cursor-pointer ${
                  channelFilter === 'Email'
                    ? 'bg-sky-600 text-white border-sky-500'
                    : 'bg-[#151c27] text-sky-400 border-[#283548] hover:bg-[#1e293b]'
                }`}
              >
                <Mail size={11} /> E-mail
              </button>
              <button
                type="button"
                onClick={() => setChannelFilter('Instagram')}
                className={`flex items-center justify-center gap-1 py-1 px-2 rounded text-[11px] font-semibold border cursor-pointer ${
                  channelFilter === 'Instagram'
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-[#151c27] text-purple-400 border-[#283548] hover:bg-[#1e293b]'
                }`}
              >
                <InstagramIcon size={11} /> Instagram
              </button>
            </div>
          </div>

          {/* Lista de Conversas Recentes / Inbox da Fila */}
          <div className="bg-[#111722] border border-[#1e293b] rounded-xl shadow-md overflow-hidden flex flex-col">
            <div className="p-2.5 border-b border-[#1e293b] bg-[#151c27]/70 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300">
                Atendimentos ({filteredConversations.length})
              </span>
              <button
                type="button"
                onClick={() => notify('Lista de conversas sincronizada com o backend!')}
                className="text-slate-400 hover:text-white p-1"
                title="Atualizar"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto divide-y divide-[#1e293b]">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Nenhum atendimento encontrado para os filtros selecionados.
                </div>
              ) : (
                filteredConversations.map(c => {
                  const isSelected = c.id === selectedConv.id
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedConvId(c.id)}
                      className={`p-3 flex flex-col gap-1.5 cursor-pointer transition ${
                        isSelected
                          ? 'bg-blue-900/30 border-l-4 border-l-blue-500'
                          : 'hover:bg-[#151c27]'
                      }`}
                    >
                      {/* Topo do Item */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <button
                            type="button"
                            onClick={e => toggleFavorite(c.id, e)}
                            className="text-amber-400 hover:scale-110 transition p-0.5 cursor-pointer"
                            title={c.isFavorite ? 'Remover favorito' : 'Marcar como prioritário'}
                          >
                            <Star size={13} fill={c.isFavorite ? '#f59e0b' : 'transparent'} stroke="#f59e0b" />
                          </button>
                          <strong className="text-xs text-white truncate">{c.customerName}</strong>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {c.channel === 'WhatsApp' && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                              <Phone size={9} /> WA
                            </span>
                          )}
                          {c.channel === 'Email' && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-0.5">
                              <Mail size={9} /> Mail
                            </span>
                          )}
                          {c.channel === 'Chat' && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                              <MessageSquare size={9} /> Chat
                            </span>
                          )}
                          {c.channel === 'Instagram' && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-0.5">
                              <InstagramIcon size={9} /> IG
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">{c.lastMessageTime}</span>
                        </div>
                      </div>

                      {/* Preview da Mensagem */}
                      <p className="text-[11px] text-slate-300 line-clamp-1 leading-snug">
                        {c.lastMessage}
                      </p>

                      {/* Rodapé do Item: Status, Operador e SLA */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                        <span className="truncate max-w-[120px] text-slate-300">
                          👤 {c.operator}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded font-mono font-bold ${
                            c.slaStatus === 'warning'
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-600/50'
                              : 'bg-emerald-950/60 text-emerald-400 border border-emerald-600/50'
                          }`}>
                            ⏱ {c.slaTime}
                          </span>

                          {c.status === 'IA' && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 font-bold border border-purple-500/40">
                              IA
                            </span>
                          )}
                          {c.status === 'EM_ATENDIMENTO' && (
                            <span className="px-1.5 py-0.2 rounded bg-sky-900/60 text-sky-300 font-bold border border-sky-500/40">
                              Ativo
                            </span>
                          )}
                          {c.status === 'AGUARDANDO' && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-300 font-bold border border-amber-500/40">
                              Fila
                            </span>
                          )}
                          {c.status === 'FINALIZADO' && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold border border-slate-600/40">
                              Fim
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>

        {/* --------------------------------------------------------
            COLUNA 2: CONVERSA / TIMELINE & COPILOT (Lg: 5 colunas)
            -------------------------------------------------------- */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          
          {/* Barra de Busca Operacional Rápida (Cliente, CPF, Pedido, Ingresso) */}
          <div className="bg-[#111722] border border-[#1e293b] rounded-xl p-2.5 shadow-md flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Busca operacional: CPF, pedido #DI, ingresso ING-, fone..."
                className="w-full bg-[#151c27] text-white pl-8 pr-2 py-1.5 text-xs rounded-lg border border-[#283548] focus:outline-hidden focus:border-blue-500"
              />
              <Search size={14} className="absolute left-2.5 top-2 text-slate-400 pointer-events-none" />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-1"
                title="Limpar busca"
              >
                <X size={14} />
              </button>
            )}
            {onOpenSearch360 && (
              <button
                type="button"
                onClick={() => onOpenSearch360(searchQuery || selectedConv.customerName)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#1e293b] hover:bg-[#283548] text-cyan-400 rounded-lg border border-[#334155] cursor-pointer"
                title="Abrir pesquisa na Central de Consulta / Busca ID"
              >
                <ExternalLink size={12} />
                <span>Busca ID</span>
              </button>
            )}
          </div>

          {/* Painel Central do Atendimento / Chat */}
          <div className="bg-[#111722] border border-[#1e293b] rounded-xl shadow-md flex flex-col min-h-[560px] overflow-hidden">
            
            {/* Header da Conversa Ativa */}
            <div className="p-3 border-b border-[#1e293b] bg-[#151c27] flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
                  {selectedConv.customerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white leading-tight">{selectedConv.customerName}</h3>
                    <button
                      type="button"
                      onClick={e => toggleFavorite(selectedConv.id, e)}
                      className="cursor-pointer"
                      title={selectedConv.isFavorite ? 'Remover favorito' : 'Marcar favorito'}
                    >
                      <Star size={14} fill={selectedConv.isFavorite ? '#f59e0b' : 'transparent'} stroke="#f59e0b" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{selectedConv.phone}</span>
                    <span>•</span>
                    <span className="text-slate-300 font-semibold">{selectedConv.channel}</span>
                    <span>•</span>
                    <span className="text-blue-400">Op: {selectedConv.operator}</span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação no Topo da Conversa */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(true)}
                  className="px-2 py-1 text-xs font-semibold rounded bg-[#1e293b] hover:bg-[#283548] text-slate-200 border border-[#334155] flex items-center gap-1 cursor-pointer"
                  title="Transferir para outro operador ou fila"
                >
                  <ArrowRightLeft size={12} />
                  <span>Transferir</span>
                </button>

                {selectedConv.status !== 'FINALIZADO' ? (
                  <button
                    type="button"
                    onClick={handleEndSupport}
                    className="px-2 py-1 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-xs cursor-pointer"
                    title="Concluir protocolo de atendimento"
                  >
                    <CheckCircle2 size={12} />
                    <span>Finalizar</span>
                  </button>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    Finalizado
                  </span>
                )}
              </div>
            </div>

            {/* BARRA DISK COPILOT IA INTEGRADA NA CONVERSA */}
            <div className="bg-gradient-to-r from-purple-950/40 via-blue-950/30 to-[#111722] border-b border-purple-900/30 p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                  <Sparkles size={14} className="text-purple-400" />
                  <span>Disk Copilot IA — Assistente no Atendimento</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopilotSummarize}
                    className="px-2 py-0.5 text-[11px] font-semibold rounded bg-purple-900/50 hover:bg-purple-800/70 text-purple-200 border border-purple-700/50 transition cursor-pointer"
                  >
                    Resumir
                  </button>
                  <button
                    type="button"
                    onClick={handleCopilotSuggest}
                    className="px-2 py-0.5 text-[11px] font-semibold rounded bg-purple-900/50 hover:bg-purple-800/70 text-purple-200 border border-purple-700/50 transition cursor-pointer"
                  >
                    Sugerir Resposta
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowKnowledgeModal(true)}
                    className="px-2 py-0.5 text-[11px] font-semibold rounded bg-blue-900/50 hover:bg-blue-800/70 text-blue-200 border border-blue-700/50 transition cursor-pointer"
                  >
                    Base FAQ
                  </button>
                  {selectedConv.status === 'IA' && (
                    <button
                      type="button"
                      onClick={handleCopilotHandoff}
                      className="px-2 py-0.5 text-[11px] font-bold rounded bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition cursor-pointer"
                    >
                      Assumir (IA → Humano)
                    </button>
                  )}
                </div>
              </div>

              {/* Bloco de Resumo da IA */}
              {copilotSummary && (
                <div className="bg-[#151c27] border border-purple-500/40 rounded-lg p-2.5 text-xs text-purple-100 flex items-start justify-between gap-2 shadow-sm">
                  <div className="flex items-start gap-2">
                    <Info size={14} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{copilotSummary}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCopilotSummary(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* Bloco de Sugestão de Resposta da IA */}
              {copilotSuggestion && (
                <div className="bg-[#151c27] border border-blue-500/40 rounded-lg p-2.5 text-xs text-slate-100 flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center justify-between text-blue-400 font-bold text-[11px]">
                    <span className="flex items-center gap-1">
                      <Sparkles size={12} /> Resposta Sugerida pelo Disk Copilot
                    </span>
                    <button
                      type="button"
                      onClick={() => setCopilotSuggestion(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <p className="bg-[#0f172a] p-2 rounded border border-[#1e293b] leading-relaxed text-slate-200">
                    {copilotSuggestion}
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setChatInput(copilotSuggestion)
                        setCopilotSuggestion(null)
                        notify('Sugestão copiada para a caixa de texto!')
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-[#1e293b] hover:bg-[#283548] text-slate-200 border border-[#334155] cursor-pointer"
                    >
                      Editar antes de enviar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage(copilotSuggestion)}
                      className="px-3 py-1 text-xs font-bold rounded bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                    >
                      Enviar Sugestão Diretamente
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* TIMELINE DE MENSAGENS (CHAT AREA) */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#0d131f]">
              {selectedConv.messages.map(msg => {
                const isCustomer = msg.sender === 'customer'
                const isBot = msg.sender === 'bot'
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      isCustomer ? 'mr-auto items-start' : 'ml-auto items-end'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[11px] font-bold text-slate-400">
                        {isBot ? '🤖 Disk Copilot IA' : msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{msg.time}</span>
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isCustomer
                          ? 'bg-[#1e293b] text-slate-100 rounded-tl-none border border-slate-700/60'
                          : isBot
                          ? 'bg-purple-950/70 text-purple-100 rounded-tr-none border border-purple-700/60'
                          : 'bg-blue-600 text-white rounded-tr-none'
                      }`}
                    >
                      {msg.text}
                    </div>

                    <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5 px-1">
                      <span>{msg.channel || selectedConv.channel}</span>
                      {!isCustomer && <span className="text-blue-400 font-bold">✓✓ Entregue</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* MODELOS RÁPIDOS DE RESPOSTA */}
            <div className="px-3 py-1.5 bg-[#151c27] border-t border-[#1e293b] flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 font-semibold whitespace-nowrap text-[10px]">Respostas Rápidas:</span>
              <button
                type="button"
                onClick={() => setChatInput(`Olá ${selectedConv.customerName.split(' ')[0]}! Estou confirmando seus ingressos para o evento ${selectedConv.eventName}.`)}
                className="px-2 py-0.5 rounded bg-[#1e293b] hover:bg-[#283548] text-slate-300 border border-[#334155] whitespace-nowrap cursor-pointer"
              >
                🎟️ Confirmar Ingressos
              </button>
              <button
                type="button"
                onClick={() => setChatInput(`Seu comprovante e QR Codes foram reenviados com sucesso no canal ${selectedConv.channel}.`)}
                className="px-2 py-0.5 rounded bg-[#1e293b] hover:bg-[#283548] text-slate-300 border border-[#334155] whitespace-nowrap cursor-pointer"
              >
                📱 Enviar QR Code
              </button>
              <button
                type="button"
                onClick={() => setChatInput('Para meia-entrada de estudante é aceita a DNE (Documento Nacional do Estudante) oficial emitida pela UNE, UBES ou ANPG.')}
                className="px-2 py-0.5 rounded bg-[#1e293b] hover:bg-[#283548] text-slate-300 border border-[#334155] whitespace-nowrap cursor-pointer"
              >
                🎓 Regra Meia-Entrada
              </button>
              <button
                type="button"
                onClick={() => setChatInput('O cancelamento foi solicitado. Nosso setor financeiro processará a devolução em até 24h úteis.')}
                className="px-2 py-0.5 rounded bg-[#1e293b] hover:bg-[#283548] text-slate-300 border border-[#334155] whitespace-nowrap cursor-pointer"
              >
                💳 Estorno em Andamento
              </button>
            </div>

            {/* INPUT DE ENVIO DE MENSAGEM */}
            <div className="p-3 bg-[#111722] border-t border-[#1e293b] flex items-center gap-2">
              <button
                type="button"
                onClick={() => notify('Voucher PDF do pedido vinculado anexado à conversa!')}
                className="p-2 rounded-lg bg-[#151c27] hover:bg-[#1e293b] text-slate-300 border border-[#283548] transition cursor-pointer"
                title="Anexar Voucher / QR Code em PDF"
              >
                <Paperclip size={16} />
              </button>

              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Responder no ${selectedConv.channel} de ${selectedConv.customerName}...`}
                className="flex-1 bg-[#151c27] text-white px-3 py-2 text-xs rounded-lg border border-[#283548] focus:outline-hidden focus:border-blue-500"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                className="flex items-center gap-1 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition cursor-pointer"
              >
                <SendHorizontal size={14} />
                <span>Enviar</span>
              </button>
            </div>

          </div>

        </div>

        {/* --------------------------------------------------------
            COLUNA 3: CONTEXTO 360° DO CLIENTE & AÇÕES RÁPIDAS (Lg: 4 colunas)
            -------------------------------------------------------- */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          
          {/* Card 1: Identificação do Cliente */}
          <div className="bg-[#111722] border border-[#1e293b] rounded-xl p-3.5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cliente 360°</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40">
                VIP Diamond
              </span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center font-bold text-white text-base shadow-sm">
                {selectedConv.customerName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white truncate">{selectedConv.customerName}</h4>
                <div className="text-xs text-slate-400 font-mono mt-0.5">CPF: {selectedConv.cpfMasked}</div>
                <div className="text-xs text-slate-400 mt-0.5">{selectedConv.phone}</div>
              </div>
            </div>

            <div className="bg-[#151c27] rounded-lg p-2.5 border border-[#283548] grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <span className="text-slate-400 block text-[10px]">E-mail</span>
                <span className="font-semibold text-slate-200 truncate block">{selectedConv.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Localidade</span>
                <span className="font-semibold text-slate-200">Curitiba / PR</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Histórico</span>
                <span className="font-semibold text-slate-200">5 compras no Disk</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Score de Confiança</span>
                <span className="font-bold text-emerald-400">99 / 100</span>
              </div>
            </div>

            {onOpenSearch360 && (
              <button
                type="button"
                onClick={() => onOpenSearch360(selectedConv.customerName)}
                className="w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-[#1e293b] hover:bg-[#283548] text-cyan-400 border border-[#334155] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search size={13} />
                <span>Ver Dossiê Completo no Busca ID</span>
              </button>
            )}
          </div>

          {/* Card 2: Pedido Ativo & Ingressos */}
          <div className="bg-[#111722] border border-[#1e293b] rounded-xl p-3.5 shadow-md flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pedido Ativo</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                selectedConv.paymentStatus === 'APROVADO'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}>
                {selectedConv.paymentStatus}
              </span>
            </div>

            <div className="bg-[#151c27] rounded-lg p-2.5 border border-[#283548]">
              <div className="flex items-center justify-between">
                <strong className="text-xs text-white">#{selectedConv.orderNumber}</strong>
                <span className="text-xs font-bold text-emerald-400">
                  R$ {selectedConv.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-xs text-blue-300 font-semibold mt-1">
                {selectedConv.eventName}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Método: {selectedConv.paymentMethod} • {selectedConv.ticketCount} Ingressos
              </div>
            </div>

            {/* Ingressos & QR Codes */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                Ingressos do Pedido ({selectedConv.qrCodes.length})
              </span>
              <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
                {selectedConv.qrCodes.map((qr, idx) => (
                  <div
                    key={idx}
                    className="bg-[#151c27] border border-[#283548] rounded-lg p-2 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white font-mono">{qr.code}</strong>
                        <span className="text-[10px] text-slate-400">{qr.sector}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Check-in: <b className={qr.checkin.includes('VALIDADO') ? 'text-amber-400' : 'text-emerald-400'}>{qr.checkin}</b>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowQrModal({ open: true, code: qr.code, event: selectedConv.eventName })}
                        className="px-2 py-1 text-[11px] font-semibold bg-[#1e293b] hover:bg-[#283548] text-slate-200 rounded border border-[#334155] cursor-pointer"
                        title="Ver QR Code do ingresso"
                      >
                        <QrCode size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => notify(`Ingresso ${qr.code} reenviado para o WhatsApp de ${selectedConv.customerName}!`)}
                        className="px-2 py-1 text-[11px] font-semibold bg-emerald-700/50 hover:bg-emerald-600/70 text-emerald-200 rounded border border-emerald-600/40 cursor-pointer"
                        title="Disparar no WhatsApp"
                      >
                        <Phone size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: AÇÕES RÁPIDAS (OPERACIONAIS) */}
          <div className="bg-[#111722] border border-[#1e293b] rounded-xl p-3.5 shadow-md flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ações Rápidas Operacionais</span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => notify(`Vouchers e ingressos reenviados para o WhatsApp de ${selectedConv.customerName}!`)}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 transition cursor-pointer"
              >
                <Phone size={13} />
                <span>Reenviar Ingresso</span>
              </button>

              <button
                type="button"
                onClick={() => notify(`Comprovante PDF reenviado para o e-mail ${selectedConv.email}!`)}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-700/50 transition cursor-pointer"
              >
                <Mail size={13} />
                <span>Reenviar Comprovante</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQrModal({ open: true, code: selectedConv.qrCodes[0]?.code || 'ING-77401', event: selectedConv.eventName })}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold bg-[#151c27] hover:bg-[#1e293b] text-slate-200 border border-[#283548] transition cursor-pointer"
              >
                <QrCode size={13} className="text-cyan-400" />
                <span>Reenviar QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => notify(`Status do gateway: Transação ${selectedConv.orderNumber} liquidada e confirmada via Efí Pix.`)}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold bg-[#151c27] hover:bg-[#1e293b] text-slate-200 border border-[#283548] transition cursor-pointer"
              >
                <Shield size={13} className="text-emerald-400" />
                <span>Consultar Pagamento</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenTicketTab) onOpenTicketTab()
                  else notify(`Novo chamado protocolado para ${selectedConv.customerName}!`)
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold bg-[#151c27] hover:bg-[#1e293b] text-slate-200 border border-[#283548] transition cursor-pointer"
              >
                <Ticket size={13} className="text-blue-400" />
                <span>Abrir Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTransferModal(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold bg-[#151c27] hover:bg-[#1e293b] text-slate-200 border border-[#283548] transition cursor-pointer"
              >
                <ArrowRightLeft size={13} className="text-amber-400" />
                <span>Transferir Fila</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConversations(prev =>
                    prev.map(c => (c.id === selectedConv.id ? { ...c, operator: 'Beatriz N2', queue: 'Financeiro' } : c))
                  )
                  notify(`Atendimento escalado para Especialista N2 (Beatriz N2)!`)
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-700/50 transition cursor-pointer"
              >
                <Zap size={13} />
                <span>Escalar para N2</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRefundModal(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-700/50 transition cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Solicitar Estorno</span>
              </button>
            </div>
          </div>

          {/* Card 4: Tickets Anteriores do Cliente */}
          {selectedConv.previousTickets.length > 0 && (
            <div className="bg-[#111722] border border-[#1e293b] rounded-xl p-3.5 shadow-md flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Histórico de Tickets ({selectedConv.previousTickets.length})
              </span>
              <div className="flex flex-col gap-1.5">
                {selectedConv.previousTickets.map((t, idx) => (
                  <div key={idx} className="bg-[#151c27] border border-[#283548] rounded-lg p-2 text-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white font-mono">{t.id}</strong>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{t.priority}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px]">{t.subject}</div>
                    </div>
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-emerald-950/60 text-emerald-400 border border-emerald-700/50">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ========================================================
          MODAIS OPERACIONAIS
          ======================================================== */}

      {/* MODAL 1: NOVA CONVERSA */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#111722] border border-[#283548] rounded-2xl w-full max-w-lg p-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b] mb-4">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-blue-400" />
                <h3 className="text-base font-bold text-white">Iniciar Nova Conversa / Atendimento</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewChatModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewChat} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  value={newChatCustomer}
                  onChange={e => setNewChatCustomer(e.target.value)}
                  placeholder="Ex: Carlos Eduardo de Souza"
                  className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-lg border border-[#283548] focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Canal de Envio</label>
                  <select
                    value={newChatChannel}
                    onChange={e => setNewChatChannel(e.target.value as any)}
                    className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-lg border border-[#283548] focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">E-mail</option>
                    <option value="Chat">Chat Web</option>
                    <option value="Instagram">Instagram Direct</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Contato (Telefone ou E-mail)</label>
                  <input
                    type="text"
                    required
                    value={newChatContact}
                    onChange={e => setNewChatContact(e.target.value)}
                    placeholder="(41) 99999-8888 ou cliente@email.com"
                    className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-lg border border-[#283548] focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mensagem Inicial</label>
                <textarea
                  required
                  rows={3}
                  value={newChatMessage}
                  onChange={e => setNewChatMessage(e.target.value)}
                  placeholder="Digite a mensagem de abertura do atendimento..."
                  className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-lg border border-[#283548] focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#151c27] hover:bg-[#1e293b] text-slate-300 border border-[#283548] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm cursor-pointer"
                >
                  Iniciar Conversa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TRANSFERIR ATENDIMENTO */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#111722] border border-[#283548] rounded-2xl w-full max-w-md p-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b] mb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={18} className="text-amber-400" />
                <h3 className="text-base font-bold text-white">Transferir Atendimento</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmTransfer} className="space-y-3.5">
              <div className="bg-[#151c27] p-2.5 rounded-lg border border-[#283548] text-xs">
                <span className="text-slate-400 block text-[10px]">Cliente a ser transferido:</span>
                <strong className="text-white">{selectedConv.customerName}</strong>
                <span className="text-slate-400 block mt-0.5">Protocolo #{selectedConv.orderNumber}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Destino: Operador Específico</label>
                <select
                  value={transferTarget}
                  onChange={e => setTransferTarget(e.target.value)}
                  className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-lg border border-[#283548] focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Beatriz N2">Beatriz N2 (Financeiro / Estornos)</option>
                  <option value="Lucas SAC">Lucas SAC (N1 Ingressos)</option>
                  <option value="Fernando SAC">Fernando SAC (Geral / Dúvidas)</option>
                  <option value="Disk Copilot IA">Disk Copilot IA (Triagem Automática)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Fila Vinculada</label>
                <select
                  value={transferQueue}
                  onChange={e => setTransferQueue(e.target.value)}
                  className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-lg border border-[#283548] focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Financeiro">Fila Financeiro & Estornos</option>
                  <option value="Ingressos">Fila Ingressos & QR Code</option>
                  <option value="Geral">Fila N1 Geral</option>
                  <option value="VIP">Fila VIP & Produtores</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#151c27] hover:bg-[#1e293b] text-slate-300 border border-[#283548] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-sm cursor-pointer"
                >
                  Confirmar Transferência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SOLICITAR ESTORNO (CONFORME REGRAS E PERMISSÕES FINANCEIRAS) */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#111722] border border-[#283548] rounded-2xl w-full max-w-lg p-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b] mb-4">
              <div className="flex items-center gap-2">
                <RotateCcw size={18} className="text-rose-400" />
                <h3 className="text-base font-bold text-white">Solicitar Estorno Financeiro</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-amber-950/40 border border-amber-500/40 rounded-lg p-3 text-xs text-amber-200 mb-4 flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Atenção Operacional:</strong> A solicitação de estorno no SAC protocolará o pedido junto ao Centro de Controle de Estornos e gateway Efí Pix, respeitando as regras do CDC e autorizações do produtor.
              </div>
            </div>

            <form onSubmit={handleConfirmRefund} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3 text-xs bg-[#151c27] p-3 rounded-lg border border-[#283548]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Pedido</span>
                  <strong className="text-white">#{selectedConv.orderNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cliente</span>
                  <strong className="text-white">{selectedConv.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Evento</span>
                  <span className="text-slate-200">{selectedConv.eventName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Método Original</span>
                  <span className="text-emerald-400 font-bold">{selectedConv.paymentMethod}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Motivo do Cancelamento</label>
                <select
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-lg border border-[#283548] focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Desistência no prazo legal de 7 dias (CDC)">Desistência no prazo legal de 7 dias (CDC)</option>
                  <option value="Cancelamento ou alteração de data do evento">Cancelamento ou alteração de data do evento</option>
                  <option value="Cobrança duplicada no gateway">Cobrança duplicada no gateway</option>
                  <option value="Decisão administrativa do produtor">Decisão administrativa do produtor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Valor a Estornar (R$)</label>
                <input
                  type="text"
                  required
                  value={refundAmount}
                  onChange={e => setRefundAmount(e.target.value)}
                  className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-lg border border-[#283548] focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#151c27] hover:bg-[#1e293b] text-slate-300 border border-[#283548] cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm cursor-pointer"
                >
                  Protocolar Solicitação de Estorno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: VISUALIZAR QR CODE EM ALTA RESOLUÇÃO */}
      {showQrModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#111722] border border-[#283548] rounded-2xl w-full max-w-sm p-5 shadow-2xl text-center animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e293b] mb-4">
              <h3 className="text-sm font-bold text-white">Visualização de Voucher & QR Code</h3>
              <button
                type="button"
                onClick={() => setShowQrModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl mx-auto w-48 h-48 flex items-center justify-center shadow-inner mb-3">
              {/* Representação SVG de QR Code */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                <rect x="5" y="5" width="30" height="30" fill="currentColor" />
                <rect x="10" y="10" width="20" height="20" fill="white" />
                <rect x="15" y="15" width="10" height="10" fill="currentColor" />
                
                <rect x="65" y="5" width="30" height="30" fill="currentColor" />
                <rect x="70" y="10" width="20" height="20" fill="white" />
                <rect x="75" y="15" width="10" height="10" fill="currentColor" />

                <rect x="5" y="65" width="30" height="30" fill="currentColor" />
                <rect x="10" y="70" width="20" height="20" fill="white" />
                <rect x="15" y="75" width="10" height="10" fill="currentColor" />

                <rect x="42" y="12" width="16" height="16" fill="currentColor" />
                <rect x="12" y="42" width="16" height="16" fill="currentColor" />
                <rect x="42" y="42" width="20" height="20" fill="currentColor" />
                <rect x="68" y="42" width="14" height="24" fill="currentColor" />
                <rect x="42" y="72" width="24" height="14" fill="currentColor" />
                <rect x="72" y="72" width="16" height="16" fill="currentColor" />
              </svg>
            </div>

            <div className="font-mono text-sm font-bold text-white mb-1">
              {showQrModal.code}
            </div>
            <div className="text-xs text-blue-300 font-semibold mb-3">
              {showQrModal.event}
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Válido para entrada direta no controle de acesso portátil e catracas Disk.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  notify(`QR Code ${showQrModal.code} baixado com sucesso!`)
                  setShowQrModal(null)
                }}
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#1e293b] hover:bg-[#283548] text-slate-200 border border-[#334155] cursor-pointer"
              >
                Baixar Imagem
              </button>
              <button
                type="button"
                onClick={() => {
                  notify(`QR Code ${showQrModal.code} disparado via WhatsApp!`)
                  setShowQrModal(null)
                }}
                className="flex-1 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                Enviar no WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: BASE DE CONHECIMENTO CONTEXTUAL (SEM SAIR DA TELA) */}
      {showKnowledgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#111722] border border-[#283548] rounded-2xl w-full max-w-xl p-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b] mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle size={18} className="text-blue-400" />
                <h3 className="text-base font-bold text-white">Base de Conhecimento Contextual (SAC)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKnowledgeModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto">
              <div className="bg-[#151c27] p-3 rounded-xl border border-[#283548]">
                <strong className="text-xs text-white block mb-1">Como reenviar ingresso pelo sistema?</strong>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                  Clique na ação rápida "Reenviar Ingresso" ou "Reenviar QR Code". O Core gera um novo link assinado via HTTPS e dispara para o WhatsApp ou e-mail cadastrado em menos de 2 segundos.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setChatInput('Identifiquei seus ingressos ativos e acabei de reenviar o link seguro com QR Code diretamente no seu WhatsApp!')
                    setShowKnowledgeModal(false)
                    notify('Instrução inserida na caixa de resposta!')
                  }}
                  className="text-xs text-blue-400 font-semibold hover:underline"
                >
                  Inserir esta resposta no chat →
                </button>
              </div>

              <div className="bg-[#151c27] p-3 rounded-xl border border-[#283548]">
                <strong className="text-xs text-white block mb-1">Regras de Meia-Entrada para Estudantes</strong>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                  O benefício da meia-entrada exige apresentação do Documento Nacional do Estudante (DNE) digital ou físico válido no ano vigente (Lei Federal 12.933/2013). Comprovantes de matrícula não substituem a carteira oficial salvo legislação municipal específica.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setChatInput('Conforme a legislação federal (Lei 12.933/2013), para o acesso com ingresso meia-entrada é obrigatória a apresentação do Documento Nacional do Estudante (DNE) com certificação digital na portaria do evento.')
                    setShowKnowledgeModal(false)
                    notify('Instrução inserida na caixa de resposta!')
                  }}
                  className="text-xs text-blue-400 font-semibold hover:underline"
                >
                  Inserir esta resposta no chat →
                </button>
              </div>

              <div className="bg-[#151c27] p-3 rounded-xl border border-[#283548]">
                <strong className="text-xs text-white block mb-1">Política de Cancelamento e Reembolso (CDC 7 dias)</strong>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                  O cliente tem direito ao estorno integral em até 7 dias corridos após a compra online, desde que solicitado com no mínimo 48h de antecedência do início do evento.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setChatInput('Conforme nossa política de cancelamento amparada pelo Código de Defesa do Consumidor, compras realizadas pela internet podem ser canceladas em até 7 dias após a transação.')
                    setShowKnowledgeModal(false)
                    notify('Instrução inserida na caixa de resposta!')
                  }}
                  className="text-xs text-blue-400 font-semibold hover:underline"
                >
                  Inserir esta resposta no chat →
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1e293b] mt-4">
              {onOpenKnowledgeTab && (
                <button
                  type="button"
                  onClick={() => {
                    setShowKnowledgeModal(false)
                    onOpenKnowledgeTab()
                  }}
                  className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={12} />
                  <span>Abrir Base de Conhecimento Completa</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowKnowledgeModal(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#151c27] hover:bg-[#1e293b] text-slate-200 border border-[#283548] ml-auto cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
