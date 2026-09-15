# FASE 24.3 — Drill-down Financeiro Contextual

## Regra crítica
O Dashboard Financeiro continua APROVADO e visualmente preservado.

Nesta fase não foram alterados layout, cards, KPIs, cores, grid, textos principais nem a arquitetura visual do Dashboard Financeiro.

## Objetivo
Fazer o Dashboard Financeiro funcionar como HUB operacional contextual: ao clicar em um KPI, a tela de destino já abre com o recorte correspondente ao indicador selecionado.

## Drill-down implantado

### Saldo futuro
- Destino: `finance-receivables`
- Filtro automático: recebíveis em aberto (tudo que ainda não foi liquidado)
- Se houver evento selecionado no Dashboard, o evento também é aplicado na busca da tela de recebíveis.

### A pagar
- Destino: `finance-payables`
- Filtro automático: obrigações em aberto (tudo que ainda não foi pago)
- O evento selecionado no Dashboard é transportado para a busca da tela de contas a pagar.

### Repasses pendentes
- Destino: `finance-payouts`
- Filtro automático: repasses ainda não pagos (`Agendado`, `Processando`, `Em Análise` etc.)
- O evento selecionado no Dashboard é transportado para a busca da tela de repasses.

### Divergências
- Destino: `finance-reconciliation`
- Filtro automático: somente divergências ainda não conciliadas.

### Recebíveis — faixa de saúde financeira
- Destino: `finance-receivables`
- Filtro automático: recebíveis em aberto.

## Contexto por evento
O seletor `Todos os eventos / Evento específico` do Dashboard agora participa do drill-down.

Quando um evento estiver selecionado, o Dashboard envia o nome do evento para a tela de destino, que abre contextualizada naquele evento sempre que a tela possuir busca compatível.

## Implementação técnica
Foi criada uma camada leve de contexto temporário usando `sessionStorage`:

- arquivo: `src/utils/financeDrilldown.ts`
- chave: `safesaff.finance.drilldown.v1`
- validade do contexto: 60 segundos
- o contexto é consumido apenas pela rota de destino correta e removido após o uso

Isso evita alterar a assinatura global de navegação do SafeSaff e reduz risco de regressão nas demais áreas do sistema.

## Arquivos alterados
- `src/pages/FinanceCommandCenterPage.tsx`
- `src/pages/FinancePayoutsPage.tsx`
- `src/pages/FinanceReceivablesPage.tsx`
- `src/pages/FinancePayablesPage.tsx`
- `src/pages/FinanceReconciliationPage.tsx`

## Arquivo criado
- `src/utils/financeDrilldown.ts`

## Proteção permanente
É proibido usar esta fase como justificativa para redesenhar ou substituir o Dashboard Financeiro. O drill-down deve continuar sendo uma camada funcional sobre o Dashboard aprovado.
