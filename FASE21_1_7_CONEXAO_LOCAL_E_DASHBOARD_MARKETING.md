# Fase 21.1.7 — Conexão local efetiva e Dashboard Marketing

## Causa encontrada
O projeto ainda podia exibir os eventos estáticos de `src/data/events.ts` quando a API/banco falhava. Isso criava um evento visualmente selecionável sem garantia de existir no PostgreSQL. Além disso, o frontend local usava URL absoluta da API, enquanto o Vite já possui proxy `/api`, e sessões antigas de outro backend podem gerar 401 no ambiente local.

## Correções
- Eventos passam a vir da API/banco; não há fallback silencioso para eventos estáticos no estado principal.
- API frontend usa `/api` por padrão e o Vite encaminha para `localhost:3333`.
- `.env.local.postgres.example` usa `VITE_API_URL=/api` e porta frontend 3000.
- `npm run local:dev` sobe Docker, ativa PostgreSQL, gera Prisma, aplica schema, executa seeds, verifica contagens e inicia WEB+API.
- `npm run db:local:check` comprova quantos produtores/eventos/campanhas existem no banco e lista campanhas por evento.
- `/api/health` informa se a API foi iniciada com PostgreSQL.

## Uso
```bash
npm install
npm run local:dev
```
Abra **http://localhost:3000**. Não use a URL da Vercel para testar o PostgreSQL local. Faça logout/login novamente porque o token da API publicada não é válido na API local.

Login de teste do seed:
- `marketing@diskingressos.com.br` / `Marketing@123`
- ou `admin@diskingressos.com.br` / `Admin@123`

Antes de olhar o Dashboard, confirme no terminal que `db:local:check` mostra `events > 0`, `campaigns > 0` e campanhas associadas aos eventos.
