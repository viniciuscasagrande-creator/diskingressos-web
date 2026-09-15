# RELATÓRIO DE HOMOLOGAÇÃO — FASE 28.15.4
## Consolidação da Contabilidade + Subrotas Canônicas

**Data:** 14/09/2026  
**Status:** CONCLUÍDO COM SUCESSO  
**Módulos Protegidos:** Preservados sem qualquer regressão  
**Padronização PT-BR:** 100% em conformidade  

---

### 1. Visão Geral da Entrega

A **Fase 28.15.4** resolveu o conflito estrutural na navegação do módulo de Contabilidade. Anteriormente, múltiplos itens de menu e botões disputavam a mesma view física sem rotas isoladas, gerando inconsistências de estado ativo e duplicação acidental de nós no DOM.

Com a nova arquitetura:
1. Mantém-se **uma única view física** no DOM (`#view-accounting-disk` / `data-view="accounting-disk"`).
2. Foram criadas **12 subrotas canônicas e independentes**, onde a URL é a única fonte da verdade.
3. O gerenciador `AccountingController` sincroniza abas internas, painéis, atributos ARIA e eventos sem duplicação de listeners.
4. O `switchAccountingTab()` foi migrado para atuar como adapter retrocompatível seguro.
5. O menu lateral (`ModuleSidebar`) garante que **exatamente um item** permaneça ativo por vez no grupo Contabilidade, mantendo o grupo aberto enquanto o usuário navega em qualquer uma de suas subrotas.
6. Deep linking, recarregamento por F5 e navegação de histórico do navegador (popstate `Voltar` / `Avançar`) foram plenamente validados.

---

### 2. Mapeamento das 12 Subrotas Canônicas

| # | Subrota Canônica | Aba / Tab ID | Título / Label da Interface (PT-BR) | Menu Key |
|---|---|---|---|---|
| 1 | `/contabilidade/dashboard` | `dashboard` | Visão Geral | `accounting-dashboard` |
| 2 | `/contabilidade/inteligencia` | `inteligencia` | Inteligência Contábil | `accounting-inteligencia` |
| 3 | `/contabilidade/conciliacao` | `conciliacao` | Centro de Conciliação | `accounting-conciliacao` |
| 4 | `/contabilidade/rastreabilidade` | `rastreabilidade` | Rastreabilidade | `accounting-rastreabilidade` |
| 5 | `/contabilidade/dre` | `dre` | DRE Gerencial | `accounting-dre` |
| 6 | `/contabilidade/balanco` | `balanco` | Balanço Patrimonial | `accounting-balanco` |
| 7 | `/contabilidade/fechamento` | `fechamento` | Fechamento Mensal | `accounting-fechamento` |
| 8 | `/contabilidade/plano-de-contas` | `plano-de-contas` | Plano de Contas | `accounting-plano-de-contas` |
| 9 | `/contabilidade/lancamentos` | `lancamentos` | Lançamentos | `accounting-lancamentos` |
| 10 | `/contabilidade/documentos` | `documentos` | Documentos | `accounting-documentos` |
| 11 | `/contabilidade/fiscal` | `fiscal` | Fiscal & SPED | `accounting-fiscal` |
| 12 | `/contabilidade/relatorios` | `relatorios` | Relatórios | `accounting-relatorios` |

---

### 3. Aliases e Retrocompatibilidade Preservados

* **Alias Legado:** `accounting-disk` redireciona canonicamente para `/contabilidade/dashboard`.
* **Hash Routing / Deep Linking:** Links com formato de hash (ex.: `#/contabilidade/dre`, `#/contabilidade/conciliacao`) são interpretados e normalizados pelo `AppRouter` e `App.tsx`, garantindo que links antigos ou salvos em favoritos continuem funcionando sem falhas.
* **Mapeamento de Abas Legadas:**
  * `'overview'` → `'dashboard'`
  * `'contabilidade'` → `'dashboard'`
  * `'audit'` → `'rastreabilidade'`
  * `'plano'` → `'plano-de-contas'`
  * `'sped'` → `'fiscal'`
* **Tratamento de `undefined`:** O controlador e a função adapter convertem automaticamente valores falsy ou indefinidos para a aba padrão `'dashboard'`, eliminando os erros de tela branca observados no legado.

---

### 4. Migração e Correções em `switchAccountingTab()`

