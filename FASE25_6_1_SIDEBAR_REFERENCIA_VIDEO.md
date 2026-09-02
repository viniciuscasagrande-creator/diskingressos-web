# Fase 25.6.1 — Sidebar Premium baseada na referência do vídeo

Release: `25.6.1-sidebar-reference-navigation-2026-09-02`

## Objetivo
Reproduzir no SafeSaff o comportamento visual e estrutural da navegação lateral observada no vídeo aprovado, preservando rotas, permissões, tenant, módulos ERP, Estornos independente e a Responsividade Enterprise 360° da Fase 25.6.

## Implementado
- Sidebar desktop de 288px e modo recolhido de 76px.
- Preferência persistida em `localStorage` com a chave `safesaff.sidebar.collapsed`.
- Botão dedicado para recolher/expandir com Lucide.
- Itens com 43px, ícones de 18px e tipografia Inter 13px.
- Hover e item ativo em faixa horizontal de largura total, sem cards/pills.
- Financeiro, Contabilidade, Marketing, Remarketing e Administração com ícone e expansão vertical.
- Mouseleave fecha submenu apenas em dispositivos com mouse real (`hover:hover` e `pointer:fine`).
- Touch/tablet mantém submenu aberto até nova interação.
- Drawer mobile até 767px; o estado recolhido desktop não reduz o drawer.
- ESC fecha o drawer mobile e o scroll do body é bloqueado enquanto ele estiver aberto.
- Correção do antigo breakpoint de 900px para preservar sidebar de tablet entre 768 e 900px.
- O grid principal e o header acompanham automaticamente 288px/76px sem margens fixas espalhadas pelas páginas.

## Arquivos alterados
- `src/components/ModuleSidebar.tsx`
- `src/App.tsx`
- `src/main.tsx`
- `src/styles/sidebar-enterprise.css` (novo)
- `FASE25_6_1_SIDEBAR_REFERENCIA_VIDEO.md` (novo)

## Regras preservadas
- Dashboard Financeiro aprovado não foi redesenhado.
- Estornos continua módulo independente com badge ERP.
- Rotas e permissionamento existentes foram mantidos.
- Limitless e `responsive-enterprise-360.css` continuam ativos.
- Fase 25.3.2.1 de recolhimento automático por mouseleave foi preservada apenas para dispositivos com mouse.
