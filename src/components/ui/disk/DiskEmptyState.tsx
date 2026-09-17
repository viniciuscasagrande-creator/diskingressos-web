import React, { type ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export interface DiskEmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export const DiskEmptyState: React.FC<DiskEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div
      className={`disk-empty-state flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-lg border border-dashed border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)]/50 my-4 ${className}`}
      data-testid="disk-empty-state"
    >
      <div className="w-12 h-12 rounded-full bg-[var(--disk-bg-muted,#f1f5f9)] text-[var(--disk-text-muted,#64748b)] flex items-center justify-center mb-3">
        {icon || <Inbox className="w-6 h-6" />}
      </div>

      <h4 className="text-sm sm:text-base font-bold text-[var(--disk-text-primary,#0f172a)] mb-1">
        {title}
      </h4>

      {description && (
        <p className="text-xs text-[var(--disk-text-muted,#64748b)] max-w-md mb-4 leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export default DiskEmptyState
