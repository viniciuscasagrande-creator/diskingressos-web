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
  CalendarClock, ChartNoAxesCombined, Bell, ChevronLeft, ChevronDown, ListFilter, Grid, LayoutGrid, Download,
  RotateCcw, ShoppingCart
} from 'lucide-react'
import type { EventItem } from '../data/events'

export type ServiceTab =
  | 'hub'
  | 'search360'
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

interface Customer360Data {
  customer: {
    id: number
    name: string
    cpfMasked: string
    phoneMasked: string
    emailMasked: string
    city: string
    state: string
    memberSince: string
    tags: string[]
  }
  metrics: {
    orders: number
    ingressos: number
    totalSpent: number
    sacTickets: number
  }
  orders: Array<{
    id: number
    order_number: string
    event_name: string
    status: string
    total_amount: number
    ingresso_count: number
    checkin_count: number
    payment_method: string
    payment_status: string
    created_at: string
  }>
  ingressos: Array<{
    id: number
    ticket_code: string
    order_number: string
    event_name: string
    status: string
    checkin_status: string
  }>
  payments: Array<{
    id: number
    order_number: string
    method: string
    status: string
    amount: number
  }>
  sacTickets: Array<{
    id: number
    ticket_number: string
    subject: string
    priority: string
    status: string
  }>
  timeline: Array<{
    id: number
    title: string
    description: string
    occurred_at: string
  }>
}

