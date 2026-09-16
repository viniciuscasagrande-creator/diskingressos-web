// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// DiskModal & DiskDrawer — Componentes de Diálogo e Painel Deslizante
// ==============================================================================

import React, { useEffect, useRef } from 'react'
import { X, AlertTriangle } from 'lucide-react'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface DiskModalProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  size?: ModalSize
  isDestructive?: boolean
  preventCloseOnOverlayClick?: boolean
  loading?: boolean
  className?: string
}

export const DiskModal: React.FC<DiskModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  isDestructive = false,
  preventCloseOnOverlayClick = false,
  loading = false,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, loading])

  if (!isOpen) return null

  const sizeClasses: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] h-[90vh]',
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="disk-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (!preventCloseOnOverlayClick && !loading && e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={modalRef}
        data-testid="disk-modal"
        className={`relative w-full rounded-card border border-border bg-surface text-foreground shadow-dropdown overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 ${sizeClasses[size]} ${className}`}
      >
        {/* Cabeçalho do Modal */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-border/80 bg-muted/20 select-none">
            <div className="flex items-start gap-3 min-w-0">
              {isDestructive && (
                <div className="p-2 rounded-xl bg-destructive/10 text-destructive shrink-0">
                  <AlertTriangle size={18} />
                </div>
              )}
              <div>
                {title && (
                  <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {!loading && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar modal"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Corpo do Modal (com rolagem vertical interna) */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] flex-1 text-sm text-foreground">
          {children}
        </div>

        {/* Rodapé de Ações */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 p-4 sm:p-5 border-t border-border/80 bg-muted/20 select-none">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// DiskDrawer: Painel Deslizante Lateral
// -----------------------------------------------------------------------------

export interface DiskDrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  side?: 'right' | 'left'
  width?: string
  className?: string
}

export const DiskDrawer: React.FC<DiskDrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
  width = 'max-w-md w-full',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const slideClass =
    side === 'right'
      ? 'animate-in slide-in-from-right duration-200'
      : 'animate-in slide-in-from-left duration-200'

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="disk-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        data-testid="disk-drawer"
        className={`relative h-full bg-surface border-border text-foreground shadow-dropdown flex flex-col select-none ${
          side === 'right' ? 'ml-auto border-l' : 'mr-auto border-r'
        } ${width} ${slideClass} ${className}`}
      >
        {/* Cabeçalho do Drawer */}
        <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b border-border/80">
          <div className="min-w-0">
            {title && (
              <h2 className="text-base font-bold text-foreground tracking-tight truncate">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Corpo do Drawer */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-sm text-foreground">
          {children}
        </div>

        {/* Rodapé do Drawer */}
        {footer && (
          <div className="p-4 sm:p-5 border-t border-border/80 bg-muted/20 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
