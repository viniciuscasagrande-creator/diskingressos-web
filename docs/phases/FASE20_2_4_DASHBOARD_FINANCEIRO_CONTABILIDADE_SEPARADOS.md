# Fase 20.2.4 — Dashboard Financeiro separado da Contabilidade

Referência funcional: https://financeiropdtnovo.web.app/

O Financeiro mantém as opções da referência e das imagens: Saldo, Solicitar Repasse,
Antecipações, Financeiro Advanced, Conciliação Bancária, Financeiro Spread,
Simulador de Spread, Split Financeiro, Inteligência Financeira, Extrato, Despesas,
Contas Bancárias, Borderô, PDV, Métodos de Pagamento, Pagamentos Customizados,
Negociações Financeiras, Devoluções/Estornos e Operadoras de Cartão.

Foram acrescentados Gateways, Recebíveis, Contas a Pagar, Fluxo de Caixa e Relatórios.

Novo dashboard: src/pages/FinanceCommandCenterPage.tsx
Os KPIs consultam as APIs financeiras existentes. Não há KPIs estáticos de produção.

A Contabilidade ganhou menu e dashboard próprios, separados do Financeiro.
