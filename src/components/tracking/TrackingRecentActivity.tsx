import React, { useState } from 'react'
import { Activity, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

type ActivityItem = {
  id: number
  eventName: string
  status: string
  responseCode: number | null
  message: string | null
  createdAt: string
  integrationName: string
  provider: string
}

type Props = {
  activity: ActivityItem[]
}

export default function TrackingRecentActivity({ activity }: Props) {
  const [filter, setFilter] = useState<'all' | 'ok' | 'error'>('all')

  const filtered = activity.filter(item => {
    if (filter === 'ok') return item.status === 'ok'
    if (filter === 'error') return item.status !== 'ok'
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            Fluxo de Disparos & Telemetria
          </h4>
          <small style={{ color: '#64748b' }}>
            Registros técnicos de envio com sanitização de segurança (nenhum dado pessoal ou credencial sensível é registrado).
          </small>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={`btn ${filter === 'all' ? 'primary' : 'secondary'}`}
            style={{ fontSize: '11px', padding: '4px 10px' }}
            onClick={() => setFilter('all')}
          >
            Todos ({activity.length})
          </button>
          <button
            type="button"
            className={`btn ${filter === 'ok' ? 'primary' : 'secondary'}`}
            style={{ fontSize: '11px', padding: '4px 10px' }}
            onClick={() => setFilter('ok')}
          >
            Sucessos
          </button>
          <button
            type="button"
            className={`btn ${filter === 'error' ? 'primary' : 'secondary'}`}
            style={{ fontSize: '11px', padding: '4px 10px' }}
            onClick={() => setFilter('error')}
          >
            Falhas
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '36px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          Nenhum registro de atividade encontrado para este evento.
        </div>
      ) : (
        <div className="tracking-activity-timeline">
          {filtered.map(item => {
            const isOk = item.status === 'ok'
            const date = new Date(item.createdAt)

            return (
              <div className="tracking-activity-item" key={item.id}>
                <div className="tracking-activity-item-left">
                  {isOk ? (
                    <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                  ) : (
                    <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <b>{item.eventName}</b>
                      <span className="status-badge blue" style={{ fontSize: '10px' }}>
                        {item.integrationName}
                      </span>
                    </div>
                    <small style={{ display: 'block', color: '#64748b', marginTop: '2px' }}>
                      {item.message || (isOk ? 'Disparo aceito pelo provedor.' : 'Erro de comunicação.')}
                    </small>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span className={`status-badge ${isOk ? 'green' : 'red'}`} style={{ fontSize: '10px' }}>
                    {isOk ? 'Aceito (200)' : `Erro ${item.responseCode || ''}`}
                  </span>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    <Clock size={11} /> {date.toLocaleTimeString('pt-BR')} · {date.toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
