# Fase 20.2.5.1 — Ajuste Pós-Implantação e Operacionalização

## Objetivo
Corrigir o carregamento do Dashboard Financeiro sem alterar o layout aprovado e reduzir a dependência do frontend de múltiplos endpoints independentes.

## Alterações
- Novo endpoint `GET /api/finance/dashboard` em `server/src/routes/financeOperations.ts`.
- O endpoint consolida saldos, obrigações, repasses, gateways, adquirentes, métodos, estornos, spread, conciliação e recebíveis.
- Cada fonte é protegida individualmente: uma tabela/módulo complementar indisponível não derruba todo o Dashboard Financeiro.
- O retorno inclui `health` com fontes disponíveis/indisponíveis.
- `FinanceCommandCenterPage.tsx` passa a consumir uma única API consolidada.
- O botão Atualizar informa sucesso/erro pelo sistema de notificações existente.
- O Dashboard Financeiro deixa de depender diretamente do endpoint do Dashboard Contábil.
- Nenhum layout aprovado, rota existente ou módulo anterior foi removido.

## Validação
- `npm run typecheck`: APROVADO.
- Build Vite no ambiente de geração: não executado por incompatibilidade dos binários opcionais do `node_modules` enviado (dependências instaladas no Windows e execução em Linux). Reinstalar `node_modules` no ambiente alvo resolve essa condição de validação.

## Aplicação Gemini / VS Code
Aplicar somente os arquivos do patch. Não reescrever `App.tsx`, não refatorar o menu e não remover rotas. Reiniciar frontend e backend após aplicar, pois esta fase altera também a API Express.
