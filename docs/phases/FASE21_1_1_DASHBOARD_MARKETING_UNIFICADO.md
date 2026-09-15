# Fase 21.1.1 — Marketing OS · Dashboard Unificado + Refinamento Tipográfico

## Alterações
- Hub Marketing e Dashboard Marketing passam a abrir a mesma central operacional.
- Menu Marketing exibe somente `Dashboard Marketing` como entrada principal; `marketing-hub` permanece como alias legado para não quebrar links existentes.
- Navegação mobile do Marketing aponta para `marketing-dashboard`.
- Dashboard recebe 6 KPIs compactos: investimento, receita atribuída, ROAS, CPA, vendas/conversões e conversão.
- Tipografia do Dashboard Marketing foi reforçada localmente: títulos, KPIs, labels, botões, tabelas e módulos.
- Cards foram compactados e receberam bordas mais arredondadas.
- Módulos Planejar/Executar/Medir/Fidelizar permanecem na mesma tela; link redundante para outro Dashboard foi removido.
- Nenhuma alteração global em Financeiro, Contabilidade ou Remarketing.

## Regras para Gemini / VS Code
1. Aplicar os arquivos exatamente como entregues.
2. NÃO refatorar App.tsx globalmente.
3. NÃO remover rotas existentes; `marketing-hub` é alias de compatibilidade.
4. NÃO alterar Financeiro, Contabilidade ou Remarketing.
5. NÃO transformar valores de demonstração em KPIs hardcoded. O Dashboard continua consumindo as APIs existentes.
6. NÃO alterar estilos globais de tipografia; o refinamento está escopado em `.marketing-os-page`.

## Validação recomendada
```bash
npm install
npm run typecheck
npm run build
```
