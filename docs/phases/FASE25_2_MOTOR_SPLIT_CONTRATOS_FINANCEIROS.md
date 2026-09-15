# Fase 25.2 — Motor de Split e Contratos Financeiros

Release: `25.2-split-financial-agreements-2026-09-02`

## Objetivo
Transformar a Negociação Financeira por Evento da Fase 24.8 em regra executável pelo backend. Cada venda passa a localizar a versão do contrato financeiro vigente na data/hora da transação e calcular, em centavos, o valor do produtor, receita própria da plataforma, custos financeiros, reserva e participantes adicionais.

## Regras de arquitetura
1. Contratos são versionados por evento e vigência.
2. Alterar condição comercial cria nova versão; não recalcula vendas históricas.
3. Cada venda deve guardar `agreement_version_id`.
4. Cálculo monetário usa centavos inteiros; percentuais usam basis points (bps), evitando float monetário.
5. Split e Ledger são idempotentes e auditáveis.
6. Produtor pode visualizar e solicitar alteração; ativação da versão permanece sob alçada administrativa/financeira.
7. Dashboard Financeiro homologado não é redesenhado nesta fase.

## Estruturas adicionadas
- `financial_agreement_rules`
- `financial_agreement_participants`
- `split_executions`
- `split_allocations`
- view `active_financial_agreements`
- proteção de contrato ativo por versionamento

## Fluxo
`Venda -> contrato vigente -> regra do meio de pagamento -> motor de split -> allocations -> ledger -> recebíveis/saldo/repasses`

## APIs
- `GET /api/finance/split/agreements/:eventId?tenantId=...`
- `POST /api/finance/split/agreements`
- `POST /api/finance/split/agreements/:id/activate`
- `POST /api/finance/split/simulate`
- `GET /api/finance/split/executions?tenantId=...&eventId=...`

## Próxima integração
Na Fase 25.3, `producer_financial_accounts` e os lançamentos do Ledger passam a formar a Conta Gráfica do Produtor, com saldo bruto, bloqueado, reservado, pendente de liquidação e disponível para repasse.
