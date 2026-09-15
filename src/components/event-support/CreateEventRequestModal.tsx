import React, { useState } from 'react'
import { X, PlusCircle, Building, MapPin, Calendar, Users, Layers, ShieldCheck, AlertCircle } from 'lucide-react'
import type { EventSupportRequest, PriorityLevel } from '../../types/event-support.types'
import { eventSupportService } from '../../services/eventSupport.service'

interface CreateEventRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onRequestCreated: (newRequest: EventSupportRequest) => void
}

export const CreateEventRequestModal: React.FC<CreateEventRequestModalProps> = ({
  isOpen,
  onClose,
  onRequestCreated
}) => {
  const [eventName, setEventName] = useState('')
  const [producerName, setProducerName] = useState('Opus Entretenimento Curitiba')
  const [venueName, setVenueName] = useState('Teatro Positivo — Grande Auditório')
  const [city, setCity] = useState('Curitiba')
  const [state, setState] = useState('PR')
  const [eventDate, setEventDate] = useState('20/11/2026 21:00')
  const [capacity, setCapacity] = useState(2400)
  const [hasMap, setHasMap] = useState(true)
  const [priority, setPriority] = useState<PriorityLevel>('NORMAL')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventName.trim() || !venueName.trim() || !city.trim()) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const created = await eventSupportService.createRequest({
        eventName,
        producerName,
        venueName,
        city,
        state,
        eventDate,
        capacity: Number(capacity),
        hasMap,
        priority
      })

      onRequestCreated(created)
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao criar solicitação de evento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      data-testid="create-event-request-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
    >
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Cabeçalho do Modal */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-600 rounded-lg text-white">
              <PlusCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold">Solicitação de Abertura de Evento</h3>
              <p className="text-xs text-slate-400">
                Fila de Implantação e Montagem do Suporte a Eventos (Disk Interno)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com grid alinhado */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Nome Oficial do Evento *</label>
            <input
              type="text"
              required
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Ex: Show Acústico Internacional, Festival de Verão..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Produtora Responsável
              </label>
              <input
                type="text"
                required
                value={producerName}
                onChange={(e) => setProducerName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data e Horário do Evento *
              </label>
              <input
                type="text"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="Ex: 20/11/2026 21:00"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Local / Venue *
              </label>
              <input
                type="text"
                required
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="Ex: Teatro Positivo, Live Curitiba, Ligga Arena..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Cidade / UF *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  maxLength={2}
                  className="w-12 text-center px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Capacidade Total
              </label>
              <input
                type="number"
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Tipo de Mapa
              </label>
              <select
                value={hasMap ? 'marcado' : 'livre'}
                onChange={(e) => setHasMap(e.target.value === 'marcado')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              >
                <option value="marcado">Assentos Marcados (Disk Maps)</option>
                <option value="livre">Lugar Livre / Pista</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Prioridade Operacional
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              >
                <option value="NORMAL">Normal</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente (SLA 24h)</option>
                <option value="BAIXA">Baixa</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-indigo-950 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <p className="text-[11px] leading-relaxed">
              Ao submeter, o Disk Core gerará automaticamente o protocolo e incluirá a solicitação na fila de montagem da equipe técnica de Suporte a Eventos.
            </p>
          </div>

          {/* Botões de Ação do Rodapé com Alinhamento Perfeito */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-2"
            >
              {loading ? (
                <span>Gravando...</span>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Submeter ao Suporte Disk</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
