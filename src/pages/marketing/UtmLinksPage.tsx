import type { EventItem } from '../../data/events'
import EventUtmCentralPage from './EventUtmCentralPage'

interface UtmLinksPageProps {
  event?: EventItem
  notify?: (message: string) => void
}

/** Mantido para compatibilidade com módulos antigos do MarketingHub. */
export function UtmLinksPage({ event, notify }: UtmLinksPageProps) {
  return <EventUtmCentralPage event={event} notify={notify} />
}

export { EventUtmCentralPage }
