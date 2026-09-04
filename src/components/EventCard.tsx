import { CalendarDays, Layers3, MapPin, MoreHorizontal, Pencil, Settings2 } from 'lucide-react'
import type { EventItem } from '../data/events'

type Props = {
  event: EventItem
  onEdit: (event: EventItem) => void
  onLots: (event: EventItem) => void
  onDashboard: (event: EventItem) => void
  onOpen: (event: EventItem) => void
  isComparing?: boolean
  isSelectedForCompare?: boolean
  onToggleCompare?: (event: EventItem) => void
}

export default function EventCard({
  event,
  onEdit,
  onLots,
  onDashboard,
  onOpen,
  isComparing = false,
  isSelectedForCompare = false,
  onToggleCompare
}: Props) {
  const occupancyNum = parseFloat(event.occupancy)
  const high = occupancyNum > 50

  const handleClick = () => {
    if (isComparing) {
      onToggleCompare?.(event)
    } else {
      onOpen(event)
    }
  }

  return (
    <article
      className={`event-card event-card-clickable ${isComparing ? 'is-comparing' : ''} ${isSelectedForCompare ? 'selected-for-compare' : ''}`}
      data-testid="event-card"
      data-event-id={event.id}
      data-event-code={event.code}
      data-producer-id={event.producerId}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {isComparing && (
        <div
          className="event-compare-checkbox-wrap"
          onClick={e => {
            e.stopPropagation()
            onToggleCompare?.(event)
          }}
          title="Selecionar para comparar"
          data-testid={`checkbox-compare-${event.id}`}
        >
          <input
            type="checkbox"
            className="event-compare-checkbox"
            checked={isSelectedForCompare}
            readOnly
          />
        </div>
      )}
      <div className={`event-cover ${event.cover}`}>
        {event.badge && <span className="cover-badge">{event.badge}</span>}
        <div className="cover-overlay">
          <strong>{event.title.split('•')[0].trim()}</strong>
          <span>{event.badge || event.category || event.city}</span>
        </div>
        <span className="event-id" data-testid="event-code">{event.code}</span>
      </div>
      <div className="event-body">
        <div>
          <div className="title-with-status"><h3 data-testid="event-title">{event.title}</h3><span className={`status-pill ${event.status}`}>{event.status}</span></div>
          <p className="venue"><MapPin size={17}/>{event.venue}</p>
        </div>
        <div className="metrics event-card-metrics" data-testid="event-metrics">
          <Metric label="Total (R$)" value={event.total} accent="green" />
          <Metric label="Vendas" value={String(event.sales)} accent="blue" />
          <Metric label="Disponível" value={String(event.available)} accent="cyan" />
          <Metric label="Cortesia" value={String(event.courtesy)} accent="slate" />
          <Metric label="Ocupação" value={event.occupancy} accent={high ? 'orange' : 'blue'} />
        </div>
        <div className="card-footer event-card-footer">
          <span><CalendarDays size={17}/>{event.date}</span>
          <div className="actions event-card-actions">
            <button title="Painel do evento" onClick={e=>{e.stopPropagation();onDashboard(event)}}><Settings2 size={17}/></button>
            <button title="Editar evento" onClick={e=>{e.stopPropagation();onEdit(event)}}><Pencil size={17}/></button>
            <button title="Lotes" onClick={e=>{e.stopPropagation();onLots(event)}}><Layers3 size={18}/></button>
            <button title="Mais opções" onClick={e=>e.stopPropagation()}><MoreHorizontal size={18}/></button>
          </div>
        </div>
      </div>
    </article>
  )
}

function Metric({label, value, accent}:{label:string;value:string;accent:string}) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong><i className={`metric-line ${accent}`}/></div>
}
