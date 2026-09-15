# Fase 26.x.3.1 — Playwright Testes Mestre

Objetivo: transformar Playwright em gate de homologação do PDT, com foco especial nos módulos que não podem regredir durante alterações feitas por IA/agentes.

## O que foi adicionado

- Teste crítico permanente do módulo Estornos.
- Contrato funcional/visual da Central de Eventos aprovada.
- Navegação dos módulos core: Eventos, Financeiro, Estornos, Marketing e SAC.
- Varredura completa do Event OS 26.x dentro de um evento selecionado.
- Detecção de erros JavaScript e respostas HTTP 5xx nas páginas principais.
- Testes responsivos em 1440, 1366, 1024 e 390 px.
- Scripts separados para rodar apenas o que interessa durante desenvolvimento ou antes do deploy.

## Comandos

```bash
npm run test:pw:critical
npm run test:pw:event-os
npm run test:pw:runtime
npm run test:pw:responsive
npm run test:pw:master
npm run test:pw:all
```

Para o deploy publicado, defina a URL antes de executar:

Windows PowerShell:

```powershell
$env:PLAYWRIGHT_BASE_URL="https://safesaff.vercel.app"
npm run test:pw:master
```

Windows CMD:

```cmd
set PLAYWRIGHT_BASE_URL=https://safesaff.vercel.app
npm run test:pw:master
```

## Credenciais QA

Preferir variáveis de ambiente:

- E2E_PRODUCER_A_EMAIL
- E2E_PRODUCER_A_PASSWORD
- E2E_PRODUCER_A_ID
- E2E_PRODUCER_B_EMAIL
- E2E_PRODUCER_B_PASSWORD
- E2E_PRODUCER_B_ID
- E2E_ADMIN_EMAIL
- E2E_ADMIN_PASSWORD

## Regra de homologação

Um deploy não deve ser aprovado se `test:pw:critical` falhar. Em especial, falha do teste de Estornos deve bloquear a homologação.
