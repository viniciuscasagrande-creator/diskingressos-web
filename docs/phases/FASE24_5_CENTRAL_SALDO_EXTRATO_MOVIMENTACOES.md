# Fase 24.5 — Central de Saldo, Extrato e Movimentações

## Regra principal
O Dashboard Financeiro aprovado continua preservado. Esta fase não redesenha KPIs, cards, gráficos ou estrutura do `FinanceCommandCenterPage`.

## Implementado

### 1. Central operacional integrada
As telas de operações de caixa passam a ter uma navegação interna comum:

- Saldo
- Extrato & Movimentações
- Recebíveis
- Repasses
- Despesas
- Contas Bancárias

A navegação fica dentro do módulo financeiro e não cria novos itens na sidebar principal.

### 2. Contexto do Dashboard preservado
O contexto enviado pelo drill-down das Fases 24.3/24.4 agora é consumido também por Saldo e Extrato. Quando o usuário entra a partir de um evento selecionado no Dashboard, a Central tenta manter o mesmo evento automaticamente.

### 3. Extrato transformado em central de movimentações
O extrato ganhou filtros operacionais combináveis:

- busca por código, evento, descrição e categoria;
- tipo: entrada / saída;
- status;
- categoria;
- total de movimentações filtradas;
- entradas liquidadas;
- saídas liquidadas;
- saldo do período;
- exportação CSV respeitando os filtros aplicados.

### 4. Proteção de release
O marcador da versão foi atualizado para `24.5-cash-center-2026-09-02` e o script `verify:finance-release` agora exige também os marcadores da Fase 24.5 no `src` e no `dist`.

## Não alterado

- Dashboard Financeiro principal;
- estrutura dos KPIs do Dashboard;
- menu Financeiro de 5 pilares;
- regras de spread, split, pagamentos ou relatórios;
- APIs financeiras existentes.

## Validação obrigatória

Execute:

```bash
npm install
npm run build:vercel
```

O build só deve ser considerado válido quando o verificador informar que as Fases 24.1 a 24.5 foram encontradas no `dist`.
