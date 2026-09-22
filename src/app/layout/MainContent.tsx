// ==============================================================================
// FASE 29.14.1.2 — DESIGN SYSTEM KOMPOSO / DISKINGRESSOS
// Área Principal de Conteúdo do AppShell (MainContent)
// Garante layout fluido, eliminação de margens fixas e espaçamento padrão
// ==============================================================================

import React, { type ReactNode } from 'react'

export interface MainContentProps {
  children: ReactNode
  fullWidth?: boolean
  className?: string
}

export const MainContent: React.FC<MainContentProps> = ({
  children,
  fullWidth = false,
  className = ''
}) => {
  return (
    <main
      className={`content phase6-content disk-main-content disk-limitless-page flex-1 w-full min-w-0 min-h-[calc(100vh-var(--header-height,4rem))] bg-background text-foreground transition-colors overflow-x-hidden ${className}`}
      id="main-app-content"
      data-testid="main-app-content"
      role="main"
    >
      <div
        className="disk-content-container w-full m-0 p-0 max-w-none"
      >
        {children}
      </div>
    </main>
  )
}
export default MainContent
