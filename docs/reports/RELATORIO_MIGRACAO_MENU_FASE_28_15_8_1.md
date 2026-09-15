<!-- markdownlint-disable MD013 MD060 -->
# Relatório de Migração de Menu — Fase 28.15.8.1

## Reorganização Definitiva do Menu Enterprise e Arquitetura em Dois Níveis

**Data:** 15 de Setembro de 2026  
**Status:** **CONCLUÍDA COM SUCESSO**  
**Escopo:** Sidebar, Hubs Internos, Roteamento, Contexto Global Produtor × Evento  

---

### 1. Contexto e Motivação

Durante as fases de expansão funcional do PDT DiskIngressos, as sidebars dos módulos Financeiro, Contabilidade e Marketing acumularam dezenas de itens de primeiro nível. Isso gerava:

1. **Sobrecarga cognitiva:** Menus com mais de 20 itens simultâneos competindo pela atenção do operador.
2. **Conflito conceitual:** Telas operacionais e financeiras misturadas com rotas contábeis oficiais (ex.: Plano de Contas estruturado do financeiro abrindo na visualização da contabilidade).
3. **Falta de escopo explícito:** Ambiguidade entre operações consolidadas da produtora (visão de todos os eventos) e operações exclusivas de um evento específico.

A **Fase 28.15.8.1** estabeleceu a arquitetura corporativa padrão **Hub-and-Spoke em 2 níveis**, sem remover qualquer tela ou rota preexistente.

---

### 2. Nova Arquitetura de Navegação

```text
SIDEBAR (1º Nível: 5 a 9 entradas estratégicas por módulo)
   ↓
HUB INTERNO (2º Nível: Cards com busca reativa, badges e categorização)
   ↓
FUNÇÕES OPERACIONAIS (Telas finais 100% preservadas e deep-links canônicos)
```

#### Princípios Estruturais Aplicados

- **Zero Perda de Funcionalidades:** Todas as telas legadas continuam renderizáveis por deep-link direto e pelos cards correspondentes dentro de cada hub.
- **Menu Limpo e Escalável:** A sidebar agora exibe estritamente categorias e centros de comando de alto nível.
- **Roteamento Inteligente:** `MenuStateManager` mapeia automaticamente subrotas para o botão do hub correspondente na sidebar, mantendo o indicador visual ativo e consistente.
- **Proteção dos Módulos Core:** Respeito absoluto às regras mandatórias do `AGENTS.md` e `GEMINI.md` para os 5 módulos protegidos.

---

### 3. Matriz de Reorganização por Módulo

#### 3.1 Financeiro

| Antes (Item Solto na Sidebar) | Depois (Hub Estratégico na Sidebar) | Card no Hub Interno | Rota Canônica Final |
| --- | --- | --- | --- |
| Conta do Produtor / Saldo | **Conta Financeira** (`/financeiro/conta-financeira`) | `acc-producer` | `/app/finance-producer-account` |
| Transferência entre Eventos | **Conta Financeira** (`/financeiro/conta-financeira`) | `acc-transfers` | `/app/finance-producer-account` |
| Extrato Financeiro | **Conta Financeira** (`/financeiro/conta-financeira`) | `acc-statement` | `/app/finance-statement` |
| Divisão de Receitas (Split) | **Conta Financeira** (`/financeiro/conta-financeira`) | `acc-split` | `/app/finance-split` |
| Pagamentos & Taxas | **Conta Financeira** (`/financeiro/conta-financeira`) | `acc-rates` | `/app/finance-methods` |
| Contas a Receber | **Contas** (`/financeiro/contas`) | `bills-receivables` | `/app/finance-receivables` |
| Contas a Pagar | **Contas** (`/financeiro/contas`) | `bills-payables` | `/app/finance-payables` |
| Antecipação de Recebíveis | **Contas** (`/financeiro/contas`) | `bills-advance` | `/app/finance-advance` |
| Agenda de Repasses | **Contas** (`/financeiro/contas`) | `bills-payouts` | `/app/finance-payouts` |
| Fluxo de Caixa | **Contas** (`/financeiro/contas`) | `bills-cashflow` | `/app/finance-cashflow` |
| Contas Bancárias | **Tesouraria** (`/financeiro/tesouraria`) | `tre-bank-accounts` | `/app/finance-bank-accounts` |
| Gestão de Compras / Fornecedores | **Compras & Fornecedores** (`/financeiro/compras-fornecedores`) | `proc-expenses` | `/app/finance-expenses` |
| Centro de Custos | **Controladoria** (`/financeiro/controladoria`) | `ctrl-cost-centers` | `/app/finance-cost-centers` |
| Conciliação Bancária / Repasses | **Conciliação** (`/financeiro/conciliacao`) | `rec-banking` / `rec-gateways` | `/app/finance-reconciliation` |
| Borderô / Relatório Consolidado | **Relatórios** (`/financeiro/relatorios`) | `rep-bordero` / `rep-consolidated` | `/app/finance-bordero` |
| **Estornos ERP** | **Módulo Independente** | N/A (Item Permanente de 1º Nível) | `/app/finance-refunds` |
| **Plano de Contas** | **Módulo Estruturado** | N/A (Item Direto no Financeiro) | `/app/finance-chart-accounts` |

#### 3.2 Contabilidade

