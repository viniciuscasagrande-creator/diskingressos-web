import React, { useEffect, useState } from 'react'
import {
  FileText, Percent, DollarSign, ArrowUpRight, Shield, History,
  CheckCircle2, Clock, AlertCircle, RefreshCw, Plus, ArrowLeft,
  Building2, Scale, Layers, ChevronRight, Lock
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import type { PageKey } from '../../components/ModuleSidebar'

interface Props {
  event: EventItem
  onNavigate?: (p: PageKey) => void
  notify?: (msg: string) => void
}

interface CommercialVersion {
  id: number
  version: number
  effectiveFrom: string
  effectiveTo: string | null
  status: string
  serviceFeeType: 'percentage' | 'fixed'
  serviceFeeBps: number
  serviceFeeFixedCents: number
  serviceFeePaidBy: 'buyer' | 'producer'
  serviceFeeMinCents: number
  spreadEnabled: boolean
  spreadType: string
  spreadBps: number
  spreadFixedCents: number
  advancedEnabled: boolean
  advancedRateBps: number
  advancedMaxPercent: number
  advancedMinDays: number
  payoutTermsDays: number
  payoutModel: string
  contractNumber: string | null
  changeReason: string | null
  createdBy: string
  createdAt: string
}

interface AuditEntry {
  id: number
  actorName: string
  action: string
  reason: string
  timestamp: string
  previousValueJson: string | null
  newValueJson: string
}

interface AgreementResponse {
  id?: number
  eventId: number
  producerName: string
  eventTitle: string
  status: string
  currentVersion: number
  activeVersion: CommercialVersion | null
  versions: CommercialVersion[]
  auditLogs: AuditEntry[]
  isDefault: boolean
}

export default function EventCommercialConditionsPage({ event, onNavigate, notify }: Props) {
  const [data, setData] = useState<AgreementResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'condicoes' | 'historico' | 'antecipacao' | 'auditoria'>('condicoes')

  // Modal para nova versão
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feeType, setFeeType] = useState<'percentage' | 'fixed'>('percentage')
  const [feePercent, setFeePercent] = useState('10.0')
  const [feeFixed, setFeeFixed] = useState('8.00')
  const [paidBy, setPaidBy] = useState<'buyer' | 'producer'>('buyer')
  const [spreadEnabled, setSpreadEnabled] = useState(false)
  const [spreadPercent, setSpreadPercent] = useState('1.5')
  const [advancedEnabled, setAdvancedEnabled] = useState(false)
  const [advancedRate, setAdvancedRate] = useState('2.5')
  const [advancedMax, setAdvancedMax] = useState('70')
  const [payoutDays, setPayoutDays] = useState('2')
  const [payoutModel, setPayoutModel] = useState('pos_evento')
  const [contractNum, setContractNum] = useState('')
  const [changeReason, setChangeReason] = useState('')

  const loadAgreement = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/commercial/events/${event.id}/agreement`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('safesaff_token') || sessionStorage.getItem('safesaff_token') || ''}`
        }
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Erro ao carregar condições' }))
        throw new Error(err.message || `Status ${res.status}`)
      }
      const json = await res.json()
      setData(json)

      // Preenche form com os dados vigentes
      if (json.activeVersion) {
        const v = json.activeVersion
        setFeeType(v.serviceFeeType)
        setFeePercent((v.serviceFeeBps / 100).toFixed(1))
        setFeeFixed((v.serviceFeeFixedCents / 100).toFixed(2))
        setPaidBy(v.serviceFeePaidBy)
        setSpreadEnabled(v.spreadEnabled)
        setSpreadPercent((v.spreadBps / 100).toFixed(1))
        setAdvancedEnabled(v.advancedEnabled)
        setAdvancedRate((v.advancedRateBps / 100).toFixed(1))
        setAdvancedMax(String(v.advancedMaxPercent))
        setPayoutDays(String(v.payoutTermsDays))
        setPayoutModel(v.payoutModel)
        setContractNum(v.contractNumber || '')
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Não foi possível carregar as condições comerciais do evento.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAgreement()
  }, [event.id])

  const handleSaveNewVersion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!changeReason.trim()) {
      alert('O motivo da alteração contratual é obrigatório para auditoria.')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        serviceFeeType: feeType,
        serviceFeeBps: Math.round(parseFloat(feePercent || '0') * 100),
        serviceFeeFixedCents: Math.round(parseFloat(feeFixed || '0') * 100),
        serviceFeePaidBy: paidBy,
        spreadEnabled,
        spreadBps: Math.round(parseFloat(spreadPercent || '0') * 100),
        advancedEnabled,
        advancedRateBps: Math.round(parseFloat(advancedRate || '0') * 100),
        advancedMaxPercent: parseInt(advancedMax || '70', 10),
        payoutTermsDays: parseInt(payoutDays || '2', 10),
        payoutModel,
        contractNumber: contractNum.trim() || undefined,
        changeReason: changeReason.trim()
      }

      const res = await fetch(`/api/commercial/events/${event.id}/agreement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('safesaff_token') || sessionStorage.getItem('safesaff_token') || ''}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Erro ao salvar' }))
        throw new Error(err.message || 'Falha ao aplicar nova versão comercial')
      }

      if (notify) notify('Nova versão comercial aplicada com sucesso!')
      setIsModalOpen(false)
      setChangeReason('')
      await loadAgreement()
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar nova versão comercial.')
    } finally {
      setSubmitting(false)
    }
  }

  const v = data?.activeVersion

  return (
    <div className="space-y-2 w-full max-w-none" data-testid="event-commercial-conditions-page">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F172A] border border-slate-800 rounded-xl p-5 text-white">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">
            <Scale size={14} />
            <span>Motor Comercial Disk • Governança por Evento</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-100 flex items-center gap-3">
            Condições Comerciais do Evento
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              data?.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
            }`}>
              {data?.status || 'Rascunho'}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {event.title} • Produtora: <strong className="text-slate-300">{data?.producerName || 'Produtora'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => void loadAgreement()}
            className="p-2.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
            title="Atualizar dados reais"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition"
          >
            <Plus size={16} />
            <span>Nova Negociação / Versão</span>
          </button>
        </div>
      </div>

      {/* Subtabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('condicoes')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${
            activeTab === 'condicoes'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Condições Vigentes
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${
            activeTab === 'historico'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Versões Contratuais ({data?.versions?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('antecipacao')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${
            activeTab === 'antecipacao'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Advanced & Antecipação
        </button>
        <button
          onClick={() => setActiveTab('auditoria')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition ${
            activeTab === 'auditoria'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Trilha de Auditoria ({data?.auditLogs?.length || 0})
        </button>
      </div>

      {/* Conteúdo da Tab Vigente */}
      {activeTab === 'condicoes' && (
        <div className="space-y-2">
          {error && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 flex items-center gap-3">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Taxa de Serviço */}
            <div className="p-5 rounded-xl border border-slate-800 bg-[#0F172A] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                <span>Taxa de Serviço Disk</span>
                <Percent size={16} className="text-amber-400" />
              </div>
              <div className="text-2xl font-black text-slate-100">
                {v ? (
                  v.serviceFeeType === 'percentage'
                    ? `${(v.serviceFeeBps / 100).toFixed(1)}%`
                    : `R$ ${(v.serviceFeeFixedCents / 100).toFixed(2)}`
                ) : '10.0%'}
              </div>
              <p className="text-xs text-slate-400">
                Cobrada no checkout: <strong className="text-slate-200">{v?.serviceFeePaidBy === 'buyer' ? 'Do Comprador' : 'Deduzida do Produtor'}</strong>
              </p>
            </div>

            {/* Spread Comercial */}
            <div className="p-5 rounded-xl border border-slate-800 bg-[#0F172A] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                <span>Spread de Margem</span>
                <DollarSign size={16} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-slate-100">
                {v?.spreadEnabled ? `${(v.spreadBps / 100).toFixed(1)}%` : 'Desabilitado'}
              </div>
              <p className="text-xs text-slate-400">
                {v?.spreadEnabled ? 'Diferencial gateway/adquirente ativo' : 'Sem margem adicional de spread'}
              </p>
            </div>

            {/* Advanced / Antecipação */}
            <div className="p-5 rounded-xl border border-slate-800 bg-[#0F172A] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                <span>Advanced / Antecipação</span>
                <ArrowUpRight size={16} className="text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-slate-100">
                {v?.advancedEnabled ? `${(v.advancedRateBps / 100).toFixed(1)}% a.m.` : 'Bloqueado'}
              </div>
              <p className="text-xs text-slate-400">
                {v?.advancedEnabled ? `Limite até ${v.advancedMaxPercent}% do saldo elegível` : 'Não habilitado neste evento'}
              </p>
            </div>

            {/* Prazos de Repasse */}
            <div className="p-5 rounded-xl border border-slate-800 bg-[#0F172A] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                <span>Regra de Repasse</span>
                <Clock size={16} className="text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-slate-100">
                D+{v?.payoutTermsDays ?? 2}
              </div>
              <p className="text-xs text-slate-400">
                Modelo: <strong className="text-slate-200">{v?.payoutModel === 'pos_evento' ? 'Pós-evento' : v?.payoutModel || 'Padrão'}</strong>
              </p>
            </div>
          </div>

          {/* Painel de Governança e Regras Ativas */}
          <div className="p-6 rounded-xl border border-slate-800 bg-[#0F172A] space-y-4">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Shield size={18} className="text-amber-400" />
              <span>Contrato Vigente • Versão {v?.version || 1}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Número do Contrato:</span>
                  <span className="font-mono text-slate-200">{v?.contractNumber || 'Não informado'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Vigência desde:</span>
                  <span className="text-slate-200">
                    {v ? new Date(v.effectiveFrom).toLocaleDateString('pt-BR') : 'Hoje'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Responsável pela Negociação:</span>
                  <span className="text-slate-200">{v?.createdBy || 'Comercial Disk'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Regra de Congelamento na Venda:</span>
                  <span className="font-semibold text-emerald-400">Ativa (Snapshot Imutável)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Motivo da Aplicação da Versão:</span>
                  <span className="text-slate-200 italic">{v?.changeReason || 'Versão contratual inicial'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Histórico de Versões */}
      {activeTab === 'historico' && (
        <div className="rounded-xl border border-slate-800 bg-[#0F172A] overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <h3 className="font-bold text-slate-200 text-sm">Linha do Tempo das Negociações Comerciais</h3>
            <p className="text-xs text-slate-400">As vendas realizadas no passado são congeladas na versão vigente na data da compra.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Versão</th>
                  <th className="p-3.5">Vigência</th>
                  <th className="p-3.5">Taxa de Serviço</th>
                  <th className="p-3.5">Spread</th>
                  <th className="p-3.5">Advanced</th>
                  <th className="p-3.5">Repasse</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Motivo / Autor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.versions && data.versions.length > 0 ? (
                  data.versions.map((ver) => (
                    <tr key={ver.id} className="hover:bg-slate-800/30">
                      <td className="p-3.5 font-bold text-slate-200">v{ver.version}</td>
                      <td className="p-3.5 text-xs text-slate-300">
                        {new Date(ver.effectiveFrom).toLocaleDateString('pt-BR')}
                        {ver.effectiveTo ? ` até ${new Date(ver.effectiveTo).toLocaleDateString('pt-BR')}` : ' (atual)'}
                      </td>
                      <td className="p-3.5 font-semibold text-amber-400">
                        {ver.serviceFeeType === 'percentage'
                          ? `${(ver.serviceFeeBps / 100).toFixed(1)}%`
                          : `R$ ${(ver.serviceFeeFixedCents / 100).toFixed(2)}`}
                      </td>
                      <td className="p-3.5 text-xs">
                        {ver.spreadEnabled ? `${(ver.spreadBps / 100).toFixed(1)}%` : '—'}
                      </td>
                      <td className="p-3.5 text-xs">
                        {ver.advancedEnabled ? `${(ver.advancedRateBps / 100).toFixed(1)}%` : '—'}
                      </td>
                      <td className="p-3.5 text-xs">D+{ver.payoutTermsDays}</td>
                      <td className="p-3.5">
                        <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                          ver.status === 'ativa'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {ver.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-xs text-slate-400">
                        <strong>{ver.createdBy}</strong>
                        <div className="truncate max-w-xs">{ver.changeReason || 'Inicial'}</div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      Nenhuma versão registrada para este evento ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Antecipação */}
      {activeTab === 'antecipacao' && (
        <div className="space-y-2">
          <div className="p-6 rounded-xl border border-slate-800 bg-[#0F172A] space-y-3">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <ArrowUpRight className="text-cyan-400" size={18} />
              <span>Operação de Antecipação Financeira (Advanced)</span>
            </h3>
            <p className="text-sm text-slate-400">
              A antecipação é uma operação de crédito sob demanda contratual. Cada solicitação passa por análise de elegibilidade, cálculo de custo e aprovação antes da liquidação.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 block">Status da Operação no Evento</span>
                <strong className={v?.advancedEnabled ? 'text-emerald-400' : 'text-red-400'}>
                  {v?.advancedEnabled ? 'Habilitado no Contrato Comercial' : 'Desabilitado no Contrato'}
                </strong>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 block">Taxa de Antecipação</span>
                <strong className="text-cyan-400">
                  {v?.advancedEnabled ? `${(v.advancedRateBps / 100).toFixed(1)}% ao mês` : '—'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Auditoria */}
      {activeTab === 'auditoria' && (
        <div className="rounded-xl border border-slate-800 bg-[#0F172A] overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <h3 className="font-bold text-slate-200 text-sm">Trilha de Auditoria Comercial Imutável</h3>
            <p className="text-xs text-slate-400">Todas as alterações de taxas e condições comerciais ficam registradas com motivo e responsável.</p>
          </div>
          <div className="divide-y divide-slate-800/60 p-4 space-y-3">
            {data?.auditLogs && data.auditLogs.length > 0 ? (
              data.auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400">{log.action}</span>
                    <span className="text-slate-500">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    Operador: <span className="text-slate-300 font-normal">{log.actorName}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Motivo formal: <span className="text-slate-300 italic">"{log.reason}"</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500 text-sm">
                Nenhum log de alteração comercial registrado ainda.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Nova Versão Comercial */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-[#0F172A] p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                <Scale className="text-amber-500" size={20} />
                Nova Condição Comercial • Versão {(v?.version || 0) + 1}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewVersion} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tipo de Taxa */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Modelo da Taxa de Serviço</label>
                  <select
                    value={feeType}
                    onChange={(e) => setFeeType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full p-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white"
                  >
                    <option value="percentage">Percentual (%) sobre o ingresso</option>
                    <option value="fixed">Valor Fixo (R$) por ingresso</option>
                  </select>
                </div>

                {/* Valor da Taxa */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {feeType === 'percentage' ? 'Taxa Percentual (%)' : 'Taxa Fixa (R$)'}
                  </label>
                  <input
                    type="number"
                    step={feeType === 'percentage' ? '0.1' : '0.01'}
                    value={feeType === 'percentage' ? feePercent : feeFixed}
                    onChange={(e) => feeType === 'percentage' ? setFeePercent(e.target.value) : setFeeFixed(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Quem paga */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Cobrança da Taxa</label>
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value as 'buyer' | 'producer')}
                    className="w-full p-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white"
                  >
                    <option value="buyer">Cobrada do Comprador (adiciona no checkout)</option>
                    <option value="producer">Deduzida do Produtor (embutida no preço)</option>
                  </select>
                </div>

                {/* Número do contrato */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Contrato Formal / Ref</label>
                  <input
                    type="text"
                    placeholder="Ex: CTR-2026-MAIDEN-02"
                    value={contractNum}
                    onChange={(e) => setContractNum(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white"
                  />
                </div>
              </div>

              {/* Spread e Advanced */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={spreadEnabled}
                      onChange={(e) => setSpreadEnabled(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    Habilitar Spread Comercial
                  </label>
                  {spreadEnabled && (
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Spread % (ex: 1.5)"
                      value={spreadPercent}
                      onChange={(e) => setSpreadPercent(e.target.value)}
                      className="w-full p-2 rounded border border-slate-700 bg-slate-800 text-white text-xs"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={advancedEnabled}
                      onChange={(e) => setAdvancedEnabled(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    Habilitar Advanced (Antecipação)
                  </label>
                  {advancedEnabled && (
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Taxa a.m. % (ex: 2.5)"
                      value={advancedRate}
                      onChange={(e) => setAdvancedRate(e.target.value)}
                      className="w-full p-2 rounded border border-slate-700 bg-slate-800 text-white text-xs"
                    />
                  )}
                </div>
              </div>

              {/* Motivo da alteração */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold text-amber-400 mb-1">
                  Motivo da Alteração Contratual (Obrigatório para Auditoria) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Descreva o motivo da alteração da taxa comercial deste evento..."
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <RefreshCw size={14} className="animate-spin" />}
                  <span>Aplicar Nova Versão</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
