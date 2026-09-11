import React, { useState, useEffect, useMemo } from 'react'
import { consumeFinanceDrilldown } from '../utils/financeDrilldown'
import {
  Scale, Landmark, Filter, AlertCircle, ArrowUpRight, CreditCard,
  ScanLine, Download, Pencil, CheckCircle2, ArrowLeft, Check,
  RotateCw, Search, FileText, ShieldAlert, Sparkles, AlertTriangle,
  ChevronRight, Clock, Coins, Lock, RefreshCw, X, ExternalLink,
  Layers, CheckSquare
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  fetchReconciliationSummary,
  fetchReconciliationTransactions,
  runAutoMatching,
  resolveDivergence,
  settleToLedger,
  fetchAuditVoucher,
  DEFAULT_RECONCILIATION_TRANSACTIONS,
  DEFAULT_RECONCILIATION_SUMMARY,
  type ReconciliationTransaction,
  type ReconciliationSummaryIndicators,
  type AuditVoucher,
  type DivergenceStatus,
} from '../services/financeReconciliationApi'
import './finance-reconciliation-erp.css'

interface Props {
  events?: EventItem[]
  notify?: (message: string) => void
  onNavigate?: (page: any) => void
  onBack?: () => void
}

export default function FinanceReconciliationPage({ events = [], notify, onNavigate, onBack }: Props) {
  const [drilldown] = useState(() => consumeFinanceDrilldown('finance-reconciliation'))
  
  // Filtros
  const [selectedEventId, setSelectedEventId] = useState<number | undefined>(undefined)
  const [selectedBank, setSelectedBank] = useState<string>('Banco Santander')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [searchTerm, setSearchTerm] = useState<string>('')
  
  // Filtros de Extrato (Compatibilidade com tela original)
  const [filterPixIn, setFilterPixIn] = useState<boolean>(true)
  const [filterPixOut, setFilterPixOut] = useState<boolean>(true)
  const [filterTed, setFilterTed] = useState<boolean>(true)
  const [filterCards, setFilterCards] = useState<boolean>(true)
  const [filterBoleto, setFilterBoleto] = useState<boolean>(true)

  // Estado da API
  const [loading, setLoading] = useState<boolean>(false)
  const [summary, setSummary] = useState<ReconciliationSummaryIndicators>(DEFAULT_RECONCILIATION_SUMMARY)
  const [transactions, setTransactions] = useState<ReconciliationTransaction[]>(DEFAULT_RECONCILIATION_TRANSACTIONS)

  // Estados dos Modais
  const [autoMatchModalOpen, setAutoMatchModalOpen] = useState<boolean>(false)
  const [autoMatchProgress, setAutoMatchProgress] = useState<'idle' | 'running' | 'done'>('idle')
  const [autoMatchResult, setAutoMatchResult] = useState<any>(null)

  const [mdrModalOpen, setMdrModalOpen] = useState<boolean>(false)
  const [selectedTxForMdr, setSelectedTxForMdr] = useState<ReconciliationTransaction | null>(null)
  const [customMdrInput, setCustomMdrInput] = useState<string>('')

  const [voucherModalOpen, setVoucherModalOpen] = useState<boolean>(false)
  const [currentVoucher, setCurrentVoucher] = useState<AuditVoucher | null>(null)
  const [voucherLoading, setVoucherLoading] = useState<boolean>(false)

  const [manualMatchModalOpen, setManualMatchModalOpen] = useState<boolean>(false)
  const [selectedTxForMatch, setSelectedTxForMatch] = useState<ReconciliationTransaction | null>(null)
  const [manualOrderInput, setManualOrderInput] = useState<string>('')

  const formatBRL = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  // Carrega dados da API
  const loadData = async () => {
    setLoading(true)
    try {
      const [sumRes, txRes] = await Promise.all([
        fetchReconciliationSummary({
          eventId: selectedEventId,
          bankName: selectedBank === 'Todos os Bancos' ? undefined : selectedBank,
        }),
        fetchReconciliationTransactions({
          eventId: selectedEventId,
          bankName: selectedBank === 'Todos os Bancos' ? undefined : selectedBank,
          status: statusFilter === 'todos' ? undefined : statusFilter,
          search: searchTerm || undefined,
        }),
      ])

      if (sumRes.ok && sumRes.indicators) setSummary(sumRes.indicators)
      if (txRes.ok && txRes.items && txRes.items.length > 0) {
        setTransactions(txRes.items)
      }
    } catch (err: any) {
      console.warn('Usando dados em memória/offline:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedEventId, selectedBank, statusFilter, searchTerm])

  // Filtro local adicional de tipos de transação
  const visibleTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (!filterPixIn && tx.paymentMethod === 'pix' && tx.gatewayGrossCents > 0) return false
      if (!filterPixOut && tx.paymentMethod === 'pix' && tx.gatewayGrossCents < 0) return false
      if (!filterCards && (tx.paymentMethod === 'credit_card' || tx.paymentMethod === 'credit_card_installments' || tx.paymentMethod === 'debit_card')) return false
      if (!filterBoleto && tx.paymentMethod === 'boleto') return false
      return true
    })
  }, [transactions, filterPixIn, filterPixOut, filterCards, filterBoleto])

  // Ação: Conciliação Automática em Lote
  const handleTriggerAutoMatch = async () => {
    setAutoMatchModalOpen(true)
    setAutoMatchProgress('running')
    try {
      const res = await runAutoMatching({ eventId: selectedEventId, toleranceCents: 2 })
      setAutoMatchResult(res.summary)
      setAutoMatchProgress('done')
      notify?.(res.message || 'Conciliação automática finalizada com sucesso!')
      await loadData()
    } catch (err: any) {
      setAutoMatchProgress('idle')
      notify?.(`Erro no motor de conciliação: ${err.message}`)
    }
  }

  // Ação: Baixar Lançamento no Ledger
  const handleSettleToLedger = async (tx: ReconciliationTransaction) => {
    try {
      const res = await settleToLedger({ transactionId: tx.id })
      notify?.(res.message || 'Liquidação lançada com sucesso no Ledger contábil!')
      await loadData()
    } catch (err: any) {
      notify?.(`Falha na baixa: ${err.message}`)
    }
  }

  // Ação: Abrir Modal de Ajuste MDR
  const handleOpenMdrModal = (tx: ReconciliationTransaction) => {
    setSelectedTxForMdr(tx)
    setCustomMdrInput(String(tx.contractedMdrPct))
    setMdrModalOpen(true)
  }

  // Ação: Confirmar Ajuste MDR
  const handleConfirmMdrAdjustment = async () => {
    if (!selectedTxForMdr) return
    try {
      const adjustedPct = parseFloat(customMdrInput) || selectedTxForMdr.contractedMdrPct
      const res = await resolveDivergence({
        transactionId: selectedTxForMdr.id,
        action: 'adjust_mdr',
        adjustedMdrPct: adjustedPct,
        notes: `Contestação homologada: taxa corrigida para ${adjustedPct.toFixed(2)}% contratual.`,
      })
      notify?.(res.message || 'Ajuste de taxa MDR processado com sucesso!')
      setMdrModalOpen(false)
      await loadData()
    } catch (err: any) {
      notify?.(`Erro ao ajustar taxa: ${err.message}`)
    }
  }

  // Ação: Abrir Comprovante de Auditoria
  const handleOpenVoucher = async (tx: ReconciliationTransaction) => {
    setVoucherLoading(true)
    setVoucherModalOpen(true)
    try {
      const res = await fetchAuditVoucher(tx.id)
      if (res.ok) {
        setCurrentVoucher(res.voucher)
      }
    } catch (err: any) {
      notify?.(`Falha ao abrir espelho de conciliação: ${err.message}`)
    } finally {
      setVoucherLoading(false)
    }
  }

  // Ação: Abrir Modal de Vínculo Manual
  const handleOpenManualMatch = (tx: ReconciliationTransaction) => {
    setSelectedTxForMatch(tx)
    setManualOrderInput(tx.orderCode || '')
    setManualMatchModalOpen(true)
  }

  // Ação: Confirmar Vínculo Manual
  const handleConfirmManualMatch = async () => {
    if (!selectedTxForMatch) return
    try {
      const res = await resolveDivergence({
        transactionId: selectedTxForMatch.id,
        action: 'manual_match',
        orderCode: manualOrderInput || `DI-${Date.now().toString().slice(-6)}`,
        notes: 'Vínculo manual estabelecido com pedido conferido.',
      })
      notify?.(res.message || 'Vínculo manual efetuado com sucesso!')
      setManualMatchModalOpen(false)
      await loadData()
    } catch (err: any) {
      notify?.(`Erro ao vincular pedido: ${err.message}`)
    }
  }

  // Exportação CSV
  const handleExport = () => {
    const csvContent = [
      'Codigo;Data;Pedido;Comprador;Meio_Pagamento;Gateway;NSU;TID;Valor_Bruto;Taxa_MDR_Cobrada;Diferenca_Taxa;Valor_Liquido;Status_Divergencia;Status_Ledger',
      ...visibleTransactions.map(
        t =>
          `"${t.code}";"${t.occurredAt}";"${t.orderCode || 'N/A'}";"${t.buyerName}";"${t.paymentMethodLabel}";"${t.gateway}";"${t.nsu}";"${t.tid}";"${(t.gatewayGrossCents / 100).toFixed(2)}";"${t.chargedMdrPct}%";"${(t.feeDifferenceCents / 100).toFixed(2)}";"${(t.netLiquidCents / 100).toFixed(2)}";"${t.statusLabel}";"${t.level3SettlementLedger.label}"`
      ),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conciliacao-erp-gateways-${selectedBank.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    notify?.('Relatório completo de conciliação bancária e gateways exportado em CSV com sucesso!')
  }

  const getStatusPillClass = (status: DivergenceStatus) => {
    switch (status) {
      case 'CONCILIADO':
        return 'status-pill conciliado'
      case 'VALOR_DIVERGENTE':
        return 'status-pill valor_divergente'
      case 'TAXA_DIVERGENTE':
        return 'status-pill taxa_divergente'
      case 'LIQUIDACAO_AUSENTE':
        return 'status-pill liquidacao_ausente'
      case 'PEDIDO_NAO_LOCALIZADO':
        return 'status-pill pedido_nao_localizado'
      case 'DUPLICIDADE':
        return 'status-pill duplicidade'
      case 'ESTORNO':
        return 'status-pill estorno'
      case 'CHARGEBACK':
        return 'status-pill chargeback'
      case 'REQUER_ANALISE':
        return 'status-pill requer_analise'
      default:
        return 'status-pill'
    }
  }

  return (
    <div className="ds-finance-page-wrapper w-full space-y-4 ds-reconciliation-page-root">
      
      {/* Botão de Retorno */}
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={() => (onBack ? onBack() : onNavigate ? onNavigate('finance-dashboard') : window.history.back())}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-blue-600" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>
      </div>

      {/* Header Premium do ERP */}
      <div className="rec-header-banner">
        <div className="rec-header-top">
          <div className="rec-header-title-box">
            <div className="rec-header-icon">
              <Scale size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1>Conciliação Bancária & Gateways</h1>
                <span className="rec-header-badge">Fase 26.17.9.4.3 · Núcleo ERP Financeiro</span>
              </div>
              <p className="rec-header-desc">
                Batimento tripartite em tempo real: <strong>Pedido DiskIngressos × Autorização do Gateway × Liquidação Bancária D+N</strong> com baixa contábil automática para o Ledger do evento.
              </p>
            </div>
          </div>

          <div className="rec-header-actions">
            <button
              className="rec-btn-primary"
              onClick={handleTriggerAutoMatch}
              title="Executar cruzamento automatizado de regras e baixas no Ledger"
            >
              <Sparkles size={15} />
              <span>Executar Conciliação Automática</span>
            </button>

            <button className="rec-btn-secondary" onClick={handleExport} title="Exportar dados filtrados em planilha CSV">
              <Download size={15} />
              <span>Exportar CSV</span>
            </button>

            <button
              className="rec-btn-secondary"
              onClick={loadData}
              title="Atualizar dados"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Cards de Indicadores KPI */}
      <div className="rec-kpi-grid">
        
        {/* Card 1: Taxa de Batimento Geral */}
        <div className="rec-kpi-card">
          <div className="rec-kpi-top">
            <span className="rec-kpi-label">Batimento Geral</span>
            <div className="rec-kpi-icon bg-blue-50 text-blue-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="rec-kpi-val text-blue-600">
            {summary?.globalReconciliationPct ?? 98.4}%
          </div>
          <div className="rec-kpi-sub">
            <span>N1: {summary?.level1OrderGatewayPct ?? 99.4}% · N2: {summary?.level2GatewaySettlementPct ?? 97.8}%</span>
          </div>
        </div>

        {/* Card 2: Volume Liquidado & Conciliado */}
        <div className="rec-kpi-card">
          <div className="rec-kpi-top">
            <span className="rec-kpi-label">Volume Liquidado</span>
            <div className="rec-kpi-icon bg-emerald-50 text-emerald-600">
              <Coins size={16} />
            </div>
          </div>
          <div className="rec-kpi-val text-emerald-600">
            {formatBRL(summary?.totalReconciledCents ?? 142865000)}
          </div>
          <div className="rec-kpi-sub">
            <Check size={12} className="text-emerald-500" />
            <span>Disponível no Ledger do Evento</span>
          </div>
        </div>

        {/* Card 3: Recebíveis em Agenda D+N */}
        <div className="rec-kpi-card">
          <div className="rec-kpi-top">
            <span className="rec-kpi-label">Em Agenda (D+N)</span>
            <div className="rec-kpi-icon bg-amber-50 text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="rec-kpi-val text-amber-600">
            {formatBRL(summary?.pendingSettlementCents ?? 38420000)}
          </div>
          <div className="rec-kpi-sub">
            <span>Aguardando liquidação programada</span>
          </div>
        </div>

        {/* Card 4: Divergências Ativas */}
        <div className="rec-kpi-card">
          <div className="rec-kpi-top">
            <span className="rec-kpi-label">Divergências Ativas</span>
            <div className="rec-kpi-icon bg-red-50 text-red-600">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="rec-kpi-val text-red-600">
            {summary?.activeDivergencesCount ?? 5} lançamentos
          </div>
          <div className="rec-kpi-sub text-red-500">
            <span>{formatBRL(summary?.activeDivergencesCents ?? 1485000)} sob análise</span>
          </div>
        </div>

        {/* Card 5: Sobretaxas MDR Identificadas */}
        <div className="rec-kpi-card">
          <div className="rec-kpi-top">
            <span className="rec-kpi-label">Sobretaxas MDR</span>
            <div className="rec-kpi-icon bg-purple-50 text-purple-600">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="rec-kpi-val text-purple-600">
            {formatBRL(summary?.excessMdrFeesCents ?? 1992)}
          </div>
          <div className="rec-kpi-sub">
            <span>Para estorno pelas adquirentes</span>
          </div>
        </div>

      </div>

      {/* Esteira Visual dos 3 Níveis de Conciliação */}
      <div className="rec-pipeline-card">
        <div className="rec-pipeline-header">
          <div className="rec-pipeline-title">
            <Layers size={16} className="text-blue-600" />
            <span>Esteira do Ciclo Financeiro do Evento (SafeSaff ERP)</span>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Invariante: Somente valor 100% liquidado transita para o Saldo Disponível
          </span>
        </div>

        <div className="rec-pipeline-steps">
          
          <div className="rec-step-box">
            <div className="rec-step-header">
              <span className="rec-step-number">ETAPA 1</span>
              <ScanLine size={14} className="text-slate-400" />
            </div>
            <div className="rec-step-title">1. Venda do Ingresso</div>
            <div className="rec-step-desc">Pedido emitido com ingressos, taxas e cupons no DiskIngressos.</div>
            <div className="rec-step-status">
              <Check size={12} /> 100% Auditável
            </div>
          </div>

          <div className="rec-step-box">
            <div className="rec-step-header">
              <span className="rec-step-number">ETAPA 2</span>
              <CreditCard size={14} className="text-blue-500" />
            </div>
            <div className="rec-step-title">2. Gateway & Transação</div>
            <div className="rec-step-desc">Captura, NSU, TID, autorização e antifraude Stone/Cielo/Rede/Pix.</div>
            <div className="rec-step-status">
              <Check size={12} /> Nível 1: Batido
            </div>
          </div>

          <div className="rec-step-box">
            <div className="rec-step-header">
              <span className="rec-step-number">ETAPA 3</span>
              <Clock size={14} className="text-amber-500" />
            </div>
            <div className="rec-step-title">3. Agenda de Liquidação</div>
            <div className="rec-step-desc">D+0 (Pix), D+1 (Débito) e D+30 (Crédito) com retenção de taxa MDR.</div>
            <div className="rec-step-status text-amber-600">
              <Check size={12} /> Nível 2: Validando
            </div>
          </div>

          <div className="rec-step-box active">
            <div className="rec-step-header">
              <span className="rec-step-number">ETAPA 4</span>
              <Lock size={14} className="text-blue-600" />
            </div>
            <div className="rec-step-title">4. Baixa no Ledger</div>
            <div className="rec-step-desc">Partidas dobradas contábeis imutáveis (D: Banco, C: Recebíveis).</div>
            <div className="rec-step-status text-blue-600">
              <Check size={12} /> Nível 3: Imutável
            </div>
          </div>

          <div className="rec-step-box">
            <div className="rec-step-header">
              <span className="rec-step-number">ETAPA 5</span>
              <Coins size={14} className="text-emerald-500" />
            </div>
            <div className="rec-step-title">5. Split & Repasse</div>
            <div className="rec-step-desc">Divisão automática do saldo do evento para a conta do produtor.</div>
            <div className="rec-step-status text-emerald-600">
              <Check size={12} /> Liberado para Saque
            </div>
          </div>

        </div>
      </div>

      {/* 2-Column Main Layout: Barra Lateral de Filtros & Central de Divergências */}
      <div className="ds-reconciliation-container">
        
        {/* Coluna Esquerda: Filtros de Banco, Evento e Extrato */}
        <div className="ds-reconciliation-left-card">
          
          {/* Seletor de Evento */}
          <div className="ds-reconciliation-section-title">
            <CalendarIcon size={16} style={{ color: '#2563eb' }} />
            <span>Evento do Produtor</span>
          </div>
          <select
            className="w-full text-xs font-semibold p-2 mb-4 border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-500"
            value={selectedEventId || ''}
            onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Todos os Eventos</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>

          <div className="ds-reconciliation-divider" />

          {/* Seletor de Banco */}
          <div className="ds-reconciliation-section-title">
            <Landmark size={16} style={{ color: '#2563eb' }} />
            <span>Selecionar Banco / Conta</span>
          </div>

          <div className="ds-reconciliation-radio-list">
            {['Banco Santander', 'Banco Itaú', 'Banco do Brasil', 'Banco Bradesco', 'Todos os Bancos'].map((bank) => (
              <label
                key={bank}
                className={`ds-reconciliation-radio-item ${selectedBank === bank ? 'active' : ''}`}
                onClick={() => setSelectedBank(bank)}
              >
                <input
                  type="radio"
                  name="selected_bank"
                  checked={selectedBank === bank}
                  onChange={() => setSelectedBank(bank)}
                />
                <span>{bank}</span>
              </label>
            ))}
          </div>

          <div className="ds-reconciliation-divider" />

          {/* Filtros de Extrato */}
          <div className="ds-reconciliation-section-title">
            <Filter size={16} style={{ color: '#2563eb' }} />
            <span>Filtros de Extrato</span>
          </div>

          <div className="ds-reconciliation-checkbox-list">
            <label className="ds-reconciliation-checkbox-item">
              <input
                type="checkbox"
                checked={filterPixIn}
                onChange={(e) => setFilterPixIn(e.target.checked)}
              />
              <span>PIX Recebido</span>
            </label>

            <label className="ds-reconciliation-checkbox-item">
              <input
                type="checkbox"
                checked={filterPixOut}
                onChange={(e) => setFilterPixOut(e.target.checked)}
              />
              <span>PIX Pago</span>
            </label>

            <label className="ds-reconciliation-checkbox-item">
              <input
                type="checkbox"
                checked={filterTed}
                onChange={(e) => setFilterTed(e.target.checked)}
              />
              <span>TED</span>
            </label>

            <label className="ds-reconciliation-checkbox-item">
              <input
                type="checkbox"
                checked={filterCards}
                onChange={(e) => setFilterCards(e.target.checked)}
              />
              <span>Cartão de Crédito/Débito</span>
            </label>

            <label className="ds-reconciliation-checkbox-item">
              <input
                type="checkbox"
                checked={filterBoleto}
                onChange={(e) => setFilterBoleto(e.target.checked)}
              />
              <span>Boleto Bancário</span>
            </label>
          </div>

          <div className="ds-reconciliation-divider" />

          {/* Filtro por Tipo de Divergência */}
          <div className="ds-reconciliation-section-title">
            <ShieldAlert size={16} style={{ color: '#ea580c' }} />
            <span>Filtro por Divergência</span>
          </div>

          <select
            className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos os Status</option>
            <option value="CONCILIADO">Somente Conciliados</option>
            <option value="VALOR_DIVERGENTE">Valor divergente</option>
            <option value="TAXA_DIVERGENTE">Taxa divergente (MDR)</option>
            <option value="LIQUIDACAO_AUSENTE">Liquidação ausente</option>
            <option value="PEDIDO_NAO_LOCALIZADO">Pedido não localizado</option>
            <option value="DUPLICIDADE">Duplicidade de pagamento</option>
            <option value="ESTORNO">Estorno pendente</option>
            <option value="CHARGEBACK">Chargeback / Disputa</option>
            <option value="REQUER_ANALISE">Requer análise de risco</option>
          </select>

        </div>

        {/* Coluna Direita: Central de Divergências & Batimento Tripartite */}
        <div className="rec-main-section">
          
          {/* Toolbar de Busca e Resumo */}
          <div className="rec-toolbar">
            <div className="rec-search-box">
              <Search size={15} className="rec-search-icon" />
              <input
                type="text"
                placeholder="Buscar por Pedido (#DI-...), NSU, TID, Adquirente ou Comprador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">
                Exibindo <strong>{visibleTransactions.length}</strong> lançamentos no {selectedBank}
              </span>
            </div>
          </div>

          {/* Header da Central */}
          <div className="ds-divergence-header">
            <div className="ds-divergence-title">
              <AlertCircle size={20} style={{ color: '#ea580c' }} />
              <span>Central de Conciliação, Divergências & Baixas</span>
            </div>
            <span className="ds-divergence-badge">
              {visibleTransactions.filter(t => t.status !== 'CONCILIADO').length} pendências ativas
            </span>
          </div>

          {/* Lista de Transações com Batimento dos 3 Níveis */}
          {visibleTransactions.map((tx) => (
            <div key={tx.id} className="ds-divergence-card">
              
              {/* Ícone Indicador */}
              <div
                className="ds-divergence-icon-wrap"
                style={{
                  background: tx.status === 'CONCILIADO' ? '#ecfdf5' : undefined,
                  borderColor: tx.status === 'CONCILIADO' ? '#a7f3d0' : undefined,
                  color: tx.status === 'CONCILIADO' ? '#059669' : undefined,
                }}
              >
                {tx.paymentMethod === 'pix' && <ArrowUpRight size={20} />}
                {(tx.paymentMethod === 'credit_card' || tx.paymentMethod === 'credit_card_installments' || tx.paymentMethod === 'debit_card') && (
                  <CreditCard size={20} />
                )}
                {tx.paymentMethod === 'boleto' && <ScanLine size={20} />}
              </div>

              {/* Conteúdo Principal */}
              <div className="ds-divergence-content">
                
                {/* Linha Superior: Pedido, Meio e Status */}
                <div className="ds-divergence-top-row">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="ds-divergence-card-title">
                      {new Date(tx.occurredAt).toLocaleDateString('pt-BR')} · {tx.paymentMethodLabel} · {formatBRL(tx.gatewayGrossCents)}
                    </span>
                    {tx.orderCode && (
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                        {tx.orderCode}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-medium">
                      ({tx.buyerName})
                    </span>
                  </div>

                  <span className={getStatusPillClass(tx.status)}>
                    {tx.status === 'CONCILIADO' ? <Check size={12} /> : <AlertTriangle size={12} />}
                    {tx.statusLabel}
                  </span>
                </div>

                {/* Subtítulo: Gateway, NSU e Taxa MDR */}
                <div className="flex items-center gap-4 text-xs text-slate-600 my-1 flex-wrap">
                  <span><strong>Gateway:</strong> {tx.gateway}</span>
                  <span><strong>NSU:</strong> <span className="font-mono">{tx.nsu}</span></span>
                  <span><strong>TID:</strong> <span className="font-mono text-slate-500">{tx.tid}</span></span>
                  <span>
                    <strong>Taxa MDR:</strong> {tx.chargedMdrPct.toFixed(2)}%
                    {tx.feeDifferenceCents > 0 && (
                      <span className="ml-1 text-red-600 font-bold">
                        (+{formatBRL(tx.feeDifferenceCents)} sobretaxa)
                      </span>
                    )}
                  </span>
                  <span><strong>Líquido:</strong> <span className="text-emerald-700 font-bold">{formatBRL(tx.netLiquidCents)}</span></span>
                </div>

                {/* Descrição e Divergência */}
                <p className="ds-divergence-desc">
                  {tx.divergenceReason ? (
                    <>
                      <strong>Divergência:</strong> {tx.divergenceReason}
                    </>
                  ) : (
                    <span>Batimento perfeito: pedido no sistema, autorização no gateway e crédito bancário conferidos.</span>
                  )}
                </p>

                {/* Badges dos 3 Níveis de Conciliação */}
                <div className="flex items-center gap-2 my-2 flex-wrap text-xs">
                  
                  {/* Nível 1: Pedido x Gateway */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    tx.level1OrderGateway.status === 'ok' ? 'badge-l3' : 'badge-l1'
                  }`}>
                    <strong>N1 (Pedido × Gateway):</strong> {tx.level1OrderGateway.label}
                  </span>

                  {/* Nível 2: Gateway x Liquidação */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    tx.level2GatewaySettlement.status === 'ok' ? 'badge-l3' : 'badge-l2'
                  }`}>
                    <strong>N2 (Gateway × Liquidação):</strong> {tx.level2GatewaySettlement.label}
                  </span>

                  {/* Nível 3: Liquidação x Ledger */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                    tx.level3SettlementLedger.status === 'posted' ? 'badge-l3' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    <strong>N3 (Liquidação × Ledger):</strong> {tx.level3SettlementLedger.label}
                  </span>

                </div>

                {/* Sugestão de Resolução ou Botões de Ação */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 flex-wrap gap-2">
                  
                  {tx.status !== 'CONCILIADO' && tx.divergenceSuggestion ? (
                    <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold">
                      <AlertCircle size={14} />
                      <span>{tx.divergenceSuggestion}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                      <CheckCircle2 size={14} />
                      <span>Conciliado por {tx.reconciledBy || 'Motor Automático'} em {tx.reconciledAt ? new Date(tx.reconciledAt).toLocaleDateString('pt-BR') : 'hoje'}</span>
                    </div>
                  )}

                  {/* Botões Operacionais por Item */}
                  <div className="flex items-center gap-2 ml-auto">
                    
                    {/* Botão Ajustar MDR */}
                    {tx.status === 'TAXA_DIVERGENTE' && (
                      <button
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                        onClick={() => handleOpenMdrModal(tx)}
                      >
                        <Pencil size={12} />
                        <span>Ajustar Taxa MDR</span>
                      </button>
                    )}

                    {/* Botão Vínculo Manual */}
                    {(tx.status === 'VALOR_DIVERGENTE' || tx.status === 'PEDIDO_NAO_LOCALIZADO') && (
                      <button
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                        onClick={() => handleOpenManualMatch(tx)}
                      >
                        <Pencil size={12} />
                        <span>Vincular Manualmente</span>
                      </button>
                    )}

                    {/* Botão Baixar para Ledger */}
                    {tx.level3SettlementLedger.status !== 'posted' && tx.status !== 'CONCILIADO' && (
                      <button
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                        onClick={() => handleSettleToLedger(tx)}
                      >
                        <Lock size={12} />
                        <span>Baixar no Ledger</span>
                      </button>
                    )}

                    {/* Botão Ver Comprovante Auditável */}
                    <button
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                      onClick={() => handleOpenVoucher(tx)}
                      title="Exibir espelho auditável com partidas dobradas e hash digital"
                    >
                      <FileText size={12} />
                      <span>Espelho / Auditoria</span>
                    </button>

                  </div>

                </div>

              </div>

            </div>
          ))}

          {/* Barra de Ações Inferior */}
          <div className="ds-divergence-actions-bar">
            <button className="ds-btn-outline" onClick={handleExport}>
              <Download size={16} />
              <span>Exportar Batimento</span>
            </button>

            <button
              className="ds-btn-orange"
              onClick={() => {
                if (visibleTransactions.length > 0) {
                  handleOpenManualMatch(visibleTransactions[0])
                } else {
                  notify?.('Nenhum item selecionado para ajuste manual.')
                }
              }}
            >
              <Pencil size={16} />
              <span>Ajustar Manualmente</span>
            </button>

            <button className="ds-btn-green" onClick={handleTriggerAutoMatch}>
              <CheckCircle2 size={16} />
              <span>Conciliar Todos os Pendentes</span>
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: MOTOR DE CONCILIAÇÃO AUTOMÁTICA */}
      {/* ========================================================================= */}
      {autoMatchModalOpen && (
        <div className="rec-modal-overlay">
          <div className="rec-modal-container">
            <div className="rec-modal-header">
              <h2>
                <Sparkles size={18} className="text-blue-600" />
                Motor de Conciliação Automática & Baixa no Ledger
              </h2>
              <button
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                onClick={() => setAutoMatchModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="rec-modal-body">
              {autoMatchProgress === 'running' ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <RefreshCw size={36} className="text-blue-600 animate-spin" />
                  <div className="text-sm font-bold text-slate-800">
                    Cruzando bases de Pedidos, Adquirentes e Extratos Bancários...
                  </div>
                  <p className="text-xs text-slate-500 text-center max-w-md">
                    Verificando NSU, TID, códigos de autorização e conferência de alíquotas MDR contratuais.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle2 size={24} className="text-emerald-600 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900">Batimento Concluído com Êxito</h4>
                      <p className="text-xs text-emerald-700">
                        O algoritmo identificou correspondências e efetuou a baixa automática com postagem no Ledger.
                      </p>
                    </div>
                  </div>

                  {autoMatchResult && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                        <span className="text-slate-500 block font-medium">Itens Processados:</span>
                        <span className="text-base font-bold text-slate-900">{autoMatchResult.processedCount}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                        <span className="text-slate-500 block font-medium">Itens Conciliados:</span>
                        <span className="text-base font-bold text-emerald-600">{autoMatchResult.matchedCount}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                        <span className="text-slate-500 block font-medium">Divergências Mantidas:</span>
                        <span className="text-base font-bold text-amber-600">{autoMatchResult.flaggedDivergencesCount}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                        <span className="text-slate-500 block font-medium">Lotes Postados no Ledger:</span>
                        <span className="text-base font-bold text-blue-600">{autoMatchResult.ledgerBatchesPostedCount}</span>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-slate-500 leading-relaxed">
                    <strong>Regras de Batimento Aplicadas:</strong>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Matching exato de NSU/TID com webhook de cobrança.</li>
                      <li>Tolerância de arredondamento de centavos (≤ R$ 0,02).</li>
                      <li>Baixa automática D+N de liquidações vencidas com confirmação bancária.</li>
                      <li>Isolamento de chargebacks e transações com score de risco alto.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="rec-modal-footer">
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                onClick={() => setAutoMatchModalOpen(false)}
              >
                Fechar e Visualizar Resultados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: AJUSTE DE TAXA MDR DIVERGENTE */}
      {/* ========================================================================= */}
      {mdrModalOpen && selectedTxForMdr && (
        <div className="rec-modal-overlay">
          <div className="rec-modal-container">
            <div className="rec-modal-header">
              <h2>
                <ShieldAlert size={18} className="text-amber-600" />
                Ajuste de Taxa MDR e Contestação com Adquirente
              </h2>
              <button
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                onClick={() => setMdrModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="rec-modal-body text-xs space-y-4">
              <p className="text-slate-600">
                A adquirente <strong>{selectedTxForMdr.acquirer}</strong> debitou uma taxa MDR divergente do contrato comercial firmado com a DiskIngressos.
              </p>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                <div>
                  <span className="text-slate-500 block font-medium">Taxa Contratada:</span>
                  <span className="text-sm font-bold text-emerald-600">{selectedTxForMdr.contractedMdrPct.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Taxa Cobrada:</span>
                  <span className="text-sm font-bold text-red-600">{selectedTxForMdr.chargedMdrPct.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Diferença a Estornar:</span>
                  <span className="text-sm font-bold text-amber-700">{formatBRL(selectedTxForMdr.feeDifferenceCents)}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Taxa Homologada para Conciliação (%):
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold"
                  value={customMdrInput}
                  onChange={(e) => setCustomMdrInput(e.target.value)}
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Ao confirmar, o SafeSaff compensará a diferença no saldo do produtor e gerará protocolo de ressarcimento contra a Stone/Cielo.
                </span>
              </div>
            </div>

            <div className="rec-modal-footer">
              <button
                className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold"
                onClick={() => setMdrModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                onClick={handleConfirmMdrAdjustment}
              >
                Homologar Ajuste e Conciliar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ESPELHO / COMPROVANTE DE AUDITORIA FORMAL */}
      {/* ========================================================================= */}
      {voucherModalOpen && (
        <div className="rec-modal-overlay">
          <div className="rec-modal-container max-w-2xl">
            <div className="rec-modal-header">
              <h2>
                <FileText size={18} className="text-blue-600" />
                Espelho Oficial de Conciliação Bancária & Ledger
              </h2>
              <button
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                onClick={() => setVoucherModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="rec-modal-body">
              {voucherLoading || !currentVoucher ? (
                <div className="py-12 text-center text-slate-500">
                  <RefreshCw size={28} className="animate-spin mx-auto mb-2 text-blue-600" />
                  Carregando espelho digital assinado...
                </div>
              ) : (
                <div className="voucher-paper space-y-3">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                    <div>
                      <div className="font-bold text-sm text-slate-900">DISKINGRESSOS TICKETING & ERP</div>
                      <div className="text-[11px] text-slate-500">Comprovante de Batimento Tripartite e Baixa Contábil</div>
                    </div>
                    <div className="voucher-seal">
                      <Lock size={12} /> CONCILIADO E AUDITADO
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><strong>Código:</strong> {currentVoucher.code}</div>
                    <div><strong>Emissão:</strong> {new Date(currentVoucher.issuedAt).toLocaleString('pt-BR')}</div>
                    <div><strong>Evento:</strong> {currentVoucher.event.title}</div>
                    <div><strong>Produtora:</strong> {currentVoucher.producer.name}</div>
                    <div><strong>Pedido:</strong> {currentVoucher.order.orderCode}</div>
                    <div><strong>Comprador:</strong> {currentVoucher.order.buyerName}</div>
                    <div><strong>Adquirente:</strong> {currentVoucher.gateway.name}</div>
                    <div><strong>NSU / TID:</strong> {currentVoucher.gateway.nsu} / {currentVoucher.gateway.tid}</div>
                  </div>

                  <div className="border-t border-b border-slate-200 py-2 my-2">
                    <div className="font-bold text-slate-800 mb-1">PARTIDAS DOBRADAS (LEDGER CONTÁBIL):</div>
                    {currentVoucher.doubleEntries.map((e, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] font-mono py-0.5">
                        <span><strong>{e.side}:</strong> {e.account}</span>
                        <span className="font-bold">{formatBRL(e.amountCents)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-500 break-all">
                    <strong>Assinatura Digital SHA-256:</strong>
                    <br />
                    <span className="font-mono">{currentVoucher.digitalHash}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="rec-modal-footer">
              <button
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                onClick={() => window.print()}
              >
                <Download size={14} />
                <span>Imprimir / PDF</span>
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                onClick={() => setVoucherModalOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: VÍNCULO MANUAL DE PEDIDO ÓRFÃO */}
      {/* ========================================================================= */}
      {manualMatchModalOpen && selectedTxForMatch && (
        <div className="rec-modal-overlay">
          <div className="rec-modal-container">
            <div className="rec-modal-header">
              <h2>
                <Pencil size={18} className="text-purple-600" />
                Vincular Pedido Manualmente
              </h2>
              <button
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                onClick={() => setManualMatchModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="rec-modal-body text-xs space-y-3">
              <p className="text-slate-600">
                Informe o código do pedido correspondente à transação <strong>{selectedTxForMatch.code}</strong> de <strong>{formatBRL(selectedTxForMatch.gatewayGrossCents)}</strong> capturada na adquirente {selectedTxForMatch.gateway}.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Código do Pedido DiskIngressos (#DI-...):
                </label>
                <input
                  type="text"
                  placeholder="Ex: DI-894562"
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm font-mono font-bold"
                  value={manualOrderInput}
                  onChange={(e) => setManualOrderInput(e.target.value)}
                />
              </div>
            </div>

            <div className="rec-modal-footer">
              <button
                className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold"
                onClick={() => setManualMatchModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                onClick={handleConfirmManualMatch}
              >
                Salvar Vínculo & Conciliar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function CalendarIcon({ size = 16, style }: { size?: number; style?: React.CSSProperties }) {
  return <Clock size={size} style={style} />
}
