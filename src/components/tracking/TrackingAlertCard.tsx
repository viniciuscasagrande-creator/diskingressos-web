import React from 'react'
import { AlertCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react'

type Alert = {
  id: string
  severity: 'info' | 'warning' | 'high' | 'critical'
  title: string
  message: string
  provider?: string
  integrationId?: number
  actionText?: string
}

type Props = {
  alert: Alert
  onAction?: (alert: Alert) => void
}

export default function TrackingAlertCard({ alert, onAction }: Props) {
  const getIcon = () => {
    switch (alert.severity) {
      case 'critical':
      case 'high':
        return <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
      case 'warning':
        return <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
      default:
        return <Info size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
    }
  }

  return (
    <div className={`tracking-alert-banner ${alert.severity}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {getIcon()}
        <div>
          <strong style={{ fontSize: '13px', display: 'block' }}>{alert.title}</strong>
          <span style={{ fontSize: '12px', opacity: 0.9 }}>{alert.message}</span>
        </div>
      </div>

      {alert.actionText && onAction && (
        <button
          type="button"
          className="btn secondary"
          style={{ fontSize: '11px', padding: '4px 10px', flexShrink: 0 }}
          onClick={() => onAction(alert)}
        >
          {alert.actionText} <ArrowRight size={12} />
        </button>
      )}
    </div>
  )
}
