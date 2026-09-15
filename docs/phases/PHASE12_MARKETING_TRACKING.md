# Fase 12 — Campanhas, Pixel & Analytics, Links/UTMs/QR

A Fase 12 transforma três áreas de Marketing em recursos persistentes de backend: **Campanhas**, **Pixel & Analytics** e **Links, UTMs e QR Codes**.

## 1. Campanhas

Entidade `MarketingCampaign`, vinculada obrigatoriamente à `Producer` e opcionalmente a um `Event`.

Rotas:

- `GET /api/marketing/campaigns`
- `POST /api/marketing/campaigns`
- `PATCH /api/marketing/campaigns/:id`

O backend aplica o tenant da sessão. Usuários de produtor não podem selecionar nem consultar outra produtora.

## 2. Herança de Pixel & Analytics

Entidade `TrackingConfig` com três níveis:

`GLOBAL -> PRODUTORA -> EVENTO`

Cada nível aceita:

- `inherit` — herdar do nível superior
- `own` — usar configuração própria
- `disabled` — desativar naquele contexto

Provedores previstos:

- Meta Pixel
- GA4
- Google Tag Manager
- Google Ads Conversion
- WhatsApp
- E-mail
- APIs de automação

Rotas:

- `GET /api/marketing/tracking`
- `PUT /api/marketing/tracking`
- `GET /api/marketing/tracking/resolved`

A rota `resolved` devolve a configuração efetiva considerando precedência Evento > Produtora > Global e respeitando `inherit`/`disabled`.

## 3. Links, UTMs e QR Codes

Entidade `TrackingLink` com destino, UTMs, contador de cliques e conversões, produtora e evento opcional.

Rotas:

- `GET /api/marketing/links`
- `POST /api/marketing/links`
- `POST /api/marketing/links/:id/click`

A API devolve `trackedUrl` já com os parâmetros UTM e `qrPayload`, que pode ser transformado em QR visual na camada de apresentação ou por serviço dedicado.

## Segurança

As rotas de Marketing exigem um dos perfis:

- `admin-master`
- `admin`
- `producer-admin`
- `producer-marketing`

Todos os dados de escrita são validados no servidor. O `producerId` de usuários produtores é obtido da sessão JWT e não é confiado ao navegador.
