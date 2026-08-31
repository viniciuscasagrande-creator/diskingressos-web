# Fase 21.1.12 — Correção Definitiva da API na Vercel

## Causa raiz corrigida

O projeto publicava apenas o frontend Vite. O `server/src/index.ts` iniciava um Express com `app.listen(...:3333)`, comportamento válido no desenvolvimento local, mas que não cria uma API de produção na Vercel. Além disso, o fallback SPA enviava todas as rotas para `index.html`, podendo capturar `/api/*`.

## Arquitetura após a correção

- Frontend: React/Vite na Vercel.
- API: funções Serverless na mesma Vercel através de `api/[...path].ts`.
- Express: configurado em `server/src/app.ts` e exportado sem `listen`.
- Local: `server/src/index.ts` continua iniciando a API na porta 3333.
- Banco: PostgreSQL externo acessado pelo Prisma.
- Frontend: `VITE_API_URL=/api`.

## Mudanças realizadas

1. `server/src/app.ts` passou a concentrar o Express e todas as rotas existentes.
2. `server/src/index.ts` ficou apenas como bootstrap do servidor local.
3. `api/[...path].ts` publica todas as rotas `/api/*` como Serverless Function.
4. `api/index.ts` publica `/api`.
5. `/api/health` agora testa conexão real com o PostgreSQL e retorna HTTP 503 quando o banco não estiver disponível.
6. `vercel.json` preserva `/api/*` e aplica fallback SPA somente às rotas que não começam por `/api`.
7. O build da Vercel agora executa `prisma generate` usando `schema.postgresql.prisma` antes do Vite.
8. `schema.postgresql.prisma` foi sincronizado com o schema atual completo. O schema antigo estava defasado e possuía menos models que `schema.prisma`.
9. `.env.vercel.example` documenta variáveis públicas e privadas corretas.

## Variáveis obrigatórias na Vercel

Em **Project → Settings → Environment Variables**, configurar para Production (e Preview se desejar):

```env
VITE_API_URL=/api
DATABASE_URL=postgresql://...
JWT_SECRET=...
TRACKING_TOKEN_SECRET=...
FRONTEND_URL=https://safesaff.vercel.app
PUBLIC_APP_URL=https://safesaff.vercel.app
NODE_ENV=production
```

`DATABASE_URL`, `JWT_SECRET` e `TRACKING_TOKEN_SECRET` são segredos do servidor. Nunca usar `VITE_` nesses nomes.

## Preparação do banco

Esta fase NÃO executa `db push` automaticamente durante o build para evitar alterações destrutivas ou inesperadas no banco a cada deploy.

Antes do primeiro uso da API em um PostgreSQL novo, executar em um terminal com a `DATABASE_URL` desse banco:

```bash
npm install
npm run db:deploy:vercel
```

Não executar `npm run db:seed` em produção sem revisar o seed, pois seeds antigos do projeto podem limpar dados.

## Teste de aceite

Após salvar as variáveis e fazer um novo Redeploy:

1. Abrir `https://safesaff.vercel.app/api/health`.
2. Esperado: JSON com `ok: true`, `phase: 21.1.12`, `runtime: vercel` e `databaseConnected: true`.
3. Testar login.
4. Confirmar `/api/auth/me` com token válido.
5. Confirmar produtor e `/api/events`.
6. Confirmar Marketing e demais módulos.

Se `/api/health` responder `ok:false`, a própria resposta separará falha de publicação da API de falha de conexão com o banco.

## Regra de preservação

Nenhum layout, rota funcional de módulo, dashboard ou regra de negócio existente foi refeito. A mudança foi estrutural e incremental na camada de publicação da API.
