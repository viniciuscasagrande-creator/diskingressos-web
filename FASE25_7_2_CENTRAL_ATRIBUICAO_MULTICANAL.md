# Fase 25.7.2 — Central de Atribuição Multicanal

Release: `25.7.2-multichannel-attribution-center-2026-09-02`

## Objetivo
Consolidar UTM, `fbclid`, `ttclid`, `gclid`, `msclkid`, sessão, campanha, pedido, receita e investimento para medir CAC/CPA/ROAS por canal e entender jornadas multi-touch.

## Entregas
- Nova tela `MarketingAttributionPage.tsx`.
- Modelos de atribuição: último clique, primeiro clique, linear, posição e data-driven preparado.
- KPIs de receita atribuída, conversões, ROAS, CPA e assistências.
- Ranking de canais com investimento e receita.
- Jornadas multi-touch.
- Indicador de taxa de identificação de click IDs / UTMs.
- Estrutura SQL para touchpoints e custos por campanha.
- Multi-tenant por produtora e evento.

## Regra de arquitetura
O SafeSaff registra uma única verdade de conversão e depois distribui o crédito conforme o modelo de atribuição. A Fase 25.7.1 continua responsável pelo evento canônico e deduplicação; a 25.7.2 adiciona a camada analítica de crédito de canal.
