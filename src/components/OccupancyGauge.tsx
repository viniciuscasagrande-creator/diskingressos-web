import React from 'react'
import { OccupancyGaugeChart } from './event-commercial/EventCommercialCharts'
import type { OccupancyBreakdown } from '../types/event-commercial'

interface Props {
  data: OccupancyBreakdown
}

export default function OccupancyGauge({ data }: Props) {
  return <OccupancyGaugeChart data={data} />
}

export { OccupancyGaugeChart as OccupancyGauge }
