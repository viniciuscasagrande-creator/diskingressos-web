# Fase 26.x.3.4 — Playwright Visual Golden Master

Release: `26.x.3.4-playwright-visual-golden-master-2026-09-03`

## Objetivo

Transformar a Central de Eventos aprovada pelo usuário em um contrato visual executável. A IA pode alterar backend, integrações e Event OS, mas não pode redesenhar silenciosamente a Central de Eventos nem remover o módulo independente de Estornos.

## Golden Master

A imagem oficial aprovada permanece em:

- `tests/visual/reference/central-eventos-approved-reference.png`

A baseline executável do Playwright fica em:

- `tests/visual-baselines/central-eventos-approved.png`

O `snapshotPathTemplate` foi tornado independente do sistema operacional, evitando baselines diferentes entre Windows e Linux/GitHub Actions.

## Gates

- `npm run visual:baseline:verify` valida existência, identidade SHA-256 e dimensão 1520x788.
- `npm run test:pw:visual-lock` executa a comparação visual e o contrato de Estornos.
- `npm run release:certify` agora inclui a verificação da baseline antes da certificação.
- O grupo `Golden Master Visual` é bloqueante no `release-gate.policy.json`.

## Regra para Gemini / agentes

NÃO atualizar a baseline automaticamente para fazer um teste passar. `--update-snapshots` só pode ser usado depois de aprovação visual explícita do usuário. Uma diferença visual deve ser tratada como regressão até revisão humana.

## Critérios

1. Central de Eventos deve manter o layout aprovado.
2. Comparação tolera no máximo 1% de pixels diferentes, apenas para pequenas variações de renderização.
3. Estornos deve continuar acessível em `/app/finance-refunds`.
4. Falha no Golden Master rejeita a certificação de release.
