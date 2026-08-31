# CORREÇÃO APLICADA DIRETAMENTE NO PROJETO ATUAL

Não é um patch para o Gemini interpretar. Este ZIP já contém os arquivos alterados.

## Correções aplicadas
- `ModuleSidebar.tsx`: Financeiro Advanced adicionado ao bloco Advanced & Taxas.
- `AdvancedTaxesRouter.tsx`: rotas novas + aliases legados + conciliação.
- `SplitScreen.tsx`: ligado ao `FinanceSettlementHubPage` operacional.
- `BankAccountsScreen.tsx`: ligado à tela completa de Contas Bancárias existente.
- `App.tsx`: aliases do menu legado também entram no roteador Advanced.
- `layout/Sidebar.tsx`: menu legado recebeu as entradas ausentes.

## Telas que passam a ter destino
Financeiro Advanced, Spread, Split, Contas Bancárias, Gateways, Métodos,
Operadoras/Adquirentes, Inteligência, Estornos e Conciliação.

## Uso no VS Code
Abra este projeto como a nova base. Não peça ao Gemini para recriar as telas.
Se usar Gemini, peça somente para preservar estes arquivos e corrigir erros pontuais.

## Validação
O projeto enviado não contém `tsconfig.app.json`, embora o `package.json` execute `tsc -b`.
Por isso o typecheck completo não pôde ser concluído nesta cópia.
