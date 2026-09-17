import React, { type HTMLAttributes, type ReactNode } from 'react'

export interface DiskToolbarProps extends HTMLAttributes<HTMLDivElement> {
  label?: string
  children: ReactNode
  className?: string
}

export const DiskToolbar: React.FC<DiskToolbarProps> = ({
  label,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`disk-toolbar flex flex-wrap items-center gap-2 mb-4 ${className}`}
      data-testid="disk-toolbar"
      {...props}
    >
      {label && (
        <span className="text-xs font-semibold text-[var(--disk-text-muted,#64748b)] mr-1">
          {label}
        </span>
      )}
      {children}
    </div>
  )
}

export interface DiskToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'indigo' | 'sky' | 'emerald'
  icon?: ReactNode
  children: ReactNode
}

export const DiskToolbarButton: React.FC<DiskToolbarButtonProps> = ({
  variant = 'secondary',
  icon,
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-[var(--disk-color-primary,#f97316)] hover:bg-[var(--disk-color-primary-hover,#ea580c)] text-white shadow-xs',
    secondary: 'bg-[var(--disk-bg-surface,#ffffff)] hover:bg-[var(--disk-bg-muted,#f1f5f9)] text-[var(--disk-text-primary,#0f172a)] border border-[var(--disk-border-default,#e2e8f0)] shadow-xs',
    outline: 'bg-transparent hover:bg-[var(--disk-bg-muted,#f1f5f9)] text-[var(--disk-text-secondary,#475569)] border border-[var(--disk-border-default,#e2e8f0)]',
    ghost: 'bg-transparent hover:bg-[var(--disk-bg-muted,#f1f5f9)] text-[var(--disk-text-secondary,#475569)]',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs',
    sky: 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
  }[variant]

  return (
    <button
      type="button"
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}

export default DiskToolbar