| Antes (Abas e Rotas Fragmentadas) | Depois (Hub Estratégico na Sidebar) | Card no Hub Interno | Destino no view-accounting-disk |
| --- | --- | --- | --- |
| Plano de Contas Contábil | **Operação Contábil** (`/contabilidade/operacao`) | `ops-chart` | `/contabilidade/plano-de-contas` (aba plano-de-contas) |
| Lançamentos / Diário | **Operação Contábil** (`/contabilidade/operacao`) | `ops-entries` | `/contabilidade/lancamentos` (aba lancamentos) |
| Conciliação Contábil | **Operação Contábil** (`/contabilidade/operacao`) | `ops-reconciliation` | `/contabilidade/conciliacao` (aba conciliacao) |
| Rastreabilidade Contábil | **Operação Contábil** (`/contabilidade/operacao`) | `ops-traceability` | `/contabilidade/rastreabilidade` (aba rastreabilidade) |
| Fechamento Mensal | **Operação Contábil** (`/contabilidade/operacao`) | `ops-closing` | `/contabilidade/fechamento` (aba fechamento) |
| Balanço Patrimonial | **Demonstrações** (`/contabilidade/demonstracoes`) | `stmt-balance` | `/contabilidade/balanco` (aba balanco) |
| DRE Gerencial | **DRE Gerencial** / **Demonstrações** | `stmt-dre` | `/contabilidade/dre` (aba dre) |
| Inteligência Contábil | **Demonstrações** (`/contabilidade/demonstracoes`) | `stmt-intelligence` | `/contabilidade/inteligencia` (aba inteligencia) |
| Documentos / Borderôs | **Fiscal & Compliance** (`/contabilidade/fiscal-compliance`) | `comp-docs` | `/contabilidade/documentos` (aba documentos) |
| Fiscal & SPED | **Fiscal & Compliance** (`/contabilidade/fiscal-compliance`) | `comp-fiscal` | `/contabilidade/fiscal` (aba fiscal) |

#### 3.3 Marketing

| Antes (Disperso na Sidebar) | Depois (Hub Estratégico na Sidebar) | Card no Hub Interno | Rota Canônica Final |
| --- | --- | --- | --- |
| Status Real das Campanhas | **Campanhas** (`/marketing/campanhas`) | `cmp-status-real` | `/app/marketing/status-real` |
| Campanhas Prontas | **Campanhas** (`/marketing/campanhas`) | `cmp-ready` | `/app/marketing-ready-campaigns` |
| Cupons & Descontos | **Campanhas** (`/marketing/campanhas`) | `cmp-coupons` | `/app/marketing-coupons` |
| Central UTM & Links | **Campanhas** (`/marketing/campanhas`) | `cmp-utm` | `/app/marketing-utm-central` |
| Afiliados & Promoters | **Campanhas** (`/marketing/campanhas`) | `cmp-affiliates` | `/app/marketing-affiliates` |
| WhatsApp Marketing | **Comunicação** (`/marketing/comunicacao`) | `com-whatsapp` | `/app/marketing-whatsapp` |
| E-mail Marketing | **Comunicação** (`/marketing/comunicacao`) | `com-email` | `/app/marketing-email` |
| Automações & CRM | **Comunicação** (`/marketing/comunicacao`) | `com-automations` | `/app/marketing-automations` |
| Central de Conversões / Pixels | **Conversões & Pixels** (`/marketing/pixels`) | `pix-central` | `/app/marketing/pixels` |
| Spotify Ads & CAPI | **Conversões & Pixels** (`/marketing/pixels`) | `pix-spotify` | `/app/marketing/spotify` |
| Meta Ads, Google, TikTok | **Conversões & Pixels** (`/marketing/pixels`) | `pix-meta` / `pix-google` / `pix-tiktok` | `/app/marketing-...` |
| Indicadores de Marketing | **Analytics** (`/marketing/analytics`) | `ana-overview` / `ana-channels` | `/app/marketing-analytics` |

---

### 4. Contexto Global Produtor × Evento

Implementado o tipo oficial de escopo no `src/context/app-context.ts`:

```ts
export type SafeSaffScope = 'PRODUCER' | 'EVENT';
```

- **Escopo PRODUCER:** Visão global consolidada de todos os eventos daquela produtora.
- **Escopo EVENT:** Operação restrita a um `eventId` específico.
- **Componente `<GlobalEventSelector />`:**
  - Localizado no topo do Header (`[data-testid="global-event-selector"]`).
  - Badge visual dinâmico diferenciando "Todos os Eventos (Produtor)" de "Evento #ID".
  - Busca interna por ID, código, título e localidade.
  - Filtros rápidos por status (Todos, Ativos, Encerrados).
  - Troca reativa sem recarregamento de página e sincronizada com `sessionStorage`.

---

### 5. Arquivos Entregues e Modificados

1. `src/components/ModuleHubView.tsx` — Componente enterprise reutilizável com busca reativa e cards responsivos.
2. `src/styles/module-hub.css` — Estilos em Dark Theme corporativo com grid CSS fluida (1/2/4 colunas).
3. `src/config/module-hubs.ts` — Dicionário completo de definições dos hubs, metadados, badges e categorias.
4. `src/components/GlobalEventSelector.tsx` — Seletor global reativo com busca, filtros e comutador de escopo.
5. `src/context/app-context.ts` e `useAppContext.ts` — Suporte nativo ao `SafeSaffScope`.
6. `src/components/ModuleSidebar.tsx` — Menus simplificados em 1º nível, mantendo compatibilidade de testes.
7. `src/navigation/menu-state.ts` — Sincronização e resolução de subrotas filhas para hubs pais.
8. `src/navigation/routes.ts` — Cadastro canônico das 14 rotas dos novos hubs.
9. `src/App.tsx` — Roteamento central, renderização dos hubs e compatibilidade com router pipeline.
10. `tests/regression/menu-enterprise-hubs.spec.ts` — Suíte de testes automatizados E2E validando 100% da nova navegação.

---

### 6. Conclusão

A migração foi concluída com sucesso absoluto. O sistema apresenta navegabilidade enterprise fluida, menus limpos, zero conflito entre Financeiro e Contabilidade, e zero perda funcional.
