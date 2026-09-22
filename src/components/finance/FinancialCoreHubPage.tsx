import React, { useState, useEffect } from 'react'
import {
  DollarSign,
  Wallet,
  Layers,
  ArrowRightLeft,
  Calendar,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Clock,
  Send,
  Eye,
  FileCheck,
  CreditCard,
  Scale,
  TrendingUp,
  PieChart,
  BookOpen
} from 'lucide-react'
import type {
  ProducerFinancialAccount,
  FinancialLedgerEntry,
  EventTransferRecord,
  ReceivableAgendaEntry,
  PayableExpenseRecord,
  PayoutBatchRecord,
  MultiLayerReconciliationSummary,
  ReconciliationDivergence,
  FinancialIntegritySummary,
  AccountingCoreStatements,
  EventClosingChecklist,
  EventBorderoReport
} from '../../types/finance-accounting-core.types'
import { financialAccountingCoreService } from '../../services/financialAccountingCore.service'
import { TransferBetweenEventsModal } from './modals/TransferBetweenEventsModal'
import { LedgerTransactionAuditModal } from './modals/LedgerTransactionAuditModal'
import { EventFinancialClosingModal } from './modals/EventFinancialClosingModal'

type FinanceHubTab =
  | 'conta'
  | 'ledger'
  | 'transferencias'
  | 'agenda'
  | 'repasses'
  | 'conciliacao'
  | 'integridade'
  | 'contabilidade'

