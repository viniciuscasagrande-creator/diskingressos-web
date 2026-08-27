# Fase 16.4 — Central UTM & Conversões

Esta fase consolida o fluxo de UTM do evento em uma única tela.

## Objetivo

Evitar a navegação fragmentada entre Gerar Link, Links Gerados, Pedidos & Conversões e Gráficos. O usuário entra em **Central UTM & Conversões**, cria ou seleciona uma URL UTM e a mesma seleção passa a alimentar todos os indicadores e detalhes da página.

## Comportamento

1. A página inicia sem URL selecionada e deixa claro que os gráficos estão vazios.
2. Os links UTM existentes do evento ficam disponíveis para seleção.
3. Ao selecionar um link, o backend valida `producerId + eventId + linkId`.
4. KPIs, funil, gráficos e tabela de jornada são recalculados apenas para aquele link.
5. Uma nova UTM pode ser criada em drawer sem sair da tela e é selecionada automaticamente após o salvamento.
6. A jornada de abandono fica preparada para integração com o módulo de Remarketing.

## KPIs

- Visitas
- Adicionou ao carrinho
- Iniciou checkout
- Finalizou
- Receita atribuída
- Conversão geral
- Ticket médio

## Funil

Visita → Adicionou → Checkout → Abandonou → Compra.

## Backend

Nova entidade `TrackingJourneyAction` registra ações atribuídas a um `TrackingLink`:

- `added`
- `checkout`
- `removed`
- `abandoned`
- `finalized`

### APIs

- `GET /api/marketing/utm/dashboard?eventId=:eventId&linkId=:linkId`
- `POST /api/marketing/utm/actions`
- `GET /api/marketing/links?eventId=:eventId`
- `POST /api/marketing/links`

## Segurança

Produtores só conseguem consultar links e jornadas de eventos pertencentes à própria `producerId`. Admin e Admin Master mantêm o escopo global autorizado.

## Seed

O seed inclui duas URLs de demonstração do evento Iron Maiden e jornadas de conversão para validar filtros, funil, gráficos e pedidos.
