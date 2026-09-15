# Fase 26.x.3.6 — Playwright Repair Advisor

Release: `26.x.3.6-playwright-repair-advisor-2026-09-03`

## Objetivo
Transformar as falhas classificadas pelo Auto-Diagnóstico em um plano técnico seguro e acionável para o Gemini/agente de código, sem permitir que a IA "corrija" regressões removendo telas, rotas, asserts ou proteções.

## Fluxo
1. Execute os testes Playwright normalmente.
2. Gere o diagnóstico com `npm run test:pw:diagnose`.
3. Gere o plano de reparo com `npm run test:pw:repair-advisor`.
4. Ou execute diagnóstico + advisor com `npm run test:pw:diagnose-and-advise`.

## Saídas
Em `test-results/repair-advisor/`:
- `REPAIR_ADVISOR.html`: painel humano.
- `REPAIR_ADVISOR.md`: plano técnico.
- `REPAIR_ADVISOR.json`: saída estruturada.
- `PROMPT_REPARO_GEMINI.md`: instrução pronta para o Gemini.

## Guardrails
- Estornos permanece módulo independente em `/app/finance-refunds`.
- Golden Master não pode ser atualizado automaticamente.
- producerId/eventId e isolamento multi-tenant não podem ser relaxados.
- Testes não podem ser apagados, pulados ou enfraquecidos para obter PASS.
- A correção deve ser mínima e orientada à causa raiz.
