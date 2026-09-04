import React from 'react'
import { ArrowLeftRight, X, ExternalLink, Award, CheckCircle2 } from 'lucide-react'
import type { EventItem } from '../../data/events'

interface Props {
  events: EventItem[]
  onClose: () => void
  onOpenEvent: (event: EventItem) => void
}

export default function EventComparatorModal({ events, onClose, onOpenEvent }: Props) {
  if (!events || events.length === 0) return null

  const parseMoneyNumber = (totalStr: string) => {
    return Number(totalStr.replace(/\./g, '').replace(',', '.')) || 0
  }

  const revenues = events.map(e => parseMoneyNumber(e.total))
  const maxRevenue = Math.max(...revenues)

  const sales = events.map(e => e.sales)
  const maxSales = Math.max(...sales)

  return (
    <div className="ecc-comparator-overlay" onClick={onClose} data-testid="event-comparator-modal">
      <div className="ecc-comparator-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ecc-comparator-header">
          <h2 className="ecc-comparator-title">
            <ArrowLeftRight size={20} className="text-sky-600" />
            Comparador Comercial de Eventos ({events.length} selecionados)
          </h2>
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            onClick={onClose}
            data-testid="btn-close-comparator"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Table */}
        <div className="ecc-comparator-body">
          <div className="overflow-x-auto">
            <table className="ecc-comp-table">
              <thead>
                <tr>
                  <th className="ecc-comp-metric-label">Métrica Operacional</th>
                  {events.map(ev => (
                    <th key={ev.id} style={{ minWidth: '220px' }}>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm"
                          style={{
                            background:
                              ev.status === 'ativo'
                                ? 'linear-gradient(135deg, #0284C7, #2563EB)'
                                : '#64748B'
                          }}
                        >
                          {ev.code}
                        </div>
                        <div>
                          <strong className="block text-slate-900 font-bold text-sm">
                            {ev.title}
                          </strong>
                          <span
                            className={`inline-block text-xs px-2 py-0.5 rounded font-semibold ${
                              ev.status === 'ativo'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {ev.status === 'ativo' ? 'Ativo' : ev.status}
                          </span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 1. Localização */}
                <tr>
                  <td className="ecc-comp-metric-label">Local & Cidade</td>
                  {events.map(ev => (
                    <td key={`venue-${ev.id}`}>
                      {ev.venue} • {ev.city}
                    </td>
                  ))}
                </tr>

                {/* 2. Data & Horário */}
                <tr>
                  <td className="ecc-comp-metric-label">Data do Evento</td>
                  {events.map(ev => (
                    <td key={`date-${ev.id}`}>{ev.date}</td>
                  ))}
                </tr>

                {/* 3. Receita Bruta Total */}
                <tr>
                  <td className="ecc-comp-metric-label">Receita Bruta Total</td>
                  {events.map(ev => {
                    const rev = parseMoneyNumber(ev.total)
                    const isTop = rev === maxRevenue && maxRevenue > 0
                    return (
                      <td key={`rev-${ev.id}`} className={isTop ? 'ecc-comp-highlight' : ''}>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold">R$ {ev.total}</span>
                          {isTop && (
                            <span className="text-xs bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold inline-flex items-center gap-1">
                              <Award size={12} /> Líder
                            </span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {/* 4. Ingressos Vendidos */}
                <tr>
                  <td className="ecc-comp-metric-label">Ingressos Vendidos</td>
                  {events.map(ev => {
                    const isTop = ev.sales === maxSales && maxSales > 0
                    return (
                      <td key={`sales-${ev.id}`}>
                        <div className="flex items-center gap-2">
                          <strong className="text-base font-bold text-slate-900">
                            {ev.sales.toLocaleString('pt-BR')}
                          </strong>
                          {isTop && (
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                              Maior volume
                            </span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {/* 5. Ingressos Disponíveis */}
                <tr>
                  <td className="ecc-comp-metric-label">Estoque Disponível</td>
                  {events.map(ev => (
                    <td key={`avail-${ev.id}`}>{ev.available.toLocaleString('pt-BR')}</td>
                  ))}
                </tr>

                {/* 6. Cortesias */}
                <tr>
                  <td className="ecc-comp-metric-label">Cortesias Emitidas</td>
                  {events.map(ev => (
                    <td key={`court-${ev.id}`}>{ev.courtesy.toLocaleString('pt-BR')}</td>
                  ))}
                </tr>

                {/* 7. Ocupação */}
                <tr>
                  <td className="ecc-comp-metric-label">Taxa de Ocupação</td>
                  {events.map(ev => {
                    const pct = parseFloat(ev.occupancy) || 0
                    return (
                      <td key={`occ-${ev.id}`}>
                        <div className="font-bold text-slate-900">{ev.occupancy}</div>
                        <div className="ecc-comp-occupancy-bar">
                          <div
                            className="ecc-comp-occupancy-fill"
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {/* 8. Ticket Médio */}
                <tr>
                  <td className="ecc-comp-metric-label">Ticket Médio Estimado</td>
                  {events.map(ev => {
                    const rev = parseMoneyNumber(ev.total)
                    const avg = ev.sales > 0 ? rev / ev.sales : 0
                    return (
                      <td key={`avg-${ev.id}`}>
                        <b>
                          {avg.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </b>
                      </td>
                    )
                  })}
                </tr>

                {/* 9. Ritmo de Vendas */}
                <tr>
                  <td className="ecc-comp-metric-label">Ritmo de Vendas</td>
                  {events.map(ev => (
                    <td key={`speed-${ev.id}`}>
                      <span className="text-sky-700 font-semibold">
                        ~{Math.round(ev.sales / 14)} vendas/dia
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 10. Projeção Final */}
                <tr>
                  <td className="ecc-comp-metric-label">Projeção Estimada</td>
                  {events.map(ev => {
                    const rev = parseMoneyNumber(ev.total)
                    const projected = Math.round(rev * 1.6)
                    return (
                      <td key={`proj-${ev.id}`}>
                        <strong className="text-slate-800">
                          {projected.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </strong>
                      </td>
                    )
                  })}
                </tr>

                {/* 11. Formas de Pagamento Principais */}
                <tr>
                  <td className="ecc-comp-metric-label">Formas de Pagamento</td>
                  {events.map(ev => (
                    <td key={`pay-${ev.id}`}>
                      <div className="text-xs space-y-1">
                        <div>PIX: <b>60%</b></div>
                        <div>Crédito: <b>35%</b></div>
                        <div>Outros: <b>5%</b></div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 12. Ação */}
                <tr>
                  <td className="ecc-comp-metric-label">Ação Comercial</td>
                  {events.map(ev => (
                    <td key={`act-${ev.id}`}>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                        onClick={() => {
                          onClose()
                          onOpenEvent(ev)
                        }}
                      >
                        Abrir Painel Comercial
                        <ExternalLink size={13} />
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="ecc-comparator-footer">
          <button
            type="button"
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition cursor-pointer"
            onClick={onClose}
          >
            Fechar Comparador
          </button>
        </div>
      </div>
    </div>
  )
}
