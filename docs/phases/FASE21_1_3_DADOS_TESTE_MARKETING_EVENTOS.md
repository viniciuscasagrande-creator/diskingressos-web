# Fase 21.1.3 — Dados de teste do Dashboard Marketing

## Correções
- O carregamento global de eventos agora substitui corretamente a lista local mesmo quando a API retorna lista vazia, evitando IDs seed antigos/stale.
- O Marketing volta automaticamente para `Todos os eventos` se o evento selecionado deixar de pertencer ao escopo atual.
- O seed cria campanhas Meta, Google e WhatsApp para todos os eventos da produtora DiskIngressos, permitindo testar troca de evento, KPIs, ROAS, CPA, conversão, canais e ranking.

## Aplicação
1. `npm install`
2. `npm run db:generate`
3. Execute o seed do projeto (`npm run db:seed` se disponível, ou `npx prisma db seed`).
4. Reinicie/publicar a API.
5. Atualize o frontend e teste Marketing > Dashboard Marketing trocando Evento.

Os valores são exclusivamente massa de teste/seed e não são hardcoded no componente do Dashboard. Em produção, o Dashboard continua lendo o banco pela API.
