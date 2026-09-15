# Fase 26.x.3 — Deploy Guard + Homologação Automática Pós-Vercel

Release: `26.x.3-deploy-guard-2026-09-03`

## Objetivo
Impedir que um deploy seja tratado como homologado apenas porque o build terminou. A Fase 26.x.3 valida o ambiente publicado e detecta regressões introduzidas por refatorações ou agentes de IA, incluindo o desaparecimento do módulo Estornos.

## Gate em três camadas
1. **Core Stability Gate** — valida arquivos, PageKeys, rotas e módulos protegidos antes do build.
2. **HTTP Deploy Smoke** — consulta o domínio publicado e as rotas canônicas depois do deploy.
3. **Playwright Pós-Vercel** — abre o deploy real no Chromium, autentica um produtor QA e confere os módulos protegidos e a Central de Eventos.

## Módulos protegidos
- Eventos `/app/events`
- Financeiro `/app/finance-dashboard`
- Estornos `/app/finance-refunds`
- Marketing `/app/marketing-dashboard`
- Atendimento / SAC `/app/sac-hub`

## Comandos
```bash
PLAYWRIGHT_BASE_URL=https://safesaff.vercel.app npm run deploy:guard:http

PLAYWRIGHT_BASE_URL=https://safesaff.vercel.app \
E2E_PRODUCER_A_EMAIL="usuario.qa@empresa.com" \
E2E_PRODUCER_A_PASSWORD="senha-segura" \
npm run deploy:guard:e2e

npm run homologate:vercel
```

## GitHub Actions
Foi incluído `.github/workflows/post-vercel-homologation.yml`. O workflow pode ser disparado manualmente ou por `repository_dispatch` do tipo `vercel-deployment-ready`.

Secrets necessários no GitHub:
- `E2E_PRODUCER_A_EMAIL`
- `E2E_PRODUCER_A_PASSWORD`

Opcionalmente configure a variável `PLAYWRIGHT_BASE_URL`. O padrão é `https://safesaff.vercel.app`.

## Regra de homologação
Build aprovado não significa deploy homologado. A homologação somente é aprovada quando o Deploy Guard pós-Vercel passa. Se Estornos ou qualquer módulo protegido desaparecer, o Playwright falha e mantém evidências em screenshot, trace e relatório HTML.

## Central de Eventos
Esta fase não altera o visual aprovado da Central de Eventos. O teste apenas verifica a presença dos controles `Comparar`, `Horizontal`, `Ativos`, `Inativos` e `Todos`.
