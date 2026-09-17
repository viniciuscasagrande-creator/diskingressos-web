import React, { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

export interface DiskModalProps {
  isOpen: boolean
  onClose: () => void
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
}

export const DiskModal: React.FC<DiskModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'lg',
  className = ''
}) => {
  // ESC para fechar
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-[96vw] h-[92vh]'
  }[size]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      data-testid="disk-modal"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${sizeClasses} rounded-xl border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] text-[var(--disk-text-primary,#0f172a)] shadow-2xl transition-all animate-scaleUp z-10 flex flex-col max-h-[90vh] ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-[var(--disk-border-subtle,#f1f5f9)] shrink-0">
          <div className="min-w-0 pr-4">
            {typeof title === 'string' ? (
              <h2 className="text-base sm:text-lg font-bold text-[var(--disk-text-primary,#0f172a)] tracking-tight">
                {title}
              </h2>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-[var(--disk-text-muted,#64748b)] mt-0.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--disk-text-muted,#64748b)] hover:text-[var(--disk-text-primary,#0f172a)] hover:bg-[var(--disk-bg-muted,#f1f5f9)] transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 sm:px-6 py-3 border-t border-[var(--disk-border-subtle,#f1f5f9)] bg-[var(--disk-bg-muted,#f8fafc)] rounded-b-xl flex items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default DiskModal
