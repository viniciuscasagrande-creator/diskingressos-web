// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// DiskButton — Botão Institucional Padronizado com Tokens Semânticos
// ==============================================================================

import React from 'react'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link'

export type ButtonSize = 'sm' | 'md' | 'lg'

export interface DiskButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  fullWidth?: boolean
  children?: React.ReactNode
  className?: string
}

export const DiskButton: React.FC<DiskButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-btn',
    md: 'h-10 px-4 text-xs sm:text-sm gap-2 rounded-btn',
    lg: 'h-11 px-5 text-sm sm:text-base gap-2.5 rounded-btn',
  }

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active border border-primary/90 shadow-xs font-bold active:scale-[0.98]',
    secondary:
      'bg-surface hover:bg-muted text-foreground border border-border shadow-xs font-semibold active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-muted/70 text-foreground border border-border font-semibold active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground font-semibold border border-transparent active:scale-[0.98]',
    destructive:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive shadow-xs font-bold active:scale-[0.98]',
    link:
      'bg-transparent text-primary hover:underline font-semibold p-0 h-auto border-0 shadow-none',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      data-testid="disk-button"
      className={`inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children && <span>{children}</span>}
        </span>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  )
}
