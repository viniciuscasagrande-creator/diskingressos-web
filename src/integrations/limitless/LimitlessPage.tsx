import React, { type PropsWithChildren } from 'react'
import '../../styles/limitless-disk-bridge.css'

export interface LimitlessPageProps extends PropsWithChildren {
  className?: string
  dataTestId?: string
}

/**
 * LimitlessPage
 * Escopo visual padronizado para páginas integradas ao padrão Limitless
 * Preserva 100% do AppShell, Sidebar, Header, Rotas, Contexto Produtor x Evento e Design System Disk.
 */
export const LimitlessPage: React.FC<LimitlessPageProps> = ({
  children,
  className = '',
  dataTestId = 'limitless-page-wrapper'
}) => {
  return (
    <div className={`disk-limitless-page ${className}`} data-testid={dataTestId}>
      {children}
    </div>
  )
}

export default LimitlessPage
