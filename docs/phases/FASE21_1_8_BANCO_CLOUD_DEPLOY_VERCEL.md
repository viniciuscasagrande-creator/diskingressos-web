# Fase 21.1.8 — Banco Cloud + Deploy Produção / Vercel

## Objetivo
Separar definitivamente desenvolvimento e produção:

- Local: Vite -> API localhost:3333 -> PostgreSQL Docker.
- Produção: Vercel -> API Node/Express cloud -> PostgreSQL cloud.

## Correções implementadas
1. Token de autenticação agora é armazenado por origem da API (`disk_token:<api>`). Um token local não é reutilizado pela Vercel e um token de produção não é reutilizado no localhost.
2. Tokens legados `disk_token` são descartados na primeira execução desta fase.
3. Resposta HTTP 401 limpa automaticamente a sessão da API atual.
4. `/api/health` identifica a Fase 21.1.8 e informa se o datasource é PostgreSQL.
5. Arquivos de exemplo separados para Vercel e backend cloud.
6. Comandos `cloud:check`, `cloud:db:prepare` e `cloud:start`.

## Vercel — frontend
Cadastre apenas:

`VITE_API_URL=https://SEU-BACKEND/api`

Não cadastrar DATABASE_URL, JWT_SECRET ou TRACKING_TOKEN_SECRET na aplicação Vite.

Depois faça novo deploy da Vercel. Como VITE_* é incorporado no build, alterar a variável sem rebuild não muda o frontend já publicado.

## Backend cloud
No serviço Node/Express configure as variáveis de `.env.backend.cloud.example`.

Build/prepare do banco:

`npm install`
`npm run cloud:db:prepare`

Start:

`npm run cloud:start`

O serviço precisa expor HTTPS público e aceitar a origem exata configurada em FRONTEND_URL.

## Banco PostgreSQL cloud
Crie um PostgreSQL gerenciado e use sua connection string SSL em DATABASE_URL. Execute `cloud:db:prepare` uma vez para gerar o Prisma e aplicar o schema.

### Seed
Não executar automaticamente `db:seed:marketing-test` em produção. Ele contém massa artificial para desenvolvimento. Se for necessário ambiente de homologação, use banco separado e execute o seed conscientemente nesse banco.

## Validação
1. Abrir `https://SEU-BACKEND/api/health` e conferir `ok:true`, `phase:21.1.8`, `database:postgresql`.
2. Abrir a Vercel, fazer login novamente (tokens antigos são descartados automaticamente nesta fase).
3. Selecionar um evento real e conferir Dashboard Marketing.
4. Conferir Network do navegador: chamadas devem ir para o backend HTTPS cloud, nunca `localhost:3333`.
5. Confirmar que trocar evento altera `eventId` nas chamadas `/api/marketing/...`.

## Regra de segurança
Frontend Vercel nunca recebe credenciais do PostgreSQL. Somente a API conhece DATABASE_URL e segredos JWT/tracking.
