# Fase 21.1.9 — Deploy Cloud Operacional

Arquitetura adotada: Vercel (Vite/React) → Railway (Node/Express) → Railway PostgreSQL.

## Railway
1. Crie um projeto e adicione PostgreSQL.
2. Adicione o repositório do DiskIngressos como serviço da API.
3. Variáveis: `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `JWT_SECRET`, `TRACKING_TOKEN_SECRET`, `FRONTEND_URL=https://safesaff.vercel.app`, `PUBLIC_APP_URL=https://safesaff.vercel.app`, `NODE_ENV=production`.
4. O `railway.json` inicia a API com `npm run railway:start` e valida `/api/health`.
5. Antes do primeiro uso do banco execute no serviço: `npm run cloud:db:deploy`.
6. Não execute `db:seed:marketing-test` em produção.
7. Gere um domínio público HTTPS para a API.

## Vercel
Em Settings → Environment Variables, Production:
`VITE_API_URL=https://SEU-DOMINIO-RAILWAY/api`
Depois faça novo deploy; alteração de variável não muda deployments antigos.

## Validação
1. `https://SEU-DOMINIO-RAILWAY/api/health` deve retornar `ok:true`, `phase:21.1.9`, `database:postgresql`.
2. Abra a Vercel, faça logout/login.
3. Teste Eventos → Marketing → Dashboard → evento → KPIs → Campanhas → Voltar.
4. Confirme que não há erro CORS no navegador.

## Segurança
`DATABASE_URL`, `JWT_SECRET` e `TRACKING_TOKEN_SECRET` ficam somente no Railway. A Vercel recebe apenas `VITE_API_URL`.
