import React, { useState, useEffect, useMemo } from 'react'
import {
  Terminal,
  Activity,
  Cpu,
  Database,
  Layers,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  RefreshCw,
  GitCommit,
  Radio,
  Share2,
  Server,
  FileText,
  UserX,
  ExternalLink,
  Flame,
  ArrowRight,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  X,
  Palette
} from 'lucide-react'
import { developerObservabilityService } from '../../services/developerObservability.service'
import type {
  DeveloperCommandCenterSummary,
  StructuredLogEntry,
  CorrelationJourney,
  ErrorFingerprint,
  QueueHealthStatus,
  ActiveSessionItem
} from '../../types/iam-security.types'
import { DeveloperImpersonationBanner } from './DeveloperImpersonationBanner'
import { DesignSystemShowcasePage } from './DesignSystemShowcasePage'

export const DeveloperCommandCenterPage: React.FC = () => {
  const [summary, setSummary] = useState<DeveloperCommandCenterSummary | null>(null)
  const [logs, setLogs] = useState<StructuredLogEntry[]>([])
  const [errors, setErrors] = useState<ErrorFingerprint[]>([])
  const [queues, setQueues] = useState<QueueHealthStatus[]>([])
  const [sessions, setSessions] = useState<ActiveSessionItem[]>([])
  const [activeTab, setActiveTab] = useState<'investigacao' | 'logs' | 'erros' | 'filas' | 'sessoes' | 'saude' | 'design-system'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash.includes('design-system') || window.location.pathname.includes('design-system')) {
        return 'design-system'
      }
    }
    return 'investigacao'
  })
  
  // Rastreamento por Correlation ID
  const [searchCorrelationId, setSearchCorrelationId] = useState('COR-982736')
  const [activeJourney, setActiveJourney] = useState<CorrelationJourney | null>(null)
  const [isSearchingJourney, setIsSearchingJourney] = useState(false)

  // Filtros de Logs
  const [logSeverityFilter, setLogSeverityFilter] = useState('TODOS')
  const [logSearchQuery, setLogSearchQuery] = useState('')
  const [selectedLogDiff, setSelectedLogDiff] = useState<StructuredLogEntry | null>(null)

  // Banner de Impersonation simulado
  const [isImpersonating, setIsImpersonating] = useState(false)
  
  // Ação de feedback
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  const loadData = async () => {
    const [summaryData, logsData, errorsData, queuesData, sessionsData] = await Promise.all([
      developerObservabilityService.getSummary(),
      developerObservabilityService.getLogs(),
      developerObservabilityService.getErrors(),
      developerObservabilityService.getQueues(),
      developerObservabilityService.getSessions()
    ])
    setSummary(summaryData)
    setLogs(logsData)
    setErrors(errorsData)
    setQueues(queuesData)
    setSessions(sessionsData)
  }

  useEffect(() => {
    loadData()
    handleSearchJourney('COR-982736')
  }, [])

  const handleSearchJourney = async (cid: string) => {
    if (!cid.trim()) return
    setIsSearchingJourney(true)
    try {
      const journey = await developerObservabilityService.getCorrelationJourney(cid.trim())
      setActiveJourney(journey)
    } finally {
      setIsSearchingJourney(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    const res = await developerObservabilityService.revokeSession(
      sessionId,
      'Ação manual do Developer Lead por auditoria de segurança'
    )
    setActionNotice(res.message)
    setSessions((prev) =>
      prev.map((s) => (s.sessionId === sessionId ? { ...s, status: 'REVOKED' } : s))
    )
    setTimeout(() => setActionNotice(null), 4000)
  }

  const handleReprocessDlq = async (queueName: string, correlationId: string) => {
    const res = await developerObservabilityService.reprocessDlqJob(queueName, correlationId)
    setActionNotice(res.message)
    setQueues((prev) =>
      prev.map((q) =>
        q.queueName === queueName ? { ...q, dlqCount: 0, status: 'HEALTHY' } : q
      )
    )
    setTimeout(() => setActionNotice(null), 4000)
  }

  const filteredLogs = useMemo(() => {
    const list = Array.isArray(logs) ? logs : []
    return list.filter((log) => {
      if (logSeverityFilter !== 'TODOS' && log.severity !== logSeverityFilter) return false
      if (logSearchQuery) {
        const q = logSearchQuery.toLowerCase()
        return (
          log.message.toLowerCase().includes(q) ||
          log.module.toLowerCase().includes(q) ||
          log.correlationId.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [logs, logSeverityFilter, logSearchQuery])

  return (
    <div className="space-y-2 w-full max-w-none pb-8 animate-fadeIn" data-testid="developer-command-center">
      {/* Banner de Impersonation (se ativo) */}
      {isImpersonating && (
        <DeveloperImpersonationBanner
          actorUserName="Carlos Henrique (Developer Lead)"
          impersonatedEntityName="Opus Entretenimento Curitiba (PRD-441)"
          onClose={() => setIsImpersonating(false)}
        />
      )}

      {/* Notificação de Sucesso de Ações Técnicas */}
      {actionNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <button type="button" onClick={() => setActionNotice(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cabeçalho da Central Developer */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Terminal className="w-4 h-4" />
            Disk Core • Observabilidade & Rastreamento em Tempo Real
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Developer Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Painel técnico de sustentação, APM, rastreamento universal de incidentes e auditoria de identidade (IAM).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsImpersonating((prev) => !prev)}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border ${
              isImpersonating
                ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/50 dark:border-amber-700 dark:text-amber-200'
                : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700 dark:bg-[#151C27] dark:border-[#283548] dark:hover:bg-[#1C2432] dark:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{isImpersonating ? 'Encerrar Modo Suporte' : 'Simular Impersonation'}</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Atualizar Telemetria</span>
          </button>
        </div>
      </div>

      {/* KPIs da Plataforma */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
        <div className="bg-white dark:bg-[#151C27] p-3 rounded-xl border border-slate-200 dark:border-[#283548] shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Uptime Plataforma</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {summary?.uptimePercentage !== undefined ? `${summary.uptimePercentage}%` : '99.99%'}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Meta SLA: 99.95%</p>
        </div>

        <div className="bg-white dark:bg-[#151C27] p-3 rounded-xl border border-slate-200 dark:border-[#283548] shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Latência P95</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {summary?.apiP95Ms !== undefined ? `${summary.apiP95Ms} ms` : '218 ms'}
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Excelente (&lt; 300ms)</p>
        </div>

        <div className="bg-white dark:bg-[#151C27] p-3 rounded-xl border border-slate-200 dark:border-[#283548] shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Taxa de Erro 24h</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {summary?.errorRatePercentage !== undefined ? `${summary.errorRatePercentage}%` : '0.12%'}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Normal (&lt; 0.5%)</p>
        </div>

        <div className="bg-white dark:bg-[#151C27] p-3 rounded-xl border border-slate-200 dark:border-[#283548] shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vazão Global</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {summary?.requestsPerMinute !== undefined ? summary.requestsPerMinute.toLocaleString('pt-BR') : '12.842'}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">requisições / min</p>
        </div>

        <div className="bg-white dark:bg-[#151C27] p-3 rounded-xl border border-slate-200 dark:border-[#283548] shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fila DLQ</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {summary?.dlqCount !== undefined ? summary.dlqCount : 3}
          </p>
          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-1">Mensagens retidas</p>
        </div>

        <div className="bg-white dark:bg-[#151C27] p-3 rounded-xl border border-slate-200 dark:border-[#283548] shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Incidentes</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {summary?.activeIncidentsCount !== undefined ? summary.activeIncidentsCount : 2}
          </p>
          <p className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold mt-1">WhatsApp e Cartão</p>
        </div>
      </div>

      {/* Barra de Navegação das Abas Técnicas */}
      <div className="flex border-b border-slate-200 dark:border-[#283548] gap-1 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('investigacao')}
          className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'investigacao'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Investigação Universal (Correlation ID)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'logs'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Logs Estruturados</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('erros')}
          className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'erros'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Erros & Fingerprints</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('filas')}
          className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'filas'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Filas & Dead-Letter (DLQ)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sessoes')}
          className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'sessoes'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <UserX className="w-4 h-4" />
          <span>Sessões Ativas & IAM</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('saude')}
          className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'saude'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Saúde dos Componentes</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('design-system')
            try {
              window.location.hash = '#/desenvolvedor/design-system'
            } catch {}
          }}
          data-testid="tab-design-system"
          className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'design-system'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4 text-orange-500" />
          <span>Design System Disk (Komposo)</span>
        </button>
      </div>

      {/* ABA 1: INVESTIGAÇÃO UNIVERSAL (Correlation ID) */}
      {activeTab === 'investigacao' && (
        <div className="space-y-2">
          {/* Caixa de Busca Universal */}
          <div className="bg-slate-900 p-4 rounded-xl text-white shadow-xl">
            <div className="w-full">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-400" />
                <span>Rastreamento Universal de Jornada Ponta a Ponta</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Insira qualquer identificador canônico para reconstruir a cadeia completa: Correlation ID, Pedido (ORD-...), Ingresso (TCK-...) ou Transação PIX.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSearchJourney(searchCorrelationId)
                }}
                className="mt-3 flex gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchCorrelationId}
                    onChange={(e) => setSearchCorrelationId(e.target.value)}
                    placeholder="Ex: COR-982736, ORD-982736..."
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingJourney}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Rastrear</span>
                </button>
              </form>

              <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">
                <span>Atalhos de teste:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchCorrelationId('COR-982736')
                    handleSearchJourney('COR-982736')
                  }}
                  className="underline hover:text-indigo-400 font-mono"
                >
                  COR-982736 (Compra com falha no WhatsApp)
                </button>
              </div>
            </div>
          </div>

          {/* Resultado do Rastreamento */}
          {activeJourney && activeJourney.correlationId ? (
            <div className="bg-white dark:bg-[#151C27] border border-slate-200 dark:border-[#283548] rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#283548]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {activeJourney.correlationId}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60">
                      STATUS: FALHA NA NOTIFICAÇÃO (DLQ)
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {activeJourney.rootAction}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Iniciado às {activeJourney.startedAt} • Duração total da esteira: {activeJourney.totalDurationMs} ms
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-[#111722] border border-slate-200 dark:border-[#283548] rounded-lg text-slate-700 dark:text-slate-300 font-medium">
                    Usuário: <strong className="text-slate-900 dark:text-white">{activeJourney.userId}</strong>
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-[#111722] border border-slate-200 dark:border-[#283548] rounded-lg text-slate-700 dark:text-slate-300 font-medium">
                    Evento: <strong className="text-slate-900 dark:text-white">{activeJourney.eventId}</strong>
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-[#111722] border border-slate-200 dark:border-[#283548] rounded-lg text-slate-700 dark:text-slate-300 font-medium">
                    Pedido: <strong className="text-slate-900 dark:text-white">{activeJourney.orderId}</strong>
                  </span>
                </div>
              </div>

              {/* Timeline de Etapas */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  Cadeia Canônica de Execução no Disk Core
                </h4>

                <div className="relative pl-6 border-l-2 border-slate-200 dark:border-[#283548] space-y-2">
                  {(activeJourney.steps ?? []).map((step) => {
                    const isErr = step.status === 'ERROR'
                    return (
                      <div key={step.stepIndex} className="relative group">
                        {/* Marcador do nó */}
                        <div
                          className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isErr
                              ? 'border-rose-600 bg-rose-600 text-white ring-4 ring-rose-100 dark:ring-rose-950/60'
                              : 'border-emerald-600 bg-emerald-600 text-white'
                          }`}
                        />

                        <div
                          className={`p-4 rounded-xl border text-xs transition-colors ${
                            isErr
                              ? 'bg-rose-50/70 border-rose-200 text-rose-950 dark:bg-rose-950/30 dark:border-rose-900/60 dark:text-rose-200'
                              : 'bg-slate-50/80 border-slate-200 text-slate-800 dark:bg-[#111722] dark:border-[#283548] dark:text-slate-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">{step.service}</span>
                              <span className="text-slate-400 dark:text-slate-500">•</span>
                              <span className="font-medium text-slate-600 dark:text-slate-300">{step.action}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-mono">
                              <span className="text-slate-400 dark:text-slate-500">{step.timestamp}</span>
                              <span className="px-1.5 py-0.5 rounded bg-white dark:bg-[#1A2333] border border-slate-200 dark:border-[#283548] font-bold text-slate-800 dark:text-slate-200">
                                {step.durationMs} ms
                              </span>
                            </div>
                          </div>

                          {step.details && (
                            <p className="mt-2 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                              {step.details}
                            </p>
                          )}

                          {step.dlqReason && (
                            <div className="mt-3 p-3 bg-white dark:bg-[#0B0E14] border border-rose-300 dark:border-rose-900/80 rounded-lg text-rose-900 dark:text-rose-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
                              <div>
                                <span className="font-bold uppercase tracking-wider text-[10px] text-rose-600 dark:text-rose-400">
                                  Motivo de Retenção na Dead-Letter Queue:
                                </span>
                                <p className="font-mono text-xs mt-0.5 text-rose-900 dark:text-rose-200">{step.dlqReason}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleReprocessDlq('notifications.whatsapp', activeJourney.correlationId)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs transition flex items-center gap-1.5 flex-shrink-0"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Reprocessar DLQ</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-[#151C27] border border-slate-200 dark:border-[#283548] rounded-2xl text-slate-500 dark:text-slate-400 text-xs">
              Nenhuma jornada encontrada para o Correlation ID informado.
            </div>
          )}
        </div>
      )}

      {/* ABA 2: LOGS ESTRUTURADOS */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-[#151C27] border border-slate-200 dark:border-[#283548] rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Logs Estruturados Sanitizados</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nenhum segredo, senha ou número de cartão é exposto em conformidade com o Log Sanitizer do Core.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={logSeverityFilter}
                onChange={(e) => setLogSeverityFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-[#283548] text-slate-800 dark:text-slate-200 rounded-xl font-medium focus:outline-none"
              >
                <option value="TODOS">Todas as Severidades</option>
                <option value="INFO">Apenas INFO</option>
                <option value="WARN">Apenas WARN</option>
                <option value="ERROR">Apenas ERROR</option>
              </select>

              <input
                type="text"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                placeholder="Filtrar por mensagem ou módulo..."
                className="px-3 py-2 bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-[#283548] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-xl focus:outline-none w-60"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-[#283548] rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-[#111722] border-b border-slate-200 dark:border-[#283548] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Data/Hora</th>
                  <th className="py-2.5 px-3">Nível</th>
                  <th className="py-2.5 px-3">Sistema / Módulo</th>
                  <th className="py-2.5 px-3">Mensagem</th>
                  <th className="py-2.5 px-3">Correlation ID</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#283548] font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-[#1A2333] transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">{log.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.severity === 'ERROR'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : log.severity === 'WARN'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-sans font-semibold text-slate-800 dark:text-slate-200">
                      {log.system} • {log.module}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300 max-w-md truncate">
                      {log.message}
                    </td>
                    <td className="py-2.5 px-3 text-indigo-600 dark:text-indigo-400 font-bold">{log.correlationId}</td>
                    <td className="py-2.5 px-3 text-right">
                      {log.beforeState && log.afterState ? (
                        <button
                          type="button"
                          onClick={() => setSelectedLogDiff(log)}
                          className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded font-bold text-[10px] transition"
                        >
                          Antes × Depois
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchCorrelationId(log.correlationId)
                            setActiveTab('investigacao')
                            handleSearchJourney(log.correlationId)
                          }}
                          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                        >
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal Comparador Antes x Depois */}
          {selectedLogDiff && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#151C27] border border-slate-300 dark:border-[#283548] rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Auditoria Imutável — Comparador Antes × Depois
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSelectedLogDiff(null)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                  <p><strong>Módulo:</strong> {selectedLogDiff.module}</p>
                  <p><strong>Usuário Autor:</strong> {selectedLogDiff.userId}</p>
                  <p><strong>Justificativa:</strong> {selectedLogDiff.metadata?.reason || 'Operação autorizada'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl">
                    <span className="font-bold text-[11px] text-rose-800 dark:text-rose-300 uppercase tracking-wider">Estado Anterior (Antes)</span>
                    <pre className="mt-2 text-[11px] text-rose-900 dark:text-rose-200 font-mono overflow-x-auto">
                      {JSON.stringify(selectedLogDiff.beforeState, null, 2)}
                    </pre>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-xl">
                    <span className="font-bold text-[11px] text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Estado Atual (Depois)</span>
                    <pre className="mt-2 text-[11px] text-emerald-900 dark:text-emerald-200 font-mono overflow-x-auto">
                      {JSON.stringify(selectedLogDiff.afterState, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 3: ERROS & FINGERPRINTS */}
      {activeTab === 'erros' && (
        <div className="space-y-2">
          <div className="bg-white dark:bg-[#151C27] border border-slate-200 dark:border-[#283548] rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Exceções Agrupadas por Fingerprint</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Impacto quantificado em usuários, eventos e volume financeiro em risco nas últimas 24 horas.
            </p>
          </div>

          <div className="space-y-2">
            {(errors ?? []).map((err) => (
              <div key={err.fingerprint} className="bg-white dark:bg-[#151C27] border border-slate-200 dark:border-[#283548] rounded-xl p-3.5 shadow-sm space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold text-xs font-mono">
                      {err.fingerprint}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{err.title}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Ocorrências: <strong className="text-slate-900 dark:text-white">{err.count24h}</strong></span>
                    <span className="text-slate-500 dark:text-slate-400">Usuários Afetados: <strong className="text-slate-900 dark:text-white">{err.affectedUsers}</strong></span>
                    {Boolean(err.estimatedRiskAmountBrl && err.estimatedRiskAmountBrl > 0) && (
                      <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold">
                        R$ {Number(err.estimatedRiskAmountBrl).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em risco
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-slate-50 dark:bg-[#0B0E14] p-2.5 rounded-lg border border-slate-200 dark:border-[#283548]">
                  {err.lastErrorMessage}
                </p>

                <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between pt-1">
                  <span>Primeira ocorrência: {err.firstSeen} • Última: {err.lastSeen}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline">Ver Stack Trace Completo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: FILAS & DLQ */}
      {activeTab === 'filas' && (
        <div className="bg-white dark:bg-[#151C27] border border-slate-200 dark:border-[#283548] rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monitor de Filas & Dead-Letter (DLQ)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Topologia de mensageria assíncrona baseada no RabbitMQ e Redis Streams do Core.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-[#283548] rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-[#111722] border-b border-slate-200 dark:border-[#283548] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2 px-3">Fila Técnica</th>
                  <th className="py-2 px-3">Pendentes</th>
                  <th className="py-2 px-3">Em Processamento</th>
                  <th className="py-2 px-3">Retidas na DLQ</th>
                  <th className="py-2 px-3">Latência Média</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#283548] text-[11px]">
                {(queues ?? []).map((q) => (
                  <tr key={q.queueName} className="hover:bg-slate-50 dark:hover:bg-[#1A2333] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">{q.queueName}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{q.pendingCount}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{q.inProgressCount}</td>
                    <td className="py-2.5 px-3">
                      <span className={`font-bold ${q.dlqCount > 0 ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-400 dark:text-slate-500'}`}>
                        {q.dlqCount}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">{q.latencyAvgMs} ms</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.status === 'CRITICAL'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                            : q.status === 'WARNING'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {q.canReprocess && q.dlqCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleReprocessDlq(q.queueName, 'ALL_DLQ')}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs transition shadow-sm"
                        >
                          Reprocessar DLQ
                        </button>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 5: SESSÕES ATIVAS & IAM */}
      {activeTab === 'sessoes' && (
        <div className="bg-white dark:bg-[#151C27] border border-slate-200 dark:border-[#283548] rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sessões Ativas no Disk Core</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monitoramento Zero Trust: revogação imediata com persistência no Audit Core.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-[#283548] rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-[#111722] border-b border-slate-200 dark:border-[#283548] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2 px-3">Usuário</th>
                  <th className="py-2 px-3">Perfil IAM</th>
                  <th className="py-2 px-3">Dispositivo / IP</th>
                  <th className="py-2 px-3">Localização</th>
                  <th className="py-2 px-3">Início</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#283548] text-[11px]">
                {(sessions ?? []).map((s) => (
                  <tr key={s.sessionId} className="hover:bg-slate-50 dark:hover:bg-[#1A2333] transition-colors">
                    <td className="py-2 px-3">
                      <p className="font-bold text-slate-900 dark:text-white">{s.userName}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{s.userEmail}</p>
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">{s.role}</td>
                    <td className="py-2 px-3">
                      <p className="text-slate-800 dark:text-slate-200">{s.device}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{s.ip}</p>
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{s.city}</td>
                    <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{s.startedAt}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 line-through'
                        }`}
                      >
                        {s.status === 'ACTIVE' ? 'Ativa' : 'Revogada'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      {s.status === 'ACTIVE' ? (
                        <button
                          type="button"
                          onClick={() => handleRevokeSession(s.sessionId)}
                          className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 rounded font-bold text-xs transition"
                        >
                          Revogar Sessão
                        </button>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-xs">Revogada</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 6: SAÚDE DOS COMPONENTES */}
      {activeTab === 'saude' && (
        <div className="bg-white dark:bg-[#151C27] border border-slate-200 dark:border-[#283548] rounded-xl p-4 shadow-sm space-y-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Health Check da Infraestrutura & Provedores</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sondas contínuas de telemetria ativas a cada 30 segundos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {(summary?.componentsHealth ?? []).map((c) => (
              <div key={c.component} className="p-4 rounded-xl border border-slate-200 dark:border-[#283548] bg-slate-50/50 dark:bg-[#111722] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{c.component}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'ONLINE'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : c.status === 'DEGRADED'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span>Latência: <strong className="text-slate-800 dark:text-slate-200">{c.latencyMs} ms</strong></span>
                  <span>Uptime: <strong className="text-slate-800 dark:text-slate-200">{c.uptimePercentage}%</strong></span>
                </div>
                {c.message && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded border border-amber-200 dark:border-amber-900/60 font-medium">
                    {c.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA: DESIGN SYSTEM DISK (KOMPOSO) */}
      {activeTab === 'design-system' && (
        <DesignSystemShowcasePage />
      )}
    </div>
  )
}
