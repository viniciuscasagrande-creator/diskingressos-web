# Fase 16.5 — Atribuição UTM real + Carrinho Abandonado

## Objetivo
Persistir a origem UTM desde o primeiro clique até a venda, vincular a sessão ao pedido e criar oportunidades de remarketing quando o carrinho fica inativo.

## Fluxo
1. `POST /api/tracking/resolve/:code` cria uma sessão de atribuição de 30 dias e registra `view_content`.
2. O checkout mantém `sessionKey` e envia eventos públicos para `POST /api/tracking/events`: `added`, `checkout` e `removed`.
3. Ao criar a venda, `POST /api/orders` aceita `attributionSessionKey`; o backend valida produtora/evento, vincula a sessão ao pedido e registra `finalized`.
4. `POST /api/marketing/utm/abandon-sweep` identifica sessões sem atividade, marca abandono e cria `RecoveryOpportunity` para WhatsApp/E-mail quando existe contato.
5. A Central UTM mostra sessões em jornada, abandonadas, convertidas, pedido atribuído e valor de carrinho.

## Segurança
A origem da atribuição é determinada no servidor pelo link rastreável. O `sessionKey` não permite trocar `producerId` ou `eventId`. A associação à venda só ocorre quando sessão, evento e produtora coincidem e a sessão não expirou.

## Produção
O sweep manual desta fase deve evoluir para worker/fila agendada. Cookies/consentimento devem respeitar a política LGPD da plataforma e o storefront deve persistir o `sessionKey` apenas após a regra de consentimento aplicável.
