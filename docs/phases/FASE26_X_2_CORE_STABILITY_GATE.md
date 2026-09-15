# Fase 26.x.2 — Core Stability Gate

Release: `26.x.2-core-stability-gate-2026-09-03`

Esta fase transforma a proteção pontual de Estornos em uma política de estabilidade do PDT inteiro. Os módulos Eventos, Financeiro, Estornos, Marketing e Atendimento/SAC passam a ter contrato executável, marcador de proteção no DOM, gate de build e suíte de regressão Playwright.

## Objetivo

Evitar que Gemini, refatorações ou próximas fases removam funcionalidades já aprovadas ao alterar Sidebar, App.tsx, rotas ou composição de páginas.

## Entregas

- `CORE_PROTECTED_MODULES.json` como fonte de contrato.
- `CORE_PROTECTED_MODULES.md` atualizado.
- `verify-core-protected-modules.mjs` ampliado para cinco módulos.
- `protected-core-modules.spec.ts` para regressão E2E.
- `quality:gate` para validação local/CI.
- marcador `26.x.2-core-stability-gate-2026-09-03` no Sidebar.

## Regra de implantação

Nenhuma nova fase deve ser homologada se `npm run verify:protected-modules` falhar. O Playwright deve ser executado contra o deploy real quando o runner e os browsers estiverem instalados.
