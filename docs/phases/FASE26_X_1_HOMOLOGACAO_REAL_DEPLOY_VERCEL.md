# Fase 26.x.1 — Homologação Real do Deploy Vercel

Release: `26.x.1-deploy-homologation-2026-09-03`

## Objetivo
Validar o código efetivamente publicado no Vercel contra o Event OS 26.x, sem confundir presença no repositório com presença no deploy.

## Regras da homologação
- O teste usa `PLAYWRIGHT_BASE_URL` para apontar ao deploy real.
- Credenciais não ficam hard-coded. Use `E2E_PRODUCER_A_EMAIL` e `E2E_PRODUCER_A_PASSWORD` no ambiente seguro de QA/CI.
- O teste nunca presume `eventId=1`: seleciona um evento realmente visível na Central de Eventos e reutiliza seu `data-event-code`.
- A navegação para Inventory e Customer 360 ocorre pela própria interface contextual, reproduzindo o comportamento do usuário.
- A API protegida é sondada sem token para confirmar que não expõe dados anonimamente (esperado 401/403).
- Evidências são gravadas em `test-results/homologacao-vercel/` com screenshots e `homologacao-report.json`.

## Execução
```bash
npm install
npx playwright install chromium
PLAYWRIGHT_BASE_URL=https://safesaff.vercel.app \
E2E_PRODUCER_A_EMAIL='usuario-qa' \
E2E_PRODUCER_A_PASSWORD='senha-qa' \
npm run test:e2e:deploy
```

Não versionar credenciais. Em Vercel/GitHub Actions, configure-as como secrets.

## Resultado desta preparação
O projeto recebido contém a árvore React/Node completa e `node_modules`, mas a instalação local recebida não contém o runner `@playwright/test` utilizável: `npx playwright` resolve para um pacote CLI sem o comando `test`. Portanto, a suíte foi preparada/corrigida e o TypeScript + Lucide foram validados, mas o teste browser contra produção deve ser executado após `npm install`/instalação dos browsers no ambiente de QA.
