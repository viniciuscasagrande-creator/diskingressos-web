import { CalendarDays, Layers3, MapPin, MoreHorizontal, Pencil, Settings2 } from 'lucide-react'
import type { EventItem } from '../data/events'

const COVER_MAP: Record<string, string> = {
  '635': '/events/cover-sonic-1.jpg',
  '630': '/events/cover-sonic-2.jpg',
  '645': '/events/cover-fabio.jpg',
  '631': '/events/cover-nemer.jpg',
  '4113': '/events/cover-sonic-1.jpg',
  '4112': '/events/cover-sonic-1.jpg',
  '4111': '/events/cover-fabio.jpg',
  '4110': '/events/cover-nemer.jpg',
  '4109': '/events/cover-sonic-2.jpg',
  '4108': '/events/cover-sonic-1.jpg',
  '4107': '/events/cover-fabio.jpg',
  '1760': '/events/cover-sonic-1.jpg',
  '3571': '/events/cover-fabio.jpg',
  'nature': '/events/cover-sonic-1.jpg',
  'rock': '/events/cover-sonic-1.jpg',
  'symphonic': '/events/cover-sonic-2.jpg',
  'maiden': '/events/cover-fabio.jpg',
  'comedy': '/events/cover-nemer.jpg',
  'theater': '/events/cover-fabio.jpg',
  'electronic': '/events/cover-sonic-2.jpg',
  'tech': '/events/cover-sonic-2.jpg',
  'circus': '/events/cover-nemer.jpg',
  'running': '/events/cover-sonic-1.jpg',
  'conference': '/events/cover-sonic-1.jpg',
  'conference2': '/events/cover-sonic-2.jpg',
}

const DEFAULT_COVERS = [
  '/events/cover-sonic-1.jpg',
  '/events/cover-sonic-2.jpg',
  '/events/cover-fabio.jpg',
  '/events/cover-nemer.jpg',
]

export function getCoverImage(event: EventItem): string {
  if (event.code && COVER_MAP[event.code]) return COVER_MAP[event.code]
  if (event.cover && COVER_MAP[event.cover]) return COVER_MAP[event.cover]
  const idNum = Number(event.id || event.code || 0)
  return DEFAULT_COVERS[Math.abs(idNum) % DEFAULT_COVERS.length]
}

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
  const coverUrl = getCoverImage(event)

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
      <div
        className={`event-cover ${event.cover || ''}`}
        style={{
          backgroundImage: `url('${coverUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <span className="event-id" data-testid="event-code">{event.code}</span>
      </div>
      <div className="event-body">
        <div className="event-info">
          <h3 data-testid="event-title">{event.title}</h3>
          <p className="venue"><MapPin size={14}/>{event.venue}</p>
        </div>
        <div className="metrics event-card-metrics" data-testid="event-metrics">
          <Metric label="Total (R$)" value={event.total} accent="green" />
          <Metric label="Vendas" value={String(event.sales)} accent="blue" />
          <Metric label="Disponível" value={String(event.available)} accent="cyan" />
          <Metric label="Cortesia" value={String(event.courtesy)} accent="slate" />
          <Metric label="Ocupação" value={event.occupancy} accent={high ? 'orange' : 'blue'} isHigh={high} />
        </div>
        <div className="card-footer event-card-footer">
          <span><CalendarDays size={14}/>{event.date}</span>
          <div className="actions event-card-actions">
            <button title="Painel do evento" onClick={e=>{e.stopPropagation();onDashboard(event)}}><Settings2 size={16}/></button>
            <button title="Editar evento" onClick={e=>{e.stopPropagation();onEdit(event)}}><Pencil size={16}/></button>
            <button title="Lotes" onClick={e=>{e.stopPropagation();onLots(event)}}><Layers3 size={16}/></button>
            <button title="Mais opções" onClick={e=>e.stopPropagation()}><MoreHorizontal size={16}/></button>
          </div>
        </div>
      </div>
    </article>
  )
}

function Metric({label, value, accent, isHigh}:{label:string;value:string;accent:string;isHigh?:boolean}) {
  return <div className="metric"><span>{label}</span><strong className={isHigh ? 'metric-high' : ''}>{value}</strong><i className={`metric-line ${accent}`}/></div>
}
