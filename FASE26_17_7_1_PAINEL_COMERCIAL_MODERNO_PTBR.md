# Fase 26.17.7.1 — Painel Comercial Moderno PT-BR

Release: `26.17.7.1-painel-comercial-moderno-ptbr-2026-09-09`

## Objetivo

Implantar o Painel Comercial como a primeira tela após a abertura de um evento na Central de Eventos, preservando a Central de Eventos aprovada, o Dashboard Financeiro e o módulo independente de Estornos.

## Implementado

- Painel Comercial moderno em React, responsivo e 100% PT-BR.
- KPIs: Receita Total, Ingressos Vendidos, Disponíveis, Cortesias e Ocupação.
- Evolução de Vendas em SVG com alternância Financeiro / Quantidade.
- Ritmo de Vendas com Ticket Médio, Ponto de Equilíbrio, Meta de Vendas e Projeção Final.
- Ponto de equilíbrio e meta aparecem como **Não configurado** quando não existem dados persistidos.
- Projeção final somente é calculada quando há histórico real suficiente e data futura válida.
- Formas de pagamento derivadas de pedidos pagos reais.
- Tipos de ingresso derivados dos ingressos reais do evento.
- Ocupação, últimas transações e vendas por dia da semana.
- Filtros Tudo, Hoje, 7 Dias e 30 Dias.
- Acesso explícito ao Event OS pelo botão **Acessar Event OS**.
- Central de Eventos: Horizontal / Vertical, 2 a 6 colunas no modo Vertical e modo Comparar.
- Preferência de visualização persistida em `localStorage`.

## API

`GET /api/events/:id/commercial-dashboard?period=tudo|hoje|7d|30d`

O endpoint valida tenant/produtora antes de retornar qualquer dado.

## Proteções

- Central de Eventos permanece com o layout horizontal oficial como padrão.
- `/app/finance-refunds` e `FinanceDisputesHubPage` não foram removidos ou absorvidos.
- Dashboard Financeiro não foi redesenhado.
- Event OS permanece contextual ao evento.

## Dados

Não há dados comerciais fictícios no Painel Comercial de produção. Os dados vêm de `Order`, `Lot`, `Ticket` e `Event` via Prisma/PostgreSQL. Estados vazios são exibidos quando não há registros.