export const FinancialCoreHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceHubTab>('conta')
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  // Estados dos Dados
  const [account, setAccount] = useState<ProducerFinancialAccount | null>(null)
  const [ledgerEntries, setLedgerEntries] = useState<FinancialLedgerEntry[]>([])
  const [transfers, setTransfers] = useState<EventTransferRecord[]>([])
  const [receivables, setReceivables] = useState<ReceivableAgendaEntry[]>([])
  const [payables, setPayables] = useState<PayableExpenseRecord[]>([])
  const [payoutBatches, setPayoutBatches] = useState<PayoutBatchRecord[]>([])
  const [reconciliation, setReconciliation] = useState<{
    summary: MultiLayerReconciliationSummary
    divergences: ReconciliationDivergence[]
  } | null>(null)
  const [integrity, setIntegrity] = useState<FinancialIntegritySummary | null>(null)
  const [statements, setStatements] = useState<AccountingCoreStatements | null>(null)

  // Filtros Ledger
  const [ledgerSearch, setLedgerSearch] = useState<string>('')
  const [ledgerSelectedEvent, setLedgerSelectedEvent] = useState<string>('todos')

  // Modais
  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false)
  const [auditModalOpen, setAuditModalOpen] = useState<boolean>(false)
  const [selectedLedgerEntry, setSelectedLedgerEntry] = useState<FinancialLedgerEntry | null>(null)

  const [closingModalOpen, setClosingModalOpen] = useState<boolean>(false)
  const [selectedClosingChecklist, setSelectedClosingChecklist] = useState<EventClosingChecklist | null>(null)
  const [selectedBordero, setSelectedBordero] = useState<EventBorderoReport | null>(null)

  // Feedback
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const loadAllData = async () => {
    try {
      const [acc, led, trf, rec, pay, payBatches, recon, integ, stat] = await Promise.all([
        financialAccountingCoreService.getProducerAccount(),
        financialAccountingCoreService.getLedger(),
        financialAccountingCoreService.getTransfers(),
        financialAccountingCoreService.getReceivables(),
        financialAccountingCoreService.getPayables(),
        financialAccountingCoreService.getPayoutBatches(),
        financialAccountingCoreService.getReconciliation(),
        financialAccountingCoreService.getIntegritySummary(),
        financialAccountingCoreService.getStatements()
      ])

      setAccount(acc)
      setLedgerEntries(led.data)
      setTransfers(trf)
      setReceivables(rec)
      setPayables(pay)
      setPayoutBatches(payBatches)
      setReconciliation(recon)
      setIntegrity(integ)
      setStatements(stat)
    } catch {
      //
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadAllData()
  }

  const handleOpenAudit = (entry: FinancialLedgerEntry) => {
    setSelectedLedgerEntry(entry)
    setAuditModalOpen(true)
  }

  const handleOpenClosing = async (eventId: number) => {
    try {
      const res = await financialAccountingCoreService.getEventClosing(eventId)
      setSelectedClosingChecklist(res.checklist)
      setSelectedBordero(res.bordero)
      setClosingModalOpen(true)
    } catch {
      //
    }
  }

  const handleApproveTransfer = async (transferId: string) => {
    const checkerName = prompt('Informe o nome do Aprovador (Checker):', 'Renata Valadares (Diretoria)')
    if (!checkerName) return

    const res = await financialAccountingCoreService.approveTransfer(transferId, checkerName)
    if (res.ok) {
      setFeedbackMessage('Transferência entre eventos aprovada e lançada no Ledger.')
      loadAllData()
      setTimeout(() => setFeedbackMessage(null), 4000)
    } else {
      alert(res.message || 'Erro ao aprovar transferência.')
    }
  }

  const handleReverseTransfer = async (transferId: string) => {
    const reason = prompt('Informe a justificativa para a reversão:', 'Estorno de verba não utilizada')
    if (!reason) return

    const res = await financialAccountingCoreService.reverseTransfer(transferId, reason, 'Controladoria Central')
    if (res.ok) {
      setFeedbackMessage('Transferência revertida com estorno registrado no Ledger.')
      loadAllData()
      setTimeout(() => setFeedbackMessage(null), 4000)
    } else {
      alert(res.message || 'Erro ao reverter transferência.')
    }
  }

  const handleApprovePayout = async (batchId: string) => {
    const token = prompt('Digite o token MFA (6 dígitos) para autorização bancária:', '981245')
    if (!token) return

    const res = await financialAccountingCoreService.approvePayoutBatch(batchId, {
      checkerName: 'Henrique Faria (Controladoria)',
      mfaToken: token
    })

    if (res.ok) {
      setFeedbackMessage('Lote de repasse aprovado com token MFA e enviado para o Banco.')
      loadAllData()
      setTimeout(() => setFeedbackMessage(null), 4000)
    } else {
      alert(res.message || 'Erro ao aprovar repasse.')
    }
  }

  const handleResolveDivergence = async (divId: string) => {
    const notes = prompt('Descreva a solução contábil para equalizar esta divergência:', 'Taxa recalculada conforme aditivo de contrato')
    if (!notes) return

    const res = await financialAccountingCoreService.resolveDivergence(divId, notes)
    if (res.ok) {
      setFeedbackMessage('Divergência equalizada e auditada com sucesso.')
      loadAllData()
      setTimeout(() => setFeedbackMessage(null), 4000)
    }
  }

  const handleClosePeriod = async () => {
    const ok = confirm('Tem certeza que deseja fechar a competência contábil de Setembro/2026? Nenhuma alteração retroativa será permitida.')
    if (!ok) return

    const res = await financialAccountingCoreService.closePeriod('Auditoria Contábil Central')
    if (res.ok) {
      setFeedbackMessage('Competência fechada e bloqueada com sucesso.')
      loadAllData()
      setTimeout(() => setFeedbackMessage(null), 4000)
    }
  }

  // Filtragem de Ledger
  const filteredLedger = ledgerEntries.filter(entry => {
    const matchesEvent = ledgerSelectedEvent === 'todos' || String(entry.eventId) === ledgerSelectedEvent
    const term = ledgerSearch.toLowerCase()
    const matchesSearch =
      entry.id.toLowerCase().includes(term) ||
      entry.entryTypeLabelPtBr.toLowerCase().includes(term) ||
      entry.eventName.toLowerCase().includes(term) ||
      (entry.orderId && entry.orderId.toLowerCase().includes(term))
    return matchesEvent && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-sm text-slate-400 font-medium">
            Carregando Núcleo Financeiro & Contábil Disk Core...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 pb-8 w-full max-w-none" data-testid="pagina-nucleo-financeiro-contabil">
      {/* Topo / Header Enterprise */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Disk Core • Finanças & Contabilidade
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Auditoria Imutável Ativa
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Núcleo Financeiro & Contabilidade Enterprise
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Ledger append-only de partidas dobradas, 11 tipos de saldo, subcontas por evento, governança Maker × Checker e borderô rastreável.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span>{refreshing ? 'Atualizando...' : 'Atualizar Dados'}</span>
            </button>

            <button
              onClick={() => setTransferModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold shadow-lg shadow-amber-500/20 transition-all"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Nova Transferência</span>
            </button>
          </div>
        </div>

        {/* Notificação de Feedback */}
        {feedbackMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Conta Bancária Homologada */}
        {account?.bankAccount && (
          <div className="mt-5 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">
                Produtor Titular: <strong className="text-white">{account.producerName}</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                Banco: <strong className="text-slate-200">{account.bankAccount.bankName}</strong> (Ag. {account.bankAccount.agency} / CC {account.bankAccount.accountNumber})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Lock className="w-3 h-3" /> MFA Ativo para Repasses
              </span>
              <span className="text-[11px] text-slate-400">
                PIX: <span className="font-mono text-slate-300">{account.bankAccount.pixKey}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navegação por Abas */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('conta')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'conta'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Conta & 11 Saldos</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Livro Financeiro (Ledger)</span>
        </button>

        <button
          onClick={() => setActiveTab('transferencias')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'transferencias'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Transferências Entre Eventos</span>
        </button>

        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'agenda'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agenda & Contas a Pagar</span>
        </button>

        <button
          onClick={() => setActiveTab('repasses')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'repasses'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Tesouraria & Repasses</span>
        </button>

        <button
          onClick={() => setActiveTab('conciliacao')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'conciliacao'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Conciliação em 5 Camadas</span>
        </button>

        <button
          onClick={() => setActiveTab('integridade')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'integridade'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Auditor de Integridade</span>
        </button>

        <button
          onClick={() => setActiveTab('contabilidade')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'contabilidade'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>DREs & Demonstrações Contábeis</span>
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: CONTA DO PRODUTOR & 11 SALDOS */}
      {activeTab === 'conta' && account && (
        <div className="space-y-6">
          {/* Grid dos 11 Tipos de Saldo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-400" /> Os 11 Tipos de Saldo do Produtor (Disk Core)
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                Atualizado: {new Date(account.updatedAt).toLocaleTimeString('pt-BR')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {/* 1. Vendido */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">1. Vendido (Bruto)</span>
                <span className="text-lg font-bold font-mono text-white block">
                  R$ {(account.balances.soldCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500">Volume total transacionado</span>
              </div>

              {/* 2. Recebido */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">2. Recebido (PIX/Débito)</span>
                <span className="text-lg font-bold font-mono text-emerald-400 block">
                  R$ {(account.balances.receivedCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500">Entrada física em conta</span>
              </div>

              {/* 3. Em Liquidação */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">3. Em Liquidação</span>
                <span className="text-lg font-bold font-mono text-amber-400 block">
                  R$ {(account.balances.inSettlementCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500">Aguardando câmara adquirente</span>
              </div>

              {/* 4. A Receber */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">4. A Receber (Parcelas)</span>
                <span className="text-lg font-bold font-mono text-sky-400 block">
                  R$ {(account.balances.receivableCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500">Cartão crédito D+30 / parcelado</span>
              </div>

              {/* 5. Disponível (Destaque) */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold text-amber-400 block mb-1">5. Saldo Disponível</span>
                <span className="text-xl font-extrabold font-mono text-white block">
                  R$ {(account.balances.availableCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-amber-300/80">Livre para repasse ou transferências</span>
              </div>

              {/* 6. Reservado */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">6. Reservado (Caução)</span>
                <span className="text-lg font-bold font-mono text-slate-300 block">
                  R$ {(account.balances.reservedCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500">Margem estornos e chargebacks</span>
              </div>

              {/* 7. Bloqueado */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">7. Bloqueado</span>
                <span className="text-lg font-bold font-mono text-slate-400 block">
                  R$ {(account.balances.blockedCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500">Ordens judiciais ou disputas</span>
              </div>

              {/* 8. Comprometido */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">8. Comprometido</span>
                <span className="text-lg font-bold font-mono text-orange-400 block">
                  R$ {(account.balances.committedCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500">Contas a pagar agendadas</span>
              </div>

              {/* 9. Em Transferência */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">9. Em Transferência</span>
                <span className="text-lg font-bold font-mono text-violet-400 block">
                  R$ {(account.balances.inTransferCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500">Movimentação entre eventos</span>
              </div>

              {/* 10. Em Repasse */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">10. Em Repasse</span>
                <span className="text-lg font-bold font-mono text-indigo-400 block">
                  R$ {(account.balances.inPayoutCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500">Lotes PIX/CNAB em envio</span>
              </div>

              {/* 11. Repassado */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">11. Total Repassado</span>
                <span className="text-lg font-bold font-mono text-emerald-300 block">
                  R$ {(account.balances.paidOutCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500">Liquidado na conta do produtor</span>
              </div>
            </div>
          </div>

          {/* Subcontas por Evento */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Subcontas Segregadas por Evento
                </h3>
                <p className="text-xs text-slate-400">
                  Cada evento possui sua própria subconta com rastreamento isolado de vendas, taxas, repasses e fechamento.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Evento</th>
                    <th className="py-3 px-4 text-right">Vendas Brutas</th>
                    <th className="py-3 px-4 text-right">Recebido</th>
                    <th className="py-3 px-4 text-right">A Receber</th>
                    <th className="py-3 px-4 text-right">Taxas Disk</th>
                    <th className="py-3 px-4 text-right">Transferências</th>
                    <th className="py-3 px-4 text-right">Repassado</th>
                    <th className="py-3 px-4 text-right">Saldo Disponível</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 font-mono">
                  {account.subAccounts.map(sub => (
                    <tr key={sub.eventId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-sans">
                        <span className="font-semibold text-white block">{sub.eventName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">ID: {sub.eventId} • Data: {sub.eventDate}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-200">
                        R$ {(sub.salesGrossCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-medium">
                        R$ {(sub.receivedCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-sky-400 font-medium">
                        R$ {(sub.receivableCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-rose-400 font-medium">
                        - R$ {(sub.feesCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {sub.transferredNetCents < 0 ? (
                          <span className="text-rose-400">- R$ {(Math.abs(sub.transferredNetCents) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        ) : sub.transferredNetCents > 0 ? (
                          <span className="text-emerald-400">+ R$ {(sub.transferredNetCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        ) : (
                          <span className="text-slate-500">R$ 0,00</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-indigo-400 font-medium">
                        R$ {(sub.paidOutCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400 font-sans">
                        R$ {(sub.availableCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          sub.status === 'FECHADO'
                            ? 'bg-slate-800 text-slate-300'
                            : sub.status === 'EM_FECHAMENTO'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {sub.statusLabelPtBr}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <button
                          onClick={() => handleOpenClosing(sub.eventId)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                        >
                          Borderô / Fechamento
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: LIVRO FINANCEIRO (LEDGER APPEND-ONLY) */}
      {activeTab === 'ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" /> Livro Financeiro (Ledger Append-Only)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Partidas dobradas balanceadas imutáveis. Nenhum registro é deletado; correções são feitas exclusivamente por reversão.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Filtro Evento */}
              <select
                value={ledgerSelectedEvent}
                onChange={e => setLedgerSelectedEvent(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="todos">Todos os Eventos</option>
                {account?.subAccounts.map(s => (
                  <option key={s.eventId} value={String(s.eventId)}>
                    {s.eventName}
                  </option>
                ))}
              </select>

              {/* Busca */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar ID, Pedido ou Regra..."
                  value={ledgerSearch}
                  onChange={e => setLedgerSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 w-56"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-4">Identificador / Data</th>
                  <th className="py-3 px-4">Evento</th>
                  <th className="py-3 px-4">Fato Contábil</th>
                  <th className="py-3 px-4">Partida (Débito → Crédito)</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Natureza</th>
                  <th className="py-3 px-4 text-center">Auditoria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 font-mono">
                {filteredLedger.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white block">{entry.id}</span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(entry.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-200">
                      {entry.eventName}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="font-medium text-slate-200 block">{entry.entryTypeLabelPtBr}</span>
                      {entry.orderId && (
                        <span className="text-[10px] text-amber-400 font-mono">Origem: {entry.orderId}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      <div className="truncate max-w-xs" title={`${entry.accountDebit} → ${entry.accountCredit}`}>
                        <span className="text-rose-400">D: {entry.accountDebit.split('•')[0]}</span> →{' '}
                        <span className="text-emerald-400">C: {entry.accountCredit.split('•')[0]}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      R$ {(entry.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      {entry.nature === 'CREDITO' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
                          CRÉDITO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400">
                          DÉBITO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <button
                        onClick={() => handleOpenAudit(entry)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Ver Auditoria do Lançamento"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 3: TRANSFERÊNCIAS ENTRE EVENTOS (MAKER × CHECKER) */}
      {activeTab === 'transferencias' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-400" /> Transferências de Recursos Entre Eventos
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Regra Maker × Checker: o operador solicitante nunca aprova a própria transferência. Alçadas auditadas.
              </p>
            </div>

            <button
              onClick={() => setTransferModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold shadow transition-all self-start sm:self-auto"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Solicitar Nova Transferência</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-4">Identificador</th>
                  <th className="py-3 px-4">Origem (Cede)</th>
                  <th className="py-3 px-4">Destino (Recebe)</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4">Alçada</th>
                  <th className="py-3 px-4">Maker (Solicitante)</th>
                  <th className="py-3 px-4">Checker (Aprovador)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 font-mono">
                {transfers.map(trf => (
                  <tr key={trf.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {trf.id}
                      {trf.reversalTransferId && (
                        <span className="block text-[10px] text-amber-400">Rev: {trf.reversalTransferId}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-200">{trf.sourceEventName}</td>
                    <td className="py-3 px-4 font-sans text-slate-200">{trf.targetEventName}</td>
                    <td className="py-3 px-4 text-right font-bold text-amber-400 font-sans">
                      R$ {(trf.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300">{trf.tier}</td>
                    <td className="py-3 px-4 font-sans text-slate-400">
                      <span className="block text-slate-200">{trf.maker.userName}</span>
                      <span className="text-[10px]">{new Date(trf.maker.requestedAt).toLocaleDateString('pt-BR')}</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400">
                      {trf.checker ? (
                        <>
                          <span className="block text-emerald-400">{trf.checker.userName}</span>
                          <span className="text-[10px]">{new Date(trf.checker.approvedAt).toLocaleDateString('pt-BR')}</span>
                        </>
                      ) : (
                        <span className="text-amber-400 text-[11px]">Pendente de Checker</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        trf.status === 'CONCLUIDA'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : trf.status === 'REVERTIDA'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {trf.statusLabelPtBr}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      {trf.status === 'SOLICITADA' || trf.status === 'EM_ANALISE' ? (
                        <button
                          onClick={() => handleApproveTransfer(trf.id)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                        >
                          Aprovar (Checker)
                        </button>
                      ) : trf.status === 'CONCLUIDA' ? (
                        <button
                          onClick={() => handleReverseTransfer(trf.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 text-xs border border-slate-700 transition-colors"
                        >
                          Reverter
                        </button>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 4: AGENDA DE RECEBÍVEIS & CONTAS A PAGAR */}
      {activeTab === 'agenda' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agenda de Recebíveis */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" /> Agenda de Recebíveis
              </h3>
              <span className="text-xs text-slate-400">Entradas Adquirentes</span>
            </div>

            <div className="space-y-3">
              {receivables.map(rec => (
                <div key={rec.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        rec.periodBucket === 'HOJE'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : rec.periodBucket === 'AMANHA'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-sky-500/20 text-sky-400'
                      }`}>
                        {rec.periodBucket}
                      </span>
                      <span className="font-semibold text-white">{rec.eventName}</span>
                    </div>
                    <span className="text-slate-400 block">{rec.gateway} • Vencimento: {rec.dueDate}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-white block">
                      R$ {(rec.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-emerald-400">{rec.statusLabelPtBr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contas a Pagar por Centro de Custo */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" /> Contas a Pagar por Centro de Custo
              </h3>
              <span className="text-xs text-slate-400">Competência Atual</span>
            </div>

            <div className="space-y-3">
              {payables.map(pay => (
                <div key={pay.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {pay.costCenterLabelPtBr}
                      </span>
                      <span className="font-semibold text-white">{pay.supplierName}</span>
                    </div>
                    <span className="text-slate-400 block">{pay.eventName} • Vence: {pay.dueDate} ({pay.invoiceNumber})</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-rose-400 block">
                      - R$ {(pay.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-amber-400">{pay.statusLabelPtBr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 5: TESOURARIA & REPASSES */}
      {activeTab === 'repasses' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" /> Tesouraria & Lotes de Repasse Bancário
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Liquidação direta na conta bancária homologada do produtor via PIX SPI e TED CNAB240 com proteção MFA.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-4">Lote / Agendamento</th>
                  <th className="py-3 px-4">Produtor & Conta Destino</th>
                  <th className="py-3 px-4 text-right">Valor do Repasse</th>
                  <th className="py-3 px-4 text-center">Método</th>
                  <th className="py-3 px-4">Maker & Checker</th>
                  <th className="py-3 px-4 text-center">MFA</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 font-mono">
                {payoutBatches.map(batch => (
                  <tr key={batch.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white block">{batch.id}</span>
                      <span className="text-[11px] text-slate-500 font-sans">
                        {new Date(batch.scheduledFor).toLocaleString('pt-BR')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-200">
                      <span className="font-medium block">{batch.producerName}</span>
                      <span className="text-[11px] text-slate-400">{batch.targetBank}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400 font-sans">
                      R$ {(batch.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                        {batch.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400">
                      <span className="block text-slate-300">Maker: {batch.maker.userName}</span>
                      {batch.checker && <span className="block text-emerald-400">Checker: {batch.checker.userName}</span>}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      {batch.mfaAuthenticated ? (
                        <span className="flex items-center justify-center gap-1 text-emerald-400 text-xs">
                          <ShieldCheck className="w-3.5 h-3.5" /> FIDO2 / TOTP
                        </span>
                      ) : (
                        <span className="text-amber-400 text-xs">Aguardando</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        batch.status === 'LIQUIDADO'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : batch.status === 'PROCESSANDO'
                            ? 'bg-sky-500/20 text-sky-400'
                            : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {batch.statusLabelPtBr}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      {batch.status === 'SOLICITADO' ? (
                        <button
                          onClick={() => handleApprovePayout(batch.id)}
                          className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors"
                        >
                          Aprovar (MFA)
                        </button>
                      ) : (
                        <span className="text-slate-500 text-xs font-mono">{batch.bankReturnReceipt || 'OK'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 6: CONCILIAÇÃO EM 5 CAMADAS */}
      {activeTab === 'conciliacao' && reconciliation && (
        <div className="space-y-6">
          {/* Header de Saúde Global */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-semibold text-white">
                  Motor de Conciliação em 5 Camadas (Acurácia Global)
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Auditoria automática cruzada entre Gateways, Liquidação Bancária, Extratos OFX, Repasses aos Produtores e Contabilidade.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right font-mono">
                <span className="text-2xl font-extrabold text-emerald-400 block">
                  {reconciliation.summary.globalHealthScorePercent.toFixed(2)}%
                </span>
                <span className="text-[10px] text-slate-400">Índice Geral de Conciliação</span>
              </div>
            </div>
          </div>

          {/* Cards das 5 Camadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Camada 1 */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-white block mb-1">
                {reconciliation.summary.paymentsLayer.namePtBr}
              </span>
              <span className="text-base font-bold font-mono text-emerald-400 block">
                {reconciliation.summary.paymentsLayer.healthRatePercent.toFixed(2)}%
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Divergências: <strong className="text-amber-400">{reconciliation.summary.paymentsLayer.divergencesCount}</strong>
              </span>
            </div>

            {/* Camada 2 */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-white block mb-1">
                {reconciliation.summary.settlementLayer.namePtBr}
              </span>
              <span className="text-base font-bold font-mono text-emerald-400 block">
                {reconciliation.summary.settlementLayer.healthRatePercent.toFixed(2)}%
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Divergências: <strong className="text-slate-300">{reconciliation.summary.settlementLayer.divergencesCount}</strong>
              </span>
            </div>

            {/* Camada 3 */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-white block mb-1">
                {reconciliation.summary.bankLayer.namePtBr}
              </span>
              <span className="text-base font-bold font-mono text-emerald-400 block">
                {reconciliation.summary.bankLayer.healthRatePercent.toFixed(2)}%
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                100% Batido em Extrato
              </span>
            </div>

            {/* Camada 4 */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-white block mb-1">
                {reconciliation.summary.payoutLayer.namePtBr}
              </span>
              <span className="text-base font-bold font-mono text-emerald-400 block">
                {reconciliation.summary.payoutLayer.healthRatePercent.toFixed(2)}%
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Repasses Integrados
              </span>
            </div>

            {/* Camada 5 */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-white block mb-1">
                {reconciliation.summary.accountingLayer.namePtBr}
              </span>
              <span className="text-base font-bold font-mono text-emerald-400 block">
                {reconciliation.summary.accountingLayer.healthRatePercent.toFixed(2)}%
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Ledger Balanceado
              </span>
            </div>
          </div>

          {/* Divergências Ativas */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-semibold text-white">
              Divergências em Análise
            </h4>
            {reconciliation.divergences.length === 0 ? (
              <p className="text-xs text-slate-400">Nenhuma divergência pendente no momento.</p>
            ) : (
              <div className="space-y-3">
                {reconciliation.divergences.map(div => (
                  <div key={div.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{div.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400">
                          {div.divergenceTypeLabelPtBr}
                        </span>
                        <span className="text-slate-400 font-mono">Pedido: {div.orderId}</span>
                      </div>
                      <p className="text-slate-300">{div.notes}</p>
                    </div>
                    <div className="flex items-center gap-3 self-end md:self-auto">
                      <span className="font-mono font-bold text-amber-400">
                        Dif: R$ {(Math.abs(div.differenceCents) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => handleResolveDivergence(div.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-colors"
                      >
                        Equalizar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 7: AUDITOR DE INTEGRIDADE FINANCEIRA */}
      {activeTab === 'integridade' && integrity && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Auditor Contínuo de Integridade Financeira
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verificação automatizada de partidas dobradas, balanço de subcontas e integridade criptográfica.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">{integrity.statusLabelPtBr}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Score de Integridade do Ledger</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {integrity.healthScorePercent.toFixed(2)}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Regras Regulatórias Auditadas</span>
              <span className="text-2xl font-bold font-mono text-white">
                {integrity.rulesAuditedCount} regras ativas
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Anomalias Críticas Detectadas</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {integrity.anomaliesDetectedCount} ocorrências
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Alertas e Diagnósticos Recentes
            </h4>
            {integrity.activeAlerts.map(alt => (
              <div key={alt.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-white block">{alt.title}</span>
                  <span className="text-slate-400">{alt.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 8: DREs & DEMONSTRAÇÕES CONTÁBEIS */}
      {activeTab === 'contabilidade' && statements && (
        <div className="space-y-6">
          {/* Status de Fechamento de Competência */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-semibold text-white">
                  Demonstrações Financeiras & Contabilidade Oficial ({statements.period})
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Segregação contábil estrita: Valores a Repassar (Passivo Circulante - Capital de Terceiros) × Receita Própria DiskIngressos.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                {statements.closingStatusLabelPtBr}
              </span>
              {!statements.periodClosed && (
                <button
                  onClick={handleClosePeriod}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold shadow transition-colors"
                >
                  Fechar Competência
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DRE Gerencial do Evento */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> DRE Gerencial do Evento ({statements.dreEvent.eventName})
              </h4>
              <div className="space-y-2 text-xs divide-y divide-slate-800/60 font-mono">
                <div className="flex justify-between pt-2">
                  <span className="font-sans text-slate-300">Receita Bruta com Ingressos:</span>
                  <span className="font-semibold text-white">
                    R$ {(statements.dreEvent.grossRevenueCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-rose-400">
                  <span className="font-sans">(-) Deduções e Taxas Disk:</span>
                  <span>- R$ {(statements.dreEvent.deductionsCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between pt-2 text-emerald-400 font-semibold">
                  <span className="font-sans">(=) Receita Líquida do Evento:</span>
                  <span>R$ {(statements.dreEvent.netRevenueCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between pt-2 text-rose-400">
                  <span className="font-sans">(-) Despesas Diretas de Produção:</span>
                  <span>- R$ {(statements.dreEvent.directExpensesCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between pt-2 text-amber-400 font-bold text-sm">
                  <span className="font-sans">(=) Margem de Contribuição Bruta:</span>
                  <span>R$ {(statements.dreEvent.grossContributionMarginCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({statements.dreEvent.contributionMarginPercent}%)</span>
                </div>
              </div>
            </div>

            {/* Balanço Patrimonial Segregado */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-sky-400" /> Balanço Patrimonial & Capital de Terceiros
              </h4>
              <div className="space-y-3 text-xs">
                {/* Ativo */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono">
                  <span className="font-sans font-semibold text-slate-200 block">Ativo Circulante Total:</span>
                  <div className="flex justify-between text-slate-400">
                    <span>• Caixa e Equivalentes (Contas Bancárias):</span>
                    <span className="text-white">R$ {(statements.balanceSheet.assets.cashAndEquivalentsCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>• Recebíveis de Adquirentes:</span>
                    <span className="text-white">R$ {(statements.balanceSheet.assets.receivablesFromGatewaysCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Passivo */}
                <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/20 space-y-1 font-mono">
                  <span className="font-sans font-semibold text-amber-400 block">
                    Passivo Circulante (Capital de Terceiros Segregado):
                  </span>
                  <div className="flex justify-between text-slate-300">
                    <span>• Valores a Repassar aos Produtores:</span>
                    <span className="text-amber-300 font-bold">
                      R$ {(statements.balanceSheet.liabilities.producerPayoutObligationsCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: TRANSFERÊNCIA ENTRE EVENTOS */}
      {account && (
        <TransferBetweenEventsModal
          isOpen={transferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          subAccounts={account.subAccounts}
          onSuccess={() => {
            setFeedbackMessage('Transferência solicitada com sucesso. Aguardando aprovação do Checker!')
            loadAllData()
            setTimeout(() => setFeedbackMessage(null), 4000)
          }}
        />
      )}

      {/* MODAL 2: AUDITORIA DO LEDGER */}
      <LedgerTransactionAuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        entry={selectedLedgerEntry}
      />

      {/* MODAL 3: FECHAMENTO & BORDERÔ */}
      <EventFinancialClosingModal
        isOpen={closingModalOpen}
        onClose={() => setClosingModalOpen(false)}
        checklist={selectedClosingChecklist}
        bordero={selectedBordero}
        onSuccess={() => {
          setFeedbackMessage('Borderô homologado e evento encerrado com sucesso!')
          loadAllData()
          setTimeout(() => setFeedbackMessage(null), 4000)
        }}
      />
    </div>
  )
}
