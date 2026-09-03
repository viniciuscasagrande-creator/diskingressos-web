# Fase 26.3 — Customer 360 / CRM de Participantes

Release: `26.3-customer-360-crm-2026-09-03`

## Objetivo
Transformar compradores e participantes do evento em uma visão CRM única, preservando a Central de Eventos e toda a arquitetura das fases anteriores.

## Regra de segurança
Toda consulta começa pelo evento e valida `producerId` do token. Produtores não podem consultar clientes de eventos de outras produtoras.

## Identidade
A unificação usa, em ordem: CPF/documento, e-mail, telefone e nome como fallback. Pedidos pagos, participantes, ingressos e check-ins são consolidados sem criar uma segunda fonte de verdade.

## Recursos
- KPIs de clientes, recorrência, VIP/alto valor, receita, ticket médio e participantes.
- RFM simplificado: recência + frequência + valor monetário.
- Segmentos automáticos: VIP, Alto valor, Recorrente, Ativo, Novo e Em risco.
- Busca por nome/e-mail/telefone/documento.
- Perfil Customer 360 com jornada de compra.
- Exportação CSV.
- First-party data isolada por produtora/evento.

## Arquivos principais
- `server/src/services/customer360.ts`
- `server/src/routes/events.ts`
- `src/pages/EventCustomer360Page.tsx`
- `src/pages/event-customer-360.css`
- `src/services/api.ts`
- `db/migrations/026_03_customer_360_crm.sql`
