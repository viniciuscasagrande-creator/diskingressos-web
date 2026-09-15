# Fase 25.3.2 — Sidebar Premium e Padronização Tipográfica

## Objetivo
Elevar a navegação lateral do SafeSaff ao mesmo nível visual do ERP/CRM financeiro, sem alterar rotas, permissões ou regras de negócio.

## Implementado
- Stack tipográfica única baseada em Inter/system UI.
- Escala visual consistente: captions 10px, itens 13px, badges 9px.
- Pesos tipográficos controlados para evitar mistura de 600/700/800 sem hierarquia.
- Ícones Lucide normalizados em 18px, stroke 1.8 e coluna fixa.
- Altura dos itens padronizada em 42px no desktop e 44px no mobile.
- Estado ativo premium com destaque suave e indicador lateral azul.
- Hover discreto e enterprise, sem blocos pesados.
- Badges ERP/Novo/Contábil padronizados.
- Grupos Financeiro, Contabilidade, Marketing, Remarketing e Administração com animação suave de expansão.
- Chevron animado e `aria-expanded` para acessibilidade.
- Scrollbar discreta.
- Melhor densidade para notebook e responsividade para drawer mobile.
- Tooltips nativos via `title` para rótulos truncados.

## Regras preservadas
- Nenhuma rota foi removida ou renomeada.
- Estornos permanece módulo independente.
- Dashboard Financeiro permanece homologado e sem redesenho.
- Permissões administrativas e do produtor permanecem intactas.

## Release
`25.3.2-premium-sidebar-typography-2026-09-02`
