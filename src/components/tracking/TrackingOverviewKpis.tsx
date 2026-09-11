import React from 'react'
import { PlugZap, CircleCheck, AlertTriangle, Activity, Send } from 'lucide-react'

type Props = {
  summary: {
    totalIntegrations: number
    activeIntegrations: number
    problemIntegrations: number
    receivingEvents: number
    eventsSent24h: number
  }
}

export default function TrackingOverviewKpis({ summary }: Props) {
  return (
    <div className="tracking-kpi-row">
      <div className="tracking-kpi-card">
        <div className="tracking-kpi-icon blue">
          <PlugZap size={20} />
        </div>
        <div className="tracking-kpi-content">
          <b>{summary.totalIntegrations}</b>
          <small>Total de Integrações</small>
        </div>
      </div>

      <div className="tracking-kpi-card">
        <div className="tracking-kpi-icon green">
          <CircleCheck size={20} />
        </div>
        <div className="tracking-kpi-content">
          <b>{summary.activeIntegrations}</b>
          <small>Integrações Ativas</small>
        </div>
      </div>

      <div className="tracking-kpi-card">
        <div className={`tracking-kpi-icon ${summary.problemIntegrations > 0 ? 'amber' : 'green'}`}>
          <AlertTriangle size={20} />
        </div>
        <div className="tracking-kpi-content">
          <b style={{ color: summary.problemIntegrations > 0 ? '#b45309' : '#0f172a' }}>
            {summary.problemIntegrations}
          </b>
          <small>Com Problema / Atenção</small>
        </div>
      </div>

      <div className="tracking-kpi-card">
        <div className="tracking-kpi-icon purple">
          <Activity size={20} />
        </div>
        <div className="tracking-kpi-content">
          <b>{summary.receivingEvents}</b>
          <small>Recebendo Eventos</small>
        </div>
      </div>

      <div className="tracking-kpi-card">
        <div className="tracking-kpi-icon indigo">
          <Send size={20} />
        </div>
        <div className="tracking-kpi-content">
          <b>{summary.eventsSent24h.toLocaleString('pt-BR')}</b>
          <small>Eventos Enviados (24h)</small>
        </div>
      </div>
    </div>
  )
}
