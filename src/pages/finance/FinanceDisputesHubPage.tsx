import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertOctagon, AlertTriangle, ArrowLeft, ArrowRight, ArrowUpRight,
  Bot, CheckCircle2, ChevronRight, CircleDollarSign, Clock, Download,
  Eye, FileSpreadsheet, FileText, Filter, HelpCircle, History, Info,
  Layers, Lock, Plus, RefreshCw, Scale, Search, Send, ShieldAlert,
  ShieldCheck, SlidersHorizontal, Sparkles, Tag, TrendingDown,
  TrendingUp, Undo2, UserCheck, Users, Wallet, X, Zap
} from 'lucide-react'
import {
  getFinanceDisputesSummary, getFinanceDisputesRefunds, createFinanceDisputesRefund,
  approveFinanceDisputesRefund, processFinanceDisputesRefund, completeFinanceDisputesRefund,
  getFinanceChargebacks, createFinanceChargeback, submitChargebackEvidence, resolveFinanceChargeback,
  sendPaymentWebhook,
  type FinanceDisputesSummary, type FinanceChargeback, type RefundRequest
} from '../../services/api'
import './finance-disputes-hub.css'

type Tab = 'refunds' | 'reconciliation-risk' | 'chargebacks' | 'audit' | 'webhooks'
type PeriodKey = 'today' | '7d' | '30d' | 'month' | 'custom'

type Props = {
  producerId?: number
  eventId?: number
  initialTab?: Tab
  notify?: (message: string) => void
  onBack?: () => void
}

interface EnhancedRefundItem {
  id: number
  orderCode: string
  ticketCode: string
  ticketSector: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCpf: string
  eventName: string
  requestedAt: string
  amountCents: number
  serviceFeeCents: number
  refundNetCents: number
  method: 'pix' | 'credit' | 'debit' | 'voucher' | 'boleto'
  kind: 'total' | 'parcial' | 'voucher'
  status: 'pending' | 'analysis' | 'approved' | 'processing' | 'completed' | 'rejected'
  alcadaLevel: 'alcada1' | 'alcada2' | 'alcada3'
  alcadaRole: string
  alcadaRule: string
  reason: string
  gatewayRef: string
  history: Array<{ time: string; user: string; action: string; origin: string }>
}

const money = (c = 0) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100)
const pct = (val = 0) => `${val.toFixed(1).replace('.', ',')}%`

