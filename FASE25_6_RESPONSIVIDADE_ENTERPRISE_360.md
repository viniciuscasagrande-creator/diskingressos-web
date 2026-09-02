# Fase 25.6 — Responsividade Enterprise 360°

Release: `25.6-responsive-enterprise-360-2026-09-02`

## Objetivo
Transformar responsividade em regra transversal do Design System SafeSaff + Limitless, preservando o desktop aprovado e adaptando ERP, Financeiro, Contabilidade, CRM, SAC, Marketing, Estornos, Administração e Portal do Produtor para notebook, tablet e mobile.

## Breakpoints oficiais
- Desktop amplo: >= 1440px
- Notebook: 1200–1439px
- Tablet / notebook compacto: 768–1199px
- Mobile: 480–767px
- Mobile compacto: < 480px

## Implementação
A nova camada `src/styles/responsive-enterprise-360.css` é importada por último no `main.tsx`, portanto funciona como camada de adaptação sem substituir o Limitless nem reescrever regras de negócio.

### Regras
- grids financeiros reduzem 5/6 → 3 → 2 → 1 colunas conforme a largura;
- sidebar usa o drawer mobile já existente;
- Navigation Rail mantém scroll horizontal, snap e touch;
- tabelas permanecem completas e ganham viewport horizontal segura em telas estreitas;
- toolbars, filtros e ações quebram linha e ocupam largura útil;
- modais mobile passam a sheet inferior quase full-screen;
- formulários passam para uma coluna no mobile;
- gráficos/canvas/SVG nunca ultrapassam o container;
- inputs usam 16px no mobile para evitar zoom automático em navegadores móveis;
- targets de toque têm pelo menos 44px;
- safe-area é respeitada na navegação inferior;
- valores financeiros mantêm `tabular-nums` e alinhamento numérico;
- telas ultrawide recebem limite de leitura de 1920px;
- `prefers-reduced-motion` é respeitado.

## Telas financeiras 25.4/25.5
Recebíveis, liquidação, repasses, reservas e disponibilidade financeira receberam regras explícitas para KPIs, waterfall, cards, tabelas e visualizações em tablet/mobile.

## Governança
Todo novo componente visual do SafeSaff deve nascer compatível com esta camada. Responsividade deixa de ser correção posterior e passa a ser requisito de aceite.
