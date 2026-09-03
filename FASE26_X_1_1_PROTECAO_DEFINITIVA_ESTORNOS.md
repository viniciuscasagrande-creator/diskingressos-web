# Fase 26.x.1.1 — Proteção Definitiva do Módulo Estornos

Release: `26.x.1.1-estornos-protected-2026-09-03`

Objetivo: impedir regressões que removam a Central de Estornos durante alterações do Event OS ou refatorações automatizadas.

Implementado:
1. Estornos continua como módulo independente fora do submenu Financeiro.
2. `data-testid="nav-finance-refunds"` e marcador `data-protected-module="estornos"` no item oficial.
3. Manifesto `CORE_PROTECTED_MODULES.md` com contrato permanente.
4. Gate estático `scripts/verify-core-protected-modules.mjs`.
5. O `build:vercel` agora executa o gate antes de gerar o deploy.
6. Playwright `tests/regression/protected-estornos.spec.ts` valida menu, rota e tela.
7. Script `npm run test:e2e:protected` para homologação específica.

A Fase 26.x/Event OS não possui autorização para remover ou absorver Estornos.
