# Fase 25.6 — Responsividade Enterprise 360°

Release: `25.6-enterprise-responsiveness-360-2026-09-02`

## Objetivo
Transformar a responsividade em regra estrutural obrigatória do SafeSaff, cobrindo Dashboard, Financeiro, Contabilidade, ERP, CRM, SAC, Marketing, Estornos e Portal do Produtor.

## 4 Faixas de Dispositivos Padronizadas
1. **Desktop Grande (`>= 1440px`)**: visualização plena, 4 colunas de KPIs, navegação completa, tabelas expandidas.
2. **Notebook (`1024px – 1439px`)**: densidade controlada, 2 a 3 colunas de KPIs, respiro proporcional.
3. **Tablet (`768px – 1023px`)**: 2 colunas de cards, tabelas com scroll touch horizontal protegido, toolbars adaptativas.
4. **Mobile (`< 768px` e Pequeno `< 480px`)**: layout em coluna única, KPIs verticais fluidos, gráficos 100% de largura, modais em tela cheia com safe-area e botões de ação touch amigáveis.

## Componentes e Tokens Integrados
- `.erp-grid`: grid adaptativo com `auto-fit` e `minmax(min(100%, 260px), 1fr)`.
- `.financial-table-wrapper` e `.ll-table-frame`: proteção contra overflow com scroll momentum.
- `.page-toolbar` e `.page-actions`: transição flex → stack no mobile.
- `src/styles/enterprise-responsive.css`: regras de layout fluidas para todo o ecossistema.
- `db/migrations/025_06_enterprise_responsive_preferences.sql`: persistência de preferências de viewport e densidade.

## Governança e Preservação
- Design System Limitless (Fase 25.3.4) mantido como fundação.
- Alinhamento financeiro (textos à esquerda, números/valores à direita + `tabular-nums`) preservado em todas as resoluções.
- Sidebar com auto-collapse e Estornos independente preservados.
