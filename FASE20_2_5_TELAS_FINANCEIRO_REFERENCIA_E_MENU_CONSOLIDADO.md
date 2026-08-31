# Fase 20.2.5 — Telas Financeiras da Referência + Menu Consolidado

## Objetivo
Trazer para o projeto a estrutura funcional das telas do Financeiro de referência, preservando as APIs e módulos já existentes, e consolidar os menus conforme decisão de arquitetura.

## Ajustes de menu
- Removida a seção separada **Contabilidade Oficial & SPED**. Seus itens passam para **Contabilidade**.
- Removido o acesso duplicado de **Marketing** e **Remarketing** no MENU PRINCIPAL.
- A seção **Marketing & Growth** passa a se chamar apenas **Marketing**.
- A seção **Remarketing & Recuperação** passa a se chamar apenas **Remarketing**.
- Nenhuma função é apagada: apenas consolidada no hub correto.

## Telas financeiras implantadas/roteadas
1. Dashboard Financeiro
2. Saldo
3. Solicitação de Repasse
4. Antecipações
5. Extrato Financeiro
6. Despesas
7. Contas Bancárias
8. Financeiro Advanced
9. Conciliação Bancária
10. Financeiro Spread
11. Simulador de Spread
12. Split Financeiro
13. Inteligência Financeira
14. Operadoras / Adquirentes
15. Gateways de Pagamento
16. Métodos de Pagamento
17. Pagamentos Customizados
18. Borderô
19. Pontos de Venda (PDV)
20. Recebíveis
21. Contas a Pagar
22. Fluxo de Caixa
23. Devoluções / Estornos
24. Relatórios Financeiros

## Mudança importante no Spread
`finance-spread` e `finance-spread-simulator` agora são rotas diferentes. A segunda abre diretamente a aba **Simulador** da tela operacional `FinanceSpread360Page`, evitando cair no simulador legado.

## Fonte de verdade funcional
Foi criado `src/data/financeReferenceScreens.ts`, com cada tela, rota, funções esperadas e integrações. Isso ajuda o Gemini/VS Code a aplicar mudanças sem reinventar a arquitetura.

## Regra para Gemini
Aplicar de forma incremental. NÃO refatorar globalmente `App.tsx`, `ModuleSidebar.tsx`, APIs, autenticação ou layout. NÃO remover rotas existentes. Apenas mesclar as alterações deste pacote.

## Validação
Este pacote deve ser validado no ambiente do projeto com `npm install`, `npm run typecheck` e `npm run build`. Não há afirmação de build concluído neste pacote.
