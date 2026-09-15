# FASE 24.2 — DASHBOARD FINANCEIRO COMO HUB OPERACIONAL

## 1. Regra de Preservação Visual
> **O Dashboard Financeiro foi integralmente preservado em termos visuais e arquiteturais.**
> Nenhuma alteração foi efetuada em cards, KPIs, cores, grid, filtros, layout ou lógica financeira de cálculo.

---

## 2. Conexões Operacionais do HUB

Cada indicador visual e métrica consolidada do Dashboard conecta-se diretamente à sua área funcional:

### KPIs Principais:
- **Saldo disponível** (`finance`) → Operações de Caixa & Saldo Consolidado
- **Saldo futuro** (`finance-receivables`) → Agenda de Recebíveis e Previsões
- **A pagar** (`finance-payables`) → Gestão de Obrigações e Contas a Pagar
- **Repasses pendentes** (`finance-payouts`) → Solicitações e Fila de Repasses
- **Margem média Spread** (`finance-spread`) → Spread, MDRs e Adquirência
- **Divergências** (`finance-reconciliation`) → Conciliação Bancária & Operacional

### Faixa de Saúde e Indicadores Rápidos:
- **Gateways ativos** (`finance-gateways`) → Gerenciamento de Gateways
- **Adquirentes ativas** (`finance-operators`) → Operadoras de Cartão
- **Métodos configurados** (`finance-methods`) → Meios de Pagamento & Taxas
- **Em estornos** (`finance-refunds`) → Devoluções / Estornos
- **Em recebíveis** (`finance-receivables`) → Contas a Receber

---

## 3. Próxima Fase: Fase 24.3 (Drill-down Financeiro)
A **Fase 24.3** dará suporte à passagem de parâmetros e filtros contextuais (ex: clicar no card de *Repasses pendentes* abrindo a tela de repasses com a aba/status `pendentes` pré-filtrada), sem qualquer alteração no layout do dashboard.
