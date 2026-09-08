import React from 'react'
import { WeekdayBarChart } from './event-commercial/EventCommercialCharts'
import type { WeekdayDistributionItem } from '../types/event-commercial'

interface Props {
  items: WeekdayDistributionItem[]
}

export default function WeekSalesBars({ items }: Props) {
  return <WeekdayBarChart items={items} />
}

export { WeekdayBarChart as WeekSalesBars }
