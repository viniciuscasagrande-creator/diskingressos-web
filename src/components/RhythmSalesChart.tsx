import React from 'react'
import { SalesVelocityChart } from './event-commercial/EventCommercialCharts'
import type { SalesVelocityStats } from '../types/event-commercial'

interface Props {
  stats: SalesVelocityStats
}

export default function RhythmSalesChart({ stats }: Props) {
  return <SalesVelocityChart stats={stats} />
}

export { SalesVelocityChart as RhythmSalesChart }
