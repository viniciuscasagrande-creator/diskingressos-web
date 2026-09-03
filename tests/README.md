# QA Automatizado — Playwright (Fase 26.3.1)

A suíte protege o PDT/Event OS contra regressões funcionais, visuais e de segurança multi-tenant.

## Instalação

```bash
npm install
npx playwright install
```

Para Linux/CI, quando necessário:

```bash
npx playwright install --with-deps
```

## Execução

```bash
npm run test:e2e:smoke
npm run test:e2e:security
npm run test:e2e
npm run test:e2e:report
```

Por padrão o Playwright sobe `npm run dev`, com Vite em `http://127.0.0.1:3000` e API em `3333` por proxy. O banco/API deve estar configurado conforme o ambiente do projeto.

Para homologar uma implantação já publicada:

```bash
PLAYWRIGHT_BASE_URL=https://seu-pdt.exemplo.com npm run test:e2e
```

## Usuários de QA

A suíte aceita variáveis `E2E_PRODUCER_A_EMAIL`, `E2E_PRODUCER_A_PASSWORD`, `E2E_PRODUCER_A_ID`, `E2E_PRODUCER_B_EMAIL`, `E2E_PRODUCER_B_PASSWORD`, `E2E_PRODUCER_B_ID`, `E2E_ADMIN_EMAIL` e `E2E_ADMIN_PASSWORD`.

Sem variáveis, utiliza as credenciais de demonstração que já fazem parte deste ambiente de desenvolvimento.

## Visual da Central de Eventos

`tests/visual/reference/central-eventos-approved-reference.png` é a referência fornecida e aprovada para a Central de Eventos. Ela é mantida como evidência visual.

A baseline executável do Playwright (`central-eventos.png`) deve ser criada somente após homologar visualmente a implementação local:

```bash
npm run test:e2e:update
```

Depois disso, `npm run test:e2e:visual` detecta regressões de pixels. Não atualize snapshots automaticamente em uma correção de UI; primeiro confira o diff.

## Fase 26.x.3.1 — suíte mestre

Comandos recomendados no VS Code/Windows:

```powershell
npm run test:pw:critical
npm run test:pw:event-os
npm run test:pw:runtime
npm run test:pw:responsive
npm run test:pw:master
```

Homologação sequencial local:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-playwright-homologacao.ps1
```

Homologação do Vercel:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-playwright-homologacao.ps1 -BaseUrl "https://safesaff.vercel.app"
```

`test:pw:critical` deve ser obrigatório antes de aprovar um deploy. Ele inclui a proteção permanente do módulo Estornos e o contrato da Central de Eventos.

## Fase 26.x.3.3 — Certificação de Release

Para transformar os resultados Playwright em um gate formal de liberação:

```bash
npm run test:pw:certify
```

Para executar também quality gate e smoke do deploy:

```bash
npm run release:certify
```

O certificado é salvo em `test-results/release-certificate/`. Um status `REJECTED` ou `BLOCKED` significa que o deploy não deve ser homologado.
