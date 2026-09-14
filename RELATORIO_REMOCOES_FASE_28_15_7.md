# Relatório de Remoções e Consolidação — Fase 28.15.7
## PDT DiskIngressos Enterprise

Data: 14 de Setembro de 2026  
Status: CONCLUÍDO E HOMOLOGADO  

---

### 1. Removido com Segurança

Os seguintes 9 arquivos residuais de backup, acumulados durante as Fases 28.15.4 a 28.15.6, foram mapeados com zero referências ativas em código ou scripts de build, e foram removidos com segurança:

1. `src/App.tsx.bak_fase28_15_4` (Backup órfão da consolidação contábil)
2. `src/App.tsx.bak_fase28_15_5` (Backup órfão do menu mobile e responsividade)
3. `src/App.tsx.bak_fase28_15_6` (Backup órfão de breadcrumbs e permissões)
4. `src/components/Header.tsx.bak_fase28_15_5` (Backup órfão do cabeçalho)
5. `src/components/ModuleSidebar.tsx.bak_fase28_15_4` (Backup órfão da barra lateral)
6. `src/components/ModuleSidebar.tsx.bak_fase28_15_5` (Backup órfão da barra lateral)
7. `src/pages/FinanceAccountingHubPage.tsx.bak_fase28_15_4` (Backup órfão da central contábil)
8. `src/styles/responsive-enterprise-360.css.bak_fase28_15_5` (Backup órfão de responsividade)
9. `src/styles/sidebar-enterprise.css.bak_fase28_15_5` (Backup órfão de estilos de sidebar)

**Evidência de Segurança:**
- Busca global (`grep_search`) por `.bak_fase` retornou **0 ocorrências**.
- Execução do `npm run quality:gate` após a remoção: **100% PASS**.
- Execução do `npm run build`: **100% PASS**.

---

### 2. Deprecado

Os wrappers globais legados de navegação foram formalmente marcados como deprecados, mantendo compatibilidade direta redirecionando internamente para o motor canônico `AppRouter`:

1. `window.openView(routeOrView)`:
   - Aponta para `AppRouter.navigateLegacy(routeOrView)`.
   - Compatibilidade preservada para handlers inline e scripts legados.
2. `window.navigateTo(routeOrView)`:
   - Aponta para `window.openView`.
3. `window.switchActiveView(routeOrView)`:
   - Aponta para `window.openView`.

Nenhum código quebra caso chame esses métodos; a navegação passa imediatamente pela pipeline canônica: `AppRouter.resolve() → PermissionGuard → ContextGuard → MenuStateManager → Breadcrumbs`.

---

### 3. Mantido por Compatibilidade

1. **Aliases de Rotas Legadas (`LEGACY_ROUTE_ALIASES` em `src/navigation/routes.ts`)**:
   - `accounting-disk`, `view-accounting-disk`, `accounting-dashboard` → `/contabilidade/dashboard`
   - `accounting-chart`, `finance-chart-accounts`, `finance-cost-centers` → `/contabilidade/plano-de-contas`
   - `accounting-journal`, `accounting-ledger`, `accounting-entries` → `/contabilidade/lancamentos`
   - `accounting-reconciliation` → `/contabilidade/conciliacao`
   - `accounting-closing`, `finance-closing` → `/contabilidade/fechamento`
   - `accounting-dre`, `finance-dre` → `/contabilidade/dre`
   - `accounting-taxes`, `accounting-sped`, `finance-obligations` → `/contabilidade/fiscal`
   - `accounting-balance-sheet`, `accounting-trial-balance` → `/contabilidade/balanco`
   - `finance-accounting`, `contabilidade` → `/contabilidade/dashboard`
   - `financial-dashboard`, `financeiro`, `finance-dashboard` → `/financeiro/dashboard`
   - `finance` → `/financeiro/saldos`
   - `finance-refunds` → `/financeiro/estornos` (Módulo Protegido)
   - `marketing-hub`, `marketing-overview` → `/marketing/dashboard`
   - `marketing-tracking`, `marketing-pixels` → `/marketing/pixels`
   - `dashboard-main` → `/dashboard`

   **Motivo:** Essenciais para compatibilidade com favoritos de usuários, deep-links externos e testes de regressão automatizados (ex: `accounting-subroutes.spec.ts` que valida explicitamente o alias `accounting-disk`).

2. **Helpers Globais de Automação e Teste**:
   - `window.switchAccountingTab`: Utilizado diretamente pelos testes E2E do Playwright.
   - `window.AccountingController`: Permite manipulação síncrona nos testes de subrotas.
   - `window.MobileNavigationController`: Controle direto do drawer mobile em suítes E2E.
   - `window.AppContext`: Acesso seguro ao estado do usuário e contexto para verificações.

---

### 4. Mantido por Risco

1. **Fallback de Histórico em `App.tsx`**:
   - O fallback para `ev.state?.page` foi mantido para garantir suporte a históricos antigos ou abas do navegador abertas antes da implantação da Fase 28.15.6.
2. **Framework Limitless (`src/styles/limitless-enterprise.css`)**:
   - Mantido integralmente pois controla dezenas de utilitários tipográficos, badges e alinhamentos consumidos pelas telas de eventos e financeiro.
3. **Módulo de Estornos (`FinanceDisputesHubPage.tsx`)**:
   - Conforme a REGRA SUPREMA e o Contrato dos Módulos Protegidos, a tela e suas rotas permanecem intocadas.

---

### 5. Investigar Posteriormente (Fase 28.15.8)

1. `vendor/limitless/`:
   - Pasta de assets estáticos do template original. Não é empacotada no bundle final do Vite (confirmado pelo tamanho de saída do build de 3.5MB), mas deve ser auditada na Fase 28.15.8 para verificar se pode ser arquivada fora do repositório de produção.
