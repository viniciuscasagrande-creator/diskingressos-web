# Fase 24.7 — Repasses e Agenda de Pagamentos ao Produtor

## Regra principal
O Dashboard Financeiro aprovado continua preservado. A Fase 24.7 evolui somente a área operacional de **Repasses**, sem criar novos itens na sidebar principal.

## Implementado

### 1. Agenda de Pagamentos ao Produtor
A tela `FinancePayoutsPage.tsx` ganhou uma agenda operacional com janelas de pagamento:

- Hoje;
- Próximos 7 dias;
- Próximos 15 dias;
- Aguardando compliance.

Cada cartão apresenta valor previsto, quantidade de pagamentos e funciona como filtro da tabela de repasses.

### 2. Esteira de Repasse
Foi adicionada uma visão de fluxo com as etapas:

1. Solicitado;
2. Compliance;
3. Agendado;
4. Processando;
5. Pago.

A esteira utiliza os próprios dados da tela para mostrar a quantidade de registros em cada etapa.

### 3. Impacto previsto no caixa
A página passa a exibir:

- saldo disponível;
- valor total de repasses agendados;
- valores aguardando compliance;
- saldo projetado após os pagamentos agendados.

### 4. Integração com Fluxo de Caixa
A Agenda de Pagamentos possui acesso direto ao módulo de Fluxo de Caixa para que o cliente visualize o impacto dos repasses nas demais entradas e saídas.

### 5. Filtros integrados
Foram preservados e integrados:

- busca por evento, produtora ou conta;
- filtro por status;
- drill-down vindo do Dashboard Financeiro;
- filtro rápido por janela da Agenda;
- opção para limpar o filtro da Agenda.

### 6. Solicitação de repasse preservada
A operação já existente de solicitação de novo repasse continua disponível, incluindo:

- escolha do evento;
- escolha da conta bancária;
- PIX ou TED;
- validação de saldo disponível;
- criação do registro de repasse.

### 7. Proteção de release
O novo marcador é:

`24.7-payouts-agenda-2026-09-02`

O script `verify:finance-release` agora exige no `src` e no `dist` os marcadores:

- `AGENDA DE PAGAMENTOS AO PRODUTOR`;
- `Esteira de Repasse`;
- `Impacto previsto no caixa`.

## Não alterado

- Dashboard Financeiro principal;
- cards, KPIs, gráficos e layout do Dashboard;
- menu Financeiro de 5 pilares;
- Central de Saldo e Extrato;
- Agenda Financeira de Recebíveis;
- módulos de Split, Spread, Pagamentos & Taxas e Relatórios.

## Validação

```bash
npm install
npm run build:vercel
```

O release somente deve ser homologado quando o verificador informar:

`Fases 24.1 a 24.7 confirmadas no build.`
