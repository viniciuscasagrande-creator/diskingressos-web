# Fase 28.15.8 — Testes Automatizados, Regressão e Homologação Técnica

## Objetivo

Homologar tecnicamente as Fases 28.15.1 a 28.15.7 com testes unitários,
integração, E2E, segurança/contexto e responsividade.

## Stack

Antes de instalar qualquer ferramenta, auditar `package.json`.
No backup analisado anteriormente havia Vite + JSDOM e Playwright não estava declarado.

Prioridade:

1. JSDOM + node:test para unitários/integração;
2. Playwright para E2E somente se estiver disponível ou puder ser instalado
   com segurança;
3. não adicionar frameworks concorrentes sem necessidade.

## Estrutura sugerida

```text
tests/
  unit/
    router.test.js
    menu-state-manager.test.js
    accounting-controller.test.js
    app-context.test.js
    permission-guard.test.js
    context-guard.test.js
  integration/
    navigation.integration.test.js
    finance-menu.integration.test.js
    accounting-routes.integration.test.js
    breadcrumbs.integration.test.js
    producer-event-context.integration.test.js
  e2e/
    navigation.spec.js
    financial.spec.js
    accounting.spec.js
    permissions.spec.js
    producer-context.spec.js
    responsive-360.spec.js
```

## Gate de build

Executar `npm run build`.
Se falhar: FASE REPROVADA.

## Router

Testar:

- resolução de rota;
- aliases;
- pushState/replaceState;
- popstate;
- F5;
- deep-link;
- Voltar/Avançar;
- um clique = um render;
- nenhuma navegação duplicada.

## MenuStateManager

Testar:

- item ativo único;
- grupo pai aberto;
- `aria-current`;
- `aria-expanded`;
- sincronização após deep-link/F5/Voltar/Avançar.

## Financeiro Enterprise

Cobrir:

- Dashboard;
- Gestão de Saldos;
- Transferência entre Eventos;
- Receber;
- Pagar;
- Antecipações;
- Repasses;
- Compras;
- Fornecedores;
- Contratos;
- Fluxo de Caixa;
- DRE;
- Conciliação;
- Estornos;
- Borderôs.

## Contabilidade

Cobrir:

- dashboard;
- inteligência;
- conciliação;
- rastreabilidade;
- DRE;
- balanço;
- fechamento;
- plano de contas;
- lançamentos;
- documentos;
- fiscal;
- relatórios.

Validar uma única `view-accounting-disk`, tab correta e nenhuma tab `undefined`.

## Breadcrumbs

Validar rota → breadcrumb e contexto de evento.
Último item com `aria-current="page"`.

## PermissionGuard

Testar permitido, negado, permissão parcial e URL direta.
Tela protegida não pode renderizar antes do guard.

## ContextGuard

Testar:

- sem produtor;
- com produtor;
- sem evento;
- com evento.

## Produtor/Evento

Fixtures:

```text
Produtor A: Evento A1, Evento A2
Produtor B: Evento B1
```

Esperado:

- A → A1 permitido
- A → A2 permitido
- A → B1 bloqueado

## Segurança / IDOR

Usuário do Produtor A tentando recurso do Produtor B deve receber bloqueio
(403 na validação backend real).
Se backend real não estiver disponível, marcar como MOCK e registrar
pendência de validação integrada.

## Troca de produtor

Admin:
Produtor A + Evento A1 → troca para Produtor B

Esperado:

- producerId = B
- eventId = null

## Persistência

F5 pode restaurar apenas contexto ainda válido.
Contexto inválido deve ser descartado.

## Logout

Deve limpar:

- AppContext;
- sessionStorage;
- cache de produtor;
- cache de evento.

## Mobile 360

Viewport mínimo: 360x800.

Validar:

- drawer;
- overlay;
- navegação;
- fechamento após clique;
- submenu;
- breadcrumb;
- tabelas;
- modais;
- zero overflow horizontal.

Também testar pelo menos 768 e 1440.

## Console

Capturar:

- pageerror;
- ReferenceError;
- TypeError não tratado;
- unhandled rejection.

Erro fatal = falha.

## Tela branca

Falhar se:

- view ativa não existir;
- conteúdo principal estiver vazio por erro;
- ocorrer erro fatal.

## Performance básica

Navegar repetidamente entre módulos e garantir que listeners/renderizações
não cresçam indefinidamente.

## Aliases

Testar URLs legadas relevantes, incluindo:

- `#financial-dashboard`
- `#/financial-dashboard`
- `#/financeiro/dashboard`

## Acessibilidade mínima

Verificar:

- aria-current;
- aria-expanded;
- aria-selected;
- botão mobile com nome acessível;
- foco básico em modal.

## Dados de teste

Usar apenas dados fictícios. Nunca usar tokens ou dados sensíveis reais.

## Evidências E2E

Se Playwright estiver disponível:

- screenshot only-on-failure;
- trace retain-on-failure;
- video retain-on-failure.

## Suítes

Tags recomendadas:

- @smoke
- @security
- @responsive
- @regression

## Severidade

- P0: segurança/perda de dados/sistema indisponível
- P1: fluxo principal quebrado
- P2: função secundária
- P3: visual menor

Homologação bloqueada por qualquer P0 ou P1.

## Pipeline

```text
npm ci
→ node --check
→ npm run build
→ unit
→ integration
→ smoke
→ security
→ responsive
→ regression
→ relatório
```

Se E2E não puder ser executado, registrar a limitação. Não fingir execução.

## Entregáveis obrigatórios

- `MATRIZ_REGRESSAO_FASE_28_15_8.md`
- `RELATORIO_TESTES_AUTOMATIZADOS_FASE_28_15_8.md`
- `RELATORIO_HOMOLOGACAO_FASE_28_15_8.md`

## Critérios de homologação

- build aprovado;
- unitários críticos aprovados;
- integração crítica aprovada;
- smoke aprovado;
- zero P0;
- zero P1;
- zero acesso cruzado Produtor/Evento;
- zero tela branca;
- zero erro JS fatal;
- Router sem duplo render;
- Financeiro preservado;
- Contabilidade preservada;
- mobile 360 funcional;
- F5/Voltar/Avançar/deep-link aprovados.

## Status permitido

Somente:

- APROVADA
- APROVADA COM RESSALVAS
- REPROVADA

Nunca declarar “100%” sem evidência.

## Próxima fase

28.15.9 — Homologação Final, Go-Live, Monitoramento e Plano de Rollback.
