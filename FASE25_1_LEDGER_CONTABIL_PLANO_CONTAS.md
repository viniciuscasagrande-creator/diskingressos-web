# Fase 25.1 — Ledger Contábil e Plano de Contas

**Release:** `25.1-ledger-chart-of-accounts-2026-09-02`

## Objetivo
Transformar a fundação 25.0 em um motor contábil operacional para marketplace de ingressos, mantendo separação entre recursos de produtores e receita própria da plataforma.

## Entregas
- Plano de contas específico para ticketing/intermediação: ativo, obrigações com produtores, receitas próprias e custos.
- Ledger de dupla entrada com validação obrigatória de débito = crédito.
- `ledger_entries` append-only: UPDATE/DELETE bloqueados por trigger.
- Idempotência por lote para impedir contabilização duplicada de webhook/retry.
- Lote de reversão que cria lançamentos opostos e referencia o lote original.
- Views de saldo por conta e de custódia/obrigação por produtor.
- Consultas de razão por pedido e produtor.
- API protegida para contas, saldos, lançamentos, contabilização e reversão.

## Endpoints
- `GET /api/finance/ledger/accounts?tenantId=<uuid>`
- `GET /api/finance/ledger/balances?tenantId=<uuid>`
- `GET /api/finance/ledger/entries?tenantId=<uuid>&orderRef=<pedido>&producerRef=<produtor>`
- `POST /api/finance/ledger/post`
- `POST /api/finance/ledger/reverse/:batchId`

## Exemplo de venda R$ 115,00
A venda deve ser quebrada conforme o contrato financeiro vigente. Exemplo conceitual simples:

1. Débito `1.1.01 Gateway / Valores a Receber` = R$ 115,00
2. Crédito `2.1.01 Custódia / Valor de Ingressos do Produtor` = R$ 100,00
3. Crédito `3.1.01 Taxa de Conveniência / Serviço` = R$ 15,00

Débitos = Créditos = R$ 115,00.

## Regra de correção
Nunca corrigir lançamento alterando `amount_cents`. Criar lote de reversão e, quando necessário, um novo lote correto. Isso preserva trilha de auditoria e reconstrução histórica.

## Regra de saldo
Saldo não é campo livre editável. Ele é derivado do conjunto de lançamentos do ledger. Snapshots podem ser usados para performance, mas precisam reconciliar com o razão.

## Arquivos
- `src/domain/erp/ledger.ts`
- `db/migrations/025_01_ledger_chart_of_accounts.sql`
- `server/src/routes/ledger.ts`

## Proteção das Fases 24
Nenhuma tela financeira homologada foi redesenhada nesta fase. O Ledger será integrado progressivamente às fontes de Saldo, Recebíveis, Repasses, Estornos, Conciliação e DRE.

## Próxima fase
**25.2 — Motor de Split e Contratos Financeiros:** aplicar automaticamente a versão do acordo financeiro vigente a cada transação e gerar os lotes contábeis correspondentes.
