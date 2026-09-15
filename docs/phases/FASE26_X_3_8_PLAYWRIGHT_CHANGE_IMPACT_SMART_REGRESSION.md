# Fase 26.x.3.8 — Playwright Change Impact + Smart Regression

Release: `26.x.3.8-playwright-change-impact-smart-regression-2026-09-03`

## Objetivo

Detectar automaticamente quais áreas do PDT foram alteradas pelo Gemini/VS Code e escolher a menor suíte de regressão segura antes de liberar a certificação completa.

## Fluxo

1. Lê `git diff` ou `PLAYWRIGHT_CHANGED_FILES`.
2. Classifica arquivos por módulo.
3. Mantém testes Core obrigatórios.
4. Executa regressão focada.
5. Se houver impacto crítico, executa `release:certify`.
6. Se a regressão focada falhar, bloqueia a certificação.

## Módulos mapeados

Estornos, Central de Eventos, Event OS, Financeiro, Marketing, SAC, autenticação/multi-tenant, runtime e visual.

## Comandos

```bash
npm run test:pw:impact
npm run test:pw:smart-regression
npm run test:pw:smart-regression:targeted
npm run test:pw:smart-regression:dry-run
```

## Uso sem Git

No PowerShell:

```powershell
$env:PLAYWRIGHT_CHANGED_FILES="src/App.tsx,src/pages/FinanceRefundsPage.tsx"
npm run test:pw:smart-regression
```

## Regra de segurança

Mudanças em `src/App.tsx`, `ModuleSidebar`, EventContextSidebar, tenant/auth, configuração Playwright ou contrato Core são classificadas como críticas. Nessas situações, Estornos, Central de Eventos e segurança multi-tenant entram obrigatoriamente na regressão e a certificação completa é exigida após PASS.
