# MAPA DE MIGRAÇÃO DO DESIGN SYSTEM DISK (DESIGN SYSTEM MIGRATION MAP)
## Transição de Componentes Legados para a Biblioteca Universal Komposo/Disk

**Fase de Criação:** 29.14.1.3.1 — Componentes Base Universais Komposo/Disk  
**Status:** Oficialmente Ativo (Baseline de Migração Homologada)  
**Regra Crítica:** Nenhum componente legado foi deletado nesta fase. A substituição nos módulos ocorrerá gradativamente nas Fases 29.14.1.3.2 a 29.14.1.3.8.

---

## 1. VISÃO GERAL DAS FAMÍLIAS DE COMPONENTES

| Família | Componente Universal | Localização Oficial | Substitui no Legado |
| :--- | :--- | :--- | :--- |
| **Card** | `DiskCard` | `@/design-system` | `<div className="bg-white border rounded...">`, `Card.tsx` legado |
| **KPI** | `DiskKpiCard` | `@/design-system` | `KpiCard.tsx` legado, cards avulsos de Financeiro, Marketing, Eventos |
| **Tabelas** | `DiskDataTable` | `@/design-system` | `DataTable.tsx` legado, `<table>` manuais em Estornos, Vendas, SAC |
| **Entradas** | `DiskInput` | `@/design-system` | `Input.tsx` legado, `<input>` com hexadecimais avulsos |
| **Seletores** | `DiskSelect` | `@/design-system` | `Select.tsx` legado, selects HTML nativos sem suporte a tema escuro |
| **Segmentos** | `DiskSegmentedControl` | `@/design-system` | Grupos de botões avulsos para Horizontal/Vertical, Ativos/Inativos |
| **Filtros** | `DiskFilterBar` | `@/design-system` | `FilterBar.tsx` legado, barras avulsas de busca em tabelas |
| **Abas** | `DiskTabs` | `@/design-system` | Menus de abas manuais em Financeiro, Marketing e Suporte |
| **Badges** | `DiskBadge`, `DiskStatus` | `@/design-system` | `Badge.tsx` legado com regras de negócio em switch interno |
| **Overlays** | `DiskModal`, `DiskDrawer` | `@/design-system` | `Modal.tsx` legado, Drawers avulsos com sobreposição conflitante |
| **Feedback** | `DiskEmptyState`, `DiskSkeleton` | `@/design-system` | `EmptyState.tsx` legado, loaders e spinners manuais em SVG |
| **Toolbar** | `DiskToolbar` | `@/design-system` | Barras superiores de ação construídas com divs flex avulsas |
| **Gráficos** | `DiskChartContainer` | `@/design-system` | Contêineres com fundos brancos hardcoded em volta de Recharts |
| **Cabeçalhos** | `DiskPageHeader`, `DiskSectionHeader` | `@/design-system` | `PageHeader.tsx` legado, títulos duplicados de módulo |
| **Botões** | `DiskButton` | `@/design-system` | `Button.tsx` legado com azul primário `#1677FF` em vez do Laranja Disk |
| **Formulários** | `DiskFormField` | `@/design-system` | Divs manuais de label + input + mensagem de erro |
| **Formatação** | `formatCurrencyBRL`, `formatNumberBR`, etc. | `@/design-system` | Funções duplicadas `const formatCurrency = ...` em cada módulo |

---

## 2. CRONOGRAMA DE MIGRAÇÃO POR FASE