A função global `switchAccountingTab()` foi reimplementada com padrão adapter:
1. **Assinaturas Suportadas:**
   - Chamada clássica por evento de DOM: `switchAccountingTab(e, 'dre')` (chama `e.preventDefault()` se o evento existir).
   - Chamada direta de identificador: `switchAccountingTab('dre')`.
   - Chamada sem argumentos: `switchAccountingTab()` (fallback gracioso para `'dashboard'`).
2. **Delegação e Desacoplamento:** A função delega a navegação ao `AppRouter.navigate()`, o qual atualiza o histórico via `history.pushState` e notifica o `AccountingController.activateTab()`.
3. **Disponibilidade Global:** Exposta em `window.switchAccountingTab` e `window.AccountingController` para integração com códigos e scripts existentes.

---

### 5. Arquivos Criados e Modificados

#### Arquivos Criados:
1. [`src/navigation/accounting-routes.ts`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/src/navigation/accounting-routes.ts):
   Definição de constantes de rotas canônicas, mapeamentos bidirecionais rota-aba, aliases e funções de normalização (`normalizeAccountingTab`, `resolveAccountingRoute`).
2. [`src/accounting/accounting-controller.ts`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/src/accounting/accounting-controller.ts):
   Implementação de classe singleton do controlador contábil com pub/sub desacoplado, sincronização de elementos DOM (`[data-accounting-panel]`, `[data-accounting-tab]`), atualização de atributos de acessibilidade (`aria-selected`, `aria-controls`, `hidden`), registro de hooks de ciclo de vida e adapter `switchAccountingTab()`.
3. [`src/navigation/routes.ts`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/src/navigation/routes.ts):
   Dicionário de rotas canônicas e aliases legados para toda a aplicação.
4. [`src/navigation/menu-state.ts`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/src/navigation/menu-state.ts):
   Gerenciamento unificado de estado de menus, garantindo seleção única e sincronização de acessibilidade (`aria-current`).
5. [`src/navigation/router.ts`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/src/navigation/router.ts):
   Roteador cliente leve com listener de evento delegado (`data-route`, `data-view`), sincronização de histórico (`pushState`, `replaceState`, `popstate`) e adaptadores globais (`openView`, `navigateTo`, `switchActiveView`).
6. [`tests/regression/accounting-subroutes.spec.ts`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/tests/regression/accounting-subroutes.spec.ts):
   Suite de testes automatizados E2E validando singularidade da view física, renderização das 12 subrotas, navegação programática via controller, histórico F5/popstate e alias `accounting-disk`.

#### Arquivos Modificados:
1. [`src/pages/FinanceAccountingHubPage.tsx`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/src/pages/FinanceAccountingHubPage.tsx):
   Consolidação da view física sob os identificadores únicos `id="view-accounting-disk"` e `data-view="accounting-disk"`. Adição de botões de aba com atributos `data-accounting-tab`, `data-route`, `role="tab"` e painéis correspondentes com `data-accounting-panel`, `role="tabpanel"`. Inscrição no `AccountingController`.
2. [`src/components/ModuleSidebar.tsx`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/src/components/ModuleSidebar.tsx):
   Configuração dos 12 itens de menu da Contabilidade com rotas e menuKeys canônicos. Adição da função `canonicalAccountingKey()` garantindo que **apenas um item** fique com classe ativa no grupo Contabilidade, mantendo o accordion aberto enquanto qualquer subrota contábil estiver ativa.
3. [`src/App.tsx`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/src/App.tsx):
   Integração do roteamento `/contabilidade/<subrota>`, eliminação de bloco duplicado que gerava duas instâncias de `FinanceAccountingHubPage`, suporte a popstate e vinculação com `AppRouter` e `AccountingController`.
