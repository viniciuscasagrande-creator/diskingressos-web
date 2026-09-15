# Fase 25.5 — Repasses, Reservas e Disponibilidade Financeira

Release: `25.5-payouts-reserves-availability-2026-09-02`

Esta fase transforma Repasses em um cockpit de disponibilidade financeira. O SafeSaff passa a separar explicitamente dinheiro disponível, comprometido, reservado/bloqueado, a liquidar e já repassado.

## Entregas

- Mapa visual de disponibilidade e composição do saldo.
- Waterfall do saldo atual até o saldo efetivamente livre.
- Política de reserva com proteção de chargeback, risco e garantia.
- Disponibilidade operacional por evento/produtora.
- Regra de repasse que considera compromissos antes de aceitar novo payout.
- `producer_balance_reserves`: reservas imutáveis por origem, motivo e vínculo com Ledger.
- `payout_commitments`: compromisso financeiro criado antes da liquidação bancária.
- `producer_payout_availability`: visão consolidada do limite efetivamente sacável.
- `src/domain/erp/payoutAvailability.ts`: cálculo e validação de disponibilidade.

## Regra de governança

Saldo não é campo editável. Reservas, desbloqueios, estornos e correções devem produzir eventos auditáveis e, quando houver impacto contábil, lançamentos compensatórios no Ledger. Um pedido de repasse nunca pode exceder `available_for_payout_cents`.

## Fórmula operacional

`Disponível para repasse = Saldo Ledger - Reservas ativas - Compromissos de payout`

A camada visual usa o Design System Limitless integrado na Fase 25.3.4 e segue a padronização financeira: textos à esquerda, valores à direita e números tabulares.
