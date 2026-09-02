# Fase 25.6.1 — Sidebar Premium Responsiva Baseada na Referência do Vídeo

Release: `25.6.1-sidebar-reference-navigation-2026-09-02`

## 1. Objetivo e Escopo
Ajustar o menu lateral oficial do SafeSaff (`src/components/ModuleSidebar.tsx` e `src/styles/sidebar-enterprise.css`) para reproduzir fielmente a navegação visual e estrutural do vídeo de referência, com destaque em faixa horizontal contínua, ícones centralizados em coluna de 22px, alternância expandida/recolhida (280px / 76px) com botão circular `⇄`, persistência em `localStorage`, auto-collapse no desktop e drawer mobile `< 768px`.

## 2. Especificações Implementadas

### Estrutura e Geometria
- **Largura Expandida**: `280px` (`--sidebar-expanded`)
- **Largura Recolhida**: `76px` (`--sidebar-collapsed`)
- **Background**: `#1e2530` / `#191f28` com borda sutil `rgba(255, 255, 255, 0.08)`
- **Transições**: `220ms cubic-bezier(0.4, 0, 0.2, 1)` para largura e transformações.
- **Sincronização com Shell**: O contêiner de layout (`.phase6-shell`) e a topbar adaptam suas colunas de grid automaticamente quando a sidebar é recolhida.

### Cabeçalho da Sidebar
- Título **Navegação** em Inter 13.5px bold
- Botão circular de alternância `⇄` (`.sidebar-toggle-btn`) de 34px com hover suave
- Persistência imediata no `localStorage` sob a chave `safesaff.sidebar.collapsed`

### Itens de Navegação & Destaque Ativo
- **Altura Padronizada**: 42px
- **Ícone**: Coluna fixa de 22px, tamanho 18px, `strokeWidth: 1.8`, perfeitamente alinhado verticalmente
- **Tipografia**: Inter, 13px, weight 500, cor `#cad3df`, `white-space: nowrap`
- **Hover**: Faixa horizontal contínua de ponta a ponta com `background: rgba(255, 255, 255, 0.07)`
- **Ativo**: Faixa horizontal contínua com `background: rgba(255, 255, 255, 0.12)` e texto `#ffffff` (sem cantos arredondados flutuantes de pílula)

### Submenus & Auto-Collapse
- Seções expansíveis: **Financeiro**, **Contabilidade**, **Marketing**, **Remarketing**, **Administração**
- **Desktop**: Ao mover o cursor para fora da seção expandida (`onMouseLeave`), o menu recolhe automaticamente (comportamento da Fase 25.3.2.1)
- **Mobile/Touch**: Permanece aberto até a seleção de uma opção ou novo toque
- **Estornos**: Módulo independente fora do grupo financeiro com badge `ERP` (Fase 24.9)

### Responsividade 360° & Mobile Drawer
- **Desktop (≥ 1024px)**: Sidebar fixa com expansão/recolhimento
- **Tablet (768px – 1023px)**: Layout compacto fluido
- **Mobile (< 768px)**: Sidebar em formato drawer `min(86vw, 320px)` com backdrop blur, fechamento por tecla `ESC`, fechamento ao clicar no overlay ou navegar, e bloqueio de scroll do body (`.safesaff-drawer-open`).
