import React from 'react'
import EventCommercialDashboardPage from '../pages/eventos/EventCommercialDashboardPage'
import type { EventItem } from '../data/events'
import './EventCommercialDashboard.css'

interface Props {
  event: EventItem
  onNavigate?: (page: any, context?: any) => void
  notify?: (message: string) => void
}

export default function EventCommercialDashboard(props: Props) {
  return <EventCommercialDashboardPage {...props} />
}

export { EventCommercialDashboardPage }
