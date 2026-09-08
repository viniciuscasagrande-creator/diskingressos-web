import { useState, useEffect, useCallback } from 'react'
import {
  getCommercialDashboard,
  type CommercialDashboardParams
} from '../services/eventCommercialApi'
import type { CommercialDashboardResponse } from '../types/event-commercial'

export function useCommercialDashboard(
  eventId: number | string,
  initialParams?: CommercialDashboardParams,
  notify?: (message: string) => void
) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CommercialDashboardResponse | null>(null)
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'all'>(initialParams?.period || '30d')
  const [selectedPayment, setSelectedPayment] = useState<string | null>(initialParams?.paymentMethod || null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getCommercialDashboard(eventId, {
        period,
        paymentMethod: selectedPayment || undefined
      })
      setData(res)
    } catch (err: any) {
      const msg = err?.message || 'Erro ao carregar dados comerciais do evento.'
      setError(msg)
      notify?.(msg)
    } finally {
      setLoading(false)
    }
  }, [eventId, period, selectedPayment, notify])

  useEffect(() => {
    reload()
  }, [reload])

  return {
    data,
    loading,
    error,
    reload,
    period,
    setPeriod,
    selectedPayment,
    setSelectedPayment
  }
}
