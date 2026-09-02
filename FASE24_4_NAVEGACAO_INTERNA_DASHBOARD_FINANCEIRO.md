# Fase 24.4 — Navegação Interna do Dashboard Financeiro

## Objetivo
Transformar o Dashboard Financeiro aprovado em um HUB de navegação operacional sem aumentar o menu lateral e sem redesenhar o dashboard.

## Regra crítica de preservação
O Dashboard Financeiro continua sendo a tela principal e não deve ser recriado, substituído ou redesenhado.

Nesta fase foram preservados:
- KPIs existentes;
- cards e grupos de funções;
- indicadores de saúde financeira;
- busca de funções;
- filtro por evento;
- ações de atualização e solicitação de repasse;
- organização e conteúdo das seções existentes;
- nomenclatura simplificada do menu lateral definida na Fase 24.1.

## Implementação
Foi adicionada somente uma barra compacta de navegação interna, imediatamente abaixo do cabeçalho do Dashboard Financeiro.

Itens:
1. Visão Geral — permanece no Dashboard Financeiro.
2. Saldo — abre `finance`.
3. Extrato — abre `finance-statement`.
4. Recebíveis — abre `finance-receivables`.
5. Repasses — abre `finance-payouts`.
6. Fluxo de Caixa — abre `finance-cashflow`.
7. Conciliação — abre `finance-reconciliation`.
8. Relatórios — abre `finance-reports`.

## Contexto financeiro
A navegação utiliza a infraestrutura de drill-down criada na Fase 24.3. Quando um evento estiver selecionado no Dashboard, o contexto do evento é encaminhado junto com a navegação para as telas compatíveis.

## Experiência
- O primeiro item, **Visão Geral**, permanece ativo no Dashboard.
- A barra é horizontal, compacta e responsiva.
- Em telas menores, a navegação usa rolagem horizontal apenas dentro desta barra, sem alterar a sidebar.
- Os itens possuem navegação por teclado e foco visível.

## Arquivos alterados
- `src/pages/FinanceCommandCenterPage.tsx`
- `src/styles.css`

## Proteção para próximas fases
Não remover nem alterar a estrutura aprovada do Dashboard Financeiro para implementar novas funções. Novas operações devem ser conectadas por drill-down, navegação interna ou telas especializadas.
