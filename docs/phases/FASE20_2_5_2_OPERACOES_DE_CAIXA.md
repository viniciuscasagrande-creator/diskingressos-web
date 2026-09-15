# Fase 20.2.5.2 — Operações de Caixa Financeiro

Objetivo: tornar operacional o primeiro núcleo do Financeiro, preservando o Dashboard Financeiro e a separação entre Financeiro e Contabilidade.

## Telas operacionalizadas

- Saldo & Disponibilidade (`finance`)
- Solicitação de Repasse (`finance-payouts`)
- Antecipações (`finance-advance`)
- Extrato Financeiro (`finance-statement`)
- Despesas (`finance-expenses`)
- Contas Bancárias (`finance-bank-accounts`)

## Fluxo funcional

Venda/lançamento → movimentação financeira → saldo → conta bancária → repasse ou antecipação → extrato → auditoria.

## Backend/API adicionada

- `GET /api/finance/cash/summary`
- `GET /api/finance/cash/transactions`
- `GET /api/finance/cash/bank-accounts`
- `POST /api/finance/cash/bank-accounts`
- `PATCH /api/finance/cash/bank-accounts/:id`
- `PATCH /api/finance/cash/bank-accounts/:id/primary`
- `GET /api/finance/cash/expenses`
- `POST /api/finance/cash/expenses`
- `PATCH /api/finance/cash/expenses/:id`
- `PATCH /api/finance/cash/expenses/:id/pay`

Repasses e antecipações continuam usando os endpoints operacionais existentes em `/api/finance/settlement/*`.

## Persistência

Foi incluído o modelo Prisma `FinanceBankAccount`. Despesas usam `FinancialObligation(kind="pagar")`, evitando duplicar entidades de contas a pagar. A liquidação de uma despesa cria uma saída real em `FinancialTransaction` e registra auditoria.

## Regras importantes para implantação

1. Não substituir `App.tsx` por uma versão antiga.
2. Não recriar o menu Financeiro/Contabilidade.
3. Não reativar as páginas seed antigas de Saldo, Extrato, Despesas ou Contas Bancárias.
4. Aplicar as alterações incrementalmente.
5. Depois de copiar os arquivos, executar `npm install` e `npm run db:push` no ambiente local SQLite.
6. Em produção PostgreSQL, aplicar o schema correspondente com o fluxo de banco já utilizado no projeto (`db:push:prod` quando apropriado à estratégia de deploy).
7. Reiniciar frontend e API.

## Observação de validação

O projeto de origem não trouxe `node_modules` íntegro. A tentativa de reinstalação neste ambiente excedeu o limite de execução e deixou dependências parciais; por isso não foi possível concluir um `typecheck`/build confiável aqui. A implantação deve executar `npm install`, `npm run db:generate`, `npm run typecheck` e `npm run build` no VS Code antes do deploy.