### Fase 29.14.1.3.2 — Dashboard + Eventos + Vendas/Pedidos (CONCLUÍDA ✅)
- **Status:** Homologada e Concluída com Sucesso (100% Aprovada)
- **Alvos Migrados:**
  - `src/pages/Dashboard.tsx`: Cabeçalho unificado com `DiskPageHeader`, 4 KPIs operacionais com `DiskKpiCard`, cartões operacionais com `DiskCard` (hover semântico e subcomponentes Header/Content), badges e status com `DiskBadge` e `DiskStatus`.
  - `src/pages/EventsPage.tsx`: Eliminação da duplicidade visual do cabeçalho (resolvendo o diagnóstico do vídeo de 58s) unificando no `DiskPageHeader`, barra de controle semântica (`DiskToolbar` / controles com `btn-view-horizontal`, `btn-view-vertical`, seletor de colunas, filtros de status) e strip de resumo operacional com `DiskKpiCard`.
  - `src/components/commerce/CommerceOrdersHubPage.tsx`: Cabeçalho `DiskPageHeader`, 4 KPIs comerciais com `DiskKpiCard`, tabela e cartões integrados a tokens de superfície e borda semânticos, preservando o fluxo do `Dossiê 360°`.
  - `src/styles.css`: Remoção de hardcodes de fundo branco (`#ffffff`) e bordas estáticas em `.summary-strip` e `.events-summary-strip > div`, adotando `var(--disk-bg-surface)` e `var(--disk-border-subtle)`.

### Fase 29.14.1.3.3 — Financeiro + Estornos
- **Alvos:** `src/pages/Financeiro.tsx`, `src/pages/FinanceDisputesHubPage.tsx` (Centro de Controle de Estornos).
- **Substituições Programadas:**
  - Migrar os cards de KPI de saldo e repasse para `DiskKpiCard` com `trendStatus` desacoplado da matemática.
  - Migrar as abas de Visão Geral, Extrato e Relatórios para `DiskTabs`.
  - Migrar a tabela principal de disputas e transações para `DiskDataTable`.
  - Padronizar badges de status (`Aprovado`, `Pendente`, `Contestado`, `Estornado`) com `DiskBadge` e `DiskStatus`.
  - **Preservação:** Manter 100% das rotas, endpoints e regras de negócio de estorno e CI.

### Fase 29.14.1.3.4 — Contabilidade
- **Alvos:** `src/pages/AccountingDashboard.tsx`, conciliação bancária e painéis fiscais.
- **Substituições Programadas:**
  - Substituir cards fiscais com fundos claros legados por `DiskCard` e `DiskKpiCard`.
  - Padronizar a tabela de lançamentos contábeis com `DiskDataTable` (densidade compacta e números alinhados à direita).

### Fase 29.14.1.3.5 — Marketing + CRM
- **Alvos:** `src/pages/MarketingDashboard.tsx`, remarketing e funil de conversão.
- **Substituições Programadas:**
  - Substituir contêineres de métricas (ROAS, conversão, cliques) por `DiskKpiCard`.
  - Envolver gráficos de conversão em `DiskChartContainer` com paleta de tokens semânticos.
  - Padronizar tabela de campanhas e UTMs com `DiskDataTable`.

### Fase 29.14.1.3.6 — SAC + Suporte a Eventos
- **Alvos:** `src/pages/SacHubPage.tsx`, listagem de tickets e chamados.
- **Substituições Programadas:**
  - Padronizar a listagem de chamados com `DiskDataTable` com seleção em lote.
  - Migrar badges de prioridade e status para `DiskBadge` e `DiskStatus` pulsante para tickets abertos em tempo real.
  - Migrar modal de atendimento para `DiskModal` e painel de detalhes para `DiskDrawer`.

### Fase 29.14.1.3.7 — Relatórios + BI + Disk Intelligence
- **Alvos:** Telas analíticas, previsões e relatórios consolidados.
- **Substituições Programadas:**
  - Consolidar todos os gráficos em `DiskChartContainer`.
  - Padronizar exportadores em lote com `DiskToolbar`.

### Fase 29.14.1.3.8 — Administração + Desenvolvedor + Telas Restantes
- **Alvos:** Gestão de usuários, configurações de produtora e vitrine técnica.
- **Substituições Programadas:**
  - Atualizar formulários administrativos com `DiskFormField`, `DiskInput` e `DiskSelect`.
  - Consolidar a vitrine em `/desenvolvedor/design-system` como referência canônica viva.

### Fase 29.14.1.3.9 — Auditoria Visual Final + Remoção Controlada de Legado
- **Ações:**
  - Identificar arquivos não mais importados em `src/components/ui/`.
  - Remoção controlada dos componentes antigos após comprovação de zero referências via `grep_search`.
  - Faxina de classes CSS redundantes em `src/styles.css`.
  - Rodada completa de testes Playwright e homologação visual comparativa.
