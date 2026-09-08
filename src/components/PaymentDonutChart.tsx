import React from 'react'
import { PaymentDonutChart as InternalPaymentDonutChart } from './event-commercial/EventCommercialCharts'
import type { PaymentMethodItem } from '../types/event-commercial'

interface Props {
  items: PaymentMethodItem[]
  totalCount: number
  selectedMethod?: string | null
  onSelectMethod?: (id: string) => void
}

export default function PaymentDonutChart(props: Props) {
  return <InternalPaymentDonutChart {...props} />
}

export { InternalPaymentDonutChart as PaymentDonutChart }
