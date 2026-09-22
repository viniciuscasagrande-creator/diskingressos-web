// ============================================================================
// FASE 29.11: CENTRAL ENTERPRISE DE CLIENTES & HISTÓRICO UNIFICADO (DISK CORE)
// Busca Universal por CPF, Nome, E-mail, Pedido e Histórico Completo Sem 360
// ============================================================================

import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  User,
  ShoppingBag,
  Ticket,
  Headphones,
  ShieldCheck,
  CreditCard,
  Mail,
  Phone,
  ArrowUpRight,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import type { CustomerMasterRecord, CustomerServiceDeskSummary } from '../../types/customer-service-itil.types'
import { customerServiceItilService } from '../../services/customerServiceItil.service'
import { CustomerDossierModal } from './CustomerDossierModal'
import { NewItilCaseModal } from './NewItilCaseModal'

export const CustomerSearchHubPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerMasterRecord[]>([])
  const [summary, setSummary] = useState<CustomerServiceDeskSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('TODOS')

  // Modais
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerMasterRecord | null>(null)
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false)
  const [caseTargetCustomer, setCaseTargetCustomer] = useState<CustomerMasterRecord | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [custRes, sumRes] = await Promise.all([
        customerServiceItilService.getCustomers({
          q: searchQuery,
          segment: selectedSegment
        }),
        customerServiceItilService.getMetrics()
      ])
      setCustomers(custRes.data)
      setSummary(sumRes)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedSegment])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadData()
  }

  const handleOpenCaseForCustomer = (cust: CustomerMasterRecord) => {
    setSelectedCustomer(null)
    setCaseTargetCustomer(cust)
    setIsCaseModalOpen(true)
  }

  const formatMoney = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  return (
    <div className="space-y-2 w-full max-w-none animate-fadeIn">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              Disk Core • Central de Clientes
            </span>
            <span className="text-xs text-slate-500 font-semibold">• CRM & Histórico Unificado</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600" />
            Central de Consulta de Clientes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Visão unificada do consumidor em todos os canais DiskIngressos. Histórico completo de pedidos, ingressos, titularidades, credenciais, chamados SAC e análise preditiva de comportamento.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setCaseTargetCustomer(null)
              setIsCaseModalOpen(true)
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Headphones className="w-4 h-4" />
            <span>Novo Chamado Geral</span>
          </button>
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

      {/* Indicadores de Clientes & Atendimento */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Clientes Cadastrados</span>
            <strong className="text-2xl font-black text-slate-900 mt-1 block">{summary.totalCustomers}</strong>
            <span className="text-[11px] text-indigo-600 font-semibold">Base Unificada Disk Core</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Chamados Ativos SAC</span>
            <strong className="text-2xl font-black text-amber-600 mt-1 block">{summary.activeCasesSac}</strong>
            <span className="text-[11px] text-amber-700 font-semibold">Atendimento ao Consumidor</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Aderência ao SLA</span>
            <strong className="text-2xl font-black text-emerald-600 mt-1 block">{summary.slaCompliancePercentage}%</strong>
            <span className="text-[11px] text-emerald-600 font-semibold">Resoluções dentro do prazo</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Satisfação (CSAT)</span>
            <strong className="text-2xl font-black text-indigo-600 mt-1 block">{summary.satisfactionRatePercentage}%</strong>
            <span className="text-[11px] text-slate-500 font-semibold">Avaliações Positivas</span>
          </div>
        </div>
      )}

      {/* Barra de Busca Universal & Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Busca Universal por CPF, Nome, E-mail, Telefone ou ID do Cliente..."
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
            <span>Segmento RFM:</span>
          </div>
          <select
            value={selectedSegment}
            onChange={e => setSelectedSegment(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="TODOS">Todos os Segmentos</option>
            <option value="VIP Campeão">VIP Campeão</option>
            <option value="Cliente Leal">Cliente Leal</option>
            <option value="Novo Cliente">Novo Cliente</option>
            <option value="Em Risco">Em Risco</option>
          </select>
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Cliente / Documento</th>
                <th className="py-3 px-4">Contato & Local</th>
                <th className="py-3 px-4 text-center">Segmento RFM</th>
                <th className="py-3 px-4 text-right">Total Gasto</th>
                <th className="py-3 px-4 text-center">Pedidos / Ingressos</th>
                <th className="py-3 px-4 text-center">Risco Antifraude</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    Nenhum cliente encontrado com os filtros informados.
                  </td>
                </tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900 block text-sm">{c.name}</strong>
                      <span className="font-mono text-[11px] text-slate-400">
                        CPF: {c.document} • {c.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-800 block">{c.email}</span>
                      <span className="text-[11px] text-slate-500">{c.phone} • {c.city}/{c.state}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.rfmSegment === 'VIP Campeão'
                            ? 'bg-amber-100 text-amber-900'
                            : c.rfmSegment === 'Cliente Leal'
                            ? 'bg-indigo-100 text-indigo-900'
                            : c.rfmSegment === 'Novo Cliente'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-rose-100 text-rose-900'
                        }`}
                      >
                        {c.rfmSegment}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <strong className="text-slate-900 text-sm font-black">
                        {formatMoney(c.totalSpentCents)}
                      </strong>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-800">{c.ordersCount} pedidos</span>
                      <span className="text-[11px] text-indigo-600 block">{c.ticketsCount} ingressos</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.riskScore > 50
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        Score {c.riskScore} ({c.riskScore > 50 ? 'Alto Risco' : 'Seguro'})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(c)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs transition flex items-center gap-1 ml-auto"
                      >
                        <span>Dossiê do Cliente</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais */}
      {selectedCustomer && (
        <CustomerDossierModal
          customer={selectedCustomer}
          isOpen={Boolean(selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
          onOpenCase={handleOpenCaseForCustomer}
        />
      )}

      {isCaseModalOpen && (
        <NewItilCaseModal
          customer={caseTargetCustomer}
          defaultScope="SAC_CLIENTE"
          isOpen={isCaseModalOpen}
          onClose={() => {
            setIsCaseModalOpen(false)
            setCaseTargetCustomer(null)
          }}
          onSuccess={loadData}
        />
      )}
    </div>
  )
}
