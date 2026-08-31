# Fase 21.1.2 — Correção das Fontes do Marketing OS

## Correção
- O Dashboard deixou de disparar cinco requisições independentes no carregamento.
- Novo endpoint consolidado: `GET /api/marketing/os/summary`.
- Cada fonte é isolada no backend: campanhas, campanhas prontas, tracking, automações e comunicação.
- `sem dados` agora é diferente de `indisponível`.
- Uma fonte com erro não derruba as demais.
- O frontend exibe aviso apenas para fontes realmente indisponíveis.

## Importante para deploy
Esta correção altera FRONTEND e BACKEND. Publicar apenas a Vercel do frontend não é suficiente: publique também a API Node/Express que atende `VITE_API_URL`.

## Gemini / VS Code
Não refatorar App.tsx, não remover rotas e não alterar Financeiro, Contabilidade ou Remarketing. Aplicar somente os arquivos do patch.
