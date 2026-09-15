# Fase 26.x.3.9 — Playwright Contract Registry + Drift Detection

Release: `26.x.3.9-playwright-contract-registry-drift-detection-2026-09-03`

## Objetivo

Transformar decisões já aprovadas do PDT em contratos executáveis. A fase impede que uma refatoração do Gemini remova silenciosamente Estornos, altere a Central de Eventos, quebre a navegação do Event OS, retire endpoints críticos ou enfraqueça o isolamento `producerId/eventId`.

## Componentes

- `playwright-contract-registry.json`: fonte versionada dos contratos protegidos.
- `scripts/verify-playwright-contract-registry.mjs`: verifica arquivos e âncoras estruturais.
- `scripts/detect-playwright-contract-drift.mjs`: identifica quando uma alteração toca arquivos protegidos.
- `tests/contracts/protected-contract-registry.spec.ts`: transforma o registry em teste Playwright.

## Comandos

```bash
npm run test:pw:contract-registry
npm run test:pw:contract-drift
npm run test:pw:contract
```

O `test:pw:gemini-cycle` também passa a executar o Contract Registry antes da regressão inteligente.

## Regra para Gemini

Nunca alterar o registry ou a baseline visual apenas para fazer o teste passar. Se um contrato BLOCKER falhar, restaurar o comportamento aprovado e executar novamente a regressão. Mudança intencional em contrato crítico precisa de aprovação explícita.
