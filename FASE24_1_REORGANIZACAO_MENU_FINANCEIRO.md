# FASE 24.1 — REORGANIZAÇÃO DO MENU FINANCEIRO & DIRETRIZES DA ARQUITETURA

## 1. REGRA CRÍTICA & CONTRATO DE DESENVOLVIMENTO
> **PROIBIDO alterar, recriar, redesenhar ou substituir o Dashboard Financeiro existente.**
> O Dashboard Financeiro atual é a tela oficial, aprovada e central (HUB) do módulo Financeiro.

### O que NÃO ALTERAR:
- Layout do Dashboard Financeiro (`FinanceCommandCenterPage.tsx` / `FinanceDashboardPage.tsx`)
- Cards de atalho e cards operacionais
- KPIs e métricas consolidadas
- Gráficos e séries temporais
- Tabelas de extrato/movimentação
- Filtros de período e evento
- Paleta de cores, tipografia e estilização
- Componentes e lógica financeira existente

### O que É PERMITIDO alterar:
- Nomenclatura do menu lateral (Sidebar)
- Organização dos 5 itens da sidebar
- Rotas e redirecionamentos
- Conexões e links internos de navegação (`onNavigate`) entre os cards do Dashboard e os submódulos existentes
- Estados ativo/hover e responsividade da sidebar

---

## 2. ESTRUTURA OFICIAL DO MENU LATERAL (SIDEBAR)

A sidebar lateral do Financeiro possui **exclusivamente 5 itens**:

```text
FINANCEIRO
├── ▣ Dashboard Financeiro       (Hub Principal com todas as operações)
├── ⚡ Antecipações               (Antecipação, condições, taxas e spread)
├── ↗ Divisão de Receitas        (Split, coprodutores e regras de distribuição)
├── ▭ Pagamentos & Taxas         (PIX, cartões, adquirentes, MDR e tarifas)
└── ▤ Relatórios Financeiros     (Borderô, DRE, extratos e relatórios)
```

---

## 3. MAPEAMENTO DE TRANSIÇÃO E COMPATIBILIDADE

| Menu Anterior                | Novo Menu no Sistema          | Rota no Sistema                   |
| ---------------------------- | ----------------------------- | --------------------------------- |
| **Saldos, Extrato & Rep...** | **▣ Dashboard Financeiro**    | `finance-dashboard` / `finance`   |
| **Antecipação & Spread**     | **⚡ Antecipações**            | `finance-advance`                 |
| **Split & Coprodução**       | **↗ Divisão de Receitas**     | `finance-split`                   |
| **Meios de Pagamento & Tax** | **▭ Pagamentos & Taxas**      | `finance-methods`                 |
| **Borderô & Relatórios DRE** | **▤ Relatórios Financeiros**  | `finance-reports`                 |

---

## 4. DIRETRIZES PARA A FASE 24.2 (DASHBOARD COMO HUB)

Na **Fase 24.2**, o Dashboard Financeiro atuará como o **HUB Integrado**:
- Todos os cards de operações (*Saldo, Extrato, Recebíveis, Repasses, Fluxo de Caixa, Eventos, Conciliação, DRE, Indicadores, Exportações*) devem manter seus links diretos (`onNavigate`) operacionais.
- Quando o usuário clicar em uma operação (ex: *Repasses* ou *Antecipações*), ele navega fluidamente para o módulo correspondente e pode retornar com 1 clique usando o botão universal de voltar.
- Preservar o design estético de Cockpit Operacional e os indicadores consolidados de caixa.
