# Fase 26.3.1 — Playwright QA & Homologação Automatizada

Release: `26.3.1-playwright-qa-automation-2026-09-03`

## Objetivo

Transformar a homologação do PDT/Event OS em uma etapa repetível e mensurável, preservando as telas aprovadas e bloqueando regressões de segurança entre produtoras.

## Entregue

- Playwright configurado para Chromium, Firefox, WebKit e Mobile Chrome.
- login E2E e smoke test do PDT.
- testes da Central de Eventos e seus controles oficiais.
- seletores `data-testid` não visuais adicionados à Central de Eventos.
- teste de abertura de evento para o Event Cockpit 360.
- testes de API para isolamento `producerId + eventId`.
- tentativa real de acesso cross-tenant a Evento, Cockpit, Inventory e Customer 360.
- teste de saúde da API do Event Cockpit.
- estrutura de regressão visual da Central de Eventos.
- imagem aprovada pelo usuário preservada em `tests/visual/reference/`.
- HTML report, screenshots, vídeos e traces em falhas.

## Política de qualidade das próximas fases

Cada fase 26.x deverá adicionar ou atualizar ao menos um teste que cubra a funcionalidade nova. Funcionalidades de produtor devem possuir teste de isolamento multi-tenant sempre que lidarem com `producerId` ou `eventId`.

A Central de Eventos é uma tela protegida por regressão. Mudanças visuais nela exigem homologação explícita antes de atualizar a baseline do Playwright.

## Observação de ambiente

O pacote foi preparado sem instalar o binário dos navegadores Playwright no artefato. Isso evita adicionar centenas de MB ao projeto. Após `npm install`, execute `npx playwright install` na máquina/CI onde os testes rodarão.
