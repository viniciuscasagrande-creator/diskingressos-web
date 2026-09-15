# Fase 25.7.1 — Motor Universal de Conversões

Release: `25.7.1-universal-conversion-engine-2026-09-02`

## Objetivo

Transformar os eventos de jornada/venda do SafeSaff em um evento canônico único e distribuí-lo, de forma idempotente e multi-tenant, para as integrações de marketing cadastradas na Fase 25.7.

## Fluxo

`SafeSaff / DiskIngressos -> Evento canônico -> deduplicação -> integrações elegíveis -> payload por provedor -> entrega/log`

Eventos canônicos: `page_view`, `view_content`, `add_to_cart`, `begin_checkout`, `add_payment_info`, `purchase`, `lead`, `sign_up`.

### Purchase automático

A venda dispara `purchase` no backend quando:

- nasce com `status = pago`; ou
- muda de outro status para `pago`.

O identificador de deduplicação da compra é `purchase:<order.code>`. Reprocessamentos da mesma venda não criam uma segunda conversão.

## Segurança e privacidade

- Tokens permanecem criptografados no backend.
- E-mail, telefone e external ID são convertidos em SHA-256 no payload quando aplicável.
- O frontend nunca recebe o token em texto aberto.
- O motor respeita produtora, evento e escopo das integrações.
- `MARKETING_DELIVERY_MODE=dry_run` é o padrão seguro. Somente `live` habilita chamadas externas.

## Provedores

O mapa canônico contempla Meta, TikTok, GA4, Google Ads, LinkedIn, Pinterest, Snapchat, Microsoft Ads, GTM e Clarity. Meta, TikTok e GA4 possuem adaptadores HTTP iniciais; provedores que exigem OAuth/worker específico ficam registrados como `queued` para o conector dedicado.

## Banco

Novos modelos Prisma:

- `MarketingConversionEvent`
- `MarketingConversionDispatch`

Migration de referência: `db/migrations/025_07_01_universal_conversion_engine.sql`.

A chave `eventId` é única no evento canônico. Cada fan-out também possui `idempotencyKey` única por integração/provedor/evento.

## API

- `POST /api/marketing/conversions/dispatch`
- `GET /api/marketing/conversions/summary`

## UI

A Central de Pixels & Integrações passou a exibir o bloco **Motor Universal de Conversões**, deixando visível o pipeline da Fase 25.7.1 e os eventos canônicos suportados.

## Arquivos principais

- `src/domain/marketing/conversionEngine.ts`
- `server/src/services/conversionEngine.ts`
- `server/src/routes/conversions.ts`
- `server/src/routes/orders.ts`
- `server/src/app.ts`
- `src/components/TrackingIntegrationsManager.tsx`
- `src/styles.css`
- `prisma/schema.prisma`
- `prisma/schema.postgresql.prisma`
- `db/migrations/025_07_01_universal_conversion_engine.sql`

## Deploy

Antes de habilitar `MARKETING_DELIVERY_MODE=live`, configurar as credenciais oficiais de cada provedor e validar a versão/endpoint vigente das APIs das plataformas. Em homologação, manter `dry_run` para validar deduplicação, escopo e payloads sem enviar eventos reais.
