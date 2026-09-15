# Fase 20.2.5.3 — Advanced, Conciliação, Spread, Split e Inteligência Financeira

## Objetivo
Consolidar o segundo bloco do Financeiro sem alterar o Dashboard Financeiro aprovado e sem reabrir a separação Financeiro × Contabilidade.

## Implementado
- Nova Central Financeira Advanced (`FinanceAdvancedCommandPage`).
- Novo endpoint `GET /api/finance/advanced/summary`.
- KPIs obtidos de dados persistidos: recebíveis, divergências, margem de Spread, liquidações, repasses, adquirentes e gateways.
- Saúde das fontes: uma fonte indisponível não impede o resumo das demais.
- Alertas calculados para divergências, recebíveis, margem baixa, adquirente/gateway inativo.
- Ranking operacional de adquirentes com aprovação, MDR e prazo D+.
- Atalhos funcionais para Conciliação, Spread, Simulador, Split, Inteligência, Operadoras e Gateways.
- `finance-advanced` / `fin-advanced` deixam de abrir o hub genérico de taxas e passam a abrir a Central Advanced.

## Telas preservadas e integradas
- Conciliação Bancária → `FinanceOperations360Page`, usando API de conciliação e ações de conciliar/auto-conciliar.
- Spread & Rentabilidade → `FinanceSpread360Page`, com dashboard, simulação, comparação, histórico e matriz de taxas.
- Split Financeiro → `FinanceSettlementHubPage`, com regras, beneficiários, repasses, antecipações e liquidações.
- Inteligência Financeira → `FinanceOperations360Page`, usando o resumo operacional real.
- Operadoras, Gateways e Métodos → módulos já operacionais de pagamentos.

## Regra para Gemini / VS Code
Aplicar os arquivos do patch sobre a Fase 20.2.5.2. NÃO refatorar globalmente `App.tsx`, NÃO remover rotas legadas, NÃO substituir o Dashboard Financeiro e NÃO mover funcionalidades contábeis de volta para Financeiro.

## Validação sugerida
```bash
npm install
npm run db:generate
npm run typecheck
npm run build
```

Esta fase não adiciona novo modelo Prisma; `db:push` só é necessário se a Fase 20.2.5.2 ainda não tiver sido aplicada ao banco.
