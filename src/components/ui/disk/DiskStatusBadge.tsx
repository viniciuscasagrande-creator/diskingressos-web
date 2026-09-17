import React, { type ReactNode } from 'react'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Globe,
  Building,
  Store,
  UserCheck,
  ShieldAlert
} from 'lucide-react'

export type DiskBadgeTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'indigo'
  | 'neutral'
  | 'primary'

export interface DiskStatusBadgeProps {
  status: string
  label?: string
  tone?: DiskBadgeTone
  icon?: ReactNode
  className?: string
}

export const DiskStatusBadge: React.FC<DiskStatusBadgeProps> = ({
  status,
  label,
  tone,
  icon,
  className = ''
}) => {
  // Mapeamento automático de status se tone ou label não forem especificados
  const normalized = status.toUpperCase().trim()

  let resolvedTone: DiskBadgeTone = tone || 'neutral'
  let resolvedLabel = label || status
  let resolvedIcon = icon

  switch (normalized) {
    case 'PAID':
    case 'PAGO':
    case 'APPROVED':
    case 'APROVADO':
    case 'HEALTHY':
    case 'ATIVO':
    case 'CONCLUIDO':
    case 'CONCLUÍDO':
    case 'FULFILLED':
      resolvedTone = tone || 'success'
      resolvedLabel = label || (normalized === 'PAID' ? 'Pago' : normalized === 'FULFILLED' ? 'Concluído' : 'Aprovado')
      if (!icon) resolvedIcon = <CheckCircle2 className="w-3 h-3 shrink-0" />
      break

    case 'AWAITING_PAYMENT':
    case 'PENDING':
    case 'PENDENTE':
    case 'AGUARDANDO_PAGAMENTO':
    case 'AGUARDANDO':
      resolvedTone = tone || 'warning'
      resolvedLabel = label || 'Aguardando Pagamento'
      if (!icon) resolvedIcon = <Clock className="w-3 h-3 shrink-0" />
      break

    case 'REFUNDED':
    case 'ESTORNADO':
    case 'REEMBOLSADO':
      resolvedTone = tone || 'danger'
      resolvedLabel = label || 'Estornado'
      if (!icon) resolvedIcon = <AlertCircle className="w-3 h-3 shrink-0" />
      break

    case 'CANCELLED':
    case 'CANCELADO':
    case 'REJECTED':
    case 'RECUSADO':
      resolvedTone = tone || 'danger'
      resolvedLabel = label || 'Cancelado'
      if (!icon) resolvedIcon = <XCircle className="w-3 h-3 shrink-0" />
      break

    // Canais de Venda
    case 'SITE':
      resolvedTone = tone || 'info'
      resolvedLabel = label || 'Site Oficial'
      if (!icon) resolvedIcon = <Globe className="w-3 h-3 shrink-0" />
      break

    case 'BOX_OFFICE':
    case 'BILHETERIA':
      resolvedTone = tone || 'purple'
      resolvedLabel = label || 'Bilheteria'
      if (!icon) resolvedIcon = <Building className="w-3 h-3 shrink-0" />
      break

    case 'PDV':
      resolvedTone = tone || 'indigo'
      resolvedLabel = label || 'PDV'
      if (!icon) resolvedIcon = <Store className="w-3 h-3 shrink-0" />
      break

    case 'DISK':
    case 'PRODUCER':
    case 'PRODUTOR':
      resolvedTone = tone || 'success'
      resolvedLabel = label || 'Portal Produtor'
      if (!icon) resolvedIcon = <UserCheck className="w-3 h-3 shrink-0" />
      break

    case 'DISPUTE':
    case 'CHARGEBACK':
      resolvedTone = tone || 'danger'
      resolvedLabel = label || 'Disputa'
      if (!icon) resolvedIcon = <ShieldAlert className="w-3 h-3 shrink-0" />
      break

    default:
      resolvedTone = tone || 'neutral'
      break
  }

  const toneStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    primary: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    neutral: 'bg-[var(--disk-bg-muted,#f1f5f9)] text-[var(--disk-text-secondary,#475569)] border-[var(--disk-border-default,#e2e8f0)] dark:border-slate-700'
  }[resolvedTone]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${toneStyles} ${className}`}
      data-status={normalized}
    >
      {resolvedIcon}
      <span>{resolvedLabel}</span>
    </span>
  )
}

export default DiskStatusBadge
