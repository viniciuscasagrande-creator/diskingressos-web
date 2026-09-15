# Fase 26.x.3.10 — Runtime Functional Stability Gate

Objetivo: voltar o foco para o PDT funcionando de verdade, bloqueando regressões em navegação, rotas e módulos essenciais antes de qualquer nova evolução visual.

## Proteções

- Eventos, Financeiro, Estornos, Marketing e SAC precisam continuar presentes e navegáveis.
- Estornos continua independente em `/app/finance-refunds`.
- O gate estático roda sem navegador e detecta remoção de chaves/contratos essenciais.
- O gate Playwright valida visibilidade, clique, rota e ausência de erro fatal em runtime.
- O fluxo Gemini passa primeiro pelo Stability Gate antes de regressão inteligente e diagnóstico.

## Comandos

```bash
npm run test:pw:functional-contract
npm run test:pw:functional-runtime
npm run test:pw:functional-gate
npm run test:pw:stability
npm run test:pw:gemini-cycle
```

## Regra desta fase

Não acrescentar novas telas enquanto uma rota protegida estiver quebrada. Primeiro recuperar o funcionamento, depois evoluir.
