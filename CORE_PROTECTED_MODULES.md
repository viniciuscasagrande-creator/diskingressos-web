# CORE_PROTECTED_MODULES — SafeSaff / PDT

Release: `26.x.2-core-stability-gate-2026-09-03`

## Regra permanente

Os módulos **Eventos, Financeiro, Estornos, Marketing e Atendimento/SAC** são módulos aprovados e protegidos. Nenhuma fase, refatoração ou agente de IA pode removê-los, absorvê-los em outro módulo, ocultá-los, trocar suas rotas canônicas ou substituir suas telas sem autorização explícita do responsável pelo produto.

O contrato executável está em `CORE_PROTECTED_MODULES.json` e é verificado por `scripts/verify-core-protected-modules.mjs`.

### Rotas canônicas

- Eventos: `/app/events`
- Financeiro: `/app/finance-dashboard`
- Estornos: `/app/finance-refunds`
- Marketing: `/app/marketing-dashboard`
- Atendimento / SAC: `/app/sac-hub`

## Gates

- `npm run verify:protected-modules` — falha o build se assinaturas críticas desaparecerem.
- `npm run quality:gate` — proteção + Lucide + TypeScript.
- `npm run test:e2e:protected-core` — regressão Playwright dos cinco módulos.

O `build:vercel` continua executando a proteção antes do build.
