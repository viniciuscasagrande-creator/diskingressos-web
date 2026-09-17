# Correção real de tema — Financeiro + Estornos

Data: 17/09/2026

## O que foi corrigido
- Financeiro passou a consumir os tokens globais `--disk-*` para superfícies, bordas, textos, campos, tabelas, hover e estados de pipeline.
- Hardcodes neutros inline do `FinanceDashboardPage.tsx` foram substituídos por tokens semânticos.
- Estornos passou a mapear o namespace legado `--est-*` para o Design System Disk, preservando classes, `data-testid`, rotas e regras de negócio.
- O bloco inline claro de Estornos foi convertido para `--disk-bg-muted`.
- Nenhuma regra de saldo, repasse, transação, exportação, estorno, aprovação, API ou permissão foi alterada.

## Arquivos alterados
- `src/styles.css`
- `src/pages/FinanceDashboardPage.tsx`
- `src/pages/finance/finance-disputes-control-center.css`
- `src/pages/finance/FinanceDisputesHubPage.tsx`

## Validação neste ambiente
O backup não trouxe `node_modules`. A instalação das dependências foi iniciada, mas o ambiente de execução encerrou `npm install` por timeout antes de completar a árvore de dependências. Por isso, não há declaração falsa de build verde neste pacote. Execute no VS Code:

```bash
npm ci
npm run typecheck
npm run quality:gate
npm run build
```

Depois publique exatamente este projeto no Vercel e valide Claro/Escuro na mesma rota e contexto.
