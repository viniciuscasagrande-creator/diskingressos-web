// ============================================================================
// FASE 29.10: CONTROLE DE ACESSO "DISK ACESSO" (DISK CORE)
// Portões, Catracas, Validação Online/Offline, Override de Supervisor e Conflitos
// ============================================================================

import React, { useState, useEffect } from 'react'
import {
  Scan,
  ShieldCheck,
  ShieldAlert,
  Wifi,
  WifiOff,
  BatteryCharging,
  Battery,
  AlertOctagon,
  RefreshCw,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Smartphone,
  Sliders,
  AlertTriangle
} from 'lucide-react'
import type {
  AccessGateRecord,
  AccessDeviceRecord,
  AccessValidationLog,
  AccessConflictRecord,
  TicketsAccessSummary
} from '../../types/tickets-access.types'
import { ticketsAccessService } from '../../services/ticketsAccess.service'

export const AccessControlHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gates' | 'devices' | 'scanner' | 'conflicts'>('scanner')
  const [summary, setSummary] = useState<TicketsAccessSummary | null>(null)
  const [gates, setGates] = useState<AccessGateRecord[]>([])
  const [devices, setDevices] = useState<AccessDeviceRecord[]>([])
  const [validations, setValidations] = useState<AccessValidationLog[]>([])
  const [conflicts, setConflicts] = useState<AccessConflictRecord[]>([])
  const [loading, setLoading] = useState(false)

  // Estados do Simulador de Validação Ótica
  const [scannedCode, setScannedCode] = useState('SEC-TKT-981240-01-V2-7d8a9e')
  const [selectedGateId, setSelectedGateId] = useState('GATE-SUL-01')
  const [selectedDeviceId, setSelectedDeviceId] = useState('DEV-COL-01')
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [supervisorOverride, setSupervisorOverride] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [scanResult, setScanResult] = useState<{
    success: boolean
    result: string
    message: string
    log?: AccessValidationLog
  } | null>(null)
  const [validating, setValidating] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [sum, gts, devs, vals, confs] = await Promise.all([
        ticketsAccessService.getAccessSummary(),
        ticketsAccessService.getGates(),
        ticketsAccessService.getDevices(),
        ticketsAccessService.getValidations(),
        ticketsAccessService.getConflicts()
      ])
      setSummary(sum)
      setGates(gts)
      setDevices(devs)
      setValidations(vals)
      setConflicts(confs)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scannedCode.trim()) return

    setValidating(true)
    setScanResult(null)
    try {
      const res = await ticketsAccessService.validateAccess({
        credentialCode: scannedCode.trim(),
        gateId: selectedGateId,
        deviceId: selectedDeviceId,
        isOffline: isOfflineMode,
        supervisorOverride,
        overrideReason: supervisorOverride ? overrideReason : undefined
      })
      setScanResult(res)
      await loadData()
    } finally {
      setValidating(false)
    }
  }

  const handleResolveConflict = async (
    conflictId: string,
    resolution: 'RESOLVIDO_ACESSO_CONFIRMADO' | 'RESOLVIDO_BARRADO'
  ) => {
    const notes = prompt('Informe a nota de resolução do supervisor:')
    if (notes === null) return

    await ticketsAccessService.resolveConflict(conflictId, resolution, notes)
    await loadData()
  }

  return (
    <div className="space-y-2 w-full max-w-none animate-fadeIn">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Disk Acesso • Portaria & Catracas
            </span>
            <span className="text-xs text-slate-500 font-semibold">• Operação Online e Offline</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Scan className="w-7 h-7 text-emerald-600" />
            Central de Controle de Acesso
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Monitoramento de portões, leitores e catracas em tempo real. Suporte a validação ótica rápida com detecção de duplicidades, credenciais revogadas e contingência offline sincronizada.
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

      {/* Indicadores de Controle de Acesso */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Entradas Confirmadas</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <strong className="text-2xl font-black text-slate-900 mt-1 block">{summary.usedTickets}</strong>
            <span className="text-[11px] text-emerald-600 font-semibold">{summary.checkinPercentage}% de comparecimento</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Portões Operando</span>
              <Wifi className="w-4 h-4 text-emerald-600" />
            </div>
            <strong className="text-2xl font-black text-emerald-600 mt-1 block">{summary.liveGatesOnline}</strong>
            <span className="text-[11px] text-slate-500 font-semibold">100% dos portões ativos</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dispositivos Conectados</span>
              <Smartphone className="w-4 h-4 text-blue-600" />
            </div>
            <strong className="text-2xl font-black text-blue-600 mt-1 block">{summary.devicesConnected}</strong>
            <span className="text-[11px] text-blue-600 font-semibold">Coletores & Catracas</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Conflitos de Portaria</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <strong className="text-2xl font-black text-amber-600 mt-1 block">{summary.activeConflictsCount}</strong>
            <span className="text-[11px] text-amber-700 font-semibold">
              {summary.activeConflictsCount > 0 ? 'Aguardando decisão' : 'Nenhuma divergência pendente'}
            </span>
          </div>
        </div>
      )}

      {/* Navegação de Abas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('scanner')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'scanner'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scan className="w-4 h-4" />
          <span>Validador Ótico / Catraca</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gates')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'gates'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>Portões ({gates.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('devices')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'devices'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Dispositivos ({devices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('conflicts')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
            activeTab === 'conflicts'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Central de Conflitos ({conflicts.length})</span>
        </button>
      </div>

      {/* Aba 1: Validador Ótico e Simulador */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna do Simulador */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Scan className="w-5 h-5 text-emerald-600" />
                Leitor Ótico de Catraca (Disk Acesso)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Simule a leitura ótica de um QR code ou código de credencial segura para validar as regras do evento.
              </p>
            </div>

            <form onSubmit={handleValidate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Código de Credencial ou Payload do QR *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SEC-TKT-981240-01-V2-7d8a9e"
                  value={scannedCode}
                  onChange={e => setScannedCode(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setScannedCode('SEC-TKT-981240-01-V2-7d8a9e')}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-1 rounded"
                  >
                    Ativo v2 (Válido)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScannedCode('SEC-TKT-981240-01-V1-1a2b3c')}
                    className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-2 py-1 rounded"
                  >
                    Revogado v1 (Transferido)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScannedCode('SEC-TKT-981240-02-V1-3b4c5d')}
                    className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded"
                  >
                    Já Utilizado (Duplicado)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScannedCode('SEC-TKT-981242-01-V1-8c7b6a')}
                    className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold px-2 py-1 rounded"
                  >
                    Bloqueado
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Portão</label>
                  <select
                    value={selectedGateId}
                    onChange={e => setSelectedGateId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {gates.map(g => (
                      <option value={g.id} key={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dispositivo Leitor</label>
                  <select
                    value={selectedDeviceId}
                    onChange={e => setSelectedDeviceId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {devices.map(d => (
                      <option value={d.id} key={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modo Offline Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {isOfflineMode ? <WifiOff className="w-4 h-4 text-amber-600" /> : <Wifi className="w-4 h-4 text-emerald-600" />}
                  <div>
                    <span className="font-bold text-slate-800">Modo Offline (Cache Local)</span>
                    <span className="text-[11px] text-slate-500 block">Valida contra lista de revogações em memória</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isOfflineMode}
                  onChange={e => setIsOfflineMode(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>

              {/* Override de Supervisor */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <UserCheck className="w-4 h-4 text-amber-700" />
                    <span>Override de Supervisor (Liberação Manual)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={supervisorOverride}
                    onChange={e => setSupervisorOverride(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                </div>
                {supervisorOverride && (
                  <div>
                    <label className="block text-[11px] font-bold text-amber-800 mb-1">
                      Justificativa Obrigatória *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Documento físico apresentado com consentimento"
                      value={overrideReason}
                      onChange={e => setOverrideReason(e.target.value)}
                      className="w-full p-2 border border-amber-300 rounded-lg text-xs bg-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={validating}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                <Scan className="w-4 h-4" />
                <span>{validating ? 'Validando na Catraca...' : 'Disparar Leitura Ótica'}</span>
              </button>
            </form>

            {/* Resultado da Leitura */}
            {scanResult && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 animate-scaleUp ${
                  scanResult.result === 'PERMITIDO' || scanResult.result === 'OVERRIDE_SUPERVISOR'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : scanResult.result === 'DUPLICADO'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : scanResult.result === 'SETOR_INVALIDO'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {scanResult.result === 'PERMITIDO' || scanResult.result === 'OVERRIDE_SUPERVISOR' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                )}
                <div>
                  <strong className="block font-black text-sm uppercase">
                    Resultado: {scanResult.result}
                  </strong>
                  <p className="text-xs mt-0.5">{scanResult.message}</p>
                  {scanResult.log && (
                    <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                      Log #{scanResult.log.id} • {new Date(scanResult.log.validatedAt).toLocaleTimeString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Coluna do Histórico de Validações Recentes */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Feed de Validações em Tempo Real
                </h3>
                <p className="text-xs text-slate-500">Últimos registros auditados nas catracas e coletores.</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Sincronizado
              </span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {validations.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Nenhuma validação registrada nesta sessão.
                </div>
              ) : (
                validations.map(v => (
                  <div
                    key={v.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          v.result === 'PERMITIDO' || v.result === 'OVERRIDE_SUPERVISOR'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {v.result === 'PERMITIDO' || v.result === 'OVERRIDE_SUPERVISOR' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span>{v.holderName}</span>
                          <span className="font-mono text-slate-400 font-normal">({v.ticketId})</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          {v.gateName} • {v.sector}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          v.result === 'PERMITIDO' || v.result === 'OVERRIDE_SUPERVISOR'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {v.result}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(v.validatedAt).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aba 2: Portões */}
      {activeTab === 'gates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gates.map(g => (
            <div key={g.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{g.id}</span>
                  <h3 className="font-bold text-base text-slate-800 mt-0.5">{g.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{g.location}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {g.status}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Entradas Totais:</span>
                  <strong className="text-slate-800 text-sm font-black">{g.totalEntriesCount}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Última Hora:</span>
                  <strong className="text-emerald-600 text-sm font-black">+{g.entriesLastHour}/h</strong>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-600 block mb-1">Setores Liberados:</span>
                <div className="flex flex-wrap gap-1">
                  {g.sectorsAllowed.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aba 3: Dispositivos */}
      {activeTab === 'devices' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {devices.map(d => (
            <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{d.id}</span>
                  <h3 className="font-bold text-base text-slate-800 mt-0.5">{d.name}</h3>
                  <span className="text-xs text-indigo-600 font-semibold">{d.gateName}</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-xs text-slate-700">
                  {d.isCharging ? <BatteryCharging className="w-4 h-4 text-emerald-600" /> : <Battery className="w-4 h-4 text-slate-600" />}
                  <span>{d.batteryLevel}%</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Operador Logado:</span>
                  <strong className="text-slate-800">{d.operatorName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ingressos em Cache:</span>
                  <span className="font-mono font-bold text-slate-700">{d.cachedTicketsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sincronização:</span>
                  <span className="font-bold text-emerald-600">{d.syncStatus}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aba 4: Central de Conflitos */}
      {activeTab === 'conflicts' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
                Central de Conflitos & Divergências de Portaria
              </h3>
              <p className="text-xs text-slate-500">
                Tentativas de reuso de ingresso, versões antigas de QR code ou conflitos de sincronização offline.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {conflicts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Nenhum conflito de portaria registrado no momento.
              </div>
            ) : (
              conflicts.map(c => (
                <div
                  key={c.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-700">{c.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        {c.reasonLabelPtBr}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800">
                      Ingresso #{c.ticketId} • Titular: {c.holderName} ({c.sector})
                    </p>
                    <div className="text-slate-500 text-[11px]">
                      1ª Leitura: {c.firstEntry.gateName} ({c.firstEntry.operatorName}) às {new Date(c.firstEntry.at).toLocaleTimeString('pt-BR')}
                    </div>
                    {c.resolutionNotes && (
                      <div className="p-2 bg-white rounded border border-slate-200 text-slate-700 text-[11px] mt-1">
                        <strong>Parecer do Supervisor:</strong> {c.resolutionNotes} ({c.resolvedBy})
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-end gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'PENDENTE'
                          ? 'bg-amber-100 text-amber-800'
                          : c.status === 'RESOLVIDO_ACESSO_CONFIRMADO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {c.status}
                    </span>
                    {c.status === 'PENDENTE' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleResolveConflict(c.id, 'RESOLVIDO_ACESSO_CONFIRMADO')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition"
                        >
                          Liberar Acesso
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveConflict(c.id, 'RESOLVIDO_BARRADO')}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg transition"
                        >
                          Barrar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
