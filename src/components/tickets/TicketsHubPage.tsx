// ============================================================================
// FASE 29.10: CENTRAL ENTERPRISE DE INGRESSOS (DISK CORE)
// Entidade Ingresso, Credenciais QR Versionadas, Transferências e Reemissões
// ============================================================================

import React, { useState, useEffect } from 'react'
import {
  Ticket,
  Search,
  Filter,
  RefreshCw,
  ArrowRightLeft,
  ShieldCheck,
  ShieldAlert,
  Layers,
  QrCode,
  Users,
  CheckCircle2,
  Lock,
  History,
  AlertTriangle
} from 'lucide-react'
import type { TicketRecord, TicketsAccessSummary } from '../../types/tickets-access.types'
import { ticketsAccessService } from '../../services/ticketsAccess.service'
import { TransferTicketModal } from './TransferTicketModal'
import { ReissueTicketModal } from './ReissueTicketModal'

export const TicketsHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'transfers' | 'credentials'>('tickets')
  const [tickets, setTickets] = useState<TicketRecord[]>([])
  const [summary, setSummary] = useState<TicketsAccessSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('TODOS')

  // Modais
  const [transferTarget, setTransferTarget] = useState<TicketRecord | null>(null)
  const [reissueTarget, setReissueTarget] = useState<TicketRecord | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [ticketsRes, summaryRes] = await Promise.all([
        ticketsAccessService.getTickets({
          q: searchQuery,
          status: selectedStatus
        }),
        ticketsAccessService.getAccessSummary()
      ])
      setTickets(ticketsRes.data)
      setSummary(summaryRes)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedStatus])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadData()
  }

  const handleBlockAction = async (ticket: TicketRecord) => {
    const confirmBlock = window.confirm(
      `Deseja realmente BLOQUEAR o ingresso ${ticket.id}? Todas as credenciais QR serão imediatamente invalidadas nas portarias.`
    )
    if (!confirmBlock) return

    await ticketsAccessService.blockTicket(ticket.id, 'BLOQUEAR', 'Bloqueio preventivo pelo operador.')
    await loadData()
  }

  return (
    <div className="space-y-2 w-full max-w-none animate-fadeIn">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              Disk Core • Ingressos Enterprise
            </span>
            <span className="text-xs text-slate-500 font-semibold">• Ciclo de Vida do Ingresso</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Ticket className="w-7 h-7 text-indigo-600" />
            Central de Ingressos & Credenciais
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Separação rigorosa entre Comprador e Titularidade. Cada ingresso possui credenciais QR versionadas (v1, v2) com revogação instantânea em transferências e reemissões antifraude.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Cards de Indicadores do Núcleo de Ingressos */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total de Ingressos</span>
            <strong className="text-2xl font-black text-slate-900 mt-1 block">{summary.totalTickets}</strong>
            <span className="text-[11px] text-indigo-600 font-semibold">100% no Ledger</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Ativos para Entrada</span>
            <strong className="text-2xl font-black text-emerald-600 mt-1 block">{summary.activeTickets}</strong>
            <span className="text-[11px] text-emerald-600 font-semibold">QR Code Ativo</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Check-ins Realizados</span>
            <strong className="text-2xl font-black text-blue-600 mt-1 block">{summary.usedTickets}</strong>
            <span className="text-[11px] text-blue-600 font-semibold">{summary.checkinPercentage}% de acesso</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Transferidos</span>
            <strong className="text-2xl font-black text-violet-600 mt-1 block">{summary.transferredTickets}</strong>
            <span className="text-[11px] text-violet-600 font-semibold">Novo Titular Vinculado</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Reemitidos (v2+)</span>
            <strong className="text-2xl font-black text-amber-600 mt-1 block">{summary.reissuedTickets}</strong>
            <span className="text-[11px] text-amber-600 font-semibold">Antifraude Ativo</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Bloqueados</span>
            <strong className="text-2xl font-black text-rose-600 mt-1 block">{summary.blockedTickets}</strong>
            <span className="text-[11px] text-rose-600 font-semibold">Barrados na Catraca</span>
          </div>
        </div>
      )}

      {/* Navegação por Abas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'tickets'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Todos os Ingressos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'transfers'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Histórico de Transferências</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('credentials')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'credentials'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Credenciais QR & Segurança</span>
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por ID do Ingresso, Pedido, Nome do Titular ou Comprador..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="ATIVO">Ativos para Entrada</option>
            <option value="UTILIZADO">Check-in Realizado</option>
            <option value="BLOQUEADO">Bloqueados</option>
            <option value="CANCELADO">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Tabela de Ingressos */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ingresso / Pedido</th>
                  <th className="py-3 px-4">Evento & Setor</th>
                  <th className="py-3 px-4">Comprador</th>
                  <th className="py-3 px-4">Titular Atual</th>
                  <th className="py-3 px-4 text-center">Credencial QR</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações Operacionais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                      Nenhum ingresso localizado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  tickets.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-indigo-700 block">{t.id}</span>
                        <span className="font-mono text-[11px] text-slate-400">Pedido #{t.orderId}</span>
                      </td>
                      <td className="py-3 px-4">
                        <strong className="text-slate-800 block">{t.eventName}</strong>
                        <span className="text-[11px] text-slate-500">{t.sector} • {t.lot}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{t.buyerName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{t.buyerDocument}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{t.holderName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{t.holderDocument}</span>
                        {t.transferCount > 0 && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-violet-100 text-violet-700">
                            Transferido ({t.transferCount}x)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 font-mono font-bold text-[11px] text-slate-700">
                          <QrCode className="w-3.5 h-3.5 text-slate-500" />
                          <span>v{t.currentCredentialVersion}</span>
                        </div>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                          {t.currentCredentialCode.slice(-8)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            t.status === 'ATIVO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'UTILIZADO'
                              ? 'bg-blue-100 text-blue-800'
                              : t.status === 'BLOQUEADO' || t.status === 'CANCELADO'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {t.statusLabelPtBr}
                        </span>
                        {t.checkInAt && (
                          <span className="block text-[10px] text-blue-600 font-semibold mt-0.5">
                            Portão: {t.checkInGate}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={t.status === 'UTILIZADO' || t.status === 'CANCELADO'}
                            onClick={() => setTransferTarget(t)}
                            title="Transferir Titularidade"
                            className="px-2.5 py-1.5 bg-violet-50 hover:bg-violet-100 disabled:opacity-40 text-violet-700 rounded-lg font-bold text-[11px] transition flex items-center gap-1"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Transferir</span>
                          </button>

                          <button
                            type="button"
                            disabled={t.status === 'UTILIZADO' || t.status === 'CANCELADO'}
                            onClick={() => setReissueTarget(t)}
                            title="Reemissão Segura Antifraude"
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 disabled:opacity-40 text-amber-800 rounded-lg font-bold text-[11px] transition flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Reemitir</span>
                          </button>

                          {t.status !== 'BLOQUEADO' && t.status !== 'CANCELADO' && t.status !== 'UTILIZADO' && (
                            <button
                              type="button"
                              onClick={() => handleBlockAction(t)}
                              title="Bloquear Ingresso"
                              className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[11px] transition"
                            >
                              <Lock className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aba de Histórico de Transferências */}
      {activeTab === 'transfers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-800">Cadeia de Custódia e Histórico de Transferências</h3>
          </div>
          <p className="text-xs text-slate-500">
            Registro indelével de todas as transferências de titularidade realizadas no sistema, identificando titular anterior, novo titular e versão das credenciais revogadas e geradas.
          </p>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-700">TRF-2026-001</span>
                <span className="text-xs text-slate-500 ml-2">• Ingresso #TKT-2026-981240-01</span>
              </div>
              <span className="text-xs text-slate-400">15/09/2026 15:10</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">De (Titular Anterior):</span>
                <strong className="text-slate-800">Maria Silva Santos</strong>
                <span className="text-[11px] text-slate-500 block">CPF: 049.281.938-12</span>
                <span className="text-[10px] text-rose-600 font-bold block mt-1">Credencial v1 Revogada</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Para (Novo Titular):</span>
                <strong className="text-slate-800">Lucas Fernandes Pereira</strong>
                <span className="text-[11px] text-slate-500 block">CPF: 512.981.234-99</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">Credencial v2 Emitida</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Auditoria:</span>
                <span className="text-slate-700 block">Canal: Aplicativo do Comprador</span>
                <span className="text-slate-500 block text-[11px]">IP: 187.55.12.89 • Autenticação MFA</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aba de Credenciais Seguras */}
      {activeTab === 'credentials' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-800">Auditoria Criptográfica de Credenciais QR</h3>
          </div>
          <p className="text-xs text-slate-500">
            O payload do QR Code não contém CPF, e-mail ou nome completo do comprador (LGPD Compliant). É assinado via hash criptográfico SHA-256 e validado contra a tabela de credenciais ativas do Disk Core.
          </p>

          <div className="space-y-3">
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-800">CRED-TKT-981240-01-V2</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">ATIVA</span>
                </div>
                <span className="text-[11px] text-slate-600 block mt-1">
                  Payload Ótico: <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-mono">DI|TKT-2026-981240-01|V2|7d8a9ef01234</code>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Hash SHA-256: a8b92019c81726aefd90128390123456789</span>
              </div>
              <div className="text-right text-xs">
                <span className="text-slate-500">Emitida em 15/09/2026 15:10</span>
                <span className="text-emerald-700 font-bold block">Pronta para Validação no Portão</span>
              </div>
            </div>

            <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-rose-800">CRED-TKT-981240-01-V1</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">REVOGADA</span>
                </div>
                <span className="text-[11px] text-slate-600 block mt-1">
                  Payload Ótico: <code className="bg-white px-1.5 py-0.5 rounded border border-rose-200 font-mono">DI|TKT-2026-981240-01|V1|1a2b3c4d5e6f</code>
                </span>
                <span className="text-[10px] text-rose-700 font-bold block mt-1">
                  Motivo da Revogação: Transferência de titularidade para Lucas Fernandes Pereira
                </span>
              </div>
              <div className="text-right text-xs">
                <span className="text-slate-500">Revogada em 15/09/2026 15:10</span>
                <span className="text-rose-700 font-bold block">Acesso Barrado em Catracas</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modais */}
      {transferTarget && (
        <TransferTicketModal
          ticket={transferTarget}
          isOpen={Boolean(transferTarget)}
          onClose={() => setTransferTarget(null)}
          onSuccess={loadData}
        />
      )}

      {reissueTarget && (
        <ReissueTicketModal
          ticket={reissueTarget}
          isOpen={Boolean(reissueTarget)}
          onClose={() => setReissueTarget(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  )
}
