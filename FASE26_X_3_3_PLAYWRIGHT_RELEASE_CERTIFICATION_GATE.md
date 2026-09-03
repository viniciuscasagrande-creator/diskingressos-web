# Fase 26.x.3.3 — Playwright Release Certification Gate

Release: `26.x.3.3-playwright-release-certification-2026-09-03`

## Objetivo

Transformar a suíte Playwright já existente em um **gate formal de liberação**. A versão só recebe certificado técnico quando os grupos bloqueantes permanecem aprovados no deploy testado.

## Grupos bloqueantes

- Estornos permanente.
- Central de Eventos aprovada.
- Módulos Core protegidos: Eventos, Financeiro, Estornos, Marketing e SAC.
- Event OS 26.x.
- Runtime sem erro JavaScript crítico/HTTP 5xx.

Responsividade continua monitorada e registrada, mas nesta fase não bloqueia a certificação para evitar falso negativo enquanto a baseline é consolidada.

## Comandos

### Certificar deploy publicado

PowerShell:

```powershell
$env:PLAYWRIGHT_BASE_URL="https://safesaff.vercel.app"
$env:E2E_PRODUCER_A_EMAIL="SEU_USUARIO_QA"
$env:E2E_PRODUCER_A_PASSWORD="SUA_SENHA_QA"
npm run release:certify
```

### Somente Playwright + certificado

```bash
npm run test:pw:certify
```

### Regenerar certificado a partir de um resultado JSON existente

```bash
npm run test:pw:certificate
```

## Saídas

`test-results/release-certificate/`

- `RELEASE_CERTIFICATE.json`
- `CERTIFICADO_RELEASE_PLAYWRIGHT.md`
- `CERTIFICADO_RELEASE_PLAYWRIGHT.html`

## Estados

- `CERTIFIED`: todos os grupos bloqueantes atendem à política e não existem falhas na suíte.
- `REJECTED`: resultados existem, mas um ou mais critérios bloquearam a liberação.
- `BLOCKED`: não existem resultados válidos suficientes para certificar.

## GitHub Actions

Workflow novo:

`.github/workflows/playwright-release-certification.yml`

Ele instala dependências, Chromium, executa o gate estrutural, smoke HTTP, suíte Playwright e publica as evidências por 30 dias.

## Regra para Gemini/agentes

Nenhuma alteração automática deve ser considerada homologada apenas porque compilou. O release deve manter **Estornos**, **Central de Eventos**, módulos Core e Event OS aprovados no Playwright. Se o certificado for `REJECTED` ou `BLOCKED`, corrigir a regressão e repetir a certificação.
