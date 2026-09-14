# Inventário de Legado — Fase 28.15.7
## PDT DiskIngressos Enterprise

Data do Inventário: 14 de Setembro de 2026  
Status: CONCLUÍDO E HOMOLOGADO  

---

### 1. Tabela de Inventário Técnico Completo

| Item | Arquivo | Tipo | Referências | Decisão | Observação |
|---|---|---|---:|---|---|
| `src/App.tsx.bak_fase28_15_4` | `src/App.tsx.bak_fase28_15_4` | JS | 0 | REMOVER | Arquivo backup órfão de fase anterior (já versionado no Git) |
| `src/App.tsx.bak_fase28_15_5` | `src/App.tsx.bak_fase28_15_5` | JS | 0 | REMOVER | Arquivo backup órfão de fase anterior (já versionado no Git) |
| `src/App.tsx.bak_fase28_15_6` | `src/App.tsx.bak_fase28_15_6` | JS | 0 | REMOVER | Arquivo backup órfão de fase anterior (já versionado no Git) |
| `src/components/Header.tsx.bak_fase28_15_5` | `src/components/Header.tsx.bak_fase28_15_5` | JS | 0 | REMOVER | Arquivo backup órfão de componente |
| `src/components/ModuleSidebar.tsx.bak_fase28_15_4` | `src/components/ModuleSidebar.tsx.bak_fase28_15_4` | JS | 0 | REMOVER | Arquivo backup órfão de componente |
| `src/components/ModuleSidebar.tsx.bak_fase28_15_5` | `src/components/ModuleSidebar.tsx.bak_fase28_15_5` | JS | 0 | REMOVER | Arquivo backup órfão de componente |
| `src/pages/FinanceAccountingHubPage.tsx.bak_fase28_15_4` | `src/pages/FinanceAccountingHubPage.tsx.bak_fase28_15_4` | JS | 0 | REMOVER | Arquivo backup órfão de página |
| `src/styles/responsive-enterprise-360.css.bak_fase28_15_5` | `src/styles/responsive-enterprise-360.css.bak_fase28_15_5` | CSS | 0 | REMOVER | Arquivo backup órfão de stylesheet |
| `src/styles/sidebar-enterprise.css.bak_fase28_15_5` | `src/styles/sidebar-enterprise.css.bak_fase28_15_5` | CSS | 0 | REMOVER | Arquivo backup órfão de stylesheet |
| `window.openView` | `src/navigation/router.ts` | GLOBAL | 3 | DEPRECAR | Wrapper mantido apontando para `AppRouter.navigateLegacy` |
| `window.navigateTo` | `src/navigation/router.ts` | GLOBAL | 1 | DEPRECAR | Wrapper mantido apontando para `openView` |
| `window.switchActiveView` | `src/navigation/router.ts` | GLOBAL | 1 | DEPRECAR | Wrapper mantido apontando para `openView` |
| `window.AppRouter` | `src/navigation/router.ts` | GLOBAL | 12 | MANTER | API pública oficial do roteador único |
| `window.AppContext` | `src/context/app-context.ts` | GLOBAL | 8 | MANTER | API pública oficial de contexto e escopo |
| `window.MenuStateManager` | `src/navigation/menu-state.ts` | GLOBAL | 5 | MANTER | API pública de sincronização de menu ativo |
| `window.MobileNavigationController` | `src/navigation/mobile-controller.ts` | GLOBAL | 6 | MANTER | API pública de controle do drawer mobile |
| `window.AccountingController` | `src/accounting/accounting-controller.ts` | GLOBAL | 4 | MANTER | Controlador oficial contábil (usado nos testes E2E) |
| `window.switchAccountingTab` | `src/accounting/accounting-controller.ts` | GLOBAL | 2 | MANTER | Helper de abas contábeis usado no teste E2E |
| `window.toggleMobileSidebar` | `src/navigation/mobile-controller.ts` | GLOBAL | 2 | MANTER | Helper delegado para botões mobile sem import direto |
| `window.openMobileSidebar` | `src/navigation/mobile-controller.ts` | GLOBAL | 1 | MANTER | Helper delegado de abertura |
| `window.closeMobileSidebar` | `src/navigation/mobile-controller.ts` | GLOBAL | 1 | MANTER | Helper delegado de fechamento |
| `accounting-disk` | `src/navigation/routes.ts` | ALIAS | 8 | MANTER | Alias homologado redirecionando para `/contabilidade/dashboard` |
| `view-accounting-disk` | `src/navigation/routes.ts` | ALIAS | 4 | MANTER | Alias canônico unificado homologado na Fase 28.15.4 |
| `accounting-dashboard` | `src/navigation/routes.ts` | ALIAS | 12 | MANTER | Rota/alias canônico contábil |
| `accounting-chart` | `src/navigation/routes.ts` | ALIAS | 3 | MANTER | Redireciona para `/contabilidade/plano-de-contas` |
| `accounting-journal` | `src/navigation/routes.ts` | ALIAS | 3 | MANTER | Redireciona para `/contabilidade/lancamentos` |
| `accounting-ledger` | `src/navigation/routes.ts` | ALIAS | 3 | MANTER | Redireciona para `/contabilidade/lancamentos` |
| `accounting-entries` | `src/navigation/routes.ts` | ALIAS | 3 | MANTER | Redireciona para `/contabilidade/lancamentos` |
| `accounting-reconciliation` | `src/navigation/routes.ts` | ALIAS | 3 | MANTER | Redireciona para `/contabilidade/conciliacao` |
| `accounting-closing` | `src/navigation/routes.ts` | ALIAS | 3 | MANTER | Redireciona para `/contabilidade/fechamento` |
| `accounting-dre` | `src/navigation/routes.ts` | ALIAS | 3 | MANTER | Redireciona para `/contabilidade/dre` |
| `accounting-taxes` | `src/navigation/routes.ts` | ALIAS | 3 | MANTER | Redireciona para `/contabilidade/fiscal` |
| `accounting-sped` | `src/navigation/routes.ts` | ALIAS | 3 | MANTER | Redireciona para `/contabilidade/fiscal` |
| `accounting-balance-sheet` | `src/navigation/routes.ts` | ALIAS | 3 | MANTER | Redireciona para `/contabilidade/balanco` |
| `finance-accounting` | `src/navigation/routes.ts` | ALIAS | 2 | MANTER | Redireciona para `/contabilidade/dashboard` |
| `financial-dashboard` | `src/navigation/routes.ts` | ALIAS | 2 | MANTER | Redireciona para `/financeiro/dashboard` |
| `financeiro` | `src/navigation/routes.ts` | ALIAS | 3 | MANTER | Redireciona para `/financeiro/dashboard` |
| `finance` | `src/navigation/routes.ts` | ALIAS | 4 | MANTER | Redireciona para `/financeiro/saldos` |
| `finance-refunds` | `src/navigation/routes.ts` | ALIAS | 6 | MANTER | Redireciona para `/financeiro/estornos` (Módulo Protegido) |
| `marketing-hub` | `src/navigation/routes.ts` | ALIAS | 2 | MANTER | Redireciona para `/marketing/dashboard` |
| `marketing-tracking` | `src/navigation/routes.ts` | ALIAS | 3 | MANTER | Redireciona para `/marketing/pixels` |
| `dashboard-main` | `src/navigation/routes.ts` | ALIAS | 1 | MANTER | Redireciona para `/dashboard` |
| `popstate` listener | `src/navigation/router.ts` | LISTENER | 1 | MANTER | Listener central do AppRouter para histórico do navegador |
| `popstate` listener | `src/App.tsx` | LISTENER | 1 | MIGRAR | Sincronizado com AppRouter.subscribe para evitar duplicações |
| `click` delegated listener | `src/navigation/router.ts` | LISTENER | 1 | MANTER | Captura `[data-route]` e `[data-view]` |
| `keydown` (Escape) | `src/navigation/mobile-controller.ts` | LISTENER | 1 | MANTER | Fecha drawer mobile ao teclar Escape |
| `resize` listener | `src/navigation/mobile-controller.ts` | LISTENER | 1 | MANTER | Normaliza estado de menu ao cruzar 768px |
| `click` toggle listener | `src/navigation/mobile-controller.ts` | LISTENER | 1 | MANTER | Captura `[data-action="toggle-mobile-nav"]` |
| `STORAGE_KEY` (sessionStorage) | `src/context/app-context.ts` | STORAGE | 4 | MANTER | Chave oficial `safesaff_app_context_v28_15_6` |
| `AUDIT_STORAGE_KEY` (sessionStorage) | `src/context/app-context.ts` | STORAGE | 3 | MANTER | Chave oficial `safesaff_audit_context_logs_v28_15_6` |
| `safesaff.sidebar.collapsed` | `src/App.tsx` | STORAGE | 2 | MANTER | Persistência do colapso da barra lateral |
| `safesaff.auth.token` | `src/services/api.ts` | STORAGE | 5 | MANTER | Token de sessão do usuário |
| `vendor/limitless` | `vendor/limitless/` | JS/CSS | 0 (direto no bundle) | INVESTIGAR | Framework CSS/JS preservado como asset de referência estática |
| Pacotes de dependência | `package.json` | DEPENDÊNCIA | 12 deps, 7 dev | MANTER | Todas as 19 dependências estão ativas no build e servidor |

---

### 2. Resumo das Decisões
- **REMOVER:** 9 arquivos residuais `.bak_fase*` eliminados com total segurança.
- **DEPRECAR:** 3 wrappers legados de navegação (`openView`, `navigateTo`, `switchActiveView`) mantidos com redirecionamento para `AppRouter.navigateLegacy()`.
- **MIGRAR:** Consolidação do listener `popstate` em `App.tsx` delegando o ciclo principal ao `AppRouter.subscribe()`.
- **MANTER:** 41 itens entre APIs públicas, aliases homologados de URL, listeners delegados, chaves seguras de storage e dependências essenciais do `package.json`.
- **INVESTIGAR:** Diretório `vendor/limitless` mantido íntegro para garantir que nenhum asset estático ou fonte legado seja impactado.
