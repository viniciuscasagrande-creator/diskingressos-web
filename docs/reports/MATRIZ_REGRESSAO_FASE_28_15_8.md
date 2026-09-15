<!-- markdownlint-disable MD013 MD060 -->
# Matriz de Regressão — Fase 28.15.8

## PDT DiskIngressos Enterprise

Data de Execução: 14 de Setembro de 2026  
Status Geral: 100% APROVADA (ZERO P0, ZERO P1)  

| ID | Módulo | Cenário | Tipo | Prioridade | Resultado | Evidência |
| --- | --- | --- | --- | --- | --- | --- |
| NAV-001 | Router | Um clique gera um único render sem loop | E2E | P1 | Aprovado | `phase28-15-8-comprehensive.spec.ts:25` |
| NAV-002 | Router | F5 mantém rota e restaura escopo | E2E | P1 | Aprovado | `phase28-15-8-comprehensive.spec.ts:25` |
| NAV-003 | Router | Voltar/Avançar sincroniza estado e abas | E2E | P1 | Aprovado | `phase28-15-8-comprehensive.spec.ts:45` |
| MENU-001 | Menu | Apenas um item ativo com aria-current | E2E | P1 | Aprovado | `phase28-15-8-comprehensive.spec.ts:71` |
| FIN-001 | Financeiro | Dashboard abre sem regressão | E2E | P1 | Aprovado | `phase28-15-8-comprehensive.spec.ts:87` |
| FIN-002 | Financeiro | Gestão de Saldos (`/financeiro/saldos`) | E2E | P1 | Aprovado | `phase28-15-8-comprehensive.spec.ts:87` |
| FIN-003 | Financeiro | Centro de Controle de Estornos (Módulo Protegido) | E2E | P1 | Aprovado | `phase28-15-8-comprehensive.spec.ts:87` |
| ACC-001 | Contabilidade | DRE por subrota (`/contabilidade/dre`) | E2E | P1 | Aprovado | `phase28-15-8-comprehensive.spec.ts:110` |
| ACC-002 | Contabilidade | Balanço por subrota (`/contabilidade/balanco`) | E2E | P1 | Aprovado | `phase28-15-8-comprehensive.spec.ts:110` |
| ACC-003 | Contabilidade | Rastreabilidade sem aba undefined | E2E | P1 | Aprovado | `phase28-15-8-comprehensive.spec.ts:110` |
| SEC-001 | Segurança | Produtor A não acessa Evento/Dados do Produtor B | E2E / Backend | P0 | Aprovado | `breadcrumbs-permissions-context.spec.ts:179` / `403 Forbidden` |
| SEC-002 | Segurança | URL sem permissão exibe bloqueio amigável pt-BR | E2E | P0 | Aprovado | `phase28-15-8-comprehensive.spec.ts:132` |
| SEC-003 | Contexto | Troca de produtor limpa evento imediatamente | E2E | P0 | Aprovado | `phase28-15-8-comprehensive.spec.ts:146` |
| MOB-001 | Mobile | 360 px sem overflow horizontal | E2E | P1 | Aprovado | `phase28-15-8-comprehensive.spec.ts:177` |
| MOB-002 | Mobile | Drawer mobile abre, fecha com backdrop/Escape e navega | E2E | P1 | Aprovado | `phase28-15-8-comprehensive.spec.ts:177` |
| A11Y-001 | A11y | aria-current, aria-expanded e nomes acessíveis | E2E | P2 | Aprovado | `phase28-15-8-comprehensive.spec.ts:71` |
| CONSOLE-001 | Qualidade | Zero ReferenceError, TypeError não tratado e tela branca | E2E | P0 | Aprovado | `phase28-15-8-comprehensive.spec.ts` (pageerror hook) |
| UNIT-001 | Unitário | Resolução de rotas canônicas e aliases | Unitário | P1 | Aprovado | `tests/unit/router.test.ts` (4 testes) |
| UNIT-002 | Unitário | Sincronização de rotas ativas no MenuStateManager | Unitário | P1 | Aprovado | `tests/unit/menu-state-manager.test.ts` (1 teste) |
| UNIT-003 | Unitário | Normalização e troca de abas no AccountingController | Unitário | P1 | Aprovado | `tests/unit/accounting-controller.test.ts` (2 testes) |
| UNIT-004 | Unitário | AppContext, isolamento de perfil e rejeição IDOR | Unitário | P0 | Aprovado | `tests/unit/app-context.test.ts` (4 testes) |
| UNIT-005 | Unitário | PermissionGuard matriz por perfil (admin/finance/mkt) | Unitário | P0 | Aprovado | `tests/unit/permission-guard.test.ts` (3 testes) |
| UNIT-006 | Unitário | ContextGuard validação de escopo produtor e evento | Unitário | P0 | Aprovado | `tests/unit/context-guard.test.ts` (4 testes) |
| INT-001 | Integração | Breadcrumbs hierárquicos e contextuais com evento ativo | Integração | P1 | Aprovado | `tests/integration/breadcrumbs.integration.test.ts` (2 testes) |
| INT-002 | Integração | Ciclo completo de contexto produtor e logout | Integração | P0 | Aprovado | `tests/integration/producer-event-context.integration.test.ts` (1 teste) |
