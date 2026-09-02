# Fase 24.9 — Central Independente de Estornos, Reembolsos e Chargebacks

## Regra arquitetural
Estornos passa a ser um módulo independente na sidebar principal, fora do grupo Financeiro, com selo **ERP**.

O Dashboard Financeiro homologado permanece inalterado.

## Navegação
- Item independente: **Estornos**
- Rota interna preservada: `finance-refunds`
- `finance-disputes` e `finance-chargebacks` também destacam o módulo Estornos.

## Central operacional
- Fila de Aprovações
- Montante Devolvido
- Chargebacks & Risco
- Zona de Segurança
- Estornos & Devoluções
- Chargebacks & Contestações
- Impacto Financeiro & Reversões
- Webhooks & Logs do Provedor

## Integrações preservadas
O módulo continua integrado às APIs existentes de estornos, aprovações, processamento, chargebacks, evidências e webhooks.

## Regra de release
Marcador: `24.9-independent-refunds-2026-09-02`.
O `verify:finance-release` valida a presença da Fase 24.9 no `src` e no `dist`.
