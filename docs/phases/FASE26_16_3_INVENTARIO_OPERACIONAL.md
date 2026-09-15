# Fase 26.16.3 — Inventário Operacional

Release: `26.16.3-inventario-operacional-2026-09-04`

## Objetivo

Transformar o Inventory Engine existente em uma tela operacional de verdade, mantendo o contexto do Event OS e a proteção `producerId + eventId`.

## Funções entregues

- atualização manual do inventário;
- pesquisa de lote/setor;
- filtros por status;
- criação de lote;
- edição de nome, setor, preço, capacidade, janela de venda e status;
- pausa e reabertura de vendas do lote;
- criação de hold temporário;
- liberação de hold com confirmação;
- validação de capacidade mínima considerando vendidos + holds;
- validação de janela de vendas;
- KPIs de capacidade, disponível, ocupação, velocidade, forecast e potencial restante;
- alertas de esgotamento e botão para abrir o lote relacionado;
- capacidade consolidada por setor;
- estados de loading, erro, vazio e atualização;
- auditoria backend para criação/edição/status de lote e holds;
- isolamento por produtora e evento em todos os endpoints novos.

## Endpoints

- `GET /api/events/:id/inventory-engine`
- `POST /api/events/:id/inventory-lots`
- `PATCH /api/events/:id/inventory-lots/:lotId`
- `PATCH /api/events/:id/inventory-lots/:lotId/status`
- `POST /api/events/:id/inventory-holds`
- `PATCH /api/events/:id/inventory-holds/:holdId/release`

## Guardas

A capacidade de um lote não pode ser reduzida abaixo de `sold + holds ativos`.
Nenhuma mutação aceita lote de outro evento/produtor.
O campo `sold` não é editável por esta tela; ele continua derivado das vendas reais.

## Testes

- `npm run verify:inventory-operational`
- `npm run test:pw:inventory-operational`
- `npm run test:pw:inventory-gate`

O teste Playwright abre o evento real do produtor, entra em Inventário, valida os controles, abre os fluxos de Novo Lote e Hold e testa o filtro sem gravar uma operação financeira/comercial.

## Módulos protegidos

A fase não altera nem remove Eventos, Financeiro, Estornos, Marketing ou SAC.
