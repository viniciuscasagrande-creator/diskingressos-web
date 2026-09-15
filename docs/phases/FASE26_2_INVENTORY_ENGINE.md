# Fase 26.2 — Inventory Engine

Release: `26.2-inventory-engine-2026-09-03`

## Objetivo
Transformar lotes, setores, capacidade e disponibilidade em um motor operacional de inventário, mantendo a Central de Eventos visualmente inalterada conforme a referência oficial aprovada.

## Regra visual
A tela **Eventos** permanece como baseline oficial do PDT: cards horizontais, imagem lateral, Total (R$), Vendas, Disponível, Cortesia, Ocupação, data/hora e ações. A Fase 26.2 não redesenha esta tela. O Inventory Engine aparece somente dentro do contexto do evento.

## Implementado
- Nova página contextual `Inventário` no Event OS.
- Endpoint seguro `GET /api/events/:id/inventory-engine`.
- Capacidade, vendidos, holds, disponibilidade, ocupação e potencial de receita.
- Velocidade de vendas com base nas últimas 24 horas.
- Previsão estimada de esgotamento por lote e para o evento.
- Consolidação por setor.
- Alertas para lote esgotado, ocupação crítica, previsão de esgotamento em 12/48 horas e ausência de lote ativo.
- Holds temporários operacionais com expiração automática no cálculo.
- `POST /api/events/:id/inventory-holds` para criar hold.
- `PATCH /api/events/:id/inventory-holds/:holdId/release` para liberar hold.
- Validação obrigatória `producerId + eventId + lotId` no backend.
- Auditoria para criação e liberação de holds.
- Modelos `InventoryHold` e `InventorySnapshot` preparados no Prisma.
- Migration `db/migrations/026_02_inventory_engine.sql`.

## Fórmula operacional
`Disponível = Capacidade - Vendidos - Holds ativos`

`Velocidade/h = ingressos emitidos nas últimas 24h / 24`

`Previsão de esgotamento = Disponível / Velocidade/h`

A previsão é indicativa e não altera preço, lote ou capacidade automaticamente.

## Segurança
O produtor nunca informa o tenant como fonte de verdade. O backend resolve o evento, verifica sua `producerId` e bloqueia qualquer acesso cruzado. Um hold só pode ser criado para lote pertencente ao mesmo evento e à mesma produtora.

## Próxima etapa sugerida
**Fase 26.3 — Customer 360 / CRM de Participantes**, conectando comprador, participante, pedidos, ingressos, eventos frequentados, RFM e segmentação.