const mockCustomer360: Customer360Data = {
  customer: {
    id: 1284,
    name: 'João Silva Oliveira',
    cpfMasked: '***.***.***-00',
    phoneMasked: '(41) *****-8899',
    emailMasked: 'jo***@email.com',
    city: 'Curitiba',
    state: 'PR',
    memberSince: '12/03/2024',
    tags: ['VIP Diamond', 'Recorrente', 'Comprador Fiel']
  },
  metrics: {
    orders: 3,
    ingressos: 6,
    totalSpent: 1280.0,
    sacTickets: 2
  },
  orders: [
    {
      id: 984221,
      order_number: 'DI-984221',
      event_name: 'Festival XPTO 2026',
      status: 'PAID',
      total_amount: 480.0,
      ingresso_count: 2,
      checkin_count: 0,
      payment_method: 'PIX',
      payment_status: 'APROVADO',
      created_at: 'Hoje às 10:30'
    },
    {
      id: 983110,
      order_number: 'DI-983110',
      event_name: 'Rock Arena Festival 2026',
      status: 'PAID',
      total_amount: 520.0,
      ingresso_count: 2,
      checkin_count: 2,
      payment_method: 'CARTAO_CREDITO',
      payment_status: 'APROVADO',
      created_at: '15/07/2026'
    }
  ],
  ingressos: [
    { id: 88101, ticket_code: 'ING-88101', order_number: 'DI-984221', event_name: 'Festival XPTO 2026', status: 'ACTIVE', checkin_status: 'NÃO UTILIZADO' },
    { id: 88102, ticket_code: 'ING-88102', order_number: 'DI-984221', event_name: 'Festival XPTO 2026', status: 'ACTIVE', checkin_status: 'NÃO UTILIZADO' },
    { id: 87401, ticket_code: 'ING-87401', order_number: 'DI-983110', event_name: 'Rock Arena Festival 2026', status: 'USED', checkin_status: 'VALIDADO PORTÃO A' }
  ],
  payments: [
    { id: 1, order_number: 'DI-984221', method: 'PIX (Efí Bank)', status: 'APROVADO', amount: 480.0 },
    { id: 2, order_number: 'DI-983110', method: 'Cartão de Crédito Visa', status: 'APROVADO', amount: 520.0 }
  ],
  sacTickets: [
    { id: 1, ticket_number: 'DS-2026-984221', subject: 'Ingresso não recebido após aprovação Pix', priority: 'P2', status: 'EM_ATENDIMENTO' },
    { id: 2, ticket_number: 'DS-2026-981044', subject: 'Dúvida sobre meia-entrada estudante', priority: 'P3', status: 'RESOLVIDO' }
  ],
  timeline: [
    { id: 1, title: 'Compra realizada via Pix', description: 'Pedido #DI-984221 no valor de R$ 480,00 aprovado no gateway Efí.', occurred_at: 'Hoje às 10:30' },
    { id: 2, title: 'QR Code emitido no sistema', description: '2 ingressos gerados (ING-88101 e ING-88102) na carteira digital.', occurred_at: 'Hoje às 10:31' },
    { id: 3, title: 'Contato do cliente no SAC via WhatsApp', description: 'Cliente informou que o e-mail não chegou na caixa de entrada.', occurred_at: 'Hoje às 10:45' },
    { id: 4, title: 'Atendimento iniciado por Lucas Atendente (N1)', description: 'Diagnóstico Disk Copilot confirmou pagamento e gerou disparo por WhatsApp.', occurred_at: 'Hoje às 10:48' }
  ]
}

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

  // Search 360 State
  const [globalSearchInput, setGlobalSearchInput] = useState('')
  const [detectedType, setDetectedType] = useState<string>('NOME')
  const [customer360, setCustomer360] = useState<Customer360Data | null>(mockCustomer360)
  const [searchLoading, setSearchLoading] = useState(false)

  const handleGlobalSearch = (queryOverride?: string) => {
    const q = (queryOverride !== undefined ? queryOverride : globalSearchInput).trim()
    if (!q) {
      setActiveTab('search360')
      return
    }

    setSearchLoading(true)
    let type = 'NOME'
    const cleanNum = q.replace(/\D/g, '')

    if (q.startsWith('DI-') || q.startsWith('di-') || (/^\d{5,7}$/.test(cleanNum) && q.length < 9)) {
      type = 'PEDIDO'
    } else if (cleanNum.length === 11) {
      type = 'CPF'
    } else if (cleanNum.length >= 10 && cleanNum.length <= 13) {
      type = 'TELEFONE'
    } else if (q.includes('@')) {
      type = 'EMAIL'
    } else if (q.toUpperCase().startsWith('ING-')) {
      type = 'INGRESSO'
    }

    setDetectedType(type)

    setTimeout(() => {
      setCustomer360(mockCustomer360)
      setSearchLoading(false)
      setActiveTab('search360')
      notify(`Busca ID localizada para "${q}" (Tipo detectado: ${type}) em 140ms!`)
    }, 200)
  }

  const handleOperatorAction = (action: string) => {
    if (action === 'OPEN_TICKET') {
      setActiveTab('new')
    } else if (action === 'SEND_WHATSAPP') {
      notify(`Disparando mensagem com voucher e QR Code no WhatsApp de ${customer360?.customer.name}!`)
    } else if (action === 'RESEND_EMAIL') {
      notify(`Reenviando voucher PDF com QR Code para ${customer360?.customer.emailMasked}!`)
    } else if (action === 'VIEW_CHECKIN') {
      setActiveTab('liveops')
      notify('Redirecionando para a telemetria de check-in e catracas!')
    } else if (action === 'REQUEST_REFUND') {
      notify('Solicitação de estorno protocolada no gateway Efí Pix com sucesso!')
    } else if (action === 'VIEW_ORDER') {
      notify('Abrindo detalhes do pedido #DI-984221!')
    }
  }

  useEffect(() => {
    if (!mode) return
    if (mode === 'hub') setActiveTab('hub')
    else if (mode === 'search360') setActiveTab('search360')
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
    else if (mode === 'client360') setActiveTab('search360')
    else if (mode === 'workflows') setActiveTab('workflows')
    else if (mode === 'sla') setActiveTab('sla')
    else if (mode === 'knowledge') setActiveTab('knowledge')
    else if (mode === 'teams') setActiveTab('teams')
  }, [mode])

  return (
    <div className="disk-service-shell">
      <div className="disk-service-inner">
        
        {/* Topbar / Greeting */}
        <header className="ds-topbar">
          <div className="ds-topbar-left">
            <h1>👋 Bem-vindo de volta, {producerName || 'Fernando'}!</h1>
            <p>Visão integrada de toda a operação Disk Service</p>
          </div>

          <div className="ds-topbar-right">
            <div className="ds-search-box" style={{ width: '380px' }}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar CPF, pedido, nome, fone, e-mail..."
                value={globalSearchInput}
                onChange={e => setGlobalSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGlobalSearch()}
              />
              <button
                onClick={() => handleGlobalSearch()}
                style={{ background: '#2563eb', color: '#fff', border: 0, borderRadius: '12px', padding: '4px 10px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
              >
                Buscar
              </button>
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
            <span className="ds-launcher-label">Hub Geral</span>
          </button>

          <button className={`ds-launcher-item ${activeTab === 'search360' ? 'active' : ''}`} onClick={() => setActiveTab('search360')}>
            <div className="ds-launcher-circle" style={{ borderColor: activeTab === 'search360' ? '#2563eb' : '#cbd5e1' }}>
              <Search size={22} style={{ color: '#2563eb' }} />
              <span className="ds-mini-tag blue">ID</span>
            </div>
            <span className="ds-launcher-label" style={{ color: '#2563eb', fontWeight: 800 }}>Busca ID</span>
          </button>

          <button className={`ds-launcher-item ${activeTab === 'bi' ? 'active' : ''}`} onClick={() => setActiveTab('bi')}>
            <div className="ds-launcher-circle">
              <BarChart3 size={22} />
            </div>
            <span className="ds-launcher-label">Dashboard & BI</span>
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
            TELA: FASE 23.1 — BUSCA ID (LIGHT)
            ======================================================== */}
        {activeTab === 'search360' && (
          <div className="ds-search360-container">
            
            {/* Super Search Bar Central */}
            <div className="ds-search360-bar">
              <Search size={22} style={{ color: '#2563eb' }} />
              <input
                className="ds-search360-input"
                type="text"
                placeholder="Buscar CPF, pedido, nome, telefone, e-mail ou ingresso..."
                value={globalSearchInput}
                onChange={e => setGlobalSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGlobalSearch()}
                autoFocus
              />
              <button className="ds-search360-btn" onClick={() => handleGlobalSearch()}>
                {searchLoading ? <RefreshCw className="spin" size={16} /> : <Search size={16} />}
                Buscar ID
              </button>
            </div>

            {/* Hint & Examples Bar */}
            <div className="ds-search360-hints">
              <span>Exemplos rápidos:</span>
              <code onClick={() => { setGlobalSearchInput('123.456.789-00'); handleGlobalSearch('123.456.789-00'); }}>123.456.789-00 (CPF)</code>
              <code onClick={() => { setGlobalSearchInput('DI-984221'); handleGlobalSearch('DI-984221'); }}>DI-984221 (Pedido)</code>
              <code onClick={() => { setGlobalSearchInput('João Silva'); handleGlobalSearch('João Silva'); }}>João Silva (Nome)</code>
              <code onClick={() => { setGlobalSearchInput('(41) 99999-8888'); handleGlobalSearch('(41) 99999-8888'); }}>(41) 99999-8888 (Fone)</code>
              <code onClick={() => { setGlobalSearchInput('ING-88101'); handleGlobalSearch('ING-88101'); }}>ING-88101 (Ingresso)</code>
            </div>

            {customer360 && (
              <>
                {/* 1. Header do Cliente + Métricas 360 */}
                <div className="ds-cockpit-header">
                  <div className="ds-cockpit-profile">
                    <div className="ds-cockpit-avatar">
                      {customer360.customer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="ds-cockpit-name-block">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ background: '#2563eb', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>CLIENTE IDENTIFICADO</span>
                        <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>Busca via {detectedType}</span>
                      </div>
                      <h2>{customer360.customer.name}</h2>
                      <p>
                        CPF: <b>{customer360.customer.cpfMasked}</b> · Fone: <b>{customer360.customer.phoneMasked}</b> · E-mail: <b>{customer360.customer.emailMasked}</b> · {customer360.customer.city}/{customer360.customer.state}
                      </p>
                    </div>
                  </div>

                  <div className="ds-cockpit-metrics">
                    <div className="ds-cockpit-metric-item">
                      <span>Pedidos</span>
                      <strong>{customer360.metrics.orders}</strong>
                    </div>
                    <div className="ds-cockpit-metric-item">
                      <span>Ingressos</span>
                      <strong>{customer360.metrics.ingressos}</strong>
                    </div>
                    <div className="ds-cockpit-metric-item">
                      <span>Total Comprado</span>
                      <strong style={{ color: '#059669' }}>R$ {customer360.metrics.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="ds-cockpit-metric-item">
                      <span>Tickets SAC</span>
                      <strong style={{ color: '#d97706' }}>{customer360.metrics.sacTickets}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Barra de Ações Rápidas do Atendente */}
                <div className="ds-operator-actions">
                  <button className="ds-operator-btn primary" onClick={() => handleOperatorAction('OPEN_TICKET')}>
                    <MessageSquareText size={15} /> Abrir Ticket
                  </button>
                  <button className="ds-operator-btn" onClick={() => handleOperatorAction('SEND_WHATSAPP')}>
                    <Phone size={15} style={{ color: '#16a34a' }} /> Enviar WhatsApp
                  </button>
                  <button className="ds-operator-btn" onClick={() => handleOperatorAction('RESEND_EMAIL')}>
                    <Mail size={15} style={{ color: '#2563eb' }} /> Reenviar Ingresso & QR Code
                  </button>
                  <button className="ds-operator-btn" onClick={() => handleOperatorAction('VIEW_CHECKIN')}>
                    <ShieldCheck size={15} style={{ color: '#059669' }} /> Consultar Check-in
                  </button>
                  <button className="ds-operator-btn" onClick={() => handleOperatorAction('REQUEST_REFUND')}>
                    <RotateCcw size={15} style={{ color: '#dc2626' }} /> Solicitar Reembolso
                  </button>
                </div>

                {/* 3. Diagnóstico Automático Disk Copilot IA */}
                <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '14px', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bot size={18} style={{ color: '#7c3aed' }} />
                      <strong style={{ color: '#5b21b6', fontSize: '14px' }}>Diagnóstico Disk Copilot IA (SAC 360º)</strong>
                    </div>
                    <span className="ds-mini-tag purple" style={{ position: 'static' }}>96% Confiança</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#4c1d95', lineHeight: 1.5 }}>
                    <b>Diagnóstico:</b> O pedido #DI-984221 está com pagamento PIX aprovado e 2 ingressos ativos (não utilizados). Houve falha na entrega do e-mail de notificação. <b>Next Best Action:</b> Clique em "Enviar WhatsApp" para disparar os vouchers atualizados com QR Code direto no celular do comprador.
                  </p>
                </div>

                {/* 4. Grid Principal: Pedidos / Ingressos / Pagamentos / SAC */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                  
                  {/* Pedidos & Compras */}
                  <div className="ds-bi-card">
                    <div className="ds-bi-card-header">
                      <h3 className="ds-bi-card-title"><ShoppingCart size={18} style={{ color: '#2563eb' }} /> Pedidos & Ingressos</h3>
                    </div>

                    {customer360.orders.map(o => (
                      <div key={o.id} className="ds-cockpit-order">
                        <div className="ds-cockpit-order-header">
                          <div>
                            <strong>#{o.order_number}</strong>
                            <span>{o.event_name}</span>
                          </div>
                          <span className="status-pill green">{o.payment_status}</span>
                        </div>

                        <div className="ds-cockpit-order-stats">
                          <span><Ticket size={14} /> {o.ingresso_count} ingressos</span>
                          <span><WalletCards size={14} /> R$ {o.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({o.payment_method})</span>
                          <span><CheckCircle2 size={14} /> {o.checkin_count}/{o.ingresso_count} check-ins</span>
                        </div>

                        <div className="ds-cockpit-order-actions">
                          <button onClick={() => handleOperatorAction('VIEW_ORDER')}>Ver pedido</button>
                          <button onClick={() => handleOperatorAction('SEND_WHATSAPP')}>Enviar WhatsApp</button>
                          <button onClick={() => handleOperatorAction('RESEND_EMAIL')}>Reenviar Ingressos</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ingressos & Status de Check-in */}
                  <div className="ds-bi-card">
                    <div className="ds-bi-card-header">
                      <h3 className="ds-bi-card-title"><Ticket size={18} style={{ color: '#059669' }} /> Ingressos & Check-in</h3>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                          <th style={{ padding: '8px' }}>Ingresso</th>
                          <th style={{ padding: '8px' }}>Evento</th>
                          <th style={{ padding: '8px' }}>Status</th>
                          <th style={{ padding: '8px' }}>Check-in</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customer360.ingressos.map(ing => (
                          <tr key={ing.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px' }}><b>{ing.ticket_code}</b></td>
                            <td style={{ padding: '8px' }}>{ing.event_name}</td>
                            <td style={{ padding: '8px' }}><span className="status-pill green">{ing.status}</span></td>
                            <td style={{ padding: '8px' }}><span style={{ color: ing.checkin_status.includes('VALIDADO') ? '#059669' : '#d97706', fontWeight: 700 }}>{ing.checkin_status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* 5. Linha Inferior: Histórico SAC + Timeline 360 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px' }}>
                  
                  {/* Histórico SAC */}
                  <div className="ds-bi-card">
                    <div className="ds-bi-card-header">
                      <h3 className="ds-bi-card-title"><MessageSquareText size={18} style={{ color: '#d97706' }} /> Atendimentos Anteriores</h3>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                          <th style={{ padding: '8px' }}>Protocolo</th>
                          <th style={{ padding: '8px' }}>Assunto</th>
                          <th style={{ padding: '8px' }}>Pri.</th>
                          <th style={{ padding: '8px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customer360.sacTickets.map(st => (
                          <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px' }}><b>{st.ticket_number}</b></td>
                            <td style={{ padding: '8px' }}>{st.subject}</td>
                            <td style={{ padding: '8px' }}><span className="priority-tag P1">{st.priority}</span></td>
                            <td style={{ padding: '8px' }}><span className="status-pill green">{st.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Timeline 360º */}
                  <div className="ds-bi-card">
                    <div className="ds-bi-card-header">
                      <h3 className="ds-bi-card-title"><Clock3 size={18} style={{ color: '#7c3aed' }} /> Linha do Tempo 360º</h3>
                    </div>

                    <div className="ds-cockpit-timeline">
                      {customer360.timeline.map(tl => (
                        <div key={tl.id} className="ds-timeline-entry">
                          <strong>{tl.title}</strong>
                          <p>{tl.description}</p>
                          <small>{tl.occurred_at}</small>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </>
            )}

          </div>
        )}

        {/* MÓDULOS PRINCIPAIS - GRID 5x3 (HUB OPERACIONAL LIGHT) */}
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
                <button className="ds-view-btn" onClick={() => notify('Personalização salva')}>
                  Personalizar <ChevronDown size={14} />
                </button>
              </div>
            </div>

            <div className="ds-modules-grid">
              <div className="ds-module-card" onClick={() => setActiveTab('search360')} style={{ border: '2px solid #2563eb', background: '#eff6ff' }}>
                <div className="ds-card-icon-wrap blue"><Search size={22} /></div>
                <div className="ds-card-text"><h4>Busca ID</h4><p>Localização rápida por CPF, pedido, nome, fone ou ingresso</p></div>
                <ChevronRight size={18} className="ds-card-chevron" style={{ color: '#2563eb' }} />
              </div>

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
                <div className="ds-card-text"><h4>Disk Copilot IA</h4><p>IA aplicada ao atendimento com sugestões</p></div>
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
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><Ticket size={20} /></div><div className="ds-stat-content"><span className="ds-stat-label">Tickets Abertos</span><div className="ds-stat-val-row"><span className="ds-stat-val">128</span><span className="ds-stat-delta green">-12% vs ontem</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><Clock3 size={20} /></div><div className="ds-stat-content"><span className="ds-stat-label">Atrasados (SLA)</span><div className="ds-stat-val-row"><span className="ds-stat-val" style={{ color: '#d97706' }}>18</span><span className="ds-stat-delta orange">+4% vs ontem</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><Smile size={20} /></div><div className="ds-stat-content"><span className="ds-stat-label">CSAT (Hoje)</span><div className="ds-stat-val-row"><span className="ds-stat-val" style={{ color: '#059669' }}>4.6/5</span><span className="ds-stat-delta green">+0.3 vs ontem</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><TrendingUp size={20} /></div><div className="ds-stat-content"><span className="ds-stat-label">NPS (Hoje)</span><div className="ds-stat-val-row"><span className="ds-stat-val" style={{ color: '#059669' }}>53+</span><span className="ds-stat-delta green">+5 vs ontem</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><Users size={20} /></div><div className="ds-stat-content"><span className="ds-stat-label">Check-ins (Hoje)</span><div className="ds-stat-val-row"><span className="ds-stat-val" style={{ color: '#0284c7' }}>8.742</span><span className="ds-stat-delta green">+18% vs ontem</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><Shield size={20} /></div><div className="ds-stat-content"><span className="ds-stat-label">P1 Ativos</span><div className="ds-stat-val-row"><span className="ds-stat-val" style={{ color: '#dc2626' }}>3</span><span className="ds-stat-delta red">+1 vs ontem</span></div></div></div>
            </div>

            {/* ACESSOS RÁPIDOS */}
            <div className="ds-section-header">
              <h2 className="ds-section-title">ACESSOS RÁPIDOS</h2>
            </div>

            <div className="ds-quick-actions-bar">
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('new')}><Plus size={14} style={{ color: '#059669' }} /> Novo Ticket</button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('incidents')}><AlertTriangle size={14} style={{ color: '#dc2626' }} /> Novo Incidente</button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('major')}><Siren size={14} style={{ color: '#dc2626' }} /> War Room</button>
              <button className="ds-quick-action-pill" onClick={() => notify('Disparo de broadcast')}><Radio size={14} style={{ color: '#d97706' }} /> Broadcast</button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('bi')}><BarChart3 size={14} style={{ color: '#0284c7' }} /> Relatório Executivo</button>
              <button className="ds-quick-action-pill" onClick={() => notify('Exportação iniciada')}><Download size={14} style={{ color: '#7c3aed' }} /> Exportar Dados</button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('sla')}><SlidersHorizontal size={14} /> Configurações</button>
            </div>
          </>
        )}

        {/* TELA 2: DASHBOARD & BI (LIGHT) */}
        {activeTab === 'bi' && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div className="ds-spark-card"><div className="ds-spark-top"><div className="ds-spark-icon blue"><Ticket size={20} /></div><div className="ds-spark-header-text"><span>Tickets Abertos</span><div className="ds-spark-value-row"><strong className="ds-spark-value">128</strong><small className="ds-stat-delta green">-12% vs ontem</small></div></div></div><svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,25 Q15,5 30,20 T60,10 T90,22 L100,15" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" /></svg></div>
              <div className="ds-spark-card"><div className="ds-spark-top"><div className="ds-spark-icon red"><Shield size={20} /></div><div className="ds-spark-header-text"><span>P1 Ativos</span><div className="ds-spark-value-row"><strong className="ds-spark-value" style={{ color: '#dc2626' }}>3</strong><small className="ds-stat-delta red">+1 vs ontem</small></div></div></div><svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,22 Q20,28 40,12 T70,25 T90,5 L100,18" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" /></svg></div>
              <div className="ds-spark-card"><div className="ds-spark-top"><div className="ds-spark-icon orange"><Clock3 size={20} /></div><div className="ds-spark-header-text"><span>Atrasados (SLA)</span><div className="ds-spark-value-row"><strong className="ds-spark-value" style={{ color: '#d97706' }}>18</strong><small className="ds-stat-delta orange">+4% vs ontem</small></div></div></div><svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,20 Q25,25 45,8 T75,22 T95,14 L100,18" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" /></svg></div>
              <div className="ds-spark-card"><div className="ds-spark-top"><div className="ds-spark-icon green"><Smile size={20} /></div><div className="ds-spark-header-text"><span>CSAT (Hoje)</span><div className="ds-spark-value-row"><strong className="ds-spark-value" style={{ color: '#059669' }}>4.6/5</strong><small className="ds-stat-delta green">+0.3 vs ontem</small></div></div></div><svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,24 Q20,10 40,22 T70,8 T90,16 L100,10" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" /></svg></div>
              <div className="ds-spark-card"><div className="ds-spark-top"><div className="ds-spark-icon teal"><TrendingUp size={20} /></div><div className="ds-spark-header-text"><span>NPS (Hoje)</span><div className="ds-spark-value-row"><strong className="ds-spark-value" style={{ color: '#0d9488' }}>53</strong><small className="ds-stat-delta green">+5 vs ontem</small></div></div></div><svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,22 Q25,26 50,14 T80,18 T95,6 L100,10" fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" /></svg></div>
              <div className="ds-spark-card"><div className="ds-spark-top"><div className="ds-spark-icon cyan"><Users size={20} /></div><div className="ds-spark-header-text"><span>Check-ins (Hoje)</span><div className="ds-spark-value-row"><strong className="ds-spark-value" style={{ color: '#0891b2' }}>8.742</strong><small className="ds-stat-delta green">+18% vs ontem</small></div></div></div><svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,26 Q20,18 45,22 T70,10 T90,8 L100,5" fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" /></svg></div>
            </div>

            <div className="ds-bi-row three-col">
              <div className="ds-bi-card"><div className="ds-bi-card-header"><h3 className="ds-bi-card-title">Volume de Tickets</h3><select className="ds-filter-select"><option>Últimos 7 dias</option></select></div><div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '170px', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>{[{ day: '13/05', open: 280, closed: 210 }, { day: '14/05', open: 310, closed: 260 }, { day: '15/05', open: 295, closed: 245 }, { day: '16/05', open: 340, closed: 290 }, { day: '17/05', open: 260, closed: 215 }, { day: '18/05', open: 285, closed: 190 }, { day: '19/05', open: 250, closed: 180 }].map((d, i) => (<div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}><div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '130px' }}><div style={{ width: '12px', background: '#2563eb', height: `${(d.open / 350) * 125}px`, borderRadius: '3px 3px 0 0' }} /><div style={{ width: '12px', background: '#059669', height: `${(d.closed / 350) * 125}px`, borderRadius: '3px 3px 0 0' }} /></div><span style={{ fontSize: '10px', color: '#64748b' }}>{d.day}</span></div>))}</div></div>
              <div className="ds-bi-card"><div className="ds-bi-card-header"><h3 className="ds-bi-card-title">Tickets por Canal</h3><select className="ds-filter-select"><option>Hoje</option></select></div><div className="ds-donut-wrapper"><div className="ds-donut-circle-wrap"><svg viewBox="0 0 36 36" style={{ width: '140px', height: '140px', transform: 'rotate(-90deg)' }}><circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="4.5" /><circle cx="18" cy="18" r="14" fill="none" stroke="#2563eb" strokeWidth="4.5" strokeDasharray="45.7 100" strokeDashoffset="0" /><circle cx="18" cy="18" r="14" fill="none" stroke="#ea580c" strokeWidth="4.5" strokeDasharray="18.5 100" strokeDashoffset="-45.7" /><circle cx="18" cy="18" r="14" fill="none" stroke="#d97706" strokeWidth="4.5" strokeDasharray="10.5 100" strokeDashoffset="-64.2" /></svg><div className="ds-donut-center-text"><strong>1.245</strong><small>Total</small></div></div><div className="ds-donut-legend"><div className="ds-legend-item"><div className="ds-legend-left"><span className="ds-legend-dot" style={{ background: '#2563eb' }} /> WhatsApp</div><strong>52%</strong></div><div className="ds-legend-item"><div className="ds-legend-left"><span className="ds-legend-dot" style={{ background: '#ea580c' }} /> Email</div><strong>21%</strong></div><div className="ds-legend-item"><div className="ds-legend-left"><span className="ds-legend-dot" style={{ background: '#d97706' }} /> Chat</div><strong>12%</strong></div></div></div></div>
              <div className="ds-bi-card"><div className="ds-bi-card-header"><h3 className="ds-bi-card-title">Alertas críticos</h3><span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: 700 }}>Ver todos</span></div><div className="ds-alerts-list"><div className="ds-alert-item"><div className="ds-alert-icon p1"><Siren size={16} /></div><div className="ds-alert-content"><div className="ds-alert-title-row"><span className="ds-alert-tag p1">P1</span><span className="ds-alert-title">Catraca Principal Offline</span></div><p className="ds-alert-sub">Festival XPTO 2026 • Portão 02</p></div><span className="ds-alert-time">Agora</span></div><div className="ds-alert-item"><div className="ds-alert-icon p1"><ShieldAlert size={16} /></div><div className="ds-alert-content"><div className="ds-alert-title-row"><span className="ds-alert-tag p1">P1</span><span className="ds-alert-title">Falha na API de Validação</span></div><p className="ds-alert-sub">Validação instável</p></div><span className="ds-alert-time">2 min</span></div></div></div>
            </div>
          </div>
        )}

        {/* OUTROS SUBMÓDULOS */}
        {activeTab === 'tickets' && (
          <div style={{ marginTop: '20px' }}>
            <button className="ds-quick-action-pill" onClick={() => setActiveTab('hub')}><ChevronLeft size={16} /> Voltar ao Hub</button>
            <div style={{ marginTop: '16px' }}>
              <div className="ds-cockpit-order">
                <strong>Fila de Chamados Ativa</strong>
                <p style={{ margin: '4px 0 0', color: '#64748b' }}>Acesse os tickets protocolados e use a timeline para responder.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'new' && (
          <div style={{ marginTop: '20px' }}>
            <button className="ds-quick-action-pill" onClick={() => setActiveTab('hub')}><ChevronLeft size={16} /> Voltar ao Hub</button>
            <form onSubmit={e => { e.preventDefault(); notify('Chamado protocolado!'); setActiveTab('tickets'); }} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', maxWidth: '800px', marginTop: '16px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
              <h3 style={{ margin: '0 0 16px', color: '#0f172a' }}>Protocolar Novo Chamado no Disk Service</h3>
              <input type="text" placeholder="Assunto do chamado" required style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', color: '#0f172a', marginBottom: '12px' }} />
              <textarea placeholder="Descrição do problema" rows={4} required style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', color: '#0f172a', marginBottom: '12px' }} />
              <button type="submit" className="ds-quick-action-pill" style={{ background: '#2563eb', color: '#fff', border: 0 }}><Plus size={16} /> Protocolar</button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}
