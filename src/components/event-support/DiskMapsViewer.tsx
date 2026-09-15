import React, { useState } from 'react'
import {
  Layers,
  CheckCircle2,
  Lock,
  Clock,
  Ban,
  Gift,
  Eye,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import type { SeatingMap, SeatItem, SeatStatus } from '../../types/event-support.types'
import { eventSupportService } from '../../services/eventSupport.service'

interface DiskMapsViewerProps {
  map: SeatingMap
  onSeatSelect?: (seat: SeatItem) => void
  readOnly?: boolean
}

export const DiskMapsViewer: React.FC<DiskMapsViewerProps> = ({ map, onSeatSelect, readOnly = false }) => {
  const [currentMap, setCurrentMap] = useState<SeatingMap>(map)
  const [selectedSeat, setSelectedSeat] = useState<SeatItem | null>(null)
  const [activeSectorFilter, setActiveSectorFilter] = useState<string>('all')

  const handleUpdateSeatStatus = async (newStatus: SeatStatus) => {
    if (!selectedSeat) return
    const res = await eventSupportService.updateSeatStatus(currentMap.id, selectedSeat.id, newStatus, selectedSeat.status)
    if (res.ok) {
      const updatedSeats = currentMap.seats.map((s) =>
        s.id === selectedSeat.id ? { ...s, status: newStatus } : s
      )
      const updatedSeat = { ...selectedSeat, status: newStatus }
      setSelectedSeat(updatedSeat)
      setCurrentMap((prev) => ({
        ...prev,
        seats: updatedSeats,
        totalAvailable: updatedSeats.filter((s) => s.status === 'AVAILABLE').length,
        totalBlocked: updatedSeats.filter((s) => s.status === 'BLOCKED' || s.status === 'TECHNICAL_HOLD').length
      }))
    }
  }

  const handleSeatClick = (seat: SeatItem) => {
    setSelectedSeat(seat)
    if (onSeatSelect) {
      onSeatSelect(seat)
    }
  }

  // Agrupamento por fileiras
  const rowsMap = new Map<string, SeatItem[]>()
  map.seats.forEach((seat) => {
    if (!rowsMap.has(seat.row)) {
      rowsMap.set(seat.row, [])
    }
    rowsMap.get(seat.row)!.push(seat)
  })

  const rows = Array.from(rowsMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))

  const getStatusColor = (status: SeatStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600'
      case 'HELD':
        return 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-500 animate-pulse'
      case 'SOLD':
        return 'bg-slate-400 text-slate-700 cursor-not-allowed border-slate-500 opacity-60'
      case 'BLOCKED':
      case 'TECHNICAL_HOLD':
        return 'bg-rose-500 text-white border-rose-600'
      case 'COURTESY':
        return 'bg-indigo-500 text-white border-indigo-600'
      default:
        return 'bg-slate-300 border-slate-400'
    }
  }

  const getStatusLabelPtBr = (status: SeatStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Disponível'
      case 'HELD':
        return 'Em Reserva Temporária'
      case 'SOLD':
        return 'Vendido'
      case 'BLOCKED':
        return 'Bloqueado'
      case 'TECHNICAL_HOLD':
        return 'Bloqueio Técnico'
      case 'COURTESY':
        return 'Cortesia'
      default:
        return status
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-xl">
      {/* Cabeçalho do Mapa */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                {map.name}
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                  {map.version}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Assento Marcado
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Local: <strong className="text-slate-200">{map.venueName}</strong> • Última revisão por {map.modifiedBy} em {map.lastModified}
              </p>
            </div>
          </div>
        </div>

        {/* Resumo de Inventário */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-xs">
          <div className="text-center px-2 border-r border-slate-800">
            <p className="text-slate-400 font-medium">Capacidade</p>
            <p className="text-sm font-bold text-slate-100">{map.totalCapacity}</p>
          </div>
          <div className="text-center px-2 border-r border-slate-800">
            <p className="text-emerald-400 font-medium">Disponíveis</p>
            <p className="text-sm font-bold text-emerald-400">{map.totalAvailable}</p>
          </div>
          <div className="text-center px-2 border-r border-slate-800">
            <p className="text-amber-400 font-medium">Em Reserva</p>
            <p className="text-sm font-bold text-amber-400">{map.totalHeld}</p>
          </div>
          <div className="text-center px-2 border-r border-slate-800">
            <p className="text-slate-400 font-medium">Vendidos</p>
            <p className="text-sm font-bold text-slate-300">{map.totalSold}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-rose-400 font-medium">Bloqueados</p>
            <p className="text-sm font-bold text-rose-400">{map.totalBlocked}</p>
          </div>
        </div>
      </div>

      {/* Legenda de Estados e Setores */}
      <div className="py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 text-xs">
        {/* Setores */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Setores:</span>
          <button
            onClick={() => setActiveSectorFilter('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              activeSectorFilter === 'all'
                ? 'bg-slate-700 text-white font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos
          </button>
          {map.sectors.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSectorFilter(sec.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                activeSectorFilter === sec.id
                  ? 'ring-2 ring-white font-bold'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sec.color }} />
              <span>{sec.name}</span>
              <span className="text-[10px] text-slate-400">(R$ {sec.basePrice})</span>
            </button>
          ))}
        </div>

        {/* Legenda de Status pt-BR */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Disponível
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" /> Em Reserva (10 min)
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Vendido
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Bloqueado
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Cortesia
          </span>
        </div>
      </div>

      {/* Palco / Palco Frontal */}
      <div className="my-6 max-w-xl mx-auto text-center">
        <div className="py-2.5 bg-gradient-to-b from-indigo-600/30 to-slate-800 border border-indigo-500/30 rounded-t-2xl shadow-inner">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
            PALCO PRINCIPAL
          </span>
        </div>
        <div className="h-1 bg-indigo-500/40 w-full rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
      </div>

      {/* Grade de Assentos do Auditório */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[680px] flex flex-col items-center gap-2">
          {rows.map(([rowName, seatsInRow]) => {
            const rowSector = map.sectors.find((s) => s.id === seatsInRow[0]?.sectorId)
            const isFilteredOut = activeSectorFilter !== 'all' && rowSector?.id !== activeSectorFilter

            if (isFilteredOut) return null

            return (
              <div key={rowName} className="flex items-center gap-3">
                {/* Identificador da Fila (Esquerda) */}
                <span className="w-6 text-center text-xs font-bold text-slate-400 font-mono">
                  {rowName}
                </span>

                {/* Fileira de Cadeiras */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-950/40 rounded-lg border border-slate-800/40">
                  {seatsInRow.map((seat) => {
                    const isSelected = selectedSeat?.id === seat.id
                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={readOnly}
                        onClick={() => handleSeatClick(seat)}
                        title={`Fila ${seat.row}, Assento ${seat.number} • ${getStatusLabelPtBr(seat.status)} • R$ ${seat.price},00`}
                        className={`w-7 h-7 rounded-md text-[11px] font-bold flex items-center justify-center transition-all duration-150 border ${getStatusColor(
                          seat.status
                        )} ${isSelected ? 'ring-2 ring-yellow-400 scale-110 shadow-lg' : ''}`}
                      >
                        {seat.number}
                      </button>
                    )
                  })}
                </div>

                {/* Identificador da Fila (Direita) */}
                <span className="w-6 text-center text-xs font-bold text-slate-400 font-mono">
                  {rowName}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Painel do Assento Selecionado */}
      {selectedSeat && (
        <div className="mt-6 p-4 bg-slate-950/90 rounded-xl border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border ${getStatusColor(selectedSeat.status)}`}>
              {selectedSeat.row}{selectedSeat.number}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Fila {selectedSeat.row}, Assento {selectedSeat.number}
                {selectedSeat.isAccessible && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-900 text-sky-200 border border-sky-700 font-medium">
                    Acessível PCD
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400">
                Setor: <span className="text-slate-200">{map.sectors.find((s) => s.id === selectedSeat.sectorId)?.name}</span> •
                Status: <strong className="text-indigo-300">{getStatusLabelPtBr(selectedSeat.status)}</strong> •
                Valor Face: <strong className="text-emerald-400">R$ {selectedSeat.price},00</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedSeat.status === 'SOLD' ? (
              <span className="text-xs text-amber-300 bg-amber-950/50 border border-amber-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Ingresso Vendido (Alteração protegida contra IDOR / Overbooking)
              </span>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {selectedSeat.status !== 'BLOCKED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateSeatStatus('BLOCKED')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    Bloquear Assento
                  </button>
                )}
                {selectedSeat.status !== 'AVAILABLE' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateSeatStatus('AVAILABLE')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    Liberar p/ Venda
                  </button>
                )}
                {selectedSeat.status !== 'COURTESY' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateSeatStatus('COURTESY')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    Cortesia
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
