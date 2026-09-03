# REGRAS OBRIGATÓRIAS DE PROJETO (GEMINI / ANTIGRAVITY / AGENTES)

## REGRA SUPREMA: NUNCA MEXER EM MENUS SEM PERGUNTAR ANTES

> **ATENÇÃO MÁXIMA PARA QUALQUER IA OU AGENTE QUE ATUAR NESTE PROJETO:**
> 
> É TERMINANTEMENTE PROIBIDO alterar, adicionar, remover, reorganizar, agrupar, ocultar,
> renomear, mover para submenus ou refatorar qualquer item do **MENU**, da **SIDEBAR**
> (`ModuleSidebar.tsx`, `EventContextSidebar.tsx`, `Sidebar.tsx`), das **ROTAS** (`App.tsx`)
> ou das **PageKeys** **SEM PERGUNTAR PRIMEIRO E OBTER APROVAÇÃO EXPLÍCITA DO USUÁRIO**.
>
> Violações passadas causaram regressões graves e perda excessiva de tempo da equipe.
> Se você pretende fazer qualquer alteração estrutural de menu ou navegação, você DEVE
> consultar o usuário previamente antes de editar qualquer arquivo.

---

## CONTRATO DOS MÓDULOS PROTEGIDOS (CORE_PROTECTED_MODULES)

Os módulos abaixo foram homologados e são **PROTEGIDOS POR GATE DE CI/BUILD**:
1. **Eventos** (`/app/events` / `/eventos` · PageKey: `events`)
2. **Financeiro** (`/app/finance-dashboard` · PageKey: `finance-dashboard`)
3. **Estornos** (`/app/finance-refunds` · PageKey: `finance-refunds`)
   - **NÃO É SUBMENU DO FINANCEIRO**. Permanece independente como módulo no menu.
   - A tela oficial é o **Centro de Controle de Estornos** (`FinanceDisputesHubPage.tsx`), matching fiel com `DiskIngressos_Centro_Controle_Estornos.html`.
   - **NUNCA DELETAR OU SUBSTITUIR ESSA TELA.**
4. **Marketing** (`/app/marketing-dashboard` · PageKey: `marketing-dashboard`)
5. **Atendimento / SAC** (`/app/sac-hub` · PageKey: `sac-hub`)

---

## GATES DE VERIFICAÇÃO OBRIGATÓRIOS

Qualquer alteração feita no projeto deve passar nos três níveis de proteção:
1. `npm run verify:protected-modules` (trava o build caso arquivos ou rotas protegidas sejam apagados)
2. `npm run quality:gate` (executa validação de módulos protegidos, checagem de ícones lucide e typecheck TypeScript)
3. `npm run homologate:vercel` (executa o gate de qualidade + deploy guard HTTP + testes Playwright pós-Vercel)
