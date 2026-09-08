import React from 'react'
import { SalesEvolutionChart } from './event-commercial/EventCommercialCharts'
import type { SalesEvolutionPoint } from '../types/event-commercial'

interface Props {
  points: SalesEvolutionPoint[]
  viewMode?: 'both' | 'revenue' | 'tickets'
}

export default function EvolutionSalesChart({ points, viewMode = 'both' }: Props) {
  return <SalesEvolutionChart points={points} viewMode={viewMode} />
}

export { SalesEvolutionChart }