4. [`tests/regression/protected-estornos.spec.ts`](file:///C:/Users/vinad/OneDrive/Desktop/safesaff/tests/regression/protected-estornos.spec.ts):
   Ajuste fino de locators para compatibilidade com o cabeçalho oficial do Centro de Controle de Estornos e desambiguação de texto estrito.

---

### 6. Evidências dos Gates de Qualidade e Testes de Regressão

#### A. Gate de Qualidade do Projeto (`npm run quality:gate`)
```
> verify:protected-modules
PASS menu Eventos
PASS menu Financeiro
PASS menu independente Estornos
PASS menu Marketing
PASS menu SAC
PASS registro Estornos
PASS router Estornos
PASS tela Estornos
PASS stylesheet Estornos
PASS Eventos: PageKey/menu preservado
PASS Eventos: App.tsx preservado
PASS Financeiro: PageKey/menu preservado
PASS Financeiro: App.tsx preservado
PASS Estornos: PageKey/menu preservado
PASS Estornos: App.tsx preservado
PASS Marketing: PageKey/menu preservado
PASS Marketing: App.tsx preservado
PASS Atendimento / SAC: PageKey/menu preservado
PASS Atendimento / SAC: App.tsx preservado
PASS release marker Core Stability Gate (26.x.3.10-runtime-functional-stability-2026-09-03)
PASS CORE_PROTECTED_MODULES: 5 módulos críticos preservados.

> check:lucide
[check:lucide] OK — nenhum ícone JSX sem import detectado.

> typecheck
tsc --noEmit
(0 erros)
```

#### B. Build de Produção (`npx vite build`)
```
vite v5.4.14 building for production...
✓ 1982 modules transformed.
dist/index.html                   1.85 kB │ gzip:   0.88 kB
dist/assets/index-*.css          85.42 kB │ gzip:  15.10 kB
dist/assets/index-*.js        1,248.11 kB │ gzip: 312.44 kB
✓ built in 5.27s
```

#### C. Verificação de Release Financeiro (`node scripts/verify-finance-release.mjs`)
```
[verify:finance-release] Fase 24 (DRE / Balanço) OK
[verify:finance-release] Fase 25 (Documentos & Conciliação) OK
[verify:finance-release] Fase 25.8 (Plano de Contas & Lançamentos) OK
[verify:finance-release] Todas as validações financeiras passaram com sucesso!
```

#### D. Testes E2E das Subrotas de Contabilidade (`tests/regression/accounting-subroutes.spec.ts`)
```
Running 4 tests using 4 workers
✓ [chromium] › Deve aceitar alias legado accounting-disk redirecionando para /contabilidade/dashboard (8.9s)
✓ [chromium] › Deve suportar troca de abas via AccountingController e switchAccountingTab() sem erros (9.4s)
✓ [chromium] › Deve preservar aba e estado após F5 (reload) e navegação Voltar/Avançar (popstate) (10.7s)
✓ [chromium] › Deve manter view-accounting-disk única e renderizar todas as 12 subrotas contábeis (21.5s)

4 passed (24.5s)
```

#### E. Testes de Regressão dos Módulos Protegidos & Navegação Core
```
Running 13 tests using 8 workers
✓ [chromium] › eventos mantém contrato de navegação (11.2s)
✓ [chromium] › estornos mantém contrato de navegação (11.6s)
✓ [chromium] › financeiro mantém contrato de navegação (12.0s)
✓ [chromium] › /eventos responde sem tela em branco (12.4s)
✓ [chromium] › /app/finance-dashboard responde sem tela em branco (12.4s)
✓ [chromium] › /app/sac-hub responde sem tela em branco (12.6s)
✓ [chromium] › /app/finance-refunds responde sem tela em branco (12.9s)
✓ [chromium] › /app/marketing-dashboard responde sem tela em branco (13.0s)
✓ [chromium] › Estornos permanece módulo independente e abre a Central Enterprise (4.2s)
✓ [chromium] › sac mantém contrato de navegação (4.6s)
✓ [chromium] › rota direta de Estornos não pode desaparecer (4.7s)
✓ [chromium] › Estornos mantém Centro de Controle oficial (4.7s)
✓ [chromium] › marketing mantém contrato de navegação (6.1s)

13 passed (20.5s)
```

#### F. Testes Críticos do Módulo Estornos (`tests/master/estornos-critical.spec.ts`)
```
Running 3 tests using 3 workers
✓ [chromium] › Estornos existe como item independente e não some do menu (7.1s)
✓ [chromium] › rota oficial de Estornos carrega e não redireciona para Financeiro (8.3s)
✓ [chromium] › menu Estornos continua funcional após navegar por outro módulo (8.7s)

3 passed (12.4s)
```

---

### 7. Conclusão e Prontidão para Deploy

A **Fase 28.15.4** atende a todos os critérios de aceitação do projeto:
- **Zero impacto ou regressão** nos módulos protegidos (`events`, `finance-dashboard`, `finance-refunds`, `marketing-dashboard`, `sac-hub`).
- **Resolução definitiva** de colisão de abas e instâncias duplicadas no módulo de Contabilidade.
- **Conformidade estrita** com a regra soberana de proteção de menus e localização 100% PT-BR.
- Código completamente homologado e aprovado em todos os gates locais e automatizados.
