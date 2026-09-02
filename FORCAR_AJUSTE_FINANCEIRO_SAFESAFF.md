# FORÇAR AJUSTE — FINANCEIRO SAFESAFF

## OBJETIVO
Aplicar obrigatoriamente as Fases 24.1 a 24.4 no projeto SafeSaff, SEM redesenhar o Dashboard Financeiro.

## REGRA DE BLOQUEIO
O arquivo/tela do Dashboard Financeiro aprovado NÃO pode ser recriado, substituído ou redesenhado.

É proibido:
- alterar cards, KPIs, gráficos, tabelas, cores, grid ou layout do Dashboard Financeiro;
- criar outro Dashboard Financeiro;
- alterar arquivos legados sem confirmar que são realmente importados;
- encerrar a tarefa sem executar build e validação.

## PROCEDIMENTO OBRIGATÓRIO

### 1. Descobrir o componente REAL da sidebar
Pesquisar no projeto inteiro por:
- `ModuleSidebar`
- `Sidebar`
- `finance-dashboard`
- `Saldos, Extrato`
- `Antecipação & Spread`
- `Split & Coprodução`
- `Meios de Pagamento`
- `Borderô`

Antes de editar, informar qual arquivo é realmente importado por `App.tsx`/layout principal.

### 2. Alterar SOMENTE a sidebar efetivamente usada
O grupo FINANCEIRO deve ficar exatamente assim:

1. Dashboard Financeiro
2. Antecipações
3. Divisão de Receitas
4. Pagamentos & Taxas
5. Relatórios Financeiros

Preservar as rotas existentes, salvo se estiverem quebradas.

### 3. Confirmar a rota principal
`/app/finance-dashboard` deve abrir o Dashboard Financeiro atual/aprovado.

Não criar uma segunda página.

### 4. Confirmar HUB interno
No Dashboard Financeiro deve existir a navegação interna:

- Visão Geral
- Saldo
- Extrato
- Recebíveis
- Repasses
- Fluxo de Caixa
- Conciliação
- Relatórios

Sem mover essas funções para a sidebar principal.

### 5. Confirmar drill-down dos KPIs
Os cards devem navegar sem alteração visual:

- Saldo disponível -> Saldo
- Saldo futuro -> Recebíveis
- A pagar -> Contas a Pagar
- Repasses pendentes -> Repasses
- Margem/Spread -> Spread/Antecipações
- Divergências -> Conciliação

### 6. LIMPAR BUILD ANTIGO
No Windows/PowerShell:

```powershell
if (Test-Path dist) { Remove-Item dist -Recurse -Force }
if (Test-Path node_modules\.vite) { Remove-Item node_modules\.vite -Recurse -Force }
npm install
npm run build
```

Se existir script específico da Vercel:

```powershell
npm run build:vercel
```

### 7. VALIDAÇÃO OBRIGATÓRIA ANTES DE CONCLUIR
Executar busca no código-fonte:

```powershell
Get-ChildItem -Recurse -File src | Select-String "Dashboard Financeiro"
Get-ChildItem -Recurse -File src | Select-String "Divisão de Receitas"
Get-ChildItem -Recurse -File src | Select-String "Pagamentos & Taxas"
Get-ChildItem -Recurse -File src | Select-String "Relatórios Financeiros"
Get-ChildItem -Recurse -File src | Select-String "Visão Geral"
Get-ChildItem -Recurse -File src | Select-String "Fluxo de Caixa"
Get-ChildItem -Recurse -File src | Select-String "Conciliação"
```

Depois validar o build:

```powershell
Get-ChildItem -Recurse -File dist | Select-String "Dashboard Financeiro"
Get-ChildItem -Recurse -File dist | Select-String "Divisão de Receitas"
Get-ChildItem -Recurse -File dist | Select-String "Pagamentos & Taxas"
Get-ChildItem -Recurse -File dist | Select-String "Relatórios Financeiros"
```

Se qualquer um desses nomes não aparecer no `dist`, A TAREFA NÃO ESTÁ CONCLUÍDA.

### 8. NÃO FINALIZAR COM TEXTO GENÉRICO
Só responder "concluído" depois de mostrar:
- arquivo(s) alterado(s);
- trecho final do menu;
- rota confirmada;
- resultado do build;
- resultado das buscas no `dist`.

## PROMPT PARA COLAR NO GEMINI / ANTIGRAVITY

> EXECUTE, NÃO APENAS ANALISE. Você deve modificar o projeto agora.
>
> Não crie arquivos de exemplo e não entregue somente documentação.
> Localize o componente realmente usado pela aplicação e edite esse arquivo.
> Não altere visualmente o Dashboard Financeiro aprovado.
>
> O menu FINANCEIRO deve ficar EXATAMENTE:
> - Dashboard Financeiro
> - Antecipações
> - Divisão de Receitas
> - Pagamentos & Taxas
> - Relatórios Financeiros
>
> A rota `/app/finance-dashboard` deve continuar apontando para o Dashboard Financeiro atual.
>
> Dentro do Dashboard mantenha/crie apenas a navegação interna:
> Visão Geral | Saldo | Extrato | Recebíveis | Repasses | Fluxo de Caixa | Conciliação | Relatórios.
>
> Antes de editar, pesquise o projeto inteiro para descobrir qual Sidebar está efetivamente importada pelo App/layout.
> Não altere um componente legado que não esteja em uso.
>
> Depois das alterações:
> 1. apague `dist`;
> 2. rode `npm install`;
> 3. rode `npm run build` ou `npm run build:vercel`;
> 4. pesquise dentro do `dist` pelos cinco nomes do menu;
> 5. se não estiverem no `dist`, continue corrigindo;
> 6. não encerre a tarefa até o build conter as alterações.
>
> PROIBIDO responder que concluiu sem comprovar o build.
> PROIBIDO redesenhar o Dashboard Financeiro.
> PROIBIDO criar uma nova página para substituir a atual.