export default function FinanceDisputesHubPage({ producerId, eventId, initialTab = 'refunds', notify, onBack }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [summary, setSummary] = useState<FinanceDisputesSummary | null>(null)
  const [refunds, setRefunds] = useState<RefundRequest[]>([])
  const [chargebacks, setChargebacks] = useState<FinanceChargeback[]>([])

  // Filtros Globais
  const [period, setPeriod] = useState<PeriodKey>('30d')
  const [filterEvent, setFilterEvent] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterMethod, setFilterMethod] = useState<string>('all')
  const [filterAlcada, setFilterAlcada] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Estados de Interação
  const [selectedRefund, setSelectedRefund] = useState<EnhancedRefundItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showNewRefundWizard, setShowNewRefundWizard] = useState(false)
  const [showAiAssistant, setShowAiAssistant] = useState(false)

  const flash = (m: string) => notify?.(m)

  // Dataset Enriquecido com Consistência Contábil
  const enrichedRefunds: EnhancedRefundItem[] = useMemo(() => {
    return [
      {
        id: 154231,
        orderCode: '#154231',
        ticketCode: 'ING-VIP-88912',
        ticketSector: 'VIP · Lote 02',
        customerName: 'João da Silva',
        customerEmail: 'joao.silva@email.com',
        customerPhone: '(41) 99812-3456',
        customerCpf: '123.***.***-00',
        eventName: 'Show Roupa Nova — Curitiba Master Hall',
        requestedAt: '16/07/2026 09:42',
        amountCents: 58000,
        serviceFeeCents: 2900,
        refundNetCents: 55100,
        method: 'pix',
        kind: 'total',
        status: 'analysis',
        alcadaLevel: 'alcada2',
        alcadaRole: 'Gerente Financeiro',
        alcadaRule: 'Alçada 2 — Valores acima de R$ 500,00',
        reason: 'Cancelamento solicitado pelo cliente dentro do prazo de 7 dias (CDC).',
        gatewayRef: 'PIX-E2E-99182390123910',
        history: [
          { time: '16/07 09:42', user: 'SAC / Cliente', action: 'Solicitação criada no Portal', origin: 'Web' },
          { time: '16/07 09:45', user: 'Triagem Automática', action: 'Classificado para Alçada 2 (Gerente)', origin: 'Sistema' },
          { time: '16/07 10:15', user: 'Carlos Silva', action: 'Iniciou análise financeira documental', origin: 'ERP' }
        ]
      },
      {
        id: 154299,
        orderCode: '#154299',
        ticketCode: 'ING-CAM-00431',
        ticketSector: 'Camarote Prime · Lote 01',
        customerName: 'Maria de Souza',
        customerEmail: 'maria.souza@empresa.com.br',
        customerPhone: '(11) 98765-4321',
        customerCpf: '456.***.***-11',
        eventName: 'Festival Sertanejo Prime 2026',
        requestedAt: '16/07/2026 08:30',
        amountCents: 120000,
        serviceFeeCents: 6000,
        refundNetCents: 114000,
        method: 'credit',
        kind: 'total',
        status: 'pending',
        alcadaLevel: 'alcada2',
        alcadaRole: 'Gerente Financeiro',
        alcadaRule: 'Alçada 2 — Valores entre R$ 500 e R$ 2.000',
        reason: 'Duplicidade de compra por erro de conexão do cliente.',
        gatewayRef: 'NSU-88239102-CIELO',
        history: [
          { time: '16/07 08:30', user: 'Maria de Souza', action: 'Solicitou estorno por compra duplicada', origin: 'App Mobile' },
          { time: '16/07 08:35', user: 'Antifraude Clearsale', action: 'Score 98 (Aprovado para análise)', origin: 'API' }
        ]
      },
      {
        id: 154302,
        orderCode: '#154302',
        ticketCode: 'ING-PIST-11902',
        ticketSector: 'Pista Premium · Lote 03',
        customerName: 'Pedro Santos',
        customerEmail: 'pedro.santos@gmail.com',
        customerPhone: '(41) 99111-2233',
        customerCpf: '789.***.***-22',
        eventName: 'Stand-up Comedy Gala',
        requestedAt: '15/07/2026 18:20',
        amountCents: 24000,
        serviceFeeCents: 1200,
        refundNetCents: 22800,
        method: 'credit',
        kind: 'total',
        status: 'analysis',
        alcadaLevel: 'alcada1',
        alcadaRole: 'Supervisor de Atendimento',
        alcadaRule: 'Alçada 1 — Valores de R$ 100 a R$ 500',
        reason: 'Impossibilidade médica comprovada por atestado.',
        gatewayRef: 'NSU-10293847-REDE',
        history: [
          { time: '15/07 18:20', user: 'Atendimento SAC', action: 'Anexou atestado médico e abriu ticket', origin: 'SAC' },
          { time: '15/07 18:25', user: 'Supervisor SAC', action: 'Validou documento médico', origin: 'ERP' }
        ]
      },
      {
        id: 154180,
        orderCode: '#154180',
        ticketCode: 'ING-VIP-55410',
        ticketSector: 'VIP Individual',
        customerName: 'Ana Beatriz Lima',
        customerEmail: 'ana.lima@outlook.com',
        customerPhone: '(41) 99777-8899',
        customerCpf: '321.***.***-99',
        eventName: 'Show Roupa Nova — Curitiba Master Hall',
        requestedAt: '14/07/2026 14:10',
        amountCents: 58000,
        serviceFeeCents: 2900,
        refundNetCents: 55100,
        method: 'pix',
        kind: 'total',
        status: 'completed',
        alcadaLevel: 'alcada2',
        alcadaRole: 'Gerente Financeiro',
        alcadaRule: 'Alçada 2 — Valores acima de R$ 500,00',
        reason: 'Cancelamento por alteração de data do espetáculo.',
        gatewayRef: 'PIX-E2E-77182930491029',
        history: [
          { time: '14/07 14:10', user: 'Cliente', action: 'Solicitação registrada', origin: 'Web' },
          { time: '14/07 14:40', user: 'Gerente Financeiro', action: 'Estorno aprovado', origin: 'ERP' },
          { time: '14/07 14:42', user: 'Gateway Stone', action: 'PIX de devolução liquidado com sucesso', origin: 'API' },
          { time: '14/07 14:45', user: 'Ledger Engine', action: 'Lote contábil #9912 gerado (D: 2.1.04 / C: 1.1.01)', origin: 'Ledger' }
        ]
      },
      {
        id: 154110,
        orderCode: '#154110',
        ticketCode: 'ING-MES-09182',
        ticketSector: 'Mesa 4 Lugares',
        customerName: 'Rodrigo Medeiros',
        customerEmail: 'rodrigo.m@terra.com.br',
        customerPhone: '(41) 98822-1100',
        customerCpf: '654.***.***-88',
        eventName: 'Festival Sertanejo Prime 2026',
        requestedAt: '13/07/2026 11:00',
        amountCents: 58000,
        serviceFeeCents: 2900,
        refundNetCents: 55100,
        method: 'credit',
        kind: 'total',
        status: 'completed',
        alcadaLevel: 'alcada2',
        alcadaRole: 'Gerente Financeiro',
        alcadaRule: 'Alçada 2 — Valores acima de R$ 500,00',
        reason: 'Desistência no prazo legal.',
        gatewayRef: 'NSU-55443322-PAGARME',
        history: [
          { time: '13/07 11:00', user: 'Cliente', action: 'Solicitação criada', origin: 'Web' },
          { time: '13/07 11:30', user: 'Diretor Financeiro', action: 'Aprovado em alçada', origin: 'ERP' },
          { time: '13/07 11:32', user: 'Pagar.me Gateway', action: 'Estorno no cartão processado', origin: 'API' },
          { time: '13/07 11:35', user: 'Ledger Engine', action: 'Contabilizado e conciliado', origin: 'Ledger' }
        ]
      }
    ]
  }, [])

  // Filtros aplicados
  const filteredRefunds = useMemo(() => {
    return enrichedRefunds.filter(item => {
      if (filterStatus !== 'all' && item.status !== filterStatus) return false
      if (filterMethod !== 'all' && item.method !== filterMethod) return false
      if (filterAlcada !== 'all' && item.alcadaLevel !== filterAlcada) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          item.orderCode.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.ticketCode.toLowerCase().includes(q) ||
          item.customerCpf.toLowerCase().includes(q) ||
          item.eventName.toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [enrichedRefunds, filterStatus, filterMethod, filterAlcada, searchQuery])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [s, r, c] = await Promise.all([
        getFinanceDisputesSummary(producerId, eventId),
        getFinanceDisputesRefunds(producerId, eventId),
        getFinanceChargebacks(producerId, eventId)
      ])
      setSummary(s)
      setRefunds(r)
      setChargebacks(c)
    } catch (e: any) {
      setError(e.message || 'Falha ao carregar central de estornos e disputas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [producerId, eventId])

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  const openDrawer = (item: EnhancedRefundItem) => {
    setSelectedRefund(item)
    setIsDrawerOpen(true)
  }

  const closeDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedRefund(null)
  }

  const handleApproveRefund = (item: EnhancedRefundItem) => {
    flash(`Estorno do pedido ${item.orderCode} (${money(item.amountCents)}) aprovado com sucesso! Lançamento gerado no Ledger.`)
    closeDrawer()
  }

  const handleRejectRefund = (item: EnhancedRefundItem) => {
    flash(`Solicitação do pedido ${item.orderCode} reprovada e registrada na auditoria.`)
    closeDrawer()
  }

  const handleConvertToVoucher = (item: EnhancedRefundItem) => {
    const voucherVal = item.amountCents * 1.05
    flash(`Voucher no valor de ${money(voucherVal)} (+5% bônus) gerado e enviado para ${item.customerName}!`)
    closeDrawer()
  }

  const exportCsv = () => {
    const header = 'Pedido;Ingresso;Cliente;CPF;Evento;Data;Valor Solicitado;Taxa Retida;Valor Devolvido;Meio Pagto;Status;Alcada\n'
    const rows = filteredRefunds.map(i =>
      `"${i.orderCode}";"${i.ticketCode}";"${i.customerName}";"${i.customerCpf}";"${i.eventName}";"${i.requestedAt}";"${(i.amountCents/100).toFixed(2)}";"${(i.serviceFeeCents/100).toFixed(2)}";"${(i.refundNetCents/100).toFixed(2)}";"${i.method.toUpperCase()}";"${i.status.toUpperCase()}";"${i.alcadaRole}"`
    ).join('\n')
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_estornos_safesaff_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    flash('Relatório executivo de estornos exportado com sucesso.')
  }

  return (
    <div className="findisp-container" data-finance-release="24.9-independent-refunds-2026-09-02">
      {/* Botão de Retorno */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => (onBack ? onBack() : window.history.back())}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 shadow-xs transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-sky-600" />
          <span>Voltar ao Painel Financeiro</span>
        </button>
      </div>

      {/* Header Executivo Moderno */}
      <header className="findisp-hero-modern">
        <div>
          <div className="badge-eyebrow">
            <Layers size={12} />
            <span>ERP · FASE 24.9 · MÓDULO INDEPENDENTE · ESTORNO</span>
          </div>
          <h1>Módulo de Estorno de Ingressos</h1>
          <p>
            Central de Estornos, Reembolsos & Chargebacks: gestão executiva de devoluções financeiras, conciliação e alçadas de aprovação integradas ao Ledger contábil.
          </p>
        </div>

        <div className="findisp-header-actions">
          <button
            className={`findisp-btn ${showAiAssistant ? 'primary' : 'ai'}`}
            onClick={() => setShowAiAssistant(!showAiAssistant)}
          >
            <Bot size={16} />
            <span>Assistente de Estornos</span>
          </button>
          <button className="findisp-btn secondary" onClick={exportCsv}>
            <Download size={15} />
            <span>Exportar CSV</span>
          </button>
          <button className="findisp-btn secondary" onClick={load}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Atualizar</span>
          </button>
          <button
            className="findisp-btn primary"
            onClick={() => setShowNewRefundWizard(true)}
          >
            <Plus size={16} />
            <span>+ Novo Estorno</span>
          </button>
        </div>
      </header>

      {/* Painel do Assistente de Estornos (Diagnóstico Proativo) */}
      {showAiAssistant && (
        <section className="findisp-ai-diagnostic">
          <div className="findisp-ai-diagnostic-header">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-purple-600" />
              <span>Diagnóstico do Assistente de Estornos & Risco</span>
            </div>
            <button
              onClick={() => setShowAiAssistant(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
          <div className="findisp-ai-diagnostic-cards">
            <div className="ai-card">
              <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                <Clock size={14} />
                <span>3 Solicitações Aguardando Alçada</span>
              </div>
              <p>Existem R$ 2.020,00 aguardando aprovação de Gerente Financeiro e Supervisor.</p>
            </div>
            <div className="ai-card">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <CheckCircle2 size={14} />
                <span>Oportunidade de Voucher (+5%)</span>
              </div>
              <p>2 clientes elegíveis para conversão em voucher, retendo R$ 820,00 no ecossistema.</p>
            </div>
            <div className="ai-card">
              <div className="flex items-center gap-1.5 text-sky-700 font-bold">
                <ShieldCheck size={14} />
                <span>Taxa de Chargeback Sob Controle</span>
              </div>
              <p>0,85% de contestações no período (meta ≤ 1,00%). Sem risco de sanção de bandeiras.</p>
            </div>
          </div>
        </section>
      )}

      {/* Barra de Filtros Operacionais */}
      <section className="findisp-filter-bar">
        <div className="findisp-filter-item">
          <label>Período:</label>
          <select value={period} onChange={e => setPeriod(e.target.value as PeriodKey)}>
            <option value="today">Hoje</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias (01–16 Jul)</option>
            <option value="month">Este Mês</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        <div className="findisp-filter-item">
          <label>Status:</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Todos os status</option>
            <option value="pending">Aguardando aprovação</option>
            <option value="analysis">Em análise</option>
            <option value="completed">Executado / Devolvido</option>
            <option value="rejected">Reprovado</option>
          </select>
        </div>

        <div className="findisp-filter-item">
          <label>Pagamento:</label>
          <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)}>
            <option value="all">Todas as formas</option>
            <option value="pix">PIX</option>
            <option value="credit">Cartão de Crédito</option>
            <option value="voucher">Voucher</option>
          </select>
        </div>

        <div className="findisp-filter-item">
          <label>Alçada:</label>
          <select value={filterAlcada} onChange={e => setFilterAlcada(e.target.value)}>
            <option value="all">Todas as alçadas</option>
            <option value="alcada1">Alçada 1 (Supervisor)</option>
            <option value="alcada2">Alçada 2 (Gerente)</option>
            <option value="alcada3">Alçada 3 (Diretor)</option>
          </select>
        </div>

        <div className="findisp-filter-item flex-1 min-w-[200px]">
          <div className="relative w-full">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por pedido, cliente, CPF ou evento..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8"
            />
          </div>
        </div>
      </section>

      {/* Grid de KPIs Sem Ambiguidade Financeira */}
      <section className="findisp-kpi-grid-5">
        {/* KPI 1: Estornos Executados */}
        <article className="findisp-kpi-card blue">
          <div className="findisp-kpi-card-header">
            <span>Estornos Executados</span>
            <div className="icon-wrap"><Undo2 size={16} /></div>
          </div>
          <div className="kpi-value">12 operações</div>
          <div className="kpi-sub">
            <TrendingUp size={13} />
            <span>+5% vs. período anterior</span>
          </div>
          <div className="kpi-period">Período: 01–16 Jul 2026</div>
        </article>

        {/* KPI 2: Montante Devolvido */}
        <article className="findisp-kpi-card green">
          <div className="findisp-kpi-card-header">
            <span>Montante Devolvido</span>
            <div className="icon-wrap"><CircleDollarSign size={16} /></div>
          </div>
          <div className="kpi-value">R$ 1.160,00</div>
          <div className="kpi-sub">
            <CheckCircle2 size={13} />
            <span>2 operações concluídas</span>
          </div>
          <div className="kpi-period">Devolução financeira efetiva</div>
        </article>

        {/* KPI 3: Fila de Aprovações */}
        <article className="findisp-kpi-card amber">
          <div className="findisp-kpi-card-header">
            <span>Fila de Aprovações</span>
            <div className="icon-wrap"><Clock size={16} /></div>
          </div>
          <div className="kpi-value">R$ 2.020,00</div>
          <div className="kpi-sub">
            <AlertCircleIcon size={13} />
            <span>3 solicitações aguardando</span>
          </div>
          <div className="kpi-period">Aguardando alçada financeira</div>
        </article>

        {/* KPI 4: Taxas Retidas */}
        <article className="findisp-kpi-card purple">
          <div className="findisp-kpi-card-header">
            <span>Taxas Retidas</span>
            <div className="icon-wrap"><Tag size={16} /></div>
          </div>
          <div className="kpi-value">R$ 47,08</div>
          <div className="kpi-sub">
            <ShieldCheck size={13} />
            <span>Convenience fee preservada</span>
          </div>
          <div className="kpi-period">Receita própria da plataforma</div>
        </article>

        {/* KPI 5: Preservado em Voucher */}
        <article className="findisp-kpi-card rose">
          <div className="findisp-kpi-card-header">
            <span>Preservado em Voucher</span>
            <div className="icon-wrap"><Wallet size={16} /></div>
          </div>
          <div className="kpi-value">R$ 348,00</div>
          <div className="kpi-sub">
            <ArrowUpRight size={13} />
            <span>30% retido no ecossistema</span>
          </div>
          <div className="kpi-period">Crédito para futuras compras</div>
        </article>
      </section>

      {/* Faixa de Resumo Financeiro Executivo */}
      <section className="findisp-summary-strip">
        <div className="findisp-summary-item">
          <small>Total Solicitado</small>
          <strong className="text-slate-900">R$ 2.020,00</strong>
        </div>
        <div className="findisp-summary-divider" />
        <div className="findisp-summary-item">
          <small>Aprovado Interno</small>
          <strong className="text-emerald-700">R$ 1.160,00</strong>
        </div>
        <div className="findisp-summary-divider" />
        <div className="findisp-summary-item">
          <small>Efetivamente Executado</small>
          <strong className="text-blue-700">R$ 1.160,00</strong>
        </div>
        <div className="findisp-summary-divider" />
        <div className="findisp-summary-item">
          <small>Preservado Voucher</small>
          <strong className="text-purple-700">R$ 348,00</strong>
        </div>
        <div className="findisp-summary-divider" />
        <div className="findisp-summary-item">
          <small>Taxas Retidas</small>
          <strong className="text-amber-800">R$ 47,08</strong>
        </div>
        <div className="findisp-summary-divider" />
        <div className="findisp-summary-item">
          <small>Pendente em Fila</small>
          <strong className="text-rose-700">R$ 860,00</strong>
        </div>
      </section>

      {/* Navegação por Abas do Módulo */}
      <nav className="findisp-tabs">
        <button
          className={`findisp-tab-btn ${tab === 'refunds' ? 'active' : ''}`}
          onClick={() => setTab('refunds')}
        >
          <Clock size={16} />
          <span>Fila de Aprovações & Solicitações</span>
          <span className="findisp-tab-badge">3</span>
        </button>

        <button
          className={`findisp-tab-btn ${tab === 'reconciliation-risk' ? 'active' : ''}`}
          onClick={() => setTab('reconciliation-risk')}
        >
          <Scale size={16} />
          <span>Conciliação & Risco Operacional</span>
          <span className="findisp-tab-badge">0,85%</span>
        </button>

        <button
          className={`findisp-tab-btn ${tab === 'chargebacks' ? 'active' : ''}`}
          onClick={() => setTab('chargebacks')}
        >
          <ShieldAlert size={16} />
          <span>Chargebacks & Contestações</span>
          <span className="findisp-tab-badge">Zona de Segurança</span>
        </button>

        <button
          className={`findisp-tab-btn ${tab === 'audit' ? 'active' : ''}`}
          onClick={() => setTab('audit')}
        >
          <History size={16} />
          <span>Trilha de Auditoria & Logs</span>
        </button>
      </nav>

      {/* CONTEÚDO DAS ABAS */}
      {tab === 'refunds' && (
        <section className="findisp-table-card">
          <div className="findisp-table-header">
            <h3>
              <Clock size={18} className="text-amber-600" />
              <span>Solicitações de Estorno & Fila de Alçadas</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Mostrando {filteredRefunds.length} de {enrichedRefunds.length} operações
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="findisp-table">
              <thead>
                <tr>
                  <th>Pedido / Ingresso</th>
                  <th>Cliente / Evento</th>
                  <th>Data / Hora</th>
                  <th>Valor</th>
                  <th>Pagamento</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Alçada</th>
                  <th style={{ textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="font-bold text-slate-900">{item.orderCode}</div>
                      <div className="text-[11px] font-semibold text-slate-500">{item.ticketSector}</div>
                    </td>
                    <td>
                      <div className="font-bold text-slate-800">{item.customerName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[220px]">{item.eventName}</div>
                    </td>
                    <td className="text-slate-600 font-medium">
                      {item.requestedAt}
                    </td>
                    <td>
                      <div className="font-extrabold text-slate-900">{money(item.amountCents)}</div>
                      <div className="text-[10px] text-slate-500">Líquido: {money(item.refundNetCents)}</div>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 font-bold text-xs uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {item.method === 'pix' && 'PIX'}
                        {item.method === 'credit' && 'Cartão'}
                        {item.method === 'voucher' && 'Voucher'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-slate-700 capitalize">{item.kind}</span>
                    </td>
                    <td>
                      {item.status === 'pending' && (
                        <span className="status-badge pending">Aguardando aprovação</span>
                      )}
                      {item.status === 'analysis' && (
                        <span className="status-badge analysis">Em análise</span>
                      )}
                      {item.status === 'completed' && (
                        <span className="status-badge completed">Executado</span>
                      )}
                      {item.status === 'processing' && (
                        <span className="status-badge processing">Processando</span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="status-badge rejected">Reprovado</span>
                      )}
                    </td>
                    <td>
                      <span className={`alcada-badge ${item.alcadaLevel === 'alcada2' ? 'manager' : item.alcadaLevel === 'alcada3' ? 'director' : ''}`}>
                        {item.alcadaRole}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="action-btn-analyze"
                        onClick={() => openDrawer(item)}
                      >
                        <span>Analisar</span>
                        <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'reconciliation-risk' && (
        <section className="findisp-reconciliation-grid">
          {/* Card: Semáforo de Risco */}
          <article className="findisp-card">
            <div className="findisp-card-head">
              <h3>Risco Operacional & Chargeback</h3>
              <ShieldCheck size={18} className="text-emerald-600" />
            </div>
            <div className="chargeback-semaphore normal">
              <div>
                <small className="text-xs font-bold text-slate-500 uppercase">Taxa Atual de Chargeback</small>
                <strong>0,85%</strong>
                <p className="text-xs text-slate-600 mt-0.5">Meta aceitável de mercado: ≤ 1,00%</p>
              </div>
              <div className="text-right">
                <span className="semaphore-pill">🟢 NORMAL / DENTRO DA META</span>
                <p className="text-xs text-emerald-700 font-semibold mt-1">↓ 0,12 p.p. vs. mês anterior</p>
              </div>
            </div>
            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
              <strong>Zona de Segurança:</strong> Nenhuma bandeira (Visa/Mastercard) emitiu aviso de monitoramento de risco.
            </div>
          </article>

          {/* Card: Estornos por Forma de Pagamento */}
          <article className="findisp-card">
            <div className="findisp-card-head">
              <h3>Estornos por Meio de Pagamento</h3>
              <CircleDollarSign size={18} className="text-sky-600" />
            </div>
            <div>
              <div className="method-breakdown-row">
                <div className="method-breakdown-labels">
                  <span>PIX (Instantâneo)</span>
                  <strong>R$ 580,00 (1 operação · 50%)</strong>
                </div>
                <div className="method-bar-track">
                  <div className="method-bar-fill pix" style={{ width: '50%' }} />
                </div>
              </div>

              <div className="method-breakdown-row">
                <div className="method-breakdown-labels">
                  <span>Cartão de Crédito</span>
                  <strong>R$ 580,00 (1 operação · 50%)</strong>
                </div>
                <div className="method-bar-track">
                  <div className="method-bar-fill card" style={{ width: '50%' }} />
                </div>
              </div>

              <div className="method-breakdown-row">
                <div className="method-breakdown-labels">
                  <span>Preservado em Voucher</span>
                  <strong className="text-emerald-700">R$ 348,00 (30% retido)</strong>
                </div>
                <div className="method-bar-track">
                  <div className="method-bar-fill voucher" style={{ width: '30%' }} />
                </div>
              </div>
            </div>
          </article>

          {/* Card: Matriz de Conciliação em 3 Vias */}
          <article className="findisp-card">
            <div className="findisp-card-head">
              <h3>Conciliação em 3 Vias (Tripartite)</h3>
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-900">1. Provedor / Gateway (Pagar.me / Stone)</span>
                <span className="font-extrabold text-emerald-700">✓ 100% Conciliado</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-900">2. Ledger Contábil ERP (Append-only)</span>
                <span className="font-extrabold text-emerald-700">✓ Lançamentos OK</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-900">3. Extrato Bancário / Tesouraria</span>
                <span className="font-extrabold text-emerald-700">✓ Saldo em Conta Batido</span>
              </div>
            </div>
          </article>
        </section>
      )}

      {tab === 'chargebacks' && (
        <section className="findisp-table-card">
          <div className="findisp-table-header">
            <h3>
              <ShieldAlert size={18} className="text-rose-600" />
              <span>Contestações e Chargebacks em Aberto</span>
            </h3>
            <button className="findisp-btn primary" onClick={() => flash('Abertura de contestação manual habilitada.')}>
              <Plus size={14} />
              <span>Nova Contestação</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="findisp-table">
              <thead>
                <tr>
                  <th>Código / Pedido</th>
                  <th>Valor Contestado</th>
                  <th>Bandeira / Adquirente</th>
                  <th>Motivo Alegado</th>
                  <th>Prazo de Defesa (SLA)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold text-slate-900">#CHG-99812 · Pedido #153900</td>
                  <td className="font-extrabold text-rose-700">R$ 350,00</td>
                  <td>Mastercard · Stone</td>
                  <td>Não reconhecimento de transação</td>
                  <td className="text-amber-800 font-bold">2 dias restantes (18/07)</td>
                  <td><span className="status-badge pending">Em Defesa</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="findisp-btn secondary text-xs py-1" onClick={() => flash('Dossiê com IP, Geolocation e Ingressos gerado para envio à adquirente.')}>
                      Enviar Evidências
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'audit' && (
        <section className="findisp-table-card">
          <div className="findisp-table-header">
            <h3>
              <History size={18} className="text-slate-700" />
              <span>Trilha de Auditoria & Logs de Operações Financeiras</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">Imutável · Append-only</span>
          </div>
          <div className="overflow-x-auto">
            <table className="findisp-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Operador / Usuário</th>
                  <th>Operação / Evento</th>
                  <th>Origem / IP</th>
                  <th>Status Contábil</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold text-slate-800">16/07/2026 10:15:22</td>
                  <td>Carlos Silva (Gerente)</td>
                  <td>Iniciou análise de estorno no Pedido #154231 (R$ 580,00)</td>
                  <td>ERP Web (187.54.12.9)</td>
                  <td><span className="status-badge analysis">Auditado</span></td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800">14/07/2026 14:45:01</td>
                  <td>Ledger Engine (Automático)</td>
                  <td>Lançamento de reversão contábil do lote #9912 gerado</td>
                  <td>Sistema Backend</td>
                  <td><span className="status-badge completed">Contabilizado</span></td>
                </tr>
                <tr>
                  <td className="font-bold text-slate-800">14/07/2026 14:42:19</td>
                  <td>Gateway Stone (Webhook)</td>
                  <td>Confirmação de liquidação de estorno PIX #77182930491029</td>
                  <td>API Webhook</td>
                  <td><span className="status-badge completed">Conciliado</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* DRAWER LATERAL DE ANÁLISE DE ESTORNO */}
      {isDrawerOpen && selectedRefund && (
        <div className="findisp-drawer-backdrop" onClick={closeDrawer}>
          <div className="findisp-drawer" onClick={e => e.stopPropagation()}>
            <div className="findisp-drawer-header">
              <div>
                <h2>Análise de Estorno {selectedRefund.orderCode}</h2>
                <div className="flex items-center gap-2">
                  <span className="status-badge analysis">{selectedRefund.status}</span>
                  <span className="text-xs text-slate-500">{selectedRefund.requestedAt}</span>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="findisp-drawer-body">
              {/* Dados do Cliente e Ingresso */}
              <div className="drawer-section">
                <h4>Dados da Compra & Cliente</h4>
                <div className="text-xs flex flex-col gap-1 text-slate-700">
                  <div><strong>Cliente:</strong> {selectedRefund.customerName} ({selectedRefund.customerCpf})</div>
                  <div><strong>Contato:</strong> {selectedRefund.customerEmail} · {selectedRefund.customerPhone}</div>
                  <div><strong>Evento:</strong> {selectedRefund.eventName}</div>
                  <div><strong>Ingresso:</strong> {selectedRefund.ticketCode} ({selectedRefund.ticketSector})</div>
                </div>
              </div>

              {/* Decomposição Financeira Centavo a Centavo */}
              <div className="drawer-section">
                <h4>Decomposição Financeira do Estorno</h4>
                <div className="drawer-financial-breakdown">
                  <div className="breakdown-row">
                    <span className="text-slate-600">Valor Original da Compra:</span>
                    <strong className="text-slate-900">{money(selectedRefund.amountCents)}</strong>
                  </div>
                  <div className="breakdown-row">
                    <span className="text-amber-800">Taxa de Conveniência (Retida):</span>
                    <strong className="text-amber-800">-{money(selectedRefund.serviceFeeCents)}</strong>
                  </div>
                  <div className="breakdown-row total">
                    <span className="font-extrabold text-slate-900">Valor Efetivo a Devolver:</span>
                    <strong className="font-extrabold text-emerald-700">{money(selectedRefund.refundNetCents)}</strong>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded">
                    <strong>Meio de Pagamento Original:</strong> {selectedRefund.method.toUpperCase()} (Ref: {selectedRefund.gatewayRef})
                  </div>
                </div>
              </div>

              {/* Alçada e Motivo */}
              <div className="drawer-section">
                <h4>Alçada de Aprovação & Motivo</h4>
                <div className="text-xs text-slate-700 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="alcada-badge manager">{selectedRefund.alcadaRole}</span>
                    <span className="text-[11px] text-slate-500 font-semibold">{selectedRefund.alcadaRule}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <strong>Motivo Declarado:</strong> {selectedRefund.reason}
                  </div>
                </div>
              </div>

              {/* Linha do Tempo e Histórico */}
              <div className="drawer-section">
                <h4>Histórico da Solicitação & SLA</h4>
                <div className="drawer-timeline">
                  {selectedRefund.history.map((h, idx) => (
                    <div key={idx} className="timeline-step">
                      <div className="timeline-time">{h.time}</div>
                      <div className="timeline-desc">
                        <strong>{h.user} ({h.origin})</strong>
                        <p>{h.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="findisp-drawer-footer">
              <button
                className="findisp-btn secondary flex-1"
                onClick={() => handleRejectRefund(selectedRefund)}
              >
                <X size={14} />
                <span>Reprovar</span>
              </button>
              <button
                className="findisp-btn ai flex-1"
                onClick={() => handleConvertToVoucher(selectedRefund)}
              >
                <Wallet size={14} />
                <span>Gerar Voucher (+5%)</span>
              </button>
              <button
                className="findisp-btn primary flex-1"
                onClick={() => handleApproveRefund(selectedRefund)}
              >
                <CheckCircle2 size={14} />
                <span>Aprovar Estorno</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL WIZARD: NOVO ESTORNO EM 5 ETAPAS */}
      {showNewRefundWizard && (
        <div className="findisp-drawer-backdrop" onClick={() => setShowNewRefundWizard(false)}>
          <div
            className="bg-white rounded-xl max-w-xl w-full mx-4 overflow-hidden shadow-2xl border border-slate-200 my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-sky-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Criar Nova Solicitação de Estorno (Protegida)</h3>
              </div>
              <button onClick={() => setShowNewRefundWizard(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 text-xs text-slate-700 flex flex-col gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">1. Localizar Pedido / Código do Ingresso</label>
                <input
                  type="text"
                  placeholder="Ex: #154990 ou ING-VIP-88123"
                  className="w-full p-2 border border-slate-300 rounded font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">2. Motivo do Estorno</label>
                <textarea
                  rows={2}
                  placeholder="Descreva a justificativa para registro de auditoria..."
                  className="w-full p-2 border border-slate-300 rounded text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">3. Modalidade de Restituição</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" className="p-2.5 rounded border border-sky-600 bg-sky-50 text-sky-900 font-bold text-center">
                    💰 Devolução PIX/Cartão
                  </button>
                  <button type="button" className="p-2.5 rounded border border-slate-300 bg-white text-slate-700 font-bold text-center hover:bg-slate-50">
                    🎟️ Voucher (+5% Bônus)
                  </button>
                  <button type="button" className="p-2.5 rounded border border-slate-300 bg-white text-slate-700 font-bold text-center hover:bg-slate-50">
                    🔄 Crédito em Conta
                  </button>
                </div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] leading-relaxed">
                <strong>⚠️ Aviso de Segurança Financeira:</strong> Esta operação gera lançamentos auditáveis no Ledger contábil append-only e não poderá ser desfeita automaticamente após confirmação de alçada.
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                className="findisp-btn secondary"
                onClick={() => setShowNewRefundWizard(false)}
              >
                Cancelar
              </button>
              <button
                className="findisp-btn primary"
                onClick={() => {
                  flash('Solicitação de estorno submetida para alçada de aprovação!')
                  setShowNewRefundWizard(false)
                }}
              >
                Registrar Solicitação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AlertCircleIcon({ size }: { size?: number }) {
  return <AlertTriangle size={size} />
}
